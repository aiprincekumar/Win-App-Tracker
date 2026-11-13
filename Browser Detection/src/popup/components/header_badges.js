/**
 * Web Activity & Media Sentinel - Header Status Badges Component
 * Manages WebSocket 65432 and SQLite Data Hub 65433 header badges.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function updateHUDStatusBadge(connected) {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('wsStatusBadge');
    const text = document.getElementById('wsStatusText');
    if (!badge || !text) return;

    if (connected) {
      badge.className = 'status-badge connected';
      text.textContent = 'HUD Live';
    } else {
      badge.className = 'status-badge disconnected';
      text.textContent = 'HUD Offline';
    }
  }

  function updateDataHubStatusBadge(connected) {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('hubStatusBadge');
    const text = document.getElementById('hubStatusText');
    if (!badge || !text) return;

    if (connected) {
      badge.className = 'hub-status-badge connected';
      text.textContent = 'Data Hub';
    } else {
      badge.className = 'hub-status-badge disconnected';
      text.textContent = 'Data Hub';
    }
  }

  const HeaderBadges = {
    updateHUDStatusBadge,
    updateDataHubStatusBadge
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderBadges;
  }
  global.HeaderBadges = HeaderBadges;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
