//! Pluto — native egui frontend.
//!
//! Native egui migration of the `Frontdoor` web editor. The Frontdoor files
//! remain the visual and behavior reference while the native editing surface
//! is brought to feature parity.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app;
mod icons;
mod theme;

fn main() -> eframe::Result<()> {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title("Pluto")
            .with_app_id("pluto")
            .with_inner_size([1440.0, 900.0])
            .with_min_inner_size([1000.0, 640.0])
            // The web frontend draws its own title bar (`.ed-top`) and its own
            // min/max/close buttons, so the OS decorations are switched off to
            // keep the layout identical.
            .with_decorations(false),
        ..Default::default()
    };

    eframe::run_native(
        "Pluto",
        options,
        Box::new(|cc| Ok(Box::new(app::PlutoApp::new(cc)))),
    )
}
