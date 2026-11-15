# Product Requirements Document (PRD)
## Parity Overhaul: Popup Mode & Dashboard Mode Media Controls Resilience & Fix Latent Bridge Bugs

> **Document Version:** 1.0.0  
> **Initiative:** Media Controls Parity & Bridge Resilience  
> **Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance:** Universal Rule 22 & [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 👥 1. User Personas & Problem Statement

### 1.1 Target Personas
- **The Media Power User:** Listens to background music, podcasts, or video lectures while working across multiple browser windows and desktop applications. Relies on the extension's popup and dashboard media controls to pause, mute, seek, adjust volume, or switch tabs without context switching.
- **The YouTube Heavy User:** Interacts with YouTube videos using native volume HUDs, 0.25x speed steppers, quality pickers, and theater/fullscreen toggles directly from the extension.
- **The Multi-Tasking Professional:** Operates with dozens of open tabs and requires instant, deterministic control where clicking mute or play works 100% of the time on the intended tab without lag, flicker, or self-canceling toggles.

### 1.2 Problem Statement
Users in Popup Mode and Dashboard Mode currently face latent edge-case bugs:
1. When muting YouTube from the extension, the main world execution script executes both the YouTube native player mute API and directly inverts the HTML5 `<video>` element's `muted` property sequentially. This causes a self-canceling double inversion where the audio mutes for a few milliseconds and immediately unmutes, accompanied by an incorrect OSD toast.
2. If the main world injection script is delayed, blocked by strict CSP, or when media is in an unready state, the content script drops user actions because it assumes the main world bridge will handle them, skipping direct HTML5 video fallback.
3. Media controls in Popup Mode resolve the target media tab inconsistently across buttons, risking dropped commands when cache is cold, unlike Dashboard Mode which cleanly passes the target tab ID.

---

## 📋 2. Functional Requirements (FR)

### FR-1: Single-Inversion Mute Determinism in `inject_main_world.js`
- When receiving a `toggle_mute` action, the engine MUST check if `moviePlayer` is present and has `isMuted`, `mute`, and `unMute` functions.
- If `moviePlayer` is present and functional, the engine MUST use `moviePlayer.unMute()` or `moviePlayer.mute()` exclusively.
- The engine MUST NOT unconditionally execute `video.muted = !video.muted` after `moviePlayer` mute manipulation.
- If `moviePlayer` is absent or non-functional, the engine MUST toggle `video.muted` on the underlying HTML5 media element.
- The on-screen visual OSD HUD MUST accurately display 'Muted' or 'Unmuted' reflecting the actual resulting state.

### FR-2: Resilient Fallback to `primaryMediaElement` in `content_media.js`
- When `handleMediaControl(action, data)` receives a media control command on a page where `isMainWorldTarget` is true (e.g. YouTube or pages with bridge attributes):
  - The content script MUST dispatch `forwardActionToMainWorld(action, data)`.
  - If the bridge is NOT ready (`!isBridgeActive`), or if the action fails to be handled by the main world, the content script MUST provide a graceful fallback executing the command directly on `primaryMediaElement`.
- Supported actions for resilient fallback MUST include: `play`, `pause`, `toggle_play`, `seek_relative`, `seek_percent`, `set_volume`, `SET_VOLUME`, `toggle_mute`, `step_speed`, `set_speed`, `cycle_speed`.

### FR-3: Target Tab Resolution Parity in `popup/popup.js`
- `popup/popup.js` MUST provide an enhanced, unified `getActiveMediaTabId()` helper that reliably checks:
  1. `activeMediaCached.tabId`
  2. `dashboardData.globalMediaState.primaryMedia.tabId`
  3. `activeTabId` cached from initial popup query
- `sendMediaControl(action, data, tabId)` in `popup/popup.js` MUST automatically resolve `targetTabId = tabId || getActiveMediaTabId()`, ensuring every media action dispatched to `background.js` carries an explicit target tab ID.
- All media control button event listeners in `popup/popup.js` MUST utilize the unified resolution pattern in full parity with `dashboard/dashboard.js`.

### FR-4: Strict Preservation of Cooldown Locks & Global Media Toggle
- The optimistic state locks and cooldown timestamps (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, `lastControlsRowActiveTime`) in `popup/popup.js` MUST remain completely frozen and preserved.
- The 800ms cooldown guards in `renderMediaCard` MUST remain intact to eliminate visual flicker and bounce-back.
- The Universal Play/Pause button (`#btnGlobalMediaToggle`, lines ~3154–3168) MUST remain 100% frozen and untouched.

---

## 🔒 3. Non-Functional Requirements (NFR)

### NFR-1: Zero Dual-Execution & Single-Dispatch Determinism
- No media button handler in `popup/popup.js` may execute `browserAPI.scripting.executeScript`.
- Exactly 1 authoritative IPC message (`type: 'CONTROL_MEDIA'`) must be dispatched per user interaction.

### NFR-2: 0ms Perceived Latency & Flicker Elimination
- Optimistic UI updates must immediately update local state and DOM elements before IPC round-trip.
- State polling must not overwrite active optimistic locks during cooldown windows.

### NFR-3: W3C Trusted Types & Strict CSP Compliance
- Zero usage of `innerHTML` or `outerHTML` assignments in `inject_main_world.js`, `content_media.js`, or `popup/popup.js`.
- All DOM modifications must utilize `document.createElement`, `textContent`, and safe DOM APIs.

### NFR-4: Full Regression Safety
- All 30 existing test suites in `tests/` must pass with 100% success (exit code 0).
- Zero secret leaks via `gitleaks detect --redact`.

---

## 📖 4. INVEST-Compliant User Stories

- **US-01:** As a YouTube listener, when I click Mute in the popup or dashboard, I want the video to mute cleanly and stay muted, so that I am not startled by immediate audio bounce-back.
- **US-02:** As a media consumer on slow or CSP-restricted pages, when I click Play/Pause or Seek, I want the media to respond immediately even if the main world script hasn't loaded, so that control commands are never lost.
- **US-03:** As an extension user, I want popup media controls to target the active playing tab with the same 100% reliability as the dashboard, so that I experience consistent behavior across all extension surfaces.

---

## 🎯 5. MoSCoW Feature Prioritization

- **Must Have:**
  - Eliminate `toggle_mute` double inversion in `inject_main_world.js`.
  - Resilient fallback to `primaryMediaElement` in `content_media.js`.
  - Harmonize `targetTabId` resolution in `popup/popup.js` with `dashboard/dashboard.js`.
  - Update `tests/test_media_controls_and_fullscreen_fix.js` to assert single-inversion mute, fallback resilience, and parity.
  - Zero regression across all 30 test suites.
- **Should Have:**
  - Synchronize `memory.md` Section 0 and Diagnostic Matrix.
  - Check live Chrome port 9222 verification if available.
- **Could Have:**
  - Enhanced telemetry query response logging for debug inspection.
- **Won't Have (Strictly Out-of-Scope):**
  - Modifying `#btnGlobalMediaToggle` global multi-tab toggle logic.
  - Altering CSS layout styles or DOM element IDs in popup/dashboard HTML.
  - Introducing new external libraries or dependencies.

---

## 🚦 6. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Phase 1 Bridge Fixes & Parity
- **Given** a user is playing a YouTube video with active `moviePlayer` and `<video>` elements,
- **When** the user clicks Mute via popup or dashboard,
- **Then** `inject_main_world.js` executes `moviePlayer.mute()` exclusively without toggling `video.muted`, the player enters muted state, and the OSD displays 'Muted 🔇'.
- **Given** a web page where media is playing but `isBridgeActive` is false,
- **When** the user sends a `toggle_play` or `seek_relative` command,
- **Then** `content_media.js` falls back to direct `primaryMediaElement` manipulation and executes the command successfully.
- **Given** the popup is opened with cold cache,
- **When** the user clicks any media control button,
- **Then** `popup/popup.js` resolves `targetTabId` reliably and dispatches `sendMediaControl` with a defined tab ID.

### Contract 2: Phase 2 Test Suite Verification
- **Given** the updated codebase,
- **When** `node tests/test_media_controls_and_fullscreen_fix.js` is executed,
- **Then** all 10 test groups pass with exit code 0, verifying single-inversion mute, fallback resilience, popup/dashboard parity, 0 conflicting `executeScript`, and preserved cooldowns.

### Contract 3: Phase 3 Full Regression & Release Gate
- **Given** all phase deliverables,
- **When** the full test suite regression is executed,
- **Then** all 30 test files exit with code 0, `gitleaks detect --redact` reports 0 leaks, and local micro-commit and GitHub push succeed cleanly.
