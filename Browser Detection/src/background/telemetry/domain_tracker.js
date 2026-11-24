/**
 * Web Activity & Media Sentinel - Domain Tracker Subsystem
 * High-precision domain active time tracking, category isolation, and dual-media aggregation.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Formatters = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/formatters.js')
    : (global.SharedFormatters || {});

  const getToday = Formatters.getTodayDateString || (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const getFavicon = Formatters.getFaviconUrl || ((domain) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`);
  const isInternal = Formatters.isInternalDomain || (() => false);

  /**
   * Ensures an initialized domain record exists within activityData.
   * 
   * @param {object} activityData
   * @param {string} domain
   * @returns {object}
   */
  function ensureDomainRecord(activityData, domain) {
    if (!activityData || !activityData.domains) return null;
    if (!activityData.domains[domain]) {
      activityData.domains[domain] = {
        favicon: getFavicon(domain),
        totalSeconds: 0,
        foregroundSeconds: 0,
        backgroundMediaSeconds: 0,
        sessionCount: 1,
        lastActive: Date.now(),
        category: isInternal(domain) ? 'internal' : 'website',
        days: {}
      };
    }
    return activityData.domains[domain];
  }

  /**
   * Commits the active foreground interval for the currently focused tab.
   * Prevents time leakage when browser is unfocused, user is idle, or tracking is paused.
   * 
   * @param {object} state In-memory state object
   * @param {object} [context] Optional callbacks { streamDelta, scheduleSave }
   * @returns {number} Seconds committed
   */
  function commitActiveInterval(state, context = {}) {
    if (!state) return 0;
    const isMediaActive = !state.isSystemLocked &&
      typeof context.isActivelyWatchingMedia === 'function' &&
      context.isActivelyWatchingMedia() === true;
    if (state.isTrackingPaused || state.isSystemLocked || !state.activeDomain || !state.isBrowserFocused || (!state.isUserActive && !isMediaActive)) {
      state.intervalStartTime = Date.now();
      return 0;
    }

    const now = Date.now();
    const prevStart = state.intervalStartTime || now;
    const elapsedMs = Math.max(0, now - prevStart);
    const elapsedSec = Math.floor(elapsedMs / 1000);

    if (elapsedSec > 0) {
      const validSec = Math.min(elapsedSec, 3600);
      const commitEndMs = (validSec === elapsedSec) ? (prevStart + validSec * 1000) : now;
      const today = getToday();
      const domainEntry = ensureDomainRecord(state.activityData, state.activeDomain);

      domainEntry.totalSeconds = (domainEntry.totalSeconds || 0) + validSec;
      domainEntry.foregroundSeconds = (domainEntry.foregroundSeconds || 0) + validSec;
      domainEntry.lastActive = now;

      if (!domainEntry.days[today]) {
        domainEntry.days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
      }
      const dayEntry = domainEntry.days[today];
      dayEntry.seconds = (dayEntry.seconds || 0) + validSec;
      dayEntry.foregroundSeconds = (dayEntry.foregroundSeconds || 0) + validSec;

      state.intervalStartTime = commitEndMs;
      if (state.activityData) {
        state.activityData.lastUpdated = now;
      }

      if (typeof context.streamDelta === 'function') {
        context.streamDelta(state.activeDomain, validSec, false, 'foreground');
      }
      if (typeof context.scheduleSave === 'function') {
        context.scheduleSave(false);
      }
      return validSec;
    }

    return 0;
  }

  /**
   * Commits background media playback duration for a domain (Method B).
   * 
   * @param {object} state
   * @param {string} domain
   * @param {number} seconds
   * @param {object} [context]
   * @returns {number}
   */
  function commitBackgroundMediaDelta(state, domain, seconds, context = {}) {
    if (!state || !domain || seconds <= 0) return 0;
    const validSec = Math.min(seconds, 3600);
    const today = getToday();
    const now = Date.now();
    const domainEntry = ensureDomainRecord(state.activityData, domain);

    domainEntry.totalSeconds = (domainEntry.totalSeconds || 0) + validSec;
    domainEntry.backgroundMediaSeconds = (domainEntry.backgroundMediaSeconds || 0) + validSec;
    domainEntry.lastActive = now;

    if (!domainEntry.days[today]) {
      domainEntry.days[today] = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };
    }
    const dayEntry = domainEntry.days[today];
    dayEntry.seconds = (dayEntry.seconds || 0) + validSec;
    dayEntry.backgroundMediaSeconds = (dayEntry.backgroundMediaSeconds || 0) + validSec;

    if (state.activityData) {
      state.activityData.lastUpdated = now;
    }

    if (typeof context.streamDelta === 'function') {
      context.streamDelta(domain, validSec, false, 'background_media');
    }
    if (typeof context.scheduleSave === 'function') {
      context.scheduleSave(false);
    }
    return validSec;
  }

  /**
   * Switches the active domain tracker.
   * If newDomain is null or an untracked page, clears activeDomain so seconds NEVER leak.
   * 
   * @param {object} state
   * @param {string|null} newDomain
   * @param {boolean} [isNewSession=false]
   * @param {object} [context]
   */
  function switchActiveDomain(state, newDomain, isNewSession = false, context = {}) {
    if (!state) return;
    commitActiveInterval(state, context);

    if (!newDomain) {
      if (state.activeDomain !== null) {
        state.activeDomain = null;
        state.intervalStartTime = Date.now();
        if (typeof context.sendHudUpdate === 'function') context.sendHudUpdate();
        if (typeof context.scheduleSave === 'function') context.scheduleSave(true);
      }
      return;
    }

    if (newDomain !== state.activeDomain) {
      state.activeDomain = newDomain;
      state.intervalStartTime = Date.now();
      const today = getToday();
      const domainEntry = ensureDomainRecord(state.activityData, state.activeDomain);

      if (isNewSession) {
        domainEntry.sessionCount = (domainEntry.sessionCount || 0) + 1;
        if (domainEntry.days[today]) {
          domainEntry.days[today].sessions = (domainEntry.days[today].sessions || 0) + 1;
        }
      }

      if (typeof context.streamDelta === 'function') {
        context.streamDelta(state.activeDomain, 0, isNewSession, 'foreground');
      }
      if (typeof context.sendHudUpdate === 'function') {
        context.sendHudUpdate();
      }
      if (typeof context.scheduleSave === 'function') {
        context.scheduleSave(false);
      }
    }
  }

  const DomainTracker = Object.freeze({
    ensureDomainRecord,
    commitActiveInterval,
    commitBackgroundMediaDelta,
    switchActiveDomain
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainTracker;
  }
  global.DomainTracker = DomainTracker;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
