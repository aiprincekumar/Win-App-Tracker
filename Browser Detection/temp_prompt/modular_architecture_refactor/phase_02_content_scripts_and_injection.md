# Phase 02: Content Scripts & Injection Modularization

> **Phase Identifier:** `PHASE-02-CONTENT-INJECTION`  
> **Target Subsystem:** Content Scripts & Main-World Injection (`content_media.js`, `inject_main_world.js`, `fullscreen_controller.js`, `src/content/`, `src/inject/`)  
> **Lead Role:** Level 4 Frontend & DOM Engineer  
> **Assigned Model:** `flash` (per Dynamic Matrix Dept 05)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/modular_architecture_refactor/phase_02_content_scripts_and_injection.md`

---

## 🎯 1. Phase Objective
Modularize the complex content scripts and main-world scripts (`content_media.js` 54KB, `inject_main_world.js` 44KB, `fullscreen_controller.js` 30KB) into cohesive, single-responsibility modules under `src/content/` and `src/inject/`. Maintain 100% W3C Trusted Types safety (zero `innerHTML`), deterministic cross-world debounce locking (`data-sentinel-fs-ts`), and seamless tri-channel bridge communication between isolated world and the page context.

---

## 📦 2. Prerequisites & Inputs
- **Prerequisite Phase:** Phase 01 completed (`src/shared/` constants and contracts established).
- **Target Files:**
  - `content_media.js` (Isolated world content script)
  - `inject_main_world.js` (MAIN world injected script)
  - `fullscreen_controller.js` (Standalone fullscreen and floating HUD engine)
  - `manifest.json` (Content script declarations)
- **Baseline Tests:** `node tests/test_fullscreen_controller.js` and `node tests/test_event_deduplication.js` must pass.

---

## ⚓ 3. Technical Context & File Anchors

1. **In `content_media.js`:**
   - Lines 37–58: Safe runtime messaging wrapper (`safeSendMessage`)
   - Lines 59–101: Resolution label detector (`getResolutionLabel`)
   - Lines 102–170: Platform-specific media title extraction (`extractMediaTitle`)
   - Lines 171–350: Media element scanner and event listeners (`attachMediaListeners`, `monitorElement`)
   - Lines 351–500: State change dispatcher & telemetry reporting (`reportMediaState`)
   - Lines 501–750: Cross-frame iframe support & fullscreen messaging (`ensureIframeFullscreenSupport`)
   - Lines 751–1200: Isolated-to-main world bridge (`forwardActionToMainWorld`, `__MEDIA_SENTINEL_ACTION__`)

2. **In `inject_main_world.js`:**
   - Lines 34–77: Prototype descriptors and dynamic iframe hook (`fullscreenEnabled`, `origCreateElement`)
   - Lines 78–130: Speed & quality ladder calculations (`SPEED_LADDER`, `QUALITY_LADDER`, `calculateNextLadderSpeed`)
   - Lines 137–152: YouTube & HTML5 player context finder (`getActivePlayerContext`)
   - Lines 153–220: On-Screen Display (OSD) safe renderer (`showOSD`)
   - Lines 221–600: Video manipulation handlers (play/pause, timeline seek, speed stepper, volume boost)
   - Lines 601–1000: CustomEvent action dispatcher & response broadcaster

3. **In `fullscreen_controller.js`:**
   - Lines 33–65: Debounce lock acquisition (`LOCK_ATTR`, `DEBOUNCE_MS = 350`, `acquireLock`)
   - Lines 66–309: Viewport fill CSS engine (`ensureStyles`, stacking context neutralization, scroll locking)
   - Lines 310–330: SVG element builder (`createElementNS`, `setSvgIcon`)
   - Lines 331–361: Dedicated fullscreen OSD (`showOSD`)
   - Lines 362–650: Floating HUD button lifecycle & keyboard shortcuts (`ensureFloatingButton`, `toggleWebFullscreen`)

---

## 🔨 4. Surgical Step-by-Step Implementation Instructions

### Step 2.1: Modularize Content Script (`src/content/`)
1. Create `src/content/media/metadata_extractor.js`:
   - Implement `extractMediaTitle()` with YouTube, Netflix, Spotify, and generic meta tag extractors.
   - Implement `getResolutionLabel()`.
2. Create `src/content/media/element_detector.js`:
   - Implement HTML5 `<video>` and `<audio>` discovery with `WeakSet` tracking.
   - Implement `MutationObserver` for dynamic SPAs.
3. Create `src/content/media/playback_tracker.js`:
   - Implement event listeners (`play`, `pause`, `timeupdate`, `volumechange`, `ratechange`).
   - Implement throttled progress reporting.
4. Create `src/content/bridge/isolated_bridge.js`:
   - Implement `forwardActionToMainWorld(action, data)` generating unique `actionId`.
   - Implement `safeSendMessage()` for background IPC communication.
5. Create `src/content/fullscreen/`:
   - `css_engine.js`: Encapsulate CSS viewport fill styles and scroll locking.
   - `debounce_lock.js`: Encapsulate `acquireLock()` and `data-sentinel-fs-ts` timestamp checking.
   - `floating_hud.js`: Encapsulate glassmorphism HUD button with SVG icons.

### Step 2.2: Modularize MAIN World Script (`src/inject/`)
1. Create `src/inject/player/youtube_context.js`:
   - Implement `getActivePlayerContext()` for `#movie_player` and HTML5 video.
   - Implement native UI button triggers (`.ytp-fullscreen-button`, `.ytp-size-button`).
2. Create `src/inject/player/html5_controller.js`:
   - Implement direct video manipulation (volume, playbackRate, currentTime).
3. Create `src/inject/ladders/speed_ladder.js`:
   - Export `SPEED_LADDER` and `calculateNextLadderSpeed(currentSpeed, direction)`.
4. Create `src/inject/ladders/quality_ladder.js`:
   - Export `QUALITY_LADDER` and quality label resolver.
5. Create `src/inject/osd/osd_manager.js`:
   - Implement `showOSD(text, icon)` strictly using W3C Trusted Types safe DOM creation (`createElement`, `textContent`). Zero `innerHTML`.
6. Create `src/inject/bridge/main_bridge.js`:
   - Bind `__MEDIA_SENTINEL_ACTION__` event listener on `document` and execute corresponding player actions.

### Step 2.3: Wire Root Entry Points
1. Keep `content_media.js`, `inject_main_world.js`, and `fullscreen_controller.js` at the project root as entry orchestrators.
2. Ensure they expose their functions globally or compose cleanly, maintaining exact compatibility with manifest declarations and tests.

---

## 🚫 5. Architectural Constraints & Boundaries
- **Strict W3C Trusted Types Safety:** Zero assignments to `innerHTML` across all content and inject files.
- **Debounce Lock Window:** The 350ms timestamp lock window must be strictly preserved to eliminate the double-toggle bug.
- **Manifest File Preservation:** `fullscreen_controller.js`, `content_media.js`, and `inject_main_world.js` must remain in `manifest.json` `content_scripts` and `web_accessible_resources`.

---

## 📋 6. Deliverables Manifest
- `src/content/media/metadata_extractor.js`
- `src/content/media/element_detector.js`
- `src/content/media/playback_tracker.js`
- `src/content/bridge/isolated_bridge.js`
- `src/content/fullscreen/css_engine.js`
- `src/content/fullscreen/debounce_lock.js`
- `src/content/fullscreen/floating_hud.js`
- `src/inject/player/youtube_context.js`
- `src/inject/player/html5_controller.js`
- `src/inject/ladders/speed_ladder.js`
- `src/inject/ladders/quality_ladder.js`
- `src/inject/osd/osd_manager.js`
- `src/inject/bridge/main_bridge.js`
- Refactored `content_media.js`, `inject_main_world.js`, and `fullscreen_controller.js`

---

## 🚦 7. Local Verification Gate
Execute the following verification commands; all must exit with code 0:
```powershell
node -c content_media.js
node -c inject_main_world.js
node -c fullscreen_controller.js
node tests/test_fullscreen_controller.js
node tests/test_event_deduplication.js
node tests/test_volume_timeline_fullscreen_controls.js
node tests/test_timer_and_dual_media_tracking.js
```
