/* ── MOBILE NAV ── */
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── HERO CANVAS — animated waves that react to mouse ── */
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');
let mx = 0.5, my = 0.5;
let W, H;

function resizeCanvas() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', e => {
  mx = e.clientX / window.innerWidth;
  my = e.clientY / window.innerHeight;
});

const WAVE_COUNT = 5;
let t = 0;

function drawWaves() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < WAVE_COUNT; i++) {
    const freq   = 0.008 + i * 0.003;
    const amp    = 18 + i * 12 + my * 40;
    const speed  = 0.012 + i * 0.004;
    const yBase  = H * (0.3 + i * 0.12);
    const xShift = (mx - 0.5) * 80;
    const alpha  = 0.04 + i * 0.015;

    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = yBase
        + Math.sin(x * freq + t * speed * 60 + i * 1.2) * amp
        + Math.sin(x * freq * 0.5 + t * speed * 40) * (amp * 0.4)
        + xShift * Math.sin(x / W * Math.PI);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = `rgba(0, 200, 255, ${alpha})`;
    ctx.fill();
  }
  t += 0.016;
  requestAnimationFrame(drawWaves);
}
drawWaves();

/* ── HERO TITLE FLICKER ── */
const heroTitle = document.querySelector('.hero-title');
function flicker() {
  const flickers = Math.floor(Math.random() * 3) + 1;
  let delay = 0;
  for (let i = 0; i < flickers; i++) {
    setTimeout(() => { heroTitle.style.opacity = '0.15'; }, delay);
    delay += 60 + Math.random() * 60;
    setTimeout(() => { heroTitle.style.opacity = '1'; }, delay);
    delay += 40 + Math.random() * 40;
  }
  setTimeout(flicker, 2000 + Math.random() * 4000);
}
setTimeout(flicker, 1500);

/* ── GALLERY — auto-timer + clickable dots ── */
const slides     = document.querySelectorAll('.slide');
const dots       = document.querySelectorAll('.dot');
let current      = 0;
let galleryTimer = null;

function goToSlide(n) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('lit');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('lit');
}

function startTimer() {
  clearInterval(galleryTimer);
  galleryTimer = setInterval(() => goToSlide(current + 1), 4000);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.dataset.index));
    startTimer();
  });
});

startTimer();

/* ── ROBOT REVEAL — scroll-driven scale + fade, then video in ── */
const revealAnchor = document.getElementById('robot-reveal-anchor');
const revealTitle  = document.getElementById('robot-reveal-title');
const videoBg      = document.querySelector('.robot-video-bg');

function onScroll() {
  const rect     = revealAnchor.getBoundingClientRect();
  const total    = revealAnchor.offsetHeight - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / total, 0), 1);
  const p        = Math.min(progress / 0.6, 1);

  // Title scales up and fades out
  revealTitle.style.transform = `scale(${1 + p * 1.5})`;
  revealTitle.style.opacity   = `${1 - p}`;

  // Video only appears once title is fully gone
  videoBg.style.opacity = p >= 1 ? '1' : '0';
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── STEP CARDS — fade in via IntersectionObserver ── */
const fadeCards = document.querySelectorAll('.fade-in-card');
const cardObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        cardObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
fadeCards.forEach(c => cardObserver.observe(c));

/* ── SMOOTH NAV LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
