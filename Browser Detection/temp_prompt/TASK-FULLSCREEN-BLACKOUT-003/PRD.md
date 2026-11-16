<!-- UTF-8 with BOM -->
# TASK-FULLSCREEN-BLACKOUT-003: Product Requirements Document (PRD)

> **Document Class:** Product Requirements Document (PRD)  
> **Task Identifier:** `TASK-FULLSCREEN-BLACKOUT-003`  
> **Author:** Level 3C Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Audience:** Engineering Leads, QA Specialists, Autonomous Sub-Agents  
> **Parent Directive:** [`dynamic_departments_matrix.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/dynamic_departments_matrix.md)

---

## 🎯 1. Problem Statement & User Persona

### 1.1 Target User Persona
- **Developer / Web Consumer:** Users viewing videos embedded within `<iframe>` elements (e.g. W3Schools Tryit Editor, documentation demos, CMS previews, embedded YouTube/Vimeo players) while controlling playback from the extension popup.

### 1.2 User Pain Point
- When clicking the **Fullscreen** button (`#btnCtrlFullscreen`) in the popup while watching a video inside an iframe, the entire browser tab goes pitch black. The user cannot see the video, controls, or page contents, and must press ESC or reload the page to restore visibility.

---

## 🚀 2. INVEST-Compliant User Stories

### Story 1 (US-FS-01): Resilient Embedded Video Fullscreen
- **As a** user watching a video inside an embedded iframe,  
- **I want** clicking Fullscreen in the extension popup to expand the embedded video to full viewport,  
- **So that** I can view the video in fullscreen without the top-level parent page turning black.

### Story 2 (US-FS-02): Safe Top-Level Fallback Rejection
- **As a** user on a web page with multiple frames where the parent frame contains no video,  
- **I want** the extension to automatically ignore non-media frames during fullscreen actuation,  
- **So that** `document.body` or `<html>` are never targeted with fullscreen blackout styles.

### Story 3 (US-FS-03): Direct In-Page HUD Actuation
- **As a** user with the in-page Sentinel Fullscreen floating button active on the video,  
- **I want** the popup Fullscreen button to trigger the floating button directly in that frame,  
- **So that** real physical click handling and aspect ratio optimizations are utilized.

---

## 📋 3. Functional Requirements (MoSCoW Prioritization)

### Must Have (M)
- **FR-01 (Zero-Blackout Root Guard):** `fullscreen_controller.js` must NEVER select `document.body` or `document.documentElement` as a fullscreen target element. If no video container or element exists, `getTargetElement()` must return `null`.
- **FR-02 (Web Fullscreen Execution Guard):** `enterWebFullscreen(targetEl)` must abort immediately and return `false` if `targetEl` is `null`, `document.body`, or `document.documentElement`.
- **FR-03 (Multi-Frame Popup Scripting):** `popup/popup.js` `#btnCtrlFullscreen` click handler must invoke `browserAPI.scripting.executeScript` with `allFrames: true` (`target: { tabId: targetTabId, allFrames: true }`).
- **FR-04 (Frame-Level Media Presence Guard):** The function injected across all frames must check for the presence of media elements (`document.querySelector('video')`, `document.getElementById('movie_player')`, `document.querySelector('.html5-video-player')`). If no media exists in the frame, it must return immediately with 0 mutations.
- **FR-05 (3-Tier Actuation Priority):** In the media frame, execution must adhere to:
  1. *Priority 1:* Click `document.getElementById('__sentinel_fs_floating_btn__')`.
  2. *Priority 2:* Invoke `ctrl.toggleWebFullscreen()` or `ctrl.toggle(null, { forceWeb: true })`.
  3. *Priority 3:* Trigger native `<video>.requestFullscreen()` or dispatch custom event bridge.
- **FR-06 (Content Script Guard):** In `content_media.js`, `case 'toggle_fullscreen':` must verify the existence of media in the current frame before calling the controller.

### Should Have (S)
- **FR-07 (Standalone Video CSS Rule):** CSS in `fullscreen_controller.js` must include explicit styles for `video.sentinel-web-fullscreen` with `object-fit: contain !important; z-index: 2147483647 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: #000000 !important;`.
- **FR-08 (Single-Execution Cooldown & Fallback):** Retain 350ms cooldown check (`lastFullscreenClick`) and fallback IPC (`sendMediaControl('toggle_fullscreen', {}, targetTabId)`) in `.catch()` and `else` branches.

### Won't Have (This Iteration) (W)
- Multi-monitor custom fullscreen positioning.
- Modifying any playback speed ladder or audio tab telemetry.

---

## 🔬 4. Non-Functional Requirements (NFRs)

- **NFR-01 (W3C Trusted Types Compliance):** 0 assignments to `innerHTML` or `outerHTML`. All DOM manipulation must use safe W3C APIs.
- **NFR-02 (Zero Performance Overhead):** Media check in each frame must execute in `< 1ms` (single `querySelector` check).
- **NFR-03 (Codebase Integrity):** Total line count of `#btnCtrlFullscreen` in `popup/popup.js` must remain compact (<= 65 lines).
- **NFR-04 (Test Suite Green Gate):** `node tests/test_fullscreen_controller.js` and `node tests/test_media_controls_and_fullscreen_fix.js` must pass 100% with exit code 0.

---

## 🚦 5. Given-When-Then Acceptance Criteria

### Acceptance Criteria 1: Multi-Frame Page with Embedded Video (W3Schools)
- **Given** a web page with a top-level parent document and an iframe containing a `<video>` element,
- **When** the user clicks `#btnCtrlFullscreen` in the popup,
- **Then** the top-level frame exits early without modifying `document.body` classes,
- **And** the iframe containing the `<video>` element enters fullscreen cleanly, filling its viewport without any blackout of the parent document.

### Acceptance Criteria 2: Page with No Video Elements
- **Given** a web page containing no `<video>` or player containers,
- **When** the user triggers fullscreen via popup or content script,
- **Then** `getTargetElement()` returns `null`,
- **And** `enterWebFullscreen()` returns `false`,
- **And** no elements receive `.sentinel-web-fullscreen` or `.sentinel-fullscreen-active`.

### Acceptance Criteria 3: Priority 1 Floating Button Actuation
- **Given** a frame where `__sentinel_fs_floating_btn__` exists on the video player,
- **When** `executeScript` executes in that frame,
- **Then** `floatingBtn.click()` is invoked before any fallback controller toggles.
