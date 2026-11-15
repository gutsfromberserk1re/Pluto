use pluto_timeline_core::{Clip, Timeline, TrackId};
use serde_json::{json, Value};
use std::{hint::black_box, time::Instant};

const WARMUP: usize = 1_000;
const SAMPLES: usize = 7;
const ITERATIONS_PER_SAMPLE: usize = 5_000;

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
    #[cfg(any(target_arch = "x86", target_arch = "x86_64"))]
    {
        format!(
            "sse2={},sse4.1={},avx={},avx2={},fma={}",
            std::is_x86_feature_detected!("sse2"),
            std::is_x86_feature_detected!("sse4.1"),
            std::is_x86_feature_detected!("avx"),
            std::is_x86_feature_detected!("avx2"),
            std::is_x86_feature_detected!("fma")
        )
    }
    #[cfg(not(any(target_arch = "x86", target_arch = "x86_64")))]
    {
        "none".into()
    }
}

fn active_clips_linear(timeline: &Timeline, time: f64, track: Option<TrackId>) -> Vec<&Clip> {
    timeline
        .clips()
        .iter()
        .filter(|clip| {
            clip.start <= time
                && clip.end() > time
                && track.map_or(true, |track| clip.track == track)
        })
        .collect()
}

fn transition_neighbor_linear<'a>(
    timeline: &'a Timeline,
    id: &str,
    next: bool,
) -> Option<(&'a Clip, &'a Value)> {
    let clip = timeline.clips().iter().find(|clip| clip.id == id)?;
    let boundary = if next { clip.end() } else { clip.start };
    let neighbor = timeline.clips().iter().find(|candidate| {
        candidate.id != id
            && candidate.track == clip.track
            && ((if next { candidate.start } else { candidate.end() }) - boundary).abs() < 0.05
    })?;
    let source = if next { clip } else { neighbor };
    source
        .extra
        .get("trans")
        .filter(|transition| transition.is_object())
        .map(|transition| (neighbor, transition))
}

fn measure<F: FnMut()>(clip_count: usize, operation: &str, mut run: F) {
    for _ in 0..WARMUP {
        run();
    }
    let mut samples = Vec::with_capacity(SAMPLES);
    for _ in 0..SAMPLES {
        let start = Instant::now();
        for _ in 0..ITERATIONS_PER_SAMPLE {
            run();
        }
        samples.push(start.elapsed().as_nanos() as f64 / ITERATIONS_PER_SAMPLE as f64);
    }
    samples.sort_by(f64::total_cmp);
    let mean = samples.iter().sum::<f64>() / samples.len() as f64;
    let median = samples[samples.len() / 2];
    let p95 = samples[((samples.len() - 1) * 95).div_ceil(100)];
    println!(
        "{},{operation},{WARMUP},{SAMPLES},{ITERATIONS_PER_SAMPLE},{mean:.2},{median:.2},{p95:.2},{:.2}",
        clip_count,
        1e9 / mean
    );
}

fn main() {
    println!("# cpu_arch={},features={}", std::env::consts::ARCH, cpu_features());
    println!("clip_count,operation,warmup,samples,iterations_per_sample,mean_ns,median_ns,p95_ns,ops_per_sec");
    for count in [100, 500, 1_000] {
        let timeline = Timeline::new((0..count).map(clip).collect()).expect("valid benchmark timeline");
        let time = (count / 12) as f64;
        black_box(active_clips_linear(&timeline, time, None));
        black_box(timeline.active_clips_at(time, None));
        black_box(transition_neighbor_linear(&timeline, "clip-0", true));
        black_box(timeline.transition_neighbor("clip-0", true).expect("clip exists"));

        measure(count, "active_clips_linear_reference", || {
            black_box(active_clips_linear(&timeline, black_box(time), None));
        });
        measure(count, "active_clips_indexed", || {
            black_box(timeline.active_clips_at(black_box(time), None));
        });
        measure(count, "transition_neighbor_linear_reference", || {
            black_box(transition_neighbor_linear(&timeline, black_box("clip-0"), true));
        });
        measure(count, "transition_neighbor_indexed", || {
            black_box(timeline.transition_neighbor(black_box("clip-0"), true).expect("clip exists"));
        });
    }
}
