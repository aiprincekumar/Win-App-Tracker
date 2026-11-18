# 🧘 Focus Time & Focus Sentinel Subsystem: Master Index & Phase Tracking Board

> **Document Type:** Master Index, Problem-Solution Dossier & Phase Tracking Board  
> **Container Directory:** [\	emp_prompt/focus_time/\](.)  
> **Initiative:** Focus Time & Focus Sentinel Subsystem End-to-End Implementation  
> **Governing Architecture:** [\PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md\](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (\prompt_generation_specialist\)  
> **Target Execution Strategy:** Strategy B — Single User Consultation (Recommended) / Strategy C — Phase-by-Phase Consultation (Autonomy Score: 0.8 / 0.5)  
> **Decision Gate Requirement:** PROMPT_FILES_REQUIRED = YES (Compound multi-module architecture: MV3 background alarms, runtime IPC, storage persistence, dashboard HTML/CSS/JS, popup mini-timer, and QA test battery)

---

## 📋 1. Problem-Solution Dossier

### 1.1 Context & Background
The **Web Activity & Media Sentinel** Chrome extension (MV3) provides rich telemetry for browser tab activity, audio/video playback, and digital wellbeing. Within the Dashboard\'s **Focus & Digital Wellbeing Hub** ([dashboard.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L1188-L1215)), there is an element marked #widgetPomodoroSentinel intended to offer focus sessions and pomodoro intervals. Furthermore, the sidebar features a micro-HUD (#wellbeingLiveMicroWidget), the popup offers digital wellbeing tools ([popup.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L525-L572)), and Tab A provides Time Tracking Analytics ([dashboard.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L280-L360)).

### 1.2 Root Cause Analysis & Technical Gaps
1. **Volatile Client-Side Only Interval:**
   - In [dashboard.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L3964-L4045), initPomodoroWidget() instantiates an in-memory createPomodoroController() powered by a local setInterval.
   - As soon as the dashboard tab is closed, refreshed, or backgrounded, the timer dies immediately.
2. **Zero Backend State Machine & MV3 Alarms in [background.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):**
   - ackground.js has zero alarm handlers, zero storage schemas (sentinel_focus_timer, sentinel_focus_settings, daily_focus_metrics), and zero runtime message handlers for starting, pausing, resuming, or resetting Focus Time.
   - When the service worker sleeps, any focus timer state is completely lost.
3. **Absence of Cross-Tab Media Pausing:**
   - Although utoPauseMedia: true is an option in the UI, it never invokes any background media controls or chrome.tabs messaging to pause playing videos or music during focus sessions.
4. **Missing Focus Metrics & Statistics Accumulation:**
   - Completed focus sessions are never recorded or aggregated into daily statistics. Tab A (Time Tracking Analytics) lacks a dedicated Focus Time metric card showing today\'s accumulated focus minutes and completed intervals.
5. **Missing Popup Controller:**
   - In [popup.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html), there is no Focus Time controller or mini-timer in iewTrackingPane or iewToolsPane. Users cannot start, pause, or view focus countdowns from the popup.
6. **Primitive Visual Presentation:**
   - While the neighboring #cardSleepSentinelHub boasts an elegant SVG radial countdown dial (=54$, =339.292$), preset pills, and quick extenders, #widgetPomodoroSentinel has a plain rectangular progress bar and minimal controls.

### 1.3 Solution Architecture & End-State Deliverables
1. **Two-Phase Architecture Separation:**
   - **Phase 1 (UI/UX Architecture & Layout):** Design, structure, and verify the complete visual presentation across all surfaces (Dashboard Hero Card with SVG radial dial, Tab A metric card, Popup mini-timer, Sidebar HUD) before touching backend execution.
   - **Phase 2 (Backend Logic, Alarms & Persistence):** Build the robust MV3 background state machine, alarm scheduling, IPC handlers, cross-tab media pause, synthetic Web Audio chime, daily metrics persistence, and QA test suite.
2. **Strict Scope Boundary Invariant:**
   - Only Focus Time and its directly related functions/features are modified. Existing neighboring features (Sleep Sentinel Hub, Doomscroll Breaker, Domain Budgets, Tracking Blacklist, Media Deck, Audio Lab) remain 100% untouched and functional.

---

## 🚦 2. Mandatory Prompt Requirement Assessment

### 2.1 Explicit Determination
`yaml
PROMPT_FILES_REQUIRED: YES
INITIATIVE_TYPE: Compound Full-Stack Subsystem Implementation
PHASE_COUNT: 2
ESTIMATED_AUTONOMY_SCORE: 0.80 (Strategy B) / 0.50 (Strategy C)
`

### 2.2 Rigorous Architectural Justification
1. **Multi-Surface Coordination:** The Focus Time subsystem spans three distinct execution contexts: MV3 background service worker, dashboard single-page application (multiple tabs and sidebars), and extension browser action popup.
2. **Asynchronous Lifecycle & Epoch Math:** MV3 service workers terminate after 30 seconds of inactivity. Timer persistence mandates persistent epoch timestamp math (	argetTime = Date.now() + remainingMs), chrome.alarms wakeups, and storage hydration on wake.
3. **Cross-Tab Media Interactivity:** Requires background coordination to query playing audio/video tabs and dispatch pause signals without race conditions or memory leaks.
4. **User-Requested Phase Separation:** The user explicitly mandated reviewing and organizing the complete UI/UX functional feature layout first (Phase 1), followed by its complete backend logic implementation (Phase 2). This requires rigorous phase prompt isolation and execution boundaries.

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | Target File | Root Cause & Current Gap | Proposed Surgical Fix | Post-Fix System Impact | Phase # | Test Verification Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **01** | [dashboard/dashboard.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L1192-L1215) | Primitive #widgetPomodoroSentinel markup; missing SVG radial countdown dial (=54$, =339.292$), presets (15m, 25m, 45m, 60m), extenders (+5m, +15m), and Tab A focus metric card. | Replace hero markup with full Focus Sentinel Hero Card; add #cardFocusAnalytics to #trackingMetricsGrid in Tab A; verify sidebar #wellbeingLiveMicroWidget. | Modern cyber-dark glassmorphism UI with rich dial countdown and daily analytics visibility. | **Phase 1** | 
ode tests/test_focus_time_subsystem.js (Battery 1: DOM Structure) |
| **02** | [dashboard/styles/wellbeing_blacklist.css](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css) | Missing styling for Focus Sentinel SVG dial, dynamic mode glows (Emerald for Focus, Cyan for Break, Amber for Paused), preset pills, and extenders. | Author comprehensive cyber-dark glassmorphism styles, animated radial progress stroke, responsive layout, and contrast tokens. | Flawless visual hierarchy aligned with extension design system and WCAG 2.1 AA standards. | **Phase 1** | 
ode tests/test_focus_time_subsystem.js (Battery 2: CSS Integrity) |
| **03** | [dashboard/dashboard.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L3964-L4045) | Local in-memory pomodoroController interval; lacks SVG dial offset math, preset/extender handlers, and bidirectional storage sync. | Add initFocusSentinelHero(), radial dial math (offset = C * (1 - ratio)), preset/extender handlers, and bidirectional storage listeners. | Real-time interactive UI that mirrors background timer state with zero lag. | **Phase 1 & 2** | 
ode tests/test_focus_time_subsystem.js (Battery 3: Dial Math & Events) |
| **04** | [popup/popup.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L525-L572) | iewTrackingPane lacks compact Focus Time controller; users cannot view or trigger focus blocks from the popup. | Insert #cardPopupFocusTimer under #cardFocusWellness with compact time display, mode badge, and quick Start/Pause/Reset actions. | Popup users can control focus intervals without opening the full dashboard. | **Phase 1** | 
ode tests/test_focus_time_subsystem.js (Battery 4: Popup DOM) |
| **05** | [popup/popup.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) | No event handlers or sync logic for popup focus timer card. | Add initPopupFocusTimer() with IPC dispatching and chrome.storage.onChanged listener. | Instant bidirectional synchronization between popup, dashboard, and background. | **Phase 1 & 2** | 
ode tests/test_focus_time_subsystem.js (Battery 5: Popup Controller) |
| **06** | [ackground.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) | Zero Focus Time backend state machine, alarms, IPC handlers, media pause, or metrics accumulation. | Implement FocusTimerEngine with MV3 alarms (sentinel_focus_timer_alarm), IPC handlers (START_FOCUS_TIMER, etc.), media pause relay, and daily_focus_metrics accumulation. | Rock-solid background timer persistence across tab closure and service worker sleep. | **Phase 2** | 
ode tests/test_focus_time_subsystem.js (Batteries 6-8: FSM, Alarms, IPC) |
| **07** | [	ests/test_focus_time_subsystem.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_focus_time_subsystem.js) | No test suite verifying Focus Time FSM, IPC contracts, alarms, radial dial math, and DOM integrity. | Create comprehensive 8-battery integration test suite executing via Node.js ssert and m. | Deterministic regression protection and automated Grade A+ verification. | **Phase 2** | 
ode tests/test_focus_time_subsystem.js (100% Pass, exit code 0) |

---

## 📅 4. Comprehensive Phase Status Checklist

| Phase | Milestone Name | Primary Scope & Deliverables | Assigned Agent | Status | QA Signoff Gate |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **Phase 1** | UI/UX Architecture & Layout Specifications | Complete visual layout across Dashboard (#paneWellbeing, Tab A, Sidebar HUD) and Popup, SVG radial countdown dial (=54$), presets, extenders, cyber-dark CSS, and frontend event wiring. | Level 4 Frontend Engineer | ⏳ PENDING APPROVAL | 
ode tests/test_syntax_and_manifest_integrity.js + Phase 1 DOM/CSS verification |
| **Phase 2** | Complete Backend Logic, State Machine & Persistence | MV3 background alarms, persistent storage (sentinel_focus_timer, sentinel_focus_settings, daily_focus_metrics), IPC routing, cross-tab media pausing, synthetic Web Audio chime, and 8-battery test suite. | Level 4 Backend & QA Engineer | 🔒 LOCKED (Awaiting Phase 1) | 
ode tests/test_focus_time_subsystem.js (100% Pass, exit code 0) |

---

## 🧭 5. Execution Strategy Evaluation

### 5.1 Strategy Evaluation Matrix
- **Strategy A: Fully Autonomous Execution (Autonomy Score: 1.0):**
  - Runs Phase 1 followed immediately by Phase 2 without user pause.
  - *Risk:* Does not afford the user the explicit opportunity to inspect the UI/UX layout before backend code is written.
- **Strategy B: Single User Consultation (Recommended — Autonomy Score: 0.8):**
  - Level 2 Manager presents the complete Phase-Wise Prompt plan (Phase 1 UI/UX + Phase 2 Backend Logic) to the user upfront via Level 1 CEO (sk_question).
  - Upon user confirmation of the architectural plan and layout specifications, Level 4 Subagents execute Phase 1 and Phase 2 autonomously with deterministic verification gates.
- **Strategy C: Phase-by-Phase Consultation (Autonomy Score: 0.5):**
  - Level 2 Manager dispatches Phase 1 Subagent -> User inspects Phase 1 UI/UX deliverables -> User approves -> Manager dispatches Phase 2 Subagent -> User inspects Phase 2 deliverables.
  - Aligns with the user\'s stated desire to review the UI/UX layout first before authorizing backend implementation.

### 5.2 Recommendation
**Strategy B (with seamless transition to Strategy C upon user request):** Present the complete two-phase architectural blueprint to the user now. If the user desires an explicit interactive gate between Phase 1 and Phase 2, the Manager will hold execution after Phase 1 and present the verified UI/UX layout for signoff before issuing AUTH-MGR-PHASE-2.
