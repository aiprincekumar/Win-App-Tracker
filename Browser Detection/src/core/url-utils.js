/**
 * Web Activity & Media Sentinel - Core URL Utilities
 */
(function (global) {
  'use strict';
  const Shared = (typeof module !== 'undefined' && module.exports)
    ? require('../shared/formatters.js')
    : global.SharedFormatters;

  const UrlUtils = Object.freeze({
    extractDomain: Shared.extractDomain,
    isInternalDomain: Shared.isInternalDomain,
    getFaviconUrl: Shared.getFaviconUrl
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UrlUtils;
  }
  global.UrlUtils = UrlUtils;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
