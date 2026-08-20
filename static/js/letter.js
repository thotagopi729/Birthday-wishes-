window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/letter') return;
  const card = document.getElementById('letter-card');
  const target = document.getElementById('typed-text');
  const text = window.pageLetterText || '';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let typingTimer = null;
  let finishTimer = null;

  if (!card || !target || !text) {
    setTimeout(function () {
      window.goToPage('/finale');
    }, 1000);
    return;
  }

  function typeText() {
    let index = 0;
    target.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    target.appendChild(cursor);

    function step() {
      if (index >= text.length) {
        cursor.remove();
        if (finishTimer) clearTimeout(finishTimer);
        finishTimer = setTimeout(function () {
          window.goToPage('/finale');
        }, 2000);
        return;
      }

      target.insertBefore(document.createTextNode(text[index]), cursor);
      index += 1;
      typingTimer = setTimeout(step, reducedMotion ? 1 : 26);
    }

    step();
  }

  // ENHANCEMENT: start typing only after the letter card enters the viewport.
  function startWhenVisible() {
    card.classList.add('visible');
    typeText();
  }

  if (reducedMotion || !('IntersectionObserver' in window)) {
    startWhenVisible();
  } else {
    const observer = new IntersectionObserver(function (entries, currentObserver) {
      if (!entries[0].isIntersecting) return;
      startWhenVisible();
      currentObserver.disconnect();
    }, { threshold: 0.25 });
    observer.observe(card);
  }

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    if (typingTimer) clearTimeout(typingTimer);
    if (finishTimer) clearTimeout(finishTimer);
  } } }));
});
