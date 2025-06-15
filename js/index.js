// Initialize countdown function
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

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minutesEl) minutesEl.textContent = minutes;
        if (secondsEl) secondsEl.textContent = seconds;
    }, 1000);
}

function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("card-animate-in");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.map-container').forEach(el => {
        observer.observe(el);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize countdown
    initializeCountdown();
    animateOnScroll();

    // Select all animatable elements
    const cards = document.querySelectorAll('.overview-card, .stat-card, .contact-card');
    const countdownBlocks = document.querySelectorAll('.countdown-block');
    const formResults = document.querySelectorAll('.form-result');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Handle cards (existing logic)
                if (entry.target.classList.contains('overview-card') ||
                    entry.target.classList.contains('stat-card') ||
                    entry.target.classList.contains('contact-card')) {

                    const section = entry.target.closest('section');
                    const cardsInSection = section.querySelectorAll('.overview-card, .stat-card, .contact-card');
                    const cardIndex = Array.from(cardsInSection).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');
                    }, cardIndex * 200);
                }

                // Handle countdown blocks
                else if (entry.target.classList.contains('countdown-block')) {
                    const allCountdownBlocks = document.querySelectorAll('.countdown-block');
                    const blockIndex = Array.from(allCountdownBlocks).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, blockIndex * 150);
                }

                // Handle form results
                else if (entry.target.classList.contains('form-result')) {
                    const allFormResults = document.querySelectorAll('.form-result');
                    const resultIndex = Array.from(allFormResults).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, resultIndex * 100);
                }

                obs.unobserve(entry.target); // Stop observing after animation is triggered
            }
        });
    }, observerOptions);

    // Observe all elements
    cards.forEach(card => observer.observe(card));
    countdownBlocks.forEach(block => observer.observe(block));
    formResults.forEach(result => observer.observe(result));
});

// Smooth scrolling for internal hero navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Home page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});