# UI Container Split for Focus & Sleep Hubs: Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`, `tests/`  
> **Lead Departments:** Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Limitation
Currently, in the Web Activity & Media Sentinel dashboard:
1. **Visual Congestion:** Both `#widgetPomodoroSentinel` (Focus Sentinel & Pomodoro) and `#cardSleepSentinelHub` (Sleep Sentinel Hub) are co-located in a single crowded 2-column bento grid (`bento-span-6` each) within `#paneWellbeing`.
2. **Ergonomic Compression:** Critical interactive widgets (the 140x140 SVG radial dials, soundscape mixer, duration presets, task inputs, fade curve dropdowns, and extender buttons) are visually cramped into narrow 50% width columns, requiring vertical scrolling and reducing visual prominence.
3. **Contextual Collision:** Focus deep-work productivity (Pomodoro, streak badges, task chips, strict shields) and restful bedtime media cutoff (sleep countdown, audio fade curves, bedtime recovery) represent opposing psychological mindsets. Forcing them to coexist simultaneously in the user's immediate viewport degrades UX clarity.
4. **Guardrail Isolation:** Domain daily time budgets, privacy blacklist, and pinned domains are pushed far down beneath both hero cards, making configuration difficult to access.

### 1.2 The Architectural Solution
Implement a clean, modular **UI Container Split** inside the Wellbeing subsystem utilizing a high-performance **Glassmorphic Sub-Hub Segmented Controller** (`#wellbeingSubNav`):
1. **Sub-Hub 1: 🎯 Focus Sentinel Hub (`#containerFocusHub`):** A full-width (`bento-span-12`), immersive productivity command center featuring an expanded hero radial dial, ambient soundscape controls, task goal inputs, acoustic chimes, and zen mode.
2. **Sub-Hub 2: 🌙 Sleep Sentinel Hub (`#containerSleepHub`):** A dedicated, serene moonlit night-mode environment (`bento-span-12`) featuring the sleep timer countdown dial, quick presets (15m-120m), gradual audio fade curve controls, inactivity triggers, and timeout cutoff actions.
3. **Sub-Hub 3: 🛡️ Productivity & Privacy Guardrails (`#containerGuardrailsHub`):** An organized dedicated hub for Domain Daily Time Budgets (`#cardDomainBudgets`), Privacy Tracking Exclusion Blacklist (`#cardTrackingBlacklist`), and Pinned Domains Quick Access (`#cardPinnedDomainsQuickview`).
4. **Sub-Hub 4: 🔲 Bento Split Overview (`#containerWellbeingSplitView` / toggle):** Seamless backward-compatible side-by-side bento overview preserving simultaneous monitoring for multi-monitor or power users.

**Zero Regression Guarantee:**
- All existing DOM element IDs (`#widgetPomodoroSentinel`, `#cardSleepSentinelHub`, `#paneWellbeing`, `#navTabWellbeing`, `#wellbeingLiveMicroWidget`, etc.) remain 100% preserved.
- All existing automated test suites (83+ test suites) will continue to pass without any breaking changes.
- 100% W3C Trusted Types safe with zero innerHTML mutations.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | DOM Container Split & Segmented Sub-Nav Architecture | `dashboard/dashboard.html` | Level 4 Frontend Engineer | `node -e "const fs=require('fs'),h=fs.readFileSync('dashboard/dashboard.html','utf8'); console.assert(h.includes('id=\"wellbeingSubNav\"') && h.includes('id=\"containerFocusHub\"') && h.includes('id=\"containerSleepHub\"')); console.log('Phase 1 DOM OK')"` | ⏳ READY |
| **02** | Glassmorphic Styling, Smooth Transitions & Responsive Layouts | `dashboard/dashboard.css` | Level 4 UI/UX Engineer | `node -e "const fs=require('fs'),c=fs.readFileSync('dashboard/dashboard.css','utf8'); console.assert(c.includes('.wellbeing-sub-nav') && c.includes('.wellbeing-sub-container')); console.log('Phase 2 CSS OK')"` | ⏳ READY |
| **03** | Controller Sub-Hub State Machine, Storage & Omni-Palette | `dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -e "const fs=require('fs'),j=fs.readFileSync('dashboard/dashboard.js','utf8'); console.assert(j.includes('switchWellbeingSubHub') && j.includes('sentinel_wellbeing_active_subhub')); console.log('Phase 3 JS OK')"` | ⏳ READY |
| **04** | Comprehensive QA Verification Suite & Master Regression | `tests/test_ui_container_split_focus_sleep_hubs.js`<br>`node run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_ui_container_split_focus_sleep_hubs.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | Focus Sentinel (`#widgetPomodoroSentinel`) and Sleep Hub (`#cardSleepSentinelHub`) cramped side-by-side in `#paneWellbeing`. | Wrap elements into dedicated semantic containers (`#containerFocusHub`, `#containerSleepHub`, `#containerGuardrailsHub`) with `#wellbeingSubNav` segmented pill bar. | Full backward compatibility; clean layout separation with zero DOM ID disruption. | Phase 1 | Sub-hub container DOM assertion |
| **2** | `dashboard/dashboard.css` | Lack of styling for sub-hub segmented nav pills and container display toggles/transitions. | Add `.wellbeing-sub-nav`, `.sub-nav-pill`, `.wellbeing-sub-container`, and expanded `bento-span-12` glassmorphic styling. | Beautiful Cyber-Dark glassmorphism, 60fps micro-motion, and responsive mobile stacking. | Phase 2 | CSS class and selector audit |
| **3** | `dashboard/dashboard.js` | Monolithic `switchTab('wellbeing')` has no sub-hub view state machine or persistence. | Implement `switchWellbeingSubHub(subHubKey)` with ARIA state updates and `localStorage` caching (`sentinel_wellbeing_active_subhub`). | Instant, persistent tab switching; seamless restoration across page refreshes. | Phase 3 | In-memory AST test for controller functions |
| **4** | `dashboard/dashboard.js` | Omni-palette and sidebar micro-widget cannot directly target Focus vs Sleep views. | Add dedicated Omni-palette actions (`nav-focus-hub`, `nav-sleep-hub`, `nav-guardrails`) and intelligent micro-widget routing. | Enhanced power-user workflow and 1-click keyboard accessibility. | Phase 3 | Omni-palette command registry audit |
| **5** | `dashboard/dashboard.js` | Bilingual i18n dictionary missing localized strings for sub-hub segmented tabs. | Add `subhub_focus`, `subhub_sleep`, `subhub_guardrails`, `subhub_split` in English and Hindi dictionaries. | Flawless bilingual parity (en/hi) adhering to W3C standards. | Phase 3 | Dictionary key parity test |
| **6** | `tests/test_ui_container_split_focus_sleep_hubs.js` | Absence of automated test suite verifying the UI container split and sub-hub state machine. | Author comprehensive 8-battery QA suite verifying DOM, CSS, JS, i18n, storage, and backward compatibility. | 100% test coverage and permanent regression defense. | Phase 4 | `node tests/test_ui_container_split_focus_sleep_hubs.js` (Exit Code 0) |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **UTF-8 with BOM Standard:** All modified and newly authored files must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
2. **Function Length Limit:** All modified and new functions in `dashboard.js` must strictly adhere to <= 50 lines per Universal Rule 28.
3. **W3C Trusted Types Compliance:** Absolute prohibition on `innerHTML`, `outerHTML`, or `document.write`. All DOM mutations must use `textContent`, `setAttribute`, or DOM element creation methods.
4. **Zero DOM Breaking Changes:** All existing IDs (`#widgetPomodoroSentinel`, `#cardSleepSentinelHub`, `#paneWellbeing`, etc.) must remain in the DOM with identical attributes so that all existing test suites pass.
5. **Zero-Code Hard Lock:** Level 1 CEO and Level 2 Manager never touch code; Level 4 subagents execute with explicit `AUTH-MGR-*` token.
