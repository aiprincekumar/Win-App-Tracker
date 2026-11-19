# Phase 1: CSS Architecture & Design Tokens Specification

> **Phase Identifier:** `PHASE-01-CSS-TOKENS`  
> **Task:** Sleep Cutoff Sentinel & Power Automation Redesign  
> **Target Files:**
> - `dashboard/styles/wellbeing_blacklist.css`
> - `dashboard/styles/focus_sleep_advanced.css`
> - `dashboard/dashboard.css`  
> **Target Sub-Agent:** Level 4 Frontend Engineer  
> **Pre-requisite:** Manager Authorization Token (`AUTH-MGR-*`)

---

## 🎯 1. Phase Objective
Establish the CSS classes and responsive grid rules for `.dash-sleep-toggles-container`, `.dash-sleep-toggle-row`, and `.dash-sleep-select-row` to match the Focus Settings redesign (`.dash-focus-toggles-container` and `.dash-focus-toggle-row`). Provide medium-compact ergonomics, cyber-dark glassmorphism, subtle hover elevation, and clean select styling.

---

## 📂 2. Prerequisites & File Anchors
- **`dashboard/styles/wellbeing_blacklist.css`:** Inspect lines 825-982 where `.dash-focus-toggles-container` is defined.
- **`dashboard/styles/focus_sleep_advanced.css`:** Inspect lines 8-30 where `.controls-2col-grid` is defined.
- **`dashboard/dashboard.css`:** Inspect wellbeing and sleep rule aggregations.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1.1: Define Sleep Toggle Container & Row Rules in `wellbeing_blacklist.css`
Directly below the Focus Toggles block, add the dedicated Sleep Toggles block:
```css
/* =============================================================================
   Sleep Cutoff Sentinel & Power Automation 2-Column Grid (Medium Compact UI/UX)
   ============================================================================= */
.dash-sleep-toggles-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .dash-sleep-toggles-container {
    grid-template-columns: 1fr;
  }
}

.dash-sleep-toggle-row,
.dash-sleep-select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 52px;
  box-sizing: border-box;
}

.dash-sleep-toggle-row:hover,
.dash-sleep-select-row:hover {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dash-sleep-toggle-row .toggle-text-group,
.dash-sleep-select-row .toggle-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.dash-sleep-toggle-row .toggle-title,
.dash-sleep-select-row .toggle-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.dash-sleep-toggle-row .toggle-desc,
.dash-sleep-select-row .toggle-desc {
  font-size: 10.5px;
  line-height: 1.35;
  color: var(--text-muted, #94a3b8);
}

.dash-sleep-select-row select.dash-sleep-select-sm {
  max-width: 155px;
  flex-shrink: 0;
  font-size: 11.5px;
  padding: 4px 8px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: var(--text-primary, #f1f5f9);
}

.dash-sleep-toggle-row .switch-toggle {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
  flex-shrink: 0;
  cursor: pointer;
}

.dash-sleep-toggle-row .switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dash-sleep-toggle-row .slider-round {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.14);
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dash-sleep-toggle-row .slider-round:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #ffffff;
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.dash-sleep-toggle-row .switch-input:checked + .slider-round {
  background: linear-gradient(135deg, var(--accent-emerald, #10b981) 0%, #059669 100%);
  border-color: rgba(16, 185, 129, 0.6);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.45);
}

.dash-sleep-toggle-row .switch-input:checked + .slider-round:before {
  transform: translateX(20px);
}

.dash-sleep-toggle-row .switch-input:focus-visible + .slider-round {
  box-shadow: 0 0 0 2px var(--accent-cyan, #06b6d4), 0 0 10px rgba(6, 182, 212, 0.4);
}
```

### Step 1.2: Mirror Synchronously into `dashboard/styles/focus_sleep_advanced.css` and `dashboard/dashboard.css`
Ensure all three stylesheets remain consistent and free of syntax errors.

### Step 1.3: Preserve UTF-8 with BOM
Ensure `wellbeing_blacklist.css`, `focus_sleep_advanced.css`, and `dashboard.css` are saved with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 4. Architectural Boundaries
- DO NOT touch HTML DOM in this phase.
- DO NOT remove or modify existing `.control-toggle-item` rules if other legacy widgets still reference them.

---

## ✅ 5. Local Verification Gate
- Verify CSS files contain `.dash-sleep-toggles-container` and `.dash-sleep-toggle-row`.
- Run: `node tests/test_ui_container_split_focus_sleep.js` (Must PASS with exit code 0).
