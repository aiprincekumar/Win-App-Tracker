# Technical Requirements Document (TRD): End-to-End Headed Interactive Verification

> **Task ID:** `TASK-E2E-HEADED-VERIFY-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target Path:** `temp_prompt/e2e_headed_focus_sleep_verification/TRD.md`  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)

---

## 🛠️ 1. Technical Architecture & Environment Configuration

### 1.1 Host Environment & Binaries
- **Operating System:** Windows 11 / Windows Server x64
- **Chrome Binary Path:** `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Node.js Runtime:** `process.execPath` (v20+ installed)
- **Extension Path:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- **Automation Framework:** Playwright Chromium (`playwright@1.64.0-alpha` available globally) or Node `child_process` + Chrome DevTools Protocol (CDP) / Remote Debugging Port (`--remote-debugging-port=9222`).

### 1.2 Chrome CLI Launch Arguments for Headed Mode
```bash
chrome.exe \
  --disable-extensions-except="c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection" \
  --load-extension="c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection" \
  --user-data-dir="c:\Users\Atul Verma\AppData\Local\Temp\sentinel_e2e_profile" \
  --no-first-run \
  --no-default-browser-check \
  --start-maximized \
  --remote-debugging-port=9222
```

---

## 🔄 2. Subsystems State Machines & Data Contracts

### 2.1 Focus Timing Subsystem Contracts
- **Storage Key:** `sentinel_focus_state` / `sentinel_focus_settings`
- **IPC Message Type:** `START_FOCUS_TIMER`, `PAUSE_FOCUS_TIMER`, `RESUME_FOCUS_TIMER`, `RESET_FOCUS_TIMER`
- **State Space:**
  - `IDLE`: No active session (`remainingSeconds: 0`, clock displays default/preset).
  - `RUNNING_FOCUS`: Active countdown (`remainingSeconds > 0`, decrements every 1000ms).
  - `PAUSED_FOCUS`: Timer paused, remaining time preserved.
  - `RUNNING_BREAK`: Break interval countdown.
  - `COMPLETED`: Session reached 0, audio chime and notification dispatched.
- **Minimum Duration Boundary:**
  - In `background.js` lines 2007-2013:
    ```js
    const rawMins = parseInt(durationMinutes, 10);
    const mins = (!isNaN(rawMins) && rawMins > 0) ? rawMins : defMins;
    ```
  - For `rawMins = 1`: `mins = 1`, `durationMs = 60,000`, `remainingSeconds = 60`.

### 2.2 Sleep Timer Subsystem Contracts
- **Storage Key:** `sentinel_sleep_timer`, `sentinel_sleep_settings`
- **IPC Message Type:** `SET_SLEEP_TIMER`, `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, `EXTEND_SLEEP_TIMER`, `CANCEL_SLEEP_TIMER`
- **State Space:**
  - `IDLE`: Inactive (`durationMinutes: 0`).
  - `RUNNING`: Timer counting down towards targetTime.
  - `PAUSED`: Timer paused, elapsed preserved.
  - `FADING`: Audio volume linearly attenuating (30 seconds before expiration).
  - `TRIGGERED`: Sleep alarm fired, media tabs paused/muted.
  - `CANCELLED`: Reset back to `IDLE`.
- **Minimum Duration Boundary:**
  - In `background.js` line 1556:
    ```js
    const mins = isNaN(rawMins) ? 30 : Math.max(1, Math.min(1440, rawMins));
    ```
  - Enforced minimum: **1 minute (60 seconds)**.
  - In `popup/popup.html` line 905: `<input type="number" id="customTimerInput" min="1" max="1440" ...>`

---

## 💻 3. Headed Automation Implementation Pattern

The automation harness can be orchestrated cleanly using a lightweight Node.js script `tests/qa_headed_interactive_verification.js`:

```javascript
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');

async function runHeadedVerification() {
  const extensionPath = path.resolve(__dirname, '..');
  const tempProfile = path.join(os.tmpdir(), `sentinel_qa_${Date.now()}`);

  console.log('🚀 Launching Google Chrome in HEADED mode...');
  const browserContext = await chromium.launchPersistentContext(tempProfile, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--start-maximized'
    ]
  });

  try {
    // 1. Detect background service worker & extension ID
    let [backgroundPage] = browserContext.serviceWorkers();
    if (!backgroundPage) {
      backgroundPage = await browserContext.waitForEvent('serviceworker', { timeout: 10000 });
    }
    const extensionId = backgroundPage.url().split('/')[2];
    console.log(`✅ Loaded Extension ID: ${extensionId}`);

    // 2. Open Dashboard
    const dashboardPage = await browserContext.newPage();
    await dashboardPage.goto(`chrome-extension://${extensionId}/dashboard/dashboard.html`);
    console.log('✅ Dashboard loaded successfully in visible headed window.');

    // 3. Test Focus Timer (1 min)
    // Navigate to Wellbeing tab
    await dashboardPage.click('#sidebarBtnWellbeing');
    await dashboardPage.waitForSelector('#widgetPomodoroSentinel');
    
    // Set 1-min duration via evaluate or UI
    await dashboardPage.evaluate(() => {
      chrome.runtime.sendMessage({ type: 'START_FOCUS_TIMER', durationMinutes: 1, mode: 'focus' });
    });
    console.log('⏱️ 1-Minute Focus Timer started. Observing live countdown...');
    await dashboardPage.waitForTimeout(5000); // Observe visible tick
    
    // 4. Test Sleep Timer (1 min)
    await dashboardPage.evaluate(() => {
      chrome.runtime.sendMessage({ type: 'SET_SLEEP_TIMER', durationMinutes: 1, options: { enableFadeOut: true } });
    });
    console.log('🌙 1-Minute Sleep Timer started. Observing live countdown...');
    await dashboardPage.waitForTimeout(5000); // Observe visible tick

    console.log('🎉 Live Headed Interactive Verification Complete!');
  } finally {
    await browserContext.close();
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (_) {}
  }
}
```

---

## 🔍 4. Verification Gates & Pass Criteria

1. **Window Visibility Gate:** Google Chrome launches on the visible display. Headless mode is strictly false.
2. **Focus Clock Gate:** `#pomodoroTimeDisplay` begins at `01:00` and decrements each second; pause/resume stops and resumes the clock.
3. **Sleep Clock Gate:** `#dashSleepCountdownDisplay` and `#countdownTimeRemaining` start at `01:00` and decrement; badge text shows active countdown.
4. **Master Regression Gate:** `node run_all_tests.js` passes all 83+ suites cleanly with exit code 0.
