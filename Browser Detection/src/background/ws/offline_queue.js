/**
 * Web Activity & Media Sentinel - Offline Queue Manager
 * Buffers time-tracking and telemetry deltas during Data Hub disconnects and flushes on reconnect.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  let offlineSyncQueue = [];

  function getQueue() {
    return offlineSyncQueue;
  }

  function enqueue(item) {
    if (!item) return;
    offlineSyncQueue.push(item);
    if (offlineSyncQueue.length > 500) {
      offlineSyncQueue.shift();
    }
  }

  function clearQueue() {
    offlineSyncQueue = [];
  }

  async function flushOfflineSyncQueue(sendFn) {
    if (!offlineSyncQueue.length || typeof sendFn !== 'function') return 0;
    const batch = offlineSyncQueue.slice();
    try {
      const success = await sendFn(batch);
      if (success) {
        offlineSyncQueue = offlineSyncQueue.slice(batch.length);
        return batch.length;
      }
    } catch (_) {}
    return 0;
  }

  async function saveOfflineQueue(storageApi, storageKey) {
    const storage = storageApi || (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local);
    if (!storage || !storageKey) return;
    return new Promise((resolve) => {
      storage.set({ [storageKey]: offlineSyncQueue }, resolve);
    });
  }

  async function loadOfflineQueue(storageApi, storageKey) {
    const storage = storageApi || (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local);
    if (!storage || !storageKey) return [];
    return new Promise((resolve) => {
      storage.get([storageKey], (res) => {
        if (res && Array.isArray(res[storageKey])) {
          offlineSyncQueue = res[storageKey];
        }
        resolve(offlineSyncQueue);
      });
    });
  }

  const OfflineQueue = {
    getQueue,
    enqueue,
    clearQueue,
    flushOfflineSyncQueue,
    saveOfflineQueue,
    loadOfflineQueue
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineQueue;
  }
  global.OfflineQueue = OfflineQueue;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
