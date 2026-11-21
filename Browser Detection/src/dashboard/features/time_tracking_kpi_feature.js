/**
 * Web Activity & Media Sentinel - Time Tracking KPI Aggregator Feature
 * Pure domain aggregator for 10-card Time Tracking KPI Bento Grid (Tab A).
 * 
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const LEISURE_KEYWORDS = Object.freeze([
    'youtube.com', 'netflix.com', 'twitch.tv', 'reddit.com',
    'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
    'tiktok.com', 'discord.com', 'spotify.com', 'primevideo.com',
    'hulu.com', 'disneyplus.com', 'pinterest.com', 'roblox.com'
  ]);

  const BRAND_DICT = Object.freeze({
    'mail.google.com': 'Gmail',
    'gmail.com': 'Gmail',
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'google.com': 'Google',
    'github.com': 'GitHub',
    'linkedin.com': 'LinkedIn',
    'chatgpt.com': 'ChatGPT',
    'openai.com': 'ChatGPT',
    'netflix.com': 'Netflix',
    'spotify.com': 'Spotify',
    'reddit.com': 'Reddit',
    'twitter.com': 'X (Twitter)',
    'x.com': 'X (Twitter)',
    'facebook.com': 'Facebook',
    'fb.com': 'Facebook',
    'instagram.com': 'Instagram',
    'twitch.tv': 'Twitch',
    'discord.com': 'Discord',
    'discord.gg': 'Discord',
    'stackoverflow.com': 'Stack Overflow',
    'amazon.com': 'Amazon',
    'amazon.in': 'Amazon',
    'wikipedia.org': 'Wikipedia',
    'notion.so': 'Notion',
    'figma.com': 'Figma',
    'slack.com': 'Slack'
  });

  /**
   * Formats a raw URL or domain into a clean brand name.
   * Compliant with Universal Rule 28 (<= 45 lines, nesting depth <= 3).
   * @param {string} raw
   * @returns {string}
   */
  function formatCleanWebsiteName(raw) {
    if (!raw || typeof raw !== 'string') return '-';
    let host = raw.trim().toLowerCase();
    if (!host) return '-';
    if (host.startsWith('chrome://')) return 'Chrome';
    if (host.startsWith('edge://')) return 'Edge';
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return 'Localhost';

    host = host.replace(/^[a-zA-Z]+:\/\//, '').split(/[/?#]/)[0];
    host = host.replace(/.*@/, '').replace(/:\d+$/, '').replace(/^(?:www|m|web)\./i, '');
    if (!host) return '-';
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host === '[::1]' || host === '::1') return host;

    if (BRAND_DICT[host]) return BRAND_DICT[host];
    for (const key of Object.keys(BRAND_DICT)) {
      if (host.endsWith('.' + key)) return BRAND_DICT[key];
    }

    let slug = host.replace(/\.(?:co|com|org|net|gov|edu|ac)\.[a-z]{2}$/i, '');
    slug = slug.replace(/\.[a-z]{2,12}$/i, '');
    const parts = slug.split('.');
    const brand = parts[parts.length - 1] || host;

    return brand
      .split(/[-_]+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || '-';
  }

  /**
   * Computes active domain count for the active temporal range.
   * @param {Array<Object>} items - Array of domain stats items.
   * @returns {number}
   */
  function computeActiveDomainsCount(items) {
    if (!Array.isArray(items)) return 0;
    return items.filter(item => item && (item.computedSeconds > 0 || item.activeSeconds > 0)).length;
  }

  /**
   * Computes distraction/leisure time in seconds and percentage.
   * @param {Array<Object>} items
   * @param {number} totalSeconds
   * @returns {{ seconds: number, percent: number }}
   */
  function computeDistractionStats(items, totalSeconds) {
    if (!Array.isArray(items) || !totalSeconds || totalSeconds <= 0) {
      return { seconds: 0, percent: 0 };
    }
    const distractionSec = items.reduce((acc, item) => {
      if (!item || !item.domain) return acc;
      const dom = String(item.domain).toLowerCase();
      const isLeisure = LEISURE_KEYWORDS.some(k => dom.includes(k)) ||
                        item.category === 'leisure' ||
                        item.category === 'entertainment' ||
                        item.category === 'social';
      const sec = item.computedSeconds || item.activeSeconds || 0;
      return isLeisure ? acc + sec : acc;
    }, 0);
    const percent = Math.min(100, Math.round((distractionSec / totalSeconds) * 100));
    return { seconds: distractionSec, percent };
  }

  /**
   * Helper: accumulates hourly buckets into 24-slot bins array.
   */
  function accumulateHourlyBuckets(bins, buckets) {
    if (!buckets || typeof buckets !== 'object') return;
    for (const [h, b] of Object.entries(buckets)) {
      const idx = parseInt(h, 10);
      if (idx >= 0 && idx < 24) {
        const sec = typeof b === 'number' ? b : (b.activeSeconds || b.activeTime || 0);
        bins[idx] += sec;
      }
    }
  }

  /**
   * Helper: accumulates per-domain hourly buckets for todayStr or all days.
   */
  function accumulateDomainBuckets(bins, domains, todayStr) {
    if (!domains || typeof domains !== 'object') return;
    for (const dObj of Object.values(domains)) {
      if (!dObj || !dObj.days) continue;
      if (todayStr && dObj.days[todayStr]) {
        if (dObj.days[todayStr].hourlyBuckets) {
          accumulateHourlyBuckets(bins, dObj.days[todayStr].hourlyBuckets);
        }
      } else if (!todayStr) {
        for (const day of Object.values(dObj.days)) {
          if (day && day.hourlyBuckets) accumulateHourlyBuckets(bins, day.hourlyBuckets);
        }
      }
    }
  }

  /**
   * Computes peak activity hour from activityData, hourlyBuckets, or stats.
   * Universal Rule 28: <= 40 lines, nesting depth <= 3.
   * @param {Object} data
   * @param {string} todayStr
   * @param {Object} stats
   * @returns {string} e.g. '14:00 - 15:00' or '--:--'
   */
  function computePeakActivityHour(data, todayStr, stats) {
    if (!data && !stats) return '--:--';
    const hourlyBins = new Array(24).fill(0);
    const d = data || {};

    if (d.hourlyBuckets) {
      const target = (todayStr && d.hourlyBuckets[todayStr]) ? d.hourlyBuckets[todayStr] : d.hourlyBuckets;
      accumulateHourlyBuckets(hourlyBins, target);
    } else if (d.activityData && d.activityData.domains) {
      accumulateDomainBuckets(hourlyBins, d.activityData.domains, todayStr);
    } else if (d.domains) {
      accumulateDomainBuckets(hourlyBins, d.domains, todayStr);
    } else if (stats && stats.hourlyBuckets) {
      const target = (todayStr && stats.hourlyBuckets[todayStr]) ? stats.hourlyBuckets[todayStr] : stats.hourlyBuckets;
      accumulateHourlyBuckets(hourlyBins, target);
    } else if (d.hourlyBreakdown && todayStr && d.hourlyBreakdown[todayStr]) {
      accumulateHourlyBuckets(hourlyBins, d.hourlyBreakdown[todayStr]);
    } else if (Array.isArray(d.hourlyActivity)) {
      d.hourlyActivity.forEach((sec, idx) => { if (idx < 24) hourlyBins[idx] += (sec || 0); });
    }

    let maxSec = 0, peakHour = -1;
    hourlyBins.forEach((sec, h) => {
      if (sec > maxSec) { maxSec = sec; peakHour = h; }
    });
    if (peakHour === -1 || maxSec === 0) return '--:--';

    const start = String(peakHour).padStart(2, '0') + ':00';
    const end = String((peakHour + 1) % 24).padStart(2, '0') + ':00';
    return `${start} - ${end}`;
  }

  /**
   * Computes longest continuous session in seconds.
   * @param {Object} data
   * @param {Array<Object>} items
   * @returns {number}
   */
  function computeLongestContinuousSession(data, items) {
    if (data && Array.isArray(data.sessions) && data.sessions.length > 0) {
      return data.sessions.reduce((max, s) => Math.max(max, s.durationSec || s.duration || 0), 0);
    }
    if (Array.isArray(items) && items.length > 0) {
      return items.reduce((max, item) => Math.max(max, item.computedSeconds || item.activeSeconds || 0), 0);
    }
    return 0;
  }

  /**
   * Aggregates all 10 Time Tracking KPIs into a structured payload.
   * @param {Object} params
   * @returns {Object}
   */
  function aggregateTimeTrackingKpis(params) {
    const { data = {}, stats = {}, todayStr = '' } = params || {};
    const items = Array.isArray(stats.items) ? stats.items : [];
    const totalSec = stats.todaySec || stats.activeTemporalSum || 0;

    let topDomain = null;
    if (stats.topDomain) {
      topDomain = Object.assign({}, stats.topDomain, {
        cleanName: formatCleanWebsiteName(stats.topDomain.domain)
      });
    }

    return {
      todaySec: stats.todaySec || 0,
      dailyAvgSec: stats.dailyAvgSec || 0,
      totalSec: stats.totalSec || 0,
      historyDays: stats.historyDays || 1,
      firstTrackedDate: stats.firstTrackedDate || todayStr || 'today',
      topDomain: topDomain,
      focusTimeSec: (data && data.focusTimeSec) ? data.focusTimeSec : 0,
      focusSessionsCount: (data && data.focusSessionsCount) ? data.focusSessionsCount : 0,
      activeDomainsCount: computeActiveDomainsCount(items),
      distraction: computeDistractionStats(items, totalSec),
      peakHourStr: computePeakActivityHour(data, todayStr, stats),
      longestSessionSec: computeLongestContinuousSession(data, items)
    };
  }

  const TimeTrackingKpiFeature = Object.freeze({
    id: 'time_tracking_kpi_feature',
    name: 'Time Tracking KPI Feature',
    version: '1.0.0',
    formatCleanWebsiteName,
    computeActiveDomainsCount,
    computeDistractionStats,
    computePeakActivityHour,
    computeLongestContinuousSession,
    aggregateTimeTrackingKpis,
    init: function () { return true; },
    onUpdate: function () { return true; },
    onDestroy: function () { return true; }
  });

  // Self-register in Feature Registry if present
  try {
    let reg = null;
    if (typeof globalThis !== 'undefined' && globalThis.SentinelFeatureRegistry) {
      reg = globalThis.SentinelFeatureRegistry;
    } else if (typeof require === 'function') {
      try { reg = require('../../core/feature_registry.js'); } catch (_) {}
    }
    if (reg && typeof reg.registerFeature === 'function') {
      reg.registerFeature(TimeTrackingKpiFeature);
    }
  } catch (_) {}

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeTrackingKpiFeature;
  }
  global.TimeTrackingKpiFeature = TimeTrackingKpiFeature;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
