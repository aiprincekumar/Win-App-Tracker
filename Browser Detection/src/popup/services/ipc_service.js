/**
 * Web Activity & Media Sentinel - Popup IPC Service
 * Coordinates communication with the background service worker.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function sendMessage(message) {
    const api = typeof browser !== 'undefined' && browser.runtime ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.runtime || !api.runtime.sendMessage) {
      return Promise.reject(new Error('Extension runtime API unavailable'));
    }

    return new Promise((resolve) => {
      try {
        api.runtime.sendMessage(message, (response) => {
          if (api.runtime.lastError) {
            resolve({ success: false, error: api.runtime.lastError.message });
          } else {
            resolve(response || { success: true });
          }
        });
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  const IPCService = {
    sendMessage
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPCService;
  }
  global.IPCService = IPCService;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
