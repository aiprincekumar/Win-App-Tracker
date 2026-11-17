# Phase 3: QA Verification & Test Suite Parity

> **Phase:** 03  
> **Target Task ID:** `TASK-EQ-PURE-SPLIT-CONTAINERS-001`  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Workspace Container:** `temp_prompt/equalizer_pure_split_containers/`  
> **Primary Target:** `tests/test_equalizer_layout_separation_phase1_2.js`, `tests/test_dashboard_full_audio_lab_parity.js`, `tests/test_visualizer_separation_qa_parity.js`  
> **System Gate:** `node run_all_tests.js` (50 test suites)

---

## 🎯 1. Phase Objective

Perform comprehensive end-to-end verification and test suite adaptation for the pure separate sibling container architecture:
1. Update existing test assertions that previously looked for `.audio-eq-split-deck` or `bento-span-12` on `#heroAudioEqCard` so that they validate the new architecture:
   - `#heroAudioEqCard` as an independent Bento card (`bento-span-6`).
   - `#heroAudioLabCard` as an independent Bento card (`bento-span-6`).
   - Pure sibling relationship between `#heroAudioEqCard` and `#heroAudioLabCard` (neither nested inside the other, zero shared wrapper div).
2. Execute the entire 50-suite test battery (`node run_all_tests.js`) and certify 100% pass rate with exit code 0.
3. Validate W3C Trusted Types, UTF-8 BOM encoding, and run secret detection audit (`gitleaks detect --redact`).

---

## 📋 2. Target Test Files & Required Assertions

### 2.1 `tests/test_equalizer_layout_separation_phase1_2.js`
- **Current:** Checked `assert(html.includes('class="audio-eq-split-deck"'))`.
- **Target Update:**
  ```javascript
  // Verify two pure separate sibling cards exist in dashboard.html
  assert(html.includes('id="heroAudioEqCard"'), 'Must contain dedicated #heroAudioEqCard');
  assert(html.includes('id="heroAudioLabCard"'), 'Must contain dedicated #heroAudioLabCard');
  assert(html.includes('class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-6"') ||
         html.match(/id="heroAudioEqCard"[^>]*bento-span-6/),
         '#heroAudioEqCard must declare bento-span-6');
  assert(html.includes('class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-6"') ||
         html.match(/id="heroAudioLabCard"[^>]*bento-span-6/),
         '#heroAudioLabCard must declare bento-span-6');

  // Verify pure physical separation (neither nested inside the other)
  const eqCardHtml = html.match(/<div[^>]*id="heroAudioEqCard"[\s\S]*?<\/div>\s*<!-- Bento Card 2/);
  assert(!html.match(/<div[^>]*id="heroAudioEqCard"[\s\S]*?id="heroAudioLabCard"/),
         '#heroAudioLabCard must NOT be nested inside #heroAudioEqCard');
  assert(!html.match(/<div[^>]*id="heroAudioLabCard"[\s\S]*?id="heroAudioEqCard"/),
         '#heroAudioEqCard must NOT be nested inside #heroAudioLabCard');
  ```

### 2.2 `tests/test_dashboard_full_audio_lab_parity.js`
- **Current:** Line 529 checked `id="heroAudioEqCard" class="... bento-span-12"`.
- **Target Update:** Update to check that `#heroAudioEqCard` and `#heroAudioLabCard` declare `bento-span-6` for side-by-side modular layout, and both cards contain zero inline event handlers or scripts.

### 2.3 `tests/test_visualizer_separation_qa_parity.js`
- **Current:** Checked `bento-span-12` for `#heroAudioEqCard`.
- **Target Update:** Update assertion to allow `bento-span-6` as the card now occupies 6 columns alongside its sibling `#heroAudioLabCard`.

### 2.4 `tests/test_dashboard_uiux_phase1.js`
- Update any assertions checking for `bento-span-12` on `#heroAudioEqCard` to accept `bento-span-6`.

---

## 🛠️ 3. Verification Protocol & Execution Steps

### Step 3.1: Syntax & Linter Gate
```powershell
node -c dashboard/dashboard.js
node -c tests/test_equalizer_layout_separation_phase1_2.js
node -c tests/test_dashboard_full_audio_lab_parity.js
```

### Step 3.2: Targeted Unit Tests
```powershell
node tests/test_equalizer_layout_separation_phase1_2.js
node tests/test_dashboard_full_audio_lab_parity.js
node tests/test_visualizer_separation_qa_parity.js
```

### Step 3.3: Global Test Battery Execution
```powershell
node run_all_tests.js
```
Must produce:
```
============================================================
TEST SUMMARY: 50/50 test suites passed cleanly.
Exit code: 0
============================================================
```

### Step 3.4: W3C Trusted Types & Security Audit
Verify zero occurrences of `.innerHTML` or `.outerHTML` across modified files:
```powershell
Select-String -Path "dashboard/dashboard.html", "dashboard/dashboard.js" -Pattern "\.innerHTML|\.outerHTML"
```
Must return zero matches.

### Step 3.5: UTF-8 with BOM Verification
Verify all modified files start with `0xEF, 0xBB, 0xBF`.

### Step 3.6: Pre-Commit Secret Audit
```powershell
gitleaks detect --redact
```
Must return zero detected leaks.

---

## 🛡️ 4. Completion & Signoff Criteria (Grade A+)

- [ ] All 50 test suites pass with 100% green checkmarks (`node run_all_tests.js`).
- [ ] Two pure separate sibling Bento cards verified (`#heroAudioEqCard` and `#heroAudioLabCard`).
- [ ] No outer wrapper div enclosing both components.
- [ ] All 18 DOM IDs present and reactive.
- [ ] Responsive side-by-side layout on desktop, clean vertical stack on <=1024px.
- [ ] Zero Trusted Types violations.
- [ ] Zero Gitleaks secret alerts.
- [ ] Formal Grade A+ signoff issued to Level 2 Manager.
