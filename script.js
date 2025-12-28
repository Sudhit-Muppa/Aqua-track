
// Navigation & UI Logic
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const navButtons = document.querySelectorAll('.nav-btn');

    function switchPage(pageId) {
        // Update active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });

        // Update Home Page Buttons
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.target === pageId) {
                btn.classList.add('active');
            }
        });

        // Show active section
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === pageId) {
                section.classList.add('active');
            }
        });

        // Close mobile menu if open
        if (navLinksContainer.classList.contains('mobile-open')) {
            navLinksContainer.classList.remove('mobile-open');
        }
    }

    // Event Listeners: Nav Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            switchPage(targetId);
        });
    });

    // Event Listener: Mobile Toggle
    mobileToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('mobile-open');
    });

    // Event Listeners: Home Page Nav Buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            switchPage(target);
        });
    });

    // Event Listeners: CTA / Internal Link Triggers
    const ctaLinks = document.querySelectorAll('.nav-link-trigger');
    ctaLinks.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const target = trigger.getAttribute('href').substring(1);
            switchPage(target);
        });
    });

    // Handle initial hash or default to home on load
    const initialHash = window.location.hash.substring(1) || 'home';
    if (document.getElementById(initialHash)) {
        switchPage(initialHash);
    } else {
        switchPage('home');
    }
});

// Google Map Initialization (Global Scope)
let map;

window.initMap = function () {
    // Default to Northern Virginia view (Ashburn/Loudoun area)
    const northVa = { lat: 39.0438, lng: -77.4874 };

    // Virginia Bounds (Approximate)
    const virginiaBounds = {
        north: 39.8,
        south: 36.5,
        west: -83.7,
        east: -75.1
    };

    // Custom Map Style: White land, emphasized borders
    const mapStyle = [
        {
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
        },
        // Show labels (Revert: removed visibility: off for all labels)
        {
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }] // Keep icons hidden for cleanliness
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#f5f5f5" }]
        },
        // Outline State Borders (Virginia)
        {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#9ca3af" }, { "weight": 2 }]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#bdbdbd" }]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#757575" }]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#757575" }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{ "color": "#dadada" }]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
        },
        {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [{ "color": "#e5e5e5" }]
        },
        {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [{ "color": "#eeeeee" }]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#c9c9c9" }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
        }
    ];

    map = new google.maps.Map(document.getElementById("map-container"), {
        zoom: 8, // Zoomed out a bit to see more of Virginia
        center: { lat: 37.5, lng: -78.5 }, // Centered on VA
        styles: mapStyle,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        restriction: {
            latLngBounds: virginiaBounds,
            strictBounds: false, // Relaxed to allow seeing the "outline" better
        }
    });

    console.log("Map initialized successfully");
}

console.log("Aqua Track script loaded");
