# Explicit Idempotent State & Strict Mutual Exclusion Media Controls Architecture
## Live Tracking Board & Problem-Solution Dossier

> **Task ID:** `TASK-IDEMPOTENT-MEDIA-CONTROLS-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Standard:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Ephemeral Container:** `temp_prompt/explicit_idempotent_media_controls/`  
> **Decision Gate Assessment:** `PROMPT_FILES_REQUIRED = YES` (Certified Explicit Assessment under Universal Rule 22)  
> **Recommended Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Problem & Root Cause Analysis

While the recent restoration of direct 0ms MAIN-world scripting brought instant actuation to media controls, an architectural vulnerability exists around **idempotent command dispatch** and **player-element mutual exclusion**:

1. **Non-Idempotent Generic Toggle Commands (`toggle_play` / `toggle_mute`):**
   - In both `popup/popup.js` and `dashboard/dashboard.js`, clicking the Play/Pause button sends a blind `toggle_play` command, and clicking Mute sends `toggle_mute`.
   - If the UI state and video state desynchronize (e.g., video ended or was paused by an ad/autoplay block, but UI displays playing), sending a generic toggle inverts the *current* state rather than forcing the *intended* state. If a user clicks "Pause" expecting silence, a blind toggle can inadvertently trigger "Play".
2. **Missing Strict Mutual Exclusion Between YouTube `moviePlayer` and HTML5 `video`:**
   - In `popup/popup.js` (`handleTogglePlay`), the script checks `if (moviePlayer)` and then sequentially executes `if (video)`.
   - On YouTube pages, both `#movie_player` and an HTML5 `<video>` element exist simultaneously. Without a strict `else if (video)` mutual exclusion guard, both branches execute sequentially. When `moviePlayer.playVideo()` starts playback, the subsequent `video` check observes the element's pre-transition or transitional state and can immediately issue a conflicting command, causing double-actuation, stutter, or state reversal.
3. **Missing Explicit `mute` and `unmute` Support in Downstream Modules:**
   - `inject_main_world.js` has `case 'toggle_mute':`, but completely lacks `case 'mute':` and `case 'unmute':`.
   - `content_media.js` omits `'mute'` and `'unmute'` from `KNOWN_MEDIA_ACTIONS` and lacks explicit `case 'mute':` and `case 'unmute':` in `handleMediaControl`.
   - `background.js` has optimistic handling for `toggle_mute`, `play`, `pause`, and `toggle_play`, but lacks `else if (message.action === 'mute')` and `else if (message.action === 'unmute')`.
4. **Preservation Invariants:**
   - Universal Multi-Tab Play/Pause button (`#btnGlobalMediaToggle`) must remain 100% frozen and untouched (strictly bound to `TOGGLE_GLOBAL_MEDIA`).
   - Cooldown lock timestamps (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, `lastControlsRowActiveTime`) and 800ms optimistic suppression guards must remain intact to prevent UI bounce-back flicker.

### 1.2 The Architectural Solution

1. **Explicit Idempotent Commands (`play`, `pause`, `mute`, `unmute`):**
   - The UI computes the explicit target state based on cached state (e.g., if currently playing, target action is strictly `'pause'`; if paused, target action is `'play'`; if currently muted, target action is `'unmute'`; if unmuted, target action is `'mute'`).
   - If cached state is unknown, it falls back gracefully to `'toggle_play'` or `'toggle_mute'`.
   - Handlers across all 5 files (`popup.js`, `dashboard.js`, `background.js`, `content_media.js`, and `inject_main_world.js`) are updated to handle all 6 actions (`play`, `pause`, `toggle_play`, `mute`, `unmute`, `toggle_mute`) with 100% idempotency.
2. **Strict `else if` Mutual Exclusion:**
   - In injected MAIN-world scripts and execution fallbacks, `moviePlayer` is checked first. If present and handled, the HTML5 `video` branch is bypassed completely via `else if (video)`. This guarantees single-actuation determinism on YouTube and standard media pages alike.
3. **Comprehensive Test Suite Overhaul:**
   - Update `tests/test_media_controls_and_fullscreen_fix.js` to assert explicit idempotent command routing, strict `else if` mutual exclusion, and complete mock simulation.
4. **Full Workspace Regression Safety:**
   - Verify all 34 core repository test suites pass with exit code 0, 0 gitleaks findings, synchronized `memory.md`, and certified Git operations per Universal Rule 15.

---

## 🚦 2. Phase Status & Execution Checklist

| Phase # | Phase Title & Scope | Target Files | Status | Assigned Role | Gate Verification | Quality Certification |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| **Phase 1** | Explicit Media Controls & Mutual Exclusion Implementation | `popup/popup.js`, `dashboard/dashboard.js`, `background.js`, `content_media.js`, `inject_main_world.js` | `PENDING` | Level 4 Frontend Engineer | `node -c` on all 5 files + `node tests/test_syntax_and_manifest_integrity.js` | Pending |
| **Phase 2** | Test Suite Overhaul & Mock Execution Verification | `tests/test_media_controls_and_fullscreen_fix.js` | `PENDING` | Level 4 QA Test Engineer | `node tests/test_media_controls_and_fullscreen_fix.js` | Pending |
| **Phase 3** | Full Regression Verification, Gitleaks, Git & Sync | All 34 Test Suites, `memory.md`, Git | `PENDING` | Level 4 Independent QA Agent | All 34 Test Suites + `gitleaks detect` | Pending |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix (Universal Rule 20)

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `popup/popup.js` | `handleTogglePlay` uses non-exclusive `if (video)` after `if (moviePlayer)` and always dispatches generic `toggle_play`; `handleToggleMute` always dispatches generic `toggle_mute`. | Refactor to compute explicit target action (`play`/`pause`, `mute`/`unmute`), enforce strict `else if (video)` mutual exclusion in MAIN world script, and dispatch explicit idempotent IPC commands. Preserve `#btnGlobalMediaToggle` and cooldowns. | Eliminates state reversal and YouTube double-actuation; ensures idempotent media control. | Phase 1 | `node -c popup/popup.js` |
| **2** | `dashboard/dashboard.js` | `handleTogglePlayHero` and `btnHeroMute` dispatch generic `toggle_play`/`toggle_mute` and lack `moviePlayer` support with mutual exclusion. | Implement explicit action calculation (`play`/`pause`, `mute`/`unmute`), add YouTube `moviePlayer` + `else if (video)` mutual exclusion to MAIN world script, and dispatch explicit commands. | Parity between Popup and Dashboard with 0ms direct YouTube & HTML5 actuation. | Phase 1 | `node -c dashboard/dashboard.js` |
| **3** | `background.js` | `CONTROL_MEDIA` handler has optimistic branches for `toggle_play`, `play`, `pause`, `toggle_mute`, but lacks explicit `mute` and `unmute` handling. | Add `else if (message.action === 'mute') { pm.isMuted = true; }` and `else if (message.action === 'unmute') { pm.isMuted = false; }`. | Full optimistic state tracking and broadcast for explicit mute commands. | Phase 1 | `node -c background.js` |
| **4** | `content_media.js` | `KNOWN_MEDIA_ACTIONS` omits `'mute'` and `'unmute'`; `handleMediaControl` switch lacks `case 'mute':` and `case 'unmute':`. | Add `'mute'` and `'unmute'` to `KNOWN_MEDIA_ACTIONS`; add explicit cases to `handleMediaControl` setting `primaryMediaElement.muted = true/false`. | Guarantees content script IPC router accepts and executes explicit mute/unmute commands. | Phase 1 | `node -c content_media.js` |
| **5** | `inject_main_world.js` | Missing `case 'mute':` and `case 'unmute':`; `case 'play'` and `case 'pause'` contain non-exclusive fallback checks that can re-trigger player elements. | Add explicit `case 'mute':` and `case 'unmute':` with `else if (video)`; tighten `case 'play'`/`case 'pause'`/`case 'toggle_play'` with strict `isHandled` short-circuiting. | Guaranteed single-actuation determinism and on-screen OSD feedback for explicit commands. | Phase 1 | `node -c inject_main_world.js` |
| **6** | `tests/test_media_controls_and_fullscreen_fix.js` | Test assertions only cover `toggle_play` and `toggle_mute`; router and execution tests do not validate explicit `mute`/`unmute`; mock tests do not assert `else if` mutual exclusion. | Overhaul tests 1, 2, 4, 6, 9, and 10 to validate explicit `play`/`pause`/`mute`/`unmute` routing, strict `else if` mutual exclusion, and idempotent state execution. | Automated verification of explicit idempotency and mutual exclusion invariants. | Phase 2 | `node tests/test_media_controls_and_fullscreen_fix.js` |
| **7** | Full Repository & Git | Ensuring zero regressions across existing functionality, zero credential leaks, memory tracking alignment, and compliant Git operations. | Execute all 34 core test suites, run `gitleaks detect --redact`, update `memory.md`, and execute autonomous git operations per Universal Rule 15. | 100% regression safety, zero credential leaks, permanent architectural recording. | Phase 3 | All 34 Core Test Suites |

---

## 🧭 4. Implementation Strategy Recommendation

- **Recommended Strategy:** `STRATEGY_A_AUTONOMOUS` (Fully Autonomous Phase-wise Execution)
- **Target Autonomy Score:** 1.0
- **Trade-off Justification:**
  - Scope is strictly technical, well-bounded, and mathematically deterministic (boolean states: playing/paused, muted/unmuted).
  - No new external APIs, UI visual redesigns, or schema migrations are introduced.
  - Strict backward compatibility is preserved: all generic toggle actions (`toggle_play`, `toggle_mute`) continue to function cleanly alongside explicit actions.
  - Automated local test gates (`node -c`, unit tests, mock simulations, full regression) verify each phase before transition.
