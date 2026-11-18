'use strict';

/**
 * scripts/apply_ui_container_split.js
 * Applies the 4-container split for Focus Sentinel Hub and Sleep Sentinel Hub
 * in dashboard/dashboard.html, dashboard/dashboard.css, dashboard/styles/wellbeing_blacklist.css,
 * dashboard/dashboard.js, and creates locales/en.json and locales/hi.json.
 * 
 * Invariants:
 * - UTF-8 with BOM on all files (0xEF, 0xBB, 0xBF)
 * - 100% W3C Trusted Types zero-innerHTML safety
 * - Functions <= 50 lines, nesting depth <= 3 (Rule 28)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

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
console.log('1. Updating dashboard/dashboard.html...');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
let html = readUtf8WithBOM(htmlPath);

const p1Start = html.includes('<!-- Pillar 1: Hero Pomodoro Sentinel State Machine Card (Part 1 - Basic')
  ? html.indexOf('<!-- Pillar 1: Hero Pomodoro Sentinel State Machine Card (Part 1 - Basic')
  : html.indexOf('<!-- Pillar 1: Hero Pomodoro Sentinel State Machine Card (Preserves id="widgetPomodoroSentinel") -->');
const p2Start = html.indexOf('<!-- Pillar 2: Domain Daily Time Budgets Card -->');

if (p1Start === -1 || p2Start === -1) {
  throw new Error(`Failed to locate target bounds: p1Start=${p1Start}, p2Start=${p2Start}`);
}

const replacementHtml = `<!-- Pillar 1: Hero Pomodoro Sentinel State Machine Card (Part 1 - Basic, Preserves id="widgetPomodoroSentinel") -->
            <div id="widgetPomodoroSentinel" class="bento-card liquid-glass-card bento-span-6 pomodoro-hero-card">
              <div class="card-header-row settings-card-header">
                <span class="card-icon settings-card-icon">🧘</span>
                <div class="card-title-group settings-card-title-group">
                  <h3 id="txtPomodoroTitle" class="card-heading settings-card-title" data-i18n="pomodoro_title">Focus Sentinel & Pomodoro</h3>
                  <span class="settings-card-sub" data-i18n="pomodoro_desc">Deep work intervals, automated media cutoff & break recovery</span>
                </div>
                <div class="focus-header-status-group">
                  <span id="dashFocusActiveDot" class="status-indicator-dot hidden" aria-hidden="true"></span>
                  <span id="pomodoroModeBadge" class="badge-focus">Focus (25m)</span>
                  <button type="button" id="btnFocusZenExpand" class="btn-zen-expand" title="Enter Full-Screen Zen Mode (ESC to exit)" aria-label="Enter Full-Screen Zen Mode">🧘 Zen Mode</button>
                </div>
              </div>
              <div class="dash-focus-hero-body pomodoro-hero-body">
                <!-- Mode Selector Tabs (Feature 1) -->
                <div class="focus-mode-tabs-row" role="tablist">
                  <button type="button" class="focus-mode-tab active" data-mode="focus" id="tabModeFocus">🎯 Focus (25m)</button>
                  <button type="button" class="focus-mode-tab" data-mode="shortBreak" id="tabModeShortBreak">☕ Short Break (5m)</button>
                  <button type="button" class="focus-mode-tab" data-mode="longBreak" id="tabModeLongBreak">🌿 Long Break (15m)</button>
                </div>

                <!-- 4-Stage Pomodoro Cycle Indicator & Daily Streak (Features 4 & 8) -->
                <div class="focus-cycle-progress-row">
                  <div class="focus-cycle-meta-group">
                    <div id="focusCycleDotsContainer" class="focus-cycle-dots">
                      <span class="cycle-dot active" data-cycle="1" title="Session 1"></span>
                      <span class="cycle-dot" data-cycle="2" title="Session 2"></span>
                      <span class="cycle-dot" data-cycle="3" title="Session 3"></span>
                      <span class="cycle-dot" data-cycle="4" title="Session 4"></span>
                    </div>
                    <span id="focusCycleText" class="focus-cycle-text">Session 1 of 4</span>
                  </div>
                  <div class="focus-streak-and-target">
                    <span id="focusDailyStreakBadge" class="focus-streak-badge" title="Consecutive daily focus streak">🔥 1-Day Streak</span>
                    <div class="focus-target-progress-wrapper">
                      <div class="focus-target-progress-bar">
                        <div id="focusTargetProgressFill" class="target-progress-fill" style="width: 25%;"></div>
                      </div>
                      <span id="focusTargetGoalText" class="target-goal-text">Goal: 0h 45m / 3h 00m</span>
                    </div>
                  </div>
                </div>

                <!-- SVG Radial Progress Dial -->
                <div class="dash-focus-dial-wrapper">
                  <svg class="dash-focus-svg-dial" width="140" height="140" viewBox="0 0 120 120" role="img" aria-label="Focus Countdown Dial">
                    <circle
                      class="dash-focus-dial-track"
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="8"
                    />
                    <circle
                      id="dashFocusDialProgress"
                      class="dash-focus-dial-progress tier-focus"
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="8"
                      stroke-linecap="round"
                      stroke-dasharray="339.292"
                      stroke-dashoffset="0"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div class="dash-focus-dial-center-content">
                    <div id="pomodoroTimeDisplay" class="focus-big-clock" aria-live="polite">25:00</div>
                    <div id="pomodoroFinishTime" class="focus-finish-time">Target: --:--</div>
                    <div id="pomodoroDialTaskPreview" class="focus-dial-task-preview hidden"></div>
                  </div>
                </div>

                <!-- Hidden progress bar for backwards-compatibility -->
                <div id="pomodoroProgressBar" class="hidden" aria-hidden="true" style="width: 100%;"></div>

                <!-- Quick Duration Presets -->
                <div class="dash-focus-presets-container">
                  <div class="presets-header-row">
                    <span class="focus-section-label" data-i18n="lbl_focus_presets">Duration & Presets</span>
                  </div>
                  <div class="dash-focus-presets-grid">
                    <button type="button" class="dash-focus-preset-btn" data-minutes="15">15m</button>
                    <button type="button" class="dash-focus-preset-btn active" data-minutes="25">25m</button>
                    <button type="button" class="dash-focus-preset-btn" data-minutes="45">45m</button>
                    <button type="button" class="dash-focus-preset-btn" data-minutes="60">60m</button>
                  </div>
                </div>

                <!-- Actions Panel -->
                <div class="dash-focus-actions-panel">
                  <div class="dash-focus-actions-group">
                    <button type="button" id="btnStartPomodoro" class="btn-focus-primary">
                      <span id="btnFocusToggleIcon">▶️</span>
                      <span id="btnFocusToggleText" data-i18n="btn_start_focus">Start Focus</span>
                    </button>
                    <button type="button" id="btnPausePomodoro" class="btn-focus-secondary hidden" aria-hidden="true">
                      <span>⏸️</span>
                      <span data-i18n="btn_pomodoro_pause">Pause</span>
                    </button>
                    <button type="button" id="btnResetPomodoro" class="btn-focus-secondary">
                      <span>🔄</span>
                      <span data-i18n="btn_pomodoro_reset">Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pillar 1.5: Sleep Sentinel Hub & Radial Countdown Dial (Part 1 - Basic, Preserves id="cardSleepSentinelHub") -->
            <div id="cardSleepSentinelHub" class="bento-card liquid-glass-card bento-span-6 sleep-hero-card">
              <div class="card-header-row settings-card-header">
                <span class="card-icon settings-card-icon">🌙</span>
                <div class="card-title-group settings-card-title-group">
                  <h3 id="txtSleepSentinelTitle" class="card-heading settings-card-title" data-i18n="sleep_sentinel_title">Sleep Sentinel Hub</h3>
                  <span id="txtSleepSentinelDesc" class="settings-card-sub" data-i18n="sleep_sentinel_desc">Automated playback cutoff, gentle audio fade-out, and bedtime recovery</span>
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
                  <span class="dash-sleep-section-label" data-i18n="lbl_quick_presets">Quick Presets</span>
                  <div class="dash-sleep-presets-grid">
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="15">15m</button>
                    <button type="button" class="dash-sleep-preset-btn active" data-minutes="30">30m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="45">45m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="60">60m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="90">90m</button>
                    <button type="button" class="dash-sleep-preset-btn" data-minutes="120">120m</button>
                  </div>
                </div>

                <!-- Actions Group (Start/Stop toggle & Reset) -->
                <div class="dash-sleep-actions-panel">
                  <div class="dash-sleep-actions-group">
                    <button type="button" id="btnDashSleepToggle" class="btn-sleep-primary">
                      <span id="btnDashSleepToggleIcon">▶️</span>
                      <span id="btnDashSleepToggleText" data-i18n="btn_start_sleep_timer">Start Sleep Timer</span>
                    </button>
                    <button type="button" id="btnDashSleepReset" class="btn-sleep-secondary">
                      <span>🔄</span>
                      <span data-i18n="btn_reset">Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pillar 1B: Focus Advanced Controls Card (Part 2 - Advanced, Placed DIRECTLY UNDERNEATH Part 1) -->
            <div id="widgetFocusAdvanced" class="bento-card liquid-glass-card bento-span-6 pomodoro-advanced-card">
              <div class="card-header-row settings-card-header">
                <span class="card-icon settings-card-icon">⚙️</span>
                <div class="card-title-group settings-card-title-group">
                  <h3 id="txtFocusAdvancedTitle" class="card-heading settings-card-title" data-i18n="focus_advanced_title">Focus Advanced Controls</h3>
                  <span id="txtFocusAdvancedDesc" class="settings-card-sub" data-i18n="focus_advanced_desc">Custom goals, ambient soundscapes, acoustic chimes & smart shields</span>
                </div>
              </div>
              <div class="pomodoro-advanced-body">
                <!-- Task Intent / Goal Input (Feature 2) -->
                <div class="focus-goal-input-row">
                  <input type="text" id="inputFocusGoal" class="styled-input focus-goal-input" placeholder="🎯 What are you focusing on? (e.g. Code Review, Research)...">
                  <div id="chipActiveFocusGoal" class="chip-active-focus-goal hidden">
                    <span class="chip-icon">🎯</span>
                    <span id="txtActiveFocusGoal" class="chip-text"></span>
                    <button type="button" id="btnClearFocusGoal" class="chip-clear" title="Clear task">✕</button>
                  </div>
                </div>

                <!-- Custom Minutes Stepper & Quick Extenders -->
                <div class="focus-advanced-stepper-extender-row">
                  <div class="focus-custom-minute-stepper">
                    <label for="inputFocusCustomMinutes" class="stepper-label" data-i18n="lbl_custom">Custom:</label>
                    <input type="number" id="inputFocusCustomMinutes" class="styled-input stepper-input" min="1" max="180" value="25" aria-label="Custom Focus Minutes">
                    <span class="stepper-unit">min</span>
                    <button type="button" id="btnApplyCustomMinutes" class="btn-stepper-apply" data-i18n="btn_set">Set</button>
                  </div>
                  <div class="dash-focus-extender-group">
                    <span class="focus-section-label" data-i18n="lbl_extend_time">Extend Time</span>
                    <div class="dash-focus-extender-buttons">
                      <button type="button" id="btnFocusExtend5" class="dash-focus-extender-btn" data-add="5">+5m</button>
                      <button type="button" id="btnFocusExtend15" class="dash-focus-extender-btn" data-add="15">+15m</button>
                    </div>
                  </div>
                </div>

                <!-- Ambient Soundscapes Generator Bar (Feature 5) -->
                <div class="focus-soundscape-panel">
                  <div class="soundscape-header">
                    <span class="soundscape-title" data-i18n="focus_ambient_soundscapes">🎧 Ambient Soundscapes</span>
                    <select id="selectFocusSoundscape" class="styled-select soundscape-select" aria-label="Ambient Soundscape Selector">
                      <option value="none" selected data-i18n="soundscape_opt_none">Off (Silent)</option>
                      <option value="rain" data-i18n="soundscape_opt_rain">🌧️ Gentle Rain</option>
                      <option value="cafe" data-i18n="soundscape_opt_cafe">☕ Coffee Shop</option>
                      <option value="ocean" data-i18n="soundscape_opt_ocean">🌊 Ocean Waves</option>
                      <option value="forest" data-i18n="soundscape_opt_forest">🌲 Forest Birds</option>
                      <option value="whitenoise" data-i18n="soundscape_opt_whitenoise">💨 Pink/White Noise</option>
                    </select>
                    <button type="button" id="btnToggleSoundscape" class="btn-soundscape-play" title="Play/Pause Ambient Sound">▶</button>
                  </div>
                  <div class="soundscape-volume-row">
                    <span class="volume-icon">🔈</span>
                    <input type="range" id="sliderSoundscapeVolume" class="styled-range soundscape-range" min="0" max="100" value="50" aria-label="Soundscape Volume">
                    <span id="txtSoundscapeVolume" class="volume-num">50%</span>
                  </div>
                </div>

                <!-- Acoustic Chime Selector with Preview Button (Feature 7) -->
                <div class="focus-chime-selector-row">
                  <span class="chime-label" data-i18n="focus_completion_chime">🔔 Completion Chime:</span>
                  <select id="selectFocusChimeTone" class="styled-select chime-select" aria-label="Completion Chime Tone">
                    <option value="solfeggio528" selected data-i18n="chime_opt_solfeggio">Solfeggio Harmonic (528Hz / 660Hz)</option>
                    <option value="tibetan" data-i18n="chime_opt_tibetan">Tibetan Singing Bowl (432Hz)</option>
                    <option value="bell" data-i18n="chime_opt_bell">Digital Bell Synthesizer</option>
                    <option value="gong" data-i18n="chime_opt_gong">Zen Temple Gong</option>
                  </select>
                  <button type="button" id="btnPreviewChime" class="btn-chime-preview" title="Preview chime tone" data-i18n="btn_preview_chime">▶ Test</button>
                </div>

                <!-- Feature Toggles (Auto-pause media, Chime, Strict Shield Feature 6) -->
                <div class="dash-focus-toggles-container">
                  <label class="dash-focus-toggle-row" for="toggleFocusAutoPauseMedia">
                    <span class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_focus_autopause">Auto-pause Media</span>
                      <span class="toggle-desc" data-i18n="toggle_focus_autopause_desc">Auto-pause media during focus</span>
                    </span>
                    <input type="checkbox" id="toggleFocusAutoPauseMedia" class="styled-checkbox" checked>
                  </label>
                  <label class="dash-focus-toggle-row" for="toggleFocusChime">
                    <span class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_focus_chime">Sound Chime</span>
                      <span class="toggle-desc" data-i18n="toggle_focus_chime_desc">Sound chime on cycle completion</span>
                    </span>
                    <input type="checkbox" id="toggleFocusChime" class="styled-checkbox" checked>
                  </label>
                  <label class="dash-focus-toggle-row" for="toggleFocusDistractionShield">
                    <span class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_focus_shield">🛡️ Strict Shield</span>
                      <span class="toggle-desc" data-i18n="toggle_focus_shield_desc">Nudge and shield on distracting domains during focus</span>
                    </span>
                    <input type="checkbox" id="toggleFocusDistractionShield" class="styled-checkbox">
                  </label>
                </div>
              </div>
            </div>

            <!-- Pillar 1.5B: Sleep Advanced Controls Card (Part 2 - Advanced, Placed DIRECTLY UNDERNEATH Part 1) -->
            <div id="cardSleepAdvanced" class="bento-card liquid-glass-card bento-span-6 sleep-advanced-card">
              <div class="card-header-row settings-card-header">
                <span class="card-icon settings-card-icon">⚙️</span>
                <div class="card-title-group settings-card-title-group">
                  <h3 id="txtSleepAdvancedTitle" class="card-heading settings-card-title" data-i18n="sleep_advanced_title">Sleep Advanced Controls</h3>
                  <span id="txtSleepAdvancedDesc" class="settings-card-sub" data-i18n="sleep_advanced_desc">Custom durations, gradual fade-out, end-of-video cutoff & inactivity triggers</span>
                </div>
              </div>

              <div class="sleep-advanced-body">
                <!-- Custom Duration & Quick Extenders Row -->
                <div class="sleep-advanced-custom-extender-row">
                  <div class="dash-sleep-custom-input-row">
                    <label for="inputDashSleepCustomMinutes" class="dash-sleep-section-label" data-i18n="lbl_custom_duration">Custom Duration</label>
                    <div class="dash-sleep-custom-input-wrap">
                      <input type="number" id="inputDashSleepCustomMinutes" class="dash-sleep-custom-input" min="1" max="1440" placeholder="Min (1-1440)" />
                      <button type="button" id="btnSetDashSleepCustom" class="btn-dash-sleep-set-custom" data-i18n="btn_set">Set</button>
                    </div>
                  </div>
                  <div class="dash-sleep-extender-group">
                    <span class="dash-sleep-section-label" data-i18n="lbl_extend_time">Extend Time</span>
                    <div class="dash-sleep-extender-buttons">
                      <button type="button" id="btnDashSleepExtend5" class="dash-sleep-extender-btn" data-add="5">+5m</button>
                      <button type="button" id="btnDashSleepExtend15" class="dash-sleep-extender-btn" data-add="15">+15m</button>
                    </div>
                  </div>
                </div>

                <!-- Feature Toggles -->
                <div class="dash-sleep-toggles-container">
                  <div class="dash-sleep-toggle-row">
                    <label class="toggle-text-group" for="toggleDashSleepFade">
                      <span class="toggle-title" data-i18n="lbl_sleep_fade">Gradual Audio Fade-out</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_fade">Smoothly lower volume 30s before cutoff to prevent sudden waking</span>
                    </label>
                    <div class="dash-sleep-row-controls">
                      <select id="selectDashSleepFadeCurve" class="dash-sleep-select-sm" aria-label="Fade Curve Duration">
                        <option value="10">10s</option>
                        <option value="30" selected>30s</option>
                        <option value="60">60s</option>
                      </select>
                      <input type="checkbox" id="toggleDashSleepFade" class="styled-checkbox dash-sleep-switch-input" checked>
                    </div>
                  </div>
                  <label class="dash-sleep-toggle-row" for="toggleDashSleepEndOfVideo">
                    <span class="toggle-text-group">
                      <span class="toggle-title" data-i18n="lbl_sleep_end_of_video">Stop at End of Video</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_end_of_video">Trigger cutoff as soon as the current playing video finishes</span>
                    </span>
                    <input type="checkbox" id="toggleDashSleepEndOfVideo" class="styled-checkbox dash-sleep-switch-input">
                  </label>
                  <div class="dash-sleep-toggle-row">
                    <span class="toggle-title" data-i18n="lbl_inactivity_auto_sleep">Pause if idle 15m</span>
                    <input type="checkbox" id="toggleDashSleepInactivity" class="dash-sleep-switch-input styled-checkbox" />
                  </div>
                  <div class="dash-sleep-toggle-row">
                    <span class="toggle-title" data-i18n="lbl_timeout_action">On Timeout Action</span>
                    <select id="selectDashSleepTimeoutAction" class="dash-sleep-select-sm">
                      <option value="pause" selected data-i18n="opt_timeout_pause">Pause Media Only</option>
                      <option value="mute" data-i18n="opt_timeout_mute">Mute Tab</option>
                      <option value="close_tab" data-i18n="opt_timeout_close">Pause & Close Tab</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            `;

html = html.slice(0, p1Start) + replacementHtml + html.slice(p2Start);
writeUtf8WithBOM(htmlPath, html);
console.log('  ✅ dashboard/dashboard.html updated successfully with 4-container split.');

// =============================================================================
// 2. Update dashboard/dashboard.css & dashboard/styles/wellbeing_blacklist.css
// =============================================================================
console.log('\n2. Updating CSS stylesheets...');
const newCssRules = `
/* ========================================================================== */
/* SECTION: ADVANCED FOCUS & SLEEP HUBS (CONTAINER SPLIT)                      */
/* ========================================================================== */

.pomodoro-advanced-card,
.sleep-advanced-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: rgba(18, 22, 34, 0.75);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.pomodoro-advanced-card {
  border: 1px solid rgba(16, 185, 129, 0.22);
  box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.65), 0 0 24px -4px rgba(16, 185, 129, 0.12);
}

.pomodoro-advanced-card:hover {
  border-color: rgba(16, 185, 129, 0.38);
  box-shadow: 0 14px 40px -8px rgba(0, 0, 0, 0.7), 0 0 28px -2px rgba(16, 185, 129, 0.2);
}

.sleep-advanced-card {
  border: 1px solid rgba(99, 102, 241, 0.22);
  box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.65), 0 0 24px -4px rgba(99, 102, 241, 0.12);
}

.sleep-advanced-card:hover {
  border-color: rgba(99, 102, 241, 0.38);
  box-shadow: 0 14px 40px -8px rgba(0, 0, 0, 0.7), 0 0 28px -2px rgba(99, 102, 241, 0.2);
}

.pomodoro-advanced-body,
.sleep-advanced-body {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  width: 100%;
}

.focus-advanced-stepper-extender-row,
.sleep-advanced-custom-extender-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.dash-focus-actions-panel,
.dash-sleep-actions-panel {
  width: 100%;
  margin-top: 0.25rem;
}
`;

// 2.1 dashboard/dashboard.css
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');
let dashCss = readUtf8WithBOM(dashCssPath);

// Add to compound liquid glass selectors
if (dashCss.includes('.audio-eq-widget.liquid-glass-card {') && !dashCss.includes('.pomodoro-advanced-card.liquid-glass-card')) {
  dashCss = dashCss.replace(
    '.audio-eq-widget.liquid-glass-card {',
    '.audio-eq-widget.liquid-glass-card,\n.pomodoro-advanced-card.liquid-glass-card,\n.sleep-advanced-card.liquid-glass-card {'
  );
  dashCss = dashCss.replace(
    '.audio-eq-widget.liquid-glass-card:hover {',
    '.audio-eq-widget.liquid-glass-card:hover,\n.pomodoro-advanced-card.liquid-glass-card:hover,\n.sleep-advanced-card.liquid-glass-card:hover {'
  );
}

if (!dashCss.includes('.pomodoro-advanced-body')) {
  dashCss += '\n' + newCssRules;
}
writeUtf8WithBOM(dashCssPath, dashCss);
console.log('  ✅ dashboard/dashboard.css updated with advanced card styles.');

// 2.2 dashboard/styles/wellbeing_blacklist.css
const wellbeingCssPath = path.join(rootDir, 'dashboard', 'styles', 'wellbeing_blacklist.css');
let wellbeingCss = readUtf8WithBOM(wellbeingCssPath);
if (!wellbeingCss.includes('.pomodoro-advanced-body')) {
  wellbeingCss += '\n' + newCssRules;
}
writeUtf8WithBOM(wellbeingCssPath, wellbeingCss);
console.log('  ✅ dashboard/styles/wellbeing_blacklist.css updated with advanced card styles.');

// =============================================================================
// 3. Update dashboard/dashboard.js i18n dictionaries and applyDashboardLanguage
// =============================================================================
console.log('\n3. Updating dashboard/dashboard.js...');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
let dashJs = readUtf8WithBOM(dashJsPath);

// Keys to add to en
const newEnKeys = {
  focus_advanced_title: 'Focus Advanced Controls',
  focus_advanced_desc: 'Custom goals, ambient soundscapes, acoustic chimes & smart shields',
  pomodoro_desc: 'Deep work intervals, automated media cutoff & break recovery',
  lbl_focus_presets: 'Duration & Presets',
  lbl_quick_presets: 'Quick Presets',
  lbl_extend_time: 'Extend Time',
  lbl_custom: 'Custom:',
  btn_start_sleep_timer: 'Start Sleep Timer',
  focus_ambient_soundscapes: '🎧 Ambient Soundscapes',
  soundscape_opt_none: 'Off (Silent)',
  soundscape_opt_rain: '🌧️ Gentle Rain',
  soundscape_opt_cafe: '☕ Coffee Shop',
  soundscape_opt_ocean: '🌊 Ocean Waves',
  soundscape_opt_forest: '🌲 Forest Birds',
  soundscape_opt_whitenoise: '💨 Pink/White Noise',
  focus_completion_chime: '🔔 Completion Chime:',
  chime_opt_solfeggio: 'Solfeggio Harmonic (528Hz / 660Hz)',
  chime_opt_tibetan: 'Tibetan Singing Bowl (432Hz)',
  chime_opt_bell: 'Digital Bell Synthesizer',
  chime_opt_gong: 'Zen Temple Gong',
  btn_preview_chime: '▶ Test',
  toggle_focus_autopause: 'Auto-pause Media',
  toggle_focus_autopause_desc: 'Auto-pause media during focus',
  toggle_focus_chime: 'Sound Chime',
  toggle_focus_chime_desc: 'Sound chime on cycle completion',
  toggle_focus_shield: '🛡️ Strict Shield',
  toggle_focus_shield_desc: 'Nudge and shield on distracting domains during focus',
  sleep_advanced_title: 'Sleep Advanced Controls',
  sleep_advanced_desc: 'Custom durations, gradual fade-out, end-of-video cutoff & inactivity triggers'
};

// Keys to add to hi
const newHiKeys = {
  focus_advanced_title: 'उन्नत फोकस नियंत्रण',
  focus_advanced_desc: 'कस्टम लक्ष्य, परिवेश ध्वनियां, समापन झंकार और स्मार्ट शील्ड्स',
  pomodoro_desc: 'गहन कार्य अंतराल, स्वचालित मीडिया कटऑफ और ब्रेक रिकवरी',
  lbl_focus_presets: 'अवधि और प्रीसेट्स',
  lbl_quick_presets: 'त्वरित प्रीसेट्स',
  lbl_extend_time: 'समय बढ़ाएं',
  lbl_custom: 'कस्टम:',
  btn_start_sleep_timer: 'स्लीप टाइमर शुरू करें',
  focus_ambient_soundscapes: '🎧 परिवेशी ध्वनियां',
  soundscape_opt_none: 'बंद (शांत)',
  soundscape_opt_rain: '🌧️ हल्की बारिश',
  soundscape_opt_cafe: '☕ कॉफी शॉप',
  soundscape_opt_ocean: '🌊 समुद्र की लहरें',
  soundscape_opt_forest: '🌲 वन पक्षी',
  soundscape_opt_whitenoise: '💨 पिंक/व्हाइट नॉइज़',
  focus_completion_chime: '🔔 समापन झंकार:',
  chime_opt_solfeggio: 'सोल्फ़ेगियो हार्मोनिक (528Hz / 660Hz)',
  chime_opt_tibetan: 'तिब्बती सिंगिंग बाउल (432Hz)',
  chime_opt_bell: 'डिजिटल बेल सिंथेसाइज़र',
  chime_opt_gong: 'ज़ेन मंदिर गोंग',
  btn_preview_chime: '▶ परीक्षण',
  toggle_focus_autopause: 'ऑटो-पॉज़ मीडिया',
  toggle_focus_autopause_desc: 'फोकस के दौरान मीडिया स्वचालित रूप से रोकें',
  toggle_focus_chime: 'ध्वनि झंकार',
  toggle_focus_chime_desc: 'चक्र पूर्ण होने पर झंकार बजाएं',
  toggle_focus_shield: '🛡️ सख्त शील्ड',
  toggle_focus_shield_desc: 'फोकस के दौरान विचलित करने वाले डोमेन पर सचेत करें',
  sleep_advanced_title: 'उन्नत स्लीप नियंत्रण',
  sleep_advanced_desc: 'कस्टम अवधि, क्रमिक फेड-आउट, वीडियो समाप्ति कटऑफ और निष्क्रियता ट्रिगर्स'
};

// Insert into DASHBOARD_I18N.en after pomodoro_title
let enInsertBlock = '';
for (const [k, v] of Object.entries(newEnKeys)) {
  enInsertBlock += `    ${k}: ${JSON.stringify(v)},\n`;
}
if (!dashJs.includes('focus_advanced_title:')) {
  dashJs = dashJs.replace("pomodoro_title: 'Focus Sentinel & Pomodoro',\n", "pomodoro_title: 'Focus Sentinel & Pomodoro',\n" + enInsertBlock);
}

// Insert into DASHBOARD_I18N.hi after pomodoro_title
let hiInsertBlock = '';
for (const [k, v] of Object.entries(newHiKeys)) {
  hiInsertBlock += `    ${k}: ${JSON.stringify(v)},\n`;
}
if (!dashJs.includes('focus_advanced_title:') || !dashJs.includes('उन्नत फोकस नियंत्रण')) {
  dashJs = dashJs.replace("pomodoro_title: 'फोकस सेंटिनल व पोमोडोरो',\n", "pomodoro_title: 'फोकस सेंटिनल व पोमोडोरो',\n" + hiInsertBlock);
}

// Add setTxt for advanced card titles & descriptions in applyDashboardLanguage
const applyLangMarker = "  setTxt('txtSleepSentinelDesc', 'sleep_sentinel_desc');";
const applyLangAddition = `  setTxt('txtSleepSentinelDesc', 'sleep_sentinel_desc');
  setTxt('txtFocusAdvancedTitle', 'focus_advanced_title');
  setTxt('txtFocusAdvancedDesc', 'focus_advanced_desc');
  setTxt('txtSleepAdvancedTitle', 'sleep_advanced_title');
  setTxt('txtSleepAdvancedDesc', 'sleep_advanced_desc');`;

if (dashJs.includes(applyLangMarker) && !dashJs.includes('txtFocusAdvancedTitle')) {
  dashJs = dashJs.replace(applyLangMarker, applyLangAddition);
}

writeUtf8WithBOM(dashJsPath, dashJs);
console.log('  ✅ dashboard/dashboard.js updated successfully with bilingual keys and UI update logic.');

// =============================================================================
// 4. Create locales/en.json and locales/hi.json
// =============================================================================
console.log('\n4. Creating locales/en.json and locales/hi.json...');
const localesDir = path.join(rootDir, 'locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

// Extract the complete dictionaries from dashboard.js to write full structured files
const dashI18nMatch = dashJs.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
if (!dashI18nMatch) {
  throw new Error('Failed to extract DASHBOARD_I18N from dashboard.js');
}

// Safe evaluation of dictionary
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext('var dict = ' + dashI18nMatch[1].replace(/;\s*$/, ''), sandbox);
const dict = sandbox.dict;

// Convert functions in dictionary to string templates for clean JSON serialization
function sanitizeForJson(obj) {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'function') {
      res[k] = v.toString();
    } else {
      res[k] = v;
    }
  }
  return res;
}

const enJsonContent = JSON.stringify(sanitizeForJson(dict.en), null, 2);
const hiJsonContent = JSON.stringify(sanitizeForJson(dict.hi), null, 2);

writeUtf8WithBOM(path.join(localesDir, 'en.json'), enJsonContent);
writeUtf8WithBOM(path.join(localesDir, 'hi.json'), hiJsonContent);
console.log('  ✅ locales/en.json and locales/hi.json created with UTF-8 BOM and full parity.');

console.log('\n🎉 All UI container split modifications applied cleanly!');
