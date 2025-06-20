document.addEventListener('DOMContentLoaded', async () => {
    // Initialize countdown clock
    initializeCountdown();
    // Setup staggered animations using the same system as index.js
    animateOnScroll();
    // Initialize modal and then setup interactions
    window.matchModal = new MatchModal();
    await window.matchModal.init();
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    if (timelineWrapper) {
        timelineWrapper.scrollTo({
            left: timelineWrapper.scrollWidth,
            behavior: 'smooth'
        });
    }
    setupMatchInteractions();
});

/* Animate elements on scroll */
function animateOnScroll() {
    const matchCards = document.querySelectorAll('.match-card');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const countdownBlocks = document.querySelectorAll('.countdown-block');
    const formResults = document.querySelectorAll('.form-result');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('match-card')) {
                    const section = entry.target.closest('section');
                    const cardsInSection = section.querySelectorAll('.match-card');
                    const cardIndex = Array.from(cardsInSection).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');
                    }, cardIndex * 200);
                }
                else if (entry.target.classList.contains('timeline-item')) {
                    const section = entry.target.closest('section') || entry.target.closest('.container');
                    const itemsInSection = section.querySelectorAll('.timeline-item');
                    const itemIndex = Array.from(itemsInSection).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');
                    }, itemIndex * 200); // Extra delay for timeline line animation
                }
                else if (entry.target.classList.contains('countdown-block')) {
                    const allCountdownBlocks = document.querySelectorAll('.countdown-block');
                    const blockIndex = Array.from(allCountdownBlocks).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, blockIndex * 150);
                }
                else if (entry.target.classList.contains('form-result')) {
                    const allFormResults = document.querySelectorAll('.form-result');
                    const resultIndex = Array.from(allFormResults).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, resultIndex * 100);
                }
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    matchCards.forEach(card => observer.observe(card));
    timelineItems.forEach(item => observer.observe(item));
    countdownBlocks.forEach(block => observer.observe(block));
    formResults.forEach(result => observer.observe(result));
}

/* Initialize countdown function */
function initializeCountdown() {
    const targetDate = new Date("2025-06-30T15:00:00").getTime();
    const countdownElement = document.getElementById("countdown");
    if (!countdownElement) return;
    const countdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance < 0) {
            clearInterval(countdown);
            countdownElement.innerHTML = "<div style='text-align: center; font-size: 1.5rem; color: #B90A0A; font-weight: bold;'>Match Started!</div>";
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
    // Add click listeners to result match cards
    document.querySelectorAll('.match-card.result').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const matchTitle = card.getAttribute('data-match-title');
            const venue = card.getAttribute('data-venue');
            const lat = parseFloat(card.getAttribute('data-lat'));
            const lng = parseFloat(card.getAttribute('data-lng'));
            const matchData = getMatchData(card);
            if (window.matchModal) {
                window.matchModal.show({
                    title: matchTitle,
                    stadium: venue,
                    lat,
                    lng,
                    ...matchData
                });
            }
        });
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    // Add click listeners to upcoming fixture cards (no score data)
    document.querySelectorAll('.match-card.modern:not(.result)').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const matchTitle = card.getAttribute('data-match-title');
            const venue = card.getAttribute('data-venue');
            const lat = parseFloat(card.getAttribute('data-lat'));
            const lng = parseFloat(card.getAttribute('data-lng'));
            const matchData = getMatchData(card);
            if (window.matchModal) {
                window.matchModal.show({
                    title: matchTitle,
                    stadium: venue,
                    lat,
                    lng,
                    ...matchData
                });
            }
        });
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    // Add click listeners to timeline items
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            // Sample data for timeline items - you can customize this
            const timelineMatches = [
                {
                    title: 'Dynamo Beirs vs Red Hawks FC',
                    date: 'May 21, 2025',
                    time: '15:00',
                    score: '2-1',
                    goalscorers: [{ player: 'Lukaku' }, { player: 'De Bruyne' }]
                },
                {
                    title: 'Dynamo Beirs vs Greenfield United',
                    date: 'May 18, 2025',
                    time: '16:30',
                    score: '3-0',
                    goalscorers: [{ player: 'Lukaku', goals: 2 }, { player: 'Hazard' }]
                },
                {
                    title: 'Bluewave FC vs Dynamo Beirs',
                    date: 'May 14, 2025',
                    time: '19:00',
                    score: '2-1',
                    goalscorers: [{ player: 'De Bruyne' }]
                }
            ];
            const matchData = timelineMatches[index % timelineMatches.length];
            if (window.matchModal) {
                window.matchModal.show({
                    title: matchData.title,
                    stadium: 'Home Stadium',
                    lat: 50.9704,
                    lng: 5.7734,
                    dateTime: `${matchData.date}<br>${matchData.time}`,
                    season: "'24-'25",
                    score: matchData.score,
                    goalscorers: matchData.goalscorers
                });
            }
        });
    });
}

function getMatchData(card) {
    const matchDate = card.getAttribute('data-match-date') || 'TBD';
    const matchTime = card.getAttribute('data-match-time') || '';
    const season = card.getAttribute('data-match-season') || "'24-'25";
    const score = card.getAttribute('data-score') || null; // Extract score data
    const goalscorersData = card.getAttribute('data-goalscorers');
    let goalscorers = [];
    try {
        if (goalscorersData) {
            goalscorers = JSON.parse(goalscorersData);
        }
    } catch (error) {
        console.warn('Failed to parse goalscorers data:', error);
        goalscorers = [];
    }
    // Format date and time for centered display
    const dateTime = matchTime ? `${matchDate}<br>${matchTime}` : matchDate;
    return {
        dateTime,
        season,
        score, // Include score in returned data
        goalscorers
    };
}
