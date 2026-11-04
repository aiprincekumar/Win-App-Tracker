# Phase 06 Execution Prompt: Comprehensive QA Verification & Master Release

> **Phase Number:** 06  
> **Phase Name:** Comprehensive QA Verification & Master Release  
> **Target Workspace:** `Video Detector/`  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Mandatory Anchor Directives:** First load and adhere to `C:\Users\Atul Verma\.gemini\config\rules\08_quality_assurance_testing_dept.md`, `10_application_security_infosec_dept.md`, `12_devops_build_release_dept.md`, and `C:\Users\Atul Verma\.gemini\memory.md` before executing instructions.  
> **Encoding Mandate:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created/edited files.  
> **Git Cadence:** Autonomous local micro-commit immediately upon completion under developer Atul Verma.  

---

## 🎯 1. Phase Objective & Executive Scope

Phase 06 conducts the final, exhaustive quality assurance audit, system stress testing, security sanitization, and release certification for the entire Windows Video-Only Inactivity Sentinel Enterprise Expansion:
1. **End-to-End Multi-Scenario Verification:** Execute unified integration suite testing all 15 enterprise features in concert.
2. **Resource Consumption & Zero-Hang Audit:** Verify CPU < 0.5%, RAM < 45 MB RSS, and sub-500ms clean exit across all execution modes.
3. **Security & Gitleaks Audit (Rule 15):** Execute `gitleaks detect --redact` to certify zero secret leakage across all commits.
4. **Documentation & Memory Synchronization (Rule 6 & 23):** Update `memory.md`, record entry in `changes_log/`, and certify 100% rules compliance (`npm run rules:check`).
5. **Interactive Remote Push Gatekeeper (Rule 15):** Present the mandatory 2-option interactive choice to the user before remote pushing.

---

## 📁 2. Impacted Modules & Target File Topology

- **Create:** `test_enterprise_expansion_suite.py` (Unified master end-to-end integration test suite).
- **Modify:** `README.md` (Update documentation to cover all 15 new features, hotkeys, web dashboard, and tray usage).
- **Modify:** `Run_Video_Idle_Detector.bat` (Update launcher menu with options: Terminal Mode, Background Tray Mode, Web Dashboard Mode).
- **Create:** `changes_log/entries/YYYY-MM-DD/change_video_sentinel_enterprise_expansion.md` (Rule 6 compliance).
- **Update:** `C:\Users\Atul Verma\.gemini\memory.md` (Rule 23 memory synchronization).

---

## 🛠️ 3. Detailed Step-by-Step Implementation Instructions

### Step 3.1: Master End-to-End Test Suite (`test_enterprise_expansion_suite.py`)
1. Create `test_enterprise_expansion_suite.py` containing automated assertions for:
   - Video classification accuracy (YouTube, Netflix, VLC video vs Spotify, MP3 pure audio).
   - Domain tagging and volume/mute telemetry extraction.
   - Fullscreen cinema vs windowed detection.
   - Power source (AC/Battery) and display lock inspection.
   - Auto-shutdown countdown trigger, visual progress bar, and abort hooks.
   - Multi-stream and ghost stream detection.
   - SQLite persistence and 24-hour heatmap calculation.
   - 1-click HTML export generation and file validity.
   - Web server REST endpoints and SSE telemetry broadcast.
   - System tray initialization and clean exit.

### Step 3.2: 24-Hour Stress & Memory Leak Audit
1. Run a 300-cycle fast telemetry burn loop simulating 5 hours of continuous operation:
   - Measure RSS memory delta: Must be < 2 MB delta (zero memory leaks).
   - Verify CPU time per tick: Average cycle latency must remain < 15ms.

### Step 3.3: Master Launcher Batch Script Update (`Run_Video_Idle_Detector.bat`)
1. Enhance `Run_Video_Idle_Detector.bat`:
   - Interactive menu:
     - `[1] Launch Interactive Terminal HUD (Recommended)`
     - `[2] Launch Background Daemon with System Tray`
     - `[3] Launch Web Dashboard on http://localhost:8765`
     - `[4] Generate 1-Click HTML Audit Report`
     - `[5] Run QA Verification Suite`
     - `[6] Exit`

### Step 3.4: Gitleaks Pre-Push Security Audit
1. Execute gitleaks audit:
   ```powershell
   gitleaks detect --redact --verbose
   ```
2. Verify zero leaks detected across the repository.

### Step 3.5: Memory Synchronization & Rules Integrity Check
1. Update `C:\Users\Atul Verma\.gemini\memory.md` under Section 1 Live Agent State:
   - Record completion of Video Sentinel Enterprise Expansion.
   - Record active stack, features verified, and git commit hash.
2. Run rules health check:
   ```bash
   npm run rules:check
   ```
   Confirm 0 errors and 100% integrity.

---

## 🧪 4. Final Verification & Sign-off Gate

Execute master test command:
```bash
python test_enterprise_expansion_suite.py
```
Ensure all test cases pass with green output (`ALL 15 ENTERPRISE FEATURES VERIFIED`).

---

## 🚀 5. Rule 15 Final Interactive Push Gatekeeper

1. Perform local git commit using developer identity Atul Verma:
   ```bash
   git add -A
   git commit -m "feat(release): certify Windows Video-Only Inactivity Sentinel Enterprise Expansion"
   ```
2. Immediately notify user with commit hash:
   `"हाँ, लोकल में कमिट हो चुका है [commit_hash]"`
3. Present the mandatory 2-option interactive prompt via `ask_question`:
   - Option 1: `(Recommended) GitHub पर कमिट चेंजेस पुश करना`
   - Option 2: `नहीं, अभी रहने दो क्योंकि टेस्टिंग पेंडिंग है`
