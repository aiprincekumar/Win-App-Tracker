# Phase 4: Independent QA Verification & Review Suite Specification
# फेज़ 4: स्वतंत्र क्यूए सत्यापन एवं समीक्षा निर्देशिका

> **दस्तावेज़ प्रकार (Document Type):** Phase 4 Actionable Execution Prompt  
> **कार्यक्षेत्र कंटेनर (Workspace Container):** `temp_prompt/dashboard_mode_audit/`  
> **असाइन की गई भूमिका (Assigned Role):** Level 4 Sub Agent (QA Verification Engineer)  
> **प्राथमिक प्राधिकरण (Primary Authority):** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎯 1. Phase Objective

Conduct independent quality assurance, syntax verification, AST parsing, and UTF-8 BOM encoding validation across all generated documentation files and existing extension scripts. Ensure zero code degradation and 100% test passage before presenting Grade A+ completion certification.

---

## 📋 2. Verification Battery & Test Gates

1. **Physical File Existence Check:**
   - Verify that `dashboard_non_working_functions.md` exists in the workspace root.
   - Verify that `dashboard_phase_wise_plan.md` exists in the workspace root.
   - Verify that `temp_prompt/dashboard_mode_audit/` contains all 8 required ephemeral artifacts (`INDEX.md`, `SUMMARY.md`, `PRD.md`, `TRD.md`, `phase_01_deep_audit.md`, `phase_02_generate_non_working_list.md`, `phase_03_generate_phase_wise_plan.md`, `phase_04_qa_verification.md`).
2. **Node.js Syntax Compilation (`node -c`):**
   ```powershell
   node -c dashboard/dashboard.js
   node -c popup/popup.js
   node -c background.js
   node -c content_media.js
   ```
3. **Core Test Suites Execution:**
   ```powershell
   node tests/test_syntax_and_manifest_integrity.js
   node tests/test_dashboard_multi_browser_filter.js
   node tests/test_sleep_timer_and_ui_controls.js
   node tests/test_tab_switch_and_storage_persistence.js
   node tests/test_jump_to_media_tab_and_bottom_toast.js
   ```
4. **UTF-8 BOM Encoding Verification:**
   - Confirm UTF-8 BOM signature (`0xEF, 0xBB, 0xBF`) on all newly authored files per Universal Rule 5/8.
5. **Memory Synchronization Verification:**
   - Verify `project_feature_memory.md` and `C:\Users\Atul Verma\.gemini\memory.md` contain updated entries for Dashboard Mode audit.

---

## 🛡️ 3. Acceptance Signoff Criteria

- 100% test suite execution with exit code 0.
- Zero syntax or parsing errors.
- Issue formal Grade A+ QA Signoff Certificate to Level 2 Manager.
