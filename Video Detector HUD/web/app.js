/**
 * web/app.js: Reactive Vanilla JavaScript Telemetry Client & Remote Controller.
 * Department 05: Frontend Engineering & Department 06: Backend & API Engineering.
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function () {
  'use strict';

  // SVG Radial Circle Metrics
  const CIRCLE_RADIUS = 74;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~464.9557

  // State Management
  let eventSource = null;
  let reconnectTimeout = null;
  let reconnectDelay = 1000;
  let isPollingFallback = false;
  let pollingInterval = null;
  let currentPin = '';

  // Extract initial PIN from query params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  currentPin = urlParams.get('pin') || localStorage.getItem('sentinel_pin') || '';
  if (currentPin) {
    localStorage.setItem('sentinel_pin', currentPin);
  }

  // DOM Elements
  const connDot = document.getElementById('conn-dot');
  const connText = document.getElementById('conn-text');
  const statusPill = document.getElementById('status-pill');
  const statusLabel = document.getElementById('status-label');
  const verdictTag = document.getElementById('verdict-tag');
  const confidenceTag = document.getElementById('confidence-tag');

  const countdownTimer = document.getElementById('countdown-timer');
  const countdownStateBadge = document.getElementById('countdown-state-badge');
  const radialProgress = document.getElementById('radial-progress');
  const snoozeIndicator = document.getElementById('snooze-indicator');
  const graceVal = document.getElementById('grace-val');
  const thresholdVal = document.getElementById('threshold-val');
  const idleVal = document.getElementById('idle-val');

  const mediaTitle = document.getElementById('media-title');
  const playerBadge = document.getElementById('player-badge');
  const platformTag = document.getElementById('platform-tag');
  const fullscreenBadge = document.getElementById('fullscreen-badge');
  const playbackStateTag = document.getElementById('playback-state-tag');
  const volumeBarFill = document.getElementById('volume-bar-fill');
  const volumePctLabel = document.getElementById('volume-pct-label');
  const continuousPlayVal = document.getElementById('continuous-play-val');
  const hwAccelVal = document.getElementById('hw-accel-val');
  const powerSourceVal = document.getElementById('power-source-val');

  const secondarySection = document.getElementById('secondary-streams-section');
  const secondaryStreamsList = document.getElementById('secondary-streams-list');
  const secondaryCountBadge = document.getElementById('secondary-count-badge');

  const heatmapGrid = document.getElementById('heatmap-grid');
  const heatmapDateLabel = document.getElementById('heatmap-date-label');

  const btnSnooze = document.getElementById('btn-snooze');
  const btnAbort = document.getElementById('btn-abort');
  const btnPause = document.getElementById('btn-pause');
  const pauseBtnLabel = document.getElementById('pause-btn-label');

  const pinModal = document.getElementById('pin-modal');
  const pinInput = document.getElementById('pin-input');
  const btnSavePin = document.getElementById('btn-save-pin');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnLockSettings = document.getElementById('btn-lock-settings');
  const toastContainer = document.getElementById('toast-container');

  // Initialize Radial Progress Ring
  if (radialProgress) {
    radialProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
    radialProgress.style.strokeDashoffset = '0';
  }

  // Toast Helper
  function showToast(message, durationMs = 2500) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 60);
    }, durationMs);
  }

  // Haptic feedback for bedside remote touch operations
  function triggerHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }
  }

  // Headers helper with PIN authentication
  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (currentPin) {
      headers['X-PIN'] = currentPin;
    }
    return headers;
  }

  // Reactive DOM Update from Snapshot
  function updateDashboard(snapshot) {
    if (!snapshot || !snapshot.success) return;

    // 1. Connection Indicator
    if (connDot) {
      connDot.className = 'conn-dot online';
      connText.textContent = isPollingFallback ? 'POLL' : 'LIVE';
    }

    // 2. Verdict & Status Pill
    const isVideo = Boolean(snapshot.is_video_playing);
    const countdown = snapshot.countdown || snapshot.countdown_status || {};
    const isWarning = Boolean(countdown.is_warning);
    const isSnoozed = Boolean(countdown.is_snoozed);

    if (statusPill && statusLabel) {
      if (isWarning) {
        statusPill.className = 'status-pill status-warning';
        statusLabel.textContent = 'INACTIVITY THRESHOLD MET (आइडल थ्रेशोल्ड पूर्ण)';
      } else if (isVideo) {
        statusPill.className = 'status-pill status-active';
        statusLabel.textContent = 'ACTIVE VIDEO (सक्रिय वीडियो)';
      } else {
        statusPill.className = 'status-pill status-idle';
        statusLabel.textContent = 'IDLE / AUDIO (आइडल / ऑडियो)';
      }
    }

    if (verdictTag) verdictTag.textContent = `VERDICT: ${snapshot.verdict || (isVideo ? 'BUSY' : 'IDLE')}`;
    if (confidenceTag) {
      const confPct = Math.round((snapshot.confidence || (isVideo ? 0.95 : 1.0)) * 100);
      confidenceTag.textContent = `CONFIDENCE: ${confPct}%`;
    }

    // 3. Countdown & Radial Meter
    const countdownSec = countdown.remaining_countdown !== undefined ? countdown.remaining_countdown : 60;
    const totalSec = countdown.total_countdown || 60;
    const progress = Math.max(0, Math.min(1, totalSec > 0 ? countdownSec / totalSec : 0));

    if (countdownTimer) {
      countdownTimer.textContent = countdown.formatted_countdown || '--:--';
    }
    if (countdownStateBadge) {
      countdownStateBadge.textContent = countdown.state || 'STANDBY';
      if (isWarning) {
        countdownStateBadge.className = 'badge badge-coral';
      } else if (isSnoozed) {
        countdownStateBadge.className = 'badge badge-amber';
      } else {
        countdownStateBadge.className = 'badge';
      }
    }

    if (radialProgress) {
      const offset = CIRCUMFERENCE * (1 - progress);
      radialProgress.style.strokeDashoffset = `${offset}`;
      if (isWarning) {
        radialProgress.className = 'radial-progress warning';
      } else if (isSnoozed) {
        radialProgress.className = 'radial-progress snoozed';
      } else {
        radialProgress.className = 'radial-progress';
      }
    }

    if (snoozeIndicator) {
      snoozeIndicator.style.display = isSnoozed ? 'inline' : 'none';
      if (isSnoozed && countdown.snooze_remaining) {
        snoozeIndicator.textContent = `+${Math.ceil(countdown.snooze_remaining / 60)}m SNOOZED`;
      }
    }

    if (graceVal) {
      graceVal.textContent = countdown.remaining_grace !== undefined ? `${Math.round(countdown.remaining_grace)}s` : '--';
    }
    if (thresholdVal) {
      thresholdVal.textContent = `${Math.round(snapshot.idle_threshold || 60)}s`;
    }
    if (idleVal) {
      idleVal.textContent = `${snapshot.idle_seconds || 0}s`;
    }

    // 4. Primary Media Stream
    const primary = snapshot.primary_stream || {};
    if (mediaTitle) {
      mediaTitle.textContent = primary.title || (isVideo ? 'Active Video Playback' : 'No active video stream');
    }
    if (playerBadge) {
      playerBadge.textContent = primary.player || (isVideo ? 'Video Player' : 'NO PLAYER');
    }
    if (platformTag) {
      platformTag.textContent = primary.platform || 'Streaming Media';
    }
    if (fullscreenBadge) {
      fullscreenBadge.textContent = primary.fullscreen || 'WINDOWED';
    }
    if (playbackStateTag) {
      playbackStateTag.textContent = primary.playback_state || (isVideo ? 'PLAYING' : 'STOPPED');
    }

    // Volume & Power
    const volPct = primary.volume_percent !== undefined ? primary.volume_percent : 100;
    if (volumeBarFill) {
      volumeBarFill.style.width = `${Math.max(0, Math.min(100, volPct))}%`;
    }
    if (volumePctLabel) {
      volumePctLabel.textContent = `${volPct}%`;
    }

    if (continuousPlayVal) {
      const cSec = Math.round(primary.continuous_play_seconds || 0);
      const h = Math.floor(cSec / 3600);
      const m = Math.floor((cSec % 3600) / 60);
      const s = cSec % 60;
      continuousPlayVal.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    const power = snapshot.power || snapshot.power_status || {};
    if (powerSourceVal) {
      powerSourceVal.textContent = power.power_source_str || (power.on_ac ? 'AC Mains' : `${power.battery_percent}% Battery`);
    }

    // 5. Secondary Streams
    const secondaryList = snapshot.secondary_streams || [];
    const ghostList = snapshot.ghost_streams || [];
    const totalSecondary = secondaryList.length + ghostList.length;

    if (secondarySection && secondaryStreamsList && secondaryCountBadge) {
      if (totalSecondary > 0) {
        secondarySection.style.display = 'block';
        secondaryCountBadge.textContent = `${totalSecondary} ACTIVE`;
        secondaryStreamsList.innerHTML = '';

        secondaryList.forEach(item => {
          const div = document.createElement('div');
          div.className = 'stream-item';
          div.innerHTML = `
            <div class="stream-item-info">
              <span class="stream-item-title">${item.title || 'Concurrent Stream'}</span>
              <span class="stream-item-sub">${item.player || ''} • ${item.platform || ''}</span>
            </div>
            <span class="tag tag-cyan">CONCURRENT</span>
          `;
          secondaryStreamsList.appendChild(div);
        });

        ghostList.forEach(item => {
          const div = document.createElement('div');
          div.className = 'stream-item';
          div.innerHTML = `
            <div class="stream-item-info">
              <span class="stream-item-title">${item.window_title || item.clean_title || 'Ghost Stream'}</span>
              <span class="stream-item-sub">${item.process_name || ''} • Minimized Audio</span>
            </div>
            <span class="tag tag-amber">GHOST AUDIO</span>
          `;
          secondaryStreamsList.appendChild(div);
        });
      } else {
        secondarySection.style.display = 'none';
      }
    }

    // 6. Pause Button state
    if (pauseBtnLabel) {
      pauseBtnLabel.textContent = snapshot.is_paused ? 'RESUME' : 'PAUSE';
    }
  }

  // Connect SSE Telemetry Stream
  function connectSSE() {
    if (eventSource) {
      try { eventSource.close(); } catch (e) {}
      eventSource = null;
    }

    let url = '/api/telemetry/events';
    if (currentPin) {
      url += `?pin=${encodeURIComponent(currentPin)}`;
    }

    try {
      eventSource = new EventSource(url);

      eventSource.onopen = function () {
        isPollingFallback = false;
        reconnectDelay = 1000;
        if (connDot) connDot.className = 'conn-dot online';
        if (connText) connText.textContent = 'LIVE';
      };

      eventSource.onmessage = function (event) {
        try {
          const snapshot = JSON.parse(event.data);
          updateDashboard(snapshot);
        } catch (err) {
          console.error('Error parsing SSE payload:', err);
        }
      };

      eventSource.onerror = function () {
        if (connDot) connDot.className = 'conn-dot offline';
        if (connText) connText.textContent = 'RETRY';
        if (eventSource) {
          try { eventSource.close(); } catch (e) {}
          eventSource = null;
        }

        // Trigger fallback polling while reconnecting
        startPollingFallback();

        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 1.5, 10000);
          connectSSE();
        }, reconnectDelay);
      };
    } catch (err) {
      startPollingFallback();
    }
  }

  // Fallback Polling if EventSource is unavailable or blocked
  function startPollingFallback() {
    if (isPollingFallback) return;
    isPollingFallback = true;
    if (pollingInterval) clearInterval(pollingInterval);

    fetchSnapshot();
    pollingInterval = setInterval(fetchSnapshot, 2000);
  }

  async function fetchSnapshot() {
    try {
      let url = '/api/status';
      if (currentPin) url += `?pin=${encodeURIComponent(currentPin)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.status === 401) {
        promptPinModal();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        updateDashboard(data);
      }
    } catch (e) {
      if (connDot) connDot.className = 'conn-dot offline';
      if (connText) connText.textContent = 'OFFLINE';
    }
  }

  // Fetch 24-Hour Heatmap
  async function loadTodayHeatmap() {
    if (!heatmapGrid) return;
    try {
      let url = '/api/analytics/today';
      if (currentPin) url += `?pin=${encodeURIComponent(currentPin)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const heatmap = data.heatmap || [];
        if (heatmapDateLabel && data.date) {
          heatmapDateLabel.textContent = data.date;
        }

        heatmapGrid.innerHTML = '';
        heatmap.forEach(h => {
          const bar = document.createElement('div');
          bar.className = 'heatmap-bar';

          const vSec = h.video_sec || 0;
          const aSec = h.audio_sec || 0;
          const totalActivity = vSec + aSec;

          if (vSec > 0) {
            bar.classList.add('video-active');
            const pct = Math.min(100, Math.max(15, (vSec / 3600) * 100));
            bar.style.height = `${pct}%`;
          } else if (aSec > 0) {
            bar.classList.add('audio-active');
            const pct = Math.min(100, Math.max(15, (aSec / 3600) * 100));
            bar.style.height = `${pct}%`;
          } else {
            bar.style.height = '6%';
          }

          bar.title = `${h.hour_label || `${h.hour}:00`}: ${h.video_formatted || '00m'} Video Watch`;
          heatmapGrid.appendChild(bar);
        });
      }
    } catch (e) {
      console.warn('Failed to load today heatmap:', e);
    }
  }

  // Remote Control Handlers
  async function handleSnooze() {
    triggerHaptic();
    try {
      let url = '/api/control/snooze';
      if (currentPin) url += `?pin=${encodeURIComponent(currentPin)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ seconds: 900 })
      });
      if (res.status === 401) {
        promptPinModal();
        return;
      }
      const data = await res.json();
      showToast(data.message || 'Countdown postponed by 15m');
      fetchSnapshot();
    } catch (err) {
      showToast('Error communicating with sentinel');
    }
  }

  async function handleAbort() {
    triggerHaptic();
    try {
      let url = '/api/control/abort';
      if (currentPin) url += `?pin=${encodeURIComponent(currentPin)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (res.status === 401) {
        promptPinModal();
        return;
      }
      const data = await res.json();
      showToast(data.message || 'Shutdown cancelled');
      fetchSnapshot();
    } catch (err) {
      showToast('Error communicating with sentinel');
    }
  }

  async function handlePause() {
    triggerHaptic();
    try {
      let url = '/api/control/pause';
      if (currentPin) url += `?pin=${encodeURIComponent(currentPin)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (res.status === 401) {
        promptPinModal();
        return;
      }
      const data = await res.json();
      showToast(data.message || (data.is_paused ? 'Sentinel paused' : 'Sentinel resumed'));
      fetchSnapshot();
    } catch (err) {
      showToast('Error communicating with sentinel');
    }
  }

  // PIN Modal Management
  function promptPinModal() {
    if (pinModal) {
      pinModal.style.display = 'flex';
      if (pinInput) {
        pinInput.value = currentPin;
        pinInput.focus();
      }
    }
  }

  function closePinModal() {
    if (pinModal) pinModal.style.display = 'none';
  }

  function savePin() {
    if (!pinInput) return;
    const val = pinInput.value.trim();
    if (val) {
      currentPin = val;
      localStorage.setItem('sentinel_pin', currentPin);
      showToast('PIN saved');
      closePinModal();
      connectSSE();
      fetchSnapshot();
      loadTodayHeatmap();
    }
  }

  // Event Listeners
  if (btnSnooze) btnSnooze.addEventListener('click', handleSnooze);
  if (btnAbort) btnAbort.addEventListener('click', handleAbort);
  if (btnPause) btnPause.addEventListener('click', handlePause);

  if (btnLockSettings) btnLockSettings.addEventListener('click', promptPinModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closePinModal);
  if (btnSavePin) btnSavePin.addEventListener('click', savePin);

  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') savePin();
    });
  }

  // Initial Boot
  connectSSE();
  fetchSnapshot();
  loadTodayHeatmap();

  // Periodic Heatmap Refresh (Every 60s)
  setInterval(loadTodayHeatmap, 60000);

})();
