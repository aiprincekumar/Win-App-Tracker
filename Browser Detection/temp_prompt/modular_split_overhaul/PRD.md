# Product Requirements Document (PRD): Modular Industrial Split Overhaul

> **Document Type:** Product Requirements Document & Acceptance Contracts  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/PRD.md`](PRD.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Lead Department:** Dept 01 (Product Requirements) & Dept 02 (Solution Architecture)  
> **Target System:** Web Activity & Media Sentinel (Chrome / Edge / Firefox MV3 Extension)  
> **Status:** APPROVED & SPECIFIED  

---

## 👥 1. User Personas & Stakeholder Profiles

1. **Extension End User ("The Prosumer / Power User"):**
   - *Needs:* Uninterrupted extension performance, zero memory leaks, responsive popup (<100ms render), accurate media telemetry, rich audio equalizer controls, and high-performance dashboard analytics.
   - *Pain Point with Monolith:* Heavy monolithic scripts risk slower initial evaluation times, sluggish tab switches, and fragile regressions when one feature breaks another.

2. **Core Developer & Maintainer (Atul Verma / `aiprincekumar`):**
   - *Needs:* High maintainability, fast code navigation, clear separation of concerns, easy feature extension, modular unit testing, and zero git merge conflicts across functional domains.
   - *Pain Point with Monolith:* Files exceeding 5,000 lines cause IDE lag, cognitive overload, difficult code reviews, and accidental regressions during surgical edits.

3. **Autonomous Coding Agent (Antigravity Orchestrator & Subagents):**
   - *Needs:* Bounded context windows, modular subagent delegation, clear domain boundaries, and zero token waste when reading or updating specific components.
   - *Pain Point with Monolith:* Monoliths consume massive context tokens (e.g. 250KB for a single file read), increasing latency, token spend, and risk of incomplete edits.

---

## 🎯 2. Functional Requirements (FR)

- **FR-01 (Service Worker Decomposition):** The 3,132-line `background.js` service worker must be decomposed into modular subsystems under `src/background/` (telemetry, WebSocket HUD client, SQLite data hub client, sleep timer alarms, and storage reconciliation).
- **FR-02 (Shared Core Standardization):** All shared constants, IPC contracts, date/time formatters, math utilities, and RFC 4180 CSV helpers must reside in `src/shared/` and `src/core/` without redundant copy-pasting.
- **FR-03 (Content Script Isolation):** The 2,378-line `content_media.js` must be decomposed into dedicated modules under `src/content/` (media element detector, playback tracker, isolated bridge, and DOM observers).
- **FR-04 (Main World & Fullscreen Engine Isolation):** `inject_main_world.js` (1,262 lines) and `fullscreen_controller.js` (792 lines) must be modularized into `src/inject/` (player controller, OSD manager, frequency ladders) and `src/fullscreen/` (native engine, web engine, event arbitration).
- **FR-05 (Dashboard JavaScript Domain Splitting):** The 5,638-line `dashboard/dashboard.js` must be split into distinct domain modules in `src/dashboard/` (charts, domain tables, multi-browser filters, audio lab DSP, command palette, scrubber controller, and CSV exporters).
- **FR-06 (Dashboard CSS Modularization):** The 3,891-line `dashboard/dashboard.css` must be organized into clear modular style layers (tokens, layout, audio lab widgets, command palette modal, scrubber, and themes).
- **FR-07 (Popup CSS Modularization):** The 3,738-line `popup/popup.css` must be decomposed into organized stylesheets for popup layout, header badges, 6 tab panes, audio lab controls, and themes.
- **FR-08 (Popup JavaScript Domain Splitting):** The 3,750-line `popup/popup.js` must be decomposed into tab view controllers under `src/popup/tabs/` (`tab_quick.js`, `tab_media.js`, `tab_automations.js`, `tab_wellness.js`, `tab_audio.js`, `tab_settings.js`) and supporting services.
- **FR-09 (HTML Structural Hygiene):** `dashboard/dashboard.html` (1,112 lines) and `popup/popup.html` (753 lines) must be audited and structured with clear semantic component block comments, validated ARIA hierarchies, and verified script linkages.
- **FR-10 (Zero-Downtime Facade Compatibility):** Root files must serve as seamless facades/barrel aggregators ensuring that external callers, extension manifests, and Node.js VM test harnesses continue to function with 100% backward compatibility.

---

## 🛡️ 3. Non-Functional Requirements (NFR)

- **NFR-01 (100% Test Suite Passage):** All 39 existing test suites in `tests/` must pass with 100% success rate (exit code 0) across all phases. Zero test suite modifications are permitted unless explicitly aligned to support modular imports.
- **NFR-02 (W3C Trusted Types Compliance):** Strict enforcement of zero assignments to `innerHTML`, `outerHTML`, or `document.write`. All dynamic DOM construction must use safe W3C DOM APIs (`createElement`, `textContent`, `appendChild`).
- **NFR-03 (Manifest V3 CSP Compliance):** Zero inline scripts, zero `eval()`, zero `Function()` constructor usage. Full adherence to Chrome MV3 CSP standards.
- **NFR-04 (File Size Budget):** No individual modular JavaScript source file should exceed **600 lines** or **30 KB**, significantly improving agent readability, maintainability, and compilation speed.
- **NFR-05 (Zero Memory Leaks):** Modular event listeners, DOM observers, and WebSocket connections must register clean teardown and unregistration hooks to prevent detached DOM elements or dangling intervals.
- **NFR-06 (Encoding Integrity):** All files must strictly maintain the UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) encoding standard to prevent character corruption in bilingual Devanagari strings and Excel CSV exports.

---

## 📦 4. INVEST-Compliant User Stories

1. **US-01 (Background Subsystems):** *As a system developer*, I want `background.js` split into single-responsibility modules so that WebSocket reconnections and tab tracking logic can be maintained and tested independently.
   - *I (Independent):* Operates strictly on background service worker logic.
   - *N (Negotiable):* Internal directory naming within `src/background/`.
   - *V (Valuable):* Eliminates service worker race conditions and eases debugging.
   - *E (Estimable):* Phase 1 deliverable (~300 lines per module).
   - *S (Small):* Scoped to background service worker and shared core.
   - *T (Testable):* Verified by `test_syntax_and_manifest_integrity.js` and `test_timer_and_dual_media_tracking.js`.

2. **US-02 (Content Script Subsystems):** *As an extension architect*, I want content media and fullscreen logic isolated into modular engines so that video player hooks do not interfere with DOM observation or fullscreen event arbitration.
   - *I:* Scoped to content and injection layers.
   - *N:* Internal module decomposition layout.
   - *V:* Prevents context invalidation crashes and preserves W3C Trusted Types.
   - *E:* Phase 2 deliverable.
   - *S:* Scoped to 3 files (`content_media.js`, `inject_main_world.js`, `fullscreen_controller.js`).
   - *T:* Verified by `test_context_invalidation_guards.js` and `test_fullscreen_controller.js`.

3. **US-03 (Dashboard Domain Controllers):** *As a frontend engineer*, I want `dashboard.js` split into modular domain controllers so that audio DSP, command palette, and charting code do not pollute the global dashboard namespace.
   - *I:* Independent frontend logic.
   - *N:* Export structure via facade.
   - *V:* Reduces 5,638-line monolith into readable ~400-line domain modules.
   - *E:* Phase 3 deliverable.
   - *S:* Focuses exclusively on dashboard logic.
   - *T:* Verified by `test_dashboard_full_audio_lab_parity.js` and `test_dashboard_uiux_phase1-4.js`.

4. **US-04 (CSS Style Architecture):** *As a UI designer*, I want dashboard and popup CSS divided into tokens, layouts, widgets, and themes so that styling adjustments are scoped without unintended cascading side effects.
   - *I:* Scoped to stylesheets.
   - *N:* File organization into `styles/` subdirectories.
   - *V:* Eliminates duplicate CSS rules and enforces WCAG 2.1 AA token consistency.
   - *E:* Phase 4 deliverable.
   - *S:* Focuses on `dashboard.css` and `popup.css`.
   - *T:* Verified by `test_dashboard_theme_and_a11y_verification.js` and `test_six_tab_popup_architecture.js`.

5. **US-05 (Popup Tab Controllers):** *As a popup developer*, I want popup tab behaviors isolated into distinct tab controller modules so that each tab manages its own DOM lifecycle and event listeners.
   - *I:* Scoped to popup extension view.
   - *N:* Structure of tab lifecycle handlers.
   - *V:* Prevents syntax regressions (such as the historic Bug 804:1 dangling brace defect).
   - *E:* Phase 5 deliverable.
   - *S:* Scoped to `popup.js`, `popup.html`, and `dashboard.html`.
   - *T:* Verified by `test_popup_phase1` through `phase5` and `test_syntax_and_manifest_integrity.js`.

---

## 🏷️ 5. MoSCoW Feature Prioritization

- **Must Have (P0):**
  - Decomposition of all 10 monolithic candidate files.
  - 100% pass rate across all 39 test suites (exit code 0).
  - Backward-compatible facades preserving `vm.Script` and `node -c` compilation.
  - Zero W3C Trusted Types regressions (zero `innerHTML`).
  - Zero gitleaks secret findings.
  - Strict preservation of UTF-8 BOM encoding.
- **Should Have (P1):**
  - Logical file size cap of <600 lines per decomposed module.
  - Unified barrel aggregators in `src/` directories.
  - Symmetrical bilingual parity for all i18n keys across modules.
  - Centralized error handling and safe messaging wrappers.
- **Could Have (P2):**
  - Standardized automated Taskfile runner command (`task test:all`, `task lint`).
  - Automated dead-code elimination report comparing before/after byte footprints.
- **Won't Have (This Iteration) (P3):**
  - Rewriting the extension from Vanilla JavaScript into React or Vue.
  - Introducing heavy Node-dependent build systems (Webpack/Vite/Rollup) that alter runtime distribution output.
  - Altering existing user-facing UI designs, dimensions, or styling behaviors.

---

## 📋 6. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Node.js AST Compilation Safety
- **Given** any decomposed JavaScript module or root facade script (`dashboard.js`, `popup.js`, `background.js`, `content_media.js`, `inject_main_world.js`, `fullscreen_controller.js`)
- **When** evaluated via `node -c "<file>"` and parsed via `new vm.Script(fs.readFileSync("<file>", "utf8"))`
- **Then** the process must compile with 0 syntax errors, 0 parse exceptions, and exit code 0.

### Contract 2: 39-Test Suite Zero Regression Gate
- **Given** the complete test directory containing 39 test suites in `tests/`
- **When** all 39 test scripts are executed in Node.js
- **Then** all 39 test suites must pass 100% cleanly without a single assertion error, uncaught rejection, or non-zero exit code.

### Contract 3: W3C Trusted Types Compliance
- **Given** all newly created or refactored scripts in `src/` and root entrypoints
- **When** scanned for assignments to `.innerHTML`, `.outerHTML`, or `document.write`
- **Then** exactly 0 assignments must be detected across all content scripts and injection files.

### Contract 4: Backward Compatibility of Facade Entrypoints
- **Given** legacy test suites that import or evaluate root files (`dashboard.js`, `popup.js`, `background.js`) directly
- **When** tests access exported classes, objects, and functions (e.g., `DASHBOARD_EQ_PRESETS`, `OmniCommandPaletteController`, `PrecisionTimelineScrubber`, `escapeCsvCell`)
- **Then** all symbols must be accessible and behave identically to the pre-refactor implementation.

### Contract 5: CSS String Matching Invariant
- **Given** test suites that inspect raw CSS string content via `fs.readFileSync("dashboard/dashboard.css", "utf8")`
- **When** assertions check for specific selector blocks (e.g. `.audio-eq-widget {`, `.audio-eq-widget.liquid-glass-card {`)
- **Then** the master stylesheet must satisfy all existing regex and string inclusion checks without failing.
