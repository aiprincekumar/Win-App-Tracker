# Phase 03: Web Activity & Time Tracker Core Engine (`background.js`)

> **Phase ID:** `phase_03_activity_time_tracker`  
> **Parent Task:** `browser_detection_extension_v1`  
> **Department:** Department 02: Solution Architecture & Department 06: Systems Engineering  
> **Assigned Role:** `background_service_worker_lead`  
> **Status:** Ready for Execution  

---

## 1. Objective & Scope

Implement the core time tracking engine inside `background.js` (Manifest V3 Service Worker). This engine functions as an enterprise-grade clone and enhancement of "Web Activity Time Tracker". It tracks exact active user presence per domain, handles window focus and tab activation transitions, pauses tracking on system/browser idle or lock, counts session visits, aggregates data across three temporal dimensions (`Today`, `Daily Avg`, `Total`), and periodically flushes state to `chrome.storage.local`.

---

## 2. Core Functional Requirements

### 2.1 Tab & Window Lifecycle Management
- **Active Tab Tracking (`chrome.tabs.onActivated`):**
  When a user switches from Tab A (`github.com`) to Tab B (`youtube.com`), close the active interval on Tab A, credit the elapsed active time to `github.com`, and open a new active tracking interval for `youtube.com`.
- **Window Focus (`chrome.windows.onFocusChanged`):**
  When the browser loses focus (`WINDOW_ID_NONE`), immediately pause all active domain timers to prevent counting time while the user is working in VS Code, Word, or another desktop app.
- **URL Navigation (`chrome.tabs.onUpdated`):**
  Detect domain transitions within an existing tab (e.g. from `google.com` search to `en.wikipedia.org`). Credit time to the old domain and start the new domain timer.
- **Tab Destruction (`chrome.tabs.onRemoved`):**
  Finalize any open tracking interval for the closed tab.

### 2.2 System & User Idle Management (`chrome.idle`)
- Configure idle detection threshold (`chrome.idle.setDetectionInterval(60)` = 60 seconds).
- Listen to `chrome.idle.onStateChanged`:
  - `'idle'`: User has not touched keyboard/mouse for 60 seconds. Pause active domain counters.
  - `'locked'`: Windows lock screen (Win + L) or screensaver. Immediately freeze all counters.
  - `'active'`: User returned. Resume tracking the currently focused active tab.

### 2.3 Domain Aggregation Data Model (`chrome.storage.local`)
Structure the stored data systematically to facilitate instant rendering in the popup:
```json
{
  "activity_data": {
    "domains": {
      "youtube.com": {
        "favicon": "https://www.google.com/s2/favicons?domain=youtube.com&sz=32",
        "totalSeconds": 14520,
        "sessionCount": 24,
        "lastActive": 1730680000000,
        "days": {
          "2026-11-04": { "seconds": 3840, "sessions": 5 },
          "2026-11-03": { "seconds": 5400, "sessions": 8 }
        }
      },
      "github.com": {
        "favicon": "https://www.google.com/s2/favicons?domain=github.com&sz=32",
        "totalSeconds": 8900,
        "sessionCount": 15,
        "lastActive": 1730679000000,
        "days": {
          "2026-11-04": { "seconds": 2100, "sessions": 3 }
        }
      }
    },
    "historyDaysCount": 14,
    "firstTrackedDate": "2026-10-21"
  }
}
```

### 2.4 Three Temporal Dimension Metrics
1. **Today (`todayTime`):** Sum of seconds spent on each domain during the current date (`YYYY-MM-DD`).
2. **Daily Average (`dailyAvg`):** `totalSeconds / totalTrackedDays` for each domain and overall.
3. **Total (`totalTime`):** Cumulative lifetime seconds since extension installation.

### 2.5 MV3 Keep-Alive & Alarm Discipline
Manifest V3 Service Workers terminate after ~30 seconds of inactivity.
- Register a repeating alarm (`chrome.alarms.create('flush_and_heartbeat', { periodInMinutes: 1 })`).
- In `chrome.alarms.onAlarm`, flush in-memory buffers to storage and verify connection state.

---

## 3. Acceptance Criteria & Test Gate

- [ ] Accurate calculation of seconds spent per domain without time leakage.
- [ ] Switching tabs cleanly closes the previous domain interval and starts the new one.
- [ ] Minimizing browser or alt-tabbing to another app suspends tracking.
- [ ] Data persists safely across browser restarts in `chrome.storage.local`.
- [ ] Computes Today, Daily Average, and Total accurately.
