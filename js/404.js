/**
 * 404.js — Error page
 *
 * Changes:
 *   - `setupCtaHoverEffect` → removed entirely.
 *     The identical position-aware ripple logic now lives in
 *     `utils/animations.js` as `initRippleEffect`. This file is reduced
 *     to a single import + one-liner initialization.
 */
import { initRippleEffect } from './utils/animations.js';

document.addEventListener('DOMContentLoaded', () => {
    initRippleEffect('.error-cta');
});
