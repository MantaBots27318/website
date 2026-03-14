const STEP = window.innerHeight * 0.7;
const COOL = 700;

function makeScrub({ anchorId, totalSteps, onStep, onHint }) {
  const anchor = document.getElementById(anchorId);
  anchor.style.height = (window.innerHeight + STEP * (totalSteps - 1)) + 'px';

  let step       = 0;
  let locked     = false;
  let cooldown   = false;
  let releasedAt = -Infinity;

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
    // Never re-enter immediately after releasing
    if (performance.now() - releasedAt < 1200) return false;
    const r = anchor.getBoundingClientRect();
    // Scrolling down: only lock when top edge is within a small crossing window
    if (dir ===  1) return r.top <= 2 && r.top >= -STEP;
    // Scrolling up: only lock when bottom edge is within a small crossing window
    if (dir === -1) return r.bottom >= window.innerHeight - 2 && r.bottom <= window.innerHeight + STEP;
    return false;
  }

  return { advance, enter, shouldEnter, isLocked: () => locked };
}

const gallerySlides = document.querySelectorAll('.slide');
const galleryHintEl = document.getElementById('gallery-hint');
const galleryScrub = makeScrub({
  anchorId: 'gallery-anchor',
  totalSteps: 3,
  onStep(i) { gallerySlides.forEach((s, idx) => s.classList.toggle('active', idx === i)); },
  onHint(i, total) { galleryHintEl.textContent = i === total - 1 ? '▼ Scroll to continue' : '▼ Scroll to advance'; }
});

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

const scrubs = [galleryScrub, robotScrub];

window.addEventListener('wheel', (e) => {
  const dir = e.deltaY > 0 ? 1 : -1;
  const active = scrubs.find(s => s.isLocked());
  if (active) { e.preventDefault(); active.advance(dir); return; }
  for (const s of scrubs) {
    if (s.shouldEnter(dir)) { e.preventDefault(); s.enter(dir); return; }
  }
}, { passive: false });

let touchStartY = 0;
window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchmove',  (e) => { if (scrubs.some(s => s.isLocked())) e.preventDefault(); }, { passive: false });
window.addEventListener('touchend',   (e) => {
  const dy  = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) < 30) return;
  const dir = dy > 0 ? 1 : -1;
  const active = scrubs.find(s => s.isLocked());
  if (active) { active.advance(dir); return; }
  for (const s of scrubs) { if (s.shouldEnter(dir)) { s.enter(dir); return; } }
});

window.addEventListener('keydown', (e) => {
  const active = scrubs.find(s => s.isLocked());
  if (!active) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); active.advance(1); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); active.advance(-1); }
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    if (scrubs.some(s => s.isLocked())) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
