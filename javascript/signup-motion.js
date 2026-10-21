/* =====================================================
   SIGN-UP MOTION — the run and training sign-up forms
   -----------------------------------------------------
   Life for private_run_sign_up.html and training_sign_up.html, with
   css/private-run-sign-up.css. Most of it watches the page on its own:
   - the "1 · 2 · 3" steps on the summary card tick off as they go: their
     details filled in, the payment opened (Copy / Pay), then sent;
   - numbers that change (guests, spots needed, the total, spots left) roll
     to their new value, up or down;
   - a chosen pill, a counter button and Copy give a small pop.
   The form scripts call two things:
   - lxSignup.flag(field, message): a missing answer shakes and says what
     it needs, instead of an alert() box;
   - lxSignup.success(button, { label, confetti }): the button presses,
     draws a check and says it's sent; confetti bursts from it and step 3
     ticks. WhatsApp has opened in front by then, so if the page was hidden
     for most of it, the confetti plays again when they come back.
   Animations are the browser's (Web Animations, transform and opacity) and
   a short-lived canvas for the confetti. Nothing moves for reduced motion.
   ===================================================== */
(function () {
    "use strict";

    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var EASE = "cubic-bezier(0.3, 0.7, 0.4, 1)";
    var form = document.querySelector(".auth-container");

    function pop(el, size) {
        if (!el || reduced || !el.animate) return;
        var s = size || 1.06;
        el.animate([
            { transform: "scale(1)" },
            { transform: "scale(0.94)", offset: 0.3 },
            { transform: "scale(" + s + ")", offset: 0.65 },
            { transform: "scale(1)" }
        ], { duration: 380, easing: EASE });
    }

    /* ---------- the steps on the summary card ---------- */
    function step(n, on) {
        var el = document.querySelectorAll(".rs-steps .rs-step")[n - 1];
        if (!el || el.classList.contains("is-done") === (on !== false)) return;
        el.classList.toggle("is-done", on !== false);
    }

    // Step 1: a name, and an answer for every choice on the form.
    function detailsDone() {
        var name = document.getElementById("player-name");
        if (!name || !name.value.trim()) return false;
        var groups = {};
        [].forEach.call(form.querySelectorAll('input[type="radio"]'), function (r) { groups[r.name] = groups[r.name] || r.checked; });
        return Object.keys(groups).every(function (g) { return groups[g]; });
    }
    if (form) {
        form.addEventListener("input", function () { step(1, detailsDone()); });
        form.addEventListener("change", function (e) {
            step(1, detailsDone());
            // a chosen pill pops
            var t = e.target;
            if (t && t.type === "radio" && t.checked) pop(form.querySelector('label[for="' + t.id + '"]'), 1.05);
        });
        form.addEventListener("click", function (e) {
            var b = e.target.closest && e.target.closest(".guest-btn, .pay-action");
            if (!b) return;
            pop(b, 1.1);
            if (b.classList.contains("pay-action")) step(2);   // they've gone to pay
        });
    }

    /* ---------- numbers roll to their new value ---------- */
    var last = new WeakMap();
    function num(t) { var m = String(t).replace(",", ".").match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; }
    function watch(el, pick) {
        if (!el || !window.MutationObserver) return;
        last.set(el, el.textContent);
        new MutationObserver(function () {
            var was = last.get(el), now = el.textContent;
            if (now === was) return;
            last.set(el, now);
            var target = pick ? pick(el) : el;
            if (!target || reduced || !target.animate) return;
            var up = !(num(now) < num(was));
            target.animate([
                { transform: "translateY(" + (up ? "55%" : "-55%") + ")", opacity: 0 },
                { transform: "none", opacity: 1 }
            ], { duration: 320, easing: EASE });
        }).observe(el, { childList: true, characterData: true, subtree: true });
    }
    ["guest-play-count", "guest-watch-count", "pay-amount", "rs-spots"].forEach(function (id) {
        watch(document.getElementById(id));
    });
    watch(document.getElementById("guest-total"), function (el) { return el.querySelector("strong"); });

    /* ---------- a missing answer ---------- */
    function flag(field, message) {
        if (!field) { alert(message); return; }
        var group = field.closest(".input-group") || field;
        var note = group.querySelector(".su-msg");
        if (!note) {
            note = document.createElement("p");
            note.className = "su-msg";
            note.setAttribute("role", "alert");
            group.appendChild(note);
        }
        note.textContent = message;
        group.classList.add("su-flagged");
        var clear = function () {
            group.classList.remove("su-flagged");
            if (note.parentNode) note.remove();
            group.removeEventListener("input", clear);
            group.removeEventListener("change", clear);
        };
        group.addEventListener("input", clear);
        group.addEventListener("change", clear);
        if (!reduced && group.animate) {
            group.animate([
                { transform: "translateX(0)" }, { transform: "translateX(-7px)" }, { transform: "translateX(6px)" },
                { transform: "translateX(-4px)" }, { transform: "translateX(2px)" }, { transform: "translateX(0)" }
            ], { duration: 420, easing: "ease-out" });
        }
        group.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        if (field.matches && field.matches("input[type=text], input:not([type])")) field.focus({ preventScroll: true });
    }

    /* ---------- sent ---------- */
    var celebrated = false;
    function success(button, opts) {
        opts = opts || {};
        step(1); step(3);
        if (button) {
            button.classList.add("su-sent");
            button.innerHTML =
                '<svg class="su-check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
                "<span>" + (opts.label || "Sent — check WhatsApp") + "</span>";
            pop(button, 1.02);
        }
        if (opts.confetti === false || celebrated || reduced) return;
        celebrated = true;
        var started = Date.now();
        confetti(button);
        // WhatsApp usually opens in front: if the page was hidden almost at
        // once, play it again when they come back.
        var hidden = false;
        function vis() {
            if (document.hidden) { if (Date.now() - started < 1200) hidden = true; return; }
            document.removeEventListener("visibilitychange", vis);
            if (hidden) setTimeout(function () { confetti(button); }, 250);
        }
        document.addEventListener("visibilitychange", vis);
        setTimeout(function () { if (!hidden) document.removeEventListener("visibilitychange", vis); }, 1300);
    }

    // Gold, white, WhatsApp green and the brand's plum, from the button out.
    function confetti(from) {
        var c = document.createElement("canvas");
        var ctx = c.getContext && c.getContext("2d");
        if (!ctx) return;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var W = innerWidth, H = innerHeight;
        c.width = W * dpr; c.height = H * dpr;
        c.setAttribute("aria-hidden", "true");
        c.className = "su-confetti";
        document.body.appendChild(c);
        ctx.scale(dpr, dpr);
        var r = from ? from.getBoundingClientRect() : { left: W / 2, width: 0, top: H * 0.7, height: 0 };
        var ox = r.left + r.width / 2, oy = r.top + r.height / 2;
        var COLORS = ["#FFD700", "#FFFFFF", "#25D366", "#85144B", "#FFEC8A"];
        var bits = [];
        for (var i = 0; i < 110; i++) {
            var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;   // mostly up
            var v = 7 + Math.random() * 9;
            bits.push({
                x: ox + (Math.random() - 0.5) * r.width * 0.6, y: oy,
                vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                w: 5 + Math.random() * 5, h: 3 + Math.random() * 4,
                rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.4,
                color: COLORS[i % COLORS.length], round: i % 4 === 0
            });
        }
        var t0 = performance.now(), LIFE = 1900;
        requestAnimationFrame(function frame(t) {
            var k = (t - t0) / LIFE;
            ctx.clearRect(0, 0, W, H);
            if (k >= 1) { c.remove(); return; }
            ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
            bits.forEach(function (b) {
                b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985;
                b.x += b.vx; b.y += b.vy; b.rot += b.vr;
                ctx.save();
                ctx.translate(b.x, b.y); ctx.rotate(b.rot);
                ctx.fillStyle = b.color;
                if (b.round) { ctx.beginPath(); ctx.arc(0, 0, b.h / 1.6, 0, 6.283); ctx.fill(); }
                else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
                ctx.restore();
            });
            requestAnimationFrame(frame);
        });
    }

    window.lxSignup = { flag: flag, success: success, step: step };
})();
