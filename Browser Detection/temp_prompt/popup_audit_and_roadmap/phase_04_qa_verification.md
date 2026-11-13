# Phase 4 Execution Prompt: Independent QA Verification & Review

> **Phase Name:** Phase 4 - Independent QA Verification & Review  
> **Target Subsystem:** Quality Assurance, Test Suite Integrity, Encoding Validation, Documentation Audit  
> **Workspace Container:** `temp_prompt/popup_audit_and_roadmap/`  
> **Assigned Agent Role:** Sub Agent (QA Verification Engineer)  
> **Authorization Token:** Required (`AUTH-MGR-*`)  

---

## 🎯 1. Phase Objective
Perform independent, objective quality assurance and verification of all deliverables produced across Phases 1, 2, and 3. Ensure 100% compliance with user requirements, verify that all workspace test suites pass cleanly, confirm UTF-8 with BOM encoding across all generated markdown documents, and deliver a formal Grade A+ signoff.

---

## 📋 2. Prerequisites & Inputs
- `temp_prompt/popup_audit_and_roadmap/INDEX.md`
- `temp_prompt/popup_audit_and_roadmap/SUMMARY.md`
- `temp_prompt/popup_audit_and_roadmap/PRD.md`
- `temp_prompt/popup_audit_and_roadmap/TRD.md`
- Workspace root deliverables:
  - `popup_non_working_functions.md` (File 1)
  - `popup_phase_wise_plan.md` (File 2)
  - `project_feature_memory.md` (Diagnostic Matrix)

---

## 🔍 3. Verification Test Suite Matrix

Execute the following deterministic test commands in the workspace root:

```bash
# 1. Syntax, Manifest MV3 & File Integrity Test
node tests/test_syntax_and_manifest_integrity.js

# 2. 6-Tab Navigation & UI Architecture Suite
node tests/test_six_tab_popup_architecture.js

# 3. Sleep Timer & UI Controls Test Suite
node tests/test_sleep_timer_and_ui_controls.js

# 4. Volume, Timeline Seeking & Web Fullscreen Controls Suite
node tests/test_volume_timeline_fullscreen_controls.js

# 5. SQLite Data Hub Sync Suite
node tests/test_popup_sqlite_data_hub_sync.js

# 6. Dashboard Multi-Browser Filter Suite
node tests/test_dashboard_multi_browser_filter.js
```

---

## 🛠️ 4. Surgical QA Verification Steps

1. **Deliverables Presence & Content Verification:**
   - Confirm `popup_non_working_functions.md` exists in workspace root and covers all 14 audited stubs/deficiencies.
   - Confirm `popup_phase_wise_plan.md` exists in workspace root and breaks remediation into 5 actionable phases.
   - Confirm bilingual clarity (Hindi and English) is properly rendered and accurately addresses the user's prompt.

2. **Encoding & Hygiene Check:**
   - Verify UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created markdown files.
   - Verify zero trailing whitespace or broken markdown link references.

3. **Workspace Integrity Check:**
   - Run `git status` to verify modified/untracked files.
   - Ensure application code was NOT mutated during the audit/documentation phases.

4. **Grade A+ Certification Criteria:**
   - All 6 core test suites pass with 100% success.
   - Zero syntax errors in any JavaScript file.
   - All user acceptance criteria from PRD satisfied.

---

## 📦 5. Deliverables Manifest
- Formal QA Signoff Report with raw terminal output and verification proof.

---

## 🧪 6. Exit Condition
QA signoff certified Grade A+; ready for final presentation by Level 2 Manager and Level 1 CEO to the User.
