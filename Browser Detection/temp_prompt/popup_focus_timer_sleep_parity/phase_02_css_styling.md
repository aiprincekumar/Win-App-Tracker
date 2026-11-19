# Phase 2: CSS Cyber-Dark Glass Styling Specification

> **Phase Identifier:** `PHASE-02-CSS-STYLING`  
> **Parent Task:** `TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002`  
> **Target Subagent:** Level 4 Frontend Subagent (`frontend_engineer`)  
> **Target Files:** `popup/popup.css`, `popup/styles/tabs/tab_wellness.css`  
> **Lead Department:** Department 05 (Frontend Engineering)  

---

## 🎯 1. Phase Objective

Implement cohesive, cyber-dark glass styling for all new Focus Block components matching `tab_sleep.css` and the design tokens established in `DESIGN.md`:
1. Style `.popup-focus-target-text` and `#popupFocusDialFinishTime` inside the radial dial overlay.
2. Style `.popup-focus-quick-actions-row` and `.popup-focus-action-btn` (-5m, +5m, +15m, toggle, reset).
3. Style `.focus-section-card`, `.focus-tab-presets-grid`, and `.focus-tab-preset-btn` with active emerald glow.
4. Style `.focus-custom-input-row`, `.focus-custom-input-wrap`, and `.btn-focus-set-custom`.
5. Provide complete Light Mode overrides (`[data-theme="light"]`) for high contrast readability.

---

## 🎨 2. Concrete CSS Rules to Implement

### 2.1 Styling in `popup/styles/tabs/tab_wellness.css`
Append or update the following scoped styles:

```css
/* ==========================================================================
   Focus Block Sleep-Parity Enhancements
   ========================================================================== */

/* Target Time Overlay inside Dial */
.popup-focus-target-text {
  font-size: 9.5px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.3px;
  margin: 1px 0 2px 0;
  text-align: center;
}

/* Quick Actions Row */
.popup-focus-quick-actions-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 6px;
  width: 100%;
  flex-wrap: wrap;
}

.popup-focus-action-btn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(30, 41, 59, 0.7);
  color: var(--text-primary, #f1f5f9);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s ease;
  user-select: none;
}

.popup-focus-action-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.popup-focus-action-btn:active {
  transform: scale(0.96);
}

.popup-focus-action-btn.primary {
  background: linear-gradient(135deg, #059669, #10b981);
  border-color: #10b981;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
  min-width: 64px;
}

.popup-focus-action-btn.primary:hover {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.popup-focus-action-btn.extend {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: #a7f3d0;
}

.popup-focus-action-btn.extend:hover {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(16, 185, 129, 0.5);
  color: #ffffff;
}

.popup-focus-action-btn.reset {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.popup-focus-action-btn.reset:hover {
  background: rgba(239, 68, 68, 0.22);
  border-color: rgba(239, 68, 68, 0.5);
  color: #ffffff;
}

/* Presets & Custom Duration Card */
.focus-section-card {
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.focus-tab-presets-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
}

.focus-tab-preset-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary, #94a3b8);
  border-radius: 6px;
  padding: 4px 2px;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.focus-tab-preset-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.focus-tab-preset-btn.active {
  background: rgba(16, 185, 129, 0.25);
  border-color: #10b981;
  color: #6ee7b7;
  font-weight: 700;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

/* Custom Input Row */
.focus-custom-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
  font-size: 10.5px;
}

.focus-custom-label {
  color: var(--text-secondary, #94a3b8);
  font-weight: 500;
}

.focus-custom-input-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
}

.focus-custom-input {
  width: 85px;
  padding: 3px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-dim, rgba(255, 255, 255, 0.15));
  color: var(--text-primary, #ffffff);
  font-size: 11px;
  text-align: center;
  outline: none;
}

.focus-custom-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.3);
}

.btn-focus-set-custom {
  padding: 3px 10px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #a7f3d0;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-focus-set-custom:hover {
  background: rgba(16, 185, 129, 0.4);
  color: #ffffff;
}
```

### 2.2 Light Mode Overrides
Ensure light mode is accommodated in `popup/styles/themes/light_contrast.css` or `popup/popup.css`:
```css
[data-theme="light"] .popup-focus-card,
[data-theme="light"] .focus-section-card {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

[data-theme="light"] .popup-focus-target-text {
  color: #64748b;
}

[data-theme="light"] .focus-tab-preset-btn {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

[data-theme="light"] .focus-tab-preset-btn.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #059669;
  color: #065f46;
}

[data-theme="light"] .focus-custom-input {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}
```

---

## 🚦 3. Local Verification Gate
Execute CSS validation check:
Ensure no unclosed braces, invalid syntax, or conflicting rules.
