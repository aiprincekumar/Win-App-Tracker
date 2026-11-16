<!-- UTF-8 with BOM -->
# Phase 2: Frame-Aware Popup Actuation & Content Script Guard

> **Phase Identifier:** `PHASE-02-FRAME-AWARE-POPUP-AND-CONTENT-GUARD`  
> **Target Sub-Agent Role:** Frontend Specialist (Level 4 Execution Sub-Agent)  
> **Target Department:** Department 05 (Frontend Engineering)  
> **Parent Dossier:** [`temp_prompt/TASK-FULLSCREEN-BLACKOUT-003/INDEX.md`](INDEX.md)  
> **Mandatory Rule Directive:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.

---

## 🎯 1. Phase Objective
Update `popup/popup.js` `#btnCtrlFullscreen` click handler to inject with `allFrames: true`, implement early media presence guard, and enforce 3-tier actuation priority (Priority 1: Floating button; Priority 2: Controller; Priority 3: Native fallback). Add media frame guard in `content_media.js` `case 'toggle_fullscreen':`.

---

## 📦 2. Prerequisites & Inputs
- Completion of Phase 1 (`fullscreen_controller.js` hardened).
- Files: `popup/popup.js`, `content_media.js`.
- Active Authorization Token issued by Level 2 Manager (`AUTH-MGR-*`).

---

## 📍 3. Technical Context & File Anchors
- **File 1:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)
  - **Anchor:** Lines ~3647-3696 (`const btnFullscreen = document.getElementById('btnCtrlFullscreen');`).
- **File 2:** [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)
  - **Anchor:** Lines ~1970-1992 (`case 'toggle_fullscreen':`).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update `popup/popup.js` `#btnCtrlFullscreen`
In `popup/popup.js` around lines 3647-3696:
Replace the existing `#btnCtrlFullscreen` event listener with the following concise, frame-aware implementation:
```javascript
  const btnFullscreen = document.getElementById('btnCtrlFullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', async () => {
      const now = Date.now();
      if (now - lastFullscreenClick < 350) return;
      lastFullscreenClick = now;

      let targetTabId = getActiveMediaTabId();

      // Resolve active tabId reliably if not cached yet
      if (!targetTabId && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
        try {
          const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
          if (tabs && tabs[0] && tabs[0].id) targetTabId = tabs[0].id;
        } catch (_) {}
      }

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId, allFrames: true },
          world: 'MAIN',
          func: () => {
            const hasMedia = Boolean(
              document.querySelector('video') ||
              document.getElementById('movie_player') ||
              document.querySelector('.html5-video-player')
            );
            if (!hasMedia) return;

            // Priority 1: In-Page Floating HUD Button
            const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
            if (floatingBtn) {
              floatingBtn.click();
              return;
            }

            // Priority 2: Fullscreen Controller Toggle
            const ctrl = window.__SentinelFullscreenController || globalThis.__SentinelFullscreenController;
            if (ctrl && typeof ctrl.toggleWebFullscreen === 'function') {
              ctrl.toggleWebFullscreen();
              return;
            }
            if (ctrl && typeof ctrl.toggle === 'function') {
              ctrl.toggle(null, { forceWeb: true });
              return;
            }

            // Priority 3: Native Fallback / Event Bridge
            const video = document.querySelector('video');
            if (video && typeof video.requestFullscreen === 'function') {
              video.requestFullscreen().catch(() => {});
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
    });
  }
```

*Key Details:*
1. `allFrames: true` ensures the script is evaluated in every frame of the tab.
2. `hasMedia` check ensures that any frame without a video element returns immediately without modifying the DOM.
3. Priority 1 clicks the floating HUD button in the media frame.
4. Priority 2 invokes `__SentinelFullscreenController`.
5. Priority 3 invokes native `requestFullscreen()` or dispatches custom event bridge.
6. Single-execution fallback (`sendMediaControl('toggle_fullscreen', {}, targetTabId)`) is preserved in `.catch()` and `else`.
7. Cooldown lock (`now - lastFullscreenClick < 350`) is strictly preserved.
8. Total line count of the block remains <= 55 lines.

### Step 2: Guard `content_media.js` `case 'toggle_fullscreen':`
In `content_media.js` around line 1970:
In `switch (action)` under `case 'toggle_fullscreen':`:
Prepend an early media presence check:
```javascript
          case 'toggle_fullscreen': {
            const hasMedia = Boolean(
              primaryMediaElement ||
              document.querySelector('video') ||
              document.getElementById('movie_player') ||
              document.querySelector('.html5-video-player')
            );
            if (!hasMedia) break;

            if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
              window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
            } else {
              const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
              if (floatingBtn) {
                try { floatingBtn.click(); } catch (_) {}
              } else {
                forwardActionToMainWorld('toggle_fullscreen', data);
                const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') || document.querySelector('.ytp-fullscreen-button');
                if (ytFsBtn) {
                  try { ytFsBtn.click(); } catch (_) {}
                } else {
                  try {
                    const ev = new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true });
                    (document.getElementById('movie_player') || document).dispatchEvent(ev);
                  } catch (_) {}
                }
                toggleWebFullscreen(primaryMediaElement);
              }
            }
            break;
          }
```

---

## 🚫 5. Architectural Constraints & Boundaries
1. **Preserve `#btnGlobalMediaToggle`:** Universal multi-tab Play/Pause button must remain completely untouched.
2. **0 innerHTML assignments:** 100% W3C Trusted Types safe.
3. **No manual DOM class bloat:** Do not add raw class manipulations in popup.js.
4. **Encoding:** Save as UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📜 6. Deliverables Manifest
- Modified: `popup/popup.js`
- Modified: `content_media.js`

---

## 🧪 7. Local Verification Gate
Execute syntax verification:
```powershell
node -c "popup/popup.js"
node -c "content_media.js"
```
Ensure syntax compiles cleanly with exit code 0.
