# Technical Requirements Document (TRD): Collapsible Drawer Layout Architecture

> **Document Type:** Technical Requirements Document  
> **Workspace Container:** `temp_prompt/popup_drawer_collapsed_empty_box_fix/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Departments:** Dept 04 (Architecture), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  

---

## 🏗️ 1. CSS Flexbox & Grid Architecture

### 1.1 The Layout Model
In the popup viewport, `#viewSleepPane` and `#viewFocusPane` use:
```css
display: flex;
flex-direction: column;
flex: 1 1 auto;
min-height: 0;
max-height: 475px;
```
Inside `#viewSleepPane`:
1. Top child: `#cardSleepHeroRing` has `flex-shrink: 0;` (~280px).
2. Bottom child: `#sleepSettingsDrawer.popup-settings-drawer`.

### 1.2 The Defect Mechanism
Previously:
```css
#sleepSettingsDrawer.popup-settings-drawer {
  flex: 1; /* <-- FORCES CONTAINER TO GROW INTO ALL REMAINING SPACE (195px) */
  min-height: 0;
}
```
When collapsed:
- `.drawer-expandable-wrap` has `grid-template-rows: 0fr;` (height: 0px).
- `.drawer-toggle-btn` has height: ~34px.
- But `.popup-settings-drawer` container height is forced to 195px by `flex: 1`.
- The background (`background: var(--bg-card)`) and border enclose this 195px box, creating ~160px of dead dark box.

### 1.3 The Surgical Correction
```css
/* Collapsed state: natural tight hug */
#sleepSettingsDrawer.popup-settings-drawer,
#focusSettingsDrawer.popup-settings-drawer,
.popup-settings-drawer {
  flex: 0 0 auto;
  min-height: 0;
}

/* Open state: flex to fill remaining space bounded by max-height */
#sleepSettingsDrawer.popup-settings-drawer.open,
#focusSettingsDrawer.popup-settings-drawer.open,
.popup-settings-drawer.open {
  flex: 1 1 auto;
}
```

---

## 🧪 2. Automated Test Specification

In `tests/test_popup_drawer_docking_and_scrollbar_fix.js`:
- **Battery 2 (Assertion 3 Update):**
  - Verify `#focusSettingsDrawer.popup-settings-drawer` has `flex: 0 0 auto;` (or zero-stretch).
  - Verify `#focusSettingsDrawer.popup-settings-drawer.open` has `flex: 1` or `flex: 1 1 auto`.
- **Battery 2 (Assertion 4 New):**
  - Verify `#sleepSettingsDrawer.popup-settings-drawer` has `flex: 0 0 auto;`.
  - Verify `#sleepSettingsDrawer.popup-settings-drawer.open` has `flex: 1` or `flex: 1 1 auto`.
