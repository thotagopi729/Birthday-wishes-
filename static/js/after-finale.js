window.addEventListener('birthday:page-ready', function (event) {
  const path = event.detail.path;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;

  if (path === '/one-last-thing') {
    const button = document.getElementById('open-hug');
    if (button) button.addEventListener('click', function () {
      window.goToPage('/hug');
    });
  }

  if (path === '/hug') {
    const heart = document.getElementById('hug-heart');
    const message = document.getElementById('hug-message');
    const button = document.getElementById('open-midnight');
    if (heart && message) heart.addEventListener('click', function () {
      heart.disabled = true;
      heart.classList.add('is-tapped');
      message.hidden = false;
      message.classList.add('is-visible');
      timer = window.setTimeout(function () {
        if (button) button.hidden = false;
      }, reducedMotion ? 1 : 900);
    });
    if (button) button.addEventListener('click', function () {
      window.goToPage('/midnight');
    });
  }

  if (path === '/midnight') {
    const first = document.getElementById('midnight-first');
    const second = document.getElementById('midnight-second');
    const button = document.getElementById('open-final-photo');
    timer = window.setTimeout(function () {
      if (first) first.classList.add('is-faded');
      timer = window.setTimeout(function () {
        if (first) first.hidden = true;
        if (second) {
          second.hidden = false;
          second.classList.add('is-visible');
        }
        if (button) button.hidden = false;
      }, reducedMotion ? 1 : 900);
    }, reducedMotion ? 1 : 1800);
    if (button) button.addEventListener('click', function () {
      window.goToPage('/final-photo');
    });
  }

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    if (timer) window.clearTimeout(timer);
  } } }));
});
