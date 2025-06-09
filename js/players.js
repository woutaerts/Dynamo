// Animate player cards on load
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.player-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Add hover effects
document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});
