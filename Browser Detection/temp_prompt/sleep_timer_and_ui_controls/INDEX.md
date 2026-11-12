# Web Activity & Media Sentinel: Sleep Timer and Modern UI Controls Dossier

> **Authoritative Specification & Governance:**
> - **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Target Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Prompt Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Universal Rules:** [`universal_rules.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/archive/universal_rules.md)
> - **Lead Departments:** Department 01 (Product Requirements) & Department 05 (Frontend Engineering)

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 The Operational Problem
The **Web Activity & Media Sentinel** browser extension tracks per-domain active time and monitors foreground/background video and audio streams across Chromium browsers (Chrome, Edge, Brave, Opera). However, long-running media sessions suffer from critical usability and system resource deficiencies:
1. **Runaway Autoplay & Bedtime Exhaustion:** Users streaming podcasts, lo-fi beats, ambient audio, YouTube playlists, or Netflix late at night frequently fall asleep or step away. Playback runs unabated for hours, depleting laptop battery, consuming broadband quotas, and corrupting productivity tracking datasets with dozens of false active hours.
2. **Missing 1-Click Global Playback Controls:** To silence or pause media, users currently must identify the playing tab among dozens of open browser tabs or open the popup, navigate to the media card, and click the single dynamic button. There is no universal 1-click global play/pause toggle in the primary navigation toolbar or footer.
3. **Outdated Iconography & Feedback:** The extension popup footer currently relies on plain Unicode emojis (`🔄`, `⚡`, `🎯`, `📊`), which render inconsistently across operating systems, lack active state transitions, and provide zero dynamic visual feedback for ongoing timers or countdown status.
4. **Absence of Inactivity Auto-Sleep:** When a workstation is left idle (AFK) while media plays in an active tab, the extension does not detect prolonged user absence or transition media streams into a power-saving pause state.

### 1.2 The Architectural Solution
This initiative delivers an enterprise-grade **Sleep Timer & Modern UI Control Suite** engineered for Manifest V3 non-persistent service worker resilience:
- **Persistent Sleep Timer Engine:** State is anchored in `chrome.storage.local` and scheduled via `chrome.alarms` (`sentinel_sleep_timer_alarm`), guaranteeing wake-up and execution even if the background service worker is terminated by Chromium.
- **Inactivity Sentinel Integration:** Seamlessly bridges with `chrome.idle` and tab user activity heartbeats to automatically trigger sleep mode or pause media when idle thresholds are exceeded.
- **Dynamic Color-Interpolated Badge & Countdown UI:** Real-time extension badge displays remaining minutes/seconds with linear color interpolation (`#22c55e` Green -> `#eab308` Yellow -> `#ef4444` Red), backed by a modern countdown chip in the popup.
- **Modern Vector SVG Control Toolbar:** Replaces emoji buttons with crisp, high-DPI, accessible SVG icons (Refresh, Global Play/Pause toggle, Sleep Timer modal launcher, HUD bridge, Dashboard).
- **Gradual Volume Fade-Out:** Optional 30-to-60-second linear volume step-down across active audio/video elements prior to final pause, preventing abrupt audio cutoffs.
- **Enterprise Settings Panel:** Dedicated configuration card in `dashboard.html` for default timer presets, fade duration, auto-sleep thresholds, and notification alerts.

---

## 🚦 2. Live Tracking Board & Milestone Status

| Phase | Phase Name | Assigned Specialist | Target Files | Verification Gate | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Storage Schema & Sleep Timer State Engine | Core Background Specialist | `background.js`, `manifest.json` | Node Syntax + State Machine Tests | 🟡 PENDING |
| **02** | Inactivity Detector, Alarms & Fade/Pause Relay | Core Background Specialist | `background.js`, `content_media.js`, `inject_main_world.js` | MV3 Alarms & Idle IPC Dispatch Tests | 🟡 PENDING |
| **03** | Dashboard Settings & Sleep Timer Configuration | Frontend Dashboard Specialist | `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css` | Settings Persistence & UI Sync Tests | 🟡 PENDING |
| **04** | Popup Modern SVG Button Group & Countdown Badge | Frontend Popup Specialist | `popup/popup.html`, `popup/popup.js`, `popup/popup.css` | DOM Layout + Dynamic Color Interpolation Tests | 🟡 PENDING |
| **05** | Verification, Automated Test Suite & Certification | QA Verification Engineer | `tests/test_sleep_timer_and_ui_controls.js`, `tests/test_syntax_and_manifest_integrity.js` | 100% Pass in Test Suite with Grade A+ | 🟡 PENDING |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | [`manifest.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/manifest.json) | Action badge and idle permissions must be verified for MV3 compatibility. | Confirm `alarms`, `idle`, `storage` permissions are active (already present); ensure action badge configuration is valid. | Guaranteed API access for background timers, badge rendering, and idle state events. | Phase 1 | `node tests/test_syntax_and_manifest_integrity.js` |
| **2** | [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) | In-memory `setInterval` counters terminate when Chromium suspends the MV3 background service worker. | Implement epoch-based `targetTime` anchored in `chrome.storage.local` and scheduled via `chrome.alarms`. | Resilient countdown surviving service worker suspension, browser idle, and system sleep. | Phase 1 & 2 | `node tests/test_sleep_timer_and_ui_controls.js` |
| **3** | [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) | Playback pause commands only address single tabs from the media card; no global broadcast dispatcher. | Create `dispatchGlobalMediaAction('PAUSE')` iterating over `activeMediaSessions` with safe error suppression. | Synchronously pauses all active media streams across foreground and background tabs. | Phase 2 | `node tests/test_sleep_timer_and_ui_controls.js` |
| **4** | [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js) | Lacks a smooth volume attenuation routine before media pause. | Add `FADE_AND_PAUSE` message listener with linear volume step-down (10 steps over 30s) before calling `pause()`. | Soft, soothing auditory transition preventing abrupt silence during sleep onset. | Phase 2 | `node tests/test_sleep_timer_and_ui_controls.js` |
| **5** | [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) | Settings pane contains no user controls for default sleep duration, auto-sleep idle thresholds, or fade-out. | Add dedicated "Sleep Timer & Inactivity Settings" card to Settings pane with form controls and sync buttons. | Full user configuration with instant synchronization to `chrome.storage.local`. | Phase 3 | `node tests/test_syntax_and_manifest_integrity.js` |
| **6** | [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html) | Footer uses text emojis (`🔄`, `⚡`, `🎯`, `📊`) and lacks global play/pause and sleep timer buttons. | Refactor footer into a 5-button responsive SVG toolbar with active state styling and a floating sleep timer popover. | Crisp high-DPI vector iconography, 1-click controls, intuitive preset selection, and zero layout shift. | Phase 4 | `node tests/test_syntax_and_manifest_integrity.js` |
| **7** | [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) | No badge or countdown chip rendering logic for sleep timer feedback. | Add countdown ticker that dynamically computes remaining time and applies color interpolation (`#22c55e` -> `#eab308` -> `#ef4444`). | Clear, glanceable temporal awareness on the toolbar icon and inside popup header/footer. | Phase 4 | `node tests/test_sleep_timer_and_ui_controls.js` |
| **8** | [`tests/test_sleep_timer_and_ui_controls.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_sleep_timer_and_ui_controls.js) | Existing test suites do not test sleep timer state transitions, color math, or SVG structure. | Develop comprehensive unit & integration test suite verifying state machine, alarms, color math, and DOM. | Automated 100% pass verification with Grade A+ signoff before project completion. | Phase 5 | `node tests/test_sleep_timer_and_ui_controls.js` |

---

## 🛡️ 4. Architectural Rules & Governance Invariants
1. **Zero-Code Hard Lock for CEO & Manager:** All implementation must be executed strictly by Level 4 Execution Sub Agents dispatched under valid authorization tokens (`AUTH-MGR-*`).
2. **UTF-8 with BOM Standard:** Every created or modified file MUST be encoded in UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) per Universal Rule 5 & 8.
3. **W3C Trusted Types & Zero `innerHTML` Standard:** All DOM injections in `popup.js` and `dashboard.js` must use safe methods (`createElement`, `textContent`, `setAttribute`, `appendChild`) to ensure 100% CSP compliance.
4. **Safe IPC Promise Rejection:** All `chrome.tabs.sendMessage` calls must be wrapped with rejection handlers to silently suppress dead tab errors.
5. **Deterministic Testing:** No manual browser testing required for phase completion; all gates must pass via `node tests/...` CLI runners with exit code 0.
