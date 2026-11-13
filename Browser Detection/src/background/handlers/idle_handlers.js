/**
 * Web Activity & Media Sentinel - Idle Handlers Subsystem
 * Encapsulates chrome.idle state changes (active, idle, locked).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function createIdleHandler(context) {
    const { onUserActive, onUserIdle } = context;

    return function handleIdleStateChanged(newState) {
      if (newState === 'active') {
        if (typeof onUserActive === 'function') onUserActive();
      } else if (newState === 'idle' || newState === 'locked') {
        if (typeof onUserIdle === 'function') onUserIdle(newState);
      }
    };
  }

  const IdleHandlers = {
    createIdleHandler
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IdleHandlers;
  }
  global.IdleHandlers = IdleHandlers;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
