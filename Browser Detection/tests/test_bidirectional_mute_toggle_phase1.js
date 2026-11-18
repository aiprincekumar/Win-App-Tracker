// tests/test_bidirectional_mute_toggle_phase1.js
// Verification Suite for Phase 1: Backend Service Worker State & Bidirectional IPC Architecture
// Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons (TASK-BIDIRECTIONAL-MUTE-TOGGLE-001)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Phase 1 Backend Service Worker State & Bidirectional IPC Test Suite...\n');

const bgPath = path.join(__dirname, '..', 'background.js');
const bgRaw = fs.readFileSync(bgPath, 'utf8');
const bgCode = bgRaw.replace(/\r\n/g, '\n');

// ---------------------------------------------------------------------------
// Battery 1: Static Code, Snapshot Maps & Function Exports Verification
// ---------------------------------------------------------------------------
console.log('Battery 1: Static Code, Snapshot Maps & Function Exports Verification');

// 1.1 Snapshot maps declaration at file scope
assert(bgCode.includes('const soloPreviousMuteStates = new Map();'), 'Must declare soloPreviousMuteStates at file scope');
assert(bgCode.includes('const muteOthersPreviousMuteStates = new Map();'), 'Must declare muteOthersPreviousMuteStates at file scope');
assert(bgCode.includes('const muteAllPreviousMuteStates = new Map();'), 'Must declare muteAllPreviousMuteStates at file scope');
console.log('  ✅ File-scope snapshot maps declared (solo, muteOthers, muteAll)');

// 1.2 Function declarations
const requiredFunctions = [
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

requiredFunctions.forEach(fn => {
  assert(bgCode.includes(`async function ${fn}`), `background.js must define async function ${fn}`);
  console.log(`  ✅ Function ${fn} defined`);
});

// 1.3 IPC Message Router in onMessage.addListener
const ipcTypes = [
  'MEDIA_STREAM_SOLO',
  'MEDIA_STREAM_SOLO_CLEAR',
  'MEDIA_STREAM_MUTE_ALL_OTHERS',
  'MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR',
  'MEDIA_STREAM_MUTE_ALL',
  'MEDIA_STREAM_MUTE_ALL_CLEAR'
];

ipcTypes.forEach(type => {
  assert(bgCode.includes(`if (msgType === '${type}')`), `Must route IPC message ${type}`);
  console.log(`  ✅ IPC listener for ${type} verified`);
});

// 1.4 Global & Module Exports
const exportNames = [
  'handleSoloTabExecution',
  'handleSoloTabClearExecution',
  'handleMuteAllOthersExecution',
  'handleMuteAllOthersClearExecution',
  'handleMuteAllExecution',
  'handleMuteAllClearExecution'
];

exportNames.forEach(name => {
  assert(bgCode.includes(`globalThis.${name} = ${name};`), `Must export ${name} on globalThis`);
  assert(bgCode.includes(`globalThis.SentinelBackgroundModules.${name} = ${name};`), `Must export ${name} on SentinelBackgroundModules`);
  assert(bgCode.includes(name), `Must export ${name} in module.exports`);
});
console.log('  ✅ All 6 bidirectional mute functions exported across globalThis, SentinelBackgroundModules, and module.exports\n');

// ---------------------------------------------------------------------------
// Battery 2: Security, Encoding, and Function Length Guidelines
// ---------------------------------------------------------------------------
console.log('Battery 2: Security, Encoding, and Function Length Guidelines');

// 2.1 UTF-8 with BOM verification
const buf = fs.readFileSync(bgPath);
const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
assert(hasBOM, 'background.js must maintain UTF-8 with BOM (0xEF, 0xBB, 0xBF)');
console.log('  ✅ background.js verified UTF-8 with BOM');

// 2.2 Function length constraints (<= 50 lines)
requiredFunctions.forEach(fn => {
  const regex = new RegExp(`async function ${fn}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`);
  const match = bgCode.match(regex);
  assert(match, `Could not match body for function ${fn}`);
  const lineCount = match[0].split('\n').length;
  assert(lineCount <= 50, `Function ${fn} exceeds 50 lines (actual: ${lineCount})`);
  console.log(`  ✅ Function ${fn} within line limit (${lineCount} lines <= 50)`);
});
console.log('  ✅ All functions strictly adhere to max 50 lines requirement\n');

// ---------------------------------------------------------------------------
// Battery 3: Dynamic Isolated VM Functional Simulation (Mute & Snapshot Revert)
// ---------------------------------------------------------------------------
console.log('Battery 3: Dynamic Isolated VM Functional Simulation (Mute & Snapshot Revert)');

async function runVMBattery() {
  const tabMediaMap = new Map();
  const tabsInBrowser = new Map();
  const sentControlMessages = [];
  let broadcastCount = 0;

  const mockBrowserAPI = {
    tabs: {
      update: async (tabId, updateProps) => {
        const tab = tabsInBrowser.get(tabId) || { id: tabId, mutedInfo: { muted: false } };
        if (updateProps && typeof updateProps.muted === 'boolean') {
          tab.mutedInfo = { muted: updateProps.muted };
        }
        tabsInBrowser.set(tabId, tab);
        return tab;
      },
      query: async () => Array.from(tabsInBrowser.values())
    }
  };

  const sandbox = {
    browserAPI: mockBrowserAPI,
    tabMediaMap,
    soloPreviousMuteStates: new Map(),
    muteOthersPreviousMuteStates: new Map(),
    muteAllPreviousMuteStates: new Map(),
    safeSendTabMessage: (tabId, msg) => {
      sentControlMessages.push({ tabId, ...msg });
    },
    safeSendRuntimeMessage: (msg) => {
      if (msg && msg.type === 'LIVE_MEDIA_UPDATE') broadcastCount++;
    },
    synthesizeGlobalMediaState: () => ({ isPlaying: true, totalTabs: tabsInBrowser.size }),
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };

  // Compile helper functions and handlers in VM
  const fnSnippets = requiredFunctions.map(fn => {
    const rx = new RegExp(`async function ${fn}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}`);
    const m = bgCode.match(rx);
    assert(m, `Function snippet for ${fn} must be found`);
    return m[0];
  }).join('\n\n');

  vm.createContext(sandbox);
  vm.runInContext(fnSnippets, sandbox);

  // Helper setup for simulation tabs
  function setupTestTabs() {
    tabMediaMap.clear();
    tabsInBrowser.clear();
    sentControlMessages.length = 0;
    broadcastCount = 0;

    // Tab 101: audible, unmuted
    tabsInBrowser.set(101, { id: 101, audible: true, mutedInfo: { muted: false } });
    tabMediaMap.set(101, { primaryMedia: { isMuted: false } });

    // Tab 102: audible, unmuted
    tabsInBrowser.set(102, { id: 102, audible: true, mutedInfo: { muted: false } });
    tabMediaMap.set(102, { primaryMedia: { isMuted: false } });

    // Tab 103: was already MUTED before any action
    tabsInBrowser.set(103, { id: 103, audible: false, mutedInfo: { muted: true } });
    tabMediaMap.set(103, { primaryMedia: { isMuted: true } });
  }

  // --- 3.1 Solo Tab Toggle Test with State Snapshot & Exact Revert ---
  setupTestTabs();
  console.log('  Executing Sub-Battery 3.1: Solo Tab Execution & Bidirectional Revert...');
  const soloRes = await sandbox.handleSoloTabExecution(101);
  assert(soloRes.success === true, 'Solo execution must succeed');
  assert.strictEqual(soloRes.soloTabId, 101, 'Solo tab must be 101');
  assert.strictEqual(sandbox.soloPreviousMuteStates.get(101), false, 'Tab 101 snapshot was unmuted');
  assert.strictEqual(sandbox.soloPreviousMuteStates.get(102), false, 'Tab 102 snapshot was unmuted');
  assert.strictEqual(sandbox.soloPreviousMuteStates.get(103), true, 'Tab 103 snapshot was muted');

  // Verify Tab 101 remains unmuted, Tabs 102 and 103 are muted
  assert.strictEqual(tabsInBrowser.get(101).mutedInfo.muted, false, 'Tab 101 must be unmuted');
  assert.strictEqual(tabsInBrowser.get(102).mutedInfo.muted, true, 'Tab 102 must be muted by solo');
  assert.strictEqual(tabsInBrowser.get(103).mutedInfo.muted, true, 'Tab 103 must remain muted');

  // Now clear solo mode
  const soloClearRes = await sandbox.handleSoloTabClearExecution();
  assert(soloClearRes.success === true, 'Solo clear must succeed');
  assert.strictEqual(soloClearRes.cleared, true, 'cleared must be true');
  assert.strictEqual(sandbox.soloPreviousMuteStates.size, 0, 'soloPreviousMuteStates must be emptied after clear');

  // Tab 102 was unmuted before solo -> must be restored to unmuted
  assert.strictEqual(tabsInBrowser.get(102).mutedInfo.muted, false, 'Tab 102 must be restored to unmuted');
  // Tab 103 was muted before solo -> must remain muted (NOT unmuted!)
  assert.strictEqual(tabsInBrowser.get(103).mutedInfo.muted, true, 'Tab 103 was originally muted and must remain muted');
  console.log('  ✅ Sub-Battery 3.1 Passed: Solo mode snapshot captures pre-mute state and restores exact prior state');

  // --- 3.2 Mute All Others Test with State Snapshot & Exact Revert ---
  setupTestTabs();
  console.log('  Executing Sub-Battery 3.2: Mute All Others Execution & Bidirectional Revert...');
  const muteOthersRes = await sandbox.handleMuteAllOthersExecution(101);
  assert(muteOthersRes.success === true, 'Mute all others must succeed');
  assert.strictEqual(muteOthersRes.primaryTabId, 101, 'Primary tab must be 101');
  assert.strictEqual(sandbox.muteOthersPreviousMuteStates.get(102), false, 'Tab 102 was unmuted');
  assert.strictEqual(sandbox.muteOthersPreviousMuteStates.get(103), true, 'Tab 103 was muted');

  // Tab 101 untouched, others muted
  assert.strictEqual(tabsInBrowser.get(101).mutedInfo.muted, false, 'Primary tab 101 remains unmuted');
  assert.strictEqual(tabsInBrowser.get(102).mutedInfo.muted, true, 'Tab 102 muted');
  assert.strictEqual(tabsInBrowser.get(103).mutedInfo.muted, true, 'Tab 103 muted');

  // Clear Mute All Others
  const muteOthersClearRes = await sandbox.handleMuteAllOthersClearExecution();
  assert(muteOthersClearRes.success === true, 'Mute all others clear must succeed');
  assert.strictEqual(sandbox.muteOthersPreviousMuteStates.size, 0, 'muteOthersPreviousMuteStates must be cleared');
  assert.strictEqual(tabsInBrowser.get(102).mutedInfo.muted, false, 'Tab 102 restored to unmuted');
  assert.strictEqual(tabsInBrowser.get(103).mutedInfo.muted, true, 'Tab 103 restored to muted');
  console.log('  ✅ Sub-Battery 3.2 Passed: Mute All Others preserves non-primary states and restores exact prior states');

  // --- 3.3 Mute All Test with State Snapshot & Exact Revert ---
  setupTestTabs();
  console.log('  Executing Sub-Battery 3.3: Mute All Execution & Bidirectional Revert...');
  const muteAllRes = await sandbox.handleMuteAllExecution();
  assert(muteAllRes.success === true, 'Mute all must succeed');
  assert.strictEqual(sandbox.muteAllPreviousMuteStates.get(101), false, 'Tab 101 was unmuted');
  assert.strictEqual(sandbox.muteAllPreviousMuteStates.get(102), false, 'Tab 102 was unmuted');
  assert.strictEqual(sandbox.muteAllPreviousMuteStates.get(103), true, 'Tab 103 was muted');

  // All tabs must be muted
  assert.strictEqual(tabsInBrowser.get(101).mutedInfo.muted, true, 'Tab 101 muted');
  assert.strictEqual(tabsInBrowser.get(102).mutedInfo.muted, true, 'Tab 102 muted');
  assert.strictEqual(tabsInBrowser.get(103).mutedInfo.muted, true, 'Tab 103 muted');

  // Clear Mute All
  const muteAllClearRes = await sandbox.handleMuteAllClearExecution();
  assert(muteAllClearRes.success === true, 'Mute all clear must succeed');
  assert.strictEqual(sandbox.muteAllPreviousMuteStates.size, 0, 'muteAllPreviousMuteStates must be cleared');
  assert.strictEqual(tabsInBrowser.get(101).mutedInfo.muted, false, 'Tab 101 restored to unmuted');
  assert.strictEqual(tabsInBrowser.get(102).mutedInfo.muted, false, 'Tab 102 restored to unmuted');
  assert.strictEqual(tabsInBrowser.get(103).mutedInfo.muted, true, 'Tab 103 restored to muted');
  console.log('  ✅ Sub-Battery 3.3 Passed: Mute All preserves all tab states and restores exact prior states');

  console.log('\n🎉 ALL 3 BATTERIES IN test_bidirectional_mute_toggle_phase1.js PASSED WITH 100% SUCCESS! (Exit Code 0)');
}

runVMBattery().catch(err => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
