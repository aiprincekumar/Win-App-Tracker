# Phase 4: QA Verification, Automated Test Suite & Regression Gate

> **Phase Identifier:** `PHASE-04-QA-VERIFICATION`  
> **Target Task ID:** `TASK-MEDIA-DECK-CONTROLS-001`  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Workspace Container:** `temp_prompt/media_deck_controls_wiring/`  
> **Target File:** [`tests/test_media_deck_controls_wiring.js`](file:///C:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_deck_controls_wiring.js)

---

## 🎯 1. Phase Objective
Author a comprehensive automated test suite `tests/test_media_deck_controls_wiring.js` covering backend command routing, content script seek duration clamping, dashboard media deck scrubber interactivity, tab switching navigation, W3C Trusted Types compliance, and UTF-8 BOM encoding. Execute the entire repository test suite (`node run_all_tests.js`) and certify Grade A+ signoff with zero regressions.

---

## 📋 2. Prerequisites & Environment Inputs
- Phases 1, 2, and 3 implementation completed.
- Node.js runtime and test runner available.

---

## 🔍 3. Technical Context & File Anchors
- **Test File:** `tests/test_media_deck_controls_wiring.js`
- **Master Test Runner:** `run_all_tests.js`
- **Target Files Tested:**
  - `background.js`
  - `content_media.js`
  - `src/dashboard/features/media_deck_visualizer_feature.js`
  - `dashboard/dashboard.js`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Author `tests/test_media_deck_controls_wiring.js`
Structure the test suite with 6 rigorous test batteries:
1. **Battery 1: Background Service Worker Command Execution:**
   - Test `handleRemoteMediaCommandExecution` with `seek_to` (verifying `pm.currentTime` updated).
   - Test `handleRemoteMediaCommandExecution` with `seek_percent` (verifying `pm.currentTime = (pct/100)*dur`).
   - Test `handleRemoteMediaCommandExecution` with `switch_tab` (verifying `activateAndFocusTab` called).
   - Test `handleRemoteMediaCommandExecution` with `play`, `pause`, `mute`, `unmute`.
2. **Battery 2: Content Script Media Controls & Clamping:**
   - Verify `seek_to` and `seek_absolute` are present in `KNOWN_MEDIA_ACTIONS`.
   - Test `handleMediaControl('seek_to', { positionSeconds: 50 })` on element with duration 100s -> sets `currentTime = 50`.
   - Test duration clamping with out-of-bounds `positionSeconds: 150` on element with duration 100s -> clamped to `100`.
   - Test negative duration clamping with `positionSeconds: -10` -> clamped to `0`.
3. **Battery 3: Multi-Tab Live Media Deck UI & Scrubber Seeking:**
   - Render mock streams using `renderMultiTabMediaDeck`.
   - Verify `.btn-deck-switch-tab` exists on card with proper `aria-label`.
   - Simulate click event on `.deck-mini-scrubber` at 50% width -> verifies `handleRemoteMediaCommand` called with `seek_to`.
   - Verify zero occurrences of `.innerHTML` in generated DOM structure.
4. **Battery 4: Hero Player Controls Parity:**
   - Verify `#btnHeroPlayPause`, `#btnHeroMute`, `#heroVolumeBar`, `#btnHeroSwitchTab`, and `#heroProgressBar` listeners are wired.
5. **Battery 5: UTF-8 with BOM Standard:**
   - Verify byte order mark (`0xEF, 0xBB, 0xBF`) on all modified files (`background.js`, `content_media.js`, `media_deck_visualizer_feature.js`, `tests/test_media_deck_controls_wiring.js`).

### Step 2: Register Test in `run_all_tests.js`
Ensure `test_media_deck_controls_wiring.js` is automatically discovered or registered in `run_all_tests.js`.

### Step 3: Execute Full Workspace Test Suite & Secret Scan
Run all tests and verify exit code 0:
```powershell
node tests/test_media_deck_controls_wiring.js
node run_all_tests.js
gitleaks detect --redact
```

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- All 55 existing test suites must continue passing 100% clean.
- Strictly zero skipped or conditionally ignored assertions.
- Maintain 100% UTF-8 with BOM standard.

---

## 📦 6. Deliverables Manifest
- Created `tests/test_media_deck_controls_wiring.js`.
- Test execution terminal logs confirming 56/56 suites pass clean.

---

## 🧪 7. Local Verification Gate
```powershell
node tests/test_media_deck_controls_wiring.js
node run_all_tests.js
```
Must exit with code 0.
