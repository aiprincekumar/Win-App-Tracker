# Phase 2: Muted Sessions Telemetry Fix

> **Phase Spec File:** `temp_prompt/kpi_pipeline_fixes/phase_02_muted_sessions_telemetry_fix.md`  
> **Initiative:** Web Activity & Media Sentinel - KPI Telemetry Pipeline Stabilization  
> **Target Subsystem:** Tab B Media Analytics Bento Grid Card 9 (`#mediaMetricMutedSessions`)  
> **Assigned Department:** Dept 06 Backend & API Engineering & Dept 05 Frontend Engineering  
> **Execution Gate:** Level 4 Subagent Dispatch requires `AUTH-MGR-*` token from Level 2 Manager  

---

## 🎯 1. Phase Objective

Fix the end-to-end data pipeline for the **Muted Sessions Count** KPI (Tab B, Card 9) so that media sessions played with audio muted (tab muted, video element muted, or volume at 0) have their mute state captured by the service worker, persisted into `mediaHistory`, and accurately aggregated by `media_analytics_kpi_feature.js`.

---

## 📂 2. File Anchors & Prerequisites

- **Primary Target File 1:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) (lines 2650-2670: `newSession`, lines 2620-2640: existing session update, lines 2845-2880: `updateMediaHistoryEntry`)
- **Primary Target File 2:** [`src/dashboard/features/media_analytics_kpi_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_analytics_kpi_feature.js) (lines 65-75: `computeMutedSessionsCount`, lines 125-135: `aggregateMediaAnalyticsKpis`)
- **Primary Target File 3:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) (lines 7536-7572: `updateMediaAnalyticsKpiView`)

---

## 🛠️ 3. Surgical Implementation Instructions

1. **Capture Mute State in Service Worker Session Lifecycle (`background.js`):**
   - In `handleMediaReport`:
     - When creating `newSession` (line ~2650): add `isMuted: Boolean((pm && pm.isMuted) || vol === 0)`.
     - When updating existing `session` (line ~2620): update `session.isMuted = Boolean((pm && pm.isMuted) || (vol === 0) || session.isMuted)`.
   - In `handleTabAudibleStateChange` or tab muting handlers: ensure `session.isMuted` is updated if the Chrome tab is muted (`tab.mutedInfo.muted`).

2. **Persist `isMuted` in `updateMediaHistoryEntry` (`background.js`):**
   - In `updateMediaHistoryEntry(session, persist)` (line ~2847):
     - In the constructed `entry` object, include:
       `isMuted: Boolean(session.isMuted || session.averageVolume === 0 || session.volume === 0 || (Array.isArray(session.volumeSamples) && session.volumeSamples.length > 0 && session.volumeSamples.every(v => v === 0))),`

3. **Enhance KPI Aggregator in `src/dashboard/features/media_analytics_kpi_feature.js`:**
   - In `computeMutedSessionsCount(history, activeStreams)`:
     - Filter `history` entries where `s.isMuted === true || s.muted === true || s.averageVolume === 0 || s.volume === 0 || (Array.isArray(s.volumeSamples) && s.volumeSamples.length > 0 && s.volumeSamples.every(v => v === 0))`.
     - Also check `activeStreams`: count any currently active streams where `s.isMuted === true || s.volume === 0` that are not already finalized in history.
     - Universal Rule 28 compliance: Function must remain <= 35 lines, nesting depth <= 2.

4. **Synchronize Dashboard View (`dashboard/dashboard.js`):**
   - In `updateMediaAnalyticsKpiView(history, pm, activeStreams)`:
     - Verify `#mediaMetricMutedSessions` element receives `textContent = String(kpi.mutedSessionsCount);`.
     - Preserve zero-innerHTML and UTF-8 with BOM.

---

## 🚫 4. Architectural Constraints & Out-of-Scope

- DO NOT alter existing volume metrics (`avgVolume`, `peakVolume`, `lowVolume`).
- Keep function length strictly <= 50 lines per Universal Rule 28.
- Strictly maintain UTF-8 with BOM on all touched files.

---

## 🧪 5. Local Verification Gate

- Run targeted node test: `node -e "const kpi = require('./src/dashboard/features/media_analytics_kpi_feature.js'); console.log(kpi.computeMutedSessionsCount([{ isMuted: true }, { averageVolume: 0 }, { averageVolume: 80 }]));"`
- Verify output is `2`.
- Verify UTF-8 with BOM on `background.js`, `media_analytics_kpi_feature.js`, and `dashboard.js`.
