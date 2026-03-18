document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,        
        rootMargin: '0px',  
        threshold: 0.15     
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } 
        });
    }, observerOptions);

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((element) => {
        scrollObserver.observe(element);
    });
});