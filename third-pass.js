(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  // script.js injects second-pass.css at runtime. Move the third-pass link after it so
  // the newest creative-direction layer always wins equal-specificity cascade rules.
  const thirdPassLink = document.querySelector('link[href="third-pass.css"]');
  const secondPassLink = document.querySelector('link[data-second-pass]');
  if (thirdPassLink && secondPassLink) document.head.appendChild(thirdPassLink);

  // Fixed editorial scroll marker.
  if (!document.querySelector('.scene-progress')) {
    const meter = document.createElement('div');
    meter.className = 'scene-progress';
    meter.setAttribute('aria-hidden', 'true');
    meter.innerHTML = '<strong data-scene-percent>00</strong><div class="scene-progress-track"><span class="scene-progress-fill" data-scene-fill></span></div><small>down the prickly path</small>';
    document.body.appendChild(meter);
  }

  // A deliberate full-screen rule change after the long pathway.
  const journey = document.querySelector('.journey');
  const manifesto = document.querySelector('.manifesto');
  if (journey && manifesto && !document.querySelector('.rule-break')) {
    const overflow = document.createElement('div');
    overflow.className = 'cactus-overflow';
    overflow.setAttribute('aria-hidden', 'true');
    overflow.innerHTML = '<figure><img src="assets/03_cactus_bowl.jpeg" alt=""></figure>';

    const section = document.createElement('section');
    section.className = 'rule-break';
    section.innerHTML = `
      <div class="rule-break-sticky">
        <div class="rule-break-copy">
          <p class="kicker">RULE NUMBER ONE</p>
          <h2>DON'T DO<br><em>BORING.</em></h2>
          <p>The legal bits still get done. The room still knows what is happening. We just refuse to sand every interesting edge off the people getting married.</p>
        </div>
        <figure class="rule-break-art" data-rule-art>
          <img src="assets/10_logo.png" alt="The Prickly Celebrant illustrated logo">
        </figure>
        <div class="rule-break-ghost" data-rule-ghost aria-hidden="true">PRICKLY</div>
        <div class="rule-break-stamp" aria-hidden="true">WARM • WEIRD • WONDERFUL •</div>
      </div>`;

    journey.insertAdjacentElement('afterend', overflow);
    overflow.insertAdjacentElement('afterend', section);
  }

  // Dense, repetitive image sequence: the visual rule changes again.
  if (manifesto && !document.querySelector('.image-river')) {
    const assets = [
      ['01_infinity_couple.jpeg', 'two heads / one wild idea'],
      ['04_cactus_candles.jpeg', 'romance / with edges'],
      ['05_ring_hands.jpeg', 'tiny rings / big energy'],
      ['06_cactus_collection.jpeg', 'a prickly little crowd'],
      ['07_marker_hand.jpeg', 'draw outside the lines'],
      ['08_cactus_garden.jpeg', 'more is sometimes more'],
      ['09_services_poster.png', 'pick your prickly'],
      ['03_cactus_bowl.jpeg', 'organised chaos']
    ];

    const makeCards = (repeat = 2) => {
      const cards = [];
      for (let r = 0; r < repeat; r += 1) {
        assets.forEach(([src, caption], index) => {
          cards.push(`<figure class="river-card"><img src="assets/${src}" alt="Prickly Celebrant artwork"><figcaption><span>${caption}</span><span>${String(index + 1).padStart(2, '0')}</span></figcaption></figure>`);
        });
      }
      return cards.join('');
    };

    const river = document.createElement('section');
    river.className = 'image-river';
    river.innerHTML = `
      <div class="image-river-header">
        <div>
          <p class="kicker">A LOT OF VERY SERIOUS VISUAL RESEARCH</p>
          <h2>Same people.<br>Different rules.</h2>
        </div>
        <p>The best celebrations have repetition, callbacks, little surprises and things that make sense only to the people in the room. This bit of the site behaves the same way.</p>
      </div>
      <div class="river-row row-a">${makeCards(2)}</div>
      <div class="river-row row-b">${makeCards(2)}</div>`;
    manifesto.insertAdjacentElement('afterend', river);
  }

  // One more abrupt palette change before the final contact sequence.
  const vibe = document.querySelector('.vibe');
  const ticker = document.querySelector('.ticker');
  if (vibe && ticker && !document.querySelector('.statement-slam')) {
    const slam = document.createElement('section');
    slam.className = 'statement-slam';
    slam.innerHTML = `
      <div class="orbit" aria-hidden="true"></div>
      <h2 aria-label="Not perfect. Alive."><span class="outline">NOT PERFECT.</span><span class="cream">ALIVE.</span></h2>`;
    vibe.insertAdjacentElement('afterend', slam);
  }

  // Add a few centre stepping stones at selected moments so the two rails read as a walkway,
  // without turning back into a single continuous breadcrumb line.
  const decoratePath = () => {
    const path = document.querySelector('#journeyPath');
    const wrap = document.querySelector('.stones');
    if (!path || !wrap) return;
    wrap.querySelectorAll('.cross-stone').forEach((el) => el.remove());
    const total = path.getTotalLength();
    [0.075, 0.18, 0.31, 0.455, 0.57, 0.705, 0.84, 0.94].forEach((progress, index) => {
      const p = path.getPointAtLength(total * progress);
      const stone = document.createElement('span');
      stone.className = 'stone cross-stone';
      stone.style.left = `${(p.x / 1000) * 100}%`;
      stone.style.top = `${(p.y / 5200) * 100}%`;
      stone.style.setProperty('--r', `${-18 + ((index * 23) % 39)}deg`);
      stone.style.setProperty('--s', `${0.7 + ((index * 11) % 19) / 100}`);
      stone.dataset.progress = String(progress);
      wrap.appendChild(stone);
    });
  };

  decoratePath();

  // Subtle pointer tilt lives on child images, so it does not fight the existing parallax transforms.
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    const kineticImages = document.querySelectorAll('.hero-art img, .stop-art img, .manifesto-art img, .rule-break-art img, .river-card img, .gallery-card img, .finale-art img');
    kineticImages.forEach((img) => {
      img.classList.add('kinetic-img');
      img.addEventListener('pointermove', (event) => {
        const rect = img.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        img.style.setProperty('--tilt-x', `${(-py * 5).toFixed(2)}deg`);
        img.style.setProperty('--tilt-y', `${(px * 6).toFixed(2)}deg`);
        img.classList.add('is-hovered');
      });
      img.addEventListener('pointerleave', () => {
        img.style.setProperty('--tilt-x', '0deg');
        img.style.setProperty('--tilt-y', '0deg');
        img.classList.remove('is-hovered');
      });
    });
  }

  const percent = document.querySelector('[data-scene-percent]');
  const fill = document.querySelector('[data-scene-fill]');
  const ruleBreak = document.querySelector('.rule-break');
  const ruleGhost = document.querySelector('[data-rule-ghost]');
  const ruleArt = document.querySelector('[data-rule-art]');
  let ticking = false;

  const update = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = clamp01(window.scrollY / maxScroll);
    if (percent) percent.textContent = String(Math.round(pageProgress * 100)).padStart(2, '0');
    if (fill) fill.style.height = `${pageProgress * 100}%`;

    if (ruleBreak && !reduceMotion) {
      const rect = ruleBreak.getBoundingClientRect();
      const travel = Math.max(1, ruleBreak.offsetHeight - window.innerHeight);
      const p = clamp01(-rect.top / travel);
      if (ruleGhost) {
        ruleGhost.style.setProperty('--ghost-x', `${(-12 + p * 25).toFixed(2)}vw`);
        ruleGhost.style.setProperty('--ghost-y', `${(8 - p * 16).toFixed(2)}vh`);
      }
      if (ruleArt) {
        ruleArt.style.translate = `0 ${(18 - p * 36).toFixed(2)}px`;
        ruleArt.style.rotate = `${(5 - p * 10).toFixed(2)}deg`;
        ruleArt.style.scale = `${(0.94 + p * 0.12).toFixed(3)}`;
      }
    }

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      decoratePath();
      update();
    }, 260);
  });
})();
