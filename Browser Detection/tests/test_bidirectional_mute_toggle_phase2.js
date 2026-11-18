/**
 * tests/test_bidirectional_mute_toggle_phase2.js
 * Comprehensive Verification Suite for Phase 2: Frontend Feature Module Two-Way Toggle Logic
 * Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
 * Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001
 * 
 * Verifies:
 * - Module-scope state variables (isMuteAllOthersActive, isMuteAllActive)
 * - Two-way toggling of handleSoloTab, handleMuteAllOthers, handleMuteAll
 * - Optimistic cache synchronization and IPC dispatch
 * - Getters, setters, and exports on MediaDeckVisualizerFeature
 * - Security standards (UTF-8 with BOM, 100% W3C Trusted Types zero-innerHTML, function length <= 50 lines)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Phase 2 Frontend Feature Module Two-Way Toggle Test Suite...\n');

const featurePath = path.join(__dirname, '..', 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const featureCode = fs.readFileSync(featurePath, 'utf8');

// ---------------------------------------------------------------------------
// Battery 1: Static Code Structure & Export Verification
// ---------------------------------------------------------------------------
console.log('Battery 1: Static Code Structure & Export Verification');

// 1.1 State variables declared
assert(featureCode.includes('let isMuteAllOthersActive = false;'), 'Must declare let isMuteAllOthersActive = false;');
assert(featureCode.includes('let isMuteAllActive = false;'), 'Must declare let isMuteAllActive = false;');
console.log('  ✅ File-scope state variables declared (isMuteAllOthersActive, isMuteAllActive)');

// 1.2 Function definitions
assert(featureCode.includes('function handleMuteAllOthers('), 'Must define handleMuteAllOthers');
assert(featureCode.includes('function handleMuteAll('), 'Must define handleMuteAll');
assert(featureCode.includes('function dispatchMediaIpc('), 'Must define dispatchMediaIpc helper');
assert(featureCode.includes('function updateBtnMuteAllOthersUI('), 'Must define updateBtnMuteAllOthersUI helper');
assert(featureCode.includes('function updateBtnMuteAllUI('), 'Must define updateBtnMuteAllUI helper');
console.log('  ✅ Function definitions for handleMuteAllOthers, handleMuteAll and UI helpers verified');

// 1.3 IPC Action names
assert(featureCode.includes('MEDIA_STREAM_MUTE_ALL_OTHERS'), 'Must dispatch MEDIA_STREAM_MUTE_ALL_OTHERS');
assert(featureCode.includes('MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR'), 'Must dispatch MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR');
assert(featureCode.includes('MEDIA_STREAM_MUTE_ALL'), 'Must dispatch MEDIA_STREAM_MUTE_ALL');
assert(featureCode.includes('MEDIA_STREAM_MUTE_ALL_CLEAR'), 'Must dispatch MEDIA_STREAM_MUTE_ALL_CLEAR');
console.log('  ✅ All 4 IPC action strings present in feature code');

// 1.4 Exports check on loaded module
const feature = require(featurePath);

assert.strictEqual(typeof feature.handleSoloTab, 'function', 'handleSoloTab must be exported');
assert.strictEqual(typeof feature.handleMuteAllOthers, 'function', 'handleMuteAllOthers must be exported');
assert.strictEqual(typeof feature.handleMuteAll, 'function', 'handleMuteAll must be exported');
assert.strictEqual(typeof feature.getIsMuteAllOthersActive, 'function', 'getIsMuteAllOthersActive must be exported');
assert.strictEqual(typeof feature.setIsMuteAllOthersActive, 'function', 'setIsMuteAllOthersActive must be exported');
assert.strictEqual(typeof feature.getIsMuteAllActive, 'function', 'getIsMuteAllActive must be exported');
assert.strictEqual(typeof feature.setIsMuteAllActive, 'function', 'setIsMuteAllActive must be exported');
assert.strictEqual(typeof feature.getCurrentSoloTabId, 'function', 'getCurrentSoloTabId must be exported');
assert.strictEqual(typeof feature.setCurrentSoloTabId, 'function', 'setCurrentSoloTabId must be exported');
console.log('  ✅ All getters, setters, and toggle handlers properly exported on MediaDeckVisualizerFeature\n');

// ---------------------------------------------------------------------------
// Battery 2: Security & Code Quality Standards
// ---------------------------------------------------------------------------
console.log('Battery 2: Security & Code Quality Standards');

// 2.1 UTF-8 with BOM check
const buf = fs.readFileSync(featurePath);
const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
assert(hasBOM, 'media_deck_visualizer_feature.js must possess UTF-8 BOM (0xEF, 0xBB, 0xBF)');
console.log('  ✅ media_deck_visualizer_feature.js verified UTF-8 with BOM');

// 2.2 W3C Trusted Types compliance (Zero innerHTML/outerHTML)
const innerHTMLMatches = featureCode.match(/(\.innerHTML|\.outerHTML)\s*=/g);
assert(!innerHTMLMatches || innerHTMLMatches.length === 0, 'Must have strictly ZERO innerHTML/outerHTML assignments');
console.log('  ✅ 100% W3C Trusted Types compliant (strictly zero innerHTML/outerHTML)');

// 2.3 Function length check (<= 50 lines)
const lines = featureCode.split('\n');
function getFnLineCount(fnSignature) {
  const startIdx = lines.findIndex(l => l.includes(fnSignature));
  if (startIdx === -1) return 0;
  let braceCount = 0;
  let endIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    if (braceCount === 0 && i > startIdx) {
      endIdx = i;
      break;
    }
  }
  return endIdx - startIdx + 1;
}

const fnsToCheck = [
  'function dispatchMediaIpc(',
  'function updateBtnMuteAllOthersUI(',
  'function handleMuteAllOthers(',
  'function updateBtnMuteAllUI(',
  'function handleMuteAll('
];

fnsToCheck.forEach(fn => {
  const count = getFnLineCount(fn);
  assert(count > 0 && count <= 50, `${fn} must be <= 50 lines (was ${count})`);
  console.log(`  ✅ ${fn.replace('function ', '').replace('(', '')} within line limit (${count} lines <= 50)`);
});
console.log('');

// ---------------------------------------------------------------------------
// Battery 3: Stateful Two-Way Toggle & Optimistic Cache Updates
// ---------------------------------------------------------------------------
console.log('Battery 3: Stateful Two-Way Toggle & Optimistic Cache Updates');

let dispatchedMessages = [];
const mockBrowserAPI = {
  runtime: {
    sendMessage: (msg, cb) => {
      dispatchedMessages.push(msg);
      if (typeof cb === 'function') cb({ success: true, ...msg });
    }
  }
};

const fakeButtonOthers = {
  classes: new Set(['btn', 'btn-secondary']),
  classList: {
    add: (...c) => c.forEach(x => fakeButtonOthers.classes.add(x)),
    remove: (...c) => c.forEach(x => fakeButtonOthers.classes.delete(x)),
    contains: (x) => fakeButtonOthers.classes.has(x)
  },
  textContent: ''
};

const fakeButtonAll = {
  classes: new Set(['btn', 'btn-secondary']),
  classList: {
    add: (...c) => c.forEach(x => fakeButtonAll.classes.add(x)),
    remove: (...c) => c.forEach(x => fakeButtonAll.classes.delete(x)),
    contains: (x) => fakeButtonAll.classes.has(x)
  },
  textContent: ''
};

(async () => {
  // 3.1 Getters & Setters
  feature.setIsMuteAllOthersActive(false);
  assert.strictEqual(feature.getIsMuteAllOthersActive(), false);
  feature.setIsMuteAllOthersActive(true);
  assert.strictEqual(feature.getIsMuteAllOthersActive(), true);
  feature.setIsMuteAllOthersActive(false);

  feature.setIsMuteAllActive(false);
  assert.strictEqual(feature.getIsMuteAllActive(), false);
  feature.setIsMuteAllActive(true);
  assert.strictEqual(feature.getIsMuteAllActive(), true);
  feature.setIsMuteAllActive(false);
  console.log('  ✅ Getters & setters verified');

  // 3.2 handleMuteAllOthers Toggle Flow
  const streamsForOthers = [
    { tabId: 301, isMuted: false, title: 'Tab 301' },
    { tabId: 302, isMuted: false, title: 'Tab 302' },
    { tabId: 303, isMuted: false, title: 'Tab 303' }
  ];
  feature.setCachedStreams(streamsForOthers);

  // Toggle ON
  dispatchedMessages = [];
  await feature.handleMuteAllOthers(streamsForOthers, 301, {
    browserAPI: mockBrowserAPI,
    btnMuteAllOthers: fakeButtonOthers
  });

  assert.strictEqual(feature.getIsMuteAllOthersActive(), true, 'Must toggle isMuteAllOthersActive to true');
  assert.strictEqual(dispatchedMessages.length, 1, 'Must dispatch exactly 1 message');
  assert.strictEqual(dispatchedMessages[0].action, 'MEDIA_STREAM_MUTE_ALL_OTHERS', 'Action must be MEDIA_STREAM_MUTE_ALL_OTHERS');
  assert.strictEqual(dispatchedMessages[0].primaryTabId, 301, 'Primary tab must be 301');
  assert.strictEqual(streamsForOthers.find(s => s.tabId === 301).isMuted, false, 'Primary tab must remain unmuted');
  assert.strictEqual(streamsForOthers.find(s => s.tabId === 302).isMuted, true, 'Non-primary tab 302 must be muted');
  assert.strictEqual(streamsForOthers.find(s => s.tabId === 303).isMuted, true, 'Non-primary tab 303 must be muted');
  assert.strictEqual(fakeButtonOthers.classList.contains('active'), true, 'Button must have active class');
  assert.strictEqual(fakeButtonOthers.classList.contains('btn-danger'), true, 'Button must have btn-danger class');
  console.log('  ✅ handleMuteAllOthers toggle ON verified: primary unmuted, others muted, IPC dispatched');

  // Toggle OFF
  dispatchedMessages = [];
  await feature.handleMuteAllOthers(streamsForOthers, 301, {
    browserAPI: mockBrowserAPI,
    btnMuteAllOthers: fakeButtonOthers
  });

  assert.strictEqual(feature.getIsMuteAllOthersActive(), false, 'Must toggle isMuteAllOthersActive to false');
  assert.strictEqual(dispatchedMessages.length, 1, 'Must dispatch exactly 1 message');
  assert.strictEqual(dispatchedMessages[0].action, 'MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR', 'Action must be MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR');
  assert.strictEqual(streamsForOthers.find(s => s.tabId === 301).isMuted, false, 'Tab 301 remains unmuted');
  assert.strictEqual(streamsForOthers.find(s => s.tabId === 302).isMuted, false, 'Tab 302 restored to unmuted');
  assert.strictEqual(streamsForOthers.find(s => s.tabId === 303).isMuted, false, 'Tab 303 restored to unmuted');
  assert.strictEqual(fakeButtonOthers.classList.contains('active'), false, 'Button active class removed');
  assert.strictEqual(fakeButtonOthers.classList.contains('btn-secondary'), true, 'Button restored to btn-secondary');
  console.log('  ✅ handleMuteAllOthers toggle OFF verified: all streams restored, clear IPC dispatched');

  // 3.3 handleMuteAll Toggle Flow
  const streamsForAll = [
    { tabId: 401, isMuted: false, title: 'Tab 401' },
    { tabId: 402, isMuted: false, title: 'Tab 402' }
  ];
  feature.setCachedStreams(streamsForAll);

  // Toggle ON
  dispatchedMessages = [];
  await feature.handleMuteAll(streamsForAll, {
    browserAPI: mockBrowserAPI,
    btnMuteAll: fakeButtonAll
  });

  assert.strictEqual(feature.getIsMuteAllActive(), true, 'Must toggle isMuteAllActive to true');
  assert.strictEqual(dispatchedMessages.length, 1, 'Must dispatch exactly 1 message');
  assert.strictEqual(dispatchedMessages[0].action, 'MEDIA_STREAM_MUTE_ALL', 'Action must be MEDIA_STREAM_MUTE_ALL');
  assert.strictEqual(streamsForAll.find(s => s.tabId === 401).isMuted, true, 'Tab 401 must be muted');
  assert.strictEqual(streamsForAll.find(s => s.tabId === 402).isMuted, true, 'Tab 402 must be muted');
  assert.strictEqual(fakeButtonAll.classList.contains('active'), true, 'Button must have active class');
  assert.strictEqual(fakeButtonAll.classList.contains('btn-danger'), true, 'Button must have btn-danger class');
  console.log('  ✅ handleMuteAll toggle ON verified: all streams muted, IPC dispatched');

  // Toggle OFF
  dispatchedMessages = [];
  await feature.handleMuteAll(streamsForAll, {
    browserAPI: mockBrowserAPI,
    btnMuteAll: fakeButtonAll
  });

  assert.strictEqual(feature.getIsMuteAllActive(), false, 'Must toggle isMuteAllActive to false');
  assert.strictEqual(dispatchedMessages.length, 1, 'Must dispatch exactly 1 message');
  assert.strictEqual(dispatchedMessages[0].action, 'MEDIA_STREAM_MUTE_ALL_CLEAR', 'Action must be MEDIA_STREAM_MUTE_ALL_CLEAR');
  assert.strictEqual(streamsForAll.find(s => s.tabId === 401).isMuted, false, 'Tab 401 restored to unmuted');
  assert.strictEqual(streamsForAll.find(s => s.tabId === 402).isMuted, false, 'Tab 402 restored to unmuted');
  assert.strictEqual(fakeButtonAll.classList.contains('active'), false, 'Button active class removed');
  assert.strictEqual(fakeButtonAll.classList.contains('btn-secondary'), true, 'Button restored to btn-secondary');
  console.log('  ✅ handleMuteAll toggle OFF verified: all streams restored, clear IPC dispatched');

  // 3.4 Diagnostics state introspection
  const vizState = feature.getVisualizerState();
  assert('isMuteAllOthersActive' in vizState, 'getVisualizerState must include isMuteAllOthersActive');
  assert('isMuteAllActive' in vizState, 'getVisualizerState must include isMuteAllActive');
  console.log('  ✅ getVisualizerState includes both toggle states for live telemetry\n');

  console.log('🎉 ALL 3 BATTERIES IN test_bidirectional_mute_toggle_phase2.js PASSED WITH 100% SUCCESS! (Exit Code 0)');
})();
