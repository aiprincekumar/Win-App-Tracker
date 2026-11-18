# Design System & UI Specification — Popup 2-Tier Segmented Control

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect & Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Target Path:** `temp_prompt/popup_2tier_navigation/DESIGN.md`  
> **Status:** `ACTIVE / SPECIFICATION_CERTIFIED`

---

## 🎨 1. Design Philosophy: Segmented Glassmorphism & Adaptive Density

The Web Activity & Media Sentinel design language is built on **precision dark-mode engineering** with full light-theme adaptability. The 2-Tier Segmented Navigation replaces dense, visually cluttered horizontal bars with a clean cognitive hierarchy:
1. **Tier 1 (Segmented Pill Bar):** Sits above the action tabs as a subtle, low-elevation grouping surface. It provides category orientation without distracting from the active content.
2. **Tier 2 (Action Bar):** Filtered child tabs expand dynamically to offer large, comfortable touch and click targets with clear typography and rich iconography.

---

## 📐 2. Geometry, Sizing & Spacing Tokens

| Container / Element | Width | Height | Padding | Gap | Border Radius |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Popup Container** | `420px` (fixed) | `600px` (max) | `8px 10px` | — | `12px` |
| **Tier 1 Container (`#tier1SegmentedNav`)** | `100%` (~400px) | `~32px` | `3px` | `3px` | `9px` |
| **Tier 1 Button (`.tier1-nav-btn`)** | `1fr` (~98px) | `26px` | `4px 2px` | `4px` | `7px` |
| **Tier 2 Container (`.top-nav-tabs`)** | `100%` (~400px) | `~36px` | `3px` | `3px` | `9px` |
| **Tier 2 Button (`.top-tab-btn`) (3 visible)** | `1fr` (~130px) | `30px` | `6px 4px` | `4px` | `7px` |
| **Tier 2 Button (`.top-tab-btn`) (2 visible)** | `1fr` (~196px) | `30px` | `6px 4px` | `4px` | `7px` |
| **Tier 2 Button (`.top-tab-btn`) (1 visible)** | `1fr` (~396px) | `30px` | `6px 4px` | `4px` | `7px` |

---

## 🎭 3. Color Tokens & Theme Architecture

### 3.1 Dark Mode (Default Theme)
- **Tier 1 Container Background:** `rgba(255, 255, 255, 0.04)`
- **Tier 1 Container Border:** `rgba(255, 255, 255, 0.08)`
- **Tier 1 Inactive Text:** `#94a3b8` (Slate 400)
- **Tier 1 Inactive Hover:** `rgba(255, 255, 255, 0.06)` with text `#ffffff`
- **Tier 1 Active Button Surfaces:**
  - *Playback:* `linear-gradient(135deg, rgba(59, 130, 246, 0.28) 0%, rgba(6, 182, 212, 0.24) 100%)`, border `rgba(59, 130, 246, 0.5)`
  - *Studio:* `linear-gradient(135deg, rgba(168, 85, 247, 0.28) 0%, rgba(139, 92, 246, 0.24) 100%)`, border `rgba(168, 85, 247, 0.5)`
  - *Analytics:* `linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.22) 100%)`, border `rgba(16, 185, 129, 0.45)`
  - *Wellness:* `linear-gradient(135deg, rgba(99, 102, 241, 0.28) 0%, rgba(168, 85, 247, 0.24) 100%)`, border `rgba(99, 102, 241, 0.5)`

### 3.2 Light Mode (`[data-theme="light"]`)
- **Tier 1 Container Background:** `#f1f5f9` (Slate 100)
- **Tier 1 Container Border:** `#cbd5e1` (Slate 300)
- **Tier 1 Inactive Text:** `#475569` (Slate 600)
- **Tier 1 Active Button Surfaces:** `#ffffff` (Solid White), border `#94a3b8`, shadow `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Category Specific Accent Text in Light Mode:**
  - *Playback Active Text:* `#1d4ed8` (Blue 700)
  - *Studio Active Text:* `#7e22ce` (Purple 700)
  - *Analytics Active Text:* `#047857` (Emerald 700)
  - *Wellness Active Text:* `#4338ca` (Indigo 700)

### 3.3 High Contrast Mode (`body.high-contrast-mode`)
- **Container Borders:** `2px solid #ffffff`
- **Active Button Borders:** `2px solid #38bdf8` (Cyan 400)
- **Active Background:** `#0f172a` (Solid Dark Slate)
- **Contrast Ratio:** $> 7:1$ (exceeds WCAG AAA requirements)

---

## 🔤 4. Typography Scale

| Element | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 Button Label** | Inter, system-ui, sans-serif | `10.5px` | `600` (SemiBold) | `1.2` | `+0.2px` |
| **Tier 1 Icon** | System Emoji / Unicode | `12px` | `400` (Normal) | `1.0` | `0` |
| **Tier 2 Button Label** | Inter, system-ui, sans-serif | `11px` | `600` (SemiBold) | `1.2` | `+0.1px` |
| **Tier 2 Icon** | System Emoji / Unicode | `12.5px` | `400` (Normal) | `1.0` | `0` |

---

## ✨ 5. Micro-Interactions & Animation Specs

- **Timing Function:** `cubic-bezier(0.4, 0, 0.2, 1)` (Standard ease-out)
- **Duration:** `180ms` (Optimal for perception without perceptible lag)
- **Hover Transition:** Background opacity fades from `0` to `0.06` smoothly.
- **Active State Transition:** Scale elevation `1.0` with instant border illumination and glow.
- **Child Tab Visibility:** Fast `.tab-hidden` toggle; flex auto-reflow takes place synchronously within single render frame.
