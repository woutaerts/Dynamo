// statistics.js
import { animateOnScroll } from './general.js';

// DOM initialization
document.addEventListener('DOMContentLoaded', () => {
    initToggle();
    animateOnScroll(animationElements);
});

// Toggle system for team/player and season/all-time views
function initToggle() {
    const toggles = {
        teamPlayer: document.getElementById('team-player-toggle'),
        seasonAlltime: document.getElementById('season-alltime-toggle')
    };

    const labels = {
        team: document.getElementById('label-team'),
        player: document.getElementById('label-player'),
        season: document.getElementById('label-season'),
        alltime: document.getElementById('label-alltime')
    };

    const sections = {
        teamSeason: document.getElementById('team-season-stats'),
        teamSeasonDetailed: document.getElementById('team-season-detailed'),
        teamAlltime: document.getElementById('team-alltime-stats'),
        playerSeason: document.getElementById('player-season-stats'),
        playerAlltime: document.getElementById('player-alltime-stats')
    };

    const updateView = () => {
        const isPlayer = toggles.teamPlayer?.checked;
        const isAlltime = toggles.seasonAlltime?.checked;

        // Update label states
        labels.team?.classList.toggle('active', !isPlayer);
        labels.player?.classList.toggle('active', isPlayer);
        labels.season?.classList.toggle('active', !isAlltime);
        labels.alltime?.classList.toggle('active', isAlltime);

        // Hide all sections
        Object.values(sections).forEach(section => section?.classList.add('hidden'));

        // Remove theme classes
        document.body.classList.remove('team-alltime', 'player-season', 'player-alltime');

        // Show appropriate sections and trigger animations
        let sectionsToShow;
        if (!isPlayer && !isAlltime) {
            sectionsToShow = [sections.teamSeason, sections.teamSeasonDetailed];
            document.body.classList.add('team-season');
        } else if (!isPlayer && isAlltime) {
            sectionsToShow = [sections.teamAlltime];
            document.body.classList.add('team-alltime');
        } else if (isPlayer && !isAlltime) {
            sectionsToShow = [sections.playerSeason];
            document.body.classList.add('player-season');
        } else {
            sectionsToShow = [sections.playerAlltime];
            document.body.classList.add('player-alltime');
        }

        // Show sections and animate
        sectionsToShow.forEach(section => {
            if (section) {
                section.classList.remove('hidden');
                // Reset and re-observe elements in the section
                const elements = section.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');
                elements.forEach(element => {
                    element.classList.remove('animate-in'); // Reset animation
                    animateOnScroll(animationElements); // Re-observe elements
                });
            }
        });
    };

    // Initial view setup
    updateView();
    toggles.teamPlayer?.addEventListener('change', updateView);
    toggles.seasonAlltime?.addEventListener('change', updateView);
}

// Define animation elements
const animationElements = [
    { selector: '.stat-card', containerSelector: 'section' },
    { selector: '.record-category', containerSelector: 'section' },
    { selector: '.scorer-card', containerSelector: 'section' },
    { selector: '.player-card', containerSelector: 'section' },
    { selector: '.stat-category', containerSelector: 'section' }
];