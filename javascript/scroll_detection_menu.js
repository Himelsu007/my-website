document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const menuOpen = document.getElementById('menu-open');
    const menuClose = document.getElementById('menu-close');
    const sideMenu = document.getElementById('side-menu');

    // 1. Smooth Scroll Header Logic
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
    });

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
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#side-menu .nav-link[data-page]').forEach(link => {
        if (link.getAttribute('data-page') === path) {
            link.classList.add('active');
        }
    });
});