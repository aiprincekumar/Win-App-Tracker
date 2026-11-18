# Design System & Token Specifications: 10x2 KPI Bento Grid

> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Initiative:** Web Activity & Media Sentinel 10x2 Dashboard KPI Design  
> **Owner:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Aesthetic Direction & Bento Philosophy

The Web Activity & Media Sentinel dashboard uses an ultra-modern **Cyber-Dark Liquid-Glass Bento Grid** aesthetic.
The 10x2 KPI expansion introduces rigorous structural symmetry:
- **Geometry:** 2 rows of 5 cards (5 columns x 2 rows) on wide displays.
- **Card Ratio:** Unified card height (`min-height: 140px`) preventing jagged baseline misalignments.
- **Glassmorphism:** Multi-layered translucent background, high-refraction frosted backdrop filter (`backdrop-filter: blur(16px)`), subtle neon glow borders, and soft directional shadows.

---

## 🌈 2. Color Palette & Semantic Accents

Each of the 10 cards in both views is assigned a semantic color accent for its icon box, micro-glows, and status badges:

| Accent Name | CSS Token Variable | Hex Value | Primary Association |
| :--- | :--- | :--- | :--- |
| **Cyan** | `--accent-cyan` | `#06b6d4` | Live time, active clock, foreground duration |
| **Emerald** | `--accent-emerald` | `#10b981` | Averages, wellness, productivity, balanced volume |
| **Violet** | `--accent-violet` | `#8b5cf6` | Lifetime totals, historical archives, low volumes |
| **Amber** | `--accent-amber` | `#f59e0b` | Top websites, peak volumes, warning thresholds |
| **Indigo** | `--accent-indigo` | `#6366f1` | Deep focus, meditation, calm acoustic spaces |
| **Teal** | `--accent-teal` | `#14b8a6` | Active domain breadth, network exploration |
| **Rose** | `--accent-rose` | `#f43f5e` | Distraction time, video watch time, muted states |
| **Blue** | `--accent-blue` | `#3b82f6` | Peak clock hours, media session counts |
| **Fuchsia** | `--accent-fuchsia` | `#d946ef` | Longest uninterrupted sessions, endurance records |

---

## 🔠 3. Typography & Micro-Hierarchies

Within each `.metric-card.liquid-glass-card`:

1. **Card Header (`.metric-header`):**
   - **Label (`.metric-label`):** `font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;`
   - **Icon Box (`.metric-icon-box`):** `width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem;`
2. **Metric Value (`.metric-value-container`):**
   - **Big Number (`.metric-big-num`):** `font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 1.65rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;`
3. **Card Footer (`.metric-footer`):**
   - **Subtext (`.metric-subtext`):** `font-size: 0.75rem; color: var(--text-dim); line-height: 1.2; text-truncate;`

---

## 🌓 4. Dual-Theme Glass Tokens

### Dark Mode (Cyber-Dark Default)
```css
--bg-glass-card: rgba(15, 23, 42, 0.65);
--border-glass-card: rgba(255, 255, 255, 0.08);
--border-glass-hover: rgba(56, 189, 248, 0.35);
--glow-card-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
--glow-card-hover: 0 12px 40px rgba(14, 165, 233, 0.15);
--text-primary: #f8fafc;
--text-muted: #94a3b8;
--text-dim: #64748b;
```

### Light Mode (`body.theme-light`)
```css
--bg-glass-card: rgba(255, 255, 255, 0.85);
--border-glass-card: rgba(203, 213, 225, 0.7);
--border-glass-hover: rgba(14, 165, 233, 0.45);
--glow-card-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
--glow-card-hover: 0 8px 24px rgba(14, 165, 233, 0.12);
--text-primary: #0f172a;
--text-muted: #475569;
--text-dim: #64748b;
```

---

## 📱 5. Responsive Grid Geometry (`.kpi-grid-5x2`)

```
[ Wide Desktop >= 1200px: 5 Columns x 2 Rows ]
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  Card 1  │  Card 2  │  Card 3  │  Card 4  │  Card 5  │  Row 1
├──────────┼──────────┼──────────┼──────────┼──────────┤
│  Card 6  │  Card 7  │  Card 8  │  Card 9  │  Card 10 │  Row 2
└──────────┴──────────┴──────────┴──────────┴──────────┘

[ Laptop / Medium Tablet 768px - 1199px: 3 Columns Wrapped ]
┌──────────────┬──────────────┬──────────────┐
│    Card 1    │    Card 2    │    Card 3    │
├──────────────┼──────────────┼──────────────┤
│    Card 4    │    Card 5    │    Card 6    │
├──────────────┼──────────────┼──────────────┤
│    Card 7    │    Card 8    │    Card 9    │
├──────────────┼──────────────┴──────────────┤
│   Card 10    │       (Graceful span)       │
└──────────────┴─────────────────────────────┘

[ Mobile Viewport < 768px: 1-2 Columns ]
Linear stack or 2-column swipeable cards with zero overflow.
```

---

## ♿ 6. Accessibility & Motion (WCAG 2.1 AA)

- **Target Contrast:** Minimum 4.5:1 text-to-background contrast ratio across all text elements in both dark and light modes.
- **Focus Rings:** Visible `:focus-visible` styling (`outline: 2px solid var(--accent-cyan); outline-offset: 2px`).
- **Reduced Motion:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    .metric-card, .metric-big-num, .gauge-progress {
      transition: none !important;
      animation: none !important;
    }
  }
  ```
- **Semantic ARIA:** Each grid container marked with `role="region"` and descriptive `aria-label`.
