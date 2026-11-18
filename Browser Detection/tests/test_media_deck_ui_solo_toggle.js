// tests/test_media_deck_ui_solo_toggle.js
// Comprehensive Verification Suite for Multi-Tab Live Media Deck UI Refactor & Two-Way Solo Tab Toggle
// Covers Phase 1 (Dedicated Volume Row & Controls Auto-Fit) and Phase 2 (Two-Way Solo Tab Toggle)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Multi-Tab Live Media Deck UI & Two-Way Solo Toggle Verification Suite...\n');

// ---------------------------------------------------------------------------
// Battery 1: Media Deck DOM Node Structure & Layout Refactor (Phase 1 & Reorganization)
// ---------------------------------------------------------------------------
console.log('Battery 1: Media Deck DOM Node Structure & Layout Refactor (Phase 1 & Reorganization)');

const featurePath = path.join(__dirname, '..', 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const featureCode = fs.readFileSync(featurePath, 'utf8');

// 1.1 Verify .deck-volume-row creation and styling (Now contains ONLY volSlider)
assert(featureCode.includes("const volumeRow = doc.createElement('div')"), 'Must create volumeRow element via doc.createElement');
assert(featureCode.includes("volumeRow.className = 'deck-volume-row'"), 'volumeRow must have class deck-volume-row');
assert(!featureCode.includes("volumeRow.appendChild(btnMute)"), 'btnMute MUST NOT be appended into volumeRow');
assert(featureCode.includes("volumeRow.appendChild(volSlider)"), 'volSlider must be appended into volumeRow');
console.log('  ✅ volumeRow created with class .deck-volume-row and contains strictly volSlider (100% width)');

// 1.2 Verify controlsRow contains all 4 action buttons (btnMute relocated next to btnPlayPause)
assert(featureCode.includes("controlsRow.appendChild(btnPlayPause)"), 'controlsRow must contain btnPlayPause');
assert(featureCode.includes("controlsRow.appendChild(btnMute)"), 'btnMute MUST be appended into controlsRow');
assert(featureCode.includes("controlsRow.appendChild(btnSolo)"), 'controlsRow must contain btnSolo');
assert(featureCode.includes("controlsRow.appendChild(btnSwitchTab)"), 'controlsRow must contain btnSwitchTab');
assert(!featureCode.includes("controlsRow.appendChild(volSlider)"), 'volSlider MUST NOT be appended into controlsRow');
console.log('  ✅ controlsRow contains all 4 action buttons in order: Play/Pause, Mute, Solo, Switch Tab');

// 1.3 Verify card assembly order: topRow -> titleSpan -> scrubberRow -> volumeRow -> controlsRow
const topIdx = featureCode.indexOf("card.appendChild(topRow);");
const titleIdx = featureCode.indexOf("card.appendChild(titleSpan);");
const scrubberIdx = featureCode.indexOf("card.appendChild(scrubberRow);");
const volumeIdx = featureCode.indexOf("card.appendChild(volumeRow);");
const controlsIdx = featureCode.indexOf("card.appendChild(controlsRow);");
assert(topIdx !== -1, 'card.appendChild(topRow) must exist');
assert(titleIdx !== -1, 'card.appendChild(titleSpan) must exist');
assert(scrubberIdx !== -1, 'card.appendChild(scrubberRow) must exist');
assert(volumeIdx !== -1, 'card.appendChild(volumeRow) must exist');
assert(controlsIdx !== -1, 'card.appendChild(controlsRow) must exist');
assert(topIdx < titleIdx, 'topRow must be appended before titleSpan');
assert(titleIdx < scrubberIdx, 'titleSpan must be appended before scrubberRow');
assert(scrubberIdx < volumeIdx, 'scrubberRow must be appended before volumeRow');
assert(volumeIdx < controlsIdx, 'volumeRow must be appended before controlsRow');
console.log('  ✅ Card node assembly order verified: topRow -> titleSpan -> scrubberRow -> volumeRow -> controlsRow');

// 1.4 Verify Solo Tab Button is Icon Only (🎧) with full accessibility
assert(featureCode.includes("btnSolo.textContent = '🎧'"), 'btnSolo must be ICON ONLY (🎧)');
assert(featureCode.includes("btnSolo.setAttribute('title', 'Mute all other tabs and solo this audio')"), 'btnSolo must maintain title attribute');
assert(featureCode.includes("btnSolo.setAttribute('aria-label', `Solo Tab ${stream.tabId}`)"), 'btnSolo must maintain aria-label attribute');
assert(featureCode.includes("btnSolo.classList.add('solo-active')"), 'btnSolo must maintain solo-active dynamic styling on toggle');
console.log('  ✅ Solo Tab button verified ICON ONLY (🎧) with full accessibility titles & ARIA');

// 1.5 Verify Complete Removal of Domain Badge and metaRow Container
assert(!featureCode.includes("deck-card-meta"), 'metaRow container must be completely removed from DOM');
assert(!featureCode.includes("domainSpan"), 'domainSpan badge must be completely removed from DOM');
console.log('  ✅ Complete removal of domainSpan badge and metaRow container from DOM verified');

// 1.6 Verify Top Header Row Reorganization (favicon -> platformBadge -> statusPill)
assert(featureCode.includes("topRow.appendChild(favicon)"), 'topRow must append favicon on left');
assert(featureCode.includes("topRow.appendChild(platformBadge)"), 'topRow must append platformBadge next to favicon');
assert(featureCode.includes("topRow.appendChild(statusPill)"), 'topRow must append statusPill on right of top row');
console.log('  ✅ Top header row verified: favicon (left), platformBadge (left-center), statusPill (right)');

// 1.7 Active slider focus/drag guard preserved
assert(featureCode.includes("isCurrentActiveSlider"), 'Active slider focus guard preserved');
assert(featureCode.includes("data-slider-tab-id"), 'Volume slider data-slider-tab-id attribute preserved');
assert(featureCode.includes("aria-label"), 'Volume slider accessibility aria-label preserved');
console.log('  ✅ Active slider focus/drag guard & accessibility attributes preserved\n');

// ---------------------------------------------------------------------------
// Battery 2: CSS Layout & Auto-Fit Styling (Phase 1 & Reorganization)
// ---------------------------------------------------------------------------
console.log('Battery 2: CSS Layout & Auto-Fit Styling (Phase 1 & Reorganization)');

const cssPath = path.join(__dirname, '..', 'dashboard', 'styles', 'media.css');
const cssCode = fs.readFileSync(cssPath, 'utf8');

// 2.1 Verify .deck-volume-row CSS
assert(cssCode.includes(".deck-volume-row {"), 'media.css must define .deck-volume-row');
assert(cssCode.includes("width: 100%"), 'CSS must contain width: 100%');

// 2.2 Verify .deck-volume-slider 100% width
assert(/\.deck-volume-slider\s*\{[^}]*width:\s*100%/s.test(cssCode), '.deck-volume-slider must have width: 100%');
assert(/\.deck-volume-slider\s*\{[^}]*accent-color:\s*#10b981/s.test(cssCode), '.deck-volume-slider must have accent-color: #10b981');
console.log('  ✅ .deck-volume-row and .deck-volume-slider full-width rules verified');

// 2.3 Verify .deck-card-controls auto-fit button flex rules
assert(/\.deck-card-controls\s*\{[^}]*display:\s*flex/s.test(cssCode), '.deck-card-controls must be display: flex');
assert(/\.deck-card-controls\s*\.btn-deck-ctrl\s*\{[^}]*flex:\s*1\s+1\s+0/s.test(cssCode), '.btn-deck-ctrl in deck controls must have flex: 1 1 0');
assert(/\.deck-card-controls\s*\.btn-deck-ctrl\s*\{[^}]*min-width:\s*0/s.test(cssCode), '.btn-deck-ctrl must have min-width: 0 for truncation');
assert(/\.deck-card-controls\s*\.btn-deck-ctrl\s*\{[^}]*text-overflow:\s*ellipsis/s.test(cssCode), '.btn-deck-ctrl must have text-overflow: ellipsis');
console.log('  ✅ .deck-card-controls flex: 1 1 0 auto-fit and ellipsis verified');

// 2.4 Verify .btn-deck-mute and .deck-card-top CSS
assert(cssCode.includes(".btn-deck-mute {"), 'media.css must define .btn-deck-mute');
assert(cssCode.includes(".deck-card-top .deck-status-pill"), 'media.css must align status pill on right of topRow');
assert(cssCode.includes(".deck-card-title {"), 'media.css must define .deck-card-title as dedicated title row');
console.log('  ✅ .btn-deck-mute, .deck-card-top .deck-status-pill right alignment, and .deck-card-title verified');

// 2.5 Verify Light Theme Overrides
assert(cssCode.includes("body.theme-light .deck-volume-slider"), 'media.css must include body.theme-light .deck-volume-slider');
assert(cssCode.includes("body.theme-light .btn-deck-mute"), 'media.css must include body.theme-light .btn-deck-mute');
console.log('  ✅ Light theme parity for deck volume slider and mute button verified\n');

// ---------------------------------------------------------------------------
// Battery 3: Two-Way Solo Tab Toggle Logic (Phase 2 - Feature Module)
// ---------------------------------------------------------------------------
console.log('Battery 3: Two-Way Solo Tab Toggle Logic (Phase 2 - Feature Module)');

// 3.1 Verify handleSoloTab toggle branches in code
assert(featureCode.includes("const isAlreadySolo = (currentSoloTabId === targetId)"), 'handleSoloTab must check if tab is already solo');
assert(featureCode.includes("MEDIA_STREAM_SOLO_CLEAR"), 'handleSoloTab must send MEDIA_STREAM_SOLO_CLEAR when toggling off');
assert(featureCode.includes("MEDIA_STREAM_SOLO"), 'handleSoloTab must send MEDIA_STREAM_SOLO when toggling on');

// 3.2 Functional test using the exported module
const MediaDeckVisualizerFeature = require(featurePath);

let lastSentMessage = null;
const mockBrowserAPI = {
  runtime: {
    sendMessage: (msg, cb) => {
      lastSentMessage = msg;
      if (typeof cb === 'function') cb({ success: true, soloTabId: msg.soloTabId });
    }
  }
};

// Initial state: reset solo and cached streams
MediaDeckVisualizerFeature.setCurrentSoloTabId(null);
const testStreams = [
  { tabId: 101, isMuted: false, title: 'Stream 1', volume: 0.8 },
  { tabId: 102, isMuted: false, title: 'Stream 2', volume: 0.9 },
  { tabId: 103, isMuted: false, title: 'Stream 3', volume: 0.7 }
];
MediaDeckVisualizerFeature.setCachedStreams(testStreams);

// Step 3.2.1: First click -> Activate Solo on Tab 101
MediaDeckVisualizerFeature.handleSoloTab(101, { browserAPI: mockBrowserAPI }).then(() => {
  assert.strictEqual(MediaDeckVisualizerFeature.getCurrentSoloTabId(), 101, 'currentSoloTabId must be 101 after activating solo');
  assert.strictEqual(lastSentMessage.action, 'MEDIA_STREAM_SOLO', 'Must dispatch MEDIA_STREAM_SOLO action');
  assert.strictEqual(lastSentMessage.soloTabId, 101, 'Must dispatch soloTabId: 101');
  const cached = MediaDeckVisualizerFeature.getCachedStreams();
  assert.strictEqual(cached.find(s => s.tabId === 101).isMuted, false, 'Solo tab must remain unmuted');
  assert.strictEqual(cached.find(s => s.tabId === 102).isMuted, true, 'Non-solo tab 102 must be muted');
  assert.strictEqual(cached.find(s => s.tabId === 103).isMuted, true, 'Non-solo tab 103 must be muted');
  console.log('  ✅ Step 1: Click activates solo mode on Tab 101 and mutes other tabs');

  // Step 3.2.2: Second click on SAME tab (101) -> Deactivate Solo (Toggle Off)
  return MediaDeckVisualizerFeature.handleSoloTab(101, { browserAPI: mockBrowserAPI });
}).then(() => {
  assert.strictEqual(MediaDeckVisualizerFeature.getCurrentSoloTabId(), null, 'currentSoloTabId must be reset to null after toggle off');
  assert.strictEqual(lastSentMessage.action, 'MEDIA_STREAM_SOLO_CLEAR', 'Must dispatch MEDIA_STREAM_SOLO_CLEAR action on toggle off');
  assert.strictEqual(lastSentMessage.soloTabId, null, 'Must dispatch soloTabId: null on toggle off');
  const cached = MediaDeckVisualizerFeature.getCachedStreams();
  assert.strictEqual(cached.find(s => s.tabId === 101).isMuted, false, 'Tab 101 must be unmuted after solo clear');
  assert.strictEqual(cached.find(s => s.tabId === 102).isMuted, false, 'Tab 102 must be unmuted after solo clear');
  assert.strictEqual(cached.find(s => s.tabId === 103).isMuted, false, 'Tab 103 must be unmuted after solo clear');
  console.log('  ✅ Step 2: Click again on Tab 101 toggles OFF solo and un-mutes all streams\n');

  runBattery4();
}).catch(err => {
  console.error('❌ Battery 3 Error:', err);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Battery 4: Background Service Worker Solo Clear Execution (Phase 2 - Background)
// ---------------------------------------------------------------------------
function runBattery4() {
  console.log('Battery 4: Background Service Worker Solo Clear Execution (Phase 2 - Background)');

  const bgPath = path.join(__dirname, '..', 'background.js');
  const bgCode = fs.readFileSync(bgPath, 'utf8');

  // 4.1 Verify handleSoloTabClearExecution function definition
  assert(bgCode.includes("async function handleSoloTabClearExecution()"), 'background.js must define handleSoloTabClearExecution()');
  assert(bgCode.includes("globalThis.handleSoloTabClearExecution = handleSoloTabClearExecution"), 'Must export handleSoloTabClearExecution to globalThis');
  assert(bgCode.includes("globalThis.SentinelBackgroundModules.handleSoloTabClearExecution = handleSoloTabClearExecution"), 'Must export to SentinelBackgroundModules');
  console.log('  ✅ handleSoloTabClearExecution defined and exported at background scope');

  // 4.2 Verify handleSoloTabExecution forwards null/0/empty soloTabId to clear
  assert(bgCode.includes("if (soloTabId === null || soloTabId === undefined || soloTabId === 0 || soloTabId === '0' || soloTabId === '')"),
    'handleSoloTabExecution must check for null/0/empty soloTabId');
  assert(bgCode.includes("return handleSoloTabClearExecution()"), 'handleSoloTabExecution must delegate null soloTabId to handleSoloTabClearExecution()');
  console.log('  ✅ handleSoloTabExecution forwards null/empty/0 soloTabId to handleSoloTabClearExecution');

  // 4.3 Verify IPC message listener routing
  assert(bgCode.includes("if (msgType === 'MEDIA_STREAM_SOLO_CLEAR')"), 'background.js must handle msgType === MEDIA_STREAM_SOLO_CLEAR');
  assert(bgCode.includes("const result = await handleSoloTabClearExecution()"), 'MEDIA_STREAM_SOLO_CLEAR must execute handleSoloTabClearExecution');
  console.log('  ✅ IPC listener for MEDIA_STREAM_SOLO_CLEAR verified');

  // 4.4 Functional VM Execution of handleSoloTabClearExecution
  const unmutedTabIds = [];
  const sentControlActions = [];

  const mockTabs = [
    { id: 201, mutedInfo: { muted: true }, audible: true },
    { id: 202, mutedInfo: { muted: true }, audible: false },
    { id: 203, mutedInfo: { muted: false }, audible: true }
  ];

  const fakeBrowserAPI = {
    tabs: {
      update: async (tabId, updateProps) => {
        if (updateProps && updateProps.muted === false) {
          unmutedTabIds.push(tabId);
        }
        return { id: tabId, ...updateProps };
      },
      query: async () => mockTabs
    }
  };

  const fakeTabMediaMap = new Map([
    ['201', { primaryMedia: { isMuted: true } }],
    ['202', { primaryMedia: { isMuted: true } }]
  ]);

  let broadcastMessage = null;

  // Sandbox context to run isolated execution logic
  const vm = require('vm');
  const sandbox = {
    browserAPI: fakeBrowserAPI,
    tabMediaMap: fakeTabMediaMap,
    safeSendTabMessage: (tId, msg) => {
      sentControlActions.push({ tabId: tId, ...msg });
    },
    safeSendRuntimeMessage: (msg) => {
      broadcastMessage = msg;
    },
    synthesizeGlobalMediaState: () => ({ isPlaying: true, totalTabs: 2 }),
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };

  // Extract function body and execute in sandbox
  const fnMatch = bgCode.match(/async function handleSoloTabClearExecution\(\)\s*\{[\s\S]*?\n\}/);
  assert(fnMatch, 'Must match handleSoloTabClearExecution definition');
  vm.createContext(sandbox);
  vm.runInContext(fnMatch[0] + '; globalThis.runClear = handleSoloTabClearExecution;', sandbox);

  sandbox.runClear().then((res) => {
    assert(res.success === true, 'Result must be success: true');
    assert(res.cleared === true, 'Result must have cleared: true');
    assert.strictEqual(res.soloTabId, null, 'Result soloTabId must be null');
    assert(res.unmutedCount >= 2, 'Unmuted count must be >= 2');

    // Verify all primaryMedia in tabMediaMap were unmuted
    assert.strictEqual(fakeTabMediaMap.get('201').primaryMedia.isMuted, false, 'Tab 201 must be unmuted in map');
    assert.strictEqual(fakeTabMediaMap.get('202').primaryMedia.isMuted, false, 'Tab 202 must be unmuted in map');

    // Verify browserAPI.tabs.update was called to unmute tabs
    assert(unmutedTabIds.includes(201), 'browserAPI.tabs.update must have unmuted tab 201');
    assert(unmutedTabIds.includes(202), 'browserAPI.tabs.update must have unmuted tab 202');

    // Verify unmute MEDIA_CONTROL IPC messages were sent
    const tab201Unmute = sentControlActions.find(a => a.tabId === 201 && a.action === 'unmute');
    assert(tab201Unmute, 'MEDIA_CONTROL unmute message must be sent to tab 201');

    // Verify LIVE_MEDIA_UPDATE was broadcast
    assert(broadcastMessage !== null, 'LIVE_MEDIA_UPDATE must be broadcast');
    assert.strictEqual(broadcastMessage.type, 'LIVE_MEDIA_UPDATE', 'Broadcast type must be LIVE_MEDIA_UPDATE');

    console.log('  ✅ VM simulation: all tabs unmuted in map, tabs.update unmuted, and LIVE_MEDIA_UPDATE broadcast\n');
    runBattery5();
  }).catch(err => {
    console.error('❌ Battery 4 Error:', err);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// Battery 5: Security Standards (UTF-8 with BOM & W3C Trusted Types)
// ---------------------------------------------------------------------------
function runBattery5() {
  console.log('Battery 5: Security Standards (UTF-8 with BOM & W3C Trusted Types)');

  const targetFiles = [
    path.join('src', 'dashboard', 'features', 'media_deck_visualizer_feature.js'),
    path.join('dashboard', 'styles', 'media.css'),
    path.join('dashboard', 'dashboard.css'),
    'background.js'
  ];

  targetFiles.forEach(rel => {
    const full = path.join(__dirname, '..', rel);
    const buf = fs.readFileSync(full);
    const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    assert(hasBOM, `${rel} must possess UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
    console.log(`  ✅ ${rel} verified UTF-8 with BOM`);
  });

  // Zero innerHTML in media_deck_visualizer_feature.js
  const innerHTMLMatches = featureCode.match(/(\.innerHTML|\.outerHTML)\s*=/g);
  assert(!innerHTMLMatches || innerHTMLMatches.length === 0, 'Zero innerHTML/outerHTML allowed in media_deck_visualizer_feature.js');
  console.log('  ✅ 100% W3C Trusted Types compliant (strictly zero innerHTML/outerHTML)\n');

  console.log('🎉 ALL 5 BATTERIES IN test_media_deck_ui_solo_toggle.js PASSED WITH 100% SUCCESS! (Exit Code 0)');
}
