/**
 * Web Activity & Media Sentinel - Dashboard Donut Chart Subsystem
 * Interactive SVG/Canvas domain distribution donut chart renderer.
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

  const DONUT_RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS; // ~565.487

  function calculateDonutSlices(items, totalSeconds) {
    if (!Array.isArray(items) || items.length === 0 || totalSeconds <= 0) {
      return [];
    }

    const topSlices = items.slice(0, 6);
    const otherItems = items.slice(6);
    const otherSum = otherItems.reduce((acc, curr) => acc + (curr.computedSeconds || curr.seconds || curr.totalSeconds || 0), 0);

    const displayList = [...topSlices];
    if (otherSum > 0) {
      displayList.push({
        domain: 'Other Websites',
        isOther: true,
        computedSeconds: otherSum,
        ratio: otherSum / totalSeconds,
        ratioPercent: ((otherSum / totalSeconds) * 100).toFixed(1)
      });
    }

    const slices = [];
    let accumulatedPercent = 0;

    for (let idx = 0; idx < displayList.length; idx++) {
      const item = displayList[idx];
      const secs = item.computedSeconds || item.seconds || item.totalSeconds || 0;
      const fraction = secs / totalSeconds;
      const angle = fraction * 360;
      const strokeDash = fraction * CIRCUMFERENCE;
      const strokeOffset = -accumulatedPercent * CIRCUMFERENCE;
      const color = PALETTE[idx % PALETTE.length];

      slices.push({
        domain: item.domain,
        isOther: !!item.isOther,
        seconds: secs,
        fraction,
        ratioPercent: item.ratioPercent || (fraction * 100).toFixed(1),
        angle,
        strokeDash,
        strokeOffset,
        color
      });

      accumulatedPercent += fraction;
    }

    return slices;
  }

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function renderDonutChart(items, totalSeconds, subtab, options = {}) {
    const doc = options.document || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    const slicesGroup = options.slicesGroup || doc.getElementById('dashboardDonutSlices');
    const centerTimeEl = options.centerTimeEl || doc.getElementById('donutCenterBigTime');
    const centerLabelEl = options.centerLabelEl || doc.getElementById('donutCenterSubLabel');
    const legendGrid = options.legendGrid || doc.getElementById('donutLegendList');
    const t = typeof options.t === 'function' ? options.t : (k) => k;
    const formatDuration = typeof options.formatDuration === 'function' ? options.formatDuration : (s) => `${s}s`;

    if (!slicesGroup || !centerTimeEl || !legendGrid) return;

    clearElement(slicesGroup);
    clearElement(legendGrid);

    centerTimeEl.textContent = formatDuration(totalSeconds);

    if (centerLabelEl) {
      if (subtab === 'today') {
        centerLabelEl.textContent = t('donut_center_today');
      } else if (subtab === 'daily') {
        centerLabelEl.textContent = t('donut_center_daily');
      } else {
        centerLabelEl.textContent = t('donut_center_total');
      }
    }

    if (totalSeconds === 0 || !Array.isArray(items) || items.length === 0) {
      let emptyMsg = t('donut_empty');
      const trackingMode = options.trackingMode || 'all';
      if (trackingMode === 'background_media') {
        emptyMsg = t('donut_empty_bg_media');
      } else if (trackingMode === 'foreground') {
        emptyMsg = t('donut_empty_foreground');
      }
      const emptySpan = doc.createElement('span');
      emptySpan.className = 'empty-text';
      emptySpan.textContent = emptyMsg;
      legendGrid.appendChild(emptySpan);
      return;
    }

    const slices = calculateDonutSlices(items, totalSeconds);

    slices.forEach((slice) => {
      const circle = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '120');
      circle.setAttribute('cy', '120');
      circle.setAttribute('r', String(DONUT_RADIUS));
      circle.setAttribute('class', 'donut-slice');
      circle.setAttribute('stroke', slice.color);
      circle.setAttribute('stroke-dasharray', `${slice.strokeDash} ${CIRCUMFERENCE}`);
      circle.setAttribute('stroke-dashoffset', String(slice.strokeOffset));

      const title = doc.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${slice.domain}: ${formatDuration(slice.seconds)} (${slice.ratioPercent}%)`;
      circle.appendChild(title);

      circle.addEventListener('mouseenter', () => {
        const centerInfo = doc.querySelector('.donut-center-info');
        if (centerInfo) {
          let faviconImg = centerInfo.querySelector('.donut-center-favicon');
          if (!faviconImg) {
            faviconImg = doc.createElement('img');
            faviconImg.className = 'donut-center-favicon';
            centerInfo.insertBefore(faviconImg, centerTimeEl);
          }
          faviconImg.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(slice.domain)}&sz=32`;
          faviconImg.style.display = 'inline-block';
          centerTimeEl.textContent = formatDuration(slice.seconds);
          if (centerLabelEl) {
            centerLabelEl.textContent = `${slice.domain} (${slice.ratioPercent}%)`;
          }
        }
      });

      circle.addEventListener('mouseleave', () => {
        const centerInfo = doc.querySelector('.donut-center-info');
        if (centerInfo) {
          const faviconImg = centerInfo.querySelector('.donut-center-favicon');
          if (faviconImg) faviconImg.style.display = 'none';
          centerTimeEl.textContent = formatDuration(totalSeconds);
          if (centerLabelEl) {
            if (subtab === 'today') {
              centerLabelEl.textContent = t('donut_center_today');
            } else if (subtab === 'daily') {
              centerLabelEl.textContent = t('donut_center_daily');
            } else {
              centerLabelEl.textContent = t('donut_center_total');
            }
          }
        }
      });

      slicesGroup.appendChild(circle);

      // Create legend item with zero innerHTML
      const legendItem = doc.createElement('div');
      legendItem.className = 'donut-legend-item';

      const dot = doc.createElement('span');
      dot.className = 'legend-color-dot';
      dot.style.backgroundColor = slice.color;

      const nameSpan = doc.createElement('span');
      nameSpan.className = 'legend-domain-name';
      nameSpan.textContent = slice.domain;

      const pctSpan = doc.createElement('span');
      pctSpan.className = 'legend-ratio-pct';
      pctSpan.textContent = `${slice.ratioPercent}%`;

      legendItem.appendChild(dot);
      legendItem.appendChild(nameSpan);
      legendItem.appendChild(pctSpan);
      legendGrid.appendChild(legendItem);
    });
  }

  const DonutChart = {
    PALETTE,
    DONUT_RADIUS,
    CIRCUMFERENCE,
    calculateDonutSlices,
    renderDonutChart
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DonutChart;
  }
  global.DonutChart = DonutChart;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
