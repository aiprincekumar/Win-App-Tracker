# Product Requirements Document (PRD): Light Mode Visibility & Contrast Fix

> **Initiative:** Light Mode UI/UX Visibility & Contrast Hardening  
> **Workspace Container:** `temp_prompt/light_mode_visibility_contrast_fix/`  
> **Document Role:** Functional & Non-Functional Product Requirements Specification  
> **Governing Standards:** WCAG 2.1 Level AA & AAA, INVEST User Stories, MoSCoW Prioritization  

---

## 👥 1. User Personas & Problem Scenarios

### 1.1 Persona A: Daytime Focused Knowledge Worker ("Alex")
- **Profile:** Works in bright ambient daylight or high-luminance office environments where dark mode causes screen glare and eye fatigue. Toggles to Light Mode during daytime work sessions.
- **Pain Points:**
  - Cannot read table headers in Domain Breakdown or Media History because the headers are dark black/slate boxes with low-contrast text.
  - Hovering over media playback controls makes the icons disappear into white backgrounds.
  - Cannot read preset buttons in Sleep or Focus Hubs because the button text is pale slate `#cbd5e1` on white.
  - Danger Zone action cards look muddy with unreadable pink warning text on dark surfaces.

### 1.2 Persona B: Executive Reviewer & Compliance Auditor ("Sarah")
- **Profile:** Audits time tracking logs, media consumption digests, and privacy exclusion rules. Requires clear visual hierarchy, accessible contrast (WCAG AAA), and distinct interactive states.
- **Pain Points:**
  - Export tiles (CSV, HTML report) look low-contrast and washed out in Light Mode.
  - Privacy exclusion blacklist empty state is hard to identify.
  - Needs reassurance that Dark Mode functionality is completely untouched.

---

## 📋 2. Functional Requirements (FR) & MoSCoW Prioritization

### Must Have (P0)
- **FR-01 (Table Headers):** Both `#domainAnalyticsTable` and `#mediaHistoryTable` headers (`.modern-data-table th`) must render with a light, crisp background (`#f1f5f9`), dark slate text (`#1e293b`), and clear bottom border (`#cbd5e1`) in Light Mode.
- **FR-02 (Visualizer Controls):** Action buttons (`.btn-viz-action-icon`, `.viz-btn-segmented`, `.btn-viz-drawer-close`) in the Audio Visualizer deck must render with light backgrounds (`rgba(0, 0, 0, 0.05)`), subtle borders (`rgba(0, 0, 0, 0.12)`), and high-contrast icon glyphs (`#334155` idle, `#0f172a` hover).
- **FR-03 (Media Playback & Volume Toolbar):** Hero player controls (`.btn-ctrl-hero`, `.btn-ctrl-hero-stepper`) must maintain dark text on hover (never `#fff`), and volume slider tooltips must render dark text on light containers.
- **FR-04 (Preset Buttons):** Sleep preset buttons (`.dash-sleep-preset-btn`) and Focus preset buttons (`.dash-focus-preset-btn`) must have high contrast text (`#1e293b` idle, `#0284c7` / `#059669` active) with crisp borders in Light Mode.
- **FR-05 (Ambient Soundscapes):** Soundscape panels (`.sleep-soundscape-panel`, `.focus-soundscape-panel`) must feature light card backgrounds (`rgba(241, 245, 249, 0.7)`), legible titles (`#0f172a`), and styled select controls.
- **FR-06 (Power-Nap Banner):** Power-nap banner (`.sleep-power-nap-banner`) must feature deep indigo title text (`#1e1b4b`), dark slate descriptions (`#475569`), and a prominent call-to-action button.
- **FR-07 (Sleep Cutoff Toggles):** Sleep cutoff sentinel rows (`.dash-sleep-toggle-row`) must feature white card backgrounds (`#ffffff`), dark headings (`#0f172a`), muted subtext (`#64748b`), and light select dropdowns (`#ffffff` bg, `#0f172a` text).
- **FR-08 (Blacklist Empty State & Chips):** Blacklist pattern grid (`.blacklist-chips-grid`) must have a light background (`#f8fafc`), high-contrast italic placeholder text (`#64748b`), and legible red chips.
- **FR-09 (Danger Zone):** Danger zone card (`.settings-card.danger-card`) must feature a soft rose light background, `#991b1b` warning text (8.5:1 contrast against `#fef2f2`), and clear outline/solid danger buttons.
- **FR-10 (Data Export Cards):** Export tiles (`.export-tile`) must render clean white card backgrounds (`#ffffff`), dark titles (`#0f172a`), and high-contrast action buttons (`.btn-export-tile`).

### Should Have (P1)
- **FR-11 (WCAG AAA Contrast Parity):** All text elements across all 10 bug items must achieve a minimum contrast ratio of 7:1 against their respective backgrounds (WCAG AAA).
- **FR-12 (Focus Rings):** High-visibility focus indicators (`:focus-visible`) must maintain emerald/cyan rings with 3px outline offsets on all light mode buttons and interactive elements.

### Won't Have (Out of Scope)
- **NFR-OUT-01 (Dark Mode Changes):** No mutations to Dark Mode CSS rules, tokens, or variables.
- **NFR-OUT-02 (DOM Structure Changes):** No alteration of HTML DOM hierarchies or class naming schemes in `dashboard.html`.

---

## 📐 3. Non-Functional Requirements (NFR)

1. **Accessibility (NFR-A11Y):**
   - Normal text: Contrast ratio $\ge 4.5:1$ (AA) and $\ge 7:1$ (AAA).
   - Large text / UI controls / borders: Contrast ratio $\ge 3:1$.
2. **Performance (NFR-PERF):**
   - Zero JavaScript runtime overhead. All fixes implemented strictly via CSS rules.
   - CSS bundle size delta $\le 8\text{ KB}$.
3. **Safety & Zero-Regression (NFR-SAFE):**
   - 100% of existing unit and integration tests must pass cleanly (`node run_all_tests.js`).
   - All touched CSS and test files must be encoded in UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
   - Zero credentials or tokens in files (`gitleaks detect --redact` clean).

---

## 📜 4. Acceptance Criteria (Given-When-Then Contracts)

### Contract 1: Table Headers (Bug 1)
- **Given:** The user has activated Light Mode (`body.theme-light`).
- **When:** The user navigates to the Time Tracking or Media History tab.
- **Then:** `#domainAnalyticsTable` and `#mediaHistoryTable` headers (`th`) display a light background (`#f1f5f9`), `#1e293b` text (contrast ratio > 11:1), and a `#cbd5e1` separator line.

### Contract 2: Visualizer Action Buttons (Bug 2)
- **Given:** The user is on the Media Deck in Light Mode.
- **When:** The user inspects `.btn-viz-action-icon` buttons (theater mode, fullscreen, settings drawer, vu meter toggle).
- **Then:** The buttons display subtle translucent light backgrounds with dark slate icons (`#334155`), darkening to `#0f172a` on hover, with zero dark-blotch artifacts.

### Contract 3: Hero Media Playback Controls (Bug 3)
- **Given:** The user hovers over `.btn-ctrl-hero` in Light Mode.
- **When:** Hover state activates.
- **Then:** The button background brightens and text color remains dark `#0f172a` (never turns `#fff`).

### Contract 4: Focus & Sleep Presets (Bug 4)
- **Given:** The user inspects Focus and Sleep sentinel cards in Light Mode.
- **When:** Viewing idle and active preset buttons (`15m`, `30m`, `45m`, `60m`, etc.).
- **Then:** Idle preset buttons display `#1e293b` text on `#ffffff`/`#f8fafc` backgrounds (contrast > 11:1), and active preset buttons display distinct accent colors with > 4.5:1 contrast.

### Contract 5: Ambient Soundscapes (Bug 5)
- **Given:** The user navigates to the Focus or Sleep Hub in Light Mode.
- **When:** Inspecting `.focus-soundscape-panel` or `.sleep-soundscape-panel`.
- **Then:** Container displays light card styling (`rgba(241, 245, 249, 0.7)`), title text is `#0f172a`, and select dropdown has a white background with dark text.

### Contract 6: Power-Nap Card (Bug 6)
- **Given:** The user views the Power-Nap banner in Light Mode.
- **When:** Reading title and description.
- **Then:** Title text is dark indigo (`#1e1b4b`), description is `#475569`, and button is clearly visible.

### Contract 7: Sleep Cutoff Toggles (Bug 7)
- **Given:** The user views Sleep Cutoff Sentinel toggles in Light Mode.
- **When:** Reading toggle options and dropdowns.
- **Then:** Toggle rows display white backgrounds (`#ffffff`), dark titles (`#0f172a`), and select dropdowns display white backgrounds with dark text.

### Contract 8: Blacklist Pattern Empty State (Bug 8)
- **Given:** The blacklist has zero entries in Light Mode.
- **When:** Viewing `#blacklistChipsContainer`.
- **Then:** The container displays `#f8fafc` background with a subtle border, and the placeholder message is clearly legible in `#64748b`.

### Contract 9: Danger Zone (Bug 9)
- **Given:** The user views the Danger Zone in Light Mode.
- **When:** Reading the warning notice and action cards.
- **Then:** Card displays soft rose background, `.warning-text` is `#991b1b` (contrast > 8:1), and `.danger-action-item` displays white card background.

### Contract 10: Data Export Cards (Bug 10)
- **Given:** The user views Data Export cards in Settings in Light Mode.
- **When:** Inspecting Time Tracking CSV, Media History CSV, and HTML Digest cards.
- **Then:** Tiles display white card backgrounds (`#ffffff`), dark titles (`#0f172a`), and `.btn-export-tile` remains dark and legible on hover.
