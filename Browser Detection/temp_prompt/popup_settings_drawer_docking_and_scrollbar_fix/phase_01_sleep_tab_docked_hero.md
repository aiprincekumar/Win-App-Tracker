# Phase 01: Sleep Tab Docked Hero Ring & Bounded Scrollable Settings Drawer

> **Phase Number:** 01  
> **Phase Target:** `popup/styles/tabs/tab_sleep.css`, `popup/popup.css`  
> **Executing Role:** Level 4 Frontend Engineer  
> **Governing Standards:** Universal Rule 22, Rule 28, UTF-8 with BOM  

---

## 🎯 Phase Objective
Refactor the Sleep Tab layout in `popup/styles/tabs/tab_sleep.css` and `popup/popup.css` so that:
1. `#cardSleepHeroRing` (the hero countdown dial and quick-action buttons) is docked and never scrolls off-screen.
2. Vertical scrolling is strictly confined inside `#sleepSettingsDrawer .drawer-inner-content` when the drawer is open.
3. The parent pane `#viewSleepPane` maintains its max-height constraint without outer scroll clutter.

---

## 📋 Prerequisites & Context
- Read `popup/styles/tabs/tab_sleep.css` (lines 10–45 and 405–455).
- Read `popup/popup.css` (lines 5540–5570).
- Preserve existing DOM IDs and classes (`#cardSleepHeroRing`, `#sleepSettingsDrawer`, `.drawer-inner-content`).

---

## 🛠️ Surgical Implementation Steps

1. In `popup/styles/tabs/tab_sleep.css`:
   - Set `#viewSleepPane` to `overflow: hidden; max-height: 540px;` while preserving `scrollbar-width: thin;` for test compatibility.
   - Set `.sleep-hero-card` to `flex-shrink: 0;`.
   - Update `#sleepSettingsDrawer.popup-settings-drawer` to `display: flex; flex-direction: column; flex: 1; min-height: 0;`.
   - Update `#sleepSettingsDrawer.open .drawer-inner-content` to include:
     ```css
     max-height: 280px;
     overflow-y: auto;
     overflow-x: hidden;
     scrollbar-width: thin;
     scrollbar-color: rgba(129, 140, 248, 0.45) transparent;
     ```
   - Add custom WebKit scrollbar rules for `#sleepSettingsDrawer .drawer-inner-content::-webkit-scrollbar` and its thumb.

2. In `popup/popup.css`:
   - Ensure generic `.drawer-inner-content` has `min-height: 0;` and does not force full-page overflow.
   - Verify that `#viewSleepPane` retains `max-height: 540px` for test assertion parity.

3. Verify UTF-8 with BOM encoding on both modified files.

---

## 🧪 Phase 1 Verification Gate
Run:
```bash
node -e "
const fs = require('fs');
const css = fs.readFileSync('popup/styles/tabs/tab_sleep.css', 'utf8');
const assert = require('assert');
assert.ok(css.includes('flex-shrink: 0'), 'sleep-hero-card must have flex-shrink: 0');
assert.ok(css.includes('max-height: 280px') || css.includes('max-height:'), 'drawer content must have max-height boundary');
assert.ok(css.includes('overflow-y: auto'), 'drawer content must have overflow-y: auto');
console.log('✅ Phase 1 Sleep Tab Docking CSS Verified Cleanly');
"
```
