# Phase 01: HTML DOM Restructuring & 7th Sleep Tab Decomposition

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Phase:** `01 of 05`  
> **Target File:** `popup/popup.html`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Local Test Gate:** `node tests/test_syntax_and_manifest_integrity.js`  

---

## 🎯 1. Phase Objective

The objective of Phase 01 is to update `popup/popup.html` by:
1. Adding the 7th navigation tab button `#mainTabSleep` to `<nav class="top-nav-tabs">`.
2. Constructing the dedicated 7th view pane `#viewSleepPane` containing the bedtime radial ring hero card, quick extenders, presets grid, custom duration input, and sleep automations.
3. Adding `<option value="sleep">🌙 Sleep</option>` to `#selectDefaultTab` inside the Quick Settings popover.
4. Preserving 100% of canonical DOM IDs, including the legacy `#sleepTimerPopover` and footer button `#btnSleepTimerTrigger` for complete test backward-compatibility.

---

## 📋 2. Prerequisites & Inputs

- File to modify: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup\popup.html`
- Reference specifications:
  - [`PRD.md`](PRD.md) (Sections 2.1, 2.2, 2.7, 2.8)
  - [`TRD.md`](TRD.md) (Section 2: DOM Structure Specifications)
  - [`DESIGN.md`](DESIGN.md) (Section 2 & 3)

---

## 🔍 3. Technical Context & File Anchors

1. **Navigation Bar Anchor (`popup/popup.html`, approx. lines 88-92):**
   ```html
         <button id="mainTabDomains" class="top-tab-btn" data-view="domains" role="tab" aria-selected="false" aria-controls="viewDomainsPane">
           <span class="top-tab-icon">🌐</span>
           <span id="topTabDomainsText" class="top-tab-label">Domains</span>
         </button>
       </nav>
   ```
   *Target edit:* Insert `#mainTabSleep` immediately before `</nav>`.

2. **Tab Panes Container Anchor (`popup/popup.html`, approx. lines 630-675):**
   Locate the closing tag of `#viewDomainsPane` immediately before `<footer class="footer">`.
   *Target edit:* Insert `#viewSleepPane` directly after `</div><!-- End #viewDomainsPane -->` and before `<footer class="footer">`.

3. **Quick Settings Select Anchor (`popup/popup.html`, approx. lines 743-751):**
   ```html
             <select id="selectDefaultTab" class="setting-select" aria-label="Default Tab">
               <option value="media" selected>🎬 Media</option>
               <option value="audio">🎛️ Audio</option>
               <option value="tools">⚡ Tools</option>
               <option value="studio">📚 Studio</option>
               <option value="tracking">⏱️ Tracking</option>
               <option value="domains">🌐 Domains</option>
             </select>
   ```
   *Target edit:* Append `<option value="sleep">🌙 Sleep</option>` to the list.

4. **Popover & Footer Preservation:**
   Keep `#btnSleepTimerTrigger` in `<footer class="footer">` and `#sleepTimerPopover` with all its child elements intact.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Insert `#mainTabSleep` Button
In `popup/popup.html`, right after `#mainTabDomains` and before `</nav>`, add:
```html
      <button id="mainTabSleep" class="top-tab-btn" data-view="sleep" role="tab" aria-selected="false" aria-controls="viewSleepPane" title="Sleep Timer & Bedtime Automation">
        <span class="top-tab-icon">🌙</span>
        <span id="topTabSleepText" class="top-tab-label">Sleep</span>
        <span id="tabSleepActiveDot" class="tab-live-dot hidden" title="Sleep Timer Active"></span>
      </button>
```

### Step 2: Insert `#viewSleepPane` Tab Panel
Immediately after the closing `</div>` of `#viewDomainsPane` and before `<footer class="footer">`, insert the complete `#viewSleepPane` markup:
```html
    <!-- TAB 7: Dedicated Sleep Timer View Pane -->
    <div id="viewSleepPane" class="tab-pane" role="tabpanel" aria-labelledby="mainTabSleep">
      
      <!-- 1. Radial Bedtime Dial Hero Card -->
      <section id="cardSleepHeroRing" class="sleep-hero-card">
        <div class="sleep-hero-header">
          <div class="sleep-hero-title-group">
            <span class="sleep-moon-icon">🌙</span>
            <span class="sleep-hero-title">BEDTIME SENTINEL</span>
          </div>
          <span id="sleepDialStatusBadge" class="sleep-status-badge idle">IDLE</span>
        </div>

        <!-- Center Radial Bedtime SVG Dial -->
        <div class="sleep-dial-wrapper">
          <svg id="sleepDialSvg" class="sleep-dial-svg" viewBox="0 0 140 140" width="140" height="140" aria-label="Sleep Timer Radial Countdown">
            <!-- Background Track Ring -->
            <circle class="sleep-dial-bg" cx="70" cy="70" r="54" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="8" />
            <!-- Progress Glow Ring -->
            <circle id="sleepDialProgress" class="sleep-dial-meter" cx="70" cy="70" r="54" fill="none" 
                    stroke="url(#sleepGlowGradient)" stroke-width="8" stroke-linecap="round" 
                    stroke-dasharray="339.292" stroke-dashoffset="0" transform="rotate(-90 70 70)" />
            <defs>
              <linearGradient id="sleepGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#818cf8" />
                <stop offset="50%" stop-color="#a855f7" />
                <stop offset="100%" stop-color="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <!-- Centered Telemetry Overlay -->
          <div class="sleep-dial-content">
            <div id="sleepDialCountdown" class="sleep-countdown-text">00:00</div>
            <div id="sleepDialTargetTime" class="sleep-target-text">No active timer</div>
          </div>
        </div>

        <!-- Quick Action Button Row (Start/Pause, +5m, +15m, Cancel) -->
        <div class="sleep-quick-actions-row">
          <button id="btnSleepToggleRun" class="sleep-action-btn primary" title="Start or Pause Timer">
            <span id="btnSleepToggleRunIcon">▶</span>
            <span id="btnSleepToggleRunText">Start</span>
          </button>
          <button id="btnSleepExtend5m" class="sleep-action-btn extend" title="Add 5 Minutes to Active Timer">
            +5m
          </button>
          <button id="btnSleepExtend15m" class="sleep-action-btn extend" title="Add 15 Minutes to Active Timer">
            +15m
          </button>
          <button id="btnSleepReset" class="sleep-action-btn reset" title="Cancel & Reset Timer">
            ✕ Reset
          </button>
        </div>
      </section>

      <!-- 2. Presets & Custom Duration Card -->
      <section id="cardSleepPresetsAndCustom" class="sleep-section-card">
        <div class="section-micro-header">
          <span class="micro-icon">⏱️</span>
          <span class="micro-heading">DURATION PRESETS</span>
        </div>
        <div class="sleep-tab-presets-grid">
          <button class="sleep-tab-preset-btn" data-minutes="15">15m</button>
          <button class="sleep-tab-preset-btn" data-minutes="30">30m</button>
          <button class="sleep-tab-preset-btn" data-minutes="45">45m</button>
          <button class="sleep-tab-preset-btn" data-minutes="60">60m</button>
          <button class="sleep-tab-preset-btn" data-minutes="90">90m</button>
          <button class="sleep-tab-preset-btn" data-minutes="120">120m</button>
        </div>

        <!-- Custom Minute Input Form -->
        <div class="sleep-custom-input-row">
          <label for="inputSleepCustomMinutes" class="sleep-custom-label">Custom Duration:</label>
          <div class="sleep-custom-input-wrap">
            <input type="number" id="inputSleepCustomMinutes" min="1" max="1440" placeholder="Min (1-1440)" class="sleep-custom-input">
            <button id="btnSetSleepCustom" class="btn-sleep-set-custom">Set</button>
          </div>
        </div>
      </section>

      <!-- 3. Smart Sleep Automations Card -->
      <section id="cardSleepAutomations" class="sleep-section-card">
        <div class="section-micro-header">
          <span class="micro-icon">✨</span>
          <span class="micro-heading">SLEEP AUTOMATIONS</span>
        </div>

        <!-- Toggle 1: End of Video Smart Pause -->
        <div class="sleep-toggle-row">
          <div class="sleep-toggle-info">
            <span class="sleep-toggle-title">End of Current Video</span>
            <span class="sleep-toggle-sub">Pause cleanly when active video ends</span>
          </div>
          <label class="switch-toggle-sm">
            <input type="checkbox" id="toggleSleepEndOfVideo" checked>
            <span class="slider-round-sm"></span>
          </label>
        </div>

        <!-- Toggle 2: Audio Decibel Fade-out Curve -->
        <div class="sleep-toggle-row">
          <div class="sleep-toggle-info">
            <span class="sleep-toggle-title">Audio Fade-Out Curve</span>
            <span class="sleep-toggle-sub">30s gentle volume decrease</span>
          </div>
          <label class="switch-toggle-sm">
            <input type="checkbox" id="toggleSleepFadeCurve" checked>
            <span class="slider-round-sm"></span>
          </label>
        </div>

        <!-- Toggle 3: Inactivity Sentinel Auto-Sleep -->
        <div class="sleep-toggle-row">
          <div class="sleep-toggle-info">
            <span class="sleep-toggle-title">Inactivity Auto-Sleep</span>
            <span class="sleep-toggle-sub">Pause playback if idle for 15m</span>
          </div>
          <label class="switch-toggle-sm">
            <input type="checkbox" id="toggleSleepInactivitySentinel">
            <span class="slider-round-sm"></span>
          </label>
        </div>
      </section>
    </div>
```

### Step 3: Update `#selectDefaultTab`
In `#quickSettingsPopover`, add:
```html
<option value="sleep">🌙 Sleep</option>
```
to `#selectDefaultTab`.

---

## ⚠️ 5. Architectural Constraints & Boundaries

- **Zero Deletions:** Do NOT remove `#sleepTimerPopover`, `#btnSleepTimerTrigger`, or any other existing element ID.
- **Strict Encoding:** Preserve UTF-8 with BOM on `popup/popup.html`.
- **Out of Scope:** Do NOT touch `popup/popup.js` or backend files during Phase 01.

---

## 📦 6. Deliverables Manifest

- `popup/popup.html`: Updated with `#mainTabSleep`, `#viewSleepPane`, and `<option value="sleep">`.

---

## 🧪 7. Local Verification Gate

Execute in PowerShell:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
Must pass with exit code 0.
