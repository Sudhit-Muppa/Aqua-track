
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    function switchPage(pageId) {
        // Update active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });

        // Update Home Page Buttons
        const navButtons = document.querySelectorAll('.nav-btn');
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

    // Event Listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            switchPage(targetId);
        });
    });

    mobileToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('mobile-open');
    });

    // Nav Buttons Listener (Home)
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            switchPage(target);

            // Update active state of buttons
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // CTA / Internal Link Triggers
    const ctaLinks = document.querySelectorAll('.nav-link-trigger');
    ctaLinks.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const target = trigger.getAttribute('href').substring(1);
            switchPage(target);

            // Update active button state if matching button exists
            const activeBtn = document.querySelector(`.nav-btn[data-target="${target}"]`);
            if (activeBtn) {
                navButtons.forEach(b => b.classList.remove('active'));
                activeBtn.classList.add('active');
            }
        });
    });

    // Handle initial hash or default to home
    const initialHash = window.location.hash.substring(1) || 'home';
    if (document.getElementById(initialHash)) {
        switchPage(initialHash);
        // Set active button if applicable
        const activeBtn = document.querySelector(`.nav-btn[data-target="${initialHash}"]`);
        if (activeBtn) {
            navButtons.forEach(b => b.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    } else {
        switchPage('home');
    }
});
