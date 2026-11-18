/**
 * Web Activity & Media Sentinel - Sleep Advanced Suite Feature Module
 * Features: Auto-Disable Video Autoplay, Sleep Aid Soundscapes (Pink Noise, Midnight Ocean, Delta Rain),
 * Inactivity Fast-Cutoff (5m), Progressive Circadian Screen Dimmer Nudge,
 * Memory-Saver Tab Hibernation, and 20m Power-Nap Mode.
 *
 * 100% W3C Trusted Types Safe (Zero innerHTML assignments).
 * Strict adherence to Universal Rule 28 (Functions <= 50 lines, nesting <= 3).
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // In-memory runtime state for Sleep Advanced Suite
  const state = {
    audioCtx: null,
    masterGainNode: null,
    activeNodes: [],
    isPlayingSoundscape: false,
    currentSoundscapeType: 'none',
    powerNapActive: false
  };

  /**
   * Safe localStorage helpers with fallback
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
   * Asynchronously hydrates sleep advanced state from chrome.storage.local
   */
  function hydrateSleepFromChromeStorage(elems) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get([
      'sentinel_sleep_adv_autoplay_block',
      'sentinel_sleep_adv_inactivity_cutoff',
      'sentinel_sleep_adv_screen_dimmer',
      'sentinel_sleep_adv_tab_hibernate',
      'sentinel_sleep_adv_soundscape',
      'sentinel_sleep_adv_soundscape_vol'
    ]).then((res) => {
      if (!res) return;
      if (elems.toggleAutoplay && res.sentinel_sleep_adv_autoplay_block !== undefined) {
        elems.toggleAutoplay.checked = res.sentinel_sleep_adv_autoplay_block === true || res.sentinel_sleep_adv_autoplay_block === 'true';
      }
      if (elems.toggleInactivity && res.sentinel_sleep_adv_inactivity_cutoff !== undefined) {
        elems.toggleInactivity.checked = res.sentinel_sleep_adv_inactivity_cutoff === true || res.sentinel_sleep_adv_inactivity_cutoff === 'true';
      }
      if (elems.toggleDimmer && res.sentinel_sleep_adv_screen_dimmer !== undefined) {
        elems.toggleDimmer.checked = res.sentinel_sleep_adv_screen_dimmer === true || res.sentinel_sleep_adv_screen_dimmer === 'true';
      }
      if (elems.toggleHibernate && res.sentinel_sleep_adv_tab_hibernate !== undefined) {
        elems.toggleHibernate.checked = res.sentinel_sleep_adv_tab_hibernate === true || res.sentinel_sleep_adv_tab_hibernate === 'true';
      }
      if (elems.selectSleepSound && res.sentinel_sleep_adv_soundscape) {
        elems.selectSleepSound.value = res.sentinel_sleep_adv_soundscape;
      }
      if (res.sentinel_sleep_adv_soundscape_vol !== undefined) {
        const v = parseInt(res.sentinel_sleep_adv_soundscape_vol, 10) || 40;
        if (elems.sliderVol) elems.sliderVol.value = String(v);
        if (elems.txtVol) elems.txtVol.textContent = `${v}%`;
      }
    }).catch(() => {});
  }

  /**
   * Lazily instantiates and returns the Sleep Web Audio Context
   */
  function getSleepAudioContext() {
    if (!state.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        state.audioCtx = new AudioCtxClass();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume().catch(() => {});
    }
    return state.audioCtx;
  }

  /**
   * Initializes Sleep Advanced State from localStorage (Strict Default OFF)
   */
  function initSleepAdvancedState() {
    if (typeof document === 'undefined') return;

    const toggleAutoplay = document.getElementById('toggleSleepAutoplayBlock');
    const toggleInactivity = document.getElementById('toggleSleepInactivityFastCutoff');
    const toggleDimmer = document.getElementById('toggleSleepScreenDimmer');
    const toggleHibernate = document.getElementById('toggleSleepTabHibernate');

    if (toggleAutoplay) {
      toggleAutoplay.checked = getStoredItem('sentinel_sleep_adv_autoplay_block', 'false') === 'true';
    }
    if (toggleInactivity) {
      toggleInactivity.checked = getStoredItem('sentinel_sleep_adv_inactivity_cutoff', 'false') === 'true';
    }
    if (toggleDimmer) {
      toggleDimmer.checked = getStoredItem('sentinel_sleep_adv_screen_dimmer', 'false') === 'true';
    }
    if (toggleHibernate) {
      toggleHibernate.checked = getStoredItem('sentinel_sleep_adv_tab_hibernate', 'false') === 'true';
    }

    const selectSleepSound = document.getElementById('selectSleepAidSoundscape');
    if (selectSleepSound) {
      selectSleepSound.value = getStoredItem('sentinel_sleep_adv_soundscape', 'none');
    }

    const sliderVol = document.getElementById('sliderSleepSoundscapeVolume');
    const txtVol = document.getElementById('txtSleepSoundscapeVolume');
    const storedVol = parseInt(getStoredItem('sentinel_sleep_adv_soundscape_vol', '40'), 10) || 40;
    if (sliderVol) sliderVol.value = String(storedVol);
    if (txtVol) txtVol.textContent = `${storedVol}%`;

    hydrateSleepFromChromeStorage({ toggleAutoplay, toggleInactivity, toggleDimmer, toggleHibernate, selectSleepSound, sliderVol, txtVol });
  }

  /**
   * Generates white noise audio buffer
   */
  function createWhiteNoiseBuffer(ctx, durationSec = 4) {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Synthesizes Pink Noise via Paul Kellet 3-pole filtered buffer
   */
  function createPinkNoiseSource(ctx) {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  /**
   * Synthesizes Midnight Ocean with slow LFO modulation
   */
  function createMidnightOceanNodes(ctx, masterGain) {
    const noise = ctx.createBufferSource();
    noise.buffer = createWhiteNoiseBuffer(ctx, 6);
    noise.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(280, ctx.currentTime);
    bp.Q.setValueAtTime(2.2, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.25, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.2, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);
    noise.connect(bp);
    bp.connect(waveGain);
    waveGain.connect(masterGain);

    lfo.start();
    noise.start();
    return [noise, bp, waveGain, lfo, lfoGain];
  }

  /**
   * Synthesizes Delta Rain with 2.5Hz binaural sleep carrier
   */
  function createDeltaRainNodes(ctx, masterGain) {
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = createWhiteNoiseBuffer(ctx, 5);
    rainSrc.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1200, ctx.currentTime);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(200, ctx.currentTime);

    rainSrc.connect(lp);
    lp.connect(hp);
    hp.connect(masterGain);
    rainSrc.start();

    // 2.5Hz binaural sleep drone (100Hz Left / 102.5Hz Right)
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.frequency.setValueAtTime(100, ctx.currentTime);
    oscR.frequency.setValueAtTime(102.5, ctx.currentTime);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.08, ctx.currentTime);

    const merger = ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(droneGain);
    droneGain.connect(masterGain);

    oscL.start();
    oscR.start();
    return [rainSrc, lp, hp, oscL, oscR, droneGain, merger];
  }

  /**
   * Starts a chosen Sleep Aid Soundscape via Web Audio API
   */
  function startSleepAidSoundscape(type = 'none', vol = null) {
    stopSleepAidSoundscape();
    if (!type || type === 'none') return;

    const ctx = getSleepAudioContext();
    if (!ctx) return;

    const slider = typeof document !== 'undefined'
      ? document.getElementById('sliderSleepSoundscapeVolume')
      : null;
    const volVal = vol !== null ? vol : (slider ? parseInt(slider.value, 10) : 40);
    const volumeGain = (volVal / 100) * 0.35;

    state.masterGainNode = ctx.createGain();
    state.masterGainNode.gain.setValueAtTime(volumeGain, ctx.currentTime);
    state.masterGainNode.connect(ctx.destination);

    const nodes = [state.masterGainNode];

    if (type === 'pink_noise') {
      const src = createPinkNoiseSource(ctx);
      src.connect(state.masterGainNode);
      src.start();
      nodes.push(src);
    } else if (type === 'midnight_ocean') {
      const oceanNodes = createMidnightOceanNodes(ctx, state.masterGainNode);
      nodes.push(...oceanNodes);
    } else if (type === 'delta_rain') {
      const rainNodes = createDeltaRainNodes(ctx, state.masterGainNode);
      nodes.push(...rainNodes);
    }

    state.activeNodes = nodes;
    state.isPlayingSoundscape = true;
    state.currentSoundscapeType = type;

    const btn = typeof document !== 'undefined'
      ? document.getElementById('btnToggleSleepSoundscape')
      : null;
    if (btn) btn.textContent = '⏸';
  }

  /**
   * Stops active Sleep Aid Soundscape
   */
  function stopSleepAidSoundscape() {
    if (state.masterGainNode && state.audioCtx) {
      try {
        state.masterGainNode.gain.setValueAtTime(0.0001, state.audioCtx.currentTime);
      } catch (_) {}
    }
    state.activeNodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (_) {}
    });
    state.activeNodes = [];
    state.isPlayingSoundscape = false;

    const btn = typeof document !== 'undefined'
      ? document.getElementById('btnToggleSleepSoundscape')
      : null;
    if (btn) btn.textContent = '▶';
  }

  /**
   * Applies smooth volume ramp synchronized to sleep timer fade envelope
   */
  function applySleepVolumeRamp(targetRatio = 0, rampSec = 30) {
    if (!state.masterGainNode || !state.audioCtx) return;
    const now = state.audioCtx.currentTime;
    const currentGain = state.masterGainNode.gain.value;
    state.masterGainNode.gain.cancelScheduledValues(now);
    state.masterGainNode.gain.setValueAtTime(currentGain, now);
    state.masterGainNode.gain.linearRampToValueAtTime(targetRatio * 0.35, now + rampSec);
  }

  /**
   * Memory-saver tab hibernation (discards inactive non-pinned tabs)
   */
  async function executeSleepTabHibernation() {
    const toggle = typeof document !== 'undefined'
      ? document.getElementById('toggleSleepTabHibernate')
      : null;
    if (toggle && !toggle.checked) return;

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.discard) {
      try {
        const tabs = await chrome.tabs.query({ active: false, pinned: false });
        for (const tab of tabs) {
          chrome.tabs.discard(tab.id).catch(() => {});
        }
      } catch (_) {}
    }
  }

  /**
   * Progressive Screen Dimmer Nudge: activates circadian dark vignette
   */
  function triggerScreenDimmer() {
    if (typeof document === 'undefined') return;
    const toggle = document.getElementById('toggleSleepScreenDimmer');
    if (toggle && !toggle.checked) return;

    const dimmer = document.getElementById('overlaySleepDimmer');
    if (!dimmer) return;
    dimmer.classList.remove('hidden');
    // Allow paint before adding opacity transition class
    setTimeout(() => {
      dimmer.classList.add('active');
    }, 20);
  }

  /**
   * Resets and hides Progressive Screen Dimmer
   */
  function resetScreenDimmer() {
    if (typeof document === 'undefined') return;
    const dimmer = document.getElementById('overlaySleepDimmer');
    if (!dimmer) return;
    dimmer.classList.remove('active');
    setTimeout(() => {
      dimmer.classList.add('hidden');
    }, 1500);
  }

  /**
   * 1-Click Power-Nap Mode 20m Trigger
   */
  function triggerPowerNapMode(onStartCallback = null) {
    if (typeof document === 'undefined') return;

    const inputCustom = document.getElementById('inputDashSleepCustomMinutes');
    if (inputCustom) inputCustom.value = '20';

    const selectSound = document.getElementById('selectSleepAidSoundscape');
    if (selectSound) {
      selectSound.value = 'delta_rain';
      setStoredItem('sentinel_sleep_adv_soundscape', 'delta_rain');
    }

    const sliderVol = document.getElementById('sliderSleepSoundscapeVolume');
    const txtVol = document.getElementById('txtSleepSoundscapeVolume');
    if (sliderVol) sliderVol.value = '40';
    if (txtVol) txtVol.textContent = '40%';
    setStoredItem('sentinel_sleep_adv_soundscape_vol', 40);

    const btnNap = document.getElementById('btnSleepPowerNapMode');
    if (btnNap) {
      btnNap.classList.add('active');
      setTimeout(() => btnNap.classList.remove('active'), 5000);
    }

    startSleepAidSoundscape('delta_rain', 40);

    if (typeof onStartCallback === 'function') {
      onStartCallback(20);
    } else if (typeof global.triggerSetSleepTimer === 'function') {
      global.triggerSetSleepTimer(20);
    } else if (typeof window !== 'undefined' && typeof window.triggerSetSleepTimer === 'function') {
      window.triggerSetSleepTimer(20);
    }

    state.powerNapActive = true;
  }

  /**
   * Resets the power-nap active state flag
   */
  function resetPowerNap() {
    state.powerNapActive = false;
  }

  /**
   * Binds toggle inputs for Sleep Advanced Controls
   */
  function bindSleepAdvancedToggles() {
    const toggleAutoplay = document.getElementById('toggleSleepAutoplayBlock');
    if (toggleAutoplay) {
      toggleAutoplay.addEventListener('change', () => {
        setStoredItem('sentinel_sleep_adv_autoplay_block', toggleAutoplay.checked);
      });
    }

    const toggleInactivity = document.getElementById('toggleSleepInactivityFastCutoff');
    if (toggleInactivity) {
      toggleInactivity.addEventListener('change', () => {
        setStoredItem('sentinel_sleep_adv_inactivity_cutoff', toggleInactivity.checked);
      });
    }

    const toggleDimmer = document.getElementById('toggleSleepScreenDimmer');
    if (toggleDimmer) {
      toggleDimmer.addEventListener('change', () => {
        setStoredItem('sentinel_sleep_adv_screen_dimmer', toggleDimmer.checked);
      });
    }

    const toggleHibernate = document.getElementById('toggleSleepTabHibernate');
    if (toggleHibernate) {
      toggleHibernate.addEventListener('change', () => {
        setStoredItem('sentinel_sleep_adv_tab_hibernate', toggleHibernate.checked);
      });
    }
  }

  /**
   * Binds soundscape controls for Sleep Advanced Controls
   */
  function bindSleepSoundscapeControls() {
    const selectSound = document.getElementById('selectSleepAidSoundscape');
    if (selectSound) {
      selectSound.addEventListener('change', () => {
        const val = selectSound.value;
        setStoredItem('sentinel_sleep_adv_soundscape', val);
        if (val === 'none') {
          stopSleepAidSoundscape();
        } else {
          startSleepAidSoundscape(val);
        }
      });
    }

    const sliderVol = document.getElementById('sliderSleepSoundscapeVolume');
    const txtVol = document.getElementById('txtSleepSoundscapeVolume');
    if (sliderVol) {
      sliderVol.addEventListener('input', () => {
        const vol = parseInt(sliderVol.value, 10);
        if (txtVol) txtVol.textContent = `${vol}%`;
        setStoredItem('sentinel_sleep_adv_soundscape_vol', vol);
        if (state.masterGainNode && state.audioCtx) {
          state.masterGainNode.gain.setValueAtTime((vol / 100) * 0.35, state.audioCtx.currentTime);
        }
      });
    }

    const btnToggleSound = document.getElementById('btnToggleSleepSoundscape');
    if (btnToggleSound) {
      btnToggleSound.addEventListener('click', () => {
        if (state.isPlayingSoundscape) {
          stopSleepAidSoundscape();
        } else {
          const type = selectSound ? selectSound.value : 'none';
          if (type === 'none') {
            if (selectSound) selectSound.value = 'delta_rain';
            startSleepAidSoundscape('delta_rain');
          } else {
            startSleepAidSoundscape(type);
          }
        }
      });
    }

    const btnNap = document.getElementById('btnSleepPowerNapMode');
    if (btnNap) {
      btnNap.addEventListener('click', () => triggerPowerNapMode());
    }
  }

  /**
   * Binds UI event listeners for Sleep Advanced Controls
   */
  function bindSleepAdvancedEventListeners() {
    if (typeof document === 'undefined') return;
    bindSleepAdvancedToggles();
    bindSleepSoundscapeControls();
  }

  // Sleep Advanced Suite Public API Object
  const SleepAdvancedSuite = {
    initSleepAdvancedState,
    startSleepAidSoundscape,
    stopSleepAidSoundscape,
    applySleepVolumeRamp,
    executeSleepTabHibernation,
    triggerScreenDimmer,
    resetScreenDimmer,
    triggerPowerNapMode,
    resetPowerNap,
    bindSleepAdvancedEventListeners,
    getState: () => ({ ...state })
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepAdvancedSuite;
  }
  global.SleepAdvancedSuite = SleepAdvancedSuite;
  if (typeof globalThis !== 'undefined') globalThis.SleepAdvancedSuite = SleepAdvancedSuite;
  if (typeof window !== 'undefined') window.SleepAdvancedSuite = SleepAdvancedSuite;

})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
