# Phase 4: Test Suite Implementation & Verification Gate

> **Document Type:** Dedicated Phase Instruction Specification  
> **Workspace Container:** `temp_prompt/fix_media_playback_history/`  
> **Target Subsystem:** Test Automation & Independent Quality Assurance Gate  
> **Target Test Suite:** `tests/test_media_playback_history_backend_fix.js`  
> **Target Subagent Role:** Level 4 QA Verification Tester  
> **Lead Department:** Department 08 (QA & Testing)  
> **Execution Gate:** Independent QA Grade A+ Gate (`node run_all_tests.js`)  

---

## 🎯 1. Phase Objective

The objective of Phase 4 is to build and certify an authoritative, deterministic regression test suite (`tests/test_media_playback_history_backend_fix.js`) that verifies all 6 root-cause fixes across `background.js` and `dashboard/dashboard.js`, followed by running the entire workspace test suite to guarantee Grade A+ certification with zero regressions:
1. Author `tests/test_media_playback_history_backend_fix.js` containing 8 comprehensive test batteries.
2. Verify foreground playback watch duration accumulation logic.
3. Verify SPA video transition detection and session finalization.
4. Verify atomic storage persistence of `media_sentinel_media_history`.
5. Verify live active session hydration in `GET_DASHBOARD_DATA`.
6. Verify array truthiness fallback and Data Hub history union in `dashboard.js`.
7. Verify search, filter, and sort table resilience.
8. Verify W3C Trusted Types compliance and AST syntax integrity.
9. Execute `node run_all_tests.js` to certify 51 of 51 test suites passing cleanly with exit code 0.

---

## 📦 2. Prerequisites & Inputs

- Files: `background.js`, `dashboard/dashboard.js` (Completed Phases 1, 2, 3)
- Memory: `memory.md`
- Master Test Runner: `run_all_tests.js`

---

## 🔍 3. Technical Context & File Anchors

Existing test suites in `tests/` use standalone Node.js scripts with mock browser APIs (`chrome.storage.local`, `chrome.tabs`, `chrome.runtime`).
Examples: `tests/test_timer_and_dual_media_tracking.js`, `tests/test_tab_switch_and_storage_persistence.js`, `tests/test_media_tab_switch_and_i18n.js`.
`run_all_tests.js` dynamically scans `tests/test_*.js` and runs each test file, asserting exit code 0.
When `tests/test_media_playback_history_backend_fix.js` is created, `run_all_tests.js` will automatically discover and run it as the 51st test suite!

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 4.1: Author `tests/test_media_playback_history_backend_fix.js`
The test script must be self-contained and execute the following 8 batteries:

#### Battery 1: Foreground Playback Duration Accrual
- Mock an active playing session in `activeMediaSessions` for `tabId = 1`.
- Set `activeTabId = 1`, `isBrowserFocused = true` (Foreground condition).
- Advance virtual clock by 10,000ms.
- Run the 5-second interval loop logic or simulate 2 delta loop iterations.
- Assert: `session.watchDuration` equals 10 seconds (NOT 0).
- Assert: `mediaHistory.length >= 1` and `mediaHistory[0].watchDuration === 10`.

#### Battery 2: SPA / YouTube Video Navigation & Transition
- Mock an active session playing `https://www.youtube.com/watch?v=VIDEO_1`.
- Simulate user navigating to `https://www.youtube.com/watch?v=VIDEO_2` in the same `tabId`.
- Call `trackMediaSession(1, { url: 'https://www.youtube.com/watch?v=VIDEO_2', primaryMedia: { isPlaying: true, title: 'Video 2' } })`.
- Assert: `VIDEO_1` session is finalized into `mediaHistory`.
- Assert: New active session exists for `tabId = 1` with `url` containing `VIDEO_2` and `watchDuration === 0`.

#### Battery 3: Atomic Storage Persistence
- Set `mediaHistory` to contain 3 sample video sessions.
- Call `saveStorageData()`.
- Inspect mocked `browserAPI.storage.local.set` payload.
- Assert: Payload contains both `CONFIG.STORAGE_KEY` and `CONFIG.MEDIA_HISTORY_STORAGE_KEY`.
- Assert: `payload[CONFIG.MEDIA_HISTORY_STORAGE_KEY].length === 3`.

#### Battery 4: Active Session Live Hydration in `GET_DASHBOARD_DATA`
- Set `activeMediaSessions` to have an active video session that has been playing for 15 seconds without pausing.
- Simulate `GET_DASHBOARD_DATA` message.
- Inspect the response callback object.
- Assert: `response.mediaHistory` contains the active video session.
- Assert: `response.mediaHistory[0].watchDuration >= 15`.

#### Battery 5: Dashboard Truthiness Fallback & Data Hub Union
- Test `resolveUnifiedMediaHistory` logic:
  - Case A: `bgList = []`, `hubList = [{ id: 'dh_1', title: 'Data Hub Video' }]`.
    Assert: Result has length 1 with `id === 'dh_1'` (Proves `[] || hubList` truthiness bug is eliminated).
  - Case B: `bgList = [{ id: 'bg_1' }]`, `hubList = [{ id: 'bg_1' }, { id: 'dh_2' }]`.
    Assert: Result has length 2 with unique IDs (Proves deduplication).

#### Battery 6: Search, Platform Filter & Sort Resilience
- Mock dashboard DOM with `#tableMediaSearch`, `#tableMediaPlatformFilter`, `#tableMediaSortSelect`, `#mediaTableBody`.
- Load sample dataset of 5 items (3 YouTube, 2 Vimeo).
- Filter by `platform = 'youtube'`. Assert 3 rows visible.
- Filter by search `query = 'lecture'`. Assert matching rows.
- Clear search and filter. Assert all 5 rows restored (Proves zero table wiping).

#### Battery 7: W3C Trusted Types & Security Audit
- Inspect `dashboard/dashboard.js` AST or source for `innerHTML` and `outerHTML` assignments.
- Assert: Zero prohibited string mutations in media table rendering routines.

#### Battery 8: Node.js AST Syntax Check
- Verify that `background.js` and `dashboard/dashboard.js` pass `node -c` with exit code 0.

---

## 🛡️ 5. Architectural Constraints & Boundaries

- All mock objects must be clean and not leak state between batteries.
- Test script must exit with `process.exit(0)` on 100% pass, and `process.exit(1)` on any failure.
- Ensure UTF-8 with BOM standard is applied to the test file.

---

## 📋 6. Deliverables Manifest

- `tests/test_media_playback_history_backend_fix.js` (8-battery automated test suite)

---

## 🚦 7. Local Verification Gate

Execute the following commands in the workspace:
1. Direct test execution:
   ```powershell
   node tests/test_media_playback_history_backend_fix.js
   ```
2. Full master regression test suite:
   ```powershell
   node run_all_tests.js
   ```
Must report `51 PASSED, 0 FAILED (Exit Code 0)`.
