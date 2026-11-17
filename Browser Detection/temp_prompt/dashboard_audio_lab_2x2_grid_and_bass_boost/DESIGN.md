# Design System & UI Specifications: Audio Lab 2x2 Grid & Enhancement Cards

> **Task ID:** `TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001`  
> **Document:** `temp_prompt/dashboard_audio_lab_2x2_grid_and_bass_boost/DESIGN.md`  
> **Lead Department:** Dept 04 (UI/UX Design System)  
> **Standard:** Liquid Glass Material & Bento Card Architecture  

---

## 🎨 1. Color Tokens & Visual Hierarchy

| Token Name | Dark Theme Value | Light Theme Value | Usage |
| :--- | :--- | :--- | :--- |
| `--glass-card-bg` | `rgba(255, 255, 255, 0.03)` | `rgba(0, 0, 0, 0.02)` | Unchecked enhancement card surface |
| `--glass-card-hover` | `rgba(255, 255, 255, 0.06)` | `rgba(0, 0, 0, 0.04)` | Enhancement card hover surface |
| `--glass-card-active-bg` | `rgba(16, 185, 129, 0.04)` | `rgba(16, 185, 129, 0.06)` | Active checked card surface (emerald tint) |
| `--glass-card-border` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | Default card border |
| `--glass-card-active-border`| `rgba(16, 185, 129, 0.40)`| `rgba(16, 185, 129, 0.45)` | Active checked card border (emerald) |
| `--text-primary` | `#F1F5F9` | `#0F172A` | Card titles (`.enhancement-title`) |
| `--text-secondary` | `#94A3B8` | `#64748B` | Card descriptions (`.enhancement-desc`) |
| `--accent-emerald` | `#10B981` | `#059669` | Active switch track & glow |

---

## 📐 2. Spacing Grids & Typography Scale

### 2.1 Spacing Tokens
- **Grid Gap:** `12px` (desktop), `10px` (compact)
- **Card Padding:** `12px 14px` (top/bottom: 12px, left/right: 14px)
- **Header Margin Bottom:** `4px`
- **Border Radius:** `10px` (`--radius-md`)

### 2.2 Typography Scale
- **Card Title (`.enhancement-title`):**
  - Font Size: `13px` (`0.8125rem`)
  - Font Weight: `600` (Semi-bold)
  - Line Height: `1.3`
  - Text Truncation: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- **Card Description (`.enhancement-desc`):**
  - Font Size: `11px` (`0.6875rem`)
  - Font Weight: `400` (Regular)
  - Line Height: `1.35`
  - Text Wrapping: `word-break: break-word;`

---

## 🎛️ 3. Card Architecture & 2x2 Layout Specs

```
+-------------------------------------------------------+
| Audio Lab & DSP Enhancements      [Vocal: OFF] [Night: OFF] |
+-------------------------------------------------------+
| Master Volume Boost: [============●========] 100%     |
+-------------------------------------------------------+
|  +---------------------------+ +---------------------------+  |
|  | 🗣️ Vocal Clarity    [ O ] | | 🌙 Night Shield     [ O ] |  |
|  | Highlight dialogue...    | | Compress dynamic...      |  |
|  +---------------------------+ +---------------------------+  |
|  +---------------------------+ +---------------------------+  |
|  | 🔊 Sub-Bass Boost   [ O ] | | 📻 Audio-Only Mode  [ O ] |  |
|  | Deep low-frequency...    | | Save battery & CPU...    |  |
|  +---------------------------+ +---------------------------+  |
+-------------------------------------------------------+
```

### 3.1 Card Components Breakdown
1. **Top-Left (Col 1, Row 1):** Vocal Clarity (`#toggleVocalClarity`)
2. **Top-Right (Col 2, Row 1):** Night Shield (`#toggleNightShield`)
3. **Bottom-Left (Col 1, Row 2):** Sub-Bass Boost (`#toggleBassBoost`)
4. **Bottom-Right (Col 2, Row 2):** Audio-Only Mode (`#toggleAudioOnlyMode`)

---

## ♿ 4. Accessibility (a11y) & WCAG 2.1 AA Compliance

- **Aria Roles & Labels:**
  - `#toggleBassBoost` must include `role="switch"` and `aria-label="Sub-Bass Boost"`.
  - Checkbox input wrapped inside `<label class="switch-toggle" for="toggleBassBoost">`.
- **Contrast Ratios:**
  - Card titles in dark mode: `#F1F5F9` on dark background ($12.5:1$ ratio, exceeds AAA).
  - Card descriptions: `#94A3B8` on dark background ($6.2:1$ ratio, exceeds AA).
  - Focus indicator: `2px solid var(--accent-emerald)` on `:focus-visible`.
