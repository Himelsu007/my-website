document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector(".carousel_track");
    const viewport = document.querySelector(".carousel_viewport");
    const items = document.querySelectorAll(".home_page_product_boxes");
    
    // Config
    const gap = 20;
    let index = 0;
    let isDragging = false;
    let startX = 0;

    const getStepWidth = () => items[0].offsetWidth + gap;

    function updateCarousel() {
        const step = getStepWidth();
        track.style.transform = `translateX(-${index * step}px)`;
    }

    // Logic for Buttons
    window.goNext = () => {
        index = (index + 1) % items.length;
        updateCarousel();
    };

    window.goPrev = () => {
        index = (index - 1 + items.length) % items.length;
        updateCarousel();
    };

    // Touch Events
    viewport.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        isDragging = false; 
    });

    viewport.addEventListener("touchmove", () => {
        isDragging = true; // User is swiping, not clicking
    });

    viewport.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0].clientX;
        const distance = startX - endX;
        const threshold = 50;

        if (Math.abs(distance) > threshold) {
            if (distance > 0) goNext();
            else goPrev();
        }
    });

    // Prevent navigation if the user was just swiping
    items.forEach(item => {
        item.addEventListener("click", (e) => {
            if (isDragging) e.preventDefault();
        });
    });

    // Handle Window Resize (Debounced for performance)
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateCarousel, 100);
    });
});