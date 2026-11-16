# Phase 3 Instruction Prompt: QA Verification, Test Modernization & Grade A+ Certification

> **Phase Identifier:** `phase_03_qa_verification_test_parity`  
> **Target Subagent Role:** Level 4 QA Verification Tester (`QA Verification Tester` / `Test Engineer`)  
> **Model Tier:** `flash` (per Universal Rule 25)  
> **Workspace Container:** `temp_prompt/bento_equalizer_card_refinement/`  
> **Target Files:**  
> - [`tests/test_dashboard_full_audio_lab_parity.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_dashboard_full_audio_lab_parity.js)  
> - [`tests/test_dashboard_uiux_phase1.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_dashboard_uiux_phase1.js)  
> - [`tests/test_dashboard_theme_and_a11y_verification.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_dashboard_theme_and_a11y_verification.js)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Status:** Ready for Execution Authorization  

---

## 🎯 1. Phase Objective

Perform comprehensive end-to-end quality assurance, modernize test battery assertions to explicitly certify the dedicated **5-Band Graphic Equalizer Studio Deck** (`#heroAudioEqCard`) alongside the **Audio Lab Widget** (`#heroAudioLabStatus`), verify WCAG 2.1 AA/AAA contrast ratios and keyboard accessibility, ensure 100% W3C Trusted Types & strict CSP compliance, run pre-commit secret scanning via `gitleaks`, and deliver Grade A+ verification proof with raw terminal logs.

---

## 📋 2. Prerequisites & Environment State

- Phase 1 (DOM restructuring in `dashboard/dashboard.html`) and Phase 2 (CSS styling in `dashboard/dashboard.css`) completed.
- Test runner: Node.js (v18+) in Windows PowerShell.
- Authorization: Level 2 Manager Token `AUTH-MGR-*`.

---

## 🔍 3. Technical Context & Test File Anchors

1. **`tests/test_dashboard_full_audio_lab_parity.js`:**
   - Battery 2 (lines 58–123): Asserts all interactive controls, sliders, and badges exist.
   - Battery 11 (lines 476–505): W3C Trusted Types & CSP zero-innerHTML security audit. Currently audits `#heroAudioLabStatus`. Extend to audit both `#heroAudioLabStatus` and `#heroAudioEqCard`.
2. **`tests/test_dashboard_uiux_phase1.js`:**
   - Battery 6 (lines 167–195): Bento Grid Architecture. Ensure assertion certifies `#heroAudioEqCard` as a verified Bento Liquid Glass Card (`.bento-card`, `.liquid-glass-card`, `.audio-eq-widget`).
3. **`tests/test_dashboard_theme_and_a11y_verification.js`:**
   - Battery 3: Luminance & Contrast ratios.
   - Battery 4 & 5: ARIA roles, tabindex, and keyboard slider keydown simulation.
   - Battery 6: Storage hydration.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: Modernize `tests/test_dashboard_full_audio_lab_parity.js`
In `tests/test_dashboard_full_audio_lab_parity.js`:
1. In **Battery 2**, add explicit presence assertions for the dedicated `#heroAudioEqCard`:
   ```javascript
   assert(html.includes('id="heroAudioEqCard"'), 'dashboard.html must contain dedicated #heroAudioEqCard');
   ```
2. In **Battery 11**, extend container security audit to verify `#heroAudioEqCard` contains zero script tags, zero inline event handlers, and zero `javascript:` URIs:
   ```javascript
   // Audit #heroAudioEqCard for zero inline handlers
   const eqWidgetMatch = html.match(/<div[^>]*id="heroAudioEqCard"[\s\S]*?<\/div>\s*<\/div>/);
   assert(eqWidgetMatch, '#heroAudioEqCard container must exist in dashboard.html');
   const eqWidgetHtml = eqWidgetMatch[0];
   assert(!eqWidgetHtml.includes('<script'), '#heroAudioEqCard must not contain script tags');
   assert(!eqWidgetHtml.includes('javascript:'), '#heroAudioEqCard must not contain javascript: URLs');
   assert(!eqWidgetHtml.includes('onclick='), '#heroAudioEqCard must not contain onclick handlers');
   assert(!eqWidgetHtml.includes('onchange='), '#heroAudioEqCard must not contain onchange handlers');
   assert(!eqWidgetHtml.includes('oninput='), '#heroAudioEqCard must not contain oninput handlers');
   ```

### Step 3.2: Modernize `tests/test_dashboard_uiux_phase1.js`
In `tests/test_dashboard_uiux_phase1.js`:
1. In **Battery 6**, assert that `#heroAudioEqCard` declares `.bento-card` and `.liquid-glass-card`:
   ```javascript
   assert(
     html.includes('id="heroAudioEqCard"') &&
     html.includes('audio-eq-widget glass-card bento-card liquid-glass-card'),
     '#heroAudioEqCard must declare .bento-card and .liquid-glass-card'
   );
   ```

### Step 3.3: Execute Full Workspace Test Suite
Run the primary and regression test suites in PowerShell:
```powershell
node tests/test_dashboard_full_audio_lab_parity.js
node tests/test_unified_timeline_scrubber.js
node tests/test_dashboard_theme_and_a11y_verification.js
node tests/test_dashboard_uiux_phase1.js
node tests/test_four_pillar_hub_ui.js
```

### Step 3.4: Verify UTF-8 BOM Standard on All Target Files
Verify that all modified files begin with the UTF-8 BOM byte sequence (`0xEF, 0xBB, 0xBF`):
- `dashboard/dashboard.html`
- `dashboard/dashboard.css`
- `tests/test_dashboard_full_audio_lab_parity.js`
- `tests/test_dashboard_uiux_phase1.js`

### Step 3.5: Execute Gitleaks Secret Audit
Run the mandatory secret scan to confirm zero credential leaks:
```powershell
gitleaks detect --redact
```
**Required Result:** `0 leaks detected`.

---

## 🚫 5. Architectural Constraints & Boundaries

- No test assertions for existing features may be relaxed, removed, or commented out.
- The test suite must complete execution with 100% pass rate and exit code 0.

---

## 📦 6. Deliverables Manifest

- Modernized: `tests/test_dashboard_full_audio_lab_parity.js`
- Modernized: `tests/test_dashboard_uiux_phase1.js`
- Test Output: Raw terminal logs demonstrating 100% pass rate.
- Security Output: Raw `gitleaks` clean report.

---

## 🧪 7. Independent QA Verification Gate

The independent QA subagent must confirm:
1. `tests/test_dashboard_full_audio_lab_parity.js` passes all 11 batteries.
2. `tests/test_dashboard_theme_and_a11y_verification.js` passes all 8 batteries.
3. `tests/test_dashboard_uiux_phase1.js` passes all 8 batteries.
4. `tests/test_unified_timeline_scrubber.js` passes all 5 batteries.
5. Exit code is 0 across all runs.
