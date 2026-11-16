/**
 * Web Activity & Media Sentinel - Dashboard Time Series & Distribution Chart Subsystem
 * Daily and hourly activity trend charts and top domain distribution bars.
 * 100% W3C Trusted Types compliant (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const PALETTE = Object.freeze([
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#3b82f6', // Blue
    '#64748b'  // Muted Slate
  ]);

  function computeDailyAverages(dailyTotals) {
    if (!dailyTotals || typeof dailyTotals !== 'object') return 0;
    const entries = Object.values(dailyTotals);
    if (!entries.length) return 0;
    const sum = entries.reduce((acc, val) => acc + (Number(val) || 0), 0);
    return Math.round(sum / entries.length);
  }

  function calculateDailyBuckets(daysData = {}) {
    const buckets = [];
    if (!daysData || typeof daysData !== 'object') return buckets;
    const sortedDates = Object.keys(daysData).sort();
    for (const date of sortedDates) {
      const entry = daysData[date];
      const seconds = typeof entry === 'number' ? entry : (entry && (entry.seconds || entry.totalSeconds) || 0);
      buckets.push({
        date,
        seconds: Math.round(seconds)
      });
    }
    return buckets;
  }

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function renderTopDistributionBars(container, items, totalSeconds, options = {}) {
    if (!container) return;
    const doc = options.document || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    clearElement(container);

    const t = typeof options.t === 'function' ? options.t : (k) => k;
    const formatDuration = typeof options.formatDuration === 'function' ? options.formatDuration : (s) => `${s}s`;

    if (!items || items.length === 0 || totalSeconds === 0) {
      const emptySpan = doc.createElement('span');
      emptySpan.className = 'empty-text';
      emptySpan.textContent = t('no_data_available');
      container.appendChild(emptySpan);
      return;
    }

    const topItems = items.slice(0, 5);

    topItems.forEach((item, idx) => {
      const color = PALETTE[idx % PALETTE.length];
      const row = doc.createElement('div');
      row.className = 'top-bar-item';

      const meta = doc.createElement('div');
      meta.className = 'top-bar-meta';

      const domainSpan = doc.createElement('span');
      domainSpan.className = 'top-bar-domain';

      const favImg = doc.createElement('img');
      favImg.src = item.favicon || '../icons/icon16.png';
      favImg.alt = '';
      favImg.className = 'domain-mini-favicon';
      favImg.addEventListener('error', () => {
        favImg.src = '../icons/icon16.png';
      }, { once: true });

      const nameText = doc.createTextNode(` ${item.domain}`);
      domainSpan.appendChild(favImg);
      domainSpan.appendChild(nameText);

      const statSpan = doc.createElement('span');
      statSpan.className = 'top-bar-stat';
      const durationText = doc.createTextNode(`${formatDuration(item.computedSeconds)} `);
      const pctSpan = doc.createElement('span');
      pctSpan.style.color = color;
      pctSpan.style.fontWeight = '700';
      pctSpan.textContent = `(${item.ratioPercent}%)`;
      statSpan.appendChild(durationText);
      statSpan.appendChild(pctSpan);

      meta.appendChild(domainSpan);
      meta.appendChild(statSpan);

      const track = doc.createElement('div');
      track.className = 'top-bar-track';

      const fill = doc.createElement('div');
      fill.className = 'top-bar-fill';
      fill.style.width = `${item.ratioPercent}%`;
      fill.style.background = color;
      track.appendChild(fill);

      row.appendChild(meta);
      row.appendChild(track);
      container.appendChild(row);
    });
  }

  const TimeSeriesChart = {
    computeDailyAverages,
    calculateDailyBuckets,
    renderTopDistributionBars
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeSeriesChart;
  }
  global.TimeSeriesChart = TimeSeriesChart;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
