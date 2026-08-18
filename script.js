const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const journey = document.querySelector('[data-journey]');
const landscape = document.querySelector('[data-landscape]');
const ghost = document.querySelector('[data-landscape-ghost]');
const revealLayer = document.querySelector('[data-landscape-reveal]');
const meter = document.querySelector('[data-meter]');
const year = document.querySelector('#year');
const sceneArt = [...document.querySelectorAll('[data-scene-art]')];

if (year) year.textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
let ticking = false;

function updateSceneArtwork(progress) {
  sceneArt.forEach((el, index) => {
    const revealAt = 0.20 + index * 0.115;
    el.classList.toggle('visible', progress >= revealAt);
  });
}

function updateJourney() {
  if (!journey || !landscape) return;

  const rect = journey.getBoundingClientRect();
  const travel = Math.max(1, journey.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / travel);
  const imageTravel = Math.max(0, landscape.offsetHeight - window.innerHeight);
  const y = -imageTravel * progress;

  if (!reducedMotion) {
    landscape.style.transform = `translate3d(-50%, ${y.toFixed(2)}px, 0)`;
    if (ghost) ghost.style.transform = `translate3d(-50%, ${y.toFixed(2)}px, 0)`;
    if (revealLayer) {
      const hiddenBottom = Math.max(0, 100 - progress * 112);
      revealLayer.style.clipPath = `inset(0 0 ${hiddenBottom.toFixed(2)}% 0)`;
    }
  } else if (revealLayer) {
    revealLayer.style.clipPath = 'none';
  }

  if (meter) meter.style.height = `${(progress * 100).toFixed(2)}%`;
  updateSceneArtwork(progress);
}

function requestJourneyUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateJourney();
    ticking = false;
  });
}

landscape?.addEventListener('load', updateJourney);
window.addEventListener('scroll', requestJourneyUpdate, { passive: true });
window.addEventListener('resize', requestJourneyUpdate);
updateJourney();
