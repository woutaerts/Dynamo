/* js/utils/animations.js */

/* Module-level variables to persist across multiple calls */
let sharedObserver = null;
let observedSelectors = [];

/**
 * Scroll-Based Animations
 * Uses a singleton IntersectionObserver with a fixed site-wide configuration.
 */
export function animateOnScroll(elements = []) {
    const newElements = elements.filter(el =>
        !observedSelectors.some(existing => existing.selector === el.selector)
    );
    observedSelectors = [...observedSelectors, ...newElements];

    if (!sharedObserver) {
        const sharedOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        sharedObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const elementType = observedSelectors.find(el => entry.target.matches(el.selector));

                    if (elementType) {
                        const container = getContainer(entry.target, elementType.containerSelector);
                        const itemsInContainer = container.querySelectorAll(elementType.selector);
                        const itemIndex = Array.from(itemsInContainer).indexOf(entry.target);

                        setTimeout(() => {
                            entry.target.classList.add('animate-in');
                        }, itemIndex * 100);

                        sharedObserver.unobserve(entry.target);
                    }
                }
            });
        }, sharedOptions);
    }

    elements.forEach(el => {
        document.querySelectorAll(`${el.selector}:not(.animate-in)`).forEach(item => {
            sharedObserver.observe(item);
        });
    });
}

/**
 * Player Card Animations (Staggered)
 */
export function animatePlayerCards() {
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

    window.addEventListener('hashchange', () => {
        document.querySelectorAll('.player-card:not(.animate-in)').forEach(item => observer.observe(item));
    });
}

/**
 * Smooth Scrolling for Anchor Links
 */
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

/**
 * Private Helper (not exported)
 */
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