/**
 * Web Activity & Media Sentinel - Foreground Tracking Guard
 * Pure policy helpers for media idle exemption, heartbeat wake evaluation,
 * monotonic commit anchoring, and non-clobber window classification.
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Returns true when active foreground media playback should bypass OS idle freeze.
   * System lock always revokes exemption.
   *
   * @param {object} context
   * @returns {boolean}
   */
  function isMediaExemptionActive(context) {
    return Boolean(
      context &&
      !context.isSystemLocked &&
      typeof context.isActivelyWatchingMedia === 'function' &&
      context.isActivelyWatchingMedia() === true
    );
  }

  /**
   * Evaluates whether a keepalive heartbeat reflects recent page activity
   * that should restore user active state while focused and unlocked.
   *
   * @param {object} msg
   * @param {object} context
   * @returns {boolean}
   */
  function shouldWakeOnRecentActivity(msg, context) {
    if (!context || context.isUserActive !== false || context.isSystemLocked || context.isBrowserFocused === false) {
      return false;
    }
    const elapsed = msg && msg.timeSinceLastActivity;
    const threshold = (typeof context.idleThresholdMs === 'number' && context.idleThresholdMs > 0)
      ? context.idleThresholdMs
      : 300000;
    return typeof elapsed === 'number' && elapsed >= 0 && elapsed < threshold;
  }

  /**
   * Resolves a monotonic commit boundary across async session storage checkpoints
   * and live in-memory intervalStartTime updates.
   *
   * @param {object|null} sameDomainSession
   * @param {object} context
   * @param {string} domain
   * @param {number} now
   * @returns {number}
   */
  function resolveMonotonicLastCommitted(sameDomainSession, context, domain, now) {
    const sessionLast = sameDomainSession?.lastCommittedTime ||
      sameDomainSession?.lastHeartbeat ||
      sameDomainSession?.lastHeartbeatTime ||
      sameDomainSession?.startTime ||
      now;
    if (context?.activeDomain === domain && typeof context.getIntervalStartTime === 'function') {
      const ctxStart = context.getIntervalStartTime() || 0;
      if (ctxStart > sessionLast && ctxStart <= now) {
        return ctxStart;
      }
    }
    return sessionLast;
  }

  /**
   * Computes exact whole-second commit boundary so sub-second fractional ms carry over.
   *
   * @param {number} prevStart
   * @param {number} validSec
   * @param {number} elapsedSec
   * @param {number} now
   * @returns {number}
   */
  function computeSubSecondCommitEndMs(prevStart, validSec, elapsedSec, now) {
    return (validSec === elapsedSec) ? (prevStart + validSec * 1000) : now;
  }

  /**
   * Identifies auxiliary browser windows (DevTools, panels, extension/empty popups)
   * whose focus should not clear tracked foreground domain attribution.
   *
   * @param {object|null} win
   * @returns {boolean}
   */
  function isNonClobberWindow(win) {
    if (!win) return false;
    if (win.type === 'devtools' || win.type === 'panel') return true;
    if (win.type !== 'popup') return false;
    if (win._isExtensionOrAuxiliaryPopup === true) return true;
    if (win.id != null && Array.isArray(win.tabs)) {
      return !win.tabs.some((t) => t && /^https?:\/\//i.test(t.url || t.pendingUrl || ''));
    }
    return false;
  }

  /**
   * Returns true when a window is explicitly unfocused or minimized during tab activation.
   *
   * @param {object|null} win
   * @returns {boolean}
   */
  function isUnfocusedActivationWindow(win) {
    return Boolean(win && (win.focused === false || win.state === 'minimized'));
  }

  /**
   * Extracts the best available URL for an activating or navigating tab.
   *
   * @param {object|null} tab
   * @returns {string}
   */
  function extractTabCandidateUrl(tab) {
    return (tab && (tab.url || tab.pendingUrl)) || '';
  }

  const ForegroundTrackingGuard = Object.freeze({
    isMediaExemptionActive,
    shouldWakeOnRecentActivity,
    resolveMonotonicLastCommitted,
    computeSubSecondCommitEndMs,
    isNonClobberWindow,
    isUnfocusedActivationWindow,
    extractTabCandidateUrl
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForegroundTrackingGuard;
  }
  global.ForegroundTrackingGuard = ForegroundTrackingGuard;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
