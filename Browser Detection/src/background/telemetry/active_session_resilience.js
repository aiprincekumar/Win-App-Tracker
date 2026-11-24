/**
 * Web Activity & Media Sentinel - Active Session Resilience Helpers
 * Pure/serialized helpers for continuous foreground media reconciliation,
 * outgoing tab final-flush attribution, and startup idle-freeze deferral.
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const MAX_MEDIA_RECONCILE_SEC = 3600;

  /**
   * Reconciles continuous focused foreground media sessions across long SW gaps
   * (e.g., MV3 5-minute port recycle) without falsely dropping into a 15s sleep void.
   *
   * @param {object} session
   * @param {number} lastTime
   * @param {number} now
   * @param {number} [maxDriftSec=300]
   * @returns {object}
   */
  function resolveActiveMediaReconciliation(session, lastTime, now, maxDriftSec = 300) {
    const anchor = (typeof lastTime === 'number' && lastTime > 0)
      ? lastTime
      : (session?.lastCommittedTime || session?.lastHeartbeat || session?.startTime || now);
    const elapsedMs = Math.max(0, now - anchor);
    const rawElapsedSec = Math.floor(elapsedMs / 1000);
    if (rawElapsedSec <= 0) {
      return {
        creditedSeconds: 0,
        isSleepGap: false,
        rawElapsedSec: 0,
        committedAt: anchor,
        creditStartMs: anchor,
        creditEndMs: anchor
      };
    }
    const ceiling = Math.max(MAX_MEDIA_RECONCILE_SEC, Number(maxDriftSec) || 300);
    const validSec = Math.min(rawElapsedSec, ceiling);
    const committedAt = (validSec === rawElapsedSec) ? (anchor + validSec * 1000) : now;
    return {
      creditedSeconds: validSec,
      isSleepGap: false,
      rawElapsedSec,
      committedAt,
      creditStartMs: committedAt - validSec * 1000,
      creditEndMs: committedAt
    };
  }

  /**
   * Clones live context descriptors while neutralizing intervalStartTime writes
   * so an outgoing tab's final flush never advances the newly activated tab's anchor.
   *
   * @param {object} context
   * @returns {object}
   */
  function buildOutgoingFlushContext(context) {
    const clone = Object.defineProperties({}, Object.getOwnPropertyDescriptors(context));
    clone.setIntervalStartTime = () => {};
    return clone;
  }

  /**
   * Credits trailing pre-switch foreground delta for an outgoing tab's final-flush
   * heartbeat without clobbering a checkpoint already rotated to the new active domain.
   *
   * @param {object} msg
   * @param {number|string} tabId
   * @param {object} context
   * @param {object} helpers
   * @returns {Promise<object|null>}
   */
  async function processOutgoingFinalFlush(msg, tabId, context, helpers) {
    if (!msg || !msg.domain || !context || !context.browserAPI || !helpers) return null;
    if (typeof context.matchesTrackingBlacklist === 'function' && context.matchesTrackingBlacklist(msg.domain)) {
      return null;
    }
    if (context.isTrackingPaused || context.isSystemLocked) return null;

    const { readCheckpointRaw, writeCheckpointRaw, resolveHeartbeatCommit, applyMergedSessionUpdates, enqueueCheckpointOp } = helpers;
    const now = (typeof msg.timestamp === 'number' && msg.timestamp > 0) ? msg.timestamp : Date.now();
    const flushContext = buildOutgoingFlushContext(context);

    return enqueueCheckpointOp(context.browserAPI, async () => {
      const session = await readCheckpointRaw(context.browserAPI);
      if (!session || session.domain !== msg.domain) return null;
      if (session.tabId !== undefined && typeof tabId === 'number' && session.tabId !== tabId) return null;

      const nextLastCommittedTime = resolveHeartbeatCommit(session, flushContext, { domain: msg.domain, now });
      const merged = applyMergedSessionUpdates(session, {
        domain: msg.domain,
        tabId: typeof tabId === 'number' ? tabId : session.tabId,
        lastHeartbeat: Math.max(session.lastHeartbeat || 0, now),
        lastHeartbeatTime: Math.max(session.lastHeartbeatTime || 0, now),
        lastCommittedTime: nextLastCommittedTime,
        isBrowserFocused: context.isBrowserFocused !== false,
        isUserActive: context.isUserActive !== false,
        isTrackingPaused: !!context.isTrackingPaused
      }, now);
      await writeCheckpointRaw(context.browserAPI, merged);
      return merged;
    });
  }

  /**
   * Returns true when startup idle freeze should defer for active or previously-active
   * foreground media hydration on Service Worker wake.
   *
   * @param {string} idleState
   * @param {object} context
   * @param {object|null} prevSession
   * @returns {boolean}
   */
  function shouldDelayStartupIdleFreeze(idleState, context, prevSession) {
    if (idleState !== 'idle' || !context || context.isBrowserFocused === false) return false;
    const liveMedia = typeof context.isActivelyWatchingMedia === 'function' && context.isActivelyWatchingMedia() === true;
    return Boolean(liveMedia || (prevSession && prevSession.wasMediaActive));
  }

  const ActiveSessionResilience = Object.freeze({
    MAX_MEDIA_RECONCILE_SEC,
    resolveActiveMediaReconciliation,
    buildOutgoingFlushContext,
    processOutgoingFinalFlush,
    shouldDelayStartupIdleFreeze
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActiveSessionResilience;
  }
  global.ActiveSessionResilience = ActiveSessionResilience;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
