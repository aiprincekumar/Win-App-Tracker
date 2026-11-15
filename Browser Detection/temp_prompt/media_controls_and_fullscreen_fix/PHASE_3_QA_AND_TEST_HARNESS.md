# Phase 3: QA Verification & Test Suite Hardening

> **Task ID:** `TASK-MEDIA-CTRL-FS-FIX-001-P03`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File:** [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)  
> **Author & Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Assigned Role:** Level 4 Independent QA Verification Subagent  
> **Status:** READY FOR SUBAGENT EXECUTION  

---

## 🎯 1. Phase Objective

Develop and execute an independent automated verification test harness (`tests/test_media_controls_and_fullscreen_fix.js`) to rigorously validate that:
1. `content_media.js` runtime IPC message router cleanly processes both `{ type: 'MEDIA_CONTROL', action: 'toggle_play' }` and direct media actions without dropping commands.
2. `content_media.js` `handleMediaControl` properly executes all supported actions (`toggle_play`, `seek_relative`, `seek_percent`, `toggle_mute`, `set_volume`, `step_speed`, `toggle_fullscreen`).
3. Fullscreen toggle in `content_media.js` and `popup.js` checks for and clicks the on-video overlay button (`#__sentinel_fs_floating_btn__`) or calls `window.__SentinelFullscreenController.toggle()`.
4. `#btnCtrlFullscreen` in `popup.js` has stripped the ~100 lines of complex separate script injection.
5. `#btnGlobalMediaToggle` in `popup.js` remains **100% UNTOUCHED** and dispatches `TOGGLE_GLOBAL_MEDIA`.
6. Normal Play/Pause (`#btnCtrlTogglePlay`, `#dynamicStatusBtn`), Seek +/-10s, Mute, Speed, Timeline scrubber, and Volume slider are verified.
7. Full regression verification: `test_syntax_and_manifest_integrity.js` and other core suites pass cleanly with exit code 0.

---

## 📋 2. Prerequisites & Inputs

- Files to verify:
  - `content_media.js`
  - `popup/popup.js`
  - `tests/test_media_controls_and_fullscreen_fix.js`
- Requires active authorization token issued by Level 2 Manager (`AUTH-MGR-*`).
- Independent QA Role: Execution must produce raw terminal proof of exit code 0.

---

## 🔍 3. Test Cases Specification (`tests/test_media_controls_and_fullscreen_fix.js`)

The test suite must implement the following 7 test scenarios:

### Test 1: Content Script IPC Router Parsing Integrity
- Verify that `content_media.js` `onMessage` listener handles:
  - Envelope A: `{ type: 'MEDIA_CONTROL', action: 'toggle_play', data: {} }` -> Calls `handleMediaControl('toggle_play', {})`.
  - Envelope B: `{ type: 'MEDIA_CONTROL', action: 'seek_relative', data: { offsetSeconds: -10 } }` -> Calls `handleMediaControl('seek_relative', { offsetSeconds: -10 })`.
  - Envelope C: Direct action `{ action: 'step_speed', data: { direction: 'up' } }` or `{ type: 'toggle_play' }`.
  - Envelope D: `{ type: 'SET_VOLUME', volume: 0.5, percent: 50 }`.
  - Envelope E: `{ type: 'QUERY_PAGE_MEDIA' }`.
- Assert that none of these messages are dropped or fail to return a response.

### Test 2: `handleMediaControl` Action Dispatch Suite
- Mock primary HTML5 video element with properties (`paused`, `currentTime`, `duration`, `muted`, `volume`, `playbackRate`).
- Test `play`, `pause`, `toggle_play`.
- Test `seek_relative` (+10s, -10s) and bounds clamping.
- Test `seek_percent` (percentage calculation against duration).
- Test `toggle_mute` and `set_volume` (clamped 0 to 1).
- Test `step_speed` (ladder speeds 0.25x to 4.0x).
- Test `toggle_fullscreen`.

### Test 3: Fullscreen On-Video Overlay Button Linking
- Verify that when `#__sentinel_fs_floating_btn__` exists in the DOM:
  - `handleMediaControl('toggle_fullscreen')` clicks `#__sentinel_fs_floating_btn__`.
  - `popup.js` `#btnCtrlFullscreen` script injection clicks `#__sentinel_fs_floating_btn__`.
- Verify that when `#__sentinel_fs_floating_btn__` is absent, fallback calls `window.__SentinelFullscreenController.toggle(null, { forceWeb: true })`.

### Test 4: Code Simplification & Bloat Removal in `#btnCtrlFullscreen`
- Inspect `popup/popup.js` AST or line range around `#btnCtrlFullscreen`.
- Assert that the 124-line manual DOM manipulation block has been removed.
- Assert that `#btnCtrlFullscreen` delegates cleanly to the floating overlay button / controller and calls `sendMediaControl('toggle_fullscreen')`.

### Test 5: Universal Global Media Invariant Guard (`#btnGlobalMediaToggle`)
- Inspect `popup/popup.js` lines for `#btnGlobalMediaToggle`.
- Assert that `#btnGlobalMediaToggle` is bound to send message `{ type: 'TOGGLE_GLOBAL_MEDIA' }`.
- Assert that `#btnGlobalMediaToggle` was NOT modified to use `CONTROL_MEDIA` or merged with single-tab controls.

### Test 6: In-Popup Normal Media Controls Wiring Verification
- Verify that `#btnCtrlTogglePlay` and `#dynamicStatusBtn` both call `handleTogglePlay`.
- Verify `#btnCtrlRewind` and `#btnCtrlForward` dispatch `seek_relative` (-10, +10).
- Verify `#btnCtrlToggleMute` and `#btnQuickMute` call `handleToggleMute`.
- Verify `#btnCtrlSpeedDown` and `#btnCtrlSpeedUp` step speed.
- Verify `#progressBarContainer` dispatches `seek_percent`.
- Verify `#volumeBarContainer` dispatches `set_volume`.

### Test 7: Extension Syntax & W3C Trusted Types Compliance
- Assert zero syntax errors across all workspace scripts via `node -c`.
- Assert zero innerHTML assignments in `content_media.js` and `popup/popup.js`.

---

## 🛠️ 4. Test Script Implementation Template

```javascript
/**
 * Test Suite: Media Controls & On-Video Overlay Fullscreen Linking Verification
 * File: tests/test_media_controls_and_fullscreen_fix.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Media Controls & Fullscreen Linking Verification Suite...\n');

// 1. Syntax & File Verification
// 2. Content Script IPC Message Router Simulation
// 3. Overlay Fullscreen Button Linking Verification
// 4. Bloat Removal Verification in popup.js
// 5. Global Media Toggle Preservation Verification
// 6. Player Control Payloads Verification
```

---

## 🚫 5. Architectural Constraints & Boundaries

- QA Subagent must run test scripts using `run_command`.
- No modification of production code during the QA phase (test suite additions only).
- Raw terminal output with exit code 0 is mandatory.

---

## 📦 6. Deliverables Manifest

1. New test suite `tests/test_media_controls_and_fullscreen_fix.js`.
2. Terminal execution proof of:
   - `node tests/test_media_controls_and_fullscreen_fix.js`
   - `node tests/test_syntax_and_manifest_integrity.js`
   - `node tests/test_volume_timeline_fullscreen_controls.js`
3. Formal Grade A+ signoff report.

---

## 🧪 7. Local Verification Gate

```powershell
node tests/test_media_controls_and_fullscreen_fix.js
node tests/test_syntax_and_manifest_integrity.js
```
Both commands must pass with 100% success and exit code 0.
