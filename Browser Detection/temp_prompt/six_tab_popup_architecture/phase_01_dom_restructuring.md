# Phase 01: HTML DOM Restructuring & 6-Pane Decomposition

> **Task ID:** `TASK-POPUP-6TAB-UIUX-001-P01`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File:** [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html)  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Status:** READY FOR SUBAGENT EXECUTION  

---

## 🎯 1. Phase Objective

Restructure `popup/popup.html` to implement the 6-Tab Single-Word Navigation Bar and create 6 distinct view panels (`viewMediaPane`, `viewAudioPane`, `viewToolsPane`, `viewStudioPane`, `viewTrackingPane`, `viewDomainsPane`). Re-distribute existing sections cleanly so that:
- `🎬 Media` focuses strictly on active video/audio telemetry and player micro-actions.
- `🎛️ Audio` holds Master Volume Boost, 5-band EQ, and sound enhancements.
- `⚡ Tools` houses `#cardSmartAutomations` (moved out of Media) and quick utilities.
- `📚 Studio` houses timestamp notes, bookmarks, screenshot gallery, and resume card.
- `⏱️ Tracking` houses the donut chart, stats pills, and digital wellness cards.
- `🌐 Domains` houses the comprehensive domain breakdown table, search, and category filter (moved out of Tracking).

---

## 📋 2. Prerequisites & Inputs

- File to modify: `popup/popup.html`.
- Active Authorization Token issued by Level 2 Manager (`AUTH-MGR-*`).
- Zero changes to any backend files (`background.js`, servers, sockets).
- All 34 canonical DOM element IDs must be preserved.

---

## 🔍 3. Technical Context & File Anchors

### Current Navigation Anchor (`popup/popup.html` lines 40-58):
```html
<nav class="top-nav-tabs" role="tablist">
  <button id="mainTabMedia" class="top-tab-btn active" data-view="media" role="tab" aria-selected="true" aria-controls="viewMediaPane">...</button>
  <button id="mainTabAudio" class="top-tab-btn" data-view="audio" role="tab" aria-selected="false" aria-controls="viewAudioPane">...</button>
  <button id="mainTabStudio" class="top-tab-btn" data-view="studio" role="tab" aria-selected="false" aria-controls="viewStudioPane">...</button>
  <button id="mainTabTracking" class="top-tab-btn" data-view="tracking" role="tab" aria-selected="false" aria-controls="viewTrackingPane">...</button>
</nav>
```

### Current Panes Layout (`popup/popup.html`):
- `viewMediaPane`: Contains `#mediaSentinelCard` and `#cardSmartAutomations`.
- `viewAudioPane`: Contains Volume Boost, `#audioEqCard`, Enhancements.
- `viewStudioPane`: Contains `#studioNoteCard`, `#studioBookmarksCard`, `#studioScreenshotsCard`, `#studioResumePlaybackCard`.
- `viewTrackingPane`: Contains Chart section, Stats pills, `#cardFocusWellness`, and `.breakdown-section`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Expand `<nav class="top-nav-tabs">` to 6 Single-Word Tab Buttons
Update `<nav class="top-nav-tabs" role="tablist">` to contain exactly 6 buttons with single-word text labels:
```html
<nav class="top-nav-tabs" role="tablist">
  <button id="mainTabMedia" class="top-tab-btn active" data-view="media" role="tab" aria-selected="true" aria-controls="viewMediaPane">
    <span class="top-tab-icon">🎬</span>
    <span id="topTabMediaText" class="top-tab-label">Media</span>
    <span id="tabMediaLiveDot" class="tab-live-dot hidden" title="Media Active"></span>
  </button>
  <button id="mainTabAudio" class="top-tab-btn" data-view="audio" role="tab" aria-selected="false" aria-controls="viewAudioPane">
    <span class="top-tab-icon">🎛️</span>
    <span id="topTabAudioText" class="top-tab-label">Audio</span>
  </button>
  <button id="mainTabTools" class="top-tab-btn" data-view="tools" role="tab" aria-selected="false" aria-controls="viewToolsPane">
    <span class="top-tab-icon">⚡</span>
    <span id="topTabToolsText" class="top-tab-label">Tools</span>
  </button>
  <button id="mainTabStudio" class="top-tab-btn" data-view="studio" role="tab" aria-selected="false" aria-controls="viewStudioPane">
    <span class="top-tab-icon">📚</span>
    <span id="topTabStudioText" class="top-tab-label">Studio</span>
  </button>
  <button id="mainTabTracking" class="top-tab-btn" data-view="tracking" role="tab" aria-selected="false" aria-controls="viewTrackingPane">
    <span class="top-tab-icon">⏱️</span>
    <span id="topTabTrackingText" class="top-tab-label">Tracking</span>
  </button>
  <button id="mainTabDomains" class="top-tab-btn" data-view="domains" role="tab" aria-selected="false" aria-controls="viewDomainsPane">
    <span class="top-tab-icon">🌐</span>
    <span id="topTabDomainsText" class="top-tab-label">Domains</span>
  </button>
</nav>
```

### Step 1.2: Relocate `#cardSmartAutomations` to `#viewToolsPane`
1. Extract `<section id="cardSmartAutomations" class="sub-card automations-card">...</section>` from `#viewMediaPane`.
2. Construct `<div id="viewToolsPane" class="tab-pane" role="tabpanel" aria-labelledby="mainTabTools">`.
3. Insert `#cardSmartAutomations` inside `#viewToolsPane`. Add an optional quick tools bar (e.g. Cinema Dimmer, Sleep Timer trigger shortcut) while ensuring zero duplicate IDs.

### Step 1.3: Relocate `.breakdown-section` to `#viewDomainsPane`
1. Extract `<section class="breakdown-section">...</section>` (containing `#domainSearchInput`, `#domainCategorySelect`, `#domainsListContainer`, `#emptyDomainStateText`) from `#viewTrackingPane`.
2. Construct `<div id="viewDomainsPane" class="tab-pane" role="tabpanel" aria-labelledby="mainTabDomains">`.
3. Place `.breakdown-section` directly inside `#viewDomainsPane`.

### Step 1.4: Update Quick Settings Default Tab Options
In `#quickSettingsPopover`:
Ensure `<select id="selectDefaultTab" ...>` includes options for all 6 tabs:
```html
<option value="media">🎬 Media</option>
<option value="audio">🎛️ Audio</option>
<option value="tools">⚡ Tools</option>
<option value="studio">📚 Studio</option>
<option value="tracking">⏱️ Tracking</option>
<option value="domains">🌐 Domains</option>
```

### Step 1.5: Verify 34 Canonical DOM IDs
Verify that not a single canonical ID has been deleted or renamed.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Zero Backend Changes:** Do NOT touch `background.js`, `content_media.js`, or native daemons.
- **Strict Invariant IDs:** Keep all 34 canonical IDs unchanged.
- **Footer Invariant:** The 7-button footer toolbar (`#btnRefresh`, `#btnGlobalMediaToggle`, `#btnToggleTrackingPause`, `#btnSleepTimerTrigger`, `#btnReconnectWs`, `#btnSwitchMediaTab`, `#btnOpenDashboard`) must remain unchanged in the exact single row.

---

## 📦 6. Deliverables Manifest

- Modified: `popup/popup.html` (with 6 nav tab buttons, 6 tab panels, relocated sections, and updated Quick Settings dropdown).

---

## 🛡️ 7. Local Verification Gate

Execute the syntax and manifest integrity test:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
Must pass with exit code 0 and 100% clean output.
