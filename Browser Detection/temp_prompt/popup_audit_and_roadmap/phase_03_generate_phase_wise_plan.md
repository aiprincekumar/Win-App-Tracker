# Phase 3 Execution Prompt: Generation of File 2 (popup_phase_wise_plan.md) & Memory Update

> **Phase Name:** Phase 3 - Generation of File 2 (`popup_phase_wise_plan.md`) & Memory Update  
> **Target Subsystem:** Technical Roadmap, Multi-Phase Architecture, Memory Synchronization  
> **Workspace Container:** `temp_prompt/popup_audit_and_roadmap/`  
> **Assigned Agent Role:** Sub Agent (Solution Architect / Technical Lead)  
> **Authorization Token:** Required (`AUTH-MGR-*`)  

---

## 🎯 1. Phase Objective
Generate **File 2 (`popup_phase_wise_plan.md`)** directly in the workspace root (`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup_phase_wise_plan.md`) and synchronize the active memory files (`project_feature_memory.md` and `C:\Users\Atul Verma\.gemini\memory.md`).
This file must be an authoritative, highly detailed engineering blueprint detailing how every non-working function identified in File 1 will be fixed in upcoming phases, including procedures, file modifications, Chrome MV3 API requirements, and test gates.

---

## 📋 2. Prerequisites & Inputs
- File 1 (`popup_non_working_functions.md`).
- Architectural specifications from `TRD.md` and `PRD.md`.
- Target output paths:
  - `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup_phase_wise_plan.md`
  - `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\project_feature_memory.md`
  - `C:\Users\Atul Verma\.gemini\memory.md` (Update live stage)

---

## 🔍 3. Required Structure for File 2 (`popup_phase_wise_plan.md`)

1. **Title & Document Header:**
   - `Web Activity & Media Sentinel - Popup Mode: Phase-Wise Implementation Roadmap & Technical Procedures`
   - Executive bilingual summary (Hindi explanation + English architectural summary).

2. **Master Phased Implementation Roadmap Matrix:**
   A high-density table organizing the remediation work into 5 dedicated engineering phases:

   | Phase # | Phase Title | Target Broken Features | Core Files Involved | Estimated Effort |
   | :--- | :--- | :--- | :--- | :--- |
   | **Phase 1** | Quick Settings & UI Polish | Default Tab Switch, Dynamic Interval, High Contrast CSS, Audio Chime | `popup/popup.js`, `popup/popup.css` | Low (1-2 hours) |
   | **Phase 2** | Smart Automations Engine | Auto-Pause New Tab, Auto Ad Silencer, Domain Speed Memory | `background.js`, `content_media.js` | Medium (3-4 hours) |
   | **Phase 3** | Digital Wellness & Alarms | Doomscroll Breaker Alarm, Interval Tracker, Browser Notification | `background.js`, `popup/popup.js` | Medium (2-3 hours) |
   | **Phase 4** | Studio Vault & Tab Targeting | Accurate Screenshot Targeting, Closed Tab Media Session Revival | `popup/popup.js`, `background.js` | Medium (3 hours) |
   | **Phase 5** | Audio Lab & Web Audio Pipeline | 200% Master Boost, 5-Band EQ, Audio-Only Blanking, Vocal Clarity, Night Shield | `offscreen/`, `background.js`, `content_media.js` | High (6-8 hours) |

3. **Detailed Phase-by-Phase Technical Blueprint:**
   For EACH of the 5 phases, provide:
   - **Phase Objective & Scope:** Clear definition of what will be achieved.
   - **Step-by-Step Implementation Procedure:** Concrete instructions explaining what functions to create, how to hook into Chrome APIs, and how data flows.
   - **File Modifications Required:** Exact paths and surgical changes:
     - `popup/popup.js`
     - `popup/popup.css`
     - `background.js`
     - `content_media.js`
     - `inject_main_world.js`
     - `manifest.json` (if new permissions like `offscreen` or `notifications` are needed).
   - **Chrome MV3 APIs & Technical Contracts:**
     - `chrome.alarms` for doomscroll interval tracking.
     - `chrome.notifications` for break nudges.
     - `chrome.offscreen` & `chrome.tabCapture` for Web Audio API integration.
     - `MutationObserver` in `content_media.js` for ad silencing.
   - **Verification Test Gates & Acceptance Criteria:** Exact commands and automated tests to run (`node tests/test_*.js`).

4. **Live Memory Update & Synchronized Diagnostic Matrix:**
   - Update `project_feature_memory.md` in the workspace root with the 7-column diagnostic table.
   - Update `C:\Users\Atul Verma\.gemini\memory.md` to reflect that Popup Mode Feature Audit & Phased Roadmap has been formalized.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. Create `popup_phase_wise_plan.md` with UTF-8 BOM (`\uFEFF`) in workspace root.
2. Structure the document with detailed diagrams (Mermaid flowcharts), architectural callouts, and clean markdown tables.
3. Ensure the Hindi introduction clarifies the procedure:
   *"यह फ़ाइल एक तकनीकी रोडमैप (Technical Roadmap) है जो यह समझाती है कि कैसे आगामी फेज़ में काम न करने वाले सभी फ़ंक्शन्स को स्टेप-बाय-स्टेप ठीक और कार्यान्वित (Implement) किया जाएगा..."*
4. Create/update `project_feature_memory.md` with the 7-column diagnostic matrix.
5. Update `C:\Users\Atul Verma\.gemini\memory.md` stage tracker.

---

## 📦 5. Deliverables Manifest
- `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup_phase_wise_plan.md`
- `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\project_feature_memory.md`
- Synchronized `C:\Users\Atul Verma\.gemini\memory.md`

---

## 🧪 6. Local Verification Gate
- Both `popup_non_working_functions.md` and `popup_phase_wise_plan.md` exist and are valid markdown.
- `node tests/test_syntax_and_manifest_integrity.js` passes clean.
- All file links use proper `file:///` format.
