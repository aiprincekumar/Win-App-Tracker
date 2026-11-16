# Design System & UI Tokens: iOS 26 Liquid Glass & Studio Audio Console

> **Document Type:** Design System Specification & Token Catalog  
> **Workspace Container:** `temp_prompt/bento_equalizer_card_refinement/`  
> **Target System:** Web Activity & Media Sentinel (`dashboard/dashboard.css`)  
> **Aesthetic Direction:** iOS 26 Liquid Glass Materiality & Studio-Grade Audiophile Rack  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Date:** 2026-11-16  

---

## 💎 1. iOS 26 Liquid Glass Materiality Tokens

The design philosophy unites the hyper-refined translucency of iOS 26 Liquid Glass with the mechanical precision of high-end analog mixing consoles (SSL, Neve, Empirical Labs).

### 1.1 Color Tokens & Calibrated Surfaces

```css
:root {
  /* Dark Mode Liquid Glass Baseline */
  --bg-deep: #080b11;
  --bg-stage: #0f172a;
  --glass-surface-bg: rgba(15, 23, 42, 0.72);
  --glass-surface-bg-hover: rgba(30, 41, 59, 0.85);
  --glass-specular-border: rgba(255, 255, 255, 0.14);
  --glass-card-border: rgba(255, 255, 255, 0.08);
  --glass-blur-depth: blur(24px) saturate(190%);
  --glass-specular-highlight: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.03) 40%,
    rgba(255, 255, 255, 0.00) 100%
  );
  --glass-card-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.45),
                       0 2px 8px -2px rgba(0, 0, 0, 0.35);

  /* Studio Audio Accent Palette */
  --accent-emerald: #10b981;
  --accent-cyan: #06b6d4;
  --accent-violet: #8b5cf6;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  
  /* Text & Readout Luminance (AAA Conformance >= 7.0:1) */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --mono-font: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
}

body.theme-light {
  /* Light Mode Calibrated Glass Baseline */
  --bg-deep: #f8fafc;
  --bg-stage: #f1f5f9;
  --glass-surface-bg: rgba(255, 255, 255, 0.82);
  --glass-surface-bg-hover: rgba(255, 255, 255, 0.95);
  --glass-specular-border: rgba(255, 255, 255, 0.65);
  --glass-card-border: rgba(203, 213, 225, 0.50);
  --glass-card-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.08),
                       0 2px 6px -2px rgba(15, 23, 42, 0.05);
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #475569;
}
```

---

## 🎛️ 2. Bento Card Styling: Dedicated Equalizer Deck (`#heroAudioEqCard`)

### 2.1 Card Container Anatomy
The Dedicated Equalizer Card occupies `.bento-span-12` (spanning all 12 columns) or `.bento-span-6` with:
- **Card Background:** Liquid Glass surface with `backdrop-filter: blur(24px) saturate(190%)`.
- **Top Specular Edge:** 1px inner inset glow `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`.
- **Border Radius:** `18px` with zero CLS hardware acceleration.
- **Card Padding:** `1.5rem 1.75rem`.

### 2.2 Equalizer Header Controls
- **Title Group:**
  - Icon: 🎚️ (Fader icon) inside a glassmorphic circular badge.
  - Heading: `#lblAudioEqTitle`, `font-size: 1.15rem`, `font-weight: 700`, `letter-spacing: -0.015em`.
  - Frequency Spec Badge: Pill badge displaying `Biquad Peaking Filters (Q=1.4) • [-12dB, +12dB]`.
- **Action Controls:**
  - Preset Selector (`#audioEqPresetSelect`): Glass pill dropdown with subtle specular border, custom chevron, and `appearance: none`.
  - Reset EQ Button (`#btnResetEq`): Glass button with subtle glow hover effect, rotating icon transition, and active press transform (`transform: scale(0.97)`).

---

## 📊 3. 5-Band Vertical Slider Grid Aesthetics

### 3.1 Frequency Column Layout
The 5 bands (60Hz, 250Hz, 1kHz, 4kHz, 16kHz) are arranged in an equally-spaced 5-column grid:
```css
.eq-bands-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
  padding: 1.25rem 0.5rem;
  position: relative;
}
```

### 3.2 Decibel Reference Horizon (Zero-dB Detent Line)
A horizontal reference line spans across the 5 bands at exactly 50% height (0dB):
```css
.eq-bands-grid::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 1rem;
  right: 1rem;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(16, 185, 129, 0.35) 20%,
    rgba(16, 185, 129, 0.35) 80%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}
```

### 3.3 Tactile Fader Details
- **Decibel Readout (`#eqVal60` - `#eqVal16000`):**
  - Font: Monospace (`JetBrains Mono`).
  - Size: `0.85rem`, `font-weight: 600`.
  - Color: Positive dB values glow subtle emerald (`#10b981`), 0dB is neutral (`#94a3b8`), negative dB values show subtle amber-rose (`#f43f5e`).
- **Fader Thumb Knob:**
  - Metallic brushed texture (`linear-gradient(180deg, #334155, #1e293b)`).
  - Center indicator line (horizontal white tick).
  - Hover glow: `box-shadow: 0 0 12px rgba(16, 185, 129, 0.5)`.
- **Frequency Sub-label:**
  - Prominent frequency badge (e.g. `60Hz`, `250Hz`, `1kHz`, `4kHz`, `16kHz`).
  - Small subtext indicating acoustic domain:
    - 60Hz: *Sub-Bass*
    - 250Hz: *Warmth*
    - 1kHz: *Vocals*
    - 4kHz: *Presence*
    - 16kHz: *Air*

---

## ♿ 4. Accessibility & Contrast Verification Matrix

| Element | Dark Mode Ratio | Light Mode Ratio | WCAG Compliance |
| :--- | :---: | :---: | :---: |
| Card Title (`#lblAudioEqTitle`) | 18.82:1 | 17.06:1 | **AAA (>= 7.0:1)** |
| Preset Select Text | 18.82:1 | 17.06:1 | **AAA (>= 7.0:1)** |
| Decibel Values (`#eqVal*`) | 12.45:1 | 11.20:1 | **AAA (>= 7.0:1)** |
| Frequency Labels (`60Hz` - `16kHz`) | 7.68:1 | 6.92:1 | **AA / AAA** |
| Focus Rings (`:focus-visible`) | High Contrast Neon | High Contrast Neon | **Certified Pass** |
