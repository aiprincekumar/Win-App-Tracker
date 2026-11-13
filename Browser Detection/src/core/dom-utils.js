/**
 * Web Activity & Media Sentinel - Core DOM Utilities
 */
(function (global) {
  'use strict';
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../shared/dom_utils.js')
    : global.SharedDOMUtils;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shared;
  }
  global.DomUtils = Shared;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
