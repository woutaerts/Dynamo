// Imports and Initialization
import { animateOnScroll, setupSmoothScrolling } from './utils/animations.js';
import { initializeCountdown, updateCountdown } from './general.js';
import { fetchCurrentSeasonMatches, fetchTeamSeasonStats } from './utils/dataService.js';

// Animation Elements
const animationElements = [
    { selector: '.hero', containerSelector: null },
    { selector: '.carousel-container', containerSelector: null },
    { selector: '.stat-card', containerSelector: 'section' },
    { selector: '.contact-card', containerSelector: 'section' },
    { selector: '.countdown-block', containerSelector: null },
    { selector: '#home-match-sponsor', containerSelector: null },
    { selector: '.cta-section', containerSelector: null },
    { selector: '.form-result', containerSelector: null },
    { selector: '.map-container', containerSelector: null },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' },
    { selector: '.upcoming-match-name', containerSelector: null },
    { selector: '.form-description', containerSelector: null }
];

// Carousel Initialization
function initializeCarousel() {
    const carousel = document.getElementById('carousel');
    const container = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('dotsContainer');

    if (!carousel || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;
    let autoPlayInterval;

    // Clone first & last slides
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[totalSlides - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    carousel.appendChild(firstClone);
    carousel.insertBefore(lastClone, carousel.firstChild);

    // Start at the real first slide
    carousel.style.transform = `translateX(-${100}%)`;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function setTransition(active) {
        carousel.style.transition = active
            ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none';
    }

    function updatePosition() {
        carousel.style.transform = `translateX(-${(currentIndex + 1) * 100}%)`;
    }

    function updateDots() {
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function goToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        currentIndex = index;
        setTransition(true);
        updatePosition();
        updateDots();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // Handle transition end smoothly
    carousel.addEventListener('transitionend', () => {
        setTransition(false);
        if (currentIndex >= totalSlides) {
            currentIndex = 0;
            requestAnimationFrame(() => updatePosition());
        } else if (currentIndex < 0) {
            currentIndex = totalSlides - 1;
            requestAnimationFrame(() => updatePosition());
        }
        isTransitioning = false;
    });

    // Auto play
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), 4000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Event listeners
    nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
    prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });

    // Mobile Swipe & Dragging
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let animationID = 0;
    let startTime = 0;

    function touchStart(e) {
        if (e.target.closest('.nav-btn')) {
            return;
        }

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = true;
        startTime = e.timeStamp;
        prevTranslate = -((currentIndex + 1) * 100);
        carousel.style.transition = 'none';
        cancelAnimationFrame(animationID);
        clearInterval(autoPlayInterval);
    }

    function touchMove(e) {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - touchStartX;
        const diffY = currentY - touchStartY;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);
        if (absDiffX > absDiffY && absDiffX > 5) { // 5px threshold to avoid accidental blocks
            e.preventDefault();
            currentTranslate = prevTranslate + (diffX / carousel.offsetWidth) * 100;
            carousel.style.transform = `translateX(${currentTranslate}%)`;
        }
    }

    function touchEnd(e) {
        if (!isDragging) return;
        isDragging = false;

        const diffX = e.changedTouches[0].clientX - touchStartX;
        const elapsedTime = e.timeStamp - startTime; // ms
        const velocity = diffX / elapsedTime; // px/ms

        const swipeThreshold = Math.max(15, carousel.offsetWidth * 0.05); // smaller threshold for fast swipes
        let targetIndex = currentIndex;

        if (diffX < -swipeThreshold || velocity < -0.3) {
            targetIndex = currentIndex + 1;
        } else if (diffX > swipeThreshold || velocity > 0.3) {
            targetIndex = currentIndex - 1;
        }

        setTransition(true);
        goToSlide(targetIndex);
        resetAutoPlay();
    }

    // Attach to container for better touch handling
    container.addEventListener('touchstart', touchStart, { passive: true });
    container.addEventListener('touchmove', touchMove, { passive: false });
    container.addEventListener('touchend', touchEnd, { passive: true });
    container.addEventListener('touchcancel', touchEnd, { passive: true });


    // Keyboard
    document.addEventListener('keydown', e => {
        // 1. Guard: Don't trigger if the user is typing in an input (like search)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // 2. Guard: Only trigger if the carousel is the primary "active" component
        // or if the mouse is currently over it (using container as a reference)
        const isCarouselActive = document.activeElement.closest('.carousel-container') ||
            container.matches(':hover');

        if (!isCarouselActive) return;

        if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoPlay();
        }
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoPlay();
        }
    });

    // Pause on hover
    container.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    container.addEventListener('mouseleave', startAutoPlay);

    // Init
    updateDots();
    startAutoPlay();
}

function initializePrimaryButtonHover() {
    const primaryButtons = document.querySelectorAll('.btn-primary');

    primaryButtons.forEach(button => {
        const hoverSpan = document.createElement('span');
        hoverSpan.className = 'hover-effect';
        button.appendChild(hoverSpan);

        button.addEventListener('mouseenter', (e) => {
            const rect = button.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            hoverSpan.style.top = relY + 'px';
            hoverSpan.style.left = relX + 'px';
        });

        button.addEventListener('mouseleave', (e) => {
            const rect = button.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            hoverSpan.style.top = relY + 'px';
            hoverSpan.style.left = relX + 'px';
        });
    });
}


// Page Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch data first so dynamic elements (like form-results) exist in DOM
    await fetchAndRenderData();

    // 2. Initialize UI components
    initializeCountdown();
    initializeCarousel();
    initializePrimaryButtonHover();
    setupSmoothScrolling();

    // 3. Handle Hero animation immediately
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.classList.add('animate-in');
    }

    // 4. Initialize the IntersectionObserver for everything else
    animateOnScroll(animationElements);
});

// Data Fetching and Rendering
async function fetchAndRenderData() {
    try {
        await Promise.all([
            fetchAndRenderMatches(),
            fetchAndRenderTeamStats()
        ]);
    } catch (error) {
        console.error('Error fetching data:', error);
        handleErrorStates();
    }
}

async function fetchAndRenderMatches() {
    try {
        const matches = await fetchCurrentSeasonMatches();
        renderForm(matches.form);
        updateCountdown(matches.upcoming);
    } catch (error) {
        console.error('Error fetching matches:', error);
        handleErrorStates();
    }
}

// Team Stats Fetching
async function fetchAndRenderTeamStats() {
    try {
        const teamSeasonStats = await fetchTeamSeasonStats();
        updateTeamStats(teamSeasonStats);
    } catch (error) {
        console.error('Error loading team season stats:', error);
        updateTeamStats({});
    }
}

// Update Team Stats Display
function updateTeamStats(stats) {
    document.getElementById('team-matches-played').textContent = stats.matchesPlayed || 0;
    document.getElementById('team-wins').textContent = stats.wins || 0;
    document.getElementById('team-goals-scored').textContent = stats.goalsScored || 0;
    document.getElementById('team-clean-sheets').textContent = stats.cleanSheets || 0;
}

// Render Recent Form
function renderForm(form) {
    const formResults = document.getElementById('form-results');
    formResults.innerHTML = '';

    form.forEach(result => {
        const span = document.createElement('span');
        const resultClass = result === 'winst' ? 'win' : result === 'gelijk' ? 'draw' : 'loss';
        span.className = `form-result ${resultClass}`;
        span.innerHTML = `<i class="fas fa-${resultClass === 'win' ? 'check' : resultClass === 'draw' ? 'minus' : 'times'}"></i>`;
        formResults.appendChild(span);
    });
}

// Error Handling
function handleErrorStates() {
    document.getElementById('next-match-title').textContent = 'Geen wedstrijden gepland in de nabije toekomst.';
    document.getElementById('countdown').style.display = 'none';
    document.getElementById('form-results').innerHTML = '<p>Geen vorm beschikbaar.</p>';
    updateTeamStats({});
}