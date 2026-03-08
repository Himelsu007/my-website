
         // ============================================
        // LUXURY BASKETBALL IMAGES
        // ============================================
        const luxuryImages = [
            'https://images.unsplash.com/photo-1640528979293-e44c218b044d', // Dramatic nighttime court
            'https://images.unsplash.com/photo-1685296871172-71e99714be5b', // Minimalist hoop
            'https://images.unsplash.com/photo-1741940513798-4ce04b95ffda', // Sunlight gymnasium
            'https://images.unsplash.com/photo-1564842505181-8862a3b9b173', // Leather texture
            'https://images.unsplash.com/photo-1595066989325-465d1db69c99'  // Premium texture
        ];

        let currentImageIndex = 0;
        let scrollY = 0;

        // ============================================
        // CREATE IMAGE SLIDES
        // ============================================
        function createImageSlides() {
            const background = document.getElementById('heroBackground');
            
            luxuryImages.forEach((imageUrl, index) => {
                const slide = document.createElement('div');
                slide.className = 'hero-image-slide';
                slide.style.backgroundImage = `url(${imageUrl})`;
                
                // First image is active
                if (index === 0) {
                    slide.classList.add('active');
                }
                
                background.appendChild(slide);
            });
        }

        // ============================================
        // IMAGE ROTATION (Every 3 seconds)
        // ============================================
        function rotateImages() {
            const slides = document.querySelectorAll('.hero-image-slide');
            
            setInterval(() => {
                // Remove active from current
                slides[currentImageIndex].classList.remove('active');
                
                // Move to next image
                currentImageIndex = (currentImageIndex + 1) % luxuryImages.length;
                
                // Add active to new image
                slides[currentImageIndex].classList.add('active');
            }, 3000); // 3 seconds
        }

        // ============================================
        // ENTRANCE ANIMATION
        // ============================================
        function triggerEntranceAnimation() {
            setTimeout(() => {
                document.getElementById('heroContent').classList.add('visible');
            }, 300);
        }

        // ============================================
        // PARALLAX SCROLL EFFECT
        // ============================================
        function handleScroll() {
            scrollY = window.scrollY;
            const slides = document.querySelectorAll('.hero-image-slide');
            
            slides.forEach(slide => {
                // Subtle zoom effect on scroll
                const scale = 1 + (scrollY * 0.0002);
                slide.style.transform = `scale(${scale})`;
            });
        }

        // ============================================
        // INITIALIZE
        // ============================================
        document.addEventListener('DOMContentLoaded', () => {
            // Create image slides
            createImageSlides();
            
            // Start image rotation
            rotateImages();
            
            // Trigger entrance animation
            triggerEntranceAnimation();
            
            // Add scroll listener for parallax
            window.addEventListener('scroll', handleScroll);
        });

        // ============================================
        // EXPLAINING THE EFFECTS
        // ============================================
        console.log();