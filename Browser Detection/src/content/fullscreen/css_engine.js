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
.__sentinel_web_fullscreen_active__ {
  overflow: hidden !important;
}

.__sentinel_web_fullscreen_active__ ytd-masthead,
.__sentinel_web_fullscreen_active__ #masthead-container,
.__sentinel_web_fullscreen_active__ #secondary,
.__sentinel_web_fullscreen_active__ #below,
.__sentinel_web_fullscreen_active__ #chat,
.__sentinel_web_fullscreen_active__ #guide {
  display: none !important;
}

.__sentinel_web_fullscreen_element__ {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  z-index: 2147483640 !important;
  background: #000 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.__sentinel_web_fullscreen_element__ video {
  width: 100% !important;
  height: 100% !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  object-fit: contain !important;
}
`;

  function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(style);
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
