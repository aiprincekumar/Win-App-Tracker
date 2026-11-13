/**
 * Web Activity & Media Sentinel - Core Format Utilities
 */
(function (global) {
  'use strict';
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../shared/formatters.js')
    : global.SharedFormatters;

  const FormatUtils = Object.freeze({
    getTodayDateString: Shared.getTodayDateString,
    formatDuration: Shared.formatDuration
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormatUtils;
  }
  global.FormatUtils = FormatUtils;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
