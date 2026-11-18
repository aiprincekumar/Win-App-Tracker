# 🌙 Sleep Timer Subsystem Backend Engine & Dashboard Hub: Master Index & Tracking Board

> **Document Type:** Master Index, Problem-Solution Dossier & Phase Tracking Board  
> **Container Directory:** [`temp_prompt/sleep_backend_and_dashboard_hub/`](.)  
> **Initiative:** Sleep Timer Subsystem Backend Engine & Dashboard Hub  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Execution Strategy:** Strategy A — Fully Autonomous Phase-wise Execution (Autonomy Score: 1.0)  
> **Decision Gate Requirement:** `PROMPT_FILES_REQUIRED = YES` (Compound multi-module architecture: MV3 background alarms, runtime IPC, storage schemas, dashboard HTML/CSS/JS, and QA battery)

---

## 📋 1. Problem-Solution Dossier

### 1.1 Context & Background
The **Web Activity & Media Sentinel** Chrome extension (MV3) features an advanced activity tracking and media control engine. It includes a Sleep Timer subsystem that lets users schedule automatic media cutoffs and volume fades. Currently, the popup UI (`popup/popup.html`, `popup/popup.js`) offers a dedicated sleep timer view with a radial dial and preset buttons. However, the system exhibits critical backend IPC gaps and lacks visual and interactive presence on the main Web Activity & Media Sentinel Dashboard (`dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`).

### 1.2 Root Cause Analysis & Gaps
1. **Asymmetric Backend IPC & Alarm Rescheduling:**
   - In `background.js`, message handlers only exist for `SET_SLEEP_TIMER`, `CANCEL_SLEEP_TIMER`, `GET_SLEEP_TIMER_STATE`, `GET_SLEEP_SETTINGS`, and `SAVE_SLEEP_SETTINGS`.
   - Messages sent from frontend components such as `EXTEND_SLEEP_TIMER`, `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, and `END_OF_VIDEO` are unhandled by the background service worker.
   - When the timer is paused or extended in the frontend via local storage mutation, MV3 alarms (`sentinel_sleep_timer_alarm` and `sentinel_sleep_fade_alarm`) are not cleared, recalculated, or rescheduled in the background. This leads to desynchronization, phantom alarm firing, or premature cutoff.
2. **Missing Sleep Sentinel Hub in Dashboard `paneWellbeing`:**
   - The dashboard's Wellbeing pane (`#paneWellbeing`) currently contains Pomodoro Sentinel, Domain Budgets, Tracking Blacklist, and Pinned Domains, but lacks a dedicated hero Sleep Sentinel Hub card (`#cardSleepSentinelHub`).
   - The only sleep-related UI on the dashboard is a small static configuration box in `#paneSettings` (`#cardSleepSettings`), which does not show live countdown, radial dial progress, active state badges, quick presets, or live extend buttons.
3. **Absence of Real-time Bidirectional Dashboard Reactivity:**
   - The dashboard does not listen to `sentinel_sleep_timer` state changes via `chrome.storage.onChanged` or broadcast messages.
   - State mutations triggered in the popup or background do not update the dashboard dial in real time, and vice versa.

### 1.3 Solution Architecture & End-State Deliverables
1. **Robust Background Engine & IPC Hub (`background.js`):**
   - Implement full support for `EXTEND_SLEEP_TIMER` (dynamically adds minutes, recalculates remaining time and alarms), `PAUSE_SLEEP_TIMER` (clears alarms, stores `pausedAt` and `remainingMs`, transitions state to `PAUSED`), and `RESUME_SLEEP_TIMER` (recomputes `targetTime = now + remainingMs`, reschedules alarms, transitions state to `RUNNING`).
   - Add handler and hook for `END_OF_VIDEO` (monitors primary media duration and triggers cutoff on video end).
   - Broadcast live state transitions (`SLEEP_TIMER_STATE_CHANGED`, `SLEEP_TIMER_EXPIRED`) to all active dashboard and popup views via `safeSendRuntimeMessage`.
2. **Cyber-Dark Bento Card UI in `paneWellbeing` (`dashboard/dashboard.html` & `dashboard.css`):**
   - Embed `#cardSleepSentinelHub` into `#paneWellbeing` alongside `#widgetPomodoroSentinel`.
   - Feature an SVG Radial Countdown Dial (geometry: $r=54$, $C=339.292$, stroke-dasharray/stroke-dashoffset), live digital countdown readout (`#dashSleepCountdownDisplay`), target finish time (`#dashSleepFinishTime`), dynamic state badge (`#dashSleepStatusBadge`), quick duration presets (15m, 30m, 45m, 60m, 90m, 120m), quick extender buttons (+5m, +15m), and primary action controls (Start / Pause / Resume / Cancel).
   - Cyber-dark glassmorphism theme tokens with WCAG 2.1 AA compliant contrast and smooth micro-animations.
3. **Reactive Dashboard Controller & Bidirectional Sync (`dashboard/dashboard.js`):**
   - Bind all buttons, presets, extenders, and toggle switches to runtime messages and storage updates.
   - Implement real-time 1-second ticker and SVG dial offset interpolation (`strokeDashoffset = C * (1 - ratio)`).
   - Establish seamless bidirectional synchronization across `background.js`, `popup.js`, and `dashboard.js`.
4. **Deterministic QA Verification Battery (`tests/test_sleep_backend_and_dashboard_hub.js`):**
   - Comprehensive test suite covering state machine transitions, IPC message handling, alarm rescheduling logic, SVG dial mathematical calculations, DOM element presence, and zero `innerHTML` Trusted Types compliance.

---

## 📊 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | Target File | Root Cause & Current Gap | Proposed Surgical Fix | Post-Fix System Impact | Phase # | Test Verification Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **01** | `background.js` | Missing message handlers for `EXTEND_SLEEP_TIMER`, `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, and `END_OF_VIDEO`; alarms not cleared or recalculated on pause/extend. | Add async handlers; implement `extendSleepTimer(extraMinutes)`, `pauseSleepTimer()`, `resumeSleepTimer()`, and `handleEndOfVideoTrigger()`; reschedule alarms and broadcast state. | Complete backend sleep timer lifecycle integrity; zero alarm drift or premature cutoff. | **Phase 1** | `node tests/test_sleep_backend_and_dashboard_hub.js` (Batteries 1-4) |
| **02** | `dashboard/dashboard.html` | `#paneWellbeing` lacks dedicated Sleep Sentinel Hub bento card; user cannot view or manage sleep timer from dashboard. | Insert `#cardSleepSentinelHub` inside `#tabContentWellbeing` with SVG radial dial, countdown display, presets (15-120m), extenders (+5m, +15m), action buttons, and feature toggles. | Dashboard users get full feature parity with popup sleep controls in a spacious bento view. | **Phase 2** | `node tests/test_sleep_backend_and_dashboard_hub.js` (Battery 5: DOM Integrity) |
| **03** | `dashboard/dashboard.css` | Missing styling for `#cardSleepSentinelHub`, SVG radial dial circle, sleep preset pills, action buttons, and active state badges. | Append modern cyber-dark glassmorphism styles, glowing neon cyan/purple accents, pulse animations, and responsive bento grid rules. | Immersive visual hierarchy conforming to cyber-dark design tokens and WCAG 2.1 AA. | **Phase 2** | `node tests/test_sleep_backend_and_dashboard_hub.js` (Battery 6: CSS & Design Audit) |
| **04** | `dashboard/dashboard.js` | No event listeners, tick interval, or storage listeners for sleep timer hub in dashboard. | Add `initSleepSentinelHub()`, `renderDashSleepTimer(timer)`, `updateDashSleepDial()`, preset/extender handlers, and bidirectional storage/runtime listeners. | Real-time synchronization between popup, dashboard, and background service worker. | **Phase 3** | `node tests/test_sleep_backend_and_dashboard_hub.js` (Batteries 7-9: Logic & Sync) |
| **05** | `popup/popup.js` | Uses ad-hoc local storage mutations without standard runtime message acknowledgment for pause/resume. | Ensure popup event handlers gracefully align with background's official `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, and `EXTEND_SLEEP_TIMER` messages. | 100% unified contract between popup and background. | **Phase 3** | `node tests/test_popup_sleep_tab.js` |
| **06** | `tests/test_sleep_backend_and_dashboard_hub.js` | No dedicated integration test suite verifying backend IPC extensions, dashboard markup, dial math, and bidirectional sync. | Author comprehensive multi-battery test suite covering all state transitions, IPC schemas, DOM elements, dial math, and Trusted Types. | Continuous regression prevention and automated quality certification. | **Phase 4** | `node run_all_tests.js` (68/68 passed, exit code 0) |

---

## 🚦 3. Phase Status Checklist & Execution Roadmap

| Phase # | Phase Title & Scope | Primary Deliverables | Target Agent Role | Local Test Gate | Status | QA Signoff |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **Phase 1** | **Backend Engine & IPC Protocol Stabilization** | `background.js` handlers for `EXTEND_SLEEP_TIMER`, `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, `END_OF_VIDEO`, alarm rescheduling, storage persistence, and runtime broadcasts. | Level 4 Backend Engineer | `node tests/test_sleep_backend_and_dashboard_hub.js` (Unit IPC) | `READY` | Pending |
| **Phase 2** | **Dashboard Markup & Cyber-Dark Bento Card UI** | `dashboard/dashboard.html` (`#cardSleepSentinelHub`) and `dashboard/dashboard.css` (SVG radial dial, presets, buttons, cyber-dark glass tokens). | Level 4 Frontend Engineer | `node tests/test_sleep_backend_and_dashboard_hub.js` (DOM/CSS) | `READY` | Pending |
| **Phase 3** | **Dashboard Hub Logic, SVG Dial & Bidirectional State Sync** | `dashboard/dashboard.js` (`initSleepSentinelHub`, ticker, dial animation, event bindings, storage listeners, navigation badge update). | Level 4 Frontend Engineer | `node tests/test_sleep_backend_and_dashboard_hub.js` (Sync/Math) | `READY` | Pending |
| **Phase 4** | **Full Verification, Comprehensive Test Battery & Git Governance** | `tests/test_sleep_backend_and_dashboard_hub.js`, full suite run (`node run_all_tests.js`), gitleaks audit, and autonomous micro-commit. | Level 4 QA Verification Tester | `node run_all_tests.js` (Exit 0) + `gitleaks detect` | `READY` | Pending |

---

## 🔒 4. Governance & Anti-Skip Protocols

1. **Mandatory Token Authorization:** Level 4 Sub Agents must verify an active `AUTH-MGR-*` token before mutating files.
2. **Zero Insecure innerHTML Assignment:** All DOM updates must strictly adhere to W3C Trusted Types and use `textContent`, `setAttribute`, or safe SVG DOM nodes.
3. **Sequential Phase Transition:** Each phase must pass its specific local verification battery with exit code 0 before transitioning to the subsequent phase.
4. **Independent QA Grade A+ Certification:** Final signoff requires 100% clean test results across all 68 test suites and zero gitleaks findings.
