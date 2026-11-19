# Phase 2: CSS Zero-Scroll Layout & Smooth Grid Transitions

> **Phase Identifier:** `phase_02_css_animations_and_zero_scroll`  
> **Target Subsystems:** `popup/styles/tabs/tab_sleep.css`, `popup/styles/tabs/tab_wellness.css`, `popup/popup.css`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Lead Department:** Dept 04: UI/UX Design System & Dept 05: Frontend Engineering  

---

## 🎯 1. Phase Objective
Implement the zero-scroll layout styles and 60fps hardware-accelerated collapsible drawer transitions in `popup/styles/tabs/tab_sleep.css`, `popup/styles/tabs/tab_wellness.css`, and `popup/popup.css`. Ensure default collapsed height eliminates vertical scrolling in the popup window, while expanded state animates smoothly using CSS Grid row interpolation (`grid-template-rows: 0fr -> 1fr`).

---

## 📋 2. Prerequisites & Dependencies
- Phase 1 markup changes are committed and verified.
- Target stylesheets:
  - `popup/styles/tabs/tab_sleep.css`
  - `popup/styles/tabs/tab_wellness.css`
  - `popup/popup.css`

---

## 🔧 3. Surgical Implementation Steps

### 3.1 Drawer Container & CSS Grid Animation Rules
In `popup/styles/tabs/tab_sleep.css` and `popup/styles/tabs/tab_wellness.css` (or centralized in `popup/popup.css`):
```css
/* ==========================================================================
   Collapsible Settings Drawer Architecture (Zero-Scroll Pattern)
   ========================================================================== */
.popup-settings-drawer {
  margin-top: 8px;
  border: 1px solid var(--border-dim, rgba(255, 255, 255, 0.08));
  border-radius: 8px;
  background: var(--bg-card, rgba(18, 24, 38, 0.65));
  transition: border-color 200ms ease, background 200ms ease;
  overflow: hidden;
}

.popup-settings-drawer:hover {
  border-color: rgba(255, 255, 255, 0.16);
}

.popup-settings-drawer.open {
  border-color: rgba(129, 140, 248, 0.3);
  background: var(--bg-card-active, rgba(18, 24, 38, 0.85));
}

.drawer-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: background 180ms ease;
}

.drawer-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.04);
}

.drawer-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.drawer-icon {
  font-size: 12px;
}

.drawer-title {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-secondary, #94a3b8);
  transition: color 180ms ease;
}

.drawer-toggle-btn:hover .drawer-title,
.popup-settings-drawer.open .drawer-title {
  color: var(--text-primary, #f1f5f9);
}

.drawer-chevron {
  font-size: 10px;
  color: var(--text-muted, #64748b);
  display: inline-block;
  transform: rotate(0deg);
  transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease;
}

.popup-settings-drawer.open .drawer-chevron {
  transform: rotate(180deg);
  color: var(--text-secondary, #94a3b8);
}

/* 60fps Fluid Grid Transition */
.drawer-expandable-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.popup-settings-drawer.open .drawer-expandable-wrap {
  grid-template-rows: 1fr;
}

.drawer-inner-content {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  padding: 0 4px;
  transition: opacity 200ms ease, padding 280ms ease;
}

.popup-settings-drawer.open .drawer-inner-content {
  opacity: 1;
  padding: 4px 4px 8px 4px;
}
```

### 3.2 Zero-Scroll Popup Height Adjustment
Ensure `#viewSleepPane` and `#viewFocusPane` have clean overflow rules:
```css
#viewSleepPane, #viewFocusPane {
  overflow-y: auto;
  max-height: 540px;
  scrollbar-width: thin;
}
```

---

## 🛡️ 4. Constraints & Boundaries
- Maintain 100% theme compatibility (both cyber-dark default and light mode).
- Ensure `@media (prefers-reduced-motion: reduce)` disables animations.
- Preserve UTF-8 with BOM standard.

---

## 📦 5. Expected Deliverables
- Updated stylesheets with drawer styles and zero-scroll rules.

---

## 🚦 6. Verification Gate
```bash
node -e "
const fs = require('fs');
const css = fs.readFileSync('popup/styles/tabs/tab_sleep.css', 'utf8') + fs.readFileSync('popup/styles/tabs/tab_wellness.css', 'utf8') + fs.readFileSync('popup/popup.css', 'utf8');
const reqSelectors = ['.popup-settings-drawer', '.drawer-toggle-btn', '.drawer-chevron', '.drawer-expandable-wrap', '.drawer-inner-content'];
reqSelectors.forEach(sel => { if (!css.includes(sel)) throw new Error('Missing CSS selector: ' + sel); });
console.log('✅ Phase 2 Verification Passed: CSS Selectors verified');
"
```
