# Pluto native frontend

This is the active desktop frontend. Pluto is moving from the Tauri webview to
**egui** while keeping the existing `Frontdoor` layout, colors, spacing, and
editor behavior as the reference. The web implementation remains in the repo
for comparison during the migration; the native build does not load it.

## Current native surface

- Custom Pluto title bar, library, preview/transport, inspector, and timeline
  panels using the existing theme tokens and icon set.
- FFprobe based media metadata, FFmpeg thumbnails and real audio waveforms,
  imported on a single background worker.
- Timeline clips, lane expansion, drag/drop, snapping, razor split, scrubbing,
  zoom/pan, frame stepping, and undo/redo.
- Native FFmpeg preview for the active video clip and exported timeline, using
  the shared media engine in `Backdoor/media-engine`.
- Transform, color, effect, title, transition, and audio-detach controls write
  to the same clip properties consumed by the exporter.

## Migration status

The shell and core editing path are in progress; this is not yet full behavior
parity with the web editor. Multi-track preview compositing, synced audio
playback, multi-selection/group workflows, complete keyframe editing, project
save/load, and pixel-level styling of every inspector widget still need to be
ported and validated. Exported effects and transitions are
handled by the shared FFmpeg engine, but the preview does not yet composite
every layer or transition in the same way as export.

## Run

```powershell
cd Frontdoor-egui
cargo run
```

Install FFmpeg and FFprobe on `PATH`, set `PLUTO_FFMPEG_DIR`, or keep them in an
`ffmpeg` directory beside `Pluto.exe`. The Windows Actions workflow caches
those tools, checks the egui and backend crates, and uploads a portable ZIP
with the application and FFmpeg runtime.

## Visual reference

`src/theme.rs` holds the palette, panel geometry, spacing, radii, and type
scale from `Frontdoor/styles/app.css`. `src/icons.rs` embeds the same icon
shapes. Custom painting preserves the major panel and timeline styling while
egui widgets provide native controls inside the inspector.
