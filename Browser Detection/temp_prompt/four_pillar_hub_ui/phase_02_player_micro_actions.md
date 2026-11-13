# Phase 02: Player In-Card Micro-Actions & Smart Automations

> **Phase:** 02 of 06  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/phase_02_player_micro_actions.md`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Mandatory Anchor:** Load `memory.md`, `dynamic_departments_matrix.md`, and `temp_prompt/four_pillar_hub_ui/INDEX.md` before execution.

---

## 🎯 1. Phase Objective
Enhance the Player pane (`#viewMediaPane`) by implementing the In-Card Micro-Actions Bar (`#btnCardScreenshot`, `#btnCardCinemaDim`, `#btnCardLoopMedia`, `#btnCardNextTrack`, `#btnCardCopyTimestamp`) and the Smart Automations Card with glassmorphic toggles, while preserving all existing playback controls, sliders, and badges.

---

## 📋 2. Prerequisites & Inputs
- Phase 01 completed and verified.
- Target files: `popup/popup.html`, `popup/popup.css`, `popup/popup.js`.
- Existing verification suite: `tests/test_volume_timeline_fullscreen_controls.js`, `tests/test_event_deduplication.js`.

---

## ⚓ 3. Technical Context & File Anchors
- `popup/popup.html#L52-L172`: Inside `#mediaSentinelCard` and following `#mediaAdvancedRow`.
- `popup/popup.css#L180-L320`: Player card, controls row, and volume bar styling.
- `popup/popup.js#L250-L400`: Media controls dispatcher `sendMediaControl(action, payload)`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Update `popup/popup.html` (`#viewMediaPane`):**
   - Directly after `#mediaAdvancedRow` (or inside `#mediaDetailsBody`), add `#playerMicroActionsRow`:
     ```html
     <div id="playerMicroActionsRow" class="player-micro-actions-row">
       <button id="btnCardScreenshot" class="micro-action-btn" title="Capture Video Frame" aria-label="Capture Frame">
         <span class="micro-icon">📸</span>
         <span class="micro-label">Snap</span>
       </button>
       <button id="btnCardCinemaDim" class="micro-action-btn" title="Cinema Focus Dimmer" aria-label="Cinema Dimmer">
         <span class="micro-icon">🎯</span>
         <span class="micro-label">Cinema</span>
       </button>
       <button id="btnCardLoopMedia" class="micro-action-btn" title="Loop Current Media" aria-label="Loop Media">
         <span class="micro-icon">🔁</span>
         <span class="micro-label">Loop</span>
       </button>
       <button id="btnCardNextTrack" class="micro-action-btn" title="Next Track / Video" aria-label="Next Track">
         <span class="micro-icon">⏭️</span>
         <span class="micro-label">Next</span>
       </button>
       <button id="btnCardCopyTimestamp" class="micro-action-btn" title="Copy Link with Timestamp" aria-label="Copy Timestamp Link">
         <span class="micro-icon">📋</span>
         <span class="micro-label">Copy Link</span>
       </button>
     </div>
     ```
   - Below `#mediaSentinelCard`, add `#cardSmartAutomations`:
     ```html
     <section id="cardSmartAutomations" class="sub-card automations-card">
       <div class="sub-card-header">
         <span class="sub-card-title">⚡ Smart Automations</span>
       </div>
       <div class="automation-toggle-list">
         <div class="automation-toggle-row">
           <span class="toggle-name">Auto-Pause on New Tab</span>
           <label class="switch-toggle-sm">
             <input type="checkbox" id="toggleAutoPauseNewTab">
             <span class="slider-round-sm"></span>
           </label>
         </div>
         <div class="automation-toggle-row">
           <span class="toggle-name">Auto Ad Silencer</span>
           <label class="switch-toggle-sm">
             <input type="checkbox" id="toggleAutoAdSilence">
             <span class="slider-round-sm"></span>
           </label>
         </div>
         <div class="automation-toggle-row">
           <span class="toggle-name">Domain Speed Memory</span>
           <label class="switch-toggle-sm">
             <input type="checkbox" id="toggleDomainSpeedMemory" checked>
             <span class="slider-round-sm"></span>
           </label>
         </div>
       </div>
     </section>
     ```

2. **Update `popup/popup.css`:**
   - Add styles for `.player-micro-actions-row` and `.micro-action-btn` with compact flex spacing (`gap: 6px`).
   - Add styles for `.automations-card`, `.automation-toggle-row`, and glassmorphic toggle styling.

3. **Update `popup/popup.js`:**
   - Wire event listeners for:
     - `#btnCardScreenshot`: Calls `chrome.tabs.captureVisibleTab` or sends IPC; triggers toast "Screenshot captured!".
     - `#btnCardCinemaDim`: Toggles active cinema dimmer mode.
     - `#btnCardLoopMedia`: Toggles loop state and updates button active state.
     - `#btnCardNextTrack`: Sends `NEXT_TRACK` media control.
     - `#btnCardCopyTimestamp`: Calculates current seconds, updates URL with `&t=X`, writes to clipboard, shows toast "Link copied!".
   - Wire change listeners for automation toggles and save state to `chrome.storage.local`.

---

## 🚫 5. Architectural Constraints & Boundaries
- Do NOT delete or hide existing media controls (`#btnCtrlTogglePlay`, `#btnCtrlRewind`, `#btnCtrlForward`, `#btnCtrlToggleMute`).
- Ensure all micro-actions degrade gracefully if no tab is currently playing media.

---

## 📦 6. Deliverables Manifest
- Modified: `popup/popup.html`
- Modified: `popup/popup.css`
- Modified: `popup/popup.js`

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node tests/test_volume_timeline_fullscreen_controls.js
node tests/test_event_deduplication.js
```
Must pass with 100% success and exit code 0.
