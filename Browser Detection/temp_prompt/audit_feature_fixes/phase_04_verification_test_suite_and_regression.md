# Phase 04: Verification Test Suite, Master Regression, & Rule 15 Operations

> **Phase:** 04  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Target Subsystems:** `tests/test_audit_feature_fixes.js`, `run_all_tests.js`, Git Repository  
> **Assigned Role:** Level 4 QA Verification Tester & Release Engineer  
> **Skill Prerequisites:** `terminal-ops`, `security-review`  

---

## 🎯 Phase Objective
Create a dedicated verification test suite `tests/test_audit_feature_fixes.js` covering all 4 defects, achieve 100% test passage across all 78+ test suites via `node run_all_tests.js`, confirm UTF-8 with BOM preservation, verify 0 gitleaks secrets, and autonomously commit and push to remote `origin/main` per Universal Rule 15.

---

## 📋 Required Test Batteries in `tests/test_audit_feature_fixes.js`

1. **Battery 1 (Static Source & Selector Assertions):**
   - Assert `dashboard.js` references `tableDomainSearch` as primary selector with `domainSearchInput` fallback.
   - Assert `dashboard.js` references `toggleDashSleepFade` as primary selector with `toggleDashSleepFadeCurve` fallback.
   - Assert `dashboard.html` contains `<span id="audioLabPresetBadge" class="badge-eq-preset">Flat</span>`.
   - Assert `dashboard.css` and `audio_lab.css` define `.badge-eq-preset` and `body.theme-light .badge-eq-preset`.

2. **Battery 2 (Omni Palette Domain Action Simulation):**
   - Mock DOM elements (`tableDomainSearch`, `domainSearchInput`), trigger Omni domain action, and verify `tableDomainSearch.value` is populated and `input` event is received.

3. **Battery 3 (Sleep Extender Fade Toggle State Evaluation):**
   - Mock DOM `#toggleDashSleepFade` unchecked, invoke `calculateExtendedSleepTimerState` / `triggerExtendSleepTimer`, verify `enableFadeOut` reflects `false`.

4. **Battery 4 (Audio Lab Preset Badge Dynamic Updates):**
   - Assert preset change handler in `dashboard.js` updates `#audioLabPresetBadge.textContent` to capitalized string ("Flat", "Bass Boost", "Custom").

5. **Battery 5 (Sleep Timer Backend Timeout Action Dispatch):**
   - Simulate `triggerSleepTimerExpiration()` in VM sandbox with `timeoutAction: 'mute'`, asserting `handleMuteAllExecution` is invoked.
   - Simulate with `timeoutAction: 'close'`, asserting `closeAllMediaTabs` is invoked.
   - Simulate with `timeoutAction: 'pause'`, asserting `dispatchGlobalMediaAction('PAUSE_ALL')` is invoked.

---

## 🔒 Constitutional Quality Gates

### Gate 1: Dedicated Suite Passage
```powershell
node tests/test_audit_feature_fixes.js
```
Must pass with Exit Code 0.

### Gate 2: Master Test Suite Passage
```powershell
node run_all_tests.js
```
Must achieve 100% PASS across all 78+ test files with 0 failures and Exit Code 0.

### Gate 3: UTF-8 with BOM Byte Audit
Verify all modified files begin with bytes `0xEF, 0xBB, 0xBF`.

### Gate 4: Secret Audit (Gitleaks)
```powershell
gitleaks detect --redact
```
Must find 0 leaks.

### Gate 5: Rule 15 Git Commit & Push
1. Local git commit:
   `git commit -m "fix(dashboard): resolve 4 functional defects in omni search, sleep extender, eq badge, and sleep timeout actions"`
   Notify: "Haan, local me commit ho chuka hai [hash/message]".
2. Online remote push:
   `git push origin main`
3. 3-Point Terminal Proof:
   - `git log -1`
   - `git push` output
   - `git status` clean working tree
