/*!
 * PopupEngine.js (vanilla, standalone)
 * Adds: docking + toasts (auto-dismiss), improved draggable (works with centered modals + docked toasts)
 *
 * Quick usage:
 *   // Modal (center)
 *   const m = Popup.create({ id:"m1", content:"<h2>Hi</h2>" });
 *   m.open();
 *
 *   // Toast (top-right default)
 *   Popup.toast({ content: "Saved!", toast: { duration: 2800 } });
 *
 *   // Dock other positions:
 *   Popup.toast({ dock: "bottom-left", content: "Hello" });
 */

(function (global) {
    "use strict";

    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    const REASONS = Object.freeze({
        PROGRAMMATIC: "programmatic",
        ESC: "esc",
        BACKDROP: "backdrop",
        CLOSE_BUTTON: "close_button",
        DESTROY: "destroy",
        TIMEOUT: "timeout",
    });

    const DOCKS = Object.freeze([
        "center",
        "top-right",
        "top-left",
        "bottom-right",
        "bottom-left",
        "top-center",
        "bottom-center",
    ]);

    const SURFACES = Object.freeze({
        MODAL: "modal",
        TOAST: "toast",
    });

    const defaults = {
        id: null,

        // Surface & positioning
        surface: SURFACES.MODAL, // "modal" | "toast"
        dock: "center", // modal defaults to center; toast defaults to top-right via helper

        // Rendering
        mount: null,
        portal: true,
        template: "modal",
        className: "",

        // Content
        content: null,
        title: null,

        // Accessibility / behavior
        role: "dialog",
        ariaLabel: null,
        ariaLabelledby: null,
        ariaDescribedby: null,

        trapFocus: true,
        returnFocus: true,
        initialFocus: null,
        finalFocus: null,
        closeOnEsc: true,
        closeOnBackdrop: true,

        lockScroll: true,
        inertBackground: true,
        stack: true,

        animate: true,
        reducedMotion: "respect",

        onBeforeOpen: null,
        onOpen: null,
        onBeforeClose: null,
        onClose: null,

        plugins: [],

        teleport: {
            mode: "move",
            restore: true,
            preserveSize: false,
            keepAlive: false,
            pauseMediaOnClose: true,
        },

        draggable: false, // true | { handle, boundsPadding, snap, persistKey, keyboard, axis }

        // Toast options (only relevant if surface === "toast")
        toast: {
            duration: 4000,       // ms
            pauseOnHover: true,
            closeOnClick: true,
            maxVisible: 5,        // per dock
            dismissNewestFirst: false, // if overflow, remove newest or oldest
            ariaLive: "polite",   // "polite" | "assertive" | "off"
        },
    };

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function mergeDeep(target, source) {
        const out = Array.isArray(target) ? target.slice() : { ...target };
        for (const key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
            const sv = source[key];
            if (sv && typeof sv === "object" && !Array.isArray(sv) && !(sv instanceof Node)) {
                out[key] = mergeDeep(out[key] || {}, sv);
            } else {
                out[key] = sv;
            }
        }
        return out;
    }

    function toElement(input, root = document) {
        if (!input) return null;
        if (input instanceof Element) return input;
        if (typeof input === "string") return root.querySelector(input);
        return null;
    }

    function safeCall(fn, ...args) {
        try {
            return fn ? fn(...args) : undefined;
        } catch (_) {
            return undefined;
        }
    }

    function isProbablyInteractive(el) {
        if (!el || !(el instanceof Element)) return false;
        const tag = el.tagName;
        return (
            tag === "A" ||
            tag === "BUTTON" ||
            tag === "INPUT" ||
            tag === "SELECT" ||
            tag === "TEXTAREA" ||
            el.isContentEditable === true ||
            el.getAttribute("role") === "button"
        );
    }

    function getFocusable(root) {
        if (!root) return [];
        const selectors = [
            "a[href]",
            "area[href]",
            "button:not([disabled])",
            "input:not([disabled]):not([type='hidden'])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "iframe",
            "object",
            "embed",
            "[contenteditable='true']",
            "[tabindex]:not([tabindex='-1'])",
            "audio[controls]",
            "video[controls]",
            "summary",
        ];
        const nodes = Array.from(root.querySelectorAll(selectors.join(",")));
        return nodes.filter((el) => {
            const style = window.getComputedStyle(el);
            return style.visibility !== "hidden" && style.display !== "none" && el.offsetParent !== null;
        });
    }

    // -----------------------------
    // Scroll lock (modal-only)
    // -----------------------------
    const ScrollLock = (() => {
        let locked = false;
        let prev = null;

        function lock() {
            if (!isBrowser || locked) return;
            const body = document.body;
            const html = document.documentElement;

            const scrollY = window.scrollY || window.pageYOffset || 0;

            prev = {
                bodyOverflow: body.style.overflow,
                bodyPosition: body.style.position,
                bodyTop: body.style.top,
                bodyWidth: body.style.width,
                htmlOverflow: html.style.overflow,
                scrollY,
            };

            html.style.overflow = "hidden";
            body.style.overflow = "hidden";
            body.style.position = "fixed";
            body.style.top = `-${scrollY}px`;
            body.style.width = "100%";

            locked = true;
        }

        function unlock() {
            if (!isBrowser || !locked || !prev) return;
            const body = document.body;
            const html = document.documentElement;

            html.style.overflow = prev.htmlOverflow;
            body.style.overflow = prev.bodyOverflow;
            body.style.position = prev.bodyPosition;
            body.style.top = prev.bodyTop;
            body.style.width = prev.bodyWidth;

            window.scrollTo(0, prev.scrollY);

            prev = null;
            locked = false;
        }

        return { lock, unlock };
    })();

    // -----------------------------
    // Inert background (modal-only, best effort)
    // -----------------------------
    const InertManager = (() => {
        let applied = false;
        let saved = [];
        let savedAriaHidden = [];

        function apply(exceptEl) {
            if (!isBrowser || applied) return;
            const body = document.body;
            const children = Array.from(body.children);

            saved = [];
            savedAriaHidden = [];

            for (const child of children) {
                if (child === exceptEl) continue;

                if ("inert" in child) {
                    saved.push([child, child.inert]);
                    child.inert = true;
                } else {
                    savedAriaHidden.push([child, child.getAttribute("aria-hidden")]);
                    child.setAttribute("aria-hidden", "true");
                }
            }

            applied = true;
        }

        function remove() {
            if (!isBrowser || !applied) return;

            for (const [el, old] of saved) el.inert = old;
            for (const [el, old] of savedAriaHidden) {
                if (old === null || old === undefined) el.removeAttribute("aria-hidden");
                else el.setAttribute("aria-hidden", old);
            }

            saved = [];
            savedAriaHidden = [];
            applied = false;
        }

        return { apply, remove };
    })();

    // -----------------------------
    // Teleport registry
    // -----------------------------
    const TeleportRegistry = (() => {
        const map = new Map();

        function makePlaceholder(preserveSize, el) {
            const placeholder = document.createElement("span");
            placeholder.setAttribute("data-popup-placeholder", "");
            placeholder.style.display = "none";
            if (preserveSize && el) {
                const rect = el.getBoundingClientRect();
                placeholder.style.display = "block";
                placeholder.style.width = rect.width ? `${rect.width}px` : "";
                placeholder.style.height = rect.height ? `${rect.height}px` : "";
                placeholder.style.visibility = "hidden";
            }
            return placeholder;
        }

        function teleport({ el, into, mode, preserveSize }) {
            if (!el || !(el instanceof Element)) throw new Error("teleport: el must be Element");
            if (!into || !(into instanceof Element)) throw new Error("teleport: into must be Element");

            if (map.has(el)) return map.get(el);

            const parent = el.parentNode;
            const nextSibling = el.nextSibling;
            if (!parent) throw new Error("teleport: element has no parent");

            if (mode === "clone") {
                const clone = el.cloneNode(true);
                into.appendChild(clone);
                const rec = { mode: "clone", original: el, clone, placeholder: null, parent, nextSibling, restored: false };
                map.set(el, rec);
                return rec;
            }

            const placeholder = makePlaceholder(preserveSize, el);
            parent.insertBefore(placeholder, nextSibling);
            into.appendChild(el);

            const rec = { mode: "move", original: el, clone: null, placeholder, parent, restored: false };
            map.set(el, rec);
            return rec;
        }

        function restore(el) {
            const rec = map.get(el);
            if (!rec || rec.restored) return;

            if (rec.mode === "clone") {
                if (rec.clone && rec.clone.parentNode) rec.clone.parentNode.removeChild(rec.clone);
                rec.restored = true;
                map.delete(el);
                return;
            }

            const { original, placeholder, parent } = rec;
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(original, placeholder);
                placeholder.parentNode.removeChild(placeholder);
            } else if (parent) {
                parent.appendChild(original);
            }

            rec.restored = true;
            map.delete(el);
        }

        return { teleport, restore };
    })();

    // -----------------------------
    // Focus trap
    // -----------------------------
    function createFocusTrap(instance) {
        let active = false;
        let lastFocusedBeforeOpen = null;

        function onKeyDown(e) {
            if (!active) return;
            if (e.key !== "Tab") return;

            const dialog = instance._els.dialog;
            if (!dialog) return;

            const focusables = getFocusable(dialog);
            if (focusables.length === 0) {
                e.preventDefault();
                dialog.focus({ preventScroll: true });
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const current = document.activeElement;

            if (e.shiftKey) {
                if (current === first || current === dialog) {
                    e.preventDefault();
                    last.focus({ preventScroll: true });
                }
            } else {
                if (current === last) {
                    e.preventDefault();
                    first.focus({ preventScroll: true });
                }
            }
        }

        function activate() {
            if (!isBrowser || active) return;
            active = true;
            lastFocusedBeforeOpen = document.activeElement instanceof Element ? document.activeElement : null;
            document.addEventListener("keydown", onKeyDown, true);
        }

        function deactivate() {
            if (!isBrowser || !active) return;
            active = false;
            document.removeEventListener("keydown", onKeyDown, true);
        }

        function getLastFocused() {
            return lastFocusedBeforeOpen;
        }

        return { activate, deactivate, getLastFocused };
    }

    // -----------------------------
    // Modal Manager (stacking, globals) - modals only
    // -----------------------------
    const ModalManager = (() => {
        const stack = [];
        let baseZ = 1000;

        function top() {
            return stack.length ? stack[stack.length - 1] : null;
        }

        function isTop(inst) {
            return top() === inst;
        }

        function push(inst) {
            stack.push(inst);
            applyGlobals();
            updateZ();
        }

        function remove(inst) {
            const i = stack.indexOf(inst);
            if (i >= 0) stack.splice(i, 1);
            applyGlobals();
            updateZ();
        }

        function applyGlobals() {
            const anyOpen = stack.length > 0;
            const topInst = top();

            if (!anyOpen) {
                ScrollLock.unlock();
                InertManager.remove();
                return;
            }

            const shouldLock = stack.some((s) => !!s.options.lockScroll);
            if (shouldLock) ScrollLock.lock();
            else ScrollLock.unlock();

            if (topInst && topInst.options.inertBackground) {
                InertManager.apply(topInst._els.container);
            } else {
                InertManager.remove();
            }
        }

        function updateZ() {
            for (let i = 0; i < stack.length; i++) {
                const inst = stack[i];
                const z = baseZ + i * 10;
                if (inst._els.container) inst._els.container.style.zIndex = String(z);
            }
        }

        function setBaseZIndex(z) {
            baseZ = Number(z) || baseZ;
            updateZ();
        }

        return { push, remove, top, isTop, setBaseZIndex };
    })();

    // -----------------------------
    // Toast Dock Manager (per dock, maxVisible)
    // -----------------------------
    const ToastDockManager = (() => {
        const docks = new Map(); // dockName -> { el, instances: PopupInstance[] }

        function ensureDock(dock) {
            const name = DOCKS.includes(dock) ? dock : "top-right";
            if (docks.has(name)) return docks.get(name);

            const el = document.createElement("div");
            el.className = `popup-toast-dock popup-toast-dock--${name}`;
            el.setAttribute("data-popup-toast-dock", name);
            // allow clicks on toasts, but not block page elsewhere
            el.style.pointerEvents = "none";

            document.body.appendChild(el);
            const state = { el, instances: [] };
            docks.set(name, state);
            return state;
        }

        function add(instance) {
            const dock = instance.options.dock || "top-right";
            const state = ensureDock(dock);
            state.instances.push(instance);
            state.el.appendChild(instance._els.container); // container is lightweight for toasts
            enforceMax(state, instance.options.toast);
            updateZ(state);
        }

        function remove(instance) {
            const dock = instance.options.dock || "top-right";
            const state = docks.get(dock);
            if (!state) return;

            const i = state.instances.indexOf(instance);
            if (i >= 0) state.instances.splice(i, 1);

            updateZ(state);
        }

        function enforceMax(state, toastOpts) {
            const max = Number(toastOpts?.maxVisible ?? 5);
            if (!max || max < 1) return;

            while (state.instances.length > max) {
                const inst = toastOpts?.dismissNewestFirst ? state.instances.pop() : state.instances.shift();
                if (inst) inst.close(REASONS.PROGRAMMATIC, { overflow: true });
            }
        }

        function updateZ(state) {
            // keep toasts above modals by default
            const base = 3000;
            for (let i = 0; i < state.instances.length; i++) {
                const inst = state.instances[i];
                if (inst._els.container) inst._els.container.style.zIndex = String(base + i);
            }
        }

        return { add, remove };
    })();

    // -----------------------------
    // Improved Draggable plugin (works with centered transforms)
    // -----------------------------
    function DraggablePlugin(options) {
        const opts = typeof options === "object" ? options : {};
        return function attach(instance) {
            let dragging = false;
            let pointerId = null;

            let startClientX = 0,
                startClientY = 0;

            let originX = 0,
                originY = 0;

            let currentX = 0,
                currentY = 0;

            const cfg = {
                handle: opts.handle || null,
                boundsPadding: opts.boundsPadding ?? 8,
                snap: opts.snap || null,
                persistKey: opts.persistKey || (instance.options.id ? `popup_pos_${instance.options.id}` : null),
                keyboard: opts.keyboard ?? false,
                axis: opts.axis || "both", // both | x | y
            };

            function baseTransformPrefix() {
                // IMPORTANT: keep the modal's centering transform, then apply drag offset.
                // For docked (non-center) surfaces, no base translate is needed.
                const isCenter = instance.options.dock === "center";
                if (isCenter) return "translate3d(-50%, -50%, 0)";
                return "translate3d(0, 0, 0)";
            }

            function applyTransform(x, y) {
                const dialog = instance._els.dialog;
                if (!dialog) return;

                currentX = x;
                currentY = y;

                const prefix = baseTransformPrefix();
                dialog.style.transform = `${prefix} translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
                dialog.setAttribute("data-popup-dragged", "true");
            }

            function loadPersisted() {
                if (!cfg.persistKey) return null;
                try {
                    const raw = localStorage.getItem(cfg.persistKey);
                    if (!raw) return null;
                    const val = JSON.parse(raw);
                    if (typeof val?.x === "number" && typeof val?.y === "number") return val;
                } catch (_) { }
                return null;
            }

            function savePersisted(x, y) {
                if (!cfg.persistKey) return;
                try {
                    localStorage.setItem(cfg.persistKey, JSON.stringify({ x, y }));
                } catch (_) { }
            }

            function getHandleEl() {
                const dialog = instance._els.dialog;
                if (!dialog) return null;

                if (cfg.handle) {
                    const h = dialog.querySelector(cfg.handle);
                    if (h) return h;
                }
                const header = dialog.querySelector("[data-popup-header]") || dialog.querySelector(".popup__header");
                return header || dialog;
            }

            function clampToViewport(x, y) {
                const dialog = instance._els.dialog;
                if (!dialog) return { x, y };

                // compute based on current rect, then adjust by delta (works even when centered via transform)
                const pad = cfg.boundsPadding;
                const rect = dialog.getBoundingClientRect();

                const dx = x - currentX;
                const dy = y - currentY;

                let left = rect.left + dx;
                let right = rect.right + dx;
                let top = rect.top + dy;
                let bottom = rect.bottom + dy;

                // clamp horizontally
                if (left < pad) {
                    x += (pad - left);
                    left = pad;
                    right = left + rect.width;
                } else if (right > window.innerWidth - pad) {
                    x -= (right - (window.innerWidth - pad));
                    right = window.innerWidth - pad;
                    left = right - rect.width;
                }

                // clamp vertically
                if (top < pad) {
                    y += (pad - top);
                    top = pad;
                    bottom = top + rect.height;
                } else if (bottom > window.innerHeight - pad) {
                    y -= (bottom - (window.innerHeight - pad));
                    bottom = window.innerHeight - pad;
                    top = bottom - rect.height;
                }

                return { x, y };
            }

            function snapIfNeeded(x, y) {
                if (!cfg.snap) return { x, y };
                const dialog = instance._els.dialog;
                if (!dialog) return { x, y };

                const rect = dialog.getBoundingClientRect();
                const pad = cfg.boundsPadding;
                const thresh = 16;

                const leftDist = rect.left - pad;
                const rightDist = (window.innerWidth - pad) - rect.right;
                const topDist = rect.top - pad;
                const bottomDist = (window.innerHeight - pad) - rect.bottom;

                let nx = x;
                let ny = y;

                if (cfg.snap === "edges" || cfg.snap === "corners") {
                    if (Math.abs(leftDist) <= thresh) nx = x - leftDist;
                    if (Math.abs(rightDist) <= thresh) nx = x + rightDist;
                    if (Math.abs(topDist) <= thresh) ny = y - topDist;
                    if (Math.abs(bottomDist) <= thresh) ny = y + bottomDist;
                }

                return { x: nx, y: ny };
            }

            function onPointerDown(e) {
                if (!instance.isOpen()) return;
                // Modal: only draggable if top-most modal; Toast: always ok (per dock)
                if (instance.options.surface === SURFACES.MODAL && !ModalManager.isTop(instance)) return;

                const handle = getHandleEl();
                if (!handle) return;

                if (!(e.target instanceof Element)) return;
                if (!handle.contains(e.target)) return;

                if (isProbablyInteractive(e.target) || e.target.closest("[data-popup-no-drag]")) return;

                dragging = true;
                pointerId = e.pointerId;

                startClientX = e.clientX;
                startClientY = e.clientY;

                originX = currentX;
                originY = currentY;

                // capture so drag stays active
                try {
                    handle.setPointerCapture(pointerId);
                } catch (_) { }

                document.documentElement.style.userSelect = "none";
                instance.emit("dragstart", { x: currentX, y: currentY });

                e.preventDefault();
            }

            function onPointerMove(e) {
                if (!dragging) return;
                if (e.pointerId !== pointerId) return;

                let dx = e.clientX - startClientX;
                let dy = e.clientY - startClientY;

                if (cfg.axis === "x") dy = 0;
                if (cfg.axis === "y") dx = 0;

                let x = originX + dx;
                let y = originY + dy;

                const clamped = clampToViewport(x, y);
                x = clamped.x;
                y = clamped.y;

                applyTransform(x, y);
                instance.emit("drag", { x, y });

                e.preventDefault();
            }

            function onPointerUp(e) {
                if (!dragging) return;
                if (e.pointerId !== pointerId) return;

                dragging = false;

                const handle = getHandleEl();
                if (handle) {
                    try {
                        handle.releasePointerCapture(pointerId);
                    } catch (_) { }
                }

                document.documentElement.style.userSelect = "";

                let { x, y } = snapIfNeeded(currentX, currentY);
                const clamped = clampToViewport(x, y);
                applyTransform(clamped.x, clamped.y);
                savePersisted(clamped.x, clamped.y);

                instance.emit("dragend", { x: clamped.x, y: clamped.y });

                pointerId = null;
                e.preventDefault();
            }

            function onResize() {
                if (!instance.isOpen()) return;
                const clamped = clampToViewport(currentX, currentY);
                applyTransform(clamped.x, clamped.y);
                savePersisted(clamped.x, clamped.y);
            }

            function onKeyDown(e) {
                if (!cfg.keyboard) return;
                if (!instance.isOpen()) return;
                if (instance.options.surface === SURFACES.MODAL && !ModalManager.isTop(instance)) return;
                if (!(document.activeElement && instance._els.dialog && instance._els.dialog.contains(document.activeElement))) return;
                if (!e.altKey) return;

                const step = e.shiftKey ? 1 : 10;
                let x = currentX;
                let y = currentY;

                if (e.key === "ArrowLeft") x -= step;
                else if (e.key === "ArrowRight") x += step;
                else if (e.key === "ArrowUp") y -= step;
                else if (e.key === "ArrowDown") y += step;
                else return;

                const clamped = clampToViewport(x, y);
                applyTransform(clamped.x, clamped.y);
                savePersisted(clamped.x, clamped.y);

                instance.emit("drag", { x: clamped.x, y: clamped.y });
                e.preventDefault();
            }

            function attachEvents() {
                const handle = getHandleEl();
                if (!handle) return;

                handle.style.touchAction = "none";
                handle.addEventListener("pointerdown", onPointerDown);
                window.addEventListener("pointermove", onPointerMove, { passive: false });
                window.addEventListener("pointerup", onPointerUp, { passive: false });
                window.addEventListener("resize", onResize);
                window.addEventListener("keydown", onKeyDown, true);
            }

            function detachEvents() {
                const handle = getHandleEl();
                if (handle) handle.removeEventListener("pointerdown", onPointerDown);
                window.removeEventListener("pointermove", onPointerMove);
                window.removeEventListener("pointerup", onPointerUp);
                window.removeEventListener("resize", onResize);
                window.removeEventListener("keydown", onKeyDown, true);
            }

            function resetPositionOnOpen() {
                const persisted = loadPersisted();
                if (persisted) {
                    currentX = persisted.x;
                    currentY = persisted.y;
                    applyTransform(currentX, currentY);
                } else {
                    currentX = 0;
                    currentY = 0;
                    applyTransform(0, 0);
                }
            }

            instance.on("afterOpen", () => {
                attachEvents();
                resetPositionOnOpen();
            });

            instance.on("beforeClose", () => {
                detachEvents();
            });

            instance.on("destroy", () => {
                detachEvents();
            });
        };
    }

    // -----------------------------
    // Popup Instance
    // -----------------------------
    class PopupInstance {
        constructor(engine, options) {
            if (!isBrowser) throw new Error("PopupEngine requires a browser environment.");
            this.engine = engine;
            this.options = options;

            this._state = { open: false, destroyed: false, opening: false, closing: false };

            this._els = { container: null, backdrop: null, dialog: null, content: null };

            this._events = new Map();
            this._focusTrap = createFocusTrap(this);
            this._lastActive = null;

            this._teleportRecord = null;

            // toast timer state
            this._toastTimer = null;
            this._toastRemaining = null;
            this._toastStart = null;

            this._build();
            this._attachCoreListeners();
            this._attachPlugins();
        }

        on(name, fn) {
            if (!this._events.has(name)) this._events.set(name, new Set());
            this._events.get(name).add(fn);
            return this;
        }
        off(name, fn) {
            const set = this._events.get(name);
            if (set) set.delete(fn);
            return this;
        }
        emit(name, payload) {
            const set = this._events.get(name);
            if (!set) return;
            for (const fn of set) safeCall(fn, payload);
        }

        _build() {
            const opts = this.options;

            const container = document.createElement("div");
            container.className = `popup-root ${opts.className || ""}`.trim();
            container.setAttribute("data-popup-root", "");
            container.setAttribute("data-popup-surface", opts.surface);
            container.setAttribute("data-popup-dock", opts.dock);

            // Modal is fullscreen container; Toast container is a lightweight wrapper (docked by CSS)
            if (opts.surface === SURFACES.MODAL) {
                container.style.position = "fixed";
                container.style.inset = "0";
            } else {
                container.style.position = "relative"; // dock provides positioning
            }
            container.style.display = "none";

            // Backdrop only for modal unless user forces
            const backdrop = document.createElement("div");
            backdrop.className = "popup-backdrop";
            backdrop.setAttribute("data-popup-backdrop", "");

            const dialog = document.createElement("div");
            dialog.className = "popup-dialog";
            dialog.setAttribute("data-popup-dialog", "");
            dialog.setAttribute("role", opts.role || "dialog");
            dialog.setAttribute("tabindex", "-1");

            // Labels
            if (opts.ariaLabel) dialog.setAttribute("aria-label", opts.ariaLabel);
            if (opts.ariaLabelledby) dialog.setAttribute("aria-labelledby", opts.ariaLabelledby);
            if (opts.ariaDescribedby) dialog.setAttribute("aria-describedby", opts.ariaDescribedby);

            // Toast announcement
            if (opts.surface === SURFACES.TOAST) {
                const ariaLive = opts.toast?.ariaLive ?? "polite";
                if (ariaLive !== "off") {
                    dialog.setAttribute("aria-live", ariaLive);
                    dialog.setAttribute("aria-atomic", "true");
                }
            }

            const content = document.createElement("div");
            content.className = "popup-content";
            content.setAttribute("data-popup-content", "");

            // Title slot
            if (opts.title != null) {
                const titleBox = document.createElement("div");
                titleBox.className = "popup__header";
                titleBox.setAttribute("data-popup-header", "");
                titleBox.innerText = opts.title;
                dialog.appendChild(titleBox);
            }

            dialog.appendChild(content);

            // Compose
            if (opts.surface === SURFACES.MODAL) {
                container.appendChild(backdrop);
            }
            container.appendChild(dialog);

            // Mount
            const mount = opts.mount ? toElement(opts.mount) : document.body;
            if (!mount) throw new Error("PopupEngine: mount not found.");
            if (opts.portal && opts.surface === SURFACES.MODAL) mount.appendChild(container);
            // toasts are dock-mounted by ToastDockManager on open

            this._els = { container, backdrop, dialog, content };

            // Dock positioning (attributes + inline helpers)
            this._applyDockLayout();

            if (opts.content != null) this.setContent(opts.content);
        }

        _applyDockLayout() {
            const { dialog } = this._els;
            const { surface, dock } = this.options;

            // Reset positional styles; CSS will handle most
            dialog.style.left = "";
            dialog.style.right = "";
            dialog.style.top = "";
            dialog.style.bottom = "";

            if (surface === SURFACES.MODAL) {
                // center is default; other docks could be supported later for "non-modal panels"
                // we still support "center" primarily.
                // leave CSS to center in .popup-dialog
            } else {
                // toast: no centering transform baseline in CSS; the dock container handles it
                // dialog should not be absolutely centered
            }
        }

        _attachCoreListeners() {
            const { backdrop, container, dialog } = this._els;

            if (this.options.surface === SURFACES.MODAL) {
                backdrop.addEventListener("mousedown", (e) => e.preventDefault());
                backdrop.addEventListener("click", (e) => {
                    if (!this.isOpen()) return;
                    if (!ModalManager.isTop(this)) return;
                    if (!this.options.closeOnBackdrop) return;
                    this.close(REASONS.BACKDROP);
                });
            }

            // Close buttons inside container
            container.addEventListener("click", (e) => {
                const target = e.target instanceof Element ? e.target : null;
                if (!target) return;
                const closeBtn = target.closest("[data-popup-close]");
                if (!closeBtn) return;

                if (!this.isOpen()) return;
                if (this.options.surface === SURFACES.MODAL && !ModalManager.isTop(this)) return;

                e.preventDefault();
                this.close(REASONS.CLOSE_BUTTON);
            });

            // Toast click to close (optional)
            if (this.options.surface === SURFACES.TOAST) {
                dialog.addEventListener("click", () => {
                    if (!this.isOpen()) return;
                    if (!this.options.toast?.closeOnClick) return;
                    this.close(REASONS.CLOSE_BUTTON);
                });
            }

            // ESC (modal only by default, but allowed if enabled on toast)
            document.addEventListener(
                "keydown",
                (e) => {
                    if (!this.isOpen()) return;
                    if (!this.options.closeOnEsc) return;

                    if (this.options.surface === SURFACES.MODAL && !ModalManager.isTop(this)) return;
                    if (e.key === "Escape") {
                        e.preventDefault();
                        this.close(REASONS.ESC);
                    }
                },
                true
            );
        }

        _attachPlugins() {
            const opts = this.options;

            if (opts.draggable) {
                const dOpts = opts.draggable === true ? {} : opts.draggable;
                new DraggablePlugin(dOpts)(this);
            }

            const plugins = Array.isArray(opts.plugins) ? opts.plugins : [];
            for (const p of plugins) {
                try {
                    if (typeof p === "function") p(this);
                    else if (p && typeof p.attach === "function") p.attach(this);
                } catch (_) { }
            }
        }

        // ----- Content -----
        clearContent() {
            this._restoreTeleportIfNeeded({ reason: "content_clear" });
            const { content } = this._els;
            while (content.firstChild) content.removeChild(content.firstChild);
            return this;
        }

        setContent(contentSpec) {
            this.clearContent();
            const { content } = this._els;
            const opts = this.options;

            if (
                contentSpec &&
                typeof contentSpec === "object" &&
                !Array.isArray(contentSpec) &&
                !(contentSpec instanceof Node)
            ) {
                if (contentSpec.teleport) {
                    const el = toElement(contentSpec.teleport);
                    if (!el) throw new Error(`PopupEngine: teleport target not found: ${contentSpec.teleport}`);

                    const mode = contentSpec.mode || opts.teleport.mode;
                    const preserveSize = contentSpec.preserveSize ?? opts.teleport.preserveSize;

                    const rec = TeleportRegistry.teleport({ el, into: content, mode, preserveSize });
                    this._teleportRecord = {
                        target: el,
                        rec,
                        restore: contentSpec.restore ?? opts.teleport.restore,
                        keepAlive: contentSpec.keepAlive ?? opts.teleport.keepAlive,
                        pauseMediaOnClose: contentSpec.pauseMediaOnClose ?? opts.teleport.pauseMediaOnClose,
                    };
                    content.setAttribute("data-popup-has-teleport", "true");
                    return this;
                }

                if (contentSpec.html != null) {
                    content.innerHTML = String(contentSpec.html);
                    return this;
                }

                if (contentSpec.node instanceof Node) {
                    content.appendChild(contentSpec.node);
                    return this;
                }
            }

            if (contentSpec instanceof Node) {
                content.appendChild(contentSpec);
                return this;
            }

            if (typeof contentSpec === "string") {
                content.innerHTML = contentSpec;
                return this;
            }

            content.textContent = contentSpec == null ? "" : String(contentSpec);
            return this;
        }

        _restoreTeleportIfNeeded() {
            const tr = this._teleportRecord;
            if (!tr) return;

            if (tr.pauseMediaOnClose) {
                const root = this._els.content;
                const media = root ? root.querySelectorAll("video, audio") : [];
                media.forEach((m) => {
                    try {
                        if (typeof m.pause === "function") m.pause();
                    } catch (_) { }
                });
            }

            if (tr.keepAlive) {
                this._teleportRecord = null;
                return;
            }

            if (tr.restore) TeleportRegistry.restore(tr.target);
            this._teleportRecord = null;
        }

        // ----- Toast timer -----
        _clearToastTimer() {
            if (this._toastTimer) {
                clearTimeout(this._toastTimer);
                this._toastTimer = null;
            }
            this._toastRemaining = null;
            this._toastStart = null;
        }

        _startToastTimer() {
            if (this.options.surface !== SURFACES.TOAST) return;

            const duration = Number(this.options.toast?.duration ?? 0);
            if (!duration || duration < 1) return;

            this._toastRemaining = duration;
            this._toastStart = Date.now();

            this._toastTimer = setTimeout(() => {
                this.close(REASONS.TIMEOUT);
            }, duration);

            if (this.options.toast?.pauseOnHover) {
                const el = this._els.dialog;
                const onEnter = () => {
                    if (!this._toastTimer) return;
                    const elapsed = Date.now() - (this._toastStart || Date.now());
                    this._toastRemaining = Math.max(0, (this._toastRemaining || duration) - elapsed);
                    this._clearToastTimer();
                };
                const onLeave = () => {
                    const remaining = Number(this._toastRemaining ?? 0);
                    if (!remaining) return;
                    this._toastStart = Date.now();
                    this._toastTimer = setTimeout(() => this.close(REASONS.TIMEOUT), remaining);
                };

                // attach once per open
                el.addEventListener("mouseenter", onEnter, { once: true });
                el.addEventListener("mouseleave", onLeave, { once: true });
            }
        }

        // ----- Lifecycle -----
        isOpen() {
            return this._state.open;
        }

        async open(data) {
            if (this._state.destroyed) throw new Error("PopupEngine: instance destroyed.");
            if (this._state.open || this._state.opening) return this;

            this._state.opening = true;
            const ctx = { instance: this, data, reason: REASONS.PROGRAMMATIC };

            const allow = await this._runCancelableHook("onBeforeOpen", ctx);
            if (!allow) {
                this._state.opening = false;
                return this;
            }

            const allow2 = await this._emitCancelable("beforeOpen", ctx);
            if (!allow2) {
                this._state.opening = false;
                return this;
            }

            // Remember focus only for modal
            if (this.options.surface === SURFACES.MODAL) {
                this._lastActive = document.activeElement instanceof Element ? document.activeElement : null;
            }

            const { container } = this._els;

            // Mount toasts into dock on open
            if (this.options.surface === SURFACES.TOAST) {
                ToastDockManager.add(this);
            }

            container.style.display = "block";
            container.setAttribute("data-popup-open", "true");

            // Modal stack behavior
            if (this.options.surface === SURFACES.MODAL) {
                if (this.options.stack !== false) ModalManager.push(this);

                if (this.options.trapFocus) this._focusTrap.activate();
                this._applyInitialFocus();
            } else {
                // Toasts should NOT trap focus or inert by default
                // keep them non-blocking
                this._startToastTimer();
            }

            this._state.open = true;
            this._state.opening = false;

            this.emit("afterOpen", ctx);
            safeCall(this.options.onOpen, ctx);
            this.emit("open", ctx);

            return this;
        }

        async close(reason = REASONS.PROGRAMMATIC, data) {
            if (this._state.destroyed) return this;
            if (!this._state.open || this._state.closing) return this;

            this._state.closing = true;
            const ctx = { instance: this, data, reason };

            const allow = await this._runCancelableHook("onBeforeClose", ctx);
            if (!allow) {
                this._state.closing = false;
                return this;
            }

            const allow2 = await this._emitCancelable("beforeClose", ctx);
            if (!allow2) {
                this._state.closing = false;
                return this;
            }

            this._clearToastTimer();
            this._restoreTeleportIfNeeded();

            if (this.options.surface === SURFACES.MODAL) {
                if (this.options.trapFocus) this._focusTrap.deactivate();
            }

            const { container } = this._els;
            container.style.display = "none";
            container.removeAttribute("data-popup-open");

            if (this.options.surface === SURFACES.MODAL) {
                ModalManager.remove(this);
                this._state.open = false;
                this._state.closing = false;

                if (this.options.returnFocus) this._returnFocus();
            } else {
                ToastDockManager.remove(this);
                this._state.open = false;
                this._state.closing = false;
            }

            this.emit("afterClose", ctx);
            safeCall(this.options.onClose, ctx);
            this.emit("close", ctx);

            return this;
        }

        async destroy() {
            if (this._state.destroyed) return;

            if (this.isOpen()) await this.close(REASONS.DESTROY);

            this._restoreTeleportIfNeeded();

            const { container } = this._els;
            if (container && container.parentNode) container.parentNode.removeChild(container);

            this._state.destroyed = true;
            this.emit("destroy", { instance: this });
            this._events.clear();
        }

        _applyInitialFocus() {
            const { dialog, content } = this._els;
            const init = this.options.initialFocus;

            let el = null;
            if (init === "container") el = dialog;
            else if (init === "first") {
                const focusables = getFocusable(dialog);
                el = focusables[0] || dialog;
            } else {
                el = toElement(init, dialog) || null;
                if (!el) {
                    const focusables = getFocusable(dialog);
                    el = focusables[0] || content || dialog;
                }
            }

            if (el && typeof el.focus === "function") {
                try {
                    el.focus({ preventScroll: true });
                } catch (_) {
                    try { el.focus(); } catch (_) { }
                }
            }
        }

        _returnFocus() {
            const final = this.options.finalFocus;
            const el = toElement(final) || this._lastActive || this._focusTrap.getLastFocused();
            if (el && el instanceof Element && typeof el.focus === "function") {
                try {
                    el.focus({ preventScroll: true });
                } catch (_) {
                    try { el.focus(); } catch (_) { }
                }
            }
            this._lastActive = null;
        }

        async _runCancelableHook(name, ctx) {
            const fn = this.options[name];
            if (!fn) return true;
            try {
                const res = fn(ctx);
                if (res && typeof res.then === "function") return (await res) !== false;
                return res !== false;
            } catch (_) {
                return true;
            }
        }

        async _emitCancelable(eventName, ctx) {
            const set = this._events.get(eventName);
            if (!set || set.size === 0) return true;

            for (const fn of set) {
                try {
                    const res = fn(ctx);
                    if (res && typeof res.then === "function") {
                        const v = await res;
                        if (v === false) return false;
                    } else if (res === false) {
                        return false;
                    }
                } catch (_) { }
            }
            return true;
        }
    }

    // -----------------------------
    // Engine
    // -----------------------------
    class PopupEngine {
        constructor() {
            if (!isBrowser) throw new Error("PopupEngine requires a browser environment.");
            this._instances = new Map();
            this._autoId = 0;
            this._dataApiBound = false;
            this._dataApiHandler = null;
        }

        create(options = {}) {
            const opts = mergeDeep(defaults, options || {});
            const id = opts.id || `popup_${++this._autoId}`;
            opts.id = id;

            // Normalize dock
            if (!DOCKS.includes(opts.dock)) {
                opts.dock = opts.surface === SURFACES.TOAST ? "top-right" : "center";
            }

            // Toast defaults that make sense (non-blocking)
            if (opts.surface === SURFACES.TOAST) {
                opts.lockScroll = false;
                opts.inertBackground = false;
                opts.trapFocus = false;
                opts.returnFocus = false;
                opts.closeOnBackdrop = false;
                // keep ESC optional; default true is fine if user wants, but not necessary
            }

            if (this._instances.has(id)) {
                try { this._instances.get(id).destroy(); } catch (_) { }
                this._instances.delete(id);
            }

            const inst = new PopupInstance(this, opts);
            this._instances.set(id, inst);
            return inst;
        }

        get(id) {
            return this._instances.get(id) || null;
        }

        async open(target, data) {
            if (typeof target === "string") {
                const inst = this.get(target);
                if (!inst) throw new Error(`PopupEngine: popup not found: ${target}`);
                return inst.open(data);
            }
            if (target instanceof PopupInstance) return target.open(data);
            if (target && typeof target === "object") {
                const inst = this.create(target);
                return inst.open(data);
            }
            throw new Error("PopupEngine.open: invalid target");
        }

        async close(target, reason = REASONS.PROGRAMMATIC, data) {
            if (typeof target === "string") {
                const inst = this.get(target);
                if (!inst) return null;
                await inst.close(reason, data);
                return inst;
            }
            if (target instanceof PopupInstance) {
                await target.close(reason, data);
                return target;
            }
            const top = ModalManager.top();
            if (top) {
                await top.close(reason, data);
                return top;
            }
            return null;
        }

        destroy(idOrInstance) {
            const inst =
                typeof idOrInstance === "string"
                    ? this.get(idOrInstance)
                    : idOrInstance instanceof PopupInstance
                        ? idOrInstance
                        : null;

            if (!inst) return;
            this._instances.delete(inst.options.id);
            inst.destroy();
        }

        setBaseZIndex(z) {
            ModalManager.setBaseZIndex(z);
        }

        // Toast helper
        toast(options = {}) {
            const opts = mergeDeep(
                {
                    surface: SURFACES.TOAST,
                    dock: "top-right",
                    closeOnEsc: false,
                },
                options
            );
            const inst = this.create(opts);
            inst.open();
            return inst;
        }

        // Data API (basic)
        initDataApi(root = document) {
            if (!isBrowser) return;
            if (this._dataApiBound) return;

            const handler = async (e) => {
                const target = e.target instanceof Element ? e.target : null;
                if (!target) return;

                const openEl = target.closest("[data-popup-open]");
                if (openEl) {
                    const id = openEl.getAttribute("data-popup-open");
                    if (!id) return;

                    e.preventDefault();

                    let inst = this.get(id);
                    if (!inst) {
                        const existing = root.querySelector(`#${CSS.escape(id)}[data-popup]`);
                        if (existing) {
                            inst = this.create({
                                id,
                                surface: SURFACES.MODAL,
                                dock: "center",
                                content: { teleport: `#${id}`, mode: "move", preserveSize: true },
                            });
                        } else {
                            inst = this.create({ id, content: "" });
                        }
                    }

                    await inst.open({ trigger: openEl });
                    return;
                }
            };

            root.addEventListener("click", handler, true);
            this._dataApiBound = true;
            this._dataApiHandler = handler;
        }

        destroyDataApi(root = document) {
            if (!isBrowser) return;
            if (!this._dataApiBound) return;
            root.removeEventListener("click", this._dataApiHandler, true);
            this._dataApiBound = false;
            this._dataApiHandler = null;
        }
    }

    const engine = isBrowser ? new PopupEngine() : null;

    const Popup = {
        create: (opts) => engine.create(opts),
        get: (id) => engine.get(id),
        open: (target, data) => engine.open(target, data),
        close: (target, reason, data) => engine.close(target, reason, data),
        destroy: (idOrInst) => engine.destroy(idOrInst),

        toast: (opts) => engine.toast(opts),

        setBaseZIndex: (z) => engine.setBaseZIndex(z),

        init: (root) => engine.initDataApi(root),
        destroyInit: (root) => engine.destroyDataApi(root),

        REASONS,
        version: "0.2.0-toasts+docking+draggablefix",
    };

    if (typeof module !== "undefined" && module.exports) module.exports = Popup;
    else global.Popup = Popup;
})(typeof window !== "undefined" ? window : globalThis);
