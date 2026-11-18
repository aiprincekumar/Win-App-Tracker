# Product Requirements Document (PRD): End-to-End Headed Interactive Verification

> **Task ID:** `TASK-E2E-HEADED-VERIFY-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target Path:** `temp_prompt/e2e_headed_focus_sleep_verification/PRD.md`  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)

---

## 🎯 1. User Personas & Problem Framing

- **User / Developer Persona:** Atul Verma (`aiprincekumar`), lead architect of the Web Activity & Media Sentinel extension.
- **Problem Statement:** The developer requires absolute empirical proof that the Chrome extension operates correctly in a live, real-world Google Chrome browser on Windows. Specifically, the Focus Timing and Sleep Timer features must be exercised interactively in a visible GUI window, demonstrating live countdowns and state transitions at their minimum allowable durations without waiting for full 25-minute or 30-minute default cycles.

---

## 📋 2. Functional Requirements (FR)

### FR-01: Visible Headed Chrome Environment
- The test harness MUST launch Google Chrome with a GUI window clearly visible on the Windows desktop (`headless: false`).
- The extension located at `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection` MUST be loaded as an unpacked Manifest V3 extension.
- The harness must reliably resolve the extension's runtime URL (`chrome-extension://<extension_id>/`).

### FR-02: Interactive Focus Timing Minimum Duration Verification
- The harness MUST open the Extension Dashboard (`dashboard/dashboard.html`) and navigate to the Wellbeing / Focus tab.
- The minimum allowable duration for Focus mode is **1 minute (60 seconds)**.
- The system must trigger a 1-minute focus block.
- The digital countdown clock (`#pomodoroTimeDisplay`) MUST visibly decrement second-by-second on screen (starting from `01:00` down to `00:59`, `00:58`, etc.).
- The SVG radial progress dial (`#dashFocusDialProgress`) MUST visually animate its stroke-dashoffset proportionally.
- The state machine MUST transition from `IDLE` to `RUNNING_FOCUS`.
- The user/harness MUST verify pause (`PAUSED_FOCUS`) and resume (`RUNNING_FOCUS`) interactions.
- When reaching zero or on manual reset, the state machine MUST transition cleanly to `COMPLETED` or `IDLE`.

### FR-03: Interactive Sleep Timer Minimum Duration Verification
- The harness MUST verify the Sleep Timer in both Dashboard (`#cardSleepSentinelHub`) and Popup (`#sleepTimerPopover` / `#cardPopupSleepTimer`).
- The minimum allowable duration for Sleep Timer is **1 minute (60 seconds)**.
- The system must set the duration to 1 minute (via `#customTimerInput` or IPC `SET_SLEEP_TIMER` with `durationMinutes: 1`).
- The countdown clock (`#dashSleepCountdownDisplay` and `#countdownTimeRemaining`) MUST visibly decrement second-by-second.
- The SVG radial dial (`#dashSleepDialProgress`) MUST smoothly animate its progress.
- The Chrome Action badge text MUST display the active countdown (e.g., `1m` or `<60s` formatted as seconds).
- The 30s audio fade-out hook (`FADING` state) and timer expiration hook (`TRIGGERED` state) MUST be verified at the boundary.
- Resetting or canceling the timer MUST restore state cleanly to `IDLE`.

### FR-04: Master Regression Integrity
- Running `node run_all_tests.js` MUST execute all 83+ test suites with 0 failures and exit code 0.
- All touched scripts MUST maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) and 100% W3C Trusted Types zero-innerHTML compliance.

---

## 🛡️ 3. Non-Functional Requirements (NFR)

1. **Visibility & Transparency:** The verification MUST NOT execute in hidden or headless mode. The browser window MUST be visible on the desktop screen.
2. **Speed & Efficiency:** By utilizing the minimum allowable duration of 1 minute (60 seconds), the complete verification finishes swiftly without wasting time on 25m or 30m cycles.
3. **Determinism:** Every state transition and DOM assertion must be deterministically verifiable.
4. **Safety & Zero Clutter:** Ephemeral user data profiles created during testing must be cleanly deleted upon exit.
5. **No Codebreak Invariant:** The verification must not alter existing working functionality.

---

## ✅ 4. Acceptance Criteria (Given - When - Then)

### Scenario 1: Headed Extension Launch
- **Given:** Google Chrome is installed at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- **When:** The verification harness launches Chrome with `--load-extension`.
- **Then:** A visible browser window appears on the desktop, and the extension background service worker is active.

### Scenario 2: 1-Minute Focus Timer Execution
- **Given:** The Extension Dashboard is open at `#tabContentWellbeing`.
- **When:** A 1-minute focus session is started.
- **Then:** `#pomodoroTimeDisplay` shows `01:00` and decrements each second; `#pomodoroModeBadge` displays active Focus status; pause, resume, and reset function cleanly.

### Scenario 3: 1-Minute Sleep Timer Execution
- **Given:** The Sleep Timer hub or popover is active.
- **When:** A 1-minute sleep timer is set and started.
- **Then:** The countdown ticks down from `01:00`; the radial dial animates; badge text updates; fade and auto-pause hooks activate upon reaching expiration; reset returns state to `IDLE`.

### Scenario 4: Master Regression Signoff
- **Given:** The interactive tests conclude.
- **When:** `node run_all_tests.js` is executed.
- **Then:** All 83+ test suites pass with 0 errors and Exit Code 0.
