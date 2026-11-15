# Phase 3 Execution Prompt
## Independent QA Verification, Secret Audit & Git Push Intelligence

> **Phase:** 3 of 3  
> **Target Scope:** Entire Extension Codebase, All Test Suites, Git Upstream  
> **Assigned Role:** Level 4 Independent QA Agent  
> **Prerequisites:** Phase 1 & Phase 2 Complete, `AUTH-MGR-*` Token Active  
> **Local Gate Command:** All Test Suites Clean (Exit Code 0) + `gitleaks detect`  

---

## 🎯 1. Phase Objective

Execute independent quality assurance verification across all test suites in the repository, conduct a zero-leak secret audit via `gitleaks`, record forensic diagnostic matrix entries in `project_feature_memory.md` and `memory.md`, and execute autonomous GitHub push intelligence under Universal Rule 15.

---

## 📍 2. Verification Protocol

### 2.1 Complete Test Suite Execution
Execute the core verification suites:
1. `node tests/test_media_controls_and_fullscreen_fix.js`
2. `node tests/test_volume_timeline_fullscreen_controls.js`
3. `node tests/test_fullscreen_controller.js`
4. `node tests/test_syntax_and_manifest_integrity.js`
5. `node tests/test_theme_toggle.js`
6. `node tests/test_light_mode_contrast_and_wcag.js`
7. `node tests/test_four_pillar_hub_ui.js`
8. `node tests/test_six_tab_popup_architecture.js`

### 2.2 Security & Gitleaks Audit
- Run `gitleaks detect --redact` (or token scan script) to certify 0 leaked secrets or tokens.

### 2.3 Memory Ledger Synchronization (Rule 20 & 23)
- Update `project_feature_memory.md` and `memory.md` with:
  - Phase status, active commit hash, test results.
  - S.No entries in the Universal 7-Column Diagnostic Matrix.

### 2.4 Autonomous Local Micro-Commit & Remote Push (Rule 15)
- Perform local micro-commits for changes.
- Check upstream status: `git ls-remote --exit-code origin`.
- If upstream exists and changes >= 3 files: autonomously push online with 3-point terminal proof:
  1. Commit hash (`git log -1`)
  2. Remote push response (`git push origin <branch>`)
  3. Clean working tree (`git status`)
