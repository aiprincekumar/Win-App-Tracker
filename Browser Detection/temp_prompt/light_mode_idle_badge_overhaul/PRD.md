# Product Requirements Document (PRD): Light Mode Status Pill Badge Overhaul

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/light_mode_idle_badge_overhaul/`  
> **Task ID:** `TASK-LIGHT-MODE-IDLE-BADGE-001`  
> **Lead Department:** Dept 01 (Product Requirements)  
> **Collaborating Departments:** Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Daytime Knowledge Worker (Light Mode Default)
- **Profile:** Operates in a brightly lit office or outdoor environment with browser and dashboard set to Light Mode.
- **Pain Point:** Looking at the Audio Visualizer or Focus/Sleep hubs, the "IDLE" pill badges look like dark smudge marks. The grey dot inside is nearly invisible, and the text looks murky and unrefined.
- **Desired Outcome:** Instantly readable, crisp, premium light status badges that look intentionally designed for light mode, with clear visual hierarchy between idle and active states.

### Persona 2: Power User Switching Between Light and Dark Themes
- **Profile:** Switches between Midnight OLED and Studio Light themes depending on time of day.
- **Pain Point:** Inconsistencies where certain badges adapt to light mode while others remain locked to dark mode styles.
- **Desired Outcome:** 100% theme parity where dark mode retains its neon cyber-glow aesthetic and light mode presents clean, high-contrast, paper-white surfaces with deep slate typography.

---

## 🎯 2. INVEST-Compliant User Stories

### User Story 1 (Audio Visualizer Header Status Pill)
> **As a** user viewing the Audio Visualizer in Light Mode,  
> **I want** the header status pill (`#vizHeaderStatusPill`) to display on a clean light surface with a crisp dot and high-contrast text,  
> **So that** I can clearly see whether audio visualization DSP is IDLE or ACTIVE without straining my eyes.

### User Story 2 (Focus & Sleep Sentinel Status Badges)
> **As a** user managing productivity and sleep timers in Light Mode,  
> **I want** the focus mode badges (`.badge-focus`, `.badge-break`), sleep status badge (`.dash-sleep-badge`), and zen status indicator to feature accessible text contrast,  
> **So that** my active sessions and break cycles are unmistakable.

### User Story 3 (Popup Live Media & Sentinel Badges)
> **As a** user opening the extension popup in Light Mode,  
> **I want** the dynamic media status button, sleep dial badge, and focus badge to feature crisp borders, clean surfaces, and distinct dot indicators,  
> **So that** the popup status mirrors the clarity of the full dashboard.

---

## 🏷️ 3. MoSCoW Feature Prioritization

| Priority | Requirement Code | Feature Scope | Description |
| :---: | :---: | :--- | :--- |
| **Must Have** | `FR-01` | Audio Visualizer Light Pill | Style `.viz-header-status-pill`, `.viz-live-dot`, and `.viz-live-text` in Light Mode. |
| **Must Have** | `FR-02` | Popup Sleep & Focus Badges | Add complete Light Mode rules for `.sleep-status-badge` and `.popup-focus-badge` in Popup. |
| **Must Have** | `FR-03` | Focus Hub Status Contrast | Upgrade `.badge-focus`, `.badge-break`, and `.zen-status-badge` to WCAG AAA contrast (>= 7:1). |
| **Must Have** | `FR-04` | Player Hero & Deck Pills | Style `.status-pill.idle` and `.deck-status-pill` variants in Light Mode. |
| **Must Have** | `NFR-01` | Dark Mode Zero-Mutation | Ensure dark mode styles are 100% untouched. |
| **Must Have** | `NFR-02` | Rule 28 Modularity | Preserve `wellbeing_blacklist.css` untouched; keep `wellbeing_light.css` < 700 lines. |
| **Should Have** | `FR-05` | Popup Dynamic Button Dot | Polish `.dynamic-status-btn.idle .status-dot` for crisp definition in Light Mode. |
| **Should Have** | `FR-06` | Sidebar HUD Status Dots | Verify `.hud-dot.idle` light mode shadow and contrast. |
| **Could Have** | `FR-07` | Visualizer HUD Badges | Polish `.viz-hud-badge` in light mode canvas overlay. |
| **Won't Have** | `FR-08` | DOM Structure Modification | Zero HTML or DOM rewrites; CSS-only accessibility enhancements. |

---

## 🔍 4. Rigorous Given-When-Then Acceptance Criteria Contracts

### Contract 1: Audio Visualizer Header Status Pill (`FR-01`)
- **Given:** The user has set the application theme to Light Mode (`body.theme-light` or `[data-theme="light"]`).
- **When:** The Audio Visualizer widget is rendered in an IDLE state.
- **Then:**
  1. `#vizHeaderStatusPill` has background `#f8fafc` (or equivalent clean light surface) and border `1px solid #cbd5e1`.
  2. `#vizHeaderStatusText` displays in `#475569` (contrast ratio >= 4.5:1 against surface).
  3. `.viz-live-dot` displays with background `#64748b` (crisp, non-blurry dot).
  4. When audio visualization becomes active (`.active`), background transitions to emerald tint (`rgba(16, 185, 129, 0.12)`), text transitions to `#065f46`, and dot glows with `#059669`.

### Contract 2: Popup Sleep Dial Status Badge (`FR-02`)
- **Given:** The popup is opened in Light Mode (`[data-theme="light"]`).
- **When:** The sleep tab is displayed with no active timer (`currentSleepTimer.state === 'IDLE'`).
- **Then:**
  1. `#sleepDialStatusBadge.idle` has background `#f1f5f9`, border `1px solid #cbd5e1`, and color `#475569`.
  2. Contrast ratio between `#475569` and `#f1f5f9` is >= 4.5:1 (WCAG AA).
  3. When running (`.running`), background is soft indigo tint, border is indigo, and text is `#3730a3` (contrast >= 7:1).
  4. When paused (`.paused`), text is amber `#92400e` (contrast >= 6.8:1).

### Contract 3: Focus Sentinel Mode Badge Contrast (`FR-03`)
- **Given:** The Focus Sentinel Hub is displayed in Light Mode.
- **When:** The Pomodoro timer is in Focus mode (`.badge-focus`) or Break mode (`.badge-break`).
- **Then:**
  1. `.badge-focus` has text color `#065f46` (contrast >= 7.2:1 against light surface) instead of dark-mode `#34d399`.
  2. `.badge-break` has text color `#1e40af` (contrast >= 7.0:1) instead of dark-mode light blue.
  3. Backgrounds use 12% opacity tints (`rgba(16, 185, 129, 0.12)` and `rgba(59, 130, 246, 0.12)`).

### Contract 4: Dark Mode Zero-Mutation Invariant (`NFR-01`)
- **Given:** The application is operating in Dark Mode (default or `body.theme-dark` / `[data-theme="dark"]`).
- **When:** Any status badge is rendered.
- **Then:** All original dark mode styles, colors, box-shadows, and background transparencies remain 100% bit-for-bit identical to the baseline.
