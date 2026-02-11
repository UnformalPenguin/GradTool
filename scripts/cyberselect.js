(function () {
    function closeAllCyberSelects(except) {
        document.querySelectorAll(".cyber-select[data-open='true']").forEach(el => {
            if (el !== except) el.dataset.open = "false";
        });
    }

    function buildCyberSelectFromNative(nativeSelect) {
        // Skip if already enhanced
        if (nativeSelect.dataset.cyberEnhanced === "true") return;

        nativeSelect.dataset.cyberEnhanced = "true";
        nativeSelect.classList.add("cyber-select-native-hidden");

        const wrap = document.createElement("div");
        wrap.className = "cyber-select";
        wrap.dataset.for = nativeSelect.id || "";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cyber-select__btn";
        btn.setAttribute("aria-haspopup", "listbox");
        btn.setAttribute("aria-expanded", "false");

        const label = document.createElement("span");
        label.className = "cyber-select__label";

        const caret = document.createElement("span");
        caret.className = "cyber-select__caret";

        btn.appendChild(label);
        btn.appendChild(caret);

        const pop = document.createElement("div");
        pop.className = "cyber-select__pop";
        pop.setAttribute("role", "listbox");
        pop.tabIndex = -1;

        // Create options
        const opts = Array.from(nativeSelect.options).map(opt => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "cyber-select__opt";
            b.setAttribute("role", "option");
            b.dataset.value = opt.value;
            b.textContent = opt.textContent;
            return b;
        });

        opts.forEach(b => pop.appendChild(b));

        wrap.appendChild(btn);
        wrap.appendChild(pop);

        // Insert cyber select right after the native select
        nativeSelect.insertAdjacentElement("afterend", wrap);

        function syncFromNative() {
            const selected = nativeSelect.selectedOptions[0];
            label.textContent = selected ? selected.textContent : "Select…";

            const val = nativeSelect.value;
            pop.querySelectorAll(".cyber-select__opt").forEach(o => {
                const isSel = o.dataset.value === val;
                o.setAttribute("aria-selected", isSel ? "true" : "false");
            });
        }

        function setOpen(open) {
            wrap.dataset.open = open ? "true" : "false";
            btn.setAttribute("aria-expanded", open ? "true" : "false");
            if (open) closeAllCyberSelects(wrap);
        }

        btn.addEventListener("click", () => {
            const open = wrap.dataset.open === "true";
            setOpen(!open);
        });

        pop.addEventListener("click", (e) => {
            const opt = e.target.closest(".cyber-select__opt");
            if (!opt) return;

            nativeSelect.value = opt.dataset.value;

            // Fire real change so your inline onchange handlers still run
            nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));

            syncFromNative();
            setOpen(false);
            btn.focus();
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
            if (!wrap.contains(e.target)) setOpen(false);
        });

        // Keyboard support (basic but solid)
        btn.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
                pop.focus();
            }
        });

        pop.addEventListener("keydown", (e) => {
            const options = Array.from(pop.querySelectorAll(".cyber-select__opt"));
            const currentIndex = options.findIndex(o => o.getAttribute("aria-selected") === "true");
            let nextIndex = currentIndex < 0 ? 0 : currentIndex;

            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                btn.focus();
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                nextIndex = Math.min(options.length - 1, nextIndex + 1);
                options[nextIndex].focus();
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                nextIndex = Math.max(0, nextIndex - 1);
                options[nextIndex].focus();
                return;
            }

            if (e.key === "Enter") {
                e.preventDefault();
                const focused = document.activeElement.closest(".cyber-select__opt");
                if (focused) focused.click();
            }
        });

        // Sync if native select changes programmatically
        nativeSelect.addEventListener("change", syncFromNative);

        syncFromNative();
    }

    // Public: enhance all selects inside a container (useful after renderDynamicInputs)
    window.enhanceCyberSelects = function enhanceCyberSelects(container = document) {
        container.querySelectorAll("select").forEach(buildCyberSelectFromNative);
    };

    // Enhance on load
    document.addEventListener("DOMContentLoaded", () => {
        window.enhanceCyberSelects(document);
    });
})();
