// ============================================
// CONFIG & STATE
// ============================================

const luxuryImages = [            
    '../assets/images/nba-elite-tank-top-bg-05.avif', 
    '../assets/images/IMG_0921.avif', 
    '../assets/images/IMG_0916.avif', 
    '../assets/images/IMG_0904.avif', 
    '../assets/images/merch-animated-video-bg.gif',

];


let currentImageIndex = 0;
let isAnimating = false;

// ============================================
// BACKGROUND SLIDESHOW & PARALLAX
// ============================================
function createImageSlides() {
    const background = document.getElementById('heroBackground');
    if (!background || background.children.length > 0) return; // Prevent double creation

    luxuryImages.forEach((imageUrl, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-image-slide';
        slide.style.backgroundImage = `url(${imageUrl})`;
        slide.style.backgroundSize = 'cover';
        slide.style.backgroundPosition = 'center';
        if (index === 0) slide.classList.add('active');
        background.appendChild(slide);
    });
}


function rotateImages() {
    const slides = document.querySelectorAll('.hero-image-slide');
    if (slides.length === 0) return;

    setInterval(() => {
        slides[currentImageIndex].classList.remove('active');
        currentImageIndex = (currentImageIndex + 1) % luxuryImages.length;
        slides[currentImageIndex].classList.add('active');
    }, 3000);
}

// Optimized Scroll: Only scales the currently active slide
function handleScroll() {
    const scrollY = window.scrollY;
    const activeSlide = document.querySelector('.hero-image-slide.active');
    
    if (activeSlide) {
        const scale = 1 + (scrollY * 0.0001); // Slightly gentler zoom
        activeSlide.style.transform = `scale(${scale})`;
    }
}

// ============================================
// STATS & LOCATION LOGIC
// ============================================
function startStatsAnimation() {
    const gamesElement = document.getElementById('count-games');
    if (!gamesElement) return;

    const target = 300;
    const duration = 2000; 
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentCount = Math.floor(progress * target);
        gamesElement.innerHTML = currentCount + "+";

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            gamesElement.classList.add('limit-reached');
        }
    };
    window.requestAnimationFrame(step);
}

function startLocationSwapper() {
    const locationElement = document.getElementById('events-text');
    if (!locationElement) return;

    const locations = ["3v3 Tournaments", "King of the Court", "5v5 Tournaments", "Indoor Pick Up Games", "Training Camps"];
    let index = 0;

    setInterval(() => {
        locationElement.classList.add('fade-out');
        setTimeout(() => {
            index = (index + 1) % locations.length;
            locationElement.textContent = locations[index];
            locationElement.classList.remove('fade-out');
        }, 400); 
    }, 2500); // Increased time slightly for readability
}

// ============================================
// ENTRANCE & INITIALIZATION
// ============================================
function triggerEntrance() {
    const heroContent = document.getElementById('heroContent');
    if (!heroContent) return;

    setTimeout(() => {
        heroContent.classList.add('visible');
        setTimeout(() => {
            startStatsAnimation();
        }, 800); 
    }, 300);
}

// SINGLE INITIALIZATION BLOCK
document.addEventListener('DOMContentLoaded', () => {
    createImageSlides();
    rotateImages();
    triggerEntrance();
    startLocationSwapper();
    
    // Performance fix: Use passive listener for scrolling
    window.addEventListener('scroll', handleScroll, { passive: true });
});