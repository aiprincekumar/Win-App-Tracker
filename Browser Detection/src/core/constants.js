/**
 * Web Activity & Media Sentinel - Core Constants
 */
(function (global) {
  'use strict';
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../shared/constants.js')
    : global.SharedConstants;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shared;
  }
  global.CoreConstants = Shared;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
