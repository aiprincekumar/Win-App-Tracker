/**
 * Web Activity & Media Sentinel - Reconnect Ladder Subsystem
 * Exponential backoff ladder calculations.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const DEFAULT_LADDER = [5000, 15000, 30000, 60000, 120000];

  function getNextReconnectDelay(currentIndex, ladder = DEFAULT_LADDER) {
    const list = Array.isArray(ladder) && ladder.length > 0 ? ladder : DEFAULT_LADDER;
    const idx = Math.min(Math.max(0, currentIndex), list.length - 1);
    return list[idx];
  }

  const ReconnectLadder = {
    DEFAULT_LADDER,
    getNextReconnectDelay
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReconnectLadder;
  }
  global.ReconnectLadder = ReconnectLadder;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
