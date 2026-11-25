/**
 * Web Activity & Media Sentinel - Content Runtime Client
 * Safe messaging and storage wrappers protecting against context invalidation.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function getBrowserAPI() {
    if (typeof browser !== 'undefined' && browser.runtime) return browser;
    if (typeof chrome !== 'undefined' && chrome.runtime) return chrome;
    return null;
  }

  function isExtensionContextValid(api = getBrowserAPI()) {
    try {
      return !!(api && api.runtime && api.runtime.id);
    } catch (_) {
      return false;
    }
  }

  function isContextValid(api = getBrowserAPI()) {
    return isExtensionContextValid(api);
  }

  function isInvalidationError(err) {
    if (!err) return false;
    const msg = String(err.message || err.error || err);
    return /(?:Extension )?context invalidated/i.test(msg);
  }

  function safeSendMessage(message, callback, api = getBrowserAPI()) {
    if (!isExtensionContextValid(api)) {
      if (typeof callback === 'function') {
        callback(null, new Error('Extension context invalidated'));
      }
      return;
    }

    try {
      const p = api.runtime.sendMessage(message, (res) => {
        let err = null;
        try { err = api.runtime ? api.runtime.lastError : null; } catch (_) {}
        if (err) {
          if (typeof callback === 'function') callback(null, err);
        } else {
          if (typeof callback === 'function') callback(res, null);
        }
      });
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {
      if (typeof callback === 'function') callback(null, e);
    }
  }

  function safeStorageGet(keys, callback, api = getBrowserAPI()) {
    if (!isExtensionContextValid(api) || !api.storage || !api.storage.local) {
      return;
    }
    try {
      api.storage.local.get(keys, (res) => {
        if (api.runtime.lastError) return;
        if (typeof callback === 'function') callback(res);
      });
    } catch (_) {}
  }

  function safeStorageSet(items, callback, api = getBrowserAPI()) {
    if (!isExtensionContextValid(api) || !api.storage || !api.storage.local) {
      return;
    }
    try {
      api.storage.local.set(items, () => {
        if (api.runtime.lastError) return;
        if (typeof callback === 'function') callback();
      });
    } catch (_) {}
  }

  const RuntimeClient = {
    isExtensionContextValid,
    isContextValid,
    isInvalidationError,
    safeSendMessage,
    safeStorageGet,
    safeStorageSet
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuntimeClient;
  }
  global.RuntimeClient = RuntimeClient;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
