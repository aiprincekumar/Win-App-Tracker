/**
 * Web Activity & Media Sentinel - Alarm Handlers Subsystem
 * Encapsulates chrome.alarms dispatching for periodic flushes, sleep timer expiration, and sync.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function createAlarmHandler(context) {
    const {
      onStorageFlush,
      onSleepTimerExpire,
      onSleepTimerFadeStep,
      onAudibleSweep
    } = context;

    return async function handleAlarm(alarm) {
      if (!alarm || !alarm.name) return;

      if (alarm.name === 'sentinel_storage_flush_alarm' || alarm.name === 'flush_storage') {
        if (typeof onStorageFlush === 'function') onStorageFlush();
      } else if (alarm.name === 'sentinel_sleep_timer_alarm') {
        if (typeof onSleepTimerExpire === 'function') onSleepTimerExpire();
      } else if (alarm.name === 'sentinel_sleep_fade_alarm') {
        if (typeof onSleepTimerFadeStep === 'function') onSleepTimerFadeStep();
      } else if (alarm.name === 'sentinel_audible_sweep_alarm') {
        if (typeof onAudibleSweep === 'function') onAudibleSweep();
      }
    };
  }

  const AlarmHandlers = {
    createAlarmHandler
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlarmHandlers;
  }
  global.AlarmHandlers = AlarmHandlers;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
