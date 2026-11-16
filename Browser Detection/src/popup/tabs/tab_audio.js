/**
 * Web Activity & Media Sentinel - Audio Lab Tab Controller
 * Master 0-200% boost slider, 5-band graphic equalizer, presets, vocal clarity, and night listening shield.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const EQ_PRESETS = Object.freeze({
    flat: Object.freeze([0, 0, 0, 0, 0]),
    bass_boost: Object.freeze([6, 4, 1, 0, -1]),
    vocal_clarify: Object.freeze([-3, 1, 4, 5, 2]),
    rock: Object.freeze([5, 3, -1, 3, 5]),
    night: Object.freeze([-4, -2, 2, 1, -3])
  });

  const EQ_BANDS = Object.freeze(['60', '250', '1000', '4000', '16000']);

  let _audioLabSettings = {
    master_boost: 100,
    audio_only: false,
    eq_preset: 'flat',
    eq_bands: { '60': 0, '250': 0, '1000': 0, '4000': 0, '16000': 0 },
    vocal_clarity: false,
    night_shield: false
  };

  let _onAudioChange = null;

  function getEQBands() {
    return EQ_BANDS;
  }

  function getEQPresets() {
    return EQ_PRESETS;
  }

  function initAudioLab(options = {}) {
    if (typeof document === 'undefined') return;

    if (typeof options.onAudioChange === 'function') {
      _onAudioChange = options.onAudioChange;
    }

    const boostSlider = document.getElementById('audioMasterBoostSlider');
    const boostText = document.getElementById('audioBoostPercentText');
    const toggleAudioOnly = document.getElementById('toggleAudioOnlyMode');
    const presetSelect = document.getElementById('audioEqPresetSelect');
    const toggleVocal = document.getElementById('toggleVocalClarity');
    const toggleNight = document.getElementById('toggleNightShield');
    const btnResetEq = document.getElementById('btnResetEq');

    if (boostSlider) {
      boostSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        _audioLabSettings.master_boost = Math.max(0, Math.min(200, isNaN(val) ? 100 : val));
        if (boostText) boostText.textContent = `${_audioLabSettings.master_boost}%`;
        persistAudioSettings();
      });
    }

    if (toggleAudioOnly) {
      toggleAudioOnly.addEventListener('change', (e) => {
        _audioLabSettings.audio_only = Boolean(e.target.checked);
        persistAudioSettings();
      });
    }

    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const presetKey = e.target.value;
        applyEqPreset(presetKey);
      });
    }

    EQ_BANDS.forEach(freq => {
      const slider = document.getElementById(`eqBand${freq}`);
      const valText = document.getElementById(`eqVal${freq}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          _audioLabSettings.eq_bands[freq] = Math.max(-12, Math.min(12, isNaN(val) ? 0 : val));
          if (valText) valText.textContent = `${_audioLabSettings.eq_bands[freq] > 0 ? '+' : ''}${_audioLabSettings.eq_bands[freq]}dB`;
          _audioLabSettings.eq_preset = 'custom';
          if (presetSelect) presetSelect.value = 'custom';
          persistAudioSettings();
        });
      }
    });

    if (toggleVocal) {
      toggleVocal.addEventListener('change', (e) => {
        _audioLabSettings.vocal_clarity = Boolean(e.target.checked);
        persistAudioSettings();
      });
    }

    if (toggleNight) {
      toggleNight.addEventListener('change', (e) => {
        _audioLabSettings.night_shield = Boolean(e.target.checked);
        persistAudioSettings();
      });
    }

    if (btnResetEq) {
      btnResetEq.addEventListener('click', () => {
        resetEqualizer();
      });
    }
  }

  function applyEqPreset(presetKey) {
    if (!EQ_PRESETS[presetKey]) return;
    _audioLabSettings.eq_preset = presetKey;
    const curve = EQ_PRESETS[presetKey];

    EQ_BANDS.forEach((freq, idx) => {
      _audioLabSettings.eq_bands[freq] = curve[idx];
      if (typeof document !== 'undefined') {
        const slider = document.getElementById(`eqBand${freq}`);
        const valText = document.getElementById(`eqVal${freq}`);
        if (slider) slider.value = String(curve[idx]);
        if (valText) valText.textContent = `${curve[idx] > 0 ? '+' : ''}${curve[idx]}dB`;
      }
    });

    if (typeof document !== 'undefined') {
      const presetSelect = document.getElementById('audioEqPresetSelect');
      if (presetSelect) presetSelect.value = presetKey;
    }

    persistAudioSettings();
  }

  function resetEqualizer() {
    applyEqPreset('flat');
  }

  function hydrateAudioSettings(storedSettings = {}) {
    if (storedSettings && typeof storedSettings === 'object') {
      Object.assign(_audioLabSettings, storedSettings);
    }

    if (typeof document === 'undefined') return _audioLabSettings;

    const boostSlider = document.getElementById('audioMasterBoostSlider');
    const boostText = document.getElementById('audioBoostPercentText');
    const toggleAudioOnly = document.getElementById('toggleAudioOnlyMode');
    const presetSelect = document.getElementById('audioEqPresetSelect');
    const toggleVocal = document.getElementById('toggleVocalClarity');
    const toggleNight = document.getElementById('toggleNightShield');

    if (boostSlider) boostSlider.value = String(_audioLabSettings.master_boost);
    if (boostText) boostText.textContent = `${_audioLabSettings.master_boost}%`;
    if (toggleAudioOnly) toggleAudioOnly.checked = Boolean(_audioLabSettings.audio_only);
    if (presetSelect && _audioLabSettings.eq_preset) presetSelect.value = _audioLabSettings.eq_preset;
    if (toggleVocal) toggleVocal.checked = Boolean(_audioLabSettings.vocal_clarity);
    if (toggleNight) toggleNight.checked = Boolean(_audioLabSettings.night_shield);

    EQ_BANDS.forEach(freq => {
      const slider = document.getElementById(`eqBand${freq}`);
      const valText = document.getElementById(`eqVal${freq}`);
      const val = _audioLabSettings.eq_bands[freq] || 0;
      if (slider) slider.value = String(val);
      if (valText) valText.textContent = `${val > 0 ? '+' : ''}${val}dB`;
    });

    return _audioLabSettings;
  }

  function persistAudioSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ audio_lab_settings: _audioLabSettings });
    }

    const api = typeof browser !== 'undefined' && browser.runtime ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (api && api.runtime && api.runtime.sendMessage) {
      try {
        api.runtime.sendMessage({
          type: 'APPLY_AUDIO_LAB_SETTINGS',
          settings: _audioLabSettings
        }, () => {
          if (api.runtime.lastError) {}
        });
      } catch (_) {}
    }

    if (_onAudioChange) {
      try { _onAudioChange(_audioLabSettings); } catch (_) {}
    }
  }

  function getAudioSettings() {
    return JSON.parse(JSON.stringify(_audioLabSettings));
  }

  const TabAudio = {
    EQ_PRESETS,
    EQ_BANDS,
    getEQBands,
    getEQPresets,
    initAudioLab,
    applyEqPreset,
    resetEqualizer,
    hydrateAudioSettings,
    persistAudioSettings,
    getAudioSettings
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabAudio;
  }
  global.TabAudio = TabAudio;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
