document.addEventListener('DOMContentLoaded', function () {
  const progressBar = document.getElementById('progress-bar');
  const loadingPercent = document.getElementById('loading-percent');
  if (!progressBar || !loadingPercent) return;

  let progress = 0;
  let activeTimer = null;

  function updateProgress(value) {
    progress = Math.min(100, Math.max(0, value));
    progressBar.style.width = `${progress}%`;
    loadingPercent.textContent = `${Math.round(progress)}%`;
  }

  function finishLoading() {
    if (activeTimer) {
      clearTimeout(activeTimer);
    }
    updateProgress(100);
    activeTimer = setTimeout(function () {
      window.goToPage('/hero');
    }, 520);
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

  window.addEventListener('beforeunload', function () {
    clearInterval(intervalId);
    if (activeTimer) clearTimeout(activeTimer);
  });
});
