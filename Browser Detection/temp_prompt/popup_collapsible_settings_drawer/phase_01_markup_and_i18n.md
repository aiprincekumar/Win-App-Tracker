# Phase 1: Semantic Drawer Markup & Bilingual i18n Integration

> **Phase Identifier:** `phase_01_markup_and_i18n`  
> **Target Subsystems:** `popup/popup.html`, `locales/en.json`, `locales/hi.json`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Lead Department:** Dept 05: Frontend Engineering & Dept 01: Product Requirements  

---

## 🎯 1. Phase Objective
Wrap the secondary configuration sections of the Sleep Tab (`#cardSleepPresetsAndCustom`, `#cardSleepAutomations`) and Focus Tab (`#cardFocusPresetsAndCustom`, `#focusRatioBarContainer`, `#doomscrollBreakerCard`) into accessible collapsible drawer containers in `popup/popup.html`. Synchronize bilingual localization keys across `locales/en.json` and `locales/hi.json`. Preserve 100% of existing DOM element IDs, attributes, and child hierarchies.

---

## 📋 2. Prerequisites & Dependencies
- Repository working tree is clean.
- Existing tests pass via `node run_all_tests.js`.
- Target files:
  - `popup/popup.html`
  - `locales/en.json`
  - `locales/hi.json`

---

## 🔧 3. Surgical Implementation Steps

### 3.1 `popup/popup.html` Modifications
1. In `#viewSleepPane` (lines ~630–717):
   - Immediately following `</section>` of `#cardSleepHeroRing`, insert container `<div id="sleepSettingsDrawer" class="popup-settings-drawer">`.
   - Add toggle button:
     ```html
     <button type="button" id="btnToggleSleepSettingsDrawer" class="drawer-toggle-btn" aria-expanded="false" aria-controls="sleepSettingsDrawerBody" title="Toggle Presets and Automations">
       <div class="drawer-title-wrap">
         <span class="drawer-icon" aria-hidden="true">⚙️</span>
         <span class="drawer-title" id="lblSleepDrawerTitle">Presets & Automations</span>
       </div>
       <span class="drawer-chevron" aria-hidden="true">▾</span>
     </button>
     ```
   - Add expandable wrapper: `<div id="sleepSettingsDrawerBody" class="drawer-expandable-wrap" role="region" aria-labelledby="btnToggleSleepSettingsDrawer"><div class="drawer-inner-content">`.
   - Wrap `#cardSleepPresetsAndCustom` and `#cardSleepAutomations` inside `.drawer-inner-content`.
   - Close wrappers `</div></div></div>`.

2. In `#viewFocusPane` (lines ~783–874):
   - Immediately following `</div>` of `#cardPopupFocusTimer`, insert container `<div id="focusSettingsDrawer" class="popup-settings-drawer">`.
   - Add toggle button:
     ```html
     <button type="button" id="btnToggleFocusSettingsDrawer" class="drawer-toggle-btn" aria-expanded="false" aria-controls="focusSettingsDrawerBody" title="Toggle Presets and Wellness Tools">
       <div class="drawer-title-wrap">
         <span class="drawer-icon" aria-hidden="true">⚙️</span>
         <span class="drawer-title" id="lblFocusDrawerTitle">Presets & Wellness Tools</span>
       </div>
       <span class="drawer-chevron" aria-hidden="true">▾</span>
     </button>
     ```
   - Add expandable wrapper: `<div id="focusSettingsDrawerBody" class="drawer-expandable-wrap" role="region" aria-labelledby="btnToggleFocusSettingsDrawer"><div class="drawer-inner-content">`.
   - Wrap `#cardFocusPresetsAndCustom`, `#focusRatioBarContainer`, and `#doomscrollBreakerCard` inside `.drawer-inner-content`.
   - Close wrappers `</div></div></div>`.

### 3.2 Bilingual Localization (`locales/*.json`)
Add new keys with exact parity:
- `sleep_drawer_title`: "Presets & Automations" / "प्रीसेट और ऑटोमेशन"
- `focus_drawer_title`: "Presets & Wellness Tools" / "प्रीसेट और वेलनेस टूल्स"
- `drawer_expand_tooltip`: "Expand Settings" / "सेटिंग्स खोलें"
- `drawer_collapse_tooltip`: "Collapse Settings" / "सेटिंग्स बंद करें"

---

## 🛡️ 4. Constraints & Boundaries
- DO NOT alter or remove any existing IDs, including `#cardSleepPresetsAndCustom`, `#cardSleepAutomations`, `#cardFocusPresetsAndCustom`, `#focusRatioBarContainer`, `#doomscrollBreakerCard`.
- DO NOT remove or rename any input or preset button classes.
- Ensure UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) is maintained across all modified files.

---

## 📦 5. Expected Deliverables
- Modified `popup/popup.html`
- Updated `locales/en.json` and `locales/hi.json` with exact key parity

---

## 🚦 6. Verification Gate
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('popup/popup.html', 'utf8');
const en = JSON.parse(fs.readFileSync('locales/en.json', 'utf8').replace(/^\uFEFF/, ''));
const hi = JSON.parse(fs.readFileSync('locales/hi.json', 'utf8').replace(/^\uFEFF/, ''));
const reqIds = ['sleepSettingsDrawer', 'btnToggleSleepSettingsDrawer', 'sleepSettingsDrawerBody', 'focusSettingsDrawer', 'btnToggleFocusSettingsDrawer', 'focusSettingsDrawerBody', 'cardSleepPresetsAndCustom', 'cardSleepAutomations', 'cardFocusPresetsAndCustom', 'focusRatioBarContainer', 'doomscrollBreakerCard'];
reqIds.forEach(id => { if (!html.includes('id=\"' + id + '\"')) throw new Error('Missing ID: ' + id); });
if (Object.keys(en).length !== Object.keys(hi).length) throw new Error('Locale parity mismatch');
console.log('✅ Phase 1 Verification Passed: DOM IDs and i18n parity verified');
"
```
