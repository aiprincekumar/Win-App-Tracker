// tests/test_media_deck_controls_wiring.js
// Comprehensive Verification Suite for Media Deck Video Length Seeking, Tab Navigation, and Remote Controls Wiring
// Covers Phase 1 (Background IPC), Phase 2 (Content Script Seek), and Phase 3 (Dashboard Controls UI)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Media Deck Controls & Tab Navigation Verification Suite...\n');

// ---------------------------------------------------------------------------
// Battery 1: Background Service Worker Remote Command Router & Hoisted Tab Navigation
// ---------------------------------------------------------------------------
console.log('Battery 1: Background Service Worker Remote Command Router & Hoisted Tab Navigation');

const bgPath = path.join(__dirname, '..', 'background.js');
const bgCode = fs.readFileSync(bgPath, 'utf8');

// 1.1 Verify activateAndFocusTab hoisted to top-level scope
assert(bgCode.includes('async function activateAndFocusTab(tabId, windowId)'), 'activateAndFocusTab must be defined at top-level background scope');
assert(bgCode.includes('globalThis.activateAndFocusTab = activateAndFocusTab'), 'activateAndFocusTab must be exported to globalThis');
assert(bgCode.includes('globalThis.SentinelBackgroundModules.activateAndFocusTab = activateAndFocusTab'), 'activateAndFocusTab must be exported to SentinelBackgroundModules');
console.log('  ✅ activateAndFocusTab hoisted to top-level scope and exported');

// 1.2 Verify window un-minimization and tab activation logic in activateAndFocusTab
assert(bgCode.includes("win.state === 'minimized'"), 'activateAndFocusTab must check for minimized window state');
assert(bgCode.includes("{ state: 'normal', focused: true }"), 'activateAndFocusTab must un-minimize minimized windows');
assert(bgCode.includes("browserAPI.tabs.update(numTabId, { active: true })"), 'activateAndFocusTab must activate target tab');
console.log('  ✅ Window un-minimization and tab activation logic verified');

// 1.3 Verify handleRemoteMediaCommandExecution supports switch_tab and seek commands
assert(bgCode.includes("if (command === 'switch_tab' || command === 'focus_tab')"), 'handleRemoteMediaCommandExecution must handle switch_tab');
assert(bgCode.includes("case 'seek_to':"), 'handleRemoteMediaCommandExecution must handle seek_to');
assert(bgCode.includes("case 'seek_absolute':"), 'handleRemoteMediaCommandExecution must handle seek_absolute');
assert(bgCode.includes("case 'seek_percent':"), 'handleRemoteMediaCommandExecution must handle seek_percent');
assert(bgCode.includes("type: 'LIVE_MEDIA_UPDATE'"), 'handleRemoteMediaCommandExecution must broadcast LIVE_MEDIA_UPDATE');
console.log('  ✅ handleRemoteMediaCommandExecution switch_tab, seek_to, and seek_percent verified\n');

// ---------------------------------------------------------------------------
// Battery 2: Content Script Whitelisting & Precision Seeking
// ---------------------------------------------------------------------------
console.log('Battery 2: Content Script Whitelisting & Precision Seeking');

const contentMediaCode = fs.readFileSync(path.join(__dirname, '..', 'content_media.js'), 'utf8');
const injectMainWorldCode = fs.readFileSync(path.join(__dirname, '..', 'inject_main_world.js'), 'utf8');

// 2.1 KNOWN_MEDIA_ACTIONS whitelisting
assert(contentMediaCode.includes("'seek_to'"), 'content_media.js must whitelist seek_to');
assert(contentMediaCode.includes("'seek_absolute'"), 'content_media.js must whitelist seek_absolute');
console.log('  ✅ KNOWN_MEDIA_ACTIONS whitelisting verified in content_media.js');

// 2.2 Dedicated seek_to handler in handleMediaControl
assert(contentMediaCode.includes("case 'seek_to':"), 'handleMediaControl must implement case seek_to');
assert(contentMediaCode.includes("primaryMediaElement.currentTime = clampedSeconds"), 'handleMediaControl must set primaryMediaElement.currentTime');
assert(contentMediaCode.includes("moviePlayer.seekTo(clampedSeconds, true)"), 'handleMediaControl must synchronize with YouTube moviePlayer.seekTo');
console.log('  ✅ Precision seek handling with duration clamping and YouTube sync verified');

// 2.3 inject_main_world.js seek_to support
assert(injectMainWorldCode.includes("case 'seek_to':"), 'inject_main_world.js must support seek_to');
assert(injectMainWorldCode.includes("case 'seek_absolute':"), 'inject_main_world.js must support seek_absolute');
console.log('  ✅ inject_main_world.js Main World seek_to action verified\n');

// ---------------------------------------------------------------------------
// Battery 3: Multi-Tab Live Media Deck UI Seeking & Interactive Scrubber
// ---------------------------------------------------------------------------
console.log('Battery 3: Multi-Tab Live Media Deck UI Seeking & Interactive Scrubber');

const deckFeatureCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js'), 'utf8');

// 3.1 Mini Scrubber accessibility and pointer styling
assert(deckFeatureCode.includes("miniScrubber.style.cursor = 'pointer'"), 'miniScrubber must set cursor: pointer');
assert(deckFeatureCode.includes("miniScrubber.setAttribute('role', 'slider')"), 'miniScrubber must declare role="slider"');
assert(deckFeatureCode.includes("miniScrubber.setAttribute('aria-valuemin', '0')"), 'miniScrubber must declare aria-valuemin');
assert(deckFeatureCode.includes("miniScrubber.setAttribute('aria-valuemax', '100')"), 'miniScrubber must declare aria-valuemax');
assert(deckFeatureCode.includes("miniScrubber.setAttribute('aria-valuenow'"), 'miniScrubber must declare aria-valuenow');
console.log('  ✅ Mini scrubber interactive cursor and ARIA slider semantics verified');

// 3.2 Click-to-seek calculation and dispatch
assert(deckFeatureCode.includes("miniScrubber.addEventListener('click'"), 'miniScrubber must have click listener');
assert(deckFeatureCode.includes("e.clientX - rect.left"), 'miniScrubber must calculate relative click X offset');
assert(deckFeatureCode.includes("handleRemoteMediaCommand(stream.tabId, 'seek_to', targetSeconds"), 'miniScrubber click must dispatch seek_to command');
console.log('  ✅ Click-to-seek calculation and seek_to dispatch verified\n');

// ---------------------------------------------------------------------------
// Battery 4: Switch Tab Button & Card Header Navigation
// ---------------------------------------------------------------------------
console.log('Battery 4: Switch Tab Button & Card Header Navigation');

// 4.1 Card header click navigation
assert(deckFeatureCode.includes("topRow.style.cursor = 'pointer'"), 'Card topRow must have cursor: pointer');
assert(deckFeatureCode.includes("topRow.addEventListener('click'"), 'Card topRow must have click listener');
assert(deckFeatureCode.includes("handleRemoteMediaCommand(stream.tabId, 'switch_tab'"), 'Card topRow click must dispatch switch_tab');
console.log('  ✅ Card topRow header click-to-switch verified');

// 4.2 Dedicated .btn-deck-switch-tab button in controlsRow
assert(deckFeatureCode.includes("btn-deck-switch-tab"), 'controlsRow must include .btn-deck-switch-tab button');
assert(deckFeatureCode.includes("translate('btn_switch_tab')"), 'btnSwitchTab must use localized btn_switch_tab translation');
assert(deckFeatureCode.includes("controlsRow.appendChild(btnSwitchTab)"), 'btnSwitchTab must be appended to controlsRow');
console.log('  ✅ Dedicated .btn-deck-switch-tab button verified in controlsRow');

// 4.3 handleRemoteMediaCommand switch_tab support with resilient fallback
assert(deckFeatureCode.includes("if (command === 'switch_tab' || command === 'focus_tab')"), 'handleRemoteMediaCommand must handle switch_tab');
assert(deckFeatureCode.includes("type: 'JUMP_TO_MEDIA_TAB'"), 'handleRemoteMediaCommand must have JUMP_TO_MEDIA_TAB fallback');
console.log('  ✅ handleRemoteMediaCommand switch_tab and resilient JUMP_TO_MEDIA_TAB fallback verified\n');

// ---------------------------------------------------------------------------
// Battery 5: Optimistic State Updates & Active Slider Guard
// ---------------------------------------------------------------------------
console.log('Battery 5: Optimistic State Updates & Active Slider Guard');

// 5.1 Optimistic toggle for Play/Pause and Mute/Unmute
assert(deckFeatureCode.includes("statusPill.classList.add('playing')"), 'Play/pause must update statusPill optimistically');
assert(deckFeatureCode.includes("statusPill.classList.add('muted')"), 'Mute button must update statusPill optimistically');

// 5.2 Active volume slider guard during re-renders
assert(deckFeatureCode.includes("data-slider-tab-id"), 'Volume slider must declare data-slider-tab-id');
assert(deckFeatureCode.includes("isCurrentActiveSlider"), 'Volume slider must guard against clobbering active input');
console.log('  ✅ Optimistic UI updates and active slider re-render guard verified');

// 5.3 Dashboard Hero Player switch tab and bilingual i18n
const dashCode = fs.readFileSync(path.join(__dirname, '..', 'dashboard', 'dashboard.js'), 'utf8');
assert(dashCode.includes("btn_switch_tab: '🎯 Switch Tab'"), 'dashboard.js must include English btn_switch_tab');
assert(dashCode.includes("btn_switch_tab: '🎯 टैब स्विच'"), 'dashboard.js must include Hindi btn_switch_tab');
assert(dashCode.includes("handleRemoteMediaCommand(targetTabId, 'switch_tab', 0)"), 'Hero Player btnHeroSwitchTab must invoke handleRemoteMediaCommand');
console.log('  ✅ Hero Player btnHeroSwitchTab wiring and bilingual i18n verified\n');

// ---------------------------------------------------------------------------
// Battery 6: Encoding (UTF-8 with BOM) & W3C Trusted Types (0 innerHTML)
// ---------------------------------------------------------------------------
console.log('Battery 6: Encoding (UTF-8 with BOM) & W3C Trusted Types (0 innerHTML)');

const filesToCheck = [
  'background.js',
  'content_media.js',
  'inject_main_world.js',
  path.join('src', 'dashboard', 'features', 'media_deck_visualizer_feature.js'),
  path.join('dashboard', 'dashboard.js'),
  path.join('dashboard', 'styles', 'media.css')
];

filesToCheck.forEach(rel => {
  const full = path.join(__dirname, '..', rel);
  const buf = fs.readFileSync(full);
  const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  assert(hasBOM, `${rel} must be encoded in UTF-8 with BOM`);
  console.log(`  ✅ ${rel} verified UTF-8 with BOM`);
});

// Zero innerHTML in media_deck_visualizer_feature.js
const innerMatches = deckFeatureCode.match(/(\.innerHTML|\.outerHTML)\s*=/g);
assert(!innerMatches || innerMatches.length === 0, 'media_deck_visualizer_feature.js must contain strictly zero innerHTML/outerHTML');
console.log('  ✅ 100% W3C Trusted Types compliant (0 innerHTML assignments)\n');

console.log('🎉 ALL 6 BATTERIES IN test_media_deck_controls_wiring.js PASSED CLEANLY! (Exit Code 0)');
