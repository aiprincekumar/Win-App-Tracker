# Design System & UI Tokens: Light Mode Status Pill Badge Overhaul

> **Document Type:** Design System Specification (DESIGN.md)  
> **Workspace Container:** `temp_prompt/light_mode_idle_badge_overhaul/`  
> **Task ID:** `TASK-LIGHT-MODE-IDLE-BADGE-001`  
> **Lead Department:** Dept 04 (UI/UX Design System)  

---

## 🎨 1. Light Mode Design Philosophy & Semantic Status System

In Studio Light mode (`body.theme-light` / `[data-theme="light"]`), status pill badges must abandon dark skeuomorphic or dark translucent containers. Instead, badges embrace an editorial, high-contrast, physical paper-substrate aesthetic:
1. **Clean Light Surface:** Crisp `#f8fafc` or `#f1f5f9` fills provide clear figure-ground separation against white cards (`#ffffff`) and off-white dashboard backgrounds (`#f8fafc`).
2. **Hairline Subtle Borders:** 1px solid borders in `#cbd5e1` (Slate-300) or `#e2e8f0` (Slate-200) define the pill boundary without harsh visual weight.
3. **Deep Slate Accessible Typography:** Label text uses `#475569` (Slate-600) or `#334155` (Slate-700), delivering high contrast against light surfaces.
4. **Crisp Geometric Status Dots:** Status dots are 6px × 6px perfect circles with solid colors and subtle 1px border or controlled soft glow in active states.

---

## 📐 2. Semantic Color Palette & Contrast Ledger

All text and background pairings must pass WCAG 2.1 AA (minimum 4.5:1 for normal text) or WCAG 2.1 AAA (minimum 7.0:1):

| Status State | Surface Background | Border Color | Text Color | Dot Color | Contrast Ratio vs Surface | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **IDLE / Offline / Ready** | `#f1f5f9` (Slate-100) | `#cbd5e1` (Slate-300) | `#475569` (Slate-600) | `#64748b` (Slate-500) | **5.45:1** | **AA Pass** |
| **IDLE Alternate (Deep)** | `#f8fafc` (Slate-50) | `#cbd5e1` (Slate-300) | `#334155` (Slate-700) | `#64748b` (Slate-500) | **8.20:1** | **AAA Pass** |
| **ACTIVE (Focus / Playing)** | `rgba(16, 185, 129, 0.12)` | `rgba(16, 185, 129, 0.4)` | `#065f46` (Emerald-800) | `#059669` (Emerald-600) | **7.24:1** | **AAA Pass** |
| **BREAK (Short / Long)** | `rgba(6, 182, 212, 0.12)` | `rgba(6, 182, 212, 0.4)` | `#0e7490` (Cyan-800) | `#0891b2` (Cyan-600) | **6.85:1** | **AA Pass** |
| **BREAK Alternate (Blue)** | `rgba(59, 130, 246, 0.12)` | `rgba(59, 130, 246, 0.4)` | `#1e40af` (Blue-800) | `#2563eb` (Blue-600) | **7.08:1** | **AAA Pass** |
| **SLEEP (Running / Armed)** | `rgba(99, 102, 241, 0.12)` | `rgba(99, 102, 241, 0.4)` | `#3730a3` (Indigo-800) | `#4f46e5` (Indigo-600) | **7.52:1** | **AAA Pass** |
| **PAUSED / Standby** | `rgba(245, 158, 11, 0.12)` | `rgba(245, 158, 11, 0.4)` | `#92400e` (Amber-800) | `#d97706` (Amber-600) | **6.92:1** | **AA Pass** |
| **TRIGGERED / Alert** | `rgba(239, 68, 68, 0.12)` | `rgba(239, 68, 68, 0.4)` | `#991b1b` (Red-800) | `#dc2626` (Red-600) | **7.15:1** | **AAA Pass** |

---

## 📏 3. Geometry, Typography & Spacing Specifications

### 3.1 Standard Status Pill Geometry
- **Border Radius:** `9999px` (or `10px` / `14px` depending on legacy host container).
- **Padding:** `2px 8px` (micro), `3px 10px` (standard), `4px 12px` (hero).
- **Font Size:** `0.65rem` / `10px` (micro), `0.75rem` / `11.5px` (standard).
- **Font Weight:** `600` or `700` (Semi-Bold to Bold).
- **Letter Spacing:** `0.05em` (`0.5px`).
- **Text Transform:** `UPPERCASE` (for concise status indicators: IDLE, ACTIVE, BREAK, PAUSED).

### 3.2 Status Dot Geometry
- **Dimensions:** `6px × 6px` (Popup / Cards), `7.5px × 7.5px` (Sidebar HUD).
- **Border Radius:** `50%` (strictly circular).
- **Shadow in Idle State:** `none` (eliminating muddy dark halos).
- **Shadow in Active State:** `0 0 6px rgba(5, 150, 105, 0.4)` (Emerald) or `0 0 6px rgba(99, 102, 241, 0.35)` (Indigo).

---

## 🌓 4. Dark Mode Zero-Mutation Invariant

| Dark Mode Status State | Surface Background | Text Color | Dot Color | Preservation Status |
| :--- | :--- | :--- | :--- | :---: |
| **Audio Viz IDLE** | `rgba(15, 23, 42, 0.6)` | `#64748b` | `#64748b` | **100% UNTOUCHED** |
| **Hero Media IDLE** | `rgba(255, 255, 255, 0.05)` | `var(--text-muted)` | N/A | **100% UNTOUCHED** |
| **Focus Mode .badge-focus** | `rgba(16, 185, 129, 0.2)` | `#34d399` | N/A | **100% UNTOUCHED** |
| **Sleep Badge IDLE** | `rgba(148, 163, 184, 0.15)` | `#94a3b8` | N/A | **100% UNTOUCHED** |
| **Popup Dynamic Status IDLE** | `rgba(255, 255, 255, 0.04)` | `var(--text-dim)` | `#475569` | **100% UNTOUCHED** |
| **Popup Sleep Badge IDLE** | `rgba(148, 163, 184, 0.15)` | `#94a3b8` | N/A | **100% UNTOUCHED** |
| **Popup Focus Badge IDLE** | `rgba(148, 163, 184, 0.12)` | `#94a3b8` | N/A | **100% UNTOUCHED** |
