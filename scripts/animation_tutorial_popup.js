/* animation_tutorial_popup.js
   Professional, in-depth modal tutorial for Animations (CSS + GradTool).

   Dependencies:
     - popup.css (shared styling for GradTool tutorials)
         <link rel="stylesheet" href="popup.css">

   Usage:
     - Include after your main app scripts:
         <script src="animation_tutorial_popup.js"></script>

     - Call from your info icon:
         onclick="showAnimationPopup()"

   Optional:
     showAnimationPopup({ initialSection: "types" })
*/

(function () {
  "use strict";

  // --------------------------
  // Public API
  // --------------------------
  window.showAnimationPopup = function showAnimationPopup(options = {}) {
    AnimationTutorialPopup.open(options);
  };
  window.hideAnimationPopup = function hideAnimationPopup() {
    AnimationTutorialPopup.close();
  };

  // --------------------------
  // Implementation
  // --------------------------
  const AnimationTutorialPopup = {
    _isOpen: false,
    _root: null,
    _backdrop: null,
    _dialog: null,
    _lastActiveEl: null,
    _opts: null,
    _demoStyleEl: null,

    open(options = {}) {
      if (this._isOpen) return;

        if (options && options.event) {
            try {
                options.event.stopPropagation();
            }
            catch {
                console.log("event stopping failed");
            }
        }

      this._opts = {
        initialSection: options.initialSection || "overview", // overview | workflow | types | timing | smoothness | troubleshooting | export
      };

      this._lastActiveEl = document.activeElement;

      this._mount();
      this._bindEvents();
      this._isOpen = true;

      document.documentElement.classList.add("gtp-scroll-lock");

      this._setSection(this._opts.initialSection);

      const focusable = this._getFocusable(this._dialog);
      (focusable[0] || this._dialog).focus();
    },

    close() {
      if (!this._isOpen) return;

      this._unbindEvents();

      if (this._demoStyleEl && this._demoStyleEl.parentNode) {
        this._demoStyleEl.parentNode.removeChild(this._demoStyleEl);
      }
      this._demoStyleEl = null;

      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root);
      }
      this._root = null;
      this._backdrop = null;
      this._dialog = null;

      document.documentElement.classList.remove("gtp-scroll-lock");

      try {
        if (this._lastActiveEl && typeof this._lastActiveEl.focus === "function") {
          this._lastActiveEl.focus();
        }
      } catch (_) {}

      this._lastActiveEl = null;
      this._isOpen = false;
    },

    // --------------------------
    // Mount / Render
    // --------------------------
    _mount() {
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
      dialog.setAttribute("aria-labelledby", "atp-title");
      dialog.tabIndex = -1;

      dialog.innerHTML = [
        this._renderHeader(),
        this._renderBody(),
        this._renderFooter(),
      ].join("");

      root.appendChild(backdrop);
      root.appendChild(dialog);
      document.body.appendChild(root);

      this._root = root;
      this._backdrop = backdrop;
      this._dialog = dialog;

      // Demo keyframes are only for the tutorial preview.
      this._injectDemoKeyframes();
        this._initDemo();
        enhanceCyberSelects(dialog);
    },

    _renderHeader() {
      return `
        <header class="gtp-header">
          <div class="gtp-header-left">
            <div class="gtp-badge">
              <span>Animations</span>
              <span class="gtp-pill">CSS-first</span>
              <span class="gtp-pill">Exportable</span>
            </div>
            <h2 id="atp-title" class="gtp-title">Animating Layers with CSS</h2>
            <p class="gtp-subtitle">
              This tutorial explains animation concepts (keyframes, timing, easing) and how they map to this tool’s
              layer animation system. The output is standard <strong>HTML + CSS</strong> - portable and usable in other websites.
            </p>
          </div>
          <div class="gtp-header-right">
            <button class="gtp-close-btn" type="button" data-atp-action="close" aria-label="Close tutorial">✕</button>
          </div>
        </header>
      `;
    },

    _renderBody() {
      return `
        <div class="gtp-body">
          ${this._renderNav()}
          ${this._renderMain()}
        </div>
      `;
    },

    _renderNav() {
      return `
        <aside class="gtp-nav" aria-label="Tutorial sections">
          ${this._navBtn("overview", "Overview")}
          ${this._navBtn("workflow", "Workflow")}
          ${this._navBtn("types", "Animation Types")}
          ${this._navBtn("timing", "Timing & Easing")}
          ${this._navBtn("smoothness", "Smoothness")}
          ${this._navBtn("troubleshooting", "Troubleshooting")}
          ${this._navBtn("export", "Export & Patterns")}
        </aside>
      `;
    },

    _navBtn(id, label) {
      return `<button class="gtp-nav-btn" type="button" data-atp-section="${id}">${label}</button>`;
    },

    _renderMain() {
      return `
        <main class="gtp-main">
          ${this._renderSectionOverview()}
          ${this._renderSectionWorkflow()}
          ${this._renderSectionTypes()}
          ${this._renderSectionTiming()}
          ${this._renderSectionSmoothness()}
          ${this._renderSectionTroubleshooting()}
          ${this._renderSectionExport()}
        </main>
      `;
    },

    _renderFooter() {
      return `
        <footer class="gtp-footer" style="padding: 12px 18px; border-top: 1px solid rgba(170, 140, 255, 0.14); display:flex; justify-content: space-between; align-items:center; gap: 10px;">
          <div class="gtp-footer-left">
            <span class="gtp-status">Keyboard: <kbd>Esc</kbd> closes • <kbd>Tab</kbd> navigates inside the modal</span>
          </div>
          <div class="gtp-footer-right" style="display:flex; gap: 10px; align-items:center;">
            <button class="gtp-btn gtp-btn-primary" type="button" data-atp-action="close">Close</button>
          </div>
        </footer>
      `;
    },

    // --------------------------
    // Sections (content)
    // --------------------------
      _renderSectionOverview() {
          return `
        <section class="gtp-section" data-atp-panel="overview">
          <h3>Overview</h3>
          <p>
            In CSS, animation is built from two parts: a <strong>keyframes definition</strong> and an <strong>animation declaration</strong>.
            A keyframes block describes how one or more CSS properties change over time, and the animation declaration controls
            duration, easing, delay, iteration count, and direction. This tool generates those same building blocks per layer,
            so the exported result remains standard, portable CSS.
          </p>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Keyframes in practice</div>
            <p class="gtp-tight">
              Keyframes are written as <code>@keyframes name { ... }</code> and define a timeline from <code>0%</code> to <code>100%</code>.
              Intermediate stops (like <code>50%</code>) are optional but often improve smoothness for complex properties (especially filters).
              Between keyframes, the browser interpolates values when possible.
            </p>
            <pre class="gtp-code"><code>@keyframes drift {
  0%   { transform: translate(0px, 0px); }
  50%  { transform: translate(12px, 8px); }
  100% { transform: translate(0px, 0px); }
}</code></pre>
          </div>

          <h4>Applying keyframes to an element</h4>
          <p class="gtp-tight">
            You apply keyframes with the <code>animation</code> shorthand (or longhand properties). A valid shorthand includes:
            <em>name</em>, <em>duration</em>, optional <em>timing-function</em>, optional <em>delay</em>, optional
            <em>iteration-count</em>, and optional <em>direction</em>. The most common pattern for looping layers is <code>infinite</code>.
          </p>

          <pre class="gtp-code"><code>/* Shorthand */
.layer {
  animation: drift 10s ease-in-out 0s infinite alternate;
}

/* Longhand equivalent */
.layer {
  animation-name: drift;
  animation-duration: 10s;
  animation-timing-function: ease-in-out;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}</code></pre>

          <h4>Animation “channels” and why they matter</h4>
          <ul class="gtp-list">
            <li><strong>Transform</strong> (motion): rotate/translate/scale/skew are combined into a single <code>transform</code> value.</li>
            <li><strong>Filter</strong> (appearance): blur/hue/saturation/contrast/glow are combined into a single <code>filter</code> value.</li>
            <li><strong>Other properties</strong>: opacity (<em>pulse</em>) and background-position (<em>slide</em>) animate independently.</li>
          </ul>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Important CSS rule</div>
            <p class="gtp-tight">
              Multiple animations can run at once, but if two animations both write the same property (for example, <code>transform</code>),
              they will compete. In practice, the computed value becomes difficult to reason about and can lead to overrides. That’s why
              this tool often generates a <strong>transform-combo</strong> keyframes block and a <strong>filter-combo</strong> keyframes block,
              then applies them together.
            </p>
          </div>

          <h4>Explicit examples of valid, export-ready CSS</h4>
          <div class="gtp-grid2">
            <div class="gtp-mini-card">
              <h4 style="margin-top:0;">Continuous rotation (clean loop)</h4>
              <pre class="gtp-code"><code>@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.layer { animation: spin 20s linear infinite; }</code></pre>
              <p class="gtp-tight">
                Use <code>linear</code> for constant-rate motion. A full 360° turn avoids visible discontinuities at the loop point.
              </p>
            </div>

            <div class="gtp-mini-card">
              <h4 style="margin-top:0;">Hue shift (smooth, filter-stable)</h4>
              <pre class="gtp-code"><code>@keyframes hueLoop {
  0%   { filter: blur(2px) hue-rotate(10deg); }
  50%  { filter: blur(2px) hue-rotate(190deg); }
  100% { filter: blur(2px) hue-rotate(370deg); }
}
.layer { animation: hueLoop 14s linear infinite; }</code></pre>
              <p class="gtp-tight">
                Keep the filter list consistent at every keyframe. Prefer <code>linear</code> for hue rotation to avoid perceptual “pulsing.”
              </p>
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">How this maps to the tool</div>
            <ul class="gtp-list">
              <li>Each layer can include multiple animations, each with parameters (duration, delay, direction, etc.).</li>
              <li>When an animation is disabled, it should not generate keyframes and should not appear in the layer’s <code>animation</code> list.</li>
              <li>The export is plain CSS: you can paste it into any site or component system without runtime JS.</li>
            </ul>
          </div>
        </section>
      `;
      },


    _renderSectionWorkflow() {
      return `
        <section class="gtp-section" data-atp-panel="workflow">
          <h3>Workflow</h3>

          <ol class="gtp-steps">
            <li>Start with one animation on one layer and tune it before stacking.</li>
            <li>For multiple animations, keep transforms together and filters together to avoid overrides.</li>
            <li>Validate loops: the 100% frame should naturally return to the 0% frame.</li>
          </ol>


            <div class="gtp-mini-card">
              <h4>Common pitfalls</h4>
              <ul class="gtp-list">
                <li>Over-layering: too many effects reduces clarity.</li>
                <li>Applying <code>steps()</code> timing globally (causes unintended jitter).</li>
                <li>Large deltas at short durations (reads as flicker).</li>
              </ul>
            </div>
        </section>
      `;
    },

    _renderSectionTypes() {
      // Updated professional tone + detailed guidance per type
      return `
        <section class="gtp-section" data-atp-panel="types">
          <h3>Animation Types</h3>
          <p>
            Each type below maps to a CSS mechanism (transform, filter, or property).
            The recommendations assume you want motion that remains readable, loop-stable, and exportable.
          </p>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Stacking rule of thumb</div>
            <ul class="gtp-list">
              <li>Combine <strong>transform</strong> animations into one keyframes block, and <strong>filter</strong> animations into another.</li>
              <li>Avoid multiple independent animations that all write <code>transform</code> (the last one wins).</li>
              <li>Prefer longer durations with smaller ranges; it scales across many layers without visual noise.</li>
            </ul>
          </div>

          <div class="gtp-grid2">
            <div>
              <h4>Transform animations</h4>

              ${this._typeCard({
                title: "Rotate",
                summary: "Continuous rotation is one of the most robust CSS loops. It reads clearly and does not pop when it repeats.",
                bullets: [
                  "<strong>CSS property:</strong> <code>transform: rotate(...)</code>",
                  "<strong>Loop stability:</strong> 0→360 (or 0→-360) within one cycle",
                  "<strong>Use when:</strong> you want ambient energy without changing composition layout",
                ],
                code: `@keyframes spin {\n  from { transform: rotate(0deg); }\n  to   { transform: rotate(360deg); }\n}\n.layer { animation: spin 20s linear infinite; }`
              })}

              ${this._typeCard({
                title: "Step Rotate",
                summary: "Discrete, “ticking” rotation using steps timing. Use intentionally; it is stylistic and will be noticed.",
                bullets: [
                  "<strong>CSS mechanism:</strong> <code>steps(n)</code> timing function",
                  "<strong>Important:</strong> apply <code>steps()</code> only to this animation (not globally on the element)",
                  "<strong>Use when:</strong> mechanical, retro UI, rhythmic patterns",
                ],
                code: `@keyframes stepSpin {\n  from { transform: rotate(0deg); }\n  to   { transform: rotate(360deg); }\n}\n.layer { animation: stepSpin 8s steps(6) infinite; }`
              })}

              ${this._typeCard({
                title: "Translate (Drift)",
                summary: "Small translations create parallax and depth, especially when different layers drift at different rates.",
                bullets: [
                  "<strong>CSS property:</strong> <code>transform: translate(x, y)</code>",
                  "<strong>Range guidance:</strong> 6–18px is usually enough",
                  "<strong>Loop stability:</strong> return to the origin at 100%",
                ],
                code: `@keyframes drift {\n  0%   { transform: translate(0px, 0px); }\n  50%  { transform: translate(12px, 8px); }\n  100% { transform: translate(0px, 0px); }\n}`
              })}

              ${this._typeCard({
                title: "Scale (Breathing)",
                summary: "A controlled scale pulse reads as “breathing” without changing opacity. Keep the range small.",
                bullets: [
                  "<strong>CSS property:</strong> <code>transform: scale(...)</code>",
                  "<strong>Range guidance:</strong> 1.00 ↔ 1.05 (larger can feel aggressive)",
                  "<strong>Loop stability:</strong> 0% and 100% should match exactly",
                ],
                code: `@keyframes breathe {\n  0%,100% { transform: scale(1); }\n  50%     { transform: scale(1.05); }\n}`
              })}

              ${this._typeCard({
                title: "Skew",
                summary: "Skew adds directional tension. Use sparingly; it can quickly look chaotic if combined with large rotation.",
                bullets: [
                  "<strong>CSS property:</strong> <code>transform: skewX(...)</code> / <code>skewY(...)</code>",
                  "<strong>Loop stability:</strong> return to 0° at 0%/100%",
                  "<strong>Use when:</strong> you want an “angular” or dynamic UI-panel feel",
                ],
                code: `@keyframes skew {\n  0%,100% { transform: skewX(0deg); }\n  50%     { transform: skewX(8deg); }\n}`
              })}
            </div>

            <div>
              <h4>Filter + property animations</h4>

              ${this._typeCard({
                title: "Hue Shift",
                summary: "Hue shift is a high-impact, low-effort way to animate gradients. Smooth loops depend on linear timing and a stable filter stack.",
                bullets: [
                  "<strong>CSS property:</strong> <code>filter: hue-rotate(...)</code>",
                  "<strong>Recommended default:</strong> 10–22s, <code>linear</code>",
                  "<strong>Loop stability:</strong> animate <code>fromHue → fromHue + 360</code> (full turn) and include a 50% midpoint",
                  "<strong>Critical detail:</strong> keep the full filter list consistent across keyframes (include blur/saturation/etc. each frame if used)",
                ],
                code: `@keyframes hueLoop {\n  0%   { filter: blur(2px) hue-rotate(10deg); }\n  50%  { filter: blur(2px) hue-rotate(190deg); }\n  100% { filter: blur(2px) hue-rotate(370deg); }\n}\n.layer { animation: hueLoop 14s linear infinite; }`
              })}

              ${this._typeCard({
                title: "Blur",
                summary: "Animating blur simulates focus changes and can soften harsh geometry. Avoid very large ranges unless you want abstraction.",
                bullets: [
                  "<strong>CSS property:</strong> <code>filter: blur(...)</code>",
                  "<strong>Recommended default:</strong> 6–14s, <code>ease-in-out</code>",
                  "<strong>Range guidance:</strong> 1px ↔ 6px",
                  "<strong>Pairs well with:</strong> small contrast or glow changes",
                ],
                code: `@keyframes blurPulse {\n  0%,100% { filter: blur(2px); }\n  50%     { filter: blur(6px); }\n}`
              })}

              ${this._typeCard({
                title: "Saturation",
                summary: "Saturation breathing changes perceived intensity without moving anything. It is useful for subtle motion.",
                bullets: [
                  "<strong>CSS property:</strong> <code>filter: saturate(...)</code>",
                  "<strong>Recommended default:</strong> 6–14s, <code>ease-in-out</code>",
                  "<strong>Range guidance:</strong> 1.0 ↔ 1.3",
                  "<strong>Note:</strong> combine gently with hue shift; both are color-driven effects",
                ],
                code: `@keyframes sat {\n  0%,100% { filter: saturate(1); }\n  50%     { filter: saturate(1.25); }\n}`
              })}

              ${this._typeCard({
                title: "Contrast",
                summary: "Contrast pulses can sharpen or soften the layer rhythmically. Keep ranges small to avoid flicker.",
                bullets: [
                  "<strong>CSS property:</strong> <code>filter: contrast(...)</code>",
                  "<strong>Recommended default:</strong> 4–10s, <code>ease-in-out</code>",
                  "<strong>Range guidance:</strong> 100% ↔ 130%",
                  "<strong>Tip:</strong> pair contrast-up with a slight blur-down for a controlled “focus” moment",
                ],
                code: `@keyframes contrast {\n  0%,100% { filter: contrast(100%); }\n  50%     { filter: contrast(130%); }\n}`
              })}

              ${this._typeCard({
                title: "Drop Glow (drop-shadow)",
                summary: "A glow pulse improves perceived edge quality and adds a neon halo. It is particularly effective on clipped shapes.",
                bullets: [
                  "<strong>CSS property:</strong> <code>filter: drop-shadow(...)</code>",
                  "<strong>Recommended default:</strong> 4–12s, <code>ease-in-out</code>",
                  "<strong>Range guidance:</strong> small radius shifts (e.g. 6px ↔ 14px)",
                  "<strong>Tip:</strong> change color slowly; rapid color flips read as strobing",
                ],
                code: `@keyframes glow {\n  0%   { filter: drop-shadow(0 0 6px rgba(190,110,255,.55)); }\n  50%  { filter: drop-shadow(0 0 14px rgba(90,180,255,.55)); }\n  100% { filter: drop-shadow(0 0 6px rgba(190,110,255,.55)); }\n}`
              })}

              ${this._typeCard({
                title: "Pulse (Opacity)",
                summary: "Opacity pulses adjust intensity without moving the layer. Use small ranges to avoid flicker.",
                bullets: [
                  "<strong>CSS property:</strong> <code>opacity</code>",
                  "<strong>Recommended default:</strong> 3–7s, <code>ease-in-out</code>",
                  "<strong>Range guidance:</strong> 0.88 ↔ 1.0",
                  "<strong>Note:</strong> if you also animate contrast, keep opacity changes even smaller",
                ],
                code: `@keyframes pulse {\n  0%,100% { opacity: 1; }\n  50%     { opacity: .88; }\n}`
              })}

              ${this._typeCard({
                title: "Slide (Background Position)",
                summary: "Sliding background-position moves the gradient inside a stable shape. This creates motion without moving the layer in space.",
                bullets: [
                  "<strong>CSS property:</strong> <code>background-position</code> (with increased <code>background-size</code>)",
                  "<strong>Recommended default:</strong> 8–22s, <code>linear</code> or <code>ease-in-out</code>",
                  "<strong>Required:</strong> set <code>background-size</code> to something like <code>200% 200%</code>",
                  "<strong>Use when:</strong> you want subtle, continuous motion that does not change layout",
                ],
                code: `.layer { background-size: 200% 200%; }\n@keyframes slide {\n  0%   { background-position: 0% 50%; }\n  100% { background-position: 100% 50%; }\n}`
              })}
            </div>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Practical recipes</div>
            <ul class="gtp-list">
              <li><strong>Ambient (premium):</strong> rotate 20s linear + hue 16s linear + pulse 5s ease-in-out (subtle).</li>
              <li><strong>Dreamy:</strong> drift 12s ease-in-out + blur 10s ease-in-out + glow 10s ease-in-out.</li>
              <li><strong>Mechanical:</strong> step-rotate 8s steps(6) + mild contrast 6s ease-in-out.</li>
            </ul>
          </div>
        </section>
      `;
    },

    _typeCard({ title, summary, bullets, code }) {
      const bulletHTML = (bullets || []).map((b) => `<li>${b}</li>`).join("");
      const codeHTML = code ? `<pre class="gtp-code"><code>${this._escapeHTML(code)}</code></pre>` : "";
      return `
        <div class="gtp-mini-card">
          <h4 style="margin-top:0;">${this._escapeHTML(title)}</h4>
          <p class="gtp-tight">${summary}</p>
          <ul class="gtp-list">${bulletHTML}</ul>
          ${codeHTML}
        </div>
      `;
    },

    _renderSectionTiming() {
      return `
        <section class="gtp-section" data-atp-panel="timing">
          <h3>Timing & Easing</h3>

          <div class="gtp-mini-card">
            <h4>Reasonable defaults</h4>
            <ul class="gtp-list">
              <li><strong>Hue shift:</strong> linear, 10–22s</li>
              <li><strong>Rotate:</strong> linear, 12–30s</li>
              <li><strong>Translate:</strong> ease-in-out, 8–18s</li>
              <li><strong>Pulse:</strong> ease-in-out, 3–7s</li>
            </ul>
          </div>

          <h4>Easing guidance</h4>
          <ul class="gtp-list">
            <li><strong>linear</strong> is best for constant-rate loops (rotate, hue shift).</li>
            <li><strong>ease-in-out</strong> reads organic (drift, scale, pulse).</li>
            <li><strong>steps(n)</strong> is intentionally discrete (step rotate only).</li>
          </ul>

          <div class="gtp-callout">
            <div class="gtp-callout-title">Per-animation timing matters</div>
            <p class="gtp-tight">
              If a layer runs multiple animations, timing functions can be specified per animation (comma-separated),
              or you can group animations into transform/filter combos so each combo has its own timing.
              Avoid setting a single <code>animation-timing-function</code> that accidentally affects everything.
            </p>
          </div>
        </section>
      `;
    },

    _renderSectionSmoothness() {
      return `
        <section class="gtp-section" data-atp-panel="smoothness">
          <h3>Smoothness</h3>

          <div class="gtp-mini-card">
            <h4>Hue shift without “pops”</h4>
            <p class="gtp-tight">
              Most “jerky” hue animations come from one of two issues:
              (1) non-linear timing on hue, or (2) the filter stack changing across keyframes.
            </p>
            <ul class="gtp-list">
              <li>Use <code>linear</code> for hue.</li>
              <li>Animate a full turn: <code>fromHue</code> → <code>fromHue + 360</code>.</li>
              <li>Include base filters (e.g. blur) in every keyframe so the filter list stays stable.</li>
              <li>Add a 50% midpoint to support smooth interpolation.</li>
            </ul>
            <pre class="gtp-code"><code>@keyframes hueLoop {
  0%   { filter: blur(2px) hue-rotate(10deg); }
  50%  { filter: blur(2px) hue-rotate(190deg); }
  100% { filter: blur(2px) hue-rotate(370deg); }
}</code></pre>
          </div>

          <div class="gtp-mini-card">
            <h4>Rotation loops</h4>
            <p class="gtp-tight">
              Rotation is naturally loopable if the start and end angles match visually. The simplest loop is 0→360.
            </p>
            <pre class="gtp-code"><code>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.layer { animation: spin 20s linear infinite; }</code></pre>
          </div>

          <div class="gtp-callout">
            <div class="gtp-callout-title">About delays on “combo” animations</div>
            <p class="gtp-tight">
              If your implementation combines multiple animations into one transform or filter keyframes block, avoid using
              the maximum delay of all animations as the combo delay. It can create the impression that animations “do not start.”
              Prefer delay 0 for combos, and reserve delays for standalone effects like pulse/slide.
            </p>
          </div>
        </section>
      `;
    },

    _renderSectionTroubleshooting() {
      return `
        <section class="gtp-section" data-atp-panel="troubleshooting">
          <h3>Troubleshooting</h3>

          <div class="gtp-mini-card">
            <h4>Template loads but nothing animates</h4>
            <ul class="gtp-list">
              <li>Older templates may omit <code>layer.animate</code>. Infer it from enabled animations during template load.</li>
              <li>Confirm your generator filters by <code>anim.enabled</code> (missing flags should default to enabled).</li>
            </ul>
          </div>

          <div class="gtp-mini-card">
            <h4>Disabled animations still run</h4>
            <ul class="gtp-list">
              <li>Skip any animation where <code>enabled === false</code> when generating keyframes and the animation list.</li>
              <li>Clear <code>element.style.animation</code> before rebuilding layers so previous values do not persist.</li>
            </ul>
          </div>

          <div class="gtp-mini-card">
            <h4>Hue looks choppy</h4>
            <ul class="gtp-list">
              <li>Ensure hue uses <code>linear</code>.</li>
              <li>Ensure <code>steps()</code> is not applied globally to all animations.</li>
              <li>Keep filter stacks consistent across keyframes (include blur/saturation etc.).</li>
            </ul>
          </div>

          <div class="gtp-mini-card">
            <h4>Transform animations conflict</h4>
            <ul class="gtp-list">
              <li>Multiple animations writing <code>transform</code> can override each other; prefer a transform-combo keyframes block.</li>
              <li>Alternatively, use comma-separated animations only if each targets a different property.</li>
            </ul>
          </div>
        </section>
      `;
    },

    _renderSectionExport() {
      return `
        <section class="gtp-section" data-atp-panel="export">
          <h3>Export & Patterns</h3>
          <p>
            A stable export strategy is to generate (1) a transform keyframes block and (2) a filter keyframes block, then
            apply both animations to the layer. Standalone animations (pulse, slide) can be added as additional entries.
          </p>

          <div class="gtp-grid2">
            <div>
              <h4>Pattern: transform combo + filter combo</h4>
              <pre class="gtp-code"><code>@keyframes layerTransform {
  0% { transform: rotate(0deg) translate(0px, 0px); }
  50% { transform: rotate(180deg) translate(10px, 8px); }
  100% { transform: rotate(360deg) translate(0px, 0px); }
}

@keyframes layerFilter {
  0% { filter: blur(2px) hue-rotate(0deg); }
  50% { filter: blur(2px) hue-rotate(180deg); }
  100% { filter: blur(2px) hue-rotate(360deg); }
}

.layer {
  animation:
    layerTransform 18s linear infinite,
    layerFilter 14s linear infinite;
}</code></pre>
            </div>

            <div class="gtp-mini-card">
              <h4>Pattern: enabled flags</h4>
              <ul class="gtp-list">
                <li>If <code>enabled === false</code>, do not generate keyframes and do not include it in the animation list.</li>
                <li>If a layer has no enabled animations, do not output an <code>animation</code> line for that layer.</li>
                <li>Keep filter stacks consistent in every keyframe to prevent visual discontinuities.</li>
              </ul>
            </div>
          </div>

          <hr class="gtp-hr" />

          <h4>Interactive preview</h4>
          <p class="gtp-tight">Select an example stack to see the preview and corresponding CSS.</p>

          <div class="gtp-grid2">
            <div>
              <div class="gtp-row">
                <label class="gtp-label" style="margin:0;">Preset</label>
                <select class="gtp-select" id="atpDemoPreset">
                  <option value="spinHue">Spin + Hue (smooth loop)</option>
                  <option value="driftPulse">Drift + Pulse (organic)</option>
                  <option value="stepSpin">Step Rotate (discrete)</option>
                  <option value="blurGlow">Blur + Glow (soft neon)</option>
                </select>
                <button class="gtp-btn" type="button" data-atp-action="apply-demo">Apply</button>
                <button class="gtp-btn" type="button" data-atp-action="copy-demo-css">Copy CSS</button>
              </div>

              <label class="gtp-label" for="atpCssOut">Generated CSS</label>
              <textarea id="atpCssOut" class="gtp-textarea" rows="10" spellcheck="false"></textarea>

              <div class="gtp-row gtp-row-slim">
                <span id="atpStatus" class="gtp-status" aria-live="polite"></span>
              </div>
            </div>

            <div>
              <div class="gtp-preview-frame">
                <div class="gtp-preview">
                  <div class="gtp-preview-layer" id="atpPreviewLayer"></div>
                </div>
              </div>
              <div class="gtp-preview-caption">
                The preview is part of this tutorial only. The exported CSS uses the same underlying concepts.
              </div>
            </div>
          </div>
        </section>
      `;
    },

    // --------------------------
    // Events / Navigation
    // --------------------------
    _bindEvents() {
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

        const actionEl = e.target.closest("[data-atp-action]");
        if (actionEl) {
          this._handleAction(actionEl.getAttribute("data-atp-action"));
          return;
        }

        const navBtn = e.target.closest(".gtp-nav-btn");
        if (navBtn) {
          const section = navBtn.getAttribute("data-atp-section");
          if (section) this._setSection(section);
          return;
        }

        if (e.target === this._backdrop) {
          this.close();
        }
      };

      document.addEventListener("keydown", this._onKeyDown, true);
      this._root.addEventListener("click", this._onClick, true);
    },

    _unbindEvents() {
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
        case "apply-demo":
          this._applyDemoPreset();
          break;
        case "copy-demo-css":
          this._copyDemoCSS();
          break;
      }
    },

    _setSection(section) {
      const panels = this._dialog.querySelectorAll(".gtp-section");
      panels.forEach((p) => p.classList.remove("is-active"));
      const panel = this._dialog.querySelector(`.gtp-section[data-atp-panel="${section}"]`);
      if (panel) panel.classList.add("is-active");

      const navBtns = this._dialog.querySelectorAll(".gtp-nav-btn");
      navBtns.forEach((b) => b.removeAttribute("aria-current"));
      const nav = this._dialog.querySelector(`.gtp-nav-btn[data-atp-section="${section}"]`);
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

    // --------------------------
    // Demo (tutorial-only)
    // --------------------------
    _injectDemoKeyframes() {
      const style = document.createElement("style");
      style.setAttribute("data-atp-demo-style", "true");
      style.textContent = `
        @keyframes atpSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes atpHue {
          0% { filter: blur(2px) hue-rotate(10deg); }
          50% { filter: blur(2px) hue-rotate(190deg); }
          100% { filter: blur(2px) hue-rotate(370deg); }
        }
        @keyframes atpDrift {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(12px, 8px) rotate(6deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes atpPulse {
          0%,100% { opacity: 1; }
          50% { opacity: .82; }
        }
        @keyframes atpStepSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes atpBlurGlow {
          0% { filter: blur(1px) drop-shadow(0 0 6px rgba(190,110,255,.55)); }
          50% { filter: blur(6px) drop-shadow(0 0 14px rgba(90,180,255,.55)); }
          100% { filter: blur(1px) drop-shadow(0 0 6px rgba(190,110,255,.55)); }
        }
      `;
      document.head.appendChild(style);
      this._demoStyleEl = style;
    },

    _initDemo() {
      const out = this._dialog.querySelector("#atpCssOut");
      if (out) out.value = this._demoCSSFor("spinHue");
      this._applyDemoPreset("spinHue", { silent: true });
    },

    _applyDemoPreset(forcedPreset, opts = {}) {
      const presetSel = this._dialog.querySelector("#atpDemoPreset");
      const preset = forcedPreset || (presetSel ? presetSel.value : "spinHue");

      const layer = this._dialog.querySelector("#atpPreviewLayer");
      const out = this._dialog.querySelector("#atpCssOut");
      if (!layer) return;

      // Reset
      layer.style.animation = "none";
      layer.style.animationTimingFunction = "";
      layer.style.opacity = "1";

      if (preset === "spinHue") {
        layer.style.animation = "atpSpin 18s linear infinite, atpHue 14s linear infinite";
        if (out) out.value = this._demoCSSFor("spinHue");
        this._setStatus(opts.silent ? "" : "Applied: Spin + Hue.");
      } else if (preset === "driftPulse") {
        layer.style.animation = "atpDrift 10s ease-in-out infinite, atpPulse 4s ease-in-out infinite";
        if (out) out.value = this._demoCSSFor("driftPulse");
        this._setStatus(opts.silent ? "" : "Applied: Drift + Pulse.");
      } else if (preset === "stepSpin") {
        layer.style.animation = "atpStepSpin 8s steps(6) infinite";
        if (out) out.value = this._demoCSSFor("stepSpin");
        this._setStatus(opts.silent ? "" : "Applied: Step Rotate.");
      } else if (preset === "blurGlow") {
        layer.style.animation = "atpBlurGlow 8s ease-in-out infinite";
        if (out) out.value = this._demoCSSFor("blurGlow");
        this._setStatus(opts.silent ? "" : "Applied: Blur + Glow.");
      }

      layer.animate([{ transform: "scale(0.992)" }, { transform: "scale(1)" }], { duration: 140, easing: "ease-out" });
    },

    _demoCSSFor(preset) {
      if (preset === "spinHue") {
        return [
          "/* Transform + filter combo example (smooth loops) */",
          "@keyframes spin {",
          "  from { transform: rotate(0deg); }",
          "  to   { transform: rotate(360deg); }",
          "}",
          "",
          "@keyframes hueLoop {",
          "  0%   { filter: blur(2px) hue-rotate(10deg); }",
          "  50%  { filter: blur(2px) hue-rotate(190deg); }",
          "  100% { filter: blur(2px) hue-rotate(370deg); }",
          "}",
          "",
          ".layer {",
          "  animation: spin 18s linear infinite, hueLoop 14s linear infinite;",
          "}",
        ].join("\\n");
      }
      if (preset === "driftPulse") {
        return [
          "/* Organic motion: drift + opacity pulse */",
          "@keyframes drift {",
          "  0%   { transform: translate(0px, 0px) rotate(0deg); }",
          "  50%  { transform: translate(12px, 8px) rotate(6deg); }",
          "  100% { transform: translate(0px, 0px) rotate(0deg); }",
          "}",
          "",
          "@keyframes pulse {",
          "  0%, 100% { opacity: 1; }",
          "  50%      { opacity: .82; }",
          "}",
          "",
          ".layer {",
          "  animation: drift 10s ease-in-out infinite, pulse 4s ease-in-out infinite;",
          "}",
        ].join("\\n");
      }
      if (preset === "stepSpin") {
        return [
          "/* Discrete motion via steps timing */",
          "@keyframes stepSpin {",
          "  from { transform: rotate(0deg); }",
          "  to   { transform: rotate(360deg); }",
          "}",
          "",
          ".layer {",
          "  animation: stepSpin 8s steps(6) infinite;",
          "}",
        ].join("\\n");
      }
      if (preset === "blurGlow") {
        return [
          "/* Soft blur + glow pulse */",
          "@keyframes blurGlow {",
          "  0%   { filter: blur(1px) drop-shadow(0 0 6px rgba(190,110,255,.55)); }",
          "  50%  { filter: blur(6px) drop-shadow(0 0 14px rgba(90,180,255,.55)); }",
          "  100% { filter: blur(1px) drop-shadow(0 0 6px rgba(190,110,255,.55)); }",
          "}",
          "",
          ".layer {",
          "  animation: blurGlow 8s ease-in-out infinite;",
          "}",
        ].join("\\n");
      }
      return "";
    },

    _copyDemoCSS() {
      const out = this._dialog.querySelector("#atpCssOut");
      if (!out) return;
      this._copyText(out.value.trim(), "Copied demo CSS.");
    },

    _setStatus(msg) {
      const el = this._dialog.querySelector("#atpStatus");
      if (!el) return;
      el.textContent = msg;
      if (msg) el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
    },

    // --------------------------
    // Copy helpers
    // --------------------------
    _copyCheatSheet() {
      const text = this._cheatSheetText();
      this._copyText(text, "Cheat sheet copied.");
    },

    _cheatSheetText() {
      return [
        "ANIMATION CHEAT SHEET (CSS + GradTool)",
        "",
        "Recommended defaults:",
        "  rotate: linear, 12–30s",
        "  hue shift: linear, 10–22s (animate fromHue → fromHue + 360 and include a 50% midpoint)",
        "  translate drift: ease-in-out, 8–18s (small distances)",
        "  pulse (opacity): ease-in-out, 3–7s (subtle range)",
        "",
        "Stability checklist:",
        "  - If anim.enabled === false, do not generate keyframes or include it in animation list.",
        "  - Clear element.style.animation before rebuilding layers to prevent stale animations persisting.",
        "  - Do not apply steps() timing globally when only step-rotate should be discrete.",
        "  - Keep filter stacks consistent across keyframes (include blur/saturation/etc. each frame if used).",
        "",
        "Hue loop template:",
        "  0%   filter: blur(2px) hue-rotate(10deg)",
        "  50%  filter: blur(2px) hue-rotate(190deg)",
        "  100% filter: blur(2px) hue-rotate(370deg)",
      ].join("\\n");
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
        this._setStatus(okMsg);
      } catch (e) {
        this._setStatus("Copy failed. You can manually select and copy the text.");
      }
    },

    // --------------------------
    // Small utilities
    // --------------------------
    _escapeHTML(s) {
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },
  };
})();
