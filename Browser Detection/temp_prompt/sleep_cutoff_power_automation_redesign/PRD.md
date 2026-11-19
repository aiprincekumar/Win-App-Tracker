# Product Requirements Document (PRD): Sleep Cutoff Sentinel & Power Automation Redesign

> **Document Type:** Product Requirements Document (`PRD.md`)  
> **Initiative:** Sleep Cutoff Sentinel & Power Automation Redesign  
> **Target Container:** `temp_prompt/sleep_cutoff_power_automation_redesign/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 👥 1. User Personas & Problem Context

### 1.1 Primary Personas
1. **The Night Owl Power User:** Works or consumes media late at night and requires automated shutoff, screen dimming, and tab cleanup to avoid sleep disruption and noisy cooling fans.
2. **The Mindful Digital Worker:** Values clean, cohesive, distraction-free aesthetics. Expects visual parity and ergonomic consistency across all hub controls in the extension dashboard.

### 1.2 Pain Points
- The current Sleep Cutoff Sentinel section in `dashboard.html` features an asymmetric column distribution where column panels have disparate numbers of items (4 on left vs 3 on right), followed by a disconnected full-span group.
- The visual hierarchy feels disjointed compared to the sleek, balanced 2xN grid of the Focus Settings section directly above it.
- Lack of hover elevation and compact ergonomics diminishes the tactile feedback expected in a modern cyber-dark interface.

---

## 🎯 2. Functional Requirements (FR)

| Req ID | Requirement Statement | Priority |
| :--- | :--- | :--- |
| **FR-01** | The Sleep Cutoff Sentinel & Power Automation section must present all 10 automation controls in a balanced 2-column grid (5 rows of 2 cards). | P0 (Must Have) |
| **FR-02** | All 9 toggle controls must render as modern switch toggles using `<label class="switch-toggle">`, `<input type="checkbox" role="switch" class="switch-input dash-sleep-switch-input">`, and `<span class="slider-round"></span>`. | P0 (Must Have) |
| **FR-03** | The `selectDashSleepTimeoutAction` control must be cleanly integrated into a dedicated card matching the height, padding, border, and typography of toggle cards. | P0 (Must Have) |
| **FR-04** | All existing IDs, default states, event bindings, and `data-i18n` bilingual tags must be 100% preserved. | P0 (Must Have) |
| **FR-05** | The grid must automatically collapse to a single column on viewports <= 768px for mobile and compact window compatibility. | P1 (Should Have) |

---

## 🚀 3. Non-Functional Requirements (NFR)

| NFR ID | Category | Requirement Statement |
| :--- | :--- | :--- |
| **NFR-01** | Visual Parity & Ergonomics | Card padding (9px 12px), border-radius (10px), min-height (52px), and hover elevation (`translateY(-1px)`) must match `.dash-focus-toggle-row`. |
| **NFR-02** | Accessibility (WCAG 2.1 AA) | All interactive controls must have accessible names (`aria-label`), `role="switch"` on checkboxes, and visible focus rings on keyboard navigation (`:focus-visible`). |
| **NFR-03** | Performance & Rendering | Pure CSS layout with zero runtime JS reflow penalties; transitions limited to GPU-accelerated `transform` and `opacity`. |
| **NFR-04** | Security & Trusted Types | 100% W3C Trusted Types and CSP compliance; zero usage of `innerHTML` or unsafe inline event handlers. |
| **NFR-05** | Internationalization (i18n) | Complete bilingual English/Hindi localization preserved across all titles, descriptions, and dropdown options. |

---

## 📖 4. INVEST-Compliant User Stories

### Story US-01: Balanced 2-Column Automation Layout
- **As a** user configuring night-time and bedtime automation,  
- **I want** the Sleep Cutoff Sentinel toggles arranged in a balanced 2-column grid,  
- **So that** scanning and configuring power automation features is intuitive, ergonomic, and aesthetically pleasing.

### Story US-02: Consistent Modern Switch Toggles
- **As a** user interacting with sleep automation toggles,  
- **I want** modern animated switch toggles matching the Focus Settings controls,  
- **So that** I get clear visual and tactile feedback when activating or deactivating automation rules.

### Story US-03: Seamless Timeout Action Select Card
- **As a** user selecting what happens when the sleep countdown expires,  
- **I want** the timeout action dropdown integrated smoothly alongside the toggles,  
- **So that** the layout remains balanced without breaking the 2-column grid rhythm.

---

## ✅ 5. Given-When-Then Acceptance Criteria

### Scenario 1: Desktop Viewport Grid Layout
- **Given** the user navigates to the Focus & Sleep Hub (`#paneWellbeing`) on desktop,
- **When** the "Sleep Cutoff Sentinel & Power Automation" section is displayed,
- **Then** the controls are rendered in a 2-column grid with exactly 2 cards per row across 5 rows.

### Scenario 2: Switch Toggle Interaction & Visual Elevation
- **Given** the user hovers over any toggle card,
- **When** the cursor enters the card boundary,
- **Then** the card elevates subtly (`translateY(-1px)`) with heightened background glass opacity.
- **When** the user clicks the switch toggle,
- **Then** the smooth slider animation executes and the underlying checkbox state flips with an active gradient accent.

### Scenario 3: Responsive Mobile Viewport
- **Given** the dashboard is resized to a width <= 768px,
- **When** the Sleep Cutoff Sentinel section is rendered,
- **Then** the grid shifts smoothly from 2 columns to 1 column without horizontal scrolling or text clipping.
