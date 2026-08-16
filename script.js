const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Reveal content only when it enters the page.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Mobile menu.
const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');

function setMenu(open) {
  if (!menu || !menuToggle) return;
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
}

menuToggle?.addEventListener('click', () => setMenu(true));
menuClose?.addEventListener('click', () => setMenu(false));
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

// Service descriptions.
const serviceDetail = document.querySelector('.service-detail');
document.querySelectorAll('[data-service]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-service]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    if (serviceDetail) serviceDetail.textContent = button.dataset.service || '';
  });
});

// Custom cursor for pointer devices.
const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(pointer:fine)').matches && !reducedMotion) {
  let pointerX = -100;
  let pointerY = -100;
  let cursorX = -100;
  let cursorY = -100;

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }, { passive: true });

  document.querySelectorAll('a, button, .gallery-card').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('hover'));
  });

  const animateCursor = () => {
    cursorX += (pointerX - cursorX) * 0.18;
    cursorY += (pointerY - cursorY) * 0.18;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
}

// Scroll world.
const header = document.querySelector('[data-header]');
const journey = document.querySelector('.journey');
const path = document.querySelector('#journeyPath');
const stonesWrap = document.querySelector('.stones');
const parallaxElements = [...document.querySelectorAll('.parallax')];
const markerPath = document.querySelector('#markerPath');
const markerArt = document.querySelector('.marker-art');
const gallerySection = document.querySelector('[data-gallery-scroll]');
const galleryTrack = document.querySelector('[data-gallery-track]');

let pathLength = 0;
let markerLength = 0;
let lastScrollY = window.scrollY;
let ticking = false;

function setUpPath() {
  if (!journey || !path || !stonesWrap) return;

  pathLength = path.getTotalLength();
  path.style.strokeDasharray = `${pathLength}`;
  path.style.strokeDashoffset = `${pathLength}`;

  const count = window.innerWidth < 640 ? 48 : window.innerWidth < 980 ? 58 : 72;
  stonesWrap.innerHTML = '';

  for (let i = 0; i < count; i += 1) {
    const distance = (i / (count - 1)) * pathLength;
    const point = path.getPointAtLength(distance);
    const stone = document.createElement('span');
    const rotation = -25 + ((i * 37) % 51);
    const scale = 0.72 + ((i * 19) % 29) / 100;

    stone.className = 'stone';
    stone.style.left = `${(point.x / 1000) * 100}%`;
    stone.style.top = `${(point.y / 5200) * 100}%`;
    stone.style.setProperty('--r', `${rotation}deg`);
    stone.style.setProperty('--s', scale.toFixed(2));
    stone.dataset.index = String(i);
    stonesWrap.appendChild(stone);
  }
}

function setUpMarker() {
  if (!markerPath) return;
  markerLength = markerPath.getTotalLength();
  markerPath.style.strokeDasharray = `${markerLength}`;
  markerPath.style.strokeDashoffset = `${markerLength}`;
}

function updateHeader(scrollY) {
  if (!header) return;
  header.classList.toggle('scrolled', scrollY > 35);

  const movingDown = scrollY > lastScrollY;
  const shouldHide = movingDown && scrollY > 260 && !document.body.classList.contains('menu-open');
  header.classList.toggle('header-hidden', shouldHide);
  lastScrollY = scrollY;
}

function updateParallax() {
  if (reducedMotion) return;

  parallaxElements.forEach((el) => {
    const speed = Number(el.dataset.speed || 0);
    const rect = el.getBoundingClientRect();
    const centreDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
    const shift = clamp(-centreDelta * speed, -115, 115);
    el.style.translate = `0 ${shift}px`;
  });
}

function updateJourney() {
  if (!journey || !path || !pathLength) return;

  const rect = journey.getBoundingClientRect();
  const start = window.innerHeight * 0.55;
  const distance = journey.offsetHeight - window.innerHeight * 0.35;
  const progress = clamp((start - rect.top) / Math.max(distance, 1));

  path.style.strokeDashoffset = `${pathLength * (1 - progress)}`;

  const stones = stonesWrap ? [...stonesWrap.children] : [];
  const activeThrough = progress * (stones.length - 1);
  stones.forEach((stone, index) => {
    stone.classList.toggle('active', index <= activeThrough);
  });
}

function updateMarker() {
  if (!markerPath || !markerArt || !markerLength) return;

  const rect = markerArt.getBoundingClientRect();
  const progress = clamp((window.innerHeight * 0.72 - rect.top) / (window.innerHeight * 0.8));
  markerPath.style.strokeDashoffset = `${markerLength * (1 - progress)}`;
}

function updateGallery() {
  if (!gallerySection || !galleryTrack || reducedMotion) return;

  const rect = gallerySection.getBoundingClientRect();
  const travel = gallerySection.offsetHeight - window.innerHeight;
  const progress = clamp(-rect.top / Math.max(1, travel));
  const maxShift = Math.max(0, galleryTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.07);
  galleryTrack.style.transform = `translate3d(${-maxShift * progress}px,0,0)`;
}

function updateScrollWorld() {
  const scrollY = window.scrollY;
  updateHeader(scrollY);
  updateParallax();
  updateJourney();
  updateMarker();
  updateGallery();
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateScrollWorld();
    ticking = false;
  });
}

setUpPath();
setUpMarker();
updateScrollWorld();

window.addEventListener('scroll', onScroll, { passive: true });
let resizeTimer;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    setUpPath();
    setUpMarker();
    updateScrollWorld();
  }, 120);
});
