document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const menuOpen = document.getElementById('menu-open');
    const menuClose = document.getElementById('menu-close');
    const sideMenu = document.getElementById('side-menu');

    // 1. Smooth Scroll Header Logic
    // Passive, and touches the header only when it crosses the line, so
    // scrolling never waits on it.
    let headerScrolled = null;
    const syncHeader = () => {
        const now = window.scrollY > 20;
        if (now !== headerScrolled) {
            headerScrolled = now;
            header.classList.toggle('scrolled', now);
        }
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();

    // 2. Elite Menu Toggle Logic (With Scroll Lock)
    const toggleMenu = () => {
        // Toggle the class and check if it is now open
        const isOpen = sideMenu.classList.toggle('open');
        
        // Lock or unlock background scrolling
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    menuOpen.addEventListener('click', toggleMenu);
    menuClose.addEventListener('click', toggleMenu);

    // 3. Close menu and restore scrolling if ANY link in the menu is clicked
    document.querySelectorAll('#side-menu a').forEach(link => {
        link.addEventListener('click', () => {
            sideMenu.classList.remove('open');
            document.body.style.overflow = ''; // CRITICAL: Unlock scroll when navigating
        });
    });

    // 4. Highlight the current page in the menu
    // A product's page (/store/<slug>/) belongs to the shop.
    const path = window.location.pathname.startsWith('/store/') ? 'merch.html'
        : window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#side-menu .nav-link[data-page]').forEach(link => {
        if (link.getAttribute('data-page') === path) {
            link.classList.add('active');
        }
    });

    // 5. The store and home icons answer a tap: the bag hops, the house
    //    bounces, and a gold ring opens around it, then the page changes.
    //    The browser runs both (Web Animations, transform and opacity only);
    //    the next page waits just long enough for it to be seen. On the home
    //    page the splash may already be taking them to the store: then this
    //    only animates. Nothing moves for reduced motion.
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NAV_DELAY = 180;   // ms
    const HOP = [
        { transform: 'scale(1) rotate(0)' },
        { transform: 'scale(0.8) rotate(-10deg)', offset: 0.25 },
        { transform: 'scale(1.2) rotate(7deg)', offset: 0.6 },
        { transform: 'scale(1) rotate(0)' }
    ];
    const BOUNCE = [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(2px) scale(1.14, 0.82)', offset: 0.22 },
        { transform: 'translateY(-7px) scale(0.92, 1.1)', offset: 0.55 },
        { transform: 'translateY(0) scale(1)' }
    ];
    const ring = (link) => {
        const style = getComputedStyle(link);
        const pill = parseFloat(style.borderTopLeftRadius) > 0;   // the home page's "Store" pill
        const size = Math.max(link.offsetWidth, link.offsetHeight) + 10;
        const r = document.createElement('span');
        r.setAttribute('aria-hidden', 'true');
        Object.assign(r.style, {
            position: 'absolute',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            border: '1.5px solid #FFD700',
            borderRadius: pill ? '99px' : '50%'
        }, pill ? { inset: '-1px' } : {
            width: size + 'px',
            height: size + 'px',
            left: '50%',
            top: '50%',
            margin: (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px'
        });
        if (style.position === 'static') link.style.position = 'relative';
        link.appendChild(r);
        r.animate(
            [{ transform: 'scale(0.6)', opacity: 0.9 }, { transform: pill ? 'scale(1.25)' : 'scale(1.6)', opacity: 0 }],
            { duration: 520, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
        ).onfinish = () => r.remove();
    };
    document.querySelectorAll('#main-header .store-link').forEach(link => {
        const icon = link.querySelector('img');
        if (!icon || !icon.animate || reducedMotion) return;
        const moves = /home\.svg/.test(icon.getAttribute('src') || '') ? BOUNCE : HOP;
        link.style.webkitTapHighlightColor = 'transparent';   // the ring is the feedback
        link.addEventListener('click', (e) => {
            // Anything but a plain click (new tab, new window) is the browser's.
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            icon.animate(moves, { duration: 460, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' });
            ring(link);
            if (e.defaultPrevented) return;   // the splash is taking them there
            e.preventDefault();
            const href = link.href;
            setTimeout(() => { window.location.href = href; }, NAV_DELAY);
        });
    });
});