# Phase 4 Execution Instruction: Independent QA Verification & Regression Testing

> **Phase Number:** 04  
> **Phase Name:** Independent QA Verification & Regression Testing  
> **Workspace Container:** `temp_prompt/light_mode_visibility_contrast_fix/`  
> **Target Subsystems:** Full Repository Verification (`tests/`, `dashboard/styles/`, `dashboard/dashboard.css`)  
> **Target Files:**
> - `tests/test_light_mode_contrast_and_visibility.js`
> - `run_all_tests.js`  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Prerequisites:** Successful completion of Phases 1, 2, and 3; Active Authorization Token `AUTH-MGR-*`  

---

## 🎯 1. Phase Objective

Perform independent, exhaustive verification and quality certification across:
1. **Dedicated Verification Suite (`tests/test_light_mode_contrast_and_visibility.js`):** Author a multi-battery test script that independently asserts the presence, validity, and specificity of Light Mode rules across all 10 bug items.
2. **WCAG 2.1 Contrast Ratio Verification:** Programmatically verify relative luminance and contrast ratios $\ge 7:1$ (AAA) for normal text and $\ge 4.5:1$ (AA) for accents.
3. **Dark Mode Zero-Mutation Invariant Certification:** Rigorously verify that no Dark Mode rules, selectors, or token values were mutated or broken.
4. **Master Test Runner Execution:** Execute `node run_all_tests.js` to ensure 100% of existing test suites (105+ suites) pass cleanly with zero failures and Exit Code 0.
5. **Security & Encoding Gates:** Verify 100% UTF-8 with BOM on all touched files and certify zero credentials/leaks via `gitleaks detect --redact`.

---

## 🧪 2. Dedicated Standalone Test Battery Roster

The standalone test suite `tests/test_light_mode_contrast_and_visibility.js` must implement 8 rigorous test batteries:

- **Battery 1: Table Headers Contrast Audit:**
  - Validates `body.theme-light .modern-data-table th` and `[data-theme="light"] .modern-data-table th`.
  - Asserts background `#f1f5f9`, color `#1e293b`, and bottom border.
- **Battery 2: Audio Visualizer Controls & Buttons:**
  - Validates `body.theme-light .btn-viz-action-icon`, `.viz-btn-segmented`, `.btn-viz-drawer-close`.
  - Asserts translucent light background and dark icons (`#334155` / `#0f172a`).
- **Battery 3: Media Playback & Volume Toolbar:**
  - Validates `body.theme-light .btn-ctrl-hero` and hover states.
  - Asserts that text color on hover is `#0f172a` (never `#fff`).
- **Battery 4: Hub Presets (Sleep & Focus Sentinel):**
  - Validates `.dash-sleep-preset-btn` and `.dash-focus-preset-btn` in light mode.
  - Asserts `#1e293b` text color and high-contrast active accents.
- **Battery 5: Ambient Soundscapes & Power-Nap Banner:**
  - Validates `.sleep-soundscape-panel`, `.focus-soundscape-panel`, and `.sleep-power-nap-banner`.
  - Asserts title `#1e1b4b`, description `#475569`, and button `#6366f1`.
- **Battery 6: Sleep Cutoff Toggles & Selects:**
  - Validates `.dash-sleep-toggle-row`, `.toggle-title`, and `.dash-sleep-select-sm`.
  - Asserts white card background and dark titles `#0f172a`.
- **Battery 7: Settings, Blacklist & Danger Zone:**
  - Validates `.blacklist-chips-grid`, `.settings-card.danger-card`, `.warning-text` (`#991b1b`), and `.export-tile`.
- **Battery 8: Dark Mode Zero-Mutation Invariant & Contrast Mathematics:**
  - Computes W3C relative luminance and contrast ratios for all 10 component tokens.
  - Asserts that dark mode rules in `themes.css` (`body.theme-dark`) retain `--bg-deep: #080b11;` and remain 100% intact.

---

## 🛠️ 3. Execution Commands & Quality Gates

### Gate 1: Standalone Suite Execution
```powershell
node tests/test_light_mode_contrast_and_visibility.js
```
*Criteria:* 8/8 batteries PASS with 0 failures, Exit Code 0.

### Gate 2: Master Test Runner Execution
```powershell
node run_all_tests.js
```
*Criteria:* 105+ test suites PASS with 0 failures, Exit Code 0.

### Gate 3: UTF-8 with BOM Verification
```powershell
powershell -Command "
Get-ChildItem -Path 'dashboard/styles/*.css', 'dashboard/styles/media/*.css', 'tests/test_light_mode_contrast_and_visibility.js' | ForEach-Object {
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host ('[BOM PASS] ' + $_.Name) -ForegroundColor Green
    } else {
        Write-Host ('[BOM FAIL] ' + $_.Name) -ForegroundColor Red
    }
}
"
```

### Gate 4: Secret Audit (Gitleaks)
```powershell
gitleaks detect --redact
```
*Criteria:* 0 leaks detected.

---

## 📦 4. Deliverables Manifest

1. `tests/test_light_mode_contrast_and_visibility.js`: Comprehensive 8-battery standalone test suite.
2. Verified test pass reports with raw terminal output and exit code 0.
3. Grade A+ QA sign-off certification report to the Level 2 Manager.
