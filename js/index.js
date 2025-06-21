// Countdown initialization
function initializeCountdown() {
    const targetDate = new Date("2025-06-30T15:00:00").getTime();
    const countdownElement = document.getElementById("countdown");
    if (!countdownElement) return;

    const countdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdown);
            countdownElement.innerHTML = "<div style='text-align: center; font-size: 1.5rem; color: #B90A0A; font-weight: bold;'>Match Started!</div>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const elements = {
            days: document.getElementById("days"),
            hours: document.getElementById("hours"),
            minutes: document.getElementById("minutes"),
            seconds: document.getElementById("seconds")
        };

        Object.entries(elements).forEach(([key, el]) => {
            if (el) el.textContent = eval(key);
        });
    }, 1000);
}

// Unified intersection observer for all animations
function setupAnimations() {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const target = entry.target;

            if (target.classList.contains('overview-card') || target.classList.contains('stat-card') || target.classList.contains('contact-card')) {
                const section = target.closest('section');
                const cardsInSection = section.querySelectorAll('.overview-card, .stat-card, .contact-card');
                const cardIndex = Array.from(cardsInSection).indexOf(target);
                setTimeout(() => target.classList.add('card-animate-in'), cardIndex * 200);
            }
            else if (target.classList.contains('countdown-block')) {
                const allCountdownBlocks = document.querySelectorAll('.countdown-block');
                const blockIndex = Array.from(allCountdownBlocks).indexOf(target);
                setTimeout(() => target.classList.add('animate-in'), blockIndex * 150);
            }
            else if (target.classList.contains('form-result')) {
                const allFormResults = document.querySelectorAll('.form-result');
                const resultIndex = Array.from(allFormResults).indexOf(target);
                setTimeout(() => target.classList.add('animate-in'), resultIndex * 100);
            }
            else if (target.classList.contains('map-container')) {
                target.classList.add('card-animate-in');
            }

            obs.unobserve(target);
        });
    }, observerOptions);

    document.querySelectorAll('.overview-card, .stat-card, .contact-card, .countdown-block, .form-result, .map-container')
        .forEach(el => observer.observe(el));
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Page load fade-in effect
function setupPageLoadAnimation() {
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    });
}

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    setupAnimations();
    setupSmoothScrolling();
    setupPageLoadAnimation();
});