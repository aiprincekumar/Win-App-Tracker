/**
 * Web Activity & Media Sentinel - Native Fullscreen Engine
 * Manages W3C requestFullscreen user gestures and exitFullscreen.
 */

(function (global) {
  'use strict';

  function requestNativeFullscreen(element) {
    if (!element) return false;
    try {
      if (typeof element.requestFullscreen === 'function') {
        element.requestFullscreen().catch(() => {});
        return true;
      } else if (typeof element.webkitRequestFullscreen === 'function') {
        element.webkitRequestFullscreen();
        return true;
      }
    } catch (_) {}
    return false;
  }

  function exitNativeFullscreen() {
    if (typeof document === 'undefined') return false;
    try {
      if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
        document.exitFullscreen().catch(() => {});
        return true;
      } else if (document.webkitFullscreenElement && typeof document.webkitExitFullscreen === 'function') {
        document.webkitExitFullscreen();
        return true;
      }
    } catch (_) {}
    return false;
  }

  const NativeEngine = {
    requestNativeFullscreen,
    exitNativeFullscreen
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NativeEngine;
  }
  global.NativeEngine = NativeEngine;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
