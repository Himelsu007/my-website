/* =====================================================
   PIXEL CARD
   -----------------------------------------------------
   A plain-JS port of React Bits' Pixel Card
   (https://reactbits.dev/components/pixel-card): a grid of pixels that ripple
   out from the centre when the card is hovered, focused or tapped, twinkle,
   lean towards the pointer, and pulse from a click. Nothing draws while the
   card is idle or off screen.

   Use: <article data-pixel-card data-pixel-variant="blue"> … </article>
   Options as data attributes: data-pixel-variant (default | blue | yellow |
   pink), data-pixel-colors ("#fff,#eee"), data-pixel-gap, data-pixel-speed,
   data-pixel-opacity (0-1), data-pixel-fade (0-1: thins the pixels towards
   the middle, so text there stays readable), data-pixel-intro-delay (ms).
   Styles: css/pixel-card.css.

   One change from the original: cards here are far larger than the demo's
   300x400, so the grid widens its gap when it would pass MAX_PIXELS, to keep
   every frame cheap on phones.

   Original: Copyright (c) 2026 David Haz, MIT + Commons Clause License
   Condition v1.0 (https://github.com/DavidHDev/react-bits). Permission is
   hereby granted, free of charge, to any person obtaining a copy of this
   software and associated documentation files, to deal in the Software
   without restriction, subject to the following conditions: the above
   copyright notice and this permission notice shall be included in all copies
   or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS",
   WITHOUT WARRANTY OF ANY KIND. The Commons Clause: the grant does not include
   the right to Sell the Software.
   ===================================================== */
(function () {
    "use strict";

    const VARIANTS = {
        default: { gap: 5,  speed: 35, colors: ["#f8fafc", "#f1f5f9", "#cbd5e1"], glow: "#cbd5e1" },
        blue:    { gap: 10, speed: 25, colors: ["#e0f2fe", "#7dd3fc", "#0ea5e9"], glow: "#0ea5e9" },
        yellow:  { gap: 3,  speed: 20, colors: ["#fef08a", "#fde047", "#eab308"], glow: "#eab308" },
        pink:    { gap: 6,  speed: 80, colors: ["#fecdd3", "#fda4af", "#e11d48"], glow: "#e11d48" }
    };
    const APPEAR = 0.26;
    const EXIT = 0.22;
    const MAX_PIXELS = 30000;

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const smoothstep = (e0, e1, v) => {
        const t = clamp((v - e0) / (e1 - e0), 0, 1);
        return t * t * (3 - 2 * t);
    };
    const easeOutBack = t => {
        const c = 1.9, u = t - 1;
        return 1 + (c + 1) * u * u * u + c * u * u;
    };

    let rgbCtx = null;
    function toRgb(color) {
        if (!rgbCtx) {
            const c = document.createElement("canvas");
            c.width = c.height = 1;
            rgbCtx = c.getContext("2d", { willReadFrequently: true });
        }
        if (!rgbCtx) return [255, 255, 255];
        rgbCtx.clearRect(0, 0, 1, 1);
        rgbCtx.fillStyle = "#fff";
        rgbCtx.fillStyle = color;
        rgbCtx.fillRect(0, 0, 1, 1);
        const d = rgbCtx.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2]];
    }

    function settingsFor(el) {
        const ds = el.dataset;
        const preset = VARIANTS[ds.pixelVariant] || VARIANTS.default;
        const colors = ds.pixelColors
            ? ds.pixelColors.split(",").map(c => c.trim()).filter(Boolean)
            : preset.colors;
        return {
            colors: colors.length ? colors : preset.colors,
            gap: Math.max(2, Number(ds.pixelGap || preset.gap) || preset.gap),
            speed: clamp(Number(ds.pixelSpeed || preset.speed) || 0, 0, 100),
            pixelSize: 2,
            revealDuration: 600,
            spotlight: 0.5,
            glow: 0.5,
            glowColor: toRgb(preset.glow),
            opacity: clamp(ds.pixelOpacity ? Number(ds.pixelOpacity) : 1, 0, 1),
            fade: clamp(Number(ds.pixelFade) || 0, 0, 1),
            clickPulse: true,
            intro: true,
            introDelay: Math.max(0, Number(ds.pixelIntroDelay) || 0)
        };
    }

    function initPixelCard(container) {
        const canvas = document.createElement("canvas");
        canvas.className = "pixel-card-canvas";
        canvas.setAttribute("aria-hidden", "true");
        container.insertBefore(canvas, container.firstChild);
        container.classList.add("pixel-card");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const s = settingsFor(container);
        const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

        const state = {
            raf: 0, last: 0, time: 0, visible: true,
            width: 0, height: 0, ratio: 1, key: "", count: 0,
            x: new Float32Array(0), y: new Float32Array(0), tint: new Uint8Array(0),
            size: new Float32Array(0), phase: new Float32Array(0), rate: new Float32Array(0),
            jitter: new Float32Array(0), presence: new Float32Array(0), delay: new Float32Array(0),
            mask: new Float32Array(0), maskKey: "",
            active: false, changedAt: 0, originX: 0, originY: 0, maxDistance: 1,
            pointerX: 0, pointerY: 0, spotX: 0, spotY: 0, spotVX: 0, spotVY: 0, spotPower: 0,
            hovering: false, pulses: [], dt: 1 / 60, releaseAt: -1, introAt: -1
        };

        function build() {
            const rect = container.getBoundingClientRect();
            // getBoundingClientRect includes the page's CSS zoom; the canvas
            // lives inside it, so measure in the card's own pixels.
            const width = Math.max(1, Math.round(container.clientWidth || rect.width));
            const height = Math.max(1, Math.round(container.clientHeight || rect.height));
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            const gap = Math.max(s.gap, Math.ceil(Math.sqrt((width * height) / MAX_PIXELS)));
            const key = [width, height, ratio, gap].join("|");
            if (key === state.key) return;
            state.key = key;
            state.width = width; state.height = height; state.ratio = ratio;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);

            const columns = Math.floor((width - 1) / gap) + 1;
            const rows = Math.floor((height - 1) / gap) + 1;
            const offsetX = (width - (columns - 1) * gap) / 2;
            const offsetY = (height - (rows - 1) * gap) / 2;
            const count = columns * rows;
            const previous = state.presence;
            state.count = count;
            state.x = new Float32Array(count); state.y = new Float32Array(count);
            state.tint = new Uint8Array(count); state.size = new Float32Array(count);
            state.phase = new Float32Array(count); state.rate = new Float32Array(count);
            state.jitter = new Float32Array(count); state.presence = new Float32Array(count);
            state.delay = new Float32Array(count);
            let i = 0;
            for (let c = 0; c < columns; c++) {
                for (let r = 0; r < rows; r++) {
                    state.x[i] = offsetX + c * gap;
                    state.y[i] = offsetY + r * gap;
                    state.tint[i] = Math.floor(Math.random() * s.colors.length);
                    state.size[i] = s.pixelSize * (0.25 + Math.random() * 0.75);
                    state.phase[i] = Math.random() * Math.PI * 2;
                    state.rate[i] = 0.55 + Math.random() * 0.9;
                    state.jitter[i] = Math.random();
                    if (previous.length) state.presence[i] = previous[Math.min(i, previous.length - 1)];
                    i++;
                }
            }
            state.maxDistance = Math.hypot(width, height);
            schedule();
        }

        function schedule() {
            const span = s.revealDuration / 1000;
            let far = 1;
            for (let i = 0; i < state.count; i++) {
                far = Math.max(far, Math.hypot(state.x[i] - state.originX, state.y[i] - state.originY));
            }
            state.maxDistance = far;
            for (let i = 0; i < state.count; i++) {
                const d = Math.hypot(state.x[i] - state.originX, state.y[i] - state.originY) / far;
                state.delay[i] = state.active
                    ? d * span * 0.82 + state.jitter[i] * span * 0.18
                    : (1 - d) * span * 0.45 + state.jitter[i] * span * 0.1;
            }
        }

        function setActiveState(value) {
            if (state.active === value) return;
            state.active = value;
            state.changedAt = state.time;
            if (value) {
                state.originX = state.width / 2;
                state.originY = state.height / 2;
            }
            schedule();
            if (value) container.setAttribute("data-active", "");
            else container.removeAttribute("data-active");
            wake();
        }

        function draw() {
            const { width, height, ratio } = state;
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            ctx.clearRect(0, 0, width, height);

            // fade: pixels thin out from the edges towards the middle.
            const maskKey = `${state.count}|${width}|${height}|${s.fade}`;
            if (state.maskKey !== maskKey) {
                state.maskKey = maskKey;
                state.mask = new Float32Array(state.count);
                const near = Math.min(width, height) * 0.05;
                const far = Math.min(width, height) * 0.42;
                for (let i = 0; i < state.count; i++) {
                    const edge = Math.min(state.x[i], width - state.x[i], state.y[i], height - state.y[i]);
                    const t = clamp((edge - near) / (far - near), 0, 1);
                    state.mask[i] = 1 - s.fade * t * t * t * (t * (t * 6 - 15) + 10);
                }
            }

            let presenceSum = 0;
            const elapsed = state.time - state.changedAt;
            const appearStep = state.dt / APPEAR;
            const exitStep = state.dt / EXIT;
            for (let i = 0; i < state.count; i++) {
                const current = state.presence[i];
                const ready = elapsed >= state.delay[i] || reduce;
                const target = state.active ? (ready ? 1 : 0) : ready ? 0 : current;
                if (reduce) state.presence[i] = target;
                else if (target > current) state.presence[i] = Math.min(1, current + appearStep);
                else if (target < current) state.presence[i] = Math.max(0, current - exitStep);
                presenceSum += state.presence[i];
            }
            const presenceAvg = state.count ? presenceSum / state.count : 0;

            if (s.glow > 0 && presenceAvg > 0.001) {
                const [r, g, b] = s.glowColor;
                const cx = state.spotPower > 0.01 ? state.spotX : state.originX;
                const cy = state.spotPower > 0.01 ? state.spotY : state.originY;
                const reach = Math.max(width, height) * 0.85;
                const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
                const strength = s.glow * s.opacity * 0.32 * Math.min(1, presenceAvg * 1.4);
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${strength})`);
                gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${strength * 0.35})`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            const spotRadius = Math.min(width, height) * 0.38 + 30;
            const spotStrength = s.spotlight * state.spotPower;
            const pulses = state.pulses;
            const twinkle = reduce ? 0 : s.speed > 0 ? 1 : 0;
            const frequency = (s.speed / 35) * 1.35;

            for (let color = 0; color < s.colors.length; color++) {
                ctx.fillStyle = s.colors[color];
                for (let i = 0; i < state.count; i++) {
                    if (state.tint[i] !== color) continue;
                    const presence = state.presence[i];
                    if (presence <= 0.002) continue;
                    const x = state.x[i], y = state.y[i];
                    let size = state.size[i];
                    let alpha = 0.5 + presence * 0.38;
                    if (twinkle) {
                        const wave = Math.sin(state.phase[i] + state.time * frequency * state.rate[i]);
                        size *= 0.62 + 0.38 * wave;
                        alpha += 0.12 * wave + (state.jitter[i] > 0.92 ? 0.35 * Math.max(0, wave) : 0);
                    }
                    size *= easeOutBack(presence);
                    const flash = presence < 1 && state.active ? Math.sin(presence * Math.PI) : 0;
                    size *= 1 + flash * 0.9;
                    alpha += flash * 0.6;
                    if (spotStrength > 0.001) {
                        const near = smoothstep(spotRadius, 0, Math.hypot(x - state.spotX, y - state.spotY));
                        size *= 1 + spotStrength * near * near * 2.4;
                        alpha += spotStrength * near * 0.45;
                    }
                    alpha = Math.min(1, alpha) * state.mask[i] * s.opacity;
                    if (alpha <= 0.004) continue;
                    for (let p = 0; p < pulses.length; p++) {
                        const pulse = pulses[p];
                        const band = (Math.hypot(x - pulse.x, y - pulse.y) - pulse.radius) / 26;
                        const wave = Math.exp(-band * band) * pulse.power;
                        size *= 1 + wave * 1.4;
                        alpha = Math.min(1, alpha + wave * 0.5);
                    }
                    if (size <= 0.05) continue;
                    ctx.globalAlpha = alpha;
                    ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
                }
            }
            ctx.globalAlpha = 1;
            return presenceSum;
        }

        function frame(now) {
            state.raf = 0;
            const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;
            state.last = now;
            state.dt = dt;
            state.time += dt;
            build();

            if (state.introAt >= 0 && state.time >= state.introAt) {
                state.introAt = -1;
                if (!state.active) {
                    setActiveState(true);
                    state.releaseAt = state.time + s.revealDuration / 1000 + 0.7;
                }
            }
            if (state.releaseAt >= 0 && state.time >= state.releaseAt && !state.hovering) {
                state.releaseAt = -1;
                setActiveState(false);
            }

            const want = state.hovering && !reduce ? 1 : 0;
            state.spotPower += (want - state.spotPower) * (1 - Math.exp(-(want ? 6 : 3) * dt));
            const stiffness = 120;
            const damping = 2 * Math.sqrt(stiffness) * 0.9;
            state.spotVX += (stiffness * (state.pointerX - state.spotX) - damping * state.spotVX) * dt;
            state.spotVY += (stiffness * (state.pointerY - state.spotY) - damping * state.spotVY) * dt;
            state.spotX += state.spotVX * dt;
            state.spotY += state.spotVY * dt;

            const pulseSpeed = state.maxDistance / Math.max(0.35, (s.revealDuration / 1000) * 0.9);
            state.pulses = state.pulses.filter(pulse => {
                pulse.radius += pulseSpeed * dt;
                pulse.power = Math.max(0, 1 - pulse.radius / (state.maxDistance + 40));
                return pulse.power > 0;
            });

            const presence = draw();
            const settling = state.active || state.introAt >= 0 || presence > 0 ||
                state.pulses.length > 0 || state.spotPower > 0.002 ||
                Math.abs(state.spotVX) + Math.abs(state.spotVY) > 0.5;
            if (settling && state.visible) state.raf = requestAnimationFrame(frame);
            else state.last = 0;
        }

        function wake() {
            if (!state.raf && state.visible) state.raf = requestAnimationFrame(frame);
        }

        // Pointer position in the card's own pixels (the page may be zoomed).
        function local(event) {
            const rect = container.getBoundingClientRect();
            const kx = rect.width ? state.width / rect.width : 1;
            const ky = rect.height ? state.height / rect.height : 1;
            return [(event.clientX - rect.left) * kx, (event.clientY - rect.top) * ky];
        }

        container.addEventListener("pointerenter", event => {
            const [x, y] = local(event);
            state.hovering = event.pointerType !== "touch";
            state.pointerX = x; state.pointerY = y;
            if (state.spotPower < 0.01) {
                state.spotX = x; state.spotY = y; state.spotVX = 0; state.spotVY = 0;
            }
            state.releaseAt = -1;
            state.introAt = -1;
            setActiveState(true);
            wake();
        });
        container.addEventListener("pointermove", event => {
            const [x, y] = local(event);
            state.pointerX = x; state.pointerY = y;
            wake();
        });
        container.addEventListener("pointerleave", event => {
            state.hovering = false;
            if (event.pointerType === "touch") state.releaseAt = state.time + 1.2;
            else setActiveState(false);
            wake();
        });
        container.addEventListener("pointerdown", event => {
            const [x, y] = local(event);
            if (!state.active) setActiveState(true);
            if (s.clickPulse && !reduce && state.active) state.pulses.push({ x, y, radius: 0, power: 1 });
            // A tap on a phone never "leaves"; let the pixels settle back after a moment.
            if (event.pointerType === "touch") state.releaseAt = state.time + 1.6;
            wake();
        });
        // Keyboard: the card lights up while anything inside it has focus.
        container.addEventListener("focusin", event => {
            if (container.contains(event.relatedTarget)) return;
            setActiveState(true);
        });
        container.addEventListener("focusout", event => {
            if (container.contains(event.relatedTarget)) return;
            if (!state.hovering) setActiveState(false);
        });

        if ("ResizeObserver" in window) {
            new ResizeObserver(() => { build(); wake(); }).observe(container);
        }

        let introStarted = false;
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(entries => {
                state.visible = entries.some(e => e.isIntersecting);
                if (state.visible && !introStarted && s.intro && !reduce) {
                    introStarted = true;
                    build();
                    state.introAt = state.time + s.introDelay / 1000;
                }
                if (state.visible) wake();
            }, { threshold: 0.35 }).observe(container);
        }

        build();
        state.pointerX = state.spotX = state.originX = state.width / 2;
        state.pointerY = state.spotY = state.originY = state.height / 2;
    }

    function initAll() {
        document.querySelectorAll("[data-pixel-card]").forEach(initPixelCard);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAll);
    else initAll();
})();
