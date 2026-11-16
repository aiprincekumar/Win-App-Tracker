# PiP & Fullscreen Single-Execution Alignment
## Live Tracking Board & Problem-Solution Dossier

> **Task ID:** `TASK-PIP-FULLSCREEN-SINGLE-EXECUTION-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Standard:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Ephemeral Container:** `temp_prompt/pip_fullscreen_single_execution/`  
> **Decision Gate Assessment:** `PROMPT_FILES_REQUIRED = YES` (Certified Explicit Assessment under Universal Rule 22)  
> **Recommended Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Problem: Immediate Double-Toggle Closing Bug
When a user clicks `#btnCtrlPip` (Pop-up PiP) or `#btnCtrlFullscreen` (Fullscreen) in `popup/popup.js`, the requested mode immediately opens and then instantly closes within 50–100ms.

#### Root Cause Analysis
In `popup/popup.js` (lines ~3647–3723):
1. **Unconditional Dual Execution:** The button click handlers invoke `browserAPI.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: ... })` which immediately acts on the video/DOM in the web page.
2. **Immediate Conflicting IPC Dispatch:** Outside and directly following the `if (browserAPI.scripting.executeScript)` block, the handlers unconditionally call `sendMediaControl('toggle_fullscreen', {}, targetTabId)` or `sendMediaControl('toggle_pip', {}, targetTabId)`.
3. **The Race Condition / Double Inversion:** 
   - `executeScript` runs at 0ms and toggles PiP / Fullscreen ON.
   - Milliseconds later, `content_media.js` receives the IPC `MEDIA_CONTROL` message.
   - In `content_media.js`, `handleMediaControl('toggle_pip')` or `handleMediaControl('toggle_fullscreen')` checks the DOM state: finding `document.pictureInPictureElement` or fullscreen state already active, it toggles it OFF!
   - Result: PiP / Fullscreen triggers and immediately exits, completely breaking user experience.

### 1.2 The Single-Execution Solution (Parity with `dashboard.js`)
In `dashboard/dashboard.js` (lines ~4945–4981), PiP and Fullscreen buttons employ a battle-tested **Single-Execution Determinism** pattern:
```javascript
if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
  browserAPI.scripting.executeScript({
    target: { tabId: targetTabId },
    world: 'MAIN',
    func: () => { /* in-page direct toggle */ }
  }).catch(() => {
    // Fallback ONLY when executeScript rejects/fails
    sendMediaControl('toggle_pip', {}, targetTabId);
  });
} else {
  // Fallback ONLY when scripting API or targetTabId is unavailable
  sendMediaControl('toggle_pip', {}, targetTabId);
}
```
Under this architecture:
- When direct scripting succeeds, `sendMediaControl` is **NEVER** dispatched, eliminating the double-toggle bug.
- If `executeScript` fails or target tab cannot be scripted, `sendMediaControl` provides guaranteed fallback resilience.
- Cooldown timers (`lastFullscreenClick < 350`, `lastPipClick < 350`) remain active to block rapid physical double-clicks.
- `#btnGlobalMediaToggle` (Universal across-tab toggle) remains 100% frozen and untouched.

---

## 🚦 2. Phase Status & Execution Checklist

| Phase # | Phase Title & Scope | Target Files | Status | Assigned Role | Gate Verification | Quality Certification |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| **Phase 1** | Popup PiP & Fullscreen Single-Execution Alignment | `popup/popup.js` | `COMPLETED` | Level 4 Frontend Engineer | `node -c popup/popup.js` | Grade A+ Certified |
| **Phase 2** | Test Suite Modernization & Single-Execution Mocking | `tests/test_media_controls_and_fullscreen_fix.js` | `COMPLETED` | Level 4 QA Test Engineer | `node tests/test_media_controls_and_fullscreen_fix.js` | Grade A+ Certified |
| **Phase 3** | Full 36-Suite Regression, Gitleaks, Memory & Git Push | All 36 Test Suites, `memory.md`, Git | `COMPLETED` | Level 4 Independent QA Agent | 37 Suites Pass + `gitleaks detect` | Grade A+ Certified |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix (Universal Rule 20)

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `popup/popup.js` | `#btnCtrlFullscreen` & `#btnCtrlPip` called `executeScript` AND unconditionally called `sendMediaControl`, triggering immediate open-then-close double inversion. | Align with `dashboard.js`: call `sendMediaControl` ONLY in `.catch()` and in `else`, preserving cooldowns and `#btnGlobalMediaToggle`. | Immediate double-toggle closing bug eliminated; deterministic 0ms single execution with reliable IPC fallback. | Phase 1 | `node -c popup/popup.js` |
| **2** | `tests/test_media_controls_and_fullscreen_fix.js` | Tests 3, 4, 6, and 9 enforced obsolete dual actuation on Fullscreen and PiP, asserting both `executeScript` AND `sendMediaControl` fired simultaneously. | Overhaul assertions and VM mock simulations to verify single-execution determinism (executeScript 1, IPC 0 when scripting succeeds; IPC 1 when scripting fails). | Test suite validates true single-execution determinism and prevents regression to double-toggle behavior. | Phase 2 | `node tests/test_media_controls_and_fullscreen_fix.js` |
| **3** | Repository Test Suites | Codebase contains 36 test suites that must remain green with zero regressions. | Run complete test runner across all 36 test files in `tests/`. | Zero regressions; 36/36 tests passing with exit code 0. | Phase 3 | All 36 Test Suites |
| **4** | Security & SRE | Modifications must not introduce secret leaks or stale memory state. | Execute `gitleaks detect --redact`, update `memory.md`, commit locally and push autonomously. | Zero secret leaks, synchronized working memory, clean git audit trail. | Phase 3 | `gitleaks detect --redact` |

---

## 🧭 4. Implementation Strategy Recommendation

- **Recommended Strategy:** `STRATEGY_A_AUTONOMOUS` (Fully Autonomous Phase-wise Execution)
- **Target Autonomy Score:** 1.0
- **Rationale:** 
  1. The single-execution pattern is already implemented and proven in `dashboard/dashboard.js` (lines ~4945–4981).
  2. The code transformations are surgical, deterministic, and localized to `popup/popup.js` and `tests/test_media_controls_and_fullscreen_fix.js`.
  3. No DOM layout changes, no CSS changes, and no database or manifest alterations are needed.
  4. Local automated test gates provide 100% verification fidelity at each phase boundary.

---

## 🔗 5. Handoff & Gate Verification Criteria

### Advancing Phase 1 -> Phase 2:
- `popup/popup.js` passes `node -c` with 0 syntax errors.
- `#btnCtrlFullscreen` dispatches `sendMediaControl('toggle_fullscreen')` ONLY inside `.catch()` and `else`.
- `#btnCtrlPip` dispatches `sendMediaControl('toggle_pip')` ONLY inside `.catch()` and `else`.
- Cooldown timestamp checks (`< 350ms`) preserved for both controls.
- `#btnGlobalMediaToggle` (Universal across-tab toggle) remains completely untouched.

### Advancing Phase 2 -> Phase 3:
- `tests/test_media_controls_and_fullscreen_fix.js` passes with exit code 0.
- VM mock tests verify single-execution: when `executeScript` succeeds, `interceptedMediaControls.length === 0`.
- All 10 test sections in `test_media_controls_and_fullscreen_fix.js` pass with Grade A+ certification.

### Phase 3 Completion & Certification:
- All 36 test suites in `tests/` pass with 100% green exit code 0.
- `gitleaks detect --redact` passes with 0 leaks detected.
- `memory.md` updated with Section 0 state and Diagnostic Matrix.
- Autonomous local micro-commit and GitHub push executed per Universal Rule 15.
