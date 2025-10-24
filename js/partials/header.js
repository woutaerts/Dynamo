document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
});

async function loadHeader() {
    try {
        const headerPath = '/Dynamo/html/partials/header.html';
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

        configureHeader(false);
        initializeScrollProgress();
        setupHeaderScrollEffect();
        setupPositionAwareHoverEffect();
    } catch (error) {
        console.error('Error loading header:', error);
        loadFallbackHeader();
    }
}

function setupPositionAwareHoverEffect() {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;

    if (isDesktop) {
        if (typeof jQuery !== 'undefined') {
            setupJQueryHoverEffect();
        } else {
            setupVanillaHoverEffect();
        }
    }
}

function setupJQueryHoverEffect() {
    $(function() {
        $('.nav-link').each(function() {
            if ($(this).find('span.ripple').length === 0) {
                $(this).append('<span class="ripple"></span>');
            }

            $(this).on('mouseenter', function(e) {
                if (!$(this).hasClass('active')) {
                    const parentOffset = $(this).offset();
                    const relX = e.pageX - parentOffset.left;
                    const relY = e.pageY - parentOffset.top;
                    $(this).find('span.ripple').css({ top: relY, left: relX });
                }
            }).on('mouseout', function(e) {
                if (!$(this).hasClass('active')) {
                    const parentOffset = $(this).offset();
                    const relX = e.pageX - parentOffset.left;
                    const relY = e.pageY - parentOffset.top;
                    $(this).find('span.ripple').css({ top: relY, left: relX });
                }
            });
        });
    });
}

function setupVanillaHoverEffect() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(function(link) {
        if (!link.querySelector('span.ripple')) {
            const span = document.createElement('span');
            span.className = 'ripple';
            link.appendChild(span);
        }

        link.addEventListener('mouseenter', function(e) {
            if (!this.classList.contains('active')) {
                const rect = this.getBoundingClientRect();
                const relX = e.clientX - rect.left;
                const relY = e.clientY - rect.top;
                const span = this.querySelector('span.ripple');
                span.style.top = relY + 'px';
                span.style.left = relX + 'px';
            }
        });

        link.addEventListener('mouseleave', function(e) {
            if (!this.classList.contains('active')) {
                const rect = this.getBoundingClientRect();
                const relX = e.clientX - rect.left;
                const relY = e.clientY - rect.top;
                const span = this.querySelector('span.ripple');
                span.style.top = relY + 'px';
                span.style.left = relX + 'px';
            }
        });
    });
}

function configureHeader(isRootPage) {
    const navLinks = document.querySelectorAll('.nav-link');
    const headerLogoLink = document.getElementById('header-logo-link');
    const headerLogoRed = document.getElementById('header-logo-red');

    // Configure navigation links with absolute paths
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        switch(page) {
            case 'home':
                link.href = '/Dynamo/index.html';
                break;
            case 'statistics':
                link.href = '/Dynamo/html/statistics.html';
                break;
            case 'players':
                link.href = '/Dynamo/html/players.html';
                break;
            case 'matches':
                link.href = '/Dynamo/html/matches.html';
                break;
            case 'search':
                link.href = '/Dynamo/html/search.html';
                break;
        }
    });

    // Configure header logo
    if (headerLogoLink && headerLogoRed) {
        headerLogoLink.href = '/Dynamo/index.html';
        headerLogoRed.src = '/Dynamo/img/logos/red-outlined-logo.png';
    } else {
        console.warn('Header logo elements not found');
    }

    highlightCurrentPage();
    initializeMobileMenu();
}

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
                    <a href="/Dynamo/index.html" aria-label="Dynamo Beirs Homepage" class="header-logo-link" id="header-logo-link">
                        <div class="logo-container">
                            <img src="/Dynamo/img/logos/red-outlined-logo.png" alt="Red Outlined Dynamo Beirs Logo" class="header-logo header-logo-red" id="header-logo-red">
                        </div>
                    </a>
                </div>
                <ul class="nav-links" id="nav-links">
                    <li><a href="/Dynamo/index.html" class="nav-link" data-page="home"><i class="fa-solid fa-house"></i><span class="nav-text">Home</span><span class="ripple"></span></a></li>
                    <li><a href="/Dynamo/html/players.html" class="nav-link" data-page="players">Spelers<span class="ripple"></span></a></li>
                    <li><a href="/Dynamo/html/statistics.html" class="nav-link" data-page="statistics">Statistieken<span class="ripple"></span></a></li>
                    <li><a href="/Dynamo/html/matches.html" class="nav-link" data-page="matches">Wedstrijden<span class="ripple"></span></a></li>
                    <li><a href="/Dynamo/html/search.html" class="nav-link search-link" data-page="search"><i class="fa-solid fa-magnifying-glass"></i><span class="ripple"></span></a></li>
                </ul>
                <div class="mobile-search-container">
                    <a href="/Dynamo/html/search.html" class="mobile-search-link" aria-label="Search">
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

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const page = link.getAttribute('data-page');
        if ((currentPath === '/Dynamo/' || currentPath === '/Dynamo/index.html') && page === 'home') {
            link.classList.add('active');
        } else if (currentPath.includes(page)) {
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