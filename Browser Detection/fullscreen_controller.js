/**
 * Web Activity & Media Sentinel - Dedicated Modular Fullscreen Controller
 * 
 * Solves the W3C Transient User Gesture & Double-Toggle Browser Restrictions:
 * 1. Root Cause 1 (W3C Security Boundary): Native `requestFullscreen()` requires `navigator.userActivation.isActive === true`.
 *    Calls from extension popups, background workers, or dashboard frames execute outside the tab document activation scope,
 *    causing Chrome to reject `requestFullscreen()` with "API can only be initiated by a user gesture".
 * 2. Root Cause 2 (Event Trust): Synthetic events (`ytFsBtn.click()`, dispatching 'KeyF') have `isTrusted: false` and are ignored by YouTube.
 * 3. Root Cause 3 (Double-Toggle Race Condition): Content script (isolated world) and main world script both reacting to the same
 *    fullscreen toggle event resulted in one adding the fullscreen class and the other immediately removing it within 2ms.
 * 4. Root Cause 4 (Inline Dimension Overrides): YouTube and modern video players apply dynamic inline pixel dimensions to <video>
 *    and parent containers (`width: 854px; height: 480px;`). Without aggressive !important CSS overrides for all parent containers
 *    and video elements, web fullscreen fails to fill the viewport.
 * 
 * The Architecture:
 * - Exposes unified controller on `window.__SentinelFullscreenController`.
 * - Cross-World DOM Attribute Debounce Guard (`data-sentinel-fs-ts`) to completely eliminate double-toggle races.
 * - Guaranteed Web Fullscreen (CSS Viewport Fill) with 100vw/100vh, fixed positioning, container resets, and masthead/sidebar concealment.
 * - In-Page Floating Sentinel Fullscreen HUD Button injected onto the video player that receives real physical clicks (`isTrusted: true`),
 *   initiating true native OS-level fullscreen.
 * - Double-click video listener and ESC key exit handler.
 * - 100% W3C Trusted Types safe (Zero assignments to innerHTML).
 */

(function () {
  'use strict';

  // Guard against redundant execution in the same JavaScript world
  if (typeof window !== 'undefined' && window.__SentinelFullscreenController && window.__SentinelFullscreenController.__initialized) {
    return;
  }

  const STYLE_ID = '__sentinel_fullscreen_controller_styles__';
  const FLOATING_BTN_ID = '__sentinel_fs_floating_btn__';
  const LOCK_ATTR = 'data-sentinel-fs-ts';
  const DEBOUNCE_MS = 350;

  let isWebFullscreenActive = false;
  let lastToggleTime = 0;
  let floatingBtnElement = null;
  let hideBtnTimeout = null;

  /**
   * Acquire cross-world deduplication lock.
   * Prevents double-toggle races across isolated world, main world, and iframe boundaries.
   */
  function acquireLock() {
    const now = Date.now();
    if (now - lastToggleTime < DEBOUNCE_MS) {
      return false;
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      const domTs = parseInt(document.documentElement.getAttribute(LOCK_ATTR) || '0', 10);
      if (now - domTs < DEBOUNCE_MS) {
        return false;
      }
      document.documentElement.setAttribute(LOCK_ATTR, String(now));
    }
    lastToggleTime = now;
    return true;
  }

  /**
   * Injects comprehensive CSS rules for guaranteed Web Fullscreen and in-page HUD button
   */
  function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    try {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        /* Guaranteed Web Fullscreen: Viewport Lock */
        html.sentinel-fullscreen-active,
        body.sentinel-fullscreen-active,
        html.sentinel-has-web-fullscreen,
        body.sentinel-has-web-fullscreen {
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
          min-width: 100vw !important;
          min-height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
        }

        /* Conceal surrounding YouTube UI: masthead, sidebars, comments, header, below player */
        .sentinel-fullscreen-active #masthead-container,
        .sentinel-fullscreen-active ytd-masthead,
        .sentinel-fullscreen-active #masthead,
        .sentinel-fullscreen-active #secondary,
        .sentinel-fullscreen-active #secondary-inner,
        .sentinel-fullscreen-active #comments,
        .sentinel-fullscreen-active #below,
        .sentinel-fullscreen-active #chat,
        .sentinel-fullscreen-active ytd-live-chat-frame,
        .sentinel-fullscreen-active ytd-playlist-panel-renderer,
        .sentinel-fullscreen-active ytd-merch-shelf-renderer,
        .sentinel-fullscreen-active #header,
        .sentinel-fullscreen-active header,
        .sentinel-fullscreen-active nav,
        .sentinel-fullscreen-active .site-header,
        .sentinel-fullscreen-active .navbar,
        .sentinel-has-web-fullscreen #masthead-container,
        .sentinel-has-web-fullscreen ytd-masthead,
        .sentinel-has-web-fullscreen #masthead,
        .sentinel-has-web-fullscreen #secondary,
        .sentinel-has-web-fullscreen #comments,
        .sentinel-has-web-fullscreen #below {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Container Neutralization: eliminate contain, transform, filter, perspective that trap fixed elements */
        .sentinel-fullscreen-active ytd-app,
        .sentinel-fullscreen-active #content,
        .sentinel-fullscreen-active #page-manager,
        .sentinel-fullscreen-active ytd-watch-flexy,
        .sentinel-fullscreen-active ytd-watch-grid,
        .sentinel-fullscreen-active #columns,
        .sentinel-fullscreen-active #primary,
        .sentinel-fullscreen-active #primary-inner,
        .sentinel-fullscreen-active #player,
        .sentinel-fullscreen-active #player-container-outer,
        .sentinel-fullscreen-active #player-container-inner,
        .sentinel-fullscreen-active #player-container,
        .sentinel-fullscreen-active #player-full-bleed-container,
        .sentinel-has-web-fullscreen ytd-app,
        .sentinel-has-web-fullscreen #content,
        .sentinel-has-web-fullscreen #page-manager,
        .sentinel-has-web-fullscreen ytd-watch-flexy,
        .sentinel-has-web-fullscreen ytd-watch-grid,
        .sentinel-has-web-fullscreen #columns,
        .sentinel-has-web-fullscreen #primary,
        .sentinel-has-web-fullscreen #primary-inner,
        .sentinel-has-web-fullscreen #player,
        .sentinel-has-web-fullscreen #player-container-outer,
        .sentinel-has-web-fullscreen #player-container-inner,
        .sentinel-has-web-fullscreen #player-container {
          contain: none !important;
          transform: none !important;
          filter: none !important;
          perspective: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
        }

        /* Target Fullscreen Element (Video Player Container or Video) */
        .sentinel-web-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          min-width: 100vw !important;
          min-height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          z-index: 2147483647 !important;
          background: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        /* Force YouTube video container to fill 100vw / 100vh */
        .sentinel-web-fullscreen .html5-video-container {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          top: 0 !important;
          left: 0 !important;
          position: absolute !important;
        }

        /* Force HTML5 <video> to fill screen while preserving aspect ratio */
        .sentinel-web-fullscreen video,
        .sentinel-web-fullscreen video.html5-main-video {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          left: 0 !important;
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          position: absolute !important;
          object-fit: contain !important;
          margin: auto !important;
        }

        /* YouTube control bar at bottom */
        .sentinel-web-fullscreen .ytp-chrome-bottom {
          width: 100% !important;
          left: 0 !important;
          bottom: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          padding: 0 16px !important;
          z-index: 2147483647 !important;
        }

        /* In-Page Floating Sentinel Fullscreen HUD Button */
        .sentinel-fs-floating-btn {
          position: absolute !important;
          top: 16px !important;
          right: 16px !important;
          width: 38px !important;
          height: 38px !important;
          border-radius: 8px !important;
          background: rgba(15, 23, 42, 0.8) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          color: #38bdf8 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          z-index: 2147483645 !important;
          opacity: 0 !important;
          transform: scale(0.92) !important;
          transition: opacity 0.25s ease, transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
          pointer-events: auto !important;
          user-select: none !important;
          box-sizing: border-box !important;
          padding: 0 !important;
        }

        .sentinel-fs-floating-btn.visible,
        .sentinel-fs-floating-btn:hover {
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        .sentinel-fs-floating-btn:hover {
          background: rgba(15, 23, 42, 0.95) !important;
          border-color: #38bdf8 !important;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.6) !important;
          color: #ffffff !important;
          transform: scale(1.08) !important;
        }

        .sentinel-fs-floating-btn:active {
          transform: scale(0.96) !important;
        }

        .sentinel-fs-floating-btn svg {
          width: 20px !important;
          height: 20px !important;
          stroke: currentColor !important;
          fill: none !important;
          stroke-width: 2 !important;
          stroke-linecap: round !important;
          stroke-linejoin: round !important;
          pointer-events: none !important;
        }

        /* Sentinel On-Screen Display (OSD) Notification */
        .__sentinel_fs_osd__ {
          position: fixed !important;
          top: 15% !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: rgba(15, 23, 42, 0.92) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(56, 189, 248, 0.4) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.3) !important;
          color: #f8fafc !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          padding: 10px 22px !important;
          border-radius: 9999px !important;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          opacity: 0 !important;
          transition: opacity 0.25s ease, transform 0.25s ease !important;
          white-space: nowrap !important;
        }

        .__sentinel_fs_osd__.visible {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) !important;
        }
      `;
      (document.head || document.documentElement || document.body).appendChild(style);
    } catch (_) {}
  }

  /**
   * Set SVG icon without innerHTML (100% W3C Trusted Types Safe)
   */
  function setSvgIcon(btn, isExit) {
    if (!btn || typeof document === 'undefined') return;
    while (btn.firstChild) {
      btn.removeChild(btn.firstChild);
    }
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', isExit
        ? 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'
        : 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'
      );
      svg.appendChild(path);
      btn.appendChild(svg);
    } catch (_) {}
  }

  /**
   * Show On-Screen Display notification (Zero innerHTML, Trusted Types compliant)
   */
  function showOSD(text, icon = '⛶') {
    if (typeof document === 'undefined') return;
    try {
      let osd = document.getElementById('__sentinel_fullscreen_osd__');
      if (!osd) {
        osd = document.createElement('div');
        osd.id = '__sentinel_fullscreen_osd__';
        osd.className = '__sentinel_fs_osd__';
        (document.body || document.documentElement).appendChild(osd);
      }
      while (osd.firstChild) {
        osd.removeChild(osd.firstChild);
      }
      const iconSpan = document.createElement('span');
      iconSpan.textContent = icon;
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      osd.appendChild(iconSpan);
      osd.appendChild(textSpan);

      osd.classList.add('visible');
      clearTimeout(osd.__hideTimer);
      osd.__hideTimer = setTimeout(() => {
        osd.classList.remove('visible');
      }, 1200);
    } catch (_) {}
  }

  /**
   * Check whether any fullscreen mode (native or web) is currently active
   */
  function isFullscreenActive() {
    if (typeof document === 'undefined') return false;
    return Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.querySelector('.sentinel-web-fullscreen') ||
      (document.documentElement && document.documentElement.classList.contains('sentinel-fullscreen-active')) ||
      (document.body && document.body.classList.contains('sentinel-fullscreen-active'))
    );
  }

  /**
   * Updates floating button icon according to active fullscreen status
   */
  function updateFloatingButtonIcon() {
    if (!floatingBtnElement) return;
    const active = isFullscreenActive();
    setSvgIcon(floatingBtnElement, active);
    floatingBtnElement.title = active
      ? 'Exit Fullscreen (ESC)'
      : 'Antigravity Sentinel Fullscreen (Click for Native, Shift+Click for Web)';
  }

  /**
   * Helper to locate best target player or video container.
   * Prioritizes player containers (#movie_player, .html5-video-player) to prevent
   * inline container dimensions (854x480) from clipping or trapping HTML5 videos.
   */
  function getTargetElement(preferredTarget) {
    if (typeof document === 'undefined') return preferredTarget || null;

    // 1. YouTube player container is always the primary target on YouTube
    const ytPlayer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    if (ytPlayer) {
      return ytPlayer;
    }

    // 2. If a preferredTarget is supplied
    if (preferredTarget && (preferredTarget.nodeType === 1 || (typeof HTMLElement !== 'undefined' && preferredTarget instanceof HTMLElement))) {
      // If preferredTarget is a video element, search for player container ancestors
      if (preferredTarget.tagName === 'VIDEO' || preferredTarget.nodeName === 'VIDEO') {
        const container = (typeof preferredTarget.closest === 'function')
          ? preferredTarget.closest('#movie_player, .html5-video-player, ytd-player, .video-stream-container, .player-container, .jwplayer, [data-player-container]')
          : null;
        if (container) return container;
        if (preferredTarget.parentElement && preferredTarget.parentElement !== document.body && preferredTarget.parentElement !== document.documentElement) {
          return preferredTarget.parentElement;
        }
      }
      return preferredTarget;
    }

    // 3. Fallback discovery for generic HTML5 video players
    const video = document.querySelector('video');
    if (video) {
      const container = (typeof video.closest === 'function')
        ? video.closest('#movie_player, .html5-video-player, ytd-player, .video-stream-container, .player-container, [data-player-container]')
        : null;
      if (container) return container;
      if (video.parentElement && video.parentElement !== document.body && video.parentElement !== document.documentElement) {
        return video.parentElement;
      }
      return video;
    }

    return document.body || document.documentElement || null;
  }

  /**
   * Guaranteed Web Fullscreen (CSS Viewport Fill)
   */
  function enterWebFullscreen(targetEl) {
    if (typeof document === 'undefined') return false;
    ensureStyles();
    const el = getTargetElement(targetEl);
    if (!el) return false;

    // Clean any existing classes
    document.querySelectorAll('.sentinel-web-fullscreen').forEach((elem) => {
      elem.classList.remove('sentinel-web-fullscreen');
    });

    el.classList.add('sentinel-web-fullscreen');
    if (document.body) {
      document.body.classList.add('sentinel-fullscreen-active');
      document.body.classList.add('sentinel-has-web-fullscreen');
    }
    if (document.documentElement) {
      document.documentElement.classList.add('sentinel-fullscreen-active');
      document.documentElement.classList.add('sentinel-has-web-fullscreen');
    }

    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer) {
      moviePlayer.classList.add('ytp-fullscreen');
    }

    const flexy = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
    if (flexy) {
      try { flexy.setAttribute('fullscreen', ''); } catch (_) {}
    }

    isWebFullscreenActive = true;
    updateFloatingButtonIcon();
    showOSD('Web Fullscreen', '⛶');

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (_) {}
    }

    return true;
  }

  /**
   * Exits Web Fullscreen mode cleanly
   */
  function exitWebFullscreen() {
    if (typeof document === 'undefined') return false;
    ensureStyles();
    const elements = document.querySelectorAll('.sentinel-web-fullscreen');
    elements.forEach((elem) => elem.classList.remove('sentinel-web-fullscreen'));

    if (document.body) {
      document.body.classList.remove('sentinel-fullscreen-active');
      document.body.classList.remove('sentinel-has-web-fullscreen');
    }
    if (document.documentElement) {
      document.documentElement.classList.remove('sentinel-fullscreen-active');
      document.documentElement.classList.remove('sentinel-has-web-fullscreen');
    }

    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer) {
      moviePlayer.classList.remove('ytp-fullscreen');
    }

    const flexy = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
    if (flexy && !document.fullscreenElement) {
      try { flexy.removeAttribute('fullscreen'); } catch (_) {}
    }

    isWebFullscreenActive = false;
    updateFloatingButtonIcon();
    showOSD('Exit Fullscreen', '⛶');

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (_) {}
    }

    return true;
  }

  /**
   * Attempts Native OS-Level Fullscreen via real user gesture
   */
  async function enterNativeFullscreen(targetEl) {
    if (typeof document === 'undefined') return false;
    const el = getTargetElement(targetEl);

    // 1. YouTube native UI button click
    const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') ||
                    document.querySelector('.ytp-fullscreen-button');
    if (ytFsBtn) {
      try {
        ytFsBtn.click();
        showOSD('Fullscreen', '⛶');
        return true;
      } catch (_) {}
    }

    // 2. YouTube native player API
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.toggleFullscreen === 'function') {
      try {
        moviePlayer.toggleFullscreen();
        showOSD('Fullscreen', '⛶');
        return true;
      } catch (_) {}
    }

    // 3. W3C requestFullscreen API
    const target = el || document.querySelector('video') || document.documentElement;
    if (target) {
      if (typeof target.requestFullscreen === 'function') {
        try {
          await target.requestFullscreen();
          showOSD('Fullscreen', '⛶');
          return true;
        } catch (_) {
          return enterWebFullscreen(target);
        }
      } else if (typeof target.webkitRequestFullscreen === 'function') {
        try {
          target.webkitRequestFullscreen();
          showOSD('Fullscreen', '⛶');
          return true;
        } catch (_) {
          return enterWebFullscreen(target);
        }
      }
    }

    return enterWebFullscreen(el);
  }

  /**
   * Exits any active fullscreen (native or web)
   */
  function exitFullscreen() {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      try {
        if (typeof document.exitFullscreen === 'function') {
          document.exitFullscreen().catch(() => {});
        } else if (typeof document.webkitExitFullscreen === 'function') {
          document.webkitExitFullscreen();
        }
      } catch (_) {}
    }
    if (isWebFullscreenActive || document.querySelector('.sentinel-web-fullscreen')) {
      exitWebFullscreen();
    }
  }

  /**
   * Unified Toggle Method with Deduplication and Adaptive Mode Selection
   */
  function toggle(targetEl, options = {}) {
    if (!acquireLock()) {
      return false;
    }

    const active = isFullscreenActive();
    if (active) {
      exitFullscreen();
      return false;
    }

    const hasUserActivation = typeof navigator !== 'undefined' &&
      Boolean(navigator.userActivation && navigator.userActivation.isActive);

    // If caller explicitly requested web fullscreen or document lacks active user gesture
    if ((options && options.forceWeb) || !hasUserActivation) {
      return enterWebFullscreen(targetEl);
    }

    // Direct in-page user gesture: try native first, fall back to web
    enterNativeFullscreen(targetEl).catch(() => {
      enterWebFullscreen(targetEl);
    });
    return true;
  }

  /**
   * Explicitly enters or exits Web Fullscreen with forceWeb option
   */
  function toggleWebFullscreen(targetEl, options = {}) {
    return toggle(targetEl, { ...options, forceWeb: true });
  }

  /**
   * Standard toggle alias for full API compatibility
   */
  function toggleFullscreen(targetEl, options = {}) {
    return toggle(targetEl, options);
  }

  /**
   * Creates In-Page Floating Sentinel Fullscreen Button
   */
  function createFloatingButton() {
    if (typeof document === 'undefined') return null;
    if (floatingBtnElement && floatingBtnElement.isConnected) return floatingBtnElement;
    const existing = document.getElementById(FLOATING_BTN_ID);
    if (existing) {
      floatingBtnElement = existing;
      return existing;
    }

    const btn = document.createElement('button');
    btn.id = FLOATING_BTN_ID;
    btn.className = 'sentinel-fs-floating-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle Fullscreen');
    btn.title = 'Antigravity Sentinel Fullscreen (Click for Native, Shift+Click for Web)';

    setSvgIcon(btn, isFullscreenActive());

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.shiftKey) {
        if (isFullscreenActive()) {
          exitFullscreen();
        } else {
          enterWebFullscreen();
        }
      } else {
        toggle();
      }
      setTimeout(updateFloatingButtonIcon, 50);
    });

    floatingBtnElement = btn;
    return btn;
  }

  /**
   * Attach Floating Button to Video Player Container
   */
  function attachFloatingButtonToPlayer() {
    if (typeof document === 'undefined') return;
    ensureStyles();
    const player = document.getElementById('movie_player') ||
                   document.querySelector('.html5-video-player') ||
                   document.querySelector('video')?.parentElement;
    if (!player) return;

    const btn = createFloatingButton();
    if (btn && !player.contains(btn)) {
      player.appendChild(btn);
    }

    const showBtn = () => {
      if (!btn) return;
      btn.classList.add('visible');
      clearTimeout(hideBtnTimeout);
      hideBtnTimeout = setTimeout(() => {
        if (btn && !btn.matches(':hover')) {
          btn.classList.remove('visible');
        }
      }, 3000);
    };

    player.removeEventListener('mousemove', showBtn);
    player.addEventListener('mousemove', showBtn, { passive: true });
    player.removeEventListener('mouseenter', showBtn);
    player.addEventListener('mouseenter', showBtn, { passive: true });
    player.removeEventListener('mouseleave', () => {
      if (btn) btn.classList.remove('visible');
    });
    player.addEventListener('mouseleave', () => {
      if (btn) btn.classList.remove('visible');
    }, { passive: true });
  }

  /**
   * Optional double click listener on HTML5 video element
   */
  function setupVideoDoubleClickListener() {
    if (typeof document === 'undefined') return;
    const video = document.querySelector('video');
    if (!video) return;
    if (video.dataset.sentinelFsDblclickBound === 'true') return;
    video.dataset.sentinelFsDblclickBound = 'true';

    video.addEventListener('dblclick', (e) => {
      const isYouTube = Boolean(document.getElementById('movie_player'));
      if (isYouTube) return;
      e.preventDefault();
      toggle();
    });
  }

  // Keyboard shortcut listener: ESC exits Web Fullscreen cleanly
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (document.querySelector('.sentinel-web-fullscreen') || isWebFullscreenActive) {
          exitWebFullscreen();
        }
      }
    }, { capture: true });

    document.addEventListener('fullscreenchange', updateFloatingButtonIcon);
    document.addEventListener('webkitfullscreenchange', updateFloatingButtonIcon);
  }

  // Cross-world custom event bridge listener
  if (typeof window !== 'undefined') {
    window.addEventListener('__SENTINEL_FULLSCREEN_ACTION__', (e) => {
      if (!e.detail) return;
      if (e.detail.action === 'toggle' || e.detail.action === 'toggleWebFullscreen') {
        toggle(null, { ...e.detail.options, forceWeb: true });
      } else if (e.detail.action === 'enter' || e.detail.action === 'enterWeb') {
        enterWebFullscreen();
      } else if (e.detail.action === 'exit') {
        exitFullscreen();
      }
    });

    // Top-frame cross-frame message listener for iframe fullscreen delegation
    window.addEventListener('message', (event) => {
      if (!event.data || event.data.type !== '__SENTINEL_IFRAME_FULLSCREEN__') return;
      if (window.self === window.top) {
        toggle();
      }
    });
  }

  // Lifecycle Initialization
  function init() {
    if (typeof document === 'undefined') return;
    ensureStyles();
    attachFloatingButtonToPlayer();
    setupVideoDoubleClickListener();

    if (typeof MutationObserver !== 'undefined' && document.body) {
      const observer = new MutationObserver(() => {
        if (!floatingBtnElement || !floatingBtnElement.isConnected) {
          attachFloatingButtonToPlayer();
        }
        setupVideoDoubleClickListener();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } else if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('DOMContentLoaded', () => {
        ensureStyles();
        attachFloatingButtonToPlayer();
        setupVideoDoubleClickListener();
        if (typeof MutationObserver !== 'undefined' && document.body) {
          const observer = new MutationObserver(() => {
            if (!floatingBtnElement || !floatingBtnElement.isConnected) {
              attachFloatingButtonToPlayer();
            }
            setupVideoDoubleClickListener();
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    }
  }

  init();

  const controller = {
    __initialized: true,
    toggle,
    toggleWebFullscreen,
    toggleFullscreen,
    enterWebFullscreen,
    exitWebFullscreen,
    enterNativeFullscreen,
    exitFullscreen,
    isFullscreenActive,
    showOSD,
    setupInPageButton: attachFloatingButtonToPlayer,
    ensureStyles,
    getTargetElement
  };

  if (typeof window !== 'undefined') {
    window.__SentinelFullscreenController = controller;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.__SentinelFullscreenController = controller;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = controller;
  }
})();
