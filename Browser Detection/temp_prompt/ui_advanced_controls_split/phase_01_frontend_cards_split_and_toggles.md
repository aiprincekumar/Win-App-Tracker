# Phase 1 Execution Prompt: Frontend UI Cards Split, 2-Column Responsive Layout & Modern Switches

> **Phase ID:** `PHASE-01-FRONTEND-CARDS-SPLIT`  
> **Target Role:** Level 4 Frontend Engineer (`subagent`)  
> **Model Directive:** `flash` (Fast execution & clean DOM editing per Universal Rule 25)  
> **Mandatory Anchor:** `Mandatory: First load and adhere to dynamic_departments_matrix.md (or C:\Users\Atul Verma\.gemini\config\rules\dynamic_departments_matrix.md) and memory.md before executing instructions.`  
> **Allocated Department:** Dept 05 Frontend Engineering  
> **Primary Target Files:**  
> - `dashboard/dashboard.html` (Lines 1566–1837)  
> - `dashboard/styles/focus_sleep_advanced.css`  
> - `dashboard/styles/tokens.css` (if token additions needed)  

---

## 🎯 1. Phase Objective

Refactor the two monolithic advanced cards under `#paneWellbeing` in `dashboard/dashboard.html` by splitting them into four modular, beautifully balanced bento cards. Upgrade all legacy HTML checkboxes to sleek `.switch-toggle` components, convert the 1-column layouts to responsive 2-column CSS grids, introduce semantic extended controls, and preserve 100% of existing element IDs and basic hub sections.

---

## 📋 2. Prerequisites & Critical Constraints

1. **Quarantine Basic Hubs:** `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` (lines 1376–1564) are STRICTLY OUT-OF-SCOPE. Do NOT alter them in any way.
2. **Preserve Legacy IDs:** Every single existing element ID must remain in the DOM so that existing JavaScript controllers, event handlers, and tests continue running with 0 errors.
3. **Encoding Standard:** All file edits must strictly preserve **UTF-8 with BOM (`0xEF, 0xBB, 0xBF`)**.
4. **W3C Trusted Types:** Zero usage of `innerHTML`. All layout markup must be declarative, valid HTML.
5. **No Backend Alterations in Phase 1:** Strictly frontend UI structure, markup, and CSS styling.

---

## 🔨 3. Surgical Step-by-Step Instructions

### Step 1: Split `#widgetFocusAdvanced` into 2 Modular Cards
In `dashboard/dashboard.html`, replace `#widgetFocusAdvanced` with:

1. **Card 1A: Focus Acoustic Environment & Session Planner (`#widgetFocusAdvancedPlanner`):**
   - Classes: `bento-card liquid-glass-card bento-span-6 pomodoro-advanced-card`
   - Header: Icon `🎵`, Title `#txtFocusPlannerTitle` ("Session Planner & Soundscapes" / `data-i18n="focus_planner_title"`), Subtitle `#txtFocusPlannerDesc` ("Custom goals, ambient soundscapes, acoustic chimes & rhythm aids" / `data-i18n="focus_planner_desc"`)
   - Body Structure (`.controls-2col-grid`):
     - **Goal Input Row (Full Width):** `#inputFocusGoal`, `#chipActiveFocusGoal`, `#txtActiveFocusGoal`, `#btnClearFocusGoal`
     - **Left Column:** Custom Minutes Stepper (`#inputFocusCustomMinutes`, `#btnApplyCustomMinutes`) and Extenders (`#btnFocusExtend5`, `#btnFocusExtend15`)
     - **Right Column:** Soundscape Synthesizer (`#selectFocusSoundscape`, `#btnToggleSoundscape`, `#sliderSoundscapeVolume`, `#txtSoundscapeVolume`) and Completion Chimes (`#selectFocusChimeTone`, `#btnPreviewChime`)
     - **Bottom Row (Full Width / Span 2):** Extended pacing toggles:
       - Break Auto-Restart: `<label class="switch-toggle" for="toggleFocusAutoRestartBreak"><input type="checkbox" id="toggleFocusAutoRestartBreak" class="switch-input"><span class="slider-round"></span></label>`
       - Analog Clock Ticking: `<label class="switch-toggle" for="toggleFocusTicking"><input type="checkbox" id="toggleFocusTicking" class="switch-input"><span class="slider-round"></span></label>`
       - Ambient Lighting Sync: `<label class="switch-toggle" for="toggleFocusAmbientLighting"><input type="checkbox" id="toggleFocusAmbientLighting" class="switch-input"><span class="slider-round"></span></label>`

2. **Card 1B: Focus Smart Shields & Cognitive Integrity (`#widgetFocusAdvancedShields`):**
   - Classes: `bento-card liquid-glass-card bento-span-6 pomodoro-advanced-card`
   - Header: Icon `🛡️`, Title `#txtFocusShieldsTitle` ("Smart Shields & Attention Integrity" / `data-i18n="focus_shields_title"`), Subtitle `#txtFocusShieldsDesc` ("Attention scoring, media shielding, breathing nudges & ergonomics" / `data-i18n="focus_shields_desc"`)
   - Body Structure (`.controls-2col-grid`):
     - **Left Column (Attention & Media):**
       - Focus Integrity Score: `#badgeFocusIntegrityScore`, `#cntFocusDistractions`, `#toggleFocusIntegrityScore` (as switch)
       - Auto-pause Media: `#toggleFocusAutoPauseMedia` (as switch)
       - Auto-mute Background Tabs: `#toggleFocusAutoMuteBg` (as switch)
     - **Right Column (Cognitive Health & Shielding):**
       - Strict Distraction Shield: `#toggleFocusDistractionShield` (as switch)
       - Soft-Nudge Breathe Overlay: `#toggleFocusBreatheNudge` (as switch)
       - 20-20-20 Posture Alert: `#toggleFocus2020Alert` (as switch)
     - **Bottom Row (Full Width / Span 2):** Extended shield toggles:
       - Hard Domain Blockade: `<label class="switch-toggle" for="toggleFocusHardBlockade"><input type="checkbox" id="toggleFocusHardBlockade" class="switch-input"><span class="slider-round"></span></label>`
       - DND Notification Silencer: `<label class="switch-toggle" for="toggleFocusDndNotifications"><input type="checkbox" id="toggleFocusDndNotifications" class="switch-input"><span class="slider-round"></span></label>`
       - Tab Memory Discard: `<label class="switch-toggle" for="toggleFocusTabFreeze"><input type="checkbox" id="toggleFocusTabFreeze" class="switch-input"><span class="slider-round"></span></label>`

### Step 2: Split `#cardSleepAdvanced` into 2 Modular Cards
In `dashboard/dashboard.html`, replace `#cardSleepAdvanced` with:

1. **Card 2A: Bedtime Acoustics & Power-Nap Engine (`#widgetSleepAdvancedAcoustics`):**
   - Classes: `bento-card liquid-glass-card bento-span-6 sleep-advanced-card`
   - Header: Icon `🌙`, Title `#txtSleepAcousticsTitle` ("Bedtime Acoustics & Power-Nap Engine" / `data-i18n="sleep_acoustics_title"`), Subtitle `#txtSleepAcousticsDesc` ("Restorative power-naps, delta soundscapes & gentle volume fade" / `data-i18n="sleep_acoustics_desc"`)
   - Body Structure (`.controls-2col-grid`):
     - **Top Banner (Full Width):** 20m Power-Nap Mode (`#btnSleepPowerNapMode`, `.power-nap-info`)
     - **Left Column:** Custom Sleep Minutes Stepper (`#inputDashSleepCustomMinutes`, `#btnSetDashSleepCustom`) and Extenders (`#btnDashSleepExtend5`, `#btnDashSleepExtend15`)
     - **Right Column:** Sleep Aid Soundscapes (`#selectSleepAidSoundscape`, `#btnToggleSleepSoundscape`, `#sliderSleepSoundscapeVolume`, `#txtSleepSoundscapeVolume`) and Audio Fade-Out (`#toggleDashSleepFade` as switch, `#selectDashSleepFadeCurve`)
     - **Bottom Row (Full Width / Span 2):** Extended acoustic toggles:
       - White Noise Delta Drift: `<label class="switch-toggle" for="toggleSleepWhiteNoiseDrift"><input type="checkbox" id="toggleSleepWhiteNoiseDrift" class="switch-input"><span class="slider-round"></span></label>`
       - Gentle Wake Chime: `<label class="switch-toggle" for="toggleSleepGentleAlarm"><input type="checkbox" id="toggleSleepGentleAlarm" class="switch-input"><span class="slider-round"></span></label>`
       - Smart Pre-Bedtime Wind-Down: `<label class="switch-toggle" for="toggleSleepSmartPrewind"><input type="checkbox" id="toggleSleepSmartPrewind" class="switch-input"><span class="slider-round"></span></label>`

2. **Card 2B: Sleep Cutoff Sentinel & Power Automation (`#widgetSleepAdvancedAutomation`):**
   - Classes: `bento-card liquid-glass-card bento-span-6 sleep-advanced-card`
   - Header: Icon `⚡`, Title `#txtSleepAutomationTitle` ("Sleep Cutoff Sentinel & Power Automation" / `data-i18n="sleep_automation_title"`), Subtitle `#txtSleepAutomationDesc` ("Automated playback cutoff, tab hibernation & inactivity triggers" / `data-i18n="sleep_automation_desc"`)
   - Body Structure (`.controls-2col-grid`):
     - **Left Column (Playback Cutoffs):**
       - Stop at End of Video: `#toggleDashSleepEndOfVideo` (as switch)
       - Autoplay Suppression: `#toggleSleepAutoplayBlock` (as switch)
       - Inactivity 15m Auto-Sleep: `#toggleDashSleepInactivity` (as switch)
       - Inactivity 5m Fast-Cutoff: `#toggleSleepInactivityFastCutoff` (as switch)
     - **Right Column (Action Dispatch & Protection):**
       - On Timeout Action: `#selectDashSleepTimeoutAction`
       - Progressive Circadian Screen Dimmer: `#toggleSleepScreenDimmer` (as switch)
       - Memory-Saver Tab Hibernation: `#toggleSleepTabHibernate` (as switch)
     - **Bottom Row (Full Width / Span 2):** Extended automation toggles:
       - Close All Background Media Tabs: `<label class="switch-toggle" for="toggleSleepCloseAllMediaTabs"><input type="checkbox" id="toggleSleepCloseAllMediaTabs" class="switch-input"><span class="slider-round"></span></label>`
       - Full Display Blackout Overlay: `<label class="switch-toggle" for="toggleSleepDarkenDisplay"><input type="checkbox" id="toggleSleepDarkenDisplay" class="switch-input"><span class="slider-round"></span></label>`
       - Host Inactivity Bridge Sync: `<label class="switch-toggle" for="toggleSleepSystemInactivitySync"><input type="checkbox" id="toggleSleepSystemInactivitySync" class="switch-input"><span class="slider-round"></span></label>`

### Step 3: Implement CSS Styling in `dashboard/styles/focus_sleep_advanced.css`
Append modern, cyber-dark glassmorphic CSS rules:
- `.controls-2col-grid`: 2-column grid (`repeat(2, minmax(0, 1fr))`, gap: 16px) with responsive collapse at `@media (max-width: 850px)`.
- `.switch-toggle` integration for all advanced rows: smooth 44x24px dimensions, `.slider-round` styling, cubic-bezier transition, emerald gradient checked state, and accessible cyan focus indicator.
- Extended toggle item styling (`.control-toggle-item`, `.extended-toggles-divider`).
- Preserving all existing classes (`.breathe-nudge-overlay`, `.toast-2020-alert`, `.sleep-power-nap-banner`, `.screen-dimmer-overlay`).

---

## 🚦 4. Local Verification Gate

Before completing Phase 1, execute:
1. Verify HTML syntax and zero unclosed tags.
2. Confirm UTF-8 BOM encoding on all edited files.
3. Verify that all 4 modular cards exist in `dashboard/dashboard.html` and `#widgetPomodoroSentinel` / `#cardSleepSentinelHub` are intact.
