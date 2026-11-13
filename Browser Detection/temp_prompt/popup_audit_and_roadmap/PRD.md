# Product Requirements Document (PRD): Popup Mode Audit & Phased Plan

> **Product Scope:** Web Activity & Media Sentinel (Chrome / Edge / Firefox Extension)  
> **Feature Subsystem:** Popup Mode UI, Audio Lab, Media Controls, Tools, Studio, Tracking, Domains  
> **Workspace Container:** `temp_prompt/popup_audit_and_roadmap/`  
> **Document Status:** Formal Specification  

---

## 👥 1. Target Personas & User Goals

- **Primary Persona: Power Media Consumer & Multitasker**
  - Wants seamless remote control over background YouTube, Netflix, Spotify, or video tabs without switching windows.
  - Expects controls (volume, boost, sleep timer, seek, play/pause) to work reliably or clearly indicate their current state.
- **Secondary Persona: Developer & System Administrator (Atul Verma)**
  - Requires full transparency into which features are production-ready vs mock stubs.
  - Demands structured, phase-wise implementation plans with zero ambiguity and deterministic test gates.

---

## 🎯 2. Functional Requirements (FR)

### FR-01: Full Popup Feature Audit
The system must inspect every interactive DOM element, button, slider, toggle, dropdown, and badge in `popup/popup.html` and verify its end-to-end execution path across `popup/popup.js`, `background.js`, `content_media.js`, and `inject_main_world.js`.

### FR-02: Authoring of File 1 (`popup_non_working_functions.md`)
The system must generate a standalone markdown file in the workspace root that:
- Catalogs every non-working, stubbed, or partially functional feature.
- Groups features by tab/section (Header, Media, Audio Lab, Tools, Studio, Tracking, Quick Settings).
- Explains for each feature:
  1. Feature Name & UI Selector.
  2. Intended Behavior (What it was supposed to do).
  3. Current Status (Why it fails or what code is missing).
  4. Impact on User Experience.
- Uses clear, accessible language (Bilingual English & Hindi summary).

### FR-03: Authoring of File 2 (`popup_phase_wise_plan.md`)
The system must generate a standalone markdown file in the workspace root that:
- Decomposes the fixes into structured, sequential implementation phases.
- For each phase, details:
  1. Phase Objective & Target Features.
  2. Technical Architecture & Implementation Procedure.
  3. Files to Create or Modify (`popup.js`, `background.js`, `content_media.js`, `popup.css`, etc.).
  4. API Contracts & Chrome Extension MV3 requirements (e.g., `offscreen`, `chrome.tabCapture`, `chrome.alarms`).
  5. Test Gates & Acceptance Criteria.
- Updates active working memory (`memory.md` & `project_feature_memory.md`).

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Hallucination / Evidence-First):** Every finding in File 1 must cite exact line numbers or verified code gaps in `popup.js`, `background.js`, or content scripts.
- **NFR-02 (UTF-8 with BOM Standard):** All generated `.md` files must be encoded in UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) per Universal Rule 5 & 8.
- **NFR-03 (Zero Regression Guarantee):** Existing working features (Media Play/Pause, Timeline Seek, Fullscreen, PiP, Sleep Timer, Domain Filters, SQLite Data Hub sync) must not be disrupted or broken.
- **NFR-04 (Token-Efficient Clarity):** Tables, markdown callouts, and clean headings must be used to keep documentation readable and maintainable.

---

## 🏗️ 4. INVEST-Compliant User Stories & MoSCoW Prioritization

### Must Have (P0)
- **US-01:** As a developer, I need an exhaustive list of all non-working functions in `popup/` so that I have a reliable inventory of technical debt.
- **US-02:** As a developer, I need a phased implementation roadmap explaining exact procedures and next steps so that subsequent engineering tasks can be executed autonomously.

### Should Have (P1)
- **US-03:** As a developer, I need the diagnostic matrix updated in memory files so that future agent sessions remember the defect landscape without scanning.

### Could Have (P2)
- **US-04:** As a developer, I want unit test templates drafted for each future phase to support test-driven development (TDD).

---

## ✅ 5. Given-When-Then Acceptance Criteria Contracts

### Contract 1: File 1 Completeness
- **GIVEN** the extension codebase has 6 popup tabs and auxiliary controls,
- **WHEN** `popup_non_working_functions.md` is generated,
- **THEN** it must include all audited stubs: Audio Master Boost (0-200%), Audio-Only Mode, 5-Band Equalizer, Vocal Clarity, Night Shield, Auto-Pause on New Tab, Auto Ad Silencer, Domain Speed Memory, Doomscroll Breaker, Screenshot Tab Targeting, Quick Settings (Default Tab, Sync Interval, Notification Sound, High Contrast CSS).

### Contract 2: File 2 Actionability
- **GIVEN** `popup_phase_wise_plan.md` is generated,
- **WHEN** reviewed by an engineer,
- **THEN** each phase must provide step-by-step code guidance, affected files, exact API calls, and verification commands enabling 1-click execution.
