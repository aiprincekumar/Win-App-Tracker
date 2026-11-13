/**
 * Web Activity & Media Sentinel - Popup State Store
 * Reactive state store for active tab, media playback, tracking filters, and Data Hub.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const state = {
    currentTopTab: 'media',
    currentTemporalTab: 'total',
    selectedBrowser: 'all',
    selectedTrackingMode: 'combined',
    selectedCategory: 'all',
    language: 'en',
    wsConnected: false,
    dataHubConnected: false,
    dataHubAnalytics: null,
    dashboardData: null,
    mediaState: null,
    activeTabId: null,
    activeWindowId: null,
    smartAutomations: {
      autoPauseNewTab: false,
      smartVolumeFade: true,
      autoPipFullscreen: false,
      loopMode: false
    }
  };

  const PopupState = {
    state,
    get: (key) => state[key],
    set: (key, val) => { state[key] = val; },
    update: (patch) => { Object.assign(state, patch); }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PopupState;
  }
  global.PopupState = PopupState;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
