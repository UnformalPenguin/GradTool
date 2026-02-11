/* color_tutorial_popup.js
   Modal popup tutorial for Colors (in-depth), built to match popup.css.

   Requirements:
     - Load popup.css once:
         <link rel="stylesheet" href="popup.css">

   Usage:
     - Include this file after your main script:
         <script src="color_tutorial_popup.js"></script>

     - Call showColorPopup() from a color/info icon:
         onclick="showColorPopup()"

   Optional:
     showColorPopup({ initialSection: "stops" })
*/

(function () {
  "use strict";

  window.showColorPopup = function showColorPopup(event = null, options = {}) {
    ColorTutorialPopup.open(event, options);
  };
  window.hideColorPopup = function hideColorPopup() {
    ColorTutorialPopup.close();
  };

  const ColorTutorialPopup = {
    _isOpen: false,
    _root: null,
    _backdrop: null,
    _dialog: null,
    _lastActiveEl: null,
    _opts: null,
    _styleEl: null, // demo-only keyframes etc.

    open(event = null, options = {}) {
      if (this._isOpen) return;

        if (event) {
            try {
                options.event.stopPropagation();
            }
            catch {
                console.log("event stopping failed");
            }
        }

      this._opts = {
        initialSection: options.initialSection || "overview", // overview | stops | workflow | theory | harmony | hsv | filters | hueShift | troubleshooting | export
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

      if (this._styleEl && this._styleEl.parentNode) this._styleEl.parentNode.removeChild(this._styleEl);
      this._styleEl = null;

      if (this._root && this._root.parentNode) this._root.parentNode.removeChild(this._root);

      this._root = null;
      this._backdrop = null;
      this._dialog = null;

      document.documentElement.classList.remove("gtp-scroll-lock");

      try {
        if (this._lastActiveEl && typeof this._lastActiveEl.focus === "function") this._lastActiveEl.focus();
      } catch (_) {}

      this._lastActiveEl = null;
      this._isOpen = false;
    },

    // -------------------- Build UI --------------------
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
      dialog.setAttribute("aria-labelledby", "ctp-color-title");
      dialog.tabIndex = -1;

      dialog.innerHTML = this._templateHTML();

      root.appendChild(backdrop);
      root.appendChild(dialog);
      document.body.appendChild(root);

      this._root = root;
      this._backdrop = backdrop;
      this._dialog = dialog;

      this._injectDemoStyles();
        this._initDemos();
        enhanceCyberSelects(dialog);
    },

    _templateHTML() {
      // Built from functions for each section so it’s maintainable and easy to expand.
      return `
        ${this._renderHeader()}
        <div class="gtp-body">
          ${this._renderNav()}
          <main class="gtp-main">
            ${this._renderOverviewSection()}
            ${this._renderStopsSection()}
            ${this._renderWorkflowSection()}
            ${this._renderTheorySection()}
            ${this._renderHarmonySection()}
            ${this._renderHSVSection()}
            ${this._renderFiltersSection()}
            ${this._renderHueShiftSection()}
            ${this._renderTroubleshootingSection()}
            ${this._renderExportSection()}
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
              <span>Colors</span>
              <span class="gtp-pill">Stops • Palettes • Filters</span>
            </div>
            <h2 id="ctp-color-title" class="gtp-title">Color Stops, Palettes, and Color Theory</h2>
            <p class="gtp-subtitle">
              Learn how color stops work in this app, how to build better palettes, and how hue shift, saturation,
              contrast, and opacity interact with gradients and animations — while staying fully exportable as HTML + CSS.
            </p>
          </div>
          <div class="gtp-header-right">
            <button class="gtp-icon-btn" type="button" data-ctp-action="copy-cheatsheet" title="Copy color cheat sheet">
              Copy Cheat Sheet
            </button>
            <button class="gtp-close-btn" type="button" data-ctp-action="close" aria-label="Close tutorial">
              ✕
            </button>
          </div>
        </header>
      `;
    },

    _renderNav() {
      return `
        <aside class="gtp-nav" aria-label="Tutorial sections">
          <button class="gtp-nav-btn" type="button" data-ctp-section="overview">Overview</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="stops">Color Stops in GradTool</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="workflow">Practical Workflow</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="theory">Color Theory (What Matters)</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="harmony">Harmony Recipes</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="hsv">Hue / Saturation / Value</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="filters">Filters in Layers</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="hueShift">Hue Shift (Smooth Loops)</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="troubleshooting">Troubleshooting</button>
          <button class="gtp-nav-btn" type="button" data-ctp-section="export">Export & Best Practices</button>
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

    // -------------------- Sections (built by separate functions) --------------------
    _renderOverviewSection() {
      return `
        <section class="gtp-section" data-ctp-panel="overview">
          <h3>What “Color” Means in This App</h3>
          <p>
            In GradTool, colors are primarily expressed through <strong>color stops</strong> inside a gradient.
            Each layer has its own gradient and its own stops. The stop list is the “DNA” of the look:
            where the colors sit, how they blend, and how much contrast you get.
          </p>

          <div class="gtp-callout">
            <div class="gtp-callout-title">The real control knobs</div>
            <ul class="gtp-list">
              <li><strong>Stop color</strong> — the actual hue (plus alpha/opacity).</li>
              <li><strong>Stop position</strong> — where that color appears along the gradient.</li>
              <li><strong>Stop spacing</strong> — uneven spacing creates highlights, bands, or “hot spots.”</li>
              <li><strong>Layer filters</strong> — hue shift, saturation, contrast, blur, glow.</li>
              <li><strong>Layer blend + opacity</strong> — how a layer stacks over others.</li>
            </ul>
          </div>

          <h3>What makes a palette “good” for gradients</h3>
          <ul class="gtp-list">
            <li><strong>Clear contrast</strong> between at least two stops (otherwise it looks flat).</li>
            <li><strong>One dominant hue family</strong> + one accent (more coherent than “rainbow chaos”).</li>
            <li><strong>Dark anchor</strong> (a deep tone) so bright colors have something to pop against.</li>
            <li><strong>Alpha used intentionally</strong> (transparency creates softer blends and depth).</li>
          </ul>
        </section>
      `;
    },

    _renderStopsSection() {
      return `
        <section class="gtp-section" data-ctp-panel="stops">
          <h3>Color Stops in GradTool</h3>
          <p>
            A gradient is a continuous blend between multiple stops. Stops are defined by:
            <strong>color</strong> + <strong>position</strong>.
          </p>

          <div class="gtp-grid2">
            <div>
              <h4>How stops behave</h4>
              <ul class="gtp-list">
                <li><strong>Close stops</strong> create tight transitions → crisp highlights or bands.</li>
                <li><strong>Far stops</strong> create gentle blends → smooth, airy gradients.</li>
                <li><strong>Repeated colors</strong> at different positions can “hold” a region stable.</li>
                <li><strong>Alpha stops</strong> (transparent) are powerful for layering depth.</li>
              </ul>
            </div>
            <div class="gtp-mini-card">
              <h4>Stop positioning strategies</h4>
              <ul class="gtp-list">
                <li><strong>Even spacing</strong>: calm, “poster” smooth.</li>
                <li><strong>Weighted spacing</strong>: one highlight area (good for focal points).</li>
                <li><strong>Paired stops</strong>: two stops close together to make a highlight ridge.</li>
              </ul>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Practical default</div>
            <p class="gtp-tight">
              For a lot of gradients: 3–5 stops is the sweet spot. Too few can look flat; too many can look noisy.
              If you do use many stops, keep most of them related (same hue family) and use one accent.
            </p>
          </div>

          <h4>Demo: how spacing changes the look</h4>
          <div class="gtp-grid2">
            <div>
              <div class="gtp-row">
                <label class="gtp-label" style="margin:0;">Spacing preset</label>
                <select class="gtp-select" id="ctpStopPreset">
                  <option value="even">Even spacing (smooth)</option>
                  <option value="highlight">Highlight ridge (tight pair)</option>
                  <option value="banded">Banded (multiple close stops)</option>
                  <option value="soft">Soft fade (wide spacing + alpha)</option>
                </select>
                <button class="gtp-btn" type="button" data-ctp-action="apply-stop-demo">Apply</button>
                <button class="gtp-btn" type="button" data-ctp-action="copy-stop-css">Copy CSS</button>
              </div>

              <label class="gtp-label" for="ctpStopCssOut">Generated CSS</label>
              <textarea id="ctpStopCssOut" class="gtp-textarea" rows="10" spellcheck="false"></textarea>

              <div class="gtp-row gtp-row-slim">
                <span id="ctpStopStatus" class="gtp-status" aria-live="polite"></span>
              </div>
            </div>

            <div>
              <div class="gtp-preview-frame">
                <div class="gtp-preview">
                  <div class="gtp-preview-layer" id="ctpStopPreviewLayer"></div>
                </div>
              </div>
              <div class="gtp-preview-caption">
                Spacing alone can make the same palette feel calm, glossy, or chaotic.
              </div>
            </div>
          </div>
        </section>
      `;
    },

    _renderWorkflowSection() {
      return `
        <section class="gtp-section" data-ctp-panel="workflow">
          <h3>A Workflow That Produces Better Results</h3>

          <ol class="gtp-steps">
            <li><strong>Pick a base mood</strong>: dark + neon, pastel, sunset, cosmic, metallic.</li>
            <li><strong>Start with 3 stops</strong>: dark anchor → mid tone → highlight.</li>
            <li><strong>Adjust positions first</strong> before adding more colors.</li>
            <li><strong>Add 1 accent stop</strong> if needed, not 5.</li>
            <li><strong>Layer filters last</strong>: hue shift, saturation, contrast, blur, glow.</li>
          </ol>

          <div class="gtp-grid2">
            <div class="gtp-mini-card">
              <h4>How to avoid “muddy” gradients</h4>
              <ul class="gtp-list">
                <li>Don’t mix too many unrelated hues at full saturation.</li>
                <li>Keep one or two stops slightly desaturated.</li>
                <li>Add a deeper anchor color to increase perceived contrast.</li>
                <li>Use alpha on one stop instead of adding a new color.</li>
              </ul>
            </div>

            <div class="gtp-mini-card">
              <h4>How to make gradients feel “glossy”</h4>
              <ul class="gtp-list">
                <li>Use a tight stop pair (highlight ridge).</li>
                <li>Increase contrast slightly, not a lot.</li>
                <li>Use a faint glow (drop-shadow) or small blur to soften banding.</li>
              </ul>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Rule of thumb</div>
            <p class="gtp-tight">
              First get the palette to feel right in a static gradient. Then animate it.
              Animating a bad palette just makes the badness move around faster.
            </p>
          </div>
        </section>
      `;
    },

    _renderTheorySection() {
      return `
        <section class="gtp-section" data-ctp-panel="theory">
          <h3>Color Theory (What Actually Helps)</h3>
          <p>
            You don’t need a textbook. You need a few rules that translate to gradients.
          </p>

          <div class="gtp-grid2">
            <div>
              <h4>1) Hue vs Value</h4>
              <p class="gtp-tight">
                Most “messy” palettes fail on value (lightness), not hue. If everything is the same brightness,
                it looks flat. If you anchor with a dark stop and add a clear highlight stop, the gradient reads as “3D.”
              </p>

              <h4>2) Saturation as a spice</h4>
              <p class="gtp-tight">
                Full saturation everywhere is loud and often ugly. Use saturation for emphasis:
                one or two high-sat stops, supported by calmer neighbors.
              </p>
            </div>

            <div class="gtp-mini-card">
              <h4>3) Temperature contrast</h4>
              <ul class="gtp-list">
                <li><strong>Warm</strong>: reds, oranges, yellows</li>
                <li><strong>Cool</strong>: blues, teals, violets</li>
              </ul>
              <p class="gtp-tight">
                Warm + cool combinations feel dynamic. If everything is warm or everything is cool,
                the gradient can look monotone unless value contrast is strong.
              </p>

              <h4>4) The “anchor + accent” pattern</h4>
              <p class="gtp-tight">
                A great gradient often has 1 dominant family (anchor) and 1 accent hue. That’s it.
              </p>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">If you only remember one thing</div>
            <p class="gtp-tight">
              Control <strong>value contrast</strong> first (dark to light). Then tune hue and saturation.
            </p>
          </div>
        </section>
      `;
    },

    _renderHarmonySection() {
      return `
        <section class="gtp-section" data-ctp-panel="harmony">
          <h3>Harmony Recipes (Fast Palette Generation)</h3>

          <p>
            Harmony recipes are quick ways to pick colors that “fit.” Use these as starting points,
            then tweak positions and saturation to match your vibe.
          </p>

          <div class="gtp-grid2">
            <div class="gtp-mini-card">
              <h4>Analogous (smooth)</h4>
              <p class="gtp-tight">Pick a base hue, then add neighbors ±20–40°.</p>
              <pre class="gtp-code"><code>H, H+25°, H-25°</code></pre>
              <p class="gtp-tight">Feels cohesive, calm, “premium.”</p>
            </div>

            <div class="gtp-mini-card">
              <h4>Complementary (high energy)</h4>
              <p class="gtp-tight">Pick a hue, then add its opposite (+180°).</p>
              <pre class="gtp-code"><code>H, H+180°</code></pre>
              <p class="gtp-tight">Feels punchy; can get harsh if both are fully saturated.</p>
            </div>

            <div class="gtp-mini-card">
              <h4>Split Complementary (balanced)</h4>
              <pre class="gtp-code"><code>H, H+150°, H+210°</code></pre>
              <p class="gtp-tight">Less harsh than pure complementary, still vibrant.</p>
            </div>

            <div class="gtp-mini-card">
              <h4>Triadic (playful)</h4>
              <pre class="gtp-code"><code>H, H+120°, H+240°</code></pre>
              <p class="gtp-tight">Easy to overdo. Use one as dominant, others as accents.</p>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Gradient-friendly trick</div>
            <p class="gtp-tight">
              Pick your harmony hues, then set their values (brightness) intentionally:
              one dark anchor, one mid, one highlight. That reads better than “all mid brightness.”
            </p>
          </div>
        </section>
      `;
    },

    _renderHSVSection() {
      return `
        <section class="gtp-section" data-ctp-panel="hsv">
          <h3>Hue, Saturation, Value (and Why They Matter)</h3>

          <div class="gtp-grid2">
            <div>
              <h4>Hue</h4>
              <p class="gtp-tight">
                The “color family”: red, blue, purple, etc. Hue changes are what hue shift animates.
              </p>

              <h4>Saturation</h4>
              <p class="gtp-tight">
                The intensity. Saturation down makes colors more neutral; up makes them more neon.
                In gradients, saturation is best used in moderation: too much everywhere looks cheap.
              </p>

              <h4>Value / Brightness</h4>
              <p class="gtp-tight">
                The lightness/darkness. Value contrast is the #1 reason a gradient feels deep.
              </p>
            </div>

            <div class="gtp-mini-card">
              <h4>Alpha (opacity) is a fourth axis</h4>
              <p class="gtp-tight">
                Alpha isn’t part of HSV, but it matters hugely for gradients. A transparent stop can “soften” a transition
                without adding new colors. In layered designs, alpha stops create depth.
              </p>

              <h4>Practical recipe</h4>
              <ul class="gtp-list">
                <li>One dark anchor stop (lower value)</li>
                <li>One mid stop (moderate value)</li>
                <li>One highlight stop (high value, maybe lower saturation)</li>
                <li>Optional: one accent stop (higher saturation)</li>
              </ul>
            </div>
          </div>
        </section>
      `;
    },

    _renderFiltersSection() {
      return `
        <section class="gtp-section" data-ctp-panel="filters">
          <h3>Filters in Layers (Hue, Saturation, Contrast, Blur)</h3>
          <p>
            Filters modify the whole layer after the gradient is rendered. That means they affect all stops together,
            which is why they’re great as “final polish.”
          </p>

          <div class="gtp-grid2">
            <div>
              <h4>Hue rotate</h4>
              <p class="gtp-tight">
                Rotates hues around the color wheel. Great for animated color cycling.
              </p>

              <h4>Saturate</h4>
              <p class="gtp-tight">
                Increases or decreases saturation. Good for turning a palette neon or muted.
              </p>

              <h4>Contrast</h4>
              <p class="gtp-tight">
                Separates light and dark. Small increases can add “pop.” Too much can crush details.
              </p>

              <h4>Blur</h4>
              <p class="gtp-tight">
                Softens edges and reduces banding. Small blur can make gradients feel smoother and more premium.
              </p>
            </div>

            <div class="gtp-mini-card">
              <h4>Filter stacking: the non-obvious rule</h4>
              <p class="gtp-tight">
                If you animate filters, keep the filter stack consistent in every keyframe.
                Example: if blur is “static,” include it in the animated keyframes anyway.
                If you don’t, the browser can “pop” when switching between different filter lists.
              </p>

              <pre class="gtp-code"><code>/* Good: blur always present */
0%   { filter: blur(2px) hue-rotate(0deg); }
100% { filter: blur(2px) hue-rotate(360deg); }</code></pre>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">When to use filters vs changing stops</div>
            <ul class="gtp-list">
              <li>Use <strong>stops</strong> to design the palette and structure (highlights, anchors).</li>
              <li>Use <strong>filters</strong> to tune the overall vibe (neon, muted, punchy, dreamy).</li>
            </ul>
          </div>
        </section>
      `;
    },

    _renderHueShiftSection() {
      return `
        <section class="gtp-section" data-ctp-panel="hueShift">
          <h3>Hue Shift (How It Works and How to Keep It Smooth)</h3>

          <p>
            Hue shift is typically implemented as <code>filter: hue-rotate(Xdeg)</code> over time.
            A smooth loop is about two things: <strong>timing</strong> and <strong>filter consistency</strong>.
          </p>

          <div class="gtp-grid2">
            <div class="gtp-mini-card">
              <h4>Best practices</h4>
              <ul class="gtp-list">
                <li>Use <strong>linear</strong> timing for hue.</li>
                <li>Animate a full turn: <code>fromHue</code> to <code>fromHue + 360</code>.</li>
                <li>Add a midpoint (50%) to help some compositors stay smooth.</li>
                <li>Keep the filter stack consistent (include blur/contrast/saturation if present).</li>
                <li>Avoid applying <code>steps()</code> timing globally when hue is also running.</li>
              </ul>
            </div>

            <div>
              <h4>Example: stable hue loop</h4>
              <pre class="gtp-code"><code>@keyframes hueLoop {
  0%   { filter: blur(2px) hue-rotate(10deg); }
  50%  { filter: blur(2px) hue-rotate(190deg); }
  100% { filter: blur(2px) hue-rotate(370deg); }
}
.layer { animation: hueLoop 14s linear infinite; }</code></pre>

              <div class="gtp-callout">
                <div class="gtp-callout-title">Why 370°?</div>
                <p class="gtp-tight">
                  370° is just 10° + 360°. It ensures the hue rotates one full turn and loops back seamlessly.
                  The start and end are the same color, but the motion is continuous.
                </p>
              </div>
            </div>
          </div>

          <h4>Demo: smooth vs harsh hue cycling</h4>
          <div class="gtp-grid2">
            <div>
              <div class="gtp-row">
                <label class="gtp-label" style="margin:0;">Hue style</label>
                <select class="gtp-select" id="ctpHueDemoPreset">
                  <option value="smooth">Smooth loop (linear + midpoint)</option>
                  <option value="fast">Too fast (feels frantic)</option>
                  <option value="stepped">Stepped (intentional, but choppy)</option>
                </select>
                <button class="gtp-btn" type="button" data-ctp-action="apply-hue-demo">Apply</button>
                <button class="gtp-btn" type="button" data-ctp-action="copy-hue-css">Copy CSS</button>
              </div>

              <label class="gtp-label" for="ctpHueCssOut">Generated CSS</label>
              <textarea id="ctpHueCssOut" class="gtp-textarea" rows="10" spellcheck="false"></textarea>

              <div class="gtp-row gtp-row-slim">
                <span id="ctpHueStatus" class="gtp-status" aria-live="polite"></span>
              </div>
            </div>

            <div>
              <div class="gtp-preview-frame">
                <div class="gtp-preview">
                  <div class="gtp-preview-layer" id="ctpHuePreviewLayer"></div>
                </div>
              </div>
              <div class="gtp-preview-caption">
                Hue shift changes the entire palette at once. Use it as a “vibe dial,” not a chaos button.
              </div>
            </div>
          </div>
        </section>
      `;
    },

    _renderTroubleshootingSection() {
      return `
        <section class="gtp-section" data-ctp-panel="troubleshooting">
          <h3>Troubleshooting</h3>

          <div class="gtp-mini-card">
            <h4>My gradient looks “muddy”</h4>
            <ul class="gtp-list">
              <li>Reduce the number of unrelated hues.</li>
              <li>Increase value contrast (add a deeper anchor or a brighter highlight).</li>
              <li>Lower saturation for one or more stops.</li>
              <li>Try a small blur to reduce banding and harsh transitions.</li>
            </ul>
          </div>

          <div class="gtp-mini-card">
            <h4>My hue shift pops or feels jerky</h4>
            <ul class="gtp-list">
              <li>Use linear timing for hue shifts.</li>
              <li>Keep the filter stack consistent across keyframes (include blur/etc.).</li>
              <li>Make sure <code>steps()</code> timing isn’t applied to the whole element.</li>
              <li>Try a longer duration (12–24s is often better than 4–6s).</li>
            </ul>
          </div>

          <div class="gtp-mini-card">
            <h4>My colors look great alone but bad when layered</h4>
            <ul class="gtp-list">
              <li>Reduce opacity on upper layers.</li>
              <li>Use blend modes carefully; some combinations over-saturate.</li>
              <li>Use alpha stops to soften harsh overlaps.</li>
              <li>Try reducing saturation on one layer and increasing contrast slightly.</li>
            </ul>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Brutal but true</div>
            <p class="gtp-tight">
              If the base palette isn’t good, filters won’t save it. Fix value contrast first, then hue/saturation.
            </p>
          </div>
        </section>
      `;
    },

    _renderExportSection() {
      return `
        <section class="gtp-section" data-ctp-panel="export">
          <h3>Export & Best Practices</h3>
          <p>
            Your export should be standard CSS gradients and filters — no special runtime required.
          </p>

          <div class="gtp-grid2">
            <div>
              <h4>Typical exported gradient</h4>
              <pre class="gtp-code"><code>.layer {
  background: radial-gradient(circle at 30% 30%,
    rgba(190,110,255,0.95) 0%,
    rgba(90,180,255,0.85) 55%,
    rgba(10,9,18,0.0) 100%);
}</code></pre>

              <h4>With filters</h4>
              <pre class="gtp-code"><code>.layer {
  filter: blur(2px) saturate(1.15) contrast(1.05);
}</code></pre>
            </div>

            <div class="gtp-mini-card">
              <h4>Best practices for portability</h4>
              <ul class="gtp-list">
                <li>Prefer percentages in stop positions for responsiveness.</li>
                <li>Keep “special effects” in filters, not baked into dozens of stops.</li>
                <li>Use alpha as a design tool, not as an accident.</li>
                <li>For animated hue shift, export linear timing + stable filter stacks.</li>
              </ul>

              <h4>Accessibility note</h4>
              <p class="gtp-tight">
                Extremely high contrast + fast color cycling can be uncomfortable. If you animate color, keep it slow.
              </p>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Quick checklist</div>
            <ul class="gtp-list">
              <li>Does the palette read well without animation?</li>
              <li>Is there a dark anchor and a highlight?</li>
              <li>Is saturation controlled?</li>
              <li>Are filter animations smooth and stable?</li>
            </ul>
          </div>
        </section>
      `;
    },

    // -------------------- Events --------------------
    _attachEvents() {
      this._onKeyDown = (e) => {
        if (!this._isOpen) return;

        if (e.key === "Escape") {
          e.preventDefault();
          this.close();
          return;
        }
        if (e.key === "Tab") {
          this._trapFocus(e);
        }
      };

      this._onClick = (e) => {
        if (!this._isOpen) return;

        const actionEl = e.target.closest("[data-ctp-action]");
        if (actionEl) {
          this._handleAction(actionEl.getAttribute("data-ctp-action"));
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
          this._copyCheatSheet();
          break;

        // Demos
        case "apply-stop-demo":
          this._applyStopDemoPreset();
          break;
        case "copy-stop-css":
          this._copyStopCSS();
          break;
        case "apply-hue-demo":
          this._applyHueDemoPreset();
          break;
        case "copy-hue-css":
          this._copyHueCSS();
          break;
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

    // -------------------- Demos --------------------
    _injectDemoStyles() {
      const style = document.createElement("style");
      style.setAttribute("data-color-demo-style", "true");
      style.textContent = `
        @keyframes ctpHueSmooth {
          0% { filter: blur(2px) hue-rotate(12deg) saturate(1.2) contrast(1.05); }
          50% { filter: blur(2px) hue-rotate(192deg) saturate(1.2) contrast(1.05); }
          100% { filter: blur(2px) hue-rotate(372deg) saturate(1.2) contrast(1.05); }
        }
        @keyframes ctpHueFast {
          0% { filter: blur(2px) hue-rotate(0deg) saturate(1.25) contrast(1.05); }
          100% { filter: blur(2px) hue-rotate(360deg) saturate(1.25) contrast(1.05); }
        }
        @keyframes ctpHueStepped {
          0% { filter: blur(2px) hue-rotate(0deg) saturate(1.25) contrast(1.05); }
          100% { filter: blur(2px) hue-rotate(360deg) saturate(1.25) contrast(1.05); }
        }
      `;
      document.head.appendChild(style);
      this._styleEl = style;
    },

    _initDemos() {
      // Stops demo defaults
      const stopOut = this._dialog.querySelector("#ctpStopCssOut");
      if (stopOut) stopOut.value = this._stopCSSFor("even");
      this._applyStopDemoPreset("even", { silent: true });

      // Hue demo defaults
      const hueOut = this._dialog.querySelector("#ctpHueCssOut");
      if (hueOut) hueOut.value = this._hueCSSFor("smooth");
      this._applyHueDemoPreset("smooth", { silent: true });
    },

    _applyStopDemoPreset(forced, opts = {}) {
      const sel = this._dialog.querySelector("#ctpStopPreset");
      const preset = forced || (sel ? sel.value : "even");
      const layer = this._dialog.querySelector("#ctpStopPreviewLayer");
      const out = this._dialog.querySelector("#ctpStopCssOut");
      if (!layer) return;

      layer.style.animation = "none";
      layer.style.filter = "saturate(1.2) contrast(1.05)";
      layer.style.borderRadius = "14px";

      const bg = this._stopBackgroundFor(preset);
      layer.style.background = bg;

      if (out) out.value = this._stopCSSFor(preset);
      this._setStatus("#ctpStopStatus", opts.silent ? "" : `Applied stop spacing preset: ${preset}.`);
      layer.animate([{ transform: "scale(0.992)" }, { transform: "scale(1)" }], { duration: 140, easing: "ease-out" });
    },

    _stopBackgroundFor(preset) {
      // All in the same purple/blue family to fit your site vibe.
      if (preset === "even") {
        return `radial-gradient(circle at 30% 30%,
          rgba(190,110,255,0.95) 0%,
          rgba(120,130,255,0.85) 35%,
          rgba(90,180,255,0.80) 70%,
          rgba(10,9,18,0.0) 100%)`;
      }
      if (preset === "highlight") {
        return `radial-gradient(circle at 35% 30%,
          rgba(210,160,255,0.98) 0%,
          rgba(210,160,255,0.98) 18%,
          rgba(110,120,255,0.85) 22%,
          rgba(90,180,255,0.80) 62%,
          rgba(10,9,18,0.0) 100%)`;
      }
      if (preset === "banded") {
        return `radial-gradient(circle at 35% 35%,
          rgba(200,140,255,0.98) 0%,
          rgba(200,140,255,0.98) 12%,
          rgba(135,140,255,0.88) 13%,
          rgba(135,140,255,0.88) 24%,
          rgba(90,180,255,0.82) 25%,
          rgba(90,180,255,0.82) 44%,
          rgba(10,9,18,0.0) 100%)`;
      }
      // soft
      return `radial-gradient(circle at 30% 30%,
        rgba(190,110,255,0.70) 0%,
        rgba(120,130,255,0.35) 55%,
        rgba(90,180,255,0.20) 75%,
        rgba(10,9,18,0.0) 100%)`;
    },

    _stopCSSFor(preset) {
      return [
        "/* Stop spacing demo: same palette, different stop positions */",
        ".layer {",
        "  background: " + this._stopBackgroundFor(preset) + ";",
        "  filter: saturate(1.2) contrast(1.05);",
        "}",
      ].join("\\n");
    },

    _copyStopCSS() {
      const out = this._dialog.querySelector("#ctpStopCssOut");
      if (!out) return;
      this._copyText(out.value.trim(), "Copied stop spacing CSS.");
    },

    _applyHueDemoPreset(forced, opts = {}) {
      const sel = this._dialog.querySelector("#ctpHueDemoPreset");
      const preset = forced || (sel ? sel.value : "smooth");
      const layer = this._dialog.querySelector("#ctpHuePreviewLayer");
      const out = this._dialog.querySelector("#ctpHueCssOut");
      if (!layer) return;

      // base background: a stable gradient
      layer.style.background = `radial-gradient(circle at 30% 30%,
        rgba(190,110,255,0.95) 0%,
        rgba(90,180,255,0.85) 55%,
        rgba(10,9,18,0.0) 100%)`;

      // reset
      layer.style.animation = "none";
      layer.style.filter = "none";

      if (preset === "smooth") {
        layer.style.animation = "ctpHueSmooth 14s linear infinite";
      } else if (preset === "fast") {
        layer.style.animation = "ctpHueFast 4s linear infinite";
      } else {
        // stepped
        layer.style.animation = "ctpHueStepped 8s steps(8) infinite";
      }

      if (out) out.value = this._hueCSSFor(preset);
      this._setStatus("#ctpHueStatus", opts.silent ? "" : `Applied hue demo: ${preset}.`);
      layer.animate([{ transform: "scale(0.992)" }, { transform: "scale(1)" }], { duration: 140, easing: "ease-out" });
    },

    _hueCSSFor(preset) {
      if (preset === "smooth") {
        return [
          "/* Smooth hue loop: linear + midpoint + stable filter stack */",
          "@keyframes hueLoop {",
          "  0%   { filter: blur(2px) hue-rotate(12deg) saturate(1.2) contrast(1.05); }",
          "  50%  { filter: blur(2px) hue-rotate(192deg) saturate(1.2) contrast(1.05); }",
          "  100% { filter: blur(2px) hue-rotate(372deg) saturate(1.2) contrast(1.05); }",
          "}",
          ".layer { animation: hueLoop 14s linear infinite; }",
        ].join("\\n");
      }
      if (preset === "fast") {
        return [
          "/* Too fast: can feel frantic and cheap */",
          "@keyframes hueFast {",
          "  0%   { filter: blur(2px) hue-rotate(0deg) saturate(1.25) contrast(1.05); }",
          "  100% { filter: blur(2px) hue-rotate(360deg) saturate(1.25) contrast(1.05); }",
          "}",
          ".layer { animation: hueFast 4s linear infinite; }",
        ].join("\\n");
      }
      return [
        "/* Stepped hue: intentional, but choppy (use for stylized looks) */",
        "@keyframes hueSteps {",
        "  0%   { filter: blur(2px) hue-rotate(0deg) saturate(1.25) contrast(1.05); }",
        "  100% { filter: blur(2px) hue-rotate(360deg) saturate(1.25) contrast(1.05); }",
        "}",
        ".layer { animation: hueSteps 8s steps(8) infinite; }",
      ].join("\\n");
    },

    _copyHueCSS() {
      const out = this._dialog.querySelector("#ctpHueCssOut");
      if (!out) return;
      this._copyText(out.value.trim(), "Copied hue shift CSS.");
    },

    _setStatus(selector, msg) {
      const el = this._dialog.querySelector(selector);
      if (!el) return;
      el.textContent = msg;
      if (msg) el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
    },

    // -------------------- Copy utilities --------------------
    _copyCheatSheet() {
      const text = this._cheatSheetText();
      this._copyText(text, "Cheat sheet copied. Paste it anywhere.");
    },

    _cheatSheetText() {
      return [
        "COLOR CHEAT SHEET (Gradients + Filters)",
        "",
        "Stops:",
        "  - 3–5 stops is a sweet spot.",
        "  - Close stops = highlights/bands; wide spacing = smooth blends.",
        "  - Use a dark anchor + a highlight for depth.",
        "  - Use alpha stops to soften transitions without adding more colors.",
        "",
        "Theory that matters:",
        "  - Value (brightness) contrast matters more than hue for 'depth'.",
        "  - Saturation is a spice: use it for accents, not everywhere.",
        "  - Keep one dominant hue family + one accent for coherence.",
        "",
        "Filters:",
        "  - hue-rotate(): rotate hues around the color wheel.",
        "  - saturate(): intensity control. 1 = normal, 1.2 = more neon.",
        "  - contrast(): separation control. Small bumps feel premium.",
        "  - blur(): softens banding and edges.",
        "",
        "Smooth hue shift loop template:",
        "  - Use linear timing.",
        "  - Animate fromHue -> fromHue + 360.",
        "  - Add a 50% midpoint.",
        "  - Keep filter stack consistent in every keyframe.",
      ].join("\\n");
    },

    async _copyText(text, okMsg) {
      const t = String(text || "").trim();
      if (!t) return;

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
        this._toast(okMsg);
      } catch (_) {
        this._toast("Copy failed. You can manually select and copy the text.");
      }
    },

    _toast(msg) {
      // Minimal toast inside the dialog so it doesn't depend on your app's toast system
      const host = this._dialog.querySelector(".gtp-header-right");
      if (!host) return;
      const pill = document.createElement("span");
      pill.className = "gtp-pill";
      pill.textContent = msg;
      pill.style.opacity = "0";
      pill.style.transform = "translateY(-2px)";
      host.insertBefore(pill, host.firstChild);

      pill.animate(
        [{ opacity: 0, transform: "translateY(-2px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 140, easing: "ease-out", fill: "forwards" }
      );

      setTimeout(() => {
        pill.animate(
          [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-2px)" }],
          { duration: 160, easing: "ease-in", fill: "forwards" }
        );
        setTimeout(() => pill.remove(), 180);
      }, 1200);
    },
  };
})();
