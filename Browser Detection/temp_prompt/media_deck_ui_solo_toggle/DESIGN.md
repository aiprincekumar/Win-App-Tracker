# Design Tokens & UI/UX Guidelines (DESIGN.md)
# Task: Multi-Tab Live Media Deck UI Refactor & Two-Way Solo Tab Toggle
# Task ID: TASK-MEDIA-DECK-UI-SOLO-TOGGLE-001

> **Document Type:** Design System Specification (`DESIGN.md`)  
> **Aesthetic Foundation:** Liquid Glass Design System, WCAG 2.1 AA Compliant  
> **Lead Department:** Dept 05 Frontend Engineering & UI/UX Design

---

## 🎨 1. Color Tokens & Theme Integration

The Multi-Tab Live Media Deck UI uses dark glassmorphism with high-contrast accent highlights.

| Token | Dark Mode Value | Light Mode Value | Usage Context |
| :--- | :--- | :--- | :--- |
| `--deck-card-bg` | `rgba(22, 30, 49, 0.75)` | `rgba(255, 255, 255, 0.85)` | Media deck card background |
| `--deck-card-border` | `rgba(255, 255, 255, 0.10)` | `rgba(0, 0, 0, 0.12)` | Outer card border |
| `--volume-accent` | `#10b981` (Emerald) | `#059669` (Dark Emerald) | Volume slider thumb & active track |
| `--scrubber-gradient` | `linear-gradient(90deg, #10b981, #06b6d4)` | `linear-gradient(90deg, #059669, #0891b2)` | Scrubber timeline progress |
| `--solo-active-bg` | `#8b5cf6` (Vibrant Violet) | `#7c3aed` (Deep Violet) | Solo button active state |
| `--solo-active-shadow` | `0 0 10px rgba(139, 92, 246, 0.5)` | `0 0 8px rgba(124, 58, 237, 0.35)` | Active solo button radiant glow |
| `--switch-tab-bg` | `rgba(56, 189, 248, 0.12)` | `rgba(2, 132, 199, 0.12)` | Switch tab button background |
| `--switch-tab-color`| `#38bdf8` (Cyan Blue) | `#0284c7` (Deep Sky Blue) | Switch tab button text |

---

## 📐 2. Typography & Micro-Layout Scales

- **Card Title (`.deck-card-title`):** `font-size: 0.82rem; font-weight: 700; color: #f8fafc;`
- **Time Display (`.deck-time-display`):** `font-size: 0.70rem; font-family: var(--font-mono, monospace); color: #94a3b8;`
- **Control Buttons (`.btn-deck-ctrl`):** `font-size: 0.76rem; font-weight: 600; padding: 5px 6px;`
- **Volume Slider Row (`.deck-volume-row`):** `width: 100%; height: 16px; margin: 4px 0;`

---

## 🎛️ 3. Volume Bar Interaction Design

1. **Full-Length Geometry:**
   - Spans 100% of the interior card width, exactly matching the start and end of `.deck-mini-scrubber`.
   - Track height: `4px` with a subtle rounded border radius (`2px`).
   - Track background: `rgba(255, 255, 255, 0.08)` for dark mode; `rgba(0, 0, 0, 0.08)` for light mode.
2. **Thumb State & Motion:**
   - Smooth transition on drag.
   - Accent color: Emerald (`#10b981`).
   - Tooltip displays live percentage (`Volume: 75%`).

---

## 🔘 4. 4-Button Controls Row Auto-Fit Layout

The 4 buttons must occupy the bottom row with equal visual weight:
```
+-------------------------------------------------------------+
|  [ ▶ Play ]  |  [ 🔊 Mute ]  |  [ 🎧 Solo ]  |  [ 🎯 Switch ]|
+-------------------------------------------------------------+
```
- **Flex Distribution:** `flex: 1 1 0;` ensures every button receives exactly 25% of the row width minus gaps.
- **Min Width Guard:** `min-width: 0;` prevents button labels from overflowing or expanding the card horizontally.
- **Text Truncation:** `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` ensures graceful degradation on compact viewports.

---

## 🔄 5. Solo Tab State Transition UX

| State | Button Visual Style | Badge Text | Media Tab Audio Behavior |
| :--- | :--- | :--- | :--- |
| **Normal / Off** | `background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.35);` | `🎧 Solo Tab` | All active tabs play audio normally |
| **Solo Active** | `background: #8b5cf6; color: #ffffff; box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);` | `🎧 Solo Tab` (active glow) | Target tab is unmuted; all other tabs are muted |
| **Toggled Off (Click 2)**| Transitions back to Normal / Off | `🎧 Solo Tab` (glow removed) | All other tabs are unmuted; global audio restored |
