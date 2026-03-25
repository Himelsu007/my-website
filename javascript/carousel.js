document.addEventListener("DOMContentLoaded", function () {
    const viewport = document.querySelector(".carousel_viewport");
    const indicator = document.querySelector(".carousel_progress_indicator");
    if (!viewport || !indicator) return;

    // 1. UPDATE THE PROGRESS BAR
    function updateProgressBar() {
        const scrollLeft = viewport.scrollLeft;
        const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
        
        let scrollPercentage = (scrollLeft / maxScrollLeft) * 100;
        if (maxScrollLeft === 0) scrollPercentage = 100; 

        // Clamp values between 0 and 100 just in case of over-scrolling bounce on Macs
        scrollPercentage = Math.max(0, Math.min(scrollPercentage, 100));

        indicator.style.width = `${scrollPercentage}%`;

        // Elite Polish: Turn the bar gold if they reach the end
        if (scrollPercentage >= 99) {
            indicator.style.backgroundColor = "#FFD700";
        } else {
            indicator.style.backgroundColor = "#ffffff";
        }
    }

    viewport.addEventListener("scroll", updateProgressBar, { passive: true });
    window.addEventListener("resize", updateProgressBar);
    updateProgressBar();

    // 2. LAPTOP ENHANCEMENT: MOUSE DRAGGING
    let isDown = false;
    let startX;
    let scrollLeft;

    viewport.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
        viewport.style.scrollSnapType = 'none'; 
    });

    viewport.addEventListener('mouseleave', () => {
        isDown = false;
        viewport.style.scrollSnapType = 'x mandatory';
    });

    viewport.addEventListener('mouseup', () => {
        isDown = false;
        viewport.style.scrollSnapType = 'x mandatory';
    });

    viewport.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX) * 1.5; 
        viewport.scrollLeft = scrollLeft - walk;
    });
});