<!-- UTF-8 with BOM -->
# TASK-FULLSCREEN-BLACKOUT-003: Live Tracking Board & Problem-Solution Dossier

> **Specification & Governance:**
> - **Task Identifier:** `TASK-FULLSCREEN-BLACKOUT-003`
> - **Lead Architecture:** Level 3C Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Target Execution Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
> - **Lead Department:** Department 05 (Frontend Engineering) & Department 08 (QA & Testing)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 📋 1. Executive Problem-Solution Summary

### The Defect (Fullscreen Blackout Bug)
When testing media playback embedded inside an `<iframe>` (e.g., W3Schools HTML5 Video Tryit Editor, embed players), clicking the **Fullscreen** button in the extension popup (`#btnCtrlFullscreen`) caused the entire top-level web page to turn solid black.
1. **Top-Level Frame Target Execution:** In `popup/popup.js`, `browserAPI.scripting.executeScript` was executed without `allFrames: true` (`target: { tabId: targetTabId }`), executing only in the top-level parent document where no `<video>` element exists.
2. **Body Fallback in Target Element Resolver:** In `fullscreen_controller.js`, `getTargetElement()` had a terminal fallback: `return document.body || document.documentElement || null;`. Because no video existed in the top frame, it returned `document.body`.
3. **Blackout Styling Applied to Page Root:** `enterWebFullscreen(targetEl)` applied `.sentinel-web-fullscreen` (`background: #000000 !important; position: fixed !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important;`) directly to `document.body` of the main website. This painted a solid black box over the entire page and covered the iframe, making it impossible to see the video or website content.
4. **Content Script Missing Guard:** In `content_media.js`, `case 'toggle_fullscreen':` had `shouldExecuteDirect = Boolean(primaryMediaElement) || action === 'toggle_fullscreen';`, which triggered controller execution even in frames without any media.

### The Surgical Solution
1. **`fullscreen_controller.js` Hardening:**
   - Remove `document.body` and `documentElement` fallbacks from `getTargetElement()`. If no player container or video element is found, return `null`.
   - Add explicit target guard in `enterWebFullscreen(targetEl)`: if `!el || el === document.body || el === document.documentElement`, abort immediately and return `false`.
   - Update CSS rules so that direct `<video.sentinel-web-fullscreen>` elements cleanly fill the viewport (`100vw`, `100vh`, `position: fixed`, `object-fit: contain !important`, `z-index: 2147483647 !important`, `background: #000000 !important`).
2. **`popup/popup.js` Frame-Aware Actuation:**
   - Update `executeScript` in `#btnCtrlFullscreen` to target `{ tabId: targetTabId, allFrames: true }`.
   - In the injected function, introduce a **Media Frame Guard**: immediately exit if the frame does not contain a `<video>`, `#movie_player`, or `.html5-video-player`.
   - Implement the 3-Tier Actuation Priority:
     - **Priority 1:** Click in-page floating HUD button (`#__sentinel_fs_floating_btn__`) if present.
     - **Priority 2:** Invoke `__SentinelFullscreenController.toggleWebFullscreen()` or `toggle(null, { forceWeb: true })`.
     - **Priority 3:** Fallback to native `<video>.requestFullscreen()` or dispatch `__SENTINEL_FULLSCREEN_ACTION__`.
   - Retain 350ms cooldown lock and single-execution fallback (`sendMediaControl('toggle_fullscreen', {}, targetTabId)`) in `.catch()` and `else` branches.
3. **`content_media.js` Frame Guard:**
   - In `case 'toggle_fullscreen':`, verify that the current frame contains active media (`primaryMediaElement`, `<video>`, `#movie_player`) before invoking the controller or dispatching events.
4. **Test Suites Synchronization:**
   - Update `tests/test_fullscreen_controller.js` and `tests/test_media_controls_and_fullscreen_fix.js` to assert `allFrames: true`, frame guard, Priority 1 floating button -> Priority 2 controller -> Priority 3 native, and verify that `getTargetElement()` returns `null` for empty DOMs.
   - Maintain 100% W3C Trusted Types compliance (0 `.innerHTML` assignments) and ensure 100% pass across all test suites.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Primary Files | Target Agent | Status | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | Core Controller Hardening | `fullscreen_controller.js` | Frontend Specialist (Level 4) | `READY` | Pending |
| **02** | Frame-Aware Popup & Content Script Guard | `popup/popup.js`, `content_media.js` | Frontend Specialist (Level 4) | `READY` | Pending |
| **03** | Test Suites Synchronization & QA Verification | `tests/test_fullscreen_controller.js`, `tests/test_media_controls_and_fullscreen_fix.js` | QA Test Specialist (Level 4) | `READY` | Pending |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `fullscreen_controller.js` | Line ~427 fallback returns `document.body` / `documentElement` when no video is present. | Remove `document.body` and `documentElement` fallbacks; return `null` if no player/video is found. | Non-video containers are never selected as fullscreen targets. | Phase 1 | `node tests/test_fullscreen_controller.js` |
| **2** | `fullscreen_controller.js` | Line ~436 `enterWebFullscreen()` lacks root node protection, allowing body/html to become `.sentinel-web-fullscreen`. | Add guard: if `!el || el === document.body || el === document.documentElement`, abort and return `false`. | Guarantees document body is never painted black. | Phase 1 | `node tests/test_fullscreen_controller.js` |
| **3** | `fullscreen_controller.js` | Line ~189 CSS styles only target `.sentinel-web-fullscreen video` as descendant, leaving direct `<video.sentinel-web-fullscreen>` understyled. | Add explicit CSS rule for `video.sentinel-web-fullscreen` with fixed positioning, 100vw/vh, object-fit contain. | Standalone HTML5 videos in frames scale cleanly without clipping. | Phase 1 | `node tests/test_fullscreen_controller.js` |
| **4** | `popup/popup.js` | Line ~3665 `executeScript` has `target: { tabId: targetTabId }` without `allFrames: true`, running only in top frame. | Add `allFrames: true` to target object (`target: { tabId: targetTabId, allFrames: true }`). | Injected script reaches iframe video players. | Phase 2 | `node tests/test_fullscreen_controller.js` |
| **5** | `popup/popup.js` | Line ~3668 `executeScript` `func` runs in every frame without checking for media elements, and does not prioritize floating HUD button. | Add frame guard: exit early if frame has no media. Execute Priority 1: floating HUD button click; Priority 2: controller toggle; Priority 3: native. | Only frames containing video execute toggle logic; floating HUD button receives physical click priority. | Phase 2 | `node tests/test_fullscreen_controller.js` |
| **6** | `content_media.js` | Line ~1878 & ~1970 `toggle_fullscreen` triggers controller toggle even in frames where `primaryMediaElement` is null. | Add guard in `case 'toggle_fullscreen':` checking for media elements before executing controller. | Frame messages do not trigger spurious toggles in non-media frames. | Phase 2 | `node tests/test_media_controls_and_fullscreen_fix.js` |
| **7** | `tests/test_fullscreen_controller.js` | Test 11 AST check requires controller before floating button, and lacks `allFrames: true` assertion. | Update Test 11 assertions for `allFrames: true`, frame guard, Priority 1 floating button -> Priority 2 controller -> Priority 3 native, and test `null` target handling. | Test suite accurately asserts hardened architecture and passes 100%. | Phase 3 | `node tests/test_fullscreen_controller.js` |
| **8** | `tests/test_media_controls_and_fullscreen_fix.js` | Test 4 & Test 3 line length and AST checks in popup.js must match new frame-aware structure. | Keep `#btnCtrlFullscreen` concise (<= 65 lines) and ensure all functional mock simulations pass. | Full end-to-end regression validation passes with 0 failures. | Phase 3 | `node tests/test_media_controls_and_fullscreen_fix.js` |

---

## 🛡️ 4. Non-Negotiable Constitutional Constraints
1. **Main Agent (CEO) & Level 2 Manager Zero-Code Hard Lock:** All implementation, file edits, and test runs must be delegated exclusively to dedicated Level 4 Subagents with valid `AUTH-MGR-*` tokens.
2. **Blast Radius Isolation:** Modify ONLY fullscreen-related code. Under no circumstances should `#btnGlobalMediaToggle`, playback speed ladders, audio tab telemetry, or tracking engine be altered.
3. **W3C Trusted Types Compliance:** 0 assignments to `innerHTML` or `outerHTML`. All DOM modifications must use `createElement`, `createElementNS`, `textContent`, `setAttribute`, or `classList`.
4. **Encoding Standard:** All generated and modified files must be UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
