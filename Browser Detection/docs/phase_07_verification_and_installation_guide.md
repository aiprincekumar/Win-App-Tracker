# Phase 07: Extension Packaging, Verification & Installation Guide

> **Phase ID:** `phase_07_verification_and_installation_guide`  
> **Parent Task:** `browser_detection_extension_v1`  
> **Department:** Department 08: Quality Assurance & Department 12: DevOps, Build & Release  
> **Assigned Role:** `qa_and_release_specialist`  
> **Status:** Ready for Execution  

---

## 1. Objective & Scope

Create the definitive production release documentation, packaging verification scripts, and step-by-step unpacked installation instructions for Google Chrome and Microsoft Edge inside:
`Browser Detection/README.md`

Execute automated verification tests covering JSON validity, JavaScript syntax, WebSocket loopback, and UI rendering to earn a certified **Grade A+**.

---

## 2. Installation Guide Specification (Chrome & Edge Unpacked Mode)

### 2.1 Google Chrome / Brave / Opera Installation:
1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in the address bar.
3. Toggle **"Developer mode"** ON in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left toolbar.
5. In the folder picker dialog, select the directory:
   `Browser Detection`
6. Click **"Select Folder"**.
7. The extension **"Web Activity & Media Sentinel"** will immediately appear in your extensions list.
8. Click the Extensions puzzle piece icon on your toolbar and **Pin** the Sentinel icon for easy 1-click access.

### 2.2 Microsoft Edge Installation:
1. Open Microsoft Edge.
2. Navigate to `edge://extensions/` in the address bar.
3. In the left sidebar, toggle **"Developer mode"** ON.
4. Click the **"Load unpacked"** button at the top.
5. Select the `Browser Detection` folder and click **"Select Folder"**.
6. Pin the extension to the Edge toolbar.

### 2.3 Starting the Python WebSocket Host Bridge:
1. Ensure `Video Detector HUD` is launched (via `Run_Video_Detector_HUD.bat`).
2. The HUD automatically initiates the WebSocket server on `ws://127.0.0.1:65432`.
3. Open the extension popup; the status indicator will show a green dot: `HUD Connected (65432)`.

---

## 3. Automated Quality Verification Gates

### Gate 1: Manifest & JSON Integrity
- Validate `manifest.json` schema: Version 3, permissions, content scripts, background worker.
- Command: `node -e "JSON.parse(fs.readFileSync('Browser Detection/manifest.json'))"`

### Gate 2: JavaScript Syntax & Module Validation
- Validate syntax of `background.js`, `content_media.js`, and `popup/popup.js`.
- Command: `node -c "Browser Detection/background.js"` etc.

### Gate 3: Python WebSocket RFC 6455 Loopback Test
- Execute automated loopback unit test in `modules/browser_ws_server.py`.
- Command: `python -m modules.browser_ws_server --test`
- Asserts: Handshake success, message transmission, frame unmasking, and state caching.

### Gate 4: Zero UTF-8 Mojibake Standard
- Ensure all files are strictly UTF-8 with BOM standard.

---

## 4. Final Signoff Deliverables

Upon meeting all acceptance criteria:
- [ ] Complete extension located in `Browser Detection/`.
- [ ] Python server located in `modules/browser_ws_server.py`.
- [ ] All 7 Phase Prompts indexed in `temp_prompt/browser_detection/INDEX.md`.
- [ ] Mirrored copy maintained in `Browser Detection/docs/`.
- [ ] Grade A+ QA signoff recorded.
