# 🌙 Product Requirements Document (PRD): Sleep Timer Live Micro-Widget

> **Document Type:** Product Requirements Document  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Initiative:** Sleep Timer Live Micro-Widget in Left Navigation Panel Matching Focus Sentinel  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 👥 1. User Personas

1. **The Late-Night Media Consumer (Alex):**
   - Listens to podcasts, ambient audio, or videos before sleep.
   - Needs a quick, glanceable countdown of the remaining sleep timer from any view (Media Deck, Analytics, Settings) without navigating away.
   - Values rapid 1-click access to extend or pause the timer when needed.
2. **The Deep-Work Engineer (Priya):**
   - Juggles multiple tasks and browser tabs, using Pomodoro and Sleep Timer concurrently.
   - Needs consistent visual language and muscle memory across both widgets in the sidebar.
3. **The Accessibility-First User (Jordan):**
   - Navigates primarily with keyboard (`Tab`, `Enter`, `Space`) and has `prefers-reduced-motion` enabled.
   - Demands high-contrast indicators, screen-reader accessible ARIA roles, and zero vestibular trigger animations.

---

## 🎯 2. Requirements Specification

### 2.1 Functional Requirements (FR)
- **FR-01 (Sidebar Display):** The dashboard sidebar MUST display `#sleepLiveMicroWidget` within `.sidebar-hud-group` directly underneath or adjacent to `#wellbeingLiveMicroWidget`.
- **FR-02 (Live Clock Display):** `#sleepMicroClock` MUST display remaining timer duration in `MM:SS` (or `HH:MM:SS` if > 60m), and default to `00:00` when idle or cancelled.
- **FR-03 (State Mode Label):** `#sleepMicroMode` MUST dynamically display `Sleep Idle`, `Sleep Active`, `Sleep Fading`, or `Sleep Paused` corresponding to timer status.
- **FR-04 (Status Indicator Dot):** `#sleepMicroStatusDot` MUST render with class `idle` (grey), `online` (green/cyber-indigo), or `warn` (amber/orange) based on active state.
- **FR-05 (Deep-Linking & Smooth Scroll):** Clicking or keyboard-activating `#sleepLiveMicroWidget` MUST switch the active tab to `wellbeing`, scroll `#cardSleepSentinelHub` into the center of the viewport, and trigger transient glow animations.
- **FR-06 (CTA Focus Acquisition):** Upon deep-linking, `#btnDashSleepToggle` MUST receive keyboard focus with `preventScroll: true` and display a transient pulse animation (`.highlight-pulse`) for 2000ms.
- **FR-07 (Keyboard Operability):** Pressing `Enter` or `Space` while `#sleepLiveMicroWidget` has focus MUST trigger the exact same navigation routine as a mouse click.
- **FR-08 (Haptic Audio Feedback):** Activating `#sleepLiveMicroWidget` MUST trigger `sentinelHaptics.playClick()` if haptic audio is initialized and enabled.

### 2.2 Non-Functional Requirements (NFR)
- **NFR-01 (Performance & 60 FPS):** CSS animations must utilize GPU-accelerated properties (`box-shadow`, `border-color`, `transform`, `opacity`) without causing layout thrashing or cumulative layout shift (CLS = 0.00).
- **NFR-02 (Accessibility & WCAG 2.1 AA):** All text elements must achieve >= 4.5:1 contrast ratio against the background. Full keyboard navigability and ARIA accessibility must be verified.
- **NFR-03 (Reduced Motion):** Under `prefers-reduced-motion: reduce`, animations MUST be replaced with non-pulsing solid borders and outlines.
- **NFR-04 (DOM Safety & Zero InnerHTML):** Strict prohibition of `innerHTML`. All element updates must use `textContent`, `classList`, or safe DOM APIs to comply with W3C Trusted Types.
- **NFR-05 (Code Modularity & Rule 28):** All new or refactored functions must not exceed 50 lines, and nesting depth must not exceed 3 levels.

---

## 🏆 3. MoSCoW Prioritization

| Priority | Requirement Code | Description |
| :--- | :--- | :--- |
| **Must Have** | FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07 | Sidebar micro-widget markup, styling, deep-linking, CTA focusing, and live telemetry synchronization. |
| **Must Have** | NFR-02, NFR-03, NFR-04, NFR-05 | WCAG accessibility, reduced motion safety, Trusted Types zero-innerHTML, Rule 28 code modularity. |
| **Should Have** | FR-08 | Haptic click sound effect on micro-widget activation. |
| **Could Have** | N/A | Secondary context menu for quick presets directly on the micro-widget. |
| **Won't Have** | N/A | Complex modal dialogues or audio synthesizers inside the micro-widget (reserved for the hero card). |

---

## 🧪 4. INVEST-Compliant User Stories & Acceptance Criteria

### User Story 1: Sidebar Glancing & Telemetry
> **As a** late-night browser user,  
> **I want to** glance at the left sidebar and immediately know if my sleep timer is running,  
> **So that** I don't accidentally leave media playing all night without verification.

#### Acceptance Criteria (Given-When-Then):
- **Given** the Sleep Timer is idle or cancelled,  
  **When** I view the left sidebar,  
  **Then** `#sleepMicroClock` shows `00:00`, `#sleepMicroMode` shows `Sleep Idle`, and `#sleepMicroStatusDot` has class `hud-dot idle`.
- **Given** the Sleep Timer is actively running with 24 minutes remaining,  
  **When** I view the left sidebar,  
  **Then** `#sleepMicroClock` shows `24:00`, `#sleepMicroMode` shows `Sleep Active`, and `#sleepMicroStatusDot` has class `hud-dot online`.
- **Given** the Sleep Timer is in the audio fading phase,  
  **When** I view the left sidebar,  
  **Then** `#sleepMicroMode` shows `Sleep Fading` and `#sleepMicroStatusDot` has class `hud-dot warn`.

---

### User Story 2: Deep-Linking & Action Focusing
> **As a** user viewing any dashboard tab,  
> **I want to** click the Sleep Sentinel micro-widget in the sidebar,  
> **So that** I am instantly taken to the Sleep Sentinel Hub with the start/pause button ready to press.

#### Acceptance Criteria (Given-When-Then):
- **Given** I am on the Media Deck tab (`#paneMedia`),  
  **When** I click `#sleepLiveMicroWidget`,  
  **Then** the active tab switches to `wellbeing`, `#cardSleepSentinelHub` is scrolled smoothly into view, receives `.sleep-card-highlight`, and `#btnDashSleepToggle` receives keyboard focus and `.highlight-pulse`.
- **Given** I am using keyboard navigation,  
  **When** I tab to `#sleepLiveMicroWidget` and press `Enter` or `Space`,  
  **Then** the exact same deep-link routine executes identically to a mouse click.
- **Given** my operating system has reduced motion enabled,  
  **When** I activate `#sleepLiveMicroWidget`,  
  **Then** the scroll behavior is instantaneous (`behavior: 'auto'`), and highlight styles use static outlines without keyframe pulsing.
