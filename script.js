
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
    // Center on the DMV Area (Shifted slightly west to include Loudoun)
    const dmvCenter = { lat: 38.92, lng: -77.25 };

    // DMV Area Bounds (Expanded west to include all of Loudoun County)
    const dmvBounds = {
        north: 39.6, // Extended slightly North for Lovettsville
        south: 38.3, // South of Woodbridge
        west: -78.1, // Extended West to cover Blue Ridge/Loudoun border
        east: -76.4  // East of Annapolis
    };

    // Custom Map Style: White land, emphasized borders, NO ROADS
    const mapStyle = [
        {
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
        },
        // Hide ALL Roads
        {
            "featureType": "road",
            "stylers": [{ "visibility": "off" }]
        },
        // Keep icons hidden for cleanliness
        {
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#f5f5f5" }]
        },
        // Outline Administrative Areas
        {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#9ca3af" }, { "weight": 2 }]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#ef4444" }] // Red Fill
        },
        {
            "featureType": "water",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#22c55e" }, { "weight": 5 }] // Green Outline (Thicker)
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#7f1d1d" }]
        }
    ];

    map = new google.maps.Map(document.getElementById("map-container"), {
        zoom: 9, // Zoomed out slightly to fit Loudoun + DC
        center: dmvCenter,
        styles: mapStyle,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        restriction: {
            latLngBounds: dmvBounds,
            strictBounds: false,
        }
    });

    // Defined Rivers Data (Separated for Custom Coloring)
    const rivers = [
        {
            name: "Potomac River",
            color: "#22c55e", // Green (as requested previously)
            path: [
                { lat: 39.000, lng: -77.250 }, // Near Great Falls
                { lat: 38.965, lng: -77.160 }, // Carderock
                { lat: 38.935, lng: -77.120 }, // Little Falls
                { lat: 38.905, lng: -77.065 }, // Georgetown
                { lat: 38.892, lng: -77.055 }, // Roosevelt Island
                { lat: 38.885, lng: -77.040 }, // Lincoln Memorial
                { lat: 38.870, lng: -77.020 }, // Hains Point
                { lat: 38.850, lng: -77.030 }, // National Airport
                { lat: 38.800, lng: -77.045 }, // Alexandria
                { lat: 38.710, lng: -77.040 }, // Mount Vernon
                { lat: 38.600, lng: -77.150 }, // Widening south
            ]
        },
        {
            name: "Anacostia River",
            color: "#3b82f6", // Blue
            path: [
                { lat: 38.940, lng: -76.930 }, // Bladensburg
                { lat: 38.910, lng: -76.960 }, // Arboretum
                { lat: 38.875, lng: -76.990 }, // Navy Yard
                { lat: 38.865, lng: -77.015 }, // Buzzard Point
                { lat: 38.855, lng: -77.020 }, // Merge Potomac
            ]
        },
        {
            name: "Goose Creek",
            color: "#eab308", // Yellow (Loudoun)
            path: [
                { lat: 38.980, lng: -77.700 }, // Middleburg Area
                { lat: 39.010, lng: -77.650 },
                { lat: 39.030, lng: -77.600 }, // Oatlands
                { lat: 39.050, lng: -77.550 },
                { lat: 39.070, lng: -77.500 }, // Belmont
                { lat: 39.085, lng: -77.460 }, // Merge Potomac
            ]
        },
        {
            name: "Occoquan River",
            color: "#f97316", // Orange
            path: [
                { lat: 38.750, lng: -77.450 }, // Manassas
                { lat: 38.720, lng: -77.380 },
                { lat: 38.700, lng: -77.300 }, // Reservoir
                { lat: 38.680, lng: -77.260 }, // Town
                { lat: 38.650, lng: -77.220 }, // Merge Potomac
            ]
        },
        {
            name: "Monocacy River",
            color: "#9333ea", // Purple
            path: [
                { lat: 39.710, lng: -77.220 }, // PA Border/Source
                { lat: 39.600, lng: -77.250 }, // Thurmont
                { lat: 39.420, lng: -77.400 }, // Frederick
                { lat: 39.350, lng: -77.420 }, // Buckeystown
                { lat: 39.220, lng: -77.450 }, // Merge Potomac
            ]
        },
        {
            name: "Bull Run",
            color: "#db2777", // Pink
            path: [
                { lat: 38.940, lng: -77.650 }, // Source (Bull Run Mtns)
                { lat: 38.880, lng: -77.550 }, // Manassas Battlefield
                { lat: 38.820, lng: -77.450 }, // Manassas Park
                { lat: 38.720, lng: -77.380 }, // Merge Occoquan
            ]
        },
        {
            name: "Broad Run",
            color: "#14b8a6", // Teal
            path: [
                { lat: 38.980, lng: -77.580 }, // Arcola/Source area
                { lat: 39.020, lng: -77.500 }, // Ashburn
                { lat: 39.050, lng: -77.450 }, // Kincora
                { lat: 39.070, lng: -77.440 }, // Merge Potomac
            ]
        },
        {
            name: "Difficult Run",
            color: "#4f46e5", // Indigo
            path: [
                { lat: 38.880, lng: -77.320 }, // Oakton
                { lat: 38.930, lng: -77.300 }, // Reston/Vienna border
                { lat: 38.980, lng: -77.250 }, // Great Falls Park / Merge Potomac
            ]
        },
        {
            name: "Rock Creek",
            color: "#06b6d4", // Cyan
            path: [
                { lat: 39.050, lng: -77.100 }, // Rockville/Derwood
                { lat: 38.980, lng: -77.060 }, // Kensington
                { lat: 38.940, lng: -77.050 }, // Rock Creek Park
                { lat: 38.905, lng: -77.055 }, // Georgetown / Merge Potomac
            ]
        }
    ];

    // Render all river polylines
    rivers.forEach(river => {
        new google.maps.Polyline({
            path: river.path,
            geodesic: true,
            strokeColor: river.color,
            strokeOpacity: 0.9,
            strokeWeight: 6, // Slightly thinner for smaller tributaries to show hierarchy
            map: map,
            title: river.name // Tooltip on hover
        });
    });

    console.log("Map initialized successfully (DMV Focus + Many Separated Rivers)");
}

console.log("Aqua Track script loaded");
