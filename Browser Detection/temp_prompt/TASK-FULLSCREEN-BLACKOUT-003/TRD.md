<!-- UTF-8 with BOM -->
# TASK-FULLSCREEN-BLACKOUT-003: Technical Requirements Document (TRD)

> **Document Class:** Technical Requirements Document (TRD)  
> **Task Identifier:** `TASK-FULLSCREEN-BLACKOUT-003`  
> **Author:** Level 3C Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Lead Department:** Department 05 (Frontend Engineering)  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 🏛️ 1. Technical Architecture & Component Interaction

```
[ Popup Dashboard ]
        │
        ▼ (User clicks #btnCtrlFullscreen)
[ browserAPI.scripting.executeScript({ target: { tabId, allFrames: true }, world: 'MAIN' }) ]
        ├── Frame 0 (Top Window):
        │     ├── Guard: Does frame have video or player? -> NO
        │     └── Result: Early Return (0 mutations, NO blackout)
        │
        └── Frame 1 (Embedded iframe, e.g. W3Schools):
              ├── Guard: Does frame have video or player? -> YES
              ├── Priority 1: document.getElementById('__sentinel_fs_floating_btn__')?.click()
              ├── Priority 2: window.__SentinelFullscreenController?.toggleWebFullscreen()
              │                 ├── getTargetElement() -> Returns <video> (NOT body/html)
              │                 ├── enterWebFullscreen(el) -> Adds .sentinel-web-fullscreen to <video>
              │                 └── Guaranteed: body/html never styled with black box
              └── Priority 3: video.requestFullscreen() / Event Bridge Fallback
```

---

## 📐 2. Surgical Technical Specifications

### 2.1 Component 1: `fullscreen_controller.js`

#### A. Hardened `getTargetElement(preferredTarget)`
- **Current Defect:**
  ```javascript
  // Line ~427
  return document.body || document.documentElement || null;
  ```
- **Rectification:**
  ```javascript
  // Return null when no video container or element can be resolved
  return null;
  ```
- Full resolution chain:
  1. Check YouTube `#movie_player` or `.html5-video-player`. If found, return it.
  2. If `preferredTarget` is provided:
     - If it is a `VIDEO`, inspect `.closest()` for known containers (`#movie_player, .html5-video-player, ytd-player, .video-stream-container, .player-container, .jwplayer, [data-player-container]`). If found, return container.
     - If it has a parent that is NOT `document.body` and NOT `document.documentElement`, return `parentElement`.
     - Otherwise return `preferredTarget`.
  3. Query `document.querySelector('video')`.
     - If found, check `.closest()` for container. If found, return container.
     - If parent is NOT `body` and NOT `documentElement`, return `parentElement`.
     - Otherwise return `video`.
  4. If none of the above matches: `return null;` (NEVER `document.body` or `documentElement`).

#### B. Guarded `enterWebFullscreen(targetEl)`
- **Guard Specification:**
  ```javascript
  const el = getTargetElement(targetEl);
  if (!el || el === document.body || el === document.documentElement) {
    return false;
  }
  ```
- Must cleanly prevent any root element from receiving `.sentinel-web-fullscreen`.

#### C. CSS Rule Augmentation
- In `ensureStyles()`:
  ```css
  /* Target Fullscreen Element (Video Player Container or Video) */
  .sentinel-web-fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    min-width: 100vw !important;
    min-height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    z-index: 2147483647 !important;
    background: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }

  /* Direct HTML5 <video> with sentinel-web-fullscreen */
  video.sentinel-web-fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    left: 0 !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    position: fixed !important;
    object-fit: contain !important;
    margin: auto !important;
    z-index: 2147483647 !important;
    background: #000000 !important;
  }
  ```

---

### 2.2 Component 2: `popup/popup.js` (`#btnCtrlFullscreen`)

#### Detailed Implementation Contract:
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

---

### 2.3 Component 3: `content_media.js`

In `handleMediaControl(action, data)`:
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

## 🔒 3. Trusted Types & Security Invariants

1. **W3C Trusted Types Compliance:**
   - 0 uses of `.innerHTML` or `outerHTML`.
   - SVG creation using `createElementNS('http://www.w3.org/2000/svg', ...)`.
2. **CSP Nonce & Isolated World Safety:**
   - `world: 'MAIN'` execution runs purely in the DOM space of the targeted frame without violating Content Security Policy.
3. **Cross-World Lock Attribute:**
   - Deduplication lock `data-sentinel-fs-ts` prevents race conditions across frame and world boundaries.
