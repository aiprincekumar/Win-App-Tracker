# Phase 3 Execution Prompt
## Independent QA Verification, Gitleaks Audit & Autonomous Push

> **Assigned Role:** Level 4 Independent QA Agent (`qa_verification_tester`)  
> **Mandatory Rule Directive:** Load and adhere to [`dynamic_departments_matrix.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/dynamic_departments_matrix.md), [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md), and [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) before executing instructions.  
> **Target Scope:** Entire Extension Codebase, Test Suites, Memory Ledger, Git Repository  
> **Verification Gate:** Full test suite regression (exit code 0), `gitleaks detect --redact` (0 leaks), clean git status  

---

## 1. Phase Objective
Execute comprehensive independent QA verification across the entire extension test suite, conduct an automated security secret audit with `gitleaks`, synchronize the active working memory and 7-column diagnostic matrix in `memory.md`, and autonomously execute local micro-commits and GitHub push per Universal Rule 15.

---

## 2. Verification Gates & Execution Protocol

### Step 2.1: Full Test Suite Regression Verification
Execute all 28+ test suites in `tests/` to ensure zero regressions:
```bash
node tests/test_media_controls_and_fullscreen_fix.js
node tests/test_fullscreen_controller.js
node tests/test_syntax_and_manifest_integrity.js
node tests/test_theme_toggle.js
node tests/test_four_pillar_hub_ui.js
node tests/test_six_tab_popup_architecture.js
node tests/test_event_deduplication.js
node tests/test_volume_timeline_fullscreen_controls.js
```
All tests must report 100% green exit code 0.

### Step 2.2: Automated Secret Audit
Run gitleaks secret scanning across the repository:
```bash
gitleaks detect --redact
```
Zero secrets, tokens, or credentials permitted.

### Step 2.3: Working Memory & Diagnostic Matrix Synchronization
Update Section 0 and Section 4 in `memory.md` with the completed Single-Execution Determinism architecture:
- Record task resolution in the 7-Column Diagnostic Matrix:
  - File: `popup/popup.js`, `content_media.js`, `tests/test_media_controls_and_fullscreen_fix.js`
  - Root Cause: Dual execution across scripting and IPC causing double-toggle race condition.
  - Proposed Fix: Strip redundant `executeScript` from button handlers, establish single authoritative `sendMediaControl` IPC dispatch, enforce single execution in content script.
  - Post-Fix Impact: 100% deterministic, race-free single-click media toggling.
  - Phase #: Phase 1 & 2
  - Test Gate: All test suites exit code 0.

### Step 2.4: Autonomous Local Micro-Commit & GitHub Push
- Autonomously commit all modifications locally per Universal Rule 15:
  ```bash
  git add popup/popup.js content_media.js tests/test_media_controls_and_fullscreen_fix.js temp_prompt/
  git commit -m "fix(media): resolve double-toggle race condition and enforce single-execution determinism"
  ```
- Check upstream online status via `git ls-remote --exit-code origin`.
- If upstream is available online and change magnitude >= 3 files, autonomously push to remote repository without interrupting user.
- Capture 3-point terminal proof: commit hash, push output, clean working tree.
