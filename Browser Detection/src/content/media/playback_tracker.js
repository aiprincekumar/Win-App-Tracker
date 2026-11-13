/**
 * Web Activity & Media Sentinel - Playback Tracker Subsystem
 * Collects playback state snapshots from HTMLMediaElement.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function captureMediaSnapshot(el, title, resolution) {
    if (!el) return null;
    const isVideo = el.tagName && el.tagName.toLowerCase() === 'video';
    return {
      type: isVideo ? 'video' : 'audio',
      title: title || 'Media',
      paused: el.paused,
      currentTime: el.currentTime || 0,
      duration: el.duration && !isNaN(el.duration) ? el.duration : 0,
      volume: el.volume !== undefined ? el.volume : 1,
      muted: el.muted || false,
      playbackRate: el.playbackRate || 1.0,
      resolution: resolution || (isVideo && el.videoWidth ? `${el.videoWidth}x${el.videoHeight}` : null),
      hasVideo: isVideo,
      hasAudio: true,
      timestamp: Date.now()
    };
  }

  const PlaybackTracker = {
    captureMediaSnapshot
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaybackTracker;
  }
  global.PlaybackTracker = PlaybackTracker;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
