// index.js
import { initializeCountdown, animateOnScroll, setupSmoothScrolling, setupPageLoadAnimation } from './general.js';

// Define animation elements
const animationElements = [
    { selector: '.hero', containerSelector: null },
    { selector: '.overview-card', containerSelector: 'section' },
    { selector: '.stat-card', containerSelector: 'section' },
    { selector: '.contact-card', containerSelector: 'section' },
    { selector: '.countdown-block', containerSelector: null },
    { selector: '.form-result', containerSelector: null },
    { selector: '.map-container', containerSelector: null },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' },
    { selector: '.upcoming-match-name', containerSelector: null }, // Added
    { selector: '.form-description', containerSelector: null } // Added
];

// Scroll-triggered animation system for index page
let hasStartedScrolling = false;

function isElementInViewport(el, threshold = 0.1) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return (
        rect.top <= windowHeight * (1 - threshold) &&
        rect.bottom >= windowHeight * threshold
    );
}

function animateIndexElements() {
    // Elements that should animate when scrolling starts
    const scrollElements = document.querySelectorAll(
        '.overview-card, .stat-card, .contact-card, .countdown-block, .form-result, .map-container, .section-title, .section-subtitle, .upcoming-match-name, .form-description'
    );

    scrollElements.forEach((element, index) => {
        if (isElementInViewport(element) && !element.classList.contains('animate-in')) {
            const section = element.closest('section');
            const sectionElements = section
                ? section.querySelectorAll(
                    '.overview-card, .stat-card, .contact-card, .countdown-block, .form-result, .map-container, .section-title, .section-subtitle, .upcoming-match-name, .form-description'
                )
                : [element];
            const elementIndex = Array.from(sectionElements).indexOf(element);

            setTimeout(() => {
                element.classList.add('animate-in');
            }, elementIndex * 100);
        }
    });
}

function handleIndexScroll() {
    if (window.scrollY > 50) {
        hasStartedScrolling = true;
    }

    if (hasStartedScrolling) {
        animateIndexElements();
    }
}

function setupIndexAnimations() {
    // Animate only hero on page load
    const immediateElements = document.querySelectorAll('.hero');
    immediateElements.forEach((element) => {
        setTimeout(() => {
            element.classList.add('animate-in');
        }, 300);
    });

    // Throttled scroll handler
    let isThrottled = false;
    window.addEventListener('scroll', () => {
        if (!isThrottled) {
            handleIndexScroll();
            isThrottled = true;
            setTimeout(() => {
                isThrottled = false;
            }, 100);
        }
    });

    // Check on page load for elements already in viewport
    setTimeout(() => {
        if (hasStartedScrolling) {
            animateIndexElements();
        }
    }, 500);
}

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    setupSmoothScrolling();
    setupPageLoadAnimation();
    setupIndexAnimations();
});