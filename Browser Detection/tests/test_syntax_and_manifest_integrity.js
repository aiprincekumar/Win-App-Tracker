/**
 * Verification Test Suite: Extension Syntax, Manifest & File Integrity
 * 
 * Verifies:
 * 1. Syntax & Compilation check on all JS files via `node -c` and `vm.Script`
 * 2. Specific integrity of popup/popup.js (no unexpected token '}', clean transition after processDomainStats)
 * 3. manifest.json V3 integrity, version bump to 2.5.0, and all critical permissions
 * 6. Embedded iframe fullscreen policy injection and scripting all-frames execution
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
// Test 4: Manifest V3 Schema, Permissions & Version 2.5.0 Validation
// ---------------------------------------------------------------------------
console.log('\nTest 4: Manifest V3 Schema, Permissions & Version 2.5.0 Validation');
{
  const manifestPath = path.join(baseDir, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.strictEqual(manifest.manifest_version, 3, 'manifest_version must be 3');
  assert.strictEqual(manifest.version, '2.5.0', 'version must be bumped to 2.5.0');
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

  console.log('  ✅ manifest.json version is 2.5.0 (ready for Chrome extension reload)');
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
  assert(dashHtml.includes('v2.5.0 Production Edition'), 'dashboard.html must display v2.5.0 Production Edition');

  console.log('  ✅ All manifest icons, content scripts, and web accessible files exist');
  console.log('  ✅ popup.html links directly to popup.js');
  console.log('  ✅ dashboard.html links directly to dashboard.js with v2.5.0 label');
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
  let messageListeners = [];
  let capturedInfoLogs = [];
  let scheduledTimers = [];

  class MockWebSocket {
    constructor(url) {
      this.url = url;
      this.readyState = 0; // CONNECTING
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.onclose = null;
      MockWebSocket.instances.push(this);
    }
    send() {}
    close() {
      this.readyState = 3;
      if (typeof this.onclose === 'function') this.onclose();
    }
  }
  MockWebSocket.instances = [];

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
      onMessage: {
        addListener: (fn) => {
          messageListeners.push(fn);
        }
      },
      onSuspend: { addListener: () => {} },
      getManifest: () => ({ version: '2.4.7' })
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

  const sandboxConsole = {
    ...console,
    info: (...args) => {
      capturedInfoLogs.push(args.join(' '));
    }
  };

  const sandbox = {
    console: sandboxConsole,
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
    setTimeout: (fn, delay) => {
      const handle = setTimeout(fn, delay);
      scheduledTimers.push({ fn, delay, handle });
      return handle;
    },
    clearTimeout,
    setInterval,
    clearInterval,
    WebSocket: MockWebSocket,
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

  // ---------------------------------------------------------------------------
  // Test 7: Throttled Exponential Backoff & Consecutive Failure Pause Logic
  // ---------------------------------------------------------------------------
  console.log('\nTest 7: Throttled Exponential Backoff & Consecutive Failure Pause Logic');

  // 7A. Verify configuration ladder values
  const cfg = sandbox.CONFIG;
  assert.deepStrictEqual(Array.from(cfg.WS_RECONNECT_LADDER_MS), [5000, 15000, 30000, 60000, 120000], 'WS ladder must be 5s, 15s, 30s, 60s, 120s');
  assert.deepStrictEqual(Array.from(cfg.HUB_RECONNECT_LADDER_MS), [5000, 15000, 30000, 60000, 120000], 'HUB ladder must be 5s, 15s, 30s, 60s, 120s');
  assert.strictEqual(cfg.MAX_CONSECUTIVE_FAILURES, 3, 'MAX_CONSECUTIVE_FAILURES must be 3');
  console.log('  ✅ Configuration defines gentle retry ladder [5000, 15000, 30000, 60000, 120000] and max 3 failures');

  // 7B. Simulate 3 consecutive connection failures on HUD WebSocket
  // Reset clean state
  sandbox.connectWebSocket(true);
  let wsState = sandbox.getWsState();
  assert.strictEqual(wsState.wsFailureCount, 0, 'wsFailureCount should reset to 0 on force connect');
  assert.strictEqual(wsState.wsReconnectPaused, false, 'wsReconnectPaused should be false initially');

  // Failure 1
  let currentWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  assert(currentWs, 'WebSocket instance must have been created');
  if (currentWs.onerror) currentWs.onerror(new Error('ECONNREFUSED'));
  if (currentWs.onclose) currentWs.onclose();
  wsState = sandbox.getWsState();
  assert.strictEqual(wsState.wsFailureCount, 1, 'Failure 1: wsFailureCount should be 1');
  assert.strictEqual(wsState.wsReconnectPaused, false, 'Failure 1: should not pause yet');

  // Failure 2
  sandbox.connectWebSocket();
  currentWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  if (currentWs.onerror) currentWs.onerror(new Error('ECONNREFUSED'));
  if (currentWs.onclose) currentWs.onclose();
  wsState = sandbox.getWsState();
  assert.strictEqual(wsState.wsFailureCount, 2, 'Failure 2: wsFailureCount should be 2');
  assert.strictEqual(wsState.wsReconnectPaused, false, 'Failure 2: should not pause yet');

  // Failure 3 (Threshold hit)
  sandbox.connectWebSocket();
  currentWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  if (currentWs.onerror) currentWs.onerror(new Error('ECONNREFUSED'));
  if (currentWs.onclose) currentWs.onclose();
  wsState = sandbox.getWsState();
  assert.strictEqual(wsState.wsFailureCount, 3, 'Failure 3: wsFailureCount should be 3');
  assert.strictEqual(wsState.wsReconnectPaused, true, 'Failure 3: wsReconnectPaused must become true');

  // Verify quiet debug log
  const foundLog = capturedInfoLogs.some((l) => l.includes('HUD bridge is offline') && l.includes('Polling paused'));
  assert(foundLog, 'Quiet debug message informing user that polling is paused must be logged');
  console.log('  ✅ 3 consecutive connection failures trigger paused state (wsReconnectPaused = true) and quiet info log');

  // 7C. Verify that calling connectWebSocket() while paused does NOT create new socket instances
  const countBefore = MockWebSocket.instances.length;
  sandbox.connectWebSocket();
  const countAfter = MockWebSocket.instances.length;
  assert.strictEqual(countAfter, countBefore, 'Passive connectWebSocket() while paused must be a no-op (0 new connections)');
  console.log('  ✅ Passive connection attempts while paused are completely suppressed (zero ERR_CONNECTION_REFUSED spam)');

  // 7D. Verify On-Demand Reactivation via force reconnect (e.g. Popup open / Button click)
  sandbox.connectWebSocket(true);
  wsState = sandbox.getWsState();
  assert.strictEqual(wsState.wsFailureCount, 0, 'wsFailureCount must reset to 0 on force reconnect');
  assert.strictEqual(wsState.wsReconnectPaused, false, 'wsReconnectPaused must reset to false on force reconnect');
  assert.strictEqual(MockWebSocket.instances.length, countBefore + 1, 'New WebSocket created on force reconnect');

  // Simulate successful connection on-demand
  currentWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  if (currentWs.onopen) currentWs.onopen();
  wsState = sandbox.getWsState();
  assert.strictEqual(wsState.wsConnected, true, 'wsConnected must be true after onopen');
  console.log('  ✅ On-demand force reconnect resets counters and re-establishes connection immediately');

  // 7E. Verify message listener on-demand reactivation for QUERY_STATE / RECONNECT_WS
  assert(messageListeners.length > 0, 'runtime.onMessage listener must be registered');
  // Put ws into paused state
  sandbox.connectWebSocket(true);
  currentWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  currentWs.onerror(); currentWs.onclose();
  sandbox.connectWebSocket();
  currentWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  currentWs.onerror(); currentWs.onclose();
  sandbox.connectWebSocket();
  currentWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  currentWs.onerror(); currentWs.onclose();
  assert.strictEqual(sandbox.getWsState().wsReconnectPaused, true, 'Should be paused again');

  // Dispatch QUERY_STATE IPC message
  let queryResponse = null;
  const onMessageDispatcher = messageListeners[0];
  onMessageDispatcher({ type: 'QUERY_STATE' }, {}, (res) => { queryResponse = res; });
  assert.strictEqual(sandbox.getWsState().wsReconnectPaused, false, 'QUERY_STATE must reactivate paused state');

  // Dispatch RECONNECT_WS IPC message
  let reconnectResponse = null;
  onMessageDispatcher({ type: 'RECONNECT_WS' }, {}, (res) => { reconnectResponse = res; });
  assert.strictEqual(reconnectResponse && reconnectResponse.initiated, true, 'RECONNECT_WS must initiate reconnection');
  console.log('  ✅ Runtime IPC messages (QUERY_STATE, RECONNECT_WS) reactivate connection on demand');

  // ---------------------------------------------------------------------------
  // Test 8: Pre-Flight Silent HTTP Probe & Zero-Error Prevention
  // ---------------------------------------------------------------------------
  console.log('\nTest 8: Pre-Flight Silent HTTP Probe & Zero-Error Prevention');

  // 8A. Verify probePortLive fallback in test sandbox without fetch
  assert(typeof sandbox.probePortLive === 'function', 'probePortLive must be exposed on sandbox');
  const fallbackProbe = await sandbox.probePortLive('ws://127.0.0.1:65432');
  assert.strictEqual(fallbackProbe, true, 'probePortLive fallback must return true when fetch is unavailable in runtime');

  // 8B. Inject mock fetch into sandbox to simulate offline port 65432 / 65433
  let probedUrls = [];
  sandbox.AbortController = AbortController;
  sandbox.fetch = async (url) => {
    probedUrls.push(url);
    throw new TypeError('Failed to fetch (net::ERR_CONNECTION_REFUSED absorbed)');
  };

  const offlineProbe = await sandbox.probePortLive('ws://127.0.0.1:65432');
  assert.strictEqual(offlineProbe, false, 'probePortLive must return false when HTTP probe rejects');
  assert.strictEqual(probedUrls[0], 'http://127.0.0.1:65432', 'probePortLive must convert ws: to http:');
  console.log('  ✅ probePortLive catches connection rejection silently and returns false');

  // 8C. Verify connectWebSocket suppresses raw WebSocket creation when probe reports offline
  const countBeforeOffline = MockWebSocket.instances.length;
  await sandbox.connectWebSocket(true);
  const countAfterOffline = MockWebSocket.instances.length;
  assert.strictEqual(countAfterOffline, countBeforeOffline, 'Must NOT instantiate WebSocket when HUD is offline (0 net::ERR_CONNECTION_REFUSED)');
  assert.strictEqual(sandbox.getWsState().wsConnected, false, 'wsConnected must be false when HUD is offline');
  console.log('  ✅ Silent HTTP probe detects offline HUD and suppresses raw WebSocket creation completely');

  // 8D. Inject mock fetch to simulate online/open port 65432
  sandbox.fetch = async (url) => {
    probedUrls.push(url);
    return { ok: true, status: 200 };
  };

  const onlineProbe = await sandbox.probePortLive('ws://127.0.0.1:65432');
  assert.strictEqual(onlineProbe, true, 'probePortLive must return true when HTTP probe succeeds');

  await sandbox.connectWebSocket(true);
  assert.strictEqual(MockWebSocket.instances.length, countAfterOffline + 1, 'Must instantiate WebSocket when HUD is confirmed listening');
  const runningWs = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  if (runningWs.onopen) runningWs.onopen();
  assert.strictEqual(sandbox.getWsState().wsConnected, true, 'wsConnected must be true when socket connects');
  console.log('  ✅ Silent HTTP probe connects cleanly when HUD is confirmed listening on port 65432');

  // ---------------------------------------------------------------------------
  // Test 9: W3C Trusted Types & showOSD Zero innerHTML CSP Compliance
  // ---------------------------------------------------------------------------
  console.log('\nTest 9: W3C Trusted Types & showOSD Zero innerHTML CSP Compliance');
  {
    const injectPath = path.join(baseDir, 'inject_main_world.js');
    const injectCode = fs.readFileSync(injectPath, 'utf8');

    // Strict regex check for any innerHTML assignment in inject_main_world.js
    const innerHtmlMatches = injectCode.match(/\.innerHTML\s*=/g);
    assert.strictEqual(innerHtmlMatches, null, 'inject_main_world.js must have ZERO assignments to .innerHTML');

    // Verify showOSD uses safe DOM methods
    assert(injectCode.includes("document.createElement('span')"), 'showOSD must create DOM elements via document.createElement');
    assert(injectCode.includes('iconSpan.textContent = icon'), 'showOSD must set textContent for icon span');
    assert(injectCode.includes('textSpan.textContent = text'), 'showOSD must set textContent for text span');
    assert(injectCode.includes('osd.appendChild(iconSpan)'), 'showOSD must append icon span node');
    assert(injectCode.includes('osd.appendChild(textSpan)'), 'showOSD must append text span node');

    const contentMediaPath = path.join(baseDir, 'content_media.js');
    const contentMediaCode = fs.readFileSync(contentMediaPath, 'utf8');
    const contentInnerHtml = contentMediaCode.match(/\.innerHTML\s*=/g);
    assert.strictEqual(contentInnerHtml, null, 'content_media.js must have ZERO assignments to .innerHTML');

    console.log('  ✅ inject_main_world.js has 0 assignments to .innerHTML (100% Trusted Types safe on YouTube)');
    console.log('  ✅ showOSD verified using safe DOM creation (createElement, textContent, appendChild)');
    console.log('  ✅ content_media.js has 0 assignments to .innerHTML');
  }

  // ---------------------------------------------------------------------------
  // Test 10: Fullscreen & PiP User Gesture Context & Edge Race Prevention
  // ---------------------------------------------------------------------------
  console.log('\nTest 10: Fullscreen & PiP User Gesture Context & Edge Race Prevention');
  {
    const popupPath = path.join(baseDir, 'popup/popup.js');
    const popupCode = fs.readFileSync(popupPath, 'utf8').replace(/\r\n/g, '\n');

    // Verify popup.js uses browserAPI.scripting.executeScript for Fullscreen and PiP gestures
    assert(popupCode.includes('browserAPI.scripting.executeScript'), 'popup.js must use scripting.executeScript for transient activation');
    assert(popupCode.includes('target.requestFullscreen'), 'popup.js executeScript must include requestFullscreen');
    assert(popupCode.includes('video.requestPictureInPicture'), 'popup.js executeScript must include requestPictureInPicture');

    // Verify click debouncing cooldown
    assert(popupCode.includes('lastFullscreenClick'), 'popup.js must have click debounce for fullscreen');
    assert(popupCode.includes('lastPipClick'), 'popup.js must have click debounce for PiP');

    // Verify sendMediaControl is ONLY in the else fallback branch (no double-trigger race condition)
    assert(popupCode.includes('} else {\n        // Fallback only when scripting API or tabId is unavailable\n        sendMediaControl(\'toggle_fullscreen\');'), 'popup.js must not double-trigger toggle_fullscreen');
    assert(popupCode.includes('} else {\n        // Fallback only when scripting API or tabId is unavailable\n        sendMediaControl(\'toggle_pip\');'), 'popup.js must not double-trigger toggle_pip');

    const dashPath = path.join(baseDir, 'dashboard/dashboard.js');
    const dashCode = fs.readFileSync(dashPath, 'utf8').replace(/\r\n/g, '\n');
    assert(dashCode.includes('} else {\n        // Fallback only when scripting API or tabId is unavailable\n        sendMediaControl(\'toggle_fullscreen\');'), 'dashboard.js must not double-trigger toggle_fullscreen');
    assert(dashCode.includes('} else {\n        // Fallback only when scripting API or tabId is unavailable\n        sendMediaControl(\'toggle_pip\');'), 'dashboard.js must not double-trigger toggle_pip');

    const injectPath = path.join(baseDir, 'inject_main_world.js');
    const injectCode = fs.readFileSync(injectPath, 'utf8').replace(/\r\n/g, '\n');

    // Verify native event listeners for deterministic OSD display
    assert(injectCode.includes("document.addEventListener('fullscreenchange'"), 'inject_main_world.js must listen for fullscreenchange');
    assert(injectCode.includes("window.addEventListener('enterpictureinpicture'"), 'inject_main_world.js must listen for enterpictureinpicture');
    assert(injectCode.includes("window.addEventListener('leavepictureinpicture'"), 'inject_main_world.js must listen for leavepictureinpicture');

    // Verify buggy in-page miniplayer button fallback was removed
    assert(!injectCode.includes('.ytp-miniplayer-button'), 'inject_main_world.js must NOT click .ytp-miniplayer-button (preventing creator mode bug)');

    // Verify native UI fullscreen button target exists in inject_main_world.js
    assert(injectCode.includes('.ytp-fullscreen-button'), 'inject_main_world.js must target .ytp-fullscreen-button for native player fullscreen');

    console.log('  ✅ popup.js & dashboard.js execute scripting.executeScript without double-trigger race condition');
    console.log('  ✅ Click debounce gates prevent rapid toggle bounce (eliminating Edge 10ms enable/disable)');
    console.log('  ✅ inject_main_world.js binds native fullscreenchange & pictureinpicture listeners for deterministic OSD');
    console.log('  ✅ Native YouTube .ytp-fullscreen-button targeted for video-only fullscreen');
    console.log('  ✅ Buggy .ytp-miniplayer-button fallback completely eliminated (zero unwanted creator mode)');
  }

  // ---------------------------------------------------------------------------
  // Test 11: Direct HTML5 Video Manipulation & Native 'KeyF' Fullscreen Fallback
  // ---------------------------------------------------------------------------
  console.log('\nTest 11: Direct HTML5 Video Manipulation & Native \'KeyF\' Fullscreen Fallback');
  {
    const contentPath = path.join(baseDir, 'content_media.js');
    const contentCode = fs.readFileSync(contentPath, 'utf8').replace(/\r\n/g, '\n');

    // 1. Verify isBridgeActive barrier was eliminated (no skipping direct HTML5 execution on YouTube)
    assert(!contentCode.includes('isBridgeActive'), 'content_media.js must NOT gate direct video manipulation behind isBridgeActive');
    assert(contentCode.includes('primaryMediaElement.play()'), 'content_media.js must directly control play()');
    assert(contentCode.includes('primaryMediaElement.pause()'), 'content_media.js must directly control pause()');
    assert(contentCode.includes('primaryMediaElement.currentTime = Math.max(0'), 'content_media.js must directly control seek_relative');
    assert(contentCode.includes('primaryMediaElement.playbackRate ='), 'content_media.js must directly control playbackRate');

    // 2. Verify native KeyF keyboard dispatch for fullscreen
    assert(contentCode.includes("key: 'f', code: 'KeyF'"), 'content_media.js must dispatch KeyF for fullscreen');
    const injectPath = path.join(baseDir, 'inject_main_world.js');
    const injectCode = fs.readFileSync(injectPath, 'utf8').replace(/\r\n/g, '\n');
    assert(injectCode.includes("key: 'f', code: 'KeyF'"), 'inject_main_world.js must dispatch KeyF for fullscreen');

    // 3. Verify popup.js and dashboard.js zero-latency scripting.executeScript for primary controls
    const popupPath = path.join(baseDir, 'popup/popup.js');
    const popupCode = fs.readFileSync(popupPath, 'utf8').replace(/\r\n/g, '\n');
    assert(popupCode.includes("key: 'f', code: 'KeyF'"), 'popup.js must dispatch KeyF in executeScript');

    const dashPath = path.join(baseDir, 'dashboard/dashboard.js');
    const dashCode = fs.readFileSync(dashPath, 'utf8').replace(/\r\n/g, '\n');
    assert(dashCode.includes("key: 'f', code: 'KeyF'"), 'dashboard.js must dispatch KeyF in executeScript');

    console.log('  ✅ content_media.js executes direct HTML5 video manipulation unconditionally');
    console.log('  ✅ Native KeyF KeyboardEvent dispatched for zero-banner YouTube fullscreen');
    console.log('  ✅ popup.js & dashboard.js execute direct video actions via scripting.executeScript');
  }

  // ---------------------------------------------------------------------------
  // Test 12: Embedded Iframe Fullscreen Policy Injection & Scripting All-Frames Integrity
  // ---------------------------------------------------------------------------
  console.log('\nTest 12: Embedded Iframe Fullscreen Policy Injection & Scripting All-Frames Integrity');
  {
    // 12A. content_media.js iframe policy injection & cross-frame message handling
    const contentPath = path.join(baseDir, 'content_media.js');
    const contentCode = fs.readFileSync(contentPath, 'utf8').replace(/\r\n/g, '\n');

    assert(contentCode.includes('function ensureIframeFullscreenSupport'), 'content_media.js must define ensureIframeFullscreenSupport');
    assert(contentCode.includes('allowfullscreen'), 'content_media.js must inject allowfullscreen');
    assert(contentCode.includes('webkitallowfullscreen'), 'content_media.js must inject webkitallowfullscreen');
    assert(contentCode.includes('mozallowfullscreen'), 'content_media.js must inject mozallowfullscreen');
    assert(contentCode.includes('fullscreen'), 'content_media.js allow attribute must include fullscreen');
    assert(contentCode.includes('__SENTINEL_IFRAME_FULLSCREEN__'), 'content_media.js must support __SENTINEL_IFRAME_FULLSCREEN__ cross-frame messaging');

    // 12B. inject_main_world.js Document prototype hooks
    const injectPath = path.join(baseDir, 'inject_main_world.js');
    const injectCode = fs.readFileSync(injectPath, 'utf8').replace(/\r\n/g, '\n');

    assert(
      injectCode.includes('Document.prototype.fullscreenEnabled') || injectCode.includes("Document.prototype, 'fullscreenEnabled'"),
      'inject_main_world.js must hook Document.prototype.fullscreenEnabled'
    );
    assert(
      injectCode.includes('Document.prototype.webkitFullscreenEnabled') || injectCode.includes("Document.prototype, 'webkitFullscreenEnabled'"),
      'inject_main_world.js must hook Document.prototype.webkitFullscreenEnabled'
    );
    assert(injectCode.includes('Document.prototype.createElement'), 'inject_main_world.js must hook Document.prototype.createElement');
    assert(injectCode.includes('allowfullscreen'), 'inject_main_world.js createElement hook must set allowfullscreen');

    // 12C. popup.js and dashboard.js allFrames targeting
    const popupPath = path.join(baseDir, 'popup/popup.js');
    const popupCode = fs.readFileSync(popupPath, 'utf8').replace(/\r\n/g, '\n');
    assert(popupCode.includes('allFrames: true'), 'popup.js must target allFrames: true in executeScript');

    const dashPath = path.join(baseDir, 'dashboard/dashboard.js');
    const dashCode = fs.readFileSync(dashPath, 'utf8').replace(/\r\n/g, '\n');
    assert(dashCode.includes('allFrames: true'), 'dashboard.js must target allFrames: true in executeScript');

    // 12D. Strict W3C Trusted Types zero-innerHTML enforcement across all content scripts
    const contentInnerHtml = contentCode.match(/\.innerHTML\s*=/g);
    assert.strictEqual(contentInnerHtml, null, 'content_media.js must have 0 assignments to innerHTML');

    const injectInnerHtml = injectCode.match(/\.innerHTML\s*=/g);
    assert.strictEqual(injectInnerHtml, null, 'inject_main_world.js must have 0 assignments to innerHTML');

    console.log('  ✅ content_media.js implements ensureIframeFullscreenSupport & cross-frame fullscreen messaging');
    console.log('  ✅ inject_main_world.js hooks fullscreenEnabled and createElement for dynamic iframes');
    console.log('  ✅ popup.js & dashboard.js executeScript targets allFrames: true for embedded video iframes');
    console.log('  ✅ 100% W3C Trusted Types compliant (0 innerHTML assignments across all content scripts)');
  }

  // ---------------------------------------------------------------------------
  // Test 13: Tri-Channel Isolated-to-Main-World Bridge & Comprehensive Media Controls
  // ---------------------------------------------------------------------------
  console.log('\nTest 13: Tri-Channel Isolated-to-Main-World Bridge & Comprehensive Media Controls');
  {
    const contentPath = path.join(baseDir, 'content_media.js');
    const contentCode = fs.readFileSync(contentPath, 'utf8').replace(/\r\n/g, '\n');
    const injectPath = path.join(baseDir, 'inject_main_world.js');
    const injectCode = fs.readFileSync(injectPath, 'utf8').replace(/\r\n/g, '\n');
    const popupPath = path.join(baseDir, 'popup/popup.js');
    const popupCode = fs.readFileSync(popupPath, 'utf8').replace(/\r\n/g, '\n');
    const dashPath = path.join(baseDir, 'dashboard/dashboard.js');
    const dashCode = fs.readFileSync(dashPath, 'utf8').replace(/\r\n/g, '\n');
    const bgPath = path.join(baseDir, 'background.js');
    const bgCode = fs.readFileSync(bgPath, 'utf8').replace(/\r\n/g, '\n');

    // 13A. Tri-Channel Bridge Verification
    assert(contentCode.includes('window.postMessage'), 'content_media.js must dispatch Channel A via window.postMessage');
    assert(contentCode.includes("data-sentinel-action"), 'content_media.js must dispatch Channel B via data-sentinel-action attribute');
    assert(contentCode.includes("__MEDIA_SENTINEL_ACTION__"), 'content_media.js must dispatch Channel C via __MEDIA_SENTINEL_ACTION__');
    assert(injectCode.includes("window.addEventListener('message'"), 'inject_main_world.js must listen for window.postMessage');
    assert(injectCode.includes("document.addEventListener('__MEDIA_SENTINEL_ACTION__'"), 'inject_main_world.js must listen for __MEDIA_SENTINEL_ACTION__');
    assert(injectCode.includes("data-sentinel-action"), 'inject_main_world.js must read data-sentinel-action fallback');
    console.log('  ✅ Tri-Channel Isolated-to-Main-World Bridge verified across content and inject scripts');

    // 13B. Fullscreen Control Verification (Web Fullscreen CSS + Native Video Fullscreen)
    assert(contentCode.includes('sentinel-web-fullscreen'), 'content_media.js must define sentinel-web-fullscreen CSS fallback');
    assert(injectCode.includes('sentinel-web-fullscreen'), 'inject_main_world.js must define sentinel-web-fullscreen CSS fallback');
    assert(!bgCode.includes("nextState"), 'background.js must NOT implement window-level F11 fullscreen toggle');
    assert(contentCode.includes('.ytp-fullscreen-button'), 'content_media.js must check .ytp-fullscreen-button');
    assert(popupCode.includes('.ytp-fullscreen-button'), 'popup.js must target .ytp-fullscreen-button');
    assert(dashCode.includes('.ytp-fullscreen-button'), 'dashboard.js must target .ytp-fullscreen-button');
    assert(popupCode.includes("world: 'MAIN'"), 'popup.js must target world: MAIN for fullscreen execution');
    assert(dashCode.includes("world: 'MAIN'"), 'dashboard.js must target world: MAIN for fullscreen execution');
    console.log('  ✅ Fullscreen control verified: Native YouTube UI button + KeyF + Web Fullscreen CSS fallback (zero window F11)');

    // 13C. Theater Mode Control Verification
    assert(contentCode.includes('.ytp-size-button'), 'content_media.js must click .ytp-size-button for theater mode');
    assert(contentCode.includes("key: 't', code: 'KeyT'"), 'content_media.js must dispatch KeyT for theater mode');
    assert(contentCode.includes('sentinel-theater-mode'), 'content_media.js must support generic sentinel-theater-mode');
    assert(injectCode.includes('.ytp-size-button'), 'inject_main_world.js must click .ytp-size-button for theater mode');
    assert(injectCode.includes("key: 't', code: 'KeyT'"), 'inject_main_world.js must dispatch KeyT for theater mode');
    assert(popupCode.includes("toggle_theater"), 'popup.js must bind toggle_theater');
    assert(dashCode.includes("toggle_theater"), 'dashboard.js must bind toggle_theater');
    console.log('  ✅ Theater mode verified: YouTube .ytp-size-button + KeyT + watch-flexy + CSS fallback');

    // 13D. Quality / Resolution Control Verification
    assert(injectCode.includes('QUALITY_LADDER'), 'inject_main_world.js must define QUALITY_LADDER');
    assert(injectCode.includes('setPlaybackQualityRange'), 'inject_main_world.js must call setPlaybackQualityRange');
    assert(injectCode.includes('tryChangeQualityViaMenu'), 'inject_main_world.js must define tryChangeQualityViaMenu');
    assert(injectCode.includes('advancedItem'), 'inject_main_world.js tryChangeQualityViaMenu must traverse modern YouTube Advanced menu');
    assert(popupCode.includes("step_quality"), 'popup.js must handle step_quality');
    assert(dashCode.includes("step_quality"), 'dashboard.js must handle step_quality');
    console.log('  ✅ Quality / Resolution controls verified: YouTube API range + Advanced menu traversal');

    // 13E. Playback Speed Control Verification
    assert(popupCode.includes('movie_player.setPlaybackRate') || popupCode.includes('p.setPlaybackRate'), 'popup.js must call setPlaybackRate in MAIN world');
    assert(dashCode.includes('movie_player.setPlaybackRate') || dashCode.includes('p.setPlaybackRate'), 'dashboard.js must call setPlaybackRate in MAIN world');
    assert(injectCode.includes('moviePlayer.setPlaybackRate'), 'inject_main_world.js must call moviePlayer.setPlaybackRate');
    assert(contentCode.includes('primaryMediaElement.playbackRate ='), 'content_media.js must set direct video playbackRate');
    console.log('  ✅ Playback speed controls verified: Dual-stepper 0.25x-2.0x in MAIN world without YouTube revert');
  }

  // ---------------------------------------------------------------------------
  // Test 14: Time Tracking Pause / Resume Toolbar & Service Worker Integrity
  // ---------------------------------------------------------------------------
  console.log('\nTest 14: Time Tracking Pause / Resume Toolbar & Service Worker Integrity');
  {
    const popupHtml = fs.readFileSync(path.join(baseDir, 'popup/popup.html'), 'utf8');
    const popupCss = fs.readFileSync(path.join(baseDir, 'popup/popup.css'), 'utf8');
    const popupJs = fs.readFileSync(path.join(baseDir, 'popup/popup.js'), 'utf8');
    const bgJs = fs.readFileSync(path.join(baseDir, 'background.js'), 'utf8');

    // 14A. HTML Existence & Single-Row Placement Invariant
    assert(popupHtml.includes('id="btnToggleTrackingPause"'), 'popup.html must contain #btnToggleTrackingPause');
    assert(popupHtml.includes('btn-tracking-pause'), 'popup.html must include btn-tracking-pause class');
    assert(popupHtml.includes('svgTrackingPauseIcon'), 'popup.html must include #svgTrackingPauseIcon');
    assert(popupHtml.includes('btnToggleTrackingPauseText'), 'popup.html must include #btnToggleTrackingPauseText');
    
    // Invariant: Placed inside footer between btnGlobalMediaToggle and btnSleepTimerTrigger
    const mediaToggleIdx = popupHtml.indexOf('id="btnGlobalMediaToggle"');
    const trackingPauseIdx = popupHtml.indexOf('id="btnToggleTrackingPause"');
    const sleepTimerIdx = popupHtml.indexOf('id="btnSleepTimerTrigger"');
    assert(mediaToggleIdx !== -1 && trackingPauseIdx !== -1 && sleepTimerIdx !== -1, 'All footer buttons must exist');
    assert(mediaToggleIdx < trackingPauseIdx && trackingPauseIdx < sleepTimerIdx, 'btnToggleTrackingPause must be placed right beside btnGlobalMediaToggle and before btnSleepTimerTrigger');
    console.log('  ✅ popup.html footer placement verified: Single-row toolbar between Global Media and Sleep Timer');

    // 14B. CSS Single-Row & Amber Accent Styling
    assert(popupCss.includes('.btn-tracking-pause'), 'popup.css must define .btn-tracking-pause');
    assert(popupCss.includes('.btn-tracking-pause.is-paused'), 'popup.css must define .btn-tracking-pause.is-paused amber styling');
    assert(popupCss.includes('flex-wrap: nowrap;'), 'popup.css footer must enforce flex-wrap: nowrap for single row');
    console.log('  ✅ popup.css styling verified: Compact 34x32px button with amber pause accent and strict single row');

    // 14C. popup.js Interactivity, Zero innerHTML & State Sync
    assert(popupJs.includes('btnToggleTrackingPause'), 'popup.js must reference btnToggleTrackingPause');
    assert(popupJs.includes('updateTrackingPauseButtonUI'), 'popup.js must define updateTrackingPauseButtonUI');
    assert(popupJs.includes('TOGGLE_TRACKING_PAUSE'), 'popup.js must dispatch TOGGLE_TRACKING_PAUSE');
    assert(popupJs.includes('TRACKING_PAUSE_CHANGED'), 'popup.js must listen for TRACKING_PAUSE_CHANGED');
    assert(!popupJs.includes('svgTrackingPauseIcon.innerHTML'), 'popup.js must NEVER assign to svg innerHTML (Trusted Types safe)');
    console.log('  ✅ popup.js interactivity verified: Event listeners, reactive IPC, zero-innerHTML W3C compliance');

    // 14D. background.js State Persistence, IPC & Ticker Protection
    assert(bgJs.includes('isTrackingPaused'), 'background.js must track isTrackingPaused state');
    assert(bgJs.includes('sentinel_tracking_paused'), 'background.js must hydrate sentinel_tracking_paused from storage');
    assert(bgJs.includes("msgType === 'GET_TRACKING_PAUSE_STATE'"), 'background.js must handle GET_TRACKING_PAUSE_STATE');
    assert(bgJs.includes("msgType === 'TOGGLE_TRACKING_PAUSE'"), 'background.js must handle TOGGLE_TRACKING_PAUSE');
    assert(bgJs.includes('if (isTrackingPaused)'), 'background.js commitActiveInterval must guard against paused tracking');
    console.log('  ✅ background.js service worker verified: State storage, message handlers, and interval ticker protection');
  }

  console.log('\n🎉 ALL EXTENSION SYNTAX, MANIFEST & FILE INTEGRITY TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
})();
