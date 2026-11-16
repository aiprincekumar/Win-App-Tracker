/**
 * Web Activity & Media Sentinel - Dashboard Central State Store
 * Manages active tab, temporal subtab, browser filter, tracking mode, category,
 * data hub connectivity, audio lab settings, themes, and sleep timers.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const HUB_RETRY_INTERVALS = Object.freeze([1000, 2000, 5000, 10000, 30000]);

  const DEFAULT_SETTINGS = Object.freeze({
    idleThresholdSeconds: 60,
    wsUrl: 'ws://127.0.0.1:65432',
    autoConnectWs: true,
    mediaTrackingEnabled: true,
    notificationsEnabled: true,
    historyRetentionDays: 60,
    theme: 'dark',
    language: 'en',
    // Sleep Timer & Inactivity Subsystem
    defaultDurationMinutes: 30,
    enableAudioFadeOut: true,
    fadeDurationSeconds: 30,
    enableInactivityAutoSleep: false,
    inactivityThresholdMinutes: 15,
    showBadgeCountdown: true,
    pulseOnCritical: true
  });

  const DEFAULT_AUDIO_LAB = Object.freeze({
    master_boost: 100,
    audio_only: false,
    eq_preset: 'flat',
    eq_bands: {
      '60': 0,
      '250': 0,
      '1000': 0,
      '4000': 0,
      '16000': 0
    },
    vocal_clarity: false,
    night_shield: false
  });

  function createInitialState() {
    return {
      currentTab: 'tracking',
      temporalSubtab: 'today',
      selectedBrowser: 'all',
      selectedTrackingMode: 'all',
      selectedDomainCategory: 'all',
      dashboardData: null,
      mediaHistoryData: [],
      dataHubConnected: false,
      dataHubAnalytics: null,
      detectedBrowserType: 'chrome',
      hubReconnectAttempts: 0,
      hubReconnectTimer: null,
      HUB_RETRY_INTERVALS,
      cachedSettings: Object.assign({}, DEFAULT_SETTINGS),
      dashboardAudioLabSettings: Object.assign({}, DEFAULT_AUDIO_LAB, {
        eq_bands: Object.assign({}, DEFAULT_AUDIO_LAB.eq_bands)
      }),
      domainSearchQuery: '',
      domainSortMode: 'time_desc',
      mediaSearchQuery: '',
      mediaPlatformFilter: 'all',
      mediaSortMode: 'time_desc',
      pendingDangerAction: null,
      isDraggingHeroVolume: false,
      currentSubstrate: 'midnight-oled',
      currentAccent: 'emerald',
      currentTheme: 'dark',
      currentLang: 'en'
    };
  }

  let state = createInitialState();
  const listeners = new Set();

  function isInternalDomain(domain) {
    if (!domain) return false;
    let d = String(domain).toLowerCase().trim();
    if (d.startsWith('http://') || d.startsWith('https://')) {
      try {
        d = new URL(d).hostname.toLowerCase();
      } catch (_) {
        d = d.replace(/^https?:\/\//, '').split('/')[0];
      }
    }
    const hostWithoutPort = d.replace(/^\[([^\]]+)\](?::\d+)?$/, '$1').split(':')[0];
    return (
      d === 'chrome' ||
      d === 'edge' ||
      d === 'about' ||
      d === 'newtab' ||
      d === 'dashboard' ||
      d === 'extension' ||
      hostWithoutPort === '127.0.0.1' ||
      hostWithoutPort === 'localhost' ||
      hostWithoutPort === '0.0.0.0' ||
      hostWithoutPort === '::1' ||
      d.startsWith('127.0.0.1') ||
      d.startsWith('localhost') ||
      d.startsWith('0.0.0.0') ||
      d.startsWith('[::1]') ||
      d.startsWith('chrome://') ||
      d.startsWith('edge://') ||
      d.startsWith('about:') ||
      d.startsWith('chrome-extension://') ||
      d.startsWith('edge-extension://') ||
      d.startsWith('moz-extension://') ||
      d.startsWith('extension:')
    );
  }

  function notify(changedKeys) {
    listeners.forEach((listener) => {
      try {
        listener(state, changedKeys);
      } catch (err) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[DashboardState] Listener error:', err);
        }
      }
    });
  }

  const DashboardState = {
    HUB_RETRY_INTERVALS,
    DEFAULT_SETTINGS,
    DEFAULT_AUDIO_LAB,
    state,
    get: (k) => state[k],
    set: (k, v) => {
      state[k] = v;
      notify([k]);
    },
    update: (patch) => {
      if (patch && typeof patch === 'object') {
        Object.assign(state, patch);
        notify(Object.keys(patch));
      }
    },
    getState: () => state,
    reset: () => {
      state = createInitialState();
      DashboardState.state = state;
      notify(['*']);
    },
    subscribe: (fn) => {
      if (typeof fn === 'function') {
        listeners.add(fn);
        return () => listeners.delete(fn);
      }
      return () => {};
    },
    isInternalDomain
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardState;
  }
  global.DashboardState = DashboardState;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
