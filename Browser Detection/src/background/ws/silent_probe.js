/**
 * Web Activity & Media Sentinel - Silent Port Probe Subsystem
 * Pre-flight HTTP probe to suppress ERR_CONNECTION_REFUSED on closed ports.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  async function probePortLive(httpUrl, timeoutMs = 800) {
    if (typeof fetch !== 'function') return false;
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
      const res = await fetch(httpUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      return !!res;
    } catch (_) {
      return false;
    }
  }

  const SilentProbe = {
    probePortLive
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SilentProbe;
  }
  global.SilentProbe = SilentProbe;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
