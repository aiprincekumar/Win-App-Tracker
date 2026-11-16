/**
 * Web Activity & Media Sentinel - YouTube Player Context Accessor
 * Finds active #movie_player element, video tags, and triggers native buttons/APIs.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function getActivePlayerContext() {
    if (typeof document === 'undefined') return { player: null, video: null };
    const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    const video = (player && player.querySelector('video')) || document.querySelector('video');
    return { player, video };
  }

  function clickYouTubeButton(selector) {
    if (typeof document === 'undefined') return false;
    try {
      const btn = document.querySelector(selector);
      if (btn && typeof btn.click === 'function') {
        btn.click();
        return true;
      }
    } catch (_) {}
    return false;
  }

  function dispatchKeyboardEvent(key, code, keyCode) {
    if (typeof document === 'undefined') return false;
    try {
      const target = document.getElementById('movie_player') || document.querySelector('video') || document.body;
      if (!target) return false;
      const evt = new KeyboardEvent('keydown', {
        key,
        code,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(evt);
      return true;
    } catch (_) {}
    return false;
  }

  const YouTubeContext = {
    getActivePlayerContext,
    clickYouTubeButton,
    dispatchKeyboardEvent
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeContext;
  }
  global.YouTubeContext = YouTubeContext;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
