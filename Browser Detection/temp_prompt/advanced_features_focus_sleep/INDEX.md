# Advanced Suite Integration for Focus & Sleep Hubs: Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Task ID:** `TASK-ADVANCED-FEATURES-FOCUS-SLEEP-001`  
> **Workspace Container:** `temp_prompt/advanced_features_focus_sleep/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`, `tests/`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Background & Context
Following the clean UI Container Split of the Focus & Sleep Hubs, the Web Activity & Media Sentinel dashboard provides dedicated spacious containers for deep work and bedtime media cutoff:
- **Focus Sub-Hub:** Houses Basic Pomodoro Sentinel (`#widgetPomodoroSentinel`) and Focus Advanced Controls (`#widgetFocusAdvanced`).
- **Sleep Sub-Hub:** Houses Basic Sleep Sentinel Hub (`#cardSleepSentinelHub`) and Sleep Advanced Controls (`#cardSleepAdvanced`).

### 1.2 Identified Opportunity & Feature Expansion
Users seeking advanced bio-hacking, distraction mitigation, and circadian relaxation require a rich suite of opt-in, science-backed productivity and bedtime tools:
1. **Focus Advanced Suite (5 Features):**
   - **Focus Integrity Score & Distraction Counter (`#toggleFocusIntegrityScore`):** Real-time attention retention scoring and distraction event tally.
   - **Auto-Mute Background Tabs on Focus (`#toggleFocusAutoMuteBg`):** Automated silencer for noisy background browser tabs upon entering focus.
   - **Binaural Beats & Flow Frequencies (`#selectFocusSoundscape` expansion):** Alpha 10Hz (Deep Flow), Beta 18Hz (Analytical Focus), Gamma 40Hz (Peak Cognition) synthesized via Web Audio API.
   - **Soft-Nudge Breathe Overlay on Distracting Domains (`#toggleFocusBreatheNudge`):** 12-second box-breathing mindfulness overlay when navigating to flagged distraction domains during active sessions.
   - **20-20-20 Screen-Break & Posture Alert (`#toggleFocus2020Alert`):** Ergonomic reminders every 20 minutes to prevent digital eye strain and physical fatigue.

2. **Sleep Advanced Suite (6 Features):**
   - **Auto-Disable Video Autoplay (`#toggleSleepAutoplayBlock`):** Intercepts and suspends infinite video autoplay on streaming platforms (YouTube, Netflix, etc.) during bedtime.
   - **Sleep Aid Soundscapes (`#selectSleepAidSoundscape`):** Dedicated sleep acoustic synthesizers (Pink Noise, Midnight Ocean, Delta Rain 2-4Hz) with gradual fade sync.
   - **Inactivity Fast-Cutoff (`#toggleSleepInactivityFastCutoff`):** Expedited sleep cutoff if user is detected idle/asleep for > 5 minutes while timer is active.
   - **Progressive Screen Dimmer Nudge (`#toggleSleepScreenDimmer`):** Smooth circadian screen luminance reduction as the sleep timer approaches cutoff.
   - **Memory-Saver Tab Hibernation (`#toggleSleepTabHibernate`):** Automatic background tab suspension to free RAM and eliminate fan/thermal noise during sleep.
   - **Power-Nap Mode 20m (`#btnSleepPowerNapMode`):** 1-click dedicated 20-minute restorative power nap with automatic fade-out and gentle wake chime.

### 1.3 Ironclad Constitutional Mandates
- **Basic Containers Untouched Invariant:** `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` MUST REMAIN COMPLETELY UNTOUCHED. Zero alterations to basic dials, timer clocks, presets, or primary buttons.
- **Default OFF / Inactive Invariant:** EVERY single newly introduced toggle, selector, and mode MUST BE OFF, INACTIVE, OR SET TO 'NONE' BY DEFAULT. No surprise audio playback, no unexpected tab muting, and no unwanted overlays without explicit user activation.
- **W3C Trusted Types Compliance:** Absolute zero `innerHTML`, `outerHTML`, or `document.write`. Strict use of `textContent`, `setAttribute`, and DOM element factory patterns.
- **Zero Regression:** All existing 83+ test suites and previous container split guarantees must continue passing with exit code 0.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Focus Advanced HTML, CSS & Bilingual i18n | `dashboard/dashboard.html`<br>`dashboard/dashboard.css`<br>`dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -e "const fs=require('fs'),h=fs.readFileSync('dashboard/dashboard.html','utf8'),c=fs.readFileSync('dashboard/dashboard.css','utf8'),j=fs.readFileSync('dashboard/dashboard.js','utf8'); console.assert(h.includes('id=\"toggleFocusIntegrityScore\"') && h.includes('id=\"toggleFocusAutoMuteBg\"') && h.includes('id=\"toggleFocusBreatheNudge\"') && h.includes('id=\"toggleFocus2020Alert\"') && h.includes('value=\"binaural_alpha\"') && c.includes('.focus-integrity-card') && j.includes('lbl_focus_integrity')); console.log('Phase 1 OK')"` | ⏳ READY |
| **02** | Sleep Advanced HTML, CSS & Bilingual i18n | `dashboard/dashboard.html`<br>`dashboard/dashboard.css`<br>`dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -e "const fs=require('fs'),h=fs.readFileSync('dashboard/dashboard.html','utf8'),c=fs.readFileSync('dashboard/dashboard.css','utf8'),j=fs.readFileSync('dashboard/dashboard.js','utf8'); console.assert(h.includes('id=\"toggleSleepAutoplayBlock\"') && h.includes('id=\"selectSleepAidSoundscape\"') && h.includes('id=\"toggleSleepInactivityFastCutoff\"') && h.includes('id=\"toggleSleepScreenDimmer\"') && h.includes('id=\"toggleSleepTabHibernate\"') && h.includes('id=\"btnSleepPowerNapMode\"') && c.includes('.sleep-soundscape-panel') && j.includes('lbl_sleep_aid_soundscapes')); console.log('Phase 2 OK')"` | ⏳ READY |
| **03** | Domain Logic, Event Listeners & State Binding | `dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -e "const fs=require('fs'),j=fs.readFileSync('dashboard/dashboard.js','utf8'); console.assert(j.includes('startBinauralBeats') && j.includes('startSleepAidSoundscape') && j.includes('triggerPowerNapMode') && j.includes('updateFocusIntegrityScore') && j.includes('trigger2020PostureAlert') && j.includes('triggerBreatheNudgeOverlay')); console.log('Phase 3 OK')"` | ⏳ READY |
| **04** | Independent QA Test Suite & Master Regression | `tests/test_advanced_features_focus_sleep.js`<br>`node run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_advanced_features_focus_sleep.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | Target File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | `#widgetFocusAdvanced` lacks UI controls for integrity score, auto-mute, binaural beats, breathe nudge, and 20-20-20 alerts. | Surgically inject semantic toggle rows, distraction metric badge, binaural beat select options, and posture alert toggle inside `#widgetFocusAdvanced` with default OFF state. | Seamless integration without touching basic container `#widgetPomodoroSentinel`. | Phase 1 | Focus Advanced DOM Element Audit |
| **2** | `dashboard/dashboard.css` | Absence of styling for focus integrity score badge, distraction counter, and soft-nudge breathe overlay. | Implement clean glassmorphic styling, pulse animation for breathing cycle, and metric badge layout. | Elevated visual hierarchy adhering to Cyber-Dark Design Tokens. | Phase 1 | Focus CSS Class & Selector Audit |
| **3** | `dashboard/dashboard.js` | Missing bilingual localization keys for the 5 Focus Advanced features in English and Hindi dictionaries. | Add comprehensive i18n key-value pairs in `I18N_DICTIONARY.en` and `I18N_DICTIONARY.hi`. | 100% bilingual parity and internationalization standard compliance. | Phase 1 | i18n Key Parity Assertion |
| **4** | `dashboard/dashboard.html` | `#cardSleepAdvanced` lacks UI controls for autoplay block, sleep aid soundscapes, fast cutoff, dimmer nudge, tab hibernation, and power-nap mode. | Surgically inject sleep soundscape selector, feature toggles, and power-nap mode button inside `#cardSleepAdvanced` with default OFF state. | Rich bedtime suite without altering basic container `#cardSleepSentinelHub`. | Phase 2 | Sleep Advanced DOM Element Audit |
| **5** | `dashboard/dashboard.css` | Absence of styling for sleep aid soundscapes panel, dimmer overlay transition, and power-nap mode button states. | Add `.sleep-soundscape-panel`, `.btn-power-nap`, `.screen-dimmer-overlay`, and active glow styling. | Beautiful night-mode ergonomics and smooth circadian visual transitions. | Phase 2 | Sleep CSS Class & Selector Audit |
| **6** | `dashboard/dashboard.js` | Missing bilingual localization keys for the 6 Sleep Advanced features in English and Hindi dictionaries. | Add comprehensive i18n key-value pairs in `I18N_DICTIONARY.en` and `I18N_DICTIONARY.hi`. | 100% bilingual parity and internationalization standard compliance. | Phase 2 | i18n Key Parity Assertion |
| **7** | `dashboard/dashboard.js` | Absence of runtime synthesizers for binaural beats (Alpha 10Hz, Beta 18Hz, Gamma 40Hz) and sleep soundscapes (Pink Noise, Midnight Ocean, Delta Rain). | Author Web Audio API synthesizers using stereo channel splitters/panners and biquad filters with zero external audio assets. | Instant, zero-latency, asset-free acoustic generation in browser. | Phase 3 | Web Audio Synthesizer Execution Gate |
| **8** | `dashboard/dashboard.js` | Absence of state management, event listeners, local storage persistence, and timer hooks for the 11 advanced features. | Implement modular controller handlers (`setupFocusAdvancedControls`, `setupSleepAdvancedControls`) initializing all state as OFF in `localStorage` (`sentinel_focus_adv_*`, `sentinel_sleep_adv_*`). | Robust, persistent feature control with strict default OFF guarantees. | Phase 3 | AST & Controller State Machine Gate |
| **9** | `tests/test_advanced_features_focus_sleep.js` | Absence of automated test battery validating the 11 new advanced features, basic container preservation, default OFF states, and audio safety. | Author comprehensive 8-battery QA suite verifying DOM, defaults, CSS, i18n, controller functions, and backward compatibility. | Permanent regression shield and continuous integration gatekeeper. | Phase 4 | `node tests/test_advanced_features_focus_sleep.js` (Exit Code 0) |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **UTF-8 with BOM Standard:** All modified and newly created files must be saved with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
2. **Function Length Limit:** All new and modified JavaScript functions must strictly adhere to <= 50 lines per Universal Rule 28.
3. **W3C Trusted Types Compliance:** Absolute prohibition on `innerHTML`, `outerHTML`, and `document.write`. Use `textContent`, `setAttribute`, and DOM construction methods.
4. **Basic Container Invariance:** `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` must remain 100% intact and untouched.
5. **Strict Default OFF Guarantee:** Every newly created toggle, select option, or button must be OFF, inactive, or None on initial launch.
6. **Zero-Code Hard Lock:** Level 1 CEO and Level 2 Manager never write codebase code. Level 4 Sub Agents execute each phase under an active `AUTH-MGR-*` token.
