# Single-Execution Determinism & Double-Toggle Elimination
## Live Tracking Board & Problem-Solution Dossier

> **Task ID:** `TASK-SINGLE-EXECUTION-DETERMINISM-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Standard:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Ephemeral Container:** `temp_prompt/single_execution_determinism/`  
> **Decision Gate Status:** `PROMPT_FILES_REQUIRED = YES` (Certified Explicit Assessment)  
> **Recommended Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Target Autonomy Score: 1.0)  

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Double-Toggle Race Condition Failure Mechanism
In the previous architecture, media control interactions suffered from a multi-layer dual-execution flaw resulting in rapid oscillatory toggles, state bounce-back, and race conditions:

1. **Dual Dispatch in `popup/popup.js`:**
   Every media control button handler (Play/Pause `#btnCtrlTogglePlay`, `#dynamicStatusBtn`, Rewind `#btnCtrlRewind`, Forward `#btnCtrlForward`, Mute `#btnCtrlToggleMute`, `#btnQuickMute`, Speed Steppers `#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`, Fullscreen `#btnCtrlFullscreen`, PiP `#btnCtrlPip`, Theater `#btnCtrlTheater`, Quality Steppers) executed BOTH:
   - `browserAPI.scripting.executeScript(...) targeting top frame` directly into the page.
   - AND `sendMediaControl(...) dispatching IPC message { type: 'CONTROL_MEDIA', action, data }` to the background worker and content script.
   
2. **Internal Double-Toggle in `content_media.js`:**
   When the content script's `handleMediaControl(action, data)` received the IPC message from `sendMediaControl`, it simultaneously:
   - Invoked `forwardActionToMainWorld(action, data)` which triggered YouTube player API / native button / HTML5 fallback in the MAIN world.
   - AND executed direct manipulation on `primaryMediaElement` (e.g., `primaryMediaElement.play()` / `primaryMediaElement.pause()`, `primaryMediaElement.muted = !primaryMediaElement.muted`) in the ISOLATED world.

3. **Catastrophic State Inversion:**
   When a user clicked Play/Pause on a playing YouTube video:
   - Step A: In-popup `executeScript` ran and paused the video.
   - Step B: In-content script `forwardActionToMainWorld` ran.
   - Step C: In-content script direct `primaryMediaElement.play()` ran because it detected `primaryMediaElement.paused === true`!
   - Result: Video paused for 20ms and instantly resumed playing (or vice versa).
   - Similar dual-clicks occurred on the floating fullscreen button (`__sentinel_fs_floating_btn__`), entering and immediately exiting fullscreen.

### 1.2 The Single-Execution Determinism Solution Architecture
To achieve 100% deterministic, race-free single execution:
1. **Single Authoritative Dispatch in `popup/popup.js`:**
   - Completely strip redundant `executeScript` blocks from all media control button handlers.
   - Rely solely on `sendMediaControl(action, data, targetTabId)` as the single authoritative IPC dispatch.
   - Retain all optimistic cooldown locks (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, `lastProgressDragTime`, `lastVolumeChangeTime`) and the 800ms cooldown guards in `renderMediaCard`.
   - Preserve `#btnGlobalMediaToggle` (lines 3154-3168) 100% untouched for global multi-tab toggling.
2. **Single-Execution Determinism in `content_media.js`:**
   - Eliminate internal double toggling between `forwardActionToMainWorld` and direct `primaryMediaElement` manipulation.
   - On YouTube or pages with Main World execution bridge, delegate playback toggling cleanly to Main World (or ensure mutual exclusivity so that a command is executed exactly once).
   - Guarantee a single click on the floating fullscreen button (`__sentinel_fs_floating_btn__`).
3. **Dual-Tier Test Suite Overhaul in `tests/test_media_controls_and_fullscreen_fix.js`:**
   - Assert 0 conflicting `executeScript` calls inside media control button handlers in `popup.js`.
   - Verify single authoritative `sendMediaControl` IPC dispatch across all control buttons.
   - Overhaul simulated runtime mock harness to assert exactly 1 IPC call and 0 conflicting `executeScript` calls per user action.
4. **Independent QA & Regression Verification:**
   - Grade A+ verification across all 28+ test suites in `tests/`.
   - Secret scan with `gitleaks detect --redact`.
   - Synchronize Section 0 & Diagnostic Matrix in `memory.md`.
   - Autonomous local micro-commit and GitHub push.

---

## 🚦 2. Phase Status & Execution Checklist

| Phase # | Phase Title & Scope | Target Files | Status | Assigned Role | Gate Verification | Quality Certification |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| **Phase 1** | Single-Execution Determinism in Popup & Content Script | `popup/popup.js`, `content_media.js` | `COMPLETED` | Level 4 Frontend Engineer | `node -c popup/popup.js`, `node -c content_media.js` | Grade A+ Certified |
| **Phase 2** | Test Suite Overhaul: Assert 0 Conflicting Scripts & 1 Authoritative IPC | `tests/test_media_controls_and_fullscreen_fix.js` | `COMPLETED` | Level 4 QA Test Engineer | `node tests/test_media_controls_and_fullscreen_fix.js` | Grade A+ Certified |
| **Phase 3** | Independent QA Verification, Gitleaks Audit & Autonomous Push | All Test Suites, Memory Ledger, Git | `COMPLETED` | Level 4 Independent QA Agent | All 30 Test Suites + `gitleaks detect` | Grade A+ Certified |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix (Rule 20)

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `popup/popup.js` | Button handlers executed both `executeScript` and `sendMediaControl`, triggering double action execution and state oscillation. | Strip redundant `executeScript` from button handlers; establish `sendMediaControl` as sole authoritative dispatch. | Clean single-dispatch IPC; zero dual-execution race conditions. | Phase 1 | `node -c popup/popup.js` |
| **2** | `popup/popup.js` | Fullscreen button executed `executeScript` which clicked `__sentinel_fs_floating_btn__` while `sendMediaControl` also clicked it via content script. | Remove `executeScript` from `#btnCtrlFullscreen`; let content script handle single click. | Fullscreen enters reliably without immediate exit bounce-back. | Phase 1 | `node -c popup/popup.js` |
| **3** | `content_media.js` | `handleMediaControl` executed both `forwardActionToMainWorld` and direct `primaryMediaElement` toggle, flipping playback states twice. | Enforce single-path execution: forward to Main World for YouTube/bridge or execute directly on HTML5 element, never both for toggles. | Deterministic single toggle across YouTube and standard HTML5 media. | Phase 1 | `node -c content_media.js` |
| **4** | `tests/test_media_controls_and_fullscreen_fix.js` | Test suite asserted dual execution (requiring `executeScript` alongside `sendMediaControl`). | Overhaul test suite: assert 0 conflicting `executeScript` in button handlers, verify single authoritative `sendMediaControl`, and test simulated single-dispatch runtime. | Tests strictly enforce single-execution determinism and prevent regression. | Phase 2 | `node tests/test_media_controls_and_fullscreen_fix.js` |
| **5** | Codebase & Git | Architectural modifications must not break existing features, leak credentials, or destabilize memory tracking. | Run full test suite regression, perform `gitleaks detect --redact`, update `memory.md`, and execute autonomous git push. | Full regression safety, zero leaks, verified single-execution architecture. | Phase 3 | All Test Suites |

---

## 🧭 4. Implementation Strategy Recommendation

- **Recommended Strategy:** `STRATEGY_A_AUTONOMOUS` (Fully Autonomous Phase-wise Execution)
- **Target Autonomy Score:** 1.0
- **Rationale:** The race condition root cause is mathematically proven and isolated. The rectification strictly adheres to deterministic single-dispatch principles without altering UI layouts, DOM element IDs, or user configurations. Execution proceeds sequentially across Phase 1 -> Phase 2 -> Phase 3 with automated local test gates.

---

## 🔗 5. Handoff & Gate Verification Criteria

### Advancing Phase 1 -> Phase 2:
- `popup/popup.js` and `content_media.js` pass `node -c` with 0 syntax errors.
- Redundant `executeScript` completely removed from button handlers in `popup/popup.js`.
- Cooldown locks (`lastPlayToggleTime`, `lastMuteToggleTime`, etc.) preserved.
- `#btnGlobalMediaToggle` remains 100% untouched.
- `content_media.js` eliminates dual-toggle between Main World and Isolated World.

### Advancing Phase 2 -> Phase 3:
- `tests/test_media_controls_and_fullscreen_fix.js` runs with exit code 0.
- All structural and simulated runtime mock assertions pass 100%.

### Phase 3 Completion & Certification:
- All 28+ test suites pass with 100% green exit code 0.
- `gitleaks detect --redact` passes with 0 leaks detected.
- `memory.md` updated with Section 0 & 7-column diagnostic matrix.
- Autonomous local micro-commit and GitHub push executed.
