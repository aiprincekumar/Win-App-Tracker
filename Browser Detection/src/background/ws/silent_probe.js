/**
 * Web Activity & Media Sentinel - Silent Port Probe Subsystem
 * Pre-flight HTTP probe before raw WebSocket creation to eliminate Chromium
 * C++ net::ERR_CONNECTION_REFUSED badges and console spam on chrome://extensions.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Silently tests whether a target HTTP or WebSocket port is actively listening.
   * Converts ws:// and wss:// URLs to http:// and https:// before testing.
   * 
   * In non-browser environments where fetch is unavailable (e.g. Node.js unit tests),
   * returns true so mock WebSocket tests proceed without obstruction.
   * 
   * @param {string} url Target URL (e.g. ws://127.0.0.1:65432 or ws://127.0.0.1:65433)
   * @param {number} timeoutMs Probe timeout in milliseconds
   * @returns {Promise<boolean>}
   */
  async function probePortLive(url, timeoutMs = 800) {
    if (!url || typeof url !== 'string') return false;

    if (typeof fetch !== 'function') {
      // In Node.js testing environments without global fetch, return true to allow mock WebSocket execution
      return true;
    }

    try {
      const httpUrl = url.replace(/^ws:/i, 'http:').replace(/^wss:/i, 'https:');
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
      const options = {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store'
      };
      if (controller) {
        options.signal = controller.signal;
      }
      const res = await fetch(httpUrl, options).catch(() => null);
      if (timer) clearTimeout(timer);
      return res !== null;
    } catch (_) {
      return false;
    }
  }

  const SilentProbe = Object.freeze({
    probePortLive
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SilentProbe;
  }
  global.SilentProbe = SilentProbe;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
