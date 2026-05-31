/* ============================================
   KUMAR ABHINAV - PORTFOLIO INTERACTIONS
   Canvas globe, cursor, tilt, meters, research reader
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initHexGrid();
    initNavbar();
    initSmoothScroll();
    initScrollReveal();
    initCyberCursor();
    initGlitchTitle();
    initGlobe();
    initTiltCards();
    initSkillMeters();
    initImageFallback();
    initPortfolioResearchFlag();
    initResearchHub();
});

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches;

/* === PARTICLE NETWORK BACKGROUND === */
function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const mouse = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;
    let particles = [];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(Math.floor((width * height) / 15000), 110);
        particles = Array.from({ length: count }, () => new Particle());
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.32;
            this.vy = (Math.random() - 0.5) * 0.32;
            this.radius = Math.random() * 1.4 + 0.45;
            this.opacity = Math.random() * 0.38 + 0.1;
            this.color = [
                [0, 212, 255],
                [168, 85, 247],
                [40, 216, 157]
            ][Math.floor(Math.random() * 3)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0 && dist < 130 && !prefersReducedMotion()) {
                const force = (130 - dist) / 130;
                this.vx += (dx / dist) * force * 0.12;
                this.vy += (dy / dist) * force * 0.12;
            }

            this.vx *= 0.99;
            this.vy *= 0.99;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist < 138) {
                    const opacity = ((138 - dist) / 138) * 0.1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((particle) => {
            if (!prefersReducedMotion()) particle.update();
            particle.draw();
        });
        drawConnections();
        requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }, { passive: true });

    window.addEventListener("resize", resize, { passive: true });
    resize();
    animate();
}

/* === DYNAMIC HEX GRID === */
function initHexGrid() {
    const canvas = document.getElementById("hex-grid-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const mouse = { x: -1000, y: -1000 };
    const centers = [];
    const pulses = [];
    const size = 34;
    let width = 0;
    let height = 0;
    let lastPulse = 0;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        centers.length = 0;
        const h = Math.sqrt(3) * size;
        for (let y = -h; y < height + h; y += h) {
            const row = Math.round(y / h);
            for (let x = -size; x < width + size * 2; x += size * 1.5) {
                centers.push({ x: x + (row % 2 ? size * 0.75 : 0), y });
            }
        }
    }

    function hexPath(x, y) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 6 + i * Math.PI / 3;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    function addPulse(time) {
        if (!centers.length) return;
        const nearMouse = centers.filter((center) => Math.hypot(center.x - mouse.x, center.y - mouse.y) < 210);
        const source = nearMouse.length && Math.random() < 0.72 ? nearMouse : centers;
        const center = source[Math.floor(Math.random() * source.length)];
        pulses.push({
            x: center.x,
            y: center.y,
            start: time,
            color: Math.random() > 0.48 ? "0, 212, 255" : "168, 85, 247"
        });
    }

    function draw(time) {
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 0.7;
        centers.forEach((center) => {
            hexPath(center.x, center.y);
            ctx.strokeStyle = "rgba(0, 212, 255, 0.035)";
            ctx.stroke();
        });

        if (!prefersReducedMotion() && time - lastPulse > (Math.hypot(mouse.x + 1000, mouse.y + 1000) < 20 ? 420 : 90)) {
            const pulseCount = centers.some((center) => Math.hypot(center.x - mouse.x, center.y - mouse.y) < 210) ? 3 : 1;
            for (let i = 0; i < pulseCount; i++) addPulse(time);
            lastPulse = time;
        }

        for (let i = pulses.length - 1; i >= 0; i--) {
            const pulse = pulses[i];
            const age = time - pulse.start;
            const life = 950;
            if (age > life) {
                pulses.splice(i, 1);
                continue;
            }
            const alpha = 1 - age / life;
            hexPath(pulse.x, pulse.y);
            ctx.fillStyle = `rgba(${pulse.color}, ${alpha * 0.08})`;
            ctx.strokeStyle = `rgba(${pulse.color}, ${alpha * 0.46})`;
            ctx.lineWidth = 1.1 + alpha * 1.6;
            ctx.fill();
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    resize();
    requestAnimationFrame(draw);
}

/* === NAVBAR === */
function initNavbar() {
    const navbar = document.getElementById("navbar");
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");
    if (!navbar) return;

    const update = () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
        updateActiveNav();
    };

    window.addEventListener("scroll", update, { passive: true });
    update();

    if (toggle && links) {
        toggle.addEventListener("click", () => {
            const isOpen = links.classList.toggle("active");
            toggle.classList.toggle("open", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        links.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                links.classList.remove("active");
                toggle.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }
}

function updateActiveNav() {
    const sections = document.querySelectorAll(".section, .hero");
    const navLinks = document.querySelectorAll(".nav-link[data-text]");
    let current = "";

    sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 210) {
            current = section.id;
        }
    });

    navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        link.classList.toggle("active-link", href === `#${current}`);
    });
}

/* === SMOOTH SCROLL === */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") return;
            const target = document.querySelector(targetId);
            if (!target) return;
            event.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - 80,
                behavior: prefersReducedMotion() ? "auto" : "smooth"
            });
        });
    });
}

/* === SCROLL REVEAL === */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        ".section-label, .section-title, .section-subtitle, .about-left, .about-right, .manifesto-item, " +
        ".project-card, .arsenal-category, .tl-item, .research-card, .contact-layout, .featured-article, " +
        ".filter-bar, .article-card"
    );

    revealElements.forEach((element) => element.classList.add("reveal"));

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    revealElements.forEach((element) => observer.observe(element));
}

/* === CUSTOM CYBER CURSOR === */
function initCyberCursor() {
    if (isCoarsePointer()) return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };

    window.addEventListener("mousemove", (event) => {
        target.x = event.clientX;
        target.y = event.clientY;
        dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
        document.body.classList.add("cursor-ready");

        const hover = event.target.closest("button, .cta-btn, .project-card, .filter-btn, .read-btn, .back-btn, a");
        document.body.classList.toggle("cursor-button", Boolean(hover && (hover.tagName === "BUTTON" || hover.classList.contains("cta-btn") || hover.classList.contains("project-card") || hover.classList.contains("filter-btn") || hover.classList.contains("read-btn") || hover.classList.contains("back-btn"))));
        document.body.classList.toggle("cursor-link", Boolean(hover && hover.tagName === "A" && !hover.classList.contains("cta-btn")));
    }, { passive: true });

    function animate() {
        current.x += (target.x - current.x) * 0.18;
        current.y += (target.y - current.y) * 0.18;
        ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    }

    animate();
}

/* === HERO GLITCH EFFECT === */
function initGlitchTitle() {
    const title = document.querySelector(".glitch-title");
    if (!title || prefersReducedMotion()) return;

    requestAnimationFrame(() => {
        title.classList.add("glitch-run");
        window.setTimeout(() => {
            title.classList.remove("glitch-run");
            title.classList.add("glitch-settled");
        }, 520);
    });

    title.addEventListener("mouseenter", () => {
        title.classList.remove("glitch-run");
        void title.offsetWidth;
        title.classList.add("glitch-run");
    });
}

/* === CANVAS WIRE GLOBE === */
function initGlobe() {
    const canvas = document.getElementById("globe-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const threats = [
        { lat: 0.22, lon: 0.4, speed: 0.65, phase: 0 },
        { lat: -0.48, lon: 2.2, speed: 0.48, phase: 1.2 },
        { lat: 0.72, lon: 4.1, speed: 0.38, phase: 2.6 },
        { lat: -0.08, lon: 5.3, speed: 0.55, phase: 3.7 }
    ];
    let size = 320;
    let angle = 0;
    let hover = false;
    let last = performance.now();

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        size = Math.max(220, Math.round(rect.width || 320));
        canvas.width = Math.floor(size * dpr);
        canvas.height = Math.floor(size * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function project(lat, lon, radius) {
        const x = Math.cos(lat) * Math.sin(lon) * radius;
        const y = Math.sin(lat) * radius;
        const z = Math.cos(lat) * Math.cos(lon) * radius;

        const cosY = Math.cos(angle);
        const sinY = Math.sin(angle);
        const rotatedX = x * cosY + z * sinY;
        const rotatedZ = -x * sinY + z * cosY;

        const tilt = -0.32;
        const cosX = Math.cos(tilt);
        const sinX = Math.sin(tilt);
        const tiltedY = y * cosX - rotatedZ * sinX;
        const tiltedZ = y * sinX + rotatedZ * cosX;

        const focal = 430;
        const scale = focal / (focal - tiltedZ);
        return {
            x: size / 2 + rotatedX * scale,
            y: size / 2 + tiltedY * scale,
            z: tiltedZ,
            scale
        };
    }

    function drawPolyline(points, alphaBase) {
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        const avgZ = points.reduce((sum, point) => sum + point.z, 0) / points.length;
        const alpha = alphaBase + Math.max(0, avgZ / 160) * 0.1;
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.lineWidth = 0.62;
        ctx.stroke();
    }

    function draw(time) {
        const delta = Math.min(40, time - last);
        last = time;
        const motionScale = prefersReducedMotion() ? 0.08 : 1;
        const speed = (hover ? 0.00115 : 0.00055) * (isCoarsePointer() ? 0.55 : 1) * motionScale;
        angle += delta * speed;

        ctx.clearRect(0, 0, size, size);
        const radius = size * 0.36;

        const gradient = ctx.createRadialGradient(size / 2, size / 2, radius * 0.18, size / 2, size / 2, radius * 1.18);
        gradient.addColorStop(0, "rgba(0, 212, 255, 0.05)");
        gradient.addColorStop(0.72, "rgba(0, 212, 255, 0.018)");
        gradient.addColorStop(1, "rgba(0, 212, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius * 1.16, 0, Math.PI * 2);
        ctx.fill();

        for (let latDeg = -60; latDeg <= 60; latDeg += 20) {
            const lat = latDeg * Math.PI / 180;
            const points = [];
            for (let lonStep = 0; lonStep <= 96; lonStep++) {
                points.push(project(lat, (lonStep / 96) * Math.PI * 2, radius));
            }
            drawPolyline(points, 0.09);
        }

        for (let lonDeg = 0; lonDeg < 360; lonDeg += 20) {
            const lon = lonDeg * Math.PI / 180;
            const points = [];
            for (let latStep = -48; latStep <= 48; latStep++) {
                points.push(project((latStep / 48) * Math.PI / 2, lon, radius));
            }
            drawPolyline(points, 0.075);
        }

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 212, 255, 0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();

        threats.forEach((threat, index) => {
            const lon = threat.lon + time * 0.00025 * threat.speed * motionScale;
            const point = project(threat.lat, lon, radius);
            const visible = point.z > -radius * 0.55;
            const alpha = visible ? 0.85 : 0.24;
            const pulse = (Math.sin(time * 0.004 + threat.phase) + 1) / 2;
            const dot = (3.8 + pulse * 1.6) * point.scale;
            const ring = (9 + pulse * 15 + index) * point.scale;

            ctx.beginPath();
            ctx.arc(point.x, point.y, ring, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 51, 88, ${alpha * (0.24 - pulse * 0.12)})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(point.x, point.y, dot, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 51, 88, ${alpha})`;
            ctx.shadowBlur = 16;
            ctx.shadowColor = "rgba(255, 51, 88, 0.9)";
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(draw);
    }

    canvas.addEventListener("mouseenter", () => { hover = true; });
    canvas.addEventListener("mouseleave", () => { hover = false; });
    window.addEventListener("resize", resize, { passive: true });
    resize();
    requestAnimationFrame(draw);
}

/* === CSS 3D TILT CARDS === */
function initTiltCards() {
    if (isCoarsePointer() || prefersReducedMotion()) return;

    const tiltElements = document.querySelectorAll(".tilt-card, .project-card, .character-container");
    tiltElements.forEach((element) => {
        element.addEventListener("mousemove", (event) => {
            const rect = element.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            const maxTilt = element.classList.contains("project-card") ? 8 : 7;
            const rotateY = (x - 0.5) * maxTilt * 2;
            const rotateX = (0.5 - y) * maxTilt * 2;

            element.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`);
            element.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`);
            element.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
            element.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);

            if (element.classList.contains("project-card")) {
                element.style.setProperty("--parallax-x", `${((0.5 - x) * 12).toFixed(2)}px`);
                element.style.setProperty("--parallax-y", `${((0.5 - y) * 12).toFixed(2)}px`);
            }
        });

        element.addEventListener("mouseleave", () => {
            element.style.setProperty("--rotate-x", "0deg");
            element.style.setProperty("--rotate-y", "0deg");
            element.style.setProperty("--glow-x", "50%");
            element.style.setProperty("--glow-y", "50%");
            element.style.setProperty("--parallax-x", "0px");
            element.style.setProperty("--parallax-y", "0px");
        });
    });
}

/* === ANIMATED RADIAL SKILL METERS === */
function initSkillMeters() {
    const meters = document.querySelectorAll(".skill-meter");
    if (!meters.length) return;

    const circumference = 2 * Math.PI * 32;

    meters.forEach((meter) => {
        const circle = meter.querySelector(".meter-progress");
        if (!circle) return;
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
    });

    function animateMeter(meter) {
        if (meter.dataset.animated === "true") return;
        meter.dataset.animated = "true";
        const circle = meter.querySelector(".meter-progress");
        const label = meter.querySelector("span");
        const value = Number(meter.dataset.value || 0);
        const offset = circumference * (1 - value / 100);

        if (prefersReducedMotion()) {
            circle.style.strokeDashoffset = `${offset}`;
            if (label) label.textContent = `${value}%`;
            return;
        }

        const start = performance.now();
        const duration = 1050;
        circle.style.strokeDashoffset = `${offset}`;

        function count(now) {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            if (label) label.textContent = `${Math.round(value * eased)}%`;
            if (progress < 1) requestAnimationFrame(count);
        }
        requestAnimationFrame(count);
    }

    if (!("IntersectionObserver" in window)) {
        meters.forEach(animateMeter);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateMeter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    meters.forEach((meter) => observer.observe(meter));
}

/* === CHARACTER IMAGE FALLBACK === */
function initImageFallback() {
    document.querySelectorAll(".character-img").forEach((image) => {
        const markMissing = () => image.classList.add("missing");
        image.addEventListener("error", markMissing);
        if (image.complete && image.naturalWidth === 0) markMissing();
    });
}

/* === PORTFOLIO TO RESEARCH NAV FLAG === */
function initPortfolioResearchFlag() {
    if (document.body.dataset.page !== "portfolio") return;
    document.querySelectorAll(".portfolio-to-research").forEach((link) => {
        link.addEventListener("click", () => {
            sessionStorage.setItem("fromPortfolio", "true");
        });
    });
}

/* === RESEARCH HUB FILTERS AND READER === */
function initResearchHub() {
    if (document.body.dataset.page !== "research") return;

    const breadcrumb = document.querySelector("[data-portfolio-breadcrumb]");
    if (breadcrumb) {
        breadcrumb.textContent = sessionStorage.getItem("fromPortfolio") === "true" ? "<- Back to Portfolio" : "<- Portfolio";
    }

    const filterButtons = document.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll("[data-article-card]");
    const reader = document.querySelector("[data-reader]");
    const readerHeader = document.querySelector("[data-reader-header]");
    const readerBody = document.querySelector("[data-reader-body]");
    const backButtons = document.querySelectorAll("[data-reader-back]");

    function setFilter(filter) {
        filterButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.filter === filter);
        });
        cards.forEach((card) => {
            const visible = filter === "All" || card.dataset.category === filter;
            card.classList.toggle("is-hidden", !visible);
        });
    }

    function openArticle(id, updateHash = true) {
        const template = document.getElementById(`article-${id}`);
        const sourceCard = document.querySelector(`[data-article-card="${id}"]`);
        if (!template || !reader || !readerHeader || !readerBody || !sourceCard) return;

        const title = sourceCard.querySelector("h3")?.textContent || "Research Article";
        const category = sourceCard.dataset.category || "Research";
        const date = sourceCard.dataset.date || "";
        const read = sourceCard.dataset.read || "";

        readerHeader.innerHTML = `
            <span class="article-category">${category}</span>
            <h1>${title}</h1>
            <div class="article-meta"><span>Kumar Abhinav</span><span>${date}</span><span>${read}</span></div>
        `;
        readerBody.innerHTML = template.innerHTML;
        document.body.classList.add("reader-open");
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
        if (updateHash) history.replaceState(null, "", `#${id}`);
    }

    function closeArticle() {
        document.body.classList.remove("reader-open");
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
        history.replaceState(null, "", window.location.pathname);
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => setFilter(button.dataset.filter));
    });

    document.querySelectorAll("[data-open-article]").forEach((button) => {
        button.addEventListener("click", () => openArticle(button.dataset.openArticle));
    });

    backButtons.forEach((button) => button.addEventListener("click", closeArticle));

    setFilter("All");
    const initialId = window.location.hash.replace("#", "");
    if (initialId && document.getElementById(`article-${initialId}`)) {
        openArticle(initialId, false);
    }
}
