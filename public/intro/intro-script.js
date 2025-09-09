document.addEventListener('DOMContentLoaded', function() {
    // Typing Effect
    const dynamicText = document.getElementById('dynamicText');
    const cursor = document.getElementById('cursor');
    const words = ['Byte Hub!', 'Innovation', 'Excellence', 'Success'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentWord = words[wordIndex];
        const currentChar = currentWord.substring(0, charIndex);

        dynamicText.textContent = currentChar;

        if (!isDeleting && charIndex < currentWord.length) {
            // Typing
            charIndex++;
            setTimeout(typeEffect, 100);
        } else if (isDeleting && charIndex > 0) {
            // Deleting
            charIndex--;
            setTimeout(typeEffect, 50);
        } else {
            // Change word
            isDeleting = !isDeleting;
            if (!isDeleting) {
                wordIndex = (wordIndex + 1) % words.length;
            }
            setTimeout(typeEffect, 1000);
        }
    }

    // Cursor Blinking Effect
    function cursorBlink() {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        setTimeout(cursorBlink, 500);
    }

    typeEffect();
    cursorBlink();

    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body; // Get the body element

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        // Toggle no-scroll class on the body to prevent scrolling
        body.classList.toggle('no-scroll');
    });

    // Close mobile menu when a navigation link is clicked
    document.querySelectorAll('.nav-links ul li a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                // Remove no-scroll class when a link is clicked to re-enable scrolling
                body.classList.remove('no-scroll');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#profile' || targetId === '#home' || targetId === '#about' || targetId === '#courses') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Adjust scroll position for fixed header
                    const headerOffset = document.querySelector('header').offsetHeight;
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - headerOffset - 20; // Added extra padding

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            } else {
                // For other links like 'Login', allow default behavior or specific handling
                window.location.href = this.href;
            }
        });
    });


    // Active link highlighting
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let current = '';
        const headerHeight = document.querySelector('header').offsetHeight; // Get header height dynamically

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Adjust threshold for fixed header
            // Using window.innerHeight / 2 ensures the section is roughly in the middle of the viewport
            if (pageYOffset >= (sectionTop - headerHeight - 100)) { // Increased offset for better section recognition
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('nav ul li a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Automatically update the year in the footer
    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        // Regex to find and replace a 4-digit year, or just append if none exists
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }


    // Scroll reveal animation (assuming ScrollReveal.js is linked)
    // You'll need to make sure you have the ScrollReveal library imported in your HTML for this to work.
    if (typeof ScrollReveal !== 'undefined') {
        const scrollReveal = ScrollReveal({
            origin: 'bottom',
            distance: '50px',
            duration: 1000,
            reset: true
        });

        scrollReveal.reveal('.card, .about-card, .course-card', {
            interval: 200,
            easing: 'ease-in-out'
        });
    } else {
        console.warn('ScrollReveal.js not loaded. Scroll reveal animations will not work.');
    }
});