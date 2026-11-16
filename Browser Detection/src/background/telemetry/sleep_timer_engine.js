/**
 * Web Activity & Media Sentinel - Sleep Timer Engine Subsystem
 * State machine calculations, fade volume interpolation, alarm schedules, and badge formatters.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Calculates linear audio fade volume multiplier based on remaining seconds.
   * 
   * @param {number} secondsRemaining 
   * @param {number} fadeDurationSeconds 
   * @returns {number} Float between 0.0 and 1.0
   */
  function calculateSleepFadeVolume(secondsRemaining, fadeDurationSeconds = 30) {
    if (secondsRemaining <= 0) return 0;
    if (secondsRemaining >= fadeDurationSeconds) return 1.0;
    const ratio = secondsRemaining / fadeDurationSeconds;
    return Math.max(0, Math.min(1.0, Math.round(ratio * 100) / 100));
  }

  /**
   * Constructs a RUNNING sleep timer state object.
   * 
   * @param {number} durationMinutes
   * @param {object} [options]
   * @returns {object}
   */
  function createRunningTimerState(durationMinutes, options = {}) {
    const mins = Math.max(1, Number(durationMinutes) || 30);
    const durationMs = Math.round(mins * 60 * 1000);
    const now = Date.now();

    return {
      state: 'RUNNING',
      durationMinutes: mins,
      durationMs,
      startTime: now,
      targetTime: now + durationMs,
      pauseMedia: options.pauseMedia !== undefined ? !!options.pauseMedia : true,
      pauseTracking: options.pauseTracking !== undefined ? !!options.pauseTracking : true,
      enableFadeOut: options.enableFadeOut !== undefined ? !!options.enableFadeOut : true,
      fadeDurationSeconds: Number(options.fadeDurationSeconds) || 30,
      lastUpdated: now
    };
  }

  /**
   * Constructs an IDLE or CANCELLED sleep timer state object.
   * 
   * @param {object} initialState
   * @param {string} [stateName='IDLE']
   * @returns {object}
   */
  function createIdleTimerState(initialState, stateName = 'IDLE') {
    return Object.assign({}, initialState, {
      state: stateName,
      durationMinutes: 0,
      durationMs: 0,
      startTime: 0,
      targetTime: 0,
      lastUpdated: Date.now()
    });
  }

  /**
   * Computes dynamic hex color between emerald green, amber yellow, and red based on remaining time ratio.
   * 
   * @param {number} remainingMs
   * @param {number} totalDurationMs
   * @returns {string} Hex color string
   */
  function calculateTimerColor(remainingMs, totalDurationMs) {
    if (totalDurationMs <= 0 || remainingMs <= 0) return '#ef4444';
    const ratio = Math.max(0, Math.min(1, remainingMs / totalDurationMs));

    if (ratio > 0.5) {
      // Emerald (#10b981) to Amber (#f59e0b)
      const t = (ratio - 0.5) * 2;
      const r = Math.round(16 + (245 - 16) * (1 - t));
      const g = Math.round(185 + (158 - 185) * (1 - t));
      const b = Math.round(129 + (11 - 129) * (1 - t));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } else {
      // Amber (#f59e0b) to Red (#ef4444)
      const t = ratio * 2;
      const r = Math.round(239 + (245 - 239) * t);
      const g = Math.round(68 + (158 - 68) * t);
      const b = Math.round(68 + (11 - 68) * t);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }

  /**
   * Formats remaining milliseconds into compact badge text (e.g. '15m' or '45s').
   * 
   * @param {number} remainingMs
   * @returns {string}
   */
  function formatBadgeText(remainingMs) {
    if (remainingMs <= 0) return '';
    const totalSec = Math.ceil(remainingMs / 1000);
    if (totalSec >= 60) {
      return `${Math.ceil(totalSec / 60)}m`;
    }
    return `${totalSec}s`;
  }

  const SleepTimerEngine = Object.freeze({
    calculateSleepFadeVolume,
    createRunningTimerState,
    createIdleTimerState,
    calculateTimerColor,
    formatBadgeText
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepTimerEngine;
  }
  global.SleepTimerEngine = SleepTimerEngine;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
