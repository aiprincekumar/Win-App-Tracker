<!-- 0xEF, 0xBB, 0xBF UTF-8 BOM Encoded -->
# Phase 3 Execution Prompt: Automated Regression Test Battery & Full Suite Verification

> **Execution Directive for Level 4 QA Verification Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 08 QA & Testing Governance.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Zero-Skip Gate:** Pass 100% test suites with raw exit code 0.

---

## 🎯 1. Phase Objective
Author and verify automated test coverage for:
1. Toolbar flex alignment (`justify-between` and `width: 100%`) in `media.css` and `dashboard.css`.
2. Existence of `.viz-actions-group` wrapper and all three action buttons (`#btnVizVideoEmbedToggle`, `#btnVizFullWindow`, `#btnVizFullscreen`).
3. Dual-mode behavior verification:
   - Full Window button toggling `.visualizer-theater-mode`.
   - Full Screen button invoking W3C Fullscreen API and syncing on `fullscreenchange`.
4. Zero-regression verification across all 57+ repository test suites via `node run_all_tests.js`.
5. Pre-push gitleaks security scan with 0 leaks detected.

---

## 📂 2. Target Files & Anchors
- **Visualizer Action Suite:** [`tests/test_visualizer_compact_fullscreen_embed.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_visualizer_compact_fullscreen_embed.js)
- **Master Test Runner:** [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 3.1: Update `tests/test_visualizer_compact_fullscreen_embed.js`
1. Add assertions for `#btnVizFullWindow`:
   - Must exist in `dashboard.html`.
   - Must have `btn-viz-action-icon` class.
   - Must have `title="Toggle Visualizer Full Window (Theater)"` and `aria-label="Toggle Visualizer Full Window (Theater)"`.
   - Must have `aria-expanded="false"` and `tabindex="0"`.
2. Add assertions for `.viz-actions-group`:
   - Must exist in `dashboard.html`.
   - Must exist in `media.css` and `dashboard.css`.
3. Add CSS property check:
   - Verify `.visualizer-controls-bar` contains `justify-content: space-between` and `width: 100%`.
4. Add behavioral unit test battery:
   - Test `toggleVisualizerFullWindow` toggles `.visualizer-theater-mode` on `#heroAudioLabStatus`.
   - Test `toggleVisualizerFullscreen` invokes `requestFullscreen` and handles mock `fullscreenchange` event.

### Step 3.2: Execute Quality Gates
Run deterministic verification commands:
```powershell
node tests/test_visualizer_compact_fullscreen_embed.js
node run_all_tests.js
gitleaks detect --redact
```

---

## 🔍 4. Verification Gate
- Test `test_visualizer_compact_fullscreen_embed.js` passes with 100% green assertions.
- `node run_all_tests.js` passes 57/57+ test suites with exit code 0.
- `gitleaks detect --redact` reports 0 leaks.
- UTF-8 BOM encoding certified across all edited files.
