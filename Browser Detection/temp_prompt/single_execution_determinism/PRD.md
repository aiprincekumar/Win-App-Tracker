# Product Requirements Document (PRD)
## Single-Execution Determinism & Double-Toggle Elimination

> **Component:** Extension Media Controller & On-Video HUD  
> **Epic:** Core Reliability & Playback Determinism  
> **Document Status:** `APPROVED FOR EXECUTION`  
> **Governance Standard:** Universal Rule 22 & Level 3C Specialist  

---

## 1. Objectives & Executive Scope

### 1.1 Problem Statement
When users interact with media controls in the popup dashboard (Play/Pause, Seek Rewind, Seek Forward, Mute, Speed, Fullscreen), videos frequently oscillate or fail to toggle cleanly. This is caused by duplicate execution paths across the popup scripting API and the content script IPC bridge, triggering multiple rapid state changes.

### 1.2 Core Objective
Establish a single authoritative command pathway where:
1. Every user action in the popup triggers exactly one IPC message.
2. Every incoming command in the content script executes via exactly one execution mechanism.
3. Redundant, competing, or overlapping scripts are completely eliminated.
4. Existing cooldown locks, telemetry deduplication, and global media toggles remain 100% operational.

---

## 2. Functional Requirements (FR)

- **FR-1: Single-Execution Play/Pause Toggle**
  Clicking `#btnCtrlTogglePlay` or `#dynamicStatusBtn` must trigger a single toggle. A playing video must pause cleanly; a paused video must play cleanly. Zero double-toggling or oscillation permitted.
- **FR-2: Single-Execution Mute/Unmute Toggle**
  Clicking `#btnCtrlToggleMute` or `#btnQuickMute` must toggle audio mute state exactly once.
- **FR-3: Single-Click Fullscreen Action**
  Clicking `#btnCtrlFullscreen` must click the on-video floating button (`__sentinel_fs_floating_btn__`) or invoke the fullscreen controller exactly once, entering fullscreen without immediate exit bounce.
- **FR-4: Single-Step Speed & Relative Seek**
  Clicking speed steppers (`#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`) must step speed by exactly 0.25x. Clicking seek buttons (`#btnCtrlRewind`, `#btnCtrlForward`) must seek by exactly ±10 seconds without double stepping.
- **FR-5: Optimistic State Lock & Cooldown Retention**
  All cooldown timers (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, `lastProgressDragTime`, `lastVolumeChangeTime`) and the 800ms cooldown guards in `renderMediaCard` must be retained to prevent UI flicker.
- **FR-6: Universal Global Media Toggle Isolation**
  `#btnGlobalMediaToggle` must remain strictly isolated and bound exclusively to `TOGGLE_GLOBAL_MEDIA` without interference from single-tab controls.

---

## 3. Non-Functional Requirements (NFR)

- **NFR-1: Determinism & Zero Race Conditions**
  The system must have zero concurrent execution paths for any individual media toggle command.
- **NFR-2: Zero Conflicting Scripts in Button Handlers**
  No media control button in `popup.js` shall invoke `browserAPI.scripting.executeScript` to manipulate media playback state.
- **NFR-3: Sub-15ms Local IPC Dispatch**
  `sendMediaControl` must dispatch immediately to the background service worker without awaiting asynchronous script injections.
- **NFR-4: 100% Syntax & W3C Trusted Types Safety**
  Zero syntax errors across all workspace files (`node -c`); zero `innerHTML` assignments in injected scripts.
- **NFR-5: Complete Regression Suite Pass**
  All 28+ test suites in `tests/` must pass with exit code 0.

---

## 4. INVEST-Compliant User Stories

### Story 1: Reliable Video Play/Pause
- **As a** user watching YouTube or HTML5 video,
- **I want** clicking Play/Pause in the extension popup to cleanly toggle the playback state once,
- **So that** my video pauses when I want it to pause and plays when I want it to play without flickering or unpausing itself.

### Story 2: Instant Fullscreen Toggle
- **As a** user viewing a video in a browser tab,
- **I want** clicking the Fullscreen button in the popup to enter fullscreen seamlessly,
- **So that** I don't experience a rapid double-click that enters and immediately exits fullscreen mode.

### Story 3: Accurate Stepped Seeking & Speed Control
- **As a** user navigating a video tutorial or lecture,
- **I want** clicking Rewind or Fast Forward to skip exactly 10 seconds, and Speed Up to increment by exactly 0.25x,
- **So that** my seeking and speed adjustments are predictable and exact.

---

## 5. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Play/Pause Single Execution
- **Given** an active YouTube video is currently playing,
- **When** the user clicks `#btnCtrlTogglePlay` in the popup,
- **Then** the popup sets `lastPlayToggleTime = Date.now()`, updates cached state optimistically, and dispatches `sendMediaControl('toggle_play', {}, targetTabId)`,
- **And** 0 `executeScript` calls are dispatched by the button handler,
- **And** the video pauses cleanly without resuming.

### Contract 2: Fullscreen Single Execution
- **Given** a video is playing with `__sentinel_fs_floating_btn__` present in the DOM,
- **When** the user clicks `#btnCtrlFullscreen` in the popup,
- **Then** `sendMediaControl('toggle_fullscreen', {}, targetTabId)` is dispatched,
- **And** the content script clicks `__sentinel_fs_floating_btn__` exactly once,
- **And** the video remains in fullscreen mode.

### Contract 3: Universal Play/Pause Invariant
- **Given** multiple media tabs are active across browser windows,
- **When** the user clicks `#btnGlobalMediaToggle`,
- **Then** an IPC message with `{ type: 'TOGGLE_GLOBAL_MEDIA' }` is dispatched,
- **And** single-tab media controls are not executed.
