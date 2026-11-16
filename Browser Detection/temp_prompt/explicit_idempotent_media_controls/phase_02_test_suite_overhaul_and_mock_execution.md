# Phase 2: Test Suite Overhaul & Mock Execution Verification
## Standalone Executable Subagent Task Specification

> **Task ID:** `TASK-IDEMPOTENT-MEDIA-CONTROLS-PHASE2`  
> **Target Role:** Level 4 QA Test Engineer (`QA Verification Tester`)  
> **Assigned AI Model:** `flash` (Fast, high-fidelity test authoring and validation)  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Authorization Mandate:** Requires valid `AUTH-MGR-*` token from Level 2 Manager  
> **Prerequisites:** Successful completion and Grade A+ signoff of Phase 1  
> **Master Test File:** [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)  

---

## 🎯 1. Phase Objective

Modernize and overhaul `tests/test_media_controls_and_fullscreen_fix.js` to rigorously test and certify:
1. IPC routing of explicit `mute` and `unmute` commands in `content_media.js` and `background.js`.
2. Action execution of `mute` (`muted = true`) and `unmute` (`muted = false`) in `handleMediaControl`.
3. Code invariant verification of strict `else if (video)` mutual exclusion in `popup/popup.js` and `dashboard/dashboard.js`.
4. Runtime simulated functional mock suite validating dual-actuation (0ms direct script + IPC dispatch) with explicit action resolution (`play`/`pause`, `mute`/`unmute`).
5. Preservation of `#btnGlobalMediaToggle` and optimistic state cooldown timestamps.

---

## 🛠️ 2. Surgical Step-by-Step Instructions for `test_media_controls_and_fullscreen_fix.js`

### Step 1: Update Test 1 (Content Script IPC Router Parsing Integrity)
1. In `requiredKnownActions` (around line 86):
   - Add `'mute'` and `'unmute'` to the array.
2. In the simulated IPC test cases:
   - Add Envelope F: `{ type: 'MEDIA_CONTROL', action: 'mute' }` -> asserts routed cleanly.
   - Add Envelope G: `{ type: 'MEDIA_CONTROL', action: 'unmute' }` -> asserts routed cleanly.
   - Add Direct Action Envelope: `{ action: 'mute' }` and `{ action: 'unmute' }` -> asserts routed without drop.

### Step 2: Update Test 2 (`handleMediaControl` Action Execution Suite)
1. In the `toggle_mute & set_volume` test block (around line 250):
   - Add explicit test for `action: 'mute'`: verify `mockVideoElement.muted === true`.
   - Add explicit test for `action: 'unmute'`: verify `mockVideoElement.muted === false`.
   - Verify idempotency: calling `'mute'` when already muted stays muted; calling `'unmute'` when unmuted stays unmuted.

### Step 3: Update Test 6 (In-Popup Media Controls Wiring & Invariant Verification)
1. Update assertions for `#btnCtrlTogglePlay` and `#dynamicStatusBtn`:
   - Verify presence of explicit action calculation (`play` / `pause`).
   - Verify presence of strict `else if (video)` or `else if (video` mutual exclusion in the injected script body.
2. Update assertions for `#btnCtrlToggleMute` and `#btnQuickMute`:
   - Verify presence of explicit action calculation (`mute` / `unmute`).
   - Verify presence of strict `else if (video)` in the injected script body.
3. Confirm `#btnGlobalMediaToggle` invariant:
   - Verify lines binding `#btnGlobalMediaToggle` to `TOGGLE_GLOBAL_MEDIA` remain completely untouched.

### Step 4: Update Test 9 (Runtime Simulated Functional Mock Test Suite)
1. Update mock runtime tests for `#btnCtrlTogglePlay` and `#dynamicStatusBtn`:
   - Run simulation when initial state is paused -> verify direct `executeScript` receives `args: ['play']` and `sendMediaControl` is dispatched with `'play'`.
   - Run simulation when initial state is playing -> verify direct `executeScript` receives `args: ['pause']` and `sendMediaControl` is dispatched with `'pause'`.
2. Update mock runtime tests for `#btnCtrlToggleMute` and `#btnQuickMute`:
   - Run simulation when initial state is unmuted -> verify direct `executeScript` receives `args: ['mute']` and `sendMediaControl` is dispatched with `'mute'`.
   - Run simulation when initial state is muted -> verify direct `executeScript` receives `args: ['unmute']` and `sendMediaControl` is dispatched with `'unmute'`.
3. Verify strict mutual exclusion execution:
   - Provide mock environment with both `moviePlayer` and `video`.
   - Execute the injected script: assert `moviePlayer.playVideo()` or `moviePlayer.mute()` is called, and `video.play()` or `video.muted` is NOT touched.

### Step 5: Update Test 10 (Main World & Background Parity Verification)
1. Verify `background.js` static invariants:
   - Assert `background.js` contains `message.action === 'mute'` and `message.action === 'unmute'`.
2. Verify `inject_main_world.js` static invariants:
   - Assert `inject_main_world.js` contains `case 'mute':` and `case 'unmute':`.
   - Assert `inject_main_world.js` contains `showOSD('Muted', '🔇')` and `showOSD('Unmuted', '🔊')`.
3. Verify `content_media.js` static invariants:
   - Assert `KNOWN_MEDIA_ACTIONS` contains `'mute'` and `'unmute'`.

---

## 🔬 3. Local Verification Gate

Execute the test file directly and ensure 100% test passage with exit code 0:
```bash
node tests/test_media_controls_and_fullscreen_fix.js
```

Expected output:
- `All Media Controls & On-Video Overlay Fullscreen Tests Passed with 100% Success!`
- Exit Code: 0.

---

## 📦 4. Deliverables Manifest
- Updated `tests/test_media_controls_and_fullscreen_fix.js`
- Clean test run output logs with 0 assertion errors.
