# Phase 3 Execution Prompt: Independent QA Verification Suite, Security Audit & Autonomous Git Push

> **Phase:** 3 of 3  
> **Workspace Container:** `temp_prompt/hardware_bridges_uiux_overhaul/`  
> **Assigned Role:** Level 4 QA Subagent  
> **Lead Departments:** Dept 08 QA & Testing, Dept 10 AppSec & InfoSec, Dept 12 DevOps, Build & Release  
> **Authorization State:** REQUIRES_AUTH_MGR_TOKEN  

---

## 🎯 Phase Objective
Author and execute a dedicated automated test suite (`tests/test_hardware_bridges_uiux.js`) with 8 rigorous batteries verifying the overhauled Hardware Bridges card. Run the complete regression suite (`node run_all_tests.js`) across all 45 test files, audit W3C Trusted Types (0 innerHTML mutations), verify 100% UTF-8 with BOM compliance, execute secret scan via `gitleaks detect --redact`, and autonomously perform local micro-commit and GitHub push online per Universal Rule 15 with 3-point terminal verification proof.

---

## 📂 File Anchors & Prerequisites
- **Target Files:**
  - `tests/test_hardware_bridges_uiux.js` (New test file)
  - `run_all_tests.js`
  - All modified files from Phase 1 and Phase 2
- **Pre-execution Verification:** All Phase 1 and Phase 2 modifications must be complete and syntactically clean.

---

## 🛠️ Step-by-Step Instructions

### Step 1: Author `tests/test_hardware_bridges_uiux.js`
Structure the test suite with 8 deterministic batteries:
1. **Battery 1: Static HTML Architecture & DOM ID Verification:**
   - Verify `#cardHardwareBridges`, `#headingHardwareBridges`, `#subHardwareBridges`.
   - Verify `#rowBridgeHub`, `#nameBridgeHub`, `#portBridgeHub`, `#bridgeHubStatusBadge`, `#bridgeHubStatusDot`, `#bridgeHubStatusText`, `#descBridgeHub`, `#btnSidebarReconnectHub`.
   - Verify `#rowBridgeHud`, `#nameBridgeHud`, `#portBridgeHud`, `#bridgeHudStatusBadge`, `#bridgeHudStatusDot`, `#bridgeHudStatusText`, `#descBridgeHud`, `#btnSidebarReconnect`.
2. **Battery 2: CSS Token Cascade & Liquid Glass 2.0 Aesthetics:**
   - Verify classes `.bridge-status-pill`, `.bridge-status-dot`, `.btn-bridge-action`, `.bridge-port-badge`.
   - Verify animations `@keyframes bridgeDotPulse` and `@keyframes bridgeDotBlink`.
3. **Battery 3: Multi-Theme Contrast & WCAG AAA Verification:**
   - Verify text contrast ratios exceed 7.0:1 on all 4 theme substrates.
4. **Battery 4: JavaScript AST Parsing & Zero-Error Compilation:**
   - Parse `dashboard/dashboard.js`, `src/popup/components/header_badges.js`, and `tests/test_hardware_bridges_uiux.js` using `new vm.Script()`.
5. **Battery 5: Real-time Telemetry State Machine Simulation (Mock DOM):**
   - Execute mock DOM state transitions (`online`, `starting`, `offline`), verifying class names, text content, and ARIA updates.
6. **Battery 6: Bilingual i18n Symmetry Verification:**
   - Verify all hardware bridge keys in `DASHBOARD_UIUX_I18N` have 100% symmetrical `en` and `hi` translations.
7. **Battery 7: W3C Trusted Types & Zero-innerHTML Security Audit:**
   - Verify zero `.innerHTML` assignments in all modified functions.
   - Verify zero inline event handlers (`onclick`, etc.) in `dashboard/dashboard.html`.
8. **Battery 8: UTF-8 BOM Certification:**
   - Verify `0xEF, 0xBB, 0xBF` byte sequence on all touched files and the test suite.

### Step 2: Execute Complete Test Suite
Run `node run_all_tests.js` and verify all 45 test files PASS cleanly with exit code 0.

### Step 3: Security & Secret Scan
Execute `gitleaks detect --redact` across the repository to certify 0 secret leaks.

### Step 4: Autonomous Git Local Commit & Remote Push (Rule 15)
1. Execute `git add -A` and local commit with conventional commit message:
   `feat(dashboard): overhaul local services & hardware bridges telemetry UI/UX with liquid glass 2.0`
2. Autonomously verify upstream online status (`git ls-remote --exit-code origin`).
3. Push online to GitHub `origin/main`.
4. Capture 3-point terminal verification proof:
   - Point 1: `git log -1` commit hash
   - Point 2: `git push` output
   - Point 3: `git status` clean working tree

---

## 🧪 Local Verification Gate
- [ ] `node tests/test_hardware_bridges_uiux.js` exits with code 0 (8/8 batteries PASS).
- [ ] `node run_all_tests.js` exits with code 0 (45/45 suites PASS).
- [ ] `gitleaks detect --redact` reports 0 leaks.
- [ ] 3-point terminal verification proof certified.
