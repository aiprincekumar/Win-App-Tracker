# Technical Requirements Document (TRD)
## Fullscreen Parity & Reliable Execution Architecture

> **Task ID:** `TASK-FULLSCREEN-PARITY-002`  
> **Target Version:** `v2.4.2`  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Department Governance:** Department 02 (System Architecture & Technical Design)  
> **File Anchors:**  
> - [`fullscreen_controller.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/fullscreen_controller.js) (Lines 360–371, 521–569, 634–671)  
> - [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) (Lines 3664–3694)  
> - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js) (Lines 1970–1995)  

---

## 🔬 1. Deep Root Cause Forensic Analysis

### 1.1 The W3C Transient User Activation Model
Under the W3C HTML Living Standard and Chromium Security Architecture:
- `Element.prototype.requestFullscreen()` is gated behind **Transient User Activation** (`navigator.userActivation.isActive === true`).
- A transient user activation is established **only** when a physical hardware input event occurs within the document context (e.g., physical mouse click, physical key press, or touch tap).
- Extension popups (`chrome-extension://.../popup/popup.html`) execute in an entirely separate window/document context from web tabs.
- When `chrome.scripting.executeScript` injects code into a web page from a popup, or when `document.getElementById(...).click()` is called programmatically, the resulting event has:
  $$\text{event.isTrusted} = \text{false}$$
  $$\text{navigator.userActivation.isActive} = \text{false}$$

### 1.2 YouTube's Internal Event Filtering
YouTube's HTML5 video player (`#movie_player`) implements strict internal event validation:
1. When `ytFsBtn.click()` is called programmatically from an untrusted script (`e.isTrusted === false`), the YouTube action dispatcher filters out the event and aborts the fullscreen toggle.
2. The method call `ytFsBtn.click()` returns `undefined` without throwing a JavaScript error.
3. Similarly, synthetic keyboard events (e.g. dispatching `new KeyboardEvent('keydown', { key: 'f' })`) are rejected because Chrome's native fullscreen requires a trusted gesture.

### 1.3 The False-Positive Success Bug in `fullscreen_controller.js`
In the existing implementation of `fullscreen_controller.js` (lines 521–535):
```javascript
  // 1. YouTube native UI button click
  const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') ||
                  document.querySelector('.ytp-fullscreen-button');
  if (ytFsBtn) {
    try {
      ytFsBtn.click();
      showOSD('Fullscreen', '⛶'); // BUG: Blindly assumed success!
      return true;                 // BUG: Returned true, blocking fallback!
    } catch (_) {}
  }
```
**Why this failed:**
- Because `ytFsBtn.click()` did not throw an exception, execution proceeded directly to `showOSD('Fullscreen', '⛶')` and returned `true`.
- The controller never checked if `document.fullscreenElement` or `isFullscreenActive()` was actually true!
- Because `enterNativeFullscreen()` returned `true`, the fallback to `enterWebFullscreen()` in `toggle()` (lines 613–615) was **NEVER triggered**:
  ```javascript
  enterNativeFullscreen(targetEl).catch(() => {
    enterWebFullscreen(targetEl); // Was never reached because promise resolved with true!
  });
  ```
- Result: The user saw the OSD notification "Fullscreen ⛶" appear on screen, but the video never actually entered fullscreen!

### 1.4 The Synthetic Disparity: Popup vs. In-Page HUD Button
1. **In-Page Floating Button:**
   - Injected directly into `#movie_player` at `top: 20px, right: 20px`.
   - When the user clicks it with a mouse, `e.isTrusted === true`.
   - YouTube and Chrome honor the physical click, native fullscreen engages, and the user sees success.
2. **Popup Fullscreen Button:**
   - In `popup/popup.js` line 3669:
     ```javascript
     const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
     if (floatingBtn) {
       floatingBtn.click(); // <--- SYNTHETIC UNTRUSTED EVENT!
       return;
     }
     ```
   - Triggering `floatingBtn.click()` dispatched an untrusted event (`e.isTrusted === false`) to the floating button listener.
   - The listener called `toggle()`, which called `enterNativeFullscreen()`, which hit the false-positive bug!
3. **Contrast with `dashboard/dashboard.js`:**
   - `dashboard.js` (line 4854) did NOT call `floatingBtn.click()`.
   - It called `window.__SentinelFullscreenController.toggle(null, { forceWeb: true })` or `ctrl.toggleWebFullscreen()`.
   - Because `forceWeb: true` was passed, it immediately bypassed native attempts and engaged Web Fullscreen (CSS Viewport Fill), which works 100% reliably without requiring user activation!

---

## 🏗️ 2. Architectural Solution Specification

```mermaid
flowchart TD
    Start["Fullscreen Toggle Initiated"] --> SourceCheck{"Trigger Source"}

    SourceCheck -->|Popup / Dashboard| ForceWeb["Force Web Fullscreen (forceWeb: true)"]
    SourceCheck -->|In-Page Physical Click| TrustedCheck{"e.isTrusted?"}

    TrustedCheck -->|false (Synthetic)| DirectWeb["enterWebFullscreen() directly"]
    TrustedCheck -->|true (Physical)| NativeAttempt["enterNativeFullscreen()"]

    NativeAttempt --> ClickYT["ytFsBtn.click() / requestFullscreen()"]
    ClickYT --> VerifyFS{"isFullscreenActive()?"}

    VerifyFS -->|Yes| NativeSuccess["showOSD('Fullscreen', '⛶')<br/>return true"]
    VerifyFS -->|No| NativeFail["DO NOT show OSD<br/>Fall back to enterWebFullscreen()"]

    ForceWeb --> DirectWeb
    NativeFail --> DirectWeb

    DirectWeb --> ApplyCSS["Apply .sentinel-fullscreen-active<br/>100vw x 100vh Viewport Lock<br/>Conceal Masthead/Sidebar"]
    ApplyCSS --> WebSuccess["showOSD('Web Fullscreen', '⛶')<br/>return true"]
```

### 2.1 Component 1: `fullscreen_controller.js` Hardening
Three targeted improvements in `fullscreen_controller.js`:

#### A. State Verification in `enterNativeFullscreen()`:
After attempting native triggers, verify `isFullscreenActive()`:
```javascript
  async function enterNativeFullscreen(targetEl) {
    if (typeof document === 'undefined') return false;
    const el = getTargetElement(targetEl);

    // 1. YouTube native UI button click
    const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') ||
                    document.querySelector('.ytp-fullscreen-button');
    if (ytFsBtn) {
      try {
        ytFsBtn.click();
        if (isFullscreenActive()) {
          showOSD('Fullscreen', '⛶');
          return true;
        }
      } catch (_) {}
    }

    // 2. YouTube native player API
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.toggleFullscreen === 'function') {
      try {
        moviePlayer.toggleFullscreen();
        if (isFullscreenActive()) {
          showOSD('Fullscreen', '⛶');
          return true;
        }
      } catch (_) {}
    }

    // 3. W3C requestFullscreen API
    const target = el || document.querySelector('video') || document.documentElement;
    if (target) {
      if (typeof target.requestFullscreen === 'function') {
        try {
          await target.requestFullscreen();
          if (isFullscreenActive()) {
            showOSD('Fullscreen', '⛶');
            return true;
          }
        } catch (_) {}
      } else if (typeof target.webkitRequestFullscreen === 'function') {
        try {
          target.webkitRequestFullscreen();
          if (isFullscreenActive()) {
            showOSD('Fullscreen', '⛶');
            return true;
          }
        } catch (_) {}
      }
    }

    // If native fullscreen was rejected or silent, seamlessly enter Web Fullscreen
    return enterWebFullscreen(targetEl || el);
  }
```

#### B. Synthetic Event Guard in `createFloatingButton()`:
In `createFloatingButton()` (lines 654–667):
```javascript
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      // If event is untrusted (synthetic click) or user held Shift, use Web Fullscreen directly
      if (!e.isTrusted || e.shiftKey) {
        if (isFullscreenActive()) {
          exitFullscreen();
        } else {
          enterWebFullscreen();
        }
      } else {
        toggle();
      }
      setTimeout(updateFloatingButtonIcon, 50);
    });
```

#### C. `toggle()` Method Fallback Resilience:
In `toggle()` (lines 604–617):
```javascript
    const hasUserActivation = typeof navigator !== 'undefined' &&
      Boolean(navigator.userActivation && navigator.userActivation.isActive);

    // If caller explicitly requested web fullscreen or document lacks active user gesture
    if ((options && options.forceWeb) || !hasUserActivation) {
      return enterWebFullscreen(targetEl);
    }

    // Direct in-page user gesture: try native first, fall back to web
    return enterNativeFullscreen(targetEl);
```

---

### 2.2 Component 2: `popup/popup.js` Alignment with `dashboard.js`
In `popup/popup.js` (lines 3664–3688), replace the floating button priority with direct controller invocation with `{ forceWeb: true }`:
```javascript
      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId },
          world: 'MAIN',
          func: () => {
            const ctrl = window.__SentinelFullscreenController || globalThis.__SentinelFullscreenController;
            if (ctrl && typeof ctrl.toggleWebFullscreen === 'function') {
              ctrl.toggleWebFullscreen();
              return;
            }
            if (ctrl && typeof ctrl.toggle === 'function') {
              ctrl.toggle(null, { forceWeb: true });
              return;
            }
            const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
            if (floatingBtn) {
              floatingBtn.click();
              return;
            }
            try {
              window.dispatchEvent(new CustomEvent('__SENTINEL_FULLSCREEN_ACTION__', {
                detail: { action: 'toggle', options: { forceWeb: true } }
              }));
            } catch (_) {}
          }
        }).catch(() => {
          sendMediaControl('toggle_fullscreen', {}, targetTabId);
        });
      } else {
        sendMediaControl('toggle_fullscreen', {}, targetTabId);
      }
```

---

### 2.3 Component 3: `content_media.js` IPC Handler Parity
In `content_media.js` (lines 1970–1995):
```javascript
          case 'toggle_fullscreen': {
            const ctrl = window.__SentinelFullscreenController || globalThis.__SentinelFullscreenController;
            if (ctrl && typeof ctrl.toggle === 'function') {
              ctrl.toggle(null, { forceWeb: true });
            } else {
              const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
              if (floatingBtn) {
                try { floatingBtn.click(); } catch (_) {}
              } else {
                forwardActionToMainWorld('toggle_fullscreen', data);
                toggleWebFullscreen(primaryMediaElement);
              }
            }
            break;
          }
```

---

## 📊 3. State Transition Matrix

| Initial State | Event Trigger | Guard Condition | Target Action | Final State | OSD Display |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NORMAL` | User clicks `#btnCtrlFullscreen` in Popup | `world: MAIN`, `ctrl` available | `ctrl.toggle(null, { forceWeb: true })` | `WEB_FULLSCREEN` | `Web Fullscreen ⛶` |
| `NORMAL` | User clicks square HUD button on video | `e.isTrusted === true` | `enterNativeFullscreen()` -> `ytFsBtn.click()` | `NATIVE_FULLSCREEN` | `Fullscreen ⛶` |
| `NORMAL` | User clicks square HUD button on video | `e.isTrusted === true`, native rejected | Fallback to `enterWebFullscreen()` | `WEB_FULLSCREEN` | `Web Fullscreen ⛶` |
| `NORMAL` | Script calls `floatingBtn.click()` | `e.isTrusted === false` | Direct `enterWebFullscreen()` | `WEB_FULLSCREEN` | `Web Fullscreen ⛶` |
| `ANY_FULLSCREEN`| User presses `Escape` key | `key === 'Escape'` | `exitFullscreen()` | `NORMAL` | `Exit Fullscreen ⛶` |
| `ANY_FULLSCREEN`| User clicks `#btnCtrlFullscreen` in Popup | `isFullscreenActive() === true` | `exitFullscreen()` | `NORMAL` | `Exit Fullscreen ⛶` |

---

## 🔒 4. Security & W3C Trusted Types Governance

1. **Zero `.innerHTML` Assignments:**
   All OSD text and SVGs must be created via `document.createElementNS` and `textContent`.
2. **Strict Attribute Hygiene:**
   CSS styling must use classes (`.sentinel-fullscreen-active`, `.sentinel-web-fullscreen`) rather than dynamic string attribute manipulation.
3. **No External Network Dependencies:**
   All icons and styles are 100% self-contained within `fullscreen_controller.js`.

---

## 🛡️ 5. Out-of-Scope Isolation Guarantees

Under no circumstances may any of the following be modified:
1. `#btnGlobalMediaToggle` (Universal across-tab toggle)
2. `#btnCtrlPlayPause`, `#btnCtrlMute`, `#btnCtrlSpeed`, `#btnCtrlPip`
3. Audio/Volume slider or timeline scrubber
4. Popup CSS layout or HTML structure
