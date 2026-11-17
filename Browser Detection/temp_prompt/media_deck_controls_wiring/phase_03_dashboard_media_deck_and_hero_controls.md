# Phase 3: Dashboard Media Deck & Hero Player UI Controls Wiring

> **Phase Identifier:** `PHASE-03-DASHBOARD-CONTROLS-UI`  
> **Target Task ID:** `TASK-MEDIA-DECK-CONTROLS-001`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Workspace Container:** `temp_prompt/media_deck_controls_wiring/`  
> **Target Files:**  
> - [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///C:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js)  
> - [`dashboard/dashboard.js`](file:///C:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)

---

## 🎯 1. Phase Objective
Wire interactive click-to-seek functionality on the Multi-Tab Live Media Deck's mini-scrubber, add a dedicated accessible "Switch Tab" button on each deck card, ensure optimistic state updates for all card controls (Play/Pause, Mute, Volume), and guarantee full IPC parity with the Hero Player controls without altering any existing UI/UX or styles.

---

## 📋 2. Prerequisites & Environment Inputs
- Phase 1 and Phase 2 backend & content script IPC handlers in place.
- W3C Trusted Types policy loaded and active (strictly zero `.innerHTML`).

---

## 🔍 3. Technical Context & File Anchors
- **File 1:** `src/dashboard/features/media_deck_visualizer_feature.js`
  - **Anchor 1 (Lines 53-125):** `handleRemoteMediaCommand`
  - **Anchor 2 (Lines 315-334):** Mini scrubber creation in `renderMultiTabMediaDeck`
  - **Anchor 3 (Lines 336-397):** Controls row assembly in `renderMultiTabMediaDeck`
- **File 2:** `dashboard/dashboard.js`
  - **Anchor 1 (Lines 7127-7175):** Hero Play/Pause and Mute listeners
  - **Anchor 2 (Lines 7478-7496):** Hero Switch to Media Tab button listener
  - **Anchor 3 (Lines 7577-7750):** Hero Progress Bar & Timeline Scrubber listeners

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Interactive Mini-Scrubber Seeking in `media_deck_visualizer_feature.js`
In `renderMultiTabMediaDeck`:
1. Make `.deck-mini-scrubber` interactive:
   ```javascript
   miniScrubber.style.cursor = 'pointer';
   miniScrubber.setAttribute('role', 'slider');
   miniScrubber.setAttribute('aria-label', `Timeline for ${stream.title || 'Tab'}`);
   miniScrubber.setAttribute('aria-valuemin', '0');
   miniScrubber.setAttribute('aria-valuemax', '100');
   miniScrubber.setAttribute('aria-valuenow', String(Math.round(pct)));
   
   miniScrubber.addEventListener('click', (e) => {
     e.stopPropagation();
     const rect = miniScrubber.getBoundingClientRect();
     if (rect.width <= 0) return;
     const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
     const ratio = clickX / rect.width;
     const dur = (typeof stream.duration === 'number' && Number.isFinite(stream.duration) && stream.duration > 0)
       ? stream.duration
       : 0;
     if (dur <= 0) return;
     
     const targetSeconds = Math.max(0, Math.min(dur, ratio * dur));
     progress.style.width = `${(ratio * 100).toFixed(1)}%`;
     timeSpan.textContent = `${formatDurationSec(targetSeconds)} / ${formatDurationSec(dur)}`;
     
     handleRemoteMediaCommand(stream.tabId, 'seek_to', targetSeconds, options);
   });
   ```

### Step 2: Add Dedicated "Switch Tab" Button to Deck Cards
In `controlsRow` inside `renderMultiTabMediaDeck`:
1. Create `.btn-deck-switch-tab`:
   ```javascript
   const btnSwitchTab = doc.createElement('button');
   btnSwitchTab.className = 'btn-deck-ctrl btn-deck-switch-tab';
   btnSwitchTab.textContent = translate('btn_switch_tab') || '🎯 Switch Tab';
   btnSwitchTab.setAttribute('title', 'Switch to this media tab in browser');
   btnSwitchTab.setAttribute('aria-label', `Switch to tab ${stream.tabId}`);
   btnSwitchTab.addEventListener('click', (e) => {
     e.stopPropagation();
     handleRemoteMediaCommand(stream.tabId, 'switch_tab', 0, options);
   });
   controlsRow.appendChild(btnSwitchTab);
   ```

### Step 3: Support `seek_to` and `switch_tab` in `handleRemoteMediaCommand`
Expand `handleRemoteMediaCommand(tabId, command, value, options)`:
1. When `command === 'switch_tab'`, send `DASHBOARD_REMOTE_MEDIA_CMD` with `command: 'switch_tab'`. Also invoke `api.runtime.sendMessage({ type: 'JUMP_TO_MEDIA_TAB', tabId: numTabId })` as a resilient fallback.
2. When `command === 'seek_to'`, optimistically update cached stream `currentTime`:
   ```javascript
   if (command === 'seek_to') {
     cachedStreams = cachedStreams.map(s => {
       if (s.tabId === numTabId) {
         return { ...s, currentTime: Number(value) || 0 };
       }
       return s;
     });
   }
   ```

### Step 4: Verify Hero Player Bidirectional Synchronization in `dashboard.js`
1. Ensure `#btnHeroPlayPause`, `#btnHeroMute`, `#heroVolumeBar`, `#btnHeroSwitchTab`, and `#heroProgressBar` dispatch commands cleanly.
2. Confirm that when a tab is controlled via the Deck, the Hero Player updates if that tab is the active `primaryMedia`.
3. Preserve all CSS classes and markup (strictly zero visual mutations).

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- Strictly ZERO `.innerHTML` or `.outerHTML` usage (W3C Trusted Types compliant).
- Maintain existing visual layout, button sizes, colors, and margins.
- Maintain 100% UTF-8 with BOM standard.

---

## 📦 6. Deliverables Manifest
- Updated `src/dashboard/features/media_deck_visualizer_feature.js`.
- Verified `dashboard/dashboard.js`.

---

## 🧪 7. Local Verification Gate
Execute the following verification commands:
```powershell
node -c src/dashboard/features/media_deck_visualizer_feature.js
node -c dashboard/dashboard.js
```
Both commands must exit with code 0.
