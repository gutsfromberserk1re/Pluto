use serde::{Deserialize, Serialize};
use std::{collections::{HashMap, HashSet}, sync::OnceLock};

const MIN_TIMELINE_SECONDS: f64 = 60.0;
const EPSILON: f64 = 1e-7;

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
pub enum TrackId {
    #[serde(rename = "v1")]
    V1,
    #[serde(rename = "v2")]
    V2,
    #[serde(rename = "v3")]
    V3,
    #[serde(rename = "v4")]
    V4,
    #[serde(rename = "a1")]
    A1,
    #[serde(rename = "a2")]
    A2,
}

impl TrackId {
    pub fn is_video(self) -> bool {
        matches!(self, Self::V1 | Self::V2 | Self::V3 | Self::V4)
    }

    fn lanes(self) -> &'static [TrackId] {
        if self.is_video() {
            &[Self::V1, Self::V2, Self::V3, Self::V4]
        } else {
            &[Self::A1, Self::A2]
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Clip {
    pub id: String,
    pub track: TrackId,
    pub start: f64,
    #[serde(rename = "dur")]
    pub duration: f64,
    pub label: String,
    #[serde(default, rename = "linkedAudioId")]
    pub linked_clip_id: Option<String>,
    #[serde(default, flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

impl Clip {
    pub fn end(&self) -> f64 {
        self.start + self.duration
    }

    fn validate(&self) -> Result<(), TimelineError> {
        if self.id.trim().is_empty() || self.label.trim().is_empty() {
            return Err(TimelineError::InvalidClip("clip id and label are required".into()));
        }
        if !self.start.is_finite() || self.start < 0.0 {
            return Err(TimelineError::InvalidClip("start must be finite and non-negative".into()));
        }
        if !self.duration.is_finite() || self.duration <= 0.0 {
            return Err(TimelineError::InvalidClip("duration must be finite and positive".into()));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Timeline {
    clips: Vec<Clip>,
    pub duration_seconds: f64,
    pub snapping: bool,
    #[serde(skip)]
    index: OnceLock<TimelineIndex>,
}

#[derive(Clone, Debug)]
struct TimelineIndex {
    by_id: HashMap<String, usize>,
    by_track: HashMap<TrackId, TrackIndex>,
}

#[derive(Clone, Debug)]
struct TrackIndex {
    by_start: Vec<usize>,
    by_end: Vec<usize>,
    tree_size: usize,
    max_end: Vec<f64>,
}

impl TimelineIndex {
    fn build(clips: &[Clip]) -> Self {
        let mut by_id = HashMap::with_capacity(clips.len());
        let mut track_clips: HashMap<TrackId, Vec<usize>> = HashMap::new();
        for (index, clip) in clips.iter().enumerate() {
            by_id.entry(clip.id.clone()).or_insert(index);
            track_clips.entry(clip.track).or_default().push(index);
        }
        let by_track = track_clips.into_iter().map(|(track, indices)| {
            let mut by_start = indices.clone();
            by_start.sort_by(|a, b| clips[*a].start.partial_cmp(&clips[*b].start)
                .unwrap_or(std::cmp::Ordering::Equal).then_with(|| a.cmp(b)));
            let mut by_end = indices;
            by_end.sort_by(|a, b| clips[*a].end().partial_cmp(&clips[*b].end())
                .unwrap_or(std::cmp::Ordering::Equal).then_with(|| a.cmp(b)));
            let mut tree_size = 1;
            while tree_size < by_start.len() { tree_size <<= 1; }
            let mut max_end = vec![f64::NEG_INFINITY; tree_size * 2];
            for (position, clip_index) in by_start.iter().copied().enumerate() {
                max_end[tree_size + position] = clips[clip_index].end();
            }
            for node in (1..tree_size).rev() {
                max_end[node] = max_end[node * 2].max(max_end[node * 2 + 1]);
            }
            (track, TrackIndex { by_start, by_end, tree_size, max_end })
        }).collect();
        Self { by_id, by_track }
    }
}

impl TrackIndex {
    fn lower_bound_start(&self, clips: &[Clip], value: f64) -> usize {
        let mut low = 0;
        let mut high = self.by_start.len();
        while low < high {
            let middle = (low + high) / 2;
            if clips[self.by_start[middle]].start < value { low = middle + 1; }
            else { high = middle; }
        }
        low
    }

    fn upper_bound_start(&self, clips: &[Clip], value: f64) -> usize {
        let mut low = 0;
        let mut high = self.by_start.len();
        while low < high {
            let middle = (low + high) / 2;
            if clips[self.by_start[middle]].start <= value { low = middle + 1; }
            else { high = middle; }
        }
        low
    }

    fn lower_bound_end(&self, clips: &[Clip], value: f64) -> usize {
        let mut low = 0;
        let mut high = self.by_end.len();
        while low < high {
            let middle = (low + high) / 2;
            if clips[self.by_end[middle]].end() < value { low = middle + 1; }
            else { high = middle; }
        }
        low
    }

    fn collect_active(&self, clips: &[Clip], node: usize, left: usize, right: usize, limit: usize, at: f64, output: &mut Vec<usize>) {
        if left >= limit || self.max_end[node] <= at { return; }
        if right - left == 1 {
            let clip_index = self.by_start[left];
            if clips[clip_index].end() > at { output.push(clip_index); }
            return;
        }
        let middle = (left + right) / 2;
        self.collect_active(clips, node * 2, left, middle, limit, at, output);
        self.collect_active(clips, node * 2 + 1, middle, right, limit, at, output);
    }

    fn has_overlap(&self, clips: &[Clip], node: usize, left: usize, right: usize, limit: usize, threshold: f64, excluded_id: &str) -> bool {
        if left >= limit || self.max_end[node] <= threshold { return false; }
        if right - left == 1 {
            let clip = &clips[self.by_start[left]];
            return clip.id != excluded_id && clip.end() > threshold;
        }
        let middle = (left + right) / 2;
        self.has_overlap(clips, node * 2, left, middle, limit, threshold, excluded_id)
            || self.has_overlap(clips, node * 2 + 1, middle, right, limit, threshold, excluded_id)
    }
}

impl PartialEq for Timeline {
    fn eq(&self, other: &Self) -> bool {
        self.clips == other.clips && self.duration_seconds == other.duration_seconds && self.snapping == other.snapping
    }
}

impl Default for Timeline {
    fn default() -> Self {
        Self { clips: Vec::new(), duration_seconds: MIN_TIMELINE_SECONDS, snapping: true, index: OnceLock::new() }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(tag = "kind", content = "message", rename_all = "camelCase")]
pub enum TimelineError {
    InvalidClip(String),
    DuplicateId(String),
    ClipNotFound(String),
    InvalidRange,
    NoFreeTrack,
}

impl Timeline {
    pub fn new(clips: Vec<Clip>) -> Result<Self, TimelineError> {
        let mut timeline = Self { clips, ..Self::default() };
        timeline.validate_all()?;
        timeline.refresh_duration();
        Ok(timeline)
    }

    pub fn clips(&self) -> &[Clip] { &self.clips }

    pub fn visible_tracks(&self) -> HashSet<TrackId> {
        let mut tracks = HashSet::from([TrackId::V1, TrackId::A1]);
        tracks.extend(self.clips.iter().map(|clip| clip.track));
        tracks
    }

    /// Return clips active at `time`, preserving their original timeline order.
    /// The interval index is rebuilt lazily after any timeline mutation.
    pub fn active_clips_at(&self, time: f64, track: Option<TrackId>) -> Vec<&Clip> {
        if !time.is_finite() { return Vec::new(); }
        let index = self.index.get_or_init(|| TimelineIndex::build(&self.clips));
        let mut active = Vec::new();
        let tracks: Vec<_> = match track {
            Some(track) => vec![track],
            None => index.by_track.keys().copied().collect(),
        };
        for track in tracks {
            let Some(track_index) = index.by_track.get(&track) else { continue; };
            let limit = track_index.upper_bound_start(&self.clips, time);
            if limit > 0 {
                track_index.collect_active(&self.clips, 1, 0, track_index.tree_size, limit, time, &mut active);
            }
        }
        active.sort_unstable();
        active.into_iter().map(|clip_index| &self.clips[clip_index]).collect()
    }

    /// Find the first adjacent clip in original timeline order using the editor's 50 ms tolerance.
    pub fn adjacent_clip(&self, id: &str, next: bool) -> Result<Option<&Clip>, TimelineError> {
        let clip = self.find(id)?;
        let index = self.index.get_or_init(|| TimelineIndex::build(&self.clips));
        let Some(track_index) = index.by_track.get(&clip.track) else { return Ok(None); };
        let boundary = if next { clip.end() } else { clip.start };
        let (entries, first) = if next {
            (&track_index.by_start, track_index.lower_bound_start(&self.clips, boundary - 0.05))
        } else {
            (&track_index.by_end, track_index.lower_bound_end(&self.clips, boundary - 0.05))
        };
        let candidate = entries[first..].iter().copied().take_while(|candidate| {
            let value = if next { self.clips[*candidate].start } else { self.clips[*candidate].end() };
            value < boundary + 0.05
        }).filter(|candidate| {
            let other = &self.clips[*candidate];
            other.id != id && ((if next { other.start } else { other.end() }) - boundary).abs() < 0.05
        }).min();
        Ok(candidate.map(|candidate| &self.clips[candidate]))
    }

    /// Return the clip and transition data that govern the boundary around `id`.
    pub fn transition_neighbor(&self, id: &str, next: bool) -> Result<Option<(&Clip, &serde_json::Value)>, TimelineError> {
        let neighbor = self.adjacent_clip(id, next)?;
        let Some(neighbor) = neighbor else { return Ok(None); };
        let source = if next { self.find(id)? } else { neighbor };
        Ok(source.extra.get("trans").filter(|transition| transition.is_object()).map(|transition| (neighbor, transition)))
    }

    pub fn add_clip(&mut self, clip: Clip) -> Result<(), TimelineError> {
        clip.validate()?;
        if self.clips.iter().any(|current| current.id == clip.id) {
            return Err(TimelineError::DuplicateId(clip.id));
        }
        self.clips.push(clip);
        self.invalidate_index();
        self.refresh_duration();
        Ok(())
    }

    /// Move a clip to the closest available lane of the same media kind.
    /// Snap candidates include other clip boundaries and the playhead.
    pub fn move_clip(
        &mut self,
        id: &str,
        desired_start: f64,
        desired_track: TrackId,
        playhead: f64,
        snap_threshold: f64,
    ) -> Result<Clip, TimelineError> {
        if !desired_start.is_finite() || !playhead.is_finite() || !snap_threshold.is_finite() || snap_threshold < 0.0 {
            return Err(TimelineError::InvalidRange);
        }
        let original = self.find(id)?.clone();
        if original.track.is_video() != desired_track.is_video() {
            return Err(TimelineError::InvalidRange);
        }
        let mut start = desired_start.max(0.0);
        if self.snapping {
            start = self.snap_start(id, start, original.duration, playhead, snap_threshold);
        }
        let lane = self.nearest_free_lane(id, desired_track, start, original.duration)?;
        let delta = start - original.start;
        let mut moved = original.clone();
        moved.start = start;
        moved.track = lane;
        self.replace(moved.clone());

        if let Some(linked_id) = original.linked_clip_id.as_deref() {
            if let Some(mut linked) = self.clips.iter().find(|c| c.id == linked_id).cloned() {
                linked.start = (linked.start + delta).max(0.0);
                self.replace(linked);
            }
        }
        self.refresh_duration();
        Ok(moved)
    }

    pub fn trim_clip(&mut self, id: &str, start: f64, end: f64) -> Result<Clip, TimelineError> {
        if !start.is_finite() || !end.is_finite() || start < 0.0 || end - start <= EPSILON {
            return Err(TimelineError::InvalidRange);
        }
        let mut clip = self.find(id)?.clone();
        if self.overlaps(id, clip.track, start, end) {
            return Err(TimelineError::InvalidRange);
        }
        clip.start = start;
        clip.duration = end - start;
        self.replace(clip.clone());
        self.refresh_duration();
        Ok(clip)
    }

    pub fn split_clip(&mut self, id: &str, at: f64, right_id: String) -> Result<(Clip, Clip), TimelineError> {
        if !at.is_finite() || right_id.trim().is_empty() || self.clips.iter().any(|c| c.id == right_id) {
            return Err(TimelineError::InvalidRange);
        }
        let mut left = self.find(id)?.clone();
        if at <= left.start + EPSILON || at >= left.end() - EPSILON {
            return Err(TimelineError::InvalidRange);
        }
        let right = Clip {
            id: right_id,
            track: left.track,
            start: at,
            duration: left.end() - at,
            label: left.label.clone(),
            linked_clip_id: None,
            extra: left.extra.clone(),
        };
        left.duration = at - left.start;
        self.replace(left.clone());
        self.clips.push(right.clone());
        self.invalidate_index();
        self.refresh_duration();
        Ok((left, right))
    }

    pub fn delete_clip(&mut self, id: &str) -> Result<Vec<Clip>, TimelineError> {
        let clip = self.find(id)?.clone();
        let mut deleted = vec![clip.clone()];
        if let Some(linked) = clip.linked_clip_id.as_deref() {
            if let Some(other) = self.clips.iter().find(|c| c.id == linked) { deleted.push(other.clone()); }
        }
        let ids: HashSet<_> = deleted.iter().map(|c| c.id.as_str()).collect();
        self.clips.retain(|c| !ids.contains(c.id.as_str()));
        self.invalidate_index();
        self.refresh_duration();
        Ok(deleted)
    }

    fn snap_start(&self, id: &str, start: f64, duration: f64, playhead: f64, threshold: f64) -> f64 {
        let mut best: Option<(f64, f64)> = None;
        for candidate in std::iter::once(playhead).chain(self.clips.iter().filter(|c| c.id != id).flat_map(|c| [c.start, c.end()])) {
            for (edge, offset) in [(start, 0.0), (start + duration, duration)] {
                let distance = (candidate - edge).abs();
                if distance <= threshold && best.map_or(true, |(d, _)| distance < d) {
                    best = Some((distance, candidate - offset));
                }
            }
        }
        best.map_or(start, |(_, value)| value.max(0.0))
    }

    fn nearest_free_lane(&self, id: &str, desired: TrackId, start: f64, duration: f64) -> Result<TrackId, TimelineError> {
        let lanes = desired.lanes();
        let desired_index = lanes.iter().position(|lane| *lane == desired).unwrap_or(0);
        let mut candidates: Vec<_> = lanes.iter().copied().enumerate().collect();
        candidates.sort_by_key(|(index, _)| (index.abs_diff(desired_index), *index));
        candidates.into_iter().map(|(_, lane)| lane).find(|lane| {
            !self.overlaps(id, *lane, start, start + duration)
        }).ok_or(TimelineError::NoFreeTrack)
    }

    fn find(&self, id: &str) -> Result<&Clip, TimelineError> {
        let index = self.index.get_or_init(|| TimelineIndex::build(&self.clips));
        index.by_id.get(id).map(|clip_index| &self.clips[*clip_index])
            .ok_or_else(|| TimelineError::ClipNotFound(id.into()))
    }

    fn replace(&mut self, clip: Clip) {
        if let Some(index) = self.clips.iter().position(|current| current.id == clip.id) {
            self.clips[index] = clip;
            self.invalidate_index();
        }
    }

    fn overlaps(&self, id: &str, track: TrackId, start: f64, end: f64) -> bool {
        let index = self.index.get_or_init(|| TimelineIndex::build(&self.clips));
        let Some(track_index) = index.by_track.get(&track) else { return false; };
        let limit = track_index.lower_bound_start(&self.clips, end - EPSILON);
        limit > 0 && track_index.has_overlap(&self.clips, 1, 0, track_index.tree_size, limit, start + EPSILON, id)
    }

    fn invalidate_index(&mut self) { self.index.take(); }

    fn validate_all(&self) -> Result<(), TimelineError> {
        let mut ids = HashSet::new();
        for clip in &self.clips {
            clip.validate()?;
            if !ids.insert(&clip.id) { return Err(TimelineError::DuplicateId(clip.id.clone())); }
        }
        Ok(())
    }

    fn refresh_duration(&mut self) {
        self.duration_seconds = self.clips.iter().map(Clip::end).fold(MIN_TIMELINE_SECONDS, f64::max);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn clip(id: &str, track: TrackId, start: f64, duration: f64) -> Clip {
        Clip { id: id.into(), track, start, duration, label: id.into(), linked_clip_id: None, extra: HashMap::new() }
    }

    #[test]
    fn indexed_active_lookup_keeps_half_open_ranges_and_original_order() {
        let timeline = Timeline::new(vec![
            clip("video-a", TrackId::V1, 0.0, 4.0),
            clip("audio-a", TrackId::A1, 1.0, 2.0),
            clip("video-b", TrackId::V1, 4.0, 2.0),
        ]).unwrap();

        let at_start = timeline.active_clips_at(1.0, None);
        assert_eq!(at_start.iter().map(|clip| clip.id.as_str()).collect::<Vec<_>>(), vec!["video-a", "audio-a"]);
        let at_boundary = timeline.active_clips_at(4.0, Some(TrackId::V1));
        assert_eq!(at_boundary.iter().map(|clip| clip.id.as_str()).collect::<Vec<_>>(), vec!["video-b"]);
        assert!(timeline.active_clips_at(f64::NAN, None).is_empty());
    }

    #[test]
    fn timeline_mutations_invalidate_the_interval_index() {
        let mut timeline = Timeline::new(vec![
            clip("a", TrackId::V1, 0.0, 4.0),
            clip("b", TrackId::V1, 5.0, 2.0),
            clip("c", TrackId::V2, 2.0, 4.0),
        ]).unwrap();
        assert_eq!(timeline.active_clips_at(3.0, None).len(), 2);

        timeline.move_clip("c", 10.0, TrackId::V2, -1.0, 0.0).unwrap();
        assert_eq!(timeline.active_clips_at(3.0, None).iter().map(|clip| clip.id.as_str()).collect::<Vec<_>>(), vec!["a"]);
        timeline.trim_clip("a", 0.0, 2.0).unwrap();
        assert!(timeline.active_clips_at(3.0, Some(TrackId::V1)).is_empty());
        timeline.split_clip("b", 6.0, "d".into()).unwrap();
        assert_eq!(timeline.active_clips_at(6.5, Some(TrackId::V1))[0].id.as_str(), "d");
        timeline.delete_clip("d").unwrap();
        assert!(timeline.active_clips_at(6.5, Some(TrackId::V1)).is_empty());
    }

    #[test]
    fn indexed_adjacency_preserves_the_first_match_and_strict_tolerance() {
        let timeline = Timeline::new(vec![
            clip("source", TrackId::V1, 0.0, 1.0),
            clip("first-in-vector", TrackId::V1, 1.04, 1.0),
            clip("earlier-start", TrackId::V1, 0.96, 1.0),
            clip("edge-source", TrackId::V2, 1.0, 1.0),
            clip("outside-tolerance", TrackId::V2, 2.05, 1.0),
        ]).unwrap();
        assert_eq!(timeline.adjacent_clip("source", true).unwrap().unwrap().id.as_str(), "first-in-vector");
        assert_eq!(timeline.adjacent_clip("edge-source", true).unwrap(), None);
        assert_eq!(timeline.adjacent_clip("outside-tolerance", false).unwrap(), None);
    }

    #[test]
    fn transition_lookup_returns_the_source_clip_transition() {
        let mut source = clip("source", TrackId::V1, 0.0, 1.0);
        source.extra.insert("trans".into(), serde_json::json!({ "type": "wipe", "dur": 0.4 }));
        let timeline = Timeline::new(vec![source, clip("next", TrackId::V1, 1.0, 2.0)]).unwrap();
        let (neighbor, transition) = timeline.transition_neighbor("source", true).unwrap().unwrap();
        assert_eq!(neighbor.id.as_str(), "next");
        assert_eq!(transition["type"].as_str(), Some("wipe"));
        assert_eq!(timeline.transition_neighbor("next", false).unwrap().unwrap().1, transition);
    }

    #[test]
    fn serde_round_trip_rebuilds_the_private_index_without_changing_project_shape() {
        let timeline = Timeline::new(vec![clip("a", TrackId::V1, 0.0, 2.0)]).unwrap();
        let serialized = serde_json::to_value(&timeline).unwrap();
        assert!(serialized.get("index").is_none());
        let restored: Timeline = serde_json::from_value(serialized).unwrap();
        assert_eq!(timeline, restored);
        assert_eq!(restored.active_clips_at(1.0, None).len(), 1);
    }
}

