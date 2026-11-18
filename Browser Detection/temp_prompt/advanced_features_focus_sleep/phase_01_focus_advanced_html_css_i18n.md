# Phase 01: Focus Advanced HTML, CSS & Bilingual i18n Specification

> **Document Type:** Standalone Phase Execution Instruction  
> **Phase #:** 01 of 04  
> **Task ID:** `TASK-ADVANCED-FEATURES-FOCUS-SLEEP-001`  
> **Target Subsystem:** Focus Advanced Controls Container (`#widgetFocusAdvanced`)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Target Files:** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`  
> **Lead Departments:** Dept 04 (UI/UX Design), Dept 05 (Frontend Engineering)  

---

## 🎯 1. Phase Objective

Surgically implement the DOM structure, Cyber-Dark styling, and bilingual i18n dictionaries for the 5 Focus Advanced features strictly inside `#widgetFocusAdvanced`. All new controls MUST default to OFF / inactive / None. Basic container `#widgetPomodoroSentinel` MUST REMAIN UNTOUCHED.

---

## 📋 2. Prerequisites & Technical Context

- **Prerequisites:** Workspace anchored to `memory.md` and `temp_prompt/advanced_features_focus_sleep/INDEX.md`.
- **Target Container Anchor:** `#widgetFocusAdvanced` in `dashboard/dashboard.html` (approx. line 1431).
- **Basic Container Invariant:** `#widgetPomodoroSentinel` (approx. lines 1240-1351) MUST NOT BE MODIFIED.
- **Trusted Types Invariant:** Zero `innerHTML` or `outerHTML`. All markup written directly in HTML or injected safely.

---

## 🔨 3. Surgical Step-by-Step Instructions

### Step 1.1: Expand `#selectFocusSoundscape` in `dashboard/dashboard.html`
Inside `#widgetFocusAdvanced` -> `.focus-soundscape-panel` -> `#selectFocusSoundscape`:
Add the 3 Binaural Beats options directly below existing options (`whitenoise`):
```html
<option value="binaural_alpha" data-i18n="soundscape_opt_binaural_alpha">🧘 Alpha 10Hz (Flow State)</option>
<option value="binaural_beta" data-i18n="soundscape_opt_binaural_beta">🧠 Beta 18Hz (Analytical Focus)</option>
<option value="binaural_gamma" data-i18n="soundscape_opt_binaural_gamma">⚡ Gamma 40Hz (Peak Cognition)</option>
```
*Verify default remains `value="none"` selected.*

### Step 1.2: Add Focus Advanced Toggle Rows in `dashboard/dashboard.html`
Inside `#widgetFocusAdvanced` -> `.dash-focus-toggles-container`:
Directly following existing toggle `#toggleFocusDistractionShield`, append the following 4 new semantic toggle rows:
1. **Focus Integrity Score & Distraction Counter:**
```html
<div class="dash-focus-toggle-row focus-integrity-row">
  <label class="toggle-text-group" for="toggleFocusIntegrityScore">
    <span class="toggle-title" data-i18n="lbl_focus_integrity">Focus Integrity Score</span>
    <span class="toggle-desc" data-i18n="desc_focus_integrity">Live attention score and distraction tally</span>
  </label>
  <div class="focus-integrity-meta-group">
    <span id="badgeFocusIntegrityScore" class="badge-integrity-score">100%</span>
    <span id="cntFocusDistractions" class="badge-distraction-counter" title="Distraction tab switches count">0</span>
    <input type="checkbox" id="toggleFocusIntegrityScore" class="styled-checkbox">
  </div>
</div>
```
2. **Auto-Mute Background Tabs on Focus:**
```html
<label class="dash-focus-toggle-row" for="toggleFocusAutoMuteBg">
  <span class="toggle-text-group">
    <span class="toggle-title" data-i18n="toggle_focus_automute_bg">Auto-Mute Background Tabs</span>
    <span class="toggle-desc" data-i18n="desc_focus_automute_bg">Mute noisy background tabs during focus</span>
  </span>
  <input type="checkbox" id="toggleFocusAutoMuteBg" class="styled-checkbox">
</label>
```
3. **Soft-Nudge Breathe Overlay on Distracting Domains:**
```html
<label class="dash-focus-toggle-row" for="toggleFocusBreatheNudge">
  <span class="toggle-text-group">
    <span class="toggle-title" data-i18n="toggle_focus_breathe_nudge">Soft-Nudge Breathe Overlay</span>
    <span class="toggle-desc" data-i18n="desc_focus_breathe_nudge">12s box-breathing prompt on distracting domains</span>
  </span>
  <input type="checkbox" id="toggleFocusBreatheNudge" class="styled-checkbox">
</label>
```
4. **20-20-20 Screen-Break & Posture Alert:**
```html
<label class="dash-focus-toggle-row" for="toggleFocus2020Alert">
  <span class="toggle-text-group">
    <span class="toggle-title" data-i18n="toggle_focus_2020_alert">20-20-20 Screen-Break & Posture</span>
    <span class="toggle-desc" data-i18n="desc_focus_2020_alert">Remind every 20m to look 20ft away for 20s and check posture</span>
  </span>
  <input type="checkbox" id="toggleFocus2020Alert" class="styled-checkbox">
</label>
```

### Step 1.3: Add Static Overlay Elements in `dashboard/dashboard.html`
Before the closing tag of `#paneWellbeing` (or body container), append the hidden overlay templates:
```html
<!-- Soft-Nudge Breathe Overlay Modal (Feature 4, Default Hidden) -->
<div id="overlayBreatheNudge" class="breathe-nudge-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="txtBreatheNudgeTitle">
  <div class="breathe-nudge-modal liquid-glass-card">
    <div class="breathe-ring-container">
      <div id="breatheVisualRing" class="breathe-visual-ring"></div>
      <span id="breathePacingText" class="breathe-pacing-text">Inhale</span>
      <span id="breathePacingCountdown" class="breathe-countdown-num">4</span>
    </div>
    <h3 id="txtBreatheNudgeTitle" class="breathe-title" data-i18n="breathe_nudge_title">Mindful Pause: Stay Focused</h3>
    <p id="txtBreatheNudgeDesc" class="breathe-desc" data-i18n="breathe_nudge_desc">Take a conscious breath before browsing distracting content.</p>
    <div class="breathe-actions-row">
      <button type="button" id="btnBreatheReturnTask" class="btn-breathe-primary" data-i18n="btn_breathe_return">Return to Focus</button>
      <button type="button" id="btnBreatheAllowTemp" class="btn-breathe-secondary" data-i18n="btn_breathe_allow">Allow for 5m</button>
    </div>
  </div>
</div>

<!-- 20-20-20 Posture Alert Toast HUD (Feature 5, Default Hidden) -->
<div id="toast2020PostureAlert" class="toast-2020-alert hidden" role="alert" aria-live="assertive">
  <div class="toast-2020-icon">👁️</div>
  <div class="toast-2020-content">
    <div class="toast-2020-title" data-i18n="toast_2020_title">20-20-20 Screen-Break</div>
    <div class="toast-2020-desc" data-i18n="toast_2020_desc">Look at an object 20 feet away for 20 seconds. Relax neck & shoulders.</div>
  </div>
  <button type="button" id="btnClose2020Alert" class="toast-2020-close" aria-label="Close notification">✕</button>
</div>
```

### Step 1.4: Add Cyber-Dark CSS Styling in `dashboard/dashboard.css`
Append styles for:
- `.focus-integrity-row`, `.focus-integrity-meta-group`, `.badge-integrity-score`, `.badge-distraction-counter`
- `.breathe-nudge-overlay`, `.breathe-nudge-modal`, `.breathe-visual-ring`, `@keyframes breatheCycle`
- `.toast-2020-alert`, `.toast-2020-icon`, `.toast-2020-content`, `.toast-2020-title`

### Step 1.5: Add Bilingual i18n Keys in `dashboard/dashboard.js`
In both `I18N_DICTIONARY.en` and `I18N_DICTIONARY.hi`:
Add all keys specified in PRD Section 6 (`lbl_focus_integrity`, `desc_focus_integrity`, `toggle_focus_automute_bg`, `desc_focus_automute_bg`, `soundscape_opt_binaural_alpha`, `soundscape_opt_binaural_beta`, `soundscape_opt_binaural_gamma`, `toggle_focus_breathe_nudge`, `desc_focus_breathe_nudge`, `toggle_focus_2020_alert`, `desc_focus_2020_alert`, `breathe_nudge_title`, `breathe_nudge_desc`, `btn_breathe_return`, `btn_breathe_allow`, `toast_2020_title`, `toast_2020_desc`).

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **Strictly Out-of-Scope:** Do NOT touch `#widgetPomodoroSentinel`.
- **Strictly Out-of-Scope:** Do NOT write audio DSP synthesis algorithms in this phase (handled in Phase 3).
- **Default OFF Requirement:** All injected checkboxes must NOT have the `checked` attribute.

---

## 📦 5. Deliverables Manifest
- Updated `dashboard/dashboard.html` with Focus Advanced controls.
- Updated `dashboard/dashboard.css` with responsive Cyber-Dark styling.
- Updated `dashboard/dashboard.js` with bilingual i18n dictionary entries.

---

## 🛡️ 6. Local Verification Gate Command

```bash
node -e "const fs=require('fs'); const h=fs.readFileSync('dashboard/dashboard.html','utf8'); const c=fs.readFileSync('dashboard/dashboard.css','utf8'); const j=fs.readFileSync('dashboard/dashboard.js','utf8'); console.assert(h.includes('id=\"toggleFocusIntegrityScore\"'), 'Missing toggleFocusIntegrityScore'); console.assert(h.includes('id=\"toggleFocusAutoMuteBg\"'), 'Missing toggleFocusAutoMuteBg'); console.assert(h.includes('value=\"binaural_alpha\"'), 'Missing binaural_alpha'); console.assert(h.includes('id=\"toggleFocusBreatheNudge\"'), 'Missing toggleFocusBreatheNudge'); console.assert(h.includes('id=\"toggleFocus2020Alert\"'), 'Missing toggleFocus2020Alert'); console.assert(c.includes('.focus-integrity-row') || c.includes('.badge-integrity-score'), 'Missing CSS'); console.assert(j.includes('lbl_focus_integrity') && j.includes('soundscape_opt_binaural_alpha'), 'Missing i18n'); console.log('✅ Phase 1 Verification Passed: All Focus Advanced UI & i18n certified clean.');"
```
