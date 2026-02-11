/* clip_polygon_editor.js
   Drag-and-drop polygon editor for CSS clip-path polygons.
   Drop-in tool designed for responsive containers (any window size).

   What it does:
   - Renders draggable handles on top of a preview element.
   - Converts handle positions to percent coordinates (0–100).
   - Generates a polygon(...) clip-path string.
   - Lets users add points (double-click), remove points (Alt/Option+click or context menu),
     and snap to grid/edges (optional).
   - Works with mouse, touch, and pen via Pointer Events.
   - Uses ResizeObserver to stay correct on container resizes.

   Quick integration (typical):
     const editor = ClipPolygonEditor.attach({
       previewEl: document.querySelector("#ctpPreviewLayerPoints"),
       // optional: start from existing clip-path
       initialClipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
       onChange: ({ clipPath, points }) => {
         // apply to your layer UI / textarea
         document.querySelector("#ctpPolygonOut").value = clipPath;
       }
     });

   Works best when the preview element is positioned (relative/absolute) inside a fixed-size preview box.
*/

(function () {
  "use strict";

  const DEFAULTS = {
    handleSize: 14,        // px diameter
    handleRing: 2,         // px outline thickness
    minPoints: 3,
    maxPoints: 64,
    clampToBounds: true,
    snap: false,
    snapStep: 5,           // percent
    snapToEdges: true,
    snapEdgeThreshold: 2,  // percent
    showLabels: false,
    labelMode: "index",    // index | letter
    // Editing affordances:
    addPointMode: "dblclick", // dblclick | buttonOnly (you can call addPointAt)
    removePointMode: "altClick", // altClick | contextMenu | both
    addPointOnClickWhenArmed: true,
    // Visual:
    overlayZIndex: 30,
    // Behavior:
    preventTextSelection: true,
    // Callback: (payload) => void
    onChange: null,
    // Callback when editing begins/ends
    onDragStart: null,
    onDragEnd: null,
  };

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  function isFiniteNumber(v) {
    return typeof v === "number" && Number.isFinite(v);
  }

  function parsePolygonClipPath(str) {
    if (!str) return null;
    let s = String(str).trim();
    s = s.replace(/^clip-path\s*:\s*/i, "").replace(/;$/, "").trim();
    if (!/^polygon\s*\(/i.test(s)) return null;

    const inside = s.replace(/^polygon\s*\(/i, "").replace(/\)\s*$/, "").trim();
    // Split by commas not inside parentheses (we don't expect nested, but keep robust).
    const parts = inside.split(/\s*,\s*/).filter(Boolean);
    const points = [];

    for (const part of parts) {
      // Accept "x y" where x/y are numbers with optional % or px. We'll normalize to percent if possible.
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

    // If any unit isn't %, keep it but caller likely wants percent output. We'll convert later using box size.
    return points;
  }

  function toPolygonString(pointsPercent) {
    const pts = pointsPercent.map(p => `${round2(p.x)}% ${round2(p.y)}%`);
    return `polygon(${pts.join(", ")})`;
  }

  function letterLabel(i) {
    // A, B, C ... Z, AA, AB ...
    let n = i;
    let out = "";
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
      if (!this.opts || !this.opts.previewEl) {
        throw new Error("ClipPolygonEditor.attach requires { previewEl }");
      }

      this.previewEl = this.opts.previewEl;
      this._ensurePositioning();
      this._installStyleOnce();

      this._overlay = null;
      this._svg = null;
      this._handles = [];
      this._labels = [];
      this._points = []; // stored as percent: [{x,y}]
      this._activeIndex = -1;
      this._pointerId = null;
      this._addMode = false;
      this._dragOffset = { x: 0, y: 0 };

      this._ro = null;
      this._raf = 0;
      this._dirty = false;

      // init points
      const init = this._resolveInitialPoints();
      this.setPoints(init);

      this._mount();
      this._attachEvents();
      this._observeResize();
      this._renderAll(true);
      this._emitChange();
    }

    destroy() {
      this._detachEvents();
      this._unobserveResize();
      if (this._overlay && this._overlay.parentNode) this._overlay.parentNode.removeChild(this._overlay);
      this._overlay = this._svg = null;
      this._handles = [];
      this._labels = [];
      this._points = [];
    }

    getPoints() {
      return this._points.map(p => ({ x: p.x, y: p.y }));
    }

    getClipPath() {
      return toPolygonString(this._points);
    }

    setClipPath(clipPath) {
      const parsed = parsePolygonClipPath(clipPath);
      if (!parsed) return false;

      // Convert parsed points to percent relative to preview box
      const rect = this._rect();
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

      // Ensure minimum points
      const base = cleaned.length >= this.opts.minPoints ? cleaned : [
        { x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }
      ];

      // Clamp + snap
      this._points = base.slice(0, this.opts.maxPoints).map(p => this._normalizePoint(p));

      this._scheduleRender();
      this._emitChange();
    }

    addPointAtPercent(x, y, index = null) {
      if (this._points.length >= this.opts.maxPoints) return false;

      const p = this._normalizePoint({ x, y });
      if (index === null || index === undefined || index < 0 || index > this._points.length) {
        // Insert near the closest edge by default
        const insertAt = this._bestInsertIndex(p);
        this._points.splice(insertAt, 0, p);
      } else {
        this._points.splice(index, 0, p);
      }

      this._scheduleRender();
      this._emitChange();
      return true;
    }

    removePoint(index) {
      if (this._points.length <= this.opts.minPoints) return false;
      if (index < 0 || index >= this._points.length) return false;
      this._points.splice(index, 1);
      this._scheduleRender();
      this._emitChange();
      return true;
    }


    isAddMode() { return !!this._addMode; }

    setAddMode(enabled) {
      this._addMode = !!enabled;
      if (this._hintEl) this._hintEl.innerHTML = this._hintHTML();
      // Optional cursor hint
      if (this._overlay) {
        this._overlay.style.cursor = this._addMode ? "crosshair" : "default";
      }
    }

    // ---------------------------
    // Internals
    // ---------------------------
    _ensurePositioning() {
      // Overlay must align with preview element box; ensure preview's container is positioned.
      const cs = window.getComputedStyle(this.previewEl);
      if (cs.position === "static") {
        this.previewEl.style.position = "relative";
      }
      // Ensure it can receive pointer events (overlay handles will)
      if (!this.previewEl.style.touchAction) {
        this.previewEl.style.touchAction = "none";
      }
    }

    _installStyleOnce() {
      if (document.getElementById("cpe-style")) return;
      const style = document.createElement("style");
      style.id = "cpe-style";
      style.textContent = `
        .cpe-overlay {
          position:absolute;
          inset:0;
          pointer-events:none; /* handles enable events */
        }
        .cpe-svg {
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          pointer-events:none;
        }
        .cpe-handle {
          position:absolute;
          width: var(--cpe-size, 14px);
          height: var(--cpe-size, 14px);
          border-radius: 999px;
          transform: translate(-50%, -50%);
          pointer-events:auto;
          cursor: grab;
          background: linear-gradient(135deg, rgba(122,72,255,.95), rgba(55,165,255,.95));
          box-shadow: 0 10px 25px rgba(0,0,0,.35);
          border: var(--cpe-ring, 2px) solid rgba(255,255,255,.65);
        }
        .cpe-handle:active { cursor: grabbing; }
        .cpe-handle.cpe-active { box-shadow: 0 0 0 4px rgba(110,175,255,.20), 0 10px 25px rgba(0,0,0,.35); }
        .cpe-label {
          position:absolute;
          transform: translate(10px, -12px);
          pointer-events:none;
          font: 12px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          color: rgba(238,240,255,.95);
          text-shadow: 0 2px 10px rgba(0,0,0,.6);
          background: rgba(0,0,0,.22);
          border: 1px solid rgba(170,140,255,.18);
          padding: 2px 6px;
          border-radius: 999px;
        }
        .cpe-hint {
          position:absolute;
          left: 10px;
          bottom: 10px;
          pointer-events:none;
          font: 12px/1.35 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          color: rgba(238,240,255,.92);
          background: rgba(0,0,0,.22);
          border: 1px solid rgba(170,140,255,.18);
          padding: 6px 10px;
          border-radius: 12px;
          backdrop-filter: blur(2px);
        }
        .cpe-btnrow {
          position:absolute;
          right: 10px;
          bottom: 10px;
          display:flex;
          gap: 8px;
          pointer-events:auto;
        }
        .cpe-mini-btn {
          height: 30px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid rgba(170,140,255,.22);
          background: rgba(255,255,255,.06);
          color: rgba(238,240,255,.95);
          cursor: pointer;
          font-size: 12px;
        }
        .cpe-mini-btn:hover { background: rgba(255,255,255,.10); }
      `;
      document.head.appendChild(style);
    }

    _resolveInitialPoints() {
      // Priority: initialPoints -> initialClipPath -> current computed clip-path -> default diamond
      if (Array.isArray(this.opts.initialPoints) && this.opts.initialPoints.length >= 3) {
        return this.opts.initialPoints;
      }

      if (this.opts.initialClipPath) {
        const parsed = parsePolygonClipPath(this.opts.initialClipPath);
        if (parsed) return this._parsedToPercent(parsed);
      }

      const computed = window.getComputedStyle(this.previewEl).clipPath;
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
      const rect = this._rect();
      return parsedPoints.map(p => {
        const x = (p.xu === "px") ? (p.x / rect.w) * 100 : p.x;
        const y = (p.yu === "px") ? (p.y / rect.h) * 100 : p.y;
        return { x, y };
      });
    }

    _mount() {
      // overlay attaches to previewEl and uses absolute positioning.
      const overlay = document.createElement("div");
      overlay.className = "cpe-overlay";
      overlay.style.zIndex = String(this.opts.overlayZIndex);
      overlay.style.setProperty("--cpe-size", `${this.opts.handleSize}px`);
      overlay.style.setProperty("--cpe-ring", `${this.opts.handleRing}px`);

      // SVG for polygon outline
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

      // Hint + buttons
      const hint = document.createElement("div");
      hint.className = "cpe-hint";
      hint.innerHTML = this._hintHTML();

      const btnRow = document.createElement("div");
      btnRow.className = "cpe-btnrow";
      btnRow.innerHTML = `
        <button type="button" class="cpe-mini-btn" data-cpe-action="addtoggle">Add</button>
        <button type="button" class="cpe-mini-btn" data-cpe-action="copy">Copy</button>
        <button type="button" class="cpe-mini-btn" data-cpe-action="reset">Reset</button>
      `;

      overlay.appendChild(svg);
      overlay.appendChild(hint);
      overlay.appendChild(btnRow);

      // ensure previewEl can position overlay
      const cs = window.getComputedStyle(this.previewEl);
      if (cs.position === "static") this.previewEl.style.position = "relative";
      this.previewEl.appendChild(overlay);

      this._overlay = overlay;
      this._svg = svg;
      this._svgPoly = poly;
      this._hintEl = hint;
    }

    _hintHTML() {
      const add = (this.opts.addPointMode === "dblclick") ? "Double‑click to add a point." : "Use Add API to insert points.";
      const remove = (this.opts.removePointMode === "altClick" || this.opts.removePointMode === "both")
        ? "Alt/Option‑click a point to remove."
        : (this.opts.removePointMode === "contextMenu" || this.opts.removePointMode === "both")
          ? "Right‑click a point to remove."
          : "";
      const snap = this.opts.snap ? `Snapping: ${this.opts.snapStep}%` : "Snapping: off";
      return `
        <div style="font-weight:700; margin-bottom:4px;">Polygon Editor</div>
        <div>${add}</div>
        ${remove ? `<div>${remove}</div>` : ""}
        <div>${snap}</div>
      `;
    }

    _attachEvents() {
      // point creation
      this._onDblClick = (e) => {
        if (this.opts.addPointMode !== "dblclick") return;
        // Only if double-click on empty space (not a handle)
        if (e.target && e.target.classList && e.target.classList.contains("cpe-handle")) return;

        const pt = this._eventToPercent(e);
        if (!pt) return;
        this.addPointAtPercent(pt.x, pt.y);
      };

      // copy/reset buttons
      this._onOverlayClick = (e) => {
        // If user is in "add mode" and clicked on empty canvas, add point at click.
        if (this._addMode && this.opts.addPointOnClickWhenArmed) {
          const isHandle = e.target && e.target.classList && e.target.classList.contains("cpe-handle");
          const isButton = !!e.target.closest("[data-cpe-action]");
          if (!isHandle && !isButton) {
            e.preventDefault();
            const pt = this._eventToPercent(e);
            if (pt) this.addPointAtPercent(pt.x, pt.y);
            return;
          }
        }

        const btn = e.target.closest("[data-cpe-action]");
        if (!btn) return;

        e.preventDefault();
        const action = btn.getAttribute("data-cpe-action");
        if (action === "copy") this._copyClipPath();
        if (action === "reset") this._reset();
        if (action === "addtoggle") this.setAddMode(!this._addMode);
      };

      // handle pointer events (delegated)
      this._onPointerDown = (e) => {
        const h = e.target.closest(".cpe-handle");
        if (!h) return;

        const idx = Number(h.getAttribute("data-idx"));
        if (!Number.isFinite(idx)) return;

        // remove point affordance
        const altPressed = e.altKey || e.metaKey; // meta as fallback for mac users who expect cmd
        if ((this.opts.removePointMode === "altClick" || this.opts.removePointMode === "both") && altPressed) {
          e.preventDefault();
          e.stopPropagation();
          this.removePoint(idx);
          return;
        }

        // start drag
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
        const next = {
          x: pt.x + this._dragOffset.x,
          y: pt.y + this._dragOffset.y,
        };

        this._points[idx] = this._normalizePoint(next);
        this._scheduleRender();
        this._emitChange();
      };

      this._onPointerUp = (e) => {
        if (this._activeIndex < 0) return;
        if (this._pointerId !== null && e.pointerId !== this._pointerId) return;

        const idx = this._activeIndex;
        this._activeIndex = -1;
        this._pointerId = null;
      this._addMode = false;

        // clear handle active state
        const active = this._overlay.querySelector(`.cpe-handle[data-idx="${idx}"]`);
        if (active) active.classList.remove("cpe-active");

        if (typeof this.opts.onDragEnd === "function") {
          this.opts.onDragEnd({ index: idx, points: this.getPoints(), clipPath: this.getClipPath() });
        }
      };

      // context menu removal
      this._onContextMenu = (e) => {
        if (!(this.opts.removePointMode === "contextMenu" || this.opts.removePointMode === "both")) return;
        const h = e.target.closest(".cpe-handle");
        if (!h) return;
        e.preventDefault();
        const idx = Number(h.getAttribute("data-idx"));
        if (!Number.isFinite(idx)) return;
        this.removePoint(idx);
      };

      // prevent selection while dragging, keeps UX clean
      this._onSelectStart = (e) => {
        if (!this.opts.preventTextSelection) return;
        if (this._activeIndex >= 0) {
          e.preventDefault();
        }
      };

      this._overlay.addEventListener("dblclick", this._onDblClick, { passive: false });
      this._overlay.addEventListener("click", this._onOverlayClick, { passive: false });

      this._overlay.addEventListener("pointerdown", this._onPointerDown, { passive: false });
      window.addEventListener("pointermove", this._onPointerMove, { passive: true });
      window.addEventListener("pointerup", this._onPointerUp, { passive: true });

      this._overlay.addEventListener("contextmenu", this._onContextMenu, { passive: false });

      document.addEventListener("selectstart", this._onSelectStart, { passive: false });
    }

    _detachEvents() {
      if (!this._overlay) return;

      this._overlay.removeEventListener("dblclick", this._onDblClick);
      this._overlay.removeEventListener("click", this._onOverlayClick);

      this._overlay.removeEventListener("pointerdown", this._onPointerDown);
      window.removeEventListener("pointermove", this._onPointerMove);
      window.removeEventListener("pointerup", this._onPointerUp);

      this._overlay.removeEventListener("contextmenu", this._onContextMenu);

      document.removeEventListener("selectstart", this._onSelectStart);
    }

    _observeResize() {
      if (!("ResizeObserver" in window)) return;
      this._ro = new ResizeObserver(() => this._scheduleRender());
      this._ro.observe(this.previewEl);
    }

    _unobserveResize() {
      if (this._ro) {
        try { this._ro.disconnect(); } catch {}
      }
      this._ro = null;
    }

    _rect() {
      const r = this.previewEl.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height), left: r.left, top: r.top };
    }

    _eventToPercent(e) {
      const rect = this._rect();
      const xPx = e.clientX - rect.left;
      const yPx = e.clientY - rect.top;

      let x = (xPx / rect.w) * 100;
      let y = (yPx / rect.h) * 100;

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
        // if snap off but edges enabled, still nudge near edges (nice UX)
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
      // Choose the polygon edge (i -> i+1) closest to p, insert after i.
      // Works well for adding points by double-clicking on the edge.
      if (this._points.length < 2) return this._points.length;

      const target = p;
      let best = { idx: this._points.length, d: Infinity };

      for (let i = 0; i < this._points.length; i++) {
        const a = this._points[i];
        const b = this._points[(i + 1) % this._points.length];
        const d = distancePointToSegment(target, a, b);
        if (d < best.d) best = { idx: i + 1, d };
      }
      return best.idx;
    }

    _reset() {
      this.setPoints([
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ]);
    }

    _copyClipPath() {
      const text = this.getClipPath();
      copyText(text);
      // Provide light feedback via callback if user wants
      if (typeof this.opts.onChange === "function") {
        this.opts.onChange({ clipPath: text, points: this.getPoints(), copied: true });
      }
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
      // Ensure handle DOM count matches point count
      const need = this._points.length;

      // Create missing
      while (this._handles.length < need) {
        const idx = this._handles.length;
        const h = document.createElement("div");
        h.className = "cpe-handle";
        h.setAttribute("data-idx", String(idx));
        h.setAttribute("role", "button");
        h.setAttribute("aria-label", `Polygon point ${idx + 1}`);
        h.tabIndex = 0;

        // keyboard support: arrow keys nudge point
        h.addEventListener("keydown", (e) => {
          const i = Number(h.getAttribute("data-idx"));
          if (!Number.isFinite(i)) return;
          const step = e.shiftKey ? 2 : 0.5; // percent
          let dx = 0, dy = 0;
          if (e.key === "ArrowLeft") dx = -step;
          else if (e.key === "ArrowRight") dx = step;
          else if (e.key === "ArrowUp") dy = -step;
          else if (e.key === "ArrowDown") dy = step;
          else if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            this.removePoint(i);
            return;
          } else {
            return;
          }
          e.preventDefault();
          const p = this._points[i];
          this._points[i] = this._normalizePoint({ x: p.x + dx, y: p.y + dy });
          this._scheduleRender();
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

      // Remove extras
      while (this._handles.length > need) {
        const h = this._handles.pop();
        h.parentNode && h.parentNode.removeChild(h);
        if (this._labels.length) {
          const lab = this._labels.pop();
          lab.parentNode && lab.parentNode.removeChild(lab);
        }
      }

      // Update idx attributes (after insertion/removal)
      this._handles.forEach((h, i) => h.setAttribute("data-idx", String(i)));

      // Position handles
      const rect = this._rect();
      for (let i = 0; i < need; i++) {
        const p = this._points[i];
        const left = (p.x / 100) * rect.w;
        const top = (p.y / 100) * rect.h;
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

      // On initial mount, keep overlay pointer-events handling crisp
      if (initial && this.opts.preventTextSelection) {
        // do nothing additional
      }
    }

    _emitChange() {
      if (typeof this.opts.onChange === "function") {
        this.opts.onChange({
          clipPath: this.getClipPath(),
          points: this.getPoints(),
        });
      }
    }
  }

  // Distance from point P to segment AB in percent space
  function distancePointToSegment(p, a, b) {
    const px = p.x, py = p.y;
    const ax = a.x, ay = a.y;
    const bx = b.x, by = b.y;

    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;

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

  async function copyText(text) {
    const t = String(text || "").trim();
    if (!t) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(t);
      } else {
        const ta = document.createElement("textarea");
        ta.value = t;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      return true;
    } catch {
      return false;
    }
  }

  // Public API
  const ClipPolygonEditor = {
    attach(opts) {
      return new ClipPolygonEditorInstance(opts);
    },
    parsePolygonClipPath,
    toPolygonString,
  };

  window.ClipPolygonEditor = ClipPolygonEditor;
})();
