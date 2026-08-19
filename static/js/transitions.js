(function () {
  const overlay = document.getElementById('page-transition-overlay');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const musicStorageKey = 'birthday-music-state';
  const musicGestureKey = 'birthday-music-gesture';

  // ENHANCEMENT: save the audio state before a real Flask route change so it survives page loads.
  function persistMusicState(playing, currentTime) {
    try {
      sessionStorage.setItem(musicStorageKey, JSON.stringify({
        musicEnabled: Boolean(playing),
        musicCurrentTime: Number(currentTime) || 0
      }));
    } catch (error) {
      // Ignore storage failures in privacy-restricted browsers.
    }
  }

  function readMusicState() {
    try {
      const raw = sessionStorage.getItem(musicStorageKey);
      if (!raw) return { musicEnabled: false, musicCurrentTime: 0 };
      const parsed = JSON.parse(raw);
      return {
        musicEnabled: Boolean(parsed.musicEnabled),
        musicCurrentTime: Number(parsed.musicCurrentTime) || 0
      };
    } catch (error) {
      return { musicEnabled: false, musicCurrentTime: 0 };
    }
  }

  function hasUserMusicGesture() {
    try {
      return sessionStorage.getItem(musicGestureKey) === 'true';
    } catch (error) {
      return false;
    }
  }

  function markUserMusicGesture() {
    try {
      sessionStorage.setItem(musicGestureKey, 'true');
    } catch (error) {
      // Ignore storage failures in restricted browsers.
    }
  }

  function setMusicButtonState(isPlaying) {
    if (!musicToggle) return;
    const label = isPlaying ? '🎵 Inthandham' : '🔇';
    musicToggle.textContent = label;
    musicToggle.classList.toggle('playing', isPlaying);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
  }

  function disableMusicButton() {
    if (!musicToggle) return;
    musicToggle.disabled = true;
    musicToggle.textContent = '🔇';
    musicToggle.classList.remove('playing');
    musicToggle.setAttribute('aria-disabled', 'true');
    if (bgMusic) bgMusic.dataset.disabled = 'true';
  }

  function spawnAmbientDecor() {
    const field = document.getElementById('heart-field');
    if (!field || field.dataset.decorLoaded === 'true') return;

    field.dataset.decorLoaded = 'true';
    const heartSymbols = ['💜', '💗', '✨', '🎀'];
    const sparkleSymbols = ['✦', '✧', '❋', '✺'];

    for (let index = 0; index < 18; index += 1) {
      const heart = document.createElement('div');
      heart.className = 'float-heart';
      heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${12 + Math.random() * 18}px`;
      heart.style.animationDuration = `${10 + Math.random() * 14}s`;
      heart.style.animationDelay = `${Math.random() * 6}s`;
      field.appendChild(heart);
    }

    for (let index = 0; index < 16; index += 1) {
      const sparkle = document.createElement('div');
      sparkle.className = 'ambient-particle';
      sparkle.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${10 + Math.random() * 80}%`;
      sparkle.style.fontSize = `${8 + Math.random() * 10}px`;
      sparkle.style.animationDuration = `${8 + Math.random() * 10}s`;
      sparkle.style.animationDelay = `${Math.random() * 6}s`;
      field.appendChild(sparkle);
    }
  }

  function initializeMusic() {
    if (!bgMusic || !musicToggle) return;

    const musicSource = '/static/music/bg-music.mp3';
    bgMusic.src = musicSource;
    bgMusic.volume = 0.35;
    bgMusic.loop = true;

    if (!('sessionStorage' in window)) {
      disableMusicButton();
      return;
    }

    const saved = readMusicState();
    bgMusic.currentTime = Number(saved.musicCurrentTime) || 0;

    bgMusic.addEventListener('error', function () {
      disableMusicButton();
      persistMusicState(false, 0);
    });

    bgMusic.addEventListener('timeupdate', function () {
      if (!bgMusic.paused && bgMusic.dataset.disabled !== 'true') {
        persistMusicState(true, bgMusic.currentTime);
      }
    });

    musicToggle.addEventListener('click', async function () {
      if (bgMusic.dataset.disabled === 'true') {
        return;
      }

      markUserMusicGesture();

      if (bgMusic.paused) {
        try {
          bgMusic.currentTime = Number(bgMusic.currentTime || 0);
          await bgMusic.play();
          setMusicButtonState(true);
          persistMusicState(true, bgMusic.currentTime);
        } catch (error) {
          setMusicButtonState(false);
          persistMusicState(false, Number(bgMusic.currentTime) || 0);
        }
        return;
      }

      bgMusic.pause();
      setMusicButtonState(false);
      persistMusicState(false, Number(bgMusic.currentTime) || 0);
    });

    if (saved.musicEnabled && hasUserMusicGesture()) {
      bgMusic.play().then(function () {
        setMusicButtonState(true);
      }).catch(function () {
        setMusicButtonState(false);
        persistMusicState(false, Number(bgMusic.currentTime) || 0);
      });
      return;
    }

    setMusicButtonState(false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    spawnAmbientDecor();
    initializeMusic();

    if (overlay) {
      requestAnimationFrame(function () {
        overlay.classList.add('is-hidden');
      });
    }
  });

  window.goToPage = function (url) {
    if (!url) return;

    // ENHANCEMENT: save the audio state before the fade-out navigation begins.
    if (bgMusic && bgMusic.dataset.disabled !== 'true') {
      persistMusicState(!bgMusic.paused, Number(bgMusic.currentTime) || 0);
    } else {
      persistMusicState(false, 0);
    }

    if (!overlay) {
      window.location.href = url;
      return;
    }

    overlay.classList.remove('is-hidden');
    overlay.classList.add('is-visible');
    setTimeout(function () {
      window.location.href = url;
    }, 420);
  };
})();
