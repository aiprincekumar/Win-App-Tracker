# Phase 2 Execution Prompt
## `tests/test_media_controls_and_fullscreen_fix.js` Overhaul

> **Phase:** 2 of 3  
> **Target File:** [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)  
> **Assigned Role:** Level 4 QA Test Engineer  
> **Prerequisites:** Phase 1 Complete, `AUTH-MGR-*` Token Active  
> **Local Gate Command:** `node tests/test_media_controls_and_fullscreen_fix.js`  

---

## 🎯 1. Phase Objective

Overhaul `tests/test_media_controls_and_fullscreen_fix.js` to eliminate outdated fallback-only assertions, implement AST/code structure checks for unconditional `sendMediaControl` and top-frame `executeScript`, verify overlay button linkage and global toggle isolation, and build a full runtime functional mock test suite.

---

## 📍 2. Specific Modifications

### 2.1 Refactor Test 4: Bloat Removal & Fullscreen Invariants
- Remove outdated assertion requiring `allFrames: true`.
- Remove assertion requiring `sendMediaControl` to only occur in fallback `.catch / else`.
- Add assertion verifying `sendMediaControl('toggle_fullscreen')` is dispatched unconditionally.
- Add assertion verifying `executeScript` uses `{ tabId: targetTabId }` without `allFrames: true`.
- Retain verification that manual DOM class manipulation bloat remains absent.

### 2.2 Refactor Test 6: In-Popup Media Controls Wiring & Unconditional Dispatch
- Verify that every control button (`#btnCtrlTogglePlay`, `#btnCtrlRewind`, `#btnCtrlForward`, `#btnCtrlToggleMute`, `#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`, `#btnCtrlFullscreen`) invokes `sendMediaControl` unconditionally.
- Verify `executeScript` calls omit `allFrames: true`.

### 2.3 Introduce Test 9: Runtime Simulated Functional Mock Test
- Create simulated environment with mock DOM buttons and mock `browserAPI` (`runtime.sendMessage`, `scripting.executeScript`).
- Execute each button handler.
- Verify that clicking each button triggers:
  1. Synchronous optimistic state & cooldown timestamps.
  2. Unconditional `sendMediaControl` call with exact expected parameters.
  3. Top-frame `executeScript` call with `{ tabId: targetTabId }`.

---

## 🏁 3. Verification Gate & Deliverables

- Run: `node tests/test_media_controls_and_fullscreen_fix.js`
- Verify 100% test pass rate with exit code 0.
- Micro-commit: `git commit -m "test(media): overhaul test suite with unconditional IPC AST and functional runtime mock"`
