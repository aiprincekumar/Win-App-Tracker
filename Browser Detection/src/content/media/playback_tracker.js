/**
 * Web Activity & Media Sentinel - Playback Tracker Subsystem
 * Collects playback state snapshots from HTMLMediaElement and YouTube player APIs.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function extractYouTubeDuration(media) {
    if (typeof document === 'undefined') return 0;
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.getDuration === 'function') {
      try {
        const d = moviePlayer.getDuration();
        if (Number.isFinite(d) && d > 0) return Number(d);
      } catch (_) {}
    }
    if (media && Number.isFinite(media.duration) && media.duration > 0) {
      return Number(media.duration);
    }
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
    const pBar = document.querySelector('.ytp-progress-bar');
    if (pBar && pBar.getAttribute('aria-valuemax')) {
      const maxVal = parseFloat(pBar.getAttribute('aria-valuemax'));
      if (Number.isFinite(maxVal) && maxVal > 0) return maxVal;
    }
    return 0;
  }

  function extractYouTubeCurrentTime(media) {
    if (typeof document === 'undefined') return 0;
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.getCurrentTime === 'function') {
      try {
        const t = moviePlayer.getCurrentTime();
        if (Number.isFinite(t) && t >= 0) return Number(t);
      } catch (_) {}
    }
    if (media && typeof media.currentTime === 'number' && Number.isFinite(media.currentTime) && media.currentTime >= 0) {
      return Number(media.currentTime);
    }
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
    const pBar = document.querySelector('.ytp-progress-bar');
    if (pBar && pBar.getAttribute('aria-valuenow')) {
      const nowVal = parseFloat(pBar.getAttribute('aria-valuenow'));
      if (Number.isFinite(nowVal) && nowVal >= 0) return nowVal;
    }
    return (media && media.currentTime) || 0;
  }

  function captureMediaSnapshot(el, title, resolution) {
    if (!el) return null;
    const isVideo = el.tagName && el.tagName.toLowerCase() === 'video';
    return {
      type: isVideo ? 'video' : 'audio',
      title: title || 'Media',
      paused: el.paused,
      currentTime: extractYouTubeCurrentTime(el),
      duration: extractYouTubeDuration(el) || (el.duration && !isNaN(el.duration) ? el.duration : 0),
      volume: el.volume !== undefined ? el.volume : 1,
      muted: el.muted || false,
      playbackRate: el.playbackRate || 1.0,
      resolution: resolution || (isVideo && el.videoWidth ? ${el.videoWidth}x : null),
      hasVideo: isVideo,
      hasAudio: true,
      timestamp: Date.now()
    };
  }

  const PlaybackTracker = {
    extractYouTubeDuration,
    extractYouTubeCurrentTime,
    captureMediaSnapshot
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaybackTracker;
  }
  global.PlaybackTracker = PlaybackTracker;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
