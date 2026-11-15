# Dashboard Mode Feature Audit & Phased Roadmap: Live Tracking Board
# डैशबोर्ड मोड (Dashboard Mode) फीचर ऑडिट व फेज़-वाइज़ रोडमैप: लाइव ट्रैकिंग बोर्ड

> **दस्तावेज़ प्रकार (Document Type):** Live Ephemeral Tracking Board & Problem-Solution Dossier  
> **कार्यक्षेत्र कंटेनर (Workspace Container):** `temp_prompt/dashboard_mode_audit/`  
> **लक्ष्य सिस्टम (Target System):** Web Activity & Media Sentinel (MV3 Full-Page Dashboard)  
> **प्राथमिक प्राधिकरण (Primary Authority):** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **विशेषज्ञ विशिष्टता (Specialist Specification):** [`C:\Users\Atul Verma\.gemini\config\rules\PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **सक्रिय कार्य मेमोरी (Active Working Memory):** [`C:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **बनाया गया (Created At):** 2026-11-15T17:55:00+05:30  
> **गेट स्थिति (Gate State):** `READY_FOR_MANAGER_DECISION`  
> **अनुशंसित रणनीति (Recommended Strategy):** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Summary

### The Problem / समस्या
Following the successful audit and roadmap completion of **Popup Mode**, a rigorous and comprehensive audit is required for **Dashboard Mode** (`dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`, and `src/dashboard/`) of the **Web Activity & Media Sentinel** browser extension. 

The dashboard serves as the enterprise-grade analytics, historical telemetry, and system control hub. While several components (such as basic time tracking, live hero player controls, and WebSocket status) are actively implemented, a deep architectural evaluation reveals potential UI stubs, unlinked event listeners, desynchronized settings, and missing backend connections. Specifically:
- **Sleep Timer & Inactivity Sentinel Card (`cardSleepSettings`):** Full HTML controls exist (`#settingDefaultSleepDuration`, `#settingSleepFadeToggle`, `#settingFadeDuration`, `#settingInactivitySleepToggle`, `#settingInactivityThreshold`, `#settingBadgeCountdownToggle`, `#btnSaveSleepSettings`), but `dashboard/dashboard.js` has ZERO bindings, listeners, or storage synchronization for them.
- **SQLite Data Hub vs Local Storage Filter Synchronization:** Multi-browser filtering and tracking modes require deterministic parity between local Chrome storage and external SQLite Data Hub WAL sync.
- **Export Integrity:** CSV export generators must guarantee robust CSV RFC 4180 escaping for complex media titles and domain metadata.
- **Bilingual i18n Consistency:** Verification that all dashboard cards, tooltips, dialogs, and dynamic empty states are 100% localized in English and Hindi.

The user mandates two tangible deliverables:
1. **File 1 (`dashboard_non_working_functions.md`):** A clear, empirical inventory classifying all working, partially deficient, and non-working/stubbed features across all Dashboard subsystems.
2. **File 2 (`dashboard_phase_wise_plan.md`):** A comprehensive phase-wise implementation roadmap, detailed procedures, architectural specifications, and deterministic test gates explaining how each defect will be implemented/resolved.

### The Solution / समाधान
A structured 4-phase execution blueprint designed to deliver exhaustive transparency, preserve working code with zero regression, and establish a rock-solid remediation path:
- **Phase 1: Deep Codebase & Runtime Audit:** Comprehensive empirical audit of all 6 Dashboard subsystems (Sidebar & Connectors, Top App Bar & Multi-Browser Filter, Tab A Time Tracking & Charts, Tab B Media Analytics & Remote Hero Controls, Tab C Settings & Sleep Sentinel, Data Hub & Danger Zone).
- **Phase 2: Generation of File 1 (`dashboard_non_working_functions.md`):** Detailed defect and stub catalog with DOM IDs, severity ratings, root cause summaries, and working vs non-working statistics.
- **Phase 3: Generation of File 2 (`dashboard_phase_wise_plan.md`):** Comprehensive architectural roadmap, step-by-step procedures, code blueprints, and state machine transitions, with real-time synchronization to active memory (`project_feature_memory.md` & `memory.md`).
- **Phase 4: Independent QA Verification & Review:** Execution of all extension test suites, syntax check (`node -c`), in-memory AST evaluation (`vm.Script`), UTF-8 BOM encoding validation, and final Grade A+ signoff.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Target Deliverables | Assigned Agent Role | Status | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **Phase 1** | Deep Codebase & Runtime Audit | Empirical evaluation matrix across all 6 Dashboard subsystems | Sub Agent (Full-Stack / Systems Auditor) | `PENDING` | `PENDING` |
| **Phase 2** | Generation of File 1 (Defect Inventory) | `dashboard_non_working_functions.md` in workspace root | Sub Agent (Technical Documentation Writer) | `PENDING` | `PENDING` |
| **Phase 3** | Generation of File 2 (Phased Roadmap) & Memory Sync | `dashboard_phase_wise_plan.md` in workspace root & `memory.md` sync | Sub Agent (Solution Architect / Tech Lead) | `PENDING` | `PENDING` |
| **Phase 4** | Independent QA Verification & Review Suite | 100% test pass rate, syntax certification, UTF-8 BOM verification | Sub Agent (QA Verification Engineer) | `PENDING` | `PENDING` |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html`<br>`dashboard/dashboard.js` | `cardSleepSettings` in `dashboard.html` contains 7 sleep timer & inactivity controls, but `dashboard.js` has zero event listeners or storage bindings. | Catalog in File 1; architect dual-way storage sync with popup sleep timer in File 2. | Guarantees sleep timer settings parity between Dashboard and Popup. | Phase 2 & 3 | `node tests/test_sleep_timer_and_ui_controls.js` |
| **2** | `dashboard/dashboard.js` | `saveDashboardSettings()` only persists general settings (`idleThresholdSeconds`, `language`, `wsUrl`, etc.) and neglects sleep settings. | Catalog in File 1; design comprehensive settings save handler covering both general and sleep configurations. | Eliminates silent settings drop upon dashboard reload. | Phase 2 & 3 | `node tests/test_tab_switch_and_storage_persistence.js` |
| **3** | `dashboard/dashboard.js` | `exportTimeTrackingCsv()` and `exportMediaHistoryCsv()` construct CSV rows without standard RFC 4180 quote escaping for titles containing commas or quotes. | Catalog in File 1; design robust sanitization/quoting helper function for all exported CSV cells. | Prevents corrupted CSV column shifts when importing into Excel or Sheets. | Phase 2 & 3 | `node tests/test_syntax_and_manifest_integrity.js` |
| **4** | `dashboard/dashboard.js`<br>`dashboard/dashboard.html` | `domainCategorySelect` (Web vs Internal) filters table rows but donut chart slices currently aggregate all domains regardless of category filter. | Catalog in File 1; specify synchronized category filtering across both SVG donut charts and domain table. | Provides consistent visual analytics when isolating internal browser tabs. | Phase 2 & 3 | `node tests/test_dashboard_multi_browser_filter.js` |
| **5** | `dashboard/dashboard.js` | `btnHeroSwitchTab` activates window and tab via `chrome.windows.update` & `chrome.tabs.update`, but if the target window was minimized, focus restoration can fail on some OS builds. | Catalog in File 1; specify explicit window `state: "normal"` un-minimize call prior to tab selection. | Ensures 100% reliable tab switching even when browser window is minimized. | Phase 2 & 3 | `node tests/test_jump_to_media_tab_and_bottom_toast.js` |
| **6** | `dashboard/dashboard.js` | Standalone SQLite Data Hub badge (`#dataHubBadge`) reflects offline/online, but automatic background reconnection retry ladder is absent when connection drops. | Catalog in File 1; design exponential backoff heartbeat monitor mirroring the HUD connector. | Provides resilient persistent synchronization with external SQLite WAL database. | Phase 2 & 3 | `node tests/test_popup_sqlite_data_hub_sync.js` |
| **7** | `dashboard/dashboard.js` | `DASHBOARD_I18N` hindi dictionary (`hi`) contains full translations for general settings, but lacks dictionary keys for sleep timer settings and advanced CSV export statuses. | Catalog in File 1; detail complete i18n key expansion for all newly bound sleep controls in File 2. | Delivers 100% seamless bilingual parity without English fallback leaks. | Phase 2 & 3 | `node tests/test_media_tab_switch_and_i18n.js` |

---

## 🔒 4. Execution Governance & Anti-Skip Compliance

- **Anti-Skip Pillar A (Grill-Me Gate):** The user's directive is unambiguous: conduct a full audit of Dashboard Mode and generate File 1 and File 2 with memory synchronization. No blocking design tradeoffs require user interruption. Strategy A (Autonomous Execution) is certified.
- **Anti-Skip Pillar B (Skill Manager Audit Gate):** Verified against `documentation-lookup`, `frontend-patterns`, `codebase-onboarding`, and `e2e-testing`.
- **Anti-Skip Pillar C (Phased Architecture Gate):** Ephemeral execution suite fully architected in `temp_prompt/dashboard_mode_audit/` prior to subagent dispatch.
- **Anti-Skip Pillar D (Independent QA Verification Gate):** Mandatory QA signoff requiring 100% test passage across all workspace test suites before task completion.
