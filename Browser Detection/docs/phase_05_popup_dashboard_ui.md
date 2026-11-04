# Phase 05: Popup Dashboard UI & Donut Chart Visualization

> **Phase ID:** `phase_05_popup_dashboard_ui`  
> **Parent Task:** `browser_detection_extension_v1`  
> **Department:** Department 04: UI/UX Design System & Department 05: Frontend Engineering  
> **Assigned Role:** `frontend_ui_designer`  
> **Status:** Ready for Execution  

---

## 1. Objective & Scope

Design and build the interactive extension popup dashboard (`popup/popup.html`, `popup/popup.css`, `popup/popup.js`), matching the user's uploaded "Web Activity Time Tracker" visual paradigm while infusing a high-end Cyber-Dark glassmorphic aesthetic. The popup presents an SVG Donut Chart, temporal tabs (`Today`, `Daily Avg`, `Total`), aggregate statistics pills, domain-wise usage list with progress bars, and a live Media Telemetry Sentinel card.

---

## 2. Visual Architecture & Layout Hierarchy

```
┌────────────────────────────────────────────────────────┐
│ [Icon] Web Activity & Media Sentinel      [WS: ● 65432]│
├────────────────────────────────────────────────────────┤
│ 🟢 LIVE MEDIA: YouTube (1080p FHD • Vol 90% • Playing)  │
├────────────────────────────────────────────────────────┤
│                  ┌──────────────────┐                  │
│                  │   ╭──────────╮   │                  │
│                  │  │   2h 15m   │  │   [SVG Donut     │
│                  │  │ Today Time │  │    Chart]        │
│                  │   ╰──────────╯   │                  │
│                  └──────────────────┘                  │
├────────────────────────────────────────────────────────┤
│     [ Today ]       |     [ Daily ]     |   [ Total ]  │
├────────────────────────────────────────────────────────┤
│ Today: 2h 15m   │ Daily Avg: 1h 40m │ Sessions: 28     │
├────────────────────────────────────────────────────────┤
│ Top Domains Breakdown:                                 │
│ 1. [Y] youtube.com      1h 12m (53.3%)  [====       ]  │
│ 2. [G] github.com       0h 42m (31.1%)  [==         ]  │
│ 3. [N] netflix.com      0h 15m (11.1%)  [=          ]  │
│ 4. [*] Others           0h 06m ( 4.5%)  [.          ]  │
├────────────────────────────────────────────────────────┤
│ [🔄 Refresh]       [📥 Export JSON]      [⚙️ Settings] │
└────────────────────────────────────────────────────────┘
```

---

## 3. UI/UX Component Specifications

### 3.1 Live Media Sentinel Banner
- Displays currently active video or audio playback across the entire browser.
- Glow indicators:
  - Green neon badge: `● VIDEO PLAYING` (includes video title and resolution: `1080p FHD`, `4K UHD`).
  - Amber badge: `● AUDIO STREAMING` (e.g. Spotify Web, podcasts).
  - Slate badge: `○ IDLE / NO MEDIA`.

### 3.2 Pure Standalone SVG Donut Chart
- Zero external CDN dependencies (works 100% offline and in strict Content Security Policy environments).
- Computes arc lengths using standard SVG `stroke-dasharray` and `stroke-dashoffset`.
- Beautiful, high-contrast Catppuccin / Cyberpunk palette:
  - Domain #1: Emerald `#10b981`
  - Domain #2: Sky Blue `#0ea5e9`
  - Domain #3: Violet `#8b5cf6`
  - Domain #4: Amber `#f59e0b`
  - Domain #5: Coral `#f43f5e`
  - Others: Muted Gray `#64748b`
- Center text dynamically updates when hovering over a slice or switching tabs (`Today`, `Daily`, `Total`).

### 3.3 Domain List & Progress Bars
- Lists top domains sorted by duration descending.
- Shows:
  - Favicon with graceful fallback to first letter in colored circle.
  - Domain name (e.g., `youtube.com`).
  - Active time (formatted as `Xh Ym Zs` or `Ym Zs`).
  - Percentage of total time for the active tab view.
  - Smooth animated horizontal progress bar matching the slice color.
  - Session counter badge (`4 visits`).

---

## 4. Acceptance Criteria & Test Gate

- [ ] Popup renders cleanly within 150ms of user click.
- [ ] Responsive width: 380px, height: auto (max 580px with scrollable list).
- [ ] Temporal tab switching (`Today`, `Daily`, `Total`) instantly updates donut chart, totals, and list.
- [ ] Live Media Sentinel card reflects playback in background tabs in real time.
- [ ] Fully compliant with MV3 Content Security Policy (no inline scripts, no `eval`).
