// 
/**
 * tests/test_mute_all_others_primary_tab_selection.js
 * Comprehensive Verification & Regression Test Suite for Primary Media Tab Candidate Selection
 * Task: Automated Candidate Primary Tab Resolution for "Mute All Others"
 * Task ID: AUTH-MGR-20261118-MUTE-ALL-OTHERS-SELECTION-003
 *
 * Verification Batteries:
 * Battery 1: Static Code, Exports, UTF-8 with BOM Integrity, and Function Length (<= 50 lines)
 * Battery 2: Tier 1 Candidate Resolution (Active playing / audible media prioritized over paused or focused tabs)
 * Battery 3: Tier 2 Candidate Resolution (Playback Recency Prioritized when none playing)
 * Battery 4: Tier 3 Candidate Resolution (Active focused browser tab fallback when no media history)
 * Battery 5: Bidirectional Toggle & Snapshot Restoration (Clean restoration of prior mute states via snapshot)
 * Battery 6: In-page DOM Message Dispatch (safeSendTabMessage unmute primary, mute others, and clear unmute)
 * Battery 7: Frontend resolvePrimaryMediaTabId and handleMuteAllOthers Verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Comprehensive Candidate Primary Tab Resolution & Mute All Others Test Suite...\n');

const bgPath = path.join(__dirname, '..', 'background.js');
const featurePath = path.join(__dirname, '..', 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const dashPath = path.join(__dirname, '..', 'dashboard', 'dashboard.js');

const bgBuffer = fs.readFileSync(bgPath);
const bgRaw = fs.readFileSync(bgPath, 'utf8');

const featureBuffer = fs.readFileSync(featurePath);
const featureRaw = fs.readFileSync(featurePath, 'utf8');

const dashBuffer = fs.readFileSync(dashPath);
const dashRaw = fs.readFileSync(dashPath, 'utf8');

// =========================================================================
// Helper Utilities
// =========================================================================
function checkBOM(buffer, fileName) {
  const hasBOM = buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
  assert(hasBOM, `${fileName} must possess UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
}

function extractFunctionLines(code, fnSignature) {
  const lines = code.split('\n');
  const startIdx = lines.findIndex(l => l.includes(fnSignature));
  assert(startIdx !== -1, `Function signature "${fnSignature}" must exist`);
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
  const count = endIdx - startIdx + 1;
  const snippet = lines.slice(startIdx, endIdx + 1).join('\n');
  return { snippet, count };
}

// =========================================================================
// BATTERY 1: Static Code, Exports, UTF-8 BOM & Function Length (<= 50 lines)
// =========================================================================
console.log('Battery 1: Static Code, Exports, UTF-8 BOM & Function Length (<= 50 lines)');

// 1.1 UTF-8 BOM checks
checkBOM(bgBuffer, 'background.js');
console.log('  ✅ background.js verified UTF-8 with BOM');
checkBOM(featureBuffer, 'media_deck_visualizer_feature.js');
console.log('  ✅ media_deck_visualizer_feature.js verified UTF-8 with BOM');
checkBOM(dashBuffer, 'dashboard.js');
console.log('  ✅ dashboard.js verified UTF-8 with BOM');

// 1.2 Function Length Checks (Rule 28: <= 50 lines)
const bgResolveFn = extractFunctionLines(bgRaw, 'async function resolveCandidatePrimaryTab(');
assert(bgResolveFn.count <= 50, `resolveCandidatePrimaryTab must be <= 50 lines (got ${bgResolveFn.count})`);
console.log(`  ✅ resolveCandidatePrimaryTab in background.js: ${bgResolveFn.count} lines (<= 50)`);

const bgMuteOthersFn = extractFunctionLines(bgRaw, 'async function handleMuteAllOthersExecution(');
assert(bgMuteOthersFn.count <= 50, `handleMuteAllOthersExecution must be <= 50 lines (got ${bgMuteOthersFn.count})`);
console.log(`  ✅ handleMuteAllOthersExecution in background.js: ${bgMuteOthersFn.count} lines (<= 50)`);

const bgMuteOthersClearFn = extractFunctionLines(bgRaw, 'async function handleMuteAllOthersClearExecution(');
assert(bgMuteOthersClearFn.count <= 50, `handleMuteAllOthersClearExecution must be <= 50 lines (got ${bgMuteOthersClearFn.count})`);
console.log(`  ✅ handleMuteAllOthersClearExecution in background.js: ${bgMuteOthersClearFn.count} lines (<= 50)`);

const bgPreMuteFn = extractFunctionLines(bgRaw, 'async function capturePreMuteSnapshot(');
assert(bgPreMuteFn.count <= 50, `capturePreMuteSnapshot must be <= 50 lines (got ${bgPreMuteFn.count})`);
console.log(`  ✅ capturePreMuteSnapshot in background.js: ${bgPreMuteFn.count} lines (<= 50)`);

const bgCollectCandFn = extractFunctionLines(bgRaw, 'async function collectCandidateTabs(');
assert(bgCollectCandFn.count <= 50, `collectCandidateTabs must be <= 50 lines (got ${bgCollectCandFn.count})`);
console.log(`  ✅ collectCandidateTabs in background.js: ${bgCollectCandFn.count} lines (<= 50)`);

const bgRestoreFn = extractFunctionLines(bgRaw, 'async function restoreMuteSnapshot(');
assert(bgRestoreFn.count <= 50, `restoreMuteSnapshot must be <= 50 lines (got ${bgRestoreFn.count})`);
console.log(`  ✅ restoreMuteSnapshot in background.js: ${bgRestoreFn.count} lines (<= 50)`);

const featResolveFn = extractFunctionLines(featureRaw, 'function resolvePrimaryMediaTabId(');
assert(featResolveFn.count <= 50, `resolvePrimaryMediaTabId in feature must be <= 50 lines (got ${featResolveFn.count})`);
console.log(`  ✅ resolvePrimaryMediaTabId in media_deck_visualizer_feature.js: ${featResolveFn.count} lines (<= 50)`);

const featMuteOthersFn = extractFunctionLines(featureRaw, 'async function handleMuteAllOthers(');
assert(featMuteOthersFn.count <= 50, `handleMuteAllOthers in feature must be <= 50 lines (got ${featMuteOthersFn.count})`);
console.log(`  ✅ handleMuteAllOthers in media_deck_visualizer_feature.js: ${featMuteOthersFn.count} lines (<= 50)`);

const dashResolveFn = extractFunctionLines(dashRaw, 'function resolvePrimaryMediaTabId(');
assert(dashResolveFn.count <= 50, `resolvePrimaryMediaTabId in dashboard must be <= 50 lines (got ${dashResolveFn.count})`);
console.log(`  ✅ resolvePrimaryMediaTabId in dashboard.js: ${dashResolveFn.count} lines (<= 50)`);

const dashMuteOthersFn = extractFunctionLines(dashRaw, 'function handleMuteAllOthers(');
assert(dashMuteOthersFn.count <= 50, `handleMuteAllOthers in dashboard must be <= 50 lines (got ${dashMuteOthersFn.count})`);
console.log(`  ✅ handleMuteAllOthers in dashboard.js: ${dashMuteOthersFn.count} lines (<= 50)`);

// 1.3 Exports Verification
assert(bgRaw.includes('globalThis.resolveCandidatePrimaryTab = resolveCandidatePrimaryTab;'), 'Exported on globalThis');
assert(bgRaw.includes('globalThis.SentinelBackgroundModules.resolveCandidatePrimaryTab = resolveCandidatePrimaryTab;'), 'Exported on SentinelBackgroundModules');
assert(bgRaw.includes('resolveCandidatePrimaryTab,'), 'Exported in module.exports');

const featureModule = require(featurePath);
assert.strictEqual(typeof featureModule.resolvePrimaryMediaTabId, 'function', 'resolvePrimaryMediaTabId must be exported on featureModule');
assert.strictEqual(typeof featureModule.handleMuteAllOthers, 'function', 'handleMuteAllOthers must be exported on featureModule');

const dashModule = require(dashPath);
assert.strictEqual(typeof dashModule.resolvePrimaryMediaTabId, 'function', 'resolvePrimaryMediaTabId must be exported on dashModule');
assert.strictEqual(typeof dashModule.handleMuteAllOthers, 'function', 'handleMuteAllOthers must be exported on dashModule');
console.log('  ✅ All exports across background.js, media_deck_visualizer_feature.js, and dashboard.js verified\n');

// =========================================================================
// Backend VM Setup for Batteries 2 - 6
// =========================================================================
function createTestSandbox() {
  const tabsInBrowser = new Map();
  const tabMediaMap = new Map();
  const activeMediaSessions = new Map();
  const mediaHistory = [];
  const muteOthersPreviousMuteStates = new Map();
  const sentControlMessages = [];
  const sentRuntimeMessages = [];

  const mockBrowserAPI = {
    tabs: {
      update: async (tabId, updateProps) => {
        const tab = tabsInBrowser.get(tabId) || { id: tabId, mutedInfo: { muted: false }, url: 'https://example.com' };
        if (updateProps && typeof updateProps.muted === 'boolean') {
          tab.mutedInfo = { muted: updateProps.muted };
        }
        tabsInBrowser.set(tabId, tab);
        return tab;
      },
      query: async (queryObj) => {
        const all = Array.from(tabsInBrowser.values());
        if (queryObj.active && queryObj.lastFocusedWindow) {
          return all.filter(t => t.active);
        }
        if (queryObj.audible) {
          return all.filter(t => t.audible);
        }
        return all;
      }
    }
  };

  const isRestrictedTabUrl = (url) => {
    if (!url || typeof url !== 'string') return true;
    const u = url.trim().toLowerCase();
    return u.startsWith('chrome://') || u.startsWith('chrome-extension://') || u.startsWith('edge://') || u.startsWith('about:');
  };

  const sandbox = {
    browserAPI: mockBrowserAPI,
    tabMediaMap,
    activeMediaSessions,
    mediaHistory,
    muteOthersPreviousMuteStates,
    isRestrictedTabUrl,
    safeSendTabMessage: (tabId, msg) => {
      sentControlMessages.push({ tabId, ...msg });
    },
    safeSendRuntimeMessage: (msg) => {
      sentRuntimeMessages.push(msg);
    },
    synthesizeGlobalMediaState: () => ({ isPlaying: true, totalTabs: tabsInBrowser.size }),
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };

  vm.createContext(sandbox);

  const snippets = [
    bgPreMuteFn.snippet,
    bgCollectCandFn.snippet,
    bgRestoreFn.snippet,
    bgResolveFn.snippet,
    bgMuteOthersFn.snippet,
    bgMuteOthersClearFn.snippet
  ].join('\n\n');

  vm.runInContext(snippets, sandbox);

  return {
    sandbox,
    tabsInBrowser,
    tabMediaMap,
    activeMediaSessions,
    mediaHistory,
    muteOthersPreviousMuteStates,
    sentControlMessages,
    sentRuntimeMessages,
    mockBrowserAPI
  };
}

async function runBatteries() {
  // =========================================================================
  // BATTERY 2: Tier 1 Candidate Resolution (Active Playing / Audible Media)
  // =========================================================================
  console.log('Battery 2: Tier 1 Candidate Resolution (Active Playing / Audible Media)');
  {
    const env = createTestSandbox();
    const { sandbox, tabsInBrowser, tabMediaMap, activeMediaSessions } = env;

    // 2.0 Tier 0: Direct explicit primaryTabId
    const explicitNum = await sandbox.resolveCandidatePrimaryTab(77);
    assert.strictEqual(explicitNum, 77, 'Explicit primaryTabId must return immediately');
    const explicitStr = await sandbox.resolveCandidatePrimaryTab('99');
    assert.strictEqual(explicitStr, 99, 'String explicit primaryTabId must parse to number');
    console.log('  ✅ Tier 0: Direct explicit tab ID resolution verified');

    // 2.1 Tab 101 (paused), Tab 102 (playing), Tab 103 (focused active)
    tabsInBrowser.set(101, { id: 101, url: 'https://site1.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(101, { primaryMedia: { isPlaying: false, isMuted: false } });

    tabsInBrowser.set(102, { id: 102, url: 'https://youtube.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(102, { primaryMedia: { isPlaying: true, isMuted: false } });

    tabsInBrowser.set(103, { id: 103, url: 'https://docs.google.com', active: true, audible: false, mutedInfo: { muted: false } });

    const resolved102 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved102, 102, 'Tier 1A: Tab 102 with isPlaying: true must be selected over focused tab 103 and paused tab 101');
    console.log('  ✅ Tier 1A: tabMediaMap isPlaying resolved over active focused tab');

    // 2.2 activeMediaSessions playing state
    tabMediaMap.clear();
    activeMediaSessions.set(105, { tabId: 105, isPlaying: true, playbackState: 'playing' });
    const resolved105 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved105, 105, 'Tier 1B: activeMediaSessions playing state must be resolved');
    console.log('  ✅ Tier 1B: activeMediaSessions isPlaying stream resolved');

    // 2.3 Audible tab in browser tabs
    activeMediaSessions.clear();
    tabsInBrowser.set(106, { id: 106, url: 'https://soundcloud.com', active: false, audible: true, mutedInfo: { muted: false } });
    const resolved106 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved106, 106, 'Tier 1C: browser tabs.query audible tab must be resolved');
    console.log('  ✅ Tier 1C: tabs.query audible tab resolved');

    // 2.4 Full handleMuteAllOthersExecution with Tier 1 auto-resolution
    tabMediaMap.set(101, { primaryMedia: { isPlaying: false, isMuted: false } });
    tabMediaMap.set(102, { primaryMedia: { isPlaying: true, isMuted: false } });
    tabsInBrowser.get(106).audible = false; // reset 106 audible

    const execRes = await sandbox.handleMuteAllOthersExecution(null);
    assert(execRes.success, 'handleMuteAllOthersExecution must succeed');
    assert.strictEqual(execRes.primaryTabId, 102, 'Primary tab must resolve to 102');
    assert.strictEqual(tabsInBrowser.get(102).mutedInfo.muted, false, 'Primary tab 102 must remain unmuted');
    assert.strictEqual(tabsInBrowser.get(101).mutedInfo.muted, true, 'Non-primary tab 101 must be muted');
    assert.strictEqual(tabsInBrowser.get(103).mutedInfo.muted, true, 'Non-primary tab 103 must be muted');
    console.log('  ✅ Tier 1 Full Execution: Tab 102 retained unmuted, all others muted cleanly\n');
  }

  // =========================================================================
  // BATTERY 3: Tier 2 Candidate Resolution (Playback Recency Prioritized)
  // =========================================================================
  console.log('Battery 3: Tier 2 Candidate Resolution (Playback Recency Prioritized)');
  {
    const env = createTestSandbox();
    const { sandbox, tabsInBrowser, tabMediaMap, activeMediaSessions, mediaHistory } = env;

    // Setup tabs: NONE playing or audible
    tabsInBrowser.set(201, { id: 201, url: 'https://music.youtube.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(201, { primaryMedia: { isPlaying: false, isMuted: false } });

    tabsInBrowser.set(202, { id: 202, url: 'https://spotify.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(202, { primaryMedia: { isPlaying: false, isMuted: false } });

    tabsInBrowser.set(203, { id: 203, url: 'https://github.com', active: true, audible: false, mutedInfo: { muted: false } });

    // Tab 201 played at T - 5000ms; Tab 202 played at T - 1000ms
    const now = 1000000;
    activeMediaSessions.set(201, { tabId: 201, isPlaying: false, lastPlaybackTimestamp: now - 5000 });
    activeMediaSessions.set(202, { tabId: 202, isPlaying: false, lastPlaybackTimestamp: now - 1000 });

    const resolved202 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved202, 202, 'Tier 2A: Tab 202 with highest playback recency must be prioritized over older Tab 201 and focused Tab 203');
    console.log('  ✅ Tier 2A: Most recent playback timestamp in activeMediaSessions resolved');

    // Recency in mediaHistory array
    activeMediaSessions.clear();
    tabsInBrowser.set(211, { id: 211, url: 'https://podcast.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabsInBrowser.set(212, { id: 212, url: 'https://vimeo.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(211, { primaryMedia: { isPlaying: false, isMuted: false } });
    tabMediaMap.set(212, { primaryMedia: { isPlaying: false, isMuted: false } });

    mediaHistory.push({ tabId: 211, timestamp: now - 3000 });
    mediaHistory.push({ tabId: 212, timestamp: now - 500 });

    const resolved212 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved212, 212, 'Tier 2B: Tab 212 with most recent timestamp in mediaHistory must be resolved');
    console.log('  ✅ Tier 2B: mediaHistory recency fallback resolved');

    // Full execution with Tier 2
    const execRes = await sandbox.handleMuteAllOthersExecution(null);
    assert(execRes.success, 'handleMuteAllOthersExecution succeeds with Tier 2 candidate');
    assert.strictEqual(execRes.primaryTabId, 212, 'Primary tab resolved to 212');
    assert.strictEqual(tabsInBrowser.get(212).mutedInfo.muted, false, 'Tab 212 kept unmuted');
    assert.strictEqual(tabsInBrowser.get(211).mutedInfo.muted, true, 'Tab 211 muted');
    console.log('  ✅ Tier 2 Full Execution: Tab 212 resolved via recency and unmuted cleanly\n');
  }

  // =========================================================================
  // BATTERY 4: Tier 3 Candidate Resolution (Active Focused Browser Tab)
  // =========================================================================
  console.log('Battery 4: Tier 3 Candidate Resolution (Active Focused Browser Tab)');
  {
    const env = createTestSandbox();
    const { sandbox, tabsInBrowser } = env;

    // No active media, no sessions, no history
    tabsInBrowser.set(301, { id: 301, url: 'https://active-focus.com', active: true, audible: false, mutedInfo: { muted: false } });
    tabsInBrowser.set(302, { id: 302, url: 'https://background.com', active: false, audible: false, mutedInfo: { muted: false } });

    const resolved301 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved301, 301, 'Tier 3A: Active focused window tab must be resolved when no media is playing');
    console.log('  ✅ Tier 3A: Active focused tab resolved');

    // Restricted URL filtering
    tabsInBrowser.get(301).url = 'chrome://extensions';
    const resolved302 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved302, 302, 'Tier 3B: Restricted active tab (chrome://) must be bypassed in favor of valid web tab');
    console.log('  ✅ Tier 3B: Restricted URLs skipped in Tier 3 resolution');

    // Tier 4 fallback: no active tabs, choose first candidate
    tabsInBrowser.clear();
    tabsInBrowser.set(401, { id: 401, url: 'chrome://settings' }); // restricted
    tabsInBrowser.set(402, { id: 402, url: 'https://cand.org' });
    const resolved402 = await sandbox.resolveCandidatePrimaryTab(null);
    assert.strictEqual(resolved402, 402, 'Tier 4: First non-restricted candidate tab resolved when no active tab');
    console.log('  ✅ Tier 4: First non-restricted candidate tab fallback resolved\n');
  }

  // =========================================================================
  // BATTERY 5: Bidirectional Toggle & Snapshot Restoration
  // =========================================================================
  console.log('Battery 5: Bidirectional Toggle & Snapshot Restoration');
  {
    const env = createTestSandbox();
    const { sandbox, tabsInBrowser, tabMediaMap, muteOthersPreviousMuteStates } = env;

    // Initial State:
    // Tab 501: Unmuted (Candidate Primary)
    // Tab 502: PRE-MUTED (Was already muted before any toggle)
    // Tab 503: Unmuted
    tabsInBrowser.set(501, { id: 501, url: 'https://primary.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(501, { primaryMedia: { isPlaying: true, isMuted: false } });

    tabsInBrowser.set(502, { id: 502, url: 'https://premute.com', active: false, audible: false, mutedInfo: { muted: true } });
    tabMediaMap.set(502, { primaryMedia: { isPlaying: false, isMuted: true } });

    tabsInBrowser.set(503, { id: 503, url: 'https://other.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(503, { primaryMedia: { isPlaying: false, isMuted: false } });

    // Step 1: Execute handleMuteAllOthersExecution(501)
    console.log('  Step 1: Executing handleMuteAllOthersExecution(501)...');
    const muteRes = await sandbox.handleMuteAllOthersExecution(501);
    assert(muteRes.success, 'Mute execution must succeed');
    assert.strictEqual(muteRes.primaryTabId, 501);
    assert.strictEqual(muteRes.mutedCount, 2);

    // Verify tab states after mute
    assert.strictEqual(tabsInBrowser.get(501).mutedInfo.muted, false, 'Primary tab 501 remains unmuted');
    assert.strictEqual(tabsInBrowser.get(502).mutedInfo.muted, true, 'Tab 502 is muted');
    assert.strictEqual(tabsInBrowser.get(503).mutedInfo.muted, true, 'Tab 503 is muted');

    // Verify snapshot capture
    assert.strictEqual(muteOthersPreviousMuteStates.get(502), true, 'Snapshot must record Tab 502 was pre-muted');
    assert.strictEqual(muteOthersPreviousMuteStates.get(503), false, 'Snapshot must record Tab 503 was unmuted');
    console.log('  ✅ Step 1 Passed: Snapshot captured prior states accurately');

    // Step 2: Execute handleMuteAllOthersClearExecution()
    console.log('  Step 2: Executing handleMuteAllOthersClearExecution()...');
    const clearRes = await sandbox.handleMuteAllOthersClearExecution();
    assert(clearRes.success, 'Clear execution must succeed');
    assert(clearRes.cleared, 'Cleared flag must be true');
    assert.strictEqual(clearRes.restoredCount, 3, 'Must restore all snapshot tabs');

    // Verify tab states after restoration
    assert.strictEqual(tabsInBrowser.get(501).mutedInfo.muted, false, 'Primary tab 501 remains unmuted');
    assert.strictEqual(tabsInBrowser.get(502).mutedInfo.muted, true, 'Tab 502 restored to its PRE-MUTED state (muted: true)');
    assert.strictEqual(tabsInBrowser.get(503).mutedInfo.muted, false, 'Tab 503 restored to its UNMUTED state (muted: false)');
    assert.strictEqual(muteOthersPreviousMuteStates.size, 0, 'Snapshot map must be cleared after restore');
    console.log('  ✅ Step 2 Passed: Prior mute states cleanly restored\n');
  }

  // =========================================================================
  // BATTERY 6: In-page DOM Message Dispatch
  // =========================================================================
  console.log('Battery 6: In-page DOM Message Dispatch');
  {
    const env = createTestSandbox();
    const { sandbox, tabsInBrowser, tabMediaMap, sentControlMessages, sentRuntimeMessages } = env;

    tabsInBrowser.set(601, { id: 601, url: 'https://stream1.com', active: false, audible: true, mutedInfo: { muted: false } });
    tabMediaMap.set(601, { primaryMedia: { isPlaying: true, isMuted: false } });

    tabsInBrowser.set(602, { id: 602, url: 'https://stream2.com', active: false, audible: false, mutedInfo: { muted: false } });
    tabMediaMap.set(602, { primaryMedia: { isPlaying: false, isMuted: false } });

    // Execute mute all others
    await sandbox.handleMuteAllOthersExecution(601);

    // Assert DOM control messages sent
    const unmutePrimaryMsg = sentControlMessages.find(m => m.tabId === 601 && m.type === 'MEDIA_CONTROL' && m.action === 'unmute');
    assert(unmutePrimaryMsg, 'Must dispatch MEDIA_CONTROL unmute to primary tab 601');

    const muteSecondaryMsg = sentControlMessages.find(m => m.tabId === 602 && m.type === 'MEDIA_CONTROL' && m.action === 'mute');
    assert(muteSecondaryMsg, 'Must dispatch MEDIA_CONTROL mute to non-primary tab 602');

    const liveUpdateMsg = sentRuntimeMessages.find(m => m.type === 'LIVE_MEDIA_UPDATE');
    assert(liveUpdateMsg, 'Must broadcast LIVE_MEDIA_UPDATE runtime message');
    console.log('  ✅ DOM messages verified for Mute All Others: unmute to primary, mute to secondary');

    // Clear messages and test restoration DOM messages
    sentControlMessages.length = 0;
    await sandbox.handleMuteAllOthersClearExecution();

    const restoredUnmuteMsg = sentControlMessages.find(m => m.tabId === 602 && m.type === 'MEDIA_CONTROL' && m.action === 'unmute');
    assert(restoredUnmuteMsg, 'Must dispatch MEDIA_CONTROL unmute to restored tab 602');
    console.log('  ✅ DOM messages verified for Clear Mute All Others: unmute dispatched to restored tab\n');
  }

  // =========================================================================
  // BATTERY 7: Frontend resolvePrimaryMediaTabId and handleMuteAllOthers Verification
  // =========================================================================
  console.log('Battery 7: Frontend resolvePrimaryMediaTabId and handleMuteAllOthers Verification');
  {
    const feat = require(featurePath);

    // 7.1 resolvePrimaryMediaTabId unit tests
    assert.strictEqual(feat.resolvePrimaryMediaTabId([], 88), 88, 'Explicit tab ID returns immediately');
    assert.strictEqual(feat.resolvePrimaryMediaTabId([], null, 99), 99, 'currentSoloTabId returns when explicit tab ID null');

    // Active playing stream resolution
    const streams = [
      { tabId: 701, isPlaying: false, isMuted: false },
      { tabId: 702, isPlaying: true, isMuted: true },
      { tabId: 703, isPlaying: true, isMuted: false } // playing and unmuted
    ];
    const targetPlaying = feat.resolvePrimaryMediaTabId(streams, null, null);
    assert.strictEqual(targetPlaying, 703, 'Must prefer playing unmuted stream (703) over playing muted stream (702)');
    console.log('  ✅ Frontend resolvePrimaryMediaTabId prefers unmuted playing stream');

    // Recency resolution when none playing
    const nonPlayingStreams = [
      { tabId: 711, isPlaying: false, lastPlaybackTimestamp: 1000 },
      { tabId: 712, isPlaying: false, lastPlaybackTimestamp: 5000 },
      { tabId: 713, isPlaying: false, lastPlaybackTimestamp: 2000 }
    ];
    const targetRecent = feat.resolvePrimaryMediaTabId(nonPlayingStreams, null, null);
    assert.strictEqual(targetRecent, 712, 'Must resolve highest recency timestamp (712)');
    console.log('  ✅ Frontend resolvePrimaryMediaTabId resolves highest recency timestamp');

    // Empty stream list
    assert.strictEqual(feat.resolvePrimaryMediaTabId([]), 0, 'Empty streams list returns 0');

    // 7.2 handleMuteAllOthers two-way toggle integration
    const dispatchedIPC = [];
    const mockApi = {
      runtime: {
        sendMessage: (msg, cb) => {
          dispatchedIPC.push(msg);
          if (typeof cb === 'function') {
            cb({
              success: true,
              primaryTabId: msg.action === 'MEDIA_STREAM_MUTE_ALL_OTHERS' ? (msg.primaryTabId || 721) : undefined,
              cleared: msg.action === 'MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR'
            });
          }
        }
      }
    };

    const fakeBtn = {
      classes: new Set(['btn', 'btn-secondary']),
      classList: {
        add: (...c) => c.forEach(x => fakeBtn.classes.add(x)),
        remove: (...c) => c.forEach(x => fakeBtn.classes.delete(x)),
        contains: (x) => fakeBtn.classes.has(x)
      },
      textContent: ''
    };

    const testStreams = [
      { tabId: 721, isPlaying: true, isMuted: false },
      { tabId: 722, isPlaying: false, isMuted: false }
    ];
    feat.setCachedStreams(testStreams);
    feat.setIsMuteAllOthersActive(false);

    // Toggle 1: Turn ON
    await feat.handleMuteAllOthers(testStreams, null, {
      browserAPI: mockApi,
      btnMuteAllOthers: fakeBtn,
      t: (k) => k
    });

    assert.strictEqual(feat.getIsMuteAllOthersActive(), true, 'isMuteAllOthersActive is true');
    assert.strictEqual(dispatchedIPC.length, 1);
    assert.strictEqual(dispatchedIPC[0].action, 'MEDIA_STREAM_MUTE_ALL_OTHERS');
    assert.strictEqual(dispatchedIPC[0].primaryTabId, 721, 'Resolved primaryTabId 721 passed in payload');
    assert.strictEqual(testStreams[0].isMuted, false, 'Primary tab 721 is unmuted');
    assert.strictEqual(testStreams[1].isMuted, true, 'Non-primary tab 722 is muted');
    assert(fakeBtn.classList.contains('active'), 'Button has active class');
    console.log('  ✅ Frontend handleMuteAllOthers Toggle ON verified with candidate resolution');

    // Toggle 2: Turn OFF (Clear)
    dispatchedIPC.length = 0;
    await feat.handleMuteAllOthers(testStreams, null, {
      browserAPI: mockApi,
      btnMuteAllOthers: fakeBtn,
      t: (k) => k
    });

    assert.strictEqual(feat.getIsMuteAllOthersActive(), false, 'isMuteAllOthersActive toggles to false');
    assert.strictEqual(dispatchedIPC.length, 1);
    assert.strictEqual(dispatchedIPC[0].action, 'MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR');
    assert.strictEqual(testStreams[0].isMuted, false, 'Tab 721 unmuted');
    assert.strictEqual(testStreams[1].isMuted, false, 'Tab 722 restored to unmuted');
    assert(!fakeBtn.classList.contains('active'), 'Button active class removed');
    console.log('  ✅ Frontend handleMuteAllOthers Toggle OFF verified cleanly');

    // 7.3 dashboard.js facade verification
    const dash = require(dashPath);
    assert.strictEqual(typeof dash.resolvePrimaryMediaTabId, 'function');
    assert.strictEqual(typeof dash.handleMuteAllOthers, 'function');
    const dashResolvedId = dash.resolvePrimaryMediaTabId(testStreams, 999);
    assert.strictEqual(dashResolvedId, 999, 'dashboard.js facade delegates resolvePrimaryMediaTabId properly');
    console.log('  ✅ dashboard.js facades verified\n');

    console.log('🎉 ALL 7 BATTERIES IN test_mute_all_others_primary_tab_selection.js PASSED WITH 100% SUCCESS! (Exit Code 0)');
    process.exit(0);
  }
}

runBatteries().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
