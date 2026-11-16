# Product Requirements Document (PRD): Monolithic Facade Slimming & Modular Decomposition

> **Document Type:** Product Requirements Document, User Stories & Acceptance Criteria Contracts  
> **Workspace Container:** [`temp_prompt/facade_slimming_and_modular_decomposition/PRD.md`](PRD.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target System:** Web Activity & Media Sentinel (Chrome / Edge / Firefox MV3 Extension)  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Authoritative Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Status:** ARCHITECTED / READY FOR IMPLEMENTATION  

---

## 🎯 1. Product Vision & Goals

### 1.1 Goal Statement
Decompose the remaining monolithic inline logic inside root extension files into dedicated, single-responsibility modules in `src/` and `styles/`, and transform root entrypoint files into pure backward-compatible facades. This provides an industrial-grade foundation that allows developers to seamlessly add new features, functions, designs, and styles without battling monolithic files or breaking any of the 39 existing verification test suites.

### 1.2 Target Audience & Personas
- **Extension Users:** Experience zero downtime, 60fps UI responsiveness, instant tab switching, zero unhandled promise rejections, and seamless media tracking across browsers.
- **Developer / Maintainer (Atul Verma):** Can rapidly add new features, UI components, and design tokens into isolated modules without navigating 6,000-line monolithic files.
- **Automated Verification Harness:** Can compile, parse AST, and execute all 39 test suites cleanly with 100% exit code 0.

---

## 📋 2. Functional Requirements (FR)

- **FR-01 (Background Facade Slimming):** `background.js` must be slimmed to a clean facade (< 250 lines) that orchestrates telemetry, WebSocket HUD client, storage, and message routing from `src/background/`.
- **FR-02 (Content Script Facade Slimming):** `content_media.js` must be slimmed to a clean facade (< 200 lines) delegating DOM observation, media detection, HUD rendering, and IPC bridge to `src/content/`.
- **FR-03 (Main World & Fullscreen Facade Slimming):** `inject_main_world.js` and `fullscreen_controller.js` must delegate YouTube hooks, audio DSP, and fullscreen arbitration to `src/inject/` and `src/fullscreen/`.
- **FR-04 (Dashboard JS Facade Slimming):** `dashboard/dashboard.js` must be slimmed to a clean facade (< 350 lines) delegating charting, state, filters, audio DSP, hotkeys, and CSV export to `src/dashboard/`.
- **FR-05 (Popup JS Facade Slimming):** `popup/popup.js` must be slimmed to a clean facade (< 300 lines) delegating 6 tab controllers and services to `src/popup/`.
- **FR-06 (CSS Modular Architecture):** Modular stylesheets in `dashboard/styles/` and `popup/styles/` must serve as the primary authoring surface for design and styling enhancements, assembled via `scripts/build_css_modules.js` into master sheets.
- **FR-07 (Backward-Compatible Global Scope):** All functions, objects, and namespaces accessed by tests and DOM inline event handlers (`onclick`, etc.) must remain accessible in the global scope (`window` or `globalThis`).

---

## 🛡️ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Test Regressions):** All 39 test suites in `tests/` must execute with 100% exit code 0.
- **NFR-02 (AST & VM Compilation Safety):** Every JavaScript file must pass `node -c <file>` syntax check and `new vm.Script(code)` AST compilation without parse errors.
- **NFR-03 (W3C Trusted Types Compliance):** Strict zero `innerHTML` assignments across all newly created or refactored modules (OWASP/CSP compliant).
- **NFR-04 (Manifest V3 Compatibility):** Zero violation of Chrome MV3 service worker lifecycle constraints, isolated-world security boundaries, or permissions policies.
- **NFR-05 (Encoding & Secrets Standard):** 100% UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all edited/created files; zero secrets detected via `gitleaks detect --redact`.

---

## 👤 4. User Stories & Given-When-Then Acceptance Contracts

### User Story 1: Background Service Worker Facade Slimming
> **As an** Extension Developer,  
> **I want** `background.js` to act as a lightweight service worker facade,  
> **So that** background alarms, WebSocket logic, and domain tracking can be modified and extended independently without touching a 3,450-line monolith.

- **Scenario 1.1: Service Worker Boot & Syntax Integrity**
  - **Given** the refactored `background.js` facade and its modular subsystems in `src/background/`
  - **When** `node -c background.js` and `new vm.Script(code)` are executed
  - **Then** both must complete with exit code 0 and zero compilation errors.
- **Scenario 1.2: Runtime Messaging & WebSocket Telemetry**
  - **Given** the background service worker running with `src/background/` modules
  - **When** a `QUERY_STATE` or `RECONNECT_WS` message is received from popup or dashboard
  - **Then** the message router delegates to `state_manager.js` and `data_hub_client.js`, returning accurate state with zero IPC rejections.

### User Story 2: Dashboard JavaScript Facade Slimming
> **As an** Extension Developer,  
> **I want** `dashboard/dashboard.js` to delegate charting, audio DSP, and filtering to `src/dashboard/`,  
> **So that** new dashboard features and visualizations can be added in modular components.

- **Scenario 2.1: Full Audio Lab Parity & Chart Rendering**
  - **Given** the slimmed `dashboard/dashboard.js` facade
  - **When** `node tests/test_dashboard_full_audio_lab_parity.js` and `node tests/test_dashboard_uiux_phase1.js` are executed
  - **Then** all audio equalizer sliders, visualizer canvases, donut charts, and time series pass 100% assertions.
- **Scenario 2.2: RFC 4180 CSV Export**
  - **Given** the dashboard state holding session tracking data
  - **When** CSV export is triggered via `csv_exporter.js`
  - **Then** `node tests/test_dashboard_csv_export_rfc4180.js` passes with RFC-compliant quoting and column ordering.

### User Story 3: Popup JavaScript Facade Slimming
> **As an** Extension Developer,  
> **I want** `popup/popup.js` to delegate 6 tab panels and services to `src/popup/`,  
> **So that** new quick settings, automations, and media controls can be added cleanly.

- **Scenario 3.1: 6-Tab Architecture & State Navigation**
  - **Given** `popup/popup.js` running with modular tab controllers in `src/popup/tabs/`
  - **When** `node tests/test_six_tab_popup_architecture.js` is run
  - **Then** all 6 tabs (Quick, Media, Automations, Wellness, Studio, Audio Lab) switch state correctly without DOM exceptions.
- **Scenario 3.2: Balanced Braces & Clean AST**
  - **Given** `popup/popup.js` parsed by `node tests/test_syntax_and_manifest_integrity.js`
  - **When** AST parsing evaluates `processDomainStats` and `renderDonutChart`
  - **Then** braces are perfectly balanced with zero dangling tokens.

### User Story 4: Modular CSS & Design Tokens
> **As a** UI/UX Designer,  
> **I want** modular stylesheets in `dashboard/styles/` and `popup/styles/`,  
> **So that** new themes, design tokens, and glassmorphic styles can be authored in dedicated CSS files.

- **Scenario 4.1: CSS Build & Selector Parity**
  - **Given** stylesheets edited in `dashboard/styles/` or `popup/styles/`
  - **When** `node scripts/build_css_modules.js` is executed
  - **Then** `dashboard/dashboard.css` and `popup/popup.css` are updated with full selector parity and UTF-8 BOM encoding.
