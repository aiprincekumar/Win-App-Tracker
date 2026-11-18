# Product Requirements Document (PRD): Focus & Sleep Advanced Controls Modular Split

> **Document Type:** Product Requirements Document (PRD)  
> **Initiative:** Web Activity & Media Sentinel Dashboard Modernization  
> **Task ID:** `TASK-UI-ADVANCED-CONTROLS-SPLIT-001`  
> **Lead Department:** Dept 01 Product Requirements & Dept 05 Frontend Engineering  

---

## 👥 1. User Personas

1. **The Deep-Work Software Engineer (Alex):**  
   Spends 6–10 hours daily writing code and reviewing PRs. Needs instant visual feedback on focus cycles, zero distractions from background YouTube tabs, quick custom timers, ambient binaural beats, and an eye-strain reminder (20-20-20 rule).
2. **The Late-Night Media Consumer / Student (Priya):**  
   Listens to podcasts, video essays, or white noise while winding down in bed. Demands foolproof sleep timers, gentle audio fading so she doesn't jolt awake, automatic video cutoff when an episode ends, and screen dimming to protect melatonin cycles.
3. **The Ergonomics & Focus Purist (David):**  
   Monitors his attention integrity score, expects modern tactile UI controls (smooth toggle switches instead of outdated checkboxes), and values a clean 2-column bento grid dashboard that avoids vertical sprawl.

---

## 📋 2. Functional Requirements (FR)

- **FR-01 (Modular 4-Card Hierarchy):** The application dashboard must split the existing monolithic advanced sections into exactly four modular bento cards:
  - Card 1A: Focus Acoustic Environment & Session Planner
  - Card 1B: Focus Smart Shields & Cognitive Integrity
  - Card 2A: Bedtime Acoustics & Power-Nap Engine
  - Card 2B: Sleep Cutoff Sentinel & Power Automation
- **FR-02 (Untouched Basic Sections):** Card Pillar 1 (`#widgetPomodoroSentinel`) and Card Pillar 1.5 (`#cardSleepSentinelHub`) must remain 100% untouched in both DOM structure and runtime behavior.
- **FR-03 (Modern Switch Controls):** Every binary toggle across all 4 advanced cards must use the modern `.switch-toggle` component, replacing standard browser checkboxes.
- **FR-04 (Responsive 2-Column Layout):** Advanced card bodies must present controls in a balanced 2-column layout on viewports $\ge 851	ext{px}$, and collapse to a single column on viewports $< 851	ext{px}$.
- **FR-05 (Backward Compatibility of IDs):** All existing DOM element IDs, selectors, and event hooks must be preserved verbatim to ensure zero regression in existing JavaScript controllers.
- **FR-06 (Extended Controls Suite):** The new cards must introduce semantic UI representations for extended complementary features:
  - Focus: Break Auto-Restart (`#toggleFocusAutoRestartBreak`), Clock Ticking Rhythm (`#toggleFocusTicking`), Hard Domain Blockade (`#toggleFocusHardBlockade`), DND Notification Shield (`#toggleFocusDndNotifications`).
  - Sleep: White Noise Frequency Drift (`#toggleSleepWhiteNoiseDrift`), Gentle Wake Chime (`#toggleSleepGentleAlarm`), Close All Background Media Tabs (`#toggleSleepCloseAllMediaTabs`), OLED Blackout Overlay (`#toggleSleepDarkenDisplay`).

---

## 🛡️ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Layout Shift & Performance):** All card renders and toggle animations must operate at 60 FPS without layout thrashing (CLS = 0.00). Transitions must use CSS `transform` and `opacity`.
- **NFR-02 (WCAG 2.1 AA Accessibility):** All toggle switches must be keyboard-focusable (`Tab`, `Space`, `Enter`), declare semantic `aria-label` or `<label for="...">` associations, and maintain a minimum contrast ratio of 4.5:1 for text and 3:1 for active UI controls.
- **NFR-03 (W3C Trusted Types Compliance):** All DOM modifications must adhere strictly to W3C Trusted Types with zero use of `innerHTML`. All layout markup must be declarative HTML.
- **NFR-04 (Encoding Standard):** All modified and created files must strictly maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) to prevent terminal character corruption on Windows systems.
- **NFR-05 (Bilingual Internationalization Ready):** All visible text strings must include appropriate `data-i18n` attributes for Hindi and English bilingual parity.

---

## 💎 4. INVEST-Compliant User Stories

### US-01: Modular Card Division
**As a** dashboard user,  
**I want** the advanced focus and sleep options organized into distinct, focused cards,  
**So that** I can configure my acoustic environment and my protective shields independently without scanning a cluttered list.

### US-02: Sleek Interactive Switches
**As a** modern web user,  
**I want** tactile, smooth toggle switches instead of plain checkboxes,  
**So that** interacting with settings feels fluid, responsive, and visually polished.

### US-03: Responsive 2-Column Grid
**As a** widescreen desktop user,  
**I want** the advanced settings arranged in two responsive columns,  
**So that** all essential controls fit within my screen without excessive vertical scrolling.

### US-04: Extended Control Discovery
**As a** power user,  
**I want** clear toggle switches for advanced features like Break Auto-Restart and OLED Full Blackout,  
**So that** I have full granular control over my focus routines and bedtime automation.

---

## 🎯 5. MoSCoW Prioritization

| Priority | Features |
| :--- | :--- |
| **Must Have** | 4-card DOM split, modern `.switch-toggle` replacements, 2-column responsive layout, 100% ID preservation, basic section quarantine. |
| **Should Have** | Extended control switches with semantic IDs, bilingual `data-i18n` attributes, keyboard accessibility focus indicators. |
| **Could Have** | Visual status tooltips on extended toggles, subtle hover glow effects on switch thumbs. |
| **Won't Have (Phase 1)** | Backend implementation logic for new extended toggles (strictly reserved for Phase 2 Backend). |

---

## 📜 6. Given-When-Then Acceptance Criteria

### Scenario 1: Preserving Basic Cards
- **Given** the dashboard is loaded into the browser,
- **When** an inspector examines `#widgetPomodoroSentinel` and `#cardSleepSentinelHub`,
- **Then** both containers exist with their radial progress dials, preset buttons, and primary action handlers intact.

### Scenario 2: Verification of 4 Modular Cards
- **Given** the user navigates to the "Focus & Digital Wellbeing" tab (`#paneWellbeing`),
- **When** inspecting the DOM structure,
- **Then** exactly four advanced modular cards exist:
  - `#widgetFocusAdvancedPlanner`
  - `#widgetFocusAdvancedShields`
  - `#widgetSleepAdvancedAcoustics`
  - `#widgetSleepAdvancedAutomation`
- **And** each card carries class `bento-card liquid-glass-card bento-span-6`.

### Scenario 3: Toggle Switch Appearance & Interaction
- **Given** any toggle control in the four advanced cards,
- **When** rendered on screen,
- **Then** it presents as a `.switch-toggle` slider rather than a standard browser checkbox,
- **And** clicking or pressing Space toggles the checked state and animates the `.slider-round` thumb smoothly.

### Scenario 4: Responsive Column Collapse
- **Given** the dashboard is viewed on a screen with width $\ge 851	ext{px}$,
- **When** observing the advanced card control panels,
- **Then** controls are displayed in a balanced 2-column grid.
- **When** the viewport width is reduced below $851	ext{px}$,
- **Then** the layout smoothly shifts to a clean 1-column stack with zero overflow.
