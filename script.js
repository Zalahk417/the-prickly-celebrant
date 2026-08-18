const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const journey = document.querySelector('[data-journey]');
const image = document.querySelector('[data-world-image]');
const progressBar = document.querySelector('[data-progress]');
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .14, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

let ticking = false;
function clamp(value, min = 0, max = 1) { return Math.min(max, Math.max(min, value)); }

function updateWorld() {
  if (!journey || !image) return;
  const rect = journey.getBoundingClientRect();
  const travel = Math.max(1, journey.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / travel);
  const imageTravel = Math.max(0, image.offsetHeight - window.innerHeight);
  if (!reducedMotion) image.style.transform = `translate3d(-50%, ${-imageTravel * progress}px, 0)`;
  if (progressBar) progressBar.style.height = `${progress * 100}%`;
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateWorld(); ticking = false; });
}

image?.addEventListener('load', updateWorld);
window.addEventListener('scroll', onScroll, { passive:true });
window.addEventListener('resize', updateWorld);
updateWorld();
