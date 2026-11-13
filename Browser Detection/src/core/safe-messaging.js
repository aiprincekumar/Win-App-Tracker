/**
 * Web Activity & Media Sentinel - Safe Messaging Subsystem
 * IPC Connection Guard, restricted URL checker, and unhandled rejection suppressor.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function isRestrictedTabUrl(url) {
    if (!url || typeof url !== 'string') return true;
    const u = url.trim().toLowerCase();
    return (
      u.startsWith('chrome://') ||
      u.startsWith('edge://') ||
      u.startsWith('about:') ||
      u.startsWith('chrome-extension://') ||
      u.startsWith('edge-extension://') ||
      u.startsWith('moz-extension://') ||
      u.startsWith('extension:') ||
      u.startsWith('devtools://') ||
      u.startsWith('view-source:') ||
      u.startsWith('chrome-search://') ||
      u.startsWith('data:') ||
      u.startsWith('javascript:')
    );
  }

  async function safeSendRuntimeMessage(message, maxRetries = 2) {
    const api = typeof browser !== 'undefined' && browser.runtime ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.runtime || !api.runtime.sendMessage) return null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await new Promise((resolve) => {
          try {
            api.runtime.sendMessage(message, (res) => {
              const err = api.runtime.lastError;
              if (err) {
                resolve({ __error: err.message });
              } else {
                resolve(res);
              }
            });
          } catch (syncErr) {
            resolve({ __error: syncErr.message });
          }
        });
        if (response && response.__error) {
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
            continue;
          }
          return null;
        }
        return response;
      } catch (_) {
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
          continue;
        }
      }
    }
    return null;
  }

  async function safeSendTabMessage(tabId, message, maxRetries = 2) {
    const api = typeof browser !== 'undefined' && browser.tabs ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.tabs || !api.tabs.sendMessage || !tabId) return null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await new Promise((resolve) => {
          try {
            api.tabs.sendMessage(Number(tabId), message, (res) => {
              const err = api.runtime && api.runtime.lastError;
              if (err) {
                resolve({ __error: err.message });
              } else {
                resolve(res);
              }
            });
          } catch (syncErr) {
            resolve({ __error: syncErr.message });
          }
        });
        if (response && response.__error) {
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
            continue;
          }
          return null;
        }
        return response;
      } catch (_) {
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
          continue;
        }
      }
    }
    return null;
  }

  function setupUnhandledRejectionGuard() {
    if (typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') {
      globalThis.addEventListener('unhandledrejection', (event) => {
        const reason = event && event.reason;
        const msg = (reason && (reason.message || String(reason))) || '';
        if (
          msg.includes('Could not establish connection') ||
          msg.includes('Receiving end does not exist') ||
          msg.includes('message port closed') ||
          msg.includes('Extension context invalidated')
        ) {
          if (typeof event.preventDefault === 'function') {
            event.preventDefault();
          }
        }
      });
    }
  }

  const SafeMessaging = Object.freeze({
    isRestrictedTabUrl,
    safeSendRuntimeMessage,
    safeSendTabMessage,
    setupUnhandledRejectionGuard
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafeMessaging;
  }
  global.SafeMessaging = SafeMessaging;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
