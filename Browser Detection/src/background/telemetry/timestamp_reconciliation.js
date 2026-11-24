/**
 * Web Activity & Media Sentinel - Timestamp Reconciliation Engine
 * Ephemeral Manifest V3 Service Worker session persistence, clock-drift bounding, and keepalive management.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const STORAGE_KEY_ACTIVE_SESSION = 'sentinel_active_session';
  const PORT_NAME_KEEPALIVE = 'sentinel_tracking_keepalive';
  const KEEPALIVE_HEARTBEAT_INTERVAL_MS = 15000;
  const MAX_RECONCILE_DRIFT_SEC = 45;
  const SLEEP_THRESHOLD_SEC = 60;

  const activeKeepalivePorts = new Map();

  function getSessionStorageArea(browserAPI) {
    if (browserAPI && browserAPI.storage && browserAPI.storage.session) {
      return browserAPI.storage.session;
    }
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      return browserAPI.storage.local;
    }
    return null;
  }

  async function getActiveSessionCheckpoint(browserAPI) {
    const storage = getSessionStorageArea(browserAPI);
    if (!storage || typeof storage.get !== 'function') return null;
    try {
      const res = await storage.get([STORAGE_KEY_ACTIVE_SESSION]);
      return (res && res[STORAGE_KEY_ACTIVE_SESSION]) || null;
    } catch (_) {
      return null;
    }
  }

  async function saveActiveSessionCheckpoint(browserAPI, sessionData) {
    const storage = getSessionStorageArea(browserAPI);
    if (!storage || typeof storage.set !== 'function') return;
    try {
      await storage.set({ [STORAGE_KEY_ACTIVE_SESSION]: sessionData });
    } catch (_) {}
  }

  async function clearActiveSessionCheckpoint(browserAPI) {
    const storage = getSessionStorageArea(browserAPI);
    if (!storage) return;
    try {
      if (typeof storage.remove === 'function') {
        await storage.remove([STORAGE_KEY_ACTIVE_SESSION]);
      } else if (typeof storage.set === 'function') {
        await storage.set({ [STORAGE_KEY_ACTIVE_SESSION]: null });
      }
    } catch (_) {}
  }

  function calculateReconciledDelta(session, now = Date.now()) {
    if (!session) return { deltaSeconds: 0, isSleepGap: false, rawElapsedSec: 0 };
    const lastTime = session.lastCommittedTime || session.lastHeartbeat || session.lastHeartbeatTime || session.startTime || now;
    const elapsedMs = Math.max(0, now - lastTime);
    const rawElapsedSec = Math.floor(elapsedMs / 1000);

    if (rawElapsedSec <= 0) {
      return { deltaSeconds: 0, isSleepGap: false, rawElapsedSec: 0 };
    }

    if (rawElapsedSec >= SLEEP_THRESHOLD_SEC) {
      const fallbackSec = Math.min(15, Math.floor(KEEPALIVE_HEARTBEAT_INTERVAL_MS / 1000));
      return { deltaSeconds: fallbackSec, isSleepGap: true, rawElapsedSec };
    }

    const deltaSeconds = Math.min(rawElapsedSec, MAX_RECONCILE_DRIFT_SEC);
    return { deltaSeconds, isSleepGap: false, rawElapsedSec };
  }

  async function updateActiveSession(browserAPI, updates = {}) {
    if (!browserAPI) return null;
    const existing = (await getActiveSessionCheckpoint(browserAPI)) || {};
    const now = Date.now();
    const merged = {
      domain: updates.domain !== undefined ? updates.domain : existing.domain,
      tabId: updates.tabId !== undefined ? updates.tabId : existing.tabId,
      windowId: updates.windowId !== undefined ? updates.windowId : existing.windowId,
      startTime: updates.startTime || existing.startTime || now,
      lastHeartbeat: updates.lastHeartbeat || now,
      lastHeartbeatTime: updates.lastHeartbeatTime || updates.lastHeartbeat || now,
      lastCommittedTime: updates.lastCommittedTime || existing.lastCommittedTime || now,
      isBrowserFocused: updates.isBrowserFocused !== undefined ? updates.isBrowserFocused : (existing.isBrowserFocused !== false),
      isUserActive: updates.isUserActive !== undefined ? updates.isUserActive : (existing.isUserActive !== false),
      isTrackingPaused: updates.isTrackingPaused !== undefined ? updates.isTrackingPaused : !!existing.isTrackingPaused,
      heartbeatCount: (existing.heartbeatCount || 0) + 1,
      schemaVersion: 1
    };
    await saveActiveSessionCheckpoint(browserAPI, merged);
    return merged;
  }

  function creditDomainTime(context, domain, seconds, now = Date.now()) {
    if (!context || !context.activityData || !context.activityData.domains || seconds <= 0) return;
    const today = (typeof context.getTodayDateString === 'function') ? context.getTodayDateString() : new Date().toISOString().slice(0, 10);
    if (!context.activityData.domains[domain]) {
      const fav = (typeof context.getFaviconUrl === 'function') ? context.getFaviconUrl(domain) : '';
      context.activityData.domains[domain] = {
        favicon: fav,
        totalSeconds: 0,
        foregroundSeconds: 0,
        backgroundMediaSeconds: 0,
        sessionCount: 1,
        lastActive: now,
        days: {}
      };
    }
    const domainEntry = context.activityData.domains[domain];
    domainEntry.totalSeconds = (domainEntry.totalSeconds || 0) + seconds;
    domainEntry.foregroundSeconds = (domainEntry.foregroundSeconds || 0) + seconds;
    domainEntry.lastActive = now;

    if (!domainEntry.days[today]) {
      domainEntry.days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
    }
    const dayEntry = domainEntry.days[today];
    dayEntry.seconds = (dayEntry.seconds || 0) + seconds;
    dayEntry.foregroundSeconds = (dayEntry.foregroundSeconds || 0) + seconds;

    if (typeof context.updateHourlyBucket === 'function') {
      context.updateHourlyBucket(dayEntry, seconds, true, now);
    }
    if (typeof context.streamActivityDelta === 'function') {
      context.streamActivityDelta(domain, seconds, false, 'foreground', true);
    }
    if (typeof context.scheduleStorageSave === 'function') {
      context.scheduleStorageSave(false);
    }
  }

  async function reconcileSessionDelta(context, now = Date.now()) {
    if (!context || !context.browserAPI) return null;
    const session = await getActiveSessionCheckpoint(context.browserAPI);
    if (!session || !session.domain) return null;

    if (typeof context.matchesTrackingBlacklist === 'function' && context.matchesTrackingBlacklist(session.domain)) {
      await clearActiveSessionCheckpoint(context.browserAPI);
      return null;
    }
    if (context.isTrackingPaused || session.isTrackingPaused) {
      return null;
    }

    const { deltaSeconds, isSleepGap, rawElapsedSec } = calculateReconciledDelta(session, now);
    const canCredit = (session.isBrowserFocused !== false) && (session.isUserActive !== false);

    if (deltaSeconds > 0 && canCredit) {
      creditDomainTime(context, session.domain, deltaSeconds, now);
      if (typeof context.setIntervalStartTime === 'function') {
        context.setIntervalStartTime(now);
      }
    }

    if (isSleepGap) {
      await clearActiveSessionCheckpoint(context.browserAPI);
    } else {
      session.lastHeartbeat = now;
      session.lastHeartbeatTime = now;
      session.lastCommittedTime = now;
      await saveActiveSessionCheckpoint(context.browserAPI, session);
    }

    return { domain: session.domain, creditedSeconds: canCredit ? deltaSeconds : 0, isSleepGap, rawElapsedSec };
  }

  async function processKeepaliveHeartbeat(msg, port, tabId, context) {
    if (!msg || msg.type !== 'KEEPALIVE_HEARTBEAT') return;
    const domain = msg.domain;
    if (!domain) return;
    if (typeof context?.matchesTrackingBlacklist === 'function' && context.matchesTrackingBlacklist(domain)) {
      try { port?.disconnect(); } catch (_) {}
      return;
    }
    const currentActiveTabId = typeof context?.getActiveTabId === 'function' ? context.getActiveTabId() : null;
    const isForegroundTab = currentActiveTabId === null || currentActiveTabId === tabId;
    if (!isForegroundTab || !context?.browserAPI) return;

    const now = (typeof msg?.timestamp === 'number' && msg.timestamp > 0) ? msg.timestamp : Date.now();
    const session = await getActiveSessionCheckpoint(context.browserAPI);
    const lastTime = session?.lastCommittedTime || session?.lastHeartbeat || session?.startTime || now;
    const rawElapsedSec = Math.max(0, Math.floor((now - lastTime) / 1000));
    const cappedDelta = Math.min(rawElapsedSec, MAX_RECONCILE_DRIFT_SEC);
    const canCredit = (context.isBrowserFocused !== false) && (context.isUserActive !== false) && !context.isTrackingPaused;

    if (cappedDelta > 0 && canCredit) {
      creditDomainTime(context, domain, cappedDelta, now);
      if (typeof context.setIntervalStartTime === 'function') {
        context.setIntervalStartTime(now);
      }
    }

    await updateActiveSession(context.browserAPI, {
      domain,
      tabId: typeof tabId === 'number' ? tabId : undefined,
      lastHeartbeat: now,
      lastHeartbeatTime: now,
      lastCommittedTime: now,
      isBrowserFocused: context.isBrowserFocused !== false,
      isUserActive: context.isUserActive !== false,
      isTrackingPaused: !!context.isTrackingPaused
    });
  }

  function handleKeepaliveConnect(port, context) {
    if (!port || port.name !== PORT_NAME_KEEPALIVE) return false;
    const expectedId = context?.browserAPI?.runtime?.id;
    if (expectedId && port.sender?.id && port.sender.id !== expectedId) {
      try { port.disconnect(); } catch (_) {}
      return false;
    }

    const tabId = port.sender?.tab?.id ?? 'orphan';
    activeKeepalivePorts.set(tabId, { port, tabId, connectedAt: Date.now() });

    port.onMessage.addListener(async (msg) => {
      await processKeepaliveHeartbeat(msg, port, tabId, context);
    });

    port.onDisconnect.addListener(() => {
      activeKeepalivePorts.delete(tabId);
    });

    return true;
  }

  const TimestampReconciliation = Object.freeze({
    STORAGE_KEY_ACTIVE_SESSION,
    PORT_NAME_KEEPALIVE,
    KEEPALIVE_HEARTBEAT_INTERVAL_MS,
    MAX_RECONCILE_DRIFT_SEC,
    SLEEP_THRESHOLD_SEC,
    activeKeepalivePorts,
    getSessionStorageArea,
    getActiveSessionCheckpoint,
    saveActiveSessionCheckpoint,
    clearActiveSessionCheckpoint,
    calculateReconciledDelta,
    updateActiveSession,
    creditDomainTime,
    reconcileSessionDelta,
    processKeepaliveHeartbeat,
    handleKeepaliveConnect
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimestampReconciliation;
  }
  global.TimestampReconciliation = TimestampReconciliation;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
