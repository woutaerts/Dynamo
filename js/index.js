// index.js
import { initializeCountdown, animateOnScroll, setupSmoothScrolling, setupPageLoadAnimation } from './general.js';

// Define animation elements
const animationElements = [
    { selector: '.overview-card', containerSelector: 'section' },
    { selector: '.stat-card', containerSelector: 'section' },
    { selector: '.contact-card', containerSelector: 'section' },
    { selector: '.countdown-block', containerSelector: null },
    { selector: '.form-result', containerSelector: null },
    { selector: '.map-container', containerSelector: null }
];

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    animateOnScroll(animationElements);
    setupSmoothScrolling();
    setupPageLoadAnimation();
});