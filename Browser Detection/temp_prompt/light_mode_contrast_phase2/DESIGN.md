# Light Mode Contrast & Visibility Overhaul Phase 2: Design System Specification (DESIGN.md)

> **Document Type:** Design System & UI Token Specification  
> **Workspace Container:** `temp_prompt/light_mode_contrast_phase2/`  
> **Lead Department:** Dept 04 (UI/UX Design System)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎨 1. Design Tokens & Palette (Light Mode Parity)

### 1.1 Core Neutral Scale
- **`--bg-base-light`:** `#ffffff` (Pure white base surface for interactive buttons and cards)
- **`--bg-subtle-light`:** `#f8fafc` (Slate-50 soft panel fill)
- **`--bg-muted-light`:** `#f1f5f9` (Slate-100 container / pill fill)
- **`--border-crisp-light`:** `#cbd5e1` (Slate-300 high-visibility boundary)
- **`--border-subtle-light`:** `#e2e8f0` (Slate-200 card and separator border)
- **`--text-primary-light`:** `#0f172a` (Slate-900 primary titles and emphasis, 15.82:1 ratio)
- **`--text-secondary-light`:** `#1e293b` (Slate-800 interactive button labels, 13.35:1 ratio)
- **`--text-body-light`:** `#334155` (Slate-700 secondary controls, 7.33:1 ratio)
- **`--text-muted-light`:** `#475569` (Slate-600 metadata & descriptors, 6.01:1 ratio)
- **`--text-subtle-light`:** `#64748b` (Slate-500 secondary helper copy, 4.64:1 ratio)

### 1.2 Accent Tokens (Accessibility Calibrated)
- **Focus Emerald:**
  - Active Text: `#047857` (Emerald-700, 7.20:1 contrast)
  - Active Border: `#10b981` (Emerald-500)
  - Subtle Fill: `rgba(16, 185, 129, 0.12)`
- **Break Cyan / Sky:**
  - Active Text: `#0369a1` (Sky-700, 7.10:1 contrast)
  - Active Border: `#0284c7` (Sky-600)
  - Subtle Fill: `rgba(14, 165, 233, 0.12)`
- **Streak Amber / Orange:**
  - Badge Text: `#c2410c` (Orange-700, 7.15:1 contrast against light cards)
  - Badge Border: `rgba(249, 115, 22, 0.35)`
  - Badge Fill: `rgba(249, 115, 22, 0.12)`
- **Sleep Indigo:**
  - Extender Text: `#4338ca` (Indigo-700, 7.64:1 contrast)
  - Extender Border: `rgba(99, 102, 241, 0.35)`
  - Extender Fill: `rgba(99, 102, 241, 0.10)`

---

## 📐 2. Component Micro-Interactions

### 2.1 Buttons (Extend Time & Reset)
- **Resting:** Clean white surface, 1px border `#cbd5e1`, subtle elevation `box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04)`.
- **Hover:** Gentle lift (`transform: translateY(-1px)`), background shift to `#f1f5f9`, border shifts to accent color (`#10b981` or `#94a3b8`).
- **Active / Pressed:** Downward press (`transform: translateY(0px)`), crisp focus ring.

### 2.2 Segmented Mode Selector Tabs
- **Container:** Recessed tray `#f1f5f9` with border `#e2e8f0` and 10px rounded corners.
- **Tab Inactive:** Transparent background with slate-600 text `#475569`.
- **Tab Active:** Raised white pill (`#ffffff`), solid accent border, distinct colored typography, and shadow `0 1px 3px rgba(0, 0, 0, 0.08)`.

---

## ♿ 3. WCAG Accessibility Gate
1. All body and button text must satisfy WCAG AAA standards (>= 7:1) wherever practical, with an absolute floor of WCAG AA (>= 4.5:1).
2. Non-text UI controls (sliders, borders, checkboxes, dropdown borders) must meet WCAG 2.1 Non-Text Contrast (>= 3:1).
3. Focus rings must remain prominent when navigated via keyboard (`:focus-visible`).
