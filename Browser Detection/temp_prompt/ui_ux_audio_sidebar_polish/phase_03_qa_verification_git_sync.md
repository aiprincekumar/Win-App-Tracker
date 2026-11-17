# Phase 3 Instruction Set: Independent QA Verification, Security Audit & Autonomous Git Push

> **Phase:** 3 of 3  
> **Target Subagent Role:** Level 4 Independent QA Subagent & Release Engineer  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Phase Prompt File:** `temp_prompt/ui_ux_audio_sidebar_polish/phase_03_qa_verification_git_sync.md`  
> **Lead Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md) & Universal Rules 12, 15, 16  
> **Target Autonomy Score:** 1.0 (Autonomous Execution)  

---

## 🎯 1. Phase Objective

The objective of Phase 3 is to provide rigorous, independent verification across all 44 test suites, validate W3C Trusted Types compliance, certify 100% UTF-8 with BOM encoding purity, execute a zero-tolerance `gitleaks` security scan, and autonomously execute a local micro-commit and GitHub push online per Universal Rule 15 with 3-point terminal proof.

---

## 📋 2. Prerequisites & Required Inputs

- Successful completion of Phase 1 (`phase_01_css_embedding_eq_audiolab.md`) and Phase 2 (`phase_02_sidebar_status_settings_bridge.md`).
- Primary verification targets:
  1. [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)
  2. [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)
  3. [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
  4. [`dashboard/styles/audio_lab.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/audio_lab.css)
  5. [`dashboard/styles/settings.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/settings.css)
  6. [`dashboard/styles/layout/header_sidebar.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout/header_sidebar.css)

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 3.1: Execute Full Regression Test Suite
Execute all 44 test suites using the workspace test orchestrator:

```powershell
node run_all_tests.js
```

**Certification Gate:**
- Must output `TEST SUITE SUMMARY: 44 PASSED, 0 FAILED`.
- Exit code must be `0`.
- Zero timeouts, zero unhandled rejections, zero AST errors.

### Step 3.2: Verify W3C Trusted Types & DOM Safety
Audit all modified files for illegal inline handlers and unsafe DOM writes:

```powershell
# Verify zero innerHTML assignments
Get-ChildItem -Path "dashboard/dashboard.html","dashboard/dashboard.css","dashboard/styles/audio_lab.css","dashboard/styles/settings.css","dashboard/styles/layout/header_sidebar.css" | Select-String -Pattern "\.innerHTML"

# Verify zero inline onclick/onchange/oninput in dashboard.html
Select-String -Path "dashboard/dashboard.html" -Pattern "onclick=|onchange=|oninput=|javascript:"
```

**Certification Gate:**
- Zero matches returned.

### Step 3.3: Verify UTF-8 with BOM Standard
Ensure all modified files have the mandatory UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) header per Universal Rules 5 and 8:

```powershell
$targetFiles = @(
  "dashboard/dashboard.html",
  "dashboard/dashboard.css",
  "dashboard/styles/audio_lab.css",
  "dashboard/styles/settings.css",
  "dashboard/styles/layout/header_sidebar.css"
)

foreach ($f in $targetFiles) {
  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $f).Path)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "✅ BOM Certified: $f"
  } else {
    Write-Error "❌ Missing BOM: $f"
  }
}
```

### Step 3.4: Gitleaks Pre-Commit / Pre-Push Secret Audit
Perform a secret audit scanning all uncommitted changes and repository history:

```powershell
gitleaks detect --redact -v
```

**Certification Gate:**
- Output must conclude with `0 leaks detected`.

### Step 3.5: Rule 15 Autonomous Git Micro-Commit & GitHub Push
Apply Universal Rule 15 Autonomous Push Intelligence:
1. Verify online upstream existence:
   ```powershell
   git ls-remote --exit-code origin
   ```
2. Stage modified files and perform local micro-commit:
   ```powershell
   git add dashboard/dashboard.html dashboard/dashboard.css dashboard/styles/audio_lab.css dashboard/styles/settings.css dashboard/styles/layout/header_sidebar.css temp_prompt/
   git commit -m "feat(ui): link modular css, polish 5-band eq, audio lab & haptics, and shift reconnect to settings"
   ```
3. Evaluate change magnitude:
   - Change affects 5+ files across HTML, CSS, modular styles, and prompt architecture.
   - Classification: **Significant / Major Change (>= 3 files)**.
   - Action: **Autonomously push to GitHub online (`origin/main`)** without interrupting the user.
4. Push to remote repository:
   ```powershell
   git push origin main
   ```
5. Capture and log **3-Point Terminal Verification Proof**:
   - Point 1: `git log -1` (commit hash, author Atul Verma, commit message).
   - Point 2: `git push` (remote response, object transfer confirmation).
   - Point 3: `git status` (clean working tree confirmation).

---

## 🚦 4. Verification Gate & Signoff Criteria

The independent QA subagent must certify:
- [ ] 44/44 test suites passed with exit code 0.
- [ ] Zero `.innerHTML` or inline event handlers detected.
- [ ] 100% UTF-8 with BOM verified across all touched files.
- [ ] Gitleaks secret scan certified 0 leaks.
- [ ] Local commit and remote push confirmed with 3-point terminal proof.
