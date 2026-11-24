/**
 * Verification Suite: Cross-Midnight Rollover, Active Reconciliation & Google Docs Subframe Capture
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
const manifestPath = path.join(rootDir, 'manifest.json');

const TR = require(reconcilePath);
const [reconcileCode, bgCode, contentCode] = [reconcilePath, bgPath, contentPath].map((p) => fs.readFileSync(p, 'utf8'));

function makeMockStorage() {
  const data = {};
  return {
    data,
    get: async (keys, cb) => {
      const out = {};
      for (const k of (Array.isArray(keys) ? keys : [keys])) if (data[k] !== undefined) out[k] = data[k];
      if (cb) cb(out);
      return out;
    },
    set: async (items, cb) => { Object.assign(data, items); if (cb) cb(); },
    remove: async (keys, cb) => { for (const k of (Array.isArray(keys) ? keys : [keys])) delete data[k]; if (cb) cb(); }
  };
}

function makeBrowserMock() {
  const listeners = { onMessage: [] };
  const [session, local] = [makeMockStorage(), makeMockStorage()];
  const reg = (arr) => ({ addListener: (fn) => arr.push(fn), removeListener: () => {}, hasListener: () => false });
  const browserAPI = {
    action: { setBadgeText: () => {}, setBadgeBackgroundColor: () => {} },
    alarms: { onAlarm: reg([]), clear: async () => {}, create: () => {}, get: async () => null },
    idle: { onStateChanged: reg([]), setDetectionInterval: () => {}, queryState: (_, cb) => cb && cb('active') },
    notifications: { create: () => {} },
    runtime: {
      id: 'sentinel_test_ext', lastError: null, onConnect: reg([]), onMessage: reg(listeners.onMessage),
      onSuspend: reg([]), onInstalled: reg([]), sendMessage: (_m, cb) => { if (cb) cb(null); return Promise.resolve(null); },
      connect: () => ({ onMessage: reg([]), onDisconnect: reg([]), postMessage: () => {}, disconnect: () => {} }),
      getManifest: () => ({ version: '2.5.0' })
    },
    scripting: { executeScript: async () => [] }, storage: { local, session, onChanged: reg([]) },
    tabs: {
      onActivated: reg([]), onCreated: reg([]), onRemoved: reg([]), onUpdated: reg([]),
      get: async (id) => ({ id, url: 'https://docs.google.com/document/d/1' }), query: async () => [],
      sendMessage: (_id, _m, cb) => { if (cb) cb(null); return Promise.resolve(null); }, update: async () => null
    },
    windows: { onFocusChanged: reg([]), getCurrent: async () => null, get: async () => null, update: async () => null, WINDOW_ID_NONE: -1 }
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

async function createBgEnv(startMs) {
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
    dispatchMsg: (message) => new Promise((resolve) => {
      const fn = mock.listeners.onMessage[mock.listeners.onMessage.length - 1];
      fn(message, {}, resolve);
    })
  };
}

function createContentFrameEnv(opts) {
  const nowRef = { value: opts.startMs };
  const winListeners = new Map();
  const docListeners = new Map();
  const sentIpc = [];
  const postedHeartbeats = [];
  const parentPosts = [];
  const removedWin = [];
  const removedDoc = [];
  const bindMap = (map) => (evt, handler, options) => {
    if (!map.has(evt)) map.set(evt, []);
    map.get(evt).push({ handler, options });
  };
  const mockTop = opts.isTop ? null : { postMessage: (msg, origin) => parentPosts.push({ target: 'top', msg, origin }) };
  const mockWindow = {
    location: { hostname: opts.hostname, href: opts.href },
    addEventListener: bindMap(winListeners),
    removeEventListener: (evt, handler, options) => removedWin.push({ evt, handler, options }),
    postMessage: (msg, origin) => parentPosts.push({ target: 'self', msg, origin }),
    parent: opts.isTop ? null : { postMessage: (msg, origin) => parentPosts.push({ target: 'parent', msg, origin }) },
    top: mockTop
  };
  if (opts.isTop) { mockWindow.top = mockWindow; mockWindow.parent = mockWindow; }
  const mockDocument = {
    readyState: 'complete', visibilityState: 'visible', hasFocus: () => true,
    documentElement: { getAttribute: () => null, setAttribute: () => {}, nodeType: 1 }, body: { nodeType: 1 },
    addEventListener: bindMap(docListeners), removeEventListener: (evt, handler, options) => removedDoc.push({ evt, handler, options }),
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
    createElement: (t) => ({ tagName: t.toUpperCase(), setAttribute: () => {}, getAttribute: () => null, style: {} })
  };
  const browserAPI = {
    runtime: {
      id: 'sentinel_gdocs_ext',
      sendMessage: (m, cb) => { sentIpc.push(m); if (cb) cb({ received: true }); },
      onMessage: { addListener: () => {}, removeListener: () => {} },
      connect: () => ({ name: 'sentinel_tracking_keepalive', onDisconnect: { addListener: () => {} }, postMessage: (m) => postedHeartbeats.push(m), disconnect: () => {} }),
      getURL: (p) => `chrome-extension://id/${p}`
    },
    storage: { local: { get: (_k, cb) => cb && cb({}), set: (_i, cb) => cb && cb() }, onChanged: { addListener: () => {}, removeListener: () => {} } }
  };
  const sandbox = {
    window: mockWindow, document: mockDocument, chrome: browserAPI, globalThis: { chrome: browserAPI },
    setInterval: () => 101, clearInterval: () => {}, setTimeout: () => 202, clearTimeout: () => {},
    Date: makeMockDate(nowRef), MutationObserver: class { observe() {} disconnect() {} },
    WeakSet, Set, Map, Array, Object, module: { exports: {} },
    console: { log: () => {}, debug: () => {}, warn: () => {}, error: () => {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(contentCode, sandbox);
  return {
    sandbox, ctx: sandbox.window.__SentinelMediaContext, sentIpc, postedHeartbeats, parentPosts, removedWin, removedDoc,
    advance: (ms) => { nowRef.value += ms; },
    fireDoc: (evt) => (docListeners.get(evt) || []).forEach((l) => l.handler({ type: evt })),
    fireWin: (evt, payload) => (winListeners.get(evt) || []).forEach((l) => l.handler(payload || { type: evt }))
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

async function runBattery1Rollover() {
  console.log('Battery 1: Cross-Midnight & Cross-Hour Active Interval Partitioning');
  const d1Start = new Date(2026, 10, 24, 23, 59, 35, 0).getTime();
  const d2End = new Date(2026, 10, 25, 0, 0, 25, 0).getTime();
  const crossMidnightSlices = TR.splitIntervalAcrossHourAndDateBuckets(d1Start, d2End, TR.formatLocalDateKey);
  assert.strictEqual(crossMidnightSlices.length, 2);
  assert.deepStrictEqual({ d: crossMidnightSlices[0].dateKey, h: crossMidnightSlices[0].hour, s: crossMidnightSlices[0].seconds }, { d: '2026-11-24', h: 23, s: 25 });
  assert.deepStrictEqual({ d: crossMidnightSlices[1].dateKey, h: crossMidnightSlices[1].hour, s: crossMidnightSlices[1].seconds }, { d: '2026-11-25', h: 0, s: 25 });

  const h1Start = new Date(2026, 10, 24, 14, 59, 40, 0).getTime();
  const h2End = new Date(2026, 10, 24, 15, 0, 20, 0).getTime();
  const crossHourSlices = TR.splitIntervalAcrossHourAndDateBuckets(h1Start, h2End);
  assert.strictEqual(crossHourSlices.length, 2);
  assert.strictEqual(crossHourSlices[0].hour, 14);
  assert.strictEqual(crossHourSlices[0].seconds, 20);
  assert.strictEqual(crossHourSlices[1].hour, 15);
  assert.strictEqual(crossHourSlices[1].seconds, 20);

  const actDirect = { domains: {} };
  TR.creditDomainTime(actDirect, 'github.com', 50, d2End, { getLocalDateStr: TR.formatLocalDateKey });
  const dom = actDirect.domains['github.com'];
  assert.strictEqual(dom.totalSeconds, 50);
  assert.strictEqual(dom.days['2026-11-24'].hourlyBuckets[23].activeSeconds, 25);
  assert.strictEqual(dom.days['2026-11-25'].hourlyBuckets[0].activeSeconds, 25);

  const env = await createBgEnv(d1Start);
  env.sandbox.setActiveTabId(101);
  env.sandbox.switchActiveDomain('docs.google.com', true);
  await flushTicks();
  env.advance(50400);
  env.sandbox.commitActiveInterval();
  const gdocs = env.sandbox.getActivityData().domains['docs.google.com'];
  assert.strictEqual(gdocs.totalSeconds, 50);
  assert.strictEqual(gdocs.foregroundSeconds, 50);
  assert.strictEqual(gdocs.days['2026-11-24'].seconds, 25);
  assert.strictEqual(gdocs.days['2026-11-24'].hourlyBuckets[23].activeSeconds, 25);
  assert.strictEqual(gdocs.days['2026-11-25'].seconds, 25);
  assert.strictEqual(gdocs.days['2026-11-25'].hourlyBuckets[0].activeSeconds, 25);
  console.log('  ✅ Cross-midnight, cross-hour & background.js commitActiveInterval partitioning verified\n');
}

async function runBattery2ActiveReconciliation() {
  console.log('Battery 2: Active Continuity (60s-240s), Pre-Blur Cross-Midnight & Active Interaction Refresh');
  const baseMs = new Date(2026, 10, 24, 15, 0, 0, 0).getTime();
  const sessStorage = makeMockStorage();
  sessStorage.data.sentinel_active_session = {
    domain: 'docs.google.com', startTime: baseMs, lastHeartbeat: baseMs, lastCommittedTime: baseMs,
    isBrowserFocused: true, isUserActive: true
  };
  const act = { domains: {} };
  const ctx = {
    browserAPI: { storage: { session: sessStorage } }, activityData: act,
    matchesTrackingBlacklist: () => false, isBrowserFocused: true, isUserActive: true, isTrackingPaused: false
  };
  const rec240 = await TR.reconcileSessionDelta(ctx, baseMs + 240000);
  assert.strictEqual(rec240.creditedSeconds, 240, 'Active 240s wakeup must NOT collapse to 15s');
  assert.strictEqual(rec240.isSleepGap, false);

  const hbAct = { domains: {} };
  const hbStorage = makeMockStorage();
  hbStorage.data.sentinel_active_session = {
    domain: 'notion.so', tabId: 202, startTime: baseMs, lastHeartbeat: baseMs, lastCommittedTime: baseMs,
    isBrowserFocused: true, isUserActive: true, isTrackingPaused: false
  };
  const hbCtx = {
    browserAPI: { storage: { session: hbStorage } }, activityData: hbAct, getActiveTabId: () => 202,
    matchesTrackingBlacklist: () => false, isBrowserFocused: true, isUserActive: true, isTrackingPaused: false
  };
  await TR.processKeepaliveHeartbeat({ type: 'KEEPALIVE_HEARTBEAT', domain: 'notion.so', timestamp: baseMs + 180000 }, {}, 202, hbCtx);
  assert.strictEqual(hbAct.domains['notion.so'].foregroundSeconds, 180);

  const blurWakeEnv = await createBgEnv(new Date(2026, 10, 25, 0, 5, 0, 0).getTime());
  const d1_23_59_35 = new Date(2026, 10, 24, 23, 59, 35, 0).getTime();
  const d1_23_59_55 = new Date(2026, 10, 24, 23, 59, 55, 0).getTime();
  blurWakeEnv.sandbox.setIsBrowserFocused(false);
  blurWakeEnv.mock.session.data.sentinel_active_session = {
    domain: 'github.com', tabId: 303, startTime: d1_23_59_35, lastHeartbeat: d1_23_59_35,
    lastCommittedTime: d1_23_59_35, isBrowserFocused: false, isUserActive: true, focusLostAt: d1_23_59_55
  };
  await blurWakeEnv.dispatchMsg({ type: 'GET_DASHBOARD_DATA' });
  assert.strictEqual(blurWakeEnv.sandbox.getActivityData().domains['github.com'].days['2026-11-24'].hourlyBuckets[23].activeSeconds, 20);
  assert.strictEqual(blurWakeEnv.sandbox.getActivityData().domains['github.com'].days['2026-11-25'], undefined);

  const interactEnv = await createBgEnv(baseMs);
  interactEnv.sandbox.setActiveTabId(101);
  interactEnv.sandbox.switchActiveDomain('docs.google.com', true);
  await flushTicks();
  interactEnv.advance(600);
  await interactEnv.dispatchMsg({ type: 'PAGE_USER_INTERACTION', payload: { domain: 'docs.google.com', timestamp: interactEnv.getNow() } });
  const cpAfterInteract = interactEnv.mock.session.data.sentinel_active_session;
  assert.strictEqual(cpAfterInteract.lastHeartbeat, baseMs + 600, 'Already-active interaction must refresh lastHeartbeat');
  assert.strictEqual(cpAfterInteract.lastCommittedTime, baseMs, 'Sub-second tick preserves lastCommittedTime anchor');
  interactEnv.advance(10400);
  await interactEnv.dispatchMsg({ type: 'PAGE_USER_INTERACTION', payload: { domain: 'docs.google.com', timestamp: interactEnv.getNow() } });
  assert.strictEqual(interactEnv.sandbox.getActivityData().domains['docs.google.com'].foregroundSeconds, 11);
  console.log('  ✅ 240s active recovery, 180s heartbeat, pre-blur attribution & active interaction refresh verified\n');
}

function runBattery3GDocsCaptureAndBridge() {
  console.log('Battery 3: manifest.json match_about_blank, Document+Window Capture & Subframe Bridge');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const contentScriptEntry = manifest.content_scripts.find((c) => Array.isArray(c.js) && c.js.includes('content_media.js'));
  assert.ok(contentScriptEntry, 'content_media.js entry must exist in manifest.json');
  assert.strictEqual(contentScriptEntry.match_about_blank, true, 'content_media.js entry must set match_about_blank: true');

  const subEnv = createContentFrameEnv({ startMs: 1732400000000, isTop: false, hostname: '', href: 'about:blank' });
  assert.strictEqual(subEnv.ctx.getKeepalivePort(), null, 'Subframe must NOT open keepalive port');
  const reqEvents = ['pointermove', 'mousemove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'input', 'compositionstart', 'keyup', 'mousedown', 'scroll', 'focusin'];
  const registered = subEnv.ctx.getUserActivityListeners();
  assert.strictEqual(registered.length, 24);
  for (const evt of reqEvents) {
    assert.ok(registered.some((l) => l.target === subEnv.sandbox.window && l.event === evt && l.options.capture && l.options.passive));
    assert.ok(registered.some((l) => l.target === subEnv.sandbox.document && l.event === evt && l.options.capture && l.options.passive));
  }
  subEnv.advance(600);
  subEnv.fireDoc('input');
  assert.strictEqual(subEnv.ctx.getLastActivityTimestamp(), 1732400000600);
  assert.ok(subEnv.parentPosts.some((p) => p.target === 'parent' && p.msg.type === 'SENTINEL_SUBFRAME_ACTIVITY'));
  assert.ok(subEnv.sentIpc.some((m) => m.type === 'PAGE_USER_INTERACTION'));
  subEnv.ctx.teardownMediaSentinel();
  assert.strictEqual(subEnv.ctx.getUserActivityListeners().length, 0);
  assert.strictEqual(subEnv.removedDoc.length, 12);

  const topEnv = createContentFrameEnv({ startMs: 1732400000000, isTop: true, hostname: 'docs.google.com', href: 'https://docs.google.com/document/d/1' });
  const initialHbCount = topEnv.postedHeartbeats.length;
  topEnv.advance(2500);
  topEnv.fireWin('message', { data: { type: 'SENTINEL_SUBFRAME_ACTIVITY', timestamp: 1732400002500 } });
  assert.strictEqual(topEnv.ctx.getLastActivityTimestamp(), 1732400002500);
  assert.strictEqual(topEnv.postedHeartbeats.length, initialHbCount + 1, 'Top frame must send KEEPALIVE_HEARTBEAT on subframe activity');
  topEnv.ctx.teardownMediaSentinel();
  assert.strictEqual(topEnv.removedWin.some((r) => r.evt === 'message'), true, 'Top-frame teardown removes message bridge listener');
  console.log('  ✅ match_about_blank, 12x2 capture listeners, subframe bridge & clean teardown verified\n');
}

async function runBattery4MediaAndRule28() {
  console.log('Battery 4: Background Media Regression & Rule 28 Static Audit');
  const env = await createBgEnv(1732400000000);
  env.sandbox.setIsBrowserFocused(false);
  env.sandbox.commitBackgroundMediaDelta('youtube.com', 45);
  const yt = env.sandbox.getActivityData().domains['youtube.com'];
  assert.strictEqual(yt.backgroundMediaSeconds, 45);
  assert.strictEqual(yt.foregroundSeconds, 0);

  for (const target of [reconcilePath, bgPath, contentPath, __filename]) {
    const raw = fs.readFileSync(target);
    assert.strictEqual(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF, true, `${path.basename(target)} must have UTF-8 BOM`);
  }
  assert.ok(reconcileCode.split('\n').length < 500, 'timestamp_reconciliation.js must stay < 500 lines');
  assert.ok(fs.readFileSync(__filename, 'utf8').split('\n').length < 500, 'Test file must stay < 500 lines');
  const fnAudit = [
    [reconcileCode, ['formatLocalDateKey', 'allocateSliceSeconds', 'splitIntervalAcrossHourAndDateBuckets', 'resolveCreditTarget', 'resolveDateFormatter', 'applyDefaultHourlySlice', 'creditDomainTime', 'resolveActiveSessionPlan', 'resolveReconciliationPlan', 'reconcileSessionDelta', 'resolveHeartbeatCommit']],
    [bgCode, ['getTodayDateString', 'recordForegroundSeconds', 'commitActiveInterval', 'refreshActiveInteractionCheckpoint', 'handlePageUserInteraction']],
    [contentCode, ['notifySubframeActivity', 'recordUserInteractionActivity', 'bindActivityTargetListeners', 'setupUserActivityListeners', 'cleanupUserActivityListeners', 'cleanupTopFrameMessageListener', 'handleSubframeActivitySignal', 'handleIframeFullscreenMessage']]
  ];
  for (const [src, names] of fnAudit) {
    for (const fn of names) {
      const lines = measureFunctionLines(src, fn);
      assert.ok(lines > 0 && lines <= 50, `${fn} (${lines} lines) must obey Rule 28 <= 50 lines`);
    }
  }
  console.log('  ✅ Background media accounting untouched & Rule 28 / UTF-8 BOM audit passed\n');
}

(async () => {
  try {
    await runBattery1Rollover();
    await runBattery2ActiveReconciliation();
    runBattery3GDocsCaptureAndBridge();
    await runBattery4MediaAndRule28();
    console.log('============================================================\nALL 4 BATTERIES PASSED CLEANLY (Exit Code: 0)\n============================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Failed:', err);
    process.exit(1);
  }
})();
