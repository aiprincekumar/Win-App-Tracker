/**
 * Web Activity & Media Sentinel - Fullscreen Debounce Lock
 * Eliminates cross-world double-toggle race conditions via DOM timestamp attribute.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const LOCK_ATTR = 'data-sentinel-fs-ts';
  const DEBOUNCE_MS = 350;

  function acquireLock(target = (typeof document !== 'undefined' ? document.documentElement : null)) {
    if (!target) return true;
    const now = Date.now();
    try {
      const lastStr = typeof target.getAttribute === 'function' ? target.getAttribute(LOCK_ATTR) : null;
      if (lastStr) {
        const last = Number(lastStr);
        if (!isNaN(last) && now - last < DEBOUNCE_MS) {
          return false;
        }
      }
      if (typeof target.setAttribute === 'function') {
        target.setAttribute(LOCK_ATTR, String(now));
      }
    } catch (_) {}
    return true;
  }

  const DebounceLock = {
    LOCK_ATTR,
    DEBOUNCE_MS,
    acquireLock
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebounceLock;
  }
  global.DebounceLock = DebounceLock;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
