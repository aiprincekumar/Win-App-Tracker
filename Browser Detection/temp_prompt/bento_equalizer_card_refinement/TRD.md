# Technical Requirements Document (TRD): Bento Graphic Equalizer Architecture & Bento Grid Geometry

> **Document Type:** Technical Requirements Document (TRD)  
> **Workspace Container:** `temp_prompt/bento_equalizer_card_refinement/`  
> **Target System:** Web Activity & Media Sentinel (`dashboard/dashboard.html` & `dashboard/dashboard.css`)  
> **Governing Lead Department:** Department 05 (Frontend Engineering) & Department 08 (QA & Testing)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Date:** 2026-11-16  

---

## 🏛️ 1. High-Level Architecture (HLD) & DOM Topology

### 1.1 Previous DOM Tree (Overcrowded 4-Span Container)
```
#tabContentMediaAnalytics (.bento-grid-container)
  ├── .metric-card (span-4) x 5
  ├── #heroMediaPlayerCard (.bento-span-8 .bento-row-span-2)
  ├── #heroAudioLabStatus (.bento-span-4 .bento-row-span-2)  <-- OVERCROWDED CONTAINER
  │     ├── .audio-lab-header (Title + 3 Badges)
  │     ├── .audio-lab-body
  │     │     ├── .audio-boost-control (Master Boost Slider + Readout + Scale)
  │     │     ├── .audio-eq-section (EQ Header + Select + Reset + 5 Vertical Sliders)  <-- CRAMPED
  │     │     ├── .audio-enhancements-section (Vocal Clarity + Night Shield + Audio-Only)
  │     │     └── .audio-lab-status-note (Status text)
  └── .data-table-card (.bento-span-12)
```

### 1.2 Refined DOM Tree (Dedicated Equalizer Studio Deck)
```
#tabContentMediaAnalytics (.bento-grid-container)
  ├── .metric-card (span-4) x 5
  ├── #heroMediaPlayerCard (.live-player-hero-card .bento-card .liquid-glass-card .bento-span-8 .bento-row-span-2)
  ├── #heroAudioLabStatus (.audio-lab-widget .glass-card .bento-card .liquid-glass-card .bento-span-4 .bento-row-span-2)
  │     ├── .audio-lab-header (Title + 3 Badges: Preset, Vocal, Night)
  │     └── .audio-lab-body
  │           ├── .audio-boost-control (Master Boost Slider + Readout + Scale Marks)
  │           ├── .audio-enhancements-section (Vocal Clarity + Night Shield + Audio-Only Toggles)
  │           └── .audio-lab-status-note (DSP Active Indicator)
  ├── #heroAudioEqCard (.audio-eq-widget .glass-card .bento-card .liquid-glass-card .bento-span-12)  <-- STANDALONE STUDIO DECK
  │     ├── .eq-card-header
  │     │     ├── .eq-title-group (Icon 🎚️ + Title #lblAudioEqTitle)
  │     │     └── .eq-actions-group (Dropdown #audioEqPresetSelect + Button #btnResetEq)
  │     ├── .eq-visualizer-strip (Optional dB Level Scale / Reference Markings: +12, +6, 0, -6, -12 dB)
  │     └── .eq-bands-grid (role="region" aria-label="Equalizer Frequency Bands")
  │           ├── Band 60Hz: #eqVal60, #eqBand60, Label "60Hz"
  │           ├── Band 250Hz: #eqVal250, #eqBand250, Label "250Hz"
  │           ├── Band 1kHz: #eqVal1000, #eqBand1000, Label "1kHz"
  │           ├── Band 4kHz: #eqVal4000, #eqBand4000, Label "4kHz"
  │           └── Band 16kHz: #eqVal16000, #eqBand16000, Label "16kHz"
  └── .data-table-card (.bento-card .liquid-glass-card .bento-span-12)
```

---

## 📐 2. Bento Grid Column Mathematics & Layout Engineering

### 2.1 12-Column Grid Budget & Row Distribution
The dashboard container `.bento-grid-container` declares:
```css
display: grid;
grid-template-columns: repeat(12, minmax(0, 1fr));
grid-auto-rows: minmax(140px, auto);
gap: 1.25rem;
```

#### Row Breakdown in Tab B:
- **Block 1 (Metrics):** 5 metric cards spanning 4 columns each (`span-4`).
- **Block 2 (Live Sentinel & Audio Lab Core):**
  - `#heroMediaPlayerCard`: `bento-span-8` + `bento-row-span-2` (Width = 8 cols, Height = ~320px).
  - `#heroAudioLabStatus`: `bento-span-4` + `bento-row-span-2` (Width = 4 cols, Height = ~320px).
  - *Sum:* $8 + 4 = 12$ columns. Flawlessly fills the 12-column row budget!
- **Block 3 (Graphic Equalizer Studio Deck):**
  - `#heroAudioEqCard`: `bento-span-12` (Width = 12 cols, Height = ~280px).
  - Spans all 12 columns directly below the Player and Audio Lab cards.
  - Grants each of the 5 frequency bands an expansive, comfortable column width (~200px–280px per band depending on display width) with ample space for vertical slider manipulation and clear label readability.
- **Block 4 (Playback History):**
  - `.data-table-card`: `bento-span-12`.

### 2.2 Responsive Breakpoint Collapse Matrix
```css
/* Tablet Breakpoint (<= 1200px) */
@media (max-width: 1200px) {
  .bento-span-8, .bento-span-4 {
    grid-column: span 12;
  }
  .bento-span-6 {
    grid-column: span 12;
  }
  #heroAudioEqCard {
    grid-column: span 12;
  }
}

/* Mobile Breakpoint (<= 768px) */
@media (max-width: 768px) {
  .bento-span-12, .bento-span-8, .bento-span-6, .bento-span-4, .bento-span-3 {
    grid-column: span 12;
  }
  .bento-grid-container {
    padding: 0.75rem;
    gap: 0.75rem;
  }
}
```

---

## 🎚️ 3. Vertical Slider Normalization & Slider Ergonomics

### 3.1 CSS Vertical Range Engine
Standard HTML range sliders (`<input type="range">`) render horizontally by default. To render robust, cross-browser vertical sliders that work across Chrome, Edge, Safari, and Firefox:
```css
.eq-vertical-slider {
  -webkit-appearance: slider-vertical; /* WebKit native vertical rendering */
  appearance: slider-vertical;
  writing-mode: vertical-lr;          /* Modern W3C vertical mode */
  direction: rtl;                     /* Ensures min (-12dB) is at bottom and max (+12dB) is at top */
  width: 32px;
  height: 180px;                      /* Generous vertical track height */
  margin: 0 auto;
  cursor: pointer;
  background: transparent;
  touch-action: none;                 /* Eliminates mobile touch scroll interference */
}

/* WebKit Track & Thumb */
.eq-vertical-slider::-webkit-slider-runnable-track {
  width: 8px;
  background: var(--glass-card-border);
  border-radius: 4px;
}

.eq-vertical-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 16px;
  background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.eq-vertical-slider:hover::-webkit-slider-thumb {
  transform: scale(1.15);
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.7);
}

.eq-vertical-slider:focus-visible {
  outline: 2px solid var(--accent-emerald);
  outline-offset: 4px;
}
```

---

## 🔒 4. Security, W3C Trusted Types & Strict CSP Governance

1. **Zero-innerHTML:** Neither `dashboard.html` nor `dashboard.js` may use `.innerHTML` or `document.write`.
2. **Zero-Inline Handlers:** No `onclick="..."`, `oninput="..."`, `onchange="..."`, or `javascript:...` attributes. All events are attached via `addEventListener` in `dashboard.js`.
3. **No External CDN Resources:** All fonts, icons (Unicode / SVG), and styles are self-contained locally in the extension bundle.
4. **UTF-8 with BOM:** Files must begin with `0xEF, 0xBB, 0xBF`.
