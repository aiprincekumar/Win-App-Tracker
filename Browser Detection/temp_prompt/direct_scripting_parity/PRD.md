# Parity Overhaul: Direct 0ms Main World Scripting Restoration & Popup-Dashboard Media Actuation Parity
## Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Task ID:** `TASK-PARITY-OVERHAUL-DIRECT-SCRIPTING-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Ephemeral Container:** `temp_prompt/direct_scripting_parity/`  

---

## 🎯 1. Executive Product Vision

The Web Activity & Media Sentinel browser extension provides high-performance, real-time media telemetry and playback control for web media. Users interacting with the extension popup demand instantaneous, tactile responsiveness: when clicking Play, Pause, Seek, Mute, or Speed buttons, media in the active tab must actuate instantaneously (0ms perceptible lag) without perceptible hesitation or frame stutter.

This PRD formalizes the requirements to achieve zero-latency media actuation in the extension popup by restoring direct MAIN world scripting in full parity with the full-page dashboard, while unblocking direct element actuation in the content script and preserving all global controls.

---

## 👥 2. User Personas

### Persona 1: Power Media Consumer (Alex)
- **Profile:** Frequently watches YouTube lectures, tutorials, and listens to background streams across multiple browser windows.
- **Pain Point:** Clicking "Play" or "Rewind 10s" from the popup previously had an intermittent 50ms–100ms lag before the video actually responded, whereas dragging the volume slider felt instantaneous.
- **Expectation:** All buttons in the popup must react with the exact same 0ms instant responsiveness as the volume and timeline sliders, and identical to the full dashboard.

### Persona 2: Studio Audio/Video Producer (Priya)
- **Profile:** Uses the extension's Audio Lab, DSP tools, and speed steppers for transcription and audio analysis.
- **Pain Point:** Speed stepping (0.25x steps) must immediately change playback pitch/rate on the video element without dropping frames or requiring background IPC completion.
- **Expectation:** Speed adjustments must take effect immediately on the page while background state telemetry syncs transparently.

---

## 📋 3. MoSCoW Feature Prioritization

### Must Have (P0)
- **P0.1: Direct Scripting in Popup Button Handlers:** Restore `browserAPI.scripting.executeScript` with `world: 'MAIN'` across `#btnCtrlTogglePlay`, `#dynamicStatusBtn`, `#btnCtrlRewind`, `#btnCtrlForward`, `#btnCtrlToggleMute`, `#btnQuickMute`, `#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`, `#btnCtrlFullscreen`, `#btnCtrlPip`, `#btnCtrlTheater`, `#btnCtrlQualityDown`, `#btnCtrlQualityUp`.
- **P0.2: Dual Actuation Pattern:** Each button handler must execute the direct script first for 0ms in-tab response, followed immediately by `sendMediaControl(...)` for IPC state synchronization.
- **P0.3: Content Script Direct Execution Unblock:** In `content_media.js`, unblock direct `primaryMediaElement` execution so HTML5 elements respond deterministically regardless of whether the action was forwarded to the main world bridge.
- **P0.4: Preservation of `#btnGlobalMediaToggle`:** Universal multi-tab Play/Pause button remains 100% untouched and bound to `TOGGLE_GLOBAL_MEDIA`.
- **P0.5: Preservation of Cooldown Timestamps:** All optimistic state locks (`lastPlayToggleTime`, `lastMuteToggleTime`, etc.) and `renderMediaCard` flicker guards remain frozen.
- **P0.6: Test Suite Alignment:** Update `tests/test_media_controls_and_fullscreen_fix.js` to assert the dual-actuation architecture and pass 100% green.

### Should Have (P1)
- **P1.1: Multi-Frame Target Support:** In speed, quality, and volume handlers, support `allFrames: true` where appropriate to control embedded iframe players.
- **P1.2: Fallback Tab Resolution:** Ensure `targetTabId` consistently resolves via `getActiveMediaTabId()` with active tab fallback.

### Could Have (P2)
- **P2.1: Visual Feedback Parity:** Ensure button active states and ripple effects provide instant visual feedback on click.

### Won't Have (P3 - Out of Scope)
- **P3.1: No UI Layout Redesign:** Do not alter the CSS layout, DOM structure, or theme variables of the popup or dashboard.
- **P3.2: No Protocol Changes:** Do not alter the underlying IPC message envelope format (`MEDIA_CONTROL`, `CONTROL_MEDIA`, `TOGGLE_GLOBAL_MEDIA`).

---

## 📜 4. INVEST-Compliant User Stories & Acceptance Criteria

### User Story 1: Instantaneous Play/Pause Actuation
**As a** user watching video in an active tab,  
**I want** clicking the Play/Pause button in the popup to toggle video playback instantaneously,  
**So that** I experience zero perceptible actuation delay.

#### Acceptance Criteria (Contract):
```gherkin
Given a video is actively playing in the target media tab
When I click #btnCtrlTogglePlay or #dynamicStatusBtn in the popup
Then browserAPI.scripting.executeScript is executed immediately with world: 'MAIN' targeting the tab
And the video in the page toggles play/pause state within 0ms
And sendMediaControl('toggle_play', {}, targetTabId) is dispatched to background
And optimistic state cooldown timestamps are updated
```

### User Story 2: Immediate Seek Scrubbing & Step Buttons
**As a** user reviewing media content,  
**I want** clicking Rewind (-10s) or Forward (+10s) to immediately jump the video timeline,  
**So that** I can rapidly locate key moments without waiting for IPC message round-trips.

#### Acceptance Criteria (Contract):
```gherkin
Given media is loaded at 45.0 seconds
When I click #btnCtrlRewind in the popup
Then browserAPI.scripting.executeScript runs on the page adjusting currentTime to 35.0s
And sendMediaControl('seek_relative', { offsetSeconds: -10 }, targetTabId) is dispatched
And the popup UI optimistically reflects the new time
```

### User Story 3: Deterministic Speed Stepping
**As a** user adjusting playback speed,  
**I want** clicking Speed Up (+0.25x) or Speed Down (-0.25x) to immediately shift playbackRate in the page,  
**So that** the audio/video tempo changes seamlessly.

#### Acceptance Criteria (Contract):
```gherkin
Given playbackRate is 1.0x
When I click #btnCtrlSpeedUp in the popup
Then browserAPI.scripting.executeScript sets movie_player and video element playbackRate to 1.25x
And sendMediaControl('step_speed', { direction: 'up', targetSpeed: 1.25, step: 0.25 }, targetTabId) is dispatched
And speed badges update optimistically
```

### User Story 4: Isolated Global Media Toggle Invariant
**As a** user with multiple media tabs open,  
**I want** clicking the Global Media Toggle (#btnGlobalMediaToggle) to pause/resume all tabs globally,  
**So that** multi-tab playback is managed without interfering with single-tab controls.

#### Acceptance Criteria (Contract):
```gherkin
Given multiple tabs are playing media
When I click #btnGlobalMediaToggle
Then browserAPI.runtime.sendMessage is invoked with { type: 'TOGGLE_GLOBAL_MEDIA' }
And no single-tab executeScript or direct single-tab control is executed
And global media state is refreshed
```

---

## ⚡ 5. Non-Functional Requirements (NFR)

1. **Latency:** Local script execution on the tab DOM must occur within < 1ms of user click.
2. **Deterministic Fallback:** If `browserAPI.scripting` fails or is rejected, `sendMediaControl(...)` guarantees background IPC delivery.
3. **W3C Trusted Types Compliance:** Zero `innerHTML` assignments; all DOM operations strictly use `textContent`, `setAttribute`, or Trusted Types-compliant APIs.
4. **Zero Regression:** All 31 existing test suites in the `tests/` directory must continue to pass with 100% success.
5. **Security & Secrets:** Strict zero credential leakage; `gitleaks detect --redact` must pass with 0 findings.
