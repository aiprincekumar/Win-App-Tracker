# Phase 3: JavaScript Drawer State Machine, Local Storage Persistence & W3C Trusted Types

> **Phase Identifier:** `phase_03_js_drawer_state_and_persistence`  
> **Target Subsystems:** `popup/popup.js`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Lead Department:** Dept 05: Frontend Engineering & Dept 02: Solution Architecture  

---

## 🎯 1. Phase Objective
Implement the interactive drawer toggle logic, ARIA attribute synchronization, and persistent state management in `popup/popup.js`. Wire up click handlers for `#btnToggleSleepSettingsDrawer` and `#btnToggleFocusSettingsDrawer` with `chrome.storage.local` persistence (`sleepSettingsDrawerOpen`, `focusSettingsDrawerOpen`). Enforce W3C Trusted Types zero-innerHTML compliance and Universal Rule 28 function limits (<= 50 lines, nesting depth <= 3).

---

## 📋 2. Prerequisites & Dependencies
- Phase 1 markup and Phase 2 CSS are in place.
- Target file: `popup/popup.js`.

---

## 🔧 3. Surgical Implementation Steps

### 3.1 Modular Drawer Initializer Helper (Rule 28 Compliant)
Add `initCollapsibleDrawer` helper (<= 35 lines) to `popup/popup.js`:
```javascript
/**
 * Initializes an accessible, persistent collapsible drawer in the popup.
 * Adheres to W3C Trusted Types zero-innerHTML and Universal Rule 28 (<= 50 lines).
 */
function initCollapsibleDrawer(drawerId, toggleBtnId, bodyId, storageKey) {
  const drawerEl = document.getElementById(drawerId);
  const toggleBtn = document.getElementById(toggleBtnId);
  if (!drawerEl || !toggleBtn) return;

  function updateDrawerState(isOpen, persist = true) {
    drawerEl.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (persist && typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [storageKey]: isOpen });
    }
  }

  toggleBtn.addEventListener('click', () => {
    const isCurrentlyOpen = drawerEl.classList.contains('open');
    updateDrawerState(!isCurrentlyOpen, true);
  });

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get([storageKey], (res) => {
      if (res && res[storageKey] === true) {
        updateDrawerState(true, false);
      }
    });
  }
}
```

### 3.2 Wire Up Drawers in Main Initialization
In the main initialization flow of `popup/popup.js` (e.g. `DOMContentLoaded` or `initPopup`):
```javascript
function initPopupCollapsibleDrawers() {
  initCollapsibleDrawer(
    'sleepSettingsDrawer', 
    'btnToggleSleepSettingsDrawer', 
    'sleepSettingsDrawerBody', 
    'sleepSettingsDrawerOpen'
  );
  initCollapsibleDrawer(
    'focusSettingsDrawer', 
    'btnToggleFocusSettingsDrawer', 
    'focusSettingsDrawerBody', 
    'focusSettingsDrawerOpen'
  );
}
```
Invoke `initPopupCollapsibleDrawers()` safely during popup bootstrap.

---

## 🛡️ 4. Constraints & Boundaries
- DO NOT use `innerHTML` anywhere in the drawer implementation.
- DO NOT disturb existing event listeners for preset buttons or inputs.
- Keep all new functions <= 50 lines with nesting depth <= 3 per Rule 28.
- Maintain UTF-8 with BOM standard.

---

## 📦 5. Expected Deliverables
- Updated `popup/popup.js` with modular drawer state management.

---

## 🚦 6. Verification Gate
```bash
node -e "
const fs = require('fs');
const js = fs.readFileSync('popup/popup.js', 'utf8');
const reqTokens = ['initCollapsibleDrawer', 'sleepSettingsDrawerOpen', 'focusSettingsDrawerOpen', 'btnToggleSleepSettingsDrawer', 'btnToggleFocusSettingsDrawer'];
reqTokens.forEach(tok => { if (!js.includes(tok)) throw new Error('Missing JS token: ' + tok); });
console.log('✅ Phase 3 Verification Passed: JS Drawer Logic verified');
"
```
