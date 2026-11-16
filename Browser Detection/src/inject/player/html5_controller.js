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
    try {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_) {}
    return true;
  }

  function pause(video) {
    if (!video) return false;
    try {
      video.pause();
    } catch (_) {}
    return true;
  }

  function togglePlayPause(video) {
    if (!video) return false;
    if (video.paused) {
      return play(video);
    } else {
      return pause(video);
    }
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

  function setMuted(video, muted) {
    if (!video) return false;
    video.muted = !!muted;
    return true;
  }

  function toggleMute(video) {
    if (!video) return false;
    video.muted = !video.muted;
    return true;
  }

  function setPlaybackRate(video, rate) {
    if (!video) return false;
    video.playbackRate = Math.max(0.25, Math.min(16.0, rate));
    return true;
  }

  function stepSpeed(video, direction) {
    if (!video) return 1.0;
    const SpeedLadder = (typeof module !== 'undefined' && module.exports)
      ? require('../ladders/speed_ladder.js')
      : (global.SpeedLadder || {});
    const calc = SpeedLadder.calculateNextLadderSpeed || ((cur, dir) => Math.max(0.25, Math.min(2.0, cur + (dir === 'down' ? -0.25 : 0.25))));
    const nextSpeed = calc(video.playbackRate || 1.0, direction);
    video.playbackRate = nextSpeed;
    return nextSpeed;
  }

  const HTML5Controller = {
    play,
    pause,
    togglePlayPause,
    seekRelative,
    seekPercent,
    setVolume,
    setMuted,
    toggleMute,
    setPlaybackRate,
    stepSpeed
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTML5Controller;
  }
  global.HTML5Controller = HTML5Controller;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
