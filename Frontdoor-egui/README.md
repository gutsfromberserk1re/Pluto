# Frontdoor-egui

Native **egui** re-implementation of the Pluto `Frontdoor` web editor.

The goal is visual and behavioural parity with `Frontdoor/index.html` +
`Frontdoor/styles/app.css` + `Frontdoor/scripts/app.js`, running as a normal
desktop process instead of inside a Tauri webview.

## Status

| Milestone | Scope | State |
| --------- | ----- | ----- |
| 1 | Crate, theme tokens, icon engine, editor shell (top bar, media, preview + transport, inspector, timeline) | **in progress** |
| 2 | Widget kit: number field w/ scrub, slider, segmented group, switch, accordion, colour wheel, rotation ruler, audio dial | not started |
| 3 | Inspector panels: Transform, Crop/Distort, Colors (HSL + wheels), Effects, Text, Export, Audio | not started |
| 4 | Timeline engine on `pluto-timeline-core`: tracks, clips, trim, drag, snapping, razor, zoom/pan | not started |
| 5 | Preview compositor: video frames, stills, CSS-equivalent filters, overlays, selection handles | not started |
| 6 | Media pipeline: ffprobe import, thumbnails, filmstrips, waveforms | not started |
| 7 | Export: `render_timeline` + `video_filters`/`audio_filters`, progress, cancel | not started |

## Build

```sh
cd Frontdoor-egui
cargo run --release
```

CI builds it on every push touching this directory — see
`.github/workflows/frontdoor-egui.yml` (artifact: `pluto-frontdoor-windows`).

## Layout fidelity notes

Everything is drawn on one custom-painted surface rather than composed from
egui's built-in widgets, because the stylesheet relies on values egui does not
expose (26px card radii, 270/1fr/420 grid columns, 318px timeline row, 6%
borders, `cubic-bezier(0.3, 1.6, 0.5, 1)` pop easing).

* `theme.rs` — every colour, radius, gap and font size is a named constant with
  the `app.css` line it came from.
* `theme::gradient_card` reproduces `linear-gradient(180deg,#1c1d20,#151618)`
  exactly as a fan-triangulated mesh, so rounded cards show no banding and no
  square corners.
* `icons.rs` embeds the 68 `ICONS` SVG sources verbatim and flattens them
  (paths with arcs, circles, ellipses, rounded rects, dash arrays) so glyphs
  match the web build's stroke weight of `1.8` on a 24-unit grid.
* Fonts: `Inter` when installed, otherwise the same platform fallback the
  browser picks (`Segoe UI` on Windows), with a semibold face registered as the
  `bold` family for `font-weight: 600/700`.

## Known gaps (milestone 1)

* Panel contents are placeholders; only the shell geometry is real.
* Timeline clips, keyframes and waveforms are not rendered yet.
* Hero/transition animations exist as constants only; egui needs explicit
  interpolation once the widgets land.
