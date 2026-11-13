/**
 * Web Activity & Media Sentinel - Message Router Subsystem
 * Dispatches chrome.runtime.onMessage requests to domain services.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function createMessageRouter(context) {
    const handlers = context.handlers || {};

    return function routeMessage(message, sender, sendResponse) {
      if (!message || !message.type) return false;

      const handler = handlers[message.type];
      if (typeof handler === 'function') {
        const isAsync = handler(message, sender, sendResponse);
        return isAsync === true;
      }
      return false;
    };
  }

  const MessageRouter = {
    createMessageRouter
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageRouter;
  }
  global.MessageRouter = MessageRouter;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
