/**
 * Web Activity & Media Sentinel - Multi-Browser Filter Subsystem
 * Coordinates browser dropdown filtering across Chrome, Edge, Firefox, Brave, and Opera.
 * Handles domain search query filtering, category classification, and offline status annotations.
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
      return records || [];
    }
    const target = browser.toLowerCase();
    return records.filter((r) => r.browser && r.browser.toLowerCase() === target);
  }

  function filterDomainsBySearch(items, query) {
    if (!Array.isArray(items)) return [];
    const q = (query || '').toLowerCase().trim();
    if (!q) return items;
    return items.filter((it) => it && it.domain && it.domain.toLowerCase().includes(q));
  }

  function filterByCategory(items, category, isInternalFn) {
    if (!Array.isArray(items) || !category || category === 'all') return items || [];
    const checkInternal = typeof isInternalFn === 'function' ? isInternalFn : () => false;
    return items.filter((it) => {
      const isInternal = Boolean(it.isInternal || checkInternal(it.domain));
      if (category === 'web') return !isInternal;
      if (category === 'internal') return isInternal;
      return true;
    });
  }

  function sortDomains(items, sortMode = 'time_desc') {
    if (!Array.isArray(items)) return [];
    const copy = items.slice();
    switch (sortMode) {
      case 'time_asc':
        copy.sort((a, b) => (a.computedSeconds || 0) - (b.computedSeconds || 0));
        break;
      case 'sessions_desc':
        copy.sort((a, b) => (b.sessions || 0) - (a.sessions || 0));
        break;
      case 'name_asc':
        copy.sort((a, b) => String(a.domain || '').localeCompare(String(b.domain || '')));
        break;
      case 'time_desc':
      default:
        copy.sort((a, b) => (b.computedSeconds || 0) - (a.computedSeconds || 0));
        break;
    }
    return copy;
  }

  function annotateBrowserOptionsForOffline(selectEl, isConnected, detectedBrowser = 'chrome') {
    if (!selectEl || !selectEl.options) return;
    for (let i = 0; i < selectEl.options.length; i++) {
      const opt = selectEl.options[i];
      const cleanText = opt.text.replace(/\s*\[Hub Offline\]/g, '').trim();
      if (!isConnected) {
        if (opt.value !== 'all' && opt.value !== 'chrome' && opt.value !== detectedBrowser) {
          opt.text = `${cleanText} [Hub Offline]`;
        } else {
          opt.text = cleanText;
        }
      } else {
        opt.text = cleanText;
      }
    }
  }

  const BrowserFilter = {
    BROWSER_OPTIONS,
    getBrowserOptions,
    filterRecordsByBrowser,
    filterDomainsBySearch,
    filterByCategory,
    sortDomains,
    annotateBrowserOptionsForOffline
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserFilter;
  }
  global.BrowserFilter = BrowserFilter;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
