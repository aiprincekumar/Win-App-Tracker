/**
 * Web Activity & Media Sentinel - Delta Streamer Subsystem
 * Streams time tracking deltas and media session changes to Data Hub.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function createActivityDelta(clientId, browser, domain, seconds, category, dateStr) {
    return {
      type: 'DELTA_ACTIVITY',
      clientId,
      browser,
      domain,
      seconds: Math.round(seconds),
      category: category || 'website',
      date: dateStr,
      timestamp: Date.now()
    };
  }

  function createMediaUpdate(clientId, browser, mediaData) {
    return {
      type: 'MEDIA_SESSION_UPDATE',
      clientId,
      browser,
      media: Object.assign({}, mediaData),
      timestamp: Date.now()
    };
  }

  const DeltaStreamer = {
    createActivityDelta,
    createMediaUpdate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeltaStreamer;
  }
  global.DeltaStreamer = DeltaStreamer;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
