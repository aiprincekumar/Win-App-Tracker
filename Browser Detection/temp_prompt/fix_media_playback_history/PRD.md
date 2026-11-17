# Media Playback History Restoration: Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/fix_media_playback_history/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target System:** Web Activity & Media Sentinel  
> **Creation Timestamp:** 2026-11-17  

---

## 👤 1. User Personas & Problem Scenarios

### Persona 1: Atul (Power User & Multitasking Developer)
- **Goal:** Tracks daily computer and media consumption, monitors YouTube tutorials, music streaming, and podcasts alongside coding sessions.
- **Pain Point:** Opens YouTube, watches several 15-minute technical tutorials in foreground and background tabs. Opens the Media Sentinel Dashboard to inspect watch history and volume analytics, but the Media History table is completely empty ("No media sessions recorded yet").
- **Requirement:** Expects every video watched for at least 1 second to appear in the Media Playback History table with title, platform, duration, volume metrics, and date.

### Persona 2: Productivity Analyst (Data-Driven User)
- **Goal:** Uses search, platform filters, and CSV export to audit media consumption trends across YouTube, Netflix, Spotify, and Twitch.
- **Pain Point:** Searching in the Media History search box or switching platform filters wipes out the table display because empty/stale state triggers an array truthiness reset.
- **Requirement:** Searching, filtering by platform, and sorting by duration or date must filter existing history smoothly without losing records.

---

## 🎯 2. Functional Requirements (FR)

| Req ID | Title | Description | MoSCoW |
| :--- | :--- | :--- | :---: |
| **FR-01** | Foreground Media Duration Accrual | `background.js` must accumulate `session.watchDuration` for playing media when the tab is active and browser is focused. | **MUST HAVE** |
| **FR-02** | Background Media Duration Accrual | Background media playback must continue accumulating `session.watchDuration` and routing domain deltas to `commitBackgroundMediaDelta`. | **MUST HAVE** |
| **FR-03** | SPA / YouTube In-Tab Video Detection | Navigating to a new video within the same tab must automatically finalize the completed video and start a clean session for the incoming video. | **MUST HAVE** |
| **FR-04** | Atomic Storage Persistence | `saveStorageData()` and `scheduleStorageSave()` must persist both `activityData` and `mediaHistory` atomically to `chrome.storage.local`. | **MUST HAVE** |
| **FR-05** | Active Session Live Hydration | `GET_DASHBOARD_DATA` must sync currently playing active sessions into `mediaHistory` before responding. | **MUST HAVE** |
| **FR-06** | Truthiness Fallback & Data Hub Union | `dashboard.js` must evaluate `Array.isArray(arr) && arr.length > 0` and merge Data Hub analytics with extension history without data loss. | **MUST HAVE** |
| **FR-07** | Resilient Search, Filter & Sort | Search input, platform filter dropdown, and sort dropdown must operate on cached unified media history without wiping the UI. | **MUST HAVE** |
| **FR-08** | CSV Export Parity | CSV export must export the complete active media history dataset accurately formatted per RFC 4180. | **SHOULD HAVE** |

---

## ⚡ 3. Non-Functional Requirements (NFR)

| NFR ID | Category | Requirement Specification |
| :--- | :--- | :--- |
| **NFR-01** | **Performance & Debounce** | Disk writes to `chrome.storage.local` must remain debounced at 1.5 seconds (`scheduleStorageSave()`) to prevent SSD wear and Chrome quota exhaustion. |
| **NFR-02** | **Memory Cap & GC** | `mediaHistory` array in memory and storage must be capped at `CONFIG.MAX_MEDIA_HISTORY` (500 items) using FIFO truncation (`slice(0, 500)`). |
| **NFR-03** | **Precision & Remainder** | All duration calculations must retain fractional milliseconds (`session.lastHeartbeat += elapsedSec * 1000`) to guarantee sub-second accuracy. |
| **NFR-04** | **Security & CSP** | 100% W3C Trusted Types compliance: zero `innerHTML`, zero `outerHTML`, zero inline event handlers in `dashboard.js`. |
| **NFR-05** | **Bilingual i18n Parity** | All table headers, filter placeholders, and empty state messages must support English and authentic Hindi strings. |
| **NFR-06** | **Test Coverage** | 100% pass rate across all 50 existing test suites plus the new dedicated test suite (`tests/test_media_playback_history_backend_fix.js`). |

---

## 📖 4. INVEST-Compliant User Stories

### Story 1: Accurate Foreground Video Tracking
- **As a** user watching a video in an active browser tab,
- **I want** the extension to accurately track the duration I spent watching that video,
- **So that** my watch history accurately reflects my real media consumption.

### Story 2: YouTube Playlist & Next Video Transition
- **As a** user listening to a YouTube playlist or clicking related videos,
- **I want** each individual video to be logged as a separate entry in my Media History,
- **So that** I have a granular record of every song or lecture I watched.

### Story 3: Persistent History Across Browser Restarts
- **As a** user who closes and reopens Chrome frequently,
- **I want** my Media Playback History to be saved reliably in local storage,
- **So that** restarting Chrome or service worker hibernation does not erase my history.

### Story 4: Reliable Dashboard History Table
- **As a** user viewing the Media Analytics tab in the dashboard,
- **I want** the Media History table to immediately display my recorded videos, and allow searching and filtering without disappearing,
- **So that** I can easily review, find, and analyze my past media sessions.

---

## 🚦 5. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Foreground Playback Accumulation
- **Given** a user is playing a video on `youtube.com` in the active foreground tab (`tabId === activeTabId && isBrowserFocused === true`),
- **When** 15 seconds elapse during playback,
- **Then** `session.watchDuration` must be incremented by 15 seconds, and `updateMediaHistoryEntry(session, false)` must upsert the session into `mediaHistory`.

### Contract 2: SPA Video Navigation in Same Tab
- **Given** an active media session exists for `https://www.youtube.com/watch?v=VIDEO_A`,
- **When** the user clicks a new video that updates the page to `https://www.youtube.com/watch?v=VIDEO_B` in the same tab,
- **Then** `finalizeMediaSession(tabId)` must be invoked for `VIDEO_A` (committing it to `mediaHistory`), and a new session must be created for `VIDEO_B` with `watchDuration: 0`.

### Contract 3: Storage Persistence
- **Given** new entries exist in `mediaHistory` in background memory,
- **When** `saveStorageData()` is executed or debounced via `scheduleStorageSave()`,
- **Then** `chrome.storage.local.set` must be called with `[CONFIG.MEDIA_HISTORY_STORAGE_KEY]: mediaHistory`.

### Contract 4: Dashboard Array Truthiness Fallback
- **Given** `data.mediaHistory` is an empty array `[]` and `mediaHistoryData` contains 5 records from Data Hub,
- **When** `renderMediaAnalyticsTab(data)` is executed,
- **Then** the table must render the 5 records from `mediaHistoryData` rather than an empty state.

### Contract 5: Search & Filter Non-Destructive Filtering
- **Given** 10 media history items are displayed in the dashboard table,
- **When** the user types "YouTube" into `#tableMediaSearch` or selects "YouTube" in `#tableMediaPlatformFilter`,
- **Then** only matching items must be displayed, and clearing the filter must restore all 10 items without wiping the table.
