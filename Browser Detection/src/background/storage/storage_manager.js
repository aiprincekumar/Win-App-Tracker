/**
 * Web Activity & Media Sentinel - Background Storage Manager
 * Asynchronous persistence, batch saves, and memory hydration.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/constants.js')
    : (global.SharedConstants || {});

  const Formatters = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/formatters.js')
    : (global.SharedFormatters || {});

  const CONFIG = Shared.CONFIG || {
    STORAGE_KEY: 'media_sentinel_activity_data',
    MEDIA_HISTORY_STORAGE_KEY: 'media_sentinel_media_history',
    SETTINGS_STORAGE_KEY: 'media_sentinel_settings'
  };

  let isStorageLoaded = false;
  let storageLoadPromise = null;
  let storageSaveTimeout = null;
  let isStorageDirty = false;

  function ensureStorageLoaded(loadFn) {
    if (isStorageLoaded) {
      return Promise.resolve();
    }
    if (storageLoadPromise) {
      return storageLoadPromise;
    }
    storageLoadPromise = loadFn().then(() => {
      isStorageLoaded = true;
      storageLoadPromise = null;
    }).catch((err) => {
      storageLoadPromise = null;
      throw err;
    });
    return storageLoadPromise;
  }

  function scheduleStorageSave(saveFn, delayMs = 2000) {
    isStorageDirty = true;
    if (storageSaveTimeout) {
      clearTimeout(storageSaveTimeout);
    }
    storageSaveTimeout = setTimeout(() => {
      storageSaveTimeout = null;
      if (isStorageDirty) {
        saveFn();
        isStorageDirty = false;
      }
    }, delayMs);
  }

  const StorageManager = {
    ensureStorageLoaded,
    scheduleStorageSave,
    isLoaded: () => isStorageLoaded,
    markLoaded: (val) => { isStorageLoaded = !!val; },
    isDirty: () => isStorageDirty,
    markClean: () => { isStorageDirty = false; }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
  }
  global.StorageManager = StorageManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
