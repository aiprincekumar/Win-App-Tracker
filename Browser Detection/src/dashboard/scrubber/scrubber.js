/**
 * Web Activity & Media Sentinel - Dashboard Precision Timeline Scrubber & Kinetic Micro-Motion
 * Sub-second hover timestamp tooltip math, throttled procedural haptic ticks, chapter ticks,
 * and 60fps GPU-accelerated kinetic odometer number rolling (Ease-Out Quart easing).
 * 100% W3C Trusted Types compliant (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  /**
   * Universal HH:MM:SS / MM:SS duration formatter.
   *
   * @param {number} seconds
   * @returns {string}
   */
  function formatHHMMSS(seconds) {
    const sec = Math.max(0, Math.floor(Number(seconds) || 0));
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remSecs = sec % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(remSecs)}`;
    }
    return `${pad(mins)}:${pad(remSecs)}`;
  }

  const formatTimeHHMMSS = formatHHMMSS;

  /**
   * Attaches precision floating tooltip, sub-second timestamp tracking,
   * and throttled haptic feedback ticks to the hero media timeline scrubber.
   *
   * @param {HTMLElement} scrubberEl - Seek slider or scrubber container element
   * @param {HTMLElement} tooltipEl - Floating tooltip element
   * @param {number|Function} durationSec - Media duration in seconds (or getter fn)
   */
  function initPrecisionScrubber(scrubberEl, tooltipEl, durationSec = 0) {
    if (!scrubberEl || !tooltipEl) return;

    let lastTickPercent = -1;

    function updateTooltipPosition(e) {
      const rect = (typeof scrubberEl.getBoundingClientRect === 'function')
        ? scrubberEl.getBoundingClientRect()
        : { left: 0, width: scrubberEl.offsetWidth || 100 };
      const rectWidth = (rect && rect.width > 0) ? rect.width : (scrubberEl.offsetWidth || 100);
      const rectLeft = (rect && typeof rect.left === 'number') ? rect.left : 0;
      const clientX = (e && typeof e.clientX === 'number')
        ? e.clientX
        : (e && e.touches && e.touches[0] ? e.touches[0].clientX : rectLeft);
      const offsetX = Math.max(0, Math.min(clientX - rectLeft, rectWidth));
      const percent = rectWidth > 0 ? (offsetX / rectWidth) : 0;
      const dur = typeof durationSec === 'function' ? durationSec() : (Number(durationSec) || 100);
      const hoverSeconds = percent * dur;

      tooltipEl.style.left = `${offsetX}px`;
      tooltipEl.textContent = formatHHMMSS(hoverSeconds);
      tooltipEl.classList.remove('hidden');

      // Throttled audio tick hook: when position shifts by >= 1%
      const currentPercentRounded = Math.round(percent * 100);
      if (lastTickPercent === -1 || Math.abs(currentPercentRounded - lastTickPercent) >= 1) {
        lastTickPercent = currentPercentRounded;
        const haptics = (typeof window !== 'undefined' && window.sentinelHaptics)
          ? window.sentinelHaptics
          : (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics ? globalThis.sentinelHaptics : null);
        if (haptics && typeof haptics.playTick === 'function') {
          try { haptics.playTick(); } catch (_) {}
        }
      }
    }

    scrubberEl.addEventListener('mousemove', updateTooltipPosition);
    scrubberEl.addEventListener('mouseleave', () => {
      tooltipEl.classList.add('hidden');
      lastTickPercent = -1;
    });

    // Keyboard Seeking Support with ArrowRight / ArrowLeft
    scrubberEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const haptics = (typeof window !== 'undefined' && window.sentinelHaptics)
          ? window.sentinelHaptics
          : (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics ? globalThis.sentinelHaptics : null);
        if (haptics && typeof haptics.playTick === 'function') {
          try { haptics.playTick(); } catch (_) {}
        }
      }
    });
  }

  /**
   * 60fps GPU-accelerated kinetic odometer number rolling using Ease-Out Quart easing.
   *
   * @param {HTMLElement} el - Target DOM element
   * @param {number} startVal - Initial number
   * @param {number} targetVal - Target destination number
   * @param {number} durationMs - Animation duration in ms (default: 600)
   * @param {string} unitSuffix - Suffix to append to textContent (e.g. '%', 's')
   * @param {Function|null} formatter - Optional custom formatter function (e.g. formatDuration)
   */
  function animateNumberRoll(el, startVal, targetVal, durationMs = 600, unitSuffix = '', formatter = null) {
    if (!el) return;
    const start = Number(startVal) || 0;
    const target = Number(targetVal) || 0;
    const duration = Number(durationMs) || 600;
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

    function step(currentTime) {
      const now = (typeof currentTime === 'number' && !isNaN(currentTime))
        ? currentTime
        : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      const elapsed = now - startTime;
      const progress = Math.min(Math.max(elapsed / duration, 0), 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(start + (target - start) * eased);

      if (typeof formatter === 'function') {
        el.textContent = formatter(current);
      } else {
        el.textContent = `${current}${unitSuffix || ''}`;
      }

      if (progress < 1) {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(step);
        } else {
          setTimeout(() => step(now + 16), 16);
        }
      }
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(step);
    } else {
      step(startTime);
    }
  }

  /**
   * Renders discrete chapter tick markers along the timeline scrubber track.
   *
   * @param {Array<number|Object>} chapters - Array of timestamps or {time, title} objects
   * @param {number} durationSec - Total media duration in seconds
   */
  function renderScrubberChapterTicks(chapters = [], durationSec = 0) {
    const container = document.getElementById('scrubberChapterTicksContainer');
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const dur = Number(durationSec) || 0;
    if (dur <= 0 || !Array.isArray(chapters) || chapters.length === 0) return;

    chapters.forEach((ch) => {
      const timeVal = (typeof ch === 'object' && ch !== null) ? Number(ch.time || 0) : Number(ch || 0);
      const pct = Math.max(0, Math.min((timeVal / dur) * 100, 100));
      const tick = document.createElement('div');
      tick.className = 'scrubber-tick';
      tick.style.left = `${pct.toFixed(2)}%`;
      if (typeof ch === 'object' && ch !== null && ch.title) {
        tick.title = `${ch.title} (${formatHHMMSS(timeVal)})`;
      } else {
        tick.title = formatHHMMSS(timeVal);
      }
      container.appendChild(tick);
    });
  }

  /**
   * Dynamically applies staggered entrance animation indices to cards in the active view.
   */
  function applyCardStaggerIndices() {
    if (typeof document === 'undefined') return;
    const activePane = document.querySelector('.tab-pane.active') || document;
    if (!activePane || typeof activePane.querySelectorAll !== 'function') return;

    const cards = activePane.querySelectorAll('.bento-card, .metric-card, .chart-card');
    cards.forEach((card, idx) => {
      if (card && card.style && typeof card.style.setProperty === 'function') {
        card.style.setProperty('--card-index', String(idx + 1));
      }
    });
  }

  /**
   * OO Class encapsulation for PrecisionTimelineScrubber.
   */
  class PrecisionTimelineScrubber {
    constructor(scrubberEl, tooltipEl, durationSec = 0) {
      this.scrubberEl = scrubberEl;
      this.tooltipEl = tooltipEl;
      this.durationSec = durationSec;
      if (scrubberEl && tooltipEl) {
        initPrecisionScrubber(scrubberEl, tooltipEl, durationSec);
      }
    }

    setDuration(durationSec) {
      this.durationSec = durationSec;
    }

    renderChapters(chapters) {
      renderScrubberChapterTicks(chapters, this.durationSec);
    }
  }

  const ScrubberModule = {
    formatHHMMSS,
    formatTimeHHMMSS,
    initPrecisionScrubber,
    animateNumberRoll,
    renderScrubberChapterTicks,
    applyCardStaggerIndices,
    PrecisionTimelineScrubber
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrubberModule;
  }
  global.ScrubberModule = ScrubberModule;
  global.formatHHMMSS = formatHHMMSS;
  global.formatTimeHHMMSS = formatTimeHHMMSS;
  global.initPrecisionScrubber = initPrecisionScrubber;
  global.animateNumberRoll = animateNumberRoll;
  global.renderScrubberChapterTicks = renderScrubberChapterTicks;
  global.applyCardStaggerIndices = applyCardStaggerIndices;
  global.PrecisionTimelineScrubber = PrecisionTimelineScrubber;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
