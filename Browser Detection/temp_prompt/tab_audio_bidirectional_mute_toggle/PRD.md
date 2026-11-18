# Product Requirements Document (PRD)
# Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
# Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001

> **Document Type:** Product Requirements Document (PRD)  
> **Lead Department:** Dept 01 Product Requirements  
> **Target Audience:** Frontend Engineers, Backend Engineers, QA Engineers

---

## 🎯 1. Overview & Business Value
Users monitoring and managing multi-tab audio playback need reliable, predictable controls to mute, unmute, and solo individual tabs. Previously, muting actions were largely one-way operations: entering solo mode or muting other tabs meant the user had to manually unmute each tab one by one. This feature provides intuitive two-way toggle behavior with instant state restoration, empowering users to switch contexts effortlessly.

---

## 👥 2. User Personas
- **P1: Power Audio Multitasker:** Listens to music on YouTube while monitoring tutorial videos, podcasts, or meeting tabs. Needs to quickly solo one tab to hear dialogue, then click once to return to normal playback.
- **P2: Privacy & Noise Conscious User:** Needs an immediate "Mute All" emergency killswitch when entering a call or quiet room, and a 1-click restore once done.

---

## 📋 3. Functional Requirements (FR)

### FR-1: Two-Way Solo Tab Toggle & State Revert
- **FR-1.1:** Clicking the Solo Tab button (`btnSolo` 🎧) on an active media card when solo is inactive must:
  - Snapshot the current mute state of all other active tabs.
  - Unmute the target tab.
  - Mute all other active media tabs.
  - Apply the `.solo-active` visual indicator to the button.
- **FR-1.2:** Clicking the Solo Tab button on the currently soloed tab must:
  - Deactivate solo mode.
  - Restore all other tabs to their exact pre-solo mute states.
  - Remove the `.solo-active` visual indicator.
  - Clear the solo state in the background service worker.

### FR-2: Two-Way "Mute All Others" Toggle
- **FR-2.1:** Clicking "Mute All Others" (`#btnMuteAllOthers`) when inactive must:
  - Snapshot the mute states of all non-primary tabs.
  - Mute all non-primary tabs while leaving the currently selected/active tab audible.
  - Update button text to "🔊 Restore All Others" (or bilingual equivalent) and apply `.active` class.
- **FR-2.2:** Clicking "Restore All Others" when active must:
  - Restore each non-primary tab to its pre-muted state.
  - Update button text back to "🔇 Mute All Others" and remove `.active` class.

### FR-3: Two-Way "Mute All" Master Toggle
- **FR-3.1:** A new button "🔇 Mute All" (`#btnMuteAll`) must be present in `.media-deck-header-actions`.
- **FR-3.2:** Clicking "Mute All" when inactive must:
  - Snapshot the mute states of all active tabs.
  - Mute all active media tabs.
  - Update button text to "🔊 Unmute All" (or bilingual equivalent) and apply `.active` class.
- **FR-3.3:** Clicking "Unmute All" when active must:
  - Unmute all tabs (or restore pre-mute states).
  - Update button text back to "🔇 Mute All" and remove `.active` class.

### FR-4: Bidirectional Telemetry & Synchronization
- **FR-4.1:** All state changes triggered in the GUI must dispatch IPC messages to `background.js`.
- **FR-4.2:** The background service worker must update `tabMediaMap` and invoke `browserAPI.tabs.update(tabId, { muted: boolean })`.
- **FR-4.3:** The background must broadcast `LIVE_MEDIA_UPDATE` to synchronize all open popups and dashboards.

---

## 🔒 4. Non-Functional Requirements (NFR)
- **NFR-1 (Performance):** Toggle reaction time must be < 50ms locally, with IPC propagation < 100ms.
- **NFR-2 (Security):** 100% W3C Trusted Types compliant (strictly zero `innerHTML` or `outerHTML`).
- **NFR-3 (Encoding):** All modified and created files must strictly use UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
- **NFR-4 (Accessibility):** WCAG 2.1 AA compliant. All buttons must have descriptive `title` and `aria-label` attributes.

---

## 🧪 5. Acceptance Criteria (Given-When-Then Contracts)

### Contract 1: Solo Tab Toggle & Revert
- **Given** Tabs A (unmuted), B (unmuted), and C (muted by user) are playing.
- **When** User clicks Solo on Tab A.
- **Then** Tab A is unmuted, Tab B is muted, Tab C remains muted. Button A shows `.solo-active`.
- **When** User clicks Solo on Tab A again.
- **Then** Solo mode is cleared. Tab A is unmuted, Tab B is unmuted, and Tab C reverts to muted. Button A clears `.solo-active`.

### Contract 2: Mute All Others Toggle
- **Given** Primary Tab 101 and secondary Tabs 102 and 103 are playing unmuted.
- **When** User clicks "Mute All Others".
- **Then** Tabs 102 and 103 are muted. Button label updates to "🔊 Restore All Others".
- **When** User clicks "Restore All Others".
- **Then** Tabs 102 and 103 are restored to unmuted. Button label updates to "🔇 Mute All Others".

### Contract 3: Mute All Master Toggle
- **Given** Tabs 101, 102, and 103 are playing.
- **When** User clicks "Mute All".
- **Then** Tabs 101, 102, and 103 are all muted. Button label updates to "🔊 Unmute All".
- **When** User clicks "Unmute All".
- **Then** Tabs 101, 102, and 103 are all unmuted. Button label updates to "🔇 Mute All".
