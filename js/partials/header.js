document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
});

async function loadHeader() {
    try {
        const headerPath = '/html/partials/header.html'; // Always use root-relative path
        const response = await fetch(headerPath);

        if (!response.ok) {
            console.error(`Failed to load header from ${headerPath}: ${response.status} ${response.statusText}`);
            loadFallbackHeader();
            return;
        }

        const headerHTML = await response.text();

        if (!headerHTML.trim()) {
            console.error('Header file is empty');
            loadFallbackHeader();
            return;
        }

        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.outerHTML = headerHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }

        configureHeader();
        initializeScrollProgress();
        setupHeaderScrollEffect();
        setupPositionAwareHoverEffect();
    } catch (error) {
        console.error('Error loading header:', error);
        loadFallbackHeader();
    }
}

function loadFallbackHeader() {
    const fallbackHeader = `
        <header class="header">
            <div class="scroll-progress-container">
                <div class="scroll-progress-bar"></div>
            </div>
            <nav class="nav-container">
                <ul class="nav-links">
                    <li><a href="/index.html" class="nav-link" data-page="home">Home<span></span></a></li>
                    <li><a href="/html/statistics.html" class="nav-link" data-page="statistics">Statistics<span></span></a></li>
                    <li><a href="/html/players.html" class="nav-link" data-page="players">Players<span></span></a></li>
                    <li><a href="/html/matches.html" class="nav-link" data-page="matches">Matches<span></span></a></li>
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

    highlightCurrentPage();
    initializeMobileMenu();
    initializeScrollProgress();
    setupHeaderScrollEffect();
    setupPositionAwareHoverEffect();
}

function configureHeader() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        switch(page) {
            case 'home':
                link.href = '/index.html';
                break;
            case 'statistics':
                link.href = '/html/statistics.html';
                break;
            case 'players':
                link.href = '/html/players.html';
                break;
            case 'matches':
                link.href = '/html/matches.html';
                break;
        }
    });

    highlightCurrentPage();
    initializeMobileMenu();
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
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

function initializeScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');

    if (!progressBar) {
        console.warn('Scroll progress bar element not found');
        return;
    }

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );

        const windowHeight = window.innerHeight;
        const maxScroll = documentHeight - windowHeight;
        let progress = 0;
        if (maxScroll > 0) {
            progress = (scrollTop / maxScroll) * 100;
            progress = Math.min(100, Math.max(0, progress));
        }

        progressBar.style.width = progress + '%';
    }

    let ticking = false;
    function throttledUpdateScrollProgress() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    }

    updateScrollProgress();
    window.addEventListener('scroll', throttledUpdateScrollProgress, { passive: true });

    window.addEventListener('resize', function() {
        setTimeout(updateScrollProgress, 100);
    });

    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' ||
                (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class'))) {
                shouldUpdate = true;
            }
        });

        if (shouldUpdate) {
            setTimeout(updateScrollProgress, 50);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

function setupHeaderScrollEffect() {
    const header = document.querySelector(".header");

    if (!header) {
        console.warn('Header element not found for scroll effect');
        return;
    }

    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 100;

    function handleScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (!ticking) {
            window.requestAnimationFrame(function() {
                if (currentScroll > scrollThreshold) {
                    if (currentScroll > lastScrollTop) {
                        header.classList.add('header-hidden');
                    } else {
                        header.classList.remove('header-hidden');
                    }
                } else {
                    header.classList.remove('header-hidden');
                }

                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
}