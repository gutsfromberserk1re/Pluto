# Benchmark result files

The commands in [`../PERFORMANCE.md`](../PERFORMANCE.md) write local CSV results here. These machine-specific measurements are intentionally not committed. The GitHub Actions workflow uploads timeline, pixel, headless Chromium preview, and fixture-backed FFprobe/FFmpeg media-import results as the `Pluto-Performance-Benchmarks` artifact.

`media.py` generates its video fixture in a temporary directory and removes it after the run. `preview.mjs` launches the Frontdoor at several deterministic timeline sizes. Install its pinned Playwright dependency and Chromium browser as shown in `../PERFORMANCE.md` before running it.
