'use strict';

/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navLinkItems = document.querySelectorAll('.nav-link');

// Scrolled class for navbar shadow
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
  handleReveal();
  handleCounters();
});

// Hamburger toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

/* ===== ACTIVE NAV ON SCROLL ===== */
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const matchingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (matchingLink) {
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinkItems.forEach(l => l.classList.remove('active'));
        matchingLink.classList.add('active');
      }
    }
  });
}

/* ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});

/* ===== SCROLL REVEAL ANIMATION ===== */
const revealElements = document.querySelectorAll('.reveal, .reveal-right, .reveal-float');

function handleReveal() {
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < windowHeight - 60) {
      el.classList.add('visible');
    }
  });
}

// Stagger siblings in grids
function addStaggerDelay() {
  const grids = document.querySelectorAll(
    '.features-grid, .impact-grid, .testimonials-grid, .gamification-left, .gamification-right, .app-cards-grid'
  );
  grids.forEach(grid => {
    const children = grid.querySelectorAll('.reveal, .reveal-float');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // Steps stagger
  const stepCards = document.querySelectorAll('.step-card.reveal');
  stepCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 120}ms`;
  });
}

addStaggerDelay();
// Initial check
handleReveal();

/* ===== COUNTER ANIMATION ===== */
const counters = document.querySelectorAll('.impact-number[data-target]');
let countersStarted = false;

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current.toLocaleString('en-IN');
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('en-IN');
    }
  }
  requestAnimationFrame(update);
}

function handleCounters() {
  if (countersStarted) return;
  counters.forEach(counter => {
    const rect = counter.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      countersStarted = true;
      counters.forEach(c => animateCounter(c));
    }
  });
}

/* ===== FLOATING CARDS ENTRANCE ===== */
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card, i) => {
  setTimeout(() => {
    card.classList.add('visible');
  }, 600 + i * 200);
});

/* ===== FEATURE CARD TILT EFFECT ===== */
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ===== HERO PARALLAX ===== */
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  if (hero) {
    const scrolled = window.scrollY;
    const orb1 = hero.querySelector('.orb1');
    const orb2 = hero.querySelector('.orb2');
    if (orb1) orb1.style.transform = `translateY(${scrolled * 0.15}px)`;
    if (orb2) orb2.style.transform = `translateY(${scrolled * -0.1}px)`;
  }
});

/* ===== BAR CHART ANIMATION ===== */
function animateBars() {
  const bars = document.querySelectorAll('.bar');
  bars.forEach(bar => {
    const finalHeight = bar.style.height;
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.transition = 'height 1s cubic-bezier(0.4,0,0.2,1)';
      bar.style.height = finalHeight;
    }, 300);
  });
}

const dashboardCard = document.querySelector('.dashboard-card');
let barsAnimated = false;
const dashObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !barsAnimated) {
      barsAnimated = true;
      animateBars();
    }
  });
}, { threshold: 0.3 });
if (dashboardCard) dashObserver.observe(dashboardCard);

/* ===== IMPACT CARD NUMBER GLOW ON HOVER ===== */
const impactNumbers = document.querySelectorAll('.impact-number');
document.querySelectorAll('.impact-card').forEach((card, i) => {
  card.addEventListener('mouseenter', () => {
    const num = card.querySelector('.impact-number');
    if (num) {
      num.style.background = 'linear-gradient(135deg, #10b981, #3b82f6)';
      num.style.webkitBackgroundClip = 'text';
      num.style.webkitTextFillColor = 'transparent';
      num.style.backgroundClip = 'text';
    }
  });
  card.addEventListener('mouseleave', () => {
    const num = card.querySelector('.impact-number');
    if (num) {
      num.style.background = '';
      num.style.webkitBackgroundClip = '';
      num.style.webkitTextFillColor = '';
      num.style.backgroundClip = '';
    }
  });
});

/* ===== RANK CARD HOVER ===== */
document.querySelectorAll('.rank-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 0 20px rgba(16,185,129,0.12)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });
});

/* ===== INIT ===== */
updateActiveNav();
handleCounters();
