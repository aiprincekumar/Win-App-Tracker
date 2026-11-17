# Design System & UI Tokens
# Feature: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Department:** Dept 05 Frontend Engineering & UI/UX Design
> - **Design Paradigm:** iOS 26 Liquid Glass & Audiophile Studio Deck

---

## 💎 1. Visual Hierarchy & Proportional Spacing

The Real-Time Spectrum Visualizer bento card follows the **60-30-10 Information Hierarchy Rule**:
- **60% Primary Focus:** The active 60 FPS audio visualizer canvas displaying real-time frequency FFT bars or waveforms.
- **30% Secondary Controls & Telemetry:** Top controls bar (mode selector, action buttons) and bottom stereo VU meters.
- **10% Tertiary Metadata:** Header iconography, card title badge, and clipping indicator.

---

## 🎨 2. Specular Design Tokens & Materials

### 2.1 Chassis Materials
```css
:root {
  /* Obsidian Matte Canvas Background */
  --viz-canvas-bg: rgba(10, 15, 28, 0.85);
  --viz-canvas-border: rgba(99, 102, 241, 0.2);
  --viz-canvas-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 16px rgba(99, 102, 241, 0.08);

  /* Light Theme Canvas Tokens */
  --viz-canvas-bg-light: #0f172a;
  --viz-canvas-border-light: rgba(99, 102, 241, 0.25);
  --viz-canvas-shadow-light: inset 0 2px 8px rgba(0, 0, 0, 0.5);

  /* Visualizer Controls Bar Capsule */
  --viz-controls-bg: rgba(15, 23, 42, 0.65);
  --viz-controls-border: rgba(255, 255, 255, 0.1);
  --viz-controls-blur: blur(12px) saturate(160%);

  /* VU Meters Track & Gradients */
  --vu-track-bg: rgba(15, 23, 42, 0.8);
  --vu-track-border: rgba(255, 255, 255, 0.06);
  --vu-gradient-safe: linear-gradient(90deg, #10b981 0%, #06b6d4 60%, #eab308 85%, #ef4444 100%);
}
```

---

## 📐 3. Proportional Layout Blueprint

```
┌─────────────────────────────────────────────────────────────┐
│ 🎛️ Real-Time Spectrum Visualizer                         │ <- Header: ~42px
├─────────────────────────────────────────────────────────────┤
│ [ Effect: 32-Band Spectrum ▾ ]            [ 📺 ] [ 🗖 ] [ ⛶ ]│ <- Controls Bar: ~36px
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  ||| | | |||| | |||||| ||||||||||||||||||||| | ||| ||   │ │ <- Canvas Chassis
│ │  ||| | | |||| | |||||| ||||||||||||||||||||| | ||| ||   │ │    Expanded: ~200px-220px
│ │  |||||||||||||||||||||||||||||||||||||||||||||||||||    │ │    (flex: 1 1 auto)
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  L [=======================               ] -6dB            │ <- VU Meters: ~46px
│  R [====================                  ] -8dB    [0dB OK]│    (flex-shrink: 0)
└─────────────────────────────────────────────────────────────┘
  Total Outer Bounds: Exactly 380px min-height (100% Preserved)
```
