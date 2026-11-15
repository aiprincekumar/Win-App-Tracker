# Parity Overhaul: Direct 0ms Main World Scripting Restoration & Popup-Dashboard Media Actuation Parity
## Technical Requirements Document (TRD)

> **Document Type:** Technical Requirements Document (TRD)  
> **Task ID:** `TASK-PARITY-OVERHAUL-DIRECT-SCRIPTING-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Ephemeral Container:** `temp_prompt/direct_scripting_parity/`  

---

## 🏛️ 1. Technical Architecture & System Overview

The Web Activity & Media Sentinel extension employs a hybrid multi-tier media control architecture designed for instant UI feedback, guaranteed background state synchronization, and resilience across various media page contexts (HTML5, YouTube API, cross-origin iframes, and background tabs).

```
+-----------------------------------------------------------------------------------+
|                            USER INTERACTION LAYER                                 |
|  Popup Mode (popup/popup.js)              Dashboard Mode (dashboard/dashboard.js)  |
+-----------------------------------------------------------------------------------+
        |                                                           |
        | 1. Direct Scripting (0ms)                                 | 1. Direct Scripting (0ms)
        v                                                           v
+-----------------------------------------------------------------------------------+
|               HOST PAGE EXECUTION CONTEXT (MAIN WORLD)                            |
|   browserAPI.scripting.executeScript({ world: 'MAIN', func: ... })                |
|   -> document.getElementById('movie_player') (YouTube API Methods)                |
|   -> document.querySelectorAll('video', 'audio') (HTML5 Media Elements)          |
+-----------------------------------------------------------------------------------+
        |                                                           |
        | 2. Extension IPC Bus (sendMediaControl)                   | 2. Extension IPC Bus
        v                                                           v
+-----------------------------------------------------------------------------------+
|                 BACKGROUND SERVICE WORKER (background.js)                         |
|   -> Updates globalMediaState & optimistic state cache                            |
|   -> Forwards to Content Script (chrome.tabs.sendMessage)                         |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                     CONTENT SCRIPT (content_media.js)                             |
|   -> handleMediaControl(action, data)                                             |
|   -> Unblocked Direct primaryMediaElement execution fallback                      |
|   -> Dispatches to inject_main_world.js via CustomEvent Bridge                    |
+-----------------------------------------------------------------------------------+
```

---

## 🔧 2. Low-Level Design (LLD) Specifications

### 2.1 Popup Button Handler Scripting Implementation (`popup/popup.js`)

Each button handler in `popup/popup.js` must implement direct `browserAPI.scripting.executeScript` with `world: 'MAIN'` before invoking `sendMediaControl(...)`.

#### 1. Play / Pause (`handleTogglePlay`, `#btnCtrlTogglePlay`, `#dynamicStatusBtn`)
```javascript
const handleTogglePlay = () => {
  lastPlayToggleTime = Date.now();
  if (activeMediaCached) {
    activeMediaCached.isPlaying = !activeMediaCached.isPlaying;
    activeMediaCached.state = activeMediaCached.isPlaying ? 'playing' : 'paused';
    renderMediaCard({ primaryMedia: activeMediaCached });
  }
  const targetTabId = getActiveMediaTabId();

  // Direct fast MAIN world scripting execution (0ms play/pause response)
  if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
    browserAPI.scripting.executeScript({
      target: { tabId: targetTabId },
      world: 'MAIN',
      func: () => {
        const moviePlayer = document.getElementById('movie_player') || window.movie_player;
        const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
        if (moviePlayer && typeof moviePlayer.getPlayerState === 'function') {
          try {
            const state = moviePlayer.getPlayerState();
            if (state === 1) { // playing
              moviePlayer.pauseVideo();
            } else {
              moviePlayer.playVideo();
            }
          } catch (_) {}
        }
        if (video) {
          try {
            if (video.paused) {
              const p = video.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            } else {
              video.pause();
            }
          } catch (_) {}
        }
      }
    }).catch(() => {});
  }

  sendMediaControl('toggle_play', {}, targetTabId);
};
```

#### 2. Seek Relative Rewind / Forward (`#btnCtrlRewind`, `#btnCtrlForward`)
```javascript
// Rewind (-10s)
if (btnRewind) {
  btnRewind.addEventListener('click', () => {
    lastProgressDragTime = Date.now();
    if (activeMediaCached && typeof activeMediaCached.currentTime === 'number') {
      activeMediaCached.currentTime = Math.max(0, activeMediaCached.currentTime - 10);
      renderMediaCard({ primaryMedia: activeMediaCached });
    }
    const targetTabId = getActiveMediaTabId();

    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({
        target: { tabId: targetTabId },
        world: 'MAIN',
        func: () => {
          const moviePlayer = document.getElementById('movie_player') || window.movie_player;
          const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
          if (moviePlayer && typeof moviePlayer.getCurrentTime === 'function' && typeof moviePlayer.seekTo === 'function') {
            try {
              const cur = moviePlayer.getCurrentTime() || 0;
              moviePlayer.seekTo(Math.max(0, cur - 10), true);
            } catch (_) {}
          }
          if (video) {
            try {
              video.currentTime = Math.max(0, video.currentTime - 10);
            } catch (_) {}
          }
        }
      }).catch(() => {});
    }

    sendMediaControl('seek_relative', { offsetSeconds: -10 }, targetTabId);
  });
}

// Forward (+10s)
if (btnForward) {
  btnForward.addEventListener('click', () => {
    lastProgressDragTime = Date.now();
    if (activeMediaCached && typeof activeMediaCached.currentTime === 'number') {
      activeMediaCached.currentTime = activeMediaCached.currentTime + 10;
      renderMediaCard({ primaryMedia: activeMediaCached });
    }
    const targetTabId = getActiveMediaTabId();

    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({
        target: { tabId: targetTabId },
        world: 'MAIN',
        func: () => {
          const moviePlayer = document.getElementById('movie_player') || window.movie_player;
          const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
          if (moviePlayer && typeof moviePlayer.getCurrentTime === 'function' && typeof moviePlayer.seekTo === 'function') {
            try {
              const cur = moviePlayer.getCurrentTime() || 0;
              const dur = (typeof moviePlayer.getDuration === 'function' ? moviePlayer.getDuration() : 999999) || 999999;
              moviePlayer.seekTo(Math.min(dur, cur + 10), true);
            } catch (_) {}
          }
          if (video) {
            try {
              const maxDur = (Number.isFinite(video.duration) && video.duration > 0) ? video.duration : 999999;
              video.currentTime = Math.min(maxDur, video.currentTime + 10);
            } catch (_) {}
          }
        }
      }).catch(() => {});
    }

    sendMediaControl('seek_relative', { offsetSeconds: 10 }, targetTabId);
  });
}
```

#### 3. Toggle Mute (`handleToggleMute`, `#btnCtrlToggleMute`, `#btnQuickMute`)
```javascript
const handleToggleMute = () => {
  lastMuteToggleTime = Date.now();
  if (activeMediaCached) {
    activeMediaCached.isMuted = !activeMediaCached.isMuted;
    renderMediaCard({ primaryMedia: activeMediaCached });
  }
  const targetTabId = getActiveMediaTabId();

  if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
    browserAPI.scripting.executeScript({
      target: { tabId: targetTabId },
      world: 'MAIN',
      func: () => {
        const moviePlayer = document.getElementById('movie_player') || window.movie_player;
        const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
        if (moviePlayer && typeof moviePlayer.isMuted === 'function') {
          try {
            if (moviePlayer.isMuted()) {
              if (typeof moviePlayer.unMute === 'function') moviePlayer.unMute();
            } else {
              if (typeof moviePlayer.mute === 'function') moviePlayer.mute();
            }
          } catch (_) {}
        } else if (video) {
          try {
            video.muted = !video.muted;
          } catch (_) {}
        }
      }
    }).catch(() => {});
  }

  sendMediaControl('toggle_mute', {}, targetTabId);
};
```

#### 4. Speed Down / Up (`#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`)
```javascript
// Mirroring dashboard.js lines ~3426–3443 and ~3460–3477
if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
  browserAPI.scripting.executeScript({
    target: { tabId: targetTabId, allFrames: true },
    world: 'MAIN',
    func: (spd) => {
      const p = document.getElementById('movie_player') || window.movie_player;
      if (p && typeof p.setPlaybackRate === 'function') {
        try { p.setPlaybackRate(spd); } catch (_) {}
      }
      const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
      if (video) {
        try { video.playbackRate = spd; } catch (_) {}
      }
    },
    args: [targetSpeed]
  }).catch(() => {});
}
sendMediaControl('step_speed', { direction, targetSpeed, step }, targetTabId);
```

#### 5. Fullscreen Toggle (`#btnCtrlFullscreen`)
```javascript
// Mirroring dashboard.js lines ~3505–3603
if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
  browserAPI.scripting.executeScript({
    target: { tabId: targetTabId },
    world: 'MAIN',
    func: () => {
      const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
      if (floatingBtn) {
        floatingBtn.click();
        return;
      }
      const ctrl = window.__SentinelFullscreenController || globalThis.__SentinelFullscreenController;
      if (ctrl && typeof ctrl.toggleWebFullscreen === 'function') {
        ctrl.toggleWebFullscreen();
        return;
      }
      if (ctrl && typeof ctrl.toggle === 'function') {
        ctrl.toggle(null, { forceWeb: true });
        return;
      }
      try {
        window.dispatchEvent(new CustomEvent('__SENTINEL_FULLSCREEN_ACTION__', {
          detail: { action: 'toggle', options: { forceWeb: true } }
        }));
      } catch (_) {}
    }
  }).catch(() => {});
}
sendMediaControl('toggle_fullscreen', {}, targetTabId);
```

#### 6. Extended Controls (PiP, Theater, Quality Steppers)
- **PiP (`#btnCtrlPip`):** Check `document.pictureInPictureElement` / `video.requestPictureInPicture()`, followed by `sendMediaControl('toggle_pip')`.
- **Theater (`#btnCtrlTheater`):** Check `.ytp-size-button` / KeyT, followed by `sendMediaControl('toggle_theater')`.
- **Quality (`#btnCtrlQualityDown`, `#btnCtrlQualityUp`):** Access `moviePlayer.getAvailableQualityLevels()`, set range, followed by `sendMediaControl('step_quality')`.

---

### 2.2 Content Script Execution Unblock (`content_media.js`)

In `content_media.js` (`handleMediaControl`):
```javascript
// Previously:
// const shouldExecuteDirect = (!forwardedToMainWorld || !isBridgeActive) && (Boolean(primaryMediaElement) || action === 'toggle_fullscreen');

// Unblocked execution:
const shouldExecuteDirect = Boolean(primaryMediaElement) || action === 'toggle_fullscreen';
```
*Note on Mute Inversion Safety:* When executing `toggle_mute` directly on `primaryMediaElement`, if `forwardedToMainWorld` already executed on `moviePlayer`, check if `primaryMediaElement.muted` has already shifted to prevent double-inversion jitter.

---

### 2.3 Strict Invariant Preservation

1. **`#btnGlobalMediaToggle` (Universal Multi-Tab Play/Pause):**
   ```javascript
   const btnGlobalMediaToggle = document.getElementById('btnGlobalMediaToggle');
   if (btnGlobalMediaToggle) {
     btnGlobalMediaToggle.addEventListener('click', () => {
       try {
         const p = browserAPI.runtime.sendMessage({ type: 'TOGGLE_GLOBAL_MEDIA' }, (res) => {
           if (res && res.action) {
             showPopupToast(res.action === 'PAUSE_ALL' ? 'Paused all media' : 'Resumed media', 'info');
           }
           refreshDashboard(true);
         });
         if (p && typeof p.catch === 'function') p.catch(() => {});
       } catch (_) {}
     });
   }
   ```
   **CRITICAL:** Must remain completely untouched and isolated from single-tab controls!

2. **Cooldown Locks:**
   - `lastPlayToggleTime`
   - `lastMuteToggleTime`
   - `lastSpeedChangeTime`
   - `lastControlsRowActiveTime`
   - `lastProgressDragTime`
   - `lastVolumeDragTime`
   All must be updated in handlers and respected in `renderMediaCard` (800ms guard).

---

## 🧪 3. Verification Test Suite Contracts (`test_media_controls_and_fullscreen_fix.js`)

The test suite must be updated from asserting "0 executeScript" to asserting:
1. **Test 4:** Update `#btnCtrlFullscreen` assertion: verify that `executeScript` (`world: 'MAIN'`) is present alongside `sendMediaControl('toggle_fullscreen')`, without obsolete manual CSS class manipulation bloat.
2. **Test 6:** Update media control wiring assertion: verify that each button handler contains direct `executeScript` (`world: 'MAIN'`) AND `sendMediaControl`.
3. **Test 9:** Update the runtime mock sandbox:
   - Provide a functional mock for `browserAPI.scripting.executeScript` that logs calls and executes `func` against simulated DOM targets.
   - Assert that clicking `#btnCtrlTogglePlay`, `#btnCtrlRewind`, `#btnCtrlForward`, `#btnCtrlToggleMute`, `#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`, etc. produces:
     - Exactly 1 `executeScript` call with valid tabId and function.
     - Exactly 1 `sendMediaControl` IPC dispatch.
4. **Test 5 & 8 & 10:** Keep `#btnGlobalMediaToggle`, optimistic cooldowns, and parity resilience tests 100% green.
