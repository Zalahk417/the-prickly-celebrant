const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const journey = document.querySelector('[data-journey]');
const landscape = document.querySelector('[data-landscape]');
const ghost = document.querySelector('[data-landscape-ghost]');
const revealLayer = document.querySelector('[data-landscape-reveal]');
const meter = document.querySelector('[data-meter]');
const year = document.querySelector('#year');
const serviceSection = document.querySelector('#services');
const contactSection = document.querySelector('#contact');
const menuButton = document.querySelector('.menu-action');
const contactButton = document.querySelector('.contact-action');
const serviceCards = [...document.querySelectorAll('.service-slip')];
const navLinks = [...document.querySelectorAll('.site-header nav a')];

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
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
let ticking = false;

function sectionActive(section, focusLine = window.innerHeight * 0.46) {
  if (!section) return false;
  const rect = section.getBoundingClientRect();
  return rect.top <= focusLine && rect.bottom >= focusLine;
}

function updateActiveNavigation() {
  const inContact = sectionActive(contactSection, window.innerHeight * 0.52);
  const inServices = !inContact && sectionActive(serviceSection);

  menuButton?.classList.toggle('is-active', inServices);
  contactButton?.classList.toggle('is-active', inContact);

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const active = (href === '#services' && inServices) || (href === '#contact' && inContact);
    link.classList.toggle('is-active', active);
  });
}

function updateCardDrift() {
  if (reducedMotion) return;
  serviceCards.forEach((card, index) => {
    if (!card.classList.contains('visible')) return;
    const rect = card.getBoundingClientRect();
    const centre = rect.top + rect.height / 2;
    const distance = clamp((centre - window.innerHeight / 2) / window.innerHeight, -1, 1);
    const direction = index % 2 === 0 ? -1 : 1;
    card.style.setProperty('--drift-y', `${(-distance * 5).toFixed(2)}px`);
    card.style.setProperty('--drift-x', `${(direction * distance * 2.2).toFixed(2)}px`);
    card.style.setProperty('--drift-r', `${(direction * distance * 0.16).toFixed(3)}deg`);
  });
}

// Reveal small areas of the original landscape independently, without a sweeping mask.
const pathPieces = [];
let pieceScene;
if (landscape && !reducedMotion) {
  pieceScene = document.createElement('div');
  pieceScene.className = 'path-piece-scene';
  pieceScene.setAttribute('aria-hidden', 'true');
  landscape.after(pieceScene);
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 3; col++) {
      const piece = document.createElement('div');
      piece.className = 'path-piece';
      piece.style.clipPath = `inset(${row * 10}% ${100 - (col + 1) * 100 / 3}% ${90 - row * 10}% ${col * 100 / 3}%)`;
      piece.style.transitionDelay = `${col === 1 ? 0 : 130 + row % 3 * 70}ms`;
      pieceScene.append(piece);
      pathPieces.push({piece, row, col});
    }
  }
  landscape.classList.add('path-sizing-image');
}
function updatePathPieces(progress, y, imageTravel) {
  if (!pieceScene) return;
  const height = landscape.offsetHeight;
  pieceScene.style.width = `${landscape.offsetWidth}px`;
  pieceScene.style.height = `${height}px`;
  pieceScene.style.transform = `translate3d(-50%, ${y.toFixed(2)}px, 0)`;
  pathPieces.forEach(({piece, row, col}) => {
    const threshold = Math.max(0, (row * height / 10 - window.innerHeight * .84) / Math.max(1, imageTravel));
    if (progress >= threshold || progress > .97) piece.classList.add('painted');
  });
}

function updateJourney() {
  if (!journey || !landscape) return;

  const rect = journey.getBoundingClientRect();
  const travel = Math.max(1, journey.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / travel);
  const imageTravel = Math.max(0, landscape.offsetHeight - window.innerHeight);
  const y = -imageTravel * progress;

  document.documentElement.style.setProperty('--journey-progress', progress.toFixed(4));

  if (!reducedMotion) {
    landscape.style.transform = `translate3d(-50%, ${y.toFixed(2)}px, 0)`;
    if (ghost) ghost.style.transform = `translate3d(-50%, ${(y * 0.94).toFixed(2)}px, 0)`;

    updatePathPieces(progress, y, imageTravel);

    const sceneSat = 0.96 + progress * 0.08;
    const sceneContrast = 0.99 + progress * 0.035;
    const ghostOpacity = 0.075 - progress * 0.025;
    document.documentElement.style.setProperty('--scene-sat', sceneSat.toFixed(3));
    document.documentElement.style.setProperty('--scene-contrast', sceneContrast.toFixed(3));
    document.documentElement.style.setProperty('--ghost-opacity', ghostOpacity.toFixed(3));
  } else if (revealLayer) {
    revealLayer.style.clipPath = 'none';
  }

  if (meter) meter.style.height = `${(progress * 100).toFixed(2)}%`;

  updateCardDrift();
  updateActiveNavigation();
}

function requestJourneyUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateJourney();
    ticking = false;
  });
}

// Cactus controls feel tactile on touch without relying on hover.
document.querySelectorAll('.float-action').forEach((button) => {
  const tap = () => {
    button.classList.remove('tap');
    void button.offsetWidth;
    button.classList.add('tap');
    window.setTimeout(() => button.classList.remove('tap'), 320);
  };
  button.addEventListener('pointerdown', tap, { passive: true });
});

// Tiny pointer response for desktop/iPad trackpad, intentionally low amplitude.
if (!reducedMotion && window.matchMedia('(hover:hover)').matches) {
  document.addEventListener('pointermove', (event) => {
    const nx = (event.clientX / window.innerWidth - 0.5) * 2;
    const ny = (event.clientY / window.innerHeight - 0.5) * 2;
    document.documentElement.style.setProperty('--pointer-x', nx.toFixed(3));
    document.documentElement.style.setProperty('--pointer-y', ny.toFixed(3));
  }, { passive: true });
}

landscape?.addEventListener('load', updateJourney);
window.addEventListener('scroll', requestJourneyUpdate, { passive: true });
window.addEventListener('resize', requestJourneyUpdate);
updateJourney();

