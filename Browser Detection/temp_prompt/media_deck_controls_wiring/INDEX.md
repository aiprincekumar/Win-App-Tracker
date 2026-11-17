# Multi-Tab Live Media Deck & Hero Player Controls: Functional Backend Logic & Bidirectional Wiring Master Tracking Board

> **Document Type:** Live Phase Orchestration Index, Problem-Solution Dossier & Diagnostic Matrix  
> **Workspace Container:** `temp_prompt/media_deck_controls_wiring/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Date:** 2026-11-18  
> **Target Task ID:** `TASK-MEDIA-DECK-CONTROLS-001`  
> **Target Scope:** Full-Stack MV3 Extension Wiring (`background.js`, `content_media.js`, `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js`, and dedicated automated test suites).

---

## 📋 1. Executive Problem-Solution Dossier

### Current State & Gap Analysis
While previous milestones separated the Equalizer and Audio Lab containers and added visual scrubber styling, the interactive backend logic and bidirectional feedback for media controls across both the **Multi-Tab Live Media Deck** and the **Hero Media Player** exhibited crucial functional gaps:
1. **Multi-Tab Live Media Deck Scrubber Inaction:**
   - The mini-scrubber inside each media deck card (`.deck-mini-scrubber`) only visually rendered passive progress (`style.width = pct%`). Clicking, scrubbing, or dragging on the bar did not dispatch an absolute seek command to the target media tab.
2. **Missing Absolute Seek & Clamping in Backend and Content Script:**
   - In `background.js`, `handleRemoteMediaCommandExecution` only recognized relative seek (`seek_relative`). It rejected or ignored `seek_to` / `seek_absolute` (seeking to exact seconds) and `seek_percent`.
   - In `content_media.js`, `handleMediaControl` only had handling for `seek_relative` and partial `seek_percent`, while `seek_to` was absent from `KNOWN_MEDIA_ACTIONS` causing dropped commands. Boundary clamping against `[0, duration]` and YouTube player duration fallbacks were incomplete.
3. **Multi-Tab Live Media Deck "Switch to Tab" Button:**
   - Deck cards displayed title, platform, and domain badges, but lacked a dedicated accessible "Switch Tab" action button to immediately jump to and focus that specific tab and window in the browser.
4. **Hero Player Backend Relay & Telemetry Synchronization:**
   - The Hero Player timeline scrubber, volume slider, mute, and play/pause controls in `dashboard.js` communicated via mixed IPC types (`CONTROL_MEDIA`, `SET_VOLUME`, direct scripting). A unified command schema was needed to guarantee that changes on either the Hero Player or the Multi-Tab deck immediately synchronize with the background worker and broadcast updated telemetry (`LIVE_MEDIA_UPDATE`) to all extension views.
5. **Strict UI/UX Preservation:**
   - All visual layouts, Liquid Glass styling, CSS classes, typography, and DOM IDs must be 100% preserved with zero layout shifts and strictly zero `innerHTML` usage (W3C Trusted Types compliant).

### Architectural Solution & Target End-State
We execute a structured four-phase, full-stack bidirectional wiring initiative:
1. **Phase 1: Backend Service Worker Command Dispatch & Tab Navigation (`background.js`):**
   - Enhance `handleRemoteMediaCommandExecution(tabId, command, value)` to support `seek_to` / `seek_absolute`, `seek_percent`, `seek_relative`, and `switch_tab` / `focus_tab`.
   - Promote `activateAndFocusTab(targetId)` to top-level background scope to handle window un-minimization and tab focusing.
   - Synchronize optimistic state in `tabMediaMap` and broadcast `LIVE_MEDIA_UPDATE` upon every remote command execution.
2. **Phase 2: Content Script Precision Seeking & Media Controls (`content_media.js`):**
   - Whitelist `seek_to`, `seek_absolute`, and `focus_tab` in `KNOWN_MEDIA_ACTIONS`.
   - Implement rigorous `seek_to` handling in `handleMediaControl` with duration clamping `[0, duration]`, YouTube iframe API fallbacks, and HTML5 video/audio element updates.
   - Dispatch immediate telemetry update (`sendMediaTelemetryUpdate()`) following command execution.
3. **Phase 3: Dashboard Media Deck & Hero Player UI Controls Wiring (`src/dashboard/features/media_deck_visualizer_feature.js` & `dashboard/dashboard.js`):**
   - Add dedicated accessible "Switch Tab" button (`.btn-deck-switch-tab`) to each deck card controls row.
   - Attach interactive click/seek listener to `.deck-mini-scrubber` computing bounding box click ratio and dispatching `seek_to`.
   - Ensure Hero Player controls (Play/Pause, Mute/Unmute, Volume Slider, Switch to Tab, Seek Bar) use robust IPC and optimistic UI updates.
   - Guarantee 100% W3C Trusted Types compliance (0 `innerHTML`).
4. **Phase 4: QA Verification, Automated Test Suite & Regression Gate (`tests/test_media_deck_controls_wiring.js`):**
   - Author a comprehensive automated test battery testing all 4 phases end-to-end.
   - Verify 100% UTF-8 with BOM on all files and 0 leaks via `gitleaks`.
   - Execute `node run_all_tests.js` certifying 56/56 clean test suite pass with exit code 0.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Focus & Scope | Assigned Role | Status | Test Gate | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Backend Service Worker Wiring | Wire `seek_to`, `seek_percent`, `switch_tab` into `background.js` and dispatch runtime broadcasts | Level 4 Backend Engineer | READY_TO_EXECUTE | AST syntax check, unit test gate | Pending Gate 1 |
| **Phase 2** | Content Script Seek & Controls | Implement `seek_to` in `content_media.js` with duration clamping and immediate telemetry dispatch | Level 4 Content Script Engineer | READY_TO_EXECUTE | AST syntax check, media control tests | Pending Gate 2 |
| **Phase 3** | Dashboard Media Deck & Hero Controls | Add Switch Tab button, clickable scrubber seek, optimistic updates in `media_deck_visualizer_feature.js` & `dashboard.js` | Level 4 Frontend Engineer | READY_TO_EXECUTE | DOM interaction tests, Trusted Types check | Pending Gate 3 |
| **Phase 4** | QA Verification & Regression Gate | Comprehensive test suite `tests/test_media_deck_controls_wiring.js`, UTF-8 BOM check, and full repository test run | Level 4 QA Verification Tester | READY_TO_EXECUTE | `node run_all_tests.js` (100% PASS) | Pending Grade A+ |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `background.js` | `handleRemoteMediaCommandExecution` only supports relative seek and lacks `seek_to`/`seek_absolute` and `switch_tab` commands | Add cases for `seek_to`, `seek_absolute`, `seek_percent`, and `switch_tab` (invoking `activateAndFocusTab`); broadcast `LIVE_MEDIA_UPDATE` | Full command coverage for all remote card controls and seamless browser tab switching | Phase 1 | `tests/test_media_deck_controls_wiring.js` Battery 1 |
| 2 | `content_media.js` | `KNOWN_MEDIA_ACTIONS` lacks `seek_to`/`seek_absolute` and `handleMediaControl` lacks dedicated seek clamping against `duration` | Whitelist `seek_to` and `seek_absolute`; implement explicit handling with `[0, duration]` safety and immediate telemetry dispatch | Precise timeline positioning across all web media platforms (YouTube, Netflix, HTML5) | Phase 2 | `tests/test_media_deck_controls_wiring.js` Battery 2 |
| 3 | `src/dashboard/features/media_deck_visualizer_feature.js` | Mini-scrubber `.deck-mini-scrubber` is a non-interactive passive bar and card controls lack a "Switch Tab" button | Add click listener to `.deck-mini-scrubber` computing bounding box ratio to seek; add `.btn-deck-switch-tab` button; wire optimistic updates | High-polish interactive control deck with zero layout shift and 100% Trusted Types safety | Phase 3 | `tests/test_media_deck_controls_wiring.js` Battery 3 |
| 4 | `dashboard/dashboard.js` | Hero Player and Deck IPC synchronization requires uniform handling for `seek_to`, `switch_tab`, and telemetry refresh | Align Hero Player handlers with background `seek_to` and `switch_tab` actions without modifying any visual layout or markup | Flawless bidirectional sync between Hero Player and Multi-Tab Live Media Deck | Phase 3 | `node -c dashboard/dashboard.js` |
| 5 | `tests/test_media_deck_controls_wiring.js` | No automated test suite validating multi-tab remote media controls, scrubber seek math, and tab switching end-to-end | Create dedicated automated test suite testing all 4 phases end-to-end with simulated chrome APIs and DOM elements | Rigorous regression protection and permanent verification artifact | Phase 4 | `node tests/test_media_deck_controls_wiring.js` |
| 6 | Repository Test Suite | 55 test suites must remain 100% green without regressions | Execute `node run_all_tests.js` to ensure 56/56 test suites pass with exit code 0 | Complete system-wide stability certified | Phase 4 | `node run_all_tests.js` |
| 7 | Global Secret & Security Audit | Secret leakage or security policy violations must be prevented | Execute `gitleaks detect --redact` and audit Trusted Types compliance (0 innerHTML) | Grade A+ security posture certified | Phase 4 | `gitleaks detect --redact` |

---

## 🛡️ 4. Invariants & Guardrails

1. **W3C Trusted Types & Security Standard:** Strictly zero `.innerHTML` or `.outerHTML` assignments. All DOM elements must be instantiated using `document.createElement`, `textContent`, and safe DOM APIs.
2. **UI/UX Preservation Hard Lock:** Do not modify existing CSS theme styling, Liquid Glass borders, Bento grid dimensions, or existing DOM IDs. The visual design must remain 100% pixel-perfect and identical.
3. **Non-Destructive Bidirectional IPC:** All IPC messages between Dashboard, Service Worker, and Content Scripts must adhere to canonical schema envelopes (`DASHBOARD_REMOTE_MEDIA_CMD`, `MEDIA_CONTROL`, `JUMP_TO_MEDIA_TAB`, `LIVE_MEDIA_UPDATE`).
4. **Boundary Clamping on Audio/Time Values:**
   - Volume: Clamped between `0.0` and `1.0`.
   - Seek Time: Clamped between `0.0` and `Math.max(0, duration)`.
   - Seek Percent: Clamped between `0.0` and `100.0`.
5. **UTF-8 with BOM Standard:** All newly created and modified files must contain the UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`).
6. **Zero Regression Gate:** All existing 55 test suites must pass 100% clean alongside the new test suite.
