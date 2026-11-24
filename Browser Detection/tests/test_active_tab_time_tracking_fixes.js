/**
 * Verification Suite: Active Tab Time Tracking Fixes & Regression Invariants (8 Batteries)
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const reconcilePath = path.join(rootDir, 'src', 'background', 'telemetry', 'timestamp_reconciliation.js');
const bgPath = path.join(rootDir, 'background.js');
const contentPath = path.join(rootDir, 'content_media.js');
const [reconcileCode, bgCode, contentCode] = [reconcilePath, bgPath, contentPath].map((p) => fs.readFileSync(p, 'utf8'));

function makeMockStorage(delays = {}) {
  const data = {};
  const wait = (ms) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());
  const nextDelay = (k) => (Array.isArray(delays[k]) ? (delays[k].shift() || 0) : (delays[k] || 0));
  const pick = (keys) => {
    if (!keys) return { ...data };
    const out = {};
    for (const k of (Array.isArray(keys) ? keys : [keys])) if (data[k] !== undefined) out[k] = data[k];
    return out;
  };
  return {
    data,
    get: async (keys, cb) => { await wait(nextDelay('get')); const res = pick(keys); if (cb) cb(res); return res; },
    set: async (items, cb) => { await wait(nextDelay('set')); Object.assign(data, items); if (cb) cb(); },
    remove: async (keys, cb) => { await wait(nextDelay('remove')); for (const k of (Array.isArray(keys) ? keys : [keys])) delete data[k]; if (cb) cb(); }
  };
}

function makeBrowserMock() {
  const listeners = { focus: [], idle: [], onMessage: [], onConnect: [], onRemoved: [] };
  const [session, local] = [makeMockStorage(), makeMockStorage()];
  const reg = (arr) => ({ addListener: (fn) => arr.push(fn), removeListener: () => {}, hasListener: () => false });
  const browserAPI = {
    action: { setBadgeText: () => {}, setBadgeBackgroundColor: () => {} },
    alarms: { onAlarm: reg([]), clear: async () => {}, create: () => {}, get: async () => null },
    idle: { onStateChanged: reg(listeners.idle), setDetectionInterval: () => {}, queryState: (_, cb) => cb && cb('active') },
    notifications: { create: () => {} },
    runtime: {
      id: 'sentinel_test_ext', lastError: null, onConnect: reg(listeners.onConnect), onMessage: reg(listeners.onMessage),
      onSuspend: reg([]), onInstalled: reg([]),
      connect: () => ({ onMessage: reg([]), onDisconnect: reg([]), postMessage: () => {}, disconnect: () => {} }),
      sendMessage: (_m, cb) => { if (cb) cb(null); return Promise.resolve(null); }, getManifest: () => ({ version: '2.5.0' })
    },
    scripting: { executeScript: async () => [] }, storage: { local, session, onChanged: reg([]) },
    tabs: {
      onActivated: reg([]), onCreated: reg([]), onRemoved: reg(listeners.onRemoved), onUpdated: reg([]),
      get: async (id) => ({ id, url: 'https://github.com/aiprincekumar' }), query: async () => [],
      sendMessage: (_id, _m, cb) => { if (cb) cb(null); return Promise.resolve(null); }, update: async () => null
    },
    windows: { onFocusChanged: reg(listeners.focus), getCurrent: async () => null, get: async () => null, update: async () => null, WINDOW_ID_NONE: -1 }
  };
  return { browserAPI, listeners, session, local };
}

function makeMockDate(nowRef) {
  return class extends Date {
    constructor(...args) { super(...(args.length ? args : [nowRef.value])); }
    static now() { return nowRef.value; }
  };
}

async function flushTicks() { for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r)); }

async function createBgEnv(startMs = 1732400000000) {
  const nowRef = { value: startMs };
  const mock = makeBrowserMock();
  const silent = { log: () => {}, info: () => {}, debug: () => {}, warn: () => {}, error: () => {} };
  const sandbox = {
    URL, Math, Set, Map, WeakMap, Array, Object, String, Number, Boolean, parseInt, isNaN,
    Date: makeMockDate(nowRef), WebSocket: class {}, console: silent,
    setInterval: () => ({ unref: () => {} }), clearInterval: () => {}, setTimeout: () => 1, clearTimeout: () => {},
    browserAPI: mock.browserAPI, chrome: mock.browserAPI, browser: mock.browserAPI
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(reconcileCode, sandbox);
  vm.runInContext(bgCode, sandbox);
  await flushTicks();
  return {
    sandbox, mock, advance: (ms) => { nowRef.value += ms; }, getNow: () => nowRef.value,
    dispatchMsg: (message, sender = {}) => new Promise((resolve, reject) => {
      const fn = mock.listeners.onMessage[mock.listeners.onMessage.length - 1];
      const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${message.type}`)), 2000);
      fn(message, sender, (res) => { clearTimeout(timer); resolve(res); });
    })
  };
}

function makeDomMocks(winListeners, docListeners, removedListeners) {
  const bindReg = (map) => (evt, handler, options) => {
    if (!map.has(evt)) map.set(evt, []);
    map.get(evt).push({ handler, options });
  };
  const mockWindow = {
    location: { hostname: 'github.com', href: 'https://github.com/aiprincekumar' },
    addEventListener: bindReg(winListeners),
    removeEventListener: (evt, handler, options) => removedListeners.push({ evt, handler, options }),
    postMessage: () => {}
  };
  mockWindow.top = mockWindow;
  const mockDocument = {
    readyState: 'complete', visibilityState: 'visible', hasFocus: () => true,
    documentElement: { getAttribute: () => null, setAttribute: () => {}, nodeType: 1 }, body: { nodeType: 1 },
    addEventListener: bindReg(docListeners), removeEventListener: () => {},
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
    createElement: (t) => ({ tagName: t.toUpperCase(), setAttribute: () => {}, getAttribute: () => null, style: {} })
  };
  return { mockWindow, mockDocument };
}

function makeContentApi(portEvents, errRef) {
  return {
    runtime: {
      id: 'sentinel_content_ext',
      sendMessage: (_m, cb) => { if (cb) cb({ received: true }); },
      onMessage: { addListener: () => {}, removeListener: () => {} },
      connect: () => ({
        name: 'sentinel_tracking_keepalive',
        onDisconnect: { addListener: () => {} },
        postMessage: (msg) => { if (errRef.err) throw errRef.err; portEvents.push({ kind: 'post', msg }); },
        disconnect: () => { portEvents.push({ kind: 'disconnect' }); }
      }),
      getURL: (p) => `chrome-extension://id/${p}`
    },
    storage: { local: { get: (_k, cb) => cb && cb({}), set: (_i, cb) => cb && cb() }, onChanged: { addListener: () => {}, removeListener: () => {} } }
  };
}

function createContentEnv(startMs = 1732400000000) {
  const nowRef = { value: startMs };
  const winListeners = new Map();
  const docListeners = new Map();
  const removedListeners = [];
  const portEvents = [];
  const errRef = { err: null };
  const { mockWindow, mockDocument } = makeDomMocks(winListeners, docListeners, removedListeners);
  const browserAPI = makeContentApi(portEvents, errRef);
  const sandbox = {
    window: mockWindow, document: mockDocument, chrome: browserAPI, globalThis: { chrome: browserAPI },
    setInterval: () => 101, clearInterval: () => {}, setTimeout: () => 202, clearTimeout: () => {},
    Date: makeMockDate(nowRef), MutationObserver: class { observe() {} disconnect() {} },
    WeakSet, Set, Map, Array, Object, module: { exports: {} },
    console: { log: () => {}, debug: () => {}, warn: () => {}, error: () => {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(contentCode, sandbox);
  const fire = (map, evt) => (map.get(evt) || []).forEach((l) => l.handler({ type: evt }));
  return {
    sandbox, ctx: sandbox.window.__SentinelMediaContext, removedListeners, portEvents,
    advance: (ms) => { nowRef.value += ms; },
    setPostError: (err) => { errRef.err = err; },
    fireDoc: (evt) => fire(docListeners, evt),
    fireWin: (evt) => fire(winListeners, evt)
  };
}

function measureFunctionLines(source, fnName) {
  const rx = new RegExp(`(?:async\\s+)?function\\s+${fnName}\\s*\\(`, 'm');
  const match = source.match(rx);
  if (!match) return -1;
  let parenDepth = 0;
  let idx = match.index + match[0].length - 1;
  while (idx < source.length) {
    const code = source.charCodeAt(idx);
    if (code === 40) parenDepth++;
    else if (code === 41 && --parenDepth === 0) break;
    idx++;
  }
  const braceStart = source.indexOf(String.fromCharCode(123), idx);
  if (braceStart === -1) return -1;
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const code = source.charCodeAt(i);
    if (code === 123) depth++;
    else if (code === 125 && --depth === 0) return source.slice(match.index, i + 1).split('\n').length;
  }
  return -1;
}

async function runBattery1PreBlurRecovery() {
  console.log('Battery 1: WINDOW_ID_NONE -> GET_DASHBOARD_DATA Pre-Blur Credit Recovery');
  const t0 = 1732400000000;
  const envA = await createBgEnv(t0);
  envA.sandbox.setActiveTabId(101);
  envA.sandbox.switchActiveDomain('github.com', true);
  await flushTicks();
  envA.advance(23600);
  await envA.mock.listeners.focus[0](-1);
  envA.advance(8000);
  const dashA = await envA.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.strictEqual(dashA.activityData.domains['github.com'].foregroundSeconds, 23, 'In-memory pre-blur 23.6s must credit 23s');

  const envB = await createBgEnv(t0 + 50000);
  const wake = envB.getNow();
  envB.sandbox.setIsBrowserFocused(false);
  envB.mock.session.data.sentinel_active_session = {
    domain: 'github.com', tabId: 101, startTime: wake, lastHeartbeat: wake,
    lastHeartbeatTime: wake, lastCommittedTime: wake, isBrowserFocused: false, isUserActive: true, focusLostAt: wake + 23600
  };
  envB.advance(30000);
  const dashB = await envB.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.strictEqual(envB.sandbox.getActiveDomain(), null, 'SW wakeup scenario has null activeDomain');
  assert.strictEqual(dashB.activityData.domains['github.com'].foregroundSeconds, 23, 'SW wakeup GET_DASHBOARD_DATA must recover 23s');

  envB.advance(20000);
  const followUp = await envB.sandbox.flushActiveSessionDelta(envB.getNow());
  assert.strictEqual(followUp.creditedSeconds, 0, 'Continued blur must credit 0s (Battery 6 parity)');
  assert.strictEqual(dashB.activityData.domains['github.com'].foregroundSeconds, 23);
  console.log('  ✅ In-memory and SW-wakeup WINDOW_ID_NONE -> GET_DASHBOARD_DATA recovered 23s and froze blurred tail\n');
}

async function runBattery2LiveGetters() {
  console.log('Battery 2: Live Dynamic Getters in getReconciliationContext() Across Long-Lived Port');
  const env = await createBgEnv(1732400000000);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('docs.python.org', true);
  await flushTicks();
  env.sandbox.setIsBrowserFocused(false);

  const ctxObj = env.sandbox.getReconciliationContext();
  assert.strictEqual(typeof Object.getOwnPropertyDescriptor(ctxObj, 'isBrowserFocused').get, 'function');
  let onPortMsg = null;
  const port = {
    name: 'sentinel_tracking_keepalive', sender: { id: 'sentinel_test_ext', tab: { id: 101 } },
    onMessage: { addListener: (fn) => { onPortMsg = fn; } }, onDisconnect: { addListener: () => {} }, disconnect: () => {}
  };
  assert.strictEqual(env.sandbox.handleTrackingKeepaliveConnect(port), true);

  env.sandbox.setIsBrowserFocused(true);
  env.advance(15000);
  await onPortMsg({ type: 'KEEPALIVE_HEARTBEAT', domain: 'docs.python.org', timestamp: env.getNow() });
  assert.strictEqual(env.sandbox.getActivityData().domains['docs.python.org'].foregroundSeconds, 15);

  await env.dispatchMsg({ type: 'TOGGLE_TRACKING_PAUSE' });
  env.advance(15000);
  await onPortMsg({ type: 'KEEPALIVE_HEARTBEAT', domain: 'docs.python.org', timestamp: env.getNow() });
  assert.strictEqual(env.sandbox.getActivityData().domains['docs.python.org'].foregroundSeconds, 15);

  await env.dispatchMsg({ type: 'TOGGLE_TRACKING_PAUSE' });
  env.sandbox.setIsBrowserFocused(false);
  env.advance(15000);
  await onPortMsg({ type: 'KEEPALIVE_HEARTBEAT', domain: 'docs.python.org', timestamp: env.getNow() });
  assert.strictEqual(env.sandbox.getActivityData().domains['docs.python.org'].foregroundSeconds, 15);
  console.log('  ✅ Live ES6 getters in long-lived keepalive port verified across focus & pause flips\n');
}

async function runBattery3FifoAndCrossDomain() {
  console.log('Battery 3: FIFO Queue Serialization, Cross-Domain Isolation & Tab Close Flush');
  const TR = require(reconcilePath);
  const t0 = 1732400000000;
  const delayed = makeMockStorage({ get: [25, 2, 1], set: [10, 2, 1] });
  delayed.data.sentinel_active_session = {
    domain: 'github.com', tabId: 101, startTime: t0, lastHeartbeat: t0, lastCommittedTime: t0, isBrowserFocused: true, isUserActive: true
  };
  const api = { storage: { session: delayed } };
  await Promise.all([
    TR.updateActiveSession(api, { isBrowserFocused: false, focusLostAt: t0 + 10000 }),
    TR.updateActiveSession(api, { isUserActive: false, idleStartedAt: t0 + 12000 })
  ]);
  const merged = delayed.data.sentinel_active_session;
  assert.strictEqual(merged.isBrowserFocused, false);
  assert.strictEqual(merged.isUserActive, false);
  assert.strictEqual(merged.focusLostAt, t0 + 10000);
  assert.strictEqual(merged.idleStartedAt, t0 + 12000);

  const env = await createBgEnv(t0);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('youtube.com', true);
  await flushTicks();
  env.advance(60000);
  env.sandbox.switchActiveDomain('github.com', true);
  await flushTicks();
  const cp = env.mock.session.data.sentinel_active_session;
  assert.strictEqual(cp.domain, 'github.com');
  assert.strictEqual(cp.lastCommittedTime, t0 + 60000, 'New domain must NOT inherit previous lastCommittedTime');
  env.advance(5000);
  await env.sandbox.flushActiveSessionDelta(env.getNow());
  assert.strictEqual(env.sandbox.getActivityData().domains['youtube.com'].foregroundSeconds, 60);
  assert.strictEqual(env.sandbox.getActivityData().domains['github.com'].foregroundSeconds, 5);

  env.sandbox.switchActiveDomain('developer.mozilla.org', true);
  await flushTicks();
  env.advance(9200);
  await env.mock.listeners.onRemoved[0](101);
  assert.strictEqual(env.sandbox.getActivityData().domains['developer.mozilla.org'].foregroundSeconds, 9);
  assert.strictEqual(env.sandbox.getActiveDomain(), null);
  assert.strictEqual(env.mock.session.data.sentinel_active_session, undefined);
  console.log('  ✅ Per-storage FIFO queue, cross-domain timestamp isolation, and tabs.onRemoved flush verified\n');
}

async function runBattery4SubSecondRemainder() {
  console.log('Battery 4: Sub-Second Remainder Preservation & Zero Phantom Advance');
  const t0 = 1732400000000;
  const env = await createBgEnv(t0);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('rust-lang.org', true);
  await flushTicks();
  env.advance(4400);
  env.sandbox.commitActiveInterval();
  await flushTicks();
  assert.strictEqual(env.mock.session.data.sentinel_active_session.lastCommittedTime, t0 + 4000);
  env.advance(400);
  env.sandbox.commitActiveInterval();
  await flushTicks();
  assert.strictEqual(env.mock.session.data.sentinel_active_session.lastCommittedTime, t0 + 4000, '0s tick must NOT clobber lastCommittedTime');
  env.advance(4500);
  env.sandbox.commitActiveInterval();
  await flushTicks();
  assert.strictEqual(env.sandbox.getActivityData().domains['rust-lang.org'].foregroundSeconds, 9);

  const TR = env.sandbox.TimestampReconciliation;
  const sess2 = makeMockStorage();
  const act2 = { domains: {} };
  const ctx2 = {
    browserAPI: { storage: { session: sess2 } }, activityData: act2, getActiveTabId: () => 101,
    matchesTrackingBlacklist: () => false, isBrowserFocused: true, isUserActive: true, isTrackingPaused: false, getTodayDateString: () => '2026-11-25'
  };
  sess2.data.sentinel_active_session = { domain: 'web.dev', startTime: t0, lastHeartbeat: t0, lastCommittedTime: t0, isBrowserFocused: true, isUserActive: true };
  await TR.reconcileSessionDelta(ctx2, t0 + 4900);
  await TR.reconcileSessionDelta(ctx2, t0 + 5300);
  await TR.reconcileSessionDelta(ctx2, t0 + 9800);
  assert.strictEqual(act2.domains['web.dev'].foregroundSeconds, 9);

  sess2.data.sentinel_active_session = { domain: 'mdn.dev', startTime: t0, lastHeartbeat: t0, lastCommittedTime: t0, isBrowserFocused: true, isUserActive: true };
  await TR.processKeepaliveHeartbeat({ type: 'KEEPALIVE_HEARTBEAT', domain: 'mdn.dev', timestamp: t0 + 4900 }, {}, 101, ctx2);
  await TR.processKeepaliveHeartbeat({ type: 'KEEPALIVE_HEARTBEAT', domain: 'mdn.dev', timestamp: t0 + 9800 }, {}, 101, ctx2);
  assert.strictEqual(act2.domains['mdn.dev'].foregroundSeconds, 9);
  console.log('  ✅ Sub-second remainder & 0s zero-clobber verified across commit, reconcile & heartbeat\n');
}

async function runBattery5IdleRecovery() {
  console.log('Battery 5: Idle State Transitions & PAGE_USER_INTERACTION Recovery');
  const t0 = 1732400000000;
  const env = await createBgEnv(t0);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('stackoverflow.com', true);
  await flushTicks();
  env.advance(6200);
  await env.mock.listeners.idle[0]('idle');
  assert.strictEqual(env.sandbox.getActivityData().domains['stackoverflow.com'].foregroundSeconds, 6);
  assert.strictEqual(env.sandbox.getUserIdleStartTime(), t0 + 6200);

  env.advance(600000);
  await env.sandbox.flushActiveSessionDelta(env.getNow());
  assert.strictEqual(env.sandbox.getActivityData().domains['stackoverflow.com'].foregroundSeconds, 6);

  const ipcRes = await env.dispatchMsg({ type: 'PAGE_USER_INTERACTION', payload: { domain: 'stackoverflow.com', timestamp: env.getNow() } });
  assert.strictEqual(ipcRes.received, true);
  assert.strictEqual(env.sandbox.getUserIdleStartTime(), 0);
  assert.strictEqual(env.sandbox.getReconciliationContext().isUserActive, true);
  assert.strictEqual(env.mock.session.data.sentinel_active_session.isUserActive, true);
  assert.strictEqual(env.mock.session.data.sentinel_active_session.idleStartedAt, null);
  assert.strictEqual(env.sandbox.getActivityData().domains['stackoverflow.com'].foregroundSeconds, 6);

  env.advance(5000);
  env.sandbox.commitActiveInterval();
  assert.strictEqual(env.sandbox.getActivityData().domains['stackoverflow.com'].foregroundSeconds, 11);
  console.log('  ✅ Idle freeze, 600s gap suppression, userIdleStartTime=0 reset & clean wake recovery verified\n');
}

async function runBattery6TogglePause() {
  console.log('Battery 6: TOGGLE_TRACKING_PAUSE Pre-Pause Commit & Resume Anchor');
  const env = await createBgEnv(1732400000000);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('wikipedia.org', true);
  await flushTicks();
  env.advance(4300);
  const pauseRes = await env.dispatchMsg({ type: 'TOGGLE_TRACKING_PAUSE' });
  assert.strictEqual(pauseRes.isTrackingPaused, true);
  assert.strictEqual(env.sandbox.getActivityData().domains['wikipedia.org'].foregroundSeconds, 4);

  env.advance(20000);
  env.sandbox.commitActiveInterval();
  await env.sandbox.flushActiveSessionDelta(env.getNow());
  assert.strictEqual(env.sandbox.getActivityData().domains['wikipedia.org'].foregroundSeconds, 4);

  const resumeRes = await env.dispatchMsg({ type: 'TOGGLE_TRACKING_PAUSE' });
  assert.strictEqual(resumeRes.isTrackingPaused, false);
  env.advance(5100);
  env.sandbox.commitActiveInterval();
  assert.strictEqual(env.sandbox.getActivityData().domains['wikipedia.org'].foregroundSeconds, 9);
  console.log('  ✅ Pre-pause commit ordering, 0s pause freeze, and clean resume anchor verified\n');
}

async function runBattery7ContentKeepalive() {
  console.log('Battery 7: content_media.js Final-Flush on visibilitychange/pagehide & focus Reconnect');
  const env = createContentEnv(1732400000000);
  assert.ok(env.ctx.getKeepalivePort(), 'Initial visible document connects keepalive port');

  env.portEvents.length = 0;
  env.sandbox.document.visibilityState = 'hidden';
  env.fireDoc('visibilitychange');
  assert.strictEqual(env.portEvents[0].kind, 'post');
  assert.strictEqual(env.portEvents[0].msg.isFinalFlush, true);
  assert.strictEqual(env.portEvents[1].kind, 'disconnect');
  assert.strictEqual(env.ctx.getKeepalivePort(), null);

  env.sandbox.document.visibilityState = 'visible';
  env.fireWin('focus');
  assert.ok(env.ctx.getKeepalivePort());

  env.portEvents.length = 0;
  env.fireWin('pagehide');
  assert.strictEqual(env.portEvents[0].kind, 'post');
  assert.strictEqual(env.portEvents[0].msg.isFinalFlush, true);
  assert.strictEqual(env.portEvents[1].kind, 'disconnect');

  env.advance(600);
  env.fireWin('pointermove');
  assert.ok(env.ctx.getKeepalivePort());

  env.setPostError(new Error('Port disconnected'));
  env.ctx.sendTrackingHeartbeat(false);
  assert.strictEqual(env.ctx.getKeepalivePort(), null);
  assert.strictEqual(env.ctx.isContextInvalidated(), false);

  env.setPostError(null);
  env.fireWin('focus');
  env.setPostError(new Error('Extension context invalidated'));
  env.ctx.sendTrackingHeartbeat(false);
  assert.strictEqual(env.ctx.isContextInvalidated(), true);
  assert.deepStrictEqual(env.removedListeners.map((r) => r.evt).sort(), ['compositionstart', 'focusin', 'input', 'keydown', 'keyup', 'message', 'mousedown', 'mousemove', 'pointerdown', 'pointermove', 'scroll', 'touchstart', 'wheel']);
  console.log('  ✅ Final-flush ordering, focus/activity reconnect, error recovery & 12+1 listener teardown verified\n');
}

async function runBattery8StaticAndMediaAudit() {
  console.log('Battery 8: Rule 28 Modularity, UTF-8 BOM, Security & Background Media Zero-Mutation');
  for (const target of [reconcilePath, bgPath, contentPath, __filename]) {
    const raw = fs.readFileSync(target);
    assert.strictEqual(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF, true, `${path.basename(target)} must have UTF-8 BOM`);
  }
  const selfCode = fs.readFileSync(__filename, 'utf8');
  assert.ok(reconcileCode.split('\n').length < 500, 'timestamp_reconciliation.js must stay < 500 lines');
  assert.ok(selfCode.split('\n').length < 500, 'test_active_tab_time_tracking_fixes.js must stay < 500 lines');
  assert.strictEqual(/\.innerHTML\s*=/.test(reconcileCode) || /\.innerHTML\s*=/.test(contentCode) || /\.innerHTML\s*=/.test(selfCode), false);

  const fnChecks = [
    [reconcileCode, ['enqueueCheckpointOp', 'resolveReconciliationPlan', 'reconcileSessionDelta', 'resolveHeartbeatCommit', 'processKeepaliveHeartbeat']],
    [bgCode, ['recordForegroundSeconds', 'commitActiveInterval', 'getReconciliationContext', 'flushActiveSessionDelta', 'clearTrackedActiveDomain', 'activateTrackedDomainSession', 'handleWindowFocusBlur', 'handleWindowFocusRestore', 'handleIdleStateTransition', 'handlePageUserInteraction', 'handleToggleTrackingPause', 'switchActiveDomain']],
    [contentCode, ['handleHeartbeatPostError', 'sendTrackingHeartbeat', 'handleVisibilityKeepaliveSync', 'handlePagehideKeepaliveSync', 'handleWindowFocusKeepaliveSync', 'setupUserActivityListeners']],
    [selfCode, ['makeMockStorage', 'makeBrowserMock', 'makeMockDate', 'flushTicks', 'createBgEnv', 'makeDomMocks', 'makeContentApi', 'createContentEnv', 'measureFunctionLines', 'runBattery1PreBlurRecovery', 'runBattery2LiveGetters', 'runBattery3FifoAndCrossDomain', 'runBattery4SubSecondRemainder', 'runBattery5IdleRecovery', 'runBattery6TogglePause', 'runBattery7ContentKeepalive', 'runBattery8StaticAndMediaAudit']]
  ];
  for (const [src, names] of fnChecks) {
    for (const fn of names) {
      const len = measureFunctionLines(src, fn);
      assert.ok(len > 0 && len <= 50, `Function ${fn} (${len} lines) must obey Rule 28 <= 50 lines`);
    }
  }
  assert.ok(bgCode.includes('flushActiveSessionDelta();') && bgCode.includes('await flushActiveSessionDelta();') && bgCode.includes('if (isTrackingPaused)'));

  const env = await createBgEnv(1732400000000);
  env.sandbox.setIsBrowserFocused(false);
  env.sandbox.commitBackgroundMediaDelta('spotify.com', 18);
  assert.strictEqual(env.sandbox.getActivityData().domains['spotify.com'].backgroundMediaSeconds, 18);
  assert.strictEqual(env.sandbox.getActivityData().domains['spotify.com'].foregroundSeconds, 0);
  console.log('  ✅ UTF-8 BOM, Rule 28 <= 50 lines, zero innerHTML & Background Media Zero-Mutation verified\n');
}

(async () => {
  try {
    const runners = [runBattery1PreBlurRecovery, runBattery2LiveGetters, runBattery3FifoAndCrossDomain, runBattery4SubSecondRemainder, runBattery5IdleRecovery, runBattery6TogglePause, runBattery7ContentKeepalive, runBattery8StaticAndMediaAudit];
    for (const run of runners) await run();
    console.log('============================================================\nALL 8 BATTERIES PASSED CLEANLY (Exit Code: 0)\n============================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Suite Failed:', err);
    process.exit(1);
  }
})();
