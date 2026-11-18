# Phase 02: Sleep Advanced HTML, CSS & Bilingual i18n Specification

> **Document Type:** Standalone Phase Execution Instruction  
> **Phase #:** 02 of 04  
> **Task ID:** `TASK-ADVANCED-FEATURES-FOCUS-SLEEP-001`  
> **Target Subsystem:** Sleep Advanced Controls Container (`#cardSleepAdvanced`)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Target Files:** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`  
> **Lead Departments:** Dept 04 (UI/UX Design), Dept 05 (Frontend Engineering)  

---

## 🎯 1. Phase Objective

Surgically implement the DOM structure, night-mode styling, and bilingual i18n dictionaries for the 6 Sleep Advanced features strictly inside `#cardSleepAdvanced`. All new controls MUST default to OFF / inactive / None. Basic container `#cardSleepSentinelHub` MUST REMAIN UNTOUCHED.

---

## 📋 2. Prerequisites & Technical Context

- **Prerequisites:** Phase 1 complete; workspace anchored to `memory.md` and `temp_prompt/advanced_features_focus_sleep/INDEX.md`.
- **Target Container Anchor:** `#cardSleepAdvanced` in `dashboard/dashboard.html` (approx. line 1528).
- **Basic Container Invariant:** `#cardSleepSentinelHub` (approx. lines 1354-1428) MUST NOT BE MODIFIED.
- **Trusted Types Invariant:** Zero `innerHTML` or `outerHTML`. All markup statically written in HTML or safely injected.

---

## 🔨 3. Surgical Step-by-Step Instructions

### Step 2.1: Add Power-Nap Mode 20m Banner in `dashboard/dashboard.html`
Inside `#cardSleepAdvanced` -> `.sleep-advanced-body`:
Directly before `.sleep-advanced-custom-extender-row` (or at the top of the body), insert:
```html
<!-- Feature 6 (Sleep): 20m Power-Nap Mode Action Banner -->
<div class="sleep-power-nap-banner">
  <div class="power-nap-info">
    <span class="power-nap-title" data-i18n="btn_sleep_power_nap">⚡ 20m Power-Nap Mode</span>
    <span class="power-nap-desc" data-i18n="desc_sleep_power_nap">1-click restorative 20m nap with delta rain and gentle wake</span>
  </div>
  <button type="button" id="btnSleepPowerNapMode" class="btn-power-nap" data-i18n="btn_start_nap">Start Nap</button>
</div>
```

### Step 2.2: Add Sleep Aid Soundscapes Panel in `dashboard/dashboard.html`
Inside `#cardSleepAdvanced` -> `.sleep-advanced-body`:
Directly following `.sleep-advanced-custom-extender-row`, insert:
```html
<!-- Feature 2 (Sleep): Sleep Aid Soundscapes Panel -->
<div class="sleep-soundscape-panel">
  <div class="soundscape-header">
    <span class="soundscape-title" data-i18n="lbl_sleep_aid_soundscapes">🌙 Sleep Aid Soundscapes</span>
    <select id="selectSleepAidSoundscape" class="styled-select soundscape-select" aria-label="Sleep Aid Soundscape Selector">
      <option value="none" selected data-i18n="sleep_soundscape_none">Off (Silent)</option>
      <option value="pink_noise" data-i18n="sleep_soundscape_pink">🌸 Deep Pink Noise</option>
      <option value="midnight_ocean" data-i18n="sleep_soundscape_ocean">🌊 Midnight Ocean</option>
      <option value="delta_rain" data-i18n="sleep_soundscape_rain">🌧️ Delta Rain (2.5Hz)</option>
    </select>
    <button type="button" id="btnToggleSleepSoundscape" class="btn-soundscape-play" title="Play/Pause Sleep Soundscape">▶</button>
  </div>
  <div class="soundscape-volume-row">
    <span class="volume-icon">🔈</span>
    <input type="range" id="sliderSleepSoundscapeVolume" class="styled-range soundscape-range" min="0" max="100" value="40" aria-label="Sleep Soundscape Volume">
    <span id="txtSleepSoundscapeVolume" class="volume-num">40%</span>
  </div>
</div>
```

### Step 2.3: Add Sleep Advanced Toggle Rows in `dashboard/dashboard.html`
Inside `#cardSleepAdvanced` -> `.dash-sleep-toggles-container`:
Append the following 4 new semantic toggle rows (Default OFF):
1. **Auto-Disable Video Autoplay:**
```html
<label class="dash-sleep-toggle-row" for="toggleSleepAutoplayBlock">
  <span class="toggle-text-group">
    <span class="toggle-title" data-i18n="toggle_sleep_autoplay_block">Auto-Disable Video Autoplay</span>
    <span class="toggle-desc" data-i18n="desc_sleep_autoplay_block">Block next video autoplay during bedtime</span>
  </span>
  <input type="checkbox" id="toggleSleepAutoplayBlock" class="styled-checkbox dash-sleep-switch-input">
</label>
```
2. **Inactivity Fast-Cutoff (5m):**
```html
<label class="dash-sleep-toggle-row" for="toggleSleepInactivityFastCutoff">
  <span class="toggle-text-group">
    <span class="toggle-title" data-i18n="toggle_sleep_inactivity_cutoff">Inactivity Fast-Cutoff (5m)</span>
    <span class="toggle-desc" data-i18n="desc_sleep_inactivity_cutoff">Cut off media if idle for 5m during countdown</span>
  </span>
  <input type="checkbox" id="toggleSleepInactivityFastCutoff" class="styled-checkbox dash-sleep-switch-input">
</label>
```
3. **Progressive Screen Dimmer Nudge:**
```html
<label class="dash-sleep-toggle-row" for="toggleSleepScreenDimmer">
  <span class="toggle-text-group">
    <span class="toggle-title" data-i18n="toggle_sleep_screen_dimmer">Progressive Screen Dimmer</span>
    <span class="toggle-desc" data-i18n="desc_sleep_screen_dimmer">Circadian screen dimming during final countdown</span>
  </span>
  <input type="checkbox" id="toggleSleepScreenDimmer" class="styled-checkbox dash-sleep-switch-input">
</label>
```
4. **Memory-Saver Tab Hibernation:**
```html
<label class="dash-sleep-toggle-row" for="toggleSleepTabHibernate">
  <span class="toggle-text-group">
    <span class="toggle-title" data-i18n="toggle_sleep_tab_hibernate">Memory-Saver Tab Hibernation</span>
    <span class="toggle-desc" data-i18n="desc_sleep_tab_hibernate">Suspend idle tabs on timeout to quiet cooling fans</span>
  </span>
  <input type="checkbox" id="toggleSleepTabHibernate" class="styled-checkbox dash-sleep-switch-input">
</label>
```

### Step 2.4: Add Circadian Screen Dimmer Overlay in `dashboard/dashboard.html`
Before the closing tag of `#paneWellbeing` (or body container), append:
```html
<!-- Progressive Screen Dimmer Overlay (Default Hidden, Non-Blocking) -->
<div id="overlaySleepDimmer" class="screen-dimmer-overlay hidden" aria-hidden="true"></div>
```

### Step 2.5: Add Styling in `dashboard/dashboard.css`
Append styles for:
- `.sleep-power-nap-banner`, `.power-nap-info`, `.power-nap-title`, `.power-nap-desc`, `.btn-power-nap`
- `.sleep-soundscape-panel`
- `.screen-dimmer-overlay` (`pointer-events: none; position: fixed; inset: 0; background: radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.82) 100%); z-index: 9990; transition: opacity 1.5s ease;`)

### Step 2.6: Add Bilingual i18n Keys in `dashboard/dashboard.js`
In both `I18N_DICTIONARY.en` and `I18N_DICTIONARY.hi`:
Add all keys specified in PRD Section 6 (`toggle_sleep_autoplay_block`, `desc_sleep_autoplay_block`, `lbl_sleep_aid_soundscapes`, `desc_sleep_aid_soundscapes`, `sleep_soundscape_none`, `sleep_soundscape_pink`, `sleep_soundscape_ocean`, `sleep_soundscape_rain`, `toggle_sleep_inactivity_cutoff`, `desc_sleep_inactivity_cutoff`, `toggle_sleep_screen_dimmer`, `desc_sleep_screen_dimmer`, `toggle_sleep_tab_hibernate`, `desc_sleep_tab_hibernate`, `btn_sleep_power_nap`, `desc_sleep_power_nap`, `btn_start_nap`).

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **Strictly Out-of-Scope:** Do NOT touch `#cardSleepSentinelHub`.
- **Strictly Out-of-Scope:** Do NOT write audio DSP synthesis algorithms or IPC messaging in this phase (handled in Phase 3).
- **Default OFF Requirement:** All newly added checkboxes must NOT have the `checked` attribute. All selects must have `value="none"` selected.

---

## 📦 5. Deliverables Manifest
- Updated `dashboard/dashboard.html` with Sleep Advanced controls.
- Updated `dashboard/dashboard.css` with responsive night-mode styling.
- Updated `dashboard/dashboard.js` with bilingual i18n dictionary entries.

---

## 🛡️ 6. Local Verification Gate Command

```bash
node -e "const fs=require('fs'); const h=fs.readFileSync('dashboard/dashboard.html','utf8'); const c=fs.readFileSync('dashboard/dashboard.css','utf8'); const j=fs.readFileSync('dashboard/dashboard.js','utf8'); console.assert(h.includes('id=\"toggleSleepAutoplayBlock\"'), 'Missing toggleSleepAutoplayBlock'); console.assert(h.includes('id=\"selectSleepAidSoundscape\"'), 'Missing selectSleepAidSoundscape'); console.assert(h.includes('id=\"toggleSleepInactivityFastCutoff\"'), 'Missing toggleSleepInactivityFastCutoff'); console.assert(h.includes('id=\"toggleSleepScreenDimmer\"'), 'Missing toggleSleepScreenDimmer'); console.assert(h.includes('id=\"toggleSleepTabHibernate\"'), 'Missing toggleSleepTabHibernate'); console.assert(h.includes('id=\"btnSleepPowerNapMode\"'), 'Missing btnSleepPowerNapMode'); console.assert(c.includes('.sleep-power-nap-banner') || c.includes('.sleep-soundscape-panel'), 'Missing CSS'); console.assert(j.includes('toggle_sleep_autoplay_block') && j.includes('lbl_sleep_aid_soundscapes'), 'Missing i18n'); console.log('✅ Phase 2 Verification Passed: All Sleep Advanced UI & i18n certified clean.');"
```
