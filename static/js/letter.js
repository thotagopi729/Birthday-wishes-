let letterInitialized = false;

function initializeLetter() {
  if (letterInitialized) return;
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
  letterInitialized = true;

  function revealContinueButton() {
    if (!continueButton) return;
    continueButton.hidden = false;
    continueButton.disabled = false;
    continueButton.style.visibility = 'visible';
    continueButton.style.opacity = '1';
    continueButton.setAttribute('aria-hidden', 'false');
  }

  function typeText() {
    let index = 0;
    target.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    target.appendChild(cursor);

    function step() {
      if (index >= text.length) {
        if (cursor && cursor.parentNode) cursor.remove();
        revealContinueButton();
        return;
      }

      target.insertBefore(document.createTextNode(text[index]), cursor);
      index += 1;
      typingTimer = setTimeout(step, reducedMotion ? 1 : 26);
    }

    step();
  }

  function startLetter() {
    if (!card || !target) return;
    card.hidden = false;
    card.classList.add('visible');
    if (continueButton) {
      continueButton.hidden = true;
      continueButton.disabled = true;
      continueButton.style.visibility = 'hidden';
      continueButton.style.opacity = '0';
    }
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
    letterInitialized = false;
  } } }));
}

window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path === '/letter') initializeLetter();
});

if (document.getElementById('letter-card')) {
  initializeLetter();
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLetter, { once: true });
}
