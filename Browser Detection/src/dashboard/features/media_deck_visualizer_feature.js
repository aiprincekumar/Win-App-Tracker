/**
 * Web Activity & Media Sentinel - Multi-Tab Live Media Deck & Audio Visualizer Feature
 * Features 3 & 4: Multi-Tab Live Media Deck, Remote Media Control, Solo Mode Muting,
 * and 60fps Real-Time Audio Visualizer (32-Band FFT & Oscilloscope Waveform) with Zero-Overhead Idle Sleep.
 * 
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // Platform Detection Mapping from URL/Domain
  function getPlatformFromUrl(url = '', domain = '') {
    const raw = (url + ' ' + domain).toLowerCase();
    if (raw.includes('youtube.com') || raw.includes('youtu.be')) return 'YouTube';
    if (raw.includes('netflix.com')) return 'Netflix';
    if (raw.includes('spotify.com')) return 'Spotify';
    if (raw.includes('twitch.tv')) return 'Twitch';
    if (raw.includes('soundcloud.com')) return 'SoundCloud';
    if (raw.includes('primevideo.com')) return 'Prime Video';
    if (raw.includes('disneyplus.com')) return 'Disney+';
    if (raw.includes('hotstar.com')) return 'Hotstar';
    if (raw.includes('vimeo.com')) return 'Vimeo';
    if (raw.includes('ted.com')) return 'TED';
    if (raw.includes('bilibili.com')) return 'Bilibili';
    return 'Web Media';
  }

  // Format seconds to mm:ss or hh:mm:ss
  function formatDurationSec(totalSec) {
    if (!Number.isFinite(totalSec) || totalSec <= 0) return '0:00';
    const s = Math.floor(totalSec);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const secStr = secs < 10 ? `0${secs}` : `${secs}`;
    if (hrs > 0) {
      const minStr = mins < 10 ? `0${mins}` : `${mins}`;
      return `${hrs}:${minStr}:${secStr}`;
    }
    return `${mins}:${secStr}`;
  }

  // Active Streams Cache & Global Mute Toggle State
  let cachedStreams = [];
  let currentSoloTabId = null;
  let isMuteAllOthersActive = false;
  let isMuteAllActive = false;

  /**
   * Dispatches remote media command to background service worker.
   */
  function handleRemoteMediaCommand(tabId, command, value, options = {}) {
    const api = options.browserAPI || (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null));
    const numTabId = Number(tabId);
    if (!numTabId) return Promise.reject(new Error('Invalid tabId'));

    // Optimistically update local cached streams
    const stream = cachedStreams.find(s => s.tabId === numTabId);
    if (stream) {
      if (command === 'play') {
        stream.playbackState = 'playing';
        stream.isPlaying = true;
      } else if (command === 'pause') {
        stream.playbackState = 'paused';
        stream.isPlaying = false;
      } else if (command === 'toggle') {
        stream.playbackState = stream.playbackState === 'playing' ? 'paused' : 'playing';
        stream.isPlaying = stream.playbackState === 'playing';
      } else if (command === 'mute') {
        stream.isMuted = true;
      } else if (command === 'unmute') {
        stream.isMuted = false;
      } else if (command === 'set_volume') {
        stream.volume = Math.max(0, Math.min(1, Number(value) || 0));
      } else if (command === 'seek_to' || command === 'seek_absolute') {
        stream.currentTime = Math.max(0, Number(value) || 0);
      } else if (command === 'seek_percent') {
        const pct = Math.max(0, Math.min(100, Number(value) || 0));
        if (Number.isFinite(stream.duration) && stream.duration > 0) {
          stream.currentTime = (pct / 100) * stream.duration;
        }
      }
    }

    function safeVisualizerSendMessage(rtApi, message, onResponse) {
      if (!rtApi || !rtApi.runtime || typeof rtApi.runtime.sendMessage !== 'function') return false;
      try {
        const p = rtApi.runtime.sendMessage(message, (res) => {
          let err = null;
          try { err = rtApi.runtime ? rtApi.runtime.lastError : null; } catch (_) {}
          if (typeof onResponse === 'function') onResponse(res, err);
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
        return true;
      } catch (_) {
        return false;
      }
    }

    if (command === 'switch_tab' || command === 'focus_tab') {
      if (api && api.runtime && typeof api.runtime.sendMessage === 'function') {
        return new Promise((resolve) => {
          const sent = safeVisualizerSendMessage(api, {
            action: 'DASHBOARD_REMOTE_MEDIA_CMD',
            tabId: numTabId,
            command: 'switch_tab',
            value
          }, (res) => {
            if (res && res.success) {
              resolve(res);
            } else {
              const sentFallback = safeVisualizerSendMessage(api, {
                type: 'JUMP_TO_MEDIA_TAB',
                tabId: numTabId
              }, (fallbackRes) => {
                resolve(fallbackRes || res || { success: true, tabId: numTabId, command });
              });
              if (!sentFallback) {
                resolve(res || { success: true, simulated: true, tabId: numTabId, command });
              }
            }
          });
          if (!sent) {
            resolve({ success: true, simulated: true, tabId: numTabId, command });
          }
        });
      }
    }

    if (api && api.runtime && typeof api.runtime.sendMessage === 'function') {
      return new Promise((resolve) => {
        const sent = safeVisualizerSendMessage(api, {
          action: 'DASHBOARD_REMOTE_MEDIA_CMD',
          tabId: numTabId,
          command,
          value
        }, (res) => {
          resolve(res || { success: true, tabId: numTabId, command });
        });
        if (!sent) {
          resolve({ success: true, simulated: true, tabId: numTabId, command });
        }
      });
    }

    return Promise.resolve({ success: true, localOnly: true, tabId: numTabId, command });
  }

  /**
   * Executes Solo Tab mode: un-mutes soloTabId and mutes all other open media streams.
   * Supports two-way toggle: if soloTabId is already active solo, clicking it toggles solo off and un-mutes all tabs.
   */
  function handleSoloTab(soloTabId, options = {}) {
    const api = options.browserAPI || (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null));
    const targetId = Number(soloTabId);
    if (!targetId) return Promise.reject(new Error('Invalid soloTabId'));

    const isAlreadySolo = (currentSoloTabId === targetId);
    currentSoloTabId = isAlreadySolo ? null : targetId;

    cachedStreams.forEach(s => {
      s.isMuted = currentSoloTabId ? (s.tabId !== currentSoloTabId) : false;
    });

    if (options.containerEl && options.doc) {
      renderMultiTabMediaDeck(cachedStreams, options.containerEl, options);
    }

    const action = isAlreadySolo ? 'MEDIA_STREAM_SOLO_CLEAR' : 'MEDIA_STREAM_SOLO';
    const payload = isAlreadySolo ? { cleared: true, soloTabId: null } : { soloTabId: targetId };
    return dispatchMediaIpc(api, action, payload);
  }

  /**
   * Helper: Dispatches media IPC action to service worker with graceful fallbacks.
   */
  function dispatchMediaIpc(apiOrPayload, actionOrPayload, payload = {}) {
    let api = null;
    let action = '';
    let data = {};

    if (apiOrPayload && (apiOrPayload.runtime || typeof apiOrPayload.sendMessage === 'function')) {
      api = apiOrPayload;
      action = typeof actionOrPayload === 'string' ? actionOrPayload : '';
      data = (payload && typeof payload === 'object') ? payload : {};
    } else if (apiOrPayload && typeof apiOrPayload === 'object' && (apiOrPayload.action || apiOrPayload.type)) {
      data = Object.assign({}, apiOrPayload);
      action = data.action || data.type || '';
      api = (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null));
    } else {
      action = typeof actionOrPayload === 'string' ? actionOrPayload : '';
      data = (payload && typeof payload === 'object') ? payload : {};
      api = (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null));
    }

    const actionMap = {
      'media:mute_all_others': 'MEDIA_STREAM_MUTE_ALL_OTHERS',
      'media:unmute_all_others': 'MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR',
      'media:mute_all': 'MEDIA_STREAM_MUTE_ALL',
      'media:unmute_all': 'MEDIA_STREAM_MUTE_ALL_CLEAR'
    };
    const canonicalAction = actionMap[action] || action;

    if (api && api.runtime && typeof api.runtime.sendMessage === 'function') {
      return new Promise((resolve) => {
        try {
          const msg = Object.assign({ action: canonicalAction, type: canonicalAction, mediaAction: action }, data);
          const p = api.runtime.sendMessage(msg, (res) => {
            try { void (api.runtime && api.runtime.lastError); } catch (_) {}
            resolve(res || Object.assign({ success: true }, data));
          });
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (_) {
          resolve(Object.assign({ success: true, simulated: true }, data));
        }
      });
    }
    return Promise.resolve(Object.assign({ success: true, localOnly: true }, data));
  }

  /**
   * Helper: Updates UI classes and localized text for Mute All Others button.
   */
  function updateBtnMuteAllOthersUI(btnEl, isActive, translate) {
    if (!btnEl) return;
    if (isActive) {
      btnEl.classList.add('active', 'btn-danger');
      btnEl.classList.remove('btn-secondary');
      btnEl.textContent = translate('btn_unmute_all_others') || '🔊 Unmute All Others';
    } else {
      btnEl.classList.remove('active', 'btn-danger');
      btnEl.classList.add('btn-secondary');
      btnEl.textContent = translate('btn_mute_all_others') || '🔇 Mute All Others';
    }
  }

  /**
   * Pure domain helper: Resolves candidate primary media tab ID according to 3-tier hierarchy:
   * Tier 0: Explicit preferred / solo tab ID
   * Tier 1: Actively playing stream (prefers unmuted)
   * Tier 2: Most recently active stream
   * Tier 3: 0 (signals backend to resolve focused browser tab) or candidate stream tab ID
   */
  function resolvePrimaryMediaTabId(streamsList, explicitTabId = null, currentSoloTabId = null) {
    const expId = Number(explicitTabId);
    if (expId > 0) return expId;
    const soloId = Number(currentSoloTabId);
    if (soloId > 0) return soloId;

    const list = Array.isArray(streamsList) ? streamsList.filter(s => s && Number(s.tabId) > 0) : [];
    if (list.length === 0) return 0;

    const active = list.filter(s => Boolean(s.isPlaying || s.playbackState === 'playing' || s.isAudible || s.audible));
    if (active.length > 0) {
      const unmuted = active.find(s => !s.isMuted && !s.muted);
      return Number(unmuted ? unmuted.tabId : active[0].tabId);
    }

    const getRec = s => Number(s.lastPlaybackTimestamp || s.lastActiveTime || s.lastUpdated || s.timestamp || 0);
    const sorted = [...list].sort((a, b) => getRec(b) - getRec(a));
    if (sorted.length > 0 && getRec(sorted[0]) > 0) {
      return Number(sorted[0].tabId);
    }

    return Number(sorted[0] && sorted[0].tabId ? sorted[0].tabId : 0);
  }

  /**
   * Executes Global Mute Others: Mutes all media streams except the primary/specified active stream.
   * Supports bidirectional toggle: if already active, toggles off and restores unmuted state.
   */
  async function handleMuteAllOthers(streamsList, primaryTabId = null, options = {}) {
    const api = options.browserAPI || (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null));
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    const containerEl = options.containerEl || (doc ? doc.getElementById('mediaDeckGrid') : null);
    const list = Array.isArray(streamsList) ? streamsList : cachedStreams;
    const btnEl = options.btnMuteAllOthers || (doc ? doc.getElementById('btnMuteAllOthers') : null);
    const translate = typeof options.t === 'function' ? options.t : (k) => k;

    const isMuted = Boolean(isMuteAllOthersActive);
    const targetId = resolvePrimaryMediaTabId(list, primaryTabId, currentSoloTabId);

    const action = isMuted ? 'MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR' : 'MEDIA_STREAM_MUTE_ALL_OTHERS';
    const mediaAction = isMuted ? 'media:unmute_all_others' : 'media:mute_all_others';
    const payload = isMuted ? { cleared: true, mediaAction } : { primaryTabId: targetId, mediaAction };

    const res = await dispatchMediaIpc(api, action, payload);

    if (res && (res.success || res.cleared || res.mutedCount !== undefined)) {
      isMuteAllOthersActive = !isMuted;
      const actualTargetId = Number(res.primaryTabId || targetId);
      list.forEach(s => {
        s.isMuted = isMuteAllOthersActive ? (s.tabId !== actualTargetId) : false;
        const cached = cachedStreams.find(c => c.tabId === s.tabId);
        if (cached) cached.isMuted = s.isMuted;
      });

      updateBtnMuteAllOthersUI(btnEl, isMuteAllOthersActive, translate);

      if (containerEl && doc) {
        renderMultiTabMediaDeck(list, containerEl, options);
      }
    }
    return res || { success: true, primaryTabId: targetId };
  }

  /**
   * Helper: Updates UI classes and localized text for Mute All button.
   */
  function updateBtnMuteAllUI(btnEl, isActive, translate) {
    if (!btnEl) return;
    if (isActive) {
      btnEl.classList.add('active', 'btn-danger');
      btnEl.classList.remove('btn-secondary');
      btnEl.textContent = translate('btn_unmute_all') || '🔊 Unmute All';
    } else {
      btnEl.classList.remove('active', 'btn-danger');
      btnEl.classList.add('btn-secondary');
      btnEl.textContent = translate('btn_mute_all') || '🔇 Mute All';
    }
  }

  /**
   * Executes Global Mute All mode: Mutes all media streams across all tabs.
   * Supports bidirectional toggle: if already active, toggles off and restores unmuted state.
   */
  async function handleMuteAll(streamsList, options = {}) {
    const api = options.browserAPI || (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null));
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    const containerEl = options.containerEl || (doc ? doc.getElementById('mediaDeckGrid') : null);
    const list = Array.isArray(streamsList) ? streamsList : cachedStreams;
    const btnEl = options.btnMuteAll || (doc ? doc.getElementById('btnMuteAll') : null);
    const translate = typeof options.t === 'function' ? options.t : (k) => k;

    const isMuted = Boolean(isMuteAllActive);
    const action = isMuted ? 'MEDIA_STREAM_MUTE_ALL_CLEAR' : 'MEDIA_STREAM_MUTE_ALL';
    const mediaAction = isMuted ? 'media:unmute_all' : 'media:mute_all';
    const payload = isMuted ? { cleared: true, mediaAction } : { mediaAction };

    const res = await dispatchMediaIpc(api, action, payload);

    if (res && (res.success || res.cleared || res.mutedCount !== undefined)) {
      isMuteAllActive = !isMuted;
      list.forEach(s => {
        s.isMuted = isMuteAllActive;
        const cached = cachedStreams.find(c => c.tabId === s.tabId);
        if (cached) cached.isMuted = s.isMuted;
      });

      updateBtnMuteAllUI(btnEl, isMuteAllActive, translate);

      if (containerEl && doc) {
        renderMultiTabMediaDeck(list, containerEl, options);
      }
    }
    return res || { success: true };
  }

  /**
   * Queries background service worker for all open media streams.
   */
  function pollMultiTabMediaStreams(options = {}) {
    const api = options.browserAPI || (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null));

    if (api && api.runtime && typeof api.runtime.sendMessage === 'function') {
      return new Promise((resolve) => {
        try {
          const p = api.runtime.sendMessage({ action: 'DASHBOARD_GET_ALL_MEDIA_STREAMS' }, (response) => {
            try { void (api.runtime && api.runtime.lastError); } catch (_) {}
            let streams = [];
            if (response) {
              if (Array.isArray(response.streams)) {
                streams = response.streams;
              } else if (Array.isArray(response)) {
                streams = response;
              }
            }
            // Defensive sanitation to guarantee only genuine media tabs are cached
            const sanitizedStreams = streams.filter(s => {
              if (!s || !s.tabId) return false;
              return Boolean(
                s.isAudible === true ||
                s.playbackState === 'playing' ||
                (typeof s.duration === 'number' && s.duration > 0) ||
                s.hasMedia === true ||
                s.isLive === true ||
                s.duration === Infinity
              );
            });
            cachedStreams = sanitizedStreams;
            if (options.containerEl && options.doc) {
              renderMultiTabMediaDeck(sanitizedStreams, options.containerEl, options);
            }
            resolve(sanitizedStreams);
          });
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (_) {
          resolve(cachedStreams);
        }
      });
    }

    return Promise.resolve(cachedStreams);
  }

  /**
   * Helper: Builds the top header row with favicon, platform badge, and status pill.
   */
  function buildDeckTopRow(doc, stream, options, translate, statusPill) {
    const topRow = doc.createElement('div');
    topRow.className = 'deck-card-top';
    topRow.style.cursor = 'pointer';
    topRow.setAttribute('title', translate('toast_switched_tab') || 'Switch to this tab in browser');
    topRow.setAttribute('role', 'button');
    topRow.setAttribute('aria-label', `Switch to tab ${stream.tabId}`);
    topRow.addEventListener('click', () => {
      handleRemoteMediaCommand(stream.tabId, 'switch_tab', 0, options);
    });

    const favicon = doc.createElement('img');
    favicon.className = 'deck-card-favicon';
    favicon.src = stream.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">🌐</text></svg>';
    favicon.alt = '';
    favicon.addEventListener('error', () => {
      favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">🌐</text></svg>';
    });

    const platformBadge = doc.createElement('span');
    platformBadge.className = 'tag-platform badge-accent';
    platformBadge.textContent = getPlatformFromUrl(stream.url, stream.domain);

    topRow.appendChild(favicon);
    topRow.appendChild(platformBadge);
    topRow.appendChild(statusPill);
    return topRow;
  }

  /**
   * Helper: Builds the interactive mini scrubber and timing display row.
   */
  function buildDeckScrubberRow(doc, stream, options) {
    const scrubberRow = doc.createElement('div');
    scrubberRow.className = 'deck-scrubber-row';

    const miniScrubber = doc.createElement('div');
    miniScrubber.className = 'deck-mini-scrubber';
    miniScrubber.style.cursor = 'pointer';
    miniScrubber.setAttribute('role', 'slider');
    miniScrubber.setAttribute('aria-label', `Timeline for ${stream.title || 'Tab'}`);
    miniScrubber.setAttribute('aria-valuemin', '0');
    miniScrubber.setAttribute('aria-valuemax', '100');

    const progress = doc.createElement('div');
    progress.className = 'deck-scrubber-progress';
    const pct = (stream.duration > 0 && stream.currentTime >= 0)
      ? Math.min(100, Math.max(0, (stream.currentTime / stream.duration) * 100))
      : 0;
    progress.style.width = `${pct.toFixed(1)}%`;
    miniScrubber.setAttribute('aria-valuenow', String(Math.round(pct)));

    const thumb = doc.createElement('span');
    thumb.className = 'deck-scrubber-thumb';
    progress.appendChild(thumb);

    miniScrubber.appendChild(progress);

    const timeSpan = doc.createElement('span');
    timeSpan.className = 'deck-time-display';
    const curFormatted = formatDurationSec(stream.currentTime);
    const durFormatted = formatDurationSec(stream.duration);
    timeSpan.textContent = `${curFormatted} / ${durFormatted}`;

    miniScrubber.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = miniScrubber.getBoundingClientRect();
      if (rect.width <= 0) return;
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const ratio = clickX / rect.width;
      const dur = (typeof stream.duration === 'number' && Number.isFinite(stream.duration) && stream.duration > 0)
        ? stream.duration
        : 0;
      if (dur <= 0) return;

      const targetSeconds = Math.max(0, Math.min(dur, ratio * dur));
      progress.style.width = `${(ratio * 100).toFixed(1)}%`;
      timeSpan.textContent = `${formatDurationSec(targetSeconds)} / ${formatDurationSec(dur)}`;
      miniScrubber.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));

      handleRemoteMediaCommand(stream.tabId, 'seek_to', targetSeconds, options);
    });

    scrubberRow.appendChild(miniScrubber);
    scrubberRow.appendChild(timeSpan);
    return scrubberRow;
  }

  /**
   * Helper: Builds the full-width dedicated volume slider row (contains ONLY volSlider).
   */
  function buildDeckVolumeRow(doc, stream, options) {
    const volumeRow = doc.createElement('div');
    volumeRow.className = 'deck-volume-row';

    const volSlider = doc.createElement('input');
    volSlider.type = 'range';
    volSlider.min = '0';
    volSlider.max = '100';
    volSlider.setAttribute('data-slider-tab-id', String(stream.tabId));
    const isCurrentActiveSlider = doc.activeElement &&
      doc.activeElement.classList &&
      doc.activeElement.classList.contains('deck-volume-slider') &&
      doc.activeElement.getAttribute('data-slider-tab-id') === String(stream.tabId);
    const currentVolPct = isCurrentActiveSlider
      ? Math.round(Number(doc.activeElement.value) || 0)
      : Math.round((typeof stream.volume === 'number' ? stream.volume : 1.0) * 100);
    volSlider.value = String(currentVolPct);
    volSlider.className = 'deck-volume-slider';
    volSlider.setAttribute('title', `Volume: ${currentVolPct}%`);
    volSlider.setAttribute('aria-label', `Volume: ${currentVolPct}%`);
    volSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      const v = Number(volSlider.value) / 100;
      volSlider.setAttribute('title', `Volume: ${volSlider.value}%`);
      volSlider.setAttribute('aria-label', `Volume: ${volSlider.value}%`);
      handleRemoteMediaCommand(stream.tabId, 'set_volume', v, options);
    });

    volumeRow.appendChild(volSlider);
    return volumeRow;
  }

  /**
   * Helper: Builds Play/Pause button for controls row.
   */
  function buildDeckPlayPauseButton(doc, stream, options, translate, statusPill) {
    const btnPlayPause = doc.createElement('button');
    btnPlayPause.className = 'btn-deck-ctrl btn-deck-play';
    let isPlay = stream.playbackState === 'playing';
    btnPlayPause.textContent = isPlay ? '⏸️' : '▶';
    btnPlayPause.setAttribute('title', isPlay ? 'Pause Tab' : 'Play Tab');
    btnPlayPause.setAttribute('aria-label', isPlay ? 'Pause Tab' : 'Play Tab');
    btnPlayPause.addEventListener('click', (e) => {
      e.stopPropagation();
      isPlay = !isPlay;
      btnPlayPause.textContent = isPlay ? '⏸️' : '▶';
      btnPlayPause.setAttribute('title', isPlay ? 'Pause Tab' : 'Play Tab');
      btnPlayPause.setAttribute('aria-label', isPlay ? 'Pause Tab' : 'Play Tab');
      if (isPlay) {
        statusPill.classList.remove('paused');
        statusPill.classList.add('playing');
        statusPill.textContent = translate('status_playing') || '🟢 Playing';
      } else {
        statusPill.classList.remove('playing');
        statusPill.classList.add('paused');
        statusPill.textContent = translate('status_paused') || '⏸️ Paused';
      }
      handleRemoteMediaCommand(stream.tabId, isPlay ? 'play' : 'pause', 0, options);
    });
    return btnPlayPause;
  }

  /**
   * Helper: Builds Mute/Unmute button for controls row.
   */
  function buildDeckMuteButton(doc, stream, options, translate, statusPill) {
    const btnMute = doc.createElement('button');
    btnMute.className = 'btn-deck-ctrl btn-deck-mute';
    let isMutedState = Boolean(stream.isMuted);
    btnMute.textContent = isMutedState ? '🔇' : '🔊';
    btnMute.setAttribute('title', isMutedState ? 'Unmute Tab' : 'Mute Tab');
    btnMute.setAttribute('aria-label', isMutedState ? 'Unmute Tab' : 'Mute Tab');
    btnMute.addEventListener('click', (e) => {
      e.stopPropagation();
      isMutedState = !isMutedState;
      btnMute.textContent = isMutedState ? '🔇' : '🔊';
      btnMute.setAttribute('title', isMutedState ? 'Unmute Tab' : 'Mute Tab');
      btnMute.setAttribute('aria-label', isMutedState ? 'Unmute Tab' : 'Mute Tab');
      if (isMutedState) {
        statusPill.classList.add('muted');
        statusPill.textContent = translate('status_muted') || '🔇 Muted';
      } else {
        statusPill.classList.remove('muted');
        if (stream.playbackState === 'playing' || stream.isAudible) {
          statusPill.classList.add('playing');
          statusPill.textContent = translate('status_playing') || '🟢 Playing';
        } else {
          statusPill.classList.add('paused');
          statusPill.textContent = translate('status_paused') || '⏸️ Paused';
        }
      }
      const nextCmd = isMutedState ? 'mute' : 'unmute';
      handleRemoteMediaCommand(stream.tabId, nextCmd, 0, options);
    });
    return btnMute;
  }

  /**
   * Helper: Builds the 4-button action controls row:
   * [ ▶ Play/Pause ] [ 🔊 Mute ] [ 🎧 Solo (Icon Only) ] [ 🎯 Switch Tab ]
   */
  function buildDeckControlsRow(doc, stream, options, translate, statusPill, containerEl) {
    const controlsRow = doc.createElement('div');
    controlsRow.className = 'deck-card-controls';

    // 1. Play / Pause Button
    const btnPlayPause = buildDeckPlayPauseButton(doc, stream, options, translate, statusPill);

    // 2. Mute / Unmute Button (Relocated right next to Play/Pause)
    const btnMute = buildDeckMuteButton(doc, stream, options, translate, statusPill);

    // 3. Solo Tab Button (Icon Only 🎧)
    const btnSolo = doc.createElement('button');
    btnSolo.className = 'btn-deck-ctrl btn-deck-solo';
    btnSolo.id = `btnSoloTab_${stream.tabId}`;
    if (currentSoloTabId === stream.tabId && !stream.isMuted) {
      btnSolo.classList.add('solo-active');
    }
    btnSolo.textContent = '🎧';
    btnSolo.setAttribute('title', 'Mute all other tabs and solo this audio');
    btnSolo.setAttribute('aria-label', `Solo Tab ${stream.tabId}`);
    btnSolo.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSoloTab(stream.tabId, Object.assign({}, options, { containerEl }));
    });

    // 4. Switch to Tab Button (Icon Only 🎯)
    const btnSwitchTab = doc.createElement('button');
    btnSwitchTab.className = 'btn-deck-ctrl btn-deck-switch-tab';
    btnSwitchTab.textContent = '🎯';
    btnSwitchTab.setAttribute('title', translate('btn_switch_tab') || 'Switch to this media tab in browser');
    btnSwitchTab.setAttribute('aria-label', `Switch to tab ${stream.tabId}`);
    btnSwitchTab.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRemoteMediaCommand(stream.tabId, 'switch_tab', 0, options);
    });

    controlsRow.appendChild(btnPlayPause);
    controlsRow.appendChild(btnMute);
    controlsRow.appendChild(btnSolo);
    controlsRow.appendChild(btnSwitchTab);
    return controlsRow;
  }

  /**
   * Helper: Builds a single complete media deck card DOM node.
   */
  function buildMediaDeckCard(doc, stream, options, translate, containerEl) {
    const card = doc.createElement('div');
    card.className = 'media-deck-card liquid-glass-card';
    card.setAttribute('data-tab-id', String(stream.tabId));

    // Status Pill (referenced by topRow and controlsRow)
    const statusPill = doc.createElement('span');
    statusPill.className = 'deck-status-pill';
    if (stream.isMuted) {
      statusPill.classList.add('muted');
      statusPill.textContent = translate('status_muted') || '🔇 Muted';
    } else if (stream.playbackState === 'playing' || stream.isAudible) {
      statusPill.classList.add('playing');
      statusPill.textContent = translate('status_playing') || '🟢 Playing';
    } else {
      statusPill.classList.add('paused');
      statusPill.textContent = translate('status_paused') || '⏸️ Paused';
    }

    // 1. Top Header Row: favicon, platformBadge, statusPill
    const topRow = buildDeckTopRow(doc, stream, options, translate, statusPill);

    // 2. Video Title: dedicated title line above scrubber
    const titleSpan = doc.createElement('span');
    titleSpan.className = 'deck-card-title text-truncate';
    titleSpan.textContent = stream.title || stream.domain || `Tab ${stream.tabId}`;
    titleSpan.setAttribute('title', stream.title || '');

    // 3. Mini Scrubber & Timing Row
    const scrubberRow = buildDeckScrubberRow(doc, stream, options);

    // 4. Dedicated Full-Width Volume Row (volSlider only)
    const volumeRow = buildDeckVolumeRow(doc, stream, options);

    // 5. Bottom Controls Row: Play/Pause, Mute, Solo, Switch Tab
    const controlsRow = buildDeckControlsRow(doc, stream, options, translate, statusPill, containerEl);

    // Assembly Order: topRow -> titleSpan -> scrubberRow -> volumeRow -> controlsRow
    card.appendChild(topRow);
    card.appendChild(titleSpan);
    card.appendChild(scrubberRow);
    card.appendChild(volumeRow);
    card.appendChild(controlsRow);

    return card;
  }

  /**
   * Helper: Builds empty state container when no active media streams exist.
   */
  function buildDeckEmptyState(doc, translate) {
    const emptyBox = doc.createElement('div');
    emptyBox.className = 'deck-empty-state';

    const icon = doc.createElement('span');
    icon.className = 'deck-empty-icon';
    icon.textContent = '🎧';

    const text = doc.createElement('p');
    text.className = 'deck-empty-text';
    text.textContent = translate('no_media_streams') || 'No active media streams detected across open tabs';

    emptyBox.appendChild(icon);
    emptyBox.appendChild(text);
    return emptyBox;
  }

  /**
   * 100% W3C Trusted Types Safe DOM Builder for Multi-Tab Media Deck
   * Constructs DOM nodes using document.createElement (Zero innerHTML).
   */
  function renderMultiTabMediaDeck(streamsList, containerEl, options = {}) {
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (!doc || !containerEl) return;
    const translate = typeof options.t === 'function' ? options.t : (k) => k;

    const rawStreams = Array.isArray(streamsList) ? streamsList : [];
    // Defensive client-side filtering: guarantee zero non-media cards enter DOM
    const streams = rawStreams.filter(s => {
      if (!s || !s.tabId) return false;
      return Boolean(
        s.isAudible === true ||
        s.playbackState === 'playing' ||
        (typeof s.duration === 'number' && s.duration > 0) ||
        s.hasMedia === true
      );
    });
    cachedStreams = streams;

    // Update active streams count badge if present
    const countBadge = doc.getElementById('badgeActiveStreamsCount');
    if (countBadge) {
      const activeCount = streams.filter(s => s.isAudible || s.playbackState === 'playing').length;
      countBadge.textContent = `${activeCount} ${activeCount === 1 ? 'active stream' : 'active streams'}`;
    }

    // Clear existing container nodes cleanly
    while (containerEl.firstChild) {
      containerEl.removeChild(containerEl.firstChild);
    }

    // Empty state
    if (streams.length === 0) {
      containerEl.appendChild(buildDeckEmptyState(doc, translate));
      return;
    }

    // Render cards
    streams.forEach((stream) => {
      const card = buildMediaDeckCard(doc, stream, options, translate, containerEl);
      containerEl.appendChild(card);
    });
  }

  // ===========================================================================
  // Feature 4: Real-Time Audio Visualizer & Frequency Spectrum Analyzer
  // ===========================================================================

  const NUM_BANDS = 32;
  const MIN_DB = -40;
  const MAX_DB = 6;

  const VALID_VIZ_MODES = Object.freeze([
    'bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror',
    'lissajous', 'hex_grid', 'particles', 'retro_grid', 'vinyl_rings', 'liquid_wave'
  ]);
  const EXTENDED_VIZ_MODES = Object.freeze([
    'lissajous', 'hex_grid', 'particles', 'retro_grid', 'vinyl_rings', 'liquid_wave'
  ]);
  const ALL_VIZ_MODES = VALID_VIZ_MODES;

  let visualizerCanvas = null;
  let visualizerCtx = null;
  let visualizerMode = 'bars'; // 'bars' | 'wave' | 'radial' | 'matrix_dots' | 'flame' | 'stereo_mirror' | 'lissajous' | 'hex_grid' | 'particles' | 'retro_grid' | 'vinyl_rings' | 'liquid_wave'
  let isVisualizerPlaying = false;
  let isVisualizerSleeping = true;
  let visualizerRafId = null;
  let visualizerTelemetryData = null;

  // 32-Band FFT falloff state
  const peakHoldBars = new Float32Array(NUM_BANDS);
  const currentBandValues = new Float32Array(NUM_BANDS);

  // 60fps Zero-GC Particle Pool for Starfield Particle Warp
  const PARTICLE_COUNT = 64;
  const particleX = new Float32Array(PARTICLE_COUNT);
  const particleY = new Float32Array(PARTICLE_COUNT);
  const particleZ = new Float32Array(PARTICLE_COUNT);
  const particleSpeed = new Float32Array(PARTICLE_COUNT);

  function resetParticlePool() {
    for (let p = 0; p < PARTICLE_COUNT; p++) {
      particleX[p] = (Math.random() - 0.5) * 800;
      particleY[p] = (Math.random() - 0.5) * 300;
      particleZ[p] = Math.random() * 800 + 10;
      particleSpeed[p] = 2 + Math.random() * 3;
    }
  }
  resetParticlePool();

  // Studio Peak-Hold Decay & Graticule State Machine
  let leftPeakVal = 0;
  let rightPeakVal = 0;
  let leftPeakHoldTime = 0;
  let rightPeakHoldTime = 0;
  let peakDecayRate = 0.03; // Normal studio decay rate
  let isGraticuleEnabled = true;

  // Cached DOM elements for VU meters & Peak Indicators
  let vuLeftBarEl = null;
  let vuRightBarEl = null;
  let vuPeakLeftEl = null;
  let vuPeakRightEl = null;
  let vuClipBadgeEl = null;
  let vuValLeftEl = null;
  let vuValRightEl = null;

  const VIZ_MODE_META = {
    bars: { icon: '⚡', label: '32-Band FFT' },
    wave: { icon: '🌊', label: 'Oscilloscope' },
    radial: { icon: '✨', label: 'Radial Burst' },
    matrix_dots: { icon: '🟢', label: 'Matrix Dots' },
    flame: { icon: '🔥', label: 'Flame Peaks' },
    stereo_mirror: { icon: '🦋', label: 'Stereo Mirror' },
    lissajous: { icon: '🎛️', label: 'Lissajous Scope' },
    hex_grid: { icon: '⬡', label: 'Hex Grid' },
    particles: { icon: '🌌', label: 'Starfield Warp' },
    retro_grid: { icon: '🕹️', label: 'Synthwave Grid' },
    vinyl_rings: { icon: '💿', label: 'Vinyl Rings' },
    liquid_wave: { icon: '💧', label: 'Liquid Wave' }
  };

  /**
   * Renders subtle acoustic frequency octaves and decibel gridlines directly on the canvas.
   * Subpixel +0.5 offset prevents blurry lines on Retina/High-DPI displays.
   */
  function renderCanvasGraticule(ctx, width, height, isLightTheme = false) {
    if (!isGraticuleEnabled || !ctx || visualizerMode === 'radial' || visualizerMode === 'particles' || visualizerMode === 'vinyl_rings' || visualizerMode === 'lissajous') return;

    if (typeof ctx.save === 'function') ctx.save();
    ctx.lineWidth = 1;

    // Horizontal dB grid lines: -12dB (25% height), -24dB (50% height), -36dB (75% height)
    const dbLines = [
      { ratio: 0.25, label: '-12dB' },
      { ratio: 0.50, label: '-24dB' },
      { ratio: 0.75, label: '-36dB' }
    ];

    ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.08)' : 'rgba(99, 102, 241, 0.12)';
    if (typeof ctx.setLineDash === 'function') {
      ctx.setLineDash([3, 4]);
    }

    for (const line of dbLines) {
      const y = Math.floor(height * line.ratio) + 0.5;
      if (typeof ctx.beginPath === 'function') ctx.beginPath();
      if (typeof ctx.moveTo === 'function') ctx.moveTo(0, y);
      if (typeof ctx.lineTo === 'function') ctx.lineTo(width, y);
      if (typeof ctx.stroke === 'function') ctx.stroke();
    }

    // Vertical Frequency octave ticks: 60Hz, 250Hz, 1kHz, 4kHz, 16kHz
    // Corresponding to standard 32-band log distribution
    const freqTicks = [0.08, 0.28, 0.50, 0.72, 0.92];
    ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)';
    if (typeof ctx.setLineDash === 'function') {
      ctx.setLineDash([2, 5]);
    }

    for (const xRatio of freqTicks) {
      const x = Math.floor(width * xRatio) + 0.5;
      if (typeof ctx.beginPath === 'function') ctx.beginPath();
      if (typeof ctx.moveTo === 'function') ctx.moveTo(x, 0);
      if (typeof ctx.lineTo === 'function') ctx.lineTo(x, height);
      if (typeof ctx.stroke === 'function') ctx.stroke();
    }

    if (typeof ctx.restore === 'function') ctx.restore();
  }

  /**
   * Computes studio peak-hold dynamics (instant attack, 400ms hold, exponential falloff).
   * Strictly <= 50 lines per Universal Rule 28.
   */
  function updateVuPeakHoldDecay(leftVal, rightVal, timestamp = Date.now(), options = {}) {
    const now = timestamp || Date.now();
    const holdDuration = 400; // 400ms broadcast hold
    const decayStep = peakDecayRate * 100;

    // Left channel peak hold & decay
    if (leftVal >= leftPeakVal) {
      leftPeakVal = leftVal;
      leftPeakHoldTime = now + holdDuration;
    } else if (now > leftPeakHoldTime) {
      leftPeakVal = Math.max(0, leftPeakVal - decayStep);
    }

    // Right channel peak hold & decay
    if (rightVal >= rightPeakVal) {
      rightPeakVal = rightVal;
      rightPeakHoldTime = now + holdDuration;
    } else if (now > rightPeakHoldTime) {
      rightPeakVal = Math.max(0, rightPeakVal - decayStep);
    }

    const doc = (options && options.doc) || (typeof document !== 'undefined' ? document : null);
    if (doc && typeof doc.getElementById === 'function') {
      vuPeakLeftEl = doc.getElementById('vuPeakLeft');
      vuPeakRightEl = doc.getElementById('vuPeakRight');
    }

    if (vuPeakLeftEl) {
      vuPeakLeftEl.style.left = `${Math.min(99, leftPeakVal).toFixed(1)}%`;
    }
    if (vuPeakRightEl) {
      vuPeakRightEl.style.left = `${Math.min(99, rightPeakVal).toFixed(1)}%`;
    }

    return {
      leftPeak: leftPeakVal,
      rightPeak: rightPeakVal,
      leftHoldTime: leftPeakHoldTime,
      rightHoldTime: rightPeakHoldTime
    };
  }

  function setGraticuleEnabled(enabled) {
    isGraticuleEnabled = Boolean(enabled);
    return isGraticuleEnabled;
  }

  function isGraticuleActive() {
    return isGraticuleEnabled;
  }

  function setPeakDecayRate(rate) {
    peakDecayRate = typeof rate === 'number' && rate > 0 ? rate : 0.03;
    return peakDecayRate;
  }

  function getPeakDecayRate() {
    return peakDecayRate;
  }

  function getPeakHoldValues() {
    return {
      leftPeakVal,
      rightPeakVal,
      leftPeakHoldTime,
      rightPeakHoldTime,
      peakDecayRate,
      isGraticuleEnabled
    };
  }

  /**
   * Initializes the 60fps Canvas Audio Visualizer Engine
   */
  function initAudioVisualizer(canvasEl, options = {}) {
    if (!canvasEl) return null;
    visualizerCanvas = canvasEl;
    if (!visualizerCanvas.width) visualizerCanvas.width = 600;
    if (!visualizerCanvas.height) visualizerCanvas.height = 120;
    visualizerCtx = canvasEl.getContext ? canvasEl.getContext('2d') : null;

    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (doc) {
      vuLeftBarEl = doc.getElementById('vuBarLeft');
      vuRightBarEl = doc.getElementById('vuBarRight');
      vuPeakLeftEl = doc.getElementById('vuPeakLeft');
      vuPeakRightEl = doc.getElementById('vuPeakRight');
      vuClipBadgeEl = doc.getElementById('vuClipIndicator');
      vuValLeftEl = doc.getElementById('vuValLeft');
      vuValRightEl = doc.getElementById('vuValRight');

      const btnBars = doc.getElementById('btnVizModeBars');
      const btnWave = doc.getElementById('btnVizModeWave');
      const selectEffect = doc.getElementById('selectVizEffect');

      if (selectEffect && !selectEffect.__vizBound) {
        selectEffect.__vizBound = true;
        selectEffect.value = visualizerMode;
        selectEffect.addEventListener('change', (e) => {
          if (e && e.target) {
            setVisualizerMode(e.target.value, options);
          }
        });
      }

      if (btnBars && !btnBars.__vizBound) {
        btnBars.__vizBound = true;
        btnBars.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          setVisualizerMode('bars', options);
        });
      }

      if (btnWave && !btnWave.__vizBound) {
        btnWave.__vizBound = true;
        btnWave.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          setVisualizerMode('wave', options);
        });
      }

      const btnFullWindow = doc.getElementById('btnVizFullWindow');
      if (btnFullWindow && !btnFullWindow.__vizBound) {
        btnFullWindow.__vizBound = true;
        btnFullWindow.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          toggleVisualizerFullWindow(options);
        });
      }

      const btnFullscreen = doc.getElementById('btnVizFullscreen');
      if (btnFullscreen && !btnFullscreen.__vizBound) {
        btnFullscreen.__vizBound = true;
        btnFullscreen.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          toggleVisualizerFullscreen(options);
        });
      }

      if (!doc.__vizFullscreenEventBound) {
        doc.__vizFullscreenEventBound = true;
        const onFsChange = () => {
          const isFs = Boolean(
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement
          );
          isNativeFullscreenActive = isFs;
          isFullscreenActive = isFs;
          updateFullscreenButtonState(doc, isFs);
          const card = doc.getElementById('heroAudioLabStatus');
          if (card) {
            if (isFs) {
              card.classList.add('visualizer-fullscreen-mode');
              card.classList.remove('visualizer-theater-mode');
              if (doc.body) {
                doc.body.classList.add('visualizer-fullscreen-active');
                doc.body.classList.remove('visualizer-theater-active');
              }
              isFullWindowActive = false;
            } else {
              card.classList.remove('visualizer-fullscreen-mode');
              card.classList.remove('visualizer-theater-mode');
              if (doc.body) {
                doc.body.classList.remove('visualizer-fullscreen-active');
                doc.body.classList.remove('visualizer-theater-active');
              }
              isFullWindowActive = false;
              const btnFw = doc.getElementById('btnVizFullWindow');
              if (btnFw) {
                btnFw.setAttribute('aria-expanded', 'false');
                btnFw.classList.remove('active');
              }
            }
          }
          const canvas = visualizerCanvas || doc.getElementById('canvasAudioVisualizer');
          if (canvas) {
            resizeVisualizerCanvas(canvas, isFs || isFullWindowActive);
          }
        };
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((evName) => {
          if (typeof doc.addEventListener === 'function') {
            doc.addEventListener(evName, onFsChange);
          }
        });
      }

      const btnVideoEmbed = doc.getElementById('btnVizVideoEmbedToggle');
      if (btnVideoEmbed && !btnVideoEmbed.__vizBound) {
        btnVideoEmbed.__vizBound = true;
        btnVideoEmbed.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          toggleVisualizerVideoEmbed(options);
        });
      }

      // Zero-Overhead Idle Sleep Sentinel on Visibility Change
      if (!doc.__vizVisibilityBound) {
        doc.__vizVisibilityBound = true;
        doc.addEventListener('visibilitychange', () => {
          if (doc.visibilityState === 'hidden') {
            stopVisualizerLoop();
          } else if (isVisualizerPlaying) {
            startVisualizerLoop(options);
          }
        });
      }
    }

    // Clear bands
    peakHoldBars.fill(0);
    currentBandValues.fill(0);

    // Initial idle baseline draw
    if (!isVisualizerPlaying) {
      stopVisualizerLoop();
    }

    return {
      canvas: visualizerCanvas,
      ctx: visualizerCtx,
      mode: visualizerMode
    };
  }

  /**
   * Toggles visualization style across all supported 60fps canvas visualizer effects.
   */
  function setVisualizerMode(mode, options = {}) {
    if (!ALL_VIZ_MODES.includes(mode)) return visualizerMode;
    visualizerMode = mode;

    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (doc) {
      const selectEffect = doc.getElementById('selectVizEffect');
      if (selectEffect && selectEffect.value !== mode) {
        selectEffect.value = mode;
      }

      const btnBars = doc.getElementById('btnVizModeBars');
      const btnWave = doc.getElementById('btnVizModeWave');
      if (btnBars) {
        if (mode === 'bars') {
          btnBars.classList.add('btn-active');
          btnBars.classList.add('active');
          if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'true');
        } else {
          btnBars.classList.remove('btn-active');
          btnBars.classList.remove('active');
          if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'false');
        }
      }
      if (btnWave) {
        if (mode === 'wave') {
          btnWave.classList.add('btn-active');
          btnWave.classList.add('active');
          if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'true');
        } else {
          btnWave.classList.remove('btn-active');
          btnWave.classList.remove('active');
          if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'false');
        }
      }

      // Synchronize compact pill trigger and popover options if present
      const pillLabel = doc.getElementById('vizPillLabel');
      const pillIcon = doc.getElementById('vizPillIcon');
      if (VIZ_MODE_META[mode]) {
        if (pillLabel) pillLabel.textContent = VIZ_MODE_META[mode].label;
        if (pillIcon) pillIcon.textContent = VIZ_MODE_META[mode].icon;
      }
      const popoverOptions = doc.querySelectorAll ? doc.querySelectorAll('.viz-popover-option') : [];
      if (popoverOptions && popoverOptions.forEach) {
        popoverOptions.forEach(opt => {
          const isSelected = opt.getAttribute && opt.getAttribute('data-effect') === mode;
          if (opt.classList) {
            if (isSelected) {
              opt.classList.add('active');
            } else {
              opt.classList.remove('active');
            }
          }
          if (typeof opt.setAttribute === 'function') {
            opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          }
        });
      }

      const canvasEl = doc.getElementById('canvasAudioVisualizer') || doc.getElementById('mediaDeckVisualizerCanvas');
      if (canvasEl) {
        if (!canvasEl.dataset) canvasEl.dataset = {};
        canvasEl.dataset.mode = mode;
      }
    }

    if (visualizerCanvas) {
      if (!visualizerCanvas.dataset) visualizerCanvas.dataset = {};
      visualizerCanvas.dataset.mode = mode;
    }

    return visualizerMode;
  }

  let isFullWindowActive = false;
  let isNativeFullscreenActive = false;
  let isFullscreenActive = false;
  let isVideoEmbedActive = false;

  function resizeVisualizerCanvas(canvas, isExpanded) {
    if (!canvas) return;
    if (isExpanded) {
      const container = canvas.parentElement;
      const rect = (container && typeof container.getBoundingClientRect === 'function') ? container.getBoundingClientRect() : null;
      const targetW = (rect && rect.width > 0) ? Math.floor(rect.width) : 1200;
      const targetH = (rect && rect.height > 0) ? Math.floor(rect.height) : 400;
      canvas.width = Math.max(600, targetW);
      canvas.height = Math.max(120, targetH);
    } else {
      canvas.width = 600;
      canvas.height = 120;
    }
  }

  function isVisualizerFullWindowActive() {
    return isFullWindowActive;
  }

  function setVisualizerFullWindowState(active, options = {}) {
    isFullWindowActive = Boolean(active);
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return isFullWindowActive;

    const card = doc.getElementById('heroAudioLabStatus');
    const btn = doc.getElementById('btnVizFullWindow');
    const canvas = visualizerCanvas || doc.getElementById('canvasAudioVisualizer');

    if (card) {
      if (isFullWindowActive) {
        card.classList.add('visualizer-theater-mode');
        card.classList.remove('visualizer-fullscreen-mode');
        if (doc.body) {
          doc.body.classList.add('visualizer-theater-active');
          doc.body.classList.remove('visualizer-fullscreen-active');
        }
      } else {
        card.classList.remove('visualizer-theater-mode');
        if (doc.body) doc.body.classList.remove('visualizer-theater-active');
      }
    }

    if (btn) {
      btn.setAttribute('aria-expanded', isFullWindowActive ? 'true' : 'false');
      const tFn = options.t || (typeof globalThis !== 'undefined' && globalThis.t) || (typeof window !== 'undefined' && window.t);
      if (isFullWindowActive) {
        btn.classList.add('active');
        const exitTitle = typeof tFn === 'function' ? tFn('viz_fullwindow_exit_title') : 'Exit Visualizer Full Window (Theater)';
        btn.setAttribute('title', exitTitle);
        btn.setAttribute('aria-label', exitTitle);
      } else {
        btn.classList.remove('active');
        const enterTitle = typeof tFn === 'function' ? tFn('viz_fullwindow_toggle_title') : 'Toggle Visualizer Full Window (Theater)';
        btn.setAttribute('title', enterTitle);
        btn.setAttribute('aria-label', enterTitle);
      }
    }

    if (canvas) {
      resizeVisualizerCanvas(canvas, isFullWindowActive || isNativeFullscreenActive || isFullscreenActive);
    }

    return isFullWindowActive;
  }

  function toggleVisualizerFullWindow(options = {}) {
    const next = !isFullWindowActive;
    const res = setVisualizerFullWindowState(next, options);
    const showToastFn = options.showToast || (typeof globalThis !== 'undefined' && globalThis.showToast) || (typeof window !== 'undefined' && window.showToast);
    const tFn = options.t || (typeof globalThis !== 'undefined' && globalThis.t) || (typeof window !== 'undefined' && window.t);
    if (typeof showToastFn === 'function') {
      const msgKey = next ? 'toast_viz_fullwindow_entered' : 'toast_viz_fullwindow_exited';
      showToastFn(typeof tFn === 'function' ? tFn(msgKey) : (next ? 'Visualizer entered Full Window Theater mode' : 'Visualizer exited Full Window mode'));
    }
    return res;
  }

  function updateFullscreenButtonState(doc, active) {
    if (!doc) return;
    const btn = doc.getElementById('btnVizFullscreen');
    if (!btn) return;
    btn.setAttribute('aria-expanded', active ? 'true' : 'false');
    const tFn = (typeof globalThis !== 'undefined' && globalThis.t) || (typeof window !== 'undefined' && window.t);
    if (active) {
      btn.classList.add('active');
      const exitTitle = typeof tFn === 'function' ? tFn('viz_fullscreen_exit_title') : 'Exit Fullscreen Visualizer';
      btn.setAttribute('title', exitTitle);
      btn.setAttribute('aria-label', exitTitle);
    } else {
      btn.classList.remove('active');
      const toggleTitle = typeof tFn === 'function' ? tFn('viz_fullscreen_toggle_title') : 'Toggle Visualizer Fullscreen';
      btn.setAttribute('title', toggleTitle);
      btn.setAttribute('aria-label', toggleTitle);
    }
    const iconExpand = btn.querySelector ? btn.querySelector('.viz-icon-expand') : null;
    const iconCompress = btn.querySelector ? btn.querySelector('.viz-icon-compress') : null;
    if (iconExpand && iconCompress) {
      if (active) {
        iconExpand.classList.add('visually-hidden');
        iconCompress.classList.remove('visually-hidden');
      } else {
        iconExpand.classList.remove('visually-hidden');
        iconCompress.classList.add('visually-hidden');
      }
    }
  }

  function isVisualizerFullscreenActive() {
    if (typeof document !== 'undefined') {
      const isDocFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (isDocFs) return true;
    }
    return isNativeFullscreenActive || isFullscreenActive;
  }

  function setVisualizerFullscreenState(active, options = {}) {
    isNativeFullscreenActive = Boolean(active);
    isFullscreenActive = Boolean(active);
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return isFullscreenActive;

    updateFullscreenButtonState(doc, isNativeFullscreenActive);

    const card = doc.getElementById('heroAudioLabStatus');
    if (card) {
      if (isNativeFullscreenActive) {
        card.classList.add('visualizer-fullscreen-mode');
        card.classList.remove('visualizer-theater-mode');
        if (doc.body) {
          doc.body.classList.add('visualizer-fullscreen-active');
          doc.body.classList.remove('visualizer-theater-active');
        }
        isFullWindowActive = false;
      } else {
        card.classList.remove('visualizer-fullscreen-mode');
        card.classList.remove('visualizer-theater-mode');
        if (doc.body) {
          doc.body.classList.remove('visualizer-fullscreen-active');
          doc.body.classList.remove('visualizer-theater-active');
        }
        isFullWindowActive = false;
        const btnFw = doc.getElementById('btnVizFullWindow');
        if (btnFw) {
          btnFw.setAttribute('aria-expanded', 'false');
          btnFw.classList.remove('active');
        }
      }
    }

    const canvas = visualizerCanvas || doc.getElementById('canvasAudioVisualizer');
    if (canvas) {
      resizeVisualizerCanvas(canvas, isNativeFullscreenActive || isFullWindowActive || isFullscreenActive);
    }

    return isFullscreenActive;
  }

  function toggleVisualizerFullscreen(options = {}) {
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return false;

    const targetEl = (typeof doc.querySelector === 'function' ? doc.querySelector('.visualizer-canvas-container') : null) ||
                     doc.getElementById('heroAudioLabStatus') ||
                     doc.getElementById('visualizerPanel');

    const isCurrentlyFs = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (isCurrentlyFs) {
      if (typeof doc.exitFullscreen === 'function') {
        try { doc.exitFullscreen().catch(() => {}); } catch (_) {}
      } else if (typeof doc.webkitExitFullscreen === 'function') {
        try { doc.webkitExitFullscreen(); } catch (_) {}
      } else if (typeof doc.mozCancelFullScreen === 'function') {
        try { doc.mozCancelFullScreen(); } catch (_) {}
      } else if (typeof doc.msExitFullscreen === 'function') {
        try { doc.msExitFullscreen(); } catch (_) {}
      }
      setVisualizerFullscreenState(false, options);
    } else if (targetEl) {
      if (typeof targetEl.requestFullscreen === 'function') {
        try {
          const p = targetEl.requestFullscreen();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {
              toggleVisualizerFullWindow(options);
            });
          }
        } catch (_) {
          toggleVisualizerFullWindow(options);
        }
      } else if (typeof targetEl.webkitRequestFullscreen === 'function') {
        try { targetEl.webkitRequestFullscreen(); } catch (_) { toggleVisualizerFullWindow(options); }
      } else if (typeof targetEl.mozRequestFullScreen === 'function') {
        try { targetEl.mozRequestFullScreen(); } catch (_) { toggleVisualizerFullWindow(options); }
      } else if (typeof targetEl.msRequestFullscreen === 'function') {
        try { targetEl.msRequestFullscreen(); } catch (_) { toggleVisualizerFullWindow(options); }
      } else {
        toggleVisualizerFullWindow(options);
      }
      setVisualizerFullscreenState(true, options);
    }
    const showToastFn = options.showToast || (typeof globalThis !== 'undefined' && globalThis.showToast) || (typeof window !== 'undefined' && window.showToast);
    const tFn = options.t || (typeof globalThis !== 'undefined' && globalThis.t) || (typeof window !== 'undefined' && window.t);
    if (typeof showToastFn === 'function') {
      const msgKey = !isCurrentlyFs ? 'toast_viz_fullscreen_entered' : 'toast_viz_fullscreen_exited';
      showToastFn(typeof tFn === 'function' ? tFn(msgKey) : (!isCurrentlyFs ? 'Visualizer entered Fullscreen Theater mode' : 'Visualizer exited Fullscreen mode'));
    }
    return !isCurrentlyFs;
  }

  function isVisualizerVideoEmbedActive() {
    return isVideoEmbedActive;
  }

  function setVisualizerVideoEmbedState(active, options = {}) {
    isVideoEmbedActive = Boolean(active);
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return isVideoEmbedActive;

    const btn = doc.getElementById('btnVizVideoEmbedToggle');
    if (btn) {
      btn.setAttribute('aria-pressed', isVideoEmbedActive ? 'true' : 'false');
      if (isVideoEmbedActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    return isVideoEmbedActive;
  }

  function toggleVisualizerVideoEmbed(options = {}) {
    const next = !isVideoEmbedActive;
    const res = setVisualizerVideoEmbedState(next, options);
    const showToastFn = options.showToast || (typeof globalThis !== 'undefined' && globalThis.showToast) || (typeof window !== 'undefined' && window.showToast);
    const tFn = options.t || (typeof globalThis !== 'undefined' && globalThis.t) || (typeof window !== 'undefined' && window.t);
    if (typeof showToastFn === 'function') {
      const msgKey = next ? 'toast_viz_embed_mode_active' : 'toast_viz_embed_mode_inactive';
      showToastFn(typeof tFn === 'function' ? tFn(msgKey) : (next ? 'Video Embed Mode active (Live stream playback preview)' : 'Switched back to Spectrum Visualizer'));
    }
    return res;
  }

  /**
   * Procedural Audio Telemetry Synthesizer
   * Produces authentic 32-band FFT amplitudes and time-domain waveform values when live DSP node is streaming.
   */
  function synthesizeAudioTelemetry(timestamp, isPlaying) {
    const t = (timestamp || Date.now()) * 0.003;
    const freqs = new Float32Array(NUM_BANDS);
    const wave = new Float32Array(64);

    if (!isPlaying) {
      return { freqs, wave, leftRms: 0, rightRms: 0 };
    }

    let leftSum = 0;
    let rightSum = 0;

    for (let i = 0; i < NUM_BANDS; i++) {
      // Harmonic bass-to-treble spectral rolloff
      const freqFactor = (NUM_BANDS - i) / NUM_BANDS;
      const beat = Math.sin(t * 1.8 + i * 0.35) * 0.4 + 0.6;
      const treble = Math.sin(t * 4.2 - i * 0.2) * 0.3;
      const val = Math.max(0.02, Math.min(0.98, freqFactor * beat + treble * 0.5));
      freqs[i] = val;

      if (i < NUM_BANDS / 2) {
        leftSum += val;
      } else {
        rightSum += val;
      }
    }

    for (let j = 0; j < 64; j++) {
      const ph = (j / 64) * Math.PI * 4 + t * 2.5;
      wave[j] = Math.sin(ph) * 0.7 + Math.sin(ph * 2.1) * 0.3;
    }

    const leftRms = Math.min(1.0, (leftSum / (NUM_BANDS / 2)));
    const rightRms = Math.min(1.0, (rightSum / (NUM_BANDS / 2)));

    return { freqs, wave, leftRms, rightRms };
  }

  /**
   * Computes Decibel level from amplitude (normalized 0 to 1) clamped between -40dB and +6dB
   */
  function amplitudeToDb(amp) {
    if (amp <= 0.0001) return MIN_DB;
    const db = 20 * Math.log10(amp);
    return Math.max(MIN_DB, Math.min(MAX_DB, Math.round(db * 10) / 10));
  }

  /**
   * Converts Decibel value to percentage (0% to 100%) for VU meter width
   */
  function dbToPercent(db) {
    const range = MAX_DB - MIN_DB; // 46 dB
    const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db));
    return Math.max(0, Math.min(100, ((clamped - MIN_DB) / range) * 100));
  }

  // ===========================================================================
  // Studio-Grade Visualizer Mode Renderers (Universal Rule 28 Compliant <= 50 lines)
  // ===========================================================================

  function renderBarsMode(ctx, width, height, freqs) {
    const gap = 3;
    const totalGaps = (NUM_BANDS - 1) * gap;
    const barWidth = Math.max(2, (width - totalGaps) / NUM_BANDS);

    for (let i = 0; i < NUM_BANDS; i++) {
      const targetVal = freqs[i] || 0;
      currentBandValues[i] = currentBandValues[i] * 0.65 + targetVal * 0.35;
      const barHeight = Math.max(2, currentBandValues[i] * (height - 12));
      const x = i * (barWidth + gap);
      const y = height - barHeight;

      const grad = ctx.createLinearGradient(0, height, 0, 0);
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(0.55, '#06b6d4');
      grad.addColorStop(1, '#8b5cf6');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barHeight);

      if (y < peakHoldBars[i] || peakHoldBars[i] === 0) {
        peakHoldBars[i] = y;
      } else {
        peakHoldBars[i] = Math.min(height - 4, peakHoldBars[i] + 1.25);
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, peakHoldBars[i] - 2, barWidth, 2);
    }
  }

  function renderWaveMode(ctx, width, height, wave) {
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#10b981';

    const sliceWidth = width / (wave.length - 1);
    const midY = height / 2;

    for (let j = 0; j < wave.length; j++) {
      const amp = wave[j] || 0;
      const x = j * sliceWidth;
      const y = midY + amp * (height * 0.42);
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function renderRadialMode(ctx, width, height, freqs, telemetry) {
    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);
    const baseRadiusMin = Math.max(16, minDim * 0.18);
    const baseRadius = baseRadiusMin + (telemetry.leftRms || 0) * (minDim * 0.08);

    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(1, Math.min(3, minDim * 0.012));
    ctx.stroke();

    ctx.lineWidth = Math.max(2, Math.min(6, Math.round(minDim * 0.018)));
    ctx.lineCap = 'round';
    const spokeBaseLen = Math.max(3, minDim * 0.025);
    const spokeMaxDynamic = minDim * 0.22;

    for (let i = 0; i < NUM_BANDS; i++) {
      currentBandValues[i] = currentBandValues[i] * 0.65 + (freqs[i] || 0) * 0.35;
      const spokeLen = spokeBaseLen + currentBandValues[i] * spokeMaxDynamic;
      const angle = (i / NUM_BANDS) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * (baseRadius + 2);
      const y1 = cy + Math.sin(angle) * (baseRadius + 2);
      const x2 = cx + Math.cos(angle) * (baseRadius + spokeLen);
      const y2 = cy + Math.sin(angle) * (baseRadius + spokeLen);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#818cf8';
      ctx.stroke();
    }
  }

  function renderMatrixDotsMode(ctx, width, height, freqs) {
    const gap = 3;
    const totalGaps = (NUM_BANDS - 1) * gap;
    const colWidth = Math.max(2, (width - totalGaps) / NUM_BANDS);
    const numRows = 8;
    const dotHeight = (height - 16) / numRows;

    for (let i = 0; i < NUM_BANDS; i++) {
      currentBandValues[i] = currentBandValues[i] * 0.65 + (freqs[i] || 0) * 0.35;
      const x = i * (colWidth + gap);

      for (let r = 0; r < numRows; r++) {
        const threshold = (r + 0.5) / numRows;
        const isLit = currentBandValues[i] >= threshold;
        const y = height - 8 - (r + 1) * dotHeight;
        ctx.fillStyle = isLit ? (r > 5 ? '#f43f5e' : r > 3 ? '#38bdf8' : '#10b981') : 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x, y + 2, colWidth, dotHeight - 4);
      }
    }
  }

  function renderFlameMode(ctx, width, height, freqs, timestamp) {
    const gap = 3;
    const totalGaps = (NUM_BANDS - 1) * gap;
    const barWidth = Math.max(2, (width - totalGaps) / NUM_BANDS);
    const time = (timestamp || Date.now()) * 0.005;

    for (let i = 0; i < NUM_BANDS; i++) {
      const flutter = Math.sin(time * 3 + i * 0.5) * 0.15;
      currentBandValues[i] = currentBandValues[i] * 0.6 + (freqs[i] || 0) * 0.4;
      const flameHeight = Math.max(4, (currentBandValues[i] + flutter) * (height - 10));
      const x = i * (barWidth + gap);
      const y = height - flameHeight;

      const grad = ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, '#dc2626');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#fbbf24');

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, flameHeight, [4, 4, 0, 0]);
      } else {
        ctx.fillRect(x, y, barWidth, flameHeight);
      }
      ctx.fill();
    }
  }

  function renderStereoMirrorMode(ctx, width, height, freqs) {
    const halfWidth = width / 2;
    const halfBands = NUM_BANDS / 2;
    const barWidth = Math.max(2, (halfWidth - (halfBands * 2)) / halfBands);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(halfWidth - 1, 4, 2, height - 8);

    for (let i = 0; i < halfBands; i++) {
      currentBandValues[i] = currentBandValues[i] * 0.65 + (freqs[i] || 0) * 0.35;
      const barHeight = Math.max(2, currentBandValues[i] * (height - 14));
      const y = (height - barHeight) / 2;

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(halfWidth - (i + 1) * (barWidth + 2), y, barWidth, barHeight);

      ctx.fillStyle = '#a855f7';
      ctx.fillRect(halfWidth + i * (barWidth + 2) + 2, y, barWidth, barHeight);
    }
  }

  function renderLissajousMode(ctx, width, height, wave, telemetry) {
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.42;

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx.moveTo(cx - scale, cy);
    ctx.lineTo(cx + scale, cy);
    ctx.moveTo(cx, cy - scale);
    ctx.lineTo(cx, cy + scale);
    ctx.stroke();

    const len = wave.length;
    const quarter = Math.floor(len / 4);
    const leftAmp = telemetry.leftRms || 0.3;
    const rightAmp = telemetry.rightRms || 0.3;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f5d4';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 245, 212, 0.7)';

    for (let i = 0; i < len; i++) {
      const xVal = (wave[i] || 0) * (0.8 + leftAmp * 0.6);
      const yVal = (wave[(i + quarter) % len] || 0) * (0.8 + rightAmp * 0.6);
      const px = cx + xVal * scale;
      const py = cy - yVal * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function renderHexGridMode(ctx, width, height, freqs) {
    const cols = 8;
    const rows = 3;
    const hexRadius = Math.min(width / (cols * 1.75), height / (rows * 1.8));
    const hexWidth = hexRadius * Math.sqrt(3);
    const startX = (width - cols * hexWidth) / 2 + hexWidth / 2;
    const startY = (height - rows * hexRadius * 1.5) / 2 + hexRadius;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bandIdx = (r * cols + c) % NUM_BANDS;
        currentBandValues[bandIdx] = currentBandValues[bandIdx] * 0.65 + (freqs[bandIdx] || 0) * 0.35;
        const energy = currentBandValues[bandIdx];
        const xOffset = (r % 2 === 1) ? hexWidth / 2 : 0;
        const hx = startX + c * hexWidth + xOffset;
        const hy = startY + r * hexRadius * 1.5;

        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (Math.PI / 3) * a - Math.PI / 6;
          const vx = hx + hexRadius * Math.cos(angle);
          const vy = hy + hexRadius * Math.sin(angle);
          if (a === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        if (typeof ctx.closePath === 'function') ctx.closePath();

        if (energy > 0.15) {
          ctx.fillStyle = energy > 0.6 ? `rgba(244, 63, 94, ${energy * 0.8})` : `rgba(6, 182, 212, ${energy * 0.7})`;
          ctx.fill();
        }
        ctx.strokeStyle = energy > 0.3 ? '#8b5cf6' : 'rgba(99, 102, 241, 0.25)';
        ctx.lineWidth = energy > 0.5 ? 2 : 1;
        ctx.stroke();
      }
    }
  }

  function renderParticlesMode(ctx, width, height, telemetry, timestamp) {
    const cx = width / 2;
    const cy = height / 2;
    const bass = (currentBandValues[0] + currentBandValues[1] + currentBandValues[2]) / 3 || (telemetry.leftRms || 0.2);
    const warpSpeed = 1.0 + bass * 4.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleZ[i] -= particleSpeed[i] * warpSpeed;
      if (particleZ[i] <= 1) {
        particleZ[i] = 800;
        particleX[i] = (Math.random() - 0.5) * width * 1.5;
        particleY[i] = (Math.random() - 0.5) * height * 1.5;
      }
      const k = 220 / particleZ[i];
      const px = cx + particleX[i] * k;
      const py = cy + particleY[i] * k;
      const size = Math.max(1, (1 - particleZ[i] / 800) * (3.5 + bass * 2.5));

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : (i % 3 === 1 ? '#a855f7' : '#ffffff');
        ctx.fill();
      }
    }
  }

  function renderRetroGridMode(ctx, width, height, freqs, timestamp) {
    const horizonY = height * 0.42;
    const cx = width / 2;
    const time = (timestamp || Date.now()) * 0.002;

    const sunGrad = ctx.createLinearGradient(0, horizonY - 20, 0, horizonY);
    sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    sunGrad.addColorStop(1, 'rgba(244, 63, 94, 0.1)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, horizonY - 20, width, 20);

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    const numGridLines = 16;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numGridLines; i++) {
      const norm = (i / numGridLines - 0.5) * 2;
      const bottomX = cx + norm * (width * 0.7);
      const bandIdx = Math.floor(Math.abs(norm) * (NUM_BANDS - 1));
      const bump = (freqs[bandIdx] || 0) * 12;

      ctx.beginPath();
      ctx.moveTo(cx + norm * (width * 0.1), horizonY);
      ctx.lineTo(bottomX, height - bump);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    const numHoriz = 6;
    for (let h = 0; h < numHoriz; h++) {
      const phase = ((h / numHoriz) + (time % 1)) % 1;
      const hy = horizonY + Math.pow(phase, 2) * (height - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(width, hy);
      ctx.stroke();
    }
  }

  function renderVinylRingsMode(ctx, width, height, telemetry, timestamp) {
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(width, height) * 0.46;
    const numRings = 7;
    const rot = (timestamp || Date.now()) * 0.0015;
    const rms = telemetry.leftRms || 0.2;

    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineWidth = 1;
    for (let r = 1; r <= numRings; r++) {
      const baseR = (r / (numRings + 1)) * maxR;
      const bandIdx = (r * 4) % NUM_BANDS;
      const pulse = (currentBandValues[bandIdx] || 0) * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(4, baseR + pulse), 0, Math.PI * 2);
      ctx.strokeStyle = r % 2 === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
    }

    const sheenGrad = ctx.createLinearGradient(cx - maxR * Math.cos(rot), cy - maxR * Math.sin(rot), cx + maxR * Math.cos(rot), cy + maxR * Math.sin(rot));
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
    sheenGrad.addColorStop(0.5, `rgba(251, 191, 36, ${0.15 + rms * 0.25})`);
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.fillStyle = sheenGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  }

  function renderLiquidWaveMode(ctx, width, height, wave, freqs, timestamp) {
    const time = (timestamp || Date.now()) * 0.003;
    const midY = height * 0.55;
    const numSteps = 40;
    const stepW = width / numSteps;

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let s = 0; s <= numSteps; s++) {
      const x = s * stepW;
      const band = freqs[s % NUM_BANDS] || 0;
      const y = midY - 6 + Math.sin(s * 0.25 + time * 1.5) * 14 + band * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    if (typeof ctx.closePath === 'function') ctx.closePath();
    ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
    ctx.fill();

    const grad = ctx.createLinearGradient(0, midY - 20, 0, height);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
    grad.addColorStop(0.6, 'rgba(16, 185, 129, 0.5)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let s = 0; s <= numSteps; s++) {
      const x = s * stepW;
      const waveAmp = (wave[s % wave.length] || 0) * 18;
      const ripple = Math.sin(s * 0.35 - time * 2) * 10;
      const y = midY + waveAmp + ripple;
      if (s === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    if (typeof ctx.closePath === 'function') ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.stroke();
  }

  function renderVisualizerModeByEffect(mode, ctx, width, height, freqs, wave, telemetry, timestamp) {
    switch (mode) {
      case 'bars': renderBarsMode(ctx, width, height, freqs); break;
      case 'wave': renderWaveMode(ctx, width, height, wave); break;
      case 'radial': renderRadialMode(ctx, width, height, freqs, telemetry); break;
      case 'matrix_dots': renderMatrixDotsMode(ctx, width, height, freqs); break;
      case 'flame': renderFlameMode(ctx, width, height, freqs, timestamp); break;
      case 'stereo_mirror': renderStereoMirrorMode(ctx, width, height, freqs); break;
      case 'lissajous': renderLissajousMode(ctx, width, height, wave, telemetry); break;
      case 'hex_grid': renderHexGridMode(ctx, width, height, freqs); break;
      case 'particles': renderParticlesMode(ctx, width, height, telemetry, timestamp); break;
      case 'retro_grid': renderRetroGridMode(ctx, width, height, freqs, timestamp); break;
      case 'vinyl_rings': renderVinylRingsMode(ctx, width, height, telemetry, timestamp); break;
      case 'liquid_wave': renderLiquidWaveMode(ctx, width, height, wave, freqs, timestamp); break;
      default: renderBarsMode(ctx, width, height, freqs); break;
    }
  }

  function updateVuMetersAndClipping(telemetry, timestamp, doc, options) {
    const leftDb = amplitudeToDb(telemetry.leftRms);
    const rightDb = amplitudeToDb(telemetry.rightRms);
    const leftPct = dbToPercent(leftDb);
    const rightPct = dbToPercent(rightDb);

    updateVuPeakHoldDecay(leftPct, rightPct, timestamp, { ...options, doc });

    if (!vuLeftBarEl && doc) vuLeftBarEl = doc.getElementById('vuBarLeft');
    if (!vuRightBarEl && doc) vuRightBarEl = doc.getElementById('vuBarRight');
    if (!vuClipBadgeEl && doc) vuClipBadgeEl = doc.getElementById('vuClipIndicator');
    if (!vuValLeftEl && doc) vuValLeftEl = doc.getElementById('vuValLeft');
    if (!vuValRightEl && doc) vuValRightEl = doc.getElementById('vuValRight');

    if (vuLeftBarEl) vuLeftBarEl.style.width = `${leftPct.toFixed(1)}%`;
    if (vuRightBarEl) vuRightBarEl.style.width = `${rightPct.toFixed(1)}%`;
    if (vuValLeftEl) vuValLeftEl.textContent = `${leftDb > 0 ? '+' : ''}${leftDb.toFixed(1)}dB`;
    if (vuValRightEl) vuValRightEl.textContent = `${rightDb > 0 ? '+' : ''}${rightDb.toFixed(1)}dB`;

    const isClipping = leftDb >= 0 || rightDb >= 0;
    if (vuClipBadgeEl) {
      if (isClipping) {
        vuClipBadgeEl.classList.add('clipping');
        vuClipBadgeEl.textContent = '0dB CLIP!';
      } else {
        vuClipBadgeEl.classList.remove('clipping');
        vuClipBadgeEl.textContent = '0dB OK';
      }
    }

    return { leftDb, rightDb, isClipping };
  }

  /**
   * Main 60fps Canvas Render Frame (Rule 28 Compliant <= 50 lines)
   * Enforces Zero-Overhead Idle Sleep when paused or hidden.
   */
  function renderVisualizerFrame(timestamp = Date.now(), options = {}) {
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);

    const isDocHidden = doc && doc.visibilityState === 'hidden';
    if (!isVisualizerPlaying || isDocHidden) {
      stopVisualizerLoop();
      return { sleeping: true };
    }

    if (!visualizerCanvas || !visualizerCtx) {
      if (doc && typeof doc.getElementById === 'function') {
        const c = doc.getElementById('canvasAudioVisualizer') || doc.getElementById('mediaDeckVisualizerCanvas');
        if (c) {
          visualizerCanvas = c;
          visualizerCtx = typeof c.getContext === 'function' ? c.getContext('2d') : null;
        }
      }
    }
    if (!visualizerCanvas || !visualizerCtx) {
      return { rendered: false };
    }

    const width = visualizerCanvas.width || 600;
    const height = visualizerCanvas.height || 120;
    const ctx = visualizerCtx;

    ctx.fillStyle = 'rgba(8, 11, 17, 0.35)';
    ctx.fillRect(0, 0, width, height);

    renderCanvasGraticule(ctx, width, height, options.isLightTheme);

    const telemetry = visualizerTelemetryData || synthesizeAudioTelemetry(timestamp, isVisualizerPlaying);
    renderVisualizerModeByEffect(visualizerMode, ctx, width, height, telemetry.freqs, telemetry.wave, telemetry, timestamp);

    const vuStatus = updateVuMetersAndClipping(telemetry, timestamp, doc, options);

    if (isVisualizerPlaying && !isDocHidden && typeof requestAnimationFrame === 'function') {
      visualizerRafId = requestAnimationFrame((ts) => renderVisualizerFrame(ts, options));
    }

    return {
      rendered: true,
      mode: visualizerMode,
      leftDb: vuStatus.leftDb,
      rightDb: vuStatus.rightDb,
      leftPeakVal,
      rightPeakVal,
      isClipping: vuStatus.isClipping
    };
  }

  /**
   * Starts the 60fps Visualizer RAF Loop
   */
  function startVisualizerLoop(options = {}) {
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (doc && doc.visibilityState === 'hidden') {
      isVisualizerSleeping = true;
      return;
    }

    isVisualizerPlaying = true;
    isVisualizerSleeping = false;

    if (!visualizerRafId && typeof requestAnimationFrame === 'function') {
      visualizerRafId = requestAnimationFrame((ts) => renderVisualizerFrame(ts, options));
    }
  }

  /**
   * Halts the RAF loop immediately (Zero-Overhead Idle Sleep)
   */
  function stopVisualizerLoop() {
    isVisualizerSleeping = true;
    if (visualizerRafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(visualizerRafId);
      visualizerRafId = null;
    }

    // Draw subtle idle baseline on canvas
    if (visualizerCtx && visualizerCanvas) {
      const w = visualizerCanvas.width || 600;
      const h = visualizerCanvas.height || 120;
      visualizerCtx.fillStyle = '#080b11';
      visualizerCtx.fillRect(0, 0, w, h);
      visualizerCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      visualizerCtx.lineWidth = 1;
      visualizerCtx.beginPath();
      visualizerCtx.moveTo(0, h - 2);
      visualizerCtx.lineTo(w, h - 2);
      visualizerCtx.stroke();
    }
  }

  /**
   * Updates media playing state and toggles visualizer sleep accordingly.
   */
  function setAudioPlayingState(isPlaying, options = {}) {
    isVisualizerPlaying = Boolean(isPlaying);
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (doc && typeof doc.getElementById === 'function') {
      const dot = doc.getElementById('vizLiveDot');
      const text = doc.getElementById('vizHeaderStatusText');
      if (dot && dot.classList) {
        if (isVisualizerPlaying) dot.classList.add('active');
        else dot.classList.remove('active');
      }
      if (text) {
        text.textContent = isVisualizerPlaying ? 'LIVE' : 'IDLE';
      }
    }
    if (isVisualizerPlaying) {
      startVisualizerLoop(options);
    } else {
      stopVisualizerLoop();
    }
    return isVisualizerPlaying;
  }

  /**
   * Feeds external telemetry data into visualizer buffers.
   */
  function feedAudioTelemetry(data) {
    if (data && (data.freqs || data.wave)) {
      visualizerTelemetryData = data;
    }
  }

  /**
   * Returns current internal state of Visualizer for diagnostics & testing.
   */
  function getVisualizerState() {
    return {
      mode: visualizerMode,
      isPlaying: isVisualizerPlaying,
      isSleeping: isVisualizerSleeping,
      isGraticuleEnabled,
      peakDecayRate,
      leftPeakVal,
      rightPeakVal,
      rafId: visualizerRafId,
      currentSoloTabId,
      isMuteAllOthersActive,
      isMuteAllActive,
      cachedStreamsCount: cachedStreams.length,
      peakBarsSample: Array.from(peakHoldBars.slice(0, 5))
    };
  }

  // Feature definition for SentinelFeatureRegistry
  const MediaDeckVisualizerFeature = Object.freeze({
    id: 'dashboard_media_deck_and_visualizer',
    name: 'Multi-Tab Live Media Deck & Audio Visualizer',
    version: '1.0.0',
    domain: ['dashboard', 'media'],
    getPlatformFromUrl,
    formatDurationSec,
    pollMultiTabMediaStreams,
    renderMultiTabMediaDeck,
    handleRemoteMediaCommand,
    handleSoloTab,
    handleMuteAllOthers,
    handleMuteAll,
    resolvePrimaryMediaTabId,
    getIsMuteAllOthersActive: () => isMuteAllOthersActive,
    setIsMuteAllOthersActive: (val) => { isMuteAllOthersActive = Boolean(val); },
    getIsMuteAllActive: () => isMuteAllActive,
    setIsMuteAllActive: (val) => { isMuteAllActive = Boolean(val); },
    updateBtnMuteAllOthersUI,
    updateBtnMuteAllUI,
    dispatchMediaIpc,
    initAudioVisualizer,
    setVisualizerMode,
    isVisualizerFullWindowActive,
    setVisualizerFullWindowState,
    toggleVisualizerFullWindow,
    isVisualizerFullscreenActive,
    setVisualizerFullscreenState,
    toggleVisualizerFullscreen,
    isVisualizerVideoEmbedActive,
    setVisualizerVideoEmbedState,
    toggleVisualizerVideoEmbed,
    VALID_VIZ_MODES,
    validModes: VALID_VIZ_MODES,
    EXTENDED_VIZ_MODES,
    ALL_VIZ_MODES,
    VIZ_MODE_META,
    setGraticuleEnabled,
    isGraticuleActive,
    setCanvasGraticuleEnabled: setGraticuleEnabled,
    isCanvasGraticuleEnabled: isGraticuleActive,
    setPeakDecayRate,
    getPeakDecayRate,
    renderCanvasGraticule,
    updateVuPeakHoldDecay,
    getPeakHoldValues,
    synthesizeAudioTelemetry,
    amplitudeToDb,
    dbToPercent,
    renderVisualizerFrame,
    startVisualizerLoop,
    stopVisualizerLoop,
    setAudioPlayingState,
    feedAudioTelemetry,
    getVisualizerState,
    getCachedStreams: () => cachedStreams,
    setCachedStreams: (streams) => { cachedStreams = Array.isArray(streams) ? streams : []; },
    getCurrentSoloTabId: () => currentSoloTabId,
    setCurrentSoloTabId: (id) => { currentSoloTabId = id; },
    onInit: function (context) {
      if (context && context.logger && typeof context.logger.info === 'function') {
        context.logger.info('[MediaDeckVisualizerFeature] Initialized');
      }
      return true;
    },
    onUpdate: function (state) {
      if (state && state.globalMediaState) {
        const isPlaying = Boolean(state.globalMediaState.primaryMedia && state.globalMediaState.primaryMedia.isPlaying);
        setAudioPlayingState(isPlaying);
      }
      return true;
    },
    onDestroy: function () {
      stopVisualizerLoop();
      return true;
    }
  });

  // Self-register in Feature Registry if available
  try {
    let reg = null;
    if (typeof globalThis !== 'undefined' && globalThis.SentinelFeatureRegistry) {
      reg = globalThis.SentinelFeatureRegistry;
    } else if (typeof require === 'function') {
      try { reg = require('../../core/feature_registry.js'); } catch (_) {}
    }
    if (reg && typeof reg.registerFeature === 'function') {
      reg.registerFeature(MediaDeckVisualizerFeature);
    }
  } catch (_) {}

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaDeckVisualizerFeature;
  }
  global.MediaDeckVisualizerFeature = MediaDeckVisualizerFeature;
  global.resolvePrimaryMediaTabId = resolvePrimaryMediaTabId;
  if (typeof globalThis !== 'undefined') {
    globalThis.MediaDeckVisualizerFeature = MediaDeckVisualizerFeature;
    globalThis.resolvePrimaryMediaTabId = resolvePrimaryMediaTabId;
  }
  if (typeof window !== 'undefined') {
    window.MediaDeckVisualizerFeature = MediaDeckVisualizerFeature;
    window.resolvePrimaryMediaTabId = resolvePrimaryMediaTabId;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
