# Phase 1 Execution Instruction: Dashboard Navigation, Tables & Media Deck

> **Phase Number:** 01  
> **Phase Name:** Dashboard Navigation, Tables & Media Deck (Bugs 1, 2, 3)  
> **Workspace Container:** `temp_prompt/light_mode_visibility_contrast_fix/`  
> **Target Subsystems:** Data Tables (`#domainAnalyticsTable`, `#mediaHistoryTable`), Audio Visualizer Controls (`.btn-viz-action-icon`), Hero Media Controls (`.btn-ctrl-hero`, `.hero-speed-stepper`, volume slider)  
> **Target Files:**
> - `dashboard/styles/themes.css`
> - `dashboard/styles/tracking.css`
> - `dashboard/styles/media/hero_player.css`
> - `dashboard/styles/media/visualizer_deck.css`
> - `dashboard/styles/media.css`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Prerequisites:** Authorization Token `AUTH-MGR-*` issued by Level 2 Manager  

---

## 🎯 1. Phase Objective

Surgically enhance Light Mode (`body.theme-light`, `[data-theme="light"]`) contrast and visibility for:
1. **Bug 1: Table Headers:** Fix `.modern-data-table th` on `#domainAnalyticsTable` (Domain Breakdown) and `#mediaHistoryTable` (Media Playback History) to display crisp light backgrounds (`#f1f5f9`), dark slate text (`#1e293b`, 11.8:1 contrast), and `#cbd5e1` bottom border.
2. **Bug 2: Audio Visualizer Controls:** Fix action buttons (`.btn-viz-action-icon`, `.viz-btn-segmented`, `.btn-viz-drawer-close`) in `visualizer_deck.css` and `themes.css` to eliminate dark slate background blotches in Light Mode.
3. **Bug 3: Media Playback Controls & Volume Toolbar:** Fix `.btn-ctrl-hero`, `.btn-ctrl-hero-stepper`, and volume slider in `hero_player.css` and `media.css` so that text never washes out to white on hover in Light Mode, and volume tooltips display dark text on light pills.

---

## 🔗 2. Technical Context & File Anchors

- `dashboard/styles/tracking.css#L531-L545`: `.modern-data-table th` has hardcoded `background: rgba(15, 23, 42, 0.9)`.
- `dashboard/styles/themes.css#L184-L198`: Light mode table rules currently only target `.data-table th` and `.data-table td`.
- `dashboard/styles/media/visualizer_deck.css#L270-L300`: `.btn-viz-action-icon` has `background: rgba(30, 41, 59, 0.7) !important;` and `color: #94a3b8 !important;`.
- `dashboard/styles/media/visualizer_deck.css#L657-L667`: Light theme section lacks `.btn-viz-action-icon` overrides.
- `dashboard/styles/media/hero_player.css#L107-L175`: `.btn-ctrl-hero:hover` has `color: #fff`, `.btn-ctrl-hero.primary:hover` has `color: #fff`.
- `dashboard/styles/media.css#L112-L180`: Mirror definitions of hero player controls.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1.1: Table Headers Contrast Fix (`themes.css` & `tracking.css`)
In `dashboard/styles/themes.css`, update and expand the table section around line 184:
```css
/* Light Mode Modern Data Table & Standard Data Table Headers */
body.theme-light .data-table th,
body.theme-light .modern-data-table th,
[data-theme="light"] .data-table th,
[data-theme="light"] .modern-data-table th {
  background-color: #f1f5f9 !important;
  color: #1e293b !important;
  border-bottom: 1px solid #cbd5e1 !important;
  font-weight: 700 !important;
}

body.theme-light .data-table td,
body.theme-light .modern-data-table td,
[data-theme="light"] .data-table td,
[data-theme="light"] .modern-data-table td {
  color: #0f172a !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

body.theme-light .data-table tr:hover td,
body.theme-light .modern-data-table tr:hover td,
[data-theme="light"] .data-table tr:hover td,
[data-theme="light"] .modern-data-table tr:hover td {
  background-color: rgba(0, 0, 0, 0.03) !important;
}
```

### Step 1.2: Audio Visualizer Action Buttons Fix (`visualizer_deck.css` & `themes.css`)
In `dashboard/styles/media/visualizer_deck.css` (inside the Light Theme Harmonization section around line 657):
```css
/* Visualizer Action Buttons in Light Theme */
body.theme-light .btn-viz-action-icon,
[data-theme="light"] .btn-viz-action-icon {
  background: rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  color: #334155 !important;
}

body.theme-light .btn-viz-action-icon:hover,
[data-theme="light"] .btn-viz-action-icon:hover {
  background: rgba(0, 0, 0, 0.09) !important;
  border-color: rgba(99, 102, 241, 0.5) !important;
  color: #0f172a !important;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.2) !important;
}

body.theme-light .btn-viz-action-icon:active,
body.theme-light .btn-viz-action-icon.active,
[data-theme="light"] .btn-viz-action-icon:active,
[data-theme="light"] .btn-viz-action-icon.active {
  background: rgba(99, 102, 241, 0.15) !important;
  border-color: #6366f1 !important;
  color: #4338ca !important;
}

body.theme-light .btn-viz-drawer-close,
[data-theme="light"] .btn-viz-drawer-close {
  background: rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  color: #475569 !important;
}

body.theme-light .viz-btn-segmented,
[data-theme="light"] .viz-btn-segmented {
  background: rgba(0, 0, 0, 0.04) !important;
  color: #334155 !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}
```

### Step 1.3: Media Playback Controls & Volume Toolbar (`hero_player.css`, `media.css`, `themes.css`)
Append scoped light mode rules in `dashboard/styles/media/hero_player.css` and `dashboard/styles/media.css`:
```css
/* Light Mode Hero Playback Controls & Stepper */
body.theme-light .btn-ctrl-hero,
[data-theme="light"] .btn-ctrl-hero {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

body.theme-light .btn-ctrl-hero:hover,
[data-theme="light"] .btn-ctrl-hero:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
  transform: translateY(-1px) !important;
}

body.theme-light .btn-ctrl-hero.primary,
[data-theme="light"] .btn-ctrl-hero.primary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.18)) !important;
  border: 1px solid rgba(16, 185, 129, 0.5) !important;
  color: #047857 !important;
  font-weight: 700 !important;
}

body.theme-light .btn-ctrl-hero.primary:hover,
[data-theme="light"] .btn-ctrl-hero.primary:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(6, 182, 212, 0.28)) !important;
  color: #065f46 !important;
}

body.theme-light .hero-speed-stepper,
[data-theme="light"] .hero-speed-stepper {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
}

body.theme-light .btn-ctrl-hero-stepper,
[data-theme="light"] .btn-ctrl-hero-stepper {
  color: #475569 !important;
}

body.theme-light .btn-ctrl-hero-stepper:hover,
[data-theme="light"] .btn-ctrl-hero-stepper:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

body.theme-light .hero-speed-val,
[data-theme="light"] .hero-speed-val {
  color: #b45309 !important;
}

body.theme-light .vol-floating-tooltip,
[data-theme="light"] .vol-floating-tooltip {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}
```

---

## 🚫 4. Architectural Constraints & Invariants

- **Constitutional Invariant:** DO NOT mutate any default Dark Mode selector or property.
- **UTF-8 with BOM Standard:** Preserve `0xEF, 0xBB, 0xBF` encoding on all edited files.
- **W3C Trusted Types Compliance:** No direct DOM manipulation or innerHTML usage.

---

## 📦 5. Deliverables Manifest

1. `dashboard/styles/themes.css`: Added scoped `.modern-data-table th` and `.btn-viz-action-icon` light rules.
2. `dashboard/styles/media/visualizer_deck.css`: Added light theme action button rules.
3. `dashboard/styles/media/hero_player.css`: Added light mode `.btn-ctrl-hero` and stepper rules.
4. `dashboard/styles/media.css`: Synchronized light mode hero player rules.

---

## 🚦 6. Local Verification Gate

Execute verification check:
```powershell
node -e "
const fs = require('fs');
const themes = fs.readFileSync('dashboard/styles/themes.css', 'utf8');
const viz = fs.readFileSync('dashboard/styles/media/visualizer_deck.css', 'utf8');
const hero = fs.readFileSync('dashboard/styles/media/hero_player.css', 'utf8');
console.assert(themes.includes('.modern-data-table th'), 'Modern data table header light rule missing');
console.assert(viz.includes('body.theme-light .btn-viz-action-icon'), 'Viz action icon light rule missing');
console.assert(hero.includes('body.theme-light .btn-ctrl-hero'), 'Hero ctrl light rule missing');
console.log('✅ Phase 1 Verification Passed Cleanly');
"
```
Ensure exit code is 0.
