# 📋 Product Requirements Document (PRD): Sleep Timer Subsystem & Dashboard Hub

> **Document Type:** Product Requirements Document (PRD)  
> **Initiative:** Sleep Timer Subsystem Backend Engine & Dashboard Hub  
> **Container Directory:** [`temp_prompt/sleep_backend_and_dashboard_hub/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Product Department:** [`departments_archive/01_product_requirements_dept.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/departments_archive/01_product_requirements_dept.md)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 👥 1. Target User Personas

1. **Night Owl Streamer (Alex):**
   - Listens to podcasts, video essays, or ambient soundscapes on YouTube or Spotify in a desktop browser before going to sleep.
   - Pain Point: Falling asleep with media running all night drains laptop battery, disrupts sleep cycles with sudden ad volume spikes, and pollutes playback history.
   - Need: A reliable timer with a gradual 30-second volume fade that gently pauses playback and freezes tracking without cutting off abruptly.
2. **Focus & Health-Conscious Worker (Priya):**
   - Uses the Web Activity & Media Sentinel Dashboard during daily desk work to monitor active domains and digital wellness.
   - Pain Point: Wants to set a bedtime cutoff from the large dashboard display while organizing tasks in the evening without having to click the extension toolbar popup.
   - Need: A prominent, visually striking Sleep Sentinel Hub inside the Dashboard's Wellbeing section with clear radial progress, quick presets, and pause/extend controls.

---

## 🎯 2. MoSCoW Feature Prioritization

### Must Have (P0)
- **FR-01 (Backend Protocol):** Full IPC message handlers in `background.js` for `EXTEND_SLEEP_TIMER`, `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, and `END_OF_VIDEO`.
- **FR-02 (Alarm Integrity):** Accurate cancellation and rescheduling of `sentinel_sleep_timer_alarm` and `sentinel_sleep_fade_alarm` upon pause, resume, and extension.
- **FR-03 (Dashboard Hub UI):** Bento card `#cardSleepSentinelHub` in `#paneWellbeing` on `dashboard.html` with SVG radial dial, live countdown display, target finish time, status badge, preset buttons (15m, 30m, 45m, 60m, 90m, 120m), extenders (+5m, +15m), and Start/Pause/Resume/Reset controls.
- **FR-04 (Bidirectional Reactivity):** Seamless state synchronization between background, popup, and dashboard via `chrome.storage.local` and runtime messaging.
- **NFR-01 (Security & Trusted Types):** Zero insecure `innerHTML` assignments; full W3C Trusted Types compliance.
- **NFR-02 (Stability):** Zero regression across all existing 67 test suites; exit code 0 on test runner.

### Should Have (P1)
- **FR-05 (Feature Toggles):** Toggles in `#cardSleepSentinelHub` for "Audio Fade Out" (`#toggleDashSleepFade`) and "Stop at End of Video" (`#toggleDashSleepEndOfVideo`).
- **FR-06 (Visual State Badges):** Distinctive color-coded badges matching timer states: `IDLE` (slate/dim), `RUNNING` (cyan/green pulse), `PAUSED` (amber), `FADING` (purple), `TRIGGERED` (red).
- **FR-07 (Smooth Micro-Interactions):** Hardware-accelerated CSS transitions for SVG dial progress stroke and button interactions.

### Could Have (P2)
- **FR-08 (Custom Minute Stepper):** Custom numeric minute input for precise minute intervals outside standard presets.
- **FR-09 (Audio Cue on Expiration):** Optional soft chime sound played when timer expires and media pauses.

### Won't Have (P3 - Out of Scope)
- OS-level system shutdown or sleep initiation (handled exclusively by companion native Windows daemon `AntiGravity Auto Shutdown`).
- Machine learning bedtime prediction.

---

## 📝 3. INVEST-Compliant User Stories

### User Story 1: Backend IPC Lifecycle Support
- **As a** user controlling sleep timers from any UI surface,
- **I want** the background service worker to process pause, resume, and extend commands,
- **So that** my sleep timer alarms are accurately adjusted without time drift or premature cutoffs.
- **INVEST Checklist:**
  - *Independent:* Can be implemented and tested via unit IPC tests independently of UI markup.
  - *Negotiable:* Message schema is standardized with clear payload fields.
  - *Valuable:* Fixes core alarm desynchronization defect.
  - *Estimable:* Discrete functional logic in `background.js`.
  - *Small:* Scoped to 4 message handlers and state helper functions.
  - *Testable:* Verifiable via mocked `chrome.runtime.sendMessage` and `chrome.alarms` in Node.js test environment.

### User Story 2: Dashboard Wellbeing Sleep Sentinel Hub
- **As a** dashboard user viewing `#paneWellbeing`,
- **I want** a dedicated Sleep Sentinel Hub card with a large radial dial and quick duration presets,
- **So that** I can configure and monitor my bedtime playback timer directly from the main dashboard.
- **INVEST Checklist:**
  - *Independent:* Markup and CSS can be authored and reviewed as a discrete UI unit.
  - *Negotiable:* Bento card layout aligns with existing design tokens.
  - *Valuable:* Provides full feature accessibility on the primary dashboard screen.
  - *Estimable:* Clear DOM structure and CSS rules.
  - *Small:* Contained within `dashboard.html` and `dashboard.css`.
  - *Testable:* Verifiable via DOM presence assertions and CSS rule inspections.

### User Story 3: Real-time Multi-Surface Synchronization
- **As a** user who might open both the dashboard and the popup,
- **I want** any change made on one surface (e.g. clicking +15m or Pause) to instantly reflect on the other,
- **So that** my timer countdown and status are always coherent and unified.
- **INVEST Checklist:**
  - *Independent:* Relies on shared storage contracts and event listeners.
  - *Negotiable:* Storage keys are established (`sentinel_sleep_timer`).
  - *Valuable:* Prevents conflicting states and user confusion.
  - *Estimable:* Standard `storage.onChanged` pattern.
  - *Small:* Implementation in `dashboard.js` with verification against existing `popup.js`.
  - *Testable:* Verifiable by triggering storage change events and asserting DOM updates.

---

## 🔍 4. Rigorous Given-When-Then Acceptance Criteria Contracts

### Contract 1: Timer Extension (`EXTEND_SLEEP_TIMER`)
- **Given** an active sleep timer in state `RUNNING` with `targetTime = T0` and duration $D = 30\text{m}$,
- **When** the user sends an `EXTEND_SLEEP_TIMER` message with `{ extraMinutes: 15 }`,
- **Then** the background engine must:
  1. Increment `durationMinutes` by 15 (new duration $45\text{m}$).
  2. Increase `targetTime` by $15 \times 60 \times 1000\text{ ms}$.
  3. Reschedule `sentinel_sleep_timer_alarm` with `when: newTargetTime`.
  4. Reschedule `sentinel_sleep_fade_alarm` if fade is enabled.
  5. Update `sentinel_sleep_timer` in `chrome.storage.local`.
  6. Return `{ success: true, state: updatedState }`.

### Contract 2: Timer Pause (`PAUSE_SLEEP_TIMER`)
- **Given** an active sleep timer in state `RUNNING` with 12 minutes remaining,
- **When** the user sends a `PAUSE_SLEEP_TIMER` message,
- **Then** the background engine must:
  1. Transition `state` to `'PAUSED'`.
  2. Compute and store `remainingMs = targetTime - Date.now()`.
  3. Set `pausedAt = Date.now()`.
  4. Cancel `sentinel_sleep_timer_alarm` and `sentinel_sleep_fade_alarm` via `chrome.alarms.clear`.
  5. Persist state to `chrome.storage.local`.
  6. Broadcast state change message to open views.

### Contract 3: Timer Resume (`RESUME_SLEEP_TIMER`)
- **Given** a paused sleep timer in state `PAUSED` with stored `remainingMs = 720000` (12 minutes),
- **When** the user sends a `RESUME_SLEEP_TIMER` message,
- **Then** the background engine must:
  1. Transition `state` to `'RUNNING'`.
  2. Recalculate `targetTime = Date.now() + remainingMs`.
  3. Clear `pausedAt` and `remainingMs` fields.
  4. Create `sentinel_sleep_timer_alarm` with `when: newTargetTime`.
  5. If fade is enabled and `remainingMs > fadeMs`, create `sentinel_sleep_fade_alarm` with `when: newTargetTime - fadeMs`.
  6. Persist state to `chrome.storage.local` and broadcast state.

### Contract 4: Dashboard Dial Math & Rendering
- **Given** a total timer duration of $30\text{ minutes}$ ($1,800,000\text{ ms}$) and remaining time of $15\text{ minutes}$ ($900,000\text{ ms}$),
- **When** `updateDashSleepDial(remainingMs, totalMs)` executes,
- **Then** the SVG progress circle with circumference $C = 339.292$ must calculate:
  $$\text{ratio} = \frac{900,000}{1,800,000} = 0.5$$
  $$\text{offset} = 339.292 \times (1 - 0.5) = 169.65$$
  and set `strokeDashoffset` to `"169.65"`, updating `#dashSleepCountdownDisplay` to `"15:00"`.
