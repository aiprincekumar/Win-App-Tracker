/**
 * Web Activity & Media Sentinel - Web Fullscreen Engine
 * Dedicated engine for CSS viewport fill, target selection, and scroll-lock management.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const CSSEngine = (typeof module !== 'undefined' && module.exports)
    ? require('../content/fullscreen/css_engine.js')
    : (global.CSSEngine || {});

  const STYLE_ID = CSSEngine.STYLE_ID || '__sentinel_fullscreen_controller_styles__';
  const CSS_TEXT = CSSEngine.CSS_TEXT || '';

  let isWebFullscreenActive = false;
  let currentTarget = null;

  function ensureStyles() {
    if (CSSEngine && typeof CSSEngine.ensureStyles === 'function') {
      return CSSEngine.ensureStyles();
    }
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    try {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS_TEXT;
      (document.head || document.documentElement || document.body).appendChild(style);
    } catch (_) {}
  }

  function getTargetElement(preferredTarget) {
    if (typeof document === 'undefined') return null;
    if (preferredTarget && preferredTarget.nodeType === 1) {
      if (preferredTarget === document.body || preferredTarget === document.documentElement) {
        return null;
      }
      return preferredTarget;
    }

    const ytPlayer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    if (ytPlayer && ytPlayer !== document.body && ytPlayer !== document.documentElement) {
      return ytPlayer;
    }

    const videos = Array.from(document.querySelectorAll('video'));
    if (videos.length > 0) {
      const activeVideo = videos.find(v => !v.paused && !v.ended && v.readyState > 2) || videos[0];
      if (activeVideo && activeVideo.parentElement &&
          activeVideo.parentElement !== document.body &&
          activeVideo.parentElement !== document.documentElement &&
          activeVideo.parentElement.clientWidth > 100 &&
          activeVideo.parentElement.clientHeight > 100) {
        return activeVideo.parentElement;
      }
      return activeVideo;
    }
    return null;
  }

  function enterWebFullscreen(targetEl) {
    if (typeof document === 'undefined') return false;
    if (!targetEl || targetEl === document.body || targetEl === document.documentElement) {
      return false;
    }

    ensureStyles();

    try {
      targetEl.classList.add('sentinel-web-fullscreen');
      if (targetEl.id === 'movie_player' || targetEl.classList.contains('html5-video-player')) {
        targetEl.classList.add('ytp-fullscreen');
      }
      if (targetEl.tagName && targetEl.tagName.toLowerCase() === 'video') {
        targetEl.classList.add('sentinel-web-fullscreen');
      }

      const html = document.documentElement;
      const body = document.body;
      if (html) {
        html.classList.add('sentinel-fullscreen-active', 'sentinel-has-web-fullscreen');
      }
      if (body) {
        body.classList.add('sentinel-fullscreen-active', 'sentinel-has-web-fullscreen');
      }

      currentTarget = targetEl;
      isWebFullscreenActive = true;

      try {
        window.dispatchEvent(new Event('resize'));
      } catch (_) {}

      return true;
    } catch (_) {
      return false;
    }
  }

  function exitWebFullscreen() {
    if (typeof document === 'undefined') return false;

    try {
      const fsElements = document.querySelectorAll('.sentinel-web-fullscreen');
      fsElements.forEach(el => {
        el.classList.remove('sentinel-web-fullscreen');
        if (el.id === 'movie_player' || el.classList.contains('html5-video-player')) {
          el.classList.remove('ytp-fullscreen');
        }
      });

      const html = document.documentElement;
      const body = document.body;
      if (html) {
        html.classList.remove('sentinel-fullscreen-active', 'sentinel-has-web-fullscreen');
      }
      if (body) {
        body.classList.remove('sentinel-fullscreen-active', 'sentinel-has-web-fullscreen');
      }

      currentTarget = null;
      isWebFullscreenActive = false;

      try {
        window.dispatchEvent(new Event('resize'));
      } catch (_) {}

      return true;
    } catch (_) {
      return false;
    }
  }

  function isFullscreenActive() {
    return isWebFullscreenActive;
  }

  const WebFullscreenEngine = {
    STYLE_ID,
    CSS_TEXT,
    ensureStyles,
    getTargetElement,
    enterWebFullscreen,
    exitWebFullscreen,
    isWebFullscreenActive: isFullscreenActive
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebFullscreenEngine;
  }
  global.WebFullscreenEngine = WebFullscreenEngine;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
