# Real-Time Spectrum Visualizer UI/UX Redesign: Design Specification (DESIGN.md)

> **Document Type:** Design System, Token Specification & Visual Architecture  
> **Workspace Container:** `temp_prompt/visualizer_uiux_separation/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Date:** 2026-11-17  

---

## 🎨 1. Design Philosophy & Materiality

The Real-Time Spectrum Visualizer and Studio Audio Deck leverage the **iOS 26 Liquid Glass** design aesthetic:
- **Depth & Translucency:** Specular highlight borders (`1px solid rgba(255, 255, 255, 0.08)` in dark mode), multi-layered backdrop blur (`backdrop-filter: blur(24px) saturate(190%)`), and subtle radial gradient refractions.
- **Audiophile Studio Tone:** Deep obsidian matte chassis (`rgba(15, 23, 42, 0.65)`), cyan-to-violet phosphor spectrum accents, and high-precision LED VU meters reminiscent of high-end studio rack equipment.
- **Tactile Micro-interactions:** Fluid 180ms transitions, glowing active states, and unmistakable clipping indicators.

---

## 💎 2. Design Tokens & Color Palette

### 2.1 Dark Theme Tokens (Primary)
```css
:root {
  /* Visualizer Studio Canvas */
  --viz-canvas-bg: rgba(10, 15, 28, 0.75);
  --viz-canvas-border: rgba(99, 102, 241, 0.2);
  --viz-glow-cyan: rgba(6, 182, 212, 0.45);
  --viz-glow-indigo: rgba(99, 102, 241, 0.45);

  /* Mode Switch Buttons (FFT / Waveform) */
  --viz-btn-bg: rgba(30, 41, 59, 0.6);
  --viz-btn-border: rgba(255, 255, 255, 0.1);
  --viz-btn-text: #94a3b8;
  --viz-btn-active-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.2));
  --viz-btn-active-border: rgba(99, 102, 241, 0.5);
  --viz-btn-active-text: #38bdf8;
  --viz-btn-active-shadow: 0 0 12px rgba(56, 189, 248, 0.25);

  /* VU Meters (Stereo L/R) */
  --vu-track-bg: rgba(15, 23, 42, 0.8);
  --vu-track-border: rgba(255, 255, 255, 0.06);
  --vu-gradient-safe: linear-gradient(90deg, #10b981 0%, #06b6d4 60%, #eab308 85%, #ef4444 100%);
  --vu-db-text: #64748b;
  --vu-db-active-text: #cbd5e1;

  /* 0dB Clipping Indicator Badge */
  --clip-badge-ok-bg: rgba(16, 185, 129, 0.12);
  --clip-badge-ok-border: rgba(16, 185, 129, 0.3);
  --clip-badge-ok-text: #34d399;
  --clip-badge-clip-bg: rgba(239, 68, 68, 0.2);
  --clip-badge-clip-border: rgba(239, 68, 68, 0.6);
  --clip-badge-clip-text: #f87171;
  --clip-badge-clip-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}
```

### 2.2 Light Theme Overrides
```css
body.theme-light {
  --viz-canvas-bg: rgba(248, 250, 252, 0.85);
  --viz-canvas-border: rgba(99, 102, 241, 0.25);
  --viz-btn-bg: rgba(241, 245, 249, 0.8);
  --viz-btn-border: rgba(203, 213, 225, 0.6);
  --viz-btn-text: #64748b;
  --viz-btn-active-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.12));
  --viz-btn-active-border: rgba(99, 102, 241, 0.4);
  --viz-btn-active-text: #2563eb;
  --vu-track-bg: rgba(226, 232, 240, 0.7);
  --vu-track-border: rgba(203, 213, 225, 0.8);
  --vu-db-text: #475569;
}
```

---

## 🎛️ 3. Component Specs & States

### 3.1 FFT / Waveform Mode Buttons (`#btnVizModeBars`, `#btnVizModeWave`)
- **Dimensions:** Height: `28px`, Padding: `0 12px`, Border Radius: `6px`.
- **Typography:** Inter / SF Pro Display, `11px`, font-weight `600`, letter-spacing `0.02em`.
- **States:**
  - *Default:* Glass border, muted slate text.
  - *Hover:* Background elevates to `rgba(255, 255, 255, 0.05)`, border brightens.
  - *Active:* Glowing gradient fill, bright cyan text, cyan glow shadow (`0 0 10px rgba(56, 189, 248, 0.25)`).
  - *Focus-Visible:* `outline: 2px solid var(--accent-primary, #6366f1); outline-offset: 2px;`.

### 3.2 Visualizer Canvas Container (`.visualizer-canvas-container`)
- **Dimensions:** Width: `100%`, Height: `130px`, Border Radius: `8px`.
- **Backdrop:** Dark studio glass with `1px solid var(--viz-canvas-border)`.
- **Internal Canvas Resolution:** `width="600" height="120"`.
- **Responsive Scaling:** Responsive CSS width `100%` and `object-fit: contain` / block rendering.

### 3.3 Stereo VU Meters (`.vu-meters-container`)
- **Layout:** Grid with two meter strips (L and R), decibel readouts, and the 0dB badge.
- **Track Height:** `6px`, Border Radius: `3px`, Overflow `hidden`.
- **Dynamic Level Bar:** Smooth linear transition on `width` (60ms), 4-stop gradient (`#10b981 -> #06b6d4 -> #eab308 -> #ef4444`).
- **dB Readout Typography:** Monospace `Roboto Mono` / `Courier`, `10px`, font-weight `600`.

### 3.4 0dB Headroom Indicator Badge (`#vuClipIndicator`)
- **Pill Badge:** Height: `20px`, Padding: `2px 8px`, Border Radius: `10px`, Font Size: `10px`, Bold.
- **Normal State (`0dB OK`):** Soft green border & subtle green tint.
- **Clipping State (`.clipping`):** Vivid red background, red specular outline, pulsing red glow box-shadow.

---

## 📏 4. Bento Grid Spatial Placement

```
+------------------------------------------------------------------------------------+
| #heroMediaPlayerCard (bento-span-8 bento-row-span-2)                               |
| Min-Height: 380px                                                                  |
+------------------------------------------------------------------------------------+
| Dedicated Visualizer Card (bento-span-4 bento-row-span-2)                          |
| - Header: 36px                                                                     |
| - Mode Switch Bar: 32px                                                            |
| - Canvas Container: 130px                                                          |
| - Stereo VU Meters & 0dB Badge: 36px                                               |
| - Padding & Margins: 24px                                                          |
| Total Balanced Height: ~258px - 380px (stretches to match hero player height)      |
+------------------------------------------------------------------------------------+
```
