# Web Activity & Media Sentinel - Dashboard Future Features (8 Capabilities Across 4 Phases)
## Live Tracking Board & Problem-Solution Dossier

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Standard:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md) & Universal Rule 22  
> **Master Specification Anchor:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Ephemeral Container:** `temp_prompt/dashboard_future_features_8_phases/`  
> **Decision Gate Assessment:** `PROMPT_FILES_REQUIRED = YES` (Explicit Multi-Phase Architectural Assessment: 8 major features, 4 test gates, high cross-module surface area)  
> **Recommended Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomous Forward Momentum, Autonomy Score: 1.0)  

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 Architectural Context & Current Limitations
The **Web Activity & Media Sentinel** dashboard serves as the central command and analytics hub for browser telemetry and media control. While the foundational dashboard reliably renders today's metrics, SVG donut charts, domain analytics tables, live hero media player, and Audio Lab DSP controls, it currently exhibits several critical architectural gaps:

1. **Rigid Temporal Filtering & Lack of Chrono-Distribution (Feature 1):**
   - *Current State:* Users can only inspect `Today`, `Daily Avg`, and `Total Time`. There is zero visibility into Yesterday, Past 7 Days, Past 30 Days, or arbitrary Custom Ranges. Furthermore, there is no spatial representation of 24-hour daily focus or media consumption patterns.
   - *Solution:* Dynamic temporal filter bar (`Today`, `Yesterday`, `7 Days`, `30 Days`, `Custom Range` datepicker) paired with a high-performance 7x24 Chrono-Distribution Heatmap matrix (168 hourly intensity cells), Focus vs. Media mode switcher, hover tooltips, and Week-over-Week (WoW) delta metrics.

2. **Absence of Cognitive Productivity Scoring (Feature 2):**
   - *Current State:* All visited websites are lumped into coarse "Websites" or "Internal" classifications without contextual understanding of productive work vs. entertainment or distraction.
   - *Solution:* Standard 5-tier taxonomy (`Work & Dev`, `Learning & Research`, `Entertainment & Media`, `Social & Communication`, `Utilities & Tools`) coupled with a mathematical Productivity Scoring formula ($0-100$), radial gauge visualization, and 1-click inline domain category override with instant re-calculation and `chrome.storage.local` persistence.

3. **Single Hero Media Isolation (Feature 3):**
   - *Current State:* Only the most recently active media tab is rendered in the hero card. If a user has YouTube Music playing in the background, a tutorial video paused in another window, and a podcast muted elsewhere, only one can be observed or controlled.
   - *Solution:* Multi-Tab Live Media Deck scanning all audible and media-holding browser tabs, rendering an interactive card deck with favicons, playback states, mini scrubbers, volume sliders, "Solo Tab" mode (instantly muting all other tabs), and "Global Mute Others".

4. **Blind Audio DSP State Feedback (Feature 4):**
   - *Current State:* While the Audio Lab provides 5-band EQ and master volume boost sliders, the user receives zero visual confirmation of dynamic frequency response, amplitude, or signal clipping.
   - *Solution:* 60fps hardware-accelerated HTML5 Canvas Audio Visualizer (`#canvasAudioVisualizer`) with dual operational modes (32-Band FFT Frequency Bars with peak-hold dots, and Oscilloscope Waveform trace), stereo VU peak level meters with +0dB clipping indicators, and a zero-CPU idle sleep loop when paused or hidden.

5. **Fragile Backup & Unidirectional Storage Silo (Feature 5):**
   - *Current State:* Dashboard only provides a raw JSON export and a destructive clear data button. It lacks JSON import, schema validation, daily rollback snapshots, and bidirectional SQLite Data Hub synchronization.
   - *Solution:* Robust JSON Backup Importer with v2.0 schema validation, 3 conflict resolution strategies (`Merge` [recommended], `Overwrite`, `Append-Only`), automatic 7-day rolling daily snapshots (`snapshot_YYYY_MM_DD`), and bidirectional replication with the local SQLite Data Hub daemon (`ws://127.0.0.1:65433`).

6. **Missing Print-Ready Executive Reporting (Feature 6):**
   - *Current State:* Export is limited to CSV tabular dumps, forcing users to manually construct presentation slides or client digests.
   - *Solution:* Zero-dependency `@media print` CSS engine for crisp, formatted A4/Letter PDF generation (hiding navigation buttons, sidebars, and search inputs while styling KPI cards and tables), SVG vector chart print optimization, and 1-click standalone offline self-contained HTML report download.

7. **Zero Privacy Filtering & Project Annotation (Feature 7):**
   - *Current State:* Sensitive local development hosts (`localhost:3000`, `127.0.0.1:8080`) and internal portals are recorded without filter options; critical client domains cannot be pinned to the top of the analytics table.
   - *Solution:* Starred/pinned domain hierarchy, inline domain project notes with search integration, and a comprehensive Privacy Exclusion Blacklist engine supporting wildcards (`localhost:*`, `192.168.*:*`) with a strict zero-tracking background policy and retroactive purge capability.

8. **Unchecked Screen Fatigue & Doom-Scrolling (Feature 8):**
   - *Current State:* The extension passively logs time without guiding healthy digital habits or preventing infinite scroll traps.
   - *Solution:* Digital Wellbeing Sentinel with per-domain daily time budgets (80% gentle warning, 100% budget reached badge), scroll velocity monitor detecting infinite doom-scrolling with non-intrusive "Take a Breath" pauses, and an integrated Pomodoro timer (25m Focus / 5m Break) that gently pauses media and chimes at break intervals.

---

## 🚦 2. Phase Status & Execution Checklist

| Phase # | Phase Title & Subsystems | Target Features | Primary Target Files | Status | Assigned Role | Gate Verification Test Suite |
| :---: | :--- | :---: | :--- | :---: | :--- | :--- |
| **Phase 1** | Temporal Engine & Productivity Classifier | Features 1 & 2 | `dashboard/dashboard.html`<br>`dashboard/dashboard.js`<br>`dashboard/dashboard.css`<br>`src/dashboard/` | `PENDING` | Level 4 Frontend Engineer | `tests/test_dashboard_features_phase1.js` |
| **Phase 2** | Multi-Tab Live Media Deck & Audio Visualizer | Features 3 & 4 | `dashboard/dashboard.html`<br>`dashboard/dashboard.js`<br>`dashboard/dashboard.css`<br>`background.js`<br>`src/` | `PENDING` | Level 4 Full-Stack Engineer | `tests/test_dashboard_features_phase2.js` |
| **Phase 3** | Data Integrity, Backup, Snapshots & SQLite Sync | Features 5 & 6 | `dashboard/dashboard.html`<br>`dashboard/dashboard.js`<br>`dashboard/dashboard.css` | `PENDING` | Level 4 Systems / Data Engineer | `tests/test_dashboard_features_phase3.js` |
| **Phase 4** | Wellbeing Sentinel, Annotations & Blacklist | Features 7 & 8 | `dashboard/dashboard.html`<br>`dashboard/dashboard.js`<br>`dashboard/dashboard.css`<br>`background.js`<br>`content_media.js` | `PENDING` | Level 4 Full-Stack Engineer | `tests/test_dashboard_features_phase4.js` |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix (Universal Rule 20)

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html`<br>`dashboard/dashboard.js` | Lack of multi-day temporal filtering (`Yesterday`, `7d`, `30d`, `custom`) and absence of hourly distribution visualization. | Implement `aggregateChronoHeatmap()` and 168-cell 7x24 CSS/Canvas grid with Focus vs. Media mode toggling and hover tooltips. | Users gain full granular insight into hourly browsing and media habits across flexible date ranges. | Phase 1 | `tests/test_dashboard_features_phase1.js` |
| **2** | `dashboard/dashboard.js`<br>`dashboard/dashboard.html` | All domains treated homogenously as generic "Websites", preventing insight into productive vs. distracting usage. | Introduce 5-tier domain category taxonomy, dynamic 0-100 productivity formula, radial gauge, and 1-click inline category override. | Instant visual productivity index with user-controlled categorization persisted in `chrome.storage.local`. | Phase 1 | `tests/test_dashboard_features_phase1.js` |
| **3** | `dashboard/dashboard.html`<br>`background.js`<br>`dashboard/dashboard.js` | Dashboard only renders a single hero media card, ignoring other concurrent audible/media tabs. | Implement `DASHBOARD_GET_ALL_MEDIA_STREAMS` IPC, multi-tab card deck, mini-scrubbers, "Solo Tab" mode, and "Global Mute Others". | Simultaneous multi-stream visibility and individual or bulk remote control from a single pane. | Phase 2 | `tests/test_dashboard_features_phase2.js` |
| **4** | `dashboard/dashboard.html`<br>`dashboard/dashboard.js`<br>`dashboard/dashboard.css` | Audio Lab DSP settings lack visual spectrum feedback; users cannot see EQ filter cuts or amplitude peaks. | Implement hardware-accelerated `#canvasAudioVisualizer` (32-band FFT bars & oscilloscope waveform) with peak-hold and idle sleep loop. | Studio-grade real-time audio visualization running at 60fps with zero idle CPU overhead. | Phase 2 | `tests/test_dashboard_features_phase2.js` |
| **5** | `dashboard/dashboard.js`<br>`dashboard/dashboard.html` | Fragile JSON export only; zero JSON import/restore, missing validation, no rolling snapshots, and unidirectional SQLite hub sync. | Build JSON importer with v2.0 schema validation, 3 conflict modes (Merge/Overwrite/Append), 7-day rolling snapshots, and two-way SQLite Hub replication. | Bulletproof data resilience, disaster recovery rollback, and bidirectional multi-device sync with SQLite daemon. | Phase 3 | `tests/test_dashboard_features_phase3.js` |
| **6** | `dashboard/dashboard.css`<br>`dashboard/dashboard.js` | Only raw CSV export exists; no print-ready executive digest for clients or personal review. | Implement `@media print` CSS engine hiding chrome/buttons, executive summary header, vector charts, and 1-click standalone offline HTML digest. | Beautiful, print-ready A4/Letter PDF reports and standalone shareable HTML summaries generated in 1 click. | Phase 3 | `tests/test_dashboard_features_phase3.js` |
| **7** | `background.js`<br>`dashboard/dashboard.js`<br>`dashboard/dashboard.html` | Sensitive local development hosts (`localhost`, `127.0.0.1`) cannot be excluded from tracking; key domains cannot be pinned. | Implement Privacy Tracking Exclusion Blacklist in `background.js` (strict 0-tracking policy), retroactive purge, and starred domain pinning. | Absolute privacy for confidential/local workflows and prioritized visibility for starred client domains. | Phase 4 | `tests/test_dashboard_features_phase4.js` |
| **8** | `dashboard/dashboard.js`<br>`content_media.js`<br>`dashboard/dashboard.html` | Passive time tracking does not prevent digital exhaustion, doom-scrolling, or long unbroken work sessions. | Add per-domain daily time budgets with visual badges, doom-scroll velocity detection nudge, and integrated Pomodoro timer with auto-pause chimes. | Active digital wellbeing guard protecting users from burnout and involuntary infinite scroll traps. | Phase 4 | `tests/test_dashboard_features_phase4.js` |

---

## 🧭 4. Implementation Strategy Recommendation

- **Selected Strategy:** `STRATEGY_A_AUTONOMOUS` (Fully Autonomous Forward Momentum)
- **Target Autonomy Score:** `1.0`
- **Architectural Rationale:**
  1. The complete architectural blueprint, TypeScript interfaces, IPC protocols, HTML layouts, and test gate assertions are 100% specified in [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md).
  2. Every phase has an isolated, deterministic verification test gate (`test_dashboard_features_phase1.js` through `test_dashboard_features_phase4.js`).
  3. The implementation cleanly builds upon the certified modular architecture (`src/core/feature_registry.js` and `dashboard_feature_manager.js`) without disrupting core background telemetry or existing popup controls.
  4. Per Universal Rule 15, all changes will be committed locally autonomously upon passing each phase gate, maintaining forensic momentum without blocking the user.
  5. *Alternative Option:* If the user requests interactive visual verification of Phase 1 before Phase 2 begins, Level 2 Manager can switch execution to `STRATEGY_B_SINGLE_CONSULTATION` or `STRATEGY_C_PHASE_CONSULTATION`.

---

## 🔒 5. Mandatory Constitutional & Technical Invariants

All executing subagents MUST uphold these 5 invariants across all 4 phases:
1. **Zero Telemetry Loss Invariant:** All in-memory temporal data must be committed atomically to `chrome.storage.local` within 5-second intervals.
2. **MV3 Lifecycle Resilience:** Use `chrome.alarms` and persistent storage tokens; no in-memory state loss on Service Worker termination.
3. **W3C Trusted Types & Zero-innerHTML Policy:** Strict prohibition on raw `innerHTML = ...`. Use `document.createElement`, `textContent`, `setAttribute`, and sanitized nodes exclusively.
4. **Sub-10ms Render Budget:** All visualizer animations and DOM updates must use `requestAnimationFrame` with idle throttling. Canvas stops rendering when paused or hidden.
5. **Dual-Core SQLite Sync Invariant:** Extension local storage and desktop SQLite daemon (`ws://127.0.0.1:65433`) maintain bidirectional sync parity without destructive overwrites.
6. **Strict UTF-8 with BOM (`0xEF, 0xBB, 0xBF`):** Mandatory encoding for all modified files.
7. **Node.js AST Syntax Cleanliness (`node -c`):** 0 syntax errors across all touched files.
