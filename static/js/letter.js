window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/letter') return;
  const card = document.getElementById('letter-card');
  const target = document.getElementById('typed-text');
  const beginButton = document.getElementById('letter-begin');
  const continueButton = document.getElementById('letter-continue');
  const text = window.pageLetterText || '';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let typingTimer = null;

  if (!card || !target || !text) {
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
        if (continueButton) {
          continueButton.hidden = false;
        }
        return;
      }

      target.insertBefore(document.createTextNode(text[index]), cursor);
      index += 1;
      typingTimer = setTimeout(step, reducedMotion ? 1 : 26);
    }

    step();
  }

  function startLetter() {
    card.hidden = false;
    card.classList.add('visible');
    typeText();
    if (beginButton) beginButton.hidden = true;
  }

  if (beginButton) {
    beginButton.addEventListener('click', startLetter);
  }

  if (continueButton) {
    continueButton.addEventListener('click', function () {
      window.goToPage('/finale');
    });
  }

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    if (typingTimer) clearTimeout(typingTimer);
  } } }));
});
