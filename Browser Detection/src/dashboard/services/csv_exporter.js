/**
 * Web Activity & Media Sentinel - Dashboard CSV & Data Export Service
 * RFC 4180 quote escaping, UTF-8 BOM headers, and OWASP DDE formula injection defense.
 * 100% W3C Trusted Types compliant (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * RFC 4180 compliant CSV cell escaper with OWASP CSV/DDE formula injection defense.
   * Handles null, undefined, special characters, newlines, commas, and double quotes.
   * Mitigates DDE/CSV formula injection by prepending a single quote when string begins with [=+\-@\t\r].
   *
   * @param {*} val
   * @returns {string}
   */
  function escapeCsvCell(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    // 1. CSV Formula Injection Defense (OWASP: DDE mitigation)
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    // 2. RFC 4180 quote escaping
    return '"' + str.replace(/"/g, '""') + '"';
  }

  function downloadBlob(content, filename, mimeType, options = {}) {
    const doc = options.document || (typeof document !== 'undefined' ? document : null);
    const BlobClass = options.Blob || (typeof Blob !== 'undefined' ? Blob : null);
    const URLObj = options.URL || (typeof URL !== 'undefined' ? URL : null);

    if (!doc || !BlobClass || !URLObj) return null;

    const blob = new BlobClass([content], { type: mimeType });
    const url = URLObj.createObjectURL(blob);
    const a = doc.createElement('a');
    a.href = url;
    a.download = filename;
    if (typeof a.click === 'function') {
      a.click();
    }
    if (typeof URLObj.revokeObjectURL === 'function') {
      URLObj.revokeObjectURL(url);
    }
    return blob;
  }

  function exportTimeTrackingCsv(customData, options = {}) {
    const data = (customData && customData.activityData) ? customData : (options.dashboardData || null);
    if (!data || !data.activityData) return null;

    const actData = data.activityData;
    const domains = actData.domains || {};
    const todayStr = data.todayStr || new Date().toISOString().split('T')[0];
    const formatDuration = typeof options.formatDuration === 'function' ? options.formatDuration : (s) => `${s}s`;
    const formatTimestamp = typeof options.formatTimestamp === 'function' ? options.formatTimestamp : (ts) => String(ts);
    const showToast = typeof options.showToast === 'function' ? options.showToast : () => {};
    const t = typeof options.t === 'function' ? options.t : (k) => k;

    const headers = [
      'Domain',
      'Today Seconds',
      'Today Formatted',
      'Total Seconds',
      'Total Formatted',
      'Sessions Count',
      'Last Active'
    ].map(escapeCsvCell);

    const rows = [headers.join(',')];

    for (const [dom, obj] of Object.entries(domains)) {
      const todaySec = (obj.days && obj.days[todayStr]) ? (Number(obj.days[todayStr].seconds) || 0) : 0;
      const totalSec = Number(obj.totalSeconds) || 0;
      const sessionCount = Number(obj.sessionCount) || 1;
      const row = [
        escapeCsvCell(dom),
        todaySec,
        escapeCsvCell(formatDuration(todaySec)),
        totalSec,
        escapeCsvCell(formatDuration(totalSec)),
        sessionCount,
        escapeCsvCell(formatTimestamp(obj.lastActive))
      ];
      rows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const filename = `media_sentinel_time_tracking_${todayStr}.csv`;
    downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;', options);
    showToast(t('toast_tracking_csv_downloaded'));
    return csvContent;
  }

  function exportMediaHistoryCsv(customHistory, options = {}) {
    const history = Array.isArray(customHistory) ? customHistory : (options.mediaHistoryData || []);
    const formatDuration = typeof options.formatDuration === 'function' ? options.formatDuration : (s) => `${s}s`;
    const formatTimestamp = typeof options.formatTimestamp === 'function' ? options.formatTimestamp : (ts) => String(ts);
    const showToast = typeof options.showToast === 'function' ? options.showToast : () => {};
    const t = typeof options.t === 'function' ? options.t : (k) => k;

    const headers = [
      'ID',
      'Title',
      'Platform',
      'Domain',
      'URL',
      'Watch Duration (sec)',
      'Watch Duration Formatted',
      'Avg Volume (%)',
      'Peak Volume (%)',
      'Low Volume (%)',
      'Resolution',
      'Timestamp'
    ].map(escapeCsvCell);

    const rows = [headers.join(',')];

    history.forEach((it) => {
      const watchSec = Number(it.watchDuration) || 0;
      const avgVol = it.averageVolume !== undefined ? Number(it.averageVolume) : 100;
      const peakVol = it.peakVolume !== undefined ? Number(it.peakVolume) : 100;
      const lowVol = it.lowVolume !== undefined ? Number(it.lowVolume) : 100;
      const row = [
        escapeCsvCell(it.id || ''),
        escapeCsvCell(it.title || ''),
        escapeCsvCell(it.platform || ''),
        escapeCsvCell(it.domain || ''),
        escapeCsvCell(it.url || ''),
        watchSec,
        escapeCsvCell(formatDuration(watchSec)),
        avgVol,
        peakVol,
        lowVol,
        escapeCsvCell(it.resolution || ''),
        escapeCsvCell(formatTimestamp(it.timestamp))
      ];
      rows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const filename = `media_sentinel_media_history_${new Date().toISOString().split('T')[0]}.csv`;
    downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;', options);
    showToast(t('toast_media_csv_downloaded'));
    return csvContent;
  }

  function exportFullJson(data, options = {}) {
    const payload = JSON.stringify(data || {}, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `media_sentinel_backup_${dateStr}.json`;
    downloadBlob(payload, filename, 'application/json', options);
    const showToast = typeof options.showToast === 'function' ? options.showToast : () => {};
    const t = typeof options.t === 'function' ? options.t : (k) => k;
    showToast(t('toast_json_downloaded') || 'Backup downloaded');
    return payload;
  }

  const CsvExporter = {
    escapeCsvCell,
    exportTimeTrackingCsv,
    exportMediaHistoryCsv,
    exportFullJson,
    downloadBlob
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CsvExporter;
  }
  global.CsvExporter = CsvExporter;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
