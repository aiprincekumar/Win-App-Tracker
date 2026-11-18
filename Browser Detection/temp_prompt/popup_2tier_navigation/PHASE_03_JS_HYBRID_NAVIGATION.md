# Phase 03: JS Hybrid Navigation, Dynamic Filtering & Manual Lock

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Phase:** 03 of 04  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File(s):**  
> - [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) (Lines ~905-945, ~1790-1820, ~2605-2650, ~4655-4670)  
> **Assigned Role:** Level 4 Execution Subagent (Frontend Engineer)  
> **Status:** `PENDING_AUTHORIZATION`

---

## 🎯 1. Phase Objective
The objective of Phase 03 is to implement the reactive JavaScript navigation engine in `popup/popup.js`:
1. Author `switchTier1Category(category, isManual)` to manage Tier 1 category activation, child tab visibility filtering, and default tab selection.
2. Refactor `switchTopTab(tabName, isManual)` to synchronize seamlessly with Tier 1 and ensure bidirectional consistency.
3. Wire interactive click event listeners on all 4 Tier 1 buttons (`#tier1BtnPlayback`, `#tier1BtnStudio`, `#tier1BtnAnalytics`, `#tier1BtnWellness`).
4. Implement the **Hybrid Dynamic Media Intelligence Engine** inside `updateLiveMediaCard`:
   - Auto-promote `playback` category and `media` tab upon active media playback.
   - Auto-revert to `analytics` category and `tracking` tab when media stops.
   - Strictly honor `userManualOverride`: once a user clicks any category or tab, background heartbeats are latched and blocked from overriding user intent.
5. Hydrate persisted states from `browserAPI.storage.local` during popup startup.

---

## 📦 2. Prerequisites & Dependencies
- Successful completion of Phase 01 (DOM elements & i18n keys) and Phase 02 (CSS styles & `.tab-hidden` rule).
- Verification test `tests/test_tab_switch_and_storage_persistence.js` passing in current baseline.

---

## 🔍 3. Technical Context & File Anchors
- In [`popup/popup.js#L907-L942`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L907-L942), `switchTopTab` activates buttons and panes:
  ```javascript
  function switchTopTab(tabName, isManual = false) { ... }
  ```
- In [`popup/popup.js#L1793-L1815`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L1793-L1815), `updateLiveMediaCard` performs auto-switching between `media` and `tracking`.
- In [`popup/popup.js#L2611-L2650`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2611-L2650), click listeners are bound to `#mainTabMedia` through `#mainTabSleep`.
- In [`popup/popup.js#L4655-L4665`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L4655-L4665), startup storage hydration reads `res.active_popup_tab`.

---

## 🛠️ 4. Step-by-Step Surgical Instructions

### Step 1: Define Category Map and State in `popup/popup.js`
Near line ~900 (above `switchTopTab`), introduce the category registry and state variable:

```javascript
// =============================================================================
// 2-Tier Segmented Control & Navigation Taxonomy
// =============================================================================
let activeTier1Category = 'playback';

const TIER1_CATEGORIES = {
  playback: {
    id: 'tier1BtnPlayback',
    tabs: ['media', 'audio', 'tools'],
    defaultTab: 'media'
  },
  studio: {
    id: 'tier1BtnStudio',
    tabs: ['studio'],
    defaultTab: 'studio'
  },
  analytics: {
    id: 'tier1BtnAnalytics',
    tabs: ['tracking', 'domains'],
    defaultTab: 'tracking'
  },
  wellness: {
    id: 'tier1BtnWellness',
    tabs: ['sleep'],
    defaultTab: 'sleep'
  }
};

/**
 * Returns the Tier 1 category that owns a given Tier 2 tab
 */
function getCategoryForTab(tabKey) {
  const norm = (tabKey === 'focus') ? 'tracking' : tabKey;
  for (const [catName, catDef] of Object.entries(TIER1_CATEGORIES)) {
    if (catDef.tabs.includes(norm)) {
      return catName;
    }
  }
  return 'playback';
}
```

### Step 2: Implement `switchTier1Category` in `popup/popup.js`
Add `switchTier1Category`:

```javascript
/**
 * Switches the Tier 1 Category (playback, studio, analytics, wellness)
 * and dynamically filters Tier 2 child tabs.
 */
function switchTier1Category(category, isManual = false) {
  if (!TIER1_CATEGORIES[category]) return;
  if (isManual) {
    userManualOverride = true;
  }

  activeTier1Category = category;

  // 1. Update Tier 1 Segmented Buttons UI
  Object.entries(TIER1_CATEGORIES).forEach(([catKey, catDef]) => {
    const btn = document.getElementById(catDef.id);
    if (!btn) return;
    const isActive = (catKey === category);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Filter Tier 2 Child Tabs based on data-group
  const childTabs = document.querySelectorAll('.top-nav-tabs .top-tab-btn');
  childTabs.forEach(btn => {
    const group = btn.getAttribute('data-group') || getCategoryForTab(btn.getAttribute('data-view'));
    const isVisible = (group === category);
    btn.classList.toggle('tab-hidden', !isVisible);
  });

  // 3. Ensure an active child tab is selected within this category
  const allowedTabs = TIER1_CATEGORIES[category].tabs;
  if (!allowedTabs.includes(activeTopTab)) {
    const targetTab = TIER1_CATEGORIES[category].defaultTab;
    switchTopTab(targetTab, isManual);
  }

  // 4. Persist to storage
  try {
    browserAPI.storage.local.set({ active_tier1_category: category });
  } catch (_) {}
}
```

### Step 3: Refactor `switchTopTab` for Seamless Bidirectional Sync
Update `switchTopTab`:

```javascript
/**
 * Switches the top-level tab (Media, Audio, Tools, Studio, Tracking, Domains, Sleep)
 * and guarantees parent Tier 1 category synchronization.
 */
function switchTopTab(tabName, isManual = false) {
  if (isManual) {
    userManualOverride = true;
  }
  const normalized = (tabName === 'focus') ? 'tracking' : tabName;
  activeTopTab = normalized;

  // 1. Synchronize parent Tier 1 category if needed
  const parentCategory = getCategoryForTab(normalized);
  if (parentCategory !== activeTier1Category) {
    activeTier1Category = parentCategory;
    Object.entries(TIER1_CATEGORIES).forEach(([catKey, catDef]) => {
      const btn = document.getElementById(catDef.id);
      if (!btn) return;
      const isActive = (catKey === parentCategory);
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Filter child tabs
    const childTabs = document.querySelectorAll('.top-nav-tabs .top-tab-btn');
    childTabs.forEach(btn => {
      const group = btn.getAttribute('data-group') || getCategoryForTab(btn.getAttribute('data-view'));
      btn.classList.toggle('tab-hidden', group !== parentCategory);
    });

    try {
      browserAPI.storage.local.set({ active_tier1_category: parentCategory });
    } catch (_) {}
  }

  // 2. Activate child tab and view pane
  const tabs = [
    { id: 'mainTabMedia', paneId: 'viewMediaPane', key: 'media' },
    { id: 'mainTabAudio', paneId: 'viewAudioPane', key: 'audio' },
    { id: 'mainTabTools', paneId: 'viewToolsPane', key: 'tools' },
    { id: 'mainTabStudio', paneId: 'viewStudioPane', key: 'studio' },
    { id: 'mainTabTracking', paneId: 'viewTrackingPane', key: 'tracking' },
    { id: 'mainTabDomains', paneId: 'viewDomainsPane', key: 'domains' },
    { id: 'mainTabSleep', paneId: 'viewSleepPane', key: 'sleep' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.id);
    const pane = document.getElementById(t.paneId);
    if (!btn || !pane) return;
    const isTarget = (t.key === normalized);
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    pane.classList.toggle('active', isTarget);
  });

  try {
    browserAPI.storage.local.set({ active_popup_tab: normalized });
  } catch (_) {}
}
```

### Step 4: Wire Tier 1 Category Click Listeners
In the setup listeners section (`setupEventListeners()` or `DOMContentLoaded`):

```javascript
  // Tier 1 Segmented Navigation Click Listeners
  const tier1Buttons = [
    { id: 'tier1BtnPlayback', category: 'playback' },
    { id: 'tier1BtnStudio', category: 'studio' },
    { id: 'tier1BtnAnalytics', category: 'analytics' },
    { id: 'tier1BtnWellness', category: 'wellness' }
  ];

  tier1Buttons.forEach(({ id, category }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        switchTier1Category(category, true);
      });
    }
  });
```

### Step 5: Upgrade Hybrid Media State Engine in `updateLiveMediaCard`
Refactor lines ~1793-1815 in `popup/popup.js`:

```javascript
  // 1. Initial Load: Automatically choose the right category and tab
  if (isInitialLoad) {
    isInitialLoad = false;
    if (hasActiveMedia) {
      switchTier1Category('playback', false);
      switchTopTab('media', false);
    } else {
      switchTier1Category('analytics', false);
      switchTopTab('tracking', false);
    }
  }

  // 2. Playback just started while popup is open -> Auto-switch to Playback / Media
  if (isPlayingNow && !lastMediaPlaying) {
    if (!userManualOverride) {
      switchTier1Category('playback', false);
      switchTopTab('media', false);
    }
  }

  // 3. If no media and user hasn't explicitly chosen tabs -> Auto-revert to Analytics / Tracking
  if (!userManualOverride && !hasActiveMedia && activeTier1Category === 'playback' && activeTopTab === 'media') {
    switchTier1Category('analytics', false);
    switchTopTab('tracking', false);
  }

  lastMediaPlaying = isPlayingNow;
```

### Step 6: Update Startup Hydration in `DOMContentLoaded`
In lines ~4655-4665 of `popup/popup.js`:

```javascript
    // Hydrate 2-Tier Segmented Control & Tab States
    const validTabs = ['media', 'audio', 'tools', 'studio', 'tracking', 'domains', 'sleep'];
    const validCategories = ['playback', 'studio', 'analytics', 'wellness'];

    if (res && res.active_tier1_category && validCategories.includes(res.active_tier1_category)) {
      switchTier1Category(res.active_tier1_category, false);
    }

    if (res && res.active_popup_tab && validTabs.includes(res.active_popup_tab)) {
      switchTopTab(res.active_popup_tab, false);
    } else if (res && res.quick_settings && res.quick_settings.default_tab && validTabs.includes(res.quick_settings.default_tab)) {
      switchTopTab(res.quick_settings.default_tab, false);
    }
```

---

## 🚫 5. Constraints & Architectural Invariants
1. **Manual Lock Integrity:** When `isManual === true`, `userManualOverride` MUST be latched to `true`. No automated telemetry update or polling cycle may clear this flag while the popup remains open.
2. **Infinite Loop Protection:** `switchTier1Category` and `switchTopTab` must guard against circular recursion when synchronizing states.
3. **W3C Trusted Types & CSP Security:** Strictly use `classList.toggle`, `setAttribute`, and `getElementById`. Zero `innerHTML` or string evaluation.

---

## 📑 6. Deliverables Manifest
- `popup/popup.js`: Added `TIER1_CATEGORIES`, `getCategoryForTab`, `switchTier1Category`, updated `switchTopTab`, updated `updateLiveMediaCard`, bound Tier 1 click listeners, and updated storage hydration.

---

## 🧪 7. Local Verification Gate
Execute syntax and storage persistence test suites:
```bash
node -c popup/popup.js
node tests/test_tab_switch_and_storage_persistence.js
node tests/test_popup_sleep_tab.js
```
**Pass Criteria:**
- Exit code 0 across all 3 commands.
- Zero uncaught exceptions or syntax errors.
