# Product Requirements Document (PRD): Passive Mouse Movement Tracking

> **Task Container:** `temp_prompt/passive_mouse_movement_tracking/`  
> **Document Type:** Product Requirements Document (PRD)  
> **Lead Product Department:** Dept 01 Product Requirements (`departments_archive/01_product_requirements_dept.md`)  
> **Governing Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎯 1. Executive Summary & Objective

The objective of this initiative is to enhance in-page user activity detection in `content_media.js` by introducing passive pointer/mouse movement tracking. Modeled after the industry-standard VueUse `useIdle` pattern, this enhancement ensures reading time and hover interactions are accurately attributed as active time while strictly preventing main-thread performance degradation and memory leaks.

---

## 👥 2. User Personas & Problem Scenarios

### Persona: Deep-Focus Reader / Knowledge Worker
- **Behavior:** Spends 10–20 minutes reading lengthy technical articles, documentation, or legal briefs, frequently moving the cursor under text or highlighting without clicking or scrolling.
- **Pain Point:** Previous tracking logic only listened to `pointerdown`, `keydown`, and `wheel`. Because no click or keypress occurred, the extension assumed the user was away and paused active time tracking.
- **Expected Outcome:** Subtle cursor movements maintain active reading state seamlessly without battery drain or browser lag.

---

## 📝 3. User Stories (INVEST Model)

1. **US-01 (Passive Cursor Tracking):**  
   *As a* user browsing or reading on a webpage,  
   *I want* my mouse cursor movements to count towards active browsing,  
   *So that* my active work time is not falsely dropped as idle.

2. **US-02 (Lag-Free Performance):**  
   *As a* user with a high-refresh rate mouse (1000Hz+),  
   *I want* mouse movement tracking to be passively throttled,  
   *So that* my browsing experience and 60/120fps animations remain completely smooth without input delay.

3. **US-03 (Clean Lifecycle Teardown):**  
   *As an* extension runtime,  
   *I want* all window event listeners detached when the extension reloads or the page unloads,  
   *So that* no memory leaks or orphaned event handlers remain active.

---

## 🎯 4. MoSCoW Feature Prioritization

| Priority | Requirement Code | Feature Scope | Description |
| :--- | :--- | :--- | :--- |
| **Must Have** | FR-01 | Passive Pointer Events | Register `pointermove` (and `mousemove` fallback) with `{ passive: true, capture: true }`. |
| **Must Have** | FR-02 | Micro-Throttle (500ms) | Throttle in-memory timestamp updates to avoid per-pixel event loop overhead. |
| **Must Have** | FR-03 | IPC Rate Limiter (10s) | Retain strict 10-second cooldown on sending `PAGE_USER_INTERACTION` to background. |
| **Must Have** | FR-04 | Lifecycle Teardown | Track and cleanly remove all activity listeners in `teardownMediaSentinel()`. |
| **Should Have** | NFR-01 | Web Vitals Zero-Impact | Handler execution time must stay under 0.05ms per tick with zero layout thrashing. |
| **Could Have** | FR-05 | Touch Support | Include `touchstart` and `touchmove` for hybrid touchscreen laptops. |
| **Won't Have** | OUT-01 | Coordinate Telemetry | Do NOT transmit raw (x, y) coordinates to background (privacy preserving). |

---

## ✅ 5. Given-When-Then Acceptance Criteria

### Scenario 1: Mouse Movement Updates Active State
- **Given** an active webpage with `content_media.js` injected.
- **When** the user moves the mouse across the page after being idle for > 10 seconds.
- **Then** `lastActivityTimestamp` is refreshed to current time.
- **And** a `PAGE_USER_INTERACTION` message is dispatched to the background service worker.

### Scenario 2: High-Frequency Burst Suppression (Micro-Throttle)
- **Given** a user moving the mouse continuously at 500 events per second.
- **When** 100 pointer events fire within a 200ms window.
- **Then** the micro-throttle returns early without recalculating or allocating memory.
- **And** exactly one IPC message is permitted within the 10-second rate-limiting window.

### Scenario 3: Clean Teardown on Invalidation
- **Given** active window listeners registered for user activity.
- **When** `teardownMediaSentinel()` is invoked (e.g. extension context invalidated).
- **Then** `removeEventListener` is called for every registered event type (`pointerdown`, `pointermove`, `keydown`, `wheel`, `touchstart`).
- **And** no dangling listener references remain in memory.
