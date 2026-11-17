# Product Requirements Document (PRD): Multi-Tab Live Media Deck Controls

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/media_deck_controls_wiring/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Task ID:** `TASK-MEDIA-DECK-CONTROLS-001`  
> **Target Platform:** Google Chrome & Microsoft Edge (MV3)

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: The Multi-Tasking Knowledge Worker (Alex)
- **Profile:** Alex constantly works with 30+ browser tabs open across multiple windows. YouTube tutorials, Spotify web player, Zoom web calls, and podcasts are frequently playing in background tabs.
- **Pain Point:** When an urgent call arrives or a video starts blasting loud audio from an unknown tab, Alex has to frantically hunt through dozens of open tabs to locate the noisy video.
- **Need:** A single command deck in the extension dashboard showing all active media streams with instant "Solo Tab", "Mute", and "Switch Tab" buttons to immediately identify, silence, or navigate to that specific tab.

### Persona 2: The Focused Researcher & Content Consumer (Priya)
- **Profile:** Priya watches long lecture videos and podcasts while taking notes in another window. She uses the Sentinel dashboard to track her daily media consumption and background audio activity.
- **Pain Point:** When she wants to rewind 30 seconds or jump to a specific part of a lecture playing in another tab, she has to manually switch windows and find the scrubber on the player.
- **Need:** An interactive mini-timeline right on the media deck card where clicking anywhere on the bar seeks directly to that exact moment in the media stream without having to leave the dashboard.

---

## 📋 2. Functional Requirements (FR)

- **FR-01: Interactive Mini-Scrubber Seeking:**
  - The mini-scrubber (`.deck-mini-scrubber`) inside each media deck card must be interactive and clickable.
  - Clicking on the scrubber must compute the clicked position relative to the element width: `ratio = (clientX - rect.left) / rect.width`.
  - The target timestamp must be computed: `targetTime = ratio * duration`.
  - The target timestamp must be clamped within `[0, duration]`.
  - The dashboard must dispatch a `seek_to` remote command to the target tab via the background service worker.
  - The scrubber progress bar and time display must update optimistically upon click.

- **FR-02: Direct Tab Switching & Window Focusing:**
  - Each media card must display a dedicated "Switch Tab" button (`.btn-deck-switch-tab`) in its controls row.
  - Clicking the button must activate the target tab (`chrome.tabs.update(tabId, { active: true })`).
  - If the browser window containing the tab is minimized, it must be restored to normal state and focused (`chrome.windows.update(winId, { state: 'normal', focused: true })`).

- **FR-03: Play / Pause Remote Control:**
  - Clicking the Play/Pause button (`.btn-deck-play`) must toggle the playback state of the target media tab.
  - The button icon and card status pill must update optimistically (`▶` ↔ `⏸️`).
  - The command must be dispatched via background worker to `content_media.js`.

- **FR-04: Mute / Unmute & Solo Tab Controls:**
  - Clicking the Mute button (`.btn-deck-mute`) must toggle the tab's mute state (`🔇` ↔ `🔊`).
  - Clicking the "Solo Tab" button (`.btn-deck-solo`) must unmute the selected tab and mute all other active media streams across the browser.

- **FR-05: Real-Time Volume Adjustment:**
  - Dragging or adjusting the volume slider (`.deck-volume-slider`) must transmit `set_volume` commands to the target tab.
  - The slider tooltip and aria-label must reflect the current percentage (`0%` - `100%`).

- **FR-06: Telemetry & State Synchronization:**
  - Executing any remote media command must immediately trigger an updated media telemetry broadcast (`LIVE_MEDIA_UPDATE`) to ensure synchronization across all views (Dashboard, Popup, HUD).

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01: W3C Trusted Types Compliance:**
  - 100% of DOM manipulation must utilize safe DOM APIs (`document.createElement`, `classList`, `textContent`, `setAttribute`).
  - Strictly 0 occurrences of `.innerHTML`, `outerHTML`, or `document.write`.

- **NFR-02: Low Latency Response:**
  - Remote command dispatch from click to content script execution must occur within < 50ms.
  - Optimistic UI state updates must render in < 16ms (within a single animation frame).

- **NFR-03: Accessibility (WCAG 2.1 AA):**
  - All interactive buttons must have clear `aria-label` attributes, descriptive tooltips, and focus indicator rings.
  - Sliders must have `role="slider"`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.

- **NFR-04: Cross-Browser Compatibility:**
  - 100% identical functional behavior on both Google Chrome and Microsoft Edge (MV3).
  - Use `browserAPI` abstraction (`typeof chrome !== 'undefined' ? chrome : browser`).

- **NFR-05: Encoding & Secret Hygiene:**
  - All source files must be formatted in UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
  - Pre-push secret scans (`gitleaks`) must report 0 leaks.

---

## 📊 4. MoSCoW Feature Prioritization & INVEST User Stories

### MoSCoW Prioritization
- **Must Have (P0):**
  - Mini-scrubber click-to-seek functionality with boundary clamping.
  - Dedicated "Switch Tab" button on each card with window un-minimize support.
  - Background command handlers for `seek_to` and `switch_tab`.
  - Content script execution of `seek_to` and `seek_percent`.
  - Full test suite verifying command routing and Trusted Types.
- **Should Have (P1):**
  - Optimistic UI updates on card progress bars and status pills.
  - Immediate `LIVE_MEDIA_UPDATE` broadcast post-command.
  - Visual hover feedback on scrubber with pointer cursor and scrub highlight.
- **Could Have (P2):**
  - Smooth scrubber drag preview tooltip showing target time while dragging.
- **Won't Have (P3 - Out of Scope):**
  - Re-writing the 60fps Audio Visualizer FFT algorithms (already certified).
  - Modifying SQLite Native Messaging bridge schemas.

### INVEST-Compliant User Stories

#### Story 1: Click to Seek on Media Deck Card
- **As a** user viewing the media dashboard,
- **I want to** click anywhere on a card's mini progress bar,
- **So that** the media playing in that tab jumps directly to that timestamp.
- **Size:** Medium (3 SP)
- **Acceptance Criteria:**
  - Given an active media card with a duration of 300 seconds,
  - When the user clicks exactly halfway along the mini-scrubber bar,
  - Then a `seek_to` command with `positionSeconds: 150` is sent to the target tab,
  - And the card's progress bar immediately advances to 50%,
  - And the content script updates `primaryMediaElement.currentTime` to 150.

#### Story 2: Jump to Tab Navigation
- **As a** multi-tab user,
- **I want to** click a "Switch Tab" button on a media card,
- **So that** the browser immediately activates that tab and brings its window to the front.
- **Size:** Small (2 SP)
- **Acceptance Criteria:**
  - Given a card representing an active media stream in Tab #42 on Window #2,
  - When the user clicks the "Switch Tab" button,
  - Then `chrome.tabs.update(42, { active: true })` is invoked,
  - And Window #2 is restored from minimized state (if minimized) and focused,
  - And the dashboard remains open in its own tab without crashing.

#### Story 3: Remote Play/Pause and Mute Controls
- **As a** user in the dashboard,
- **I want to** toggle play/pause or mute directly on any card,
- **So that** I can pause distracting audio without navigating away.
- **Size:** Small (2 SP)
- **Acceptance Criteria:**
  - Given a playing media stream in Tab #15,
  - When the user clicks the Pause button,
  - Then the button icon switches to `▶`, the status pill switches to "⏸️ Paused",
  - And the media in Tab #15 pauses immediately.

---

## 🧪 5. Detailed Given-When-Then Acceptance Contracts

```gherkin
Feature: Multi-Tab Live Media Deck Controls

  Scenario: User seeks to 75% on media scrubber
    Given a media stream in Tab 101 with duration 200 seconds and currentTime 20 seconds
    When the user clicks the mini-scrubber at 75% width
    Then handleRemoteMediaCommand is invoked with tabId=101, command="seek_to", value=150
    And background.js routes MEDIA_CONTROL with action="seek_to" and positionSeconds=150 to Tab 101
    And content_media.js sets primaryMediaElement.currentTime to 150
    And the card progress bar updates to 75.0% width

  Scenario: User attempts to seek past end of video
    Given a media stream in Tab 101 with duration 100 seconds
    When an invalid seek command with positionSeconds=150 is received
    Then content_media.js clamps primaryMediaElement.currentTime to exactly 100 seconds
    And no uncaught exceptions are thrown

  Scenario: User switches to background media tab
    Given an open media stream in Tab 202 on Window 5 (currently minimized)
    When the user clicks the "Switch Tab" button on card 202
    Then background.js calls activateAndFocusTab(202)
    And Window 5 is restored to state "normal" and focused=true
    And Tab 202 is marked active=true

  Scenario: DOM Safety & Trusted Types Verification
    Given the media deck renders 5 active cards
    When inspecting the generated DOM tree
    Then exactly 0 calls to innerHTML, outerHTML, or insertAdjacentHTML exist
    And all cards contain valid data-tab-id attributes
    And all buttons contain valid aria-label attributes
```
