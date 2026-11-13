/**
 * Web Activity & Media Sentinel - HTML5 Player Controller
 * Direct manipulation of standard HTML5 video elements.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function play(video) {
    if (!video) return false;
    video.play().catch(() => {});
    return true;
  }

  function pause(video) {
    if (!video) return false;
    video.pause();
    return true;
  }

  function togglePlayPause(video) {
    if (!video) return false;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    return true;
  }

  function seekRelative(video, seconds) {
    if (!video) return false;
    const dur = video.duration || Infinity;
    video.currentTime = Math.max(0, Math.min(dur, (video.currentTime || 0) + seconds));
    return true;
  }

  function seekPercent(video, percent, positionSeconds) {
    if (!video) return false;
    if (typeof positionSeconds === 'number' && !isNaN(positionSeconds) && positionSeconds >= 0) {
      video.currentTime = Math.max(0, Math.min(video.duration || Infinity, positionSeconds));
      return true;
    }
    const dur = video.duration;
    if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
      video.currentTime = Math.max(0, Math.min(dur, (percent / 100) * dur));
      return true;
    }
    return false;
  }

  function setVolume(video, volume) {
    if (!video) return false;
    video.volume = Math.max(0, Math.min(1.0, volume));
    if (video.volume > 0 && video.muted) {
      video.muted = false;
    }
    return true;
  }

  function setPlaybackRate(video, rate) {
    if (!video) return false;
    video.playbackRate = Math.max(0.25, Math.min(16.0, rate));
    return true;
  }

  const HTML5Controller = {
    play,
    pause,
    togglePlayPause,
    seekRelative,
    seekPercent,
    setVolume,
    setPlaybackRate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTML5Controller;
  }
  global.HTML5Controller = HTML5Controller;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
