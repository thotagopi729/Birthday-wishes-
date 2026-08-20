window.addEventListener('birthday:page-ready', function (event) {
  if (event.detail.path !== '/') return;
  let disposed = false;
  const form = document.getElementById('passcode-form');
  const input = document.getElementById('passcode-input');
  const unlockButton = document.getElementById('unlock-btn');
  const status = document.getElementById('wrong-msg');
  const card = document.getElementById('lock-card');
  const puzzleTrigger = document.getElementById('solve-puzzle-btn');
  const puzzleModal = document.getElementById('puzzle-modal');
  const puzzleCard = document.getElementById('puzzle-card');
  const puzzleForm = document.getElementById('puzzle-form');
  const puzzleAnswer = document.getElementById('puzzle-answer');
  const puzzleUnlockButton = document.getElementById('puzzle-unlock-btn');
  const puzzleStatus = document.getElementById('puzzle-status');

  if (!form || !input || !unlockButton || !status || !card || !puzzleTrigger || !puzzleModal || !puzzleCard || !puzzleForm || !puzzleAnswer || !puzzleUnlockButton || !puzzleStatus) return;

  function showStatus(message, isError = false) {
    status.textContent = message || '';
    status.style.color = isError ? '#ffbfd0' : '#f7d78c';
  }

  function triggerShake() {
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 420);
  }

  function triggerPuzzleShake() {
    puzzleCard.classList.remove('shake');
    puzzleAnswer.classList.remove('shake');
    void puzzleCard.offsetWidth;
    puzzleCard.classList.add('shake');
    puzzleAnswer.classList.add('shake');
    setTimeout(() => {
      puzzleCard.classList.remove('shake');
      puzzleAnswer.classList.remove('shake');
    }, 420);
  }

  function openPuzzle() {
    puzzleModal.hidden = false;
    puzzleModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => puzzleModal.classList.add('is-open'));
    setTimeout(() => puzzleAnswer.focus(), 180);
  }

  function closePuzzle() {
    puzzleModal.classList.remove('is-open');
    puzzleModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    setTimeout(() => { puzzleModal.hidden = true; }, 260);
  }

  puzzleTrigger.addEventListener('click', openPuzzle);
  puzzleModal.querySelectorAll('[data-close-puzzle]').forEach((element) => element.addEventListener('click', closePuzzle));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !puzzleModal.hidden) closePuzzle();
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const passcode = input.value.trim();
    if (!passcode) {
      showStatus('Please enter the passcode.', true);
      triggerShake();
      return;
    }

    unlockButton.disabled = true;
    showStatus('Checking the code...');

    try {
      const response = await fetch('/verify-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ passcode })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        unlockButton.disabled = false;
        showStatus('Ayyo 😭 niku password theliyadhu kadhaa… Sare, ee chinna puzzle solve cheyyi 🧩❤️', true);
        puzzleTrigger.hidden = false;
        triggerShake();
        input.focus();
        return;
      }

      card.classList.add('unlock-glow');
      showStatus('Unlocked!');
      setTimeout(() => {
        if (disposed) return;
        window.goToPage(data.next || '/loading');
      }, 380);
    } catch (error) {
      unlockButton.disabled = false;
      showStatus('Something went wrong. Please try again.', true);
      triggerShake();
      input.focus();
    }
  });

  puzzleForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const answer = puzzleAnswer.value.trim();
    if (!answer) {
      puzzleStatus.textContent = 'Answer enter cheyyi Ammulu ❤️';
      triggerPuzzleShake();
      return;
    }

    puzzleUnlockButton.disabled = true;
    puzzleStatus.textContent = 'Checking your secret answer...';

    try {
      const response = await fetch('/verify-puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        puzzleUnlockButton.disabled = false;
        puzzleStatus.textContent = 'Ayyayyo 😭 almost… malli try cheyyi Ammulu ❤️';
        triggerPuzzleShake();
        puzzleAnswer.focus();
        return;
      }

      puzzleCard.classList.add('puzzle-success');
      puzzleStatus.textContent = 'Awww… correct Ammulu ❤️🥹 Mana secret password dorikesindhi 🔐❤️';
      setTimeout(() => {
        if (disposed) return;
        window.goToPage(data.next || '/loading');
      }, 1500);
    } catch (error) {
      puzzleUnlockButton.disabled = false;
      puzzleStatus.textContent = 'Something went wrong. Please try again.';
      triggerPuzzleShake();
    }
  });

  window.dispatchEvent(new CustomEvent('birthday:register-cleanup', { detail: { cleanup: function () {
    disposed = true;
  } } }));
});
