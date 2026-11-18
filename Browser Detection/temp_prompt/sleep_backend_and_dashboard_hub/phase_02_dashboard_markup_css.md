# 🎨 Phase 2: Dashboard Markup & Cyber-Dark Bento Card UI

> **Document Type:** Standalone Phase Instruction Set (Phase 2)  
> **Initiative:** Sleep Timer Subsystem Backend Engine & Dashboard Hub  
> **Container Directory:** [`temp_prompt/sleep_backend_and_dashboard_hub/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Department:** [`departments_archive/05_frontend_engineering_dept.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/departments_archive/05_frontend_engineering_dept.md)  
> **Target Role:** Level 4 Frontend Engineer  
> **Assigned Files:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html), [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)  

---

## 🎯 1. Phase Objective

Integrate the **Sleep Sentinel Hub** bento card (`#cardSleepSentinelHub`) into the Dashboard's **Wellbeing Pane** (`#paneWellbeing`) in `dashboard/dashboard.html`, and implement cyber-dark glassmorphism styling in `dashboard/dashboard.css`.

Key deliverables:
1. Embed `#cardSleepSentinelHub` inside `#tabContentWellbeing` with `bento-span-6` grid layout.
2. Embed the SVG radial countdown dial ($r=54$, $C=339.292$) with `#dashSleepDialProgress`, big time readout (`#dashSleepCountdownDisplay`), status badge (`#dashSleepStatusBadge`), and target bedtime readout (`#dashSleepFinishTime`).
3. Add preset duration buttons (`15m`, `30m`, `45m`, `60m`, `90m`, `120m`) with class `.dash-sleep-preset-btn`.
4. Add quick extension buttons (`+5m`, `+15m`) with class `.dash-sleep-extender-btn`.
5. Add action control buttons: `#btnDashSleepToggle` ("▶️ Start") and `#btnDashSleepReset` ("🔄 Reset").
6. Add feature toggle switches: `#toggleDashSleepFade` and `#toggleDashSleepEndOfVideo`.
7. Author responsive, glassmorphic, WCAG 2.1 AA compliant CSS rules in `dashboard/dashboard.css`.

---

## 📋 2. Prerequisites & Inputs

- Read and understand:
  - [`DESIGN.md`](DESIGN.md) (Tokens, SVG dial geometry, typography scale, accessibility rules).
  - Existing `dashboard/dashboard.html` lines 1064-1146 (`#paneWellbeing`).
  - Existing `dashboard/dashboard.css` styling conventions (liquid glass, bento cards).

---

## ⚓ 3. Technical Context & File Anchors

- **Markup File:** `dashboard/dashboard.html`
- **Insertion Anchor:** Inside `<section id="paneWellbeing">` $\to$ `<div id="tabContentWellbeing" class="bento-grid-container wellbeing-grid bento-grid">`, inserted as the second card right after `#widgetPomodoroSentinel` (around line 1088).
- **Styles File:** `dashboard/dashboard.css`
- **CSS Section Anchor:** Append dedicated section `/* ========================================================================== */ /* SECTION: SLEEP SENTINEL HUB & RADIAL DIAL (DASHBOARD WELLBEING)           */ /* ========================================================================== */` at the end of `dashboard.css`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Add `#cardSleepSentinelHub` Markup in `dashboard/dashboard.html`
Insert the following HTML card inside `#tabContentWellbeing` directly after `#widgetPomodoroSentinel` (line 1088):

```html
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
            </div>
```

### Step 2.2: Add Modern CSS Rules in `dashboard/dashboard.css`
Append the following CSS to `dashboard/dashboard.css`:

```css
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
```

---

## 🚫 5. Architectural Constraints & Boundaries

- **Preserve existing DOM hierarchy:** Do not delete or overwrite `#widgetPomodoroSentinel`, `#cardDomainBudgets`, `#cardTrackingBlacklist`, or `#cardPinnedDomainsQuickview`.
- **Zero Inline Event Handlers:** Do NOT write inline `onclick="..."` attributes in HTML.
- **W3C Trusted Types Compliance:** Maintain static, well-formed HTML tags.

---

## 📦 6. Deliverables Manifest

1. `dashboard/dashboard.html`: Updated with `#cardSleepSentinelHub` inside `#tabContentWellbeing`.
2. `dashboard/dashboard.css`: Updated with modern styling for `#cardSleepSentinelHub`, SVG radial dial, presets, and extenders.

---

## 🧪 7. Local Verification Gate

Execute:
```powershell
node -e "const fs = require('fs'); const html = fs.readFileSync('dashboard/dashboard.html', 'utf8'); if (!html.includes('id=\"cardSleepSentinelHub\"') || !html.includes('id=\"dashSleepDialProgress\"')) throw new Error('Missing elements'); console.log('Markup check passed');"
```
and verify exit code 0.
