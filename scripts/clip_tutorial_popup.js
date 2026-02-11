/* clip_tutorial_popup.js
   Clip Path tutorial modal for GradTool (beginner-friendly + expert-credible).
   Uses shared popup.css (purple/blue theme).

   Requirements:
     <link rel="stylesheet" href="popup.css">
     <script src="clip_tutorial_popup.js"></script>

   Usage:
     showClipPopup()
     showClipPopup({ initialSection: "points101" })  // jump to a section

   Notes:
     - This file avoids bundling styling; only tiny demo-only inline styles are injected.
     - Content is written for beginners (clear definitions + examples) without insulting experts.
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

    // demo state
    _styleEl: null,
    _examples: null,
    _points: null,
    _pointUnit: "percent", // percent | px

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
      this._styleEl = null;

      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }

      document.documentElement.classList.remove("gtp-scroll-lock");

      try { this._lastActiveEl?.focus(); } catch {}

      this._isOpen = false;
      this._root = this._backdrop = this._dialog = null;
      this._examples = null;
      this._points = null;
    },

    // ----------------------------
    // Build
    // ----------------------------
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
        enhanceCyberSelects(dialog);
    },

    _templateHTML() {
      return `
        ${this._renderHeader()}
        <div class="gtp-body">
          ${this._renderNav()}
          <main class="gtp-main">
            ${this._sectionOverview()}
            ${this._sectionPresets()}
            ${this._sectionPoints101()}
            ${this._sectionCustom()}
            ${this._sectionGeometry()}
            ${this._sectionAnimation()}
            ${this._sectionTroubleshooting()}
            ${this._sectionExport()}
          </main>
        </div>
        ${this._renderFooter()}
      `;
    },

    _renderHeader() {
      return `
        <header class="gtp-header">
          <div class="gtp-header-left">
            <div class="gtp-badge">
              <span>Clip Paths</span>
              <span class="gtp-pill">Beginner → Expert</span>
              <span class="gtp-pill">CSS export</span>
            </div>
            <h2 id="ctp-title" class="gtp-title">Clip Paths — Shape Layers with Pure CSS</h2>
            <p class="gtp-subtitle">
              A <code>clip-path</code> is a geometric mask: only pixels inside the shape remain visible.
              Use presets for speed, or author the geometry directly for precision.
            </p>
          </div>
          <div class="gtp-header-right">
            <button class="gtp-icon-btn" type="button" data-ctp-action="copy-cheatsheet">Copy Cheat Sheet</button>
            <button class="gtp-close-btn" type="button" data-ctp-action="close" aria-label="Close tutorial">✕</button>
          </div>
        </header>
      `;
    },

    _renderNav() {
      return `
        <aside class="gtp-nav" aria-label="Clip path tutorial sections">
          <button class="gtp-nav-btn" type="button" data-ctp-section="overview">Overview</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="presets">Preset Shapes</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="points101">Points & Insets 101</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="custom">Interactive Examples</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="geometry">Geometry & Precision</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="animation">Clipping + Motion</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="troubleshooting">Troubleshooting</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="export">Export Patterns</button>
        </aside>
      `;
    },

    _renderFooter() {
      return `
        <footer class="gtp-footer" style="padding: 12px 18px; border-top: 1px solid rgba(170, 140, 255, 0.14); display:flex; justify-content: space-between; align-items:center; gap: 10px;">
          <div class="gtp-footer-left">
            <span class="gtp-status">Tip: Press <kbd>Esc</kbd> to close. Use <kbd>Tab</kbd> to navigate inside the modal.</span>
          </div>
          <div class="gtp-footer-right" style="display:flex; gap: 10px; align-items:center;">
            <button class="gtp-btn" type="button" data-ctp-action="copy-cheatsheet">Copy Cheat Sheet</button>
            <button class="gtp-btn gtp-btn-primary" type="button" data-ctp-action="close">Close</button>
          </div>
        </footer>
      `;
    },

    // ----------------------------
    // Sections (each is its own generator)
    // ----------------------------
    _sectionOverview() {
      return `
        <section class="gtp-section" data-ctp-panel="overview">
          <h3>What clip-path does</h3>
          <p>
            <code>clip-path</code> defines a shape (polygon, circle, inset, etc.) in the element’s own coordinate space.
            Anything outside the shape is not drawn. This is not a raster mask — it stays crisp and exportable.
          </p>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Two ways to work</div>
            <ul class="gtp-list">
              <li><strong>Preset shapes</strong>: pick a shape and tweak a few sliders — fast, safe, predictable.</li>
              <li><strong>Custom syntax</strong>: paste or author the exact <code>clip-path</code> function — maximum control.</li>
            </ul>
          </div>

          <h4>Why designers and engineers use it</h4>
          <ul class="gtp-list">
            <li><strong>UI geometry</strong> without images: badges, panels, shards, stickers, masks.</li>
            <li><strong>Resolution-independent</strong> and responsive when using percent coordinates.</li>
            <li><strong>Portable export</strong>: plain HTML + CSS.</li>
          </ul>

          <div class="gtp-mini-card">
            <h4>Fast start</h4>
            <ol class="gtp-steps">
              <li>Enable clipping for a layer.</li>
              <li>Choose a preset (triangle/star/inset).</li>
              <li>Adjust rotation/roundness/padding.</li>
              <li>Export: you’ll see <code>clip-path: ...;</code> on that layer.</li>
            </ol>
          </div>
        </section>
      `;
    },

    _sectionPresets() {
      return `
        <section class="gtp-section" data-ctp-panel="presets">
          <h3>Preset shapes</h3>
          <p>
            Presets are “friendly wrappers” around valid CSS geometry. They generate a correct <code>clip-path</code>
            string for you, typically using percent coordinates so the shape scales cleanly.
          </p>

          <div class="gtp-grid2">
            <div>
              <h4>Common families</h4>
              <ul class="gtp-list">
                <li><strong>Polygons</strong>: triangle, diamond, hexagon, octagon, star.</li>
                <li><strong>Radial</strong>: circle, ellipse.</li>
                <li><strong>Rectangular</strong>: inset (with optional rounded corners).</li>
              </ul>

              <h4>Controls that matter</h4>
              <ul class="gtp-list">
                <li><strong>Rotation</strong>: rotates polygon vertices about center.</li>
                <li><strong>Roundness</strong>: for inset corner rounding; for stars, adjusts the “inner” radius feel.</li>
                <li><strong>Padding</strong> (inset): how much you cut in from each edge.</li>
              </ul>
            </div>

            <div class="gtp-mini-card">
              <h4>Expert note</h4>
              <p class="gtp-tight">
                Many “fancy” shapes are just polygons with 6–12 points. Fewer points often looks cleaner and is easier to animate.
              </p>
              <p class="gtp-tight">
                If you need surgical fidelity (logo silhouettes), jump to <strong>Custom Syntax</strong> or <code>path()</code>.
              </p>
            </div>
          </div>
        </section>
      `;
    },

    _sectionPoints101() {
      return `
        <section class="gtp-section" data-ctp-panel="points101">
          <h3>Points & Insets 101</h3>

          <div class="gtp-grid2">
            <div>
              <h4>Understanding polygon points (arrays of coordinates)</h4>
              <p class="gtp-tight">
                A polygon is a list of points. Each point is <code>x y</code>. You list points in order around the shape:
              </p>
              <pre class="gtp-code"><code>clip-path: polygon(
  50% 0%,
  100% 50%,
  50% 100%,
  0% 50%
);</code></pre>
              <ul class="gtp-list">
                <li><strong>x</strong> goes left → right; <strong>y</strong> goes top → bottom.</li>
                <li>Percent values (<code>%</code>) scale with the element.</li>
                <li>Points are connected in the order you list them, then closed at the end.</li>
              </ul>

              <div class="gtp-callout">
                <div class="gtp-callout-title">Beginner tip</div>
                <p class="gtp-tight">
                  Start with 3–6 points. Add complexity only when you need it.
                </p>
              </div>
            </div>

            <div class="gtp-mini-card">
              <h4>What is an inset?</h4>
              <p class="gtp-tight">
                <code>inset()</code> cuts inward from the edges — like setting margins on the mask. Think of it as:
                “hide everything except the rectangle inside these offsets.”
              </p>
              <pre class="gtp-code"><code>clip-path: inset(top right bottom left round radius);</code></pre>
              <p class="gtp-tight">
                Example: <code>inset(10% 10% 10% 10% round 14%)</code> means:
              </p>
              <ul class="gtp-list">
                <li>cut 10% in from each edge</li>
                <li>round corners by 14%</li>
              </ul>

              <div class="gtp-row" style="margin-top:10px;">
                <button class="gtp-btn" type="button" data-ctp-action="apply-inset" data-inset="inset(8% 8% 8% 8%)">Inset (simple)</button>
                <button class="gtp-btn" type="button" data-ctp-action="apply-inset" data-inset="inset(10% 10% 10% 10% round 18%)">Inset (rounded)</button>
                <button class="gtp-btn" type="button" data-ctp-action="apply-inset" data-inset="inset(4% 18% 20% 6% round 10%)">Inset (asymmetric)</button>
              </div>
              <p class="gtp-tight" style="opacity:.92;">
                Click any inset above to apply it to the preview instantly.
              </p>
            </div>
          </div>

          <hr class="gtp-hr" />

          <h4>Build a polygon from points (hands-on)</h4>
          <p class="gtp-tight">
            This is the fastest way to learn coordinate arrays: edit numbers, add/remove points, and watch the shape update.
          </p>

          <div class="gtp-grid2">
            <div>
              <div class="gtp-row">
                <label class="gtp-label" style="margin:0;">Units</label>
                <select class="gtp-select" id="ctpPointUnit">
                  <option value="percent" selected>Percent (0–100)</option>
                  <option value="px">Pixels</option>
                </select>

                <button class="gtp-btn" type="button" data-ctp-action="points-reset">Reset</button>
                <button class="gtp-btn" type="button" data-ctp-action="points-add">Add point</button>
                <button class="gtp-btn" type="button" data-ctp-action="points-copy">Copy polygon()</button>
              </div>

              <div id="ctpPointsTable" class="gtp-mini-card" style="padding:12px;">
                <!-- points table injected here -->
              </div>

              <label class="gtp-label" for="ctpPolygonOut">Generated clip-path</label>
              <textarea id="ctpPolygonOut" class="gtp-textarea" rows="3" spellcheck="false"></textarea>

              <div class="gtp-row gtp-row-slim">
                <button class="gtp-btn gtp-btn-primary" type="button" data-ctp-action="points-apply">Apply to Preview</button>
                <span id="ctpPointsStatus" class="gtp-status" aria-live="polite"></span>
              </div>
            </div>

            <div>
              <div class="gtp-preview-frame">
                <div class="gtp-preview">
                  <div class="gtp-preview-layer" id="ctpPreviewLayerPoints"></div>
                </div>
              </div>
              <div class="gtp-preview-caption">
                This preview is linked to the point builder. It won’t affect your project until you copy/apply the value.
              </div>
            </div>
          </div>
        </section>
      `;
    },

    _sectionCustom() {
      return `
        <section class="gtp-section" data-ctp-panel="custom">
          <h3>Interactive examples (custom syntax)</h3>
          <p>
            Custom mode is the “raw” CSS interface. You supply the function directly.
            The most common functions are <code>polygon()</code> and <code>inset()</code>.
          </p>

          <div class="gtp-grid2">
            <div>
              <div class="gtp-row">
                <label class="gtp-label" style="margin:0;">Example</label>
                <select class="gtp-select" id="ctpExampleSelect">
                  <option value="diamond">Diamond (polygon)</option>
                  <option value="hexagon">Hexagon (polygon)</option>
                  <option value="star">Star (polygon)</option>
                  <option value="ticket">Ticket (polygon)</option>
                  <option value="circle">Circle</option>
                  <option value="ellipse">Ellipse</option>
                  <option value="insetCard">Inset Card</option>
                  <option value="insetPill">Inset Pill</option>
                  <option value="wave">Wave (path)</option>
                </select>
                <button class="gtp-btn" type="button" data-ctp-action="load-example">Load</button>
                <button class="gtp-btn" type="button" data-ctp-action="copy-example">Copy</button>
              </div>

              <label class="gtp-label" for="ctpClipInput">clip-path value</label>
              <textarea id="ctpClipInput" class="gtp-textarea" rows="6" spellcheck="false"></textarea>

              <div class="gtp-row gtp-row-slim">
                <button class="gtp-btn gtp-btn-primary" type="button" data-ctp-action="apply-demo">Apply to Preview</button>
                <span id="ctpStatus" class="gtp-status" aria-live="polite"></span>
              </div>

              <div class="gtp-callout">
                <div class="gtp-callout-title">Good defaults</div>
                <ul class="gtp-list">
                  <li>Start with percent-based polygons and keep point count low.</li>
                  <li>Use <code>inset()</code> for “cards” and “pills” without having to manage many points.</li>
                  <li>Use <code>path()</code> for curves when polygon approximation isn’t acceptable.</li>
                </ul>
              </div>
            </div>

            <div>
              <div class="gtp-preview-frame">
                <div class="gtp-preview">
                  <div class="gtp-preview-layer" id="ctpPreviewLayer"></div>
                </div>
              </div>
              <div class="gtp-preview-caption">
                Preview mirrors how clip paths affect gradient layers in your project.
              </div>
            </div>
          </div>
        </section>
      `;
    },

    _sectionGeometry() {
      return `
        <section class="gtp-section" data-ctp-panel="geometry">
          <h3>Geometry & precision</h3>

          <div class="gtp-grid2">
            <div class="gtp-mini-card">
              <h4>Coordinate space</h4>
              <ul class="gtp-list">
                <li><strong>Percent</strong>: relative to element bounds (responsive).</li>
                <li><strong>Pixels</strong>: absolute (can distort when element size changes).</li>
                <li>Mixing units is allowed but often confusing — do it only on purpose.</li>
              </ul>
            </div>

            <div class="gtp-mini-card">
              <h4>Polygon ordering</h4>
              <ul class="gtp-list">
                <li>Vertices are connected in order, then closed.</li>
                <li>Clockwise vs counterclockwise affects winding rules for complex cases.</li>
                <li>Self-intersections can produce surprising results — avoid unless you know the fill rule behavior.</li>
              </ul>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Engineering note</div>
            <p class="gtp-tight">
              Performance generally scales with complexity. A 6–12 point polygon is cheap. Overly complex
              paths are more likely to alias or differ slightly across engines.
            </p>
          </div>
        </section>
      `;
    },

    _sectionAnimation() {
      return `
        <section class="gtp-section" data-ctp-panel="animation">
          <h3>Clipping + motion</h3>
          <p>
            Most of the time, you should animate the layer (transform / background / filter), not the clip geometry itself.
            That keeps motion smooth and keeps the “shape identity” stable.
          </p>

          <div class="gtp-grid2">
            <div class="gtp-mini-card">
              <h4>Recommended</h4>
              <ul class="gtp-list">
                <li>Clip stays fixed, layer rotates or drifts.</li>
                <li>Background slides inside a clipped shape.</li>
                <li>Subtle glow/blur changes for depth.</li>
              </ul>
            </div>

            <div class="gtp-mini-card">
              <h4>Use caution</h4>
              <ul class="gtp-list">
                <li>Animating between different polygons can “snap” unless point counts match and topology aligns.</li>
                <li>Very sharp points can alias during rotation.</li>
              </ul>
            </div>
          </div>

          <pre class="gtp-code"><code>@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.layer {
  clip-path: inset(10% 10% 10% 10% round 18%);
  animation: spin 18s linear infinite;
}</code></pre>
        </section>
      `;
    },

    _sectionTroubleshooting() {
      return `
        <section class="gtp-section" data-ctp-panel="troubleshooting">
          <h3>Troubleshooting</h3>

          <div class="gtp-mini-card">
            <h4>Nothing changes</h4>
            <ul class="gtp-list">
              <li>Clipping isn’t enabled on the layer.</li>
              <li>Syntax isn’t recognized (must start with polygon/circle/ellipse/inset/path).</li>
              <li>Some browsers are stricter about <code>path()</code> — test if you rely on it.</li>
            </ul>
          </div>

          <div class="gtp-mini-card">
            <h4>Edges look jagged</h4>
            <ul class="gtp-list">
              <li>Sharp points alias — reduce the spike angle or point count.</li>
              <li>Add subtle blur/glow to soften the edge.</li>
              <li>Export at higher resolution if you’re baking screenshots.</li>
            </ul>
          </div>

          <div class="gtp-mini-card">
            <h4>Polygon looks “wrong”</h4>
            <ul class="gtp-list">
              <li>Point order is likely incorrect — try listing points clockwise around the shape.</li>
              <li>Coordinates may be outside the expected range for your unit.</li>
            </ul>
          </div>
        </section>
      `;
    },

    _sectionExport() {
      return `
        <section class="gtp-section" data-ctp-panel="export">
          <h3>Export patterns</h3>
          <p>
            Clip paths export as plain CSS. That means the output is portable across frameworks and environments.
          </p>

          <pre class="gtp-code"><code>.layer {
  background: /* gradient */;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}</code></pre>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Portable workflow</div>
            <ul class="gtp-list">
              <li>Prefer percent-based shapes when you want responsive scaling.</li>
              <li>Save useful polygons as presets.</li>
              <li>Document complex custom paths with comments in exported CSS.</li>
            </ul>
          </div>
        </section>
      `;
    },

    // ----------------------------
    // Events & navigation
    // ----------------------------
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

        const actionEl = e.target.closest("[data-ctp-action]");
        if (actionEl) {
          const action = actionEl.getAttribute("data-ctp-action");
          this._handleAction(action, actionEl);
          return;
        }

        const navBtn = e.target.closest(".gtp-nav-btn");
        if (navBtn) {
          const section = navBtn.getAttribute("data-ctp-section");
          if (section) this._setSection(section);
          return;
        }

        if (e.target === this._backdrop) this.close();
      };

      this._onChange = (e) => {
        if (!this._isOpen) return;
        const t = e.target;

        if (t && t.id === "ctpPointUnit") {
          this._pointUnit = t.value === "px" ? "px" : "percent";
          // keep numbers, just change clamping/ranges; regenerate output
          this._renderPointsTable();
          this._updatePolygonOut();
          this._setPointsStatus("Unit changed.");
        }
      };

      document.addEventListener("keydown", this._onKeyDown, true);
      this._root.addEventListener("click", this._onClick, true);
      this._root.addEventListener("change", this._onChange, true);
      this._root.addEventListener("input", this._onInput.bind(this), true);
    },

    _detachEvents() {
      document.removeEventListener("keydown", this._onKeyDown, true);
      if (this._root) {
        this._root.removeEventListener("click", this._onClick, true);
        this._root.removeEventListener("change", this._onChange, true);
      }
      this._onKeyDown = this._onClick = this._onChange = null;
    },

    _handleAction(action, el) {
      switch (action) {
        case "close":
          this.close();
          return;

        case "copy-cheatsheet":
          this._copyText(this._cheatSheetText(), "Cheat sheet copied.");
          return;

        // --- Custom examples ---
        case "load-example":
          this._loadSelectedExample();
          return;

        case "copy-example":
          this._copyCurrentCustomInput();
          return;

        case "apply-demo":
          this._applyCustomToPreview();
          return;

        // --- Inset quick apply (Points & Insets 101) ---
        case "apply-inset": {
          const val = el.getAttribute("data-inset");
          if (val) {
            // apply to the points preview (teaching section) and also to main preview for convenience
            this._applyClipToPreview(val, "#ctpPreviewLayerPoints", true);
            this._applyClipToPreview(val, "#ctpPreviewLayer", true);
            this._setPointsStatus("Inset applied to preview.");
          }
          return;
        }

        // --- Points builder ---
        case "points-reset":
          this._resetPoints();
          this._renderPointsTable();
          this._updatePolygonOut();
          this._setPointsStatus("Reset points.");
          return;

        case "points-add":
          this._addPoint();
          this._renderPointsTable();
          this._updatePolygonOut();
          this._setPointsStatus("Added point.");
          return;

        case "points-remove": {
          const idx = Number(el.getAttribute("data-idx"));
          if (Number.isFinite(idx)) {
            this._points.splice(idx, 1);
            if (this._points.length < 3) this._resetPoints();
            this._renderPointsTable();
            this._updatePolygonOut();
            this._setPointsStatus("Removed point.");
          }
          return;
        }

        case "points-apply":
          this._applyPointsPolygonToPreview();
          return;

        case "points-copy":
          this._copyText(this._polygonClipPathValue(), "Copied polygon() clip-path.");
          return;

        default:
          return;
      }
    },

    _onInput(e) {
      const t = e.target;
      if (!t) return;

      // live update points table edits
      if (t.matches("[data-ctp-point-x]") || t.matches("[data-ctp-point-y]")) {
        const idx = Number(t.getAttribute("data-idx"));
        const axis = t.getAttribute("data-axis");
        if (!Number.isFinite(idx) || !axis) return;

        const raw = Number(t.value);
        const v = Number.isFinite(raw) ? raw : 0;

        if (axis === "x") this._points[idx].x = v;
        if (axis === "y") this._points[idx].y = v;

        this._updatePolygonOut(true);
        // soft preview as they type
        this._applyClipToPreview(this._polygonClipPathValue(), "#ctpPreviewLayerPoints", true);
      }

      // live update custom editor as they type
      if (t.id === "ctpClipInput") {
        this._applyClipToPreview(t.value, "#ctpPreviewLayer", true, { soft: true });
      }
    },

    _setSection(section) {
      const panels = this._dialog.querySelectorAll(".gtp-section");
      panels.forEach((p) => p.classList.remove("is-active"));
      const panel = this._dialog.querySelector(`.gtp-section[data-ctp-panel="${section}"]`);
      if (panel) panel.classList.add("is-active");

      const navBtns = this._dialog.querySelectorAll(".gtp-nav-btn");
      navBtns.forEach((b) => b.removeAttribute("aria-current"));
      const nav = this._dialog.querySelector(`.gtp-nav-btn[data-ctp-section="${section}"]`);
      if (nav) nav.setAttribute("aria-current", "true");

      // ensure point builder UI is rendered when user visits it
      if (section === "points101") {
        this._renderPointsTable();
        this._updatePolygonOut(true);
        this._applyClipToPreview(this._polygonClipPathValue(), "#ctpPreviewLayerPoints", true);
      }
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

    // ----------------------------
    // Demo init
    // ----------------------------
    _injectDemoStyles() {
      // small, demo-only helpers; main styling is in popup.css
      const style = document.createElement("style");
      style.setAttribute("data-ctp-demo-style", "true");
      style.textContent = `
        .ctp-pt-row {
          display:grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 10px;
          align-items:center;
          margin-bottom: 8px;
        }
        .ctp-pt-row .gtp-input { width: 100%; }
        .ctp-pt-head {
          display:grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 10px;
          font-size: 12px;
          opacity: .9;
          margin-bottom: 8px;
        }
      `;
      document.head.appendChild(style);
      this._styleEl = style;
    },

    _initExamples() {
      this._examples = {
        diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        hexagon: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        star: "polygon(50% 2%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        ticket: "polygon(6% 0%, 94% 0%, 100% 18%, 94% 36%, 100% 54%, 94% 72%, 100% 90%, 94% 100%, 6% 100%, 0% 82%, 6% 64%, 0% 46%, 6% 28%, 0% 10%)",
        circle: "circle(45% at 50% 50%)",
        ellipse: "ellipse(46% 32% at 50% 50%)",
        insetCard: "inset(8% 8% 8% 8% round 14%)",
        insetPill: "inset(18% 10% 18% 10% round 999px)",
        wave: "path('M 0 55 Q 18 35, 36 55 T 72 55 T 108 55 V 100 H 0 Z')",
      };
    },

    _initDemo() {
      // initialize point builder defaults
      this._resetPoints();

      // initialize custom example editor + preview
      const select = this._dialog.querySelector("#ctpExampleSelect");
      const input = this._dialog.querySelector("#ctpClipInput");

      if (select && input) {
        input.value = this._examples[select.value] || this._examples.diamond;
        this._applyClipToPreview(input.value, "#ctpPreviewLayer", true);
      }

      // set default in points preview as well
      this._applyClipToPreview(this._polygonClipPathValue(), "#ctpPreviewLayerPoints", true);
      const out = this._dialog.querySelector("#ctpPolygonOut");
      if (out) out.value = this._polygonClipPathValue();
    },

    // ----------------------------
    // Custom example editor
    // ----------------------------
    _loadSelectedExample() {
      const select = this._dialog.querySelector("#ctpExampleSelect");
      const input = this._dialog.querySelector("#ctpClipInput");
      if (!select || !input) return;

      const val = this._examples[select.value] || "";
      input.value = val;
      this._applyClipToPreview(val, "#ctpPreviewLayer", true);
      this._setStatus("Loaded example.");
    },

    _copyCurrentCustomInput() {
      const input = this._dialog.querySelector("#ctpClipInput");
      if (!input) return;
      this._copyText(input.value.trim(), "Copied clip-path value.");
    },

    _applyCustomToPreview() {
      const input = this._dialog.querySelector("#ctpClipInput");
      if (!input) return;
      const ok = this._applyClipToPreview(input.value, "#ctpPreviewLayer", false);
      this._setStatus(ok ? "Applied to preview." : "Invalid clip-path syntax.");
    },

    // ----------------------------
    // Points builder
    // ----------------------------
    _resetPoints() {
      this._points = [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ];
      this._pointUnit = "percent";
      const unitSel = this._dialog?.querySelector("#ctpPointUnit");
      if (unitSel) unitSel.value = "percent";
    },

    _addPoint() {
      // insert point roughly near last point; user can refine
      const last = this._points[this._points.length - 1] || { x: 50, y: 50 };
      const next = { x: this._clamp(last.x + 8, this._minCoord(), this._maxCoord()), y: this._clamp(last.y + 6, this._minCoord(), this._maxCoord()) };
      this._points.push(next);
    },

    _renderPointsTable() {
      const host = this._dialog.querySelector("#ctpPointsTable");
      if (!host) return;

      const min = this._minCoord();
      const max = this._maxCoord();

      host.innerHTML = `
        <div class="ctp-pt-head">
          <div><strong>X</strong> (${this._pointUnit === "percent" ? "0–100" : "px"})</div>
          <div><strong>Y</strong> (${this._pointUnit === "percent" ? "0–100" : "px"})</div>
          <div></div>
        </div>
        ${this._points.map((p, i) => `
          <div class="ctp-pt-row">
            <input class="gtp-input" type="number" step="1" min="${min}" max="${max}"
              value="${this._safeNum(p.x)}" data-idx="${i}" data-axis="x" data-ctp-point-x />
            <input class="gtp-input" type="number" step="1" min="${min}" max="${max}"
              value="${this._safeNum(p.y)}" data-idx="${i}" data-axis="y" data-ctp-point-y />
            <button class="gtp-btn" type="button" data-ctp-action="points-remove" data-idx="${i}">Remove</button>
          </div>
        `).join("")}
        <div style="margin-top:10px; font-size:12px; opacity:.92;">
          Points are connected in order, then closed. For clean shapes, order them around the perimeter.
        </div>
      `;

      // clamp existing values into current unit range
      this._points.forEach((p) => {
        p.x = this._clamp(Number(p.x), min, max);
        p.y = this._clamp(Number(p.y), min, max);
      });
    },

    _polygonClipPathValue() {
      const unit = this._pointUnit === "px" ? "px" : "%";
      const pts = (this._points || []).map((p) => {
        const x = this._clamp(Number(p.x), this._minCoord(), this._maxCoord());
        const y = this._clamp(Number(p.y), this._minCoord(), this._maxCoord());
        return `${this._round3(x)}${unit} ${this._round3(y)}${unit}`;
      });
      return `polygon(${pts.join(", ")})`;
    },

    _updatePolygonOut(silent = false) {
      const out = this._dialog.querySelector("#ctpPolygonOut");
      if (!out) return;
      out.value = this._polygonClipPathValue();
      if (!silent) this._setPointsStatus("Updated polygon().");
    },

    _applyPointsPolygonToPreview() {
      const val = this._polygonClipPathValue();
      const ok = this._applyClipToPreview(val, "#ctpPreviewLayerPoints", false);
      this._setPointsStatus(ok ? "Applied to preview." : "Invalid polygon().");
    },

    _setPointsStatus(msg) {
      const el = this._dialog.querySelector("#ctpPointsStatus");
      if (!el) return;
      el.textContent = msg;
      if (msg) el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
    },

    // ----------------------------
    // Shared preview apply
    // ----------------------------
    _applyClipToPreview(raw, selector, silentStatus, opts = {}) {
      const val = this._normalizeClipPathInput(raw);
      const layer = this._dialog.querySelector(selector);
      if (!layer) return false;

      if (!val) {
        if (!silentStatus && !opts.soft) {
          // send to main status if exists
          this._setStatus("Invalid clip-path. Use polygon/circle/ellipse/inset/path.");
        }
        if (!opts.soft) layer.style.clipPath = "";
        layer.style.outline = "2px solid rgba(255,80,120,.35)";
        return false;
      }

      layer.style.outline = "none";
      layer.style.clipPath = val;

      // subtle feedback
      try {
        layer.animate([{ transform: "scale(0.995)" }, { transform: "scale(1)" }], { duration: 140, easing: "ease-out" });
      } catch {}

      if (!silentStatus && !opts.soft) this._setStatus("Valid clip-path applied.");
      return true;
    },

    _normalizeClipPathInput(raw) {
      if (!raw) return null;
      let s = String(raw).trim();
      s = s.replace(/^clip-path\s*:\s*/i, "").replace(/;$/, "").trim();
      const ok = /^(polygon|inset|circle|ellipse|path)\(/i.test(s);
      return ok ? s : null;
    },

    _setStatus(msg) {
      const el = this._dialog.querySelector("#ctpStatus");
      if (!el) return;
      el.textContent = msg;
      if (msg) el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
    },

    // ----------------------------
    // Copy helpers
    // ----------------------------
    _cheatSheetText() {
      return [
        "CLIP-PATH CHEAT SHEET",
        "",
        "Functions:",
        "  polygon(x y, x y, ...)",
        "  inset(t r b l round radius)",
        "  circle(r at x y)",
        "  ellipse(rx ry at x y)",
        "  path('M ... Z')",
        "",
        "Beginner polygon example (diamond):",
        "  polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        "",
        "Beginner inset examples:",
        "  inset(8% 8% 8% 8%)",
        "  inset(10% 10% 10% 10% round 18%)",
        "  inset(4% 18% 20% 6% round 10%)",
        "",
        "Tips:",
        "  - Use % for responsive geometry.",
        "  - Keep point count low (cleaner + more stable).",
        "  - For shapes with smooth corners, inset(round ...) is often easier than many polygon points.",
      ].join("\n");
    },

    async _copyText(text, okMsg) {
      const t = String(text || "").trim();
      if (!t) {
        this._setStatus("Nothing to copy.");
        return;
      }
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
        // decide where to show it
        this._setStatus(okMsg);
      } catch {
        this._setStatus("Copy failed. You can manually select and copy.");
      }
    },

    // ----------------------------
    // Small utils
    // ----------------------------
    _minCoord() { return this._pointUnit === "px" ? 0 : 0; },
    _maxCoord() { return this._pointUnit === "px" ? 320 : 100; },
    _clamp(v, lo, hi) {
      const n = Number(v);
      if (!Number.isFinite(n)) return lo;
      return Math.max(lo, Math.min(hi, n));
    },
    _round3(v) { return Math.round(Number(v) * 1000) / 1000; },
    _safeNum(v) { return Number.isFinite(Number(v)) ? Number(v) : 0; },
  };
})();
