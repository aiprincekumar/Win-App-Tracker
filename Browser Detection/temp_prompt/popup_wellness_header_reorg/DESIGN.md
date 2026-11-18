# Design Specification & UI Tokens (DESIGN.md) — Popup Mode Wellness Sub-Tabs & Header/Footer Reorganization

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/DESIGN.md`  
> **Author & Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Visual Hierarchy & Spatial Layout

The popup UI must adhere to a strict fixed geometry:
- **Container Geometry:** Fixed width of 380px (`min-width: 380px; max-width: 380px; width: 380px; margin: 0 auto; overflow-x: hidden;`).
- **Header Structure:**
  - Left anchor: Brand Logo & Title (`.brand`).
  - Middle-to-Right cluster (`.header-badges`):
    - Left side of badges: `#tier1SegmentedNav` (4 category buttons: 🎬 Playback, 📚 Studio, 📊 Analytics, 🌙 Wellness).
    - Right side of badges: `.header-action-group` containing `#btnSwitchMediaTab` (Switch Tab) and `#btnOpenDashboard` (Dashboard).
- **Footer Toolbar Structure:**
  - 7 compact utility buttons arranged in a balanced row:
    `#btnGlobalMediaToggle` | `#btnGlobalMuteToggle` | `#btnToggleTrackingPause` | `#btnSleepTimerTrigger` | `#btnReconnectWs` | `#btnQuickSettings` | `#btnThemeToggle`
  - Button styling: `.footer-btn.toolbar-btn` with consistent 28-32px height, 15x15px or 16x16px centered SVG icon, subtle hover glow, and active scale feedback (`transform: scale(0.95)`).

---

## 🌈 2. Color Palette & Token Architecture

### 2.1 Cyber Dark Palette (Default)
```css
:root {
  --bg-app: #090d16;
  --bg-surface: #111827;
  --bg-surface-elevated: #1e293b;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-accent: rgba(59, 130, 246, 0.4);
  
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-indigo: #6366f1;
  --accent-purple: #a855f7;
  --accent-rose: #f43f5e;
  --accent-amber: #f59e0b;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}
```

### 2.2 Category Color Signatures
- **Playback (Media / Audio):** Cyan to Blue (`#06b6d4` -> `#3b82f6`).
- **Studio (Tools / Studio):** Purple to Violet (`#a855f7` -> `#8b5cf6`).
- **Analytics (Tracking / Domains):** Emerald to Sky (`#10b981` -> `#38bdf8`).
- **Wellness (Sleep / Focus):** Indigo to Lavender (`#6366f1` -> `#a855f7`).
  - **Sleep Sub-Tab Active:** Indigo crescent glow (`background: rgba(99, 102, 241, 0.15); border-color: #6366f1; color: #818cf8;`).
  - **Focus Sub-Tab Active:** Amber-Emerald focus ring (`background: rgba(16, 185, 129, 0.15); border-color: #10b981; color: #34d399;`).

### 2.3 Light Theme (`[data-theme="light"]`)
```css
[data-theme="light"] {
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #f1f5f9;
  --border-subtle: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
}
```

---

## 📐 3. Component Specs & Micro-Interactions

### 3.1 Header Alignment & Action Group
- `.header`: `display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; height: 50px;`
- `.header-badges`: `display: flex; align-items: center; gap: 8px; flex: 1; justify-content: flex-end;`
- `.tier1-segmented-nav.header-group-nav`: `display: inline-flex; align-items: center; background: rgba(0, 0, 0, 0.25); border-radius: 8px; padding: 2px;`
- `.header-action-group`: `display: inline-flex; align-items: center; gap: 4px;`
- Buttons inside action group (`#btnSwitchMediaTab`, `#btnOpenDashboard`): 26x26px square, rounded-md (6px), icon centered 14x14px or 15x15px.

### 3.2 Quick Settings Footer Button & Popover
- `#btnQuickSettings`:
  - `class="footer-btn toolbar-btn btn-quick-settings"`
  - Sizing: `flex: 1 1 0; min-width: 32px; max-width: 44px; height: 32px; border-radius: 6px;`
  - Active/Hover: subtle background glow (`rgba(255, 255, 255, 0.08)` in dark, `#e2e8f0` in light).
- `#quickSettingsPopover`:
  - `position: fixed; bottom: 48px; right: 8px; width: 290px; max-height: 380px;`
  - Upward opening animation: `transform-origin: bottom right;`
  - Z-index: `1000` to sit cleanly above all view panes and content cards.

### 3.3 Focus Sub-Tab & Placeholder Hero Card
- `#mainTabFocus`:
  - Matches all `.top-tab-btn` styling (display flex, align-items center, gap 4px, font-size 11px, font-weight 600).
- `#viewFocusPane #cardFocusPlaceholder`:
  - Cyber-dark glassmorphism container: `background: rgba(17, 24, 39, 0.85); border: 1px dashed rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 18px 14px; text-align: center; margin: 12px 8px;`
  - Icon: 32px 🎯 icon with pulse aura.
  - Heading: 14px bold `#f8fafc`.
  - Body: 11px muted `#94a3b8`.
  - Badge: emerald indicator `Focus Mode Ready`.

---

## ♿ 4. Accessibility & Zero-Scroll Compliance
- **Zero Horizontal Scrollbar:** Both `html`, `body`, and `.sentinel-app` must have `overflow-x: hidden !important; width: 380px; box-sizing: border-box;`.
- **Keyboard Navigation:** All buttons must have visible `:focus-visible` rings (`outline: 2px solid var(--accent-cyan); outline-offset: 1px;`).
- **Screen Reader Labels:** All icon-only buttons (`#btnSwitchMediaTab`, `#btnOpenDashboard`, `#btnQuickSettings`, `#btnThemeToggle`, `#tier1Btn*`) include `.sr-only` descriptive text and appropriate `aria-label` / `title` attributes.
