/**
 * Web Activity & Media Sentinel - Native Fullscreen Engine
 * Manages W3C requestFullscreen user gestures, user activation, and exitFullscreen.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function isUserActivationActive() {
    try {
      return !!(typeof navigator !== 'undefined' && navigator.userActivation && navigator.userActivation.isActive);
    } catch (_) {
      return false;
    }
  }

  function isNativeFullscreenActive() {
    if (typeof document === 'undefined') return false;
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function requestNativeFullscreen(element) {
    if (!element) return false;
    try {
      if (typeof element.requestFullscreen === 'function') {
        const p = element.requestFullscreen();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
        return true;
      } else if (typeof element.webkitRequestFullscreen === 'function') {
        element.webkitRequestFullscreen();
        return true;
      } else if (typeof element.mozRequestFullScreen === 'function') {
        element.mozRequestFullScreen();
        return true;
      } else if (typeof element.msRequestFullscreen === 'function') {
        element.msRequestFullscreen();
        return true;
      }
    } catch (_) {}
    return false;
  }

  function exitNativeFullscreen() {
    if (typeof document === 'undefined') return false;
    try {
      if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
        const p = document.exitFullscreen();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
        return true;
      } else if (document.webkitFullscreenElement && typeof document.webkitExitFullscreen === 'function') {
        document.webkitExitFullscreen();
        return true;
      } else if (document.mozCancelFullScreen && typeof document.mozCancelFullScreen === 'function') {
        document.mozCancelFullScreen();
        return true;
      } else if (document.msExitFullscreen && typeof document.msExitFullscreen === 'function') {
        document.msExitFullscreen();
        return true;
      }
    } catch (_) {}
    return false;
  }

  const NativeEngine = {
    isUserActivationActive,
    isNativeFullscreenActive,
    requestNativeFullscreen,
    exitNativeFullscreen
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NativeEngine;
  }
  global.NativeEngine = NativeEngine;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
