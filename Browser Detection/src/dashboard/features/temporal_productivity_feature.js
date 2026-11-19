/**
 * Web Activity & Media Sentinel - Temporal Engine & Productivity Classifier Feature
 * Features 1 & 2: Custom Temporal Range, 7x24 Chrono-Distribution Heatmap,
 * Dynamic Productivity Score Engine, and Smart Domain Classification Overrides.
 * 
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // 5-Tier Standard Category Taxonomy
  const CATEGORIES = Object.freeze([
    'work',
    'learning',
    'entertainment',
    'social',
    'utility'
  ]);

  // Built-in Knowledge Base for Domain Categories
  const DEFAULT_DOMAIN_CATEGORIES = Object.freeze({
    // Work & Development (Weight: 1.0)
    'github.com': 'work',
    'gitlab.com': 'work',
    'stackoverflow.com': 'work',
    'stackexchange.com': 'work',
    'vscode.dev': 'work',
    'jira.atlassian.com': 'work',
    'linear.app': 'work',
    'aws.amazon.com': 'work',
    'console.cloud.google.com': 'work',
    'portal.azure.com': 'work',
    'figma.com': 'work',
    'localhost': 'work',
    '127.0.0.1': 'work',
    'npmjs.com': 'work',
    'bitbucket.org': 'work',
    'codepen.io': 'work',
    'codesandbox.io': 'work',

    // Learning & Research (Weight: 0.95)
    'developer.mozilla.org': 'learning',
    'arxiv.org': 'learning',
    'coursera.org': 'learning',
    'udemy.com': 'learning',
    'edx.org': 'learning',
    'khanacademy.org': 'learning',
    'wikipedia.org': 'learning',
    'medium.com': 'learning',
    'dev.to': 'learning',
    'scholar.google.com': 'learning',
    'w3schools.com': 'learning',
    'geeksforgeeks.org': 'learning',
    'freecodecamp.org': 'learning',
    'researchgate.net': 'learning',

    // Entertainment & Media (Penalty: -0.8)
    'youtube.com': 'entertainment',
    'netflix.com': 'entertainment',
    'spotify.com': 'entertainment',
    'twitch.tv': 'entertainment',
    'primevideo.com': 'entertainment',
    'hotstar.com': 'entertainment',
    'hulu.com': 'entertainment',
    'disneyplus.com': 'entertainment',
    'crunchyroll.com': 'entertainment',
    'soundcloud.com': 'entertainment',

    // Social & Communication (Penalty: -0.4)
    'web.whatsapp.com': 'social',
    'slack.com': 'social',
    'discord.com': 'social',
    'twitter.com': 'social',
    'x.com': 'social',
    'reddit.com': 'social',
    'instagram.com': 'social',
    'telegram.org': 'social',
    't.me': 'social',
    'facebook.com': 'social',
    'linkedin.com': 'social',
    'messenger.com': 'social',

    // Utilities & Tools (Weight: 0.7)
    'mail.google.com': 'utility',
    'drive.google.com': 'utility',
    'notion.so': 'utility',
    'trello.com': 'utility',
    'google.com': 'utility',
    'translate.google.com': 'utility',
    'docs.google.com': 'utility',
    'sheets.google.com': 'utility',
    'keep.google.com': 'utility',
    'calendar.google.com': 'utility'
  });

  /**
   * Resolves category for a given domain using overrides first, then built-in map.
   * @param {string} domain 
   * @param {Object} [overrides] 
   * @returns {string} One of 'work' | 'learning' | 'entertainment' | 'social' | 'utility'
   */
  function getDomainCategory(domain, overrides) {
    if (!domain) return 'utility';
    const clean = String(domain).toLowerCase().trim();

    if (overrides && overrides[clean]) {
      if (typeof overrides[clean] === 'string') {
        return overrides[clean];
      }
      if (typeof overrides[clean] === 'object' && overrides[clean].category) {
        return overrides[clean].category;
      }
    }

    // Direct match
    if (DEFAULT_DOMAIN_CATEGORIES[clean]) {
      return DEFAULT_DOMAIN_CATEGORIES[clean];
    }

    // Subdomain matching (e.g. music.youtube.com -> youtube.com)
    const parts = clean.split('.');
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join('.');
      if (DEFAULT_DOMAIN_CATEGORIES[parentDomain]) {
        return DEFAULT_DOMAIN_CATEGORIES[parentDomain];
      }
    }

    // Internal scheme heuristic
    if (
      clean.startsWith('chrome') ||
      clean.startsWith('edge') ||
      clean.startsWith('about') ||
      clean === 'dashboard' ||
      clean === 'extension' ||
      clean === 'localhost' ||
      clean === '127.0.0.1'
    ) {
      return 'utility';
    }

    return 'work';
  }

  /**
   * Calculates productivity score based on standard formula (clamped 0 to 100).
   * Formula: clamp(0, 100, (W * 1.0 + L * 0.95 + U * 0.7 - S * 0.4 - E * 0.8) / T_active * 100)
   * 
   * @param {Object} timeByCategory - Record of seconds per category
   * @param {number} [totalActiveTime] - Total active time in seconds
   * @returns {Object} Productivity summary with score, tier, timeByCategory, and totalActiveTime
   */
  function calculateProductivityScore(timeByCategory, totalActiveTime) {
    const W = (timeByCategory && Number(timeByCategory.work)) || 0;
    const L = (timeByCategory && Number(timeByCategory.learning)) || 0;
    const U = (timeByCategory && Number(timeByCategory.utility)) || 0;
    const S = (timeByCategory && Number(timeByCategory.social)) || 0;
    const E = (timeByCategory && Number(timeByCategory.entertainment)) || 0;

    const sumCategories = W + L + U + S + E;
    const T = typeof totalActiveTime === 'number' && totalActiveTime > 0
      ? totalActiveTime
      : sumCategories;

    if (T <= 0) {
      const summary = {
        score: 0,
        tier: 'distracted',
        timeByCategory: { work: W, learning: L, utility: U, social: S, entertainment: E },
        totalActiveTime: 0,
        valueOf: function () { return this.score; }
      };
      return summary;
    }

    const rawNumerator = (W * 1.0) + (L * 0.95) + (U * 0.7) - (S * 0.4) - (E * 0.8);
    const rawScore = (rawNumerator / T) * 100;
    const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    let tier = 'distracted';
    if (clampedScore >= 80) {
      tier = 'focus';
    } else if (clampedScore >= 60) {
      tier = 'balanced';
    } else {
      tier = 'distracted';
    }

    const summary = {
      score: clampedScore,
      tier: tier,
      timeByCategory: { work: W, learning: L, utility: U, social: S, entertainment: E },
      totalActiveTime: T,
      valueOf: function () { return this.score; }
    };

    return summary;
  }

  /**
   * Helper to generate consecutive ISO YYYY-MM-DD date strings in range inclusive.
   */
  function getDatesInRange(startStr, endStr) {
    const dates = [];
    if (!startStr || !endStr) return dates;
    try {
      const sParts = startStr.split('-');
      const eParts = endStr.split('-');
      const curr = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
      const end = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, parseInt(eParts[2], 10));

      if (isNaN(curr.getTime()) || isNaN(end.getTime()) || curr > end) {
        return [startStr];
      }

      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        curr.setDate(curr.getDate() + 1);
      }
    } catch (_) {
      return [startStr];
    }
    return dates;
  }

  /**
   * Resolves list of consecutive date strings anchored to todayStr.
   * Universal Rule 28 compliant (<= 35 lines, nesting <= 3).
   */
  function resolveTemporalDateRange(temporalMode, todayStr, customStart, customEnd) {
    let tStr = todayStr;
    if (!tStr || typeof tStr !== 'string') {
      const now = new Date();
      tStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    if (temporalMode === 'today') return [tStr];

    const sParts = tStr.split('-');
    const anchor = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
    let startStr = tStr;
    let endStr = tStr;

    if (temporalMode === 'yesterday') {
      const y = new Date(anchor);
      y.setDate(y.getDate() - 1);
      startStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      endStr = startStr;
    } else if (temporalMode === '7d') {
      const s = new Date(anchor);
      s.setDate(s.getDate() - 6);
      startStr = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
      endStr = tStr;
    } else if (temporalMode === '30d') {
      const s = new Date(anchor);
      s.setDate(s.getDate() - 29);
      startStr = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
      endStr = tStr;
    } else if (temporalMode === 'custom') {
      startStr = customStart || tStr;
      endStr = customEnd || tStr;
    }

    return getDatesInRange(startStr, endStr);
  }

  /**
   * Checks if dayData contains non-zero hourly telemetry
   * @param {Object} dayData - Day telemetry record
   * @returns {boolean} True if hourly telemetry has valid non-zero duration
   */
  function hasValidHourlyTelemetry(dayData) {
    if (!dayData || !dayData.hourlyBuckets || typeof dayData.hourlyBuckets !== 'object') {
      return false;
    }
    const keys = Object.keys(dayData.hourlyBuckets);
    if (keys.length === 0) return false;
    return keys.some(k => {
      const b = dayData.hourlyBuckets[k];
      return b && ((b.activeTime || b.activeSeconds || 0) > 0 || (b.mediaTime || b.mediaSeconds || b.backgroundMediaSeconds || 0) > 0);
    });
  }

  /**
   * Applies domain-based fallback distribution across business hours (10:00 to 18:00)
   * @param {Object} domains - Map of domain records
   * @param {number} dayOfWeek - Day index (0=Mon, 6=Sun)
   * @param {Array<Array<Object>>} matrix - Heatmap matrix
   * @returns {{dayActive: number, dayMedia: number}} Total active and media seconds
   */
  function applyDomainFallbackToMatrix(domains, dayOfWeek, matrix) {
    let dayActive = 0;
    let dayMedia = 0;
    let dayTopDomain = '';
    let maxSec = 0;

    for (const [dom, dObj] of Object.entries(domains)) {
      const s = (dObj && (dObj.activeTime || dObj.seconds || dObj.foregroundSeconds || dObj.totalSeconds)) || 0;
      const m = (dObj && (dObj.mediaTime || dObj.backgroundMediaSeconds)) || 0;
      dayActive += s;
      dayMedia += m;
      if (s > maxSec) {
        maxSec = s;
        dayTopDomain = dom;
      }
    }

    if (dayActive > 0 || dayMedia > 0) {
      const perHour = Math.round(dayActive / 8);
      const perHourMedia = Math.round(dayMedia / 8);
      for (let h = 10; h < 18; h++) {
        matrix[dayOfWeek][h].activeSeconds += perHour;
        matrix[dayOfWeek][h].mediaSeconds += perHourMedia;
        if (!matrix[dayOfWeek][h].topDomain && dayTopDomain) {
          matrix[dayOfWeek][h].topDomain = dayTopDomain;
        }
      }
    }

    return { dayActive, dayMedia };
  }

  // ---------------------------------------------------------------------------
  // Circadian Weight Vectors for Diurnal Historical Backfill (Phase 3)
  // ---------------------------------------------------------------------------
  const WORK_HOURLY_WEIGHTS = Object.freeze([
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,  // 00:00 - 07:59 (sleep)
    0.03, 0.07, 0.14, 0.14,                   // 08:00 - 11:59 (morning ramp & peak)
    0.06, 0.06,                               // 12:00 - 13:59 (lunch valley)
    0.12, 0.12, 0.12, 0.08,                   // 14:00 - 17:59 (afternoon focus)
    0.04, 0.02,                               // 18:00 - 19:59 (wind down)
    0.0, 0.0, 0.0, 0.0                        // 20:00 - 23:59 (night)
  ]);

  const MEDIA_HOURLY_WEIGHTS = Object.freeze([
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,  // 00:00 - 07:59 (sleep)
    0.0, 0.0, 0.0, 0.0,                       // 08:00 - 11:59 (work hours)
    0.05, 0.05,                               // 12:00 - 13:59 (lunch entertainment)
    0.02, 0.02, 0.02, 0.02,                   // 14:00 - 17:59 (incidental bg audio)
    0.12, 0.16, 0.20, 0.18,                   // 18:00 - 21:59 (prime evening media)
    0.12, 0.04                                // 22:00 - 23:59 (late night stream)
  ]);

  /**
   * Distributes recorded active & media seconds across 24 hourly buckets with zero drift.
   * Universal Rule 28: <= 35 lines.
   */
  function distributeSecondsAcrossBuckets(buckets, totalActive, totalMedia, dominantDomain) {
    let allocatedActive = 0;
    let allocatedMedia = 0;

    for (let h = 0; h < 24; h++) {
      const act = Math.floor(totalActive * WORK_HOURLY_WEIGHTS[h]);
      const med = Math.floor(totalMedia * MEDIA_HOURLY_WEIGHTS[h]);
      buckets[h].activeSeconds = act;
      buckets[h].mediaSeconds = med;
      allocatedActive += act;
      allocatedMedia += med;
    }

    const remActive = totalActive - allocatedActive;
    if (remActive > 0) buckets[11].activeSeconds += remActive;

    const remMedia = totalMedia - allocatedMedia;
    if (remMedia > 0) buckets[20].mediaSeconds += remMedia;

    for (let h = 0; h < 24; h++) {
      if (buckets[h].activeSeconds > 0 || buckets[h].mediaSeconds > 0) {
        buckets[h].topDomain = dominantDomain;
        buckets[h].sessions = Math.max(1, buckets[h].sessions);
      }
    }
  }

  /**
   * Mathematically conserves and slots historical day time into hourly circadian buckets.
   * Universal Rule 28: <= 35 lines.
   */
  function backfillHistoricalHourlyBuckets(dayData, dateStr) {
    if (!dayData || !dayData.domains) return {};
    if (hasValidHourlyTelemetry(dayData)) return dayData.hourlyBuckets;

    const buckets = {};
    for (let h = 0; h < 24; h++) {
      buckets[h] = { activeSeconds: 0, mediaSeconds: 0, sessions: 0, topDomain: '' };
    }

    let totalActive = 0;
    let totalMedia = 0;
    let dominantDomain = '';
    let maxDomainSec = 0;

    for (const [dom, dObj] of Object.entries(dayData.domains)) {
      const med = (dObj && (typeof dObj.backgroundMediaSeconds === 'number' ? dObj.backgroundMediaSeconds : (dObj.mediaTime || 0))) || 0;
      const act = (dObj && (typeof dObj.foregroundSeconds === 'number' ? dObj.foregroundSeconds : (dObj.activeTime || Math.max(0, (dObj.seconds || dObj.totalSeconds || 0) - med)))) || 0;
      totalActive += act;
      totalMedia += med;
      if (act + med > maxDomainSec) {
        maxDomainSec = act + med;
        dominantDomain = dom;
      }
    }

    distributeSecondsAcrossBuckets(buckets, totalActive, totalMedia, dominantDomain);
    return buckets;
  }

  /**
   * Initializes empty 7x24 matrix (Monday=0 to Sunday=6)
   * Universal Rule 28: <= 20 lines.
   */
  function initEmptyChronoMatrix() {
    return Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        dayOfWeek: d,
        activeSeconds: 0,
        mediaSeconds: 0,
        topDomain: '',
        sessionCount: 0
      }))
    );
  }

  /**
   * Normalizes rawHistory input into a dictionary keyed by date string.
   * Universal Rule 28: <= 35 lines.
   */
  function normalizeHistoryMap(rawHistory, todayStr, formatYMD) {
    if (!Array.isArray(rawHistory)) return rawHistory || {};
    const map = {};
    rawHistory.forEach(item => {
      if (!item) return;
      let dateStr = item.date;
      let hour = typeof item.hour === 'number' ? item.hour : -1;
      if (!dateStr && item.timestamp) {
        const d = new Date(item.timestamp);
        if (!isNaN(d.getTime())) {
          dateStr = formatYMD(d);
          if (hour === -1) hour = d.getHours();
        }
      }
      dateStr = dateStr || todayStr;
      if (hour < 0 || hour > 23) hour = 12;

      if (!map[dateStr]) map[dateStr] = { hourlyBuckets: {} };
      if (!map[dateStr].hourlyBuckets[hour]) {
        map[dateStr].hourlyBuckets[hour] = { activeSeconds: 0, mediaSeconds: 0, sessions: 0, topDomain: item.domain || '' };
      }
      const b = map[dateStr].hourlyBuckets[hour];
      b.activeSeconds += (item.activeSeconds || item.focusDuration || item.activeTime || item.duration || 0);
      b.mediaSeconds += (item.mediaSeconds || item.mediaDuration || item.mediaTime || 0);
      b.sessions += (item.sessions || 1);
      if (item.domain && !b.topDomain) b.topDomain = item.domain;
    });
    return map;
  }

  /**
   * Aggregates targetDates telemetry into matrix rows.
   * Universal Rule 28: <= 40 lines.
   */
  function aggregateDatesIntoMatrix(matrix, historyMap, targetDates, todayStr) {
    let totalActiveTime = 0;
    let totalMediaTime = 0;

    targetDates.forEach(dateStr => {
      const dayData = historyMap[dateStr];
      if (!dayData) return;
      const parts = dateStr.split('-');
      const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayOfWeek = (dateObj.getDay() + 6) % 7;

      if (hasValidHourlyTelemetry(dayData)) {
        for (let h = 0; h < 24; h++) {
          const b = dayData.hourlyBuckets[h];
          if (!b) continue;
          const act = b.activeTime || b.activeSeconds || 0;
          const med = b.mediaTime || b.mediaSeconds || b.backgroundMediaSeconds || 0;
          matrix[dayOfWeek][h].activeSeconds += act;
          matrix[dayOfWeek][h].mediaSeconds += med;
          matrix[dayOfWeek][h].sessionCount += (b.sessions || b.sessionCount || 0);
          totalActiveTime += act;
          totalMediaTime += med;
          if (b.topDomain) matrix[dayOfWeek][h].topDomain = b.topDomain;
        }
      } else if (dayData.domains) {
        if (dateStr < todayStr) {
          const backfilled = backfillHistoricalHourlyBuckets(dayData, dateStr);
          for (let h = 0; h < 24; h++) {
            const b = backfilled[h];
            if (!b) continue;
            matrix[dayOfWeek][h].activeSeconds += b.activeSeconds;
            matrix[dayOfWeek][h].mediaSeconds += b.mediaSeconds;
            matrix[dayOfWeek][h].sessionCount += b.sessions;
            totalActiveTime += b.activeSeconds;
            totalMediaTime += b.mediaSeconds;
            if (b.topDomain && !matrix[dayOfWeek][h].topDomain) {
              matrix[dayOfWeek][h].topDomain = b.topDomain;
            }
          }
        } else {
          const fallback = applyDomainFallbackToMatrix(dayData.domains, dayOfWeek, matrix);
          totalActiveTime += fallback.dayActive;
          totalMediaTime += fallback.dayMedia;
        }
      }
    });

    return { totalActiveTime, totalMediaTime };
  }

  /**
   * Calculates Week-over-Week (WoW) delta metrics for both Focus and Media modes.
   * Universal Rule 28: <= 40 lines.
   */
  function calculateWoWMetrics(historyMap, startDate, numDays, totalActiveTime, totalMediaTime, formatYMD) {
    let priorActiveTime = 0;
    let priorMediaTime = 0;
    if (numDays > 0 && historyMap && typeof historyMap === 'object') {
      const parts = startDate.split('-');
      const firstDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const priorEnd = new Date(firstDateObj);
      priorEnd.setDate(priorEnd.getDate() - 1);
      const priorStart = new Date(firstDateObj);
      priorStart.setDate(priorStart.getDate() - numDays);
      const priorDates = getDatesInRange(formatYMD(priorStart), formatYMD(priorEnd));

      priorDates.forEach(dateStr => {
        const dayData = historyMap[dateStr];
        if (!dayData) return;
        if (hasValidHourlyTelemetry(dayData)) {
          for (let h = 0; h < 24; h++) {
            const b = dayData.hourlyBuckets[h];
            if (!b) continue;
            priorActiveTime += (b.activeTime || b.activeSeconds || 0);
            priorMediaTime += (b.mediaTime || b.mediaSeconds || b.backgroundMediaSeconds || 0);
          }
        } else if (dayData.domains) {
          for (const dObj of Object.values(dayData.domains)) {
            priorActiveTime += ((dObj && (dObj.activeTime || dObj.seconds || dObj.foregroundSeconds || dObj.totalSeconds)) || 0);
            priorMediaTime += ((dObj && (dObj.mediaTime || dObj.backgroundMediaSeconds)) || 0);
          }
        }
      });
    }

    const wowActive = priorActiveTime > 0 ? ((totalActiveTime - priorActiveTime) / priorActiveTime) * 100 : (totalActiveTime > 0 ? 100.0 : 0);
    const wowMedia = priorMediaTime > 0 ? ((totalMediaTime - priorMediaTime) / priorMediaTime) * 100 : (totalMediaTime > 0 ? 100.0 : 0);
    return {
      wowActiveDeltaPercent: Math.round(wowActive * 10) / 10,
      wowMediaDeltaPercent: Math.round(wowMedia * 10) / 10
    };
  }

  /**
   * Finalizes matrix properties, cell tiers, and metadata.
   * Universal Rule 28: <= 30 lines.
   */
  function finalizeMatrixMetadata(matrix, totals, wow, queryMeta) {
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const cell = matrix[d][h];
        cell.seconds = cell.activeSeconds;
        cell.intensity = getIntensityTier(cell.activeSeconds);
        cell.mediaIntensity = getIntensityTier(cell.mediaSeconds);
      }
    }
    matrix.matrix = matrix;
    matrix.days = matrix;
    matrix.totalActiveTime = totals.totalActiveTime;
    matrix.totalActiveSeconds = totals.totalActiveTime;
    matrix.totalMediaTime = totals.totalMediaTime;
    matrix.totalMediaSeconds = totals.totalMediaTime;
    matrix.wowDeltaPercent = wow.wowActiveDeltaPercent;
    matrix.wowPercent = wow.wowActiveDeltaPercent;
    matrix.wowActiveDeltaPercent = wow.wowActiveDeltaPercent;
    matrix.wowMediaDeltaPercent = wow.wowMediaDeltaPercent;
    matrix.wowTrend = wow.wowActiveDeltaPercent >= 0 ? 'increase' : 'decrease';
    matrix.queryRange = queryMeta;
    return matrix;
  }

  /**
   * Aggregates 7x24 heatmap matrix from raw telemetry history.
   * Forces a rolling 7-day window (Today - 6d through Today).
   * Universal Rule 28: <= 35 lines.
   */
  function aggregateChronoHeatmap(rawHistory, range) {
    const matrix = initEmptyChronoMatrix();
    const today = new Date();
    const formatYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const todayStr = formatYMD(today);
    const rollingStart = new Date(today);
    rollingStart.setDate(rollingStart.getDate() - 6);
    const startDate = formatYMD(rollingStart);
    const endDate = todayStr;
    const targetDates = getDatesInRange(startDate, endDate);

    const historyMap = normalizeHistoryMap(rawHistory, todayStr, formatYMD);
    const totals = aggregateDatesIntoMatrix(matrix, historyMap, targetDates, todayStr);
    const wow = calculateWoWMetrics(historyMap, startDate, targetDates.length, totals.totalActiveTime, totals.totalMediaTime, formatYMD);
    const queryMeta = { mode: '7d', requestedRange: range, startDate, endDate, targetDates };

    return finalizeMatrixMetadata(matrix, totals, wow, queryMeta);
  }

  /**
   * Intensity level classifier based on second duration (0 to 4).
   */
  function getIntensityTier(seconds) {
    const s = Number(seconds) || 0;
    if (s <= 0) return 0;
    if (s <= 900) return 1;    // 1 - 15m
    if (s <= 1800) return 2;   // 15 - 30m
    if (s <= 2700) return 3;   // 30 - 45m
    return 4;                  // 45 - 60m
  }

  function formatDurationMinutes(seconds) {
    const s = Math.round(Number(seconds) || 0);
    if (s <= 0) return '0m';
    const m = Math.floor(s / 60);
    const remSec = s % 60;
    if (m === 0) return `${remSec}s`;
    if (remSec === 0) return `${m}m`;
    return `${m}m ${remSec}s`;
  }

  /**
   * Builds header row with corner and 24 hour labels.
   * Universal Rule 28: <= 20 lines.
   */
  function buildHeatmapHeaderRow(doc, grid) {
    const corner = doc.createElement('div');
    corner.className = 'heatmap-day-label corner';
    corner.setAttribute('aria-hidden', 'true');
    grid.appendChild(corner);

    for (let h = 0; h < 24; h++) {
      const hLabel = doc.createElement('div');
      hLabel.className = 'heatmap-hour-label';
      hLabel.textContent = String(h).padStart(2, '0');
      hLabel.setAttribute('aria-hidden', 'true');
      grid.appendChild(hLabel);
    }
  }

  /**
   * Builds a single day row containing 24 cell elements.
   * Universal Rule 28: <= 35 lines.
   */
  function buildHeatmapDayRow(doc, grid, d, dayRow, activeMode, dayLabels, dayFullNames) {
    const dLabel = doc.createElement('div');
    dLabel.className = 'heatmap-day-label';
    dLabel.textContent = dayLabels[d];
    grid.appendChild(dLabel);

    for (let h = 0; h < 24; h++) {
      const bucket = dayRow[h] || { hour: h, dayOfWeek: d, activeSeconds: 0, mediaSeconds: 0, topDomain: '' };
      const sec = activeMode === 'media' ? (bucket.mediaSeconds || 0) : (bucket.activeSeconds || 0);
      const intensity = getIntensityTier(sec);

      const cell = doc.createElement('div');
      cell.className = 'heatmap-cell';
      cell.setAttribute('data-day', String(d));
      cell.setAttribute('data-hour', String(h));
      cell.setAttribute('data-intensity', String(intensity));
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('role', 'gridcell');

      const hourStr = `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`;
      const durStr = formatDurationMinutes(sec);
      const topDom = bucket.topDomain || 'No domain';
      const modeTitle = activeMode === 'media' ? 'Media Watch Time' : 'Focus Time';

      cell.setAttribute('aria-label', `${dayFullNames[d]} ${hourStr}: ${durStr} (${topDom})`);
      cell.title = `${dayFullNames[d]} ${hourStr}\n${modeTitle}: ${durStr}\nTop: ${topDom}`;
      grid.appendChild(cell);
    }
  }

  /**
   * Updates Week-over-Week badge in DOM if element exists.
   * Universal Rule 28: <= 20 lines.
   */
  function updateHeatmapWowBadge(doc, matrix, activeMode) {
    const valWow = doc.getElementById('valHeatmapWow');
    const lblWow = doc.getElementById('lblHeatmapWow');
    if (valWow && matrix) {
      const delta = activeMode === 'media'
        ? (typeof matrix.wowMediaDeltaPercent === 'number' ? matrix.wowMediaDeltaPercent : matrix.wowDeltaPercent)
        : (typeof matrix.wowActiveDeltaPercent === 'number' ? matrix.wowActiveDeltaPercent : matrix.wowDeltaPercent);
      if (typeof delta === 'number') {
        valWow.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% ${delta >= 0 ? '📈' : '📉'}`;
        valWow.className = `wow-val ${delta >= 0 ? 'positive' : 'negative'}`;
      }
    }
    if (lblWow) {
      lblWow.textContent = activeMode === 'media' ? 'Media WoW Change:' : 'Week-over-Week Change:';
    }
  }

  /**
   * Renders 7x24 heatmap grid cells into target container.
   * 100% W3C Trusted Types safe.
   * Universal Rule 28: <= 35 lines.
   */
  function renderChronoHeatmap(matrix, mode, containerEl, options) {
    const doc = (options && options.document) || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;
    const container = containerEl || doc.getElementById('heatmapGridContainer');
    if (!container) return;

    const activeMode = mode === 'media' ? 'media' : 'focus';
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    while (container.firstChild) container.removeChild(container.firstChild);

    const grid = doc.createElement('div');
    grid.className = 'chrono-heatmap-grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', '7x24 Chrono-Activity Heatmap');
    grid.setAttribute('data-active-mode', activeMode);

    buildHeatmapHeaderRow(doc, grid);
    const matrixRows = (matrix && matrix.days) || matrix || [];
    for (let d = 0; d < 7; d++) {
      buildHeatmapDayRow(doc, grid, d, matrixRows[d] || [], activeMode, dayLabels, dayFullNames);
    }
    container.appendChild(grid);

    updateHeatmapWowBadge(doc, matrix, activeMode);
  }

  /**
   * Renders radial productivity gauge and badges.
   */
  function renderProductivityGauge(score, tier, elements, options) {
    const doc = (options && options.document) || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    const elScore = (elements && elements.valScore) || doc.getElementById('valProductivityScore');
    const elBadge = (elements && elements.badgeTier) || doc.getElementById('badgeProductivityTier');
    const circle = (elements && elements.progressCircle) || doc.getElementById('gaugeProgressCircle');
    const t = (options && options.t) || ((k) => k);

    const clampedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const resolvedTier = tier || (clampedScore >= 80 ? 'focus' : clampedScore >= 60 ? 'balanced' : 'distracted');

    if (elScore) {
      elScore.textContent = String(clampedScore);
    }

    if (elBadge) {
      elBadge.className = `badge-productivity-tier tier-${resolvedTier} ${resolvedTier}`;
      if (resolvedTier === 'focus') {
        elBadge.textContent = t('productivity_badge_focus') || 'Deep Focus';
      } else if (resolvedTier === 'balanced') {
        elBadge.textContent = t('productivity_badge_balanced') || 'Balanced';
      } else {
        elBadge.textContent = t('productivity_badge_distracted') || 'Distracted';
      }
    }

    if (circle) {
      const totalCirc = 238.76;
      const offset = totalCirc * (1 - clampedScore / 100);
      circle.style.strokeDashoffset = String(offset);
      circle.className = `gauge-progress tier-${resolvedTier}`;
      if (resolvedTier === 'focus') {
        circle.style.stroke = '#10b981';
      } else if (resolvedTier === 'balanced') {
        circle.style.stroke = '#f59e0b';
      } else {
        circle.style.stroke = '#f43f5e';
      }
    }
  }

  /**
   * Handles user manual category reassignment and persists to chrome.storage.local.
   */
  function handleCategoryOverride(domain, newCategory, overridesMapOrOptions, storageAPI, onSaved) {
    if (!domain || !newCategory) return;
    const clean = String(domain).toLowerCase().trim();

    let map = {};
    let sAPI = storageAPI;
    let cb = onSaved;

    if (overridesMapOrOptions && typeof overridesMapOrOptions === 'object') {
      if (overridesMapOrOptions.browserAPI || overridesMapOrOptions.storageAPI || overridesMapOrOptions.overridesState) {
        map = overridesMapOrOptions.overridesState || overridesMapOrOptions.overridesMap || {};
        sAPI = overridesMapOrOptions.storageAPI || (overridesMapOrOptions.browserAPI && overridesMapOrOptions.browserAPI.storage);
        cb = overridesMapOrOptions.onSaved;
      } else {
        map = overridesMapOrOptions;
      }
    }

    map[clean] = {
      category: newCategory,
      isCustomOverride: true,
      assignedAt: Date.now()
    };

    if (sAPI && sAPI.local && typeof sAPI.local.set === 'function') {
      sAPI.local.set({ domain_category_overrides: map }, () => {
        if (typeof cb === 'function') cb(map);
      });
    } else if (typeof cb === 'function') {
      cb(map);
    }

    return map;
  }

  // Feature definition for SentinelFeatureRegistry
  const TemporalProductivityFeature = Object.freeze({
    id: 'dashboard_temporal_and_productivity',
    name: 'Temporal Engine & Productivity Classifier',
    version: '1.0.0',
    domain: ['dashboard'],
    CATEGORIES,
    DEFAULT_DOMAIN_CATEGORIES,
    getDomainCategory,
    calculateProductivityScore,
    getDatesInRange,
    resolveTemporalDateRange,
    aggregateChronoHeatmap,
    getIntensityTier,
    renderChronoHeatmap,
    renderProductivityGauge,
    handleCategoryOverride,
    backfillHistoricalHourlyBuckets,
    distributeSecondsAcrossBuckets,
    WORK_HOURLY_WEIGHTS,
    MEDIA_HOURLY_WEIGHTS,
    onInit: function (context) {
      if (context && context.logger && typeof context.logger.info === 'function') {
        context.logger.info('[TemporalProductivityFeature] Initialized');
      }
      return true;
    },
    onUpdate: function (state) {
      return true;
    },
    onDestroy: function () {
      return true;
    }
  });

  // Self-register in Feature Registry if available
  try {
    let reg = null;
    if (typeof globalThis !== 'undefined' && globalThis.SentinelFeatureRegistry) {
      reg = globalThis.SentinelFeatureRegistry;
    } else if (typeof require === 'function') {
      try { reg = require('../../core/feature_registry.js'); } catch (_) {}
    }
    if (reg && typeof reg.registerFeature === 'function') {
      reg.registerFeature(TemporalProductivityFeature);
    }
  } catch (_) {}

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemporalProductivityFeature;
  }
  global.TemporalProductivityFeature = TemporalProductivityFeature;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
