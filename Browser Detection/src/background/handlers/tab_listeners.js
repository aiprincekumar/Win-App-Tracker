/**
 * Web Activity & Media Sentinel - Tab Listeners Subsystem
 * Safe chrome.tabs and chrome.windows event handlers with auto-pause guards.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Factory creating tab and window event listener callbacks.
   * 
   * @param {object} context Execution context with state and helper methods
   * @returns {object} Event listeners map
   */
  function createTabHandlers(context) {
    const {
      state,
      browserAPI,
      extractDomain,
      switchActiveDomain,
      commitActiveInterval,
      handleAutoPauseOnTabChange,
      handleAudibleStateChange
    } = context;

    const api = browserAPI || (typeof browser !== 'undefined' && browser.tabs ? browser : (typeof chrome !== 'undefined' ? chrome : null));

    async function onTabActivated(activeInfo) {
      if (!activeInfo || !activeInfo.tabId) return;
      state.activeTabId = activeInfo.tabId;
      state.activeWindowId = activeInfo.windowId || null;

      try {
        if (api && api.tabs && typeof api.tabs.get === 'function') {
          api.tabs.get(activeInfo.tabId, (tab) => {
            if (api.runtime && api.runtime.lastError) return;
            if (tab && tab.url) {
              const domain = extractDomain ? extractDomain(tab.url) : null;
              if (typeof switchActiveDomain === 'function') {
                switchActiveDomain(domain);
              }
            } else if (typeof switchActiveDomain === 'function') {
              switchActiveDomain(null);
            }
          });
        }
      } catch (_) {
        if (typeof switchActiveDomain === 'function') {
          switchActiveDomain(null);
        }
      }

      if (typeof handleAutoPauseOnTabChange === 'function') {
        handleAutoPauseOnTabChange(activeInfo.tabId).catch(() => {});
      }
    }

    async function onTabCreated(tab) {
      if (!tab || !tab.id) return;
      if (typeof handleAutoPauseOnTabChange === 'function') {
        handleAutoPauseOnTabChange(tab.id).catch(() => {});
      }
    }

    async function onTabUpdated(tabId, changeInfo, tab) {
      // Audible state transition tracking
      if (changeInfo && typeof changeInfo.audible === 'boolean' && typeof handleAudibleStateChange === 'function') {
        handleAudibleStateChange(tabId, changeInfo.audible, tab);
      }

      // Active tab URL navigation
      if (tabId === state.activeTabId) {
        if (changeInfo.url) {
          const domain = extractDomain ? extractDomain(changeInfo.url) : null;
          if (typeof switchActiveDomain === 'function') {
            switchActiveDomain(domain);
          }
        } else if (tab && tab.url && !state.activeDomain) {
          const domain = extractDomain ? extractDomain(tab.url) : null;
          if (typeof switchActiveDomain === 'function') {
            switchActiveDomain(domain);
          }
        }
      }
    }

    async function onTabRemoved(tabId, removeInfo) {
      if (state.activeMediaSessions && state.activeMediaSessions.has(tabId)) {
        state.activeMediaSessions.delete(tabId);
      }
      if (state.tabMediaMap && state.tabMediaMap.has(tabId)) {
        state.tabMediaMap.delete(tabId);
      }
      if (state.audibleTabRemainders && state.audibleTabRemainders.has(tabId)) {
        state.audibleTabRemainders.delete(tabId);
      }
      if (tabId === state.activeTabId) {
        if (typeof switchActiveDomain === 'function') {
          switchActiveDomain(null);
        }
      }
    }

    async function onWindowFocusChanged(windowId) {
      const WINDOW_ID_NONE = (api && api.windows && api.windows.WINDOW_ID_NONE) !== undefined
        ? api.windows.WINDOW_ID_NONE
        : -1;

      if (windowId === WINDOW_ID_NONE) {
        state.isBrowserFocused = false;
        if (typeof commitActiveInterval === 'function') {
          commitActiveInterval();
        }
      } else {
        state.isBrowserFocused = true;
        state.activeWindowId = windowId;
        state.intervalStartTime = Date.now();

        try {
          if (api && api.tabs && typeof api.tabs.query === 'function') {
            api.tabs.query({ active: true, windowId }, (tabs) => {
              if (tabs && tabs[0] && tabs[0].url) {
                state.activeTabId = tabs[0].id;
                const domain = extractDomain ? extractDomain(tabs[0].url) : null;
                if (typeof switchActiveDomain === 'function') {
                  switchActiveDomain(domain);
                }
              }
            });
          }
        } catch (_) {}
      }
    }

    return {
      onTabActivated,
      onTabCreated,
      onTabUpdated,
      onTabRemoved,
      onWindowFocusChanged
    };
  }

  const TabListeners = Object.freeze({
    createTabHandlers
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabListeners;
  }
  global.TabListeners = TabListeners;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
