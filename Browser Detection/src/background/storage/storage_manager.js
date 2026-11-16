/**
 * Web Activity & Media Sentinel - Background Storage Manager Subsystem
 * Asynchronous persistence, debounced save scheduling, and memory hydration.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/constants.js')
    : (global.SharedConstants || {});

  const CONFIG = Shared.CONFIG || {
    STORAGE_KEY: 'media_sentinel_activity_data',
    MEDIA_HISTORY_STORAGE_KEY: 'media_sentinel_media_history',
    SETTINGS_STORAGE_KEY: 'media_sentinel_settings'
  };

  let isStorageLoaded = false;
  let storageLoadPromise = null;
  let storageSaveTimeout = null;
  let isStorageDirty = false;

  /**
   * Ensures storage is loaded before reading or writing data.
   * Caches pending promise to prevent race conditions during concurrent accesses.
   * 
   * @param {function(): Promise<any>} loadFn
   * @returns {Promise<any>}
   */
  function ensureStorageLoaded(loadFn) {
    if (isStorageLoaded) {
      return Promise.resolve();
    }
    if (storageLoadPromise) {
      return storageLoadPromise;
    }
    if (typeof loadFn !== 'function') {
      isStorageLoaded = true;
      return Promise.resolve();
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

  /**
   * Schedules a debounced persistent storage save.
   * 
   * @param {function(): any} saveFn Persistence callback
   * @param {number} [delayMs=2000] Debounce delay in milliseconds
   */
  function scheduleStorageSave(saveFn, delayMs = 2000) {
    isStorageDirty = true;
    if (storageSaveTimeout) {
      clearTimeout(storageSaveTimeout);
    }
    storageSaveTimeout = setTimeout(() => {
      storageSaveTimeout = null;
      if (isStorageDirty && typeof saveFn === 'function') {
        saveFn();
        isStorageDirty = false;
      }
    }, delayMs);
  }

  /**
   * Executes pending persistence save immediately if dirty.
   * 
   * @param {function(): any} saveFn
   */
  function saveImmediately(saveFn) {
    if (storageSaveTimeout) {
      clearTimeout(storageSaveTimeout);
      storageSaveTimeout = null;
    }
    if (isStorageDirty && typeof saveFn === 'function') {
      saveFn();
      isStorageDirty = false;
    }
  }

  /**
   * Cancels any pending scheduled storage save.
   */
  function cancelPendingSave() {
    if (storageSaveTimeout) {
      clearTimeout(storageSaveTimeout);
      storageSaveTimeout = null;
    }
    isStorageDirty = false;
  }

  const StorageManager = Object.freeze({
    ensureStorageLoaded,
    scheduleStorageSave,
    saveImmediately,
    cancelPendingSave,
    isLoaded: () => isStorageLoaded,
    markLoaded: (val) => { isStorageLoaded = !!val; },
    isDirty: () => isStorageDirty,
    markClean: () => { isStorageDirty = false; }
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
  }
  global.StorageManager = StorageManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
