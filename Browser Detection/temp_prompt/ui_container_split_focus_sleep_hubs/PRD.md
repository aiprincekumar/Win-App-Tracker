# Product Requirements Document (PRD): UI Container Split for Focus & Sleep Hubs

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Initiative ID:** `TASK-UI-SPLIT-FOCUS-SLEEP-HUBS-001`  
> **Lead Department:** Dept 01 (Product Requirements) & Dept 04 (UI/UX Design)  

---

## 👥 1. User Personas & Problem Space

### Persona 1: Deep Work Engineer (Aryan)
- **Goal:** Enter extended deep-work sprints without distraction, track daily focus streaks, use Pomodoro intervals with custom soundscapes, and shield against social media domains.
- **Pain Point:** Currently, opening the Wellbeing tab displays the Sleep Timer alongside Focus, cluttering the view with bedtime controls and audio fade options that Aryan does not care about during work hours.

### Persona 2: Evening Media Consumer / Night Listener (Priya)
- **Goal:** Listen to podcasts, ambient music, or YouTube videos in bed with an automated sleep timer that fades out volume and pauses or closes tabs without sudden waking.
- **Pain Point:** Opening the Wellbeing tab at night subjects Priya to bright Pomodoro analytics, streak counters, and distraction shields that induce daytime work anxiety instead of relaxation.

---

## 🎯 2. Functional Requirements (FR)

| ID | Title | Priority | Description |
| :--- | :--- | :---: | :--- |
| **FR-01** | Sub-Hub Segmented Controller | **P0 (Must Have)** | Provide a segmented navigation pill bar (`#wellbeingSubNav`) inside `#paneWellbeing` with options: Focus Hub, Sleep Hub, Guardrails & Budgets, and Split View. |
| **FR-02** | Dedicated Focus Hub Container | **P0 (Must Have)** | Render `#widgetPomodoroSentinel` inside `#containerFocusHub` as a full-width or dedicated hero container with expanded dial visibility, soundscapes, presets, and goal chips. |
| **FR-03** | Dedicated Sleep Hub Container | **P0 (Must Have)** | Render `#cardSleepSentinelHub` inside `#containerSleepHub` as a dedicated nighttime hero container with large countdown dial, presets, fade curve selector, and cutoff actions. |
| **FR-04** | Dedicated Guardrails Hub Container | **P1 (Should Have)** | Render Domain Daily Budgets (`#cardDomainBudgets`), Tracking Blacklist (`#cardTrackingBlacklist`), and Pinned Domains (`#cardPinnedDomainsQuickview`) inside `#containerGuardrailsHub`. |
| **FR-05** | View State Persistence | **P0 (Must Have)** | Persist the user's active sub-hub selection in `localStorage` (`sentinel_wellbeing_active_subhub`) so returning to the Wellbeing tab restores their last preferred sub-view. |
| **FR-06** | Omni-Palette & Micro-HUD Deep-Linking | **P1 (Should Have)** | Provide direct Omni Command Palette navigation items to jump directly to Focus or Sleep sub-hubs, and deep-link from the sidebar micro-widget (`#wellbeingLiveMicroWidget`). |
| **FR-07** | Bilingual Localization (en/hi) | **P1 (Should Have)** | Provide complete English and Hindi translations for all sub-hub pills, tooltips, and header text. |

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01: Performance & Web Vitals:** Sub-hub tab switching must complete in under **16ms** (60fps) with zero Cumulative Layout Shift (CLS < 0.05).
- **NFR-02: Backward Compatibility:** All existing DOM IDs and classes must remain intact. Zero test suite regressions across 83+ existing suites.
- **NFR-03: Security & Trusted Types:** 100% W3C Trusted Types safe. Prohibit `innerHTML` or string evaluation.
- **NFR-04: Accessibility (WCAG 2.1 AA):** All segmented pill buttons must have valid `role="tab"`, `aria-selected`, `aria-controls`, and full keyboard navigation (Left/Right arrow keys, Enter, Space).
- **NFR-05: Cyber-Dark Design Aesthetics:** Glassmorphic translucent cards (`backdrop-filter: blur(16px)`), calibrated borders (`rgba(255,255,255,0.08)`), and emerald (Focus) vs sky/indigo (Sleep) glow accents.
- **NFR-06: Code Maintainability:** All JavaScript functions must be <= 50 lines with nesting depth <= 3 per Universal Rule 28.

---

## 📖 4. INVEST-Compliant User Stories

### US-01: Focused Deep Work Immersion
**As a** software engineer in a deep-work block,  
**I want to** view only the Focus Sentinel and its ambient soundscapes in a dedicated full-width view,  
**So that** I am not distracted by bedtime or sleep timer controls.

### US-02: Calming Bedtime Sleep Timer Configuration
**As a** user winding down at night,  
**I want to** open the Sleep Sentinel Hub without seeing productivity targets and daily streaks,  
**So that** I can peacefully set my audio fade curve and sleep timer.

### US-03: Sub-Hub Preference Persistence
**As a** frequent dashboard user,  
**I want** my preferred sub-hub (Focus or Sleep) to be remembered automatically across browser sessions,  
**So that** I don't have to re-select my view every time I switch tabs.

### US-04: Power-User Keyboard & Omni-Palette Navigation
**As a** keyboard-centric power user,  
**I want to** type "Focus" or "Sleep" into the Omni Command Palette (`Ctrl+K`),  
**So that** I can jump directly to the target sub-hub instantly.

---

## 📋 5. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Sub-Hub Switching
- **Given** the user is viewing `#paneWellbeing` in the dashboard,
- **When** the user clicks `#btnSubHubSleep` (or presses Right Arrow to navigate to Sleep Hub),
- **Then** `#containerSleepHub` becomes visible (`display: block` or active class),
- **And** `#containerFocusHub` and `#containerGuardrailsHub` are hidden,
- **And** `#btnSubHubSleep` gains `aria-selected="true"` and class `active`.

### Contract 2: Preference Persistence
- **Given** the user has switched the sub-hub to `sleep`,
- **When** the user switches to the `tracking` tab and then returns to `wellbeing` (or reloads the page),
- **Then** the dashboard automatically reads `sentinel_wellbeing_active_subhub` from `localStorage`,
- **And** immediately activates `#containerSleepHub` without showing the Focus Hub first.

### Contract 3: Backwards Compatibility with Existing Tests
- **Given** the updated `dashboard.html` with container split,
- **When** test suites such as `test_focus_time_phase1_uiux.js` and `test_dashboard_sleep_hub_phase2_3.js` are executed,
- **Then** assertions for `#widgetPomodoroSentinel`, `#cardSleepSentinelHub`, `#paneWellbeing`, and all child controls pass with 100% success.

---

## 📊 6. MoSCoW Prioritization Matrix

- **Must Have (M):** Sub-hub segmented nav bar, `#containerFocusHub`, `#containerSleepHub`, `#containerGuardrailsHub`, `switchWellbeingSubHub()` controller, `localStorage` persistence, backward compatibility for all existing DOM IDs.
- **Should Have (S):** Split-view overview toggle option, Omni Command Palette direct actions, bilingual i18n keys for en/hi.
- **Could Have (C):** Keyboard shortcuts ('f' and 's') when focused inside `#paneWellbeing`.
- **Won't Have (W):** Removal or renaming of any existing element IDs; modifications to backend timer logic.
