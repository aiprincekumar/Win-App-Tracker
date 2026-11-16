# Product Requirements Document (PRD)
## Explicit Idempotent State & Strict Mutual Exclusion Media Controls

> **Initiative:** Web Activity & Media Sentinel (MV3)  
> **Document Status:** Authoritative Specification  
> **Task ID:** `TASK-IDEMPOTENT-MEDIA-CONTROLS-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Power User & Developer (Atul)
- **Workflow:** Multitasks across 20+ tabs with background video lectures on YouTube, podcasts on Spotify, and documentation videos.
- **Pain Point:** Clicking "Pause" on the popup media card occasionally triggers a state desynchronization glitch: if YouTube's video element was in a buffering or transitional state, sending a blind `toggle_play` inverts the state or causes a double-actuation where YouTube pauses and immediately resumes.
- **Expectation:** When clicking Pause, the player must unambiguously pause. When clicking Play, it must unambiguously play. When clicking Mute, it must unambiguously mute.

### Persona 2: Inactivity Sentinel HUD Operator
- **Workflow:** Monitors media state through the desktop floating HUD overlay connected via WebSocket.
- **Pain Point:** If media controls dispatch ambiguous toggle actions, optimistic state predictions in `background.js` can invert opposite to reality, leading to incorrect telemetry reported to the Windows Activity Tracker HUD.
- **Expectation:** Media state mutations are idempotent, deterministic, and 100% synchronized across Popup, Dashboard, Background, and Content Scripts.

---

## 🎯 2. Functional Requirements (FR)

- **FR-01: Explicit Play/Pause Dispatch in Popup:**  
  When the user clicks `#btnCtrlTogglePlay` or `#dynamicStatusBtn` in `popup/popup.js`, the system must determine the explicit target action based on `activeMediaCached`:
  - If `activeMediaCached.isPlaying === true` (or state is `'playing'`), target action must be `'pause'`.
  - If `activeMediaCached.isPlaying === false` (or state is `'paused'`), target action must be `'play'`.
  - If state is undefined or unknown, fallback gracefully to `'toggle_play'`.
- **FR-02: Explicit Mute/Unmute Dispatch in Popup:**  
  When the user clicks `#btnCtrlToggleMute` or `#btnQuickMute` in `popup/popup.js`, the system must determine the explicit target action based on `activeMediaCached`:
  - If `activeMediaCached.isMuted === true`, target action must be `'unmute'`.
  - If `activeMediaCached.isMuted === false`, target action must be `'mute'`.
  - If state is undefined or unknown, fallback gracefully to `'toggle_mute'`.
- **FR-03: Explicit Media Control Parity in Dashboard:**  
  In `dashboard/dashboard.js`, `#btnHeroPlayPause`, `#btnHeroMute`, `triggerMediaPlayPause()`, and `triggerMediaMute()` must follow the exact same explicit action resolution using `dashboardData.globalMediaState.primaryMedia`.
- **FR-04: Strict Mutual Exclusion in MAIN-World Scripts:**  
  In all direct `browserAPI.scripting.executeScript` injections within `popup.js` and `dashboard.js`, the execution logic must enforce strict `else if (video)` mutual exclusion:
  - If YouTube's `#movie_player` API is present, execute playback or volume control via `moviePlayer`.
  - Standard HTML5 `<video>` elements must only be queried or actuated if `moviePlayer` is NOT present or fails.
- **FR-05: Background Optimistic State Handling:**  
  In `background.js`, `CONTROL_MEDIA` message handling must explicitly recognize `message.action === 'mute'` (setting `pm.isMuted = true`) and `message.action === 'unmute'` (setting `pm.isMuted = false`), in addition to `toggle_mute`, `play`, `pause`, and `toggle_play`.
- **FR-06: Content Script Router & Action Support:**  
  In `content_media.js`, `'mute'` and `'unmute'` must be added to `KNOWN_MEDIA_ACTIONS`. `handleMediaControl` must execute `primaryMediaElement.muted = true` for `'mute'` and `primaryMediaElement.muted = false` for `'unmute'`.
- **FR-07: Injected Main World Execution & OSD HUD:**  
  In `inject_main_world.js`, explicit `case 'mute':` and `case 'unmute':` must be added to the command dispatcher with on-screen OSD toasts (`showOSD('Muted', '🔇')` and `showOSD('Unmuted', '🔊')`). Play and pause cases must short-circuit after successful execution to prevent redundant DOM clicks.
- **FR-08: Invariant Preservation:**  
  `#btnGlobalMediaToggle` (Universal Multi-Tab Play/Pause) must remain completely untouched. Cooldown lock timestamps (`lastPlayToggleTime`, `lastMuteToggleTime`, etc.) and the 800ms cooldown in `renderMediaCard` must remain strictly intact.

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01: Zero Latency (0ms Direct Actuation):** In-page media actuation via direct `world: 'MAIN'` scripting must execute synchronously within the current tick (0ms).
- **NFR-02: 100% Idempotency:** Sending `'play'` multiple times to an already playing video or `'mute'` to an already muted video must produce zero side effects, zero audio pops, and zero state reversals.
- **NFR-03: Backward Compatibility:** All existing systems, test cases, and external triggers sending `'toggle_play'` or `'toggle_mute'` must continue to operate without breaking.
- **NFR-04: W3C Trusted Types & DOM Safety:** Zero `innerHTML` assignments in any injected script; zero syntax errors verified by `node -c` and `vm.Script`.
- **NFR-05: Test Coverage & Regression Safety:** 100% pass rate across the modernized `tests/test_media_controls_and_fullscreen_fix.js` suite and all 34 core repository test suites.
- **NFR-06: Zero Security Vulnerabilities:** Clean scan via `gitleaks detect --redact` with 0 credential leaks detected.

---

## 📋 4. User Stories & MoSCoW Prioritization

| ID | User Story | Priority | Rationale |
| :--- | :--- | :---: | :--- |
| **US-01** | As a user clicking Pause in the Popup, I want the video to pause deterministically without accidental toggling, so that playback never restarts unexpectedly. | **Must Have** | Core functional reliability and friction elimination. |
| **US-02** | As a user on YouTube, I want media commands to actuate only through the native player API, so that the underlying HTML5 video element is not double-actuated. | **Must Have** | Eliminates stutter and state reversal on YouTube. |
| **US-03** | As a user clicking Mute in the Dashboard, I want explicit mute/unmute commands dispatched through IPC, so that background state and HUD telemetry stay 100% in sync. | **Must Have** | Cross-surface telemetry consistency. |
| **US-04** | As an extension maintainer, I want `#btnGlobalMediaToggle` preserved untouched, so that universal multi-tab control is never compromised. | **Must Have** | Critical constitutional invariant guard. |
| **US-05** | As an automated CI system, I want all test suites to validate explicit and toggle commands under simulated mocks, so that regressions are caught immediately. | **Should Have** | Long-term test harness stability. |

---

## 📐 5. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Explicit Play Command Dispatch (GWT-01)
- **Given:** Active media is currently paused (`activeMediaCached.isPlaying === false` or `state === 'paused'`).
- **When:** The user clicks `#btnCtrlTogglePlay` or `#dynamicStatusBtn`.
- **Then:**
  1. `browserAPI.scripting.executeScript` is dispatched with target action `'play'`.
  2. The injected script executes `moviePlayer.playVideo()` on YouTube OR `video.play()` on HTML5 pages, with strict `else if` mutual exclusion.
  3. `sendMediaControl('play', {}, targetTabId)` is dispatched over IPC.
  4. Optimistic state is updated to `isPlaying: true, state: 'playing'`.

### Contract 2: Explicit Pause Command Dispatch (GWT-02)
- **Given:** Active media is currently playing (`activeMediaCached.isPlaying === true` or `state === 'playing'`).
- **When:** The user clicks `#btnCtrlTogglePlay` or `#dynamicStatusBtn`.
- **Then:**
  1. `browserAPI.scripting.executeScript` is dispatched with target action `'pause'`.
  2. The injected script executes `moviePlayer.pauseVideo()` on YouTube OR `video.pause()` on HTML5 pages, with strict `else if` mutual exclusion.
  3. `sendMediaControl('pause', {}, targetTabId)` is dispatched over IPC.
  4. Optimistic state is updated to `isPlaying: false, state: 'paused'`.

### Contract 3: Explicit Mute/Unmute Command Dispatch (GWT-03)
- **Given:** Active media is currently unmuted (`activeMediaCached.isMuted === false`).
- **When:** The user clicks `#btnCtrlToggleMute` or `#btnQuickMute`.
- **Then:**
  1. `browserAPI.scripting.executeScript` is dispatched with target action `'mute'`.
  2. Injected script sets `moviePlayer.mute()` or `video.muted = true` with strict `else if`.
  3. `sendMediaControl('mute', {}, targetTabId)` is dispatched over IPC.
  4. Optimistic state is updated to `isMuted: true`.
  5. Subsequent click when `activeMediaCached.isMuted === true` dispatches target action `'unmute'`.

### Contract 4: Strict Mutual Exclusion on Dual-Player Environments (GWT-04)
- **Given:** A YouTube page with `#movie_player` active AND one or more `<video>` elements in the DOM.
- **When:** Any media control command (`play`, `pause`, `toggle_play`, `mute`, `unmute`, `toggle_mute`) is injected.
- **Then:**
  1. `moviePlayer` methods are executed.
  2. The `<video>` element manipulation block is bypassed completely via `else if (video)`.
  3. The `<video>` element is never touched directly when `moviePlayer` handles the action.

### Contract 5: Full Downstream IPC Route & Execution (GWT-05)
- **Given:** `background.js`, `content_media.js`, and `inject_main_world.js` are running in the extension runtime.
- **When:** A `{ type: 'MEDIA_CONTROL', action: 'mute' }` or `{ type: 'MEDIA_CONTROL', action: 'unmute' }` message is sent.
- **Then:**
  1. `background.js` optimistically updates `pm.isMuted = true` (or `false`) and broadcasts `LIVE_MEDIA_UPDATE`.
  2. `content_media.js` matches `KNOWN_MEDIA_ACTIONS`, executes `primaryMediaElement.muted = true` (or `false`), and forwards to main world.
  3. `inject_main_world.js` executes native player mute/unmute and displays the visual OSD toast HUD (`showOSD`).

### Contract 6: Invariant Preservation Verification (GWT-06)
- **Given:** The extension popup is opened.
- **When:** `#btnGlobalMediaToggle` is clicked.
- **Then:**
  1. It triggers `browserAPI.runtime.sendMessage({ type: 'TOGGLE_GLOBAL_MEDIA' })`.
  2. It does NOT invoke single-tab direct scripting or single-tab `sendMediaControl`.
  3. Cooldown lock timestamps remain protected and uncorrupted.
