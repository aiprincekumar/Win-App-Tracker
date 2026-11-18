# Phase 01: Headed Chrome Environment & Extension Harness Setup

> **Task ID:** `TASK-E2E-HEADED-VERIFY-001`  
> **Phase:** 01 of 04  
> **Target Path:** `temp_prompt/e2e_headed_focus_sleep_verification/PHASE_01_HEADED_LAUNCH_AND_EXTENSION_LOAD.md`  
> **Lead Role:** Level 4 Automation Engineer  
> **Authorization Token:** Required (`AUTH-MGR-*`)  
> **Execution Strategy:** `STRATEGY_A_AUTONOMOUS`  
> **Environment Mode:** HEADED Visible Desktop Window

---

## 🎯 1. Phase Objective

Establish a robust, automated Playwright/Chrome runner script that launches a visible, non-headless Google Chrome browser window on the Windows desktop, loads the unpacked extension from `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`, detects the extension ID, and opens the Dashboard page.

---

## 📋 2. Prerequisites & Input Context

- **Chrome Binary:** `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Extension Manifest:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\manifest.json`
- **Playwright Package:** Available in Node environment
- **Ephemeral Profile Path:** Unique folder in OS temp directory to isolate session state

---

## 🔧 3. Surgical Step-by-Step Instructions

1. **Create Verification Runner Script:**
   - Author `tests/qa_headed_interactive_verification.js`.
   - Ensure the file begins with UTF-8 BOM (`\uFEFF`) and `'use strict';`.
   - Import `playwright`, `path`, `fs`, `os`.
2. **Configure Persistent Context in Headed Mode:**
   - Set `headless: false`.
   - Set `executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'`.
   - Pass CLI arguments:
     - `--disable-extensions-except=<extensionPath>`
     - `--load-extension=<extensionPath>`
     - `--no-first-run`
     - `--no-default-browser-check`
     - `--start-maximized`
3. **Resolve Extension Runtime ID:**
   - Listen for `serviceworker` event or inspect `browserContext.serviceWorkers()`.
   - Extract the generated extension ID from the service worker URL (`chrome-extension://<extensionId>/background.js`).
4. **Open and Verify Extension Dashboard:**
   - Open a new tab navigating to `chrome-extension://${extensionId}/dashboard/dashboard.html`.
   - Assert page title contains "Web Activity & Media Sentinel" or "Media Sentinel".
   - Confirm DOM ready state and absence of uncaught console errors.

---

## 🚫 4. Architectural Constraints & Boundaries

- **Zero Headless Execution:** Must NOT run with `--headless` or `headless: true`. The window must be physically visible to the user.
- **Zero Insecure innerHTML:** Automation script must not introduce `innerHTML` mutations.
- **Non-destructive Isolation:** Use an ephemeral temp profile; do not pollute user's default Chrome profile.

---

## 📦 5. Deliverables Manifest

- `tests/qa_headed_interactive_verification.js`: Complete executable headed test runner script.

---

## 🧪 6. Local Verification Gate

- Run: `node tests/qa_headed_interactive_verification.js`
- **Pass Criteria:**
  - Google Chrome launches visibly on screen.
  - Extension ID is logged to console.
  - Dashboard loads cleanly without errors.
  - Exit code 0.
