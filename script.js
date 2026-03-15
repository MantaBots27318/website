/* ── MOBILE NAV ── */
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── BACK TO TOP ── */
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
}, { passive: true });
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── HERO CANVAS — animated waves (0.75× speed) ── */
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');
let mx = 0.5, my = 0.5;
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
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
    const speed  = (0.012 + i * 0.004) * 0.75; // 0.75× speed
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

/* ── HERO TITLE — letter-by-letter light-up ── */
const titleEl = document.getElementById('hero-title');
const whiteText = 'MANTA';
const cyanText  = 'BOTS';
const allChars  = whiteText + cyanText;

titleEl.innerHTML = '';
const letterSpans = [];
allChars.split('').forEach((ch, i) => {
  const span = document.createElement('span');
  span.classList.add('letter');
  if (i >= whiteText.length) span.classList.add('cyan');
  span.textContent = ch;
  titleEl.appendChild(span);
  letterSpans.push(span);
});

function lightUpTitle() {
  const indices = letterSpans.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  indices.forEach((idx, order) => {
    setTimeout(() => {
      letterSpans[idx].classList.add('lit');
    }, order * 120 + 300);
  });
}
lightUpTitle();

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

/* ── ROBOT REVEAL — scroll-driven scale + fade, then video ── */
const revealAnchor = document.getElementById('robot-reveal-anchor');
const revealTitle  = document.getElementById('robot-reveal-title');
const videoBg      = document.querySelector('.robot-video-bg');

function onScroll() {
  const rect     = revealAnchor.getBoundingClientRect();
  const total    = revealAnchor.offsetHeight - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / total, 0), 1);
  const p        = Math.min(progress / 0.6, 1);
  revealTitle.style.transform = `scale(${1 + p * 1.5})`;
  revealTitle.style.opacity   = `${1 - p}`;
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
