/**
 * Web Activity & Media Sentinel - Focus & Tracking Tab Controller
 * Domain distribution statistics, donut chart synchronization, and categories.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function filterDomainsByCategory(items, category) {
    if (!Array.isArray(items) || category === 'all') return items;
    if (category === 'websites') {
      return items.filter(it => !it.isInternal && it.domain !== 'Dashboard' && it.domain !== 'Extension');
    }
    if (category === 'internal') {
      return items.filter(it => it.isInternal || it.domain === 'Dashboard' || it.domain === 'Extension');
    }
    return items;
  }

  const TabTracking = {
    filterDomainsByCategory
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabTracking;
  }
  global.TabTracking = TabTracking;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
