/**
 * Web Activity & Media Sentinel - Sleep Timer Engine
 * Fade volume ladder calculations, alarm lifecycle, and expiration execution.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function calculateSleepFadeVolume(secondsRemaining, fadeDurationSeconds = 30) {
    if (secondsRemaining <= 0) return 0;
    if (secondsRemaining >= fadeDurationSeconds) return 1.0;
    const ratio = secondsRemaining / fadeDurationSeconds;
    return Math.max(0, Math.min(1.0, Math.round(ratio * 100) / 100));
  }

  function createRunningTimerState(durationMinutes, options = {}) {
    const durationMs = Math.round(durationMinutes * 60 * 1000);
    const now = Date.now();
    return {
      state: 'RUNNING',
      durationMinutes,
      durationMs,
      startTime: now,
      targetTime: now + durationMs,
      pauseMedia: options.pauseMedia !== undefined ? !!options.pauseMedia : true,
      pauseTracking: options.pauseTracking !== undefined ? !!options.pauseTracking : true,
      enableFadeOut: options.enableFadeOut !== undefined ? !!options.enableFadeOut : true,
      fadeDurationSeconds: options.fadeDurationSeconds || 30,
      lastUpdated: now
    };
  }

  function createIdleTimerState(initialState) {
    return Object.assign({}, initialState, {
      state: 'IDLE',
      durationMinutes: 0,
      durationMs: 0,
      startTime: 0,
      targetTime: 0,
      lastUpdated: Date.now()
    });
  }

  const SleepTimerEngine = {
    calculateSleepFadeVolume,
    createRunningTimerState,
    createIdleTimerState
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepTimerEngine;
  }
  global.SleepTimerEngine = SleepTimerEngine;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
