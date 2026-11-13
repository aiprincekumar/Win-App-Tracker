/**
 * Web Activity & Media Sentinel - Multi-Browser Filter Subsystem
 * Coordinates browser dropdown filtering across Chrome, Edge, Firefox, and All.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const BROWSER_OPTIONS = Object.freeze([
    { value: 'all', label: 'All Browsers' },
    { value: 'chrome', label: 'Google Chrome' },
    { value: 'edge', label: 'Microsoft Edge' },
    { value: 'firefox', label: 'Mozilla Firefox' },
    { value: 'brave', label: 'Brave Browser' },
    { value: 'opera', label: 'Opera' }
  ]);

  function getBrowserOptions() {
    return BROWSER_OPTIONS;
  }

  function filterRecordsByBrowser(records, browser) {
    if (!Array.isArray(records) || !browser || browser === 'all') {
      return records;
    }
    const target = browser.toLowerCase();
    return records.filter(r => (r.browser && r.browser.toLowerCase() === target));
  }

  const BrowserFilter = {
    BROWSER_OPTIONS,
    getBrowserOptions,
    filterRecordsByBrowser
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserFilter;
  }
  global.BrowserFilter = BrowserFilter;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
