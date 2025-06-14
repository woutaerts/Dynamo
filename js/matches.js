document.addEventListener('DOMContentLoaded', () => {
    // Initialize countdown clock
    initializeCountdown();

    // Setup staggered animations for all cards and elements
    setupStaggeredAnimations();

    // Wait for modal to be initialized before setting up match interactions
    setTimeout(() => {
        setupMatchInteractions();
    }, 500);
});

function setupStaggeredAnimations() {
    // Select all animatable elements including timeline containers
    const animatableElements = document.querySelectorAll('.match-card, .timeline-item, .countdown-block, .form-result');
    const timelineContainers = document.querySelectorAll('.timeline');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find all similar elements in the same section
                const section = entry.target.closest('section') || entry.target.closest('.container');

                // Define different selectors for different types of elements
                let sectionElements;
                if (entry.target.classList.contains('match-card')) {
                    sectionElements = section.querySelectorAll('.match-card');
                } else if (entry.target.classList.contains('timeline-item')) {
                    sectionElements = section.querySelectorAll('.timeline-item');

                    // Also animate the timeline line when first timeline item is visible
                    const timeline = section.querySelector('.timeline');
                    if (timeline && !timeline.classList.contains('animate-in')) {
                        // Animate timeline line first, then timeline items
                        timeline.classList.add('animate-in');
                    }
                } else if (entry.target.classList.contains('countdown-block')) {
                    sectionElements = section.querySelectorAll('.countdown-block');
                } else if (entry.target.classList.contains('form-result')) {
                    sectionElements = section.querySelectorAll('.form-result');
                } else {
                    // Fallback for any other elements
                    sectionElements = [entry.target];
                }

                // Convert NodeList to Array and find the index of current element
                const elementIndex = Array.from(sectionElements).indexOf(entry.target);

                // Apply staggered delay: 150ms between each element
                // Use shorter delay for timeline items and form results (they're smaller)
                // Add extra delay for timeline items to account for line animation
                let baseDelay = (entry.target.classList.contains('timeline-item') ||
                    entry.target.classList.contains('form-result') ||
                    entry.target.classList.contains('countdown-block')) ?
                    elementIndex * 100 : elementIndex * 150;

                // Add extra delay for timeline items to let the line animate first
                if (entry.target.classList.contains('timeline-item')) {
                    baseDelay += 200; // 200ms delay to let timeline line animate first
                }

                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, baseDelay);

                obs.unobserve(entry.target); // Stop observing after animation is triggered
            }
        });
    }, observerOptions);

    // Set initial state and observe all elements
    animatableElements.forEach(element => {
        // Set initial invisible state
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        // Observe for intersection
        observer.observe(element);
    });
}

function initializeCountdown() {
    const targetDate = new Date("2025-06-30T15:00:00").getTime();
    const countdownElement = document.getElementById("countdown");

    if (!countdownElement) return;

    const countdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdown);
            countdownElement.innerHTML = "Match Started";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minutesEl) minutesEl.textContent = minutes;
        if (secondsEl) secondsEl.textContent = seconds;
    }, 1000);
}

function setupMatchInteractions() {
    // Handle match card clicks to show modal with map
    document.querySelectorAll('.match-card.result').forEach(card => {
        card.addEventListener('click', () => {
            const matchTitle = card.getAttribute('data-match-title');
            const venue = card.getAttribute('data-venue');
            const lat = parseFloat(card.getAttribute('data-lat'));
            const lng = parseFloat(card.getAttribute('data-lng'));

            // Get match-specific data
            const matchData = getMatchData(card);

            // Show modal with match data
            if (window.matchModal) {
                window.matchModal.show({
                    title: matchTitle,
                    venue: venue,
                    lat: lat,
                    lng: lng,
                    ...matchData
                });
            }
        });
    });

    // Handle timeline item clicks
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
            // Default to home stadium for timeline items
            const venue = 'Home Stadium';
            const lat = 50.9704;
            const lng = 5.7734;

            if (window.matchModal) {
                window.matchModal.show({
                    title: 'Match Center',
                    venue: venue,
                    lat: lat,
                    lng: lng
                });
            }
        });
    });
}

function getMatchData(card) {
    // Extract match-specific data from the card
    const matchBody = card.querySelector('.match-body');
    if (!matchBody) return {};

    const matchText = matchBody.textContent;
    const goalInfo = matchBody.querySelector('i.fas.fa-futbol');

    // Parse goals and events from the card
    let events = [];
    let playerStats = [];
    let keyStats = [
        'Possession: 55% - 45%',
        'Shots on Target: 7 - 3',
        'Fouls: 11 - 9'
    ];

    if (goalInfo && goalInfo.nextSibling) {
        const goalText = goalInfo.nextSibling.textContent.trim();
        if (goalText) {
            // Parse goal scorers and times
            const goals = goalText.split(', ');
            goals.forEach(goal => {
                const match = goal.match(/(\w+) \((\d+)'\)/);
                if (match) {
                    const [, player, minute] = match;
                    events.push(`${minute}' ⚽ ${player} scores`);

                    // Check if player already in stats
                    const existingIndex = playerStats.findIndex(stat => stat.includes(player));
                    if (existingIndex >= 0) {
                        // Update existing player stats
                        const currentStats = playerStats[existingIndex];
                        const goalCount = (currentStats.match(/(\d+) goal/) || [0, 0])[1];
                        playerStats[existingIndex] = `${player}: ${parseInt(goalCount) + 1} goal, 2 shots`;
                    } else {
                        // Add new player stats
                        playerStats.push(`${player}: 1 goal, 2 shots`);
                    }
                }
            });
        }
    }

    // Add some default events if none found
    if (events.length === 0) {
        events = [
            '23\' ⚽ Rodriguez scores',
            '40\' 🟨 Mitchell booked',
            '67\' ⚽ Mitchell scores'
        ];
    }

    if (playerStats.length === 0) {
        playerStats = [
            'Rodriguez: 1 goal, 2 shots',
            'Mitchell: 1 goal, 1 yellow card'
        ];
    }

    return {
        events,
        playerStats,
        keyStats
    };
}