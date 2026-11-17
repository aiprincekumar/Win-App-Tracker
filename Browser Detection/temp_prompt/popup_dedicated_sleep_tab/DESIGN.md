# Dedicated Sleep Timer Tab in Extension Popup Mode — Design System & UI Specification

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Path:** `temp_prompt/popup_dedicated_sleep_tab/DESIGN.md`  

---

## 🎨 1. Visual Language & Night Ambient Theme

The Sleep Tab UI introduces a serene, night-focused **Indigo & Deep Violet Cyber-Glassmorphism** aesthetic. Designed specifically for low-light bedtime environments, it minimizes eye strain while maintaining the extension's high-tech cybernetic HUD identity.

```
       [ Deep Midnight Base: #0b0f19 / rgba(11, 15, 25, 0.85) ]
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
[ Primary Glow ]        [ Secondary Accent ]        [ Ambient Gradient ]
Indigo (#6366f1)        Violet (#8b5cf6)            Fuchsia (#d946ef)
```

### 1.1 Color Palette & Token Definitions
| Token Name | Hex / RGBA | Role & Application |
| :--- | :--- | :--- |
| `--sleep-bg-base` | `#0b0f19` | Deep midnight dark canvas background |
| `--sleep-card-bg` | `rgba(18, 24, 38, 0.72)` | Glassmorphic card background with 16px backdrop-blur |
| `--sleep-border` | `rgba(129, 140, 248, 0.22)` | Subtle iridescent indigo card borders |
| `--sleep-glow-indigo`| `#6366f1` | Radial dial primary gradient stop & active tab glow |
| `--sleep-glow-violet`| `#8b5cf6` | Radial dial secondary gradient stop |
| `--sleep-glow-fuchsia`| `#c084fc` | Peak highlight for countdown numbers and thumbs |
| `--sleep-text-bright`| `#f8fafc` | Crisp readable countdown text (100% white) |
| `--sleep-text-muted` | `#94a3b8` | Subtitle, secondary label, and AM/PM time indicator |
| `--sleep-btn-extend` | `rgba(139, 92, 246, 0.18)`| Background for quick extend `+5m`/`+15m` pills |

---

## 📐 2. 7-Column Symmetrical Grid Geometry (380px Viewport)

### 2.1 Navigation Bar Constraints (`.top-nav-tabs`)
The extension popup has a fixed body width of `380px` (`max-width: 380px; box-sizing: border-box;`). Dividing 380px across 7 tabs yields approximately `50px - 52px` per tab button with outer container padding of `3px`.

```css
.top-nav-tabs {
  display: grid;
  /* Legacy fallback comments for backwards compatibility */
  /* grid-template-columns: repeat(4, 1fr); */
  /* grid-template-columns: repeat(6, 1fr); */
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: rgba(255, 255, 255, 0.035);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--border-dim);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  width: 100%;
  box-sizing: border-box;
}
```

### 2.2 Tab Button Sizing & Typography
To guarantee zero wrapping or horizontal scrollbars:
- **Button Padding:** `5px 1px`
- **Icon Size:** `12px` font size (or `12px x 12px` glyph)
- **Label Font Size:** `9.5px` (English) / `9px` (Hindi)
- **Label Font Weight:** `600`
- **Overflow Protection:** `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`

### 2.3 Tab 7 Active Glow Gradient
```css
.top-tab-btn[data-view="sleep"].active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.28) 100%);
  border-color: rgba(168, 85, 247, 0.5);
  color: #e0e7ff;
  box-shadow: 0 0 10px rgba(129, 140, 248, 0.35);
}
```

---

## ⭕ 3. Bedtime Radial Dial Specifications

### 3.1 Visual Anatomy
```
              ╭─────────────────╮
           ╭──╯      12:00      ╰──╮
         ╭─╯     ┌───────────┐     ╰─╮
        ╭╯       │   IDLE    │       ╰╮   <- Status Badge (#sleepDialStatusBadge)
       ╭╯        └───────────┘        ╰╮
       │          30:00                │  <- Large Numerical Display (#sleepDialCountdown)
       ╰╮      Sleep at 11:45 PM      ╭╯  <- Projected Sleep Target (#sleepDialTargetTime)
        ╰╮                           ╭╯
         ╰─╮                       ╭─╯
           ╰──╮      06:00      ╭──╯
              ╰─────────────────╯
```

- **SVG Container Dimensions:** `140px` $\times$ `140px` centered horizontally.
- **Track Ring:** `stroke="rgba(255, 255, 255, 0.08)"`, `stroke-width="8"`, `r="54"`.
- **Progress Ring:** `stroke="url(#sleepGlowGradient)"`, `stroke-width="8"`, `stroke-linecap="round"`, `stroke-dasharray="339.292"`, smooth transition `stroke-dashoffset 0.35s ease`.
- **Countdown Typography:** `22px` font size, `font-weight: 700`, monospaced tabular numerals (`font-variant-numeric: tabular-nums;`), color `#f8fafc`.
- **Target Bedtime Typography:** `10.5px` font size, `color: #a5b4fc`, letter-spacing `-0.1px`.

---

## ⚡ 4. Quick Controls & Presets Layout

### 4.1 Quick Extend Buttons (`+5m` / `+15m`)
Positioned symmetrically beneath the dial:
- **Button Dimensions:** Flexible `1fr` width, `26px` height.
- **Background:** `linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))`.
- **Border:** `1px solid rgba(168, 85, 247, 0.3)`.
- **Hover State:** Background lightens to `rgba(168, 85, 247, 0.3)`, scale transform `scale(1.02)`.
- **Active State:** Scale transform `scale(0.97)`.

### 4.2 Duration Preset Pills (15m, 30m, 45m, 60m, 90m, 120m)
- Structured in a 3-column $\times$ 2-row grid (`grid-template-columns: repeat(3, 1fr); gap: 6px;`).
- Compact height `28px` with rounded pill borders (`border-radius: 8px`).
- Interactive click feedback: active preset pill glows in vibrant violet with `border-color: #a855f7; background: rgba(168, 85, 247, 0.25);`.

---

## ♿ 5. Accessibility & Contrast (WCAG 2.1 AA)

1. **Contrast Ratio:** White `#f8fafc` against dark midnight `#0b0f19` provides a contrast ratio of `17.4:1` (exceeding WCAG AAA standard of `7:1`).
2. **Tab Navigation ARIA Roles:**
   - `<nav class="top-nav-tabs" role="tablist">`
   - `<button id="mainTabSleep" role="tab" aria-selected="false" aria-controls="viewSleepPane">`
   - `<div id="viewSleepPane" role="tabpanel" aria-labelledby="mainTabSleep">`
3. **Screen Reader Live Announcements:**
   - Countdown timer contains `aria-live="polite"` to announce status changes without spamming ticks.
