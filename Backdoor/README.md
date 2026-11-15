# Pluto backend

## What is connected

- `timeline-core/` stores and validates the clip snapshot sent by the Frontdoor, including track, timing, trim, link, transform, effect, and audio properties. The pointer-driven drag preview remains in the Frontdoor; each committed edit is synchronized to this Rust state.
- `desktop/src-tauri/` provides native media selection and FFprobe metadata, cancellable FFmpeg export, export progress, and the Tauri commands used by the interface.
- Import returns FFprobe metadata before generating preview assets. Thumbnail, filmstrip, and waveform jobs run in a bounded worker queue, suppress duplicate work, and use a capped in-memory cache.
- Timeline active-clip and adjacency queries use private indexes that are invalidated by timeline mutations; those indexes are excluded from the serialized project state.
- `pixel-core/` contains safe, stride-aware RGBA/BGRA reference operations and runtime-dispatched format conversion. FFmpeg remains the active export pixel engine until end-to-end measurements justify integrating raw-frame operations.
- `Frontdoor/scripts/tauri-timeline.js` is the invoke bridge. `window.plutoTimeline` exposes timeline state and editing commands; `window.plutoNative` handles import, export, progress, and file URLs.
- Video and image effects, transforms, titles, audio adjustments, and audio effects are sent with clip state and applied during FFmpeg export. The Frontdoor also previews them while editing.

## GitHub Actions build

`.github/workflows/rust-tauri.yml` checks and tests the workspace, checks Frontdoor JavaScript syntax, compares timeline/pixel optimized paths with scalar or linear references, runs headless Chromium smoke checks for timeline editing and keyframes, measures Frontdoor preview performance, and benchmarks FFprobe/FFmpeg media import with a generated fixture. The Windows job caches FFmpeg, builds Pluto, and uploads a portable ZIP as `Pluto-Portable-Windows`; the Linux job uploads `Pluto-Performance-Benchmarks` with CSV timing output.

See [`PERFORMANCE.md`](PERFORMANCE.md) for benchmark instructions, CPU compatibility notes, and current optimization limits.

For local development, install FFmpeg and FFprobe on `PATH`, or set `PLUTO_FFMPEG_DIR` to the directory containing both executables.
