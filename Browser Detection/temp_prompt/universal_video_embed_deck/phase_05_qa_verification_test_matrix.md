# Phase 5: Independent QA Verification Test Suite & Full Regression Pass

> **Phase:** 05 of 05  
> **Target Subsystem:** `tests/test_universal_video_embed_deck.js`, `run_all_tests.js`  
> **Associated Feature:** Universal Embedded Video Player Deck  
> **Lead Department:** Dept 08 Quality Assurance & Testing & Dept 12 DevOps/Release  
> **Prerequisites:** Phases 1 through 4 completely implemented  
> **Gate Verification:** 6-battery test suite PASS + full workspace test suite (55/55 PASS) + UTF-8 BOM check + 0 gitleaks  

---

## 🎯 1. Phase Objective

The objective of Phase 5 is to deliver exhaustive, automated end-to-end verification of the Universal Embedded Video Player Deck. An independent Level 4 QA Verification Subagent must run a comprehensive 6-battery test suite covering URL parsing, DOM contracts, provider adapters, Trusted Types security, state machine transitions, and full workspace regression testing across all 55 project test suites.

---

## 📂 2. File Anchors & Prerequisites

- **Dedicated Test Suite to Author:**
  - [`tests/test_universal_video_embed_deck.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_universal_video_embed_deck.js)
- **Global Test Harness:**
  - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)
- **Existing Test Suites Reference:**
  - `tests/test_*.js` (54 existing test files)

---

## 🧪 3. The 6-Battery QA Test Matrix

The test suite `tests/test_universal_video_embed_deck.js` must implement the following 6 test batteries:

### Battery 1: Provider Registry & Universal URL Parsing Engine
- Test 1.1: Standard YouTube URLs (`watch?v=...`) resolve correctly.
- Test 1.2: YouTube Shorts (`/shorts/...`) resolve correctly.
- Test 1.3: Shortened YouTube URLs (`youtu.be/...`) resolve correctly.
- Test 1.4: Embedded YouTube URLs (`/embed/...`) resolve correctly.
- Test 1.5: YouTube URLs with timestamp (`?t=120`) preserve start time in embed URL.
- Test 1.6: Vimeo numeric video URLs (`vimeo.com/12345678`) resolve correctly.
- Test 1.7: Vimeo staff picks and channel URLs resolve correctly.
- Test 1.8: Twitch live channel URLs (`twitch.tv/shroud`) resolve with correct parent host.
- Test 1.9: Twitch clip URLs (`clips.twitch.tv/...`) resolve with clip embed URL.
- Test 1.10: Direct media URLs (`.mp4`, `.webm`, `.m3u8`) resolve to direct adapter.
- Test 1.11: Invalid, malicious, or non-video URLs return `valid: false` without throwing.

### Battery 2: DOM Architecture, Canonical IDs & A11y Attributes
- Test 2.1: `#heroAudioLabStatus` contains `#deckModeSwitcherGroup`.
- Test 2.2: Mode switcher buttons `#btnModeVisualizer` and `#btnModeEmbeddedDeck` have valid ARIA roles and attributes.
- Test 2.3: `#embeddedVideoDeckContainer` exists as sibling to `#visualizerPanel`.
- Test 2.4: Empty state input bar (`#inputDeckVideoUrl`, `#btnDeckPasteUrl`, `#btnDeckLoadVideo`) exists.
- Test 2.5: Canonical visualizer IDs (`#canvasAudioVisualizer`, `#selectVizEffect`, `#vuBarLeft`, `#vuBarRight`) are 100% preserved.

### Battery 3: Provider Adapters & PostMessage Command Dispatch
- Test 3.1: `YouTubeAdapter` constructs embed URL with `enablejsapi=1`, `rel=0`, and `origin`.
- Test 3.2: `YouTubeAdapter.sendCommand` formats valid JSON command with `playVideo`, `pauseVideo`, etc.
- Test 3.3: `VimeoAdapter` constructs embed URL with `api=1`.
- Test 3.4: `VimeoAdapter.sendCommand` formats valid `{ method: 'play' }` JSON.
- Test 3.5: `TwitchAdapter` embeds parent parameter correctly matching window host.
- Test 3.6: `DirectMediaAdapter` creates `<video>` element with controls and playsinline attributes.

### Battery 4: W3C Trusted Types & Iframe Sandboxing Security
- Test 4.1: `SentinelSecurityPolicy` creates safe script URL for whitelisted origins.
- Test 4.2: `SentinelSecurityPolicy` throws `TypeError` for non-whitelisted origins.
- Test 4.3: Safe iframe creation includes strict `sandbox` attribute.
- Test 4.4: Sandbox attribute strictly omits `allow-top-navigation`.
- Test 4.5: `allow` attribute includes `autoplay; encrypted-media; picture-in-picture`.
- Test 4.6: `referrerpolicy` is set to `strict-origin-when-cross-origin`.

### Battery 5: Finite State Machine & CPU-Aware Loop Suspension
- Test 5.1: Initial state is `IDLE`.
- Test 5.2: Transition from `IDLE` -> `MOUNTING` -> `READY` on valid URL load.
- Test 5.3: Toggling to Embedded Deck calls `MediaDeckVisualizerFeature.stopVisualizerLoop()`.
- Test 5.4: Toggling back to Visualizer calls `MediaDeckVisualizerFeature.startVisualizerLoop()`.
- Test 5.5: Destroying player unloads iframe and resets to `IDLE`.

### Battery 6: Full Workspace Regression Pass & Forensic Sanity
- Test 6.1: Execute `node run_all_tests.js` ensuring 55/55 test suites pass with 0 failures.
- Test 6.2: Verify UTF-8 BOM headers (`0xEF, 0xBB, 0xBF`) on all created/modified files.
- Test 6.3: Run `gitleaks detect --redact` confirming 0 secret leaks.

---

## 🚫 4. Architectural Boundaries & Constraints

- **Zero Mocking of Final Regression:** Test Battery 6 must invoke the real `run_all_tests.js` script to ensure full end-to-end workspace health.
- **Strict Exit Code Requirement:** If any assertion fails in any battery, the test runner must immediately exit with non-zero code (`process.exit(1)`).

---

## 📦 5. Deliverables Manifest

1. `tests/test_universal_video_embed_deck.js` (Exhaustive 6-battery test suite).
2. Updated `run_all_tests.js` registering the new test suite.
3. Raw terminal execution proof demonstrating 55/55 test suites PASS with exit code 0.

---

## 🚦 6. Local Verification Gate

Execute the following commands to certify completion of Phase 5:
```bash
# 1. Run the dedicated 6-battery test suite
node tests/test_universal_video_embed_deck.js

# 2. Run the full workspace test suite
node run_all_tests.js
```
*Gate Success Condition: 100% of all 55 test suites pass cleanly with exit code 0.*
