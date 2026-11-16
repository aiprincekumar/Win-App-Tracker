/**
 * Web Activity & Media Sentinel - DOM Observer Subsystem
 * Observes dynamic SPA transitions and player mount/unmount.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function observeDOMChanges(callback, target = (typeof document !== 'undefined' ? document.body : null)) {
    if (typeof MutationObserver === 'undefined' || !target) return null;
    try {
      const observer = new MutationObserver((mutations) => {
        callback(mutations);
      });
      observer.observe(target, {
        childList: true,
        subtree: true
      });
      return observer;
    } catch (_) {
      return null;
    }
  }

  const DomObserver = {
    observeDOMChanges
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomObserver;
  }
  global.DomObserver = DomObserver;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
