/**
 * Web Activity & Media Sentinel - Message Router Subsystem
 * Clean chrome.runtime.onMessage dispatch table and IPC action routing.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Creates a message router instance with registration and execution dispatch.
   * 
   * @param {object} [context={}] Initial handler map or execution context
   * @returns {object} Router instance
   */
  function createMessageRouter(context = {}) {
    const handlers = Object.assign({}, context.handlers || {});

    function registerHandler(type, handlerFn) {
      if (typeof type === 'string' && typeof handlerFn === 'function') {
        handlers[type] = handlerFn;
      }
    }

    function registerHandlers(handlerMap) {
      if (handlerMap && typeof handlerMap === 'object') {
        for (const [key, fn] of Object.entries(handlerMap)) {
          registerHandler(key, fn);
        }
      }
    }

    function routeMessage(message, sender, sendResponse) {
      if (!message || (!message.type && !message.action)) {
        return false;
      }
      const msgType = message.action || message.type;
      const handler = handlers[msgType];

      if (typeof handler === 'function') {
        const result = handler(message, sender, sendResponse);
        return result === true;
      }
      return false;
    }

    return {
      registerHandler,
      registerHandlers,
      routeMessage,
      getHandlers: () => ({ ...handlers })
    };
  }

  const MessageRouter = Object.freeze({
    createMessageRouter
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageRouter;
  }
  global.MessageRouter = MessageRouter;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
