# Product Requirements Document (PRD): Accurate Hourly Activity Tracking ("सटीक ट्रैकिंग")

> **Document Type:** Product Requirements Document & Behavioral Contract  
> **Workspace Container:** `temp_prompt/chrono_heatmap_hourly_tracking/`  
> **Feature Identifier:** `FEAT-CHRONO-HOURLY-TRACKING-001`  
> **Target Audience:** Web Activity & Media Sentinel Users, Power Browsers, Data Analysts  

---

## 🎯 1. Objective & Product Goals

The goal of this initiative is to provide pixel-accurate intraday activity tracking for the Sentinel Chrono-Activity Heatmap. Users will be able to see exactly which hour of the day (0:00 to 23:00) they were active on specific websites, when background media was playing, and which domain dominated their attention during any given 60-minute window.

### Primary User Value:
1. **Intraday Precision:** Eliminates artificial "10:00 to 18:00" smoothing when real telemetry is present.
2. **Media Playback Visibility:** Accurately distinguishes active foreground reading/typing from background audio/video playback per hour.
3. **Truthful Top Domain Attribution:** Displays the domain with the actual highest duration in that hour, rather than a randomly sorted domain.
4. **Resilient Data Compatibility:** Gracefully preserves historical browsing data recorded prior to this upgrade.

---

## 👥 2. User Personas & User Stories

### Persona: Arjun (Software Engineer & Audio Power User)
- **Problem:** Arjun codes at night (22:00 to 02:00) listening to music in the background. His heatmap previously estimated his activity between 10:00 and 18:00, making his nocturnal productivity invisible.
- **Story:** As a nocturnal knowledge worker, I want my activity heatmap to accurately reflect my real active hours so I can understand my circadian productivity rhythm.

### Persona: Priya (Digital Marketer & Researcher)
- **Problem:** Priya browses dozens of client websites throughout the day. Hovering over an active cell in the heatmap previously showed an arbitrary domain rather than the website she actually spent 45 minutes on during that hour.
- **Story:** As a researcher, I want the heatmap tooltip to tell me the true primary domain I spent the most time on during each hour.

---

## 📌 3. Functional Requirements (FR)

- **FR-01 (Backend Hourly Recording):**
  - When active foreground browsing occurs, `background.js` MUST increment `activeSeconds` and `activeTime` in the corresponding hourly bucket (`0` through `23`) of the current date (`days[today].hourlyBuckets[hour]`).
- **FR-02 (Backend Media Recording):**
  - When background audio/video plays, `background.js` MUST increment `backgroundMediaSeconds` and `mediaTime` in the corresponding hourly bucket (`days[today].hourlyBuckets[hour]`).
- **FR-03 (Hourly Session Tracking):**
  - Increment or initialize `sessions` in the current hourly bucket to record session frequency per hour.
- **FR-04 (Dashboard History Aggregation):**
  - `dashboard/dashboard.js` MUST consolidate `hourlyBuckets` from all domain entries into `historyMap[dateStr].hourlyBuckets[hour]`.
- **FR-05 (Accurate Top Domain Resolution):**
  - In `dashboard/dashboard.js`, `topDomain` for each hour bucket MUST be calculated as the domain with `Math.max(activeTime + mediaTime)` across all domains active in that hour.
- **FR-06 (Temporal Heatmap Dual-Mode Evaluation):**
  - In `src/dashboard/features/temporal_productivity_feature.js`, `aggregateChronoHeatmap` MUST inspect if `hourlyBuckets` contains populated keys with duration > 0.
  - If populated: use exact hourly data for the 7x24 matrix.
  - If missing, empty, or all 0s: fall back to the 10:00–18:00 domain estimation.
- **FR-07 (Property Name Interoperability):**
  - The feature MUST uniformly accept both `activeSeconds` and `activeTime`, as well as `mediaSeconds` and `backgroundMediaSeconds`.

---

## 🚫 4. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Performance Degradation):** Updating hourly buckets in `background.js` must execute synchronously in < 0.2ms during regular interval commits without causing event loop blocking.
- **NFR-02 (Minimal Storage Footprint):** Storing 24 integer buckets per domain must add less than 1.5 KB of serialized JSON per domain per day in `chrome.storage.local`.
- **NFR-03 (Function Modularity):** All functions modified or added must strictly comply with Universal Rule 28 (maximum 50 lines per function, nesting depth <= 3).
- **NFR-04 (Zero XSS / W3C Trusted Types):** Heatmap rendering and tooltip generation must remain 100% compliant with zero `innerHTML` assignments.
- **NFR-05 (Bilingual & Tooltip Quality):** Heatmap cell tooltips must cleanly format hour range (e.g., "14:00 - 15:00"), active time, media time, and top domain in both English and Hindi.

---

## ⚖️ 5. Acceptance Criteria (Given-When-Then)

### Scenario 1: Active Browsing Recorded in Specific Hour
- **Given** user is actively browsing `github.com` at 14:15 local time for 120 seconds,
- **When** `commitActiveInterval()` executes,
- **Then** `activityData.domains['github.com'].days[today].hourlyBuckets[14].activeSeconds` increases by 120,
- **And** `days[today].seconds` increases by 120.

### Scenario 2: Background Media Recorded in Specific Hour
- **Given** background audio is playing on `spotify.com` at 23:45 for 300 seconds,
- **When** `commitBackgroundMediaDelta('spotify.com', 300)` executes,
- **Then** `activityData.domains['spotify.com'].days[today].hourlyBuckets[23].backgroundMediaSeconds` increases by 300.

### Scenario 3: Competing Domains in Same Hour Resolves Correct Top Domain
- **Given** at hour 11:00 user spent 10 minutes on `stackoverflow.com` and 40 minutes on `github.com`,
- **When** the dashboard aggregates history into `historyMap[dateStr].hourlyBuckets[11]`,
- **Then** `topDomain` is resolved as `'github.com'` (40m > 10m).

### Scenario 4: Historical Legacy Data Fallback
- **Given** a date entry with `hourlyBuckets: {}` or missing `hourlyBuckets` but containing `domains: { 'youtube.com': { seconds: 3600 } }`,
- **When** `aggregateChronoHeatmap()` processes that date,
- **Then** it does not evaluate all hours as 0; it successfully engages the fallback and distributes active time across hours 10 to 17.
