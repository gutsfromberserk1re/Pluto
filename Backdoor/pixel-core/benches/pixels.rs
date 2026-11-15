use pluto_pixel_core::{
    alpha_blend, brightness_contrast, convert_format, convert_format_scalar, resize_bilinear,
    saturation, ImageView, ImageViewMut, PixelFormat,
};
use std::{hint::black_box, time::Instant};

const WARMUP: usize = 5;
const SAMPLES: usize = 7;
const ITERATIONS_PER_SAMPLE: usize = 8;

fn features() -> String {
    #[cfg(any(target_arch = "x86", target_arch = "x86_64"))]
    {
        format!(
            "sse2={},sse4.1={},avx={},avx2={},fma={}",
            std::is_x86_feature_detected!("sse2"),
            std::is_x86_feature_detected!("sse4.1"),
            std::is_x86_feature_detected!("avx"),
            std::is_x86_feature_detected!("avx2"),
            std::is_x86_feature_detected!("fma")
        )
    }
    #[cfg(not(any(target_arch = "x86", target_arch = "x86_64")))]
    {
        "none".into()
    }
}

fn measure<F: FnMut()>(name: &str, width: usize, height: usize, mut operation: F) {
    for _ in 0..WARMUP {
        operation();
    }
    let mut samples = Vec::with_capacity(SAMPLES);
    for _ in 0..SAMPLES {
        let started = Instant::now();
        for _ in 0..ITERATIONS_PER_SAMPLE {
            operation();
        }
        samples.push(started.elapsed().as_nanos() as f64 / ITERATIONS_PER_SAMPLE as f64);
    }
    samples.sort_by(f64::total_cmp);
    let mean = samples.iter().sum::<f64>() / samples.len() as f64;
    let median = samples[samples.len() / 2];
    let p95 = samples[((samples.len() - 1) * 95).div_ceil(100)];
    let pixels_per_sec = width as f64 * height as f64 * 1e9 / mean;
    println!(
        "{name},{width},{height},{WARMUP},{SAMPLES},{ITERATIONS_PER_SAMPLE},{mean:.2},{median:.2},{p95:.2},{pixels_per_sec:.2}"
    );
}

fn main() {
    println!("# cpu_arch={},features={}", std::env::consts::ARCH, features());
    println!("operation,width,height,warmup,samples,iterations_per_sample,mean_ns,median_ns,p95_ns,pixels_per_sec");
    let (width, height) = (1280, 720);
    let stride = width * 4;
    let source_bytes: Vec<u8> = (0usize..stride * height)
        .map(|index| index.wrapping_mul(31) as u8)
        .collect();
    let source = ImageView::new(&source_bytes, width, height, stride, PixelFormat::Rgba8).unwrap();
    let mut output = vec![0; source_bytes.len()];

    measure("brightness_contrast", width, height, || {
        brightness_contrast(
            source,
            &mut ImageViewMut::new(&mut output, width, height, stride, PixelFormat::Rgba8).unwrap(),
            0.08,
            0.15,
        )
        .unwrap();
        black_box(&output);
    });

    measure("saturation", width, height, || {
        saturation(
            source,
            &mut ImageViewMut::new(&mut output, width, height, stride, PixelFormat::Rgba8).unwrap(),
            1.2,
        )
        .unwrap();
        black_box(&output);
    });

    output.fill(0x80);
    measure("alpha_blend", width, height, || {
        alpha_blend(
            source,
            &mut ImageViewMut::new(&mut output, width, height, stride, PixelFormat::Rgba8).unwrap(),
            0.65,
        )
        .unwrap();
        black_box(&output);
    });

    measure("rgba_bgra_conversion_scalar", width, height, || {
        convert_format_scalar(
            source,
            &mut ImageViewMut::new(&mut output, width, height, stride, PixelFormat::Bgra8).unwrap(),
        )
        .unwrap();
        black_box(&output);
    });

    measure("rgba_bgra_conversion_dispatch", width, height, || {
        convert_format(
            source,
            &mut ImageViewMut::new(&mut output, width, height, stride, PixelFormat::Bgra8).unwrap(),
        )
        .unwrap();
        black_box(&output);
    });

    let (small_width, small_height) = (640, 360);
    let mut resized = vec![0; small_width * small_height * 4];
    measure("bilinear_resize", small_width, small_height, || {
        resize_bilinear(
            source,
            &mut ImageViewMut::new(
                &mut resized,
                small_width,
                small_height,
                small_width * 4,
                PixelFormat::Rgba8,
            )
            .unwrap(),
        )
        .unwrap();
        black_box(&resized);
    });
}
