# Phase 05: Popup JavaScript & HTML Views Modular Split

> **Document Type:** Dedicated Phase Instruction Set  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/phase_05_popup_javascript_and_html_views_modular_split.md`](phase_05_popup_javascript_and_html_views_modular_split.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Department:** Dept 05 (Frontend Engineering) & Dept 01 (Product Requirements)  
> **Target Agent Role:** Level 4 Frontend Engineer  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Status:** READY FOR EXECUTION (LOCKED UNDER DECISION GATE BARRIER)  

---

## 🎯 1. Phase Objective

Deconstruct the **3,750-line monolithic `popup/popup.js`** into clean, modular tab controllers under `src/popup/tabs/` and supporting components in `src/popup/`. Concurrently, perform a comprehensive structural hygiene audit on the two large HTML views — **`dashboard/dashboard.html`** (**1,112 lines**) and **`popup/popup.html`** (**753 lines**) — validating semantic ARIA hierarchies, ensuring zero broken element IDs, and certifying script tag linkage.

---

## 📋 2. Prerequisites & Inputs

- **Prerequisites:** Phase 01 through Phase 04 completed cleanly; all prior verification tests green.
- **Target Files:**
  - `popup/popup.js` (3,750 lines) — [popup.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L1-L3750)
  - `dashboard/dashboard.html` (1,112 lines) — [dashboard.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L1-L1112)
  - `popup/popup.html` (753 lines) — [popup.html](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L1-L753)
  - Target modular directory: `src/popup/`

---

## 🔍 3. Technical Context & File Anchors

1. **In `popup/popup.js`:**
   - Lines 1-200: State container, DOM element caches, and init event listeners.
   - Lines 201-650: Header status badges (`#todayHeaderTimeBadge`, `#hubStatusBadge`, `#wsStatusBadge`) and live polling.
   - Lines 651-1200: 6-tab navigation switching logic and pane lifecycle management.
   - Lines 1201-1800: Quick Settings & Smart Automations tab handlers.
   - Lines 1801-2400: Media Player tab controller, direct scripting injection, and fallback IPC relay.
   - Lines 2401-2950: Audio Lab & DSP equalizer sliders and preset select handlers.
   - Lines 2951-3400: Digital Wellness limits, sleep timer countdown, and sound chimes.
   - Lines 3401-3750: SQLite Data Hub sync status and toast banner notifications.

2. **In `dashboard/dashboard.html` & `popup/popup.html`:**
   - Deeply nested modal structures (`#omniCommandPaletteModal`, `#hotkeysCheatSheetModal`, `#confirmResetModal`).
   - Interactive components requiring exact IDs for event listeners (`#btnExportTrackingCsv`, `#btnExportMediaCsv`, `#btnResetEq`, `#heroAudioBoostSlider`).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Step 1: Modularize Popup Tab Controllers (`src/popup/tabs/`)**
   - Create `src/popup/tabs/tab_quick.js`: Quick Settings toggles, tracking mode selector, and active domain pill.
   - Create `src/popup/tabs/tab_media.js`: Media playback controls (play/pause, seek, volume, speed, fullscreen, PiP).
   - Create `src/popup/tabs/tab_automations.js`: Smart automation toggles (auto-pause background media, smart tab mute).
   - Create `src/popup/tabs/tab_wellness.js`: Digital wellness daily limit dials, alarms, and break reminders.
   - Create `src/popup/tabs/tab_audio.js`: Compact equalizer controls, 5 vertical biquad sliders, and boost slider.
   - Create `src/popup/tabs/tab_settings.js`: SQLite data hub port configuration, auto-sync intervals, and theme toggles.

2. **Step 2: Modularize Popup Components & Services (`src/popup/components/` & `services/`)**
   - Create `src/popup/components/header_badges.js`: Header badge updates (active time, HUD WS status, Data Hub status).
   - Create `src/popup/services/data_hub_service.js`: Background IPC querying for hub synchronization status.
   - Create `src/popup/state/popup_state.js`: Popup session state and hydration from `chrome.storage.local`.

3. **Step 3: Establish Root Facade in `popup/popup.js`**
   - Assemble `popup/popup.js` as the root entrypoint facade.
   - Ensure clean AST parsing in Node via `new vm.Script(code)` and zero dangling closing braces (preventing Bug 804:1).
   - Expose testable functions and state objects to the global scope (`window` / `globalThis`).

4. **Step 4: HTML Template Structural Hygiene**
   - In `dashboard/dashboard.html`: Audit all ARIA attributes (`role="tablist"`, `role="tab"`, `role="dialog"`, `aria-modal="true"`). Verify script tag `<script src="dashboard.js"></script>` at closing body.
   - In `popup/popup.html`: Verify 6-tab panel markup, accessibility labels, and script tag `<script src="popup.js"></script>`.
   - Preserve UTF-8 BOM encoding (`0xEF, 0xBB, 0xBF`) across all three files.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Brace Integrity Invariant:** `popup/popup.js` must have perfectly balanced braces and zero dangling tokens.
- **Element ID Invariant:** Do NOT alter or remove any existing HTML element `id` attributes; tests query them directly.
- **W3C Standard:** Zero assignments to `innerHTML` across all popup modules.

---

## 📦 6. Deliverables Manifest

- `src/popup/tabs/tab_quick.js`
- `src/popup/tabs/tab_media.js`
- `src/popup/tabs/tab_automations.js`
- `src/popup/tabs/tab_wellness.js`
- `src/popup/tabs/tab_audio.js`
- `src/popup/tabs/tab_settings.js`
- `src/popup/components/header_badges.js`
- `src/popup/services/data_hub_service.js`
- `src/popup/state/popup_state.js`
- `popup/popup.js` (Root Facade)
- `dashboard/dashboard.html` (Sanitized Template)
- `popup/popup.html` (Sanitized Template)

---

## 🧪 7. Local Verification Gate

Execute and pass all tests cleanly with exit code 0:
```powershell
node -c popup/popup.js
node tests/test_popup_phase1_quick_settings.js
node tests/test_popup_phase2_smart_automations.js
node tests/test_popup_phase3_digital_wellness_alarms.js
node tests/test_popup_phase4_studio_vault.js
node tests/test_popup_phase5_audio_lab_and_dsp.js
node tests/test_popup_sqlite_data_hub_sync.js
node tests/test_popup_formattime_resolution.js
node tests/test_six_tab_popup_architecture.js
```
