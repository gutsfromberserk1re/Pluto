//! Design tokens lifted verbatim from `Frontdoor/styles/app.css`.
//!
//! Every constant here mirrors a CSS custom property or a hard-coded value in
//! the stylesheet, with the CSS line referenced so the two stay in sync.

use egui::{Color32, CornerRadius, Mesh, Pos2, Rect, Stroke, Vec2};

// ---------------------------------------------------------------------------
// Palette — `.ed { ... }` custom properties, app.css:413-419
// ---------------------------------------------------------------------------

/// `background: #0b0b0d`
pub const BG: Color32 = Color32::from_rgb(0x0b, 0x0b, 0x0d);
/// `.ed-top { background: #111214 }`  app.css:468
pub const TOP_BG: Color32 = Color32::from_rgb(0x11, 0x12, 0x14);
/// `--tp-bg` gradient top stop `#1c1d20`
pub const CARD_TOP: Color32 = Color32::from_rgb(0x1c, 0x1d, 0x20);
/// `--tp-bg` gradient bottom stop `#151618`
pub const CARD_BOTTOM: Color32 = Color32::from_rgb(0x15, 0x16, 0x18);
/// `--tp-card: #18191c`
pub const CARD: Color32 = Color32::from_rgb(0x18, 0x19, 0x1c);
/// `--tp-field: #212226`
pub const FIELD: Color32 = Color32::from_rgb(0x21, 0x22, 0x26);
/// `--tp-track: #0e0f11`
pub const TRACK: Color32 = Color32::from_rgb(0x0e, 0x0f, 0x11);
/// `--tp-text: #ededf0`
pub const TEXT: Color32 = Color32::from_rgb(0xed, 0xed, 0xf0);
/// `--tp-muted: #8c8e96`
pub const MUTED: Color32 = Color32::from_rgb(0x8c, 0x8e, 0x96);
/// `--tp-blue: #3b82f6`
pub const BLUE: Color32 = Color32::from_rgb(0x3b, 0x82, 0xf6);
/// `--tp-red: #ff3b3b`
pub const RED: Color32 = Color32::from_rgb(0xff, 0x3b, 0x3b);
/// `--tpc-thumb: #f4f4f6`
pub const THUMB: Color32 = Color32::from_rgb(0xf4, 0xf4, 0xf6);
/// `.ed-btn--tool[aria-pressed=true] { background: #2a2b31 }`
pub const TOOL_ACTIVE: Color32 = Color32::from_rgb(0x2a, 0x2b, 0x31);
/// `.ed-export { background: linear-gradient(180deg,#2a2b31,#202125) }`
pub const EXPORT_TOP: Color32 = Color32::from_rgb(0x2a, 0x2b, 0x31);
/// `... #202125`
pub const EXPORT_BOTTOM: Color32 = Color32::from_rgb(0x20, 0x21, 0x25);
/// Clip selection ring `#f4f4f6`
pub const SELECT_RING: Color32 = THUMB;
/// `--tpc-rail: #2b2c31`
pub const RAIL: Color32 = Color32::from_rgb(0x2b, 0x2c, 0x31);
/// Window-close hover `#c42b1c`
pub const CLOSE_HOVER: Color32 = Color32::from_rgb(0xc4, 0x2b, 0x1c);

/// `--tp-border: rgba(255,255,255,0.06)`
pub const BORDER: Color32 = Color32::from_rgba_premultiplied(15, 15, 15, 15);
/// `rgba(255,255,255,0.08)` — `.ed-sep`
pub const HAIRLINE: Color32 = Color32::from_rgba_premultiplied(20, 20, 20, 20);
/// `rgba(255,255,255,0.04)` — track separators
pub const TRACK_LINE: Color32 = Color32::from_rgba_premultiplied(10, 10, 10, 10);
/// `rgba(255,255,255,0.018)` — odd track zebra stripe
pub const ZEBRA: Color32 = Color32::from_rgba_premultiplied(4, 4, 4, 4);
/// `rgba(255,255,255,0.06)` — `.ed-btn:hover`
pub const HOVER: Color32 = Color32::from_rgba_premultiplied(15, 15, 15, 15);
/// `rgba(255,255,255,0.09)` — window button hover
pub const HOVER_STRONG: Color32 = Color32::from_rgba_premultiplied(23, 23, 23, 23);
/// `rgba(59,130,246,0.14)` — toggle pressed background
pub const BLUE_SOFT: Color32 = Color32::from_rgba_premultiplied(8, 18, 34, 36);
/// `rgba(196,181,253, ...)` — grouped clip accent (`#c4b5fd`)
pub const GROUP_ACCENT: Color32 = Color32::from_rgb(0xc4, 0xb5, 0xfd);

// ---------------------------------------------------------------------------
// Layout — `.ed { ... }` app.css:421-425
// ---------------------------------------------------------------------------

/// `grid-template-columns: 270px minmax(0,1fr) 420px`
pub const COL_MEDIA: f32 = 270.0;
/// `... 420px`
pub const COL_INSPECTOR: f32 = 420.0;
/// `grid-template-rows: 56px minmax(0,1fr) 318px`
pub const ROW_TOP: f32 = 56.0;
/// `... 318px`
pub const ROW_TIMELINE: f32 = 318.0;
/// `gap: 10px`
pub const GAP: f32 = 10.0;
/// `padding: 0 10px 10px`
pub const PAD_X: f32 = 10.0;
pub const PAD_BOTTOM: f32 = 10.0;
/// `.ed-card { border-radius: 26px }`
pub const CARD_RADIUS: u8 = 26;
/// `.tp-card { border-radius: 22px }`
pub const INNER_RADIUS: u8 = 22;
/// `.tp-field { border-radius: 14px }`
pub const FIELD_RADIUS: u8 = 14;
/// `.ed-tl-body { grid-template-columns: 64px 1fr }`
pub const TL_LABEL_COL: f32 = 64.0;
/// `.ed-ruler { height: 30px }`
pub const TL_RULER_H: f32 = 30.0;
/// `.ed-track { height: 52px }`
pub const TL_TRACK_H: f32 = 52.0;
/// `.ed-tl-bar { padding: 8px 14px }`
pub const TL_BAR_PAD_Y: f32 = 8.0;
pub const TL_BAR_PAD_X: f32 = 14.0;
/// Breakpoint from `@media (max-width: 1240px)` — the media column collapses.
pub const MEDIA_BREAKPOINT: f32 = 1240.0;

// ---------------------------------------------------------------------------
// Type scale (all values are CSS px == egui points)
// ---------------------------------------------------------------------------

pub const FONT_BASE: f32 = 15.0;
pub const FONT_BRAND: f32 = 18.0;
pub const FONT_CARD_HEAD: f32 = 18.0;
pub const FONT_TITLE: f32 = 22.0;
pub const FONT_TC: f32 = 17.0;
pub const FONT_SMALL: f32 = 13.0;
pub const FONT_TINY: f32 = 12.0;

/// Font family used for `font-weight: 600/700` in the stylesheet.
pub const BOLD_FAMILY: &str = "bold";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// `font: 500 15px/1.2 "Inter", …` — regular weight text.
pub fn font(size: f32) -> egui::FontId {
    egui::FontId::new(size, egui::FontFamily::Proportional)
}

/// Semibold/bold text (`font-weight: 600/700`).
pub fn bold(size: f32) -> egui::FontId {
    egui::FontId::new(size, egui::FontFamily::Name(BOLD_FAMILY.into()))
}

/// Linear blend between two colours, used by the card gradient.
fn mix(a: Color32, b: Color32, t: f32) -> Color32 {
    let t = t.clamp(0.0, 1.0);
    let l = |x: u8, y: u8| (x as f32 + (y as f32 - x as f32) * t).round() as u8;
    Color32::from_rgb(l(a.r(), b.r()), l(a.g(), b.g()), l(a.b(), b.b()))
}

/// A rounded rect filled with the exact `linear-gradient(180deg, …)` used by
/// `--tp-bg`, with correct rounded corners.
///
/// egui has no gradient primitive, so the shape is emitted as a single mesh: a
/// perimeter polygon sampled from the corner arcs, fan-triangulated from the
/// centre. Because a vertical gradient is an affine function of `y`, barycentric
/// colour interpolation across those triangles is exact — no banding, no seams.
pub fn gradient_card(rect: Rect, radius: f32, top: Color32, bottom: Color32) -> Mesh {
    const SEG: usize = 12;
    let r = radius
        .min(rect.width() * 0.5)
        .min(rect.height() * 0.5)
        .max(0.0);

    // Corner centres, walking clockwise on screen (y grows downwards):
    // top-right → bottom-right → bottom-left → top-left.
    let corners = [
        (Pos2::new(rect.max.x - r, rect.min.y + r), -std::f32::consts::FRAC_PI_2),
        (Pos2::new(rect.max.x - r, rect.max.y - r), 0.0),
        (Pos2::new(rect.min.x + r, rect.max.y - r), std::f32::consts::FRAC_PI_2),
        (Pos2::new(rect.min.x + r, rect.min.y + r), std::f32::consts::PI),
    ];

    let mut perim: Vec<Pos2> = Vec::with_capacity(SEG * 4 + 4);
    for (c, a0) in corners {
        for k in 0..=SEG {
            let a = a0 + (k as f32 / SEG as f32) * std::f32::consts::FRAC_PI_2;
            perim.push(Pos2::new(c.x + r * a.cos(), c.y + r * a.sin()));
        }
    }

    let color_at = |p: Pos2| {
        let t = if rect.height() > 0.0 {
            (p.y - rect.min.y) / rect.height()
        } else {
            0.0
        };
        mix(top, bottom, t)
    };

    let mut mesh = Mesh::default();
    let centre = rect.center();
    mesh.vertices.push(egui::epaint::Vertex {
        pos: centre,
        uv: egui::epaint::WHITE_UV,
        color: mix(top, bottom, 0.5),
    });
    for p in &perim {
        mesh.vertices.push(egui::epaint::Vertex {
            pos: *p,
            uv: egui::epaint::WHITE_UV,
            color: color_at(*p),
        });
    }
    let n = perim.len() as u32;
    for k in 1..=n {
        let next = if k == n { 1 } else { k + 1 };
        mesh.indices.extend_from_slice(&[0, k, next]);
    }
    mesh
}

/// `.ed-card` — the standard panel container.
pub fn card(painter: &egui::Painter, rect: Rect) {
    painter.add(egui::Shape::mesh(gradient_card(
        rect,
        CARD_RADIUS as f32,
        CARD_TOP,
        CARD_BOTTOM,
    )));
    painter.rect_stroke(
        rect,
        CornerRadius::same(CARD_RADIUS),
        Stroke::new(1.0, BORDER),
        egui::StrokeKind::Inside,
    );
}

/// `.ed-card` with a caller-supplied radius (used for the timeline card).
pub fn card_radius(painter: &egui::Painter, rect: Rect, radius: u8) {
    painter.add(egui::Shape::mesh(gradient_card(
        rect,
        radius as f32,
        CARD_TOP,
        CARD_BOTTOM,
    )));
    painter.rect_stroke(
        rect,
        CornerRadius::same(radius),
        Stroke::new(1.0, BORDER),
        egui::StrokeKind::Inside,
    );
}

/// `background: var(--tp-field); border-radius: …`
pub fn field(painter: &egui::Painter, rect: Rect, radius: u8, fill: Color32) {
    painter.rect_filled(rect, CornerRadius::same(radius), fill);
}

/// 1px hairline divider.
pub fn hairline(painter: &egui::Painter, rect: Rect, color: Color32) {
    painter.rect_filled(rect, CornerRadius::ZERO, color);
}

/// Installs the text stack: Inter if present, otherwise the platform UI font
/// that the browser would have fallen back to (`Segoe UI` on Windows), plus a
/// semibold face registered under [`BOLD_FAMILY`].
pub fn install_fonts(ctx: &egui::Context) {
    let mut fonts = egui::FontDefinitions::default();

    const REGULAR: &[&str] = &[
        "C:/Windows/Fonts/Inter-Regular.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/usr/share/fonts/truetype/inter/Inter-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ];
    const SEMIBOLD: &[&str] = &[
        "C:/Windows/Fonts/Inter-SemiBold.ttf",
        "C:/Windows/Fonts/segoeuisb.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "/usr/share/fonts/truetype/inter/Inter-SemiBold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ];

    fn first_existing(paths: &[&str]) -> Option<Vec<u8>> {
        paths.iter().find_map(|p| std::fs::read(p).ok())
    }

    let mut proportional: Vec<String> = fonts
        .families
        .get(&egui::FontFamily::Proportional)
        .cloned()
        .unwrap_or_default();

    if let Some(bytes) = first_existing(REGULAR) {
        fonts
            .font_data
            .insert("ui".to_owned(), std::sync::Arc::new(egui::FontData::from_owned(bytes)));
        proportional.insert(0, "ui".to_owned());
    }

    // The bold family always exists, even when no semibold face is installed,
    // so `FontId::new(_, FontFamily::Name("bold"))` can never fail to lay out.
    let mut bold_chain = proportional.clone();
    if let Some(bytes) = first_existing(SEMIBOLD) {
        fonts.font_data.insert(
            "ui-bold".to_owned(),
            std::sync::Arc::new(egui::FontData::from_owned(bytes)),
        );
        bold_chain.insert(0, "ui-bold".to_owned());
    }

    fonts
        .families
        .insert(egui::FontFamily::Proportional, proportional);
    fonts
        .families
        .insert(egui::FontFamily::Name(BOLD_FAMILY.into()), bold_chain);

    ctx.set_fonts(fonts);
}

/// Global egui style tuned to the stylesheet (no widget chrome, our own cursors).
pub fn install_style(ctx: &egui::Context) {
    let mut style = (*ctx.style_of(egui::Theme::Dark)).clone();
    style.spacing.item_spacing = Vec2::new(8.0, 8.0);
    style.spacing.window_margin = egui::Margin::ZERO;
    style.visuals = egui::Visuals::dark();
    style.visuals.panel_fill = BG;
    style.visuals.window_fill = CARD;
    style.visuals.override_text_color = Some(TEXT);
    style.visuals.selection.bg_fill = BLUE_SOFT;
    style.visuals.selection.stroke = Stroke::new(1.0, THUMB);
    ctx.set_style_of(egui::Theme::Dark, style);
}
