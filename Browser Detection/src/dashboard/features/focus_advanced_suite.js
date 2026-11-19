/**
 * Web Activity & Media Sentinel - Focus Advanced Suite Feature Module
 * Features: Focus Integrity Score & Distraction Counter, Auto-Mute Background Tabs,
 * Web Audio Binaural Beats (Alpha, Beta, Gamma), Soft-Nudge Breathe Overlay,
 * and 20-20-20 Screen-Break & Posture Alert.
 *
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * Strict adherence to Universal Rule 28 (Functions <= 50 lines, nesting <= 3).
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // In-memory runtime state for Focus Advanced Suite
  const state = {
    integrityScore: 100,
    distractionCount: 0,
    cumulativeFocusSeconds: 0,
    breatheTimerInterval: null,
    breatheStepIndex: 0,
    breatheTimeRemaining: 4,
    postureAlertTimeout: null
  };

  /**
   * Safe localStorage helper with fallback
   */
  function getStoredItem(key, fallback = '') {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        return val !== null ? val : fallback;
      }
    } catch (_) {}
    return fallback;
  }

  function setStoredItem(key, val) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, String(val));
      }
    } catch (_) {}
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [key]: val }).catch(() => {});
      }
    } catch (_) {}
  }

  /**
   * Asynchronously hydrates state from chrome.storage.local
   */
  function hydrateFocusFromChromeStorage(elems) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get([
      'sentinel_focus_adv_integrity',
      'sentinel_focus_adv_automute_bg',
      'sentinel_focus_adv_breathe_nudge',
      'sentinel_focus_adv_posture_alert',
      'sentinel_focus_soundscape'
    ]).then((res) => {
      if (!res) return;
      if (elems.toggleIntegrity && res.sentinel_focus_adv_integrity !== undefined) {
        elems.toggleIntegrity.checked = res.sentinel_focus_adv_integrity === true || res.sentinel_focus_adv_integrity === 'true';
      }
      if (elems.toggleAutoMute && res.sentinel_focus_adv_automute_bg !== undefined) {
        elems.toggleAutoMute.checked = res.sentinel_focus_adv_automute_bg === true || res.sentinel_focus_adv_automute_bg === 'true';
      }
      if (elems.toggleBreathe && res.sentinel_focus_adv_breathe_nudge !== undefined) {
        elems.toggleBreathe.checked = res.sentinel_focus_adv_breathe_nudge === true || res.sentinel_focus_adv_breathe_nudge === 'true';
      }
      if (elems.toggle2020 && res.sentinel_focus_adv_posture_alert !== undefined) {
        elems.toggle2020.checked = res.sentinel_focus_adv_posture_alert === true || res.sentinel_focus_adv_posture_alert === 'true';
      }
      if (elems.selectSoundscape && res.sentinel_focus_soundscape) {
        elems.selectSoundscape.value = res.sentinel_focus_soundscape;
      }
      syncIntegrityBadgeUI();
    }).catch(() => {});
  }

  /**
   * Initializes Focus Advanced State from localStorage (Strict Default OFF)
   */
  function initFocusAdvancedState() {
    if (typeof document === 'undefined') return;

    const toggleIntegrity = document.getElementById('toggleFocusIntegrityScore');
    const toggleAutoMute = document.getElementById('toggleFocusAutoMuteBg');
    const toggleBreathe = document.getElementById('toggleFocusBreatheNudge');
    const toggle2020 = document.getElementById('toggleFocus2020Alert');
    const selectSoundscape = document.getElementById('selectFocusSoundscape');

    if (toggleIntegrity) {
      toggleIntegrity.checked = getStoredItem('sentinel_focus_adv_integrity', 'false') === 'true';
    }
    if (toggleAutoMute) {
      toggleAutoMute.checked = getStoredItem('sentinel_focus_adv_automute_bg', 'false') === 'true';
    }
    if (toggleBreathe) {
      toggleBreathe.checked = getStoredItem('sentinel_focus_adv_breathe_nudge', 'false') === 'true';
    }
    if (toggle2020) {
      toggle2020.checked = getStoredItem('sentinel_focus_adv_posture_alert', 'false') === 'true';
    }
    if (selectSoundscape && !selectSoundscape.value) {
      selectSoundscape.value = getStoredItem('sentinel_focus_soundscape', 'none');
    }

    syncIntegrityBadgeUI();
    hydrateFocusFromChromeStorage({ toggleIntegrity, toggleAutoMute, toggleBreathe, toggle2020, selectSoundscape });
  }

  /**
   * Synchronizes the UI badge representation of the Focus Integrity Score
   */
  function syncIntegrityBadgeUI() {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('badgeFocusIntegrityScore');
    const cnt = document.getElementById('cntFocusDistractions');

    if (badge) {
      badge.textContent = `${state.integrityScore}%`;
      badge.classList.remove('med', 'low');
      if (state.integrityScore < 70) {
        badge.classList.add('low');
      } else if (state.integrityScore < 90) {
        badge.classList.add('med');
      }
    }
    if (cnt) {
      cnt.textContent = String(state.distractionCount);
    }
  }

  /**
   * Updates Focus Integrity Score and distraction count
   */
  function updateFocusIntegrityScore(delta = -5, reason = 'distraction') {
    const toggle = typeof document !== 'undefined'
      ? document.getElementById('toggleFocusIntegrityScore')
      : null;
    if (toggle && !toggle.checked) return;

    if (delta < 0) {
      state.distractionCount += 1;
      state.integrityScore = Math.max(0, state.integrityScore + delta);
    } else {
      state.integrityScore = Math.min(100, state.integrityScore + delta);
    }
    syncIntegrityBadgeUI();
  }

  /**
   * Resets focus integrity score for a new session
   */
  function resetFocusIntegrityScore() {
    state.integrityScore = 100;
    state.distractionCount = 0;
    state.cumulativeFocusSeconds = 0;
    syncIntegrityBadgeUI();
  }

  /**
   * Executes auto-muting or unmuting of background tabs
   */
  async function executeAutoMuteBackgroundTabs(isMute) {
    const toggle = typeof document !== 'undefined'
      ? document.getElementById('toggleFocusAutoMuteBg')
      : null;
    if (isMute && toggle && !toggle.checked) return;

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      try {
        const tabs = await chrome.tabs.query({ active: false });
        for (const tab of tabs) {
          if (tab.audible && !tab.mutedInfo?.muted && isMute) {
            chrome.tabs.update(tab.id, { muted: true }).catch(() => {});
          } else if (!isMute && tab.mutedInfo?.muted) {
            chrome.tabs.update(tab.id, { muted: false }).catch(() => {});
          }
        }
      } catch (_) {}
    }
  }

  /**
   * Generates discrete stereo frequencies in real time via Web Audio API
   */
  function createBinauralBeatNodes(ctx, carrier, beatFreq, gainNode) {
    if (!ctx) return [];
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.type = 'sine';
    oscR.type = 'sine';
    oscL.frequency.setValueAtTime(carrier, ctx.currentTime);
    oscR.frequency.setValueAtTime(carrier + beatFreq, ctx.currentTime);

    const merger = ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0); // Left channel
    oscR.connect(merger, 0, 1); // Right channel
    merger.connect(gainNode);

    oscL.start();
    oscR.start();
    return [oscL, oscR, merger];
  }

  /**
   * Step cycle helper for 16-second box-breathing animation
   */
  function advanceBreathePacingStep(ring, textEl, countEl) {
    const steps = [
      { text: 'Inhale', cls: 'inhale' },
      { text: 'Hold', cls: 'hold' },
      { text: 'Exhale', cls: 'exhale' },
      { text: 'Hold', cls: 'hold' }
    ];
    state.breatheTimeRemaining -= 1;
    if (state.breatheTimeRemaining <= 0) {
      state.breatheTimeRemaining = 4;
      state.breatheStepIndex = (state.breatheStepIndex + 1) % steps.length;
      const cur = steps[state.breatheStepIndex];
      if (textEl) textEl.textContent = cur.text;
      if (ring) {
        ring.className = `breathe-visual-ring ${cur.cls}`;
      }
    }
    if (countEl) {
      countEl.textContent = String(state.breatheTimeRemaining);
    }
  }

  /**
   * Displays the Soft-Nudge Breathe Overlay on distracting domains
   */
  function triggerBreatheNudgeOverlay(domain = '') {
    if (typeof document === 'undefined') return;
    const toggle = document.getElementById('toggleFocusBreatheNudge');
    if (toggle && !toggle.checked) return;

    const overlay = document.getElementById('overlayBreatheNudge');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    state.breatheStepIndex = 0;
    state.breatheTimeRemaining = 4;

    const ring = document.getElementById('breatheVisualRing');
    const textEl = document.getElementById('breathePacingText');
    const countEl = document.getElementById('breathePacingCountdown');

    if (textEl) textEl.textContent = 'Inhale';
    if (countEl) countEl.textContent = '4';
    if (ring) ring.className = 'breathe-visual-ring inhale';

    if (state.breatheTimerInterval) clearInterval(state.breatheTimerInterval);
    state.breatheTimerInterval = setInterval(() => {
      advanceBreathePacingStep(ring, textEl, countEl);
    }, 1000);
  }

  /**
   * Hides the Soft-Nudge Breathe Overlay
   */
  function hideBreatheNudgeOverlay() {
    if (typeof document === 'undefined') return;
    const overlay = document.getElementById('overlayBreatheNudge');
    if (overlay) overlay.classList.add('hidden');
    if (state.breatheTimerInterval) {
      clearInterval(state.breatheTimerInterval);
      state.breatheTimerInterval = null;
    }
  }

  /**
   * Displays the 20-20-20 Posture Alert Toast HUD
   */
  function trigger2020PostureAlert() {
    if (typeof document === 'undefined') return;
    const toggle = document.getElementById('toggleFocus2020Alert');
    if (toggle && !toggle.checked) return;

    const toast = document.getElementById('toast2020PostureAlert');
    if (!toast) return;

    toast.classList.remove('hidden');
    try {
      if (typeof chrome !== 'undefined' && chrome.notifications && chrome.notifications.create) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '👀 20-20-20 Eye & Posture Alert',
          message: 'Look at an object 20 feet away for 20 seconds and adjust your posture!'
        });
      }
    } catch (_) {}
    if (state.postureAlertTimeout) clearTimeout(state.postureAlertTimeout);
    state.postureAlertTimeout = setTimeout(() => {
      hide2020PostureAlert();
    }, 20000);
  }

  /**
   * Hides the 20-20-20 Posture Alert Toast HUD
   */
  function hide2020PostureAlert() {
    if (typeof document === 'undefined') return;
    const toast = document.getElementById('toast2020PostureAlert');
    if (toast) toast.classList.add('hidden');
    if (state.postureAlertTimeout) {
      clearTimeout(state.postureAlertTimeout);
      state.postureAlertTimeout = null;
    }
  }

  /**
   * Evaluates active Pomodoro timer tick for 20-20-20 ergonomics and distraction rules
   */
  function handlePomodoroFocusTick(status, secondsElapsed) {
    if (status !== 'focus') return;
    state.cumulativeFocusSeconds += 1;
    if (state.cumulativeFocusSeconds % 1200 === 0) {
      trigger2020PostureAlert();
    }
  }

  /**
   * Binds overlay and dialog button event listeners
   */
  function bindOverlayListeners() {
    const btnBreatheReturn = document.getElementById('btnBreatheReturnTask');
    if (btnBreatheReturn) {
      btnBreatheReturn.addEventListener('click', hideBreatheNudgeOverlay);
    }

    const btnBreatheAllow = document.getElementById('btnBreatheAllowTemp');
    if (btnBreatheAllow) {
      btnBreatheAllow.addEventListener('click', hideBreatheNudgeOverlay);
    }

    const btnClose2020 = document.getElementById('btnClose2020Alert');
    if (btnClose2020) {
      btnClose2020.addEventListener('click', hide2020PostureAlert);
    }
  }

  /**
   * Binds UI event listeners for Focus Advanced Controls
   */
  function bindFocusAdvancedEventListeners() {
    if (typeof document === 'undefined') return;

    const toggleIntegrity = document.getElementById('toggleFocusIntegrityScore');
    if (toggleIntegrity) {
      toggleIntegrity.addEventListener('change', () => {
        setStoredItem('sentinel_focus_adv_integrity', toggleIntegrity.checked);
        syncIntegrityBadgeUI();
      });
    }

    const toggleAutoMute = document.getElementById('toggleFocusAutoMuteBg');
    if (toggleAutoMute) {
      toggleAutoMute.addEventListener('change', () => {
        setStoredItem('sentinel_focus_adv_automute_bg', toggleAutoMute.checked);
      });
    }

    const toggleBreathe = document.getElementById('toggleFocusBreatheNudge');
    if (toggleBreathe) {
      toggleBreathe.addEventListener('change', () => {
        setStoredItem('sentinel_focus_adv_breathe_nudge', toggleBreathe.checked);
      });
    }

    const toggle2020 = document.getElementById('toggleFocus2020Alert');
    if (toggle2020) {
      toggle2020.addEventListener('change', () => {
        setStoredItem('sentinel_focus_adv_posture_alert', toggle2020.checked);
      });
    }

    const selectSoundscape = document.getElementById('selectFocusSoundscape');
    if (selectSoundscape) {
      selectSoundscape.addEventListener('change', () => {
        setStoredItem('sentinel_focus_soundscape', selectSoundscape.value);
      });
    }

    bindOverlayListeners();
  }

  let focusHighlightTimerId = null;

  /**
   * Deep-links directly to Focus Sentinel card and highlights the Start Focus button
   */
  function navigateToFocusSentinel() {
    if (typeof window !== 'undefined' && window.sentinelHaptics?.playClick) {
      window.sentinelHaptics.playClick();
    } else if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics?.playClick) {
      sentinelHaptics.playClick();
    }
    if (typeof window !== 'undefined' && typeof window.switchTab === 'function') {
      window.switchTab('wellbeing');
    } else if (typeof switchTab === 'function') {
      switchTab('wellbeing');
    }

    const card = typeof document !== 'undefined' ? document.getElementById('widgetPomodoroSentinel') : null;
    const btn = typeof document !== 'undefined' ? document.getElementById('btnStartPomodoro') : null;
    if (!card) return;

    if (focusHighlightTimerId) {
      clearTimeout(focusHighlightTimerId);
      focusHighlightTimerId = null;
    }

    const prefersReduced = (typeof window !== 'undefined' && window.matchMedia)
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    setTimeout(() => {
      card.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
      card.classList.remove('focus-card-highlight');
      if (btn) btn.classList.remove('highlight-pulse');
      void card.offsetWidth;
      if (btn) void btn.offsetWidth;

      card.classList.add('focus-card-highlight');
      if (btn) {
        btn.classList.add('highlight-pulse');
        if (typeof btn.focus === 'function') {
          btn.focus({ preventScroll: true });
        }
      }

      focusHighlightTimerId = setTimeout(() => {
        card.classList.remove('focus-card-highlight');
        if (btn) btn.classList.remove('highlight-pulse');
        focusHighlightTimerId = null;
      }, 2000);
    }, 60);
  }

  // Focus Advanced Suite Public API Object
  const FocusAdvancedSuite = {
    initFocusAdvancedState,
    updateFocusIntegrityScore,
    resetFocusIntegrityScore,
    executeAutoMuteBackgroundTabs,
    createBinauralBeatNodes,
    triggerBreatheNudgeOverlay,
    hideBreatheNudgeOverlay,
    trigger2020PostureAlert,
    hide2020PostureAlert,
    handlePomodoroFocusTick,
    bindFocusAdvancedEventListeners,
    navigateToFocusSentinel,
    getState: () => ({ ...state })
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusAdvancedSuite;
  }
  global.FocusAdvancedSuite = FocusAdvancedSuite;
  global.navigateToFocusSentinel = navigateToFocusSentinel;
  if (typeof globalThis !== 'undefined') {
    globalThis.FocusAdvancedSuite = FocusAdvancedSuite;
    globalThis.navigateToFocusSentinel = navigateToFocusSentinel;
  }
  if (typeof window !== 'undefined') {
    window.FocusAdvancedSuite = FocusAdvancedSuite;
    window.navigateToFocusSentinel = navigateToFocusSentinel;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
