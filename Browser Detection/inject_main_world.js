/**
 * Browser Detection / inject_main_world.js
 * Main-World YouTube & HTML5 Media Execution Engine
 * 
 * Runs directly in the MAIN WORLD execution context of the page.
 * Bridges Chrome MV3 isolated world with YouTube's native player API (`#movie_player`),
 * enabling 100% functional:
 *   - Visual on-screen YouTube volume slider synchronization (`setVolume`, `unMute`, `mute`)
 *   - Dual playback speed stepping & direct rate enforcement (`setPlaybackRate`)
 *   - Video resolution switcher (`setPlaybackQualityRange`, `setPlaybackQuality`, settings menu)
 *   - Advanced window modes (Fullscreen, Theater mode, Picture-in-Picture)
 *   - Visual OSD toast feedback HUD directly over video player
 *   - Bidirectional state broadcast to content script via shared DOM attributes & CustomEvents
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(() => {
  'use strict';

  // Prevent duplicate injection in the same window context
  if (window.__MEDIA_SENTINEL_MAIN_INJECTED__) {
    return;
  }
  window.__MEDIA_SENTINEL_MAIN_INJECTED__ = true;

  // ---------------------------------------------------------------------------
  // Embedded Iframe Fullscreen Support & Policy Enforcement
  // ---------------------------------------------------------------------------
  // Guarantees Document.prototype.fullscreenEnabled and webkitFullscreenEnabled
  // return true in embedded frames so YouTube's embedded player does not show
  // "Full screen is unavailable. Learn More".
  try {
    const fsDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'fullscreenEnabled');
    if (!fsDesc || fsDesc.configurable) {
      Object.defineProperty(Document.prototype, 'fullscreenEnabled', {
        get() { return true; },
        configurable: true,
        enumerable: true
      });
    }
  } catch (_) {}

  try {
    const wkFsDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'webkitFullscreenEnabled');
    if (!wkFsDesc || wkFsDesc.configurable) {
      Object.defineProperty(Document.prototype, 'webkitFullscreenEnabled', {
        get() { return true; },
        configurable: true,
        enumerable: true
      });
    }
  } catch (_) {}

  // Hook Document.prototype.createElement to inject allowfullscreen & allow="... fullscreen" onto dynamic iframes
  try {
    const origCreateElement = Document.prototype.createElement;
    Document.prototype.createElement = function(tagName, options) {
      const element = origCreateElement.call(this, tagName, options);
      if (tagName && typeof tagName === 'string' && tagName.toLowerCase() === 'iframe') {
        try {
          element.setAttribute('allowfullscreen', 'true');
          element.setAttribute('webkitallowfullscreen', 'true');
          element.setAttribute('mozallowfullscreen', 'true');
          const curAllow = element.getAttribute('allow') || '';
          if (!curAllow) {
            element.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
          } else if (!/\bfullscreen\b/i.test(curAllow)) {
            element.setAttribute('allow', `${curAllow.trim().replace(/;$/, '')}; fullscreen`);
          }
        } catch (_) {}
      }
      return element;
    };
  } catch (_) {}

  // Discrete YouTube quality levels from lowest to highest
  const QUALITY_LADDER = [
    'tiny',     // 144p
    'small',    // 240p
    'medium',   // 360p
    'large',    // 480p
    'hd720',    // 720p HD
    'hd1080',   // 1080p FHD
    'hd1440',   // 1440p 2K QHD
    'hd2160',   // 2160p 4K UHD
    'hd2880',   // 5K
    'highres'   // 8K / HighRes
  ];

  const QUALITY_TO_LABEL = {
    'tiny': '144p',
    'small': '240p',
    'medium': '360p',
    'large': '480p',
    'hd720': '720p',
    'hd1080': '1080p',
    'hd1440': '1440p',
    'hd2160': '2160p',
    'hd2880': '2880p',
    'highres': '4320p'
  };

  // Deterministic 0.25x speed stepping ladder (strict 0.25x min, 2.0x max)
  const SPEED_LADDER = [0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0];

  function calculateNextLadderSpeed(currentSpeed, direction) {
    const cur = (typeof currentSpeed === 'number' && !isNaN(currentSpeed) && currentSpeed > 0)
      ? Math.round(currentSpeed * 100) / 100
      : 1.0;

    let closestIdx = 3; // default 1.0
    let minDiff = Infinity;
    for (let i = 0; i < SPEED_LADDER.length; i++) {
      const diff = Math.abs(SPEED_LADDER[i] - cur);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    let nextIdx;
    if (direction === 'down' || direction === -1) {
      nextIdx = Math.max(0, closestIdx - 1);
    } else {
      nextIdx = Math.min(SPEED_LADDER.length - 1, closestIdx + 1);
    }
    return SPEED_LADDER[nextIdx];
  }

  let osdTimer = null;
  let listenersAttached = false;

  /**
   * Locates the active YouTube movie_player element or HTML5 video
   */
  function getActivePlayerContext() {
    const moviePlayer = document.getElementById('movie_player') 
      || document.querySelector('.html5-video-player')
      || document.querySelector('#shorts-player');
    
    const video = (moviePlayer && moviePlayer.querySelector('video'))
      || document.querySelector('video.html5-main-video')
      || document.querySelector('video.video-stream')
      || document.querySelector('video');

    return { moviePlayer, video };
  }

  /**
   * Displays a sleek on-screen visual OSD toast over the video container
   */
  function showOSD(text, icon = '') {
    try {
      const { moviePlayer, video } = getActivePlayerContext();
      const container = moviePlayer || (video && video.parentElement) || document.body;
      if (!container) return;

      let osd = document.getElementById('__media_sentinel_osd__');
      if (!osd) {
        osd = document.createElement('div');
        osd.id = '__media_sentinel_osd__';
        osd.style.cssText = [
          'position: absolute',
          'top: 50%',
          'left: 50%',
          'transform: translate(-50%, -50%) scale(0.9)',
          'background: rgba(15, 23, 42, 0.88)',
          'backdrop-filter: blur(12px)',
          '-webkit-backdrop-filter: blur(12px)',
          'color: #ffffff',
          'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'font-size: 16px',
          'font-weight: 600',
          'padding: 10px 22px',
          'border-radius: 9999px',
          'border: 1px solid rgba(255, 255, 255, 0.25)',
          'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(16, 185, 129, 0.4)',
          'z-index: 2147483647',
          'pointer-events: none',
          'transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          'opacity: 0',
          'display: flex',
          'align-items: center',
          'gap: 8px',
          'letter-spacing: 0.5px'
        ].join(';');
        container.appendChild(osd);
      }

      if (container !== osd.parentElement) {
        container.appendChild(osd);
      }

      // W3C Trusted Types compliant DOM creation (zero innerHTML assignment to satisfy strict CSP e.g. on YouTube)
      while (osd.firstChild) {
        osd.removeChild(osd.firstChild);
      }
      const iconSpan = document.createElement('span');
      iconSpan.style.fontSize = '20px';
      iconSpan.textContent = icon || '';
      const textSpan = document.createElement('span');
      textSpan.textContent = text || '';
      osd.appendChild(iconSpan);
      osd.appendChild(textSpan);
      osd.style.opacity = '1';
      osd.style.transform = 'translate(-50%, -50%) scale(1)';

      if (osdTimer) clearTimeout(osdTimer);
      osdTimer = setTimeout(() => {
        if (osd) {
          osd.style.opacity = '0';
          osd.style.transform = 'translate(-50%, -50%) scale(0.9)';
        }
      }, 1100);
    } catch (_) {}
  }

  /**
   * Synchronizes live player state to shared DOM attributes & dispatches state events
   */
  function syncStateToBridge() {
    try {
      const { moviePlayer, video } = getActivePlayerContext();

      let quality = '';
      let availableQualities = [];
      let volume = 1.0;
      let isMuted = false;
      let playbackRate = 1.0;
      let currentTime = 0;
      let duration = 0;
      let isPlaying = false;
      let isLive = false;

      if (moviePlayer) {
        if (typeof moviePlayer.getPlaybackQuality === 'function') {
          try { quality = moviePlayer.getPlaybackQuality() || ''; } catch (_) {}
        }
        if (typeof moviePlayer.getAvailableQualityLevels === 'function') {
          try { availableQualities = moviePlayer.getAvailableQualityLevels() || []; } catch (_) {}
        }
        if (typeof moviePlayer.getVolume === 'function') {
          try { volume = moviePlayer.getVolume() / 100; } catch (_) {}
        }
        if (typeof moviePlayer.isMuted === 'function') {
          try { isMuted = moviePlayer.isMuted(); } catch (_) {}
        }
        if (typeof moviePlayer.getPlaybackRate === 'function') {
          try { playbackRate = moviePlayer.getPlaybackRate() || 1.0; } catch (_) {}
        }
        if (typeof moviePlayer.getCurrentTime === 'function') {
          try { currentTime = moviePlayer.getCurrentTime() || 0; } catch (_) {}
        }
        if (typeof moviePlayer.getDuration === 'function') {
          try { duration = moviePlayer.getDuration() || 0; } catch (_) {}
        }
        if (typeof moviePlayer.getPlayerState === 'function') {
          try {
            const st = moviePlayer.getPlayerState();
            isPlaying = (st === 1); // 1 = Playing, 2 = Paused, 3 = Buffering
          } catch (_) {}
        }
        if (typeof moviePlayer.getVideoData === 'function') {
          try {
            const vd = moviePlayer.getVideoData();
            if (vd && vd.isLive) isLive = true;
          } catch (_) {}
        }
      }

      if (video) {
        if (!volume && typeof video.volume === 'number') volume = video.volume;
        if (!isMuted && video.muted) isMuted = true;
        if (!playbackRate && video.playbackRate) playbackRate = video.playbackRate;
        if (!currentTime && video.currentTime) currentTime = video.currentTime;
        if (!duration && video.duration) duration = video.duration;
        if (!moviePlayer) isPlaying = !video.paused;
      }

      // Synchronously write to documentElement attributes (shared DOM bridge)
      const root = document.documentElement;
      if (root) {
        root.setAttribute('data-sentinel-bridge-ready', 'true');
        root.setAttribute('data-sentinel-yt-quality', quality);
        root.setAttribute('data-sentinel-yt-avail-qualities', JSON.stringify(availableQualities));
        root.setAttribute('data-sentinel-yt-volume', String(Math.round(volume * 100)));
        root.setAttribute('data-sentinel-yt-muted', String(isMuted));
        root.setAttribute('data-sentinel-yt-rate', String(playbackRate));
        root.setAttribute('data-sentinel-yt-current-time', String(currentTime));
        root.setAttribute('data-sentinel-yt-duration', String(duration));
        root.setAttribute('data-sentinel-yt-playing', String(isPlaying));
        root.setAttribute('data-sentinel-yt-live', String(isLive));
      }

      const payload = {
        quality,
        availableQualities,
        volume,
        isMuted,
        playbackRate,
        currentTime,
        duration,
        isPlaying,
        isLive,
        timestamp: Date.now()
      };

      // Dispatch event to isolated content script
      window.dispatchEvent(new CustomEvent('__MEDIA_SENTINEL_PAGE_STATE__', {
        detail: JSON.stringify(payload)
      }));

    } catch (_) {}
  }

  /**
   * Attaches YouTube native player event listeners once player is ready
   */
  function attachYouTubePlayerListeners() {
    if (listenersAttached) return;
    const { moviePlayer } = getActivePlayerContext();
    if (!moviePlayer || typeof moviePlayer.addEventListener !== 'function') return;

    try {
      moviePlayer.addEventListener('onStateChange', () => syncStateToBridge());
      moviePlayer.addEventListener('onPlaybackQualityChange', () => syncStateToBridge());
      moviePlayer.addEventListener('onPlaybackRateChange', () => syncStateToBridge());
      moviePlayer.addEventListener('onVolumeChange', () => syncStateToBridge());
      listenersAttached = true;
    } catch (_) {}
  }

  let isQualityMenuBusy = false;

  /**
   * Background menu selector to ensure YouTube switches stream when requested.
   * Locked with isQualityMenuBusy to prevent race conditions or flickering.
   */
  function tryChangeQualityViaMenu(targetLabel) {
    if (!targetLabel || isQualityMenuBusy) return;
    try {
      const settingsBtn = document.querySelector('.ytp-settings-button');
      if (!settingsBtn) return;

      isQualityMenuBusy = true;

      const isMenuOpen = Boolean(document.querySelector('.ytp-settings-menu[style*="display: block"]') 
        || document.querySelector('.ytp-popup.ytp-settings-menu:not([style*="display: none"])'));

      if (!isMenuOpen) {
        settingsBtn.click();
      }

      setTimeout(() => {
        try {
          const menuItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
          const qualityItem = menuItems.find(el => {
            const t = el.textContent || '';
            return t.includes('Quality') || t.includes('गुणवत्ता') || t.includes('Calidad') || t.includes('Qualität');
          });

          if (!qualityItem) {
            if (!isMenuOpen) {
              try { settingsBtn.click(); } catch (_) {}
            }
            isQualityMenuBusy = false;
            return;
          }

          qualityItem.click();

          setTimeout(() => {
            try {
              const qualityOptions = Array.from(document.querySelectorAll('.ytp-quality-menu .ytp-menuitem, .ytp-popup .ytp-menuitem'));
              const match = qualityOptions.find(opt => {
                const t = opt.textContent || '';
                return t.includes(targetLabel);
              });

              if (match) {
                match.click();
              } else {
                if (!isMenuOpen) {
                  try { settingsBtn.click(); } catch (_) {}
                }
              }
            } catch (_) {
              if (!isMenuOpen) {
                try { settingsBtn.click(); } catch (_) {}
              }
            } finally {
              setTimeout(() => {
                isQualityMenuBusy = false;
              }, 120);
            }
          }, 80);
        } catch (_) {
          if (!isMenuOpen) {
            try { settingsBtn.click(); } catch (_) {}
          }
          isQualityMenuBusy = false;
        }
      }, 80);
    } catch (_) {
      isQualityMenuBusy = false;
    }
  }

  /**
   * Executes control actions directly with YouTube and HTML5 APIs
   */
  function executeAction(action, data = {}) {
    const { moviePlayer, video } = getActivePlayerContext();

    switch (action) {
      // -----------------------------------------------------------------------
      // 1. VOLUME CONTROLS (Immediately drives YouTube's visual on-screen slider)
      // -----------------------------------------------------------------------
      case 'set_volume':
      case 'SET_VOLUME': {
        let vol = 1.0;
        if (typeof data.volume === 'number') {
          vol = data.volume;
        } else if (typeof data.percent === 'number') {
          vol = data.percent / 100;
        }
        vol = Math.max(0, Math.min(1, vol));
        const volPercent = Math.round(vol * 100);

        if (moviePlayer && typeof moviePlayer.setVolume === 'function') {
          try {
            moviePlayer.setVolume(volPercent);
            if (volPercent > 0 && typeof moviePlayer.isMuted === 'function' && moviePlayer.isMuted()) {
              moviePlayer.unMute();
            } else if (volPercent === 0 && typeof moviePlayer.mute === 'function') {
              moviePlayer.mute();
            }
          } catch (_) {}
        }

        if (video) {
          try {
            video.volume = vol;
            video.muted = (volPercent === 0);
          } catch (_) {}
        }

        showOSD(volPercent === 0 ? 'Muted' : `${volPercent}%`, volPercent === 0 ? '🔇' : (volPercent < 40 ? '🔉' : '🔊'));
        break;
      }

      case 'toggle_mute': {
        let isNowMuted = false;
        if (moviePlayer && typeof moviePlayer.isMuted === 'function') {
          try {
            if (moviePlayer.isMuted()) {
              if (typeof moviePlayer.unMute === 'function') moviePlayer.unMute();
              isNowMuted = false;
            } else {
              if (typeof moviePlayer.mute === 'function') moviePlayer.mute();
              isNowMuted = true;
            }
          } catch (_) {}
        }

        if (video) {
          try {
            video.muted = !video.muted;
            isNowMuted = video.muted;
          } catch (_) {}
        }

        showOSD(isNowMuted ? 'Muted' : 'Unmuted', isNowMuted ? '🔇' : '🔊');
        break;
      }

      // -----------------------------------------------------------------------
      // 2. PLAYBACK SPEED CONTROLS (+ and - Dual Stepper, Strict 0.25x Steps, Max 2.0x)
      // -----------------------------------------------------------------------
      case 'step_speed': {
        let curSpeed = 1.0;
        if (moviePlayer && typeof moviePlayer.getPlaybackRate === 'function') {
          try { curSpeed = moviePlayer.getPlaybackRate() || 1.0; } catch (_) {}
        } else if (video) {
          curSpeed = video.playbackRate || 1.0;
        }

        const newSpeed = (typeof data.targetSpeed === 'number' && data.targetSpeed >= 0.25 && data.targetSpeed <= 2.0)
          ? data.targetSpeed
          : calculateNextLadderSpeed(curSpeed, data.direction || (data.step < 0 ? 'down' : 'up'));

        if (moviePlayer && typeof moviePlayer.setPlaybackRate === 'function') {
          try { moviePlayer.setPlaybackRate(newSpeed); } catch (_) {}
        }
        if (video) {
          try { video.playbackRate = newSpeed; } catch (_) {}
        }

        showOSD(`${newSpeed.toFixed(2).replace(/\.00$/, '')}x Speed`, '⚡');
        break;
      }

      case 'set_speed': {
        if (typeof data.rate === 'number' && data.rate > 0) {
          const clamped = Math.max(0.25, Math.min(2.0, Math.round(data.rate * 100) / 100));
          if (moviePlayer && typeof moviePlayer.setPlaybackRate === 'function') {
            try { moviePlayer.setPlaybackRate(clamped); } catch (_) {}
          }
          if (video) {
            try { video.playbackRate = clamped; } catch (_) {}
          }
          showOSD(`${clamped.toFixed(2).replace(/\.00$/, '')}x Speed`, '⚡');
        }
        break;
      }

      case 'cycle_speed': {
        let cur = 1.0;
        if (moviePlayer && typeof moviePlayer.getPlaybackRate === 'function') {
          try { cur = moviePlayer.getPlaybackRate() || 1.0; } catch (_) {}
        } else if (video) {
          cur = video.playbackRate || 1.0;
        }
        const newRate = calculateNextLadderSpeed(cur, 'up');

        if (moviePlayer && typeof moviePlayer.setPlaybackRate === 'function') {
          try { moviePlayer.setPlaybackRate(newRate); } catch (_) {}
        }
        if (video) {
          try { video.playbackRate = newRate; } catch (_) {}
        }
        showOSD(`${newRate.toFixed(2).replace(/\.00$/, '')}x Speed`, '⚡');
        break;
      }

      // -----------------------------------------------------------------------
      // 3. RESOLUTION / QUALITY CONTROLS (Upper / Lower Buttons)
      // -----------------------------------------------------------------------
      case 'step_quality': {
        const direction = data.direction || (data.step < 0 ? 'down' : 'up');

        let avail = [];
        if (moviePlayer && typeof moviePlayer.getAvailableQualityLevels === 'function') {
          try { avail = moviePlayer.getAvailableQualityLevels() || []; } catch (_) {}
        }
        const filteredAvail = avail.filter(q => q && q !== 'auto');
        const validLadder = QUALITY_LADDER.filter(lvl => filteredAvail.includes(lvl));
        const candidateList = validLadder.length > 0 ? validLadder : QUALITY_LADDER;

        let curQ = '';
        if (moviePlayer && typeof moviePlayer.getPlaybackQuality === 'function') {
          try { curQ = moviePlayer.getPlaybackQuality() || ''; } catch (_) {}
        }

        let curIdx = candidateList.indexOf(curQ);
        if (curIdx === -1) {
          const vh = video ? (video.videoHeight || 720) : 720;
          if (vh >= 2160) curQ = 'hd2160';
          else if (vh >= 1440) curQ = 'hd1440';
          else if (vh >= 1080) curQ = 'hd1080';
          else if (vh >= 720) curQ = 'hd720';
          else if (vh >= 480) curQ = 'large';
          else if (vh >= 360) curQ = 'medium';
          else if (vh >= 240) curQ = 'small';
          else curQ = 'tiny';

          curIdx = candidateList.indexOf(curQ);
          if (curIdx === -1) curIdx = Math.floor(candidateList.length / 2);
        }

        let nextIdx = (direction === 'up') ? curIdx + 1 : curIdx - 1;
        nextIdx = Math.max(0, Math.min(candidateList.length - 1, nextIdx));
        const targetQuality = candidateList[nextIdx];

        if (moviePlayer) {
          if (typeof moviePlayer.setPlaybackQualityRange === 'function') {
            try { moviePlayer.setPlaybackQualityRange(targetQuality, targetQuality); } catch (_) {}
          }
          if (typeof moviePlayer.setPlaybackQuality === 'function') {
            try { moviePlayer.setPlaybackQuality(targetQuality); } catch (_) {}
          }
        }

        const label = QUALITY_TO_LABEL[targetQuality] || targetQuality;
        tryChangeQualityViaMenu(label);
        showOSD(`Quality: ${label.toUpperCase()}`, '🎞️');
        break;
      }

      case 'set_quality': {
        if (data.quality) {
          const targetQuality = data.quality;
          if (moviePlayer) {
            if (typeof moviePlayer.setPlaybackQualityRange === 'function') {
              try { moviePlayer.setPlaybackQualityRange(targetQuality, targetQuality); } catch (_) {}
            }
            if (typeof moviePlayer.setPlaybackQuality === 'function') {
              try { moviePlayer.setPlaybackQuality(targetQuality); } catch (_) {}
            }
          }
          const label = QUALITY_TO_LABEL[targetQuality] || targetQuality;
          tryChangeQualityViaMenu(label);
          showOSD(`Quality: ${label.toUpperCase()}`, '🎞️');
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 4. ADVANCED WINDOW MODES (Fullscreen, Theater Mode, Picture-in-Picture)
      // -----------------------------------------------------------------------
      case 'toggle_fullscreen': {
        if (document.fullscreenElement) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        } else {
          let handled = false;
          if (moviePlayer && typeof moviePlayer.toggleFullscreen === 'function') {
            try {
              moviePlayer.toggleFullscreen();
              handled = true;
            } catch (_) {}
          }
          if (!handled) {
            try {
              const ev = new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true });
              const target = moviePlayer || document;
              target.dispatchEvent(ev);
              handled = true;
            } catch (_) {}
          }
          if (!handled) {
            const el = (video && video.parentElement) || video || document.documentElement;
            if (el && el.requestFullscreen) {
              el.requestFullscreen().catch(() => {});
            }
          }
        }
        break;
      }

      case 'toggle_theater': {
        const sizeBtn = document.querySelector('.ytp-size-button');
        let willEnterTheater = true;
        if (sizeBtn) {
          const label = (sizeBtn.getAttribute('data-title-no-tooltip') || sizeBtn.getAttribute('aria-label') || sizeBtn.title || '').toLowerCase();
          if (label.includes('default') || label.includes('डिफ़ॉल्ट') || label.includes('standard')) {
            willEnterTheater = false;
          }
          sizeBtn.click();
        } else {
          const ev = new KeyboardEvent('keydown', { key: 't', code: 'KeyT', keyCode: 84, which: 84, bubbles: true });
          document.dispatchEvent(ev);
        }
        showOSD(willEnterTheater ? 'Theater Mode' : 'Default View', '🎬');
        break;
      }

      case 'toggle_pip': {
        if (document.pictureInPictureElement) {
          if (document.exitPictureInPicture) document.exitPictureInPicture().catch(() => {});
        } else {
          if (video && video.requestPictureInPicture) {
            video.requestPictureInPicture().catch(() => {});
          }
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 5. PLAY / PAUSE / SEEK CONTROLS (100% Reliable 3-Tier Fallback Hierarchy)
      // -----------------------------------------------------------------------
      case 'play': {
        let isHandled = false;

        // 1. Primary: YouTube #movie_player API
        if (moviePlayer && typeof moviePlayer.playVideo === 'function') {
          try {
            moviePlayer.playVideo();
            isHandled = true;
          } catch (_) {}
        }

        // 2. DOM click fallback: YouTube's native play button
        if (!isHandled || (video && video.paused)) {
          const ytPlayBtn = document.querySelector('.ytp-play-button');
          if (ytPlayBtn) {
            const label = (ytPlayBtn.getAttribute('data-title-no-tooltip') || ytPlayBtn.getAttribute('aria-label') || '').toLowerCase();
            if (label.includes('play') || !label.includes('pause')) {
              try { ytPlayBtn.click(); isHandled = true; } catch (_) {}
            }
          }
        }

        // 3. Standard HTML5 <video> fallback
        if ((!isHandled || (video && video.paused)) && video) {
          try {
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
            isHandled = true;
          } catch (_) {}
        }
        showOSD('Playing', '▶️');
        break;
      }

      case 'pause': {
        let isHandled = false;

        // 1. Primary: YouTube #movie_player API
        if (moviePlayer && typeof moviePlayer.pauseVideo === 'function') {
          try {
            moviePlayer.pauseVideo();
            isHandled = true;
          } catch (_) {}
        }

        // 2. DOM click fallback: YouTube's native pause button
        if (!isHandled || (video && !video.paused)) {
          const ytPlayBtn = document.querySelector('.ytp-play-button');
          if (ytPlayBtn) {
            const label = (ytPlayBtn.getAttribute('data-title-no-tooltip') || ytPlayBtn.getAttribute('aria-label') || '').toLowerCase();
            if (label.includes('pause') || !label.includes('play')) {
              try { ytPlayBtn.click(); isHandled = true; } catch (_) {}
            }
          }
        }

        // 3. Standard HTML5 <video> fallback
        if ((!isHandled || (video && !video.paused)) && video) {
          try {
            video.pause();
            isHandled = true;
          } catch (_) {}
        }
        showOSD('Paused', '⏸️');
        break;
      }

      case 'toggle_play': {
        let isHandled = false;

        // 1. Primary: YouTube #movie_player API
        if (moviePlayer && typeof moviePlayer.getPlayerState === 'function') {
          try {
            const st = moviePlayer.getPlayerState();
            // Player state 1 = playing, 2 = paused, 3 = buffering, -1 = unstarted, 0 = ended, 5 = cued
            if (st === 1) {
              if (typeof moviePlayer.pauseVideo === 'function') {
                moviePlayer.pauseVideo();
                isHandled = true;
                showOSD('Paused', '⏸️');
              }
            } else {
              if (typeof moviePlayer.playVideo === 'function') {
                moviePlayer.playVideo();
                isHandled = true;
                showOSD('Playing', '▶️');
              }
            }
          } catch (_) {}
        }

        // 2. DOM click fallback: YouTube's native play/pause button (.ytp-play-button)
        if (!isHandled) {
          const ytPlayBtn = document.querySelector('.ytp-play-button');
          if (ytPlayBtn) {
            try {
              ytPlayBtn.click();
              isHandled = true;
              const isNowPaused = (ytPlayBtn.getAttribute('data-title-no-tooltip') || ytPlayBtn.getAttribute('aria-label') || '').toLowerCase().includes('play');
              showOSD(isNowPaused ? 'Paused' : 'Playing', isNowPaused ? '⏸️' : '▶️');
            } catch (_) {}
          }
        }

        // 3. Standard HTML5 <video> fallback
        if (!isHandled && video) {
          try {
            if (video.paused) {
              const p = video.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
              showOSD('Playing', '▶️');
            } else {
              video.pause();
              showOSD('Paused', '⏸️');
            }
            isHandled = true;
          } catch (_) {}
        }
        break;
      }

      case 'seek_relative': {
        const offset = Number(data.offsetSeconds || 0);
        let cur = 0;
        let dur = 999999;
        if (moviePlayer && typeof moviePlayer.getCurrentTime === 'function') {
          try {
            cur = moviePlayer.getCurrentTime() || 0;
            dur = (typeof moviePlayer.getDuration === 'function' ? moviePlayer.getDuration() : 999999) || 999999;
          } catch (_) {}
        } else if (video) {
          cur = video.currentTime || 0;
          dur = video.duration || 999999;
        }

        const target = Math.max(0, Math.min(dur, cur + offset));
        if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
          try { moviePlayer.seekTo(target, true); } catch (_) {}
        } else if (video) {
          video.currentTime = target;
        }

        showOSD(`${offset >= 0 ? '+' : ''}${offset}s`, offset >= 0 ? '⏩' : '⏪');
        break;
      }

      case 'seek_percent': {
        const pct = Number(data.percent || 0);
        let dur = 0;
        if (moviePlayer && typeof moviePlayer.getDuration === 'function') {
          try { dur = moviePlayer.getDuration() || 0; } catch (_) {}
        }
        if ((!dur || dur <= 0) && video) {
          dur = video.duration || 0;
        }
        if (dur > 0) {
          const target = (pct / 100) * dur;
          if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
            try { moviePlayer.seekTo(target, true); } catch (_) {}
          } else if (video) {
            video.currentTime = target;
          }
        }
        showOSD(`${pct.toFixed(0)}%`, '📍');
        break;
      }

      default:
        break;
    }

    // Immediately synchronize state after executing any action
    setTimeout(syncStateToBridge, 50);
    setTimeout(syncStateToBridge, 250);
  }

  // ---------------------------------------------------------------------------
  // Action Listeners from Isolated World (Single-Channel Deterministic with ID Deduplication)
  // ---------------------------------------------------------------------------

  const recentActionIds = new Set();
  const lastActionTimePerType = {};

  function handleIncomingAction(detail) {
    let parsed = detail;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (_) {}
    }
    if (!parsed || !parsed.action) return;

    const action = parsed.action;
    const actionId = parsed.actionId;
    const now = Date.now();

    // 1. Strict Action ID Deduplication (Stops identical action from executing more than once)
    if (actionId) {
      if (recentActionIds.has(actionId)) {
        return;
      }
      recentActionIds.add(actionId);
      if (recentActionIds.size > 100) {
        const first = recentActionIds.values().next().value;
        recentActionIds.delete(first);
      }
    }

    // 2. Per-action Debounce / Cooldown Dictionary
    // Prevents double registration, button bounce, rapid-fire clicking, and screen flicker
    let minCooldown = 300;
    if (action === 'toggle_theater' || action === 'toggle_fullscreen' || action === 'toggle_pip') {
      minCooldown = 400; // 400ms cooldown prevents theater/fullscreen bounce & flicker
    } else if (action === 'step_quality' || action === 'set_quality') {
      minCooldown = 450; // 450ms gives settings menu & stream time to adjust
    } else if (action === 'toggle_play' || action === 'play' || action === 'pause') {
      minCooldown = 300;
    } else if (action === 'step_speed' || action === 'set_speed' || action === 'cycle_speed') {
      minCooldown = 250;
    } else if (action === 'seek_relative' || action === 'seek_percent') {
      minCooldown = 200;
    } else if (action === 'set_volume' || action === 'SET_VOLUME') {
      minCooldown = 50;
    }

    const lastTime = lastActionTimePerType[action] || 0;
    if ((now - lastTime) < minCooldown) {
      return;
    }
    lastActionTimePerType[action] = now;

    executeAction(action, parsed.data || {});
  }

  // Single Deterministic Listener: Listen ONLY on document (crosses isolated-world boundary cleanly without double-bubbling)
  document.addEventListener('__MEDIA_SENTINEL_ACTION__', (e) => {
    handleIncomingAction(e.detail);
  }, { passive: true });

  // Native window & player mode state change listeners for deterministic OSD feedback
  document.addEventListener('fullscreenchange', () => {
    const isFs = Boolean(document.fullscreenElement);
    showOSD(isFs ? 'Fullscreen' : 'Exit Fullscreen', '⛶');
    syncStateToBridge();
  }, { passive: true });

  window.addEventListener('enterpictureinpicture', () => {
    showOSD('Picture-in-Picture', '🪟');
    syncStateToBridge();
  }, { capture: true, passive: true });

  window.addEventListener('leavepictureinpicture', () => {
    showOSD('Exit PiP', '🪟');
    syncStateToBridge();
  }, { capture: true, passive: true });

  // ---------------------------------------------------------------------------
  // Initialization & Continuous Player Attachment
  // ---------------------------------------------------------------------------

  attachYouTubePlayerListeners();
  syncStateToBridge();

  // Retry attaching listeners as YouTube SPA navigates or mounts players
  [300, 800, 1500, 3000, 5000].forEach(delay => {
    setTimeout(() => {
      attachYouTubePlayerListeners();
      syncStateToBridge();
    }, delay);
  });

  // SPA navigation events on YouTube
  ['yt-navigate-finish', 'yt-page-data-updated', 'spfdone', 'yt-player-updated'].forEach(evt => {
    document.addEventListener(evt, () => {
      listenersAttached = false;
      setTimeout(() => {
        attachYouTubePlayerListeners();
        syncStateToBridge();
      }, 200);
    }, { passive: true });
  });

  // Periodic heartbeat sync every 1 second
  setInterval(() => {
    attachYouTubePlayerListeners();
    syncStateToBridge();
  }, 1000);

})();
