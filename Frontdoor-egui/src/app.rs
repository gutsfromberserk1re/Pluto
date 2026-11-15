//! Editor shell: the `.ed` grid from app.css:413-425 plus its four regions.
//!
//! Milestone 1 renders the real geometry and chrome (top bar, media column,
//! preview + transport, inspector column, timeline with ruler/tracks) so the
//! window is pixel-comparable with the web build. Panel *contents* and the
//! clip/timeline engine land in the following milestones.

use egui::{
    Align2, Color32, CornerRadius, FontId, Pos2, Rect, Response, Sense, Stroke, StrokeKind, Ui, Vec2,
};

use crate::{icons, theme};

const LOGO_ICO: &[u8] = include_bytes!("../../Frontdoor/assets/pluto-icon.ico");

#[derive(Clone, Copy, PartialEq, Eq)]
enum Kind {
    Video,
    Audio,
}

struct Track {
    id: &'static str,
    kind: Kind,
    visible: bool,
    muted: bool,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Tool {
    Cursor,
    Razor,
    Hand,
}

pub struct PlutoApp {
    name: String,
    playing: bool,
    playhead: f64,
    duration: f64,
    fps: f64,
    zoom: f32,
    tool: Tool,
    magnet: bool,
    selected_track: Option<usize>,
    tracks: Vec<Track>,
    logo: Option<egui::TextureHandle>,
    search: String,
}

impl PlutoApp {
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        theme::install_fonts(&cc.egui_ctx);
        theme::install_style(&cc.egui_ctx);

        let logo = load_logo(&cc.egui_ctx);

        let mut tracks = Vec::new();
        for id in ["v4", "v3", "v2", "v1"] {
            tracks.push(Track {
                id,
                kind: Kind::Video,
                visible: id == "v1",
                muted: false,
            });
        }
        for id in ["a2", "a1"] {
            tracks.push(Track {
                id,
                kind: Kind::Audio,
                visible: id == "a1",
                muted: false,
            });
        }

        Self {
            name: "Untitled project".to_owned(),
            playing: false,
            playhead: 0.0,
            duration: 10.0,
            fps: 30.0,
            zoom: 1.0,
            tool: Tool::Cursor,
            magnet: true,
            selected_track: None,
            tracks,
            logo,
            search: String::new(),
        }
    }

    fn tick(&mut self, ctx: &egui::Context) {
        if self.playing {
            let dt = ctx.input(|i| i.stable_dt).min(0.1) as f64;
            self.playhead += dt;
            if self.playhead >= self.duration {
                self.playhead = self.duration;
                self.playing = false;
            }
            ctx.request_repaint();
        }
    }
}

impl eframe::App for PlutoApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        self.tick(ctx);

        egui::CentralPanel::default()
            .frame(egui::Frame::default().fill(theme::BG))
            .show(ctx, |ui| {
                self.shell(ui);
            });
    }
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

impl PlutoApp {
    fn shell(&mut self, ui: &mut Ui) {
        let full = ui.max_rect();
        let painter = ui.painter().clone();

        painter.rect_filled(full, CornerRadius::ZERO, theme::BG);

        // Row 1 — the top bar spans the full width (`margin: 0 -10px`).
        let top = Rect::from_min_size(full.min, Vec2::new(full.width(), theme::ROW_TOP));
        self.top_bar(ui, top);

        // Rows 2/3 live inside the 10px horizontal / bottom padding.
        let x0 = full.min.x + theme::PAD_X;
        let x1 = full.max.x - theme::PAD_X;
        let y0 = full.min.y + theme::ROW_TOP + theme::GAP;
        let y_bottom = full.max.y - theme::PAD_BOTTOM;

        let tl_h = theme::ROW_TIMELINE
            .min(((y_bottom - y0).max(0.0)) * 0.6)
            .max(0.0);
        let mid_h = (y_bottom - y0 - theme::GAP - tl_h).max(0.0);

        let narrow = full.width() <= theme::MEDIA_BREAKPOINT;
        let media_w = if narrow { 0.0 } else { theme::COL_MEDIA };
        let inspector_w = if narrow { 400.0 } else { theme::COL_INSPECTOR };

        let mut left = x0;
        if !narrow {
            // `grid-area: media` — row 2 only.
            let media = Rect::from_min_size(Pos2::new(left, y0), Vec2::new(media_w, mid_h));
            self.media_column(ui, media);
            left += media_w + theme::GAP;
        }

        let inspector_x = x1 - inspector_w;
        let preview = Rect::from_min_size(
            Pos2::new(left, y0),
            Vec2::new((inspector_x - theme::GAP - left).max(0.0), mid_h),
        );
        self.preview(ui, preview);

        let inspector = Rect::from_min_size(
            Pos2::new(inspector_x, y0),
            Vec2::new(inspector_w, mid_h),
        );
        self.inspector(ui, inspector);

        let timeline = Rect::from_min_size(
            Pos2::new(x0, y0 + mid_h + theme::GAP),
            Vec2::new(x1 - x0, tl_h),
        );
        self.timeline(ui, timeline);
    }

    // -- top bar ------------------------------------------------------------

    fn top_bar(&mut self, ui: &mut Ui, rect: Rect) {
        let painter = ui.painter().clone();
        painter.rect_filled(rect, CornerRadius::ZERO, theme::TOP_BG);
        theme::hairline(
            &painter,
            Rect::from_min_size(Pos2::new(rect.min.x, rect.max.y - 1.0), Vec2::new(rect.width(), 1.0)),
            theme::BORDER,
        );

        let mid_y = rect.center().y;

        // `.ed-logo` — 30×30, radius 8.
        let logo_rect = Rect::from_center_size(
            Pos2::new(rect.min.x + 14.0 + 15.0, mid_y),
            Vec2::splat(30.0),
        );
        match &self.logo {
            Some(tex) => {
                painter.image(
                    tex.id(),
                    logo_rect,
                    Rect::from_min_max(Pos2::ZERO, Pos2::new(1.0, 1.0)),
                    Color32::WHITE,
                );
            }
            None => {
                painter.rect_filled(logo_rect, CornerRadius::same(8), theme::BLUE);
            }
        }

        // `.ed-brand`
        let brand = painter.text(
            Pos2::new(logo_rect.max.x + 12.0, mid_y),
            Align2::LEFT_CENTER,
            "Pluto",
            theme::bold(theme::FONT_BRAND),
            theme::TEXT,
        );

        // WINDOW CONTROLS — `.ed-window-controls { margin-right: -16px }`
        let mut right = rect.max.x;
        let wc_w = 44.0 * 3.0;
        let controls = Rect::from_min_max(
            Pos2::new(right - wc_w, rect.min.y),
            Pos2::new(right, rect.max.y),
        );
        right -= wc_w;

        let close = self.window_button(ui, &painter, controls, 2, "x", true);
        if close.clicked() {
            ui.ctx().send_viewport_cmd(egui::ViewportCommand::Close);
        }
        let maximize = self.window_button(ui, &painter, controls, 1, "windowMaximize", false);
        if maximize.clicked() {
            let maximized = ui.ctx().input(|i| i.viewport().maximized.unwrap_or(false));
            ui.ctx()
                .send_viewport_cmd(egui::ViewportCommand::Maximized(!maximized));
        }
        let minimize = self.window_button(ui, &painter, controls, 0, "windowMinimize", false);
        if minimize.clicked() {
            ui.ctx()
                .send_viewport_cmd(egui::ViewportCommand::Minimized(true));
        }

        // `.ed-export`
        right -= 12.0;
        let export_w = 104.0;
        let export = Rect::from_center_size(
            Pos2::new(right - export_w * 0.5, mid_y),
            Vec2::new(export_w, 36.0),
        );
        right = export.min.x;

        let export_resp = ui.interact(export, egui::Id::new("ed-export"), Sense::click());
        painter.add(egui::Shape::mesh(theme::gradient_card(
            export,
            12.0,
            theme::EXPORT_TOP,
            theme::EXPORT_BOTTOM,
        )));
        painter.rect_stroke(
            export,
            CornerRadius::same(12),
            Stroke::new(1.0, theme::HAIRLINE),
            StrokeKind::Inside,
        );
        if export_resp.hovered() {
            painter.rect_filled(
                export,
                CornerRadius::same(12),
                Color32::from_rgba_premultiplied(12, 12, 12, 12),
            );
        }
        icons::draw_at(
            &painter,
            Pos2::new(export.min.x + 14.0 + 8.0, mid_y),
            16.0,
            "download",
            theme::TEXT,
        );
        painter.text(
            Pos2::new(export.min.x + 14.0 + 16.0 + 8.0, mid_y),
            Align2::LEFT_CENTER,
            "Export",
            theme::bold(14.0),
            theme::TEXT,
        );

        // `.ed-top__actions` — 38×38 icon buttons, 3px gap.
        right -= 8.0;
        let actions = [
            ("undo", "Undo"),
            ("redo", "Redo"),
            ("keyAdd", "Add keyframe"),
            ("grid", "Guides"),
        ];
        for (idx, (icon, label)) in actions.iter().enumerate().rev() {
            let b = Rect::from_center_size(
                Pos2::new(right - 19.0, mid_y),
                Vec2::splat(38.0),
            );
            let resp = self.icon_button(ui, &painter, b, ("top-action", idx), *icon, 20.0, theme::MUTED);
            let resp = resp.on_hover_text(*label);
            if resp.clicked() {
                // Wired up in a later milestone.
            }
            right = b.min.x - 3.0;
        }

        // `.ed-name` — 220×38
        let name_w = 220.0;
        let name_rect = Rect::from_center_size(
            Pos2::new(right - name_w * 0.5, mid_y),
            Vec2::new(name_w, 38.0),
        );
        let name_resp = ui.interact(name_rect, egui::Id::new("ed-name"), Sense::click());
        if name_resp.hovered() {
            theme::field(&painter, name_rect, 12, theme::FIELD);
        }
        painter.text(
            Pos2::new(name_rect.min.x + 12.0, mid_y),
            Align2::LEFT_CENTER,
            &self.name,
            theme::font(theme::FONT_BASE),
            theme::TEXT,
        );
        right = name_rect.min.x;

        // `.ed-top__drag` — everything between the brand and the name field
        // drags the window.
        let drag = Rect::from_min_max(
            Pos2::new(brand.max.x + 12.0, rect.min.y),
            Pos2::new((right - 12.0).max(brand.max.x + 36.0), rect.max.y),
        );
        let drag_resp = ui.interact(drag, egui::Id::new("ed-drag"), Sense::drag());
        if drag_resp.drag_started() {
            ui.ctx()
                .send_viewport_cmd(egui::ViewportCommand::StartDrag);
        }
        if drag_resp.hovered() {
            ui.ctx().set_cursor_icon(egui::CursorIcon::Grab);
        }
    }

    fn window_button(
        &self,
        ui: &mut Ui,
        painter: &egui::Painter,
        controls: Rect,
        index: usize,
        icon: &str,
        close: bool,
    ) -> Response {
        let w = 44.0;
        let x = controls.max.x - w * (index as f32 + 1.0);
        let rect = Rect::from_min_size(Pos2::new(x, controls.min.y), Vec2::new(w, controls.height()));
        let resp = ui.interact(
            rect,
            egui::Id::new(("ed-wc", index)),
            Sense::click(),
        );
        if resp.hovered() {
            painter.rect_filled(
                rect,
                CornerRadius::ZERO,
                if close { theme::CLOSE_HOVER } else { theme::HOVER_STRONG },
            );
        }
        let color = if resp.hovered() && close { Color32::WHITE } else if resp.hovered() { theme::TEXT } else { theme::MUTED };
        icons::draw_at(painter, rect.center(), 16.0, icon, color);
        resp.on_hover_cursor(egui::CursorIcon::PointingHand)
    }

    fn icon_button(
        &self,
        ui: &mut Ui,
        painter: &egui::Painter,
        rect: Rect,
        id: impl std::hash::Hash,
        icon: &str,
        icon_size: f32,
        tint: Color32,
    ) -> Response {
        let resp = ui.interact(rect, egui::Id::new(id), Sense::click());
        let hovered = resp.hovered();
        if hovered {
            painter.rect_filled(rect, CornerRadius::same(13), theme::HOVER);
        }
        icons::draw_at(
            painter,
            rect.center(),
            icon_size,
            icon,
            if hovered { theme::TEXT } else { tint },
        );
        resp.on_hover_cursor(egui::CursorIcon::PointingHand)
    }

    // -- media column -------------------------------------------------------

    fn media_column(&mut self, ui: &mut Ui, rect: Rect) {
        let painter = ui.painter().clone();
        theme::card(&painter, rect);

        let inner = rect.shrink2(Vec2::new(14.0, 14.0));
        let head_y = inner.min.y + 10.0;
        icons::draw_at(
            &painter,
            Pos2::new(inner.min.x + 9.0, head_y + 10.0),
            20.0,
            "folder",
            theme::MUTED,
        );
        painter.text(
            Pos2::new(inner.min.x + 34.0, head_y + 10.0),
            Align2::LEFT_CENTER,
            "Media",
            theme::bold(theme::FONT_CARD_HEAD),
            theme::TEXT,
        );

        // `.ed-searchwrap` — 40px tall, radius 13.
        let search = Rect::from_min_size(
            Pos2::new(inner.min.x, head_y + 34.0),
            Vec2::new(inner.width(), 40.0),
        );
        theme::field(&painter, search, 13, theme::FIELD);
        icons::draw_at(
            &painter,
            Pos2::new(search.min.x + 12.0 + 8.0, search.center().y),
            16.0,
            "search",
            theme::MUTED,
        );
        let label = if self.search.is_empty() {
            "Search media"
        } else {
            self.search.as_str()
        };
        painter.text(
            Pos2::new(search.min.x + 12.0 + 16.0 + 8.0, search.center().y),
            Align2::LEFT_CENTER,
            label,
            theme::font(14.0),
            if self.search.is_empty() { theme::MUTED } else { theme::TEXT },
        );

        // Empty state: the real app shows import tiles here.
        let empty_y = search.max.y + 40.0;
        icons::draw_at(
            &painter,
            Pos2::new(rect.center().x, empty_y),
            28.0,
            "upload",
            theme::MUTED,
        );
        painter.text(
            Pos2::new(rect.center().x, empty_y + 30.0),
            Align2::CENTER_CENTER,
            "Import media",
            theme::font(theme::FONT_SMALL),
            theme::MUTED,
        );
        let _ = ui;
    }

    // -- preview ------------------------------------------------------------

    fn preview(&mut self, ui: &mut Ui, rect: Rect) {
        let painter = ui.painter().clone();
        theme::card(&painter, rect);

        // `.ed-stage` — width: min(100cqw - 28, (100cqh - 104) * 16/9)
        let avail_w = (rect.width() - 28.0).max(0.0);
        let avail_h = (rect.height() - 104.0).max(0.0);
        let stage_w = avail_w.min(avail_h * 16.0 / 9.0);
        let stage_h = stage_w * 9.0 / 16.0;
        let stage = Rect::from_center_size(
            Pos2::new(rect.center().x, rect.min.y + (rect.height() - 104.0) * 0.5),
            Vec2::new(stage_w, stage_h),
        );

        // `.ed-frame`
        painter.rect_filled(stage, CornerRadius::same(12), Color32::BLACK);
        painter.rect_stroke(
            stage,
            CornerRadius::same(12),
            Stroke::new(1.0, theme::HAIRLINE),
            StrokeKind::Inside,
        );

        // `.ed-transport` — grid 1fr auto 1fr, padding 12 16 14.
        let bar_h = 56.0;
        let bar = Rect::from_min_size(
            Pos2::new(rect.min.x, rect.max.y - bar_h),
            Vec2::new(rect.width(), bar_h),
        );
        let mid_y = bar.center().y;

        // Left: current / total timecode.
        let tc = Rect::from_min_size(
            Pos2::new(bar.min.x + 16.0, mid_y - 11.0),
            Vec2::new(bar.width() / 3.0, 22.0),
        );
        let cur = painter.text(
            Pos2::new(tc.min.x, mid_y),
            Align2::LEFT_CENTER,
            timecode(self.playhead, self.fps),
            theme::bold(theme::FONT_TC),
            theme::TEXT,
        );
        let sep = painter.text(
            Pos2::new(cur.max.x + 8.0, mid_y),
            Align2::LEFT_CENTER,
            "/",
            theme::font(theme::FONT_TC),
            theme::MUTED,
        );
        painter.text(
            Pos2::new(sep.max.x + 8.0, mid_y),
            Align2::LEFT_CENTER,
            timecode(self.duration, self.fps),
            theme::font(theme::FONT_TC),
            theme::MUTED,
        );

        // Middle: skip back / play / skip forward.
        let cx = bar.center().x;
        let play_rect = Rect::from_center_size(Pos2::new(cx, mid_y), Vec2::splat(38.0));
        let back_rect = Rect::from_center_size(
            Pos2::new(play_rect.min.x - 6.0 - 19.0, mid_y),
            Vec2::splat(38.0),
        );
        let fwd_rect = Rect::from_center_size(
            Pos2::new(play_rect.max.x + 6.0 + 19.0, mid_y),
            Vec2::splat(38.0),
        );

        if self
            .icon_button(ui, &painter, back_rect, "tr-back", "skipBack", 20.0, theme::MUTED)
            .clicked()
        {
            self.playhead = 0.0;
        }
        let play = self.icon_button(
            ui,
            &painter,
            play_rect,
            "tr-play",
            if self.playing { "pause" } else { "play" },
            20.0,
            theme::TEXT,
        );
        if play.clicked() {
            self.playing = !self.playing;
        }
        if self
            .icon_button(ui, &painter, fwd_rect, "tr-fwd", "skipForward", 20.0, theme::MUTED)
            .clicked()
        {
            self.playhead = self.duration;
        }

        // Right: zoom.
        let zoom_rect = Rect::from_center_size(
            Pos2::new(bar.max.x - 16.0 - 19.0, mid_y),
            Vec2::splat(38.0),
        );
        if self
            .icon_button(ui, &painter, zoom_rect, "tr-zoomin", "zoomIn", 20.0, theme::MUTED)
            .clicked()
        {
            self.zoom = (self.zoom * 1.25).min(8.0);
        }
        let zoom_out = Rect::from_center_size(
            Pos2::new(zoom_rect.min.x - 3.0 - 38.0 - 3.0 - 19.0, mid_y),
            Vec2::splat(38.0),
        );
        if self
            .icon_button(ui, &painter, zoom_out, "tr-zoomout", "zoomOut", 20.0, theme::MUTED)
            .clicked()
        {
            self.zoom = (self.zoom / 1.25).max(0.25);
        }
        painter.text(
            Pos2::new(zoom_rect.min.x - 3.0 - 38.0, mid_y),
            Align2::RIGHT_CENTER,
            format!("{:.0}%", self.zoom * 100.0),
            theme::font(theme::FONT_SMALL),
            theme::MUTED,
        );
    }

    // -- inspector ----------------------------------------------------------

    fn inspector(&mut self, ui: &mut Ui, rect: Rect) {
        let painter = ui.painter().clone();
        theme::card(&painter, rect);

        let inner = rect.shrink2(Vec2::new(14.0, 14.0));

        // Panel head — `.tp-head`, 6px/8px padding, 30px icon.
        let head = Rect::from_min_size(inner.min, Vec2::new(inner.width(), 42.0));
        icons::draw_at(
            &painter,
            Pos2::new(head.min.x + 8.0 + 15.0, head.center().y),
            30.0,
            "crop",
            theme::MUTED,
        );
        painter.text(
            Pos2::new(head.min.x + 8.0 + 30.0 + 14.0, head.center().y),
            Align2::LEFT_CENTER,
            "Transform",
            FontId::new(theme::FONT_TITLE, egui::FontFamily::Name(theme::BOLD_FAMILY.into())),
            theme::TEXT,
        );

        // Section cards (`tp-nav-btn`: 64px tall, radius 22).
        let labels = [
            ("crop", "Crop Tools"),
            ("scale", "Scale"),
            ("position", "Position"),
            ("distort", "Distort"),
        ];
        let mut y = head.max.y + 12.0;
        for (icon, label) in labels {
            if y + 64.0 > inner.max.y {
                break;
            }
            let row = Rect::from_min_size(
                Pos2::new(inner.min.x, y),
                Vec2::new(inner.width(), 64.0),
            );
            painter.rect_filled(row, CornerRadius::same(theme::INNER_RADIUS), theme::CARD);
            painter.rect_stroke(
                row,
                CornerRadius::same(theme::INNER_RADIUS),
                Stroke::new(1.0, theme::BORDER),
                StrokeKind::Inside,
            );
            icons::draw_at(
                &painter,
                Pos2::new(row.min.x + 18.0 + 14.0, row.center().y),
                28.0,
                icon,
                theme::MUTED,
            );
            painter.text(
                Pos2::new(row.min.x + 18.0 + 28.0 + 14.0, row.center().y),
                Align2::LEFT_CENTER,
                label,
                theme::font(theme::FONT_TC),
                theme::TEXT,
            );
            icons::draw_at(
                &painter,
                Pos2::new(row.max.x - 16.0 - 11.0, row.center().y),
                22.0,
                "chevRight",
                theme::MUTED,
            );
            y += 64.0 + 12.0;
        }
        let _ = ui;
    }

    // -- timeline -----------------------------------------------------------

    fn timeline(&mut self, ui: &mut Ui, rect: Rect) {
        let painter = ui.painter().clone();
        theme::card(&painter, rect);

        // `.ed-tl-bar`
        let bar_h = theme::TL_BAR_PAD_Y * 2.0 + 24.0;
        let bar = Rect::from_min_size(rect.min, Vec2::new(rect.width(), bar_h));
        theme::hairline(
            &painter,
            Rect::from_min_size(Pos2::new(bar.min.x, bar.max.y - 1.0), Vec2::new(bar.width(), 1.0)),
            theme::BORDER,
        );

        let tools = [
            (Tool::Cursor, "cursor"),
            (Tool::Razor, "scissors"),
            (Tool::Hand, "hand"),
        ];
        let mut x = bar.min.x + theme::TL_BAR_PAD_X;
        for (tool, icon) in tools {
            let b = Rect::from_center_size(
                Pos2::new(x + 19.0, bar.center().y),
                Vec2::splat(38.0),
            );
            let active = self.tool == tool;
            let resp = ui.interact(b, egui::Id::new(("tl-tool", icon)), Sense::click());
            if active {
                painter.rect_filled(b, CornerRadius::same(13), theme::TOOL_ACTIVE);
            } else if resp.hovered() {
                painter.rect_filled(b, CornerRadius::same(13), theme::HOVER);
            }
            icons::draw_at(
                &painter,
                b.center(),
                20.0,
                icon,
                if active { theme::TEXT } else { theme::MUTED },
            );
            if resp.clicked() {
                self.tool = tool;
            }
            x += 38.0 + 6.0;
        }

        // Magnet toggle
        x += 4.0;
        let mag = Rect::from_center_size(
            Pos2::new(x + 19.0, bar.center().y),
            Vec2::splat(38.0),
        );
        let mag_resp = ui.interact(mag, egui::Id::new("tl-magnet"), Sense::click());
        if self.magnet {
            painter.rect_filled(mag, CornerRadius::same(13), theme::BLUE_SOFT);
        } else if mag_resp.hovered() {
            painter.rect_filled(mag, CornerRadius::same(13), theme::HOVER);
        }
        icons::draw_at(
            &painter,
            mag.center(),
            20.0,
            "magnet",
            if self.magnet { theme::BLUE } else { theme::MUTED },
        );
        if mag_resp.clicked() {
            self.magnet = !self.magnet;
        }

        // `.ed-tl-body { grid-template-columns: 64px 1fr }`
        let body = Rect::from_min_max(
            Pos2::new(rect.min.x, bar.max.y),
            Pos2::new(rect.max.x, rect.max.y),
        );
        let labels = Rect::from_min_size(body.min, Vec2::new(theme::TL_LABEL_COL, body.height()));
        let content = Rect::from_min_max(
            Pos2::new(labels.max.x, body.min.y),
            Pos2::new(body.max.x, body.max.y),
        );
        theme::hairline(
            &painter,
            Rect::from_min_size(Pos2::new(labels.max.x - 1.0, body.min.y), Vec2::new(1.0, body.height())),
            theme::BORDER,
        );

        let visible: Vec<usize> = self
            .tracks
            .iter()
            .enumerate()
            .filter(|(_, t)| t.visible)
            .map(|(i, _)| i)
            .collect();

        let tracks_h = visible.len() as f32 * theme::TL_TRACK_H;
        let free = body.height() - theme::TL_RULER_H - tracks_h;
        let tracks_top = body.min.y + theme::TL_RULER_H + (free * 0.5).max(0.0);

        // Ruler
        let ruler = Rect::from_min_size(
            content.min,
            Vec2::new(content.width(), theme::TL_RULER_H),
        );
        theme::hairline(
            &painter,
            Rect::from_min_size(
                Pos2::new(ruler.min.x, ruler.max.y - 1.0),
                Vec2::new(ruler.width(), 1.0),
            ),
            theme::BORDER,
        );

        let pps = (content.width() / self.duration as f32) * self.zoom;
        let x_of = |t: f64| content.min.x + t as f32 * pps;

        let step = if pps >= 90.0 {
            0.5
        } else if pps >= 45.0 {
            1.0
        } else if pps >= 20.0 {
            2.0
        } else {
            5.0
        };
        let mut t = 0.0_f64;
        while t <= self.duration + 1e-9 {
            let px = x_of(t);
            if px > content.max.x {
                break;
            }
            let per_step = if step < 1.0 { 2i64 } else { 1i64 };
            let major = ((t / step).round() as i64) % per_step == 0;
            let h = if major { 12.0 } else { 6.0 };
            painter.rect_filled(
                Rect::from_min_size(Pos2::new(px, ruler.max.y - 6.0 - h), Vec2::new(1.0, h)),
                CornerRadius::ZERO,
                if major { theme::MUTED } else { theme::BORDER },
            );
            if major {
                painter.text(
                    Pos2::new(px + 4.0, ruler.min.y + 3.0),
                    Align2::LEFT_TOP,
                    format_seconds(t),
                    theme::font(11.0),
                    theme::MUTED,
                );
            }
            t += step;
        }

        // Track rows
        for (slot, idx) in visible.iter().enumerate() {
            let top = tracks_top + slot as f32 * theme::TL_TRACK_H;
            let row = Rect::from_min_size(
                Pos2::new(content.min.x, top),
                Vec2::new(content.width(), theme::TL_TRACK_H),
            );
            if slot % 2 == 1 {
                painter.rect_filled(row, CornerRadius::ZERO, theme::ZEBRA);
            }
            theme::hairline(
                &painter,
                Rect::from_min_size(
                    Pos2::new(row.min.x, row.max.y - 1.0),
                    Vec2::new(row.width(), 1.0),
                ),
                theme::TRACK_LINE,
            );

            let label = Rect::from_min_size(
                Pos2::new(labels.min.x, top),
                Vec2::new(labels.width(), theme::TL_TRACK_H),
            );
            let track = &self.tracks[*idx];
            let selected = self.selected_track == Some(*idx);
            if selected {
                painter.rect_filled(label, CornerRadius::ZERO, theme::HOVER);
            }
            theme::hairline(
                &painter,
                Rect::from_min_size(
                    Pos2::new(label.min.x, label.max.y - 1.0),
                    Vec2::new(label.width(), 1.0),
                ),
                theme::TRACK_LINE,
            );
            let glyph = match track.kind {
                Kind::Video => "video",
                Kind::Audio => "music",
            };
            icons::draw_at(
                &painter,
                Pos2::new(label.center().x, label.center().y - 6.0),
                14.0,
                glyph,
                if selected { theme::TEXT } else { theme::MUTED },
            );
            painter.text(
                Pos2::new(label.center().x, label.center().y + 11.0),
                Align2::CENTER_CENTER,
                track.id,
                theme::bold(theme::FONT_TINY),
                if selected { theme::TEXT } else { theme::MUTED },
            );
            let resp = ui.interact(
                label,
                egui::Id::new(("tl-label", *idx)),
                Sense::click(),
            );
            if resp.clicked() {
                self.selected_track = Some(*idx);
            }
        }

        // Scrub interaction across the ruler.
        let scrub = Rect::from_min_max(
            Pos2::new(content.min.x, ruler.min.y),
            Pos2::new(content.max.x, body.max.y),
        );
        let resp = ui.interact(scrub, egui::Id::new("tl-scrub"), Sense::click_and_drag());
        if resp.clicked() || resp.dragged() {
            if let Some(pos) = ui.ctx().pointer_interact_pos() {
                let t = ((pos.x - content.min.x) / pps.max(0.001)).clamp(0.0, self.duration as f32);
                self.playhead = t as f64;
            }
        }

        // Playhead
        let px = x_of(self.playhead);
        if px >= content.min.x && px <= content.max.x {
            painter.rect_filled(
                Rect::from_min_size(Pos2::new(px - 0.75, ruler.min.y + 4.0), Vec2::new(1.5, body.height() - 4.0)),
                CornerRadius::ZERO,
                theme::RED,
            );
            painter.add(egui::Shape::convex_polygon(
                vec![
                    Pos2::new(px - 5.0, ruler.min.y),
                    Pos2::new(px + 5.0, ruler.min.y),
                    Pos2::new(px, ruler.min.y + 6.0),
                ],
                theme::RED,
                Stroke::NONE,
            ));
        }
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn load_logo(ctx: &egui::Context) -> Option<egui::TextureHandle> {
    let img = image::load_from_memory_with_format(LOGO_ICO, image::ImageFormat::Ico)
        .ok()?
        .to_rgba8();
    let size = [img.width() as usize, img.height() as usize];
    let color = egui::ColorImage::from_rgba_unmultiplied(size, img.as_raw());
    Some(ctx.load_texture("pluto-logo", color, egui::TextureOptions::LINEAR))
}

/// `HH:MM:SS:FF` — the transport uses tabular timecode in the web build.
fn timecode(t: f64, fps: f64) -> String {
    let fps = fps.max(1.0);
    let frames_total = (t.max(0.0) * fps).round() as u64;
    let per_sec = fps.round() as u64;
    let f = frames_total % per_sec;
    let secs = frames_total / per_sec;
    format!(
        "{:02}:{:02}:{:02}:{:02}",
        secs / 3600,
        (secs / 60) % 60,
        secs % 60,
        f
    )
}

fn format_seconds(t: f64) -> String {
    if (t.fract()).abs() < 1e-6 {
        format!("{}s", t as i64)
    } else {
        format!("{:.1}s", t)
    }
}
