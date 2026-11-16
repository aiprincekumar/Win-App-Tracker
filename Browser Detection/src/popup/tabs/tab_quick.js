/**
 * Web Activity & Media Sentinel - Quick Settings & Tools Tab Controller
 * Manages quick settings popover, default tab preference, auto-sync intervals,
 * sound chime toggles, tracking mode selector, and domain category selector.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const DEFAULT_VALID_TABS = Object.freeze(['media', 'audio', 'tools', 'studio', 'tracking', 'domains']);
  const VALID_TRACKING_MODES = Object.freeze(['all', 'combined', 'foreground', 'background_media']);
  const VALID_CATEGORIES = Object.freeze(['all', 'websites', 'internal']);

  let _quickSettings = {
    default_tab: 'media',
    sync_interval: 2000,
    notification_sound: true,
    high_contrast: false
  };

  let _activeTrackingMode = 'combined';
  let _activeCategory = 'all';
  let _onSettingChange = null;

  function initQuickSettings(options = {}) {
    if (typeof document === 'undefined') return;

    if (typeof options.onSettingChange === 'function') {
      _onSettingChange = options.onSettingChange;
    }

    const selDefaultTab = document.getElementById('selectDefaultTab');
    const selSyncInterval = document.getElementById('selectSyncInterval');
    const toggleNotifSound = document.getElementById('toggleNotificationSound');
    const toggleHighContrast = document.getElementById('toggleHighContrast');
    const selTrackingMode = document.getElementById('trackingModeSelect');
    const selCategory = document.getElementById('domainCategorySelect');
    const btnOpenQuickSettings = document.getElementById('btnQuickSettingsTrigger');
    const btnCloseQuickSettings = document.getElementById('btnCloseQuickSettings');
    const quickSettingsPopover = document.getElementById('quickSettingsPopover');

    if (selDefaultTab) {
      selDefaultTab.addEventListener('change', (e) => {
        const val = e.target.value;
        if (DEFAULT_VALID_TABS.includes(val)) {
          _quickSettings.default_tab = val;
          saveQuickSetting('default_tab', val);
        }
      });
    }

    if (selSyncInterval) {
      selSyncInterval.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 500 && val <= 10000) {
          _quickSettings.sync_interval = val;
          saveQuickSetting('sync_interval', val);
        }
      });
    }

    if (toggleNotifSound) {
      toggleNotifSound.addEventListener('change', (e) => {
        _quickSettings.notification_sound = Boolean(e.target.checked);
        saveQuickSetting('notification_sound', _quickSettings.notification_sound);
      });
    }

    if (toggleHighContrast) {
      toggleHighContrast.addEventListener('change', (e) => {
        _quickSettings.high_contrast = Boolean(e.target.checked);
        saveQuickSetting('high_contrast', _quickSettings.high_contrast);
        if (typeof options.onHighContrastChange === 'function') {
          options.onHighContrastChange(_quickSettings.high_contrast);
        }
      });
    }

    if (selTrackingMode) {
      selTrackingMode.addEventListener('change', (e) => {
        const val = e.target.value;
        if (VALID_TRACKING_MODES.includes(val)) {
          _activeTrackingMode = val;
          if (typeof options.onTrackingModeChange === 'function') {
            options.onTrackingModeChange(val);
          }
        }
      });
    }

    if (selCategory) {
      selCategory.addEventListener('change', (e) => {
        const val = e.target.value;
        if (VALID_CATEGORIES.includes(val)) {
          _activeCategory = val;
          if (typeof options.onCategoryChange === 'function') {
            options.onCategoryChange(val);
          }
        }
      });
    }

    if (btnOpenQuickSettings && quickSettingsPopover) {
      btnOpenQuickSettings.addEventListener('click', () => {
        quickSettingsPopover.classList.remove('hidden');
      });
    }

    if (btnCloseQuickSettings && quickSettingsPopover) {
      btnCloseQuickSettings.addEventListener('click', () => {
        quickSettingsPopover.classList.add('hidden');
      });
    }
  }

  function hydrateQuickSettings(storedSettings = {}) {
    if (storedSettings && typeof storedSettings === 'object') {
      Object.assign(_quickSettings, storedSettings);
    }

    if (typeof document === 'undefined') return _quickSettings;

    const selDefaultTab = document.getElementById('selectDefaultTab');
    const selSyncInterval = document.getElementById('selectSyncInterval');
    const toggleNotifSound = document.getElementById('toggleNotificationSound');
    const toggleHighContrast = document.getElementById('toggleHighContrast');

    if (selDefaultTab && _quickSettings.default_tab) {
      selDefaultTab.value = _quickSettings.default_tab;
    }
    if (selSyncInterval && _quickSettings.sync_interval) {
      selSyncInterval.value = String(_quickSettings.sync_interval);
    }
    if (toggleNotifSound && typeof _quickSettings.notification_sound === 'boolean') {
      toggleNotifSound.checked = _quickSettings.notification_sound;
    }
    if (toggleHighContrast && typeof _quickSettings.high_contrast === 'boolean') {
      toggleHighContrast.checked = _quickSettings.high_contrast;
    }

    return _quickSettings;
  }

  function saveQuickSetting(key, val) {
    _quickSettings[key] = val;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['quick_settings'], (res) => {
        const cur = res && res.quick_settings ? res.quick_settings : {};
        cur[key] = val;
        chrome.storage.local.set({ quick_settings: cur });
      });
    }
    if (_onSettingChange) {
      try { _onSettingChange(key, val, _quickSettings); } catch (_) {}
    }
  }

  function getQuickSettings() {
    return Object.assign({}, _quickSettings);
  }

  function getActiveTrackingMode() {
    return _activeTrackingMode;
  }

  function getActiveCategory() {
    return _activeCategory;
  }

  const TabQuick = {
    DEFAULT_VALID_TABS,
    VALID_TRACKING_MODES,
    VALID_CATEGORIES,
    initQuickSettings,
    hydrateQuickSettings,
    saveQuickSetting,
    getQuickSettings,
    getActiveTrackingMode,
    getActiveCategory
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabQuick;
  }
  global.TabQuick = TabQuick;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
