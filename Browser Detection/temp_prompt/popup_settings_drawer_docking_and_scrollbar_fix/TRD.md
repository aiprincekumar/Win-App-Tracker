# Technical Requirements Document (TRD): Layout Engine & Scroll Container Architecture

> **Document Type:** Technical Requirements Document  
> **Workspace Container:** `temp_prompt/popup_settings_drawer_docking_and_scrollbar_fix/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🛠️ 1. CSS Layout Architecture & Box Model

### 1.1 Sleep Tab Flexbox Docking Architecture
In `popup/styles/tabs/tab_sleep.css`:
```css
/* Pin parent pane geometry to prevent outer scrolling */
#viewSleepPane {
  display: none;
  flex-direction: column;
  gap: 8px;
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden; /* Prevent parent from scrolling */
  max-height: 540px;
  height: auto;
  scrollbar-width: thin;
}

#viewSleepPane.active {
  display: flex;
}

/* Docked Hero Card: Flex Shrink 0 ensures rigid height */
.sleep-hero-card {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Drawer Container expands into remaining space */
#sleepSettingsDrawer.popup-settings-drawer {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin-top: 4px;
}

/* When open, drawer inner content handles internal scrolling */
#sleepSettingsDrawer.open .drawer-inner-content {
  opacity: 1;
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(129, 140, 248, 0.45) transparent;
  padding: 4px 4px 8px 4px;
}
```

### 1.2 Focus Tab Sleek Scrollbar & Compact Spacing
In `popup/styles/tabs/tab_wellness.css`:
```css
/* Custom Sleek Scrollbar on Focus Pane and Drawer Container */
#viewFocusPane::-webkit-scrollbar,
#focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar,
#sleepSettingsDrawer .drawer-inner-content::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

#viewFocusPane::-webkit-scrollbar-track,
#focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar-track,
#sleepSettingsDrawer .drawer-inner-content::-webkit-scrollbar-track {
  background: transparent;
}

#viewFocusPane::-webkit-scrollbar-thumb,
#focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.45);
  border-radius: 4px;
  transition: background 0.2s ease;
}

#viewFocusPane::-webkit-scrollbar-thumb:hover,
#focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.75);
}

#sleepSettingsDrawer .drawer-inner-content::-webkit-scrollbar-thumb {
  background: rgba(129, 140, 248, 0.45);
  border-radius: 4px;
  transition: background 0.2s ease;
}

#sleepSettingsDrawer .drawer-inner-content::-webkit-scrollbar-thumb:hover {
  background: rgba(129, 140, 248, 0.75);
}

/* W3C Standard Scrollbar Properties */
#viewFocusPane,
#focusSettingsDrawer .drawer-inner-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(6, 182, 212, 0.45) transparent;
}

/* Compact Spacing Refinements */
#focusSettingsDrawer .drawer-inner-content {
  gap: 6px;
  padding: 2px 4px 6px 4px;
}

#focusSettingsDrawer .focus-section-card {
  padding: 8px 10px;
  margin-bottom: 2px;
}
```

---

## 🔒 2. Backward Compatibility & Test Suite Invariants

The existing verification suite `tests/test_popup_collapsible_settings_drawer.js` specifically asserts:
```javascript
assert.ok(allCss.includes('#viewSleepPane') && allCss.includes('max-height: 540px'), 'Sleep pane must enforce max-height zero-scroll constraint');
assert.ok(allCss.includes('#viewFocusPane') && allCss.includes('max-height: 540px'), 'Focus pane must enforce max-height zero-scroll constraint');
assert.ok(allCss.includes('scrollbar-width: thin'), 'Scrollbar width thin must be declared');
```
**Invariant Contract:** All changes MUST retain these exact CSS rule blocks so that existing tests pass without modification or breakage.
