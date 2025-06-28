// matches.js
import { initializeCountdown, animateOnScroll } from './general.js';

// Define animation elements
const animationElements = [
    { selector: '.match-card', containerSelector: 'section' },
    { selector: '.timeline', containerSelector: 'section' },
    { selector: '.timeline-item', containerSelector: ['section', '.container'] },
    { selector: '.countdown-block', containerSelector: null },
    { selector: '.form-result', containerSelector: null },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' },
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.upcoming-match-name', containerSelector: null }, // Added
    { selector: '.form-description', containerSelector: null } // Added
];

// Matches page initialization and functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    animateOnScroll(animationElements);
    setupMatchInteractions();
    scrollTimelineToEnd();
});

// Match interactions
function setupMatchInteractions() {
    // Handle upcoming match cards
    document.querySelectorAll('.match-card.modern:not(.result)').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const matchData = {
                title: card.getAttribute('data-match-title') || 'Match Details',
                stadium: card.getAttribute('data-venue') || 'Home Stadium',
                isUpcoming: true,
                ...getMatchData(card)
            };
            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('MatchModal not initialized');
            }
        });
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    // Handle past match cards (results)
    document.querySelectorAll('.match-card.modern.result').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const matchData = {
                title: card.getAttribute('data-match-title') || 'Match Details',
                stadium: card.getAttribute('data-venue') || 'Home Stadium',
                isUpcoming: false,
                ...getMatchData(card)
            };
            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('MatchModal not initialized');
            }
        });
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    // Timeline item interactions
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
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
            ];
            const matchIndex = timelineMatches.length - 1 - index;
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
