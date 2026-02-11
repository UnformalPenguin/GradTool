/* clip_polygon_editor_v3.js
   Fix: If you mount the overlay INSIDE the clipped element, the overlay gets clipped too.
   v3 introduces a split between:
     - targetEl: the element whose clip-path you are editing (can be clipped)
     - mountEl:  the element to mount the overlay into (should NOT be clipped)

   Default behavior:
     - if mountEl not provided, uses targetEl.parentElement (recommended)
     - overlay positions relative to mountEl, and maps pointer coords into percent space
       relative to targetEl's bounding box (usually identical if targetEl is inset:0 inside mountEl)

   Also adds:
     - setAddMode(true/false)
     - isAddMode()
     - click-to-add when add mode is enabled (for main UI button)

   Usage:
     const editor = ClipPolygonEditor.attach({
       targetEl: document.querySelector(".spiral-layer..."), // the clipped layer
       mountEl: document.querySelector("#spiral"),           // wrapper (NOT clipped)
       initialClipPath: "polygon(...)",
       onChange: ({clipPath, points}) => { ... }
     });
*/

(function () {
  "use strict";

  const DEFAULTS = {
    handleSize: 14,
    handleRing: 2,
    minPoints: 3,
    maxPoints: 64,
    clampToBounds: true,

    snap: false,
    snapStep: 5,
    snapToEdges: true,
    snapEdgeThreshold: 2,

    showLabels: false,
    labelMode: "index",

    overlayZIndex: 9999,

    addPointMode: "dblclick",  // dblclick | clickWhenArmed | none
    removePointMode: "altClick", // altClick | contextMenu | both | none

    preventTextSelection: true,

    onChange: null,
    onDragStart: null,
    onDragEnd: null,
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function round2(v) { return Math.round(v * 100) / 100; }
  function isFiniteNumber(v) { return typeof v === "number" && Number.isFinite(v); }

  function parsePolygonClipPath(str) {
    if (!str) return null;
    let s = String(str).trim();
    s = s.replace(/^clip-path\s*:\s*/i, "").replace(/;$/, "").trim();
    if (!/^polygon\s*\(/i.test(s)) return null;

    const inside = s.replace(/^polygon\s*\(/i, "").replace(/\)\s*$/, "").trim();
    const parts = inside.split(/\s*,\s*/).filter(Boolean);
    const points = [];

    for (const part of parts) {
      const m = part.trim().match(/^(-?\d*\.?\d+)(%|px)?\s+(-?\d*\.?\d+)(%|px)?$/i);
      if (!m) continue;
      const x = Number(m[1]);
      const xu = (m[2] || "%").toLowerCase();
      const y = Number(m[3]);
      const yu = (m[4] || "%").toLowerCase();
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      points.push({ x, y, xu, yu });
    }
    if (points.length < 3) return null;
    return points;
  }

  function toPolygonString(pointsPercent) {
    const pts = pointsPercent.map(p => `${round2(p.x)}% ${round2(p.y)}%`);
    return `polygon(${pts.join(", ")})`;
  }

  function letterLabel(i) {
    let n = i, out = "";
    while (true) {
      out = String.fromCharCode(65 + (n % 26)) + out;
      n = Math.floor(n / 26) - 1;
      if (n < 0) break;
    }
    return out;
  }

  class ClipPolygonEditorInstance {
    constructor(opts) {
      this.opts = { ...DEFAULTS, ...(opts || {}) };

      // REQUIRED: targetEl (clip-path applies here)
      this.targetEl = this.opts.targetEl || this.opts.previewEl; // backward compatible name
      if (!this.targetEl) throw new Error("ClipPolygonEditor.attach requires { targetEl }");

      // RECOMMENDED: mountEl (overlay attaches here)
      this.mountEl = this.opts.mountEl || this.targetEl.parentElement || this.targetEl;
      if (!this.mountEl) throw new Error("ClipPolygonEditor.attach could not resolve mountEl");

      this._ensureMountPositioning();
      this._installStyleOnce();

      this._overlay = null;
      this._svg = null;
      this._svgPoly = null;
      this._handles = [];
      this._labels = [];

      this._points = [];
      this._activeIndex = -1;
      this._pointerId = null;
      this._dragOffset = { x: 0, y: 0 };

      this._ro = null;
      this._raf = 0;
      this._dirty = false;

      this._addModeArmed = false;

      const init = this._resolveInitialPoints();
      this.setPoints(init);

      this._mount();
      this._attachEvents();
      this._observeResize();
      this._renderAll(true);
      this._applyClipToTarget();
      this._emitChange();
    }

    destroy() {
      this._detachEvents();
      this._unobserveResize();
      if (this._overlay && this._overlay.parentNode) this._overlay.parentNode.removeChild(this._overlay);
      this._overlay = this._svg = this._svgPoly = null;
      this._handles = [];
      this._labels = [];
      this._points = [];
    }

    // ---- Public API ----
    getPoints() { return this._points.map(p => ({ x: p.x, y: p.y })); }
    getClipPath() { return toPolygonString(this._points); }

    setClipPath(clipPath) {
      const parsed = parsePolygonClipPath(clipPath);
      if (!parsed) return false;

      const rect = this._targetRect();
      const pts = parsed.map(p => {
        const x = (p.xu === "px") ? (p.x / rect.w) * 100 : p.x;
        const y = (p.yu === "px") ? (p.y / rect.h) * 100 : p.y;
        return { x, y };
      });

      this.setPoints(pts);
      return true;
    }

    setPoints(pointsPercent) {
      const pts = Array.isArray(pointsPercent) ? pointsPercent : [];
      const cleaned = pts
        .filter(p => p && isFiniteNumber(Number(p.x)) && isFiniteNumber(Number(p.y)))
        .map(p => ({ x: Number(p.x), y: Number(p.y) }));

      const base = cleaned.length >= this.opts.minPoints ? cleaned : [
        { x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }
      ];

      this._points = base.slice(0, this.opts.maxPoints).map(p => this._normalizePoint(p));
      this._scheduleRender();
      this._applyClipToTarget();
      this._emitChange();
    }

    addPointAtPercent(x, y, index = null) {
      if (this._points.length >= this.opts.maxPoints) return false;
      const p = this._normalizePoint({ x, y });

      if (index === null || index === undefined || index < 0 || index > this._points.length) {
        const insertAt = this._bestInsertIndex(p);
        this._points.splice(insertAt, 0, p);
      } else {
        this._points.splice(index, 0, p);
      }

      this._scheduleRender();
      this._applyClipToTarget();
      this._emitChange();
      return true;
    }

    removePoint(index) {
      if (this._points.length <= this.opts.minPoints) return false;
      if (index < 0 || index >= this._points.length) return false;
      this._points.splice(index, 1);
      this._scheduleRender();
      this._applyClipToTarget();
      this._emitChange();
      return true;
    }

    setAddMode(on) {
      this._addModeArmed = !!on;
      if (this._overlay) {
        this._overlay.style.cursor = this._addModeArmed ? "crosshair" : "";
      }
      this._updateHint();
    }

    isAddMode() { return !!this._addModeArmed; }

    // ---- Internals ----
    _ensureMountPositioning() {
      const cs = window.getComputedStyle(this.mountEl);
      if (cs.position === "static") this.mountEl.style.position = "relative";
      // Ensure overlay can receive pointer events on mountEl region
      if (!this.mountEl.style.touchAction) this.mountEl.style.touchAction = "none";
    }

    _installStyleOnce() {
      if (document.getElementById("cpe-style")) return;
      const style = document.createElement("style");
      style.id = "cpe-style";
      style.textContent = `
        .cpe-overlay{position:absolute; inset:0; pointer-events:none;}
        .cpe-svg{position:absolute; inset:0; width:100%; height:100%; pointer-events:none;}
        .cpe-handle{
          position:absolute;
          width: var(--cpe-size,14px);
          height: var(--cpe-size,14px);
          border-radius:999px;
          transform: translate(-50%,-50%);
          pointer-events:auto;
          cursor: grab;
          background: linear-gradient(135deg, rgba(122,72,255,.95), rgba(55,165,255,.95));
          box-shadow: 0 10px 25px rgba(0,0,0,.35);
          border: var(--cpe-ring,2px) solid rgba(255,255,255,.65);
        }
        .cpe-handle:active{cursor: grabbing;}
        .cpe-handle.cpe-active{box-shadow: 0 0 0 4px rgba(110,175,255,.20), 0 10px 25px rgba(0,0,0,.35);}
        .cpe-label{
          position:absolute;
          transform: translate(10px,-12px);
          pointer-events:none;
          font: 12px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          color: rgba(238,240,255,.95);
          text-shadow: 0 2px 10px rgba(0,0,0,.6);
          background: rgba(0,0,0,.22);
          border: 1px solid rgba(170,140,255,.18);
          padding: 2px 6px;
          border-radius:999px;
        }
        .cpe-hint{
          position:absolute;
          left:10px;
          bottom:10px;
          pointer-events:none;
          font: 12px/1.35 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          color: rgba(238,240,255,.92);
          background: rgba(0,0,0,.22);
          border: 1px solid rgba(170,140,255,.18);
          padding: 6px 10px;
          border-radius: 12px;
          backdrop-filter: blur(2px);
        }
      `;
      document.head.appendChild(style);
    }

    _resolveInitialPoints() {
      if (Array.isArray(this.opts.initialPoints) && this.opts.initialPoints.length >= 3) {
        return this.opts.initialPoints;
      }
      if (this.opts.initialClipPath) {
        const parsed = parsePolygonClipPath(this.opts.initialClipPath);
        if (parsed) return this._parsedToPercent(parsed);
      }
      const computed = window.getComputedStyle(this.targetEl).clipPath;
      const parsed2 = parsePolygonClipPath(computed);
      if (parsed2) return this._parsedToPercent(parsed2);
      return [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ];
    }

    _parsedToPercent(parsedPoints) {
      const rect = this._targetRect();
      return parsedPoints.map(p => {
        const x = (p.xu === "px") ? (p.x / rect.w) * 100 : p.x;
        const y = (p.yu === "px") ? (p.y / rect.h) * 100 : p.y;
        return { x, y };
      });
    }

    _mount() {
      const overlay = document.createElement("div");
      overlay.className = "cpe-overlay";
      overlay.style.zIndex = String(this.opts.overlayZIndex);
      overlay.style.setProperty("--cpe-size", `${this.opts.handleSize}px`);
      overlay.style.setProperty("--cpe-ring", `${this.opts.handleRing}px`);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("cpe-svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("fill", "rgba(110,175,255,.10)");
      poly.setAttribute("stroke", "rgba(210,190,255,.65)");
      poly.setAttribute("stroke-width", "0.7");
      poly.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(poly);

      const hint = document.createElement("div");
      hint.className = "cpe-hint";

      overlay.appendChild(svg);
      overlay.appendChild(hint);

      this.mountEl.appendChild(overlay);

      this._overlay = overlay;
      this._svg = svg;
      this._svgPoly = poly;
      this._hintEl = hint;

      this._updateHint();
      this._overlay.style.cursor = this._addModeArmed ? "crosshair" : "";
    }

    _updateHint() {
      if (!this._hintEl) return;
      const addLine =
        this._addModeArmed
          ? "Add mode: click to insert points."
          : (this.opts.addPointMode === "dblclick" ? "Double-click to add a point." : "Use Add mode to insert points.");
      const removeLine =
        (this.opts.removePointMode === "altClick" || this.opts.removePointMode === "both")
          ? "Alt/Option-click a point to remove."
          : (this.opts.removePointMode === "contextMenu" || this.opts.removePointMode === "both")
            ? "Right-click a point to remove."
            : "";
      const snapLine = this.opts.snap ? `Snapping: ${this.opts.snapStep}%` : "Snapping: off";

      this._hintEl.innerHTML = `
        <div style="font-weight:700; margin-bottom:4px;">Polygon Editor</div>
        <div>${addLine}</div>
        ${removeLine ? `<div>${removeLine}</div>` : ""}
        <div>${snapLine}</div>
      `;
    }

    _attachEvents() {
      this._onClickCanvas = (e) => {
        // Only active when add mode is armed
        if (!this._addModeArmed) return;
        // Don't add if clicking on a handle
        if (e.target && e.target.closest && e.target.closest(".cpe-handle")) return;

        const pt = this._eventToPercent(e);
        if (!pt) return;
        this.addPointAtPercent(pt.x, pt.y);
      };

      this._onDblClick = (e) => {
        if (this.opts.addPointMode !== "dblclick") return;
        if (e.target && e.target.closest && e.target.closest(".cpe-handle")) return;

        const pt = this._eventToPercent(e);
        if (!pt) return;
        this.addPointAtPercent(pt.x, pt.y);
      };

      this._onPointerDown = (e) => {
        const h = e.target.closest(".cpe-handle");
        if (!h) return;

        const idx = Number(h.getAttribute("data-idx"));
        if (!Number.isFinite(idx)) return;

        const altPressed = e.altKey || e.metaKey;
        if ((this.opts.removePointMode === "altClick" || this.opts.removePointMode === "both") && altPressed) {
          e.preventDefault();
          e.stopPropagation();
          this.removePoint(idx);
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        this._activeIndex = idx;
        this._pointerId = e.pointerId;
        h.setPointerCapture?.(e.pointerId);
        h.classList.add("cpe-active");

        const pt = this._eventToPercent(e);
        if (pt) {
          const cur = this._points[idx];
          this._dragOffset.x = cur.x - pt.x;
          this._dragOffset.y = cur.y - pt.y;
        }

        if (typeof this.opts.onDragStart === "function") {
          this.opts.onDragStart({ index: idx, points: this.getPoints(), clipPath: this.getClipPath() });
        }
      };

      this._onPointerMove = (e) => {
        if (this._activeIndex < 0) return;
        if (this._pointerId !== null && e.pointerId !== this._pointerId) return;

        const pt = this._eventToPercent(e);
        if (!pt) return;

        const idx = this._activeIndex;
        const next = { x: pt.x + this._dragOffset.x, y: pt.y + this._dragOffset.y };
        this._points[idx] = this._normalizePoint(next);

        this._scheduleRender();
        this._applyClipToTarget();
        this._emitChange();
      };

      this._onPointerUp = (e) => {
        if (this._activeIndex < 0) return;
        if (this._pointerId !== null && e.pointerId !== this._pointerId) return;

        const idx = this._activeIndex;
        this._activeIndex = -1;
        this._pointerId = null;

        const active = this._overlay.querySelector(`.cpe-handle[data-idx="${idx}"]`);
        if (active) active.classList.remove("cpe-active");

        if (typeof this.opts.onDragEnd === "function") {
          this.opts.onDragEnd({ index: idx, points: this.getPoints(), clipPath: this.getClipPath() });
        }
      };

      this._onContextMenu = (e) => {
        if (!(this.opts.removePointMode === "contextMenu" || this.opts.removePointMode === "both")) return;
        const h = e.target.closest(".cpe-handle");
        if (!h) return;
        e.preventDefault();
        const idx = Number(h.getAttribute("data-idx"));
        if (!Number.isFinite(idx)) return;
        this.removePoint(idx);
      };

      this._onSelectStart = (e) => {
        if (!this.opts.preventTextSelection) return;
        if (this._activeIndex >= 0) e.preventDefault();
      };

      // overlay itself does not accept pointer events except handles, so
      // we attach click listeners to mountEl but gate on "overlay exists" + "editing"
      this.mountEl.addEventListener("click", this._onClickCanvas, { passive: true });
      this.mountEl.addEventListener("dblclick", this._onDblClick, { passive: true });

      this._overlay.addEventListener("pointerdown", this._onPointerDown, { passive: false });
      window.addEventListener("pointermove", this._onPointerMove, { passive: true });
      window.addEventListener("pointerup", this._onPointerUp, { passive: true });

      this._overlay.addEventListener("contextmenu", this._onContextMenu, { passive: false });
      document.addEventListener("selectstart", this._onSelectStart, { passive: false });
    }

    _detachEvents() {
      if (!this.mountEl || !this._overlay) return;

      this.mountEl.removeEventListener("click", this._onClickCanvas);
      this.mountEl.removeEventListener("dblclick", this._onDblClick);

      this._overlay.removeEventListener("pointerdown", this._onPointerDown);
      window.removeEventListener("pointermove", this._onPointerMove);
      window.removeEventListener("pointerup", this._onPointerUp);

      this._overlay.removeEventListener("contextmenu", this._onContextMenu);
      document.removeEventListener("selectstart", this._onSelectStart);
    }

    _observeResize() {
      if (!("ResizeObserver" in window)) return;
      this._ro = new ResizeObserver(() => this._scheduleRender());
      this._ro.observe(this.mountEl);
      if (this.targetEl !== this.mountEl) this._ro.observe(this.targetEl);
    }

    _unobserveResize() {
      if (this._ro) { try { this._ro.disconnect(); } catch {} }
      this._ro = null;
    }

    _targetRect() {
      const r = this.targetEl.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height), left: r.left, top: r.top };
    }

    _mountRect() {
      const r = this.mountEl.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height), left: r.left, top: r.top };
    }

    _eventToPercent(e) {
      // Map pointer to targetEl percent space, regardless of where overlay is mounted.
      const tr = this._targetRect();
      const xPx = e.clientX - tr.left;
      const yPx = e.clientY - tr.top;

      let x = (xPx / tr.w) * 100;
      let y = (yPx / tr.h) * 100;

      if (this.opts.clampToBounds) {
        x = clamp(x, 0, 100);
        y = clamp(y, 0, 100);
      }
      return { x, y };
    }

    _normalizePoint(p) {
      let x = Number(p.x);
      let y = Number(p.y);
      if (!Number.isFinite(x)) x = 0;
      if (!Number.isFinite(y)) y = 0;

      if (this.opts.clampToBounds) {
        x = clamp(x, 0, 100);
        y = clamp(y, 0, 100);
      }

      if (this.opts.snap) {
        x = this._snapValue(x);
        y = this._snapValue(y);
        if (this.opts.snapToEdges) {
          x = this._snapEdge(x);
          y = this._snapEdge(y);
        }
      } else if (this.opts.snapToEdges) {
        x = this._snapEdge(x);
        y = this._snapEdge(y);
      }

      return { x, y };
    }

    _snapValue(v) {
      const step = Math.max(0.5, Number(this.opts.snapStep) || 5);
      return Math.round(v / step) * step;
    }

    _snapEdge(v) {
      const t = Number(this.opts.snapEdgeThreshold) || 0;
      if (t <= 0) return v;
      if (Math.abs(v - 0) <= t) return 0;
      if (Math.abs(v - 50) <= t) return 50;
      if (Math.abs(v - 100) <= t) return 100;
      return v;
    }

    _bestInsertIndex(p) {
      if (this._points.length < 2) return this._points.length;
      let best = { idx: this._points.length, d: Infinity };
      for (let i = 0; i < this._points.length; i++) {
        const a = this._points[i];
        const b = this._points[(i + 1) % this._points.length];
        const d = distancePointToSegment(p, a, b);
        if (d < best.d) best = { idx: i + 1, d };
      }
      return best.idx;
    }

    _applyClipToTarget() {
      // IMPORTANT: apply to targetEl, not mountEl
      this.targetEl.style.clipPath = this.getClipPath();
    }

    _scheduleRender() {
      if (this._dirty) return;
      this._dirty = true;
      cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => {
        this._dirty = false;
        this._renderAll(false);
      });
    }

    _renderAll(initial) {
      this._renderHandles(initial);
      this._renderOutline();
    }

    _renderOutline() {
      if (!this._svgPoly) return;
      const pts = this._points.map(p => `${p.x},${p.y}`).join(" ");
      this._svgPoly.setAttribute("points", pts);
    }

    _renderHandles(initial) {
      const need = this._points.length;

      while (this._handles.length < need) {
        const h = document.createElement("div");
        h.className = "cpe-handle";
        h.setAttribute("role", "button");
        h.tabIndex = 0;

        h.addEventListener("keydown", (e) => {
          const i = Number(h.getAttribute("data-idx"));
          if (!Number.isFinite(i)) return;
          const step = e.shiftKey ? 2 : 0.5;
          let dx = 0, dy = 0;
          if (e.key === "ArrowLeft") dx = -step;
          else if (e.key === "ArrowRight") dx = step;
          else if (e.key === "ArrowUp") dy = -step;
          else if (e.key === "ArrowDown") dy = step;
          else if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            this.removePoint(i);
            return;
          } else return;

          e.preventDefault();
          const p = this._points[i];
          this._points[i] = this._normalizePoint({ x: p.x + dx, y: p.y + dy });
          this._scheduleRender();
          this._applyClipToTarget();
          this._emitChange();
        });

        this._overlay.appendChild(h);
        this._handles.push(h);

        if (this.opts.showLabels) {
          const lab = document.createElement("div");
          lab.className = "cpe-label";
          this._overlay.appendChild(lab);
          this._labels.push(lab);
        }
      }

      while (this._handles.length > need) {
        const h = this._handles.pop();
        h.parentNode && h.parentNode.removeChild(h);
        if (this._labels.length) {
          const lab = this._labels.pop();
          lab.parentNode && lab.parentNode.removeChild(lab);
        }
      }

      this._handles.forEach((h, i) => {
        h.setAttribute("data-idx", String(i));
        h.setAttribute("aria-label", `Polygon point ${i + 1}`);
      });

      // Position handles relative to target rect BUT using mount overlay coordinates.
      // If mountEl and targetEl share same box, this aligns perfectly.
      // If not, we compute offset from mount to target.
      const mr = this._mountRect();
      const tr = this._targetRect();
      const offsetX = tr.left - mr.left;
      const offsetY = tr.top - mr.top;

      for (let i = 0; i < need; i++) {
        const p = this._points[i];
        const left = offsetX + (p.x / 100) * tr.w;
        const top = offsetY + (p.y / 100) * tr.h;

        const h = this._handles[i];
        h.style.left = `${left}px`;
        h.style.top = `${top}px`;

        if (this.opts.showLabels && this._labels[i]) {
          const txt = this.opts.labelMode === "letter" ? letterLabel(i) : String(i + 1);
          this._labels[i].textContent = txt;
          this._labels[i].style.left = `${left}px`;
          this._labels[i].style.top = `${top}px`;
        }
      }
    }

    _emitChange() {
      if (typeof this.opts.onChange === "function") {
        this.opts.onChange({ clipPath: this.getClipPath(), points: this.getPoints() });
      }
    }
  }

  function distancePointToSegment(p, a, b) {
    const px = p.x, py = p.y;
    const ax = a.x, ay = a.y;
    const bx = b.x, by = b.y;
    const abx = bx - ax, aby = by - ay;
    const apx = px - ax, apy = py - ay;
    const abLen2 = abx * abx + aby * aby;
    if (abLen2 === 0) {
      const dx = px - ax, dy = py - ay;
      return Math.sqrt(dx * dx + dy * dy);
    }
    let t = (apx * abx + apy * aby) / abLen2;
    t = clamp(t, 0, 1);
    const cx = ax + t * abx;
    const cy = ay + t * aby;
    const dx = px - cx, dy = py - cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const ClipPolygonEditor = {
    attach(opts) { return new ClipPolygonEditorInstance(opts); },
    parsePolygonClipPath,
    toPolygonString,
  };

  window.ClipPolygonEditor = ClipPolygonEditor;
})();
