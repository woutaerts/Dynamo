document.addEventListener('DOMContentLoaded', () => {
    // Animate match cards
    const cards = document.querySelectorAll('.match-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Initialize countdown clock
    initializeCountdown();

    // Wait for modal to be initialized before setting up match interactions
    setTimeout(() => {
        setupMatchInteractions();
    }, 500);
});

function initializeCountdown() {
    const targetDate = new Date("2025-06-12T15:00:00").getTime();
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