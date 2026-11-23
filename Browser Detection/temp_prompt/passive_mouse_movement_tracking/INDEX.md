# Passive Mouse Movement Tracking in content_media.js - Tracking Index & Diagnostic Dossier

> **Task Container:** `temp_prompt/passive_mouse_movement_tracking/`  
> **Task ID:** `TASK-PASSIVE-MOUSE-TRACKING-001`  
> **Governance:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystem:** In-Page HTML5 Media Sentinel & User Activity Detector (`content_media.js`)  
> **Architecture Reference:** Context7 / VueUse `useIdle` Reactive Activity Pattern  
> **Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Prompt Requirement:** `PROMPT_FILES_REQUIRED = YES`  

---

## 📋 1. Executive Problem & Solution Summary

### Problem Dossier
In `content_media.js`, active user interaction detection was previously limited to `['pointerdown', 'keydown', 'wheel']`:
1. **False Inactivity During Reading & Navigation:**  
   Users frequently engage in active reading, hovering over dropdowns, and scanning articles where mouse movement occurs without clicking, pressing keys, or scrolling. Because `mousemove` and `pointermove` were excluded, these users were erroneously marked idle, jeopardizing active session accuracy.
2. **High-Frequency Pointer Event Overhead:**  
   Unbounded mouse move listeners can fire 60–1000 times per second on high-refresh gaming mice. A naive listener would flood the JavaScript call stack, cause main-thread jank, degrade frame rates (violating INP Web Vitals), and trigger redundant IPC message storms.
3. **Missing Teardown & Event Listener Memory Leaks:**  
   In `content_media.js`, `setupUserActivityListeners` added anonymous event listeners to `window` with no mechanism for `removeEventListener` inside `teardownMediaSentinel()`. Over multiple iframe reloads or extension updates, dangling listeners lead to DOM memory leaks.

### Architectural Solution (VueUse `useIdle` / Context7 Pattern)
1. **Passive Pointer Tracking (`pointermove` / `mousemove`):**  
   Register passive, capturing event listeners (`{ passive: true, capture: true }`) across `pointerdown`, `pointermove`, `keydown`, `wheel`, and `touchstart`.
2. **Micro-Throttled Activity Timestamp & IPC Rate Limiting:**  
   Implement a lightweight throttle (500ms gate) for in-memory timestamp updates, coupled with a strict 10,000ms (10s) rate limit on `PAGE_USER_INTERACTION` background IPC broadcasts.
3. **Deterministic Lifecycle Teardown:**  
   Store registered listeners in an unregistration array/map and cleanly detach all listeners when `teardownMediaSentinel()` executes.

---

## 📊 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `content_media.js` | Missing `pointermove`/`mousemove` in `setupUserActivityListeners` causes active reading without clicks to be classified as idle. | Add throttled passive pointer tracking based on VueUse `useIdle` pattern. | Active cursor movement accurately refreshes active status with zero main-thread jank. | Phase 1 | `node tests/test_passive_mouse_movement_activity.js` |
| 2 | `content_media.js` | `setupUserActivityListeners` uses anonymous callbacks that cannot be removed in `teardownMediaSentinel()`. | Store listener references and unregister all window event listeners upon context invalidation. | Eliminates memory leaks upon tab teardown, iframe unload, or extension reload. | Phase 2 | `node tests/test_passive_mouse_movement_activity.js` |
| 3 | `tests/test_passive_mouse_movement_activity.js` | Lack of standalone automated test battery verifying pointer tracking, throttling, and clean unregistration. | Author 5-battery test suite testing passive flags, throttle gating, IPC cadence, and teardown. | 100% test coverage and regression protection. | Phase 3 | `node run_all_tests.js` |

---

## 🚦 3. Phase Status Checklist

- [ ] **Phase 01: Throttled Passive Mouse Movement Tracking Implementation**
  - *Target:* `content_media.js`
  - *Agent:* Level 4 Frontend / Systems Subagent
  - *QA Signoff:* Pending
- [ ] **Phase 02: Lifecycle Teardown & Memory Leak Protection**
  - *Target:* `content_media.js`
  - *Agent:* Level 4 Frontend / Systems Subagent
  - *QA Signoff:* Pending
- [ ] **Phase 03: Standalone Testing & Master Regression Verification**
  - *Target:* `tests/test_passive_mouse_movement_activity.js`, `run_all_tests.js`
  - *Agent:* Level 4 QA Verification Subagent
  - *QA Signoff:* Pending

---

## 🛡️ 4. Architectural Boundaries & Guardrails
- **Zero InnerHTML:** Adhere strictly to W3C Trusted Types zero-innerHTML policy.
- **Rule 28 Compliance:** Functions strictly <= 50 lines; cyclomatic nesting depth <= 3.
- **Encoding Standard:** All files saved in 100% UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
