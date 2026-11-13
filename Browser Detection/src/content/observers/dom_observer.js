/**
 * Web Activity & Media Sentinel - DOM Observer Subsystem
 * Observes dynamic SPA transitions and player mount/unmount.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function observeDOMChanges(callback, target = document.body) {
    if (typeof MutationObserver === 'undefined' || !target) return null;
    const observer = new MutationObserver((mutations) => {
      callback(mutations);
    });
    observer.observe(target, {
      childList: true,
      subtree: true
    });
    return observer;
  }

  const DomObserver = {
    observeDOMChanges
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomObserver;
  }
  global.DomObserver = DomObserver;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
