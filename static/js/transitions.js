(function () {
  const overlay = document.getElementById('page-transition-overlay');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const musicStorageKey = 'birthday-music-state';
  const musicGestureKey = 'birthday-music-gesture';
  const defaultMusicVolume = 0.35;
  const pageContainer = document.getElementById('page-container');
  const pageScriptSources = new Set();
  let activePageCleanup = null;
  let navigationInProgress = false;

  // ENHANCEMENT: save the audio state before a real Flask route change so it survives page loads.
  function persistMusicState(playing, currentTime, volume) {
    try {
      sessionStorage.setItem(musicStorageKey, JSON.stringify({
        musicEnabled: Boolean(playing),
        musicCurrentTime: Number(currentTime) || 0,
        musicVolume: Number.isFinite(Number(volume)) ? Number(volume) : defaultMusicVolume
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
        musicCurrentTime: Number(parsed.musicCurrentTime) || 0,
        musicVolume: Number.isFinite(Number(parsed.musicVolume)) ? Number(parsed.musicVolume) : defaultMusicVolume
      };
    } catch (error) {
      return { musicEnabled: false, musicCurrentTime: 0, musicVolume: defaultMusicVolume };
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

  // ENHANCEMENT: reveal each route panel once it enters the viewport.
  function initializeReveals() {
    const revealRoot = document.querySelector('.page-reveal');
    if (!revealRoot) return;

    const revealTargets = revealRoot.querySelectorAll('.reveal-group, .reveal-item');
    if (revealTargets.length === 0) {
      revealRoot.classList.add('is-visible');
      return;
    }

    revealTargets.forEach(function (element, index) {
      element.style.setProperty('--reveal-delay', `${index * 90}ms`);
    });

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(function (element) {
        element.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    revealTargets.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initializeMusic() {
    if (!bgMusic || !musicToggle) return;

    if (!('sessionStorage' in window)) {
      disableMusicButton();
      return;
    }

    const saved = readMusicState();
    const savedTime = Math.max(0, Number(saved.musicCurrentTime) || 0);
    const savedVolume = Math.min(1, Math.max(0, Number(saved.musicVolume) || defaultMusicVolume));
    let musicEnabled = saved.musicEnabled;
    let restoreComplete = false;

    bgMusic.loop = true;
    bgMusic.volume = savedVolume;

    function saveCurrentState(isEnabled) {
      persistMusicState(isEnabled, Number(bgMusic.currentTime) || savedTime, bgMusic.volume);
    }

    function restoreAndMaybePlay() {
      if (restoreComplete) return;
      restoreComplete = true;
      if (Number.isFinite(bgMusic.duration) && savedTime < bgMusic.duration) {
        bgMusic.currentTime = savedTime;
      }
      setMusicButtonState(false);

      if (!musicEnabled) return;

      // Autoplay may be blocked after a document navigation. Preserve the enabled state.
      bgMusic.play().then(function () {
        setMusicButtonState(true);
        saveCurrentState(true);
      }).catch(function () {
        setMusicButtonState(false);
        saveCurrentState(true);
      });
    }

    bgMusic.addEventListener('loadedmetadata', restoreAndMaybePlay, { once: true });
    if (bgMusic.readyState >= 1) restoreAndMaybePlay();

    bgMusic.addEventListener('error', function () {
      disableMusicButton();
      saveCurrentState(musicEnabled);
    });

    bgMusic.addEventListener('timeupdate', function () {
      if (!bgMusic.paused && bgMusic.dataset.disabled !== 'true') {
        saveCurrentState(true);
      }
    });

    window.addEventListener('beforeunload', function () {
      saveCurrentState(musicEnabled);
    }, { once: true });

    musicToggle.addEventListener('click', async function () {
      if (bgMusic.dataset.disabled === 'true') {
        return;
      }

      markUserMusicGesture();

      if (bgMusic.paused) {
        musicEnabled = true;
        try {
          await bgMusic.play();
          setMusicButtonState(true);
          saveCurrentState(true);
        } catch (error) {
          setMusicButtonState(false);
          saveCurrentState(true);
        }
        return;
      }

      bgMusic.pause();
      musicEnabled = false;
      setMusicButtonState(false);
      saveCurrentState(false);
    });
  }

  function dispatchPageReady(path) {
    if (!pageContainer) return;
    pageContainer.dataset.pagePath = path;
    window.dispatchEvent(new CustomEvent('birthday:page-ready', { detail: { path } }));
  }

  function cleanupPage() {
    if (typeof activePageCleanup === 'function') {
      activePageCleanup();
      activePageCleanup = null;
    }
  }

  function registerPageCleanup(cleanup) {
    activePageCleanup = typeof cleanup === 'function' ? cleanup : null;
  }

  function registerExistingPageScripts() {
    document.querySelectorAll('script[src]').forEach(function (script) {
      const source = new URL(script.src, window.location.href).href;
      if (!source.endsWith('/js/transitions.js')) pageScriptSources.add(source);
    });
  }

  async function loadPageScripts(documentRoot) {
    const scripts = Array.from(documentRoot.querySelectorAll('script'));
    for (const sourceScript of scripts) {
      const source = sourceScript.getAttribute('src');
      if (source) {
        const absoluteSource = new URL(source, window.location.href).href;
        if (absoluteSource.endsWith('/js/transitions.js') || pageScriptSources.has(absoluteSource)) continue;
        await new Promise(function (resolve, reject) {
          const script = document.createElement('script');
          script.src = absoluteSource;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
        pageScriptSources.add(absoluteSource);
        continue;
      }

      const script = document.createElement('script');
      script.textContent = sourceScript.textContent;
      document.body.appendChild(script);
      script.remove();
    }
  }

  async function navigateWithinShell(url, addHistory) {
    if (!pageContainer || navigationInProgress) return;
    const targetUrl = new URL(url, window.location.href);
    if (targetUrl.origin !== window.location.origin) {
      window.location.href = targetUrl.href;
      return;
    }

    navigationInProgress = true;
    cleanupPage();
    if (overlay) {
      overlay.classList.remove('is-hidden');
      overlay.classList.add('is-visible');
    }

    try {
      const response = await fetch(targetUrl.href, { headers: { 'X-Birthday-Shell': 'true' } });
      if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);
      const responseUrl = new URL(response.url, window.location.href);
      if (responseUrl.pathname !== targetUrl.pathname) {
        window.location.href = responseUrl.href;
        return;
      }
      const responseDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
      const nextContainer = responseDocument.querySelector('#page-container');
      if (!nextContainer) throw new Error('Page container missing from response');

      pageContainer.replaceChildren(...Array.from(nextContainer.childNodes));
      document.title = responseDocument.title;
      const nextPath = responseUrl.pathname;
      if (addHistory) history.pushState({}, '', nextPath);
      await loadPageScripts(responseDocument);
      initializeReveals();
      dispatchPageReady(nextPath);
      requestAnimationFrame(function () {
        if (overlay) overlay.classList.add('is-hidden');
      });
    } catch (error) {
      if (overlay) overlay.classList.add('is-hidden');
      window.location.href = targetUrl.href;
    } finally {
      navigationInProgress = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    registerExistingPageScripts();
    spawnAmbientDecor();
    initializeReveals();
    initializeMusic();
    dispatchPageReady(window.location.pathname);

    if (overlay) {
      requestAnimationFrame(function () {
        overlay.classList.add('is-hidden');
      });
    }
  });

  window.goToPage = function (url) {
    if (!url) return;
    navigateWithinShell(url, true);
  };

  window.addEventListener('birthday:register-cleanup', function (event) {
    registerPageCleanup(event.detail && event.detail.cleanup);
  });

  window.addEventListener('popstate', function () {
    navigateWithinShell(window.location.href, false);
  });
})();
