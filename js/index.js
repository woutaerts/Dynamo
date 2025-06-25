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
    { selector: '.section-subtitle', containerSelector: 'section' }
];

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    animateOnScroll(animationElements);
    setupSmoothScrolling();
    setupPageLoadAnimation();
});