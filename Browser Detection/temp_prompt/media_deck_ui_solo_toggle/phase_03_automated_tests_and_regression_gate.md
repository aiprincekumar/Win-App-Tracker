# Phase 3 Execution Prompt: Automated Unit/Integration Tests & Regression Suite Gate

> **Execution Directive for Level 4 QA Verification Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 08 QA & Testing & Security Sentinel.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🎯 1. Phase Objective
Author a comprehensive automated test suite in `tests/test_media_deck_ui_refactor_and_solo_toggle.js` and run the entire project test runner (`node run_all_tests.js`) to guarantee Grade A+ certification with exit code 0 across all 61 suites.

---

## 📂 2. Target Files
- **New Test Suite:** `tests/test_media_deck_ui_refactor_and_solo_toggle.js`
- **Test Runner:** `run_all_tests.js`

---

## 🧪 3. Detailed Test Batteries Specification

### Battery 1: DOM Structure & Full-Width Volume Row Placement
- Instantiate a mock DOM document and container.
- Invoke `renderMultiTabMediaDeck` with active streams.
- Assert that `.deck-volume-row` exists.
- Assert that `.deck-volume-slider` is located inside `.deck-volume-row`.
- Assert that `.deck-volume-row` is placed directly after `.deck-scrubber-row` and before `.deck-card-controls`.
- Assert that `.deck-volume-slider` is NOT inside `.deck-card-controls`.

### Battery 2: CSS Stylesheet Verification
- Read `dashboard/styles/media.css`.
- Assert that `.deck-volume-row` is defined.
- Assert that `.deck-volume-slider` has `width: 100%`.
- Assert that `.deck-card-controls .btn-deck-ctrl` has `flex: 1 1 0` (or `flex: 1`).
- Assert that the legacy `width: 55px` for `.deck-volume-slider` has been eliminated.

### Battery 3: Feature Solo Tab Two-Way Toggle Logic
- Provide mock streams: Tab 1 (Audible), Tab 2 (Audible).
- Call `handleSoloTab(1)` -> Expect Tab 1 unmuted, Tab 2 muted, `currentSoloTabId === 1`.
- Call `handleSoloTab(1)` again (second click on active solo tab) -> Expect Tab 1 unmuted, Tab 2 unmuted, `currentSoloTabId === null`, and runtime message sent with `action: 'MEDIA_STREAM_SOLO_CLEAR'`.
- Verify `.solo-active` class is added on first click and removed on second click.

### Battery 4: Background Service Worker Solo Clear Handler
- Verify `handleSoloTabClearExecution` is exported and defined in `background.js`.
- Mock `tabMediaMap` with multiple muted streams.
- Invoke `handleSoloTabClearExecution()`.
- Assert that all streams in `tabMediaMap` have `primaryMedia.isMuted === false`.
- Assert that `browserAPI.tabs.update` was invoked with `{ muted: false }` for all tabs.
- Assert that return object contains `{ success: true, cleared: true }`.

### Battery 5: W3C Trusted Types & Character Encoding Sentinel
- Verify zero occurrences of `innerHTML`, `outerHTML`, or `document.write` in the modified files.
- Verify that `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/styles/media.css`, and `background.js` have UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
- Verify zero syntax errors.

---

## 🚀 4. Final Quality Gate
- Run `node run_all_tests.js`.
- Verify: **ALL 61 TEST SUITES PASSED CLEANLY (Exit Code 0)**.
- If any test fails, immediately diagnose root cause, coordinate surgical fix, and re-verify until 100% clean.
