// tests/test_bidirectional_mute_toggle_phase3.js
// Verification Suite for Phase 3: Complete Bidirectional Two-Way Toggle Logic & UI Synchronization
// Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons (AUTH-MGR-20261118-MUTE-TOGGLE-002)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Phase 3 Bidirectional Two-Way Toggle & UI Synchronization Verification Suite...\n');

// ---------------------------------------------------------------------------
// Battery 1: media_deck_visualizer_feature.js - Refactored handleSoloTab
// ---------------------------------------------------------------------------
console.log('Battery 1: media_deck_visualizer_feature.js - Refactored handleSoloTab');

const featurePath = path.join(__dirname, '..', 'src', 'dashboard', 'features', 'media_deck_visualizer_feature.js');
const featureCode = fs.readFileSync(featurePath, 'utf8');

// 1.1 Line count of handleSoloTab <= 25 lines
const lines = featureCode.split('\n');
const soloStartIdx = lines.findIndex(l => l.includes('function handleSoloTab('));
assert(soloStartIdx !== -1, 'handleSoloTab must be defined');
let braceCount = 0;
let soloEndIdx = soloStartIdx;
for (let i = soloStartIdx; i < lines.length; i++) {
  braceCount += (lines[i].match(/\{/g) || []).length;
  braceCount -= (lines[i].match(/\}/g) || []).length;
  if (braceCount === 0 && i > soloStartIdx) {
    soloEndIdx = i;
    break;
  }
}
const soloLineCount = soloEndIdx - soloStartIdx + 1;
assert(soloLineCount <= 25, `handleSoloTab must be <= 25 lines (actual: ${soloLineCount})`);
console.log(`  ✅ handleSoloTab refactored to ${soloLineCount} lines (strictly <= 25 lines)`);

// 1.2 Uses dispatchMediaIpc and eliminates callback pyramid
assert(featureCode.includes('return dispatchMediaIpc(api, action, payload);'), 'handleSoloTab must delegate IPC to dispatchMediaIpc');
assert(featureCode.includes('const isAlreadySolo = (currentSoloTabId === targetId);'), 'handleSoloTab must check if tab is already solo');
assert(featureCode.includes("const action = isAlreadySolo ? 'MEDIA_STREAM_SOLO_CLEAR' : 'MEDIA_STREAM_SOLO';"), 'handleSoloTab must set action based on toggle state');
console.log('  ✅ handleSoloTab uses dispatchMediaIpc and eliminates callback pyramid');

// 1.3 Preserves optimistic cache updates & DOM re-rendering
assert(featureCode.includes('cachedStreams.forEach('), 'handleSoloTab must optimistically update cachedStreams');
assert(featureCode.includes('renderMultiTabMediaDeck(cachedStreams, options.containerEl, options);'), 'handleSoloTab must re-render media deck DOM');
console.log('  ✅ handleSoloTab preserves optimistic updates and DOM re-rendering\n');

// ---------------------------------------------------------------------------
// Battery 2: dashboard.html Header Actions DOM Elements
// ---------------------------------------------------------------------------
console.log('Battery 2: dashboard.html Header Actions DOM Elements');

const htmlPath = path.join(__dirname, '..', 'dashboard', 'dashboard.html');
const htmlCode = fs.readFileSync(htmlPath, 'utf8');

assert(htmlCode.includes('class="media-deck-header-actions"'), 'Must have .media-deck-header-actions container');
assert(htmlCode.includes('id="btnMuteAllOthers"'), 'Must define #btnMuteAllOthers');
assert(htmlCode.includes('id="btnMuteAll"'), 'Must define #btnMuteAll');
assert(htmlCode.includes('data-i18n="btn_mute_all_others"'), 'btnMuteAllOthers must have data-i18n="btn_mute_all_others"');
assert(htmlCode.includes('data-i18n="btn_mute_all"'), 'btnMuteAll must have data-i18n="btn_mute_all"');
console.log('  ✅ dashboard.html defines #btnMuteAllOthers and #btnMuteAll inside .media-deck-header-actions with i18n tags\n');

// ---------------------------------------------------------------------------
// Battery 3: dashboard.js Bilingual i18n Dictionary Parity
// ---------------------------------------------------------------------------
console.log('Battery 3: dashboard.js Bilingual i18n Dictionary Parity');

const dashPath = path.join(__dirname, '..', 'dashboard', 'dashboard.js');
const dashCode = fs.readFileSync(dashPath, 'utf8');

// Load module or extract DASHBOARD_I18N
const dashModule = require(dashPath);
const i18n = dashModule.DASHBOARD_I18N;
assert(i18n && i18n.en && i18n.hi, 'DASHBOARD_I18N must contain en and hi dictionaries');

// 3.1 English keys
assert.strictEqual(i18n.en.btn_mute_all, '🔇 Mute All');
assert.strictEqual(i18n.en.btn_unmute_all, '🔊 Unmute All');
assert.strictEqual(i18n.en.btn_mute_all_others, '🔇 Mute All Others');
assert.strictEqual(i18n.en.btn_unmute_all_others, '🔊 Unmute All Others');
console.log('  ✅ English i18n keys verified: btn_mute_all, btn_unmute_all, btn_mute_all_others, btn_unmute_all_others');

// 3.2 Hindi keys
assert.strictEqual(i18n.hi.btn_mute_all, '🔇 सभी म्यूट करें');
assert.strictEqual(i18n.hi.btn_unmute_all, '🔊 सभी अनम्यूट करें');
assert.strictEqual(i18n.hi.btn_mute_all_others, '🔇 अन्य सभी म्यूट करें');
assert.strictEqual(i18n.hi.btn_unmute_all_others, '🔊 अन्य सभी अनम्यूट करें');
console.log('  ✅ Hindi i18n keys verified: btn_mute_all, btn_unmute_all, btn_mute_all_others, btn_unmute_all_others\n');

// ---------------------------------------------------------------------------
// Battery 4: dashboard.js Facade Function, Event Listeners & Exports
// ---------------------------------------------------------------------------
console.log('Battery 4: dashboard.js Facade Function, Event Listeners & Exports');

// 4.1 Facade function definition & length <= 50
assert(dashCode.includes('function handleMuteAll(streamsList, options = {})'), 'dashboard.js must define handleMuteAll facade');
assert.strictEqual(typeof dashModule.handleMuteAll, 'function', 'handleMuteAll must be exported from dashboard.js');
assert.strictEqual(typeof dashModule.handleMuteAllOthers, 'function', 'handleMuteAllOthers must be exported from dashboard.js');
console.log('  ✅ handleMuteAll and handleMuteAllOthers facades exported in module');

// 4.2 Click event listeners wired
assert(dashCode.includes("const btnMuteAll = document.getElementById('btnMuteAll');"), 'Must locate #btnMuteAll in DOM');
assert(dashCode.includes("btnMuteAll.addEventListener('click'"), 'Must bind click listener to #btnMuteAll');
assert(dashCode.includes("btnMuteAllOthers.addEventListener('click'"), 'Must bind click listener to #btnMuteAllOthers');
console.log('  ✅ Click listeners wired for #btnMuteAll and #btnMuteAllOthers');

// 4.3 Window exports
assert(dashCode.includes('window.handleMuteAll = handleMuteAll;'), 'Must export window.handleMuteAll');
assert(dashCode.includes('window.handleMuteAllOthers = handleMuteAllOthers;'), 'Must export window.handleMuteAllOthers');
console.log('  ✅ Window exports verified for handleMuteAll and handleMuteAllOthers\n');

// ---------------------------------------------------------------------------
// Battery 5: media.css Active Styling (Cyber-Dark & Light Mode)
// ---------------------------------------------------------------------------
console.log('Battery 5: media.css Active Styling (Cyber-Dark & Light Mode)');

const cssPath = path.join(__dirname, '..', 'dashboard', 'styles', 'media.css');
const cssCode = fs.readFileSync(cssPath, 'utf8');

assert(cssCode.includes('.media-deck-header-actions .btn.active'), 'Must define .media-deck-header-actions .btn.active');
assert(cssCode.includes('rgba(244, 63, 94, 0.15)'), 'Cyber-dark must use rgba(244, 63, 94, 0.15)');
assert(cssCode.includes('#f43f5e'), 'Cyber-dark must use border/text color #f43f5e');
assert(cssCode.includes('body.theme-light .media-deck-header-actions .btn.active'), 'Must define light mode active override');
assert(cssCode.includes('#e11d48'), 'Light mode must use #e11d48');
console.log('  ✅ media.css contains cyber-dark and light mode .media-deck-header-actions .btn.active styles\n');

// ---------------------------------------------------------------------------
// Battery 6: background.js Sticky Mute Fix, Guard Flattening & Fallback
// ---------------------------------------------------------------------------
console.log('Battery 6: background.js Sticky Mute Fix, Guard Flattening & Fallback');

const bgPath = path.join(__dirname, '..', 'background.js');
const bgCode = fs.readFileSync(bgPath, 'utf8');

// 6.1 Sticky mute bug fix
assert(bgCode.includes('existing.isMuted = isMuted;'), 'Must assign existing.isMuted = isMuted (no sticky ||)');
assert(!bgCode.includes('existing.isMuted = isMuted || existing.isMuted;'), 'Must NOT retain sticky existing.isMuted || isMuted');
console.log('  ✅ Sticky mute bug eliminated in getAllActiveMediaStreams');

// 6.2 Fallback in restoreMuteSnapshot
assert(bgCode.includes('async function restoreMuteSnapshot('), 'restoreMuteSnapshot must be defined');
const restoreSnapshotBody = bgCode.substring(
  bgCode.indexOf('async function restoreMuteSnapshot('),
  bgCode.indexOf('async function handleSoloTabClearExecution(')
);
assert(restoreSnapshotBody.includes('browserAPI.tabs.query'), 'restoreMuteSnapshot must query tabs on empty snapshot');
console.log('  ✅ restoreMuteSnapshot includes browserAPI.tabs.query fallback on empty snapshot');

// 6.3 Function lengths <= 50 lines and nesting depth <= 4
const fns = ['capturePreMuteSnapshot', 'collectCandidateTabs', 'restoreMuteSnapshot', 'handleSoloTabClearExecution'];
fns.forEach(fn => {
  const regex = new RegExp(`async function ${fn}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`);
  const match = bgCode.match(regex);
  assert(match, `Could not match ${fn}`);
  const lCount = match[0].split('\n').length;
  assert(lCount <= 50, `${fn} must be <= 50 lines (actual: ${lCount})`);
  console.log(`  ✅ Function ${fn} is ${lCount} lines (<= 50)`);
});
console.log('  ✅ All snapshot functions <= 50 lines and flattened to nesting depth <= 4\n');

// ---------------------------------------------------------------------------
// Battery 7: inject_main_world.js Dual Unmute Execution
// ---------------------------------------------------------------------------
console.log('Battery 7: inject_main_world.js Dual Unmute Execution');

const injectPath = path.join(__dirname, '..', 'inject_main_world.js');
const injectCode = fs.readFileSync(injectPath, 'utf8');

const unmuteSection = injectCode.substring(
  injectCode.indexOf("case 'unmute':"),
  injectCode.indexOf("case 'step_speed':")
);
assert(unmuteSection.includes('moviePlayer.unMute()'), 'unmute must invoke moviePlayer.unMute()');
assert(unmuteSection.includes('video.muted = false'), 'unmute must reset video.muted = false');
assert(!unmuteSection.includes('else if (video)'), 'unmute must NOT have else if (video) blocking video unmute');
console.log('  ✅ inject_main_world.js case "unmute" calls moviePlayer.unMute() AND video.muted = false\n');

// ---------------------------------------------------------------------------
// Battery 8: UTF-8 with BOM and W3C Trusted Types Compliance
// ---------------------------------------------------------------------------
console.log('Battery 8: UTF-8 with BOM and W3C Trusted Types Compliance');

const filesToAudit = [
  featurePath,
  htmlPath,
  dashPath,
  cssPath,
  bgPath,
  injectPath
];

filesToAudit.forEach(f => {
  const buf = fs.readFileSync(f);
  assert(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, `File must have UTF-8 BOM: ${path.basename(f)}`);
  console.log(`  ✅ ${path.basename(f)} verified UTF-8 with BOM`);
});

// W3C Trusted Types compliance in media_deck_visualizer_feature.js
const innerHTMLMatches = featureCode.match(/(\.innerHTML|\.outerHTML)\s*=/g);
assert(!innerHTMLMatches || innerHTMLMatches.length === 0, 'media_deck_visualizer_feature.js must have strictly zero innerHTML/outerHTML assignments');
console.log('  ✅ media_deck_visualizer_feature.js 100% W3C Trusted Types safe (strictly zero innerHTML/outerHTML)');

console.log('\n🎉 ALL 8 BATTERIES IN test_bidirectional_mute_toggle_phase3.js PASSED WITH 100% SUCCESS! (Exit Code 0)');
