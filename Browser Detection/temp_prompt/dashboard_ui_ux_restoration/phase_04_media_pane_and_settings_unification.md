# Phase 04: Media Pane, Settings Unification & CSS Modularization
## Subsystem Execution Specification: Tab Strip, Ambient Canvas & Modular Architecture

> **Phase:** 04 of 04  
> **Task ID:** `TASK-DASHBOARD-UIUX-RESTORE-PHASE-04`  
> **Target Subsystems:** Media Pane Multi-Tab Deck, Audio Visualizer, Settings Cards & CSS Tree  
> **Master Reference:** [`dashboard_ui_ux_restoration_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/styles/*`  
> **Pre-Condition:** Phases 1-3 complete; zero code mutation during prompt stage.  
> **Authorization Token:** `AUTH-MGR-20261117-UIUX-RESTORE-004`  

---

## 🎯 1. Phase 4 Objectives

1. **Convert Multi-Tab Deck into Carousel Chip Strip:** Transform `#multiTabMediaDeck` from bulky stacked cards into a sleek horizontal chip bar (`.media-tab-strip`) docked above the Hero Player.
2. **Embed Ambient Audio Visualizer:** Place `#canvasMediaAudioVisualizer` directly inside the Hero Media card as an ambient backdrop with a clean toggle button, eliminating vertical page sprawl.
3. **Standardize Settings Cards:** Unify all settings cards (Sleep Timer, Backup/Sync, Wellbeing, Daily Budgets, Blacklist) to the `.settings-section-card` token specification with uniform inputs and buttons.
4. **Refactor Modular CSS Architecture:** Eliminate 1466-line bloat dumped into `dashboard.css`. Structure styles into 6 clean domain stylesheets in `dashboard/styles/` imported via clean aggregator rules.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 4.1: Media Tab Strip in `dashboard/dashboard.html`
```html
<!-- RESTORED: Horizontal Media Tab Chip Strip -->
<div id="multiTabMediaDeck" class="media-tab-strip bento-span-12" role="tablist" aria-label="Active Media Tabs">
  <!-- Dynamic media tab chips: [Favicon | Tab Title | Play/Pause | Volume] -->
</div>
```

### Step 4.2: Ambient Hero Canvas in `dashboard/dashboard.html`
Inside `#heroMediaCard`, embed the visualizer canvas behind the controls:
```html
<div class="hero-player-container">
  <!-- Ambient Audio Visualizer Canvas Backdrop -->
  <canvas id="canvasMediaAudioVisualizer" class="hero-ambient-visualizer-canvas" width="600" height="120" aria-hidden="true"></canvas>
  
  <div class="hero-player-content">
    <!-- Existing Hero metadata, title, scrubber, and playback buttons -->
  </div>
</div>
```

### Step 4.3: Unify Settings Form Tokens
In `dashboard/styles/settings.css`:
```css
.settings-section-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: var(--glass-surface-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
  margin-bottom: 1.5rem;
}

.settings-form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.form-control-input {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 150ms ease;
}

.form-control-input:focus {
  border-color: var(--accent-emerald);
  outline: none;
}
```

### Step 4.4: Master `dashboard.css` Modular Aggregator
```css
/* dashboard.css - Clean Modular Aggregator */
@import url('styles/tokens.css');
@import url('styles/layout.css');
@import url('styles/metrics.css');
@import url('styles/tracking.css');
@import url('styles/media.css');
@import url('styles/settings.css');
@import url('styles/components.css');
```

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] Multi-tab media chips render horizontally with 0 CLS.
- [ ] Audio visualizer runs smoothly at 60fps inside hero player with zero layout displacement.
- [ ] All settings forms display identical typography, spacing, inputs, and button hierarchy.
- [ ] `dashboard.css` contains only clean imports or modular overrides with zero duplicate declarations.
- [ ] 100% of workspace test suites (44/44) pass with exit code 0.
