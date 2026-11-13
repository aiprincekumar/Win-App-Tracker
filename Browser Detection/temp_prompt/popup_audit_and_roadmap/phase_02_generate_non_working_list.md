# Phase 2 Execution Prompt: Generation of File 1 (popup_non_working_functions.md)

> **Phase Name:** Phase 2 - Generation of File 1 (`popup_non_working_functions.md`)  
> **Target Subsystem:** User-Facing Defect & Stub Inventory Documentation  
> **Workspace Container:** `temp_prompt/popup_audit_and_roadmap/`  
> **Assigned Agent Role:** Sub Agent (Technical Documentation Writer)  
> **Authorization Token:** Required (`AUTH-MGR-*`)  

---

## 🎯 1. Phase Objective
Generate **File 1 (`popup_non_working_functions.md`)** directly in the workspace root (`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup_non_working_functions.md`).
This file must be a simple, easy-to-read, comprehensive markdown document that lists every broken, non-working, stubbed, or partially functional feature in Popup Mode, written with bilingual accessibility (English & Hindi summaries) per user request.

---

## 📋 2. Prerequisites & Inputs
- Findings from Phase 1 Deep Audit.
- Architecture specification from `TRD.md` and `INDEX.md`.
- Target output path: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup_non_working_functions.md`.

---

## 🔍 3. Required Document Structure for File 1

The generated `popup_non_working_functions.md` must adhere to the following schema:

1. **Title & Document Header:**
   - Clear title: `Web Activity & Media Sentinel - Popup Mode: Non-Working & Stubbed Functions Inventory`
   - Executive bilingual summary (Hindi explanation matching user prompt + English summary).

2. **Executive Summary Table:**
   - High-level counts: Total Features Audited, Fully Working, Partially Working, Non-Working / Stubs.

3. **Detailed Breakdown by Subsystem / Tab:**
   For each tab containing non-working or stubbed features:
   - **Tab 2: Audio Lab (Complete Audio Pipeline Missing):**
     - Master Volume Boost (0% - 200%) (`#audioMasterBoostSlider`)
     - Audio-Only Mode (`#toggleAudioOnlyMode`)
     - 5-Band Graphic Equalizer (`#eqBand60`..`#eqBand16000`)
     - Equalizer Presets (`#audioEqPresetSelect`)
     - Vocal Clarity (`#toggleVocalClarity`)
     - Night Listening Shield (`#toggleNightShield`)
   - **Tab 3: Tools & Automations (Background Hooks Missing):**
     - Auto-Pause on New Tab (`#toggleAutoPauseNewTab`)
     - Auto Ad Silencer (`#toggleAutoAdSilencer`)
     - Domain Speed Memory (`#toggleDomainSpeedMemory`)
     - Video Screenshot Tab Targeting (`#btnCardScreenshot`)
   - **Tab 4: Studio / Vault (Session Revival Defect):**
     - Resume Last Media (`#btnStudioResumePlayback`) - Fails on closed tabs.
   - **Tab 5: Tracking & Wellness (Background Alarm Missing):**
     - Doomscroll Breaker (`#toggleDoomscrollBreaker`, `#selectDoomscrollInterval`)
   - **Quick Settings Popover (Configuration Gaps):**
     - Default Active Tab (`#selectDefaultTab`) - Never applies on popup open.
     - Auto-Sync Interval (`#selectSyncInterval`) - Hardcoded `setInterval` never updates.
     - Notification Sound (`#toggleNotificationSound`) - No audio chime exists.
     - High Contrast Mode (`#toggleHighContrast`) - Missing CSS styles.
   - **Header & Connectivity:**
     - SQLite Data Hub Badge (`#hubStatusBadge`) - Offline handling & launcher path when daemon is down.

4. **Detailed Feature Cards (For Each Broken/Stubbed Item):**
   - **Feature Name & DOM ID**
   - **Current Behavior (What happens right now):** (e.g., "Slider moves and value is saved to storage, but volume on the video does not change.")
   - **Intended Behavior (What it should do):** (e.g., "Amplify audio up to 200% using Web Audio API GainNode.")
   - **Technical Root Cause:** (e.g., "Missing Web Audio API / Offscreen tab capture connection.")
   - **Severity / User Impact:** `High` / `Medium` / `Low`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. Create `popup_non_working_functions.md` with UTF-8 BOM (`\uFEFF`) in workspace root.
2. Populate all sections using clear markdown formatting, alert callouts, and structured tables.
3. Include an introductory section in Hindi explaining the purpose of the file:
   *"यह फ़ाइल पॉपअप मोड (Popup Mode) में उन सभी फ़ंक्शन्स और फीचर्स की विस्तृत सूची है जो वर्तमान में काम नहीं कर रहे हैं, अधूरे हैं, या केवल यूआई डमी (UI Stubs) के रूप में मौजूद हैं..."*
4. Ensure line anchors and exact element selectors match `popup/popup.html` and `popup/popup.js`.

---

## 📦 5. Deliverables Manifest
- Created file: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup_non_working_functions.md`.

---

## 🧪 6. Local Verification Gate
- File exists on disk.
- File size > 5 KB with complete coverage of all 14 audited stubs.
- UTF-8 with BOM verified.
