/**
 * Web Activity & Media Sentinel - Popup Data Hub Service
 * Coordinates SQLite Data Hub multi-browser analytics queries.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const IPC = (typeof module !== 'undefined' && module.exports)
    ? require('./ipc_service.js')
    : (global.IPCService || {});

  async function queryAnalytics(params = {}) {
    const message = {
      type: 'QUERY_DATA_HUB',
      query: 'ANALYTICS',
      browser: params.browser || 'all',
      tracking_mode: params.tracking_mode || 'all',
      date: params.date || new Date().toISOString().split('T')[0]
    };

    if (IPC.sendMessage) {
      return await IPC.sendMessage(message);
    }
    return { success: false, offlineFallback: true };
  }

  const DataHubService = {
    queryAnalytics
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataHubService;
  }
  global.DataHubService = DataHubService;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
