# Design Specifications & UI Tokens: Chrono-Activity Heatmap (24h x 7d)

> **Document Type:** Design System Specification & Token Contract  
> **Workspace Container:** `temp_prompt/chrono_heatmap_hourly_tracking/`  
> **Feature Identifier:** `FEAT-CHRONO-HEATMAP-DESIGN`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Heatmap Intensity Tiers & Color Tokens

The Chrono-Activity Heatmap visualizes hourly intensity using 5 discrete tiers (0 through 4), corresponding to accumulated browsing time during that hour.

### 1.1 Cyber-Dark Design Theme (Default)
| Tier | Description | Active Time Window | CSS Variable / Token | Hex Color | Glow / Accent |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **0** | Inactive | 0 seconds | `--heatmap-tier-0` | `#111827` (Dark Slate) | None |
| **1** | Low Activity | 1s – 900s (1–15m) | `--heatmap-tier-1` | `#064e3b` (Deep Emerald) | Border: `rgba(16, 185, 129, 0.2)` |
| **2** | Moderate Activity | 901s – 1800s (15–30m) | `--heatmap-tier-2` | `#047857` (Emerald Medium) | Border: `rgba(16, 185, 129, 0.4)` |
| **3** | High Activity | 1801s – 2700s (30–45m) | `--heatmap-tier-3` | `#059669` (Vibrant Emerald) | Box-Shadow: `0 0 6px rgba(16, 185, 129, 0.3)` |
| **4** | Peak Focus / Intensity | > 2700s (45m+) | `--heatmap-tier-4` | `#10b981` (Neon Mint) | Box-Shadow: `0 0 10px rgba(16, 185, 129, 0.6)` |

### 1.2 Media Indicator Accent
When `mediaSeconds > 0` exists in an hour bucket, a subtle cyan/indigo accent or pulse indicates active playback:
- **Media Accent Token:** `rgba(56, 189, 248, 0.8)` (`#38bdf8` Cyber Sky)
- **Visual Cue:** Small top-right indicator dot (size 3px) or blended background gradient.

---

## 🔲 2. Grid Layout & Geometry

- **Grid Matrix:** 7 rows (Monday to Sunday) x 24 columns (00:00 to 23:00).
- **Cell Dimensions:** 18px x 18px (Min 14px on compact viewports).
- **Cell Gap:** 3px grid gap.
- **Border Radius:** 3px (`rounded-sm`).
- **Interactive State:** Hover scale `transform: scale(1.15)` with `transition: transform 0.15s ease-out`.

---

## 💬 3. Tooltip Architecture & Micro-Copy

When hovering over an active cell:
- **Container Class:** `.chrono-heatmap-tooltip`
- **Background:** `rgba(15, 23, 42, 0.95)` with `backdrop-filter: blur(8px)`.
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`.
- **Content Fields:**
  1. **Time Window:** `e.g., "Monday, 14:00 - 15:00"`
  2. **Active Foreground:** `e.g., "Active: 42m 10s"`
  3. **Background Media:** `e.g., "Media: 15m 00s"` (Only if `mediaSeconds > 0`)
  4. **Top Website:** `e.g., "Top: github.com"` (Highlight color `#38bdf8`)
- **Safety Standard:** Zero `innerHTML` assignments. Render using `document.createElement`, `textContent`, and DOM node appending.

---

## ♿ 4. Accessibility (WCAG 2.1 AA Compliance)

- **Contrast Ratio:** Text on tier 0-4 backgrounds exceeds 4.5:1.
- **Keyboard Navigation:** Cells are focusable (`tabindex="0"` or roving tabindex) with visible focus ring (`outline: 2px solid #38bdf8`).
- **Aria Attributes:** Each cell provides `aria-label` describing day, hour, and active minutes:
  `aria-label="Monday 14:00 to 15:00: 42 minutes active, top domain github.com"`
