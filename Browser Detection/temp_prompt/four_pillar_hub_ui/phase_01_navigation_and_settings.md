# Phase 01: 4-Pillar Navigation Bar & Quick Settings Header Foundation

> **Phase:** 01 of 06  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/phase_01_navigation_and_settings.md`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Mandatory Anchor:** Load `memory.md`, `dynamic_departments_matrix.md`, and `temp_prompt/four_pillar_hub_ui/INDEX.md` before execution.

---

## 🎯 1. Phase Objective
Expand the top navigation in `popup/popup.html`, `popup/popup.css`, and `popup/popup.js` from 2 tabs to the full 4-Pillar Navigation Bar (`🎬 Player`, `🎛️ Audio Lab`, `📚 Studio`, `⏱️ Focus`), add the Header Quick Settings gear button (`#btnQuickSettings`) and popover panel, and upgrade tab switching logic with persistent storage while maintaining 100% backward compatibility for `#mainTabMedia`, `#mainTabTracking`, `#viewMediaPane`, and `#viewTrackingPane`.

---

## 📋 2. Prerequisites & Inputs
- Existing files: `popup/popup.html`, `popup/popup.css`, `popup/popup.js`.
- Existing verification suite: `tests/test_tab_switch_and_storage_persistence.js`, `tests/test_syntax_and_manifest_integrity.js`.

---

## ⚓ 3. Technical Context & File Anchors
- `popup/popup.html#L36-L48`: Currently holds the 2-tab navigation `<nav class="top-nav-tabs">`.
- `popup/popup.html#L20-L34`: Holds `.header-badges` where the new `#btnQuickSettings` should be anchored.
- `popup/popup.css#L80-L140`: Styling for `.top-nav-tabs`, `.top-tab-btn`, `.tab-pane`.
- `popup/popup.js#L120-L160`: Tab click listeners and switching function `switchViewTab(viewName)`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Update `popup/popup.html` Navigation:**
   - In `<nav class="top-nav-tabs">`, add `#mainTabAudio` (data-view="audio") and `#mainTabStudio` (data-view="studio").
   - Ensure `#mainTabMedia` has data-view="media" and `#mainTabTracking` has data-view="tracking" (and alias data-view="focus").
   - Add empty placeholder panes `<div id="viewAudioPane" class="tab-pane" role="tabpanel">` and `<div id="viewStudioPane" class="tab-pane" role="tabpanel">`.
   - Add Quick Settings button in `.header-badges`:
     ```html
     <button id="btnQuickSettings" class="btn-quick-settings" title="Quick Settings" aria-label="Open Settings">
       ⚙️
     </button>
     ```
   - Add `#quickSettingsPopover` floating popover dialog before closing `sentinel-app` div.

2. **Update `popup/popup.css`:**
   - Ensure `.top-nav-tabs` accommodates 4 equal tab buttons with `flex: 1; min-width: 0;` without text wrapping.
   - Add styles for `.btn-quick-settings`, `#quickSettingsPopover`, and slide-over transition.
   - Enforce 420px max width with zero horizontal overflow.

3. **Update `popup/popup.js`:**
   - Enhance tab click binding: Select all `.top-tab-btn` and listen for `click`.
   - Update `switchViewTab(viewName)` to show `#viewMediaPane`, `#viewAudioPane`, `#viewStudioPane`, or `#viewTrackingPane` accordingly.
   - Store selected tab in `chrome.storage.local` under `active_popup_tab` and remember active state on popup open.
   - Bind `#btnQuickSettings` to toggle `#quickSettingsPopover`.

---

## 🚫 5. Architectural Constraints & Boundaries
- NEVER alter or delete `#mainTabMedia`, `#mainTabTracking`, `#viewMediaPane`, or `#viewTrackingPane`.
- NEVER modify any buttons in the footer toolbar (`#btnRefresh`, `#btnGlobalMediaToggle`, etc.).
- NEVER modify backend daemons or WebSocket client logic.

---

## 📦 6. Deliverables Manifest
- Modified: `popup/popup.html`
- Modified: `popup/popup.css`
- Modified: `popup/popup.js`

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node tests/test_tab_switch_and_storage_persistence.js
node tests/test_syntax_and_manifest_integrity.js
```
Must pass with 100% success and exit code 0.
