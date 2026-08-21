window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/hero') return;
  const title = document.querySelector('.hero-title');
  const name = document.querySelector('.hero-name');
  const countdownFrames = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs')
  };
  const doneLabel = document.getElementById('countdown-done');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateTitle() {
    if (!title) return;
    const words = title.querySelectorAll('.hero-title-line, .hero-name');
    words.forEach(function (element, index) {
      const delay = reducedMotion ? 0 : index * 420;
      element.style.opacity = '0';
      element.style.transform = reducedMotion ? 'none' : 'translateY(18px)';
      setTimeout(function () {
        element.style.transition = 'opacity 420ms ease, transform 420ms ease';
        element.style.opacity = '1';
        element.style.transform = 'none';
      }, delay);
    });
  }

  function updateCountdownDisplay(target, value) {
    if (!target) return;
    target.textContent = String(value).padStart(2, '0');
    target.classList.remove('count-flash');
    void target.offsetWidth;
    target.classList.add('count-flash');
    setTimeout(function () {
      target.classList.remove('count-flash');
    }, 420);
  }

  function nextBirthdayCountdown() {
    const birthdayDate = new Date();
    birthdayDate.setMonth(7, 22);
    birthdayDate.setHours(0, 0, 0, 0);

    if (birthdayDate <= new Date()) {
      birthdayDate.setFullYear(birthdayDate.getFullYear() + 1);
    }

    function render() {
      const now = new Date();
      const diff = birthdayDate - now;
      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      updateCountdownDisplay(countdownFrames.days, days);
      updateCountdownDisplay(countdownFrames.hours, hours);
      updateCountdownDisplay(countdownFrames.mins, mins);
      updateCountdownDisplay(countdownFrames.secs, secs);

      if (totalSeconds <= 0) {
        if (doneLabel) {
          doneLabel.style.display = 'block';
        }
        return;
      }

      if (doneLabel) {
        doneLabel.style.display = 'none';
      }
    }

    render();
    return setInterval(render, 1000);
  }

  const continueButton = document.getElementById('hero-continue');

  animateTitle();
  const countdownInterval = nextBirthdayCountdown();

  if (continueButton) {
    continueButton.addEventListener('click', function () {
      window.goToPage('/gallery');
    });
  }

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    if (countdownInterval) clearInterval(countdownInterval);
  } } }));
});
