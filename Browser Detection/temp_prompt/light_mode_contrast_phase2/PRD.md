# Light Mode Contrast & Visibility Overhaul Phase 2: Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/light_mode_contrast_phase2/`  
> **Lead Department:** Dept 01 (Product Requirements)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Objective & Product Vision
Ensure an accessible, elegant, and WCAG AAA compliant user experience in Light Mode across the Web Activity & Media Sentinel dashboard. Every button, badge, toggle row, and selector bar must exhibit sharp legibility, distinct visual boundaries, and intuitive hover/active states when operating in light theme viewports.

---

## 👥 2. User Personas & Use Cases

### 2.1 Daytime Office Worker / Power User
- Uses Light Mode during daylight hours or in well-lit office environments.
- Expects high contrast, clear visual feedback, and zero squinting when managing Pomodoro focus intervals, extending timers, or checking media streams.

### 2.2 Accessibility-Sensitive User
- Requires WCAG 2.1 AA/AAA compliance with high luminance contrast ratios (>= 7:1 for text, >= 3:1 for graphical UI elements).
- Relies on distinct borders and clear visual indicators to perceive active vs inactive controls.

---

## 📋 3. Functional Requirements (FR)

### FR-1: Focus & Sleep Extend Time Buttons
- **FR-1.1:** Focus extender buttons (`#btnFocusExtend5`, `#btnFocusExtend15` / `.dash-focus-extender-btn`) in Light Mode must display a crisp white surface (`#ffffff`), subtle border (`#cbd5e1`), and dark slate text (`#1e293b`).
- **FR-1.2:** Hovering over an extender button must provide subtle contrast enhancement (`background: #f1f5f9; border-color: #10b981; color: #0f172a;`).
- **FR-1.3:** Sleep extender buttons (`#btnExtendSleep5`, `#btnExtendSleep15` / `.dash-sleep-extender-btn`) must maintain visual harmony with focus extenders.

### FR-2: Completion Chime Row & Focus Toggle Cards
- **FR-2.1:** The completion chime container (`.focus-chime-selector-row`) must render dark legible label text (`#1e293b`).
- **FR-2.2:** The chime tone selector (`#selectFocusChimeTone` / `.styled-select.chime-select`) must feature a white background (`#ffffff`), dark border (`#cbd5e1`), and high-contrast text (`#0f172a`).
- **FR-2.3:** The chime preview button (`#btnPreviewChime`) must have crisp light borders and clear hover feedback.
- **FR-2.4:** Advanced toggle cards (`.control-toggle-item` in `.dash-advanced-toggles-grid`) must have solid white surfaces (`#ffffff`), border (`#e2e8f0`), dark title typography (`#0f172a`, WCAG AAA 15.8:1), and slate-500 description text (`#64748b`).
- **FR-2.5:** Unchecked toggle slider tracks (`.slider-round`) must use visible gray (`#cbd5e1`) with border (`#94a3b8`), rather than translucent dark track.

### FR-3: Pomodoro Reset & Secondary Action Buttons
- **FR-3.1:** The Pomodoro Reset button (`#btnResetPomodoro` / `.btn-focus-secondary`) and Pause button (`#btnPausePomodoro`) must display a clean white background (`#ffffff`), distinct border (`#cbd5e1`), and slate-700 text (`#334155`).
- **FR-3.2:** Hover state must transition smoothly to `#f1f5f9` with border `#94a3b8` and text `#0f172a`.

### FR-4: Focus Mode Selector Bar & Streak/Session Progress
- **FR-4.1:** The mode selector container (`.focus-mode-tabs-row`) must display a soft gray background (`#f1f5f9`) and border (`#e2e8f0`).
- **FR-4.2:** Inactive mode tabs (`.focus-mode-tab`) must have legible slate-600 text (`#475569`).
- **FR-4.3:** Active focus tab (`.focus-mode-tab.active`) must pop with white surface (`#ffffff`), emerald border (`#10b981`), and deep emerald text (`#047857`). Break tabs must use cyan/sky accent (`#0369a1`).
- **FR-4.4:** The cycle progress row (`.focus-cycle-progress-row`) must render a clean surface (`#f8fafc`).
- **FR-4.5:** The daily streak badge (`#focusDailyStreakBadge` / `.focus-streak-badge`) must use a warm light amber background (`rgba(249, 115, 22, 0.12)`) with high-contrast amber/orange text (`#c2410c`, WCAG AAA >= 7:1 against light surfaces).
- **FR-4.6:** Target progress bar track (`.focus-target-progress-bar`) must be distinctly visible (`#e2e8f0`).

### FR-5: Sleep Sentinel Hub Card
- **FR-5.1:** Status badge (`#dashSleepStatusBadge` / `.dash-sleep-badge.idle`) must use `#f1f5f9` background with `#475569` text and `#cbd5e1` border.
- **FR-5.2:** Countdown dial track (`.dash-sleep-dial-track`) stroke must use `#e2e8f0` in light mode.
- **FR-5.3:** Countdown clock text (`.dash-sleep-time`) must be `#0f172a` (15.8:1 contrast).

### FR-6: Media Controls / Action Bar
- **FR-6.1:** Action buttons (`#btnMuteAllOthers`, `#btnMuteAll` in `.media-deck-header-actions`) must render white surfaces (`#ffffff`), border (`#cbd5e1`), dark slate text (`#1e293b`), and vibrant active toggle state.
- **FR-6.2:** Active streams badge (`#badgeActiveStreamsCount`) must use legible slate-600 text (`#475569`).
- **FR-6.3:** Hero player speed stepper and controls must pass WCAG AAA contrast in light mode.

---

## 🔒 4. Non-Functional Requirements (NFR)
- **NFR-1 (WCAG Compliance):** All text elements must achieve at least 7.0:1 contrast ratio (WCAG AAA) where feasible, and no less than 4.5:1 (WCAG AA). Graphical control boundaries must achieve >= 3.0:1.
- **NFR-2 (Dark Mode Parity):** Zero regression or style pollution into dark mode viewports.
- **NFR-3 (Rule 28 Modularity):** No files over 700 lines may be edited or expanded; `wellbeing_blacklist.css` must remain 100% untouched.
- **NFR-4 (Zero-Drift Automation):** 100% test passage in standalone QA suite and master test runner (`run_all_tests.js`).
