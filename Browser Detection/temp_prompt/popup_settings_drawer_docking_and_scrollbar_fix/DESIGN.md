# Design System Specification: Cyber-Dark Scrollbars & Docked Geometry

> **Document Type:** Design System & Token Specification  
> **Workspace Container:** `temp_prompt/popup_settings_drawer_docking_and_scrollbar_fix/`  
> **Design Philosophy:** Cyber-Dark Glassmorphic Ergonomics & Zero-Clutter Architecture  

---

## 🎨 1. Color Tokens & Gradients

| Token Name | CSS Value | Visual Intent |
| :--- | :--- | :--- |
| `--scroll-thumb-focus` | `rgba(6, 182, 212, 0.45)` | Cyber-cyan accent for focus tab scrollbar thumb |
| `--scroll-thumb-focus-hover` | `rgba(6, 182, 212, 0.75)` | Bright cyan interactive glow on mouseover |
| `--scroll-thumb-sleep` | `rgba(129, 140, 248, 0.45)` | Indigo accent for sleep tab drawer scrollbar |
| `--scroll-thumb-sleep-hover` | `rgba(129, 140, 248, 0.75)` | Luminous purple-indigo glow on mouseover |
| `--scroll-track` | `transparent` | Seamless blend into glassmorphic background |
| `--scroll-thumb-light` | `rgba(100, 116, 139, 0.35)` | Slate gray thumb for Light Theme |

---

## 📐 2. Viewport Geometry & Spacing Grid

- **Popup Viewport Width:** 380px fixed width.
- **Maximum Pane Height:** 540px.
- **Docked Sleep Hero Height:** ~240px (inclusive of dial and action buttons).
- **Bounded Drawer Max Height:** 280px (leaving comfortable breathing room in 540px total).
- **Internal Card Gap:** Reduced from 8px to 6px.
- **Drawer Inner Padding:** `2px 4px 6px 4px`.
- **Scrollbar Width:** 4px (hairline unobtrusive precision).

---

## 🏃 3. Motion & Micro-Interactions

- **Expansion Transition:** `grid-template-rows: 0fr -> 1fr` via `280ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Chevron Rotation:** 180-degree smooth transform with `200ms ease`.
- **Scrollbar Hover Transition:** `background 0.2s ease`.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` is active, transition duration defaults to `0.01ms`.
