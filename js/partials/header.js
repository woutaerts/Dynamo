document.addEventListener('DOMContentLoaded', loadHeader);

// Main header loader
async function loadHeader() {
    try {
        const isRootPage = isOnRootPage();
        const headerPath = isRootPage ? 'pages/partials/header.html' : 'partials/header.html';

        const response = await fetch(headerPath);

        if (!response.ok || !await response.text()) {
            throw new Error(`Failed to load header: ${response.status}`);
        }

        const headerHTML = await response.text();
        insertHeader(headerHTML);
        initializeHeader(isRootPage);

    } catch (error) {
        console.error('Error loading header:', error);
        loadFallbackHeader();
    }
}

// Helper functions
function isOnRootPage() {
    const path = window.location.pathname;
    return path === '/' || path.endsWith('/index.html') || !path.includes('/pages/');
}

function insertHeader(headerHTML) {
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
        placeholder.outerHTML = headerHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
}

// Fallback header creation
function loadFallbackHeader() {
    const isRootPage = isOnRootPage();
    const paths = getPaths(isRootPage);

    const fallbackHTML = `
        <header class="header">
            <div class="scroll-progress-container">
                <div class="scroll-progress-bar"></div>
            </div>
            <nav class="nav-container">
                <div class="logo-section">
                    <img src="${paths.logo}" alt="Logo Dynamo Beirs" class="club-logo">
                    <span class="club-name">Dynamo Beirs</span>
                </div>
                <ul class="nav-links">
                    <li><a href="${paths.home}" class="nav-link" data-page="home">Home</a></li>
                    <li><a href="${paths.stats}" class="nav-link" data-page="statistics">Statistics</a></li>
                    <li><a href="${paths.players}" class="nav-link" data-page="players">Players</a></li>
                    <li><a href="${paths.matches}" class="nav-link" data-page="matches">Matches</a></li>
                    <div class="nav-blob"></div>
                </ul>
                <div class="mobile-menu-toggle">
                    <span></span><span></span><span></span>
                </div>
            </nav>
        </header>`;

    insertHeader(fallbackHTML);
    initializeHeader(isRootPage);
}

function getPaths(isRootPage) {
    return isRootPage ? {
        logo: 'img/logos/original-logo.png',
        home: 'index.html',
        stats: 'pages/statistics.html',
        players: 'pages/players.html',
        matches: 'pages/matches.html'
    } : {
        logo: '../img/logos/original-logo.png',
        home: '../index.html',
        stats: 'statistics.html',
        players: 'players.html',
        matches: 'matches.html'
    };
}

// Header initialization
function initializeHeader(isRootPage) {
    configureHeaderPaths(isRootPage);
    highlightCurrentPage();
    initializeMobileMenu();
    initializeScrollProgress();
    setupHeaderScrollEffect();
    initializeNavBlob();
}

function configureHeaderPaths(isRootPage) {
    const clubLogo = document.getElementById('club-logo');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!clubLogo) return;

    const paths = getPaths(isRootPage);
    clubLogo.src = paths.logo;

    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        link.href = paths[page] || paths.home;
    });
}

// Page highlighting
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const page = link.getAttribute('data-page');

        if ((currentPath === '/' || currentPath.endsWith('/index.html')) && page === 'home') {
            link.classList.add('active');
        } else if (currentPath.includes(page)) {
            link.classList.add('active');
        }
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }
}

// Scroll progress bar
function initializeScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;

    let ticking = false;

    function updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
        const windowHeight = window.innerHeight;
        const maxScroll = documentHeight - windowHeight;

        const progress = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
        progressBar.style.width = progress + '%';
    }

    function throttledUpdate() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateProgress();
                ticking = false;
            });
            ticking = true;
        }
    }

    updateProgress();
    window.addEventListener('scroll', throttledUpdate, { passive: true });
    window.addEventListener('resize', () => setTimeout(updateProgress, 100));

    // Dynamic content observer
    const observer = new MutationObserver(mutations => {
        const shouldUpdate = mutations.some(mutation =>
            mutation.type === 'childList' ||
            (mutation.type === 'attributes' && ['style', 'class'].includes(mutation.attributeName))
        );
        if (shouldUpdate) setTimeout(updateProgress, 50);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

// Header hide/show on scroll
function setupHeaderScrollEffect() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 100;

    function handleScroll() {
        if (ticking) return;

        requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll > scrollThreshold) {
                header.classList.toggle('header-hidden', currentScroll > lastScrollTop);
            } else {
                header.classList.remove('header-hidden');
            }

            lastScrollTop = Math.max(0, currentScroll);
            ticking = false;
        });
        ticking = true;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Navigation blob effect
function initializeNavBlob() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navContainer = document.querySelector('.nav-links');
    const navBlob = document.querySelector('.nav-blob');

    if (!navContainer || !navBlob) return;

    function updateBlob(activeLink) {
        if (window.innerWidth <= 768) return;

        if (activeLink) {
            const linkRect = activeLink.getBoundingClientRect();
            const navRect = navContainer.getBoundingClientRect();
            const left = linkRect.left - navRect.left;
            const width = linkRect.width - 1;

            Object.assign(navBlob.style, {
                left: left + 'px',
                width: width + 'px',
                transform: 'scale(1)'
            });
            navBlob.classList.add('active');
        } else {
            navBlob.style.transform = 'scale(0.95)';
            navBlob.classList.remove('active');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateBlob(link));
        link.addEventListener('mouseleave', () => updateBlob(null));
    });

    window.addEventListener('resize', () => navBlob.classList.remove('active'));
}