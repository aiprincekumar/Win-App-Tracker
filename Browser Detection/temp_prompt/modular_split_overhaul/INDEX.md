# Live Tracking Board: Modular Industrial Split Overhaul

> **Document Type:** Ephemeral Task Tracking Board, Problem-Solution Dossier & Diagnostic Impact Matrix  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/INDEX.md`](INDEX.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target System:** Web Activity & Media Sentinel (Chrome / Edge / Firefox MV3 Extension)  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Authoritative Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Status:** ARCHITECTED / READY FOR MANAGER & USER CONSULTATION  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
The Web Activity & Media Sentinel codebase has accumulated massive feature additions over consecutive development sprints (including Phase 1-5 Audio Lab & DSP, Omni Command Palette, Kinetic Rollers & Precision Scrubber, Dual-Media Tracking, True Native Fullscreen Parity, and SQLite Data Hub synchronization). As a result, 10 core candidate files have expanded into monolithic codebases totaling **25,600+ lines** and **880+ KB**:
1. `dashboard/dashboard.js` (5,638 lines, 253 KB) — Massive monolith containing charting, filters, state, audio DSP, hotkeys, modals, and CSV export.
2. `dashboard/dashboard.css` (3,891 lines, 96 KB) — Monolithic CSS lacking modular breakdown, blending layout, widgets, themes, and animations.
3. `popup/popup.js` (3,750 lines, 162 KB) — Monolithic popup script handling 6 tabs, audio controls, sleep timer, storage, and IPC.
4. `popup/popup.css` (3,738 lines, 94 KB) — Monolithic popup stylesheet with mixed concerns and duplicated utility tokens.
5. `background.js` (3,132 lines, 117 KB) — Service worker monolith managing idle detection, WebSocket HUD bridge, alarms, and telemetry.
6. `content_media.js` (2,378 lines, 91 KB) — Isolated-world content script managing DOM scanning, HUD overlays, and messaging.
7. `inject_main_world.js` (1,262 lines, 52 KB) — Main-world interception script handling Web Audio DSP, YouTube player hooking, and OSD.
8. `dashboard/dashboard.html` (1,112 lines, 67 KB) — Monolithic dashboard view with nested modals, tabs, and complex markup.
9. `fullscreen_controller.js` (792 lines, 31 KB) — Fullscreen event engine handling native vs. web fullscreen arbitration.
10. `popup/popup.html` (753 lines, 42 KB) — Monolithic popup markup with 6 tab panels and status badges.

### 1.2 Architectural Solution
Decompose the monolithic files into an industrial, domain-driven modular architecture under `src/` (and modular CSS/HTML component directories) using a **Zero-Downtime Backward-Compatible Facade / Barrel Aggregator Pattern**. 

Key Solution Principles:
- **Zero Test Regressions:** All 39 existing test suites in `tests/` MUST pass with 100% success rate (exit code 0) after every single phase.
- **Classic Script & VM Sandbox Safety:** Preserve root entrypoint files (`dashboard/dashboard.js`, `popup/popup.js`, `background.js`, `content_media.js`, `inject_main_world.js`, `fullscreen_controller.js`) as robust facades/barrel aggregators so that Node.js `node -c` syntax checks and `new vm.Script()` AST parsers continue to compile cleanly without runtime module errors.
- **Modular Component Isolation:** Decompose domain logic into clean, single-responsibility files under `src/dashboard/`, `src/popup/`, `src/background/`, `src/content/`, `src/inject/`, and `src/fullscreen/`.
- **CSS Modular Structure:** Organize CSS into logical layers (tokens, layout, components, themes, animations) linked via standard CSS `@import` or unified master sheets.
- **Security & Standards Preservation:** Maintain 100% W3C Trusted Types compliance (zero `innerHTML` assignments), Manifest V3 CSP compatibility, and UTF-8 with BOM standard.

---

## 🚦 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **01** | `background.js` (3,132 lines) | Monolithic service worker combining telemetry, WebSocket HUD bridge, SQLite hub, alarms, and storage. | Decompose into dedicated modules in `src/background/` (`telemetry/`, `ws/`, `storage/`, `handlers/`) and assemble via facade. | Cleaner service worker lifecycle, isolated crash domains, zero IPC regressions. | Phase 1 | `node tests/test_syntax_and_manifest_integrity.js`, `node tests/test_timer_and_dual_media_tracking.js` |
| **02** | `src/shared/` & `src/core/` | Inconsistent helper duplication across popup, dashboard, and background (formatting, constants, contracts). | Consolidate shared contracts, constants, formatters, and math utilities in `src/shared/` and `src/core/`. | Single source of truth for time/date math, contracts, and RFC 4180 CSV helpers. | Phase 1 | `node tests/test_dashboard_csv_export_rfc4180.js`, `node tests/test_popup_formattime_resolution.js` |
| **03** | `content_media.js` (2,378 lines) | Blends DOM observation, media detection, HUD floating overlay, and isolated-to-main IPC. | Extract into `src/content/media/`, `src/content/fullscreen/`, `src/content/observers/`, and `src/content/bridge/`. | High testability of isolated DOM scanning; zero context invalidation regressions. | Phase 2 | `node tests/test_context_invalidation_guards.js`, `node tests/test_media_controls_and_fullscreen_fix.js` |
| **04** | `inject_main_world.js` (1,262 lines) & `fullscreen_controller.js` (792 lines) | Tight coupling between Web Audio API interception, YouTube player hooks, OSD rendering, and fullscreen events. | Modularize into `src/inject/player/`, `src/inject/ladders/`, `src/inject/osd/`, and `src/fullscreen/`. | W3C Trusted Types 100% preserved; clear separation of YouTube hooks and generic HTML5 media. | Phase 2 | `node tests/test_fullscreen_controller.js`, `node tests/test_fullscreen_blackout_fix.js` |
| **05** | `dashboard/dashboard.js` (5,638 lines) | Monster file holding state, charts, audio DSP, command palette, hotkeys, filters, and tables. | Split into modular domain controllers in `src/dashboard/` (`charts/`, `components/`, `filters/`, `services/`, `state/`, `audio/`, `palette/`, `scrubber/`). | Drastic maintainability improvement; dashboard bundle becomes modular; 0 `vm.Script` breakage. | Phase 3 | `node tests/test_dashboard_full_audio_lab_parity.js`, `node tests/test_dashboard_uiux_phase1.js`, `phase2.js`, `phase3.js`, `phase4.js` |
| **06** | `dashboard/dashboard.css` (3,891 lines) | Giant stylesheet with mixed tokens, layout, card styling, audio visualizers, and modals. | Deconstruct into `dashboard/styles/` or modular CSS directory with master aggregator maintaining all required selectors. | Modular, maintainable CSS; eliminates selector collisions; preserves all UI/UX tokens. | Phase 4 | `node tests/test_dashboard_theme_and_a11y_verification.js`, `node tests/test_light_mode_contrast_and_wcag.js` |
| **07** | `popup/popup.css` (3,738 lines) | Unsegmented CSS for 6 tabs, animations, high-contrast overrides, and compact header badges. | Split into `popup/styles/` (`base.css`, `header.css`, `tabs.css`, `audio_lab.css`, `wellness.css`, `themes.css`). | Clean CSS architecture; 100% compliance with popup dimensions (380x600px); WCAG 2.1 AA. | Phase 4 | `node tests/test_six_tab_popup_architecture.js`, `node tests/test_popup_phase1_quick_settings.js` |
| **08** | `popup/popup.js` (3,750 lines) | Monolith controlling 6 tab views, DSP, alarms, IPC, donut rendering, and SQLite data hub sync. | Modularize into `src/popup/` (`tabs/`, `components/`, `services/`, `state/`) with root facade maintaining global exports. | Robust tab life-cycles; isolated view state; zero dangling braces or syntax regressions. | Phase 5 | `node tests/test_popup_phase2_smart_automations.js`, `phase3_digital_wellness_alarms.js`, `phase4_studio_vault.js`, `phase5_audio_lab_and_dsp.js` |
| **09** | `dashboard/dashboard.html` (1,112 lines) & `popup/popup.html` (753 lines) | Large HTML files containing deeply nested tab panes, modals, and embedded SVG templates. | Perform structural hygiene, semantic ARIA audit, component block labeling, and script tag linkage certification. | Crystal-clear template boundaries; validated ARIA dialog/tablist hierarchies; zero broken IDs. | Phase 5 | `node tests/test_four_pillar_hub_ui.js`, `node tests/test_dashboard_future_uiux_actual_verification.js` |
| **10** | Extension Integration & Quality Gate | Risk of cross-module export mismatches, AST parse failures, secret leakage, or BOM encoding corruption. | Execute all 39 test suites, run `gitleaks detect --redact`, verify UTF-8 BOM (`0xEF, 0xBB, 0xBF`), verify manifest integrity. | Complete Grade A+ signoff; 39/39 passing test suites; production-ready release certification. | Phase 6 | Full test runner (`39/39 suites green`), `gitleaks detect --redact` (0 findings) |

---

## 📅 3. Phase Status & Execution Checklist

| Phase | Phase Name | Scope & Deliverables | Target Agent Role | Status | Test Gate | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **01** | Shared Core & Background Worker Split | Consolidate `src/shared/`, `src/core/`; split `background.js` into modular subsystems; establish service worker facade. | Level 4 Backend & Systems Engineer | ⏳ PENDING | `test_syntax_and_manifest_integrity.js`, `test_timer_and_dual_media_tracking.js` | Pending |
| **02** | Content Scripts & Fullscreen Controller Split | Split `content_media.js`, `inject_main_world.js`, `fullscreen_controller.js` into modular engines; preserve W3C Trusted Types. | Level 4 Extension Runtime Specialist | ⏳ PENDING | `test_context_invalidation_guards.js`, `test_fullscreen_controller.js`, `test_media_controls_and_fullscreen_fix.js` | Pending |
| **03** | Dashboard JavaScript Modular Split | Decompose `dashboard.js` (5,638 lines) into domain controllers in `src/dashboard/`; establish backward-compatible facade. | Level 4 Frontend Systems Engineer | ⏳ PENDING | `test_dashboard_full_audio_lab_parity.js`, `test_dashboard_uiux_phase1.js` through `phase4.js`, `test_dashboard_csv_export_rfc4180.js` | Pending |
| **04** | Dashboard & Popup CSS Modular Architecture | Split `dashboard.css` (3,891 lines) and `popup.css` (3,738 lines) into categorized modular stylesheets with master entrypoints. | Level 4 UI/UX Design System Specialist | ⏳ PENDING | `test_dashboard_theme_and_a11y_verification.js`, `test_six_tab_popup_architecture.js`, `test_light_mode_contrast_and_wcag.js` | Pending |
| **05** | Popup JS & HTML Views Modular Split | Decompose `popup.js` (3,750 lines) into tab controllers in `src/popup/`; audit and sanitize `dashboard.html` & `popup.html`. | Level 4 Frontend Engineer | ⏳ PENDING | `test_popup_phase1` through `phase5`, `test_popup_sqlite_data_hub_sync.js`, `test_popup_formattime_resolution.js` | Pending |
| **06** | E2E Regression & 39-Test QA Gate | Comprehensive test suite execution (39/39 passing suites), AST parsing audit, gitleaks secret scan, UTF-8 BOM check. | Level 4 Independent QA Verification Tester | ⏳ PENDING | All 39 Test Suites (100% exit code 0), `gitleaks detect --redact` (0 leaks) | Pending |

---

## 🔒 4. Constitutional Execution Lockout Status

- **Decision Gate Status:** `WAITING_FOR_USER_CLARIFICATION` / `READY_FOR_MANAGER_DECISION`
- **Sub Agent State:** All Level 4 Execution Sub Agents remain strictly **PAUSED / UNASSIGNED**.
- **Execution Release Rule:** Subagents are constitutionally prohibited from modifying any codebase files until Level 2 Manager issues an active `AUTH-MGR-*` token following strategy approval.
