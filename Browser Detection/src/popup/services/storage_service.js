/**
 * Web Activity & Media Sentinel - Popup Storage Service
 * Persists and hydrates user settings and filter states from chrome.storage.local.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function getStorage(keys) {
    const api = typeof browser !== 'undefined' && browser.storage ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.storage || !api.storage.local) {
      return Promise.resolve({});
    }
    return new Promise((resolve) => {
      api.storage.local.get(keys, (res) => {
        resolve(res || {});
      });
    });
  }

  function setStorage(items) {
    const api = typeof browser !== 'undefined' && browser.storage ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.storage || !api.storage.local) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      api.storage.local.set(items, () => {
        resolve();
      });
    });
  }

  const StorageService = {
    getStorage,
    setStorage
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
  }
  global.StorageService = StorageService;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
