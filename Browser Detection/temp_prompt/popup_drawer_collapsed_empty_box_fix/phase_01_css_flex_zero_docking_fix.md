# Phase 1: CSS Layout & Flex Zero-Docking Fix

> **Phase Identifier:** PHASE-01-CSS-FLEX-ZERO-DOCKING  
> **Workspace Container:** `temp_prompt/popup_drawer_collapsed_empty_box_fix/`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Target Subsystems:** `popup/styles/tabs/tab_sleep.css`, `popup/styles/tabs/tab_wellness.css`, `popup/popup.css`  
> **Lead Department:** Dept 05 Frontend Engineering  

---

## 🎯 1. Phase Objective
Eliminate the empty dark blank box in collapsed settings drawers by switching `#sleepSettingsDrawer`, `#focusSettingsDrawer`, and `.popup-settings-drawer` from unconditional `flex: 1` to `flex: 0 0 auto` when collapsed, while preserving `flex: 1 1 auto; min-height: 0;` when open.

---

## 📋 2. Surgical Step-by-Step Instructions

### Step 1.1: `popup/styles/tabs/tab_sleep.css`
Navigate to `#sleepSettingsDrawer.popup-settings-drawer` (~line 413):
Change:
```css
#sleepSettingsDrawer.popup-settings-drawer {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
```
To:
```css
#sleepSettingsDrawer.popup-settings-drawer {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  min-height: 0;
}

#sleepSettingsDrawer.popup-settings-drawer.open {
  flex: 1 1 auto;
}
```

### Step 1.2: `popup/styles/tabs/tab_wellness.css`
Navigate to `#focusSettingsDrawer.popup-settings-drawer` (~line 784):
Change:
```css
#focusSettingsDrawer.popup-settings-drawer {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
```
To:
```css
#focusSettingsDrawer.popup-settings-drawer {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  min-height: 0;
}

#focusSettingsDrawer.popup-settings-drawer.open {
  flex: 1 1 auto;
}
```

### Step 1.3: `popup/popup.css`
Navigate to `.popup-settings-drawer` (~line 5592):
Ensure `.popup-settings-drawer` has `flex: 0 0 auto;`, and `.popup-settings-drawer.open` has `flex: 1 1 auto; min-height: 0;`.

---

## 🛡️ 3. Verification Gate
Execute inline Node validation:
```bash
node -e "
const fs = require('fs');
const sleepCss = fs.readFileSync('popup/styles/tabs/tab_sleep.css', 'utf8');
const wellnessCss = fs.readFileSync('popup/styles/tabs/tab_wellness.css', 'utf8');
const assert = require('assert');
assert.ok(sleepCss.includes('#sleepSettingsDrawer.popup-settings-drawer {\n  margin-top: 4px;\n  display: flex;\n  flex-direction: column;\n  flex: 0 0 auto;'), 'Sleep drawer must have flex: 0 0 auto when collapsed');
assert.ok(wellnessCss.includes('#focusSettingsDrawer.popup-settings-drawer {\n  margin-top: 4px;\n  display: flex;\n  flex-direction: column;\n  flex: 0 0 auto;'), 'Focus drawer must have flex: 0 0 auto when collapsed');
console.log('✅ Phase 1 CSS Gate Passed');
"
```
