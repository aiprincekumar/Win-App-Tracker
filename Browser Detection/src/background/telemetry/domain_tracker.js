/**
 * Web Activity & Media Sentinel - Domain Tracker Subsystem
 * Tracks domain activity time, categories, and dual media metrics.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Formatters = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/formatters.js')
    : (global.SharedFormatters || {});

  function ensureDomainRecord(activityData, domain) {
    if (!activityData.domains[domain]) {
      activityData.domains[domain] = {
        totalSeconds: 0,
        foregroundSeconds: 0,
        backgroundMediaSeconds: 0,
        sessions: 0,
        lastVisited: Date.now(),
        favicon: Formatters.getFaviconUrl ? Formatters.getFaviconUrl(domain) : 'icons/icon32.png',
        category: (Formatters.isInternalDomain && Formatters.isInternalDomain(domain)) ? 'internal' : 'website',
        history: {}
      };
    }
    return activityData.domains[domain];
  }

  function addDomainSeconds(activityData, domain, seconds, dateStr, isMedia = false) {
    if (!domain || seconds <= 0) return;
    const record = ensureDomainRecord(activityData, domain);
    const s = Math.round(seconds);

    record.totalSeconds = (record.totalSeconds || 0) + s;
    if (isMedia) {
      record.backgroundMediaSeconds = (record.backgroundMediaSeconds || 0) + s;
    } else {
      record.foregroundSeconds = (record.foregroundSeconds || 0) + s;
    }
    record.lastVisited = Date.now();

    if (!record.history) record.history = {};
    if (!record.history[dateStr]) {
      record.history[dateStr] = {
        totalSeconds: 0,
        foregroundSeconds: 0,
        backgroundMediaSeconds: 0,
        sessions: 0
      };
    }
    const dayRec = record.history[dateStr];
    dayRec.totalSeconds = (dayRec.totalSeconds || 0) + s;
    if (isMedia) {
      dayRec.backgroundMediaSeconds = (dayRec.backgroundMediaSeconds || 0) + s;
    } else {
      dayRec.foregroundSeconds = (dayRec.foregroundSeconds || 0) + s;
    }

    activityData.lastUpdated = Date.now();
  }

  const DomainTracker = {
    ensureDomainRecord,
    addDomainSeconds
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainTracker;
  }
  global.DomainTracker = DomainTracker;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
