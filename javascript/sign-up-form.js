document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto-fill Event Name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get('event') || "Private Run"; // Fallback text
    document.getElementById('event-name').value = decodeURIComponent(eventName);

    // 2. Guest Counter Logic
    let guests = 0;
    const guestDisplay = document.getElementById('guest-count');
    
    document.getElementById('guest-plus').onclick = () => {
        guests++;
        guestDisplay.textContent = guests;
    };
    
    document.getElementById('guest-minus').onclick = () => {
        if(guests > 0) {
            guests--;
            guestDisplay.textContent = guests;
        }
    };

    // 3. Receipt Upload Logic
    const fileInput = document.getElementById('receipt-upload');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('receipt-preview');
    const uploadLabelText = document.getElementById('upload-text');

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadLabelText.textContent = `✔ ${file.name} Selected`;
            
            // Convert to base64 so html2pdf can read it properly
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImg.src = event.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // 4. Generate PDF & Share via WhatsApp
    document.getElementById('generate-pdf').onclick = async function() {
        const element = document.getElementById('signup-container');
        const name = document.getElementById('player-name').value.trim();
        const age = document.getElementById('player-age').value.trim();
        
        // Validation Checks
        if(!name || !age) return alert("Please fill in your name and age!");
        if(!fileInput.files.length) return alert("Please upload a screenshot of your payment receipt!");

        // Visual Feedback
        this.innerText = "PROCESSING...";
        this.classList.add('disabled');

        const opt = {
            margin: 0.5,
            filename: `${name.replace(/\s+/g, '_')}_Registration.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#1c1c1e', useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        try {
            // Generate PDF Blob
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
            const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

            const shareMessage = `Hey! I'm registering for ${eventName}.\nName: ${name}\nAge: ${age}\nGuests: ${guests}\nReceipt is attached below!`;

            // Mobile Web Share API
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Run Registration',
                    text: shareMessage
                });
                this.innerText = "SENT SUCCESSFULLY";
            } else {
                // Desktop Fallback
                html2pdf().set(opt).from(element).save();
                
                alert("Desktop detected. PDF downloaded! Please send it to WhatsApp.");
                
                const waUrl = `https://wa.me/351911861637?text=${encodeURIComponent(shareMessage)}`;
                window.open(waUrl, '_blank');
                this.innerText = "FINALIZE & SEND";
            }
        } catch(err) {
            console.error("PDF Generation/Share failed:", err);
            this.innerText = "ERROR - TRY AGAIN";
        }
        
        this.classList.remove('disabled');
    };
});