document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       1. AUTO-FILL EVENT NAME
    ========================================= */

    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get("event") || "Private Run";

    const eventInput = document.getElementById("event-name");
    eventInput.value = eventName;


    /* =========================================
       2. GUEST COUNTER
    ========================================= */

    let guests = 0;

    const guestDisplay = document.getElementById("guest-count");
    const plusBtn = document.getElementById("guest-plus");
    const minusBtn = document.getElementById("guest-minus");

    plusBtn.addEventListener("click", () => {

        guests++;
        guestDisplay.textContent = guests;

    });

    minusBtn.addEventListener("click", () => {

        if (guests > 0) {
            guests--;
            guestDisplay.textContent = guests;
        }

    });


    /* =========================================
       3. RECEIPT UPLOAD + PREVIEW
    ========================================= */

    const fileInput = document.getElementById("receipt-upload");
    const previewContainer = document.getElementById("preview-container");
    const previewImg = document.getElementById("receipt-preview");
    const uploadLabelText = document.getElementById("upload-text");

    let receiptBase64 = null;

    fileInput.addEventListener("change", function(e) {

        const file = e.target.files[0];
        if (!file) return;
        uploadLabelText.textContent = `✔ ${file.name}`;
        const reader = new FileReader();
        reader.onload = function(event) {
            receiptBase64 = event.target.result;
            previewImg.src = receiptBase64;
            previewContainer.style.display = "block"; 
        };

        reader.readAsDataURL(file);

    });


    function getSelectedAgeGroup() {

        const selected = document.querySelector('input[name="age_group"]:checked');

        return selected ? selected.value : null;

    }


    /* =========================================
       5. PDF GENERATION + WHATSAPP
    ========================================= */

    const generateBtn = document.getElementById("generate-pdf");

    generateBtn.addEventListener("click", async function() {

        const container = document.getElementById("signup-container");

        const playerName = document.getElementById("player-name").value.trim();
        const ageGroup = getSelectedAgeGroup();

        /* ===== VALIDATION ===== */

        if (!playerName) {
            alert("Please enter your name.");
            return;
        }

        if (!ageGroup) {
            alert("Please select your age group.");
            return;
        }

        if (!fileInput.files.length) {
            alert("Please upload your payment receipt.");
            return;
        }

        /* ===== BUTTON LOCK ===== */

        generateBtn.innerText = "PROCESSING...";
        generateBtn.disabled = true;

        const opt = {
            margin: 0.5,
            filename: `${playerName.replace(/\s+/g, "_")}_registration.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                backgroundColor: "#1c1c1e",
                useCORS: true
            },
            jsPDF: {
                unit: "in",
                format: "letter",
                orientation: "portrait"
            }
        };

        try {

            /* ===== GENERATE PDF ===== */

            const pdfBlob = await html2pdf()
                .set(opt)
                .from(container)
                .output("blob");

            const file = new File(
                [pdfBlob],
                opt.filename,
                { type: "application/pdf" }
            );

            /* ===== MESSAGE ===== */

            const message =
`🏀 Locked In Run Registration

Event: ${eventName}

Name: ${playerName}
Age Group: ${ageGroup}
Guests: ${guests}

Receipt attached below.`;


            /* =========================================
            MOBILE SHARE (BEST UX)
            ========================================= */

            if (navigator.canShare && navigator.canShare({ files: [file] })) {

                await navigator.share({
                    files: [file],
                    title: "Locked In Run Registration",
                    text: message
                });

                generateBtn.innerText = "SENT SUCCESSFULLY";

            } else {

                /* =========================================
                DESKTOP FALLBACK
                ========================================= */

                html2pdf().set(opt).from(container).save();

                const waUrl =
`https://wa.me/351911861637?text=${encodeURIComponent(message)}`;

                window.open(waUrl, "_blank");

                generateBtn.innerText = "PDF DOWNLOADED";

                alert("PDF downloaded. Please send it via WhatsApp.");

            }

        } catch (error) {

            console.error("PDF error:", error);

            generateBtn.innerText = "ERROR - TRY AGAIN";

        }

        generateBtn.disabled = false;

    });

});