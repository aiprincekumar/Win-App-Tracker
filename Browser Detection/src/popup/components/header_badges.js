/**
 * Web Activity & Media Sentinel - Header Status Badges Component
 * Manages WebSocket 65432 and SQLite Data Hub 65433 header badges and active time badge.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function updateHUDStatusBadge(connected, starting = false) {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('wsStatusBadge');
    const text = document.getElementById('wsStatusText');
    if (!badge || !text) return;

    if (starting) {
      badge.className = 'ws-badge starting';
      text.textContent = 'Starting HUD...';
    } else if (connected) {
      badge.className = 'ws-badge connected';
      text.textContent = 'HUD Live';
    } else {
      badge.className = 'ws-badge disconnected';
      text.textContent = 'HUD Offline';
    }
  }

  function updateDataHubStatusBadge(connected, starting = false) {
    if (typeof document === 'undefined') return;
    const hubBadge = document.getElementById('hubStatusBadge');
    const text = document.getElementById('hubStatusText');
    if (!hubBadge) return;

    if (starting) {
      hubBadge.className = 'ws-badge starting';
      if (text) text.textContent = 'Data Hub...';
    } else if (connected) {
      hubBadge.className = 'ws-badge connected';
      if (text) text.textContent = 'Data Hub';
    } else {
      hubBadge.className = 'ws-badge disconnected';
      if (text) text.textContent = 'Data Hub';
    }
  }

  function updateHeaderTimeBadge(totalSeconds = 0) {
    if (typeof document === 'undefined') return;
    const timeBadge = document.getElementById('todayHeaderTimeBadge');
    if (!timeBadge) return;

    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);

    let displayStr = `${m}m`;
    if (h > 0) {
      displayStr = `${h}h ${m}m`;
    }

    timeBadge.textContent = displayStr;
    const fullTitle = `Total Active Time Today: ${displayStr} (Click to view Tracking)`;
    timeBadge.title = fullTitle;
    timeBadge.setAttribute('aria-label', fullTitle);
  }

  function initHeaderBadgeListeners(options = {}) {
    if (typeof document === 'undefined') return;
    const hubBadge = document.getElementById('hubStatusBadge');
    const wsBadge = document.getElementById('wsStatusBadge');
    const timeBadge = document.getElementById('todayHeaderTimeBadge');

    if (hubBadge) {
      hubBadge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof options.onHubClick === 'function') options.onHubClick();
        }
      });
      hubBadge.addEventListener('click', () => {
        if (typeof options.onHubClick === 'function') options.onHubClick();
      });
    }

    if (wsBadge) {
      wsBadge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof options.onWsClick === 'function') options.onWsClick();
        }
      });
      wsBadge.addEventListener('click', () => {
        if (typeof options.onWsClick === 'function') options.onWsClick();
      });
    }

    if (timeBadge) {
      timeBadge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof options.onTimeClick === 'function') options.onTimeClick();
        }
      });
      timeBadge.addEventListener('click', () => {
        if (typeof options.onTimeClick === 'function') options.onTimeClick();
      });
    }
  }

  const HeaderBadges = {
    updateHUDStatusBadge,
    updateDataHubStatusBadge,
    updateHeaderTimeBadge,
    initHeaderBadgeListeners
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderBadges;
  }
  global.HeaderBadges = HeaderBadges;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
