/**
 * Web Activity & Media Sentinel - Media Analytics KPI Aggregator Feature
 * Pure domain aggregator for 10-card Media Analytics KPI Bento Grid (Tab B).
 * 
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Cleans and formats platform or domain name for display.
   * @param {string} raw
   * @returns {string}
   */
  function cleanPlatformName(raw) {
    if (!raw || typeof raw !== 'string') return '-';
    let str = raw.replace(/^www\./i, '').trim();
    if (str.toLowerCase().includes('youtube')) return 'YouTube';
    if (str.toLowerCase().includes('netflix')) return 'Netflix';
    if (str.toLowerCase().includes('twitch')) return 'Twitch';
    if (str.toLowerCase().includes('spotify')) return 'Spotify';
    if (str.toLowerCase().includes('primevideo') || str.toLowerCase().includes('amazon')) return 'Prime Video';
    if (str.toLowerCase().includes('soundcloud')) return 'SoundCloud';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Determines top media platform by aggregated watch seconds.
   * @param {Array<Object>} history
   * @returns {string}
   */
  function computeTopMediaPlatform(history) {
    if (!Array.isArray(history) || history.length === 0) return '-';
    const domainTotals = {};
    history.forEach(item => {
      if (!item) return;
      let name = item.domain || item.platform;
      if (!name && item.url) {
        try { name = new URL(item.url).hostname; } catch (_) { name = 'Media'; }
      }
      name = cleanPlatformName(name || 'Media');
      const dur = item.watchDuration || item.watchTimeSec || item.duration || 1;
      domainTotals[name] = (domainTotals[name] || 0) + dur;
    });
    let maxSec = 0, topPlat = '-';
    Object.keys(domainTotals).forEach(dom => {
      if (domainTotals[dom] > maxSec) { maxSec = domainTotals[dom]; topPlat = dom; }
    });
    return topPlat;
  }

  /**
   * Counts active live stream sessions.
   * @param {Array<Object>} activeStreams
   * @returns {number}
   */
  function computeActiveLiveStreamsCount(activeStreams) {
    if (!Array.isArray(activeStreams)) return 0;
    return activeStreams.filter(s => s && (s.isLive === true || s.duration === Infinity || s.isLiveStream)).length;
  }

  /**
   * Counts playback sessions that were muted.
   * @param {Array<Object>} history
   * @returns {number}
   */
  function computeMutedSessionsCount(history) {
    if (!Array.isArray(history)) return 0;
    return history.filter(s => s && (s.isMuted === true || s.volume === 0 || s.muted === true)).length;
  }

  /**
   * Finds longest single media session duration in seconds.
   * @param {Array<Object>} history
   * @returns {number}
   */
  function computeLongestMediaSession(history) {
    if (!Array.isArray(history) || history.length === 0) return 0;
    return history.reduce((max, s) => {
      const dur = s.watchDuration || s.watchTimeSec || s.duration || 0;
      return Math.max(max, dur);
    }, 0);
  }

  /**
   * Aggregates playback volume telemetry.
   * @param {Array<Object>} history
   * @returns {{ avgVolume: number, peakVolume: number, lowVolume: number }}
   */
  function computeVolumeMetrics(history) {
    if (!Array.isArray(history) || history.length === 0) {
      return { avgVolume: 0, peakVolume: 0, lowVolume: 0 };
    }
    let totalVol = 0, peakVol = 0, lowVol = 100;
    history.forEach(item => {
      const v = item.averageVolume !== undefined ? item.averageVolume : 100;
      totalVol += v;
      if (item.peakVolume !== undefined && item.peakVolume > peakVol) peakVol = item.peakVolume;
      if (item.lowVolume !== undefined && item.lowVolume < lowVol) lowVol = item.lowVolume;
    });
    const avgVolume = Math.round(totalVol / history.length);
    return { avgVolume, peakVolume: peakVol, lowVolume: lowVol === 100 ? 0 : lowVol };
  }

  /**
   * Aggregates all 10 Media Analytics KPIs into a structured payload.
   * @param {Object} params
   * @returns {Object}
   */
  function aggregateMediaAnalyticsKpis(params) {
    const { history = [], activeStreams = [], pm = null } = params || {};
    const sessionsCount = Array.isArray(history) ? history.length : 0;
    let totalWatchSec = 0;
    if (Array.isArray(history)) {
      totalWatchSec = history.reduce((acc, item) => acc + (item.watchDuration || item.watchTimeSec || item.duration || 0), 0);
    }
    const avgWatchSec = sessionsCount > 0 ? Math.round(totalWatchSec / sessionsCount) : 0;
    const volMetrics = computeVolumeMetrics(history);

    return {
      totalWatchSec,
      avgWatchSec,
      sessionsCount,
      topPlatform: computeTopMediaPlatform(history),
      activeStreamsCount: computeActiveLiveStreamsCount(activeStreams),
      avgVolume: volMetrics.avgVolume,
      peakVolume: volMetrics.peakVolume,
      lowVolume: volMetrics.lowVolume,
      mutedSessionsCount: computeMutedSessionsCount(history),
      longestMediaSec: computeLongestMediaSession(history)
    };
  }

  const MediaAnalyticsKpiFeature = Object.freeze({
    id: 'media_analytics_kpi_feature',
    name: 'Media Analytics KPI Feature',
    version: '1.0.0',
    cleanPlatformName,
    computeTopMediaPlatform,
    computeActiveLiveStreamsCount,
    computeMutedSessionsCount,
    computeLongestMediaSession,
    computeVolumeMetrics,
    aggregateMediaAnalyticsKpis,
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
      reg.registerFeature(MediaAnalyticsKpiFeature);
    }
  } catch (_) {}

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaAnalyticsKpiFeature;
  }
  global.MediaAnalyticsKpiFeature = MediaAnalyticsKpiFeature;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
