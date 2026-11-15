#!/usr/bin/env python3
"""Fixture-backed benchmark of Pluto's FFprobe and FFmpeg media-import work."""

import base64
import csv
import json
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path


ITERATIONS = max(1, int(os.environ.get("PLUTO_BENCH_ITERATIONS", "3")))
WARMUP = max(0, int(os.environ.get("PLUTO_BENCH_WARMUP", "1")))
FILTER_DIR = Path(__file__).resolve().parents[1] / "media-filters"
WAVEFORM_FILTER = (FILTER_DIR / "waveform.txt").read_text(encoding="utf-8").strip()
VIDEO_ASSET_FILTER = (FILTER_DIR / "video-assets.txt").read_text(encoding="utf-8").strip()


def run(command):
    return subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def inspect_media(path):
    result = run([
        os.environ.get("FFPROBE", "ffprobe"), "-v", "error",
        "-show_entries", "format=duration:stream=codec_type,duration",
        "-of", "json", str(path),
    ])
    metadata = json.loads(result.stdout)
    streams = metadata.get("streams", [])
    duration = metadata.get("format", {}).get("duration")
    if duration is None:
        durations = [float(stream["duration"]) for stream in streams if stream.get("duration")]
        duration = max(durations)
    return float(duration), any(stream.get("codec_type") == "audio" for stream in streams), len(result.stdout)


def waveform(path):
    result = run([
        os.environ.get("FFMPEG", "ffmpeg"), "-v", "error", "-threads", "1", "-i", str(path),
        "-filter_complex_threads", "1", "-filter_complex", WAVEFORM_FILTER,
        "-map", "[wave]", "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "pipe:1",
    ])
    return len(base64.b64encode(result.stdout))


def video_assets(path, duration, root):
    output_dir = Path(tempfile.mkdtemp(prefix="pluto-bench-assets-", dir=root))
    try:
        thumbnail = output_dir / "thumbnail.jpg"
        filmstrip = output_dir / "filmstrip.png"
        seek = f"{max(0.0, min(duration * 0.15, max(duration - 0.1, 0.0))):.3f}"
        fps = f"{6.0 / max(duration, 0.001):.5f}"
        filter_graph = VIDEO_ASSET_FILTER.format(seek=seek, frame_rate=fps)
        run([
            os.environ.get("FFMPEG", "ffmpeg"), "-y", "-v", "error", "-threads", "1", "-i", str(path),
            "-filter_complex_threads", "1", "-filter_complex", filter_graph,
            "-map", "[thumb]", "-frames:v", "1", "-c:v", "mjpeg", "-q:v", "5", str(thumbnail),
            "-map", "[film]", "-frames:v", "1", "-c:v", "png", str(filmstrip),
        ])
        return sum(len(base64.b64encode(file.read_bytes())) for file in (thumbnail, filmstrip))
    finally:
        shutil.rmtree(output_dir, ignore_errors=True)


def cpu_features():
    try:
        for line in Path("/proc/cpuinfo").read_text(encoding="utf-8").splitlines():
            if line.startswith("flags"):
                return line.split(":", 1)[1].strip().replace(" ", ";")
    except OSError:
        pass
    return "unavailable"


def measure(name, operation, input_bytes):
    for _ in range(WARMUP):
        operation()
    started = time.perf_counter_ns()
    output_bytes = 0
    for _ in range(ITERATIONS):
        output_bytes = operation()
    elapsed = time.perf_counter_ns() - started
    average = elapsed / ITERATIONS
    return [name, ITERATIONS, elapsed, f"{average:.2f}", f"{ITERATIONS * 1e9 / elapsed:.2f}", input_bytes, output_bytes]


def main():
    ffmpeg = os.environ.get("FFMPEG", "ffmpeg")
    ffprobe = os.environ.get("FFPROBE", "ffprobe")
    ffmpeg_version = run([ffmpeg, "-version"]).stdout.decode("utf-8", "replace").splitlines()[0]
    run([ffprobe, "-version"])
    with tempfile.TemporaryDirectory(prefix="pluto-media-bench-") as directory:
        root = Path(directory)
        video = root / "fixture.mp4"
        run([
            ffmpeg, "-y", "-v", "error", "-threads", "1",
            "-f", "lavfi", "-i", "testsrc2=size=960x540:rate=24",
            "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000",
            "-t", "8", "-c:v", "mpeg4", "-q:v", "8", "-c:a", "aac", "-b:a", "64k", str(video),
        ])
        input_bytes = video.stat().st_size
        duration, has_audio, _ = inspect_media(video)
        if not has_audio:
            raise RuntimeError("Generated import fixture unexpectedly has no audio stream")

        def probe_operation():
            _, _, metadata_bytes = inspect_media(video)
            return metadata_bytes

        def import_pipeline():
            asset_duration, asset_has_audio, _ = inspect_media(video)
            derived_bytes = video_assets(video, asset_duration, root)
            if asset_has_audio:
                derived_bytes += waveform(video)
            return derived_bytes

        rows = [
            measure("ffprobe_metadata", probe_operation, input_bytes),
            measure("waveform_png_and_base64", lambda: waveform(video), input_bytes),
            measure("thumbnail_filmstrip_and_base64", lambda: video_assets(video, duration, root), input_bytes),
            measure("media_import_with_derived_assets", import_pipeline, input_bytes),
        ]

        print(f"# host_arch={platform.machine()},cpu_flags={cpu_features()}")
        print(f"# ffmpeg={ffmpeg_version}")
        writer = csv.writer(sys.stdout, lineterminator="\n")
        writer.writerow(["operation", "iterations", "total_ns", "mean_ns", "ops_per_sec", "input_bytes", "output_bytes"])
        writer.writerows(rows)


if __name__ == "__main__":
    main()
