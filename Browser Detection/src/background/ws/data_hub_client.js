/**
 * Web Activity & Media Sentinel - Standalone Data Hub Client
 * WebSocket client for local SQLite Data Hub on ws://127.0.0.1:65433.
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
    DATA_HUB_URL: 'ws://127.0.0.1:65433',
    HUB_RECONNECT_LADDER_MS: [5000, 15000, 30000, 60000, 120000]
  };

  let socket = null;
  let isConnected = false;
  let isRegistered = false;
  let reconnectTimer = null;
  let reconnectIndex = 0;
  let failureCount = 0;
  let reconnectPaused = false;
  let lastAttemptTime = 0;
  const pendingQueries = new Map();

  function isHubConnected() {
    return isConnected && isRegistered;
  }

  function sendRaw(payload) {
    if (!socket || socket.readyState !== (typeof WebSocket !== 'undefined' ? WebSocket.OPEN : 1)) {
      return false;
    }
    try {
      socket.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  function queryDataHub(type, params, timeoutMs = 4000) {
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

      pendingQueries.set(queryId, { resolve, reject, timer });

      const sent = sendRaw({
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

  const DataHubClient = {
    isHubConnected,
    sendRaw,
    queryDataHub,
    getPendingQueries: () => pendingQueries
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataHubClient;
  }
  global.DataHubClient = DataHubClient;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
