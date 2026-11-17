<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Design System & Visual Tokens (DESIGN.md)

> **Specification & Governance:**
> - **Task Identifier:** `TASK-VIZ-DROPDOWN-EFFECTS-002`
> - **Lead Department:** Department 06 (Design & UI/UX) & Department 05 (Frontend Engineering)
> - **Design System:** Liquid Glass Dark/Light Substrate Architecture
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 🎨 1. Aesthetic Philosophy & Materiality

The Media Sentinel Dashboard is crafted in the **Liquid Glass** aesthetic: semi-translucent frosted glass substrates, subtle chromatic borders, and energetic neon accents that elevate technical audio metrics into a cohesive telemetry cockpit.

The new visualizer dropdown selector must feel like a precision studio hardware selector knob—tactile, glowing on focus, and seamlessly integrated into the Bento Card header without shifting layout geometry or introducing visual noise.

---

## 🎛️ 2. UI Component Tokens: Visualizer Effect Dropdown

### 2.1 CSS Variables & Substrate Tokens

```css
:root {
  /* Dark Theme Dropdown Tokens */
  --viz-select-bg: rgba(15, 23, 42, 0.75);
  --viz-select-border: rgba(255, 255, 255, 0.12);
  --viz-select-text: #e2e8f0;
  --viz-select-hover-bg: rgba(30, 41, 59, 0.85);
  --viz-select-hover-border: rgba(56, 189, 248, 0.4);
  --viz-select-focus-ring: 0 0 0 2px rgba(56, 189, 248, 0.4), 0 0 16px rgba(6, 182, 212, 0.25);
  --viz-select-option-bg: #0f172a;
  --viz-select-option-text: #f8fafc;
  --viz-select-label-text: #94a3b8;
}

body.theme-light {
  /* Light Theme Dropdown Tokens */
  --viz-select-bg: rgba(255, 255, 255, 0.85);
  --viz-select-border: rgba(148, 163, 184, 0.35);
  --viz-select-text: #1e293b;
  --viz-select-hover-bg: #ffffff;
  --viz-select-hover-border: rgba(14, 165, 233, 0.6);
  --viz-select-focus-ring: 0 0 0 2px rgba(14, 165, 233, 0.35), 0 0 12px rgba(14, 165, 233, 0.15);
  --viz-select-option-bg: #ffffff;
  --viz-select-option-text: #0f172a;
  --viz-select-label-text: #64748b;
}
```

### 2.2 Component Geometry & Layout Specs
- **Height:** `28px` (matches sibling controls and legacy buttons).
- **Border Radius:** `9999px` (capsule geometry) or `8px` (precision studio pill).
- **Padding:** `2px 28px 2px 10px` (accommodates right-aligned chevron icon).
- **Font:** `font-family: inherit; font-size: 11px; font-weight: 600; letter-spacing: 0.02em;`.
- **Custom Chevron:** Encoded SVG background arrow:
  `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");`
  `background-repeat: no-repeat;`
  `background-position: right 8px center;`
  `appearance: none; -webkit-appearance: none;`

---

## 🌈 3. Color Palettes for the Six Visualizer Effects

| Effect Key | Mode Name | Primary Accent | Secondary Accent | Substrate / Glow | Visual Theme |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `bars` | 32-Band Spectrum | `#10b981` (Emerald) | `#06b6d4` (Cyan) | `#8b5cf6` (Violet Peak) | Classic Studio Hardware |
| `wave` | Oscilloscope Wave | `#06b6d4` (Electric Cyan) | `#10b981` (Emerald Glow) | `#38bdf8` (High Volt) | Precision Cathode Ray Tube |
| `radial` | Radial Frequency Burst | `#38bdf8` (Solar Sky) | `#818cf8` (Indigo Pulse) | `#06b6d4` (Core Flame) | Sci-Fi Reactor Core |
| `matrix_dots` | Matrix Digital Dots | `#10b981` (Cyber Matrix) | `#34d399` (Mint Glow) | `rgba(255,255,255,0.06)` | Retro Cyber Voxel Grid |
| `flame` | Neon Flame Peaks | `#dc2626` (Crimson Fire) | `#f59e0b` (Amber Flame) | `#fbbf24` (Gold Tip) | Warm Dynamic Fireplace |
| `stereo_mirror` | Stereo Mirror Butterfly | `#a855f7` (Neon Purple) | `#06b6d4` (Cyan Mirror) | `#ffffff` (Center Beam) | Hi-Fi Bilateral Stereo Deck |

---

## ♿ 4. Accessibility & Contrast (WCAG 2.1 AA)

1. **Contrast Verification:**
   - Dropdown text `#e2e8f0` on `--viz-select-bg` (`rgba(15, 23, 42, 0.75)`) exceeds **7.2:1** contrast ratio (Grade AAA).
   - Light mode text `#1e293b` on `#ffffff` exceeds **12.5:1** contrast ratio.
2. **Focus Visibility:**
   - On `:focus-visible`, an electric cyan focus ring (`--viz-select-focus-ring`) is displayed with minimum 2px offset for keyboard navigation clarity.
3. **Screen Reader Association:**
   - The `<select>` element has explicit `aria-label="Audio Visualizer Effect"` and an associated `<label for="selectVizEffect">`.
4. **Reduced Motion:**
   - In accordance with `@media (prefers-reduced-motion: reduce)`, visualizer transitions and hover scaling disable transforms (`transform: none !important;`).
