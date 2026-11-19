# Phase 1: Universal Base & Popup Scrollbar Streamlining

> **Document Type:** Phase Execution Prompt  
> **Workspace Container:** `temp_prompt/hairline_ghost_scrollbar_refinement/`  
> **Phase Number:** 01 of 03  
> **Assigned Subagent Role:** Level 4 Frontend Engineer  
> **Target Files:** `popup/popup.css`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Phase Objective
Refactor and streamline all universal scrollbar styling in `popup/popup.css` into an ultra-thin (2px hairline), subtle ghost-style scrollbar for both dark and light modes across `body`, `.tab-pane`, `.drawer-inner-content`, `.drawer-expandable-wrap`, `.domains-list`, and `.studio-items-list`.

---

## 📋 2. Prerequisites & File Anchors
- **Primary File:** `popup/popup.css`
- **File Anchors in `popup/popup.css`:**
  - Lines ~112-150: Global cyber-dark custom scrollbars (`body, .tab-pane, .drawer-inner-content, .drawer-expandable-wrap`).
  - Lines ~1809-1820: `.domains-list` custom scrollbars.
  - Lines ~2033-2040: `.studio-items-list` custom scrollbars.
  - Lines ~4034-4080: Light theme custom scrollbars (`[data-theme="light"]`).

---

## 🛠️ 3. Surgical Implementation Instructions

1. **Global Cyber-Dark Scrollbars (lines ~112-150):**
   - Update `scrollbar-color` to:
     ```css
     scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
     ```
   - Change `width: 4px; height: 4px;` to:
     ```css
     width: 2px;
     height: 2px;
     ```
   - Change `::-webkit-scrollbar-thumb` background from `rgba(255, 255, 255, 0.18)` to `rgba(255, 255, 255, 0.12)`.
   - Change `::-webkit-scrollbar-thumb:hover` background from `rgba(255, 255, 255, 0.3)` to `rgba(255, 255, 255, 0.28)`.
   - Maintain `border-radius: 999px;` and `background: transparent;` on track.

2. **Specific List Containers (lines ~1809 & ~2033):**
   - In `.domains-list::-webkit-scrollbar`, update `width: 4px;` to `width: 2px;`.
   - In `.domains-list::-webkit-scrollbar-track`, set background to `transparent;` (or subtle ghost).
   - In `.studio-items-list::-webkit-scrollbar`, update `width: 4px;` to `width: 2px;`.

3. **Light Mode Theme Overrides (lines ~4034-4080):**
   - Update `scrollbar-color` in `[data-theme="light"]` from `rgba(0, 0, 0, 0.2) transparent;` to:
     ```css
     scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
     ```
   - Update `[data-theme="light"] body::-webkit-scrollbar, ...` width/height from `4px` to:
     ```css
     width: 2px;
     height: 2px;
     ```
   - Update `[data-theme="light"] ...::-webkit-scrollbar-thumb` background from `rgba(0, 0, 0, 0.2)` to `rgba(0, 0, 0, 0.12)`.
   - Update `[data-theme="light"] ...::-webkit-scrollbar-thumb:hover` background from `rgba(0, 0, 0, 0.35)` to `rgba(0, 0, 0, 0.25)`.

4. **Character Encoding:**
   - Preserve 100% UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 4. Architectural Constraints & Boundaries
- Do NOT touch HTML structures in `popup/popup.html`.
- Do NOT touch JavaScript files in `popup/popup.js`.
- Do NOT alter flex layouts, paddings, or container bounding heights.

---

## 📦 5. Deliverables Manifest
- Updated `popup/popup.css` with 2px hairline ghost scrollbars.

---

## 🔍 6. Local Verification Gate
Run node one-liner to verify:
```bash
node -e "const fs = require('fs'); const c = fs.readFileSync('popup/popup.css', 'utf8'); const assert = require('assert'); assert.ok(c.includes('width: 2px;') && c.includes('height: 2px;')); assert.ok(c.includes('rgba(255, 255, 255, 0.12)')); console.log('Phase 1 popup.css verified clean!');"
```
