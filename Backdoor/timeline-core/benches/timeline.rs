use pluto_timeline_core::{Clip, Timeline, TrackId};
use serde_json::json;
use std::{hint::black_box, time::Instant};

fn clip(index: usize) -> Clip {
    let track = match index % 6 {
        0 => TrackId::V1,
        1 => TrackId::V2,
        2 => TrackId::V3,
        3 => TrackId::V4,
        4 => TrackId::A1,
        _ => TrackId::A2,
    };
    let mut extra = serde_json::Map::new();
    if index % 6 < 4 {
        extra.insert("trans".into(), json!({ "type": "dissolve", "dur": 0.5 }));
    }
    Clip {
        id: format!("clip-{index}"),
        track,
        start: (index / 6) as f64,
        duration: 1.0,
        label: format!("Clip {index}"),
        linked_clip_id: None,
        extra: extra.into_iter().collect(),
    }
}

fn cpu_features() -> String {
    #[cfg(target_arch = "x86_64")]
    { format!("sse2={},sse4.1={},avx={},avx2={},fma={}",
        std::is_x86_feature_detected!("sse2"),
        std::is_x86_feature_detected!("sse4.1"),
        std::is_x86_feature_detected!("avx"),
        std::is_x86_feature_detected!("avx2"),
        std::is_x86_feature_detected!("fma")) }
    #[cfg(target_arch = "x86")]
    { format!("sse2={},sse4.1={},avx={},avx2={},fma={}",
        std::is_x86_feature_detected!("sse2"),
        std::is_x86_feature_detected!("sse4.1"),
        std::is_x86_feature_detected!("avx"),
        std::is_x86_feature_detected!("avx2"),
        std::is_x86_feature_detected!("fma")) }
    #[cfg(not(any(target_arch = "x86", target_arch = "x86_64")))]
    { "none".into() }
}

fn measure<F: FnMut()>(size: usize, operation: &str, iterations: usize, mut run: F) {
    let start = Instant::now();
    for _ in 0..iterations { run(); }
    let elapsed = start.elapsed();
    let total_ns = elapsed.as_nanos();
    let ns_per_op = total_ns as f64 / iterations as f64;
    let ops_per_sec = iterations as f64 / elapsed.as_secs_f64();
    println!("{},{},{operation},{iterations},{total_ns},{ns_per_op:.2},{ops_per_sec:.2}",
        std::env::consts::ARCH, size);
}

fn main() {
    println!("# cpu_arch={},features={}", std::env::consts::ARCH, cpu_features());
    println!("cpu_arch,clip_count,operation,iterations,total_ns,ns_per_op,ops_per_sec");
    for count in [100, 500, 1_000] {
        let timeline = Timeline::new((0..count).map(clip).collect()).expect("valid benchmark timeline");
        black_box(timeline.active_clips_at(0.0, None));
        black_box(timeline.transition_neighbor("clip-0", true).expect("clip exists"));
        let iterations = 20_000;
        measure(count, "active_clips_at", iterations, || {
            black_box(timeline.active_clips_at(black_box((count / 12) as f64), None));
        });
        measure(count, "transition_neighbor", iterations, || {
            black_box(timeline.transition_neighbor(black_box("clip-0"), true).expect("clip exists"));
        });
    }
}
