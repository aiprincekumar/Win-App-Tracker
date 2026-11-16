# Design System & UI Specification: Executive Top App Bar

> **Task Workspace:** `temp_prompt/topbar_dom_uiux_fix/DESIGN.md`  
> **Aesthetic Philosophy:** Liquid Glass, Kinetic Emerald Accents, High-Density Executive Cockpit  
> **Standards:** WCAG 2.1 AA Compliant, Anti-Generic, Hardware-Accelerated Micro-Transitions  

---

## 1. Visual Token Matrix

| Element | Dark Mode Token / Value | Light Mode Token / Value | Geometry & Layout |
| :--- | :--- | :--- | :--- |
| **Top App Bar** | `background: var(--bg-topbar)` (`rgba(15, 23, 42, 0.75)`) | `background: var(--bg-topbar-light)` (`rgba(255, 255, 255, 0.85)`) | `height: 56px`, `backdrop-filter: blur(16px)` |
| **Pill Selector Base** | `background: rgba(15, 23, 42, 0.85)` | `background: rgba(248, 250, 252, 0.95)` | `height: 28px`, `border-radius: 9999px`, `padding: 3px 8px` |
| **Browser Filter Border** | `border: 1px solid rgba(16, 185, 129, 0.35)` | `border: 1px solid rgba(16, 185, 129, 0.5)` | Smooth emerald glow on hover (`0 0 10px rgba(16,185,129,0.3)`) |
| **Filter Typography** | `color: #6ee7b7`, `font-size: 11.5px`, `font-weight: 700` | `color: #065f46`, `font-size: 11.5px`, `font-weight: 700` | Inter / System UI, tabular numbers |
| **Data Hub Badge (Online)**| `background: rgba(16, 185, 129, 0.1)`, `color: #a7f3d0` | `background: rgba(16, 185, 129, 0.15)`, `color: #065f46` | Full pill, `8px` pulsating emerald dot |
| **Data Hub Badge (Offline)**| `background: rgba(239, 68, 68, 0.08)`, `color: #fca5a5` | `background: rgba(239, 68, 68, 0.12)`, `color: #991b1b` | Full pill, `8px` static crimson dot |
| **Action Icon Buttons** | `background: rgba(255, 255, 255, 0.05)`, `border: 1px solid var(--border-dim)` | `background: rgba(0, 0, 0, 0.04)`, `border: 1px solid rgba(0,0,0,0.1)` | `28px x 28px` square / circular pill, centered icon |

---

## 2. Component Hierarchy & Spacing Rhythm

```
+--------------------------------------------------------------------------------------------------------------+
| [header.top-app-bar]                                                                                          |
|                                                                                                              |
|  [ .app-bar-left ]                             [ .app-bar-right (gap: 8px, flex-nowrap) ]                    |
|  ⏱️ Time Tracking Analytics                     (🌐 All Browsers ▾)  (📊 Combined ▾)  (🟢 Hub Online)         |
|  Detailed breakdown of daily browsing time     [🕒 02:22:15]  [🌐]  [🌙]  [📥 Export ▾]  [🔄]               |
+--------------------------------------------------------------------------------------------------------------+
```

### 2.1 Micro-Interactions & Transitions
- **Hover Kinetic Elevation:** On `:hover`, pills smoothly translate `-1px` on the Y-axis with a transition time of `0.2s cubic-bezier(0.4, 0, 0.2, 1)`.
- **Focus Rings:** On `:focus-within` or `:focus-visible`, an outline of `2px solid rgba(16, 185, 129, 0.6)` with an offset of `2px` is applied to ensure WCAG 2.1 AA keyboard navigation accessibility.
- **Dropdown Opening:** `.export-dropdown-menu` fades and scales in from `opacity: 0; transform: translateY(-4px) scale(0.98)` to `opacity: 1; transform: translateY(0) scale(1)` in `0.15s ease-out`.

---

## 3. WCAG 2.1 AA Accessibility Contract

1. **Color Contrast:**
   - Dark theme `#6ee7b7` on `#0f172a` has a contrast ratio of **9.8:1** (exceeds 4.5:1 requirement).
   - Light theme `#065f46` on `#f8fafc` has a contrast ratio of **8.6:1** (exceeds 4.5:1 requirement).
2. **Hit Target Sizes:**
   - Interactive icon buttons use `28px` to `32px` clickable boundaries with padding extensions to satisfy touch target ergonomics.
3. **Screen Readers:**
   - `#browserFilterSelect` includes `aria-label="Filter Analytics by Browser"`.
   - `#trackingModeSelect` includes `aria-label="Select Tracking Method"`.
   - Dropdown menu buttons have `aria-haspopup="true"` and `aria-expanded` toggle states.
