/**
 * Web Activity & Media Sentinel - Core Math Utilities
 * Speed stepping, bounds clamping, and number formatting.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const SPEED_LADDER = [0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0];

  function calculateNextLadderSpeed(currentSpeed, direction) {
    const cur = (typeof currentSpeed === 'number' && !isNaN(currentSpeed) && currentSpeed > 0)
      ? Math.round(currentSpeed * 100) / 100
      : 1.0;

    let closestIdx = 3; // default 1.0
    let minDiff = Infinity;
    for (let i = 0; i < SPEED_LADDER.length; i++) {
      const diff = Math.abs(SPEED_LADDER[i] - cur);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    let nextIdx;
    if (direction === 'down' || direction === -1) {
      nextIdx = Math.max(0, closestIdx - 1);
    } else {
      nextIdx = Math.min(SPEED_LADDER.length - 1, closestIdx + 1);
    }
    return SPEED_LADDER[nextIdx];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roundToDecimals(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  const MathUtils = Object.freeze({
    SPEED_LADDER,
    calculateNextLadderSpeed,
    clamp,
    roundToDecimals
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
  }
  global.MathUtils = MathUtils;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
