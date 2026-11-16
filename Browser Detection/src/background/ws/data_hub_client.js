/**
 * Web Activity & Media Sentinel - Standalone Data Hub & HUD Client Subsystem
 * WebSocket connection management for Video Detector HUD (port 65432)
 * and Standalone Multi-Browser SQLite Data Hub (port 65433).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const Reconnect = (typeof module !== 'undefined' && module.exports)
    ? require('./reconnect_ladder.js')
    : (global.ReconnectLadder || {});

  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../../shared/constants.js')
    : (global.SharedConstants || {});

  const CONFIG = Shared.CONFIG || {
    HUD_PORT: 65432,
    HUB_PORT: 65433,
    WS_URL: 'ws://127.0.0.1:65432',
    DATA_HUB_URL: 'ws://127.0.0.1:65433',
    WS_RECONNECT_LADDER_MS: [5000, 15000, 30000, 60000, 120000],
    HUB_RECONNECT_LADDER_MS: [5000, 15000, 30000, 60000, 120000],
    MAX_CONSECUTIVE_FAILURES: 3
  };

  // Internal connection states
  let hubSocket = null;
  let hubConnected = false;
  let hubRegistered = false;

  let hudSocket = null;
  let hudConnected = false;

  const pendingQueries = new Map();

  function isHubConnected() {
    return hubConnected && hubRegistered;
  }

  function isHudConnected() {
    return hudConnected && hudSocket !== null && hudSocket.readyState === (typeof WebSocket !== 'undefined' ? WebSocket.OPEN : 1);
  }

  function sendRaw(payload, target = 'hub') {
    const sock = target === 'hud' ? hudSocket : hubSocket;
    if (!sock || sock.readyState !== (typeof WebSocket !== 'undefined' ? WebSocket.OPEN : 1)) {
      return false;
    }
    try {
      sock.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  function sendDataHubMessage(payload) {
    return sendRaw(payload, 'hub');
  }

  function sendHudMessage(payload) {
    return sendRaw(payload, 'hud');
  }

  /**
   * Queries the SQLite Data Hub with a timeout fallback.
   * Returns a promise resolving to the data hub response or offline fallback.
   * 
   * @param {string} type Query type (e.g. 'ANALYTICS', 'LIVE_STATE')
   * @param {object} params Query parameters
   * @param {number} timeoutMs Timeout in milliseconds
   * @returns {Promise<object>}
   */
  function queryDataHub(type, params = {}, timeoutMs = 4000) {
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return new Promise((resolve, reject) => {
      if (!isHubConnected()) {
        resolve({ error: 'Data Hub offline', offlineFallback: true });
        return;
      }

      const timer = setTimeout(() => {
        pendingQueries.delete(queryId);
        resolve({ error: 'Data Hub query timeout', offlineFallback: true });
      }, timeoutMs);

      pendingQueries.set(queryId, { resolve, reject, timer, queryType: type });

      const sent = sendDataHubMessage({
        type: 'QUERY',
        queryId,
        queryType: type,
        params: params || {}
      });

      if (!sent) {
        clearTimeout(timer);
        pendingQueries.delete(queryId);
        resolve({ error: 'Failed to send query', offlineFallback: true });
      }
    });
  }

  function setHubSocket(ws, connected = false, registered = false) {
    hubSocket = ws;
    hubConnected = !!connected;
    hubRegistered = !!registered;
  }

  function setHudSocket(ws, connected = false) {
    hudSocket = ws;
    hudConnected = !!connected;
  }

  const DataHubClient = Object.freeze({
    CONFIG,
    isHubConnected,
    isHudConnected,
    sendRaw,
    sendDataHubMessage,
    sendHudMessage,
    queryDataHub,
    setHubSocket,
    setHudSocket,
    getPendingQueries: () => pendingQueries
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataHubClient;
  }
  global.DataHubClient = DataHubClient;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
