/**
 * Web Activity & Media Sentinel - Media Tab Controller
 * Player controls, progress scrubbers, volume sliders, and in-card micro-actions.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // Strict 0.25x speed stepping ladder (0.25x min, 2.0x max per user specification)
  const SPEED_LADDER = Object.freeze([0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0]);

  function calculateNextLadderSpeed(currentSpeed, direction) {
    const cur = (typeof currentSpeed === 'number' && !isNaN(currentSpeed) && currentSpeed > 0)
      ? Math.round(currentSpeed * 100) / 100
      : 1.0;

    let closestIdx = 3; // default 1.0
    let minDiff = Infinity;
    for (let i = 0; i < SPEED_LADDER.length; i++) {
      const diff = Math.abs(SPEED_LADDER[i] - cur);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    let nextIdx;
    if (direction === 'down' || direction === -1) {
      nextIdx = Math.max(0, closestIdx - 1);
    } else {
      nextIdx = Math.min(SPEED_LADDER.length - 1, closestIdx + 1);
    }
    return SPEED_LADDER[nextIdx];
  }

  function formatVideoTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const remSec = s % 60;

    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }

  function formatTime(seconds) {
    return formatVideoTime(seconds);
  }

  function renderMediaPane(mediaState) {
    if (typeof document === 'undefined') return;
    const titleEl = document.getElementById('mediaTitleText') || document.getElementById('mediaTrackTitle');
    const emptyState = document.getElementById('mediaEmptyState');
    const activePlayerCard = document.getElementById('mediaSentinelCard') || document.getElementById('mediaPlayerCard');

    if (!mediaState || !mediaState.primaryMedia) {
      if (emptyState) emptyState.style.display = 'flex';
      if (activePlayerCard) activePlayerCard.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (activePlayerCard) activePlayerCard.style.display = 'block';

    const p = mediaState.primaryMedia;
    if (titleEl) {
      titleEl.textContent = p.title || 'Playing Media';
    }

    const timeEl = document.getElementById('videoTimeText');
    if (timeEl && typeof p.currentTime === 'number') {
      const cur = formatTime(p.currentTime);
      const dur = formatTime(p.duration || 0);
      timeEl.textContent = `${cur} / ${dur}`;
    }

    const progressFill = document.getElementById('progressBarFill');
    if (progressFill && p.duration > 0) {
      const pct = Math.min(100, Math.max(0, (p.currentTime / p.duration) * 100));
      progressFill.style.width = `${pct}%`;
    }

    const volFill = document.getElementById('volumeBarFill');
    const volText = document.getElementById('volumePercentText');
    if (typeof p.volume === 'number') {
      const volPct = Math.round(p.volume * 100);
      if (volFill) volFill.style.width = `${volPct}%`;
      if (volText) volText.textContent = `${volPct}%`;
    }

    const speedText = document.getElementById('playbackSpeedText');
    if (speedText && typeof p.playbackRate === 'number') {
      speedText.textContent = `${p.playbackRate.toFixed(2)}x`;
    }
  }

  function sendMediaCommand(command, data = {}, targetTabId = null) {
    const api = typeof browser !== 'undefined' && browser.runtime ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.runtime || !api.runtime.sendMessage) return;

    const message = {
      type: 'MEDIA_CONTROL_COMMAND',
      command,
      data,
      targetTabId
    };

    try {
      api.runtime.sendMessage(message, () => {
        if (api.runtime.lastError) {}
      });
    } catch (_) {}
  }

  const TabMedia = {
    SPEED_LADDER,
    calculateNextLadderSpeed,
    formatVideoTime,
    formatTime,
    renderMediaPane,
    sendMediaCommand
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabMedia;
  }
  global.TabMedia = TabMedia;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
