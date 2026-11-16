# Web Activity & Media Sentinel - Dashboard Future Features (8 Capabilities Across 4 Phases)
## Product Requirements Document (PRD)

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Standard:** INVEST User Stories, MoSCoW Prioritization, Given-When-Then Contracts  
> **Master Reference:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Ephemeral Container:** `temp_prompt/dashboard_future_features_8_phases/`  

---

## 👥 1. User Personas & Target Audiences

1. **The Software Engineer / Power User ("Dev Raj"):**
   - Spends 10+ hours daily in browser across documentation, code repos, local servers (`localhost`), and YouTube audio streams.
   - *Needs:* Seamless local host privacy exclusion, automatic classification of development vs. entertainment time, multi-tab audio control without leaving the dashboard, and dark-mode high-contrast readability.
2. **The Executive / Team Lead ("Manager Priya"):**
   - Oversees multi-project research and needs clear proof of focus and productivity trends over weeks and months.
   - *Needs:* Granular date range filtering (7d, 30d, custom), Week-over-Week delta comparisons, and 1-click executive PDF/HTML report generation for stakeholder reviews.
3. **The Digital Wellbeing Seeker ("Student Aarav"):**
   - Struggles with social media distractions and doom-scrolling late at night.
   - *Needs:* Visual productivity index, daily site budgets with gentle nudges, infinite scroll pauses, and structured Pomodoro focus sessions.

---

## 🎯 2. Functional Requirements (FR-01 through FR-08)

### FR-01: Custom Temporal Range & Chrono Heatmap (Phase 1)
- **FR-01.1:** Dashboard must provide 5 temporal filter buttons: `Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, and `Custom Range`.
- **FR-01.2:** Selecting `Custom Range` opens a start/end datepicker restricting selections to valid ISO `YYYY-MM-DD` strings.
- **FR-01.3:** The system must render a 7x24 matrix (Monday-Sunday x 00:00-23:00) with 168 cells.
- **FR-01.4:** Cells must display color intensity tiers: Tier 0 ($0\text{m}$), Tier 1 ($1-15\text{m}$), Tier 2 ($15-30\text{m}$), Tier 3 ($30-45\text{m}$), Tier 4 ($45-60\text{m}$).
- **FR-01.5:** An interactive mode toggle switches cell calculations between "Focus & Browsing Time" and "Media Watch Time".
- **FR-01.6:** Hovering over any cell displays a tooltip showing Day, Hour Window, Total Duration, and Dominant Domain.
- **FR-01.7:** The view calculates and displays Week-over-Week (WoW) percentage change relative to the prior period.

### FR-02: Productivity Scoring & Smart Domain Classifier (Phase 1)
- **FR-02.1:** The system categorizes domains into 5 standard classes: `work`, `learning`, `entertainment`, `social`, `utility`.
- **FR-02.2:** Compute Productivity Score using the formula:
  $$\text{Score} = \text{clamp}\left(0, 100, \frac{W \times 1.0 + L \times 0.95 + U \times 0.7 - S \times 0.4 - E \times 0.8}{T_{\text{active}}} \times 100\right)$$
- **FR-02.3:** Display score on a dynamic radial gauge / badge with 3 tier visual indicators: Deep Focus ($\ge 80$), Balanced ($60-79$), Distracted ($< 60$).
- **FR-02.4:** Domain analytics table must include a "Category" dropdown allowing 1-click manual reassignment of any domain.
- **FR-02.5:** Category overrides persist in `chrome.storage.local` under `domain_category_overrides` and immediately trigger score recalculation.

### FR-03: Multi-Tab Live Media Deck (Phase 2)
- **FR-03.1:** Background service worker must query and broadcast all tabs currently playing audio, video, or flagged audible.
- **FR-03.2:** Dashboard `#paneMedia` renders an interactive multi-tab card deck displaying favicon, title, domain, and status (`Playing`, `Paused`, `Muted`).
- **FR-03.3:** Each card provides individual controls: Play/Pause, Mute/Unmute, Volume Slider, and Mini Timeline Scrubber.
- **FR-03.4:** A "Solo Tab" button on each card mutes all other browser tabs while keeping the selected tab unmuted.
- **FR-03.5:** A global "Mute All Others" action silences all background media across all windows instantly.

### FR-04: Real-Time Audio Visualizer & Spectrum Analyzer (Phase 2)
- **FR-04.1:** Render hardware-accelerated 60fps animations on `#canvasAudioVisualizer` (600x120px).
- **FR-04.2:** Support Mode A: 32-Band FFT Frequency Bars with gradient fill (Emerald -> Cyan -> Violet) and peak-hold dropping dots.
- **FR-04.3:** Support Mode B: Oscilloscope Waveform trace displaying continuous time-domain signal waves.
- **FR-04.4:** Display stereo VU peak level meters with calibrated dB scales (-40dB to +6dB) and +0dB clipping indicators.
- **FR-04.5:** The visualizer render loop must immediately pause when media is paused or when `document.visibilityState === 'hidden'`.

### FR-05: Advanced Backup, Snapshot Restore & SQLite Hub Sync (Phase 3)
- **FR-05.1:** Provide JSON import with schema v2.0 validation, checking checksum, version, and data structure integrity.
- **FR-05.2:** Support 3 import conflict strategies: `Merge` (default), `Overwrite`, `Append-Only`.
- **FR-05.3:** Automatically capture daily rolling snapshots (`snapshot_YYYY_MM_DD`) for the trailing 7 days in `chrome.storage.local`.
- **FR-05.4:** Provide a 1-click "Rollback to Snapshot" modal allowing rapid restore to any of the 7 daily snapshots.
- **FR-05.5:** Enable bidirectional replication with the local SQLite Data Hub daemon over `ws://127.0.0.1:65433` (upload delta & restore from hub).

### FR-06: Executive PDF & HTML Digest Generator (Phase 3)
- **FR-06.1:** Zero-dependency print engine formatting the dashboard for clean A4/Letter PDF print preview using native `window.print()`.
- **FR-06.2:** Automatically hide UI chrome (sidebars, action buttons, search bars, modals) during `@media print`.
- **FR-06.3:** Render an Executive Summary Header containing Sentinel branding, date range, and key metric cards.
- **FR-06.4:** Ensure SVG donut and bar charts scale cleanly to vector print representations without distortion or page-break splitting.
- **FR-06.5:** Provide a 1-click "Download Standalone HTML Report" exporting an offline-operable `.html` file with embedded styles and data.

### FR-07: Domain Annotations, Bookmarks & Exclusion Blacklist (Phase 4)
- **FR-07.1:** Allow pinning/starring domains via a clickable star icon (⭐) in the domain table, anchoring pinned domains to the top.
- **FR-07.2:** Allow adding custom project notes/annotations to any domain, visible in tooltips and searchable via the domain search input.
- **FR-07.3:** Provide a Privacy Tracking Exclusion Blacklist supporting wildcard/regex expressions (e.g., `localhost:*`, `192.168.*:*`).
- **FR-07.4:** The background tracking engine must enforce a strict zero-tracking policy on blacklisted domains (0 seconds recorded).
- **FR-07.5:** Provide a "Purge Existing Records" button to retroactively delete all historical data for blacklisted domains.

### FR-08: Digital Wellbeing Sentinel & Doom-Scrolling Guard (Phase 4)
- **FR-08.1:** Enable setting daily time budgets per domain (e.g., 30m for `x.com`, 60m for `youtube.com`).
- **FR-08.2:** Trigger visual warning badges: yellow gentle notice at 80% budget consumption, red "Budget Reached" badge at 100%.
- **FR-08.3:** Content script monitor detects infinite scrolling velocity; after 20 minutes of continuous feed scrolling, display a non-blocking "Take a Breath" toast.
- **FR-08.4:** Embed an integrated Pomodoro timer widget (25m Focus / 5m Break) in the dashboard sidebar.
- **FR-08.5:** On Pomodoro break start, play a gentle Web Audio chime and automatically pause active hero media.

---

## 🛡️ 3. Non-Functional Requirements (NFR-01 through NFR-06)

- **NFR-01 (Performance):** Dashboard load and render time must remain $< 300\text{ms}$. Visualizer loop must consume $< 2\%$ CPU on modern hardware and $0\%$ CPU when idle.
- **NFR-02 (Memory & Storage):** Aggregate hourly buckets capped at 60 days to prevent `chrome.storage.local` bloat ($< 5\text{MB}$ total storage).
- **NFR-03 (Security & Trusted Types):** Absolute zero use of raw `innerHTML`. All DOM manipulation must use `document.createElement`, `textContent`, and safe DOM fragments.
- **NFR-04 (Lifecycle Resilience):** All timers and alarms must survive Service Worker idle termination via `chrome.alarms` and local storage state.
- **NFR-05 (Accessibility & WCAG):** All interactive elements must support keyboard navigation (`tabindex`, `role`, ARIA labels) and meet WCAG 2.1 AA/AAA contrast standards ($> 4.5:1$).
- **NFR-06 (Internationalization):** 100% bilingual parity across English (`en`) and Hindi (`hi`) for all newly introduced labels, tooltips, and dialogues.

---

## 📜 4. Given-When-Then Acceptance Criteria Contracts

### Contract 1 (Phase 1: Heatmap & Productivity)
- **Scenario 1.1 (Temporal Aggregation):**
  - **Given** browsing telemetry spanning the past 7 days exists in storage,
  - **When** the user clicks the "Last 7 Days" filter subtab,
  - **Then** the 7x24 heatmap renders 168 cells with intensities reflecting hourly activity, and the WoW metric displays the relative change percentage.
- **Scenario 1.2 (Productivity Recalculation):**
  - **Given** `youtube.com` is classified as `entertainment` yielding a score of 65,
  - **When** the user changes `youtube.com` category to `learning` via the inline dropdown,
  - **Then** the score immediately recalculates to $\ge 80$, the gauge updates to "Deep Focus", and the override is saved in `chrome.storage.local`.

### Contract 2 (Phase 2: Media Deck & Audio Visualizer)
- **Scenario 2.1 (Multi-Tab Discovery & Control):**
  - **Given** tabs 101 (YouTube) and 102 (Spotify) are playing audio,
  - **When** the dashboard opens `#paneMedia`,
  - **Then** two cards appear in the media deck showing real-time playback states, and clicking "Solo Tab" on tab 101 mutes tab 102.
- **Scenario 2.2 (Visualizer Sleep Loop):**
  - **Given** the 32-band visualizer is rendering at 60fps on `#canvasAudioVisualizer`,
  - **When** playback is paused or the dashboard tab is hidden,
  - **Then** `cancelAnimationFrame` fires, CPU usage drops to 0%, and the canvas clears smoothly.

### Contract 3 (Phase 3: Backup Restore & Print Digest)
- **Scenario 3.1 (JSON Import with Conflict Resolution):**
  - **Given** a valid backup JSON file with schema version `2.0.0`,
  - **When** the user uploads it and selects `Merge`,
  - **Then** missing dates are inserted, overlapping durations are reconciled, and storage is updated without data loss.
- **Scenario 3.2 (Clean Print Output):**
  - **Given** the user triggers `window.print()` or clicks "Print PDF",
  - **When** print styles are applied,
  - **Then** all navigation controls, sidebars, and buttons disappear, and the executive digest renders cleanly across A4 pages.

### Contract 4 (Phase 4: Privacy Blacklist & Pomodoro)
- **Scenario 4.1 (Zero-Tracking Blacklist):**
  - **Given** `localhost:*` is added to the Privacy Blacklist,
  - **When** the user browses `http://localhost:3000` for 15 minutes,
  - **Then** background service worker logs 0 active seconds and no entry is created for `localhost:3000` in storage.
- **Scenario 4.2 (Pomodoro Break Trigger):**
  - **Given** a 25-minute Pomodoro focus session finishes,
  - **When** the timer switches to the 5-minute break phase,
  - **Then** a gentle audio chime plays and active media playback is paused automatically.
