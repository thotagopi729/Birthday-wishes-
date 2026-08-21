window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/finale') return;
  const cakeWrap = document.getElementById('cake-wrap');
  const cakeTrigger = document.getElementById('cake-trigger');
  const candleEls = Array.from(document.querySelectorAll('.candle'));
  const title = document.getElementById('finale-title');
  const subtitle = document.getElementById('finale-subtitle');
  const message = document.getElementById('cake-message');
  const replayButton = document.getElementById('replay-button');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finaleComplete = false;

  if (!cakeWrap || candleEls.length === 0) return;

  if (cakeTrigger) {
    cakeTrigger.addEventListener('click', function () {
      cakeWrap.hidden = false;
      cakeTrigger.hidden = true;
      cakeWrap.classList.add('is-visible');
    });
  }

  function createBurst(x, y, color) {
    const particle = document.createElement('span');
    particle.className = 'confetti-burst';
    particle.style.background = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--x', `${(Math.random() * 200 - 100).toFixed(2)}px`);
    particle.style.setProperty('--y', `${(Math.random() * 200 - 100).toFixed(2)}px`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 700);
  }

  function burstConfetti() {
    const palette = ['#ff6fa5', '#f7d78c', '#c9a4ff', '#ffc1dc', '#fff6f9'];
    if (!confettiCanvas) return;

    const context = confettiCanvas.getContext('2d');
    if (!context) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const count = reducedMotion ? 36 : 110;
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: confettiCanvas.width / 2 + (Math.random() * 180 - 90),
        y: confettiCanvas.height * 0.42 + (Math.random() * 100 - 50),
        vx: Math.random() * 7 - 3.5,
        vy: Math.random() * -7 - 2,
        gravity: 0.12 + Math.random() * 0.08,
        size: 3 + Math.random() * 5,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * Math.PI,
        spin: Math.random() * 0.2 - 0.1
      });
    }

    let frame = 0;
    function draw() {
      context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      particles.forEach(function (particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.rotation += particle.spin;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.65);
        context.restore();
      });
      frame += 1;
      if (frame < (reducedMotion ? 90 : 180)) {
        requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    draw();

    const rect = cakeWrap.getBoundingClientRect();
    const burstCount = reducedMotion ? 8 : 16;
    for (let index = 0; index < burstCount; index += 1) {
      const angle = (Math.PI * 2 * index) / burstCount;
      createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, palette[index % palette.length]);
      const particle = document.body.lastElementChild;
      if (particle && particle.classList.contains('confetti-burst')) {
        particle.style.setProperty('--x', `${Math.cos(angle) * 110}px`);
        particle.style.setProperty('--y', `${Math.sin(angle) * 110}px`);
      }
    }
  }

  function finishFinale() {
    if (finaleComplete) return;
    finaleComplete = true;
    document.body.classList.add('celebrate');
    title.style.display = 'block';
    subtitle.style.display = 'block';
    message.textContent = 'The wish is glowing...';
    burstConfetti();
    if (!reducedMotion) {
      setTimeout(() => burstConfetti(), 300);
    }
  }

  function toggleCandle(candle) {
    candle.classList.add('out');
    candle.setAttribute('aria-pressed', 'true');
    candle.style.transform = 'scaleY(0.7)';
    candle.style.opacity = '0.3';
    candle.style.filter = 'blur(0.5px)';
  }

  function blowAllCandles() {
    let newlyBlown = 0;
    candleEls.forEach(function (candle) {
      if (!candle.classList.contains('out')) {
        toggleCandle(candle);
        newlyBlown += 1;
      }
    });
    blownCount += newlyBlown;
    if (blownCount === candleEls.length) finishFinale();
  }

  let blownCount = 0;
  candleEls.forEach(candle => {
    candle.addEventListener('click', function (event) {
      event.stopPropagation();
      if (candle.classList.contains('out')) return;
      toggleCandle(candle);
      blownCount += 1;
      if (blownCount === candleEls.length) {
        finishFinale();
      }
    });
  });

  cakeWrap.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      blowAllCandles();
    }
  });

  cakeWrap.addEventListener('click', function () {
    const nextCandle = candleEls.find(function (candle) {
      return !candle.classList.contains('out');
    });
    if (!nextCandle) return;
    toggleCandle(nextCandle);
    blownCount += 1;
    if (blownCount === candleEls.length) finishFinale();
  });

  if (replayButton) {
    replayButton.addEventListener('click', function () {
      window.goToPage('/');
    });
  }

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    document.body.classList.remove('celebrate');
    document.querySelectorAll('.confetti-burst').forEach(function (particle) {
      particle.remove();
    });
    if (confettiCanvas) {
      const context = confettiCanvas.getContext('2d');
      if (context) context.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  } } }));
});
