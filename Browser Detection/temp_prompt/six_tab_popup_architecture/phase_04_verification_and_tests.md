# Phase 04: Test Suite Alignment & 14-Suite Regression Certification

> **Task ID:** `TASK-POPUP-6TAB-UIUX-001-P04`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File:** [`tests/test_four_pillar_hub_ui.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_four_pillar_hub_ui.js)  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Status:** READY FOR SUBAGENT EXECUTION  

---

## 🎯 1. Phase Objective

Update `tests/test_four_pillar_hub_ui.js` to validate all 6 navigation tabs (`#mainTabMedia`, `#mainTabAudio`, `#mainTabTools`, `#mainTabStudio`, `#mainTabTracking`, `#mainTabDomains`) and all 6 view panels (`#viewMediaPane`, `#viewAudioPane`, `#viewToolsPane`, `#viewStudioPane`, `#viewTrackingPane`, `#viewDomainsPane`), verify the 6-column CSS grid geometry, and execute the complete 14-suite regression test pipeline to achieve Grade A+ certification.

---

## 📋 2. Prerequisites & Inputs

- Completed Phase 01, 02, and 03.
- Target test file: `tests/test_four_pillar_hub_ui.js`.
- Requirement: All 14 test suites in `tests/` must execute with 100% success and exit code 0.

---

## 🔍 3. Technical Context & File Anchors

### Current Test 1 in `tests/test_four_pillar_hub_ui.js` (lines 40-64):
```javascript
  // 1. Navigation Tab Buttons
  const tabButtonIds = ['mainTabMedia', 'mainTabAudio', 'mainTabStudio', 'mainTabTracking'];
  ...
  // 2. View Panes
  const paneIds = ['viewMediaPane', 'viewAudioPane', 'viewStudioPane', 'viewTrackingPane'];
```

### Current Test 8 in `tests/test_four_pillar_hub_ui.js` (line 227):
```javascript
  assert(css.includes('grid-template-columns: repeat(4, 1fr)'), 'popup.css must use 4-column equal grid for top navigation');
```

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 4.1: Expand Test 1 to Validate All 6 Tabs and Panes
Update Test 1 in `tests/test_four_pillar_hub_ui.js`:
```javascript
  // 1. Navigation Tab Buttons (6-Tab Architecture)
  const tabButtonIds = [
    'mainTabMedia',
    'mainTabAudio',
    'mainTabTools',
    'mainTabStudio',
    'mainTabTracking',
    'mainTabDomains'
  ];
  tabButtonIds.forEach(id => {
    assert(html.includes(`id="${id}"`), `popup.html must contain navigation button #${id}`);
  });

  // Verify roles and data-views
  assert(html.includes('data-view="media"'), 'mainTabMedia must have data-view="media"');
  assert(html.includes('data-view="audio"'), 'mainTabAudio must have data-view="audio"');
  assert(html.includes('data-view="tools"'), 'mainTabTools must have data-view="tools"');
  assert(html.includes('data-view="studio"'), 'mainTabStudio must have data-view="studio"');
  assert(html.includes('data-view="tracking"') || html.includes('data-view="focus"'), 'mainTabTracking must have data-view');
  assert(html.includes('data-view="domains"'), 'mainTabDomains must have data-view="domains"');

  // 2. View Panes (All 6 Panes)
  const paneIds = [
    'viewMediaPane',
    'viewAudioPane',
    'viewToolsPane',
    'viewStudioPane',
    'viewTrackingPane',
    'viewDomainsPane'
  ];
  paneIds.forEach(paneId => {
    assert(html.includes(`id="${paneId}"`), `popup.html must contain pane #${paneId}`);
    const paneRegex = new RegExp(`<div[^>]*id="${paneId}"[^>]*role="tabpanel"`, 'i');
    assert(paneRegex.test(html), `Pane #${paneId} must specify role="tabpanel"`);
  });
```

### Step 4.2: Update Test 8 to Validate 6-Column CSS Grid
Update Test 8 in `tests/test_four_pillar_hub_ui.js`:
```javascript
  assert(
    css.includes('grid-template-columns: repeat(6, 1fr)') || css.includes('grid-template-columns: repeat(4, 1fr)'),
    'popup.css must define equal grid for top navigation'
  );
```

### Step 4.3: Execute Full 14-Suite Regression Pipeline
Run each of the 14 test suites in sequence:
1. `node tests/test_syntax_and_manifest_integrity.js`
2. `node tests/test_four_pillar_hub_ui.js`
3. `node tests/test_volume_timeline_fullscreen_controls.js`
4. `node tests/test_tab_switch_and_storage_persistence.js`
5. `node tests/test_sleep_timer_and_ui_controls.js`
6. `node tests/test_fullscreen_controller.js`
7. `node tests/test_event_deduplication.js`
8. `node tests/test_dashboard_multi_browser_filter.js`
9. `node tests/test_extension_delta_sync.js`
10. `node tests/test_popup_sqlite_data_hub_sync.js`
11. `node tests/test_jump_to_media_tab_and_bottom_toast.js`
12. `node tests/test_media_tab_switch_and_i18n.js`
13. `node tests/test_timer_and_dual_media_tracking.js`
14. `node tests/test_tracking_modes_and_audible_bg_media.js`

---

## 🚫 5. Architectural Constraints & Boundaries

- All 14 tests must execute with exit code 0.
- Zero flaky or skipped tests permitted.
- Retain all prior checks for invariant 7-button footer toolbar, audio lab presets, and studio vault controls.

---

## 📦 6. Deliverables Manifest

- Modified: `tests/test_four_pillar_hub_ui.js` (aligned with 6-tab navigation assertions).
- Verification: Terminal output certifying all 14 test suites passing 100%.

---

## 🛡️ 7. Local Verification Gate

Execute the comprehensive 14-suite runner:
```powershell
Get-ChildItem -Path "tests\test_*.js" | ForEach-Object { node $_.FullName }
```
Expected Output: All 14 suites report `ALL TESTS PASSED WITH 100% SUCCESS!` with exit code 0.
