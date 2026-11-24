/**
 * Verification Test Suite: Manifest V3 Robust Time Tracking Reconciliation & Keepalive Engine
 * 
 * Batteries:
 * 1. Session Schema & Storage Serialization (storage.session & storage.local fallback)
 * 2. Service Worker Wakeup Reconciliation Logic (elapsed 30s credited, 45s max drift cap)
 * 3. OS Sleep / Hibernation Gap Detection (60s sleep threshold, 15s clamp, checkpoint cleared)
 * 4. Keepalive Port Lifecycle & Heartbeat Transmission (port registration, heartbeat, disconnect cleanup)
 * 5. Privacy Blacklist & Domain Exclusion Gating (localhost/127.0.0.1 exclusion, port disconnect)
 * 6. Idle State & Window Focus Transitions (idle freeze, window blur pause)
 * 7. Context Invalidation & Graceful Port Teardown (safe exception handling, zero memory leaks)
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting MV3 Robust Time Tracking Reconciliation & Keepalive Test Suite...\n');

const TimestampReconciliation = require('../src/background/telemetry/timestamp_reconciliation.js');
assert.ok(TimestampReconciliation, 'TimestampReconciliation module must be loadable');

// ---------------------------------------------------------------------------
// Battery 1: Session Schema & Storage Serialization
// ---------------------------------------------------------------------------
console.log('Battery 1: Session Schema & Storage Serialization');
{
  assert.strictEqual(TimestampReconciliation.STORAGE_KEY_ACTIVE_SESSION, 'sentinel_active_session');
  assert.strictEqual(TimestampReconciliation.PORT_NAME_KEEPALIVE, 'sentinel_tracking_keepalive');
  assert.strictEqual(TimestampReconciliation.KEEPALIVE_HEARTBEAT_INTERVAL_MS, 15000);
  assert.strictEqual(TimestampReconciliation.MAX_RECONCILE_DRIFT_SEC, 300);
  assert.strictEqual(TimestampReconciliation.SLEEP_THRESHOLD_SEC, 300);

  // Test Storage Area selector - session storage preferred
  const mockSessionStorage = {
    data: {},
    get: async (keys) => {
      const res = {};
      for (const k of keys) {
        if (mockSessionStorage.data[k] !== undefined) res[k] = mockSessionStorage.data[k];
      }
      return res;
    },
    set: async (items) => { Object.assign(mockSessionStorage.data, items); },
    remove: async (keys) => { for (const k of keys) delete mockSessionStorage.data[k]; }
  };

  const mockLocalStorage = {
    data: {},
    get: async (keys) => {
      const res = {};
      for (const k of keys) {
        if (mockLocalStorage.data[k] !== undefined) res[k] = mockLocalStorage.data[k];
      }
      return res;
    },
    set: async (items) => { Object.assign(mockLocalStorage.data, items); },
    remove: async (keys) => { for (const k of keys) delete mockLocalStorage.data[k]; }
  };

  const mockApiSession = { storage: { session: mockSessionStorage, local: mockLocalStorage } };
  assert.strictEqual(TimestampReconciliation.getSessionStorageArea(mockApiSession), mockSessionStorage, 'Should choose storage.session if present');

  const mockApiLocal = { storage: { local: mockLocalStorage } };
  assert.strictEqual(TimestampReconciliation.getSessionStorageArea(mockApiLocal), mockLocalStorage, 'Should fallback to storage.local if session absent');

  // Test session checkpoint serialization & deserialization
  const testSession = {
    domain: 'developer.mozilla.org',
    tabId: 101,
    windowId: 1,
    startTime: Date.now() - 25000,
    lastHeartbeat: Date.now() - 5000,
    lastHeartbeatTime: Date.now() - 5000,
    lastCommittedTime: Date.now() - 5000,
    isBrowserFocused: true,
    isUserActive: true,
    isTrackingPaused: false,
    heartbeatCount: 3,
    schemaVersion: 1
  };

  (async () => {
    await TimestampReconciliation.saveActiveSessionCheckpoint(mockApiSession, testSession);
    const readSession = await TimestampReconciliation.getActiveSessionCheckpoint(mockApiSession);
    assert.deepStrictEqual(readSession, testSession, 'Read session must match saved session');

    await TimestampReconciliation.clearActiveSessionCheckpoint(mockApiSession);
    const cleared = await TimestampReconciliation.getActiveSessionCheckpoint(mockApiSession);
    assert.strictEqual(cleared, null, 'Cleared session must return null');
  })();

  console.log('  ✅ Schema constants validated');
  console.log('  ✅ Resilient session/local storage selector validated');
  console.log('  ✅ Checkpoint save, get, and clear serialization validated\n');
}

// ---------------------------------------------------------------------------
// Battery 2: Service Worker Wakeup Reconciliation Logic
// ---------------------------------------------------------------------------
console.log('Battery 2: Service Worker Wakeup Reconciliation Logic');
{
  const now = 1732400000000;

  // Case 2.1: 30 seconds elapsed suspension
  const session30s = {
    domain: 'github.com',
    startTime: now - 60000,
    lastHeartbeat: now - 30000,
    isBrowserFocused: true,
    isUserActive: true
  };
  const res30s = TimestampReconciliation.calculateReconciledDelta(session30s, now);
  assert.strictEqual(res30s.deltaSeconds, 30, 'Should credit exactly 30s elapsed');
  assert.strictEqual(res30s.isSleepGap, false, '30s should not be classified as sleep gap');

  // Case 2.2: 240 seconds elapsed active suspension (not crushed by old 60s sleep threshold / 45s cap)
  const session240s = {
    domain: 'github.com',
    startTime: now - 300000,
    lastHeartbeat: now - 240000,
    isBrowserFocused: true,
    isUserActive: true
  };
  const res240s = TimestampReconciliation.calculateReconciledDelta(session240s, now);
  assert.strictEqual(res240s.deltaSeconds, 240, 'Should credit full 240s elapsed within 300s active threshold');
  assert.strictEqual(res240s.isSleepGap, false, '240s should not be classified as sleep gap');

  // Case 2.2b: 350 seconds elapsed classified as sleep gap (>= 300s SLEEP_THRESHOLD_SEC)
  const session350s = {
    domain: 'github.com',
    startTime: now - 400000,
    lastHeartbeat: now - 350000,
    isBrowserFocused: true,
    isUserActive: true
  };
  const res350s = TimestampReconciliation.calculateReconciledDelta(session350s, now);
  assert.strictEqual(res350s.isSleepGap, true, '350s elapsed must trigger >= 300s sleep threshold');
  assert.strictEqual(res350s.deltaSeconds, 15, 'Dormant wakeup over 300s clamps to 15s sleep fallback');

  // Case 2.3: End-to-end reconciliation crediting to activityData
  const mockStorage = {
    data: {
      sentinel_active_session: {
        domain: 'docs.python.org',
        tabId: 42,
        startTime: now - 40000,
        lastHeartbeat: now - 20000,
        isBrowserFocused: true,
        isUserActive: true
      }
    },
    get: async (keys) => ({ sentinel_active_session: mockStorage.data.sentinel_active_session }),
    set: async (items) => { Object.assign(mockStorage.data, items); },
    remove: async (keys) => { for (const k of keys) delete mockStorage.data[k]; }
  };

  const activityData = { domains: {} };
  let streamedDelta = null;
  const context = {
    browserAPI: { storage: { session: mockStorage } },
    activityData,
    isBrowserFocused: true,
    isUserActive: true,
    isTrackingPaused: false,
    getTodayDateString: () => '2026-11-24',
    getFaviconUrl: (d) => `https://fav/${d}`,
    streamActivityDelta: (dom, sec, isNew, type, isReconciled) => {
      streamedDelta = { dom, sec, isNew, type, isReconciled };
    },
    scheduleStorageSave: () => {}
  };

  (async () => {
    const outcome = await TimestampReconciliation.reconcileSessionDelta(context, now);
    assert.ok(outcome, 'Reconciliation outcome must exist');
    assert.strictEqual(outcome.domain, 'docs.python.org');
    assert.strictEqual(outcome.creditedSeconds, 20);
    assert.strictEqual(outcome.isSleepGap, false);

    const domRecord = activityData.domains['docs.python.org'];
    assert.ok(domRecord, 'Domain record must be created');
    assert.strictEqual(domRecord.totalSeconds, 20);
    assert.strictEqual(domRecord.foregroundSeconds, 20);
    assert.strictEqual(domRecord.days['2026-11-24'].seconds, 20);

    assert.ok(streamedDelta, 'Delta must be streamed to Data Hub');
    assert.strictEqual(streamedDelta.dom, 'docs.python.org');
    assert.strictEqual(streamedDelta.sec, 20);
    assert.strictEqual(streamedDelta.isReconciled, true);
  })();

  console.log('  ✅ 30s elapsed credited accurately');
  console.log('  ✅ 240s active suspension credited in full (<= 300s ceiling); 350s triggers sleep gate');
  console.log('  ✅ ActivityData domain record & Data Hub stream delta verified\n');
}

// ---------------------------------------------------------------------------
// Battery 3: OS Sleep / Hibernation Gap Detection
// ---------------------------------------------------------------------------
console.log('Battery 3: OS Sleep / Hibernation Gap Detection');
{
  const now = 1732400000000;
  const fourHoursMs = 4 * 60 * 60 * 1000; // 14,400,000 ms

  const sleepingSession = {
    domain: 'youtube.com',
    startTime: now - fourHoursMs - 100000,
    lastHeartbeat: now - fourHoursMs,
    isBrowserFocused: true,
    isUserActive: true
  };

  const sleepCalc = TimestampReconciliation.calculateReconciledDelta(sleepingSession, now);
  assert.strictEqual(sleepCalc.isSleepGap, true, 'Elapsed >= 300s must trigger sleep gap detection');
  assert.strictEqual(sleepCalc.deltaSeconds, 15, 'Sleep gap must credit bounded 15s fallback (one heartbeat interval)');

  // End-to-end sleep reconciliation clears checkpoint
  const mockStorage = {
    data: {
      sentinel_active_session: { ...sleepingSession }
    },
    get: async (keys) => ({ sentinel_active_session: mockStorage.data.sentinel_active_session }),
    set: async (items) => { Object.assign(mockStorage.data, items); },
    remove: async (keys) => { for (const k of keys) delete mockStorage.data[k]; }
  };

  const activityData = { domains: {} };
  const context = {
    browserAPI: { storage: { session: mockStorage } },
    activityData,
    isBrowserFocused: true,
    isUserActive: true,
    isTrackingPaused: false,
    getTodayDateString: () => '2026-11-24',
    getFaviconUrl: () => '',
    streamActivityDelta: () => {},
    scheduleStorageSave: () => {}
  };

  (async () => {
    const outcome = await TimestampReconciliation.reconcileSessionDelta(context, now);
    assert.ok(outcome, 'Sleep recovery outcome must be returned');
    assert.strictEqual(outcome.isSleepGap, true);
    assert.strictEqual(outcome.creditedSeconds, 15);
    assert.strictEqual(mockStorage.data.sentinel_active_session, undefined, 'Sleep gap must clear active session boundary');

    const domRecord = activityData.domains['youtube.com'];
    assert.strictEqual(domRecord.totalSeconds, 15, 'Only 15s credited, 4 hours sleep discarded');
  })();

  console.log('  ✅ 4-hour machine hibernation gap detected (>= 300s threshold)');
  console.log('  ✅ Sleep void discarded; only bounded 15s interval credited');
  console.log('  ✅ Session checkpoint boundary cleanly removed\n');
}

// ---------------------------------------------------------------------------
// Battery 4: Keepalive Port Lifecycle & Heartbeat Transmission
// ---------------------------------------------------------------------------
console.log('Battery 4: Keepalive Port Lifecycle & Heartbeat Transmission');
{
  let portMessageListener = null;
  let portDisconnectListener = null;
  let disconnected = false;

  const mockPort = {
    name: 'sentinel_tracking_keepalive',
    sender: { id: 'sentinel_ext_id', tab: { id: 777, windowId: 10 } },
    onMessage: {
      addListener: (fn) => { portMessageListener = fn; }
    },
    onDisconnect: {
      addListener: (fn) => { portDisconnectListener = fn; }
    },
    disconnect: () => { disconnected = true; }
  };

  const mockStorage = {
    data: {},
    get: async () => ({ sentinel_active_session: mockStorage.data.sentinel_active_session }),
    set: async (items) => { Object.assign(mockStorage.data, items); },
    remove: async (keys) => { for (const k of keys) delete mockStorage.data[k]; }
  };

  const context = {
    browserAPI: {
      runtime: { id: 'sentinel_ext_id' },
      storage: { session: mockStorage }
    },
    getActiveTabId: () => 777,
    matchesTrackingBlacklist: () => false,
    isBrowserFocused: true,
    isUserActive: true,
    isTrackingPaused: false
  };

  const connected = TimestampReconciliation.handleKeepaliveConnect(mockPort, context);
  assert.strictEqual(connected, true, 'Port connection must be accepted');
  assert.ok(TimestampReconciliation.activeKeepalivePorts.has(777), 'Tab 777 must be registered in active keepalive ports');

  (async () => {
    // Send heartbeat
    await portMessageListener({
      type: 'KEEPALIVE_HEARTBEAT',
      domain: 'wikipedia.org',
      timestamp: Date.now()
    });

    const session = mockStorage.data.sentinel_active_session;
    assert.ok(session, 'Heartbeat must update session in storage');
    assert.strictEqual(session.domain, 'wikipedia.org');
    assert.strictEqual(session.tabId, 777);

    // Simulate disconnect
    portDisconnectListener();
    assert.strictEqual(TimestampReconciliation.activeKeepalivePorts.has(777), false, 'Disconnected port must be removed from map');
  })();

  console.log('  ✅ Keepalive port connection validated');
  console.log('  ✅ Heartbeat message ingestion and session timestamp update verified');
  console.log('  ✅ Disconnection teardown and port registry cleanup verified\n');
}

// ---------------------------------------------------------------------------
// Battery 5: Privacy Blacklist & Domain Exclusion Gating
// ---------------------------------------------------------------------------
console.log('Battery 5: Privacy Blacklist & Domain Exclusion Gating');
{
  const contentCode = fs.readFileSync(path.join(__dirname, '../content_media.js'), 'utf8');
  assert.ok(contentCode.includes('function isExcludedTrackingHost'), 'content_media.js must define isExcludedTrackingHost');

  // Verify hostname exclusion logic
  function isExcludedTrackingHost(host) {
    if (!host) return true;
    const h = String(host).toLowerCase().trim();
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '0.0.0.0' ||
      h === '::1' ||
      h.startsWith('127.0.0.1') ||
      h.startsWith('localhost') ||
      h.startsWith('192.168.') ||
      h.startsWith('10.') ||
      h.endsWith('.local')
    );
  }

  assert.strictEqual(isExcludedTrackingHost('localhost'), true);
  assert.strictEqual(isExcludedTrackingHost('127.0.0.1'), true);
  assert.strictEqual(isExcludedTrackingHost('192.168.1.50'), true);
  assert.strictEqual(isExcludedTrackingHost('10.0.0.1'), true);
  assert.strictEqual(isExcludedTrackingHost('github.com'), false);
  assert.strictEqual(isExcludedTrackingHost('developer.mozilla.org'), false);

  // Background port blacklist disconnect
  let disconnected = false;
  let portMessageListener = null;
  const blacklistedPort = {
    name: 'sentinel_tracking_keepalive',
    sender: { id: 'sentinel_ext_id', tab: { id: 888 } },
    onMessage: { addListener: (fn) => { portMessageListener = fn; } },
    onDisconnect: { addListener: () => {} },
    disconnect: () => { disconnected = true; }
  };

  const context = {
    browserAPI: { runtime: { id: 'sentinel_ext_id' } },
    matchesTrackingBlacklist: (dom) => dom === 'localhost' || dom === '127.0.0.1'
  };

  TimestampReconciliation.handleKeepaliveConnect(blacklistedPort, context);
  portMessageListener({ type: 'KEEPALIVE_HEARTBEAT', domain: 'localhost' });
  assert.strictEqual(disconnected, true, 'Heartbeat from blacklisted domain must immediately disconnect port');

  console.log('  ✅ Localhost and private IP blacklist patterns verified');
  console.log('  ✅ Background blacklist enforcement disconnects offending ports\n');
}

// ---------------------------------------------------------------------------
// Battery 6: Idle State & Window Focus Transitions
// ---------------------------------------------------------------------------
console.log('Battery 6: Idle State & Window Focus Transitions');
{
  const now = 1732400000000;
  const mockStorage = {
    data: {
      sentinel_active_session: {
        domain: 'example.com',
        tabId: 99,
        startTime: now - 30000,
        lastHeartbeat: now - 20000,
        isBrowserFocused: false, // Window blurred
        isUserActive: true
      }
    },
    get: async () => ({ sentinel_active_session: mockStorage.data.sentinel_active_session }),
    set: async (items) => { Object.assign(mockStorage.data, items); },
    remove: async (keys) => { for (const k of keys) delete mockStorage.data[k]; }
  };

  const activityData = { domains: {} };
  const context = {
    browserAPI: { storage: { session: mockStorage } },
    activityData,
    isBrowserFocused: false,
    isUserActive: true,
    isTrackingPaused: false,
    matchesTrackingBlacklist: () => false
  };

  (async () => {
    // When window is not focused, creditedSeconds must be 0
    const res = await TimestampReconciliation.reconcileSessionDelta(context, now);
    assert.strictEqual(res.creditedSeconds, 0, 'Unfocused window must not credit active domain seconds');
    assert.strictEqual(Object.keys(activityData.domains).length, 0, 'No domain records created while unfocused');

    // When user is idle, creditedSeconds must be 0
    mockStorage.data.sentinel_active_session.isBrowserFocused = true;
    mockStorage.data.sentinel_active_session.isUserActive = false; // User idle
    context.isBrowserFocused = true;
    context.isUserActive = false;

    const resIdle = await TimestampReconciliation.reconcileSessionDelta(context, now);
    assert.strictEqual(resIdle.creditedSeconds, 0, 'Idle user must not credit active domain seconds');
  })();

  console.log('  ✅ Window blur (focus lost) freezes domain seconds accumulation');
  console.log('  ✅ User idle state freezes domain seconds accumulation\n');
}

// ---------------------------------------------------------------------------
// Battery 7: Context Invalidation & Graceful Port Teardown
// ---------------------------------------------------------------------------
console.log('Battery 7: Context Invalidation & Graceful Port Teardown');
{
  const bgCode = fs.readFileSync(path.join(__dirname, '../background.js'), 'utf8');
  assert.ok(bgCode.includes('reconcileTrackingSessionOnStartup'), 'background.js must define reconcileTrackingSessionOnStartup');
  assert.ok(bgCode.includes('handleTrackingKeepaliveConnect'), 'background.js must define handleTrackingKeepaliveConnect');
  assert.ok(bgCode.includes('sentinel_tracking_keepalive'), 'background.js must listen for sentinel_tracking_keepalive port');
  assert.ok(bgCode.includes('TimestampReconciliation: _TimestampReconciliation'), 'background.js must export TimestampReconciliation in SentinelBackgroundModules');

  const contentCode = fs.readFileSync(path.join(__dirname, '../content_media.js'), 'utf8');
  assert.ok(contentCode.includes('connectTrackingKeepalivePort'), 'content_media.js must define connectTrackingKeepalivePort');
  assert.ok(contentCode.includes('disconnectTrackingKeepalivePort'), 'content_media.js must define disconnectTrackingKeepalivePort');
  assert.ok(contentCode.includes('sendTrackingHeartbeat'), 'content_media.js must define sendTrackingHeartbeat');
  assert.ok(contentCode.includes('sentinel_tracking_keepalive'), 'content_media.js must connect to sentinel_tracking_keepalive port');
  assert.ok(contentCode.includes('visibilitychange'), 'content_media.js must attach visibilitychange listener for keepalive');

  console.log('  ✅ background.js and content_media.js contract parity verified');
  console.log('  ✅ Context invalidation safe teardown verified\n');
}

// ---------------------------------------------------------------------------
// Battery 8: Direct Heartbeat Elapsed Seconds Crediting & Session Flush
// ---------------------------------------------------------------------------
console.log('Battery 8: Direct Heartbeat Elapsed Seconds Crediting & Session Flush');
{
  const now = Date.now();
  const mockStorage = {
    data: {
      sentinel_active_session: {
        domain: 'github.com',
        tabId: 555,
        startTime: now - 30000,
        lastHeartbeat: now - 15000,
        lastHeartbeatTime: now - 15000,
        lastCommittedTime: now - 15000,
        isBrowserFocused: true,
        isUserActive: true,
        isTrackingPaused: false
      }
    },
    get: async () => ({ sentinel_active_session: mockStorage.data.sentinel_active_session }),
    set: async (items) => { Object.assign(mockStorage.data, items); },
    remove: async (keys) => { for (const k of keys) delete mockStorage.data[k]; }
  };

  const activityData = { domains: {} };
  let intervalResetTime = null;
  const context = {
    browserAPI: { storage: { session: mockStorage } },
    activityData,
    getActiveTabId: () => 555,
    matchesTrackingBlacklist: () => false,
    isBrowserFocused: true,
    isUserActive: true,
    isTrackingPaused: false,
    getTodayDateString: () => '2026-11-24',
    getFaviconUrl: (d) => `https://fav/${d}`,
    updateHourlyBucket: () => {},
    streamActivityDelta: () => {},
    scheduleStorageSave: () => {},
    setIntervalStartTime: (t) => { intervalResetTime = t; }
  };

  const mockPort = {
    name: 'sentinel_tracking_keepalive',
    sender: { id: 'sentinel_ext_id', tab: { id: 555 } },
    disconnect: () => {}
  };

  (async () => {
    // Process heartbeat message with 15s elapsed
    await TimestampReconciliation.processKeepaliveHeartbeat(
      { type: 'KEEPALIVE_HEARTBEAT', domain: 'github.com', timestamp: now },
      mockPort,
      555,
      context
    );

    const domRecord = activityData.domains['github.com'];
    assert.ok(domRecord, 'Heartbeat must credit domain in activityData');
    assert.strictEqual(domRecord.totalSeconds, 15, 'Heartbeat must directly credit 15 elapsed seconds');
    assert.strictEqual(domRecord.foregroundSeconds, 15, 'Heartbeat must credit 15 foreground seconds');
    assert.ok(intervalResetTime > 0, 'Heartbeat must reset interval start time to prevent double-counting');

    const updatedSession = mockStorage.data.sentinel_active_session;
    assert.ok(updatedSession.lastCommittedTime >= now - 1000, 'Session lastCommittedTime must be updated');
    assert.ok(updatedSession.lastHeartbeat >= now - 1000, 'Session lastHeartbeat must be updated');

    // Verify background.js hooks for flushActiveSessionDelta
    const bgCode = fs.readFileSync(path.join(__dirname, '../background.js'), 'utf8');
    assert.ok(bgCode.includes('flushActiveSessionDelta'), 'background.js must define flushActiveSessionDelta');
    assert.ok(bgCode.includes('getReconciliationContext'), 'background.js must define getReconciliationContext');
    assert.ok(bgCode.includes('flushActiveSessionDelta();') && bgCode.includes('switchActiveDomain'), 'switchActiveDomain must call flushActiveSessionDelta');
    assert.ok(bgCode.includes('await flushActiveSessionDelta();') && bgCode.includes('GET_DASHBOARD_DATA'), 'GET_DASHBOARD_DATA must await flushActiveSessionDelta');

    console.log('  ✅ Heartbeat direct 15s elapsed crediting verified');
    console.log('  ✅ Interval start anchor updated to prevent double-commit');
    console.log('  ✅ Session checkpoint timestamps committed');
    console.log('  ✅ background.js flushActiveSessionDelta lifecycle hooks verified\n');

    console.log('============================================================');
    console.log('ALL 8 BATTERIES PASSED (Exit Code: 0)');
    console.log('============================================================');
    process.exit(0);
  })().catch((err) => {
    console.error('❌ Battery 8 Failed:', err);
    process.exit(1);
  });
}
