/* Page Initialization */
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
});

/* Load Header */
async function loadHeader() {
    try {
        const headerPath = '/dynamo/html/partials/header.html';
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
        highlightCurrentPage();
        initializeMobileMenu();
        initializeScrollProgress();
        setupHeaderScrollEffect();
        setupPositionAwareHoverEffect();
    } catch (error) {
        console.error('Error loading header:', error);
        loadFallbackHeader();
    }
}

/* Fallback Header */
function loadFallbackHeader() {
    const fallbackHeader = `
        <header class="header" id="header">
            <nav class="nav-container">
                <div class="mobile-menu-toggle" id="mobile-menu-toggle" tabindex="0" role="button" aria-label="Toggle mobile menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="header-logo-container" id="header-logo-container">
                    <a href="/dynamo/index.html" aria-label="Dynamo Beirs Homepage" class="header-logo-link" id="header-logo-link">
                        <div class="logo-container">
                            <img src="/dynamo/img/logos/red-outlined-logo.png" alt="Red Outlined Dynamo Beirs Logo" class="header-logo header-logo-red" id="header-logo-red">
                        </div>
                    </a>
                </div>
                <ul class="nav-links" id="nav-links">
                    <li><a href="/dynamo/index.html" class="nav-link" data-page="home"><i class="fa-solid fa-house"></i><span class="nav-text">Home</span><span class="ripple"></span></a></li>
                    <li><a href="/dynamo/html/players.html" class="nav-link" data-page="players">Spelers<span class="ripple"></span></a></li>
                    <li><a href="/dynamo/html/statistics.html" class="nav-link" data-page="statistics">Statistieken<span class="ripple"></span></a></li>
                    <li><a href="/dynamo/html/matches.html" class="nav-link" data-page="matches">Wedstrijden<span class="ripple"></span></a></li>
                    <li><a href="/dynamo/html/search.html" class="nav-link search-link" data-page="search"><i class="fa-solid fa-magnifying-glass"></i><span class="ripple"></span></a></li>
                </ul>
                <div class="mobile-search-container">
                    <a href="/dynamo/html/search.html" class="mobile-search-link" aria-label="Search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </a>
                </div>
            </nav>
        </header>
        <div class="scroll-progress-container">
            <div class="scroll-progress-bar"></div>
        </div>
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

/* Highlight Current Page */
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const page = link.getAttribute('data-page');
        if ((currentPath === '/dynamo/' || currentPath === '/dynamo/index.html') && page === 'home') {
            link.classList.add('active');
        } else if (currentPath.endsWith(page + '.html')) {
            link.classList.add('active');
        }
    });
}

/* Mobile Menu */
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

/* Scroll Progress */
function initializeScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) {
        console.warn('Scroll progress bar element not found');
        return;
    }

    // 1. Create a variable to cache the max scroll value
    let cachedMaxScroll = 0;

    // 2. Extract the heavy math into its own function
    function calculateDimensions() {
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        const windowHeight = window.innerHeight;
        cachedMaxScroll = documentHeight - windowHeight;
    }

    // 3. Keep the scroll function extremely lightweight
    function updateScrollProgress() {
        if (cachedMaxScroll <= 0) {
            progressBar.style.width = '0%';
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let progress = (scrollTop / cachedMaxScroll) * 100;

        progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }

    let ticking = false;
    function throttledUpdateScrollProgress() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Initial calculation
    calculateDimensions();
    updateScrollProgress();

    // 4. Use a ResizeObserver to automatically recalculate ONLY when the page
    // actually changes size (handles both window resizing AND async CSV content loading!)
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            calculateDimensions();
            updateScrollProgress();
        });
        resizeObserver.observe(document.body);
    } else {
        // Fallback for very old browsers
        window.addEventListener('resize', () => {
            calculateDimensions();
            updateScrollProgress();
        });
    }

    // The scroll listener now only does simple math using the cached value
    window.addEventListener('scroll', throttledUpdateScrollProgress, { passive: true });
}

/* Header Scroll Effect */
function setupHeaderScrollEffect() {
    const header = document.querySelector('.header');
    if (!header) {
        console.warn('Header element not found for scroll effect');
        return;
    }

    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 100; // Only hide after scrolling down 100px

    function handleScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                // 1. Calculate the desired state in one simple boolean
                // Hide IF we are past the threshold AND scrolling down
                const shouldHide = currentScroll > scrollThreshold && currentScroll > lastScrollTop;

                // 2. The toggle method's second parameter forces the class on (true) or off (false)
                header.classList.toggle('header-hidden', shouldHide);

                // 3. Update the last scroll position (prevent negative scrolling bouncing on Mac/iOS)
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/* Hover Effect */
function setupPositionAwareHoverEffect() {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;

    // If it's not a desktop screen, exit early.
    if (!isDesktop) return;

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        // 1. Ensure the ripple span exists
        if (!link.querySelector('span.ripple')) {
            const span = document.createElement('span');
            span.className = 'ripple';
            link.appendChild(span);
        }

        // 2. Attach the same logic to both mouseenter AND mouseleave
        ['mouseenter', 'mouseleave'].forEach(eventType => {
            link.addEventListener(eventType, function(e) {
                if (!this.classList.contains('active')) {
                    const rect = this.getBoundingClientRect();
                    const span = this.querySelector('span.ripple');

                    // Calculate exact cursor position relative to the button
                    span.style.left = (e.clientX - rect.left) + 'px';
                    span.style.top = (e.clientY - rect.top) + 'px';
                }
            });
        });
    });
}