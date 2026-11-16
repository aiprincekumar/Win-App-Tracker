# Design System & Modular CSS Tokens (DESIGN.md)

> **Document Type:** Design System Specification, CSS Token Hierarchy & Modular Styling Guide  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/DESIGN.md`](DESIGN.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Lead Department:** Dept 04 (UI/UX Design System)  
> **Target System:** Web Activity & Media Sentinel (Dashboard & Popup Views)  
> **Status:** APPROVED & SPECIFIED  

---

## 🎨 1. Design Token Hierarchy & Variable Architecture

The extension implements a refined **Liquid Glass** aesthetic with frosted acrylic backgrounds, subtle specular borders, and high-legibility typography across dark, light, and high-contrast modes.

### 1.1 CSS Custom Properties (`:root`)
```css
:root {
  /* Color Palette - Dark Foundation */
  --bg-primary: #0a0c10;
  --bg-secondary: #12161f;
  --bg-card: rgba(18, 22, 31, 0.75);
  --bg-card-hover: rgba(26, 32, 44, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-specular: rgba(255, 255, 255, 0.16);

  /* Brand Accents */
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --accent-purple: #8b5cf6;

  /* Typography Scales */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --text-xs: 0.6875rem; /* 11px */
  --text-sm: 0.75rem;   /* 12px */
  --text-base: 0.875rem;/* 14px */
  --text-lg: 1.0rem;    /* 16px */
  --text-xl: 1.25rem;   /* 20px */
  --text-2xl: 1.5rem;   /* 24px */

  /* Glassmorphism & Elevation */
  --glass-blur: blur(16px);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Focus & Accessibility Indicators */
  --focus-ring: 0 0 0 2px #0a0c10, 0 0 0 4px #06b6d4;
}
```

---

## 🏛️ 2. Modular CSS Breakdown Architecture

### 2.1 Dashboard CSS Modular Topology (`dashboard/styles/`)
To replace the 3,891-line monolithic `dashboard/dashboard.css`, the styles are structured into single-responsibility component sheets aggregated by `dashboard/dashboard.css`:

1. **`tokens.css`:** Defines all color variables, typography, shadows, borders, and liquid glass mixins.
2. **`layout.css`:** Sidebar navigation, top header, main content layout grid, and responsive breakpoints.
3. **`tracking.css`:** Time tracking pane, daily breakdown stat cards, time-series charts, and domain tables.
4. **`media.css`:** Media analytics pane, hero player deck, mini dock, chapter ticks, and scrubber slider.
5. **`audio_lab.css`:** Dedicated `.audio-eq-widget`, `.liquid-glass-card`, 5-band vertical sliders, decibel badges, and EQ curve visualizers.
6. **`palette.css`:** Omni command palette modal (`.omni-modal-overlay`, `.omni-palette-card`, kbd badges).
7. **`hotkeys.css`:** Keyboard shortcut cheat sheet modal (`#hotkeysCheatSheetModal`, hotkey grid).
8. **`themes.css`:** Explicit theme overrides for `.theme-light` and `.theme-high-contrast`.

### 2.2 Popup CSS Modular Topology (`popup/styles/`)
To replace the 3,738-line monolithic `popup/popup.css`, the popup styles are organized to strictly respect the fixed extension popup viewport (380px width, max 600px height):

1. **`base.css`:** Reset, box-sizing, typography, scrollbar styling, and root container dimensions.
2. **`header.css`:** Brand typography, status badges (HUD, Hub, Time pills), and header layout.
3. **`tabs.css`:** 6-tab horizontal navigation strip, active indicator pill, and pane visibility transitions.
4. **`quick_settings.css`:** Quick Settings toggles, tracking mode selector, and active domain pill.
5. **`audio_lab.css`:** Compact popup equalizer card, 5 vertical sliders, boost slider, and preset dropdown.
6. **`wellness.css`:** Sleep timer input dials, digital wellness limits, and chime sound toggles.
7. **`themes.css`:** High-contrast mode borders, WCAG AAA text contrast, and light theme overrides.

---

## ♿ 3. Accessibility & WCAG 2.1 AA Compliance

### 3.1 Focus Indicators
- Every interactive element (`<button>`, `<input>`, `<select>`, `[role="button"]`) must declare visible focus styles via `:focus-visible`.
- Standard focus ring: `outline: none; box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent-cyan);`.

### 3.2 Contrast Ratios
- **Body Text:** Minimum contrast ratio of **4.5:1** against underlying container backgrounds.
- **Large Text / Headings:** Minimum contrast ratio of **3.0:1**.
- **Interactive UI Components & Badges:** Minimum contrast ratio of **3.0:1** against adjacent colors.

### 3.3 Semantic Roles & ARIA
- Command Palette modal uses `role="dialog"`, `aria-modal="true"`, and `role="listbox"`.
- Sliders use `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-label`.
- Navigation uses `role="tablist"` with buttons declaring `role="tab"` and `aria-selected="true|false"`.
- Toast notifications use `role="status"` and `aria-live="polite"`.
