const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const SVG_NS = 'http://www.w3.org/2000/svg';

// Load the second-pass visual layer without adding another dependency to the HTML.
if (!document.querySelector('link[data-second-pass]')) {
  const secondPassStyles = document.createElement('link');
  secondPassStyles.rel = 'stylesheet';
  secondPassStyles.href = 'second-pass.css';
  secondPassStyles.dataset.secondPass = 'true';
  document.head.appendChild(secondPassStyles);
}

// Insert an original Prickly multiple-choice beat to create the denser editorial rhythm.
const pathIntro = document.querySelector('.path-intro');
const journeyNode = document.querySelector('.journey');
if (pathIntro && journeyNode && !document.querySelector('#prickly-fit-check')) {
  const quiz = document.createElement('section');
  quiz.className = 'prickly-quiz';
  quiz.id = 'prickly-fit-check';
  quiz.innerHTML = `
    <div class="quiz-shell">
      <div class="quiz-copy reveal">
        <p class="kicker">A VERY SCIENTIFIC FIT CHECK</p>
        <h2>Your ceremony should feel…</h2>
        <p>There are no wrong answers. There is, however, one answer that makes me suspicious.</p>
      </div>
      <div class="quiz-panel reveal">
        <div class="quiz-options" role="group" aria-label="Ceremony style fit check">
          <button class="quiz-option" type="button" data-answer="predictable"><span class="letter">a</span><span>polished, proper and completely predictable</span><span class="tick">✓</span></button>
          <button class="quiz-option" type="button" data-answer="warm"><span class="letter">b</span><span>warm enough to cry, loose enough to laugh</span><span class="tick">✓</span></button>
          <button class="quiz-option" type="button" data-answer="alive"><span class="letter">c</span><span>like us — just louder, sharper and more alive</span><span class="tick">✓</span></button>
          <button class="quiz-option" type="button" data-answer="all"><span class="letter">d</span><span>all of the above, except the predictable bit</span><span class="tick">✓</span></button>
        </div>
        <p class="quiz-result" aria-live="polite">Pick one. I promise to only judge <em>a little</em>.</p>
      </div>
    </div>`;
  pathIntro.insertAdjacentElement('afterend', quiz);
}

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

// Fit-check interaction.
const quizResult = document.querySelector('.quiz-result');
const quizResponses = {
  predictable: '<strong>Hmm.</strong> I can do polished. Predictable might need an intervention.',
  warm: '<strong>That’s the sweet spot.</strong> Real emotion, plenty of oxygen, no emotional hostage situation.',
  alive: '<strong>Exactly.</strong> It should feel unmistakably like the people at the centre of it.',
  all: '<strong>Correct.</strong> You have passed the extremely rigorous Prickly entrance exam.'
};

document.querySelectorAll('.quiz-option').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.quiz-option').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    if (quizResult) quizResult.innerHTML = quizResponses[button.dataset.answer] || '';
  });
});

// Custom cursor for pointer devices. It sleeps whenever the pointer is stationary.
const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(pointer:fine)').matches && !reducedMotion) {
  let pointerX = -100;
  let pointerY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let cursorRunning = false;

  const animateCursor = () => {
    cursorX += (pointerX - cursorX) * 0.2;
    cursorY += (pointerY - cursorY) * 0.2;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    if (Math.abs(pointerX - cursorX) > 0.12 || Math.abs(pointerY - cursorY) > 0.12) {
      requestAnimationFrame(animateCursor);
    } else {
      cursorX = pointerX;
      cursorY = pointerY;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      cursorRunning = false;
    }
  };

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!cursorRunning) {
      cursorRunning = true;
      requestAnimationFrame(animateCursor);
    }
  }, { passive: true });

  document.querySelectorAll('a, button, .gallery-card').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('hover'));
  });
}

// Scroll world.
const header = document.querySelector('[data-header]');
const journey = document.querySelector('.journey');
const path = document.querySelector('#journeyPath');
const pathSvg = document.querySelector('.path-svg');
const stonesWrap = document.querySelector('.stones');
const parallaxElements = [...document.querySelectorAll('.parallax')];
const markerPath = document.querySelector('#markerPath');
const markerArt = document.querySelector('.marker-art');
const gallerySection = document.querySelector('[data-gallery-scroll]');
const galleryTrack = document.querySelector('[data-gallery-track]');

let pathLength = 0;
let markerLength = 0;
let leftRailLength = 0;
let rightRailLength = 0;
let leftRailLive = null;
let rightRailLive = null;
let pathWalker = null;
let lastScrollY = window.scrollY;
let ticking = false;

function getPointNormal(distance) {
  if (!path || !pathLength) return null;
  const epsilon = Math.max(2, pathLength / 1800);
  const here = path.getPointAtLength(clamp(distance, 0, pathLength));
  const before = path.getPointAtLength(clamp(distance - epsilon, 0, pathLength));
  const after = path.getPointAtLength(clamp(distance + epsilon, 0, pathLength));
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const mag = Math.hypot(dx, dy) || 1;
  return {
    point: here,
    tangent: { x: dx / mag, y: dy / mag },
    normal: { x: -dy / mag, y: dx / mag }
  };
}

function ensureRailPath(className) {
  if (!pathSvg) return null;
  let rail = pathSvg.querySelector(`.${className.split(' ').join('.')}`);
  if (!rail) {
    rail = document.createElementNS(SVG_NS, 'path');
    rail.setAttribute('class', `path-rail ${className}`);
    pathSvg.appendChild(rail);
  }
  return rail;
}

function buildRailD(offset, samples = 240) {
  const points = [];
  for (let i = 0; i < samples; i += 1) {
    const distance = (i / (samples - 1)) * pathLength;
    const geometry = getPointNormal(distance);
    if (!geometry) continue;
    points.push({
      x: geometry.point.x + geometry.normal.x * offset,
      y: geometry.point.y + geometry.normal.y * offset
    });
  }
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}

function createWalker() {
  if (!journey) return;
  pathWalker = journey.querySelector('.path-walker');
  if (!pathWalker) {
    pathWalker = document.createElement('div');
    pathWalker.className = 'path-walker';
    pathWalker.setAttribute('aria-hidden', 'true');
    pathWalker.innerHTML = '<span class="path-walker-dot"></span><span class="path-walker-label">you are here</span>';
    journey.appendChild(pathWalker);
  }
}

function setUpPath() {
  if (!journey || !path || !stonesWrap || !pathSvg) return;

  pathLength = path.getTotalLength();
  const railOffset = window.innerWidth < 640 ? 120 : window.innerWidth < 980 ? 104 : 92;
  const leftD = buildRailD(-railOffset);
  const rightD = buildRailD(railOffset);

  const leftGhost = ensureRailPath('rail-left rail-ghost');
  const rightGhost = ensureRailPath('rail-right rail-ghost');
  leftRailLive = ensureRailPath('rail-left rail-live');
  rightRailLive = ensureRailPath('rail-right rail-live');

  [leftGhost, leftRailLive].forEach((rail) => rail?.setAttribute('d', leftD));
  [rightGhost, rightRailLive].forEach((rail) => rail?.setAttribute('d', rightD));

  if (leftRailLive && rightRailLive) {
    leftRailLength = leftRailLive.getTotalLength();
    rightRailLength = rightRailLive.getTotalLength();
    leftRailLive.style.strokeDasharray = `${leftRailLength}`;
    leftRailLive.style.strokeDashoffset = `${leftRailLength}`;
    rightRailLive.style.strokeDasharray = `${rightRailLength}`;
    rightRailLive.style.strokeDashoffset = `${rightRailLength}`;
  }

  const pairCount = window.innerWidth < 640 ? 38 : window.innerWidth < 980 ? 46 : 56;
  stonesWrap.innerHTML = '';

  for (let i = 0; i < pairCount; i += 1) {
    const progress = i / (pairCount - 1);
    const distance = progress * pathLength;
    const geometry = getPointNormal(distance);
    if (!geometry) continue;

    [-1, 1].forEach((side, sideIndex) => {
      const stone = document.createElement('span');
      const normalJitter = Math.sin(i * 2.13 + sideIndex) * 10;
      const tangentJitter = Math.cos(i * 1.61 + sideIndex) * 7;
      const sideOffset = railOffset + normalJitter;
      const x = geometry.point.x + geometry.normal.x * sideOffset * side + geometry.tangent.x * tangentJitter;
      const y = geometry.point.y + geometry.normal.y * sideOffset * side + geometry.tangent.y * tangentJitter;
      const rotation = -28 + ((i * 31 + sideIndex * 17) % 57);
      const scale = 0.7 + ((i * 17 + sideIndex * 11) % 28) / 100;

      stone.className = `stone ${side < 0 ? 'rail-left-stone' : 'rail-right-stone'}`;
      stone.style.left = `${(x / 1000) * 100}%`;
      stone.style.top = `${(y / 5200) * 100}%`;
      stone.style.setProperty('--r', `${rotation}deg`);
      stone.style.setProperty('--s', scale.toFixed(2));
      stone.dataset.progress = progress.toFixed(4);
      stonesWrap.appendChild(stone);
    });
  }

  createWalker();
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

  if (leftRailLive) leftRailLive.style.strokeDashoffset = `${leftRailLength * (1 - progress)}`;
  if (rightRailLive) rightRailLive.style.strokeDashoffset = `${rightRailLength * (1 - progress)}`;

  const stones = stonesWrap ? [...stonesWrap.children] : [];
  stones.forEach((stone) => {
    stone.classList.toggle('active', Number(stone.dataset.progress || 0) <= progress + 0.012);
  });

  if (pathWalker) {
    const point = path.getPointAtLength(progress * pathLength);
    pathWalker.style.left = `${(point.x / 1000) * 100}%`;
    pathWalker.style.top = `${(point.y / 5200) * 100}%`;
    pathWalker.style.opacity = progress <= 0.01 || progress >= 0.995 ? '0' : '1';
  }
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
  }, 140);
});
