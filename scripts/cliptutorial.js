/* clip_tutorial_popup.js
   Advanced + beginner-friendly Clip Path tutorial modal for GradTool.
   Uses shared popup.css (purple/blue theme).

   Requirements:
     <link rel="stylesheet" href="popup.css">
     <script src="clip_tutorial_popup.js"></script>

   Usage:
     showClipPopup()
     showClipPopup({ initialSection: "custom" })
*/

(function () {
    "use strict";

    window.showClipPopup = function showClipPopup(options = {}) {
        ClipTutorialPopup.open(options);
    };
    window.hideClipPopup = function hideClipPopup() {
        ClipTutorialPopup.close();
    };

    const ClipTutorialPopup = {
        _isOpen: false,
        _root: null,
        _backdrop: null,
        _dialog: null,
        _lastActiveEl: null,
        _opts: null,
        _styleEl: null,
        _examples: null,

        open(options = {}) {
            if (this._isOpen) return;

            this._opts = {
                initialSection: options.initialSection || "overview",
            };

            this._lastActiveEl = document.activeElement;

            this._build();
            this._attachEvents();
            this._isOpen = true;

            document.documentElement.classList.add("gtp-scroll-lock");

            this._setSection(this._opts.initialSection);

            const focusable = this._getFocusable(this._dialog);
            (focusable[0] || this._dialog).focus();
        },

        close() {
            if (!this._isOpen) return;

            this._detachEvents();

            if (this._styleEl && this._styleEl.parentNode) {
                this._styleEl.parentNode.removeChild(this._styleEl);
            }

            if (this._root && this._root.parentNode) {
                this._root.parentNode.removeChild(this._root);
            }

            document.documentElement.classList.remove("gtp-scroll-lock");

            try {
                this._lastActiveEl?.focus();
            } catch { }

            this._isOpen = false;
        },

        _build() {
            const root = document.createElement("div");
            root.className = "gtp-root";

            const backdrop = document.createElement("div");
            backdrop.className = "gtp-backdrop";

            const dialog = document.createElement("div");
            dialog.className = "gtp-dialog";
            dialog.setAttribute("role", "dialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.setAttribute("aria-labelledby", "ctp-title");
            dialog.tabIndex = -1;

            dialog.innerHTML = this._templateHTML();

            root.appendChild(backdrop);
            root.appendChild(dialog);
            document.body.appendChild(root);

            this._root = root;
            this._backdrop = backdrop;
            this._dialog = dialog;

            this._injectDemoStyles();
            this._initExamples();
            this._initDemo();
        },

        _templateHTML() {
            return `
<header class="gtp-header">
  <div>
    <div class="gtp-badge">
      Clip Paths <span class="gtp-pill">CSS Geometry</span>
    </div>
    <h2 id="ctp-title" class="gtp-title">Clip Paths — Shape, Precision, and Control</h2>
    <p class="gtp-subtitle">
      Clip paths define the visible geometry of a layer using mathematical shapes.
      They are fully exportable as standard CSS and can be driven by presets or custom syntax.
    </p>
  </div>
  <div class="gtp-header-right">
    <button class="gtp-icon-btn" data-ctp-action="copy-cheatsheet">Copy Cheat Sheet</button>
    <button class="gtp-close-btn" data-ctp-action="close">✕</button>
  </div>
</header>

<div class="gtp-body">
  <aside class="gtp-nav">
    <button class="gtp-nav-btn" data-ctp-section="overview">Overview</button>
    <button class="gtp-nav-btn" data-ctp-section="presets">Preset Shapes</button>
    <button class="gtp-nav-btn" data-ctp-section="custom">Custom Syntax</button>
    <button class="gtp-nav-btn" data-ctp-section="geometry">Geometry & Math</button>
    <button class="gtp-nav-btn" data-ctp-section="animation">Clipping + Motion</button>
    <button class="gtp-nav-btn" data-ctp-section="troubleshooting">Troubleshooting</button>
    <button class="gtp-nav-btn" data-ctp-section="export">Export Patterns</button>
  </aside>

  <main class="gtp-main">

<section class="gtp-section" data-ctp-panel="overview">
<h3>What clip-path actually does</h3>
<p>
A clip path masks a layer by defining a geometric region.
Pixels outside the region are discarded. Unlike SVG masks or canvas,
clip paths remain pure CSS and export cleanly.
</p>

<div class="gtp-callout">
<div class="gtp-callout-title">Mental model</div>
<ul class="gtp-list">
<li>Layer content (gradients, filters, transforms)</li>
<li>Clip geometry (polygon, circle, ellipse, inset, path)</li>
<li>Final rendered shape</li>
</ul>
</div>

<h4>When to use clip paths</h4>
<ul class="gtp-list">
<li>Geometric gradient compositions</li>
<li>Badges, shards, panels, masks</li>
<li>Vector-precise UI elements</li>
</ul>
</section>

<section class="gtp-section" data-ctp-panel="presets">
<h3>Preset Shapes</h3>
<p>
Presets translate intuitive controls into mathematically valid clip paths.
They are ideal for rapid design and predictable geometry.
</p>

<div class="gtp-grid2">
<div>
<ul class="gtp-list">
<li>Triangle, diamond, hexagon, octagon</li>
<li>Star (adjustable inner radius)</li>
<li>Circle and ellipse</li>
<li>Inset (rounded rectangle)</li>
</ul>
</div>
<div class="gtp-mini-card">
<h4>Design insight</h4>
<p class="gtp-tight">
Percent-based coordinates preserve proportions across responsive layouts.
This is why presets default to percentages rather than pixels.
</p>
</div>
</div>
</section>

<section class="gtp-section" data-ctp-panel="custom">
<h3>Interactive Clip-Path Editor</h3>
<p>Edit real clip-path syntax and preview the result instantly.</p>

<div class="gtp-grid2">
<div>
<div class="gtp-row">
<label class="gtp-label">Example</label>
<select class="gtp-select" id="ctpExampleSelect">
<option value="diamond">Diamond</option>
<option value="hexagon">Hexagon</option>
<option value="star">Star</option>
<option value="circle">Circle</option>
<option value="ellipse">Ellipse</option>
<option value="inset">Inset</option>
<option value="wave">Wave (path)</option>
</select>
<button class="gtp-btn" data-ctp-action="load-example">Load</button>
<button class="gtp-btn" data-ctp-action="copy-example">Copy</button>
</div>

<label class="gtp-label">clip-path value</label>
<textarea id="ctpClipInput" class="gtp-textarea" rows="6"></textarea>

<div class="gtp-row gtp-row-slim">
<button class="gtp-btn gtp-btn-primary" data-ctp-action="apply-demo">Apply</button>
<span id="ctpStatus" class="gtp-status"></span>
</div>
</div>

<div>
<div class="gtp-preview-frame">
<div class="gtp-preview">
<div class="gtp-preview-layer" id="ctpPreviewLayer"></div>
</div>
</div>
<div class="gtp-preview-caption">
Preview matches how clip paths affect gradient layers in GradTool.
</div>
</div>
</div>
</section>

<section class="gtp-section" data-ctp-panel="geometry">
<h3>Geometry & Precision</h3>
<ul class="gtp-list">
<li>Clip paths operate in normalized coordinate space.</li>
<li>Polygon vertices are evaluated in order.</li>
<li>Self-intersecting polygons may produce undefined results.</li>
<li>Percent coordinates scale with the element.</li>
</ul>
</section>

<section class="gtp-section" data-ctp-panel="animation">
<h3>Clip Paths and Animation</h3>
<p>
Clipping interacts with transforms and filters. In most cases,
animate the layer, not the clip geometry, for better performance.
</p>

<pre class="gtp-code"><code>@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.layer {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  animation: spin 18s linear infinite;
}</code></pre>
</section>

<section class="gtp-section" data-ctp-panel="troubleshooting">
<h3>Troubleshooting</h3>
<ul class="gtp-list">
<li>Clip not applied → invalid syntax or disabled clipping.</li>
<li>Jagged edges → reduce sharpness or add subtle blur.</li>
<li>Distortion → check vertex order and units.</li>
</ul>
</section>

<section class="gtp-section" data-ctp-panel="export">
<h3>Export Patterns</h3>
<pre class="gtp-code"><code>.layer {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}</code></pre>
</section>

  </main>
</div>

<footer class="gtp-footer" style="padding:12px 18px;border-top:1px solid rgba(170,140,255,.14);display:flex;justify-content:space-between;">
  <span class="gtp-status">Tip: Press Esc to close.</span>
  <div>
    <button class="gtp-btn" data-ctp-action="copy-cheatsheet">Copy Cheat Sheet</button>
    <button class="gtp-btn gtp-btn-primary" data-ctp-action="close">Close</button>
  </div>
</footer>
`;
        },

        _injectDemoStyles() {
            const style = document.createElement("style");
            style.textContent = `.gtp-preview-layer{transition:clip-path .18s ease-out,transform .18s ease-out;}`;
            document.head.appendChild(style);
            this._styleEl = style;
        },

        _initExamples() {
            this._examples = {
                diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                hexagon: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                star: "polygon(50% 2%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                circle: "circle(45% at 50% 50%)",
                ellipse: "ellipse(46% 32% at 50% 50%)",
                inset: "inset(10% 10% 10% 10% round 14%)",
                wave: "path('M 0 50 Q 25 20, 50 50 T 100 50 V 100 H 0 Z')",
            };
        },

        _initDemo() {
            const select = this._dialog.querySelector("#ctpExampleSelect");
            const input = this._dialog.querySelector("#ctpClipInput");
            input.value = this._examples[select.value];
            this._applyClipToPreview(input.value, { silent: true });

            input.addEventListener("input", () => {
                this._applyClipToPreview(input.value, { soft: true });
            });
        },

        _applyClipToPreview(raw, opts = {}) {
            const layer = this._dialog.querySelector("#ctpPreviewLayer");
            const val = raw?.trim();
            if (!/^(polygon|circle|ellipse|inset|path)\(/i.test(val)) return false;
            layer.style.clipPath = val;
            return true;
        },

        _handleAction(action) {
            const select = this._dialog.querySelector("#ctpExampleSelect");
            const input = this._dialog.querySelector("#ctpClipInput");

            if (action === "close") this.close();
            if (action === "load-example") {
                input.value = this._examples[select.value];
                this._applyClipToPreview(input.value);
            }
            if (action === "copy-example") navigator.clipboard.writeText(input.value);
            if (action === "apply-demo") this._applyClipToPreview(input.value);
            if (action === "copy-cheatsheet") navigator.clipboard.writeText(this._cheatSheetText());
        },

        _attachEvents() {
            this._onClick = (e) => {
                const btn = e.target.closest("[data-ctp-action]");
                if (btn) this._handleAction(btn.dataset.ctpAction);
                if (e.target === this._backdrop) this.close();
            };
            this._root.addEventListener("click", this._onClick);
        },

        _detachEvents() {
            this._root.removeEventListener("click", this._onClick);
        },

        _setSection(section) {
            this._dialog.querySelectorAll(".gtp-section").forEach(s => s.classList.remove("is-active"));
            this._dialog.querySelector(`[data-ctp-panel="${section}"]`)?.classList.add("is-active");
            this._dialog.querySelectorAll(".gtp-nav-btn").forEach(b => b.removeAttribute("aria-current"));
            this._dialog.querySelector(`[data-ctp-section="${section}"]`)?.setAttribute("aria-current", "true");
        },

        _getFocusable(container) {
            return [...container.querySelectorAll("button,textarea,select,[tabindex]:not([tabindex='-1'])")];
        },

        _cheatSheetText() {
            return [
                "CLIP-PATH CHEAT SHEET",
                "polygon(x y, x y, ...)",
                "circle(r at x y)",
                "ellipse(rx ry at x y)",
                "inset(t r b l round r)",
                "",
                "Example:",
                "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            ].join("\n");
        },
    };
})();
