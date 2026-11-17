# Product Requirements Document (PRD): Audio Lab 2x2 Grid & Sub-Bass Enhancer

> **Task ID:** `TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001`  
> **Document:** `temp_prompt/dashboard_audio_lab_2x2_grid_and_bass_boost/PRD.md`  
> **Lead Department:** Dept 01 (Product Requirements)  
> **Audience:** Frontend Engineers, Audio Engineers, QA Testers  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Audiophile / Music Enthusiast ("Alex")
- **Scenario:** Alex listens to high-fidelity EDM, rock, and orchestral music on YouTube. Alex wants deep, visceral low-frequency punch without having to manually crank individual equalizer sliders each session.
- **Pain Point:** Currently, only "Vocal Clarity" (boosts dialogue) and "Night Shield" (compresses peaks) exist as quick toggles. There is no quick 1-click Sub-Bass enhancer.

### Persona 2: Laptop & Compact Display User ("Priya")
- **Scenario:** Priya operates the dashboard on a 13-inch laptop (1280x800 or 1366x768).
- **Pain Point:** The 3 toggle cards in `.enhancements-grid` are crowded into 3 thin vertical columns, causing the toggle switch elements to awkwardly push past the card borders, ruining the visual polish and making clicking frustrating.

### Persona 3: Media Consumer Seeking Visual Clarity ("Carlos")
- **Scenario:** Carlos glances at the Audio Lab header to understand current DSP status.
- **Pain Point:** Carlos sees a "Flat" badge next to "Audio Lab & DSP Enhancements", and also sees "Flat" selected in the Equalizer card directly below. The duplicate badge creates confusion about whether "Flat" refers to a global mode or an EQ preset.

---

## 📋 2. MoSCoW Feature Prioritization

| Priority | Requirement | Feature Description |
| :--- | :--- | :--- |
| **Must Have (M)** | FR-01 | Remove duplicate `#audioLabPresetBadge` from `.audio-lab-badges` header container. |
| **Must Have (M)** | FR-02 | Refactor `.enhancements-grid` into a balanced 2-column grid layout across desktop viewports. |
| **Must Have (M)** | FR-03 | Prevent `.switch-toggle` from overflowing card boundaries under all supported dashboard viewports. |
| **Must Have (M)** | FR-04 | Add 4th toggle card: "Sub-Bass Boost / Enhancer" (`toggleBassBoost`) completing a 2x2 grid. |
| **Must Have (M)** | FR-05 | Implement Web Audio API low-shelf DSP filter boost (+7dB at 60Hz, clamped to +12dB max). |
| **Must Have (M)** | FR-06 | Persist `bass_boost` state across sessions in `chrome.storage.local.audio_lab_settings`. |
| **Must Have (M)** | FR-07 | Bilingual English and Hindi dictionary coverage for new title, description, and status strings. |
| **Must Have (M)** | FR-08 | Zero test failures across all 63+ project test suites. |
| **Should Have (S)** | FR-09 | Micro-animation hover transitions on the new Sub-Bass card matching existing liquid-glass styling. |
| **Could Have (C)** | FR-10 | Dynamic status indicator pill on active state. |
| **Won't Have (W)** | FR-11 | Dynamic slider control for bass boost frequency cutoff (fixed at optimal 60Hz shelf for simplicity). |

---

## 📐 3. INVEST-Compliant User Stories

### User Story 1 (Header Cleanliness):
> **As a** dashboard user,  
> **I want** the Audio Lab header to display only operational feature statuses (Vocal, Night),  
> **So that** I am not confused by redundant preset information that is already visible in the Equalizer card.

### User Story 2 (2-Column Ergonomics):
> **As a** laptop or desktop user,  
> **I want** the Audio Enhancement toggle cards arranged in a clean 2x2 grid with ample width,  
> **So that** switches never overflow outside the cards and labels remain legible without truncation.

### User Story 3 (Sub-Bass Enhancement):
> **As a** music and movie enthusiast,  
> **I want** a dedicated 1-click Sub-Bass Boost toggle,  
> **So that** I can instantly elevate bass resonance and warmth without fine-tuning manual EQ bands.

---

## ✅ 4. Rigorous Acceptance Criteria (Given-When-Then)

### AC-01: Header Badge Deletion
- **Given** the Dashboard is loaded,
- **When** the `#audioLabCard` header is inspected,
- **Then** `#audioLabPresetBadge` MUST NOT exist in `dashboard.html`,
- **And** `#audioLabVocalBadge` and `#audioLabNightBadge` MUST render cleanly without JavaScript errors.

### AC-02: 2x2 Grid Layout & No Switch Overflow
- **Given** a viewport width between 641px and 1920px,
- **When** `.enhancements-grid` is rendered,
- **Then** it MUST display exactly 2 columns (`grid-template-columns: repeat(2, minmax(0, 1fr))`),
- **And** all 4 `.enhancement-card` containers MUST contain their respective `.switch-toggle` controls with 0px overflow (`element.scrollWidth <= element.clientWidth`).

### AC-03: Sub-Bass Toggle State & Persistence
- **Given** the user toggles `#toggleBassBoost` to ON,
- **When** `change` event fires,
- **Then** `chrome.storage.local` MUST update `audio_lab_settings.bass_boost = true`,
- **And** `APPLY_AUDIO_LAB_SETTINGS` message MUST be dispatched to active media tabs.

### AC-04: Web Audio DSP Low-Shelf Processing
- **Given** active media audio playback in a tab,
- **When** `applyAudioLabSettings({ bass_boost: true })` is invoked,
- **Then** `eqFilters[60].gain` MUST increase by +7dB above baseline, clamped to a maximum of +12dB.

### AC-05: Bilingual Translations
- **Given** the dashboard is toggled to Hindi (`hi`),
- **When** `#lblAudioBassTitle` and `#lblAudioBassDesc` are inspected,
- **Then** they MUST display correct Hindi translations (`'🔊 सब-बास बूस्ट'` and `'गहरा बेस व लो-फ़्रीक्वेंसी पंच उभारें'`).
