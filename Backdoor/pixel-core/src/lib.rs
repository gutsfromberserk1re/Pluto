//! Safe, stride-aware reference operations for 8-bit RGBA and BGRA images.
//!
//! Color channels use the full byte range `0..=255`. Operations preserve row
//! padding. Integer output uses round-to-nearest followed by clamping. Pixel
//! format conversion uses runtime-checked SIMD where the host supports it;
//! all other operations use the scalar reference path.

use std::fmt;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum PixelFormat { Rgba8, Bgra8 }

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum PixelError {
    ZeroDimension,
    StrideTooSmall,
    BufferTooShort,
    DimensionMismatch,
    FormatMismatch,
    InvalidParameter,
    SizeOverflow,
}

impl fmt::Display for PixelError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        let message = match self {
            Self::ZeroDimension => "image dimensions must be non-zero",
            Self::StrideTooSmall => "row stride is smaller than the packed RGBA row",
            Self::BufferTooShort => "pixel buffer does not contain all image rows",
            Self::DimensionMismatch => "source and destination dimensions do not match",
            Self::FormatMismatch => "source and destination pixel formats do not match",
            Self::InvalidParameter => "pixel operation parameter is outside its documented range",
            Self::SizeOverflow => "image dimensions overflow addressable buffer size",
        };
        formatter.write_str(message)
    }
}

impl std::error::Error for PixelError {}

#[derive(Clone, Copy, Debug)]
pub struct ImageView<'a> {
    data: &'a [u8],
    width: usize,
    height: usize,
    stride: usize,
    format: PixelFormat,
}

impl<'a> ImageView<'a> {
    pub fn new(data: &'a [u8], width: usize, height: usize, stride: usize, format: PixelFormat) -> Result<Self, PixelError> {
        validate_buffer(data.len(), width, height, stride)?;
        Ok(Self { data, width, height, stride, format })
    }

    pub fn width(&self) -> usize { self.width }
    pub fn height(&self) -> usize { self.height }
    pub fn stride(&self) -> usize { self.stride }
    pub fn format(&self) -> PixelFormat { self.format }
}

#[derive(Debug)]
pub struct ImageViewMut<'a> {
    data: &'a mut [u8],
    width: usize,
    height: usize,
    stride: usize,
    format: PixelFormat,
}

impl<'a> ImageViewMut<'a> {
    pub fn new(data: &'a mut [u8], width: usize, height: usize, stride: usize, format: PixelFormat) -> Result<Self, PixelError> {
        validate_buffer(data.len(), width, height, stride)?;
        Ok(Self { data, width, height, stride, format })
    }

    pub fn width(&self) -> usize { self.width }
    pub fn height(&self) -> usize { self.height }
    pub fn stride(&self) -> usize { self.stride }
    pub fn format(&self) -> PixelFormat { self.format }
    pub fn bytes(&self) -> &[u8] { self.data }
}

fn validate_buffer(length: usize, width: usize, height: usize, stride: usize) -> Result<(), PixelError> {
    if width == 0 || height == 0 { return Err(PixelError::ZeroDimension); }
    let row_bytes = width.checked_mul(4).ok_or(PixelError::SizeOverflow)?;
    if stride < row_bytes { return Err(PixelError::StrideTooSmall); }
    let required = (height - 1).checked_mul(stride).and_then(|last| last.checked_add(row_bytes)).ok_or(PixelError::SizeOverflow)?;
    if length < required { return Err(PixelError::BufferTooShort); }
    Ok(())
}

fn validate_same_size(source: &ImageView<'_>, destination: &ImageViewMut<'_>) -> Result<(), PixelError> {
    if source.width != destination.width || source.height != destination.height { return Err(PixelError::DimensionMismatch); }
    Ok(())
}

fn validate_same_format(source: &ImageView<'_>, destination: &ImageViewMut<'_>) -> Result<(), PixelError> {
    if source.format != destination.format { return Err(PixelError::FormatMismatch); }
    Ok(())
}

fn channel_order(format: PixelFormat) -> (usize, usize, usize) {
    match format { PixelFormat::Rgba8 => (0, 1, 2), PixelFormat::Bgra8 => (2, 1, 0) }
}

fn byte(value: f32) -> u8 { value.round().clamp(0.0, 255.0) as u8 }

/// Adjust brightness in `[-1, 1]` and contrast in `[-1, 1]`.
/// Brightness is offset in normalized channel space; contrast pivots around 0.5.
/// Alpha is copied unchanged.
pub fn brightness_contrast(source: ImageView<'_>, destination: &mut ImageViewMut<'_>, brightness: f32, contrast: f32) -> Result<(), PixelError> {
    validate_same_size(&source, destination)?;
    validate_same_format(&source, destination)?;
    if !brightness.is_finite() || !contrast.is_finite() || !(-1.0..=1.0).contains(&brightness) || !(-1.0..=1.0).contains(&contrast) {
        return Err(PixelError::InvalidParameter);
    }
    let factor = 1.0 + contrast;
    for y in 0..source.height {
        let source_row = y * source.stride;
        let destination_row = y * destination.stride;
        for x in 0..source.width {
            let offset = x * 4;
            for channel in 0..3 {
                let normalized = source.data[source_row + offset + channel] as f32 / 255.0;
                destination.data[destination_row + offset + channel] = byte(((normalized - 0.5) * factor + 0.5 + brightness) * 255.0);
            }
            destination.data[destination_row + offset + 3] = source.data[source_row + offset + 3];
        }
    }
    Ok(())
}

/// Apply Rec. 709 luminance-based saturation in `[0, 2]`; alpha is copied unchanged.
pub fn saturation(source: ImageView<'_>, destination: &mut ImageViewMut<'_>, amount: f32) -> Result<(), PixelError> {
    validate_same_size(&source, destination)?;
    validate_same_format(&source, destination)?;
    if !amount.is_finite() || !(0.0..=2.0).contains(&amount) { return Err(PixelError::InvalidParameter); }
    let (red, green, blue) = channel_order(source.format);
    for y in 0..source.height {
        let source_row = y * source.stride;
        let destination_row = y * destination.stride;
        for x in 0..source.width {
            let offset = x * 4;
            let r = source.data[source_row + offset + red] as f32;
            let g = source.data[source_row + offset + green] as f32;
            let b = source.data[source_row + offset + blue] as f32;
            let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            destination.data[destination_row + offset + red] = byte(luma + (r - luma) * amount);
            destination.data[destination_row + offset + green] = byte(luma + (g - luma) * amount);
            destination.data[destination_row + offset + blue] = byte(luma + (b - luma) * amount);
            destination.data[destination_row + offset + 3] = source.data[source_row + offset + 3];
        }
    }
    Ok(())
}

/// Composite source over destination using straight alpha and opacity in `[0, 1]`.
pub fn alpha_blend(source: ImageView<'_>, destination: &mut ImageViewMut<'_>, opacity: f32) -> Result<(), PixelError> {
    validate_same_size(&source, destination)?;
    validate_same_format(&source, destination)?;
    if !opacity.is_finite() || !(0.0..=1.0).contains(&opacity) { return Err(PixelError::InvalidParameter); }
    for y in 0..source.height {
        let source_row = y * source.stride;
        let destination_row = y * destination.stride;
        for x in 0..source.width {
            let offset = x * 4;
            let source_alpha = source.data[source_row + offset + 3] as f32 / 255.0 * opacity;
            let destination_alpha = destination.data[destination_row + offset + 3] as f32 / 255.0;
            let output_alpha = source_alpha + destination_alpha * (1.0 - source_alpha);
            if output_alpha > 0.0 {
                for channel in 0..3 {
                    let source_value = source.data[source_row + offset + channel] as f32;
                    let destination_value = destination.data[destination_row + offset + channel] as f32;
                    destination.data[destination_row + offset + channel] = byte(
                        (source_value * source_alpha + destination_value * destination_alpha * (1.0 - source_alpha)) / output_alpha,
                    );
                }
            } else {
                destination.data[destination_row + offset..destination_row + offset + 3].fill(0);
            }
            destination.data[destination_row + offset + 3] = byte(output_alpha * 255.0);
        }
    }
    Ok(())
}

/// Convert RGBA to BGRA or BGRA to RGBA using runtime-checked AVX2/SSE2 when available.
/// Row tails and unaligned addresses always use safe scalar handling.
pub fn convert_format(source: ImageView<'_>, destination: &mut ImageViewMut<'_>) -> Result<(), PixelError> {
    validate_same_size(&source, destination)?;
    if source.format == destination.format {
        for y in 0..source.height {
            let source_row = y * source.stride;
            let destination_row = y * destination.stride;
            let row_bytes = source.width * 4;
            destination.data[destination_row..destination_row + row_bytes]
                .copy_from_slice(&source.data[source_row..source_row + row_bytes]);
        }
        return Ok(());
    }
    #[cfg(any(target_arch = "x86", target_arch = "x86_64"))]
    {
        if std::is_x86_feature_detected!("avx2") {
            // SAFETY: AVX2 was checked at runtime and both validated views cover each row.
            unsafe { convert_avx2(&source, destination); }
            return Ok(());
        }
        if std::is_x86_feature_detected!("sse2") {
            // SAFETY: SSE2 was checked at runtime and both validated views cover each row.
            unsafe { convert_sse2(&source, destination); }
            return Ok(());
        }
    }
    convert_format_scalar(source, destination)
}

/// Scalar RGBA/BGRA conversion used as the portable reference and benchmark baseline.
pub fn convert_format_scalar(source: ImageView<'_>, destination: &mut ImageViewMut<'_>) -> Result<(), PixelError> {
    validate_same_size(&source, destination)?;
    if source.format == destination.format {
        for y in 0..source.height {
            let source_row = y * source.stride;
            let destination_row = y * destination.stride;
            let row_bytes = source.width * 4;
            destination.data[destination_row..destination_row + row_bytes]
                .copy_from_slice(&source.data[source_row..source_row + row_bytes]);
        }
    } else {
        convert_scalar(&source, destination);
    }
    Ok(())
}

fn convert_scalar(source: &ImageView<'_>, destination: &mut ImageViewMut<'_>) {
    for y in 0..source.height {
        let source_row = y * source.stride;
        let destination_row = y * destination.stride;
        for x in 0..source.width {
            let offset = x * 4;
            destination.data[destination_row + offset] = source.data[source_row + offset + 2];
            destination.data[destination_row + offset + 1] = source.data[source_row + offset + 1];
            destination.data[destination_row + offset + 2] = source.data[source_row + offset];
            destination.data[destination_row + offset + 3] = source.data[source_row + offset + 3];
        }
    }
}

#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "sse2")]
unsafe fn convert_sse2(source: &ImageView<'_>, destination: &mut ImageViewMut<'_>) {
    use std::arch::x86_64::*;
    unsafe {
        let red = _mm_set1_epi32(0x0000_00ff);
        let blue = _mm_set1_epi32(0x00ff_0000);
        let green_alpha = _mm_set1_epi32(0xff00_ff00u32 as i32);
        for y in 0..source.height {
            let source_row = y * source.stride;
            let destination_row = y * destination.stride;
            let mut x = 0;
            while x + 4 <= source.width {
                let offset = x * 4;
                let input = _mm_loadu_si128(source.data.as_ptr().add(source_row + offset) as *const __m128i);
                let output = _mm_or_si128(
                    _mm_and_si128(input, green_alpha),
                    _mm_or_si128(_mm_slli_epi32::<16>(_mm_and_si128(input, red)), _mm_srli_epi32::<16>(_mm_and_si128(input, blue))),
                );
                _mm_storeu_si128(destination.data.as_mut_ptr().add(destination_row + offset) as *mut __m128i, output);
                x += 4;
            }
            for pixel in x..source.width {
                let offset = pixel * 4;
                destination.data[destination_row + offset] = source.data[source_row + offset + 2];
                destination.data[destination_row + offset + 1] = source.data[source_row + offset + 1];
                destination.data[destination_row + offset + 2] = source.data[source_row + offset];
                destination.data[destination_row + offset + 3] = source.data[source_row + offset + 3];
            }
        }
    }
}

#[cfg(target_arch = "x86")]
#[target_feature(enable = "sse2")]
unsafe fn convert_sse2(source: &ImageView<'_>, destination: &mut ImageViewMut<'_>) {
    use std::arch::x86::*;
    unsafe {
        let red = _mm_set1_epi32(0x0000_00ff);
        let blue = _mm_set1_epi32(0x00ff_0000);
        let green_alpha = _mm_set1_epi32(0xff00_ff00u32 as i32);
        for y in 0..source.height {
            let source_row = y * source.stride;
            let destination_row = y * destination.stride;
            let mut x = 0;
            while x + 4 <= source.width {
                let offset = x * 4;
                let input = _mm_loadu_si128(source.data.as_ptr().add(source_row + offset) as *const __m128i);
                let output = _mm_or_si128(
                    _mm_and_si128(input, green_alpha),
                    _mm_or_si128(_mm_slli_epi32::<16>(_mm_and_si128(input, red)), _mm_srli_epi32::<16>(_mm_and_si128(input, blue))),
                );
                _mm_storeu_si128(destination.data.as_mut_ptr().add(destination_row + offset) as *mut __m128i, output);
                x += 4;
            }
            for pixel in x..source.width {
                let offset = pixel * 4;
                destination.data[destination_row + offset] = source.data[source_row + offset + 2];
                destination.data[destination_row + offset + 1] = source.data[source_row + offset + 1];
                destination.data[destination_row + offset + 2] = source.data[source_row + offset];
                destination.data[destination_row + offset + 3] = source.data[source_row + offset + 3];
            }
        }
    }
}

#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "avx2")]
unsafe fn convert_avx2(source: &ImageView<'_>, destination: &mut ImageViewMut<'_>) {
    use std::arch::x86_64::*;
    unsafe {
        let red = _mm256_set1_epi32(0x0000_00ff);
        let blue = _mm256_set1_epi32(0x00ff_0000);
        let green_alpha = _mm256_set1_epi32(0xff00_ff00u32 as i32);
        for y in 0..source.height {
            let source_row = y * source.stride;
            let destination_row = y * destination.stride;
            let mut x = 0;
            while x + 8 <= source.width {
                let offset = x * 4;
                let input = _mm256_loadu_si256(source.data.as_ptr().add(source_row + offset) as *const __m256i);
                let output = _mm256_or_si256(
                    _mm256_and_si256(input, green_alpha),
                    _mm256_or_si256(_mm256_slli_epi32::<16>(_mm256_and_si256(input, red)), _mm256_srli_epi32::<16>(_mm256_and_si256(input, blue))),
                );
                _mm256_storeu_si256(destination.data.as_mut_ptr().add(destination_row + offset) as *mut __m256i, output);
                x += 8;
            }
            for pixel in x..source.width {
                let offset = pixel * 4;
                destination.data[destination_row + offset] = source.data[source_row + offset + 2];
                destination.data[destination_row + offset + 1] = source.data[source_row + offset + 1];
                destination.data[destination_row + offset + 2] = source.data[source_row + offset];
                destination.data[destination_row + offset + 3] = source.data[source_row + offset + 3];
            }
        }
    }
}

#[cfg(target_arch = "x86")]
#[target_feature(enable = "avx2")]
unsafe fn convert_avx2(source: &ImageView<'_>, destination: &mut ImageViewMut<'_>) {
    use std::arch::x86::*;
    unsafe {
        let red = _mm256_set1_epi32(0x0000_00ff);
        let blue = _mm256_set1_epi32(0x00ff_0000);
        let green_alpha = _mm256_set1_epi32(0xff00_ff00u32 as i32);
        for y in 0..source.height {
            let source_row = y * source.stride;
            let destination_row = y * destination.stride;
            let mut x = 0;
            while x + 8 <= source.width {
                let offset = x * 4;
                let input = _mm256_loadu_si256(source.data.as_ptr().add(source_row + offset) as *const __m256i);
                let output = _mm256_or_si256(
                    _mm256_and_si256(input, green_alpha),
                    _mm256_or_si256(_mm256_slli_epi32::<16>(_mm256_and_si256(input, red)), _mm256_srli_epi32::<16>(_mm256_and_si256(input, blue))),
                );
                _mm256_storeu_si256(destination.data.as_mut_ptr().add(destination_row + offset) as *mut __m256i, output);
                x += 8;
            }
            for pixel in x..source.width {
                let offset = pixel * 4;
                destination.data[destination_row + offset] = source.data[source_row + offset + 2];
                destination.data[destination_row + offset + 1] = source.data[source_row + offset + 1];
                destination.data[destination_row + offset + 2] = source.data[source_row + offset];
                destination.data[destination_row + offset + 3] = source.data[source_row + offset + 3];
            }
        }
    }
}

/// Resize an image with center-aligned bilinear sampling. Source and destination formats must match.
pub fn resize_bilinear(source: ImageView<'_>, destination: &mut ImageViewMut<'_>) -> Result<(), PixelError> {
    validate_same_format(&source, destination)?;
    let scale_x = source.width as f64 / destination.width as f64;
    let scale_y = source.height as f64 / destination.height as f64;
    for y in 0..destination.height {
        let source_y = ((y as f64 + 0.5) * scale_y - 0.5).clamp(0.0, (source.height - 1) as f64);
        let y0 = source_y.floor() as usize;
        let y1 = (y0 + 1).min(source.height - 1);
        let fy = (source_y - y0 as f64) as f32;
        for x in 0..destination.width {
            let source_x = ((x as f64 + 0.5) * scale_x - 0.5).clamp(0.0, (source.width - 1) as f64);
            let x0 = source_x.floor() as usize;
            let x1 = (x0 + 1).min(source.width - 1);
            let fx = (source_x - x0 as f64) as f32;
            let destination_offset = y * destination.stride + x * 4;
            let top_left = y0 * source.stride + x0 * 4;
            let top_right = y0 * source.stride + x1 * 4;
            let bottom_left = y1 * source.stride + x0 * 4;
            let bottom_right = y1 * source.stride + x1 * 4;
            for channel in 0..4 {
                let top = source.data[top_left + channel] as f32 * (1.0 - fx) + source.data[top_right + channel] as f32 * fx;
                let bottom = source.data[bottom_left + channel] as f32 * (1.0 - fx) + source.data[bottom_right + channel] as f32 * fx;
                destination.data[destination_offset + channel] = byte(top * (1.0 - fy) + bottom * fy);
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn view(data: &[u8], width: usize, height: usize, stride: usize, format: PixelFormat) -> ImageView<'_> {
        ImageView::new(data, width, height, stride, format).unwrap()
    }

    #[test]
    fn validation_rejects_zero_dimensions_short_stride_and_short_buffers() {
        assert_eq!(ImageView::new(&[], 0, 1, 0, PixelFormat::Rgba8).unwrap_err(), PixelError::ZeroDimension);
        assert_eq!(ImageView::new(&[0; 12], 3, 1, 11, PixelFormat::Rgba8).unwrap_err(), PixelError::StrideTooSmall);
        assert_eq!(ImageView::new(&[0; 11], 3, 1, 12, PixelFormat::Rgba8).unwrap_err(), PixelError::BufferTooShort);
        assert_eq!(ImageView::new(&[], usize::MAX, 1, usize::MAX, PixelFormat::Rgba8).unwrap_err(), PixelError::SizeOverflow);
    }

    #[test]
    fn conversion_handles_unaligned_rows_padding_and_simd_tails() {
        let width = 13;
        let height = 3;
        let stride = width * 4 + 5;
        let input: Vec<u8> = (0..(stride * (height - 1) + width * 4 + 1)).map(|i| (i * 37) as u8).collect();
        let source = view(&input[1..], width, height, stride, PixelFormat::Rgba8);
        let mut accelerated = vec![0xEE; stride * height + 1];
        let mut scalar = vec![0xEE; stride * height + 1];
        {
            let mut output = ImageViewMut::new(&mut accelerated[1..], width, height, stride, PixelFormat::Bgra8).unwrap();
            convert_format(source, &mut output).unwrap();
        }
        {
            let mut output = ImageViewMut::new(&mut scalar[1..], width, height, stride, PixelFormat::Bgra8).unwrap();
            convert_format_scalar(source, &mut output).unwrap();
        }
        assert_eq!(accelerated, scalar);
        assert_eq!(&accelerated[1 + width * 4..1 + stride], &[0xEE; 5]);
    }

    #[test]
    fn large_conversion_matches_the_scalar_reference() {
        let width = 257;
        let height = 129;
        let stride = width * 4 + 7;
        let length = stride * (height - 1) + width * 4;
        let input: Vec<u8> = (0usize..length).map(|index| index.wrapping_mul(29) as u8).collect();
        let source = view(&input, width, height, stride, PixelFormat::Bgra8);
        let mut accelerated = vec![0xA5; length];
        let mut scalar = vec![0xA5; length];
        convert_format(source, &mut ImageViewMut::new(&mut accelerated, width, height, stride, PixelFormat::Rgba8).unwrap()).unwrap();
        convert_format_scalar(source, &mut ImageViewMut::new(&mut scalar, width, height, stride, PixelFormat::Rgba8).unwrap()).unwrap();
        assert_eq!(accelerated, scalar);
    }

    #[test]
    fn same_format_copy_respects_different_strides_and_preserves_padding() {
        let input = [1, 2, 3, 4, 90, 91, 5, 6, 7, 8, 92, 93];
        let source = view(&input, 1, 2, 6, PixelFormat::Rgba8);
        let mut output = [0xEE; 13];
        convert_format_scalar(
            source,
            &mut ImageViewMut::new(&mut output, 1, 2, 7, PixelFormat::Rgba8).unwrap(),
        )
        .unwrap();
        assert_eq!(&output[..4], &[1, 2, 3, 4]);
        assert_eq!(output[4], 0xEE);
        assert_eq!(&output[7..11], &[5, 6, 7, 8]);
        assert_eq!(output[11], 0xEE);
    }

    #[test]
    fn brightness_saturation_and_blending_preserve_alpha_and_padding() {
        let pixels = [100, 80, 20, 77, 40, 180, 90, 0];
        let source = view(&pixels, 2, 1, 8, PixelFormat::Rgba8);
        let mut adjusted = [0; 8];
        brightness_contrast(source, &mut ImageViewMut::new(&mut adjusted, 2, 1, 8, PixelFormat::Rgba8).unwrap(), 0.1, 0.0).unwrap();
        assert_eq!(adjusted[3], 77);
        assert_eq!(adjusted[7], 0);
        let mut bright = [0; 8];
        brightness_contrast(source, &mut ImageViewMut::new(&mut bright, 2, 1, 8, PixelFormat::Rgba8).unwrap(), 1.0, 0.0).unwrap();
        assert_eq!(&bright[..3], &[255, 255, 255]);
        assert_eq!(&bright[4..7], &[255, 255, 255]);
        let mut dark = [0; 8];
        brightness_contrast(source, &mut ImageViewMut::new(&mut dark, 2, 1, 8, PixelFormat::Rgba8).unwrap(), -1.0, 0.0).unwrap();
        assert_eq!(&dark[..3], &[0, 0, 0]);
        assert_eq!(&dark[4..7], &[0, 0, 0]);
        let mut grey = [0; 8];
        saturation(source, &mut ImageViewMut::new(&mut grey, 2, 1, 8, PixelFormat::Rgba8).unwrap(), 0.0).unwrap();
        assert_eq!(grey[0], grey[1]);
        assert_eq!(grey[1], grey[2]);
        assert_eq!(grey[3], 77);

        let foreground = [255, 0, 0, 255, 0, 0, 255, 0];
        let mut background = [0, 255, 0, 255, 40, 50, 60, 0];
        alpha_blend(
            view(&foreground, 2, 1, 8, PixelFormat::Rgba8),
            &mut ImageViewMut::new(&mut background, 2, 1, 8, PixelFormat::Rgba8).unwrap(),
            1.0,
        ).unwrap();
        assert_eq!(&background[..4], &[255, 0, 0, 255]);
        assert_eq!(&background[4..], &[0, 0, 0, 0]);

        let semi_source = [255, 0, 0, 128];
        let mut semi_background = [0, 0, 255, 128];
        alpha_blend(
            view(&semi_source, 1, 1, 4, PixelFormat::Rgba8),
            &mut ImageViewMut::new(&mut semi_background, 1, 1, 4, PixelFormat::Rgba8).unwrap(),
            0.5,
        )
        .unwrap();
        assert_eq!(semi_background, [102, 0, 153, 160]);
    }

    #[test]
    fn resize_bilinear_preserves_constant_images_and_rejects_format_mismatch() {
        let source_pixels = [20, 80, 140, 200].repeat(4);
        let source = view(&source_pixels, 2, 2, 8, PixelFormat::Bgra8);
        let mut output = [0; 4 * 3 * 5];
        resize_bilinear(source, &mut ImageViewMut::new(&mut output, 3, 5, 12, PixelFormat::Bgra8).unwrap()).unwrap();
        for pixel in output.chunks_exact(4) { assert_eq!(pixel, &[20, 80, 140, 200]); }
        assert_eq!(resize_bilinear(source, &mut ImageViewMut::new(&mut [0; 12], 3, 1, 12, PixelFormat::Rgba8).unwrap()), Err(PixelError::FormatMismatch));
    }

    #[test]
    fn operations_reject_invalid_ranges_and_dimension_mismatches() {
        let source = view(&[0; 16], 2, 2, 8, PixelFormat::Rgba8);
        let mut target = [0; 16];
        let mut destination = ImageViewMut::new(&mut target, 2, 2, 8, PixelFormat::Rgba8).unwrap();
        assert_eq!(brightness_contrast(source, &mut destination, 1.1, 0.0), Err(PixelError::InvalidParameter));
        assert_eq!(saturation(source, &mut destination, f32::NAN), Err(PixelError::InvalidParameter));
        assert_eq!(alpha_blend(source, &mut destination, -0.1), Err(PixelError::InvalidParameter));
        let mut different_size_bytes = [0; 8];
        let mut different_size = ImageViewMut::new(&mut different_size_bytes, 2, 1, 8, PixelFormat::Rgba8).unwrap();
        assert_eq!(brightness_contrast(source, &mut different_size, 0.0, 0.0), Err(PixelError::DimensionMismatch));
    }
}
