/* ══════════════════════════════════════════════════════════
   SCROLL-SCRUB ENGINE
   Each scrub zone locks the scroll wheel and routes it
   to advance steps. On entry/exit the page scrolls naturally
   — no snapping, no jumping.
══════════════════════════════════════════════════════════ */

const STEP = window.innerHeight * 0.7; // virtual scroll distance per step
const COOL = 700;                       // ms cooldown between advances

function makeScrub({ anchorId, totalSteps, onStep, onHint }) {
  const anchor = document.getElementById(anchorId);
  anchor.style.height = (window.innerHeight + STEP * (totalSteps - 1)) + 'px';

  let step       = 0;
  let locked     = false;
  let cooldown   = false;
  let releasedAt = -Infinity; // timestamp of last unlock — blocks instant re-entry

  function enter(dir) {
    locked = true;
    step = dir === 1 ? 0 : totalSteps - 1;
    onStep(step);
    if (onHint) onHint(step, totalSteps);
  }

  function advance(dir) {
    if (cooldown) return;
    const next = step + dir;

    if (next < 0 || next >= totalSteps) {
      // Release — natural scroll momentum carries the page past
      locked = false;
      releasedAt = performance.now();
      return;
    }

    cooldown = true;
    step = next;
    onStep(step);
    if (onHint) onHint(step, totalSteps);
    setTimeout(() => { cooldown = false; }, COOL);
  }

  function shouldEnter(dir) {
    // Don't re-lock within 800ms of releasing
    if (performance.now() - releasedAt < 800) return false;
    const r = anchor.getBoundingClientRect();
    if (dir ===  1) return r.top  <= window.innerHeight * 0.4 && r.top  >= -20;
    if (dir === -1) return r.bottom >= window.innerHeight * 0.6 && r.bottom <= window.innerHeight + 20;
    return false;
  }

  return { advance, enter, shouldEnter, isLocked: () => locked };
}

/* ── GALLERY SCRUB ── */
const gallerySlides = document.querySelectorAll('.slide');
const galleryHintEl = document.getElementById('gallery-hint');

const galleryScrub = makeScrub({
  anchorId: 'gallery-anchor',
  totalSteps: 3,
  onStep(i) {
    gallerySlides.forEach((s, idx) => s.classList.toggle('active', idx === i));
  },
  onHint(i, total) {
    galleryHintEl.textContent = i === total - 1 ? '▼ Scroll to continue' : '▼ Scroll to advance';
  }
});

/* ── ROBOT SCRUB (4 step cards + 1 video = 5 steps) ── */
const robotCards     = document.querySelectorAll('.step-card');
const robotFullbleed = document.getElementById('robot-fullbleed');
const robotInner     = document.getElementById('robot-inner');
const robotHintEl    = document.getElementById('robot-hint');

const robotScrub = makeScrub({
  anchorId: 'robot-anchor',
  totalSteps: 5,
  onStep(i) {
    robotCards.forEach((c, idx) => c.classList.toggle('revealed', idx < i));
    const showVideo = i >= 4;
    robotFullbleed.classList.toggle('visible', showVideo);
    robotInner.style.transition = 'opacity 0.8s ease';
    robotInner.style.opacity = showVideo ? '0' : '1';
  },
  onHint(i, total) {
    if      (i === 0)       robotHintEl.textContent = '▼ Scroll to reveal build steps';
    else if (i < total - 1) robotHintEl.textContent = '▼ Scroll for next step';
    else                    robotHintEl.textContent = '▼ Scroll to continue';
  }
});

/* ── UNIFIED WHEEL HANDLER ── */
const scrubs = [galleryScrub, robotScrub];

window.addEventListener('wheel', (e) => {
  const dir = e.deltaY > 0 ? 1 : -1;

  const active = scrubs.find(s => s.isLocked());
  if (active) {
    e.preventDefault();
    active.advance(dir);
    return;
  }

  for (const s of scrubs) {
    if (s.shouldEnter(dir)) {
      e.preventDefault();
      s.enter(dir);
      return;
    }
  }
}, { passive: false });

/* ── TOUCH ── */
let touchStartY = 0;
window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchmove',  (e) => { if (scrubs.some(s => s.isLocked())) e.preventDefault(); }, { passive: false });
window.addEventListener('touchend',   (e) => {
  const dy  = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) < 30) return;
  const dir = dy > 0 ? 1 : -1;

  const active = scrubs.find(s => s.isLocked());
  if (active) { active.advance(dir); return; }

  for (const s of scrubs) {
    if (s.shouldEnter(dir)) { s.enter(dir); return; }
  }
});

/* ── KEYBOARD ── */
window.addEventListener('keydown', (e) => {
  const active = scrubs.find(s => s.isLocked());
  if (!active) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); active.advance(1); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); active.advance(-1); }
});

/* ── SMOOTH NAV LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    if (scrubs.some(s => s.isLocked())) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
