/**
 * Web Activity & Media Sentinel - Background State Manager
 * Central in-memory state repository for sessions, active tabs, and media.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Formatters = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/formatters.js')
    : (global.SharedFormatters || {});

  const Constants = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/constants.js')
    : (global.SharedConstants || {});

  const getToday = Formatters.getTodayDateString || (() => new Date().toISOString().split('T')[0]);

  const state = {
    activityData: {
      domains: {},
      historyDaysCount: 1,
      firstTrackedDate: getToday(),
      lastUpdated: Date.now()
    },
    mediaHistory: [],
    activeMediaSessions: new Map(),
    tabMediaMap: new Map(),
    settings: {
      idleThresholdSeconds: 60,
      wsUrl: 'ws://127.0.0.1:65432',
      autoConnectWs: true,
      mediaTrackingEnabled: true,
      notificationsEnabled: true,
      historyRetentionDays: 60,
      theme: 'dark',
      language: 'en'
    },
    sleepTimerState: Constants.INITIAL_SLEEP_TIMER_STATE ? { ...Constants.INITIAL_SLEEP_TIMER_STATE } : {
      state: 'IDLE',
      durationMinutes: 0,
      durationMs: 0,
      startTime: 0,
      targetTime: 0,
      pauseMedia: true,
      pauseTracking: true,
      enableFadeOut: true,
      fadeDurationSeconds: 30,
      lastUpdated: 0
    },
    sleepTimerSettings: Constants.DEFAULT_SLEEP_SETTINGS ? { ...Constants.DEFAULT_SLEEP_SETTINGS } : {
      defaultDurationMinutes: 30,
      enableAudioFadeOut: true,
      fadeDurationSeconds: 30,
      enableInactivityAutoSleep: false,
      inactivityThresholdMinutes: 15,
      showBadgeCountdown: true,
      pulseOnCritical: true
    },
    activeTabId: null,
    activeWindowId: null,
    activeDomain: null,
    intervalStartTime: Date.now(),
    isBrowserFocused: true,
    isUserActive: true,
    isTrackingPaused: false,
    trackingMode: 'combined', // 'combined' | 'foreground' | 'bg_media'
    audibleTabRemainders: new Map() // tabId -> remainder ms
  };

  const StateManager = {
    state,
    getActivityData: () => state.activityData,
    setActivityData: (data) => { state.activityData = data; },
    getMediaHistory: () => state.mediaHistory,
    setMediaHistory: (history) => { state.mediaHistory = history; },
    getActiveMediaSessions: () => state.activeMediaSessions,
    getTabMediaMap: () => state.tabMediaMap,
    getSettings: () => state.settings,
    setSettings: (s) => { Object.assign(state.settings, s); },
    getSleepTimerState: () => state.sleepTimerState,
    setSleepTimerState: (sts) => { Object.assign(state.sleepTimerState, sts); },
    getSleepTimerSettings: () => state.sleepTimerSettings,
    setSleepTimerSettings: (stSet) => { Object.assign(state.sleepTimerSettings, stSet); },
    getActiveTabId: () => state.activeTabId,
    setActiveTabId: (id) => { state.activeTabId = id; },
    getActiveWindowId: () => state.activeWindowId,
    setActiveWindowId: (id) => { state.activeWindowId = id; },
    getActiveDomain: () => state.activeDomain,
    setActiveDomain: (domain) => { state.activeDomain = domain; },
    getIntervalStartTime: () => state.intervalStartTime,
    setIntervalStartTime: (time) => { state.intervalStartTime = time; },
    isFocused: () => state.isBrowserFocused,
    setFocused: (focused) => { state.isBrowserFocused = !!focused; },
    isActive: () => state.isUserActive,
    setActive: (active) => { state.isUserActive = !!active; },
    isPaused: () => state.isTrackingPaused,
    setPaused: (paused) => { state.isTrackingPaused = !!paused; }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
  }
  global.StateManager = StateManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
