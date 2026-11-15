(function(){
const ICONS = {
  crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
  scale: '<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/>',
  position: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M12 10.5v3M10.5 12h3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  group: '<rect x="3" y="4" width="13" height="13" rx="2"/><path d="M8 20h10a3 3 0 0 0 3-3V9"/><path d="M8 8h5M8 12h4"/>',
  chevRight: '<path d="m9 18 6-6-6-6"/>',
  chevUp: '<path d="m18 15-6-6-6 6"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  distort: '<path d="M3 5c6 2 12 2 18 0v14c-6-2-12-2-18 0z"/><path d="M12 5.8v12.4M3 12c6 1.5 12 1.5 18 0"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="8" r="1.2"/><circle cx="8.6" cy="14.2" r="1.2"/><circle cx="15.4" cy="14.2" r="1.2"/>',
  sliders: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2.2"/><circle cx="9" cy="12" r="2.2"/><circle cx="17" cy="18" r="2.2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  detail: '<path d="m3 19 6.5-11 4 6.5 2.5-4L21 19z"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  blur: '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="6" stroke-dasharray="2 2.6"/><circle cx="12" cy="12" r="9.5" stroke-dasharray="1 3.4"/>',
  grain: '<circle cx="6" cy="6" r=".9"/><circle cx="12" cy="5" r=".9"/><circle cx="18" cy="7" r=".9"/><circle cx="9" cy="10" r=".9"/><circle cx="15" cy="11" r=".9"/><circle cx="5" cy="14" r=".9"/><circle cx="11" cy="15" r=".9"/><circle cx="18" cy="16" r=".9"/><circle cx="8" cy="19" r=".9"/><circle cx="14" cy="19" r=".9"/>',
  vignette: '<rect x="3" y="5" width="18" height="14" rx="3"/><ellipse cx="12" cy="12" rx="5.5" ry="3.8"/>',
  glow: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  stylize: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 20h16"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  windowMinimize: '<path d="M5 12h14"/>',
  windowMaximize: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
  windowRestore: '<rect x="7" y="4" width="12" height="12" rx="1"/><path d="M5 8v12h12"/>',
  keyPrev: '<path d="M5 4v16"/><path d="m15 5 7 7-7 7-7-7z"/>',
  keyNext: '<path d="M19 4v16"/><path d="m9 5 7 7-7 7-7-7z"/>',
  keyAdd: '<path d="m12 3 9 9-9 9-9-9z"/><path d="M12 8v8M8 12h8"/>',
  keyActive: '<path d="m12 2 10 10-10 10L2 12z" fill="currentColor"/>',
  play: '<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1l-11-6.8a.6.6 0 0 0-.9.5z" fill="currentColor"/>',
  pause: '<rect x="6.5" y="5" width="3.8" height="14" rx="1" fill="currentColor"/><rect x="13.7" y="5" width="3.8" height="14" rx="1" fill="currentColor"/>',
  skipBack: '<path d="M19 5.5v13L9.5 12z"/><path d="M5 5v14"/>',
  skipForward: '<path d="M5 5.5v13L14.5 12z"/><path d="M19 5v14"/>',
  chevLeft: '<path d="m15 18-6-6 6-6"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  cursor: '<path d="M5 3l14 8-6.5 1.8L10 19z"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8.5a7 7 0 0 0 14 0v-5a2 2 0 0 0-4 0v-2.5"/>',
  magnet: '<path d="M6 3v8a6 6 0 0 0 12 0V3"/><path d="M6 8h4M14 8h4"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  grid: '<path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  type: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8.5 11h5"/>',
  zoomIn: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8.5 11h5M11 8.5v5"/>',
  transition: '<path d="M3 5v14l8-7zM21 5v14l-8-7z"/>',
  wave: '<path d="M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3-4 5-3"/>',
  chroma: '<circle cx="9" cy="10" r="5.5"/><circle cx="15" cy="10" r="5.5"/><circle cx="12" cy="15" r="5.5"/>',
  glitch: '<path d="M4 7h10M10 12h10M4 17h8M16 17h4"/>',
  pixel: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM9 14h6v6H9z"/>',
  scan: '<path d="M3 6h18M3 10h18M3 14h18M3 18h18"/>',
  shake: '<path d="m7 7-4 5 4 5M17 7l4 5-4 5M12 6v12"/>',
  ripple: '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/>',
  strobe: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
};

const h = (tag, props = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  kids.flat().forEach((c) => c != null && c !== false && c !== "" && el.append(c));
  return el;
};

const icon = (name, size) => {
  const el = h("span", {
    class: "tp-icon",
    "aria-hidden": "true",
    html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`,
  });
  if (size) el.style.setProperty("--s", size + "px");
  return el;
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const clone = (o) => JSON.parse(JSON.stringify(o));
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const merge = (base, extra) => {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra || {})) out[k] = isObj(v) && isObj(base[k]) ? merge(base[k], v) : v;
  return out;
};

const createEmitter = () => {
  const map = new Map();
  return {
    on(evt, fn) {
      (map.get(evt) || map.set(evt, new Set()).get(evt)).add(fn);
      return () => map.get(evt)?.delete(fn);
    },
    off: (evt, fn) => map.get(evt)?.delete(fn),
    emit: (evt, payload) => map.get(evt)?.forEach((fn) => fn(payload)),
  };
};

function createNumberField({
  unit = "", min = -Infinity, max = Infinity, step = 1, decimals = 0, value = 0,
  label, name = "", compact = false, steppers = true, onChange,
}) {
  let v = value;
  const fmt = (n) => String(+n.toFixed(decimals));
  const input = h("input", {
    class: "tp-field__input", type: "text", inputmode: "decimal", spellcheck: "false",
    autocomplete: "off", "aria-label": name || label || "",
  });
  input.value = fmt(v);

  const apply = (n, emit = true) => {
    n = clamp(+n.toFixed(decimals), min, max);
    const changed = n !== v;
    v = n;
    input.value = fmt(v);
    if (emit && changed) onChange?.(v);
  };
  const nudge = (dir, big) => apply(v + dir * step * (big ? 10 : 1));

  input.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.pointerType === "touch") return;
    const startX = e.clientX, startValue = v;
    let scrubbing = false;
    const move = (ev) => {
      const distance = ev.clientX - startX;
      if (!scrubbing && Math.abs(distance) < 4) return;
      if (!scrubbing) {
        scrubbing = true;
        input.classList.add("is-scrubbing");
        input.blur();
        window.getSelection?.()?.removeAllRanges();
      }
      ev.preventDefault();
      const multiplier = ev.shiftKey ? 5 : ev.altKey ? 0.2 : 1;
      apply(startValue + Math.round(distance / 2) * step * multiplier);
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      input.classList.remove("is-scrubbing");
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end, { once: true });
    window.addEventListener("pointercancel", end, { once: true });
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); nudge(1, e.shiftKey); }
    else if (e.key === "ArrowDown") { e.preventDefault(); nudge(-1, e.shiftKey); }
    else if (e.key === "Enter") input.blur();
    else if (e.key === "Escape") { input.value = fmt(v); input.blur(); }
  });
  input.addEventListener("change", () => {
    const n = parseFloat(input.value.replace(",", "."));
    Number.isFinite(n) ? apply(n) : (input.value = fmt(v));
  });

  const stepBtn = (dir, ico, aria) => {
    const b = h("button", { class: "tp-step", type: "button", tabindex: "-1", "aria-label": aria });
    b.append(icon(ico));
    let t, i;
    const stop = () => { clearTimeout(t); clearInterval(i); };
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      nudge(dir, e.shiftKey);
      t = setTimeout(() => (i = setInterval(() => nudge(dir, e.shiftKey), 45)), 340);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, stop));
    return b;
  };

  const el = h("div", { class: "tp-field" + (compact ? " tp-field--sm" : "") },
    label && h("span", { class: "tp-field__label" }, label),
    input,
    unit && h("span", { class: "tp-field__unit" }, unit),
    steppers && h("span", { class: "tp-steps" }, stepBtn(1, "chevUp", "Increase"), stepBtn(-1, "chevDown", "Decrease")),
  );
  return { el, get: () => v, set: (n) => apply(n, false) };
}

function createLinkToggle({ on = false, label = "Link values", onToggle } = {}) {
  let state = !!on;
  const btn = h("button", { class: "tp-link", type: "button", "aria-pressed": String(state), "aria-label": label });
  btn.append(icon("link"));
  const set = (v) => { state = !!v; btn.setAttribute("aria-pressed", String(state)); };
  btn.addEventListener("click", () => { set(!state); onToggle?.(state); });
  return { el: btn, get: () => state, set };
}

function createDrawer({ open = false, className = "", content }) {
  const inner = h("div", { class: "tp-drawer__inner" }, content);
  const el = h("div", { class: "tp-drawer " + className }, inner);
  const set = (o) => { el.dataset.open = String(!!o); inner.inert = !o; };
  set(open);
  return { el, inner, set, isOpen: () => el.dataset.open === "true" };
}

function createPairCard({ iconName, title, fields, mode = "equal", linked = false, resetValues = {}, onChange, onLink }) {
  const [fa, fb] = fields;
  let isLinked = !!linked, ratio = 1;
  const A = createNumberField({ ...fa, label: undefined, name: fa.name || `${title} ${fa.label}`, onChange: (v) => handle(fa.key, v) });
  const B = createNumberField({ ...fb, label: undefined, name: fb.name || `${title} ${fb.label}`, onChange: (v) => handle(fb.key, v) });
  const captureRatio = () => { const a = A.get(), b = B.get(); ratio = a && b ? b / a : 1; };

  function handle(key, v) {
    const changes = { [key]: v };
    if (isLinked) {
      const fromA = key === fa.key;
      const other = fromA ? B : A;
      other.set(mode === "ratio" ? (fromA ? v * ratio : v / ratio) : v);
      changes[fromA ? fb.key : fa.key] = other.get();
    }
    onChange?.(changes);
  }

  const link = createLinkToggle({
    on: isLinked, label: `Link ${title} values`,
    onToggle: (on) => { isLinked = on; if (on) captureRatio(); onLink?.(on); },
  });
  captureRatio();
  const reset = h("button", { class: "tp-reset tp-pair-reset", type: "button", title: `Reset ${title}`, "aria-label": `Reset ${title}` }, icon("reset", 14));
  reset.addEventListener("click", () => {
    const values = Object.fromEntries(fields.map((field) => [field.key, resetValues[field.key] ?? 0]));
    for (const field of fields) setField(field.key, values[field.key]);
    captureRatio();
    onChange?.(values);
  });
  function setField(key, value) { (key === fa.key ? A : B).set(value); }

  const axis = (f, field) => h("div", { class: "tp-axis" }, h("span", { class: "tp-axis__label" }, f.label), field.el);
  const el = h("section", { class: "tp-card" },
    h("h3", { class: "tp-card__head" }, icon(iconName), title, reset),
    axis(fa, A),
    h("div", { class: "tp-link-row" }, link.el),
    axis(fb, B),
  );

  return {
    el,
    get: () => ({ [fa.key]: A.get(), [fb.key]: B.get(), linked: isLinked }),
    set(vals) {
      if (fa.key in vals) A.set(vals[fa.key]);
      if (fb.key in vals) B.set(vals[fb.key]);
      if ("linked" in vals) { isLinked = !!vals.linked; link.set(isLinked); }
      captureRatio();
    },
  };
}

function createQuad({ fields, pairs, layout = "cross", linked = false, label = "Link opposite values", onChange, onLink }) {
  let isLinked = !!linked;
  const F = {};
  for (const f of fields) {
    F[f.key] = createNumberField({
      ...f, compact: true,
      onChange: (v) => {
        const changes = { [f.key]: v };
        const twin = pairs[f.key];
        if (isLinked && twin) { F[twin].set(v); changes[twin] = F[twin].get(); }
        onChange?.(changes);
      },
    });
    F[f.key].el.dataset.area = f.area;
  }
  const link = createLinkToggle({ on: isLinked, label, onToggle: (on) => { isLinked = on; onLink?.(on); } });
  const el = h("div", { class: "tp-quad tp-quad--" + layout }, fields.map((f) => F[f.key].el), link.el);

  return {
    el,
    get() {
      const out = { linked: isLinked };
      for (const f of fields) out[f.key] = F[f.key].get();
      return out;
    },
    set(vals) {
      for (const f of fields) if (f.key in vals) F[f.key].set(vals[f.key]);
      if ("linked" in vals) { isLinked = !!vals.linked; link.set(isLinked); }
    },
  };
}

function createRotationRuler({ min = -180, max = 180, value = 0, snap = 0.75, ticks = 36, onInput } = {}) {
  const span = max - min;
  let target = value, shown = value, dragging = false, raf = 0, last = 0;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n) => String(+n.toFixed(2));

  const tickEls = [];
  for (let i = 0; i <= ticks; i++) {
    const cls = i % (ticks / 4) === 0 ? "tp-tick tp-tick--major" : i % (ticks / 12) === 0 ? "tp-tick tp-tick--mid" : "tp-tick";
    const t = h("i", { class: cls });
    t.style.left = (i / ticks) * 100 + "%";
    tickEls.push(t);
  }
  const labelEls = [0, 0.25, 0.5, 0.75, 1].map((p) => {
    const l = h("span", { class: "tp-ruler__label" }, fmt(min + p * span) + "°");
    l.style.left = p * 100 + "%";
    return l;
  });

  const needle = h("div", { class: "tp-ruler__needle" });
  const caret = h("div", { class: "tp-ruler__caret" });
  const scale = h("div", { class: "tp-ruler__scale" }, tickEls, labelEls, needle, caret);
  const el = h("div", {
    class: "tp-ruler", tabindex: "0", role: "slider", "aria-label": "Rotation",
    "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value,
  }, h("div", { class: "tp-ruler__track" }), scale);

  const render = () => { scale.style.setProperty("--p", ((shown - min) / span) * 100 + "%"); };
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    shown += (target - shown) * (1 - Math.exp(-dt * (dragging ? 42 : 20)));
    if (Math.abs(target - shown) < 0.004) { shown = target; raf = 0; render(); return; }
    render();
    raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (reduce) { shown = target; render(); return; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  };

  const setTarget = (v) => {
    target = clamp(v, min, max);
    el.setAttribute("aria-valuenow", fmt(target));
    kick();
  };
  const fromUser = (v) => {
    const before = target;
    setTarget(v);
    if (target !== before) onInput?.(target);
  };

  const valueAt = (e) => {
    const r = scale.getBoundingClientRect();
    let v = min + clamp((e.clientX - r.left) / r.width, 0, 1) * span;
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const pt = min + p * span;
      if (Math.abs(v - pt) <= snap) return pt;
    }
    return Math.round(v * 10) / 10;
  };

  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging = true;
    el.setPointerCapture(e.pointerId);
    el.classList.add("is-dragging");
    fromUser(valueAt(e));
  });
  el.addEventListener("pointermove", (e) => dragging && fromUser(valueAt(e)));
  const end = () => { dragging = false; el.classList.remove("is-dragging"); };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  el.addEventListener("keydown", (e) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    fromUser(target + d * (e.shiftKey ? 5 : 0.5));
  });

  render();
  return {
    el,
    get: () => target,
    set: setTarget,
    destroy: () => cancelAnimationFrame(raf),
  };
}

const DEFAULT_STATE = {
  scale: { w: 100, h: 100, linked: true },
  position: { x: 0, y: 0, linked: false },
  rotation: 0,
  opacity: 100,
  crop: { top: 0, right: 0, bottom: 0, left: 0, linked: false },
  distort: { tl: 0, tr: 0, br: 0, bl: 0, linked: false },
};

const DEFAULT_LIMITS = {
  scale: { min: 1, max: 1000, step: 1, decimals: 1 },
  position: { min: -10000, max: 10000, step: 1, decimals: 0 },
  rotation: { min: -180, max: 180, step: 0.5, decimals: 1 },
  opacity: { min: 0, max: 100, step: 1, decimals: 0 },
  crop: { min: 0, max: 10000, step: 1, decimals: 0 },
  distort: { min: -1000, max: 1000, step: 1, decimals: 0 },
};

function createTransformPanel(mount, options = {}) {
  const limits = merge(DEFAULT_LIMITS, options.limits);
  const state = merge(DEFAULT_STATE, options.initial);
  const bus = createEmitter();
  const root = h("div", { class: "tp", role: "group", "aria-label": options.title || "Transform" });

  const emit = (group, changed, source = "user") => {
    const payload = { group, changed, value: clone(state[group]), state: clone(state), source };
    bus.emit("change", payload);
    root.dispatchEvent(new CustomEvent("transform:change", { detail: payload, bubbles: true }));
  };
  const onGroup = (group) => ({
    onChange: (ch) => { Object.assign(state[group], ch); emit(group, Object.keys(ch)); },
    onLink: (on) => { state[group].linked = on; emit(group, ["linked"]); },
  });

  const L = limits;
  const scaleCard = createPairCard({
    iconName: "scale", title: "Scale", mode: "ratio", linked: state.scale.linked,
    resetValues: { w: 100, h: 100 },
    fields: [
      { key: "w", label: "W", unit: "%", value: state.scale.w, ...L.scale },
      { key: "h", label: "H", unit: "%", value: state.scale.h, ...L.scale },
    ],
    ...onGroup("scale"),
  });
  const posCard = createPairCard({
    iconName: "position", title: "Position", mode: "equal", linked: state.position.linked,
    resetValues: { x: 0, y: 0 },
    fields: [
      { key: "x", label: "X", unit: "px", value: state.position.x, ...L.position },
      { key: "y", label: "Y", unit: "px", value: state.position.y, ...L.position },
    ],
    ...onGroup("position"),
  });

  const rotField = createNumberField({
    unit: "°", steppers: false, name: "Rotation", value: state.rotation, ...L.rotation,
    onChange: (v) => { state.rotation = v; ruler.set(v); emit("rotation", ["rotation"]); },
  });
  rotField.el.classList.add("tp-rot__field");
  const ruler = createRotationRuler({
    min: L.rotation.min, max: L.rotation.max, value: state.rotation,
    onInput: (v) => { state.rotation = v; rotField.set(v); emit("rotation", ["rotation"]); },
  });
  const resetBtn = h("button", { class: "tp-reset", type: "button", "aria-label": "Reset rotation" }, icon("reset"));
  resetBtn.addEventListener("click", () => {
    if (state.rotation === 0) return;
    state.rotation = 0; rotField.set(0); ruler.set(0); emit("rotation", ["rotation"]);
  });
  const rotCard = h("section", { class: "tp-card" },
    h("div", { class: "tp-rot__head" }, resetBtn, h("span", { class: "tp-label" }, "Rotation"), rotField.el),
    ruler.el,
  );
  const opacity = createSlider({ label: "Opacity", min: 0, max: 100, default: 100, unit: "%", value: state.opacity, ...L.opacity,
    onInput: (v) => { state.opacity = v; emit("opacity", ["opacity"]); } });

  const cropQuad = createQuad({
    linked: state.crop.linked, label: "Link opposite crop sides",
    pairs: { top: "bottom", bottom: "top", left: "right", right: "left" },
    fields: [
      { key: "top", area: "a", label: "T", name: "Crop top", unit: "px", value: state.crop.top, ...L.crop },
      { key: "left", area: "b", label: "L", name: "Crop left", unit: "px", value: state.crop.left, ...L.crop },
      { key: "right", area: "c", label: "R", name: "Crop right", unit: "px", value: state.crop.right, ...L.crop },
      { key: "bottom", area: "d", label: "B", name: "Crop bottom", unit: "px", value: state.crop.bottom, ...L.crop },
    ],
    ...onGroup("crop"),
  });
  const distortQuad = createQuad({
    linked: state.distort.linked, label: "Link opposite corners", layout: "corners",
    pairs: { tl: "br", br: "tl", tr: "bl", bl: "tr" },
    fields: [
      { key: "tl", area: "a", label: "TL", name: "Distort top-left", unit: "px", value: state.distort.tl, ...L.distort },
      { key: "tr", area: "c", label: "TR", name: "Distort top-right", unit: "px", value: state.distort.tr, ...L.distort },
      { key: "bl", area: "b", label: "BL", name: "Distort bottom-left", unit: "px", value: state.distort.bl, ...L.distort },
      { key: "br", area: "d", label: "BR", name: "Distort bottom-right", unit: "px", value: state.distort.br, ...L.distort },
    ],
    ...onGroup("distort"),
  });

  const SECTIONS = {
    crop: { label: "Crop Tools", icon: "crop", quad: cropQuad },
    distort: { label: "Distort", icon: "distort", quad: distortQuad },
  };
  let openSection = null;
  const navBtns = {}, panes = {};
  for (const [key, s] of Object.entries(SECTIONS)) {
    const chevron = icon("chevRight"); chevron.classList.add("tp-chev");
    navBtns[key] = h("button", { class:"tp-nav-btn",type:"button","aria-expanded":"false" },
      icon(s.icon),s.label,chevron);
    navBtns[key].addEventListener("click", () => setSection(openSection === key ? null : key));
    panes[key] = h("div", { class: "tp-pane tp-card", hidden: true }, s.quad.el);
  }
  const subDrawer = createDrawer({ className: "tp-sub", content: h("div", { class: "tp-sub__inner" }, Object.values(panes)) });

  function setSection(name, silent) {
    openSection = name;
    for (const key of Object.keys(SECTIONS)) {
      navBtns[key].setAttribute("aria-expanded",String(name===key));
      if (name) panes[key].hidden = name !== key;
    }
    subDrawer.set(!!name);
    if (!silent) bus.emit("section", { section: name });
  }

  const body = h("div", { class: "tp-body" },
    h("div", { class: "tp-grid" }, posCard.el, scaleCard.el),
    rotCard,
    opacity.el,
    h("div", { class: "tp-navgroup" }, h("div", { class: "tp-nav" }, navBtns.crop, navBtns.distort), subDrawer.el),
  );

  root.append(
    h("header", { class: "tp-head" }, icon("crop", 30), h("h2", { class: "tp-title" }, options.title || "Transform")),
    body,
  );
  mount.append(root);
  setSection(options.section ?? null, true);

  const get = () => clone(state);
  function set(patch = {}, { silent = false } = {}) {
    const touched = [];
    if (patch.scale) { scaleCard.set(patch.scale); Object.assign(state.scale, scaleCard.get()); touched.push("scale"); }
    if (patch.position) { posCard.set(patch.position); Object.assign(state.position, posCard.get()); touched.push("position"); }
    if (patch.crop) { cropQuad.set(patch.crop); Object.assign(state.crop, cropQuad.get()); touched.push("crop"); }
    if (patch.distort) { distortQuad.set(patch.distort); Object.assign(state.distort, distortQuad.get()); touched.push("distort"); }
    if (typeof patch.rotation === "number") {
      rotField.set(patch.rotation); state.rotation = rotField.get(); ruler.set(state.rotation); touched.push("rotation");
    }
    if (typeof patch.opacity === "number") { opacity.set(patch.opacity); state.opacity = opacity.get(); touched.push("opacity"); }
    if (!silent) touched.forEach((g) => emit(g, Object.keys(isObj(patch[g]) ? patch[g] : { [g]: 1 }), "api"));
  }

  return {
    el: root, get, set,
    reset: (opts) => set(clone(DEFAULT_STATE), opts),
    on: bus.on, off: bus.off,
    open: (name) => setSection(name),
    close: () => setSection(null),
    destroy() { ruler.destroy(); root.remove(); },
  };
}

const WHEELS = [
  { key: "shadows", label: "Shadows" },
  { key: "tint", label: "Tint" },
  { key: "highlights", label: "Highlights" },
];

const CHANNELS = [
  { key: "all", label: "All" },
  { key: "red", label: "Red", hue: 0, color: "#ef4444" },
  { key: "orange", label: "Orange", hue: 28, color: "#f97316" },
  { key: "yellow", label: "Yellow", hue: 52, color: "#eab308" },
  { key: "green", label: "Green", hue: 130, color: "#22c55e" },
  { key: "aqua", label: "Aqua", hue: 182, color: "#06b6d4" },
  { key: "blue", label: "Blue", hue: 220, color: "#3b82f6" },
  { key: "purple", label: "Purple", hue: 270, color: "#8b5cf6" },
  { key: "magenta", label: "Magenta", hue: 320, color: "#ec4899" },
];

const SLIDER_GROUPS = {
  light: {
    label: "Light", icon: "sun",
    sliders: [
      { key: "exposure", label: "Exposure", min: -5, max: 5, step: 0.05, decimals: 2 },
      { key: "brightness", label: "Brightness" },
      { key: "contrast", label: "Contrast" },
      { key: "highlights", label: "Highlights" },
      { key: "shadows", label: "Shadows" },
      { key: "whites", label: "Whites" },
      { key: "blacks", label: "Blacks" },
    ],
  },
  color: {
    label: "Color", icon: "droplet",
    sliders: [
      { key: "temperature", label: "Temperature", track: "linear-gradient(90deg,#4aa8ff,#d9d9de 50%,#ffb347)" },
      { key: "vibrance", label: "Vibrance" },
      { key: "saturation", label: "Saturation" },
    ],
  },
  detail: {
    label: "Detail", icon: "detail",
    sliders: [
      { key: "sharpness", label: "Sharpness", min: 0, max: 100 },
      { key: "clarity", label: "Clarity" },
      { key: "vignette", label: "Vignette" },
    ],
  },
};

const HSL_SLIDERS = [
  { key: "h", label: "Hue" },
  { key: "s", label: "Saturation" },
  { key: "l", label: "Lightness" },
];

const normSlider = (s) => ({ min: -100, max: 100, step: 1, decimals: 0, default: 0, unit: "", ...s });

function buildDefaultState(groups = SLIDER_GROUPS, wheels = WHEELS) {
  return {
    grading: Object.fromEntries(wheels.map((w) => [w.key, { hue: 0, amount: 0 }])),
    hsl: Object.fromEntries(CHANNELS.map((c) => [c.key, { h: 0, s: 0, l: 0 }])),
    ...Object.fromEntries(
      Object.entries(groups).map(([g, def]) => [g, Object.fromEntries(def.sliders.map((s) => [s.key, normSlider(s).default]))]),
    ),
  };
}

function createSlider(opts) {
  const { label, min, max, step, decimals, unit, track } = normSlider(opts);
  const def = normSlider(opts).default;
  const origin = opts.origin ?? def;
  const span = max - min;
  let v = clamp(opts.value ?? def, min, max);

  const round = (n) => clamp(+(Math.round((n - min) / step) * step + min).toFixed(decimals), min, max);
  const pct = (n) => ((n - min) / span) * 100;

  const field = createNumberField({
    steppers: false, compact: true, min, max, step, decimals, unit, name: label, value: v,
    onChange: (n) => apply(n, true),
  });
  const rail = h("div", { class: "tpc-slider__rail" });
  const fill = h("div", { class: "tpc-slider__fill" });
  const thumb = h("div", { class: "tpc-slider__thumb" });
  const area = h("div", { class: "tpc-slider__area" }, rail, fill, thumb);
  const hit = h("div", {
    class: "tpc-slider__hit", tabindex: "0", role: "slider", "aria-label": label,
    "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": v,
  }, area);
  const el = h("div", { class: "tpc-slider" },
    h("div", { class: "tpc-slider__head" }, h("span", { class: "tpc-slider__label" }, label), field.el),
    hit,
  );

  const setTrack = (css) => {
    el.classList.toggle("has-track", !!css);
    rail.style.background = css || "";
  };
  setTrack(track);

  const render = () => {
    el.style.setProperty("--p", pct(v) + "%");
    el.style.setProperty("--z", pct(clamp(origin, min, max)) + "%");
    el.dataset.mod = String(v !== def);
    hit.setAttribute("aria-valuenow", v);
    field.set(v);
  };
  function apply(n, user) {
    const next = round(n);
    const changed = next !== v;
    v = next;
    render();
    if (user && changed) opts.onInput?.(v);
  }

  const valueAt = (e) => {
    const r = hit.getBoundingClientRect();
    const n = min + clamp((e.clientX - r.left - 9) / Math.max(1, r.width - 18), 0, 1) * span;
    return Math.abs(n - def) <= span * 0.012 ? def : n;
  };
  let dragging = false;
  hit.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    try { hit.setPointerCapture(e.pointerId); } catch { /* Pointer capture is not available in every preview host. */ }
    el.classList.add("is-dragging");
    apply(valueAt(e), true);
  });
  hit.addEventListener("pointermove", (e) => dragging && apply(valueAt(e), true));
  const end = () => { dragging = false; el.classList.remove("is-dragging"); };
  hit.addEventListener("pointerup", end);
  hit.addEventListener("pointercancel", end);
  hit.addEventListener("dblclick", () => apply(def, true));
  el.querySelector(".tpc-slider__label").addEventListener("dblclick", () => apply(def, true));
  hit.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (d) { e.preventDefault(); apply(v + d * step * (e.shiftKey ? 10 : 1), true); }
    else if (e.key === "Home") { e.preventDefault(); apply(min, true); }
    else if (e.key === "End") { e.preventDefault(); apply(max, true); }
  });

  render();
  return {
    el, get: () => v, setTrack,
    set: (n) => apply(n, false),
    reset: () => apply(def, false),
    isDefault: () => v === def,
  };
}

function createColorWheel({ label, value = { hue: 0, amount: 0 }, onInput }) {
  let v = { hue: value.hue, amount: value.amount };
  const puck = h("div", { class: "tpc-wheel__puck" });
  const wheel = h("div", { class: "tpc-wheel", tabindex: "0", role: "group", "aria-label": `${label} color` }, puck);
  const readout = h("div", { class: "tpc-wheel__readout" });
  const el = h("div", { class: "tpc-wheelwrap" }, wheel, h("div", { class: "tpc-wheel__label" }, label), readout);

  const render = () => {
    const a = (v.amount / 100) * 50, r = (v.hue * Math.PI) / 180;
    wheel.style.setProperty("--x", 50 + Math.sin(r) * a + "%");
    wheel.style.setProperty("--y", 50 - Math.cos(r) * a + "%");
    wheel.style.setProperty("--c", v.amount ? `hsl(${v.hue} 90% 58%)` : "#dcdde2");
    wheel.dataset.mod = String(v.amount > 0);
    readout.textContent = v.amount ? `${Math.round(v.hue)}° · ${Math.round(v.amount)}` : "Neutral";
  };
  const commit = (hue, amount, user) => {
    hue = ((Math.round(hue) % 360) + 360) % 360;
    amount = clamp(Math.round(amount), 0, 100);
    if (hue === v.hue && amount === v.amount) return;
    v = { hue, amount };
    render();
    if (user) onInput?.({ ...v });
  };
  const fromEvent = (e) => {
    const r = wheel.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const amount = Math.min(1, Math.hypot(dx, dy) / (r.width / 2)) * 100;
    commit((Math.atan2(dx, -dy) * 180) / Math.PI, amount < 4 ? 0 : amount, true);
  };

  let dragging = false;
  wheel.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging = true;
    wheel.setPointerCapture(e.pointerId);
    wheel.classList.add("is-dragging");
    fromEvent(e);
  });
  wheel.addEventListener("pointermove", (e) => dragging && fromEvent(e));
  const end = () => { dragging = false; wheel.classList.remove("is-dragging"); };
  wheel.addEventListener("pointerup", end);
  wheel.addEventListener("pointercancel", end);
  wheel.addEventListener("dblclick", () => commit(0, 0, true));
  wheel.addEventListener("keydown", (e) => {
    const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!k) return;
    e.preventDefault();
    const s = e.shiftKey ? 10 : 2, r = (v.hue * Math.PI) / 180;
    const x = Math.sin(r) * v.amount + k[0] * s, y = -Math.cos(r) * v.amount + k[1] * s;
    const amt = Math.hypot(x, y);
    commit(amt ? (Math.atan2(x, -y) * 180) / Math.PI : v.hue, amt, true);
  });

  render();
  return {
    el, get: () => ({ ...v }),
    set: (n) => commit(n.hue ?? v.hue, n.amount ?? v.amount, false),
    reset: () => commit(0, 0, false),
  };
}

const hslTracks = (hue) =>
  hue == null
    ? {
        h: "linear-gradient(90deg,#ff4d6d,#ffb84d,#f5f54d,#4dff88,#4dd2ff,#6d6dff,#d24dff,#ff4d6d)",
        s: "linear-gradient(90deg,#6b6d75,#e84a5f)",
        l: "linear-gradient(90deg,#0a0a0b,#8d8f98,#f4f4f6)",
      }
    : {
        h: `linear-gradient(90deg,hsl(${hue - 35} 85% 55%),hsl(${hue} 85% 55%),hsl(${hue + 35} 85% 55%))`,
        s: `linear-gradient(90deg,hsl(${hue} 0% 45%),hsl(${hue} 90% 52%))`,
        l: `linear-gradient(90deg,#0a0a0b,hsl(${hue} 85% 50%),#f4f4f6)`,
      };

function createColorsPanel(mount, options = {}) {
  const groups = options.groups || SLIDER_GROUPS;
  const wheelDefs = options.wheels || WHEELS;
  const state = merge(buildDefaultState(groups, wheelDefs), options.initial);
  const bus = createEmitter();
  const root = h("div", { class: "tp tpc", role: "group", "aria-label": options.title || "Colors" });
  const secs = {};

  const emit = (group, key, source = "user") => {
    const payload = { group, key, value: clone(state[group][key]), state: clone(state), source };
    bus.emit("change", payload);
    root.dispatchEvent(new CustomEvent("colors:change", { detail: payload, bubbles: true }));
    refreshMarks();
  };

  const wheels = {};
  for (const w of wheelDefs) {
    wheels[w.key] = createColorWheel({
      label: w.label, value: state.grading[w.key],
      onInput: (val) => { state.grading[w.key] = val; emit("grading", w.key); },
    });
  }
  const gradingBody = h("div", { class: "tpc-wheels" }, wheelDefs.map((w) => wheels[w.key].el));

  let channel = options.channel && state.hsl[options.channel] ? options.channel : "all";
  const hslSliders = {};
  for (const s of HSL_SLIDERS) {
    hslSliders[s.key] = createSlider({
      ...s, value: state.hsl[channel][s.key],
      onInput: (n) => { state.hsl[channel][s.key] = n; emit("hsl", channel); },
    });
  }
  const chanBtns = {};
  const chanRow = h("div", { class: "tpc-chans", role: "radiogroup", "aria-label": "Color range" },
    CHANNELS.map((c) => {
      const b = h("button", { class: "tpc-chan" + (c.key === "all" ? " tpc-chan--all" : ""), type: "button", role: "radio", "aria-label": c.label, title: c.label });
      if (c.color) b.style.setProperty("--c", c.color);
      b.addEventListener("click", () => setChannel(c.key));
      chanBtns[c.key] = b;
      return b;
    }),
  );
  function refreshHsl() {
    const hue = CHANNELS.find((c) => c.key === channel).hue;
    const tr = hslTracks(hue);
    for (const s of HSL_SLIDERS) {
      hslSliders[s.key].set(state.hsl[channel][s.key]);
      hslSliders[s.key].setTrack(tr[s.key]);
    }
    for (const c of CHANNELS) chanBtns[c.key].setAttribute("aria-checked", String(c.key === channel));
  }
  function setChannel(key, silent) {
    if (!state.hsl[key]) return;
    channel = key;
    refreshHsl();
    if (!silent) bus.emit("channel", { channel });
  }
  const hslBody = h("div", { class: "tpc-hsl" }, chanRow, Object.values(hslSliders).map((s) => s.el));

  const sliders = {};
  const groupBodies = {};
  for (const [g, def] of Object.entries(groups)) {
    sliders[g] = {};
    for (const raw of def.sliders) {
      const s = normSlider(raw);
      sliders[g][s.key] = createSlider({
        ...s, value: state[g][s.key],
        onInput: (n) => { state[g][s.key] = n; emit(g, s.key); },
      });
    }
    groupBodies[g] = h("div", { class: "tpc-sliders" }, Object.values(sliders[g]).map((s) => s.el));
  }

  const sectionDefs = [
    { key: "grading", label: "Color Grading", icon: "wheel", body: gradingBody },
    { key: "hsl", label: "HSL", icon: "sliders", body: hslBody },
    ...Object.entries(groups).map(([g, def]) => ({ key: g, label: def.label, icon: def.icon || "sliders", body: groupBodies[g] })),
  ];
  const open = new Set([].concat(options.open === undefined ? ["light"] : options.open ?? []));
  const multiple = !!options.multiple;

  const list = h("div", { class: "tpc-list" });
  for (const d of sectionDefs) {
    const dot = h("span",{class:"tpc-dot","aria-hidden":"true"});
    const expand = h("span",{class:"tp-expand-icon","aria-hidden":"true"},open.has(d.key)?"−":"+");
    const btn = h("button",{class:"tp-nav-btn",type:"button","aria-expanded":"false"},icon(d.icon),d.label,dot,expand);
    btn.addEventListener("click", () => toggle(d.key));
    const resetBtn = h("button", { class: "tpc-reset", type: "button", "aria-label": `Reset ${d.label}` }, icon("reset", 15), "Reset");
    resetBtn.addEventListener("click", () => reset(d.key, "user"));
    const pane = h("div", { class: "tp-card tpc-pane" }, h("div", { class: "tpc-pane__head" }, resetBtn), d.body);
    const drawer = createDrawer({ className: "tp-sub", content: h("div", { class: "tp-sub__inner" }, pane) });
    secs[d.key] = { btn, drawer };
    list.append(h("div", { class: "tpc-sec" }, btn, drawer.el));
  }

  function applyOpen() {
    for (const [k, s] of Object.entries(secs)) {
      s.btn.setAttribute("aria-expanded",String(open.has(k)));
      s.btn.querySelector(".tp-expand-icon").textContent=open.has(k)?"−":"+";
      s.drawer.set(open.has(k));
    }
  }
  function toggle(key) {
    if (open.has(key)) open.delete(key);
    else { if (!multiple) open.clear(); open.add(key); }
    applyOpen();
    bus.emit("section", { open: [...open] });
  }

  const modified = (key) => {
    if (key === "grading") return Object.values(state.grading).some((w) => w.amount > 0);
    if (key === "hsl") return Object.values(state.hsl).some((c) => c.h || c.s || c.l);
    return Object.values(groups[key].sliders).some((raw) => state[key][raw.key] !== normSlider(raw).default);
  };
  function refreshMarks() {
    for (const k of Object.keys(secs)) secs[k].btn.dataset.mod = String(modified(k));
    for (const c of CHANNELS) chanBtns[c.key].dataset.mod = String(Object.values(state.hsl[c.key]).some(Boolean));
  }

  function reset(key, source = "api") {
    const keys = key ? [key] : Object.keys(secs);
    for (const k of keys) {
      if (k === "grading") {
        for (const w of wheelDefs) {
          const was = state.grading[w.key].amount > 0 || state.grading[w.key].hue;
          state.grading[w.key] = { hue: 0, amount: 0 }; wheels[w.key].reset();
          if (was) emit("grading", w.key, source);
        }
      } else if (k === "hsl") {
        for (const c of CHANNELS) {
          const was = Object.values(state.hsl[c.key]).some(Boolean);
          state.hsl[c.key] = { h: 0, s: 0, l: 0 };
          if (was) emit("hsl", c.key, source);
        }
        refreshHsl();
      } else {
        for (const raw of groups[k].sliders) {
          const s = normSlider(raw);
          const was = state[k][s.key] !== s.default;
          state[k][s.key] = s.default; sliders[k][s.key].reset();
          if (was) emit(k, s.key, source);
        }
      }
    }
    refreshMarks();
  }

  root.append(
    h("header", { class: "tp-head" }, icon("palette", 30), h("h2", { class: "tp-title" }, options.title || "Colors")),
    h("div", { class: "tp-body" }, list),
  );
  mount.append(root);
  applyOpen();
  refreshHsl();
  refreshMarks();

  function set(patch = {}, { silent = false } = {}) {
    const touched = [];
    for (const [g, val] of Object.entries(patch)) {
      if (g === "grading") {
        for (const [k, w] of Object.entries(val || {})) {
          if (!wheels[k]) continue;
          wheels[k].set(w); state.grading[k] = wheels[k].get(); touched.push([g, k]);
        }
      } else if (g === "hsl") {
        for (const [ch, vals] of Object.entries(val || {})) {
          if (!state.hsl[ch]) continue;
          for (const s of HSL_SLIDERS) if (typeof vals[s.key] === "number") state.hsl[ch][s.key] = clamp(Math.round(vals[s.key]), -100, 100);
          touched.push([g, ch]);
        }
        refreshHsl();
      } else if (sliders[g]) {
        for (const [k, n] of Object.entries(val || {})) {
          if (!sliders[g][k] || typeof n !== "number") continue;
          sliders[g][k].set(n); state[g][k] = sliders[g][k].get(); touched.push([g, k]);
        }
      }
    }
    refreshMarks();
    if (!silent) touched.forEach(([g, k]) => emit(g, k, "api"));
  }

  return {
    el: root,
    get: () => clone(state),
    set,
    reset: (group) => reset(group, "api"),
    on: bus.on,
    off: bus.off,
    setChannel: (c) => setChannel(c),
    open: (key) => { if (!open.has(key)) toggle(key); },
    close: (key) => { if (key ? open.delete(key) : (open.clear(), true)) { applyOpen(); bus.emit("section", { open: [...open] }); } },
    destroy: () => root.remove(),
  };
}

function createSegmented({ options, value, name = "", onChange }) {
  let cur = value ?? options[0].value;
  const thumb = h("span", { class: "tpx-seg__thumb", "aria-hidden": "true" });
  const btns = options.map((o) => {
    const b = h("button", { class: "tpx-seg__btn", type: "button", role: "radio", "aria-label": o.label || o.value },
      o.icon && icon(o.icon, 18), o.label && h("span", {}, o.label));
    b.addEventListener("click", () => pick(o.value, true));
    return b;
  });
  const el = h("div", { class: "tpx-seg", role: "radiogroup", "aria-label": name }, thumb, btns);
  el.style.setProperty("--n", options.length);

  const render = () => {
    const i = options.findIndex((o) => o.value === cur);
    el.style.setProperty("--i", Math.max(0, i));
    btns.forEach((b, k) => { b.setAttribute("aria-checked", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  };
  function pick(v, user) {
    if (v === cur || !options.some((o) => o.value === v)) return;
    cur = v; render();
    if (user) onChange?.(cur);
  }
  el.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === cur);
    const k = (i + d + options.length) % options.length;
    pick(options[k].value, true);
    btns[k].focus();
  });
  render();
  return { el, get: () => cur, set: (v) => pick(v, false) };
}

function createSwitch({ on = false, label = "", onChange } = {}) {
  let s = !!on;
  const el = h("button", { class: "tpx-switch", type: "button", role: "switch", "aria-label": label, "aria-checked": String(s) },
    h("span", { class: "tpx-switch__knob" }));
  const set = (v) => { s = !!v; el.setAttribute("aria-checked", String(s)); };
  el.addEventListener("click", () => { set(!s); onChange?.(s); });
  return { el, get: () => s, set };
}

function createSwitchRow({ label, on = false, onChange }) {
  const sw = createSwitch({ on, label, onChange });
  const el = h("div", { class: "tpx-row" }, h("span", { class: "tpx-row__label" }, label), sw.el);
  return { el, get: sw.get, set: sw.set };
}

const block = (label, ...kids) =>
  h("div", { class: "tpx-block" }, h("span", { class: "tpx-block__label" }, label), ...kids);

function createAccordion({ sections, open = [], multiple = false, onToggle }) {
  const openSet = new Set(open);
  const refs = {};
  const el = h("div", { class: "tpc-list" });
  let lastGroup = null;
  for (const s of sections) {
    if (s.group && s.group !== lastGroup) { el.append(h("div",{class:"tpc-group-label"},s.group)); lastGroup=s.group; }
    const expand = h("span",{class:"tp-expand-icon","aria-hidden":"true"},openSet.has(s.key)?"−":"+");
    const btn = h("button", { class: "tp-nav-btn", type: "button", "aria-expanded": "false" },
      icon(s.icon), s.label, h("span", { class: "tpc-dot", "aria-hidden": "true" }), expand);
    btn.addEventListener("click", () => toggle(s.key));
    const pane = h("div", { class: "tp-card tpc-pane" }, s.head && h("div", { class: "tpc-pane__head" }, s.head), s.body);
    const drawer = createDrawer({ className: "tp-sub", content: h("div", { class: "tp-sub__inner" }, pane) });
    refs[s.key] = { btn, drawer, pane };
    el.append(h("div", { class: "tpc-sec" }, btn, drawer.el));
  }
  const apply = () => {
    for (const [k, r] of Object.entries(refs)) {
      r.btn.setAttribute("aria-expanded", String(openSet.has(k)));
      r.btn.querySelector(".tp-expand-icon").textContent = openSet.has(k) ? "−" : "+";
      r.drawer.set(openSet.has(k));
    }
  };
  function toggle(k) {
    if (openSet.has(k)) openSet.delete(k);
    else { if (!multiple) openSet.clear(); openSet.add(k); }
    apply(); onToggle?.([...openSet]);
  }
  apply();
  return {
    el, refs, toggle,
    open: (k) => { if (!openSet.has(k)) toggle(k); },
    close: (k) => {
      const had = k ? openSet.delete(k) : openSet.size > 0 && (openSet.clear(), true);
      if (had) { apply(); onToggle?.([...openSet]); }
    },
    mark: (k, on) => { if (refs[k]) refs[k].btn.dataset.mod = String(!!on); },
  };
}

const PRESETS = [
  { id: "none", label: "None", filter: "none" },
  { id: "vivid", label: "Vivid", filter: "saturate(1.7) contrast(1.1)" },
  { id: "noir", label: "Noir", filter: "grayscale(1) contrast(1.25) brightness(.95)", apply: { vignette: { enabled: true, amount: -50 }, grain: { enabled: true, amount: 40 } } },
  { id: "fade", label: "Fade", filter: "contrast(.82) brightness(1.12) saturate(.75)" },
  { id: "warm", label: "Warm", filter: "sepia(.4) saturate(1.3) hue-rotate(-8deg)" },
  { id: "cool", label: "Cool", filter: "hue-rotate(18deg) saturate(.95) brightness(1.04)" },
  { id: "cinema", label: "Cinema", filter: "contrast(1.18) saturate(.8) sepia(.18) hue-rotate(-12deg)", apply: { vignette: { enabled: true, amount: -35 } } },
  { id: "retro", label: "Retro", filter: "sepia(.55) contrast(.95) saturate(1.25)", apply: { grain: { enabled: true, amount: 55 } } },
];

const FILTER_GROUPS = {
  blur: { label: "Blur", icon: "blur", controls: [
    { type: "segmented", key: "mode", options: [{ value: "gaussian", label: "Gaussian" }, { value: "motion", label: "Motion" }, { value: "zoom", label: "Zoom" }], default: "gaussian" },
    { type: "slider", key: "amount", label: "Amount", min: 0, max: 100, default: 25 },
    { type: "slider", key: "angle", label: "Angle", min: -180, max: 180, default: 0, unit: "°", showWhen: { mode: "motion" } }] },
  grain: { label: "Grain", icon: "grain", controls: [
    { type: "slider", key: "amount", label: "Amount", min: 0, max: 100, default: 35 },
    { type: "slider", key: "size", label: "Size", min: 0, max: 100, default: 30 },
    { type: "slider", key: "roughness", label: "Roughness", min: 0, max: 100, default: 50 }] },
};

const VIDEO_EFFECTS_GROUPS = {
  chromatic: { label: "Chromatic aberration", icon: "chroma", controls: [
    { type: "slider", key: "amount", label: "Amount", min: 0, max: 100, default: 30 },
    { type: "slider", key: "angle", label: "Angle", min: -180, max: 180, default: 0, unit: "°" }] },
  glow: { label: "Glow", icon: "glow", controls: [
    { type: "slider", key: "amount", label: "Amount", min: 0, max: 100, default: 30 },
    { type: "slider", key: "threshold", label: "Threshold", min: 0, max: 100, default: 70 },
    { type: "slider", key: "radius", label: "Radius", min: 0, max: 100, default: 40 }] },
  glitch: { label: "Glitch", icon: "glitch", controls: [
    { type: "slider", key: "amount", label: "Amount", min: 0, max: 100, default: 30 },
    { type: "slider", key: "blocks", label: "Block size", min: 0, max: 100, default: 25 },
    { type: "slider", key: "speed", label: "Speed", min: 0, max: 100, default: 50 }] },
  pixelate: { label: "Pixelate", icon: "pixel", controls: [
    { type: "slider", key: "size", label: "Pixel size", min: 1, max: 80, default: 12 },
    { type: "slider", key: "blend", label: "Blend", min: 0, max: 100, default: 100 }] },
  sharpen: { label: "Sharpen", icon: "detail", controls: [
    { type: "slider", key: "amount", label: "Amount", min: 0, max: 100, default: 35 },
    { type: "slider", key: "radius", label: "Radius", min: 0, max: 20, default: 5, unit: "px" },
    { type: "slider", key: "threshold", label: "Threshold", min: 0, max: 100, default: 10 }] },
  lens: { label: "Lens Distortion", icon: "distort", controls: [
    { type: "slider", key: "amount", label: "Distortion", min: -100, max: 100, default: 0 },
    { type: "slider", key: "scale", label: "Scale", min: 50, max: 150, default: 100, unit: "%" }] },
  scanlines: { label: "Scanlines", icon: "stylize", controls: [
    { type: "slider", key: "amount", label: "Opacity", min: 0, max: 100, default: 25 },
    { type: "slider", key: "spacing", label: "Spacing", min: 1, max: 12, default: 3, unit: "px" }] },
  shake: { label: "Camera Shake", icon: "position", controls: [
    { type: "slider", key: "amount", label: "Intensity", min: 0, max: 100, default: 20 },
    { type: "slider", key: "frequency", label: "Frequency", min: 1, max: 30, default: 8, unit: "Hz" },
    { type: "slider", key: "smoothness", label: "Smoothness", min: 0, max: 100, default: 35 }] },
  filmBurn: { label: "Film Burn", icon: "sun", controls: [
    { type: "slider", key: "amount", label: "Amount", min: 0, max: 100, default: 22 },
    { type: "slider", key: "warmth", label: "Warmth", min: 0, max: 100, default: 65 },
    { type: "slider", key: "edge", label: "Edge Spread", min: 0, max: 100, default: 38 },
    { type: "slider", key: "flicker", label: "Flicker", min: 0, max: 100, default: 12 }] },
  halftone: { label: "Halftone", icon: "grid", controls: [
    { type: "slider", key: "size", label: "Dot Size", min: 1, max: 24, default: 5, unit: "px" },
    { type: "slider", key: "contrast", label: "Contrast", min: 0, max: 100, default: 48 },
    { type: "slider", key: "angle", label: "Angle", min: 0, max: 180, default: 45, unit: "°" }] },
  posterize: { label: "Posterize", icon: "layers", controls: [
    { type: "slider", key: "levels", label: "Color Levels", min: 2, max: 16, default: 6 },
    { type: "slider", key: "blend", label: "Blend", min: 0, max: 100, default: 100 }] },
  fisheye: { label: "Fisheye", icon: "aperture", controls: [
    { type: "slider", key: "amount", label: "Distortion", min: -100, max: 100, default: 35 },
    { type: "slider", key: "scale", label: "Scale", min: 50, max: 150, default: 100, unit: "%" },
    { type: "slider", key: "blend", label: "Blend", min: 0, max: 100, default: 100 }] },
  lightLeak: { label: "Light Leak", icon: "sunrise", controls: [
    { type: "slider", key: "amount", label: "Intensity", min: 0, max: 100, default: 28 },
    { type: "slider", key: "position", label: "Position", min: 0, max: 100, default: 35 },
    { type: "slider", key: "warmth", label: "Warmth", min: 0, max: 100, default: 70 }] },
  mirror: { label: "Mirror", icon: "flip-horizontal", controls: [
    { type: "segmented", key: "axis", label: "Axis", options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }], default: "horizontal" },
    { type: "slider", key: "blend", label: "Blend", min: 0, max: 100, default: 100 }] },
};

const AUDIO_EFFECTS_GROUPS = {
  eq: { label: "Equalizer", icon: "music", controls: [
    { type: "slider", key: "low", label: "Low Gain", min: -20, max: 20, default: 0, unit: "dB" },
    { type: "slider", key: "mid", label: "Mid Gain", min: -20, max: 20, default: 0, unit: "dB" },
    { type: "slider", key: "high", label: "High Gain", min: -20, max: 20, default: 0, unit: "dB" }] },
  reverb: { label: "Reverb", icon: "wave", controls: [
    { type: "slider", key: "room", label: "Room Size", min: 0, max: 100, default: 30 },
    { type: "slider", key: "damp", label: "Damping", min: 0, max: 100, default: 50 },
    { type: "slider", key: "wet", label: "Wet/Dry", min: 0, max: 100, default: 25 }] },
  delay: { label: "Delay", icon: "repeat", controls: [
    { type: "slider", key: "time", label: "Time", min: 1, max: 2000, default: 320, unit: "ms" },
    { type: "slider", key: "feedback", label: "Feedback", min: 0, max: 100, default: 28 },
    { type: "slider", key: "mix", label: "Mix", min: 0, max: 100, default: 22 }] },
  compressor: { label: "Compressor", icon: "sliders", controls: [
    { type: "slider", key: "threshold", label: "Threshold", min: -60, max: 0, default: -18, unit: "dB" },
    { type: "slider", key: "ratio", label: "Ratio", min: 1, max: 20, default: 4, unit: ":1" },
    { type: "slider", key: "attack", label: "Attack", min: 0, max: 200, default: 12, unit: "ms" },
    { type: "slider", key: "release", label: "Release", min: 5, max: 1000, default: 140, unit: "ms" }] },
  limiter: { label: "Limiter", icon: "detail", controls: [
    { type: "slider", key: "ceiling", label: "Output Ceiling", min: -12, max: 0, default: -1, unit: "dB" },
    { type: "slider", key: "release", label: "Release", min: 1, max: 500, default: 80, unit: "ms" }] },
  denoise: { label: "Noise Reduction", icon: "grain", controls: [
    { type: "slider", key: "reduction", label: "Reduction", min: 0, max: 100, default: 35 },
    { type: "slider", key: "sensitivity", label: "Sensitivity", min: 0, max: 100, default: 50 }] },
};

function buildDefaultEffects(groups) {
  return {
    preset: { id: "none", intensity: 100 },
    ...Object.fromEntries(
      Object.entries(groups).map(([g, def]) => [
        g, { enabled: false, ...Object.fromEntries(def.controls.map((c) => [c.key, c.default ?? 0])) },
      ]),
    ),
  };
}

function createEffectsPanel(mount, options = {}) {
  const groups = options.groups || FILTER_GROUPS;
  const presets = options.presets || PRESETS;
  const state = merge(buildDefaultEffects(groups), options.initial);
  const bus = createEmitter();
  const root = h("div", { class: "tp tpc tpe ed-effects-root", role: "group", "aria-label": options.title || "Effects" });

  const emit = (group, key, source = "user") => {
    const payload = { group, key, value: state[group][key], state: clone(state), source };
    bus.emit("change", payload);
    root.dispatchEvent(new CustomEvent("effects:change", { detail: payload, bubbles: true }));
    refreshMarks();
  };

  const hasPresets = !!options.presets || groups === FILTER_GROUPS;
  let intensity = null, intensityWrap = null;
  const tiles = {};
  const filterKeys = Object.keys(groups).filter(k => FILTER_GROUPS[k]);
  const videoKeys = Object.keys(groups).filter(k => VIDEO_EFFECTS_GROUPS[k]);
  const audioKeys = Object.keys(groups).filter(k => AUDIO_EFFECTS_GROUPS[k]);
  const ctl = {}, switches = {}, bodies = {};
  const nested = {};
  const categories = {};

  if (hasPresets) {
    const tileGrid = h("div", { class: "tpe-tiles", role: "radiogroup", "aria-label": "Filter presets" },
      presets.map(p => {
        const img = h("span", { class: "tpe-tile__img" });
        img.style.filter = p.filter || "none";
        const b = h("button", { class: "tpe-tile", type: "button", role: "radio", "aria-checked": "false", "aria-label": p.label },
          img, h("span", { class: "tpe-tile__label" }, p.label));
        b.addEventListener("click", () => selectPreset(p.id, "user"));
        tiles[p.id] = b;
        return b;
      })
    );
    intensity = createSlider({
      label: "Intensity", min: 0, max: 100, default: 100, origin: 0, value: state.preset.intensity,
      onInput: v => { state.preset.intensity = v; emit("preset", "intensity"); }
    });
    intensityWrap = h("div", { class: "tpe-intensity" }, intensity.el);
    const presetReset = h("button", { class: "tpc-reset", type: "button", "aria-label": "Reset filter preset" }, icon("reset", 15), "Reset");
    presetReset.addEventListener("click", () => reset("preset", "user"));
    const presetsBlock = h("div", { class: "ed-effects-presets" },
      h("div", { class: "ed-effects-presets__head" }, h("span", {}, "Filter presets"), presetReset),
      tileGrid, intensityWrap
    );
    root.dataset.hasPresets = "true";
    categories.filtersPresets = presetsBlock;
  }

  function refreshPreset() {
    if (!hasPresets) return;
    for (const [id, b] of Object.entries(tiles)) b.setAttribute("aria-checked", String(id === state.preset.id));
    intensityWrap.hidden = state.preset.id === "none";
  }
  function selectPreset(id, source) {
    if (!tiles[id] || id === state.preset.id) return;
    state.preset.id = id;
    refreshPreset();
    emit("preset", "id", source);
    const p = presets.find(x => x.id === id);
    if (p?.apply) set(p.apply, { source: "preset" });
  }

  for (const [g, def] of Object.entries(groups)) {
    ctl[g] = {};
    const onCtl = (key, val) => {
      state[g][key] = val;
      if (!state[g].enabled) {
        state[g].enabled = true;
        switches[g].set(true);
        bodies[g].dataset.enabled = "true";
        emit(g, "enabled");
      }
      emit(g, key);
      updateConditions(g);
    };
    for (const c of def.controls) {
      ctl[g][c.key] = c.type === "segmented"
        ? createSegmented({ options: c.options, value: state[g][c.key], name: c.label || c.key, onChange: v => onCtl(c.key, v) })
        : createSlider({ ...c, origin: c.origin ?? 0, value: state[g][c.key], onInput: v => onCtl(c.key, v) });
    }
    switches[g] = createSwitch({
      on: state[g].enabled, label: `Enable ${def.label}`,
      onChange: on => { state[g].enabled = on; bodies[g].dataset.enabled = String(on); emit(g, "enabled"); }
    });
    bodies[g] = h("div", { class: "tpe-body", "data-enabled": String(state[g].enabled) }, def.controls.map(c => ctl[g][c.key].el));
  }

  function updateConditions(g) {
    for (const c of groups[g].controls) {
      if (!c.showWhen) continue;
      ctl[g][c.key].el.hidden = !Object.entries(c.showWhen).every(([k, v]) => state[g][k] === v);
    }
  }

  const resetBtn = (label, fn) => {
    const b = h("button", { class: "tpc-reset", type: "button", "aria-label": `Reset ${label}` }, icon("reset", 15), "Reset");
    b.addEventListener("click", fn);
    return b;
  };

  function makeEffectSections(keys) {
    const sections = [];
    for (const g of keys) {
      const def = groups[g];
      sections.push({
        key: g, label: def.label, icon: def.icon || "sparkles", body: bodies[g],
        head: [h("label", { class: "tpe-enable" }, switches[g].el, h("span", {}, "Enabled")), resetBtn(def.label, () => reset(g, "user"))]
      });
    }
    return sections;
  }

  nested.filters = createAccordion({ sections: makeEffectSections(filterKeys), open: options.openEffects || [], multiple: true, onToggle: o => bus.emit("section", { category: "filters", open: o }) });
  nested.video = createAccordion({ sections: makeEffectSections(videoKeys), open: [], multiple: true, onToggle: o => bus.emit("section", { category: "video", open: o }) });
  nested.audio = createAccordion({ sections: makeEffectSections(audioKeys), open: [], multiple: true, onToggle: o => bus.emit("section", { category: "audio", open: o }) });

  function makeCategory(key, label, iconName, content, initiallyOpen = false) {
    const toggle = h("button", { class: "ed-effects-category__head", type: "button", "aria-expanded": String(initiallyOpen) },
      icon(iconName, 21), h("span", { class: "ed-effects-category__title" }, label),
      h("span", { class: "ed-effects-category__mark", "aria-hidden": "true" }),
      h("span", { class: "ed-effects-category__chevron", "aria-hidden": "true" }, icon("chevRight", 18))
    );
    const drawer = createDrawer({ className: "ed-effects-category__drawer", open: initiallyOpen,
      content: h("div", { class: "ed-effects-category__body" }, content) });
    const el = h("section", { class: "ed-effects-category", "data-open": String(initiallyOpen) }, toggle, drawer.el);
    const setOpen = on => {
      el.dataset.open = String(!!on);
      drawer.set(!!on);
      toggle.setAttribute("aria-expanded", String(!!on));
      toggle.querySelector(".ed-effects-category__chevron").classList.toggle("is-open", !!on);
    };
    toggle.addEventListener("click", () => setOpen(el.dataset.open !== "true"));
    return { el, setOpen, mark: on => el.classList.toggle("has-mod", !!on), isOpen: () => el.dataset.open === "true" };
  }

  const filtersContent = h("div", { class: "ed-effects-category__content" },
    hasPresets ? categories.filtersPresets : null,
    nested.filters.el
  );
  categories.filters = makeCategory("filters", "Filters", "sparkles", filtersContent, true);
  categories.video = makeCategory("video", "Video Effects", "film", nested.video.el, false);
  categories.audio = makeCategory("audio", "Audio Effects", "music", nested.audio.el, false);

  const categoryStack = h("div", { class: "ed-effects-categories" }, categories.filters.el, categories.video.el, categories.audio.el);
  root.append(h("div", { class: "tp-body" }, categoryStack));
  mount.append(root);

  function refreshMarks() {
    if (hasPresets) categories.filters.mark(state.preset.id !== "none" || filterKeys.some(k => state[k].enabled));
    else categories.filters.mark(filterKeys.some(k => state[k].enabled));
    categories.video.mark(videoKeys.some(k => state[k].enabled));
    categories.audio.mark(audioKeys.some(k => state[k].enabled));
    if (hasPresets) for (const [id, b] of Object.entries(tiles)) b.setAttribute("aria-checked", String(id === state.preset.id));
    for (const [cat, keys] of [["filters", filterKeys], ["video", videoKeys], ["audio", audioKeys]]) {
      for (const k of keys) nested[cat].mark(k, state[k].enabled);
    }
  }

  function reset(key, source = "api") {
    let keys;
    if (!key) keys = ["preset", ...Object.keys(groups)];
    else if (key === "filters") keys = ["preset", ...filterKeys];
    else if (key === "video" || key === "videoEffects") keys = videoKeys;
    else if (key === "audio" || key === "audioEffects") keys = audioKeys;
    else keys = [key];
    for (const k of keys) {
      if (k === "preset" && hasPresets) {
        const was = state.preset.id !== "none", wasI = state.preset.intensity !== 100;
        state.preset = { id: "none", intensity: 100 };
        intensity?.reset(); refreshPreset();
        if (was) emit("preset", "id", source);
        if (wasI) emit("preset", "intensity", source);
      } else if (groups[k]) {
        const defaults = buildDefaultEffects(groups)[k];
        for (const [key2, val] of Object.entries(defaults)) {
          const was = state[k][key2] !== val;
          state[k][key2] = val;
          if (key2 === "enabled") { switches[k].set(val); bodies[k].dataset.enabled = String(val); }
          else ctl[k][key2].set(val);
          if (was) emit(k, key2, source);
        }
        updateConditions(k);
      }
    }
    refreshMarks();
  }

  refreshPreset();
  Object.keys(groups).forEach(updateConditions);
  refreshMarks();

  function set(patch = {}, { silent = false, source = "api" } = {}) {
    const touched = [];
    for (const [g, val] of Object.entries(patch)) {
      if (g === "preset" && hasPresets) {
        if (val.id && tiles[val.id]) state.preset.id = val.id;
        if (typeof val.intensity === "number") { intensity?.set(val.intensity); state.preset.intensity = intensity?.get() ?? 100; }
        refreshPreset();
        Object.keys(val).forEach(k => touched.push([g, k]));
      } else if (groups[g]) {
        for (const [k, v] of Object.entries(val || {})) {
          if (k === "enabled") { state[g].enabled = !!v; switches[g].set(v); bodies[g].dataset.enabled = String(!!v); }
          else if (ctl[g][k]) { ctl[g][k].set(v); state[g][k] = ctl[g][k].get(); }
          else continue;
          touched.push([g, k]);
        }
        updateConditions(g);
      }
    }
    refreshMarks();
    if (!silent) touched.forEach(([g, k]) => emit(g, k, source));
  }

  return {
    el: root,
    get: () => clone(state),
    set,
    reset: group => reset(group, "api"),
    on: bus.on, off: bus.off,
    open: k => {
      if (categories[k]) categories[k].setOpen(true);
      else if (filterKeys.includes(k)) { categories.filters.setOpen(true); nested.filters.open(k); }
      else if (videoKeys.includes(k)) { categories.video.setOpen(true); nested.video.open(k); }
      else if (audioKeys.includes(k)) { categories.audio.setOpen(true); nested.audio.open(k); }
    },
    close: k => {
      if (categories[k]) categories[k].setOpen(false);
      else if (filterKeys.includes(k)) nested.filters.close(k);
      else if (videoKeys.includes(k)) nested.video.close(k);
      else if (audioKeys.includes(k)) nested.audio.close(k);
      else { categories.filters.setOpen(false); categories.video.setOpen(false); categories.audio.setOpen(false); }
    },
    destroy: () => root.remove()
  };
}

const IMAGE_FORMATS = [
  { value: "png", label: "PNG", alpha: true },
  { value: "jpg", label: "JPG", lossy: true },
  { value: "webp", label: "WebP", lossy: true, alpha: true },
  { value: "avif", label: "AVIF", lossy: true },
];
const VIDEO_FORMATS = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
  { value: "gif", label: "GIF" },
];
const SIZE_PRESETS = [
  { value: "original", label: "Original" },
  { value: "4k", label: "4K", width: 3840 },
  { value: "1080", label: "1080p", width: 1920 },
  { value: "720", label: "720p", width: 1280 },
  { value: "custom", label: "Custom" },
];

const DEFAULT_EXPORT = {
  mode: "image",
  image: { format: "png", quality: 90, transparent: false, metadata: true, colorSpace: "srgb" },
  video: { format: "mp4", fps: 30, quality: "high", audio: true, loop: true },
  size: { preset: "original", width: 1920, height: 1080, linked: true },
  output: { name: "untitled", destination: "" },
};

const fmtBytes = (n) => (n >= 1e9 ? (n / 1e9).toFixed(1) + " GB" : n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB");

function defaultEstimate(st, src) {
  const { width: w, height: ht } = st.size;
  if (st.mode === "image") {
    const f = st.image.format, q = st.image.quality / 100;
    const bpp = f === "png" ? (st.image.transparent ? 2.2 : 1.7) : f === "jpg" ? 0.06 + q * q * 0.55 : f === "webp" ? 0.04 + q * q * 0.4 : 0.03 + q * q * 0.28;
    return fmtBytes(w * ht * bpp);
  }
  if (!src.duration) return null;
  const { format, fps, quality } = st.video, px = w * ht;
  if (format === "gif") return fmtBytes(px * 0.12 * Math.min(fps, 24) * src.duration);
  const mbps = { low: 4, medium: 8, high: 16, max: 30 }[quality] * (px / 2073600) * (fps / 30) * (format === "webm" ? 0.8 : 1);
  return fmtBytes((mbps * 1e6 * src.duration) / 8);
}

function createExportPanel(mount, options = {}) {
  const imageFormats = options.imageFormats || IMAGE_FORMATS;
  const videoFormats = options.videoFormats || VIDEO_FORMATS;
  const sizePresets = options.sizePresets || SIZE_PRESETS;
  const estimate = options.estimate || defaultEstimate;
  let source = { width: 1920, height: 1080, duration: null, ...options.source };
  const state = merge(DEFAULT_EXPORT, options.initial);
  const bus = createEmitter();
  const root = h("div", { class: "tp tpc tpm", role: "group", "aria-label": options.title || "Export" });

  const emit = (group, key, src = "user") => {
    const payload = { group, key, value: key == null ? state[group] : state[group][key], state: clone(state), source: src };
    bus.emit("change", payload);
    root.dispatchEvent(new CustomEvent("export:change", { detail: payload, bubbles: true }));
    sync();
  };
  const aspect = () => source.width / source.height;

  const modeSeg = createSegmented({
    name: "Media type", value: state.mode,
    options: [{ value: "image", label: "Image", icon: "image" }, { value: "video", label: "Video", icon: "video" }],
    onChange: (v) => { state.mode = v; emit("mode", null); },
  });
  const imgFormat = createSegmented({ name: "Image format", options: imageFormats, value: state.image.format, onChange: (v) => { state.image.format = v; emit("image", "format"); } });
  const vidFormat = createSegmented({ name: "Video format", options: videoFormats, value: state.video.format, onChange: (v) => { state.video.format = v; emit("video", "format"); } });

  const quality = createSlider({
    label: "Quality", min: 1, max: 100, default: 90, origin: 1, unit: "%", value: state.image.quality,
    onInput: (v) => { state.image.quality = v; emit("image", "quality"); },
  });
  const transparent = createSwitchRow({ label: "Transparent background", on: state.image.transparent, onChange: (v) => { state.image.transparent = v; emit("image", "transparent"); } });
  const colorSpace = createSegmented({
    name: "Color space", value: state.image.colorSpace,
    options: [{ value: "srgb", label: "sRGB" }, { value: "p3", label: "Display P3" }],
    onChange: (v) => { state.image.colorSpace = v; emit("image", "colorSpace"); },
  });
  const metadata = createSwitchRow({ label: "Include metadata", on: state.image.metadata, onChange: (v) => { state.image.metadata = v; emit("image", "metadata"); } });
  const imgOpts = h("div", { class: "tpm-sub" }, quality.el, transparent.el, block("Color space", colorSpace.el), metadata.el);

  const fps = createSegmented({
    name: "Frame rate", value: String(state.video.fps),
    options: [{ value: "24", label: "24" }, { value: "30", label: "30" }, { value: "60", label: "60" }],
    onChange: (v) => { state.video.fps = Number(v); emit("video", "fps"); },
  });
  const vQuality = createSegmented({
    name: "Video quality", value: state.video.quality,
    options: [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "max", label: "Max" }],
    onChange: (v) => { state.video.quality = v; emit("video", "quality"); },
  });
  const audio = createSwitchRow({ label: "Include audio", on: state.video.audio, onChange: (v) => { state.video.audio = v; emit("video", "audio"); } });
  const loop = createSwitchRow({ label: "Loop forever", on: state.video.loop, onChange: (v) => { state.video.loop = v; emit("video", "loop"); } });
  const fpsBlock = block("Frame rate (fps)", fps.el);
  const vQualityBlock = block("Quality", vQuality.el);
  const vidOpts = h("div", { class: "tpm-sub" }, fpsBlock, vQualityBlock, audio.el, loop.el);

  const formatCard = h("section", { class: "tp-card" },
    h("h3", { class: "tp-card__head" }, icon("image"), "Format"),
    imgFormat.el, vidFormat.el, imgOpts, vidOpts,
  );

  const presetSeg = createSegmented({
    name: "Size preset", options: sizePresets, value: state.size.preset,
    onChange: (v) => { applySizePreset(v); emit("size", "preset"); },
  });
  const wField = createNumberField({ label: "W", unit: "px", min: 16, max: 16384, step: 1, value: state.size.width, compact: true, name: "Export width", onChange: (v) => onDim("width", v) });
  const hField = createNumberField({ label: "H", unit: "px", min: 16, max: 16384, step: 1, value: state.size.height, compact: true, name: "Export height", onChange: (v) => onDim("height", v) });
  const sizeLink = createLinkToggle({ on: state.size.linked, label: "Lock aspect ratio", onToggle: (on) => { state.size.linked = on; emit("size", "linked"); } });
  const dims = h("div", { class: "tpm-dims" }, wField.el, sizeLink.el, hField.el);
  const sizeCard = h("section", { class: "tp-card" }, h("h3", { class: "tp-card__head" }, icon("scale"), "Size"), presetSeg.el, dims);

  function applySizePreset(v) {
    state.size.preset = v;
    if (v === "original") { state.size.width = source.width; state.size.height = source.height; }
    else if (v !== "custom") {
      const p = sizePresets.find((x) => x.value === v);
      if (p?.width) { state.size.width = p.width; state.size.height = Math.round(p.width / aspect()); }
    }
    wField.set(state.size.width); hField.set(state.size.height);
  }
  function onDim(which, v) {
    state.size[which] = v;
    if (state.size.linked) {
      if (which === "width") state.size.height = clamp(Math.round(v / aspect()), 16, 16384);
      else state.size.width = clamp(Math.round(v * aspect()), 16, 16384);
    }
    state.size.preset = "custom"; presetSeg.set("custom");
    wField.set(state.size.width); hField.set(state.size.height);
    emit("size", which);
  }

  const nameInput = h("input", { class: "tp-field__input tpm-name", type: "text", spellcheck: "false", autocomplete: "off", maxlength: "120", "aria-label": "File name" });
  nameInput.value = state.output.name;
  const ext = h("span", { class: "tp-field__unit" });
  nameInput.addEventListener("focus", () => nameInput.select());
  nameInput.addEventListener("input", () => {
    const clean = nameInput.value.replace(/[\\/:*?"<>|]/g, "");
    if (clean !== nameInput.value) nameInput.value = clean;
    state.output.name = clean; emit("output", "name");
  });
  nameInput.addEventListener("keydown", (e) => e.key === "Enter" && nameInput.blur());
  const destText = h("span", { class: "tpm-dest__text" });
  const dest = h("button", { class: "tpm-dest", type: "button" }, icon("folder", 22), destText, h("span", { class: "tpm-dest__act" }, "Change"));
  dest.addEventListener("click", () => bus.emit("browse", { current: state.output.destination }));
  const outCard = h("section", { class: "tp-card tpm-out" },
    h("h3", { class: "tp-card__head" }, icon("folder"), "Save to"),
    h("div", { class: "tp-field" }, nameInput, ext), dest,
  );

  const bar = h("span", { class: "tpm-go__bar" });
  const goIcon = h("span", { class: "tpm-go__icon" });
  const goLabel = h("span", {});
  const go = h("button", { class: "tpm-go", type: "button", "data-status": "idle" }, bar, goIcon, goLabel);
  const cancel = h("button", { class: "tpm-cancel", type: "button", "aria-label": "Cancel export", hidden: true }, icon("x", 22));
  const summary = h("div", { class: "tpm-summary", "aria-live": "polite" });

  let status = "idle", progress = 0, doneTimer = 0;
  function setStatus(next, msg) {
    clearTimeout(doneTimer);
    status = next;
    go.dataset.status = next;
    cancel.hidden = next !== "exporting";
    goIcon.replaceChildren(icon(next === "done" ? "check" : next === "error" ? "x" : "upload", 22));
    goLabel.textContent = next === "exporting" ? `Exporting ${Math.round(progress * 100)}%` : next === "done" ? "Exported" : next === "error" ? msg || "Export failed" : "Export";
    if (next === "exporting") go.style.setProperty("--prog", progress);
    if (next === "done") { go.style.setProperty("--prog", 1); doneTimer = setTimeout(() => setStatus("idle"), 2400); }
    if (next === "idle" || next === "error") { progress = 0; go.style.setProperty("--prog", 0); }
  }
  function setProgress(p) {
    progress = clamp(p, 0, 1);
    if (status !== "exporting") setStatus("exporting");
    go.style.setProperty("--prog", progress);
    goLabel.textContent = `Exporting ${Math.round(progress * 100)}%`;
  }
  go.addEventListener("click", () => {
    if (status === "exporting") return;
    bus.emit("export", { settings: clone(state), source: clone(source) });
    if (options.autoStatus !== false) { progress = 0; setStatus("exporting"); }
  });
  cancel.addEventListener("click", () => { bus.emit("cancel", {}); setStatus("idle"); });

  function sync() {
    const isImg = state.mode === "image";
    imgFormat.el.hidden = !isImg; imgOpts.hidden = !isImg;
    vidFormat.el.hidden = isImg; vidOpts.hidden = isImg;
    const f = imageFormats.find((x) => x.value === state.image.format) || {};
    quality.el.hidden = !f.lossy; transparent.el.hidden = !f.alpha;
    const gif = state.video.format === "gif";
    audio.el.hidden = gif; loop.el.hidden = !gif; vQualityBlock.hidden = gif;
    ext.textContent = "." + (isImg ? state.image.format : state.video.format);
    destText.textContent = state.output.destination || "Choose a folder…";
    destText.dataset.empty = String(!state.output.destination);
    const fmt = (isImg ? state.image.format : state.video.format).toUpperCase();
    const est = estimate(clone(state), source);
    summary.textContent = [`${state.size.width} × ${state.size.height}`, fmt, !isImg && `${state.video.fps} fps`, est && `~${est}`].filter(Boolean).join("  ·  ");
  }

  root.append(
    h("header", { class: "tp-head" }, icon("upload", 30), h("h2", { class: "tp-title" }, options.title || "Export")),
    h("div", { class: "tp-body" }, modeSeg.el, formatCard, sizeCard, outCard, summary, h("div", { class: "tpm-actions" }, go, cancel)),
  );
  mount.append(root);
  if (state.size.preset !== "custom") applySizePreset(state.size.preset);
  setStatus("idle");
  sync();

  return {
    el: root,
    get: () => clone(state),
    set(patch = {}, { silent = false } = {}) {
      const touched = [];
      if (patch.mode) { state.mode = patch.mode; modeSeg.set(patch.mode); touched.push(["mode", null]); }
      if (patch.output) {
        for (const key of ["name", "destination"]) if (patch.output[key] != null) state.output[key] = String(patch.output[key]);
        nameInput.value = state.output.name;
      }
      sync();
      if (!silent) touched.forEach(([g, k]) => emit(g, k, "api"));
    },
    setSource(next = {}) {
      source = { ...source, ...next };
      if (state.size.preset !== "custom") applySizePreset(state.size.preset);
      sync();
    },
    setDestination: (path) => { state.output.destination = String(path || ""); sync(); },
    setProgress, setStatus,
    on: bus.on, off: bus.off,
    destroy: () => { clearTimeout(doneTimer); root.remove(); },
  };
}

function createTextPanel() {
  const state = { title: "", sub: "", size: 100, caption: "", align: "center", box: { x: 15, y: 35, w: 70, h: 30 } };
  const subs = new Set();
  const emit = (key) => subs.forEach((fn) => fn({ group: "text", key, value: state[key], state: { ...state } }));
  const ins = {};
  const field = (key, label, ph) => {
    const i = h("input", { class: "tp-field__input ed-text__in", type: "text", spellcheck: "false", autocomplete: "off", placeholder: ph, "aria-label": label });
    i.addEventListener("input", () => { state[key] = i.value; emit(key); });
    ins[key] = i;
    return h("div", { class: "tpx-block" }, h("span", { class: "tpx-block__label" }, label), h("div", { class: "tp-field" }, i));
  };
  const size = createSlider({ label: "Title size", min: 40, max: 200, default: 100, unit: "%", origin: 40, value: 100, onInput: (v) => { state.size = v; emit("size"); } });
  const alignSeg = createSegmented({
    name: "Text alignment", value: state.align,
    options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }],
    onChange: (v) => { state.align = v; emit("align"); },
  });
  const titleCard = h("section", { class: "tp-card ed-text__card" }, h("h3", { class: "tp-card__head" }, icon("type"), "Title"),
    field("title", "Title", "Title text"), field("sub", "Subtitle", "Subtitle text"), size.el, block("Alignment", alignSeg.el));
  const capCard = h("section", { class: "tp-card ed-text__card" }, h("h3", { class: "tp-card__head" }, icon("film"), "Subtitles"),
    field("caption", "Caption", "Type a subtitle…"));
  const el = h("div", { class: "tp tpc ed-text", role: "group", "aria-label": "Text" },
    h("header", { class: "tp-head" }, icon("type", 30), h("h2", { class: "tp-title" }, "Text")),
    h("div", { class: "tp-body" }, titleCard, capCard));
  return {
    el,
    get: () => ({ ...state }),
    set(v) { Object.assign(state, v); for (const k in ins) ins[k].value = state[k] ?? ""; size.set(state.size); alignSeg.set(state.align || "center"); },
    focusTitle: () => { ins.title.focus(); ins.title.select(); },
    on: (evt, fn) => { subs.add(fn); return () => subs.delete(fn); },
    showTitle: (on) => { titleCard.hidden = !on; },
    destroy: () => el.remove(),
  };
}

/* Audio panel with tactile rotary controls and clip fade controls */
function createAudioDial({ key, label, min, max, value, unit = "", decimals = 0, onInput }) {
  let current = value;
  const format = (v) => `${Number(v).toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
  const control = h("div", { class:"ed-audio-dial__control", role:"slider", tabindex:"0",
    "aria-label":label, "aria-valuemin":String(min), "aria-valuemax":String(max), "aria-valuenow":String(value) },
    h("span",{class:"ed-audio-dial__arc","aria-hidden":"true"}),
    h("span",{class:"ed-audio-dial__indicator","aria-hidden":"true"}));
  const valueText = h("span",{class:"ed-audio-dial__value-text"},format(value));
  const valueInput = h("input",{class:"ed-audio-dial__value-input",type:"text",inputmode:decimals?"decimal":"numeric",autocomplete:"off",spellcheck:"false",hidden:true,"aria-label":`${label} value`});
  const valueEl = h("span",{class:"ed-audio-dial__value",title:"Double-click to edit value"},valueText,valueInput);
  const wrap = h("div",{class:"ed-audio-dial","data-dial":key},control,h("span",{class:"ed-audio-dial__label"},label),valueEl);
  const render = () => {
    const p = (current-min)/(max-min);
    control.style.setProperty("--dial-angle",`${p*270}deg`);
    control.style.setProperty("--dial-progress",`${p*270}deg`);
    control.style.setProperty("--dial-rotation",`${-135+p*270}deg`);
    control.setAttribute("aria-valuenow",String(current));
    valueText.textContent = format(current);
  };
  const set = (v, notify=false) => {
    const n=Number(v); if(!Number.isFinite(n)) return;
    current = clamp(n,min,max); current = Number(current.toFixed(decimals));
    render(); if (notify) onInput?.(current);
  };
  const editValue = () => {
    if(!valueInput.hidden) return;
    valueInput.value=String(current);
    valueInput.hidden=false;
    valueText.hidden=true;
    valueInput.focus();
    let finished=false;
    const finish=(apply)=>{
      if(finished)return;
      finished=true;
      const raw=valueInput.value.trim().replace(",",".");
      if(apply&&raw!==""&&Number.isFinite(Number(raw))) set(raw,true);
      valueInput.hidden=true;
      valueText.hidden=false;
      valueInput.onkeydown=null;
      valueInput.onblur=null;
      render();
    };
    valueInput.onkeydown=e=>{
      if(e.key==="Enter"){e.preventDefault();finish(true);}
      else if(e.key==="Escape"){e.preventDefault();finish(false);}
    };
    valueInput.onblur=()=>finish(true);
  };
  valueEl.addEventListener("dblclick",e=>{e.stopPropagation();editValue();});
  let dragY=0,dragValue=0;
  control.addEventListener("pointerdown",e=>{
    if(e.button!==0)return;e.preventDefault();control.setPointerCapture?.(e.pointerId);
    dragY=e.clientY;dragValue=current;control.classList.add("is-dragging");
    const move=ev=>set(dragValue+(dragY-ev.clientY)*(max-min)/150,true);
    const up=()=>{control.classList.remove("is-dragging");window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);};
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",up,{once:true});
  });
  control.addEventListener("keydown",e=>{
    const step=(max-min)/100;
    if(["ArrowUp","ArrowRight"].includes(e.key)){e.preventDefault();set(current+step,true);}
    else if(["ArrowDown","ArrowLeft"].includes(e.key)){e.preventDefault();set(current-step,true);}
    else if(e.key==="Home"){e.preventDefault();set(min,true);}
    else if(e.key==="End"){e.preventDefault();set(max,true);}
  });
  control.addEventListener("dblclick",()=>set(value,true));
  render();
  return {el:wrap,get:()=>current,set:v=>set(v,false),reset:()=>set(value,true)};
}

function createAudioAdjustmentsPanel(mount) {
  const state = { volume:100, pan:0, bass:0, treble:0, fadeIn:false, fadeOut:false, fadeInDuration:1, fadeOutDuration:1 };
  const subs = new Set();
  const emit = key => subs.forEach(fn=>fn({group:"audioAdj",key,value:state[key]}));
  const dial = (key,opts) => createAudioDial({...opts,key,value:state[key],onInput:v=>{state[key]=v;emit(key);}});
  const dials = {
    volume:dial("volume",{label:"Volume",min:0,max:200,unit:"%",decimals:0}),
    pan:dial("pan",{label:"Pan",min:-100,max:100,decimals:0}),
    bass:dial("bass",{label:"Bass",min:-20,max:20,unit:"dB",decimals:0}),
    treble:dial("treble",{label:"Treble",min:-20,max:20,unit:"dB",decimals:0}),
  };
  const makeFadeToggle=(key,label)=>{
    const sw=createSwitch({on:state[key],label:`${label} toggle`,onChange:v=>{state[key]=v;emit(key);}});
    const row=h("label",{class:"tpe-enable ed-audio-fade-toggle"},sw.el,h("span",{},label));
    return {el:row,set:sw.set};
  };
  const fadeInToggle=makeFadeToggle("fadeIn","Fade In");
  const fadeOutToggle=makeFadeToggle("fadeOut","Fade Out");
  const fadeInDuration=createSlider({label:"Fade In Duration",min:0,max:30,step:0.1,decimals:1,default:1,unit:"s",value:state.fadeInDuration,onInput:v=>{state.fadeInDuration=v;emit("fadeInDuration");}});
  const fadeOutDuration=createSlider({label:"Fade Out Duration",min:0,max:30,step:0.1,decimals:1,default:1,unit:"s",value:state.fadeOutDuration,onInput:v=>{state.fadeOutDuration=v;emit("fadeOutDuration");}});
  const fadeButtons=h("div",{class:"ed-audio-fades"},fadeInToggle.el,fadeOutToggle.el);
  const fadeDurations=h("div",{class:"ed-audio-fade-durations"},fadeInDuration.el,fadeOutDuration.el);
  const el=h("div",{class:"tp tpc ed-audio-panel",role:"group","aria-label":"Audio"},
    h("header",{class:"tp-head"},icon("music",22),h("h2",{class:"tp-title"},"Audio")),
    h("div",{class:"tp-body"},h("div",{class:"ed-audio-dials"},...Object.values(dials).map(x=>x.el)),fadeButtons,fadeDurations));
  mount.append(el);
  return {el,get:()=>({...state}),set(v){Object.assign(state,v);for(const k of Object.keys(dials))if(state[k]!==undefined)dials[k].set(state[k]);if(state.fadeIn!==undefined)fadeInToggle.set(state.fadeIn);if(state.fadeOut!==undefined)fadeOutToggle.set(state.fadeOut);if(state.fadeInDuration!==undefined)fadeInDuration.set(state.fadeInDuration);if(state.fadeOutDuration!==undefined)fadeOutDuration.set(state.fadeOutDuration);},on:(evt,fn)=>{subs.add(fn);return()=>subs.delete(fn);},destroy:()=>el.remove()};
}

const FPS = 30, PW = 1920, PH = 1080;
const TRACKS = [
  { id: "v4", kind: "video", label: "V4", icon: "film" },
  { id: "v3", kind: "video", label: "V3", icon: "film" },
  { id: "v2", kind: "video", label: "V2", icon: "film" },
  { id: "v1", kind: "video", label: "V1", icon: "film" },
  { id: "a1", kind: "audio", label: "A1", icon: "music" },
  { id: "a2", kind: "audio", label: "A2", icon: "music" },
];
const trackKind = (id) => TRACKS.find((t) => t.id === id).kind;

const THEMES = {
  sunset: { sky: ["#1b1038", "#7a2f6b", "#f0805a", "#ffd08a"], sun: "#ffe2a8", hill: ["#2a1740", "#1a0e2c"] },
  coast: { sky: ["#0f3057", "#2b78a8", "#8fd0e0", "#e9f6ee"], sun: "#fff3c4", hill: ["#1f5a6e", "#16414f"], water: "#1a6d8e" },
  harbor: { sky: ["#0b1026", "#1b2a63", "#4a5aa8", "#f09a7a"], sun: "#ffd9b0", hill: ["#10173a", "#0a0f27"], water: "#16245a" },
  dunes: { sky: ["#2c4a7a", "#a0b4c9", "#f4cf9a", "#f7e3bd"], sun: "#fff6dc", hill: ["#c98a4f", "#a86b38"] },
  forest: { sky: ["#0e2a2a", "#1f5c4a", "#7dbb8a", "#d8f0c8"], sun: "#f5ffd2", hill: ["#154a34", "#0d3323"] },
  city: { sky: ["#07060f", "#241047", "#5a2a7a", "#e0568f"], sun: "#ffd1e6", hill: ["#120a24", "#0a0617"] },
  title: { sky: ["#2a2b31", "#3a3b42", "#4a4b53", "#5a5b64"], sun: "#fff", hill: ["#222", "#111"], clip: ["#6a5cf0", "#3b2fa0"] },
};
// The library starts empty; every playable asset must be imported from disk.
const MEDIA = [];

const TRANS = [
  { id: "none", label: "None" }, { id: "dissolve", label: "Cross dissolve" },
  { id: "dip", label: "Dip to black" }, { id: "wipe", label: "Wipe" }, { id: "iris", label: "Iris" },
];

const pad = (n) => String(n).padStart(2, "0");
const fmtTC = (t) => {
  const f = Math.floor(t * FPS + 1e-6), s = Math.floor(f / FPS);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % FPS)}`;
};
const fmtMS = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
const themeGradient = (th) => `linear-gradient(160deg, ${th.sky[0]} 0%, ${th.sky[1]} 38%, ${th.sky[2]} 72%, ${th.sky[3]} 100%)`;

function quadMatrix(W, Hh, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let a, b, d, e, g, q;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) { a = x1 - x0; b = x3 - x0; d = y1 - y0; e = y3 - y0; g = 0; q = 0; }
  else {
    const den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-9) return "none";
    g = (dx3 * dy2 - dx2 * dy3) / den; q = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1; b = x3 - x0 + q * x3; d = y1 - y0 + g * y1; e = y3 - y0 + q * y3;
  }
  return `matrix3d(${a / W},${d / W},0,${g / W},${b / Hh},${e / Hh},0,${q / Hh},0,0,1,0,${x0},${y0},0,1)`;
}

const lerpFilter = (str, t) =>
  str === "none" ? "" : str.replace(/([a-z-]+)\((-?[\d.]+)(deg)?\)/g, (m, fn, v, u) => {
    const base = fn === "hue-rotate" || fn === "sepia" || fn === "grayscale" ? 0 : 1;
    return `${fn}(${(base + (parseFloat(v) - base) * t).toFixed(3)}${u || ""})`;
  });

const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

function sceneHTML(id, th) {
  const stops = th.sky.map((c, i) => `<stop offset="${i / (th.sky.length - 1)}" stop-color="${c}"/>`).join("");
  return `<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>
<rect width="160" height="90" fill="url(#sky-${id})"/>
<g data-sun><circle cx="108" cy="50" r="16" fill="${th.sun}" opacity=".16"/><circle cx="108" cy="50" r="8.5" fill="${th.sun}"/></g>
<g data-clouds opacity=".55"><ellipse cx="20" cy="22" rx="20" ry="3.4" fill="#fff" opacity=".35"/><ellipse cx="78" cy="33" rx="26" ry="3" fill="#fff" opacity=".25"/><ellipse cx="130" cy="17" rx="18" ry="2.8" fill="#fff" opacity=".3"/></g>
<path d="M0 62 L22 46 L40 58 L62 40 L88 60 L112 48 L136 62 L160 52 V90 H0Z" fill="${th.hill[0]}" opacity=".92"/>
<path d="M0 74 L30 62 L58 72 L90 60 L124 72 L160 64 V90 H0Z" fill="${th.hill[1]}"/>
${th.water ? `<rect y="70" width="160" height="20" fill="${th.water}" opacity=".9"/><g stroke="#fff" stroke-width=".4" opacity=".22"><path d="M10 76h30M60 80h40M110 75h36M30 85h50M95 86h45"/></g>` : ""}</svg>`;
}
const titleHTML = `<div class="ed-title"><span class="ed-title__big"></span><span class="ed-title__sub"></span></div>`;

function waveform(seed, n = 160) {
  let s = seed * 9301 + 49297, d = "M0 10";
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) { const a = 1.5 + r() * 7.5 * (0.55 + 0.45 * Math.sin(i / 9)); d += ` L${(i / (n - 1)) * 100} ${10 - a} `; }
  for (let i = n - 1; i >= 0; i--) { const a = 1.5 + r() * 6 * (0.55 + 0.45 * Math.sin(i / 7)); d += ` L${(i / (n - 1)) * 100} ${10 + a}`; }
  return `<svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="${d}Z" fill="rgba(210,255,235,.55)"/></svg>`;
}

function createVideoEditor(mount, options = {}) {
  let nid = 1;
  const uid = () => "c" + nid++;
  const defaultProps = () => ({
    transform: clone(DEFAULT_STATE), colors: buildDefaultState(),
    effects: buildDefaultEffects({ ...FILTER_GROUPS, ...VIDEO_EFFECTS_GROUPS, ...AUDIO_EFFECTS_GROUPS }),
    audio: { volume: 100, pan: 0, bass: 0, treble: 0, fadeIn: false, fadeOut: false, fadeInDuration: 1, fadeOutDuration: 1 },
    text: { title: "", sub: "", size: 100, caption: "", align: "center", box: { x: 15, y: 35, w: 70, h: 30 } },
  });
  let clips = options.clips ? [...options.clips] : [];
  if (!options.clips && options.benchmarkClipCount > 0) {
    const count = clamp(Math.floor(Number(options.benchmarkClipCount) || 0), 1, 2_000);
    clips = Array.from({ length: count }, (_, index) => ({
      id: `bench-${index + 1}`, track: `v${(index % 4) + 1}`,
      start: Math.floor(index / 4) * 1.5, dur: 6,
      label: `Preview benchmark ${index + 1}`, theme: "coast", mediaKind: "image",
      props: defaultProps(),
    }));
    nid = count + 1;
  }
  for (const clip of clips) {
    if (!clip.track?.startsWith("v")) continue;
    const buddy = clip.linkedAudioId
      ? clips.find((candidate) => candidate.id === clip.linkedAudioId)
      : clips.find((candidate) => candidate.track?.startsWith("a") && candidate.path === clip.path && Math.abs(candidate.start - clip.start) < 1 / FPS);
    if (buddy?.track?.startsWith("a")) { clip.audioDetached = true; clip.hasAudio = true; }
  }

  let selectedId = null, time = 0, playing = false, loopOn = false, tool = "select", snapOn = true, pps = 24, projectName = "Untitled Project";
  const selectedIds = new Set();
  const selectedKeyframes = new Map();
  const clearKeyframeSelection = () => selectedKeyframes.clear();
  const keyframeSelection = () => [...selectedKeyframes].flatMap(([clip, keys]) => [...keys].map((keyframe) => ({ clip, keyframe })))
    .filter(({ clip, keyframe }) => clips.includes(clip) && clipKeyframes(clip).includes(keyframe));
  const hist = { undo: [], redo: [] };
  let propertyChangeBefore = null, propertyChangeTimer = 0, propertyEditAnchor = null, propertyPointerActive = false;
  let nativeSyncQueue = Promise.resolve();
  let nativeTimelineRevision = 0, nativeSyncedRevision = -1, nativeQueuedRevision = -1;
  let nativeSyncPromise = Promise.resolve(null);
  let cachedDuration = null;
  let previewCandidateMode = "indexed";
  const dur = () => {
    if (cachedDuration == null) cachedDuration = clips.reduce((maximum, clip) => Math.max(maximum, clip.start + clip.dur), 5);
    return cachedDuration;
  };
  const sel = () => clips.find((c) => c.id === selectedId) || null;
  const setSingleSelection = (id) => { selectedId = id; selectedIds.clear(); if (id) selectedIds.add(id); };
  const isVisual = (c) => c && trackKind(c.track) === "video";
  let clipIndex = null;
  const trackOrder = new Map(TRACKS.map((track, index) => [track.id, index]));
  const lowerBoundBy = (items, value, getValue) => {
    let low = 0, high = items.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (getValue(items[mid]) < value) low = mid + 1;
      else high = mid;
    }
    return low;
  };
  function rebuildClipIndex() {
    const indexed = clips.map((clip, order) => ({ clip, order }));
    let duration = cachedDuration;
    if (duration == null) {
      duration = 5;
      for (const { clip } of indexed) duration = Math.max(duration, clip.start + clip.dur);
    }
    const startsByTrack = new Map(), endsByTrack = new Map();
    for (const item of indexed) {
      const track = item.clip.track;
      if (!startsByTrack.has(track)) startsByTrack.set(track, []);
      if (!endsByTrack.has(track)) endsByTrack.set(track, []);
      startsByTrack.get(track).push(item);
      if (item.clip.trans) endsByTrack.get(track).push(item);
    }
    for (const items of startsByTrack.values()) items.sort((a, b) => a.clip.start - b.clip.start || a.order - b.order);
    for (const items of endsByTrack.values()) items.sort((a, b) => (a.clip.start + a.clip.dur) - (b.clip.start + b.clip.dur) || a.order - b.order);
    const findFirstNear = (items, value, getTime, excludeId) => {
      if (!items) return null;
      let found = null;
      for (let i = lowerBoundBy(items, value - 0.05, getTime); i < items.length && getTime(items[i]) < value + 0.05; i++) {
        const item = items[i];
        if (item.clip.id !== excludeId && Math.abs(getTime(item) - value) < 0.05 && (!found || item.order < found.order)) found = item;
      }
      return found?.clip || null;
    };
    const nextById = new Map(), previousById = new Map();
    for (const item of indexed) {
      const clip = item.clip;
      nextById.set(clip.id, findFirstNear(startsByTrack.get(clip.track), clip.start + clip.dur, (entry) => entry.clip.start, clip.id));
      previousById.set(clip.id, findFirstNear(endsByTrack.get(clip.track), clip.start, (entry) => entry.clip.start + entry.clip.dur, clip.id));
    }
    const previewEntries = indexed.filter(({ clip }) => isVisual(clip)).map(({ clip }) => {
      const previous = previousById.get(clip.id), next = nextById.get(clip.id);
      const incoming = previous?.trans ? Math.max(0, Number(previous.trans.dur) || 0) / 2 : 0;
      const outgoing = clip.trans && next ? Math.max(0, Number(clip.trans.dur) || 0) / 2 : 0;
      return { clip, start: clip.start - incoming, end: clip.start + clip.dur + outgoing };
    }).sort((a, b) => a.start - b.start || (trackOrder.get(a.clip.track) ?? 0) - (trackOrder.get(b.clip.track) ?? 0));
    let treeSize = 1;
    while (treeSize < previewEntries.length) treeSize <<= 1;
    const maxEnd = new Float64Array(treeSize * 2);
    maxEnd.fill(-Infinity);
    for (let i = 0; i < previewEntries.length; i++) maxEnd[treeSize + i] = previewEntries[i].end;
    for (let i = treeSize - 1; i > 0; i--) maxEnd[i] = Math.max(maxEnd[i * 2], maxEnd[i * 2 + 1]);
    const audioClips = clips.filter((clip) => {
      const audioTrack = trackKind(clip.track) === "audio";
      const attachedVideoAudio = isVisual(clip) && clip.hasAudio && !clip.audioDetached && !clip.linkedAudioId
        && !clips.some((candidate) => trackKind(candidate.track) === "audio" && candidate.path === clip.path && Math.abs(candidate.start - clip.start) < 1 / FPS);
      return (audioTrack || attachedVideoAudio) && (clip.previewUrl || clip.path);
    });
    clipIndex = { nextById, previousById, previewEntries, maxEnd, treeSize, audioClips, audioIds: new Set(audioClips.map((clip) => clip.id)) };
    cachedDuration = duration;
    return clipIndex;
  }
  const getClipIndex = () => clipIndex || rebuildClipIndex();
  function collectPreviewCandidates(index, node, left, right, limit, at, output) {
    if (left >= limit || index.maxEnd[node] <= at || index.previewEntries[left]?.start > at) return;
    if (right - left === 1) {
      const entry = index.previewEntries[left];
      if (entry && entry.start <= at && entry.end > at) output.push(entry.clip);
      return;
    }
    const middle = (left + right) >>> 1;
    collectPreviewCandidates(index, node * 2, left, middle, limit, at, output);
    collectPreviewCandidates(index, node * 2 + 1, middle, right, limit, at, output);
  }
  const keyframeTolerance = 0.5 / FPS;
  const invalidateClipIndex = () => { clipIndex = null; cachedDuration = null; };
  const clipKeyframes = (c) => Array.isArray(c?.keyframes) ? c.keyframes : [];
  const compiledKeyframes = new WeakMap();
  const keyframeRevisions = new WeakMap();
  const invalidateKeyframeCache = (clip) => {
    keyframeRevisions.set(clip, (keyframeRevisions.get(clip) || 0) + 1);
    compiledKeyframes.delete(clip);
  };
  const compileKeyframes = (clip) => {
    const keyframes = clipKeyframes(clip), revision = keyframeRevisions.get(clip) || 0;
    let compiled = compiledKeyframes.get(clip);
    if (!compiled || compiled.keyframes !== keyframes || compiled.revision !== revision || compiled.duration !== clip.dur || compiled.baseProps !== clip.props) {
      const orderedKeyframes = keyframes
        .map((keyframe, order) => ({ keyframe, time: Number(keyframe.time), order }))
        .filter((entry) => Number.isFinite(entry.time))
        .sort((left, right) => left.time - right.time || left.order - right.order);
      const points = [{ time: 0, props: clip.props, easing: "linear" }, ...keyframes]
        .map((point) => ({ ...point, time: clamp(Number(point.time) || 0, 0, clip.dur) }))
        .sort((a, b) => a.time - b.time);
      const unique = [];
      for (const point of points) {
        const last = unique[unique.length - 1];
        if (last && Math.abs(last.time - point.time) < keyframeTolerance) unique[unique.length - 1] = point;
        else unique.push(point);
      }
      compiled = { keyframes, revision, duration: clip.dur, baseProps: clip.props, orderedKeyframes, points: unique };
      compiledKeyframes.set(clip, compiled);
    }
    return compiled;
  };
  const currentKeyframe = (c, at = time) => {
    if (!c) return null;
    const local = at - c.start;
    if (local < -keyframeTolerance || local > c.dur + keyframeTolerance) return null;
    const keys = compileKeyframes(c).orderedKeyframes, target = clamp(local, 0, c.dur);
    let low = 0, high = keys.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (keys[middle].time < target - keyframeTolerance) low = middle + 1;
      else high = middle;
    }
    let match = null;
    for (let index = low; index < keys.length && keys[index].time <= target + keyframeTolerance; index++) {
      if (Math.abs(keys[index].time - target) <= keyframeTolerance && (!match || keys[index].order < match.order)) match = keys[index];
    }
    return match?.keyframe || null;
  };
  const mixKeyframeValue = (from, to, amount) => {
    if (from === undefined) return amount >= 1 ? clone(to) : undefined;
    if (to === undefined) return amount >= 1 ? undefined : clone(from);
    if (typeof from === "number" && typeof to === "number") return from + (to - from) * amount;
    if (from && to && typeof from === "object" && typeof to === "object" && !Array.isArray(from) && !Array.isArray(to)) {
      const result = {};
      for (const key of new Set([...Object.keys(from), ...Object.keys(to)])) {
        const value = mixKeyframeValue(from[key], to[key], amount);
        if (value !== undefined) result[key] = value;
      }
      return result;
    }
    return amount >= 1 ? clone(to) : clone(from);
  };
  const easeKeyframe = (amount, easing) => {
    const t = clamp(amount, 0, 1);
    if (easing === "ease-in") return t * t;
    if (easing === "ease-out") return 1 - (1 - t) * (1 - t);
    if (easing === "ease-in-out") return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    if (easing === "hold") return t >= 1 ? 1 : 0;
    return t;
  };
  const propsAt = (c, at = time) => {
    const keyframes = clipKeyframes(c);
    if (!keyframes.length) return c.props;
    const compiled = compileKeyframes(c);
    const unique = compiled.points;
    const local = clamp(at - c.start, 0, c.dur);
    if (local <= unique[0].time) return unique[0].props;
    let low = 1, high = unique.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (unique[middle].time < local) low = middle + 1;
      else high = middle;
    }
    if (low >= unique.length) return unique[unique.length - 1].props;
    const left = unique[low - 1], right = unique[low];
    const progress = (local - left.time) / Math.max(1e-6, right.time - left.time);
    return mixKeyframeValue(left.props, right.props, easeKeyframe(progress, left.easing));
  };
  const captureKeyframe = (c, localTime, properties) => {
    c.keyframes ||= [];
    const at = clamp(Math.round(localTime * FPS) / FPS, 0, c.dur);
    let keyframe = c.keyframes.find((item) => Math.abs(item.time - at) <= keyframeTolerance);
    if (keyframe) keyframe.props = clone(properties);
    else { keyframe = { time: at, easing: "linear", props: clone(properties) }; c.keyframes.push(keyframe); }
    c.keyframes.sort((a, b) => a.time - b.time);
    invalidateKeyframeCache(c);
    return keyframe;
  };
  const keyframesForRange = (c, from, to, pinStart = false, pinEnd = false) => {
    const source = clipKeyframes(c);
    if (!source.length) return [];
    const easingAt = (at) => {
      const exact = source.find((keyframe) => Math.abs(keyframe.time - at) <= keyframeTolerance);
      if (exact) return exact.easing || "linear";
      const previous = [{ time: 0, easing: "linear" }, ...source]
        .filter((keyframe) => keyframe.time < at - keyframeTolerance)
        .sort((a, b) => a.time - b.time).at(-1);
      return previous?.easing || "linear";
    };
    const result = source
      .filter((keyframe) => keyframe.time >= from - keyframeTolerance && keyframe.time <= to + keyframeTolerance)
      .map((keyframe) => ({ ...clone(keyframe), time: clamp(keyframe.time - from, 0, to - from) }));
    if (pinStart && (from > keyframeTolerance || result.some((keyframe) => keyframe.time <= keyframeTolerance))) {
      const exact = source.find((keyframe) => Math.abs(keyframe.time - from) <= keyframeTolerance);
      const startKeyframe = { time: 0, easing: easingAt(from), props: clone(propsAt(c, c.start + from)), ...(exact || {}) };
      result.splice(0, result.length, startKeyframe, ...result.filter((keyframe) => keyframe.time > keyframeTolerance));
    }
    if (pinEnd && !result.some((keyframe) => Math.abs(keyframe.time - (to - from)) <= keyframeTolerance)) {
      result.push({ time: to - from, easing: easingAt(to), props: clone(propsAt(c, c.start + to)) });
    }
    return result.sort((a, b) => a.time - b.time);
  };
  const writeClipGroup = (c, group, value) => {
    if (clipKeyframes(c).length) {
      const editTime = propertyEditAnchor?.clipId === c.id ? propertyEditAnchor.time : time;
      const properties = clone(propsAt(c, editTime));
      properties[group] = clone(value);
      captureKeyframe(c, editTime - c.start, properties);
    } else c.props[group] = clone(value);
  };
  const anyOn = (g) => Object.entries(g || {}).some(([k, v]) => k !== "preset" && v && v.enabled);
  const hasFx = (c) => isVisual(c) && (c.props.effects.preset.id !== "none" || anyOn(c.props.effects) || anyOn(c.props.videoFx));

  const root = h("div", { class: "ed" });

  const btn = (ico, label, cls = "") => {
    const b = h("button", { class: "ed-btn " + cls, type: "button", "aria-label": label, title: label });
    b.append(icon(ico, 20));
    return b;
  };
  const undoBtn = btn("undo", "Undo (Ctrl+Z)"), redoBtn = btn("redo", "Redo (Ctrl+Shift+Z)");
  const nameInput = h("input", { class: "ed-name", type: "text", spellcheck: "false", "aria-label": "Project name", maxlength: "60" });
  nameInput.value = projectName;
  const exportBtn = h("button", { class: "ed-export", type: "button" }, icon("upload", 18), "Export");
  const logo = h("img", { class: "ed-logo", src: "./assets/pluto-icon.ico", alt: "" });
  const windowApi = window.__TAURI__?.window?.getCurrentWindow?.();
  const callWindow = (method) => {
    if (!windowApi || typeof windowApi[method] !== "function") return Promise.resolve();
    try {
      return Promise.resolve(windowApi[method]()).catch((error) => root.dispatchEvent(new CustomEvent("pluto:backend-error", { detail: String(error) })));
    } catch (error) {
      root.dispatchEvent(new CustomEvent("pluto:backend-error", { detail: String(error) }));
      return Promise.resolve();
    }
  };
  const minimizeBtn = btn("windowMinimize", "Minimize window", "ed-window-btn");
  const maximizeBtn = btn("windowMaximize", "Maximize window", "ed-window-btn");
  const closeWindowBtn = btn("x", "Close window", "ed-window-btn ed-window-btn--close");
  const windowControls = h("div", { class: "ed-window-controls", "aria-label": "Window controls" }, minimizeBtn, maximizeBtn, closeWindowBtn);
  windowControls.hidden = !windowApi;
  const updateMaximizeButton = async () => {
    if (!windowApi?.isMaximized) return;
    try {
      const maximized = await windowApi.isMaximized();
      maximizeBtn.replaceChildren(icon(maximized ? "windowRestore" : "windowMaximize", 16));
      maximizeBtn.setAttribute("aria-label", maximized ? "Restore window" : "Maximize window");
      maximizeBtn.title = maximized ? "Restore window" : "Maximize window";
    } catch { /* Window state is unavailable in browser-only previews. */ }
  };
  minimizeBtn.addEventListener("click", () => callWindow("minimize"));
  maximizeBtn.addEventListener("click", () => callWindow("toggleMaximize").then(updateMaximizeButton));
  closeWindowBtn.addEventListener("click", () => callWindow("close"));
  updateMaximizeButton();
  const titleDrag = h("span", { class: "ed-top__drag", "data-tauri-drag-region": true, "aria-hidden": "true" });
  titleDrag.addEventListener("dblclick", () => callWindow("toggleMaximize").then(updateMaximizeButton));
  const topActions = h("div", { class: "ed-top__actions" }, undoBtn, redoBtn);
  const top = h("header", { class: "ed-card ed-top" },
    logo, h("span", { class: "ed-brand", "data-tauri-drag-region": true }, "Pluto"), h("span", { class: "ed-sep", "data-tauri-drag-region": true }), nameInput, exportBtn,
    topActions, titleDrag, windowControls);

  /* Left Panel: Media and Audio tabs */
  const mediaContent = h("div", { class: "ed-media__content" });
  const audioAdjMount = h("div", { style: "display:none;" });
  const audioAdjPanel = createAudioAdjustmentsPanel(audioAdjMount);

  const leftTabSeg = createSegmented({
    name: "Left Panel View", value: "media",
    options: [{ value: "media", label: "Media" }, { value: "audio", label: "Audio" }],
    onChange: (v) => {
      mediaGridWrap.style.display = v === "media" ? "flex" : "none";
      audioAdjMount.style.display = v === "audio" ? "block" : "none";
      mediaScroll.scrollTop = 0;
    }
  });

  const mediaGrid = h("div", { class: "ed-media__grid" });
  const mediaItems = [...MEDIA];
  const mediaByPath = new Map(mediaItems.filter((item) => item.path).map((item) => [item.path, item]));
  const pendingMediaAssets = new Map();
  const mediaAssetKey = (asset) => JSON.stringify([asset?.path || "", asset?.assetVersion || ""]);
  const mediaEmpty = h("p", { class: "ed-media__empty" }, "No media imported yet");
  const search = h("input", { class: "ed-search", type: "text", placeholder: "Search media", spellcheck: "false", "aria-label": "Search media" });
  const renderMedia = () => {
    const matches = mediaItems.filter((m) => m.label.toLowerCase().includes(search.value.toLowerCase()));
    mediaEmpty.textContent = mediaItems.length ? "No matching media" : "No media imported yet";
    mediaEmpty.hidden = matches.length > 0;
    mediaGrid.replaceChildren(...matches.map((m) => {
      const th = THEMES[m.theme] || THEMES.sunset;
      const add = h("button", { class: "ed-media__add", type: "button", "aria-label": `Add ${m.label} to timeline` }, icon("plus", 18));
      const tile = h("div", { class: "ed-media__tile", draggable: "false", tabindex: "0" },
        h("div", { class: "ed-media__thumb" }, h("span", { class: "ed-media__dur" }, fmtMS(m.dur)), add),
        h("span", { class: "ed-media__name" }, m.label));
      tile.firstChild.style.background = themeGradient(th);
      if (m.thumbnail || (m.kind === "image" && m.previewUrl)) tile.firstChild.style.backgroundImage = `url("${m.thumbnail || m.previewUrl}")`;
      add.addEventListener("click", () => addClip(m));
      tile.addEventListener("dblclick", () => addClip(m));
      tile.addEventListener("keydown", (event) => {
        if (event.target === tile && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); addClip(m); }
      });
      tile.addEventListener("pointerdown", (e) => beginMediaDrag(e, m, tile));
      return tile;
    }));
  };
  search.addEventListener("input", renderMedia);
  const mediaGridWrap = h("div", { class: "ed-media__grid-wrap" },
    h("label", { class: "ed-searchwrap" }, icon("search", 18), search), mediaEmpty, mediaGrid
  );
  const mediaScroll = h("div", { class: "ed-media__scroll" }, mediaGridWrap, audioAdjMount);
  mediaScroll.addEventListener("wheel", (e) => {
    const maxScroll = mediaScroll.scrollHeight - mediaScroll.clientHeight;
    if (maxScroll <= 0) return;
    const next = clamp(mediaScroll.scrollTop + e.deltaY, 0, maxScroll);
    if (next !== mediaScroll.scrollTop) {
      e.preventDefault();
      mediaScroll.scrollTop = next;
    }
  }, { passive: false });
  mediaContent.append(leftTabSeg.el, mediaScroll);
  const importBtn = h("button", { class: "ed-pill", type: "button" }, icon("plus", 16), "Import");
  importBtn.addEventListener("click", async () => {
    if (!window.plutoNative?.importMedia) { mediaEmpty.hidden = false; mediaEmpty.textContent = "Media import is available in the Pluto desktop app"; return; }
    importBtn.disabled = true;
    try {
      const asset = await window.plutoNative.importMedia();
      if (!asset) return;
      const previewUrl = window.plutoNative.convertFileSrc(asset.path);
      const media = { ...asset, dur: asset.duration, label: asset.name, theme: asset.kind === "audio" ? "audio" : "coast", previewUrl, thumbnail: asset.thumbnail || (asset.kind === "image" ? previewUrl : null) };
      const assetKey = mediaAssetKey(asset);
      const completed = pendingMediaAssets.get(assetKey);
      if (completed) {
        media.thumbnail = completed.thumbnail || media.thumbnail;
        media.filmstrip = completed.filmstrip || media.filmstrip;
        media.waveform = completed.waveform || media.waveform;
        pendingMediaAssets.delete(assetKey);
      }
      mediaItems.push(media);
      if (media.path) mediaByPath.set(media.path, media);
      renderMedia();
    } catch (error) {
      mediaEmpty.hidden = false; mediaEmpty.textContent = `Import failed: ${error}`;
    } finally { importBtn.disabled = false; }
  });
  const media = h("aside", { class: "ed-card ed-media" },
    h("div", { class: "ed-card__head" }, icon("film", 22), h("h2", {}, "Library"), h("span", { class: "ed-spacer" }), importBtn),
    mediaContent);

  const frame = h("div", { class: "ed-frame" });
  const gridEl = h("div", { class: "ed-guides", hidden: true });
  const textBoxDraft = h("div", { class: "ed-text-box-draft", hidden: true });
  frame.append(gridEl, textBoxDraft);
  const selBox = h("div", { class: "ed-sel", hidden: true },
    ["tl", "tr", "br", "bl"].map((c) => h("span", { class: "ed-handle", "data-corner": c })));
  const frameWrap = h("div", { class: "ed-framewrap" }, frame, selBox);
  const stage = h("div", { class: "ed-stage" }, frameWrap);
  const tcNow = h("span", { class: "ed-tc__now" }), tcTotal = h("span", { class: "ed-tc__total" });
  const bPlay = h("button", { class: "ed-play", type: "button", "aria-label": "Play / Pause (Space)" });
  const bBack = btn("chevLeft", "Previous frame"), bFwd = btn("chevRight", "Next frame");
  const bStart = btn("skipBack", "Go to start"), bEnd = btn("skipForward", "Go to end");
  const bLoop = btn("repeat", "Loop", "ed-btn--toggle"), bGuides = btn("grid", "Guides", "ed-btn--toggle");
  const preview = h("section", { class: "ed-card ed-preview" }, stage,
    h("div", { class: "ed-transport" },
      h("div", { class: "ed-tc" }, tcNow, h("span", { class: "ed-tc__sep" }, "/"), tcTotal),
      h("div", { class: "ed-transport__mid" }, bStart, bBack, bPlay, bFwd, bEnd),
      h("div", { class: "ed-transport__right" }, h("span", { class: "ed-chip" }, `${PW}×${PH} · ${FPS} fps`), bLoop, bGuides)));

  const tools = {
    select: btn("cursor", "Select (V)", "ed-btn--tool"),
    hand: btn("hand", "Hand (H)", "ed-btn--tool"),
    razor: btn("scissors", "Razor (C)", "ed-btn--tool"),
    text: btn("type", "Text Tool (T)", "ed-btn--tool"),
  };
  const bDelete = btn("trash", "Delete (Del)");
  const bSnap = btn("magnet", "Snapping", "ed-btn--toggle");
  const zoom = h("input", { class: "ed-range", type: "range", min: "6", max: "90", step: "1", value: String(pps), "aria-label": "Timeline zoom" });
  const bZoomOut = btn("zoomOut", "Zoom out"), bZoomIn = btn("zoomIn", "Zoom in");
  const bKeyPrev = btn("keyPrev", "Previous keyframe (Alt+Left)", "ed-btn--keyframe");
  const bKeyToggle = btn("keyAdd", "Add keyframe at playhead (K)", "ed-btn--keyframe ed-btn--keyframe-add");
  const bKeyNext = btn("keyNext", "Next keyframe (Alt+Right)", "ed-btn--keyframe");
  const keyframeControls = h("div", { class: "ed-keyframe-controls", "aria-label": "Keyframe navigation" }, bKeyPrev, bKeyToggle, bKeyNext);
  const tlBar = h("div", { class: "ed-tl-bar" }, tools.select, tools.hand, tools.razor, tools.text, h("span", { class: "ed-sep" }), bDelete,
    h("span", { class: "ed-spacer" }), keyframeControls, bZoomOut, zoom, bZoomIn, h("span", { class: "ed-sep" }), bSnap);

  const ruler = h("div", { class: "ed-ruler" });
  const rows = TRACKS.map((t) => h("div", { class: "ed-track", "data-track": t.id }));
  const playhead = h("div", { class: "ed-playhead" }, h("span", { class: "ed-playhead__head" }));
  const snapLine = h("div", { class: "ed-snapline", hidden: true });
  const tlContent = h("div", { class: "ed-tl-content" }, ruler, h("div", { class: "ed-tracks" }, rows), playhead, snapLine);
  const tlScroll = h("div", { class: "ed-tl-scroll" }, tlContent);
  let mediaDragState = null, dropPreviewVideo = null, dropPreviewAudio = null, activeMediaPlan = null;
  const labelsInner = h("div", { class: "ed-tl-labels__inner" }, TRACKS.map((t) => h("div", { class: "ed-tl-label" }, icon(t.icon, 14), t.label)));
  const labels = h("div", { class: "ed-tl-labels" }, labelsInner);
  const timeline = h("section", { class: "ed-card ed-timeline" }, tlBar, h("div", { class: "ed-tl-body" }, labels, tlScroll));
  tlScroll.addEventListener("scroll", () => { labelsInner.style.transform = `translateY(${-tlScroll.scrollTop}px)`; }, { passive: true });
  tlScroll.addEventListener("wheel", (e) => {
    if (e.ctrlKey) { e.preventDefault(); setZoom(pps * (e.deltaY < 0 ? 1.08 : 0.92)); return; }
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      tlScroll.scrollLeft += e.deltaX || e.deltaY; e.preventDefault();
    } else {
      tlScroll.scrollTop += e.deltaY; e.preventDefault();
    }
  }, { passive: false });

  const mounts = { transform: h("div"), colors: h("div"), effects: h("div"), text: h("div") };
  const exportMount = h("div");

  /* Effects tab houses Filters, Video Effects, and Audio Effects sections */
  const fxMount = h("div");
  const effectsPanel = createEffectsPanel(fxMount, {
    title: "Effects",
    groups: { ...FILTER_GROUPS, ...VIDEO_EFFECTS_GROUPS, ...AUDIO_EFFECTS_GROUPS },
    presets: PRESETS
  });

  const panels = {
    transform: createTransformPanel(mounts.transform),
    colors: createColorsPanel(mounts.colors),
    effects: effectsPanel,
    text: createTextPanel(),
    export: createExportPanel(exportMount, { autoStatus: false, source: { width: PW, height: PH, duration: dur() }, initial: { output: { name: projectName } } }),
  };
  mounts.text.append(panels.text.el);
  mounts.effects.append(fxMount);

  const transChips = TRANS.map((t) => {
    const b = h("button", { class: "ed-opt", type: "button", "aria-pressed": "false" }, t.label);
    b.addEventListener("click", () => setTrans(t.id));
    return b;
  });
  const chipsWrap = h("div", { class: "ed-chips" }, transChips);
  const transDur = createSlider({ label: "Duration", min: 0.2, max: 3, step: 0.1, decimals: 1, default: 1, unit: "s", origin: 0.2, value: 1,
    onInput: (v) => { const c = sel(); if (c && c.trans) { c.trans.dur = v; clipIndex = null; renderJunctions(); renderPreview(); schedulePropertyCommit(); } } });
  const transNote = h("p", { class: "ed-trans__note" });
  const transToggle = h("button",{class:"ed-effects-category__head ed-trans__head",type:"button","aria-label":"Collapse transitions","aria-expanded":"true"},
    icon("transition",21),h("span",{class:"ed-effects-category__title"},"Transitions"),
    h("span",{class:"ed-effects-category__chevron is-open","aria-hidden":"true"},icon("chevRight",18)));
  const transBody = h("div",{class:"ed-effects-category__body ed-trans__body"},transNote,chipsWrap,transDur.el);
  const transCard = h("section",{class:"ed-effects-category ed-trans","data-open":"true"},transToggle,transBody);
  transToggle.addEventListener("click",()=>{
    const open=transCard.dataset.open!=="true";
    transCard.dataset.open=String(open);
    transToggle.querySelector(".ed-effects-category__chevron").classList.toggle("is-open",open);
    transToggle.setAttribute("aria-expanded",String(open));
    transToggle.setAttribute("aria-label",open?"Collapse transitions":"Expand transitions");
  });
  const effectsStack = fxMount.querySelector(".ed-effects-categories");
  if (effectsStack) effectsStack.prepend(transCard); else fxMount.prepend(transCard);

  const emptyDetail = h("span", {}, "Select a clip on the timeline to edit its properties.");
  const empty = h("div", { class: "ed-empty" }, icon("film", 30), h("strong", {}, "Nothing to adjust"), emptyDetail);
  const tabs = createSegmented({
    name: "Inspector", value: "transform",
    options: [{ value: "transform", label: "Transform" }, { value: "colors", label: "Colors" }, { value: "effects", label: "Effects" }, { value: "text", label: "Text" }],
    onChange: (v) => showTab(v),
  });
  const inspector = h("aside", { class: "ed-inspector" }, h("div", { class: "ed-tabs" }, tabs.el),
    h("div", { class: "ed-inspector__scroll" }, empty, ...Object.values(mounts)));
  let tab = "transform";
  function showTab(v) {
    tab = v; tabs.set(v);
    const selected = sel();
    const ok = isVisual(selected), isAudio = selected && trackKind(selected.track) === "audio";
    const isTitle = selected?.theme === "title";
    const effectGroups = [...fxMount.querySelectorAll(".ed-effects-category:not(.ed-trans)")];
    if (effectGroups.length === 3) {
      effectGroups[0].hidden = !ok || isTitle;
      effectGroups[1].hidden = !ok || isTitle;
      effectGroups[2].hidden = !isAudio;
    }
    transCard.hidden = !ok || isAudio || isTitle;
    for (const [k, m] of Object.entries(mounts)) {
      const show = k === v;
      if (show && m.hidden) { m.classList.remove("ed-fade"); void m.offsetWidth; m.classList.add("ed-fade"); }
      m.hidden = !show || (!ok && !(isAudio && k === "effects"));
    }
    empty.hidden = (ok && !(isTitle && v === "effects")) || (isAudio && v === "effects");
    emptyDetail.textContent = isTitle && v === "effects" ? "Text clips are edited in the Text tab." : !selected && v === "text" ? "Choose the Text tool, then drag a box in the preview to add a title." : isAudio ? "Audio clips use the Audio controls in the Library panel and the Audio Effects section here." : "Select a clip on the timeline to edit its properties.";
    if (ok && v === "text") panels.text.showTitle(selected.theme === "title");
    updateTransCard();
  }
  function setTrans(id) {
    const c = sel(); if (!c) return;
    const before = snapshot();
    c.trans = id === "none" ? null : { type: id, dur: c.trans ? c.trans.dur : 1 };
    commit(before);
  }
  function updateTransCard() {
    const c = sel(), n = c && isVisual(c) ? nextClip(c) : null;
    chipsWrap.hidden = !n; transDur.el.hidden = !n || !c.trans;
    transNote.textContent = n ? `${c.label}  →  ${n.label}` : "Place another clip right after this one to add a transition between them.";
    if (!n) return;
    const cur = c.trans ? c.trans.type : "none";
    TRANS.forEach((t, i) => transChips[i].setAttribute("aria-pressed", String(t.id === cur)));
    transDur.set(c.trans ? c.trans.dur : 1);
  }

  const drawerClose = btn("x", "Close export");
  const scrim = h("div", { class: "ed-scrim" });
  const drawer = h("aside", { class: "ed-drawer", "aria-label": "Export" },
    h("div", { class: "ed-drawer__head" }, icon("upload", 22), h("h2", {}, "Export"), h("span", { class: "ed-spacer" }), drawerClose),
    h("div", { class: "ed-drawer__body" }, exportMount));
  drawer.inert = true;
  function setDrawer(open) {
    root.dataset.drawer = String(open); drawer.inert = !open;
    exportBtn.setAttribute("aria-expanded", String(open));
  }
  exportBtn.addEventListener("click", () => setDrawer(root.dataset.drawer !== "true"));
  scrim.addEventListener("click", () => setDrawer(false));
  drawerClose.addEventListener("click", () => setDrawer(false));

  const splitLeft = h("div",{class:"ed-splitter ed-splitter--left","aria-label":"Resize library panel",role:"separator","aria-orientation":"vertical",tabindex:"0"});
  const splitRight = h("div",{class:"ed-splitter ed-splitter--right","aria-label":"Resize inspector panel",role:"separator","aria-orientation":"vertical",tabindex:"0"});
  const splitTimeline = h("div",{class:"ed-splitter ed-splitter--timeline","aria-label":"Resize timeline",role:"separator","aria-orientation":"horizontal",tabindex:"0"});
  const backendNotice = h("div", { class: "ed-backend-notice", role: "alert", hidden: true });
  root.append(top,media,preview,inspector,timeline,scrim,drawer,splitLeft,splitRight,splitTimeline,backendNotice);
  let backendNoticeTimer = 0;
  root.addEventListener("pluto:backend-error", (event) => {
    backendNotice.textContent = `Timeline backend: ${event.detail}`;
    backendNotice.hidden = false;
    clearTimeout(backendNoticeTimer);
    backendNoticeTimer = setTimeout(() => { backendNotice.hidden = true; }, 6500);
  });
  mount.append(root);

  const resizeBounds = {
    left:{min:210,max:390}, right:{min:300,max:520}, timeline:{min:190,max:440}
  };
  const setSplit = (kind,value) => {
    const b=resizeBounds[kind]; value=clamp(value,b.min,b.max);
    if(kind==="left") root.style.setProperty("--left-panel-width",`${value}px`);
    if(kind==="right") root.style.setProperty("--right-panel-width",`${value}px`);
    if(kind==="timeline") root.style.setProperty("--timeline-height",`${value}px`);
  };
  const bindSplitter = (el,kind) => {
    el.addEventListener("pointerdown",(e)=>{
      if(e.button!==0)return; e.preventDefault(); el.classList.add("is-dragging");
      const rect=root.getBoundingClientRect(), startX=e.clientX,startY=e.clientY;
      const initial=kind==="left"?(parseFloat(getComputedStyle(root).getPropertyValue("--left-panel-width"))||270):
        kind==="right"?(parseFloat(getComputedStyle(root).getPropertyValue("--right-panel-width"))||420):
        (parseFloat(getComputedStyle(root).getPropertyValue("--timeline-height"))||318);
      const move=(ev)=>{
        const next=kind==="left"?initial+(ev.clientX-startX):
          kind==="right"?initial-(ev.clientX-startX):initial-(ev.clientY-startY);
        setSplit(kind,next);
      };
      const up=()=>{el.classList.remove("is-dragging");window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);};
      window.addEventListener("pointermove",move);window.addEventListener("pointerup",up,{once:true});
    });
    el.addEventListener("keydown",(e)=>{
      if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))return;
      e.preventDefault(); const sign=["ArrowRight","ArrowDown"].includes(e.key)?1:-1;
      const prop=kind==="left"?"--left-panel-width":kind==="right"?"--right-panel-width":"--timeline-height";
      const current=parseFloat(getComputedStyle(root).getPropertyValue(prop))||resizeBounds[kind].min;
      setSplit(kind,current+sign*(e.shiftKey?24:8));
    });
  };
  bindSplitter(splitLeft,"left");bindSplitter(splitRight,"right");bindSplitter(splitTimeline,"timeline");

  const layerNodes = new Map();
  const audioPreviewNodes = new Map();
  let previewSeekRevision = 0;
  let previewAudioContext = null;
  const OV = ["temp", "gs", "gm", "gh", "glow", "scan", "grain", "vig"];

  function makeLayer(clip) {
    const th = THEMES[clip.theme] || THEMES.sunset;
    const layer = h("div", { class: "ed-layer" }), warp = h("div", { class: "ed-warp" }), content = h("div", { class: "ed-content" });
    const filterId = `pluto-detail-${uid()}`;
    const svgNS = "http://www.w3.org/2000/svg";
    const svgNode = (name, attributes = {}) => {
      const node = document.createElementNS(svgNS, name);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
      return node;
    };
    const filterSvg = svgNode("svg", { class: "ed-filter-defs", width: 0, height: 0, "aria-hidden": "true" });
    const defs = svgNode("defs"), detailFilter = svgNode("filter", {
      id: filterId, x: "-20%", y: "-20%", width: "140%", height: "140%", "color-interpolation-filters": "sRGB",
    });
    const detailBlur = svgNode("feGaussianBlur", { in: "SourceGraphic", stdDeviation: 1.2, result: "detailBlur" });
    const detailComposite = svgNode("feComposite", {
      in: "SourceGraphic", in2: "detailBlur", operator: "arithmetic", k1: 0, k2: 1, k3: 0, k4: 0,
    });
    detailFilter.append(detailBlur, detailComposite); defs.append(detailFilter); filterSvg.append(defs);
    let mediaEl = null;
    if (clip.previewUrl && clip.mediaKind === "video") {
      mediaEl = h("video", { src: clip.previewUrl, muted: "", playsinline: "", preload: "auto" }); content.append(mediaEl);
    } else if (clip.previewUrl && clip.mediaKind === "image") {
      mediaEl = h("img", { src: clip.previewUrl, alt: "" }); content.append(mediaEl);
    } else content.innerHTML = clip.theme === "title" ? titleHTML : sceneHTML(clip.id, th);
    const ov = {};
    for (const k of OV) ov[k] = h("div", { class: `ed-ov ed-ov--${k}` });
    const cap = h("div", { class: "ed-cap", hidden: true });
    warp.append(content, ...OV.map((k) => ov[k]), cap);
    layer.append(filterSvg, warp);
    return { layer, warp, content, ov, cap, mediaEl, detailBlur, detailComposite, filterId, sun: content.querySelector("[data-sun]"), clouds: content.querySelector("[data-clouds]") };
  }

  function applyLayer(n, clip, lt, animatedProps = clip.props) {
    const { transform: T, colors: C, effects: E, text: P } = animatedProps;
    const style = (element, property, value) => { if (element.style[property] !== value) element.style[property] = value; };
    const W = frame.clientWidth || 1, Hh = frame.clientHeight || 1, k = W / PW;
    style(n.layer, "transform", `translate(${T.position.x * k}px, ${T.position.y * k}px) rotate(${T.rotation}deg) scale(${T.scale.w / 100}, ${T.scale.h / 100})`);
    const D = T.distort || {}, tl = (D.tl || 0) * k, tr = (D.tr || 0) * k, br = (D.br || 0) * k, bl = (D.bl || 0) * k;
    style(n.warp, "transform", quadMatrix(W, Hh, [[tl, tl], [W - tr, tr], [W - br, Hh - br], [bl, Hh - bl]]));
    const cr = T.crop;
    style(n.layer, "clipPath", cr.top || cr.right || cr.bottom || cr.left ? `inset(${cr.top * k}px ${cr.right * k}px ${cr.bottom * k}px ${cr.left * k}px)` : "none");
    if (clip.theme === "title") {
      const big = n.content.querySelector(".ed-title__big"), sub = n.content.querySelector(".ed-title__sub");
      const titleBox = n.content.querySelector(".ed-title"), box = P.box || { x: 15, y: 35, w: 70, h: 30 };
      if (big.textContent !== P.title) big.textContent = P.title;
      if (sub.textContent !== P.sub) sub.textContent = P.sub;
      if (sub.hidden === !!P.sub) sub.hidden = !P.sub;
      style(big, "fontSize", `${(7.2 * P.size) / 100}cqw`); style(sub, "fontSize", `${(2.2 * P.size) / 100}cqw`);
      style(titleBox, "left", `${clamp(Number(box.x) || 0, 0, 100)}%`);
      style(titleBox, "top", `${clamp(Number(box.y) || 0, 0, 100)}%`);
      style(titleBox, "width", `${clamp(Number(box.w) || 1, 1, 100)}%`);
      style(titleBox, "height", `${clamp(Number(box.h) || 1, 1, 100)}%`);
      style(titleBox, "textAlign", P.align || "center");
      style(titleBox, "alignItems", P.align === "left" ? "flex-start" : P.align === "right" ? "flex-end" : "center");
      titleBox.classList.toggle("is-editing", clip.id === selectedId && tool === "text");
    }
    const filters = [];
    const preset = PRESETS.find(item => item.id === E.preset?.id);
    if (preset?.filter && preset.filter !== "none") filters.push(lerpFilter(preset.filter, (E.preset.intensity ?? 100) / 100));
    const light = C.light || {}, color = C.color || {}, detail = C.detail || {};
    const exposure = Math.pow(2, (light.exposure || 0) + (light.brightness || 0) / 100);
    const contrast = 1 + (light.contrast || 0) / 100;
    const saturation = Math.max(0, 1 + (color.saturation || 0) / 100 + (color.vibrance || 0) / 150);
    filters.push(`brightness(${exposure})`, `contrast(${Math.max(.1, contrast)})`, `saturate(${saturation})`);
    const tint = C.grading?.tint || {};
    const shadows = C.grading?.shadows || {};
    const highlights = C.grading?.highlights || {};
    const allHsl = C.hsl?.all || {};
    if (tint.amount > 0) filters.push(`sepia(${tint.amount / 180})`, `hue-rotate(${(tint.hue || 0) * .1}deg)`);
    if (shadows.amount > 0 || highlights.amount > 0) filters.push(`hue-rotate(${((shadows.hue || 0) * shadows.amount + (highlights.hue || 0) * highlights.amount) / 250}deg)`);
    if (allHsl.h) filters.push(`hue-rotate(${allHsl.h * 1.8}deg)`);
    if (allHsl.s) filters.push(`saturate(${Math.max(0, 1 + allHsl.s / 100)})`);
    if (allHsl.l) filters.push(`brightness(${Math.max(.1, 1 + allHsl.l / 160)})`);
    if (Math.abs(color.temperature || 0) > 1) filters.push(`sepia(${Math.abs(color.temperature) / 220})`, `hue-rotate(${(color.temperature || 0) * .12}deg)`);
    const blur = E.blur?.enabled ? Math.max(0, E.blur.amount || 0) * .08 : 0;
    if (blur > 0) filters.push(`blur(${blur}px)`);
    const clarity = clamp(Number(detail.clarity) || 0, -100, 100) / 100 * 0.9;
    const colorSharpness = clamp(Number(detail.sharpness) || 0, 0, 100) / 100 * 0.9;
    const sharpen = E.sharpen?.enabled ? E.sharpen : null;
    const sharpenAmount = sharpen ? clamp(Number(sharpen.amount) || 0, 0, 100) / 100 * (1 - clamp(Number(sharpen.threshold) || 0, 0, 100) / 100 * 0.75) : 0;
    const localContrast = clamp(clarity + colorSharpness + sharpenAmount, -0.92, 2.2);
    const sharpenRadius = sharpen ? clamp(Number(sharpen.radius) || 5, 0, 20) : 5;
    n.detailBlur.setAttribute("stdDeviation", String(sharpen ? Math.max(0.6, sharpenRadius * 0.24) : 1.2));
    n.detailComposite.setAttribute("k2", String(1 + localContrast));
    n.detailComposite.setAttribute("k3", String(-localContrast));
    if (Math.abs(localContrast) > 0.005) filters.push(`url(#${n.filterId})`);
    if (E.chromatic?.enabled) filters.push(`drop-shadow(${(E.chromatic.amount || 0) * .08}px 0 0 rgba(255,40,120,.55)) drop-shadow(${-(E.chromatic.amount || 0) * .08}px 0 0 rgba(30,190,255,.5))`);
    if (E.glow?.enabled) filters.push(`brightness(${1 + (E.glow.amount || 0) / 250}) drop-shadow(0 0 ${(E.glow.radius || 0) * .08}px rgba(255,235,190,${(E.glow.amount || 0) / 180}))`);
    if (E.glitch?.enabled) filters.push(`hue-rotate(${Math.sin(lt * (E.glitch.speed || 50)) * (E.glitch.amount || 0) * .25}deg)`);
    if (E.lens?.enabled || E.fisheye?.enabled) filters.push(`saturate(${1 + ((E.lens?.amount || E.fisheye?.amount || 0) / 220)})`);
    if (E.posterize?.enabled) filters.push(`contrast(${1 + (E.posterize.levels || 6) / 18})`);
    style(n.content, "filter", filters.join(" "));
    style(n.content, "imageRendering", E.pixelate?.enabled ? "pixelated" : "");
    const vignetteAmount = E.vignette?.enabled ? Number(E.vignette.amount) || 0 : Number(detail.vignette) || 0;
    const vignette = clamp(Math.abs(vignetteAmount) / 100, 0, 1);
    const vignetteColor = vignetteAmount >= 0 ? "255,255,255" : "0,0,0";
    style(n.ov.vig, "background", `radial-gradient(ellipse at center, transparent ${Math.max(10, 78 - vignette * 45)}%, rgba(${vignetteColor},.96) 100%)`);
    style(n.ov.vig, "opacity", String(vignette));
    const grain = E.grain?.enabled ? (E.grain.amount || 0) / 100 : 0;
    style(n.ov.grain, "backgroundImage", NOISE);
    style(n.ov.grain, "opacity", String(grain * .42));
    const scan = E.scanlines?.enabled ? (E.scanlines.amount || 0) / 100 : 0;
    style(n.ov.scan, "background", `repeating-linear-gradient(to bottom, rgba(0,0,0,${scan}) 0 1px, transparent 1px ${Math.max(2, E.scanlines.spacing || 3)}px)`);
    style(n.ov.scan, "opacity", String(scan));
    const halftone = E.halftone?.enabled ? (E.halftone.contrast || 0) / 100 : 0;
    const dotSize = Math.max(2, E.halftone?.size || 5);
    style(n.ov.gs, "backgroundImage", "radial-gradient(rgba(0,0,0,.78) .65px, transparent .8px)");
    style(n.ov.gs, "backgroundSize", `${dotSize}px ${dotSize}px`);
    style(n.ov.gs, "opacity", String(halftone * .65));
    style(n.ov.temp, "background", (color.temperature || 0) >= 0 ? "rgba(255,150,55,.22)" : "rgba(65,145,255,.22)");
    style(n.ov.temp, "opacity", String(Math.abs(color.temperature || 0) / 450));
    const leak = E.lightLeak?.enabled ? E.lightLeak : E.filmBurn?.enabled ? E.filmBurn : null;
    const leakPosition = leak ? (leak.position ?? leak.edge ?? 35) : 35;
    const leakWarmth = leak ? (leak.warmth ?? 65) : 65;
    style(n.ov.gh, "background", `radial-gradient(ellipse at ${leakPosition}% 22%, hsla(${28 + leakWarmth * .18} 95% 65% / .72), transparent ${42 + (leak?.edge || 0) * .18}%)`);
    style(n.ov.gh, "opacity", String(E.filmBurn?.enabled ? (E.filmBurn.amount || 0) / 100 : E.lightLeak?.enabled ? (E.lightLeak.amount || 0) / 100 : 0));
    style(n.ov.glow, "background", "radial-gradient(circle, rgba(255,255,235,.5), transparent 65%)");
    style(n.ov.glow, "opacity", String(E.glow?.enabled ? (E.glow.amount || 0) / 200 : 0));
    const shakeAmount = E.shake?.enabled ? (E.shake.amount || 0) * .04 : 0;
    const shakeFrequency = E.shake?.frequency || 8;
    const shakeX = Math.sin(lt * shakeFrequency * Math.PI * 2) * shakeAmount;
    const shakeY = Math.cos(lt * shakeFrequency * Math.PI * 2) * shakeAmount;
    const mirrorTransform = E.mirror?.enabled ? (E.mirror.axis === "vertical" ? "scaleY(-1) " : "scaleX(-1) ") : "";
    if (n.mediaEl) style(n.mediaEl, "transform", `${mirrorTransform}translate(${shakeX}px, ${shakeY}px)`);
    style(n.content, "transform", n.mediaEl ? "" : `translate(${shakeX}px, ${shakeY}px)`);
    if (n.cap.hidden === !!P.caption) n.cap.hidden = !P.caption;
    if (n.cap.textContent !== P.caption) n.cap.textContent = P.caption;
    if (n.mediaEl?.tagName === "VIDEO") {
      const target = Math.max(0, lt + Number(clip.sourceOffset || 0));
      const videoOrigin = `${clip.start}:${Number(clip.sourceOffset || 0)}`;
      if (n.lastSeekRevision !== previewSeekRevision || n.videoOrigin !== videoOrigin) {
        n.mediaEl.currentTime = target;
        n.lastSeekRevision = previewSeekRevision;
        n.videoOrigin = videoOrigin;
      }
      if (playing && n.mediaEl.paused && !n.playPending) {
        n.playPending = true;
        try {
          Promise.resolve(n.mediaEl.play()).catch(() => {}).finally(() => {
            n.playPending = false;
            if (!playing) n.mediaEl.pause();
          });
        } catch { n.playPending = false; }
      }
      else if (!playing && !n.mediaEl.paused) n.mediaEl.pause();
    }
  }

  const nextClip = (c) => getClipIndex().nextById.get(c.id) || null;
  function layerState(c) {
    const st = { show: time >= c.start && time < c.start + c.dur, op: 1, clip: "none" };
    const nx = c.trans && nextClip(c);
    if (nx) {
      const d = c.trans.dur, p = (time - (c.start + c.dur - d / 2)) / d;
      if (p >= 0 && p < 1) { st.show = true; if (c.trans.type === "dip") st.op = Math.max(0, 1 - p * 2); }
    }
    const pv = getClipIndex().previousById.get(c.id);
    if (pv) {
      const d = pv.trans.dur, p = (time - (c.start - d / 2)) / d, t = pv.trans.type;
      if (p >= 0 && p < 1) {
        st.show = true;
        if (t === "dissolve") st.op = p;
        else if (t === "dip") st.op = Math.max(0, p * 2 - 1);
        else if (t === "wipe") st.clip = `inset(0 ${(1 - p) * 100}% 0 0)`;
        else if (t === "iris") st.clip = `circle(${p * 75}% at 50% 50%)`;
      }
    }
    return st;
  }

  function renderPreview() {
    const index = getClipIndex(), candidates = [];
    if (previewCandidateMode === "linear") {
      for (const entry of index.previewEntries) if (entry.start <= time && entry.end > time) candidates.push(entry.clip);
    } else if (index.previewEntries.length) {
      const limit = lowerBoundBy(index.previewEntries, time + Number.EPSILON, (entry) => entry.start);
      collectPreviewCandidates(index, 1, 0, index.treeSize, limit, time, candidates);
    }
    const active = candidates.map((c) => ({ c, f: layerState(c) })).filter((item) => item.f.show)
      .sort((a, b) => (trackOrder.get(b.c.track) ?? 0) - (trackOrder.get(a.c.track) ?? 0) || a.c.start - b.c.start);
    const ids = new Set(active.map((x) => x.c.id));
    for (const [id, n] of layerNodes) if (!ids.has(id)) { n.mediaEl?.pause(); n.layer.remove(); layerNodes.delete(id); }
    active.forEach(({ c, f }, i) => {
      let n = layerNodes.get(c.id);
      if (!n) { n = makeLayer(c); layerNodes.set(c.id, n); frame.insertBefore(n.layer, gridEl); }
      const zIndex = String(i + 1);
      if (n.layer.style.zIndex !== zIndex) n.layer.style.zIndex = zIndex;
      const animatedProps = propsAt(c, time);
      applyLayer(n, c, Math.max(0, time - c.start), animatedProps);
      const opacity = clamp(Number(animatedProps.transform?.opacity ?? 100) / 100, 0, 1);
      const warpOpacity = String(f.op * opacity);
      if (n.warp.style.opacity !== warpOpacity) n.warp.style.opacity = warpOpacity;
      if (n.warp.style.clipPath !== f.clip) n.warp.style.clipPath = f.clip;
    });
    syncAudioPreview();
    const s = sel();
    const show = s && isVisual(s) && ids.has(s.id) && tool !== "text";
    selBox.hidden = !show;
    if (show) {
      const transform = propsAt(s, time).transform;
      const selectionTransform = `translate(${transform.position.x * ((frame.clientWidth || 1) / PW)}px, ${transform.position.y * ((frame.clientHeight || 1) / PH)}px) rotate(${transform.rotation}deg) scale(${transform.scale.w / 100}, ${transform.scale.h / 100})`;
      if (selBox.style.transform !== selectionTransform) selBox.style.transform = selectionTransform;
    }
  }

  function createAudioPreview(clip) {
    const sourceUrl = clip.previewUrl || (clip.path ? window.plutoNative?.convertFileSrc(clip.path) : "");
    if (!sourceUrl) return null;
    const element = new Audio(sourceUrl);
    element.preload = "auto";
    element.loop = false;
    const state = { element, context: null, gain: null, pan: null, low: null, mid: null, high: null, compressor: null, reverb: null, reverbGain: null, delay: null, delayFeedback: null, delayGain: null, targetTime: 0 };
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextCtor) {
        previewAudioContext ||= new AudioContextCtor();
        const ctx = previewAudioContext, input = ctx.createMediaElementSource(element);
        const low = ctx.createBiquadFilter(), mid = ctx.createBiquadFilter(), high = ctx.createBiquadFilter();
        low.type = "lowshelf"; low.frequency.value = 120;
        mid.type = "peaking"; mid.frequency.value = 1000; mid.Q.value = 1;
        high.type = "highshelf"; high.frequency.value = 6000;
        const compressor = ctx.createDynamicsCompressor();
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
        const gain = ctx.createGain();
        input.connect(low); low.connect(mid); mid.connect(high); high.connect(compressor); compressor.connect(pan); pan.connect(gain); gain.connect(ctx.destination);
        const convolver = ctx.createConvolver(), reverbGain = ctx.createGain();
        const impulse = ctx.createBuffer(2, ctx.sampleRate * 1.5, ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const samples = impulse.getChannelData(channel);
          for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 2.4);
        }
        convolver.buffer = impulse; high.connect(convolver); convolver.connect(reverbGain); reverbGain.connect(ctx.destination);
        const delay = ctx.createDelay(2), delayFeedback = ctx.createGain(), delayGain = ctx.createGain();
        high.connect(delay); delay.connect(delayFeedback); delayFeedback.connect(delay); delay.connect(delayGain); delayGain.connect(ctx.destination);
        Object.assign(state, { context: ctx, gain, pan, low, mid, high, compressor, reverb: convolver, reverbGain, delay, delayFeedback, delayGain });
        element.addEventListener("loadedmetadata", () => { if (Number.isFinite(state.targetTime)) element.currentTime = state.targetTime; }, { once: true });
      }
    } catch {
      state.context = null;
    }
    return state;
  }

  function syncAudioPreview() {
    const index = getClipIndex(), audioClips = index.audioClips, liveIds = index.audioIds;
    for (const [id, state] of audioPreviewNodes) if (!liveIds.has(id)) {
      state.element.pause(); state.element.removeAttribute("src"); state.element.load(); audioPreviewNodes.delete(id);
    }
    const now = previewAudioContext?.currentTime || 0;
    for (const clip of audioClips) {
      let state = audioPreviewNodes.get(clip.id);
      if (!state && playing) { state = createAudioPreview(clip); if (state) audioPreviewNodes.set(clip.id, state); }
      if (!state) continue;
      const start = clip.start, end = clip.start + clip.dur;
      const active = playing && time >= start && time < end;
      const localTime = clamp(time - start, 0, Math.max(0, clip.dur));
      const sourceTime = localTime + Number(clip.sourceOffset || 0);
      state.targetTime = sourceTime;
      const animatedProps = propsAt(clip, time);
      if (state.context) {
        const audio = animatedProps.audio || {};
        const fx = animatedProps.effects || {};
        const eq = fx.eq?.enabled ? fx.eq : {};
        const set = (param, value) => param?.setTargetAtTime?.(value, now, 0.025);
        set(state.gain.gain, (Number(audio.volume ?? 100) / 100) * (active && audio.fadeIn ? clamp(localTime / Math.max(.01, audio.fadeInDuration || 1), 0, 1) : 1) * (active && audio.fadeOut ? clamp((clip.dur - localTime) / Math.max(.01, audio.fadeOutDuration || 1), 0, 1) : 1));
        if (state.pan.pan) set(state.pan.pan, Number(audio.pan || 0) / 100);
        set(state.low.gain, Number(audio.bass || 0) + Number(eq.low || 0));
        set(state.mid.gain, Number(eq.mid || 0));
        const reverb = fx.reverb?.enabled ? fx.reverb : null;
        set(state.reverbGain.gain, reverb ? (Number(reverb.wet || 0) / 100) * (0.5 + Number(reverb.room || 0) / 100) * (1 - Number(reverb.damp || 0) / 200) : 0);
        const delay = fx.delay?.enabled ? fx.delay : null;
        set(state.delay.delayTime, delay ? Number(delay.time || 320) / 1000 : .001);
        set(state.delayFeedback.gain, delay ? clamp(Number(delay.feedback || 0) / 100, 0, .9) : 0);
        set(state.delayGain.gain, delay ? Number(delay.mix || 0) / 100 : 0);
        const comp = fx.compressor?.enabled ? fx.compressor : null;
        const denoise = fx.denoise?.enabled ? Number(fx.denoise.reduction || 0) : 0;
        set(state.high.gain, Number(audio.treble || 0) + Number(eq.high || 0) - denoise * 0.08);
        set(state.compressor.threshold, comp ? Number(comp.threshold ?? -18) : 0);
        set(state.compressor.ratio, comp ? Number(comp.ratio ?? 4) : 1);
        state.compressor.attack.value = comp ? Number(comp.attack || 12) / 1000 : .003;
        state.compressor.release.value = comp ? Number(comp.release || 140) / 1000 : .25;
      } else state.element.volume = clamp(Number(animatedProps.audio?.volume ?? 100) / 100, 0, 1);
      if (active) {
        if (state.context?.state === "suspended") state.context.resume().catch(() => {});
        if (state.element.readyState >= 1 && Math.abs(state.element.currentTime - sourceTime) > .25) state.element.currentTime = sourceTime;
        if (state.element.paused) state.element.play().catch(() => {});
      } else if (!state.element.paused) state.element.pause();
    }
  }
  new ResizeObserver(renderPreview).observe(frame);

  const keep = (key, panel) => panel.on("change", () => {
    const c = sel();
    if (c) { beginPropertyChange(c); writeClipGroup(c, key, panel.get()); clipEls.get(c.id)?.classList.toggle("has-fx", hasFx({ ...c, props: propsAt(c, time) })); renderPreview(); schedulePropertyCommit(); }
  });
  keep("transform", panels.transform); keep("colors", panels.colors); keep("effects", panels.effects); keep("text", panels.text);
  const selectedAudioClip = () => {
    const c = sel();
    if (!c) return null;
    if (trackKind(c.track) === "audio") return c;
    const linkedId = c.linkedAudioId || clips.find((x) => x.linkedAudioId === c.id)?.id;
    if (linkedId) return clips.find((x) => x.id === linkedId) || null;
    const source = c.path ? mediaByPath.get(c.path) : null;
    return isVisual(c) && !c.audioDetached && (c.hasAudio || source?.hasAudio) ? c : null;
  };
  audioAdjPanel.on("change", () => {
    const c = selectedAudioClip();
    if (!c) return;
    beginPropertyChange(c);
    writeClipGroup(c, "audio", audioAdjPanel.get());
    renderPreview();
    schedulePropertyCommit();
  });
  
  function loadProps(c) {
    const properties = propsAt(c, time);
    panels.transform.set(properties.transform, { silent: true });
    panels.colors.set(properties.colors, { silent: true });
    panels.effects.set(properties.effects, { silent: true });
    panels.text.set(properties.text);
    const audioClip = selectedAudioClip();
    const audioProperties = audioClip ? propsAt(audioClip, time) : properties;
    audioAdjPanel.set(audioProperties.audio || { volume: 100, pan: 0, bass: 0, treble: 0, fadeIn: false, fadeOut: false, fadeInDuration: 1, fadeOutDuration: 1 });
  }

  const clipEls = new Map();
  const rowEl = (id) => rows[TRACKS.findIndex((t) => t.id === id)];
  function syncVisibleTracks() {
    for (const track of TRACKS) {
      const used = track.id === "v1" || track.id === "a1" || clips.some((clip) => clip.track === track.id);
      rowEl(track.id).classList.toggle("is-track-visible", used);
      labelsInner.children[TRACKS.indexOf(track)].classList.toggle("is-track-visible", used);
    }
  }

  function renderRuler() {
    ruler.replaceChildren();
    const D = Math.max(60, dur() + 5);
    const major = [1, 2, 5, 10, 15, 30, 60, 120].find((s) => s * pps >= 90) || 120;
    const minor = major <= 2 ? major / 2 : major / 5;
    for (let t = 0; t <= D + 1e-6; t += minor) {
      const isMajor = Math.abs(t / major - Math.round(t / major)) < 1e-6;
      const tick = h("i", { class: "ed-tick" + (isMajor ? " ed-tick--major" : "") }, isMajor && h("span", { class: "ed-tick__label" }, fmtMS(t)));
      tick.style.left = t * pps + "px";
      ruler.append(tick);
    }
    tlContent.style.width = D * pps + 40 + "px";
  }

  function place(c) {
    const el = clipEls.get(c.id); if (!el) return;
    el.style.left = c.start * pps + "px"; el.style.width = Math.max(4, c.dur * pps) + "px";
    const r = rowEl(c.track);
    if (el.parentElement !== r) r.append(el);
  }

  function makeKeyframeMarkers(c) {
    const keyframes = clipKeyframes(c).map((keyframe, order) => ({ keyframe, order }))
      .sort((left, right) => left.keyframe.time - right.keyframe.time || left.order - right.order);
    const vertical = [27, 50, 73];
    let cluster = 0;
    return h("span", { class: "ed-clip__keyframes", "aria-label": "Clip keyframes" },
      ...keyframes.map(({ keyframe }, index) => {
        if (index === 0 || (keyframe.time - keyframes[index - 1].keyframe.time) * pps >= 13) cluster = 0;
        const lane = vertical[cluster % vertical.length];
        cluster++;
        const marker = h("button", { class: "ed-keyframe" + (c.id === selectedId && currentKeyframe(c) === keyframe ? " is-current" : "") + (selectedKeyframes.get(c)?.has(keyframe) ? " is-multi-selected" : ""), type: "button",
          title: `${fmtTC(keyframe.time)} · ${keyframe.easing || "linear"}`, "aria-label": `Keyframe at ${fmtTC(keyframe.time)}`, "data-key-time": String(keyframe.time) });
        marker.style.left = `${keyframe.time * pps}px`;
        marker.style.setProperty("--keyframe-y", `${lane}%`);
        marker.addEventListener("pointerdown", (event) => beginKeyframeDrag(event, c, keyframe));
        marker.addEventListener("click", (event) => {
          if (event.detail !== 0) return;
          select(c.id, false); pause(); setTime(c.start + keyframe.time);
        });
        marker.addEventListener("contextmenu", (event) => onKeyframeContextMenu(event, c, keyframe));
        return marker;
      }));
  }

  function refreshKeyframeMarkers(c) {
    const layer = clipEls.get(c.id)?.querySelector(".ed-clip__keyframes");
    if (layer) layer.replaceWith(makeKeyframeMarkers(c));
  }

  function renderClips() {
    clipEls.clear(); rows.forEach((r) => r.replaceChildren());
    syncVisibleTracks();
    for (const c of clips) {
      const th = THEMES[c.theme];
      const kind = trackKind(c.track);
      const sourceMedia = c.path ? (mediaByPath.get(c.path) || c) : c;
      const filmstrip = sourceMedia?.filmstrip || c.filmstrip;
      const thumbnail = sourceMedia?.thumbnail || c.thumbnail;
      let thumbnailStrip = null;
      if (kind === "video" && (filmstrip || thumbnail)) {
        const image = h("img", { src: filmstrip || thumbnail, alt: "", draggable: "false" });
        image.addEventListener("error", () => {
          if (thumbnail && image.src !== thumbnail && !image.dataset.fallbackTried) {
            image.dataset.fallbackTried = "true"; image.src = thumbnail;
          } else image.closest(".ed-clip__thumbs")?.remove();
        });
        thumbnailStrip = h("span", { class: "ed-clip__thumbs", "aria-hidden": "true" }, image);
      }
      const actualWaveform = sourceMedia?.waveform || c.waveform;
      const hasAudio = c.hasAudio || sourceMedia?.hasAudio;
      const clipWaveform = kind === "audio"
        ? h("span", { class: "ed-clip__wave" }, actualWaveform ? h("img", { src: actualWaveform, alt: "", draggable: "false" }) : h("span", { html: waveform(parseInt(c.id.slice(1) || "1", 10)) }))
        : kind === "video" && hasAudio && !c.audioDetached && !c.linkedAudioId
          ? h("span", { class: "ed-clip__wave ed-clip__wave--embedded" }, actualWaveform
            ? h("img", { src: actualWaveform, alt: "", draggable: "false" })
            : h("span", { html: waveform(parseInt(c.id.slice(1) || "1", 10)) }))
          : null;
      const el = h("div", { class: `ed-clip ed-clip--${kind}` + (selectedIds.has(c.id) ? " is-selected" : "") + (c.locked ? " is-locked" : "") + (c.groupId ? " is-grouped" : "") + (hasFx({ ...c, props: propsAt(c, time) }) ? " has-fx" : ""), "data-id": c.id },
        thumbnailStrip,
        h("span", { class: "ed-clip__h ed-clip__h--l" }), h("span", { class: "ed-clip__h ed-clip__h--r" }),
        clipWaveform,
        makeKeyframeMarkers(c),
        h("span", { class: "ed-clip__label" }, c.locked ? icon("lock", 12) : null, c.groupId ? icon("group", 12) : null, icon(kind === "audio" ? "music" : c.theme === "title" ? "type" : "film", 13), c.label),
        h("span", { class: "ed-clip__fx", title: "Effects applied" }, icon("sparkles", 12)));
      if (th) { const [c1, c2] = th.clip || [th.sky[1], th.sky[2]]; el.style.setProperty("--c1", c1); el.style.setProperty("--c2", c2); }
      el.addEventListener("pointerdown", (e) => onClipDown(e, c));
      el.addEventListener("contextmenu", (e) => onClipContextMenu(e, c));
      clipEls.set(c.id, el); place(c);
    }
    renderJunctions();
  }

  function updateKeyframeControls() {
    const c = sel(), keys = clipKeyframes(c), rawLocal = c ? time - c.start : 0, local = c ? clamp(rawLocal, 0, c.dur) : 0;
    const withinClip = !!c && time >= c.start - keyframeTolerance && time <= c.start + c.dur + keyframeTolerance;
    const activeKeyframe = withinClip ? currentKeyframe(c) : null;
    const pivot = activeKeyframe ? Number(activeKeyframe.time) : rawLocal < 0 ? -1e-5 : rawLocal > (c?.dur || 0) ? (c?.dur || 0) + 1e-5 : local;
    const navigationTolerance = 1e-5;
    const atKeyframe = !!activeKeyframe;
    clipEls.get(c?.id)?.querySelectorAll(".ed-keyframe").forEach((marker) => {
      marker.classList.toggle("is-current", !!activeKeyframe && Math.abs(Number(marker.dataset.keyTime) - activeKeyframe.time) <= keyframeTolerance);
    });
    bKeyPrev.disabled = !c || !keys.some((item) => item.time < pivot - navigationTolerance);
    bKeyNext.disabled = !c || !keys.some((item) => item.time > pivot + navigationTolerance);
    bKeyToggle.disabled = !withinClip;
    bKeyToggle.setAttribute("aria-pressed", String(atKeyframe));
    bKeyToggle.setAttribute("aria-label", atKeyframe ? "Remove keyframe at playhead (K)" : "Add keyframe at playhead (K)");
    bKeyToggle.title = atKeyframe ? "Remove keyframe at playhead (K)" : "Add keyframe at playhead (K)";
    bKeyToggle.replaceChildren(icon(atKeyframe ? "keyActive" : "keyAdd", 18));
  }

  function jumpKeyframe(direction) {
    const c = sel(); if (!c) return;
    const rawLocal = time - c.start, local = clamp(rawLocal, 0, c.dur);
    const keys = [...clipKeyframes(c)].sort((a, b) => a.time - b.time);
    const active = currentKeyframe(c), pivot = active ? Number(active.time) : rawLocal < 0 ? -1e-5 : rawLocal > c.dur ? c.dur + 1e-5 : local;
    const target = direction < 0
      ? keys.filter((item) => item.time < pivot - 1e-5).at(-1)
      : keys.find((item) => item.time > pivot + 1e-5);
    if (!target) return;
    pause(); setTime(c.start + target.time); loadProps(c); updateInspector();
  }

  function toggleKeyframe() {
    const c = sel();
    if (!c || time < c.start - keyframeTolerance || time > c.start + c.dur + keyframeTolerance) return;
    const before = snapshot(), local = clamp(time - c.start, 0, c.dur), at = currentKeyframe(c);
    if (at) { c.keyframes = clipKeyframes(c).filter((item) => item !== at); invalidateKeyframeCache(c); }
    else captureKeyframe(c, local, propsAt(c, time));
    loadProps(c); commit(before);
  }

  function showContextMenu(menu, clientX, clientY) {
    document.querySelectorAll(".ed-ctx").forEach((item) => item.remove());
    menu.addEventListener("contextmenu", (event) => event.preventDefault());
    document.body.append(menu);
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${clamp(clientX, 8, Math.max(8, window.innerWidth - rect.width - 8))}px`;
    menu.style.top = `${clamp(clientY, 8, Math.max(8, window.innerHeight - rect.height - 8))}px`;
    const close = (event) => {
      if (event?.target && menu.contains(event.target)) return;
      menu.remove(); window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", escape);
    };
    const escape = (event) => { if (event.key === "Escape") close(); };
    setTimeout(() => window.addEventListener("pointerdown", close), 0);
    window.addEventListener("keydown", escape);
  }

  function onKeyframeContextMenu(event, c, keyframe) {
    event.preventDefault(); event.stopPropagation();
    let selected = keyframeSelection();
    if (!selected.some((item) => item.clip === c && item.keyframe === keyframe)) {
      clearKeyframeSelection();
      selectedKeyframes.set(c, new Set([keyframe]));
      selected = [{ clip: c, keyframe }];
      renderClips();
    }
    const choices = [
      ["linear", "Linear"], ["ease-in", "Ease In"], ["ease-out", "Ease Out"],
      ["ease-in-out", "Ease In / Out"], ["hold", "Hold"],
    ];
    const menu = h("div", { class: "ed-ctx ed-ctx--easing", role: "menu", "aria-label": "Keyframe easing" },
      h("span", { class: "ed-ctx__title" }, "Easing"),
      ...choices.map(([value, label]) => {
        const allMatch = selected.every((item) => (item.keyframe.easing || "linear") === value);
        const choice = h("button", { type: "button", role: "menuitemradio", "aria-checked": String(allMatch) },
          label, allMatch ? icon("check", 14) : null);
        choice.addEventListener("click", () => {
          menu.remove();
          if (selected.every((item) => (item.keyframe.easing || "linear") === value)) return;
          const before = snapshot();
          const touched = new Set();
          for (const item of selected) { item.keyframe.easing = value; touched.add(item.clip); }
          for (const clip of touched) invalidateKeyframeCache(clip);
          commit(before);
          if (sel()?.id === c.id) loadProps(c);
        });
        return choice;
      }));
    showContextMenu(menu, event.clientX, event.clientY);
  }

  function beginKeyframeDrag(event, c, keyframe) {
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    const additive = event.shiftKey;
    let selected = keyframeSelection();
    const alreadySelected = selected.some((item) => item.clip === c && item.keyframe === keyframe);
    if (event.shiftKey) {
      if (alreadySelected) {
        const keys = selectedKeyframes.get(c); keys?.delete(keyframe);
        if (!keys?.size) selectedKeyframes.delete(c);
      } else {
        if (!selectedKeyframes.has(c)) selectedKeyframes.set(c, new Set());
        selectedKeyframes.get(c).add(keyframe);
      }
      selected = keyframeSelection();
    } else if (!alreadySelected) {
      clearKeyframeSelection(); selectedKeyframes.set(c, new Set([keyframe]));
      selected = [{ clip: c, keyframe }];
    }
    renderClips();
    if (event.shiftKey && alreadySelected) return;
    const before = snapshot(), startX = event.clientX;
    const moving = selected.map((item) => ({ ...item, original: Number(item.keyframe.time) }));
    if (!moving.some((item) => item.clip === c && item.keyframe === keyframe)) moving.push({ clip: c, keyframe, original: Number(keyframe.time) });
    const clipRects = new Map(moving.map((item) => [item.clip, clipEls.get(item.clip.id)?.getBoundingClientRect()]).filter(([, rect]) => rect));
    for (const item of moving) item.marker = [...(clipEls.get(item.clip.id)?.querySelectorAll(".ed-keyframe") || [])]
      .find((node) => Math.abs(Number(node.dataset.keyTime) - item.original) < 1e-6);
    if (!clipRects.has(c)) return;
    const anchorOriginal = Number(keyframe.time);
    let moved = false, latestDelta = 0;
    const paint = (ev) => {
      const distance = ev.clientX - startX;
      if (!moved && Math.abs(distance) < 3) return;
      moved = true;
      let delta = Math.round((distance / pps) * FPS) / FPS;
      let snapped = false;
      if (snapOn) {
        const anchorNext = anchorOriginal + delta, playhead = clamp(Math.round((time - c.start) * FPS) / FPS, 0, c.dur);
        if (Math.abs(anchorNext - playhead) <= 8 / pps) { delta = playhead - anchorOriginal; snapped = true; }
      }
      const minDelta = Math.max(...moving.map((item) => -item.original));
      const maxDelta = Math.min(...moving.map((item) => item.clip.dur - item.original));
      delta = clamp(delta, minDelta, maxDelta);
      const movedSet = new Set(moving.map((item) => item.keyframe));
      const collides = moving.some((item) => {
        const next = item.original + delta;
        return clipKeyframes(item.clip).some((other) => !movedSet.has(other) && Math.abs(other.time - next) < 1 / FPS - 1e-5);
      });
      if (collides) { delta = latestDelta; snapped = false; }
      latestDelta = delta;
      const touched = new Set();
      for (const item of moving) {
        item.keyframe.time = item.original + delta;
        if (item.marker) { item.marker.style.left = `${item.keyframe.time * pps}px`; item.marker.dataset.keyTime = String(item.keyframe.time); }
        touched.add(item.clip);
      }
      for (const clip of touched) { clip.keyframes.sort((a, b) => a.time - b.time); invalidateKeyframeCache(clip); }
      showSnap(snapped ? time : null);
      renderPreview(); updateKeyframeControls();
      if (sel()?.id === c.id) loadProps(c);
    };
    const end = (upEvent) => {
      if (upEvent?.type === "pointerup") paint(upEvent);
      window.removeEventListener("pointermove", paint); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end);
      showSnap(null);
      if (!moved) { if (upEvent?.type === "pointerup") { select(c.id, false); if (!additive) { pause(); setTime(c.start + anchorOriginal); } } return; }
      if (Math.abs(latestDelta) > 1e-5) commit(before);
    };
    window.addEventListener("pointermove", paint, { passive: false });
    window.addEventListener("pointerup", end, { once: true });
    window.addEventListener("pointercancel", end, { once: true });
  }

  function onClipContextMenu(e, c) {
    e.preventDefault();
    document.querySelector(".ed-ctx")?.remove();
    if (!selectedIds.has(c.id)) select(c.id, false);
    const linkedAudio = c.linkedAudioId ? clips.find((x) => x.id === c.linkedAudioId) : clips.find((x) => x.linkedAudioId === c.id);
    const isLinked = !!linkedAudio;
    const sourceMedia = c.path ? (mediaByPath.get(c.path) || c) : c;
    const detachedVideo = isVisual(c) ? (c.audioDetached ? c : null) : linkedAudio?.audioDetached ? linkedAudio : null;
    const relinkCandidate = !isLinked && c.path
      ? clips.find((x) => x.id !== c.id && !x.linkedAudioId && x.path === c.path
        && trackKind(x.track) !== trackKind(c.track) && Math.abs(x.start - c.start) < 0.1)
      : null;
    const canSeparate = isVisual(c) && (c.hasAudio || sourceMedia?.hasAudio) && !c.audioDetached && !isLinked && !relinkCandidate;
    const canAttach = !!detachedVideo && isLinked;
    const actionLabel = canAttach ? "Attach Audio to Video" : canSeparate ? "Separate Audio" : isLinked ? "Unlink Audio & Video" : "Relink Audio & Video";
    const linkAction = h("button", { type: "button", disabled: !canAttach && !canSeparate && !isLinked && !relinkCandidate }, actionLabel);
    const selected = clips.filter((clip) => selectedIds.has(clip.id));
    const selectedGroupIds = new Set(selected.map((clip) => clip.groupId).filter(Boolean));
    const toggleLock = h("button", { type: "button", disabled: !selected.length }, selected.length && selected.every((clip) => clip.locked) ? "Unlock Selected" : "Lock Selected");
    const groupSelected = h("button", { type: "button", disabled: selected.length < 2 }, "Group Selected");
    const ungroupSelected = h("button", { type: "button", disabled: !selectedGroupIds.size }, "Ungroup Selected");
    const selectGroup = h("button", { type: "button", disabled: !c.groupId }, "Select Group");
    const deleteSelected = h("button", { type: "button" }, selected.length > 1 ? `Delete ${selected.length} Selected Clips` : "Delete Clip");
    const menu = h("div", { class: "ed-ctx" },
      h("span", { class: "ed-ctx__title" }, selected.length > 1 ? `${selected.length} clips selected` : "Clip"),
      toggleLock, groupSelected, ungroupSelected, selectGroup,
      h("span", { class: "ed-ctx__separator", "aria-hidden": "true" }),
      linkAction,
      deleteSelected
    );
    toggleLock.addEventListener("click", () => {
      menu.remove();
      const before = snapshot(), locked = !(selected.length && selected.every((clip) => clip.locked));
      for (const clip of selected) clip.locked = locked;
      commit(before);
    });
    groupSelected.addEventListener("click", () => {
      menu.remove();
      const before = snapshot(), groupId = `group-${uid()}`;
      for (const clip of selected) clip.groupId = groupId;
      commit(before);
    });
    ungroupSelected.addEventListener("click", () => {
      menu.remove();
      const before = snapshot();
      for (const clip of clips) if (selectedGroupIds.has(clip.groupId)) delete clip.groupId;
      commit(before);
    });
    selectGroup.addEventListener("click", () => {
      menu.remove();
      selectedIds.clear();
      for (const clip of clips) if (clip.groupId === c.groupId) selectedIds.add(clip.id);
      focusSelection(c.id, false);
    });
    linkAction.addEventListener("click", () => {
      menu.remove();
      const before = snapshot();
      if (canSeparate) {
        const audioTracks = ["a1", "a2"];
        const lane = audioTracks.find((track) => !clips.some((x) => x.track === track && timeOverlap(c.start, c.start + c.dur, x.start, x.start + x.dur)))
          || audioTracks.sort((a, b) => clips.filter((x) => x.track === a && timeOverlap(c.start, c.start + c.dur, x.start, x.start + x.dur)).length
            - clips.filter((x) => x.track === b && timeOverlap(c.start, c.start + c.dur, x.start, x.start + x.dur)).length)[0];
        const audioProps = defaultProps();
        audioProps.audio = clone(c.props.audio || audioProps.audio);
        const audio = {
          id: uid(), track: lane, start: c.start, dur: c.dur,
          sourceDuration: c.sourceDuration || c.dur, sourceOffset: c.sourceOffset || 0,
          label: `${c.label} (Audio)`, theme: "audio", mediaKind: "audio", hasAudio: true,
          path: c.path, previewUrl: c.previewUrl, waveform: c.waveform || sourceMedia?.waveform, linkedAudioId: c.id, props: audioProps,
          keyframes: clone(clipKeyframes(c)),
        };
        c.hasAudio = true;
        c.audioDetached = true;
        c.linkedAudioId = audio.id;
        clips.push(audio);
        setSingleSelection(audio.id);
        loadProps(audio);
      } else if (canAttach) {
        const video = detachedVideo;
        const audio = isVisual(c) ? linkedAudio : c;
        video.props.audio = clone(audio.props?.audio || video.props.audio);
        for (const audioKey of clipKeyframes(audio)) {
          const localTime = clamp(audioKey.time, 0, video.dur);
          let videoKey = clipKeyframes(video).find((item) => Math.abs(item.time - localTime) <= keyframeTolerance);
          if (!videoKey) {
            videoKey = { time: localTime, easing: audioKey.easing || "linear", props: clone(propsAt(video, video.start + localTime)) };
            video.keyframes ||= []; video.keyframes.push(videoKey);
          }
          if (audioKey.props?.audio) videoKey.props.audio = clone(audioKey.props.audio);
        }
        video.keyframes?.sort((a, b) => a.time - b.time);
        invalidateKeyframeCache(video);
        clips = clips.filter((clip) => clip.id !== audio.id);
        video.audioDetached = false;
        delete video.linkedAudioId;
        setSingleSelection(video.id);
        loadProps(video);
      } else if (isLinked) {
        c.linkedAudioId = null;
        clips.forEach((x) => { if (x.linkedAudioId === c.id || x.id === linkedAudio?.id) x.linkedAudioId = null; });
      } else if (relinkCandidate) {
        c.linkedAudioId = relinkCandidate.id;
        relinkCandidate.linkedAudioId = c.id;
      }
      commit(before);
    });
    deleteSelected.addEventListener("click", () => { menu.remove(); removeSelected(); });
    showContextMenu(menu, e.clientX, e.clientY);
  }

  function renderJunctions() {
    rows.forEach((r) => r.querySelectorAll(".ed-junc, .ed-junc__band").forEach((x) => x.remove()));
    for (const c of clips) {
      if (!isVisual(c) || !nextClip(c)) continue;
      const x = (c.start + c.dur) * pps, r = rowEl(c.track);
      if (c.trans) {
        const w = Math.max(8, c.trans.dur * pps), band = h("i", { class: "ed-junc__band" });
        band.style.left = x - w / 2 + "px"; band.style.width = w + "px";
        r.append(band);
      }
      const b = h("button", { class: "ed-junc" + (c.trans ? " is-on" : ""), type: "button", title: c.trans ? "Edit transition" : "Add transition", "aria-label": c.trans ? "Edit transition" : "Add transition" }, icon(c.trans ? "transition" : "plus", 12));
      b.style.left = x + "px";
      b.addEventListener("pointerdown", (e) => e.stopPropagation());
      b.addEventListener("click", () => {
        select(c.id, false);
        if (!c.trans) { const before = snapshot(); c.trans = { type: "dissolve", dur: 1 }; commit(before); }
        showTab("effects");
      });
      r.append(b);
    }
  }
  const renderAll = () => { renderRuler(); renderClips(); positionPlayhead(); updateHistBtns(); };

  function positionPlayhead() { playhead.style.left = time * pps + "px"; }
  function updateTime() {
    tcNow.textContent = fmtTC(time); tcTotal.textContent = fmtTC(dur());
    positionPlayhead(); updateKeyframeControls();
    if (playing) syncAnimatedInspector();
    renderPreview();
  }
  function syncAnimatedInspector() {
    const c = sel();
    if (!propertyChangeBefore && c && clipKeyframes(c).length) {
      const properties = propsAt(c, time);
      if (tab === "transform") panels.transform.set(properties.transform, { silent: true });
      else if (tab === "colors") panels.colors.set(properties.colors, { silent: true });
      else if (tab === "effects") panels.effects.set(properties.effects, { silent: true });
      else if (tab === "text") panels.text.set(properties.text);
    }
    const audioClip = selectedAudioClip();
    if (!propertyChangeBefore && audioClip && clipKeyframes(audioClip).length) audioAdjPanel.set(propsAt(audioClip, time).audio || {});
  }
  function setTime(t) {
    time = clamp(t, 0, dur());
    previewSeekRevision++;
    const selected = sel();
    if (!playing && selected && clipKeyframes(selected).length) loadProps(selected);
    updateTime();
  }

  const snapshot = () => JSON.stringify(clips);
  function beginPropertyChange(clip) {
    if (!propertyChangeBefore) propertyChangeBefore = snapshot();
    if (playing && !propertyEditAnchor && clipKeyframes(clip).length) propertyEditAnchor = { clipId: clip.id, time };
  }
  const startPropertyGesture = (event) => {
    if (event.button !== 0 || !event.target.closest?.(".tp")) return;
    const audioPanel = event.target.closest(".ed-audio-panel");
    const clip = audioPanel ? selectedAudioClip() : sel();
    if (!clip) return;
    propertyPointerActive = true;
    clearTimeout(propertyChangeTimer); propertyChangeTimer = 0;
    beginPropertyChange(clip);
  };
  const finishPropertyGesture = () => {
    if (!propertyPointerActive) return;
    propertyPointerActive = false;
    clearTimeout(propertyChangeTimer);
    propertyChangeTimer = setTimeout(() => flushPropertyChange(true), 0);
  };
  root.addEventListener("pointerdown", startPropertyGesture, true);
  window.addEventListener("pointerup", finishPropertyGesture);
  window.addEventListener("pointercancel", finishPropertyGesture);
  const flushPropertyChange = (notify = true) => {
    clearTimeout(propertyChangeTimer); propertyChangeTimer = 0;
    const before = propertyChangeBefore; propertyChangeBefore = null; propertyEditAnchor = null;
    if (!before || before === snapshot()) return false;
    hist.undo.push(before); hist.redo.length = 0;
    if (notify) changed();
    return true;
  };
  function schedulePropertyCommit() {
    if (!propertyChangeBefore) propertyChangeBefore = snapshot();
    clearTimeout(propertyChangeTimer);
    if (propertyPointerActive) { propertyChangeTimer = 0; return; }
    propertyChangeTimer = setTimeout(() => flushPropertyChange(true), 260);
  }
  const commit = (before) => {
    const flushed = flushPropertyChange(false);
    if (before === snapshot()) { if (flushed) changed(); return; }
    hist.undo.push(before); hist.redo.length = 0; changed();
  };
  const NATIVE_SKIP_KEYS = ["thumbnail", "filmstrip", "waveform"];
  const slimForNative = (clip) => {
    const copy = { ...clip };
    for (const key of NATIVE_SKIP_KEYS) delete copy[key];
    return copy;
  };
  const syncNativeTimeline = () => {
    if (!window.plutoTimeline) return Promise.resolve(null);
    const revision = nativeTimelineRevision;
    if (nativeSyncedRevision === revision || nativeQueuedRevision === revision) return nativeSyncPromise;
    const payload = clone(clips.map(slimForNative));
    const send = window.plutoTimeline.sync || window.plutoTimeline.initialize;
    nativeQueuedRevision = revision;
    const pending = nativeSyncQueue.then(() => {
      if (revision !== nativeTimelineRevision) return null;
      return Promise.resolve(send(payload)).then((result) => { nativeSyncedRevision = revision; return result; });
    });
    nativeSyncPromise = pending.catch((error) => {
      if (nativeQueuedRevision === revision && nativeSyncedRevision !== revision) nativeQueuedRevision = -1;
      root.dispatchEvent(new CustomEvent("pluto:backend-error", { detail: String(error) }));
      throw error;
    });
    nativeSyncQueue = nativeSyncPromise.catch(() => {});
    return nativeSyncPromise;
  };
  const changed = () => { nativeTimelineRevision++; invalidateClipIndex(); syncNativeTimeline().catch(() => {}); panels.export.setSource({ duration: dur() }); renderAll(); updateInspector(); updateTime(); };
  function updateHistBtns() { undoBtn.disabled = !hist.undo.length; redoBtn.disabled = !hist.redo.length; }
  function restore(str) {
    clips = JSON.parse(str);
    clearKeyframeSelection();
    for (const id of [...selectedIds]) if (!clips.some((clip) => clip.id === id)) selectedIds.delete(id);
    if (!selectedIds.has(selectedId)) selectedId = [...selectedIds].at(-1) || null;
    if (!sel()) setSingleSelection(null); else loadProps(sel());
    changed();
  }
  const undo = () => { if (hist.undo.length) { hist.redo.push(snapshot()); restore(hist.undo.pop()); } };
  const redo = () => { if (hist.redo.length) { hist.undo.push(snapshot()); restore(hist.redo.pop()); } };

  function updateInspector() { showTab(tab); }
  function focusSelection(id, seek = true) {
    selectedId = id;
    const c = sel();
    if (c && seek && (time < c.start || time >= c.start + c.dur)) time = c.start;
    if (c) loadProps(c);
    else audioAdjPanel.set({ volume: 100, pan: 0, bass: 0, treble: 0, fadeIn: false, fadeOut: false, fadeInDuration: 1, fadeOutDuration: 1 });
    renderClips(); updateInspector(); updateTime();
  }
  function select(id, seek = true, additive = false) {
    if (additive && id) {
      if (selectedIds.has(id)) selectedIds.delete(id);
      else selectedIds.add(id);
      selectedId = selectedIds.has(id) ? id : [...selectedIds].at(-1) || null;
      focusSelection(selectedId, seek);
      return;
    }
    setSingleSelection(id);
    focusSelection(id, seek);
  }

  const overlaps = (id, track, s, d) => clips.some((o) => o.id !== id && o.track === track && o.start < s + d - 1e-6 && o.start + o.dur > s + 1e-6);
  function snapPoints(id) {
    const points = new Map();
    const excluded = id instanceof Set ? id : new Set(id ? [id] : []);
    let order = 0;
    const add = (point) => { if (!points.has(point)) points.set(point, order); order++; };
    add(0); add(time);
    for (const clip of clips) if (!excluded.has(clip.id)) { add(clip.start); add(clip.start + clip.dur); }
    return [...points].map(([point, sourceOrder]) => ({ point, sourceOrder }))
      .sort((a, b) => a.point - b.point || a.sourceOrder - b.sourceOrder);
  }
  function snapTo(v, pts) {
    const threshold = 8 / pps;
    let low = 0, high = pts.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (pts[mid].point < v) low = mid + 1;
      else high = mid;
    }
    let best = null;
    for (const index of [low - 1, low]) {
      const candidate = pts[index];
      if (!candidate) continue;
      const distance = Math.abs(candidate.point - v);
      if (distance <= threshold && (!best || distance < best.d || (distance === best.d && candidate.sourceOrder < best.order))) {
        best = { d: distance, p: candidate.point, order: candidate.sourceOrder };
      }
    }
    return best;
  }
  function showSnap(t) { snapLine.hidden = t == null; if (t != null) snapLine.style.left = t * pps + "px"; }
  const rowAt = (y) => { const i = rows.findIndex((r) => { const b = r.getBoundingClientRect(); return y >= b.top && y < b.bottom; }); return i < 0 ? null : TRACKS[i].id; };
  function revealVideoLanesThrough(lane) {
    const limit = VIDEO_LANES_BOTTOM_UP.indexOf(lane);
    if (limit < 0) return;
    for (let i = 0; i <= limit; i++) {
      const id = VIDEO_LANES_BOTTOM_UP[i];
      rowEl(id).classList.add("is-track-visible");
      labelsInner.children[TRACKS.findIndex((track) => track.id === id)]?.classList.add("is-track-visible");
    }
  }
  function inferredTrackAt(y, kind) {
    const actual = rowAt(y);
    if (actual && trackKind(actual) === kind) return actual;
    if (kind === "video") {
      const base = rowEl("v1").getBoundingClientRect();
      const steps = Math.max(0, Math.round((base.top + base.height / 2 - y) / 52));
      return VIDEO_LANES_BOTTOM_UP[clamp(steps, 0, VIDEO_LANES_BOTTOM_UP.length - 1)];
    }
    const base = rowEl("a1").getBoundingClientRect();
    const steps = Math.max(0, Math.round((y - base.top - base.height / 2) / 52));
    return ["a1", "a2"][clamp(steps, 0, 1)];
  }

  function onClipDown(e, c) {
    if (e.button !== 0 || tool === "hand") return;
    e.preventDefault();
    if (e.shiftKey || e.ctrlKey || e.metaKey) { select(c.id, false, true); return; }
    if (tool === "text") {
      if (!selectedIds.has(c.id)) select(c.id, true); else focusSelection(c.id, true);
      if (c.theme === "title") requestAnimationFrame(() => panels.text.focusTitle());
      return;
    }
    if (!selectedIds.has(c.id)) select(c.id, true); else focusSelection(c.id, true);
    if (c.locked) return;
    const edge = e.target.classList.contains("ed-clip__h") ? (e.target.classList.contains("ed-clip__h--l") ? "l" : "r") : null;
    if (tool === "razor" && !edge) {
      const t = (e.clientX - tlContent.getBoundingClientRect().left) / pps;
      split(c, t); return;
    }
    edge ? startTrim(e, c, edge) : startMove(e, c);
  }

  function drag(onMove, onEnd) {
    const mv = (ev) => onMove(ev);
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); showSnap(null); onEnd(); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  }

  tlScroll.addEventListener("pointerdown", (e) => {
    const middlePan = e.button === 1;
    if ((!middlePan && (tool !== "hand" || e.button !== 0)) || e.target.closest(".ed-clip,button")) return;
    e.preventDefault();
    const x = e.clientX, y = e.clientY, left = tlScroll.scrollLeft, top = tlScroll.scrollTop;
    tlScroll.classList.add("is-panning");
    const move = (ev) => { tlScroll.scrollLeft = left - (ev.clientX - x); if (!middlePan) tlScroll.scrollTop = top - (ev.clientY - y); };
    const up = () => { tlScroll.classList.remove("is-panning"); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up, { once: true });
  });

  function movementMembers(anchor) {
    const seeds = selectedIds.has(anchor.id) ? clips.filter((clip) => selectedIds.has(clip.id)) : [anchor];
    const members = new Map(seeds.map((clip) => [clip.id, clip]));
    for (const seed of seeds) if (seed.groupId) {
      for (const clip of clips) if (clip.groupId === seed.groupId) members.set(clip.id, clip);
    }
    for (const clip of [...members.values()]) {
      const partner = clip.linkedAudioId ? clips.find((item) => item.id === clip.linkedAudioId) : clips.find((item) => item.linkedAudioId === clip.id);
      if (partner) members.set(partner.id, partner);
    }
    return [...members.values()];
  }

  function startMultiMove(e, anchor, members) {
    if (members.some((clip) => clip.locked)) return;
    const before = snapshot(), movedIds = new Set(members.map((clip) => clip.id));
    const origins = new Map(members.map((clip) => [clip.id, { start: clip.start, track: clip.track }]));
    const snapCandidates = snapPoints(movedIds), anchorOrigin = origins.get(anchor.id);
    const anchorKind = trackKind(anchor.track);
    const lanes = anchorKind === "video" ? VIDEO_LANES_BOTTOM_UP : ["a1", "a2"];
    const anchorLane = lanes.indexOf(anchor.track), rowHeight = 52;
    const x0 = e.clientX, y0 = e.clientY;
    let moved = false, raf = 0, latestEvent = null, lastSnap = null;
    let preview = new Map([...origins].map(([id, pos]) => [id, { ...pos }]));
    root.classList.add("is-track-dragging");

    const resolveTracks = (wantedLane, start) => {
      const sameKindIndices = members.filter((clip) => trackKind(clip.track) === anchorKind)
        .map((clip) => lanes.indexOf(origins.get(clip.id).track));
      const minShift = -Math.min(...sameKindIndices), maxShift = lanes.length - 1 - Math.max(...sameKindIndices);
      const shifts = Array.from({ length: maxShift - minShift + 1 }, (_, index) => index + minShift)
        .sort((a, b) => Math.abs(anchorLane + a - wantedLane) - Math.abs(anchorLane + b - wantedLane));
      for (const shift of shifts) {
        const positions = members.map((clip) => {
          const origin = origins.get(clip.id);
          return { clip, origin, relative: origin.start - anchorOrigin.start,
            lane: trackKind(clip.track) === anchorKind ? lanes[lanes.indexOf(origin.track) + shift] : origin.track };
        });
        const makePlan = (candidateStart) => {
          const planned = new Map();
          for (const { clip, relative, lane } of positions) planned.set(clip.id, { start: candidateStart + relative, track: lane });
          const valid = positions.every(({ clip, relative, lane }) => {
            const clipStart = candidateStart + relative;
            return !clips.some((other) => !movedIds.has(other.id) && other.track === lane
              && timeOverlap(clipStart, clipStart + clip.dur, other.start, other.start + other.dur));
          });
          return valid ? planned : null;
        };
        const direct = makePlan(start);
        if (direct) return direct;
        const boundaries = [];
        for (const { clip, relative, lane } of positions) for (const other of clips) {
          if (movedIds.has(other.id) || other.track !== lane) continue;
          boundaries.push(other.start - relative - clip.dur, other.start + other.dur - relative);
        }
        const nearest = boundaries.filter((candidate) => candidate >= 0 && Number.isFinite(candidate))
          .sort((a, b) => Math.abs(a - start) - Math.abs(b - start));
        for (const candidate of nearest) {
          const plan = makePlan(candidate);
          if (plan) return plan;
        }
      }
      return null;
    };
    const paint = () => {
      raf = 0;
      if (!latestEvent) return;
      const ev = latestEvent; latestEvent = null;
      let nextStart = Math.max(0, anchorOrigin.start + (ev.clientX - x0) / pps), snapT = null;
      if (snapOn) {
        const startSnap = snapTo(nextStart, snapCandidates), endSnap = snapTo(nextStart + anchor.dur, snapCandidates);
        const candidate = startSnap && (!endSnap || startSnap.d <= endSnap.d)
          ? { start: startSnap.p, edge: startSnap.p }
          : endSnap ? { start: endSnap.p - anchor.dur, edge: endSnap.p } : null;
        if (candidate && Math.abs(candidate.start - nextStart) <= 7 / pps) {
          nextStart = candidate.start; snapT = candidate.edge; lastSnap = candidate.start;
        } else if (lastSnap != null && Math.abs(lastSnap - nextStart) <= 10 / pps) {
          nextStart = lastSnap; snapT = lastSnap;
        } else lastSnap = null;
      } else lastSnap = null;
      const laneSteps = anchorKind === "video" ? (y0 - ev.clientY) / rowHeight : (ev.clientY - y0) / rowHeight;
      const wantedLane = clamp(anchorLane + Math.round(laneSteps), 0, lanes.length - 1);
      const planned = resolveTracks(wantedLane, nextStart);
      if (planned) preview = planned;
      for (const [id, origin] of origins) {
        const target = preview.get(id), node = clipEls.get(id);
        if (!node) continue;
        const dx = (target.start - origin.start) * pps;
        const dy = (trackIndex(target.track) - trackIndex(origin.track)) * rowHeight;
        node.classList.toggle("is-moving", id === anchor.id);
        node.classList.toggle("is-preview-shift", id !== anchor.id && (Math.abs(dx) > .01 || Math.abs(dy) > .01));
        node.style.transform = `translate3d(${dx}px,${dy}px,0)`;
        if (trackKind(target.track) === "video") revealVideoLanesThrough(target.track);
      }
      showSnap(snapT);
      moved ||= Math.abs(ev.clientX - x0) > 3 || Math.abs(ev.clientY - y0) > 3;
    };
    const onMove = (ev) => { latestEvent = ev; if (!raf) raf = requestAnimationFrame(paint); };
    const cleanup = () => {
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("is-track-dragging");
      for (const id of movedIds) {
        const node = clipEls.get(id);
        if (node) { node.style.transform = ""; node.classList.remove("is-moving", "is-preview-shift"); }
      }
      showSnap(null); syncVisibleTracks();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
    const onUp = (event) => {
      latestEvent = event;
      paint();
      cleanup();
      if (!moved) return;
      for (const clip of members) {
        const target = preview.get(clip.id);
        clip.start = target.start; clip.track = target.track;
      }
      commit(before);
    };
    const onCancel = () => cleanup();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onCancel, { once: true });
  }

  function startMove(e, c) {
    const members = movementMembers(c);
    if (members.some((clip) => clip.locked)) return;
    if (members.length > 1) { startMultiMove(e, c, members); return; }
    const before = snapshot();
    const origin = { start: c.start, track: c.track };
    const snapCandidates = snapPoints(c.id);
    const kind = trackKind(c.track);
    const partner = c.linkedAudioId ? clips.find(x => x.id === c.linkedAudioId) : clips.find(x => x.linkedAudioId === c.id);
    const partnerOrigin = partner ? { start: partner.start, track: partner.track } : null;
    const excluded = new Set([c.id, partner?.id]);
    const occupancy = new Map();
    for (const clip of clips) {
      if (excluded.has(clip.id)) continue;
      if (!occupancy.has(clip.track)) occupancy.set(clip.track, []);
      occupancy.get(clip.track).push({ start: clip.start, end: clip.start + clip.dur });
    }
    for (const intervals of occupancy.values()) {
      intervals.sort((a, b) => a.start - b.start);
      let maxEnd = -Infinity;
      for (const interval of intervals) { maxEnd = Math.max(maxEnd, interval.end); interval.prefixMaxEnd = maxEnd; }
    }
    const trackHasOverlap = (track, start, end) => {
      const intervals = occupancy.get(track);
      if (!intervals?.length) return false;
      const limit = lowerBoundBy(intervals, end - 1e-6, (interval) => interval.start);
      return limit > 0 && intervals[limit - 1].prefixMaxEnd > start + 1e-6;
    };
    const x0 = e.clientX, y0 = e.clientY;
    const clipEl = clipEls.get(c.id);
    const clipRect = clipEl.getBoundingClientRect();
    const grabY = clamp(e.clientY - clipRect.top, 0, clipRect.height);
    const rowHeight = 52;
    let moved = false, raf = 0, latestEvent = null, lastSnap = null;
    root.classList.add("is-track-dragging");
    let preview = { start: origin.start, track: origin.track };
    const setTransform = (node, dx, dy, moving = false) => {
      if (!node) return;
      node.classList.toggle("is-moving", moving);
      node.classList.toggle("is-preview-shift", !moving && (Math.abs(dx) > .01 || Math.abs(dy) > .01));
      node.style.transform = `translate3d(${dx}px,${dy}px,0)`;
    };
    const nearestFreeLane = (wanted, start) => {
      const lanes = TRACKS.filter(t => t.kind === kind).map(t => t.id);
      const base = Math.max(0, lanes.indexOf(wanted));
      const candidates = lanes.map((id, i) => ({ id, i, dist: Math.abs(i - base) }))
        .sort((a,b) => a.dist - b.dist || a.i - b.i);
      const found = candidates.find(x => !trackHasOverlap(x.id, start, start + c.dur));
      return found?.id || wanted;
    };
    const resolveLanePosition = (wanted, start) => {
      if (!trackHasOverlap(wanted, start, start + c.dur)) return { start, track: wanted };
      const candidates = (occupancy.get(wanted) || []).flatMap((interval) => [interval.start - c.dur, interval.end])
        .filter((candidate) => candidate >= 0 && !trackHasOverlap(wanted, candidate, candidate + c.dur))
        .sort((a, b) => Math.abs(a - start) - Math.abs(b - start));
      if (candidates.length) return { start: candidates[0], track: wanted };
      const track = nearestFreeLane(wanted, start);
      return { start, track };
    };
    const paint = () => {
      raf = 0;
      if (!latestEvent) return;
      const ev = latestEvent; latestEvent = null;
      const dx = (ev.clientX - x0) / pps;
      let nextStart = Math.max(0, origin.start + dx);
      let snapT = null;
      if (snapOn) {
        const a = snapTo(nextStart, snapCandidates);
        const b = snapTo(nextStart + c.dur, snapCandidates);
        const candidate = a && (!b || a.d <= b.d) ? { start:a.p, edge:a.p } : b ? { start:b.p-c.dur, edge:b.p } : null;
        // Small dead-band avoids flicker as a clip crosses a snap threshold.
        if (candidate && Math.abs(candidate.start - nextStart) <= 7 / pps) {
          nextStart = candidate.start; snapT = candidate.edge; lastSnap = candidate.start;
        } else if (lastSnap != null && Math.abs(lastSnap - nextStart) <= 10 / pps) {
          nextStart = lastSnap; snapT = lastSnap;
        } else lastSnap = null;
      } else lastSnap = null;
      const lanes = kind === "video" ? VIDEO_LANES_BOTTOM_UP : ["a1", "a2"];
      const originLane = lanes.indexOf(origin.track);
      const laneSteps = kind === "video" ? (y0 - ev.clientY) / rowHeight : (ev.clientY - y0) / rowHeight;
      const inferred = lanes[clamp(originLane + Math.round(laneSteps), 0, lanes.length - 1)];
      const row = rowAt(ev.clientY - grabY + rowHeight / 2);
      const wanted = row && trackKind(row) === kind && Math.abs(laneSteps) < 0.5 ? row : inferred;
      if (kind === "video") revealVideoLanesThrough(wanted);
      const resolved = resolveLanePosition(wanted, nextStart);
      nextStart = resolved.start;
      const nextTrack = resolved.track;
      preview = { start: nextStart, track: nextTrack };
      const targetDx = (nextStart - origin.start) * pps;
      const targetDy = (trackIndex(nextTrack) - trackIndex(origin.track)) * rowHeight;
      setTransform(clipEl, targetDx, targetDy, true);
      if (partner && partnerOrigin) {
        const partnerEl = clipEls.get(partner.id);
        const partnerDx = (nextStart - partnerOrigin.start) * pps;
        let partnerTrack = partnerOrigin.track;
        if (kind === "video" && trackKind(partner.track) === "audio") partnerTrack = partnerOrigin.track;
        else if (kind === "audio" && trackKind(partner.track) === "video") partnerTrack = partnerOrigin.track;
        const partnerDy = (trackIndex(partnerTrack) - trackIndex(partnerOrigin.track)) * rowHeight;
        setTransform(partnerEl, partnerDx, partnerDy, false);
      }
      showSnap(snapT);
      moved = moved || Math.abs(ev.clientX - x0) > 3 || Math.abs(ev.clientY - y0) > 3;
    };
    const onMove = ev => {
      latestEvent = ev;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const cleanup = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; latestEvent = null;
      clipEls.forEach(node => { node.style.transform = ""; node.classList.remove("is-moving","is-preview-shift"); });
      showSnap(null);
      syncVisibleTracks();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
    const onUp = (event) => {
      latestEvent = event;
      paint();
      cleanup();
      if (!moved) return;
      c.start = preview.start; c.track = preview.track;
      if (partner && partnerOrigin) {
        const delta = preview.start - origin.start;
        partner.start = Math.max(0, partnerOrigin.start + delta);
        // Keep linked audio/video on its original corresponding lane.
        partner.track = partnerOrigin.track;
      }
      commit(before);
    };
    const onCancel = () => cleanup();
    window.addEventListener("pointermove", onMove, { passive:true });
    window.addEventListener("pointerup", onUp, { once:true });
    window.addEventListener("pointercancel", onCancel, { once:true });
  }

  function startTrim(e, c, side) {
    const before = snapshot(), x0 = e.clientX, o = { s: c.start, e: c.start + c.dur };
    const snapCandidates = snapPoints(c.id);
    const others = clips.filter((x) => x.id !== c.id && x.track === c.track);
    const partner = c.linkedAudioId ? clips.find((x) => x.id === c.linkedAudioId) : clips.find((x) => x.linkedAudioId === c.id);
    const clipBefore = clone(c), partnerBefore = partner ? clone(partner) : null;
    const partnerOthers = partner ? clips.filter((x) => x.id !== partner.id && x.track === partner.track) : [];
    const sourceOffset = Number(c.sourceOffset || 0), sourceDuration = Number(c.sourceDuration || Infinity);
    const lo = Math.max(0, o.s - sourceOffset,
      ...others.filter((x) => x.start + x.dur <= o.s + 1e-6).map((x) => x.start + x.dur),
      ...partnerOthers.filter((x) => x.start + x.dur <= o.s + 1e-6).map((x) => x.start + x.dur));
    const hi = Math.min(o.s + Math.max(0.5, sourceDuration - sourceOffset),
      ...others.filter((x) => x.start >= o.e - 1e-6).map((x) => x.start),
      ...partnerOthers.filter((x) => x.start >= o.e - 1e-6).map((x) => x.start));
    let moved = false;
    drag((ev) => {
      moved = true;
      let v = (side === "l" ? o.s : o.e) + (ev.clientX - x0) / pps, snapT = null;
      if (snapOn) { const a = snapTo(v, snapCandidates); if (a) { v = a.p; snapT = a.p; } }
      if (side === "l") {
        v = clamp(v, lo, o.e - 0.5);
        const offset = v - o.s;
        c.sourceOffset = Math.max(0, sourceOffset + offset); c.start = v; c.dur = o.e - v;
        c.keyframes = keyframesForRange(clipBefore, offset, clipBefore.dur, true);
        if (partner && partnerBefore) {
          const partnerOffset = clamp(v - partnerBefore.start, 0, partnerBefore.dur);
          partner.keyframes = keyframesForRange(partnerBefore, partnerOffset, partnerBefore.dur, true);
        }
      } else {
        v = clamp(v, o.s + 0.5, hi); c.dur = v - o.s;
        c.keyframes = keyframesForRange(clipBefore, 0, c.dur, false, true);
        if (partner && partnerBefore) partner.keyframes = keyframesForRange(partnerBefore, 0, Math.min(c.dur, partnerBefore.dur), false, true);
      }
      if (partner) {
        partner.start = c.start; partner.dur = c.dur;
        partner.sourceOffset = side === "l" && partnerBefore
          ? Math.max(0, Number(partnerBefore.sourceOffset || 0) + c.start - partnerBefore.start)
          : c.sourceOffset || 0;
        place(partner); refreshKeyframeMarkers(partner);
      }
      invalidateClipIndex();
      place(c); refreshKeyframeMarkers(c); showSnap(snapT);
    }, () => { if (moved) commit(before); });
  }

  function split(c, t) {
    if (t <= c.start + 0.15 || t >= c.start + c.dur - 0.15) return;
    const before = snapshot();
    const cutOffset = t - c.start, oldEnd = c.start + c.dur;
    const clipBefore = clone(c);
    const right = { ...clone(c), id: uid(), start: t, dur: oldEnd - t, sourceOffset: Number(c.sourceOffset || 0) + cutOffset, trans: null };
    c.keyframes = keyframesForRange(clipBefore, 0, cutOffset, false, true);
    right.keyframes = keyframesForRange(clipBefore, cutOffset, clipBefore.dur, true);
    const partner = c.linkedAudioId ? clips.find((x) => x.id === c.linkedAudioId) : clips.find((x) => x.linkedAudioId === c.id);
    let rightPartner = null;
    if (partner && t > partner.start + 0.15 && t < partner.start + partner.dur - 0.15) {
      const partnerBefore = clone(partner), partnerCutOffset = t - partner.start;
      const partnerEnd = partner.start + partner.dur;
      rightPartner = { ...clone(partner), id: uid(), start: t, dur: partnerEnd - t, sourceOffset: Number(partner.sourceOffset || 0) + (t - partner.start), trans: null };
      partner.keyframes = keyframesForRange(partnerBefore, 0, partnerCutOffset, false, true);
      rightPartner.keyframes = keyframesForRange(partnerBefore, partnerCutOffset, partnerBefore.dur, true);
      partner.dur = t - partner.start; partner.trans = null;
      c.linkedAudioId = partner.id; partner.linkedAudioId = c.id;
      right.linkedAudioId = rightPartner.id; rightPartner.linkedAudioId = right.id;
    } else delete right.linkedAudioId;
    c.dur = cutOffset; c.trans = null;
    clips.push(right); if (rightPartner) clips.push(rightPartner);
    setSingleSelection(right.id); loadProps(right);
    commit(before);
  }

  function removeSelected() {
    const selected = clips.filter((clip) => selectedIds.has(clip.id));
    if (!selected.length && sel()) selected.push(sel());
    if (!selected.length) return;
    const before = snapshot();
    const removeIds = new Set(selected.map((clip) => clip.id));
    const groupIds = new Set(selected.map((clip) => clip.groupId).filter(Boolean));
    for (const clip of clips) if (groupIds.has(clip.groupId)) removeIds.add(clip.id);
    for (const clip of clips) {
      if (removeIds.has(clip.id) && clip.linkedAudioId) removeIds.add(clip.linkedAudioId);
      if (clip.linkedAudioId && removeIds.has(clip.linkedAudioId)) removeIds.add(clip.id);
    }
    clips = clips.filter((clip) => !removeIds.has(clip.id));
    setSingleSelection(null);
    commit(before);
  }

  function addClip(m) {
    const before = snapshot();
    const targetTrack = m.kind === "audio" ? "a1" : "v1";
    const start = Math.max(0, ...clips.filter((x) => x.track === targetTrack).map((x) => x.start + x.dur));
    const duration = m.duration || m.dur;
    if (m.kind === "audio") {
      const audio = { id: uid(), track: "a1", start, dur: duration, sourceDuration: duration, sourceOffset: 0, label: m.label, theme: "audio", mediaKind: "audio", path: m.path, previewUrl: m.previewUrl, props: defaultProps() };
      clips.push(audio); setSingleSelection(audio.id); loadProps(audio);
    } else {
      const vidId = uid();
      const videoClip = { id: vidId, track: "v1", start, dur: duration, sourceDuration: duration, sourceOffset: 0, label: m.label, theme: m.theme || "coast", mediaKind: m.kind || "video", path: m.path, previewUrl: m.previewUrl, thumbnail: m.thumbnail, filmstrip: m.filmstrip, waveform: m.waveform, assetVersion: m.assetVersion, hasAudio: !!m.hasAudio, audioDetached: false, props: defaultProps() };
      clips.push(videoClip);
      setSingleSelection(vidId); loadProps(videoClip);
    }
    time = start;
    commit(before);
  }

  function addTitleClip(at, requestedTrack, box = { x: 15, y: 35, w: 70, h: 30 }) {
    const before = snapshot();
    const start = Math.max(0, at);
    const lane = TRACKS.some(item => item.id === requestedTrack && item.kind === "video") ? requestedTrack : "v4";
    const clip = { id: uid(), track: lane, start, dur: 5, sourceDuration: 5, sourceOffset: 0, label: "Title", theme: "title", mediaKind: "title", props: defaultProps() };
    clip.props.text.title = "Title";
    clip.props.text.box = { x: clamp(box.x, 0, 100), y: clamp(box.y, 0, 100), w: clamp(box.w, 1, 100), h: clamp(box.h, 1, 100) };
    clips.push(clip); setSingleSelection(clip.id); loadProps(clip); time = start;
    commit(before); showTab("text");
    requestAnimationFrame(() => panels.text.focusTitle());
  }

  /* Responsive library-to-timeline drag with live gap/layer preview and reversible ripple. */
  const VIDEO_LANES_BOTTOM_UP = ["v1", "v2", "v3", "v4"];
  const trackIndex = (id) => TRACKS.findIndex((t) => t.id === id);
  const positionOf = (clip, updates) => updates.get(clip.id) || { start: clip.start, track: clip.track };
  const timeOverlap = (a0, a1, b0, b1) => a0 < b1 - 1e-6 && a1 > b0 + 1e-6;

  function buildMediaDropPlan(m, targetTrack, rawStart) {
    const updates = new Map();
    const start = Math.max(0, rawStart);
    const end = start + m.dur;
    const lane = VIDEO_LANES_BOTTOM_UP.includes(targetTrack) ? targetTrack : "v1";
    let valid = true;

    // Make a real insertion gap: later clips on the target lane ripple right by the incoming duration.
    for (const c of clips) {
      if (!isVisual(c) || c.track !== lane) continue;
      const pos = positionOf(c, updates);
      if (pos.start >= start - 1e-6) updates.set(c.id, { ...pos, start: pos.start + m.dur });
    }

    // A clip that straddles the insertion point is displaced to the next higher video lane.
    // Any occupied lane above it is displaced in turn, so the preview never hides overlaps.
    const bumpUp = (clip, visiting = new Set()) => {
      if (visiting.has(clip.id)) return false;
      const nextVisiting = new Set(visiting); nextVisiting.add(clip.id);
      const current = positionOf(clip, updates);
      const laneIndex = VIDEO_LANES_BOTTOM_UP.indexOf(current.track);
      if (laneIndex < 0 || laneIndex >= VIDEO_LANES_BOTTOM_UP.length - 1) return false;
      const destination = VIDEO_LANES_BOTTOM_UP[laneIndex + 1];
      const blockers = clips.filter(other => {
        if (other.id === clip.id || !isVisual(other)) return false;
        const op = positionOf(other, updates);
        return op.track === destination && timeOverlap(current.start, current.start + clip.dur, op.start, op.start + other.dur);
      });
      for (const blocker of blockers) if (!bumpUp(blocker, nextVisiting)) return false;
      updates.set(clip.id, { ...current, track: destination });
      return true;
    };

    const straddlers = clips.filter(c => {
      if (!isVisual(c)) return false;
      const pos = positionOf(c, updates);
      return pos.track === lane && pos.start < start - 1e-6 && pos.start + c.dur > start + 1e-6;
    });
    for (const c of straddlers) if (!bumpUp(c)) valid = false;

    for (const audioClip of clips) {
      if (!audioClip.track.startsWith("a") || !audioClip.linkedAudioId) continue;
      const partner = clips.find((candidate) => candidate.id === audioClip.linkedAudioId);
      if (!partner) continue;
      const partnerPos = positionOf(partner, updates);
      if (Math.abs(partnerPos.start - partner.start) > 1e-6) updates.set(audioClip.id, { start: partnerPos.start, track: audioClip.track });
    }
    return { valid, kind: "video", lane, audioLane: null, start, end, updates };
  }

  function buildAudioDropPlan(media, requestedLane, rawStart) {
    const start = Math.max(0, rawStart), end = start + media.dur;
    const order = requestedLane === "a2" ? ["a2", "a1"] : ["a1", "a2"];
    const lane = order.find(track => !clips.some(c => c.track === track && timeOverlap(start, end, c.start, c.start + c.dur)));
    return { valid: !!lane, kind: "audio", lane: null, audioLane: lane || order[0], start, end, updates: new Map() };
  }

  function ensureDropPreviewNodes() {
    if (!dropPreviewVideo) {
      dropPreviewVideo = h("div", { class: "ed-media-drop-preview ed-media-drop-preview--video" },
        h("span", { class: "ed-media-drop-preview__label" }, "New clip"));
      dropPreviewAudio = h("div", { class: "ed-media-drop-preview ed-media-drop-preview--audio" },
        h("span", { class: "ed-media-drop-preview__label" }, "Audio"));
      tlContent.append(dropPreviewVideo, dropPreviewAudio);
    }
  }

  function applyDropPreview(m, plan) {
    syncVisibleTracks();
    if (plan.kind === "video") revealVideoLanesThrough(plan.lane);
    for (const id of [plan.lane, plan.audioLane].filter(Boolean)) {
      rowEl(id).classList.add("is-track-visible");
      labelsInner.children[TRACKS.findIndex((track) => track.id === id)]?.classList.add("is-track-visible");
    }
    // Reset all previous temporary transforms before applying the current hover plan.
    for (const c of clips) {
      const el = clipEls.get(c.id);
      if (!el) continue;
      const p = plan.updates.get(c.id);
      if (!p) { el.style.transform = ""; continue; }
      const dx = (p.start - c.start) * pps;
      const dy = (trackIndex(p.track) - trackIndex(c.track)) * 52;
      el.style.transform = `translate3d(${dx}px,${dy}px,0)`;
    }
    ensureDropPreviewNodes();
    const w = Math.max(12, m.dur * pps);
    const entries = plan.kind === "audio"
      ? [[dropPreviewAudio, rowEl(plan.audioLane).offsetTop + 5, m.label]]
      : [[dropPreviewVideo, rowEl(plan.lane).offsetTop + 5, m.label], ...(plan.audioLane ? [[dropPreviewAudio, rowEl(plan.audioLane).offsetTop + 5, `${m.label} · Audio`]] : [])];
    dropPreviewVideo.hidden = true; dropPreviewAudio.hidden = true;
    for (const [node, y, label] of entries) {
      node.style.left = `${plan.start * pps}px`;
      node.style.top = `${y}px`;
      node.style.width = `${w}px`;
      node.classList.toggle("is-invalid", !plan.valid);
      node.querySelector(".ed-media-drop-preview__label").textContent = label;
      node.hidden = false;
    }
    activeMediaPlan = plan;
    const neededWidth = (plan.end + 14) * pps + 40;
    if (neededWidth > tlContent.scrollWidth) tlContent.style.width = `${neededWidth}px`;
  }

  function clearDropLayoutPreview() {
    for (const c of clips) {
      const el = clipEls.get(c.id);
      if (el) el.style.transform = "";
    }
    dropPreviewVideo?.remove(); dropPreviewAudio?.remove();
    dropPreviewVideo = dropPreviewAudio = null;
    activeMediaPlan = null;
    syncVisibleTracks();
  }

  function clearMediaDropPreview() {
    clearDropLayoutPreview();
    mediaDragState?.ghost?.remove();
    document.querySelectorAll(".ed-media-drag-ghost, .ed-media-drop-preview").forEach((node) => node.remove());
    mediaDragState = null;
    root.classList.remove("is-media-dragging");
  }

  function timelinePoint(ev) {
    const r = tlScroll.getBoundingClientRect();
    return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  }

  function updateMediaDrag(ev) {
    if (!mediaDragState) return;
    const { media, grabFraction, ghost } = mediaDragState;
    ghost.style.left = `${ev.clientX + 18}px`;
    ghost.style.top = `${ev.clientY + 16}px`;
    if (!timelinePoint(ev)) {
      if (activeMediaPlan) clearDropLayoutPreview();
      mediaDragState = { media, grabFraction, ghost };
      return;
    }
    // Edge autoscroll remains gentle and stops as soon as the pointer leaves the timeline viewport.
    const r = tlScroll.getBoundingClientRect(), edge = 34;
    if (ev.clientX < r.left + edge) tlScroll.scrollLeft -= Math.max(2, (r.left + edge - ev.clientX) * .22);
    else if (ev.clientX > r.right - edge) tlScroll.scrollLeft += Math.max(2, (ev.clientX - (r.right - edge)) * .22);
    if (ev.clientY < r.top + edge) tlScroll.scrollTop -= Math.max(2, (r.top + edge - ev.clientY) * .18);
    else if (ev.clientY > r.bottom - edge) tlScroll.scrollTop += Math.max(2, (ev.clientY - (r.bottom - edge)) * .18);

    const isAudio = media.kind === "audio";
    const lane = inferredTrackAt(ev.clientY, isAudio ? "audio" : "video");
    if (!lane || !(isAudio ? lane.startsWith("a") : lane.startsWith("v"))) {
      if (activeMediaPlan) clearDropLayoutPreview();
      mediaDragState = { media, grabFraction, ghost };
      return;
    }
    if (!isAudio) revealVideoLanesThrough(lane);
    const contentLeft = tlContent.getBoundingClientRect().left;
    let start = Math.max(0, (ev.clientX - contentLeft - grabFraction * media.dur * pps) / pps);
    if (snapOn) {
      const snap = snapTo(start, snapPoints(null));
      if (snap) start = Math.max(0, snap.p);
    }
    const plan = isAudio ? buildAudioDropPlan(media, lane, start) : buildMediaDropPlan(media, lane, start);
    applyDropPreview(media, plan);
    mediaDragState = { media, grabFraction, ghost };
  }

  function commitMediaDrop(media, plan) {
    if (!plan || !plan.valid) return;
    const before = snapshot();
    for (const c of clips) {
      const p = plan.updates.get(c.id);
      if (p) { c.start = p.start; c.track = p.track; }
    }
    if (plan.kind === "audio") {
      const audioClip = { id: uid(), track: plan.audioLane, start: plan.start, dur: media.dur, sourceDuration: media.duration || media.dur, sourceOffset: 0, label: media.label, theme: "audio", mediaKind: "audio", path: media.path, previewUrl: media.previewUrl, props: defaultProps() };
      clips.push(audioClip); setSingleSelection(audioClip.id); audioAdjPanel.set(audioClip.props.audio);
    } else {
      const vidId = uid();
      const videoClip = { id: vidId, track: plan.lane, start: plan.start, dur: media.dur, sourceDuration: media.duration || media.dur, sourceOffset: 0, label: media.label, theme: media.theme || "coast", mediaKind: media.kind || "video", path: media.path, previewUrl: media.previewUrl, thumbnail: media.thumbnail, filmstrip: media.filmstrip, waveform: media.waveform, assetVersion: media.assetVersion, hasAudio: !!media.hasAudio, audioDetached: false, props: defaultProps() };
      clips.push(videoClip);
      setSingleSelection(vidId); loadProps(videoClip);
    }
    time = plan.start;
    commit(before);
  }

  function beginMediaDrag(e, media, tile) {
    if (e.button !== 0 || e.target.closest("button")) return;
    e.preventDefault();
    const rect = tile.getBoundingClientRect();
    const grabFraction = clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    const originX = e.clientX, originY = e.clientY;
    let started = false;
    let ghost = null;
    const move = (ev) => {
      if (!started) {
        if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < 5) return;
        started = true;
        ghost = h("div", { class: "ed-media-drag-ghost" },
          h("span", { class: "ed-media-drag-ghost__thumb" }),
          h("span", { class: "ed-media-drag-ghost__name" }, media.label));
        ghost.firstChild.style.background = themeGradient(THEMES[media.theme] || THEMES.sunset);
        document.body.append(ghost);
        mediaDragState = { media, grabFraction, ghost };
        root.classList.add("is-media-dragging");
      }
      ev.preventDefault();
      updateMediaDrag(ev);
    };
    const up = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (started && timelinePoint(ev) && activeMediaPlan?.valid) commitMediaDrop(media, activeMediaPlan);
      clearMediaDropPreview();
    };
    const cancel = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      clearMediaDropPreview();
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }

  ruler.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || tool === "hand") return;
    const at = (ev) => setTime((ev.clientX - tlContent.getBoundingClientRect().left) / pps);
    pause(); at(e); drag(at, () => {});
  });
  frame.addEventListener("pointerdown", (e) => {
    if (tool !== "text" || e.button !== 0) return;
    e.preventDefault();
    const rect = frame.getBoundingClientRect();
    const toPoint = (ev) => ({
      x: clamp((ev.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
      y: clamp((ev.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
    });
    const start = toPoint(e);
    let end = start, moved = false;
    const paint = (ev) => {
      end = toPoint(ev);
      moved = moved || Math.hypot((end.x - start.x) * rect.width, (end.y - start.y) * rect.height) >= 8;
      const left = Math.min(start.x, end.x), top = Math.min(start.y, end.y);
      textBoxDraft.style.left = `${left * 100}%`;
      textBoxDraft.style.top = `${top * 100}%`;
      textBoxDraft.style.width = `${Math.abs(end.x - start.x) * 100}%`;
      textBoxDraft.style.height = `${Math.abs(end.y - start.y) * 100}%`;
      textBoxDraft.hidden = false;
    };
    const finish = (ev) => {
      window.removeEventListener("pointermove", paint);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      textBoxDraft.hidden = true;
      if (!moved) return;
      paint(ev);
      textBoxDraft.hidden = true;
      const left = Math.min(start.x, end.x), top = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      if (w * rect.width < 20 || h * rect.height < 18) return;
      pause();
      addTitleClip(time, "v4", { x: left * 100, y: top * 100, w: w * 100, h: h * 100 });
    };
    const cancel = () => {
      window.removeEventListener("pointermove", paint);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      textBoxDraft.hidden = true;
    };
    window.addEventListener("pointermove", paint, { passive: false });
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  });
  rows.forEach((r) => r.addEventListener("pointerdown", (e) => {
    if (tool === "hand" || e.target !== r || e.button !== 0) return;
    if (tool === "text") {
      const track = TRACKS[rows.indexOf(r)];
      if (track?.kind === "video") setTime((e.clientX - tlContent.getBoundingClientRect().left) / pps);
      return;
    }
    select(null); setTime((e.clientX - tlContent.getBoundingClientRect().left) / pps);
  }));

  let raf = 0, last = 0, lastPreviewPaint = 0;
  function frameLoop(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    time += dt;
    if (time >= dur()) { if (loopOn) { time = 0; previewSeekRevision++; } else { time = dur(); pause(); } }
    if (!playing || !lastPreviewPaint || now - lastPreviewPaint >= 1000 / FPS) {
      lastPreviewPaint = now;
      updateTime();
    }
    if (playing) raf = requestAnimationFrame(frameLoop);
  }
  function play() { if (playing) return; if (time >= dur() - 0.01) { time = 0; previewSeekRevision++; } playing = true; last = performance.now(); lastPreviewPaint = 0; syncAudioPreview(); raf = requestAnimationFrame(frameLoop); syncPlayBtn(); }
  function pause() {
    playing = false; cancelAnimationFrame(raf); syncPlayBtn(); syncAudioPreview(); renderPreview();
    const selected = sel(); if (selected && clipKeyframes(selected).length) loadProps(selected);
  }
  function syncPlayBtn() { bPlay.replaceChildren(icon(playing ? "pause" : "play", 24)); bPlay.setAttribute("aria-pressed", String(playing)); }
  bPlay.addEventListener("click", () => (playing ? pause() : play()));
  const stepFrame = (direction) => { pause(); setTime(time + direction / FPS); };
  bBack.addEventListener("click", () => stepFrame(-1));
  bFwd.addEventListener("click", () => stepFrame(1));
  bStart.addEventListener("click", () => setTime(0));
  bEnd.addEventListener("click", () => setTime(dur()));

  const toggle = (b, get, set) => { b.setAttribute("aria-pressed", String(get())); b.addEventListener("click", () => { set(!get()); b.setAttribute("aria-pressed", String(get())); }); };
  toggle(bLoop, () => loopOn, (v) => (loopOn = v));
  toggle(bGuides, () => !gridEl.hidden, (v) => (gridEl.hidden = !v));
  toggle(bSnap, () => snapOn, (v) => { snapOn = v; window.plutoTimeline?.setSnapping(v).catch((error) => root.dispatchEvent(new CustomEvent("pluto:backend-error", { detail: String(error) }))); });

  function setTool(t) {
    tool = t;
    root.dataset.tool = t;
    for (const [k, b] of Object.entries(tools)) b.setAttribute("aria-pressed", String(k === t));
    tlScroll.dataset.tool = t;
    renderPreview();
  }
  tools.select.addEventListener("click", () => setTool("select"));
  tools.hand.addEventListener("click", () => setTool("hand"));
  tools.razor.addEventListener("click", () => setTool("razor"));
  tools.text.addEventListener("click", () => { setTool("text"); showTab("text"); });

  bDelete.addEventListener("click", removeSelected);
  bKeyPrev.addEventListener("click", () => jumpKeyframe(-1));
  bKeyToggle.addEventListener("click", toggleKeyframe);
  bKeyNext.addEventListener("click", () => jumpKeyframe(1));
  undoBtn.addEventListener("click", undo); redoBtn.addEventListener("click", redo);

  function setZoom(v) { pps = clamp(Number(v), 6, 90); zoom.value = pps; renderRuler(); renderClips(); positionPlayhead(); }
  zoom.addEventListener("input", () => setZoom(zoom.value));
  bZoomIn.addEventListener("click", () => setZoom(pps * 1.3)); bZoomOut.addEventListener("click", () => setZoom(pps / 1.3));
  nameInput.addEventListener("input", () => { projectName = nameInput.value; panels.export.set({ output: { name: projectName || "untitled" } }); });

  let exportBusy = false, exportCancelled = false;
  const stopMediaAssets = window.plutoNative?.listenMediaAssets?.((asset) => {
    const pathMatches = asset?.path ? mediaItems.filter((media) => media.path === asset.path) : [];
    const matches = pathMatches.filter((media) => !media.assetVersion || !asset.assetVersion || media.assetVersion === asset.assetVersion);
    const clipMatches = asset?.path ? clips.filter((clip) => clip.path === asset.path
      && (!clip.assetVersion || !asset.assetVersion || clip.assetVersion === asset.assetVersion)) : [];
    if (!matches.length && !clipMatches.length) {
      // Ignore stale completions for a path already imported at a different file revision.
      if (asset?.path && pathMatches.length === 0) {
        pendingMediaAssets.set(mediaAssetKey(asset), asset);
        if (pendingMediaAssets.size > 32) pendingMediaAssets.delete(pendingMediaAssets.keys().next().value);
      }
      return;
    }
    pendingMediaAssets.delete(mediaAssetKey(asset));
    for (const media of matches) {
      media.thumbnail = asset.thumbnail || media.thumbnail;
      media.filmstrip = asset.filmstrip || media.filmstrip;
      media.waveform = asset.waveform || media.waveform;
      media.assetVersion = asset.assetVersion || media.assetVersion;
    }
    for (const clip of clipMatches) {
      clip.thumbnail = asset.thumbnail || clip.thumbnail;
      clip.filmstrip = asset.filmstrip || clip.filmstrip;
      clip.waveform = asset.waveform || clip.waveform;
      clip.assetVersion = asset.assetVersion || clip.assetVersion;
    }
    renderMedia();
    if (clips.some((clip) => clip.path === asset.path)) renderClips();
  });
  const stopExportProgress = window.plutoNative?.listenExportProgress?.(({ progress }) => {
    if (exportBusy && Number.isFinite(progress)) panels.export.setProgress(progress);
  });
  panels.export.on("export", async ({ settings }) => {
    if (exportBusy) return;
    if (!window.plutoNative?.exportTimeline) { panels.export.setStatus("error", "Export requires the Pluto desktop app"); return; }
    exportBusy = true; exportCancelled = false; panels.export.setStatus("exporting");
    try {
      await syncNativeTimeline();
      const output = await window.plutoNative.exportTimeline({ settings, time });
      if (exportCancelled || !output) panels.export.setStatus("idle");
      else { panels.export.setProgress(1); panels.export.setStatus("done"); }
    } catch (error) {
      if (exportCancelled) panels.export.setStatus("idle");
      else panels.export.setStatus("error", String(error).replace(/^Error:\s*/, ""));
    } finally { exportBusy = false; }
  });
  panels.export.on("cancel", async () => {
    if (!exportBusy || !window.plutoNative?.cancelExport) return;
    exportCancelled = true;
    try { await window.plutoNative.cancelExport(); } catch { /* The export may have completed at the same time. */ }
    panels.export.setStatus("idle");
  });
  panels.export.on("browse", async () => {
    if (!window.plutoNative?.chooseExportDirectory) { panels.export.setStatus("error", "Choose a destination in the Pluto desktop app"); return; }
    try {
      const directory = await window.plutoNative.chooseExportDirectory();
      if (directory) panels.export.setDestination(directory);
    } catch (error) { panels.export.setStatus("error", String(error).replace(/^Error:\s*/, "")); }
  });

  const onKey = (e) => {
    if (e.key === "Escape") setDrawer(false);
    if (e.target.closest?.("input, textarea, select, [role=slider], [contenteditable], .tp input, .tp [role=slider]")) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (mod && k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && k === "y") { e.preventDefault(); redo(); }
    else if (e.altKey && k === "arrowleft") { e.preventDefault(); jumpKeyframe(-1); }
    else if (e.altKey && k === "arrowright") { e.preventDefault(); jumpKeyframe(1); }
    else if (!e.shiftKey && k === "arrowleft") { e.preventDefault(); stepFrame(-1); }
    else if (!e.shiftKey && k === "arrowright") { e.preventDefault(); stepFrame(1); }
    else if (k === "k" && !mod) { e.preventDefault(); toggleKeyframe(); }
    else if (k === " ") { e.preventDefault(); playing ? pause() : play(); }
    else if (k === "c" && !mod) setTool("razor");
    else if (k === "v" && !mod) setTool("select");
    else if (k === "h" && !mod) setTool("hand");
    else if (k === "t" && !mod) { setTool("text"); showTab("text"); }
    else if (k === "delete" || k === "backspace") { e.preventDefault(); removeSelected(); }
  };
  window.addEventListener("keydown", onKey);

  renderMedia(); syncPlayBtn(); setTool("select"); syncNativeTimeline().catch(() => {}); renderAll();
  if (clips.length) select(clips[0].id, true);
  time = 0; updateTime();
  showTab("transform");

  const api = {
    el: root, panels,
    getProject: () => ({ name: projectName, duration: dur(), clips: clone(clips) }),
    select: (id) => select(id), play, pause, setTime,
    destroy() { pause(); clearTimeout(propertyChangeTimer); clearTimeout(backendNoticeTimer); flushPropertyChange(false); window.removeEventListener("pointerup", finishPropertyGesture); window.removeEventListener("pointercancel", finishPropertyGesture); root.removeEventListener("pointerdown", startPropertyGesture, true); stopExportProgress?.then?.((unlisten) => unlisten()); stopMediaAssets?.then?.((unlisten) => unlisten()); for (const state of audioPreviewNodes.values()) { state.element.pause(); state.element.removeAttribute("src"); state.element.load(); } audioPreviewNodes.clear(); previewAudioContext?.close?.(); window.removeEventListener("keydown", onKey); Object.values(panels).forEach((p) => p.destroy()); root.remove(); },
  };
  if (options.performanceBenchmark) {
    api.measurePreview = ({ mode = "indexed", warmup = 30, iterations = 240 } = {}) => {
      const sampleCount = clamp(Math.floor(Number(iterations) || 0), 1, 10_000);
      const warmupCount = clamp(Math.floor(Number(warmup) || 0), 0, 2_000);
      const originalTime = time, originalMode = previewCandidateMode, duration = Math.max(0.001, dur() - 0.001);
      const sections = Math.min(4, Math.max(1, Math.floor(duration / (sampleCount / 30))));
      const sectionLength = sampleCount / sections;
      previewCandidateMode = mode === "linear" ? "linear" : "indexed";
      const renderSample = (index) => {
        const sample = index % sampleCount;
        const section = Math.min(sections - 1, Math.floor(sample / sectionLength));
        time = (section * duration / sections + (sample - section * sectionLength) / 30) % duration;
        renderPreview();
      };
      for (let index = 0; index < warmupCount; index++) renderSample(index);
      const samples = new Array(sampleCount);
      for (let index = 0; index < sampleCount; index++) {
        const started = performance.now();
        renderSample(index + warmupCount);
        samples[index] = (performance.now() - started) * 1e6;
      }
      time = originalTime;
      previewCandidateMode = originalMode;
      renderPreview();
      samples.sort((left, right) => left - right);
      const percentile = (fraction) => samples[Math.min(samples.length - 1, Math.floor((samples.length - 1) * fraction))];
      return {
        mode: mode === "linear" ? "linear_reference" : "indexed", clipCount: clips.length, warmup: warmupCount, iterations: sampleCount,
        meanNs: samples.reduce((total, sample) => total + sample, 0) / samples.length,
        medianNs: percentile(0.5), p95Ns: percentile(0.95),
      };
    };
  }
  return api;
}

const previewBenchParams = new URLSearchParams(window.location.search);
const previewBenchCount = previewBenchParams.get("perfbench") === "1"
  ? clamp(Math.floor(Number(previewBenchParams.get("clips")) || 500), 1, 2_000)
  : 0;
window.editor = createVideoEditor(document.getElementById("app"), {
  benchmarkClipCount: previewBenchCount,
  performanceBenchmark: previewBenchCount > 0,
});
})();




