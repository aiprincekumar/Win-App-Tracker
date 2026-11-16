# Phase 1: Explicit Media Controls & Mutual Exclusion Implementation
## Standalone Executable Subagent Task Specification

> **Task ID:** `TASK-IDEMPOTENT-MEDIA-CONTROLS-PHASE1`  
> **Target Role:** Level 4 Frontend Engineer (`Frontend Engineer`)  
> **Assigned AI Model:** `flash` (Fast, high-fidelity deterministic code authoring)  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Authorization Mandate:** Requires valid `AUTH-MGR-*` token from Level 2 Manager  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Master Design Reference:** [`TRD.md`](TRD.md), [`PRD.md`](PRD.md), [`DESIGN.md`](DESIGN.md)  

---

## 🎯 1. Phase Objective

Implement explicit, idempotent play/pause and mute/unmute command dispatch across the entire Chrome MV3 extension pipeline, enforcing strict `else if (video)` mutual exclusion between YouTube's `#movie_player` API and standard HTML5 `<video>` elements in injected MAIN-world scripts.

### 5 Core Files to Modify:
1. `popup/popup.js` (lines ~3356–3515)
2. `dashboard/dashboard.js` (lines ~4615–4700)
3. `background.js` (lines ~2820–2840)
4. `content_media.js` (lines ~1880–1915 & lines ~2285–2300)
5. `inject_main_world.js` (lines ~635–660 & lines ~860–930)

---

## 📋 2. Prerequisites & Invariant Guardrails

- **Universal Multi-Tab Toggle Invariant:** `#btnGlobalMediaToggle` in `popup/popup.js` (lines ~3194–3207) MUST REMAIN 100% UNTOUCHED. It controls all tabs simultaneously via `TOGGLE_GLOBAL_MEDIA` and must never be converted to single-tab controls.
- **Optimistic State Cooldown Locks:** All cooldown timestamps (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, `lastControlsRowActiveTime`) and the 800ms suppression guard in `renderMediaCard` must remain strictly intact.
- **Backward Compatibility:** All existing generic toggle commands (`toggle_play`, `toggle_mute`) must remain fully supported alongside explicit actions.
- **W3C Trusted Types:** Zero `innerHTML` assignments in injected content or main-world scripts.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1: `popup/popup.js` — Explicit Dispatch & Mutual Exclusion
1. Locate `handleTogglePlay` (around line 3356):
   - Determine `isCurrentlyPlaying = Boolean(activeMediaCached.isPlaying || activeMediaCached.state === 'playing')`.
   - Set `targetPlaying = !isCurrentlyPlaying`.
   - Set `targetAction = targetPlaying ? 'play' : 'pause'` (or `'toggle_play'` if `activeMediaCached` is absent).
   - In `browserAPI.scripting.executeScript`:
     - Pass `args: [targetAction]`.
     - In the injected function `(action) => { ... }`, check `moviePlayer` first. If present, handle `action === 'play'`, `action === 'pause'`, or toggle.
     - Use `else if (video)` so `<video>` is strictly NOT actuated when `moviePlayer` is present.
   - Dispatch `sendMediaControl(targetAction, {}, targetTabId)`.
2. Locate `handleToggleMute` (around line 3480):
   - Determine `isCurrentlyMuted = Boolean(activeMediaCached.isMuted)`.
   - Set `targetMuted = !isCurrentlyMuted`.
   - Set `targetAction = targetMuted ? 'mute' : 'unmute'` (or `'toggle_mute'` if `activeMediaCached` is absent).
   - In `browserAPI.scripting.executeScript`:
     - Pass `args: [targetAction]`.
     - In injected function, check `moviePlayer` first. If present, call `moviePlayer.mute()` or `moviePlayer.unMute()`.
     - Use `else if (video)` to set `video.muted = true` or `video.muted = false`.
   - Dispatch `sendMediaControl(targetAction, {}, targetTabId)`.

### Step 2: `dashboard/dashboard.js` — Explicit Dispatch & Mutual Exclusion
1. Locate `handleTogglePlayHero` (around line 4615):
   - Compute explicit `targetAction` from `pm.isPlaying`.
   - Add YouTube `moviePlayer` detection alongside `else if (video)` with `args: [targetAction]`.
   - Dispatch `sendMediaControl(targetAction, {}, targetTabId)`.
2. Locate `btnHeroMute` click listener (around line 4680):
   - Compute explicit `targetAction` (`mute` or `unmute`) from `pm.isMuted`.
   - Add YouTube `moviePlayer` detection alongside `else if (video)` with `args: [targetAction]`.
   - Dispatch `sendMediaControl(targetAction, {}, targetTabId)`.

### Step 3: `background.js` — Optimistic Mute/Unmute Tracking
1. Locate `message.action === 'toggle_mute'` in `background.js` (around line 2836).
2. Immediately below, add explicit handling:
   ```javascript
   } else if (message.action === 'mute') {
     pm.isMuted = true;
   } else if (message.action === 'unmute') {
     pm.isMuted = false;
   }
   ```
3. Ensure `safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });` broadcasts the updated state.

### Step 4: `content_media.js` — Router & Action Execution
1. In `KNOWN_MEDIA_ACTIONS` (around line 2288), append `'mute'` and `'unmute'`:
   ```javascript
   const KNOWN_MEDIA_ACTIONS = [
     'play', 'pause', 'toggle_play', 'seek_relative', 'seek_percent',
     'toggle_mute', 'mute', 'unmute', 'set_volume', 'SET_VOLUME', 'step_speed', 'set_speed',
     'cycle_speed', 'toggle_fullscreen', 'toggle_pip', 'toggle_theater',
     'step_quality', 'set_quality'
   ];
   ```
2. In `handleMediaControl` switch (around line 1900), add:
   ```javascript
   case 'mute': {
     primaryMediaElement.muted = true;
     break;
   }
   case 'unmute': {
     primaryMediaElement.muted = false;
     break;
   }
   ```

### Step 5: `inject_main_world.js` — Native Main World Engine & OSD
1. In the main action switch (around line 635), add:
   ```javascript
   case 'mute': {
     if (moviePlayer && typeof moviePlayer.mute === 'function') {
       try { moviePlayer.mute(); } catch (_) {}
     } else if (video) {
       try { video.muted = true; } catch (_) {}
     }
     showOSD('Muted', '🔇');
     break;
   }
   case 'unmute': {
     if (moviePlayer && typeof moviePlayer.unMute === 'function') {
       try { moviePlayer.unMute(); } catch (_) {}
     } else if (video) {
       try { video.muted = false; } catch (_) {}
     }
     showOSD('Unmuted', '🔊');
     break;
   }
   ```
2. In `case 'play'` and `case 'pause'` (around lines 861–925):
   - Ensure `isHandled` properly guards tier 2 and tier 3 execution so fallback tiers never re-actuate if tier 1 already handled the command.

---

## 🔬 4. Local Verification Gate

The assigned engineer must execute the following deterministic commands and verify clean exit code 0:
```bash
node -c popup/popup.js
node -c dashboard/dashboard.js
node -c background.js
node -c content_media.js
node -c inject_main_world.js
node tests/test_syntax_and_manifest_integrity.js
```

---

## 📦 5. Deliverables Manifest
- Updated `popup/popup.js`
- Updated `dashboard/dashboard.js`
- Updated `background.js`
- Updated `content_media.js`
- Updated `inject_main_world.js`
- Clean `node -c` syntax check outputs confirming 0 errors.
