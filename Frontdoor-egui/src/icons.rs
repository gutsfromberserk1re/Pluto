//! Icon system.
//!
//! The web frontend renders every glyph from an inline `<svg viewBox="0 0 24 24"
//! fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
//! stroke-linejoin="round">` (see `icon()` in app.js:85-93). To reproduce the
//! exact shapes without pulling in an SVG rasteriser, the same path data is
//! embedded below and flattened into polylines once, then re-drawn at any size.
//!
//! Supported geometry: `<path>` (M L H V C S Q T A Z, absolute + relative),
//! `<circle>`, `<ellipse>`, `<rect>` (with `rx`) and `stroke-dasharray`.

use std::collections::HashMap;
use std::sync::OnceLock;

use egui::{Color32, Painter, Pos2, Rect, Shape, Stroke};

/// `stroke-width="1.8"` on a 24×24 viewBox.
const BASE_STROKE: f32 = 1.8;
const BOX: f32 = 24.0;

// ---------------------------------------------------------------------------
// Source data — verbatim from `ICONS` in Frontdoor/scripts/app.js:2-71
// ---------------------------------------------------------------------------

static SOURCES: &[(&str, &str)] = &[
    ("crop", r#"<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>"#),
    ("scale", r#"<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/>"#),
    ("position", r#"<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M12 10.5v3M10.5 12h3"/>"#),
    ("link", r#"<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>"#),
    ("reset", r#"<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>"#),
    ("lock", r#"<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>"#),
    ("group", r#"<rect x="3" y="4" width="13" height="13" rx="2"/><path d="M8 20h10a3 3 0 0 0 3-3V9"/><path d="M8 8h5M8 12h4"/>"#),
    ("chevRight", r#"<path d="m9 18 6-6-6-6"/>"#),
    ("chevUp", r#"<path d="m18 15-6-6-6 6"/>"#),
    ("chevDown", r#"<path d="m6 9 6 6 6-6"/>"#),
    ("chevLeft", r#"<path d="m15 18-6-6 6-6"/>"#),
    ("minus", r#"<path d="M5 12h14"/>"#),
    ("plus", r#"<path d="M5 12h14M12 5v14"/>"#),
    ("distort", r#"<path d="M3 5c6 2 12 2 18 0v14c-6-2-12-2-18 0z"/><path d="M12 5.8v12.4M3 12c6 1.5 12 1.5 18 0"/>"#),
    ("palette", r#"<circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>"#),
    ("wheel", r#"<circle cx="12" cy="12" r="9"/><circle cx="12" cy="8" r="1.2"/><circle cx="8.6" cy="14.2" r="1.2"/><circle cx="15.4" cy="14.2" r="1.2"/>"#),
    ("sliders", r#"<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2.2"/><circle cx="9" cy="12" r="2.2"/><circle cx="17" cy="18" r="2.2"/>"#),
    ("sun", r#"<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>"#),
    ("droplet", r#"<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>"#),
    ("detail", r#"<path d="m3 19 6.5-11 4 6.5 2.5-4L21 19z"/>"#),
    ("sparkles", r#"<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>"#),
    ("blur", r#"<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="6" stroke-dasharray="2 2.6"/><circle cx="12" cy="12" r="9.5" stroke-dasharray="1 3.4"/>"#),
    ("grain", r#"<circle cx="6" cy="6" r=".9"/><circle cx="12" cy="5" r=".9"/><circle cx="18" cy="7" r=".9"/><circle cx="9" cy="10" r=".9"/><circle cx="15" cy="11" r=".9"/><circle cx="5" cy="14" r=".9"/><circle cx="11" cy="15" r=".9"/><circle cx="18" cy="16" r=".9"/><circle cx="8" cy="19" r=".9"/><circle cx="14" cy="19" r=".9"/>"#),
    ("vignette", r#"<rect x="3" y="5" width="18" height="14" rx="3"/><ellipse cx="12" cy="12" rx="5.5" ry="3.8"/>"#),
    ("glow", r#"<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>"#),
    ("stylize", r#"<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>"#),
    ("download", r#"<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 20h16"/>"#),
    ("upload", r#"<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/>"#),
    ("folder", r#"<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>"#),
    ("image", r#"<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/>"#),
    ("video", r#"<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>"#),
    ("check", r#"<path d="m5 12 5 5 9-10"/>"#),
    ("x", r#"<path d="M6 6l12 12M18 6 6 18"/>"#),
    ("windowMinimize", r#"<path d="M5 12h14"/>"#),
    ("windowMaximize", r#"<rect x="5" y="5" width="14" height="14" rx="1"/>"#),
    ("windowRestore", r#"<rect x="7" y="4" width="12" height="12" rx="1"/><path d="M5 8v12h12"/>"#),
    ("keyPrev", r#"<path d="M5 4v16"/><path d="m15 5 7 7-7 7-7-7z"/>"#),
    ("keyNext", r#"<path d="M19 4v16"/><path d="m9 5 7 7-7 7-7-7z"/>"#),
    ("keyAdd", r#"<path d="m12 3 9 9-9 9-9-9z"/><path d="M12 8v8M8 12h8"/>"#),
    ("keyActive", r#"<path d="m12 2 10 10-10 10L2 12z" fill="currentColor"/>"#),
    ("play", r#"<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1l-11-6.8a.6.6 0 0 0-.9.5z" fill="currentColor"/>"#),
    ("pause", r#"<rect x="6.5" y="5" width="3.8" height="14" rx="1" fill="currentColor"/><rect x="13.7" y="5" width="3.8" height="14" rx="1" fill="currentColor"/>"#),
    ("skipBack", r#"<path d="M19 5.5v13L9.5 12z"/><path d="M5 5v14"/>"#),
    ("skipForward", r#"<path d="M5 5.5v13L14.5 12z"/><path d="M19 5v14"/>"#),
    ("scissors", r#"<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>"#),
    ("cursor", r#"<path d="M5 3l14 8-6.5 1.8L10 19z"/>"#),
    ("hand", r#"<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8.5a7 7 0 0 0 14 0v-5a2 2 0 0 0-4 0v-2.5"/>"#),
    ("magnet", r#"<path d="M6 3v8a6 6 0 0 0 12 0V3"/><path d="M6 8h4M14 8h4"/>"#),
    ("undo", r#"<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>"#),
    ("redo", r#"<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>"#),
    ("trash", r#"<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>"#),
    ("search", r#"<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>"#),
    ("grid", r#"<path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/>"#),
    ("repeat", r#"<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>"#),
    ("film", r#"<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>"#),
    ("music", r#"<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>"#),
    ("type", r#"<path d="M4 7V5h16v2M12 5v14M9 19h6"/>"#),
    ("zoomOut", r#"<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8.5 11h5"/>"#),
    ("zoomIn", r#"<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8.5 11h5M11 8.5v5"/>"#),
    ("transition", r#"<path d="M3 5v14l8-7zM21 5v14l-8-7z"/>"#),
    ("wave", r#"<path d="M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3-4 5-3"/>"#),
    ("chroma", r#"<circle cx="9" cy="10" r="5.5"/><circle cx="15" cy="10" r="5.5"/><circle cx="12" cy="15" r="5.5"/>"#),
    ("glitch", r#"<path d="M4 7h10M10 12h10M4 17h8M16 17h4"/>"#),
    ("pixel", r#"<path d="M4 4h6v6H4zM14 4h6v6h-6zM9 14h6v6H9z"/>"#),
    ("scan", r#"<path d="M3 6h18M3 10h18M3 14h18M3 18h18"/>"#),
    ("shake", r#"<path d="m7 7-4 5 4 5M17 7l4 5-4 5M12 6v12"/>"#),
    ("ripple", r#"<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/>"#),
    ("strobe", r#"<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>"#),
];

// ---------------------------------------------------------------------------
// Flattened geometry
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
struct Strip {
    pts: Vec<Pos2>,
    filled: bool,
    dash: Option<(f32, f32)>,
}

#[derive(Clone, Copy)]
enum Tok {
    Cmd(char),
    Num(f32),
}

fn cache() -> &'static HashMap<&'static str, Vec<Strip>> {
    static CACHE: OnceLock<HashMap<&'static str, Vec<Strip>>> = OnceLock::new();
    CACHE.get_or_init(|| {
        SOURCES
            .iter()
            .map(|(name, src)| (*name, parse_svg(src)))
            .collect()
    })
}

/// Draws `name` centred inside `rect`, in `color`, at the stylesheet's stroke
/// weight (`stroke-width: 1.8` scaled from the 24-unit viewBox).
pub fn draw(painter: &Painter, rect: Rect, name: &str, color: Color32) {
    let Some(strips) = cache().get(name) else {
        return;
    };
    let scale = rect.width().min(rect.height()) / BOX;
    let stroke = Stroke::new((BASE_STROKE * scale).max(0.6), color);

    let map = |p: Pos2| Pos2::new(rect.min.x + p.x * scale, rect.min.y + p.y * scale);

    for strip in strips {
        let pts: Vec<Pos2> = strip.pts.iter().copied().map(map).collect();
        if strip.filled {
            painter.add(Shape::convex_polygon(pts, color, Stroke::NONE));
            continue;
        }
        match strip.dash {
            None => {
                painter.add(Shape::line(pts, stroke));
            }
            Some((on, off)) => {
                for seg in dash_segments(&pts, on * scale, off * scale) {
                    painter.add(Shape::line(seg, stroke));
                }
            }
        }
    }
}

/// Convenience: draw into a square of side `size` centred on `centre`.
pub fn draw_at(painter: &Painter, centre: Pos2, size: f32, name: &str, color: Color32) {
    draw(
        painter,
        Rect::from_center_size(centre, egui::vec2(size, size)),
        name,
        color,
    );
}

fn dash_segments(pts: &[Pos2], on: f32, off: f32) -> Vec<Vec<Pos2>> {
    let period = (on + off).max(0.01);
    let mut out: Vec<Vec<Pos2>> = Vec::new();
    let mut cur: Vec<Pos2> = Vec::new();
    let mut travelled = 0.0_f32;

    for win in pts.windows(2) {
        let (a, b) = (win[0], win[1]);
        let len = a.distance(b);
        if len <= f32::EPSILON {
            continue;
        }
        let dir = (b - a) / len;
        let mut t = 0.0_f32;
        while t < len {
            let phase = travelled % period;
            if phase < on {
                if cur.is_empty() {
                    cur.push(a + dir * t);
                }
                let step = (on - phase).min(len - t);
                t += step;
                travelled += step;
                cur.push(a + dir * t);
            } else {
                if cur.len() > 1 {
                    out.push(std::mem::take(&mut cur));
                } else {
                    cur.clear();
                }
                let step = (period - phase).min(len - t);
                t += step;
                travelled += step;
            }
        }
    }
    if cur.len() > 1 {
        out.push(cur);
    }
    out
}

// ---------------------------------------------------------------------------
// Minimal SVG scanner
// ---------------------------------------------------------------------------

fn parse_svg(src: &str) -> Vec<Strip> {
    let mut out = Vec::new();
    let mut i = 0usize;

    while let Some(open) = src[i..].find('<') {
        let start = i + open;
        let Some(close) = src[start..].find('>') else {
            break;
        };
        let tag = &src[start + 1..start + close];
        i = start + close + 1;

        let name = tag
            .split(|c: char| c.is_whitespace() || c == '/')
            .next()
            .unwrap_or("");

        let dash = dash_attr(tag);
        let filled = tag.contains("currentColor");

        match name {
            "path" => {
                if let Some(d) = attr_str(tag, "d") {
                    out.extend(parse_path(d, filled, dash));
                }
            }
            "circle" => {
                let cx = attr_num(tag, "cx").unwrap_or(0.0);
                let cy = attr_num(tag, "cy").unwrap_or(0.0);
                let r = attr_num(tag, "r").unwrap_or(0.0);
                out.push(Strip {
                    pts: ellipse_pts(cx, cy, r, r, 64),
                    filled,
                    dash,
                });
            }
            "ellipse" => {
                let cx = attr_num(tag, "cx").unwrap_or(0.0);
                let cy = attr_num(tag, "cy").unwrap_or(0.0);
                let rx = attr_num(tag, "rx").unwrap_or(0.0);
                let ry = attr_num(tag, "ry").unwrap_or(0.0);
                out.push(Strip {
                    pts: ellipse_pts(cx, cy, rx, ry, 64),
                    filled,
                    dash,
                });
            }
            "rect" => {
                let x = attr_num(tag, "x").unwrap_or(0.0);
                let y = attr_num(tag, "y").unwrap_or(0.0);
                let w = attr_num(tag, "width").unwrap_or(0.0);
                let h = attr_num(tag, "height").unwrap_or(0.0);
                let rx = attr_num(tag, "rx").unwrap_or(0.0);
                out.push(Strip {
                    pts: round_rect_pts(x, y, w, h, rx),
                    filled,
                    dash,
                });
            }
            _ => {}
        }
    }
    out
}

fn attr_str<'a>(tag: &'a str, key: &str) -> Option<&'a str> {
    let needle = format!("{}=\"", key);
    let at = tag.find(&needle)? + needle.len();
    let rest = &tag[at..];
    let end = rest.find('"')?;
    Some(&rest[..end])
}

fn attr_num(tag: &str, key: &str) -> Option<f32> {
    attr_str(tag, key)?.trim().parse().ok()
}

fn dash_attr(tag: &str) -> Option<(f32, f32)> {
    let raw = attr_str(tag, "stroke-dasharray")?;
    let mut it = raw.split(|c: char| c == ',' || c.is_whitespace());
    let on = it.next()?.trim().parse::<f32>().ok()?;
    let off = it
        .next()
        .and_then(|s| s.trim().parse::<f32>().ok())
        .unwrap_or(on);
    Some((on, off))
}

fn ellipse_pts(cx: f32, cy: f32, rx: f32, ry: f32, n: usize) -> Vec<Pos2> {
    (0..=n)
        .map(|k| {
            let a = k as f32 / n as f32 * std::f32::consts::TAU;
            Pos2::new(cx + rx * a.cos(), cy + ry * a.sin())
        })
        .collect()
}

fn round_rect_pts(x: f32, y: f32, w: f32, h: f32, rx: f32) -> Vec<Pos2> {
    let r = rx.min(w * 0.5).min(h * 0.5).max(0.0);
    let mut pts = Vec::new();
    let corners = [
        (Pos2::new(x + w - r, y + r), -std::f32::consts::FRAC_PI_2),
        (Pos2::new(x + w - r, y + h - r), 0.0),
        (Pos2::new(x + r, y + h - r), std::f32::consts::FRAC_PI_2),
        (Pos2::new(x + r, y + r), std::f32::consts::PI),
    ];
    for (c, a0) in corners {
        for k in 0..=8 {
            let a = a0 + k as f32 / 8.0 * std::f32::consts::FRAC_PI_2;
            pts.push(Pos2::new(c.x + r * a.cos(), c.y + r * a.sin()));
        }
    }
    pts
}

// ---------------------------------------------------------------------------
// Path parser
// ---------------------------------------------------------------------------

fn tokenize(d: &str) -> Vec<Tok> {
    let chars: Vec<char> = d.chars().collect();
    let mut out = Vec::new();
    let mut i = 0usize;
    while i < chars.len() {
        let c = chars[i];
        if c.is_ascii_alphabetic() {
            out.push(Tok::Cmd(c));
            i += 1;
        } else if c == ',' || c.is_whitespace() {
            i += 1;
        } else if c.is_ascii_digit() || c == '-' || c == '+' || c == '.' {
            let start = i;
            if c == '-' || c == '+' {
                i += 1;
            }
            while i < chars.len() && chars[i].is_ascii_digit() {
                i += 1;
            }
            if i < chars.len() && chars[i] == '.' {
                i += 1;
                while i < chars.len() && chars[i].is_ascii_digit() {
                    i += 1;
                }
            }
            if i < chars.len() && (chars[i] == 'e' || chars[i] == 'E') {
                i += 1;
                if i < chars.len() && (chars[i] == '-' || chars[i] == '+') {
                    i += 1;
                }
                while i < chars.len() && chars[i].is_ascii_digit() {
                    i += 1;
                }
            }
            let text: String = chars[start..i].iter().collect();
            out.push(Tok::Num(text.parse().unwrap_or(0.0)));
        } else {
            i += 1;
        }
    }
    out
}

fn num(toks: &[Tok], i: &mut usize) -> Option<f32> {
    match toks.get(*i) {
        Some(Tok::Num(v)) => {
            *i += 1;
            Some(*v)
        }
        _ => None,
    }
}

/// Reads exactly `N` numbers in one go (one borrow of the cursor).
fn nums<const N: usize>(toks: &[Tok], i: &mut usize) -> Option<[f32; N]> {
    let mut out = [0.0_f32; N];
    for slot in out.iter_mut() {
        *slot = num(toks, i)?;
    }
    Some(out)
}

fn abs_point(cur: Pos2, rel: bool, x: f32, y: f32) -> Pos2 {
    if rel {
        Pos2::new(cur.x + x, cur.y + y)
    } else {
        Pos2::new(x, y)
    }
}

fn parse_path(d: &str, filled: bool, dash: Option<(f32, f32)>) -> Vec<Strip> {
    let toks = tokenize(d);
    let mut strips: Vec<Strip> = Vec::new();
    let mut buf: Vec<Pos2> = Vec::new();

    let mut cur = Pos2::ZERO;
    let mut first = Pos2::ZERO;
    let mut cmd = 'M';
    let mut i = 0usize;
    let mut last_cubic: Option<Pos2> = None;
    let mut last_quad: Option<Pos2> = None;

    // Curve flattening resolution; far below a pixel of error at icon sizes.
    const CURVE_STEPS: usize = 24;

    while i < toks.len() {
        if let Tok::Cmd(c) = toks[i] {
            cmd = c;
            i += 1;
            if i >= toks.len() {
                break;
            }
        }

        let rel = cmd.is_ascii_lowercase();
        let up = cmd.to_ascii_uppercase();

        if up == 'Z' {
            buf.push(first);
            flush(&mut buf, &mut strips, filled, dash);
            cur = first;
            last_cubic = None;
            last_quad = None;
            if i < toks.len() && matches!(toks[i], Tok::Cmd(_)) {
                continue;
            }
            break;
        }

        match up {
            'M' => {
                let Some([x, y]) = nums::<2>(&toks, &mut i) else {
                    break;
                };
                flush(&mut buf, &mut strips, filled, dash);
                cur = abs_point(cur, rel, x, y);
                first = cur;
                buf.push(cur);
                // Extra coordinate pairs after a moveto are implicit linetos.
                cmd = if rel { 'l' } else { 'L' };
                last_cubic = None;
                last_quad = None;
            }
            'L' => {
                let Some([x, y]) = nums::<2>(&toks, &mut i) else {
                    break;
                };
                cur = abs_point(cur, rel, x, y);
                buf.push(cur);
                last_cubic = None;
                last_quad = None;
            }
            'H' => {
                let Some([x]) = nums::<1>(&toks, &mut i) else {
                    break;
                };
                cur = Pos2::new(if rel { cur.x + x } else { x }, cur.y);
                buf.push(cur);
                last_cubic = None;
                last_quad = None;
            }
            'V' => {
                let Some([y]) = nums::<1>(&toks, &mut i) else {
                    break;
                };
                cur = Pos2::new(cur.x, if rel { cur.y + y } else { y });
                buf.push(cur);
                last_cubic = None;
                last_quad = None;
            }
            'C' => {
                let Some([x1, y1, x2, y2, x, y]) = nums::<6>(&toks, &mut i) else {
                    break;
                };
                let p1 = abs_point(cur, rel, x1, y1);
                let p2 = abs_point(cur, rel, x2, y2);
                let p3 = abs_point(cur, rel, x, y);
                cubic_into(cur, p1, p2, p3, &mut buf, CURVE_STEPS);
                last_cubic = Some(p2);
                last_quad = None;
                cur = p3;
            }
            'S' => {
                let Some([x2, y2, x, y]) = nums::<4>(&toks, &mut i) else {
                    break;
                };
                let p1 = match last_cubic {
                    Some(c) => Pos2::new(2.0 * cur.x - c.x, 2.0 * cur.y - c.y),
                    None => cur,
                };
                let p2 = abs_point(cur, rel, x2, y2);
                let p3 = abs_point(cur, rel, x, y);
                cubic_into(cur, p1, p2, p3, &mut buf, CURVE_STEPS);
                last_cubic = Some(p2);
                last_quad = None;
                cur = p3;
            }
            'Q' => {
                let Some([x1, y1, x, y]) = nums::<4>(&toks, &mut i) else {
                    break;
                };
                let p1 = abs_point(cur, rel, x1, y1);
                let p2 = abs_point(cur, rel, x, y);
                quad_into(cur, p1, p2, &mut buf, CURVE_STEPS);
                last_quad = Some(p1);
                last_cubic = None;
                cur = p2;
            }
            'T' => {
                let Some([x, y]) = nums::<2>(&toks, &mut i) else {
                    break;
                };
                let p1 = match last_quad {
                    Some(q) => Pos2::new(2.0 * cur.x - q.x, 2.0 * cur.y - q.y),
                    None => cur,
                };
                let p2 = abs_point(cur, rel, x, y);
                quad_into(cur, p1, p2, &mut buf, CURVE_STEPS);
                last_quad = Some(p1);
                last_cubic = None;
                cur = p2;
            }
            'A' => {
                let Some([rx, ry, rot, large, sweep, x, y]) = nums::<7>(&toks, &mut i) else {
                    break;
                };
                let end = abs_point(cur, rel, x, y);
                for p in arc_points(cur, rx, ry, rot, large != 0.0, sweep != 0.0, end, CURVE_STEPS) {
                    buf.push(p);
                }
                cur = end;
                last_cubic = None;
                last_quad = None;
            }
            _ => {
                // Unknown command: always make progress.
                i += 1;
            }
        }
    }

    flush(&mut buf, &mut strips, filled, dash);
    strips
}

fn flush(buf: &mut Vec<Pos2>, strips: &mut Vec<Strip>, filled: bool, dash: Option<(f32, f32)>) {
    if buf.len() >= 2 {
        strips.push(Strip {
            pts: std::mem::take(buf),
            filled,
            dash,
        });
    } else {
        buf.clear();
    }
}

fn cubic_into(p0: Pos2, p1: Pos2, p2: Pos2, p3: Pos2, out: &mut Vec<Pos2>, steps: usize) {
    for k in 1..=steps {
        let t = k as f32 / steps as f32;
        let u = 1.0 - t;
        let x = u * u * u * p0.x + 3.0 * u * u * t * p1.x + 3.0 * u * t * t * p2.x + t * t * t * p3.x;
        let y = u * u * u * p0.y + 3.0 * u * u * t * p1.y + 3.0 * u * t * t * p2.y + t * t * t * p3.y;
        out.push(Pos2::new(x, y));
    }
}

fn quad_into(p0: Pos2, p1: Pos2, p2: Pos2, out: &mut Vec<Pos2>, steps: usize) {
    for k in 1..=steps {
        let t = k as f32 / steps as f32;
        let u = 1.0 - t;
        let x = u * u * p0.x + 2.0 * u * t * p1.x + t * t * p2.x;
        let y = u * u * p0.y + 2.0 * u * t * p1.y + t * t * p2.y;
        out.push(Pos2::new(x, y));
    }
}

/// SVG 1.1 F.6.5 endpoint → centre parameterisation, then sampled.
fn arc_points(
    from: Pos2,
    rx: f32,
    ry: f32,
    rot_deg: f32,
    large: bool,
    sweep: bool,
    to: Pos2,
    steps: usize,
) -> Vec<Pos2> {
    if rx.abs() < 1e-6 || ry.abs() < 1e-6 {
        return vec![to];
    }
    let (mut rx, mut ry) = (rx.abs(), ry.abs());
    let phi = rot_deg.to_radians();
    let (sin_p, cos_p) = (phi.sin(), phi.cos());

    let dx2 = (from.x - to.x) * 0.5;
    let dy2 = (from.y - to.y) * 0.5;
    let x1p = cos_p * dx2 + sin_p * dy2;
    let y1p = -sin_p * dx2 + cos_p * dy2;

    let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if lambda > 1.0 {
        let s = lambda.sqrt();
        rx *= s;
        ry *= s;
    }

    let sign = if large != sweep { 1.0 } else { -1.0 };
    let numer = (rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p).max(0.0);
    let denom = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
    let coef = if denom > 0.0 {
        sign * (numer / denom).sqrt()
    } else {
        0.0
    };

    let cxp = coef * (rx * y1p / ry);
    let cyp = -coef * (ry * x1p / rx);

    let cx = cos_p * cxp - sin_p * cyp + (from.x + to.x) * 0.5;
    let cy = sin_p * cxp + cos_p * cyp + (from.y + to.y) * 0.5;

    let ux = (x1p - cxp) / rx;
    let uy = (y1p - cyp) / ry;
    let vx = (-x1p - cxp) / rx;
    let vy = (-y1p - cyp) / ry;

    let theta1 = uy.atan2(ux);
    let mut delta = (ux * vy - uy * vx).atan2(ux * vx + uy * vy);
    if !sweep && delta > 0.0 {
        delta -= std::f32::consts::TAU;
    } else if sweep && delta < 0.0 {
        delta += std::f32::consts::TAU;
    }

    let count = steps.max(4);
    let mut out = Vec::with_capacity(count);
    for k in 1..=count {
        let t = theta1 + delta * (k as f32 / count as f32);
        let x = cx + rx * t.cos() * cos_p - ry * t.sin() * sin_p;
        let y = cy + rx * t.cos() * sin_p + ry * t.sin() * cos_p;
        out.push(Pos2::new(x, y));
    }
    out
}
