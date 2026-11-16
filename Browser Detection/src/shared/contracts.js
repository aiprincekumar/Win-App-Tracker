/**
 * Web Activity & Media Sentinel - Shared Contracts
 * IPC Action types, storage keys, and protocol definitions.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const ACTIONS = Object.freeze({
    // State & Reconnection
    QUERY_STATE: 'QUERY_STATE',
    RECONNECT_WS: 'RECONNECT_WS',
    QUERY_DATA_HUB: 'QUERY_DATA_HUB',
    DATA_HUB_STATUS_CHANGED: 'DATA_HUB_STATUS_CHANGED',

    // Media Telemetry & Controls
    MEDIA_TELEMETRY: 'MEDIA_TELEMETRY',
    MEDIA_TELEMETRY_UPDATE: 'MEDIA_TELEMETRY_UPDATE',
    MEDIA_STATE_CHANGED: 'MEDIA_STATE_CHANGED',
    QUERY_PAGE_MEDIA: 'QUERY_PAGE_MEDIA',
    MEDIA_CONTROL: 'MEDIA_CONTROL',
    SET_VOLUME: 'SET_VOLUME',
    SET_MEDIA_VOLUME: 'SET_MEDIA_VOLUME',
    TOGGLE_PLAYBACK: 'TOGGLE_PLAYBACK',
    JUMP_TO_MEDIA_TAB: 'JUMP_TO_MEDIA_TAB',

    // Time Tracking & Modes
    TIME_TRACKING_DELTA: 'TIME_TRACKING_DELTA',
    SWITCH_TRACKING_MODE: 'SWITCH_TRACKING_MODE',

    // Sleep Timer
    SET_SLEEP_TIMER: 'SET_SLEEP_TIMER',
    CANCEL_SLEEP_TIMER: 'CANCEL_SLEEP_TIMER',
    GET_SLEEP_TIMER_STATE: 'GET_SLEEP_TIMER_STATE',
    SAVE_SLEEP_TIMER_SETTINGS: 'SAVE_SLEEP_TIMER_SETTINGS',

    // Data Management
    CLEAR_DATA: 'CLEAR_DATA',
    RESET_SETTINGS: 'RESET_SETTINGS',
    GET_HISTORY: 'GET_HISTORY',
    EXPORT_DATA: 'EXPORT_DATA',

    // Data Hub Protocol Actions
    REGISTER_CLIENT: 'REGISTER_CLIENT',
    REGISTER_RESPONSE: 'REGISTER_RESPONSE',
    SYNC_ACTIVITY_DELTA: 'SYNC_ACTIVITY_DELTA',
    HEARTBEAT: 'HEARTBEAT',
    ANALYTICS_RESPONSE: 'ANALYTICS_RESPONSE',
    LIVE_STATE_RESPONSE: 'LIVE_STATE_RESPONSE',

    // Fullscreen controller action
    FULLSCREEN_ACTION: '__MEDIA_SENTINEL_ACTION__'
  });

  const STORAGE_KEYS = Object.freeze({
    ACTIVITY_DATA: 'media_sentinel_activity_data',
    MEDIA_HISTORY: 'media_sentinel_media_history',
    SETTINGS: 'media_sentinel_settings',
    OFFLINE_QUEUE: 'media_sentinel_offline_queue',
    CLIENT_ID: 'media_sentinel_client_id',
    SLEEP_TIMER_STATE: 'media_sentinel_sleep_timer_state',
    SLEEP_TIMER_SETTINGS: 'media_sentinel_sleep_timer_settings',
    SELECTED_BROWSER_FILTER: 'selected_browser_filter',
    ACTIVE_TAB: 'active_popup_tab',
    TRACKING_MODE: 'tracking_mode'
  });

  const SharedContracts = Object.freeze({
    ACTIONS,
    STORAGE_KEYS
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedContracts;
  }
  global.SharedContracts = SharedContracts;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
