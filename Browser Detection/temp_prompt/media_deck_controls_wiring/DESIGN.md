# Design System & UI/UX Preservation Specification: Media Controls

> **Document Type:** Design System & UI/UX Preservation Specification  
> **Workspace Container:** `temp_prompt/media_deck_controls_wiring/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Task ID:** `TASK-MEDIA-DECK-CONTROLS-001`

---

## 🎨 1. UI/UX Preservation Constitutional Invariant

> [!IMPORTANT]
> **ABSOLUTE UI/UX PRESERVATION MANDATE:**  
> The visual styling, Bento grid hierarchy, liquid glass materiality, and design token scales across `dashboard/dashboard.html`, `dashboard/dashboard.css`, and related stylesheets must be **100% PRESERVED**. No CSS refactors or visual restructuring is permitted. All functionality must cleanly bind to existing DOM elements and match existing button classes.

---

## 🎛️ 2. Multi-Tab Live Media Deck Component Specifications

### 2.1 Media Deck Card Layout Anatomy
Each card inside `#mediaDeckGrid` consists of 4 distinct rows instantiated via pure DOM creation:
1. **Top Row (`.deck-card-top`):**
   - Favicon (`.deck-favicon`)
   - Tab / Stream Title (`.deck-card-title.text-truncate`)
   - Platform Badge (`.tag-platform.badge-accent`)
2. **Meta Row (`.deck-card-meta`):**
   - Live Status Pill (`.deck-status-pill.playing` / `.paused` / `.muted`)
   - Domain Badge (`.badge-dim`)
3. **Scrubber Row (`.deck-scrubber-row`):**
   - Interactive Mini-Scrubber (`.deck-mini-scrubber`)
     - Fill Bar (`.deck-scrubber-progress`)
     - Inline style: `cursor: pointer; position: relative;`
   - Timestamp Display (`.deck-time-display` e.g. `01:24 / 04:15`)
4. **Controls Row (`.deck-card-controls`):**
   - Play/Pause Button: `.btn-deck-ctrl.btn-deck-play` (`▶` / `⏸️`)
   - Mute Button: `.btn-deck-ctrl.btn-deck-mute` (`🔊` / `🔇`)
   - Volume Slider: `.deck-volume-slider` (`min="0" max="100"`)
   - Solo Button: `.btn-deck-ctrl.btn-deck-solo` (`🎧 Solo Tab`)
   - **Switch to Tab Button (New Addition):** `.btn-deck-ctrl.btn-deck-switch-tab` (`🎯 Switch Tab`)
     - Utilizes identical `.btn-deck-ctrl` styling for 100% visual consistency.
     - `aria-label="Switch to Tab"` and tooltip `title="Switch to this media tab in browser"`.

### 2.2 CSS Stylesheet & Materiality Bindings
- Stylesheet: `dashboard/styles/media.css` and `dashboard/dashboard.css`.
- Glass Materiality: `backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);`.
- Hover Transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1);`.

---

## 📺 3. Hero Media Player Component Specifications

### 3.1 Preserved Hero Elements & DOM IDs
The Hero Player card (`#heroMediaPlayerCard`) retains its exact structure:
- **Play/Pause Toggle:** `#btnHeroPlayPause` (Primary accent button)
- **Mute / Unmute Toggle:** `#btnHeroMute` & `#heroVolumeIcon`
- **Volume Track & Fill:** `#heroVolumeBar` (Track) & `#heroVolumeFill` (Fill)
- **Seek Track & Scrubber:** `#heroMediaScrubberWrapper`, `#heroProgressBar`, `#heroProgressFill`, `#heroMediaSeekSlider`
- **Switch to Tab Navigation:** `#btnHeroSwitchTab` with label `#btnHeroSwitchTabText`

### 3.2 Visual & Micro-Interaction States
- **Hover on Scrubber:** Shows `#scrubberTooltip` with digital timestamp `MM:SS`.
- **Active Dragging:** Adds class `.dragging` to `#heroProgressBar` without DOM tearing.
- **Volume Scrubbing:** Dynamic tooltip `.vol-floating-tooltip` displaying `0%` to `100%`.

---

## ♿ 4. Accessibility & WCAG 2.1 AA Compliance

1. **Keyboard Operability:**
   - Sliders must respond to `ArrowRight`, `ArrowLeft`, `PageUp`, `PageDown`, `Home`, `End`.
   - Buttons must trigger on `Enter` and `Space`.
2. **Screen Reader Attributes:**
   - Sliders must have `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext`.
   - Toggle buttons must reflect active state via `aria-pressed` or descriptive `aria-label`.
3. **Contrast Ratios:**
   - Progress bar colors meet 3:1 graphical contrast against track backgrounds.
   - All text displays meet 4.5:1 WCAG AA text contrast.
