use pluto_timeline_core::{Clip, Timeline, TrackId};
use std::{collections::{HashMap, HashSet, VecDeque}, fs, hash::{Hash, Hasher}, io::{BufRead, BufReader, Read}, path::{Path, PathBuf}, process::{Child, Command, Stdio}, sync::{mpsc::{sync_channel, SyncSender}, Arc, Mutex, OnceLock}, thread, time::{Duration, SystemTime, UNIX_EPOCH}};
use serde::Serialize;
use serde_json::Value;
use tauri::{Emitter, State};
use tauri_plugin_dialog::DialogExt;

type SharedTimeline = Mutex<Timeline>;
type SharedExport = Arc<Mutex<Option<Child>>>;

#[derive(Clone, Debug, Serialize)]
struct ExportProgress { progress: f64 }

struct ExportTempFiles(PathBuf);
impl Drop for ExportTempFiles { fn drop(&mut self) { let _ = fs::remove_dir_all(&self.0); } }

fn ffmpeg_filter_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/").replace(':', "\\:").replace('\'', "\\'")
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct MediaAsset {
    path: String,
    asset_version: String,
    name: String,
    duration: f64,
    kind: String,
    has_audio: bool,
    thumbnail: Option<String>,
    filmstrip: Option<String>,
    waveform: Option<String>,
}

#[derive(Clone, Default)]
struct DerivedMediaAssets {
    thumbnail: Option<String>,
    filmstrip: Option<String>,
    waveform: Option<String>,
}

struct DerivedAssetCache {
    entries: HashMap<String, DerivedMediaAssets>,
    order: VecDeque<String>,
    bytes: usize,
}

impl Default for DerivedAssetCache {
    fn default() -> Self { Self { entries: HashMap::new(), order: VecDeque::new(), bytes: 0 } }
}

struct AssetJob { app: tauri::AppHandle, asset: MediaAsset, cache_key: String }

const DERIVED_CACHE_LIMIT: usize = 32 * 1024 * 1024;
const DERIVED_QUEUE_CAPACITY: usize = 8;
const WAVEFORM_FILTER: &str = include_str!("../../../media-filters/waveform.txt");
const VIDEO_ASSET_FILTER: &str = include_str!("../../../media-filters/video-assets.txt");
static DERIVED_ASSET_CACHE: OnceLock<Mutex<DerivedAssetCache>> = OnceLock::new();
static PENDING_ASSET_JOBS: OnceLock<Mutex<HashSet<String>>> = OnceLock::new();
static ASSET_JOB_SENDER: OnceLock<SyncSender<AssetJob>> = OnceLock::new();

#[tauri::command]
async fn import_media(app: tauri::AppHandle) -> Result<Option<MediaAsset>, String> {
    let Some(file) = app.dialog().file().add_filter("Media", &["mp4", "mov", "mkv", "avi", "webm", "m4v", "mp3", "wav", "m4a", "aac", "flac", "ogg", "png", "jpg", "jpeg", "webp", "gif"]).blocking_pick_file() else {
        return Ok(None);
    };
    let path = file.into_path().map_err(|error| error.to_string())?;
    let (asset, cache_key) = tauri::async_runtime::spawn_blocking(move || inspect_media(path))
        .await.map_err(|error| error.to_string())??;
    if let Some(cache_key) = cache_key {
        enqueue_asset_job(AssetJob { app, asset: asset.clone(), cache_key }).await?;
    }
    Ok(Some(asset))
}

fn inspect_media(path: PathBuf) -> Result<(MediaAsset, Option<String>), String> {
    if !path.is_file() { return Err("The selected media file could not be found".into()); }
    let extension = path.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase();
    let kind = if ["png", "jpg", "jpeg", "webp", "gif"].contains(&extension.as_str()) { "image" }
        else if ["mp3", "wav", "m4a", "aac", "flac", "ogg"].contains(&extension.as_str()) { "audio" }
        else if ["mp4", "mov", "mkv", "avi", "webm", "m4v"].contains(&extension.as_str()) { "video" }
        else { return Err("This file type is not supported".into()); };
    let mut duration = 5.0;
    let mut has_audio = false;
    if kind != "image" {
        let probe = multimedia_binary("ffprobe");
        let output = Command::new(probe)
            .args(["-v", "error", "-show_entries", "format=duration:stream=codec_type,duration", "-of", "json"])
            .arg(&path)
            .output()
            .map_err(|error| format!("Could not start FFprobe to read media duration: {error}"))?;
        if !output.status.success() {
            let detail = String::from_utf8_lossy(&output.stderr).trim().to_owned();
            return Err(if detail.is_empty() { "FFprobe could not read the selected media file".into() } else { detail });
        }
        let metadata: Value = serde_json::from_slice(&output.stdout)
            .map_err(|error| format!("FFprobe returned invalid media information: {error}"))?;
        let as_seconds = |value: &Value| value.as_f64().or_else(|| value.as_str()?.parse::<f64>().ok()).filter(|seconds| seconds.is_finite() && *seconds > 0.0);
        has_audio = metadata["streams"].as_array().map(|streams| streams.iter().any(|stream| stream["codec_type"].as_str() == Some("audio"))).unwrap_or(false);
        duration = as_seconds(&metadata["format"]["duration"])
            .or_else(|| metadata["streams"].as_array()?.iter().filter_map(|stream| as_seconds(&stream["duration"])).reduce(f64::max))
            .ok_or_else(|| "FFprobe did not report a usable media duration".to_owned())?;
    }
    let cache_key = derived_cache_key(&path);
    let cached = cache_get(&cache_key).unwrap_or_default();
    let needs_derived_assets = (kind == "video" && (cached.thumbnail.is_none() || cached.filmstrip.is_none()))
        || (has_audio && cached.waveform.is_none());
    let asset = MediaAsset {
        name: path.file_name().and_then(|name| name.to_str()).unwrap_or("Media").to_owned(),
        path: path.to_string_lossy().into_owned(), asset_version: cache_key.clone(), duration, kind: kind.into(), has_audio,
        thumbnail: cached.thumbnail, filmstrip: cached.filmstrip, waveform: cached.waveform,
    };
    Ok((asset, needs_derived_assets.then_some(cache_key)))
}

fn derived_cache_key(path: &Path) -> String {
    let canonical = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    let metadata = fs::metadata(&canonical).ok();
    let modified = metadata.as_ref().and_then(|value| value.modified().ok())
        .and_then(|value| value.duration_since(UNIX_EPOCH).ok()).map(|value| value.as_nanos()).unwrap_or(0);
    let length = metadata.map(|value| value.len()).unwrap_or(0);
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    canonical.hash(&mut hasher); length.hash(&mut hasher); modified.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn cache_get(key: &str) -> Option<DerivedMediaAssets> {
    let cache = DERIVED_ASSET_CACHE.get_or_init(|| Mutex::new(DerivedAssetCache::default()));
    let mut cache = cache.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
    let result = cache.entries.get(key).cloned();
    if result.is_some() {
        if let Some(index) = cache.order.iter().position(|entry| entry == key) { cache.order.remove(index); }
        cache.order.push_back(key.to_owned());
    }
    result
}

fn cache_insert(key: String, assets: DerivedMediaAssets) {
    let size = [&assets.thumbnail, &assets.filmstrip, &assets.waveform].into_iter()
        .filter_map(|value| value.as_ref()).map(String::len).sum::<usize>();
    if size == 0 || size > DERIVED_CACHE_LIMIT { return; }
    let cache = DERIVED_ASSET_CACHE.get_or_init(|| Mutex::new(DerivedAssetCache::default()));
    let mut cache = cache.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
    if let Some(previous) = cache.entries.remove(&key) {
        cache.bytes = cache.bytes.saturating_sub([&previous.thumbnail, &previous.filmstrip, &previous.waveform].into_iter()
            .filter_map(|value| value.as_ref()).map(String::len).sum::<usize>());
        if let Some(index) = cache.order.iter().position(|entry| entry == &key) { cache.order.remove(index); }
    }
    while cache.bytes + size > DERIVED_CACHE_LIMIT {
        let Some(oldest) = cache.order.pop_front() else { break; };
        if let Some(removed) = cache.entries.remove(&oldest) {
            cache.bytes = cache.bytes.saturating_sub([&removed.thumbnail, &removed.filmstrip, &removed.waveform].into_iter()
                .filter_map(|value| value.as_ref()).map(String::len).sum::<usize>());
        }
    }
    cache.bytes += size;
    cache.order.push_back(key.clone());
    cache.entries.insert(key, assets);
}

fn asset_job_sender() -> &'static SyncSender<AssetJob> {
    ASSET_JOB_SENDER.get_or_init(|| {
        let (sender, receiver) = sync_channel::<AssetJob>(DERIVED_QUEUE_CAPACITY);
        let receiver = Arc::new(Mutex::new(receiver));
        for worker_id in 0..derived_worker_count() {
            let worker_receiver = Arc::clone(&receiver);
            let _ = thread::Builder::new().name(format!("pluto-media-assets-{worker_id}")).spawn(move || {
                loop {
                    let job = {
                        let guard = worker_receiver.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
                        guard.recv()
                    };
                    let Ok(job) = job else { break; };
                    let mut asset = job.asset;
                    let mut derived = cache_get(&job.cache_key).unwrap_or_default();
                    if asset.kind == "video" {
                        let (thumbnail, filmstrip) = ffmpeg_video_assets(Path::new(&asset.path), asset.duration);
                        derived.thumbnail = derived.thumbnail.or(thumbnail);
                        derived.filmstrip = derived.filmstrip.or(filmstrip);
                    }
                    if asset.has_audio {
                        derived.waveform = derived.waveform.or_else(|| ffmpeg_waveform_data(Path::new(&asset.path)));
                    }
                    asset.thumbnail = derived.thumbnail.clone();
                    asset.filmstrip = derived.filmstrip.clone();
                    asset.waveform = derived.waveform.clone();
                    cache_insert(job.cache_key.clone(), derived);
                    let _ = job.app.emit("media-assets-ready", asset);
                    if let Some(pending) = PENDING_ASSET_JOBS.get() {
                        pending.lock().unwrap_or_else(|poisoned| poisoned.into_inner()).remove(&job.cache_key);
                    }
                }
            });
        }
        sender
    })
}

fn derived_worker_count_for(parallelism: usize) -> usize {
    if parallelism <= 2 { 1 } else { 2 }
}

fn derived_worker_count() -> usize {
    thread::available_parallelism().map(|parallelism| derived_worker_count_for(parallelism.get())).unwrap_or(1)
}

async fn enqueue_asset_job(job: AssetJob) -> Result<(), String> {
    let pending = PENDING_ASSET_JOBS.get_or_init(|| Mutex::new(HashSet::new()));
    {
        let mut pending = pending.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
        if !pending.insert(job.cache_key.clone()) { return Ok(()); }
    }
    let key = job.cache_key.clone();
    let sender = asset_job_sender().clone();
    let result = tauri::async_runtime::spawn_blocking(move || sender.send(job)).await;
    if !matches!(&result, Ok(Ok(()))) {
        if let Some(pending) = PENDING_ASSET_JOBS.get() {
            pending.lock().unwrap_or_else(|poisoned| poisoned.into_inner()).remove(&key);
        }
        let message = match result {
            Err(error) => error.to_string(),
            Ok(Err(_)) => "Media asset processing workers are unavailable".into(),
            Ok(Ok(())) => unreachable!(),
        };
        return Err(message);
    }
    Ok(())
}

fn base64_encode(bytes: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut encoded = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let a = chunk[0] as usize;
        let b = chunk.get(1).copied().unwrap_or(0) as usize;
        let c = chunk.get(2).copied().unwrap_or(0) as usize;
        encoded.push(TABLE[a >> 2] as char);
        encoded.push(TABLE[((a & 3) << 4) | (b >> 4)] as char);
        encoded.push(if chunk.len() > 1 { TABLE[((b & 15) << 2) | (c >> 6)] as char } else { '=' });
        encoded.push(if chunk.len() > 2 { TABLE[c & 63] as char } else { '=' });
    }
    encoded
}

fn ffmpeg_video_assets(path: &Path, duration: f64) -> (Option<String>, Option<String>) {
    let temp = std::env::temp_dir().join(format!("pluto-assets-{}-{}", std::process::id(),
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_nanos()));
    if fs::create_dir(&temp).is_err() { return (None, None); }
    let _cleanup = ExportTempFiles(temp.clone());
    let thumbnail_path = temp.join("thumbnail.jpg");
    let filmstrip_path = temp.join("filmstrip.png");
    let seek = format!("{:.3}", (duration * 0.15).clamp(0.0, (duration - 0.1).max(0.0)));
    let frame_rate = format!("{:.5}", 6.0 / duration.max(0.001));
    let filter = VIDEO_ASSET_FILTER.replace("{seek}", &seek).replace("{frame_rate}", &frame_rate);
    let output = Command::new(multimedia_binary("ffmpeg"))
        .args(["-y", "-v", "error", "-threads", "1", "-i"])
        .arg(path)
        .args(["-filter_complex_threads", "1", "-filter_complex", filter.as_str(), "-map", "[thumb]", "-frames:v", "1", "-c:v", "mjpeg", "-q:v", "5"])
        .arg(&thumbnail_path)
        .args(["-map", "[film]", "-frames:v", "1", "-c:v", "png"])
        .arg(&filmstrip_path)
        .output();
    let Ok(output) = output else { return (None, None); };
    if !output.status.success() { return (None, None); }
    let thumbnail = fs::read(thumbnail_path).ok().filter(|bytes| !bytes.is_empty())
        .map(|bytes| format!("data:image/jpeg;base64,{}", base64_encode(&bytes)));
    let filmstrip = fs::read(filmstrip_path).ok().filter(|bytes| !bytes.is_empty())
        .map(|bytes| format!("data:image/png;base64,{}", base64_encode(&bytes)));
    (thumbnail, filmstrip)
}

fn ffmpeg_waveform_data(path: &Path) -> Option<String> {
    let output = Command::new(multimedia_binary("ffmpeg"))
        .args(["-v", "error", "-threads", "1", "-i"])
        .arg(path)
        .args(["-filter_complex_threads", "1", "-filter_complex", WAVEFORM_FILTER.trim(), "-map", "[wave]", "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "pipe:1"])
        .output().ok()?;
    if !output.status.success() || output.stdout.is_empty() { return None; }
    Some(format!("data:image/png;base64,{}", base64_encode(&output.stdout)))
}

fn multimedia_binary(tool: &str) -> PathBuf {
    let filename = if cfg!(windows) { format!("{tool}.exe") } else { tool.to_owned() };
    if let Ok(directory) = std::env::var("PLUTO_FFMPEG_DIR") {
        let candidate = PathBuf::from(directory).join(&filename);
        if candidate.is_file() { return candidate; }
    }
    if let Ok(executable) = std::env::current_exe() {
        if let Some(directory) = executable.parent() {
            for candidate in [directory.join(&filename), directory.join("ffmpeg").join(&filename), directory.join("resources").join("ffmpeg").join(&filename)] {
                if candidate.is_file() { return candidate; }
            }
        }
    }
    PathBuf::from(filename)
}

#[tauri::command]
async fn choose_export_directory(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let Some(folder) = app.dialog().file().blocking_pick_folder() else { return Ok(None); };
    Ok(Some(folder.into_path().map_err(|error| error.to_string())?.to_string_lossy().into_owned()))
}

#[tauri::command]
async fn export_timeline(app: tauri::AppHandle, timeline: State<'_, SharedTimeline>, state: State<'_, SharedExport>, settings: Value, time: f64) -> Result<Option<String>, String> {
    let mode = settings["mode"].as_str().unwrap_or("video");
    let format = if mode == "image" { settings["image"]["format"].as_str().unwrap_or("png") } else { settings["video"]["format"].as_str().unwrap_or("mp4") };
    let requested_name = settings["output"]["name"].as_str().unwrap_or("pluto-export").trim();
    let suffix = format!(".{format}");
    let name = requested_name.strip_suffix(suffix.as_str()).unwrap_or(requested_name);
    let save = app.dialog().file().add_filter("Export", &[format]).set_file_name(format!("{}.{}", if name.is_empty() { "pluto-export" } else { name }, format));
    let save = if let Some(directory) = settings["output"]["destination"].as_str() { save.set_directory(PathBuf::from(directory)) } else { save };
    let Some(file) = save.blocking_save_file() else { return Ok(None); };
    let mut output = file.into_path().map_err(|error| error.to_string())?;
    output.set_extension(format);
    let timeline_clips = timeline.lock().map_err(|_| "Timeline lock failed".to_owned())?.clips().to_vec();
    let clips = timeline_clips.iter().map(serde_json::to_value).collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())?;
    let process = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || render_timeline(app, process, clips, settings, time, output))
        .await.map_err(|error| error.to_string())?.map(Some)
}

#[tauri::command]
fn cancel_export(state: State<'_, SharedExport>) -> Result<(), String> {
    let mut current = state.lock().map_err(|_| "Export process lock failed".to_owned())?;
    if let Some(child) = current.as_mut() { child.kill().map_err(|error| format!("Could not cancel export: {error}"))?; }
    Ok(())
}

fn number(value: &Value, key: &str, fallback: f64) -> f64 { value[key].as_f64().filter(|n| n.is_finite()).unwrap_or(fallback) }
fn enabled(value: &Value, key: &str) -> bool { value[key]["enabled"].as_bool().unwrap_or(false) }
fn n(value: &Value, key: &str, fallback: f64) -> f64 { number(value, key, fallback) }

fn value_at_path<'a>(mut value: &'a Value, path: &[&str]) -> &'a Value {
    for key in path { value = &value[*key]; }
    value
}

fn keyframe_number_expr(clip: &Value, path: &[&str], fallback: f64, start: f64, time_var: &str) -> Option<String> {
    let keyframes = clip["keyframes"].as_array()?;
    if keyframes.is_empty() { return None; }
    let base = value_at_path(&clip["props"], path).as_f64().filter(|n| n.is_finite()).unwrap_or(fallback);
    let mut points = vec![(0.0_f64, base, "linear".to_owned())];
    for keyframe in keyframes {
        let Some(time) = keyframe["time"].as_f64().filter(|n| n.is_finite()) else { continue; };
        if time < 0.0 || time > n(clip, "dur", f64::MAX) { continue; }
        let Some(value) = value_at_path(&keyframe["props"], path).as_f64().filter(|n| n.is_finite()) else { continue; };
        let easing = keyframe["easing"].as_str().unwrap_or("linear").to_owned();
        if let Some(existing) = points.iter_mut().find(|point| (point.0 - time).abs() < 1e-6) {
            *existing = (time, value, easing);
        } else { points.push((time, value, easing)); }
    }
    points.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
    if points.is_empty() { return None; }
    if points.len() == 1 {
        return ((points[0].1 - base).abs() >= 1e-9).then(|| format!("{:.8}", points[0].1));
    }
    if points.windows(2).all(|pair| (pair[0].1 - pair[1].1).abs() < 1e-9) {
        return ((points[0].1 - base).abs() >= 1e-9).then(|| format!("{:.8}", points[0].1));
    }

    let last = points.last()?.1;
    let mut expression = format!("{last:.8}");
    for index in (0..points.len() - 1).rev() {
        let (from_time, from_value, easing) = &points[index];
        let (to_time, to_value, _) = &points[index + 1];
        let from_at = start + *from_time;
        let to_at = start + *to_time;
        let progress = format!("min(max(({time_var}-{from_at:.8})/{:.8},0),1)", (*to_time - *from_time).max(1e-6));
        let eased = match easing.as_str() {
            "ease-in" => format!("({progress})*({progress})"),
            "ease-out" => format!("1-(1-({progress}))*(1-({progress}))"),
            "ease-in-out" => format!("if(lt(({progress}),0.5),2*({progress})*({progress}),1-2*(1-({progress}))*(1-({progress})))"),
            "hold" => "0".to_owned(),
            _ => progress,
        };
        let interpolate = format!("({from_value:.8}+({to_value:.8}-{from_value:.8})*({eased}))");
        expression = format!("if(lt({time_var},{from_at:.8}),{from_value:.8},if(lt({time_var},{to_at:.8}),{interpolate},{expression}))");
    }
    Some(expression)
}

fn video_filters(clip: &Value, width: u32, height: u32, start: f64, length: f64, transition_in: Option<(&str, f64)>, transition_out: Option<(&str, f64)>) -> (String, String, String) {
    let props = &clip["props"];
    let transform = &props["transform"];
    let effects = &props["effects"];
    let colors = &props["colors"];
    let source_start = n(clip, "sourceOffset", 0.0).max(0.0);
    let mut filters = vec![format!("trim=start={source_start:.5}:duration={length:.5}"), format!("setpts=PTS-STARTPTS+{start:.5}/TB"),
        format!("scale={width}:{height}:force_original_aspect_ratio=decrease"),
        format!("pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black@0"), "setsar=1".into(), "format=rgba".into()];

    let crop = &transform["crop"];
    let left = (n(crop, "left", 0.0) / 1920.0).clamp(0.0, 0.45);
    let right = (n(crop, "right", 0.0) / 1920.0).clamp(0.0, 0.45);
    let top = (n(crop, "top", 0.0) / 1080.0).clamp(0.0, 0.45);
    let bottom = (n(crop, "bottom", 0.0) / 1080.0).clamp(0.0, 0.45);
    if left + right > 0.0 || top + bottom > 0.0 {
        filters.push(format!("crop=iw*{:.6}:ih*{:.6}:iw*{left:.6}:ih*{top:.6}", (1.0 - left - right).max(0.1), (1.0 - top - bottom).max(0.1)));
        filters.push(format!("scale={width}:{height}:force_original_aspect_ratio=decrease"));
        filters.push(format!("pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black@0"));
    }

    let light = &colors["light"];
    let color = &colors["color"];
    let detail = &colors["detail"];
    let brightness = (n(light, "exposure", 0.0) * 0.5 + n(light, "brightness", 0.0) / 100.0 * 0.25).clamp(-1.0, 1.0);
    let contrast = (1.0 + n(light, "contrast", 0.0) / 100.0).clamp(0.0, 4.0);
    let saturation = (1.0 + n(color, "saturation", 0.0) / 100.0 + n(color, "vibrance", 0.0) / 150.0).clamp(0.0, 3.0);
    let animated_color = keyframe_number_expr(clip, &["colors", "light", "exposure"], 0.0, start, "t").is_some()
        || keyframe_number_expr(clip, &["colors", "light", "brightness"], 0.0, start, "t").is_some()
        || keyframe_number_expr(clip, &["colors", "light", "contrast"], 0.0, start, "t").is_some()
        || keyframe_number_expr(clip, &["colors", "color", "saturation"], 0.0, start, "t").is_some()
        || keyframe_number_expr(clip, &["colors", "color", "vibrance"], 0.0, start, "t").is_some();
    if animated_color {
        let exposure = keyframe_number_expr(clip, &["colors", "light", "exposure"], 0.0, start, "t").unwrap_or_else(|| format!("{:.8}", n(light, "exposure", 0.0)));
        let light_brightness = keyframe_number_expr(clip, &["colors", "light", "brightness"], 0.0, start, "t").unwrap_or_else(|| format!("{:.8}", n(light, "brightness", 0.0)));
        let light_contrast = keyframe_number_expr(clip, &["colors", "light", "contrast"], 0.0, start, "t").unwrap_or_else(|| format!("{:.8}", n(light, "contrast", 0.0)));
        let color_saturation = keyframe_number_expr(clip, &["colors", "color", "saturation"], 0.0, start, "t").unwrap_or_else(|| format!("{:.8}", n(color, "saturation", 0.0)));
        let vibrance = keyframe_number_expr(clip, &["colors", "color", "vibrance"], 0.0, start, "t").unwrap_or_else(|| format!("{:.8}", n(color, "vibrance", 0.0)));
        let brightness_expr = format!("min(max(({exposure})*0.5+({light_brightness})/100*0.25,-1),1)");
        let contrast_expr = format!("min(max(1+({light_contrast})/100,0),4)");
        let saturation_expr = format!("min(max(1+({color_saturation})/100+({vibrance})/150,0),3)");
        filters.push(format!("eq=brightness='{brightness_expr}':contrast='{contrast_expr}':saturation='{saturation_expr}':eval=frame"));
    } else if brightness.abs() > 0.0001 || (contrast - 1.0).abs() > 0.0001 || (saturation - 1.0).abs() > 0.0001 {
        filters.push(format!("eq=brightness={brightness:.5}:contrast={contrast:.5}:saturation={saturation:.5}"));
    }
    let temperature = (n(color, "temperature", 0.0) / 100.0).clamp(-1.0, 1.0);
    if temperature.abs() > 0.01 {
        filters.push(format!("colorbalance=rs={temperature:.4}:bs={:.4}", -temperature));
    }
    for (key, wheel_channel) in [("shadows", "s"), ("tint", "m"), ("highlights", "h")] {
        if let Some(wheel_data) = colors["grading"][key].as_object() {
            let amount = wheel_data.get("amount").and_then(Value::as_f64).unwrap_or(0.0) / 100.0 * 0.3;
            let angle = wheel_data.get("hue").and_then(Value::as_f64).unwrap_or(0.0).to_radians();
            if amount.abs() > 0.001 {
                let r = amount * angle.cos(); let b = amount * angle.sin();
                filters.push(format!("colorbalance=r{wheel_channel}={r:.4}:b{wheel_channel}={b:.4}"));
            }
        }
    }
    let clarity = (n(detail, "clarity", 0.0) / 100.0 * 0.9).clamp(-0.9, 0.9);
    let sharpness = (n(detail, "sharpness", 0.0) / 100.0 * 0.9).clamp(0.0, 0.9);
    let color_detail = (clarity + sharpness).clamp(-0.9, 1.5);
    if color_detail.abs() > 0.001 { filters.push(format!("unsharp=5:5:{color_detail:.4}:5:5:0")); }
    let color_vignette = (n(detail, "vignette", 0.0) / 100.0).clamp(-1.0, 1.0);
    if color_vignette.abs() > 0.01 {
        let edge = "max(0,min(1,(hypot(X-W/2,Y-H/2)/(min(W,H)*0.7)-0.68)/0.32))";
        if color_vignette > 0.0 {
            filters.push(format!("geq=r='min(255,r(X,Y)+255*{:.4}*{edge})':g='min(255,g(X,Y)+255*{:.4}*{edge})':b='min(255,b(X,Y)+255*{:.4}*{edge})':a='alpha(X,Y)'", color_vignette, color_vignette, color_vignette));
        } else {
            filters.push(format!("geq=r='r(X,Y)*(1-{:.4}*{edge})':g='g(X,Y)*(1-{:.4}*{edge})':b='b(X,Y)*(1-{:.4}*{edge})':a='alpha(X,Y)'", color_vignette.abs(), color_vignette.abs(), color_vignette.abs()));
        }
    }

    let preset = effects["preset"]["id"].as_str().unwrap_or("none");
    let intensity = (n(&effects["preset"], "intensity", 100.0) / 100.0).clamp(0.0, 1.0);
    match preset {
        "vivid" => filters.push(format!("eq=saturation={:.3}:contrast=1.08", 1.0 + 0.7 * intensity)),
        "noir" => { filters.push(format!("hue=s={:.3}", 1.0 - intensity)); filters.push(format!("eq=contrast={:.3}:brightness={:.3}", 1.0 + 0.2 * intensity, -0.02 * intensity)); },
        "fade" => filters.push(format!("eq=contrast={:.3}:brightness={:.3}:saturation={:.3}", 1.0 - 0.16 * intensity, 0.08 * intensity, 1.0 - 0.2 * intensity)),
        "warm" => filters.push(format!("colorbalance=rs={:.3}:bs={:.3}", 0.12 * intensity, -0.1 * intensity)),
        "cool" => filters.push(format!("colorbalance=rs={:.3}:bs={:.3}", -0.08 * intensity, 0.12 * intensity)),
        "cinema" => filters.push(format!("eq=contrast={:.3}:saturation={:.3}", 1.0 + 0.15 * intensity, 1.0 - 0.15 * intensity)),
        "retro" => { filters.push(format!("colorbalance=rs={:.3}:bs={:.3}", 0.15 * intensity, -0.12 * intensity)); filters.push(format!("noise=alls={:.2}:allf=t+u", 12.0 * intensity)); },
        _ => {}
    }
    if enabled(effects, "blur") {
        let blur = &effects["blur"];
        let amount = n(blur, "amount", 0.0) * intensity.max(0.01);
        let sigma = (amount * 0.08).max(0.1);
        match blur["mode"].as_str().unwrap_or("gaussian") {
            "motion" => {
                let frames = (2.0 + amount / 14.0).clamp(2.0, 9.0) as u32;
                filters.push(format!("tmix=frames={frames}"));
                let distance = amount * 0.015;
                let angle = n(blur, "angle", 0.0).to_radians();
                filters.push(format!("rgbashift=rh={:.3}:rv={:.3}:bh={:.3}:bv={:.3}", distance * angle.cos(), distance * angle.sin(), -distance * angle.cos(), -distance * angle.sin()));
            }
            "zoom" => {
                filters.push(format!("gblur=sigma={:.3}:steps=2", sigma * 0.7));
                let zoom = (1.0 + amount / 1600.0).clamp(1.0, 1.08);
                filters.push(format!("scale=iw*{zoom:.4}:ih*{zoom:.4}"));
            }
            _ => filters.push(format!("gblur=sigma={sigma:.3}:steps=2")),
        }
    }
    if enabled(effects, "grain") {
        let grain = &effects["grain"];
        let amount = n(grain, "amount", 0.0) * n(grain, "roughness", 50.0) / 50.0 * (0.6 + n(grain, "size", 30.0) / 250.0);
        filters.push(format!("noise=alls={:.2}:allf=t+u", amount.clamp(0.0, 80.0)));
    }
    if enabled(effects, "vignette") {
        let vignette = &effects["vignette"];
        let amount = (n(vignette, "amount", 0.0) / 100.0).clamp(-1.0, 1.0);
        if amount.abs() > 0.01 {
            let midpoint = (n(vignette, "midpoint", 50.0) / 100.0 * 0.8).clamp(0.0, 0.8);
            let feather = (0.08 + n(vignette, "feather", 50.0) / 100.0 * 0.42).clamp(0.04, 0.5);
            let roundness = (1.0 + n(vignette, "roundness", 0.0) / 100.0 * 0.8).clamp(0.2, 2.0);
            let edge = format!("max(0,min(1,(hypot((X-W/2)*{roundness:.4},Y-H/2)/(min(W,H)*0.7)-{midpoint:.4})/{feather:.4}))");
            if amount > 0.0 {
                filters.push(format!("geq=r='min(255,r(X,Y)+255*{:.4}*{edge})':g='min(255,g(X,Y)+255*{:.4}*{edge})':b='min(255,b(X,Y)+255*{:.4}*{edge})':a='alpha(X,Y)'", amount, amount, amount));
            } else {
                filters.push(format!("geq=r='r(X,Y)*(1-{:.4}*{edge})':g='g(X,Y)*(1-{:.4}*{edge})':b='b(X,Y)*(1-{:.4}*{edge})':a='alpha(X,Y)'", amount.abs(), amount.abs(), amount.abs()));
            }
        }
    }
    if enabled(effects, "chromatic") {
        let a = n(&effects["chromatic"], "amount", 0.0) * 0.06;
        let angle = n(&effects["chromatic"], "angle", 0.0).to_radians();
        filters.push(format!("rgbashift=rh={:.2}:rv={:.2}:bh={:.2}:bv={:.2}", a * angle.cos(), a * angle.sin(), -a * angle.cos(), -a * angle.sin()));
    }
    if enabled(effects, "glow") {
        let radius = (n(&effects["glow"], "radius", 0.0) * 0.04).max(0.1);
        let amount = n(&effects["glow"], "amount", 0.0) / 100.0;
        let threshold = n(&effects["glow"], "threshold", 70.0) / 100.0;
        filters.push(format!("gblur=sigma={radius:.3}:steps=1"));
        filters.push(format!("eq=brightness={:.4}:contrast={:.4}", amount * (0.2 - threshold * 0.08), 1.0 + threshold * 0.12));
    }
    if enabled(effects, "glitch") {
        let speed = n(&effects["glitch"], "speed", 50.0) / 50.0;
        let a = n(&effects["glitch"], "amount", 0.0) * 0.1 * (0.4 + n(&effects["glitch"], "blocks", 25.0) / 40.0) * speed.max(0.1);
        filters.push(format!("rgbashift=rh={a:.2}:bh={:.2}", -a));
        filters.push(format!("noise=alls={:.2}:allf=t", a * 2.0));
    }
    if enabled(effects, "pixelate") {
        let size = (n(&effects["pixelate"], "size", 12.0) * n(&effects["pixelate"], "blend", 100.0) / 100.0).clamp(1.0, 80.0);
        filters.push(format!("scale={}:{}:flags=neighbor,scale={width}:{height}:flags=neighbor", (width as f64 / size).max(1.0) as u32, (height as f64 / size).max(1.0) as u32));
    }
    if enabled(effects, "sharpen") {
        let sharpen = &effects["sharpen"];
        let radius = (n(sharpen, "radius", 5.0).round() as i32).clamp(3, 23) | 1;
        let threshold = 1.0 - n(sharpen, "threshold", 10.0).clamp(0.0, 100.0) / 125.0;
        let amount = n(sharpen, "amount", 0.0) / 100.0 * threshold;
        filters.push(format!("unsharp={radius}:{radius}:{amount:.3}:5:5:0"));
    }
    for key in ["lens", "fisheye"] {
        if enabled(effects, key) {
            let amount = n(&effects[key], "amount", 0.0) / 100.0 * 0.22 * n(&effects[key], "blend", 100.0) / 100.0;
            filters.push(format!("lenscorrection=cx=0.5:cy=0.5:k1={amount:.4}:k2=0"));
            let zoom = (n(&effects[key], "scale", 100.0) / 100.0).clamp(0.5, 1.5);
            if (zoom - 1.0).abs() > 0.001 { filters.push(format!("scale=iw*{zoom:.4}:ih*{zoom:.4}")); }
        }
    }
    if enabled(effects, "scanlines") { filters.push(format!("drawgrid=width=iw:height={}:thickness=1:color=black@{:.3}", n(&effects["scanlines"], "spacing", 3.0).max(1.0), (n(&effects["scanlines"], "amount", 0.0) / 100.0).clamp(0.0, 1.0))); }
    if enabled(effects, "shake") {
        // Motion is added to the overlay coordinates below, based on this enabled value.
    }
    if enabled(effects, "filmBurn") {
        let burn = &effects["filmBurn"];
        let amount = n(burn, "amount", 0.0) / 100.0 * 0.34;
        let warmth = n(burn, "warmth", 0.0) / 100.0;
        let spread = (0.12 + n(burn, "edge", 38.0) / 100.0 * 0.72).clamp(0.12, 0.84);
        let flicker = n(burn, "flicker", 12.0) / 100.0 * 0.45;
        let edge = format!("(max(0,(abs(X-W/2)/(W/2)-{:.4})/{spread:.4})*(1+sin(T*8*PI)*{flicker:.4}))", 1.0 - spread);
        filters.push(format!("geq=r='min(255,r(X,Y)+255*{:.4}*{edge})':g='min(255,g(X,Y)+255*{:.4}*{edge})':b='min(255,b(X,Y)+255*{:.4}*{edge})'", amount * warmth, amount * 0.28, amount * 0.06));
    }
    if enabled(effects, "lightLeak") {
        let leak = &effects["lightLeak"];
        let amount = n(leak, "amount", 0.0) / 100.0 * 0.5;
        let warmth = n(leak, "warmth", 70.0) / 100.0;
        let position = n(leak, "position", 35.0) / 100.0;
        let radius = (0.14 + warmth * 0.38).clamp(0.14, 0.52);
        let hotspot = format!("max(0,1-abs(X/W-{position:.4})/{radius:.4})");
        filters.push(format!("geq=r='min(255,r(X,Y)+255*{:.4}*{hotspot})':g='min(255,g(X,Y)+255*{:.4}*{hotspot})':b='min(255,b(X,Y)+255*{:.4}*{hotspot})'", amount, amount * (0.25 + warmth * 0.2), amount * (1.0 - warmth) * 0.25));
    }
    if enabled(effects, "halftone") {
        let halftone = &effects["halftone"];
        let size = n(halftone, "size", 5.0).clamp(1.0, 24.0) * 2.0;
        let angle = n(halftone, "angle", 45.0).to_radians();
        let contrast = n(halftone, "contrast", 48.0).clamp(0.0, 100.0) / 100.0;
        let px = format!("mod(X*{:.5}+Y*{:.5}+{:.3},{size:.3})-{:.3}", angle.cos(), angle.sin(), size / 2.0, size / 2.0);
        let py = format!("mod(-X*{:.5}+Y*{:.5}+{:.3},{size:.3})-{:.3}", angle.sin(), angle.cos(), size / 2.0, size / 2.0);
        let radius = format!("(1-lum(X,Y)/255)*{:.3}*{contrast:.3}", size / 2.0);
        filters.push(format!("geq=r='if(lt(hypot({px},{py}),{radius}),0,r(X,Y))':g='if(lt(hypot({px},{py}),{radius}),0,g(X,Y))':b='if(lt(hypot({px},{py}),{radius}),0,b(X,Y))'"));
    }
    if enabled(effects, "posterize") {
        let posterize = &effects["posterize"];
        let blend = n(posterize, "blend", 100.0).clamp(0.0, 100.0) / 100.0;
        let target = n(posterize, "levels", 6.0).clamp(2.0, 16.0);
        if blend > 0.0 { filters.push(format!("posterize=levels={:.0}", (16.0 - (16.0 - target) * blend).clamp(2.0, 16.0))); }
    }

    if let Some((kind, transition_duration)) = transition_in {
        let d = transition_duration.clamp(0.05, length.max(0.05));
        if kind == "dip" {
            filters.push(format!("fade=t=in:st={start:.5}:d={:.5}", (d / 2.0).max(0.025)));
        } else if kind == "wipe" {
            filters.push(format!("geq=a='alpha(X,Y)*if(lte(X/W,min(max((T-{start:.5})/{d:.5},0),1)),1,0)'"));
        } else if kind == "iris" {
            filters.push(format!("geq=a='alpha(X,Y)*if(lte(hypot(X-W/2,Y-H/2),min(W,H)*0.5*min(max((T-{start:.5})/{d:.5},0),1)),1,0)'"));
        } else {
            filters.push(format!("fade=t=in:st={start:.5}:d={d:.5}:alpha=1"));
        }
    }
    if let Some((kind, transition_duration)) = transition_out {
        let d = transition_duration.clamp(0.05, length.max(0.05));
        if kind == "dip" { filters.push(format!("fade=t=out:st={:.5}:d={:.5}", start + length - d / 2.0, (d / 2.0).max(0.025))); }
        filters.push(format!("tpad=stop_mode=clone:stop_duration={d:.5}"));
    }

    let distort = &transform["distort"];
    let tl = n(distort, "tl", 0.0) * width as f64 / 1920.0;
    let tr = n(distort, "tr", 0.0) * width as f64 / 1920.0;
    let br = n(distort, "br", 0.0) * width as f64 / 1920.0;
    let bl = n(distort, "bl", 0.0) * width as f64 / 1920.0;
    if tl.abs() + tr.abs() + br.abs() + bl.abs() > 0.01 {
        filters.push(format!("perspective=x0={tl:.3}:y0={tl:.3}:x1={:.3}:y1={tr:.3}:x2={:.3}:y2={:.3}:x3={bl:.3}:y3={:.3}:sense=source:eval=frame", width as f64 - tr, width as f64 - br, height as f64 - br, height as f64 - bl));
    }

    let scale_w = (n(&transform["scale"], "w", 100.0) / 100.0).clamp(0.01, 10.0);
    let scale_h = (n(&transform["scale"], "h", 100.0) / 100.0).clamp(0.01, 10.0);
    let scale_w_key = keyframe_number_expr(clip, &["transform", "scale", "w"], 100.0, start, "t");
    let scale_h_key = keyframe_number_expr(clip, &["transform", "scale", "h"], 100.0, start, "t");
    if scale_w_key.is_some() || scale_h_key.is_some() {
        let w = scale_w_key.unwrap_or_else(|| format!("{:.8}", n(&transform["scale"], "w", 100.0)));
        let h = scale_h_key.unwrap_or_else(|| format!("{:.8}", n(&transform["scale"], "h", 100.0)));
        filters.push(format!("scale=w='iw*min(max(({w})/100,0.01),10)':h='ih*min(max(({h})/100,0.01),10)':eval=frame"));
    } else if (scale_w - 1.0).abs() > 0.0001 || (scale_h - 1.0).abs() > 0.0001 {
        filters.push(format!("scale=iw*{scale_w:.5}:ih*{scale_h:.5}"));
    }
    let rotation = n(transform, "rotation", 0.0).to_radians();
    if let Some(rotation_expr) = keyframe_number_expr(clip, &["transform", "rotation"], 0.0, start, "t") {
        let diagonal = (f64::from(width).hypot(f64::from(height))).ceil() as u32;
        filters.push(format!("rotate='({rotation_expr})*PI/180':ow={diagonal}:oh={diagonal}:c=black@0"));
    } else if rotation.abs() > 0.0001 {
        filters.push(format!("rotate={rotation:.6}:ow=rotw(iw):oh=roth(ih):c=black@0"));
    }
    let opacity = (n(transform, "opacity", 100.0) / 100.0).clamp(0.0, 1.0);
    if let Some(opacity_expr) = keyframe_number_expr(clip, &["transform", "opacity"], 100.0, start, "T") {
        filters.push(format!("geq=a='alpha(X,Y)*min(max(({opacity_expr})/100,0),1)'"));
    } else if opacity < 0.999 { filters.push(format!("colorchannelmixer=aa={opacity:.4}")); }
    let x = n(&transform["position"], "x", 0.0) * width as f64 / 1920.0;
    let y = n(&transform["position"], "y", 0.0) * height as f64 / 1080.0;
    let x_expr = keyframe_number_expr(clip, &["transform", "position", "x"], 0.0, start, "t")
        .map(|expr| format!("({expr})*{width}/1920")).unwrap_or_else(|| format!("{x:.3}"));
    let y_expr = keyframe_number_expr(clip, &["transform", "position", "y"], 0.0, start, "t")
        .map(|expr| format!("({expr})*{height}/1080")).unwrap_or_else(|| format!("{y:.3}"));
    let (shake_x, shake_y) = if enabled(effects, "shake") {
        let amount = n(&effects["shake"], "amount", 0.0) * width as f64 / 1920.0 * 0.18;
        let freq = (n(&effects["shake"], "frequency", 8.0) * (1.0 - n(&effects["shake"], "smoothness", 35.0) / 120.0)).max(0.5);
        (format!("+sin(2*PI*t*{freq:.3})*{amount:.3}"), format!("+cos(2*PI*t*{freq:.3})*{amount:.3}"))
    } else { (String::new(), String::new()) };
    let overlay_x = format!("(main_w-overlay_w)/2+({x_expr}){shake_x}");
    let overlay_y = format!("(main_h-overlay_h)/2+({y_expr}){shake_y}");
    (filters.join(","), overlay_x, overlay_y)
}

fn audio_filters(clip: &Value, length: f64, total: f64) -> String {
    let props = &clip["props"];
    let audio = &props["audio"];
    let effects = &props["effects"];
    let mut filters = vec![format!("atrim=start={:.5}:duration={length:.5}", n(clip, "sourceOffset", 0.0).max(0.0)), "asetpts=PTS-STARTPTS".into()];
    let volume = (n(audio, "volume", 100.0) / 100.0).clamp(0.0, 2.0);
    if let Some(volume_expr) = keyframe_number_expr(clip, &["audio", "volume"], 100.0, 0.0, "t") {
        filters.push(format!("volume='min(max(({volume_expr})/100,0),2)':eval=frame"));
    } else if (volume - 1.0).abs() > 0.0001 { filters.push(format!("volume={volume:.4}")); }
    let pan = (n(audio, "pan", 0.0) / 100.0).clamp(-1.0, 1.0);
    if pan.abs() > 0.001 { filters.push(format!("stereotools=balance_out={pan:.4}")); }
    let bass = n(audio, "bass", 0.0); let treble = n(audio, "treble", 0.0);
    if bass.abs() > 0.001 { filters.push(format!("equalizer=f=100:t=q:w=1:g={bass:.3}")); }
    if treble.abs() > 0.001 { filters.push(format!("equalizer=f=4000:t=q:w=1:g={treble:.3}")); }
    if enabled(effects, "eq") {
        for (key, freq) in [("low", 100), ("mid", 1000), ("high", 8000)] {
            let gain = n(&effects["eq"], key, 0.0);
            if gain.abs() > 0.001 { filters.push(format!("equalizer=f={freq}:t=q:w=1:g={gain:.3}")); }
        }
    }
    if enabled(effects, "reverb") {
        let wet = (n(&effects["reverb"], "wet", 0.0) / 100.0).clamp(0.0, 1.0);
        let delay = (80.0 + n(&effects["reverb"], "room", 0.0) * 3.0).round() as u32;
        let damping = 1.0 - n(&effects["reverb"], "damp", 50.0).clamp(0.0, 100.0) / 125.0;
        filters.push(format!("aecho=1.0:{:.3}:{delay}|{}:{:.3}|{:.3}", 1.0 - wet * 0.45, delay * 2, wet * 0.35 * damping, wet * 0.18 * damping));
    }
    if enabled(effects, "delay") {
        let delay = n(&effects["delay"], "time", 320.0).clamp(1.0, 2000.0).round() as u32;
        let feedback = (n(&effects["delay"], "feedback", 0.0) / 100.0).clamp(0.0, 0.95);
        let mix = (n(&effects["delay"], "mix", 0.0) / 100.0).clamp(0.0, 1.0);
        filters.push(format!("aecho=1.0:{:.3}:{delay}|{}:{feedback:.3}|{:.3}", 1.0 - mix * 0.5, delay * 2, feedback * 0.5));
    }
    if enabled(effects, "compressor") { filters.push(format!("acompressor=threshold={:.3}dB:ratio={:.3}:attack={:.3}:release={:.3}", n(&effects["compressor"], "threshold", -18.0), n(&effects["compressor"], "ratio", 4.0), n(&effects["compressor"], "attack", 12.0), n(&effects["compressor"], "release", 140.0))); }
    if enabled(effects, "limiter") { filters.push(format!("alimiter=limit={:.5}:release={:.3}", 10_f64.powf(n(&effects["limiter"], "ceiling", -1.0) / 20.0), n(&effects["limiter"], "release", 80.0))); }
    if enabled(effects, "denoise") {
        let reduction = n(&effects["denoise"], "reduction", 0.0);
        let sensitivity = n(&effects["denoise"], "sensitivity", 50.0).clamp(0.0, 100.0);
        filters.push(format!("afftdn=nr={:.1}:nf={:.1}", (reduction * 0.24).clamp(0.0, 24.0), -50.0 + sensitivity * 0.3));
    }
    if audio["fadeIn"].as_bool().unwrap_or(false) { filters.push(format!("afade=t=in:st=0:d={:.4}", n(audio, "fadeInDuration", 1.0).clamp(0.0, length))); }
    if audio["fadeOut"].as_bool().unwrap_or(false) { let d = n(audio, "fadeOutDuration", 1.0).clamp(0.0, length); filters.push(format!("afade=t=out:st={:.4}:d={d:.4}", (length - d).max(0.0))); }
    let start = n(clip, "start", 0.0).max(0.0);
    filters.push(format!("adelay={}:all=1", (start * 1000.0).round() as u64));
    let _ = total;
    filters.join(",")
}

fn render_timeline(app: tauri::AppHandle, process: SharedExport, clips: Vec<Value>, settings: Value, time: f64, output: PathBuf) -> Result<String, String> {
    let width = n(&settings["size"], "width", 1920.0).clamp(16.0, 7680.0) as u32;
    let height = n(&settings["size"], "height", 1080.0).clamp(16.0, 4320.0) as u32;
    let fps = n(&settings["video"], "fps", 30.0).clamp(1.0, 120.0) as u32;
    let mode = settings["mode"].as_str().unwrap_or("video");
    let format = if mode == "image" { settings["image"]["format"].as_str().unwrap_or("png") } else { settings["video"]["format"].as_str().unwrap_or("mp4") };
    let include_audio = mode == "video" && format != "gif" && settings["video"]["audio"].as_bool().unwrap_or(true);
    let duration = clips.iter().filter_map(|clip| Some(n(clip, "start", 0.0) + n(clip, "dur", 0.0))).fold(0.0_f64, f64::max);
    if duration <= 0.0 { return Err("Add media to the timeline before exporting".into()); }
    let mut visual: Vec<_> = clips.iter().filter(|clip| clip["track"].as_str().map(|track| track.starts_with('v')).unwrap_or(false) && clip["path"].as_str().is_some()).collect();
    let titles: Vec<_> = clips.iter().filter(|clip| clip["theme"].as_str() == Some("title")).collect();
    visual.sort_by(|a,b| a["track"].as_str().cmp(&b["track"].as_str()).then_with(|| n(a, "start", 0.0).partial_cmp(&n(b, "start", 0.0)).unwrap_or(std::cmp::Ordering::Equal)));
    let audio: Vec<_> = if include_audio { clips.iter().filter(|clip| {
        clip["track"].as_str().map(|track| track.starts_with('a')).unwrap_or(false)
            && clip["path"].as_str().is_some()
            && (clip["mediaKind"].as_str() == Some("audio") || clip["hasAudio"].as_bool() == Some(true) || !clip["linkedAudioId"].is_null())
    }).collect() } else { Vec::new() };
    let mut transition_ends_by_track: HashMap<String, Vec<(f64, usize, &Value)>> = HashMap::new();
    let mut visual_starts_by_track: HashMap<String, Vec<f64>> = HashMap::new();
    for (order, clip) in clips.iter().enumerate() {
        let Some(track) = clip["track"].as_str() else { continue; };
        if clip["trans"].is_object() {
            transition_ends_by_track.entry(track.to_owned()).or_default()
                .push((n(clip, "start", 0.0) + n(clip, "dur", 0.0), order, clip));
        }
        if clip["path"].as_str().is_some() && track.starts_with('v') {
            visual_starts_by_track.entry(track.to_owned()).or_default().push(n(clip, "start", 0.0));
        }
    }
    for neighbors in transition_ends_by_track.values_mut() {
        neighbors.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal).then_with(|| a.1.cmp(&b.1)));
    }
    for starts in visual_starts_by_track.values_mut() { starts.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)); }
    if visual.is_empty() && titles.is_empty() { return Err("Add imported media or a title clip to the timeline before exporting".into()); }
    if let Some(clip) = visual.iter().chain(audio.iter()).find(|clip| !PathBuf::from(clip["path"].as_str().unwrap_or_default()).is_file()) {
        return Err(format!("Media file is missing: {}", clip["path"].as_str().unwrap_or("(unknown)")));
    }
    let transparent_background = mode == "image" && settings["image"]["transparent"].as_bool().unwrap_or(false);
    let background = if transparent_background { "black@0" } else { "black" };
    let mut args: Vec<String> = vec!["-y".into(), "-hide_banner".into(), "-loglevel".into(), "error".into(), "-progress".into(), "pipe:1".into(), "-nostats".into(), "-f".into(), "lavfi".into(), "-i".into(), format!("color=c={background}:s={width}x{height}:r={fps}:d={duration:.5}")];
    let mut input_index = 1_usize;
    let mut visual_inputs = Vec::new();
    for clip in &visual {
        let path = clip["path"].as_str().unwrap();
        let length = n(clip, "dur", 0.0).max(0.05);
        if clip["mediaKind"].as_str() == Some("image") { args.extend(["-loop".into(), "1".into(), "-t".into(), format!("{:.5}", length + n(clip, "sourceOffset", 0.0).max(0.0))]); }
        args.extend(["-i".into(), path.to_owned()]);
        visual_inputs.push(input_index); input_index += 1;
    }
    let mut audio_inputs = Vec::new();
    for clip in &audio { args.extend(["-i".into(), clip["path"].as_str().unwrap().to_owned()]); audio_inputs.push(input_index); input_index += 1; }

    let mut graph = vec!["[0:v]format=rgba[base0]".to_owned()];
    let mut base = "base0".to_owned();
    for (index, clip) in visual.iter().enumerate() {
        let input = visual_inputs[index];
        let length = n(clip, "dur", 0.0).max(0.05);
        let start = n(clip, "start", 0.0).max(0.0);
        let track = clip["track"].as_str().unwrap_or_default();
        let previous_transition = transition_ends_by_track.get(track).and_then(|neighbors| {
            let first = neighbors.partition_point(|(end, _, _)| *end < start - 0.05);
            neighbors[first..].iter().take_while(|(end, _, _)| *end < start + 0.05)
                .filter(|(end, _, _)| (*end - start).abs() < 0.05)
                .min_by_key(|(_, order, _)| *order)
                .map(|(_, _, other)| (other["trans"]["type"].as_str().unwrap_or("dissolve"), n(&other["trans"], "dur", 1.0)))
        });
        let end = start + length;
        let has_next = visual_starts_by_track.get(track).map(|starts| {
            let first = starts.partition_point(|next_start| *next_start < end - 0.05);
            starts[first..].iter().take_while(|next_start| **next_start < end + 0.05)
                .any(|next_start| (*next_start - end).abs() < 0.05)
        }).unwrap_or(false);
        let next_transition = if has_next {
            let trans = &clip["trans"];
            trans.is_object().then(|| (trans["type"].as_str().unwrap_or("dissolve"), n(trans, "dur", 1.0)))
        } else { None };
        let (filters, x, y) = video_filters(clip, width, height, start, length, previous_transition, next_transition);
        let raw = format!("visualraw{index}");
        let out = format!("visual{index}");
        graph.push(format!("[{input}:v]{filters}[{raw}]"));
        let effects = &clip["props"]["effects"];
        let mirror = &effects["mirror"];
        let mirror_mix = if enabled(effects, "mirror") { (n(mirror, "blend", 100.0) / 100.0).clamp(0.0, 1.0) } else { 0.0 };
        if mirror_mix > 0.0 {
            let normal = format!("mirror_normal{index}");
            let mirrored = format!("mirror_flip{index}");
            graph.push(format!("[{raw}]split=2[{normal}][{mirrored}]"));
            graph.push(format!("[{mirrored}]{}[mirror_flipped{index}]", if mirror["axis"].as_str() == Some("vertical") { "vflip" } else { "hflip" }));
            graph.push(format!("[{normal}][mirror_flipped{index}]blend=all_expr='A*{:.4}+B*{mirror_mix:.4}'[{out}]", 1.0 - mirror_mix));
        } else { graph.push(format!("[{raw}]null[{out}]")); }
        let next = format!("base{}", index + 1);
        let overlay_end = end + next_transition.map(|(_, d)| d).unwrap_or(0.0);
        graph.push(format!("[{base}][{out}]overlay=x='{x}':y='{y}':enable='between(t,{start:.5},{overlay_end:.5})':eof_action=pass:shortest=0[{next}]"));
        base = next;
    }
    let mut temp_files: Option<ExportTempFiles> = None;
    if !titles.is_empty() || clips.iter().any(|clip| clip["props"]["text"]["caption"].as_str().map(|text| !text.is_empty()).unwrap_or(false)) {
        let nonce = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_nanos();
        let temp_root = std::env::temp_dir().join(format!("pluto-export-{}-{nonce}", std::process::id()));
        fs::create_dir_all(&temp_root).map_err(|error| format!("Could not prepare text rendering: {error}"))?;
        temp_files = Some(ExportTempFiles(temp_root.clone()));
        let font = std::env::var_os("WINDIR").map(|root| PathBuf::from(root).join("Fonts").join("segoeui.ttf")).filter(|path| path.is_file());
        let font_option = font.as_ref().map(|path| format!("fontfile='{}'", ffmpeg_filter_path(path))).unwrap_or_else(|| "font='Arial'".into());
        let mut text_index = 0_usize;
        for clip in &titles {
            let start = n(clip, "start", 0.0).max(0.0);
            let end = start + n(clip, "dur", duration - start).max(0.05);
            let text = &clip["props"]["text"];
            let transform = &clip["props"]["transform"];
            let opacity = (n(transform, "opacity", 100.0) / 100.0).clamp(0.0, 1.0);
            let position_x = n(&transform["position"], "x", 0.0) * width as f64 / 1920.0;
            let position_y = n(&transform["position"], "y", 0.0) * height as f64 / 1080.0;
            let size = (48.0 * n(text, "size", 100.0) / 100.0 * n(&transform["scale"], "h", 100.0) / 100.0 * height as f64 / 1080.0).clamp(8.0, 500.0);
            let align = text["align"].as_str().unwrap_or("center");
            let x = match align { "left" => format!("{position_x:.2}"), "right" => format!("w-text_w+{position_x:.2}"), _ => format!("(w-text_w)/2+{position_x:.2}") };
            for (field, y) in [("title", format!("(h-text_h)/2+{position_y:.2}")), ("sub", format!("(h-text_h)/2+{:.2}", position_y + size * 0.78))] {
                let value = text[field].as_str().unwrap_or("");
                if value.is_empty() { continue; }
                let text_path = temp_root.join(format!("text-{text_index}.txt")); text_index += 1;
                fs::write(&text_path, value).map_err(|error| format!("Could not prepare title text: {error}"))?;
                let next = format!("text{}", text_index);
                let font_size = if field == "sub" { size * 0.36 } else { size };
                graph.push(format!("[{base}]drawtext={font_option}:textfile='{}':expansion=none:fontsize={font_size:.2}:fontcolor=white@{opacity:.3}:borderw=2:bordercolor=black@0.55:x='{x}':y='{y}':enable='between(t,{start:.5},{end:.5})'[{next}]", ffmpeg_filter_path(&text_path)));
                base = next;
            }
        }
        for clip in clips.iter().filter(|clip| clip["props"]["text"]["caption"].as_str().map(|text| !text.is_empty()).unwrap_or(false)) {
            let value = clip["props"]["text"]["caption"].as_str().unwrap_or("");
            let text_path = temp_root.join(format!("text-{text_index}.txt")); text_index += 1;
            fs::write(&text_path, value).map_err(|error| format!("Could not prepare caption text: {error}"))?;
            let start = n(clip, "start", 0.0).max(0.0); let end = start + n(clip, "dur", 0.0).max(0.05);
            let next = format!("text{}", text_index);
            let font_size = (32.0 * height as f64 / 1080.0).clamp(8.0, 200.0);
            graph.push(format!("[{base}]drawtext={font_option}:textfile='{}':expansion=none:fontsize={font_size:.2}:fontcolor=white:borderw=2:bordercolor=black@0.6:x='(w-text_w)/2':y='h-text_h-48':enable='between(t,{start:.5},{end:.5})'[{next}]", ffmpeg_filter_path(&text_path)));
            base = next;
        }
    }
    for (index, clip) in audio.iter().enumerate() {
        let input = audio_inputs[index];
        let length = n(clip, "dur", 0.0).max(0.05);
        graph.push(format!("[{input}:a]{}[audio{index}]", audio_filters(clip, length, duration)));
    }
    if !audio.is_empty() {
        let labels = (0..audio.len()).map(|i| format!("[audio{i}]")).collect::<String>();
        graph.push(format!("{labels}amix=inputs={}:duration=longest:normalize=0,apad=whole_dur={duration:.5}[aout]", audio.len()));
    }
    args.extend(["-filter_complex".into(), graph.join(";")]);
    args.extend(["-map".into(), format!("[{base}]")]);
    if mode == "image" {
        args.extend(["-ss".into(), format!("{:.5}", time.clamp(0.0, duration)) , "-frames:v".into(), "1".into()]);
        let quality = n(&settings["image"], "quality", 90.0).clamp(1.0, 100.0);
        match format {
            "jpg" => args.extend(["-c:v".into(), "mjpeg".into(), "-q:v".into(), format!("{}", (31.0 - quality * 0.3).round().clamp(2.0, 31.0) as u32)]),
            "webp" => args.extend(["-c:v".into(), "libwebp".into(), "-quality".into(), format!("{quality:.0}")]),
            "avif" => args.extend(["-c:v".into(), "libaom-av1".into(), "-crf".into(), format!("{:.0}", 63.0 - quality * 0.6), "-still-picture".into(), "1".into()]),
            _ => args.extend(["-c:v".into(), "png".into()]),
        }
    } else {
        args.extend(["-r".into(), fps.to_string()]);
        match format {
            "webm" => args.extend(["-c:v".into(), "libvpx-vp9".into(), "-b:v".into(), "0".into(), "-crf".into(), match settings["video"]["quality"].as_str().unwrap_or("high") { "low" => "40", "medium" => "32", "max" => "18", _ => "26" }.into()]),
            "gif" => args.extend(["-c:v".into(), "gif".into(), "-loop".into(), if settings["video"]["loop"].as_bool().unwrap_or(true) { "0" } else { "-1" }.into()]),
            _ => args.extend(["-c:v".into(), "libx264".into(), "-pix_fmt".into(), "yuv420p".into(), "-crf".into(), match settings["video"]["quality"].as_str().unwrap_or("high") { "low" => "28", "medium" => "23", "max" => "14", _ => "18" }.into()]),
        }
        if !audio.is_empty() {
            args.extend(["-map".into(), "[aout]".into()]);
            if format == "webm" { args.extend(["-c:a".into(), "libopus".into()]); }
            else if format != "gif" { args.extend(["-c:a".into(), "aac".into()]); }
        }
        if format == "mp4" { args.extend(["-movflags".into(), "+faststart".into()]); }
    }
    if mode == "image" {
        if settings["image"]["metadata"].as_bool().unwrap_or(true) {
            if let Some(name) = settings["output"]["name"].as_str() { args.extend(["-metadata".into(), format!("title={name}")]); }
        } else { args.extend(["-map_metadata".into(), "-1".into()]); }
        if settings["image"]["colorSpace"].as_str() == Some("p3") {
            args.extend(["-color_primaries".into(), "smpte432".into(), "-color_trc".into(), "iec61966-2-1".into(), "-colorspace".into(), "bt709".into()]);
        }
    }
    args.push(output.to_string_lossy().into_owned());
    let mut current = process.lock().map_err(|_| "Export process lock failed".to_owned())?;
    if current.is_some() { return Err("Another export is already running".into()); }
    let mut child = Command::new(multimedia_binary("ffmpeg"))
        .args(&args).stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped())
        .spawn().map_err(|error| format!("Could not start FFmpeg. Install FFmpeg or set PLUTO_FFMPEG_DIR: {error}"))?;
    if let Some(stdout) = child.stdout.take() {
        let progress_app = app.clone();
        thread::spawn(move || {
            for line in BufReader::new(stdout).lines().flatten() {
                if let Some(value) = line.strip_prefix("out_time_us=").and_then(|v| v.parse::<f64>().ok()) {
                    let _ = progress_app.emit("export-progress", ExportProgress { progress: (value / 1_000_000.0 / duration).clamp(0.0, 1.0) });
                } else if line == "progress=end" { let _ = progress_app.emit("export-progress", ExportProgress { progress: 1.0 }); }
            }
        });
    }
    let stderr_reader = child.stderr.take().map(|stderr| thread::spawn(move || {
        let mut message = String::new();
        let _ = BufReader::new(stderr).read_to_string(&mut message);
        message
    }));
    *current = Some(child);
    drop(current);
    loop {
        let status = {
            let mut guard = process.lock().map_err(|_| "Export process lock failed".to_owned())?;
            let result = guard.as_mut().ok_or_else(|| "Export canceled".to_owned())?.try_wait();
            match result {
                Ok(status) => status,
                Err(error) => {
                    if let Some(mut child) = guard.take() { let _ = child.kill(); let _ = child.wait(); }
                    let _ = fs::remove_file(&output);
                    return Err(format!("Could not read FFmpeg export status: {error}"));
                }
            }
        };
        if let Some(status) = status {
            let child = process.lock().map_err(|_| "Export process lock failed".to_owned())?.take().ok_or_else(|| "Export canceled".to_owned())?;
            let _ = child.wait_with_output();
            if status.success() { return Ok(output.to_string_lossy().into_owned()); }
            let message = stderr_reader.and_then(|reader| reader.join().ok()).unwrap_or_default();
            let _ = fs::remove_file(&output);
            let message = message.trim().to_owned();
            return Err(if message.is_empty() { "FFmpeg export failed or was canceled".into() } else { message });
        }
        thread::sleep(Duration::from_millis(80));
    }
}

#[tauri::command]
fn timeline_get(state: State<'_, SharedTimeline>) -> Result<Timeline, String> {
    state.lock().map(|timeline| timeline.clone()).map_err(|_| "Timeline lock failed".to_owned())
}

#[tauri::command]
fn timeline_initialize(state: State<'_, SharedTimeline>, clips: Vec<Clip>) -> Result<Timeline, String> {
    let mut timeline = state.lock().map_err(|_| "Timeline lock failed".to_owned())?;
    let snapping = timeline.snapping;
    *timeline = Timeline::new(clips).map_err(|error| format!("{error:?}"))?;
    timeline.snapping = snapping;
    Ok(timeline.clone())
}

#[tauri::command]
fn timeline_add_clip(state: State<'_, SharedTimeline>, clip: Clip) -> Result<Timeline, String> {
    let mut timeline = state.lock().map_err(|_| "Timeline lock failed".to_owned())?;
    timeline.add_clip(clip).map_err(|error| format!("{error:?}"))?;
    Ok(timeline.clone())
}

#[tauri::command]
fn timeline_move_clip(
    state: State<'_, SharedTimeline>,
    id: String,
    start: f64,
    track: TrackId,
    playhead: f64,
    snap_threshold: f64,
) -> Result<Timeline, String> {
    let mut timeline = state.lock().map_err(|_| "Timeline lock failed".to_owned())?;
    timeline.move_clip(&id, start, track, playhead, snap_threshold).map_err(|error| format!("{error:?}"))?;
    Ok(timeline.clone())
}

#[tauri::command]
fn timeline_trim_clip(state: State<'_, SharedTimeline>, id: String, start: f64, end: f64) -> Result<Timeline, String> {
    let mut timeline = state.lock().map_err(|_| "Timeline lock failed".to_owned())?;
    timeline.trim_clip(&id, start, end).map_err(|error| format!("{error:?}"))?;
    Ok(timeline.clone())
}

#[tauri::command]
fn timeline_split_clip(state: State<'_, SharedTimeline>, id: String, at: f64, right_id: String) -> Result<Timeline, String> {
    let mut timeline = state.lock().map_err(|_| "Timeline lock failed".to_owned())?;
    timeline.split_clip(&id, at, right_id).map_err(|error| format!("{error:?}"))?;
    Ok(timeline.clone())
}

#[tauri::command]
fn timeline_delete_clip(state: State<'_, SharedTimeline>, id: String) -> Result<Timeline, String> {
    let mut timeline = state.lock().map_err(|_| "Timeline lock failed".to_owned())?;
    timeline.delete_clip(&id).map_err(|error| format!("{error:?}"))?;
    Ok(timeline.clone())
}

#[tauri::command]
fn timeline_set_snapping(state: State<'_, SharedTimeline>, enabled: bool) -> Result<Timeline, String> {
    let mut timeline = state.lock().map_err(|_| "Timeline lock failed".to_owned())?;
    timeline.snapping = enabled;
    Ok(timeline.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(SharedTimeline::new(Timeline::default()))
        .manage(SharedExport::default())
        .invoke_handler(tauri::generate_handler![
            timeline_get,
            import_media,
            choose_export_directory,
            export_timeline,
            cancel_export,
            timeline_initialize,
            timeline_add_clip,
            timeline_move_clip,
            timeline_trim_clip,
            timeline_split_clip,
            timeline_delete_clip,
            timeline_set_snapping
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Pluto desktop application");
}

#[cfg(test)]
mod media_performance_tests {
    use super::*;

    #[test]
    fn derived_worker_pool_scales_down_for_low_core_hosts() {
        assert_eq!(derived_worker_count_for(0), 1);
        assert_eq!(derived_worker_count_for(1), 1);
        assert_eq!(derived_worker_count_for(2), 1);
        assert_eq!(derived_worker_count_for(3), 2);
        assert_eq!(derived_worker_count_for(16), 2);
    }

    #[test]
    fn imported_asset_exposes_a_revision_for_stale_result_filtering() {
        let asset = MediaAsset {
            path: "clip.mp4".into(), asset_version: "revision-1".into(), name: "clip.mp4".into(),
            duration: 8.0, kind: "video".into(), has_audio: true,
            thumbnail: None, filmstrip: None, waveform: None,
        };
        let value = serde_json::to_value(asset).unwrap();
        assert_eq!(value["assetVersion"], "revision-1");
    }
}
