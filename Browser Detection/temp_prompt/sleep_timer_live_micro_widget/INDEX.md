# 🌙 Sleep Timer Live Micro-Widget in Left Navigation Panel: Master Index & Tracking Board

> **Document Type:** Master Index, Problem-Solution Dossier & Phase Tracking Board  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Initiative:** Sleep Timer Live Micro-Widget in Left Navigation Panel Matching Focus Sentinel  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Execution Strategy:** Strategy A — Fully Autonomous Phase-wise Execution (Autonomy Score: 1.0)  
> **Decision Gate Requirement:** `PROMPT_FILES_REQUIRED = YES` (Compound multi-module task spanning HTML sidebar markup, CSS keyframe animations, navigation controllers, real-time telemetry synchronization, and automated test batteries)

---

## 📋 1. Problem-Solution Dossier

### 1.1 Context & Background
The **Web Activity & Media Sentinel** Chrome extension (MV3) includes both a **Focus Sentinel (Pomodoro)** subsystem and an advanced **Sleep Timer** subsystem with radial dials, audio fade-outs, and media cutoffs. In the left navigation sidebar of the dashboard (`dashboard/dashboard.html`), the extension features a compact telemetry cluster (`.sidebar-hud-group`) containing a live micro-widget for Focus Sentinel (`#wellbeingLiveMicroWidget`).

Users clicking or activating this Focus Sentinel micro-widget benefit from an instantaneous deep-link experience: the dashboard activates the Wellbeing tab (`switchTab('wellbeing')`), smoothly scrolls the Pomodoro card into view (`scrollIntoView`), highlights the card with a transient glowing border (`@keyframes focusSentinelGlow`), and triggers a pulsing animation on the primary action button (`@keyframes focusStartBtnPulse`) while focusing it for immediate keyboard control.

### 1.2 Root Cause Analysis & Gaps
1. **Asymmetric Sidebar Telemetry HUD Cluster:**
   - While Focus Sentinel has a dedicated micro-widget showing live countdown and state in the left navigation sidebar, Sleep Timer status has historically been invisible in the sidebar. Users had to manually navigate to the Wellbeing tab to check remaining sleep time or timer state.
2. **Missing Sleep Deep-Linking & Haptic Guidance:**
   - There was no dedicated deep-linking function (`navigateToSleepSentinel()`) analogous to `navigateToFocusSentinel()`.
   - Clicking on a sleep widget did not scroll `#cardSleepSentinelHub` into view, nor did it trigger visual transient highlighting (`.sleep-card-highlight`) or button pulsing (`.highlight-pulse`) on `#btnDashSleepToggle`.
3. **Absence of Real-time Micro-Widget Telemetry Sync:**
   - The DOM elements `#sleepMicroClock`, `#sleepMicroMode`, and `#sleepMicroStatusDot` were not synchronized during sleep timer countdown ticks, background alarms, or storage state updates in `renderDashSleepTimer()`.
4. **Lack of Dedicated Automated Test Coverage:**
   - No unit or integration test suite existed in `tests/` verifying the sidebar sleep micro-widget markup, CSS animations, navigation controller, keyboard accessibility, or live telemetry transitions.

### 1.3 Solution Architecture & End-State Deliverables
1. **Phase 1: Micro-Widget HTML Markup & CSS Keyframes/Styling:**
   - Verify and finalize `#sleepLiveMicroWidget` in `.sidebar-hud-group` in `dashboard/dashboard.html` with full W3C accessibility (`role="button"`, `tabindex="0"`, `aria-label`, `title`).
   - Add `.sleep-micro-hud` styling in `dashboard/styles/layout.css` and `@keyframes sleepSentinelGlow` / `@keyframes sleepStartBtnPulse` in `dashboard/styles/components.css` with `@media (prefers-reduced-motion)` safety.
2. **Phase 2: Deep-Linking Controller & Navigation Handler:**
   - Implement `navigateToSleepSentinel()` in `dashboard/dashboard.js`, mirroring `navigateToFocusSentinel()`: switches tab to `wellbeing`, scrolls `#cardSleepSentinelHub` into view with smooth/auto behavior, applies `.sleep-card-highlight` and `.highlight-pulse` for 2000ms, and sets focus on `#btnDashSleepToggle`.
   - Bind click and keyboard (`Enter`, `Space`) events to `#sleepLiveMicroWidget`.
   - Expose `navigateToSleepSentinel` on `window` and `globalThis`.
3. **Phase 3: Real-Time Telemetry Synchronization:**
   - Wire `#sleepMicroClock`, `#sleepMicroMode`, and `#sleepMicroStatusDot` into `renderDashSleepTimer(timer)` in `dashboard/dashboard.js`.
   - Handle IDLE, RUNNING, PAUSED, FADING, and CANCELLED states with dynamic color dot badges (`online`, `warn`, `idle`) and formatted countdown strings (`MM:SS` or `HH:MM:SS`).
4. **Phase 4: Deterministic QA Battery & Master Regression Run:**
   - Author `tests/test_sleep_timer_live_micro_widget.js` with 7 comprehensive test batteries.
   - Run master test runner `node run_all_tests.js` confirming 100% pass rate with exit code 0.

---

## 📊 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | Target File | Root Cause & Failure Mechanism | Proposed Surgical Fix | Post-Fix System Impact | Phase # | Verification Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `dashboard/dashboard.html` | Left navigation sidebar lacks structured interactive Sleep Micro-Widget HUD alongside Focus Sentinel | Verify/embed `#sleepLiveMicroWidget` in `.sidebar-hud-group` with `#sleepMicroStatusDot`, `#sleepMicroClock`, and `#sleepMicroMode` | Users have persistent visibility into sleep timer countdown from any dashboard tab | Phase 1 | `node -e "assert(fs.readFileSync('dashboard/dashboard.html').includes('sleepLiveMicroWidget'))"` |
| 2 | `dashboard/styles/components.css` & `dashboard/styles/layout.css` | Missing sleep glow keyframes and micro-HUD hover states | Implement `@keyframes sleepSentinelGlow`, `@keyframes sleepStartBtnPulse`, `.sleep-micro-hud`, and reduced motion overrides | Symmetrical visual fidelity with cyber-indigo theme accents and WCAG AA compliance | Phase 1 | Inspection of CSS keyframes and class rules in test runner |
| 3 | `dashboard/dashboard.js` | Lack of deep-linking controller to navigate from sidebar to `#cardSleepSentinelHub` | Implement `navigateToSleepSentinel()` with haptics, tab switch, smooth scroll, pulsing glow, and CTA focus; bind click/keyboard events | 1-click seamless teleportation and focus acquisition for sleep management | Phase 2 | Unit test simulation of click and Enter/Space keyboard events |
| 4 | `dashboard/dashboard.js` | Telemetry in `renderDashSleepTimer` only updates hero card, leaving micro-widget static | Add `#sleepMicroClock`, `#sleepMicroMode`, `#sleepMicroStatusDot` update logic in `renderDashSleepTimer` | Live 1s ticking synchronization across all timer states | Phase 3 | Telemetry assertions across IDLE, RUNNING, PAUSED, FADING states |
| 5 | `tests/test_sleep_timer_live_micro_widget.js` | No automated regression test battery for sleep micro-widget functionality | Author 7-battery test suite covering DOM, CSS, navigation, keyboard, telemetry, exports, and security | Guarantees zero regression and certifies Grade A+ quality | Phase 4 | `node tests/test_sleep_timer_live_micro_widget.js` & `node run_all_tests.js` |

---

## 🚦 3. Phase Status Matrix

| Phase # | Phase Specification File | Assigned Role | Prerequisites | Status | Local Test Gate | Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | `phase_01_markup_and_styles.md` | Level 4 UI/Frontend Engineer | None | `Pending` | HTML syntax check & CSS lint verification | Pending |
| **Phase 2** | `phase_02_deeplink_and_navigation.md` | Level 4 UI/Frontend Engineer | Phase 1 Complete | `Pending` | Navigation & Event listener verification | Pending |
| **Phase 3** | `phase_03_telemetry_sync.md` | Level 4 Frontend Engineer | Phase 2 Complete | `Pending` | Telemetry state transition assertions | Pending |
| **Phase 4** | `phase_04_testing_qa_verification.md` | Level 4 QA Verification Specialist | Phase 3 Complete | `Pending` | 7-battery test suite & `node run_all_tests.js` | Pending |

---

## 🔒 4. Cross-Phase Handoff & Governance Contracts

- **Gate 1 -> Gate 2:** Phase 1 delivers complete DOM structure and CSS animations. Phase 2 binds interaction logic to the certified DOM IDs (`#sleepLiveMicroWidget`, `#cardSleepSentinelHub`, `#btnDashSleepToggle`).
- **Gate 2 -> Gate 3:** Phase 2 validates navigation routing and haptic feedback. Phase 3 hooks into `renderDashSleepTimer()` to drive live text and class updates on `#sleepMicroClock`, `#sleepMicroMode`, and `#sleepMicroStatusDot`.
- **Gate 3 -> Gate 4:** Phase 3 delivers verified real-time reactivity. Phase 4 runs the complete automated test battery, measures line-count limits (Universal Rule 28), verifies UTF-8 with BOM, and certifies Grade A+ signoff.

---

## 🛡️ 5. QA Evaluation & Grade A+ Criteria

1. **Zero InnerHTML Safety:** 100% W3C Trusted Types zero-innerHTML compliance. All DOM mutations use `textContent`, `classList`, or safe DOM APIs.
2. **Accessibility (WCAG 2.1 AA):** Complete keyboard navigation (`Enter` and `Space`), proper ARIA roles (`role="button"`, `tabindex="0"`, `aria-label`), and `@media (prefers-reduced-motion)` suppression.
3. **Deterministic Test Passage:** 100% pass rate in `tests/test_sleep_timer_live_micro_widget.js` and all master test suites in `node run_all_tests.js`.
4. **Encoding & Hygiene:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) preserved on all edited files; zero gitleaks findings.
