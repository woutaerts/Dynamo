// Animate match cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.match-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Hover effect on match cards
document.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = card.classList.contains('result') ? 'translateX(5px)' : 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateX(0) translateY(0)';
    });
});
