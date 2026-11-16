# Live Tracking Board: Monolithic Facade Slimming & Modular Decomposition

> **Document Type:** Ephemeral Task Tracking Board, Problem-Solution Dossier & Diagnostic Impact Matrix  
> **Workspace Container:** [`temp_prompt/facade_slimming_and_modular_decomposition/INDEX.md`](INDEX.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target System:** Web Activity & Media Sentinel (Chrome / Edge / Firefox MV3 Extension)  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Authoritative Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Status:** ARCHITECTED / READY FOR MANAGER & USER CONSULTATION  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
In the previous development phase, modular directories were created under `src/` and `styles/`, but the root entrypoint files still harbor massive monolithic inline logic:
- `background.js`: **3,450 lines** (~120 KB)
- `content_media.js`: **2,630 lines** (~96 KB)
- `dashboard/dashboard.js`: **6,335 lines** (~252 KB)
- `popup/popup.js`: **4,195 lines** (~165 KB)
- `dashboard/dashboard.css`: **4,528 lines** (~110 KB)
- `popup/popup.css`: **4,329 lines** (~108 KB)
- `inject_main_world.js`: **1,262 lines** (~55 KB)
- `fullscreen_controller.js`: **792 lines** (~33 KB)

Totaling **~27,500+ lines of code** across monolithic files. 

The user's explicit directive:
> *"मुझे और भी फीचर एंड फंक्शन ऐड करना है और साथ ही डिजाइन एंड स्टाइल जो है ऐड करना है। इसके लिए जो है तुम ध्यान में रखते हुए यह देखो कि किसी फाइल में और स्प्लिट करने की जरूरत हो सकती है तो जरूरत के अनुसार स्प्लिट करो और सेम मटेरियल यूज करना जो अभी यूज किया हो स्प्लिट करने के लिए।"*

Adding new features, functions, designs, and styles directly into these 4,000-6,000 line monoliths introduces extreme cognitive load, merge conflict hazards, and AST parse complexity. To support clean, rapid extension of future features and styles, the root entrypoints must be systematically slimmed down into clean, backward-compatible facades that delegate to domain-specific modules in `src/` and `styles/`, while preserving 100% test compatibility across all 39 test suites.

### 1.2 Architectural Solution
Deconstruct the monolithic inline blocks from root entrypoints into their respective modular subsystems in `src/` and establish **Pure Backward-Compatible Facades / Barrel Aggregators**:
1. **Root Entrypoint Facades:** Slim `background.js`, `content_media.js`, `dashboard/dashboard.js`, and `popup/popup.js` from thousands of lines down to lightweight facades (< 250-350 lines each).
2. **Modular Subsystem Expansion:** Wire the facades to dynamically import or invoke the domain modules under `src/background/`, `src/content/`, `src/dashboard/`, and `src/popup/`.
3. **Dual Runtime Execution Compatibility:** Ensure facades work flawlessly in both:
   - **Chrome MV3 Browser Runtime:** Standard service worker, content scripts, and extension page script tags.
   - **Node.js Test Environment:** `node -c` syntax compilation, `new vm.Script()` AST parsing, and `vm.runInContext()` execution without missing globals or unresolved dependencies.
4. **CSS Modular Architecture & Deterministic Assembly:** Keep modular stylesheets cleanly organized in `dashboard/styles/` and `popup/styles/` for adding new design styles, while maintaining deterministic assembly via `scripts/build_css_modules.js` to ensure zero runtime and test regressions.
5. **Zero-Regression Mandate:** Guarantee that all 39 test suites in `tests/` pass with 100% success rate (exit code 0) after every single phase.

---

## 🚦 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **01** | `background.js` (3,450 lines) | Monolithic service worker containing inline telemetry, WebSocket HUD bridge, state management, and message routing. | Extract remaining inline logic into `src/background/` modules; slim `background.js` into a lightweight facade (< 250 lines) delegating to modules. | Isolated crash boundaries, service worker boot optimization, clean extension point for background features. | Phase 1 | `node tests/test_syntax_and_manifest_integrity.js`, `node tests/test_timer_and_dual_media_tracking.js` |
| **02** | `content_media.js` (2,630 lines), `inject_main_world.js` (1,262 lines), `fullscreen_controller.js` (792 lines) | Content scripts blend DOM observation, media detection, HUD overlays, YouTube player hooking, and fullscreen arbitration. | Deconstruct inline logic into `src/content/`, `src/inject/`, and `src/fullscreen/`; slim root entrypoints into pure facades. | 100% W3C Trusted Types preserved, isolated DOM scanners, clear hooks for new media features. | Phase 2 | `node tests/test_context_invalidation_guards.js`, `node tests/test_fullscreen_controller.js`, `node tests/test_fullscreen_blackout_fix.js`, `node tests/test_media_controls_and_fullscreen_fix.js` |
| **03** | `dashboard/dashboard.js` (6,335 lines) | Monster file holding state, charts, audio DSP, command palette, hotkeys, filters, and tables inline. | Delegate all UI subsystems to `src/dashboard/` modules (`charts/`, `components/`, `filters/`, `services/`, `audio/`, `palette/`, `scrubber/`); slim root file to facade (< 350 lines). | Clean architecture for new dashboard features, faster render initialization, 100% `vm.Script` compatibility. | Phase 3 | `node tests/test_dashboard_full_audio_lab_parity.js`, `node tests/test_dashboard_uiux_phase1.js` through `phase4.js`, `node tests/test_dashboard_csv_export_rfc4180.js` |
| **04** | `popup/popup.js` (4,195 lines) | Monolithic popup script managing 6 tab panels, audio DSP, alarms, IPC, donut rendering, and SQLite data hub sync inline. | Delegate tab controllers to `src/popup/tabs/` and services to `src/popup/services/`; slim `popup.js` to a clean facade (< 300 lines). | Robust tab lifecycles, zero dangling brace regressions, easily extensible tab architecture. | Phase 4 | `node tests/test_popup_formattime_resolution.js`, `node tests/test_popup_phase1_quick_settings.js` through `phase5_audio_lab_and_dsp.js`, `node tests/test_popup_sqlite_data_hub_sync.js`, `node tests/test_six_tab_popup_architecture.js` |
| **05** | `dashboard/dashboard.css` (4,528 lines) & `popup/popup.css` (4,329 lines) | Massive monolithic stylesheets with mixed concerns, limiting rapid addition of new visual styles and themes. | Establish clean modular styling in `dashboard/styles/` and `popup/styles/` with synchronized assembly via `scripts/build_css_modules.js`. | Effortless addition of new CSS themes, tokens, and animations; 100% preservation of WCAG 2.1 AA and 380px geometry. | Phase 5 | `node tests/test_dashboard_theme_and_a11y_verification.js`, `node tests/test_light_mode_contrast_and_wcag.js`, `node scripts/build_css_modules.js` |
| **06** | Extension Integration & Quality Gate | Risk of cross-module export mismatches, AST parse failures, secret leakage, or BOM encoding corruption. | Comprehensive 39-suite regression verification, `gitleaks detect --redact` audit, and UTF-8 BOM certification. | Complete Grade A+ signoff; 39/39 passing test suites; production-ready release certification. | Phase 6 | Complete test runner (`39/39 suites green`), `gitleaks detect --redact` (0 findings) |

---

## 📅 3. Phase Status & Execution Checklist

| Phase | Phase Name | Scope & Deliverables | Target Agent Role | Status | Test Gate | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **01** | Background Worker Facade Slimming | Slim `background.js` to pure facade (< 250 lines); wire all state, storage, telemetry, and WebSocket HUD handling to `src/background/`. | Level 4 Backend & Systems Engineer | ⏳ PENDING | `test_syntax_and_manifest_integrity.js`, `test_timer_and_dual_media_tracking.js` | Pending |
| **02** | Content Scripts & Controllers Slimming | Slim `content_media.js`, `inject_main_world.js`, and `fullscreen_controller.js` to facades; wire to `src/content/`, `src/inject/`, and `src/fullscreen/`. | Level 4 Extension Runtime Specialist | ⏳ PENDING | `test_context_invalidation_guards.js`, `test_fullscreen_controller.js`, `test_media_controls_and_fullscreen_fix.js` | Pending |
| **03** | Dashboard JS Slimming & Module Expansion | Slim `dashboard/dashboard.js` to pure facade (< 350 lines); expand and wire domain controllers in `src/dashboard/`. | Level 4 Frontend Systems Engineer | ⏳ PENDING | `test_dashboard_full_audio_lab_parity.js`, `test_dashboard_uiux_phase1.js` through `phase4.js`, `test_dashboard_csv_export_rfc4180.js` | Pending |
| **04** | Popup JS Slimming & Module Expansion | Slim `popup/popup.js` to pure facade (< 300 lines); expand and wire 6 tab controllers and services in `src/popup/`. | Level 4 Frontend Engineer | ⏳ PENDING | `test_popup_phase1` through `phase5`, `test_popup_sqlite_data_hub_sync.js`, `test_popup_formattime_resolution.js` | Pending |
| **05** | CSS Facade & Stylesheet Deconstruction | Maintain modular stylesheets in `dashboard/styles/` and `popup/styles/`; enhance `scripts/build_css_modules.js` for new style tokens. | Level 4 UI/UX Design System Specialist | ⏳ PENDING | `test_dashboard_theme_and_a11y_verification.js`, `test_six_tab_popup_architecture.js`, `test_light_mode_contrast_and_wcag.js` | Pending |
| **06** | Independent QA Verification & 39-Test Gate | Full regression test execution across all 39 test suites, AST parsing validation, gitleaks secret audit, UTF-8 BOM check. | Level 4 Independent QA Verification Tester | ⏳ PENDING | All 39 Test Suites (100% exit code 0), `gitleaks detect --redact` (0 leaks) | Pending |

---

## 🔒 4. Constitutional Execution Lockout Status

- **Decision Gate Status:** `WAITING_FOR_USER_CLARIFICATION` / `READY_FOR_MANAGER_DECISION`
- **Sub Agent State:** All Level 4 Execution Sub Agents remain strictly **PAUSED / UNASSIGNED**.
- **Execution Release Rule:** Subagents are constitutionally prohibited from modifying any codebase files until Level 2 Manager issues an active `AUTH-MGR-*` token following strategy approval.
