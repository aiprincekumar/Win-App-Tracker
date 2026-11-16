# Product Requirements Document (PRD)
## Web Activity & Media Sentinel - Dashboard UI/UX Enhancement

> **Document Type:** Product Requirements Document (`PRD.md`)  
> **Target System:** Web Activity & Media Sentinel (Chrome MV3 Extension)  
> **Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Ephemeral Container:** `temp_prompt/dashboard_uiux_enhancement/`  
> **Task ID:** `TASK-DASHBOARD-UIUX-ENHANCEMENT-001`  
> **Status:** READY FOR REVIEW  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Vikram (The Power Developer & Multitasker)
- **Profile:** Software engineer working across multiple monitors (1440p main, 1080p vertical), keeping background tutorials and music running on YouTube while coding.
- **Pain Point:** Dashboard does not adapt well to ultra-wide displays; switching media or seeking to an exact timestamp takes too many mouse clicks and lacks precision.
- **Desired State:** Hits `Ctrl+K` to search open domains or trigger commands instantly, seeks media with millisecond floating tooltip previews, and navigates tabs using single-key hotkeys (`1`, `2`, `3`).

### Persona 2: Priya (The Aesthetic Pro & Night-Owl)
- **Profile:** UI/UX designer and researcher working in dark environments who values tactile feedback and visual polish.
- **Pain Point:** The existing dashboard is a flat, dark slate box that feels stiff and silent. Switching between applications provides zero tactile satisfaction.
- **Desired State:** Deep OLED black theme with custom cyber emerald or violet accent colors, frosted glass cards with subtle specular edge glimmers, and soft audio ticks when dragging volume or seek sliders.

### Persona 3: David (The Accessibility & Keyboard-Only Specialist)
- **Profile:** User who navigates almost exclusively using keyboard shortcuts and requires high visual contrast.
- **Pain Point:** Standard focus outlines are thin and hard to track; lack of standard keyboard shortcuts makes media control slow.
- **Desired State:** High-visibility dual-ring focus outlines (WCAG 2.1 AAA 7:1 contrast), comprehensive cheat-sheet modal (`?`), and deterministic keyboard traps in all modal dialogues.

---

## 📋 2. Functional Requirements (FR)

- **FR-1 (Bento Grid Engine):** The dashboard MUST render in a 12-column responsive Bento Grid layout where cards have explicit column spans (`span 12`, `span 8`, `span 6`, `span 4`, `span 3`) and row spans.
- **FR-2 (Widget Customization & Persistence):** Bento cards MUST support minimize/collapse and drag-to-reorder; the customized layout state MUST persist in `chrome.storage.local` under `dashboardWidgetLayout`.
- **FR-3 (iOS 26 Liquid Glass Materiality):** All dashboard cards MUST render with frosted glass surface styling (`backdrop-filter: blur(24px) saturate(190%)`), 1px specular lighting gradient border, and multi-tier ambient shadows.
- **FR-4 (Omni Command Palette):** Pressing `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS) MUST instantly open a centered frosted-glass Command Palette modal with fuzzy filtering across Quick Actions, Domains, Settings, and Active Media Tabs.
- **FR-5 (Precision Timeline Scrubber):** Moving the cursor over `#heroMediaSeekSlider` MUST project a floating glass tooltip showing exact time (`mm:ss / mm:ss`) and percentage. Interactive chapter tick markers MUST render when media chapters exist.
- **FR-6 (Kinetic Metric Rollers):** When telemetry metrics load or refresh, numerical values in `#trackMetricTodayTime`, `#trackMetricDailyAvg`, and `#trackMetricTotalTime` MUST roll smoothly from 0 to their target values over 600ms using a cubic-bezier curve.
- **FR-7 (Dynamic Multi-Theme & Accent Engine):** The system MUST support 4 base substrate themes (Midnight OLED, Deep Slate Navy, Nordic Pine, Studio Light) and 5 accent palettes (Emerald, Cyan, Violet, Rose, Amber) with instant 16ms CSS variable injection.
- **FR-8 (Synthesized Tactile Audio Haptics):** The dashboard MUST include a zero-asset mathematical Web Audio synthesizer (`SentinelHapticAudioEngine`) producing procedural micro-ticks (800Hz), clicks (1200Hz), and success chimes (523Hz+659Hz) with user volume and mute controls.
- **FR-9 (Ergonomic Keyboard Hotkeys & Cheat Sheet):** Pressing `1`, `2`, `3`, `Space`, `M`, `F`, `P`, or `?` MUST execute their respective navigation, media control, or cheat-sheet actions.
- **FR-10 (Bilingual Localization):** All new UI copy, command palette actions, themes, and hotkey labels MUST be localized in English and Hindi in `DASHBOARD_UIUX_I18N`.

---

## ⚙️ 3. Non-Functional Requirements (NFR)

- **NFR-1 (Performance & 60fps Budget):** All animations (kinetic rolling, card hover, staggered entrance, command palette fade) MUST run strictly at 60fps using GPU transforms (`transform`, `opacity`) without triggering layout reflows.
- **NFR-2 (Zero Cumulative Layout Shift):** Skeleton loaders with fixed aspect ratios and `min-height` reservations MUST ensure CLS = 0.00 during all data fetches.
- **NFR-3 (Zero External Media Assets):** The audio haptic engine MUST generate 100% of its sound waves programmatically via Web Audio API without fetching any external `.wav` or `.mp3` files.
- **NFR-4 (Accessibility Compliance):** All text elements MUST meet or exceed WCAG 2.1 AAA contrast guidelines (minimum 7:1 ratio against card backgrounds). All interactive controls MUST feature 2px dual-ring focus indicators.
- **NFR-5 (Strict Security & CSP):** No inline `eval()`, no dynamic string execution, and no unescaped innerHTML injections inside the command palette search engine.

---

## 📊 4. MoSCoW Prioritization

| Priority | Feature / Requirement | Target Phase |
| :--- | :--- | :---: |
| **Must Have (P0)** | 12-Column Bento Grid Layout & Responsive Breakpoints | Phase 1 |
| **Must Have (P0)** | iOS 26 Liquid Glass CSS Tokens & Specular Borders | Phase 1 |
| **Must Have (P0)** | Omni Command Palette (`Ctrl+K`) with Fuzzy Search | Phase 2 |
| **Must Have (P0)** | Global Ergonomic Hotkeys (`1`, `2`, `3`, `Space`, `M`) | Phase 2 |
| **Should Have (P1)** | Precision Timeline Scrubber with Floating Time Tooltip | Phase 3 |
| **Should Have (P1)** | 60fps Kinetic Number Rollers & Staggered Card Entrance | Phase 3 |
| **Should Have (P1)** | Synthesized Tactile Audio Haptics Engine | Phase 4 |
| **Should Have (P1)** | 4 Base Themes & 5 Dynamic Accent Palettes | Phase 4 |
| **Could Have (P2)** | Drag-to-Reorder Bento Cards with Storage Sync | Phase 1 |
| **Could Have (P2)** | Sidebar Pulsing 3-Bar Equalizer on Active Audio | Phase 3 |

---

## 📜 5. INVEST User Stories & Acceptance Contracts

### User Story 1 (US-1): Modular Bento Grid & Liquid Glass (Phase 1)
- **Story:** *As a multi-window user, I want the dashboard widgets to arrange themselves in a balanced 12-column Bento Grid with frosted glass depth so that my screen space is used efficiently with clear visual hierarchy.*
- **Given:** The dashboard is opened on any screen resolution between 768px and 3840px.
- **When:** The page finishes rendering.
- **Then:** The Hero Media Player spans 8 columns, telemetry donut spans 4 columns, metric cards span 3 columns each; cards exhibit 24px frosted blur with specular borders; and layout shift is strictly zero (CLS = 0).

### User Story 2 (US-2): Omni Command Palette & Quick Navigation (Phase 2)
- **Story:** *As a keyboard power user, I want to press `Ctrl+K` to open a unified search palette so that I can trigger actions and navigate directly without using the mouse.*
- **Given:** The user is on any tab of the dashboard.
- **When:** The user presses `Ctrl+K` or `Cmd+K`.
- **Then:** The frosted-glass Command Palette opens with focus on the input; typing filters results in real-time; pressing `ArrowDown` and `Enter` executes the command; and pressing `Escape` dismisses the modal and restores focus.

### User Story 3 (US-3): Precision Timeline Seeking (Phase 3)
- **Story:** *As a media consumer, I want to hover over the video seek slider and see the exact timestamp and chapter name so that I can scrub to the exact moment I need.*
- **Given:** A media tab is actively playing.
- **When:** The user hovers their cursor over `#heroMediaSeekSlider`.
- **Then:** A floating glass tooltip appears directly above the cursor showing `mm:ss / mm:ss` and percentage; dragging expands the slider thumb smoothly.

### User Story 4 (US-4): Tactile Audio & Custom Themes (Phase 4)
- **Story:** *As a user who customizes their workspace, I want to choose my accent color and receive subtle audio clicks when interacting so that the dashboard feels tactile and personalized.*
- **Given:** The user navigates to Settings or uses the Command Palette.
- **When:** The user selects "Cyber Emerald" accent and moves a slider.
- **Then:** The primary accent CSS variable updates in <= 16ms across the entire UI; the Web Audio synthesizer plays a soft 800Hz micro-tick; and the preferences are persisted in `chrome.storage.local`.
