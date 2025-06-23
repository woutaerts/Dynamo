// Matches page initialization and functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    animateOnScroll();
    setupMatchInteractions();
    scrollTimelineToEnd();
});

// Animation system
function animateOnScroll() {
    const elements = [
        { selector: '.match-card', containerSelector: 'section' },
        { selector: '.timeline-item', containerSelector: ['section', '.container'] },
        { selector: '.countdown-block', containerSelector: null },
        { selector: '.form-result', containerSelector: null }
    ];

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const elementType = elements.find(el => entry.target.matches(el.selector));
                if (elementType) {
                    const container = getContainer(entry.target, elementType.containerSelector);
                    const itemsInContainer = container.querySelectorAll(elementType.selector);
                    const itemIndex = Array.from(itemsInContainer).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, itemIndex * 100);
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    elements.forEach(el => {
        document.querySelectorAll(el.selector).forEach(item => observer.observe(item));
    });

    function getContainer(target, containerSelector) {
        if (!containerSelector) return document;
        if (Array.isArray(containerSelector)) {
            for (const selector of containerSelector) {
                const container = target.closest(selector);
                if (container) return container;
            }
        }
        return target.closest(containerSelector);
    }
}

// Countdown timer
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

        const elements = { days, hours, minutes, seconds };
        Object.keys(elements).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.textContent = elements[key];
        });
    }, 1000);
}

// Match interactions
function setupMatchInteractions() {
    // Result and upcoming match cards
    document.querySelectorAll('.match-card.modern').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const matchData = {
                title: card.getAttribute('data-match-title') || 'Match Details',
                stadium: card.getAttribute('data-venue') || 'Home Stadium',
                ...getMatchData(card)
            };
            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('MatchModal not initialized');
            }
        });

        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    // Timeline items
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            // Map timeline items to recent results from matches.html
            const timelineMatches = [
                {
                    title: 'Dynamo Beirs vs Red Hawks FC',
                    dateTime: { date: '21 mei', time: '19:00' },
                    season: '2024-25',
                    stadium: 'KFC Lentezon',
                    score: '2-1',
                    goalscorers: [{ player: 'Lukaku', goals: 1 }, { player: 'De Bruyne', goals: 1 }]
                },
                {
                    title: 'Dynamo Beirs vs Greenfield United',
                    dateTime: { date: '18 mei', time: '19:00' },
                    season: '2024-25',
                    stadium: 'KFC Lentezon',
                    score: '3-0',
                    goalscorers: [{ player: 'Lukaku', goals: 2 }, { player: 'Hazard', goals: 1 }]
                },
                {
                    title: 'Bluewave FC vs Dynamo Beirs',
                    dateTime: { date: '14 mei', time: '19:00' },
                    season: '2024-25',
                    stadium: 'Bluewave Stadium',
                    score: '2-1',
                    goalscorers: [{ player: 'De Bruyne', goals: 1 }]
                },
                {
                    title: 'Dynamo Beirs vs Ironclad SC',
                    dateTime: { date: '10 mei', time: '19:00' },
                    season: '2024-25',
                    stadium: 'KFC Lentezon',
                    score: '2-0',
                    goalscorers: [{ player: 'Lukaku', goals: 1 }, { player: 'Hazard', goals: 1 }]
                },
                {
                    title: 'Werk Der Toekomst vs Dynamo Beirs',
                    dateTime: { date: '6 mei', time: '19:00' },
                    season: '2024-25',
                    stadium: 'Victory Arena',
                    score: '1-1',
                    goalscorers: [{ player: 'De Bruyne', goals: 1 }]
                },
                {
                    title: 'Dynamo Beirs vs Den Hout Athletic Club',
                    dateTime: { date: '2 mei', time: '19:00' },
                    season: '2024-25',
                    stadium: 'KFC Lentezon',
                    score: '3-2',
                    goalscorers: [{ player: 'Lukaku', goals: 2 }, { player: 'De Bruyne', goals: 1 }]
                }
                // Add more matches for remaining timeline items (match7 to match14) if needed
            ];

            // Map timeline items to matches (reverse order to match timeline)
            const matchIndex = timelineMatches.length - 1 - index; // Reverse to align with timeline
            const matchData = matchIndex >= 0 && matchIndex < timelineMatches.length
                ? timelineMatches[matchIndex]
                : {
                    title: `Match ${item.dataset.match}`,
                    dateTime: { date: item.querySelector('small')?.textContent || 'TBD', time: 'TBD' },
                    season: '2024-25',
                    stadium: 'Unknown Stadium',
                    score: null,
                    goalscorers: []
                };

            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('MatchModal not initialized');
            }
        });
    });
}

// Extract match data from card attributes
function getMatchData(card) {
    const matchDate = card.getAttribute('data-match-date') || 'TBD';
    const matchTime = card.getAttribute('data-match-time') || 'TBD';
    const season = card.getAttribute('data-match-season') || '2024-25';
    const score = card.getAttribute('data-score') || null;

    let goalscorers = [];
    const goalscorersData = card.getAttribute('data-goalscorers');
    if (goalscorersData) {
        try {
            goalscorers = JSON.parse(goalscorersData);
        } catch (error) {
            console.warn('Failed to parse goalscorers data:', error);
        }
    }

    return {
        dateTime: { date: matchDate, time: matchTime },
        season,
        score,
        goalscorers
    };
}

/* Timeline scroller */
function scrollTimelineToEnd() {
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    if (timelineWrapper) {
        timelineWrapper.scrollLeft = timelineWrapper.scrollWidth;
    }
}