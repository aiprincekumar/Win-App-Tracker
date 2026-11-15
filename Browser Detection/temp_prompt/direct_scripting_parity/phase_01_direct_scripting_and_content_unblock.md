# Phase 1 Specification: Direct 0ms Main World Scripting Restoration & Content Script Unblock

> **Phase:** 1 of 3  
> **Task ID:** `TASK-PARITY-OVERHAUL-DIRECT-SCRIPTING-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Required Dynamic Skills:** `frontend-patterns`, `react-patterns`, `code-simplification`  
> **Target Files:**
> - [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)
> - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)

---

## 🎯 1. Phase Objective

Restore direct 0ms MAIN world scripting (`browserAPI.scripting.executeScript({ world: 'MAIN' })`) across all media button handlers in `popup/popup.js` in full parity with `dashboard/dashboard.js` and the existing popup volume/seek scrubbers. Follow each direct script execution with `sendMediaControl(...)` for background IPC telemetry synchronization. Concurrently, unblock direct `primaryMediaElement` execution in `content_media.js` so HTML5 media elements respond deterministically regardless of whether an action was forwarded to the main world bridge. Maintain 100% frozen preservation of `#btnGlobalMediaToggle` and all optimistic cooldown timestamps.

---

## 📋 2. Prerequisites & Inputs

1. Clean repository state on branch `main`.
2. Existing implementation of `dashboard/dashboard.js` (lines ~3323–3750) and `popup/popup.js` volume/seek sliders (lines ~1860–1945) serving as authoritative behavioral models.
3. Node.js runtime available for syntax validation (`node -c`).

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `popup/popup.js` File Anchors
- **Existing Sliders (Authoritative Model):**
  - Volume Slider: [`popup/popup.js#L1860-L1887`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L1860-L1887)
  - Timeline Scrubber: [`popup/popup.js#L1920-L1945`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L1920-L1945)
- **Target Button Handlers to Update:**
  - Play/Pause: [`popup/popup.js#L3355-L3373`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3355-L3373) (`handleTogglePlay`, `#btnCtrlTogglePlay`, `#dynamicStatusBtn`)
  - Rewind (-10s): [`popup/popup.js#L3374-L3386`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3374-L3386) (`#btnCtrlRewind`)
  - Forward (+10s): [`popup/popup.js#L3388-L3400`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3388-L3400) (`#btnCtrlForward`)
  - Toggle Mute: [`popup/popup.js#L3402-L3422`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3402-L3422) (`handleToggleMute`, `#btnCtrlToggleMute`, `#btnQuickMute`)
  - Speed Steppers: [`popup/popup.js#L3423-L3479`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3423-L3479) (`#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`)
  - Fullscreen: [`popup/popup.js#L3484-L3503`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3484-L3503) (`#btnCtrlFullscreen`)
  - Picture-in-Picture: [`popup/popup.js#L3505-L3516`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3505-L3516) (`#btnCtrlPip`)
  - Theater Mode: [`popup/popup.js#L3518-L3525`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3518-L3525) (`#btnCtrlTheater`)
  - Quality Steppers: [`popup/popup.js#L3527-L3543`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3527-L3543) (`#btnCtrlQualityDown`, `#btnCtrlQualityUp`)
- **Preserved Invariant Anchors:**
  - `#btnGlobalMediaToggle`: [`popup/popup.js#L3193-L3207`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3193-L3207)
  - Cooldown timestamps: [`popup/popup.js#L140-L160`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L140-L160)

### 3.2 `content_media.js` File Anchors
- **Execution Guard to Unblock:**
  - [`content_media.js#L1605`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js#L1605) (`shouldExecuteDirect` definition in `handleMediaControl`)

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update `popup/popup.js` Button Handlers
In `popup/popup.js`, augment each media button handler with direct `browserAPI.scripting.executeScript`:

1. **`handleTogglePlay` (lines ~3356–3366):**
   Before `sendMediaControl('toggle_play', {}, targetTabId);`, add:
   ```javascript
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
             if (state === 1) {
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
   ```

2. **`btnRewind` (lines ~3374–3386):**
   Before `sendMediaControl('seek_relative', { offsetSeconds: -10 }, targetTabId);`, add:
   ```javascript
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
   ```

3. **`btnForward` (lines ~3388–3400):**
   Before `sendMediaControl('seek_relative', { offsetSeconds: 10 }, targetTabId);`, add:
   ```javascript
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
   ```

4. **`handleToggleMute` (lines ~3402–3422):**
   Before `sendMediaControl('toggle_mute', {}, targetTabId);`, add:
   ```javascript
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
   ```

5. **`btnSpeedDown` & `btnSpeedUp` (lines ~3423–3479):**
   Before `sendMediaControl('step_speed', ...);`, add:
   ```javascript
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
   ```

6. **`btnFullscreen` (lines ~3484–3503):**
   Before `sendMediaControl('toggle_fullscreen', {}, targetTabId);`, add:
   ```javascript
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
   ```

7. **`btnPip`, `btnTheater`, `btnQualityDown`, `btnQualityUp`:**
   Add matching `executeScript` (`world: 'MAIN'`) mirroring `dashboard/dashboard.js` lines ~3621–3750, followed by `sendMediaControl(...)`.

### Step 2: Update `content_media.js` Execution Guard
In `content_media.js` (around line 1605):
Update `shouldExecuteDirect` to ensure `primaryMediaElement` is unblocked:
```javascript
const shouldExecuteDirect = Boolean(primaryMediaElement) || action === 'toggle_fullscreen';
```

### Step 3: Verify Invariants
- Verify `#btnGlobalMediaToggle` remains completely untouched and bound to `TOGGLE_GLOBAL_MEDIA`.
- Verify `lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, and `renderMediaCard` 800ms cooldown guards are intact.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries

1. Do NOT modify the visual styling, CSS classes, or DOM structure of the popup.
2. Do NOT touch `#btnGlobalMediaToggle` logic or merge it into single-tab controls.
3. Do NOT remove or reduce the 800ms cooldown locks in `renderMediaCard`.
4. Do NOT introduce any `innerHTML` assignments (W3C Trusted Types compliance).

---

## 📦 6. Deliverables Manifest

1. Updated [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) with direct `executeScript` (`world: 'MAIN'`) across all button handlers.
2. Updated [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js) with unblocked `primaryMediaElement` execution.

---

## 🚦 7. Local Verification Gate

Run deterministic syntax check:
```powershell
node -c popup/popup.js
node -c content_media.js
```
Both commands must exit with code 0 and produce 0 warnings or errors.
