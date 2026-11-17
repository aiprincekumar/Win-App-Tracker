# Product Requirements Document (PRD): UI/UX & CSS Linking, 5-Band Equalizer & Audio Lab Styling, Tactile Audio Haptics in Settings, Sidebar Status Minimalism & Action Controls Shift to Settings

> **Workspace:** `temp_prompt/ui_ux_audio_sidebar_polish/`  
> **Project:** Web Activity & Media Sentinel (Chrome MV3 Browser Extension)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Lead Department:** Dept 01 Product Requirements & Dept 04 Design System  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 👤 1. User Personas & Target Audience

1. **Alex (The Power Multi-Tasker):** Uses the dashboard on high-resolution multi-monitor setups. Values a clean, uncluttered sidebar that provides instant status-at-a-glance without distracting, bulky action buttons taking up vertical real estate.
2. **Elena (The Audiophile & Media Curator):** Actively utilizes the Media Analytics tab to monitor audio playback across multiple tabs. Demands studio-grade visual feedback for the 5-Band Equalizer and Audio Lab controls, with high-definition vertical sliders, clear frequency markers, and instant preset switching.
3. **Marcus (The System Administrator / Power User):** Frequently configures external hardware bridges (Video Detector HUD and SQLite Data Hub). Expects service reconnection actions and status metrics to reside within the dedicated Settings tab alongside other network and hardware configurations.

---

## 📋 2. Functional Requirements (FR)

- **FR-01 (Topological CSS Linking in HTML):** The `<head>` of `dashboard/dashboard.html` must directly link all 14 modular stylesheets in `dashboard/styles/` in topological dependency order (`tokens.css`, `themes.css`, `layout.css`, `components.css`, `metrics.css`, `tracking.css`, `media.css`, `audio_lab.css`, `settings.css`, `hotkeys.css`, `palette.css`, `backup_digest.css`, `wellbeing_blacklist.css`, and `dashboard.css`) to eliminate `@import` waterfall latencies.
- **FR-02 (5-Band Equalizer Studio Deck Styling):** `#heroAudioEqCard` and its child elements (`.eq-bands-grid`, `#eqBand60` through `#eqBand16000`, `#eqVal60` through `#eqVal16000`, `.eq-preset-dropdown`, `.btn-reset-eq`) must be styled with Liquid Glass 2.0 aesthetics, vertical slider tracks, glowing emerald/cyan neon thumbs, centered 0dB detent markers, and responsive layouts across viewports.
- **FR-03 (Audio Lab Telemetry & Controls Polish):** `#heroAudioLabStatus` and its controls (Master Boost Slider `#heroAudioBoostSlider` 0% to 200%, `#heroAudioBoostVal`, Vocal Clarity `#toggleVocalClarity`, Night Mode `#toggleNightMode`, Audio-Only Mode `#toggleAudioOnlyMode`, and status badges `#audioLabPresetBadge`, `#audioLabVocalBadge`, `#audioLabNightBadge`) must exhibit cohesive Liquid Glass cards, distinct active states, and tactile slider styling.
- **FR-04 (Settings Tactile Audio Haptics Styling):** Card 1.8 (`#cardAppearanceSettings`) in `#paneSettings` must provide dedicated, high-polish styles for `.haptic-volume-control`, `#sliderAudioHapticsVolume` (`.styled-range-slider`), `#lblAudioHapticsVolumeValue` (`.volume-badge`), and `#btnTestAudioHaptics` (`.btn-test-chime`), with clear hover, active, and focus-visible states.
- **FR-05 (Sidebar HUD Status Minimalism):** The sidebar HUD cards (`.sidebar-hud-card`) in `dashboard/dashboard.html` must be stripped of bulky reconnect buttons (`#btnSidebarReconnectHub` and `#btnSidebarReconnect`), converting them into sleek, compact telemetry widgets displaying only status dot, service name, status label, and address.
- **FR-06 (Local Services & Hardware Bridges Card Relocation):** A dedicated "Local Services & Hardware Bridges" card (`#cardHardwareBridges`) must be added to `#paneSettings` in `dashboard/dashboard.html`, housing `#btnSidebarReconnectHub` and `#btnSidebarReconnect` with 100% exact DOM ID preservation, complete with service status indicators and port readouts (65432 & 65433).

---

## ⚙️ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Breakage & 100% Test Suite Passage):** All 44 test suites in `tests/` must pass cleanly (`node run_all_tests.js` exit code 0) without any regression.
- **NFR-02 (W3C Trusted Types & DOM Security):** Zero `.innerHTML` assignments in all modified code. All DOM updates must use safe APIs (`textContent`, `setAttribute`, `classList`). No inline `onclick` or `onchange` attributes.
- **NFR-03 (WCAG 2.1 AA Accessibility):** All sliders must retain explicit `role="slider"`, `aria-label`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`. High color contrast ratios (>= 4.5:1 for normal text) in both dark and light themes.
- **NFR-04 (Design System Parity):** All new and modified CSS must adhere to the project's Liquid Glass 2.0 design tokens (specular borders, calibrated backdrop-filter blur, CSS custom properties).
- **NFR-05 (Encoding & Hygiene):** All modified and created files must strictly adhere to the UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) encoding standard. Zero secrets detected by `gitleaks detect`.

---

## 📖 4. INVEST-Compliant User Stories

### US-01: Direct Topological CSS Linking
> **As an** extension user,  
> **I want** the dashboard to load its modular stylesheets in parallel directly from HTML,  
> **So that** page rendering is instantaneous without any Flash of Unstyled Content (FOUC) or `@import` cascading delays.  
- **I**ndependent: Can be completed and verified standalone.  
- **N**egotiable: Number of links matches available modular files.  
- **V**aluable: Eliminates CSS waterfall overhead.  
- **E**stimable: Directly maps to `<link>` tags in `dashboard.html`.  
- **S**mall: Localized to `dashboard.html` `<head>`.  
- **T**estable: Validated by HTML parser and browser DevTools network tab.

### US-02: Studio-Grade 5-Band Equalizer Deck
> **As an** audiophile user,  
> **I want** the 5-Band Equalizer to display sleek vertical slider tracks with neon thumbs, 0dB detent lines, and clear decibel badges,  
> **So that** I can intuitively shape my audio frequencies with precision studio tactile feedback.  
- **I**ndependent: Focuses on `#heroAudioEqCard` and `audio_lab.css`.  
- **N**egotiable: Visual token fine-tuning within Liquid Glass 2.0 specs.  
- **V**aluable: Premium user experience for Web Audio features.  
- **E**stimable: Concrete CSS selectors and properties.  
- **S**mall: Scoped to audio lab styles and EQ card DOM.  
- **T**estable: Verified by `test_dashboard_full_audio_lab_parity.js`.

### US-03: Tactile Audio Haptics Controls Polish
> **As a** dashboard user,  
> **I want** the audio haptics volume slider and chime test button in Settings to look visually polished and interactive,  
> **So that** I can easily adjust and test procedural sound effects with tactile visual feedback.  
- **I**ndependent: Scoped to Card 1.8 in `#paneSettings` and `settings.css`.  
- **N**egotiable: Accent colors match active theme tokens.  
- **V**aluable: Delightful micro-interactions and clear sound setting controls.  
- **E**stimable: Standard slider and button CSS rules.  
- **S**mall: Localized to `settings.css` and `dashboard.css`.  
- **T**estable: Verified by theme and DOM inspection tests.

### US-04: Minimalist Sidebar HUD Status
> **As a** regular user,  
> **I want** the sidebar HUD cards to show only clean, non-intrusive status indicators,  
> **So that** my sidebar navigation remains focused, streamlined, and aesthetically pleasing.  
- **I**ndependent: Scoped to sidebar DOM in `dashboard.html`.  
- **N**egotiable: Layout padding and font sizing.  
- **V**aluable: Eliminates visual clutter in the primary navigation surface.  
- **E**stimable: Surgical HTML modification and CSS refinement.  
- **S**mall: Targets `.sidebar-hud-card` in `dashboard.html`.  
- **T**estable: Verified by layout inspection and DOM checks.

### US-05: Local Services & Hardware Bridges Relocation
> **As a** system administrator,  
> **I want** the reconnect controls for SQLite Data Hub and Video Detector HUD to live in a dedicated card in Settings,  
> **So that** all system bridge and connectivity management actions are consolidated in one logical location.  
- **I**ndependent: Depends on sidebar button removal.  
- **N**egotiable: Card layout and badge styling.  
- **V**aluable: Architectural clarity and intuitive UI hierarchy.  
- **E**stimable: Standard Bento grid card in `#paneSettings`.  
- **S**mall: Scoped to `#paneSettings` in `dashboard.html` and `settings.css`.  
- **T**estable: Verified by event listener tests and `run_all_tests.js`.

---

## 🧪 5. Given-When-Then Acceptance Criteria Contracts

### Scenario 1: Parallel Modular Stylesheet Loading
- **Given** the dashboard is loaded by the browser or test harness,  
- **When** the `<head>` of `dashboard/dashboard.html` is parsed,  
- **Then** all 14 modular stylesheets (`tokens.css`, `themes.css`, `layout.css`, `components.css`, `metrics.css`, `tracking.css`, `media.css`, `audio_lab.css`, `settings.css`, `hotkeys.css`, `palette.css`, `backup_digest.css`, `wellbeing_blacklist.css`, and `dashboard.css`) must be present as `<link rel="stylesheet">` elements in strict topological order before `dashboard.css`.

### Scenario 2: 5-Band Equalizer Studio Deck Rendering
- **Given** the user is viewing the Media Analytics tab (`#paneMedia`),  
- **When** the 5-Band Graphic Equalizer deck (`#heroAudioEqCard`) is displayed,  
- **Then** all 5 vertical sliders (`#eqBand60`, `#eqBand250`, `#eqBand1000`, `#eqBand4000`, `#eqBand16000`) must render with vertical slider tracks, glowing neon thumbs, `orient="vertical"`, `role="slider"`, decibel readout badges (`#eqVal60`..`#eqVal16000`), and a centered 0dB detent horizon line.

### Scenario 3: Tactile Audio Haptics in Settings
- **Given** the user is viewing the Settings tab (`#paneSettings`),  
- **When** navigating to Card 1.8 (`#cardAppearanceSettings`),  
- **Then** `#toggleAudioHaptics`, `#sliderAudioHapticsVolume` (`.styled-range-slider`), `#lblAudioHapticsVolumeValue` (`.volume-badge`), and `#btnTestAudioHaptics` (`.btn-test-chime`) must render with high-definition styling, glowing focus rings, and proper badge formatting.

### Scenario 4: Clean Sidebar Telemetry HUD
- **Given** the user views the sidebar navigation,  
- **When** inspecting the sidebar HUD cards (`.sidebar-hud-card`),  
- **Then** the cards must display only the service title, status dot (`#dataHubSidebarDot`, `#hudStatusDot`), status label (`#dataHubSidebarLabel`, `#hudStatusLabel`), and service address, with zero bulky reconnect buttons present in the sidebar.

### Scenario 5: Hardware Bridges Management in Settings
- **Given** the user navigates to `#paneSettings`,  
- **When** inspecting the new "Local Services & Hardware Bridges" card (`#cardHardwareBridges`),  
- **Then** the card must contain `#btnSidebarReconnectHub` and `#btnSidebarReconnect` with exact DOM IDs, active click handlers, port indicators, and connection status badges.

### Scenario 6: Zero Regression Across Test Suite
- **Given** all UI, HTML, and CSS modifications are applied,  
- **When** `node run_all_tests.js` is executed,  
- **Then** all 44 test files must pass with exit code 0, 0 syntax errors, and zero `.innerHTML` violations.
