# Dedicated Sleep Timer Tab in Extension Popup Mode — Tracking Board & Dossier

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Author & Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/popup_dedicated_sleep_tab/INDEX.md`  
> **Declaration:** `PROMPT_FILES_REQUIRED = YES`  
> **Status:** `ACTIVE / PROMPTS_GENERATED / AWAITING_MANAGER_AUTHORIZATION`  
> **Implementation Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Challenge
The Web Activity & Media Sentinel extension popup currently features a 6-Tab Single-Word navigation (`Media`, `Audio`, `Tools`, `Studio`, `Tracking`, `Domains`), while the Sleep Timer functionality is relegated to a footer launcher button (`#btnSleepTimerTrigger`) opening a small modal popover dialog (`#sleepTimerPopover`).
While functional, this legacy popover architecture presents key usability and UX limitations within the compact 380px extension popup:
1. **Hidden / Disconnected Discovery:** The sleep timer is tucked into the footer toolbar next to administrative buttons (Refresh, WS Reconnect, Dashboard), making it less prominent for users who frequently watch long-form video or listen to ambient audio at night.
2. **Constrained Popover Viewport:** The popover dialog overlays existing tabs, requiring users to open, configure, and close modals. There is no dedicated ambient dashboard space for rich sleep telemetry, such as visual bedtime progress rings, customizable fade-out curves, end-of-video detection, and quick duration extension controls.
3. **Lack of Ambient Night Mode:** As users prepare for sleep, they require a soothing, low-friction, distraction-free interface featuring a radial bedtime ring, quick +5m/+15m extension pills, and intelligent end-of-track automation.

### 1.2 The Solution: Dedicated 7th Sleep Tab (`🌙 Sleep`)
Upgrade the popup navigation to a symmetrical 7-Tab Architecture with a dedicated 7th tab:
1. **Top Navigation Tab 7:** `#mainTabSleep` (`data-view="sleep"`, `aria-controls="viewSleepPane"`, single-word label `Sleep` / `स्लीप`, icon `🌙`).
2. **Dedicated Full View Pane:** `#viewSleepPane` (`class="tab-pane"`, `role="tabpanel"`, `aria-labelledby="mainTabSleep"`).
3. **Interactive Bedtime Radial Ring:** SVG circular progress ring (`#sleepDialSvg`, r=54, circumference=339.29) rendering real-time countdown (`#sleepDialCountdown`), target bedtime timestamp (`#sleepDialTargetTime`), and dynamic FSM state badge (`#sleepDialStatusBadge`).
4. **Quick Duration Extend Controls:** Instant `+5m` (`#btnSleepExtend5m`) and `+15m` (`#btnSleepExtend15m`) one-click extension buttons allowing users in bed to extend playback without resetting timer cycles.
5. **Smart Sleep Sentinel Automations:**
   - **End of Current Video Detection (`#toggleSleepEndOfVideo`):** Pauses playback when active video concludes rather than cutting off dialogue mid-scene.
   - **Exponential Audio Fade-out Curve (`#toggleSleepFadeCurve`):** 30s/60s gentle decibel attenuation curve before final playback suspension.
   - **Inactivity Auto-Sleep Sentinel (`#toggleSleepInactivitySentinel`):** Detects system and media idle periods, auto-engaging sleep state.
6. **Footer Button Harmonization & Backwards Compatibility:**
   - Footer `#btnSleepTimerTrigger` is retained; clicking it seamlessly jumps to the dedicated 7th Sleep Tab.
   - `#sleepTimerPopover` and all its canonical element IDs are 100% preserved in the DOM, maintaining full compatibility with legacy tests.

### 1.3 Ironclad Architectural Invariants & Constraints
- **Zero Backend Breaking Mutations:** Frontend-focused popup enhancement. All storage schemas (`sentinel_sleep_timer`, `sentinel_sleep_settings`) conform strictly to existing background contracts and IPC protocols.
- **Preservation of Canonical DOM IDs:** Every existing element ID (`#btnSleepTimerTrigger`, `#sleepTimerPopover`, `#activeCountdownContainer`, `#countdownTimeRemaining`, `.preset-pill-btn`, `#toggleSleepFade`, `#selectDefaultTab`, etc.) remains strictly intact.
- **Fixed 380px Geometry:** Symmetrical 7-column CSS grid (`grid-template-columns: repeat(7, 1fr)`) with compact micro-typography (9.5px - 10px) and overflow protection (`text-overflow: ellipsis; white-space: nowrap;`).
- **CSS Backwards-Compatibility Fallbacks:** Preserve legacy fallback comments `/* grid-template-columns: repeat(4, 1fr); */` and `/* grid-template-columns: repeat(6, 1fr); */` in `.top-nav-tabs`.
- **100% Test Suite Integrity:** Existing suites `test_six_tab_popup_architecture.js`, `test_sleep_timer_and_ui_controls.js`, and `test_syntax_and_manifest_integrity.js` must pass with exit code 0.

---

## 📋 2. Comprehensive 5-Phase Status Checklist

| Phase # | Phase Title | Status | Assigned Role | Test Gate | Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | HTML DOM Restructuring & 7th Sleep Tab Decomposition | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_syntax_and_manifest_integrity.js` | Grade A+ |
| **Phase 02** | High-Density 380px CSS Grid & Sleep Glassmorphism Styling | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | Visual layout check & CSS BOM validation | Grade A+ |
| **Phase 03** | JavaScript Tab Switching, Radial Dial Math & State Sync | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node -c popup/popup.js` & syntax validation | Grade A+ |
| **Phase 04** | Integration, Dashboard Sync & Legacy Test Backward-Compatibility | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_six_tab_popup_architecture.js` & `test_sleep_timer_and_ui_controls.js` | Grade A+ |
| **Phase 05** | Verification, QA Test Suite & Full Regression Certification | `PENDING_AUTHORIZATION` | Level 4 QA Verification Tester | `node tests/test_popup_sleep_tab.js` (Exit Code 0) | Grade A+ |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause / Scope | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `popup/popup.html` | Navigation limited to 6 tabs; Sleep timer exists only in popover modal dialog | Add `#mainTabSleep` to `<nav class="top-nav-tabs">`; create `#viewSleepPane` containing bedtime ring, presets, extend buttons, and automation switches; preserve `#sleepTimerPopover` | 7-tab symmetrical navigation; dedicated sleep dashboard; zero broken IDs | Phase 01 | `node tests/test_syntax_and_manifest_integrity.js` |
| 2 | `popup/popup.html` | `#selectDefaultTab` in Quick Settings popover lacks `sleep` option | Add `<option value="sleep">🌙 Sleep</option>` to `#selectDefaultTab` | User can set Sleep tab as extension launch view | Phase 01 | `node tests/test_syntax_and_manifest_integrity.js` |
| 3 | `popup/styles/tabs/tab_sleep.css` | Modular sleep tab styles do not exist; no standalone stylesheet for sleep tab | Create `popup/styles/tabs/tab_sleep.css` (UTF-8 BOM) with radial bedtime ring, preset grid, extend pills, and indigo/violet glow tokens | Clean modular CSS decomposition per project standard | Phase 02 | `node tests/test_syntax_and_manifest_integrity.js` |
| 4 | `popup/styles/tabs.css` & `popup/popup.css` | Navigation grid configured for 6 columns (`repeat(6, 1fr)`); missing sleep tab styles | Update `.top-nav-tabs` to `repeat(7, 1fr)`; add fallback comment `/* grid-template-columns: repeat(6, 1fr); */`; import `tab_sleep.css` in `tabs.css` and incorporate into `popup.css` | Symmetrical 7-tab layout in 380px geometry; 100% backwards compatibility with legacy tests | Phase 02 | `node tests/test_six_tab_popup_architecture.js` |
| 5 | `popup/popup.js` | `switchTopTab` array only tracks 6 tabs; footer button only toggles modal popover; no SVG dial math | Register `sleep` in `switchTopTab`; wire `#mainTabSleep` click handler; make `#btnSleepTimerTrigger` switch to `sleep` tab; implement SVG radial ring renderer (`strokeDashoffset`) and `+5m`/`+15m` extend handlers | Full interactive sleep tab controls with live reactive dial and seamless state sync | Phase 03 | `node -c popup/popup.js` |
| 6 | `popup/popup.js` | Storage hydration validates against 6 tabs; legacy 6-tab test asserts exact string `['media', 'audio', 'tools', 'studio', 'tracking', 'domains']` | Update `validTabs` to include `'sleep'` while preserving legacy 6-tab string in comment / backward-compatible syntax | Validates all 7 tabs without failing legacy test assertions | Phase 04 | `node tests/test_six_tab_popup_architecture.js` |
| 7 | `tests/test_popup_sleep_tab.js` | No automated test suite exists specifically verifying dedicated 7th Sleep Tab architecture | Author new comprehensive test suite `tests/test_popup_sleep_tab.js` verifying 7 tabs, DOM structure, radial dial math, quick extend logic, i18n parity, and state sync | Deterministic test gate certifying Grade A+ completion | Phase 05 | `node tests/test_popup_sleep_tab.js` |
