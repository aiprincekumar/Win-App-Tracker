# Phase 2: Test Suite Overhaul & Parity Verification
## Standalone Executable Implementation Specification

> **Phase:** 2 of 3  
> **Role:** Level 4 QA Test Engineer  
> **Target File:**
> - [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\tests\test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)  
> **Governance:** Universal Rule 22 & [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Phase Objective

The objective of Phase 2 is to overhaul and augment `tests/test_media_controls_and_fullscreen_fix.js` to rigorously verify the Phase 1 bridge bug fixes and Popup-to-Dashboard parity:
1. Verify `inject_main_world.js` `toggle_mute` single-inversion determinism (assert `else if (video)` or absence of unconditional dual-mutation of `video.muted`).
2. Verify `content_media.js` resilient fallback to direct `primaryMediaElement` execution when the main world bridge is inactive (`!isBridgeActive`).
3. Verify `popup/popup.js` `targetTabId` resolution parity with `dashboard/dashboard.js` (unified `getActiveMediaTabId` and `sendMediaControl` resolution).
4. Maintain and assert all existing invariants: 0 conflicting `executeScript` calls, strict single-dispatch IPC, preservation of `#btnGlobalMediaToggle`, and intact cooldown timestamps.

---

## 📋 2. Prerequisites & Inputs

- Successful completion and syntax certification of Phase 1 (`node -c` on all target files).
- Target workspace: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`.

---

## 🔍 3. Technical Context & File Anchors

- **Test Suite File:** `tests/test_media_controls_and_fullscreen_fix.js`
- Current tests cover Tests 1 through 9.
- We will add **Test 10: Bridge Parity, Fallback Resilience, and Mute Determinism Suite** to cleanly test the new invariants without disturbing Tests 1–9.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Inspect `tests/test_media_controls_and_fullscreen_fix.js`
Open the test suite and locate the final assertion block (around line 1290, before `console.log('🎉 ALL MEDIA CONTROLS & ON-VIDEO OVERLAY FULLSCREEN TESTS PASSED WITH 100% SUCCESS!');`).

### Step 2: Implement Test 10 Suite
Insert **Test 10** before the success banner:

```javascript
// ---------------------------------------------------------------------------
// Test 10: Bridge Parity, Fallback Resilience, and Mute Determinism Suite
// ---------------------------------------------------------------------------
console.log('Test 10: Bridge Parity, Fallback Resilience, and Mute Determinism Suite');
{
  const injectCode = fs.readFileSync(path.join(baseDir, 'inject_main_world.js'), 'utf8');
  const contentCode = fs.readFileSync(path.join(baseDir, 'content_media.js'), 'utf8');
  const popupCode = fs.readFileSync(path.join(baseDir, 'popup', 'popup.js'), 'utf8');

  // 10.1 inject_main_world.js: Mute Determinism (Single-Inversion)
  const muteHandlerMatch = injectCode.match(/case 'toggle_mute':\s*\{([\s\S]*?)break;/);
  assert(muteHandlerMatch, 'inject_main_world.js must have case toggle_mute: block');
  const muteBody = muteHandlerMatch[1];
  assert(muteBody.includes('else if (video)'), 'inject_main_world.js toggle_mute must use mutually exclusive "else if (video)" to prevent double inversion');
  console.log('  ✅ 10.1: inject_main_world.js toggle_mute single-inversion determinism verified');

  // 10.2 content_media.js: Resilient Fallback to primaryMediaElement
  assert(contentCode.includes('shouldExecuteDirect') || contentCode.includes('!isBridgeActive'), 
    'content_media.js handleMediaControl must implement resilient fallback when bridge is unready');
  assert(contentCode.includes('forwardActionToMainWorld(action, data);'), 
    'content_media.js must forward actions to main world when target is active');
  console.log('  ✅ 10.2: content_media.js resilient fallback to primaryMediaElement verified');

  // 10.3 popup/popup.js: Unified Target Tab Resolution & Dashboard Parity
  assert(popupCode.includes('function getActiveMediaTabId()'), 'popup/popup.js must define getActiveMediaTabId');
  assert(popupCode.includes('const resolvedTabId = tabId || getActiveMediaTabId();') || popupCode.includes('tabId || getActiveMediaTabId()'), 
    'popup/popup.js sendMediaControl must auto-resolve tabId using getActiveMediaTabId');
  console.log('  ✅ 10.3: popup/popup.js targetTabId resolution parity with dashboard verified');

  // 10.4 popup/popup.js: Strict Invariant Guards
  assert(popupCode.includes('const btnGlobalMediaToggle = document.getElementById(\'btnGlobalMediaToggle\');'), 
    'Universal Play/Pause button (#btnGlobalMediaToggle) must remain intact');
  assert(popupCode.includes('lastPlayToggleTime') && popupCode.includes('lastMuteToggleTime') && popupCode.includes('lastSpeedChangeTime'), 
    'Optimistic cooldown timestamps must remain strictly declared in popup/popup.js');
  console.log('  ✅ 10.4: Strict invariant guards (frozen cooldowns & #btnGlobalMediaToggle) verified');
}
```

### Step 3: Run the Overhauled Test Suite
Run the test command:
```bash
node tests/test_media_controls_and_fullscreen_fix.js
```
Confirm that all 10 test sections run, all assertions succeed, and the test exits with code 0.

---

## 🚫 5. Architectural Constraints & Boundaries

- Do not modify or weaken any existing assertions in Tests 1 through 9.
- The test suite must run autonomously using standard Node.js runtime and built-in `assert`, `fs`, `path`, and `vm` modules without external test runners (e.g. Jest/Mocha).

---

## 📦 6. Deliverables Manifest

1. `tests/test_media_controls_and_fullscreen_fix.js` (overhauled with Test 10).

---

## 🚦 7. Local Verification Gate

Execute:
```bash
node tests/test_media_controls_and_fullscreen_fix.js
```
Must print `🎉 ALL MEDIA CONTROLS & ON-VIDEO OVERLAY FULLSCREEN TESTS PASSED WITH 100% SUCCESS!` and exit with code 0.
