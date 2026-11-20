# UI/UX Design System Specification: Drawer Collapsed Zero-Docking Tokens

> **Document Type:** UI/UX Design System Specification  
> **Workspace Container:** `temp_prompt/popup_drawer_collapsed_empty_box_fix/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 04 UI/UX Design System & Cyber-Dark Architecture  

---

## 🎨 1. Geometry & Spatial Tokens

### Collapsed Drawer Spacing:
- **Button Height:** `34px`
- **Container Margin-Top:** `4px`
- **Border Radius:** `8px`
- **Border Dim:** `1px solid rgba(255, 255, 255, 0.08)` (Dark Mode) / `1px solid #e2e8f0` (Light Mode)
- **Background:** `rgba(18, 24, 38, 0.65)` (Dark Mode) / `#f8fafc` (Light Mode)
- **Collapsed Vertical Padding:** Strictly contained within toggle button (`8px 10px`).

### Open Drawer Spacing:
- **Inner Content Max-Height:** `200px`
- **Inner Content Overflow-Y:** `auto` (Hairline 2px ghost scrollbar)
- **Inner Content Padding:** `4px 4px 8px 4px`
- **Background Active:** `rgba(18, 24, 38, 0.85)` (Dark Mode) / `#ffffff` (Light Mode)
- **Border Active:** `rgba(129, 140, 248, 0.3)` (Sleep) / `rgba(6, 182, 212, 0.3)` (Focus)

---

## 👁️ 2. Visual Hierarchy

1. **Top Section:** High-priority hero component (Sleep Dial Ring or Focus Interval Timer) claims visual dominance.
2. **Bottom Section (Collapsed):** Collapsible Settings Drawer button sits compactly directly beneath the hero card as a subtle dock bar.
3. **Bottom Section (Expanded):** Settings content expands downwards smoothly, preserving visibility of the top hero status.
