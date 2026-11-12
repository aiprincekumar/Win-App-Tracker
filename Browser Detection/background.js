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

const browserAPI = typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime 
  ? globalThis.browser 
  : globalThis.chrome;

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

let activeTabId = null;
let activeWindowId = null;
let activeDomain = null;
let intervalStartTime = Date.now();
let isBrowserFocused = true;
let isUserActive = true;

// Media Map: tabId -> Media State Payload
const tabMediaMap = new Map();

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
 * Streams active seconds delta to Data Hub or offline queue.
 * Supports trackingType: 'foreground' | 'background_media'.
 */
function streamActivityDelta(domain, seconds, isNewSession = false, trackingType = 'foreground') {
  if (!domain || seconds <= 0) return;

  const delta = {
    domain,
    seconds,
    tracking_type: trackingType,
    date_str: getTodayDateString(),
    browser_type: detectedBrowser,
    favicon_url: getFaviconUrl(domain),
    session_count: isNewSession ? 1 : 0
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
      'sentinel_sleep_settings'
    ];
    const res = await browserAPI.storage.local.get(keys);
    if (res && res[CONFIG.CLIENT_ID_STORAGE_KEY]) {
      clientId = res[CONFIG.CLIENT_ID_STORAGE_KEY];
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
      const existingIds = new Set(mediaHistory.map(m => m.id));
      const filtered = res[CONFIG.MEDIA_HISTORY_STORAGE_KEY].filter(m => !existingIds.has(m.id));
      mediaHistory = [...mediaHistory, ...filtered].slice(0, CONFIG.MAX_MEDIA_HISTORY);
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
      } else if (sleepTimerState.state === 'RUNNING') {
        const remainingMs = sleepTimerState.targetTime - now;
        updateActionBadge(remainingMs, sleepTimerState.durationMs);
      }
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
      } else if (sleepTimerState.state === 'RUNNING') {
        const remainingMs = sleepTimerState.targetTime - now;
        updateActionBadge(remainingMs, sleepTimerState.durationMs);
      }
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
    await browserAPI.alarms.clear(SLEEP_ALARM_NAME);
    await browserAPI.alarms.clear(SLEEP_FADE_ALARM_NAME);

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
 * Triggers sleep timer expiration: marks TRIGGERED, clears badge, pauses media, commits tracking
 */
async function triggerSleepTimerExpiration() {
  await ensureStorageLoaded();
  console.info('[MediaSentinel] 🌙 Sleep timer expired! Pausing media streams and freezing counters.');

  sleepTimerState.state = 'TRIGGERED';
  sleepTimerState.triggeredAt = Date.now();
  await saveSleepTimerState();

  clearActionBadge();

  // Broadcast global pause to all media tabs
  if (sleepTimerState.pauseMedia) {
    await dispatchGlobalMediaAction('PAUSE_ALL');
  }

  // Freeze active tracking intervals
  if (sleepTimerState.pauseTracking) {
    commitActiveInterval();
    scheduleStorageSave(true);
  }

  // Notify frontend views
  safeSendRuntimeMessage({
    action: 'SLEEP_TIMER_EXPIRED',
    type: 'SLEEP_TIMER_EXPIRED',
    state: sleepTimerState
  });
}

/**
 * Triggers pre-expiration volume fade across active media tabs
 */
async function triggerSleepTimerFade() {
  await ensureStorageLoaded();
  if (sleepTimerState.state !== 'RUNNING') return;
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
    lastUpdated: now
  };

  await saveSleepTimerState();
  await scheduleSleepTimerAlarms(sleepTimerState);
  if (sleepTimerSettings.showBadgeCountdown) {
    updateActionBadge(durationMs, durationMs);
  }
  return sleepTimerState;
}

/**
 * Cancels active sleep timer and resets state
 */
async function cancelSleepTimer() {
  try {
    await browserAPI.alarms.clear(SLEEP_ALARM_NAME);
    await browserAPI.alarms.clear(SLEEP_FADE_ALARM_NAME);
  } catch (_) {}

  sleepTimerState = {
    ...INITIAL_SLEEP_TIMER_STATE,
    state: 'CANCELLED',
    lastUpdated: Date.now()
  };
  await saveSleepTimerState();
  clearActionBadge();
  return { success: true, state: sleepTimerState };
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

/**
 * Flushes memory activity data to chrome.storage.local safely
 */
async function saveStorageData() {
  if (!isStorageLoaded) return;
  if (isSaving) return;
  isSaving = true;
  try {
    activityData.lastUpdated = Date.now();
    await browserAPI.storage.local.set({ 
      [CONFIG.STORAGE_KEY]: activityData,
      [`${CONFIG.STORAGE_KEY}_backup`]: {
        domainsCount: Object.keys(activityData.domains || {}).length,
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
  const session = activeMediaSessions.get(tabId);

  if (pm && pm.isPlaying) {
    const vol = Math.round((typeof pm.volume === 'number' ? pm.volume : 1) * 100);
    const domain = payload.domain || pm.domain || 'web';
    const title = pm.title || payload.title || 'Web Media';
    const resolution = pm.resolutionLabel || (pm.videoWidth && pm.videoHeight ? `${pm.videoWidth}x${pm.videoHeight}` : 'Audio / Standard');

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
      session.isPlaying = true;

      // Update in mediaHistory in real time
      updateMediaHistoryEntry(session, false);
      streamMediaSessionUpdate(session, 'update');
    } else {
      // Start a brand new session
      const newSession = {
        id: `media_${now}_${Math.random().toString(36).substring(2, 8)}`,
        tabId,
        title,
        platform: domain,
        domain,
        url: payload.url || pm.url || '',
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

  session.isPlaying = false;
  if (session.volumeSamples.length > 0) {
    const sum = session.volumeSamples.reduce((a, b) => a + b, 0);
    session.averageVolume = Math.round(sum / session.volumeSamples.length);
  }

  // Stream finalize to Data Hub
  streamMediaSessionUpdate(session, 'finalize');

  // Only record if watched for at least 1 second
  if (session.watchDuration >= 1) {
    updateMediaHistoryEntry(session, true);
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
    let session = activeMediaSessions.get(tabId);
    const domain = (tabObj && tabObj.url) ? extractDomain(tabObj.url) : 'web';
    const title = (tabObj && tabObj.title) ? tabObj.title : 'Audio Playback';

    if (!session) {
      session = {
        id: `audible_${now}_${Math.random().toString(36).substring(2, 8)}`,
        tabId,
        title,
        platform: domain,
        domain,
        url: (tabObj && tabObj.url) || '',
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
    if (session && session.isAudible) {
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

/**
 * Upserts a media session entry into mediaHistory
 */
function updateMediaHistoryEntry(session, persist = false) {
  if (session.watchDuration < 1 && !(session.controlEvents && session.controlEvents.length > 0)) return;

  const avgVol = session.volumeSamples.length > 0
    ? Math.round(session.volumeSamples.reduce((a, b) => a + b, 0) / session.volumeSamples.length)
    : session.peakVolume;

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
    peakVolume: session.peakVolume,
    lowVolume: session.lowVolume,
    volumeSamples: session.volumeSamples.slice(-20),
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
  if (!activeDomain || !isBrowserFocused || !isUserActive) {
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

    // Reset interval anchor
    intervalStartTime = now;

    // Stream delta to Data Hub with tracking_type = 'foreground'
    streamActivityDelta(activeDomain, validSec, false, 'foreground');

    // Debounced auto-save ensures freshly tracked seconds are never lost on reload
    scheduleStorageSave(false);
  }
}

/**
 * Commits elapsed seconds for background media playback on a domain (Method B: Background Media Playback Only)
 */
function commitBackgroundMediaDelta(domain, seconds) {
  if (!domain || seconds <= 0) return;
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
      const domain = tab.url ? extractDomain(tab.url) : null;
      switchActiveDomain(domain, true);
    } else {
      switchActiveDomain(null, false);
    }
  } catch (e) {
    switchActiveDomain(null, false);
  }

  // Gentle wake-up if paused and cooled down (e.g. 2 minutes since last attempt)
  const tabSwitchNow = Date.now();
  if ((!wsConnected && wsReconnectPaused && (tabSwitchNow - lastWsAttemptTime > 120000)) ||
      (!dataHubConnected && dataHubReconnectPaused && (tabSwitchNow - lastDataHubAttemptTime > 120000))) {
    probeAndConnectServices();
  }
});

// Tab Updated (URL changed, page navigated, or audible audio state changed)
browserAPI.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await ensureStorageLoaded();
  if (tabId === activeTabId && changeInfo.url) {
    const domain = extractDomain(changeInfo.url);
    switchActiveDomain(domain, false);
  }
  // Audio state change (tab.audible becomes true / false)
  if (changeInfo.audible !== undefined) {
    handleTabAudibleStateChange(tabId, changeInfo.audible, tab);
  }
  // Clear stale media state if tab reloads or navigates to a new page
  if (changeInfo.status === 'loading' && changeInfo.url) {
    const existing = tabMediaMap.get(tabId);
    if (existing) {
      tabMediaMap.delete(tabId);
      finalizeMediaSession(tabId);
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

// Idle State Monitoring
browserAPI.idle.setDetectionInterval(CONFIG.IDLE_THRESHOLD_SECONDS);
browserAPI.idle.onStateChanged.addListener(async (newState) => {
  await ensureStorageLoaded();
  if (newState === 'idle' || newState === 'locked') {
    commitActiveInterval();
    isUserActive = false;
    scheduleStorageSave(true);

    // Inactivity Auto-Sleep Sentinel check
    if (sleepTimerSettings && sleepTimerSettings.enableInactivityAutoSleep) {
      let mediaPlaying = false;
      for (const session of activeMediaSessions.values()) {
        if (session.isPlaying) {
          mediaPlaying = true;
          break;
        }
      }
      if (!mediaPlaying) {
        for (const mState of tabMediaMap.values()) {
          if (mState && (mState.anyPlaying || (mState.primaryMedia && mState.primaryMedia.isPlaying))) {
            mediaPlaying = true;
            break;
          }
        }
      }
      if (mediaPlaying) {
        console.info('[MediaSentinel] Inactivity detected while media is streaming. Pausing unattended playback.');
        await dispatchGlobalMediaAction('PAUSE_ALL');
      }
    }
  } else if (newState === 'active') {
    isUserActive = true;
    intervalStartTime = Date.now();
  }
  sendActivityUpdateToHUD();
});

// Service Worker Suspension Lifecycle Guard (Manifest V3 Standard)
if (browserAPI.runtime && browserAPI.runtime.onSuspend) {
  browserAPI.runtime.onSuspend.addListener(() => {
    commitActiveInterval();
    saveStorageData();
    saveMediaHistory();
  });
}

// Periodic Alarm for Storage Flush & WebSocket Verification
browserAPI.alarms.create('sentinel_flush_alarm', { periodInMinutes: CONFIG.FLUSH_INTERVAL_MINUTES });
browserAPI.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SLEEP_ALARM_NAME) {
    await triggerSleepTimerExpiration();
    return;
  }
  if (alarm.name === SLEEP_FADE_ALARM_NAME) {
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

    // Sleep Timer periodic check & badge countdown update
    if (sleepTimerState && sleepTimerState.state === 'RUNNING') {
      const remainingMs = sleepTimerState.targetTime - now;
      if (remainingMs <= 0) {
        await triggerSleepTimerExpiration();
      } else {
        updateActionBadge(remainingMs, sleepTimerState.durationMs);
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
          sleepTimerSettings
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
          // Authoritative window fullscreen toggle fallback
          if (targetTabId && typeof chrome !== 'undefined' && chrome.tabs && chrome.windows) {
            try {
              chrome.tabs.get(targetTabId, (tab) => {
                if (chrome.runtime && chrome.runtime.lastError) return;
                if (!tab || !tab.windowId) return;
                chrome.windows.get(tab.windowId, (win) => {
                  if (chrome.runtime && chrome.runtime.lastError) return;
                  if (!win) return;
                  const nextState = win.state === 'fullscreen' ? 'normal' : 'fullscreen';
                  chrome.windows.update(tab.windowId, { state: nextState }).catch(() => {});
                });
              });
            } catch (_) {}
          }
        } else if (message.action === 'toggle_pip') {
          session.lastWindowMode = 'pip';
        } else if (message.action === 'toggle_theater') {
          session.lastWindowMode = 'theater';
        }

        session.lastUpdated = Date.now();
        updateMediaHistoryEntry(session, true);
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

  // Focus and switch to the browser tab where primary media is active
  if (message.type === 'JUMP_TO_MEDIA_TAB') {
    (async () => {
      await ensureStorageLoaded();

      // Helper function to activate a tab and focus its window
      const activateAndFocusTab = async (tabId, windowId) => {
        try {
          const numTabId = Number(tabId);
          if (!numTabId) return false;
          const targetTab = await browserAPI.tabs.get(numTabId);
          if (!targetTab) return false;
          
          await browserAPI.tabs.update(numTabId, { active: true });
          const winId = windowId || targetTab.windowId;
          if (winId) {
            await browserAPI.windows.update(winId, { focused: true }).catch(() => {});
          }
          return { success: true, tabId: numTabId, windowId: winId };
        } catch (_) {
          return false;
        }
      };

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
    let targetTabId = (globalMedia.primaryMedia && globalMedia.primaryMedia.tabId) || activeTabId;

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
});

// Reactively synchronize configuration changes from chrome.storage
browserAPI.storage.onChanged.addListener((changes, areaName) => {
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
    // 1. Commit active foreground domain interval
    if (isBrowserFocused && isUserActive && activeDomain) {
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

    // 3. Commit background media sessions with remainder preservation
    const now = Date.now();
    for (const [tabId, session] of activeMediaSessions.entries()) {
      if (session && session.isPlaying) {
        const isForeground = (tabId === activeTabId && isBrowserFocused);
        if (!isForeground) {
          const elapsedMs = now - session.lastHeartbeat;
          const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
          if (elapsedSec > 0) {
            session.watchDuration += elapsedSec;
            session.lastHeartbeat += (elapsedSec * 1000);
            session.lastUpdated = now;
            commitBackgroundMediaDelta(session.domain, elapsedSec);
            updateMediaHistoryEntry(session, false);
          }
        } else {
          // Tab is in foreground; keep lastHeartbeat synced with now
          session.lastHeartbeat = now;
        }
      }
    }
  }, CONFIG.DELTA_BATCH_INTERVAL_MS);
})();
