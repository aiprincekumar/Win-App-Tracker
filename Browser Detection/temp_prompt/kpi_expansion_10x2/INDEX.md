# 10x2 KPI Expansion for Time Tracking & Media Analytics: Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`, `locales/en.json`, `locales/hi.json`, `tests/`  
> **Lead Departments:** Dept 01 (Product & Planning), Dept 05 (Frontend Engineering), Dept 06 (UI/UX Design), Dept 08 (QA & Testing)  
> **Selected Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Limitations & Deficiencies
1. **Asymmetric & Sparse KPI Layouts:**
   - **Time Tracking View (Tab A):** Currently contains an uneven set of 6 cards (`trackingMetricsGrid`) mixing different span sizes (`bento-span-3`, `bento-span-4`) leaving awkward negative spaces and lacking granular behavioral analytics such as active domain counts, leisure/distraction time breakdown, peak activity hours, and longest continuous focus intervals.
   - **Media Analytics View (Tab B):** Currently renders 6 loosely structured metric cards (`bento-span-4`) directly in `#tabContentMediaAnalytics` without a dedicated container grid, lacking essential playback intelligence such as top streaming platforms, active live streams count, muted playback sessions frequency, and longest single media session duration.
2. **Missing Key Productivity & Media Signals:**
   - Users cannot see at a glance how many discrete domains were navigated today vs total time.
   - No immediate distinction between productive deep focus vs leisure/distraction web activity.
   - Media view lacks visibility into live streams vs recorded videos and does not surface audio etiquette (muted session metrics).
3. **Responsive Inconsistencies:**
   - The current mix of `bento-span-3` and `bento-span-4` causes irregular card wrapping on 1440p, 1080p, and tablet viewports instead of a clean, symmetrical dashboard layout.

### 1.2 The Architectural Solution: Symmetrical 10x2 Bento Grid
Expand both the **Time Tracking View** and the **Media Analytics View** to feature **exactly 10 KPI cards each**, structured in a symmetrical **5 x 2 grid (2 rows of 5 cards)** using high-performance Liquid-Glass Bento styling:

#### A. Time Tracking View (10 KPIs across 2 Rows of 5 Cards)
- **Row 1 (Macro Time & Productivity):**
  1. **Today's Active Time:** Total browser active duration today (`#trackMetricTodayTime`).
  2. **Daily Average:** Rolling average daily usage over tracked history (`#trackMetricDailyAvg`).
  3. **Total Tracked Time:** Lifetime tracked time across all recorded dates (`#trackMetricTotalTime`).
  4. **Productivity Index:** Radial gauge & tier badge (Deep Focus, Balanced, Leisure) (`#valProductivityScore`, `#badgeProductivityTier`).
  5. **Deep Focus Time:** Dedicated focus session duration & count (`#trackMetricFocusTime`, `#trackMetricFocusSessions`).
- **Row 2 (Behavioral & Session Intelligence):**
  6. **Top Website (Peak Site):** Leading domain and active share (`#trackMetricTopDomain`, `#trackMetricTopDomainTime`).
  7. **Active Domains Count:** Number of distinct domains visited today (`#trackMetricActiveDomains`, `#subMetricActiveDomains`).
  8. **Distraction / Leisure Time:** Total time spent on entertainment/social platforms (`#trackMetricDistractionTime`, `#subMetricDistractionTime`).
  9. **Peak Activity Hour:** Hour of the day with the highest navigation intensity (`#trackMetricPeakHour`, `#subMetricPeakHour`).
  10. **Longest Continuous Session:** Duration of the longest uninterrupted browsing burst (`#trackMetricLongestSession`, `#subMetricLongestSession`).

#### B. Media Analytics View (10 KPIs across 2 Rows of 5 Cards)
- **Row 1 (Playback Volume & Platform Intelligence):**
  1. **Total Watch Time:** Aggregate video/audio playback duration (`#mediaMetricTotalWatch`).
  2. **Avg Watch per Video:** Mean consumption duration per media item (`#mediaMetricAvgWatch`).
  3. **Total Media Sessions:** Total number of initiated media playback sessions (`#mediaMetricSessionsCount`).
  4. **Top Media Platform:** Dominant media streaming platform (e.g., YouTube, Netflix, Spotify) (`#mediaMetricTopPlatform`).
  5. **Active Live Streams:** Real-time count of active live media streams (`#mediaMetricActiveStreams`).
- **Row 2 (Acoustic Metrics & Session Duration):**
  6. **Average Volume:** Mean audio output level across sessions (`#mediaMetricAvgVolume`).
  7. **Peak Volume Recorded:** Highest audio level detected (`#mediaMetricPeakVolume`).
  8. **Lowest Volume:** Minimum audible volume recorded (`#mediaMetricLowVolume`).
  9. **Muted Sessions Count:** Number of sessions played in muted/silent state (`#mediaMetricMutedSessions`).
  10. **Longest Media Session:** Longest single media playback duration recorded (`#mediaMetricLongestSession`).

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name & Focus | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | HTML Semantic Markup & 5x2 Bento Grid Layout | `dashboard/dashboard.html`<br>`dashboard/dashboard.css` | Level 4 Frontend / UI Engineer | Inspect DOM structure & CSS syntax | ⏳ READY |
| **02** | Data Aggregation, Calculation Algorithms & State Engine | `dashboard/dashboard.js`<br>`src/dashboard/features/` | Level 4 Core Logic Engineer | Verify calculations & Trusted Types | ⏳ READY |
| **03** | Bilingual English & Hindi (i18n) Parity | `locales/en.json`<br>`locales/hi.json` | Level 4 i18n Specialist | `node -e "require('./locales/en.json'); require('./locales/hi.json'); console.log('JSON Valid')"` | ⏳ READY |
| **04** | Comprehensive Verification, Rule 28 Audit & Master QA | `tests/test_kpi_expansion_10x2.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_kpi_expansion_10x2.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | Time Tracking tab has 6 cards with uneven bento spans (`bento-span-3`). | Restructure `#trackingMetricsGrid` into a dedicated 10-card container (`kpi-grid-5x2`) hosting 2 symmetrical rows of 5 cards. | Symmetrical layout, zero awkward gaps, complete KPI metrics. | Phase 1 | DOM query test for 10 cards |
| **2** | `dashboard/dashboard.html` | Media Analytics tab has 6 loose cards with `bento-span-4` polluting tab root. | Wrap media KPI cards in dedicated `#mediaMetricsGrid` with `kpi-grid-5x2` containing 10 cards (2 rows of 5). | Clean visual hierarchy, symmetrical alignment matching Tab A. | Phase 1 | DOM query test for 10 cards |
| **3** | `dashboard/dashboard.css` | Lack of responsive 5x2 CSS Grid class supporting 5 columns on desktop and graceful wrapping on tablet/mobile. | Introduce `.kpi-grid-5x2` using `grid-template-columns: repeat(5, minmax(0, 1fr))` with 1200px (3 cols), 768px (2 cols), and 480px (1 col) media queries. | Flawless responsive layout across all desktop, laptop, and tablet viewports. | Phase 1 | Responsive CSS inspection |
| **4** | `dashboard/dashboard.js` | Time tracking update logic only computes 6 metrics; missing active domains, leisure time, peak hour, longest session. | Implement pure calculation functions (each <= 50 lines per Rule 28) to aggregate new metrics from `activityData` and update DOM via W3C Trusted Types. | Rich real-time analytical insights with zero innerHTML security risks. | Phase 2 | `node tests/test_kpi_expansion_10x2.js` |
| **5** | `dashboard/dashboard.js` | Media analytics update logic only computes 6 metrics; missing top platform, live streams, muted sessions, longest session. | Implement extraction functions for `mediaHistory` and `activeMediaStreams` to derive top platform, live stream count, muted count, and longest session. | Full acoustic and platform intelligence for media sessions. | Phase 2 | `node tests/test_kpi_expansion_10x2.js` |
| **6** | `locales/en.json` & `locales/hi.json` | Missing localized translation keys for 8 new KPI labels, tooltips, and subtexts. | Add all 8 new metric keys in both `en.json` and `hi.json` with 100% bilingual parity. | Seamless language switching with zero raw untranslated strings. | Phase 3 | i18n parity validation script |
| **7** | `src/dashboard/features/focus_advanced_suite.js` | Pre-existing Rule 28 violation in `bindFocusAdvancedEventListeners` (54 lines > 50 max) causing test failure. | Refactor `bindFocusAdvancedEventListeners` into modular helper functions strictly <= 50 lines. | 100% passage across all 89 master test suites in `run_all_tests.js`. | Phase 4 | `node run_all_tests.js` |
| **8** | `tests/test_kpi_expansion_10x2.js` | Absence of regression test suite validating 20 KPI cards, 5x2 layout, data aggregation, and i18n parity. | Author dedicated 8-battery automated test suite verifying all 20 cards and calculations. | Guarantees zero regressions and Grade A+ verification signoff. | Phase 4 | `node tests/test_kpi_expansion_10x2.js` (PASSED) |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **Zero-Code Hard Lock:** Level 1 CEO and Level 2 Manager do NOT author or edit code. Level 4 Subagents execute all changes with explicit `AUTH-MGR-*` token.
2. **W3C Trusted Types Zero-innerHTML Compliance:** All DOM updates must strictly use `textContent`, `setAttribute`, or safe DOM builders. Never assign `innerHTML`.
3. **Universal Rule 28 Modularity Hard Limit:** Every newly created or edited function must strictly remain <= 50 lines, nesting depth <= 3.
4. **UTF-8 with BOM Standard:** All touched `.html`, `.css`, `.js`, and `.json` files must strictly retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
5. **Universal Rule 15 Autonomous Commit:** Autonomously commit all local changes immediately upon completion with informative commit messages.
