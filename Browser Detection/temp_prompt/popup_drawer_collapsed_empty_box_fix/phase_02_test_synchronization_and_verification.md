# Phase 2: Test Synchronization & Verification

> **Phase Identifier:** PHASE-02-TEST-SYNCHRONIZATION  
> **Workspace Container:** `temp_prompt/popup_drawer_collapsed_empty_box_fix/`  
> **Primary Subagent Role:** Level 4 QA Verification Tester  
> **Target Subsystems:** `tests/test_popup_drawer_docking_and_scrollbar_fix.js`, `tests/test_popup_collapsible_settings_drawer.js`  
> **Lead Department:** Dept 08 QA, Testing & Verification Engineering  

---

## 🎯 1. Phase Objective
Update assertions in `tests/test_popup_drawer_docking_and_scrollbar_fix.js` to validate `flex: 0 0 auto` for collapsed drawers and `flex: 1` / `flex: 1 1 auto` for open drawers, and verify standalone test execution with Exit Code 0.

---

## 📋 2. Step-by-Step Instructions

### Step 2.1: Update Battery 2 in `tests/test_popup_drawer_docking_and_scrollbar_fix.js`
In `tests/test_popup_drawer_docking_and_scrollbar_fix.js`:
Locate Battery 2, assertion 3:
```javascript
// 3. Focus Settings Drawer container flex rules
const focusDrawerRegex = /#focusSettingsDrawer\.popup-settings-drawer\s*\{([^}]+)\}/s;
const focusDrawerMatch = wellnessCss.match(focusDrawerRegex);
assert.ok(focusDrawerMatch, '#focusSettingsDrawer.popup-settings-drawer must be defined');
assert.ok(
  /flex:\s*0\s+0\s+auto\b/i.test(focusDrawerMatch[1]) && /min-height:\s*0\b/i.test(focusDrawerMatch[1]),
  '#focusSettingsDrawer must have flex: 0 0 auto and min-height: 0 for collapsed zero-docking'
);
```
Add verification for open state:
```javascript
const focusDrawerOpenRegex = /#focusSettingsDrawer\.popup-settings-drawer\.open\s*\{([^}]+)\}/s;
const focusDrawerOpenMatch = wellnessCss.match(focusDrawerOpenRegex);
assert.ok(focusDrawerOpenMatch, '#focusSettingsDrawer.popup-settings-drawer.open must be defined');
assert.ok(
  /flex:\s*1\s+1\s+auto\b/i.test(focusDrawerOpenMatch[1]) || /flex:\s*1\b/i.test(focusDrawerOpenMatch[1]),
  '#focusSettingsDrawer.open must expand with flex: 1 1 auto'
);
```
Also add assertions for Sleep Settings Drawer:
```javascript
// 4. Sleep Settings Drawer container flex rules
const sleepDrawerRegex = /#sleepSettingsDrawer\.popup-settings-drawer\s*\{([^}]+)\}/s;
const sleepDrawerMatch = sleepCss.match(sleepDrawerRegex);
assert.ok(sleepDrawerMatch, '#sleepSettingsDrawer.popup-settings-drawer must be defined');
assert.ok(
  /flex:\s*0\s+0\s+auto\b/i.test(sleepDrawerMatch[1]) && /min-height:\s*0\b/i.test(sleepDrawerMatch[1]),
  '#sleepSettingsDrawer must have flex: 0 0 auto and min-height: 0 for collapsed zero-docking'
);

const sleepDrawerOpenRegex = /#sleepSettingsDrawer\.popup-settings-drawer\.open\s*\{([^}]+)\}/s;
const sleepDrawerOpenMatch = sleepCss.match(sleepDrawerOpenRegex);
assert.ok(sleepDrawerOpenMatch, '#sleepSettingsDrawer.popup-settings-drawer.open must be defined');
assert.ok(
  /flex:\s*1\s+1\s+auto\b/i.test(sleepDrawerOpenMatch[1]) || /flex:\s*1\b/i.test(sleepDrawerOpenMatch[1]),
  '#sleepSettingsDrawer.open must expand with flex: 1 1 auto'
);
```

### Step 2.2: Execute Standalone Test Gates
Run:
```bash
node tests/test_popup_drawer_docking_and_scrollbar_fix.js
node tests/test_popup_collapsible_settings_drawer.js
```
Both test suites must exit cleanly with code 0.
