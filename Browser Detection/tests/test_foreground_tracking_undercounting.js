/**
 * Verification Suite: Foreground & Active Tab Time Tracking Undercounting (6 Batteries)
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const guardPath = path.join(rootDir, 'src', 'background', 'telemetry', 'foreground_tracking_guard.js');
const reconcilePath = path.join(rootDir, 'src', 'background', 'telemetry', 'timestamp_reconciliation.js');
const trackerPath = path.join(rootDir, 'src', 'background', 'telemetry', 'domain_tracker.js');
const bgPath = path.join(rootDir, 'background.js');
const contentPath = path.join(rootDir, 'content_media.js');

const [guardCode, reconcileCode, bgCode, contentCode] = [guardPath, reconcilePath, bgPath, contentPath].map(
  (p) => fs.readFileSync(p, 'utf8')
);
const DomainTracker = require(trackerPath);
const ForegroundTrackingGuard = require(guardPath);
const TR = require(reconcilePath);

function makeStorage(initialData = {}, getGate = null) {
  const data = JSON.parse(JSON.stringify(initialData));
  const pick = (keys) => {
    if (!keys) return { ...data };
    const out = {};
    for (const k of (Array.isArray(keys) ? keys : [keys])) if (data[k] !== undefined) out[k] = data[k];
    return out;
  };
  return {
    data,
    get: async (keys) => { if (getGate) await getGate(); return pick(keys); },
    set: async (items) => { Object.assign(data, items); },
    remove: async (keys) => { for (const k of (Array.isArray(keys) ? keys : [keys])) delete data[k]; }
  };
}

function makeMockDate(nowRef) {
  return class extends Date {
    constructor(...args) { super(...(args.length ? args : [nowRef.value])); }
    static now() { return nowRef.value; }
  };
}

async function flushTicks() {
  for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r));
}

function makeBgBrowserMock(opts = {}) {
  const listeners = { activated: [], updated: [], removed: [], focus: [], idle: [], onMessage: [], onConnect: [], onAlarm: [] };
  const reg = (arr) => ({ addListener: (fn) => arr.push(fn), removeListener: () => {}, hasListener: () => false });
  const local = makeStorage(opts.localData || {}, opts.localGetGate || null);
  const session = makeStorage(opts.sessionData || {});
  const browserAPI = {
    action: { setBadgeText: () => {}, setBadgeBackgroundColor: () => {} },
    alarms: { onAlarm: reg(listeners.onAlarm), clear: async () => {}, create: () => {}, get: async () => null },
    idle: { onStateChanged: reg(listeners.idle), setDetectionInterval: () => {}, queryState: opts.queryState || ((_, cb) => cb && cb('active')) },
    notifications: { create: () => {} },
    runtime: {
      id: 'sentinel_test_ext', lastError: null, onConnect: reg(listeners.onConnect), onMessage: reg(listeners.onMessage),
      onSuspend: reg([]), onInstalled: reg([]),
      connect: () => ({ onMessage: reg([]), onDisconnect: reg([]), postMessage: () => {}, disconnect: () => {} }),
      sendMessage: (_m, cb) => { if (cb) cb(null); return Promise.resolve(null); }, getManifest: () => ({ version: '2.5.0' })
    },
    scripting: { executeScript: async () => [] }, storage: { local, session, onChanged: reg([]) },
    tabs: {
      onActivated: reg(listeners.activated), onCreated: reg([]), onRemoved: reg(listeners.removed), onUpdated: reg(listeners.updated),
      get: opts.tabsGet || (async (id) => ({ id, windowId: 1, url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', audible: false })),
      query: opts.tabsQuery || (async () => []),
      sendMessage: (_id, _m, cb) => { if (cb) cb(null); return Promise.resolve(null); }, update: async () => null
    },
    windows: {
      onFocusChanged: reg(listeners.focus), getCurrent: async () => null,
      getLastFocused: opts.getLastFocused || (async () => null),
      get: opts.windowsGet || (async () => null), update: async () => null, WINDOW_ID_NONE: -1
    }
  };
  return { browserAPI, listeners, local, session };
}

async function createBgEnv(startMs = 1732492800000, opts = {}) {
  const nowRef = { value: startMs };
  const mock = makeBgBrowserMock(opts);
  const intervals = [];
  const silent = { log: () => {}, info: () => {}, debug: () => {}, warn: () => {}, error: () => {} };
  const sandbox = {
    URL, Math, Set, Map, WeakMap, Array, Object, String, Number, Boolean, parseInt, isNaN,
    Date: makeMockDate(nowRef), WebSocket: class {}, navigator: { userAgent: 'Chrome/130.0.0.0' }, console: silent,
    setInterval: (fn) => { intervals.push(fn); return { unref: () => {} }; }, clearInterval: () => {},
    setTimeout: () => 1, clearTimeout: () => {}, browserAPI: mock.browserAPI, chrome: mock.browserAPI, browser: mock.browserAPI
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(guardCode, sandbox);
  vm.runInContext(reconcileCode, sandbox);
  vm.runInContext(bgCode, sandbox);
  if (!opts.skipInitialFlush) await flushTicks();
  return {
    sandbox, mock, intervals,
    advance: (ms) => { nowRef.value += ms; }, getNow: () => nowRef.value,
    dispatchMsg: (message, sender = {}) => new Promise((resolve, reject) => {
      const fn = mock.listeners.onMessage[mock.listeners.onMessage.length - 1];
      const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${message.type}`)), 2000);
      fn(message, sender, (res) => { clearTimeout(timer); resolve(res); });
    })
  };
}

function createContentEnv(startMs = 1732492800000, isTop = true) {
  const nowRef = { value: startMs };
  const winListeners = new Map();
  const portLog = [];
  const ipcSent = [];
  const ports = [];
  const bind = (map) => (evt, fn, opt) => { if (!map.has(evt)) map.set(evt, []); map.get(evt).push({ fn, opt }); };
  const mockWindow = { location: { hostname: 'docs.google.com', href: 'https://docs.google.com/doc/1' }, addEventListener: bind(winListeners), removeEventListener: () => {}, postMessage: () => {} };
  mockWindow.top = isTop ? mockWindow : { postMessage: () => {} };
  const mockDocument = {
    readyState: 'complete', visibilityState: 'visible', hasFocus: () => true,
    documentElement: { getAttribute: () => null, setAttribute: () => {}, nodeType: 1 }, body: { nodeType: 1 },
    addEventListener: bind(new Map()), removeEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [],
    getElementById: () => null, createElement: (t) => ({ tagName: t.toUpperCase(), setAttribute: () => {}, getAttribute: () => null, style: {} })
  };
  const chromeMock = {
    runtime: {
      id: 'sentinel_content_ext', onMessage: { addListener: () => {}, removeListener: () => {} },
      sendMessage: (m, cb) => { ipcSent.push(m); if (cb) cb({ received: true }); },
      connect: () => {
        const p = { name: 'sentinel_tracking_keepalive', onDisconnect: { addListener: () => {} }, postMessage: (m) => portLog.push(m), disconnect: () => {} };
        ports.push(p);
        return p;
      }
    },
    storage: { local: { get: (_k, cb) => cb && cb({}), set: (_i, cb) => cb && cb() }, onChanged: { addListener: () => {}, removeListener: () => {} } }
  };
  const sandbox = {
    window: mockWindow, document: mockDocument, chrome: chromeMock, globalThis: { chrome: chromeMock },
    setInterval: () => 1, clearInterval: () => {}, setTimeout: () => 2, clearTimeout: () => {},
    Date: makeMockDate(nowRef), MutationObserver: class { observe() {} disconnect() {} },
    WeakSet, Set, Map, Array, Object, module: { exports: {} }, console: { log: () => {}, debug: () => {}, warn: () => {}, error: () => {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(contentCode, sandbox);
  return {
    sandbox, ctx: sandbox.window.__SentinelMediaContext, portLog, ipcSent, ports,
    advance: (ms) => { nowRef.value += ms; },
    fireWin: (evt, extra = {}) => (winListeners.get(evt) || []).forEach((h) => h.fn({ type: evt, ...extra }))
  };
}

function measureFunctionLines(source, fnName) {
  const rx = new RegExp(`(?:async\\s+)?function\\s+${fnName}\\s*\\(`, 'm');
  const match = source.match(rx);
  if (!match) return -1;
  let parenDepth = 0;
  let idx = match.index + match[0].length - 1;
  while (idx < source.length) {
    const c = source.charCodeAt(idx);
    if (c === 40) parenDepth++;
    else if (c === 41 && --parenDepth === 0) break;
    idx++;
  }
  const braceStart = source.indexOf(String.fromCharCode(123), idx);
  if (braceStart === -1) return -1;
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const c = source.charCodeAt(i);
    if (c === 123) depth++;
    else if (c === 125 && --depth === 0) return source.slice(match.index, i + 1).split('\n').length;
  }
  return -1;
}

async function runBattery1ActiveMediaIdleExemption() {
  console.log('Battery 1: Active Foreground Media Idle Exemption vs Screen Lock & Non-Media Idle');
  const t0 = 1732492800000;
  const env = await createBgEnv(t0);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('youtube.com', true);
  await flushTicks();
  await env.dispatchMsg({
    type: 'MEDIA_STATE_CHANGED',
    payload: { hasMedia: true, anyPlaying: true, domain: 'youtube.com', primaryMedia: { isPlaying: true, mediaType: 'video', domain: 'youtube.com', title: 'Lecture' } }
  }, { tab: { id: 101, windowId: 1 } });

  env.advance(65000);
  await env.mock.listeners.idle[0]('idle');
  assert.strictEqual(env.sandbox.getIsUserActive(), true, 'Focused foreground video must exempt idle');
  env.advance(20000);
  env.sandbox.commitActiveInterval();
  const yt = env.sandbox.getActivityData().domains['youtube.com'];
  assert.strictEqual(yt.foregroundSeconds, 85);
  assert.strictEqual(yt.backgroundMediaSeconds, 0, 'Foreground media must NOT move to backgroundMediaSeconds');

  env.advance(10000);
  await env.mock.listeners.idle[0]('locked');
  assert.strictEqual(env.sandbox.getIsSystemLocked(), true);
  assert.strictEqual(yt.foregroundSeconds, 95, 'Pre-lock 10s committed cleanly');
  env.advance(30000);
  env.sandbox.commitActiveInterval();
  assert.strictEqual(yt.foregroundSeconds, 95, 'Screen lock must freeze tracking even with video element');

  await env.mock.listeners.idle[0]('active');
  env.sandbox.setActiveTabId(202);
  env.sandbox.setActiveTabAudible(false);
  env.sandbox.switchActiveDomain('wikipedia.org', true);
  await flushTicks();
  env.advance(10000);
  await env.mock.listeners.idle[0]('idle');
  env.advance(25000);
  env.sandbox.commitActiveInterval();
  assert.strictEqual(env.sandbox.getActivityData().domains['wikipedia.org'].foregroundSeconds, 10, 'Non-media tab still freezes on idle');
  console.log('  ✅ Video/audible idle exemption, lock freeze & non-media idle freeze verified\n');
}

async function runBattery2HeartbeatActivityWake() {
  console.log('Battery 2: Keepalive Heartbeat Activity Wake');
  const t0 = 1732492800000;
  const env = await createBgEnv(t0);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('notion.so', true);
  await flushTicks();

  let onMsg = null;
  const port = { name: 'sentinel_tracking_keepalive', sender: { id: 'sentinel_test_ext', tab: { id: 101 } }, onMessage: { addListener: (f) => { onMsg = f; } }, onDisconnect: { addListener: () => {} } };
  assert.strictEqual(env.sandbox.handleTrackingKeepaliveConnect(port), true);

  await env.mock.listeners.idle[0]('idle');
  assert.strictEqual(env.sandbox.getIsUserActive(), false);
  env.advance(10000);
  await onMsg({ type: 'KEEPALIVE_HEARTBEAT', domain: 'notion.so', timestamp: env.getNow(), timeSinceLastActivity: 12000 });
  assert.strictEqual(env.sandbox.getIsUserActive(), true, 'Recent activity (<60s) must restore isUserActive');

  env.advance(15000);
  await onMsg({ type: 'KEEPALIVE_HEARTBEAT', domain: 'notion.so', timestamp: env.getNow(), timeSinceLastActivity: 2000 });
  assert.strictEqual(env.sandbox.getActivityData().domains['notion.so'].foregroundSeconds, 15, 'Post-wake active span credits 15s');

  await env.mock.listeners.idle[0]('locked');
  env.advance(5000);
  await onMsg({ type: 'KEEPALIVE_HEARTBEAT', domain: 'notion.so', timestamp: env.getNow(), timeSinceLastActivity: 1000 });
  assert.strictEqual(env.sandbox.getIsUserActive(), false, 'Locked screen must NEVER wake on heartbeat');
  console.log('  ✅ Heartbeat timeSinceLastActivity wake & lock guard verified\n');
}

async function runBattery3StartupMergeAndLastFocused() {
  console.log('Battery 3: Additive Pre-Load Storage Merge, lastFocusedWindow & Session Count');
  const todayKey = TR.formatLocalDateKey(1732492800000);
  const localData = {
    media_sentinel_activity_data: {
      domains: {
        'github.com': {
          totalSeconds: 1000, foregroundSeconds: 1000, backgroundMediaSeconds: 0, sessionCount: 3, lastActive: 1732492000000,
          days: { '2026-11-24': { seconds: 400, foregroundSeconds: 400, sessions: 2 }, [todayKey]: { seconds: 600, foregroundSeconds: 600, sessions: 3 } }
        },
        'youtube.com': {
          totalSeconds: 200, foregroundSeconds: 200, backgroundMediaSeconds: 0, sessionCount: 3, lastActive: 1732492700000,
          days: { [todayKey]: { seconds: 200, foregroundSeconds: 200, sessions: 3 } }
        }
      }
    }
  };
  let releaseGet = null;
  const gatePromise = new Promise((r) => { releaseGet = r; });
  const mergeEnv = await createBgEnv(1732492800000, { localData, localGetGate: () => gatePromise, skipInitialFlush: true });
  mergeEnv.sandbox.setActiveTabId(101);
  mergeEnv.sandbox.switchActiveDomain('github.com', true);
  mergeEnv.advance(5000);
  mergeEnv.sandbox.commitActiveInterval();
  releaseGet();
  await flushTicks();
  const gh = mergeEnv.sandbox.getActivityData().domains['github.com'];
  assert.strictEqual(gh.foregroundSeconds, 1005, 'Pre-load 5s must add onto stored 1000s');
  assert.strictEqual(gh.days['2026-11-24'].seconds, 400, 'Historical day must stay preserved');

  const wakeEnv = await createBgEnv(1732492800000, {
    localData,
    sessionData: { sentinel_active_session: { domain: 'youtube.com', tabId: 303, startTime: 1732492790000, lastHeartbeat: 1732492795000, lastCommittedTime: 1732492795000 } },
    tabsQuery: async (q) => (q.currentWindow ? [] : [{ id: 303, windowId: 7, url: 'https://youtube.com/watch?v=1', audible: true }]),
    getLastFocused: async () => ({ id: 7, focused: true, state: 'normal', type: 'normal' })
  });
  assert.strictEqual(wakeEnv.sandbox.getActiveDomain(), 'youtube.com', 'lastFocusedWindow recovers active tab');
  assert.strictEqual(wakeEnv.sandbox.getActivityData().domains['youtube.com'].sessionCount, 3, 'Same checkpoint domain avoids false session increment');

  const minEnv = await createBgEnv(1732492800000, {
    getLastFocused: async () => ({ id: 9, focused: false, state: 'minimized', type: 'normal', tabs: [{ id: 1, active: true, url: 'https://news.ycombinator.com' }] })
  });
  assert.strictEqual(minEnv.sandbox.getIsBrowserFocused(), false, 'Minimized window boots unfocused');
  console.log('  ✅ Additive merge, lastFocusedWindow bootstrap & minimized focus guard verified\n');
}

async function runBattery4ConcurrencyAndRemainder() {
  console.log('Battery 4: Concurrent Ticker + Heartbeat Non-Duplication, Disconnect & Remainder');
  const t0 = 1732492800000;
  const env = await createBgEnv(t0);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('rust-lang.org', true);
  await flushTicks();

  let onMsg = null;
  let onDisc = null;
  const port = { name: 'sentinel_tracking_keepalive', sender: { id: 'sentinel_test_ext', tab: { id: 101 } }, onMessage: { addListener: (f) => { onMsg = f; } }, onDisconnect: { addListener: (f) => { onDisc = f; } } };
  env.sandbox.handleTrackingKeepaliveConnect(port);

  env.advance(15000);
  env.sandbox.commitActiveInterval();
  await onMsg({ type: 'KEEPALIVE_HEARTBEAT', domain: 'rust-lang.org', timestamp: env.getNow(), timeSinceLastActivity: 0 });
  assert.strictEqual(env.sandbox.getActivityData().domains['rust-lang.org'].foregroundSeconds, 15, 'Simultaneous ticker + heartbeat must credit 15s (never 30s)');

  env.advance(6400);
  onDisc();
  assert.strictEqual(env.sandbox.getActivityData().domains['rust-lang.org'].foregroundSeconds, 21, 'Disconnect flush commits trailing 6s');

  let nowDt = t0;
  const origNow = Date.now;
  Date.now = () => nowDt;
  try {
    const dtState = { activeDomain: 'mdn.dev', intervalStartTime: t0, isBrowserFocused: true, isUserActive: true, isTrackingPaused: false, activityData: { domains: {} } };
    nowDt += 4400; DomainTracker.commitActiveInterval(dtState);
    nowDt += 4500; DomainTracker.commitActiveInterval(dtState);
    nowDt += 1100; DomainTracker.commitActiveInterval(dtState);
    assert.strictEqual(dtState.activityData.domains['mdn.dev'].foregroundSeconds, 10, '4.4s + 4.5s + 1.1s must equal 10s');
  } finally {
    Date.now = origNow;
  }
  console.log('  ✅ Non-duplication, disconnect flush & DomainTracker sub-second remainder verified\n');
}

async function runBattery5SerializedTransitionsAndDevtools() {
  console.log('Battery 5: Serialized Focus/Tab Transitions, focusAt Anchor & DevTools Non-Clobber');
  const t0 = 1732492800000;
  let releaseTab1 = null;
  const env = await createBgEnv(t0, {
    tabsGet: async (id) => {
      if (id === 101) await new Promise((r) => { releaseTab1 = r; });
      return { id, windowId: 1, url: id === 101 ? 'https://alpha.example' : 'https://beta.example', audible: false };
    },
    tabsQuery: async (q) => (q.windowId === 99 ? [] : [{ id: 202, windowId: 1, url: 'https://beta.example', audible: false }]),
    windowsGet: async (winId) => (winId === 99 ? { id: 99, type: 'devtools' } : { id: 1, type: 'normal' })
  });

  const p1 = env.mock.listeners.activated[0]({ tabId: 101, windowId: 1 });
  const p2 = env.mock.listeners.activated[0]({ tabId: 202, windowId: 1 });
  await flushTicks();
  releaseTab1();
  await Promise.all([p1, p2]);
  assert.strictEqual(env.sandbox.getActiveDomain(), 'beta.example', 'Serialized transitions settle deterministically on final tab');

  await env.mock.listeners.focus[0](99);
  assert.strictEqual(env.sandbox.getActiveDomain(), 'beta.example', 'DevTools focus must preserve tracked domain');

  env.advance(10000);
  await env.mock.listeners.focus[0](-1);
  env.advance(15000);
  const tailRec = await env.sandbox.flushActiveSessionDelta(env.getNow());
  assert.strictEqual(tailRec.creditedSeconds, 0, 'WINDOW_ID_NONE must freeze blurred tail');
  console.log('  ✅ Serialized tab transitions, DevTools non-clobber & blur freeze verified\n');
}

function runBattery6ContentPageshowAndAudit() {
  console.log('Battery 6: BFCache pageshow Reconnect, Subframe IPC Bridge, Rule 28 & UTF-8 BOM Audit');
  const topEnv = createContentEnv(1732492800000, true);
  assert.ok(topEnv.ctx.getKeepalivePort(), 'Initial port connected');
  topEnv.fireWin('pagehide');
  assert.strictEqual(topEnv.ctx.getKeepalivePort(), null, 'pagehide disconnects port');
  topEnv.fireWin('pageshow');
  assert.ok(topEnv.ctx.getKeepalivePort(), 'pageshow BFCache restores keepalive port');

  topEnv.advance(12000);
  const prevHb = topEnv.portLog.length;
  topEnv.fireWin('message', { data: { type: 'SENTINEL_SUBFRAME_ACTIVITY', timestamp: 1732492812000 } });
  assert.ok(topEnv.ipcSent.some((m) => m.type === 'PAGE_USER_INTERACTION'), 'Subframe triggers throttled PAGE_USER_INTERACTION');
  assert.strictEqual(topEnv.portLog.length, prevHb + 1, 'Subframe sends KEEPALIVE_HEARTBEAT');

  for (const target of [guardPath, reconcilePath, trackerPath, bgPath, contentPath, __filename]) {
    const raw = fs.readFileSync(target);
    assert.strictEqual(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF, true, `${path.basename(target)} must have UTF-8 BOM`);
  }
  assert.ok(reconcileCode.split('\n').length < 500, 'timestamp_reconciliation.js < 500 lines');
  assert.ok(guardCode.split('\n').length < 200, 'foreground_tracking_guard.js < 200 lines');
  const selfCode = fs.readFileSync(__filename, 'utf8');
  assert.ok(selfCode.split('\n').length < 500, 'test_foreground_tracking_undercounting.js < 500 lines');
  assert.strictEqual(/\.innerHTML\s*=/.test(guardCode) || /\.innerHTML\s*=/.test(selfCode), false);

  const fnTargets = [
    [guardCode, ['isMediaExemptionActive', 'shouldWakeOnRecentActivity', 'resolveMonotonicLastCommitted', 'computeSubSecondCommitEndMs', 'isNonClobberWindow']],
    [reconcileCode, ['resolveReconciliationPlan', 'reconcileSessionDelta', 'resolveHeartbeatCommit', 'processKeepaliveHeartbeat', 'handleKeepaliveConnect']],
    [bgCode, ['mergePreloadHourlyBuckets', 'mergePreloadDayEntry', 'mergePreloadDomainEntry', 'mergeStoredDomainsWithMemory', 'commitActiveInterval', 'handleRecentPageActivity', 'handleKeepaliveDisconnect', 'getReconciliationContext', 'handleWindowFocusRestore', 'freezeTrackingOnIdleOrLock', 'handleIdleStateTransition', 'handleTabUpdateTransition', 'isUserActivelyWatchingMedia', 'queryInitialIdleState', 'queryStartupWindowAndTab', 'initializeActiveTabOnStartup', 'enqueueTransitionOp']],
    [selfCode, ['makeStorage', 'makeMockDate', 'flushTicks', 'makeBgBrowserMock', 'createBgEnv', 'createContentEnv', 'measureFunctionLines', 'runBattery1ActiveMediaIdleExemption', 'runBattery2HeartbeatActivityWake', 'runBattery3StartupMergeAndLastFocused', 'runBattery4ConcurrencyAndRemainder', 'runBattery5SerializedTransitionsAndDevtools', 'runBattery6ContentPageshowAndAudit']]
  ];
  for (const [src, names] of fnTargets) {
    for (const fn of names) {
      const lines = measureFunctionLines(src, fn);
      assert.ok(lines > 0 && lines <= 50, `${fn} (${lines} lines) must obey Rule 28 <= 50 lines`);
    }
  }
  console.log('  ✅ BFCache pageshow, subframe IPC bridge, UTF-8 BOM & Rule 28 audit passed\n');
}

(async () => {
  try {
    await runBattery1ActiveMediaIdleExemption();
    await runBattery2HeartbeatActivityWake();
    await runBattery3StartupMergeAndLastFocused();
    await runBattery4ConcurrencyAndRemainder();
    await runBattery5SerializedTransitionsAndDevtools();
    runBattery6ContentPageshowAndAudit();
    assert.ok(ForegroundTrackingGuard && TR);
    console.log('============================================================\nALL 6 FOREGROUND UNDERCOUNTING BATTERIES PASSED (Exit Code: 0)\n============================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Failed:', err);
    process.exit(1);
  }
})();
