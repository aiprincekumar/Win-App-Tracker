# Technical Requirements Document (TRD): Light Mode Visibility & Contrast Fix

> **Initiative:** Light Mode UI/UX Visibility & Contrast Hardening  
> **Workspace Container:** `temp_prompt/light_mode_visibility_contrast_fix/`  
> **Document Role:** Low-Level & High-Level Technical Architecture Specification  
> **Target Subsystems:** CSS Cascading Sheets (`themes.css`, `tracking.css`, `media.css`, `focus_sleep_advanced.css`, `layout.css`, `dashboard.css`)  
> **Target Runtimes:** Chromium MV3 Extension Dashboard Context  

---

## 🏛️ 1. High-Level Architecture (HLD)

### 1.1 CSS Cascading & Specificity Architecture
The Sentinel dashboard stylesheets follow a modular inclusion hierarchy in `dashboard/dashboard.html`:

```
1. tokens.css                  (Global tokens, CSS variables)
2. themes.css                  (Theme-specific scoped overrides: body.theme-dark, body.theme-light)
3. palette.css                 (Accent color palettes)
4. layout.css + layout/*.css   (Structural layout, grid, header, sidebar)
5. components.css              (Buttons, inputs, pills, cards)
6. tracking.css                (Time tracking, domain breakdown, heatmap)
7. media.css + media/*.css     (Media deck, hero player, visualizer, equalizer)
8. audio_lab.css               (DSP audio lab, filters, spectrum)
9. settings.css                (General settings)
10. backup_digest.css          (Backup, export, SQLite hub)
11. wellbeing_blacklist.css    (Focus timer, blacklist chips, time budgets)
12. focus_sleep_advanced.css   (Sleep sentinel, power-nap, circadian dimmer)
13. dashboard.css              (Master aggregated stylesheet & root overrides)
```

### 1.2 The Scoping & Specificity Rule
Because `dashboard.css` and feature stylesheets are loaded after `themes.css`, unscoped rules in downstream stylesheets (or rules with identical specificity) could override earlier light mode rules.
Therefore, all Light Mode rules MUST strictly utilize one of the following architectural patterns:

#### Pattern A: Centralized Scoped Theme Rule (`dashboard/styles/themes.css`)
```css
body.theme-light <selector>,
[data-theme="light"] <selector> {
  /* High contrast light mode property overrides */
}
```

#### Pattern B: Modular Scoped Feature Rule (Within feature stylesheet)
Where feature stylesheets (e.g. `visualizer_deck.css`, `focus_sleep_advanced.css`) contain `!important` flags or complex nested selectors, the scoped rule is placed in the feature stylesheet and/or synchronized in `themes.css` with matching specificity:
```css
body.theme-light .btn-viz-action-icon,
[data-theme="light"] .btn-viz-action-icon {
  background: rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.12) !important;
  color: #334155 !important;
}
```

---

## ⚙️ 2. Low-Level Design (LLD): Detailed CSS Rules by Bug Item

### 2.1 Bug Item 1: Table Headers (Domain Breakdown & Media History)
- **Target Selectors:**
  - `body.theme-light .modern-data-table th, [data-theme="light"] .modern-data-table th`
  - `body.theme-light .data-table th, [data-theme="light"] .data-table th`
- **Technical Specification:**
  ```css
  body.theme-light .modern-data-table th,
  [data-theme="light"] .modern-data-table th,
  body.theme-light .data-table th,
  [data-theme="light"] .data-table th {
    background: #f1f5f9 !important;
    color: #1e293b !important;
    border-bottom: 1px solid #cbd5e1 !important;
    font-weight: 700 !important;
  }
  body.theme-light .modern-data-table td,
  [data-theme="light"] .modern-data-table td {
    border-bottom: 1px solid #e2e8f0;
    color: #0f172a;
  }
  ```
- **Contrast Proof:** `#1e293b` against `#f1f5f9` = **11.8:1** (WCAG AAA certified).

### 2.2 Bug Item 2: Audio Visualizer Controls & Action Buttons
- **Target Selectors:**
  - `body.theme-light .btn-viz-action-icon, [data-theme="light"] .btn-viz-action-icon`
  - `body.theme-light .btn-viz-action-icon:hover, [data-theme="light"] .btn-viz-action-icon:hover`
  - `body.theme-light .btn-viz-action-icon.active, [data-theme="light"] .btn-viz-action-icon.active`
  - `body.theme-light .viz-btn-segmented, [data-theme="light"] .viz-btn-segmented`
  - `body.theme-light .btn-viz-drawer-close, [data-theme="light"] .btn-viz-drawer-close`
- **Technical Specification:**
  ```css
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
  body.theme-light .btn-viz-action-icon.active,
  [data-theme="light"] .btn-viz-action-icon.active {
    background: rgba(99, 102, 241, 0.15) !important;
    border-color: #6366f1 !important;
    color: #4338ca !important;
  }
  body.theme-light .btn-viz-drawer-close,
  [data-theme="light"] .btn-viz-drawer-close {
    background: rgba(0, 0, 0, 0.05) !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
    color: #475569 !important;
  }
  ```

### 2.3 Bug Item 3: Media Playback Controls & Volume Toolbar
- **Target Selectors:**
  - `body.theme-light .btn-ctrl-hero, [data-theme="light"] .btn-ctrl-hero`
  - `body.theme-light .btn-ctrl-hero:hover, [data-theme="light"] .btn-ctrl-hero:hover`
  - `body.theme-light .btn-ctrl-hero.primary, [data-theme="light"] .btn-ctrl-hero.primary`
  - `body.theme-light .btn-ctrl-hero.primary:hover, [data-theme="light"] .btn-ctrl-hero.primary:hover`
  - `body.theme-light .hero-speed-stepper, [data-theme="light"] .hero-speed-stepper`
  - `body.theme-light .btn-ctrl-hero-stepper:hover, [data-theme="light"] .btn-ctrl-hero-stepper:hover`
- **Technical Specification:**
  ```css
  body.theme-light .btn-ctrl-hero,
  [data-theme="light"] .btn-ctrl-hero {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #0f172a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  body.theme-light .btn-ctrl-hero:hover,
  [data-theme="light"] .btn-ctrl-hero:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a !important;
  }
  body.theme-light .btn-ctrl-hero.primary,
  [data-theme="light"] .btn-ctrl-hero.primary {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
    border-color: rgba(16, 185, 129, 0.5);
    color: #047857;
  }
  body.theme-light .btn-ctrl-hero.primary:hover,
  [data-theme="light"] .btn-ctrl-hero.primary:hover {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25));
    color: #065f46 !important;
  }
  body.theme-light .hero-speed-stepper,
  [data-theme="light"] .hero-speed-stepper {
    background: #ffffff;
    border: 1px solid #cbd5e1;
  }
  body.theme-light .btn-ctrl-hero-stepper:hover,
  [data-theme="light"] .btn-ctrl-hero-stepper:hover {
    background: #f1f5f9;
    color: #0f172a !important;
  }
  body.theme-light .hero-speed-val,
  [data-theme="light"] .hero-speed-val {
    color: #b45309;
  }
  ```

### 2.4 Bug Item 4: Focus Sentinel & Sleep Sentinel Presets/Buttons
- **Target Selectors:**
  - `body.theme-light .dash-sleep-preset-btn, [data-theme="light"] .dash-sleep-preset-btn`
  - `body.theme-light .dash-focus-preset-btn, [data-theme="light"] .dash-focus-preset-btn`
  - `body.theme-light .dash-sleep-extender-btn, [data-theme="light"] .dash-sleep-extender-btn`
  - `body.theme-light .btn-sleep-secondary, [data-theme="light"] .btn-sleep-secondary`
- **Technical Specification:**
  ```css
  body.theme-light .dash-sleep-preset-btn,
  [data-theme="light"] .dash-sleep-preset-btn {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #1e293b !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }
  body.theme-light .dash-sleep-preset-btn:hover,
  [data-theme="light"] .dash-sleep-preset-btn:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a !important;
  }
  body.theme-light .dash-sleep-preset-btn.active,
  [data-theme="light"] .dash-sleep-preset-btn.active {
    background: rgba(14, 165, 233, 0.15);
    border-color: #0284c7;
    color: #0369a1 !important;
    box-shadow: 0 0 8px rgba(14, 165, 233, 0.25);
  }
  body.theme-light .dash-focus-preset-btn,
  [data-theme="light"] .dash-focus-preset-btn {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #1e293b !important;
  }
  body.theme-light .dash-focus-preset-btn:hover,
  [data-theme="light"] .dash-focus-preset-btn:hover {
    background: #f1f5f9;
    border-color: #10b981;
    color: #0f172a !important;
  }
  body.theme-light .dash-focus-preset-btn.active,
  [data-theme="light"] .dash-focus-preset-btn.active {
    background: rgba(16, 185, 129, 0.15);
    border-color: #10b981;
    color: #047857 !important;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
  }
  body.theme-light .dash-sleep-extender-btn,
  [data-theme="light"] .dash-sleep-extender-btn {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.35);
    color: #4338ca !important;
  }
  body.theme-light .dash-sleep-extender-btn:hover,
  [data-theme="light"] .dash-sleep-extender-btn:hover {
    background: rgba(99, 102, 241, 0.2);
    color: #312e81 !important;
  }
  body.theme-light .btn-sleep-secondary,
  [data-theme="light"] .btn-sleep-secondary {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155 !important;
  }
  body.theme-light .btn-sleep-secondary:hover,
  [data-theme="light"] .btn-sleep-secondary:hover {
    background: #f1f5f9;
    color: #0f172a !important;
  }
  ```

### 2.5 Bug Item 5: Ambient Soundscapes & Sound Card Containers
- **Target Selectors:**
  - `body.theme-light .sleep-soundscape-panel, [data-theme="light"] .sleep-soundscape-panel`
  - `body.theme-light .focus-soundscape-panel, [data-theme="light"] .focus-soundscape-panel`
  - `body.theme-light .soundscape-title, [data-theme="light"] .soundscape-title`
  - `body.theme-light .soundscape-select, [data-theme="light"] .soundscape-select`
  - `body.theme-light .btn-soundscape-play, [data-theme="light"] .btn-soundscape-play`
- **Technical Specification:**
  ```css
  body.theme-light .sleep-soundscape-panel,
  [data-theme="light"] .sleep-soundscape-panel,
  body.theme-light .focus-soundscape-panel,
  [data-theme="light"] .focus-soundscape-panel {
    background: rgba(241, 245, 249, 0.7);
    border: 1px solid #cbd5e1;
  }
  body.theme-light .soundscape-title,
  [data-theme="light"] .soundscape-title {
    color: #0f172a;
    font-weight: 700;
  }
  body.theme-light .soundscape-select,
  [data-theme="light"] .soundscape-select {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #0f172a;
  }
  body.theme-light .btn-soundscape-play,
  [data-theme="light"] .btn-soundscape-play {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #0f172a;
  }
  ```

### 2.6 Bug Item 6: Power-Nap Card & Duration Controls
- **Target Selectors:**
  - `body.theme-light .sleep-power-nap-banner, [data-theme="light"] .sleep-power-nap-banner`
  - `body.theme-light .power-nap-title, [data-theme="light"] .power-nap-title`
  - `body.theme-light .power-nap-desc, [data-theme="light"] .power-nap-desc`
  - `body.theme-light .btn-power-nap, [data-theme="light"] .btn-power-nap`
- **Technical Specification:**
  ```css
  body.theme-light .sleep-power-nap-banner,
  [data-theme="light"] .sleep-power-nap-banner {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
    border: 1px solid rgba(168, 85, 247, 0.35);
  }
  body.theme-light .power-nap-title,
  [data-theme="light"] .power-nap-title {
    color: #1e1b4b !important;
    font-weight: 700;
  }
  body.theme-light .power-nap-desc,
  [data-theme="light"] .power-nap-desc {
    color: #475569 !important;
  }
  body.theme-light .btn-power-nap,
  [data-theme="light"] .btn-power-nap {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }
  ```

### 2.7 Bug Item 7: Sleep Cutoff Sentinel Toggle Cards
- **Target Selectors:**
  - `body.theme-light .dash-sleep-toggle-row, [data-theme="light"] .dash-sleep-toggle-row`
  - `body.theme-light .dash-sleep-toggle-row:hover, [data-theme="light"] .dash-sleep-toggle-row:hover`
  - `body.theme-light .dash-sleep-toggle-row .toggle-title, [data-theme="light"] .dash-sleep-toggle-row .toggle-title`
  - `body.theme-light .dash-sleep-toggle-row .toggle-desc, [data-theme="light"] .dash-sleep-toggle-row .toggle-desc`
  - `body.theme-light .dash-sleep-toggle-row .dash-sleep-select-sm, [data-theme="light"] .dash-sleep-toggle-row .dash-sleep-select-sm`
  - `body.theme-light .dash-sleep-toggle-row .slider-round, [data-theme="light"] .dash-sleep-toggle-row .slider-round`
- **Technical Specification:**
  ```css
  body.theme-light .dash-sleep-toggle-row,
  [data-theme="light"] .dash-sleep-toggle-row {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  body.theme-light .dash-sleep-toggle-row:hover,
  [data-theme="light"] .dash-sleep-toggle-row:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  body.theme-light .dash-sleep-toggle-row .toggle-title,
  [data-theme="light"] .dash-sleep-toggle-row .toggle-title {
    color: #0f172a !important;
  }
  body.theme-light .dash-sleep-toggle-row .toggle-desc,
  [data-theme="light"] .dash-sleep-toggle-row .toggle-desc {
    color: #64748b !important;
  }
  body.theme-light .dash-sleep-toggle-row .dash-sleep-select-sm,
  [data-theme="light"] .dash-sleep-toggle-row .dash-sleep-select-sm {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #0f172a;
  }
  body.theme-light .dash-sleep-toggle-row .slider-round,
  [data-theme="light"] .dash-sleep-toggle-row .slider-round {
    background-color: #cbd5e1;
    border: 1px solid #94a3b8;
  }
  ```

### 2.8 Bug Item 8: Blacklist Pattern Empty State
- **Target Selectors:**
  - `body.theme-light .blacklist-chips-grid, [data-theme="light"] .blacklist-chips-grid`
  - `body.theme-light .blacklist-chips-grid:empty::before, [data-theme="light"] .blacklist-chips-grid:empty::before`
  - `body.theme-light .blacklist-chip, [data-theme="light"] .blacklist-chip`
  - `body.theme-light .btn-remove-chip, [data-theme="light"] .btn-remove-chip`
  - `body.theme-light .blacklist-purge-divider, [data-theme="light"] .blacklist-purge-divider`
- **Technical Specification:**
  ```css
  body.theme-light .blacklist-chips-grid,
  [data-theme="light"] .blacklist-chips-grid {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  body.theme-light .blacklist-chips-grid:empty::before,
  [data-theme="light"] .blacklist-chips-grid:empty::before {
    color: #64748b !important;
  }
  body.theme-light .blacklist-chip,
  [data-theme="light"] .blacklist-chip {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #dc2626 !important;
    box-shadow: 0 1px 4px rgba(239, 68, 68, 0.08);
  }
  body.theme-light .blacklist-chip:hover,
  [data-theme="light"] .blacklist-chip:hover {
    background: rgba(239, 68, 68, 0.18);
    border-color: rgba(239, 68, 68, 0.6);
  }
  body.theme-light .btn-remove-chip,
  [data-theme="light"] .btn-remove-chip {
    color: #b91c1c !important;
  }
  body.theme-light .blacklist-purge-divider,
  [data-theme="light"] .blacklist-purge-divider {
    background: #e2e8f0;
  }
  ```

### 2.9 Bug Item 9: Danger Zone Action Cards
- **Target Selectors:**
  - `body.theme-light .settings-card.danger-card, [data-theme="light"] .settings-card.danger-card`
  - `body.theme-light .danger-warning-notice, [data-theme="light"] .danger-warning-notice`
  - `body.theme-light .warning-text, [data-theme="light"] .warning-text`
  - `body.theme-light .danger-action-item, [data-theme="light"] .danger-action-item`
  - `body.theme-light .danger-action-item.highlight-danger, [data-theme="light"] .danger-action-item.highlight-danger`
  - `body.theme-light .danger-action-title, [data-theme="light"] .danger-action-title`
  - `body.theme-light .danger-action-desc, [data-theme="light"] .danger-action-desc`
  - `body.theme-light .btn-danger-outline, [data-theme="light"] .btn-danger-outline`
- **Technical Specification:**
  ```css
  body.theme-light .settings-card.danger-card,
  [data-theme="light"] .settings-card.danger-card {
    background: linear-gradient(135deg, rgba(254, 242, 242, 0.8), rgba(255, 255, 255, 0.95));
    border-color: rgba(239, 68, 68, 0.3);
  }
  body.theme-light .danger-warning-notice,
  [data-theme="light"] .danger-warning-notice {
    background: rgba(254, 226, 226, 0.7);
    border: 1px solid rgba(239, 68, 68, 0.35);
  }
  body.theme-light .warning-text,
  [data-theme="light"] .warning-text {
    color: #991b1b !important;
  }
  body.theme-light .danger-action-item,
  [data-theme="light"] .danger-action-item {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  body.theme-light .danger-action-item.highlight-danger,
  [data-theme="light"] .danger-action-item.highlight-danger {
    background: rgba(254, 242, 242, 0.7);
    border-color: rgba(239, 68, 68, 0.4);
  }
  body.theme-light .danger-action-title,
  [data-theme="light"] .danger-action-title {
    color: #0f172a;
  }
  body.theme-light .danger-action-desc,
  [data-theme="light"] .danger-action-desc {
    color: #64748b;
  }
  body.theme-light .btn-danger-outline,
  [data-theme="light"] .btn-danger-outline {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #dc2626 !important;
  }
  body.theme-light .btn-danger-outline:hover,
  [data-theme="light"] .btn-danger-outline:hover {
    background: rgba(239, 68, 68, 0.16);
    border-color: #dc2626;
    color: #b91c1c !important;
  }
  ```

### 2.10 Bug Item 10: Data Export Cards
- **Target Selectors:**
  - `body.theme-light .export-tile, [data-theme="light"] .export-tile`
  - `body.theme-light .export-tile:hover, [data-theme="light"] .export-tile:hover`
  - `body.theme-light .export-tile-title, [data-theme="light"] .export-tile-title`
  - `body.theme-light .export-tile-desc, [data-theme="light"] .export-tile-desc`
  - `body.theme-light .btn-export-tile, [data-theme="light"] .btn-export-tile`
  - `body.theme-light .btn-export-tile:hover, [data-theme="light"] .btn-export-tile:hover`
  - `body.theme-light .btn-export-tile.primary, [data-theme="light"] .btn-export-tile.primary`
- **Technical Specification:**
  ```css
  body.theme-light .export-tile,
  [data-theme="light"] .export-tile {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  body.theme-light .export-tile:hover,
  [data-theme="light"] .export-tile:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  body.theme-light .export-tile-title,
  [data-theme="light"] .export-tile-title {
    color: #0f172a;
  }
  body.theme-light .export-tile-desc,
  [data-theme="light"] .export-tile-desc {
    color: #475569;
  }
  body.theme-light .btn-export-tile,
  [data-theme="light"] .btn-export-tile {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #0f172a !important;
  }
  body.theme-light .btn-export-tile:hover,
  [data-theme="light"] .btn-export-tile:hover {
    background: #ffffff;
    border-color: #94a3b8;
    color: #0f172a !important;
  }
  body.theme-light .btn-export-tile.primary,
  [data-theme="light"] .btn-export-tile.primary {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
    border-color: rgba(16, 185, 129, 0.45);
    color: #047857 !important;
  }
  ```

---

## 🔒 3. Invariants & Security Controls

1. **Dark Mode Zero-Mutation Invariant:**
   - Under no circumstances may any CSS rule lacking a `body.theme-light` or `[data-theme="light"]` ancestor selector be added or modified in existing stylesheets.
2. **UTF-8 with BOM Standard:**
   - All touched files must be encoded with `0xEF, 0xBB, 0xBF` byte order mark.
3. **No Unsafe HTML/JS Injections:**
   - Zero dynamic DOM injections. All styling achieved strictly through declarative CSS.
