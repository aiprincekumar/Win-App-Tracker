# Product Requirements Document (PRD): Manifest V3 Robust Time Tracking Reconciliation & Keepalive

> **Task Container:** `temp_prompt/robust_time_tracking_reconciliation/`  
> **Document Type:** Product Requirements Document (PRD)  
> **Lead Department:** Dept 01 Product Requirements (`departments_archive/01_product_requirements_dept.md`)  
> **Governing Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 👥 1. Target Personas & User Needs

1. **The Deep-Work Analyst / Power User:**  
   - Spends 45+ minutes reading technical documentation, GitHub issues, or research papers on a single webpage without clicking or switching tabs.  
   - Expects every minute of active reading to be accurately logged in daily reports, charts, and HUD analytics.  
   - Frustrated when 45 minutes of intense research shows up as "24 seconds" due to background service worker termination.
2. **The Quantified-Self & Productivity Tracker:**  
   - Relies on hourly chronometric heatmaps and daily totals to budget leisure vs deep work.  
   - Expects strict boundary adherence: closing the laptop or walking away must NEVER add ghost hours to active time.
3. **The Privacy-Conscious Developer:**  
   - Maintains local development sites (`localhost`, `127.0.0.1`, intranet IPs) and private domains on a strict tracking blacklist.  
   - Demands that no background ports, keepalives, or telemetry tokens are ever created or transmitted for blacklisted domains.

---

## 🎯 2. Functional Requirements (FR)

| Requirement ID | Capability | Description & Acceptance Gate |
| :--- | :--- | :--- |
| **FR-1** | **Continuous Active Time Tracking** | Track active browsing time with 1-second accuracy during prolonged reading sessions on a single tab without tab switching. |
| **FR-2** | **Service Worker Lifecycle Reconciliation** | When the Manifest V3 Service Worker suspends and later wakes up, it must reconcile elapsed duration using persistent storage timestamps, recovering uncredited browsing time up to `MAX_RECONCILE_DRIFT_MS` (45s). |
| **FR-3** | **Foreground Heartbeat Keepalive** | The active foreground tab must maintain a long-lived keepalive port (`sentinel_tracking_keepalive`) with periodic 15-second heartbeat telemetry while `document.visibilityState === 'visible'`. |
| **FR-4** | **Clean Port Disconnection & Interval Finalization** | When a tab is switched, hidden, closed, or navigated away, the keepalive port must disconnect cleanly, and the Service Worker must immediately commit and finalize active seconds. |
| **FR-5** | **System Sleep & Hibernation Drift Guard** | If the computer enters sleep or hibernation (elapsed gap > 60s without heartbeat), the system must finalize tracking at `lastHeartbeatTime + 15s` and discard the sleep void. |
| **FR-6** | **Privacy Blacklist Gating** | Domains matching `trackingBlacklist` (e.g., `localhost`, IP patterns, user blacklist) must NEVER open keepalive ports, NEVER transmit heartbeats, and NEVER record seconds. |
| **FR-7** | **Idle State Synchronization** | When `chrome.idle.onStateChanged` signals `'idle'` or `'locked'`, active interval tracking must pause immediately until the user returns. |

---

## ⚡ 3. Non-Functional Requirements (NFR)

1. **NFR-1: Ultra-Low CPU & Battery Footprint:**  
   The keepalive mechanism must consume less than 0.1% CPU. Heartbeats are restricted to a 15-second cadence with micro-payloads (< 100 bytes) and zero DOM queries.
2. **NFR-2: Zero Memory Leaks & Event Teardown:**  
   All port listeners, heartbeat intervals, and observers must be strictly cleaned up on page unload, navigation, or extension context invalidation.
3. **NFR-3: Chrome Web Store & MV3 Policy Compliance:**  
   Must fully comply with Chrome Manifest V3 service worker lifecycle guidelines without using disallowed hacks (such as continuous fake audio playback or infinite web worker loops).
4. **NFR-4: Code Modularity & Quality (Universal Rule 28):**  
   All newly authored feature functions must not exceed 50 lines; cyclomatic nesting depth must not exceed 3; strict W3C zero-innerHTML compliance must be maintained.
5. **NFR-5: Backward Data Parity:**  
   The underlying `activityData.domains[domain].days[date]` schema must remain 100% backward-compatible with the existing dashboard, popup, and native HUD WebSocket bridge.

---

## 📜 4. INVEST-Compliant User Stories

- **US-01:** *As a developer reading API docs for 30 minutes, I want my active browsing time to be recorded continuously without dropping seconds, so that my daily productivity report reflects my actual study time.*
- **US-02:** *As a laptop user, I want the extension to stop accumulating time immediately when I close my laptop lid, so that my work stats are not artificially inflated by hours of sleep.*
- **US-03:** *As a user switching between tabs, I want the extension to cleanly finalize the previous tab's session and begin tracking the new active tab without overlapping seconds or duplicate counts.*
- **US-04:** *As a privacy-minded engineer, I want localhost and my company's staging servers to be completely excluded from tracking and keepalive ports, so that sensitive URLs are never processed.*

---

## 🧪 5. Given-When-Then Acceptance Criteria Contracts

### Scenario 1: Prolonged Static Reading on a Single Tab
- **Given** the user is viewing `https://developer.mozilla.org/en-US/docs/Web/API` on the active foreground tab
- **And** the user remains on this page for 25 minutes without switching tabs or resizing the window
- **When** the Service Worker suspends after 30 seconds of browser inactivity
- **Then** the Content Script keepalive port transmits a heartbeat ping every 15 seconds
- **And** the Service Worker stays alive or wakes up to process the heartbeat
- **And** the total tracked time for `developer.mozilla.org` increases by exactly 1500 seconds (±15s margin of error).

### Scenario 2: Laptop Closed / System Hibernation
- **Given** the user is actively tracking `https://github.com`
- **When** the user closes their laptop lid for 4 hours
- **And** the computer wakes up 4 hours later
- **Then** `reconcileTrackingSessionOnStartup()` detects an elapsed gap of 14,400,000 ms (> 60,000 ms sleep threshold)
- **And** the engine caps the final session time to `lastHeartbeatTime + 15s`
- **And** the 4 hours of sleep are completely excluded from tracked domain seconds.

### Scenario 3: Tab Switching & Clean Disconnection
- **Given** Tab A (`wikipedia.org`) is currently active and tracking
- **When** the user clicks on Tab B (`stackoverflow.com`)
- **Then** the keepalive port for Tab A disconnects
- **And** `background.js` executes `commitActiveInterval()` for `wikipedia.org`
- **And** Tab B establishes a new keepalive port
- **And** `background.js` anchors `intervalStartTime` for `stackoverflow.com` without data corruption.

### Scenario 4: Blacklisted Host Navigation
- **Given** the tracking blacklist includes `localhost` and `127.0.0.1:*`
- **When** the user navigates to `http://localhost:3000/dashboard`
- **Then** the Content Script checks `matchesTrackingBlacklist()` and DOES NOT establish a keepalive port
- **And** `background.js` sets `activeDomain = null`
- **And** zero seconds are accumulated for `localhost`.

### Scenario 5: User Inactivity (Idle Detection)
- **Given** the user is on an active website
- **When** the user steps away from the keyboard and `chrome.idle.onStateChanged` fires `'idle'`
- **Then** `background.js` sets `isUserActive = false`
- **And** commits the active interval immediately
- **And** rejects further keepalive heartbeat time accumulation until state returns to `'active'`.

---

## 📊 6. MoSCoW Feature Prioritization

- **Must Have:**
  - Persistent session storage schema `sentinel_active_session` in `storage.session` / `storage.local`.
  - Service Worker wakeup reconciliation engine with bounded drift cap (`MAX_RECONCILE_DRIFT_MS = 45s`).
  - Active tab keepalive port (`sentinel_tracking_keepalive`) in content script with 15s heartbeat.
  - Background `runtime.onConnect` port listener with `onDisconnect` finalization.
  - Sleep / hibernation gap detection (`SLEEP_THRESHOLD_MS = 60s`).
  - Strict privacy blacklist bypass.
- **Should Have:**
  - Dynamic exponential backoff reconnection if port disconnects unexpectedly while tab is still visible.
  - Tab visibility state change listener (`visibilitychange`) pausing/resuming keepalive pings immediately.
- **Could Have:**
  - Visual status indicator in Popup showing live keepalive connection state (connected / paused / blacklisted).
- **Won't Have (Out of Scope for this Task):**
  - Continuous audio element or web worker background hacks (violates Chrome Web Store guidelines).
  - Tracking incognito tabs without explicit user permission.

---
