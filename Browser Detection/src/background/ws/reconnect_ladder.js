/**
 * Web Activity & Media Sentinel - Reconnect Ladder Subsystem
 * Throttled exponential backoff calculation and consecutive failure pause logic.
 * 
 * Default ladder: [5000, 15000, 30000, 60000, 120000] ms with max 3 consecutive failures.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const DEFAULT_LADDER = Object.freeze([5000, 15000, 30000, 60000, 120000]);
  const DEFAULT_MAX_FAILURES = 3;

  /**
   * Computes the next delay in milliseconds according to the reconnect ladder.
   * 
   * @param {number} currentIndex Current attempt index
   * @param {Array<number>} [ladder] Optional custom ladder array
   * @returns {number}
   */
  function getNextReconnectDelay(currentIndex, ladder = DEFAULT_LADDER) {
    const list = Array.isArray(ladder) && ladder.length > 0 ? ladder : DEFAULT_LADDER;
    const idx = Math.min(Math.max(0, currentIndex), list.length - 1);
    return list[idx];
  }

  /**
   * Checks whether reconnection should pause after consecutive failures.
   * 
   * @param {number} failureCount Number of consecutive failures encountered
   * @param {number} [maxFailures] Maximum allowable failures before pause
   * @returns {boolean}
   */
  function shouldPauseReconnect(failureCount, maxFailures = DEFAULT_MAX_FAILURES) {
    return (Number(failureCount) || 0) >= (maxFailures || DEFAULT_MAX_FAILURES);
  }

  /**
   * Creates an isolated reconnection state tracker.
   * 
   * @param {Array<number>} [ladder]
   * @param {number} [maxFailures]
   * @returns {object}
   */
  function createReconnectState(ladder = DEFAULT_LADDER, maxFailures = DEFAULT_MAX_FAILURES) {
    const activeLadder = Array.isArray(ladder) && ladder.length > 0 ? Array.from(ladder) : Array.from(DEFAULT_LADDER);
    const limit = maxFailures || DEFAULT_MAX_FAILURES;

    return {
      ladder: activeLadder,
      maxFailures: limit,
      index: 0,
      failureCount: 0,
      isPaused: false,
      timer: null,

      getNextDelay() {
        const delay = getNextReconnectDelay(this.index, this.ladder);
        this.index++;
        return delay;
      },

      recordFailure() {
        this.failureCount++;
        if (this.failureCount >= this.maxFailures) {
          this.isPaused = true;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
        }
        return this.isPaused;
      },

      recordSuccess() {
        this.reset();
      },

      reset() {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.index = 0;
        this.failureCount = 0;
        this.isPaused = false;
      }
    };
  }

  const ReconnectLadder = Object.freeze({
    DEFAULT_LADDER,
    DEFAULT_MAX_FAILURES,
    getNextReconnectDelay,
    shouldPauseReconnect,
    createReconnectState
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReconnectLadder;
  }
  global.ReconnectLadder = ReconnectLadder;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
