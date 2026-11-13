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
  const browserAPI = typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime 
    ? globalThis.browser 
    : globalThis.chrome;

  if (!browserAPI || !browserAPI.runtime || !browserAPI.runtime.sendMessage) {
    return;
  }

  const isTopFrame = window === window.top;
  const monitoredElements = new WeakSet();
  let lastReportedState = null;
  let lastActivityTimestamp = Date.now();
  let lastProgressBroadcastTime = 0;
  let observer = null;
  let titleObserver = null;
  let periodicHeartbeatTimer = null;

  /**
   * Safe IPC message sender to background service worker
   */
  function safeSendMessage(message, callback) {
    try {
      if (browserAPI.runtime && browserAPI.runtime.id) {
        const maybePromise = browserAPI.runtime.sendMessage(message, (response) => {
          const err = browserAPI.runtime.lastError;
          if (callback && typeof callback === 'function') {
            try { callback(response, err); } catch (_) {}
          }
        });
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
      }
    } catch (e) {
      // Extension context invalidated (e.g. extension updated/reloaded during dev)
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

    const currentState = {
      isTopFrame,
      domain: window.location.hostname,
      url: window.location.href,
      title: extractMediaTitle(),
      hasMedia: mediaNodes.length > 0,
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
    const { currentState } = evaluatePageMediaState();

    // Prevent non-media iframes from clobbering top frame
    if (!isTopFrame && !currentState.hasMedia) {
      return;
    }

    const now = Date.now();

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
  }

  /**
   * Attaches event listeners to a media element
   */
  function attachMediaListeners(media) {
    if (!media || monitoredElements.has(media)) return;
    monitoredElements.add(media);

    const immediateEvents = [
      'play', 'playing', 'pause', 'ended', 'waiting',
      'volumechange', 'ratechange', 'loadedmetadata', 'durationchange',
      'seeked', 'emptied', 'canplay', 'loadeddata', 'resize'
    ];

    immediateEvents.forEach(evt => {
      media.addEventListener(evt, () => {
        dispatchMediaTelemetry(true);
      }, { passive: true });
    });

    // High-resolution timeupdate listener: broadcasts during active playback
    media.addEventListener('timeupdate', () => {
      dispatchMediaTelemetry(false);
    }, { passive: true });
  }

  /**
   * Scans and ensures all <iframe> elements have proper fullscreen permissions and attributes.
   * Resolves the "Full screen is unavailable. Learn More" embedded player error.
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
          // Set allowfullscreen attributes across standard and legacy vendor prefixes
          if (!iframe.hasAttribute('allowfullscreen')) {
            iframe.setAttribute('allowfullscreen', 'true');
          }
          if (!iframe.hasAttribute('webkitallowfullscreen')) {
            iframe.setAttribute('webkitallowfullscreen', 'true');
          }
          if (!iframe.hasAttribute('mozallowfullscreen')) {
            iframe.setAttribute('mozallowfullscreen', 'true');
          }

          // Ensure Permissions-Policy / allow attribute includes 'fullscreen'
          const existingAllow = iframe.getAttribute('allow') || '';
          if (!existingAllow) {
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
          } else if (!/\bfullscreen\b/i.test(existingAllow)) {
            iframe.setAttribute('allow', `${existingAllow.trim().replace(/;$/, '')}; fullscreen`);
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  /**
   * Scans document for media elements and attaches event listeners
   */
  function scanAndMonitorMedia() {
    ensureMainWorldInjected();
    ensureIframeFullscreenSupport(document);
    const elements = findAllMediaNodes(document);
    elements.forEach(attachMediaListeners);

    if (elements.length > 0 || isTopFrame) {
      dispatchMediaTelemetry(true);
    }
  }

  /**
   * Observes DOM mutations for newly added media nodes (SPAs, YouTube, etc.)
   */
  function setupMutationObserver() {
    if (observer) return;

    observer = new MutationObserver(mutations => {
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
    try {
      const root = document.documentElement;
      if (root && root.getAttribute('data-sentinel-bridge-ready') === 'true') {
        return;
      }
      if (document.getElementById('__media_sentinel_bridge_script__')) {
        return;
      }
      const s = document.createElement('script');
      s.id = '__media_sentinel_bridge_script__';
      s.src = browserAPI.runtime.getURL('inject_main_world.js');
      s.onload = () => s.remove();
      (document.head || document.documentElement || document.body).appendChild(s);
    } catch (_) {}
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
      return window.__SentinelFullscreenController.toggle(targetElement);
    }
    try {
      ensureWebFullscreenStyles();
      const el = targetElement || document.getElementById('movie_player') || document.querySelector('.html5-video-player') || document.querySelector('video') || document.body;
      if (!el) return false;

      const isWebFs = el.classList.contains('sentinel-web-fullscreen') || Boolean(document.querySelector('.sentinel-web-fullscreen'));
      if (isWebFs) {
        const fsElements = document.querySelectorAll('.sentinel-web-fullscreen');
        fsElements.forEach(item => item.classList.remove('sentinel-web-fullscreen'));
        if (document.body) document.body.classList.remove('sentinel-has-web-fullscreen');
        if (document.documentElement) document.documentElement.classList.remove('sentinel-has-web-fullscreen');
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
        if (document.body) document.body.classList.add('sentinel-has-web-fullscreen');
        if (document.documentElement) document.documentElement.classList.add('sentinel-has-web-fullscreen');
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

  /**
   * Executes interactive media control actions (play, pause, toggle, mute, seek, speed, quality, window modes)
   */
  function handleMediaControl(action, data = {}) {
    // Guard: Only top frame or a subframe that actually contains active media should process controls
    const { primaryMediaElement } = evaluatePageMediaState();
    if (!isTopFrame && !primaryMediaElement) {
      return { success: false, ignored: true, reason: 'No media in this subframe' };
    }

    // 1. Forward action to Main World engine (essential for YouTube native player methods, volume slider & OSD)
    forwardActionToMainWorld(action, data);

    // 2. Perform direct HTML5 video element manipulation
    // Direct HTML5 execution guarantees immediate playback/seek/speed control across all browsers (including Microsoft Edge)
    // without relying on fragile cross-world custom event bridges or suffering bounceback refresh lag.
    if (primaryMediaElement) {
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
          case 'cycle_speed': {
            const cur = primaryMediaElement.playbackRate || 1.0;
            primaryMediaElement.playbackRate = calculateNextLadderSpeed(cur, 'up');
            break;
          }
          case 'set_speed': {
            if (typeof data.rate === 'number' && data.rate > 0) {
              primaryMediaElement.playbackRate = Math.max(0.25, Math.min(2.0, Math.round(data.rate * 100) / 100));
            }
            break;
          }
          case 'step_speed': {
            const cur = primaryMediaElement.playbackRate || 1.0;
            const targetSpeed = (typeof data.targetSpeed === 'number' && data.targetSpeed >= 0.25 && data.targetSpeed <= 2.0)
              ? data.targetSpeed
              : calculateNextLadderSpeed(cur, data.direction || (data.step < 0 ? 'down' : 'up'));
            primaryMediaElement.playbackRate = targetSpeed;
            break;
          }
          case 'toggle_fullscreen': {
            if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
              window.__SentinelFullscreenController.toggle(primaryMediaElement);
            } else {
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
    setTimeout(() => dispatchMediaTelemetry(true), 60);
    setTimeout(() => dispatchMediaTelemetry(true), 250);
    return { success: true };
  }

  // YouTube SPA Navigation Listeners & Visibility
  ['yt-navigate-finish', 'yt-page-data-updated', 'spfdone', 'yt-player-updated'].forEach(evt => {
    document.addEventListener(evt, () => {
      scanAndMonitorMedia();
      dispatchMediaTelemetry(true);
      [200, 500, 1000, 2000].forEach(delay => {
        setTimeout(() => {
          scanAndMonitorMedia();
          dispatchMediaTelemetry(true);
        }, delay);
      });
    }, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      scanAndMonitorMedia();
      dispatchMediaTelemetry(true);
    }
  }, { passive: true });

  window.addEventListener('popstate', () => {
    setTimeout(() => {
      scanAndMonitorMedia();
      dispatchMediaTelemetry(true);
    }, 200);
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    setTimeout(() => {
      scanAndMonitorMedia();
      dispatchMediaTelemetry(true);
    }, 200);
  }, { passive: true });

  // Initialization sequence
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scanAndMonitorMedia();
      setupMutationObserver();
    });
  } else {
    scanAndMonitorMedia();
    setupMutationObserver();
  }

  // Extra scans during first 5 seconds to catch dynamically injected players
  [500, 1500, 3000, 5000].forEach(delay => {
    setTimeout(() => {
      scanAndMonitorMedia();
    }, delay);
  });

  setupUserActivityListeners();

  // Periodic heartbeat every 2 seconds to keep telemetry strictly synced
  periodicHeartbeatTimer = setInterval(() => {
    scanAndMonitorMedia();
    dispatchMediaTelemetry(false);
  }, 2000);

  // Listen for real-time state broadcasts from Main World script
  window.addEventListener('__MEDIA_SENTINEL_PAGE_STATE__', () => {
    dispatchMediaTelemetry(false);
  }, { passive: true });

  // Top-frame cross-frame message listener for iframe fullscreen delegation
  window.addEventListener('message', (event) => {
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

  let fadeIntervalId = null;

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

  // Runtime IPC Message Listener (Queries & Controls)
  browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || (!message.type && !message.action)) return;
    const actionType = message.action || message.type;

    if (actionType === 'QUERY_PAGE_MEDIA') {
      const { currentState } = evaluatePageMediaState();
      sendResponse(currentState);
      return true;
    }

    if (actionType === 'MEDIA_CONTROL') {
      const result = handleMediaControl(message.action, message.data || {});
      sendResponse(result);
      return true;
    }

    if (actionType === 'SET_VOLUME') {
      const result = handleMediaControl('set_volume', message.data || { volume: message.volume, percent: message.percent });
      sendResponse(result);
      return true;
    }

    if (actionType === 'FADE_AND_PAUSE') {
      executeSmoothFadeAndPause(message.fadeDurationSeconds || 30);
      sendResponse({ received: true });
      return true;
    }

    if (actionType === 'PAUSE_MEDIA') {
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
      sendResponse({ paused: true });
      return true;
    }

    if (actionType === 'RESUME_MEDIA') {
      try {
        handleMediaControl('play');
      } catch (_) {}
      sendResponse({ resumed: true });
      return true;
    }

    return true;
  });

})();
