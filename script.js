const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const journey = document.querySelector('[data-journey]');
const landscape = document.querySelector('[data-landscape]');
const meter = document.querySelector('[data-meter]');
const year = document.querySelector('#year');

if (year) year.textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
let ticking = false;

function updateJourney() {
  if (!journey || !landscape) return;

  const rect = journey.getBoundingClientRect();
  const travel = Math.max(1, journey.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / travel);

  if (!reducedMotion) {
    const imageTravel = Math.max(0, landscape.offsetHeight - window.innerHeight);
    landscape.style.transform = `translate3d(-50%, ${(-imageTravel * progress).toFixed(2)}px, 0)`;
  }

  if (meter) meter.style.height = `${(progress * 100).toFixed(2)}%`;
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
