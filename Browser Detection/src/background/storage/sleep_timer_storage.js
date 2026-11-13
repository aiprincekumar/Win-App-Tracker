/**
 * Web Activity & Media Sentinel - Sleep Timer Storage Subsystem
 * Persistence and retrieval for sleep timer state machine & user preferences.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Contracts = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/contracts.js')
    : (global.SharedContracts || {});

  const STORAGE_KEYS = Contracts.STORAGE_KEYS || {
    SLEEP_TIMER_STATE: 'media_sentinel_sleep_timer_state',
    SLEEP_TIMER_SETTINGS: 'media_sentinel_sleep_timer_settings'
  };

  async function loadSleepTimerData(storageApi, defaultState, defaultSettings) {
    const storage = storageApi || (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local);
    if (!storage) {
      return { state: { ...defaultState }, settings: { ...defaultSettings } };
    }

    return new Promise((resolve) => {
      storage.get([STORAGE_KEYS.SLEEP_TIMER_STATE, STORAGE_KEYS.SLEEP_TIMER_SETTINGS], (items) => {
        let timerState = { ...defaultState };
        let timerSettings = { ...defaultSettings };
        if (items && items[STORAGE_KEYS.SLEEP_TIMER_STATE]) {
          timerState = Object.assign({}, defaultState, items[STORAGE_KEYS.SLEEP_TIMER_STATE]);
        }
        if (items && items[STORAGE_KEYS.SLEEP_TIMER_SETTINGS]) {
          timerSettings = Object.assign({}, defaultSettings, items[STORAGE_KEYS.SLEEP_TIMER_SETTINGS]);
        }
        resolve({ state: timerState, settings: timerSettings });
      });
    });
  }

  async function saveSleepTimerState(storageApi, timerState) {
    const storage = storageApi || (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local);
    if (!storage) return;
    return new Promise((resolve) => {
      storage.set({ [STORAGE_KEYS.SLEEP_TIMER_STATE]: timerState }, resolve);
    });
  }

  async function saveSleepTimerSettings(storageApi, timerSettings) {
    const storage = storageApi || (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local);
    if (!storage) return;
    return new Promise((resolve) => {
      storage.set({ [STORAGE_KEYS.SLEEP_TIMER_SETTINGS]: timerSettings }, resolve);
    });
  }

  const SleepTimerStorage = {
    loadSleepTimerData,
    saveSleepTimerState,
    saveSleepTimerSettings
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepTimerStorage;
  }
  global.SleepTimerStorage = SleepTimerStorage;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
