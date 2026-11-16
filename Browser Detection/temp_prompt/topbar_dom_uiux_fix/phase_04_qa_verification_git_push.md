# Phase 4: Independent QA Verification Suite & Rule 15 Git Operations

> **Phase Identifier:** Phase 4 of 4  
> **Target Files:** Entire Repository & Test Suites  
> **Executing Role:** Level 4 Independent QA Verification Tester  
> **Department Rule:** Dept 08 QA & Testing & Universal Rule 15  
> **Authorization Mandate:** Requires active `AUTH-MGR-*` token from Level 2 Manager  

---

## 1. Phase Objective
Perform independent, end-to-end quality assurance, execute the project test harness (`node run_all_tests.js`), audit Trusted Types compliance, verify UTF-8 BOM encoding across modified files, execute a `gitleaks` secret audit, and autonomously execute Git operations per Universal Rule 15.

---

## 2. Prerequisites & Technical Context
- Completion of Phase 1 (DOM surgery), Phase 2 (Pill compacting), and Phase 3 (Theme verification).
- Independent QA role: Level 4 QA Subagent has exclusive authority to grant Grade A+ signoff.

---

## 3. Surgical Step-by-Step Instructions

1. **Step 1: Automated Test Suite Execution:**
   - Run the comprehensive test suite:
     ```powershell
     node run_all_tests.js
     ```
   - Verify exit code is 0 and 100% of test suites pass cleanly.
2. **Step 2: Google Trusted Types Compliance Check:**
   - Audit modified files for any forbidden direct `innerHTML` or `outerHTML` assignments that bypass the `trustedTypes` security policy.
3. **Step 3: UTF-8 BOM Encoding Audit:**
   - Verify that `dashboard/dashboard.html` and `dashboard/dashboard.css` begin with the mandatory byte sequence `0xEF, 0xBB, 0xBF`.
4. **Step 4: Secret Leak Audit (`gitleaks`):**
   - Run:
     ```powershell
     gitleaks detect --redact -v
     ```
   - Confirm 0 leaks detected.
5. **Step 5: Universal Rule 15 Git Operations:**
   - **Autonomous Local Micro-Commit:**
     - Stage modified files (`dashboard/dashboard.html`, `dashboard/dashboard.css`, and ephemeral docs).
     - Execute local commit:
       ```powershell
       git add dashboard/dashboard.html dashboard/dashboard.css temp_prompt/topbar_dom_uiux_fix/
       git commit -m "fix(dashboard): resolve stray div in top app bar DOM and compact icon-pills"
       ```
     - Output the mandatory confirmation: `"Haan, local me commit ho chuka hai [commit-hash/message]"`.
   - **Online Upstream Pre-Check & Autonomous Push:**
     - Verify online upstream status:
       ```powershell
       git ls-remote --exit-code origin
       ```
     - If remote origin is online and the change is significant (>= 3 files), execute `git push` autonomously.
     - Capture the 3-point terminal proof:
       1. `git log -1`
       2. `git push` response
       3. `git status` clean working tree

---

## 4. Local Verification Gate
- Grade A+ signoff is granted ONLY if:
  1. `node run_all_tests.js` passes with exit code 0.
  2. `gitleaks detect` reports 0 leaks.
  3. Git working tree is clean and committed.
