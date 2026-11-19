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
   * Aggregates 7x24 heatmap matrix from raw telemetry history.
   * 
   * @param {Object} rawHistory - Stored history map keyed by YYYY-MM-DD
   * @param {Object|string} range - Selected temporal range ('today'|'yesterday'|'7d'|'30d'|'custom')
   * @returns {Array<Array<Object>>} 7 rows (Monday=0 to Sunday=6) x 24 columns (hours 0 to 23)
   */
  function aggregateChronoHeatmap(rawHistory, range) {
    // 7 rows (days 0..6: Mon..Sun) x 24 columns (hours 0..23)
    const matrix = Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        dayOfWeek: d,
        activeSeconds: 0,
        mediaSeconds: 0,
        topDomain: '',
        sessionCount: 0
      }))
    );

    let queryMode = '7d';
    let startDate = '';
    let endDate = '';

    if (typeof range === 'string') {
      queryMode = range;
    } else if (range && typeof range === 'object') {
      queryMode = range.mode || '7d';
      startDate = range.startDate || '';
      endDate = range.endDate || '';
    }

    const today = new Date();
    const formatYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const todayStr = formatYMD(today);

    if (queryMode === 'today') {
      startDate = todayStr;
      endDate = todayStr;
    } else if (queryMode === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      startDate = formatYMD(y);
      endDate = formatYMD(y);
    } else if (queryMode === '7d') {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      startDate = formatYMD(s);
      endDate = todayStr;
    } else if (queryMode === '30d') {
      const s = new Date(today);
      s.setDate(s.getDate() - 29);
      startDate = formatYMD(s);
      endDate = todayStr;
    } else if (queryMode === 'custom') {
      if (!startDate) startDate = todayStr;
      if (!endDate) endDate = todayStr;
    } else {
      // Default to 7d
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      startDate = formatYMD(s);
      endDate = todayStr;
    }

    const targetDates = getDatesInRange(startDate, endDate);
    let totalActiveTime = 0;
    let totalMediaTime = 0;

    let historyMap = rawHistory;
    if (Array.isArray(rawHistory)) {
      historyMap = {};
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
        if (!dateStr) dateStr = todayStr;
        if (hour < 0 || hour > 23) hour = 12;

        if (!historyMap[dateStr]) {
          historyMap[dateStr] = { hourlyBuckets: {} };
        }
        if (!historyMap[dateStr].hourlyBuckets[hour]) {
          historyMap[dateStr].hourlyBuckets[hour] = {
            activeSeconds: 0,
            mediaSeconds: 0,
            sessions: 0,
            topDomain: item.domain || ''
          };
        }
        const act = item.activeSeconds || item.focusDuration || item.activeTime || item.duration || 0;
        const med = item.mediaSeconds || item.mediaDuration || item.mediaTime || 0;
        historyMap[dateStr].hourlyBuckets[hour].activeSeconds += act;
        historyMap[dateStr].hourlyBuckets[hour].mediaSeconds += med;
        historyMap[dateStr].hourlyBuckets[hour].sessions += (item.sessions || 1);
        if (item.domain && !historyMap[dateStr].hourlyBuckets[hour].topDomain) {
          historyMap[dateStr].hourlyBuckets[hour].topDomain = item.domain;
        }
      });
    }

    if (historyMap && typeof historyMap === 'object') {
      targetDates.forEach((dateStr) => {
        const dayData = historyMap[dateStr];
        if (!dayData) return;

        const parts = dateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        // Monday = 0, Tuesday = 1 ... Sunday = 6
        const dayOfWeek = (dateObj.getDay() + 6) % 7;

        if (dayData.hourlyBuckets) {
          for (let h = 0; h < 24; h++) {
            const bucket = dayData.hourlyBuckets[h];
            if (bucket) {
              const act = bucket.activeTime || bucket.activeSeconds || 0;
              const med = bucket.mediaTime || bucket.mediaSeconds || 0;
              const sess = bucket.sessions || bucket.sessionCount || 0;

              matrix[dayOfWeek][h].activeSeconds += act;
              matrix[dayOfWeek][h].mediaSeconds += med;
              matrix[dayOfWeek][h].sessionCount += sess;
              totalActiveTime += act;
              totalMediaTime += med;

              if (bucket.topDomain) {
                matrix[dayOfWeek][h].topDomain = bucket.topDomain;
              }
            }
          }
        } else if (dayData.domains) {
          // Fallback if daily telemetry exists without hourly breakdown
          let dayActive = 0;
          let dayMedia = 0;
          let dayTopDomain = '';
          let maxSec = 0;
          for (const [dom, dObj] of Object.entries(dayData.domains)) {
            const s = (dObj && (dObj.activeTime || dObj.seconds || dObj.totalSeconds)) || 0;
            const m = (dObj && (dObj.mediaTime || dObj.backgroundMediaSeconds)) || 0;
            dayActive += s;
            dayMedia += m;
            if (s > maxSec) {
              maxSec = s;
              dayTopDomain = dom;
            }
          }
          totalActiveTime += dayActive;
          totalMediaTime += dayMedia;
          if (dayActive > 0) {
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
        }
      });
    }

    // Week-over-Week (WoW) Delta Calculation
    const numDays = targetDates.length;
    let priorActiveTime = 0;
    if (numDays > 0 && historyMap && typeof historyMap === 'object') {
      const parts = startDate.split('-');
      const firstDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const priorEnd = new Date(firstDateObj);
      priorEnd.setDate(priorEnd.getDate() - 1);
      const priorStart = new Date(firstDateObj);
      priorStart.setDate(priorStart.getDate() - numDays);
      const priorDates = getDatesInRange(formatYMD(priorStart), formatYMD(priorEnd));

      priorDates.forEach((dateStr) => {
        const dayData = historyMap[dateStr];
        if (!dayData) return;
        if (dayData.hourlyBuckets) {
          for (let h = 0; h < 24; h++) {
            const b = dayData.hourlyBuckets[h];
            if (b) priorActiveTime += (b.activeTime || b.activeSeconds || 0);
          }
        } else if (dayData.domains) {
          for (const dObj of Object.values(dayData.domains)) {
            priorActiveTime += ((dObj && (dObj.activeTime || dObj.seconds || dObj.totalSeconds)) || 0);
          }
        }
      });
    }

    let wowDeltaPercent = 0;
    if (priorActiveTime > 0) {
      wowDeltaPercent = ((totalActiveTime - priorActiveTime) / priorActiveTime) * 100;
    } else if (totalActiveTime > 0) {
      wowDeltaPercent = 100.0;
    }

    // Assign cells seconds and intensity
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
    matrix.totalActiveTime = totalActiveTime;
    matrix.totalActiveSeconds = totalActiveTime;
    matrix.totalMediaTime = totalMediaTime;
    matrix.totalMediaSeconds = totalMediaTime;
    matrix.wowDeltaPercent = Math.round(wowDeltaPercent * 10) / 10;
    matrix.wowPercent = matrix.wowDeltaPercent;
    matrix.wowTrend = wowDeltaPercent > 0 ? 'increase' : (wowDeltaPercent < 0 ? 'decrease' : 'neutral');
    matrix.queryRange = { mode: queryMode, startDate, endDate, targetDates };

    return matrix;
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
   * Renders 7x24 heatmap grid cells into target container.
   * 100% W3C Trusted Types safe.
   */
  function renderChronoHeatmap(matrix, mode, containerEl, options) {
    const doc = (options && options.document) || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    const container = containerEl || doc.getElementById('heatmapGridContainer');
    if (!container) return;

    const activeMode = mode === 'media' ? 'media' : 'focus';
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Safe DOM reset
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const grid = doc.createElement('div');
    grid.className = 'chrono-heatmap-grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', '7x24 Chrono-Activity Heatmap');

    // 1. Header Row (Empty corner + 24 hour labels)
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

    // 2. Day Rows
    const matrixRows = (matrix && matrix.days) || matrix || [];

    for (let d = 0; d < 7; d++) {
      const dLabel = doc.createElement('div');
      dLabel.className = 'heatmap-day-label';
      dLabel.textContent = dayLabels[d];
      grid.appendChild(dLabel);

      const dayRow = matrixRows[d] || [];
      for (let h = 0; h < 24; h++) {
        const bucket = dayRow[h] || { hour: h, dayOfWeek: d, activeSeconds: 0, mediaSeconds: 0, topDomain: '', sessionCount: 0 };
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

        cell.setAttribute('aria-label', `${dayFullNames[d]} ${hourStr}: ${durStr} (${topDom})`);
        cell.title = `${dayFullNames[d]} ${hourStr}\n${activeMode === 'media' ? 'Media' : 'Focus'}: ${durStr}\nTop: ${topDom}`;

        grid.appendChild(cell);
      }
    }

    container.appendChild(grid);

    // Update WoW metric badge if present in DOM
    const valWow = doc.getElementById('valHeatmapWow');
    if (valWow && matrix && typeof matrix.wowDeltaPercent === 'number') {
      const delta = matrix.wowDeltaPercent;
      valWow.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% ${delta >= 0 ? '📈' : '📉'}`;
      valWow.className = `wow-val ${delta >= 0 ? 'positive' : 'negative'}`;
    }
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
