/**
 * Web Activity & Media Sentinel - Focus Mode Toggle
 * Real-time Cell Editing & Execution Toggle
 */

(function (global) {
  'use strict';

  function initFocusModeToggle() {
    const toggle = document.getElementById('toggleRealTimeEditing');
    if (!toggle) return;

    // Load state
    chrome.storage.local.get(['realTimeEditingEnabled'], (result) => {
      toggle.checked = !!result.realTimeEditingEnabled;
    });

    // Save state
    toggle.addEventListener('change', () => {
      chrome.storage.local.set({ realTimeEditingEnabled: toggle.checked });
      // Optionally notify other parts of the app
    });
  }

  const FocusModeToggle = Object.freeze({
    init: initFocusModeToggle
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusModeToggle;
  }
  global.FocusModeToggle = FocusModeToggle;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
