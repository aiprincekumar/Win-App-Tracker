# Phase 3: Integration Verification & Regression Test Suite Hardening

> **Phase Number:** 3 of 3  
> **Phase Target:** `tests/test_media_controls_and_fullscreen_fix.js` & Global Test Suite  
> **Target Path:** `temp_prompt/controls_1_to_5_fix/phase_03_qa_verification_and_regression.md`  
> **Assigned Role:** Level 4 Independent QA Verification Agent  
> **Lead Department:** Dept 08 QA & Testing  
> **Test Gate:** `node tests/test_media_controls_and_fullscreen_fix.js` & full project test runner  

---

## 🎯 1. Phase Objective
Execute exhaustive, independent quality assurance to verify that:
1. All 5 popup media controls operate cleanly without packet drops.
2. In-page overlay fullscreen button linking functions properly.
3. Obsolete DOM manipulation bloat is confirmed deleted.
4. `#btnGlobalMediaToggle` remains 100% untouched and isolated.
5. All JavaScript files parse with zero errors and satisfy W3C Trusted Types.

---

## 📂 2. Test Suite Structure (`tests/test_media_controls_and_fullscreen_fix.js`)
The dedicated automated test harness evaluates 7 critical test categories:

1. **Test 1: Content Script IPC Router Parsing Integrity**
   - Tests Envelope A (`{ type: 'MEDIA_CONTROL', action: 'toggle_play' }`).
   - Tests Envelope B (`{ type: 'MEDIA_CONTROL', action: 'seek_relative', data: { ... } }`).
   - Tests Envelope C (Direct action messages).
   - Tests Envelope D (`SET_VOLUME` envelope).
   - Tests Envelope E (`QUERY_PAGE_MEDIA` telemetry).
   - Asserts zero packet drops across all 16 recognized actions.

2. **Test 2: `handleMediaControl` Action Execution Suite**
   - Asserts `play`, `pause`, `toggle_play` transitions.
   - Asserts `seek_relative` clamping within `[0, duration]`.
   - Asserts `seek_percent` positioning.
   - Asserts `toggle_mute` and `set_volume` boundaries.
   - Asserts `step_speed` speed ladder progression.
   - Asserts `toggle_fullscreen` returns `{ success: true }`.

3. **Test 3: On-Video Overlay Fullscreen Button Linking Verification**
   - Asserts Priority 1: Floating overlay button `.click()` is executed.
   - Asserts Priority 2: `window.__SentinelFullscreenController.toggle()` called as clean fallback.

4. **Test 4: Bloat Removal & Simplification in `popup/popup.js`**
   - Scans AST/code to ensure 9 legacy manual DOM manipulation patterns are absent.
   - Confirms `#btnCtrlFullscreen` is compact (< 80 lines).

5. **Test 5: Universal Global Media Invariant Guard**
   - Scans `popup/popup.js` to assert `#btnGlobalMediaToggle` is untouched and isolates global multi-tab playback.

6. **Test 6: In-Popup Media Controls Wiring Verification**
   - Confirms DOM event listeners for Controls 1 to 5 wire to respective IPC functions.

7. **Test 7: Extension Syntax & Trusted Types Compliance**
   - Executes `node -c` and `vm.Script` parsing across all 6 core files.
   - Scans for 0 forbidden `innerHTML` assignments in injected code.

---

## 🚦 3. Execution Command & Acceptance Gate

Run the complete verification suite:
```powershell
node tests/test_media_controls_and_fullscreen_fix.js
```

### Required Terminal Proof:
- Exit code: `0`
- Zero test failures across all 7 test categories.
- Final output: `ALL MEDIA CONTROLS & ON-VIDEO OVERLAY FULLSCREEN TESTS PASSED WITH 100% SUCCESS!`
