# Technical Requirements Document (TRD)
## Single-Execution Determinism & Double-Toggle Elimination

> **Component:** Popup Dashboard & Content Script Media Controller  
> **Lead Architecture Department:** Dept 04 Architecture & System Design / Dept 05 Frontend Engineering  
> **Document Status:** `APPROVED FOR IMPLEMENTATION`  

---

## 1. High-Level Design (HLD)

### 1.1 Dual-Execution Elimination Pattern
The core architectural refactor eliminates duplicate execution paths at both the popup layer and the content script layer:

```
[ Previous Flawed Flow ]
Popup Button Click
   ├──> browserAPI.scripting.executeScript(...) [MAIN World Execution]
   └──> sendMediaControl(...) [IPC Message]
            └──> content_media.js handleMediaControl()
                     ├──> forwardActionToMainWorld(...) [MAIN World Execution]
                     └──> primaryMediaElement.play()/pause() [Isolated World DOM Mutation]
   ===> RESULT: Up to 3 executions per click! Double-toggle race condition!

[ Rectified Single-Execution Determinism Flow ]
Popup Button Click
   ├──> Set optimistic timestamp (lastPlayToggleTime = Date.now())
   ├──> Mutate local UI cache & render optimistically
   └──> Sole Authoritative Dispatch: sendMediaControl(action, data, targetTabId)
            └──> content_media.js handleMediaControl()
                     └──> SINGLE EXECUTION BRANCH:
                              - YouTube / Bridge page: forwardActionToMainWorld ONLY
                              - Standard HTML5 page: primaryMediaElement manipulation ONLY
                              - Fullscreen: click __sentinel_fs_floating_btn__ ONCE
   ===> RESULT: Exactly 1 execution per click! Zero race conditions!
```

---

## 2. Low-Level Design (LLD)

### 2.1 Modifications to `popup/popup.js`

#### A. Play/Pause Handler (`handleTogglePlay`, lines ~3316-3356)
- **Current Defect:** Contains a 28-line `browserAPI.scripting.executeScript` block that calls `moviePlayer.pauseVideo()` / `playVideo()` and `video.play()` / `pause()`, followed immediately by `sendMediaControl('toggle_play', {}, targetTabId)`.
- **Rectification:**
  ```javascript
  const handleTogglePlay = () => {
    lastPlayToggleTime = Date.now();
    if (activeMediaCached) {
      activeMediaCached.isPlaying = !activeMediaCached.isPlaying;
      activeMediaCached.state = activeMediaCached.isPlaying ? 'playing' : 'paused';
      renderMediaCard({ primaryMedia: activeMediaCached });
    }
    const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
      (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

    // Sole authoritative single-dispatch: routes cleanly to background and content script
    sendMediaControl('toggle_play', {}, targetTabId);
  };
  ```

#### B. Seek Rewind (`#btnCtrlRewind`, lines ~3363-3405)
- **Current Defect:** Contains `executeScript` seeking -10s, followed by `sendMediaControl`.
- **Rectification:** Strip `executeScript`. Retain `lastProgressDragTime = Date.now()`, update cached `currentTime`, and call `sendMediaControl('seek_relative', { offsetSeconds: -10 }, targetTabId)`.

#### C. Seek Forward (`#btnCtrlForward`, lines ~3407-3448)
- **Current Defect:** Contains `executeScript` seeking +10s, followed by `sendMediaControl`.
- **Rectification:** Strip `executeScript`. Retain `lastProgressDragTime = Date.now()`, update cached `currentTime`, and call `sendMediaControl('seek_relative', { offsetSeconds: 10 }, targetTabId)`.

#### D. Mute/Unmute (`#btnCtrlToggleMute` & `#btnQuickMute`, lines ~3450-3505)
- **Current Defect:** Contains `executeScript` toggling mute, followed by `sendMediaControl`.
- **Rectification:** Strip `executeScript`. Retain `lastMuteToggleTime = Date.now()`, update cached `isMuted`, and call `sendMediaControl('toggle_mute', {}, targetTabId)`.

#### E. Speed Steppers (`#btnCtrlSpeedDown` & `#btnCtrlSpeedUp`, lines ~3510-3605)
- **Current Defect:** Contains `executeScript` modifying playbackRate, followed by `sendMediaControl`.
- **Rectification:** Strip `executeScript`. Retain `lastSpeedChangeTime = Date.now()`, update cached `playbackRate`, and call `sendMediaControl('step_speed', { direction: 'down' / 'up' }, targetTabId)`.

#### F. Fullscreen Toggle (`#btnCtrlFullscreen`, lines ~3610-3665)
- **Current Defect:** Contains `executeScript` clicking `__sentinel_fs_floating_btn__`, followed by `sendMediaControl('toggle_fullscreen')` which ALSO clicks `__sentinel_fs_floating_btn__`.
- **Rectification:** Strip `executeScript` block entirely. Unconditionally invoke `sendMediaControl('toggle_fullscreen', {}, targetTabId)`.

#### G. Extended Controls (PiP, Theater, Quality Steppers, lines ~3670-3790)
- **Rectification:** Strip `executeScript` blocks from `#btnCtrlPip`, `#btnCtrlTheater`, `#btnCtrlQualityDown`, and `#btnCtrlQualityUp`. Rely solely on `sendMediaControl`.

#### H. Untouched Invariants:
- `#btnGlobalMediaToggle` (lines 3154-3168) remains 100% untouched.
- Scrubber sliders (`#progressBarContainer`, `#volumeBarContainer`) and helper tools (`btnCardCaptureFrame`, `btnCardCinemaDim`, `btnCardLoopMedia`) remain intact.

---

### 2.2 Modifications to `content_media.js`

#### A. Internal Single-Execution Branching in `handleMediaControl(action, data)`
- **Current Defect (lines ~1560-1595):**
  ```javascript
  // 1. Forward action to Main World engine
  if (action !== 'toggle_fullscreen') {
    forwardActionToMainWorld(action, data);
  }
  // 2. Perform direct HTML5 video element manipulation
  if (primaryMediaElement) {
    switch (action) {
      case 'toggle_play': {
        if (primaryMediaElement.paused) primaryMediaElement.play();
        else primaryMediaElement.pause();
        break;
      }
      // ...
    }
  }
  ```
- **Rectification:**
  Prevent concurrent execution for toggle actions. If the page is YouTube or a page with an active Main World bridge, forwarding the action to Main World handles the player API, native controls, and OSD. Direct isolated element mutation must NOT run concurrently for `toggle_play`, `play`, `pause`, or `toggle_mute` when the Main World bridge handles it.
  Specifically:
  ```javascript
  const isMainWorldTarget = isYouTubeDomain() || isMainWorldBridgeActive();

  if (isMainWorldTarget && action !== 'toggle_fullscreen') {
    forwardActionToMainWorld(action, data);
  } else if (primaryMediaElement) {
    // Execute direct HTML5 manipulation ONLY when not handled by Main World bridge
    try {
      switch (action) {
        case 'play': {
          const p = primaryMediaElement.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
          break;
        }
        case 'pause': {
          primaryMediaElement.pause();
          break;
        }
        case 'toggle_play': {
          if (primaryMediaElement.paused) {
            const p = primaryMediaElement.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } else {
            primaryMediaElement.pause();
          }
          break;
        }
        case 'toggle_mute': {
          primaryMediaElement.muted = !primaryMediaElement.muted;
          break;
        }
        // ... continuous actions like seek, volume, speed apply cleanly
      }
    } catch (_) {}
  }
  ```

#### B. Fullscreen Floating Button Single-Click Guarantee
- In `handleMediaControl('toggle_fullscreen')`:
  ```javascript
  case 'toggle_fullscreen': {
    const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
    if (floatingBtn) {
      try {
        floatingBtn.click();
      } catch (_) {
        if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
          window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
        }
      }
    } else if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
      window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
    } else {
      forwardActionToMainWorld('toggle_fullscreen', data);
      const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') || document.querySelector('.ytp-fullscreen-button');
      if (ytFsBtn) {
        try { ytFsBtn.click(); } catch (_) {}
      } else {
        toggleWebFullscreen(primaryMediaElement);
      }
    }
    break;
  }
  ```
  Because popup `#btnCtrlFullscreen` no longer executes `executeScript`, `floatingBtn.click()` is executed exactly once!

---

### 2.3 Modifications to `tests/test_media_controls_and_fullscreen_fix.js`

#### A. Invariants Updated:
1. **Assert 0 Conflicting `executeScript` in Media Control Buttons:**
   Verify that `handleTogglePlay`, `btnRewind`, `btnForward`, `btnCtrlToggleMute`, `btnCtrlSpeedDown`, `btnCtrlSpeedUp`, `btnCtrlFullscreen`, `btnCtrlPip`, `btnCtrlTheater`, `btnCtrlQualityDown`, and `btnCtrlQualityUp` do NOT invoke `browserAPI.scripting.executeScript`.
2. **Verify Single Authoritative `sendMediaControl` Dispatch:**
   Verify that each button unconditionally calls `sendMediaControl` with the expected action and payload.
3. **Simulated Runtime Mock Verification:**
   In Test 9, clicking each mock button must intercept exactly 1 `sendMediaControl` call, and 0 `executeScript` calls for those controls.
4. **Preserve Valid Existing Tests:**
   Keep Test 1 (router parsing), Test 2 (action execution), Test 3 (fullscreen priority hierarchy), Test 5 (global media invariant), Test 7 (syntax & trusted types), and Test 8 (optimistic state lock).
