# Performance work

## Timeline benchmark

The standalone timeline benchmark compares each indexed query with a linear reference implementation using the same clip set. It covers active interval lookup and transition-neighbor lookup for 100, 500, and 1,000 clips, with 1,000 warmup iterations and seven samples of 5,000 operations each. Its CSV rows report mean, median, p95 latency, and operations per second. A comment line records architecture and individually detected x86 features. This is an algorithmic reference comparison, not a historical build-to-build benchmark.

Run from the repository root in PowerShell:

```powershell
cargo bench --manifest-path Backdoor/timeline-core/Cargo.toml --bench timeline > Backdoor/benchmarks/timeline-latest.csv
```

Each run replaces `timeline-latest.csv`; keep copies elsewhere when comparing machines or revisions. Run the command on an otherwise idle machine and compare multiple runs. These timings are informational and are not used as unit-test pass/fail thresholds.

The pixel benchmark covers brightness and contrast, saturation, alpha compositing, RGBA/BGRA conversion, and bilinear resize at 1280×720. It reports the same timing fields plus pixel throughput:

```powershell
cargo bench --manifest-path Backdoor/pixel-core/Cargo.toml --bench pixels > Backdoor/benchmarks/pixel-latest.csv
```

It reports five warmup iterations and seven measured samples per operation, and compares scalar RGBA/BGRA conversion with runtime dispatch on the same host. The conversion implementation only uses AVX2 or SSE2 after runtime checks; machines without either use the scalar reference. SSE4.1, AVX-only, and FMA variants are not included because no measurements currently justify maintaining those paths.

The browser benchmark first smoke-checks preview, keyframe add/remove, clip move/trim/split/delete, and undo/redo. It then opens the actual Frontdoor in headless Chromium with deterministic timeline fixtures at 100, 500, and 1,000 clips. It times repeated preview renders after warmup using both the indexed active-candidate query and a linear scan over the same cached clip intervals, then reports mean, median, p95 render duration, and renders per second. This isolates the interval-query cost while holding rendering and compositing code constant. Install the pinned browser dependency and run it from the repository root:

```powershell
npm --prefix Backdoor/benchmarks install --no-package-lock --no-audit --no-fund
Backdoor/benchmarks/node_modules/.bin/playwright.cmd install chromium
node Backdoor/benchmarks/preview.mjs > Backdoor/benchmarks/preview-latest.csv
```

The media benchmark creates a synthetic 8-second 960×540 video with audio, then measures FFprobe metadata parsing, the production waveform FFmpeg graph, the thumbnail/filmstrip FFmpeg graph, and the combined metadata-plus-derived-assets import path. It includes subprocess and generated-asset base64 costs, but excludes Tauri queue wait time, WebView event delivery, and cache-hit latency. Run it with FFmpeg and FFprobe on `PATH`:

```powershell
python Backdoor/benchmarks/media.py > Backdoor/benchmarks/media-latest.csv
```

Set `PLUTO_BENCH_ITERATIONS` and `PLUTO_BENCH_WARMUP` to change the media benchmark sample counts. The default is three measured runs after one warmup. Both browser and media outputs record host architecture and CPU flags where the operating system exposes them. The pixel and timeline binaries record Rust runtime feature detection.

## CPU compatibility

Pluto does not set a global `target-cpu=native` flag. The timeline index uses safe standard-library operations and does not dispatch to optional CPU instructions. FFmpeg remains responsible for its own CPU feature detection and optimized media processing.

## Current implementation notes

- Timeline active clip lookup uses a per-track interval tree and returns clips in their original timeline order.
- Timeline ID and adjacency lookups use indexes rebuilt lazily after mutations. Transition adjacency keeps the editor's strict 50 ms match tolerance and first-match behavior.
- Preview candidates are queried from a cached interval tree. The existing transition and compositing calculations still decide which candidate layers are visible.
- Native media metadata returns before thumbnail, filmstrip, and waveform generation. Derived work uses one worker on hosts with at most two logical CPUs and two otherwise, suppresses duplicate jobs, generates video thumbnails and filmstrips in one FFmpeg video pass, limits derived FFmpeg filter threads, and keeps an in-memory LRU capped at 32 MiB.
- `pixel-core/` provides checked RGBA/BGRA views with explicit stride, scalar brightness/contrast, saturation, source-over blending, format conversion, and bilinear resizing. Format conversion dispatches to AVX2 or SSE2 only after runtime detection; no optional instruction is required by the baseline. The current editor has no native raw-frame path, so its FFmpeg export remains the active pixel-processing engine until an end-to-end benchmark demonstrates a benefit from integration.

## Results and limits

The GitHub Actions workflow runs timeline and pixel Rust benchmarks, a headless Chromium preview benchmark, and fixture-backed FFprobe/FFmpeg media benchmarks, then uploads their CSV output. The timeline, pixel conversion, and browser preview harnesses compare optimized paths with linear or scalar references in the same build and on the same host; they are algorithmic comparisons, not historical build-to-build measurements. The media benchmark captures the FFmpeg work but not Tauri queue delay or cache-hit latency. No CPU-feature-restricted virtual machines were available here. The current environment does not have Cargo, npm, or a local browser installed, so Rust tests, release builds, browser benchmarks, and Rust benchmark executables have not been run here. JavaScript syntax checks are available and have passed.
