/**
 * Verification Test Suite: Extension Syntax, Manifest & File Integrity
 * 
 * Verifies:
 * 1. Syntax & Compilation check on all JS files via `node -c` and `vm.Script`
 * 2. Specific integrity of popup/popup.js (no unexpected token '}', clean transition after processDomainStats)
 * 3. manifest.json V3 integrity, version bump to 2.4.1, and all critical permissions
 * 4. Physical existence of all assets, icons, scripts, and HTML pages declared in manifest
 * 5. HTML script binding and version label consistency
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

console.log('🧪 Starting Extension Syntax, Manifest & File Integrity Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Test 1: Node.js Compiler Syntax Check (`node -c`) on All Extension Scripts
// ---------------------------------------------------------------------------
console.log('Test 1: Node.js Compiler Syntax Check (`node -c`) on All Extension Scripts');
{
  const targetScripts = [
    'popup/popup.js',
    'background.js',
    'dashboard/dashboard.js',
    'content_media.js',
    'inject_main_world.js'
  ];

  targetScripts.forEach((relPath) => {
    const fullPath = path.join(baseDir, relPath);
    assert(fs.existsSync(fullPath), `Target script must exist: ${relPath}`);

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
  const targetScripts = [
    'popup/popup.js',
    'background.js',
    'dashboard/dashboard.js',
    'content_media.js',
    'inject_main_world.js'
  ];

  targetScripts.forEach((relPath) => {
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
// Test 3: Dedicated popup/popup.js Structural & Brace Integrity
// ---------------------------------------------------------------------------
console.log('\nTest 3: Dedicated popup/popup.js Structural & Brace Integrity');
{
  const popupJsPath = path.join(baseDir, 'popup/popup.js');
  const code = fs.readFileSync(popupJsPath, 'utf8');

  // Verify processDomainStats function existence
  const procIndex = code.indexOf('function processDomainStats(');
  assert(procIndex !== -1, 'popup.js must define processDomainStats');

  // Verify renderDonutChart function existence
  const donutIndex = code.indexOf('function renderDonutChart(');
  assert(donutIndex !== -1, 'popup.js must define renderDonutChart');

  // Verify segment between processDomainStats and renderDonutChart
  const segment = code.substring(procIndex, donutIndex);
  
  // Count closing braces inside processDomainStats function definition
  const closingBraceMatches = segment.match(/}/g) || [];
  const openingBraceMatches = segment.match(/{/g) || [];

  // Opening and closing braces inside this segment must match exactly
  assert.strictEqual(
    openingBraceMatches.length,
    closingBraceMatches.length,
    `Braces inside processDomainStats must balance exactly! Open: ${openingBraceMatches.length}, Close: ${closingBraceMatches.length}`
  );

  // Check no stray closing brace between the end of processDomainStats and renderDonutChart comment
  const commentIndex = segment.lastIndexOf('/**');
  assert(commentIndex !== -1, 'Docstring comment for renderDonutChart must exist');
  const betweenCode = segment.substring(segment.lastIndexOf('}') + 1, commentIndex).trim();
  assert.strictEqual(betweenCode, '', 'No stray code or closing braces between processDomainStats and renderDonutChart');

  console.log('  ✅ processDomainStats and renderDonutChart have perfectly balanced braces');
  console.log('  ✅ Zero dangling closing braces between functions (Bug 804:1 prevented)');
}

// ---------------------------------------------------------------------------
// Test 4: Manifest V3 Schema, Permissions & Version 2.4.2 Validation
// ---------------------------------------------------------------------------
console.log('\nTest 4: Manifest V3 Schema, Permissions & Version 2.4.2 Validation');
{
  const manifestPath = path.join(baseDir, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.strictEqual(manifest.manifest_version, 3, 'manifest_version must be 3');
  assert.strictEqual(manifest.version, '2.4.2', 'version must be bumped to 2.4.2');
  assert.strictEqual(manifest.name, 'Web Activity & Media Sentinel', 'Extension name must be exact');

  // Essential MV3 permissions
  const requiredPermissions = [
    'tabs',
    'activeTab',
    'storage',
    'idle',
    'alarms',
    'nativeMessaging',
    'scripting'
  ];

  requiredPermissions.forEach((perm) => {
    assert(manifest.permissions.includes(perm), `manifest.permissions must include "${perm}"`);
  });

  // Verify background worker
  assert.strictEqual(manifest.background.service_worker, 'background.js', 'background worker must be background.js');
  assert.strictEqual(manifest.background.type, 'module', 'background worker type must be module');

  // Verify action popup
  assert.strictEqual(manifest.action.default_popup, 'popup/popup.html', 'default_popup must be popup/popup.html');

  console.log('  ✅ manifest.json version is 2.4.2 (ready for Chrome extension reload)');
  console.log('  ✅ All 7 required MV3 permissions are strictly declared');
  console.log('  ✅ Background service worker and default popup configured correctly');
}

// ---------------------------------------------------------------------------
// Test 5: Physical Asset & Script Linkage Verification
// ---------------------------------------------------------------------------
console.log('\nTest 5: Physical Asset & Script Linkage Verification');
{
  const manifestPath = path.join(baseDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Verify all icon paths exist
  Object.values(manifest.icons).forEach((iconRel) => {
    const iconPath = path.join(baseDir, iconRel);
    assert(fs.existsSync(iconPath), `Icon file must exist: ${iconRel}`);
  });

  // Verify content scripts exist
  manifest.content_scripts.forEach((cs) => {
    cs.js.forEach((scriptRel) => {
      const scriptPath = path.join(baseDir, scriptRel);
      assert(fs.existsSync(scriptPath), `Content script must exist: ${scriptRel}`);
    });
  });

  // Verify popup HTML and JS linkage
  const popupHtmlPath = path.join(baseDir, 'popup/popup.html');
  assert(fs.existsSync(popupHtmlPath), 'popup/popup.html must exist');
  const popupHtml = fs.readFileSync(popupHtmlPath, 'utf8');
  assert(popupHtml.includes('src="popup.js"'), 'popup.html must link to popup.js');

  // Verify dashboard HTML and JS linkage + version label
  const dashHtmlPath = path.join(baseDir, 'dashboard/dashboard.html');
  assert(fs.existsSync(dashHtmlPath), 'dashboard/dashboard.html must exist');
  const dashHtml = fs.readFileSync(dashHtmlPath, 'utf8');
  assert(dashHtml.includes('src="dashboard.js"'), 'dashboard.html must link to dashboard.js');
  assert(dashHtml.includes('v2.4.2 Production Edition'), 'dashboard.html must display v2.4.2 Production Edition');

  console.log('  ✅ All manifest icons, content scripts, and web accessible files exist');
  console.log('  ✅ popup.html links directly to popup.js');
  console.log('  ✅ dashboard.html links directly to dashboard.js with v2.4.2 label');
}

// ---------------------------------------------------------------------------
// Test 6: Safe Tab & Runtime Messaging Rejection Handling Test Suite
// ---------------------------------------------------------------------------
console.log('\nTest 6: Safe Tab & Runtime Messaging Rejection Handling Test Suite');
(async () => {
  // Load background.js environment in vm
  const bgPath = path.join(baseDir, 'background.js');
  const bgCode = fs.readFileSync(bgPath, 'utf8');

  // Mock minimal chrome environment for background.js execution
  let sentTabMessages = [];
  let sentRuntimeMessages = [];
  let unhandledListeners = [];

  const mockChrome = {
    runtime: {
      id: 'test-ext-id',
      lastError: null,
      sendMessage: (msg, cb) => {
        sentRuntimeMessages.push(msg);
        // Simulate no receiving end Promise rejection
        const p = Promise.reject(new Error('Could not establish connection. Receiving end does not exist.'));
        if (typeof cb === 'function') {
          mockChrome.runtime.lastError = { message: 'Could not establish connection. Receiving end does not exist.' };
          cb(null);
        }
        return p;
      },
      onMessage: { addListener: () => {} },
      onSuspend: { addListener: () => {} },
      getManifest: () => ({ version: '2.4.2' })
    },
    tabs: {
      get: async (tabId) => {
        if (tabId === 101) return { id: 101, url: 'chrome://extensions' };
        if (tabId === 102) return { id: 102, url: 'edge://settings' };
        if (tabId === 103) return { id: 103, url: 'about:blank' };
        if (tabId === 104) return { id: 104, url: 'devtools://devtools/bundled/inspector.html' };
        if (tabId === 105) return { id: 105, url: 'chrome-extension://opiinjipkdkeolidiofmhncoegmaijmm/dashboard/dashboard.html' };
        if (tabId === 201) return { id: 201, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
        if (tabId === 202) return { id: 202, url: 'https://github.com' };
        return null;
      },
      sendMessage: (tabId, msg, cb) => {
        sentTabMessages.push({ tabId, msg });
        // Simulate no receiving end Promise rejection
        const p = Promise.reject(new Error('Could not establish connection. Receiving end does not exist.'));
        if (typeof cb === 'function') {
          mockChrome.runtime.lastError = { message: 'Could not establish connection. Receiving end does not exist.' };
          cb(null);
        }
        return p;
      },
      query: async () => [],
      onActivated: { addListener: () => {} },
      onUpdated: { addListener: () => {} },
      onRemoved: { addListener: () => {} }
    },
    windows: {
      onFocusChanged: { addListener: () => {} }
    },
    storage: {
      local: {
        get: async () => ({}),
        set: async () => ({})
      },
      onChanged: { addListener: () => {} }
    },
    idle: {
      onStateChanged: { addListener: () => {} },
      setDetectionInterval: () => {}
    },
    alarms: {
      create: () => {},
      onAlarm: { addListener: () => {} }
    },
    scripting: {
      executeScript: async () => []
    }
  };

  const sandbox = {
    console,
    Date,
    Math,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    Promise,
    Error,
    JSON,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    WebSocket: class {
      constructor() {}
      send() {}
      close() {}
    },
    chrome: mockChrome,
    browser: mockChrome,
    navigator: { userAgent: 'Chrome/120.0.0.0' },
    addEventListener: (type, fn) => {
      if (type === 'unhandledrejection') unhandledListeners.push(fn);
    }
  };
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(bgCode, sandbox);

  // 6A. Verify isRestrictedTabUrl
  const isRestricted = sandbox.isRestrictedTabUrl;
  assert(typeof isRestricted === 'function', 'isRestrictedTabUrl must be defined');
  assert.strictEqual(isRestricted('chrome://extensions'), true, 'chrome:// must be restricted');
  assert.strictEqual(isRestricted('edge://settings'), true, 'edge:// must be restricted');
  assert.strictEqual(isRestricted('about:blank'), true, 'about: must be restricted');
  assert.strictEqual(isRestricted('devtools://inspector'), true, 'devtools:// must be restricted');
  assert.strictEqual(isRestricted('chrome-extension://abc/popup.html'), true, 'chrome-extension:// must be restricted');
  assert.strictEqual(isRestricted('https://chromewebstore.google.com/detail/123'), true, 'Chrome Web Store must be restricted');
  assert.strictEqual(isRestricted('https://www.youtube.com/watch?v=123'), false, 'YouTube must not be restricted');
  assert.strictEqual(isRestricted('https://github.com/aiprincekumar'), false, 'GitHub must not be restricted');
  console.log('  ✅ isRestrictedTabUrl accurately filters restricted schemes and web stores');

  // 6B. Verify safeSendTabMessage skips restricted tabs
  sentTabMessages = [];
  const restrictedResult = await sandbox.safeSendTabMessage(101, { type: 'QUERY_PAGE_MEDIA' });
  assert.strictEqual(restrictedResult, null, 'Restricted tab message must return null');
  assert.strictEqual(sentTabMessages.length, 0, 'tabs.sendMessage must NOT be called for restricted schemes');
  console.log('  ✅ safeSendTabMessage safely skips restricted tab schemes (0 IPC calls made)');

  // 6C. Verify safeSendTabMessage catches rejected promise on normal tabs without throwing
  let callbackInvoked = false;
  let receivedErr = null;
  const normalResult = await sandbox.safeSendTabMessage(201, { type: 'QUERY_PAGE_MEDIA' }, (res, err) => {
    callbackInvoked = true;
    receivedErr = err;
  });
  assert.strictEqual(callbackInvoked, true, 'safeSendTabMessage callback must be invoked');
  assert(receivedErr, 'Error must be delivered to callback without crashing');
  assert(receivedErr.message.includes('Could not establish connection') || receivedErr.message.includes('Receiving end does not exist'));
  assert.strictEqual(normalResult, null, 'Handled rejection resolves cleanly to null');
  console.log('  ✅ safeSendTabMessage catches "Receiving end does not exist" promise rejection cleanly');

  // 6D. Verify safeSendRuntimeMessage catches rejected promise when no views are open
  const runtimeResult = await sandbox.safeSendRuntimeMessage({ type: 'DATA_HUB_STATUS_CHANGED', connected: true });
  assert.strictEqual(runtimeResult, null, 'safeSendRuntimeMessage returns null on closed views without throwing');
  console.log('  ✅ safeSendRuntimeMessage suppresses closed view promise rejection without unhandled error');

  // 6E. Verify global unhandledrejection listener suppresses benign errors
  assert(unhandledListeners.length > 0, 'unhandledrejection listener must be registered');
  let defaultPrevented = false;
  const mockEvent = {
    reason: new Error('Could not establish connection. Receiving end does not exist.'),
    preventDefault: () => { defaultPrevented = true; }
  };
  unhandledListeners[0](mockEvent);
  assert.strictEqual(defaultPrevented, true, 'unhandledrejection listener must call preventDefault() on connection errors');

  // Unrelated errors should NOT be suppressed
  let fatalPrevented = false;
  const fatalEvent = {
    reason: new Error('ReferenceError: somethingElse is not defined'),
    preventDefault: () => { fatalPrevented = true; }
  };
  unhandledListeners[0](fatalEvent);
  assert.strictEqual(fatalPrevented, false, 'Fatal errors must not be suppressed');
  console.log('  ✅ Global unhandledrejection sentinel suppresses benign IPC connection errors only');

  console.log('\n🎉 ALL EXTENSION SYNTAX, MANIFEST & FILE INTEGRITY TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
})();
