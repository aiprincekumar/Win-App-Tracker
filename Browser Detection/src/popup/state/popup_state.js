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
    currentTemporalTab: 'today',
    selectedBrowser: 'all',
    selectedTrackingMode: 'combined',
    selectedCategory: 'all',
    language: 'en',
    currentTheme: 'dark',
    wsConnected: false,
    dataHubConnected: false,
    dataHubAnalytics: null,
    dashboardData: null,
    mediaState: null,
    activeTabId: null,
    activeWindowId: null,
    quickSettings: {
      default_tab: 'media',
      sync_interval: 2000,
      notification_sound: true,
      high_contrast: false
    },
    smartAutomations: {
      auto_pause_new_tab: false,
      auto_ad_silencer: false,
      domain_speed_memory: false
    },
    focusSettings: {
      doomscroll_enabled: false,
      doomscroll_interval_minutes: 30
    },
    audioLabSettings: {
      master_boost: 100,
      audio_only: false,
      eq_preset: 'flat',
      eq_bands: { '60': 0, '250': 0, '1000': 0, '4000': 0, '16000': 0 },
      vocal_clarity: false,
      night_shield: false
    }
  };

  const _subscribers = new Set();

  function getState() {
    return state;
  }

  function get(key) {
    return state[key];
  }

  function set(key, val) {
    state[key] = val;
    notifySubscribers(key, val);
  }

  function update(patch) {
    if (patch && typeof patch === 'object') {
      Object.assign(state, patch);
      Object.keys(patch).forEach(key => notifySubscribers(key, patch[key]));
    }
  }

  function subscribe(fn) {
    if (typeof fn === 'function') {
      _subscribers.add(fn);
      return () => _subscribers.delete(fn);
    }
    return () => {};
  }

  function notifySubscribers(key, val) {
    _subscribers.forEach(fn => {
      try { fn(key, val, state); } catch (_) {}
    });
  }

  function hydrateFromStorage(storageRes = {}) {
    if (!storageRes || typeof storageRes !== 'object') return state;

    if (storageRes.ui_theme) {
      state.currentTheme = storageRes.ui_theme;
    }
    if (storageRes.ui_lang) {
      state.language = storageRes.ui_lang;
    }
    if (storageRes.selected_browser_filter) {
      state.selectedBrowser = storageRes.selected_browser_filter;
    }
    if (storageRes.quick_settings) {
      Object.assign(state.quickSettings, storageRes.quick_settings);
    }
    if (storageRes.smart_automations) {
      Object.assign(state.smartAutomations, storageRes.smart_automations);
    }
    if (storageRes.focus_settings) {
      Object.assign(state.focusSettings, storageRes.focus_settings);
    }
    if (storageRes.audio_lab_settings) {
      Object.assign(state.audioLabSettings, storageRes.audio_lab_settings);
    }

    return state;
  }

  const PopupState = {
    state,
    getState,
    get,
    set,
    update,
    subscribe,
    hydrateFromStorage
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PopupState;
  }
  global.PopupState = PopupState;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
