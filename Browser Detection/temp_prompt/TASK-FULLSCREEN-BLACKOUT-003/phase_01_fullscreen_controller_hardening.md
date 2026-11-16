<!-- UTF-8 with BOM -->
# Phase 1: Core Controller Hardening (`fullscreen_controller.js`)

> **Phase Identifier:** `PHASE-01-CONTROLLER-HARDENING`  
> **Target Sub-Agent Role:** Frontend Specialist (Level 4 Execution Sub-Agent)  
> **Target Department:** Department 05 (Frontend Engineering)  
> **Parent Dossier:** [`temp_prompt/TASK-FULLSCREEN-BLACKOUT-003/INDEX.md`](INDEX.md)  
> **Mandatory Rule Directive:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.

---

## 🎯 1. Phase Objective
Harden `fullscreen_controller.js` by eliminating `document.body` and `document.documentElement` from `getTargetElement()`, adding root element guard checks in `enterWebFullscreen()`, and augmenting CSS rules for `video.sentinel-web-fullscreen`.

---

## 📦 2. Prerequisites & Inputs
- File: `fullscreen_controller.js`
- Working Directory: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- Active Authorization Token issued by Level 2 Manager (`AUTH-MGR-*`).

---

## 📍 3. Technical Context & File Anchors
- **File:** [`fullscreen_controller.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/fullscreen_controller.js)
  - **Anchor 1 (CSS Rules):** Lines ~158-202 (CSS styling for `.sentinel-web-fullscreen` and `.sentinel-web-fullscreen video`).
  - **Anchor 2 (`getTargetElement`):** Lines ~390-428 (`function getTargetElement(preferredTarget)`).
  - **Anchor 3 (`enterWebFullscreen`):** Lines ~433-475 (`function enterWebFullscreen(targetEl)`).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Augment CSS Rules for Direct Video Styling
In `fullscreen_controller.js` inside `ensureStyles()`:
Locate `.sentinel-web-fullscreen` styling block (around lines 158-175). Add a dedicated selector for `video.sentinel-web-fullscreen`:
```css
        /* Direct HTML5 <video> styled with sentinel-web-fullscreen */
        video.sentinel-web-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          object-fit: contain !important;
          margin: auto !important;
          z-index: 2147483647 !important;
          background: #000000 !important;
          box-sizing: border-box !important;
        }
```

### Step 2: Remove `document.body` / `documentElement` Fallbacks in `getTargetElement`
In `fullscreen_controller.js` inside `function getTargetElement(preferredTarget)` (around line 390):
- Ensure that if `preferredTarget` is provided and is a `video` element, its parent is checked (as long as `parentElement !== document.body && parentElement !== document.documentElement`).
- If generic video discovery (`document.querySelector('video')`) finds a video, return container, or `video.parentElement` (if not body/documentElement), or the `video` itself.
- **CRITICAL CHANGE at line ~427:**
  Replace:
  ```javascript
  return document.body || document.documentElement || null;
  ```
  With:
  ```javascript
  return null;
  ```
  *Explanation:* If no player container or video element exists in the DOM, `getTargetElement` must return `null`. It must NEVER return `document.body` or `document.documentElement`.

### Step 3: Add Guard in `enterWebFullscreen(targetEl)`
In `fullscreen_controller.js` inside `function enterWebFullscreen(targetEl)` (around line 433):
Replace:
```javascript
  function enterWebFullscreen(targetEl) {
    if (typeof document === 'undefined') return false;
    ensureStyles();
    const el = getTargetElement(targetEl);
    if (!el) return false;
```
With:
```javascript
  function enterWebFullscreen(targetEl) {
    if (typeof document === 'undefined') return false;
    ensureStyles();
    const el = getTargetElement(targetEl);
    if (!el || el === document.body || el === document.documentElement) {
      return false;
    }
```
*Explanation:* Even if a caller attempts to force `document.body` or `documentElement`, `enterWebFullscreen` must immediately reject it and return `false`, completely eliminating the blackout bug.

---

## 🚫 5. Architectural Constraints & Boundaries
1. **0 innerHTML assignments:** All DOM manipulations must strictly use existing W3C compliant APIs.
2. **Do NOT touch debouncing or lock attributes:** Retain `data-sentinel-fs-ts` and `acquireLock()`.
3. **Do NOT touch floating button creation:** Retain `createFloatingButton()` and HUD attachment.
4. **Encoding:** Save as UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📜 6. Deliverables Manifest
- Modified: `fullscreen_controller.js`

---

## 🧪 7. Local Verification Gate
Execute the following verification command in terminal:
```powershell
node -c "fullscreen_controller.js"
```
Ensure syntax compiles cleanly with exit code 0.
