'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const bom = Buffer.from([0xef, 0xbb, 0xbf]);

function readUtf8WithBOM(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return content;
}

function writeUtf8WithBOM(filePath, content) {
  const norm = content.replace(/\r\n/g, '\n');
  const buf = Buffer.concat([bom, Buffer.from(norm, 'utf8')]);
  fs.writeFileSync(filePath, buf);
}

// =============================================================================
// 1. Update dashboard/dashboard.html
// =============================================================================
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
let html = readUtf8WithBOM(htmlPath);

// 1.1 Nav text & tooltip
const navTarget = '<span id="navWellbeingText" class="nav-text">Focus & Wellbeing</span>';
const navReplacement = '<span id="navWellbeingText" class="nav-text" data-i18n="nav_wellbeing">Focus & Sleep Hub</span>';
if (html.includes(navTarget)) {
  html = html.replace(navTarget, navReplacement);
}

const hudTooltipTarget = 'title="Focus Sentinel State (Click to switch to Focus &amp; Wellbeing)"';
const hudTooltipReplacement = 'title="Focus &amp; Sleep Sentinel State (Click to switch to Focus &amp; Sleep Hub)"';
if (html.includes(hudTooltipTarget)) {
  html = html.replace(hudTooltipTarget, hudTooltipReplacement);
}

// 1.2 Insert #cardSleepSentinelHub into #tabContentWellbeing after #widgetPomodoroSentinel
const pomodoroEndMarker = `                <div class="pomodoro-hero-actions pomodoro-controls">
                  <button type="button" id="btnStartPomodoro" class="btn-pomodoro primary">▶️ Start Focus</button>
                  <button type="button" id="btnPausePomodoro" class="btn-pomodoro">⏸️ Pause</button>
                  <button type="button" id="btnResetPomodoro" class="btn-pomodoro">🔄 Reset</button>
                </div>
              </div>
            </div>`;

const sleepHubCardHtml = `

            <!-- Pillar 1.5: Sleep Sentinel Hub & Radial Countdown Dial -->
            <div id="cardSleepSentinelHub" class="bento-card liquid-glass-card bento-span-6 sleep-hero-card">
              <div class="card-header-row settings-card-header">
                <span class="card-icon settings-card-icon">🌙</span>
                <div class="card-title-group settings-card-title-group">
                  <h3 id="txtSleepSentinelTitle" class="card-heading settings-card-title">Sleep Sentinel Hub</h3>
                  <span id="txtSleepSentinelDesc" class="settings-card-sub">Automated playback cutoff, gentle audio fade-out, and bedtime recovery</span>
                </div>
                <div class="sleep-header-status-group">
                  <span id="dashSleepActiveDot" class="status-indicator-dot hidden" aria-hidden="true"></span>
                  <span id="dashSleepStatusBadge" class="dash-sleep-badge idle">IDLE</span>
                </div>
              </div>

              <div class="dash-sleep-hero-body">
                <!-- SVG Radial Progress Dial -->
                <div class="dash-sleep-dial-wrapper">
                  <svg class="dash-sleep-svg-dial" width="140" height="140" viewBox="0 0 120 120" role="img" aria-label="Sleep Timer Countdown Dial">
                    <circle
                      class="dash-sleep-dial-track"
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="8"
                    />
                    <circle
                      id="dashSleepDialProgress"
                      class="dash-sleep-dial-progress"
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="8"
                      stroke-linecap="round"
                      stroke-dasharray="339.292"
                      stroke-dashoffset="339.292"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div class="dash-sleep-dial-center-content">
                    <div id="dashSleepCountdownDisplay" class="dash-sleep-big-time" aria-live="polite">00:00</div>
                    <div id="dashSleepFinishTime" class="dash-sleep-finish-time">No active timer</div>
                  </div>
                </div>

                <!-- Duration Presets (15m, 30m, 45m, 60m, 90m, 120m) -->
                <div class="dash-sleep-presets-container">
                  <span class="dash-sleep-section-label">Quick Presets</span>
                  <div class="dash-sleep-presets-grid">
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="15">15m</button>
                    <button type="button" class="dash-sleep-preset-btn active" data-minutes="30">30m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="45">45m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="60">60m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="90">90m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="120">120m</button>
                  </div>
                </div>

                <!-- Quick Extenders (+5m, +15m) & Actions -->
                <div class="dash-sleep-controls-panel">
                  <div class="dash-sleep-extender-group">
                    <span class="dash-sleep-section-label">Extend Time</span>
                    <div class="dash-sleep-extender-buttons">
                      <button type="button" id="btnDashSleepExtend5" class="dash-sleep-extender-btn" data-add="5">+5m</button>
                      <button type="button" id="btnDashSleepExtend15" class="dash-sleep-extender-btn" data-add="15">+15m</button>
                    </div>
                  </div>
                  <div class="dash-sleep-actions-group">
                    <button type="button" id="btnDashSleepToggle" class="btn-sleep-primary">
                      <span id="btnDashSleepToggleIcon">▶️</span>
                      <span id="btnDashSleepToggleText">Start Sleep Timer</span>
                    </button>
                    <button type="button" id="btnDashSleepReset" class="btn-sleep-secondary">
                      <span>🔄</span>
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                <!-- Feature Toggles -->
                <div class="dash-sleep-toggles-container">
                  <label class="dash-sleep-toggle-row" for="toggleDashSleepFade">
                    <span class="toggle-text-group">
                      <span class="toggle-title">Gradual Audio Fade-out</span>
                      <span class="toggle-desc">Smoothly lower volume 30s before cutoff to prevent sudden waking</span>
                    </span>
                    <input type="checkbox" id="toggleDashSleepFade" class="styled-checkbox" checked>
                  </label>
                  <label class="dash-sleep-toggle-row" for="toggleDashSleepEndOfVideo">
                    <span class="toggle-text-group">
                      <span class="toggle-title">Stop at End of Video</span>
                      <span class="toggle-desc">Trigger cutoff as soon as the current playing video finishes</span>
                    </span>
                    <input type="checkbox" id="toggleDashSleepEndOfVideo" class="styled-checkbox">
                  </label>
                </div>
              </div>
            </div>`;

if (!html.includes('id="cardSleepSentinelHub"')) {
  const normHtml = html.replace(/\r\n/g, '\n');
  const normMarker = pomodoroEndMarker.replace(/\r\n/g, '\n');
  if (!normHtml.includes(normMarker)) {
    throw new Error('pomodoroEndMarker not found in dashboard.html');
  }
  html = normHtml.replace(normMarker, normMarker + sleepHubCardHtml);
}

writeUtf8WithBOM(htmlPath, html);
console.log('✅ dashboard/dashboard.html updated successfully.');

// =============================================================================
// 2. Update dashboard/dashboard.css
// =============================================================================
const cssPath = path.join(rootDir, 'dashboard', 'dashboard.css');
let css = readUtf8WithBOM(cssPath);

const sleepHubCss = `
/* ========================================================================== */
/* SECTION: SLEEP SENTINEL HUB & RADIAL DIAL (DASHBOARD WELLBEING)            */
/* ========================================================================== */

.sleep-hero-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: rgba(18, 22, 34, 0.75);
  border: 1px solid rgba(99, 102, 241, 0.22);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.65), 0 0 24px -4px rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.sleep-hero-card:hover {
  border-color: rgba(99, 102, 241, 0.38);
  box-shadow: 0 14px 40px -8px rgba(0, 0, 0, 0.7), 0 0 28px -2px rgba(99, 102, 241, 0.2);
}

.sleep-header-status-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.dash-sleep-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  transition: all 0.25s ease;
}

.dash-sleep-badge.idle {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.dash-sleep-badge.running {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
}

.dash-sleep-badge.paused {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.dash-sleep-badge.fading {
  background: rgba(192, 132, 252, 0.15);
  color: #c084fc;
  border: 1px solid rgba(192, 132, 252, 0.4);
  animation: pulseFading 1.5s infinite;
}

.dash-sleep-badge.triggered {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.4);
}

@keyframes pulseFading {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(0.97); }
}

.dash-sleep-hero-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
}

.dash-sleep-dial-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
}

.dash-sleep-svg-dial {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.dash-sleep-dial-track {
  stroke: rgba(255, 255, 255, 0.08);
}

.dash-sleep-dial-progress {
  stroke: #38bdf8;
  transition: stroke-dashoffset 0.35s ease, stroke 0.35s ease;
}

.dash-sleep-dial-center-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.dash-sleep-big-time {
  font-size: 1.75rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #f8fafc;
  letter-spacing: -0.02em;
  text-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
}

.dash-sleep-finish-time {
  font-size: 0.72rem;
  font-weight: 500;
  color: #94a3b8;
  margin-top: 0.15rem;
}

.dash-sleep-presets-container,
.dash-sleep-extender-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.dash-sleep-section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dash-sleep-presets-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  width: 100%;
}

.dash-sleep-preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.45rem 0.2rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.dash-sleep-preset-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
  color: #f8fafc;
}

.dash-sleep-preset-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
}

.dash-sleep-controls-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.dash-sleep-extender-buttons {
  display: flex;
  gap: 0.5rem;
}

.dash-sleep-extender-btn {
  flex: 1;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #c7d2fe;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dash-sleep-extender-btn:hover {
  background: rgba(99, 102, 241, 0.25);
  border-color: #818cf8;
  color: #ffffff;
}

.dash-sleep-actions-group {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.btn-sleep-primary {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
  transition: all 0.25s ease;
}

.btn-sleep-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-sleep-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sleep-secondary:hover {
  background: rgba(244, 63, 94, 0.15);
  border-color: rgba(244, 63, 94, 0.4);
  color: #f43f5e;
}

.dash-sleep-toggles-container {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.85rem;
}

.dash-sleep-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 1rem;
}

.dash-sleep-toggle-row .toggle-text-group {
  display: flex;
  flex-direction: column;
}

.dash-sleep-toggle-row .toggle-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e2e8f0;
}

.dash-sleep-toggle-row .toggle-desc {
  font-size: 0.72rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .dash-sleep-presets-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dash-sleep-badge.fading {
    animation: none;
  }
  .btn-sleep-primary:hover {
    transform: none;
  }
}
`;

if (!css.includes('.sleep-hero-card')) {
  css = css.trimEnd() + '\n' + sleepHubCss;
  writeUtf8WithBOM(cssPath, css);
  console.log('✅ dashboard/dashboard.css updated successfully.');
} else {
  console.log('ℹ️ dashboard/dashboard.css already contains .sleep-hero-card');
}

// =============================================================================
// 3. Update dashboard/dashboard.js
// =============================================================================
const jsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
let js = readUtf8WithBOM(jsPath);

// 3.1 i18n English dictionary
const enWellbeingTarget = "nav_wellbeing: 'Focus & Wellbeing',";
const enWellbeingReplacement = "nav_wellbeing: 'Focus & Sleep Hub',\n    sleep_sentinel_title: 'Sleep Sentinel Hub',\n    sleep_sentinel_desc: 'Automated playback cutoff, gentle audio fade-out, and bedtime recovery',";

if (js.includes(enWellbeingTarget)) {
  js = js.replace(enWellbeingTarget, enWellbeingReplacement);
}

// 3.2 i18n Hindi dictionary
const hiWellbeingTarget = "nav_wellbeing: 'फोकस व वेलबीइंग',";
const hiWellbeingReplacement = "nav_wellbeing: 'फोकस व स्लीप हब',\n    sleep_sentinel_title: 'स्लीप सेंटिनल हब',\n    sleep_sentinel_desc: 'स्वचालित प्लेबैक कटऑफ, क्रमिक ऑडियो फेड-आउट व स्लीप टाइमर',";

if (js.includes(hiWellbeingTarget)) {
  js = js.replace(hiWellbeingTarget, hiWellbeingReplacement);
}

// 3.3 applyLanguage txtSleepSentinelTitle
const langHookTarget = "setTxt('txtPomodoroTitle', 'pomodoro_title');";
const langHookReplacement = "setTxt('txtPomodoroTitle', 'pomodoro_title');\n  setTxt('txtSleepSentinelTitle', 'sleep_sentinel_title');\n  setTxt('txtSleepSentinelDesc', 'sleep_sentinel_desc');";

if (js.includes(langHookTarget) && !js.includes('txtSleepSentinelTitle')) {
  js = js.replace(langHookTarget, langHookReplacement);
}

// 3.4 Sleep Sentinel Hub Controller (Top-level, before // Bootstrap Initialization)
const sleepHubLogic = `
// =============================================================================
// Sleep Sentinel Hub & Radial Dial Controller (Dashboard Wellbeing Pane)
// =============================================================================
const DASH_SLEEP_CIRCUMFERENCE = 339.292; // 2 * Math.PI * 54
let currentDashSleepTimer = null;
let dashSleepTickerInterval = null;
let selectedDashSleepMinutes = 30;

/**
 * Updates SVG radial progress circle stroke-dashoffset and color
 */
function updateDashSleepDial(remainingMs, totalDurationMs, isRunning, isPaused, isFading) {
  if (typeof document === 'undefined') return;
  const circle = document.getElementById('dashSleepDialProgress');
  if (!circle) return;

  if (totalDurationMs <= 0 || remainingMs <= 0 || (!isRunning && !isPaused && !isFading)) {
    circle.setAttribute('stroke-dashoffset', String(DASH_SLEEP_CIRCUMFERENCE));
    circle.style.stroke = '#38bdf8';
    return;
  }

  const ratio = Math.max(0, Math.min(1, remainingMs / totalDurationMs));
  const offset = DASH_SLEEP_CIRCUMFERENCE * (1 - ratio);
  circle.setAttribute('stroke-dashoffset', String(offset.toFixed(2)));

  if (isFading) {
    circle.style.stroke = '#c084fc';
  } else if (isPaused) {
    circle.style.stroke = '#fbbf24';
  } else if (ratio < 0.15) {
    circle.style.stroke = '#ef4444';
  } else if (ratio < 0.5) {
    circle.style.stroke = '#eab308';
  } else {
    circle.style.stroke = '#38bdf8';
  }
}

/**
 * Renders sleep timer state into the dashboard hub DOM elements
 */
function renderDashSleepTimer(timer) {
  if (typeof document === 'undefined') return;
  currentDashSleepTimer = timer || { state: 'IDLE' };
  const countdownEl = document.getElementById('dashSleepCountdownDisplay');
  const finishTimeEl = document.getElementById('dashSleepFinishTime');
  const badgeEl = document.getElementById('dashSleepStatusBadge');
  const activeDot = document.getElementById('dashSleepActiveDot');
  const btnToggle = document.getElementById('btnDashSleepToggle');
  const btnToggleIcon = document.getElementById('btnDashSleepToggleIcon');
  const btnToggleText = document.getElementById('btnDashSleepToggleText');

  const isIdle = !timer || timer.state === 'IDLE' || timer.state === 'CANCELLED' || !timer.targetTime;

  if (isIdle) {
    if (countdownEl) countdownEl.textContent = '00:00';
    if (finishTimeEl) finishTimeEl.textContent = 'No active timer';
    if (badgeEl) {
      badgeEl.textContent = 'IDLE';
      badgeEl.className = 'dash-sleep-badge idle';
    }
    if (activeDot) activeDot.classList.add('hidden');
    if (btnToggleIcon) btnToggleIcon.textContent = '▶️';
    if (btnToggleText) btnToggleText.textContent = 'Start Sleep Timer';
    if (btnToggle) btnToggle.className = 'btn-sleep-primary';
    updateDashSleepDial(0, 1, false, false, false);
    stopDashSleepTicker();
    return;
  }

  const now = Date.now();
  const isPaused = timer.state === 'PAUSED';
  const isRunning = timer.state === 'RUNNING';
  const isFading = timer.state === 'FADING';

  const remainingMs = isPaused
    ? (timer.remainingMs || Math.max(0, timer.targetTime - (timer.pausedAt || now)))
    : Math.max(0, timer.targetTime - now);
  const totalMs = timer.durationMs || (timer.durationMinutes * 60 * 1000) || 1;

  const totalSecs = Math.max(0, Math.ceil(remainingMs / 1000));
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const timeStr = hrs > 0
    ? \`\${String(hrs).padStart(2, '0')}:\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`
    : \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;

  if (countdownEl) countdownEl.textContent = timeStr;

  if (finishTimeEl) {
    const projectedTarget = isPaused ? (now + remainingMs) : timer.targetTime;
    const d = new Date(projectedTarget);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    finishTimeEl.textContent = \`Sleep at \${h}:\${m} \${ampm}\`;
  }

  if (badgeEl) {
    badgeEl.textContent = timer.state;
    badgeEl.className = \`dash-sleep-badge \${timer.state.toLowerCase()}\`;
  }

  if (activeDot) activeDot.classList.toggle('hidden', isIdle);

  if (btnToggleText && btnToggleIcon) {
    if (isRunning || isFading) {
      btnToggleIcon.textContent = '⏸️';
      btnToggleText.textContent = 'Pause Timer';
    } else if (isPaused) {
      btnToggleIcon.textContent = '▶️';
      btnToggleText.textContent = 'Resume Timer';
    } else {
      btnToggleIcon.textContent = '▶️';
      btnToggleText.textContent = 'Start Sleep Timer';
    }
  }

  // Highlight active preset button if match
  document.querySelectorAll('.dash-sleep-preset-btn').forEach(btn => {
    const minsPreset = parseInt(btn.getAttribute('data-minutes'), 10);
    btn.classList.toggle('active', minsPreset === timer.durationMinutes);
  });

  updateDashSleepDial(remainingMs, totalMs, isRunning, isPaused, isFading);

  if ((isRunning || isFading) && !dashSleepTickerInterval) {
    startDashSleepTicker();
  } else if (isPaused) {
    stopDashSleepTicker();
  }
}

function startDashSleepTicker() {
  stopDashSleepTicker();
  dashSleepTickerInterval = setInterval(() => {
    if (currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING')) {
      const now = Date.now();
      if (currentDashSleepTimer.targetTime <= now) {
        stopDashSleepTicker();
        fetchSleepTimerState();
      } else {
        renderDashSleepTimer(currentDashSleepTimer);
      }
    } else {
      stopDashSleepTicker();
    }
  }, 1000);
}

function stopDashSleepTicker() {
  if (dashSleepTickerInterval) {
    clearInterval(dashSleepTickerInterval);
    dashSleepTickerInterval = null;
  }
}

/**
 * Fetches latest sleep timer and settings from browser runtime / storage
 */
function fetchSleepTimerState() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_SLEEP_TIMER_STATE' }, (res) => {
        if (res && res.success && res.state) {
          renderDashSleepTimer(res.state);
        } else {
          loadSleepTimerFromStorage();
        }
      });
    } else {
      loadSleepTimerFromStorage();
    }
  } catch (_) {
    loadSleepTimerFromStorage();
  }
}

function loadSleepTimerFromStorage() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['sentinel_sleep_timer', 'sentinel_sleep_settings'], (res) => {
        if (res && res.sentinel_sleep_timer) {
          renderDashSleepTimer(res.sentinel_sleep_timer);
        }
        if (res && res.sentinel_sleep_settings) {
          syncSleepSettingsToggles(res.sentinel_sleep_settings);
        }
      });
    }
  } catch (_) {}
}

function syncSleepSettingsToggles(settings) {
  if (typeof document === 'undefined') return;
  const toggleFade = document.getElementById('toggleDashSleepFade');
  if (toggleFade && typeof settings.enableAudioFadeOut === 'boolean') {
    toggleFade.checked = settings.enableAudioFadeOut;
  }
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  if (toggleEndOfVideo && typeof settings.endOfVideo === 'boolean') {
    toggleEndOfVideo.checked = settings.endOfVideo;
  }
}

/**
 * Initializes listeners, presets, and sync hooks for Sleep Sentinel Hub
 */
function initSleepSentinelHub() {
  if (typeof document === 'undefined') return;

  // Preset buttons (15m, 30m, 45m, 60m, 90m, 120m)
  document.querySelectorAll('.dash-sleep-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-sleep-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDashSleepMinutes = parseInt(btn.getAttribute('data-minutes'), 10) || 30;
      
      // If timer is idle, update big display to selected minutes
      if (!currentDashSleepTimer || currentDashSleepTimer.state === 'IDLE' || currentDashSleepTimer.state === 'CANCELLED') {
        const countdownEl = document.getElementById('dashSleepCountdownDisplay');
        if (countdownEl) countdownEl.textContent = \`\${String(selectedDashSleepMinutes).padStart(2, '0')}:00\`;
      } else {
        // If already running or paused, clicking preset immediately sets new duration
        triggerSetSleepTimer(selectedDashSleepMinutes);
      }
    });
  });

  // Extender buttons (+5m, +15m)
  const btnExtend5 = document.getElementById('btnDashSleepExtend5');
  if (btnExtend5) {
    btnExtend5.addEventListener('click', () => triggerExtendSleepTimer(5));
  }
  const btnExtend15 = document.getElementById('btnDashSleepExtend15');
  if (btnExtend15) {
    btnExtend15.addEventListener('click', () => triggerExtendSleepTimer(15));
  }

  // Toggle button (Start / Pause / Resume)
  const btnToggle = document.getElementById('btnDashSleepToggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      if (currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING')) {
        triggerPauseSleepTimer();
      } else if (currentDashSleepTimer && currentDashSleepTimer.state === 'PAUSED') {
        triggerResumeSleepTimer();
      } else {
        triggerSetSleepTimer(selectedDashSleepMinutes);
      }
    });
  }

  // Reset button
  const btnReset = document.getElementById('btnDashSleepReset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      triggerCancelSleepTimer();
    });
  }

  // Toggles change events
  const toggleFade = document.getElementById('toggleDashSleepFade');
  if (toggleFade) {
    toggleFade.addEventListener('change', () => {
      updateSleepSetting('enableAudioFadeOut', toggleFade.checked);
    });
  }
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  if (toggleEndOfVideo) {
    toggleEndOfVideo.addEventListener('change', () => {
      updateSleepSetting('endOfVideo', toggleEndOfVideo.checked);
    });
  }

  // Storage listener for cross-view synchronization
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.sentinel_sleep_timer) {
        renderDashSleepTimer(changes.sentinel_sleep_timer.newValue);
      }
    });
  }

  // Runtime message listener for live broadcast events
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && (msg.type === 'SLEEP_TIMER_STATE_CHANGED' || msg.type === 'SLEEP_TIMER_EXPIRED')) {
        renderDashSleepTimer(msg.state);
      }
    });
  }

  // Initial state hydration
  fetchSleepTimerState();
}

function triggerSetSleepTimer(minutes) {
  if (typeof document === 'undefined') return;
  const toggleFade = document.getElementById('toggleDashSleepFade');
  const enableFade = toggleFade ? toggleFade.checked : true;
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  const endVideo = toggleEndOfVideo ? toggleEndOfVideo.checked : false;

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'SET_SLEEP_TIMER',
      action: 'SET_SLEEP_TIMER',
      durationMinutes: minutes,
      enableFade: enableFade,
      options: { enableFadeOut: enableFade, endOfVideo: endVideo }
    }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerPauseSleepTimer() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'PAUSE_SLEEP_TIMER', action: 'PAUSE_SLEEP_TIMER' }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerResumeSleepTimer() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'RESUME_SLEEP_TIMER', action: 'RESUME_SLEEP_TIMER' }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerExtendSleepTimer(extraMinutes) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'EXTEND_SLEEP_TIMER',
      action: 'EXTEND_SLEEP_TIMER',
      extraMinutes: extraMinutes
    }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerCancelSleepTimer() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'CANCEL_SLEEP_TIMER', action: 'CANCEL_SLEEP_TIMER' }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function updateSleepSetting(key, value) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['sentinel_sleep_settings'], (res) => {
      const settings = (res && res.sentinel_sleep_settings) || {};
      settings[key] = value;
      chrome.storage.local.set({ sentinel_sleep_settings: settings });
    });
  }
}
`;

// Insert sleepHubLogic right BEFORE // Bootstrap Initialization
if (!js.includes('initSleepSentinelHub')) {
  const bootstrapMarker = '// Bootstrap Initialization';
  if (!js.includes(bootstrapMarker)) {
    throw new Error('// Bootstrap Initialization marker not found in dashboard.js');
  }
  js = js.replace(bootstrapMarker, sleepHubLogic + '\n' + bootstrapMarker);

  // Wire into DOMContentLoaded
  const hookTarget = "initAudioVisualizer(document.getElementById('canvasAudioVisualizer'));";
  const hookReplacement = "initAudioVisualizer(document.getElementById('canvasAudioVisualizer'));\n    initSleepSentinelHub();";
  if (js.includes(hookTarget)) {
    js = js.replace(hookTarget, hookReplacement);
  }
}

// 3.5 module.exports exports
const exportTarget = "saveSleepSettings,";
const exportReplacement = "saveSleepSettings,\n    initSleepSentinelHub,\n    renderDashSleepTimer,\n    updateDashSleepDial,\n    fetchSleepTimerState,\n    DASH_SLEEP_CIRCUMFERENCE,";

if (js.includes(exportTarget) && !js.includes('DASH_SLEEP_CIRCUMFERENCE,')) {
  js = js.replace(exportTarget, exportReplacement);
}

writeUtf8WithBOM(jsPath, js);
console.log('✅ dashboard/dashboard.js updated successfully.');

// =============================================================================
// 4. Update popup/popup.js (Harmonize Pause, Resume, Extend)
// =============================================================================
const popupJsPath = path.join(rootDir, 'popup', 'popup.js');
let popupJs = readUtf8WithBOM(popupJsPath);

// Find btnSleepToggleRun listener
const oldTogglePattern = `  const btnSleepToggleRun = document.getElementById('btnSleepToggleRun');
  if (btnSleepToggleRun) {
    btnSleepToggleRun.addEventListener('click', () => {
      if (currentSleepTimer && currentSleepTimer.state === 'RUNNING') {
        const now = Date.now();
        const rem = Math.max(0, currentSleepTimer.targetTime - now);
        currentSleepTimer.state = 'PAUSED';
        currentSleepTimer.remainingMs = rem;
        currentSleepTimer.pausedAt = now;
        try {
          browserAPI.storage.local.set({ sentinel_sleep_timer: currentSleepTimer }, () => {
            renderSleepTimerUI(currentSleepTimer);
            showPopupToast('Sleep timer paused', 'info');
          });
        } catch (_) {
          renderSleepTimerUI(currentSleepTimer);
        }
      } else if (currentSleepTimer && currentSleepTimer.state === 'PAUSED') {
        const now = Date.now();
        const rem = currentSleepTimer.remainingMs || 60000;
        currentSleepTimer.state = 'RUNNING';
        currentSleepTimer.targetTime = now + rem;
        delete currentSleepTimer.remainingMs;
        delete currentSleepTimer.pausedAt;
        try {
          browserAPI.storage.local.set({ sentinel_sleep_timer: currentSleepTimer }, () => {
            renderSleepTimerUI(currentSleepTimer);
            showPopupToast('Sleep timer resumed', 'success');
          });
        } catch (_) {
          renderSleepTimerUI(currentSleepTimer);
        }
      } else {
        startSleepTimerWithMinutes(30);
      }
    });
  }`;

const newToggleBlock = `  const btnSleepToggleRun = document.getElementById('btnSleepToggleRun');
  if (btnSleepToggleRun) {
    btnSleepToggleRun.addEventListener('click', () => {
      if (currentSleepTimer && (currentSleepTimer.state === 'RUNNING' || currentSleepTimer.state === 'FADING')) {
        try {
          browserAPI.runtime.sendMessage({ type: 'PAUSE_SLEEP_TIMER', action: 'PAUSE_SLEEP_TIMER' }, (res) => {
            if (res && res.success && res.state) {
              currentSleepTimer = res.state;
              renderSleepTimerUI(currentSleepTimer);
            } else {
              const now = Date.now();
              const rem = Math.max(0, currentSleepTimer.targetTime - now);
              currentSleepTimer.state = 'PAUSED';
              currentSleepTimer.remainingMs = rem;
              currentSleepTimer.pausedAt = now;
              browserAPI.storage.local.set({ sentinel_sleep_timer: currentSleepTimer }, () => {
                renderSleepTimerUI(currentSleepTimer);
              });
            }
            showPopupToast('Sleep timer paused', 'info');
          });
        } catch (_) {
          const now = Date.now();
          const rem = Math.max(0, currentSleepTimer.targetTime - now);
          currentSleepTimer.state = 'PAUSED';
          currentSleepTimer.remainingMs = rem;
          currentSleepTimer.pausedAt = now;
          browserAPI.storage.local.set({ sentinel_sleep_timer: currentSleepTimer }, () => {
            renderSleepTimerUI(currentSleepTimer);
            showPopupToast('Sleep timer paused', 'info');
          });
        }
      } else if (currentSleepTimer && currentSleepTimer.state === 'PAUSED') {
        try {
          browserAPI.runtime.sendMessage({ type: 'RESUME_SLEEP_TIMER', action: 'RESUME_SLEEP_TIMER' }, (res) => {
            if (res && res.success && res.state) {
              currentSleepTimer = res.state;
              renderSleepTimerUI(currentSleepTimer);
            } else {
              const now = Date.now();
              const rem = currentSleepTimer.remainingMs || 60000;
              currentSleepTimer.state = 'RUNNING';
              currentSleepTimer.targetTime = now + rem;
              delete currentSleepTimer.remainingMs;
              delete currentSleepTimer.pausedAt;
              browserAPI.storage.local.set({ sentinel_sleep_timer: currentSleepTimer }, () => {
                renderSleepTimerUI(currentSleepTimer);
              });
            }
            showPopupToast('Sleep timer resumed', 'success');
          });
        } catch (_) {
          const now = Date.now();
          const rem = currentSleepTimer.remainingMs || 60000;
          currentSleepTimer.state = 'RUNNING';
          currentSleepTimer.targetTime = now + rem;
          delete currentSleepTimer.remainingMs;
          delete currentSleepTimer.pausedAt;
          browserAPI.storage.local.set({ sentinel_sleep_timer: currentSleepTimer }, () => {
            renderSleepTimerUI(currentSleepTimer);
            showPopupToast('Sleep timer resumed', 'success');
          });
        }
      } else {
        startSleepTimerWithMinutes(30);
      }
    });
  }`;

const normPopup = popupJs.replace(/\r\n/g, '\n');
const normOldToggle = oldTogglePattern.replace(/\r\n/g, '\n');

if (normPopup.includes(normOldToggle)) {
  popupJs = normPopup.replace(normOldToggle, newToggleBlock.replace(/\r\n/g, '\n'));
  writeUtf8WithBOM(popupJsPath, popupJs);
  console.log('✅ popup/popup.js updated successfully.');
} else {
  console.log('ℹ️ popup/popup.js toggle block already updated or modified.');
}

console.log('\n🎉 ALL UPDATES APPLIED WITH STRICT UTF-8 BOM PRESERVATION!');
