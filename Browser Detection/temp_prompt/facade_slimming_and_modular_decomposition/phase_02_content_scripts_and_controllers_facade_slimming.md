# Phase 02: Content Scripts & Controllers Facade Slimming

> **Task ID:** TASK-MODULAR-SPLIT-006-P02  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Agent Role:** Level 4 Extension Runtime Specialist (`extension_runtime_specialist`)  
> **Target Files:** [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js), [`inject_main_world.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/inject_main_world.js), [`fullscreen_controller.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/fullscreen_controller.js), [`src/content/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/content), [`src/inject/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/inject), [`src/fullscreen/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/fullscreen)  
> **Prerequisites:** Phase 01 completed and verified  
> **Status:** READY FOR LEVEL 4 SUBAGENT DISPATCH  

---

## 🎯 1. Phase Objective
Slim down `content_media.js` (currently 2,630 lines), `inject_main_world.js` (1,262 lines), and `fullscreen_controller.js` (792 lines) into pure, robust facades (< 200 lines each) that delegate to their respective modular engines in `src/content/`, `src/inject/`, and `src/fullscreen/`. Maintain 100% W3C Trusted Types compliance (zero `innerHTML`), ensure seamless isolated-to-main-world communication, and guarantee zero regressions on YouTube player hooks and native KeyF fullscreen fallbacks.

---

## 📂 2. Target File Map & Line Anchors

- **Root Facades:**
  - `content_media.js` (Lines 1-2630) -> Facade delegating to `src/content/`
  - `inject_main_world.js` (Lines 1-1262) -> Facade delegating to `src/inject/`
  - `fullscreen_controller.js` (Lines 1-792) -> Facade delegating to `src/fullscreen/`
- **Modular Subsystems:**
  - `src/content/media/element_detector.js` (HTML5 media discovery)
  - `src/content/media/metadata_extractor.js` (Resolution, duration, title extraction)
  - `src/content/media/playback_tracker.js` (Play, pause, timeupdate, ratechange)
  - `src/content/fullscreen/css_engine.js` (Web fullscreen backdrop CSS)
  - `src/content/fullscreen/debounce_lock.js` (Click debounce lock)
  - `src/content/fullscreen/floating_hud.js` (DOM floating button overlay)
  - `src/content/observers/dom_observer.js` (MutationObserver for dynamic pages)
  - `src/content/observers/title_observer.js` (Document title change listener)
  - `src/content/bridge/isolated_bridge.js` (Window message relay)
  - `src/inject/player/youtube_context.js` (YouTube player API hooks)
  - `inject/audio/web_audio_dsp.js` (Web Audio API biquad filter nodes)
  - `inject/osd/osd_manager.js` (On-screen display visual badges)
  - `fullscreen/native_engine.js` (Element.requestFullscreen & KeyF dispatch)
  - `fullscreen/web_fullscreen_engine.js` (Fixed viewport simulation)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

1. **Verify Modules in `src/content/`, `src/inject/`, and `src/fullscreen/`:**
   Confirm that all DOM scanning, event listeners, mutation observers, and message handlers are cleanly encapsulated in the target modules.
2. **Slim `content_media.js`:**
   - Establish barrel imports / namespace resolution for `src/content/*` modules.
   - Retain extension context invalidation guards (`isExtensionContextInvalidated()`).
   - Delegate media detection to `element_detector.js` and `playback_tracker.js`.
   - Delegate floating controls to `floating_hud.js`.
   - Keep root file under 250 lines.
3. **Slim `inject_main_world.js`:**
   - Wire YouTube player interception to `src/inject/player/youtube_context.js`.
   - Wire audio DSP to `src/inject/audio/web_audio_dsp.js`.
   - Wire OSD notifications to `src/inject/osd/osd_manager.js`.
   - Guarantee zero `innerHTML` assignments (use `document.createElement`, `textContent`).
   - Keep root file under 200 lines.
4. **Slim `fullscreen_controller.js`:**
   - Delegate native fullscreen requests to `native_engine.js` and CSS fallback to `web_fullscreen_engine.js`.
   - Keep root file under 150 lines.
5. **Verify UTF-8 BOM:**
   Ensure all edited files are saved with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **STRICT PROHIBITION ON `innerHTML`:** Any assignment to `.innerHTML` will violate W3C Trusted Types and fail Test 9.
- **DO NOT** remove `KeyF` or `KeyT` dispatch logic.
- **DO NOT** alter the window messaging contract between isolated and main world.

---

## 🧪 5. Local Verification Gate

Run the following test suites to verify Phase 02 completion:
```bash
node tests/test_context_invalidation_guards.js
node tests/test_fullscreen_controller.js
node tests/test_fullscreen_blackout_fix.js
node tests/test_media_controls_and_fullscreen_fix.js
node tests/test_syntax_and_manifest_integrity.js
```
**Gate Requirement:** All 5 test suites must pass cleanly with 100% exit code 0.
