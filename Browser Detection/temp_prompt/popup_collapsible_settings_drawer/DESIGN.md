# Design Specification: Popup Collapsible Settings Drawers

> **Document Type:** Design System Specification  
> **Workspace Container:** `temp_prompt/popup_collapsible_settings_drawer/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 04: UI/UX Design System  

---

## 🎨 1. Visual Ergonomics & Zero-Scroll Layout Principles

### 1.1 Viewport Ergonomics
- **Target Popup Dimensions:** Width: 380px–400px; Initial Height: <= 560px.
- **Visual Hierarchy:**
  1. **Primary Focal Point:** The 140x140 SVG Circular Radial Dial (`r=54`, `stroke-dasharray=339.292`) with vivid gradient glow and bold digital countdown readout.
  2. **Primary Interaction Tier:** 4-button horizontal action pill row (Start/Pause, Extenders, Reset).
  3. **Secondary Subordinate Tier:** Collapsible Settings Drawer header pinned cleanly below the hero card.
- **Initial State:** Collapsed. Viewport strictly fits the hero card, drawer header, and footer without vertical scrollbars.

---

## 💎 2. Design Tokens & Styling Attributes

### 2.1 Cyber-Dark Theme Tokens
- **Drawer Background:** `rgba(18, 24, 38, 0.75)` with `backdrop-filter: blur(12px)`.
- **Drawer Border:** `1px solid rgba(255, 255, 255, 0.08)`.
- **Hover State:** Border transitions to `rgba(129, 140, 248, 0.35)` (Sleep) or `rgba(16, 185, 129, 0.35)` (Focus).
- **Header Text:** `font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8;`
- **Chevron:** `color: #64748b; font-size: 11px; display: inline-block; transform-origin: center;`

### 2.2 Light Mode Parity
- **Drawer Background:** `rgba(248, 250, 252, 0.95)` with subtle drop shadow `0 2px 8px rgba(0, 0, 0, 0.05)`.
- **Drawer Border:** `1px solid rgba(203, 213, 225, 0.8)`.
- **Header Text:** `color: #475569;`

---

## ⏱️ 3. Motion & Micro-Interactions

- **Animation Duration:** `280ms`.
- **Easing Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (Ultra-smooth Apple/Fluid physics curve).
- **Chevron Rotation:** `0deg` (Collapsed) -> `180deg` (Expanded).
- **Opacity Fade:** Inner cards fade in from `opacity: 0` to `opacity: 1` over `220ms` with `delay: 40ms` during expansion.
- **Reduced Motion Support:** `@media (prefers-reduced-motion: reduce)` sets transition duration to `0.01ms` for accessibility.
