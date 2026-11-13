/**
 * Web Activity & Media Sentinel - Core Contracts
 */
(function (global) {
  'use strict';
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../shared/contracts.js')
    : global.SharedContracts;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shared;
  }
  global.CoreContracts = Shared;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
