# Pluto Rust backend

The native egui frontend calls these Rust crates directly. The Tauri desktop
crate is excluded from the active workspace while its old implementation is
kept in `desktop/src-tauri` as migration reference code.

## Crates

- `timeline-core/` stores, validates, and indexes timeline clips and tracks.
- `media-engine/` owns FFprobe metadata helpers and FFmpeg filter/export logic;
  it has no UI framework dependency and is shared by egui.
- `pixel-core/` provides safe RGBA/BGRA reference operations and runtime CPU
  dispatch. FFmpeg remains the export pixel engine until end-to-end measurements
  show that raw-frame integration is beneficial.

Clip properties, transitions, titles, and audio settings are serialized into
the timeline snapshot and read by `media-engine` for export. FFmpeg and FFprobe
can be found on `PATH`, through `PLUTO_FFMPEG_DIR`, or in the portable app's
sibling `ffmpeg/` directory.

## Checks and portable build

- `.github/workflows/rust-core.yml` runs workspace checks, tests, and core
  benchmarks on Linux.
- `.github/workflows/frontdoor-egui.yml` checks and tests the native app and
  Rust workspace, builds Pluto on Windows, caches FFmpeg, and uploads a
  portable ZIP artifact.

Rust checks have not been run locally in this environment because the Rustup
installation has no configured default toolchain. The CI workflows run each
check independently and continue through build/package steps so failures are
reported together.
