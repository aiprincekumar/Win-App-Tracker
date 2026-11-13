/**
 * Web Activity & Media Sentinel - Isolated-to-Main World Bridge
 * Dispatches deterministic __MEDIA_SENTINEL_ACTION__ CustomEvents across worlds.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function forwardActionToMainWorld(action, data = {}) {
    if (typeof document === 'undefined') return;
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const event = new CustomEvent('__MEDIA_SENTINEL_ACTION__', {
      detail: {
        actionId,
        action,
        data,
        timestamp: Date.now()
      },
      bubbles: false,
      cancelable: true
    });
    document.dispatchEvent(event);
  }

  const IsolatedBridge = {
    forwardActionToMainWorld
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IsolatedBridge;
  }
  global.IsolatedBridge = IsolatedBridge;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
