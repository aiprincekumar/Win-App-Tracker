// 
const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Candidate Primary Tab Resolution & State Preservation Test Suite (Phase 01)...\n');

const bgPath = 'background.js';
const bgBuffer = fs.readFileSync(bgPath);
const bgRaw = fs.readFileSync(bgPath, 'utf8');

// =========================================================================
// BATTERY 1: UTF-8 BOM, Exports & Static Code Health
// =========================================================================
console.log('Battery 1: UTF-8 BOM, Function Length & Export Verification');

// 1.1 UTF-8 BOM check
const hasBOM = bgBuffer[0] === 0xEF && bgBuffer[1] === 0xBB && bgBuffer[2] === 0xBF;
assert(hasBOM, 'background.js must preserve UTF-8 with BOM (0xEF, 0xBB, 0xBF)');
console.log('  ✅ background.js verified UTF-8 with BOM');

// 1.2 Function presence and line counts (Universal Rule 28: <= 50 lines)
function extractFunction(name) {
  const rx = new RegExp(`async function ${name}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = bgRaw.match(rx);
  assert(m, `Function ${name} must be defined in background.js`);
  const lines = m[0].split('\n').length;
  assert(lines <= 50, `Function ${name} must be <= 50 lines (got ${lines})`);
  return { code: m[0], lines };
}

const resolveFn = extractFunction('resolveCandidatePrimaryTab');
console.log(`  ✅ resolveCandidatePrimaryTab verified: ${resolveFn.lines} lines (<= 50)`);

const muteOthersFn = extractFunction('handleMuteAllOthersExecution');
console.log(`  ✅ handleMuteAllOthersExecution verified: ${muteOthersFn.lines} lines (<= 50)`);

// 1.3 Exports check across globalThis, SentinelBackgroundModules, and module.exports
assert(bgRaw.includes('globalThis.resolveCandidatePrimaryTab = resolveCandidatePrimaryTab;'), 'Exported on globalThis');
assert(bgRaw.includes('globalThis.SentinelBackgroundModules.resolveCandidatePrimaryTab = resolveCandidatePrimaryTab;'), 'Exported on SentinelBackgroundModules');
assert(bgRaw.includes('resolveCandidatePrimaryTab,'), 'Exported in module.exports');
console.log('  ✅ resolveCandidatePrimaryTab exported across globalThis, SentinelBackgroundModules & module.exports\n');

// =========================================================================
// BATTERY 2: Waterfall Candidate Selection Algorithm Verification
// =========================================================================
console.log('Battery 2: Candidate Resolution Waterfall Verification (Tiers 0 - 4)');

async function runWaterfallBattery() {
  const sandbox = {};
  vm.createContext(sandbox);

  // Load functions into sandbox
  const helperCode = `
    const isRestrictedTabUrl = (url) => {
      if (!url || typeof url !== 'string') return true;
      const u = url.trim().toLowerCase();
      return u.startsWith('chrome://') || u.startsWith('chrome-extension://') || u.startsWith('edge://') || u.startsWith('about:');
    };
    ${resolveFn.code}
  `;
  vm.runInContext(helperCode, sandbox);

  // Sub-battery 2.0: Tier 0 - Explicit valid primaryTabId passed
  const t0_1 = await sandbox.resolveCandidatePrimaryTab(505);
  assert.strictEqual(t0_1, 505, 'Tier 0: Valid number primaryTabId must be returned immediately');
  const t0_2 = await sandbox.resolveCandidatePrimaryTab('808');
  assert.strictEqual(t0_2, 808, 'Tier 0: String representation of valid tabId must be parsed and returned');
  console.log('  ✅ Tier 0: Direct primaryTabId resolution passed');

  // Sub-battery 2.1: Tier 1 - Actively playing stream
  // Case A: tabMediaMap has isPlaying
  const mockTabMedia = new Map();
  mockTabMedia.set(101, { primaryMedia: { isPlaying: true, isMuted: false } });
  mockTabMedia.set(102, { primaryMedia: { isPlaying: false, isMuted: false } });
  const t1_a = await sandbox.resolveCandidatePrimaryTab(0, null, mockTabMedia, new Map(), []);
  assert.strictEqual(t1_a, 101, 'Tier 1A: tabMediaMap playing stream selected');

  // Case B: activeMediaSessions has isPlaying
  const mockSessions = new Map();
  mockSessions.set(202, { tabId: 202, isPlaying: true, playbackState: 'playing' });
  const t1_b = await sandbox.resolveCandidatePrimaryTab(0, null, new Map(), mockSessions, []);
  assert.strictEqual(t1_b, 202, 'Tier 1B: activeMediaSessions playing stream selected');

  // Case C: browserAPI audible tabs query
  const mockApiAudible = {
    tabs: {
      query: async (q) => {
        if (q.audible) return [{ id: 303, url: 'https://youtube.com/watch?v=abc', audible: true }];
        return [];
      }
    }
  };
  const t1_c = await sandbox.resolveCandidatePrimaryTab(0, mockApiAudible, new Map(), new Map(), []);
  assert.strictEqual(t1_c, 303, 'Tier 1C: tabs.query audible tab selected');
  console.log('  ✅ Tier 1: Actively playing stream resolution passed (tabMediaMap, activeMediaSessions, audible tabs)');

  // Sub-battery 2.2: Tier 2 - Last playing / Recency fallback
  const mockSessionsRecent = new Map();
  mockSessionsRecent.set(401, { tabId: 401, isPlaying: false, lastPlaybackTimestamp: 1000 });
  mockSessionsRecent.set(402, { tabId: 402, isPlaying: false, lastPlaybackTimestamp: 5000 });
  mockSessionsRecent.set(403, { tabId: 403, isPlaying: false, lastPlaybackTimestamp: 3000 });
  const mockTabMediaOpen = new Map([[401, {}], [402, {}], [403, {}]]);
  const t2_a = await sandbox.resolveCandidatePrimaryTab(0, null, mockTabMediaOpen, mockSessionsRecent, []);
  assert.strictEqual(t2_a, 402, 'Tier 2A: session with highest recency timestamp selected');

  // Case B: mediaHistory recency
  const mockHistory = [
    { tabId: 501, lastUpdated: 2000 },
    { tabId: 502, lastUpdated: 9000 },
    { tabId: 503, lastUpdated: 4000 }
  ];
  const mockMediaOpenHistory = new Map([[501, {}], [502, {}], [503, {}]]);
  const t2_b = await sandbox.resolveCandidatePrimaryTab(0, null, mockMediaOpenHistory, new Map(), mockHistory);
  assert.strictEqual(t2_b, 502, 'Tier 2B: mediaHistory with highest timestamp selected');
  console.log('  ✅ Tier 2: Recency fallback resolution passed');

  // Sub-battery 2.3: Tier 3 - Active focused tab fallback
  const mockApiActive = {
    tabs: {
      query: async (q) => {
        if (q.active && q.lastFocusedWindow) {
          return [{ id: 601, url: 'https://github.com', active: true }];
        }
        return [];
      }
    }
  };
  const t3 = await sandbox.resolveCandidatePrimaryTab(0, mockApiActive, new Map(), new Map(), []);
  assert.strictEqual(t3, 601, 'Tier 3: Active focused window tab selected');
  console.log('  ✅ Tier 3: Active focused tab fallback passed');

  // Sub-battery 2.4: Tier 4 - First candidate in tabMediaMap or tabs.query
  const mockFirstMedia = new Map([
    [701, { primaryMedia: { isPlaying: false } }],
    [702, { primaryMedia: { isPlaying: false } }]
  ]);
  const t4_a = await sandbox.resolveCandidatePrimaryTab(0, null, mockFirstMedia, new Map(), []);
  assert.strictEqual(t4_a, 701, 'Tier 4A: First entry of tabMediaMap selected');

  const mockApiAllTabs = {
    tabs: {
      query: async (q) => {
        return [
          { id: 801, url: 'chrome://settings' }, // restricted, should skip
          { id: 802, url: 'https://wikipedia.org' } // candidate
        ];
      }
    }
  };
  const t4_b = await sandbox.resolveCandidatePrimaryTab(0, mockApiAllTabs, new Map(), new Map(), []);
  assert.strictEqual(t4_b, 802, 'Tier 4B: First non-restricted candidate tab from tabs.query selected');
  console.log('  ✅ Tier 4: First candidate tab fallback passed\n');
}

// =========================================================================
// BATTERY 3: handleMuteAllOthersExecution Functional Simulation
// =========================================================================
console.log('Battery 3: handleMuteAllOthersExecution End-to-End Simulation');

async function runMuteAllOthersBattery() {
  const tabsInBrowser = new Map();
  const tabMediaMap = new Map();
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
      query: async (q) => {
        const all = Array.from(tabsInBrowser.values());
        if (q.active && q.lastFocusedWindow) return all.filter(t => t.active);
        if (q.audible) return all.filter(t => t.audible);
        return all;
      }
    }
  };

  const isRestrictedTabUrl = (url) => {
    if (!url || typeof url !== 'string') return true;
    const u = url.trim().toLowerCase();
    return u.startsWith('chrome://') || u.startsWith('chrome-extension://');
  };

  const sandbox = {
    browserAPI: mockBrowserAPI,
    tabMediaMap,
    activeMediaSessions: new Map(),
    mediaHistory: [],
    muteOthersPreviousMuteStates: new Map(),
    isRestrictedTabUrl,
    safeSendTabMessage: (tabId, msg) => {
      sentControlMessages.push({ tabId, ...msg });
    },
    safeSendRuntimeMessage: (msg) => {
      if (msg && msg.type === 'LIVE_MEDIA_UPDATE') broadcastCount++;
    },
    synthesizeGlobalMediaState: () => ({ isPlaying: true }),
    capturePreMuteSnapshot: async (snapshotMap) => {
      snapshotMap.clear();
      for (const [id, tab] of tabsInBrowser.entries()) {
        snapshotMap.set(id, Boolean(tab.mutedInfo && tab.mutedInfo.muted));
      }
    },
    collectCandidateTabs: async (excludeId) => {
      const set = new Set();
      for (const [id, tab] of tabsInBrowser.entries()) {
        if (id !== excludeId && !isRestrictedTabUrl(tab.url)) {
          set.add(id);
        }
      }
      return set;
    }
  };

  vm.createContext(sandbox);
  vm.runInContext(`${resolveFn.code}\n\n${muteOthersFn.code}`, sandbox);

  // Setup tabs:
  // Tab 10: Playing video on YouTube (should be primary)
  tabsInBrowser.set(10, { id: 10, url: 'https://youtube.com', active: false, audible: true, mutedInfo: { muted: false } });
  tabMediaMap.set(10, { primaryMedia: { isPlaying: true, isMuted: false } });

  // Tab 20: Background podcast on Spotify (was unmuted)
  tabsInBrowser.set(20, { id: 20, url: 'https://spotify.com', active: false, audible: true, mutedInfo: { muted: false } });
  tabMediaMap.set(20, { primaryMedia: { isPlaying: true, isMuted: false } });

  // Tab 30: Background Vimeo video (was already muted)
  tabsInBrowser.set(30, { id: 30, url: 'https://vimeo.com', active: false, audible: false, mutedInfo: { muted: true } });
  tabMediaMap.set(30, { primaryMedia: { isPlaying: false, isMuted: true } });

  // Execute handleMuteAllOthersExecution with NO explicit tab ID (simulate auto-candidate resolution)
  console.log('  Executing handleMuteAllOthersExecution without explicit primaryTabId...');
  const res = await sandbox.handleMuteAllOthersExecution();

  assert(res.success === true, 'Execution must succeed');
  assert.strictEqual(res.primaryTabId, 10, 'Primary tab must resolve to Tab 10 via waterfall');
  assert.strictEqual(res.mutedCount, 2, 'Must mute 2 other candidate tabs (Tab 20 & 30)');
  assert(res.timestamp > 0, 'Must include timestamp');

  // Verify tab 10 unmuted
  assert.strictEqual(tabsInBrowser.get(10).mutedInfo.muted, false, 'Primary tab 10 remains unmuted');
  assert.strictEqual(tabMediaMap.get(10).primaryMedia.isMuted, false, 'Primary tab media model isMuted is false');

  // Verify tabs 20 and 30 muted
  assert.strictEqual(tabsInBrowser.get(20).mutedInfo.muted, true, 'Tab 20 is muted at tab level');
  assert.strictEqual(tabMediaMap.get(20).primaryMedia.isMuted, true, 'Tab 20 media model isMuted is true');
  assert.strictEqual(tabsInBrowser.get(30).mutedInfo.muted, true, 'Tab 30 is muted at tab level');

  // Verify DOM control messages sent
  const unmuteMsg = sentControlMessages.find(m => m.tabId === 10 && m.action === 'unmute');
  assert(unmuteMsg, 'DOM unmute message sent to primary tab 10');
  const muteMsg20 = sentControlMessages.find(m => m.tabId === 20 && m.action === 'mute');
  assert(muteMsg20, 'DOM mute message sent to tab 20');

  // Verify pre-mute snapshot captured prior states accurately
  assert.strictEqual(sandbox.muteOthersPreviousMuteStates.get(20), false, 'Tab 20 captured as unmuted in snapshot');
  assert.strictEqual(sandbox.muteOthersPreviousMuteStates.get(30), true, 'Tab 30 captured as muted in snapshot');

  console.log('  ✅ handleMuteAllOthersExecution executed waterfall candidate resolution, snapshotting & tab/DOM muting cleanly');
}

(async () => {
  try {
    await runWaterfallBattery();
    await runMuteAllOthersBattery();
    console.log('🎉 ALL BATTERIES IN test_candidate_primary_tab_resolution.js PASSED WITH 100% SUCCESS! (Exit Code 0)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  }
})();
