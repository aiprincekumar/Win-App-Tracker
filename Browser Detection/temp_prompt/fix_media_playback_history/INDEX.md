# Media Playback History Backend & Dashboard Restoration: Master Index & Live Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/fix_media_playback_history/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target System:** Web Activity & Media Sentinel (`background.js`, `dashboard/dashboard.js`, `tests/test_media_playback_history_backend_fix.js`)  
> **Lead Departments:** Department 04 (Backend & System Architecture), Department 05 (Frontend Engineering), Department 08 (QA & Testing)  
> **Creation Timestamp:** 2026-11-17  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 The Operational Defect & Architectural Limitation
The user reported a critical regression in the Media Sentinel extension:
> *"Media Playback History इसमें जो है, कोई भी डाटा शो क्यों नहीं कर रहा है? मीडिया हिस्ट्री पहले तो शो कर रहा था। अब इसका जो लॉजिक है, बैकएंड लॉजिक उसको फिक्स करो।"*
> *(Why is Media Playback History not showing any data at all? Media history used to show earlier. Now fix its backend logic.)*

Following forensic inspection of the codebase across `background.js` and `dashboard/dashboard.js`, multiple interlocking defects were identified that completely prevent media playback sessions from being recorded and displayed:

1. **Foreground Playback Duration Stomping Bug (`background.js` lines 3959-3978):**  
   In the 5-second interval loop (`CONFIG.DELTA_BATCH_INTERVAL_MS`), when a media-playing tab is in the foreground (`isForeground = tabId === activeTabId && isBrowserFocused`), the code executed `session.lastHeartbeat = now;` without accumulating `session.watchDuration`. Because `lastHeartbeat` was continuously reset to `now` every 5 seconds, any subsequent heartbeat calculations in `trackMediaSession` saw `elapsedMs < 1000`, causing `session.watchDuration` to stay at `0` for the entire duration of foreground playback.
2. **Watch Duration Discard Gate (`background.js` lines 1672-1675, 1765):**  
   Both `updateMediaHistoryEntry` and `finalizeMediaSession` have strict guards:
   `if (session.watchDuration < 1 && !(session.controlEvents && session.controlEvents.length > 0)) return;`  
   Because `session.watchDuration` remained 0 during foreground playback, sessions were rejected and never saved into `mediaHistory`.
3. **SPA & YouTube Video Navigation Blind Spot (`background.js` lines 1570-1635):**  
   When a user clicks a new video on YouTube or other Single-Page Applications in the same tab, `trackMediaSession` found the existing `tabId` session and merely updated `session.title = title`. It failed to detect the URL/video change, never finalized the previous video session into `mediaHistory`, and caused continuous session bleeding or metadata loss.
4. **Persistent Storage Flush Gap (`background.js` lines 1488-1506, 974-988):**  
   `saveStorageData()` only flushed `CONFIG.STORAGE_KEY` (`activityData`). `saveMediaHistory()` was an isolated function only called on explicit session finalization. Under Chrome MV3 service worker lifecycle rules, inactive workers are terminated after 30 seconds; because media history was not part of debounced `scheduleStorageSave()` or `saveStorageData()`, all active or recent sessions were lost on service worker restart.
5. **Dynamic Active Session Sync Gap in `GET_DASHBOARD_DATA` (`background.js` lines 2953-2985):**  
   When the dashboard requested fresh telemetry via `GET_DASHBOARD_DATA`, `background.js` did not flush active in-progress playing media sessions into `mediaHistory` before responding, meaning in-progress media was invisible in the dashboard.
6. **Dashboard Truthiness Array Bug (`dashboard/dashboard.js` line 4623):**  
   In `renderMediaAnalyticsTab(data)`, the code used:  
   `const history = data.mediaHistory || mediaHistoryData || [];`  
   In JavaScript, empty arrays `[]` evaluate to truthy (`Boolean([]) === true`). When `data.mediaHistory` was returned as `[]`, JavaScript evaluated `[] || mediaHistoryData` to `[]`, discarding `mediaHistoryData` even when populated from the SQLite Data Hub (`recent_media_sessions`).
7. **Search/Filter/Sort Table Wipe Bug (`dashboard/dashboard.js` lines 7708-7736):**  
   Event listeners for media search, platform filter, and sort called `renderMediaAnalyticsTab(dashboardData)`. When `dashboardData.mediaHistory` was empty, every keystroke or filter toggle triggered the truthiness bug and wiped the table clean.

### 1.2 The Architectural Solution
1. **Phase 1: Background Service Worker Telemetry & Session Management Overhaul (`background.js`)**
   - Fix foreground duration accumulation in the 5-second delta loop: ensure `session.watchDuration` accumulates correctly for all playing sessions (foreground and background). Only route background domain time deltas to `commitBackgroundMediaDelta`.
   - Implement SPA/YouTube navigation detection: when `trackMediaSession` receives a new video URL or distinct media source in the same `tabId`, automatically finalize the previous session and initialize a clean, independent session.
   - Refactor `tabs.onUpdated` to handle HTML5 `pushState` / history changes.
2. **Phase 2: Debounced Storage Persistence, MV3 Lifecycle Hydration, and Active Session Sync (`background.js`)**
   - Deeply integrate `CONFIG.MEDIA_HISTORY_STORAGE_KEY` into `saveStorageData()` and `scheduleStorageSave()`.
   - Add dynamic active session synchronization inside `GET_DASHBOARD_DATA`: flush current active playing sessions into `mediaHistory` before delivering the telemetry payload.
   - Harden `loadStorageData()` to hydrate, deduplicate, and sort `mediaHistory` with fallback recovery.
3. **Phase 3: Dashboard Rendering, Truthiness Fix, Dynamic Merging & Search/Sort Resilience (`dashboard/dashboard.js`)**
   - Fix array truthiness bug: evaluate array length `(Array.isArray(data.mediaHistory) && data.mediaHistory.length > 0)`.
   - Implement smart union and deduplication between extension local `mediaHistory` and Data Hub `recent_media_sessions`.
   - Update `dashboardData.mediaHistory` in memory to ensure search, filter, and sort listeners retain and render records without wiping the table.
4. **Phase 4: Comprehensive Test Suite & Independent QA Verification Gate (`tests/test_media_playback_history_backend_fix.js`)**
   - Develop an authoritative 8-battery test suite verifying foreground duration accumulation, SPA transitions, storage persistence, active session sync, dashboard truthiness, search/filter resilience, Trusted Types security, and AST syntax.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Suite | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Background Telemetry & Session Overhaul | `background.js` | Level 4 Backend Engineer | `node -c background.js`<br>`node tests/test_timer_and_dual_media_tracking.js` | ✅ COMPLETED |
| **02** | Storage Persistence & Active Session Sync | `background.js` | Level 4 Backend Engineer | `node -c background.js`<br>`node tests/test_tab_switch_and_storage_persistence.js` | ✅ COMPLETED |
| **03** | Dashboard Rendering & Truthiness Resilience | `dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -c dashboard/dashboard.js`<br>`node tests/test_media_tab_switch_and_i18n.js` | ✅ COMPLETED |
| **04** | Comprehensive Verification & Independent QA | `tests/test_media_playback_history_backend_fix.js` | Level 4 QA Verification Tester | Full workspace test suite execution (`node run_all_tests.js`) | ✅ COMPLETED (55/55 PASS) |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `background.js` | Foreground heartbeat stomping in lines 3959-3978 prevents `session.watchDuration` accumulation in foreground tabs. | Accumulate `elapsedSec` into `session.watchDuration` for all playing sessions; branch only `commitBackgroundMediaDelta` for `!isForeground`. | Foreground video/audio playback correctly accrues watch duration and logs to history. | Phase 1 | `node tests/test_timer_and_dual_media_tracking.js` |
| **2** | `background.js` | SPA & YouTube in-tab video navigation does not detect URL changes, failing to finalize previous video. | In `trackMediaSession`, compare `payload.url` with `session.url`. If video identity differs, finalize previous session and spawn new session. | Every watched YouTube video in an SPA session creates a distinct history entry. | Phase 1 | `node tests/test_media_playback_history_backend_fix.js` |
| **3** | `background.js` | `saveStorageData()` omits `CONFIG.MEDIA_HISTORY_STORAGE_KEY`, risking data loss on MV3 worker termination. | Include `[CONFIG.MEDIA_HISTORY_STORAGE_KEY]: mediaHistory.slice(0, CONFIG.MAX_MEDIA_HISTORY)` in `saveStorageData()`. | Media history is persistently flushed on every debounced save cycle. | Phase 2 | `node tests/test_tab_switch_and_storage_persistence.js` |
| **4** | `background.js` | `GET_DASHBOARD_DATA` does not flush active playing sessions into `mediaHistory` before responding. | Iterate `activeMediaSessions`, compute elapsed deltas, and upsert into `mediaHistory` prior to sending dashboard response. | In-progress media playback is immediately visible in the dashboard without requiring pause. | Phase 2 | `node tests/test_media_playback_history_backend_fix.js` |
| **5** | `dashboard/dashboard.js` | `[] || mediaHistoryData` evaluates to `[]` due to array truthiness, discarding Data Hub records. | Check `Array.isArray(arr) && arr.length > 0` and merge background + Data Hub records with ID deduplication. | Media history table displays full history whether sourced from extension storage or Data Hub. | Phase 3 | `node tests/test_media_tab_switch_and_i18n.js` |
| **6** | `dashboard/dashboard.js` | Search, filter, and sort listeners call `renderMediaAnalyticsTab(dashboardData)` with stale/empty arrays. | Cache unified media history into `dashboardData.mediaHistory` and bind search/filter to the active dataset. | Search, platform filtering, and sorting work seamlessly without clearing the table. | Phase 3 | `node tests/test_media_playback_history_backend_fix.js` |
| **7** | `tests/test_media_playback_history_backend_fix.js` | Need deterministic automated test suite covering all 6 root causes. | Author 8-battery comprehensive test suite validating backend telemetry, storage, sync, frontend rendering, and security. | 100% test pass rate with exit code 0; zero regressions across existing 50 test suites. | Phase 4 | `node run_all_tests.js` |

---

## 🔒 4. Constitutional Guardrails & Invariants

1. **Zero W3C Trusted Types Mutation Breaches:** No `innerHTML`, `outerHTML`, or raw HTML injection in `dashboard.js`. All table rows and badges must be created using `document.createElement` and `textContent`.
2. **Non-Breaking Extension IPC:** `GET_DASHBOARD_DATA`, `CLEAR_MEDIA_HISTORY`, and `SET_MEDIA_VOLUME` message contracts must remain 100% backward-compatible.
3. **Remainder Preservation in Telemetry:** All elapsed millisecond calculations must retain fractional remainders (`session.lastHeartbeat += elapsedSec * 1000`) to prevent drift and sub-second loss.
4. **UTF-8 with BOM Standard:** All modified or newly created files must be saved with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
5. **No Regressions in 50 Existing Test Suites:** Running `node run_all_tests.js` must pass 51 of 51 test suites cleanly with exit code 0.
