/**
 * Web Activity & Media Sentinel - Isolated-to-Main World Bridge
 * Tri-channel action dispatcher (postMessage, DOM attribute, CustomEvent) and script injector.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  let actionCounter = 0;

  function forwardActionToMainWorld(action, data = {}) {
    try {
      const actionId = `act_${Date.now()}_${++actionCounter}_${Math.random().toString(36).substring(2, 7)}`;
      const payload = JSON.stringify({
        action,
        data,
        actionId,
        timestamp: Date.now()
      });

      // Channel A: window.postMessage
      try {
        if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
          window.postMessage({
            type: '__MEDIA_SENTINEL_ACTION__',
            detail: payload
          }, '*');
        }
      } catch (_) {}

      // Channel B: DOM attribute bridge
      try {
        if (typeof document !== 'undefined') {
          const root = document.documentElement || document.body;
          if (root && typeof root.setAttribute === 'function') {
            root.setAttribute('data-sentinel-action', payload);
            if (typeof document.dispatchEvent === 'function') {
              document.dispatchEvent(new Event('__MEDIA_SENTINEL_ACTION__', { bubbles: true, composed: true }));
            }
          }
        }
      } catch (_) {}

      // Channel C: CustomEvent bridge
      try {
        if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
          document.dispatchEvent(new CustomEvent('__MEDIA_SENTINEL_ACTION__', {
            detail: payload,
            bubbles: true,
            composed: true
          }));
        }
      } catch (_) {}
    } catch (_) {}
  }

  function isMainWorldBridgeActive() {
    if (typeof document === 'undefined') return false;
    const root = document.documentElement;
    return !!(root && root.getAttribute('data-sentinel-bridge-ready') === 'true');
  }

  function ensureMainWorldInjected(api) {
    if (typeof document === 'undefined') return;
    try {
      const root = document.documentElement;
      if (root && root.getAttribute('data-sentinel-bridge-ready') === 'true') return;
      if (document.getElementById('__media_sentinel_bridge_script__')) return;
      const browserAPI = api || (typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null));
      if (!browserAPI || !browserAPI.runtime || typeof browserAPI.runtime.getURL !== 'function') return;
      const s = document.createElement('script');
      s.id = '__media_sentinel_bridge_script__';
      s.src = browserAPI.runtime.getURL('inject_main_world.js');
      s.onload = () => s.remove();
      (document.head || document.documentElement || document.body).appendChild(s);
    } catch (_) {}
  }

  const IsolatedBridge = {
    forwardActionToMainWorld,
    isMainWorldBridgeActive,
    ensureMainWorldInjected
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IsolatedBridge;
  }
  global.IsolatedBridge = IsolatedBridge;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
