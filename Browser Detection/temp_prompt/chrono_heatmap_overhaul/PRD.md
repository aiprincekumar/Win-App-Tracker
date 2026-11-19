# Product Requirements Document (PRD): Chrono-Activity Heatmap (24h x 7d) Overhaul

> **Document Type:** Product Requirements Document & Acceptance Contracts  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Feature Identifier:** `FEAT-CHRONO-HEATMAP-OVERHAUL-002`  
> **Target Audience:** Knowledge Workers, Students, Power Users, and Systems Operators  

---

## 🎯 1. Objective & Product Goals

The objective of the Chrono-Activity Heatmap Overhaul is to transform the existing 7-day x 24-hour visual matrix into a responsive, fluid, and dual-mode analytical engine. Users must be able to visually audit their circadian rhythms across both Focus/Work browsing and Media streaming without encountering clunky scrollbars, disjointed date selections, or unpopulated historical days.

---

## 👥 2. User Personas & User Stories

### Persona 1: Dev / Power User (Deep Focus Tracking)
- **Need:** Inspect when high-focus software development occurred across the last 7 days.
- **Story:** *As a software engineer, I want the heatmap to stretch across the full width of my monitor without horizontal scrollbars, so I can view my 24-hour work distribution at a single glance.*

### Persona 2: Media Consumer & Night Owl (Media vs Focus Separation)
- **Need:** Understand whether late-night screen time was productive research or passive video watching.
- **Story:** *As a user who watches videos while working, I want distinct color palettes and separate metrics for Focus vs Media mode so I can clearly tell browsing research apart from streaming entertainment.*

### Persona 3: Long-Time User (Historical Continuity)
- **Need:** View activity patterns over the past week even if those dates were tracked prior to the hourly bucket update.
- **Story:** *As an existing user with weeks of history, I want the heatmap to display realistic hourly distributions for my older days rather than rendering blank rows.*

---

## 📋 3. MoSCoW Feature Prioritization

### Must Have (P0)
- **FR-01 (CSS Grid Full-Width Layout):** Full-width 24-hour column layout (`minmax(0, 1fr)`) with zero horizontal scrollbars on desktop and tablet.
- **FR-02 (7-Day Rolling Window):** Strict enforcement of the rolling 7-day window (`Today - 6d` through `Today`) in `aggregateChronoHeatmap`.
- **FR-03 (Focus Mode Palette):** Emerald/Cyan color scale (`#10b981`) for Focus Browsing Time with tier 0–4 gradations.
- **FR-04 (Media Mode Palette):** Violet/Fuchsia color scale (`#a855f7` / `#ec4899`) for Media Watch Time with tier 0–4 gradations.
- **FR-05 (Historical Diurnal Backfill):** Mathematical slotting algorithm for dates lacking hourly buckets, preserving exact daily totals.
- **FR-06 (Regression Immunity):** 100% pass across all 102+ test suites with exit code 0.

### Should Have (P1)
- **FR-07 (Mode-Specific WoW Metric):** Week-over-Week delta percentage dynamically calculated based on the active mode (Focus WoW vs Media WoW).
- **FR-08 (SQLite Data Hub Schema Extension):** Serialize `hourly_buckets_json` in WebSocket sync messages for multi-browser telemetry.
- **FR-09 (Enhanced Glassmorphic Tooltip):** Interactive floating tooltip displaying Day, Hour range, duration in minutes/seconds, and predominant website.

### Could Have (P2)
- **FR-10 (Keyboard Navigation):** Arrow key cell navigation with focus ring and `aria-label` screen reader announcements.

---

## ✅ 4. INVEST-Compliant Given-When-Then Acceptance Criteria

### Scenario 1: Responsive Grid Without Horizontal Scrollbar
- **Given** the user navigates to the Sentinel Analytics dashboard on any screen width >= 768px,
- **When** the `#cardChronoHeatmap` card renders into the DOM,
- **Then** `.chrono-heatmap-wrapper` MUST NOT exhibit an active horizontal scrollbar (`scrollWidth === clientWidth`),
- **And** all 24 hour columns MUST share equal fluid width (`1fr`) spanning from the day label column to the right container margin.

### Scenario 2: Forced 7-Day Rolling Window
- **Given** the global dashboard date picker is set to "Today" or "30 Days",
- **When** `aggregateChronoHeatmap` aggregates telemetry for the heatmap,
- **Then** the output matrix MUST always contain exactly 7 day rows representing `Today - 6d` to `Today`,
- **And** each row MUST represent 24 discrete hours (00:00 to 23:00).

### Scenario 3: Mode Toggling & Dual Palette Switching
- **Given** the user is viewing the Chrono Heatmap in Focus Mode (Emerald palette),
- **When** the user clicks `#btnHeatmapModeMedia`,
- **Then** the active button class MUST switch to `#btnHeatmapModeMedia`,
- **And** all heatmap cells MUST update their visual styling to the Violet/Fuchsia palette,
- **And** cell values, legend labels, and `#valHeatmapWow` MUST reflect Media Watch Time.

### Scenario 4: Historical Backfill Exact Second Conservation
- **Given** a historical day record in storage with 7,200 active seconds and no `hourlyBuckets`,
- **When** `backfillHistoricalHourlyBuckets` processes the day data,
- **Then** the sum of `activeSeconds` across hours 0 through 23 MUST equal exactly 7,200 seconds,
- **And** active seconds MUST be slotted according to domain category diurnal heuristics (e.g. Work domains concentrated between 09:00 and 18:00).

### Scenario 5: SQLite Data Hub Sync Serialization
- **Given** the Standalone SQLite Data Hub is connected via WebSocket (`ws://127.0.0.1:65433`),
- **When** a history snapshot or delta sync is transmitted,
- **Then** the message payload MUST include `hourly_buckets_json` containing non-empty hourly records,
- **And** the background service worker MUST gracefully handle offline socket states without unhandled exceptions.
