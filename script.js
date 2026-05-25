/* ============================================
   script.js – Portfolio Interactivity
   ============================================ */

"use strict";

// ─── Scroll Progress Bar ──────────────────────
const scrollProgress = document.getElementById("scroll-progress");

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + "%";
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });

// ─── Sticky Navbar ────────────────────────────
const navbar = document.getElementById("navbar");

function updateNavbar() {
  if (window.scrollY > 60) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateNavbar, { passive: true });

// ─── Active Nav Link on Scroll ────────────────
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

function updateActiveNavLink() {
  const scrollY = window.scrollY + 100;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }
  });
}

window.addEventListener("scroll", updateActiveNavLink, { passive: true });

// ─── Hamburger Menu ───────────────────────────
const hamburger = document.getElementById("hamburger");
const navLinksContainer = document.getElementById("nav-links");

hamburger.addEventListener("click", () => {
  navLinksContainer.classList.toggle("open");
  const spans = hamburger.querySelectorAll("span");
  const isOpen = navLinksContainer.classList.contains("open");
  spans[0].style.transform = isOpen ? "rotate(45deg) translate(5px, 5px)" : "";
  spans[1].style.opacity = isOpen ? "0" : "1";
  spans[2].style.transform = isOpen ? "rotate(-45deg) translate(5px, -5px)" : "";
});

// Close menu when a link is clicked
navLinksContainer.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinksContainer.classList.remove("open");
    hamburger.querySelectorAll("span").forEach((s) => {
      s.style.transform = "";
      s.style.opacity = "1";
    });
  });
});

// ─── Custom Cursor ────────────────────────────
const cursorGlow = document.getElementById("cursor-glow");
const cursorDot = document.getElementById("cursor-dot");

let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + "px";
  cursorDot.style.top = mouseY + "px";
});

// Lerp for smooth glow follow
function lerpCursor() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  cursorGlow.style.left = glowX + "px";
  cursorGlow.style.top = glowY + "px";
  requestAnimationFrame(lerpCursor);
}

lerpCursor();

// Enlarge cursor on interactive elements
const interactiveEls = document.querySelectorAll("a, button, .glass-card, .project-card, .achievement-card, input, textarea");

interactiveEls.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursorGlow.style.width = "70px";
    cursorGlow.style.height = "70px";
    cursorGlow.style.background = "radial-gradient(circle, rgba(79, 110, 247, 0.4), transparent 70%)";
  });
  el.addEventListener("mouseleave", () => {
    cursorGlow.style.width = "40px";
    cursorGlow.style.height = "40px";
    cursorGlow.style.background = "radial-gradient(circle, rgba(79, 110, 247, 0.3), transparent 70%)";
  });
});

// ─── Scroll Reveal Animation ──────────────────
const revealEls = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children if multiple are in a container
        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, 80);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);

revealEls.forEach((el) => revealObserver.observe(el));

// ─── Skill Bar Animation ──────────────────────
const skillFills = document.querySelectorAll(".skill-fill");

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

skillFills.forEach((fill) => {
  fill.style.animationPlayState = "paused";
  skillObserver.observe(fill);
});

// Contact form removed as per layout update

// ─── Particle Canvas (Light-theme AI network) ─
(function initParticles() {
  const canvas = document.createElement("canvas");
  canvas.id = "particle-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Light-theme particle colors
  const COLORS = [
    "79, 110, 247",
    "107, 133, 255",
    "155, 92, 247",
    "176, 122, 255",
  ];

  const PARTICLE_COUNT = 55;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : -10;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = Math.random() * 0.4 + 0.1;
      this.r = Math.random() * 2.2 + 0.8;
      this.baseAlpha = Math.random() * 0.2 + 0.06;
      this.alpha = this.baseAlpha;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.pulse += 0.02;
      this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.04;
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > H + 10 || this.x < -10 || this.x > W + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = 0.08 * (1 - dist / maxDist);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79, 110, 247, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();

// ─── Mouse Parallax on Aurora Blobs ──────────
(function initAuroraParallax() {
  const blobs = [
    { el: document.querySelector(".bg-glow-1"), depth: 0.015 },
    { el: document.querySelector(".bg-glow-2"), depth: 0.022 },
    { el: document.querySelector(".bg-glow-3"), depth: 0.012 },
    { el: document.querySelector(".bg-glow-4"), depth: 0.018 },
  ].filter(b => b.el);

  let mx = 0, my = 0;
  let tx = Array(blobs.length).fill(0);
  let ty = Array(blobs.length).fill(0);

  window.addEventListener("mousemove", e => {
    mx = (e.clientX - window.innerWidth / 2);
    my = (e.clientY - window.innerHeight / 2);
  }, { passive: true });

  function tickParallax() {
    blobs.forEach((blob, i) => {
      tx[i] += (mx * blob.depth - tx[i]) * 0.06;
      ty[i] += (my * blob.depth - ty[i]) * 0.06;
      blob.el.style.transform = `translate(${tx[i]}px, ${ty[i]}px)`;
    });
    requestAnimationFrame(tickParallax);
  }
  tickParallax();
})();

// ─── Smooth hero text stagger on load ─────────
window.addEventListener("DOMContentLoaded", () => {
  const heroEls = document.querySelectorAll(".hero [data-reveal]");
  heroEls.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("revealed");
    }, 200 + i * 180);
  });
});

// ─── Number counter animation for stats ───────
function animateCounter(el, target, suffix, duration = 1200) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const numbers = entry.target.querySelectorAll(".stat-number[data-count]");
        numbers.forEach((num) => {
          const target = parseInt(num.getAttribute("data-count"));
          const raw = num.textContent.trim();
          // Detect suffix: ×, +, %, or none
          let suffix = "";
          if (raw.endsWith("×")) suffix = "×";
          else if (raw.endsWith("+")) suffix = "+";
          else if (raw.endsWith("%")) suffix = "%";
          if (!isNaN(target)) animateCounter(num, target, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const heroStats = document.querySelector(".hero-stats");
if (heroStats) statsObserver.observe(heroStats);

// ─── Spin keyframe for loading icon ──────────
const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);