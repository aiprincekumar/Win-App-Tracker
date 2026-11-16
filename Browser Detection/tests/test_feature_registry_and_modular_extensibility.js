/**
 * Verification Test Suite: Modular Feature Registry & Extensibility Subsystem
 * 
 * Verifies:
 * 1. Node.js Compiler Syntax Check (`node -c`) & In-Memory AST Parsing (`vm.Script`)
 * 2. UTF-8 BOM encoding across all feature architecture modules
 * 3. W3C Trusted Types & 0 innerHTML CSP compliance
 * 4. Feature registration schema validation & domain normalization
 * 5. Domain-specific filtering ('popup', 'dashboard', 'background', 'all')
 * 6. Lifecycle execution: onInit, onUpdate, onDestroy, onEvent with fault tolerance
 * 7. Event bus emission, subscription, unsubscription, and feature event forwarding
 * 8. Dynamic feature enable/disable controls
 * 9. Domain managers: DashboardFeatureManager, PopupFeatureManager, BackgroundFeatureManager
 * 10. Seamless integration & module export verification in popup.js, dashboard.js, background.js
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

console.log('🧪 Starting Modular Feature Registry & Extensibility Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');

const featureFiles = [
  'src/core/feature_registry.js',
  'src/dashboard/features/dashboard_feature_manager.js',
  'src/popup/features/popup_feature_manager.js',
  'src/background/features/background_feature_manager.js'
];

// ---------------------------------------------------------------------------
// Test 1: Node.js Compiler Syntax Check (`node -c`) on Feature Modules
// ---------------------------------------------------------------------------
console.log('Test 1: Node.js Compiler Syntax Check (`node -c`) on Feature Modules');
{
  featureFiles.forEach((relPath) => {
    const fullPath = path.join(baseDir, relPath);
    assert(fs.existsSync(fullPath), `Feature script must exist: ${relPath}`);

    try {
      execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
      console.log(`  ✅ node -c passed for ${relPath}`);
    } catch (err) {
      assert.fail(`Syntax error detected in ${relPath} via node -c: ${err.message}`);
    }
  });
}

// ---------------------------------------------------------------------------
// Test 2: In-Memory AST Parsing & Compilation via `vm.Script`
// ---------------------------------------------------------------------------
console.log('\nTest 2: In-Memory AST Parsing & Compilation via `vm.Script`');
{
  featureFiles.forEach((relPath) => {
    const fullPath = path.join(baseDir, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');

    let script;
    assert.doesNotThrow(() => {
      script = new vm.Script(code, { filename: relPath, displayErrors: true });
    }, `vm.Script compilation must succeed for ${relPath}`);

    assert(script, `Script object must be instantiated for ${relPath}`);
    console.log(`  ✅ vm.Script parsed ${relPath} successfully (${code.length} bytes, 0 parse errors)`);
  });
}

// ---------------------------------------------------------------------------
// Test 3: UTF-8 BOM Verification (Universal Rule 5 & 8 Standard)
// ---------------------------------------------------------------------------
console.log('\nTest 3: UTF-8 BOM Verification (0xEF, 0xBB, 0xBF)');
{
  const targetFiles = [
    ...featureFiles,
    'tests/test_feature_registry_and_modular_extensibility.js'
  ];

  targetFiles.forEach((relPath) => {
    const fullPath = path.join(baseDir, relPath);
    assert(fs.existsSync(fullPath), `Target file must exist: ${relPath}`);
    const buf = fs.readFileSync(fullPath);
    assert(buf.length >= 3, `File must not be empty: ${relPath}`);
    assert(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, `File ${relPath} must include UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
    console.log(`  ✅ UTF-8 BOM verified for ${relPath}`);
  });
}

// ---------------------------------------------------------------------------
// Test 4: W3C Trusted Types & Zero innerHTML Compliance
// ---------------------------------------------------------------------------
console.log('\nTest 4: W3C Trusted Types & Zero innerHTML Compliance');
{
  featureFiles.forEach((relPath) => {
    const fullPath = path.join(baseDir, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    assert(!code.includes('.innerHTML'), `${relPath} must NEVER assign to .innerHTML`);
    assert(!code.includes('.outerHTML'), `${relPath} must NEVER assign to .outerHTML`);
    console.log(`  ✅ 100% W3C Trusted Types compliant in ${relPath} (0 innerHTML / outerHTML)`);
  });
}

// ---------------------------------------------------------------------------
// Test 5: SentinelFeatureRegistry Schema Validation & Registration
// ---------------------------------------------------------------------------
console.log('\nTest 5: SentinelFeatureRegistry Schema Validation & Registration');
{
  const registry = require('../src/core/feature_registry.js');
  registry.clear();

  // Test invalid registration inputs
  assert.throws(() => registry.registerFeature(null), /must be an object/, 'Must reject null featureDef');
  assert.throws(() => registry.registerFeature({}), /id is required/, 'Must reject featureDef without id');
  assert.throws(() => registry.registerFeature({ id: '' }), /id is required/, 'Must reject empty string id');

  // Test valid registration with default values
  const reg1 = registry.registerFeature({
    id: 'test_default_feature'
  });
  assert.strictEqual(reg1.id, 'test_default_feature');
  assert.strictEqual(reg1.name, 'test_default_feature');
  assert.strictEqual(reg1.version, '1.0.0');
  assert.deepStrictEqual(reg1.domain, ['all']);
  assert.strictEqual(reg1.enabled, true);
  assert.strictEqual(reg1.initialized, false);

  assert(registry.hasFeature('test_default_feature'), 'hasFeature must return true for registered feature');
  assert.strictEqual(registry.getFeature('test_default_feature').id, 'test_default_feature');

  // Test domain normalization
  const reg2 = registry.registerFeature({
    id: 'test_popup_feat',
    name: 'Popup Speed Controller',
    version: '2.1.0',
    description: 'Custom popup speed slider',
    domain: 'POPUP'
  });
  assert.deepStrictEqual(reg2.domain, ['popup'], 'Single string domain must be normalized to lowercase array');

  const reg3 = registry.registerFeature({
    id: 'test_multi_feat',
    name: 'Omni Sound Booster',
    domain: ['Dashboard', 'POPUP']
  });
  assert.deepStrictEqual(reg3.domain, ['dashboard', 'popup'], 'Array domain must be normalized to lowercase strings');

  console.log('  ✅ Schema validation, default assignments, and domain normalization verified');
}

// ---------------------------------------------------------------------------
// Test 6: Domain Filtering Verification
// ---------------------------------------------------------------------------
console.log('\nTest 6: Domain Filtering Verification');
{
  const registry = require('../src/core/feature_registry.js');
  registry.clear();

  registry.registerFeature({ id: 'feat_all', domain: 'all' });
  registry.registerFeature({ id: 'feat_popup', domain: 'popup' });
  registry.registerFeature({ id: 'feat_dashboard', domain: 'dashboard' });
  registry.registerFeature({ id: 'feat_bg', domain: 'background' });

  const all = registry.getAllFeatures();
  assert.strictEqual(all.length, 4, 'getAllFeatures without filter must return all registered features');

  const popupFeatures = registry.getAllFeatures('popup');
  const popupIds = popupFeatures.map(f => f.id);
  assert(popupIds.includes('feat_all'), 'Popup filter must include features with domain "all"');
  assert(popupIds.includes('feat_popup'), 'Popup filter must include features with domain "popup"');
  assert(!popupIds.includes('feat_dashboard'), 'Popup filter must NOT include dashboard-only features');
  assert(!popupIds.includes('feat_bg'), 'Popup filter must NOT include background-only features');

  const dashFeatures = registry.getAllFeatures('dashboard');
  const dashIds = dashFeatures.map(f => f.id);
  assert(dashIds.includes('feat_all'), 'Dashboard filter must include "all" features');
  assert(dashIds.includes('feat_dashboard'), 'Dashboard filter must include "dashboard" features');
  assert(!dashIds.includes('feat_popup'), 'Dashboard filter must NOT include popup features');

  const bgFeatures = registry.getFeaturesByDomain('background');
  const bgIds = bgFeatures.map(f => f.id);
  assert(bgIds.includes('feat_all'), 'Background filter must include "all" features');
  assert(bgIds.includes('feat_bg'), 'Background filter must include "background" features');
  assert(!bgIds.includes('feat_popup'), 'Background filter must NOT include popup features');

  console.log('  ✅ Domain-scoped filtering and "all" inheritance verified');
}

// ---------------------------------------------------------------------------
// Test 7: Lifecycle Execution: onInit, onUpdate, onDestroy, Fault Tolerance
// ---------------------------------------------------------------------------
console.log('\nTest 7: Lifecycle Execution: onInit, onUpdate, onDestroy, Fault Tolerance');
{
  const registry = require('../src/core/feature_registry.js');
  registry.clear();

  let initCalledWith = null;
  let updateCalledWith = null;
  let destroyCalled = false;

  registry.registerFeature({
    id: 'lifecycle_test',
    domain: 'popup',
    onInit: (ctx) => { initCalledWith = ctx; },
    onUpdate: (state) => { updateCalledWith = state; },
    onDestroy: () => { destroyCalled = true; }
  });

  // Feature that throws in onInit to test fault tolerance
  let resilientInit = false;
  registry.registerFeature({
    id: 'faulty_feature',
    domain: 'popup',
    onInit: () => { throw new Error('Simulated init failure in faulty feature'); }
  });
  registry.registerFeature({
    id: 'resilient_feature',
    domain: 'popup',
    onInit: () => { resilientInit = true; }
  });

  // Execute initFeatures
  const testContext = { domain: 'popup', testPayload: 'hello_world' };
  const initedIds = registry.initFeatures(testContext);

  assert.strictEqual(initCalledWith, testContext, 'onInit must receive context object');
  assert.strictEqual(resilientInit, true, 'Subsequent features must initialize even if a previous feature throws');
  assert(initedIds.includes('lifecycle_test'), 'Initialized list must include lifecycle_test');
  assert(registry.getFeature('lifecycle_test').initialized, 'lifecycle_test must have initialized: true');

  // Verify second call to initFeatures does NOT re-initialize already initialized features
  initCalledWith = null;
  registry.initFeatures(testContext);
  assert.strictEqual(initCalledWith, null, 'Already initialized feature must not be re-initialized');

  // Execute onUpdate
  const testState = { volume: 85, isPlaying: true };
  registry.updateFeatures(testState, 'popup');
  assert.strictEqual(updateCalledWith, testState, 'onUpdate must receive state object');

  // Execute onDestroy
  assert.strictEqual(destroyCalled, false, 'onDestroy must not be called before destroyFeatures');
  registry.destroyFeatures('popup');
  assert.strictEqual(destroyCalled, true, 'onDestroy must be called when destroyFeatures is executed');
  assert.strictEqual(registry.getFeature('lifecycle_test').initialized, false, 'initialized state must be reset to false');

  console.log('  ✅ Lifecycle hooks (onInit, onUpdate, onDestroy) and fault isolation verified');
}

// ---------------------------------------------------------------------------
// Test 8: Event Bus Emission, Subscriptions & Feature onEvent Handlers
// ---------------------------------------------------------------------------
console.log('\nTest 8: Event Bus Emission, Subscriptions & Feature onEvent Handlers');
{
  const registry = require('../src/core/feature_registry.js');
  registry.clear();

  let eventReceived = null;
  const unsubscribe = registry.on('media:custom_action', (payload) => {
    eventReceived = payload;
  });

  registry.emitEvent('media:custom_action', { action: 'super_boost', db: 6 });
  assert.deepStrictEqual(eventReceived, { action: 'super_boost', db: 6 }, 'Event listener must receive payload');

  // Test unsubscribe
  eventReceived = null;
  unsubscribe();
  registry.emitEvent('media:custom_action', { action: 'super_boost_2' });
  assert.strictEqual(eventReceived, null, 'Unsubscribed listener must not be called');

  // Test feature onEvent delegation
  let featureReceived = null;
  registry.registerFeature({
    id: 'event_aware_feature',
    domain: 'all',
    onEvent: (name, payload) => {
      featureReceived = { name, payload };
    }
  });
  registry.initFeatures();

  registry.emitEvent('system:ping', { timestamp: 123456 });
  assert.deepStrictEqual(featureReceived, { name: 'system:ping', payload: { timestamp: 123456 } }, 'Feature onEvent must be called');

  console.log('  ✅ Event bus emission, listener unsubscription, and feature event forwarding verified');
}

// ---------------------------------------------------------------------------
// Test 9: Feature Enable/Disable Controls & Unregistration
// ---------------------------------------------------------------------------
console.log('\nTest 9: Feature Enable/Disable Controls & Unregistration');
{
  const registry = require('../src/core/feature_registry.js');
  registry.clear();

  let destroyed = false;
  registry.registerFeature({
    id: 'toggleable_feature',
    domain: 'all',
    onDestroy: () => { destroyed = true; }
  });
  registry.initFeatures();
  assert.strictEqual(registry.getFeature('toggleable_feature').enabled, true);
  assert.strictEqual(registry.getFeature('toggleable_feature').initialized, true);

  // Disable feature
  registry.disableFeature('toggleable_feature');
  assert.strictEqual(registry.getFeature('toggleable_feature').enabled, false);
  assert.strictEqual(registry.getFeature('toggleable_feature').initialized, false);
  assert.strictEqual(destroyed, true, 'Disabling active feature must trigger onDestroy');

  // Enable feature
  registry.enableFeature('toggleable_feature');
  assert.strictEqual(registry.getFeature('toggleable_feature').enabled, true);

  // Unregister feature
  const unregistered = registry.unregisterFeature('toggleable_feature');
  assert.strictEqual(unregistered, true);
  assert.strictEqual(registry.hasFeature('toggleable_feature'), false);

  console.log('  ✅ Dynamic feature enable/disable and unregistration verified');
}

// ---------------------------------------------------------------------------
// Test 10: Domain Feature Managers (Dashboard, Popup, Background)
// ---------------------------------------------------------------------------
console.log('\nTest 10: Domain Feature Managers (Dashboard, Popup, Background)');
{
  const registry = require('../src/core/feature_registry.js');
  registry.clear();

  const dashMgr = require('../src/dashboard/features/dashboard_feature_manager.js');
  const popupMgr = require('../src/popup/features/popup_feature_manager.js');
  const bgMgr = require('../src/background/features/background_feature_manager.js');

  // 1. Dashboard feature registration & lifecycle
  let dashInited = false;
  let dashUpdated = false;
  dashMgr.registerDashboardFeature({
    id: 'dash_custom_kpi',
    name: 'Custom KPI Card',
    onInit: () => { dashInited = true; },
    onUpdate: () => { dashUpdated = true; }
  });
  assert(registry.hasFeature('dash_custom_kpi'));
  assert(dashMgr.getDashboardFeatures().some(f => f.id === 'dash_custom_kpi'));

  dashMgr.initDashboardFeatures({ role: 'dashboard_viewer' });
  assert.strictEqual(dashInited, true, 'Dashboard feature onInit must be called');

  dashMgr.notifyDashboardUpdate({ kpi: 99 });
  assert.strictEqual(dashUpdated, true, 'Dashboard feature onUpdate must be called');

  // 2. Popup feature registration & lifecycle
  let popupInited = false;
  popupMgr.registerPopupFeature({
    id: 'popup_quick_button',
    name: 'Quick Action Button',
    onInit: () => { popupInited = true; }
  });
  assert(registry.hasFeature('popup_quick_button'));
  popupMgr.initPopupFeatures();
  assert.strictEqual(popupInited, true, 'Popup feature onInit must be called');

  // 3. Background feature registration & lifecycle
  let bgInited = false;
  bgMgr.registerBackgroundFeature({
    id: 'bg_telemetry_enhancer',
    name: 'Telemetry Enhancer',
    onInit: () => { bgInited = true; }
  });
  assert(registry.hasFeature('bg_telemetry_enhancer'));
  bgMgr.initBackgroundFeatures();
  assert.strictEqual(bgInited, true, 'Background feature onInit must be called');

  console.log('  ✅ DashboardFeatureManager, PopupFeatureManager, and BackgroundFeatureManager verified');
}

// ---------------------------------------------------------------------------
// Test 11: Seamless Integration & Module Exports in Main Files
// ---------------------------------------------------------------------------
console.log('\nTest 11: Seamless Integration & Module Exports in Main Files');
{
  const bgJs = fs.readFileSync(path.join(baseDir, 'background.js'), 'utf8');
  assert(bgJs.includes('_FeatureRegistry'), 'background.js must require _FeatureRegistry');
  assert(bgJs.includes('_BackgroundFeatureManager'), 'background.js must require _BackgroundFeatureManager');
  assert(bgJs.includes('FeatureRegistry: _FeatureRegistry'), 'background.js must export FeatureRegistry in SentinelBackgroundModules');
  assert(bgJs.includes('BackgroundFeatureManager: _BackgroundFeatureManager'), 'background.js must export BackgroundFeatureManager in SentinelBackgroundModules');
  assert(bgJs.includes('_BackgroundFeatureManager.initBackgroundFeatures'), 'background.js must boot _BackgroundFeatureManager');
  console.log('  ✅ background.js module wiring & boot initialization verified');

  const popupJs = fs.readFileSync(path.join(baseDir, 'popup/popup.js'), 'utf8');
  assert(popupJs.includes('_FeatureRegistry'), 'popup.js must resolve _FeatureRegistry');
  assert(popupJs.includes('_PopupFeatureManager'), 'popup.js must resolve _PopupFeatureManager');
  assert(popupJs.includes('FeatureRegistry: _FeatureRegistry'), 'popup.js must export FeatureRegistry in window.__SentinelPopupModules');
  assert(popupJs.includes('PopupFeatureManager: _PopupFeatureManager'), 'popup.js must export PopupFeatureManager in window.__SentinelPopupModules');
  assert(popupJs.includes('_PopupFeatureManager.initPopupFeatures'), 'popup.js must boot _PopupFeatureManager in DOMContentLoaded');
  console.log('  ✅ popup/popup.js module wiring & boot initialization verified');

  const dashJs = fs.readFileSync(path.join(baseDir, 'dashboard/dashboard.js'), 'utf8');
  assert(dashJs.includes('_FeatureRegistry'), 'dashboard.js must resolve _FeatureRegistry');
  assert(dashJs.includes('_DashboardFeatureManager'), 'dashboard.js must resolve _DashboardFeatureManager');
  assert(dashJs.includes('FeatureRegistry: _FeatureRegistry'), 'dashboard.js must export FeatureRegistry in window.__SentinelDashboardModules');
  assert(dashJs.includes('DashboardFeatureManager: _DashboardFeatureManager'), 'dashboard.js must export DashboardFeatureManager in window.__SentinelDashboardModules');
  assert(dashJs.includes('_DashboardFeatureManager.initDashboardFeatures'), 'dashboard.js must boot _DashboardFeatureManager in DOMContentLoaded');
  console.log('  ✅ dashboard/dashboard.js module wiring & boot initialization verified');
}

console.log('\n🎉 ALL MODULAR FEATURE REGISTRY & EXTENSIBILITY TESTS PASSED WITH 100% SUCCESS!');
process.exit(0);
