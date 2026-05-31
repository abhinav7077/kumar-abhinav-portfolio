/* ============================================
   KUMAR ABHINAV — Portfolio v3 JavaScript
   Globe, Particles, Tilt, Cursor, Hex Grid,
   Glitch, Skill Meters, All Interactions
   ============================================ */

const IS_TOUCH = 'ontouchstart' in window;
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
    if (!PREFERS_REDUCED) {
        initParticles();
        initHexGrid();
        initGlobe();
        if (!IS_TOUCH) initCustomCursor();
        initGlitchEffect();
    }
    initNavbar();
    initScrollReveal();
    initSmoothScroll();
    initSkillMeters();
    if (!IS_TOUCH && !PREFERS_REDUCED) {
        initFloatCardTilt();
        initProjectCardTilt();
    }
});

/* ============================
   PARTICLE NETWORK BACKGROUND
   ============================ */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class P {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.r = Math.random() * 1.5 + 0.5;
            this.o = Math.random() * 0.5 + 0.1;
            const cols = [{r:0,g:212,b:255},{r:168,g:85,b:247},{r:34,g:211,b:167}];
            this.c = cols[Math.floor(Math.random() * cols.length)];
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            const dx = this.x - mouse.x, dy = this.y - mouse.y, d = Math.sqrt(dx*dx+dy*dy);
            if (d < 120) { const f = (120-d)/120; this.vx += (dx/d)*f*0.15; this.vy += (dy/d)*f*0.15; }
            this.vx *= 0.99; this.vy *= 0.99;
            if (this.x < 0) this.x = w; if (this.x > w) this.x = 0;
            if (this.y < 0) this.y = h; if (this.y > h) this.y = 0;
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(${this.c.r},${this.c.g},${this.c.b},${this.o})`; ctx.fill();
        }
    }

    const count = Math.min(Math.floor((w*h)/14000), 100);
    particles = Array.from({length: count}, () => new P());

    function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i+1; j < particles.length; j++) {
                const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
                const d = Math.sqrt(dx*dx+dy*dy);
                if (d < 130) {
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,212,255,${((130-d)/130)*0.1})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

/* ============================
   HEX GRID BACKGROUND
   ============================ */
function initHexGrid() {
    const canvas = document.getElementById('hex-grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    const hexSize = 30;
    const hexH = hexSize * Math.sqrt(3);
    const hexW = hexSize * 2;
    const pulses = [];

    function drawHex(cx, cy, size, alpha) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = cx + size * Math.cos(angle);
            const y = cy + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
    }

    function addPulse(cx, cy) {
        const colors = ['rgba(0,212,255,', 'rgba(168,85,247,'];
        pulses.push({ x: cx, y: cy, life: 1, color: colors[Math.floor(Math.random()*2)] });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, w, h);
        frame++;

        const cols = Math.ceil(w / (hexW * 0.75)) + 2;
        const rows = Math.ceil(h / hexH) + 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cx = col * hexW * 0.75;
                const cy = row * hexH + (col % 2 ? hexH / 2 : 0);
                const dx = cx - mouse.x, dy = cy - mouse.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const nearMouse = dist < 200;

                drawHex(cx, cy, hexSize, 0.02);

                // Random pulses near mouse
                if (nearMouse && Math.random() < 0.002) {
                    addPulse(cx, cy);
                } else if (Math.random() < 0.0002) {
                    addPulse(cx, cy);
                }
            }
        }

        // Draw pulses
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i];
            p.life -= 0.015;
            if (p.life <= 0) { pulses.splice(i, 1); continue; }
            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 3) * j - Math.PI / 6;
                const x = p.x + hexSize * Math.cos(angle);
                const y = p.y + hexSize * Math.sin(angle);
                if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = p.color + (p.life * 0.15) + ')';
            ctx.fill();
            ctx.strokeStyle = p.color + (p.life * 0.4) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }
    animate();
}

/* ============================
   3D WIREFRAME GLOBE
   ============================ */
function initGlobe() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 320;
    canvas.width = size; canvas.height = size;
    const cx = size / 2, cy = size / 2, radius = 130;

    let rotY = 0;
    let speed = 0.003;
    let isHover = false;

    const container = canvas.closest('.character-container');
    if (container) {
        container.addEventListener('mouseenter', () => isHover = true);
        container.addEventListener('mouseleave', () => isHover = false);
    }

    // Threat pulse dots
    const threats = [
        { lat: 0.5, lng: 0, color: '#ff4444', phase: 0 },
        { lat: -0.3, lng: 2.1, color: '#ff6644', phase: 1.5 },
        { lat: 0.8, lng: 4.2, color: '#ff4444', phase: 3 },
        { lat: -0.6, lng: 5.5, color: '#ff8844', phase: 4.5 },
    ];

    function project(lat, lng) {
        const cosLat = Math.cos(lat);
        const x3d = radius * cosLat * Math.cos(lng + rotY);
        const y3d = radius * Math.sin(lat);
        const z3d = radius * cosLat * Math.sin(lng + rotY);
        // Only draw front-facing points
        if (z3d < 0) return null;
        return { x: cx + x3d, y: cy - y3d, z: z3d };
    }

    function drawGlobe() {
        ctx.clearRect(0, 0, size, size);
        const currentSpeed = isHover ? speed * 2.5 : speed;
        rotY += currentSpeed;

        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 0.6;

        // Latitude lines
        for (let lat = -Math.PI/2 + 0.3; lat < Math.PI/2; lat += 0.35) {
            ctx.beginPath();
            let started = false;
            for (let lng = 0; lng <= Math.PI * 2; lng += 0.08) {
                const p = project(lat, lng);
                if (p) {
                    if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                    else ctx.lineTo(p.x, p.y);
                } else { started = false; }
            }
            ctx.stroke();
        }

        // Longitude lines
        for (let lng = 0; lng < Math.PI * 2; lng += 0.4) {
            ctx.beginPath();
            let started = false;
            for (let lat = -Math.PI/2; lat <= Math.PI/2; lat += 0.08) {
                const p = project(lat, lng);
                if (p) {
                    if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                    else ctx.lineTo(p.x, p.y);
                } else { started = false; }
            }
            ctx.stroke();
        }

        // Equator (brighter)
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        let started = false;
        for (let lng = 0; lng <= Math.PI * 2; lng += 0.05) {
            const p = project(0, lng);
            if (p) {
                if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                else ctx.lineTo(p.x, p.y);
            } else { started = false; }
        }
        ctx.stroke();

        // Threat dots
        const time = Date.now() / 1000;
        threats.forEach(t => {
            const pulseLng = t.lng + time * 0.5 + t.phase;
            const p = project(t.lat, pulseLng);
            if (p) {
                const pulseSize = 3 + Math.sin(time * 3 + t.phase) * 1.5;
                const alpha = 0.6 + Math.sin(time * 3 + t.phase) * 0.3;

                // Glow
                ctx.beginPath(); ctx.arc(p.x, p.y, pulseSize + 4, 0, Math.PI * 2);
                ctx.fillStyle = t.color.replace(')', `,${alpha * 0.2})`).replace('rgb', 'rgba');
                ctx.fillStyle = `rgba(255, 68, 68, ${alpha * 0.15})`;
                ctx.fill();

                // Dot
                ctx.beginPath(); ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`;
                ctx.fill();
            }
        });

        requestAnimationFrame(drawGlobe);
    }
    drawGlobe();
}

/* ============================
   CUSTOM CURSOR
   ============================ */
function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    document.querySelectorAll('a').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover-link'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover-link'));
    });
    document.querySelectorAll('button, .cta-btn').forEach(el => {
        el.addEventListener('mouseenter', () => { ring.classList.remove('hover-link'); ring.classList.add('hover-btn'); });
        el.addEventListener('mouseleave', () => ring.classList.remove('hover-btn'));
    });
}

/* ============================
   GLITCH EFFECT
   ============================ */
function initGlitchEffect() {
    const glitchEls = document.querySelectorAll('.glitch');
    // Fire glitch on load
    setTimeout(() => {
        glitchEls.forEach(el => {
            el.classList.add('active');
            setTimeout(() => {
                el.classList.remove('active');
                el.classList.add('settled');
            }, 500);
        });
    }, 800);
}

/* ============================
   FLOATING 3D SKILL CARD TILT
   ============================ */
function initFloatCardTilt() {
    const cards = document.querySelectorAll('.float-card[data-tilt]');
    const container = document.querySelector('.character-container');
    if (!container) return;

    container.addEventListener('mousemove', e => {
        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCx = cardRect.left + cardRect.width/2 - rect.left;
            const cardCy = cardRect.top + cardRect.height/2 - rect.top;

            const dx = (mx - cardCx) / rect.width;
            const dy = (my - cardCy) / rect.height;

            const rotX = dy * -15;
            const rotY = dx * 15;

            card.style.transform = `translateY(${-10 + Math.sin(Date.now()/1000)*3}px) perspective(400px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
    });

    container.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.style.transform = '';
        });
    });
}

/* ============================
   3D TILT PROJECT CARDS
   ============================ */
function initProjectCardTilt() {
    const cards = document.querySelectorAll('[data-tilt-card]');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const rotX = (0.5 - y) * 12;
            const rotY = (x - 0.5) * 12;

            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(5px)`;

            // Parallax inner content
            const inner = card.querySelector('.card-inner');
            if (inner) {
                inner.style.transform = `translateZ(30px) translateX(${(0.5-x)*8}px) translateY(${(0.5-y)*8}px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            const inner = card.querySelector('.card-inner');
            if (inner) inner.style.transform = '';
        });
    });
}

/* ============================
   SKILL METERS (Radial SVG)
   ============================ */
function initSkillMeters() {
    const meters = document.querySelectorAll('.skill-meter');
    const circumference = 2 * Math.PI * 34; // r=34

    meters.forEach(meter => {
        const fill = meter.querySelector('.meter-fill');
        if (fill) {
            fill.style.strokeDasharray = circumference;
            fill.style.strokeDashoffset = circumference;
        }
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const meter = entry.target;
                const percent = parseInt(meter.dataset.percent) || 0;
                const fill = meter.querySelector('.meter-fill');
                if (fill) {
                    const offset = circumference - (circumference * percent / 100);
                    setTimeout(() => {
                        fill.style.strokeDashoffset = offset;
                    }, 200);
                }
                observer.unobserve(meter);
            }
        });
    }, { threshold: 0.3 });

    meters.forEach(m => observer.observe(m));
}

/* ============================
   NAVBAR
   ============================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 60);
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });

    toggle.addEventListener('click', () => {
        links.classList.toggle('active');
        toggle.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('active');
            toggle.classList.remove('open');
        });
    });
}

function updateActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link[data-text]');
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
    navLinks.forEach(l => {
        l.classList.toggle('active-link', l.getAttribute('href') === `#${current}`);
    });
}

/* ============================
   SCROLL REVEAL
   ============================ */
function initScrollReveal() {
    const els = document.querySelectorAll(
        '.about-left, .about-right, .project-card, .arsenal-category, ' +
        '.tl-item, .research-card, .contact-left, .contact-right, ' +
        '.credentials-row .cred-block, .projects-header, .section-label, .research-intro'
    );
    els.forEach(el => el.classList.add('reveal'));

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement?.querySelectorAll('.reveal') || [];
                let delay = 0;
                siblings.forEach((s, i) => { if (s === entry.target) delay = i * 80; });
                setTimeout(() => entry.target.classList.add('visible'), Math.min(delay, 320));
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
}

/* ============================
   SMOOTH SCROLL
   ============================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
            }
        });
    });
}

/* ============================
   SET SESSION FOR RESEARCH NAV
   ============================ */
document.querySelectorAll('a[href="research.html"]').forEach(a => {
    a.addEventListener('click', () => {
        sessionStorage.setItem('fromPortfolio', 'true');
    });
});
