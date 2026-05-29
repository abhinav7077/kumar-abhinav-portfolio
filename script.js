/* ============================================
   KUMAR ABHINAV — Portfolio v2 JavaScript
   Particles, Animations, Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initScrollReveal();
    initSmoothScroll();
});

/* ============================
   PARTICLE NETWORK BACKGROUND
   ============================ */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles, mouse;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    mouse = { x: -1000, y: -1000 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            // Color variation
            const colors = [
                { r: 0, g: 212, b: 255 },    // cyan
                { r: 168, g: 85, b: 247 },   // purple
                { r: 34, g: 211, b: 167 },   // green
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.vx += (dx / dist) * force * 0.15;
                this.vy += (dy / dist) * force * 0.15;
            }

            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Wrap around
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Calculate particle count based on screen size
    const particleCount = Math.min(Math.floor((width * height) / 12000), 120);
    particles = Array.from({ length: particleCount }, () => new Particle());

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const opacity = ((140 - dist) / 140) * 0.12;
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

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        drawConnections();
        requestAnimationFrame(animate);
    }

    animate();
}

/* ============================
   NAVBAR
   ============================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    // Scroll behavior
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 60) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        links.classList.toggle('active');
        toggle.classList.toggle('open');
    });

    // Close menu on link click
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

    sections.forEach(section => {
        const top = section.offsetTop - 200;
        if (window.scrollY >= top) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active-link');
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
            link.classList.add('active-link');
        }
    });
}

/* ============================
   SCROLL REVEAL
   ============================ */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.about-left, .about-right, ' +
        '.project-card, .arsenal-category, ' +
        '.tl-item, .research-card, ' +
        '.contact-left, .contact-right, ' +
        '.credentials-row .cred-block, ' +
        '.projects-header, .section-label, ' +
        '.research-intro'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Staggered reveal for sibling elements
                    const parent = entry.target.parentElement;
                    const siblings = parent ? parent.querySelectorAll('.reveal') : [];
                    let delay = 0;

                    siblings.forEach((sib, i) => {
                        if (sib === entry.target) {
                            delay = i * 80;
                        }
                    });

                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, Math.min(delay, 320));

                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    revealElements.forEach(el => observer.observe(el));
}

/* ============================
   SMOOTH SCROLL
   ============================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        });
    });
}
