# Web Activity & Media Sentinel - Dashboard Design System 2.0
## iOS 26 Liquid Glass & Bento Grid Aesthetic Specification

> **Document Type:** Design System Specification & Visual Style Guide  
> **System Name:** Sentinel Liquid Glass 2.0 Design System  
> **Target System:** Web Activity & Media Sentinel (Chrome MV3 Dashboard)  
> **Document Status:** CANONICAL_DESIGN_SPECIFICATION  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Governance:** Universal Rule 22 & Universal Rule 5 (UTF-8 BOM)  

---

## 🎨 1. Core Materiality & Specular Depth

The design system is modeled after the refined translucent materiality of **iOS 26 Liquid Glass**, featuring dynamic backdrop blur, specular refraction borders, multi-tier elevation shadows, and chromatic accents:

```css
:root {
  /* Dynamic Liquid Glass Surface */
  --glass-surface-bg: rgba(15, 23, 42, 0.65);
  --glass-surface-hover: rgba(30, 41, 59, 0.80);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-focus: rgba(16, 185, 129, 0.50);
  --glass-specular-highlight: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%);
  --glass-backdrop-blur: blur(24px);
  --glass-saturation: saturate(190%);
  --glass-card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glass-card-hover-shadow: 0 16px 48px 0 rgba(0, 0, 0, 0.48);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-dim: #64748b;

  /* Accent System */
  --accent-emerald: #10b981;
  --accent-cyan: #06b6d4;
  --accent-violet: #8b5cf6;
  --accent-rose: #f43f5e;
  --accent-amber: #f59e0b;
}

[data-theme="light"], .theme-light {
  --glass-surface-bg: rgba(255, 255, 255, 0.75);
  --glass-surface-hover: rgba(241, 245, 249, 0.85);
  --glass-border: rgba(0, 0, 0, 0.08);
  --glass-border-focus: rgba(16, 185, 129, 0.60);
  --glass-specular-highlight: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.30) 100%);
  --glass-card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.06);

  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #475569;
  --text-dim: #64748b;
}
```

---

## 📐 2. The 12-Column Bento Grid & 5-Column Subgrid Math

The dashboard stage uses a strict 12-column responsive grid architecture:

```css
.bento-grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.25rem;
  width: 100%;
}

.bento-span-12 { grid-column: span 12; }
.bento-span-8  { grid-column: span 8; }
.bento-span-6  { grid-column: span 6; }
.bento-span-4  { grid-column: span 4; }
.bento-span-3  { grid-column: span 3; }
```

### The Key Metrics Subgrid Rule:
Whenever an odd number of metric cards (e.g. 5 cards) must be rendered in a single row, **NEVER assign `.bento-span-3` directly to each card**!  
Instead, wrap them in a container spanning the full 12 columns:
```css
.metrics-bento-row.bento-span-12 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
}
```
This achieves mathematical perfection: all 5 cards occupy exactly $20\%$ of the width with identical spacing and height.

---

## 🕹️ 3. 60fps Micro-Motion & Spring Physics

All transitions must adhere to the high-performance GPU-accelerated bezier curve:

```css
/* Spring Bezier Curve */
:root {
  --motion-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-fast: 150ms var(--motion-spring);
  --motion-normal: 250ms var(--motion-spring);
  --motion-slow: 400ms var(--motion-spring);
}

.liquid-glass-card {
  transition: transform var(--motion-fast), box-shadow var(--motion-fast), border-color var(--motion-fast);
}

.liquid-glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-card-hover-shadow);
  border-color: rgba(255, 255, 255, 0.16);
}
```

---

## ♿ 4. WCAG 2.1 AAA Accessibility & Focus Rings

1. **Contrast Ratio:** All primary text must exceed 7.0:1 contrast ratio against the glass background in both light and dark themes.
2. **Dual-Ring Focus Indicator:**
```css
:focus-visible {
  outline: 2px solid var(--accent-emerald);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
}
```
