/**
 * Web Activity & Media Sentinel - Tab Listeners Subsystem
 * Encapsulates chrome.tabs event handlers (activated, updated, removed).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function createTabHandlers(context) {
    const {
      state,
      commitActiveDomainTime,
      extractDomain,
      isRestrictedTabUrl,
      safeSendTabMessage,
      streamActivityDelta
    } = context;

    async function onTabActivated(activeInfo) {
      if (!activeInfo || !activeInfo.tabId) return;
      state.activeTabId = activeInfo.tabId;
      state.activeWindowId = activeInfo.windowId || null;

      try {
        const api = typeof browser !== 'undefined' && browser.tabs ? browser : chrome;
        api.tabs.get(activeInfo.tabId, (tab) => {
          if (api.runtime && api.runtime.lastError) return;
          if (tab && tab.url) {
            const domain = extractDomain(tab.url);
            commitActiveDomainTime(domain, tab.url);
          } else {
            commitActiveDomainTime(null, null);
          }
        });
      } catch (_) {
        commitActiveDomainTime(null, null);
      }
    }

    async function onTabUpdated(tabId, changeInfo, tab) {
      if (tabId === state.activeTabId) {
        if (changeInfo.url) {
          const domain = extractDomain(changeInfo.url);
          commitActiveDomainTime(domain, changeInfo.url);
        } else if (tab && tab.url && !state.activeDomain) {
          const domain = extractDomain(tab.url);
          commitActiveDomainTime(domain, tab.url);
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
      if (tabId === state.activeTabId) {
        commitActiveDomainTime(null, null);
      }
    }

    return {
      onTabActivated,
      onTabUpdated,
      onTabRemoved
    };
  }

  const TabListeners = {
    createTabHandlers
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabListeners;
  }
  global.TabListeners = TabListeners;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
