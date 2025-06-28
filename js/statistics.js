// statistics.js
import { animateOnScroll } from './general.js';

// Define animation elements
const animationElements = [
    { selector: '.stat-card', containerSelector: 'section' },
    { selector: '.record-category', containerSelector: 'section' },
    { selector: '.scorer-card', containerSelector: 'section' },
    { selector: '.player-card', containerSelector: 'section' },
    { selector: '.stat-category', containerSelector: 'section' },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' },
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.toggles-container', containerSelector: null }
];

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

        // Reset animations for all relevant elements
        animationElements.forEach(({ selector }) => {
            document.querySelectorAll(selector).forEach(element => {
                element.classList.remove('animate-in');
            });
        });

        // Show appropriate sections
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

        // Show sections
        sectionsToShow.forEach(section => {
            if (section) {
                section.classList.remove('hidden');
            }
        });

        // Force reanimation for page-hero h1
        const pageHeroH1 = document.querySelector('.page-hero h1');
        if (pageHeroH1) {
            pageHeroH1.classList.remove('animate-in');
            setTimeout(() => {
                pageHeroH1.classList.add('animate-in');
            }, 100);
        }

        // Re-observe elements for animation
        animateOnScroll(animationElements);
    };

    // Add click event listeners to labels
    labels.team?.addEventListener('click', () => {
        if (toggles.teamPlayer.checked) {
            toggles.teamPlayer.checked = false;
            toggles.teamPlayer.dispatchEvent(new Event('change'));
        }
    });

    labels.player?.addEventListener('click', () => {
        if (!toggles.teamPlayer.checked) {
            toggles.teamPlayer.checked = true;
            toggles.teamPlayer.dispatchEvent(new Event('change'));
        }
    });

    labels.season?.addEventListener('click', () => {
        if (toggles.seasonAlltime.checked) {
            toggles.seasonAlltime.checked = false;
            toggles.seasonAlltime.dispatchEvent(new Event('change'));
        }
    });

    labels.alltime?.addEventListener('click', () => {
        if (!toggles.seasonAlltime.checked) {
            toggles.seasonAlltime.checked = true;
            toggles.seasonAlltime.dispatchEvent(new Event('change'));
        }
    });

    // Initial view setup
    updateView();
    toggles.teamPlayer?.addEventListener('change', updateView);
    toggles.seasonAlltime?.addEventListener('change', updateView);
}