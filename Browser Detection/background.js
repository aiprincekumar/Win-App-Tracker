/**
 * Browser Detection / background.js
 * Manifest V3 Service Worker: Activity Time Tracker, Media Sentinel Aggregator & WebSocket Bridge
 * 
 * Features:
 *  - High-precision per-domain active time & session tracking (Web Activity Time Tracker clone)
 *  - System and browser idle detection (freezes counters when away or locked)
 *  - Multi-frame aware, resilient media telemetry aggregation (video, audio, resolution, mute, progress)
 *  - Bidirectional media control relay (play/pause/mute/seek/speed from popup to page)
 *  - Resilient, auto-reconnecting WebSocket client to local Video Detector HUD (ws://127.0.0.1:65432)
 *  - Persistent storage in chrome.storage.local with periodic flush alarms
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const createSafeBrowserAPIFallback = () => {
  const dummyListener = { addListener: () => {}, removeListener: () => {}, hasListener: () => false };
  return {
    action: { setBadgeText: () => {}, setBadgeBackgroundColor: () => {} },
    alarms: { onAlarm: dummyListener, clear: async () => {}, create: () => {}, get: async () => null },
    idle: { onStateChanged: dummyListener, setDetectionInterval: () => {}, queryState: (_, cb) => cb && cb('active') },
    notifications: { create: () => {} },
    runtime: {
      id: 'node_env',
      lastError: null,
      onMessage: dummyListener,
      onSuspend: dummyListener,
      onInstalled: dummyListener,
      sendMessage: () => Promise.resolve(),
      sendNativeMessage: () => {},
      getManifest: () => ({ version: '2.5.0' })
    },
    scripting: { executeScript: async () => [] },
    storage: {
      local: { get: async () => ({}), set: async () => ({}) },
      onChanged: dummyListener
    },
    tabs: {
      onActivated: dummyListener,
      onCreated: dummyListener,
      onRemoved: dummyListener,
      onUpdated: dummyListener,
      get: async () => null,
      query: async () => [],
      sendMessage: () => Promise.resolve(),
      update: async () => null
    },
    windows: {
      onFocusChanged: dummyListener,
      getCurrent: async () => null,
      get: async () => null,
      update: async () => null,
      WINDOW_ID_NONE: -1
    }
  };
};

const browserAPI = (typeof globalThis.browser !== 'undefined' && globalThis.browser && globalThis.browser.runtime)
  ? globalThis.browser 
  : ((typeof globalThis.chrome !== 'undefined' && globalThis.chrome)
    ? globalThis.chrome
    : createSafeBrowserAPIFallback());

// =============================================================================
// Domain-Driven Layered Modular Subsystems (src/shared/ & src/background/)
// =============================================================================
const _SharedConstants = typeof SharedConstants !== 'undefined' ? SharedConstants : (typeof require === 'function' ? require('./src/shared/constants.js') : null);
const _SharedContracts = typeof SharedContracts !== 'undefined' ? SharedContracts : (typeof require === 'function' ? require('./src/shared/contracts.js') : null);
const _SharedFormatters = typeof SharedFormatters !== 'undefined' ? SharedFormatters : (typeof require === 'function' ? require('./src/shared/formatters.js') : null);
const _ConfigManager = typeof ConfigManager !== 'undefined' ? ConfigManager : (typeof require === 'function' ? require('./src/background/config/config_manager.js') : null);
const _StateManager = typeof StateManager !== 'undefined' ? StateManager : (typeof require === 'function' ? require('./src/background/state/state_manager.js') : null);
const _StorageManager = typeof StorageManager !== 'undefined' ? StorageManager : (typeof require === 'function' ? require('./src/background/storage/storage_manager.js') : null);
const _SleepTimerStorage = typeof SleepTimerStorage !== 'undefined' ? SleepTimerStorage : (typeof require === 'function' ? require('./src/background/storage/sleep_timer_storage.js') : null);
const _ReconnectLadder = typeof ReconnectLadder !== 'undefined' ? ReconnectLadder : (typeof require === 'function' ? require('./src/background/ws/reconnect_ladder.js') : null);
const _SilentProbe = typeof SilentProbe !== 'undefined' ? SilentProbe : (typeof require === 'function' ? require('./src/background/ws/silent_probe.js') : null);
const _OfflineQueue = typeof OfflineQueue !== 'undefined' ? OfflineQueue : (typeof require === 'function' ? require('./src/background/ws/offline_queue.js') : null);
const _DataHubClient = typeof DataHubClient !== 'undefined' ? DataHubClient : (typeof require === 'function' ? require('./src/background/ws/data_hub_client.js') : null);
const _DomainTracker = typeof DomainTracker !== 'undefined' ? DomainTracker : (typeof require === 'function' ? require('./src/background/telemetry/domain_tracker.js') : null);
const _DeltaStreamer = typeof DeltaStreamer !== 'undefined' ? DeltaStreamer : (typeof require === 'function' ? require('./src/background/telemetry/delta_streamer.js') : null);
const _SleepTimerEngine = typeof SleepTimerEngine !== 'undefined' ? SleepTimerEngine : (typeof require === 'function' ? require('./src/background/telemetry/sleep_timer_engine.js') : null);
const _TabListeners = typeof TabListeners !== 'undefined' ? TabListeners : (typeof require === 'function' ? require('./src/background/handlers/tab_listeners.js') : null);
const _AlarmHandlers = typeof AlarmHandlers !== 'undefined' ? AlarmHandlers : (typeof require === 'function' ? require('./src/background/handlers/alarm_handlers.js') : null);
const _IdleHandlers = typeof IdleHandlers !== 'undefined' ? IdleHandlers : (typeof require === 'function' ? require('./src/background/handlers/idle_handlers.js') : null);
const _MessageRouter = typeof MessageRouter !== 'undefined' ? MessageRouter : (typeof require === 'function' ? require('./src/background/handlers/message_router.js') : null);
const _FeatureRegistry = typeof SentinelFeatureRegistry !== 'undefined' ? SentinelFeatureRegistry : (typeof require === 'function' ? require('./src/core/feature_registry.js') : null);
const _BackgroundFeatureManager = typeof BackgroundFeatureManager !== 'undefined' ? BackgroundFeatureManager : (typeof require === 'function' ? require('./src/background/features/background_feature_manager.js') : null);

if (typeof globalThis !== 'undefined') {
  globalThis.SentinelBackgroundModules = {
    SharedConstants: _SharedConstants,
    SharedContracts: _SharedContracts,
    SharedFormatters: _SharedFormatters,
    ConfigManager: _ConfigManager,
    StateManager: _StateManager,
    StorageManager: _StorageManager,
    SleepTimerStorage: _SleepTimerStorage,
    ReconnectLadder: _ReconnectLadder,
    SilentProbe: _SilentProbe,
    OfflineQueue: _OfflineQueue,
    DataHubClient: _DataHubClient,
    DomainTracker: _DomainTracker,
    DeltaStreamer: _DeltaStreamer,
    SleepTimerEngine: _SleepTimerEngine,
    TabListeners: _TabListeners,
    AlarmHandlers: _AlarmHandlers,
    IdleHandlers: _IdleHandlers,
    MessageRouter: _MessageRouter,
    FeatureRegistry: _FeatureRegistry,
    BackgroundFeatureManager: _BackgroundFeatureManager
  };
}

// Bootstrap Background Modular Features
try {
  if (_BackgroundFeatureManager && typeof _BackgroundFeatureManager.initBackgroundFeatures === 'function') {
    _BackgroundFeatureManager.initBackgroundFeatures({ browserAPI: browserAPI });
  }
} catch (_) {}

// =============================================================================
// Manifest V3 IPC Connection Guard & Unhandled Promise Rejection Sentinel
// =============================================================================

/**
 * Global fail-safe: Suppress benign Chrome/Edge extension IPC unhandled promise rejections.
 * Prevents "Error: Could not establish connection. Receiving end does not exist" from creating
 * an unhandled promise rejection error badge on chrome://extensions.
 */
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

/**
 * Checks if a tab URL is a restricted internal scheme where content scripts cannot run.
 * (e.g. chrome://, edge://, about:, devtools://, chrome-extension://, view-source:, etc.)
 * 
 * @param {string} url Target tab URL
 * @returns {boolean}
 */
function isRestrictedTabUrl(url) {
  if (!url || typeof url !== 'string') return true;
  const u = url.trim().toLowerCase();
  return (
    u.startsWith('chrome://') ||
    u.startsWith('edge://') ||
    u.startsWith('about:') ||
    u.startsWith('devtools://') ||
    u.startsWith('chrome-extension://') ||
    u.startsWith('edge-extension://') ||
    u.startsWith('moz-extension://') ||
    u.startsWith('view-source:') ||
    u.startsWith('data:') ||
    u.startsWith('javascript:') ||
    u.includes('chrome.google.com/webstore') ||
    u.includes('chromewebstore.google.com') ||
    u.includes('microsoftedge.microsoft.com/addons')
  );
}

/**
 * Safely sends a runtime IPC broadcast to extension views (popup, dashboard)
 * with unhandled promise rejection prevention when no views are open.
 * 
 * @param {object} message Payload to broadcast
 * @param {function} [callback] Optional response callback (response, error)
 * @returns {Promise<any>}
 */
function safeSendRuntimeMessage(message, callback) {
  return new Promise((resolve) => {
    let resolved = false;
    const handleResult = (res, err) => {
      if (resolved) return;
      resolved = true;
      if (callback && typeof callback === 'function') {
        try {
          callback(res, err);
        } catch (_) {}
      }
      resolve(res || null);
    };

    try {
      if (!browserAPI.runtime || typeof browserAPI.runtime.sendMessage !== 'function') {
        return handleResult(null, new Error('browserAPI.runtime.sendMessage not available'));
      }

      const maybePromise = browserAPI.runtime.sendMessage(message, (response) => {
        const lastErr = browserAPI.runtime.lastError;
        handleResult(response, lastErr || null);
      });

      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise
          .then((res) => {
            handleResult(res, null);
          })
          .catch((err) => {
            // Benign rejection: popup or dashboard is closed ("Receiving end does not exist")
            handleResult(null, err);
          });
      }
    } catch (syncErr) {
      handleResult(null, syncErr);
    }
  });
}

/**
 * Safely sends an IPC message to a browser tab with URL restriction guards
 * and unhandled promise rejection prevention.
 * 
 * @param {number} tabId Target tab ID
 * @param {object} message Payload to send
 * @param {function} [callback] Optional response callback (response, error)
 * @returns {Promise<any>}
 */
async function safeSendTabMessage(tabId, message, callback) {
  if (!tabId || typeof tabId !== 'number') {
    if (callback && typeof callback === 'function') {
      try { callback(null, new Error('Invalid tab ID')); } catch (_) {}
    }
    return null;
  }

  // Pre-check tab URL to skip restricted schemes
  try {
    if (browserAPI.tabs && typeof browserAPI.tabs.get === 'function') {
      const tab = await browserAPI.tabs.get(tabId).catch(() => null);
      if (tab && tab.url && isRestrictedTabUrl(tab.url)) {
        if (callback && typeof callback === 'function') {
          try { callback(null, new Error('Restricted tab URL scheme')); } catch (_) {}
        }
        return null;
      }
    }
  } catch (_) {}

  return new Promise((resolve) => {
    let resolved = false;
    const handleResult = (res, err) => {
      if (resolved) return;
      resolved = true;
      if (callback && typeof callback === 'function') {
        try {
          callback(res, err);
        } catch (_) {}
      }
      resolve(res || null);
    };

    try {
      if (!browserAPI.tabs || typeof browserAPI.tabs.sendMessage !== 'function') {
        return handleResult(null, new Error('browserAPI.tabs.sendMessage not available'));
      }

      const maybePromise = browserAPI.tabs.sendMessage(tabId, message, (response) => {
        const lastErr = browserAPI.runtime.lastError;
        handleResult(response, lastErr || null);
      });

      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise
          .then((res) => {
            handleResult(res, null);
          })
          .catch((err) => {
            // Benign rejection: Content script not ready or receiving end does not exist
            handleResult(null, err);
          });
      }
    } catch (syncErr) {
      handleResult(null, syncErr);
    }
  });
}

if (typeof globalThis !== 'undefined') {
  globalThis.safeSendRuntimeMessage = safeSendRuntimeMessage;
  globalThis.safeSendTabMessage = safeSendTabMessage;
  globalThis.isRestrictedTabUrl = isRestrictedTabUrl;
  globalThis.handleAutoPauseOnTabChange = handleAutoPauseOnTabChange;
  globalThis.connectWebSocket = connectWebSocket;
  globalThis.connectDataHub = connectDataHub;
  globalThis.probePortLive = probePortLive;
  globalThis.probeAndConnectServices = probeAndConnectServices;
  globalThis.getWsState = () => ({
    wsConnected,
    wsReconnectPaused,
    wsFailureCount,
    wsReconnectIndex
  });
  globalThis.getDataHubState = () => ({
    dataHubConnected,
    dataHubReconnectPaused,
    dataHubFailureCount,
    dataHubReconnectIndex
  });
  globalThis.getTrackingPauseState = () => isTrackingPaused;
}

// Configuration
const CONFIG = {
  WS_URL: 'ws://127.0.0.1:65432', // Video Detector HUD port (idle sentinel & overlays)
  DATA_HUB_URL: 'ws://127.0.0.1:65433', // Standalone SQLite Data Hub daemon port
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

if (typeof globalThis !== 'undefined') {
  globalThis.CONFIG = CONFIG;
}

// Deterministic 0.25x speed stepping ladder (strict 0.25x min, 2.0x max)
const SPEED_LADDER = [0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0];

function calculateNextLadderSpeed(currentSpeed, direction) {
  const cur = (typeof currentSpeed === 'number' && !isNaN(currentSpeed) && currentSpeed > 0)
    ? Math.round(currentSpeed * 100) / 100
    : 1.0;

  let closestIdx = 3; // default 1.0
  let minDiff = Infinity;
  for (let i = 0; i < SPEED_LADDER.length; i++) {
    const diff = Math.abs(SPEED_LADDER[i] - cur);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }

  let nextIdx;
  if (direction === 'down' || direction === -1) {
    nextIdx = Math.max(0, closestIdx - 1);
  } else {
    nextIdx = Math.min(SPEED_LADDER.length - 1, closestIdx + 1);
  }
  return SPEED_LADDER[nextIdx];
}

// Global State
let activityData = {
  domains: {},
  historyDaysCount: 1,
  firstTrackedDate: getTodayDateString(),
  lastUpdated: Date.now()
};

let mediaHistory = [];
const activeMediaSessions = new Map(); // tabId -> active session

let settings = {
  idleThresholdSeconds: 60,
  wsUrl: 'ws://127.0.0.1:65432',
  autoConnectWs: true,
  mediaTrackingEnabled: true,
  notificationsEnabled: true,
  historyRetentionDays: 60,
  theme: 'dark',
  language: 'en'
};

// Sleep Timer & Inactivity Subsystem Schemas
const DEFAULT_SLEEP_SETTINGS = Object.freeze({
  defaultDurationMinutes: 30,
  enableAudioFadeOut: true,
  fadeDurationSeconds: 30,
  enableInactivityAutoSleep: false,
  inactivityThresholdMinutes: 15,
  showBadgeCountdown: true,
  pulseOnCritical: true
});

const INITIAL_SLEEP_TIMER_STATE = Object.freeze({
  state: 'IDLE', // 'IDLE' | 'RUNNING' | 'PAUSED' | 'FADING' | 'TRIGGERED' | 'CANCELLED'
  durationMinutes: 0,
  durationMs: 0,
  startTime: 0,
  targetTime: 0,
  pauseMedia: true,
  pauseTracking: true,
  enableFadeOut: true,
  fadeDurationSeconds: 30,
  lastUpdated: 0
});

let sleepTimerState = { ...INITIAL_SLEEP_TIMER_STATE };
let sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS };

const SLEEP_ALARM_NAME = 'sentinel_sleep_timer_alarm';
const SLEEP_FADE_ALARM_NAME = 'sentinel_sleep_fade_alarm';

// Focus Sentinel & Pomodoro Subsystem Schemas (Phase 2)
const FOCUS_TIMER_ALARM_NAME = 'sentinel_focus_timer_alarm';
const FOCUS_BREAK_ALARM_NAME = 'sentinel_focus_break_alarm';

const DEFAULT_FOCUS_SETTINGS = Object.freeze({
  focusDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoPauseMedia: true,
  soundChime: true,
  autoStartBreak: false,
  autoStartNextFocus: false,
  showBadgeCountdown: true
});

const INITIAL_FOCUS_TIMER_STATE = Object.freeze({
  state: 'IDLE', // 'IDLE' | 'RUNNING_FOCUS' | 'PAUSED_FOCUS' | 'RUNNING_BREAK' | 'PAUSED_BREAK' | 'COMPLETED'
  mode: 'focus', // 'focus' | 'break'
  durationMinutes: 25,
  remainingSeconds: 1500,
  targetTime: null,
  sessionStartedAt: null,
  pausedAt: null,
  completedSessionsToday: 0,
  autoPauseMedia: true,
  soundChime: true,
  updatedAt: Date.now()
});

let focusTimerState = { ...INITIAL_FOCUS_TIMER_STATE };
let focusTimerSettings = { ...DEFAULT_FOCUS_SETTINGS };
let dailyFocusMetrics = {};

// Digital Wellness & Doomscroll Breaker Alarm Subsystem (Phase 3: Defect 12)
const DOOMSCROLL_ENTERTAINMENT_HOSTS = ['youtube.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com'];
const DOOMSCROLL_ALARM_NAME = 'DOOMSCROLL_CHECK_ALARM';
let doomscrollConsecutiveMinutes = 0;

let activeTabId = null;
let activeWindowId = null;
let activeDomain = null;
let intervalStartTime = Date.now();
let isBrowserFocused = true;
let isUserActive = true;
let isTrackingPaused = false;
let userIdleStartTime = 0;

// Feature 7 & 8: Privacy Tracking Exclusion Blacklist & Domain Budgets
let trackingBlacklist = ['localhost', 'localhost:*', '127.0.0.1', '127.0.0.1:*', '192.168.*', '192.168.*:*', '10.*.*:*', 'file://*'];
let domainBudgets = {};

function compileBlacklistRegexBg(pattern) {
  if (!pattern || typeof pattern !== 'string') return null;
  const trimmed = pattern.trim().toLowerCase();
  if (!trimmed || trimmed.length > 128) return null;
  try {
    const escaped = trimmed
      .replace(/[.+^${}()|[\]\\/-]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp('^' + escaped + '$', 'i');
  } catch (_) {
    return null;
  }
}

function matchesTrackingBlacklist(urlOrDomain) {
  if (!urlOrDomain || !Array.isArray(trackingBlacklist) || trackingBlacklist.length === 0) return false;
  const target = String(urlOrDomain).trim().toLowerCase();
  if (!target) return false;

  let host = target;
  let hostWithPort = target;
  try {
    if (target.includes('://')) {
      const parsed = new URL(target);
      host = parsed.hostname.toLowerCase();
      hostWithPort = parsed.host.toLowerCase();
    } else if (target.includes(':')) {
      host = target.split(':')[0].toLowerCase();
    }
  } catch (_) {}

  for (let i = 0; i < trackingBlacklist.length; i++) {
    const p = trackingBlacklist[i];
    if (!p) continue;
    const rawPattern = String(p).trim().toLowerCase();
    if (!rawPattern) continue;
    if (target === rawPattern || host === rawPattern || hostWithPort === rawPattern) {
      return true;
    }
    if (rawPattern.endsWith(':*')) {
      const base = rawPattern.slice(0, -2);
      if (target === base || host === base) {
        return true;
      }
    }
    const rx = compileBlacklistRegexBg(rawPattern);
    if (rx && (rx.test(target) || rx.test(host) || rx.test(hostWithPort))) {
      return true;
    }
  }
  return false;
}

// Media Map: tabId -> Media State Payload
const tabMediaMap = new Map();

// Snapshot Maps for Bidirectional Tab Audio Muting (Solo, Mute All Others, Mute All)
const soloPreviousMuteStates = new Map();
const muteOthersPreviousMuteStates = new Map();
const muteAllPreviousMuteStates = new Map();

// WebSocket Connection State (Video Detector HUD on port 65432)
let ws = null;
let wsConnected = false;
let wsReconnectTimer = null;
let wsReconnectDelay = CONFIG.RECONNECT_INITIAL_MS;
let wsReconnectIndex = 0;
let wsFailureCount = 0;
let wsReconnectPaused = false;
let lastWsAttemptTime = 0;

// Standalone SQLite Data Hub State (port 65433)
let detectedBrowser = 'chrome';
let clientId = null;
let dataHubWs = null;
let dataHubConnected = false;
let dataHubRegistered = false;
let dataHubReconnectTimer = null;
let dataHubReconnectIndex = 0;
let dataHubFailureCount = 0;
let dataHubReconnectPaused = false;
let lastDataHubAttemptTime = 0;
let dataHubHeartbeatInterval = null;
let offlineSyncQueue = [];
const pendingQueryCallbacks = new Map();
let deltaCommitTicker = null;

/**
 * Detects browser client type dynamically (chrome, edge, brave, opera)
 */
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

/**
 * Initializes client ID and detected browser type from persistent storage
 */
async function initClientIdAndBrowser() {
  detectedBrowser = await detectBrowserType();
  try {
    const res = await browserAPI.storage.local.get([CONFIG.CLIENT_ID_STORAGE_KEY]);
    if (res && res[CONFIG.CLIENT_ID_STORAGE_KEY]) {
      clientId = res[CONFIG.CLIENT_ID_STORAGE_KEY];
    } else {
      clientId = `client_${detectedBrowser}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await browserAPI.storage.local.set({ [CONFIG.CLIENT_ID_STORAGE_KEY]: clientId });
    }
  } catch (e) {
    if (!clientId) {
      clientId = `client_${detectedBrowser}_${Date.now()}`;
    }
  }
  return { detectedBrowser, clientId };
}

/**
 * Connects to Standalone Multi-Browser SQLite Data Hub on ws://127.0.0.1:65433
 */
async function connectDataHub() {
  const force = arguments[0] === true;
  if (force) {
    if (dataHubReconnectTimer) {
      clearTimeout(dataHubReconnectTimer);
      dataHubReconnectTimer = null;
    }
    dataHubReconnectIndex = 0;
    dataHubFailureCount = 0;
    dataHubReconnectPaused = false;
    if (dataHubWs && dataHubWs.readyState !== WebSocket.OPEN) {
      try {
        dataHubWs.onopen = null;
        dataHubWs.onmessage = null;
        dataHubWs.onerror = null;
        dataHubWs.onclose = null;
        dataHubWs.close();
      } catch (_) {}
      dataHubWs = null;
    }
  }

  // If paused due to consecutive failures and not explicitly forced, do not reconnect
  if (dataHubReconnectPaused && !force) {
    return;
  }

  if (dataHubWs && (dataHubWs.readyState === WebSocket.OPEN || dataHubWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  lastDataHubAttemptTime = Date.now();

  // In browser runtime where fetch is available, silently probe port before raw WebSocket creation
  // to eliminate Chromium C++ net::ERR_CONNECTION_REFUSED badges on chrome://extensions
  if (typeof fetch === 'function') {
    const isLive = await probePortLive(CONFIG.DATA_HUB_URL);
    if (dataHubWs && (dataHubWs.readyState === WebSocket.OPEN || dataHubWs.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (!isLive) {
      handleDataHubFailure();
      return;
    }
  }

  try {
    dataHubWs = new WebSocket(CONFIG.DATA_HUB_URL);

    dataHubWs.onopen = () => {
      dataHubConnected = true;
      dataHubFailureCount = 0;
      dataHubReconnectIndex = 0;
      dataHubReconnectPaused = false;
      if (dataHubReconnectTimer) {
        clearTimeout(dataHubReconnectTimer);
        dataHubReconnectTimer = null;
      }

      // 1. Send client registration
      const regMsg = {
        type: 'REGISTER_CLIENT',
        client_id: clientId || `client_${detectedBrowser}_${Date.now()}`,
        browser_type: detectedBrowser,
        browser: detectedBrowser,
        os_user: 'DesktopUser',
        timestamp: Date.now()
      };
      sendDataHubMessage(regMsg);

      // Notify active views immediately (safe against unhandled promise rejection)
      safeSendRuntimeMessage({ type: 'DATA_HUB_STATUS_CHANGED', connected: true });

      // 2. Start heartbeat timer every 10s (resilient against background throttling)
      if (dataHubHeartbeatInterval) clearInterval(dataHubHeartbeatInterval);
      dataHubHeartbeatInterval = setInterval(() => {
        if (dataHubConnected && dataHubWs && dataHubWs.readyState === WebSocket.OPEN) {
          sendDataHubMessage({
            type: 'HEARTBEAT',
            client_id: clientId,
            timestamp: Date.now()
          });
        }
      }, 10000);
    };

    dataHubWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleDataHubIncomingMessage(msg);
      } catch (err) {
        console.error('[MediaSentinel] Error parsing Data Hub message:', err);
      }
    };

    dataHubWs.onerror = () => {
      dataHubConnected = false;
      dataHubRegistered = false;
      // Absorbs error quietly to eliminate ERR_CONNECTION_REFUSED console noise
    };

    dataHubWs.onclose = () => {
      dataHubConnected = false;
      dataHubRegistered = false;
      if (dataHubHeartbeatInterval) {
        clearInterval(dataHubHeartbeatInterval);
        dataHubHeartbeatInterval = null;
      }
      safeSendRuntimeMessage({ type: 'DATA_HUB_STATUS_CHANGED', connected: false });
      handleDataHubFailure();
    };
  } catch (err) {
    dataHubConnected = false;
    dataHubRegistered = false;
    handleDataHubFailure();
  }
}

function handleDataHubFailure() {
  dataHubConnected = false;
  dataHubRegistered = false;
  dataHubFailureCount++;

  if (dataHubFailureCount >= (CONFIG.MAX_CONSECUTIVE_FAILURES || 3)) {
    dataHubReconnectPaused = true;
    if (dataHubReconnectTimer) {
      clearTimeout(dataHubReconnectTimer);
      dataHubReconnectTimer = null;
    }
    console.info(`[MediaSentinel] Data Hub bridge is offline (${CONFIG.DATA_HUB_URL}). Polling paused. Will reconnect on demand.`);
    return;
  }

  scheduleDataHubReconnect();
}

function scheduleDataHubReconnect() {
  if (dataHubReconnectTimer || dataHubReconnectPaused) return;
  const ladder = CONFIG.HUB_RECONNECT_LADDER_MS || [5000, 15000, 30000, 60000, 120000];
  const delay = ladder[Math.min(dataHubReconnectIndex, ladder.length - 1)];
  dataHubReconnectIndex++;
  dataHubReconnectTimer = setTimeout(() => {
    dataHubReconnectTimer = null;
    connectDataHub();
  }, delay);
}

function sendDataHubMessage(payload) {
  if (dataHubWs && dataHubWs.readyState === WebSocket.OPEN) {
    try {
      dataHubWs.send(JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('[MediaSentinel] Failed to send message to Data Hub:', e);
    }
  }
  return false;
}

function handleDataHubIncomingMessage(msg) {
  if (!msg || !msg.type) return;

  if (msg.type === 'REGISTER_RESPONSE') {
    dataHubRegistered = true;
    flushOfflineSyncQueue();
  } else if (msg.type === 'ANALYTICS_RESPONSE') {
    const reqId = msg.requestId;
    if (reqId && pendingQueryCallbacks.has(reqId)) {
      const cb = pendingQueryCallbacks.get(reqId);
      pendingQueryCallbacks.delete(reqId);
      clearTimeout(cb.timer);
      cb.resolve(msg);
    } else {
      for (const [id, cb] of pendingQueryCallbacks.entries()) {
        if (cb.queryType === 'ANALYTICS') {
          pendingQueryCallbacks.delete(id);
          clearTimeout(cb.timer);
          cb.resolve(msg);
          break;
        }
      }
    }
  } else if (msg.type === 'LIVE_STATE_RESPONSE') {
    const reqId = msg.requestId;
    if (reqId && pendingQueryCallbacks.has(reqId)) {
      const cb = pendingQueryCallbacks.get(reqId);
      pendingQueryCallbacks.delete(reqId);
      clearTimeout(cb.timer);
      cb.resolve(msg);
    } else {
      for (const [id, cb] of pendingQueryCallbacks.entries()) {
        if (cb.queryType === 'LIVE_STATE') {
          pendingQueryCallbacks.delete(id);
          clearTimeout(cb.timer);
          cb.resolve(msg);
          break;
        }
      }
    }
  }
}

/**
 * Flushes offline delta queue to Data Hub in a single atomic batch
 */
async function flushOfflineSyncQueue() {
  if (!dataHubConnected || !dataHubRegistered || !dataHubWs || dataHubWs.readyState !== WebSocket.OPEN) {
    return;
  }

  try {
    const res = await browserAPI.storage.local.get([CONFIG.OFFLINE_QUEUE_STORAGE_KEY]);
    if (res && Array.isArray(res[CONFIG.OFFLINE_QUEUE_STORAGE_KEY]) && res[CONFIG.OFFLINE_QUEUE_STORAGE_KEY].length > 0) {
      const storedQueue = res[CONFIG.OFFLINE_QUEUE_STORAGE_KEY];
      offlineSyncQueue = [...storedQueue, ...offlineSyncQueue];
      await browserAPI.storage.local.set({ [CONFIG.OFFLINE_QUEUE_STORAGE_KEY]: [] });
    }
  } catch (_) {}

  if (offlineSyncQueue.length === 0) return;

  const batch = offlineSyncQueue.slice();
  offlineSyncQueue = [];

  const batchMsg = {
    type: 'SYNC_ACTIVITY_DELTA',
    browser_type: detectedBrowser,
    deltas: batch,
    timestamp: Date.now()
  };

  const sent = sendDataHubMessage(batchMsg);
  if (!sent) {
    offlineSyncQueue = [...batch, ...offlineSyncQueue];
    saveOfflineQueue();
  } else {
    saveOfflineQueue();
  }
}

async function saveOfflineQueue() {
  try {
    await browserAPI.storage.local.set({ [CONFIG.OFFLINE_QUEUE_STORAGE_KEY]: offlineSyncQueue });
  } catch (_) {}
}

/**
 * Transmits consolidated hourly activity buckets to Data Hub.
 * Universal Rule 28: <= 30 lines.
 */
function syncHourlyBucketsToDataHub(dateStr, hourlyBuckets) {
  if (!dataHubConnected || !dataHubRegistered || !dataHubWs || dataHubWs.readyState !== WebSocket.OPEN) {
    return false;
  }
  const dateKey = dateStr || getTodayDateString();
  const buckets = hourlyBuckets || {};
  const populated = {};
  for (const [h, b] of Object.entries(buckets)) {
    if (b && ((b.activeSeconds || b.activeTime || 0) > 0 || (b.backgroundMediaSeconds || b.mediaTime || 0) > 0)) {
      populated[h] = b;
    }
  }
  return sendDataHubMessage({
    type: 'SYNC_HOURLY_BUCKETS',
    browser_type: detectedBrowser,
    client_id: clientId,
    date_str: dateKey,
    hourly_buckets_json: JSON.stringify(populated),
    timestamp: Date.now()
  });
}

/**
 * Streams active seconds delta to Data Hub or offline queue.
 * Supports trackingType: 'foreground' | 'background_media'.
 */
function streamActivityDelta(domain, seconds, isNewSession = false, trackingType = 'foreground') {
  if (!domain || seconds <= 0) return;

  const todayStr = getTodayDateString();
  let hourlyBucketsJson = '{}';
  if (activityData && activityData.domains && activityData.domains[domain] && activityData.domains[domain].days && activityData.domains[domain].days[todayStr]) {
    const hb = activityData.domains[domain].days[todayStr].hourlyBuckets;
    if (hb) hourlyBucketsJson = JSON.stringify(hb);
  }

  const delta = {
    domain,
    seconds,
    tracking_type: trackingType,
    date_str: todayStr,
    browser_type: detectedBrowser,
    favicon_url: getFaviconUrl(domain),
    session_count: isNewSession ? 1 : 0,
    hourly_buckets_json: hourlyBucketsJson
  };

  if (dataHubConnected && dataHubRegistered && dataHubWs && dataHubWs.readyState === WebSocket.OPEN) {
    const msg = {
      type: 'SYNC_ACTIVITY_DELTA',
      browser_type: detectedBrowser,
      domain: delta.domain,
      seconds: delta.seconds,
      tracking_type: delta.tracking_type,
      date_str: delta.date_str,
      favicon_url: delta.favicon_url,
      session_count: delta.session_count,
      hourly_buckets_json: delta.hourly_buckets_json,
      timestamp: Date.now()
    };
    sendDataHubMessage(msg);
  } else {
    offlineSyncQueue.push(delta);
    if (offlineSyncQueue.length > 1000) {
      offlineSyncQueue = offlineSyncQueue.slice(-1000);
    }
    saveOfflineQueue();
  }
}

/**
 * Streams media session telemetry directly to Data Hub
 */
function streamMediaSessionUpdate(session, action = 'update') {
  if (!session) return;
  // Strictly filter out internal extension URLs and internal domains
  if (isInternalDomain(session.domain) || isInternalUrl(session.url)) return;
  const isFinalize = action === 'finalize';
  const startedAtSec = (session.timestamp ? session.timestamp : Date.now()) / 1000.0;
  const endedAtSec = isFinalize ? (Date.now() / 1000.0) : null;

  const msg = {
    type: 'SYNC_MEDIA_SESSION',
    session_id: session.id,
    browser_type: detectedBrowser,
    domain: session.domain || 'unknown',
    title: session.title || '',
    url: session.url || '',
    watch_duration_seconds: Math.round(session.watchDuration || 0),
    peak_volume: Math.round(session.peakVolume || 100) / 100.0,
    average_volume: Math.round(session.averageVolume || session.peakVolume || 100) / 100.0,
    resolution_label: session.resolution || '',
    is_playing: isFinalize ? false : Boolean(session.isPlaying),
    has_video: session.mediaType === 'video',
    action: action,
    started_at: startedAtSec,
    ended_at: endedAtSec,
    timestamp: Date.now()
  };

  if (dataHubConnected && dataHubWs && dataHubWs.readyState === WebSocket.OPEN) {
    sendDataHubMessage(msg);
  }
}

/**
 * Returns formatted YYYY-MM-DD string for current local date
 */
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Classifies if a domain represents an internal browser scheme or extension page
 */
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
    d === 'web' ||
    d === 'unknown' ||
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

/**
 * Classifies if a URL represents an internal browser scheme, extension page, or dashboard
 */
function isInternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim().toLowerCase();
  if (
    u.startsWith('chrome-extension://') ||
    u.startsWith('edge-extension://') ||
    u.startsWith('moz-extension://') ||
    u.startsWith('extension://') ||
    u.startsWith('chrome://') ||
    u.startsWith('edge://') ||
    u.startsWith('about:') ||
    u.startsWith('data:') ||
    u.startsWith('blob:chrome-extension://') ||
    u.startsWith('blob:edge-extension://') ||
    u === 'newtab' ||
    u === 'about:blank' ||
    u === 'about:newtab'
  ) {
    return true;
  }
  // Check if it's the extension's dashboard HTML file
  if (u.includes('dashboard/dashboard.html') || u.endsWith('/dashboard.html') || u.endsWith('dashboard.html')) {
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      return true;
    }
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
        return true;
      }
    } catch (_) {}
  }
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === 'chrome-extension:' ||
      parsed.protocol === 'edge-extension:' ||
      parsed.protocol === 'moz-extension:' ||
      parsed.protocol === 'extension:' ||
      parsed.protocol === 'chrome:' ||
      parsed.protocol === 'edge:' ||
      parsed.protocol === 'about:'
    ) {
      return true;
    }
  } catch (_) {}
  return false;
}

/**
 * Extracts clean domain name from URL.
 * Accurately classifies HTTP/HTTPS domains, extension pages (Dashboard / Extension),
 * and internal browser schemes (chrome, edge, about, newtab).
 */
function extractDomain(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.hostname.toLowerCase();
    }
    // Extension pages (Dashboard or Extension)
    if (
      parsed.protocol === 'chrome-extension:' ||
      parsed.protocol === 'edge-extension:' ||
      parsed.protocol === 'moz-extension:' ||
      parsed.protocol === 'extension:'
    ) {
      if (parsed.pathname && parsed.pathname.includes('dashboard')) {
        return 'Dashboard';
      }
      return 'Extension';
    }
    // Internal browser schemes
    if (parsed.protocol === 'chrome:' || parsed.protocol === 'edge:' || parsed.protocol === 'about:') {
      const scheme = parsed.protocol.replace(':', '');
      const host = parsed.hostname ? parsed.hostname.toLowerCase() : '';
      const path = parsed.pathname ? parsed.pathname.toLowerCase() : '';
      if (host === 'newtab' || path === 'newtab' || url.includes('newtab')) {
        return 'newtab';
      }
      if (host) {
        return `${scheme}://${host}`;
      }
      if (path && path !== '/' && path !== 'blank') {
        return `${scheme}:${path}`;
      }
      return scheme;
    }
  } catch (e) {}
  return null;
}

/**
 * Generates default Google favicon URL for domain
 */
function getFaviconUrl(domain) {
  if (!domain || domain.includes(':') || isInternalDomain(domain)) {
    return 'icons/icon32.png';
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

/**
 * Extracts a canonical media identifier from a media or tab URL.
 * Accurately isolates YouTube watch IDs (?v=...), Shorts (/shorts/...), and standard URLs.
 * 
 * @param {string} url Target URL
 * @returns {string} Canonical ID or normalized URL pathname
 */
function extractCanonicalMediaId(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url);
    if (u.searchParams && u.searchParams.has('v')) {
      const v = u.searchParams.get('v');
      if (v) return `yt_${v}`;
    }
    if (u.pathname && u.pathname.includes('/shorts/')) {
      const parts = u.pathname.split('/shorts/')[1];
      if (parts) {
        const sid = parts.split('/')[0].split('?')[0];
        if (sid) return `yt_shorts_${sid}`;
      }
    }
    return `${u.hostname}${u.pathname}`;
  } catch (_) {
    return url;
  }
}

// Storage Synchronization State
let isStorageLoaded = false;
let storageLoadPromise = null;

/**
 * Ensures storage is fully loaded into memory before processing requests
 * Eliminates race conditions on service worker restart or reload
 */
function ensureStorageLoaded() {
  if (isStorageLoaded) return Promise.resolve();
  if (!storageLoadPromise) {
    storageLoadPromise = loadStorageData();
  }
  return storageLoadPromise;
}

let saveStorageTimeout = null;
let isSaving = false;

/**
 * Debounced and immediate persistent flush to chrome.storage.local
 */
function scheduleStorageSave(immediate = false) {
  if (!isStorageLoaded) return;
  if (saveStorageTimeout) {
    clearTimeout(saveStorageTimeout);
    saveStorageTimeout = null;
  }
  if (immediate) {
    return saveStorageData();
  } else {
    saveStorageTimeout = setTimeout(() => {
      saveStorageTimeout = null;
      saveStorageData();
    }, 1500); // 1.5s debounce: balances SSD write cycles and crash resilience
  }
}

/**
 * Initializes and loads persistent data from storage with safe deep-merge
 */
async function loadStorageData() {
  try {
    const keys = [
      CONFIG.STORAGE_KEY,
      CONFIG.MEDIA_HISTORY_STORAGE_KEY,
      CONFIG.SETTINGS_STORAGE_KEY,
      CONFIG.OFFLINE_QUEUE_STORAGE_KEY,
      CONFIG.CLIENT_ID_STORAGE_KEY,
      'language',
      'sentinel_sleep_timer',
      'sentinel_sleep_settings',
      'sentinel_focus_timer',
      'sentinel_focus_settings',
      'daily_focus_metrics',
      'sentinel_tracking_paused',
      'tracking_blacklist',
      'domain_budgets'
    ];
    const res = await browserAPI.storage.local.get(keys);
    if (res && res[CONFIG.CLIENT_ID_STORAGE_KEY]) {
      clientId = res[CONFIG.CLIENT_ID_STORAGE_KEY];
    }
    if (res && Array.isArray(res.tracking_blacklist)) {
      trackingBlacklist = res.tracking_blacklist;
    }
    if (res && res.domain_budgets && typeof res.domain_budgets === 'object') {
      domainBudgets = res.domain_budgets;
    }
    if (res && Array.isArray(res[CONFIG.OFFLINE_QUEUE_STORAGE_KEY])) {
      offlineSyncQueue = res[CONFIG.OFFLINE_QUEUE_STORAGE_KEY];
    }
    if (res && res[CONFIG.STORAGE_KEY] && typeof res[CONFIG.STORAGE_KEY] === 'object') {
      const stored = res[CONFIG.STORAGE_KEY];
      const storedDomains = (stored.domains && typeof stored.domains === 'object') ? stored.domains : {};

      // Deep merge stored history with in-memory tracking
      const mergedDomains = { ...storedDomains };
      if (activityData && activityData.domains) {
        for (const [dom, domVal] of Object.entries(activityData.domains)) {
          if (!mergedDomains[dom]) {
            mergedDomains[dom] = domVal;
          } else {
            mergedDomains[dom] = {
              favicon: domVal.favicon || mergedDomains[dom].favicon || getFaviconUrl(dom),
              totalSeconds: Math.max(Number(domVal.totalSeconds) || 0, Number(mergedDomains[dom].totalSeconds) || 0),
              foregroundSeconds: Math.max(Number(domVal.foregroundSeconds) || 0, Number(mergedDomains[dom].foregroundSeconds) || (Number(mergedDomains[dom].totalSeconds) || 0)),
              backgroundMediaSeconds: Math.max(Number(domVal.backgroundMediaSeconds) || 0, Number(mergedDomains[dom].backgroundMediaSeconds) || 0),
              sessionCount: Math.max(Number(domVal.sessionCount) || 1, Number(mergedDomains[dom].sessionCount) || 1),
              lastActive: Math.max(Number(domVal.lastActive) || 0, Number(mergedDomains[dom].lastActive) || 0),
              days: {
                ...(mergedDomains[dom].days || {}),
                ...(domVal.days || {})
              }
            };
          }
        }
      }

      activityData = {
        domains: mergedDomains,
        historyDaysCount: Math.max(Number(stored.historyDaysCount) || 1, Number(activityData.historyDaysCount) || 1),
        firstTrackedDate: stored.firstTrackedDate || activityData.firstTrackedDate || getTodayDateString(),
        lastUpdated: Math.max(Number(stored.lastUpdated) || 0, Date.now())
      };
    } else {
      if (!activityData.domains) activityData.domains = {};
    }

    if (res && Array.isArray(res[CONFIG.MEDIA_HISTORY_STORAGE_KEY])) {
      const validItems = res[CONFIG.MEDIA_HISTORY_STORAGE_KEY].filter(m => {
        if (!m || typeof m !== 'object' || !m.id) return false;
        if (isInternalDomain(m.domain || m.platform) || isInternalUrl(m.url)) return false;
        const dur = Number(m.watchDuration ?? m.watch_duration_seconds ?? m.duration ?? 0);
        return dur >= 5;
      });
      const existingIds = new Set(mediaHistory.map(m => m.id));
      const filtered = validItems.filter(m => !existingIds.has(m.id));
      mediaHistory = [...mediaHistory, ...filtered].slice(0, CONFIG.MAX_MEDIA_HISTORY);
      if (validItems.length !== res[CONFIG.MEDIA_HISTORY_STORAGE_KEY].length) {
        saveMediaHistory();
      }
    } else if (!Array.isArray(mediaHistory)) {
      mediaHistory = [];
    }

    if (res && res[CONFIG.SETTINGS_STORAGE_KEY]) {
      settings = { ...settings, ...res[CONFIG.SETTINGS_STORAGE_KEY] };
      if (settings.idleThresholdSeconds) {
        CONFIG.IDLE_THRESHOLD_SECONDS = settings.idleThresholdSeconds;
      }
      if (settings.wsUrl) {
        CONFIG.WS_URL = settings.wsUrl;
      }
    }
    if (res && res.language) {
      settings.language = res.language;
    } else if (settings.language) {
      await browserAPI.storage.local.set({ language: settings.language });
    }

    // Hydrate Sleep Timer and Inactivity Settings from persistent storage
    if (res && res.sentinel_sleep_settings) {
      sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS, ...res.sentinel_sleep_settings };
    }
    if (res && res.sentinel_sleep_timer) {
      sleepTimerState = { ...INITIAL_SLEEP_TIMER_STATE, ...res.sentinel_sleep_timer };
      const now = Date.now();
      if (sleepTimerState.state === 'RUNNING' && sleepTimerState.targetTime <= now) {
        sleepTimerState.state = 'TRIGGERED';
        sleepTimerState.triggeredAt = now;
        saveSleepTimerState();
        clearActionBadge();
        await purgeSleepTimerAlarms();
      } else if (sleepTimerState.state === 'RUNNING') {
        const remainingMs = sleepTimerState.targetTime - now;
        updateActionBadge(remainingMs, sleepTimerState.durationMs);
      } else if (sleepTimerState.state === 'IDLE' || sleepTimerState.state === 'CANCELLED') {
        await purgeSleepTimerAlarms();
      }
    } else {
      await purgeSleepTimerAlarms();
    }

    // Hydrate Focus Sentinel & Timer Settings from persistent storage
    if (res && res.sentinel_focus_settings) {
      focusTimerSettings = { ...DEFAULT_FOCUS_SETTINGS, ...res.sentinel_focus_settings };
    }
    if (res && res.daily_focus_metrics && typeof res.daily_focus_metrics === 'object') {
      dailyFocusMetrics = res.daily_focus_metrics;
    }
    if (res && res.sentinel_focus_timer) {
      focusTimerState = { ...INITIAL_FOCUS_TIMER_STATE, ...res.sentinel_focus_timer };
      const now = Date.now();
      if ((focusTimerState.state === 'RUNNING_FOCUS' || focusTimerState.state === 'RUNNING_BREAK') && focusTimerState.targetTime) {
        if (focusTimerState.targetTime <= now) {
          if (focusTimerState.mode === 'focus') {
            await handleFocusTimerExpired();
          } else {
            await handleFocusBreakExpired();
          }
        } else {
          focusTimerState.remainingSeconds = Math.max(0, Math.round((focusTimerState.targetTime - now) / 1000));
          try {
            browserAPI.alarms.create(focusTimerState.mode === 'focus' ? FOCUS_TIMER_ALARM_NAME : FOCUS_BREAK_ALARM_NAME, { when: focusTimerState.targetTime });
          } catch (_) {}
          if (focusTimerSettings.showBadgeCountdown) {
            updateFocusActionBadge(focusTimerState.targetTime - now);
          }
        }
      }
    }

    if (res && typeof res.sentinel_tracking_paused === 'boolean') {
      isTrackingPaused = res.sentinel_tracking_paused;
    }
  } catch (e) {
    console.error('[MediaSentinel] Error loading storage:', e);
  } finally {
    isStorageLoaded = true;
  }
}

// =============================================================================
// Sleep Timer & Inactivity Subsystem Engine (Alarms, FSM & Volume Fade)
// =============================================================================

/**
 * Loads sleep timer state and configuration from chrome.storage.local
 */
async function loadSleepTimerData() {
  try {
    const data = await browserAPI.storage.local.get(['sentinel_sleep_timer', 'sentinel_sleep_settings']);
    if (data && data.sentinel_sleep_settings) {
      sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS, ...data.sentinel_sleep_settings };
    }
    if (data && data.sentinel_sleep_timer) {
      sleepTimerState = { ...INITIAL_SLEEP_TIMER_STATE, ...data.sentinel_sleep_timer };
      const now = Date.now();
      if (sleepTimerState.state === 'RUNNING' && sleepTimerState.targetTime <= now) {
        sleepTimerState.state = 'TRIGGERED';
        sleepTimerState.triggeredAt = now;
        await saveSleepTimerState();
        clearActionBadge();
        await purgeSleepTimerAlarms();
      } else if (sleepTimerState.state === 'RUNNING') {
        const remainingMs = sleepTimerState.targetTime - now;
        updateActionBadge(remainingMs, sleepTimerState.durationMs);
      } else if (sleepTimerState.state === 'IDLE' || sleepTimerState.state === 'CANCELLED') {
        await purgeSleepTimerAlarms();
      }
    } else {
      await purgeSleepTimerAlarms();
    }
  } catch (err) {
    console.error('[MediaSentinel] Failed to load sleep timer storage:', err);
  }
}

/**
 * Persists sleep timer state to chrome.storage.local
 */
async function saveSleepTimerState() {
  try {
    sleepTimerState.lastUpdated = Date.now();
    await browserAPI.storage.local.set({ sentinel_sleep_timer: sleepTimerState });
  } catch (err) {
    console.error('[MediaSentinel] Failed to save sleep timer state:', err);
  }
}

/**
 * Persists user sleep settings to chrome.storage.local
 */
async function saveSleepTimerSettings(newSettings) {
  try {
    sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS, ...sleepTimerSettings, ...newSettings };
    await browserAPI.storage.local.set({ sentinel_sleep_settings: sleepTimerSettings });
    if (!sleepTimerSettings.showBadgeCountdown) {
      clearActionBadge();
    } else if (sleepTimerState.state === 'RUNNING') {
      updateActionBadge(sleepTimerState.targetTime - Date.now(), sleepTimerState.durationMs);
    }
  } catch (err) {
    console.error('[MediaSentinel] Failed to save sleep settings:', err);
  }
}

/**
 * Schedules deterministic MV3 chrome.alarms for timer expiration and audio fade
 */
async function scheduleSleepTimerAlarms(state) {
  try {
    await purgeSleepTimerAlarms();

    if (state.state !== 'RUNNING') return;

    const now = Date.now();
    const remainingMs = state.targetTime - now;

    if (remainingMs <= 0) {
      await triggerSleepTimerExpiration();
      return;
    }

    // Schedule final cutoff alarm
    browserAPI.alarms.create(SLEEP_ALARM_NAME, { when: state.targetTime });

    // Schedule fade alarm if enabled
    if (state.enableFadeOut && remainingMs > (state.fadeDurationSeconds * 1000)) {
      const fadeTarget = state.targetTime - (state.fadeDurationSeconds * 1000);
      browserAPI.alarms.create(SLEEP_FADE_ALARM_NAME, { when: fadeTarget });
    }
  } catch (err) {
    console.error('[MediaSentinel] Error scheduling sleep alarms:', err);
  }
}

/**
 * Memory-saver tab hibernation: discards background non-pinned tabs on sleep timer expire
 */
async function executeTabHibernationOnSleepExpire() {
  try {
    const hibData = await browserAPI.storage.local.get(['sentinel_sleep_adv_tab_hibernate']);
    const isHibernate = hibData && (hibData.sentinel_sleep_adv_tab_hibernate === true || hibData.sentinel_sleep_adv_tab_hibernate === 'true');
    if (!isHibernate) return;
    if (browserAPI && browserAPI.tabs && typeof browserAPI.tabs.query === 'function' && typeof browserAPI.tabs.discard === 'function') {
      const tabs = await browserAPI.tabs.query({ active: false, pinned: false });
      for (const tab of tabs) {
        if (tab && tab.id) {
          browserAPI.tabs.discard(tab.id).catch(() => {});
        }
      }
    }
  } catch (_) {}
}

/**
 * Triggers sleep timer expiration: marks TRIGGERED, clears badge, pauses media, commits tracking
 */
async function triggerSleepTimerExpiration() {
  await ensureStorageLoaded();
  if (!sleepTimerState || (sleepTimerState.state !== 'RUNNING' && sleepTimerState.state !== 'FADING') || (sleepTimerState.targetTime !== undefined && sleepTimerState.targetTime <= 0)) {
    console.info('[MediaSentinel] Sleep timer expiration skipped: timer not active', sleepTimerState ? sleepTimerState.state : 'null');
    await purgeSleepTimerAlarms();
    return;
  }

  console.info('[MediaSentinel] 🌙 Sleep timer expired! Triggering configured timeout action.');
  sleepTimerState.state = 'TRIGGERED';
  sleepTimerState.triggeredAt = Date.now();
  await saveSleepTimerState();
  await purgeSleepTimerAlarms();
  clearActionBadge();

  const action = String(
    sleepTimerState.timeoutAction || 
    sleepTimerState.timeout_action || 
    (typeof sleepTimerSettings !== 'undefined' && (sleepTimerSettings.timeoutAction || sleepTimerSettings.timeout_action)) || 
    (sleepTimerState.pauseMedia ? 'pause' : 'none')
  ).toLowerCase();

  if (action === 'mute') {
    if (typeof handleMuteAllExecution === 'function') await handleMuteAllExecution();
  } else if (action === 'close' || action === 'close_tab') {
    if (typeof dispatchGlobalMediaAction === 'function') await dispatchGlobalMediaAction('PAUSE_ALL').catch(() => {});
    await closeAllMediaTabs();
  } else if (action === 'pause' || sleepTimerState.pauseMedia) {
    if (typeof dispatchGlobalMediaAction === 'function') await dispatchGlobalMediaAction('PAUSE_ALL');
  }

  if (sleepTimerState.pauseTracking) {
    commitActiveInterval();
    scheduleStorageSave(true);
  }

  if (typeof executeTabHibernationOnSleepExpire === 'function') {
    await executeTabHibernationOnSleepExpire();
  }

  safeSendRuntimeMessage({
    action: 'SLEEP_TIMER_EXPIRED',
    type: 'SLEEP_TIMER_EXPIRED',
    state: sleepTimerState
  });
}

/**
 * Safely purges sleep timer and volume fade alarms from browser alarms API
 */
async function purgeSleepTimerAlarms() {
  try {
    if (browserAPI && browserAPI.alarms && typeof browserAPI.alarms.clear === 'function') {
      await browserAPI.alarms.clear(SLEEP_ALARM_NAME);
      await browserAPI.alarms.clear(SLEEP_FADE_ALARM_NAME);
    }
  } catch (_) {}
}

/**
 * Closes all candidate media tabs when sleep timer expires with action 'close'
 * @returns {Promise<{success: boolean, closedCount: number}>}
 */
async function closeAllMediaTabs() {
  let tabsToClose = [];
  if (typeof collectCandidateTabs === 'function') {
    tabsToClose = await collectCandidateTabs();
  } else if (browserAPI && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
    const all = await browserAPI.tabs.query({}).catch(() => []);
    tabsToClose = (all || []).map(t => t.id).filter(Boolean);
  }
  let closedCount = 0;
  for (const tabId of tabsToClose) {
    try {
      if (browserAPI && browserAPI.tabs && typeof browserAPI.tabs.remove === 'function') {
        await browserAPI.tabs.remove(tabId).catch(() => {});
        closedCount++;
      }
    } catch (_) {}
  }
  return { success: true, closedCount };
}

/**
 * Triggers pre-expiration volume fade across active media tabs
 */
async function triggerSleepTimerFade() {
  await ensureStorageLoaded();
  if (!sleepTimerState || sleepTimerState.state !== 'RUNNING' || (sleepTimerState.targetTime !== undefined && sleepTimerState.targetTime <= 0)) {
    console.info('[MediaSentinel] Sleep timer fade skipped: timer not in RUNNING state');
    await purgeSleepTimerAlarms();
    return;
  }
  sleepTimerState.state = 'FADING';
  await saveSleepTimerState();

  const targetTabs = new Set([
    ...Array.from(activeMediaSessions.keys()),
    ...Array.from(tabMediaMap.keys())
  ]);

  for (const tabId of targetTabs) {
    safeSendTabMessage(tabId, {
      action: 'FADE_AND_PAUSE',
      type: 'FADE_AND_PAUSE',
      fadeDurationSeconds: sleepTimerState.fadeDurationSeconds || 30
    });
  }
}

/**
 * Sets a new sleep timer with specified duration and options
 */
async function setSleepTimer(durationMinutes, options = {}) {
  const rawMins = parseInt(durationMinutes, 10);
  const mins = isNaN(rawMins) ? 30 : Math.max(1, Math.min(1440, rawMins));
  const now = Date.now();
  const durationMs = mins * 60 * 1000;

  sleepTimerState = {
    state: 'RUNNING',
    durationMinutes: mins,
    durationMs: durationMs,
    startTime: now,
    targetTime: now + durationMs,
    pauseMedia: options.pauseMedia !== undefined ? !!options.pauseMedia : true,
    pauseTracking: options.pauseTracking !== undefined ? !!options.pauseTracking : true,
    enableFadeOut: options.enableFadeOut !== undefined ? !!options.enableFadeOut : sleepTimerSettings.enableAudioFadeOut,
    fadeDurationSeconds: options.fadeDurationSeconds || sleepTimerSettings.fadeDurationSeconds,
    endOfVideo: options.endOfVideo !== undefined ? !!options.endOfVideo : (sleepTimerSettings.endOfVideo || false),
    lastUpdated: now
  };

  await saveSleepTimerState();
  await scheduleSleepTimerAlarms(sleepTimerState);
  if (sleepTimerSettings.showBadgeCountdown) {
    updateActionBadge(durationMs, durationMs);
  }

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return sleepTimerState;
}

/**
 * Cancels active sleep timer and resets state
 */
async function cancelSleepTimer() {
  await purgeSleepTimerAlarms();

  sleepTimerState = {
    ...INITIAL_SLEEP_TIMER_STATE,
    state: 'CANCELLED',
    lastUpdated: Date.now()
  };
  await saveSleepTimerState();
  clearActionBadge();

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return { success: true, state: sleepTimerState };
}

/**
 * Pauses active sleep timer, preserves remaining time, and cancels pending alarms
 */
async function pauseSleepTimer() {
  await ensureStorageLoaded();
  if (sleepTimerState.state !== 'RUNNING' && sleepTimerState.state !== 'FADING') {
    return { success: false, error: 'Timer is not active', state: sleepTimerState };
  }

  const now = Date.now();
  const remainingMs = Math.max(0, sleepTimerState.targetTime - now);

  try {
    await browserAPI.alarms.clear(SLEEP_ALARM_NAME);
    await browserAPI.alarms.clear(SLEEP_FADE_ALARM_NAME);
  } catch (_) {}

  sleepTimerState = {
    ...sleepTimerState,
    state: 'PAUSED',
    remainingMs: remainingMs,
    pausedAt: now,
    lastUpdated: now
  };

  await saveSleepTimerState();
  clearActionBadge();

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return { success: true, state: sleepTimerState };
}

/**
 * Resumes paused sleep timer, calculates new target epoch, and reschedules alarms
 */
async function resumeSleepTimer() {
  await ensureStorageLoaded();
  if (sleepTimerState.state !== 'PAUSED') {
    return { success: false, error: 'Timer is not paused', state: sleepTimerState };
  }

  const now = Date.now();
  const remainingMs = sleepTimerState.remainingMs || (sleepTimerState.durationMinutes * 60 * 1000) || 60000;
  const newTargetTime = now + remainingMs;

  sleepTimerState = {
    ...sleepTimerState,
    state: 'RUNNING',
    startTime: now - ((sleepTimerState.durationMs || 1800000) - remainingMs),
    targetTime: newTargetTime,
    lastUpdated: now
  };
  delete sleepTimerState.remainingMs;
  delete sleepTimerState.pausedAt;

  await saveSleepTimerState();
  await scheduleSleepTimerAlarms(sleepTimerState);

  if (sleepTimerSettings.showBadgeCountdown) {
    updateActionBadge(remainingMs, sleepTimerState.durationMs || remainingMs);
  }

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return { success: true, state: sleepTimerState };
}

/**
 * Extends active or paused sleep timer by extra minutes and reschedules alarms
 */
async function extendSleepTimer(extraMinutes) {
  await ensureStorageLoaded();
  const minsToAdd = parseInt(extraMinutes, 10);
  if (isNaN(minsToAdd) || minsToAdd <= 0) {
    return { success: false, error: 'Invalid extraMinutes', state: sleepTimerState };
  }
  const extraMs = minsToAdd * 60 * 1000;
  const now = Date.now();

  if (sleepTimerState.state === 'RUNNING' || sleepTimerState.state === 'FADING') {
    sleepTimerState.durationMinutes = (sleepTimerState.durationMinutes || 0) + minsToAdd;
    sleepTimerState.durationMs = (sleepTimerState.durationMs || 0) + extraMs;
    sleepTimerState.targetTime += extraMs;
    sleepTimerState.lastUpdated = now;
    if (sleepTimerState.state === 'FADING') {
      sleepTimerState.state = 'RUNNING'; // Return to running if extension pushes out past fade window
    }
    await saveSleepTimerState();
    await scheduleSleepTimerAlarms(sleepTimerState);
  } else if (sleepTimerState.state === 'PAUSED') {
    sleepTimerState.durationMinutes = (sleepTimerState.durationMinutes || 0) + minsToAdd;
    sleepTimerState.durationMs = (sleepTimerState.durationMs || 0) + extraMs;
    sleepTimerState.remainingMs = (sleepTimerState.remainingMs || 0) + extraMs;
    sleepTimerState.lastUpdated = now;
    await saveSleepTimerState();
  } else {
    // If IDLE or CANCELLED, start new timer with minsToAdd
    return await setSleepTimer(minsToAdd);
  }

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return { success: true, state: sleepTimerState };
}

/**
 * Triggers immediate sleep expiration if timer has endOfVideo enabled
 */
async function handleEndOfVideoTrigger(tabId) {
  await ensureStorageLoaded();
  if (sleepTimerState.state === 'RUNNING' || sleepTimerState.state === 'FADING') {
    if (sleepTimerState.endOfVideo || sleepTimerSettings.endOfVideo) {
      console.info(`[MediaSentinel] 🎬 End of video reached on tab ${tabId}. Triggering sleep cutoff.`);
      await triggerSleepTimerExpiration();
      return { success: true, triggered: true, state: sleepTimerState };
    }
  }
  return { success: false, triggered: false, state: sleepTimerState };
}

/**
 * Computes dynamic RGB interpolation color between Green, Yellow and Red based on remaining percentage
 */
function calculateTimerColor(remainingMs, totalDurationMs) {
  if (totalDurationMs <= 0) return '#ef4444';
  const ratio = Math.max(0, Math.min(1, remainingMs / totalDurationMs));

  const green = [34, 197, 94];   // #22c55e (> 50%)
  const yellow = [234, 179, 8];   // #eab308 (15% - 50%)
  const red = [239, 68, 68];     // #ef4444 (< 15%)

  let r, g, b;
  if (ratio > 0.5) {
    const factor = (ratio - 0.5) / 0.5;
    r = Math.round(yellow[0] + factor * (green[0] - yellow[0]));
    g = Math.round(yellow[1] + factor * (green[1] - yellow[1]));
    b = Math.round(yellow[2] + factor * (green[2] - yellow[2]));
  } else if (ratio > 0.15) {
    const factor = (ratio - 0.15) / 0.35;
    r = Math.round(red[0] + factor * (yellow[0] - red[0]));
    g = Math.round(red[1] + factor * (yellow[1] - red[1]));
    b = Math.round(red[2] + factor * (yellow[2] - red[2]));
  } else {
    return '#ef4444';
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Updates extension action toolbar badge text and background color in real time
 */
function updateActionBadge(remainingMs, totalDurationMs) {
  if (!browserAPI.action || typeof browserAPI.action.setBadgeText !== 'function') return;
  if (!sleepTimerSettings.showBadgeCountdown || remainingMs <= 0) {
    clearActionBadge();
    return;
  }
  const remainingSec = Math.ceil(remainingMs / 1000);
  const text = remainingSec >= 60 ? `${Math.ceil(remainingSec / 60)}m` : `${remainingSec}s`;
  const color = calculateTimerColor(remainingMs, totalDurationMs);

  try {
    browserAPI.action.setBadgeText({ text });
    browserAPI.action.setBadgeBackgroundColor({ color });
  } catch (_) {}
}

/**
 * Clears extension action toolbar badge text
 */
function clearActionBadge() {
  if (!browserAPI.action || typeof browserAPI.action.setBadgeText !== 'function') return;
  try {
    browserAPI.action.setBadgeText({ text: '' });
  } catch (_) {}
}

/**
 * Updates extension action toolbar badge text and background color for Focus Timer
 */
function updateFocusActionBadge(remainingMs) {
  if (!browserAPI.action || typeof browserAPI.action.setBadgeText !== 'function') return;
  if (sleepTimerState && sleepTimerState.state === 'RUNNING') return;
  if (!focusTimerSettings.showBadgeCountdown || remainingMs <= 0) {
    clearActionBadge();
    return;
  }
  const remainingSec = Math.ceil(remainingMs / 1000);
  const text = remainingSec >= 60 ? `${Math.ceil(remainingSec / 60)}m` : `${remainingSec}s`;
  const color = focusTimerState.mode === 'focus' ? '#10b981' : '#f59e0b';
  try {
    browserAPI.action.setBadgeText({ text });
    browserAPI.action.setBadgeBackgroundColor({ color });
  } catch (_) {}
}

/**
 * Dispatches global play/pause/resume across all active media tabs and sessions
 */
async function dispatchGlobalMediaAction(command = 'TOGGLE') {
  let anyPlaying = false;
  for (const session of activeMediaSessions.values()) {
    if (session.isPlaying) {
      anyPlaying = true;
      break;
    }
  }
  if (!anyPlaying) {
    for (const mState of tabMediaMap.values()) {
      if (mState && (mState.anyPlaying || (mState.primaryMedia && mState.primaryMedia.isPlaying))) {
        anyPlaying = true;
        break;
      }
    }
  }

  const targetAction = (command === 'PAUSE_ALL' || (command === 'TOGGLE' && anyPlaying)) ? 'PAUSE' : 'RESUME';

  const targetTabs = new Set([
    ...Array.from(activeMediaSessions.keys()),
    ...Array.from(tabMediaMap.keys())
  ]);

  for (const tabId of targetTabs) {
    const session = activeMediaSessions.get(tabId);
    if (targetAction === 'PAUSE') {
      if (session) session.isPlaying = false;
      safeSendTabMessage(tabId, { action: 'PAUSE_MEDIA', type: 'PAUSE_MEDIA' });
    } else {
      if (session) {
        session.isPlaying = true;
        session.lastHeartbeat = Date.now();
      }
      safeSendTabMessage(tabId, { action: 'RESUME_MEDIA', type: 'RESUME_MEDIA' });
    }
  }

  return {
    success: true,
    actionExecuted: targetAction,
    isPlaying: targetAction === 'RESUME',
    activeCount: targetTabs.size
  };
}

// =============================================================================
// Focus Sentinel & Pomodoro Subsystem (Phase 2): Storage, FSM, Alarms & Metrics
// =============================================================================

/**
 * Persists focus timer state to chrome.storage.local
 */
async function saveFocusTimerState() {
  try {
    focusTimerState.updatedAt = Date.now();
    await browserAPI.storage.local.set({ sentinel_focus_timer: focusTimerState });
  } catch (err) {
    console.error('[FocusSentinel] Failed to save focus timer state:', err);
  }
}

/**
 * Persists user focus settings to chrome.storage.local
 */
async function saveFocusSettings(newSettings) {
  try {
    focusTimerSettings = { ...DEFAULT_FOCUS_SETTINGS, ...focusTimerSettings, ...newSettings };
    await browserAPI.storage.local.set({ sentinel_focus_settings: focusTimerSettings });
    if (!focusTimerSettings.showBadgeCountdown) {
      if (!sleepTimerState || sleepTimerState.state !== 'RUNNING') {
        clearActionBadge();
      }
    } else if (focusTimerState.state === 'RUNNING_FOCUS' || focusTimerState.state === 'RUNNING_BREAK') {
      if (focusTimerState.targetTime) {
        updateFocusActionBadge(focusTimerState.targetTime - Date.now());
      }
    }
  } catch (err) {
    console.error('[FocusSentinel] Failed to save focus settings:', err);
  }
}

/**
 * Persists daily focus metrics to chrome.storage.local
 */
async function saveDailyFocusMetrics() {
  try {
    await browserAPI.storage.local.set({ daily_focus_metrics: dailyFocusMetrics });
  } catch (err) {
    console.error('[FocusSentinel] Failed to save daily focus metrics:', err);
  }
}

/**
 * Broadcasts focus timer state to open extension views (dashboard, popup)
 */
function broadcastFocusTimerState(eventType = 'FOCUS_TIMER_STATE_CHANGED') {
  safeSendRuntimeMessage({
    type: eventType,
    action: eventType,
    state: focusTimerState,
    settings: focusTimerSettings
  });
}

/**
 * Dispatches pause commands to all active media tabs
 */
async function pauseAllMediaTabs() {
  try {
    await dispatchGlobalMediaAction('PAUSE_ALL');
    const tabs = await browserAPI.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !tab.url || isRestrictedTabUrl(tab.url)) continue;
      safeSendTabMessage(tab.id, { action: 'PAUSE', type: 'PAUSE' });
    }
  } catch (err) {
    console.warn('[FocusSentinel] Media pause dispatch error:', err);
  }
}

// -----------------------------------------------------------------------------
// Focus Advanced Hub: Distraction Detection & Background Auto-Mute Helpers
// -----------------------------------------------------------------------------
const DEFAULT_DISTRACTING_DOMAINS = [
  'youtube.com', 'twitter.com', 'x.com', 'reddit.com',
  'instagram.com', 'facebook.com', 'netflix.com', 'tiktok.com'
];

function isDistractingDomain(domain, url = '') {
  if (!domain) return false;
  const d = String(domain).toLowerCase();
  if (DEFAULT_DISTRACTING_DOMAINS.some(bad => d === bad || d.endsWith('.' + bad))) {
    return true;
  }
  if (typeof matchesTrackingBlacklist === 'function' && url && matchesTrackingBlacklist(url)) {
    return true;
  }
  return false;
}

let autoMutedFocusTabIds = new Set();

async function checkAndAutoMuteBackgroundTab(tabId) {
  try {
    const data = await browserAPI.storage.local.get(['sentinel_focus_adv_automute_bg']);
    const isAutoMute = data && (data.sentinel_focus_adv_automute_bg === true || data.sentinel_focus_adv_automute_bg === 'true');
    if (!isAutoMute) return;
    const tab = await browserAPI.tabs.get(tabId);
    if (tab && !tab.active && tab.audible && !tab.mutedInfo?.muted) {
      await browserAPI.tabs.update(tabId, { muted: true });
      autoMutedFocusTabIds.add(tabId);
    }
  } catch (_) {}
}

async function executeAutoMuteBackgroundTabs(isMute) {
  try {
    if (isMute) {
      const data = await browserAPI.storage.local.get(['sentinel_focus_adv_automute_bg']);
      const isAutoMute = data && (data.sentinel_focus_adv_automute_bg === true || data.sentinel_focus_adv_automute_bg === 'true');
      if (!isAutoMute) return;
      const tabs = await browserAPI.tabs.query({ active: false });
      for (const tab of tabs) {
        if (tab.audible && !tab.mutedInfo?.muted) {
          await browserAPI.tabs.update(tab.id, { muted: true }).catch(() => {});
          autoMutedFocusTabIds.add(tab.id);
        }
      }
    } else {
      for (const tabId of autoMutedFocusTabIds) {
        await browserAPI.tabs.update(tabId, { muted: false }).catch(() => {});
      }
      autoMutedFocusTabIds.clear();
    }
  } catch (_) {}
}

/**
 * Starts a new focus or break session with specified duration
 */
async function startFocusTimer(durationMinutes, mode = 'focus') {
  await ensureStorageLoaded();
  const rawMins = parseInt(durationMinutes, 10);
  const defMins = (mode === 'focus')
    ? (focusTimerSettings.focusDurationMinutes || 25)
    : (focusTimerSettings.shortBreakMinutes || 5);
  const mins = (!isNaN(rawMins) && rawMins > 0) ? rawMins : defMins;

  const now = Date.now();
  const durationMs = mins * 60 * 1000;
  const targetTime = now + durationMs;

  try {
    await browserAPI.alarms.clear(FOCUS_TIMER_ALARM_NAME);
    await browserAPI.alarms.clear(FOCUS_BREAK_ALARM_NAME);
  } catch (_) {}

  focusTimerState = {
    ...focusTimerState,
    state: mode === 'focus' ? 'RUNNING_FOCUS' : 'RUNNING_BREAK',
    mode,
    durationMinutes: mins,
    remainingSeconds: mins * 60,
    targetTime,
    sessionStartedAt: now,
    pausedAt: null,
    updatedAt: now
  };

  try {
    browserAPI.alarms.create(mode === 'focus' ? FOCUS_TIMER_ALARM_NAME : FOCUS_BREAK_ALARM_NAME, { when: targetTime });
  } catch (_) {}

  if (focusTimerState.autoPauseMedia && mode === 'focus') {
    await pauseAllMediaTabs();
  }

  if (mode === 'focus') {
    await executeAutoMuteBackgroundTabs(true);
  }

  if (focusTimerSettings.showBadgeCountdown) {
    updateFocusActionBadge(durationMs);
  }

  await saveFocusTimerState();
  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');

  return { success: true, state: focusTimerState };
}

/**
 * Pauses active focus or break timer
 */
async function pauseFocusTimer() {
  await ensureStorageLoaded();
  if (focusTimerState.state !== 'RUNNING_FOCUS' && focusTimerState.state !== 'RUNNING_BREAK') {
    return { success: false, error: 'Timer is not running', state: focusTimerState };
  }

  const now = Date.now();
  const remainingSeconds = Math.max(0, Math.round(((focusTimerState.targetTime || now) - now) / 1000));

  try {
    await browserAPI.alarms.clear(FOCUS_TIMER_ALARM_NAME);
    await browserAPI.alarms.clear(FOCUS_BREAK_ALARM_NAME);
  } catch (_) {}

  focusTimerState = {
    ...focusTimerState,
    state: focusTimerState.mode === 'focus' ? 'PAUSED_FOCUS' : 'PAUSED_BREAK',
    pausedAt: now,
    remainingSeconds: remainingSeconds,
    targetTime: null,
    updatedAt: now
  };

  await executeAutoMuteBackgroundTabs(false);

  if (!sleepTimerState || sleepTimerState.state !== 'RUNNING') {
    clearActionBadge();
  }

  await saveFocusTimerState();
  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');

  return { success: true, state: focusTimerState };
}

/**
 * Resumes paused focus or break timer
 */
async function resumeFocusTimer() {
  await ensureStorageLoaded();
  if (focusTimerState.state !== 'PAUSED_FOCUS' && focusTimerState.state !== 'PAUSED_BREAK') {
    return { success: false, error: 'Timer is not paused', state: focusTimerState };
  }

  const now = Date.now();
  const remainingSec = focusTimerState.remainingSeconds || (focusTimerState.durationMinutes * 60) || 1500;
  const targetTime = now + (remainingSec * 1000);

  focusTimerState = {
    ...focusTimerState,
    state: focusTimerState.mode === 'focus' ? 'RUNNING_FOCUS' : 'RUNNING_BREAK',
    targetTime,
    pausedAt: null,
    updatedAt: now
  };

  try {
    await browserAPI.alarms.clear(FOCUS_TIMER_ALARM_NAME);
    await browserAPI.alarms.clear(FOCUS_BREAK_ALARM_NAME);
  } catch (_) {}

  try {
    browserAPI.alarms.create(focusTimerState.mode === 'focus' ? FOCUS_TIMER_ALARM_NAME : FOCUS_BREAK_ALARM_NAME, { when: targetTime });
  } catch (_) {}

  if (focusTimerState.mode === 'focus') {
    await executeAutoMuteBackgroundTabs(true);
  }

  if (focusTimerSettings.showBadgeCountdown) {
    updateFocusActionBadge(remainingSec * 1000);
  }

  await saveFocusTimerState();
  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');

  return { success: true, state: focusTimerState };
}

/**
 * Extends active or paused focus timer by extra minutes (supports negative delta, clamped to >= 60s)
 */
async function extendFocusTimer(extraMinutes = 5) {
  await ensureStorageLoaded();
  const minsToAdd = parseInt(extraMinutes, 10);
  if (isNaN(minsToAdd) || minsToAdd === 0) {
    return { success: false, error: 'Invalid extraMinutes', state: focusTimerState };
  }

  const extraSec = minsToAdd * 60;
  const currentSec = focusTimerState.remainingSeconds || (focusTimerState.durationMinutes || 25) * 60;
  const newSec = Math.max(60, currentSec + extraSec); // Enforce minimum 60s floor
  
  focusTimerState.remainingSeconds = newSec;
  focusTimerState.durationMinutes = Math.max(1, Math.round(newSec / 60));

  const now = Date.now();
  if (focusTimerState.state === 'RUNNING_FOCUS' || focusTimerState.state === 'RUNNING_BREAK') {
    focusTimerState.targetTime = now + (newSec * 1000);
    try {
      await browserAPI.alarms.clear(FOCUS_TIMER_ALARM_NAME);
      await browserAPI.alarms.clear(FOCUS_BREAK_ALARM_NAME);
    } catch (_) {}
    try {
      browserAPI.alarms.create(
        focusTimerState.mode === 'focus' ? FOCUS_TIMER_ALARM_NAME : FOCUS_BREAK_ALARM_NAME,
        { when: focusTimerState.targetTime }
      );
    } catch (_) {}
    if (focusTimerSettings.showBadgeCountdown) {
      updateFocusActionBadge(focusTimerState.targetTime - now);
    }
  }

  focusTimerState.updatedAt = now;
  await saveFocusTimerState();
  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');

  return { success: true, state: focusTimerState };
}

/**
 * Resets focus timer to initial idle state
 */
async function resetFocusTimer() {
  await ensureStorageLoaded();
  try {
    await browserAPI.alarms.clear(FOCUS_TIMER_ALARM_NAME);
    await browserAPI.alarms.clear(FOCUS_BREAK_ALARM_NAME);
  } catch (_) {}

  const defMins = focusTimerSettings.focusDurationMinutes || 25;
  focusTimerState = {
    ...INITIAL_FOCUS_TIMER_STATE,
    durationMinutes: defMins,
    remainingSeconds: defMins * 60,
    completedSessionsToday: focusTimerState.completedSessionsToday || 0,
    updatedAt: Date.now()
  };

  await executeAutoMuteBackgroundTabs(false);

  if (!sleepTimerState || sleepTimerState.state !== 'RUNNING') {
    clearActionBadge();
  }

  await saveFocusTimerState();
  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');

  return { success: true, state: focusTimerState };
}

/**
 * Handles expiration of a focus block
 */
async function handleFocusTimerExpired() {
  await ensureStorageLoaded();
  console.info('[FocusSentinel] 🧘 Focus block completed! Incrementing metrics and updating state.');

  await executeAutoMuteBackgroundTabs(false);

  const now = Date.now();
  const todayKey = new Date().toISOString().split('T')[0];

  if (!dailyFocusMetrics[todayKey]) {
    dailyFocusMetrics[todayKey] = {
      date: todayKey,
      totalFocusSeconds: 0,
      completedSessions: 0,
      interruptedSessions: 0,
      sessionHistory: []
    };
  }

  const sessionDurationSec = (focusTimerState.durationMinutes || 25) * 60;
  dailyFocusMetrics[todayKey].totalFocusSeconds += sessionDurationSec;
  dailyFocusMetrics[todayKey].completedSessions += 1;
  dailyFocusMetrics[todayKey].sessionHistory.push({
    startedAt: focusTimerState.sessionStartedAt || (now - sessionDurationSec * 1000),
    completedAt: now,
    durationMinutes: focusTimerState.durationMinutes || 25,
    mode: 'focus'
  });

  focusTimerState.completedSessionsToday = dailyFocusMetrics[todayKey].completedSessions;

  await saveDailyFocusMetrics();

  // Create native desktop notification if enabled
  try {
    if (browserAPI.notifications && typeof browserAPI.notifications.create === 'function') {
      browserAPI.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '🧘 Focus Block Completed!',
        message: 'Great job! Time to take a restful break.'
      });
    }
  } catch (_) {}

  if (focusTimerSettings.autoStartBreak) {
    const isLong = (dailyFocusMetrics[todayKey].completedSessions % (focusTimerSettings.sessionsBeforeLongBreak || 4)) === 0;
    const breakMins = isLong ? (focusTimerSettings.longBreakMinutes || 15) : (focusTimerSettings.shortBreakMinutes || 5);
    await startFocusTimer(breakMins, 'break');
  } else {
    focusTimerState = {
      ...focusTimerState,
      state: 'COMPLETED',
      remainingSeconds: 0,
      targetTime: null,
      updatedAt: now
    };
    if (!sleepTimerState || sleepTimerState.state !== 'RUNNING') {
      clearActionBadge();
    }
    await saveFocusTimerState();
  }

  safeSendRuntimeMessage({
    type: 'FOCUS_TIMER_COMPLETED',
    action: 'FOCUS_TIMER_COMPLETED',
    state: focusTimerState,
    todayMetrics: dailyFocusMetrics[todayKey]
  });

  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');
}

/**
 * Handles expiration of a break block
 */
async function handleFocusBreakExpired() {
  await ensureStorageLoaded();
  console.info('[FocusSentinel] ⚡ Break completed! Ready for next focus block.');
  const now = Date.now();

  try {
    if (browserAPI.notifications && typeof browserAPI.notifications.create === 'function') {
      browserAPI.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '⚡ Break Finished!',
        message: 'Break is over. Ready to begin your next focus block!'
      });
    }
  } catch (_) {}

  if (focusTimerSettings.autoStartNextFocus) {
    await startFocusTimer(focusTimerSettings.focusDurationMinutes || 25, 'focus');
  } else {
    const defMins = focusTimerSettings.focusDurationMinutes || 25;
    focusTimerState = {
      ...INITIAL_FOCUS_TIMER_STATE,
      durationMinutes: defMins,
      remainingSeconds: defMins * 60,
      completedSessionsToday: focusTimerState.completedSessionsToday || 0,
      updatedAt: now
    };
    if (!sleepTimerState || sleepTimerState.state !== 'RUNNING') {
      clearActionBadge();
    }
    await saveFocusTimerState();
  }

  safeSendRuntimeMessage({
    type: 'FOCUS_BREAK_COMPLETED',
    action: 'FOCUS_BREAK_COMPLETED',
    state: focusTimerState
  });

  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');
}

/**
 * Gathers candidate tab IDs playing media in tabs other than the newly active/created tab
 * @param {number} activeTabId
 * @returns {Set<number>}
 */
function collectAutoPauseTargetTabs(activeTabId) {
  const targetTabIds = new Set();
  const globalMedia = synthesizeGlobalMediaState();
  if (globalMedia && globalMedia.primaryMedia && globalMedia.primaryMedia.isPlaying) {
    const pmTabId = Number(globalMedia.primaryMedia.tabId);
    if (pmTabId && pmTabId !== activeTabId) targetTabIds.add(pmTabId);
  }
  if (typeof tabMediaMap !== 'undefined' && tabMediaMap.forEach) {
    tabMediaMap.forEach((mState, tId) => {
      const numTabId = Number(tId);
      if (numTabId && numTabId !== activeTabId && mState) {
        if (mState.anyPlaying || (mState.primaryMedia && mState.primaryMedia.isPlaying)) {
          targetTabIds.add(numTabId);
        }
      }
    });
  }
  if (typeof activeMediaSessions !== 'undefined' && activeMediaSessions.forEach) {
    activeMediaSessions.forEach((session, tId) => {
      const numTabId = Number(tId);
      if (numTabId && numTabId !== activeTabId && session && session.isPlaying) {
        targetTabIds.add(numTabId);
      }
    });
  }
  return targetTabIds;
}

/**
 * Safely sends pause control commands to a specific tab
 * @param {number} tabId
 * @returns {Promise<boolean>}
 */
async function executeTabMediaPause(tabId) {
  try {
    let tab = null;
    if (browserAPI.tabs && typeof browserAPI.tabs.get === 'function') {
      tab = await browserAPI.tabs.get(tabId).catch(() => null);
    }
    if (tab && isRestrictedTabUrl(tab.url)) {
      return false;
    }
    safeSendTabMessage(tabId, { type: 'CONTROL_MEDIA', action: 'pause' });
    safeSendTabMessage(tabId, { type: 'PAUSE_MEDIA', action: 'PAUSE_MEDIA' });
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Defect 07: Auto-Pause on New Tab / Tab Switch
 * Pauses background media in other tabs when a new tab is created or activated
 * if smart_automations.auto_pause_new_tab is strictly enabled (true) in storage.
 * 
 * @param {number} newActiveOrCreatedTabId The ID of the newly activated or created tab
 * @returns {Promise<{ pausedTabs: number[] }>}
 */
async function handleAutoPauseOnTabChange(newActiveOrCreatedTabId) {
  const result = { pausedTabs: [] };
  if (!newActiveOrCreatedTabId || typeof newActiveOrCreatedTabId !== 'number') {
    return result;
  }
  try {
    const res = await browserAPI.storage.local.get(['smart_automations']);
    const isAutoPauseEnabled = Boolean(res && res.smart_automations && res.smart_automations.auto_pause_new_tab === true);
    if (!isAutoPauseEnabled) return result;

    const targetTabIds = collectAutoPauseTargetTabs(newActiveOrCreatedTabId);
    for (const tabId of targetTabIds) {
      const paused = await executeTabMediaPause(tabId);
      if (paused) result.pausedTabs.push(tabId);
    }
  } catch (_) {}
  return result;
}

/**
 * Flushes memory activity data and media history to chrome.storage.local atomically
 */
async function saveStorageData() {
  if (!isStorageLoaded) return;
  if (isSaving) return;
  isSaving = true;
  try {
    activityData.lastUpdated = Date.now();
    if (!Array.isArray(mediaHistory)) {
      mediaHistory = [];
    }
    mediaHistory = mediaHistory.filter(m => {
      if (!m || !m.id) return false;
      if (isInternalDomain(m.domain || m.platform) || isInternalUrl(m.url)) return false;
      const dur = Number(m.watchDuration ?? m.watch_duration_seconds ?? m.duration ?? 0);
      return dur >= 5;
    });
    if (mediaHistory.length > CONFIG.MAX_MEDIA_HISTORY) {
      mediaHistory = mediaHistory.slice(0, CONFIG.MAX_MEDIA_HISTORY);
    }
    await browserAPI.storage.local.set({ 
      [CONFIG.STORAGE_KEY]: activityData,
      [CONFIG.MEDIA_HISTORY_STORAGE_KEY]: mediaHistory,
      [`${CONFIG.STORAGE_KEY}_backup`]: {
        domainsCount: Object.keys(activityData.domains || {}).length,
        mediaCount: mediaHistory.length,
        lastUpdated: activityData.lastUpdated
      }
    });
  } catch (e) {
    console.error('[MediaSentinel] Error saving storage:', e);
  } finally {
    isSaving = false;
  }
}

/**
 * Automatically re-injects content scripts into existing open tabs after an extension reload/update
 * Prevents "Extension context invalidated" or orphaned tabs where media was playing
 */
async function reinjectContentScripts() {
  if (!browserAPI.scripting || typeof browserAPI.scripting.executeScript !== 'function') return;
  try {
    const tabs = await browserAPI.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
        browserAPI.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: ['content_media.js']
        }).catch(() => {});
      }
    }
  } catch (_) {}
}

/**
 * Saves media history array to chrome.storage.local
 */
async function saveMediaHistory() {
  try {
    if (!Array.isArray(mediaHistory)) mediaHistory = [];
    // Ensure all saved items strictly meet the minimum 5-second and non-internal criteria
    mediaHistory = mediaHistory.filter(m => {
      if (!m || !m.id) return false;
      if (isInternalDomain(m.domain || m.platform) || isInternalUrl(m.url)) return false;
      const dur = Number(m.watchDuration ?? m.watch_duration_seconds ?? m.duration ?? 0);
      return dur >= 5;
    });
    if (mediaHistory.length > CONFIG.MAX_MEDIA_HISTORY) {
      mediaHistory = mediaHistory.slice(0, CONFIG.MAX_MEDIA_HISTORY);
    }
    await browserAPI.storage.local.set({ [CONFIG.MEDIA_HISTORY_STORAGE_KEY]: mediaHistory });
  } catch (e) {
    console.error('[MediaSentinel] Error saving media history:', e);
  }
}

/**
 * Updates settings in memory and chrome.storage.local
 */
async function saveSettings(newSettings) {
  try {
    settings = { ...settings, ...newSettings };
    await browserAPI.storage.local.set({ 
      [CONFIG.SETTINGS_STORAGE_KEY]: settings,
      language: settings.language || 'en'
    });
    if (newSettings.idleThresholdSeconds && newSettings.idleThresholdSeconds !== CONFIG.IDLE_THRESHOLD_SECONDS) {
      CONFIG.IDLE_THRESHOLD_SECONDS = newSettings.idleThresholdSeconds;
      browserAPI.idle.setDetectionInterval(CONFIG.IDLE_THRESHOLD_SECONDS);
    }
    if (newSettings.wsUrl && newSettings.wsUrl !== CONFIG.WS_URL) {
      CONFIG.WS_URL = newSettings.wsUrl;
      if (ws) {
        try { ws.close(); } catch (_) {}
      }
      connectWebSocket();
    }
  } catch (e) {
    console.error('[MediaSentinel] Error saving settings:', e);
  }
}

/**
 * Tracks active media playback session and logs to mediaHistory
 */
function trackMediaSession(tabId, payload) {
  if (!settings.mediaTrackingEnabled) return;
  const pm = payload.primaryMedia;
  const now = Date.now();
  let session = activeMediaSessions.get(tabId);

  if (pm && pm.isPlaying) {
    const vol = Math.round((typeof pm.volume === 'number' ? pm.volume : 1) * 100);
    const domain = payload.domain || pm.domain || 'web';
    const title = pm.title || payload.title || 'Web Media';
    const resolution = pm.resolutionLabel || (pm.videoWidth && pm.videoHeight ? `${pm.videoWidth}x${pm.videoHeight}` : 'Audio / Standard');
    const incomingUrl = payload.url || (pm && pm.url) || '';

    // Strictly filter out internal extension URLs and internal domains
    if (!domain || isInternalDomain(domain) || isInternalUrl(incomingUrl)) {
      if (activeMediaSessions.has(tabId)) {
        activeMediaSessions.delete(tabId);
      }
      return;
    }

    if (session) {
      // Check for in-tab SPA or video transition (e.g. YouTube next video, playlist auto-play, or route change)
      const existingCanonical = extractCanonicalMediaId(session.url);
      const incomingCanonical = extractCanonicalMediaId(incomingUrl);

      const isUrlTransition = Boolean(
        incomingUrl && session.url &&
        incomingCanonical && existingCanonical &&
        incomingCanonical !== existingCanonical
      );

      const isTitleTransition = Boolean(
        !isUrlTransition &&
        title && session.title &&
        title !== 'Web Media' && session.title !== 'Web Media' &&
        title !== 'Audio Playback' && session.title !== 'Audio Playback' &&
        title !== 'No Media' && session.title !== 'No Media' &&
        title.replace(/^\(\d+\)\s*/, '').trim() !== session.title.replace(/^\(\d+\)\s*/, '').trim()
      );

      if (isUrlTransition || isTitleTransition) {
        // Commit trailing elapsed playback duration to preceding session
        const elapsedMs = now - session.lastHeartbeat;
        const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
        if (elapsedSec > 0 && session.isPlaying) {
          session.watchDuration += elapsedSec;
          session.lastHeartbeat += (elapsedSec * 1000);
          const isForeground = (tabId === activeTabId && isBrowserFocused);
          if (!isForeground) {
            commitBackgroundMediaDelta(session.domain, elapsedSec);
          }
        }
        // Finalize preceding session into mediaHistory & clean from active sessions
        finalizeMediaSession(tabId);
        session = null;
      }
    }

    if (session) {
      // Calculate elapsed playback duration with remainder preservation (avoids sub-second loss)
      const elapsedMs = now - session.lastHeartbeat;
      const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
      if (elapsedSec > 0) {
        session.watchDuration += elapsedSec;
        session.lastHeartbeat += (elapsedSec * 1000);
        const isForeground = (tabId === activeTabId && isBrowserFocused);
        if (!isForeground) {
          commitBackgroundMediaDelta(session.domain, elapsedSec);
        }
      }
      session.lastUpdated = now;
      if (vol >= 0 && vol <= 100) {
        session.volumeSamples.push(vol);
        if (session.volumeSamples.length > 50) session.volumeSamples.shift();
        session.peakVolume = Math.max(session.peakVolume, vol);
        session.lowVolume = Math.min(session.lowVolume, vol);
      }
      if (pm.duration) session.videoDuration = pm.duration;
      if (title && title !== 'Web Media' && title !== 'No Media') session.title = title;
      if (resolution && resolution !== 'Unknown') session.resolution = resolution;
      if (pm.playbackRate) session.playbackRate = pm.playbackRate;
      if (incomingUrl && (!session.url || session.url === '')) session.url = incomingUrl;
      session.isPlaying = true;

      // Update in mediaHistory in real time (Strict Minimum 5-Second Playback Rule)
      if (session.watchDuration >= 5) {
        updateMediaHistoryEntry(session, false);
      }
      streamMediaSessionUpdate(session, 'update');
    } else {
      // Start a brand new session
      const newSession = {
        id: `media_${now}_${Math.random().toString(36).substring(2, 8)}`,
        tabId,
        title,
        platform: domain,
        domain,
        url: incomingUrl || payload.url || (pm && pm.url) || '',
        mediaType: pm.mediaType || 'video',
        resolution,
        videoDuration: pm.duration || 0,
        watchDuration: 0,
        volumeSamples: vol >= 0 ? [vol] : [100],
        peakVolume: vol >= 0 ? vol : 100,
        lowVolume: vol >= 0 ? vol : 100,
        averageVolume: vol >= 0 ? vol : 100,
        playbackRate: pm.playbackRate || 1.0,
        timestamp: now,
        lastHeartbeat: now,
        lastUpdated: now,
        isPlaying: true
      };
      activeMediaSessions.set(tabId, newSession);
      streamMediaSessionUpdate(newSession, 'start');
    }
  } else {
    // Media paused or stopped
    if (session) {
      if (isInternalDomain(session.domain) || isInternalUrl(session.url)) {
        activeMediaSessions.delete(tabId);
        return;
      }
      const elapsedMs = now - session.lastHeartbeat;
      const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
      if (elapsedSec > 0 && session.isPlaying) {
        session.watchDuration += elapsedSec;
        session.lastHeartbeat += (elapsedSec * 1000);
        const isForeground = (tabId === activeTabId && isBrowserFocused);
        if (!isForeground) {
          commitBackgroundMediaDelta(session.domain, elapsedSec);
        }
      }
      session.isPlaying = false;
      session.lastUpdated = now;
      finalizeMediaSession(tabId);
    }
  }
}

/**
 * Finalizes and permanently commits a media playback session
 */
function finalizeMediaSession(tabId) {
  const session = activeMediaSessions.get(tabId);
  if (!session) return;

  if (isInternalDomain(session.domain) || isInternalUrl(session.url)) {
    activeMediaSessions.delete(tabId);
    return;
  }

  session.isPlaying = false;
  if (session.volumeSamples.length > 0) {
    const sum = session.volumeSamples.reduce((a, b) => a + b, 0);
    session.averageVolume = Math.round(sum / session.volumeSamples.length);
  }

  // Stream finalize to Data Hub
  streamMediaSessionUpdate(session, 'finalize');

  // Enforce Minimum 5-Second Playback Rule:
  // Strictly record if watched for at least 5 seconds; discard sub-5-second blips as transient noise
  if (session.watchDuration >= 5) {
    updateMediaHistoryEntry(session, true);
  } else {
    const idx = mediaHistory.findIndex(m => m.id === session.id);
    if (idx >= 0) {
      mediaHistory.splice(idx, 1);
      saveMediaHistory();
    }
  }

  activeMediaSessions.delete(tabId);
  saveMediaHistory();
}

/**
 * Detects native Chrome tab.audible state changes to capture background media/audio playback
 */
async function handleTabAudibleStateChange(tabId, isAudible, tab) {
  if (!settings.mediaTrackingEnabled) return;
  const now = Date.now();
  if (isAudible) {
    let tabObj = tab;
    if (!tabObj || !tabObj.url) {
      try {
        if (browserAPI.tabs && typeof browserAPI.tabs.get === 'function') {
          tabObj = await browserAPI.tabs.get(tabId);
        }
      } catch (_) {}
    }

    const rawUrl = (tabObj && tabObj.url) ? tabObj.url : '';
    const domain = rawUrl ? extractDomain(rawUrl) : 'web';

    // Strictly filter out internal extension URLs and internal domains
    // (e.g. Dashboard audio lab, visualizer, audio chimes, chrome/edge internal pages)
    if (!domain || isInternalDomain(domain) || isInternalUrl(rawUrl)) {
      if (activeMediaSessions.has(tabId)) {
        activeMediaSessions.delete(tabId);
      }
      return;
    }

    let session = activeMediaSessions.get(tabId);
    const title = (tabObj && tabObj.title) ? tabObj.title : 'Audio Playback';

    if (!session) {
      session = {
        id: `audible_${now}_${Math.random().toString(36).substring(2, 8)}`,
        tabId,
        title,
        platform: domain,
        domain,
        url: rawUrl,
        mediaType: 'audio',
        resolution: 'Audio Stream',
        videoDuration: 0,
        watchDuration: 0,
        volumeSamples: [100],
        peakVolume: 100,
        lowVolume: 100,
        averageVolume: 100,
        playbackRate: 1.0,
        timestamp: now,
        lastHeartbeat: now,
        lastUpdated: now,
        isPlaying: true,
        isAudible: true
      };
      activeMediaSessions.set(tabId, session);
      streamMediaSessionUpdate(session, 'start');
    } else {
      session.isPlaying = true;
      session.isAudible = true;
      session.lastUpdated = now;
      if (domain && domain !== 'web' && (!session.domain || session.domain === 'web')) {
        session.domain = domain;
      }
      if (title && (!session.title || session.title === 'Audio Playback')) {
        session.title = title;
      }
    }
  } else {
    const session = activeMediaSessions.get(tabId);
    if (session) {
      if (isInternalDomain(session.domain) || isInternalUrl(session.url)) {
        activeMediaSessions.delete(tabId);
        return;
      }
      if (session.isAudible) {
        session.isAudible = false;
        const tabMedia = tabMediaMap.get(tabId);
        if (!tabMedia || !tabMedia.anyPlaying) {
          // Commit remaining elapsed playback seconds before concluding session to prevent data loss
          const elapsedMs = now - session.lastHeartbeat;
          const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
          if (elapsedSec > 0 && session.isPlaying) {
            session.watchDuration += elapsedSec;
            session.lastHeartbeat += (elapsedSec * 1000);
            const isForeground = (tabId === activeTabId && isBrowserFocused);
            if (!isForeground) {
              commitBackgroundMediaDelta(session.domain, elapsedSec);
            }
          }
          session.isPlaying = false;
          session.lastUpdated = now;
          finalizeMediaSession(tabId);
        }
      }
    }
  }
}

/**
 * Upserts a media session entry into mediaHistory (Strict Minimum 5-Second Playback Rule)
 */
function updateMediaHistoryEntry(session, persist = false) {
  if (!session) return;
  // Strictly require at least 5 seconds of playback duration; discard sub-5s transient noise
  if (session.watchDuration < 5) return;
  // Discard internal/extension domains and URLs
  if (isInternalDomain(session.domain) || isInternalUrl(session.url)) return;

  const avgVol = session.volumeSamples && session.volumeSamples.length > 0
    ? Math.round(session.volumeSamples.reduce((a, b) => a + b, 0) / session.volumeSamples.length)
    : (session.peakVolume || 100);

  const entry = {
    id: session.id,
    title: session.title,
    platform: session.platform,
    domain: session.domain,
    url: session.url,
    mediaType: session.mediaType,
    resolution: session.resolution,
    watchDuration: Math.round(session.watchDuration),
    videoDuration: Math.round(session.videoDuration || 0),
    averageVolume: avgVol,
    peakVolume: session.peakVolume || 100,
    lowVolume: session.lowVolume || 100,
    volumeSamples: (session.volumeSamples || []).slice(-20),
    playbackRate: session.playbackRate || 1.0,
    lastWindowMode: session.lastWindowMode || 'standard',
    controlEvents: (session.controlEvents || []).slice(-10),
    timestamp: session.timestamp,
    lastUpdated: session.lastUpdated,
    isPlaying: session.isPlaying
  };

  const idx = mediaHistory.findIndex(m => m.id === session.id);
  if (idx >= 0) {
    mediaHistory[idx] = entry;
  } else {
    mediaHistory.unshift(entry);
    if (mediaHistory.length > CONFIG.MAX_MEDIA_HISTORY) {
      mediaHistory = mediaHistory.slice(0, CONFIG.MAX_MEDIA_HISTORY);
    }
  }

  if (persist) {
    saveMediaHistory();
  }
}

/**
 * Commits elapsed seconds for current active domain (Method A: Foreground Active Only)
 */
function commitActiveInterval() {
  if (isTrackingPaused) {
    intervalStartTime = Date.now();
    return;
  }

  if (!activeDomain || !isBrowserFocused || !isUserActive || matchesTrackingBlacklist(activeDomain)) {
    intervalStartTime = Date.now();
    return;
  }

  const now = Date.now();
  const elapsedMs = now - intervalStartTime;
  const elapsedSec = Math.floor(elapsedMs / 1000);

  if (elapsedSec > 0) {
    // Avoid aberrant giant leaps (> 3600s in one interval)
    const validSec = Math.min(elapsedSec, 3600);
    const today = getTodayDateString();

    if (!activityData.domains[activeDomain]) {
      activityData.domains[activeDomain] = {
        favicon: getFaviconUrl(activeDomain),
        totalSeconds: 0,
        foregroundSeconds: 0,
        backgroundMediaSeconds: 0,
        sessionCount: 1,
        lastActive: now,
        days: {}
      };
    }

    const domainEntry = activityData.domains[activeDomain];
    domainEntry.totalSeconds += validSec;
    domainEntry.foregroundSeconds = (domainEntry.foregroundSeconds || 0) + validSec;
    domainEntry.lastActive = now;

    if (!domainEntry.days[today]) {
      domainEntry.days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
    }
    const dayEntry = domainEntry.days[today];
    dayEntry.seconds += validSec;
    dayEntry.foregroundSeconds = (dayEntry.foregroundSeconds || 0) + validSec;
    updateHourlyBucket(dayEntry, validSec, true, now);

    // Reset interval anchor
    intervalStartTime = now;

    // Stream delta to Data Hub with tracking_type = 'foreground'
    streamActivityDelta(activeDomain, validSec, false, 'foreground');

    // Debounced auto-save ensures freshly tracked seconds are never lost on reload
    scheduleStorageSave(false);
  }
}

/**
 * Records real-time hourly bucket telemetry per domain day entry
 * @param {Object} dayEntry - Domain daily statistics entry
 * @param {number} validSec - Tracked seconds delta
 * @param {boolean} isForeground - True for active foreground, false for background media
 * @param {number} now - Epoch timestamp
 */
function updateHourlyBucket(dayEntry, validSec, isForeground, now) {
  if (!dayEntry) return;
  if (!dayEntry.hourlyBuckets) {
    dayEntry.hourlyBuckets = {};
  }
  const currentHour = new Date(now).getHours();
  if (!dayEntry.hourlyBuckets[currentHour]) {
    dayEntry.hourlyBuckets[currentHour] = {
      activeSeconds: 0,
      activeTime: 0,
      backgroundMediaSeconds: 0,
      mediaTime: 0,
      sessions: isForeground ? 1 : 0
    };
  }
  const hourBucket = dayEntry.hourlyBuckets[currentHour];
  if (isForeground) {
    hourBucket.activeSeconds = (hourBucket.activeSeconds || 0) + validSec;
    hourBucket.activeTime = hourBucket.activeSeconds;
  } else {
    hourBucket.backgroundMediaSeconds = (hourBucket.backgroundMediaSeconds || 0) + validSec;
    hourBucket.mediaTime = hourBucket.backgroundMediaSeconds;
  }
}

/**
 * Commits elapsed seconds for background media playback on a domain (Method B: Background Media Playback Only)
 */
function commitBackgroundMediaDelta(domain, seconds) {
  if (!domain || seconds <= 0 || matchesTrackingBlacklist(domain)) return;
  const validSec = Math.min(seconds, 3600);
  const today = getTodayDateString();
  const now = Date.now();

  if (!activityData.domains[domain]) {
    activityData.domains[domain] = {
      favicon: getFaviconUrl(domain),
      totalSeconds: 0,
      foregroundSeconds: 0,
      backgroundMediaSeconds: 0,
      sessionCount: 1,
      lastActive: now,
      days: {}
    };
  }

  const domainEntry = activityData.domains[domain];
  domainEntry.totalSeconds += validSec;
  domainEntry.backgroundMediaSeconds = (domainEntry.backgroundMediaSeconds || 0) + validSec;
  domainEntry.lastActive = now;

  if (!domainEntry.days[today]) {
    domainEntry.days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
  }
  const dayEntry = domainEntry.days[today];
  dayEntry.seconds += validSec;
  dayEntry.backgroundMediaSeconds = (dayEntry.backgroundMediaSeconds || 0) + validSec;
  updateHourlyBucket(dayEntry, validSec, false, now);

  // Stream delta to Data Hub with tracking_type = 'background_media'
  streamActivityDelta(domain, validSec, false, 'background_media');

  scheduleStorageSave(false);
}

/**
 * Switches the actively tracked domain.
 * If newDomain is null or an untracked page, clears activeDomain so seconds NEVER leak to previous tab!
 */
function switchActiveDomain(newDomain, isNewSession = false) {
  commitActiveInterval();

  if (newDomain && matchesTrackingBlacklist(newDomain)) {
    if (activeDomain !== null) {
      activeDomain = null;
      intervalStartTime = Date.now();
      sendActivityUpdateToHUD();
      scheduleStorageSave(true);
    }
    return;
  }

  if (!newDomain) {
    if (activeDomain !== null) {
      activeDomain = null;
      intervalStartTime = Date.now();
      sendActivityUpdateToHUD();
      scheduleStorageSave(true);
    }
    return;
  }

  if (newDomain !== activeDomain) {
    activeDomain = newDomain;
    intervalStartTime = Date.now();
    const today = getTodayDateString();

    if (!activityData.domains[activeDomain]) {
      activityData.domains[activeDomain] = {
        favicon: getFaviconUrl(activeDomain),
        totalSeconds: 0,
        foregroundSeconds: 0,
        backgroundMediaSeconds: 0,
        sessionCount: 1,
        lastActive: intervalStartTime,
        days: {
          [today]: { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 }
        }
      };
      streamActivityDelta(activeDomain, 0, true, 'foreground');
    } else if (isNewSession) {
      activityData.domains[activeDomain].sessionCount = (activityData.domains[activeDomain].sessionCount || 0) + 1;
      if (!activityData.domains[activeDomain].days[today]) {
        activityData.domains[activeDomain].days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
      } else {
        activityData.domains[activeDomain].days[today].sessions = (activityData.domains[activeDomain].days[today].sessions || 0) + 1;
      }
      streamActivityDelta(activeDomain, 0, true, 'foreground');
    }

    sendActivityUpdateToHUD();

    // Immediate save ensures domain switches and tab transitions are committed immediately
    scheduleStorageSave(true);
  }
}

/**
 * Synthesizes global media state across all open tabs.
 * Preserves paused/buffering videos so the dashboard never goes blank prematurely.
 */
function synthesizeGlobalMediaState() {
  let activeMediaTabsCount = 0;
  let hasPlayingVideo = false;
  let hasPlayingAudio = false;
  let primaryMedia = null;
  const allActiveMedia = [];

  for (const [tabId, mediaState] of tabMediaMap.entries()) {
    if (!mediaState) continue;
    const pm = mediaState.primaryMedia;
    if (!pm && !mediaState.hasMedia) continue;

    const isPlaying = Boolean(pm && pm.isPlaying);
    const isVideo = Boolean(pm && pm.mediaType === 'video');
    const isAudio = Boolean(pm && pm.mediaType === 'audio');

    if (isPlaying) {
      activeMediaTabsCount++;
      if (isVideo) hasPlayingVideo = true;
      if (isAudio) hasPlayingAudio = true;
    }

    if (pm) {
      let resLabel = pm.resolutionLabel;
      if (!resLabel || resLabel === 'Audio / Unknown' || resLabel === 'Unknown') {
        resLabel = isVideo ? 'Video (Auto)' : 'Audio Stream';
      }

      const item = {
        tabId: tabId || (pm && pm.tabId) || mediaState.tabId,
        windowId: mediaState.windowId || (pm && pm.windowId) || 0,
        isCurrentTab: (tabId === activeTabId),
        domain: mediaState.domain || pm.domain || 'web',
        url: mediaState.url || '',
        title: pm.title || mediaState.title || 'Web Media',
        mediaType: pm.mediaType || 'video',
        state: pm.state || (pm.isPlaying ? 'playing' : (pm.isBuffering ? 'buffering' : 'paused')),
        isPlaying: pm.isPlaying,
        isBuffering: pm.isBuffering,
        isMuted: pm.isMuted,
        isLive: Boolean(pm.isLive || pm.duration === Infinity),
        volume: pm.volume,
        playbackRate: pm.playbackRate || 1.0,
        videoWidth: pm.videoWidth || 0,
        videoHeight: pm.videoHeight || 0,
        resolutionLabel: resLabel,
        currentTime: Number.isFinite(pm.currentTime) ? Number(pm.currentTime) : 0,
        duration: Number.isFinite(pm.duration) ? Number(pm.duration) : 0,
        progressPercent: Number.isFinite(pm.progressPercent) ? Number(pm.progressPercent) : 0
      };

      allActiveMedia.push(item);

      // Hierarchical primary media selection:
      // 1. Playing video in currently focused tab
      // 2. Playing video with valid stream resolution & duration
      // 3. Playing video in any tab
      // 4. Playing audio in any tab
      // 5. Paused/buffering video in currently focused tab
      // 6. Paused/buffering video in any tab
      // 7. Any existing primary
      if (!primaryMedia) {
        primaryMedia = item;
      } else {
        const pIsCurTab = primaryMedia.isCurrentTab;
        const itIsCurTab = item.isCurrentTab;
        const pIsPlaying = primaryMedia.isPlaying;
        const itIsPlaying = item.isPlaying;
        const pIsVideo = primaryMedia.mediaType === 'video';
        const itIsVideo = item.mediaType === 'video';

        if (itIsPlaying && !pIsPlaying) {
          primaryMedia = item;
        } else if (itIsPlaying && pIsPlaying) {
          if (itIsVideo && !pIsVideo) {
            primaryMedia = item;
          } else if (itIsVideo === pIsVideo) {
            // If both are videos, prefer the one with valid stream resolution or duration
            const pHasDim = (primaryMedia.videoWidth > 0 || primaryMedia.duration > 0);
            const itHasDim = (item.videoWidth > 0 || item.duration > 0);
            if (itHasDim && !pHasDim) {
              primaryMedia = item;
            } else if (itIsCurTab && !pIsCurTab) {
              primaryMedia = item;
            }
          }
        } else if (!itIsPlaying && !pIsPlaying) {
          if (itIsVideo && !pIsVideo) {
            primaryMedia = item;
          } else if (itIsVideo === pIsVideo) {
            const pHasDim = (primaryMedia.videoWidth > 0 || primaryMedia.duration > 0);
            const itHasDim = (item.videoWidth > 0 || item.duration > 0);
            if (itHasDim && !pHasDim) {
              primaryMedia = item;
            } else if (itIsCurTab && !pIsCurTab) {
              primaryMedia = item;
            }
          }
        }
      }
    }
  }

  return {
    activeMediaTabsCount,
    hasPlayingVideo,
    hasPlayingAudio,
    primaryMedia: primaryMedia || null,
    allActiveMedia,
    timestamp: Date.now()
  };
}

/**
 * Phase 2: Feature 3 - Multi-Tab Live Media Stream Discovery
 * Discovers and aggregates all active, playing, and audible tabs across the browser.
 * @returns {Promise<Array<Object>>}
 */
async function getAllActiveMediaStreams() {
  const streamMap = new Map();

  // 1. Ingest all media states tracked in tabMediaMap
  for (const [tabId, mediaState] of tabMediaMap.entries()) {
    if (!tabId || !mediaState) continue;
    const pm = mediaState.primaryMedia || {};
    const isPlaying = Boolean(mediaState.anyPlaying || pm.isPlaying || pm.state === 'playing');
    const isBuffering = Boolean(pm.isBuffering || pm.state === 'buffering');
    const isMuted = Boolean(pm.isMuted);
    const domain = pm.domain || mediaState.domain || (mediaState.url ? extractDomain(mediaState.url) : '');
    const title = pm.title || mediaState.title || (domain ? domain : `Tab ${tabId}`);
    const url = pm.src || mediaState.url || '';
    if (isInternalDomain(domain) || isInternalUrl(url)) continue;
    const favIconUrl = mediaState.favIconUrl || '';
    const currentTime = Number.isFinite(pm.currentTime) ? Number(pm.currentTime) : 0;
    const duration = Number.isFinite(pm.duration) ? Number(pm.duration) : 0;
    const volume = (typeof pm.volume === 'number' && Number.isFinite(pm.volume)) ? pm.volume : 1.0;
    const isAudible = Boolean(mediaState.isAudible || isPlaying);

    // Strictly filter out non-media tabs from tabMediaMap
    const hasVerifiableMedia = Boolean(
      mediaState.hasMedia === true ||
      isPlaying ||
      isAudible ||
      (mediaState.totalVideos && mediaState.totalVideos > 0) ||
      (mediaState.totalAudios && mediaState.totalAudios > 0) ||
      (pm && (pm.src || (typeof pm.duration === 'number' && pm.duration > 0)))
    );

    if (!hasVerifiableMedia) {
      continue; // Strictly omit non-media tabs!
    }

    streamMap.set(Number(tabId), {
      tabId: Number(tabId),
      windowId: mediaState.windowId || (pm && pm.windowId) || 0,
      url: url,
      domain: domain,
      title: title,
      favIconUrl: favIconUrl,
      hasMedia: true,
      isAudible: isAudible,
      isMuted: isMuted,
      playbackState: isPlaying ? 'playing' : (isBuffering ? 'buffering' : 'paused'),
      currentTime: currentTime,
      duration: duration,
      volume: volume
    });
  }

  // 2. Discover audible tabs via chrome.tabs.query({ audible: true })
  try {
    if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
      const audibleTabs = await browserAPI.tabs.query({ audible: true });
      if (Array.isArray(audibleTabs)) {
        for (const t of audibleTabs) {
          if (!t || !t.id) continue;
          const numId = Number(t.id);
          const domain = t.url ? extractDomain(t.url) : 'web';
          if (isInternalDomain(domain) || isInternalUrl(t.url)) continue;
          const isMuted = Boolean(t.mutedInfo && t.mutedInfo.muted);
          const existing = streamMap.get(numId);
          if (existing) {
            existing.isAudible = true;
            existing.hasMedia = true;
            if (t.windowId) existing.windowId = t.windowId;
            if (t.title && (!existing.title || existing.title === 'Web Media')) existing.title = t.title;
            if (t.favIconUrl) existing.favIconUrl = t.favIconUrl;
            if (t.url) existing.url = t.url;
            existing.isMuted = isMuted;
          } else {
            streamMap.set(numId, {
              tabId: numId,
              windowId: t.windowId || 0,
              url: t.url || '',
              domain: domain,
              title: t.title || domain || `Tab ${numId}`,
              favIconUrl: t.favIconUrl || '',
              hasMedia: true,
              isAudible: true,
              isMuted: isMuted,
              playbackState: isMuted ? 'paused' : 'playing',
              currentTime: 0,
              duration: 0,
              volume: isMuted ? 0 : 1.0
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[SentinelBackground] Error querying audible tabs:', err);
  }

  // 3. Enrich tab metadata (title, favicon, url, mute state) and remove closed tabs
  const result = [];
  for (const [tId, streamInfo] of streamMap.entries()) {
    try {
      if (browserAPI.tabs && typeof browserAPI.tabs.get === 'function') {
        const liveTab = await browserAPI.tabs.get(tId).catch(() => null);
        if (!liveTab) {
          tabMediaMap.delete(tId);
          continue;
        }
        if (liveTab.title && (!streamInfo.title || streamInfo.title === `Tab ${tId}`)) {
          streamInfo.title = liveTab.title;
        }
        if (liveTab.favIconUrl && !streamInfo.favIconUrl) {
          streamInfo.favIconUrl = liveTab.favIconUrl;
        }
        if (liveTab.url && (!streamInfo.url || !streamInfo.domain)) {
          streamInfo.url = liveTab.url;
          streamInfo.domain = extractDomain(liveTab.url);
        }
        if (liveTab.mutedInfo) {
          streamInfo.isMuted = Boolean(liveTab.mutedInfo.muted);
        }
        if (typeof liveTab.audible === 'boolean') {
          streamInfo.isAudible = liveTab.audible;
        }
      }
    } catch (_) {}

    // Final defensive check: tab must have verifiable media or audio and not be internal
    if (isInternalDomain(streamInfo.domain) || isInternalUrl(streamInfo.url)) {
      continue;
    }
    const isVerifiableStream = Boolean(
      streamInfo.isAudible === true ||
      streamInfo.playbackState === 'playing' ||
      (typeof streamInfo.duration === 'number' && streamInfo.duration > 0) ||
      streamInfo.hasMedia === true
    );

    if (isVerifiableStream) {
      result.push(streamInfo);
    }
  }

  return result;
}

/**
 * Phase 2: Feature 3 - Solo Tab Mode Execution
 * Unmutes target tab while muting all other tabs in the browser.
 * @param {number} soloTabId
 * @returns {Promise<{success: boolean, soloTabId: number, mutedCount: number}>}
 */
/**
 * Captures current mute state of all tabs into the specified snapshot map.
 * @param {Map} snapshotMap
 */
async function capturePreMuteSnapshot(snapshotMap) {
  if (!snapshotMap || typeof snapshotMap.set !== 'function') return;
  snapshotMap.clear();
  for (const [tId, mediaData] of tabMediaMap.entries()) {
    const numId = Number(tId);
    if (numId) {
      snapshotMap.set(numId, Boolean(mediaData && mediaData.primaryMedia && mediaData.primaryMedia.isMuted));
    }
  }
  if (!browserAPI.tabs || typeof browserAPI.tabs.query !== 'function') return;
  try {
    const allTabs = await browserAPI.tabs.query({});
    (allTabs || []).forEach(t => {
      if (t && t.id) {
        if (typeof isRestrictedTabUrl === 'function' && t.url && isRestrictedTabUrl(t.url)) return;
        snapshotMap.set(t.id, Boolean(t.mutedInfo && t.mutedInfo.muted));
      }
    });
  } catch (_) {}
}

/**
 * Collects candidate tab IDs to mute, optionally excluding a specific tab.
 * @param {number|null} [excludeId]
 * @returns {Promise<Set<number>>}
 */
async function collectCandidateTabs(excludeId = null) {
  const tabs = new Set();
  const restrictedIds = new Set();
  if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
    try {
      const allTabs = await browserAPI.tabs.query({});
      (allTabs || []).forEach(t => {
        if (!t || !t.id) return;
        if (typeof isRestrictedTabUrl === 'function' && t.url && isRestrictedTabUrl(t.url)) {
          restrictedIds.add(t.id);
          return;
        }
        const hasMedia = tabMediaMap.has(t.id) || tabMediaMap.has(String(t.id));
        if (t.id !== excludeId && (t.audible || hasMedia || (t.mutedInfo && !t.mutedInfo.muted))) {
          tabs.add(t.id);
        }
      });
    } catch (_) {}
  }
  for (const [tId] of tabMediaMap.entries()) {
    const numId = Number(tId);
    if (numId && numId !== excludeId && !restrictedIds.has(numId)) {
      tabs.add(numId);
    }
  }
  return tabs;
}

/**
 * Restores tabs from a snapshot map or un-mutes tabs as fallback.
 * @param {Map} snapshotMap
 * @param {number|null} [excludeId]
 * @returns {Promise<number>} count of restored/unmuted tabs
 */
async function restoreMuteSnapshot(snapshotMap, excludeId = null) {
  let count = 0;
  const targetEntries = [];
  const hasSnapshot = Boolean(snapshotMap && typeof snapshotMap.entries === 'function' && snapshotMap.size > 0);

  if (hasSnapshot) {
    for (const [tId, wasMuted] of snapshotMap.entries()) {
      targetEntries.push([Number(tId), wasMuted]);
    }
    snapshotMap.clear();
  }

  if (!hasSnapshot) {
    for (const [tId] of tabMediaMap.entries()) targetEntries.push([Number(tId), false]);
    try {
      const allTabs = (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') ? await browserAPI.tabs.query({}) : [];
      (allTabs || []).forEach(t => {
        if (t && t.id && t.mutedInfo && t.mutedInfo.muted) {
          if (typeof isRestrictedTabUrl === 'function' && t.url && isRestrictedTabUrl(t.url)) return;
          targetEntries.push([t.id, false]);
        }
      });
    } catch (_) {}
  }

  for (const [numId, wasMuted] of targetEntries) {
    if (!numId || numId === excludeId) continue;
    try {
      if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
        await browserAPI.tabs.update(numId, { muted: wasMuted }).catch(() => {});
      }
    } catch (_) {}
    safeSendTabMessage(numId, { type: 'MEDIA_CONTROL', action: wasMuted ? 'mute' : 'unmute' });
    const m = tabMediaMap.get(numId) || tabMediaMap.get(String(numId));
    if (m && m.primaryMedia) m.primaryMedia.isMuted = wasMuted;
    count++;
  }
  return count;
}

/**
 * Clears Solo Tab mode: un-mutes all open browser tabs and restores global media state.
 * @returns {Promise<{success: boolean, cleared: boolean, soloTabId: null, unmutedCount: number}>}
 */
async function handleSoloTabClearExecution() {
  let unmutedCount = 0;
  const snapshot = (typeof soloPreviousMuteStates !== 'undefined' && typeof soloPreviousMuteStates?.get === 'function')
    ? soloPreviousMuteStates : null;
  const targets = [];
  const hasSnapshot = Boolean(snapshot && snapshot.size > 0);

  if (hasSnapshot) {
    for (const [tId, wasMuted] of snapshot.entries()) {
      targets.push([Number(tId), wasMuted]);
    }
    snapshot.clear();
  }

  if (!hasSnapshot) {
    for (const [tId] of tabMediaMap.entries()) targets.push([Number(tId), false]);
    try {
      const allTabs = (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') ? await browserAPI.tabs.query({}) : [];
      (allTabs || []).forEach(t => {
        if (t && t.id && t.mutedInfo && t.mutedInfo.muted) targets.push([t.id, false]);
      });
    } catch (_) {}
  }

  for (const [numId, wasMuted] of targets) {
    if (!numId) continue;
    try {
      if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
        await browserAPI.tabs.update(numId, { muted: wasMuted }).catch(() => {});
      }
    } catch (_) {}
    safeSendTabMessage(numId, { type: 'MEDIA_CONTROL', action: wasMuted ? 'mute' : 'unmute' });
    const m = tabMediaMap.get(numId) || tabMediaMap.get(String(numId));
    if (m && m.primaryMedia) m.primaryMedia.isMuted = wasMuted;
    if (!wasMuted) unmutedCount++;
  }

  safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
  return { success: true, cleared: true, soloTabId: null, unmutedCount };
}

/**
 * Executes Solo Tab mode: un-mutes soloTabId and mutes all other open media streams.
 * If soloTabId is null, empty, or 0, forwards to handleSoloTabClearExecution.
 * @param {number|string|null} soloTabId
 * @returns {Promise<{success: boolean, soloTabId?: number|null, mutedCount?: number, cleared?: boolean, error?: string}>}
 */
async function handleSoloTabExecution(soloTabId) {
  if (soloTabId === null || soloTabId === undefined || soloTabId === 0 || soloTabId === '0' || soloTabId === '') {
    return handleSoloTabClearExecution();
  }
  const targetId = Number(soloTabId);
  if (!targetId) return { success: false, error: 'Invalid soloTabId' };

  await capturePreMuteSnapshot(soloPreviousMuteStates);

  // 1. Unmute target tab
  try {
    if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
      await browserAPI.tabs.update(targetId, { muted: false }).catch(() => {});
    }
  } catch (_) {}
  safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'unmute' });
  const targetMedia = tabMediaMap.get(targetId);
  if (targetMedia && targetMedia.primaryMedia) {
    targetMedia.primaryMedia.isMuted = false;
  }

  // 2. Mute all other candidate tabs
  const tabsToMute = await collectCandidateTabs(targetId);
  let mutedCount = 0;

  for (const muteId of tabsToMute) {
    try {
      if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
        await browserAPI.tabs.update(muteId, { muted: true }).catch(() => {});
      }
    } catch (_) {}
    safeSendTabMessage(muteId, { type: 'MEDIA_CONTROL', action: 'mute' });
    const m = tabMediaMap.get(muteId);
    if (m && m.primaryMedia) {
      m.primaryMedia.isMuted = true;
    }
    mutedCount++;
  }

  safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
  return { success: true, soloTabId: targetId, mutedCount };
}

/**
 * Resolves candidate primary media tab using 5-tier waterfall selection.
 * @param {number|string|null} [primaryTabId]
 * @param {object} [bApi]
 * @param {Map} [tMap]
 * @param {Map} [aSessions]
 * @param {Array} [mHistory]
 * @returns {Promise<number>}
 */
async function resolveCandidatePrimaryTab(primaryTabId, bApi, tMap, aSessions, mHistory) {
  let targetId = Number(primaryTabId) || 0;
  if (targetId > 0) return targetId;
  const b = bApi || (typeof browserAPI !== 'undefined' ? browserAPI : null);
  const tm = tMap || (typeof tabMediaMap !== 'undefined' ? tabMediaMap : null);
  const am = aSessions || (typeof activeMediaSessions !== 'undefined' ? activeMediaSessions : null);
  const mh = mHistory || (typeof mediaHistory !== 'undefined' ? mediaHistory : []);
  if (tm && typeof tm.entries === 'function') {
    for (const [tId, d] of tm.entries()) {
      if (d?.anyPlaying || d?.primaryMedia?.isPlaying || d?.audible) return Number(tId);
    }
  }
  if (am && typeof am.entries === 'function') {
    for (const [tId, s] of am.entries()) {
      if (s?.isPlaying || s?.playbackState === 'playing' || s?.isAudible) return Number(s?.tabId || tId);
    }
  }
  if (b?.tabs?.query) {
    const audible = await b.tabs.query({ audible: true }).catch(() => []);
    const cand = (audible || []).find(t => t?.id && (typeof isRestrictedTabUrl !== 'function' || !isRestrictedTabUrl(t.url)));
    if (cand?.id) return cand.id;
  }
  let bestTime = 0, bestId = 0;
  const consider = (id, time) => { const n = Number(id); if (n > 0 && time > bestTime) { bestTime = time; bestId = n; } };
  if (am && typeof am.forEach === 'function') {
    am.forEach((s, t) => consider(s?.tabId || t, Math.max(s?.lastPlaybackTimestamp || 0, s?.lastActiveTime || 0, s?.lastUpdated || 0, s?.lastHeartbeat || 0, s?.timestamp || 0)));
  }
  if (Array.isArray(mh)) {
    mh.forEach(m => consider(m?.tabId, Math.max(m?.lastPlaybackTimestamp || 0, m?.lastActiveTime || 0, m?.lastUpdated || 0, m?.timestamp || 0)));
  }
  if (bestId > 0 && (!tm || tm.size === 0 || tm.has(bestId) || tm.has(String(bestId)))) return bestId;
  if (b?.tabs?.query) {
    const active = await b.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => []);
    const cand = (active || []).find(t => t?.id && (typeof isRestrictedTabUrl !== 'function' || !isRestrictedTabUrl(t.url)));
    if (cand?.id) return cand.id;
  }
  if (tm && tm.size > 0) {
    const first = Number(tm.keys().next().value);
    if (first > 0) return first;
  }
  if (b?.tabs?.query) {
    const all = await b.tabs.query({}).catch(() => []);
    const cand = (all || []).find(t => t?.id && (typeof isRestrictedTabUrl !== 'function' || !isRestrictedTabUrl(t.url)));
    if (cand?.id) return cand.id;
  }
  return 0;
}

/**
 * Executes Mute All Others mode: mutes all open media streams except primaryTabId,
 * preserving prior mute states in muteOthersPreviousMuteStates.
 * @param {number|string} [primaryTabId]
 * @returns {Promise<{success: boolean, primaryTabId?: number, mutedCount?: number, timestamp?: number, error?: string}>}
 */
async function handleMuteAllOthersExecution(primaryTabId) {
  let targetId = (typeof resolveCandidatePrimaryTab === 'function')
    ? await resolveCandidatePrimaryTab(primaryTabId)
    : (Number(primaryTabId) || 0);
  if (!targetId && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
    try {
      const active = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      const cand = (active || []).find(t => t && t.id && (typeof isRestrictedTabUrl !== 'function' || !isRestrictedTabUrl(t.url)));
      if (cand && cand.id) targetId = Number(cand.id);
    } catch (_) {}
  }
  if (!targetId) return { success: false, error: 'Invalid primaryTabId' };

  await capturePreMuteSnapshot(muteOthersPreviousMuteStates);
  if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
    await browserAPI.tabs.update(targetId, { muted: false }).catch(() => {});
  }
  safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'unmute' });
  const targetMedia = tabMediaMap.get(targetId) || tabMediaMap.get(String(targetId));
  if (targetMedia && targetMedia.primaryMedia) targetMedia.primaryMedia.isMuted = false;

  const tabsToMute = await collectCandidateTabs(targetId);
  let mutedCount = 0;
  for (const muteId of tabsToMute) {
    if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
      await browserAPI.tabs.update(muteId, { muted: true }).catch(() => {});
    }
    safeSendTabMessage(muteId, { type: 'MEDIA_CONTROL', action: 'mute' });
    const m = tabMediaMap.get(muteId) || tabMediaMap.get(String(muteId));
    if (m && m.primaryMedia) m.primaryMedia.isMuted = true;
    mutedCount++;
  }

  safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
  return { success: true, primaryTabId: targetId, mutedCount, timestamp: Date.now() };
}

/**
 * Clears Mute All Others mode: restores prior mute states for all non-primary tabs.
 * @returns {Promise<{success: boolean, cleared: boolean, restoredCount: number}>}
 */
async function handleMuteAllOthersClearExecution() {
  const restoredCount = await restoreMuteSnapshot(muteOthersPreviousMuteStates);
  safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
  return { success: true, cleared: true, restoredCount };
}

/**
 * Executes Mute All mode: mutes all open media streams across all tabs,
 * capturing previous mute states in muteAllPreviousMuteStates.
 * @returns {Promise<{success: boolean, mutedCount: number}>}
 */
async function handleMuteAllExecution() {
  await capturePreMuteSnapshot(muteAllPreviousMuteStates);
  const tabsToMute = await collectCandidateTabs();
  let mutedCount = 0;

  for (const muteId of tabsToMute) {
    try {
      if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
        await browserAPI.tabs.update(muteId, { muted: true }).catch(() => {});
      }
    } catch (_) {}
    safeSendTabMessage(muteId, { type: 'MEDIA_CONTROL', action: 'mute' });
    const m = tabMediaMap.get(muteId);
    if (m && m.primaryMedia) {
      m.primaryMedia.isMuted = true;
    }
    mutedCount++;
  }

  safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
  return { success: true, mutedCount };
}

/**
 * Clears Mute All mode: restores prior mute states for all tabs.
 * @returns {Promise<{success: boolean, cleared: boolean, restoredCount: number}>}
 */
async function handleMuteAllClearExecution() {
  const restoredCount = await restoreMuteSnapshot(muteAllPreviousMuteStates);
  safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
  return { success: true, cleared: true, restoredCount };
}

/**
 * Activates a tab and brings its parent window to focus (with minimized window un-minimization)
 * Hoisted to top-level background scope for global IPC accessibility.
 * @param {number|string} tabId
 * @param {number|string} [windowId]
 * @returns {Promise<{success: boolean, tabId?: number, windowId?: number, error?: string}|false>}
 */
const activateAndFocusTab = async function activateAndFocusTab(tabId, windowId) {
  try {
    const numTabId = Number(tabId);
    if (!numTabId) return false;
    const targetTab = await browserAPI.tabs.get(numTabId);
    if (!targetTab) return false;
    
    await browserAPI.tabs.update(numTabId, { active: true });
    const winId = windowId || targetTab.windowId;
    if (winId) {
      try {
        let win = null;
        if (browserAPI.windows && typeof browserAPI.windows.get === 'function') {
          win = await browserAPI.windows.get(winId);
        }
        if (win && win.state === 'minimized') {
          await browserAPI.windows.update(winId, { state: 'normal', focused: true });
        } else {
          await browserAPI.windows.update(winId, { focused: true });
        }
      } catch (_) {
        if (browserAPI.windows && typeof browserAPI.windows.update === 'function') {
          await browserAPI.windows.update(winId, { state: 'normal', focused: true }).catch(() => {});
        }
      }
    }
    return { success: true, tabId: numTabId, windowId: winId };
  } catch (_) {
    return false;
  }
}

/**
 * Phase 2: Feature 3 - Remote Media Command Execution
 * Dispatches remote media command to a specific tab.
 * @param {number} tabId
 * @param {string} command - 'play' | 'pause' | 'toggle' | 'seek' | 'seek_to' | 'seek_absolute' | 'seek_percent' | 'set_volume' | 'mute' | 'unmute' | 'solo' | 'switch_tab' | 'focus_tab'
 * @param {number} [value]
 * @param {object} [options]
 */
async function handleRemoteMediaCommandExecution(tabId, command, value, options = {}) {
  const targetId = Number(tabId);
  if (!targetId) return { success: false, error: 'Invalid tabId' };

  if (command === 'solo') {
    return await handleSoloTabExecution(targetId);
  }

  if (command === 'mute_others' || command === 'mute_all_others') {
    return await handleMuteAllOthersExecution(targetId);
  }

  if (command === 'mute_others_clear' || command === 'mute_all_others_clear') {
    return await handleMuteAllOthersClearExecution();
  }

  if (command === 'mute_all') {
    return await handleMuteAllExecution();
  }

  if (command === 'mute_all_clear' || command === 'unmute_all') {
    return await handleMuteAllClearExecution();
  }

  if (command === 'switch_tab' || command === 'focus_tab') {
    const focusResult = await activateAndFocusTab(targetId, options && options.windowId);
    return { success: Boolean(focusResult && focusResult.success), tabId: targetId, command, focusResult };
  }

  const tabMedia = tabMediaMap.get(targetId);
  const pm = tabMedia ? tabMedia.primaryMedia : null;

  switch (command) {
    case 'play':
      if (pm) { pm.isPlaying = true; pm.state = 'playing'; }
      safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'play' });
      break;
    case 'pause':
      if (pm) { pm.isPlaying = false; pm.state = 'paused'; }
      safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'pause' });
      break;
    case 'toggle':
      if (pm) { pm.isPlaying = !pm.isPlaying; pm.state = pm.isPlaying ? 'playing' : 'paused'; }
      safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'toggle_play' });
      break;
    case 'mute':
      if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
        await browserAPI.tabs.update(targetId, { muted: true }).catch(() => {});
      }
      if (pm) pm.isMuted = true;
      safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'mute' });
      break;
    case 'unmute':
      if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
        await browserAPI.tabs.update(targetId, { muted: false }).catch(() => {});
      }
      if (pm) pm.isMuted = false;
      safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'unmute' });
      break;
    case 'seek': {
      const offset = Number(value) || 0;
      if (pm && typeof pm.currentTime === 'number') {
        const dur = (Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : 999999;
        pm.currentTime = Math.max(0, Math.min(dur, pm.currentTime + offset));
      }
      safeSendTabMessage(targetId, {
        type: 'MEDIA_CONTROL',
        action: 'seek_relative',
        data: { offsetSeconds: offset }
      });
      break;
    }
    case 'seek_to':
    case 'seek_absolute': {
      const targetSec = Math.max(0, Number(value) || 0);
      if (pm) pm.currentTime = targetSec;
      safeSendTabMessage(targetId, {
        type: 'MEDIA_CONTROL',
        action: 'seek_to',
        data: { positionSeconds: targetSec, seconds: targetSec }
      });
      break;
    }
    case 'seek_percent': {
      const pct = Math.max(0, Math.min(100, Number(value) || 0));
      if (pm && Number.isFinite(pm.duration) && pm.duration > 0) {
        pm.currentTime = (pct / 100) * pm.duration;
      }
      safeSendTabMessage(targetId, {
        type: 'MEDIA_CONTROL',
        action: 'seek_percent',
        data: { percent: pct }
      });
      break;
    }
    case 'set_volume': {
      const vol = Math.max(0, Math.min(1, Number(value) || 0));
      if (pm) pm.volume = vol;
      safeSendTabMessage(targetId, {
        type: 'MEDIA_CONTROL',
        action: 'set_volume',
        data: { volume: vol, percent: Math.round(vol * 100) }
      });
      break;
    }
    default:
      return { success: false, error: `Unknown command: ${command}` };
  }

  safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
  return { success: true, tabId: targetId, command, value };
}

/**
 * Transmits media telemetry payload to Video Detector HUD via WebSocket
 */
function sendMediaTelemetryToHUD() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  const globalMedia = synthesizeGlobalMediaState();
  const payload = {
    type: 'BROWSER_MEDIA_TELEMETRY',
    client: 'MediaSentinel',
    browser: navigator.userAgent.includes('Edg') ? 'Edge' : 'Chrome',
    timestamp: Date.now(),
    payload: globalMedia
  };

  try {
    ws.send(JSON.stringify(payload));
  } catch (e) {
    console.error('[MediaSentinel] Error sending media telemetry:', e);
  }
}

/**
 * Transmits current activity / domain update to Video Detector HUD via WebSocket
 */
function sendActivityUpdateToHUD() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  commitActiveInterval();

  const today = getTodayDateString();
  const domainEntry = activeDomain && activityData.domains[activeDomain];
  const todayDomainSec = (domainEntry && domainEntry.days[today]) ? domainEntry.days[today].seconds : 0;

  let todayTotalSec = 0;
  for (const d of Object.values(activityData.domains)) {
    if (d.days && d.days[today]) {
      todayTotalSec += d.days[today].seconds;
    }
  }

  const payload = {
    type: 'BROWSER_ACTIVITY_UPDATE',
    timestamp: Date.now(),
    payload: {
      activeDomain: activeDomain || 'Idle',
      isBrowserFocused,
      isUserActive,
      todayDomainSeconds: todayDomainSec,
      todayTotalSeconds: todayTotalSec
    }
  };

  try {
    ws.send(JSON.stringify(payload));
  } catch (e) {
    console.error('[MediaSentinel] Error sending activity update:', e);
  }
}

/**
 * Silently probes whether local Python host services (HUD on 65432, Data Hub on 65433)
 * are currently active using zero-console HTTP fetch probe before creating raw WebSockets.
 * Prevents Chromium C++ net::ERR_CONNECTION_REFUSED error logging in chrome://extensions.
 */
async function probePortLive(url, timeoutMs = 800) {
  if (typeof fetch !== 'function') {
    // If fetch is unavailable (e.g. Node.js unit tests without global fetch),
    // return true so mock WebSocket tests proceed cleanly.
    return true;
  }
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    const httpUrl = url.replace(/^ws:/i, 'http:').replace(/^wss:/i, 'https:');
    const options = {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store'
    };
    if (controller) {
      options.signal = controller.signal;
    }
    const res = await fetch(httpUrl, options).catch(() => null);
    if (timer) clearTimeout(timer);
    return res !== null;
  } catch (_) {
    return false;
  }
}

/**
 * Safely probes and connects to available Python services without triggering
 * Chromium net::ERR_CONNECTION_REFUSED console badges.
 */
function probeAndConnectServices(force = false) {
  connectWebSocket(force);
  connectDataHub(force);
}

/**
 * Establishes and maintains resilient WebSocket connection to ws://127.0.0.1:65432
 */
async function connectWebSocket() {
  const force = arguments[0] === true;
  if (force) {
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }
    wsReconnectIndex = 0;
    wsFailureCount = 0;
    wsReconnectPaused = false;
    if (ws && ws.readyState !== WebSocket.OPEN) {
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      } catch (_) {}
      ws = null;
    }
  }

  // If paused due to consecutive failures and not explicitly forced, do not reconnect
  if (wsReconnectPaused && !force) {
    return;
  }

  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  lastWsAttemptTime = Date.now();

  // In browser runtime where fetch is available, silently probe port before raw WebSocket creation
  // to eliminate Chromium C++ net::ERR_CONNECTION_REFUSED badges on chrome://extensions
  if (typeof fetch === 'function') {
    const isLive = await probePortLive(CONFIG.WS_URL);
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (!isLive) {
      handleWebSocketFailure();
      return;
    }
  }

  try {
    ws = new WebSocket(CONFIG.WS_URL);

    ws.onopen = () => {
      wsConnected = true;
      wsFailureCount = 0;
      wsReconnectIndex = 0;
      wsReconnectPaused = false;
      if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer);
        wsReconnectTimer = null;
      }

      // Initial registration message
      const extensionVersion = (browserAPI.runtime && typeof browserAPI.runtime.getManifest === 'function' && browserAPI.runtime.getManifest()?.version) || '2.5.0';
      const reg = {
        type: 'REGISTER_CLIENT',
        client: 'Web Activity & Media Sentinel',
        version: extensionVersion,
        browser: navigator.userAgent.includes('Edg') ? 'Edge' : 'Chrome',
        timestamp: Date.now()
      };
      try {
        ws.send(JSON.stringify(reg));
      } catch (_) {}

      // Immediately send current states
      sendMediaTelemetryToHUD();
      sendActivityUpdateToHUD();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.cmd === 'QUERY_MEDIA_STATE' || msg.cmd === 'QUERY_STATE') {
          sendMediaTelemetryToHUD();
          sendActivityUpdateToHUD();
        } else if (msg.cmd === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (e) {}
    };

    ws.onerror = () => {
      wsConnected = false;
      // Absorbs error quietly to eliminate ERR_CONNECTION_REFUSED console noise
    };

    ws.onclose = () => {
      wsConnected = false;
      handleWebSocketFailure();
    };
  } catch (e) {
    wsConnected = false;
    handleWebSocketFailure();
  }
}

function handleWebSocketFailure() {
  wsConnected = false;
  wsFailureCount++;

  if (wsFailureCount >= (CONFIG.MAX_CONSECUTIVE_FAILURES || 3)) {
    wsReconnectPaused = true;
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }
    console.info(`[MediaSentinel] HUD bridge is offline (${CONFIG.WS_URL}). Polling paused. Will reconnect on demand.`);
    return;
  }

  scheduleWebSocketReconnect();
}

function scheduleWebSocketReconnect() {
  if (wsReconnectTimer || wsReconnectPaused) return;
  const ladder = CONFIG.WS_RECONNECT_LADDER_MS || [5000, 15000, 30000, 60000, 120000];
  const delay = ladder[Math.min(wsReconnectIndex, ladder.length - 1)];
  wsReconnectIndex++;
  wsReconnectTimer = setTimeout(() => {
    wsReconnectTimer = null;
    connectWebSocket();
  }, delay);
}

/**
 * Cleans stale media entries for tabs that haven't responded or no longer exist
 */
function cleanStaleTabMedia() {
  const now = Date.now();
  for (const [tabId, mediaState] of tabMediaMap.entries()) {
    if (!mediaState || (!mediaState.hasMedia && !mediaState.anyPlaying && !mediaState.primaryMedia)) {
      tabMediaMap.delete(tabId);
      finalizeMediaSession(tabId);
      sendMediaTelemetryToHUD();
      continue;
    }
    if (mediaState && mediaState.timestamp && (now - mediaState.timestamp > 15000)) {
      browserAPI.tabs.get(tabId, (tab) => {
        if (browserAPI.runtime.lastError || !tab) {
          tabMediaMap.delete(tabId);
          finalizeMediaSession(tabId);
          sendMediaTelemetryToHUD();
        }
      });
    }
  }
}

// -----------------------------------------------------------------------------
// Chrome Lifecycle Event Listeners
// -----------------------------------------------------------------------------

// Active Tab Changed
browserAPI.tabs.onActivated.addListener(async (activeInfo) => {
  await ensureStorageLoaded();
  activeTabId = activeInfo.tabId;
  if (activeInfo.windowId) {
    activeWindowId = activeInfo.windowId;
  }
  try {
    const tab = await browserAPI.tabs.get(activeTabId);
    if (tab) {
      if (tab.windowId) activeWindowId = tab.windowId;
      if (tab.url && matchesTrackingBlacklist(tab.url)) {
        switchActiveDomain(null, false);
      } else {
        const domain = tab.url ? extractDomain(tab.url) : null;
        switchActiveDomain(domain, true);
        if (focusTimerState && focusTimerState.state === 'RUNNING_FOCUS') {
          if (isDistractingDomain(domain, tab.url)) {
            safeSendRuntimeMessage({
              type: 'FOCUS_DISTRACTION_EVENT',
              action: 'FOCUS_DISTRACTION_EVENT',
              domain: domain || 'unknown',
              reason: 'distracting_domain'
            });
          }
        }
      }
    } else {
      switchActiveDomain(null, false);
    }
  } catch (e) {
    switchActiveDomain(null, false);
  }

  // Defect 07: Auto-Pause on Tab Switch
  if (activeInfo && activeInfo.tabId) {
    handleAutoPauseOnTabChange(activeInfo.tabId).catch(() => {});
  }

  // Gentle wake-up if paused and cooled down (e.g. 2 minutes since last attempt)
  const tabSwitchNow = Date.now();
  if ((!wsConnected && wsReconnectPaused && (tabSwitchNow - lastWsAttemptTime > 120000)) ||
      (!dataHubConnected && dataHubReconnectPaused && (tabSwitchNow - lastDataHubAttemptTime > 120000))) {
    probeAndConnectServices();
  }
});

// New Tab Created (Defect 07: Auto-Pause on New Tab)
if (browserAPI.tabs && browserAPI.tabs.onCreated) {
  browserAPI.tabs.onCreated.addListener(async (tab) => {
    try {
      await ensureStorageLoaded();
      if (tab && tab.id) {
        handleAutoPauseOnTabChange(tab.id).catch(() => {});
      }
    } catch (_) {}
  });
}

// Tab Updated (URL changed, page navigated, or audible audio state changed)
browserAPI.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await ensureStorageLoaded();
  if (tabId === activeTabId && changeInfo.url) {
    if (matchesTrackingBlacklist(changeInfo.url)) {
      switchActiveDomain(null, false);
    } else {
      const domain = extractDomain(changeInfo.url);
      switchActiveDomain(domain, false);
      if (focusTimerState && focusTimerState.state === 'RUNNING_FOCUS') {
        if (isDistractingDomain(domain, changeInfo.url)) {
          safeSendRuntimeMessage({
            type: 'FOCUS_DISTRACTION_EVENT',
            action: 'FOCUS_DISTRACTION_EVENT',
            domain: domain || 'unknown',
            reason: 'distracting_domain'
          });
        }
      }
    }
  }

  // Finalize active media session on URL navigation (e.g. SPA route or new video URL)
  if (changeInfo.url && activeMediaSessions.has(tabId)) {
    const existingSession = activeMediaSessions.get(tabId);
    if (existingSession && existingSession.url) {
      const prevKey = extractCanonicalMediaId(existingSession.url);
      const newKey = extractCanonicalMediaId(changeInfo.url);
      if (prevKey && newKey && prevKey !== newKey) {
        finalizeMediaSession(tabId);
      }
    } else {
      finalizeMediaSession(tabId);
    }
  }

  // Audio state change (tab.audible becomes true / false)
  if (changeInfo.audible !== undefined) {
    handleTabAudibleStateChange(tabId, changeInfo.audible, tab);
    if (changeInfo.audible === true && focusTimerState && focusTimerState.state === 'RUNNING_FOCUS') {
      if (tabId !== activeTabId) {
        checkAndAutoMuteBackgroundTab(tabId).catch(() => {});
      }
    }
  }

  // Clear stale media state if tab reloads or navigates to a new page
  if (changeInfo.status === 'loading') {
    if (activeMediaSessions.has(tabId)) {
      finalizeMediaSession(tabId);
    }
    const existing = tabMediaMap.get(tabId);
    if (existing) {
      tabMediaMap.delete(tabId);
      sendMediaTelemetryToHUD();
    }
  }
});

// Tab Removed
browserAPI.tabs.onRemoved.addListener(async (tabId) => {
  await ensureStorageLoaded();
  if (activeMediaSessions.has(tabId)) {
    finalizeMediaSession(tabId);
  }
  if (tabMediaMap.has(tabId)) {
    tabMediaMap.delete(tabId);
    sendMediaTelemetryToHUD();
  }
  if (tabId === activeTabId) {
    commitActiveInterval();
    activeDomain = null;
    scheduleStorageSave(true);
  }
});

// Window Focus Changed
browserAPI.windows.onFocusChanged.addListener(async (windowId) => {
  await ensureStorageLoaded();
  if (windowId === browserAPI.windows.WINDOW_ID_NONE) {
    commitActiveInterval();
    isBrowserFocused = false;
    scheduleStorageSave(true);
  } else {
    isBrowserFocused = true;
    activeWindowId = windowId;
    intervalStartTime = Date.now();
    try {
      const tabs = await browserAPI.tabs.query({ active: true, windowId });
      if (tabs && tabs[0]) {
        activeTabId = tabs[0].id;
        if (tabs[0].windowId) activeWindowId = tabs[0].windowId;
        const domain = tabs[0].url ? extractDomain(tabs[0].url) : null;
        switchActiveDomain(domain, false);
      } else {
        switchActiveDomain(null, false);
      }
    } catch (e) {
      switchActiveDomain(null, false);
    }
  }
  sendActivityUpdateToHUD();
});

/**
 * Checks whether user is actively watching media in focused foreground tab
 * @returns {boolean}
 */
function isUserActivelyWatchingMedia() {
  if (!isBrowserFocused || !activeTabId) return false;
  const session = activeMediaSessions.get(activeTabId);
  if (session && session.isPlaying) return true;
  const mState = tabMediaMap.get(activeTabId) || tabMediaMap.get(String(activeTabId));
  if (mState && (mState.anyPlaying || (mState.primaryMedia && mState.primaryMedia.isPlaying))) {
    return true;
  }
  return false;
}

/**
 * Checks whether any media session is actively playing across all tabs
 * @returns {boolean}
 */
function hasAnyActivePlayingMedia() {
  for (const session of activeMediaSessions.values()) {
    if (session && session.isPlaying) return true;
  }
  for (const mState of tabMediaMap.values()) {
    if (mState && (mState.anyPlaying || (mState.primaryMedia && mState.primaryMedia.isPlaying))) {
      return true;
    }
  }
  return false;
}

/**
 * Evaluates inactivity auto-sleep and pauses unattended playback if threshold is reached
 * @param {number} now
 */
async function checkInactivityAutoSleep(now = Date.now()) {
  if (sleepTimerState && (sleepTimerState.state === 'RUNNING' || sleepTimerState.state === 'FADING') && !isUserActive && userIdleStartTime) {
    try {
      const advData = await browserAPI.storage.local.get(['sentinel_sleep_adv_inactivity_cutoff']);
      const isFastCutoff = advData && (advData.sentinel_sleep_adv_inactivity_cutoff === true || advData.sentinel_sleep_adv_inactivity_cutoff === 'true');
      if (isFastCutoff) {
        const elapsedIdleMs = (now - userIdleStartTime) + (CONFIG.IDLE_THRESHOLD_SECONDS * 1000);
        if (elapsedIdleMs >= 5 * 60 * 1000) {
          console.info('[MediaSentinel] Sleep fast-inactivity cutoff triggered (5m idle). Expiring sleep timer.');
          await triggerSleepTimerExpiration();
          return;
        }
      }
    } catch (_) {}
  }

  if (!sleepTimerSettings || sleepTimerSettings.enableInactivityAutoSleep !== true) {
    return;
  }
  if (isUserActive || !userIdleStartTime) {
    return;
  }
  if (isUserActivelyWatchingMedia()) {
    return;
  }
  const thresholdMinutes = Math.max(1, Number(sleepTimerSettings.inactivityThresholdMinutes) || 15);
  const thresholdMs = thresholdMinutes * 60 * 1000;
  const elapsedIdleMs = (now - userIdleStartTime) + (CONFIG.IDLE_THRESHOLD_SECONDS * 1000);
  if (elapsedIdleMs < thresholdMs) {
    return;
  }
  if (hasAnyActivePlayingMedia()) {
    console.info('[MediaSentinel] Inactivity threshold reached with unattended media streaming. Pausing playback.');
    await dispatchGlobalMediaAction('PAUSE_ALL');
  }
}

// Idle State Monitoring
browserAPI.idle.setDetectionInterval(CONFIG.IDLE_THRESHOLD_SECONDS);
browserAPI.idle.onStateChanged.addListener(async (newState) => {
  await ensureStorageLoaded();
  if (newState === 'idle' || newState === 'locked') {
    commitActiveInterval();
    isUserActive = false;
    userIdleStartTime = Date.now();
    scheduleStorageSave(true);
    // Note: Do NOT prematurely pause media on initial 60s idle state change.
    // Inactivity auto-sleep is evaluated after user-configured inactivityThresholdMinutes.
    await checkInactivityAutoSleep(Date.now());
  } else if (newState === 'active') {
    isUserActive = true;
    userIdleStartTime = 0;
    intervalStartTime = Date.now();
  }
  sendActivityUpdateToHUD();
});

// Service Worker Suspension Lifecycle Guard (Manifest V3 Standard)
if (browserAPI.runtime && browserAPI.runtime.onSuspend) {
  browserAPI.runtime.onSuspend.addListener(() => {
    const now = Date.now();
    for (const [, session] of activeMediaSessions.entries()) {
      if (session && session.isPlaying) {
        const elapsedMs = now - session.lastHeartbeat;
        const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
        if (elapsedSec > 0) {
          session.watchDuration += elapsedSec;
          session.lastHeartbeat += (elapsedSec * 1000);
          session.lastUpdated = now;
          updateMediaHistoryEntry(session, false);
        }
      }
    }
    commitActiveInterval();
    saveStorageData();
    saveMediaHistory();
  });
}

// Periodic Alarms: Storage Flush, WebSocket Verification & Digital Wellness
browserAPI.alarms.create('sentinel_flush_alarm', { periodInMinutes: CONFIG.FLUSH_INTERVAL_MINUTES });
browserAPI.alarms.create('DOOMSCROLL_CHECK_ALARM', { periodInMinutes: 1 });

/**
 * Digital Wellness & Doomscroll Breaker Alarm Handler (Phase 3: Defect 12)
 * Periodically evaluates active tab against entertainment hosts, accumulates consecutive browsing minutes,
 * triggers system notification and runtime alert when threshold is reached, and decrements on other sites.
 */
async function handleDoomscrollCheck() {
  try {
    const res = await browserAPI.storage.local.get(['focus_settings']);
    const focus_settings = res ? res.focus_settings : null;
    if (!focus_settings?.doomscroll_enabled) {
      doomscrollConsecutiveMinutes = 0;
      return;
    }

    if (!browserAPI.tabs || typeof browserAPI.tabs.query !== 'function') return;
    const [activeTab] = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true });
    if (!activeTab || !activeTab.url) {
      doomscrollConsecutiveMinutes = Math.max(0, doomscrollConsecutiveMinutes - 1);
      return;
    }

    let url;
    try {
      url = new URL(activeTab.url);
    } catch (_) {
      doomscrollConsecutiveMinutes = Math.max(0, doomscrollConsecutiveMinutes - 1);
      return;
    }

    const hostName = (url.hostname || '').toLowerCase();
    const isEntertainmentHost = DOOMSCROLL_ENTERTAINMENT_HOSTS.some(host => hostName === host || hostName.endsWith('.' + host));

    if (isEntertainmentHost) {
      doomscrollConsecutiveMinutes++;
      const limit = Math.max(1, Math.min(240, Number(focus_settings.doomscroll_interval_minutes) || 30));
      if (doomscrollConsecutiveMinutes >= limit) {
        if (browserAPI.notifications && typeof browserAPI.notifications.create === 'function') {
          browserAPI.notifications.create('doomscroll_nudge', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Digital Wellness: Take a Break! 🧘',
            message: `You have been browsing ${url.hostname} for ${doomscrollConsecutiveMinutes} minutes. Look away from the screen for 20 seconds.`,
            priority: 2
          });
        }
        if (browserAPI.runtime && typeof browserAPI.runtime.sendMessage === 'function') {
          browserAPI.runtime.sendMessage({
            type: 'DOOMSCROLL_ALERT',
            text: `Break recommended: ${doomscrollConsecutiveMinutes}m on ${url.hostname}`
          }).catch(() => {});
        }
        doomscrollConsecutiveMinutes = 0;
      }
    } else {
      doomscrollConsecutiveMinutes = Math.max(0, doomscrollConsecutiveMinutes - 1);
    }
  } catch (err) {
    console.error('[MediaSentinel] Error executing doomscroll check:', err);
  }
}

browserAPI.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'DOOMSCROLL_CHECK_ALARM') {
    await handleDoomscrollCheck();
    return;
  }
  if (alarm.name === FOCUS_TIMER_ALARM_NAME) {
    await handleFocusTimerExpired();
    return;
  }
  if (alarm.name === FOCUS_BREAK_ALARM_NAME) {
    await handleFocusBreakExpired();
    return;
  }
  if (alarm.name === SLEEP_ALARM_NAME) {
    if (!sleepTimerState || (sleepTimerState.state !== 'RUNNING' && sleepTimerState.state !== 'FADING')) {
      await purgeSleepTimerAlarms();
      return;
    }
    await triggerSleepTimerExpiration();
    return;
  }
  if (alarm.name === SLEEP_FADE_ALARM_NAME) {
    if (!sleepTimerState || sleepTimerState.state !== 'RUNNING') {
      await purgeSleepTimerAlarms();
      return;
    }
    await triggerSleepTimerFade();
    return;
  }

  if (alarm.name === 'sentinel_flush_alarm') {
    commitActiveInterval();
    saveStorageData();

    // Check & flush active media sessions with remainder preservation
    const now = Date.now();
    for (const [tabId, session] of activeMediaSessions.entries()) {
      if (session.isPlaying) {
        const elapsedMs = now - session.lastHeartbeat;
        const elapsedSec = Math.max(0, Math.min(60, Math.floor(elapsedMs / 1000)));
        if (elapsedSec > 0) {
          session.watchDuration += elapsedSec;
          session.lastHeartbeat += (elapsedSec * 1000);
          const isForeground = (tabId === activeTabId && isBrowserFocused);
          if (!isForeground) {
            commitBackgroundMediaDelta(session.domain, elapsedSec);
          }
        }
        updateMediaHistoryEntry(session, false);
      }
    }
    saveMediaHistory();

    // Inactivity Auto-Sleep Sentinel check
    await checkInactivityAutoSleep(now);

    // Sleep Timer periodic check & badge countdown update
    if (sleepTimerState && (sleepTimerState.state === 'RUNNING' || sleepTimerState.state === 'FADING')) {
      if (sleepTimerState.targetTime > 0) {
        const remainingMs = sleepTimerState.targetTime - now;
        if (remainingMs <= 0) {
          await triggerSleepTimerExpiration();
        } else {
          updateActionBadge(remainingMs, sleepTimerState.durationMs);
        }
      }
    } else if (sleepTimerState && (sleepTimerState.state === 'IDLE' || sleepTimerState.state === 'CANCELLED')) {
      await purgeSleepTimerAlarms();
    }

    // Focus Timer periodic check & badge countdown update
    if (focusTimerState && (focusTimerState.state === 'RUNNING_FOCUS' || focusTimerState.state === 'RUNNING_BREAK') && focusTimerState.targetTime) {
      const remainingMs = focusTimerState.targetTime - now;
      if (remainingMs <= 0) {
        if (focusTimerState.mode === 'focus') {
          await handleFocusTimerExpired();
        } else {
          await handleFocusBreakExpired();
        }
      } else {
        focusTimerState.remainingSeconds = Math.max(0, Math.round(remainingMs / 1000));
        if (focusTimerSettings.showBadgeCountdown) {
          updateFocusActionBadge(remainingMs);
        }
      }
    }

    if (!wsConnected) {
      if (!wsReconnectPaused) {
        connectWebSocket();
      } else if (now - lastWsAttemptTime >= 600000) {
        // Gentle 10-minute retry check via zero-console pre-flight probe
        probeAndConnectServices();
      }
    } else {
      sendMediaTelemetryToHUD();
      sendActivityUpdateToHUD();
    }

    if (!dataHubConnected) {
      if (!dataHubReconnectPaused) {
        connectDataHub();
      } else if (now - lastDataHubAttemptTime >= 600000) {
        // Gentle 10-minute retry check via zero-console pre-flight probe
        probeAndConnectServices();
      }
    }
  }
});

// Message Handling from Content Scripts and Popup
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || (!message.type && !message.action)) return;
  const msgType = message.action || message.type;

  // Media state reported from content script
  if (message.type === 'MEDIA_STATE_CHANGED') {
    const tabId = sender.tab ? sender.tab.id : 0;
    const windowId = sender.tab ? sender.tab.windowId : (activeWindowId || 0);
    const frameId = sender.frameId || 0;
    const payload = message.payload || {};

    if (tabId) {
      const existing = tabMediaMap.get(tabId);

      // Guard: Ignore messages from subframes that have NO media
      if (frameId !== 0 && !payload.hasMedia) {
        sendResponse({ received: true, ignored: true });
        return true;
      }

      // Check whether this payload actually contains verifiable media
      const hasMediaContent = Boolean(
        payload.hasMedia ||
        payload.anyPlaying ||
        (payload.totalVideos && payload.totalVideos > 0) ||
        (payload.totalAudios && payload.totalAudios > 0) ||
        (payload.primaryMedia && (payload.primaryMedia.isPlaying || payload.primaryMedia.src || (typeof payload.primaryMedia.duration === 'number' && payload.primaryMedia.duration > 0)))
      );

      // If page has NO media content, purge from tabMediaMap and finalize session
      if (!hasMediaContent) {
        if (tabMediaMap.has(tabId)) {
          finalizeMediaSession(tabId);
          tabMediaMap.delete(tabId);
          sendMediaTelemetryToHUD();
          safeSendRuntimeMessage({
            type: 'LIVE_MEDIA_UPDATE',
            payload: synthesizeGlobalMediaState()
          });
        }
        sendResponse({ received: true, removed: true });
        return true;
      }

      // Stamp tabId and windowId on telemetry payload
      payload.tabId = tabId;
      payload.windowId = windowId;

      // If top frame or subframe with media: attach tabId and windowId
      if (payload.primaryMedia) {
        payload.primaryMedia.tabId = tabId;
        payload.primaryMedia.windowId = windowId;
      }

      // Guard: Do not allow an idle subframe to overwrite an active playing top frame
      if (existing && existing.anyPlaying && !payload.anyPlaying && frameId !== 0) {
        sendResponse({ received: true, retained: true });
        return true;
      }

      tabMediaMap.set(tabId, payload);
      sendMediaTelemetryToHUD();

      // Track session and persist to mediaHistory
      trackMediaSession(tabId, payload);

      // Broadcast live media update immediately to open popup / dashboard (safe IPC broadcast)
      safeSendRuntimeMessage({
        type: 'LIVE_MEDIA_UPDATE',
        payload: synthesizeGlobalMediaState()
      });
    }
    sendResponse({ received: true });
    return true;
  }

  // User presence reported from page
  if (message.type === 'PAGE_USER_INTERACTION') {
    isUserActive = true;
    sendResponse({ received: true });
    return true;
  }

  // Popup / Dashboard data request (Supports forceRefresh for interactive button)
  if (message.type === 'GET_DASHBOARD_DATA') {
    (async () => {
      await ensureStorageLoaded();
      commitActiveInterval();
      cleanStaleTabMedia();

      // Synchronize all currently playing active media sessions into mediaHistory
      const now = Date.now();
      for (const [, session] of activeMediaSessions.entries()) {
        if (session && session.isPlaying) {
          const elapsedMs = now - session.lastHeartbeat;
          const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
          if (elapsedSec > 0) {
            session.watchDuration += elapsedSec;
            session.lastHeartbeat += (elapsedSec * 1000);
            session.lastUpdated = now;
          }
          updateMediaHistoryEntry(session, false);
        }
      }

      scheduleStorageSave(false);

      if (message.forceRefresh) {
        if (!wsConnected && wsReconnectPaused) {
          if (typeof fetch === 'function') {
            probePortLive(CONFIG.WS_URL).then((live) => {
              if (live) connectWebSocket(true);
            });
          } else {
            connectWebSocket(true);
          }
        }
        if (!dataHubConnected && dataHubReconnectPaused) {
          if (typeof fetch === 'function') {
            probePortLive(CONFIG.DATA_HUB_URL).then((live) => {
              if (live) connectDataHub(true);
            });
          } else {
            connectDataHub(true);
          }
        }
      }

      const respondWithFreshData = () => {
        const globalMedia = synthesizeGlobalMediaState();
        sendResponse({
          activityData,
          mediaHistory,
          globalMediaState: globalMedia,
          wsConnected,
          wsReconnectPaused,
          dataHubConnected,
          dataHubReconnectPaused,
          dataHubRegistered,
          detectedBrowser,
          clientId,
          offlineQueueCount: offlineSyncQueue.length,
          activeDomain,
          activeTabId,
          todayStr: getTodayDateString(),
          settings,
          sleepTimerState,
          sleepTimerSettings,
          isTrackingPaused
        });
      };

      if (message.forceRefresh && activeTabId) {
        safeSendTabMessage(activeTabId, { type: 'QUERY_PAGE_MEDIA' }, (res) => {
          if (res && res.hasMedia) {
            res.tabId = activeTabId;
            res.windowId = activeWindowId || 0;
            if (res.primaryMedia) {
              res.primaryMedia.tabId = activeTabId;
              res.primaryMedia.windowId = activeWindowId || 0;
            }
            tabMediaMap.set(activeTabId, res);
            sendMediaTelemetryToHUD();
          }
          respondWithFreshData();
        });
      } else {
        if (activeTabId) {
          safeSendTabMessage(activeTabId, { type: 'QUERY_PAGE_MEDIA' }, (res) => {
            if (res && res.hasMedia) {
              res.tabId = activeTabId;
              res.windowId = activeWindowId || 0;
              if (res.primaryMedia) {
                res.primaryMedia.tabId = activeTabId;
                res.primaryMedia.windowId = activeWindowId || 0;
              }
              tabMediaMap.set(activeTabId, res);
              sendMediaTelemetryToHUD();
            }
          });
        }
        respondWithFreshData();
      }
    })();
    return true;
  }

  // Handle desktop HUD auto-launch (Zero-Prompt Native Messaging Standard + WebSocket Reconnection)
  if (message.type === 'LAUNCH_DESKTOP_HUD' || message.type === 'LAUNCH_HUD_APP' || message.type === 'LAUNCH_HUD') {
    let nativeDispatched = false;

    // Reset failure counter and pause state on explicit user HUD launch
    wsFailureCount = 0;
    wsReconnectPaused = false;
    wsReconnectIndex = 0;

    // 1. Attempt Zero-Prompt Native Messaging Host execution (com.antigravity.videohud)
    if (typeof browserAPI.runtime.sendNativeMessage === 'function') {
      try {
        browserAPI.runtime.sendNativeMessage(
          'com.antigravity.videohud',
          { action: 'launch', timestamp: Date.now() },
          (response) => {
            const err = browserAPI.runtime.lastError;
            if (err || !response || response.status === 'error') {
              console.warn('[Sentinel Native] Native host launch warning / unavailable:', err ? err.message : response);
              try {
                sendResponse({ success: false, fallbackRequired: true, error: err ? err.message : 'Host unavailable' });
              } catch (_) {}
            } else {
              console.log('[Sentinel Native] HUD launched silently via Native Host:', response);
              try {
                sendResponse({ success: true, native: true, response });
              } catch (_) {}
            }
          }
        );
        nativeDispatched = true;
      } catch (err) {
        console.warn('[Sentinel Native] Exception calling sendNativeMessage:', err);
        nativeDispatched = false;
      }
    }

    // 2. Schedule WebSocket reconnection passes to connect as soon as HUD socket binds
    connectWebSocket(true);
    [600, 1500, 3000, 5000].forEach((delay) => {
      setTimeout(() => {
        if (!wsConnected) {
          connectWebSocket(true);
        }
      }, delay);
    });

    if (!nativeDispatched) {
      sendResponse({ success: false, fallbackRequired: true });
    }
    return true;
  }

  // Interactive Media Control relay (from Popup/Dashboard to Content Script)
  if (message.type === 'CONTROL_MEDIA') {
    const globalMedia = synthesizeGlobalMediaState();
    let targetTabId = (message.tabId ? Number(message.tabId) : null) || (globalMedia.primaryMedia && globalMedia.primaryMedia.tabId) || activeTabId;

    if (!targetTabId && activeTabId) {
      targetTabId = activeTabId;
    }

    if (targetTabId) {
      // Log control actions in active session & mediaHistory
      let session = activeMediaSessions.get(targetTabId);
      if (!session && globalMedia.primaryMedia) {
        // Initialize an active session if one doesn't exist
        trackMediaSession(targetTabId, {
          primaryMedia: globalMedia.primaryMedia,
          domain: globalMedia.primaryMedia.domain,
          title: globalMedia.primaryMedia.title,
          url: globalMedia.primaryMedia.src || ''
        });
        session = activeMediaSessions.get(targetTabId);
      }

      if (session) {
        session.controlEvents = session.controlEvents || [];
        session.controlEvents.push({
          action: message.action,
          data: message.data || {},
          timestamp: Date.now()
        });
        if (session.controlEvents.length > 25) {
          session.controlEvents.shift();
        }

        if (message.action === 'step_speed') {
          const cur = session.playbackRate || 1.0;
          const targetSpeed = (message.data && typeof message.data.targetSpeed === 'number' && message.data.targetSpeed >= 0.25 && message.data.targetSpeed <= 2.0)
            ? message.data.targetSpeed
            : calculateNextLadderSpeed(cur, (message.data && (message.data.direction || (message.data.step < 0 ? 'down' : 'up'))) || 'up');
          session.playbackRate = targetSpeed;
        } else if (message.action === 'set_speed' && message.data && typeof message.data.rate === 'number') {
          session.playbackRate = Math.max(0.25, Math.min(2.0, Math.round(message.data.rate * 100) / 100));
        }

        if (message.action === 'set_quality' && message.data && message.data.quality) {
          session.resolution = message.data.quality;
        } else if (message.action === 'step_quality') {
          session.lastQualityDirection = message.data ? message.data.direction : 'step';
        }

        if (message.action === 'toggle_fullscreen') {
          session.lastWindowMode = 'fullscreen';
        } else if (message.action === 'toggle_pip') {
          session.lastWindowMode = 'pip';
        } else if (message.action === 'toggle_theater') {
          session.lastWindowMode = 'theater';
        }

        session.lastUpdated = Date.now();
        updateMediaHistoryEntry(session, true);
      }

      // Optimistically update tabMediaMap.get(targetTabId).primaryMedia to eliminate stale bounce-back
      let tabMedia = tabMediaMap.get(targetTabId);
      if (!tabMedia && globalMedia.primaryMedia && globalMedia.primaryMedia.tabId === targetTabId) {
        tabMedia = {
          hasMedia: true,
          anyPlaying: Boolean(globalMedia.primaryMedia.isPlaying),
          primaryMedia: { ...globalMedia.primaryMedia }
        };
        tabMediaMap.set(targetTabId, tabMedia);
      }

      if (tabMedia && tabMedia.primaryMedia) {
        const pm = tabMedia.primaryMedia;
        if (message.action === 'toggle_play') {
          pm.isPlaying = !pm.isPlaying;
          pm.state = pm.isPlaying ? 'playing' : 'paused';
          tabMedia.anyPlaying = pm.isPlaying;
          if (session) session.isPlaying = pm.isPlaying;
        } else if (message.action === 'play') {
          pm.isPlaying = true;
          pm.state = 'playing';
          tabMedia.anyPlaying = true;
          if (session) session.isPlaying = true;
        } else if (message.action === 'pause') {
          pm.isPlaying = false;
          pm.state = 'paused';
          tabMedia.anyPlaying = false;
          if (session) session.isPlaying = false;
        } else if (message.action === 'toggle_mute') {
          pm.isMuted = !pm.isMuted;
        } else if (message.action === 'mute') {
          pm.isMuted = true;
        } else if (message.action === 'unmute') {
          pm.isMuted = false;
        } else if (message.action === 'step_speed' || message.action === 'set_speed') {
          if (message.action === 'step_speed') {
            const cur = pm.playbackRate || 1.0;
            const targetSpeed = (message.data && typeof message.data.targetSpeed === 'number' && message.data.targetSpeed >= 0.25 && message.data.targetSpeed <= 2.0)
              ? message.data.targetSpeed
              : calculateNextLadderSpeed(cur, (message.data && (message.data.direction || (message.data.step < 0 ? 'down' : 'up'))) || 'up');
            pm.playbackRate = targetSpeed;
          } else if (message.action === 'set_speed' && message.data && typeof message.data.rate === 'number') {
            pm.playbackRate = Math.max(0.25, Math.min(2.0, Math.round(message.data.rate * 100) / 100));
          }
        } else if (message.action === 'seek_relative' && message.data && typeof message.data.offsetSeconds === 'number') {
          const curTime = Number(pm.currentTime) || 0;
          const dur = (Number(pm.duration) > 0) ? Number(pm.duration) : 999999;
          pm.currentTime = Math.max(0, Math.min(dur, curTime + message.data.offsetSeconds));
        } else if ((message.action === 'seek_to' || message.action === 'seek_absolute') && message.data) {
          const targetSec = (typeof message.data.positionSeconds === 'number')
            ? message.data.positionSeconds
            : ((typeof message.data.seconds === 'number') ? message.data.seconds : 0);
          pm.currentTime = Math.max(0, targetSec);
        } else if (message.action === 'seek_percent' && message.data) {
          const dur = (Number(pm.duration) > 0) ? Number(pm.duration) : 0;
          if (typeof message.data.positionSeconds === 'number' && message.data.positionSeconds >= 0) {
            pm.currentTime = message.data.positionSeconds;
          } else if (typeof message.data.percent === 'number' && dur > 0) {
            pm.currentTime = (message.data.percent / 100) * dur;
          }
        }

        // Broadcast optimistic update immediately
        safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
      }

      safeSendTabMessage(targetTabId, {
        type: 'MEDIA_CONTROL',
        action: message.action,
        data: message.data || {}
      }, (res, err) => {
        setTimeout(() => {
          sendMediaTelemetryToHUD();
        }, 150);
        sendResponse({ success: !err, result: res });
      });
      return true;
    } else {
      sendResponse({ success: false, error: 'No active media tab found' });
      return true;
    }
  }

  // Audio Lab Settings Relay from Popup to Content Script
  if (message.type === 'APPLY_AUDIO_LAB_SETTINGS') {
    const globalMedia = synthesizeGlobalMediaState();
    let targetTabId = (message.tabId ? Number(message.tabId) : null) || (globalMedia.primaryMedia && globalMedia.primaryMedia.tabId) || activeTabId;
    if (targetTabId) {
      safeSendTabMessage(targetTabId, {
        type: 'APPLY_AUDIO_LAB_SETTINGS',
        settings: message.settings || {}
      }, (res, err) => {
        sendResponse({ success: !err, result: res });
      });
      return true;
    }
    sendResponse({ success: false, error: 'No active media tab found' });
    return true;
  }

  // Focus and switch to the browser tab where primary media is active
  if (message.type === 'JUMP_TO_MEDIA_TAB') {
    (async () => {
      await ensureStorageLoaded();

      // Candidate list of tabs to evaluate in sequence
      const candidateTabIds = new Set();
      const tabWindowMap = new Map();

      // Priority 1: Explicit tabId from message
      if (message.tabId && Number(message.tabId)) {
        const tid = Number(message.tabId);
        candidateTabIds.add(tid);
        if (message.windowId) tabWindowMap.set(tid, Number(message.windowId));
      }

      // Priority 2: primaryMedia from synthesizeGlobalMediaState()
      const globalMedia = synthesizeGlobalMediaState();
      if (globalMedia && globalMedia.primaryMedia && globalMedia.primaryMedia.tabId) {
        const tid = Number(globalMedia.primaryMedia.tabId);
        candidateTabIds.add(tid);
        if (globalMedia.primaryMedia.windowId) tabWindowMap.set(tid, Number(globalMedia.primaryMedia.windowId));
      }

      // Priority 3: Any active playing tab in tabMediaMap
      for (const [tId, mState] of tabMediaMap.entries()) {
        if (mState && (mState.anyPlaying || (mState.primaryMedia && mState.primaryMedia.isPlaying))) {
          const tid = Number(tId);
          candidateTabIds.add(tid);
          if (mState.windowId) tabWindowMap.set(tid, Number(mState.windowId));
        }
      }

      // Priority 4: Any tab in tabMediaMap with detected media nodes
      for (const [tId, mState] of tabMediaMap.entries()) {
        if (mState && (mState.hasMedia || mState.primaryMedia)) {
          const tid = Number(tId);
          candidateTabIds.add(tid);
          if (mState.windowId) tabWindowMap.set(tid, Number(mState.windowId));
        }
      }

      // Test all collected candidates first
      for (const tid of candidateTabIds) {
        const result = await activateAndFocusTab(tid, tabWindowMap.get(tid));
        if (result) {
          sendResponse(result);
          return;
        }
      }

      // Priority 5: Fallback to Universal Tab Query across ALL open browser tabs
      try {
        if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
          const allTabs = await browserAPI.tabs.query({});
          if (allTabs && allTabs.length > 0) {
            // 5A. Tab with audible: true (Sound is actively playing!)
            const audibleTab = allTabs.find(t => Boolean(t.audible));
            if (audibleTab) {
              const res = await activateAndFocusTab(audibleTab.id, audibleTab.windowId);
              if (res) {
                sendResponse(res);
                return;
              }
            }

            // 5B. Known media domain or video streaming URL pattern
            const MEDIA_PATTERNS = [
              'youtube.com', 'youtu.be', 'netflix.com', 'spotify.com', 'twitch.tv',
              'vimeo.com', 'soundcloud.com', 'dailymotion.com', 'hotstar.com',
              'primevideo.com', 'disneyplus.com', 'hulu.com', 'bilibili.com',
              'tiktok.com', 'ted.com', 'rumble.com', 'odysee.com'
            ];
            const isMediaTab = (tab) => {
              if (!tab || !tab.url) return false;
              const urlLower = tab.url.toLowerCase();
              if (MEDIA_PATTERNS.some(d => urlLower.includes(d))) return true;
              if (/(\/watch|\/video|\/stream|\.mp4|\.webm|\.m3u8)/i.test(urlLower)) return true;
              if (tab.title && /(- YouTube|▶|Playing|Video|Movie)/i.test(tab.title)) return true;
              return false;
            };

            const mediaUrlTab = allTabs.find(isMediaTab);
            if (mediaUrlTab) {
              const res = await activateAndFocusTab(mediaUrlTab.id, mediaUrlTab.windowId);
              if (res) {
                sendResponse(res);
                return;
              }
            }
          }
        }
      } catch (err) {
        console.warn('[MediaSentinel] Fallback universal tab search error:', err);
      }

      // Only if every single candidate and fallback fails
      sendResponse({ success: false, error: 'No active media tab found' });
    })();
    return true; // Keep port open for asynchronous sendResponse
  }

  // Direct SET_VOLUME relay (from Popup/Dashboard to Content Script)
  if (message.type === 'SET_VOLUME') {
    const globalMedia = synthesizeGlobalMediaState();
    let targetTabId = (message.tabId ? Number(message.tabId) : null) || (globalMedia.primaryMedia && globalMedia.primaryMedia.tabId) || activeTabId;

    if (!targetTabId && activeTabId) {
      targetTabId = activeTabId;
    }

    if (targetTabId) {
      safeSendTabMessage(targetTabId, {
        type: 'MEDIA_CONTROL',
        action: 'set_volume',
        data: message.data || { volume: message.volume, percent: message.percent }
      }, (res, err) => {
        setTimeout(() => {
          sendMediaTelemetryToHUD();
        }, 150);
        sendResponse({ success: !err, result: res });
      });
      return true;
    } else {
      sendResponse({ success: false, error: 'No active media tab found' });
      return true;
    }
  }

  // Get Settings request
  if (message.type === 'GET_SETTINGS') {
    sendResponse({ settings });
    return true;
  }

  // Update Settings request
  if (message.type === 'UPDATE_SETTINGS') {
    saveSettings(message.settings || {}).then(() => {
      sendResponse({ success: true, settings });
    });
    return true;
  }

  // Clear all data request (both activity time and media history)
  if (message.type === 'CLEAR_ALL_DATA') {
    activityData = {
      domains: {},
      historyDaysCount: 1,
      firstTrackedDate: getTodayDateString(),
      lastUpdated: Date.now()
    };
    mediaHistory = [];
    activeMediaSessions.clear();
    Promise.all([saveStorageData(), saveMediaHistory()]).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  // Clear media history only
  if (message.type === 'CLEAR_MEDIA_HISTORY') {
    mediaHistory = [];
    activeMediaSessions.clear();
    saveMediaHistory().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  // Clear time tracking only
  if (message.type === 'CLEAR_TIME_DATA') {
    activityData = {
      domains: {},
      historyDaysCount: 1,
      firstTrackedDate: getTodayDateString(),
      lastUpdated: Date.now()
    };
    saveStorageData().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  // Manually trigger HUD WebSocket reconnection
  if (message.type === 'TRIGGER_WS_RECONNECT' || message.type === 'RECONNECT_WS') {
    connectWebSocket(true);
    sendResponse({ initiated: true, wsConnected });
    return true;
  }

  // Query live connection & bridge status with safe probe check
  if (message.type === 'QUERY_STATE') {
    if (!wsConnected && wsReconnectPaused) {
      if (typeof fetch === 'function') {
        probePortLive(CONFIG.WS_URL).then((live) => {
          if (live) connectWebSocket(true);
        });
      } else {
        connectWebSocket(true);
      }
    }
    if (!dataHubConnected && dataHubReconnectPaused) {
      if (typeof fetch === 'function') {
        probePortLive(CONFIG.DATA_HUB_URL).then((live) => {
          if (live) connectDataHub(true);
        });
      } else {
        connectDataHub(true);
      }
    }
    sendResponse({
      wsConnected,
      wsReconnectPaused,
      dataHubConnected,
      dataHubReconnectPaused,
      detectedBrowser,
      clientId
    });
    return true;
  }

  // Query Standalone SQLite Data Hub directly from Popup or Dashboard
  if (message.type === 'QUERY_DATA_HUB') {
    const queryType = (message.queryType || message.query || 'ANALYTICS').toUpperCase();
    const reqBrowser = message.browser || message.browser_type || 'all';
    const reqDate = message.date || message.date_str || getTodayDateString();
    const reqTrackingMode = message.tracking_mode || message.trackingMode || 'all';

    if (!dataHubConnected || !dataHubWs || dataHubWs.readyState !== WebSocket.OPEN) {
      sendResponse({
        success: false,
        offline: true,
        dataHubConnected: false,
        error: 'Standalone Data Hub (ws://127.0.0.1:65433) is currently offline.'
      });
      return true;
    }

    const reqId = `query_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timer = setTimeout(() => {
      pendingQueryCallbacks.delete(reqId);
      sendResponse({
        success: false,
        timeout: true,
        dataHubConnected: true,
        error: 'Data Hub query timed out (2500ms).'
      });
    }, 2500);

    pendingQueryCallbacks.set(reqId, {
      queryType,
      resolve: (hubResponse) => {
        sendResponse({
          success: true,
          offline: false,
          dataHubConnected: true,
          filter_browser: reqBrowser,
          data: hubResponse.data || hubResponse
        });
      },
      timer
    });

    if (queryType === 'LIVE_STATE') {
      sendDataHubMessage({
        type: 'QUERY_LIVE_STATE',
        requestId: reqId
      });
    } else {
      sendDataHubMessage({
        type: 'QUERY_ANALYTICS',
        browser: reqBrowser,
        date_str: reqDate,
        tracking_mode: reqTrackingMode,
        requestId: reqId
      });
    }

    return true; // async sendResponse
  }

  // Manually trigger Data Hub WebSocket reconnection and silent auto-launch
  if (message.type === 'TRIGGER_DATA_HUB_RECONNECT' || message.type === 'LAUNCH_DATA_HUB' || message.type === 'RECONNECT_DATA_HUB') {
    dataHubFailureCount = 0;
    dataHubReconnectPaused = false;
    dataHubReconnectIndex = 0;
    let nativeDispatched = false;
    if (!dataHubConnected && typeof browserAPI.runtime.sendNativeMessage === 'function') {
      try {
        browserAPI.runtime.sendNativeMessage(
          'com.antigravity.videohud',
          { action: 'launch_hub', timestamp: Date.now() },
          (response) => {
            console.log('[MediaSentinel] Data Hub launch signal sent to Native Host:', response);
          }
        );
        nativeDispatched = true;
      } catch (e) {
        console.warn('[MediaSentinel] Could not dispatch native message for Data Hub:', e);
      }
    }
    // Force immediate connection, resetting timers and stuck sockets
    connectDataHub(true);
    [250, 600, 1200, 2500].forEach((delay) => {
      setTimeout(() => {
        if (!dataHubConnected) connectDataHub(true);
      }, delay);
    });
    sendResponse({ initiated: true, dataHubConnected, nativeDispatched });
    return true;
  }

  // ---------------------------------------------------------------------------
  // Sleep Timer Subsystem & Global Media IPC Message Handlers
  // ---------------------------------------------------------------------------

  if (msgType === 'SET_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const updatedState = await setSleepTimer(message.durationMinutes, message.options || {
        enableFadeOut: message.enableFade !== undefined ? message.enableFade : undefined
      });
      sendResponse({ success: true, state: updatedState });
    })();
    return true;
  }

  if (msgType === 'CANCEL_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const result = await cancelSleepTimer();
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'PAUSE_SLEEP_TIMER' || message.action === 'PAUSE_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await pauseSleepTimer();
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'RESUME_SLEEP_TIMER' || message.action === 'RESUME_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await resumeSleepTimer();
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'EXTEND_SLEEP_TIMER' || message.action === 'EXTEND_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const mins = message.extraMinutes || message.minutes || 15;
      const res = await extendSleepTimer(mins);
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'END_OF_VIDEO' || message.action === 'END_OF_VIDEO') {
    (async () => {
      await ensureStorageLoaded();
      const res = await handleEndOfVideoTrigger(sender.tab ? sender.tab.id : null);
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'GET_SLEEP_TIMER_STATE') {
    (async () => {
      await ensureStorageLoaded();
      if (sleepTimerState.state === 'RUNNING' && sleepTimerState.targetTime <= Date.now()) {
        await triggerSleepTimerExpiration();
      }
      sendResponse({
        success: true,
        state: sleepTimerState,
        settings: sleepTimerSettings
      });
    })();
    return true;
  }

  if (msgType === 'GET_SLEEP_SETTINGS') {
    (async () => {
      await ensureStorageLoaded();
      sendResponse({ success: true, settings: sleepTimerSettings });
    })();
    return true;
  }

  if (msgType === 'UPDATE_SLEEP_SETTINGS' || msgType === 'SAVE_SLEEP_SETTINGS') {
    (async () => {
      await ensureStorageLoaded();
      await saveSleepTimerSettings(message.settings || {});
      sendResponse({ success: true, settings: sleepTimerSettings });
    })();
    return true;
  }

  if (msgType === 'TOGGLE_GLOBAL_MEDIA') {
    (async () => {
      await ensureStorageLoaded();
      const result = await dispatchGlobalMediaAction(message.command || 'TOGGLE');
      sendResponse(result);
    })();
    return true;
  }

  // ---------------------------------------------------------------------------
  // Focus Sentinel & Pomodoro IPC Message Handlers (Phase 2)
  // ---------------------------------------------------------------------------

  if (msgType === 'START_FOCUS_TIMER' || message.action === 'START_FOCUS_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await startFocusTimer(message.durationMinutes, message.mode || 'focus');
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'PAUSE_FOCUS_TIMER' || message.action === 'PAUSE_FOCUS_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await pauseFocusTimer();
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'RESUME_FOCUS_TIMER' || message.action === 'RESUME_FOCUS_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await resumeFocusTimer();
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'RESET_FOCUS_TIMER' || message.action === 'RESET_FOCUS_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await resetFocusTimer();
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'EXTEND_FOCUS_TIMER' || message.action === 'EXTEND_FOCUS_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const mins = message.extraMinutes !== undefined ? message.extraMinutes : (message.minutes !== undefined ? message.minutes : 5);
      const res = await extendFocusTimer(mins);
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'GET_FOCUS_TIMER_STATE' || message.action === 'GET_FOCUS_TIMER_STATE') {
    (async () => {
      await ensureStorageLoaded();
      const now = Date.now();
      if ((focusTimerState.state === 'RUNNING_FOCUS' || focusTimerState.state === 'RUNNING_BREAK') && focusTimerState.targetTime) {
        if (focusTimerState.targetTime <= now) {
          if (focusTimerState.mode === 'focus') {
            await handleFocusTimerExpired();
          } else {
            await handleFocusBreakExpired();
          }
        } else {
          focusTimerState.remainingSeconds = Math.max(0, Math.round((focusTimerState.targetTime - now) / 1000));
        }
      }
      const todayKey = new Date().toISOString().split('T')[0];
      sendResponse({
        success: true,
        state: focusTimerState,
        settings: focusTimerSettings,
        todayMetrics: dailyFocusMetrics[todayKey] || { totalFocusSeconds: 0, completedSessions: 0, sessionHistory: [] }
      });
    })();
    return true;
  }

  if (msgType === 'SAVE_FOCUS_SETTINGS' || message.action === 'SAVE_FOCUS_SETTINGS') {
    (async () => {
      await ensureStorageLoaded();
      await saveFocusSettings(message.settings || {});
      sendResponse({ success: true, settings: focusTimerSettings });
    })();
    return true;
  }

  if (msgType === 'GET_FOCUS_METRICS' || message.action === 'GET_FOCUS_METRICS') {
    (async () => {
      await ensureStorageLoaded();
      sendResponse({ success: true, metrics: dailyFocusMetrics });
    })();
    return true;
  }

  // Get current time tracking pause state
  if (msgType === 'GET_TRACKING_PAUSE_STATE') {
    (async () => {
      await ensureStorageLoaded();
      sendResponse({ success: true, isTrackingPaused });
    })();
    return true;
  }

  // Toggle time tracking pause/resume state
  if (msgType === 'TOGGLE_TRACKING_PAUSE') {
    (async () => {
      await ensureStorageLoaded();
      isTrackingPaused = !isTrackingPaused;
      await browserAPI.storage.local.set({ sentinel_tracking_paused: isTrackingPaused });
      if (!isTrackingPaused) {
        intervalStartTime = Date.now();
      } else {
        commitActiveInterval();
      }
      safeSendRuntimeMessage({ type: 'TRACKING_PAUSE_CHANGED', isTrackingPaused });
      sendResponse({ success: true, isTrackingPaused });
    })();
    return true;
  }

  // ---------------------------------------------------------------------------
  // Phase 2: Multi-Tab Live Media Deck & Audio Visualizer (Features 3 & 4)
  // ---------------------------------------------------------------------------
  if (msgType === 'DASHBOARD_GET_ALL_MEDIA_STREAMS') {
    (async () => {
      await ensureStorageLoaded();
      cleanStaleTabMedia();
      const streams = await getAllActiveMediaStreams();
      sendResponse({ success: true, streams });
    })();
    return true;
  }

  if (msgType === 'MEDIA_STREAM_SOLO_CLEAR') {
    (async () => {
      await ensureStorageLoaded();
      const result = await handleSoloTabClearExecution();
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'MEDIA_STREAM_SOLO') {
    (async () => {
      await ensureStorageLoaded();
      const rawSoloTabId = message.soloTabId;
      if (rawSoloTabId === null || rawSoloTabId === undefined || rawSoloTabId === '' || rawSoloTabId === 0) {
        const result = await handleSoloTabClearExecution();
        sendResponse(result);
        return;
      }
      const soloTabId = Number(rawSoloTabId);
      const result = await handleSoloTabExecution(soloTabId);
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'MEDIA_STREAM_MUTE_ALL_OTHERS') {
    (async () => {
      await ensureStorageLoaded();
      const primaryTabId = message.primaryTabId || message.tabId;
      const result = await handleMuteAllOthersExecution(primaryTabId);
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR') {
    (async () => {
      await ensureStorageLoaded();
      const result = await handleMuteAllOthersClearExecution();
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'MEDIA_STREAM_MUTE_ALL') {
    (async () => {
      await ensureStorageLoaded();
      const result = await handleMuteAllExecution();
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'MEDIA_STREAM_MUTE_ALL_CLEAR') {
    (async () => {
      await ensureStorageLoaded();
      const result = await handleMuteAllClearExecution();
      sendResponse(result);
    })();
    return true;
  }

  // Canonical media action aliases for direct invocation & CLI parity
  if (msgType === 'media:mute_all_others' || msgType === 'mute_all_others' || msgType === 'mute_others') {
    (async () => {
      await ensureStorageLoaded();
      const primaryTabId = message.primaryTabId || message.tabId;
      const result = await handleMuteAllOthersExecution(primaryTabId);
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'media:unmute_all_others' || msgType === 'media:mute_all_others_clear' || msgType === 'mute_all_others_clear' || msgType === 'unmute_all_others') {
    (async () => {
      await ensureStorageLoaded();
      const result = await handleMuteAllOthersClearExecution();
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'media:mute_all' || msgType === 'mute_all') {
    (async () => {
      await ensureStorageLoaded();
      const result = await handleMuteAllExecution();
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'media:unmute_all' || msgType === 'media:mute_all_clear' || msgType === 'mute_all_clear' || msgType === 'unmute_all') {
    (async () => {
      await ensureStorageLoaded();
      const result = await handleMuteAllClearExecution();
      sendResponse(result);
    })();
    return true;
  }

  if (msgType === 'DASHBOARD_REMOTE_MEDIA_CMD') {
    (async () => {
      await ensureStorageLoaded();
      const tabId = Number(message.tabId);
      const command = message.command;
      const value = message.value;
      const result = await handleRemoteMediaCommandExecution(tabId, command, value);
      sendResponse(result);
    })();
    return true;
  }

  // ---------------------------------------------------------------------------
  // Phase 3: Backup Snapshots & SQLite Data Hub Sync IPC Handlers
  // ---------------------------------------------------------------------------
  if (msgType === 'GET_BACKUP_SNAPSHOTS' || message.action === 'GET_BACKUP_SNAPSHOTS') {
    (async () => {
      await ensureStorageLoaded();
      try {
        const SNAPSHOT_INDEX_KEY = 'sentinel_snapshot_index';
        const res = await browserAPI.storage.local.get([SNAPSHOT_INDEX_KEY]);
        const index = res[SNAPSHOT_INDEX_KEY] || [];
        const snapshotsData = await browserAPI.storage.local.get(index);
        const list = index.map(key => snapshotsData[key]).filter(Boolean);
        sendResponse({ success: true, snapshots: list });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (msgType === 'RESTORE_BACKUP_SNAPSHOT' || message.action === 'RESTORE_BACKUP_SNAPSHOT') {
    (async () => {
      await ensureStorageLoaded();
      try {
        const snapshotKey = message.snapshotKey;
        const res = await browserAPI.storage.local.get([snapshotKey]);
        const snapshot = res[snapshotKey];
        if (!snapshot || !snapshot.tracking_history) {
          sendResponse({ success: false, error: 'Snapshot not found' });
          return;
        }
        await browserAPI.storage.local.set({
          sentinel_activity_data: snapshot.tracking_history,
          trackingHistory: snapshot.tracking_history
        });
        sendResponse({ success: true, snapshotKey, date: snapshot.date });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (msgType === 'SYNC_HISTORY_UPSERT' || message.action === 'SYNC_HISTORY_UPSERT') {
    (async () => {
      await ensureStorageLoaded();
      const history = message.tracking_history || message.data || {};
      const dateStr = message.date || getTodayDateString();
      const dayEntry = history[dateStr] || {};
      const hourlyBuckets = dayEntry.hourlyBuckets || {};
      const hourlyBucketsJson = JSON.stringify(hourlyBuckets);

      if (dataHubConnected && dataHubWs && dataHubWs.readyState === WebSocket.OPEN) {
        sendDataHubMessage({
          type: 'SYNC_HISTORY_UPSERT',
          client_id: clientId,
          browser_type: detectedBrowser,
          date_str: dateStr,
          tracking_history: history,
          hourly_buckets_json: hourlyBucketsJson,
          timestamp: Date.now()
        });
        sendResponse({ success: true, forwardedToHub: true });
      } else {
        sendResponse({ success: true, forwardedToHub: false, offline: true });
      }
    })();
    return true;
  }

  // ---------------------------------------------------------------------------
  // Phase 4: Wellbeing Sentinel, Annotations & Blacklist IPC Handlers
  // ---------------------------------------------------------------------------
  if (msgType === 'UPDATE_TRACKING_BLACKLIST' || message.action === 'UPDATE_TRACKING_BLACKLIST') {
    (async () => {
      await ensureStorageLoaded();
      if (Array.isArray(message.blacklist)) {
        trackingBlacklist = message.blacklist.map(p => String(p).trim().toLowerCase()).filter(Boolean);
        await browserAPI.storage.local.set({ tracking_blacklist: trackingBlacklist });
        if (activeDomain && matchesTrackingBlacklist(activeDomain)) {
          activeDomain = null;
          intervalStartTime = Date.now();
          sendActivityUpdateToHUD();
          scheduleStorageSave(true);
        }
      }
      sendResponse({ success: true, count: trackingBlacklist.length, blacklist: trackingBlacklist });
    })();
    return true;
  }

  if (msgType === 'GET_TRACKING_BLACKLIST' || message.action === 'GET_TRACKING_BLACKLIST') {
    (async () => {
      await ensureStorageLoaded();
      sendResponse({ success: true, blacklist: trackingBlacklist });
    })();
    return true;
  }

  if (msgType === 'PURGE_DOMAIN_HISTORY' || message.action === 'PURGE_DOMAIN_HISTORY') {
    (async () => {
      await ensureStorageLoaded();
      const target = (message.domain || message.pattern || '').trim().toLowerCase();
      let purgedCount = 0;
      const purgedList = [];
      if (target && activityData && activityData.domains) {
        Object.keys(activityData.domains).forEach(dom => {
          const lower = dom.toLowerCase();
          let shouldPurge = false;
          if (lower === target) {
            shouldPurge = true;
          } else if (matchesTrackingBlacklist(dom)) {
            shouldPurge = true;
          } else {
            const rx = compileBlacklistRegexBg(target);
            if (rx && (rx.test(dom) || rx.test(lower))) {
              shouldPurge = true;
            }
          }

          if (shouldPurge) {
            delete activityData.domains[dom];
            purgedCount++;
            purgedList.push(dom);
          }
        });
        if (activeDomain && purgedList.includes(activeDomain)) {
          activeDomain = null;
          intervalStartTime = Date.now();
        }
        await saveStorageData();
        sendResponse({ success: true, purgedCount, purgedList });
      } else {
        sendResponse({ success: true, purgedCount: 0, purgedList: [] });
      }
    })();
    return true;
  }

  if (msgType === 'UPDATE_DOMAIN_BUDGETS' || message.action === 'UPDATE_DOMAIN_BUDGETS') {
    (async () => {
      await ensureStorageLoaded();
      if (message.budgets && typeof message.budgets === 'object') {
        domainBudgets = Object.assign({}, message.budgets);
        await browserAPI.storage.local.set({ domain_budgets: domainBudgets });
      }
      sendResponse({ success: true, budgets: domainBudgets });
    })();
    return true;
  }

  if (msgType === 'GET_DOMAIN_BUDGETS' || message.action === 'GET_DOMAIN_BUDGETS') {
    (async () => {
      await ensureStorageLoaded();
      sendResponse({ success: true, budgets: domainBudgets });
    })();
    return true;
  }
});

// Reactively synchronize configuration changes from chrome.storage
browserAPI.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.tracking_blacklist && Array.isArray(changes.tracking_blacklist.newValue)) {
      trackingBlacklist = changes.tracking_blacklist.newValue;
      if (activeDomain && matchesTrackingBlacklist(activeDomain)) {
        activeDomain = null;
        intervalStartTime = Date.now();
        sendActivityUpdateToHUD();
        scheduleStorageSave(true);
      }
    }
    if (changes.domain_budgets && typeof changes.domain_budgets.newValue === 'object') {
      domainBudgets = changes.domain_budgets.newValue || {};
    }
  }
  if (areaName === 'local' && changes[CONFIG.SETTINGS_STORAGE_KEY]) {
    const newSettings = changes[CONFIG.SETTINGS_STORAGE_KEY].newValue;
    if (newSettings) {
      settings = { ...settings, ...newSettings };
      if (settings.idleThresholdSeconds && settings.idleThresholdSeconds !== CONFIG.IDLE_THRESHOLD_SECONDS) {
        CONFIG.IDLE_THRESHOLD_SECONDS = settings.idleThresholdSeconds;
        browserAPI.idle.setDetectionInterval(CONFIG.IDLE_THRESHOLD_SECONDS);
      }
    }
  }
});

// Bootstrap Initialization
(async () => {
  await ensureStorageLoaded();
  await initClientIdAndBrowser();
  
  // Find current active tab on startup
  try {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      activeTabId = tabs[0].id;
      if (tabs[0].windowId) activeWindowId = tabs[0].windowId;
      const domain = tabs[0].url ? extractDomain(tabs[0].url) : null;
      switchActiveDomain(domain, true);
    } else {
      switchActiveDomain(null, false);
    }
  } catch (e) {}

  // Re-inject content scripts to reconnect existing open tabs without page reload
  await reinjectContentScripts();

  // Immediate audible tab sweep on boot: capture any background tabs already playing audio
  try {
    if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
      const initialAudible = await browserAPI.tabs.query({ audible: true });
      if (initialAudible && initialAudible.length > 0) {
        for (const aTab of initialAudible) {
          handleTabAudibleStateChange(aTab.id, true, aTab);
        }
      }
    }
  } catch (_) {}

  // Pre-flight probe host services and connect safely without console errors
  probeAndConnectServices();

  // Setup periodic 5-second streaming ticker for active domain delta commits and background media playback
  if (deltaCommitTicker) clearInterval(deltaCommitTicker);
  deltaCommitTicker = setInterval(async () => {
    // 1. Commit active foreground domain interval (only when tracking is active)
    if (!isTrackingPaused && isBrowserFocused && isUserActive && activeDomain) {
      commitActiveInterval();
    }

    // 2. Periodic audible tab sweep: capture any background tabs playing audio
    try {
      if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
        const audibleTabs = await browserAPI.tabs.query({ audible: true });
        if (audibleTabs && audibleTabs.length > 0) {
          for (const aTab of audibleTabs) {
            if (!activeMediaSessions.has(aTab.id)) {
              handleTabAudibleStateChange(aTab.id, true, aTab);
            }
          }
        }
      }
    } catch (_) {}

    // 3. Commit media sessions with remainder preservation (foreground and background duration accumulation)
    const now = Date.now();
    for (const [tabId, session] of activeMediaSessions.entries()) {
      if (session) {
        if (isInternalDomain(session.domain) || isInternalUrl(session.url)) {
          activeMediaSessions.delete(tabId);
          continue;
        }
        if (session.isPlaying) {
          const isForeground = (tabId === activeTabId && isBrowserFocused);
          if (isTrackingPaused) {
            // When time tracking is paused, freeze media delta accumulation
            session.lastHeartbeat = now;
          } else {
            const elapsedMs = now - session.lastHeartbeat;
            const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
            if (elapsedSec > 0) {
              session.watchDuration += elapsedSec;
              session.lastHeartbeat += (elapsedSec * 1000);
              session.lastUpdated = now;
              if (!isForeground) {
                commitBackgroundMediaDelta(session.domain, elapsedSec);
              }
              if (session.watchDuration >= 5) {
                updateMediaHistoryEntry(session, false);
              }
            }
          }
        }
      }
    }
  }, CONFIG.DELTA_BATCH_INTERVAL_MS);
  if (deltaCommitTicker && typeof deltaCommitTicker.unref === 'function') {
    deltaCommitTicker.unref();
  }
})();

if (typeof globalThis !== 'undefined') {
  globalThis.DOOMSCROLL_ENTERTAINMENT_HOSTS = DOOMSCROLL_ENTERTAINMENT_HOSTS;
  globalThis.handleDoomscrollCheck = handleDoomscrollCheck;
  globalThis.getDoomscrollConsecutiveMinutes = () => doomscrollConsecutiveMinutes;
  globalThis.setDoomscrollConsecutiveMinutes = (val) => { doomscrollConsecutiveMinutes = val; };
  globalThis.getAllActiveMediaStreams = getAllActiveMediaStreams;
  globalThis.resolveCandidatePrimaryTab = resolveCandidatePrimaryTab;
  globalThis.handleSoloTabExecution = handleSoloTabExecution;
  globalThis.handleSoloTabClearExecution = handleSoloTabClearExecution;
  globalThis.handleMuteAllOthersExecution = handleMuteAllOthersExecution;
  globalThis.handleMuteAllOthersClearExecution = handleMuteAllOthersClearExecution;
  globalThis.handleMuteAllExecution = handleMuteAllExecution;
  globalThis.handleMuteAllClearExecution = handleMuteAllClearExecution;
  globalThis.soloPreviousMuteStates = soloPreviousMuteStates;
  globalThis.muteOthersPreviousMuteStates = muteOthersPreviousMuteStates;
  globalThis.muteAllPreviousMuteStates = muteAllPreviousMuteStates;
  globalThis.handleRemoteMediaCommandExecution = handleRemoteMediaCommandExecution;
  globalThis.activateAndFocusTab = activateAndFocusTab;
  globalThis.matchesTrackingBlacklist = matchesTrackingBlacklist;
  globalThis.compileBlacklistRegexBg = compileBlacklistRegexBg;
  globalThis.getTrackingBlacklist = () => trackingBlacklist;
  globalThis.setTrackingBlacklist = (list) => { trackingBlacklist = list; };
  globalThis.getDomainBudgets = () => domainBudgets;
  globalThis.setDomainBudgets = (b) => { domainBudgets = b; };
  globalThis.getActivityData = () => activityData;
  globalThis.switchActiveDomain = switchActiveDomain;
  globalThis.commitActiveInterval = commitActiveInterval;
  globalThis.commitBackgroundMediaDelta = commitBackgroundMediaDelta;
  globalThis.getActiveDomain = () => activeDomain;
  globalThis.extractCanonicalMediaId = extractCanonicalMediaId;
  globalThis.pauseSleepTimer = pauseSleepTimer;
  globalThis.resumeSleepTimer = resumeSleepTimer;
  globalThis.extendSleepTimer = extendSleepTimer;
  globalThis.handleEndOfVideoTrigger = handleEndOfVideoTrigger;
  globalThis.setSleepTimer = setSleepTimer;
  globalThis.cancelSleepTimer = cancelSleepTimer;
  globalThis.getSleepTimerState = () => sleepTimerState;
  globalThis.getSleepTimerSettings = () => sleepTimerSettings;
  globalThis.triggerSleepTimerExpiration = triggerSleepTimerExpiration;
  globalThis.triggerSleepTimerFade = triggerSleepTimerFade;
  globalThis.purgeSleepTimerAlarms = purgeSleepTimerAlarms;
  globalThis.checkInactivityAutoSleep = checkInactivityAutoSleep;
  globalThis.isUserActivelyWatchingMedia = isUserActivelyWatchingMedia;
  globalThis.hasAnyActivePlayingMedia = hasAnyActivePlayingMedia;
  globalThis.collectAutoPauseTargetTabs = collectAutoPauseTargetTabs;
  globalThis.executeTabMediaPause = executeTabMediaPause;
  globalThis.handleAutoPauseOnTabChange = handleAutoPauseOnTabChange;
  globalThis.getUserIdleStartTime = () => userIdleStartTime;
  globalThis.setUserIdleStartTime = (t) => { userIdleStartTime = t; };
  globalThis.setIsBrowserFocused = (f) => { isBrowserFocused = f; };
  globalThis.setActiveTabId = (id) => { activeTabId = id; };
  globalThis.setIsUserActive = (a) => { isUserActive = a; };
  globalThis.closeAllMediaTabs = closeAllMediaTabs;
  // Focus Sentinel & Pomodoro Subsystem exports
  globalThis.startFocusTimer = startFocusTimer;
  globalThis.pauseFocusTimer = pauseFocusTimer;
  globalThis.resumeFocusTimer = resumeFocusTimer;
  globalThis.resetFocusTimer = resetFocusTimer;
  globalThis.extendFocusTimer = extendFocusTimer;
  globalThis.handleFocusTimerExpired = handleFocusTimerExpired;
  globalThis.handleFocusBreakExpired = handleFocusBreakExpired;
  globalThis.getFocusTimerState = () => focusTimerState;
  globalThis.getFocusTimerSettings = () => focusTimerSettings;
  globalThis.getDailyFocusMetrics = () => dailyFocusMetrics;
  globalThis.saveFocusTimerState = saveFocusTimerState;
  globalThis.saveFocusSettings = saveFocusSettings;
  globalThis.saveDailyFocusMetrics = saveDailyFocusMetrics;
  globalThis.FOCUS_TIMER_ALARM_NAME = FOCUS_TIMER_ALARM_NAME;
  globalThis.FOCUS_BREAK_ALARM_NAME = FOCUS_BREAK_ALARM_NAME;
  globalThis.DEFAULT_FOCUS_SETTINGS = DEFAULT_FOCUS_SETTINGS;
  globalThis.INITIAL_FOCUS_TIMER_STATE = INITIAL_FOCUS_TIMER_STATE;
  globalThis.isDistractingDomain = isDistractingDomain;
  globalThis.DEFAULT_DISTRACTING_DOMAINS = DEFAULT_DISTRACTING_DOMAINS;
  globalThis.executeAutoMuteBackgroundTabs = executeAutoMuteBackgroundTabs;
  globalThis.checkAndAutoMuteBackgroundTab = checkAndAutoMuteBackgroundTab;
  globalThis.autoMutedFocusTabIds = autoMutedFocusTabIds;
  globalThis.executeTabHibernationOnSleepExpire = executeTabHibernationOnSleepExpire;
  if (globalThis.SentinelBackgroundModules) {
    globalThis.SentinelBackgroundModules.handleDoomscrollCheck = handleDoomscrollCheck;
    globalThis.SentinelBackgroundModules.DOOMSCROLL_ENTERTAINMENT_HOSTS = DOOMSCROLL_ENTERTAINMENT_HOSTS;
    globalThis.SentinelBackgroundModules.getAllActiveMediaStreams = getAllActiveMediaStreams;
    globalThis.SentinelBackgroundModules.resolveCandidatePrimaryTab = resolveCandidatePrimaryTab;
    globalThis.SentinelBackgroundModules.handleSoloTabExecution = handleSoloTabExecution;
    globalThis.SentinelBackgroundModules.handleSoloTabClearExecution = handleSoloTabClearExecution;
    globalThis.SentinelBackgroundModules.handleMuteAllOthersExecution = handleMuteAllOthersExecution;
    globalThis.SentinelBackgroundModules.handleMuteAllOthersClearExecution = handleMuteAllOthersClearExecution;
    globalThis.SentinelBackgroundModules.handleMuteAllExecution = handleMuteAllExecution;
    globalThis.SentinelBackgroundModules.handleMuteAllClearExecution = handleMuteAllClearExecution;
    globalThis.SentinelBackgroundModules.soloPreviousMuteStates = soloPreviousMuteStates;
    globalThis.SentinelBackgroundModules.muteOthersPreviousMuteStates = muteOthersPreviousMuteStates;
    globalThis.SentinelBackgroundModules.muteAllPreviousMuteStates = muteAllPreviousMuteStates;
    globalThis.SentinelBackgroundModules.handleRemoteMediaCommandExecution = handleRemoteMediaCommandExecution;
    globalThis.SentinelBackgroundModules.activateAndFocusTab = activateAndFocusTab;
    globalThis.SentinelBackgroundModules.matchesTrackingBlacklist = matchesTrackingBlacklist;
    globalThis.SentinelBackgroundModules.getTrackingBlacklist = () => trackingBlacklist;
    globalThis.SentinelBackgroundModules.setTrackingBlacklist = (list) => { trackingBlacklist = list; };
    globalThis.SentinelBackgroundModules.getDomainBudgets = () => domainBudgets;
    globalThis.SentinelBackgroundModules.setDomainBudgets = (b) => { domainBudgets = b; };
    globalThis.SentinelBackgroundModules.getActivityData = () => activityData;
    globalThis.SentinelBackgroundModules.switchActiveDomain = switchActiveDomain;
    globalThis.SentinelBackgroundModules.commitActiveInterval = commitActiveInterval;
    globalThis.SentinelBackgroundModules.commitBackgroundMediaDelta = commitBackgroundMediaDelta;
    globalThis.SentinelBackgroundModules.getActiveDomain = () => activeDomain;
    globalThis.SentinelBackgroundModules.extractCanonicalMediaId = extractCanonicalMediaId;
    globalThis.SentinelBackgroundModules.pauseSleepTimer = pauseSleepTimer;
    globalThis.SentinelBackgroundModules.resumeSleepTimer = resumeSleepTimer;
    globalThis.SentinelBackgroundModules.extendSleepTimer = extendSleepTimer;
    globalThis.SentinelBackgroundModules.handleEndOfVideoTrigger = handleEndOfVideoTrigger;
    globalThis.SentinelBackgroundModules.setSleepTimer = setSleepTimer;
    globalThis.SentinelBackgroundModules.cancelSleepTimer = cancelSleepTimer;
    globalThis.SentinelBackgroundModules.getSleepTimerState = () => sleepTimerState;
    globalThis.SentinelBackgroundModules.getSleepTimerSettings = () => sleepTimerSettings;
    globalThis.SentinelBackgroundModules.triggerSleepTimerExpiration = triggerSleepTimerExpiration;
    globalThis.SentinelBackgroundModules.triggerSleepTimerFade = triggerSleepTimerFade;
    globalThis.SentinelBackgroundModules.purgeSleepTimerAlarms = purgeSleepTimerAlarms;
    globalThis.SentinelBackgroundModules.checkInactivityAutoSleep = checkInactivityAutoSleep;
    globalThis.SentinelBackgroundModules.isUserActivelyWatchingMedia = isUserActivelyWatchingMedia;
    globalThis.SentinelBackgroundModules.hasAnyActivePlayingMedia = hasAnyActivePlayingMedia;
    globalThis.SentinelBackgroundModules.collectAutoPauseTargetTabs = collectAutoPauseTargetTabs;
    globalThis.SentinelBackgroundModules.executeTabMediaPause = executeTabMediaPause;
    globalThis.SentinelBackgroundModules.handleAutoPauseOnTabChange = handleAutoPauseOnTabChange;
    globalThis.SentinelBackgroundModules.getUserIdleStartTime = () => userIdleStartTime;
    globalThis.SentinelBackgroundModules.setUserIdleStartTime = (t) => { userIdleStartTime = t; };
    globalThis.SentinelBackgroundModules.setIsBrowserFocused = (f) => { isBrowserFocused = f; };
    globalThis.SentinelBackgroundModules.setActiveTabId = (id) => { activeTabId = id; };
    globalThis.SentinelBackgroundModules.setIsUserActive = (a) => { isUserActive = a; };
    globalThis.SentinelBackgroundModules.closeAllMediaTabs = closeAllMediaTabs;
    // Focus Sentinel & Pomodoro Subsystem exports
    globalThis.SentinelBackgroundModules.startFocusTimer = startFocusTimer;
    globalThis.SentinelBackgroundModules.pauseFocusTimer = pauseFocusTimer;
    globalThis.SentinelBackgroundModules.resumeFocusTimer = resumeFocusTimer;
    globalThis.SentinelBackgroundModules.resetFocusTimer = resetFocusTimer;
    globalThis.SentinelBackgroundModules.extendFocusTimer = extendFocusTimer;
    globalThis.SentinelBackgroundModules.handleFocusTimerExpired = handleFocusTimerExpired;
    globalThis.SentinelBackgroundModules.handleFocusBreakExpired = handleFocusBreakExpired;
    globalThis.SentinelBackgroundModules.getFocusTimerState = () => focusTimerState;
    globalThis.SentinelBackgroundModules.getFocusTimerSettings = () => focusTimerSettings;
    globalThis.SentinelBackgroundModules.getDailyFocusMetrics = () => dailyFocusMetrics;
    globalThis.SentinelBackgroundModules.saveFocusTimerState = saveFocusTimerState;
    globalThis.SentinelBackgroundModules.saveFocusSettings = saveFocusSettings;
    globalThis.SentinelBackgroundModules.saveDailyFocusMetrics = saveDailyFocusMetrics;
    globalThis.SentinelBackgroundModules.FOCUS_TIMER_ALARM_NAME = FOCUS_TIMER_ALARM_NAME;
    globalThis.SentinelBackgroundModules.FOCUS_BREAK_ALARM_NAME = FOCUS_BREAK_ALARM_NAME;
    globalThis.SentinelBackgroundModules.DEFAULT_FOCUS_SETTINGS = DEFAULT_FOCUS_SETTINGS;
    globalThis.SentinelBackgroundModules.INITIAL_FOCUS_TIMER_STATE = INITIAL_FOCUS_TIMER_STATE;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    pauseSleepTimer,
    resumeSleepTimer,
    extendSleepTimer,
    handleEndOfVideoTrigger,
    setSleepTimer,
    cancelSleepTimer,
    getSleepTimerState: () => sleepTimerState,
    getSleepTimerSettings: () => sleepTimerSettings,
    triggerSleepTimerExpiration,
    triggerSleepTimerFade,
    purgeSleepTimerAlarms,
    checkInactivityAutoSleep,
    isUserActivelyWatchingMedia,
    hasAnyActivePlayingMedia,
    collectAutoPauseTargetTabs,
    executeTabMediaPause,
    handleAutoPauseOnTabChange,
    getUserIdleStartTime: () => userIdleStartTime,
    setUserIdleStartTime: (t) => { userIdleStartTime = t; },
    setIsBrowserFocused: (f) => { isBrowserFocused = f; },
    setActiveTabId: (id) => { activeTabId = id; },
    setIsUserActive: (a) => { isUserActive = a; },
    closeAllMediaTabs,
    startFocusTimer,
    pauseFocusTimer,
    resumeFocusTimer,
    resetFocusTimer,
    extendFocusTimer,
    handleFocusTimerExpired,
    handleFocusBreakExpired,
    getFocusTimerState: () => focusTimerState,
    getFocusTimerSettings: () => focusTimerSettings,
    getDailyFocusMetrics: () => dailyFocusMetrics,
    saveFocusTimerState,
    saveFocusSettings,
    saveDailyFocusMetrics,
    FOCUS_TIMER_ALARM_NAME,
    FOCUS_BREAK_ALARM_NAME,
    DEFAULT_FOCUS_SETTINGS,
    INITIAL_FOCUS_TIMER_STATE,
    isDistractingDomain,
    DEFAULT_DISTRACTING_DOMAINS,
    executeAutoMuteBackgroundTabs,
    checkAndAutoMuteBackgroundTab,
    autoMutedFocusTabIds,
    executeTabHibernationOnSleepExpire,
    resolveCandidatePrimaryTab,
    handleSoloTabExecution,
    handleSoloTabClearExecution,
    handleMuteAllOthersExecution,
    handleMuteAllOthersClearExecution,
    handleMuteAllExecution,
    handleMuteAllClearExecution,
    soloPreviousMuteStates,
    muteOthersPreviousMuteStates,
    muteAllPreviousMuteStates
  };
}

