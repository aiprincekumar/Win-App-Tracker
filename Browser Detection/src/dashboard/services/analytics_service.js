/**
 * Web Activity & Media Sentinel - Dashboard Analytics Service
 * Aggregates multi-browser activity logs into domain totals and daily averages.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function aggregateDomainMetrics(records, browserFilter = 'all') {
    if (!Array.isArray(records)) return { items: [], totalSeconds: 0 };

    const map = new Map();
    let grandTotal = 0;

    for (const r of records) {
      if (browserFilter !== 'all' && r.browser && r.browser.toLowerCase() !== browserFilter.toLowerCase()) {
        continue;
      }
      const domain = r.domain || 'unknown';
      const secs = Math.round(Number(r.seconds || r.total_seconds || 0));
      grandTotal += secs;

      if (!map.has(domain)) {
        map.set(domain, {
          domain,
          totalSeconds: 0,
          sessions: 0,
          category: r.category || 'website'
        });
      }
      const rec = map.get(domain);
      rec.totalSeconds += secs;
      rec.sessions += (r.sessions || r.session_count || 1);
    }

    const items = Array.from(map.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);
    return { items, totalSeconds: grandTotal };
  }

  const AnalyticsService = {
    aggregateDomainMetrics
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsService;
  }
  global.AnalyticsService = AnalyticsService;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
