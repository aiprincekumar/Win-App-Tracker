# Browser Detection Extension: 4 Functional Deficiencies & Fixes - Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.js`, `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/styles/audio_lab.css`, `background.js`, `tests/`  
> **Lead Departments:** Dept 04 (Core Logic & Extension Architecture), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Defect 1: Dashboard Omni Command Palette Domain Search Filter
- **Target File:** `dashboard/dashboard.js` (around L7576)
- **Current Bug:** The Omni Command Palette domain action searches for DOM element ID `domainSearchInput` (`document.getElementById('domainSearchInput')`). In `dashboard/dashboard.html` (L492), the table search input is defined as `id="tableDomainSearch"`. As a result, triggering a domain analytics action from the command palette silently fails to populate the domain filter and trigger the search event.
- **Remedy:** Implement resilient ID fallback:
  ```javascript
  const searchInput = document.getElementById('tableDomainSearch') || document.getElementById('domainSearchInput');
  ```
  Ensures seamless domain filtering when switching to the tracking tab via Omni palette.

### 1.2 Defect 2: Dashboard Sleep Extender Fade Toggle ID Mismatch
- **Target File:** `dashboard/dashboard.js` (around L10623)
- **Current Bug:** `triggerExtendSleepTimer(extraMinutes)` queries `document.getElementById('toggleDashSleepFadeCurve')` to determine `enableFadeOut`. However, in `dashboard/dashboard.html` (L1506), the dashboard sleep fade toggle element is `id="toggleDashSleepFade"`. Consequently, `fadeToggle` evaluates to `null` and inappropriately falls back to `true`, ignoring the user's explicit UI toggle state.
- **Remedy:** Implement resilient ID fallback:
  ```javascript
  const fadeToggle = typeof document !== 'undefined' 
    ? (document.getElementById('toggleDashSleepFade') || document.getElementById('toggleDashSleepFadeCurve')) 
    : null;
  ```

### 1.3 Defect 3: Dashboard Audio Lab EQ Preset Badge
- **Target Files:** `dashboard/dashboard.html`, `dashboard/styles/audio_lab.css`, `dashboard/dashboard.css`
- **Current Bug:** `dashboard/dashboard.js` (L1972, L9343, L9370, L9390) programmatically updates text content of element `id="audioLabPresetBadge"` whenever the EQ preset changes (e.g., 'Flat', 'Bass Boost', 'Custom'). However, this badge element is absent from the EQ card header in `dashboard/dashboard.html`, causing silent no-ops. Furthermore, `.badge-eq-preset` styling is missing.
- **Remedy:**
  1. Add `<span id="audioLabPresetBadge" class="badge-eq-preset">Flat</span>` into `.eq-actions-group` in `dashboard/dashboard.html` (alongside `#audioEqPresetSelect`).
  2. Implement cyber-dark glassmorphism pill styling in `dashboard/styles/audio_lab.css` and `dashboard/dashboard.css` with responsive, theme-aware colors.

### 1.4 Defect 4: Sleep Timer Timeout Action Backend Execution
- **Target File:** `background.js` (in `triggerSleepTimerExpiration`, around L1412)
- **Current Bug:** When the sleep timer expires, `triggerSleepTimerExpiration()` unconditionally executes only `dispatchGlobalMediaAction('PAUSE_ALL')` if `pauseMedia` is set. It completely ignores configured `timeoutAction` / `timeout_action` settings (`'mute'`, `'close'` / `'close_tab'`, `'pause'`).
- **Remedy:**
  Inspect `timeoutAction` from `sleepTimerState` / `sleepTimerSettings`:
  - `'mute'`: Execute `handleMuteAllExecution(true)` to mute all candidate media tabs.
  - `'close'` / `'close_tab'`: Close candidate media tabs via `browserAPI.tabs.remove()`.
  - `'pause'` (or default): Execute `dispatchGlobalMediaAction('PAUSE_ALL')`.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Dashboard Omni & Sleep Extender ID Resiliency | `dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -e "require('./dashboard/dashboard.js'); console.log('OK')"` | ⏳ READY |
| **02** | Audio Lab EQ Preset Badge & Cyber-Dark Styling | `dashboard/dashboard.html`<br>`dashboard/styles/audio_lab.css`<br>`dashboard/dashboard.css` | Level 4 Frontend Engineer | `node -e "const fs=require('fs'); const h=fs.readFileSync('dashboard/dashboard.html','utf8'); if(!h.includes('audioLabPresetBadge')) throw new Error('Missing badge'); console.log('OK');"` | ⏳ READY |
| **03** | Sleep Timer Timeout Action Backend Execution | `background.js` | Level 4 Backend Engineer | `node -e "require('./background.js'); console.log('OK')"` | ⏳ READY |
| **04** | Comprehensive QA Verification Suite & Master Regression | `tests/test_audit_feature_fixes.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_audit_feature_fixes.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.js` (L7576) | Omni palette domain action checked `domainSearchInput` instead of active table input `tableDomainSearch`. | Use `document.getElementById('tableDomainSearch') || document.getElementById('domainSearchInput')`. | Omni search correctly populates search box and dispatches input event to filter domain list. | Phase 1 | `node tests/test_audit_feature_fixes.js` |
| **2** | `dashboard/dashboard.js` (L10623) | `triggerExtendSleepTimer` queried `toggleDashSleepFadeCurve` instead of `toggleDashSleepFade`. | Use `document.getElementById('toggleDashSleepFade') || document.getElementById('toggleDashSleepFadeCurve')`. | Sleep extender respects the user's actual fade toggle state rather than blindly defaulting. | Phase 1 | `node tests/test_audit_feature_fixes.js` |
| **3** | `dashboard/dashboard.html`<br>`dashboard/styles/audio_lab.css`<br>`dashboard/dashboard.css` | Missing `#audioLabPresetBadge` element and `.badge-eq-preset` styles; `dashboard.js` badge updates were no-oping. | Add `<span id="audioLabPresetBadge" class="badge-eq-preset">Flat</span>` to `.eq-actions-group`; add cyber-dark styling. | Live EQ preset name is visually displayed with high-contrast cybernetic styling; updates dynamically on preset change. | Phase 2 | `node tests/test_audit_feature_fixes.js` |
| **4** | `background.js` (L1412) | `triggerSleepTimerExpiration` only handled `PAUSE_ALL`; ignored configured `timeoutAction` (`mute`, `close`, `pause`). | Resolve action from `sleepTimerState.timeoutAction` / settings; dispatch `handleMuteAllExecution`, close media tabs, or pause. | Complete sleep timer timeout action execution lifecycle honored across popup and dashboard settings. | Phase 3 | `node tests/test_audit_feature_fixes.js` |
| **5** | `tests/test_audit_feature_fixes.js` | Absence of unified test asserting all 4 defect fixes. | Create 8+ battery test verifying ID fallbacks, badge presence, CSS rules, and backend timeout actions. | 100% test coverage and permanent regression protection across all 4 fixes. | Phase 4 | `node tests/test_audit_feature_fixes.js` (100% PASS) |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **UTF-8 with BOM Standard:** All modified files must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
2. **Function Length Limit:** All modified and newly introduced functions in `background.js` and `dashboard.js` must strictly adhere to <= 50 lines.
3. **W3C Trusted Types & DOM Safety:** Zero `innerHTML` usage; all DOM manipulations use `textContent`, `setAttribute`, or Trusted Types sanitization.
4. **Master Test Suite Pass:** `node run_all_tests.js` must achieve 100% PASS across all 78+ test suites with exit code 0.
5. **Gitleaks Zero Leaks:** Pre-commit/pre-push `gitleaks detect --redact` must confirm 0 leaks.
6. **Rule 15 Git Commit & Push:** Autonomous micro-commit and push with 3-point terminal proof.
