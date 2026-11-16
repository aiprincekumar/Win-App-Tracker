/**
 * Web Activity & Media Sentinel - Smart Automations Tab Controller
 * Auto-pause background media, smart ad silencer, domain speed memory, and tools micro-actions.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  let _automations = {
    auto_pause_new_tab: false,
    auto_ad_silencer: false,
    domain_speed_memory: false
  };

  let _onAutomationChange = null;

  function initSmartAutomations(options = {}) {
    if (typeof document === 'undefined') return;

    if (typeof options.onAutomationChange === 'function') {
      _onAutomationChange = options.onAutomationChange;
    }

    const tAutoPause = document.getElementById('toggleAutoPauseNewTab');
    const tAdSilencer = document.getElementById('toggleAutoAdSilencer');
    const tDomainSpeed = document.getElementById('toggleDomainSpeedMemory');

    if (tAutoPause) {
      tAutoPause.addEventListener('change', (e) => {
        saveAutomationSetting('auto_pause_new_tab', Boolean(e.target.checked));
      });
    }

    if (tAdSilencer) {
      tAdSilencer.addEventListener('change', (e) => {
        saveAutomationSetting('auto_ad_silencer', Boolean(e.target.checked));
      });
    }

    if (tDomainSpeed) {
      tDomainSpeed.addEventListener('change', (e) => {
        saveAutomationSetting('domain_speed_memory', Boolean(e.target.checked));
      });
    }
  }

  function hydrateSmartAutomations(storedSettings = {}) {
    if (storedSettings && typeof storedSettings === 'object') {
      Object.assign(_automations, storedSettings);
    }

    if (typeof document === 'undefined') return _automations;

    const tAutoPause = document.getElementById('toggleAutoPauseNewTab');
    const tAdSilencer = document.getElementById('toggleAutoAdSilencer');
    const tDomainSpeed = document.getElementById('toggleDomainSpeedMemory');

    if (tAutoPause && typeof _automations.auto_pause_new_tab === 'boolean') {
      tAutoPause.checked = _automations.auto_pause_new_tab;
    }
    if (tAdSilencer && typeof _automations.auto_ad_silencer === 'boolean') {
      tAdSilencer.checked = _automations.auto_ad_silencer;
    }
    if (tDomainSpeed && typeof _automations.domain_speed_memory === 'boolean') {
      tDomainSpeed.checked = _automations.domain_speed_memory;
    }

    return _automations;
  }

  function saveAutomationSetting(key, val) {
    _automations[key] = val;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['smart_automations'], (res) => {
        const cur = res && res.smart_automations ? res.smart_automations : {};
        cur[key] = val;
        chrome.storage.local.set({ smart_automations: cur });
      });
    }
    if (_onAutomationChange) {
      try { _onAutomationChange(key, val, _automations); } catch (_) {}
    }
  }

  function getAutomationState() {
    return Object.assign({}, _automations);
  }

  const TabAutomations = {
    initSmartAutomations,
    hydrateSmartAutomations,
    saveAutomationSetting,
    getAutomationState
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabAutomations;
  }
  global.TabAutomations = TabAutomations;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
