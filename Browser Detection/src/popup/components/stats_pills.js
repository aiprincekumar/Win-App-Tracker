/**
 * Web Activity & Media Sentinel - Stats Pills Component
 * Renders Today, Daily Average, and Sessions stat pills with 100% Trusted Types safety.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Formatters = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/formatters.js')
    : (global.SharedFormatters || {});

  const formatSecs = Formatters.formatDuration || ((s) => `${s}s`);

  function updateStatsPills(todaySecs, dailySecs, sessionCount) {
    if (typeof document === 'undefined') return;

    const pToday = document.getElementById('pillTodayTime');
    const pDaily = document.getElementById('pillDailyAvg');
    const pSessions = document.getElementById('pillTotalSessions');

    if (pToday) pToday.textContent = formatSecs(todaySecs);
    if (pDaily) pDaily.textContent = formatSecs(dailySecs);
    if (pSessions) pSessions.textContent = String(sessionCount || 0);
  }

  const StatsPills = {
    updateStatsPills
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatsPills;
  }
  global.StatsPills = StatsPills;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
