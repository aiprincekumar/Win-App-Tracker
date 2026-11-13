# Popup Mode Feature Audit & Phased Roadmap: Live Tracking Board

> **Document Type:** Live Ephemeral Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/popup_audit_and_roadmap/`  
> **Target System:** Web Activity & Media Sentinel (MV3 Extension)  
> **Primary Authority:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Created At:** 2026-11-14T01:45:00+05:30  
> **Execution Gate State:** `COMPLETED`  
> **Recommended Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Summary

### The Problem
The user requested a comprehensive check and audit of **Popup Mode** in Web Activity & Media Sentinel to identify which functions are actively working and which functions are broken, stubbed, or non-functional. The user mandated two concrete deliverables:
1. **File 1 (`popup_non_working_functions.md`):** A simple, clear inventory listing all non-working/broken/stubbed features.
2. **File 2 (`popup_phase_wise_plan.md`):** A detailed phase-wise roadmap, procedures, technical architecture, and test gates explaining how each non-working function will be implemented/fixed in subsequent phases, along with updating memory files.

### The Solution
A structured 4-phase execution plan:
- **Phase 1:** Comprehensive Codebase & Runtime Audit of all Popup Mode subsystems (Media, Audio Lab, Tools/Automations, Studio/Vault, Tracking, Domains, Header/Footer, Quick Settings, Sleep Timer, Theme, IPC).
- **Phase 2:** Authoring and generation of File 1 (`popup_non_working_functions.md`) in workspace root.
- **Phase 3:** Authoring and generation of File 2 (`popup_phase_wise_plan.md`) in workspace root and synchronization with active memory.
- **Phase 4:** Independent QA Verification & Review Suite execution to ensure zero syntax degradation, 100% test passage, and complete user alignment.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Target Deliverable | Assigned Agent Role | Status | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Deep Codebase & Runtime Audit | Empirical matrix of working vs non-working features | Sub Agent (Full-Stack Engineer) | `COMPLETED` | `PASSED` |
| **Phase 2** | Generation of File 1 | `popup_non_working_functions.md` in workspace root | Sub Agent (Technical Documentation Writer) | `COMPLETED` | `PASSED` |
| **Phase 3** | Generation of File 2 & Memory Sync | `popup_phase_wise_plan.md` & Memory synchronization | Sub Agent (Solution Architect / Tech Lead) | `COMPLETED` | `PASSED` |
| **Phase 4** | Independent QA Verification & Review | 100% test suite passage, lint & BOM validation | Sub Agent (QA Verification Engineer) | `COMPLETED` | `PASSED` |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `popup/popup.js` | Audio Lab (Boost 0-200%, EQ, Vocal Clarity, Night Shield, Audio-Only) only updates storage; zero Web Audio API GainNode or Tab Capture implemented. | Catalog in File 1; design phased Web Audio / chrome.tabCapture architecture in File 2. | Clear documentation and phased plan without breaking current UI state. | Phase 2 & 3 | `node tests/test_six_tab_popup_architecture.js` |
| **2** | `popup/popup.js` & `background.js` | Smart Automations (`auto_pause_new_tab`, `auto_ad_silencer`, `domain_speed_memory`) have UI listeners but zero background service worker event handlers. | Catalog in File 1; specify tab activation hooks and ad DOM mutation observers in File 2. | Prepares background.js & content_media.js integration specs. | Phase 2 & 3 | `node tests/test_syntax_and_manifest_integrity.js` |
| **3** | `popup/popup.js` & `background.js` | Doomscroll Breaker saves toggle/interval to storage, but background alarms never trigger user nudges. | Catalog in File 1; specify chrome.alarms & chrome.notifications architecture in File 2. | Outlines digital wellness enforcement mechanics. | Phase 2 & 3 | `node tests/test_sleep_timer_and_ui_controls.js` |
| **4** | `popup/popup.js` & `popup.css` | Quick Settings `selectDefaultTab` never calls `switchTopTab()`; `selectSyncInterval` doesn't change `setInterval`; `toggleHighContrast` lacks CSS; `notification_sound` lacks audio chime. | Catalog all 4 broken settings in File 1; detail surgical fixes in File 2. | Guarantees complete user visibility into Quick Settings gaps. | Phase 2 & 3 | `node tests/test_syntax_and_manifest_integrity.js` |
| **5** | `popup/popup.js` | `btnCardScreenshot` uses `captureVisibleTab(null)` capturing popup window instead of background media tab; `btnStudioResumePlayback` fails if video tab was closed. | Catalog in File 1; specify tab targeting and URL tab reactivation in File 2. | Establishes robust media capture and resume specifications. | Phase 2 & 3 | `node tests/test_volume_timeline_fullscreen_controls.js` |
| **6** | `tests/test_theme_toggle.js` | Mock context in unit test throws `ReferenceError: mockContext is not defined` inside VM during `showPopupToast` call. | Note in audit; recommend test mock fix in Phase 4 QA verification. | Restores test suite to 17/17 (100%) test passage. | Phase 4 | `node tests/test_theme_toggle.js` |

---

## 🔒 4. Execution Governance & Anti-Skip Compliance
- **Anti-Skip Pillar A (Grill-Me Gate):** User intent is explicit and fully unambiguous; autonomous execution recommended.
- **Anti-Skip Pillar B (Skill Manager Audit Gate):** Verified against `documentation-lookup`, `frontend-patterns`, and `e2e-testing`.
- **Anti-Skip Pillar C (Phased Architecture Gate):** Ephemeral specifications housed strictly in `temp_prompt/popup_audit_and_roadmap/`.
- **Anti-Skip Pillar D (Independent QA Verification Gate):** Mandatory QA signoff before declaring task complete.
