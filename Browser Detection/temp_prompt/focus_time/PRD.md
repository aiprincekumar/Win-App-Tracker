# 📖 Focus Time & Focus Sentinel Subsystem: Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Initiative:** Focus Time & Focus Sentinel Subsystem End-to-End Implementation  
> **Container Directory:** [`temp_prompt/focus_time/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎯 1. Product Overview & Strategic Goals

The **Focus Time & Focus Sentinel Subsystem** provides intelligent, persistent flow-state management within the Web Activity & Media Sentinel extension. It bridges the gap between passive web browsing telemetry and active cognitive discipline. By combining customizable focus blocks (Pomodoro intervals), automated cross-tab media pausing, harmonic audio signaling, and daily focus analytics, users can eliminate digital distractions and track deliberate deep work across browser sessions.

### 1.1 Core Value Proposition
- **Guaranteed Continuity:** Focus sessions survive browser tab closure, page reload, and service worker hibernation via Manifest V3 alarm and storage synchronization.
- **Distraction Interruption:** Seamlessly pauses playing YouTube videos, Spotify streams, or background podcast tabs the instant a focus block initiates.
- **Unified Observability:** Instant visibility of active focus state across the Dashboard Hero Card, Sidebar HUD, Tab A Time Tracking Grid, and Extension Popup.

---

## 👥 2. User Personas & Pain Points

| Persona | Role & Work Context | Pain Point with Current System | Value Delivered by Focus Sentinel |
| :--- | :--- | :--- | :--- |
| **Alex (Deep Work Engineer)** | Writes complex systems software; uses multiple browser tabs for documentation, GitHub, and music. | Current Pomodoro timer dies whenever the dashboard tab closes. Forgets timers are running; media keeps playing and causes distractions. | Persistent background timer survives tab closure. Auto-pauses background media upon focus start. |
| **Priya (Research Scholar)** | Spends hours reading papers and writing literature reviews; prone to context switching. | No tracking of accumulated focus minutes. Cannot tell how much deep work was accomplished today versus casual browsing. | Tab A Focus Analytics card displays exact daily focus minutes and completed intervals. |
| **Sam (Digital Creator)** | Edits video scripts and manages social campaigns; needs flexible focus blocks. | Existing UI is rigid (fixed 25m interval); lacks quick presets or one-click extenders when in the zone. | Quick presets (15m, 25m, 45m, 60m) and instant +5m / +15m extenders allow flexible flow adjustments. |

---

## 📋 3. Functional Requirements (FR) & MoSCoW Prioritization

### 3.1 Requirements Matrix

| ID | Category | Requirement Description | Priority | Target Phase |
| :---: | :--- | :--- | :---: | :---: |
| **FR-01** | Visual UI | **Hero Focus Sentinel Bento Card in `#paneWellbeing`:** Replace `#widgetPomodoroSentinel` with a modern cyber-dark card featuring an SVG Radial Countdown Dial ($r=54$, $C=339.292$), big digital countdown readout (`#pomodoroTimeDisplay`), dynamic state badge (`#pomodoroModeBadge`), finish time estimate (`#pomodoroFinishTime`), and primary action controls (Start, Pause, Resume, Reset). | **Must Have** | **Phase 1** |
| **FR-02** | Visual UI | **Quick Duration Presets:** Four interactive preset pills (15m, 25m, 45m, 60m) allowing single-click interval selection in both idle and reset states with active visual highlights. | **Must Have** | **Phase 1** |
| **FR-03** | Visual UI | **Quick Extender Controls:** Two quick extender buttons (`+5m`, `+15m`) to add time on the fly during running or paused focus sessions without restarting the cycle. | **Must Have** | **Phase 1** |
| **FR-04** | Backend Logic | **Deterministic Finite State Machine (FSM):** Background engine managing states: `IDLE`, `RUNNING_FOCUS`, `PAUSED_FOCUS`, `RUNNING_BREAK`, `PAUSED_BREAK`, and `COMPLETED`. | **Must Have** | **Phase 2** |
| **FR-05** | Media Control | **Automated Cross-Tab Media Pausing:** When a focus session begins or is active, query all audible/playing media tabs via `chrome.tabs.query` and dispatch pause signals to prevent auditory distraction, governed by `#toggleFocusAutoPauseMedia`. | **Must Have** | **Phase 2** |
| **FR-06** | Audio / Alert | **Harmonic Synthetic Web Audio Chime:** Synthesize a gentle two-tone harmonic bell (528 Hz Solfeggio / 660 Hz Fifth) on cycle completion and break transitions, governed by `#toggleFocusChime`. | **Must Have** | **Phase 2** |
| **FR-07** | Analytics | **Dedicated Focus Analytics Card in Tab A:** Insert `#cardFocusAnalytics` into `#trackingMetricsGrid` in Tab A ([dashboard.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L284-L358)) showing Today's Focus Time and completed session count. | **Must Have** | **Phase 1 & 2** |
| **FR-08** | Popup UI | **Popup Mini-Timer Controller:** Embed `#cardPopupFocusTimer` inside `viewTrackingPane` in [popup.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html) with compact countdown, mode indicator, and Start/Pause/Reset actions. | **Must Have** | **Phase 1 & 2** |
| **FR-09** | Micro-HUD | **Sidebar HUD Micro-Widget Synchronization:** Ensure `#wellbeingLiveMicroWidget` in the dashboard sidebar continuously updates its digital clock and status dot with background state. | **Must Have** | **Phase 1 & 2** |
| **FR-10** | Persistence | **Storage & Daily Metrics Accumulation:** Persist timer state in `sentinel_focus_timer`, settings in `sentinel_focus_settings`, and accumulate daily completed focus seconds into `daily_focus_metrics`. | **Must Have** | **Phase 2** |

---

## 🔒 4. Non-Functional Requirements (NFR)

- **NFR-01: Performance & Responsive Latency:** UI interactions (preset click, start/pause/reset) must render within 50ms. Background memory footprint must remain under 5MB. Zero CPU spinning during idle states.
- **NFR-02: W3C Trusted Types & CSP Security:** Strictly zero assignments to `.innerHTML` or `.outerHTML`. All DOM modifications must use safe methods: `textContent`, `setAttribute`, `createElement`, and `appendChild`.
- **NFR-03: MV3 Service Worker Durability:** Timers must never rely on ephemeral background `setInterval`. All duration calculations must use epoch math (`targetTime = Date.now() + remainingSeconds * 1000`). Resumed or rehydrated sessions must calculate remaining time accurately without drift.
- **NFR-04: Battery & Resource Conservation:** Visual ticking (1s interval) only runs when a client view (Dashboard or Popup) is open and visible (`document.visibilityState === 'visible'`). The background service worker sleeps between alarms.
- **NFR-05: WCAG 2.1 AA Accessibility:** Color contrast ratios must meet or exceed 4.5:1 against the dark background. Time readouts must use `aria-live="polite"` to assist screen readers. Buttons must feature clear focus rings and keyboard triggerability (`Enter` / `Space`).
- **NFR-06: Strict Non-Interference Invariant:** All other dashboard tabs, Sleep Sentinel Hub, Doomscroll Breaker, Domain Budgets, Tracking Blacklist, and Audio Lab must remain 100% operational with zero behavioral or styling regression.

---

## 📚 5. INVEST-Compliant User Stories

### US-01: Starting a Focus Block with Presets
> **As a** developer seeking deep focus,  
> **I want to** select a 25-minute or 45-minute focus preset and click Start,  
> **so that** my timer begins counting down smoothly on a radial visual dial and my background YouTube music is paused automatically.

### US-02: Pausing and Resuming a Focus Session
> **As a** user interrupted by an urgent phone call,  
> **I want to** pause my active focus timer,  
> **so that** my remaining time is preserved and I can resume without losing my session progress when I return.

### US-03: Extending an In-Progress Session
> **As a** writer in the middle of a productive flow state,  
> **I want to** click "+5m" or "+15m" on the timer card,  
> **so that** my focus session is extended immediately without interrupting my work or resetting the dial.

### US-04: Automatic Break Transition & Chime Signaling
> **As a** student studying for exams,  
> **I want to** hear a gentle bell chime when my focus block ends and have the timer transition to a 5-minute break,  
> **so that** I know it is time to rest my eyes without constantly checking the clock.

### US-05: Tracking Daily Focus Output in Tab A
> **As a** knowledge worker reviewing my daily performance,  
> **I want to** see my total Focus Time and completed session count on Tab A's analytics metrics grid,  
> **so that** I can track my productivity trends alongside general browsing time.

### US-06: Quick Control from the Extension Popup
> **As a** user working in full-screen code editor,  
> **I want to** open the extension popup and glance at or control my focus timer,  
> **so that** I do not have to keep the heavy dashboard tab open at all times.

---

## 🧪 6. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Starting a Focus Session
- **Given** the Focus Sentinel is in the `IDLE` state with the 25m preset selected (remainingSeconds = 1500),
- **When** the user clicks `#btnStartFocus` (or `#btnStartPomodoro`),
- **Then** the state transitions to `RUNNING_FOCUS`,
- **And** `sentinel_focus_timer` is written to `chrome.storage.local` with `targetTime = Date.now() + 1500000`,
- **And** `chrome.alarms.create('sentinel_focus_timer_alarm', { when: targetTime })` is scheduled,
- **And** if `#toggleFocusAutoPauseMedia` is checked, all active media tabs are dispatched a `{ action: 'PAUSE' }` command,
- **And** the UI radial dial begins decrementing offset toward 0 and the Start button switches to Pause (`⏸️ Pause Focus`).

### Contract 2: Pausing an Active Focus Session
- **Given** the Focus Sentinel is in the `RUNNING_FOCUS` state with 840 seconds remaining,
- **When** the user clicks `#btnPauseFocus`,
- **Then** the state transitions to `PAUSED_FOCUS`,
- **And** `chrome.alarms.clear('sentinel_focus_timer_alarm')` is executed,
- **And** `sentinel_focus_timer` is updated with `state = 'PAUSED_FOCUS'`, `pausedAt = Date.now()`, and `remainingSeconds = 840`,
- **And** the UI dial ring turns amber, the badge displays `PAUSED`, and the button displays `▶️ Resume Focus`.

### Contract 3: Extending an Active Focus Session
- **Given** the Focus Sentinel is in the `RUNNING_FOCUS` state with 300 seconds remaining,
- **When** the user clicks `#btnFocusExtend5` (`+5m`),
- **Then** 300 seconds (5 minutes) are added, making `remainingSeconds = 600`,
- **And** `targetTime` is updated to `Date.now() + 600000`,
- **And** `sentinel_focus_timer_alarm` is rescheduled to the new `targetTime`,
- **And** the UI digital clock immediately reflects `10:00` and the dial recalibrates its stroke offset.

### Contract 4: Focus Block Expiration & Break Transition
- **Given** the Focus Sentinel is running with 1 second remaining,
- **When** the countdown reaches 0 or `sentinel_focus_timer_alarm` triggers,
- **Then** the backend logs the completed focus duration into `daily_focus_metrics`,
- **And** if `#toggleFocusChime` is enabled, the synthetic harmonic chime (528 Hz / 660 Hz) is played,
- **And** the state transitions to `RUNNING_BREAK` (or `IDLE_BREAK`),
- **And** `sentinel_focus_break_alarm` is scheduled for 5 minutes (300 seconds),
- **And** the UI radial dial turns cyan and the badge updates to `Break (5m)`.

### Contract 5: Tab Closure & Background Resilience
- **Given** a focus session is running with 20 minutes remaining,
- **When** the user closes the dashboard tab and leaves the browser running,
- **And** the user re-opens the dashboard 5 minutes later,
- **Then** `dashboard.js` hydrates from `chrome.storage.local.get('sentinel_focus_timer')`,
- **And** calculates remaining time as `Math.max(0, Math.round((targetTime - Date.now()) / 1000))`,
- **And** the radial dial and digital clock immediately display `15:00` with the running state badge.
