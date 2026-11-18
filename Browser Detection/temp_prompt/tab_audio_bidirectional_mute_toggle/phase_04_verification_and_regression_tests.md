# Phase 4: Automated Verification Suite & Comprehensive Regression Gates
# Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
# Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001

> **Target File:** [`tests/test_media_deck_bidirectional_mute_toggles.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_deck_bidirectional_mute_toggles.js)  
> **Assigned Agent Role:** Level 4 QA Verification Engineer  
> **Mandatory Guidelines:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`), 100% W3C Trusted Types Safe

---

## 🎯 1. Phase Objective
Author a comprehensive 5-battery automated test suite verifying all 4 requirements, execute local test gates, and verify 100% clean passage across the entire repository without regressions.

---

## 📝 2. Test Battery Specifications

### Battery 1: DOM Elements, Attributes & Accessibility
- Verify existence of `#btnMuteAll` and `#btnMuteAllOthers` in `dashboard.html`.
- Verify presence of `btnSolo` icon only (🎧) and title attribute in deck cards.
- Verify accessibility ARIA attributes.

### Battery 2: Two-Way Toggle Logic in Feature Module
- Test `handleSoloTab`: Toggle ON sets soloTabId and mutes others; toggle OFF clears soloTabId and restores tabs.
- Test `handleMuteAllOthers`: 1st click sets `isMuteAllOthersActive = true`; 2nd click sets `isMuteAllOthersActive = false`.
- Test `handleMuteAll`: 1st click sets `isMuteAllActive = true`; 2nd click sets `isMuteAllActive = false`.

### Battery 3: Background Service Worker Snapshot & Restore in VM Sandbox
- Simulate tabs in various mute states (e.g. Tab 1 unmuted, Tab 2 muted).
- Execute `handleSoloTabExecution`, verify Tab 2 remains recorded as muted.
- Execute `handleSoloTabClearExecution`, verify Tab 2 returns to muted and Tab 1 returns to unmuted.
- Simulate `handleMuteAllOthersExecution` and clear.
- Simulate `handleMuteAllExecution` and clear.

### Battery 4: IPC Listener Routing & Broadcast Telemetry
- Test message listener routing for all 6 IPC actions.
- Verify `LIVE_MEDIA_UPDATE` is broadcast after each operation.

### Battery 5: Security Standards & Rule Compliance
- Verify UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all touched files.
- Verify 100% W3C Trusted Types compliance (zero innerHTML/outerHTML).

---

## 🔒 3. Final Verification Gate
- Run: `node tests/test_media_deck_bidirectional_mute_toggles.js` -> Exit code 0.
- Run: Full repository test suite -> Exit code 0.
