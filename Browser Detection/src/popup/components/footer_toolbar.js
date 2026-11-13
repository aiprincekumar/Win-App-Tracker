/**
 * Web Activity & Media Sentinel - Footer Toolbar Component
 * Strictly manages the single-row 7-button layout invariant.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const BUTTON_IDS = Object.freeze([
    'btnRefresh',
    'btnGlobalMediaToggle',
    'btnTrackingPauseToggle',
    'btnSleepTimerTrigger',
    'btnJumpMediaTab',
    'btnReconnectWs',
    'btnOpenDashboard'
  ]);

  function verifyToolbarButtons() {
    if (typeof document === 'undefined') return true;
    return BUTTON_IDS.every(id => Boolean(document.getElementById(id)));
  }

  function setTrackingPauseState(isPaused) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('btnTrackingPauseToggle');
    if (!btn) return;

    if (isPaused) {
      btn.classList.add('paused');
      btn.title = 'Resume Time Tracking';
    } else {
      btn.classList.remove('paused');
      btn.title = 'Pause Time Tracking';
    }
  }

  const FooterToolbar = {
    BUTTON_IDS,
    verifyToolbarButtons,
    setTrackingPauseState
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterToolbar;
  }
  global.FooterToolbar = FooterToolbar;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
