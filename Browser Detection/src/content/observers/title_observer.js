/**
 * Web Activity & Media Sentinel - Document Title Observer
 * Observes document.title modifications during client-side navigation.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function observeTitleChanges(callback) {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return null;
    const titleEl = document.querySelector('title');
    if (!titleEl) return null;

    const observer = new MutationObserver(() => {
      callback(document.title);
    });
    observer.observe(titleEl, {
      characterData: true,
      childList: true,
      subtree: true
    });
    return observer;
  }

  const TitleObserver = {
    observeTitleChanges
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TitleObserver;
  }
  global.TitleObserver = TitleObserver;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
