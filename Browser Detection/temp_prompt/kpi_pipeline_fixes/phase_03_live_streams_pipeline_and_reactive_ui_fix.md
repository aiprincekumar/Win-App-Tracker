# Phase 3: Live Streams Pipeline & Reactive UI Fix

> **Phase Spec File:** `temp_prompt/kpi_pipeline_fixes/phase_03_live_streams_pipeline_and_reactive_ui_fix.md`  
> **Initiative:** Web Activity & Media Sentinel - KPI Telemetry Pipeline Stabilization  
> **Target Subsystem:** Tab B Media Analytics Bento Grid Card 5 (`#mediaMetricActiveStreams`)  
> **Assigned Department:** Dept 05 Frontend Engineering & Dept 06 Backend & API Engineering  
> **Execution Gate:** Level 4 Subagent Dispatch requires `AUTH-MGR-*` token from Level 2 Manager  

---

## 🎯 1. Phase Objective

Fix the end-to-end data pipeline and real-time reactive UI for the **Active Live Streams** KPI (Tab B, Card 5) so that active broadcast/live sessions are detected by `background.js`, preserved through `getAllActiveMediaStreams()`, and reactively reflected in the dashboard UI on both asynchronous poll completion and `LIVE_MEDIA_UPDATE` IPC broadcasts.

---

## 📂 2. File Anchors & Prerequisites

- **Primary Target File 1:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) (lines 3200-3275: `getAllActiveMediaStreams`, lines 4698-4720: `GET_DASHBOARD_DATA`)
- **Primary Target File 2:** [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js) (lines 351-380: `pollMultiTabMediaStreams`)
- **Primary Target File 3:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) (lines 3060-3075: `pollMultiTabMediaStreams`, lines 7536-7572: `updateMediaAnalyticsKpiView`, lines 12400-12410: `LIVE_MEDIA_UPDATE` listener)

---

## 🛠️ 3. Surgical Implementation Instructions

1. **Populate `isLive` in `getAllActiveMediaStreams()` (`background.js`):**
   - In `getAllActiveMediaStreams()` (line ~3233):
     - In the object set into `streamMap.set(Number(tabId), { ... })`, add:
       `isLive: Boolean(pm.isLive || pm.duration === Infinity || mediaState.isLive || duration === Infinity),`
   - In the `chrome.tabs.query` fallback loop (line ~3270):
     - If existing entry updated, maintain `existing.isLive = Boolean(existing.isLive || false)`.

2. **Refine Stream Filter in `src/dashboard/features/media_deck_visualizer_feature.js`:**
   - In `pollMultiTabMediaStreams()` (lines 367-375):
     - Ensure the sanitization filter accepts live streams:
       ```javascript
       return Boolean(
         s.isAudible === true ||
         s.playbackState === 'playing' ||
         (typeof s.duration === 'number' && s.duration > 0) ||
         s.hasMedia === true ||
         s.isLive === true ||
         s.duration === Infinity
       );
       ```

3. **Wire Reactive Re-render upon Poll Resolution in `dashboard/dashboard.js`:**
   - In `pollMultiTabMediaStreams(options)` (lines 3060-3072):
     - When `viz.pollMultiTabMediaStreams(opt)` resolves:
       ```javascript
       activeMediaStreams = streams || [];
       if (typeof updateMediaAnalyticsKpiView === 'function' && Array.isArray(mediaHistoryData)) {
         updateMediaAnalyticsKpiView(mediaHistoryData, null, activeMediaStreams);
       }
       return activeMediaStreams;
       ```

4. **Wire Reactive Re-render on `LIVE_MEDIA_UPDATE` IPC in `dashboard/dashboard.js`:**
   - In `browserAPI.runtime.onMessage.addListener` (lines 12400-12408):
     - When `message.type === 'LIVE_MEDIA_UPDATE'`:
       ```javascript
       if (message && message.type === 'LIVE_MEDIA_UPDATE') {
         if (currentTab === 'media') {
           const pm = message.payload && message.payload.primaryMedia;
           if (pm) renderHeroMediaPlayer(pm);
           if (typeof updateMediaAnalyticsKpiView === 'function') {
             updateMediaAnalyticsKpiView(mediaHistoryData, pm, activeMediaStreams);
           }
         }
       }
       ```

---

## 🚫 4. Architectural Constraints & Out-of-Scope

- DO NOT block synchronous page rendering waiting for `pollMultiTabMediaStreams`.
- Keep function length strictly <= 50 lines (Universal Rule 28).
- Maintain 100% W3C Trusted Types zero-innerHTML safety and UTF-8 with BOM.

---

## 🧪 5. Local Verification Gate

- Run targeted node test: `node -e "const kpi = require('./src/dashboard/features/media_analytics_kpi_feature.js'); console.log(kpi.computeActiveLiveStreamsCount([{ isLive: true }, { duration: Infinity }, { duration: 120 }]));"`
- Verify output is `2`.
- Verify UTF-8 with BOM across modified files.
