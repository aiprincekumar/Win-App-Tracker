/**
 * Web Activity & Media Sentinel - Dashboard Donut Chart Subsystem
 * Interactive SVG/Canvas domain distribution donut chart renderer.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function calculateDonutSlices(items, totalSeconds) {
    if (!Array.isArray(items) || items.length === 0 || totalSeconds <= 0) {
      return [];
    }

    const slices = [];
    let startAngle = 0;

    for (const item of items) {
      const fraction = (item.seconds || item.totalSeconds || 0) / totalSeconds;
      const angle = fraction * 360;
      slices.push({
        domain: item.domain,
        fraction,
        angle,
        startAngle,
        endAngle: startAngle + angle
      });
      startAngle += angle;
    }

    return slices;
  }

  const DonutChart = {
    calculateDonutSlices
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DonutChart;
  }
  global.DonutChart = DonutChart;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
