<!-- 0xEF, 0xBB, 0xBF UTF-8 BOM Encoded -->
# Design System & UI Specification (DESIGN.md)
# Task: Visualizer Toolbar Flex Alignment & Dual-Mode Full Window / Full Screen Controls
# Task ID: TASK-VIZ-TOOLBAR-ALIGN-FULLSCREEN-001

> **Lead Department:** Dept 05 Frontend Engineering & UI/UX Design

---

## 🎨 1. Visual Hierarchy & Spacing Tokens

- **Toolbar Container:**
  - `width: 100%`
  - `padding: 4px 8px`
  - `border-radius: 9999px` (Capsule shape)
  - `backdrop-filter: blur(12px) saturate(160%)`
  - Dark Theme: `background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.1);`
  - Light Theme (`body.theme-light`): `background: rgba(255, 255, 255, 0.75); border: 1px solid rgba(0, 0, 0, 0.08);`

- **Actions Group (`.viz-actions-group`):**
  - `display: inline-flex`
  - `align-items: center`
  - `gap: 6px`

- **Action Buttons (`.btn-viz-action-icon`):**
  - `width: 28px; height: 28px; border-radius: 50%;`
  - Dark Mode Default: `color: #94a3b8; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12);`
  - Dark Mode Hover: `color: #f8fafc; background: rgba(255, 255, 255, 0.14); border-color: rgba(56, 189, 248, 0.45); transform: translateY(-1px);`
  - Dark Mode Active: `color: #38bdf8; background: rgba(56, 189, 248, 0.22); border-color: rgba(56, 189, 248, 0.6); box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);`
  - Light Mode Default: `color: #64748b; background: rgba(0, 0, 0, 0.05); border: 1px solid rgba(0, 0, 0, 0.1);`
  - Light Mode Hover: `color: #0f172a; background: rgba(0, 0, 0, 0.1); border-color: rgba(2, 132, 199, 0.5);`
  - Light Mode Active: `color: #0284c7; background: rgba(2, 132, 199, 0.15); border-color: rgba(2, 132, 199, 0.6); box-shadow: 0 0 8px rgba(2, 132, 199, 0.25);`

---

## 🎛️ 2. Iconography & Semantics
- **Video Embed Toggle:** Standard video display monitor with play triangle (`<rect>` + `<polygon>`).
- **Full Window (Theater):** In-window browser viewport maximize frame (`<rect>` with vertical sidebar divider `<line>`).
- **Full Screen:** 4-corner outwards expanding arrows (enter) and inwards compressing arrows (exit).
