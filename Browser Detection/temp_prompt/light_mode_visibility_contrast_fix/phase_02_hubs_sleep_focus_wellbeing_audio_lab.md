# Phase 2 Execution Instruction: Hubs — Sleep, Focus, Wellbeing & Audio Lab

> **Phase Number:** 02  
> **Phase Name:** Hubs — Sleep, Focus, Wellbeing & Audio Lab (Bugs 4, 5, 6, 7)  
> **Workspace Container:** `temp_prompt/light_mode_visibility_contrast_fix/`  
> **Target Subsystems:** Focus Sentinel Presets, Sleep Sentinel Presets, Ambient Soundscape Panels, Bedtime Power-Nap Banner, Sleep Cutoff Sentinel Toggles & Selects  
> **Target Files:**
> - `dashboard/styles/focus_sleep_advanced.css`
> - `dashboard/styles/wellbeing_blacklist.css`
> - `dashboard/styles/themes.css`
> - `dashboard/dashboard.css`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Prerequisites:** Successful completion of Phase 1; Active Authorization Token `AUTH-MGR-*`  

---

## 🎯 1. Phase Objective

Surgically enhance Light Mode (`body.theme-light`, `[data-theme="light"]`) contrast and visibility for:
1. **Bug 4: Focus & Sleep Sentinel Presets/Buttons:** Replace hardcoded pale slate text `#cbd5e1` in `.dash-sleep-preset-btn` and dark slate backgrounds in `.dash-focus-preset-btn` with crisp white button surfaces, `#1e293b` text (contrast > 13:1), and high-contrast active states.
2. **Bug 5: Ambient Soundscapes:** Replace dark slate `rgba(15, 23, 42, 0.5)` containers in `.sleep-soundscape-panel` and `.focus-soundscape-panel` with subtle light glass surfaces (`rgba(241, 245, 249, 0.7)`), `#0f172a` title text, and white select dropdowns.
3. **Bug 6: Power-Nap Card & Duration Controls:** Replace washed-out light gray text `#e2e8f0` and `#94a3b8` in `.sleep-power-nap-banner` with deep indigo title `#1e1b4b` and slate description `#475569`.
4. **Bug 7: Sleep Cutoff Sentinel Toggle Cards:** Replace dark background `rgba(15, 23, 42, 0.45)` in `.dash-sleep-toggle-row` and dark select boxes `rgba(15, 23, 42, 0.85)` with clean white cards, dark titles `#0f172a`, and white select dropdowns.

---

## 🔗 2. Technical Context & File Anchors

- `dashboard/styles/focus_sleep_advanced.css#L281-L320`: `.sleep-power-nap-banner`, `.power-nap-title`, `.power-nap-desc`.
- `dashboard/styles/focus_sleep_advanced.css#L342-L352`: `.sleep-soundscape-panel` has hardcoded `background: rgba(15, 23, 42, 0.5)`.
- `dashboard/styles/focus_sleep_advanced.css#L383-L503`: `.dash-sleep-toggle-row`, `.toggle-title`, `.toggle-desc`, `.dash-sleep-select-sm`.
- `dashboard/styles/wellbeing_blacklist.css#L712-L737`: `.dash-focus-preset-btn` has `background: rgba(15, 23, 42, 0.6)`.
- `dashboard/dashboard.css#L9125-L9240`: `.dash-sleep-preset-btn` has `color: #cbd5e1;`, `.dash-sleep-extender-btn` has `color: #c7d2fe;`, `.btn-sleep-secondary` has `color: #cbd5e1;`.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 2.1: Focus & Sleep Presets / Extender Buttons Fix
In `dashboard/styles/focus_sleep_advanced.css` and `dashboard/styles/themes.css`:
```css
/* Light Mode Sleep Sentinel Presets & Buttons */
body.theme-light .dash-sleep-preset-btn,
[data-theme="light"] .dash-sleep-preset-btn {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .dash-sleep-preset-btn:hover,
[data-theme="light"] .dash-sleep-preset-btn:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
}

body.theme-light .dash-sleep-preset-btn.active,
[data-theme="light"] .dash-sleep-preset-btn.active {
  background: rgba(14, 165, 233, 0.15) !important;
  border-color: #0284c7 !important;
  color: #0369a1 !important;
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.25) !important;
}

body.theme-light .dash-sleep-extender-btn,
[data-theme="light"] .dash-sleep-extender-btn {
  background: rgba(99, 102, 241, 0.1) !important;
  border: 1px solid rgba(99, 102, 241, 0.35) !important;
  color: #4338ca !important;
}

body.theme-light .dash-sleep-extender-btn:hover,
[data-theme="light"] .dash-sleep-extender-btn:hover {
  background: rgba(99, 102, 241, 0.2) !important;
  color: #312e81 !important;
}

body.theme-light .btn-sleep-secondary,
[data-theme="light"] .btn-sleep-secondary {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
}

body.theme-light .btn-sleep-secondary:hover,
[data-theme="light"] .btn-sleep-secondary:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

/* Light Mode Focus Sentinel Presets */
body.theme-light .dash-focus-preset-btn,
[data-theme="light"] .dash-focus-preset-btn {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .dash-focus-preset-btn:hover,
[data-theme="light"] .dash-focus-preset-btn:hover {
  background: #f1f5f9 !important;
  border-color: #10b981 !important;
  color: #0f172a !important;
}

body.theme-light .dash-focus-preset-btn.active,
[data-theme="light"] .dash-focus-preset-btn.active {
  background: rgba(16, 185, 129, 0.15) !important;
  border-color: #10b981 !important;
  color: #047857 !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.25) !important;
}
```

### Step 2.2: Ambient Soundscapes Panel Fix
In `dashboard/styles/focus_sleep_advanced.css` and `dashboard/styles/themes.css`:
```css
/* Light Mode Ambient Soundscape Panels */
body.theme-light .sleep-soundscape-panel,
body.theme-light .focus-soundscape-panel,
[data-theme="light"] .sleep-soundscape-panel,
[data-theme="light"] .focus-soundscape-panel {
  background: rgba(241, 245, 249, 0.7) !important;
  border: 1px solid #cbd5e1 !important;
}

body.theme-light .soundscape-title,
[data-theme="light"] .soundscape-title {
  color: #0f172a !important;
  font-weight: 700 !important;
}

body.theme-light .soundscape-select,
[data-theme="light"] .soundscape-select {
  background-color: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .btn-soundscape-play,
[data-theme="light"] .btn-soundscape-play {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .btn-soundscape-play:hover,
[data-theme="light"] .btn-soundscape-play:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}
```

### Step 2.3: Power-Nap Card Fix
In `dashboard/styles/focus_sleep_advanced.css`:
```css
/* Light Mode Bedtime Acoustics & Power-Nap Banner */
body.theme-light .sleep-power-nap-banner,
[data-theme="light"] .sleep-power-nap-banner {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%) !important;
  border: 1px solid rgba(168, 85, 247, 0.35) !important;
}

body.theme-light .power-nap-title,
[data-theme="light"] .power-nap-title {
  color: #1e1b4b !important;
  font-weight: 700 !important;
}

body.theme-light .power-nap-desc,
[data-theme="light"] .power-nap-desc {
  color: #475569 !important;
}

body.theme-light .btn-power-nap,
[data-theme="light"] .btn-power-nap {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3) !important;
}
```

### Step 2.4: Sleep Cutoff Sentinel Toggle Cards Fix
In `dashboard/styles/focus_sleep_advanced.css`:
```css
/* Light Mode Sleep Sentinel & Power Automation Toggle Rows */
body.theme-light .dash-sleep-toggle-row,
[data-theme="light"] .dash-sleep-toggle-row {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .dash-sleep-toggle-row:hover,
[data-theme="light"] .dash-sleep-toggle-row:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
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
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .dash-sleep-toggle-row .slider-round,
[data-theme="light"] .dash-sleep-toggle-row .slider-round {
  background-color: #cbd5e1 !important;
  border: 1px solid #94a3b8 !important;
}
```

---

## 🚫 4. Architectural Constraints & Invariants

- **Constitutional Invariant:** DO NOT alter or mutate any Dark Mode rules.
- **UTF-8 with BOM Standard:** Preserve `0xEF, 0xBB, 0xBF` encoding on all edited files.
- **Cascading Safety:** Also append or synchronize corresponding rules in `dashboard/dashboard.css` if necessary to prevent cascade override.

---

## 📦 5. Deliverables Manifest

1. `dashboard/styles/focus_sleep_advanced.css`: Scoped light mode rules for sleep presets, soundscape panel, power-nap banner, toggle rows, and dropdowns.
2. `dashboard/styles/wellbeing_blacklist.css`: Scoped light mode rules for focus presets.
3. `dashboard/styles/themes.css`: Scoped preset and hub tokens.

---

## 🚦 6. Local Verification Gate

Execute verification check:
```powershell
node -e "
const fs = require('fs');
const adv = fs.readFileSync('dashboard/styles/focus_sleep_advanced.css', 'utf8');
const wb = fs.readFileSync('dashboard/styles/wellbeing_blacklist.css', 'utf8');
console.assert(adv.includes('body.theme-light .dash-sleep-preset-btn'), 'Sleep preset light rule missing');
console.assert(adv.includes('body.theme-light .sleep-power-nap-banner'), 'Power nap light rule missing');
console.assert(adv.includes('body.theme-light .dash-sleep-toggle-row'), 'Sleep toggle light rule missing');
console.assert(wb.includes('body.theme-light .dash-focus-preset-btn') || adv.includes('body.theme-light .dash-focus-preset-btn'), 'Focus preset light rule missing');
console.log('✅ Phase 2 Verification Passed Cleanly');
"
```
Ensure exit code is 0.
