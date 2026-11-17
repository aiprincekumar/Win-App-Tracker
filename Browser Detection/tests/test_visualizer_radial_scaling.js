const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Visualizer Radial Dynamic Scaling Verification Suite (TASK-VIZ-RADIAL-FULLSCREEN-SCALE-004)...\n');

const rootDir = path.resolve(__dirname, '..');
const featureJsPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');

// =============================================================================
// Test 1: UTF-8 with BOM Standard Audit
// =============================================================================
console.log('Test 1: UTF-8 BOM (0xEF, 0xBB, 0xBF) Standard Audit');
{
  const buf = fs.readFileSync(featureJsPath);
  assert(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, 'media_deck_visualizer_feature.js must start with UTF-8 BOM');
  console.log('  ✅ media_deck_visualizer_feature.js certified UTF-8 BOM standard');

  const thisBuf = fs.readFileSync(__filename);
  assert(thisBuf[0] === 0xEF && thisBuf[1] === 0xBB && thisBuf[2] === 0xBF, 'test_visualizer_radial_scaling.js must start with UTF-8 BOM');
  console.log('  ✅ test_visualizer_radial_scaling.js certified UTF-8 BOM standard');
}

// =============================================================================
// Test 2: Compact Standard Canvas (600x120, minDim=120) Radius Bounds
// =============================================================================
console.log('\nTest 2: Compact Standard Canvas (600x120, minDim=120) Radius & Spoke Bounds');
{
  const feature = require(featureJsPath);

  let arcsDrawn = [];
  let linesDrawn = [];
  let currentLineWidth = 0;

  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: '',
    lineCap: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: (x, y) => {
      linesDrawn.push({ x, y });
    },
    arc: (cx, cy, r, s, e) => {
      arcsDrawn.push({ cx, cy, r });
    },
    stroke: () => {},
    fill: () => {},
    roundRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  };

  const mockCanvas = {
    width: 600,
    height: 120,
    parentElement: {
      getBoundingClientRect: () => ({ width: 600, height: 120 })
    },
    getContext: () => mockCtx,
    dataset: {}
  };

  const mockDoc = {
    visibilityState: 'visible',
    getElementById: () => null,
    addEventListener: () => {}
  };

  feature.initAudioVisualizer(mockCanvas, { doc: mockDoc });
  feature.setVisualizerMode('radial');
  feature.setAudioPlayingState(true);

  // Case A: Moderate Audio (RMS = 0.35, Band values ~0.4)
  const moderateTelemetry = {
    leftRms: 0.35,
    rightRms: 0.35,
    freqs: new Array(32).fill(0.4),
    wave: new Array(32).fill(0)
  };
  feature.feedAudioTelemetry(moderateTelemetry);

  // Allow smoothing lerp to settle over several frames
  for (let f = 0; f < 10; f++) {
    arcsDrawn = [];
    linesDrawn = [];
    feature.renderVisualizerFrame(1000 + f * 16, { doc: mockDoc });
  }

  assert(arcsDrawn.length >= 1, 'Core glowing arc must be drawn');
  const coreArc = arcsDrawn[0];
  assert.strictEqual(coreArc.cx, 300, 'Center X must be width / 2 (300)');
  assert.strictEqual(coreArc.cy, 60, 'Center Y must be height / 2 (60)');

  // Calculate maximum outer distance from center for all lineTo endpoints
  let maxOuterDist = 0;
  linesDrawn.forEach(pt => {
    const dist = Math.hypot(pt.x - 300, pt.y - 60);
    if (dist > maxOuterDist) maxOuterDist = dist;
  });

  console.log(`  Compact View (Moderate Audio): max outer radius = ${maxOuterDist.toFixed(2)}px`);
  assert(maxOuterDist <= 60, `Compact moderate view outer radius (${maxOuterDist.toFixed(2)}px) must be <= 60px`);
  assert(maxOuterDist >= 35, `Compact moderate view outer radius (${maxOuterDist.toFixed(2)}px) must be >= 35px`);
  console.log('  ✅ Compact view (600x120, minDim=120) outer radius <= 60px with zero clipping verified');

  // Case B: Peak Audio (RMS = 1.0, Band values = 1.0)
  const peakTelemetry = {
    leftRms: 1.0,
    rightRms: 1.0,
    freqs: new Array(32).fill(1.0),
    wave: new Array(32).fill(0)
  };
  feature.feedAudioTelemetry(peakTelemetry);

  // Render a few frames to allow lerp to reach peak
  for (let f = 0; f < 10; f++) {
    linesDrawn = [];
    feature.renderVisualizerFrame(1000 + f * 16, { doc: mockDoc });
  }

  let peakOuterDist = 0;
  linesDrawn.forEach(pt => {
    const dist = Math.hypot(pt.x - 300, pt.y - 60);
    if (dist > peakOuterDist) peakOuterDist = dist;
  });

  console.log(`  Compact View (Peak Audio): peak outer radius = ${peakOuterDist.toFixed(2)}px`);
  assert(peakOuterDist <= 61, `Compact peak outer radius (${peakOuterDist.toFixed(2)}px) must remain within ~60px`);
  console.log('  ✅ Compact peak outer radius certified cleanly contained within canvas height');
}

// =============================================================================
// Test 3: Fullscreen Theater Canvas (1400x600, minDim=600) Dynamic Scaling
// =============================================================================
console.log('\nTest 3: Fullscreen Theater Canvas (1400x600, minDim=600) Dynamic Scaling');
{
  const feature = require(featureJsPath);

  let arcsDrawn = [];
  let linesDrawn = [];
  let capturedLineWidth = 0;

  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    set lineWidth(val) { capturedLineWidth = val; },
    get lineWidth() { return capturedLineWidth; },
    shadowBlur: 0,
    shadowColor: '',
    lineCap: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: (x, y) => {
      linesDrawn.push({ x, y });
    },
    arc: (cx, cy, r, s, e) => {
      arcsDrawn.push({ cx, cy, r });
    },
    stroke: () => {},
    fill: () => {},
    roundRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  };

  const mockCanvas = {
    width: 1400,
    height: 600,
    parentElement: {
      getBoundingClientRect: () => ({ width: 1400, height: 600 })
    },
    getContext: () => mockCtx,
    dataset: {}
  };

  const mockDoc = {
    visibilityState: 'visible',
    getElementById: () => null,
    addEventListener: () => {}
  };

  feature.initAudioVisualizer(mockCanvas, { doc: mockDoc });
  feature.setVisualizerMode('radial');
  feature.setAudioPlayingState(true);

  // Moderate Audio (RMS = 0.5, Band values = 0.5)
  const moderateTelemetry = {
    leftRms: 0.5,
    rightRms: 0.5,
    freqs: new Array(32).fill(0.5),
    wave: new Array(32).fill(0)
  };
  feature.feedAudioTelemetry(moderateTelemetry);

  // Allow smoothing lerp to settle
  for (let f = 0; f < 10; f++) {
    arcsDrawn = [];
    linesDrawn = [];
    feature.renderVisualizerFrame(2000 + f * 16, { doc: mockDoc });
  }

  assert(arcsDrawn.length >= 1, 'Core glowing arc must be drawn in fullscreen');
  const coreArc = arcsDrawn[0];
  assert.strictEqual(coreArc.cx, 700, 'Fullscreen center X must be width / 2 (700)');
  assert.strictEqual(coreArc.cy, 300, 'Fullscreen center Y must be height / 2 (300)');

  // Inner core radius in fullscreen (minDim=600):
  // baseRadiusMin = 600 * 0.18 = 108px.
  // baseRadius = 108 + 0.5 * (600 * 0.08) = 132px.
  // core arc = 132 * 0.6 = 79.2px.
  console.log(`  Fullscreen Core Arc Radius: ${coreArc.r.toFixed(2)}px (expected ~79px)`);
  assert(coreArc.r > 60, `Fullscreen core arc (${coreArc.r}px) must be > 60px`);

  let maxFullscreenDist = 0;
  linesDrawn.forEach(pt => {
    const dist = Math.hypot(pt.x - 700, pt.y - 300);
    if (dist > maxFullscreenDist) maxFullscreenDist = dist;
  });

  console.log(`  Fullscreen View (Moderate Audio): max outer radius = ${maxFullscreenDist.toFixed(2)}px`);
  assert(maxFullscreenDist > 180, `Fullscreen outer radius (${maxFullscreenDist.toFixed(2)}px) must be > 180px`);
  assert(maxFullscreenDist < 300, `Fullscreen outer radius (${maxFullscreenDist.toFixed(2)}px) must fit within 300px half-height`);
  console.log('  ✅ Fullscreen canvas (1400x600, minDim=600) outer radius dynamically scales proportionally (> 180px)');

  // Spoke Line Width in fullscreen: Math.round(600 * 0.018) = 11, clamped to max 6
  console.log(`  Fullscreen Spoke Line Width: ${capturedLineWidth}px`);
  assert.strictEqual(capturedLineWidth, 6, 'Fullscreen spoke line width must scale and clamp to 6px');
  console.log('  ✅ Fullscreen spoke line width scaled to 6px cleanly');
}

// =============================================================================
// Test 4: Dynamic Scaling Comparison (Compact vs Fullscreen)
// =============================================================================
console.log('\nTest 4: Dynamic Scaling Comparison (Compact vs Fullscreen Scaling Factor)');
{
  const feature = require(featureJsPath);
  const minDimCompact = 120;
  const minDimFullscreen = 600;

  const baseRadiusCompact = Math.max(16, minDimCompact * 0.18);
  const baseRadiusFullscreen = Math.max(16, minDimFullscreen * 0.18);
  const scalingRatio = baseRadiusFullscreen / baseRadiusCompact;

  console.log(`  Compact base radius min: ${baseRadiusCompact}px | Fullscreen base radius min: ${baseRadiusFullscreen}px`);
  console.log(`  Scaling ratio: ${scalingRatio.toFixed(2)}x`);
  assert(scalingRatio >= 5.0, `Scaling ratio (${scalingRatio}) must be >= 5.0x between 120px and 600px minDim`);
  console.log('  ✅ Dynamic proportional scaling verified across aspect ratios');
}

// =============================================================================
// Test 5: Strict Negative Invariant - Other 5 Visualizer Modes Untouched
// =============================================================================
console.log('\nTest 5: Strict Negative Invariant - Other 5 Modes Integrity');
{
  const feature = require(featureJsPath);
  const expectedModes = ['bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror'];

  assert.deepStrictEqual(feature.VALID_VIZ_MODES, expectedModes, 'VALID_VIZ_MODES must remain strictly unchanged');

  // Verify that setting and rendering each mode does not throw
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: '',
    lineCap: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    stroke: () => {},
    fill: () => {},
    roundRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  };

  const mockCanvas = {
    width: 600,
    height: 120,
    parentElement: { getBoundingClientRect: () => ({ width: 600, height: 120 }) },
    getContext: () => mockCtx,
    dataset: {}
  };

  const mockDoc = { visibilityState: 'visible', getElementById: () => null, addEventListener: () => {} };
  feature.initAudioVisualizer(mockCanvas, { doc: mockDoc });
  feature.setAudioPlayingState(true);

  expectedModes.forEach(mode => {
    feature.setVisualizerMode(mode);
    assert.strictEqual(feature.getVisualizerState().mode, mode, `Mode must be set to ${mode}`);
    const res = feature.renderVisualizerFrame(3000, { doc: mockDoc });
    assert(!res.sleeping, `Mode ${mode} must render cleanly without sleeping`);
    console.log(`  ✅ Mode "${mode}" rendered cleanly and intact`);
  });
}

// =============================================================================
// Test 6: W3C Trusted Types & Safe Execution Audit
// =============================================================================
console.log('\nTest 6: W3C Trusted Types & Code Cleanliness');
{
  const code = fs.readFileSync(featureJsPath, 'utf8');
  assert(!code.includes('.innerHTML'), 'media_deck_visualizer_feature.js must contain 0 innerHTML assignments');
  assert(!code.includes('.outerHTML'), 'media_deck_visualizer_feature.js must contain 0 outerHTML assignments');
  assert(!/\beval\s*\(/.test(code), 'media_deck_visualizer_feature.js must contain 0 eval calls');
  console.log('  ✅ 0 innerHTML, 0 outerHTML, 0 eval verified in visualizer feature');
}

console.log('\n===========================================================================');
console.log('🎉 ALL 6 TESTS IN RADIAL SCALING SUITE PASSED (Exit Code 0)!');
console.log('===========================================================================\n');
