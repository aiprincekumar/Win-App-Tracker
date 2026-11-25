/**
 * Web Activity & Media Sentinel - Dashboard Audio Lab Controller & Synthesized Audio Haptics
 * 5-Band Biquad Graphic Equalizer, Master Volume Boost, Presets, and Procedural Web Audio Synthesis.
 * 100% W3C Trusted Types compliant (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const DASHBOARD_EQ_PRESETS = Object.freeze({
    flat: [0, 0, 0, 0, 0],
    bass_boost: [6, 4, 1, 0, -1],
    vocal_enhancer: [-3, 1, 4, 5, 2],
    vocal_clarify: [-3, 1, 4, 5, 2],
    treble_boost: [-2, 0, 1, 4, 6],
    electronic: [5, 3, 0, 2, 4],
    rock: [5, 3, -1, 3, 5],
    acoustic: [3, 2, 1, 2, 3],
    night_mode: [-4, -2, 2, 1, -3],
    night: [-4, -2, 2, 1, -3]
  });

  const DEFAULT_AUDIO_LAB_SETTINGS = Object.freeze({
    master_boost: 100,
    audio_only: false,
    eq_preset: 'flat',
    eq_bands: {
      '60': 0,
      '250': 0,
      '1000': 0,
      '4000': 0,
      '16000': 0
    },
    vocal_clarity: false,
    night_shield: false,
    bass_boost: false
  });

  function dispatchAudioLabSettings(settings, api = null, primaryMedia = null) {
    const runtimeApi = api || (typeof browserAPI !== 'undefined' ? browserAPI : (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null)));
    const targetTabId = (primaryMedia && primaryMedia.tabId) ? primaryMedia.tabId : undefined;
    const drainLastError = () => {
      try { void (runtimeApi && runtimeApi.runtime && runtimeApi.runtime.lastError); } catch (_) {}
    };

    if (targetTabId && runtimeApi && runtimeApi.tabs && typeof runtimeApi.tabs.sendMessage === 'function') {
      try {
        const p = runtimeApi.tabs.sendMessage(targetTabId, {
          type: 'APPLY_AUDIO_LAB_SETTINGS',
          settings: settings
        }, drainLastError);
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    }

    if (runtimeApi && runtimeApi.runtime && typeof runtimeApi.runtime.sendMessage === 'function') {
      try {
        const p2 = runtimeApi.runtime.sendMessage({
          type: 'APPLY_AUDIO_LAB_SETTINGS',
          settings: settings,
          tabId: targetTabId
        }, drainLastError);
        if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
      } catch (_) {}
    }
  }

  function persistDashboardAudioLabSettings(updated, currentSettings, api = null, primaryMedia = null) {
    const settings = Object.assign({}, currentSettings || DEFAULT_AUDIO_LAB_SETTINGS, updated);
    if (updated && updated.eq_bands) {
      settings.eq_bands = Object.assign({}, (currentSettings && currentSettings.eq_bands) || DEFAULT_AUDIO_LAB_SETTINGS.eq_bands, updated.eq_bands);
    }

    const storageApi = api || (typeof browserAPI !== 'undefined' ? browserAPI : (typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null)));
    try {
      if (storageApi && storageApi.storage && storageApi.storage.local) {
        storageApi.storage.local.set({ audio_lab_settings: settings });
      }
    } catch (_) {}

    dispatchAudioLabSettings(settings, storageApi, primaryMedia);
    return settings;
  }

  function updateDashboardAudioLabUI(settings, currentSettings, doc = null, t = null) {
    if (!settings) return;
    const documentObj = doc || (typeof document !== 'undefined' ? document : null);
    if (!documentObj) return;
    const translate = typeof t === 'function' ? t : (k) => k;

    const merged = Object.assign(currentSettings || {}, settings);
    if (settings.eq_bands) {
      merged.eq_bands = Object.assign({}, currentSettings ? currentSettings.eq_bands : {}, settings.eq_bands);
    }

    // 1. Master Volume Boost
    const boostVal = typeof merged.master_boost === 'number' ? merged.master_boost : 100;
    const boostValEl = documentObj.getElementById('heroAudioBoostVal');
    if (boostValEl) {
      boostValEl.textContent = `${boostVal}%`;
    }

    const slider = documentObj.getElementById('heroAudioBoostSlider');
    if (slider) {
      if (Number(slider.value) !== Number(boostVal)) {
        slider.value = String(boostVal);
      }
      if (typeof slider.setAttribute === 'function') {
        slider.setAttribute('aria-valuenow', String(boostVal));
      }
    }

    // 2. Preset Badge & Dropdown
    let preset = merged.eq_preset || 'flat';
    if (preset === 'vocal_clarify') preset = 'vocal_enhancer';
    if (preset === 'night') preset = 'night_mode';

    const presetBadge = documentObj.getElementById('audioLabPresetBadge');
    if (presetBadge) {
      presetBadge.textContent = preset.charAt(0).toUpperCase() + preset.slice(1).replace('_', ' ');
    }

    const presetSelect = documentObj.getElementById('audioEqPresetSelect');
    if (presetSelect && presetSelect.options && presetSelect.value !== preset) {
      for (const opt of presetSelect.options) {
        if (opt.value === preset) {
          presetSelect.value = preset;
          break;
        }
      }
    }

    // 3. 5-Band Equalizer Sliders & Badges
    const eqBands = ['60', '250', '1000', '4000', '16000'];
    eqBands.forEach((b) => {
      const val = (merged.eq_bands && typeof merged.eq_bands[b] === 'number') ? merged.eq_bands[b] : 0;
      const bandSlider = documentObj.getElementById(`eqBand${b}`);
      if (bandSlider) {
        if (Number(bandSlider.value) !== Number(val)) {
          bandSlider.value = String(val);
        }
        if (typeof bandSlider.setAttribute === 'function') {
          bandSlider.setAttribute('aria-valuenow', String(val));
        }
      }
      const valSpan = documentObj.getElementById(`eqVal${b}`);
      if (valSpan) {
        valSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
      }
    });

    // 4. Feature Badges & Toggles
    const isVocal = Boolean(merged.vocal_clarity);
    const vocalBadge = documentObj.getElementById('audioLabVocalBadge');
    if (vocalBadge) {
      vocalBadge.textContent = isVocal ? translate('audiolab_vocal_on') : translate('audiolab_vocal_off');
      if (vocalBadge.classList && typeof vocalBadge.classList.add === 'function') {
        if (isVocal) vocalBadge.classList.add('badge-active');
        else vocalBadge.classList.remove('badge-active');
      }
    }
    const toggleVocal = documentObj.getElementById('toggleVocalClarity');
    if (toggleVocal && toggleVocal.checked !== isVocal) {
      toggleVocal.checked = isVocal;
    }

    const isNight = Boolean(merged.night_shield);
    const nightBadge = documentObj.getElementById('audioLabNightBadge');
    if (nightBadge) {
      nightBadge.textContent = isNight ? translate('audiolab_night_on') : translate('audiolab_night_off');
      if (nightBadge.classList && typeof nightBadge.classList.add === 'function') {
        if (isNight) nightBadge.classList.add('badge-active');
        else nightBadge.classList.remove('badge-active');
      }
    }
    const toggleNight = documentObj.getElementById('toggleNightShield');
    if (toggleNight && toggleNight.checked !== isNight) {
      toggleNight.checked = isNight;
    }

    const isBass = Boolean(merged.bass_boost);
    const toggleBass = documentObj.getElementById('toggleBassBoost');
    if (toggleBass && toggleBass.checked !== isBass) {
      toggleBass.checked = isBass;
    }

    const isAudioOnly = Boolean(merged.audio_only);
    const toggleAudioOnly = documentObj.getElementById('toggleAudioOnlyMode');
    if (toggleAudioOnly && toggleAudioOnly.checked !== isAudioOnly) {
      toggleAudioOnly.checked = isAudioOnly;
    }
  }

  // =============================================================================
  // Phase 4: Procedural Web Audio Synthesizer Engine (System 6)
  // =============================================================================

  class SentinelHapticAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.masterGain = 0.15; // default subtle 15% volume
    }

    initContext() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          try {
            this.ctx = new AudioCtx();
          } catch (_) {}
        }
      }
      return this.ctx;
    }

    resumeContext() {
      const ctx = this.initContext();
      if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    playTick() {
      if (!this.enabled) return;
      const ctx = this.resumeContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(this.masterGain * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } catch (_) {}
    }

    playClick() {
      if (!this.enabled) return;
      const ctx = this.resumeContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(this.masterGain * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } catch (_) {}
    }

    playSuccessChime() {
      if (!this.enabled) return;
      const ctx = this.resumeContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        [523.25, 659.25].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(this.masterGain * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.28);
        });
      } catch (_) {}
    }

    playWarnTone() {
      if (!this.enabled) return;
      const ctx = this.resumeContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        [0, 0.1].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now + delay);
          gain.gain.setValueAtTime(this.masterGain * 0.6, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.08);
        });
      } catch (_) {}
    }

    setVolume(vol) {
      const v = parseFloat(vol);
      if (!isNaN(v)) {
        this.masterGain = Math.max(0, Math.min(v, 1));
      }
    }

    setEnabled(enabled) {
      this.enabled = Boolean(enabled);
    }
  }

  const sentinelHaptics = new SentinelHapticAudioEngine();

  const AudioLabController = {
    DASHBOARD_EQ_PRESETS,
    DEFAULT_AUDIO_LAB_SETTINGS,
    dispatchAudioLabSettings,
    persistDashboardAudioLabSettings,
    updateDashboardAudioLabUI,
    SentinelHapticAudioEngine,
    sentinelHaptics
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioLabController;
  }
  global.AudioLabController = AudioLabController;
  global.SentinelHapticAudioEngine = SentinelHapticAudioEngine;
  global.sentinelHaptics = sentinelHaptics;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
