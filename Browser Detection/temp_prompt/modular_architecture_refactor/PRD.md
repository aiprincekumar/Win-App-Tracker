# Product Requirements Document (PRD) — Modular Architecture Refactor

> **Document Type:** Product Requirements Document (PRD)  
> **Initiative:** Modular Architecture Refactoring for Web Activity & Media Sentinel  
> **Author & Technical Owner:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Lead Department:** Dept 01 Product Requirements & Dept 02 Solution Architecture  
> **Governance Standard:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/modular_architecture_refactor/PRD.md`

---

## 🎯 1. Overview & Business Rationale

The user mandate demands refactoring the existing codebase to industry standards:
> *"तुम्हें अब इंडस्ट्री स्टैंडर्ड के हिसाब से मल्टीपल मॉड्यूलर आर्किटेक्चर का इस्तेमाल करना है। और फाइल को स्प्लिट करना है। जितने फाइलों की आवश्यकता हो या जितने फोल्डर की आवश्यकता हो उतने में ही स्प्लिट करो। पूरे कोड बेस को और मॉड्यूलर और इंडस्ट्री स्टैंडर्ड के हिसाब से किस मॉडल का इस्तेमाल होता है इंडस्ट्री में इस करंट इंडस्ट्री में उसके हिसाब से तुम मॉड्यूलर अप्रोच को इस्तेमाल करो।"*

This PRD formalizes the requirements for transforming the monolithic architecture into a modern, domain-driven, maintainable, and scalable modular Chrome Extension MV3 system.

---

## 👥 2. User & Developer Personas

1. **Extension End-User:** Demands an ultra-responsive, zero-lag browser popup and dashboard, deterministic YouTube media control, seamless SQLite Data Hub synchronization, and flawless sleep timer automation without browser freezes or memory leaks.
2. **Extension Core Maintainer / Developer:** Needs clean, isolated files where each module has a single clear purpose, making it straightforward to add new media providers, adjust telemetry algorithms, or design new dashboard views without fear of breaking unrelated features.
3. **Automated CI/QA System:** Demands 100% deterministic test execution across all 16 existing test suites without flaky failures, syntax errors, or missing symbol exports.

---

## 📋 3. User Stories (INVEST Compliant)

- **US-01 (Background Modularization):** As a developer, I want the background service worker separated into discrete modules (handlers, state, ws_bridge, alarms, storage) so that I can modify WebSocket telemetry or alarm logic without touching unrelated tab management code.
- **US-02 (Content Script Modularization):** As a developer, I want content and injection scripts split into media detection, DOM observers, fullscreen engine, and cross-world bridge modules so that video platform integrations can be added or updated independently.
- **US-03 (UI Modularization):** As a developer, I want the popup and dashboard logic organized into dedicated component, service, and tab modules so that UI enhancements do not bloat a single massive script file.
- **US-04 (Shared Contracts & Utilities):** As a developer, I want all action types, message channels, and DOM utilities consolidated in `src/shared/` so that I have a Single Source of Truth for extension-wide communications.
- **US-05 (Automated Test Compatibility):** As a QA engineer, I want all existing 16 test suites to execute and pass cleanly against the modular codebase so that no regression is introduced during refactoring.

---

## ⚖️ 4. MoSCoW Feature Prioritization

### Must Have (P0)
- Modular directory hierarchy under `src/` (`background/`, `content/`, `inject/`, `popup/`, `dashboard/`, `shared/`).
- Complete decomposition of `background.js` (105KB) into modular subsystems while preserving entry point functionality.
- Complete decomposition of `content_media.js` (54KB), `inject_main_world.js` (44KB), and `fullscreen_controller.js` (30KB).
- Complete decomposition of `popup/popup.js` (143KB) and `dashboard/dashboard.js` (135KB).
- Strict adherence to W3C Trusted Types (0 assignments to `innerHTML`).
- 100% passage of all 16 existing test suites in `tests/`.

### Should Have (P1)
- Shared type and action contract registry (`src/shared/contracts.js`).
- Clean centralized error handling and logging wrapper (`src/shared/logger.js`).
- Tree-shakeable, single-responsibility ES module imports for background service worker.

### Could Have (P2)
- Automated linting check script for module boundaries.
- Visualization map of module dependencies in documentation.

### Won't Have (P3 - Out of Scope)
- No user-facing UI redesign or removal of existing popup/dashboard tabs.
- No changes to `manifest.json` permissions or version reduction.
- No introduction of heavy build bundlers (Webpack, Rollup) that would obscure source code for Chrome Web Store review.

---

## 📐 5. Functional Requirements (FR)

- **FR-01 (Background Service Worker):** The background service worker must dynamically initialize `ConfigManager`, `StateManager`, `StorageManager`, `WebSocketBridge`, `AlarmsManager`, and `MessageHandler` upon activation.
- **FR-02 (Data Hub Bridge):** The WebSocket client in `src/background/ws/` must implement exponential backoff retry ladders (`[5000, 15000, 30000, 60000, 120000]`), silent HTTP port probing, and offline delta queuing.
- **FR-03 (Content Scripts):** Content scripts must maintain the tri-channel bridge between Isolated World and MAIN World, dispatching `__MEDIA_SENTINEL_ACTION__` CustomEvents with unique `actionId` and debounce locking.
- **FR-04 (Fullscreen & OSD Engine):** The Web Fullscreen CSS engine and floating HUD must operate with zero `innerHTML` usage, using `createElementNS` for SVGs and `createElement` for DOM elements.
- **FR-05 (UI State & Services):** The popup and dashboard must load tab controllers lazily or hierarchically, persisting user preferences (`selected_browser_filter`, `active_tab`) in `chrome.storage.local`.

---

## 🔒 6. Non-Functional Requirements (NFR)

- **NFR-01 (Performance & Bundle Size):** Subsystem modules must load with minimal overhead (<5ms initialization time in service worker).
- **NFR-02 (Maintainability):** Individual modules should not exceed 300 lines of code; files must have clear JSDoc headers and single responsibilities.
- **NFR-03 (Security & CSP):** Strict compliance with Chrome Extension MV3 CSP; zero `eval()`, zero `new Function()`, zero `innerHTML`.
- **NFR-04 (Backward Compatibility):** All public APIs, global event listeners, and runtime messaging actions must retain exact payload shapes.

---

## 🧪 7. Given-When-Then Acceptance Criteria Contracts

```gherkin
Feature: Industry-Standard Modular Architecture Refactor

  Scenario: Service Worker Initialization
    Given the extension is loaded in a Manifest V3 compliant environment
    When the background service worker starts up
    Then all modular subsystems (state, storage, ws, handlers) initialize cleanly without syntax errors
    And all runtime listeners for tabs, alarms, and messages are registered.

  Scenario: Media Telemetry Detection
    Given a web page with an active HTML5 video element (e.g., YouTube)
    When media playback begins
    Then the modular content script detects the media element and extracts metadata
    And safely forwards the telemetry update to the background service worker via IPC.

  Scenario: Fullscreen Toggle and Debounce Lock
    Given a user clicks the fullscreen button or presses KeyF
    When the action is processed across isolated and main worlds
    Then the debounce lock (data-sentinel-fs-ts) prevents double-toggling within 350ms
    And the viewport fill CSS styles are injected cleanly.

  Scenario: Regression Test Verification
    Given the modular refactoring of all 6 core components is complete
    When all 16 test suites in tests/ are executed via Node.js
    Then 100% of the test suites pass with exit code 0 and zero assertion errors.
```
