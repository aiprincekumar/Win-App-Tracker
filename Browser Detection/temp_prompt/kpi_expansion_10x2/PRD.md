# Product Requirements Document (PRD): 10x2 KPI Expansion

> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Initiative:** Web Activity & Media Sentinel 10x2 Dashboard KPI Expansion  
> **Owner:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: The Productivity-Focused Knowledge Worker ("Alex")
- **Scenario:** Alex monitors daily screen time and digital habits to optimize flow states and minimize burnout.
- **Pain Point:** The previous dashboard lacked clear visibility into distraction domains, peak working hours, and continuous work bursts. Alex had to manually inspect the domain list to figure out when focus was broken.
- **Value Realized:** Alex glances at the 10-card Time Tracking view and immediately spots the Productivity Index gauge, Deep Focus hours, Distraction/Leisure ratio, and Peak Activity hour.

### Persona 2: The Multimedia Creator & Heavy Streamer ("Jordan")
- **Scenario:** Jordan uses multiple browser windows for video editing, YouTube tutorials, Twitch streams, and background Spotify audio.
- **Pain Point:** Jordan could only see basic volume averages and total watch time. There was no metric for identifying which platform dominated usage, how many live streams were simultaneously open, or whether videos were running on mute.
- **Value Realized:** Jordan opens the Media Analytics tab to see exact session breakdowns: Top Media Platform, Active Live Streams, Muted Sessions count, and the longest single session.

---

## 🎯 2. Functional Requirements (FR)

### A. Time Tracking View (10 KPIs - 5x2 Grid)

#### Row 1: Macro Time & Productivity Focus
- **FR-01 (Today's Active Time):** System must display the sum of active foreground browsing time recorded for the current day. ID: `#trackMetricTodayTime`.
- **FR-02 (Daily Average):** System must display the arithmetic mean of daily browsing time calculated across all historical recorded days. ID: `#trackMetricDailyAvg`.
- **FR-03 (Total Tracked Time):** System must display cumulative browsing time across all history since tracking began. ID: `#trackMetricTotalTime`.
- **FR-04 (Productivity Index):** System must render a dynamic SVG radial progress gauge (0-100) and tier badge (Deep Focus, Balanced, Leisure) computed from productive vs unproductive domain usage. ID: `#valProductivityScore`, `#badgeProductivityTier`, `#svgProductivityGauge`.
- **FR-05 (Deep Focus Time):** System must display total accumulated focus session minutes/hours and completed focus sessions count for today. ID: `#trackMetricFocusTime`, `#trackMetricFocusSessions`.

#### Row 2: Behavioral & Session Intelligence
- **FR-06 (Top Website / Peak Site):** System must display the domain name with the highest active duration today along with its duration and percentage share. ID: `#trackMetricTopDomain`, `#trackMetricTopDomainTime`.
- **FR-07 (Active Domains Count):** System must display the count of distinct web domains navigated today that have recorded at least 1 second of active time. ID: `#trackMetricActiveDomains`, `#subMetricActiveDomains`.
- **FR-08 (Distraction / Leisure Time):** System must aggregate and display total time spent on categorized leisure/entertainment domains (e.g. social media, streaming, gaming) and its percentage of today's time. ID: `#trackMetricDistractionTime`, `#subMetricDistractionTime`.
- **FR-09 (Peak Activity Hour):** System must determine and display the single clock hour (e.g., "14:00 - 15:00" or "2 PM") that saw the highest browsing intensity today. ID: `#trackMetricPeakHour`, `#subMetricPeakHour`.
- **FR-10 (Longest Continuous Session):** System must calculate and display the duration of the longest uninterrupted browsing session (burst without idle gap > 2 minutes). ID: `#trackMetricLongestSession`, `#subMetricLongestSession`.

---

### B. Media Analytics View (10 KPIs - 5x2 Grid)

#### Row 1: Playback Volume & Platform Intelligence
- **FR-11 (Total Watch Time):** System must display cumulative media watch duration across all media tabs and sessions. ID: `#mediaMetricTotalWatch`.
- **FR-12 (Avg Watch per Video):** System must calculate and display the mean playback duration per distinct media session. ID: `#mediaMetricAvgWatch`.
- **FR-13 (Total Media Sessions):** System must display the total count of distinct media sessions captured in memory and storage. ID: `#mediaMetricSessionsCount`.
- **FR-14 (Top Media Platform):** System must identify and display the domain/service with the highest aggregate media consumption time (e.g., "YouTube", "Netflix", "SoundCloud"). ID: `#mediaMetricTopPlatform`, `#subMediaTopPlatform`.
- **FR-15 (Active Live Streams):** System must display the count of currently active live streams detected across browser tabs. ID: `#mediaMetricActiveStreams`, `#subMediaActiveStreams`.

#### Row 2: Acoustic Metrics & Session Duration
- **FR-16 (Average Volume):** System must display the mean volume percentage recorded across all media sessions. ID: `#mediaMetricAvgVolume`.
- **FR-17 (Peak Volume Recorded):** System must display the highest single volume level recorded across sessions. ID: `#mediaMetricPeakVolume`.
- **FR-18 (Lowest Volume):** System must display the lowest non-zero or minimum recorded volume level. ID: `#mediaMetricLowVolume`.
- **FR-19 (Muted Sessions Count):** System must count and display the total number of playback sessions that ran while muted or at 0% volume. ID: `#mediaMetricMutedSessions`, `#subMediaMutedSessions`.
- **FR-20 (Longest Media Session):** System must display the duration of the single longest media playback session on record. ID: `#mediaMetricLongestSession`, `#subMediaLongestSession`.

---

## 🛡️ 3. Non-Functional Requirements (NFR)

- **NFR-01 (W3C Trusted Types Compliance):** 100% zero-innerHTML enforcement. All text, numbers, and attributes must be assigned via `textContent`, `setAttribute`, or DOM node creation.
- **NFR-02 (Bilingual Parity):** All 20 labels, 20 subtitles, and tooltips must have complete English (`en.json`) and Hindi (`hi.json`) translations.
- **NFR-03 (Responsive Layout):** The 5x2 grid must render 5 columns on desktop viewports (>= 1200px), wrap to 3 or 2 columns on tablet viewports (768px-1199px), and 1 column on mobile devices (< 768px).
- **NFR-04 (Performance):** KPI recalculations and DOM updates must complete within <= 16ms to maintain 60 FPS during live ticker updates.
- **NFR-05 (SRE Standards):** All modified source files must maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📋 4. Given-When-Then Acceptance Criteria

```gherkin
Feature: 10x2 KPI Expansion for Time Tracking and Media Analytics

  Scenario: Symmetrical 5x2 Bento Grid Layout Rendering
    Given the user navigates to the "Time Tracking" tab or "Media Analytics" tab
    When the tab content container is rendered
    Then exactly 10 KPI cards must be present inside the respective metrics grid
    And the grid container must have CSS display "grid" with 5 columns on desktop viewport

  Scenario: Accurate Calculation of Time Tracking Row 2 Metrics
    Given browsing activity with 15 distinct domains, 45m on social media, peak browsing at 3 PM, and a 1h 20m continuous burst
    When renderTimeTrackingView is executed
    Then #trackMetricActiveDomains displays "15"
    And #trackMetricDistractionTime displays "45m"
    And #trackMetricPeakHour displays "3 PM" (or "15:00")
    And #trackMetricLongestSession displays "1h 20m"

  Scenario: Accurate Calculation of Media Analytics Row 1 & Row 2 Metrics
    Given media history with 20 sessions across YouTube and Netflix, 2 live streams, 5 muted sessions, and a longest video of 2h 15m
    When renderMediaAnalyticsView is executed
    Then #mediaMetricTopPlatform displays "YouTube"
    And #mediaMetricActiveStreams displays "2"
    And #mediaMetricMutedSessions displays "5"
    And #mediaMetricLongestSession displays "2h 15m"

  Scenario: Zero innerHTML Trusted Types Enforcement
    Given the dashboard is active and live updates are received
    When metrics roll and numbers animate
    Then no DOM assignment using innerHTML or outerHTML occurs
    And W3C Trusted Types policy validation passes with zero violations

  Scenario: Bilingual Parity on Language Toggle
    Given the user toggles the language switch from English to Hindi
    When the i18n translation cycle completes
    Then all 20 KPI labels and subtexts display their accurate Hindi translations
    And no missing translation placeholders or undefined keys appear
```
