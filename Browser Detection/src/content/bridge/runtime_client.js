/**
 * Web Activity & Media Sentinel - Content Runtime Client
 * Safe messaging wrapper from content scripts to background service worker.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function safeSendMessage(message, callback) {
    const api = typeof browser !== 'undefined' && browser.runtime ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.runtime || !api.runtime.sendMessage) return;

    try {
      api.runtime.sendMessage(message, (res) => {
        if (api.runtime.lastError) {
          if (typeof callback === 'function') callback(null, api.runtime.lastError);
        } else {
          if (typeof callback === 'function') callback(res, null);
        }
      });
    } catch (e) {
      if (typeof callback === 'function') callback(null, e);
    }
  }

  const RuntimeClient = {
    safeSendMessage
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuntimeClient;
  }
  global.RuntimeClient = RuntimeClient;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
