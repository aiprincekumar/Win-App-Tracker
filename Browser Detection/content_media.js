/**
 * Browser Detection / content_media.js
 * In-Page HTML5 Media Telemetry Sentinel & User Activity Detector
 * 
 * Injected into all frames at document_start.
 * Inspects <video> and <audio> elements, tracks playback state, resolution,
 * volume, playback rate, and streams live telemetry to background service worker.
 * Provides interactive media controls (play/pause/mute/seek/speed) via IPC.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(() => {
  'use strict';

  // Cross-browser runtime API wrapper
  let browserAPI = null;
  try {
    browserAPI = typeof globalThis.browser !== 'undefined' && globalThis.browser && globalThis.browser.runtime 
      ? globalThis.browser 
      : (typeof globalThis.chrome !== 'undefined' ? globalThis.chrome : null);
  } catch (_) {
    return;
  }

  try {
    if (!browserAPI || !browserAPI.runtime || !browserAPI.runtime.sendMessage) {
      return;
    }
  } catch (_) {
    return;
  }

  const isTopFrame = window === window.top;

  // =============================================================================
  // Content Script Modular Subsystems (src/content/)
  // =============================================================================
  const _ElementDetector = typeof ElementDetector !== 'undefined' ? ElementDetector : (typeof require === 'function' ? require('./src/content/media/element_detector.js') : null);
  const _PlaybackTracker = typeof PlaybackTracker !== 'undefined' ? PlaybackTracker : (typeof require === 'function' ? require('./src/content/media/playback_tracker.js') : null);
  const _MetadataExtractor = typeof MetadataExtractor !== 'undefined' ? MetadataExtractor : (typeof require === 'function' ? require('./src/content/media/metadata_extractor.js') : null);
  const _FloatingHUD = typeof FloatingHUD !== 'undefined' ? FloatingHUD : (typeof require === 'function' ? require('./src/content/fullscreen/floating_hud.js') : null);
  const _IsolatedBridge = typeof IsolatedBridge !== 'undefined' ? IsolatedBridge : (typeof require === 'function' ? require('./src/content/bridge/isolated_bridge.js') : null);
  const _DomObserver = typeof DomObserver !== 'undefined' ? DomObserver : (typeof require === 'function' ? require('./src/content/observers/dom_observer.js') : null);
  const _TitleObserver = typeof TitleObserver !== 'undefined' ? TitleObserver : (typeof require === 'function' ? require('./src/content/observers/title_observer.js') : null);
  const _RuntimeClient = typeof RuntimeClient !== 'undefined' ? RuntimeClient : (typeof require === 'function' ? require('./src/content/bridge/runtime_client.js') : null);

  if (typeof window !== 'undefined') {
    window.__SentinelContentModules = {
      ElementDetector: _ElementDetector,
      PlaybackTracker: _PlaybackTracker,
      MetadataExtractor: _MetadataExtractor,
      FloatingHUD: _FloatingHUD,
      IsolatedBridge: _IsolatedBridge,
      DomObserver: _DomObserver,
      TitleObserver: _TitleObserver,
      RuntimeClient: _RuntimeClient
    };
  }
  const monitoredElements = new WeakSet();
  let lastReportedState = null;
  let lastActivityTimestamp = Date.now();
  let lastProgressBroadcastTime = 0;
  let observer = null;
  let titleObserver = null;
  let periodicHeartbeatTimer = null;
  let fadeIntervalId = null;
  let adObserver = null;

  // Keepalive Port & Foreground Tracking Telemetry
  let keepalivePort = null;
  let keepaliveTimer = null;
  let reconnectTimeout = null;
  let reconnectBackoffMs = 1000;

  // Tracked listeners for clean unregistration on context invalidation
  let storageListenerAd = null;
  let storageListenerSpeed = null;
  let storageListenerAudio = null;
  let runtimeMessageListener = null;

  // Extension context invalidation lifecycle management
  let isContextInvalidated = false;
  let isOrphaned = false;
  const activeTimeouts = new Set();

  /**
   * Safe setTimeout wrapper that tracks pending timer IDs so teardownMediaSentinel
   * can cancel all outstanding timers when extension context becomes invalidated.
   *
   * @param {Function} fn
   * @param {number} delay
   * @returns {number|null}
   */
  function safeSetTimeout(fn, delay) {
    if (isContextInvalidated) return null;
    let timerId = null;
    timerId = setTimeout(() => {
      activeTimeouts.delete(timerId);
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      try {
        fn();
      } catch (err) {
        if (isInvalidationError(err)) {
          teardownMediaSentinel();
        }
      }
    }, delay);
    activeTimeouts.add(timerId);
    return timerId;
  }

  /**
   * Safe clearTimeout wrapper that also cleans up tracked timer ID.
   * @param {number|null} id
   */
  function safeClearTimeout(id) {
    if (id) {
      activeTimeouts.delete(id);
      try { clearTimeout(id); } catch (_) {}
    }
  }

  /**
   * Synchronously checks whether the extension context is still active and valid.
   * When an extension is updated, reloaded, or uninstalled, browserAPI.runtime.id
   * becomes undefined or throws "Extension context invalidated".
   * 
   * @returns {boolean}
   */
  function isExtensionContextValid() {
    if (isContextInvalidated) {
      return false;
    }
    try {
      if (!browserAPI || !browserAPI.runtime || !browserAPI.runtime.id) {
        teardownMediaSentinel();
        return false;
      }
      return true;
    } catch (_) {
      teardownMediaSentinel();
      return false;
    }
  }

  /**
   * Alias for isExtensionContextValid
   * @returns {boolean}
   */
  function isContextValid() {
    return isExtensionContextValid();
  }

  /**
   * Detects whether an error message or exception matches extension context invalidation.
   * @param {Error|string} err
   * @returns {boolean}
   */
  function isInvalidationError(err) {
    if (!err) return false;
    const msg = String(err.message || err.error || err);
    return /(?:Extension )?context invalidated/i.test(msg);
  }

  function isExcludedTrackingHost(host) {
    if (!host) return true;
    const h = String(host).toLowerCase().trim();
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '0.0.0.0' ||
      h === '::1' ||
      h.startsWith('127.0.0.1') ||
      h.startsWith('localhost') ||
      h.startsWith('192.168.') ||
      h.startsWith('10.') ||
      h.endsWith('.local')
    );
  }

  function sendTrackingHeartbeat() {
    if (!keepalivePort || !isExtensionContextValid()) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    try {
      if (typeof window !== 'undefined' && window.location) {
        keepalivePort.postMessage({
          type: 'KEEPALIVE_HEARTBEAT',
          domain: window.location.hostname,
          url: window.location.href,
          visibilityState: document.visibilityState,
          hasFocus: document.hasFocus ? document.hasFocus() : true,
          timestamp: Date.now()
        });
      }
    } catch (_) {}
  }

  function disconnectTrackingKeepalivePort() {
    if (reconnectTimeout) {
      try { clearTimeout(reconnectTimeout); } catch (_) {}
      reconnectTimeout = null;
    }
    if (keepaliveTimer) {
      try { clearInterval(keepaliveTimer); } catch (_) {}
      keepaliveTimer = null;
    }
    if (keepalivePort) {
      try { keepalivePort.disconnect(); } catch (_) {}
      keepalivePort = null;
    }
  }

  function connectTrackingKeepalivePort() {
    if (typeof window === 'undefined' || window !== window.top) return;
    if (!isExtensionContextValid()) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    if (typeof window.location !== 'undefined' && isExcludedTrackingHost(window.location.hostname)) return;
    if (keepalivePort) return;

    try {
      if (!browserAPI || !browserAPI.runtime || typeof browserAPI.runtime.connect !== 'function') return;
      keepalivePort = browserAPI.runtime.connect({ name: 'sentinel_tracking_keepalive' });
      reconnectBackoffMs = 1000;

      if (keepalivePort && keepalivePort.onDisconnect) {
        keepalivePort.onDisconnect.addListener(() => {
          keepalivePort = null;
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
          }
          if (isExtensionContextValid() && typeof document !== 'undefined' && document.visibilityState === 'visible') {
            reconnectTimeout = setTimeout(connectTrackingKeepalivePort, reconnectBackoffMs);
            reconnectBackoffMs = Math.min(8000, reconnectBackoffMs * 2);
          }
        });
      }

      sendTrackingHeartbeat();
      if (!keepaliveTimer) {
        keepaliveTimer = setInterval(sendTrackingHeartbeat, 15000);
      }
    } catch (_) {}
  }

  /**
   * Graceful lifecycle teardown when extension context becomes invalidated/orphaned.
   * Sets sticky flags, clears running timers, disconnects DOM observers, and prevents memory leaks.
   */
  function teardownMediaSentinel() {
    if (isContextInvalidated) return;
    isContextInvalidated = true;
    isOrphaned = true;

    // Disconnect keepalive port and clear heartbeat timers
    disconnectTrackingKeepalivePort();

    // Clear periodic telemetry heartbeat timer
    if (periodicHeartbeatTimer) {
      try { clearInterval(periodicHeartbeatTimer); } catch (_) {}
      periodicHeartbeatTimer = null;
    }

    // Clear smooth fade pause interval if active
    if (fadeIntervalId) {
      try { clearInterval(fadeIntervalId); } catch (_) {}
      fadeIntervalId = null;
    }

    // Clear all tracked active timeouts
    for (const timerId of activeTimeouts) {
      try { clearTimeout(timerId); } catch (_) {}
    }
    activeTimeouts.clear();

    // Disconnect DOM MutationObservers
    if (observer && typeof observer.disconnect === 'function') {
      try { observer.disconnect(); } catch (_) {}
      observer = null;
    }
    if (titleObserver && typeof titleObserver.disconnect === 'function') {
      try { titleObserver.disconnect(); } catch (_) {}
      titleObserver = null;
    }
    if (adObserver && typeof adObserver.disconnect === 'function') {
      try { adObserver.disconnect(); } catch (_) {}
      adObserver = null;
    }

    // Safely unregister runtime & storage event listeners if API is accessible
    try {
      if (storageListenerAd && browserAPI && browserAPI.storage && browserAPI.storage.onChanged && typeof browserAPI.storage.onChanged.removeListener === 'function') {
        browserAPI.storage.onChanged.removeListener(storageListenerAd);
      }
    } catch (_) {}
    storageListenerAd = null;

    try {
      if (storageListenerSpeed && browserAPI && browserAPI.storage && browserAPI.storage.onChanged && typeof browserAPI.storage.onChanged.removeListener === 'function') {
        browserAPI.storage.onChanged.removeListener(storageListenerSpeed);
      }
    } catch (_) {}
    storageListenerSpeed = null;

    try {
      if (storageListenerAudio && browserAPI && browserAPI.storage && browserAPI.storage.onChanged && typeof browserAPI.storage.onChanged.removeListener === 'function') {
        browserAPI.storage.onChanged.removeListener(storageListenerAudio);
      }
    } catch (_) {}
    storageListenerAudio = null;

    try {
      if (runtimeMessageListener && browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage && typeof browserAPI.runtime.onMessage.removeListener === 'function') {
        browserAPI.runtime.onMessage.removeListener(runtimeMessageListener);
      }
    } catch (_) {}
    runtimeMessageListener = null;

    try {
      console.debug('[Media Sentinel] Extension context invalidated; detached running intervals and observers.');
    } catch (_) {}
  }

  const teardownInvalidatedContext = teardownMediaSentinel;

  /**
   * Safe storage getter with synchronous context validity check and error catching.
   * If context is invalid or if browserAPI.storage throws an invalidation error,
   * invokes teardownMediaSentinel and aborts silently.
   * 
   * @param {string|string[]|Object} keys
   * @param {Function} callback
   */
  function safeStorageGet(keys, callback) {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    try {
      if (!browserAPI || !browserAPI.storage || !browserAPI.storage.local) {
        return;
      }
      const maybePromise = browserAPI.storage.local.get(keys, (res) => {
        try {
          let err = null;
          try {
            err = (browserAPI && browserAPI.runtime) ? browserAPI.runtime.lastError : null;
          } catch (rErr) {
            if (isInvalidationError(rErr)) {
              teardownMediaSentinel();
              return;
            }
          }
          if (err && isInvalidationError(err)) {
            teardownMediaSentinel();
            return;
          }
          if (typeof callback === 'function') {
            callback(res);
          }
        } catch (cbErr) {
          if (isInvalidationError(cbErr)) {
            teardownMediaSentinel();
          }
        }
      });
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch((err) => {
          if (isInvalidationError(err)) {
            teardownMediaSentinel();
          }
        });
      }
    } catch (err) {
      if (isInvalidationError(err)) {
        teardownMediaSentinel();
      }
    }
  }

  /**
   * Safe storage setter with synchronous context validity check and error catching.
   * 
   * @param {Object} items
   * @param {Function} [callback]
   */
  function safeStorageSet(items, callback) {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    try {
      if (!browserAPI || !browserAPI.storage || !browserAPI.storage.local) {
        return;
      }
      const maybePromise = browserAPI.storage.local.set(items, () => {
        try {
          let err = null;
          try {
            err = (browserAPI && browserAPI.runtime) ? browserAPI.runtime.lastError : null;
          } catch (rErr) {
            if (isInvalidationError(rErr)) {
              teardownMediaSentinel();
              return;
            }
          }
          if (err && isInvalidationError(err)) {
            teardownMediaSentinel();
            return;
          }
          if (typeof callback === 'function') {
            callback();
          }
        } catch (cbErr) {
          if (isInvalidationError(cbErr)) {
            teardownMediaSentinel();
          }
        }
      });
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch((err) => {
          if (isInvalidationError(err)) {
            teardownMediaSentinel();
          }
        });
      }
    } catch (err) {
      if (isInvalidationError(err)) {
        teardownMediaSentinel();
      }
    }
  }

  /**
   * Safe IPC message sender to background service worker with extension context invalidation guard
   */
  function safeSendMessage(message, callback) {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      if (callback && typeof callback === 'function') {
        try { callback(null, new Error('Extension context invalidated')); } catch (_) {}
      }
      return;
    }
    try {
      if (browserAPI && browserAPI.runtime && browserAPI.runtime.id) {
        const maybePromise = browserAPI.runtime.sendMessage(message, (response) => {
          try {
            let err = null;
            try {
              err = (browserAPI && browserAPI.runtime) ? browserAPI.runtime.lastError : null;
            } catch (rErr) {
              if (isInvalidationError(rErr)) {
                teardownMediaSentinel();
                return;
              }
            }
            if (err && isInvalidationError(err)) {
              teardownMediaSentinel();
            }
            if (callback && typeof callback === 'function') {
              try { callback(response, err); } catch (_) {}
            }
          } catch (innerErr) {
            if (isInvalidationError(innerErr)) {
              teardownMediaSentinel();
            }
          }
        });
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch((err) => {
            if (isInvalidationError(err)) {
              teardownMediaSentinel();
            }
          });
        }
      } else {
        teardownMediaSentinel();
      }
    } catch (e) {
      if (isInvalidationError(e)) {
        teardownMediaSentinel();
      }
    }
  }

  /**
   * Classifies video/audio stream resolution into human-friendly tags.
   * Never reports 'Audio / Unknown' for a video element.
   */
  function getResolutionLabel(width, height, isVideo = true, element = null) {
    if (!isVideo) return 'Audio Stream';

    // 1. Direct stream dimensions
    if (width && height && width > 0 && height > 0) {
      const maxDim = Math.max(width, height);
      const minDim = Math.min(width, height);

      if (maxDim >= 3840 || minDim >= 2160) return '4K UHD (2160p)';
      if (maxDim >= 2560 || minDim >= 1440) return '2K QHD (1440p)';
      if (maxDim >= 1920 || minDim >= 1080) return '1080p FHD';
      if (maxDim >= 1280 || minDim >= 720) return '720p HD';
      if (maxDim >= 854 || minDim >= 480) return '480p SD';
      if (maxDim >= 640 || minDim >= 360) return '360p Low';
      if (maxDim >= 426 || minDim >= 240) return '240p Low';
      return `${width}x${height}`;
    }

    // 2. Fallback to rendered DOM display dimensions if stream dimensions not yet populated
    if (element) {
      try {
        const vw = element.videoWidth || 0;
        const vh = element.videoHeight || 0;
        if (vw > 0 && vh > 0) {
          return getResolutionLabel(vw, vh, true, null);
        }

        const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
        const dispW = element.offsetWidth || (rect ? rect.width : 0);
        const dispH = element.offsetHeight || (rect ? rect.height : 0);
        if (dispW >= 1920 || dispH >= 1080) return '1080p FHD (Display)';
        if (dispW >= 1280 || dispH >= 720) return '720p HD (Display)';
        if (dispW >= 854 || dispH >= 480) return '480p SD (Display)';
        if (dispW > 0 && dispH > 0) return `${Math.round(dispW)}x${Math.round(dispH)}`;
      } catch (_) {}
    }

    return 'Video (Auto)';
  }

  /**
   * Extracts clean, full media title with high-precision platform heuristics
   */
  function extractMediaTitle() {
    const domain = window.location.hostname.toLowerCase();

    // 1. YouTube heuristics
    if (domain.includes('youtube.com')) {
      // Try specific YouTube DOM title elements first
      const selectors = [
        'h1.ytd-watch-metadata yt-formatted-string',
        'ytd-watch-metadata #title h1 yt-formatted-string',
        'h1.title.style-scope.ytd-video-primary-info-renderer yt-formatted-string',
        '#title h1 yt-formatted-string',
        '.ytp-title-link',
        'h1.ytd-shorts-player-title',
        '.slim-video-metadata-title'
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent && el.textContent.trim()) {
          const t = el.textContent.trim();
          if (t && t.length > 1) return t;
        }
      }

      // Open Graph or meta title
      const metaOg = document.querySelector('meta[property="og:title"]');
      if (metaOg && metaOg.content && metaOg.content.trim()) {
        const t = metaOg.content.trim();
        if (t && t.toLowerCase() !== 'youtube') return t;
      }

      const metaName = document.querySelector('meta[name="title"]');
      if (metaName && metaName.content && metaName.content.trim()) {
        const t = metaName.content.trim();
        if (t && t.toLowerCase() !== 'youtube') return t;
      }

      // Document title cleaning: remove notification counts like "(1) ", "▶ ", and "- YouTube"
      let rawTitle = document.title ? document.title.trim() : '';
      if (rawTitle) {
        rawTitle = rawTitle
          .replace(/^[\(\[\d\)\]\s▶\s]+/, '')
          .replace(/\s*-\s*YouTube\s*$/i, '')
          .trim();
        if (rawTitle && rawTitle.toLowerCase() !== 'youtube') {
          return rawTitle;
        }
      }
      return 'YouTube Media';
    }

    // 2. Netflix heuristics
    if (domain.includes('netflix.com')) {
      const netflixTitle = document.querySelector('.watch-video--title-container, .video-title');
      if (netflixTitle && netflixTitle.textContent.trim()) {
        return netflixTitle.textContent.trim();
      }
    }

    // 3. Twitch heuristics
    if (domain.includes('twitch.tv')) {
      const twitchTitle = document.querySelector('h2[data-a-target="stream-title"]');
      if (twitchTitle && twitchTitle.textContent.trim()) {
        return twitchTitle.textContent.trim();
      }
    }

    // 4. Disney+ / Hotstar heuristics
    if (domain.includes('hotstar.com') || domain.includes('disneyplus.com')) {
      const el = document.querySelector('.player-title, .title-field, h1');
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }

    // 5. OpenGraph fallback
    const metaOg = document.querySelector('meta[property="og:title"]');
    if (metaOg && metaOg.content && metaOg.content.trim()) {
      return metaOg.content.trim();
    }

    // 6. Generic document title
    let title = document.title ? document.title.trim() : '';
    if (!title || title.toLowerCase() === 'new tab' || title.toLowerCase() === 'about:blank') {
      title = window.location.hostname || 'Web Media';
    }
    return title;
  }

  /**
   * Extracts duration for YouTube videos with DOM player fallback and #movie_player API
   */
  function extractYouTubeDuration(media) {
    // 1. Try moviePlayer API first
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.getDuration === 'function') {
      try {
        const d = moviePlayer.getDuration();
        if (Number.isFinite(d) && d > 0) {
          return Number(d);
        }
      } catch (_) {}
    }

    // 2. Try HTML5 media duration if finite
    if (media && Number.isFinite(media.duration) && media.duration > 0) {
      return Number(media.duration);
    }

    // 3. Fallback to DOM time duration element (.ytp-time-duration)
    const durEl = document.querySelector('.ytp-time-duration');
    if (durEl && durEl.textContent) {
      const text = durEl.textContent.trim();
      if (text && text.length > 0 && text !== '0:00' && text !== '00:00') {
        const parts = text.split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return parts[0] * 60 + parts[1];
        } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      }
    }

    // 4. Progress bar aria-valuemax fallback
    const pBar = document.querySelector('.ytp-progress-bar');
    if (pBar && pBar.getAttribute('aria-valuemax')) {
      const maxVal = parseFloat(pBar.getAttribute('aria-valuemax'));
      if (Number.isFinite(maxVal) && maxVal > 0) {
        return maxVal;
      }
    }

    return 0;
  }

  /**
   * Extracts current time for YouTube videos with DOM player fallback and #movie_player API
   */
  function extractYouTubeCurrentTime(media) {
    // 1. Try moviePlayer API
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.getCurrentTime === 'function') {
      try {
        const t = moviePlayer.getCurrentTime();
        if (Number.isFinite(t) && t >= 0) {
          return Number(t);
        }
      } catch (_) {}
    }

    // 2. Try HTML5 media currentTime
    if (media && typeof media.currentTime === 'number' && Number.isFinite(media.currentTime) && media.currentTime >= 0) {
      return Number(media.currentTime);
    }

    // 3. Fallback to DOM time current element (.ytp-time-current)
    const curEl = document.querySelector('.ytp-time-current');
    if (curEl && curEl.textContent) {
      const text = curEl.textContent.trim();
      if (text && text.length > 0) {
        const parts = text.split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return parts[0] * 60 + parts[1];
        } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      }
    }

    // 4. Progress bar aria-valuenow fallback
    const pBar = document.querySelector('.ytp-progress-bar');
    if (pBar && pBar.getAttribute('aria-valuenow')) {
      const nowVal = parseFloat(pBar.getAttribute('aria-valuenow'));
      if (Number.isFinite(nowVal) && nowVal >= 0) {
        return nowVal;
      }
    }

    return 0;
  }

  /**
   * Recursively finds all media elements including those inside open Shadow DOM trees
   */
  function findAllMediaNodes(root = document) {
    const results = [];
    const seen = new Set();
    const queue = [root];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      try {
        const media = current.querySelectorAll ? current.querySelectorAll('video, audio') : [];
        for (let i = 0; i < media.length; i++) {
          if (!seen.has(media[i])) {
            seen.add(media[i]);
            results.push(media[i]);
          }
        }

        const elements = current.querySelectorAll ? current.querySelectorAll('*') : [];
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].shadowRoot) {
            queue.push(elements[i].shadowRoot);
          }
        }
      } catch (e) {
        // Suppress DOM cross-origin or security exceptions
      }
    }

    return results;
  }

  /**
   * Evaluates the precise playback state for a single HTML5 media element
   */
  function determineMediaState(media) {
    if (!media) return 'idle';
    if (media.ended) return 'stopped';

    // If media has not loaded any data and has no current time, it's idle/unstarted
    if (media.readyState === 0 && (!media.currentTime || media.currentTime === 0) && !media.duration) {
      return 'idle';
    }

    if (media.paused) {
      return (media.currentTime > 0) ? 'paused' : 'stopped';
    }

    // Media is not paused and not ended
    // readyState < 3 indicates buffering/waiting for data
    if (media.readyState < 3) {
      return 'buffering';
    }

    const isMuted = Boolean(media.muted || media.volume <= 0.001);
    if (isMuted) {
      return 'muted_playing';
    }

    return 'playing';
  }

  /**
   * Calculates a multi-factor prominence score for a media node to guarantee
   * the real primary video (e.g. video.html5-main-video on YouTube) is always prioritized.
   */
  function calculateMediaScore(media, info) {
    let score = 0;
    const isVideo = (info.mediaType === 'video');

    // 1. YouTube & Known Video Player Priority Selectors
    if (media.matches) {
      if (media.matches('video.html5-main-video, .html5-main-video, #movie_player video, .video-stream.html5-main-video')) {
        score += 100000; // Primary YouTube HTML5 Video Element
      } else if (media.matches('.video-stream')) {
        score += 60000;
      }
    }
    if (media.closest) {
      if (media.closest('#movie_player, .html5-video-player, ytd-watch-flexy #player, .watch-video--player-view')) {
        score += 50000;
      }
    }

    // 2. Element Type: Real Video > Audio
    if (isVideo) {
      score += 10000;
    } else {
      score += 1000;
    }

    // 3. Playback State Priority
    if (info.state === 'playing') {
      score += 40000;
    } else if (info.state === 'muted_playing') {
      score += 30000;
    } else if (info.state === 'buffering') {
      score += 25000;
    } else if (info.state === 'paused' && info.currentTime > 0) {
      score += 15000;
    } else if (info.state === 'paused') {
      score += 5000;
    }

    // 4. Video Dimensions (Stream Resolution)
    if (isVideo && info.videoWidth > 0 && info.videoHeight > 0) {
      score += 20000;
      score += Math.min(10000, Math.round((info.videoWidth * info.videoHeight) / 1000));
    }

    // 5. Visual Display Dimensions (Rendered size in DOM)
    try {
      const rect = media.getBoundingClientRect ? media.getBoundingClientRect() : null;
      const dispW = media.offsetWidth || (rect ? rect.width : 0);
      const dispH = media.offsetHeight || (rect ? rect.height : 0);

      if (dispW >= 320 && dispH >= 180) {
        score += 15000; // Visible main player
      } else if (dispW > 100 && dispH > 60) {
        score += 5000;
      } else if (dispW === 0 || dispH === 0) {
        score -= 25000; // Invisible / thumbnail / dummy element
      }
    } catch (_) {}

    // 6. Valid Duration & CurrentTime
    if (info.duration > 0) {
      score += 10000;
      if (info.duration > 15) {
        score += 5000; // Real video content vs 2s sound effect
      }
    } else if (info.isLive) {
      score += 12000; // Live stream
    }

    if (info.currentTime > 0) {
      score += 5000;
    }

    // 7. Volume
    if (!info.isMuted && info.volume > 0.05) {
      score += 3000;
    }

    return score;
  }

  /**
   * Inspects all media elements on the page and selects the primary media item
   */
  function evaluatePageMediaState() {
    const mediaNodes = findAllMediaNodes(document);

    let primaryCandidate = null;
    let highestScore = -Infinity;
    let anyPlaying = false;
    let totalVideos = 0;
    let totalAudios = 0;
    const isYouTube = window.location.hostname.includes('youtube.com');

    for (const media of mediaNodes) {
      const isVideo = media.tagName.toLowerCase() === 'video';
      if (isVideo) totalVideos++;
      else totalAudios++;

      const state = determineMediaState(media);
      const isPlaying = (state === 'playing' || state === 'muted_playing' || state === 'buffering');
      const isBuffering = (state === 'buffering');
      let isMuted = Boolean(media.muted || (typeof media.volume === 'number' && media.volume <= 0.001));
      let volume = typeof media.volume === 'number' ? media.volume : 1.0;
      let playbackRate = Number(media.playbackRate || 1.0);

      // Duration & CurrentTime extraction (with YouTube bridge & fallbacks)
      let duration = Number.isFinite(media.duration) ? Number(media.duration) : 0;
      let currentTime = Number(media.currentTime || 0);
      let ytQualityLevel = '';

      if (isYouTube) {
        const root = document.documentElement;
        if (root) {
          const bQuality = root.getAttribute('data-sentinel-yt-quality');
          if (bQuality) ytQualityLevel = bQuality;

          const bVol = root.getAttribute('data-sentinel-yt-volume');
          if (bVol !== null && bVol !== '') {
            const parsedV = parseInt(bVol, 10);
            if (!isNaN(parsedV)) volume = parsedV / 100;
          }

          const bMuted = root.getAttribute('data-sentinel-yt-muted');
          if (bMuted === 'true') isMuted = true;
          else if (bMuted === 'false') isMuted = false;

          const bRate = root.getAttribute('data-sentinel-yt-rate');
          if (bRate !== null && bRate !== '') {
            const parsedR = parseFloat(bRate);
            if (!isNaN(parsedR) && parsedR > 0) playbackRate = parsedR;
          }

          const bDur = root.getAttribute('data-sentinel-yt-duration');
          if (bDur !== null && bDur !== '') {
            const parsedD = parseFloat(bDur);
            if (!isNaN(parsedD) && parsedD > 0) duration = parsedD;
          }

          const bCur = root.getAttribute('data-sentinel-yt-current-time');
          if (bCur !== null && bCur !== '') {
            const parsedC = parseFloat(bCur);
            if (!isNaN(parsedC) && (parsedC > 0 || currentTime === 0)) currentTime = parsedC;
          }
        }

        const ytDur = extractYouTubeDuration(media);
        if (ytDur > 0 && duration <= 0) {
          duration = ytDur;
        }
        const ytCur = extractYouTubeCurrentTime(media);
        if ((ytCur > 0 || currentTime === 0) && currentTime <= 0) {
          currentTime = ytCur;
        }
      }

      // Rock-solid LIVE vs Finite Video resolution
      let isLive = false;
      if (isYouTube) {
        let ytIsLive = false;
        const moviePlayer = document.getElementById('movie_player');
        if (moviePlayer && typeof moviePlayer.getVideoData === 'function') {
          try {
            const vData = moviePlayer.getVideoData();
            if (vData && typeof vData.isLive === 'boolean') {
              ytIsLive = vData.isLive;
            }
          } catch (_) {}
        }

        const durEl = document.querySelector('.ytp-time-duration');
        const hasFiniteDurationText = Boolean(durEl && durEl.textContent && durEl.textContent.trim().length > 0 && durEl.textContent.trim() !== '0:00' && durEl.textContent.trim() !== '00:00');

        // If duration > 0 or .ytp-time-duration has text, it is 100% a normal finite video, NEVER live!
        if (duration > 0 || hasFiniteDurationText) {
          isLive = false;
        } else if (ytIsLive) {
          isLive = true;
        } else {
          // Check DOM live badge visibility only when finite duration is absent
          const liveBadge = document.querySelector('.ytp-live-badge:not([disabled])');
          const isLiveNowBadge = document.querySelector('.badge-style-type-live-now');
          if (liveBadge || isLiveNowBadge) {
            if (liveBadge) {
              try {
                const style = window.getComputedStyle(liveBadge);
                if (style && style.display !== 'none' && style.visibility !== 'hidden') {
                  isLive = true;
                }
              } catch (_) {
                isLive = true;
              }
            } else if (isLiveNowBadge) {
              isLive = true;
            }
          }
        }
      } else {
        isLive = Boolean(media.duration === Infinity && (!duration || duration <= 0));
      }

      // If duration is a positive finite number, isLive is strictly false
      if (duration > 0) {
        isLive = false;
      }

      const width = isVideo ? (media.videoWidth || 0) : 0;
      const height = isVideo ? (media.videoHeight || 0) : 0;
      const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : (isLive ? 100 : 0);

      if (isPlaying) {
        anyPlaying = true;
      }

      let resLabel = getResolutionLabel(width, height, isVideo, media);
      if (isYouTube && ytQualityLevel && (resLabel === 'Video (Auto)' || !width || width === 0)) {
        const qualityMap = {
          'tiny': '144p SD',
          'small': '240p SD',
          'medium': '360p SD',
          'large': '480p SD',
          'hd720': '720p HD',
          'hd1080': '1080p FHD',
          'hd1440': '1440p 2K',
          'hd2160': '2160p 4K',
          'hd2880': '5K UHD',
          'highres': 'HighRes UHD'
        };
        if (qualityMap[ytQualityLevel]) {
          resLabel = qualityMap[ytQualityLevel];
        }
      }

      const info = {
        mediaType: isVideo ? 'video' : 'audio',
        state,
        isPlaying,
        isBuffering,
        isMuted,
        isLive,
        volume: Math.round(volume * 100) / 100,
        volumePercent: Math.round(volume * 100),
        playbackRate: Math.round(playbackRate * 100) / 100,
        currentTime: Math.round(currentTime * 10) / 10,
        duration: Math.round(duration * 10) / 10,
        progressPercent: Math.round(progressPercent * 10) / 10,
        videoWidth: width,
        videoHeight: height,
        playbackQuality: ytQualityLevel || '',
        resolutionLabel: resLabel,
        src: media.currentSrc || media.src || '',
        title: extractMediaTitle(),
        domain: window.location.hostname
      };

      const score = calculateMediaScore(media, info);
      if (score > highestScore) {
        highestScore = score;
        primaryCandidate = { mediaElement: media, info };
      }
    }

    const hasMedia = Boolean(primaryCandidate !== null || mediaNodes.length > 0 || anyPlaying);

    const currentState = {
      isTopFrame,
      domain: window.location.hostname,
      url: window.location.href,
      title: extractMediaTitle(),
      hasMedia,
      totalVideos,
      totalAudios,
      anyPlaying,
      primaryMedia: primaryCandidate ? primaryCandidate.info : null,
      timestamp: Date.now()
    };

    return { currentState, primaryMediaElement: primaryCandidate ? primaryCandidate.mediaElement : null };
  }

  /**
   * Transmits media telemetry payload to background service worker.
   * If this is a subframe and has NO media, skips to avoid clobbering top-frame state.
   */
  function dispatchMediaTelemetry(force = false) {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }

    try {
      const { currentState } = evaluatePageMediaState();

      // Prevent non-media iframes from clobbering top frame
      if (!isTopFrame && !currentState.hasMedia) {
        return;
      }

      const now = Date.now();

      // Guard for pages that have no media elements (e.g., WhatsApp Web, Google Drive, Google Search)
      if (!currentState.hasMedia) {
        // If the page never had media, suppress telemetry transmission completely
        if (!lastReportedState || !lastReportedState.hasMedia) {
          return;
        }

        // Page transitioned from having media to having NO media:
        // Allow a single teardown broadcast so service worker can cleanly finalize session and purge tabMediaMap
        lastReportedState = currentState;
        lastProgressBroadcastTime = now;

        safeSendMessage({
          type: 'MEDIA_STATE_CHANGED',
          payload: currentState
        });
        return;
      }

      if (!force && lastReportedState) {
        const p1 = lastReportedState.primaryMedia;
        const p2 = currentState.primaryMedia;

        // Check if primary media state changed fundamentally
        const primaryChanged = (!p1 && p2) || (p1 && !p2) || (p1 && p2 && (
          p1.state !== p2.state ||
          p1.isPlaying !== p2.isPlaying ||
          p1.isMuted !== p2.isMuted ||
          Math.abs(p1.volume - p2.volume) > 0.02 ||
          p1.playbackRate !== p2.playbackRate ||
          p1.resolutionLabel !== p2.resolutionLabel ||
          p1.playbackQuality !== p2.playbackQuality ||
          p1.isLive !== p2.isLive ||
          p1.title !== p2.title ||
          p1.mediaType !== p2.mediaType ||
          Math.abs(p1.duration - p2.duration) > 1.0
        ));

        const isPlaying = Boolean(p2 && p2.isPlaying);
        const timeElapsed = now - lastProgressBroadcastTime;

        if (!primaryChanged && lastReportedState.anyPlaying === currentState.anyPlaying) {
          if (isPlaying) {
            // During active playback, throttle progress updates to ~1 second
            if (timeElapsed < 900) {
              return;
            }
          } else {
            // When paused/stopped/idle, throttle to 2.5 seconds
            if (timeElapsed < 2500) {
              return;
            }
          }
        }
      }

      lastReportedState = currentState;
      lastProgressBroadcastTime = now;

      safeSendMessage({
        type: 'MEDIA_STATE_CHANGED',
        payload: currentState
      });
    } catch (err) {
      if (isInvalidationError(err)) {
        teardownMediaSentinel();
      }
    }
  }

  /**
   * Attaches event listeners to a media element
   */
  function attachMediaListeners(media) {
    if (!media || monitoredElements.has(media)) return;
    monitoredElements.add(media);

    if (media.tagName && media.tagName.toLowerCase() === 'video' && audioOnlyModeActive) {
      try {
        media.style.opacity = '0';
        media.style.visibility = 'hidden';
      } catch (_) {}
    }

    const immediateEvents = [
      'play', 'playing', 'pause', 'ended', 'waiting',
      'volumechange', 'ratechange', 'loadedmetadata', 'durationchange',
      'seeked', 'emptied', 'canplay', 'loadeddata', 'resize'
    ];

    immediateEvents.forEach(evt => {
      media.addEventListener(evt, () => {
        if (isContextInvalidated || !isExtensionContextValid()) {
          teardownMediaSentinel();
          return;
        }
        dispatchMediaTelemetry(true);
      }, { passive: true });
    });

    // High-resolution timeupdate listener: broadcasts during active playback
    media.addEventListener('timeupdate', () => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      dispatchMediaTelemetry(false);
    }, { passive: true });

    // Defect 09: Track ratechange to save domain speed
    media.addEventListener('ratechange', () => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      if (!isRestoringSpeed && typeof media.playbackRate === 'number') {
        saveDomainSpeed(media.playbackRate);
      }
    }, { passive: true });
  }

  /**
   * Scans and ensures all <iframe> elements have proper fullscreen permissions and attributes.
   * Resolves the "Full screen is unavailable. Learn More" embedded player error.
   * 
   * Prioritizes modern Permissions-Policy (allow="... fullscreen") and avoids setting redundant
   * legacy allowfullscreen attributes when allow is supported, eliminating Chromium Blink
   * precedence warnings ("Allow attribute will take precedence over 'allowfullscreen'").
   */
  function ensureIframeFullscreenSupport(root = document) {
    try {
      let iframes = [];
      if (root.querySelectorAll) {
        iframes = Array.from(root.querySelectorAll('iframe'));
      }
      if (root.tagName === 'IFRAME') {
        iframes.push(root);
      }

      for (const iframe of iframes) {
        try {
          const supportsAllow = 'allow' in iframe || (typeof HTMLIFrameElement !== 'undefined' && 'allow' in HTMLIFrameElement.prototype);
          if (supportsAllow) {
            // Remove redundant legacy attributes first to prevent Blink from emitting:
            // "Allow attribute will take precedence over 'allowfullscreen'."
            if (iframe.hasAttribute('allowfullscreen')) {
              iframe.removeAttribute('allowfullscreen');
            }
            if (iframe.hasAttribute('webkitallowfullscreen')) {
              iframe.removeAttribute('webkitallowfullscreen');
            }
            if (iframe.hasAttribute('mozallowfullscreen')) {
              iframe.removeAttribute('mozallowfullscreen');
            }

            // Prioritize modern Permissions-Policy / allow attribute with fullscreen
            const existingAllow = iframe.getAttribute('allow') || '';
            if (!existingAllow) {
              iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
            } else if (!/\bfullscreen\b/i.test(existingAllow)) {
              iframe.setAttribute('allow', `${existingAllow.trim().replace(/;$/, '')}; fullscreen`);
            }
          } else {
            // Fallback for legacy browsers without Permissions Policy (allow attribute) support
            if (!iframe.hasAttribute('allowfullscreen')) {
              iframe.setAttribute('allowfullscreen', 'true');
            }
            if (!iframe.hasAttribute('webkitallowfullscreen')) {
              iframe.setAttribute('webkitallowfullscreen', 'true');
            }
            if (!iframe.hasAttribute('mozallowfullscreen')) {
              iframe.setAttribute('mozallowfullscreen', 'true');
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  /**
   * Scans document for media elements and attaches event listeners
   */
  function scanAndMonitorMedia() {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    ensureMainWorldInjected();
    ensureIframeFullscreenSupport(document);
    const elements = findAllMediaNodes(document);
    elements.forEach(attachMediaListeners);

    if (elements.length > 0) {
      restoreDomainSpeed();
    }

    if (elements.length > 0 || isTopFrame) {
      dispatchMediaTelemetry(true);
    }
  }

  /**
   * Observes DOM mutations for newly added media nodes (SPAs, YouTube, etc.)
   */
  function setupMutationObserver() {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    if (observer) return;

    observer = new MutationObserver(mutations => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      let foundNew = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
                attachMediaListeners(node);
                foundNew = true;
              } else if (node.querySelectorAll) {
                const nested = node.querySelectorAll('video, audio');
                if (nested.length > 0) {
                  nested.forEach(attachMediaListeners);
                  foundNew = true;
                }
              }

              // Check and inject fullscreen attributes into dynamically added iframes
              if (node.tagName === 'IFRAME' || (node.querySelectorAll && node.querySelector('iframe'))) {
                ensureIframeFullscreenSupport(node);
              }
            }
          }
        } else if (mutation.type === 'attributes' && mutation.target && mutation.target.tagName === 'IFRAME') {
          ensureIframeFullscreenSupport(mutation.target);
        }
      }
      if (foundNew) {
        dispatchMediaTelemetry(true);
      }
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'allow', 'allowfullscreen']
      });
    }

    // Title observer: detects SPA video title changes on YouTube
    const titleEl = document.querySelector('title');
    if (titleEl && !titleObserver) {
      titleObserver = new MutationObserver(() => {
        if (isContextInvalidated || !isExtensionContextValid()) {
          teardownMediaSentinel();
          return;
        }
        dispatchMediaTelemetry(true);
      });
      titleObserver.observe(titleEl, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Tracks user interaction events (mouse, key, scroll) on the page
   */
  function setupUserActivityListeners() {
    const onUserInteraction = () => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      const now = Date.now();
      if (now - lastActivityTimestamp >= 10000) {
        lastActivityTimestamp = now;
        safeSendMessage({
          type: 'PAGE_USER_INTERACTION',
          payload: {
            domain: window.location.hostname,
            timestamp: now
          }
        });
      }
    };

    ['pointerdown', 'keydown', 'wheel'].forEach(evt => {
      window.addEventListener(evt, onUserInteraction, { passive: true, capture: true });
    });
  }

  const QUALITY_ORDER = [
    'tiny',      // 144p
    'small',     // 240p
    'medium',    // 360p
    'large',     // 480p
    'hd720',     // 720p HD
    'hd1080',    // 1080p FHD
    'hd1440',    // 1440p 2K
    'hd2160',    // 2160p 4K
    'hd2880',    // 5K
    'highres'    // 8K / HighRes
  ];

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

  let actionCounter = 0;

  /**
   * Forwards control action to Main World execution engine for YouTube player API execution.
   * Dispatches via a bulletproof tri-channel bridge:
   * 1. window.postMessage({ type: '__MEDIA_SENTINEL_ACTION__', detail: payload }, '*')
   * 2. documentElement.setAttribute('data-sentinel-action', payload) + Event dispatch
   * 3. document.dispatchEvent(new CustomEvent('__MEDIA_SENTINEL_ACTION__', { detail: payload, bubbles: true, composed: true }))
   */
  function forwardActionToMainWorld(action, data = {}) {
    try {
      const actionId = `act_${Date.now()}_${++actionCounter}_${Math.random().toString(36).substring(2, 7)}`;
      const payload = JSON.stringify({
        action,
        data,
        actionId,
        timestamp: Date.now()
      });

      // Channel A: window.postMessage (fast, reliable, crosses world boundary cleanly in Chromium)
      try {
        window.postMessage({
          type: '__MEDIA_SENTINEL_ACTION__',
          detail: payload
        }, '*');
      } catch (_) {}

      // Channel B: DOM attribute bridge (reliable even if message listeners attached late)
      try {
        const root = document.documentElement || document.body;
        if (root) {
          root.setAttribute('data-sentinel-action', payload);
          document.dispatchEvent(new Event('__MEDIA_SENTINEL_ACTION__', { bubbles: true, composed: true }));
        }
      } catch (_) {}

      // Channel C: CustomEvent bridge (standard for Gecko / Firefox and Chromium)
      try {
        document.dispatchEvent(new CustomEvent('__MEDIA_SENTINEL_ACTION__', {
          detail: payload,
          bubbles: true,
          composed: true
        }));
      } catch (_) {}
    } catch (_) {}
  }

  /**
   * Ensures main world bridge script is injected if not already running via manifest
   */
  function ensureMainWorldInjected() {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    try {
      const root = document.documentElement;
      if (root && root.getAttribute('data-sentinel-bridge-ready') === 'true') {
        return;
      }
      if (document.getElementById('__media_sentinel_bridge_script__')) {
        return;
      }
      if (!browserAPI || !browserAPI.runtime || typeof browserAPI.runtime.getURL !== 'function') {
        return;
      }
      const s = document.createElement('script');
      s.id = '__media_sentinel_bridge_script__';
      s.src = browserAPI.runtime.getURL('inject_main_world.js');
      s.onload = () => s.remove();
      (document.head || document.documentElement || document.body).appendChild(s);
    } catch (err) {
      if (isInvalidationError(err)) {
        teardownMediaSentinel();
      }
    }
  }

  /**
   * Ensures CSS Web Fullscreen styles are injected for fallback fullscreen support
   */
  function ensureWebFullscreenStyles() {
    if (document.getElementById('__media_sentinel_web_fs_styles__')) return;
    try {
      const style = document.createElement('style');
      style.id = '__media_sentinel_web_fs_styles__';
      style.textContent = `
        html.sentinel-has-web-fullscreen,
        body.sentinel-has-web-fullscreen {
          overflow: hidden !important;
          width: 100% !important;
          height: 100% !important;
        }
        .sentinel-has-web-fullscreen #masthead-container,
        .sentinel-has-web-fullscreen ytd-masthead,
        .sentinel-has-web-fullscreen #masthead {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
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
        }
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
          background: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .sentinel-web-fullscreen .html5-video-container {
          width: 100% !important;
          height: 100% !important;
        }
        .sentinel-web-fullscreen video {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          left: 0 !important;
          top: 0 !important;
          object-fit: contain !important;
        }
        .sentinel-web-fullscreen .ytp-chrome-bottom {
          width: 100% !important;
          left: 0 !important;
          bottom: 0 !important;
        }
      `;
      (document.head || document.documentElement || document.body).appendChild(style);
    } catch (_) {}
  }

  /**
   * Toggles CSS Web Fullscreen on target video/player element
   */
  function toggleWebFullscreen(targetElement) {
    if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
      return window.__SentinelFullscreenController.toggle(targetElement, { forceWeb: true });
    }
    try {
      ensureWebFullscreenStyles();
      let el = targetElement;
      const ytPlayer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
      if (ytPlayer) {
        el = ytPlayer;
      } else if (el && (el.tagName === 'VIDEO' || el.nodeName === 'VIDEO')) {
        el = (typeof el.closest === 'function')
          ? el.closest('#movie_player, .html5-video-player, ytd-player, .player-container, [data-player-container]') || el.parentElement || el
          : el.parentElement || el;
      }
      if (!el) {
        const video = document.querySelector('video');
        el = ytPlayer || (video ? video.parentElement : null) || video || document.body;
      }
      if (!el) return false;

      const isWebFs = el.classList.contains('sentinel-web-fullscreen') || Boolean(document.querySelector('.sentinel-web-fullscreen'));
      if (isWebFs) {
        const fsElements = document.querySelectorAll('.sentinel-web-fullscreen');
        fsElements.forEach(item => item.classList.remove('sentinel-web-fullscreen'));
        if (document.body) {
          document.body.classList.remove('sentinel-fullscreen-active');
          document.body.classList.remove('sentinel-has-web-fullscreen');
        }
        if (document.documentElement) {
          document.documentElement.classList.remove('sentinel-fullscreen-active');
          document.documentElement.classList.remove('sentinel-has-web-fullscreen');
        }
        const moviePlayer = document.getElementById('movie_player');
        if (moviePlayer) moviePlayer.classList.remove('ytp-fullscreen');
        const flexy = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
        if (flexy && !document.fullscreenElement) {
          try { flexy.removeAttribute('fullscreen'); } catch (_) {}
        }
        window.dispatchEvent(new Event('resize'));
        return false;
      } else {
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
        if (moviePlayer) moviePlayer.classList.add('ytp-fullscreen');
        const flexy = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
        if (flexy) {
          try { flexy.setAttribute('fullscreen', ''); } catch (_) {}
        }
        window.dispatchEvent(new Event('resize'));
        return true;
      }
    } catch (_) {
      return false;
    }
  }

  /**
   * Ensures CSS Theater Mode styles are injected for non-YouTube / generic HTML5 video
   */
  function ensureTheaterStyles() {
    if (document.getElementById('__media_sentinel_theater_styles__')) return;
    try {
      const style = document.createElement('style');
      style.id = '__media_sentinel_theater_styles__';
      style.textContent = `
        .sentinel-theater-mode {
          width: 100% !important;
          max-width: 100% !important;
          height: 75vh !important;
          max-height: 75vh !important;
          background: #000 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          margin: 0 auto !important;
        }
        .sentinel-theater-mode video {
          width: 100% !important;
          height: 100% !important;
          max-height: 75vh !important;
          object-fit: contain !important;
        }
      `;
      (document.head || document.documentElement || document.body).appendChild(style);
    } catch (_) {}
  }

  /**
   * Toggles CSS Theater Mode on target element container
   */
  function toggleTheaterMode(targetElement) {
    try {
      ensureTheaterStyles();
      const el = targetElement || document.querySelector('video') || document.querySelector('.html5-video-player');
      if (!el) return;
      const container = el.parentElement || el;
      container.classList.toggle('sentinel-theater-mode');
    } catch (_) {}
  }

  // Remove web fullscreen when Escape is pressed
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.code === 'Escape') {
      const fsEl = document.querySelector('.sentinel-web-fullscreen');
      if (fsEl) {
        toggleWebFullscreen(fsEl);
      }
    }
  }, { passive: true });

  // ===========================================================================
  // Phase 2: Smart Automations Engine (Defects 08 & 09)
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // Defect 08: YouTube Commercial Auto Ad Silencer
  // ---------------------------------------------------------------------------
  let adSilencerEnabled = false;
  let isAdMuted = false;
  let preAdVolume = 1.0;
  // adObserver is declared in top-level lifecycle scope for clean teardown access

  /**
   * Defect 08: Detects presence of YouTube commercial ad markers in the DOM.
   * Targets: .ad-showing, .video-ads.ytp-ad-module:not(:empty), .ytp-ad-player-overlay, .ytp-ad-text
   * 
   * @returns {boolean}
   */
  function checkAdMarkers() {
    if (!window.location || !window.location.hostname || !window.location.hostname.includes('youtube.com')) {
      return false;
    }
    try {
      // 1. Check player element .ad-showing class
      const moviePlayer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
      if (moviePlayer && moviePlayer.classList && moviePlayer.classList.contains('ad-showing')) {
        return true;
      }
      if (document.querySelector('.ad-showing')) {
        return true;
      }

      // 2. Check .video-ads.ytp-ad-module:not(:empty)
      const adMod = document.querySelector('.video-ads.ytp-ad-module');
      if (adMod && (adMod.children.length > 0 || (adMod.textContent && adMod.textContent.trim().length > 0))) {
        return true;
      }
      try {
        if (document.querySelector('.video-ads.ytp-ad-module:not(:empty)')) {
          return true;
        }
      } catch (_) {}

      // 3. Check .ytp-ad-player-overlay
      if (document.querySelector('.ytp-ad-player-overlay')) {
        return true;
      }

      // 4. Check .ytp-ad-text
      if (document.querySelector('.ytp-ad-text')) {
        return true;
      }
    } catch (_) {}
    return false;
  }

  /**
   * Applies edge-triggered volume attenuation / mute when YouTube commercial ad begins,
   * and restores pre-ad volume when commercial ends, preventing frame thrashing.
   */
  function checkAndApplyAdSilencer() {
    if (!adSilencerEnabled) {
      if (isAdMuted) {
        // Disabled while muted: restore pre-ad volume
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          try {
            video.muted = false;
            if (typeof preAdVolume === 'number') {
              video.volume = preAdVolume;
            }
          } catch (_) {}
        });
        isAdMuted = false;
      }
      return;
    }

    const isAd = checkAdMarkers();
    const videos = document.querySelectorAll('video');

    if (isAd && !isAdMuted) {
      // Edge transition: Ad appeared & video not yet ad-muted
      videos.forEach(video => {
        try {
          if (typeof video.volume === 'number' && video.volume > 0) {
            preAdVolume = video.volume;
          }
          video.muted = true;
        } catch (_) {}
      });
      isAdMuted = true;
    } else if (!isAd && isAdMuted) {
      // Edge transition: Ad disappeared & video is ad-muted
      videos.forEach(video => {
        try {
          video.muted = false;
          if (typeof preAdVolume === 'number') {
            video.volume = preAdVolume;
          }
        } catch (_) {}
      });
      isAdMuted = false;
    }
  }

  /**
   * Defect 08: Initializes YouTube Commercial Auto Ad Silencer.
   * Hydrates setting, listens to storage.onChanged for real-time reactivity without page reload,
   * observes DOM for ad markers, and re-arms on YouTube SPA navigations (yt-navigate-finish).
   */
  function initAdSilencer() {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }

    if (!window.location || !window.location.hostname || !window.location.hostname.includes('youtube.com')) {
      return;
    }

    // Check smart_automations.auto_ad_silencer in browserAPI.storage.local
    safeStorageGet(['smart_automations'], (res) => {
      if (res && res.smart_automations) {
        adSilencerEnabled = Boolean(res.smart_automations.auto_ad_silencer);
      }
      checkAndApplyAdSilencer();
    });

    // Listen to browserAPI.storage.onChanged for real-time reactivity without page reload
    if (browserAPI && browserAPI.storage && browserAPI.storage.onChanged) {
      try {
        storageListenerAd = (changes, areaName) => {
          if (isContextInvalidated || !isExtensionContextValid()) {
            teardownMediaSentinel();
            return;
          }
          if ((areaName === 'local' || !areaName) && changes && changes.smart_automations) {
            const newVal = changes.smart_automations.newValue;
            if (newVal && newVal.auto_ad_silencer !== undefined) {
              adSilencerEnabled = Boolean(newVal.auto_ad_silencer);
              checkAndApplyAdSilencer();
            }
          }
        };
        browserAPI.storage.onChanged.addListener(storageListenerAd);
      } catch (err) {
        if (isInvalidationError(err)) teardownMediaSentinel();
      }
    }

    // Observe DOM for YouTube ad markers
    if (typeof MutationObserver !== 'undefined' && !adObserver) {
      adObserver = new MutationObserver(() => {
        if (isContextInvalidated || !isExtensionContextValid()) {
          teardownMediaSentinel();
          return;
        }
        checkAndApplyAdSilencer();
      });
      const rootTarget = document.documentElement || document.body;
      if (rootTarget && rootTarget.nodeType === 1) {
        adObserver.observe(rootTarget, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
      }
    }

    // Re-arm on YouTube SPA navigations (yt-navigate-finish)
    ['yt-navigate-finish', 'yt-page-data-updated'].forEach(evt => {
      document.addEventListener(evt, () => {
        if (isContextInvalidated || !isExtensionContextValid()) {
          teardownMediaSentinel();
          return;
        }
        if (isAdMuted) {
          const videos = document.querySelectorAll('video');
          videos.forEach(v => {
            try {
              v.muted = false;
              if (typeof preAdVolume === 'number') {
                v.volume = preAdVolume;
              }
            } catch (_) {}
          });
          isAdMuted = false;
        }
        safeSetTimeout(() => {
          if (!isContextInvalidated && isExtensionContextValid()) checkAndApplyAdSilencer();
        }, 100);
        safeSetTimeout(() => {
          if (!isContextInvalidated && isExtensionContextValid()) checkAndApplyAdSilencer();
        }, 500);
      }, { passive: true });
    });
  }

  // ---------------------------------------------------------------------------
  // Defect 09: Domain Speed Memory
  // ---------------------------------------------------------------------------
  let isRestoringSpeed = false;
  let domainSpeedMemoryEnabled = true;

  /**
   * Sanitizes host: window.location.hostname.replace(/^www\./, '')
   * @returns {string}
   */
  function getSanitizedHost() {
    try {
      return (window.location.hostname || '').replace(/^www\./, '');
    } catch (_) {
      return '';
    }
  }

  /**
   * Defect 09: Restores domain speed memory from storage for the current host.
   * Looks up smart_automations.domain_speeds[host]. If between 0.25 and 4.0,
   * sets video.playbackRate = targetSpeed on video elements.
   */
  function restoreDomainSpeed() {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    const host = getSanitizedHost();
    if (!host) return;

    safeStorageGet(['smart_automations'], (res) => {
      if (isContextInvalidated) return;
      if (!res || !res.smart_automations) return;
      const smartAutomations = res.smart_automations;
      if (smartAutomations.domain_speed_memory === false) {
        domainSpeedMemoryEnabled = false;
        return;
      }
      domainSpeedMemoryEnabled = true;

      const domainSpeeds = smartAutomations.domain_speeds;
      if (!domainSpeeds || typeof domainSpeeds !== 'object') return;

      const targetSpeed = domainSpeeds[host];
      if (typeof targetSpeed === 'number' && targetSpeed >= 0.25 && targetSpeed <= 4.0) {
        const videos = document.querySelectorAll('video');
        if (videos.length > 0) {
          isRestoringSpeed = true;
          try {
            videos.forEach(video => {
              try {
                if (video.playbackRate !== targetSpeed) {
                  video.playbackRate = targetSpeed;
                }
              } catch (_) {}
            });
          } finally {
            safeSetTimeout(() => {
              isRestoringSpeed = false;
            }, 100);
          }
        }
      }
    });
  }

  /**
   * Defect 09: Saves domain playback speed into storage for current host.
   * If domain_speed_memory is true, saves speed into smart_automations.domain_speeds[host].
   * 
   * @param {number} speed
   */
  function saveDomainSpeed(speed) {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    if (isRestoringSpeed) return;
    const numSpeed = Number(speed);
    if (!Number.isFinite(numSpeed) || numSpeed < 0.25 || numSpeed > 4.0) return;
    const host = getSanitizedHost();
    if (!host) return;

    safeStorageGet(['smart_automations'], (res) => {
      if (isContextInvalidated) return;
      const smartAutomations = (res && res.smart_automations) ? { ...res.smart_automations } : {};
      if (smartAutomations.domain_speed_memory === false) {
        domainSpeedMemoryEnabled = false;
        return;
      }
      domainSpeedMemoryEnabled = true;

      const domainSpeeds = { ...(smartAutomations.domain_speeds || {}) };
      if (domainSpeeds[host] === numSpeed) return; // Value unchanged

      domainSpeeds[host] = numSpeed;
      smartAutomations.domain_speeds = domainSpeeds;

      safeStorageSet({ smart_automations: smartAutomations });
    });
  }

  // Listen to browserAPI.storage.onChanged for real-time reactivity for domain_speed_memory
  if (browserAPI && browserAPI.storage && browserAPI.storage.onChanged) {
    try {
      storageListenerSpeed = (changes, areaName) => {
        if (isContextInvalidated || !isExtensionContextValid()) {
          teardownMediaSentinel();
          return;
        }
        if ((areaName === 'local' || !areaName) && changes && changes.smart_automations) {
          const newVal = changes.smart_automations.newValue;
          if (newVal && newVal.domain_speed_memory !== undefined) {
            domainSpeedMemoryEnabled = Boolean(newVal.domain_speed_memory);
            if (domainSpeedMemoryEnabled) {
              restoreDomainSpeed();
            }
          }
        }
      };
      browserAPI.storage.onChanged.addListener(storageListenerSpeed);
    } catch (err) {
      if (isInvalidationError(err)) teardownMediaSentinel();
    }
  }

  // ---------------------------------------------------------------------------
  // Audio Lab & Audio-Only Battery Saver Mode (Defect 02)
  // ---------------------------------------------------------------------------
  let audioOnlyModeActive = false;

  /**
   * Defect 02: Audio-Only Battery Saver
   * Sets opacity = '0' and visibility = 'hidden' on all video elements when enabled,
   * restoring opacity = '1' and visibility = 'visible' when disabled.
   * Playback continues uninterrupted to save GPU decoding and battery power.
   */
  function setAudioOnlyMode(enabled) {
    audioOnlyModeActive = Boolean(enabled);
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
      try {
        if (audioOnlyModeActive) {
          v.style.opacity = '0';
          v.style.visibility = 'hidden';
        } else {
          v.style.opacity = '1';
          v.style.visibility = 'visible';
        }
      } catch (_) {}
    });
  }

  /**
   * Hydrates Audio Lab settings from local storage and observes real-time changes
   */
  function initAudioLabSettings() {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }

    safeStorageGet(['audio_lab_settings'], (res) => {
      if (isContextInvalidated) return;
      if (res && res.audio_lab_settings) {
        setAudioOnlyMode(Boolean(res.audio_lab_settings.audio_only));
        try {
          window.postMessage({
            type: 'APPLY_AUDIO_LAB_SETTINGS',
            settings: res.audio_lab_settings
          }, '*');
        } catch (_) {}
      }
    });

    if (browserAPI && browserAPI.storage && browserAPI.storage.onChanged) {
      try {
        storageListenerAudio = (changes, areaName) => {
          if (isContextInvalidated || !isExtensionContextValid()) {
            teardownMediaSentinel();
            return;
          }
          if ((areaName === 'local' || !areaName) && changes && changes.audio_lab_settings) {
            const newSettings = changes.audio_lab_settings.newValue;
            if (newSettings) {
              setAudioOnlyMode(Boolean(newSettings.audio_only));
              try {
                window.postMessage({
                  type: 'APPLY_AUDIO_LAB_SETTINGS',
                  settings: newSettings
                }, '*');
              } catch (_) {}
            }
          }
        };
        browserAPI.storage.onChanged.addListener(storageListenerAudio);
      } catch (err) {
        if (isInvalidationError(err)) teardownMediaSentinel();
      }
    }
  }

  /**
   * Checks whether the current page is on YouTube domain
   */
  function isYouTubeDomain() {
    try {
      return Boolean(window.location && window.location.hostname && window.location.hostname.includes('youtube.com'));
    } catch (_) {
      return false;
    }
  }

  /**
   * Checks whether the Main World bridge is injected and active
   */
  function isMainWorldBridgeActive() {
    try {
      const root = document.documentElement || document.body;
      return Boolean(root && typeof root.getAttribute === 'function' && root.getAttribute('data-sentinel-bridge-ready') === 'true');
    } catch (_) {
      return false;
    }
  }

  /**
   * Executes interactive media control actions (play, pause, toggle, mute, seek, speed, quality, window modes)
   */
  function handleMediaControl(action, data = {}) {
    // Guard: Only top frame or a subframe that actually contains active media should process controls
    const { primaryMediaElement } = evaluatePageMediaState();
    if (!isTopFrame && !primaryMediaElement) {
      return { success: false, ignored: true, reason: 'No media in this subframe' };
    }

    const isYouTube = typeof isYouTubeDomain === 'function'
      ? isYouTubeDomain()
      : Boolean(typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.includes('youtube.com'));

    const isBridgeActive = typeof isMainWorldBridgeActive === 'function'
      ? isMainWorldBridgeActive()
      : Boolean(typeof document !== 'undefined' && (document.documentElement || document.body) && typeof (document.documentElement || document.body).getAttribute === 'function' && (document.documentElement || document.body).getAttribute('data-sentinel-bridge-ready') === 'true');

    const isMainWorldTarget = isYouTube || isBridgeActive;

    // 1. Forward action to Main World engine (essential for YouTube native player methods, volume slider & OSD)
    // Avoid double-toggle race for toggle_fullscreen across isolated and main worlds
    let forwardedToMainWorld = false;
    if (isMainWorldTarget && action !== 'toggle_fullscreen') {
      forwardActionToMainWorld(action, data);
      forwardedToMainWorld = true;
    }

    // 2. Perform direct HTML5 video element manipulation when bridge is inactive or as resilient fallback
    // Direct HTML5 execution guarantees immediate playback/seek/speed control across all browsers (including Microsoft Edge)
    // without relying on fragile cross-world custom event bridges or suffering bounceback refresh lag.
    const shouldExecuteDirect = Boolean(primaryMediaElement) || action === 'toggle_fullscreen';

    if (shouldExecuteDirect) {
      try {
        switch (action) {
          case 'play': {
            const p = primaryMediaElement.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
            break;
          }
          case 'pause': {
            primaryMediaElement.pause();
            break;
          }
          case 'toggle_play': {
            if (primaryMediaElement.paused) {
              const p = primaryMediaElement.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            } else {
              primaryMediaElement.pause();
            }
            break;
          }
          case 'toggle_mute': {
            primaryMediaElement.muted = !primaryMediaElement.muted;
            break;
          }
          case 'mute': {
            primaryMediaElement.muted = true;
            break;
          }
          case 'unmute': {
            primaryMediaElement.muted = false;
            break;
          }
          case 'set_volume':
          case 'SET_VOLUME': {
            let vol = null;
            if (typeof data.volume === 'number') vol = data.volume;
            else if (typeof data.percent === 'number') vol = data.percent / 100;
            if (vol !== null) {
              vol = Math.max(0, Math.min(1, vol));
              primaryMediaElement.volume = vol;
              primaryMediaElement.muted = (vol === 0);
            }
            break;
          }
          case 'seek_relative': {
            if (typeof data.offsetSeconds === 'number') {
              const maxDuration = (Number.isFinite(primaryMediaElement.duration) && primaryMediaElement.duration > 0)
                ? primaryMediaElement.duration
                : 999999;
              primaryMediaElement.currentTime = Math.max(0, Math.min(maxDuration, primaryMediaElement.currentTime + data.offsetSeconds));
            }
            break;
          }
          case 'seek_percent': {
            let dur = primaryMediaElement.duration;
            if (!Number.isFinite(dur) || dur <= 0) {
              dur = extractYouTubeDuration(primaryMediaElement);
            }
            if (typeof data.positionSeconds === 'number' && data.positionSeconds >= 0) {
              primaryMediaElement.currentTime = data.positionSeconds;
            } else if (typeof data.percent === 'number' && dur > 0) {
              primaryMediaElement.currentTime = (data.percent / 100) * dur;
            }
            break;
          }
          case 'seek_to':
          case 'seek_absolute': {
            let dur = primaryMediaElement.duration;
            if (!Number.isFinite(dur) || dur <= 0) {
              dur = typeof extractYouTubeDuration === 'function' ? extractYouTubeDuration(primaryMediaElement) : 0;
            }
            const maxDuration = (Number.isFinite(dur) && dur > 0) ? dur : 999999;
            const rawTarget = (typeof data.positionSeconds === 'number')
              ? data.positionSeconds
              : ((typeof data.seconds === 'number') ? data.seconds : 0);
            
            const clampedSeconds = Math.max(0, Math.min(maxDuration, rawTarget));
            try {
              primaryMediaElement.currentTime = clampedSeconds;
            } catch (_) {}

            // Synchronize with YouTube player instance if embedded
            try {
              const moviePlayer = document.getElementById('movie_player') || window.movie_player;
              if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
                moviePlayer.seekTo(clampedSeconds, true);
              }
            } catch (_) {}

            // Broadcast immediate telemetry so dashboard progress reflects seek
            try {
              dispatchMediaTelemetry(true);
            } catch (_) {}
            break;
          }
          case 'cycle_speed': {
            const cur = primaryMediaElement.playbackRate || 1.0;
            const targetSpeed = calculateNextLadderSpeed(cur, 'up');
            primaryMediaElement.playbackRate = targetSpeed;
            saveDomainSpeed(targetSpeed);
            break;
          }
          case 'set_speed': {
            if (typeof data.rate === 'number' && data.rate > 0) {
              const targetSpeed = Math.max(0.25, Math.min(4.0, Math.round(data.rate * 100) / 100));
              primaryMediaElement.playbackRate = targetSpeed;
              saveDomainSpeed(targetSpeed);
            }
            break;
          }
          case 'step_speed': {
            const cur = primaryMediaElement.playbackRate || 1.0;
            const targetSpeed = (typeof data.targetSpeed === 'number' && data.targetSpeed >= 0.25 && data.targetSpeed <= 4.0)
              ? data.targetSpeed
              : calculateNextLadderSpeed(cur, data.direction || (data.step < 0 ? 'down' : 'up'));
            primaryMediaElement.playbackRate = targetSpeed;
            saveDomainSpeed(targetSpeed);
            break;
          }
          case 'toggle_fullscreen': {
            const hasMedia = Boolean(
              primaryMediaElement ||
              document.querySelector('video') ||
              document.getElementById('movie_player') ||
              document.querySelector('.html5-video-player')
            );
            if (!hasMedia) break;

            if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
              window.__SentinelFullscreenController.toggle(null);
            } else {
              const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
              if (floatingBtn) {
                try { floatingBtn.click(); } catch (_) {}
              } else {
                forwardActionToMainWorld('toggle_fullscreen', data);
                const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') || document.querySelector('.ytp-fullscreen-button');
                if (ytFsBtn) {
                  try { ytFsBtn.click(); } catch (_) {}
                } else {
                  try {
                    const ev = new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true });
                    (document.getElementById('movie_player') || document).dispatchEvent(ev);
                  } catch (_) {}
                }
                toggleWebFullscreen(primaryMediaElement);
              }
            }
            break;
          }
          case 'toggle_pip': {
            if (document.pictureInPictureElement) {
              if (document.exitPictureInPicture) document.exitPictureInPicture().catch(() => {});
            } else if (primaryMediaElement.requestPictureInPicture) {
              primaryMediaElement.requestPictureInPicture().catch(() => {});
            }
            break;
          }
          case 'toggle_theater': {
            const sizeBtn = document.querySelector('.ytp-size-button');
            if (sizeBtn) {
              sizeBtn.click();
            } else {
              try {
                const ev = new KeyboardEvent('keydown', { key: 't', code: 'KeyT', keyCode: 84, which: 84, bubbles: true });
                const target = document.getElementById('movie_player') || document.querySelector('.html5-video-player') || document;
                target.dispatchEvent(ev);
              } catch (_) {}
              const watchFlexy = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
              if (watchFlexy) {
                if (watchFlexy.hasAttribute('theater')) {
                  watchFlexy.removeAttribute('theater');
                } else {
                  watchFlexy.setAttribute('theater', '');
                }
              } else {
                toggleTheaterMode(primaryMediaElement);
              }
            }
            break;
          }
          case 'step_quality':
          case 'set_quality':
            // Forwarded to Main World execution engine via forwardActionToMainWorld
            break;
        }
      } catch (_) {}
    }

    // Immediately broadcast updated telemetry state after control action
    const scheduleTelemetry = typeof safeSetTimeout === 'function' ? safeSetTimeout : setTimeout;
    scheduleTelemetry(() => dispatchMediaTelemetry(true), 60);
    scheduleTelemetry(() => dispatchMediaTelemetry(true), 250);
    return { success: true };
  }

  // YouTube SPA Navigation Listeners & Visibility
  ['yt-navigate-finish', 'yt-page-data-updated', 'spfdone', 'yt-player-updated'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      scanAndMonitorMedia();
      restoreDomainSpeed();
      dispatchMediaTelemetry(true);
      [200, 500, 1000, 2000].forEach(delay => {
        safeSetTimeout(() => {
          if (isContextInvalidated || !isExtensionContextValid()) {
            teardownMediaSentinel();
            return;
          }
          scanAndMonitorMedia();
          restoreDomainSpeed();
          dispatchMediaTelemetry(true);
        }, delay);
      });
    }, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    if (!document.hidden) {
      scanAndMonitorMedia();
      restoreDomainSpeed();
      dispatchMediaTelemetry(true);
    }
  }, { passive: true });

  window.addEventListener('popstate', () => {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    safeSetTimeout(() => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      scanAndMonitorMedia();
      restoreDomainSpeed();
      dispatchMediaTelemetry(true);
    }, 200);
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    safeSetTimeout(() => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      scanAndMonitorMedia();
      restoreDomainSpeed();
      dispatchMediaTelemetry(true);
    }, 200);
  }, { passive: true });

  // Initialization sequence
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      scanAndMonitorMedia();
      setupMutationObserver();
      initAdSilencer();
      restoreDomainSpeed();
      initAudioLabSettings();
    });
  } else {
    if (!isContextInvalidated && isExtensionContextValid()) {
      scanAndMonitorMedia();
      setupMutationObserver();
      initAdSilencer();
      restoreDomainSpeed();
      initAudioLabSettings();
    }
  }

  // Early initialization attempt for fast hydration at document_start
  try {
    if (!isContextInvalidated && isExtensionContextValid()) {
      initAdSilencer();
      initAudioLabSettings();
    }
  } catch (_) {}

  // Extra scans during first 5 seconds to catch dynamically injected players
  [500, 1500, 3000, 5000].forEach(delay => {
    safeSetTimeout(() => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      scanAndMonitorMedia();
    }, delay);
  });

  setupUserActivityListeners();

  // Periodic heartbeat every 2 seconds to keep telemetry strictly synced
  periodicHeartbeatTimer = setInterval(() => {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    scanAndMonitorMedia();
    dispatchMediaTelemetry(false);
  }, 2000);

  // Listen for real-time state broadcasts from Main World script
  window.addEventListener('__MEDIA_SENTINEL_PAGE_STATE__', () => {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    dispatchMediaTelemetry(false);
  }, { passive: true });

  // Top-frame cross-frame message listener for iframe fullscreen delegation
  window.addEventListener('message', (event) => {
    if (isContextInvalidated) return;
    if (!isTopFrame || !event.data || event.data.type !== '__SENTINEL_IFRAME_FULLSCREEN__') return;

    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      return;
    }

    // Locate source iframe that requested fullscreen
    const iframes = Array.from(document.querySelectorAll('iframe'));
    let targetIframe = iframes.find(iframe => {
      try { return iframe.contentWindow === event.source; } catch (_) { return false; }
    });

    if (!targetIframe && iframes.length > 0) {
      targetIframe = iframes.find(iframe => {
        const src = (iframe.src || iframe.getAttribute('src') || '').toLowerCase();
        return src.includes('youtube') || src.includes('embed') || src.includes('vimeo') || src.includes('video');
      }) || iframes[0];
    }

    if (targetIframe) {
      if (typeof targetIframe.requestFullscreen === 'function') {
        targetIframe.requestFullscreen().catch(() => {});
      } else if (typeof targetIframe.webkitRequestFullscreen === 'function') {
        targetIframe.webkitRequestFullscreen();
      }
    }
  }, { passive: true });

  // fadeIntervalId is declared in top-level lifecycle scope for clean teardown access

  /**
   * Executes smooth volume attenuation down to 0 before pausing media elements.
   * Restores original volume on pause so future playback resumes at expected sound level.
   */
  function executeSmoothFadeAndPause(fadeDurationSec = 30) {
    const mediaElements = Array.from(document.querySelectorAll('video, audio')).filter(el => !el.paused);
    if (mediaElements.length === 0) return;

    if (fadeIntervalId) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
    }

    const steps = 15;
    const durationMs = Math.max(1000, Number(fadeDurationSec || 30) * 1000);
    const stepIntervalMs = durationMs / steps;
    let currentStep = 0;

    // Cache initial volumes
    const initialVolumes = mediaElements.map(el => ({ el, vol: el.volume }));

    fadeIntervalId = setInterval(() => {
      if (isContextInvalidated || !isExtensionContextValid()) {
        teardownMediaSentinel();
        return;
      }
      currentStep++;
      const factor = Math.max(0, 1 - (currentStep / steps));

      initialVolumes.forEach(({ el, vol }) => {
        try {
          el.volume = vol * factor;
        } catch (_) {}
      });

      if (currentStep >= steps) {
        clearInterval(fadeIntervalId);
        fadeIntervalId = null;
        initialVolumes.forEach(({ el, vol }) => {
          try {
            el.pause();
            el.volume = vol; // Restore initial volume for clean subsequent playback
          } catch (_) {}
        });
        try {
          handleMediaControl('pause');
        } catch (_) {}
      }
    }, stepIntervalMs);
  }

  // ---------------------------------------------------------------------------
  // Sleep Advanced: Video Autoplay Block & YouTube Next Video Cancel
  // ---------------------------------------------------------------------------
  const sleepAutoplayBlockState = {
    enabled: false,
    sleepTimerActive: false,
    observer: null
  };

  function isSleepAutoplayBlockActive() {
    return sleepAutoplayBlockState.enabled && sleepAutoplayBlockState.sleepTimerActive;
  }

  function applyAutoplayBlockToVideo(video) {
    if (!video) return;
    try {
      video.autoplay = false;
      video.removeAttribute('autoplay');
    } catch (_) {}
  }

  function disableYouTubeAutoplayToggle() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('youtube.com')) {
        const ytToggle = document.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]');
        if (ytToggle) {
          ytToggle.click();
        }
      }
    } catch (_) {}
  }

  function applySleepAutoplayBlock() {
    if (!isSleepAutoplayBlockActive()) return;
    const videos = document.querySelectorAll('video');
    videos.forEach(v => applyAutoplayBlockToVideo(v));
    disableYouTubeAutoplayToggle();

    if (!sleepAutoplayBlockState.observer && typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      sleepAutoplayBlockState.observer = new MutationObserver((mutations) => {
        if (!isSleepAutoplayBlockActive()) return;
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1) {
              if (node.tagName === 'VIDEO') {
                applyAutoplayBlockToVideo(node);
              } else if (node.querySelectorAll) {
                node.querySelectorAll('video').forEach(v => applyAutoplayBlockToVideo(v));
              }
            }
          }
        }
        disableYouTubeAutoplayToggle();
      });
      sleepAutoplayBlockState.observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }

  function onSleepVideoEnded(e) {
    if (!isSleepAutoplayBlockActive()) return;
    try {
      const v = e.target;
      if (v && typeof v.pause === 'function') v.pause();
      const cancelBtn = document.querySelector('.ytp-autonav-endscreen-button-cancel');
      if (cancelBtn) cancelBtn.click();
    } catch (_) {}
  }

  function initSleepAutoplayBlock() {
    if (typeof document === 'undefined') return;
    document.addEventListener('ended', onSleepVideoEnded, true);

    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      browserAPI.storage.local.get(['sentinel_sleep_adv_autoplay_block', 'sentinel_sleep_timer'], (res) => {
        if (!res) return;
        sleepAutoplayBlockState.enabled = res.sentinel_sleep_adv_autoplay_block === true || res.sentinel_sleep_adv_autoplay_block === 'true';
        const st = res.sentinel_sleep_timer;
        sleepAutoplayBlockState.sleepTimerActive = !!(st && (st.state === 'RUNNING' || st.state === 'FADING'));
        if (isSleepAutoplayBlockActive()) {
          applySleepAutoplayBlock();
        }
      });
    }

    if (browserAPI && browserAPI.storage && browserAPI.storage.onChanged) {
      browserAPI.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        let changed = false;
        if (changes.sentinel_sleep_adv_autoplay_block) {
          sleepAutoplayBlockState.enabled = changes.sentinel_sleep_adv_autoplay_block.newValue === true || changes.sentinel_sleep_adv_autoplay_block.newValue === 'true';
          changed = true;
        }
        if (changes.sentinel_sleep_timer) {
          const st = changes.sentinel_sleep_timer.newValue;
          sleepAutoplayBlockState.sleepTimerActive = !!(st && (st.state === 'RUNNING' || st.state === 'FADING'));
          changed = true;
        }
        if (changed && isSleepAutoplayBlockActive()) {
          applySleepAutoplayBlock();
        }
      });
    }
  }

  // Runtime IPC Message Listener (Queries & Controls)
  browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    if (!message || (!message.type && !message.action)) return;

    const safeSendResponse = (data) => {
      try {
        sendResponse(data);
      } catch (e) {
        if (isInvalidationError(e)) teardownMediaSentinel();
      }
    };

    const msgType = message.type || '';
    const msgAction = message.action || '';
    const actionType = msgAction || msgType;

    // 1. Telemetry Query
    if (msgType === 'QUERY_PAGE_MEDIA' || msgAction === 'QUERY_PAGE_MEDIA') {
      const { currentState } = evaluatePageMediaState();
      safeSendResponse(currentState);
      return true;
    }

    // 2. Standard MEDIA_CONTROL Envelope (from background worker or popup)
    if (msgType === 'MEDIA_CONTROL' || msgAction === 'MEDIA_CONTROL') {
      const targetAction = message.action && message.action !== 'MEDIA_CONTROL'
        ? message.action
        : (message.data && message.data.action);
      const targetData = message.data || {};
      const result = handleMediaControl(targetAction, targetData);
      safeSendResponse(result);
      return true;
    }

    // 3. Dedicated SET_VOLUME Envelope (from background worker or popup)
    if (msgType === 'SET_VOLUME' || msgAction === 'SET_VOLUME') {
      const result = handleMediaControl('set_volume', message.data || { volume: message.volume, percent: message.percent });
      safeSendResponse(result);
      return true;
    }

    // 4. Direct Media Action Fallback (when action is sent directly as type or action)
    const KNOWN_MEDIA_ACTIONS = [
      'play', 'pause', 'toggle_play', 'seek_relative', 'seek_percent',
      'seek_to', 'seek_absolute',
      'toggle_mute', 'mute', 'unmute', 'set_volume', 'SET_VOLUME', 'step_speed', 'set_speed',
      'cycle_speed', 'toggle_fullscreen', 'toggle_pip', 'toggle_theater',
      'step_quality', 'set_quality'
    ];
    if (KNOWN_MEDIA_ACTIONS.includes(msgAction) || KNOWN_MEDIA_ACTIONS.includes(msgType)) {
      const targetAction = KNOWN_MEDIA_ACTIONS.includes(msgAction) ? msgAction : msgType;
      const targetData = message.data || ((targetAction === 'set_volume' || targetAction === 'SET_VOLUME') ? { volume: message.volume, percent: message.percent } : {});
      const result = handleMediaControl(targetAction, targetData);
      safeSendResponse(result);
      return true;
    }

    // 5. Smooth Fade and Pause Envelope
    if (msgType === 'FADE_AND_PAUSE' || msgAction === 'FADE_AND_PAUSE') {
      executeSmoothFadeAndPause(message.fadeDurationSeconds || 30);
      safeSendResponse({ received: true });
      return true;
    }

    // 6. Direct PAUSE_MEDIA Command
    if (msgType === 'PAUSE_MEDIA' || msgAction === 'PAUSE_MEDIA') {
      if (fadeIntervalId) {
        clearInterval(fadeIntervalId);
        fadeIntervalId = null;
      }
      document.querySelectorAll('video, audio').forEach(el => {
        try { el.pause(); } catch (_) {}
      });
      try {
        handleMediaControl('pause');
      } catch (_) {}
      safeSendResponse({ paused: true });
      return true;
    }

    // 7. Direct RESUME_MEDIA Command
    if (msgType === 'RESUME_MEDIA' || msgAction === 'RESUME_MEDIA') {
      try {
        handleMediaControl('play');
      } catch (_) {}
      safeSendResponse({ resumed: true });
      return true;
    }

    // 8. Audio Lab Settings
    if (actionType === 'APPLY_AUDIO_LAB_SETTINGS') {
      const settings = message.settings || {};
      try {
        window.postMessage({
          type: 'APPLY_AUDIO_LAB_SETTINGS',
          settings: settings
        }, '*');
      } catch (_) {}
      setAudioOnlyMode(Boolean(settings && settings.audio_only));
      safeSendResponse({ success: true, audio_only: Boolean(settings && settings.audio_only) });
      return true;
    }

    // 9. Video Frame Capture
    if (actionType === 'CAPTURE_VIDEO_FRAME') {
      try {
        const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
        if (!video || !video.videoWidth || !video.videoHeight) {
          safeSendResponse({ success: false, error: 'No active video element with valid dimensions found' });
          return true;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          safeSendResponse({ success: false, error: 'Failed to create 2d canvas context' });
          return true;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        safeSendResponse({ success: true, dataUrl, width: canvas.width, height: canvas.height });
      } catch (err) {
        safeSendResponse({ success: false, error: err.message });
      }
      return true;
    }

    // 10. Sleep Advanced: Autoplay Block
    if (msgType === 'SET_SLEEP_AUTOPLAY_BLOCK' || msgAction === 'SET_SLEEP_AUTOPLAY_BLOCK') {
      sleepAutoplayBlockState.enabled = message.enabled !== false;
      if (message.sleepTimerActive !== undefined) {
        sleepAutoplayBlockState.sleepTimerActive = !!message.sleepTimerActive;
      }
      if (isSleepAutoplayBlockActive()) {
        applySleepAutoplayBlock();
      }
      safeSendResponse({ success: true, active: isSleepAutoplayBlockActive() });
      return true;
    }

    return true;
  });

  // Expose Sentinel Smart Automations hooks for testing and inspection
  if (typeof window !== 'undefined') {
    window.__SentinelSleepAutoplayBlock = {
      init: initSleepAutoplayBlock,
      applySleepAutoplayBlock,
      isSleepAutoplayBlockActive,
      getState: () => ({ ...sleepAutoplayBlockState }),
      setState: (st) => { Object.assign(sleepAutoplayBlockState, st); }
    };
    window.__SentinelDoomScrollGuard = {
      init: initDoomScrollGuard,
      initDoomScrollGuard,
      showBreathBanner,
      dismissBreathBanner,
      onWindowScroll,
      isFeedHost,
      getState: () => ({ ...doomScrollState }),
      setState: (st) => { Object.assign(doomScrollState, st); }
    };
    window.__SentinelAdSilencer = {
      init: initAdSilencer,
      initAdSilencer,
      checkAdMarkers,
      checkAndApply: checkAndApplyAdSilencer,
      checkAndApplyAdSilencer,
      getState: () => ({ adSilencerEnabled, isAdMuted, preAdVolume })
    };
    window.__SentinelDomainSpeed = {
      restoreDomainSpeed,
      saveDomainSpeed,
      getSanitizedHost,
      getState: () => ({ isRestoringSpeed, domainSpeedMemoryEnabled })
    };
    window.__SentinelMediaFrameCapture = {
      captureVideoFrame: () => {
        try {
          const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
          if (!video || !video.videoWidth || !video.videoHeight) return null;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/png');
        } catch (_) {
          return null;
        }
      }
    };
    window.__SentinelAudioOnlyMode = {
      setAudioOnlyMode,
      initAudioLabSettings,
      getState: () => ({ audioOnlyModeActive })
    };
    // =============================================================================
    // Feature 8: Doom-Scrolling Velocity Guard & Gentle "Take a Breath" Sentinel
    // =============================================================================
    const doomScrollState = {
      isMonitoring: false,
      scrollStartTime: Date.now(),
      lastScrollTime: Date.now(),
      lastScrollY: 0,
      accumulatedDeltaY: 0,
      consecutiveScrollMinutes: 0,
      bannerVisible: false,
      thresholdMinutes: 20,
      bannerDismissTimeout: null
    };

    const DOOMSCROLL_FEED_HOSTS = ['youtube.com', 'reddit.com', 'twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com'];

    function isFeedHost() {
      try {
        const h = (window.location && window.location.hostname ? window.location.hostname : '').toLowerCase();
        return DOOMSCROLL_FEED_HOSTS.some(fh => h === fh || h.endsWith('.' + fh));
      } catch (_) {
        return false;
      }
    }

    function showBreathBanner(customMinutes) {
      if (typeof document === 'undefined') return null;
      const mins = customMinutes || doomScrollState.thresholdMinutes || 20;

      const existing = document.getElementById('__sentinel_doomscroll_banner__');
      if (existing) {
        existing.remove();
      }

      const banner = document.createElement('div');
      banner.id = '__sentinel_doomscroll_banner__';
      banner.className = 'sentinel-breath-banner';
      banner.setAttribute('role', 'alert');
      banner.setAttribute('aria-live', 'polite');

      banner.style.position = 'fixed';
      banner.style.top = '16px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.zIndex = '2147483645';
      banner.style.backgroundColor = 'rgba(15, 23, 42, 0.92)';
      banner.style.color = '#f8fafc';
      banner.style.backdropFilter = 'blur(12px)';
      banner.style.webkitBackdropFilter = 'blur(12px)';
      banner.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      banner.style.borderRadius = '12px';
      banner.style.padding = '10px 18px';
      banner.style.display = 'flex';
      banner.style.alignItems = 'center';
      banner.style.gap = '12px';
      banner.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.2)';
      banner.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      banner.style.fontSize = '14px';
      banner.style.fontWeight = '500';
      banner.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      banner.style.pointerEvents = 'auto';

      const iconSpan = document.createElement('span');
      iconSpan.style.fontSize = '18px';
      iconSpan.textContent = '🧘';

      const textSpan = document.createElement('span');
      textSpan.textContent = "Take a Breath — You've been scrolling for " + mins + " minutes";

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = '✕';
      closeBtn.setAttribute('aria-label', 'Dismiss banner');
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = '#94a3b8';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontSize = '14px';
      closeBtn.style.padding = '2px 6px';
      closeBtn.style.borderRadius = '4px';

      closeBtn.addEventListener('click', () => {
        dismissBreathBanner();
      });

      banner.appendChild(iconSpan);
      banner.appendChild(textSpan);
      banner.appendChild(closeBtn);

      if (document.body) {
        document.body.appendChild(banner);
      } else if (document.documentElement) {
        document.documentElement.appendChild(banner);
      }

      doomScrollState.bannerVisible = true;

      if (doomScrollState.bannerDismissTimeout) {
        clearTimeout(doomScrollState.bannerDismissTimeout);
      }
      doomScrollState.bannerDismissTimeout = setTimeout(() => {
        dismissBreathBanner();
      }, 8000);

      return banner;
    }

    function dismissBreathBanner() {
      if (typeof document === 'undefined') return;
      const banner = document.getElementById('__sentinel_doomscroll_banner__');
      if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => {
          if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 400);
      }
      doomScrollState.bannerVisible = false;
    }

    function onWindowScroll() {
      if (typeof window === 'undefined') return;
      const now = Date.now();
      const currentY = window.scrollY || window.pageYOffset || 0;
      const delta = Math.abs(currentY - doomScrollState.lastScrollY);

      doomScrollState.accumulatedDeltaY += delta;
      doomScrollState.lastScrollY = currentY;

      if (now - doomScrollState.lastScrollTime > 3 * 60 * 1000) {
        doomScrollState.scrollStartTime = now;
        doomScrollState.accumulatedDeltaY = 0;
      }
      doomScrollState.lastScrollTime = now;

      const continuousMinutes = Math.floor((now - doomScrollState.scrollStartTime) / (60 * 1000));
      doomScrollState.consecutiveScrollMinutes = continuousMinutes;

      if (continuousMinutes >= doomScrollState.thresholdMinutes && !doomScrollState.bannerVisible) {
        showBreathBanner(continuousMinutes);
        doomScrollState.scrollStartTime = now;
      }
    }

    function initDoomScrollGuard(options = {}) {
      if (typeof window === 'undefined') return;
      if (options.thresholdMinutes) {
        doomScrollState.thresholdMinutes = options.thresholdMinutes;
      }

      if (!doomScrollState.isMonitoring) {
        doomScrollState.isMonitoring = true;
        doomScrollState.scrollStartTime = Date.now();
        doomScrollState.lastScrollTime = Date.now();
        doomScrollState.lastScrollY = window.scrollY || 0;

        let scrollThrottled = false;
        window.addEventListener('scroll', () => {
          if (!scrollThrottled) {
            scrollThrottled = true;
            setTimeout(() => {
              onWindowScroll();
              scrollThrottled = false;
            }, 500);
          }
        }, { passive: true });
      }
    }

    const isTop = (typeof isTopFrame !== 'undefined') ? isTopFrame : (typeof window !== 'undefined' && window === window.top);
    if (isTop && typeof window !== 'undefined') {
      try {
        if (isFeedHost()) {
          initDoomScrollGuard();
        }
      } catch (_) {}
      try {
        initSleepAutoplayBlock();
      } catch (_) {}
      try {
        if (typeof document !== 'undefined') {
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              connectTrackingKeepalivePort();
            } else {
              disconnectTrackingKeepalivePort();
            }
          });
          if (document.visibilityState === 'visible') {
            connectTrackingKeepalivePort();
          }
        }
      } catch (_) {}
    }

    window.__SentinelDoomScrollGuard = {
      init: initDoomScrollGuard,
      initDoomScrollGuard,
      showBreathBanner,
      dismissBreathBanner,
      onWindowScroll,
      isFeedHost,
      getState: () => ({ ...doomScrollState }),
      setState: (st) => { Object.assign(doomScrollState, st); }
    };

    window.__SentinelMediaContext = {
      isExtensionContextValid,
      isContextValid,
      isContextInvalidated: () => isContextInvalidated,
      isOrphaned: () => isOrphaned,
      teardownMediaSentinel,
      teardownInvalidatedContext,
      safeStorageGet,
      safeStorageSet,
      safeSendMessage,
      safeSetTimeout,
      safeClearTimeout,
      connectTrackingKeepalivePort,
      disconnectTrackingKeepalivePort,
      sendTrackingHeartbeat,
      getKeepalivePort: () => keepalivePort,
      isExcludedTrackingHost
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = (typeof window !== 'undefined' ? window.__SentinelMediaContext : null);
  }
})();
