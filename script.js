/* ============================================================
   Aqua Track
   1. Masthead — stuck state, scroll progress, scrollspy, menu
   2. Hero — ambient water surface
   3. Field probe — sensor model, report, animated water column
   4. Watershed chart — SVG built from our own route coordinates
   5. Scroll reveal
   ============================================================ */

(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
    var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };

    /* ── 1. Masthead ───────────────────────────────────── */

    function initMasthead() {
        var head = $('.masthead');
        var bar = $('.progress__bar');
        var hero = $('.hero');
        var nav = $('#primary-nav');
        var toggle = $('.menu-toggle');
        var links = $$('.nav a[href^="#"]');
        var ticking = false;

        function onScroll() {
            var y = window.scrollY;
            var trigger = hero ? hero.offsetHeight - 90 : 120;
            head.classList.toggle('is-stuck', y > trigger);

            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%';
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
        }, { passive: true });
        onScroll();

        // Mobile menu
        if (toggle) {
            toggle.addEventListener('click', function () {
                var open = nav.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', String(open));
            });
            nav.addEventListener('click', function (e) {
                if (e.target.closest('a')) {
                    nav.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                    nav.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            });
        }

        // Scrollspy
        var sections = links
            .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
            .filter(Boolean);

        if ('IntersectionObserver' in window && sections.length) {
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    links.forEach(function (a) {
                        a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
                    });
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            sections.forEach(function (s) { spy.observe(s); });
        }
    }

    /* ── 2. Hero water surface ─────────────────────────── */

    function initHero() {
        var canvas = $('.hero__canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = 0, h = 0, dpr = 1;

        var bands = [
            { amp: 26, len: 0.0038, speed: 0.00022, y: 0.42, alpha: 0.10, width: 1.5 },
            { amp: 18, len: 0.0055, speed: -0.00031, y: 0.56, alpha: 0.13, width: 1 },
            { amp: 34, len: 0.0026, speed: 0.00015, y: 0.71, alpha: 0.08, width: 2 },
            { amp: 12, len: 0.0072, speed: -0.00044, y: 0.85, alpha: 0.11, width: 1 }
        ];

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function draw(t) {
            ctx.clearRect(0, 0, w, h);

            // Depth wash: the page gets darker as the eye travels down
            var wash = ctx.createLinearGradient(0, 0, 0, h);
            wash.addColorStop(0, 'rgba(20, 70, 92, 0.55)');
            wash.addColorStop(0.55, 'rgba(11, 31, 42, 0.20)');
            wash.addColorStop(1, 'rgba(4, 14, 20, 0.75)');
            ctx.fillStyle = wash;
            ctx.fillRect(0, 0, w, h);

            bands.forEach(function (b) {
                ctx.beginPath();
                var base = h * b.y;
                for (var x = 0; x <= w; x += 6) {
                    var y = base
                        + Math.sin(x * b.len + t * b.speed) * b.amp
                        + Math.sin(x * b.len * 2.3 + t * b.speed * 1.7) * (b.amp * 0.35);
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = 'rgba(95, 199, 222, ' + b.alpha + ')';
                ctx.lineWidth = b.width;
                ctx.stroke();
            });
        }

        function loop(t) { draw(t); requestAnimationFrame(loop); }

        resize();
        window.addEventListener('resize', function () { resize(); if (reduceMotion) draw(0); });
        if (reduceMotion) draw(3000); else requestAnimationFrame(loop);
    }

    /* ── 3. Field probe ────────────────────────────────── */

    var PARAMS = ['ph', 'oxygen', 'turbidity', 'temp', 'conductivity'];

    var PRESETS = {
        tap: { ph: 7.4, oxygen: 8.5, turbidity: 0.4, temp: 18, conductivity: 320 },
        pond: { ph: 7.2, oxygen: 9.0, turbidity: 6, temp: 16, conductivity: 260 },
        bloom: { ph: 9.3, oxygen: 3.2, turbidity: 45, temp: 29, conductivity: 480 },
        salt: { ph: 7.6, oxygen: 10.5, turbidity: 12, temp: 3, conductivity: 2100 },
        runoff: { ph: 6.2, oxygen: 4.8, turbidity: 120, temp: 24, conductivity: 900 }
    };

    var GRADES = [
        { min: 80, name: 'Good', color: '#46D2AC' },
        { min: 60, name: 'Fair', color: '#E8BC55' },
        { min: 40, name: 'Poor', color: '#F5804F' },
        { min: -1, name: 'Impaired', color: '#E4634A' }
    ];

    // Sub-index scores, 0–100 each. Ranges follow ordinary freshwater
    // guidance; the weighting is ours.
    var SCORE = {
        ph: function (v) {
            var d = v < 6.5 ? 6.5 - v : v > 8.5 ? v - 8.5 : 0;
            return clamp(100 - d * 45, 0, 100);
        },
        oxygen: function (v) {
            if (v >= 8) return 100;
            if (v >= 5) return 60 + (v - 5) / 3 * 40;
            if (v >= 2) return 20 + (v - 2) / 3 * 40;
            return clamp(v / 2 * 20, 0, 100);
        },
        turbidity: function (v) {
            return clamp(100 - 40 * Math.log10(Math.max(v, 1)), 0, 100);
        },
        temp: function (v) {
            var d = v < 8 ? (8 - v) * 3 : v > 20 ? (v - 20) * 7 : 0;
            return clamp(100 - d, 0, 100);
        },
        conductivity: function (v) {
            if (v > 500) return clamp(100 - (v - 500) / 25, 0, 100);
            if (v < 100) return clamp(100 - (100 - v) / 2, 0, 100);
            return 100;
        }
    };

    var WEIGHT = { oxygen: 0.27, turbidity: 0.25, ph: 0.20, conductivity: 0.18, temp: 0.10 };

    var FORMAT = {
        ph: function (v) { return v.toFixed(1); },
        oxygen: function (v) { return v.toFixed(1) + ' mg/L'; },
        turbidity: function (v) { return Math.round(v) + ' NTU'; },
        temp: function (v) { return v.toFixed(v % 1 ? 1 : 0) + ' °C'; },
        conductivity: function (v) { return Math.round(v).toLocaleString('en-US') + ' µS/cm'; }
    };

    function diagnose(state) {
        var v = state;
        if (v.ph < 6.5) return 'pH is acidic at ' + v.ph.toFixed(1) + ', which points to acid runoff or a lot of decaying matter upstream.';
        if (v.ph > 8.5) return 'pH is alkaline at ' + v.ph.toFixed(1) + ', the reading that usually comes with a heavy algal bloom.';
        if (v.oxygen < 5) return 'Dissolved oxygen is down to ' + v.oxygen.toFixed(1) + ' mg/L, which is around where fish begin to suffocate.';
        if (v.turbidity > 25) return 'Turbidity is ' + Math.round(v.turbidity) + ' NTU, so enough sediment is suspended in the column to block light from the bottom.';
        if (v.conductivity > 700) return 'Conductivity is ' + Math.round(v.conductivity).toLocaleString('en-US') + ' µS/cm, high enough to suggest road salt or urban runoff reaching the reach.';
        if (v.temp > 24) return 'The water is ' + v.temp.toFixed(0) + ' °C, warm enough to hold less oxygen and to favour algae over everything else.';
        if (v.temp < 5) return 'The water is ' + v.temp.toFixed(0) + ' °C, cold enough that biological activity stalls and readings drift.';
        if (v.conductivity < 100) return 'Conductivity is only ' + Math.round(v.conductivity) + ' µS/cm, unusually pure for a stream in this county.';
        if (v.oxygen < 7) return 'Dissolved oxygen sits at ' + v.oxygen.toFixed(1) + ' mg/L, workable for most fish but with no margin left.';
        if (v.turbidity > 10) return 'Turbidity is ' + Math.round(v.turbidity) + ' NTU, cloudy but within what a healthy pond carries after rain.';
        return 'Every parameter sits inside the healthy range for a freshwater pond.';
    }

    function initProbe() {
        var root = $('.probe');
        if (!root) return;

        var canvas = $('.probe__canvas', root);
        var ctx = canvas.getContext('2d');
        var numEl = $('.readout__num', root);
        var gradeEl = $('.readout__grade', root);
        var needle = $('.readout__needle', root);
        var reportEl = $('.readout__report-text', root);
        var readout = $('.probe__readout', root);

        var state = {};
        var inputs = {};
        var outputs = {};

        PARAMS.forEach(function (key) {
            inputs[key] = $('#s-' + key, root);
            outputs[key] = $('#o-' + key, root);
            state[key] = parseFloat(inputs[key].value);
        });

        var visual = { score: 0, tint: '#46D2AC', turbidity: 0, oxygen: 9 };

        function fillTrack(input) {
            var min = parseFloat(input.min), max = parseFloat(input.max);
            var pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
            input.style.setProperty('--fill', pct + '%');
        }

        function evaluate() {
            var total = 0;
            PARAMS.forEach(function (key) {
                total += SCORE[key](state[key]) * WEIGHT[key];
            });
            var score = Math.round(clamp(total, 0, 100));
            var grade = GRADES.find(function (g) { return score >= g.min; });

            numEl.textContent = score;
            gradeEl.textContent = grade.name;
            readout.style.setProperty('--grade-color', grade.color);
            needle.style.left = clamp(score, 2, 98) + '%';
            reportEl.textContent = 'Water quality reads ' + grade.name + ' at ' + score +
                ' out of 100. ' + diagnose(state);

            visual.score = score;
            visual.tint = grade.color;
            visual.turbidity = state.turbidity;
            visual.oxygen = state.oxygen;
            visual.temp = state.temp;
            if (reduceMotion) drawColumn(0);
        }

        function syncUI() {
            PARAMS.forEach(function (key) {
                outputs[key].textContent = FORMAT[key](state[key]);
                fillTrack(inputs[key]);
            });
            evaluate();
        }

        PARAMS.forEach(function (key) {
            inputs[key].addEventListener('input', function () {
                state[key] = parseFloat(inputs[key].value);
                outputs[key].textContent = FORMAT[key](state[key]);
                fillTrack(inputs[key]);
                clearPresets();
                evaluate();
            });
        });

        var chips = $$('.chip', root);
        function clearPresets() {
            chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var preset = PRESETS[chip.dataset.preset];
                if (!preset) return;
                clearPresets();
                chip.setAttribute('aria-pressed', 'true');
                PARAMS.forEach(function (key) {
                    state[key] = preset[key];
                    inputs[key].value = preset[key];
                    outputs[key].textContent = FORMAT[key](state[key]);
                    fillTrack(inputs[key]);
                });
                evaluate();
            });
        });

        /* --- Water column --------------------------------- */

        var W = canvas.width, H = canvas.height;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        var particles = [];
        var bubbles = [];
        for (var i = 0; i < 240; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 0.5 + Math.random() * 1.8,
                drift: 0.06 + Math.random() * 0.22,
                sway: Math.random() * Math.PI * 2,
                swaySpeed: 0.0004 + Math.random() * 0.0011
            });
        }
        for (var j = 0; j < 40; j++) {
            bubbles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 0.7 + Math.random() * 1.9,
                rise: 0.25 + Math.random() * 0.7,
                sway: Math.random() * Math.PI * 2
            });
        }

        function hexToRgb(hex) {
            var n = parseInt(hex.slice(1), 16);
            return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
        }
        function mix(a, b, t) {
            var A = hexToRgb(a), B = hexToRgb(b);
            return [
                Math.round(A[0] + (B[0] - A[0]) * t),
                Math.round(A[1] + (B[1] - A[1]) * t),
                Math.round(A[2] + (B[2] - A[2]) * t)
            ];
        }
        function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

        var SURFACE = 34;

        function drawColumn(t) {
            var turb = visual.turbidity;
            var murk = clamp(Math.log10(Math.max(turb, 1)) / 2.3, 0, 1); // 0 clear → 1 opaque
            var tint = visual.tint;

            ctx.clearRect(0, 0, W, H);

            // Body of water: tinted at the surface, losing light with depth
            var top = mix('#0B2B36', tint, 0.30 + murk * 0.30);
            var bottom = mix('#04121A', tint, 0.05 + murk * 0.18);
            var grad = ctx.createLinearGradient(0, SURFACE, 0, H);
            grad.addColorStop(0, rgba(top, 0.95));
            grad.addColorStop(1, rgba(bottom, 1));
            ctx.fillStyle = grad;
            ctx.fillRect(0, SURFACE, W, H - SURFACE);

            // Air above the surface
            ctx.fillStyle = '#061620';
            ctx.fillRect(0, 0, W, SURFACE);

            // Light shaft — attenuates with turbidity, the clearest read of clarity
            var reach = H * (1 - murk * 0.82);
            var shaft = ctx.createLinearGradient(0, SURFACE, 0, SURFACE + reach);
            shaft.addColorStop(0, 'rgba(190, 240, 250, ' + (0.16 - murk * 0.06).toFixed(3) + ')');
            shaft.addColorStop(1, 'rgba(190, 240, 250, 0)');
            ctx.fillStyle = shaft;
            ctx.beginPath();
            ctx.moveTo(W * 0.18, SURFACE);
            ctx.lineTo(W * 0.62, SURFACE);
            ctx.lineTo(W * 0.86, SURFACE + reach);
            ctx.lineTo(W * 0.02, SURFACE + reach);
            ctx.closePath();
            ctx.fill();

            // Suspended solids
            var count = Math.round(clamp(turb / 200, 0, 1) * particles.length);
            var pColor = mix('#C9D6DA', tint, 0.35);
            for (var i = 0; i < count; i++) {
                var p = particles[i];
                if (!reduceMotion) {
                    p.y += p.drift;
                    p.sway += p.swaySpeed * 16;
                    if (p.y > H) { p.y = SURFACE; p.x = Math.random() * W; }
                }
                var px = p.x + Math.sin(p.sway) * 7;
                ctx.beginPath();
                ctx.arc(px, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = rgba(pColor, 0.42);
                ctx.fill();
            }

            // Dissolved oxygen, read as bubble activity
            var bCount = Math.round(clamp(visual.oxygen / 14, 0, 1) * bubbles.length);
            for (var b = 0; b < bCount; b++) {
                var o = bubbles[b];
                if (!reduceMotion) {
                    o.y -= o.rise;
                    o.sway += 0.02;
                    if (o.y < SURFACE) { o.y = H + Math.random() * 40; o.x = Math.random() * W; }
                }
                ctx.beginPath();
                ctx.arc(o.x + Math.sin(o.sway) * 4, o.y, o.r, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(200, 240, 250, 0.35)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            // Surface line
            ctx.beginPath();
            for (var x = 0; x <= W; x += 4) {
                var y = SURFACE
                    + Math.sin(x * 0.045 + t * 0.0016) * 2.4
                    + Math.sin(x * 0.11 + t * 0.0029) * 1.1;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = rgba(mix('#EAF2F3', tint, 0.5), 0.75);
            ctx.lineWidth = 1.4;
            ctx.stroke();

            // Depth rules
            ctx.strokeStyle = 'rgba(255,255,255,0.07)';
            ctx.lineWidth = 1;
            for (var d = 1; d < 4; d++) {
                var dy = SURFACE + ((H - SURFACE) / 3) * d;
                ctx.beginPath();
                ctx.moveTo(0, dy);
                ctx.lineTo(W, dy);
                ctx.stroke();
            }
        }

        function loop(t) { drawColumn(t); requestAnimationFrame(loop); }

        syncUI();
        if (reduceMotion) drawColumn(0); else requestAnimationFrame(loop);
    }

    /* ── 4. Watershed chart ────────────────────────────── */

    var REACHES = [
        {
            name: 'Potomac River', where: 'Great Falls to Mount Vernon', basin: 'Potomac mainstem',
            path: [[39.000, -77.250], [38.965, -77.160], [38.935, -77.120], [38.905, -77.065],
            [38.892, -77.055], [38.885, -77.040], [38.870, -77.020], [38.850, -77.030],
            [38.800, -77.045], [38.710, -77.040], [38.600, -77.150]]
        },
        {
            name: 'Goose Creek', where: 'Middleburg to Belmont', basin: 'Loudoun tributary',
            path: [[38.980, -77.700], [39.010, -77.650], [39.030, -77.600], [39.050, -77.550],
            [39.070, -77.500], [39.085, -77.460]]
        },
        {
            name: 'Broad Run', where: 'Arcola to Kincora', basin: 'Loudoun tributary',
            path: [[38.980, -77.580], [39.020, -77.500], [39.050, -77.450], [39.070, -77.440]]
        },
        {
            name: 'Difficult Run', where: 'Oakton to Great Falls Park', basin: 'Fairfax tributary',
            path: [[38.880, -77.320], [38.930, -77.300], [38.980, -77.250]]
        },
        {
            name: 'Occoquan River', where: 'Manassas to Occoquan Bay', basin: 'Potomac tributary',
            path: [[38.750, -77.450], [38.720, -77.380], [38.700, -77.300], [38.680, -77.260], [38.650, -77.220]]
        },
        {
            name: 'Bull Run', where: 'Bull Run Mountains to Manassas Park', basin: 'Occoquan tributary',
            path: [[38.940, -77.650], [38.880, -77.550], [38.820, -77.450], [38.720, -77.380]]
        },
        {
            name: 'Anacostia River', where: 'Bladensburg to Buzzard Point', basin: 'Potomac tributary',
            path: [[38.940, -76.930], [38.910, -76.960], [38.875, -76.990], [38.865, -77.015], [38.855, -77.020]]
        },
        {
            name: 'Rock Creek', where: 'Rockville to Georgetown', basin: 'Potomac tributary',
            path: [[39.050, -77.100], [38.980, -77.060], [38.940, -77.050], [38.905, -77.055]]
        },
        {
            name: 'Monocacy River', where: 'Thurmont to the Potomac confluence', basin: 'Potomac tributary',
            path: [[39.710, -77.220], [39.600, -77.250], [39.420, -77.400], [39.350, -77.420], [39.220, -77.450]]
        }
    ];

    // A few Loudoun towns central to the project. Everything else on the
    // map — DC, Rockville, Alexandria, road/place context — comes from the
    // OSM basemap itself, so we don't duplicate its own labels.
    var PLACES = [
        { name: 'Leesburg', lat: 39.115, lng: -77.564 },
        { name: 'Ashburn', lat: 39.043, lng: -77.487 },
        { name: 'Middleburg', lat: 38.968, lng: -77.736 }
    ];

    var DMV_BOUNDS = [[38.3, -78.1], [39.6, -76.4]];
    var DMV_CENTER = [38.92, -77.25];

    function initChart() {
        var container = document.getElementById('watershed-map');
        if (!container || typeof L === 'undefined') return;

        var bounds = L.latLngBounds(DMV_BOUNDS);
        var map = L.map(container, {
            center: DMV_CENTER,
            zoom: 9,
            minZoom: 8,
            maxZoom: 15,
            maxBounds: bounds.pad(0.05),
            maxBoundsViscosity: 1,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            tap: false
        });

        // The official OpenStreetMap tile server — free forever, no
        // account or API key. In exchange it asks for light traffic and
        // visible attribution, both of which fit a small project site.
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            subdomains: 'abc',
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

        // Gate interaction behind an explicit click/tap so the map never
        // steals page scroll or a touch swipe from someone just reading.
        var gate = $('.map-activate', container.parentElement);
        function activate() {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.touchZoom.enable();
            map.tap && map.tap.enable();
            if (gate) gate.classList.add('is-hidden');
        }
        if (gate) {
            gate.addEventListener('click', activate);
        } else {
            activate();
        }

        var panelTitle = $('.chart__panel-title');
        var panelBody = $('.chart__panel-body');
        var panelStats = $('.chart__stats');
        var statusText = $('.chart__status-text');
        var picker = document.getElementById('reach-select');

        var PENDING = '#6C858D';
        var ACTIVE = '#0E6B85';
        var active = null;

        REACHES.forEach(function (reach, idx) {
            var latlngs = reach.path.map(function (p) { return [p[0], p[1]]; });

            reach.km = 0;
            for (var i = 1; i < latlngs.length; i++) {
                reach.km += map.distance(latlngs[i - 1], latlngs[i]) / 1000;
            }

            var line = L.polyline(latlngs, {
                color: PENDING, weight: 4, opacity: 0.85,
                lineCap: 'round', lineJoin: 'round'
            }).addTo(map);

            line.bindTooltip(reach.name, { className: 'reach-tooltip', sticky: true, direction: 'top' });

            function select(fly) {
                if (active && active !== line) active.setStyle({ color: PENDING, weight: 4 });
                line.setStyle({ color: ACTIVE, weight: 6 });
                line.bringToFront();
                active = line;

                if (fly !== false) {
                    map.flyToBounds(line.getBounds(), { padding: [48, 48], duration: reduceMotion ? 0 : 0.6 });
                }

                panelTitle.textContent = reach.name;
                panelBody.textContent = reach.where + '. We can reach this on foot or by bike, which is the ' +
                    'only reason it is on the list.';
                panelStats.innerHTML = '';
                [
                    ['Basin', reach.basin],
                    ['Reach length', reach.km.toFixed(1) + ' km'],
                    ['Waypoints', String(reach.path.length)],
                    ['Readings', '0']
                ].forEach(function (row) {
                    var div = document.createElement('div');
                    var dt = document.createElement('dt');
                    var dd = document.createElement('dd');
                    dt.textContent = row[0];
                    dd.textContent = row[1];
                    div.appendChild(dt);
                    div.appendChild(dd);
                    panelStats.appendChild(div);
                });
                statusText.textContent = 'Sampling planned · not yet measured';
                if (picker) picker.value = String(idx);
            }

            line.on('click', function () {
                activate();
                select(true);
            });

            reach.select = select;

            if (picker) {
                var opt = document.createElement('option');
                opt.value = String(idx);
                opt.textContent = reach.name;
                picker.appendChild(opt);
            }
        });

        // Keyboard- and screen-reader-friendly way to pick a reach without
        // needing to target a thin line drawn on a map.
        if (picker) {
            picker.addEventListener('change', function () {
                var reach = REACHES[+picker.value];
                if (reach && reach.select) { activate(); reach.select(true); }
            });
        }

        PLACES.forEach(function (p) {
            L.circleMarker([p.lat, p.lng], {
                radius: 4, color: '#0B1F2A', weight: 1, fillColor: '#0B1F2A', fillOpacity: 0.7
            }).addTo(map).bindTooltip(p.name, {
                permanent: true, direction: 'right', offset: [6, 0], className: 'reach-tooltip'
            });
        });

        if (REACHES[0].select) REACHES[0].select(false);

        setTimeout(function () { map.invalidateSize(); }, 300);
        window.addEventListener('resize', function () { map.invalidateSize(); });
    }

    /* ── 5. Scroll reveal ──────────────────────────────── */

    function initReveal() {
        if (reduceMotion || !('IntersectionObserver' in window)) return;

        var all = $$('.sec-head, .prose, .plan__item, .probe__column, .probe__panel, .probe__readout, .chart, .legend, .log__phase, .roster, .action, .cta');

        // Only hide what is genuinely below the fold. Anything already on
        // screen stays visible, so landing mid-page never shows a blank band.
        var fold = window.innerHeight * 0.92;
        var hidden = all.filter(function (t) { return t.getBoundingClientRect().top > fold; });
        hidden.forEach(function (t) { t.classList.add('reveal'); });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

        hidden.forEach(function (t) { io.observe(t); });

        // Safety net: nothing stays invisible because an observer misfired.
        setTimeout(function () {
            hidden.forEach(function (t) {
                if (t.getBoundingClientRect().top < window.innerHeight) t.classList.add('is-in');
            });
        }, 1200);
    }

    /* ── Boot ──────────────────────────────────────────── */

    function boot() {
        initMasthead();
        initHero();
        initProbe();
        initChart();
        initReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
