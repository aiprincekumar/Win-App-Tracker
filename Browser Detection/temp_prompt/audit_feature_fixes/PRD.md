# Product Requirements Document (PRD): Browser Detection Feature Defect Fixes

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Target Subsystems:** `dashboard/dashboard.js`, `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/styles/audio_lab.css`, `background.js`, `tests/`  
> **Lead Department:** Dept 01 (Product Requirements) & Dept 04 (Core Logic)  

---

## 🎯 1. Overview & Objectives

This PRD defines the operational requirements for rectifying 4 functional defects in the Browser Detection extension to ensure seamless cross-subsystem cohesion between UI controls and background automation engines.

---

## 👥 2. User Personas & Problem Scenarios

### Persona 1: Power User navigating via Omni Command Palette
- **Scenario:** The user presses `Ctrl+K` (or clicks the Omni search button), types a domain name (e.g., "youtube.com"), and hits Enter to jump to analytics.
- **Pain Point:** The dashboard switches tabs, but the search box remains empty and the table is unfiltered because the code looks for a non-existent ID `domainSearchInput`.
- **Expected Outcome:** The domain search input `#tableDomainSearch` is immediately populated with "youtube.com" and an `input` event fires, filtering domain records.

### Persona 2: Audio Enthusiast tuning Equalizer Settings
- **Scenario:** The user adjusts EQ sliders or selects an EQ preset ('Bass Boost', 'Voice', 'Flat') in the Audio Lab Bento Card.
- **Pain Point:** The UI lacks a clear status badge indicating the currently active preset state, even though `dashboard.js` attempts to update `#audioLabPresetBadge`.
- **Expected Outcome:** A cyber-dark glowing badge displays the active preset name prominently next to the preset dropdown.

### Persona 3: User setting a Sleep Timer with Timeout Actions
- **Scenario:** The user configures a 30-minute sleep timer with timeout action set to 'Mute' or 'Close Tab'.
- **Pain Point:** When the timer runs out, background music continues playing or tabs stay unmuted because the backend only ever executes `PAUSE_ALL`.
- **Expected Outcome:** When the timer reaches 0, the configured action ('mute', 'close_tab', 'pause') executes accurately across all active media streams.

---

## 📋 3. Functional Requirements (FR)

### FR-1: Omni Command Palette Domain Input Binding
- The action handler for domain selection in `OmniCommandPalette` must target `document.getElementById('tableDomainSearch')`.
- If `#tableDomainSearch` is unavailable, it must gracefully fall back to `document.getElementById('domainSearchInput')`.
- Upon element resolution, it must assign `.value = domain` and dispatch a native `Event('input')`.

### FR-2: Sleep Extender Fade Toggle State Detection
- The function `triggerExtendSleepTimer(extraMinutes)` must query `document.getElementById('toggleDashSleepFade')`.
- If not found, it must fall back to `document.getElementById('toggleDashSleepFadeCurve')`.
- The resolved checkbox state must accurately dictate `enableFadeOut: fadeToggle ? fadeToggle.checked : true`.

### FR-3: Audio Lab EQ Preset Badge UI
- An HTML element `<span id="audioLabPresetBadge" class="badge-eq-preset">Flat</span>` must be rendered in `dashboard.html` inside `.eq-actions-group`.
- Cyber-dark styling must be applied in `dashboard/styles/audio_lab.css` and `dashboard/dashboard.css`.
- Presets ('flat', 'bass_boost', 'custom', etc.) updated by `dashboard.js` must reflect capitalized formatting (e.g., "Flat", "Bass Boost", "Custom").

### FR-4: Sleep Timer Timeout Action Execution
- `triggerSleepTimerExpiration()` in `background.js` must resolve `timeoutAction` from `sleepTimerState` or `sleepTimerSettings`.
- Supported actions:
  - `'mute'`: invoke `handleMuteAllExecution(true)`.
  - `'close'` / `'close_tab'`: close media tabs via `browserAPI.tabs.remove()`.
  - `'pause'`: invoke `dispatchGlobalMediaAction('PAUSE_ALL')`.

---

## ⚙️ 4. Non-Functional Requirements (NFR)

- **NFR-1 (UTF-8 with BOM):** All saved files must preserve `0xEF, 0xBB, 0xBF`.
- **NFR-2 (Function Length):** Maximum line length for any function in `background.js` and `dashboard.js` is 50 lines.
- **NFR-3 (DOM Security):** Zero `innerHTML` usage. Use `textContent` and `createElement` exclusively.
- **NFR-4 (WCAG 2.1 AA Accessibility):** Badge text color contrast must exceed 4.5:1 against card background.
- **NFR-5 (Test Passage):** 100% pass across all 78+ test suites (`node run_all_tests.js`).

---

## 🧪 5. INVEST User Stories & Acceptance Criteria

### User Story 1 (Omni Domain Search)
> **As an** extension user,  
> **I want** clicking a domain in the Omni palette to filter the analytics table,  
> **So that** I immediately see statistics for that domain.

- **Given** the user triggers a domain action in the Omni Command Palette,
- **When** the tracking tab is activated,
- **Then** `#tableDomainSearch` receives the domain string and triggers filtering.

### User Story 2 (Sleep Extender Fade Toggle)
> **As a** bedtime listener,  
> **I want** the sleep extender button to respect my un-checked audio fade toggle,  
> **So that** audio does not prematurely fade when I choose instant shutoff.

- **Given** `#toggleDashSleepFade` is unchecked (`checked === false`),
- **When** `triggerExtendSleepTimer(15)` is invoked,
- **Then** `currentDashSleepTimer.enableFadeOut` is `false`.

### User Story 3 (Audio Lab Preset Badge)
> **As an** audio enthusiast,  
> **I want** to see an active preset badge on the Equalizer card,  
> **So that** I know at a glance whether my audio curve is Flat, Bass Boost, or Custom.

- **Given** the user selects "Bass Boost" in `#audioEqPresetSelect`,
- **When** the change event is dispatched,
- **Then** `#audioLabPresetBadge.textContent` displays `"Bass Boost"`.

### User Story 4 (Sleep Timer Timeout Action)
> **As a** user setting sleep timers,  
> **I want** the extension to mute or close tabs upon expiration if configured,  
> **So that** my browser stops making noise or closes tabs automatically.

- **Given** `sleepTimerState.timeoutAction === 'mute'`,
- **When** `triggerSleepTimerExpiration()` is executed,
- **Then** `handleMuteAllExecution` mutes active candidate tabs.
