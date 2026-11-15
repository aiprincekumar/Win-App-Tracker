# Product Requirements Document (PRD)
## Unconditional IPC Media Control Dispatch & Real Functional Verification

> **Feature Name:** Unconditional IPC Media Control Dispatch & Real Functional Verification  
> **Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Target Release:** MV3 Extension Core Media Engine Rectification  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Daily Multitasking User
- **Need:** Controls YouTube, Spotify, or educational videos from the extension popup without switching tabs.
- **Pain Point:** Clicking Play/Pause, Rewind, or Speed changes occasionally did not sync with the background tracker or native HUD because IPC messages were swallowed when direct in-page script injection resolved.
- **Expected Outcome:** Immediate video response AND accurate background telemetry, status badge updates, and native HUD synchronization.

### Persona 2: Extension Architecture & QA Engineer
- **Need:** Reliable, deterministic automated test verification that prevents regression and guarantees all media control buttons emit appropriate IPC messages.
- **Pain Point:** Previous tests used brittle substring matching that enforced an anti-pattern (requiring IPC to ONLY be in catch blocks).
- **Expected Outcome:** AST and functional runtime mock testing that validates genuine DOM click-to-IPC routing and top-frame execution.

---

## 📋 2. Functional Requirements (FR)

| ID | Category | Requirement Description | MoSCoW |
| :--- | :--- | :--- | :--- |
| **FR-01** | Media Controls | `#btnCtrlTogglePlay` and `#dynamicStatusBtn` MUST unconditionally invoke `sendMediaControl('toggle_play')`. | **Must Have** |
| **FR-02** | Media Controls | `#btnCtrlRewind` MUST unconditionally invoke `sendMediaControl('seek_relative', { offsetSeconds: -10 })`. | **Must Have** |
| **FR-03** | Media Controls | `#btnCtrlForward` MUST unconditionally invoke `sendMediaControl('seek_relative', { offsetSeconds: 10 })`. | **Must Have** |
| **FR-04** | Media Controls | `#btnCtrlToggleMute` and `#btnQuickMute` MUST unconditionally invoke `sendMediaControl('toggle_mute')`. | **Must Have** |
| **FR-05** | Media Controls | `#btnCtrlSpeedDown` and `#btnCtrlSpeedUp` MUST unconditionally invoke `sendMediaControl('step_speed', ...)`. | **Must Have** |
| **FR-06** | Media Controls | `#btnCtrlFullscreen` MUST unconditionally invoke `sendMediaControl('toggle_fullscreen', {}, targetTabId)`. | **Must Have** |
| **FR-07** | Script Injection | Any `executeScript` call from `popup/popup.js` MUST target the top frame only (`{ tabId: targetTabId }`, omitting `allFrames: true`). | **Must Have** |
| **FR-08** | Fullscreen Linkage | `#btnCtrlFullscreen` `executeScript` MUST prioritize clicking `document.getElementById('__sentinel_fs_floating_btn__')` before falling back to `__SentinelFullscreenController.toggle(null, { forceWeb: true })`. | **Must Have** |
| **FR-09** | Cooldown & State | Optimistic cooldown timestamps (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`) and the 800ms guard in `renderMediaCard` MUST be retained. | **Must Have** |
| **FR-10** | Global Isolation | `#btnGlobalMediaToggle` MUST remain 100% frozen, bound only to `TOGGLE_GLOBAL_MEDIA`. | **Must Have** |
| **FR-11** | Test Suite | `tests/test_media_controls_and_fullscreen_fix.js` MUST implement AST/structural checks and a runtime simulated DOM mock test. | **Must Have** |

---

## 🛡️ 3. Non-Functional Requirements (NFR)

1. **Deterministic Latency:** Zero UI blocking; synchronous optimistic updates followed by asynchronous IPC dispatch and executeScript.
2. **Zero Code Duplication:** Handlers reuse `sendMediaControl` and helper functions without copy-pasting bloated DOM manipulations.
3. **W3C Trusted Types & MV3 Compliance:** Zero `innerHTML` assignments; zero eval; compatible with Chrome Manifest V3 service worker lifecycle.
4. **Syntax Purity:** 100% clean check via `node -c` and Node `vm.Script` compilation.

---

## 🧪 4. INVEST Acceptance Criteria (Given-When-Then)

### Scenario 1: Play/Pause Button Unconditional Dispatch
- **Given** an active video is playing in an active tab with tabId 101,
- **When** the user clicks `#btnCtrlTogglePlay` in the popup,
- **Then** `sendMediaControl('toggle_play')` is called immediately,
- **And** `executeScript` is dispatched to `{ tabId: 101 }` without `allFrames: true`,
- **And** `lastPlayToggleTime` is updated to `Date.now()`.

### Scenario 2: Fullscreen Button Overlay Linkage & IPC
- **Given** active media with a floating overlay button in the page DOM,
- **When** the user clicks `#btnCtrlFullscreen` in the popup,
- **Then** `executeScript` runs in the top frame clicking `#__sentinel_fs_floating_btn__`,
- **And** `sendMediaControl('toggle_fullscreen', {}, 101)` is dispatched unconditionally,
- **And** no 124-line manual DOM class manipulations are present.

### Scenario 3: Global Media Button Isolation
- **Given** the popup dashboard is initialized,
- **When** inspecting `#btnGlobalMediaToggle`,
- **Then** it is bound exclusively to `browserAPI.runtime.sendMessage({ type: 'TOGGLE_GLOBAL_MEDIA' })`,
- **And** it is completely independent of single-tab `sendMediaControl` logic.
