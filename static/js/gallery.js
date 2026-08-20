window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/gallery') return;
  const stack = document.getElementById('polaroid-stack');
  const dotsWrap = document.getElementById('gallery-dots');
  const photos = Array.isArray(window.galleryPhotos) ? window.galleryPhotos : [];
  const quotes = Array.isArray(window.galleryQuotes) ? window.galleryQuotes : [];
  let fallbackTimer = null;

  if (!stack || photos.length === 0) {
    const fallback = document.createElement('div');
    fallback.textContent = 'Memories are on their way...';
    if (stack) stack.appendChild(fallback);
    fallbackTimer = setTimeout(() => window.goToPage('/letter'), 1200);
    window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
      clearTimeout(fallbackTimer);
    } } }));
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let cycleTimer = null;
  let navigationTimer = null;
  let isTransitioning = false;
  let suppressClick = false;

  function getIndex(offset) {
    return (activeIndex + offset + photos.length) % photos.length;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    photos.forEach(function (_, index) {
      const dot = document.createElement('span');
      dot.className = `gallery-dot ${index === activeIndex ? 'active' : ''}`;
      dotsWrap.appendChild(dot);
    });
  }

  function createCard(photoIndex, position, stackSize) {
    const card = document.createElement('figure');
    card.className = `polaroid-card ${position === stackSize - 1 ? 'active' : ''}`;
    card.dataset.photoIndex = String(photoIndex);
    card.setAttribute('aria-label', `Photo ${photoIndex + 1}`);
    card.style.zIndex = String(position + 1);
    card.style.setProperty('--stack-offset', `${(2 - position) * 18}px`);
    card.style.setProperty('--stack-rotate', `${(2 - position) * 6}deg`);

    const img = document.createElement('img');
    img.alt = `Memory ${photoIndex + 1}`;
    img.src = photos[photoIndex];
    img.loading = 'eager';
    img.onerror = function () {
      img.alt = 'Memory unavailable';
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#3a0d3f"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff6f9" font-size="38">💜</text></svg>');
    };

    const caption = document.createElement('figcaption');
    caption.className = 'polaroid-caption';
    caption.textContent = quotes.length > 0 ? quotes[photoIndex % quotes.length] : `Memory ${photoIndex + 1}`;

    card.appendChild(img);
    card.appendChild(caption);
    return card;
  }

  function renderStack(animateActive) {
    stack.innerHTML = '';
    let enteringCard = null;
    const stackOffsets = photos.length >= 3 ? [-2, -1, 0] : photos.length === 2 ? [-1, 0] : [0];

    stackOffsets.forEach(function (offset, position) {
      const card = createCard(getIndex(offset), position, stackOffsets.length);
      if (position === 2 && animateActive && !reducedMotion) {
        card.classList.add('entering');
        enteringCard = card;
      }
      stack.appendChild(card);
    });

    if (enteringCard) {
      requestAnimationFrame(function () {
        enteringCard.classList.remove('entering');
      });
    }

    buildDots();
  }

  function advanceGallery() {
    if (isTransitioning || photos.length < 2) return;
    isTransitioning = true;

    const oldActive = stack.querySelector('.polaroid-card.active');
    if (!oldActive) {
      isTransitioning = false;
      return;
    }

    oldActive.classList.remove('active');
    oldActive.classList.add('leaving');

    let completed = false;
    function finishTransition() {
      if (completed) return;
      completed = true;
      oldActive.removeEventListener('transitionend', finishTransition);
      clearTimeout(navigationTimer);
      activeIndex = (activeIndex + 1) % photos.length;
      renderStack(true);
      isTransitioning = false;
    }

    oldActive.addEventListener('transitionend', function (event) {
      if (event.propertyName === 'transform') finishTransition();
    });
    navigationTimer = setTimeout(finishTransition, reducedMotion ? 20 : 720);
  }

  stack.addEventListener('click', function () {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    advanceGallery();
  });

  stack.addEventListener('pointerdown', function (event) {
    if (reducedMotion) return;
    const startX = event.clientX;
    let drag = 0;

    function handleMove(eventMove) {
      drag = eventMove.clientX - startX;
      stack.style.transform = `rotateY(${drag * 0.12}deg)`;
    }

    function handleUp() {
      if (Math.abs(drag) > 30) {
        suppressClick = true;
        advanceGallery();
      }
      stack.style.transform = 'none';
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  });

  renderStack(false);

  cycleTimer = setTimeout(function cycle() {
    if (activeIndex === photos.length - 1) {
      window.goToPage('/letter');
      return;
    }
    advanceGallery();
    cycleTimer = setTimeout(cycle, reducedMotion ? 6000 : 2600);
  }, reducedMotion ? 6000 : 2600);

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    clearTimeout(cycleTimer);
    clearTimeout(navigationTimer);
  } } }));
});
