// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Counter animation for statistics
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

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('counting');
            if (entry.target.classList.contains('stats-section')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

// Observe sections for animations
document.querySelectorAll('.stats-section, .player-card, .match-card').forEach(el => {
    observer.observe(el);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Dynamic stat updates (simulate real-time updates)
function updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent);
        const shouldUpdate = Math.random() < 0.1; // 10% chance to update

        if (shouldUpdate && currentValue > 0) {
            const change = Math.random() < 0.7 ? 1 : -1; // 70% chance to increase
            const newValue = Math.max(0, currentValue + change);
            stat.setAttribute('data-target', newValue);

            // Animate the change
            stat.style.transform = 'scale(1.1)';
            stat.style.color = change > 0 ? '#28a745' : '#dc3545';

            setTimeout(() => {
                stat.textContent = newValue;
                stat.style.transform = 'scale(1)';
                stat.style.color = '#B90A0A';
            }, 200);
        }
    });
}

// Update stats every 30 seconds (commented out for demo)
// setInterval(updateStats, 30000);

// Add hover effects to cards
document.querySelectorAll('.stat-card, .player-card, .match-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = this.classList.contains('stat-card') ? 'translateY(-10px)' :
            this.classList.contains('player-card') ? 'translateY(-5px)' : 'translateX(5px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) translateX(0)';
    });
});

// Mobile menu toggle (for future implementation)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');

    if (navLinks && hamburger) {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Red Hawks FC Homepage loaded successfully!');

    // Add any initialization code here
    const cards = document.querySelectorAll('.stat-card, .player-card, .match-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Modern Header JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.modern-header');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    // Scroll effect for header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileToggle.addEventListener('click', function() {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');

            // Update active state
            navLinkItems.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!header.contains(e.target)) {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Smooth scroll for navigation links
    navLinkItems.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});