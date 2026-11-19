/**
 * Web Activity & Media Sentinel - Temporal Date Filter Subsystem
 * Pure deterministic date arithmetic, temporal range resolution, and range metric aggregation.
 * 
 * Compliant with Universal Rule 28 (<= 50 lines per function, nesting depth <= 3).
 * 100% W3C Trusted Types safe.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const SUBTAB_LABEL_MAP = Object.freeze({
    today: 'donut_center_today',
    yesterday: 'donut_center_yesterday',
    '7d': 'donut_center_7days',
    '30d': 'donut_center_30days',
    custom: 'donut_center_custom',
    daily: 'donut_center_daily',
    total: 'donut_center_total'
  });

  /**
   * Safely parses YYYY-MM-DD string into local Date without timezone offset drift.
   * @param {string} dateStr
   * @returns {Date}
   */
  function parseYMD(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return new Date();
    const parts = dateStr.split('-').map(n => parseInt(n, 10));
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return new Date();
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  /**
   * Formats a Date instance into standard ISO YYYY-MM-DD.
   * @param {Date} d
   * @returns {string}
   */
  function formatYMD(d) {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Generates consecutive ISO YYYY-MM-DD date strings inclusive between start and end.
   * Standalone fallback with zero dependency on external modules.
   * @param {string} startStr
   * @param {string} endStr
   * @returns {string[]}
   */
  function getDatesInRangeFallback(startStr, endStr) {
    if (!startStr || !endStr) return [startStr || endStr || ''];
    const curr = parseYMD(startStr);
    const end = parseYMD(endStr);
    if (isNaN(curr.getTime()) || isNaN(end.getTime()) || curr > end) {
      return [startStr];
    }
    const dates = [];
    while (curr <= end) {
      dates.push(formatYMD(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }

  /**
   * Resolves list of consecutive date strings based strictly on todayStr reference date.
   * @param {string} temporalMode - 'today'|'yesterday'|'7d'|'30d'|'custom'
   * @param {string} todayStr - Reference anchor date (YYYY-MM-DD)
   * @param {string} [customStart]
   * @param {string} [customEnd]
   * @param {Function} [externalHelper]
   * @returns {string[]}
   */
  function resolveTemporalDateRange(temporalMode, todayStr, customStart, customEnd, externalHelper) {
    const validToday = (todayStr && typeof todayStr === 'string') ? todayStr : formatYMD(new Date());
    if (temporalMode === 'today') return [validToday];

    const anchor = parseYMD(validToday);
    let startStr = validToday;
    let endStr = validToday;

    if (temporalMode === 'yesterday') {
      const y = new Date(anchor);
      y.setDate(y.getDate() - 1);
      startStr = formatYMD(y);
      endStr = startStr;
    } else if (temporalMode === '7d') {
      const s = new Date(anchor);
      s.setDate(s.getDate() - 6);
      startStr = formatYMD(s);
      endStr = validToday;
    } else if (temporalMode === '30d') {
      const s = new Date(anchor);
      s.setDate(s.getDate() - 29);
      startStr = formatYMD(s);
      endStr = validToday;
    } else if (temporalMode === 'custom') {
      startStr = customStart || validToday;
      endStr = customEnd || validToday;
    }

    const helper = (typeof externalHelper === 'function') ? externalHelper : getDatesInRangeFallback;
    return helper(startStr, endStr);
  }

  /**
   * Aggregates foreground, background media, and combined seconds for a domain across dates.
   * @param {Object} domainObj - Domain data node from activityData
   * @param {string[]} datesList - Array of YYYY-MM-DD date strings in active range
   * @param {string} selectedTrackingMode - 'foreground'|'background_media'|'combined'
   * @returns {{ computedSec: number, rangeFgSec: number, rangeBgSec: number, rangeCombinedSec: number }}
   */
  function aggregateDomainRangeStats(domainObj, datesList, selectedTrackingMode) {
    let rangeFgSec = 0;
    let rangeBgSec = 0;
    let rangeCombinedSec = 0;

    if (domainObj && domainObj.days && Array.isArray(datesList)) {
      for (let i = 0; i < datesList.length; i++) {
        const dItem = domainObj.days[datesList[i]];
        if (!dItem) continue;
        rangeFgSec += (typeof dItem.foregroundSeconds === 'number' ? dItem.foregroundSeconds : (dItem.seconds || 0));
        rangeBgSec += (typeof dItem.backgroundMediaSeconds === 'number' ? dItem.backgroundMediaSeconds : 0);
        rangeCombinedSec += (typeof dItem.seconds === 'number' ? dItem.seconds : (dItem.totalSeconds || 0));
      }
    }

    let computedSec = rangeCombinedSec;
    if (selectedTrackingMode === 'foreground') {
      computedSec = rangeFgSec;
    } else if (selectedTrackingMode === 'background_media') {
      computedSec = rangeBgSec;
    }

    return { computedSec, rangeFgSec, rangeBgSec, rangeCombinedSec };
  }

  /**
   * Calculates effective history days divisor for daily average calculations.
   * @param {string} temporalMode
   * @param {number} datesListLength
   * @param {number} historyDaysCount
   * @returns {number}
   */
  function computeEffectiveHistoryDays(temporalMode, datesListLength, historyDaysCount) {
    const raw = Math.max(1, historyDaysCount || 1);
    if (temporalMode === '7d') return Math.max(1, Math.min(7, raw));
    if (temporalMode === '30d') return Math.max(1, Math.min(30, raw));
    if (temporalMode === 'yesterday' || temporalMode === 'today') return 1;
    if (temporalMode === 'custom' && typeof datesListLength === 'number' && datesListLength > 0) {
      return Math.max(1, Math.min(datesListLength, raw));
    }
    return raw;
  }

  /**
   * Retrieves i18n key for the donut chart center sub-label based on active subtab.
   * @param {string} subtab
   * @returns {string}
   */
  function getDonutCenterLabelKey(subtab) {
    return SUBTAB_LABEL_MAP[subtab] || 'donut_center_total';
  }

  const TemporalDateFilter = Object.freeze({
    parseYMD,
    formatYMD,
    getDatesInRangeFallback,
    resolveTemporalDateRange,
    aggregateDomainRangeStats,
    computeEffectiveHistoryDays,
    getDonutCenterLabelKey,
    SUBTAB_LABEL_MAP
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemporalDateFilter;
  }
  global.TemporalDateFilter = TemporalDateFilter;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
