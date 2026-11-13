/**
 * Web Activity & Media Sentinel - Main World Event Bridge
 * Receives __MEDIA_SENTINEL_ACTION__ CustomEvents from isolated world and executes player commands.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function createActionDispatcher(context = {}) {
    const executedActions = new Set();
    const actionCooldowns = new Map();

    function handleActionEvent(e) {
      if (!e || !e.detail) return;
      const { actionId, action, data } = e.detail;

      if (actionId) {
        if (executedActions.has(actionId)) return;
        executedActions.add(actionId);
        if (executedActions.size > 200) {
          const first = executedActions.values().next().value;
          executedActions.delete(first);
        }
      }

      const now = Date.now();
      const last = actionCooldowns.get(action) || 0;
      let cooldownMs = 250;
      if (action === 'seek_percent' || action === 'set_volume' || action === 'SET_VOLUME') {
        cooldownMs = 50;
      } else if (action === 'toggle_theater' || action === 'toggle_fullscreen') {
        cooldownMs = 350;
      }

      if (now - last < cooldownMs) {
        return;
      }
      actionCooldowns.set(action, now);

      if (typeof context.executeAction === 'function') {
        context.executeAction(action, data);
      }
    }

    return {
      handleActionEvent,
      getExecutedActions: () => executedActions
    };
  }

  const MainBridge = {
    createActionDispatcher
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainBridge;
  }
  global.MainBridge = MainBridge;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
