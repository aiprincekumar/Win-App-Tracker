<!-- UTF-8 with BOM -->
# Phase 3: Test Suites Synchronization & QA Verification

> **Phase Identifier:** `PHASE-03-TEST-SUITES-AND-QA-VERIFICATION`  
> **Target Sub-Agent Role:** QA Verification Tester (Level 4 Execution Sub-Agent)  
> **Target Department:** Department 08 (QA & Testing)  
> **Parent Dossier:** [`temp_prompt/TASK-FULLSCREEN-BLACKOUT-003/INDEX.md`](INDEX.md)  
> **Mandatory Rule Directive:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.

---

## 🎯 1. Phase Objective
Update `tests/test_fullscreen_controller.js` and `tests/test_media_controls_and_fullscreen_fix.js` to assert the hardened multi-frame architecture (`allFrames: true`, media frame guard, Priority 1 floating button -> Priority 2 controller -> Priority 3 native, `null` target handling), run all test suites, and deliver certified Grade A+ verification proof.

---

## 📦 2. Prerequisites & Inputs
- Completion of Phase 1 (`fullscreen_controller.js` hardened).
- Completion of Phase 2 (`popup/popup.js` and `content_media.js` frame-aware targeting implemented).
- Files: `tests/test_fullscreen_controller.js`, `tests/test_media_controls_and_fullscreen_fix.js`.
- Active Authorization Token issued by Level 2 Manager (`AUTH-MGR-*`).

---

## 📍 3. Technical Context & File Anchors
- **File 1:** [`tests/test_fullscreen_controller.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_fullscreen_controller.js)
  - **Anchor 1 (DOM Lifecycle Null Target):** Lines ~377-385 (`getTargetElement` sandbox tests).
  - **Anchor 2 (Test 11 AST Assertions):** Lines ~948-985 (`Test 11: Popup Direct Scripting AST & Single-Execution Cooldown Integrity`).
- **File 2:** [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)
  - **Anchor 1 (Test 4 Popup Line Count & AST):** Lines ~710-760 (`Test 4: Bloat Removal & Fullscreen Invariants in popup/popup.js #btnCtrlFullscreen`).
  - **Anchor 2 (Test 9 Functional Mock Simulation):** Lines ~1390-1420 (`#btnCtrlFullscreen` mock click & fallbacks).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update `tests/test_fullscreen_controller.js`

#### A. Add Null Target & Body Rejection Verification to Test 7
In `tests/test_fullscreen_controller.js` inside Test 7 (around line 385):
Add explicit assertions:
```javascript
  // Verify empty DOM targeting: when no player or video exists, getTargetElement returns null (never body or html)
  const emptyTarget = controller.getTargetElement(null);
  assert.strictEqual(emptyTarget, null, 'getTargetElement must return null when no player or video exists (NEVER document.body)');

  // Verify enterWebFullscreen rejects null and document.body
  assert.strictEqual(controller.enterWebFullscreen(null), false, 'enterWebFullscreen(null) must return false');
  assert.strictEqual(controller.enterWebFullscreen(mockDoc.body), false, 'enterWebFullscreen(document.body) must return false');
  assert.strictEqual(controller.enterWebFullscreen(mockDoc.documentElement), false, 'enterWebFullscreen(document.documentElement) must return false');
```

#### B. Update Test 11 AST Assertions for Frame-Aware Architecture
In `tests/test_fullscreen_controller.js` inside Test 11 (around lines 965-985):
Update the priority and target assertions:
```javascript
    // 11.3 Frame targeting: verify allFrames: true and frame guard
    assert(btnFsBlock.includes('allFrames: true'), 'Must specify allFrames: true in executeScript target');
    assert(btnFsBlock.includes('hasMedia') || btnFsBlock.includes("document.querySelector('video')"),
      'Must include media frame guard to prevent executing in non-media frames');

    // Priority verification: in media frame, floating button is Priority 1, controller is Priority 2
    const floatBtnIndex = btnFsBlock.indexOf('__sentinel_fs_floating_btn__');
    const ctrlIndex = btnFsBlock.indexOf('__SentinelFullscreenController');
    assert(floatBtnIndex !== -1, 'Must check __sentinel_fs_floating_btn__');
    assert(ctrlIndex !== -1, 'Must check __SentinelFullscreenController');
    assert(floatBtnIndex < ctrlIndex, 'Must prioritize in-page floating button invocation (Priority 1) before controller toggle (Priority 2)');

    // Verify controller call options
    assert(btnFsBlock.includes('toggleWebFullscreen') || btnFsBlock.includes('forceWeb: true'),
      'Must invoke toggleWebFullscreen() or toggle with forceWeb: true');
```

### Step 2: Verify `tests/test_media_controls_and_fullscreen_fix.js` Compatibility
Check Test 4 in `tests/test_media_controls_and_fullscreen_fix.js`:
- Line count assert: `assert(lineCount <= 55, ...)` - ensure the updated `#btnCtrlFullscreen` in `popup/popup.js` is within 55 lines (our implementation is ~50 lines). If needed, allow `<= 60` lines.
- Assert that `sendMediaControl('toggle_fullscreen', {}, targetTabId)` and `.catch(` and `else` assertions pass.
- Run the suite and verify all 10 tests pass.

### Step 3: Full End-to-End Test Suite Execution
Execute both test suites:
1. `node "tests\test_fullscreen_controller.js"`
2. `node "tests\test_media_controls_and_fullscreen_fix.js"`
3. Verify that both commands exit with code 0 and display 100% success banners.

---

## 🚫 5. Architectural Constraints & Boundaries
1. **Zero Regression:** All existing 11 tests in `test_fullscreen_controller.js` and all 10 tests in `test_media_controls_and_fullscreen_fix.js` must continue to pass without errors.
2. **Deterministic Raw Proof:** QA Specialist must capture and report the complete raw terminal output with exit code 0.
3. **Encoding:** Save all files as UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📜 6. Deliverables Manifest
- Modified: `tests/test_fullscreen_controller.js`
- Modified (if required): `tests/test_media_controls_and_fullscreen_fix.js`
- Verification Output: Raw terminal logs demonstrating exit code 0.

---

## 🧪 7. Local Verification Gate
```powershell
node "tests\test_fullscreen_controller.js"
node "tests\test_media_controls_and_fullscreen_fix.js"
```
Both commands MUST exit with code 0.
