# UI & Design System Specification (DESIGN.md) — Modular Architecture

> **Document Type:** Design System & UI Modular Architecture  
> **Initiative:** Modular Architecture Refactoring for Web Activity & Media Sentinel  
> **Lead UI/UX Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Lead Department:** Dept 04 UI/UX Design System & Dept 05 Frontend Engineering  
> **Governance Standard:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/modular_architecture_refactor/DESIGN.md`

---

## 🎨 1. Design Principles & Aesthetic Foundations

1. **Precision Glassmorphism:** Subtle dark-theme translucent cards with backdrop blur, fine border highlights (`rgba(255, 255, 255, 0.08)`), and high-contrast typography.
2. **Zero Layout Shift (CLS = 0):** Exact dimension clamping (fixed 420px max-width in popup, fixed 34x32px buttons) to prevent micro-jank during reactive state updates.
3. **W3C Trusted Types Safe:** 100% of dynamic UI elements are constructed using `document.createElement`, `document.createElementNS`, and `textContent`. Zero `innerHTML` assignments.
4. **WCAG 2.1 AA Compliance:** Minimum 4.5:1 text-to-background contrast ratio across all status badges, pills, and interactive buttons. Focus rings on all keyboard-navigable elements.

---

## 🎛️ 2. Semantic Color Tokens & Theme Matrix

```css
:root {
  /* Surface & Background */
  --bg-primary: #0f1117;
  --bg-surface: #181b24;
  --bg-surface-elevated: #222634;
  --bg-card: rgba(24, 27, 36, 0.75);
  --bg-card-hover: rgba(34, 38, 52, 0.85);

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(99, 102, 241, 0.5);
  --border-highlight: rgba(255, 255, 255, 0.15);

  /* Typography */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-accent: #818cf8;

  /* Semantic State Accents */
  --accent-blue: #3b82f6;
  --accent-indigo: #6366f1;
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --accent-purple: #a855f7;

  /* Status Badges */
  --status-connected-bg: rgba(16, 185, 129, 0.15);
  --status-connected-text: #34d399;
  --status-connecting-bg: rgba(245, 158, 11, 0.15);
  --status-connecting-text: #fbbf24;
  --status-disconnected-bg: rgba(244, 63, 94, 0.15);
  --status-disconnected-text: #fb7185;

  /* Sizing & Viewport Constraints */
  --popup-width: 420px;
  --popup-max-height: 580px;
  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 14px;
}
```

---

## 🧩 3. Component Modular Hierarchy

### 3.1 Popup Hub View Hierarchy (`src/popup/`)
```
Popup Container (420px fixed)
├── Header Component (src/popup/components/header_badges.js)
│   ├── Extension Title & Version Badge (v2.5.0)
│   ├── Live WebSocket Status Badge (Port 65432)
│   └── SQLite Data Hub Status Badge & Quick Settings
│
├── Navigation Bar (src/popup/tabs/)
│   ├── Tab 1: 🎬 Player Tab (#mainTabMedia)
│   ├── Tab 2: 🎛️ Audio Lab Tab (#mainTabAudio)
│   ├── Tab 3: 📚 Studio Vault Tab (#mainTabStudio)
│   └── Tab 4: ⏱️ Focus Tracker Tab (#mainTabTracking)
│
├── Tab Panes Container
│   ├── #viewMediaPane: Player card, volume slider, seekbar, in-card actions
│   ├── #viewAudioPane: 0-200% volume boost, 5-band EQ sliders, presets, vocal clarity
│   ├── #viewStudioPane: Timestamp notes, clips gallery, bookmark cards
│   └── #viewTrackingPane: Browser filter dropdown, stat pills, domain table, donut chart
│
└── Footer Toolbar Component (src/popup/components/footer_toolbar.js)
    └── Single-Row 7-Button Grid (Sleep Timer, Play/Pause, Rewind, Forward, Dimmer, Fullscreen, Toast)
```

### 3.2 Dashboard View Hierarchy (`src/dashboard/`)
```
Dashboard Container (Full Window)
├── Navigation Header
│   ├── Brand & Multi-Browser Filter Selector (Chrome, Edge, Firefox, All)
│   ├── Global Date Range Picker (Today, 7 Days, 30 Days, Custom)
│   └── Live WebSocket Connection Indicator
│
├── Metrics Summary Row
│   ├── Total Time Pill
│   ├── Active Domains Count Pill
│   ├── Media Streaming Time Pill
│   └── SQLite Sync Freshness Pill
│
├── Analytics Charts Grid
│   ├── Domain Distribution Donut Chart (src/dashboard/charts/donut_chart.js)
│   └── Time Series Activity Chart (src/dashboard/charts/time_series_chart.js)
│
└── Detailed Domain Data Table
    ├── Search & Filter Input
    ├── Sortable Columns (Domain, Total Time, Category, Last Active)
    └── Pagination Controls
```

---

## ♿ 4. Accessibility & Micro-Interactions

1. **Keyboard Traversal:** Full `Tab` / `Shift+Tab` accessibility with high-contrast `:focus-visible` styling (`outline: 2px solid var(--accent-indigo); outline-offset: 2px;`).
2. **Touch & Click Targets:** All buttons have a minimum clickable area of 32x32px.
3. **Motion Safety:** Respects `prefers-reduced-motion` media query by disabling scale and slide transitions for sensitive users.
4. **Screen Reader Support:** Semantic HTML tags (`<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`) and descriptive `aria-label` tags on icon-only buttons.
