# End-to-End Headed Interactive Verification: Focus Timing & Sleep Timer — Tracking Board & Dossier

> **Task ID:** `TASK-E2E-HEADED-VERIFY-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect / Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/e2e_headed_focus_sleep_verification/INDEX.md`  
> **Status:** `ACTIVE / PROMPTS_GENERATED`  
> **Implementation Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Prompt Requirement:** `PROMPT_FILES_REQUIRED = YES`  
> **Execution Environment:** Windows Desktop — Google Chrome HEADED Mode (Visible GUI Window)

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Challenge
The Web Activity & Media Sentinel extension possesses complex asynchronous subsystems for digital wellness and sleep management:
1. **Focus Sentinel & Pomodoro Subsystem:**
   - Background state machine (`IDLE` -> `RUNNING_FOCUS` -> `PAUSED_FOCUS` -> `RUNNING_BREAK` -> `COMPLETED`).
   - Radial SVG countdown dial (`#dashFocusDialProgress`, circumference 339.292).
   - Bi-directional sync across Dashboard (`dashboard/dashboard.html`) and Popup (`popup/popup.html`).
2. **Sleep Timer & Inactivity Subsystem:**
   - Background state machine (`IDLE` -> `RUNNING` -> `PAUSED` -> `FADING` -> `TRIGGERED` -> `CANCELLED`).
   - Minimum allowable boundary enforcement (1 minute / 60 seconds).
   - Real-time Chrome Action badge countdown, 30s audio fade-out trigger, and automated tab/media cutoff.

The developer requires **end-to-end interactive verification in HEADED mode visible on screen**, testing both Focus Timing and Sleep Timer at their minimum allowable durations (1 minute / 60 seconds) to visually and programmatic certify real-time clock rendering, IPC message dispatch, audio fade/pause hooks, and state machine consistency.

### 1.2 The Surgical Solution
1. **Headed Automation Harness (Playwright Chromium / Native Chrome):**
   - Launch Google Chrome with `--load-extension` in non-headless GUI mode visible to the user.
   - Establish live page contexts for both the Extension Dashboard and the Extension Popup.
2. **Focus Timing Minimum Duration Verification (1 Minute / 60s):**
   - Initiate a 1-minute focus block via Dashboard and Popup.
   - Assert real-time decrement of `#pomodoroTimeDisplay` and `#popupFocusClock`.
   - Verify SVG dial stroke-dashoffset transition, state changes, pause/resume, and completion cycle.
3. **Sleep Timer Minimum Duration Verification (1 Minute / 60s):**
   - Initiate a 1-minute sleep timer via custom input (`#customTimerInput`) or IPC.
   - Assert countdown in `#dashSleepCountdownDisplay` and `#countdownTimeRemaining`.
   - Verify Action badge countdown, 30s fade alert, and trigger action handling.
4. **Independent QA Grade A+ Certification:**
   - Execute full regression suite (`node run_all_tests.js`).
   - Validate terminal proof, zero console errors, UTF-8 with BOM compliance, and clean teardown.

---

## 🚦 2. Phase Status Checklist & Execution Tracking

| Phase # | Phase Name | Target Scope | Lead Level 4 Subagent | Test Gate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | Headed Chrome Harness & Extension Loading | Launch visible Chrome instance with unpacked extension loaded; verify extension ID & background SW | Level 4 Automation Engineer | Extension ID resolved & pages rendered | `READY` |
| **Phase 02** | Interactive Focus Timing Verification (1m) | Trigger 1m focus block; verify real-time countdown, dial progress, pause/resume, and reset/completion | Level 4 Frontend/QA Subagent | Visual countdown & state assert exit 0 | `READY` |
| **Phase 03** | Interactive Sleep Timer Verification (1m) | Trigger 1m sleep timer; verify real-time countdown, radial dial, badge text, fade hook, and trigger | Level 4 Frontend/QA Subagent | Visual countdown & FSM assert exit 0 | `READY` |
| **Phase 04** | Master Regression & Grade A+ QA Certification | Run master test runner `node run_all_tests.js`, inspect logs, verify BOM & Trusted Types | Level 4 Independent QA Tester | 100% Pass (83+/83+ suites, exit code 0) | `READY` |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `tests/harness_headed_e2e.js` | Lack of standalone headed Playwright/Puppeteer launcher script for live interactive desktop verification | Create reusable headed runner script loading `Browser Detection` extension | Enables live visual interactive testing in headed Chrome visible to developer | Phase 1 | Headed window launches and loads dashboard |
| 2 | `dashboard/dashboard.html` / `dashboard.js` | Need deterministic verification of minimum 1m Focus timer UI & dial animation | Navigate to `#tabContentWellbeing`, trigger 1m focus timer, assert live clock tick | Proves real-time SVG radial dial & clock ticks in live browser | Phase 2 | Focus countdown decrements visibly |
| 3 | `popup/popup.html` / `popup.js` | Need verification of Focus sync in Popup view | Inspect `#cardPopupFocusTimer`, `#popupFocusClock`, and `#btnPopupFocusToggle` | Proves bidirectional state sync across extension views | Phase 2 | Popup clock matches dashboard clock |
| 4 | `dashboard/dashboard.html` / `dashboard.js` | Need deterministic verification of 1m Sleep Timer in `#cardSleepSentinelHub` | Set 1m duration, trigger RUNNING state, verify radial dial and finish time | Proves Sleep Sentinel Hub responds accurately to minimum duration | Phase 3 | Sleep countdown ticks visibly from 01:00 |
| 5 | `popup/popup.html` / `popup.js` | Need verification of Sleep Timer Popover & Action badge | Inspect `#customTimerInput` min=1, `#countdownTimeRemaining`, and badge text | Proves popover custom timer sets 1m and updates badge countdown | Phase 3 | Popover and badge countdown validated |
| 6 | `background.js` | Verify FSM transition to FADING/TRIGGERED at minimum allowable boundary | Allow 1m timer to expire or transition through FADING | Proves service worker alarms, audio fade-out, and auto-pause execute safely | Phase 3 | Alarms trigger and state transitions clean |
| 7 | `run_all_tests.js` | Master regression verification | Execute all 83+ test suites across repository | 100% clean test execution certifying zero regression | Phase 4 | `node run_all_tests.js` exit code 0 |

---

## 🔒 4. Governance & Anti-Skip Compliance

- **Anti-Skip Pillar A (Grill-Me Gate):** User explicitly declared requirements: HEADED mode, Focus Timing & Sleep Timer at minimum allowable duration. Zero unaddressed ambiguity.
- **Anti-Skip Pillar B (Skill Manager Audit Gate):** Skills allocated (`e2e-testing`, `browser-qa`, `chrome-devtools`).
- **Anti-Skip Pillar C (Phased Architecture Gate):** 4 self-contained phase prompts generated in `temp_prompt/e2e_headed_focus_sleep_verification/`.
- **Anti-Skip Pillar D (Independent QA Verification Gate):** Mandatory Grade A+ independent QA signoff with exit code 0 and raw terminal proof.
