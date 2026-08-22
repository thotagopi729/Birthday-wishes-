window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/hero') return;
  const title = document.querySelector('.hero-title');
  const count = document.getElementById('celebration-count');
  const message = document.getElementById('celebration-message');
  const continueButton = document.getElementById('hero-continue');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;
  let disposed = false;

  if (title) {
    title.querySelectorAll('.hero-title-line, .hero-name').forEach(function (element, index) {
      element.style.opacity = '0';
      element.style.transform = reducedMotion ? 'none' : 'translateY(18px)';
      window.setTimeout(function () {
        if (disposed) return;
        element.style.transition = 'opacity 420ms ease, transform 420ms ease';
        element.style.opacity = '1';
        element.style.transform = 'none';
      }, reducedMotion ? 0 : index * 420);
    });
  }

  const frames = ['3', '2', '1'];
  let frameIndex = 0;
  function showNextFrame() {
    if (disposed) return;
    if (frameIndex >= frames.length) {
      if (count) count.textContent = '💥';
      if (message) message.textContent = 'THE WAIT IS OVER ❤️';
      timer = window.setTimeout(function () {
        if (disposed) return;
        if (message) message.textContent = 'HAPPY BIRTHDAY, AMMULU! 🎂❤️';
        if (continueButton) continueButton.hidden = false;
      }, reducedMotion ? 1 : 1000);
      return;
    }
    if (count) count.textContent = frames[frameIndex];
    frameIndex += 1;
    timer = window.setTimeout(showNextFrame, reducedMotion ? 1 : 800);
  }
  showNextFrame();

  if (continueButton) {
    continueButton.addEventListener('click', function () {
      window.goToPage('/gallery');
    });
  }

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    disposed = true;
    if (timer) window.clearTimeout(timer);
  } } }));
});
