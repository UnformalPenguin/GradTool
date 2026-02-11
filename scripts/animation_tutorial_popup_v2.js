/* animation_tutorial_popup.js
   Modal popup tutorial for Animations (in-depth).

   Requirements:
     - Load popup.css once:
         <link rel="stylesheet" href="popup.css">

   Usage:
     - Include this file after your main script:
         <script src="animation_tutorial_popup.js"></script>

     - Call showAnimationPopup() from your animation info icon:
         onclick="showAnimationPopup()"

   Optional:
     showAnimationPopup({ initialSection: "timing" })
*/

(function () {
  "use strict";

  // Public API (kept separate from clip tutorial popup)
  window.showAnimationPopup = function showAnimationPopup(options = {}) {
    AnimationTutorialPopup.open(options);
  };
  window.hideAnimationPopup = function hideAnimationPopup() {
    AnimationTutorialPopup.close();
  };

  const AnimationTutorialPopup = {
    _isOpen: false,
    _root: null,
    _backdrop: null,
    _dialog: null,
    _lastActiveEl: null,
    _opts: null,
    _styleEl: null,

    open(options = {}) {
      if (this._isOpen) return;

      this._opts = {
        initialSection: options.initialSection || "overview", // overview | workflow | types | timing | smoothness | troubleshooting | export
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
      dialog.setAttribute("aria-labelledby", "atp-title");
      dialog.tabIndex = -1;

      dialog.innerHTML = this._templateHTML();

      root.appendChild(backdrop);
      root.appendChild(dialog);
      document.body.appendChild(root);

      this._root = root;
      this._backdrop = backdrop;
      this._dialog = dialog;

      // Demo needs internal keyframes; inject a small scoped style element.
      this._injectDemoKeyframes();
      this._initDemo();
    },

    _templateHTML() {
      return `
        <header class="gtp-header">
          <div class="gtp-header-left">
            <div class="gtp-badge">
              <span>Animations</span>
              <span class="gtp-pill">HTML + CSS export</span>
            </div>
            <h2 id="atp-title" class="gtp-title">How to Animate Layers Smoothly</h2>
            <p class="gtp-subtitle">
              This tool creates portable animations by generating standard <strong>@keyframes</strong> and applying them via
              <strong>animation:</strong> on each layer. The trick is choosing the right animation type, timing, and parameters
              so motion feels intentional instead of jittery.
            </p>
          </div>
          <div class="gtp-header-right">
            <button class="gtp-icon-btn" type="button" data-atp-action="copy-cheatsheet" title="Copy animation cheat sheet">
              Copy Cheat Sheet
            </button>
            <button class="gtp-close-btn" type="button" data-atp-action="close" aria-label="Close tutorial">
              ✕
            </button>
          </div>
        </header>

        <div class="gtp-body">
          <aside class="gtp-nav" aria-label="Tutorial sections">
            <button class="gtp-nav-btn" type="button" data-atp-section="overview">Overview</button>
            <button class="gtp-nav-btn" type="button" data-atp-section="workflow">Workflow</button>
            <button class="gtp-nav-btn" type="button" data-atp-section="types">Animation Types</button>
            <button class="gtp-nav-btn" type="button" data-atp-section="timing">Timing & Easing</button>
            <button class="gtp-nav-btn" type="button" data-atp-section="smoothness">Smoothness (No Jerks)</button>
            <button class="gtp-nav-btn" type="button" data-atp-section="troubleshooting">Troubleshooting</button>
            <button class="gtp-nav-btn" type="button" data-atp-section="export">Export & Patterns</button>
          </aside>

          <main class="gtp-main">
            <section class="gtp-section" data-atp-panel="overview">
              <h3>What Animations Do Here</h3>
              <p>
                Every layer can have one or more animations. Each animation produces either:
                <strong>transform</strong> motion (rotate/translate/scale/skew),
                <strong>filter</strong> motion (hue/blur/saturation/contrast/glow),
                or <strong>property</strong> motion (opacity via pulse, background-position via slide).
              </p>

              <div class="gtp-callout">
                <div class="gtp-callout-title">Core rule</div>
                <p class="gtp-tight">
                  If an animation is <strong>not enabled</strong>, it should not contribute keyframes and should not be
                  included in the element’s <code>animation:</code> list. That keeps preview and export honest.
                </p>
              </div>

              <h3>Three outcomes you want</h3>
              <ul class="gtp-list">
                <li><strong>Readable motion</strong>: the viewer understands what’s changing.</li>
                <li><strong>Stable loop</strong>: the last frame blends seamlessly into the first.</li>
                <li><strong>Exportable</strong>: plain CSS keyframes that don’t depend on JS at runtime.</li>
              </ul>
            </section>

            <section class="gtp-section" data-atp-panel="workflow">
              <h3>Recommended Workflow</h3>

              <ol class="gtp-steps">
                <li>Select a layer, then open the <strong>Animations</strong> menu on the right.</li>
                <li>Add one animation at a time, then tune it before stacking more.</li>
                <li>Keep loops stable: for rotation/hue, “one full turn” loops best.</li>
                <li>When stacking, separate “transform combo” and “filter combo” so timing functions don’t collide.</li>
              </ol>

              <div class="gtp-grid2">
                <div class="gtp-mini-card">
                  <h4>Good starter stacks</h4>
                  <ul class="gtp-list">
                    <li><strong>Rotate</strong> + subtle <strong>Hue shift</strong></li>
                    <li><strong>Translate</strong> (slow) + <strong>Pulse</strong> (very subtle)</li>
                    <li><strong>Slide</strong> background + mild <strong>Contrast</strong></li>
                  </ul>
                </div>

                <div class="gtp-mini-card">
                  <h4>Common mistakes</h4>
                  <ul class="gtp-list">
                    <li>Too many animations at once (noise instead of style).</li>
                    <li>Mixing <code>steps()</code> timing with smooth filters (creates jitter).</li>
                    <li>Using big deltas (e.g. hue 0→360 fast) without linear timing.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="gtp-section" data-atp-panel="types">
  <h3>Animation Types</h3>
  <p>
    Each animation type changes a specific “channel” of the layer: <strong>transform</strong>, <strong>filter</strong>,
    or a direct <strong>CSS property</strong>. Great results come from picking the right channel, then keeping the
    movement subtle and loop-stable.
  </p>

  <div class="gtp-callout">
    <div class="gtp-callout-title">How to think about stacking</div>
    <ul class="gtp-list">
      <li><strong>Transforms</strong> stack into one <code>transform</code> value (rotate + translate + scale + skew).</li>
      <li><strong>Filters</strong> stack into one <code>filter</code> value (blur + hue + saturation + contrast + glow).</li>
      <li>If you generate separate keyframes for many animations, the last one can override the property.
          That’s why “transform combo” and “filter combo” patterns work so well.</li>
    </ul>
  </div>

  <div class="gtp-grid2">
    <div>
      <h4>Transform animations</h4>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Rotate</h4>
        <p class="gtp-tight">
          The cleanest loop in motion design: constant rotation is easy to read and never “pops” when it loops.
          Use it to add energy to otherwise static gradients.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> ambient motion, badges/tokens, spirals, subtle “alive” feel.</li>
          <li><strong>Default feel:</strong> <code>linear</code> easing, 12–30s duration.</li>
          <li><strong>Loop-stable:</strong> 0→360 (or 0→-360) in one cycle.</li>
          <li><strong>Keep it classy:</strong> slower rotation feels premium; fast rotation reads as noise.</li>
        </ul>
        <pre class="gtp-code"><code>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.layer { animation: spin 20s linear infinite; }</code></pre>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Step Rotate</h4>
        <p class="gtp-tight">
          “Ticking” rotation that jumps in discrete steps. This is stylistic — it should look intentional, not broken.
          It works best on geometric layers and UI-like shapes.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> retro UI, mechanical motion, rhythmic patterns.</li>
          <li><strong>Timing:</strong> use <code>steps(n)</code> on this animation only (don’t apply steps globally).</li>
          <li><strong>Choose steps:</strong> 4, 6, 8, 12 are common; match to your shape symmetry.</li>
          <li><strong>Pair with:</strong> subtle glow or contrast pulsing for “machine” vibes.</li>
        </ul>
        <pre class="gtp-code"><code>@keyframes stepSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.layer { animation: stepSpin 8s steps(6) infinite; }</code></pre>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Translate (Drift)</h4>
        <p class="gtp-tight">
          A slow drift creates parallax and depth, especially when multiple layers move differently.
          This is one of the most “expensive-looking” effects when done subtly.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> parallax, depth, floating gradients, background ambience.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 8–18s, small distances (6–18px).</li>
          <li><strong>Loop-stable:</strong> return to the start position at 100%.</li>
          <li><strong>Pro:</strong> vary direction and timing per layer so it doesn’t look synchronized.</li>
        </ul>
        <pre class="gtp-code"><code>@keyframes drift {
  0% { transform: translate(0px, 0px); }
  50% { transform: translate(12px, 8px); }
  100% { transform: translate(0px, 0px); }
}</code></pre>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Scale (Breathing)</h4>
        <p class="gtp-tight">
          Scale adds a “breathing” pulse without changing opacity. It’s easy to overdo; treat it like seasoning.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> organic motion, focal emphasis, soft pulsing depth.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 4–10s, tiny range (1.00 ↔ 1.05).</li>
          <li><strong>Loop-stable:</strong> 0% and 100% should match.</li>
          <li><strong>Pair with:</strong> slight hue shift or subtle glow for a “living” layer.</li>
        </ul>
        <pre class="gtp-code"><code>@keyframes breathe {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}</code></pre>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Skew</h4>
        <p class="gtp-tight">
          Skew introduces tension/tilt. It reads as “designed” when used gently, and chaotic when pushed hard.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> edgy accents, dynamic panels, stylized motion.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 6–14s, 4–12°.</li>
          <li><strong>Loop-stable:</strong> skew back to 0° at the end.</li>
          <li><strong>Pro:</strong> skew pairs well with small translate for “camera movement” vibes.</li>
        </ul>
      </div>
    </div>

    <div>
      <h4>Filter + property animations</h4>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Hue Shift</h4>
        <p class="gtp-tight">
          Hue shift is the fastest way to make gradients feel alive. The secret is keeping it smooth and avoiding
          the classic “0→360 jerk.” The two biggest causes of jerk are (1) non-linear timing and (2) the filter stack
          changing between keyframes.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> ambient color cycling, neon vibes, synthwave, subtle shimmer.</li>
          <li><strong>Default feel:</strong> <code>linear</code>, 10–22s.</li>
          <li><strong>Loop-stable:</strong> use <code>fromHue</code> → <code>fromHue + 360</code> and add a 50% midpoint.</li>
          <li><strong>Critical:</strong> include base filters (like blur) in every keyframe so the filter list stays consistent.</li>
        </ul>
        <pre class="gtp-code"><code>@keyframes hueLoop {
  0%   { filter: blur(2px) hue-rotate(10deg); }
  50%  { filter: blur(2px) hue-rotate(190deg); }
  100% { filter: blur(2px) hue-rotate(370deg); }
}</code></pre>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Blur</h4>
        <p class="gtp-tight">
          Blur is depth. Animate it to simulate focus changes or dreamy pulses. Keep the range small unless you’re
          intentionally going abstract.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> depth breathing, soft transitions, ethereal layers.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 6–14s, 1px ↔ 6px.</li>
          <li><strong>Pro:</strong> blur looks best when paired with slight contrast/saturation changes.</li>
          <li><strong>Watch out:</strong> huge blur can kill detail and make everything look muddy.</li>
        </ul>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Saturation</h4>
        <p class="gtp-tight">
          Saturation is mood. Gentle saturation breathing can make a layer feel “alive” without obvious motion.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> subtle vibrance changes, “breathing color,” polishing a composition.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 6–14s, 1.0 ↔ 1.3.</li>
          <li><strong>Pro:</strong> saturate pairs nicely with hue shift, but keep both gentle.</li>
        </ul>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Contrast</h4>
        <p class="gtp-tight">
          Contrast adds punch. Animate it to create a pulse of clarity and intensity. It’s easy to overdo; small
          changes read as “polish,” large changes read as “flicker.”
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> highlight pulses, rhythmic emphasis, making gradients feel sharper.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 4–10s, 100% ↔ 130%.</li>
          <li><strong>Pro:</strong> pair with a slight blur decrease at the high-contrast peak for “focus snap.”</li>
        </ul>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Drop Glow (drop-shadow)</h4>
        <p class="gtp-tight">
          Drop glow is a neon halo. Animate its radius and color to make a layer feel electrified.
          This is also a great way to hide aliasing on sharp clip-path edges.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> neon, cyber gradients, soft edge polish, glow pulses.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 4–12s, small radius changes.</li>
          <li><strong>Pro:</strong> keep glow color changes slow; rapid color swaps look cheap.</li>
        </ul>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Pulse (Opacity)</h4>
        <p class="gtp-tight">
          Opacity pulsing changes the layer’s intensity without moving it. It’s perfect for breathing effects,
          but big swings can feel like flicker.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> breathing intensity, subtle emphasis, ambient motion without movement.</li>
          <li><strong>Default feel:</strong> <code>ease-in-out</code>, 3–7s, 0.88 ↔ 1.0.</li>
          <li><strong>Pro:</strong> if you’re also animating contrast, keep opacity changes even smaller.</li>
        </ul>
        <pre class="gtp-code"><code>@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.88} }</code></pre>
      </div>

      <div class="gtp-mini-card">
        <h4 style="margin-top:0;">Slide (Background Position)</h4>
        <p class="gtp-tight">
          “Slide” animates <code>background-position</code> so the gradient feels like it’s moving inside the shape.
          This is an underrated effect because it creates motion without moving the layer in space.
        </p>
        <ul class="gtp-list">
          <li><strong>Best for:</strong> animated gradient texture, subtle shimmer, motion inside clip shapes.</li>
          <li><strong>Default feel:</strong> <code>linear</code> or <code>ease-in-out</code>, 8–22s.</li>
          <li><strong>Required:</strong> increase <code>background-size</code> (e.g. 200% 200%) so there’s room to slide.</li>
          <li><strong>Pro:</strong> combine with a tiny hue shift for “iridescent” looks.</li>
        </ul>
        <pre class="gtp-code"><code>.layer { background-size: 200% 200%; }
@keyframes slide { 0%{background-position:0% 50%} 100%{background-position:100% 50%} }</code></pre>
      </div>
    </div>
  </div>

  <div class="gtp-callout">
    <div class="gtp-callout-title">Fast recipes</div>
    <ul class="gtp-list">
      <li><strong>Premium ambient:</strong> rotate (20s linear) + hue (16s linear) + tiny pulse (5s ease-in-out).</li>
      <li><strong>Dreamy:</strong> slow drift (12s ease-in-out) + blur (10s ease-in-out) + glow (10s ease-in-out).</li>
      <li><strong>Mechanical:</strong> step-rotate (8s steps(6)) + mild contrast (6s ease-in-out).</li>
    </ul>
  </div>
</section>

            <section class="gtp-section" data-atp-panel="timing">
              <h3>Timing & Easing</h3>

              <div class="gtp-mini-card">
                <h4>Defaults that look good</h4>
                <ul class="gtp-list">
                  <li><strong>Hue shift</strong>: <code>linear</code>, 8–20s duration</li>
                  <li><strong>Rotate</strong>: <code>linear</code>, 10–30s duration</li>
                  <li><strong>Translate</strong>: <code>ease-in-out</code>, 6–16s duration</li>
                  <li><strong>Pulse</strong>: <code>ease-in-out</code>, 2.5–6s duration</li>
                </ul>
              </div>

              <h4>How to think about easing</h4>
              <ul class="gtp-list">
                <li><strong>Linear</strong> feels like a constant motor (best for hue/rotate).</li>
                <li><strong>Ease-in-out</strong> feels organic (best for drift/pulse).</li>
                <li><strong>Steps(n)</strong> creates intentional ticking (only for step-rotate).</li>
              </ul>

              <div class="gtp-callout">
                <div class="gtp-callout-title">Critical detail</div>
                <p class="gtp-tight">
                  If you apply a single <code>animation-timing-function</code> to an element with multiple animations,
                  it affects all of them. Use per-animation timing values (comma-separated) or bake <code>steps()</code>
                  into only the transform combo that needs it.
                </p>
              </div>
            </section>

            <section class="gtp-section" data-atp-panel="smoothness">
              <h3>Smoothness (No Jerks)</h3>

              <div class="gtp-mini-card">
                <h4>Hue shift without the 0→360 snap</h4>
                <p class="gtp-tight">
                  <code>hue-rotate(0deg)</code> and <code>hue-rotate(360deg)</code> are the same visually, but the compositor
                  can still “pop” if your filter stack changes across keyframes or if you accidentally apply stepping timing.
                </p>
                <ul class="gtp-list">
                  <li>Keep the filter stack consistent in every keyframe (include blur/saturation/etc. each time).</li>
                  <li>Use <code>linear</code> timing for hue.</li>
                  <li>Prefer <code>fromHue</code> to <code>fromHue + 360</code> (a full turn) and include a 50% midpoint.</li>
                </ul>

                <pre class="gtp-code"><code>@keyframes hueLoop {
  0%   { filter: blur(2px) hue-rotate(10deg); }
  50%  { filter: blur(2px) hue-rotate(190deg); }
  100% { filter: blur(2px) hue-rotate(370deg); }
}
.layer { animation: hueLoop 14s linear infinite; }</code></pre>
              </div>

              <div class="gtp-mini-card">
                <h4>Rotation that loops cleanly</h4>
                <ul class="gtp-list">
                  <li>Use 0→360 (or -360) with <code>linear</code>.</li>
                  <li>If you add a midpoint, keep it consistent (0→180→360).</li>
                </ul>
                <pre class="gtp-code"><code>@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.layer { animation: spin 20s linear infinite; }</code></pre>
              </div>

              <div class="gtp-callout">
                <div class="gtp-callout-title">One more gotcha</div>
                <p class="gtp-tight">
                  If you “combine” multiple animations into a single transform or filter keyframe animation,
                  avoid using the maximum delay of all animations as the combo delay — it can make motion appear to “not start.”
                  Prefer delay 0 for combos, and only delay standalone animations like pulse/slide.
                </p>
              </div>
            </section>

            <section class="gtp-section" data-atp-panel="troubleshooting">
              <h3>Troubleshooting</h3>

              <div class="gtp-mini-card">
                <h4>My template loads but nothing animates</h4>
                <ul class="gtp-list">
                  <li>Older templates may be missing <code>layer.animate = true</code>. Infer it from enabled animations on load.</li>
                  <li>Make sure you’re filtering by <code>anim.enabled</code> and not accidentally skipping everything.</li>
                </ul>
              </div>

              <div class="gtp-mini-card">
                <h4>Disabled animations still run</h4>
                <ul class="gtp-list">
                  <li>Confirm your keyframe generator skips animations where <code>enabled === false</code>.</li>
                  <li>Clear <code>div.style.animation = 'none'</code> before rebuilding layer DOM to avoid “sticky” old values.</li>
                </ul>
              </div>

              <div class="gtp-mini-card">
                <h4>Hue shift looks choppy</h4>
                <ul class="gtp-list">
                  <li>Ensure hue uses <code>linear</code>.</li>
                  <li>Make sure step timing (steps()) is not applied globally to all animations.</li>
                  <li>Include base filter parts (like blur) in every keyframe.</li>
                </ul>
              </div>

              <div class="gtp-mini-card">
                <h4>Multiple animations conflict</h4>
                <ul class="gtp-list">
                  <li>Combine transforms into one keyframes block and filters into another, then apply two animations.</li>
                  <li>Use per-animation timing functions (comma-separated), especially if one uses <code>steps()</code>.</li>
                </ul>
              </div>
            </section>

            <section class="gtp-section" data-atp-panel="export">
              <h3>Export & Patterns</h3>
              <p>
                Export should produce standard CSS that works anywhere. If you keep your animation model consistent,
                exporting is just writing keyframes + an <code>animation:</code> line.
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
                  <h4>Pattern: per-animation enabled flags</h4>
                  <p class="gtp-tight">
                    A clean export filters animations:
                  </p>
                  <ul class="gtp-list">
                    <li>If <code>enabled === false</code>, don’t generate keyframes for it.</li>
                    <li>If no enabled animations exist for a layer, output no <code>animation:</code> line.</li>
                    <li>Keep filter stack consistent across keyframes to avoid pops.</li>
                  </ul>
                </div>
              </div>

              <hr class="gtp-hr" />

              <h4>Interactive demo</h4>
              <p class="gtp-tight">Pick an animation stack and see the preview + generated CSS update.</p>

              <div class="gtp-grid2">
                <div>
                  <div class="gtp-row">
                    <label class="gtp-label" style="margin:0;">Preset</label>
                    <select class="gtp-select" id="atpDemoPreset">
                      <option value="spinHue">Spin + Hue (smooth)</option>
                      <option value="driftPulse">Drift + Pulse (organic)</option>
                      <option value="stepSpin">Step Rotate (ticking)</option>
                      <option value="blurGlow">Blur + Glow (dreamy)</option>
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
                    The preview is only for this tutorial. Your exported layers will behave the same way in your project.
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>

        <footer class="gtp-footer" style="padding: 12px 18px; border-top: 1px solid rgba(170, 140, 255, 0.14); display:flex; justify-content: space-between; align-items:center; gap: 10px;">
          <div class="gtp-footer-left">
            <span class="gtp-status">Tip: Press <kbd>Esc</kbd> to close. Use <kbd>Tab</kbd> to navigate inside the modal.</span>
          </div>
          <div class="gtp-footer-right" style="display:flex; gap: 10px; align-items:center;">
            <button class="gtp-btn" type="button" data-atp-action="copy-cheatsheet">Copy Cheat Sheet</button>
            <button class="gtp-btn gtp-btn-primary" type="button" data-atp-action="close">Close</button>
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

    _injectDemoKeyframes() {
      // Only used for the tutorial preview (not your app). Keeps this file self-contained without bundling CSS.
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
      this._styleEl = style;
    },

    _initDemo() {
      const out = this._dialog.querySelector("#atpCssOut");
      if (out) out.value = this._demoCSSFor("spinHue");

      // Apply default
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

      // Apply preset
      if (preset === "spinHue") {
        layer.style.animation = "atpSpin 18s linear infinite, atpHue 14s linear infinite";
        if (out) out.value = this._demoCSSFor("spinHue");
        this._setStatus(opts.silent ? "" : "Applied: Spin + Hue (smooth).");
      } else if (preset === "driftPulse") {
        layer.style.animation = "atpDrift 10s ease-in-out infinite, atpPulse 4s ease-in-out infinite";
        if (out) out.value = this._demoCSSFor("driftPulse");
        this._setStatus(opts.silent ? "" : "Applied: Drift + Pulse (organic).");
      } else if (preset === "stepSpin") {
        // steps only for that animation
        layer.style.animation = "atpStepSpin 8s steps(6) infinite";
        if (out) out.value = this._demoCSSFor("stepSpin");
        this._setStatus(opts.silent ? "" : "Applied: Step Rotate (ticking).");
      } else if (preset === "blurGlow") {
        layer.style.animation = "atpBlurGlow 8s ease-in-out infinite";
        if (out) out.value = this._demoCSSFor("blurGlow");
        this._setStatus(opts.silent ? "" : "Applied: Blur + Glow (dreamy).");
      }

      // Micro feedback
      layer.animate([{ transform: "scale(0.992)" }, { transform: "scale(1)" }], { duration: 140, easing: "ease-out" });
    },

    _demoCSSFor(preset) {
      if (preset === "spinHue") {
        return [
          "/* Transform + Filter combo example (smooth loops) */",
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
          "/* Organic motion: ease-in-out drift + gentle opacity pulse */",
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
          "/* Steps timing applies ONLY to this animation */",
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
          "/* Dreamy: blur + glow breathing */",
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

    _copyCheatSheet() {
      const text = this._cheatSheetText();
      this._copyText(text, "Cheat sheet copied. Paste it anywhere.");
    },

    _cheatSheetText() {
      return [
        "ANIMATION CHEAT SHEET (CSS)",
        "",
        "Best defaults:",
        "  rotate: linear, 10–30s",
        "  hue shift: linear, 8–20s (use fromHue + 360 and add 50% midpoint)",
        "  translate: ease-in-out, 6–16s",
        "  pulse: ease-in-out, 2.5–6s (keep range subtle)",
        "",
        "Key practices:",
        "  - If anim.enabled === false, do not generate keyframes or include it in animation list.",
        "  - Clear element.style.animation before rebuilding DOM to prevent 'sticky' old animations.",
        "  - Don't apply a single animation-timing-function to a multi-animation element unless it's comma-separated.",
        "  - Keep filter stacks consistent in every keyframe to avoid pops (include blur/saturation/etc. each time).",
        "",
        "Smooth hue loop template:",
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
  };
})();
