# Phase 03: JavaScript Tab Switching Logic & State Persistence

> **Task ID:** `TASK-POPUP-6TAB-UIUX-001-P03`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Status:** READY FOR SUBAGENT EXECUTION  

---

## 🎯 1. Phase Objective

Update `popup/popup.js` to register all 6 tabs in the `switchTopTab` function, wire event listeners for `#mainTabTools` and `#mainTabDomains`, persist the active tab to `chrome.storage.local` (`active_popup_tab`), and ensure smooth initialization on popup boot and Quick Settings changes without violating W3C Trusted Types or introducing innerHTML CSP vulnerabilities.

---

## 📋 2. Prerequisites & Inputs

- Completed Phase 01 & 02: `popup.html` and `popup.css` now contain all 6 tabs and view panels.
- Target file: `popup/popup.js`.
- Requirement: Zero syntax errors, zero dangling braces, zero unsafe innerHTML concatenation.

---

## 🔍 3. Technical Context & File Anchors

### Current `switchTopTab` Anchor (`popup/popup.js` lines 691-723):
```javascript
function switchTopTab(tabName, isManual = false) {
  if (isManual) {
    userManualOverride = true;
  }
  const normalized = (tabName === 'focus') ? 'tracking' : tabName;
  activeTopTab = normalized;

  const tabs = [
    { id: 'mainTabMedia', paneId: 'viewMediaPane', key: 'media' },
    { id: 'mainTabAudio', paneId: 'viewAudioPane', key: 'audio' },
    { id: 'mainTabStudio', paneId: 'viewStudioPane', key: 'studio' },
    { id: 'mainTabTracking', paneId: 'viewTrackingPane', key: 'tracking' }
  ];
  ...
```

### Current `setupEventListeners` Anchor (`popup/popup.js` lines 1909-1945):
```javascript
  const tabMediaBtn = document.getElementById('mainTabMedia');
  const tabAudioBtn = document.getElementById('mainTabAudio');
  const tabStudioBtn = document.getElementById('mainTabStudio');
  const tabTrackingBtn = document.getElementById('mainTabTracking');
```

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: Expand the Canonical `tabs` Array in `switchTopTab`
Update the `tabs` array in `switchTopTab` to include `tools` and `domains`:
```javascript
function switchTopTab(tabName, isManual = false) {
  if (isManual) {
    userManualOverride = true;
  }
  const normalized = (tabName === 'focus') ? 'tracking' : tabName;
  activeTopTab = normalized;

  const tabs = [
    { id: 'mainTabMedia', paneId: 'viewMediaPane', key: 'media' },
    { id: 'mainTabAudio', paneId: 'viewAudioPane', key: 'audio' },
    { id: 'mainTabTools', paneId: 'viewToolsPane', key: 'tools' },
    { id: 'mainTabStudio', paneId: 'viewStudioPane', key: 'studio' },
    { id: 'mainTabTracking', paneId: 'viewTrackingPane', key: 'tracking' },
    { id: 'mainTabDomains', paneId: 'viewDomainsPane', key: 'domains' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.id);
    const pane = document.getElementById(t.paneId);
    if (!btn || !pane) return;
    if (t.key === normalized) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      pane.classList.add('active');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      pane.classList.remove('active');
    }
  });

  try {
    browserAPI.storage.local.set({ active_popup_tab: normalized });
  } catch (_) {}
}
```

### Step 3.2: Bind Event Listeners in `setupEventListeners()`
In `setupEventListeners()`:
```javascript
  const tabMediaBtn = document.getElementById('mainTabMedia');
  const tabAudioBtn = document.getElementById('mainTabAudio');
  const tabToolsBtn = document.getElementById('mainTabTools');
  const tabStudioBtn = document.getElementById('mainTabStudio');
  const tabTrackingBtn = document.getElementById('mainTabTracking');
  const tabDomainsBtn = document.getElementById('mainTabDomains');
  const btnGoToTracking = document.getElementById('btnGoToTracking');

  if (tabMediaBtn) {
    tabMediaBtn.addEventListener('click', () => switchTopTab('media', true));
  }
  if (tabAudioBtn) {
    tabAudioBtn.addEventListener('click', () => switchTopTab('audio', true));
  }
  if (tabToolsBtn) {
    tabToolsBtn.addEventListener('click', () => switchTopTab('tools', true));
  }
  if (tabStudioBtn) {
    tabStudioBtn.addEventListener('click', () => switchTopTab('studio', true));
  }
  if (tabTrackingBtn) {
    tabTrackingBtn.addEventListener('click', () => switchTopTab('tracking', true));
  }
  if (tabDomainsBtn) {
    tabDomainsBtn.addEventListener('click', () => switchTopTab('domains', true));
  }
  if (btnGoToTracking) {
    btnGoToTracking.addEventListener('click', () => switchTopTab('tracking', true));
  }
```

### Step 3.3: Align Quick Settings Default Tab Persistence
In `loadQuickSettings()` and `saveQuickSettings()`:
Ensure that valid default tab keys include `'tools'` and `'domains'`:
```javascript
const validTabs = ['media', 'audio', 'tools', 'studio', 'tracking', 'domains'];
```

### Step 3.4: AST & Syntax Check
Compile `popup/popup.js` via `node -c` to ensure 0 syntax errors and balanced braces.

---

## 🚫 5. Architectural Constraints & Boundaries

- Zero assignments to `innerHTML` that concatenate strings (W3C Trusted Types safe).
- Do NOT alter background communication messages or IPC channels.
- Keep event listener registrations idempotent (`if (popupListenersAttached) return;`).

---

## 📦 6. Deliverables Manifest

- Modified: `popup/popup.js` (with 6-tab switching registry, listeners, and storage sync).

---

## 🛡️ 7. Local Verification Gate

Execute syntax compilation and tab switching tests:
```powershell
node -c popup/popup.js
node tests/test_tab_switch_and_storage_persistence.js
```
Must pass with exit code 0.
