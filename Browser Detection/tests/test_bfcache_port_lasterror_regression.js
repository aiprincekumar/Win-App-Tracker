/**
 * Regression Suite: BFCache Port Disconnect `runtime.lastError` & Messaging Hardening
 * Task ID: TASK-BFCACHE-PORT-LASTERROR-FIX-001
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const trPath = path.join(rootDir, 'src', 'background', 'telemetry', 'timestamp_reconciliation.js');
const safeMsgPath = path.join(rootDir, 'src', 'core', 'safe-messaging.js');
const tabListenersPath = path.join(rootDir, 'src', 'background', 'handlers', 'tab_listeners.js');
const visualizerPath = path.join(rootDir, 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const bgPath = path.join(rootDir, 'background.js');
const contentPath = path.join(rootDir, 'content_media.js');
const popupPath = path.join(rootDir, 'popup', 'popup.js');
const dashPath = path.join(rootDir, 'dashboard', 'dashboard.js');

const BFCACHE_ERR = 'The page keeping the extension port is moved into back/forward cache, so the message channel is closed.';

function makeLastErrorSpy(errObj, onAccess) {
  let checked = 0;
  const target = { id: 'sentinel_test_ext' };
  Object.defineProperty(target, 'lastError', {
    configurable: true,
    enumerable: true,
    get() {
      checked++;
      if (typeof onAccess === 'function') onAccess();
      return errObj;
    }
  });
  return { runtime: target, getChecked: () => checked };
}

function makeMockStorage() {
  const data = {};
  return {
    data,
    get: async (keys) => {
      const out = {};
      for (const k of (Array.isArray(keys) ? keys : [keys])) if (data[k] !== undefined) out[k] = data[k];
      return out;
    },
    set: async (items) => { Object.assign(data, items); },
    remove: async (keys) => { for (const k of (Array.isArray(keys) ? keys : [keys])) delete data[k]; }
  };
}

function makeBgEnv(lastErrorErr = { message: BFCACHE_ERR }) {
  const listeners = { onConnect: [], onMessage: [] };
  const spy = makeLastErrorSpy(lastErrorErr);
  const reg = (arr) => ({ addListener: (fn) => arr.push(fn), removeListener: () => {}, hasListener: () => false });
  const [local, session] = [makeMockStorage(), makeMockStorage()];
  spy.runtime.onConnect = reg(listeners.onConnect);
  spy.runtime.onMessage = reg(listeners.onMessage);
  spy.runtime.onSuspend = reg([]);
  spy.runtime.onInstalled = reg([]);
  spy.runtime.connect = () => ({ onMessage: reg([]), onDisconnect: reg([]), postMessage: () => {}, disconnect: () => {} });
  spy.runtime.sendMessage = (_m, cb) => { if (cb) cb(null); return Promise.resolve(null); };
  spy.runtime.sendNativeMessage = (_host, _msg, cb) => { if (cb) cb(null); };
  spy.runtime.getManifest = () => ({ version: '2.5.0' });

  const browserAPI = {
    action: { setBadgeText: () => {}, setBadgeBackgroundColor: () => {} },
    alarms: { onAlarm: reg([]), clear: async () => {}, create: () => {}, get: async () => null },
    idle: { onStateChanged: reg([]), setDetectionInterval: () => {}, queryState: (_, cb) => cb && cb('active') },
    notifications: { create: () => {} },
    runtime: spy.runtime,
    scripting: { executeScript: async () => [] },
    storage: { local, session, onChanged: reg([]) },
    tabs: { onActivated: reg([]), onCreated: reg([]), onRemoved: reg([]), onUpdated: reg([]), get: async () => null, query: async () => [], sendMessage: () => Promise.resolve(null), update: async () => null },
    windows: { onFocusChanged: reg([]), getCurrent: async () => null, get: async () => null, update: async () => null, WINDOW_ID_NONE: -1 }
  };
  const silent = { log: () => {}, info: () => {}, debug: () => {}, warn: () => {}, error: () => {} };
  const sandbox = {
    URL, Math, Set, Map, WeakMap, Array, Object, String, Number, Boolean, parseInt, isNaN, Date, WebSocket: class {},
    console: silent, setInterval: () => ({ unref: () => {} }), clearInterval: () => {}, setTimeout: () => 1, clearTimeout: () => {},
    browserAPI, chrome: browserAPI, browser: browserAPI
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(trPath, 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(bgPath, 'utf8'), sandbox);
  return { sandbox, listeners, spy };
}

function makeContentEnv(opts = {}) {
  const winListeners = new Map();
  const docListeners = new Map();
  const portEvents = [];
  const scheduledTimeouts = [];
  let portDisconnectCb = null;
  let spy = makeLastErrorSpy(opts.lastError !== undefined ? opts.lastError : { message: BFCACHE_ERR }, opts.onLastErrorAccess);
  const bind = (map) => (evt, handler, options) => {
    if (!map.has(evt)) map.set(evt, []);
    map.get(evt).push({ handler, options });
  };
  const mockWindow = {
    location: { hostname: 'example.com', href: 'https://example.com/article' },
    addEventListener: bind(winListeners),
    removeEventListener: () => {},
    postMessage: () => {}
  };
  mockWindow.top = mockWindow;
  const mockDocument = {
    readyState: 'complete', visibilityState: 'visible', hasFocus: () => true,
    documentElement: { getAttribute: () => null, setAttribute: () => {}, nodeType: 1 }, body: { nodeType: 1 },
    addEventListener: bind(docListeners), removeEventListener: () => {},
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
    createElement: (t) => ({ tagName: t.toUpperCase(), setAttribute: () => {}, getAttribute: () => null, style: {} })
  };
  spy.runtime.sendMessage = (_m, cb) => { if (cb) cb({ received: true }); };
  spy.runtime.onMessage = { addListener: () => {}, removeListener: () => {} };
  spy.runtime.connect = () => {
    portEvents.push({ kind: 'connect' });
    return {
      name: 'sentinel_tracking_keepalive',
      onDisconnect: { addListener: (fn) => { portDisconnectCb = fn; } },
      postMessage: (msg) => portEvents.push({ kind: 'post', msg }),
      disconnect: () => portEvents.push({ kind: 'disconnect' })
    };
  };
  spy.runtime.getURL = (p) => `chrome-extension://id/${p}`;
  const chromeMock = {
    runtime: spy.runtime,
    storage: { local: { get: (_k, cb) => cb && cb({}), set: (_i, cb) => cb && cb() }, onChanged: { addListener: () => {}, removeListener: () => {} } }
  };
  const sandbox = {
    window: mockWindow, document: mockDocument, chrome: chromeMock, globalThis: { chrome: chromeMock },
    setInterval: () => 101, clearInterval: () => {},
    setTimeout: (fn, delay) => { const id = scheduledTimeouts.length + 1; scheduledTimeouts.push({ id, fn, delay }); return id; },
    clearTimeout: () => {}, Date, MutationObserver: class { observe() {} disconnect() {} },
    WeakSet, Set, Map, Array, Object, module: { exports: {} },
    console: { log: () => {}, debug: () => {}, warn: () => {}, error: () => {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(contentPath, 'utf8'), sandbox);
  const fire = (map, evt, extra = {}) => (map.get(evt) || []).forEach((l) => l.handler({ type: evt, ...extra }));
  return {
    sandbox, ctx: sandbox.window.__SentinelMediaContext, portEvents, scheduledTimeouts,
    getLastErrorChecked: () => spy.getChecked(),
    triggerPortDisconnect: () => { if (portDisconnectCb) portDisconnectCb(); },
    fireWin: (evt, extra) => fire(winListeners, evt, extra),
    fireDoc: (evt, extra) => fire(docListeners, evt, extra)
  };
}

function runBattery1SwPortLastError() {
  console.log('Battery 1: SW port.onDisconnect & runtime.onConnect lastError Consumption');
  const TR = require(trPath);
  const spy = makeLastErrorSpy({ message: BFCACHE_ERR });
  let onDisc = null;
  let disconnectedTab = null;
  const port = {
    name: 'sentinel_tracking_keepalive',
    sender: { id: 'sentinel_test_ext', tab: { id: 77 } },
    onMessage: { addListener: () => {} },
    onDisconnect: { addListener: (fn) => { onDisc = fn; } },
    disconnect: () => {}
  };
  const ok = TR.handleKeepaliveConnect(port, { browserAPI: { runtime: spy.runtime }, onKeepaliveDisconnect: (id) => { disconnectedTab = id; } });
  assert.strictEqual(ok, true);
  assert.strictEqual(TR.activeKeepalivePorts.has(77), true);
  onDisc();
  assert.strictEqual(spy.getChecked() >= 1, true, 'SW port.onDisconnect must read runtime.lastError');
  assert.strictEqual(TR.activeKeepalivePorts.has(77), false, 'activeKeepalivePorts must delete tabId');
  assert.strictEqual(disconnectedTab, 77, 'onKeepaliveDisconnect callback must run');

  const throwingRuntime = { get lastError() { throw new Error('Extension context invalidated.'); } };
  assert.strictEqual(TR.consumeRuntimeLastError({ runtime: throwingRuntime }), null, 'Throwing lastError getter must not crash');

  const bgEnv = makeBgEnv({ message: BFCACHE_ERR });
  let unknownDisc = null;
  bgEnv.listeners.onConnect[0]({ name: 'unknown_aux_port', onDisconnect: { addListener: (fn) => { unknownDisc = fn; } } });
  assert.strictEqual(typeof unknownDisc, 'function', 'background.js onConnect must attach safe onDisconnect fallback for unknown ports');
  unknownDisc();
  assert.strictEqual(bgEnv.spy.getChecked() >= 1, true, 'Unknown port onDisconnect must consume browserAPI.runtime.lastError');
  console.log('  ✅ SW handleKeepaliveConnect, invalidation guard & background.js onConnect drain verified\n');
}

function runBattery2ContentPortLastError() {
  console.log('Battery 2: Content Script keepalivePort.onDisconnect lastError & Invalidation Guard');
  const env = makeContentEnv();
  assert.ok(env.ctx.getKeepalivePort(), 'Keepalive port must connect initially');
  const before = env.scheduledTimeouts.length;
  env.triggerPortDisconnect();
  assert.strictEqual(env.getLastErrorChecked() >= 1, true, 'Content onDisconnect must read browserAPI.runtime.lastError');
  assert.strictEqual(env.ctx.getKeepalivePort(), null, 'keepalivePort must be nulled after disconnect');
  assert.strictEqual(env.scheduledTimeouts.length, before + 1, 'Non-bfcache visible disconnect schedules backoff reconnect');
  assert.strictEqual(env.scheduledTimeouts[before].delay, 1000, 'Reconnect backoff starts at 1000ms');

  const invEnv = makeContentEnv({
    onLastErrorAccess: () => { throw new Error('Extension context invalidated.'); }
  });
  invEnv.triggerPortDisconnect();
  assert.strictEqual(invEnv.ctx.isContextInvalidated(), true, 'Throwing lastError invalidation must trigger clean teardown');
  assert.strictEqual(invEnv.ctx.getKeepalivePort(), null);
  console.log('  ✅ Content port.onDisconnect lastError consumption & invalidation teardown verified\n');
}

function runBattery3BfcacheLifecycle() {
  console.log('Battery 3: pagehide / pageshow (event.persisted) BFCache Port Lifecycle');
  const env = makeContentEnv();
  env.portEvents.length = 0;
  env.scheduledTimeouts.length = 0;

  env.fireWin('pagehide', { persisted: true });
  assert.strictEqual(env.ctx.isPageInBfcache(), true, 'pagehide(persisted:true) must set isPageInBfcache');
  assert.strictEqual(env.portEvents[0].kind, 'post');
  assert.strictEqual(env.portEvents[0].msg.isFinalFlush, true, 'Final flush must be posted before disconnect');
  assert.strictEqual(env.portEvents[1].kind, 'disconnect', 'Port must disconnect cleanly on pagehide');
  assert.strictEqual(env.ctx.getKeepalivePort(), null);
  assert.strictEqual(env.scheduledTimeouts.length, 0, 'Must NOT schedule reconnectTimeout on bfcache pagehide');

  env.triggerPortDisconnect();
  env.ctx.connectTrackingKeepalivePort();
  env.fireWin('focus');
  env.fireDoc('visibilitychange');
  assert.strictEqual(env.ctx.getKeepalivePort(), null, 'Must remain disconnected while frozen in bfcache');
  assert.strictEqual(env.scheduledTimeouts.length, 0, 'Must NOT schedule reconnect while in bfcache');

  env.fireWin('pageshow', { persisted: true });
  assert.strictEqual(env.ctx.isPageInBfcache(), false, 'pageshow must clear isPageInBfcache');
  assert.ok(env.ctx.getKeepalivePort(), 'pageshow(persisted:true) while visible must reconnect keepalive port');
  console.log('  ✅ BFCache freeze gating, zero reconnect storm, and pageshow restore verified\n');
}

async function runBattery4MessagingAudit() {
  console.log('Battery 4: Runtime & Static Audit of Hardened Messaging Sites');
  const SafeMessaging = require(safeMsgPath);
  const spySm = makeLastErrorSpy({ message: BFCACHE_ERR });
  assert.strictEqual(SafeMessaging.consumeRuntimeLastError({ runtime: spySm.runtime }).message, BFCACHE_ERR);
  assert.strictEqual(spySm.getChecked(), 1);

  const bgEnv = makeBgEnv({ message: 'Specified native messaging host not found.' });
  await new Promise((resolve) => {
    bgEnv.listeners.onMessage[0]({ type: 'TRIGGER_DATA_HUB_RECONNECT' }, {}, () => resolve());
  });
  assert.strictEqual(bgEnv.spy.getChecked() >= 1, true, 'background.js sendNativeMessage callback must read lastError');

  const TabListeners = require(tabListenersPath);
  const tabSpy = makeLastErrorSpy({ message: 'No current window' });
  const handlers = TabListeners.createTabHandlers({
    browserAPI: {
      runtime: tabSpy.runtime,
      windows: { WINDOW_ID_NONE: -1 },
      tabs: { query: (_q, cb) => cb([]) }
    },
    state: { isBrowserFocused: true, activeWindowId: 1, intervalStartTime: 0 },
    commitActiveInterval: () => {},
    extractDomain: () => null,
    switchActiveDomain: () => {}
  });
  await handlers.onWindowFocusChanged(2);
  assert.strictEqual(tabSpy.getChecked() >= 1, true, 'tab_listeners.js tabs.query callback must read lastError');

  const Visualizer = require(visualizerPath);
  const vizSpy = makeLastErrorSpy({ message: 'Could not establish connection.' });
  vizSpy.runtime.sendMessage = (_m, cb) => cb(null);
  await Visualizer.handleRemoteMediaCommand(5, 'switch_tab', 0, { browserAPI: { runtime: vizSpy.runtime } });
  assert.strictEqual(vizSpy.getChecked() >= 2, true, 'media_deck_visualizer_feature.js must read lastError in callbacks');

  const trCode = fs.readFileSync(trPath, 'utf8');
  assert.ok(trCode.split('\n').length < 500, 'timestamp_reconciliation.js must stay < 500 lines');
  assert.ok(fs.statSync(trPath).size < 24576, 'timestamp_reconciliation.js must stay < 24 KB');

  const popupCode = fs.readFileSync(popupPath, 'utf8');
  const dashCode = fs.readFileSync(dashPath, 'utf8');
  assert.strictEqual(popupCode.includes('safePopupRuntimeSendMessage'), true);
  assert.strictEqual(popupCode.includes('safePopupTabSendMessage'), true);
  assert.strictEqual(popupCode.includes('safePopupTabsQuery'), true);
  assert.strictEqual(/browserAPI\.runtime\.sendMessage\s*\(/.test(popupCode.replace(/function safePopupRuntimeSendMessage[\s\S]*?\n\}/, '')), true);
  const rawPopupSend = popupCode.split(/\r?\n/).filter((l, idx) => idx > 90 && /(?:browserAPI|chrome)\.runtime\.sendMessage\s*\(/.test(l));
  assert.strictEqual(rawPopupSend.length, 2, 'Only GET_DASHBOARD_DATA and QUERY_DATA_HUB (both with explicit lastError checks) remain direct in popup.js');
  assert.strictEqual(/chrome\.runtime\.sendMessage\(\s*\{\s*type:\s*'GET_SLEEP_TIMER_STATE'\s*\}/.test(dashCode), false, 'dashboard.js L11931 raw chrome.runtime.sendMessage must be hardened');
  console.log('  ✅ Runtime lastError spy checks & static messaging audit passed\n');
}

function runBattery5BgMediaZeroTouchAndBom() {
  console.log('Battery 5: Background Media Zero-Touch & UTF-8 BOM Verification');
  const bgEnv = makeBgEnv();
  bgEnv.sandbox.commitBackgroundMediaDelta('spotify.com', 27);
  const sp = bgEnv.sandbox.getActivityData().domains['spotify.com'];
  assert.strictEqual(sp.backgroundMediaSeconds, 27);
  assert.strictEqual(sp.foregroundSeconds, 0);

  let diffText = '';
  try {
    diffText = execFileSync('git', ['diff', '-U0', 'background.js'], { cwd: rootDir, encoding: 'utf8' });
  } catch (_) {}
  assert.strictEqual(diffText.includes('commitBackgroundMediaDelta'), false, 'commitBackgroundMediaDelta must have zero diff lines');

  const bomTargets = [trPath, safeMsgPath, tabListenersPath, visualizerPath, bgPath, contentPath, popupPath, dashPath, __filename];
  for (const target of bomTargets) {
    const buf = fs.readFileSync(target);
    assert.strictEqual(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, true, `${path.basename(target)} must have UTF-8 BOM`);
  }
  console.log('  ✅ Background media zero-touch & 100% UTF-8 BOM verified\n');
}

(async () => {
  try {
    runBattery1SwPortLastError();
    runBattery2ContentPortLastError();
    runBattery3BfcacheLifecycle();
    await runBattery4MessagingAudit();
    runBattery5BgMediaZeroTouchAndBom();
    console.log('============================================================\nALL 5 BFCACHE & LASTERROR REGRESSION BATTERIES PASSED (Exit Code: 0)\n============================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Regression Suite Failed:', err);
    process.exit(1);
  }
})();
