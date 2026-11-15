(() => {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;

  const call = (command, args = {}) => invoke(command, args);
  window.plutoTimeline = Object.freeze({
    get: () => call("timeline_get"),
    initialize: (clips) => call("timeline_initialize", { clips }),
    sync: (clips) => call("timeline_sync", { clips }),
    addClip: (clip) => call("timeline_add_clip", { clip }),
    moveClip: ({ id, start, track, playhead, snapThreshold }) =>
      call("timeline_move_clip", { id, start, track, playhead, snapThreshold }),
    trimClip: ({ id, start, end }) => call("timeline_trim_clip", { id, start, end }),
    splitClip: ({ id, at, rightId }) => call("timeline_split_clip", { id, at, rightId }),
    deleteClip: (id) => call("timeline_delete_clip", { id }),
    setSnapping: (enabled) => call("timeline_set_snapping", { enabled }),
  });
  window.plutoNative = Object.freeze({
    importMedia: () => call("import_media"),
    chooseExportDirectory: () => call("choose_export_directory"),
    exportTimeline: ({ settings, time }) => call("export_timeline", { settings, time }),
    cancelExport: () => call("cancel_export"),
    listenExportProgress: (callback) => window.__TAURI__?.event?.listen?.("export-progress", ({ payload }) => callback(payload)),
    listenMediaAssets: (callback) => window.__TAURI__?.event?.listen?.("media-assets-ready", ({ payload }) => callback(payload)),
    convertFileSrc: (path) => window.__TAURI__?.core?.convertFileSrc?.(path) || path,
  });
})();
