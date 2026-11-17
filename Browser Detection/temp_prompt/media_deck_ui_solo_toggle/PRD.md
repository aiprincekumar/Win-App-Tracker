# Product Requirements Document (PRD)
# Task: Multi-Tab Live Media Deck UI Refactor & Two-Way Solo Tab Toggle
# Task ID: TASK-MEDIA-DECK-UI-SOLO-TOGGLE-001

> **Document Type:** Product Requirements Document (`PRD.md`)  
> **Target System:** Web Activity & Media Sentinel MV3 Extension  
> **Lead Department:** Dept 01 Product Requirements & Dept 05 Frontend Engineering  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Power Audio Multitasker ("Dev Alex")
- **Context:** Listens to lofi background music on Spotify Web while watching a tutorial video on YouTube and monitoring an engineering talk on Twitch.
- **Pain Point:** The volume slider on each media card is tiny (55px) and sandwiched between control buttons, making fine volume adjustments erratic.
- **Desired Outcome:** A full-length volume bar right under the progress scrubber that allows smooth, granular volume adjustment.

### Persona 2: Media Focused Operator ("Producer Priya")
- **Context:** Needs to quickly isolate audio from one tab using "Solo Tab" to hear a speech segment, then return to normal multi-stream playback.
- **Pain Point:** Clicking "Solo Tab" isolates the audio, but clicking it again does nothing. She is forced to go through all open tabs and click "Unmute" one by one.
- **Desired Outcome:** Clicking "Solo Tab" on an already soloed tab immediately toggles off solo mode and restores all tabs to their unmuted state.

---

## 📦 2. Functional Requirements (FR)

### FR-1: Dedicated Full-Width Volume Row
- The Multi-Tab Live Media Deck card (`.media-deck-card`) MUST render a dedicated container element `.deck-volume-row` between `.deck-scrubber-row` and `.deck-card-controls`.
- Inside `.deck-volume-row`, an `input[type="range"]` element with class `.deck-volume-slider` MUST be placed.
- The slider MUST span 100% of the card's inner width, matching the horizontal width and alignment of the progress bar in `.deck-scrubber-row`.
- The volume slider MUST support dragging and clicking from `0` to `100`, updating stream volume via `handleRemoteMediaCommand(stream.tabId, 'set_volume', v)`.

### FR-2: Controls Row Auto-Fit & 4-Button Symmetry
- The bottom controls container (`.deck-card-controls`) MUST contain exclusively the 4 action buttons:
  1. `.btn-deck-play` (Play / Pause toggle)
  2. `.btn-deck-mute` (Mute / Unmute toggle)
  3. `.btn-deck-solo` (Solo Tab toggle)
  4. `.btn-deck-switch-tab` (Switch Tab in browser)
- The 4 buttons MUST auto-fit the full horizontal width of `.deck-card-controls` without wrapping, using equal flex distribution (`flex: 1 1 0;`).
- All buttons MUST retain their existing accessibility titles, ARIA labels, and interactive states.

### FR-3: Two-Way Solo Tab Toggle Logic
- Clicking `btnSolo` (`.btn-deck-solo`) when `currentSoloTabId !== stream.tabId` MUST activate solo mode:
  - Set `currentSoloTabId = stream.tabId`.
  - Unmute `stream.tabId` and mute all other open media streams in `cachedStreams`.
  - Add `.solo-active` class to the clicked button.
  - Dispatch `MEDIA_STREAM_SOLO` to `background.js`.
- Clicking `btnSolo` when `currentSoloTabId === stream.tabId` MUST toggle OFF solo mode:
  - Reset `currentSoloTabId = null`.
  - Unmute all open media streams in `cachedStreams` (`isMuted = false`).
  - Remove `.solo-active` class from the button.
  - Dispatch `MEDIA_STREAM_SOLO_CLEAR` (or `MEDIA_STREAM_SOLO` with `soloTabId: null`) to `background.js`.
  - Re-render the media deck cards to reflect updated unmute status pills.

### FR-4: Background Service Worker Synchronization
- In `background.js`, when a `MEDIA_STREAM_SOLO_CLEAR` message is received (or `soloTabId` is null/0):
  - Unmute all media streams recorded in `tabMediaMap`.
  - Send `{ type: 'MEDIA_CONTROL', action: 'unmute' }` to all tab IDs that have active media.
  - If `browserAPI.tabs.update` is available, call it with `{ muted: false }` for each tab.
  - Broadcast `LIVE_MEDIA_UPDATE` so the dashboard UI and any active popup instances reflect the unmuted state immediately.

---

## 🔒 3. Non-Functional Requirements (NFR)

- **NFR-1 (W3C Trusted Types Compliance):** All DOM construction MUST utilize native DOM APIs (`document.createElement`, `classList.add`, `setAttribute`, `textContent`). No `innerHTML`, `outerHTML`, or `insertAdjacentHTML` assignments are permitted.
- **NFR-2 (Character Encoding Standards):** All touched files (`src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/styles/media.css`, `background.js`, test files) MUST strictly preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
- **NFR-3 (Zero Regressions & Full Gate Pass):** All existing 60 test suites plus the new test suite (61 total) MUST pass with exit code 0 when executing `node run_all_tests.js`.
- **NFR-4 (UI Responsiveness):** No layout shifts, horizontal scrollbars, or animation stutter on media cards during slider interactions or solo toggling.

---

## 🧪 4. INVEST-Compliant Acceptance Criteria Contracts

### Contract AC-1: Volume Row Layout
```gherkin
Given a media card rendered in the Multi-Tab Live Media Deck
When the card DOM structure is inspected
Then a container element with class "deck-volume-row" exists directly beneath "deck-scrubber-row" and above "deck-card-controls"
And the element ".deck-volume-slider" is a child of ".deck-volume-row"
And ".deck-volume-slider" has a computed or declared width of 100%
And ".deck-volume-slider" is NOT a child of ".deck-card-controls"
```

### Contract AC-2: Controls Auto-Fit Symmetry
```gherkin
Given a media card rendered in the Multi-Tab Live Media Deck
When ".deck-card-controls" is inspected
Then it contains exactly 4 button elements: ".btn-deck-play", ".btn-deck-mute", ".btn-deck-solo", and ".btn-deck-switch-tab"
And each button has "flex: 1 1 0" or equivalent flex-grow auto-fit styling
And the buttons together span the full available width of ".deck-card-controls"
```

### Contract AC-3: Solo Tab Toggle Activation & Deactivation
```gherkin
Given multiple active media streams (Tab 101, Tab 102, Tab 103)
When the user clicks "btnSolo" on Tab 101 for the first time
Then Tab 101 is unmuted and Tab 102 and Tab 103 are muted
And "btnSolo" on Tab 101 acquires the "solo-active" class
When the user clicks "btnSolo" on Tab 101 a second time
Then "currentSoloTabId" is reset to null
And Tab 101, Tab 102, and Tab 103 are all unmuted
And "btnSolo" on Tab 101 loses the "solo-active" class
And a "MEDIA_STREAM_SOLO_CLEAR" message is sent to background.js
```
