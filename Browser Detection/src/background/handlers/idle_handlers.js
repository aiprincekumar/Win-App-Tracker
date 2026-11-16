/**
 * Web Activity & Media Sentinel - Idle Handlers Subsystem
 * Encapsulates chrome.idle state changes (active, idle, locked) and counter freezing.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Creates an idle state change handler bound to the provided context.
   * 
   * @param {object} context Execution context
   * @returns {function(string): void}
   */
  function createIdleHandler(context) {
    const {
      state,
      commitActiveInterval,
      saveStorageData,
      sendActivityUpdateToHUD,
      onUserActive,
      onUserIdle
    } = context;

    return function handleIdleStateChanged(newState) {
      if (newState === 'active') {
        if (state) {
          state.isUserActive = true;
          state.intervalStartTime = Date.now();
        }
        if (typeof onUserActive === 'function') {
          onUserActive();
        }
      } else if (newState === 'idle' || newState === 'locked') {
        if (typeof commitActiveInterval === 'function') {
          commitActiveInterval();
        }
        if (state) {
          state.isUserActive = false;
        }
        if (typeof saveStorageData === 'function') {
          saveStorageData();
        }
        if (typeof sendActivityUpdateToHUD === 'function') {
          sendActivityUpdateToHUD();
        }
        if (typeof onUserIdle === 'function') {
          onUserIdle(newState);
        }
      }
    };
  }

  const IdleHandlers = Object.freeze({
    createIdleHandler
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IdleHandlers;
  }
  global.IdleHandlers = IdleHandlers;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
