/**
 * Regression Test Suite: SVGElement className Getter-Only TypeError Fix
 *
 * Verifies that renderProductivityGauge (in both temporal_productivity_feature.js
 * and dashboard/dashboard.js fallback) and updateProductivityMetrics /
 * renderTimeTrackingTab use setAttribute('class', ...) instead of assigning
 * .className = on #gaugeProgressCircle (SVGElement).
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const featureJsPath = path.join(baseDir, 'src', 'dashboard', 'features', 'temporal_productivity_feature.js');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');

console.log('🧪 Starting SVGElement className Regression Test Suite...\n');

function createStrictSvgCircleMock() {
  const attrs = { class: 'gauge-progress tier-focus' };
  const el = {
    tagName: 'circle',
    style: {},
    setAttribute(key, val) {
      attrs[String(key)] = String(val);
    },
    getAttribute(key) {
      return Object.prototype.hasOwnProperty.call(attrs, key) ? attrs[key] : null;
    }
  };
  Object.defineProperty(el, 'className', {
    enumerable: true,
    configurable: false,
    get() {
      return { baseVal: attrs.class || '' };
    }
  });
  return el;
}

function createGaugeDocumentMock() {
  const circle = createStrictSvgCircleMock();
  const scoreEl = { textContent: '' };
  const badgeEl = { textContent: '', className: '' };
  const doc = {
    getElementById(id) {
      if (id === 'gaugeProgressCircle') return circle;
      if (id === 'valProductivityScore') return scoreEl;
      if (id === 'badgeProductivityTier') return badgeEl;
      return null;
    }
  };
  return { doc, circle, scoreEl, badgeEl };
}

function loadDashboardInVm(doc, warnLogs, withFeatureModule) {
  const code = fs.readFileSync(dashJsPath, 'utf8').replace(/^\uFEFF/, '');
  const sandboxModule = { exports: {} };
  const customRequire = (reqPath) => {
    if (!withFeatureModule && String(reqPath).includes('temporal_productivity_feature')) {
      return null;
    }
    const resolved = path.resolve(path.dirname(dashJsPath), reqPath);
    return require(resolved);
  };
  const context = {
    console: { log: () => {}, warn: (...args) => warnLogs.push(args.join(' ')), error: () => {} },
    document: doc,
    window: undefined,
    globalThis: {},
    module: sandboxModule,
    exports: sandboxModule.exports,
    require: customRequire,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(code, context, { filename: 'dashboard.js' });
  return sandboxModule.exports;
}

// ============================================================================
// Battery 1: Strict SVGElement Mock Sanity & TemporalProductivityFeature Gauge
// ============================================================================
console.log('Battery 1: TemporalProductivityFeature.renderProductivityGauge vs Getter-Only SVGElement');
{
  const svgCheck = createStrictSvgCircleMock();
  assert.throws(
    () => { svgCheck.className = 'gauge-progress tier-balanced'; },
    TypeError,
    'Strict SVGElement mock must throw TypeError on .className assignment'
  );

  const featureMod = require(featureJsPath);
  const tiers = [
    { score: 92, tier: 'focus' },
    { score: 68, tier: 'balanced' },
    { score: 35, tier: 'distracted' }
  ];

  tiers.forEach(({ score, tier }) => {
    const { doc, circle, scoreEl, badgeEl } = createGaugeDocumentMock();
    assert.doesNotThrow(() => {
      featureMod.renderProductivityGauge(score, tier, null, { document: doc, t: (k) => k });
    }, `TemporalProductivityFeature.renderProductivityGauge must not throw for tier ${tier}`);

    assert.strictEqual(scoreEl.textContent, String(score));
    assert.strictEqual(circle.getAttribute('class'), `gauge-progress tier-${tier}`);
    assert.strictEqual(circle.className.baseVal, `gauge-progress tier-${tier}`);
    assert(badgeEl.className.includes(`tier-${tier}`));
  });
  console.log('  ✅ TemporalProductivityFeature updates SVG class via setAttribute without TypeError');
}

// ============================================================================
// Battery 2: dashboard.js Fallback Path & renderTimeTrackingTab Integration
// ============================================================================
console.log('\nBattery 2: dashboard.js Fallback renderProductivityGauge & renderTimeTrackingTab');
{
  const { doc, circle, scoreEl, badgeEl } = createGaugeDocumentMock();
  const warnLogs = [];
  const dashExports = loadDashboardInVm(doc, warnLogs, false);

  const tiers = [
    { score: 88, tier: 'focus', domain: 'github.com' },
    { score: 70, tier: 'balanced', domain: 'google.com' },
    { score: 15, tier: 'distracted', domain: 'youtube.com' }
  ];

  tiers.forEach(({ score, tier, domain }) => {
    assert.doesNotThrow(() => {
      dashExports.renderProductivityGauge(score, tier);
    }, `dashboard.js fallback renderProductivityGauge must not throw for tier ${tier}`);
    assert.strictEqual(scoreEl.textContent, String(score));
    assert.strictEqual(circle.getAttribute('class'), `gauge-progress tier-${tier}`);
    assert(badgeEl.className.includes(`tier-${tier}`));

    const summary = dashExports.updateProductivityMetrics([
      { domain, computedSeconds: 1800, totalSeconds: 1800 }
    ]);
    assert(typeof summary.score === 'number');
    assert.strictEqual(circle.getAttribute('class'), `gauge-progress tier-${summary.tier}`);
  });

  dashExports.renderTimeTrackingTab({
    todayStr: '2026-11-25',
    activityData: {
      domains: {
        'github.com': {
          totalSeconds: 3600,
          foregroundSeconds: 3600,
          days: { '2026-11-25': { seconds: 3600, foregroundSeconds: 3600 } }
        }
      }
    }
  });
  const prodWarnings = warnLogs.filter(m => m.includes('updateProductivityMetrics error'));
  assert.strictEqual(prodWarnings.length, 0, `Unexpected updateProductivityMetrics warnings: ${prodWarnings.join('; ')}`);
  assert.strictEqual(circle.getAttribute('class'), 'gauge-progress tier-focus');
  console.log('  ✅ dashboard.js fallback & renderTimeTrackingTab pass with 0 TypeErrors and 0 warnings');
}

// ============================================================================
// Battery 3: Static Source Audit (Zero circle.className = in renderProductivityGauge)
// ============================================================================
console.log('\nBattery 3: Static Source Audit');
{
  [
    { name: 'dashboard/dashboard.js', filePath: dashJsPath },
    { name: 'temporal_productivity_feature.js', filePath: featureJsPath }
  ].forEach(({ name, filePath }) => {
    const src = fs.readFileSync(filePath, 'utf8');
    const fnIdx = src.indexOf('function renderProductivityGauge(');
    assert(fnIdx !== -1, `${name} must define renderProductivityGauge`);
    const slice = src.slice(fnIdx, fnIdx + 1800);
    assert(!/circle\.className\s*=/.test(slice), `${name} renderProductivityGauge must NOT assign circle.className =`);
    assert(/circle\.setAttribute\(\s*['"]class['"]\s*,/.test(slice), `${name} renderProductivityGauge must use circle.setAttribute('class', ...)`);
  });
  console.log('  ✅ Static source check confirms circle.setAttribute(\'class\', ...) in both files');
}

// ============================================================================
// Battery 4: UTF-8 BOM & AST Syntax Check
// ============================================================================
console.log('\nBattery 4: UTF-8 BOM & AST Syntax Check');
{
  [dashJsPath, featureJsPath, __filename].forEach((filePath) => {
    const buf = fs.readFileSync(filePath);
    const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    assert(hasBom, `${path.basename(filePath)} must retain UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
    new vm.Script(buf.toString('utf8'), { filename: path.basename(filePath) });
  });
  console.log('  ✅ UTF-8 BOM and vm.Script AST checks passed for all 3 files');
}

console.log('\n🎉 ALL SVGElement className REGRESSION TESTS PASSED!');
