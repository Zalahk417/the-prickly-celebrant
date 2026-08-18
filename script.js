const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Load the final composition layer after the base stylesheet.
if (!document.querySelector('link[data-polish]')) {
  const polish = document.createElement('link');
  polish.rel = 'stylesheet';
  polish.href = 'polish.css';
  polish.dataset.polish = 'true';
  document.head.appendChild(polish);
}

// Load the user-approved hotfix after polish so it wins the cascade.
if (!document.querySelector('link[data-hotfix]')) {
  const hotfix = document.createElement('link');
  hotfix.rel = 'stylesheet';
  hotfix.href = 'hotfix.css?v=20260818-2112';
  hotfix.dataset.hotfix = 'true';
  document.head.appendChild(hotfix);
}

// Move the ring-hands artwork out of the opening and place it directly
// underneath Wedding & Life Celebrant, where it belongs in the journey.
const originalRingArt = document.querySelector('.art-a');
const weddingSlip = document.querySelector('#service-wedding');
if (originalRingArt && weddingSlip && !document.querySelector('.service-ring-art')) {
  const figure = document.createElement('figure');
  figure.className = 'service-ring-art reveal';
  const image = originalRingArt.querySelector('img');
  if (image) figure.appendChild(image.cloneNode(true));
  weddingSlip.insertAdjacentElement('afterend', figure);
  originalRingArt.remove();
}

// Force the approved menu asset to be requested fresh. The CSS layer also
// supplies a visible fallback so the menu can never disappear again.
const menuLogo = document.querySelector('.real-menu-logo');
if (menuLogo) menuLogo.src = 'assets/prickly-menu.png?v=20260818-2112';

const journey = document.querySelector('[data-journey]');
const landscape = document.querySelector('[data-landscape]');
const ghost = document.querySelector('[data-landscape-ghost]');
const revealLayer = document.querySelector('[data-landscape-reveal]');
const meter = document.querySelector('[data-meter]');
const year = document.querySelector('#year');
const sceneArt = [...document.querySelectorAll('[data-scene-art]')];

if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll('[data-future-link]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
let ticking = false;

function updateSceneArtwork(progress) {
  const revealPoints = [0.20, 0.58, 0.76];
  sceneArt.forEach((el, index) => {
    el.classList.toggle('visible', progress >= (revealPoints[index] ?? 0.7));
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
      const revealed = clamp(0.50 + progress * 0.58);
      revealLayer.style.clipPath = `inset(0 0 ${((1 - revealed) * 100).toFixed(2)}% 0)`;
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
