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
  const nextButton = document.getElementById('gallery-next');
  const progressLabel = document.getElementById('gallery-progress');
  let activeIndex = 0;
  let isTransitioning = false;

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

  function updateProgress() {
    if (progressLabel) {
      progressLabel.textContent = `${activeIndex + 1} / ${photos.length}`;
    }

    if (nextButton) {
      nextButton.textContent = activeIndex === photos.length - 1 ? 'Read My Letter →' : 'Next Memory →';
    }
  }

  function renderStack() {
    stack.innerHTML = '';
    const card = createCard(activeIndex, 0, 1);
    card.classList.add('active');
    stack.appendChild(card);
    buildDots();
    updateProgress();
  }

  function advanceGallery() {
    if (isTransitioning || photos.length < 1) return;
    isTransitioning = true;

    if (activeIndex >= photos.length - 1) {
      window.goToPage('/letter');
      isTransitioning = false;
      return;
    }

    activeIndex += 1;
    renderStack();
    isTransitioning = false;
  }

  if (nextButton) {
    nextButton.addEventListener('click', advanceGallery);
  }

  renderStack();

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    isTransitioning = false;
  } } }));
});
