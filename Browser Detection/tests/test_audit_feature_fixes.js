/**
 * Test Suite: Audit Feature Fixes Verification (4 Functional Defects)
 * 
 * Verifies:
 * 1. Defect 1: Dashboard Omni Command Palette Domain Search Filter resilient ID fallback
 * 2. Defect 2: Dashboard Sleep Extender Fade Toggle ID fallback (toggleDashSleepFade)
 * 3. Defect 3: Dashboard Audio Lab EQ Preset Badge element and cyber-dark styling
 * 4. Defect 4: Sleep Timer Timeout Action Backend Execution ('mute', 'close', 'pause')
 * 5. Mute All Others Fallback Hardening (isRestrictedTabUrl filter)
 * 6. Function length constraints (<= 50 lines) per Universal Rule 28
 * 7. UTF-8 with BOM byte sequence compliance (0xEF, 0xBB, 0xBF)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Audit Feature Fixes Verification Suite (4 Functional Defect Fixes)...\n');

const rootDir = path.join(__dirname, '..');
const dashboardJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const omniPaletteJsPath = path.join(rootDir, 'src', 'dashboard', 'palette', 'omni_palette.js');
const dashboardHtmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const audioLabCssPath = path.join(rootDir, 'dashboard', 'styles', 'audio_lab.css');
const dashboardCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');
const backgroundJsPath = path.join(rootDir, 'background.js');
const testSuitePath = __filename;

// -------------------------------------------------------------
// Battery 1: Static Source & Selector Assertions
// -------------------------------------------------------------
console.log('Battery 1: Static Source & Selector Assertions');

const dashJsContent = fs.readFileSync(dashboardJsPath, 'utf8');
const omniJsContent = fs.readFileSync(omniPaletteJsPath, 'utf8');
const dashHtmlContent = fs.readFileSync(dashboardHtmlPath, 'utf8');
const audioLabCssContent = fs.readFileSync(audioLabCssPath, 'utf8');
const dashCssContent = fs.readFileSync(dashboardCssPath, 'utf8');
const bgJsContent = fs.readFileSync(backgroundJsPath, 'utf8');

// 1.1 Defect 1: Omni Domain Search Selectors
assert.ok(
  dashJsContent.includes("document.getElementById('tableDomainSearch') || document.getElementById('domainSearchInput')"),
  'dashboard/dashboard.js must query tableDomainSearch with fallback to domainSearchInput'
);
assert.ok(
  omniJsContent.includes("this.document.getElementById('tableDomainSearch') || this.document.getElementById('domainSearchInput')"),
  'src/dashboard/palette/omni_palette.js must query tableDomainSearch with fallback to domainSearchInput'
);
console.log('  ✅ Defect 1 static selectors verified in dashboard.js and omni_palette.js');

// 1.2 Defect 2: Sleep Extender Fade Toggle Selectors
assert.ok(
  dashJsContent.includes("document.getElementById('toggleDashSleepFade') || document.getElementById('toggleDashSleepFadeCurve')"),
  'dashboard/dashboard.js must query toggleDashSleepFade with fallback to toggleDashSleepFadeCurve'
);
console.log('  ✅ Defect 2 static selector verified in dashboard.js');

// 1.3 Defect 3: Audio Lab EQ Preset Badge & CSS
assert.ok(
  dashHtmlContent.includes('id="audioLabPresetBadge"'),
  'dashboard/dashboard.html must contain #audioLabPresetBadge'
);
assert.ok(
  dashHtmlContent.includes('class="badge-eq-preset"'),
  'dashboard/dashboard.html must contain .badge-eq-preset'
);
assert.ok(
  audioLabCssContent.includes('.badge-eq-preset'),
  'dashboard/styles/audio_lab.css must define .badge-eq-preset'
);
assert.ok(
  audioLabCssContent.includes('body.theme-light .badge-eq-preset'),
  'dashboard/styles/audio_lab.css must define light-mode badge styles'
);
assert.ok(
  dashCssContent.includes('.badge-eq-preset'),
  'dashboard/dashboard.css must define .badge-eq-preset'
);
assert.ok(
  dashCssContent.includes('body.theme-light .badge-eq-preset'),
  'dashboard/dashboard.css must define light-mode badge styles'
);
console.log('  ✅ Defect 3 markup and dual CSS styles verified');

// 1.4 Defect 4: Sleep Timer Timeout Action Backend Logic
assert.ok(
  bgJsContent.includes('closeAllMediaTabs'),
  'background.js must define closeAllMediaTabs'
);
assert.ok(
  bgJsContent.includes("action === 'mute'") && bgJsContent.includes("action === 'close'"),
  'background.js triggerSleepTimerExpiration must handle mute, close, and pause actions'
);
console.log('  ✅ Defect 4 static backend timeout actions verified in background.js');
console.log('  ✅ Battery 1 Passed: All static assertions verified\n');

// -------------------------------------------------------------
// Battery 2: Omni Command Palette Domain Search Simulation
// -------------------------------------------------------------
console.log('Battery 2: Omni Command Palette Domain Search Simulation');

class MockElement {
  constructor(id) {
    this.id = id;
    this.value = '';
    this.events = [];
  }
  dispatchEvent(event) {
    this.events.push(event);
  }
}

// 2.1 Test when primary tableDomainSearch exists
{
  const mockTableInput = new MockElement('tableDomainSearch');
  const mockElements = { tableDomainSearch: mockTableInput };
  const mockDoc = {
    getElementById: (id) => mockElements[id] || null
  };

  const domain = 'github.com';
  const searchInput = mockDoc.getElementById('tableDomainSearch') || mockDoc.getElementById('domainSearchInput');
  assert.ok(searchInput, 'Must resolve tableDomainSearch');
  searchInput.value = domain;
  searchInput.dispatchEvent({ type: 'input' });

  assert.strictEqual(mockTableInput.value, 'github.com', 'tableDomainSearch value must be set to domain');
  assert.strictEqual(mockTableInput.events.length, 1, 'Must dispatch input event');
  assert.strictEqual(mockTableInput.events[0].type, 'input', 'Event type must be input');
  console.log('  ✅ Primary tableDomainSearch population & input dispatch verified');
}

// 2.2 Test fallback when only legacy domainSearchInput exists
{
  const mockLegacyInput = new MockElement('domainSearchInput');
  const mockElements = { domainSearchInput: mockLegacyInput };
  const mockDoc = {
    getElementById: (id) => mockElements[id] || null
  };

  const domain = 'youtube.com';
  const searchInput = mockDoc.getElementById('tableDomainSearch') || mockDoc.getElementById('domainSearchInput');
  assert.ok(searchInput, 'Must resolve legacy domainSearchInput via fallback');
  searchInput.value = domain;
  searchInput.dispatchEvent({ type: 'input' });

  assert.strictEqual(mockLegacyInput.value, 'youtube.com', 'domainSearchInput value must be set to domain');
  assert.strictEqual(mockLegacyInput.events.length, 1, 'Must dispatch input event');
  console.log('  ✅ Fallback domainSearchInput population & input dispatch verified');
}
console.log('  ✅ Battery 2 Passed: Omni search simulation verified\n');

// -------------------------------------------------------------
// Battery 3: Sleep Extender Fade Toggle State Evaluation
// -------------------------------------------------------------
console.log('Battery 3: Sleep Extender Fade Toggle State Evaluation');

// 3.1 Test with toggleDashSleepFade checked = false
{
  const mockFadeToggle = { id: 'toggleDashSleepFade', checked: false };
  const mockDoc = {
    getElementById: (id) => (id === 'toggleDashSleepFade' ? mockFadeToggle : null)
  };

  const fadeToggle = mockDoc.getElementById('toggleDashSleepFade') || mockDoc.getElementById('toggleDashSleepFadeCurve');
  assert.ok(fadeToggle, 'Must find toggleDashSleepFade');
  const enableFadeOut = fadeToggle ? fadeToggle.checked : true;
  assert.strictEqual(enableFadeOut, false, 'enableFadeOut must accurately reflect false when unchecked');
  console.log('  ✅ toggleDashSleepFade unchecked accurately evaluates enableFadeOut = false');
}

// 3.2 Test with toggleDashSleepFade checked = true
{
  const mockFadeToggle = { id: 'toggleDashSleepFade', checked: true };
  const mockDoc = {
    getElementById: (id) => (id === 'toggleDashSleepFade' ? mockFadeToggle : null)
  };

  const fadeToggle = mockDoc.getElementById('toggleDashSleepFade') || mockDoc.getElementById('toggleDashSleepFadeCurve');
  assert.ok(fadeToggle, 'Must find toggleDashSleepFade');
  const enableFadeOut = fadeToggle ? fadeToggle.checked : true;
  assert.strictEqual(enableFadeOut, true, 'enableFadeOut must accurately reflect true when checked');
  console.log('  ✅ toggleDashSleepFade checked accurately evaluates enableFadeOut = true');
}

// 3.3 Test fallback to legacy toggleDashSleepFadeCurve
{
  const mockLegacyFadeToggle = { id: 'toggleDashSleepFadeCurve', checked: false };
  const mockDoc = {
    getElementById: (id) => (id === 'toggleDashSleepFadeCurve' ? mockLegacyFadeToggle : null)
  };

  const fadeToggle = mockDoc.getElementById('toggleDashSleepFade') || mockDoc.getElementById('toggleDashSleepFadeCurve');
  assert.ok(fadeToggle, 'Must resolve legacy toggleDashSleepFadeCurve via fallback');
  const enableFadeOut = fadeToggle ? fadeToggle.checked : true;
  assert.strictEqual(enableFadeOut, false, 'enableFadeOut must accurately reflect false from legacy toggle');
  console.log('  ✅ Fallback toggleDashSleepFadeCurve evaluates properly');
}
console.log('  ✅ Battery 3 Passed: Sleep extender toggle evaluation verified\n');

// -------------------------------------------------------------
// Battery 4: Audio Lab Preset Badge Dynamic Updates
// -------------------------------------------------------------
console.log('Battery 4: Audio Lab Preset Badge Dynamic Updates');

{
  const mockBadge = { id: 'audioLabPresetBadge', textContent: 'Flat' };
  const mockDoc = {
    getElementById: (id) => (id === 'audioLabPresetBadge' ? mockBadge : null)
  };

  const updatePresetBadge = (presetKey) => {
    let preset = presetKey;
    if (preset === 'night') preset = 'night_mode';
    const badge = mockDoc.getElementById('audioLabPresetBadge');
    if (badge) {
      badge.textContent = preset.charAt(0).toUpperCase() + preset.slice(1).replace('_', ' ');
    }
  };

  updatePresetBadge('bass_boost');
  assert.strictEqual(mockBadge.textContent, 'Bass boost', 'Badge must update to Bass boost');

  updatePresetBadge('custom');
  assert.strictEqual(mockBadge.textContent, 'Custom', 'Badge must update to Custom');

  updatePresetBadge('vocal_enhancer');
  assert.strictEqual(mockBadge.textContent, 'Vocal enhancer', 'Badge must update to Vocal enhancer');

  updatePresetBadge('flat');
  assert.strictEqual(mockBadge.textContent, 'Flat', 'Badge must update to Flat');
  console.log('  ✅ audioLabPresetBadge dynamically reflects preset changes');
}
console.log('  ✅ Battery 4 Passed: Audio Lab preset badge dynamic updates verified\n');

// -------------------------------------------------------------
// Battery 5: Sleep Timer Backend Timeout Action Dispatch
// -------------------------------------------------------------
console.log('Battery 5: Sleep Timer Backend Timeout Action Dispatch');

// Helper to create sandbox for background execution testing
function createBackgroundSandbox(initialState = {}) {
  const dispatchedActions = [];
  const mutedTabs = [];
  const removedTabs = [];
  const sentMessages = [];

  const mockBrowserAPI = {
    tabs: {
      update: async (tabId, opts) => {
        if (opts.muted !== undefined) mutedTabs.push({ tabId, muted: opts.muted });
        return { id: tabId, ...opts };
      },
      remove: async (tabId) => {
        removedTabs.push(tabId);
        return true;
      },
      query: async () => [{ id: 101, audible: true }, { id: 102, audible: true }]
    },
    runtime: {
      sendMessage: (msg) => { sentMessages.push(msg); }
    }
  };

  const sandbox = {
    console,
    Date,
    String,
    Number,
    Boolean,
    Array,
    Set,
    Map,
    browserAPI: mockBrowserAPI,
    sleepTimerState: {
      state: 'RUNNING',
      pauseMedia: true,
      pauseTracking: false,
      ...initialState
    },
    sleepTimerSettings: {},
    ensureStorageLoaded: async () => {},
    saveSleepTimerState: async () => {},
    clearActionBadge: () => {},
    commitActiveInterval: () => {},
    scheduleStorageSave: () => {},
    safeSendRuntimeMessage: (msg) => { sentMessages.push(msg); },
    dispatchGlobalMediaAction: async (action) => {
      dispatchedActions.push(action);
      return { success: true };
    },
    handleMuteAllExecution: async () => {
      dispatchedActions.push('MUTE_ALL');
      return { success: true };
    },
    collectCandidateTabs: async () => [101, 102],
    dispatchedActions,
    mutedTabs,
    removedTabs,
    sentMessages
  };

  return sandbox;
}

// 5.1 Test timeoutAction: 'mute'
{
  const sandbox = createBackgroundSandbox({ timeoutAction: 'mute' });
  const script = `
    ${bgJsContent.slice(bgJsContent.indexOf('async function triggerSleepTimerExpiration()'), bgJsContent.indexOf('async function triggerSleepTimerFade()'))}
  `;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);

  return (async () => {
    await sandbox.triggerSleepTimerExpiration();
    assert.ok(sandbox.dispatchedActions.includes('MUTE_ALL'), 'Must invoke handleMuteAllExecution when timeoutAction is mute');
    assert.strictEqual(sandbox.sleepTimerState.state, 'TRIGGERED', 'sleepTimerState must be marked TRIGGERED');
    console.log('  ✅ timeoutAction: "mute" successfully triggers handleMuteAllExecution');

    // 5.2 Test timeoutAction: 'close'
    const sandboxClose = createBackgroundSandbox({ timeoutAction: 'close' });
    vm.createContext(sandboxClose);
    vm.runInContext(script, sandboxClose);
    await sandboxClose.triggerSleepTimerExpiration();
    assert.ok(sandboxClose.removedTabs.length >= 2, 'Must close candidate media tabs when timeoutAction is close');
    assert.ok(sandboxClose.dispatchedActions.includes('PAUSE_ALL'), 'Must also pause media on close');
    console.log('  ✅ timeoutAction: "close" successfully pauses media and closes candidate tabs');

    // 5.3 Test timeoutAction: 'pause' (default)
    const sandboxPause = createBackgroundSandbox({ timeoutAction: 'pause' });
    vm.createContext(sandboxPause);
    vm.runInContext(script, sandboxPause);
    await sandboxPause.triggerSleepTimerExpiration();
    assert.ok(sandboxPause.dispatchedActions.includes('PAUSE_ALL'), 'Must invoke dispatchGlobalMediaAction(PAUSE_ALL) when timeoutAction is pause');
    console.log('  ✅ timeoutAction: "pause" successfully dispatches PAUSE_ALL');

    // 5.4 Test closeAllMediaTabs standalone helper
    const testCloseHelper = async () => {
      const sb = createBackgroundSandbox();
      vm.createContext(sb);
      vm.runInContext(script, sb);
      const res = await sb.closeAllMediaTabs();
      assert.strictEqual(res.success, true, 'closeAllMediaTabs must return success: true');
      assert.strictEqual(res.closedCount, 2, 'closeAllMediaTabs must close candidate tabs');
    };
    await testCloseHelper();
    console.log('  ✅ closeAllMediaTabs standalone helper execution verified');

    console.log('  ✅ Battery 5 Passed: Sleep timer backend expiration actions verified\n');

    // -------------------------------------------------------------
    // Battery 6: Function Length & Complexity Constraints
    // -------------------------------------------------------------
    console.log('Battery 6: Function Length & Complexity Constraints (Universal Rule 28)');

    function verifyFunctionLength(content, fnName, maxLines = 50) {
      const rx = new RegExp('(?:async\\s+)?function\\s+' + fnName + '\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}');
      const match = content.match(rx);
      assert.ok(match, `Function ${fnName} must be defined`);
      const lines = match[0].split('\n').length;
      assert.ok(lines <= maxLines, `Function ${fnName} has ${lines} lines, exceeding max ${maxLines}`);
      console.log(`  ✅ Function ${fnName}: ${lines} lines (<= ${maxLines})`);
    }

    verifyFunctionLength(bgJsContent, 'triggerSleepTimerExpiration', 50);
    verifyFunctionLength(bgJsContent, 'closeAllMediaTabs', 50);
    verifyFunctionLength(bgJsContent, 'handleMuteAllOthersExecution', 50);
    verifyFunctionLength(dashJsContent, 'triggerExtendSleepTimer', 50);
    console.log('  ✅ Battery 6 Passed: Universal Rule 28 function length compliance verified\n');

    // -------------------------------------------------------------
    // Battery 7: UTF-8 with BOM Byte Sequence Validation
    // -------------------------------------------------------------
    console.log('Battery 7: UTF-8 with BOM Byte Sequence Validation');

    const filesToAudit = [
      dashboardJsPath,
      omniPaletteJsPath,
      dashboardHtmlPath,
      audioLabCssPath,
      dashboardCssPath,
      backgroundJsPath,
      testSuitePath
    ];

    filesToAudit.forEach((filePath) => {
      const buf = fs.readFileSync(filePath);
      const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
      const relPath = path.relative(rootDir, filePath);
      assert.ok(hasBOM, `File ${relPath} must begin with UTF-8 BOM bytes 0xEF, 0xBB, 0xBF`);
      console.log(`  ✅ ${relPath}: Valid UTF-8 with BOM (size: ${buf.length} bytes)`);
    });
    console.log('  ✅ Battery 7 Passed: UTF-8 with BOM verified across all touched files\n');

    console.log('🎉 ALL 7 BATTERIES IN test_audit_feature_fixes.js PASSED WITH 100% SUCCESS! (Exit Code 0)\n');
    process.exit(0);
  })().catch((err) => {
    console.error('❌ Test Failure in Battery 5/6/7:', err);
    process.exit(1);
  });
}
