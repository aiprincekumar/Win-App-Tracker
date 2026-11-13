# Phase 1 Execution Prompt: Deep Codebase & Runtime Audit of Popup Mode

> **Phase Name:** Phase 1 - Deep Codebase & Runtime Audit  
> **Target Subsystem:** Popup Presentation, State Hydration, IPC Messaging, Content Injection  
> **Workspace Container:** `temp_prompt/popup_audit_and_roadmap/`  
> **Assigned Agent Role:** Sub Agent (Full-Stack Engineer)  
> **Authorization Token:** Required (`AUTH-MGR-*`)  

---

## 🎯 1. Phase Objective
Perform an exhaustive, line-by-line code audit and verification of every user-facing control, button, input slider, toggle switch, dropdown menu, badge, and popover in **Popup Mode** (`popup/popup.html`, `popup/popup.js`, `popup/popup.css`). Produce an authoritative, verified empirical audit ledger categorizing every feature into:
1. **Fully Working (Production Grade):** Full UI, event listener, IPC messaging, and background/content execution verified.
2. **Partially Working / Deficient:** UI works or stores data, but runtime execution has significant defects, edge cases, or broken fallbacks.
3. **Non-Working / Pure UI Stub:** UI element exists, changes visually or persists to local storage, but zero functional implementation or background logic exists.

---

## 📋 2. Prerequisites & Inputs
- Repository: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- Core Files to Audit:
  - `popup/popup.html` (795 lines)
  - `popup/popup.js` (3,623 lines)
  - `popup/popup.css` (2,100+ lines)
  - `background.js` (108 KB)
  - `content_media.js` (54 KB)
  - `inject_main_world.js` (44 KB)

---

## 🔍 3. Technical Context & File Anchors

### Key Inspection Anchors:
- **Header Badges & Quick Settings:** `popup/popup.html#L20-L58`, `popup/popup.js#L2198-L2255`, `popup/popup.js#L2745-L2805`
- **Tab 1 Media Controls:** `popup/popup.html#L90-L212`, `popup/popup.js#L2000-L2120`, `popup/popup.js#L3100-L3370`
- **Tab 2 Audio Lab:** `popup/popup.html#L215-L295`, `popup/popup.js#L1813-L1817`, `popup/popup.js#L2287-L2368`
- **Tab 3 Tools & Automations:** `popup/popup.html#L298-L406`, `popup/popup.js#L2122-L2285`
- **Tab 4 Studio / Vault:** `popup/popup.html#L409-L468`, `popup/popup.js#L2370-L2420`
- **Tab 5 Tracking & Wellness:** `popup/popup.html#L471-L562`, `popup/popup.js#L2422-L2438`
- **Tab 6 Domains Breakdown:** `popup/popup.html#L564-L603`, `popup/popup.js#L2595-L2645`
- **Footer Actions & Sleep Timer:** `popup/popup.html#L606-L721`, `popup/popup.js#L2806-L3050`
- **Quick Settings Popover:** `popup/popup.html#L723-L779`, `popup/popup.js#L3710-L3725`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Verify UI Selector & Event Binding:**
   - Scan all element IDs in `popup/popup.html`.
   - Confirm whether `document.getElementById('<id>')` exists in `popup/popup.js`.
   - Verify whether an event listener (`addEventListener('click')`, `'change'`, `'input'`) is bound.

2. **Trace State Dispatch & IPC Chain:**
   - Check what happens inside the event listener:
     - Does it call `browserAPI.runtime.sendMessage`?
     - Does it call `browserAPI.scripting.executeScript`?
     - Does it only write to `browserAPI.storage.local.set`?
   - Trace the message payload to `background.js` or `content_media.js`. Does a matching `case '<MESSAGE_TYPE>':` exist?

3. **Verify Background / Content Execution:**
   - If an action relies on background handling (e.g., `TOGGLE_GLOBAL_MEDIA`, `LAUNCH_DATA_HUB`, `auto_pause_new_tab`), verify if `background.js` implements the actual Chrome API call.
   - If an action relies on DOM/Media manipulation (e.g., `audioMasterBoostSlider`, `toggleAudioOnlyMode`, `auto_ad_silencer`), verify if `content_media.js` or `inject_main_world.js` executes the logic.

4. **Document Empirical Audit Findings:**
   - Compile the findings into a structured verification matrix ready for Phase 2 synthesis.

---

## 🚫 5. Architectural Constraints & Boundaries
- **Strict Read-Only Inspection:** Do NOT modify application source code during Phase 1.
- **Evidence-Based Proof:** Never guess or assume; cite line numbers and handler presence.

---

## 📦 6. Deliverables Manifest
- Completed Audit Matrix with status for all 35+ interactive controls across the 6 tabs.

---

## 🧪 7. Local Verification Gate
Run test suite to verify baseline integrity:
```bash
node tests/test_syntax_and_manifest_integrity.js
node tests/test_six_tab_popup_architecture.js
```
Gate passes when all existing structural tests report 100% success.
