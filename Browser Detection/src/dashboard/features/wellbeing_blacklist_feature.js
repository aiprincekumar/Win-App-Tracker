/**
 * Web Activity & Media Sentinel - Wellbeing Sentinel, Annotations & Blacklist Feature
 * Features 7 & 8: Domain Annotations, Starred/Pinned Domains,
 * Privacy Tracking Exclusion Blacklist Engine with ReDoS Protection,
 * Domain Daily Time Budgets & Alerts,
 * Content Script Doom-Scroll Velocity Guard, and
 * Integrated Pomodoro Focus Sentinel with Synthetic Web Audio Chime.
 * 
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // Constants & Defaults
  const STORAGE_KEY_STARRED = 'starred_domains';
  const STORAGE_KEY_ANNOTATIONS = 'domain_annotations';
  const STORAGE_KEY_BLACKLIST = 'tracking_blacklist';
  const STORAGE_KEY_BUDGETS = 'domain_budgets';
  const STORAGE_KEY_POMODORO = 'sentinel_pomodoro_state';

  const DEFAULT_BLACKLIST_PATTERNS = Object.freeze([
    'localhost',
    'localhost:*',
    '127.0.0.1',
    '127.0.0.1:*',
    '192.168.*',
    '192.168.*:*',
    '10.*.*:*',
    'file://*'
  ]);

  const DEFAULT_POMODORO_SETTINGS = Object.freeze({
    focusDurationSec: 25 * 60,  // 25 minutes
    breakDurationSec: 5 * 60,   // 5 minutes
    autoPauseMedia: true,
    soundChime: true
  });

  // =============================================================================
  // Feature 7: Privacy Tracking Exclusion Blacklist Engine
  // =============================================================================

  /**
   * Compiles a wildcard pattern (e.g. 'localhost:*', '192.168.*:*', '*bank.internal*', '*.corp', 'file://*')
   * into a bounded, safe RegExp with strict ReDoS protection.
   */
  function compileBlacklistRegex(pattern) {
    if (!pattern || typeof pattern !== 'string') return null;
    const trimmed = pattern.trim().toLowerCase();
    if (!trimmed || trimmed.length > 128) return null; // Bounded length protection

    try {
      // Escape regex metacharacters except * and ?
      let escaped = trimmed
        .replace(/[.+^${}()|[\]\\/-]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');

      return new RegExp('^' + escaped + '$', 'i');
    } catch (_) {
      return null;
    }
  }

  /**
   * Tests if a URL string or domain matches any pattern in the blacklist.
   * Checks both raw URL string and extracted hostname/domain.
   */
  function matchesBlacklist(urlOrDomain, patterns) {
    if (!urlOrDomain || !Array.isArray(patterns) || patterns.length === 0) {
      return false;
    }

    const target = String(urlOrDomain).trim().toLowerCase();
    if (!target) return false;

    // Extract hostname / host:port if URL format
    let host = target;
    let hostWithPort = target;
    try {
      if (target.includes('://')) {
        const parsed = new URL(target);
        host = parsed.hostname.toLowerCase();
        hostWithPort = parsed.host.toLowerCase();
      } else if (target.includes(':')) {
        host = target.split(':')[0].toLowerCase();
      }
    } catch (_) {}

    for (let i = 0; i < patterns.length; i++) {
      const p = patterns[i];
      if (!p || typeof p !== 'string') continue;
      const rawPattern = p.trim().toLowerCase();
      if (!rawPattern) continue;

      // Direct exact match
      if (target === rawPattern || host === rawPattern || hostWithPort === rawPattern) {
        return true;
      }

      // If pattern ends with ':*', also match base domain without port
      if (rawPattern.endsWith(':*')) {
        const base = rawPattern.slice(0, -2);
        if (target === base || host === base) {
          return true;
        }
      }

      // Compiled wildcard match
      const rx = compileBlacklistRegex(rawPattern);
      if (rx) {
        if (rx.test(target) || rx.test(host) || rx.test(hostWithPort)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Adds a new pattern to the blacklist array if valid and not duplicate.
   */
  function addBlacklistPattern(patterns, newPattern) {
    const list = Array.isArray(patterns) ? patterns.slice() : [];
    if (!newPattern || typeof newPattern !== 'string') return list;
    const clean = newPattern.trim().toLowerCase();
    if (!clean || clean.length > 128) return list;

    if (!list.includes(clean)) {
      list.push(clean);
    }
    return list;
  }

  /**
   * Removes a pattern from the blacklist array.
   */
  function removeBlacklistPattern(patterns, patternToRemove) {
    if (!Array.isArray(patterns)) return [];
    if (!patternToRemove || typeof patternToRemove !== 'string') return patterns.slice();
    const clean = patternToRemove.trim().toLowerCase();
    return patterns.filter(p => p && p.trim().toLowerCase() !== clean);
  }

  /**
   * Retroactively purges all historical data matching a specific domain or wildcard pattern.
   * Completely removes domain keys from activityData.domains.
   */
  function purgeDomainHistory(activityData, targetDomainOrPattern) {
    if (!activityData || typeof activityData !== 'object' || !activityData.domains) {
      return { purgedDomains: [], count: 0, cleanedData: activityData };
    }

    const domains = activityData.domains;
    const purged = [];
    const pattern = String(targetDomainOrPattern || '').trim().toLowerCase();
    if (!pattern) {
      return { purgedDomains: [], count: 0, cleanedData: activityData };
    }

    const domainKeys = Object.keys(domains);
    domainKeys.forEach(domain => {
      const lowerDomain = domain.toLowerCase();
      let shouldPurge = false;

      if (lowerDomain === pattern) {
        shouldPurge = true;
      } else if (matchesBlacklist(lowerDomain, [pattern])) {
        shouldPurge = true;
      }

      if (shouldPurge) {
        delete domains[domain];
        purged.push(domain);
      }
    });

    return {
      purgedDomains: purged,
      count: purged.length,
      cleanedData: activityData
    };
  }

  // =============================================================================
  // Feature 7: Domain Annotations & Starred / Pinned Domains
  // =============================================================================

  /**
   * Checks if a domain is pinned/starred.
   */
  function isDomainStarred(starredDomains, domain) {
    if (!Array.isArray(starredDomains) || !domain) return false;
    const clean = String(domain).trim().toLowerCase();
    return starredDomains.some(d => String(d).trim().toLowerCase() === clean);
  }

  /**
   * Toggles the starred/pinned state of a domain.
   */
  function toggleDomainStar(starredDomains, domain) {
    const list = Array.isArray(starredDomains) ? starredDomains.slice() : [];
    if (!domain) return list;
    const clean = String(domain).trim().toLowerCase();
    const idx = list.findIndex(d => String(d).trim().toLowerCase() === clean);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(clean);
    }
    return list;
  }

  /**
   * Sorts domain table items placing starred domains at the top,
   * preserving user sort criteria within both pinned and unpinned partitions.
   */
  function sortDomainsWithPinned(items, starredDomains, sortMode = 'time_desc') {
    if (!Array.isArray(items)) return [];
    const list = items.slice();

    const compareFn = (a, b) => {
      if (sortMode === 'time_desc') {
        return (b.computedSeconds || 0) - (a.computedSeconds || 0);
      } else if (sortMode === 'time_asc') {
        return (a.computedSeconds || 0) - (b.computedSeconds || 0);
      } else if (sortMode === 'sessions_desc') {
        return (b.sessions || 0) - (a.sessions || 0);
      } else if (sortMode === 'name_asc') {
        return String(a.domain || '').localeCompare(String(b.domain || ''));
      }
      return 0;
    };

    const pinned = [];
    const unpinned = [];

    list.forEach(item => {
      if (item && isDomainStarred(starredDomains, item.domain)) {
        pinned.push(item);
      } else {
        unpinned.push(item);
      }
    });

    pinned.sort(compareFn);
    unpinned.sort(compareFn);

    return pinned.concat(unpinned);
  }

  /**
   * Retrieves user custom note for a domain.
   */
  function getDomainAnnotation(domainAnnotations, domain) {
    if (!domainAnnotations || typeof domainAnnotations !== 'object' || !domain) return '';
    const clean = String(domain).trim().toLowerCase();
    return domainAnnotations[clean] || domainAnnotations[domain] || '';
  }

  /**
   * Saves or clears custom user note for a domain.
   */
  function setDomainAnnotation(domainAnnotations, domain, note) {
    const map = Object.assign({}, domainAnnotations);
    if (!domain) return map;
    const clean = String(domain).trim().toLowerCase();
    const noteText = typeof note === 'string' ? note.trim() : '';
    if (noteText) {
      map[clean] = noteText;
    } else {
      delete map[clean];
      delete map[domain];
    }
    return map;
  }

  // =============================================================================
  // Feature 8: Domain Daily Time Budgets & Alerts
  // =============================================================================

  /**
   * Retrieves configured daily budget in minutes for a domain.
   */
  function getDomainBudget(domainBudgets, domain) {
    if (!domainBudgets || typeof domainBudgets !== 'object' || !domain) return 0;
    const clean = String(domain).trim().toLowerCase();
    const val = domainBudgets[clean] || domainBudgets[domain];
    return (typeof val === 'number' && val > 0) ? Math.round(val) : 0;
  }

  /**
   * Sets daily budget in minutes for a domain.
   */
  function setDomainBudget(domainBudgets, domain, minutes) {
    const map = Object.assign({}, domainBudgets);
    if (!domain) return map;
    const clean = String(domain).trim().toLowerCase();
    const mins = Number(minutes);
    if (!isNaN(mins) && mins > 0) {
      map[clean] = Math.round(mins);
    } else {
      delete map[clean];
      delete map[domain];
    }
    return map;
  }

  /**
   * Removes daily budget for a domain.
   */
  function removeDomainBudget(domainBudgets, domain) {
    const map = Object.assign({}, domainBudgets);
    if (!domain) return map;
    const clean = String(domain).trim().toLowerCase();
    delete map[clean];
    delete map[domain];
    return map;
  }

  /**
   * Computes budget consumption percentage and alert status.
   * Returns: { hasBudget, budgetMinutes, computedSeconds, percent, warning80, reached, remainingSeconds }
   */
  function checkDomainBudgetStatus(computedSeconds, budgetMinutes) {
    const mins = Number(budgetMinutes);
    if (isNaN(mins) || mins <= 0) {
      return {
        hasBudget: false,
        budgetMinutes: 0,
        computedSeconds: computedSeconds || 0,
        percent: 0,
        warning80: false,
        reached: false,
        remainingSeconds: 0
      };
    }

    const budgetSeconds = mins * 60;
    const seconds = Math.max(0, Number(computedSeconds) || 0);
    const rawPercent = (seconds / budgetSeconds) * 100;
    const percent = Math.round(rawPercent);
    const reached = percent >= 100;
    const warning80 = percent >= 80 && !reached;
    const remainingSeconds = Math.max(0, budgetSeconds - seconds);

    return {
      hasBudget: true,
      budgetMinutes: mins,
      computedSeconds: seconds,
      percent,
      warning80,
      reached,
      remainingSeconds
    };
  }

  // =============================================================================
  // Feature 8: Integrated Pomodoro Focus Sentinel
  // =============================================================================

  /**
   * Creates a stateful Pomodoro controller supporting 25m focus / 5m break cycles.
   */
  function createPomodoroController(options = {}) {
    const focusDuration = options.focusDurationSec || DEFAULT_POMODORO_SETTINGS.focusDurationSec;
    const breakDuration = options.breakDurationSec || DEFAULT_POMODORO_SETTINGS.breakDurationSec;

    let state = {
      mode: 'focus', // 'focus' | 'break'
      status: 'idle', // 'idle' | 'running' | 'paused'
      remainingSeconds: focusDuration,
      focusDuration,
      breakDuration,
      completedCycles: 0,
      autoPauseMedia: options.autoPauseMedia !== false,
      soundChime: options.soundChime !== false
    };

    let timerInterval = null;

    function formatTime(sec) {
      const s = Math.max(0, Math.floor(sec || 0));
      const m = Math.floor(s / 60);
      const rem = s % 60;
      return String(m).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
    }

    function playSyntheticChime(audioCtx) {
      try {
        const ctx = audioCtx || (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null);
        if (!ctx) return false;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;
        // Two-tone gentle harmonic bell chime: 528Hz (Love/Focus Solfeggio) followed by 660Hz (Harmonic Fifth)
        const tones = [
          { freq: 528, start: 0.0, dur: 0.6 },
          { freq: 660, start: 0.15, dur: 0.8 }
        ];

        tones.forEach(tone => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(tone.freq, now + tone.start);

          gain.gain.setValueAtTime(0.0001, now + tone.start);
          gain.gain.exponentialRampToValueAtTime(0.25, now + tone.start + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + tone.start);
          osc.stop(now + tone.start + tone.dur + 0.05);
        });

        return true;
      } catch (_) {
        return false;
      }
    }

    function tick(callbacks = {}) {
      if (state.status !== 'running') return state;

      if (state.remainingSeconds > 0) {
        state.remainingSeconds--;
        if (typeof callbacks.onTick === 'function') {
          callbacks.onTick(state);
        }
      }

      if (state.remainingSeconds <= 0) {
        // Mode transition
        if (state.mode === 'focus') {
          state.mode = 'break';
          state.remainingSeconds = state.breakDuration;
          state.completedCycles++;

          if (state.soundChime) {
            playSyntheticChime();
          }

          if (typeof callbacks.onBreak === 'function') {
            callbacks.onBreak(state);
          }
        } else {
          // Break finished -> back to focus
          state.mode = 'focus';
          state.remainingSeconds = state.focusDuration;
          state.status = 'idle';
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }

          if (state.soundChime) {
            playSyntheticChime();
          }

          if (typeof callbacks.onFocus === 'function') {
            callbacks.onFocus(state);
          }
        }
      }

      return state;
    }

    function start(callbacks = {}) {
      if (state.status === 'running') return state;
      state.status = 'running';

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        tick(callbacks);
      }, 1000);

      if (typeof callbacks.onTick === 'function') {
        callbacks.onTick(state);
      }
      return state;
    }

    function pause(callbacks = {}) {
      if (state.status !== 'running') return state;
      state.status = 'paused';
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (typeof callbacks.onTick === 'function') {
        callbacks.onTick(state);
      }
      return state;
    }

    function reset(callbacks = {}) {
      state.status = 'idle';
      state.mode = 'focus';
      state.remainingSeconds = state.focusDuration;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (typeof callbacks.onTick === 'function') {
        callbacks.onTick(state);
      }
      return state;
    }

    function getState() {
      return Object.assign({}, state, {
        formattedTime: formatTime(state.remainingSeconds)
      });
    }

    function destroy() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    return {
      getState,
      start,
      pause,
      reset,
      tick,
      destroy,
      formatTime,
      playSyntheticChime
    };
  }

  // =============================================================================
  // W3C Safe DOM Constructors
  // =============================================================================

  function buildBlacklistChip(pattern, onRemove, doc = (typeof document !== 'undefined' ? document : null)) {
    if (!doc || !pattern) return null;
    const chip = doc.createElement('div');
    chip.className = 'blacklist-chip';
    chip.setAttribute('data-pattern', pattern);

    const txt = doc.createElement('span');
    txt.className = 'chip-text';
    txt.textContent = pattern;

    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-remove-chip';
    btn.setAttribute('aria-label', 'Remove ' + pattern);
    btn.textContent = '✕';
    if (typeof onRemove === 'function') {
      btn.addEventListener('click', () => onRemove(pattern));
    }

    chip.appendChild(txt);
    chip.appendChild(btn);
    return chip;
  }

  function buildBudgetRow(domain, budgetMins, computedSec, onRemove, doc = (typeof document !== 'undefined' ? document : null)) {
    if (!doc || !domain) return null;
    const status = checkDomainBudgetStatus(computedSec, budgetMins);

    const row = doc.createElement('div');
    row.className = 'budget-item-row';
    row.setAttribute('data-domain', domain);

    const info = doc.createElement('div');
    info.className = 'budget-item-info';

    const dName = doc.createElement('span');
    dName.className = 'budget-domain-name';
    dName.textContent = domain;

    const bLimit = doc.createElement('span');
    bLimit.className = 'budget-domain-limit';
    bLimit.textContent = `Limit: ${budgetMins}m / Spent: ${Math.floor((computedSec || 0) / 60)}m (${status.percent}%)`;

    info.appendChild(dName);
    info.appendChild(bLimit);

    const badgeContainer = doc.createElement('div');
    badgeContainer.className = 'budget-badge-container';

    if (status.reached) {
      const reachedBadge = doc.createElement('span');
      reachedBadge.className = 'badge-budget-reached';
      reachedBadge.textContent = '🛑 Limit Reached';
      badgeContainer.appendChild(reachedBadge);
    } else if (status.warning80) {
      const warnBadge = doc.createElement('span');
      warnBadge.className = 'badge-budget-warning';
      warnBadge.textContent = '⚠️ 80% Limit';
      badgeContainer.appendChild(warnBadge);
    }

    const btnDel = doc.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn-remove-budget';
    btnDel.setAttribute('aria-label', 'Remove budget for ' + domain);
    btnDel.textContent = '🗑️';
    if (typeof onRemove === 'function') {
      btnDel.addEventListener('click', () => onRemove(domain));
    }
    badgeContainer.appendChild(btnDel);

    row.appendChild(info);
    row.appendChild(badgeContainer);
    return row;
  }

  // =============================================================================
  // Feature Definition Object & Registration
  // =============================================================================

  const WellbeingBlacklistFeature = Object.freeze({
    id: 'dashboard_wellbeing_blacklist',
    name: 'Wellbeing Sentinel, Annotations & Blacklist',
    version: '1.0.0',
    domain: ['dashboard'],
    STORAGE_KEY_STARRED,
    STORAGE_KEY_ANNOTATIONS,
    STORAGE_KEY_BLACKLIST,
    STORAGE_KEY_BUDGETS,
    STORAGE_KEY_POMODORO,
    DEFAULT_BLACKLIST_PATTERNS,
    DEFAULT_POMODORO_SETTINGS,
    compileBlacklistRegex,
    matchesBlacklist,
    addBlacklistPattern,
    removeBlacklistPattern,
    purgeDomainHistory,
    isDomainStarred,
    toggleDomainStar,
    sortDomainsWithPinned,
    getDomainAnnotation,
    setDomainAnnotation,
    getDomainBudget,
    setDomainBudget,
    removeDomainBudget,
    checkDomainBudgetStatus,
    createPomodoroController,
    buildBlacklistChip,
    buildBudgetRow,
    onInit: function (context) {
      if (context && context.logger && typeof context.logger.info === 'function') {
        context.logger.info('[WellbeingBlacklistFeature] Initialized');
      }
      return true;
    },
    onUpdate: function () {
      return true;
    },
    onDestroy: function () {
      return true;
    }
  });

  // Self-register in Feature Registry if available
  try {
    let reg = null;
    if (typeof globalThis !== 'undefined' && globalThis.SentinelFeatureRegistry) {
      reg = globalThis.SentinelFeatureRegistry;
    } else if (typeof require === 'function') {
      try { reg = require('../../core/feature_registry.js'); } catch (_) {}
    }
    if (reg && typeof reg.registerFeature === 'function') {
      reg.registerFeature(WellbeingBlacklistFeature);
    }
  } catch (_) {}

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WellbeingBlacklistFeature;
  }
  global.WellbeingBlacklistFeature = WellbeingBlacklistFeature;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
