// js/partials/header.js
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
});

async function loadHeader() {
    try {
        // Determine the correct path based on current page location
        const isRootPage = window.location.pathname === '/' ||
            window.location.pathname.endsWith('/index.html') ||
            !window.location.pathname.includes('/pages/');

        const headerPath = isRootPage ? 'pages/partials/header.html' : 'partials/header.html';

        // Fetch the header HTML
        const response = await fetch(headerPath);

        // Handle different types of fetch failures
        if (!response.ok) {
            console.error(`Failed to load header from ${headerPath}: ${response.status} ${response.statusText}`);
            loadFallbackHeader(isRootPage);
            return;
        }

        const headerHTML = await response.text();

        // Validate that we actually got content
        if (!headerHTML.trim()) {
            console.error('Header file is empty');
            loadFallbackHeader(isRootPage);
            return;
        }

        // Find the header placeholder and replace it
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.outerHTML = headerHTML;
        } else {
            // If no placeholder, insert at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }

        // Configure the header after loading
        configureHeader(isRootPage);

    } catch (error) {
        console.error('Error loading header:', error);
        loadFallbackHeader(isRootPage);
    }
}

function loadFallbackHeader(isRootPage) {
    // Create a basic fallback header if the main one fails to load
    const logoPath = isRootPage ? 'img/logos/red-outlined-logo.png' : '../img/logos/red-outlined-logo.png';
    const homePath = isRootPage ? 'index.html' : '../index.html';
    const statsPath = isRootPage ? 'pages/statistics.html' : 'statistics.html';
    const playersPath = isRootPage ? 'pages/players.html' : 'players.html';
    const matchesPath = isRootPage ? 'pages/matches.html' : 'matches.html';

    const fallbackHeader = `
        <header class="header">
            <nav class="nav-container">
                <div class="logo-section">
                    <img src="${logoPath}" alt="Red Outlined Dynamo Beirs Logo" class="club-logo">
                    <span class="club-name">Dynamo Beirs</span>
                </div>
                <ul class="nav-links">
                    <li><a href="${homePath}" class="nav-link" data-page="home">Home</a></li>
                    <li><a href="${statsPath}" class="nav-link" data-page="statistics">Statistics</a></li>
                    <li><a href="${playersPath}" class="nav-link" data-page="players">Players</a></li>
                    <li><a href="${matchesPath}" class="nav-link" data-page="matches">Matches</a></li>
                </ul>
                <div class="mobile-menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </header>
    `;

    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.outerHTML = fallbackHeader;
    } else {
        document.body.insertAdjacentHTML('afterbegin', fallbackHeader);
    }

    // Initialize functionality for fallback header
    highlightCurrentPage();
    initializeMobileMenu();
}

function configureHeader(isRootPage) {
    // Set correct paths for logo and navigation links
    const clubLogo = document.getElementById('club-logo');
    const navLinks = document.querySelectorAll('.nav-link');

    // Ensure elements exist before configuring
    if (!clubLogo) {
        console.warn('Club logo element not found');
        return;
    }

    if (isRootPage) {
        // Root page paths
        clubLogo.src = 'img/logos/red-outlined-logo.png';
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            switch(page) {
                case 'home':
                    link.href = 'index.html';
                    break;
                case 'statistics':
                    link.href = 'pages/statistics.html';
                    break;
                case 'players':
                    link.href = 'pages/players.html';
                    break;
                case 'matches':
                    link.href = 'pages/matches.html';
                    break;
            }
        });
    } else {
        // Sub-page paths (pages folder)
        clubLogo.src = '../img/logos/red-outlined-logo.png';
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            switch(page) {
                case 'home':
                    link.href = '../index.html';
                    break;
                case 'statistics':
                    link.href = 'statistics.html';
                    break;
                case 'players':
                    link.href = 'players.html';
                    break;
                case 'matches':
                    link.href = 'matches.html';
                    break;
            }
        });
    }

    // Highlight current page
    highlightCurrentPage();

    // Initialize mobile menu toggle
    initializeMobileMenu();
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');

        // Check if this link corresponds to the current page
        if ((currentPath === '/' || currentPath.endsWith('/index.html')) && link.getAttribute('data-page') === 'home') {
            link.classList.add('active');
        } else if (currentPath.includes(link.getAttribute('data-page'))) {
            link.classList.add('active');
        }
    });
}

function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}