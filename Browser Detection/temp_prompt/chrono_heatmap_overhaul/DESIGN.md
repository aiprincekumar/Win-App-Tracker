# Design System & UI Tokens: Chrono-Activity Heatmap (24h x 7d) Overhaul

> **Document Type:** Design System Specification & Token Catalog  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Design Theme:** Cyber-Dark Glassmorphism with High-Contrast Light Mode Support  
> **WCAG Compliance:** WCAG 2.1 AA Contrast Ratios (>= 4.5:1 text, >= 3:1 graphical controls)  

---

## 🎨 1. Color Palette & Token Architecture

The Chrono-Activity Heatmap operates on a dual-palette architecture. Focus Mode uses the Emerald/Cyan spectrum to denote active knowledge work, while Media Mode uses the Violet/Fuchsia spectrum to denote streaming and background audio/video watch time.

### 1.1 Focus Mode Color Scale (Emerald Spectrum)

| Tier | Duration Window | Dark Mode Token / Hex | Light Mode Token / Hex | Visual Meaning |
| :---: | :---: | :--- | :--- | :--- |
| **Tier 0** | 0s (Inactive) | `rgba(255, 255, 255, 0.04)` | `rgba(0, 0, 0, 0.05)` | Idle / Sleep / Inactive |
| **Tier 1** | 1s – 300s (<= 5m) | `rgba(16, 185, 129, 0.25)` | `#a7f3d0` | Light Browsing / Check-in |
| **Tier 2** | 301s – 900s (<= 15m) | `rgba(16, 185, 129, 0.50)` | `#34d399` | Moderate Focus Work |
| **Tier 3** | 901s – 1800s (<= 30m) | `rgba(16, 185, 129, 0.75)` | `#10b981` | Deep Focused Session |
| **Tier 4** | > 1800s (> 30m) | `#10b981` (Glow: `0 0 10px #10b981`) | `#059669` | Intensive Peak Hyperfocus |

### 1.2 Media Mode Color Scale (Violet/Fuchsia Spectrum)

| Tier | Duration Window | Dark Mode Token / Hex | Light Mode Token / Hex | Visual Meaning |
| :---: | :---: | :--- | :--- | :--- |
| **Tier 0** | 0s (Inactive) | `rgba(255, 255, 255, 0.04)` | `rgba(0, 0, 0, 0.05)` | No Media Playing |
| **Tier 1** | 1s – 300s (<= 5m) | `rgba(168, 85, 247, 0.25)` | `#e9d5ff` | Short Clip / Quick Audio |
| **Tier 2** | 301s – 900s (<= 15m) | `rgba(168, 85, 247, 0.50)` | `#c084fc` | Podcast Segment / Music Track |
| **Tier 3** | 901s – 1800s (<= 30m) | `rgba(168, 85, 247, 0.75)` | `#a855f7` | Extended Video / Album |
| **Tier 4** | > 1800s (> 30m) | `#ec4899` (Glow: `0 0 10px #ec4899`) | `#db2777` | Marathon Streaming / Movie |

---

## 📐 2. Fluid CSS Grid System (Zero-Scrollbar Contract)

### 2.1 CSS Grid Specification
```css
/* Container: 100% width, zero horizontal overflow */
.chrono-heatmap-wrapper {
  width: 100%;
  overflow-x: hidden !important;
  padding: 0.5rem 0;
  box-sizing: border-box;
}

/* 25 Columns: 1 Day Label column + 24 fluid hour columns */
.chrono-heatmap-grid {
  display: grid !important;
  grid-template-columns: minmax(36px, 48px) repeat(24, minmax(0, 1fr)) !important;
  gap: 3px !important;
  align-items: center;
  width: 100% !important;
  box-sizing: border-box;
}

/* Heatmap Cell: Fluid width, clamp height */
.heatmap-cell {
  width: 100% !important;
  height: clamp(14px, 1.8vw, 22px) !important;
  border-radius: 3px !important;
  cursor: pointer;
  transition: transform 120ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 120ms ease;
  position: relative;
}

.heatmap-cell:hover,
.heatmap-cell:focus-visible {
  transform: scale(1.22) !important;
  z-index: 10;
  outline: none;
}

/* Focus Mode Glow */
.chrono-heatmap-grid[data-active-mode="focus"] .heatmap-cell:hover,
.chrono-heatmap-grid:not([data-active-mode="media"]) .heatmap-cell:hover {
  box-shadow: 0 0 10px var(--accent-emerald, #10b981) !important;
}

/* Media Mode Glow */
.chrono-heatmap-grid[data-active-mode="media"] .heatmap-cell:hover {
  box-shadow: 0 0 10px var(--accent-magenta, #ec4899) !important;
}
```

---

## 🔤 3. Typography & Micro-Layout

- **Hour Header Row (00–23):**
  - Font: `JetBrains Mono, SF Mono, Consolas, monospace`
  - Font Size: `clamp(9px, 0.75vw, 11px)`
  - Text Alignment: `center`
  - Color: `var(--text-tertiary, #94a3b8)`
- **Day Row Labels (Mon–Sun):**
  - Font: `Inter, -apple-system, system-ui, sans-serif`
  - Font Size: `clamp(10px, 0.8vw, 12px)`
  - Font Weight: `600`
  - Color: `var(--text-secondary, #cbd5e1)`
- **Week-over-Week (WoW) Badge:**
  - Positive trend: `#10b981` (green) with `📈` icon.
  - Negative trend: `#f43f5e` (rose) with `📉` icon.
  - Neutral trend: `#94a3b8` (slate).

---

## 🪟 4. Glassmorphism Tooltip Architecture

```css
.heatmap-cell-tooltip {
  position: fixed;
  pointer-events: none;
  padding: 8px 12px;
  background: var(--glass-surface-hover, rgba(15, 23, 42, 0.95));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.12));
  border-radius: 8px;
  font-size: 0.75rem;
  line-height: 1.4;
  color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  transition: opacity 80ms ease, transform 80ms ease;
}
```
