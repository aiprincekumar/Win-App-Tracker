/**
 * Web Activity & Media Sentinel - Web Fullscreen Engine
 * Dedicated module for CSS viewport fill and scroll-lock management.
 */

(function (global) {
  'use strict';

  const CSSEngine = (typeof module !== 'undefined' && module.exports)
    ? require('../content/fullscreen/css_engine.js')
    : global.CSSEngine;

  const WebFullscreenEngine = {
    ensureStyles: CSSEngine.ensureStyles,
    STYLE_ID: CSSEngine.STYLE_ID,
    CSS_TEXT: CSSEngine.CSS_TEXT
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebFullscreenEngine;
  }
  global.WebFullscreenEngine = WebFullscreenEngine;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
