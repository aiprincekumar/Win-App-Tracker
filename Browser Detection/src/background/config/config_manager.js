/**
 * Web Activity & Media Sentinel - Background Config Manager
 * Browser detection, client ID initialization, and configuration constants.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/constants.js')
    : (global.SharedConstants || {});

  const CONFIG = Shared.CONFIG || {
    WS_URL: 'ws://127.0.0.1:65432',
    DATA_HUB_URL: 'ws://127.0.0.1:65433',
    STORAGE_KEY: 'media_sentinel_activity_data',
    MEDIA_HISTORY_STORAGE_KEY: 'media_sentinel_media_history',
    SETTINGS_STORAGE_KEY: 'media_sentinel_settings',
    OFFLINE_QUEUE_STORAGE_KEY: 'media_sentinel_offline_queue',
    CLIENT_ID_STORAGE_KEY: 'media_sentinel_client_id',
    IDLE_THRESHOLD_SECONDS: 60,
    FLUSH_INTERVAL_MINUTES: 1,
    RECONNECT_INITIAL_MS: 5000,
    RECONNECT_MAX_MS: 120000,
    WS_RECONNECT_LADDER_MS: [5000, 15000, 30000, 60000, 120000],
    HUB_RECONNECT_LADDER_MS: [5000, 15000, 30000, 60000, 120000],
    MAX_CONSECUTIVE_FAILURES: 3,
    MAX_MEDIA_HISTORY: 500,
    DELTA_BATCH_INTERVAL_MS: 5000
  };

  let detectedBrowser = 'chrome';
  let clientId = null;

  async function detectBrowserType() {
    try {
      if (typeof navigator !== 'undefined') {
        if (navigator.userAgentData && Array.isArray(navigator.userAgentData.brands)) {
          const brands = navigator.userAgentData.brands.map(b => (b.brand || '').toLowerCase());
          if (brands.some(b => b.includes('microsoft edge') || b.includes('edge') || b.includes('edg'))) return 'edge';
          if (brands.some(b => b.includes('brave'))) return 'brave';
          if (brands.some(b => b.includes('opera') || b.includes('opr'))) return 'opera';
          if (brands.some(b => b.includes('chrome'))) {
            if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
              try { if (await navigator.brave.isBrave()) return 'brave'; } catch (_) {}
            }
            return 'chrome';
          }
        }
        const ua = (navigator.userAgent || '').toLowerCase();
        if (ua.includes('edg/')) return 'edge';
        if (ua.includes('brave/')) return 'brave';
        if (ua.includes('opr/') || ua.includes('opera/')) return 'opera';
        if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
          try { if (await navigator.brave.isBrave()) return 'brave'; } catch (_) {}
        }
        if (ua.includes('chrome/')) return 'chrome';
      }
    } catch (_) {}
    return 'chrome';
  }

  async function initClientIdAndBrowser(storageApi) {
    detectedBrowser = await detectBrowserType();
    const storage = storageApi || (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local);
    if (storage) {
      try {
        const res = await new Promise((resolve) => {
          storage.get([CONFIG.CLIENT_ID_STORAGE_KEY], resolve);
        });
        if (res && res[CONFIG.CLIENT_ID_STORAGE_KEY]) {
          clientId = res[CONFIG.CLIENT_ID_STORAGE_KEY];
        } else {
          clientId = `client_${detectedBrowser}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await new Promise((resolve) => {
            storage.set({ [CONFIG.CLIENT_ID_STORAGE_KEY]: clientId }, resolve);
          });
        }
      } catch (e) {
        if (!clientId) {
          clientId = `client_${detectedBrowser}_${Date.now()}`;
        }
      }
    } else if (!clientId) {
      clientId = `client_${detectedBrowser}_${Date.now()}`;
    }
    return { detectedBrowser, clientId };
  }

  const ConfigManager = {
    CONFIG,
    detectBrowserType,
    initClientIdAndBrowser,
    getBrowser: () => detectedBrowser,
    getClientId: () => clientId
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
  }
  global.ConfigManager = ConfigManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
