document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    const dateInput = document.getElementById('auth-date');
    let drawing = false;

    // 1. Set current date automatically
    dateInput.value = new Date().toLocaleDateString('en-GB');

    // 2. Signature pad
    // The canvas has no width/height attributes, so its drawing buffer would
    // default to 300x150 while CSS stretches it much wider. That mismatch is
    // what made the ink appear away from the cursor. Size the buffer to the
    // element's real size (x devicePixelRatio for a crisp line) and scale the
    // context so we can keep working in CSS pixels.
    let lastWidth = 0;

    function applyStrokeStyle() {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#ffffff';
    }

    function sizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // Keep whatever has already been signed
        const previous = canvas.width ? canvas.toDataURL() : null;

        const dpr = window.devicePixelRatio || 1;
        canvas.width  = Math.round(rect.width  * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // 1 unit === 1 CSS pixel
        applyStrokeStyle();

        lastWidth = rect.width;

        if (previous) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
            img.src = previous;
        }
    }

    sizeCanvas();

    // Re-size on orientation change / real width changes only. Mobile browsers
    // fire resize constantly as the URL bar hides, and reacting to those
    // height-only changes would repeatedly rescale (and blur) the signature.
    window.addEventListener('resize', () => {
        if (Math.abs(canvas.getBoundingClientRect().width - lastWidth) > 1) sizeCanvas();
    });

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches && e.touches[0];
        // Note: don't use `e.clientX || ...` — clientX of 0 is falsy and valid.
        const clientX = touch ? touch.clientX : e.clientX;
        const clientY = touch ? touch.clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    const startDrawing = (e) => {
        if (e.cancelable) e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        applyStrokeStyle();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        // Render a dot so a simple tap still leaves a mark
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const draw = (e) => {
        if (!drawing) return;
        if (e.cancelable) e.preventDefault();   // stop the page scrolling while signing
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => { drawing = false; ctx.beginPath(); };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    // Touch support for mobile
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    document.getElementById('clear-signature').onclick = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);     // clear the whole buffer, ignoring the dpr scale
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.beginPath();
    };

    // A waiver with no signature isn't a waiver — detect an untouched pad.
    function isSignatureBlank() {
        try {
            const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return false;
            return true;
        } catch (e) { return false; }   // never block signing on a read error
        }

    // Save a generated blob to the user's device.
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // A waiver with no signature isn't a waiver — detect an untouched pad.
    function isSignatureBlank() {
        try {
            const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return false;
            return true;
        } catch (e) { return false; }   // never block signing on a read error
    }

    /* =========================================================
       FINALIZE — capture the form as an image and send it.
       An image sends inline in WhatsApp (a PDF arrives as a file
       attachment), so it's both simpler and easier to receive.
       ========================================================= */
    document.getElementById('generate-pdf').onclick = async function () {
        const element = document.querySelector('.auth-container');
        const name = document.getElementById('auth-name').value.trim();
        const originalLabel = this.innerText;

        if (!name) return alert("Please enter your name first!");
        if (isSignatureBlank()) return alert("Please sign in the box before finalizing.");

        if (typeof html2canvas === 'undefined') {
            alert("The capture tool couldn't load. Please check your connection and refresh the page.");
            return;
        }

        this.innerText = "PROCESSING...";
        this.classList.add('disabled');

        const filename = `Waiver_${name.replace(/\s+/g, '_')}.png`;

        // The <canvas> signature is swapped for a static image and the buttons
        // are hidden, so neither shows up oddly in the capture.
        const sigRect = canvas.getBoundingClientRect();
        const sigImg = document.createElement('img');
        sigImg.src = canvas.toDataURL('image/png');
        sigImg.style.cssText =
            `width:100%;height:${sigRect.height}px;display:block;object-fit:contain;background:#000;border-radius:8px;`;
        canvas.parentNode.insertBefore(sigImg, canvas);
        canvas.style.display = 'none';

        const hidden = [document.getElementById('clear-signature'), this]
            .filter(Boolean)
            .map(el => { const prev = el.style.visibility; el.style.visibility = 'hidden'; return [el, prev]; });

        const restoreDom = () => {
            sigImg.remove();
            canvas.style.display = '';
            hidden.forEach(([el, prev]) => { el.style.visibility = prev; });
        };

        try {
            if (!sigImg.complete) await new Promise(r => { sigImg.onload = r; sigImg.onerror = r; });

            const shot = await html2canvas(element, {
                scale: 2,                       // retina-sharp
                backgroundColor: '#101013',
                logging: false,
                useCORS: true
            });
            restoreDom();

            const blob = await new Promise(res => shot.toBlob(res, 'image/png'));
            if (!blob) throw new Error('Could not create the image.');

            const file = new File([blob], filename, { type: 'image/png' });

            // Mobile: hand the image straight to WhatsApp via the share sheet
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Signed Waiver',
                        text: `Hello! Here is my signed waiver for ${name}.`
                    });
                    this.innerText = "SENT SUCCESSFULLY";
                    return;
                } catch (err) {
                    console.error("Share cancelled/failed:", err);
                    downloadBlob(blob, filename);      // fall back to saving it
                }
            } else {
                // Desktop: save the image, then open the chat to attach it
                downloadBlob(blob, filename);
                const waMsg = encodeURIComponent(
                    `Hello! I just signed the waiver (${name}). Attaching the screenshot now.`);
                window.open(`https://wa.me/351911861637?text=${waMsg}`, '_blank');
            }
        } catch (err) {
            restoreDom();
            console.error("Capture failed:", err);
            alert("Sorry \u2014 the image could not be created. Please try again.");
        } finally {
            if (this.innerText === "PROCESSING...") this.innerText = originalLabel;
            this.classList.remove('disabled');
        }
    };
});