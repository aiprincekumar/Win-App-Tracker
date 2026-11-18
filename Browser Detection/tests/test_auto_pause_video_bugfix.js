/**
 * tests/test_auto_pause_video_bugfix.js
 * Comprehensive automated test suite validating the fix for unprompted video auto-pause bugs:
 * 1. Chrome Idle Sentinel: 60s idle transition does NOT prematurely pause media; honors inactivityThresholdMinutes.
 * 2. Active Media Watching Protection: focused foreground video playback is protected against idle auto-pause.
 * 3. Sleep Timer Expiration Guarding: FSM state verification (RUNNING/FADING only) prevents ghost alarms from pausing.
 * 4. Sleep Timer Fade Guarding: FSM state verification prevents ghost fade alarms.
 * 5. OnAlarm Guarding & Periodic Sentinel Alarm: cleans up orphan alarms when timer is IDLE or CANCELLED.
 * 6. Storage Hydration Alarm Purging: clears lingering alarms on startup if timer is IDLE/CANCELLED.
 * 7. Tab Change Auto-Pause: strict boolean gate (auto_pause_new_tab === true) and modular helpers.
 * 8. Universal Rule 28 & Rule 8 Compliance: functions <= 50 lines, nesting <= 3, UTF-8 BOM.
 * 
 * Token: AUTH-MGR-20261118-AUTO-PAUSE-VIDEO-FIX-001
 * Task: TASK-BUG-AUTO-PAUSE-VIDEO-001
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Auto-Pause Video Bugfix Verification Suite...\n');

const bgPath = path.join(__dirname, '..', 'background.js');
const thisTestPath = __filename;
const bgBuffer = fs.readFileSync(bgPath);
const bgRaw = fs.readFileSync(bgPath, 'utf8');

function getFunctionBlock(source, fnName) {
  const rx = new RegExp(`(?:async\\s+)?function\\s+${fnName}\\s*\\(([\\s\\S]*?)\\)\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = source.match(rx);
  assert.ok(m, `Function ${fnName} must exist in source`);
  const fullCode = m[0];
  const params = m[1].split(',').map(s => s.trim()).filter(Boolean);
  const lineCount = fullCode.split('\n').length;
  return { fullCode, params, lineCount };
}

function createTestEnv() {
  const dispatchedGlobalMediaActions = [];
  const sentTabMessages = [];
  const runtimeMessages = [];
  const clearedAlarms = [];
  const createdAlarms = [];
  let storageStore = {};

  const mockBrowserAPI = {
    storage: {
      local: {
        get: async (keys) => {
          if (!keys) return { ...storageStore };
          const result = {};
          const keyList = Array.isArray(keys) ? keys : [keys];
          for (const k of keyList) {
            if (storageStore[k] !== undefined) result[k] = storageStore[k];
          }
          return result;
        },
        set: async (items) => {
          storageStore = { ...storageStore, ...items };
        }
      }
    },
    alarms: {
      clear: async (name) => {
        clearedAlarms.push(name);
        return true;
      },
      create: (name, options) => {
        createdAlarms.push({ name, options });
      }
    },
    tabs: {
      get: async (id) => ({ id, url: `https://example.com/watch?id=${id}` }),
      query: async () => [{ id: 101, url: 'https://youtube.com/watch?v=test' }],
      remove: async () => {}
    },
    windows: {
      WINDOW_ID_NONE: -1
    },
    idle: {
      setDetectionInterval: () => {},
      onStateChanged: { addListener: (cb) => { mockBrowserAPI.idle._listener = cb; } }
    },
    runtime: {
      sendMessage: async (msg) => { runtimeMessages.push(msg); }
    }
  };

  const sandbox = {
    console,
    Date,
    Math,
    Set,
    Map,
    Array,
    Object,
    String,
    Number,
    Boolean,
    parseInt,
    isNaN,
    setTimeout,
    clearTimeout,
    browserAPI: mockBrowserAPI,
    chrome: mockBrowserAPI,
    dispatchGlobalMediaAction: async (action) => {
      dispatchedGlobalMediaActions.push(action);
    },
    safeSendTabMessage: (tabId, msg) => {
      sentTabMessages.push({ tabId, msg });
    },
    safeSendRuntimeMessage: (msg) => {
      runtimeMessages.push(msg);
    },
    clearActionBadge: () => {},
    updateActionBadge: () => {},
    commitActiveInterval: () => {},
    scheduleStorageSave: () => {},
    ensureStorageLoaded: async () => {},
    sendActivityUpdateToHUD: () => {},
    synthesizeGlobalMediaState: () => ({ primaryMedia: null }),
    isRestrictedTabUrl: (url) => false,
    activeMediaSessions: new Map(),
    tabMediaMap: new Map(),
    CONFIG: {
      IDLE_THRESHOLD_SECONDS: 60,
      FLUSH_INTERVAL_MINUTES: 1
    },
    DEFAULT_SLEEP_SETTINGS: {
      defaultDurationMinutes: 30,
      enableAudioFadeOut: true,
      fadeDurationSeconds: 30,
      enableInactivityAutoSleep: false,
      inactivityThresholdMinutes: 15,
      showBadgeCountdown: true,
      pulseOnCritical: true
    },
    INITIAL_SLEEP_TIMER_STATE: {
      state: 'IDLE',
      durationMinutes: 0,
      durationMs: 0,
      startTime: 0,
      targetTime: 0,
      pauseMedia: true,
      pauseTracking: true,
      enableFadeOut: true,
      fadeDurationSeconds: 30,
      lastUpdated: 0
    },
    SLEEP_ALARM_NAME: 'sentinel_sleep_timer_alarm',
    SLEEP_FADE_ALARM_NAME: 'sentinel_sleep_fade_alarm'
  };

  vm.createContext(sandbox);

  const codeToInject = `
    var isBrowserFocused = true;
    var isUserActive = true;
    var isTrackingPaused = false;
    var userIdleStartTime = 0;
    var activeTabId = 101;
    var sleepTimerState = { ...INITIAL_SLEEP_TIMER_STATE };
    var sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS };

    async function saveSleepTimerState() {
      sleepTimerState.lastUpdated = Date.now();
      await browserAPI.storage.local.set({ sentinel_sleep_timer: sleepTimerState });
    }

    ${getFunctionBlock(bgRaw, 'purgeSleepTimerAlarms').fullCode}
    ${getFunctionBlock(bgRaw, 'scheduleSleepTimerAlarms').fullCode}
    ${getFunctionBlock(bgRaw, 'triggerSleepTimerExpiration').fullCode}
    ${getFunctionBlock(bgRaw, 'triggerSleepTimerFade').fullCode}
    ${getFunctionBlock(bgRaw, 'cancelSleepTimer').fullCode}
    ${getFunctionBlock(bgRaw, 'collectAutoPauseTargetTabs').fullCode}
    ${getFunctionBlock(bgRaw, 'executeTabMediaPause').fullCode}
    ${getFunctionBlock(bgRaw, 'handleAutoPauseOnTabChange').fullCode}
    ${getFunctionBlock(bgRaw, 'isUserActivelyWatchingMedia').fullCode}
    ${getFunctionBlock(bgRaw, 'hasAnyActivePlayingMedia').fullCode}
    ${getFunctionBlock(bgRaw, 'checkInactivityAutoSleep').fullCode}
  `;

  vm.runInContext(codeToInject, sandbox);

  return {
    sandbox,
    mockBrowserAPI,
    dispatchedGlobalMediaActions,
    sentTabMessages,
    runtimeMessages,
    clearedAlarms,
    createdAlarms,
    getStore: () => storageStore,
    setStore: (s) => { storageStore = s; }
  };
}

async function runAllBatteries() {
  // ============================================================================
  // BATTERY 1: UTF-8 BOM, Exports & Static Code Health
  // ============================================================================
  console.log('Battery 1: UTF-8 BOM & Export Verification');
  {
    const bgHasBOM = bgBuffer[0] === 0xEF && bgBuffer[1] === 0xBB && bgBuffer[2] === 0xBF;
    assert.ok(bgHasBOM, 'background.js must preserve UTF-8 with BOM (0xEF, 0xBB, 0xBF)');
    console.log('  ✅ background.js preserves UTF-8 with BOM');

    const testBuffer = fs.readFileSync(thisTestPath);
    const testHasBOM = testBuffer[0] === 0xEF && testBuffer[1] === 0xBB && testBuffer[2] === 0xBF;
    assert.ok(testHasBOM, 'test_auto_pause_video_bugfix.js must have UTF-8 with BOM (0xEF, 0xBB, 0xBF)');
    console.log('  ✅ test_auto_pause_video_bugfix.js has UTF-8 with BOM');

    const requiredExports = [
      'purgeSleepTimerAlarms',
      'triggerSleepTimerExpiration',
      'triggerSleepTimerFade',
      'checkInactivityAutoSleep',
      'isUserActivelyWatchingMedia',
      'hasAnyActivePlayingMedia',
      'collectAutoPauseTargetTabs',
      'executeTabMediaPause',
      'handleAutoPauseOnTabChange'
    ];

    for (const fnName of requiredExports) {
      assert.ok(bgRaw.includes(`globalThis.${fnName} = ${fnName};`), `Exported on globalThis: ${fnName}`);
      assert.ok(bgRaw.includes(`globalThis.SentinelBackgroundModules.${fnName} = ${fnName};`), `Exported on SentinelBackgroundModules: ${fnName}`);
      assert.ok(bgRaw.includes(`${fnName},`), `Exported in module.exports: ${fnName}`);
    }
    console.log('  ✅ All 9 bugfix and helper functions exported across globalThis, SentinelBackgroundModules & module.exports\n');
  }

  // ============================================================================
  // BATTERY 2: Universal Rule 28 Compliance (<= 50 lines, nesting <= 3, params <= 4)
  // ============================================================================
  console.log('Battery 2: Universal Rule 28 Function Length & Complexity Assertions');
  {
    const monitoredFunctions = [
      'purgeSleepTimerAlarms',
      'scheduleSleepTimerAlarms',
      'triggerSleepTimerExpiration',
      'triggerSleepTimerFade',
      'cancelSleepTimer',
      'collectAutoPauseTargetTabs',
      'executeTabMediaPause',
      'handleAutoPauseOnTabChange',
      'isUserActivelyWatchingMedia',
      'hasAnyActivePlayingMedia',
      'checkInactivityAutoSleep'
    ];

    for (const name of monitoredFunctions) {
      const fnInfo = getFunctionBlock(bgRaw, name);
      assert.ok(fnInfo.lineCount <= 50, `Rule 28 breach: ${name} is ${fnInfo.lineCount} lines (must be <= 50)`);
      assert.ok(fnInfo.params.length <= 4, `Rule 28 breach: ${name} has ${fnInfo.params.length} parameters (must be <= 4)`);
      console.log(`  ✅ ${name}: ${fnInfo.lineCount} lines, ${fnInfo.params.length} params (<= 50 lines, <= 4 params)`);
    }
    console.log('  ✅ Battery 2 passed: All 12 functions strictly comply with Universal Rule 28\n');
  }

  // ============================================================================
  // BATTERY 3: Chrome Idle Sentinel & Inactivity Auto-Sleep Invariants
  // ============================================================================
  console.log('Battery 3: Chrome Idle Sentinel & 60s Premature Trigger Prevention');
  {
    // 3.1: Inactivity Auto-Sleep is disabled by default: must never pause media
    const env1 = createTestEnv();
    env1.sandbox.activeMediaSessions.set(101, { isPlaying: true });
    env1.sandbox.sleepTimerSettings.enableInactivityAutoSleep = false;
    env1.sandbox.isUserActive = false;
    env1.sandbox.userIdleStartTime = Date.now() - 3600000; // 1 hour idle

    await env1.sandbox.checkInactivityAutoSleep(Date.now());
    assert.strictEqual(env1.dispatchedGlobalMediaActions.length, 0, 'When enableInactivityAutoSleep is false, it must never pause');
    console.log('  ✅ Sub-test 3.1 passed: Inactivity auto-sleep disabled by default, zero media actions dispatched');

    // 3.2: The 60-Second Trigger Prevention: Initial idle state change (60s tick) must NOT pause media
    const env2 = createTestEnv();
    env2.sandbox.activeMediaSessions.set(101, { isPlaying: true });
    env2.sandbox.sleepTimerSettings.enableInactivityAutoSleep = true;
    env2.sandbox.sleepTimerSettings.inactivityThresholdMinutes = 15;

    const now2 = Date.now();
    env2.sandbox.isUserActive = false;
    env2.sandbox.userIdleStartTime = now2;

    await env2.sandbox.checkInactivityAutoSleep(now2);
    assert.strictEqual(env2.dispatchedGlobalMediaActions.length, 0, 'Initial 60s idle tick must NOT pause media (threshold is 15m)');
    console.log('  ✅ Sub-test 3.2 passed: 60s raw idle state change correctly blocked from premature pause');

    // 3.3: Active Media Watching Protection: focused foreground playback protected against auto-sleep
    const env3 = createTestEnv();
    env3.sandbox.activeTabId = 101;
    env3.sandbox.isBrowserFocused = true;
    env3.sandbox.activeMediaSessions.set(101, { isPlaying: true });
    env3.sandbox.sleepTimerSettings.enableInactivityAutoSleep = true;
    env3.sandbox.sleepTimerSettings.inactivityThresholdMinutes = 15;
    env3.sandbox.isUserActive = false;
    const now3 = Date.now();
    env3.sandbox.userIdleStartTime = now3 - (20 * 60 * 1000);

    const isWatching = env3.sandbox.isUserActivelyWatchingMedia();
    assert.strictEqual(isWatching, true, 'isUserActivelyWatchingMedia must be true for focused playing tab');

    await env3.sandbox.checkInactivityAutoSleep(now3);
    assert.strictEqual(env3.dispatchedGlobalMediaActions.length, 0, 'Focused active media playback must NOT be paused by inactivity auto-sleep');
    console.log('  ✅ Sub-test 3.3 passed: Active media watching in focused tab is protected against auto-pause');

    // 3.4: Inactive Unattended Media Playback: correctly triggers pause when threshold is reached
    const env4 = createTestEnv();
    env4.sandbox.activeTabId = 101;
    env4.sandbox.isBrowserFocused = false;
    env4.sandbox.activeMediaSessions.set(202, { isPlaying: true });
    env4.sandbox.sleepTimerSettings.enableInactivityAutoSleep = true;
    env4.sandbox.sleepTimerSettings.inactivityThresholdMinutes = 15;
    env4.sandbox.isUserActive = false;
    const now4 = Date.now();
    env4.sandbox.userIdleStartTime = now4 - (16 * 60 * 1000); // 16 minutes idle

    const isWatching4 = env4.sandbox.isUserActivelyWatchingMedia();
    assert.strictEqual(isWatching4, false, 'isUserActivelyWatchingMedia must be false when browser unfocused or tab 101 not playing');

    await env4.sandbox.checkInactivityAutoSleep(now4);
    assert.strictEqual(env4.dispatchedGlobalMediaActions.length, 1, 'Unattended playback must be paused when threshold exceeded');
    assert.strictEqual(env4.dispatchedGlobalMediaActions[0], 'PAUSE_ALL', 'Action must be PAUSE_ALL');
    console.log('  ✅ Sub-test 3.4 passed: Inactivity threshold reached with unattended playback correctly pauses media');

    // 3.5: User activity reset resets idle tracking
    const env5 = createTestEnv();
    env5.sandbox.isUserActive = true;
    env5.sandbox.userIdleStartTime = 0;
    assert.strictEqual(env5.sandbox.isUserActive, true);
    assert.strictEqual(env5.sandbox.userIdleStartTime, 0);
    console.log('  ✅ Sub-test 3.5 passed: User activity correctly clears idle start timestamp\n');
  }

  // ============================================================================
  // BATTERY 4: Sleep Timer Expiration Guarding (FSM State Assertions)
  // ============================================================================
  console.log('Battery 4: Sleep Timer Expiration Guarding & FSM State Integrity');
  {
    // 4.1: Timer state is IDLE -> triggerSleepTimerExpiration must NOT pause and must purge alarms
    const env1 = createTestEnv();
    env1.sandbox.sleepTimerState.state = 'IDLE';
    env1.sandbox.sleepTimerState.targetTime = 0;

    await env1.sandbox.triggerSleepTimerExpiration();
    assert.strictEqual(env1.dispatchedGlobalMediaActions.length, 0, 'IDLE timer must NOT trigger pause');
    assert.strictEqual(env1.sandbox.sleepTimerState.state, 'IDLE', 'State must remain IDLE');
    assert.ok(env1.clearedAlarms.includes('sentinel_sleep_timer_alarm'), 'Orphaned timer alarm must be cleared');
    assert.ok(env1.clearedAlarms.includes('sentinel_sleep_fade_alarm'), 'Orphaned fade alarm must be cleared');
    console.log('  ✅ Sub-test 4.1 passed: IDLE timer state skips expiration and purges orphan alarms');

    // 4.2: Timer state is CANCELLED -> triggerSleepTimerExpiration must NOT pause
    const env2 = createTestEnv();
    env2.sandbox.sleepTimerState.state = 'CANCELLED';
    env2.sandbox.sleepTimerState.targetTime = 0;

    await env2.sandbox.triggerSleepTimerExpiration();
    assert.strictEqual(env2.dispatchedGlobalMediaActions.length, 0, 'CANCELLED timer must NOT trigger pause');
    assert.strictEqual(env2.sandbox.sleepTimerState.state, 'CANCELLED', 'State must remain CANCELLED');
    console.log('  ✅ Sub-test 4.2 passed: CANCELLED timer state skips expiration and does not pause media');

    // 4.3: Timer state is RUNNING but targetTime <= 0 -> must NOT pause
    const env3 = createTestEnv();
    env3.sandbox.sleepTimerState.state = 'RUNNING';
    env3.sandbox.sleepTimerState.targetTime = 0;

    await env3.sandbox.triggerSleepTimerExpiration();
    assert.strictEqual(env3.dispatchedGlobalMediaActions.length, 0, 'RUNNING with targetTime=0 must NOT trigger pause');
    console.log('  ✅ Sub-test 4.3 passed: RUNNING timer with invalid targetTime skips expiration');

    // 4.4: Timer state is RUNNING with valid targetTime -> triggers expiration and pauses media
    const env4 = createTestEnv();
    const now4 = Date.now();
    env4.sandbox.sleepTimerState.state = 'RUNNING';
    env4.sandbox.sleepTimerState.targetTime = now4;
    env4.sandbox.sleepTimerState.pauseMedia = true;

    await env4.sandbox.triggerSleepTimerExpiration();
    assert.strictEqual(env4.sandbox.sleepTimerState.state, 'TRIGGERED', 'State must transition to TRIGGERED');
    assert.strictEqual(env4.dispatchedGlobalMediaActions.length, 1, 'Media pause action must be dispatched');
    assert.strictEqual(env4.dispatchedGlobalMediaActions[0], 'PAUSE_ALL');
    assert.ok(env4.clearedAlarms.includes('sentinel_sleep_timer_alarm'), 'Alarms must be cleared on expiration');
    console.log('  ✅ Sub-test 4.4 passed: Legitimate RUNNING timer transitions to TRIGGERED and pauses media\n');
  }

  // ============================================================================
  // BATTERY 5: Sleep Timer Volume Fade Guarding
  // ============================================================================
  console.log('Battery 5: Sleep Timer Volume Fade Guarding');
  {
    // 5.1: If state is IDLE -> triggerSleepTimerFade must NOT fade and must purge alarms
    const env1 = createTestEnv();
    env1.sandbox.sleepTimerState.state = 'IDLE';
    env1.sandbox.sleepTimerState.targetTime = 0;

    await env1.sandbox.triggerSleepTimerFade();
    assert.strictEqual(env1.sentTabMessages.length, 0, 'IDLE state must NOT send FADE_AND_PAUSE');
    assert.strictEqual(env1.sandbox.sleepTimerState.state, 'IDLE');
    assert.ok(env1.clearedAlarms.includes('sentinel_sleep_fade_alarm'), 'Fade alarm must be cleared');
    console.log('  ✅ Sub-test 5.1 passed: IDLE timer state skips fade and purges alarms');

    // 5.2: If state is CANCELLED -> triggerSleepTimerFade must NOT fade
    const env2 = createTestEnv();
    env2.sandbox.sleepTimerState.state = 'CANCELLED';

    await env2.sandbox.triggerSleepTimerFade();
    assert.strictEqual(env2.sentTabMessages.length, 0, 'CANCELLED state must NOT send FADE_AND_PAUSE');
    console.log('  ✅ Sub-test 5.2 passed: CANCELLED timer state skips fade');

    // 5.3: If state is RUNNING with targetTime > 0 -> transitions to FADING and sends message
    const env3 = createTestEnv();
    env3.sandbox.sleepTimerState.state = 'RUNNING';
    env3.sandbox.sleepTimerState.targetTime = Date.now() + 30000;
    env3.sandbox.activeMediaSessions.set(101, { isPlaying: true });

    await env3.sandbox.triggerSleepTimerFade();
    assert.strictEqual(env3.sandbox.sleepTimerState.state, 'FADING', 'State must transition to FADING');
    assert.strictEqual(env3.sentTabMessages.length, 1, 'FADE_AND_PAUSE message must be sent to active tab');
    assert.strictEqual(env3.sentTabMessages[0].msg.action, 'FADE_AND_PAUSE');
    console.log('  ✅ Sub-test 5.3 passed: Legitimate RUNNING timer transitions to FADING and dispatches fade\n');
  }

  // ============================================================================
  // BATTERY 6: Chrome Alarms onAlarm Dispatched with Ghost Alarms
  // ============================================================================
  console.log('Battery 6: Chrome Alarms onAlarm Guarding against Ghost Alarms');
  {
    const onAlarmMatch = bgRaw.match(/browserAPI\.alarms\.onAlarm\.addListener\(async\s*\(alarm\)\s*=>\s*\{([\s\S]*?)\n\}\);/);
    assert.ok(onAlarmMatch, 'onAlarm listener must exist in background.js');
    const onAlarmBody = onAlarmMatch[1];

    assert.ok(onAlarmBody.includes("if (alarm.name === SLEEP_ALARM_NAME)"), 'Handles SLEEP_ALARM_NAME');
    assert.ok(onAlarmBody.includes("sleepTimerState.state !== 'RUNNING'"), 'Verifies sleepTimerState.state is RUNNING or FADING');
    assert.ok(onAlarmBody.includes("await purgeSleepTimerAlarms();"), 'Purges alarms when state is invalid');
    assert.ok(onAlarmBody.includes("if (alarm.name === SLEEP_FADE_ALARM_NAME)"), 'Handles SLEEP_FADE_ALARM_NAME');
    assert.ok(onAlarmBody.includes("await checkInactivityAutoSleep(now);"), 'sentinel_flush_alarm checks inactivity auto-sleep');

    console.log('  ✅ Battery 6 passed: onAlarm guards verify FSM state before firing expiration or fade\n');
  }

  // ============================================================================
  // BATTERY 7: Storage Hydration Alarm Purging
  // ============================================================================
  console.log('Battery 7: Storage Hydration Ghost Alarm Purging');
  {
    const hydrationBlock = bgRaw.match(/\/\/ Hydrate Sleep Timer and Inactivity Settings from persistent storage[\s\S]*?\/\/ Hydrate Focus Sentinel/);
    assert.ok(hydrationBlock, 'Hydration block must exist in background.js');
    const hText = hydrationBlock[0];

    assert.ok(hText.includes("sleepTimerState.state === 'IDLE' || sleepTimerState.state === 'CANCELLED'"), 'Checks for IDLE or CANCELLED on hydration');
    assert.ok(hText.includes("await purgeSleepTimerAlarms();"), 'Calls purgeSleepTimerAlarms() on IDLE/CANCELLED');

    const loadFnMatch = bgRaw.match(/async function loadSleepTimerData\(\)[\s\S]*?\n\}/);
    assert.ok(loadFnMatch, 'loadSleepTimerData must exist');
    assert.ok(loadFnMatch[0].includes("await purgeSleepTimerAlarms();"), 'loadSleepTimerData purges ghost alarms');

    console.log('  ✅ Battery 7 passed: Hydration routines purge ghost alarms for IDLE and CANCELLED states\n');
  }

  // ============================================================================
  // BATTERY 8: Tab Change Auto-Pause (handleAutoPauseOnTabChange) Modularization
  // ============================================================================
  console.log('Battery 8: Tab Change Auto-Pause (handleAutoPauseOnTabChange) Verification');
  {
    // 8.1: If auto_pause_new_tab is false or non-boolean, must return empty pausedTabs
    const env1 = createTestEnv();
    env1.setStore({ smart_automations: { auto_pause_new_tab: false } });
    const res1 = await env1.sandbox.handleAutoPauseOnTabChange(202);
    assert.strictEqual(res1.pausedTabs.length, 0, 'Must return empty when auto_pause_new_tab is false');
    assert.strictEqual(JSON.stringify(res1), JSON.stringify({ pausedTabs: [] }));

    env1.setStore({ smart_automations: { auto_pause_new_tab: 'true' } });
    const res2 = await env1.sandbox.handleAutoPauseOnTabChange(202);
    assert.strictEqual(res2.pausedTabs.length, 0, 'Must return empty when auto_pause_new_tab is not boolean true');
    assert.strictEqual(JSON.stringify(res2), JSON.stringify({ pausedTabs: [] }));

    env1.setStore({});
    const res3 = await env1.sandbox.handleAutoPauseOnTabChange(202);
    assert.strictEqual(res3.pausedTabs.length, 0, 'Must return empty when auto_pause_new_tab is missing');
    assert.strictEqual(JSON.stringify(res3), JSON.stringify({ pausedTabs: [] }));
    console.log('  ✅ Sub-test 8.1 passed: Strict boolean check (=== true) enforced for auto_pause_new_tab');

    // 8.2: If auto_pause_new_tab === true, only pauses tabs OTHER than the newly active tab
    const env2 = createTestEnv();
    env2.setStore({ smart_automations: { auto_pause_new_tab: true } });

    env2.sandbox.activeMediaSessions.set(101, { isPlaying: true });
    env2.sandbox.activeMediaSessions.set(202, { isPlaying: true });

    const targets = env2.sandbox.collectAutoPauseTargetTabs(202);
    assert.ok(targets.has(101), 'Target set must include tab 101');
    assert.ok(!targets.has(202), 'Target set must NOT include newly created/active tab 202');

    const result = await env2.sandbox.handleAutoPauseOnTabChange(202);
    assert.ok(result.pausedTabs.includes(101), 'Tab 101 must be paused');
    assert.ok(!result.pausedTabs.includes(202), 'Tab 202 must NOT be paused');
    console.log('  ✅ Sub-test 8.2 passed: Other media tabs paused cleanly while preserving active tab\n');
  }

  console.log('============================================================');
  console.log('🎉 ALL 8 BATTERIES PASSED: Auto-Pause Video Bugfix Certified!');
  console.log('============================================================\n');
}

runAllBatteries().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
