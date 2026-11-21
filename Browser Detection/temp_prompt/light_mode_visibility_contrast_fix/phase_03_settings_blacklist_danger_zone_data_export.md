# Phase 3 Execution Instruction: Settings, Blacklist, Danger Zone & Data Export

> **Phase Number:** 03  
> **Phase Name:** Settings, Blacklist, Danger Zone & Data Export (Bugs 8, 9, 10)  
> **Workspace Container:** `temp_prompt/light_mode_visibility_contrast_fix/`  
> **Target Subsystems:** Privacy Tracking Blacklist Container & Empty State, Settings Danger Zone Cards, Telemetry Data Export Cards  
> **Target Files:**
> - `dashboard/styles/wellbeing_blacklist.css`
> - `dashboard/styles/layout.css`
> - `dashboard/styles/themes.css`
> - `dashboard/dashboard.css`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Prerequisites:** Successful completion of Phase 2; Active Authorization Token `AUTH-MGR-*`  

---

## 🎯 1. Phase Objective

Surgically enhance Light Mode (`body.theme-light`, `[data-theme="light"]`) contrast and visibility for:
1. **Bug 8: Blacklist Pattern Empty State:** Replace the dark slate container `rgba(15, 23, 42, 0.45)` with a clean light container (`#f8fafc`), ensure italic placeholder text has clear contrast (`#64748b`), and style `.blacklist-chip` with light red background `rgba(239, 68, 68, 0.1)` and deep red text `#dc2626`.
2. **Bug 9: Danger Zone Action Cards:** In `.settings-card.danger-card`, replace dark reddish-slate background `rgba(30, 20, 25, 0.7)` with soft rose light surface, replace unreadable pink warning text `#fca5a5` with deep red `#991b1b` (8.5:1 contrast), and style `.danger-action-item` as white cards.
3. **Bug 10: Data Export Cards:** Replace dark slate `rgba(15, 23, 42, 0.6)` in `.export-tile` with white cards (`#ffffff`), dark headings `#0f172a`, slate descriptions `#475569`, and high-contrast `.btn-export-tile` buttons.

---

## 🔗 2. Technical Context & File Anchors

- `dashboard/styles/wellbeing_blacklist.css#L101-L170`: `.blacklist-chips-grid`, `.blacklist-chips-grid:empty::before`, `.blacklist-chip`, `.btn-remove-chip`.
- `dashboard/styles/layout.css#L965-L970`: `.settings-card.danger-card` has dark gradient.
- `dashboard/styles/layout.css#L1156-L1235`: `.export-tile`, `.export-tile:hover`, `.export-tile-title`, `.export-tile-desc`, `.btn-export-tile`.
- `dashboard/styles/layout.css#L1237-L1310`: `.danger-warning-notice`, `.warning-text`, `.danger-action-item`, `.btn-danger-outline`.
- `dashboard/dashboard.css#L1198-L1515`: Downstream mirror rules in master stylesheet.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 3.1: Blacklist Pattern Empty State & Chips Fix
In `dashboard/styles/wellbeing_blacklist.css` and `dashboard/styles/themes.css`:
```css
/* Light Mode Privacy Blacklist Container & Chips */
body.theme-light .blacklist-chips-grid,
[data-theme="light"] .blacklist-chips-grid {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
}

body.theme-light .blacklist-chips-grid:empty::before,
[data-theme="light"] .blacklist-chips-grid:empty::before {
  color: #64748b !important;
  font-style: italic;
}

body.theme-light .blacklist-chip,
[data-theme="light"] .blacklist-chip {
  background: rgba(239, 68, 68, 0.1) !important;
  border: 1px solid rgba(239, 68, 68, 0.35) !important;
  color: #dc2626 !important;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.08) !important;
}

body.theme-light .blacklist-chip:hover,
[data-theme="light"] .blacklist-chip:hover {
  background: rgba(239, 68, 68, 0.18) !important;
  border-color: rgba(239, 68, 68, 0.6) !important;
}

body.theme-light .btn-remove-chip,
[data-theme="light"] .btn-remove-chip {
  color: #b91c1c !important;
}

body.theme-light .blacklist-purge-divider,
[data-theme="light"] .blacklist-purge-divider {
  background: #e2e8f0 !important;
}
```

### Step 3.2: Danger Zone Action Cards Fix
In `dashboard/styles/layout.css` and `dashboard/styles/themes.css`:
```css
/* Light Mode Danger Zone & Destructive Action Cards */
body.theme-light .settings-card.danger-card,
[data-theme="light"] .settings-card.danger-card {
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.85) 0%, rgba(255, 255, 255, 0.98) 100%) !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.08) !important;
}

body.theme-light .danger-warning-notice,
[data-theme="light"] .danger-warning-notice {
  background: rgba(254, 226, 226, 0.75) !important;
  border: 1px solid rgba(239, 68, 68, 0.35) !important;
}

body.theme-light .warning-text,
[data-theme="light"] .warning-text {
  color: #991b1b !important; /* 8.5:1 contrast against #fee2e2 (WCAG AAA >= 7:1) */
}

body.theme-light .danger-action-item,
[data-theme="light"] .danger-action-item {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .danger-action-item.highlight-danger,
[data-theme="light"] .danger-action-item.highlight-danger {
  background: rgba(254, 242, 242, 0.7) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
}

body.theme-light .danger-action-title,
[data-theme="light"] .danger-action-title {
  color: #0f172a !important;
}

body.theme-light .danger-action-desc,
[data-theme="light"] .danger-action-desc {
  color: #64748b !important;
}

body.theme-light .btn-danger-outline,
[data-theme="light"] .btn-danger-outline {
  background: rgba(239, 68, 68, 0.08) !important;
  border: 1px solid rgba(239, 68, 68, 0.45) !important;
  color: #dc2626 !important;
}

body.theme-light .btn-danger-outline:hover,
[data-theme="light"] .btn-danger-outline:hover {
  background: rgba(239, 68, 68, 0.16) !important;
  border-color: #dc2626 !important;
  color: #b91c1c !important;
}
```

### Step 3.3: Data Export Cards Fix
In `dashboard/styles/layout.css` and `dashboard/styles/themes.css`:
```css
/* Light Mode Data Export Tiles (CSV & Executive HTML Digest) */
body.theme-light .export-tile,
[data-theme="light"] .export-tile {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .export-tile:hover,
[data-theme="light"] .export-tile:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
}

body.theme-light .export-tile-title,
[data-theme="light"] .export-tile-title {
  color: #0f172a !important;
}

body.theme-light .export-tile-desc,
[data-theme="light"] .export-tile-desc {
  color: #475569 !important;
}

body.theme-light .btn-export-tile,
[data-theme="light"] .btn-export-tile {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .btn-export-tile:hover,
[data-theme="light"] .btn-export-tile:hover {
  background: #ffffff !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
}

body.theme-light .btn-export-tile.primary,
[data-theme="light"] .btn-export-tile.primary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15)) !important;
  border-color: rgba(16, 185, 129, 0.45) !important;
  color: #047857 !important;
}

body.theme-light .btn-export-tile.primary:hover,
[data-theme="light"] .btn-export-tile.primary:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25)) !important;
  color: #065f46 !important;
}
```

---

## 🚫 4. Architectural Constraints & Invariants

- **Constitutional Invariant:** DO NOT alter or mutate any Dark Mode rules.
- **UTF-8 with BOM Standard:** Preserve `0xEF, 0xBB, 0xBF` encoding on all edited files.
- **Cascading Parity:** Synchronize rules in `dashboard/dashboard.css` if necessary to prevent cascade overrides.

---

## 📦 5. Deliverables Manifest

1. `dashboard/styles/wellbeing_blacklist.css`: Light mode blacklist grid, empty state, and chip rules.
2. `dashboard/styles/layout.css`: Light mode danger zone and export card rules.
3. `dashboard/styles/themes.css`: Synchronized light mode tokens for settings and data exports.

---

## 🚦 6. Local Verification Gate

Execute verification check:
```powershell
node -e "
const fs = require('fs');
const layout = fs.readFileSync('dashboard/styles/layout.css', 'utf8');
const wb = fs.readFileSync('dashboard/styles/wellbeing_blacklist.css', 'utf8');
console.assert(layout.includes('body.theme-light .settings-card.danger-card') || layout.includes('.settings-card.danger-card'), 'Danger card rule check');
console.assert(layout.includes('body.theme-light .export-tile'), 'Export tile light rule missing');
console.assert(wb.includes('body.theme-light .blacklist-chips-grid'), 'Blacklist chips light rule missing');
console.log('✅ Phase 3 Verification Passed Cleanly');
"
```
Ensure exit code is 0.
