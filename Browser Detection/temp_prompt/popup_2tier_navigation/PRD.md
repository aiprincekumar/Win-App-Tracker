# Product Requirements Document (PRD) — Popup 2-Tier Segmented Control & Hybrid Dynamic Navigation

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect & Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Target Path:** `temp_prompt/popup_2tier_navigation/PRD.md`  
> **Status:** `ACTIVE / SPECIFICATION_CERTIFIED`

---

## 🎯 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
The Web Activity & Media Sentinel extension popup operates within a constrained width of 420px. Over progressive iterations, navigation has expanded to 7 primary tabs (`Media`, `Audio`, `Tools`, `Studio`, `Tracking`, `Domains`, `Sleep`). Squeezing all 7 tabs into a single horizontal row leads to:
1. **Severe Interactive Crowding:** Narrow tab widths (~56px) and reduced font sizes (<10px) that hinder touch and mouse targeting.
2. **High Cognitive Load:** Requiring users to visually parse disparate domains (media playback vs. screen-time tracking vs. sleep routines) simultaneously.
3. **Static Presentation:** No dynamic contextual responsiveness to actual user behavior (e.g. video playback vs. web reading).

### 1.2 Proposed Solution
Implement a **2-Tier Segmented Control & Hybrid Dynamic Navigation** architecture:
- **Tier 1 (Category Layer):** 4 high-level functional categories (`Playback`, `Studio`, `Analytics`, `Wellness`) styled as a sleek glassmorphism segmented pill control.
- **Tier 2 (Filtered Sub-Navigation):** The existing 7 child tabs dynamically filtered so that only tabs belonging to the active category are rendered, increasing button width up to ~195px.
- **Hybrid Contextual Engine:** Auto-routes between `Playback` (when media is actively playing) and `Analytics` (when idle), while strictly locking manual user clicks to prevent background override.

---

## 👥 2. User Personas & Use Cases

| Persona | Primary Goal | User Journey with 2-Tier Navigation |
| :--- | :--- | :--- |
| **Media Consumer** | Control video/audio playback, adjust volume/equalizer, use picture-in-picture tools. | Opens popup while video plays; immediately lands on **Playback** tier with expanded `Media`, `Audio`, and `Tools` buttons (~130px each). |
| **Productivity Tracker** | Review daily screen time, domain breakdown, and focus metrics. | Opens popup during idle browsing; lands on **Analytics** tier showing `Tracking` and `Domains` (~195px each). |
| **Nighttime Reader** | Configure sleep timer, auto-close bedtime tabs, enable relaxation audio fade. | Clicks **Wellness** category; sees dedicated `Sleep` tab with full ergonomics. |
| **Power User / Explorer** | Switch freely between all views without disruptive reloads or automated jumps. | Explicitly clicks any category or tab; system latches `userManualOverride` and guarantees zero background interruption. |

---

## 📋 3. Functional Requirements (FR)

- **FR-01 (Tier 1 Category Bar):** Provide a 4-button segmented navigation bar (`#tier1SegmentedNav`) with buttons:
  - `#tier1BtnPlayback` (data-category="playback")
  - `#tier1BtnStudio` (data-category="studio")
  - `#tier1BtnAnalytics` (data-category="analytics")
  - `#tier1BtnWellness` (data-category="wellness")
- **FR-02 (Category-to-Tab Mapping):**
  - `playback` $\to$ `Media` (`#mainTabMedia`), `Audio` (`#mainTabAudio`), `Tools` (`#mainTabTools`)
  - `studio` $\to$ `Studio` (`#mainTabStudio`)
  - `analytics` $\to$ `Tracking` (`#mainTabTracking`), `Domains` (`#mainTabDomains`)
  - `wellness` $\to$ `Sleep` (`#mainTabSleep`)
- **FR-03 (Dynamic Child Tab Filtering):** When a Tier 1 category is selected, non-member child tabs receive `.tab-hidden` (`display: none !important`), and member tabs expand horizontally to fill available width.
- **FR-04 (Hybrid Dynamic Media Detection):**
  - If active media is playing on initial popup open $\to$ activate `playback` category and `media` tab.
  - If media is idle/absent on initial popup open $\to$ activate `analytics` category and `tracking` tab.
  - If playback begins while popup is open $\to$ auto-switch to `playback` (if not manually overridden).
- **FR-05 (Manual Override Latch):** When a user explicitly clicks any category button or child tab, latch `userManualOverride = true`. Background polling or refresh cycles must NOT force-switch tabs.
- **FR-06 (Bilingual Localization):** Support English and Hindi toggle parity for all Tier 1 buttons via `applyPopupLanguage`.
- **FR-07 (State Persistence):** Persist active category and tab in `browserAPI.storage.local` (`active_tier1_category`, `active_popup_tab`).

---

## 🛡️ 4. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Backend Mutation):** Absolutely no edits to backend daemons, WebSocket endpoints, Python servers, or `background.js` protocols.
- **NFR-02 (Container Geometry):** Fit strictly within 420px maximum width. Zero horizontal scrollbar, zero viewport clipping.
- **NFR-03 (Performance & 60fps):** Navigation transitions must complete within $\le 180ms$. Zero layout thrashing or cumulative layout shift (CLS = 0).
- **NFR-04 (Security & CSP):** Strict W3C Trusted Types compliance. Zero `innerHTML` or string `eval` mutations.
- **NFR-05 (Accessibility):** Full keyboard navigation (`tabindex`, `role="tab"`, `role="tablist"`, `aria-selected"`) and WCAG 2.1 AA color contrast ($\ge 4.5:1$).
- **NFR-06 (Regression Zero):** All 89 existing project test suites must pass 100% with exit code 0.

---

## ✅ 5. Acceptance Criteria (Given-When-Then)

### AC-01: Category Switch Filters Child Tabs
- **Given:** Popup is open with `Playback` category active (`Media`, `Audio`, `Tools` visible).
- **When:** User clicks `Analytics` (`#tier1BtnAnalytics`).
- **Then:** `#tier1BtnAnalytics` gains `.active`, child tabs `Media`, `Audio`, and `Tools` receive `.tab-hidden`, child tabs `Tracking` and `Domains` become visible, and `Tracking` becomes active with `#viewTrackingPane` displayed.

### AC-02: Manual Intent Latch Protection
- **Given:** User is watching video in browser, but clicks `Wellness` category in popup to set a sleep timer.
- **When:** Background auto-sync polls 2 seconds later and reports media is playing.
- **Then:** Popup remains on `Wellness` / `Sleep` tab; no automatic switch back to `Playback` occurs.

### AC-03: Bilingual Localization Toggle
- **Given:** Active language is English, buttons show "Playback", "Studio", "Analytics", "Wellness".
- **When:** User toggles language to Hindi (`hi`).
- **Then:** Buttons dynamically update to "प्लेबैक", "स्टूडियो", "एनालिटिक्स", "वेलनेस" without reloading the DOM.
