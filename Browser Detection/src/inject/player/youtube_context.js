/**
 * Web Activity & Media Sentinel - YouTube Player Context Accessor
 * Finds active #movie_player element, video tags, and triggers native buttons.
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
    const btn = document.querySelector(selector);
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }

  const YouTubeContext = {
    getActivePlayerContext,
    clickYouTubeButton
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeContext;
  }
  global.YouTubeContext = YouTubeContext;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
