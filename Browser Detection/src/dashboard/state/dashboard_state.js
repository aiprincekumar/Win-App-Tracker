/**
 * Web Activity & Media Sentinel - Dashboard State Store
 * Manages selected browser filter, active time range, domain query, and analytics dataset.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const state = {
    selectedBrowser: 'all',
    selectedTimeRange: 'today',
    selectedTrackingMode: 'combined',
    selectedCategory: 'all',
    searchQuery: '',
    sortColumn: 'totalSeconds',
    sortAscending: false,
    currentPage: 1,
    pageSize: 15,
    analyticsData: null
  };

  const DashboardState = {
    state,
    get: (k) => state[k],
    set: (k, v) => { state[k] = v; },
    update: (patch) => { Object.assign(state, patch); }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardState;
  }
  global.DashboardState = DashboardState;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
