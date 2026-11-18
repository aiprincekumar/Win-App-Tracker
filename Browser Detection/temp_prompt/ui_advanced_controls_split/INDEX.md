# Phase-wise Execution Tracking Board: UI Advanced Controls Split

> **Task ID:** `TASK-UI-ADVANCED-CONTROLS-SPLIT-001`  
> **Initiative:** Web Activity & Media Sentinel — Focus & Sleep Advanced Controls Modular Split & Modernization  
> **Governance Document:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Directory:** `temp_prompt/ui_advanced_controls_split/`  
> **Lead Department:** Dept 05 Frontend Engineering & Dept 08 QA & Testing  
> **Active Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Execution Status:** `WAITING_FOR_MANAGER_DECISION`  

---

## 📌 1. Executive Problem & Solution Dossier

### 1.1 Problem Statement
In `dashboard/dashboard.html` (`#paneWellbeing`), the "Focus & Digital Wellbeing" tab currently houses two monolithic advanced sections:
1. `#widgetFocusAdvanced` (Focus Advanced Controls)
2. `#cardSleepAdvanced` (Sleep Advanced Controls)

Both cards suffer from:
- **Visual Clutter & Mixed Concerns:** Task planning, custom duration steppers, acoustic soundscapes, completion chimes, strict distraction shielding, and cognitive health monitors are cramped inside a single card.
- **Obsolete Checkbox Inputs:** Toggles use standard HTML `<input type="checkbox">` elements rather than sleek, accessible, modern interactive toggle switches (`.switch-toggle`).
- **Single-Column Cramping:** Toggle controls and inputs are stacked in a narrow 1-column list, wasting horizontal screen real estate on desktop/laptop displays.
- **Underdeveloped Control Sets:** Complementary high-utility controls (such as Auto-Restart Break, Ambient Lighting Sync, White Noise Drift, and Full-Screen Sleep Blackout) are missing.

### 1.2 Targeted Architectural Solution
1. **Split Both Advanced Sections into 2 Modular Cards Each (4 Modular Bento Cards Total):**
   - **Card 1A: Focus Acoustic Environment & Session Planner (`#widgetFocusAdvancedPlanner`):** Dedicated to task goal setting, custom duration steppers, ambient soundscape generators, acoustic completion chimes, and session pacing aids.
   - **Card 1B: Focus Smart Shields & Cognitive Integrity (`#widgetFocusAdvancedShields`):** Dedicated to strict distraction shielding, real-time focus integrity scoring, background tab auto-muting, 12s box-breathing nudge, 20-20-20 posture alerts, and notification silencing.
   - **Card 2A: Bedtime Acoustics & Power-Nap Engine (`#widgetSleepAdvancedAcoustics`):** Dedicated to the 1-click 20m restorative power-nap banner, custom sleep duration steppers, sleep aid delta soundscapes, and gradual volume fade-out curves.
   - **Card 2B: Sleep Cutoff Sentinel & Power Automation (`#widgetSleepAdvancedAutomation`):** Dedicated to end-of-video cutoffs, inactivity detection triggers, timeout action dispatchers (pause/mute/close), bedtime video autoplay blocking, progressive circadian screen dimming, and memory-saver tab hibernation.
2. **Replace All Checkboxes with Modern Toggle Switches:** Implement accessible, cyber-dark glassmorphic `.switch-toggle` components with `.slider-round` thumbs, smooth bezier transitions, and keyboard focus states.
3. **Convert 1-Column Layouts to Responsive 2-Column CSS Grids:** Layout card bodies with `grid-template-columns: repeat(2, minmax(0, 1fr))` on desktop/laptop viewports, gracefully collapsing to 1-column on mobile screens (`< 850px`).
4. **Preserve Basic Sections Untouched:** `#widgetPomodoroSentinel` (Basic Focus Sentinel) and `#cardSleepSentinelHub` (Basic Sleep Sentinel) remain strictly unmodified and functional.
5. **Enforce Strict Phased Execution:** Phase 1 strictly delivers Frontend UI & CSS layout; Phase 2 executes independent QA verification; Phase 3 reports back to User/CEO prior to Phase 2 Backend Integration.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Identifier | Target Role | Assigned Scope | Gate Status | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `phase_01_frontend_cards_split_and_toggles.md` | Level 4 Frontend Engineer | Split advanced sections into 4 modular cards, replace checkboxes with modern switches, implement 2-column responsive layout, add extended controls | `PENDING_GATE` | Awaiting Dispatch |
| **02** | `phase_02_qa_verification_regression.md` | Level 4 QA Verification Subagent | Independent DOM verification, backward ID compatibility, responsive CSS audit, Trusted Types check, regression test suite | `BLOCKED_ON_01` | Awaiting Phase 1 |
| **03** | `phase_03_executive_reporting.md` | Level 2 Manager / Level 1 CEO | Synthesize completion proofs, verify terminal test output, formulate executive summary and user review before backend integration | `BLOCKED_ON_02` | Awaiting Phase 2 |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `dashboard/dashboard.html` | `#widgetFocusAdvanced` is a monolithic container mixing acoustic planning with distraction defense | Split into `#widgetFocusAdvancedPlanner` and `#widgetFocusAdvancedShields` with semantic header groups | Clean separation of concerns; zero layout breakage; existing element IDs preserved | Phase 1 | Battery 1 & 2 DOM audit |
| **02** | `dashboard/dashboard.html` | `#cardSleepAdvanced` is a monolithic container mixing bedtime audio with power cutoff automation | Split into `#widgetSleepAdvancedAcoustics` and `#widgetSleepAdvancedAutomation` with semantic header groups | Modular bento card hierarchy; intuitive mental model; existing element IDs preserved | Phase 1 | Battery 1 & 2 DOM audit |
| **03** | `dashboard/dashboard.html` | Advanced section toggles use basic HTML checkboxes `<input type="checkbox">` | Wrap inputs in `<label class="switch-toggle"><input ...><span class="slider-round"></span></label>` | Sleek, modern cyber-dark glassmorphic switches with accessible keyboard controls | Phase 1 | Battery 3 Switch Audit |
| **04** | `dashboard/styles/focus_sleep_advanced.css` | 1-column vertical flex layout results in excessive vertical scrolling on desktop viewports | Introduce responsive 2-column CSS grids (`.controls-2col-grid`) with responsive breakpoint (`@media (max-width: 850px)`) | Optimal screen real estate utilization on widescreen laptops and desktops | Phase 1 | Battery 4 CSS Layout Audit |
| **05** | `dashboard/dashboard.html` | High-utility focus and sleep features (e.g. Break Auto-Restart, Ambient Glow Sync, White Noise Drift) lack UI entrypoints | Add semantic UI elements with backward-compatible IDs and non-breaking default states | Richer feature set prepared for seamless Phase 2 backend wiring | Phase 1 | Battery 2 & 5 Regression Audit |
| **06** | `dashboard/dashboard.js` & `dashboard/styles/focus_sleep_advanced.css` | Potential risk of broken event listeners if element IDs are mutated | Preserve 100% of existing legacy IDs (`inputFocusGoal`, `toggleFocusAutoPauseMedia`, `toggleDashSleepFade`, etc.) | 0% regression risk; existing JS controllers and IPC handlers function seamlessly | Phase 2 | Master Test Suite 83/83 PASS |

---

## 📂 4. Artifact Directory Map

```
temp_prompt/ui_advanced_controls_split/
├── INDEX.md                                      # (This file) Live Tracking Board & 7-Column Diagnostic Matrix
├── SUMMARY.md                                    # Executive Architecture Summary & Technical Objectives
├── PRD.md                                        # Product Requirements Document (Personas, FRs, NFRs, Acceptance Criteria)
├── TRD.md                                        # Technical Requirements Document (HLD/LLD, DOM IDs, CSS Grid, Tokens)
├── DESIGN.md                                     # Design System & UI Specification (Glassmorphism, Tokens, Switches)
├── phase_01_frontend_cards_split_and_toggles.md  # Executable Phase 1 Prompt (Frontend Engineer)
├── phase_02_qa_verification_regression.md       # Executable Phase 2 Prompt (QA Verification Tester)
└── phase_03_executive_reporting.md               # Executable Phase 3 Prompt (Executive Synthesis & Handoff)
```

---

## 🛡️ 5. Risk Assessment & Mitigation Strategy

1. **Risk: DOM ID Regression for Existing Controllers**  
   *Mitigation:* All existing element IDs are cataloged in `TRD.md`. The Level 4 Frontend Engineer is strictly prohibited from altering or removing existing IDs. New extended controls use dedicated prefixed IDs.
2. **Risk: Basic Focus & Sleep Hub Interference**  
   *Mitigation:* `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` are quarantined as out-of-scope. Phase 2 verification will verify line-by-line that their DOM and event bindings are 100% untouched.
3. **Risk: Layout Shift on Smaller Viewports**  
   *Mitigation:* Responsive CSS media queries guarantee that the 2-column grid gracefully collapses to a single column below 850px, preventing horizontal scrolling or text clipping.
4. **Risk: Trusted Types Violation**  
   *Mitigation:* Zero use of `innerHTML` or unsanitized DOM insertion. Pure HTML static markup and declarative CSS styling only.
