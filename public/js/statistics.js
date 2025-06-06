// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// Observe visibility of stats section
const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            entry.target.classList.add('counting');
        }
    });
}, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.stats-section').forEach(section => {
    statsObserver.observe(section);
});
