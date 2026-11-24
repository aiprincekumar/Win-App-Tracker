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
  const storageQueues = new WeakMap();
  let fallbackQueue = Promise.resolve();

  function getSessionStorageArea(browserAPI) {
    if (browserAPI && browserAPI.storage && browserAPI.storage.session) {
      return browserAPI.storage.session;
    }
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      return browserAPI.storage.local;
    }
    return null;
  }

  async function readCheckpointRaw(browserAPI) {
    const storage = getSessionStorageArea(browserAPI);
    if (!storage || typeof storage.get !== 'function') return null;
    try {
      const res = await storage.get([STORAGE_KEY_ACTIVE_SESSION]);
      return (res && res[STORAGE_KEY_ACTIVE_SESSION]) || null;
    } catch (_) {
      return null;
    }
  }

  async function writeCheckpointRaw(browserAPI, sessionData) {
    const storage = getSessionStorageArea(browserAPI);
    if (!storage || typeof storage.set !== 'function') return;
    try {
      await storage.set({ [STORAGE_KEY_ACTIVE_SESSION]: sessionData });
    } catch (_) {}
  }

  async function removeCheckpointRaw(browserAPI) {
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

  function enqueueCheckpointOp(browserAPI, taskFn) {
    const storage = getSessionStorageArea(browserAPI);
    const prev = storage ? (storageQueues.get(storage) || Promise.resolve()) : fallbackQueue;
    const next = prev.catch(() => {}).then(() => taskFn());
    const settled = next.catch(() => {});
    if (storage) {
      storageQueues.set(storage, settled);
    } else {
      fallbackQueue = settled;
    }
    return next;
  }

  function getActiveSessionCheckpoint(browserAPI) {
    return enqueueCheckpointOp(browserAPI, () => readCheckpointRaw(browserAPI));
  }

  function saveActiveSessionCheckpoint(browserAPI, sessionData) {
    return enqueueCheckpointOp(browserAPI, () => writeCheckpointRaw(browserAPI, sessionData));
  }

  function clearActiveSessionCheckpoint(browserAPI) {
    return enqueueCheckpointOp(browserAPI, () => removeCheckpointRaw(browserAPI));
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

  function resolveInactiveStamp(explicitVal, isInactive, prevStamp) {
    if (!isInactive) return null;
    return explicitVal !== undefined ? explicitVal : prevStamp;
  }

  function applyMergedSessionUpdates(existing, updates, now) {
    const isDomainChange = updates.domain !== undefined && existing.domain && updates.domain !== existing.domain;
    const fallbackCommitted = isDomainChange ? now : (existing.lastCommittedTime || existing.lastHeartbeat || existing.lastHeartbeatTime || existing.startTime || now);
    const nextFocused = updates.isBrowserFocused !== undefined ? updates.isBrowserFocused : (existing.isBrowserFocused !== false);
    const nextActive = updates.isUserActive !== undefined ? updates.isUserActive : (existing.isUserActive !== false);
    const nextPaused = updates.isTrackingPaused !== undefined ? updates.isTrackingPaused : !!existing.isTrackingPaused;

    const prevFocusLost = isDomainChange ? null : (existing.isBrowserFocused !== false ? now : (existing.focusLostAt ?? null));
    const prevIdleAt = isDomainChange ? null : (existing.isUserActive !== false ? now : (existing.idleStartedAt ?? null));
    const prevPausedAt = !existing.isTrackingPaused ? now : (existing.pausedAt ?? null);

    return {
      domain: updates.domain !== undefined ? updates.domain : existing.domain,
      tabId: updates.tabId !== undefined ? updates.tabId : existing.tabId,
      windowId: updates.windowId !== undefined ? updates.windowId : existing.windowId,
      startTime: updates.startTime || (isDomainChange ? now : (existing.startTime || now)),
      lastHeartbeat: updates.lastHeartbeat || now,
      lastHeartbeatTime: updates.lastHeartbeatTime || updates.lastHeartbeat || now,
      lastCommittedTime: updates.lastCommittedTime || fallbackCommitted,
      isBrowserFocused: nextFocused,
      isUserActive: nextActive,
      isTrackingPaused: nextPaused,
      focusLostAt: resolveInactiveStamp(updates.focusLostAt, nextFocused === false, prevFocusLost),
      idleStartedAt: resolveInactiveStamp(updates.idleStartedAt, nextActive === false, prevIdleAt),
      pausedAt: resolveInactiveStamp(updates.pausedAt, nextPaused === true, prevPausedAt),
      heartbeatCount: (existing.heartbeatCount || 0) + 1,
      schemaVersion: 1
    };
  }

  function updateActiveSession(browserAPI, updates = {}) {
    if (!browserAPI) return Promise.resolve(null);
    return enqueueCheckpointOp(browserAPI, async () => {
      const existing = (await readCheckpointRaw(browserAPI)) || {};
      const merged = applyMergedSessionUpdates(existing, updates, Date.now());
      await writeCheckpointRaw(browserAPI, merged);
      return merged;
    });
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

  function resolveReconciliationPlan(session, context, now = Date.now()) {
    const lastTime = session.lastCommittedTime || session.lastHeartbeat || session.lastHeartbeatTime || session.startTime || now;
    const isFocused = (session.isBrowserFocused !== false) && (context?.isBrowserFocused !== false);
    const isActive = (session.isUserActive !== false) && (context?.isUserActive !== false);

    if (isFocused && isActive) {
      const { deltaSeconds, isSleepGap, rawElapsedSec } = calculateReconciledDelta(session, now);
      if (isSleepGap) {
        return { creditedSeconds: deltaSeconds, isSleepGap: true, rawElapsedSec, committedAt: now };
      }
      if (deltaSeconds > 0) {
        const committedAt = (rawElapsedSec === deltaSeconds) ? (lastTime + deltaSeconds * 1000) : now;
        return { creditedSeconds: deltaSeconds, isSleepGap: false, rawElapsedSec, committedAt };
      }
      return { creditedSeconds: 0, isSleepGap: false, rawElapsedSec, committedAt: lastTime };
    }

    const focusCutoff = (typeof session.focusLostAt === 'number' && session.focusLostAt > lastTime) ? session.focusLostAt : Infinity;
    const idleCutoff = (typeof session.idleStartedAt === 'number' && session.idleStartedAt > lastTime) ? session.idleStartedAt : Infinity;
    const cutoff = Math.min(now, focusCutoff, idleCutoff);
    const overall = calculateReconciledDelta(session, now);
    const hasPreCutoff = (focusCutoff <= now || idleCutoff <= now) && cutoff > lastTime;

    if (hasPreCutoff) {
      const preCalc = calculateReconciledDelta({ ...session, lastCommittedTime: lastTime }, cutoff);
      return {
        creditedSeconds: preCalc.deltaSeconds,
        isSleepGap: preCalc.isSleepGap || overall.isSleepGap,
        rawElapsedSec: overall.rawElapsedSec,
        committedAt: now
      };
    }
    return { creditedSeconds: 0, isSleepGap: overall.isSleepGap, rawElapsedSec: overall.rawElapsedSec, committedAt: now };
  }

  function reconcileSessionDelta(context, now = Date.now()) {
    if (!context || !context.browserAPI) return Promise.resolve(null);
    return enqueueCheckpointOp(context.browserAPI, async () => {
      const session = await readCheckpointRaw(context.browserAPI);
      if (!session || !session.domain) return null;

      if (typeof context.matchesTrackingBlacklist === 'function' && context.matchesTrackingBlacklist(session.domain)) {
        await removeCheckpointRaw(context.browserAPI);
        return null;
      }
      if (context.isTrackingPaused || session.isTrackingPaused) {
        return null;
      }

      const plan = resolveReconciliationPlan(session, context, now);
      if (plan.creditedSeconds > 0) {
        creditDomainTime(context, session.domain, plan.creditedSeconds, now);
        const canResetAnchor = typeof context.setIntervalStartTime === 'function' && (!context.activeDomain || context.activeDomain === session.domain);
        if (canResetAnchor) context.setIntervalStartTime(plan.committedAt);
      }

      if (plan.isSleepGap) {
        await removeCheckpointRaw(context.browserAPI);
      } else {
        session.lastHeartbeat = now;
        session.lastHeartbeatTime = now;
        session.lastCommittedTime = plan.committedAt;
        session.focusLostAt = null;
        session.idleStartedAt = null;
        await writeCheckpointRaw(context.browserAPI, session);
      }

      return {
        domain: session.domain,
        creditedSeconds: plan.creditedSeconds,
        isSleepGap: plan.isSleepGap,
        rawElapsedSec: plan.rawElapsedSec
      };
    });
  }

  function resolveHeartbeatCommit(sameDomainSession, context, meta) {
    const { domain, now } = meta;
    const lastTime = sameDomainSession?.lastCommittedTime || sameDomainSession?.lastHeartbeat || sameDomainSession?.startTime || now;
    const rawElapsedSec = Math.max(0, Math.floor((now - lastTime) / 1000));
    const cappedDelta = Math.min(rawElapsedSec, MAX_RECONCILE_DRIFT_SEC);
    const canCredit = (context.isBrowserFocused !== false) && (context.isUserActive !== false) && !context.isTrackingPaused;

    if (cappedDelta > 0 && canCredit) {
      const committedAt = (rawElapsedSec === cappedDelta) ? (lastTime + cappedDelta * 1000) : now;
      creditDomainTime(context, domain, cappedDelta, now);
      if (typeof context.setIntervalStartTime === 'function') {
        context.setIntervalStartTime(committedAt);
      }
      return committedAt;
    }
    if (canCredit && cappedDelta === 0) {
      return sameDomainSession?.lastCommittedTime || lastTime;
    }
    const hasUnflushedFocus = typeof sameDomainSession?.focusLostAt === 'number' && sameDomainSession.focusLostAt > lastTime;
    const hasUnflushedIdle = typeof sameDomainSession?.idleStartedAt === 'number' && sameDomainSession.idleStartedAt > lastTime;
    return (sameDomainSession && (hasUnflushedFocus || hasUnflushedIdle)) ? lastTime : now;
  }

  function processKeepaliveHeartbeat(msg, port, tabId, context) {
    if (!msg || msg.type !== 'KEEPALIVE_HEARTBEAT' || !msg.domain) return Promise.resolve();
    const domain = msg.domain;
    if (typeof context?.matchesTrackingBlacklist === 'function' && context.matchesTrackingBlacklist(domain)) {
      try { port?.disconnect(); } catch (_) {}
      return Promise.resolve();
    }
    const currentActiveTabId = typeof context?.getActiveTabId === 'function' ? context.getActiveTabId() : null;
    const isForegroundTab = currentActiveTabId === null || currentActiveTabId === tabId;
    if (!isForegroundTab || !context?.browserAPI) return Promise.resolve();

    const now = (typeof msg?.timestamp === 'number' && msg.timestamp > 0) ? msg.timestamp : Date.now();
    return enqueueCheckpointOp(context.browserAPI, async () => {
      const session = await readCheckpointRaw(context.browserAPI);
      const sameDomainSession = (session && session.domain === domain) ? session : null;
      const nextLastCommittedTime = resolveHeartbeatCommit(sameDomainSession, context, { domain, now });
      const merged = applyMergedSessionUpdates(session || {}, {
        domain,
        tabId: typeof tabId === 'number' ? tabId : undefined,
        lastHeartbeat: now,
        lastHeartbeatTime: now,
        lastCommittedTime: nextLastCommittedTime,
        isBrowserFocused: context.isBrowserFocused !== false,
        isUserActive: context.isUserActive !== false,
        isTrackingPaused: !!context.isTrackingPaused
      }, now);
      await writeCheckpointRaw(context.browserAPI, merged);
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
    resolveReconciliationPlan,
    applyMergedSessionUpdates,
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
