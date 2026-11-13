/**
 * Web Activity & Media Sentinel - Shared Constants
 * Single Source of Truth for timing, configuration, and speed ladders.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const CONFIG = Object.freeze({
    WS_URL: 'ws://127.0.0.1:65432', // Video Detector HUD port (idle sentinel & overlays)
    DATA_HUB_URL: 'ws://127.0.0.1:65433', // Standalone SQLite Data Hub daemon port
    STORAGE_KEY: 'media_sentinel_activity_data',
    MEDIA_HISTORY_STORAGE_KEY: 'media_sentinel_media_history',
    SETTINGS_STORAGE_KEY: 'media_sentinel_settings',
    OFFLINE_QUEUE_STORAGE_KEY: 'media_sentinel_offline_queue',
    CLIENT_ID_STORAGE_KEY: 'media_sentinel_client_id',
    IDLE_THRESHOLD_SECONDS: 60,
    FLUSH_INTERVAL_MINUTES: 1,
    RECONNECT_INITIAL_MS: 5000,
    RECONNECT_MAX_MS: 120000,
    WS_RECONNECT_LADDER_MS: Object.freeze([5000, 15000, 30000, 60000, 120000]),
    HUB_RECONNECT_LADDER_MS: Object.freeze([5000, 15000, 30000, 60000, 120000]),
    MAX_CONSECUTIVE_FAILURES: 3,
    MAX_MEDIA_HISTORY: 500,
    DELTA_BATCH_INTERVAL_MS: 5000
  });

  const SPEED_LADDER = Object.freeze([0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0]);

  const DEFAULT_SLEEP_SETTINGS = Object.freeze({
    defaultDurationMinutes: 30,
    enableAudioFadeOut: true,
    fadeDurationSeconds: 30,
    enableInactivityAutoSleep: false,
    inactivityThresholdMinutes: 15,
    showBadgeCountdown: true,
    pulseOnCritical: true
  });

  const INITIAL_SLEEP_TIMER_STATE = Object.freeze({
    state: 'IDLE', // 'IDLE' | 'RUNNING' | 'PAUSED' | 'FADING' | 'TRIGGERED' | 'CANCELLED'
    durationMinutes: 0,
    durationMs: 0,
    startTime: 0,
    targetTime: 0,
    pauseMedia: true,
    pauseTracking: true,
    enableFadeOut: true,
    fadeDurationSeconds: 30,
    lastUpdated: 0
  });

  const SLEEP_ALARM_NAME = 'sentinel_sleep_timer_alarm';
  const SLEEP_FADE_ALARM_NAME = 'sentinel_sleep_fade_alarm';

  const SharedConstants = Object.freeze({
    CONFIG,
    SPEED_LADDER,
    DEFAULT_SLEEP_SETTINGS,
    INITIAL_SLEEP_TIMER_STATE,
    SLEEP_ALARM_NAME,
    SLEEP_FADE_ALARM_NAME
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedConstants;
  }
  global.SharedConstants = SharedConstants;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
