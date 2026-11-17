/**
 * Web Activity & Media Sentinel - Web Audio DSP Engine
 * Real-time 5-band biquad equalizer, volume booster, vocal clarity, and dynamics compressor.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  let audioCtx = null;
  let mediaElementSource = null;
  let gainNode = null;
  let compressorNode = null;
  const eqFilters = {};
  let audioPipelineConnected = false;
  let connectedElement = null;

  let currentAudioSettings = {
    master_boost: 100,
    eq_bands: {
      '60': 0,
      '250': 0,
      '1000': 0,
      '4000': 0,
      '16000': 0
    },
    vocal_clarity: false,
    night_shield: false,
    bass_boost: false
  };

  function ensureAudioContextResumed() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function setupWebAudioPipeline(videoElement) {
    const targetVideo = videoElement || (typeof document !== 'undefined' ? document.querySelector('video') : null);
    if (!targetVideo) return false;

    if (audioPipelineConnected && connectedElement === targetVideo && audioCtx) {
      ensureAudioContextResumed();
      return true;
    }

    try {
      const AudioContextClass = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
                                (typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext));
      if (!AudioContextClass) return false;

      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }

      if (targetVideo.__sentinelMediaSource__) {
        mediaElementSource = targetVideo.__sentinelMediaSource__;
      } else if (typeof audioCtx.createMediaElementSource === 'function') {
        mediaElementSource = audioCtx.createMediaElementSource(targetVideo);
        targetVideo.__sentinelMediaSource__ = mediaElementSource;
      }

      if (!gainNode && typeof audioCtx.createGain === 'function') {
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime((currentAudioSettings.master_boost || 100) / 100, audioCtx.currentTime);
      }

      const frequencies = [60, 250, 1000, 4000, 16000];
      let prevNode = gainNode;

      if (typeof audioCtx.createBiquadFilter === 'function') {
        frequencies.forEach(freq => {
          if (!eqFilters[freq]) {
            const filter = audioCtx.createBiquadFilter();
            filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
            if (freq === 60) {
              filter.type = 'lowshelf';
            } else if (freq === 16000) {
              filter.type = 'highshelf';
            } else {
              filter.type = 'peaking';
              if (filter.Q) filter.Q.setValueAtTime(1.0, audioCtx.currentTime);
            }
            const initialGain = (currentAudioSettings.eq_bands && currentAudioSettings.eq_bands[String(freq)]) || 0;
            filter.gain.setValueAtTime(initialGain, audioCtx.currentTime);
            eqFilters[freq] = filter;
          }
          if (prevNode && typeof prevNode.connect === 'function') {
            prevNode.connect(eqFilters[freq]);
          }
          prevNode = eqFilters[freq];
        });
      }

      if (!compressorNode && typeof audioCtx.createDynamicsCompressor === 'function') {
        compressorNode = audioCtx.createDynamicsCompressor();
        compressorNode.threshold.setValueAtTime(currentAudioSettings.night_shield ? -32 : -10, audioCtx.currentTime);
        compressorNode.knee.setValueAtTime(30, audioCtx.currentTime);
        compressorNode.ratio.setValueAtTime(12, audioCtx.currentTime);
        compressorNode.attack.setValueAtTime(0.003, audioCtx.currentTime);
        compressorNode.release.setValueAtTime(0.25, audioCtx.currentTime);
      }

      if (prevNode && compressorNode && typeof prevNode.connect === 'function') {
        prevNode.connect(compressorNode);
      }
      if (compressorNode && audioCtx.destination && typeof compressorNode.connect === 'function') {
        compressorNode.connect(audioCtx.destination);
      }
      if (mediaElementSource && gainNode && typeof mediaElementSource.connect === 'function') {
        mediaElementSource.connect(gainNode);
      }

      audioPipelineConnected = true;
      connectedElement = targetVideo;

      ensureAudioContextResumed();
      applyAudioLabSettings(currentAudioSettings);
      return true;
    } catch (err) {
      console.warn('[Media Sentinel] Web Audio pipeline setup skipped or CORS restricted:', err);
      return false;
    }
  }

  function applyAudioLabSettings(settings) {
    if (!settings) return;
    currentAudioSettings = {
      ...currentAudioSettings,
      ...settings,
      eq_bands: {
        ...currentAudioSettings.eq_bands,
        ...(settings.eq_bands || {})
      }
    };

    if (!audioCtx) {
      const v = typeof document !== 'undefined' ? document.querySelector('video') : null;
      if (v) {
        setupWebAudioPipeline(v);
      }
    }

    if (!audioCtx) return;
    ensureAudioContextResumed();

    const now = audioCtx.currentTime;

    if (gainNode && typeof currentAudioSettings.master_boost === 'number') {
      const gainVal = Math.max(0, Math.min(2.0, currentAudioSettings.master_boost / 100));
      gainNode.gain.setValueAtTime(gainVal, now);
    }

    if (currentAudioSettings.eq_bands) {
      Object.entries(currentAudioSettings.eq_bands).forEach(([freq, gainVal]) => {
        const filter = eqFilters[freq];
        if (filter && filter.gain) {
          const clamped = Math.max(-12, Math.min(12, Number(gainVal) || 0));
          filter.gain.setValueAtTime(clamped, now);
        }
      });
    }

    if (currentAudioSettings.vocal_clarity) {
      if (eqFilters[1000] && eqFilters[1000].gain) {
        const base1k = (currentAudioSettings.eq_bands && Number(currentAudioSettings.eq_bands['1000'])) || 0;
        eqFilters[1000].gain.setValueAtTime(Math.min(12, base1k + 6), now);
      }
      if (!currentAudioSettings.bass_boost && eqFilters[60] && eqFilters[60].gain) {
        const base60 = (currentAudioSettings.eq_bands && Number(currentAudioSettings.eq_bands['60'])) || 0;
        eqFilters[60].gain.setValueAtTime(Math.max(-12, base60 - 4), now);
      }
    }

    if (currentAudioSettings.bass_boost) {
      if (eqFilters[60] && eqFilters[60].gain) {
        const base60 = (currentAudioSettings.eq_bands && Number(currentAudioSettings.eq_bands['60'])) || 0;
        const vocalOffset = currentAudioSettings.vocal_clarity ? -4 : 0;
        const targetGain = Math.max(-12, Math.min(12, base60 + 7 + vocalOffset));
        eqFilters[60].gain.setValueAtTime(targetGain, now);
      }
    }

    if (compressorNode && compressorNode.threshold) {
      const thresholdVal = currentAudioSettings.night_shield ? -32 : -10;
      compressorNode.threshold.setValueAtTime(thresholdVal, now);
    }
  }

  const WebAudioDSP = {
    setupWebAudioPipeline,
    applyAudioLabSettings,
    ensureAudioContextResumed,
    getAudioContext: () => audioCtx,
    getMediaSource: () => mediaElementSource,
    getGainNode: () => gainNode,
    getEqFilters: () => eqFilters,
    getCompressorNode: () => compressorNode,
    getSettings: () => ({ ...currentAudioSettings })
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebAudioDSP;
  }
  global.WebAudioDSP = WebAudioDSP;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
