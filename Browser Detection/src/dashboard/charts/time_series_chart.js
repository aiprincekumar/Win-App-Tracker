/**
 * Web Activity & Media Sentinel - Dashboard Time Series Chart Subsystem
 * Daily and hourly activity trend charts.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function computeDailyAverages(dailyTotals) {
    if (!dailyTotals || typeof dailyTotals !== 'object') return 0;
    const entries = Object.values(dailyTotals);
    if (!entries.length) return 0;
    const sum = entries.reduce((acc, val) => acc + (Number(val) || 0), 0);
    return Math.round(sum / entries.length);
  }

  const TimeSeriesChart = {
    computeDailyAverages
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeSeriesChart;
  }
  global.TimeSeriesChart = TimeSeriesChart;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
