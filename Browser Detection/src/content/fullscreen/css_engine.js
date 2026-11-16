/**
 * Web Activity & Media Sentinel - Fullscreen CSS Engine
 * Dynamic viewport fill styles, stacking context neutralization, and scroll locking.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const STYLE_ID = '__sentinel_fullscreen_controller_styles__';

  const CSS_TEXT = `
    /* Guaranteed Web Fullscreen: Viewport Lock */
    html.sentinel-fullscreen-active,
    body.sentinel-fullscreen-active,
    html.sentinel-has-web-fullscreen,
    body.sentinel-has-web-fullscreen {
      overflow: hidden !important;
      width: 100vw !important;
      height: 100vh !important;
      min-width: 100vw !important;
      min-height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
    }

    /* Conceal surrounding YouTube UI: masthead, sidebars, comments, header, below player */
    .sentinel-fullscreen-active #masthead-container,
    .sentinel-fullscreen-active ytd-masthead,
    .sentinel-fullscreen-active #masthead,
    .sentinel-fullscreen-active #secondary,
    .sentinel-fullscreen-active #secondary-inner,
    .sentinel-fullscreen-active #comments,
    .sentinel-fullscreen-active #below,
    .sentinel-fullscreen-active #chat,
    .sentinel-fullscreen-active ytd-live-chat-frame,
    .sentinel-fullscreen-active ytd-playlist-panel-renderer,
    .sentinel-fullscreen-active ytd-merch-shelf-renderer,
    .sentinel-fullscreen-active #header,
    .sentinel-fullscreen-active header,
    .sentinel-fullscreen-active nav,
    .sentinel-fullscreen-active .site-header,
    .sentinel-fullscreen-active .navbar,
    .sentinel-has-web-fullscreen #masthead-container,
    .sentinel-has-web-fullscreen ytd-masthead,
    .sentinel-has-web-fullscreen #masthead,
    .sentinel-has-web-fullscreen #secondary,
    .sentinel-has-web-fullscreen #comments,
    .sentinel-has-web-fullscreen #below {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* Container Neutralization: eliminate contain, transform, filter, perspective that trap fixed elements */
    .sentinel-fullscreen-active ytd-app,
    .sentinel-fullscreen-active #content,
    .sentinel-fullscreen-active #page-manager,
    .sentinel-fullscreen-active ytd-watch-flexy,
    .sentinel-fullscreen-active ytd-watch-grid,
    .sentinel-fullscreen-active #columns,
    .sentinel-fullscreen-active #primary,
    .sentinel-fullscreen-active #primary-inner,
    .sentinel-fullscreen-active #player,
    .sentinel-fullscreen-active #player-container-outer,
    .sentinel-fullscreen-active #player-container-inner,
    .sentinel-fullscreen-active #player-container,
    .sentinel-fullscreen-active #player-full-bleed-container,
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
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
    }

    /* Target Fullscreen Element (Video Player Container or Video) */
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
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }

    #movie_player.sentinel-web-fullscreen {
      background: #000000 !important;
    }

    /* Direct HTML5 <video> styled with sentinel-web-fullscreen */
    video.sentinel-web-fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      object-fit: contain !important;
      margin: auto !important;
      z-index: 2147483647 !important;
      background: transparent !important;
      box-sizing: border-box !important;
    }

    /* Force YouTube video container to fill 100vw / 100vh */
    .sentinel-web-fullscreen .html5-video-container {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      top: 0 !important;
      left: 0 !important;
      position: absolute !important;
    }

    /* Force HTML5 <video> to fill screen while preserving aspect ratio */
    .sentinel-web-fullscreen video,
    .sentinel-web-fullscreen video.html5-main-video {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      left: 0 !important;
      top: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      position: absolute !important;
      object-fit: contain !important;
      margin: auto !important;
    }

    /* YouTube control bar at bottom */
    .sentinel-web-fullscreen .ytp-chrome-bottom {
      width: 100% !important;
      left: 0 !important;
      bottom: 0 !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding: 0 16px !important;
      z-index: 2147483647 !important;
    }
  `;

  function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    try {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS_TEXT;
      (document.head || document.documentElement || document.body).appendChild(style);
    } catch (_) {}
  }

  const CSSEngine = {
    STYLE_ID,
    CSS_TEXT,
    ensureStyles
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSSEngine;
  }
  global.CSSEngine = CSSEngine;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
