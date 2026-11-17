# Phase 3 Execution Prompt: Automated Regression Test Battery & Full Suite Verification
# Task: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Execution Directive for Level 4 QA Verification Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 08 QA & Testing Governance.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Zero-Skip Gate:** Pass 100% test suites with raw exit code 0.

---

## 🎯 1. Phase Objective

Author and execute a dedicated automated test suite `tests/test_visualizer_inner_content_expansion.js` and verify zero regressions across all 57+ repository suites:
1. **Test 1: UTF-8 with BOM Standard Audit** on all touched files.
2. **Test 2: Outer Bounds Hard Lock Invariant** (verifying `#heroAudioLabStatus` retains `bento-span-4 bento-row-span-2` and outer `min-height: 380px` is not inflated).
3. **Test 3: Inner Flexbox Expansion Engine** (verifying `.visualizer-card-body`, `.visualizer-panel`, and `.visualizer-canvas-container` possess `flex: 1 1 auto; height: 100%;` and hardcoded `height: 130px` is eliminated).
4. **Test 4: Dynamic Canvas Resolution & Baseline Scaling** (verifying `initAudioVisualizer` baseline height >= 180 and `updateVisualizerCanvasResolution` handles dynamic rect).
5. **Test 5: Theme & WCAG Contrast Parity** (`body.theme-light` rules present and valid).
6. **Test 6: AST Syntax & VM Parsing** (zero syntax errors in scripts).
7. **Test 7: Full Repository Suite Verification** via `node run_all_tests.js`.

---

## 📂 2. Target Files & Anchors

- **New Test Suite:** [`tests/test_visualizer_inner_content_expansion.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_visualizer_inner_content_expansion.js)
- **Master Test Runner:** [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🛠️ 3. Execution Commands

```powershell
# 1. Run the dedicated expansion verification suite
node tests/test_visualizer_inner_content_expansion.js

# 2. Run existing visualizer test suites to confirm zero regression
node tests/test_visualizer_toolbar_buttons_fix.js
node tests/test_visualizer_compact_fullscreen_embed.js
node tests/test_equalizer_layout_separation_phase1_2.js

# 3. Run all repository test suites
node run_all_tests.js
```

---

## 🏆 4. Grade A+ Signoff Criteria

- Zero failures across all suites.
- Exit code 0 returned on all commands.
- Pre-push gitleaks security audit clean (0 leaks detected).
