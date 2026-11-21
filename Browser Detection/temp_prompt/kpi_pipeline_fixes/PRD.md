# Product Requirements Document (PRD): 3 KPI Data Pipeline Fixes

> **Document Path:** `temp_prompt/kpi_pipeline_fixes/PRD.md`  
> **Initiative:** Web Activity & Media Sentinel - KPI Telemetry Pipeline Stabilization  
> **Lead Department:** Dept 01 Product Requirements  
> **Date:** 2026-11-21  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Daily Focus & Productivity Tracker (Atul)
- **Problem:** When reviewing Tab A (Time Tracking), Card 9 ("Peak Activity Hour") consistently displays `--:--`, giving the false impression that time-of-day analytics are broken despite hours of active browser usage.
- **Need:** Instantly see which hour of the day had the highest concentration of active browsing (e.g. `14:00 - 15:00`), matching the Chrono-Activity Heatmap data.

### Persona 2: Multi-Tab Audio & Media Operator
- **Problem:** When reviewing Tab B (Media Analytics), Card 9 ("Muted Sessions") constantly displays `0`, even after spending hours playing background videos on mute or using tab-level muting.
- **Need:** Accurate historical count of media sessions that were played silently or muted.

### Persona 3: Live Stream & Broadcast Viewer
- **Problem:** When watching Twitch, YouTube Live, or live audio broadcasts, Card 5 ("Live Streams") stays at `0` upon opening the dashboard and doesn't update unless manually refreshed.
- **Need:** Instant, reactive display of active live stream sessions with real-time UI updates when streams start or end.

---

## 📑 2. Functional Requirements (FR)

- **FR-01 (Peak Activity Hour Ingestion):** The time tracking KPI module MUST ingest hourly telemetry recorded by `background.js` and `dashboard.js` from `dayEntry.hourlyBuckets`.
- **FR-02 (Peak Activity Hour Calculation):** The system MUST aggregate active seconds across all domains for each hour (0 to 23) of the active date, identify the hour with the highest duration, and format it as `HH:00 - HH:00`.
- **FR-03 (Fallback Graceful Degradation):** If zero activity is recorded for the date, the peak activity hour MUST display `--:--`.
- **FR-04 (Muted Session Recording):** `background.js` MUST record `isMuted: true` on active media sessions when `pm.isMuted === true`, `tab.mutedInfo.muted === true`, or audio volume is 0.
- **FR-05 (Muted Session Persistence):** `updateMediaHistoryEntry()` MUST persist `isMuted: true` into the serialized history record in `mediaHistory`.
- **FR-06 (Muted Sessions KPI Aggregation):** `computeMutedSessionsCount()` MUST count all history sessions where `isMuted === true`, `muted === true`, or `averageVolume === 0`.
- **FR-07 (Live Stream Detection in Streams API):** `getAllActiveMediaStreams()` in `background.js` MUST populate `isLive: true` for any stream where `duration === Infinity`, `pm.isLive === true`, or `mediaState.isLive === true`.
- **FR-08 (Reactive Live Streams KPI Update):** `dashboard.js` MUST immediately update the Live Streams Bento Card (`#mediaMetricActiveStreams`) as soon as `pollMultiTabMediaStreams()` resolves and whenever `LIVE_MEDIA_UPDATE` is received.

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Performance & Latency):** KPI re-calculations MUST take less than 5ms for up to 100 media history entries and 50 domain records.
- **NFR-02 (Code Modularity & Rule 28 Compliance):** All new or refactored functions MUST be <= 50 lines (target <= 30 lines) with maximum cyclomatic/nesting depth <= 3.
- **NFR-03 (Security & W3C Trusted Types):** ZERO `innerHTML` injections; all DOM text updates MUST strictly use `textContent` or `document.createTextNode()`.
- **NFR-04 (Encoding Standard):** 100% of created and modified files MUST adhere to UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
- **NFR-05 (Zero Secret Leaks):** Zero credentials or sensitive data in code or tests; certified by `gitleaks detect --redact`.

---

## 📐 4. Given-When-Then Acceptance Criteria

```gherkin
Feature: Accurate KPI Data Pipelines

  Scenario: Peak Activity Hour correctly computes from hourlyBuckets
    Given an activity data payload containing domain "github.com" with hourlyBuckets at hour 14 having 3600 seconds
    And domain "youtube.com" with hourlyBuckets at hour 14 having 1200 seconds
    When computePeakActivityHour is executed for today's date
    Then the returned peak hour string must be "14:00 - 15:00"

  Scenario: Peak Activity Hour returns fallback when no hourly data exists
    Given an empty activity data payload with no recorded hourlyBuckets
    When computePeakActivityHour is executed
    Then the returned peak hour string must be "--:--"

  Scenario: Muted media session is preserved in history and counted in KPI
    Given an active video playback session where audio was muted (isMuted: true)
    When the session duration exceeds 5 seconds and updateMediaHistoryEntry is invoked
    Then the resulting mediaHistory entry must contain isMuted: true
    And computeMutedSessionsCount must increment the muted count by 1

  Scenario: Live stream is recognized and reactively updates Card 5
    Given an active tab playing a stream with duration Infinity
    When getAllActiveMediaStreams is called
    Then the stream record must contain isLive: true
    And when pollMultiTabMediaStreams resolves, the DOM element #mediaMetricActiveStreams must show the updated count
```
