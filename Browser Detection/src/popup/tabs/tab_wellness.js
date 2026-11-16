/**
 * Web Activity & Media Sentinel - Digital Wellness & Alarms Controller
 * Manages daily limit dials, doomscroll breaker alarms, focus ratios, and Web Audio API chime synthesis.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  let _focusSettings = {
    doomscroll_enabled: false,
    doomscroll_interval_minutes: 30
  };

  let _onFocusChange = null;

  function playNotificationChime() {
    try {
      const AudioCtx = (typeof window !== 'undefined') ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  function initDigitalWellness(options = {}) {
    if (typeof document === 'undefined') return;

    if (typeof options.onFocusChange === 'function') {
      _onFocusChange = options.onFocusChange;
    }

    const toggleDoomscroll = document.getElementById('toggleDoomscrollBreaker');
    const selectInterval = document.getElementById('selectDoomscrollInterval');

    if (toggleDoomscroll) {
      toggleDoomscroll.addEventListener('change', (e) => {
        saveFocusSetting('doomscroll_enabled', Boolean(e.target.checked));
      });
    }

    if (selectInterval) {
      selectInterval.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        const clamped = Math.max(1, Math.min(240, isNaN(val) ? 30 : val));
        saveFocusSetting('doomscroll_interval_minutes', clamped);
      });
    }
  }

  function hydrateFocusSettings(storedSettings = {}) {
    if (storedSettings && typeof storedSettings === 'object') {
      Object.assign(_focusSettings, storedSettings);
    }

    if (typeof document === 'undefined') return _focusSettings;

    const toggleDoomscroll = document.getElementById('toggleDoomscrollBreaker');
    const selectInterval = document.getElementById('selectDoomscrollInterval');

    if (toggleDoomscroll && typeof _focusSettings.doomscroll_enabled === 'boolean') {
      toggleDoomscroll.checked = _focusSettings.doomscroll_enabled;
    }
    if (selectInterval && _focusSettings.doomscroll_interval_minutes) {
      selectInterval.value = String(_focusSettings.doomscroll_interval_minutes);
    }

    return _focusSettings;
  }

  function saveFocusSetting(key, val) {
    _focusSettings[key] = val;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['focus_settings'], (res) => {
        const cur = res && res.focus_settings ? res.focus_settings : {};
        cur[key] = val;
        chrome.storage.local.set({ focus_settings: cur });
      });
    }
    if (_onFocusChange) {
      try { _onFocusChange(key, val, _focusSettings); } catch (_) {}
    }
  }

  function updateFocusRatioUI(foregroundSecs = 0, bgMediaSecs = 0) {
    if (typeof document === 'undefined') return;
    const bar = document.getElementById('focusRatioBar');
    const text = document.getElementById('focusRatioText');
    const total = foregroundSecs + bgMediaSecs;

    if (total <= 0) {
      if (bar) bar.style.width = '100%';
      if (text) text.textContent = '100% Productive';
      return;
    }

    const prodRatio = Math.round((foregroundSecs / total) * 100);
    if (bar) bar.style.width = `${prodRatio}%`;
    if (text) text.textContent = `${prodRatio}% Productive`;
  }

  function getFocusSettings() {
    return Object.assign({}, _focusSettings);
  }

  const TabWellness = {
    playNotificationChime,
    initDigitalWellness,
    hydrateFocusSettings,
    saveFocusSetting,
    updateFocusRatioUI,
    getFocusSettings
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabWellness;
  }
  global.TabWellness = TabWellness;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
