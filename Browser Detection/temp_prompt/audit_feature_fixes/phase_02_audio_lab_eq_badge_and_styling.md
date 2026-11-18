# Phase 02: Audio Lab EQ Preset Badge & Cyber-Dark Styling

> **Phase:** 02  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Target Subsystems:** `dashboard/dashboard.html`, `dashboard/styles/audio_lab.css`, `dashboard/dashboard.css`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Skill Prerequisites:** `frontend-patterns`, `make-interfaces-feel-better`  

---

## 🎯 Phase Objective
Add the missing `<span id="audioLabPresetBadge" class="badge-eq-preset">Flat</span>` element to the Equalizer card header in `dashboard/dashboard.html` and define high-contrast cyber-dark and light-mode styles in `dashboard/styles/audio_lab.css` and `dashboard/dashboard.css`.

---

## 📋 Required Modifications

### Step 1: Markup Addition in `dashboard/dashboard.html` (around L967)
Locate `.eq-card-header .eq-actions-group`:
```html
<div class="eq-actions-group">
  <span id="audioLabPresetBadge" class="badge-eq-preset" aria-label="Active Equalizer Preset">Flat</span>
  <select id="audioEqPresetSelect" class="eq-preset-dropdown" aria-label="Equalizer Preset">
```

---

### Step 2: Styling in `dashboard/styles/audio_lab.css` & `dashboard/dashboard.css`
Add the following rule set under `.eq-actions-group`:
```css
.badge-eq-preset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: var(--mono-font, 'JetBrains Mono', monospace);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

body.theme-light .badge-eq-preset {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: #059669;
  box-shadow: none;
}
```

---

## 🔒 Constitutional Constraints
1. **UTF-8 with BOM:** Preserve `0xEF, 0xBB, 0xBF`.
2. **Trusted Types & Semantic HTML:** No inline script or unsafe HTML injections.
3. **Responsive Verification:** Ensure badge does not wrap awkwardly on mobile viewports.

---

## 🧪 Local Verification Gate
Run:
```powershell
node -e "const fs = require('fs'); const h = fs.readFileSync('dashboard/dashboard.html', 'utf8'); if (!h.includes('id=\"audioLabPresetBadge\"')) throw new Error('Badge not found in HTML'); console.log('HTML Gate PASS');"
```
Ensure exit code 0.
