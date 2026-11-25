/**
 * Web Activity & Media Sentinel - Popup Data Hub Service
 * Coordinates SQLite Data Hub multi-browser analytics queries and domain breakdown processing.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function getFaviconUrl(domain) {
    if (!domain) return '';
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
  }

  function queryAnalytics(params = {}) {
    const api = typeof browser !== 'undefined' && browser.runtime ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.runtime || !api.runtime.sendMessage) {
      return Promise.resolve({ success: false, offlineFallback: true });
    }

    const message = {
      type: 'QUERY_DATA_HUB',
      query: 'ANALYTICS',
      browser: params.browser || 'all',
      tracking_mode: params.tracking_mode || 'all',
      date: params.date || new Date().toISOString().split('T')[0]
    };

    return new Promise((resolve) => {
      try {
        const p = api.runtime.sendMessage(message, (res) => {
          let err = null;
          try { err = api.runtime ? api.runtime.lastError : null; } catch (_) {}
          if (err || !res) {
            resolve({ success: false, offlineFallback: true });
          } else {
            resolve(res);
          }
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {
        resolve({ success: false, offlineFallback: true });
      }
    });
  }

  function updateBrowserFilterOptions(registeredBrowsers = []) {
    if (typeof document === 'undefined') return;
    const select = document.getElementById('browserFilterSelect');
    if (!select || !Array.isArray(registeredBrowsers)) return;

    registeredBrowsers.forEach(browserName => {
      const bLower = String(browserName).toLowerCase();
      let exists = false;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === bLower) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const opt = document.createElement('option');
        opt.value = bLower;
        opt.textContent = browserName.charAt(0).toUpperCase() + browserName.slice(1);
        select.appendChild(opt);
      }
    });
  }

  function renderStatsPills(todaySecs, dailySecs, sessionCount) {
    if (typeof document === 'undefined') return;
    const pToday = document.getElementById('pillTodayTime');
    const pDaily = document.getElementById('pillDailyAvg');
    const pSessions = document.getElementById('pillTotalSessions');

    function formatDur(seconds) {
      const s = Math.max(0, Math.floor(seconds || 0));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    }

    if (pToday) pToday.textContent = formatDur(todaySecs);
    if (pDaily) pDaily.textContent = formatDur(dailySecs);
    if (pSessions) pSessions.textContent = String(sessionCount || 0);
  }

  function processDomainStats(sqliteData, localData, activeFilter = 'all', temporalTab = 'today') {
    if (sqliteData && sqliteData.domain_distribution && Array.isArray(sqliteData.domain_distribution) && sqliteData.domain_distribution.length > 0) {
      let totalSecs = (temporalTab === 'today')
        ? (sqliteData.today_seconds || 0)
        : (temporalTab === 'daily')
          ? (sqliteData.daily_average_seconds || 0)
          : (sqliteData.total_seconds || 0);

      const domains = sqliteData.domain_distribution.map(d => ({
        domain: d.domain,
        seconds: d.seconds || 0,
        sessionCount: d.session_count || 1,
        lastActive: d.last_active || 0,
        percent: d.percent || 0
      }));

      return {
        totalSeconds: totalSecs,
        domains,
        isOfflineFallback: false
      };
    }

    // Offline fallback from local storage
    if (localData && localData.activityData && localData.activityData.domains) {
      const rawDomains = localData.activityData.domains;
      const todayStr = localData.todayStr || new Date().toISOString().split('T')[0];
      const domainList = [];
      let totalSecs = 0;

      Object.keys(rawDomains).forEach(dom => {
        const item = rawDomains[dom];
        let secs = 0;
        let sessions = item.sessionCount || 1;

        if (temporalTab === 'today') {
          if (item.days && item.days[todayStr]) {
            secs = item.days[todayStr].seconds || 0;
            sessions = item.days[todayStr].sessions || sessions;
          }
        } else {
          secs = item.totalSeconds || 0;
        }

        if (secs > 0) {
          totalSecs += secs;
          domainList.push({
            domain: dom,
            seconds: secs,
            sessionCount: sessions,
            lastActive: item.lastActive || 0
          });
        }
      });

      domainList.sort((a, b) => b.seconds - a.seconds);
      domainList.forEach(d => {
        d.percent = totalSecs > 0 ? ((d.seconds / totalSecs) * 100) : 0;
      });

      return {
        totalSeconds: totalSecs,
        domains: domainList,
        isOfflineFallback: true
      };
    }

    return { totalSeconds: 0, domains: [], isOfflineFallback: true };
  }

  const DataHubService = {
    getFaviconUrl,
    queryAnalytics,
    updateBrowserFilterOptions,
    renderStatsPills,
    processDomainStats
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataHubService;
  }
  global.DataHubService = DataHubService;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
