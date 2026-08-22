window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/loading') return;
  const progressBar = document.getElementById('progress-bar');
  const loadingPercent = document.getElementById('loading-percent');
  const readyMessage = document.getElementById('loading-ready');
  const continueButton = document.getElementById('loading-continue');
  if (!progressBar || !loadingPercent) return;

  let progress = 0;

  function updateProgress(value) {
    progress = Math.min(100, Math.max(0, value));
    progressBar.style.width = `${progress}%`;
    loadingPercent.textContent = `${Math.round(progress)}%`;
  }

  function finishLoading() {
    updateProgress(100);
    if (readyMessage) readyMessage.hidden = false;
    if (continueButton) continueButton.hidden = false;
  }

  const intervalId = setInterval(function () {
    if (progress >= 100) {
      clearInterval(intervalId);
      finishLoading();
      return;
    }

    const nextStep = Math.min(100, progress + Math.random() * 14 + 8);
    updateProgress(nextStep);
  }, 180);

  if (continueButton) {
    continueButton.addEventListener('click', function () {
      window.goToPage('/hero');
    });
  }

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    clearInterval(intervalId);
  } } }));
});
