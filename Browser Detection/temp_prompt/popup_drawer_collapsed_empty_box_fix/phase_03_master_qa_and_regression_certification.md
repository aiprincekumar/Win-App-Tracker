# Phase 3: Master QA & Regression Certification

> **Phase Identifier:** PHASE-03-MASTER-QA-CERTIFICATION  
> **Workspace Container:** `temp_prompt/popup_drawer_collapsed_empty_box_fix/`  
> **Primary Subagent Role:** Level 4 QA Verification Tester  
> **Target Subsystems:** Full repository integration test suite (`run_all_tests.js`)  
> **Lead Department:** Dept 08 QA, Testing & Verification Engineering  

---

## 🎯 1. Phase Objective
Certify Grade A+ release quality by running the master repository test suite (105+ suites), checking zero gitleaks findings, verifying UTF-8 with BOM on all touched files, and preparing audit records.

---

## 📋 2. Verification Gates & Execution Commands

### Gate 3.1: Full Repository Test Suite
```bash
node run_all_tests.js
```
- Expected Outcome: 105+ test suites pass with 0 failures, Exit Code 0.

### Gate 3.2: Secret Leak Audit
```bash
gitleaks detect --redact
```
- Expected Outcome: 0 leaks detected.

### Gate 3.3: UTF-8 with BOM Verification
Verify that all modified files maintain the required `0xEF, 0xBB, 0xBF` byte order mark.
```bash
node -e "
const fs = require('fs');
['popup/styles/tabs/tab_sleep.css', 'popup/styles/tabs/tab_wellness.css', 'popup/popup.css', 'tests/test_popup_drawer_docking_and_scrollbar_fix.js'].forEach(file => {
  const buf = fs.readFileSync(file);
  const hasBOM = buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  console.log(file, 'BOM:', hasBOM);
  if (!hasBOM) throw new Error('Missing BOM on ' + file);
});
"
```

### Gate 3.4: Grade A+ Certification
Deliver final test summary and forensic audit trail to Level 2 Manager.
