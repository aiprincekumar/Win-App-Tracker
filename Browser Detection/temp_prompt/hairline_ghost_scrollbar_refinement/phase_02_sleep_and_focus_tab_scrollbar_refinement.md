# Phase 2: Sleep & Focus Tabs Hairline Ghost Scrollbars

> **Document Type:** Phase Execution Prompt  
> **Workspace Container:** `temp_prompt/hairline_ghost_scrollbar_refinement/`  
> **Phase Number:** 02 of 03  
> **Assigned Subagent Role:** Level 4 Frontend Engineer  
> **Target Files:** `popup/styles/tabs/tab_sleep.css`, `popup/styles/tabs/tab_wellness.css`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Phase Objective
Refine and streamline scrollbars in the Sleep Tab (`#viewSleepPane`, `#sleepSettingsDrawer .drawer-inner-content`) and Focus Tab (`#viewFocusPane`, `#focusSettingsDrawer .drawer-inner-content`) into 2px hairline subtle ghost scrollbars matching the cyber-dark theme, with synchronized hover luminescence and light theme overrides.

---

## 📋 2. Prerequisites & File Anchors
- **Prerequisites:** Phase 1 completed (`popup/popup.css` updated).
- **File Anchors in `popup/styles/tabs/tab_sleep.css`:**
  - Lines ~17-18: `#viewSleepPane` `scrollbar-color`.
  - Lines ~471-472: `#sleepSettingsDrawer .drawer-inner-content` `scrollbar-color`.
  - Lines ~475-496: WebKit scrollbar rules for `#viewSleepPane` and `#sleepSettingsDrawer .drawer-inner-content`.
  - Lines ~498-512: Light theme overrides `[data-theme="light"]`.
- **File Anchors in `popup/styles/tabs/tab_wellness.css`:**
  - Lines ~772-773: `#viewFocusPane` `scrollbar-color`.
  - Lines ~816-817: `#focusSettingsDrawer .drawer-inner-content` `scrollbar-color`.
  - Lines ~830-851: WebKit scrollbar rules for `#viewFocusPane` and `#focusSettingsDrawer .drawer-inner-content`.
  - Lines ~853-867: Light theme overrides `[data-theme="light"]`.

---

## 🛠️ 3. Surgical Implementation Instructions

### 3.1 Sleep Tab (`popup/styles/tabs/tab_sleep.css`)
1. **W3C Scrollbar-Color:**
   - Update `scrollbar-color` in `#viewSleepPane` (line ~18) and drawer content (line ~472) to:
     ```css
     scrollbar-color: rgba(129, 140, 248, 0.28) transparent;
     ```
2. **WebKit Pseudo-Elements (lines ~475-496):**
   - Update `width: 4px; height: 4px;` to:
     ```css
     width: 2px;
     height: 2px;
     ```
   - Update thumb background from `rgba(129, 140, 248, 0.45)` to:
     ```css
     background: rgba(129, 140, 248, 0.28);
     ```
   - Update thumb:hover background from `rgba(129, 140, 248, 0.75)` to:
     ```css
     background: rgba(129, 140, 248, 0.65);
     ```
3. **Light Mode Overrides (lines ~498-512):**
   - Update `scrollbar-color` to `rgba(99, 102, 241, 0.25) transparent;`.
   - Update thumb background to `rgba(99, 102, 241, 0.25);`.
   - Update thumb:hover background to `rgba(99, 102, 241, 0.55);`.

### 3.2 Focus Tab (`popup/styles/tabs/tab_wellness.css`)
1. **W3C Scrollbar-Color:**
   - Update `scrollbar-color` in `#viewFocusPane` (line ~773) and drawer content (line ~817) to:
     ```css
     scrollbar-color: rgba(6, 182, 212, 0.28) transparent;
     ```
2. **WebKit Pseudo-Elements (lines ~830-851):**
   - Update `width: 4px; height: 4px;` to:
     ```css
     width: 2px;
     height: 2px;
     ```
   - Update thumb background from `rgba(6, 182, 212, 0.45)` to:
     ```css
     background: rgba(6, 182, 212, 0.28);
     ```
   - Update thumb:hover background from `rgba(6, 182, 212, 0.75)` to:
     ```css
     background: rgba(6, 182, 212, 0.65);
     ```
3. **Light Mode Overrides (lines ~853-867):**
   - Update `scrollbar-color` to `rgba(15, 118, 110, 0.22) transparent;`.
   - Update thumb background to `rgba(15, 118, 110, 0.22);`.
   - Update thumb:hover background to `rgba(15, 118, 110, 0.45);`.

### 3.3 Character Encoding
- Ensure both files maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 4. Architectural Constraints & Boundaries
- Do NOT alter hero card layout, dial SVG sizing, or flex containers.
- Do NOT alter drawer bounding height (`max-height: 220px;`) or zero-scroll flex rules.

---

## 📦 5. Deliverables Manifest
- Updated `popup/styles/tabs/tab_sleep.css`.
- Updated `popup/styles/tabs/tab_wellness.css`.

---

## 🔍 6. Local Verification Gate
Run node one-liner:
```bash
node -e "const fs = require('fs'); const s = fs.readFileSync('popup/styles/tabs/tab_sleep.css', 'utf8'); const w = fs.readFileSync('popup/styles/tabs/tab_wellness.css', 'utf8'); const assert = require('assert'); assert.ok(s.includes('width: 2px;') && s.includes('rgba(129, 140, 248, 0.28)')); assert.ok(w.includes('width: 2px;') && w.includes('rgba(6, 182, 212, 0.28)')); console.log('Phase 2 tabs scrollbars verified clean!');"
```
