# Product Requirements Document (PRD): Primary Media Tab Selection for Mute All Others

> **Document Type:** Product Requirements Document  
> **Workspace Container:** `temp_prompt/mute_all_others_primary_tab_selection/`  
> **Lead Department:** Department 01 (Product Requirements) & Department 04 (Core Logic)  

---

## 🎯 1. Overview & Objective
When users have multiple media tabs open in Chrome (e.g. YouTube, Spotify, video meetings, podcasts) and click "Mute All Others", the system must intuitively preserve the media stream they care about most while silencing everything else. This PRD establishes the functional requirements for primary tab candidate prioritization and bidirectional toggle muting.

---

## 👥 2. User Persona & Problem Statement
- **Persona:** Power user browsing with 20+ tabs across multiple windows, with one primary video or music stream and multiple background media tabs (e.g. ads, preview videos, background twitch streams).
- **Pain Point:** When hitting "Mute All Others", if the user is currently looking at a text document or spreadsheet in their active tab, an arbitrary or non-playing tab might be preserved while their music gets silenced.
- **Goal:** Ensure the system selects the true media focus: an actively playing tab first, then the most recent playback stream, then the current active tab.

---

## 📝 3. Functional Requirements (FR)

### FR-01: 3-Tier Candidate Primary Tab Resolution
When `primaryTabId` is null, undefined, or 0, candidate resolution MUST follow this order:
1. **Tier 1 (Actively Playing):** Check tabs where `isPlaying === true` or `audible === true`. If multiple exist, choose the one with the highest recency or lowest tabId.
2. **Tier 2 (Most Recent Playback):** If no tab is actively playing, inspect media sessions and media history for the most recent video/audio activity (`lastUpdated`, `lastHeartbeat`, or `timestamp`).
3. **Tier 3 (Active Focused Browser Tab):** If no active or recent media session is detected, query the active tab in the last focused window (`active: true, lastFocusedWindow: true`).
4. **Fallback:** If all above fail, select the first valid un-restricted tab, or return `{ success: false, error: 'Invalid primaryTabId' }`.

### FR-02: Preserved Primary Tab Behavior
- The selected primary tab MUST NOT be muted.
- Its tab-level mute state must be set to `false` via `chrome.tabs.update(primaryTabId, { muted: false })`.
- An in-page DOM message MUST be dispatched to unmute internal HTMLMediaElements: `safeSendTabMessage(primaryTabId, { type: 'MEDIA_CONTROL', action: 'unmute' })`.
- Its entry in `tabMediaMap` must reflect `isMuted: false`.

### FR-03: Candidate Tabs Muting
- All other candidate tabs (excluding the selected primary tab and restricted extension URLs) MUST be muted at the tab level (`chrome.tabs.update(id, { muted: true })`).
- All other candidate tabs MUST receive in-page DOM messages to mute HTMLMediaElements: `safeSendTabMessage(id, { type: 'MEDIA_CONTROL', action: 'mute' })`.
- Prior mute states of all candidate tabs MUST be snapshotted into `muteOthersPreviousMuteStates` before applying mute commands.

### FR-04: Bidirectional Toggle Restoration
- Clicking "Mute All Others" again (or sending `MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR`) MUST restore every tab's previous mute state from `muteOthersPreviousMuteStates`.
- The button UI `#btnMuteAllOthers` must toggle text between `🔇 Mute All Others` and `🔊 Unmute All Others`.

---

## 🛡️ 4. Non-Functional Requirements (NFR)
- **NFR-01 (Performance):** Candidate resolution and mute execution must complete within < 150ms.
- **NFR-02 (Robustness):** Unresponsive or crashed tabs must not halt execution; all calls must be wrapped in error guards.
- **NFR-03 (Security & CSP):** Zero inline DOM modifications, W3C Trusted Types compliant.
- **NFR-04 (Maintainability):** All new/modified functions in `background.js` must be <= 50 lines.

---

## 🧪 5. Acceptance Criteria (Given-When-Then)

### Scenario 1: Active Playing Tab Selected over Focused Silent Tab
- **Given:** Tab 101 has active audio playback (`isPlaying: true, audible: true`) and Tab 102 is the focused active window tab (reading an article, silent).
- **When:** User clicks `#btnMuteAllOthers` without selecting a specific tab.
- **Then:** Tab 101 is selected as the primary tab and remains unmuted; Tab 102 is muted; button shows "Unmute All Others".

### Scenario 2: Most Recent Media Selected When All Paused
- **Given:** Tab 201 was paused 2 minutes ago, Tab 202 was paused 10 seconds ago, and neither is currently audible.
- **When:** User triggers "Mute All Others".
- **Then:** Tab 202 is selected as the primary tab and unmuted; Tab 201 is muted.

### Scenario 3: Focused Tab Selected When No Media History Exists
- **Given:** No media has been played yet in the session; Tab 301 is the active focused tab.
- **When:** User triggers "Mute All Others".
- **Then:** Tab 301 is selected as the primary tab and unmuted.

### Scenario 4: Bidirectional Toggle Restores Pre-Mute States
- **Given:** Tab A was unmuted and Tab B was already muted by the user.
- **When:** User triggers "Mute All Others" (Tab A is primary, Tab B muted), then triggers "Unmute All Others".
- **Then:** Tab A remains unmuted, and Tab B returns to its previous muted state.
