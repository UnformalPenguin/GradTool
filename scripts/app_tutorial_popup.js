/* app_tutorial_popup.js
   GradTool — Application Tutorial Modal (workflow + expert guidelines)
   Compatible with popup.css (shared modal theme).

   Requirements:
     <link rel="stylesheet" href="popup.css">

   Usage:
     <script src="app_tutorial_popup.js"></script>
     showAppTutorialPopup()
     showAppTutorialPopup({ initialSection: "gradients" })
*/

(function () {
  "use strict";

  window.showAppTutorialPopup = function showAppTutorialPopup(options = {}) {
    GradToolAppTutorial.open(options);
  };
  window.hideAppTutorialPopup = function hideAppTutorialPopup() {
    GradToolAppTutorial.close();
  };

  const GradToolAppTutorial = {
    _isOpen: false,
    _root: null,
    _backdrop: null,
    _dialog: null,
    _lastActiveEl: null,
    _opts: null,

    open(options = {}) {
      if (this._isOpen) return;

      this._opts = {
        initialSection: options.initialSection || "overview", // overview | ui | layers | gradients | stops | clips | animations | export | troubleshooting | recipes
      };

      this._lastActiveEl = document.activeElement;

      this._build();
      this._attachEvents();
      this._isOpen = true;

      document.documentElement.classList.add("gtp-scroll-lock");
      this._setSection(this._opts.initialSection);
        this._initGradientLab();

      const focusable = this._getFocusable(this._dialog);
      (focusable[0] || this._dialog).focus();
    },

    close() {
      if (!this._isOpen) return;

      this._detachEvents();

      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }

      document.documentElement.classList.remove("gtp-scroll-lock");

      try { this._lastActiveEl?.focus(); } catch {}

      this._root = null;
      this._backdrop = null;
      this._dialog = null;
      this._lastActiveEl = null;
      this._isOpen = false;
    },

    _build() {
      const root = document.createElement("div");
      root.className = "gtp-root";
      root.setAttribute("aria-hidden", "false");

      const backdrop = document.createElement("div");
      backdrop.className = "gtp-backdrop";
      backdrop.tabIndex = -1;

      const dialog = document.createElement("div");
      dialog.className = "gtp-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "agt-title");
      dialog.tabIndex = -1;

      dialog.innerHTML = this._templateHTML();

      root.appendChild(backdrop);
      root.appendChild(dialog);
      document.body.appendChild(root);

      this._root = root;
      this._backdrop = backdrop;
      this._dialog = dialog;
      },

      _initGradientLab() {
          const preset = this._dialog.querySelector("#agtGradPreset");
          const type = this._dialog.querySelector("#agtGradType");
          const angle = this._dialog.querySelector("#agtGradAngle");
          const x = this._dialog.querySelector("#agtGradPosX");
          const y = this._dialog.querySelector("#agtGradPosY");
          const size = this._dialog.querySelector("#agtGradSize");
          const shape = this._dialog.querySelector("#agtGradShape");
          const stops = this._dialog.querySelector("#agtGradStops");
          const second = this._dialog.querySelector("#agtGradSecond");

          if (!preset || !type || !angle || !x || !y || !size || !shape || !stops || !second) return;

          // Default load
          this._gradLoadPreset(preset.value);

          const debouncedApply = (() => {
              let t = null;
              return () => {
                  clearTimeout(t);
                  t = setTimeout(() => this._gradApplyFromInputs(), 120);
              };
          })();

          [type, angle, x, y, size, shape, second].forEach(el => el.addEventListener("input", debouncedApply));
          stops.addEventListener("input", debouncedApply);
      },

      _gradPresets() {
          return {
              softGlow: {
                  type: "radial",
                  angle: 45,
                  x: 35,
                  y: 32,
                  size: "farthest-corner",
                  shape: "circle",
                  stops: [
                      "rgba(190,110,255,.92) 0%",
                      "rgba(190,110,255,.28) 35%",
                      "rgba(190,110,255,0) 62%"
                  ],
                  second: "off"
              },
              rimRing: {
                  type: "radial",
                  angle: 0,
                  x: 50,
                  y: 50,
                  size: "farthest-side",
                  shape: "circle",
                  stops: [
                      "rgba(0,0,0,0) 52%",
                      "rgba(90,180,255,.78) 58%",
                      "rgba(0,0,0,0) 70%"
                  ],
                  second: "off"
              },
              panelSweep: {
                  type: "linear",
                  angle: 120,
                  x: 50,
                  y: 50,
                  size: "farthest-corner",
                  shape: "circle",
                  stops: [
                      "rgba(190,110,255,.70) 0%",
                      "rgba(90,180,255,.40) 35%",
                      "rgba(0,0,0,0) 72%"
                  ],
                  second: "linear-sheen"
              },
              spectralSpin: {
                  type: "conic",
                  angle: 10,
                  x: 50,
                  y: 50,
                  size: "farthest-corner",
                  shape: "circle",
                  stops: [
                      "rgba(190,110,255,.92) 0%",
                      "rgba(90,180,255,.90) 32%",
                      "rgba(210,120,255,.90) 64%",
                      "rgba(190,110,255,.92) 100%"
                  ],
                  second: "off"
              },
              scanlines: {
                  type: "repeating-linear",
                  angle: 90,
                  x: 50,
                  y: 50,
                  size: "farthest-corner",
                  shape: "circle",
                  stops: [
                      "rgba(255,255,255,.10) 0px",
                      "rgba(255,255,255,.10) 2px",
                      "rgba(0,0,0,0) 2px",
                      "rgba(0,0,0,0) 8px"
                  ],
                  second: "off"
              },
              halftone: {
                  type: "repeating-radial",
                  angle: 0,
                  x: 50,
                  y: 50,
                  size: "closest-side",
                  shape: "circle",
                  stops: [
                      "rgba(255,255,255,.08) 0px",
                      "rgba(255,255,255,.08) 3px",
                      "rgba(0,0,0,0) 3px",
                      "rgba(0,0,0,0) 10px"
                  ],
                  second: "off"
              },
              stackedNebula: {
                  type: "radial",
                  angle: 0,
                  x: 30,
                  y: 30,
                  size: "farthest-corner",
                  shape: "circle",
                  stops: [
                      "rgba(190,110,255,.82) 0%",
                      "rgba(190,110,255,.20) 40%",
                      "rgba(190,110,255,0) 68%"
                  ],
                  second: "radial-accent"
              }
          };
      },

      _gradLoadPreset(key) {
          const p = this._gradPresets()[key];
          if (!p) return;

          const set = (id, v) => {
              const el = this._dialog.querySelector(id);
              if (!el) return;
              if (el.tagName === "SELECT") el.value = String(v);
              else el.value = String(v);
          };

          set("#agtGradType", p.type);
          set("#agtGradAngle", p.angle);
          set("#agtGradPosX", p.x);
          set("#agtGradPosY", p.y);
          set("#agtGradSize", p.size);
          set("#agtGradShape", p.shape);
          set("#agtGradSecond", p.second);

          const stopsEl = this._dialog.querySelector("#agtGradStops");
          if (stopsEl) stopsEl.value = p.stops.join("\n");

          this._gradApplyFromInputs(true);
      },

      _gradApplyFromInputs(silent = false) {
          const type = this._dialog.querySelector("#agtGradType")?.value || "radial";
          const angle = this._num("#agtGradAngle", 45);
          const x = this._clamp(this._num("#agtGradPosX", 50), 0, 100);
          const y = this._clamp(this._num("#agtGradPosY", 50), 0, 100);
          const size = this._dialog.querySelector("#agtGradSize")?.value || "farthest-corner";
          const shape = this._dialog.querySelector("#agtGradShape")?.value || "circle";
          const second = this._dialog.querySelector("#agtGradSecond")?.value || "off";
          const stopsRaw = this._dialog.querySelector("#agtGradStops")?.value || "";

          const stops = stopsRaw
              .split("\n")
              .map(s => s.trim())
              .filter(Boolean);

          const g1 = this._buildGradient(type, { angle, x, y, size, shape, stops });
          const g2 = this._buildSecondGradient(second, { x, y });

          const background = g2 ? `${g1}, ${g2}` : g1;

          const layer = this._dialog.querySelector("#agtGradPreviewLayer");
          if (layer) {
              layer.style.background = background;
              layer.style.borderRadius = "16px";
          }

          const css = [
              "/* Example: single layer background */",
              `.layer {`,
              `  background: ${background};`,
              `}`
          ].join("\n");

          const out = this._dialog.querySelector("#agtGradCssOut");
          if (out) out.value = css;

          if (!silent) this._setGradStatus("Applied.");
      },

      _buildGradient(type, p) {
          const stops = (p.stops && p.stops.length) ? p.stops.join(", ") : "rgba(190,110,255,.9), rgba(0,0,0,0)";
          const at = `at ${p.x}% ${p.y}%`;

          switch (type) {
              case "linear":
                  return `linear-gradient(${p.angle}deg, ${stops})`;
              case "conic":
                  return `conic-gradient(from ${p.angle}deg ${at}, ${stops})`;
              case "repeating-linear":
                  return `repeating-linear-gradient(${p.angle}deg, ${stops})`;
              case "repeating-radial":
                  return `repeating-radial-gradient(${p.shape} ${p.size} ${at}, ${stops})`;
              case "radial":
              default:
                  return `radial-gradient(${p.shape} ${p.size} ${at}, ${stops})`;
          }
      },

      _buildSecondGradient(mode, p) {
          if (!mode || mode === "off") return "";

          if (mode === "radial-accent") {
              return `radial-gradient(circle at ${Math.min(95, p.x + 40)}% ${Math.min(95, p.y + 45)}%,
      rgba(90,180,255,.70) 0%,
      rgba(90,180,255,.18) 35%,
      rgba(90,180,255,0) 62%)`.replace(/\s+/g, " ");
          }

          if (mode === "linear-sheen") {
              return `linear-gradient(135deg,
      rgba(255,255,255,.10) 0%,
      rgba(255,255,255,0) 55%,
      rgba(255,255,255,.06) 100%)`.replace(/\s+/g, " ");
          }

          if (mode === "noise-ish") {
              // Not noise (CSS can't do true noise here) — just fine banding that reads like texture.
              return `repeating-linear-gradient(0deg,
      rgba(255,255,255,.05) 0px,
      rgba(255,255,255,.05) 1px,
      rgba(0,0,0,0) 1px,
      rgba(0,0,0,0) 6px)`.replace(/\s+/g, " ");
          }

          return "";
      },

      _setGradStatus(msg) {
          const el = this._dialog.querySelector("#agtGradStatus");
          if (!el) return;
          el.textContent = msg || "";
          if (msg) el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
      },

      _num(sel, fallback) {
          const v = parseFloat(this._dialog.querySelector(sel)?.value);
          return Number.isFinite(v) ? v : fallback;
      },

      _clamp(v, a, b) {
          return Math.max(a, Math.min(b, v));
      },


    _templateHTML() {
      return `
<header class="gtp-header">
  <div class="gtp-header-left">
    <div class="gtp-badge">
      <span>GradTool Guide</span>
      <span class="gtp-pill">workflow</span>
      <span class="gtp-pill">export-ready CSS</span>
    </div>
    <h2 id="agt-title" class="gtp-title">Using GradTool: Layers, Stops, Motion, and Export</h2>
    <p class="gtp-subtitle">
      This guide is specific to this app: how its layer stack works, how gradients are composed,
      how animations are generated, and how to get predictable HTML/CSS output.
    </p>
  </div>
  <div class="gtp-header-right">
    <button class="gtp-icon-btn" type="button" data-agt-action="copy-cheatsheet" title="Copy concise workflow notes">
      Copy Notes
    </button>
    <button class="gtp-close-btn" type="button" data-agt-action="close" aria-label="Close guide">✕</button>
  </div>
</header>

<div class="gtp-body">
  <aside class="gtp-nav" aria-label="GradTool tutorial sections">
    <button class="gtp-nav-btn" type="button" data-agt-section="overview">Overview</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="ui">UI map</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="layers">Layers</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="gradients">Gradients</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="stops">Color stops</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="clips">Clipping</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="animations">Animations</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="export">Export</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="troubleshooting">Troubleshooting</button>
    <button class="gtp-nav-btn" type="button" data-agt-section="recipes">Recipes</button>
  </aside>

  <main class="gtp-main">
    <section class="gtp-section" data-agt-panel="overview">
      <h3>What the app builds</h3>
      <p>
        GradTool renders a composition as a stack of absolutely-positioned <code>div</code> layers.
        Each layer can define a gradient background, optional clipping, optional filters, and optional animations.
        Export is intended to be portable: ordinary HTML + CSS, not canvas.
      </p>

      <div class="gtp-callout">
        <div class="gtp-callout-title">The mental model</div>
        <ul class="gtp-list">
          <li><strong>Container</strong> holds the artwork; layers are stacked inside it.</li>
          <li><strong>Layer</strong> is a single painted surface (background + filter + opacity + shape).</li>
          <li><strong>Animations</strong> are generated as CSS <code>@keyframes</code> and applied via <code>animation:</code>.</li>
          <li><strong>Export</strong> serializes the current state: CSS rules + keyframes + configuration.</li>
        </ul>
      </div>

      <h4>A workflow that stays predictable</h4>
      <ol class="gtp-steps">
        <li>Build the static image first (layers + gradients + opacity).</li>
        <li>Shape second (border-radius / clip-path), then refine.</li>
        <li>Animate last, one layer at a time, keeping loops stable.</li>
        <li>Export only when preview is stable and intentional.</li>
      </ol>

      <div class="gtp-mini-card">
        <h4>Rule of thumb</h4>
        <p class="gtp-tight">
          If you can’t describe what a layer contributes, it’s either redundant or too subtle. Fix that before adding more.
        </p>
      </div>
    </section>

    <section class="gtp-section" data-agt-panel="ui">
      <h3>UI map (how to read the app)</h3>
      <p>
        The app is structured around a layer list and a right-side control area. The “right-side menus” are meant to be toggled:
        keep the panels you’re actively using open; hide the rest to reduce clutter.
      </p>

      <div class="gtp-grid2">
        <div class="gtp-mini-card">
          <h4>Layer list (left / main)</h4>
          <ul class="gtp-list">
            <li>Select a layer to edit.</li>
            <li>Reorder layers to change which elements sit on top.</li>
            <li>Toggle visibility to isolate issues (especially color and blur).</li>
          </ul>
        </div>

        <div class="gtp-mini-card">
          <h4>Control panels (right)</h4>
          <ul class="gtp-list">
            <li><strong>Gradient / stops</strong>: define color structure.</li>
            <li><strong>Shape / clip</strong>: circle/square + clip-path shaping.</li>
            <li><strong>Filters</strong>: blur, hue, contrast, glow.</li>
            <li><strong>Animations</strong>: transform + filter + pulse/slide.</li>
            <li><strong>Output</strong>: generated CSS/HTML, copy/export actions.</li>
          </ul>
        </div>
      </div>

      <div class="gtp-callout">
        <div class="gtp-callout-title">The important distinction</div>
        <p class="gtp-tight">
          Some controls are “static” (background, opacity, blur) and some are “animated” (keyframes).
          If an animation type is enabled, the static value for that same property may be ignored in export/preview
          because the animation owns it.
        </p>
      </div>
    </section>

    <section class="gtp-section" data-agt-panel="layers">
      <h3>Layers (structure first)</h3>
      <p>
        Layers are the primary design unit. Think of them as stacked gel sheets: each layer is simple, but the stack produces depth.
      </p>

      <div class="gtp-grid2">
        <div>
          <h4>Recommended layer roles</h4>
          <ul class="gtp-list">
            <li><strong>Base</strong>: broad gradient, low detail, establishes palette.</li>
            <li><strong>Accent</strong>: smaller shape, stronger color separation.</li>
            <li><strong>Highlight</strong>: bright hotspot or rim.</li>
            <li><strong>Depth</strong>: darker, blurred, low opacity.</li>
          </ul>

          <h4>Opacity strategy</h4>
          <ul class="gtp-list">
            <li>Set opacity early. It’s easier than “fixing” everything with saturation/contrast.</li>
            <li>Prefer fewer strong layers to many weak layers.</li>
          </ul>
        </div>

        <div class="gtp-mini-card">
          <h4>Isolation technique</h4>
          <p class="gtp-tight">
            When something looks off: hide everything except one layer, then re-enable layers one by one.
            Most visual bugs are a single layer overpowering the stack.
          </p>
        </div>
      </div>
    </section>

<section class="gtp-section" data-agt-panel="gradients">
  <h3>Gradients (the part that actually does the work)</h3>
  <p>
    In this app, a gradient is not “a background color” — it’s a <em>field</em>: a mapping from a position
    (distance or angle) to color. Most of the quality of the final piece comes down to (1) gradient type,
    (2) stop structure, and (3) the geometry: position + size + falloff.
  </p>

  <div class="gtp-callout">
    <div class="gtp-callout-title">What GradTool exports</div>
    <p class="gtp-tight">
      The output is standard CSS: <code>linear-gradient()</code>, <code>radial-gradient()</code>, <code>conic-gradient()</code>,
      and their repeating variants. If it renders in the preview, it will render anywhere CSS gradients are supported.
    </p>
  </div>

  <h4>Gradient families</h4>
  <div class="gtp-grid2">
    <div class="gtp-mini-card">
      <h4>Linear</h4>
      <ul class="gtp-list">
        <li>Defined by an <strong>angle</strong> (or direction).</li>
        <li>Reads as a light sweep, panel shading, or “direction.”</li>
        <li>Hard stops produce crisp stripes; wide gaps produce fog.</li>
      </ul>
      <pre class="gtp-code"><code>background: linear-gradient(120deg,
  rgba(190,110,255,.95) 0%,
  rgba(90,180,255,.70) 35%,
  rgba(0,0,0,0) 70%);</code></pre>
    </div>

    <div class="gtp-mini-card">
      <h4>Radial</h4>
      <ul class="gtp-list">
        <li>Defined by a <strong>center point</strong> and <strong>size/shape</strong>.</li>
        <li>Reads as volume, glow, lensing, or hotspots.</li>
        <li>Most “gradient art” looks good because radials carry form.</li>
      </ul>
      <pre class="gtp-code"><code>background: radial-gradient(circle at 30% 30%,
  rgba(190,110,255,.92) 0%,
  rgba(190,110,255,.30) 35%,
  rgba(190,110,255,0) 62%);</code></pre>
    </div>
  </div>

  <div class="gtp-grid2">
    <div class="gtp-mini-card">
      <h4>Conic</h4>
      <ul class="gtp-list">
        <li>Defined by a <strong>center</strong> and rotation around it.</li>
        <li>Reads as spectral rotation, iridescence, “energy spin.”</li>
        <li>Extremely sensitive to stop structure (too many stops = noisy).</li>
      </ul>
      <pre class="gtp-code"><code>background: conic-gradient(from 10deg at 50% 50%,
  rgba(190,110,255,.9) 0%,
  rgba(90,180,255,.9) 35%,
  rgba(190,110,255,.9) 70%,
  rgba(190,110,255,.9) 100%);</code></pre>
    </div>

    <div class="gtp-mini-card">
      <h4>Repeating gradients</h4>
      <ul class="gtp-list">
        <li>Pattern generators: <code>repeating-linear-gradient()</code>, <code>repeating-radial-gradient()</code>.</li>
        <li>Great for tech textures, scanlines, halftone-ish banding, panels.</li>
        <li>Use subtle alpha. Loud repeating gradients dominate everything.</li>
      </ul>
      <pre class="gtp-code"><code>background: repeating-linear-gradient(90deg,
  rgba(255,255,255,.10) 0 2px,
  rgba(0,0,0,0) 2px 8px);</code></pre>
    </div>
  </div>

  <hr class="gtp-hr" />

  <h4>Geometry controls (shape, position, size)</h4>
  <p class="gtp-tight">
    Most “why does this look wrong?” issues are geometry issues, not color issues.
    Radials/conics have a center; radials also have a size. If the center is off, your composition feels unbalanced.
    If the size is wrong, it looks either flat (too large) or harsh (too small).
  </p>

  <div class="gtp-grid2">
    <div>
      <div class="gtp-mini-card">
        <h4>Radial sizing rules</h4>
        <ul class="gtp-list">
          <li><strong>Small radius</strong> + strong stop falloff → punchy hotspots.</li>
          <li><strong>Large radius</strong> + soft stop spacing → atmospheric base.</li>
          <li>Elliptical radials behave like “stretched light” and are great for motion.</li>
        </ul>
      </div>

      <div class="gtp-mini-card">
        <h4>Linear angle rules</h4>
        <ul class="gtp-list">
          <li>0° / 90° reads as UI panel shading.</li>
          <li>30–60° reads as “cinematic” sweep.</li>
          <li>Use angle changes for variation across layers instead of adding more stops.</li>
        </ul>
      </div>
    </div>

    <div class="gtp-mini-card">
      <h4>Hard stops (crisp edges)</h4>
      <p class="gtp-tight">
        Hard edges are created by placing two stops at the same position (or nearly the same).
        This is how you get rings, rims, and graphic shapes without adding more layers.
      </p>
      <pre class="gtp-code"><code>/* ring / rim */
radial-gradient(circle at 50% 50%,
  rgba(0,0,0,0) 52%,
  rgba(90,180,255,.75) 58%,
  rgba(0,0,0,0) 70%);</code></pre>
    </div>
  </div>

  <hr class="gtp-hr" />

  <h4>Live gradient lab</h4>
  <p class="gtp-tight">
    This is a controlled sandbox: one layer, one gradient (plus an optional second gradient) so you can see exactly
    what each parameter does. The generated CSS is what you’d paste into export output.
  </p>

  <div class="gtp-grid2">
    <div>
      <div class="gtp-row">
        <label class="gtp-label" style="margin:0;">Preset</label>
        <select class="gtp-select" id="agtGradPreset">
          <option value="softGlow">Soft glow (radial)</option>
          <option value="rimRing">Rim ring (radial hard stops)</option>
          <option value="panelSweep">Panel sweep (linear)</option>
          <option value="spectralSpin">Spectral spin (conic)</option>
          <option value="scanlines">Scanlines (repeating linear)</option>
          <option value="halftone">Halftone-ish bands (repeating radial)</option>
          <option value="stackedNebula">Stacked nebula (2 radials)</option>
        </select>
        <button class="gtp-btn" type="button" data-agt-action="grad-load">Load</button>
        <button class="gtp-btn" type="button" data-agt-action="grad-copy-css">Copy CSS</button>
      </div>

      <div class="gtp-row">
        <label class="gtp-label" style="margin:0;">Type</label>
        <select class="gtp-select" id="agtGradType">
          <option value="radial">radial-gradient</option>
          <option value="linear">linear-gradient</option>
          <option value="conic">conic-gradient</option>
          <option value="repeating-linear">repeating-linear-gradient</option>
          <option value="repeating-radial">repeating-radial-gradient</option>
        </select>

        <label class="gtp-label" style="margin:0;">Angle</label>
        <input class="gtp-input" id="agtGradAngle" type="number" value="45" style="width:92px;" />
        <span class="gtp-status">deg</span>
      </div>

      <div class="gtp-row">
        <label class="gtp-label" style="margin:0;">Center X</label>
        <input class="gtp-input" id="agtGradPosX" type="number" value="50" style="width:84px;" />
        <span class="gtp-status">%</span>

        <label class="gtp-label" style="margin:0;">Center Y</label>
        <input class="gtp-input" id="agtGradPosY" type="number" value="50" style="width:84px;" />
        <span class="gtp-status">%</span>
      </div>

      <div class="gtp-row">
        <label class="gtp-label" style="margin:0;">Radial size</label>
        <select class="gtp-select" id="agtGradSize">
          <option value="closest-side">closest-side</option>
          <option value="farthest-side">farthest-side</option>
          <option value="closest-corner">closest-corner</option>
          <option value="farthest-corner" selected>farthest-corner</option>
        </select>

        <label class="gtp-label" style="margin:0;">Shape</label>
        <select class="gtp-select" id="agtGradShape">
          <option value="circle" selected>circle</option>
          <option value="ellipse">ellipse</option>
        </select>
      </div>

      <label class="gtp-label" for="agtGradStops">Stops (one per line: <code>color position</code>)</label>
      <textarea class="gtp-textarea" id="agtGradStops" rows="7" spellcheck="false"></textarea>

      <div class="gtp-row">
        <label class="gtp-label" style="margin:0;">Second gradient (optional)</label>
        <select class="gtp-select" id="agtGradSecond">
          <option value="off" selected>off</option>
          <option value="radial-accent">radial accent</option>
          <option value="linear-sheen">linear sheen</option>
          <option value="noise-ish">fine banding (subtle)</option>
        </select>

        <button class="gtp-btn gtp-btn-primary" type="button" data-agt-action="grad-apply">Apply</button>
        <span class="gtp-status" id="agtGradStatus" aria-live="polite"></span>
      </div>

      <label class="gtp-label" for="agtGradCssOut">Generated CSS</label>
      <textarea class="gtp-textarea" id="agtGradCssOut" rows="8" spellcheck="false" readonly></textarea>

      <div class="gtp-callout">
        <div class="gtp-callout-title">Practical stop advice</div>
        <ul class="gtp-list">
          <li><strong>Use alpha</strong>. Most good gradient work is semi-transparent layering.</li>
          <li><strong>Anchor with transparency</strong>. A transparent stop is a compositional edge.</li>
          <li><strong>Hard stops</strong> are for rims/rings/panels. Use them deliberately.</li>
          <li><strong>Repeating</strong> is texture. Keep it subtle or it takes over the piece.</li>
        </ul>
      </div>
    </div>

    <div>
      <div class="gtp-preview-frame">
        <div class="gtp-preview" id="agtGradPreview" style="display:grid; place-items:center;">
          <div id="agtGradPreviewLayer"
               class="gtp-preview-layer"
               style="inset: 10%; border-radius: 16px;"></div>
        </div>
      </div>
      <div class="gtp-preview-caption">
        The preview intentionally uses a neutral base so you can see banding, edges, and falloff clearly.
        If a gradient looks “muddy” here, it will look muddy in a full stack.
      </div>
    </div>
  </div>
</section>


    <section class="gtp-section" data-agt-panel="stops">
      <h3>Color stops (the difference between clean and muddy)</h3>
      <p>
        Stops define how color transitions across the gradient. In practice, stops are how you control contrast,
        crispness, and whether the gradient reads as fog or graphic.
      </p>

      <div class="gtp-grid2">
        <div>
          <h4>Stop fundamentals</h4>
          <ul class="gtp-list">
            <li>A stop is a color + position (usually %).</li>
            <li>Close stops create sharp bands; spaced stops create smoother fades.</li>
            <li>Transparent stops are structural — they create holes, rims, and falloff.</li>
          </ul>

          <h4>Why gradients go muddy</h4>
          <ul class="gtp-list">
            <li>Too many mid-opacity colors overlap.</li>
            <li>Stops aren’t anchored (no clear dark/clear regions).</li>
            <li>Everything is saturated; nothing is neutral.</li>
          </ul>
        </div>

        <div class="gtp-mini-card">
          <h4>Stop patterns that work</h4>
          <pre class="gtp-code"><code>/* Soft glow */
radial-gradient(circle at 40% 35%,
  rgba(190,110,255,.90) 0%,
  rgba(190,110,255,.35) 35%,
  rgba(190,110,255,0) 62%);

/* Graphic rim */
radial-gradient(circle at 50% 50%,
  rgba(90,180,255,0) 52%,
  rgba(90,180,255,.75) 58%,
  rgba(90,180,255,0) 70%);</code></pre>
        </div>
      </div>

      <div class="gtp-callout">
        <div class="gtp-callout-title">Beginner shortcut</div>
        <p class="gtp-tight">
          Start with three stops: strong → soft → transparent. Move the middle stop to control tightness.
        </p>
      </div>
    </section>

    <section class="gtp-section" data-agt-panel="clips">
      <h3>Clipping (shape control)</h3>
      <p>
        There are two shape systems: border radius for circles/squares, and clip-path for geometric masks.
        Use clip-path when you need repeatable geometry.
      </p>

      <div class="gtp-grid2">
        <div>
          <h4>Preset vs Custom</h4>
          <ul class="gtp-list">
            <li><strong>Preset</strong>: fast, parameter-driven, good defaults.</li>
            <li><strong>Custom</strong>: paste valid <code>clip-path</code> functions for precision.</li>
          </ul>

          <h4>Performance note</h4>
          <ul class="gtp-list">
            <li>Simple polygons are cheap.</li>
            <li>Complex paths can be heavier; keep vertex counts reasonable.</li>
          </ul>
        </div>

        <div class="gtp-mini-card">
          <h4>Export example</h4>
          <pre class="gtp-code"><code>.layer {
  clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
}</code></pre>
        </div>
      </div>

      <div class="gtp-callout">
        <div class="gtp-callout-title">Debugging clipping</div>
        <p class="gtp-tight">
          If a clip looks wrong, remove blur/glow temporarily. Filters can obscure edges and make the geometry look off.
        </p>
      </div>
    </section>

    <section class="gtp-section" data-agt-panel="animations">
      <h3>Animations (how the app generates motion)</h3>
      <p>
        Animations are output as CSS keyframes and attached to each layer via <code>animation</code>.
        Think in three categories: transforms, filters, and simple properties (opacity/background-position).
      </p>

      <div class="gtp-grid2">
        <div>
          <h4>Transform animations</h4>
          <ul class="gtp-list">
            <li>Rotate, translate, scale, skew.</li>
            <li>Use <code>linear</code> for full rotations; <code>ease-in-out</code> for drifts.</li>
          </ul>

          <h4>Filter animations</h4>
          <ul class="gtp-list">
            <li>Hue shift, blur, saturation, contrast, glow.</li>
            <li>Keep the filter stack consistent at every keyframe to avoid pops.</li>
          </ul>
        </div>

        <div class="gtp-mini-card">
          <h4>Loop stability</h4>
          <ul class="gtp-list">
            <li>Rotation: 0 → 360 is a clean loop.</li>
            <li>Hue: <code>fromHue → fromHue + 360</code> with a 50% midpoint.</li>
            <li>Pulse: match 0% and 100% values.</li>
          </ul>
        </div>
      </div>

      <pre class="gtp-code"><code>/* A stable loop: transform + filter */
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes hueLoop {
  0% { filter: blur(2px) hue-rotate(10deg); }
  50% { filter: blur(2px) hue-rotate(190deg); }
  100% { filter: blur(2px) hue-rotate(370deg); }
}
.layer { animation: spin 18s linear infinite, hueLoop 14s linear infinite; }</code></pre>

      <div class="gtp-callout">
        <div class="gtp-callout-title">App-specific pitfall</div>
        <p class="gtp-tight">
          A single <code>animation-timing-function</code> on the element affects every animation.
          If you use steps for step-rotate, keep it isolated.
        </p>
      </div>
    </section>

    <section class="gtp-section" data-agt-panel="export">
      <h3>Export (what to validate before you ship)</h3>
      <p>
        Export should match the preview. Validate geometry, loops, and performance before copying output.
      </p>

      <div class="gtp-grid2">
        <div class="gtp-mini-card">
          <h4>Geometry</h4>
          <ul class="gtp-list">
            <li>Clips match intended shape.</li>
            <li>Border-radius fallback behaves for non-clipped layers.</li>
            <li>Layer order is correct.</li>
          </ul>
        </div>

        <div class="gtp-mini-card">
          <h4>Loops</h4>
          <ul class="gtp-list">
            <li>No pop between 100% and 0%.</li>
            <li>Hue shift is linear and stable.</li>
            <li>Disabled animations do not appear in CSS.</li>
          </ul>
        </div>
      </div>

      <div class="gtp-mini-card">
        <h4>Typical export shape</h4>
        <pre class="gtp-code"><code>/* typical export pieces */
.container { position: relative; overflow: hidden; }
.layer { position: absolute; inset: 0; background: ...; filter: ...; opacity: ...; }
@keyframes ... { ... }</code></pre>
      </div>
    </section>

    <section class="gtp-section" data-agt-panel="troubleshooting">
      <h3>Troubleshooting (fast diagnosis)</h3>

      <div class="gtp-mini-card">
        <h4>Preview differs from export</h4>
        <ul class="gtp-list">
          <li>Ensure keyframes are generated only for enabled animations.</li>
          <li>Static properties should not be applied when an animation owns that property.</li>
          <li>Keep filter stack identical at 0/50/100% (missing parts cause pops).</li>
        </ul>
      </div>

      <div class="gtp-mini-card">
        <h4>Template loads but doesn’t animate</h4>
        <ul class="gtp-list">
          <li>Older configs may lack <code>layer.animate</code>; infer it from enabled animations on load.</li>
          <li>Clear old animation strings when rebuilding layer DOM.</li>
        </ul>
      </div>

      <div class="gtp-mini-card">
        <h4>Hue shift jerks</h4>
        <ul class="gtp-list">
          <li>Use linear timing for hue.</li>
          <li>Don’t let step timing leak into filters.</li>
          <li>Include blur/saturation/etc. consistently in each keyframe.</li>
        </ul>
      </div>
    </section>

    <section class="gtp-section" data-agt-panel="recipes">
      <h3>Recipes (reliable starting points)</h3>

      <div class="gtp-mini-card">
        <h4>Clean token (3 layers)</h4>
        <ol class="gtp-steps">
          <li>Base: radial gradient, slight blur.</li>
          <li>Shape: hexagon clip, mild glow.</li>
          <li>Highlight: small ellipse, subtle pulse.</li>
        </ol>
      </div>

      <div class="gtp-mini-card">
        <h4>Atmospheric nebula (6–8 layers)</h4>
        <ol class="gtp-steps">
          <li>2–3 large radials (soft stops → transparent).</li>
          <li>2 accents with tighter mid stop for structure.</li>
          <li>1 rim layer (transparent → bright → transparent).</li>
          <li>Slow rotation on base, hue drift on accents, gentle translate on one highlight.</li>
        </ol>
      </div>

      <div class="gtp-callout">
        <div class="gtp-callout-title">Scaling complexity</div>
        <p class="gtp-tight">
          Add layers only when you can name their role (base / depth / accent / highlight). If you can’t, remove instead of adding.
        </p>
      </div>

      <div class="gtp-row">
        <button class="gtp-btn" type="button" data-agt-action="copy-cheatsheet">Copy Notes</button>
      </div>
    </section>
  </main>
</div>

<footer class="gtp-footer" style="padding: 12px 18px; border-top: 1px solid rgba(170, 140, 255, 0.14); display:flex; justify-content: space-between; align-items: center; gap: 10px;">
  <div class="gtp-footer-left">
    <span class="gtp-status">Tip: Press <kbd>Esc</kbd> to close. Use <kbd>Tab</kbd> to navigate inside the modal.</span>
  </div>
  <div class="gtp-footer-right" style="display:flex; gap: 10px; align-items:center;">
    <button class="gtp-btn" type="button" data-agt-action="copy-cheatsheet">Copy Notes</button>
    <button class="gtp-btn gtp-btn-primary" type="button" data-agt-action="close">Close</button>
  </div>
</footer>
`;
    },

    _attachEvents() {
      this._onKeyDown = (e) => {
        if (!this._isOpen) return;

        if (e.key === "Escape") {
          e.preventDefault();
          this.close();
          return;
        }
        if (e.key === "Tab") this._trapFocus(e);
      };

      this._onClick = (e) => {
        if (!this._isOpen) return;

        const actionEl = e.target.closest("[data-agt-action]");
        if (actionEl) {
          this._handleAction(actionEl.getAttribute("data-agt-action"));
          return;
        }

        const navBtn = e.target.closest(".gtp-nav-btn");
        if (navBtn) {
          const section = navBtn.getAttribute("data-agt-section");
          if (section) this._setSection(section);
          return;
        }

        if (e.target === this._backdrop) this.close();
      };

      document.addEventListener("keydown", this._onKeyDown, true);
      this._root.addEventListener("click", this._onClick, true);
    },

    _detachEvents() {
      document.removeEventListener("keydown", this._onKeyDown, true);
      if (this._root) this._root.removeEventListener("click", this._onClick, true);
      this._onKeyDown = null;
      this._onClick = null;
    },

    _handleAction(action) {
      switch (action) {
        case "close":
          this.close();
          break;
        case "copy-cheatsheet":
          this._copyNotes();
              break;
          case "grad-load": {
              const key = this._dialog.querySelector("#agtGradPreset")?.value;
              this._gradLoadPreset(key);
              break;
          }
          case "grad-apply":
              this._gradApplyFromInputs();
              break;
          case "grad-copy-css": {
              const out = this._dialog.querySelector("#agtGradCssOut")?.value || "";
              if (navigator.clipboard?.writeText) navigator.clipboard.writeText(out);
              break;
          }

      }
    },

    _setSection(section) {
      const panels = this._dialog.querySelectorAll(".gtp-section");
      panels.forEach((p) => p.classList.remove("is-active"));
      const panel = this._dialog.querySelector(`.gtp-section[data-agt-panel="${section}"]`);
      if (panel) panel.classList.add("is-active");

      const navBtns = this._dialog.querySelectorAll(".gtp-nav-btn");
      navBtns.forEach((b) => b.removeAttribute("aria-current"));
      const nav = this._dialog.querySelector(`.gtp-nav-btn[data-agt-section="${section}"]`);
      if (nav) nav.setAttribute("aria-current", "true");

      const heading = panel ? panel.querySelector("h3,h4") : null;
      if (heading) heading.scrollIntoView({ block: "start" });
    },

    _trapFocus(e) {
      const focusable = this._getFocusable(this._dialog);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },

    _getFocusable(container) {
      if (!container) return [];
      const selectors = [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ];
      return Array.from(container.querySelectorAll(selectors.join(","))).filter((el) => el.offsetParent !== null);
    },

    async _copyNotes() {
      const text = this._notesText();
      const t = String(text || "").trim();
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
      } catch {
        // silent
      }
    },

    _notesText() {
      return [
        "GRADTOOL WORKFLOW NOTES",
        "",
        "Build order:",
        "  1) Layers + gradients + opacity",
        "  2) Shape (clip/border radius)",
        "  3) Filters",
        "  4) Animations (one at a time; stable loops)",
        "  5) Export after preview matches intent",
        "",
        "Stops:",
        "  - 3-stop pattern: strong → soft → transparent",
        "  - Close stops = hard edges; spaced stops = smooth fades",
        "",
        "Animation stability:",
        "  - rotate: 0→360, linear",
        "  - hue: from→from+360 with 50% midpoint, linear",
        "  - keep filter stacks consistent at every keyframe",
        "",
        "Debugging:",
        "  - isolate layers by hiding others",
        "  - remove filters temporarily to verify geometry",
      ].join("\\n");
    },
  };
})();
