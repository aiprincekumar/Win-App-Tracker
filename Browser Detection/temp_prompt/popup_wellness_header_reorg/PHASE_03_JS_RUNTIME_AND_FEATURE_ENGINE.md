# Phase 03: Feature Engine & Interactive Runtime State Machine

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Phase #:** 03 of 04  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/PHASE_03_JS_RUNTIME_AND_FEATURE_ENGINE.md`  
> **Lead Execution Role:** Level 4 Core Runtime Engineer Subagent  
> **Required Skills:** `frontend-patterns`, `backend-patterns`  
> **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`)  

---

## 🎯 1. Phase Objective
Update the JavaScript logic:
1. Update `src/popup/features/tier1_navigation_feature.js`:
   - Map `wellness: Object.freeze(['sleep', 'focus'])` in `GROUP_TO_TABS`.
   - Map `focus: 'wellness'` in `TAB_TO_GROUP`.
   - Include `'focus'` in `ALL_TABS`.
2. Update `popup/popup.js`:
   - Register bilingual translation entries in `I18N_POPUP.en` and `I18N_POPUP.hi`.
   - Bind `applyPopupLanguage` text nodes for `#topTabFocusText`, `#focusPlaceholderTitle`, `#focusPlaceholderDesc`, and `#focusStatusText`.
   - In tab switching logic (`switchTopTab` and `initTabs`), support `'focus'` tab selection, setting `#mainTabFocus` active, showing `#viewFocusPane`, and synchronizing with `#tier1BtnWellness`.
   - Ensure the moved `#btnQuickSettings` in footer triggers `#quickSettingsPopover` cleanly and dismisses upon clicking outside or closing.
   - Guard existing sleep timer countdowns, alarms, and background listeners so they remain 100% operational and undisturbed.

---

## 📋 2. Prerequisites & Inputs
- Phase 01 (DOM & i18n) and Phase 02 (CSS) completed.
- Target files:
  - [`src/popup/features/tier1_navigation_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/popup/features/tier1_navigation_feature.js)
  - [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1: Update `src/popup/features/tier1_navigation_feature.js`
In `src/popup/features/tier1_navigation_feature.js`:
1. Modify `GROUP_TO_TABS`:
   ```javascript
   const GROUP_TO_TABS = Object.freeze({
     playback: Object.freeze(['media', 'audio']),
     studio: Object.freeze(['tools', 'studio']),
     analytics: Object.freeze(['tracking', 'domains']),
     wellness: Object.freeze(['sleep', 'focus'])
   });
   ```
2. Modify `TAB_TO_GROUP`:
   ```javascript
   const TAB_TO_GROUP = Object.freeze({
     media: 'playback',
     audio: 'playback',
     tools: 'studio',
     studio: 'studio',
     tracking: 'analytics',
     domains: 'analytics',
     sleep: 'wellness',
     focus: 'wellness'
   });
   ```
3. Modify `ALL_TABS`:
   ```javascript
   const ALL_TABS = Object.freeze(['media', 'audio', 'tools', 'studio', 'tracking', 'domains', 'sleep', 'focus']);
   ```
4. Verify `getGroupForTab('focus')` returns `'wellness'`.
5. Verify `getTabsForGroup('wellness')` returns `['sleep', 'focus']`.

### Step 2: Update `I18N_POPUP` and `applyPopupLanguage` in `popup/popup.js`
1. In `I18N_POPUP.en`:
   ```javascript
   top_tab_focus: 'Focus',
   focus_placeholder_title: 'Focus & Productivity',
   focus_placeholder_desc: 'Deep work timer and digital wellness integration coming soon. Use the Sleep tab for bedtime routines.',
   focus_status_ready: 'Focus Mode Ready',
   ```
2. In `I18N_POPUP.hi`:
   ```javascript
   top_tab_focus: 'फ़ोकस',
   focus_placeholder_title: 'फ़ोकस और उत्पादकता',
   focus_placeholder_desc: 'गहन कार्य टाइमर और डिजिटल वेलनेस एकीकरण जल्द आ रहा है। सोने की दिनचर्या के लिए स्लीप टैब का उपयोग करें।',
   focus_status_ready: 'फ़ोकस मोड तैयार',
   ```
3. In `applyPopupLanguage(lang)`:
   ```javascript
   setTxt('topTabFocusText', 'top_tab_focus');
   setTxt('focusPlaceholderTitle', 'focus_placeholder_title');
   setTxt('focusPlaceholderDesc', 'focus_placeholder_desc');
   setTxt('focusStatusText', 'focus_status_ready');
   ```

### Step 3: Wire Tab Switching & Quick Settings Popover in `popup/popup.js`
1. In `initTabs()` or tab event binding:
   - Ensure `#mainTabFocus` attaches a click listener invoking `switchTopTab('focus', true)`.
   - In `switchTopTab(tabName, isManual)`:
     - When `tabName === 'focus'`, activate `#mainTabFocus`, deactivate sibling tabs, activate `#viewFocusPane`, hide other panes, and activate `#tier1BtnWellness`.
     - When `tabName === 'sleep'`, activate `#mainTabSleep`, deactivate sibling tabs, activate `#viewSleepPane`, and activate `#tier1BtnWellness`.
     - When switching between `'sleep'` and `'focus'`, the parent Tier 1 category remains `'wellness'`. Both `#mainTabSleep` and `#mainTabFocus` stay visible (neither has `.tab-hidden`).
2. Quick Settings Popover wiring:
   - Verify `#btnQuickSettings` click listener:
     ```javascript
     const btnQuickSettings = document.getElementById('btnQuickSettings');
     const quickSettingsPopover = document.getElementById('quickSettingsPopover');
     if (btnQuickSettings && quickSettingsPopover) {
       btnQuickSettings.addEventListener('click', (e) => {
         e.stopPropagation();
         const isHidden = quickSettingsPopover.classList.toggle('hidden');
         btnQuickSettings.setAttribute('aria-expanded', String(!isHidden));
       });
     }
     ```
   - Verify outside click dismissal continues to inspect both `#quickSettingsPopover` and `#btnQuickSettings`.

### Step 4: Strict Sleep Timer Non-Interference
- Ensure that `switchTopTab('focus')` or clicking `#tier1BtnWellness` does NOT trigger any reset, pause, or mutation on the Sleep Timer state machine (`window.__sentinelSleepState` or background timer).
- Sleep countdown intervals, alarms, and SVG radial displays must remain running completely unaffected in the background.

---

## 🔒 4. Architectural Constraints & Boundaries
- 100% W3C Trusted Types zero-innerHTML safety: strictly use `.textContent` or attribute updates.
- Keep function lengths <= 50 lines per Universal Rule 28.
- Preserve UTF-8 with BOM.

---

## 📦 5. Deliverables Manifest
1. Updated `src/popup/features/tier1_navigation_feature.js` exporting updated wellness mappings.
2. Updated `popup/popup.js` with i18n bindings, tab switcher integration, and popover event handling.

---

## 🚦 6. Local Verification Gate
- Run node in-memory test asserting:
  - `tier1Feature.getTabsForGroup('wellness')` contains both `'sleep'` and `'focus'`.
  - `tier1Feature.getGroupForTab('focus') === 'wellness'`.
  - `popup.js` contains zero `innerHTML` mutations for focus elements.
