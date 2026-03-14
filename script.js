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
    startTimer(); // reset timer on manual click
  });
});

startTimer();

/* ── ROBOT REVEAL — scroll-driven scale + fade on title ── */
const revealAnchor = document.getElementById('robot-reveal-anchor');
const revealTitle  = document.getElementById('robot-reveal-title');

function onScroll() {
  const rect     = revealAnchor.getBoundingClientRect();
  const total    = revealAnchor.offsetHeight - window.innerHeight;
  // progress 0 (anchor top at viewport top) → 1 (anchor bottom at viewport bottom)
  const progress = Math.min(Math.max(-rect.top / total, 0), 1);

  // Scale from 1 → 2.5, opacity from 1 → 0, all in first 60% of scroll
  const p = Math.min(progress / 0.6, 1);
  revealTitle.style.transform = `scale(${1 + p * 1.5})`;
  revealTitle.style.opacity   = `${1 - p}`;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

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
