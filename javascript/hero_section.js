// ============================================
// CONFIG & STATE
// ============================================

/* Each photo comes in two sizes (assets/images/hero/). They show at 18-35%
   opacity under a vignette, so a phone never needs more than the 1200px copy.
   The 12-megapixel originals took seconds to decode on a phone, and every
   frame waited for them. HERO_SMALL must match the media queries on the
   preloads in index.html, or the first photo is fetched twice. */
const HERO_SMALL = window.matchMedia('(max-width: 768px)').matches;
const luxuryImages = [
    'assets/images/hero/IMG_3728',
    'assets/images/hero/castelbranco',
    'assets/images/hero/IMG_0487',
    'assets/images/hero/IMG_0630',
].map(base => `${base}-${HERO_SMALL ? 1200 : 1920}.avif`);


let currentImageIndex = 0;
let heroSlides = [];

// ============================================
// BACKGROUND SLIDESHOW & PARALLAX
// ============================================


function createImageSlides() {
    const background = document.getElementById('heroBackground');
    if (!background || background.children.length > 0) return; // Prevent double creation

    heroSlides = luxuryImages.map((imageUrl, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-image-slide';
        slide.style.backgroundSize = 'cover';
        slide.style.backgroundPosition = 'center';
        if (index === 0) {
            slide.style.backgroundImage = `url(${imageUrl})`;
            slide.classList.add('active');
            slide.dataset.ready = '1';
        }
        background.appendChild(slide);
        return slide;
    });
}

/* The other photos wait for the page to finish loading, so they never compete
   with the first one or the rest of the page. Each joins the rotation only
   once it is decoded, so a slide never fades in half drawn. */
function loadRemainingSlides() {
    luxuryImages.forEach((imageUrl, index) => {
        if (index === 0 || !heroSlides[index]) return;
        const img = new Image();
        img.src = imageUrl;
        const loaded = img.decode ? img.decode()
            : new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
        loaded.then(() => {
            heroSlides[index].style.backgroundImage = `url(${imageUrl})`;
            heroSlides[index].dataset.ready = '1';
        }, () => {});
    });
}


function rotateImages() {
    if (heroSlides.length === 0) return;

    setInterval(() => {
        // The next photo that has loaded; until one has, the first one stays.
        let next = currentImageIndex;
        for (let step = 1; step < heroSlides.length; step++) {
            const i = (currentImageIndex + step) % heroSlides.length;
            if (heroSlides[i].dataset.ready) { next = i; break; }
        }
        if (next === currentImageIndex) return;
        heroSlides[currentImageIndex].classList.remove('active');
        currentImageIndex = next;
        heroSlides[currentImageIndex].classList.add('active');
    }, 3000);
}

// Optimized Scroll: Only scales the currently active slide
/* The photo drifts closer as the page scrolls. Where the browser supports
   scroll-driven CSS animations (hero.css) it does this itself, off the main
   thread, and this handler stays out of the way. Elsewhere it runs at most
   once per frame, and stops once the hero is out of sight — it used to look
   up the slide and rewrite its transform on every scroll event. */
const HERO_SCROLL_CSS = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
let heroTicking = false;
function handleScroll() {
    if (HERO_SCROLL_CSS || heroTicking) return;
    heroTicking = true;
    requestAnimationFrame(() => {
        heroTicking = false;
        const scrollY = window.scrollY;
        if (scrollY > window.innerHeight * 1.2) return;
        const scale = 1 + (scrollY * 0.0001); // Slightly gentler zoom
        heroSlides.forEach(slide => {
            slide.style.transform = `scale(${scale})`;
        });
    });
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
        gamesElement.textContent = currentCount + "+";

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
// THE LABEL AND THE SCROLL CUE
// ============================================
const heroReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The small label above the headline decodes from one line to the next.
function startPhaseDecode() {
    const label = document.querySelector('.phase-text[data-phrases]');
    if (!label || heroReduced) return;
    const lines = label.dataset.phrases.split('|');
    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/';
    let line = 0;
    setInterval(() => {
        if (document.hidden || window.scrollY > window.innerHeight) return;
        line = (line + 1) % lines.length;
        const to = lines[line].toUpperCase();
        let t0 = 0;
        requestAnimationFrame(function step(t) {
            if (!t0) t0 = t;
            const shown = Math.floor((t - t0) / 700 * to.length);   // letters settled so far
            label.textContent = to.split('').map((ch, k) =>
                k < shown || ch === ' ' || ch === '-' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
            if (shown < to.length) requestAnimationFrame(step);
        });
    }, 4200);
}

// The scroll cue glides down to the next section.
function startScrollCue() {
    const cue = document.querySelector('.hero-scroll');
    const next = document.getElementById('upcoming_runs_container');
    if (!cue || !next) return;
    cue.addEventListener('click', (e) => {
        e.preventDefault();
        next.scrollIntoView({ behavior: heroReduced ? 'auto' : 'smooth', block: 'start' });
    });
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
    if (document.readyState === 'complete') loadRemainingSlides();
    else window.addEventListener('load', loadRemainingSlides, { once: true });
    triggerEntrance();
    startLocationSwapper();
    startPhaseDecode();
    startScrollCue();
    
    // Performance fix: Use passive listener for scrolling
    window.addEventListener('scroll', handleScroll, { passive: true });
});