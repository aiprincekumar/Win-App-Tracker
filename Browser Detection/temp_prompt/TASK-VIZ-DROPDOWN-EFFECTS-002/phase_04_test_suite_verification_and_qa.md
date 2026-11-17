<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Phase 4 Standalone Execution Prompt

> **Phase Focus:** Test Suite Hardening, Regression Testing & Independent QA Audit  
> **Assigned Role:** Level 4 QA Verification Testing Specialist  
> **Authorization Mandate:** Requires valid `AUTH-MGR-*` token from Level 2 Manager  
> **Target Files:**
> - [`tests/test_visualizer_runtime_wiring.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_visualizer_runtime_wiring.js)
> - [`tests/test_visualizer_separation_qa_parity.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_visualizer_separation_qa_parity.js)

---

## 🎯 1. Phase Objective

Harden the automated visualizer test suite (`tests/test_visualizer_runtime_wiring.js`) to assert:
1. DOM presence of `<select id="selectVizEffect">` with all 6 effect options.
2. Preservation of legacy `#btnVizModeBars` and `#btnVizModeWave` elements.
3. Verification of all 6 modes in `setVisualizerMode()` and state machine transitions.
4. Verification of 60fps rendering across all 6 effects without frame exceptions.
5. Verification of the Zero-Overhead Idle Sleep Sentinel.
6. Execution of full regression suite `node run_all_tests.js` and formal Grade A+ signoff.

---

## 📦 2. Prerequisites & Inputs

1. Completion of Phases 1, 2, and 3.
2. Access to test runner `node tests/test_visualizer_runtime_wiring.js`.

---

## ⚓ 3. Technical Context & File Anchors

### Anchor 1: `tests/test_visualizer_runtime_wiring.js`
- Lines ~43-58: `requiredElements` array in Battery 1.
- Lines ~100-145: Battery 3 mode switching test logic.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 4.1: Update Battery 1 in `tests/test_visualizer_runtime_wiring.js`
Add `'selectVizEffect'` to `requiredElements`:
```javascript
  const requiredElements = [
    'visualizerPanel',
    'txtVisualizerTitle',
    'selectVizEffect',
    'btnVizModeBars',
    'btnVizModeWave',
    'canvasAudioVisualizer',
    'vuBarLeft',
    'vuBarRight',
    'vuValLeft',
    'vuValRight',
    'vuClipIndicator'
  ];
```
Also assert that `dashboard.html` contains options for `bars`, `wave`, `radial`, `matrix_dots`, `flame`, and `stereo_mirror`.

### Step 4.2: Expand Battery 3 in `tests/test_visualizer_runtime_wiring.js`
Expand Battery 3 to test all 6 modes:
```javascript
console.log('\nBattery 3: 6-Effect Visualizer Mode Switching & Dropdown Synchronization');
{
  const featureCode = fs.readFileSync(featureJsPath, 'utf8');
  const dom = new JSDOM(`<!DOCTYPE html>
    <html>
      <body>
        <div id="visualizerPanel">
          <select id="selectVizEffect">
            <option value="bars">32-Band Spectrum</option>
            <option value="wave">Oscilloscope Wave</option>
            <option value="radial">Radial Frequency Burst</option>
            <option value="matrix_dots">Matrix Digital Dots</option>
            <option value="flame">Neon Flame Peaks</option>
            <option value="stereo_mirror">Stereo Mirror Butterfly</option>
          </select>
          <button id="btnVizModeBars" class="btn-viz-mode"></button>
          <button id="btnVizModeWave" class="btn-viz-mode"></button>
          <canvas id="canvasAudioVisualizer" width="600" height="120"></canvas>
        </div>
      </body>
    </html>`);

  const doc = dom.window.document;
  const canvas = doc.getElementById('canvasAudioVisualizer');
  canvas.getContext = () => ({
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    arc: () => {},
    fill: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    roundRect: () => {}
  });

  const sandbox = {
    window: dom.window,
    document: doc,
    self: dom.window,
    console,
    Math,
    Date,
    Float32Array,
    Object,
    Array,
    Number,
    Boolean
  };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(featureCode, sandbox);

  const viz = sandbox.window.MediaDeckVisualizerFeature;
  viz.initAudioVisualizer(canvas, { doc });

  const ALL_MODES = ['bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror'];
  const selectEl = doc.getElementById('selectVizEffect');
  const btnBars = doc.getElementById('btnVizModeBars');
  const btnWave = doc.getElementById('btnVizModeWave');

  ALL_MODES.forEach((mode) => {
    viz.setVisualizerMode(mode, { doc });
    const state = viz.getVisualizerState();
    assert.strictEqual(state.mode, mode, `Visualizer mode must be set to ${mode}`);
    assert.strictEqual(selectEl.value, mode, `Dropdown value must synchronize to ${mode}`);

    if (mode === 'bars') {
      assert(btnBars.classList.contains('active'), 'btnVizModeBars must have active class in bars mode');
      assert(!btnWave.classList.contains('active'), 'btnVizModeWave must not have active class in bars mode');
    } else if (mode === 'wave') {
      assert(btnWave.classList.contains('active'), 'btnVizModeWave must have active class in wave mode');
      assert(!btnBars.classList.contains('active'), 'btnVizModeBars must not have active class in wave mode');
    } else {
      assert(!btnBars.classList.contains('active'), 'btnVizModeBars must not have active class in custom mode');
      assert(!btnWave.classList.contains('active'), 'btnVizModeWave must not have active class in custom mode');
    }

    // Render frame check
    viz.setAudioPlayingState(true, { doc });
    const renderRes = viz.renderVisualizerFrame(Date.now(), { doc });
    assert(renderRes.rendered, `Frame must render cleanly under mode: ${mode}`);
  });

  console.log('  ✅ All 6 visualizer modes verified for state transitions, DOM sync, and render execution');
}
```

### Step 4.3: Verify UTF-8 BOM
Ensure `tests/test_visualizer_runtime_wiring.js` is written with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Architectural Constraints & Boundaries
- DO NOT weaken any assertion in `test_visualizer_separation_qa_parity.js`.
- ALL 5 gates in `test_visualizer_separation_qa_parity.js` must pass.

---

## 🏁 6. Full Test Suite & QA Signoff

Run both test suites:
```bash
node tests/test_visualizer_runtime_wiring.js
node tests/test_visualizer_separation_qa_parity.js
node run_all_tests.js
```
**Gate Requirement:** All suites exit with code 0 with 0 errors.
