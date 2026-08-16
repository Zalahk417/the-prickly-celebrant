const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const journey = document.querySelector('.journey');
const stonesWrap = document.querySelector('.stones');
const svgPath = document.querySelector('#journeyPath');
const progress = document.querySelector('.path-progress');
const parallaxEls = [...document.querySelectorAll('.parallax')];

function createStones() {
  if (!journey || !stonesWrap || !svgPath) return;
  const total = svgPath.getTotalLength();
  const count = window.innerWidth < 850 ? 34 : 52;
  stonesWrap.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const p = svgPath.getPointAtLength((i / (count - 1)) * total);
    const stone = document.createElement('div');
    stone.className = 'stone';
    stone.style.left = `${p.x / 10}%`;
    stone.style.top = `${p.y / 38}%`;
    stone.style.setProperty('--r', `${-22 + Math.random() * 44}deg`);
    stone.style.setProperty('--s', `${0.78 + Math.random() * 0.38}`);
    stone.dataset.i = i;
    stonesWrap.appendChild(stone);
  }
}

function updateScrollWorld() {
  if (reduced) return;
  const y = window.scrollY;

  parallaxEls.forEach((el) => {
    const speed = Number(el.dataset.speed || 0);
    const rect = el.getBoundingClientRect();
    const centre = rect.top + rect.height / 2 - window.innerHeight / 2;
    const shift = Math.max(-90, Math.min(90, -centre * speed));
    el.style.transform = `translate3d(0, ${shift}px, 0)`;
  });

  if (!journey) return;
  const rect = journey.getBoundingClientRect();
  const travel = journey.offsetHeight - window.innerHeight;
  const local = Math.min(1, Math.max(0, -rect.top / Math.max(1, travel)));
  if (progress) progress.style.height = `${local * 100}%`;

  const stones = [...document.querySelectorAll('.stone')];
  const activeCount = Math.floor(local * stones.length);
  stones.forEach((stone, i) => stone.classList.toggle('active', i <= activeCount));
}

let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollWorld();
      ticking = false;
    });
    ticking = true;
  }
}

createStones();
updateScrollWorld();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  createStones();
  updateScrollWorld();
});
