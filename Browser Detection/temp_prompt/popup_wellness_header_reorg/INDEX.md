# Popup Mode Wellness Sub-Tabs & Header/Footer Layout Reorganization — Tracking Board & Dossier

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect / Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/INDEX.md`  
> **Status:** `ACTIVE / PROMPTS_GENERATED`  
> **Implementation Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Prompt Requirement:** `PROMPT_FILES_REQUIRED = YES`  
> **Target Width Standard:** 380px Fixed-Width Zero Horizontal Scrollbar Standard

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Challenge
The Chrome Extension Popup Mode for Web Activity & Media Sentinel requires ergonomic and architectural realignment across three critical areas:
1. **Wellness Section Monolithic Sub-Navigation:**
   Currently, the Tier 1 Wellness category (`#tier1BtnWellness`) only exposes a single sub-tab (`#mainTabSleep`). While Sleep Timer functionality is robust, user wellness workflows mandate multi-pillar support, beginning with a dedicated "Focus" sub-tab alongside "Sleep". The architecture needs a clean sub-tab structure that allows switching between Sleep and Focus panes without disturbing active bedtime timers, alarms, or background listeners.
2. **Header Visual Balance & Flow:**
   The current `.header-badges` cluster contains the media switch button (`#btnSwitchMediaTab`), full dashboard launcher (`#btnOpenDashboard`), Tier 1 category group nav (`#tier1SegmentedNav`), and quick settings gear (`#btnQuickSettings`) crammed in an arbitrary order. This causes cognitive clutter where primary category navigation is visually sandwiched between utility buttons.
3. **Gear / Quick Settings Button Errant Placement:**
   Positioning the Quick Settings button in the top header competes with the brand identity and primary tier-1 navigation. Moving `#btnQuickSettings` to the footer toolbar directly alongside `#btnThemeToggle` groups all configuration and appearance toggles into a unified bottom utility dock, freeing header space and creating a balanced, clean UI.

### 1.2 The Surgical Solution
1. **Tier 2 Wellness Sub-Tabs (Focus + Sleep):**
   - Introduce `#mainTabFocus` alongside `#mainTabSleep` tagged with `data-group="wellness"` and `data-view="focus"`.
   - Update `src/popup/features/tier1_navigation_feature.js` so `wellness` resolves to `['sleep', 'focus']`.
   - Provide `#viewFocusPane` with a high-polish, lightweight Focus Sentinel placeholder card, ensuring zero layout shift or console errors.
2. **Left-Aligned Category Nav & Right-Aligned Utility Buttons:**
   - Reorder `.header-badges` so `#tier1SegmentedNav` is aligned to the left of the badge cluster.
   - Group `#btnSwitchMediaTab` and `#btnOpenDashboard` to the right with clean micro-spacing and flexbox alignment.
3. **Footer Toolbar Integration & Upward Popover Anchor:**
   - Move `#btnQuickSettings` into `<footer>` directly preceding `#btnThemeToggle`.
   - Reposition `#quickSettingsPopover` from top-right (`top: 48px; right: 12px;`) to bottom-right (`bottom: 48px; right: 8px;`) with glassmorphism backdrop and clean z-index stacking.
   - Enforce 380px fixed-width geometry with zero horizontal scrollbar (`overflow-x: hidden`).

---

## 🚦 2. Phase Status Checklist & Execution Tracking

| Phase # | Phase Name | Target Scope | Lead Level 4 Subagent | Test Gate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | DOM Architecture & Bilingual i18n Foundation | Reorder header DOM, add Focus tab/pane, move gear to footer, update locales | Frontend Engineer | Local DOM / i18n assertions | `READY` |
| **Phase 02** | CSS Responsive Geometry & Popover Positioning | Header flex alignment, footer gear styling, bottom popover positioning, 380px geometry | Frontend CSS Specialist | Zero-scrollbar & theme visual gate | `READY` |
| **Phase 03** | Feature Engine & Interactive Runtime State Machine | Update `tier1_navigation_feature.js` wellness group, popup.js tab switching & popover | Core Runtime Engineer | State machine & tab sync simulation | `READY` |
| **Phase 04** | Test Suite Synchronization & Independent QA Verification | Synchronize existing 2-tier tests, author dedicated test suite, verify all 91 tests | Independent QA Tester | Exit Code 0 & 0 gitleaks leaks | `READY` |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `popup/popup.html` | Header elements in suboptimal order; missing Focus sub-tab under wellness; gear in header | Reorder `.header-badges`, add `#mainTabFocus` & `#viewFocusPane`, relocate `#btnQuickSettings` to `<footer>` next to `#btnThemeToggle` | Clean visual hierarchy, extensible wellness hub, footer settings dock | Phase 1 | `node tests/test_popup_wellness_and_header_reorg.js` |
| 2 | `locales/en.json` & `locales/hi.json` | Missing localization strings for Focus sub-tab and placeholder cards | Add `top_tab_focus`, `focus_tab_title`, and authentic Devanagari Hindi equivalents | 100% bilingual parity preserved with zero missing translation keys | Phase 1 | Bilingual parity validation script |
| 3 | `popup/popup.css` & `popup/styles/tabs.css` | Header badges flex alignment lacks left/right split; gear button styled for header; popover positioned from top | Left-align Tier 1 nav and right-align action buttons; style footer gear button; anchor popover upward (`bottom: 48px`) | Ergonomic 380px fixed width, zero horizontal scrollbars, natural upward flyout | Phase 2 | CSS token & viewport layout gate |
| 4 | `src/popup/features/tier1_navigation_feature.js` | `GROUP_TO_TABS.wellness` only maps `['sleep']`; `TAB_TO_GROUP.focus` mapped to legacy analytics | Update `GROUP_TO_TABS.wellness` to `['sleep', 'focus']`, update `TAB_TO_GROUP.focus` to `'wellness'`, update `ALL_TABS` | Pure state machine accurately resolves wellness sub-tabs; 100% testable contract | Phase 3 | Unit tests in `test_popup_wellness_and_header_reorg.js` |
| 5 | `popup/popup.js` | `I18N_POPUP` missing Focus tab strings; tab switching lacks explicit focus activation handler; popover positioning logic | Register i18n keys, bind `topTabFocusText`, ensure `switchTopTab('focus')` activates pane cleanly | Seamless click handling, zero regression on existing sleep timers or media listeners | Phase 3 | In-memory DOM state simulation test |
| 6 | `tests/test_popup_2tier_navigation.js` | Strict DOM order assertions check old header layout (`#btnOpenDashboard` before `#tier1SegmentedNav`, `#btnQuickSettings` in header) | Update assertions to validate new header layout and footer gear placement, and verify Focus in expected child tabs | 100% passing test suite across all 6 original batteries | Phase 4 | `node tests/test_popup_2tier_navigation.js` |
| 7 | `tests/test_popup_wellness_and_header_reorg.js` | No existing test suite explicitly testing the new wellness sub-tabs, footer gear, and header alignment | Author new dedicated multi-battery test suite covering all architectural invariants | Verifiable proof of correctness and regression safety | Phase 4 | Clean PASS Exit Code 0 |

---

## 🛡️ 4. Constitutional Architectural Guardrails
1. **Zero-InnerHTML & W3C Trusted Types Safety:** All dynamic text updates must use `.textContent` or `document.createElement`. Zero `innerHTML` assignments.
2. **UTF-8 with BOM Standard:** Every modified file must maintain the `0xEF, 0xBB, 0xBF` byte order mark.
3. **Fixed-Width 380px Standard:** The popup body and `.sentinel-app` container are strictly fixed to 380px width (`min-width: 380px; max-width: 380px; overflow-x: hidden;`). No horizontal scrollbar tolerated.
4. **Sleep Timer Non-Interference:** Existing sleep timer countdowns, radial SVG dial, bedtime automation, audio fade-outs, and background alarms must execute without interruption.
