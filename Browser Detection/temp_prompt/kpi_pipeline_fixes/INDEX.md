# Live Tracking Board & Problem-Solution Dossier: 3 KPI Data Pipeline Fixes

> **Tracking Board Path:** `temp_prompt/kpi_pipeline_fixes/INDEX.md`  
> **Initiative:** Web Activity & Media Sentinel - KPI Data Pipeline Stabilization  
> **Target Subsystem:** Time Tracking Bento Grid (Tab A) & Media Analytics Bento Grid (Tab B)  
> **Specialist Advisory:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Date:** 2026-11-21  
> **Status:** SPECIFICATION READY (Level 4 Subagents PAUSED pending Manager `AUTH-MGR-*`)

---

## 📋 1. Executive Problem-Solution Summary

| KPI Metric Name | Bento Card Location | Current Broken Behavior | Root Cause | Proposed Target Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **Peak Activity Hour** | Tab A: Card 9 (`#trackMetricPeakHour`) | Always displays `'--:--'` | `computePeakActivityHour` expects `data.hourlyBreakdown` / `data.hourlyActivity`, but real telemetry is stored under `dayEntry.hourlyBuckets[hour]`. | Update `time_tracking_kpi_feature.js` to extract and aggregate domain `hourlyBuckets`, computing the peak 60-minute window. |
| **Muted Sessions Count** | Tab B: Card 9 (`#mediaMetricMutedSessions`) | Always displays `0` | `updateMediaHistoryEntry` in `background.js` strips `isMuted` when creating history entries; `activeMediaSessions` omits mute state. | Propagate `isMuted` in `background.js` session lifecycle & history entries; enhance `media_analytics_kpi_feature.js`. |
| **Active Live Streams** | Tab B: Card 5 (`#mediaMetricActiveStreams`) | Statically `0`, non-reactive | `getAllActiveMediaStreams` omits `isLive`; `pollMultiTabMediaStreams` resolves asynchronously without notifying KPI view; IPC ignores KPI cards. | Propagate `isLive` in `background.js`; trigger reactive KPI refresh on poll completion and `LIVE_MEDIA_UPDATE` broadcast. |

---

## 🚦 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `src/dashboard/features/time_tracking_kpi_feature.js` | `computePeakActivityHour` checks non-existent `data.hourlyBreakdown[todayStr]` and `data.hourlyActivity` arrays. | Inspect `data.hourlyBuckets`, `data.activityData.domains[d].days[today].hourlyBuckets`, and `stats.hourlyBuckets`. | Accurate peak hour string (e.g., `'14:00 - 15:00'`) rendered when hourly telemetry exists; graceful `'--:--'` fallback. | Phase 1 | Battery 1 & 5 in `test_kpi_pipeline_fixes.js` |
| **2** | `dashboard/dashboard.js` | `updateTimeTrackingKpiView` does not pass merged `hourlyBuckets` from `aggregateDomainsHistoryMap` into KPI aggregator. | Pass `data.activityData` and aggregated `hourlyBuckets` to `TimeTrackingKpiFeature.aggregateTimeTrackingKpis`. | Bento Card 9 accurately reflects highest activity window across all tracked domains. | Phase 1 | `npm test` & Battery 1 |
| **3** | `background.js` | `updateMediaHistoryEntry` builds history `entry` object without `isMuted` / `muted` properties; `newSession` creation ignores `pm.isMuted`. | Track `session.isMuted = Boolean(pm.isMuted || vol === 0)` and include `isMuted` in history `entry` schema. | Permanent history entries retain muted state for post-session telemetry. | Phase 2 | Battery 2 in `test_kpi_pipeline_fixes.js` |
| **4** | `src/dashboard/features/media_analytics_kpi_feature.js` | `computeMutedSessionsCount` only inspects `history` and relies on `s.isMuted === true` or `s.volume === 0`. | Enhance matcher to evaluate `isMuted`, `muted`, `averageVolume === 0`, and active muted streams. | Card 9 reflects cumulative muted playback sessions accurately. | Phase 2 | Battery 2 in `test_kpi_pipeline_fixes.js` |
| **5** | `background.js` | `getAllActiveMediaStreams()` omits `isLive` property in returned stream records mapped from `tabMediaMap`. | Include `isLive: Boolean(pm.isLive || pm.duration === Infinity || mediaState.isLive)` in stream object. | Streams correctly recognized by live stream classifiers across visualizer and KPIs. | Phase 3 | Battery 3 in `test_kpi_pipeline_fixes.js` |
| **6** | `dashboard/dashboard.js` | `pollMultiTabMediaStreams` updates `activeMediaStreams` asynchronously without updating KPI view; `LIVE_MEDIA_UPDATE` ignores KPI. | Call `updateMediaAnalyticsKpiView` upon stream resolution and inside `LIVE_MEDIA_UPDATE` IPC handler. | Card 5 updates dynamically and reactively without manual dashboard reload. | Phase 3 | Battery 4 in `test_kpi_pipeline_fixes.js` |
| **7** | `tests/test_kpi_pipeline_fixes.js` | Test suite for KPI pipeline fixes does not exist. | Create dedicated 7-battery standalone verification suite. | 100% test pass rate with exit code 0; master suite parity. | Phase 4 | `node tests/test_kpi_pipeline_fixes.js` & `node run_all_tests.js` |

---

## 📈 3. Phase Status Checklist

- [ ] **Phase 1: Peak Activity Hour Pipeline Fix** (`phase_01_peak_activity_hour_pipeline_fix.md`)
- [ ] **Phase 2: Muted Sessions Telemetry Fix** (`phase_02_muted_sessions_telemetry_fix.md`)
- [ ] **Phase 3: Live Streams Pipeline & Reactive UI Fix** (`phase_03_live_streams_pipeline_and_reactive_ui_fix.md`)
- [ ] **Phase 4: Verification & Test Suite Synchronization** (`phase_04_verification_and_test_suite_synchronization.md`)
