/* Page Initialization */
document.addEventListener('DOMContentLoaded', () => {
    setupCtaHoverEffect();
});

/* CTA Hover Effect */
function setupCtaHoverEffect() {
    const ctaButton = document.querySelector('.error-cta');
    if (!ctaButton) return; // Guard clause in case button is missing

    // Cache the hover effect element once
    const hoverEffect = ctaButton.querySelector('.hover-effect');
    if (!hoverEffect) return;

    ctaButton.addEventListener('mouseenter', (e) => {
        const rect = ctaButton.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        // Use the cached variable
        hoverEffect.style.top = relY + 'px';
        hoverEffect.style.left = relX + 'px';
    });

    ctaButton.addEventListener('mouseleave', (e) => {
        const rect = ctaButton.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        // Use the cached variable
        hoverEffect.style.top = relY + 'px';
        hoverEffect.style.left = relX + 'px';
    });
}