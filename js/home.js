// Vanta.js Fog Background
let vantaEffect;

// Initialize Vanta.js fog effect
function initVanta() {
    if (window.VANTA && window.THREE) {
        vantaEffect = VANTA.FOG({
            el: "#home",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0xe6f7ff,
            midtoneColor: 0xb3e0ff,
            lowlightColor: 0x66b3ff,
            baseColor: 0xe6f7ff,
            blurFactor: 0.4,
            speed: 1.5,
            zoom: 2
        });
    }
}

// Clean up Vanta effect on page unload
function destroyVanta() {
    if (vantaEffect) {
        vantaEffect.destroy();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Vanta fog effect
    initVanta();

    // Simple entrance animation delay for cards
    const cards = document.querySelectorAll('.overview-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
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

// Clean up on page unload
window.addEventListener('beforeunload', destroyVanta);