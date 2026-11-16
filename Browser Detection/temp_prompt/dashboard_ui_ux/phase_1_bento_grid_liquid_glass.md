# Phase 1: Bento Grid Layout Architecture & iOS 26 Liquid Glass Theme Tokens
## Standalone Executable Phase Instruction Specification

> **Phase Identifier:** `PHASE-01-BENTO-GRID-AND-LIQUID-GLASS`  
> **Subsystems Implemented:** System 1 (Bento Grid Modularity) & System 2 (iOS 26 Liquid Glass Depth)  
> **Target Files:** `dashboard/dashboard.css`, `dashboard/dashboard.html`  
> **Test Gate:** `tests/test_dashboard_uiux_phase1.js`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Authorization Prerequisite:** Active `AUTH-MGR-*` token from Level 2 Manager  

---

## 🎯 1. Phase Objective

Transform the current rigid flexbox dashboard layout into an adaptive, responsive **12-Column CSS Bento Grid** wrapped in **iOS 26 Specular Liquid Glass** styling (`backdrop-filter: blur(24px) saturate(190%)`), complete with 1px specular lighting gradient borders, multi-tier elevation shadows, and skeleton loaders guaranteeing **zero Cumulative Layout Shift (CLS = 0)**.

---

## 📋 2. Prerequisites & Inputs

1. **Current Codebase State:**
   - Active workspace: [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)
   - Baseline stylesheets: `dashboard/dashboard.css`
   - Baseline markup: `dashboard/dashboard.html`
2. **Design Specifications:**
   - Refer to [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux/DESIGN.md) for exact glass tokens and spacing variables.
   - Master prompt: [`dashboard_ui_ux_enhancement_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_enhancement_prompt.md).

---

## 🔍 3. Technical Context & File Anchors

- **`dashboard/dashboard.css` (Target insertion points):**
  - Section `:root`: Introduce glass tokens (`--glass-surface-bg`, `--glass-surface-hover`, `--glass-border-specular`, `--shadow-ambient`, `--shadow-specular-glow`, `--glass-blur-radius`).
  - Section Grid Engine: Replace legacy `.overview-grid` and `.cards-container` flex wrappers with `.bento-grid-container` and span utility classes (`.bento-span-12`, `.bento-span-8`, `.bento-span-6`, `.bento-span-4`, `.bento-span-3`, `.bento-row-span-2`).
  - Responsive Breakpoints: Media queries at `1200px` and `768px`.
- **`dashboard/dashboard.html` (Markup restructuring):**
  - Wrap the primary dashboard views (`#tabContentTimeTracking`, `#tabContentMediaAnalytics`, `#tabContentSettings`) in `.bento-grid-container`.
  - Assign `.bento-card` and `.liquid-glass-card` classes to all widget cards.
  - Set Hero Media Player to `.bento-span-8 .bento-row-span-2`.
  - Set Time Distribution Donut to `.bento-span-4 .bento-row-span-2`.
  - Set 4 Metric Cards to `.bento-span-3`.
  - Set Domain Table to `.bento-span-12`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Inject iOS 26 Liquid Glass & Bento Tokens in `dashboard.css`
Add the following root tokens and classes to `dashboard/dashboard.css`:
```css
/* ==========================================================================
   Sentinel iOS 26 Liquid Glass & Bento Grid Tokens (System 1 & System 2)
   ========================================================================== */
:root {
  --glass-surface-bg: rgba(18, 24, 38, 0.72);
  --glass-surface-hover: rgba(26, 34, 52, 0.85);
  --glass-border-specular: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.16) 0%,
    rgba(255, 255, 255, 0.04) 50%,
    rgba(0, 0, 0, 0.25) 100%
  );
  --shadow-ambient: 0 12px 32px -4px rgba(0, 0, 0, 0.45);
  --shadow-specular-glow: 0 0 20px -2px rgba(16, 185, 129, 0.15);
  --glass-blur-radius: 24px;
}

/* 12-Column Bento Grid Container */
.bento-grid-container {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: minmax(140px, auto);
  gap: 1.25rem;
  padding: 1.5rem;
  max-width: 1720px;
  margin: 0 auto;
}

/* Bento Card Spans */
.bento-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease;
  min-height: 140px; /* Zero CLS guarantee */
}

.bento-span-12 { grid-column: span 12; }
.bento-span-8  { grid-column: span 8; }
.bento-span-6  { grid-column: span 6; }
.bento-span-4  { grid-column: span 4; }
.bento-span-3  { grid-column: span 3; }
.bento-row-span-2 { grid-row: span 2; }

/* Liquid Glass Materiality */
.liquid-glass-card {
  background: var(--glass-surface-bg);
  backdrop-filter: blur(var(--glass-blur-radius)) saturate(190%);
  -webkit-backdrop-filter: blur(var(--glass-blur-radius)) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-image: var(--glass-border-specular) 1;
  box-shadow: var(--shadow-ambient);
}

.liquid-glass-card:hover {
  background: var(--glass-surface-hover);
  box-shadow: var(--shadow-ambient), var(--shadow-specular-glow);
  transform: translateY(-2px);
}

/* Responsive Collapse Rules */
@media (max-width: 1200px) {
  .bento-span-8, .bento-span-4 { grid-column: span 12; }
  .bento-span-3 { grid-column: span 6; }
}

@media (max-width: 768px) {
  .bento-span-12, .bento-span-8, .bento-span-6, .bento-span-4, .bento-span-3 {
    grid-column: span 12;
  }
  .bento-grid-container {
    padding: 0.75rem;
    gap: 0.75rem;
  }
}
```

### Step 2: Restructure Dashboard Containers in `dashboard.html`
- Update the main section containers to utilize `.bento-grid-container`.
- Apply `.bento-card` and `.liquid-glass-card` to each module.
- Preserve all existing DOM IDs (`#heroMediaPlayerCard`, `#timeDistributionCard`, `#metricToday`, etc.) to prevent JavaScript selector breakage.

### Step 3: Implement Zero CLS Skeleton Loaders
- Ensure each Bento widget has a corresponding `.skeleton-shimmer` state during initial state load.
- Ensure `min-height` reservations prevent any visual jumping when telemetry data arrives.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Strict Preservation of DOM IDs:** Do NOT rename or delete existing IDs (e.g., `#heroMediaPlayPauseBtn`, `#heroMediaSeekSlider`, `#domainTableBody`). All existing JavaScript hooks in `dashboard.js` must remain 100% functional.
- **No Inline JavaScript:** Do NOT add inline event handlers (`onclick`, `onchange`) in `dashboard.html`.
- **Out-of-Scope for Phase 1:** Command Palette (`Ctrl+K`), Web Audio Synthesizer, and Hotkeys are strictly deferred to Phases 2, 3, and 4.

---

## 📦 6. Deliverables Manifest

1. `dashboard/dashboard.css`: Updated with Bento Grid engine and iOS 26 Liquid Glass tokens.
2. `dashboard/dashboard.html`: Updated with `.bento-grid-container` structure and card classes.
3. `tests/test_dashboard_uiux_phase1.js`: Test runner verifying 12-col grid rules, glass tokens, and responsive spans.

---

## 🧪 7. Local Verification Gate

Execute the Phase 1 test suite:
```bash
node tests/test_dashboard_uiux_phase1.js
```
**Gate Certification Criteria:**
- Exit code must be `0`.
- All CSS selector validations must pass 100% clean.
- `node -c dashboard/dashboard.js` must pass with 0 syntax errors.
