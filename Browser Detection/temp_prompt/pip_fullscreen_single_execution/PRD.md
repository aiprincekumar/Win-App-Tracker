# Product Requirements Document (PRD)
## PiP & Fullscreen Single-Execution Alignment: Eliminate Immediate Double-Toggle Closing Bug

> **Document Version:** 1.0.0  
> **Target Release:** 1.0.8  
> **Module Scope:** `popup/popup.js`, `tests/test_media_controls_and_fullscreen_fix.js`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Status:** APPROVED FOR EXECUTION  

---

## 1. Executive Summary

In the active Browser Detection & Sentinel Media Hub Chrome Extension, clicking the Picture-in-Picture (`#btnCtrlPip`) or Fullscreen (`#btnCtrlFullscreen`) button in the popup causes the video window to instantly pop into PiP / Fullscreen and immediately exit (close) within 50–100ms.

This behavior is caused by an accidental double-toggle: the button handlers in `popup/popup.js` invoke direct in-page script injection via `browserAPI.scripting.executeScript` AND simultaneously dispatch a background IPC message via `sendMediaControl('toggle_pip')` / `sendMediaControl('toggle_fullscreen')`. The two invocations race against the DOM state, resulting in a state inversion where the second call undoes the first call.

This project aligns `popup/popup.js` with the battle-tested single-execution pattern already proven in `dashboard/dashboard.js`, eliminates the double-toggle bug, updates test suites to assert single execution, and verifies all 36 test suites across the repository.

---

## 2. Problem Statement & User Impact

### 2.1 The Issue
- When users watch YouTube, Netflix, Twitch, or generic HTML5 video and click the "Pop-up PiP" button in the popup extension, the floating PiP window flashes on screen for a split-second and closes immediately.
- When users click the "Fullscreen" button, the web page toggles fullscreen and instantly reverts to normal mode.
- Users are forced to click multiple times, triggering frustrated rapid clicks, which causes erratic DOM state oscillations.

### 2.2 User Impact
- **Severity:** HIGH (Core Media Control Usability Failure).
- **Affected Surface:** Popup UI (`popup/popup.html`, `popup/popup.js`).
- **Unaffected Surface:** Dashboard UI (`dashboard/dashboard.js` already employs single execution with fallback and functions correctly).

---

## 3. Root Cause Analysis

### Current Code Structure in `popup/popup.js` (Lines 3647–3723):
```javascript
// Fullscreen
const btnFullscreen = document.getElementById('btnCtrlFullscreen');
if (btnFullscreen) {
  btnFullscreen.addEventListener('click', async () => {
    // 1. Direct Scripting
    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({ ... }).catch(() => {});
    }
    // 2. Unconditional IPC Dispatch (RACES WITH EXECUTESCRIPT!)
    sendMediaControl('toggle_fullscreen', {}, targetTabId);
  });
}

// PiP
const btnPip = document.getElementById('btnCtrlPip');
if (btnPip) {
  btnPip.addEventListener('click', () => {
    // 1. Direct Scripting
    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({ ... }).catch(() => {});
    }
    // 2. Unconditional IPC Dispatch (RACES WITH EXECUTESCRIPT!)
    sendMediaControl('toggle_pip', {}, targetTabId);
  });
}
```

### The State Flip Mechanism:
1. `executeScript` executes synchronously in the page's MAIN world:
   - For PiP: `video.requestPictureInPicture()` is triggered.
   - For Fullscreen: floating button or `__SentinelFullscreenController.toggleWebFullscreen()` is triggered.
2. In the same tick of the popup event loop, `sendMediaControl(...)` sends a message to the background script, which forwards to the content script (`content_media.js`).
3. Inside `content_media.js`, `handleMediaControl('toggle_pip')` runs:
   ```javascript
   if (document.pictureInPictureElement) {
     document.exitPictureInPicture(); // <-- EXITS PiP BECAUSE IT WAS JUST OPENED!
   }
   ```
4. Inside `content_media.js`, `handleMediaControl('toggle_fullscreen')` runs:
   ```javascript
   if (document.fullscreenElement || isWebFsActive) {
     exitFullscreen(); // <-- EXITS FULLSCREEN BECAUSE IT WAS JUST OPENED!
   }
   ```

---

## 4. Product Requirements & Acceptance Criteria

### 4.1 Functional Requirements (FR)

- **FR-1 (Single Execution Determinism):**
  - When `browserAPI.scripting.executeScript` is available and succeeds, `sendMediaControl` must NOT be invoked.
  - Exactly one execution path shall act upon the target media per click event.

- **FR-2 (Resilient Fallback):**
  - If `executeScript` rejects or throws an error (e.g. tab permissions, restricted scheme, frame mismatch), `sendMediaControl` MUST be invoked inside `.catch()` to ensure the command is not dropped.
  - If `browserAPI.scripting` or `targetTabId` is undefined, `sendMediaControl` MUST be invoked in the `else` branch as an IPC fallback.

- **FR-3 (Cooldown Invariant):**
  - The 350ms throttle guards (`lastFullscreenClick` and `lastPipClick`) MUST be preserved to prevent hardware switch bounce or user double-clicking.

- **FR-4 (Global Media Toggle Preservation):**
  - `#btnGlobalMediaToggle` (Universal across-tab toggle) MUST NOT be altered, modified, or coupled to single-tab controls in any way.

### 4.2 Non-Functional Requirements (NFR)

- **NFR-1 (Zero Regression):** All 36 test suites in `tests/` must pass with exit code 0.
- **NFR-2 (Clean Code Standard):** Handlers must remain compact, maintainable, and adhere to strict W3C / Trusted Types security.
- **NFR-3 (Zero Secret Leaks):** Pre-push audit with `gitleaks detect --redact` must report 0 leaks.

---

## 5. User Stories

### Story 1: Reliable PiP Activation
*As a user watching a tutorial on YouTube,*  
*When I open the Sentinel extension popup and click "Pop-up PiP",*  
*Then the video immediately enters Picture-in-Picture mode and stays in PiP until I explicitly close it or click PiP again.*

### Story 2: Reliable Fullscreen Activation
*As a user watching a stream,*  
*When I click the "Fullscreen" button in the popup,*  
*Then the media seamlessly transitions into web/native fullscreen and does not exit until I toggle or press Escape.*

### Story 3: Robust Fallback on Restricted Tabs
*As a user on a browser tab where direct scripting execution fails,*  
*When I click PiP or Fullscreen,*  
*Then the action safely falls back to IPC messaging (`sendMediaControl`) without throwing unhandled exceptions.*

---

## 6. Non-Negotiable Architectural Invariants

1. **NO Simultaneous Execution:** Never call direct `executeScript` AND `sendMediaControl` in the same execution branch for stateful toggles.
2. **NO Removal of Cooldowns:** The 350ms timestamp checks MUST stay intact.
3. **NO Mutation of Global Controls:** `#btnGlobalMediaToggle` must stay 100% frozen.
4. **NO Manual DOM Class Hacks:** No returning to deprecated manual CSS class injections (`sentinel-fullscreen-active`, etc.).
5. **Node.js Syntax Validation:** Every modified file must pass `node -c` cleanly.
