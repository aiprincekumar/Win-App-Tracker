/**
 * tests/test_real_chrome_tab_muting_ipc_hardening.js
 * Verification Suite for Real Chrome Tab Muting & IPC Hardening for Mute All and Mute All Others
 * Token: AUTH-MGR-20261118-REAL-MUTE-001
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Real Chrome Tab Muting & IPC Hardening Verification Suite...\n');

const bgPath = path.join(__dirname, '..', 'background.js');
const featurePath = path.join(__dirname, '..', 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const dashPath = path.join(__dirname, '..', 'dashboard', 'dashboard.js');

const bgRaw = fs.readFileSync(bgPath, 'utf8');
const featureRaw = fs.readFileSync(featurePath, 'utf8');
const dashRaw = fs.readFileSync(dashPath, 'utf8');

// ---------------------------------------------------------------------------
// Battery 1: Static Code, Aliases & IPC Routing Verification
// ---------------------------------------------------------------------------
console.log('Battery 1: Static Code, Aliases & IPC Routing Verification');

// 1.1 Restricted Scheme Filtering in collectCandidateTabs
assert(bgRaw.includes('isRestrictedTabUrl(t.url)'), 'collectCandidateTabs must check isRestrictedTabUrl');
console.log('  ✅ collectCandidateTabs filters restricted URL schemes');

// 1.2 Fallback Target Query in handleMuteAllOthersExecution
assert(bgRaw.includes('active: true, lastFocusedWindow: true'), 'handleMuteAllOthersExecution must fallback to active tab query');
assert(bgRaw.includes('let targetId = Number(primaryTabId) || 0;'), 'handleMuteAllOthersExecution handles 0/null primaryTabId');
console.log('  ✅ handleMuteAllOthersExecution dynamic fallback logic verified');

// 1.3 IPC Message Router Aliases
const expectedAliases = [
  'media:mute_all_others',
  'media:unmute_all_others',
  'media:mute_all',
  'media:unmute_all'
];
expectedAliases.forEach(alias => {
  assert(bgRaw.includes(alias), `background.js must handle alias ${alias}`);
  console.log(`  ✅ IPC listener alias for ${alias} verified`);
});

// 1.4 Rule 28 function length constraints (<= 50 lines)
const functionsToVerify = [
  'capturePreMuteSnapshot',
  'collectCandidateTabs',
  'restoreMuteSnapshot',
  'handleSoloTabClearExecution',
  'handleSoloTabExecution',
  'handleMuteAllOthersExecution',
  'handleMuteAllOthersClearExecution',
  'handleMuteAllExecution',
  'handleMuteAllClearExecution'
];

functionsToVerify.forEach(fn => {
  const rx = new RegExp(`async function ${fn}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = bgRaw.match(rx);
  assert(m, `Function snippet for ${fn} must be found`);
  const lines = m[0].split('\n').length;
  assert(lines <= 50, `Function ${fn} exceeds 50 lines (actual: ${lines})`);
  console.log(`  ✅ Function ${fn} verified: ${lines} lines (<= 50)`);
});
console.log('  ✅ Battery 1 Passed: Static code structure, aliases & Rule 28 verified\n');

// ---------------------------------------------------------------------------
// Battery 2: Real Chrome Tab Muting & Fallback Target Isolation VM Simulation
// ---------------------------------------------------------------------------
console.log('Battery 2: Real Chrome Tab Muting & Fallback Target Isolation VM Simulation');

async function runVMRealMutingBattery() {
  const tabMediaMap = new Map();
  const tabsInBrowser = new Map();
  const tabUpdateCalls = [];
  const sentControlMessages = [];
  let broadcastCount = 0;

  const mockBrowserAPI = {
    tabs: {
      update: async (tabId, updateProps) => {
        tabUpdateCalls.push({ tabId, updateProps });
        const tab = tabsInBrowser.get(tabId) || { id: tabId, mutedInfo: { muted: false } };
        if (updateProps && typeof updateProps.muted === 'boolean') {
          tab.mutedInfo = { muted: updateProps.muted };
        }
        tabsInBrowser.set(tabId, tab);
        return tab;
      },
      query: async (queryInfo = {}) => {
        const all = Array.from(tabsInBrowser.values());
        if (queryInfo.active && queryInfo.lastFocusedWindow) {
          return all.filter(t => t.active);
        }
        return all;
      }
    }
  };

  const isRestrictedTabUrl = (url) => {
    if (!url || typeof url !== 'string') return true;
    const u = url.trim().toLowerCase();
    return u.startsWith('chrome://') || u.startsWith('chrome-extension://') || u.startsWith('edge://');
  };

  const sandbox = {
    browserAPI: mockBrowserAPI,
    tabMediaMap,
    soloPreviousMuteStates: new Map(),
    muteOthersPreviousMuteStates: new Map(),
    muteAllPreviousMuteStates: new Map(),
    isRestrictedTabUrl,
    safeSendTabMessage: (tabId, msg) => {
      sentControlMessages.push({ tabId, ...msg });
    },
    safeSendRuntimeMessage: (msg) => {
      if (msg && msg.type === 'LIVE_MEDIA_UPDATE') broadcastCount++;
    },
    synthesizeGlobalMediaState: () => ({ isPlaying: true, totalTabs: tabsInBrowser.size }),
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };

  const fnSnippets = functionsToVerify.map(fn => {
    const rx = new RegExp(`async function ${fn}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}`);
    const m = bgRaw.match(rx);
    return m[0];
  }).join('\n\n');

  vm.createContext(sandbox);
  vm.runInContext(fnSnippets, sandbox);

  // Setup tabs
  tabMediaMap.clear();
  tabsInBrowser.clear();
  tabUpdateCalls.length = 0;
  sentControlMessages.length = 0;

  // Tab 201: Active tab in focused window, web URL, audible
  tabsInBrowser.set(201, { id: 201, active: true, url: 'https://youtube.com/watch?v=1', audible: true, mutedInfo: { muted: false } });
  tabMediaMap.set(201, { primaryMedia: { isMuted: false } });

  // Tab 202: Background tab, web URL, audible
  tabsInBrowser.set(202, { id: 202, active: false, url: 'https://open.spotify.com/track/2', audible: true, mutedInfo: { muted: false } });
  tabMediaMap.set(202, { primaryMedia: { isMuted: false } });

  // Tab 203: Restricted tab (dashboard itself)
  tabsInBrowser.set(203, { id: 203, active: false, url: 'chrome-extension://xyz/dashboard/dashboard.html', audible: false, mutedInfo: { muted: false } });

  // Tab 204: Restricted tab (chrome://extensions)
  tabsInBrowser.set(204, { id: 204, active: false, url: 'chrome://extensions', audible: false, mutedInfo: { muted: false } });

  // 2.1 Dynamic fallback test: primaryTabId = 0 (Header Click Simulation)
  console.log('  Executing Sub-Battery 2.1: Dynamic fallback when primaryTabId is null/0...');
  const res = await sandbox.handleMuteAllOthersExecution(0);
  assert(res.success === true, 'handleMuteAllOthersExecution must succeed with fallback to active tab');
  assert.strictEqual(res.primaryTabId, 201, 'Primary tab must resolve to active tab 201');
  assert.strictEqual(tabsInBrowser.get(201).mutedInfo.muted, false, 'Active tab 201 must remain unmuted');
  assert.strictEqual(tabsInBrowser.get(202).mutedInfo.muted, true, 'Background tab 202 must be muted');

  // Verify restricted tabs 203 and 204 were NEVER targeted for muting
  const mutedTabIds = tabUpdateCalls.filter(c => c.updateProps.muted === true).map(c => c.tabId);
  assert(!mutedTabIds.includes(203), 'Restricted dashboard tab 203 must NEVER be muted');
  assert(!mutedTabIds.includes(204), 'Restricted chrome:// tab 204 must NEVER be muted');
  console.log('  ✅ Dynamic fallback succeeded and restricted schemes excluded');

  // 2.2 Revert test for Mute All Others
  console.log('  Executing Sub-Battery 2.2: Revert for Mute All Others...');
  const clearRes = await sandbox.handleMuteAllOthersClearExecution();
  assert(clearRes.success === true, 'handleMuteAllOthersClearExecution must succeed');
  assert.strictEqual(tabsInBrowser.get(202).mutedInfo.muted, false, 'Background tab 202 must be restored to unmuted');
  console.log('  ✅ Revert for Mute All Others verified');

  // 2.3 Mute All Execution test
  console.log('  Executing Sub-Battery 2.3: Mute All Execution...');
  tabUpdateCalls.length = 0;
  const muteAllRes = await sandbox.handleMuteAllExecution();
  assert(muteAllRes.success === true, 'handleMuteAllExecution must succeed');
  assert.strictEqual(tabsInBrowser.get(201).mutedInfo.muted, true, 'Tab 201 must be muted in Mute All');
  assert.strictEqual(tabsInBrowser.get(202).mutedInfo.muted, true, 'Tab 202 must be muted in Mute All');
  const muteAllTargets = tabUpdateCalls.filter(c => c.updateProps.muted === true).map(c => c.tabId);
  assert(!muteAllTargets.includes(203), 'Restricted dashboard tab 203 must not be muted in Mute All');
  assert(!muteAllTargets.includes(204), 'Restricted chrome:// tab 204 must not be muted in Mute All');
  console.log('  ✅ Mute All properly muted all web tabs and skipped restricted tabs');

  // 2.4 Unmute All Execution test
  console.log('  Executing Sub-Battery 2.4: Unmute All Execution...');
  const unmuteAllRes = await sandbox.handleMuteAllClearExecution();
  assert(unmuteAllRes.success === true, 'handleMuteAllClearExecution must succeed');
  assert.strictEqual(tabsInBrowser.get(201).mutedInfo.muted, false, 'Tab 201 restored to unmuted');
  assert.strictEqual(tabsInBrowser.get(202).mutedInfo.muted, false, 'Tab 202 restored to unmuted');
  console.log('  ✅ Unmute All restored all web tabs cleanly\n');
}

// ---------------------------------------------------------------------------
// Battery 3: Frontend IPC Hardening & Visualizer UI Synchronization
// ---------------------------------------------------------------------------
console.log('Battery 3: Frontend IPC Hardening & Visualizer UI Synchronization');

async function runVMFrontendBattery() {
  const featureModule = require(featurePath);
  const { handleMuteAllOthers, handleMuteAll, getIsMuteAllOthersActive, getIsMuteAllActive, setIsMuteAllOthersActive, setIsMuteAllActive, setCachedStreams } = featureModule;

  setIsMuteAllOthersActive(false);
  setIsMuteAllActive(false);

  const streams = [
    { tabId: 501, isMuted: false, title: 'Tab 501' },
    { tabId: 502, isMuted: false, title: 'Tab 502' }
  ];
  setCachedStreams(streams);

  let sentMessages = [];
  const fakeBtn = {
    classList: {
      classes: new Set(['btn-secondary']),
      add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains: function(c) { return this.classes.has(c); }
    },
    textContent: ''
  };

  const mockApi = {
    runtime: {
      sendMessage: (msg, callback) => {
        sentMessages.push(msg);
        callback({ success: true, primaryTabId: msg.primaryTabId || 501, mutedCount: 1 });
      }
    }
  };

  // 3.1 handleMuteAllOthers awaiting IPC response
  sentMessages = [];
  const othersRes = await handleMuteAllOthers(streams, null, {
    browserAPI: mockApi,
    btnMuteAllOthers: fakeBtn,
    t: (k) => k
  });
  assert(othersRes.success === true, 'handleMuteAllOthers must return IPC result');
  assert.strictEqual(getIsMuteAllOthersActive(), true, 'Must toggle isMuteAllOthersActive to true');
  assert.strictEqual(fakeBtn.classList.contains('active'), true, 'Button must have active class');
  assert(sentMessages.length > 0, 'IPC message must be sent');
  console.log('  ✅ handleMuteAllOthers awaits IPC and synchronizes UI state on success');

  // 3.2 handleMuteAllOthers error resilience (no toggle on failure)
  setIsMuteAllOthersActive(false);
  fakeBtn.classList.remove('active', 'btn-danger');
  fakeBtn.classList.add('btn-secondary');

  const failingApi = {
    runtime: {
      sendMessage: (msg, callback) => {
        callback({ success: false, error: 'Simulated backend failure' });
      }
    }
  };

  const failedRes = await handleMuteAllOthers(streams, 501, {
    browserAPI: failingApi,
    btnMuteAllOthers: fakeBtn,
    t: (k) => k
  });
  assert(failedRes.success === false, 'Failed IPC response must be preserved');
  assert.strictEqual(getIsMuteAllOthersActive(), false, 'isMuteAllOthersActive must NOT toggle on backend failure');
  assert.strictEqual(fakeBtn.classList.contains('active'), false, 'Button must NOT become active on failure');
  console.log('  ✅ UI does NOT falsely toggle when backend returns failure');

  // 3.3 handleMuteAll awaiting IPC response
  const allBtn = {
    classList: {
      classes: new Set(['btn-secondary']),
      add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains: function(c) { return this.classes.has(c); }
    },
    textContent: ''
  };

  sentMessages = [];
  const muteAllRes = await handleMuteAll(streams, {
    browserAPI: mockApi,
    btnMuteAll: allBtn,
    t: (k) => k
  });
  assert(muteAllRes.success === true, 'handleMuteAll must return IPC result');
  assert.strictEqual(getIsMuteAllActive(), true, 'Must toggle isMuteAllActive to true');
  assert.strictEqual(allBtn.classList.contains('active'), true, 'Button must have active class');
  console.log('  ✅ handleMuteAll awaits IPC and synchronizes UI state');

  // 3.4 UTF-8 with BOM Verification
  const files = [bgPath, featurePath, dashPath];
  files.forEach(f => {
    const b = fs.readFileSync(f);
    assert(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF, `${path.basename(f)} must maintain UTF-8 with BOM`);
  });
  console.log('  ✅ All touched files verified UTF-8 with BOM\n');
}

(async () => {
  await runVMRealMutingBattery();
  await runVMFrontendBattery();
  console.log('🎉 ALL BATTERIES IN test_real_chrome_tab_muting_ipc_hardening.js PASSED WITH 100% SUCCESS! (Exit Code 0)');
})().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
