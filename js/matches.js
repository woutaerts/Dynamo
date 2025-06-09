let matchMap = null;

document.addEventListener('DOMContentLoaded', () => {
    // Animate match cards
    const cards = document.querySelectorAll('.match-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Countdown logic
    const targetDate = new Date("2025-06-12T15:00:00").getTime();
    const countdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdown);
            document.getElementById("countdown").innerHTML = "Match Started";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").textContent = days;
        document.getElementById("hours").textContent = hours;
        document.getElementById("minutes").textContent = minutes;
        document.getElementById("seconds").textContent = seconds;
    }, 1000);
});

// Initialize map function
function initializeMap(lat, lng, venueName) {
    // Remove existing map if it exists
    if (matchMap) {
        matchMap.remove();
    }

    // Create new map centered on the venue
    matchMap = L.map('matchMap').setView([lat, lng], 15);

    // Add OpenStreetMap tile layer (free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(matchMap);

    // Add a marker for the venue
    const marker = L.marker([lat, lng]).addTo(matchMap);
    marker.bindPopup(`<strong>${venueName}</strong><br>Match Venue`).openPopup();
}

// Handle match card clicks to show modal with map
document.querySelectorAll('.match-card.result').forEach(card => {
    card.addEventListener('click', () => {
        const matchTitle = card.getAttribute('data-match-title');
        const venue = card.getAttribute('data-venue');
        const lat = parseFloat(card.getAttribute('data-lat'));
        const lng = parseFloat(card.getAttribute('data-lng'));

        // Update modal content
        document.getElementById('modalMatchTitle').textContent = matchTitle;
        document.getElementById('venueInfo').textContent = venue;

        // Show modal
        document.getElementById('matchCenterModal').style.display = 'flex';

        // Initialize map after modal is visible
        setTimeout(() => {
            initializeMap(lat, lng, venue);
        }, 100);
    });
});

// Handle timeline item clicks
document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', () => {
        // Default to home stadium for timeline items
        const venue = 'Home Stadium';
        const lat = 50.9704;
        const lng = 5.7734;

        document.getElementById('modalMatchTitle').textContent = 'Match Center';
        document.getElementById('venueInfo').textContent = venue;
        document.getElementById('matchCenterModal').style.display = 'flex';

        setTimeout(() => {
            initializeMap(lat, lng, venue);
        }, 100);
    });
});

// Close modal functionality
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('matchCenterModal').style.display = 'none';
    if (matchMap) {
        matchMap.remove();
        matchMap = null;
    }
});

// Close modal when clicking outside
document.getElementById('matchCenterModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.currentTarget.style.display = 'none';
        if (matchMap) {
            matchMap.remove();
            matchMap = null;
        }
    }
});