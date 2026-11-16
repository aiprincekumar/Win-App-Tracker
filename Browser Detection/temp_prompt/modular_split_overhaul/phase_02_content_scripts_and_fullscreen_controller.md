# Phase 02: Content Scripts & Fullscreen Controller Modular Split

> **Document Type:** Dedicated Phase Instruction Set  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/phase_02_content_scripts_and_fullscreen_controller.md`](phase_02_content_scripts_and_fullscreen_controller.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Department:** Dept 05 (Frontend Engineering) & Dept 10 (AppSec & InfoSec)  
> **Target Agent Role:** Level 4 Extension Runtime Specialist  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Status:** READY FOR EXECUTION (LOCKED UNDER DECISION GATE BARRIER)  

---

## 🎯 1. Phase Objective

Deconstruct the oversized content scripts and in-page injection files:
- **`content_media.js`** (2,378 lines, 91 KB)
- **`inject_main_world.js`** (1,262 lines, 52 KB)
- **`fullscreen_controller.js`** (792 lines, 31 KB)

into modular domain engines under `src/content/`, `src/inject/`, and `src/fullscreen/`. Maintain root facade scripts providing 100% W3C Trusted Types compliance (zero `innerHTML`), robust extension context invalidation guards, and flawless true native monitor fullscreen parity.

---

## 📋 2. Prerequisites & Inputs

- **Prerequisites:** Phase 01 completed cleanly; all Phase 01 verification tests green.
- **Target Files:**
  - `content_media.js` (2,378 lines) — [content_media.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js#L1-L2378)
  - `inject_main_world.js` (1,262 lines) — [inject_main_world.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/inject_main_world.js#L1-L1262)
  - `fullscreen_controller.js` (792 lines) — [fullscreen_controller.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/fullscreen_controller.js#L1-L792)

---

## 🔍 3. Technical Context & File Anchors

1. **`content_media.js`:**
   - Lines 1-120: Context validity detection (`isContextValid()`), safe messaging wrappers, and teardown registry.
   - Lines 121-650: HTML5 `<video>` / `<audio>` discovery, element priority scoring, and `MutationObserver` bindings.
   - Lines 651-1200: Embedded iframe fullscreen policy injection (`ensureIframeFullscreenSupport`), all-frames cross-frame IPC.
   - Lines 1201-1800: In-page floating HUD overlay controller (drag, minimize, volume slider, timeline progress).
   - Lines 1801-2378: Isolated-to-Main world bridge (`window.postMessage`, CustomEvents, synthetic click trap guards).

2. **`inject_main_world.js`:**
   - Lines 1-250: Main world DOM prototype interception (`HTMLMediaElement.prototype.play`, `pause`).
   - Lines 251-700: Web Audio API interception (`AudioContext`, 5-band biquad equalizer graph, volume booster).
   - Lines 701-1050: YouTube internal player API adapter (`movie_player.setPlaybackQualityRange`, speed stepper).
   - Lines 1051-1262: On-Screen Display (OSD) renderer (W3C Trusted Types safe, 0 `innerHTML`).

3. **`fullscreen_controller.js`:**
   - Lines 1-300: Unified fullscreen controller class, native vs. web fullscreen state engine.
   - Lines 301-600: Synthetic click trap (`!e.isTrusted`) and user activation verification.
   - Lines 601-792: Dark container styling isolation (targeting `#movie_player` exclusively; generic video transparent contain).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Step 1: Modularize Isolated Content Engine (`src/content/`)**
   - Refactor `src/content/media/element_detector.js`: DOM scanner prioritizing audible/active media elements.
   - Refactor `src/content/media/playback_tracker.js`: Event listeners for `timeupdate`, `play`, `pause`, `volumechange`.
   - Refactor `src/content/fullscreen/floating_hud.js`: Video overlay HUD using safe DOM creation (`createElement`).
   - Refactor `src/content/bridge/isolated_bridge.js`: Secure two-way `window.postMessage` relay with origin validation.
   - Refactor `src/content/observers/dom_observer.js`: MutationObserver observing dynamic video container attachments.

2. **Step 2: Modularize Main-World Injections (`src/inject/`)**
   - Refactor `src/inject/player/html5_controller.js`: Direct media element methods (playback speed, seek, volume).
   - Refactor `src/inject/player/youtube_context.js`: Deep YouTube API hooks with fallback to standard HTML5.
   - Refactor `src/inject/osd/osd_manager.js`: W3C Trusted Types compliant on-screen display.
   - Refactor `src/inject/ladders/quality_ladder.js` & `speed_ladder.js`: Resolution and playback rate steppers.

3. **Step 3: Modularize Fullscreen Engine (`src/fullscreen/`)**
   - Refactor `src/fullscreen/native_engine.js`: True native monitor fullscreen (`element.requestFullscreen()`).
   - Refactor `src/fullscreen/web_fullscreen_engine.js`: Fallback CSS pseudo-fullscreen when native is gated.
   - Refactor `src/fullscreen/floating_button.js`: Floating button click event handler and click debounce lock.

4. **Step 4: Establish Root Facades**
   - Keep `content_media.js`, `inject_main_world.js`, and `fullscreen_controller.js` at root.
   - Maintain full backward compatibility for `manifest.json` script arrays.
   - Verify zero assignments to `innerHTML` across all newly decomposed files.
   - Ensure UTF-8 BOM byte order mark is preserved.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Security Boundary:** NEVER use `.innerHTML = ...` anywhere in content or inject scripts. Strict W3C Trusted Types compliance.
- **Teardown Boundary:** All event listeners and intervals must be trackable and cleared cleanly when context invalidates.
- **Fullscreen Parity:** Never reintroduce forced web-fullscreen blackout or synthetic click rejection.

---

## 📦 6. Deliverables Manifest

- `src/content/media/element_detector.js`
- `src/content/media/playback_tracker.js`
- `src/content/fullscreen/floating_hud.js`
- `src/content/bridge/isolated_bridge.js`
- `src/inject/player/html5_controller.js`
- `src/inject/player/youtube_context.js`
- `src/inject/osd/osd_manager.js`
- `src/fullscreen/native_engine.js`
- `src/fullscreen/web_fullscreen_engine.js`
- `content_media.js` (Root Facade)
- `inject_main_world.js` (Root Facade)
- `fullscreen_controller.js` (Root Facade)

---

## 🧪 7. Local Verification Gate

Execute and pass all tests cleanly with exit code 0:
```powershell
node -c content_media.js
node -c inject_main_world.js
node -c fullscreen_controller.js
node tests/test_context_invalidation_guards.js
node tests/test_fullscreen_controller.js
node tests/test_fullscreen_blackout_fix.js
node tests/test_media_controls_and_fullscreen_fix.js
node tests/test_volume_timeline_fullscreen_controls.js
```
