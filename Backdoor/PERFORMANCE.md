# Performance work

## Timeline benchmark

The standalone timeline benchmark reports active interval lookup and transition-neighbor lookup for 100, 500, and 1,000 clips. It writes CSV rows containing the architecture, clip count, operation, iteration count, elapsed nanoseconds, average nanoseconds per operation, and operations per second. A comment line at the top records individually detected x86 features.

Run from the repository root in PowerShell:

```powershell
cargo bench --manifest-path Backdoor/timeline-core/Cargo.toml --bench timeline > Backdoor/benchmarks/timeline-latest.csv
```

Each run replaces `timeline-latest.csv`; keep copies elsewhere when comparing machines or revisions. Run the command on an otherwise idle machine and compare multiple runs. These timings are informational and are not used as unit-test pass/fail thresholds.

## CPU compatibility

Pluto does not set a global `target-cpu=native` flag. The timeline index uses safe standard-library operations and does not dispatch to optional CPU instructions. FFmpeg remains responsible for its own CPU feature detection and optimized media processing.

## Current implementation notes

- Timeline active clip lookup uses a per-track interval tree and returns clips in their original timeline order.
- Timeline ID and adjacency lookups use indexes rebuilt lazily after mutations. Transition adjacency keeps the editor's strict 50 ms match tolerance and first-match behavior.
- Preview candidates are queried from a cached interval tree. The existing transition and compositing calculations still decide which candidate layers are visible.
- Native media metadata returns before thumbnail, filmstrip, and waveform generation. Derived work uses two background workers, suppresses duplicate jobs, generates video thumbnails and filmstrips in one FFmpeg video pass, and keeps an in-memory LRU capped at 32 MiB.
- The preview path still uses DOM layers and HTML media elements. FFmpeg remains the native export pixel-processing path; this repository has no native raw-frame path that would demonstrate a benefit from a competing pixel engine.

## Results and limits

No before/after Rust benchmark numbers are checked in yet. The current environment does not have Cargo installed, so Rust tests, release builds, and the benchmark executable have not been run here. JavaScript syntax checking is available and is part of the local verification report.
