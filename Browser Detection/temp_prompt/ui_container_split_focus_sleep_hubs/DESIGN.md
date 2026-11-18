# Design System Specification (DESIGN.md): UI Container Split for Focus & Sleep Hubs

> **Document Type:** Design System Specification & Visual Tokens  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Initiative ID:** `TASK-UI-SPLIT-FOCUS-SLEEP-HUBS-001`  
> **Lead Department:** Dept 04 (UI/UX Design System)  

---

## 🎨 1. Design Philosophy: Cyber-Dark Liquid Glassmorphism

The Sentinel design language combines deep space dark backgrounds (`#0a0d14` / `#0f1422`), frosted glassmorphic card surfaces (`backdrop-filter: blur(16px)`), calibrated borders (`rgba(255,255,255,0.08)`), and intentional dual-mood chromatic accents:
- **Focus Modality:** Energizing Emerald / Mint (`#10b981` / `#34d399`) and Amber (`#f59e0b`).
- **Sleep Modality:** Calming Deep Indigo (`#6366f1`), Moonlit Sky Blue (`#38bdf8`), and Violet (`#8b5cf6`).

---

## 💎 2. Semantic Color Tokens

| Token Name | Hex / RGBA Value | Usage |
| :--- | :--- | :--- |
| `--subnav-bg` | `rgba(15, 23, 42, 0.75)` | Segmented pill container background |
| `--subnav-border` | `rgba(255, 255, 255, 0.08)` | Outer boundary border |
| `--subnav-pill-inactive` | `rgba(255, 255, 255, 0.04)` | Inactive sub-nav pill surface |
| `--subnav-pill-text-dim` | `#94a3b8` | Inactive text label |
| `--focus-accent-primary` | `#10b981` | Focus active indicator, dial progress, primary button |
| `--focus-accent-glow` | `rgba(16, 185, 129, 0.25)` | Focus card hover aura & active ring |
| `--sleep-accent-primary` | `#38bdf8` | Sleep active indicator, dial progress, primary button |
| `--sleep-accent-glow` | `rgba(56, 189, 248, 0.25)` | Sleep card hover aura & active ring |
| `--guardrails-accent` | `#8b5cf6` | Guardrails badge and accent border |

---

## 🔘 3. Sub-Hub Segmented Navigation Bar Tokens & Micro-Interactions

### 3.1 Pill Dimensions & Spacing
- Container Padding: `4px`
- Border Radius: `9999px` (Full Pill)
- Pill Padding: `8px 18px`
- Font Size: `13px` / `Font-Weight: 600`
- Gap between pills: `6px`

### 3.2 Interactive States
- **Inactive:** Text `#94a3b8`, background `transparent`, transition `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`.
- **Hover:** Text `#f1f5f9`, background `rgba(255, 255, 255, 0.08)`, subtle upward scale `translateY(-1px)`.
- **Active:** Text `#ffffff`, background `rgba(255, 255, 255, 0.14)`, border `1px solid rgba(255, 255, 255, 0.18)`, box-shadow `0 4px 12px rgba(0, 0, 0, 0.25)`.
- **Focus Modality Active Pill Accent:** Bottom indicator bar or subtle emerald halo.
- **Sleep Modality Active Pill Accent:** Bottom indicator bar or subtle sky blue halo.

---

## 📐 4. Layout Architecture & Responsive Breakpoints

### 4.1 Full-Width Hero Container (`bento-span-12`)
When a single sub-hub is selected (Focus or Sleep):
- Card spans full grid width (`grid-column: span 12`).
- The 140x140 SVG radial dial and readouts are prominently centered or organized in an expansive 2-column flex layout (Dial & Quick Actions on Left, Presets & Controls on Right) on screens >= 1024px.
- Eliminates cramped vertical scroll within the card.

### 4.2 Responsive Grid Breakpoints
- **Desktop (>= 1200px):** Full-width expanded layout with side-by-side dial + controls grid.
- **Laptop / Tablet (768px - 1199px):** Centered dial with controls stacked neatly below.
- **Mobile (< 768px):** Segmented pill bar scrolls horizontally with touch momentum; cards stack in single column.

---

## ♿ 5. WCAG 2.1 AA Accessibility & Contrast

- **Color Contrast:** All text elements exceed the **4.5:1** contrast ratio against their glassmorphic dark backgrounds.
- **Focus Rings:** High-visibility keyboard focus rings (`outline: 2px solid #38bdf8; outline-offset: 2px`).
- **Screen Reader Announcements:** ARIA live regions (`aria-live="polite"`) for countdown displays and sub-hub transitions.
