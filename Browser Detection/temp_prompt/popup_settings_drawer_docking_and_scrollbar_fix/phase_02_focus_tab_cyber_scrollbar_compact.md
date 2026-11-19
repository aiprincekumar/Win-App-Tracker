# Phase 02: Focus Tab Custom Cyber-Dark Sleek Scrollbar & Compact Spacing

> **Phase Number:** 02  
> **Phase Target:** `popup/styles/tabs/tab_wellness.css`, `popup/popup.css`  
> **Executing Role:** Level 4 Frontend Engineer  
> **Governing Standards:** Universal Rule 22, Rule 28, UTF-8 with BOM  

---

## 🎯 Phase Objective
1. Eliminate the wide, intrusive native Windows scrollbar on `#viewFocusPane` and `#focusSettingsDrawer` by applying custom cyber-dark WebKit scrollbars (`width: 4px`, cyan/slate thumb, rounded corners, transparent track).
2. Compress internal card spacing and padding inside the Focus settings drawer by 20–25% to maximize visible ergonomic space.

---

## 📋 Prerequisites & Context
- Read `popup/styles/tabs/tab_wellness.css` (lines 765–822).
- Read `popup/popup.css` (lines 110–125 and 5540–5570).

---

## 🛠️ Surgical Implementation Steps

1. In `popup/styles/tabs/tab_wellness.css`:
   - Add custom WebKit scrollbar pseudo-elements for `#viewFocusPane` and `#focusSettingsDrawer .drawer-inner-content`:
     ```css
     #viewFocusPane::-webkit-scrollbar,
     #focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar {
       width: 4px;
       height: 4px;
     }
     #viewFocusPane::-webkit-scrollbar-track,
     #focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar-track {
       background: transparent;
     }
     #viewFocusPane::-webkit-scrollbar-thumb,
     #focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar-thumb {
       background: rgba(6, 182, 212, 0.45);
       border-radius: 4px;
     }
     #viewFocusPane::-webkit-scrollbar-thumb:hover,
     #focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar-thumb:hover {
       background: rgba(6, 182, 212, 0.75);
     }
     ```
   - Add W3C standard `scrollbar-color: rgba(6, 182, 212, 0.45) transparent;`.
   - Compact spacing:
     - In `#focusSettingsDrawer .drawer-inner-content`: reduce `gap` to 6px and `padding` to `2px 4px 6px 4px`.
     - In `#focusSettingsDrawer .focus-section-card`: reduce vertical padding to 8px.
     - In `#focusSettingsDrawer .focus-tab-presets-grid`: ensure compact button padding.

2. Ensure Light Theme overrides in `popup.css` provide an elegant slate scrollbar thumb for light mode.

3. Verify UTF-8 with BOM encoding on touched files.

---

## 🧪 Phase 2 Verification Gate
Run:
```bash
node -e "
const fs = require('fs');
const css = fs.readFileSync('popup/styles/tabs/tab_wellness.css', 'utf8');
const assert = require('assert');
assert.ok(css.includes('::-webkit-scrollbar'), 'WebKit scrollbar rules must be declared');
assert.ok(css.includes('rgba(6, 182, 212'), 'Cyber cyan scrollbar color must be present');
assert.ok(css.includes('scrollbar-color:'), 'W3C scrollbar-color must be declared');
console.log('✅ Phase 2 Focus Tab Sleek Scrollbar Verified Cleanly');
"
```
