/**
 * Comprehensive Foreground & Active Tab Time Tracking Regression Suite (6 Batteries)
 * Covers RC-01 through RC-09 across classic SW importScripts hydration, passive reading,
 * multi-frame media, cold-start hydration, outgoing final flush, focus guards, and date parity.
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const bgCode = fs.readFileSync(path.join(rootDir, 'background.js'), 'utf8');
const contentCode = fs.readFileSync(path.join(rootDir, 'content_media.js'), 'utf8');
const dashJsCode = fs.readFileSync(path.join(rootDir, 'dashboard', 'dashboard.js'), 'utf8');

function makeStorage(initialData = {}) {
  const data = JSON.parse(JSON.stringify(initialData));
  const pick = (keys) => {
    if (!keys) return { ...data };
    const out = {};
    for (const k of (Array.isArray(keys) ? keys : [keys])) if (data[k] !== undefined) out[k] = data[k];
    return out;
  };
  return {
    data,
    get: async (keys) => pick(keys),
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
  for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));
}

function makeBrowserMock(opts = {}) {
  const listeners = { activated: [], updated: [], removed: [], focus: [], idle: [], onMessage: [], onConnect: [] };
  const reg = (arr) => ({ addListener: (fn) => arr.push(fn), removeListener: () => {}, hasListener: () => false });
  const local = makeStorage(opts.localData || {});
  const session = makeStorage(opts.sessionData || {});
  const idleIntervals = [];
  const tabsSend = opts.tabsSendMessage || ((_id, _m, cb) => { if (cb) cb(null); return Promise.resolve(null); });
  const browserAPI = {
    action: { setBadgeText: () => {}, setBadgeBackgroundColor: () => {} },
    alarms: { onAlarm: reg([]), clear: async () => {}, create: () => {}, get: async () => null },
    idle: {
      onStateChanged: reg(listeners.idle),
      setDetectionInterval: (sec) => idleIntervals.push(sec),
      queryState: opts.queryState || ((_, cb) => cb && cb('active'))
    },
    notifications: { create: () => {} },
    runtime: {
      id: 'sentinel_test_ext', lastError: null, onConnect: reg(listeners.onConnect),
      onMessage: reg(listeners.onMessage), onSuspend: reg([]), onInstalled: reg([]),
      connect: () => ({ onMessage: reg([]), onDisconnect: reg([]), postMessage: () => {}, disconnect: () => {} }),
      sendMessage: (_m, cb) => { if (cb) cb(null); return Promise.resolve(null); },
      getManifest: () => ({ version: '2.5.0' })
    },
    scripting: { executeScript: async () => [] },
    storage: { local, session, onChanged: reg([]) },
    tabs: {
      onActivated: reg(listeners.activated), onCreated: reg([]),
      onRemoved: reg(listeners.removed), onUpdated: reg(listeners.updated),
      get: opts.tabsGet || (async (id) => ({ id, windowId: 1, url: 'https://developer.mozilla.org/en-US', audible: false })),
      query: opts.tabsQuery || (async () => []), sendMessage: tabsSend, update: async () => null
    },
    windows: {
      onFocusChanged: reg(listeners.focus), getCurrent: async () => null,
      getLastFocused: opts.getLastFocused || (async () => ({ id: 1, focused: true, type: 'normal', state: 'normal' })),
      get: opts.windowsGet || (async (id) => ({ id, focused: true, type: 'normal', state: 'normal' })),
      update: async () => null, WINDOW_ID_NONE: -1
    }
  };
  return { browserAPI, listeners, local, session, idleIntervals };
}

async function createClassicSwEnv(startMs = 1732492800000, opts = {}) {
  const nowRef = { value: startMs };
  const mock = makeBrowserMock(opts);
  const silent = { log: () => {}, info: () => {}, debug: () => {}, warn: () => {}, error: () => {} };
  const sandbox = {
    URL, Math, Set, Map, WeakMap, Array, Object, String, Number, Boolean, parseInt, isNaN, Promise,
    Date: makeMockDate(nowRef), WebSocket: class {}, navigator: { userAgent: 'Chrome/130.0.0.0' },
    console: silent, setInterval: () => 1, clearInterval: () => {}, setTimeout: () => 1, clearTimeout: () => {},
    browserAPI: mock.browserAPI, chrome: mock.browserAPI, browser: mock.browserAPI,
    importScripts: (...relPaths) => {
      for (const rel of relPaths) {
        const abs = path.resolve(rootDir, rel);
        vm.runInContext(fs.readFileSync(abs, 'utf8'), sandbox, { filename: abs });
      }
    }
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(bgCode, sandbox, { filename: path.join(rootDir, 'background.js') });
  await flushTicks();
  return {
    sandbox, mock,
    advance: (ms) => { nowRef.value += ms; },
    getNow: () => nowRef.value,
    dispatchMsg: (msg, sender = {}) => new Promise((resolve, reject) => {
      const fn = mock.listeners.onMessage[mock.listeners.onMessage.length - 1];
      const timer = setTimeout(() => reject(new Error(`Timeout: ${msg.type}`)), 2000);
      fn(msg, sender, (res) => { clearTimeout(timer); resolve(res); });
    })
  };
}

function makeFakePort(name, tabId, url) {
  const msgListeners = [];
  const discListeners = [];
  return {
    name,
    sender: { id: 'sentinel_test_ext', tab: { id: tabId, windowId: 1, url } },
    onMessage: { addListener: (fn) => msgListeners.push(fn) },
    onDisconnect: { addListener: (fn) => discListeners.push(fn) },
    postMessage: () => {}, disconnect: () => discListeners.forEach((fn) => fn()),
    emitMessage: async (msg) => { for (const fn of msgListeners) await fn(msg); }
  };
}

function createContentEnv(startMs = 1732492800000) {
  const nowRef = { value: startMs };
  const winListeners = new Map();
  const portLog = [];
  const clearedTimeouts = [];
  let nextTid = 10;
  const regMap = (m) => (e, fn, o) => { if (!m.has(e)) m.set(e, []); m.get(e).push({ fn, o }); };
  const mockWin = { location: { hostname: 'docs.python.org', href: 'https://docs.python.org/3/' }, addEventListener: regMap(winListeners), removeEventListener: () => {}, postMessage: () => {} };
  mockWin.top = mockWin;
  const mockDoc = {
    readyState: 'complete', visibilityState: 'visible', hasFocus: () => true,
    documentElement: { getAttribute: () => null, setAttribute: () => {}, nodeType: 1 }, body: { nodeType: 1 },
    addEventListener: regMap(new Map()), removeEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [],
    getElementById: () => null, createElement: (t) => ({ tagName: t.toUpperCase(), setAttribute: () => {}, getAttribute: () => null, style: {} })
  };
  let activePort = null;
  const chromeMock = {
    runtime: {
      id: 'sentinel_content_ext', onMessage: { addListener: () => {}, removeListener: () => {} },
      sendMessage: (_m, cb) => { if (cb) cb({ received: true }); },
      connect: () => {
        const disc = [];
        activePort = { name: 'sentinel_tracking_keepalive', onDisconnect: { addListener: (fn) => disc.push(fn) }, postMessage: (m) => portLog.push(m), disconnect: () => {}, _disc: disc };
        return activePort;
      }
    },
    storage: { local: { get: (_k, cb) => cb && cb({}), set: (_i, cb) => cb && cb() }, onChanged: { addListener: () => {}, removeListener: () => {} } }
  };
  const sandbox = {
    window: mockWin, document: mockDoc, chrome: chromeMock, globalThis: { chrome: chromeMock },
    setInterval: () => 1, clearInterval: () => {}, setTimeout: () => ++nextTid, clearTimeout: (id) => clearedTimeouts.push(id),
    Date: makeMockDate(nowRef), MutationObserver: class { observe() {} disconnect() {} },
    WeakSet, Set, Map, Array, Object, module: { exports: {} }, console: { log: () => {}, debug: () => {}, warn: () => {}, error: () => {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(contentCode, sandbox);
  return {
    portLog, clearedTimeouts,
    advance: (ms) => { nowRef.value += ms; },
    disconnectPort: () => activePort._disc.forEach((fn) => fn()),
    fireWin: (e) => (winListeners.get(e) || []).forEach((h) => h.fn({ type: e }))
  };
}

function measureFunctionLines(source, fnName) {
  const rx = new RegExp(`(?:async\\s+)?function\\s+${fnName}\\s*\\(`, 'm');
  const m = source.match(rx);
  if (!m) return -1;
  let p = 0, i = m.index + m[0].length - 1;
  while (i < source.length) {
    const c = source.charCodeAt(i);
    if (c === 40) p++;
    else if (c === 41 && --p === 0) break;
    i++;
  }
  const bs = source.indexOf(String.fromCharCode(123), i);
  let d = 0;
  for (let j = bs; j < source.length; j++) {
    if (source.charCodeAt(j) === 123) d++;
    else if (source.charCodeAt(j) === 125 && --d === 0) return source.slice(m.index, j + 1).split(/\r?\n/).length;
  }
  return -1;
}

async function runBattery1ClassicImportScripts() {
  console.log('Battery 1: Classic MV3 importScripts Hydration Parity (RC-01)');
  const t0 = 1732492800000;
  const env = await createClassicSwEnv(t0);
  const mods = env.sandbox.SentinelBackgroundModules;
  assert.ok(mods && mods.TimestampReconciliation, 'TimestampReconciliation must hydrate via importScripts');
  assert.ok(mods.ForegroundTrackingGuard, 'ForegroundTrackingGuard must hydrate via importScripts');
  assert.ok(mods.ActiveSessionResilience, 'ActiveSessionResilience must hydrate via importScripts');

  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('developer.mozilla.org', true);
  await flushTicks();
  const port = makeFakePort('sentinel_tracking_keepalive', 101, 'https://developer.mozilla.org/en-US');
  assert.strictEqual(env.sandbox.handleTrackingKeepaliveConnect(port), true, 'Keepalive connect must return true');
  env.advance(15000);
  await port.emitMessage({ type: 'KEEPALIVE_HEARTBEAT', domain: 'developer.mozilla.org', isFinalFlush: false, timestamp: env.getNow(), timeSinceLastActivity: 12000 });
  const dash = await env.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.ok(dash.activityData.domains['developer.mozilla.org'].foregroundSeconds >= 15, 'Keepalive heartbeat must credit >= 15s');
  assert.strictEqual(env.mock.session.data.sentinel_active_session.domain, 'developer.mozilla.org', 'Session checkpoint must update');
}

async function runBattery2MultiFrameMediaAndWake() {
  console.log('Battery 2: Multi-Frame Iframe Media Non-Clobber & Idle-to-Media Wake (RC-04)');
  const env = await createClassicSwEnv(1732493000000, {
    tabsGet: async (id) => ({ id, windowId: 1, active: true, url: 'https://www.coursera.org/learn/ai', audible: false })
  });
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('coursera.org', true);
  await flushTicks();

  const senderBase = { tab: { id: 101, windowId: 1, active: true, url: 'https://www.coursera.org/learn/ai' } };
  await env.dispatchMsg({ type: 'MEDIA_STATE_CHANGED', payload: { hasMedia: true, anyPlaying: true, domain: 'coursera.org', primaryMedia: { isPlaying: true, mediaType: 'video' } } }, { ...senderBase, frameId: 1 });
  await env.dispatchMsg({ type: 'MEDIA_STATE_CHANGED', payload: { hasMedia: true, anyPlaying: false, domain: 'coursera.org', primaryMedia: { isPlaying: false, mediaType: 'video' } } }, { ...senderBase, frameId: 0 });
  assert.strictEqual(env.sandbox.isUserActivelyWatchingMedia(), true, 'Paused top-frame must not clobber playing iframe');

  await env.mock.listeners.idle[0]('idle');
  await flushTicks();
  assert.strictEqual(env.sandbox.getIsUserActive(), true, 'Playing iframe must keep isUserActive true during OS idle');
  env.advance(45000);
  const dash1 = await env.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.ok(dash1.activityData.domains['coursera.org'].foregroundSeconds >= 45, 'Foreground playback must credit full 45s');

  await env.dispatchMsg({ type: 'MEDIA_STATE_CHANGED', payload: { hasMedia: true, anyPlaying: false, domain: 'coursera.org', primaryMedia: { isPlaying: false, mediaType: 'video' } } }, { ...senderBase, frameId: 1 });
  await env.mock.listeners.idle[0]('idle');
  await flushTicks();
  assert.strictEqual(env.sandbox.getIsUserActive(), false, 'Stopped media must allow OS idle freeze');

  await env.dispatchMsg({ type: 'MEDIA_STATE_CHANGED', payload: { hasMedia: true, anyPlaying: true, domain: 'coursera.org', primaryMedia: { isPlaying: true, mediaType: 'video' } } }, { ...senderBase, frameId: 1 });
  assert.strictEqual(env.sandbox.getIsUserActive(), true, 'Resumed focused media must restore isUserActive === true');
  env.advance(20000);
  const dash2 = await env.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.ok(dash2.activityData.domains['coursera.org'].foregroundSeconds >= 65, 'Resumed media must continue foreground crediting');

  await env.mock.listeners.idle[0]('locked');
  await flushTicks();
  assert.strictEqual(env.sandbox.getIsUserActive(), false, 'Screen lock must strictly freeze tracking');
}

async function runBattery3ColdStartAndIdleSerialization() {
  console.log('Battery 3: SW Cold-Start Media Hydration & Serialized Idle (RC-02, RC-03)');
  const t0 = 1732494000000;
  let pagePlaying = true;
  const env = await createClassicSwEnv(t0, {
    tabsQuery: async (q) => (q && q.audible) ? [] : [{ id: 101, windowId: 1, active: true, url: 'https://vimeo.com/12345', audible: false }],
    tabsSendMessage: (_id, msg, cb) => {
      const res = msg && msg.type === 'QUERY_PAGE_MEDIA'
        ? { hasMedia: pagePlaying, anyPlaying: pagePlaying, domain: 'vimeo.com', primaryMedia: { isPlaying: pagePlaying, mediaType: 'video' } }
        : null;
      if (cb) cb(res);
      return Promise.resolve(res);
    },
    queryState: (_sec, cb) => cb && cb('idle'),
    sessionData: {
      sentinel_active_session: {
        domain: 'vimeo.com', tabId: 101, startTime: t0 - 25000, lastHeartbeat: t0 - 25000,
        lastHeartbeatTime: t0 - 25000, lastCommittedTime: t0 - 25000, isBrowserFocused: true,
        isUserActive: true, wasMediaActive: true
      }
    }
  });
  const dash = await env.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  await flushTicks();
  assert.ok(dash.activityData.domains['vimeo.com'].foregroundSeconds >= 25, 'Startup media hydration must credit 25s pre-wake delta');
  assert.strictEqual(env.sandbox.getIsUserActive(), true, 'Cold-start hydrated playing video must boot with isUserActive === true');
  assert.strictEqual(env.sandbox.CONFIG.IDLE_THRESHOLD_SECONDS, 300, 'Default IDLE_THRESHOLD_SECONDS must be 300');
  assert.ok(env.mock.idleIntervals.includes(300), 'browserAPI.idle.setDetectionInterval must be called with 300');

  pagePlaying = false;
  env.sandbox.enqueueTransitionOp(async () => {
    await env.dispatchMsg({ type: 'MEDIA_STATE_CHANGED', payload: { hasMedia: false, anyPlaying: false, domain: 'vimeo.com' } }, { tab: { id: 101, windowId: 1, active: true, url: 'https://vimeo.com/12345' }, frameId: 0 });
  });
  await env.mock.listeners.idle[0]('idle');
  await flushTicks();
  assert.strictEqual(env.sandbox.getIsUserActive(), false, 'Serialized idle.onStateChanged must run after prior media clear');
}

async function runBattery4FinalFlushAndWindowGuards() {
  console.log('Battery 4: Outgoing isFinalFlush, pendingUrl, BG Window & DevTools Non-Clobber (RC-05, RC-06)');
  const t0 = 1732495000000;
  const tabMap = {
    101: { id: 101, windowId: 1, active: true, url: 'https://docs.python.org/3/' },
    202: { id: 202, windowId: 1, active: true, url: 'https://github.com/openai' },
    303: { id: 303, windowId: 2, active: true, url: 'https://example.org/bg' },
    404: { id: 404, windowId: 1, active: true, url: '', pendingUrl: 'https://developer.mozilla.org/en-US' }
  };
  const winMap = {
    1: { id: 1, focused: true, type: 'normal', state: 'normal', tabs: [tabMap[202]] },
    2: { id: 2, focused: false, type: 'normal', state: 'normal', tabs: [tabMap[303]] },
    9: { id: 9, focused: true, type: 'devtools', state: 'normal', tabs: [] },
    10: { id: 10, focused: true, type: 'popup', state: 'normal', tabs: [{ url: 'chrome-extension://ext/popup.html' }] }
  };
  const env = await createClassicSwEnv(t0, {
    tabsGet: async (id) => tabMap[id] || null,
    windowsGet: async (id) => winMap[id] || null
  });
  await env.mock.listeners.focus[0](1);
  env.sandbox.setActiveTabId(202);
  env.sandbox.switchActiveDomain('github.com', true);
  await flushTicks();
  await env.mock.session.set({
    sentinel_active_session: {
      domain: 'docs.python.org', tabId: 101, startTime: t0, lastHeartbeat: t0,
      lastHeartbeatTime: t0, lastCommittedTime: t0, isBrowserFocused: true, isUserActive: true
    }
  });
  const port101 = makeFakePort('sentinel_tracking_keepalive', 101, 'https://docs.python.org/3/');
  env.sandbox.handleTrackingKeepaliveConnect(port101);
  env.advance(20000);
  await port101.emitMessage({ type: 'KEEPALIVE_HEARTBEAT', domain: 'docs.python.org', isFinalFlush: true, timestamp: env.getNow() });
  const dash = await env.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.ok(dash.activityData.domains['docs.python.org'].foregroundSeconds >= 20, 'Outgoing isFinalFlush must credit pre-switch seconds');
  assert.strictEqual(env.sandbox.getActiveDomain(), 'github.com', 'Outgoing final flush must not clobber active github.com');

  await env.mock.listeners.activated[0]({ tabId: 303, windowId: 2 });
  await flushTicks();
  assert.strictEqual(env.sandbox.getActiveDomain(), 'github.com', 'Unfocused background window activation must not hijack active domain');

  await env.mock.listeners.activated[0]({ tabId: 404, windowId: 1 });
  await flushTicks();
  assert.strictEqual(env.sandbox.getActiveDomain(), 'developer.mozilla.org', 'pendingUrl must resolve domain during early navigation');

  await env.mock.listeners.focus[0](9);
  await env.mock.listeners.focus[0](10);
  await flushTicks();
  assert.strictEqual(env.sandbox.getActiveDomain(), 'developer.mozilla.org', 'DevTools and extension popup focus must not clobber domain');
}

async function runBattery5KeepaliveDateAndBgIsolation() {
  console.log('Battery 5: Content Reconnect Catchup, Dashboard Local Dates & BG Media Isolation (RC-07..09)');
  const cEnv = createContentEnv(1732496000000);
  assert.ok(cEnv.portLog.length >= 1, 'Initial keepalive connect must send initial heartbeat');
  const initialCount = cEnv.portLog.length;
  cEnv.disconnectPort();
  cEnv.advance(6000);
  cEnv.fireWin('focus');
  assert.ok(cEnv.clearedTimeouts.length >= 1, 'Focus reconnect must clear stale reconnectTimeout');
  assert.ok(cEnv.portLog.length > initialCount, 'Early focus reconnect after >= 5s must emit immediate catchup heartbeat');

  const utcDateFallbackRx = /(?:todayStr|todayKey|fromDate|toDate|filterFrom|filterTo|startDate|endDate)[^\n;]{0,120}toISOString\(\)\.split\('T'\)\[0\]/g;
  const fallbackMatches = dashJsCode.match(utcDateFallbackRx) || [];
  assert.strictEqual(fallbackMatches.length, 0, 'dashboard.js must have zero UTC todayStr/todayKey/filter toISOString fallbacks');

  const swEnv = await createClassicSwEnv(1732496000000);
  swEnv.sandbox.commitBackgroundMediaDelta('spotify.com', 35);
  const dash = await swEnv.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.strictEqual(dash.activityData.domains['spotify.com'].backgroundMediaSeconds, 35, 'Background media must credit 35s');
  assert.strictEqual(dash.activityData.domains['spotify.com'].foregroundSeconds, 0, 'Background media must keep foregroundSeconds at 0');
}

async function runBattery6Rule28AndAppSecAudit() {
  console.log('Battery 6: Rule 28 & AppSec Audit');
  const bomTargets = [
    'src/background/telemetry/active_session_resilience.js',
    'src/background/telemetry/foreground_tracking_guard.js',
    'src/background/telemetry/timestamp_reconciliation.js',
    'background.js',
    'content_media.js',
    'dashboard/dashboard.js',
    'tests/test_foreground_all_websites_tracking_fix.js'
  ];
  for (const rel of bomTargets) {
    const buf = fs.readFileSync(path.join(rootDir, rel));
    assert.strictEqual(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, true, `${rel} must begin with UTF-8 BOM`);
  }
  const trLines = fs.readFileSync(path.join(rootDir, 'src/background/telemetry/timestamp_reconciliation.js'), 'utf8').split(/\r?\n/).length;
  const selfSrc = fs.readFileSync(__filename, 'utf8');
  assert.ok(trLines < 500, `timestamp_reconciliation.js must stay < 500 lines (got ${trLines})`);
  assert.ok(selfSrc.split(/\r?\n/).length < 500, 'Test file itself must stay < 500 lines');
  assert.strictEqual(/\.innerHTML\s*=/.test(fs.readFileSync(path.join(rootDir, 'src/background/telemetry/active_session_resilience.js'), 'utf8')), false, 'No innerHTML');

  const selfFns = [
    'makeStorage', 'makeMockDate', 'flushTicks', 'makeBrowserMock', 'createClassicSwEnv',
    'makeFakePort', 'createContentEnv', 'measureFunctionLines',
    'runBattery1ClassicImportScripts', 'runBattery2MultiFrameMediaAndWake',
    'runBattery3ColdStartAndIdleSerialization', 'runBattery4FinalFlushAndWindowGuards',
    'runBattery5KeepaliveDateAndBgIsolation', 'runBattery6Rule28AndAppSecAudit'
  ];
  for (const fn of selfFns) {
    const lines = measureFunctionLines(selfSrc, fn);
    assert.ok(lines > 0 && lines <= 50, `${fn} must be <= 50 lines (got ${lines})`);
  }
}

(async () => {
  await runBattery1ClassicImportScripts();
  await runBattery2MultiFrameMediaAndWake();
  await runBattery3ColdStartAndIdleSerialization();
  await runBattery4FinalFlushAndWindowGuards();
  await runBattery5KeepaliveDateAndBgIsolation();
  await runBattery6Rule28AndAppSecAudit();
  console.log('[PASS] All 6 Foreground All-Websites Tracking Fix batteries passed.');
  process.exit(0);
})().catch((err) => { console.error('[FAIL]', err); process.exit(1); });
