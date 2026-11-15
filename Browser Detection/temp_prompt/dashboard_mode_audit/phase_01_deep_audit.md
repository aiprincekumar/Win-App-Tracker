# Phase 1: Deep Codebase & Runtime Audit Specification
# फेज़ 1: गहन कोडबेस एवं रनटाइम ऑडिट निर्देशिका

> **दस्तावेज़ प्रकार (Document Type):** Phase 1 Actionable Execution Prompt  
> **कार्यक्षेत्र कंटेनर (Workspace Container):** `temp_prompt/dashboard_mode_audit/`  
> **असाइन की गई भूमिका (Assigned Role):** Level 4 Sub Agent (Full-Stack Engineer / Codebase Auditor)  
> **प्राथमिक प्राधिकरण (Primary Authority):** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎯 1. Phase Objective

Perform an exhaustive, line-by-line empirical audit of all 6 Dashboard Mode subsystems within `dashboard/dashboard.html` (877 lines), `dashboard/dashboard.js` (3,113 lines), `dashboard/dashboard.css`, and modular files in `src/dashboard/`. Validate which controls are fully working, which are partially deficient, and which are unlinked UI stubs.

---

## 📋 2. Step-by-Step Execution Tasks

1. **Audit Sidebar & Connectors:**
   - Verify tab navigation event listeners (`navTabTracking`, `navTabMedia`, `navTabSettings`).
   - Audit WebSocket reconnection handlers for Video Detector HUD (`btnSidebarReconnect`) and SQLite Data Hub (`btnSidebarReconnectHub`).
2. **Audit Top App Bar & Multi-Browser Filters:**
   - Audit `#browserFilterSelect` change listeners and data query pipelines.
   - Audit `#trackingModeSelect` (Combined vs Active Only vs BG Media).
   - Audit `#btnLangToggle` and verify runtime language switching without DOM detachment.
3. **Audit Tab A (Time Tracking Analytics):**
   - Trace metric card calculations (`trackMetricTodayTime`, `trackMetricDailyAvg`, `trackMetricTotalTime`, `trackMetricTopDomain`).
   - Audit temporal subtab toggling (`today`, `daily`, `total`) and check SVG donut chart recalculation.
   - Audit domain table search input (`#tableDomainSearch`), category selector (`#domainCategorySelect`), and sort selector (`#tableSortSelect`).
4. **Audit Tab B (Media Analytics & Hero Player Controls):**
   - Audit hero playback controls (`btnHeroPlayPause`, `btnHeroRewind`, `btnHeroForward`, `btnHeroMute`, speed stepper).
   - Audit video timeline progress scrubber and live volume slider draggable pointer events.
   - Audit advanced mode buttons (`btnHeroFullscreen`, `btnHeroPip`, `btnHeroTheater`, `btnHeroSwitchTab`, quality stepper).
   - Audit media history table filtering and sorting.
5. **Audit Tab C (Settings, Sleep Sentinel & Danger Zone):**
   - Verify general settings saving (`saveDashboardSettings`).
   - **Crucial Check:** Inspect `cardSleepSettings` and confirm the complete lack of bindings for `#btnSaveSleepSettings` and sleep controls.
   - Audit CSV and JSON export functions (`exportFullJson`, `exportTimeTrackingCsv`, `exportMediaHistoryCsv`).
   - Audit Danger Zone modal confirmation workflow and data wipe handlers.

---

## 🛡️ 3. Deliverables Manifest & Verification Gate

- **Deliverable:** Empirical audit findings compiled and verified ready for Phase 2.
- **Verification Gate:**
  ```powershell
  node tests/test_syntax_and_manifest_integrity.js
  node tests/test_dashboard_multi_browser_filter.js
  ```
  Both test suites must exit with code 0.
