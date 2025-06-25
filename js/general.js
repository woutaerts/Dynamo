// general.js

// Countdown timer initialization
export function initializeCountdown(targetDateString = "2025-06-30T15:00:00") {
    const targetDate = new Date(targetDateString).getTime();
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

        const elements = { days, hours, minutes, seconds };
        Object.keys(elements).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.textContent = elements[key];
        });
    }, 1000);
}

// Scroll-based animation for player cards (restored from original players.js)
export function animatePlayerCards() {
    // Function to check if an element is in the viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Animate elements already in the viewport with minimal delay
    const initialItems = document.querySelectorAll('.player-card:not(.animate-in)');
    const container = document.querySelector('.players-grid') || document;
    const itemsInContainer = container.querySelectorAll('.player-card');
    initialItems.forEach(item => {
        if (isElementInViewport(item)) {
            const itemIndex = Array.from(itemsInContainer).indexOf(item);
            item.style.setProperty('--animation-delay', Math.min(itemIndex * 0.2, 2)); // Cap delay at 200ms
            item.classList.add('animate-in');
        }
    });

    // IntersectionObserver for elements entering the viewport during scrolling
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target.closest('.players-grid') || document;
                const itemsInContainer = container.querySelectorAll('.player-card');
                const itemIndex = Array.from(itemsInContainer).indexOf(entry.target);
                entry.target.style.setProperty('--animation-delay', itemIndex);
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.player-card:not(.animate-in)').forEach(item => observer.observe(item));

    // Re-run initial animation check after hash navigation
    window.addEventListener('hashchange', () => {
        const items = document.querySelectorAll('.player-card:not(.animate-in)');
        const container = document.querySelector('.players-grid') || document;
        const itemsInContainer = container.querySelectorAll('.player-card');
        items.forEach(item => {
            if (isElementInViewport(item)) {
                const itemIndex = Array.from(itemsInContainer).indexOf(item);
                item.style.setProperty('--animation-delay', Math.min(itemIndex * 0.2, 2));
                item.classList.add('animate-in');
            }
        });
    }, { once: true }); // Run once to avoid multiple listeners
}

// Scroll-based animation for other elements
export function animateOnScroll(elements = [], observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 }) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const elementType = elements.find(el => entry.target.matches(el.selector));
                if (elementType) {
                    const container = getContainer(entry.target, elementType.containerSelector);
                    const itemsInContainer = container.querySelectorAll(elementType.selector);
                    const itemIndex = Array.from(itemsInContainer).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, itemIndex * 100);
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    elements.forEach(el => {
        document.querySelectorAll(el.selector).forEach(item => observer.observe(item));
    });

    function getContainer(target, containerSelector) {
        if (!containerSelector) return document;
        if (Array.isArray(containerSelector)) {
            for (const selector of containerSelector) {
                const container = target.closest(selector);
                if (container) return container;
            }
        }
        return target.closest(containerSelector);
    }
}

// Smooth scrolling for anchor links
export function setupSmoothScrolling() {
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
export function setupPageLoadAnimation() {
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    });
}