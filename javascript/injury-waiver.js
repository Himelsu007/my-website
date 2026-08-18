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

    // 3. Generate & Download PDF
document.getElementById('generate-pdf').onclick = async function() {
    const element = document.querySelector('.auth-container');
    const name = document.getElementById('auth-name').value.trim();
    const originalLabel = this.innerText;

    if(!name) return alert("Please enter your name first!");

    // The PDF library is loaded from a CDN — if it's blocked or offline we must
    // say so rather than leaving the button stuck on "PROCESSING...".
    if (typeof html2pdf === 'undefined') {
        alert("The PDF tool couldn't load. Please check your connection and refresh the page.");
        return;
    }

    // 1. Visual Feedback (The "Processing" state)
    this.innerText = "PROCESSING...";
    this.classList.add('disabled');

    const opt = {
        margin: 0.5,
        filename: `Authorization_${name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#1c1c1e' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        // 2. Generate PDF as a "Blob" (raw data) instead of just saving
        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

        // 3. Create a File object from the Blob
        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

        // 4. Use the Web Share API (Mobile Magic)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Signed Authorization',
                    text: `Hello! Here is my signed authorization for ${name}.`
                });
                this.innerText = "SENT SUCCESSFULLY";
                return;                              // done — leave the success label
            } catch (err) {
                // User cancelled or share failed → fall back to a download
                console.error("Share failed:", err);
                await html2pdf().set(opt).from(element).save();
            }
        } else {
            // 5. Fallback for Desktop (computers can't "Share" to WhatsApp easily)
            alert("Downloading your PDF… please attach it to WhatsApp in the next step.");
            await html2pdf().set(opt).from(element).save();

            // Open WhatsApp with a pre-filled message after download
            const waMsg = encodeURIComponent(`Hello! I just downloaded my signed authorization for ${name}. I am attaching it now.`);
            window.open(`https://wa.me/351911861637?text=${waMsg}`, '_blank');
        }
    } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Sorry — the PDF could not be generated. Please try again.");
    } finally {
        // Always restore the button, whatever happened above
        if (this.innerText === "PROCESSING...") this.innerText = originalLabel;
        this.classList.remove('disabled');
    }
};
});