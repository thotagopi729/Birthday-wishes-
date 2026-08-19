document.addEventListener('DOMContentLoaded', function () {
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

  if (!reducedMotion) {
    card.classList.add('visible');
  } else {
    card.classList.add('visible');
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

  typeText();

  window.addEventListener('beforeunload', function () {
    if (typingTimer) clearTimeout(typingTimer);
    if (finishTimer) clearTimeout(finishTimer);
  });
});
