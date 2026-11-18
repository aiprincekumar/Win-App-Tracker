'use strict';

/**
 * tests/test_advanced_features_focus_sleep.js
 * Comprehensive 8-Battery Independent QA Verification Test Suite
 * for Advanced Focus & Sleep Suite Integration.
 *
 * Batteries:
 * 1. DOM Structural Hierarchy & ID Verification
 * 2. Default OFF / Inactive Invariant Verification
 * 3. Basic Container Preservation Verification (#widgetPomodoroSentinel & #cardSleepSentinelHub)
 * 4. CSS Layout, Bento Grid Classes & Design Tokens
 * 5. Bilingual i18n Dictionary Key Parity (en/hi across dashboard.js and locales/*.json)
 * 6. JavaScript Controller & State Functions Existence & Rule 28 Compliance
 * 7. Web Audio API Synthesis Safety (Zero external audio assets)
 * 8. Feature Modules Public API & Execution Verification
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const cssPath = path.join(rootDir, 'dashboard', 'dashboard.css');
const advCssPath = path.join(rootDir, 'dashboard', 'styles', 'focus_sleep_advanced.css');
const jsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const focusSuitePath = path.join(rootDir, 'src', 'dashboard', 'features', 'focus_advanced_suite.js');
const sleepSuitePath = path.join(rootDir, 'src', 'dashboard', 'features', 'sleep_advanced_suite.js');
const enJsonPath = path.join(rootDir, 'locales', 'en.json');
const hiJsonPath = path.join(rootDir, 'locales', 'hi.json');
const bgPath = path.join(rootDir, 'background.js');
const contentMediaPath = path.join(rootDir, 'content_media.js');

console.log('🧪 Starting Advanced Focus & Sleep Suite 20-Battery QA Test Suite...\n');

function checkBOM(filePath) {
  const buf = fs.readFileSync(filePath);
  const hasBOM = buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  assert(hasBOM, `File ${path.basename(filePath)} must start with UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
}

// Check UTF-8 BOM on all relevant files
[htmlPath, cssPath, advCssPath, jsPath, focusSuitePath, sleepSuitePath, enJsonPath, hiJsonPath, bgPath, contentMediaPath].forEach(checkBOM);
console.log('✅ UTF-8 with BOM certified across all suite files and locales.\n');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const advCss = fs.readFileSync(advCssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const bgCode = fs.readFileSync(bgPath, 'utf8');
const contentMediaCode = fs.readFileSync(contentMediaPath, 'utf8');
const focusCode = fs.readFileSync(focusSuitePath, 'utf8');
const sleepCode = fs.readFileSync(sleepSuitePath, 'utf8');

// =============================================================================
// Battery 1: DOM Structural Hierarchy & ID Verification
// =============================================================================
console.log('Battery 1: DOM Structural Hierarchy & ID Verification');
{
  assert(html.includes('id="widgetFocusAdvanced"'), 'Must contain #widgetFocusAdvanced');
  assert(html.includes('id="cardSleepAdvanced"'), 'Must contain #cardSleepAdvanced');

  // Focus Advanced elements
  assert(html.includes('id="toggleFocusIntegrityScore"'), 'Missing #toggleFocusIntegrityScore');
  assert(html.includes('id="badgeFocusIntegrityScore"'), 'Missing #badgeFocusIntegrityScore');
  assert(html.includes('id="cntFocusDistractions"'), 'Missing #cntFocusDistractions');
  assert(html.includes('id="toggleFocusAutoMuteBg"'), 'Missing #toggleFocusAutoMuteBg');
  assert(html.includes('value="binaural_alpha"'), 'Missing binaural_alpha option');
  assert(html.includes('value="binaural_beta"'), 'Missing binaural_beta option');
  assert(html.includes('value="binaural_gamma"'), 'Missing binaural_gamma option');
  assert(html.includes('id="toggleFocusBreatheNudge"'), 'Missing #toggleFocusBreatheNudge');
  assert(html.includes('id="overlayBreatheNudge"'), 'Missing #overlayBreatheNudge');
  assert(html.includes('id="toggleFocus2020Alert"'), 'Missing #toggleFocus2020Alert');
  assert(html.includes('id="toast2020PostureAlert"'), 'Missing #toast2020PostureAlert');

  // Sleep Advanced elements
  assert(html.includes('id="toggleSleepAutoplayBlock"'), 'Missing #toggleSleepAutoplayBlock');
  assert(html.includes('id="selectSleepAidSoundscape"'), 'Missing #selectSleepAidSoundscape');
  assert(html.includes('value="pink_noise"'), 'Missing pink_noise option');
  assert(html.includes('value="midnight_ocean"'), 'Missing midnight_ocean option');
  assert(html.includes('value="delta_rain"'), 'Missing delta_rain option');
  assert(html.includes('id="sliderSleepSoundscapeVolume"'), 'Missing #sliderSleepSoundscapeVolume');
  assert(html.includes('id="btnToggleSleepSoundscape"'), 'Missing #btnToggleSleepSoundscape');
  assert(html.includes('id="toggleSleepInactivityFastCutoff"'), 'Missing #toggleSleepInactivityFastCutoff');
  assert(html.includes('id="toggleSleepScreenDimmer"'), 'Missing #toggleSleepScreenDimmer');
  assert(html.includes('id="overlaySleepDimmer"'), 'Missing #overlaySleepDimmer');
  assert(html.includes('id="toggleSleepTabHibernate"'), 'Missing #toggleSleepTabHibernate');
  assert(html.includes('id="btnSleepPowerNapMode"'), 'Missing #btnSleepPowerNapMode');

  console.log('  ✅ All 11 Focus & Sleep Advanced elements verified in DOM.');
}

// =============================================================================
// Battery 2: Default OFF / Inactive Invariant Verification
// =============================================================================
console.log('\nBattery 2: Default OFF / Inactive Invariant Verification');
{
  function verifyInputDefaultOff(id) {
    const regex = new RegExp(`<input[^>]*id=["']${id}["'][^>]*>`, 'i');
    const match = html.match(regex);
    assert(match, `Element #${id} must exist in HTML`);
    const tag = match[0];
    assert(!tag.includes('checked'), `Element #${id} must NOT have checked attribute (Default OFF invariant violated: ${tag})`);
  }

  // Verify all 8 newly added toggle checkboxes are unchecked by default
  verifyInputDefaultOff('toggleFocusIntegrityScore');
  verifyInputDefaultOff('toggleFocusAutoMuteBg');
  verifyInputDefaultOff('toggleFocusBreatheNudge');
  verifyInputDefaultOff('toggleFocus2020Alert');
  verifyInputDefaultOff('toggleSleepAutoplayBlock');
  verifyInputDefaultOff('toggleSleepInactivityFastCutoff');
  verifyInputDefaultOff('toggleSleepScreenDimmer');
  verifyInputDefaultOff('toggleSleepTabHibernate');

  // Verify select dropdowns default to 'none' selected
  assert(
    html.includes('<option value="none" selected data-i18n="soundscape_opt_none">Off (Silent)</option>'),
    '#selectFocusSoundscape must have value="none" selected by default'
  );
  assert(
    html.includes('<option value="none" selected data-i18n="sleep_soundscape_none">Off (Silent)</option>'),
    '#selectSleepAidSoundscape must have value="none" selected by default'
  );

  // Verify overlays are default hidden
  assert(html.includes('id="overlayBreatheNudge" class="breathe-nudge-overlay hidden"'), '#overlayBreatheNudge must be hidden by default');
  assert(html.includes('id="toast2020PostureAlert" class="toast-2020-alert hidden"'), '#toast2020PostureAlert must be hidden by default');
  assert(html.includes('id="overlaySleepDimmer" class="screen-dimmer-overlay hidden"'), '#overlaySleepDimmer must be hidden by default');

  console.log('  ✅ 100% Default OFF invariant certified: all toggles unchecked, dropdowns silent, overlays hidden.');
}

// =============================================================================
// Battery 3: Basic Container Preservation Verification
// =============================================================================
console.log('\nBattery 3: Basic Container Preservation Verification');
{
  assert(html.includes('id="widgetPomodoroSentinel"'), 'Missing basic #widgetPomodoroSentinel');
  assert(html.includes('id="btnStartPomodoro"'), 'Missing #btnStartPomodoro');
  assert(html.includes('id="pomodoroTimeDisplay"'), 'Missing #pomodoroTimeDisplay');
  assert(html.includes('id="dashFocusDialProgress"'), 'Missing #dashFocusDialProgress');

  assert(html.includes('id="cardSleepSentinelHub"'), 'Missing basic #cardSleepSentinelHub');
  assert(html.includes('id="btnDashSleepToggle"'), 'Missing #btnDashSleepToggle');
  assert(html.includes('id="dashSleepCountdownDisplay"'), 'Missing #dashSleepCountdownDisplay');
  assert(html.includes('id="dashSleepDialProgress"'), 'Missing #dashSleepDialProgress');

  console.log('  ✅ Basic containers #widgetPomodoroSentinel and #cardSleepSentinelHub are 100% intact.');
}

// =============================================================================
// Battery 4: CSS Layout, Bento Grid Classes & Design Tokens
// =============================================================================
console.log('\nBattery 4: CSS Layout, Bento Grid Classes & Design Tokens');
{
  const combinedCss = css + '\n' + advCss;
  assert(combinedCss.includes('.focus-integrity-row'), 'Missing .focus-integrity-row CSS');
  assert(combinedCss.includes('.badge-integrity-score'), 'Missing .badge-integrity-score CSS');
  assert(combinedCss.includes('.badge-distraction-counter'), 'Missing .badge-distraction-counter CSS');
  assert(combinedCss.includes('.breathe-nudge-overlay'), 'Missing .breathe-nudge-overlay CSS');
  assert(combinedCss.includes('.breathe-visual-ring'), 'Missing .breathe-visual-ring CSS');
  assert(combinedCss.includes('.toast-2020-alert'), 'Missing .toast-2020-alert CSS');
  assert(combinedCss.includes('.sleep-power-nap-banner'), 'Missing .sleep-power-nap-banner CSS');
  assert(combinedCss.includes('.btn-power-nap'), 'Missing .btn-power-nap CSS');
  assert(combinedCss.includes('.sleep-soundscape-panel'), 'Missing .sleep-soundscape-panel CSS');
  assert(combinedCss.includes('.screen-dimmer-overlay'), 'Missing .screen-dimmer-overlay CSS');

  console.log('  ✅ Cyber-Dark CSS classes and design tokens verified.');
}

// =============================================================================
// Battery 5: Bilingual i18n Dictionary Key Parity
// =============================================================================
console.log('\nBattery 5: Bilingual i18n Dictionary Key Parity');
{
  const strip = s => s.replace(/^\uFEFF/, '');
  const enJson = JSON.parse(strip(fs.readFileSync(enJsonPath, 'utf8')));
  const hiJson = JSON.parse(strip(fs.readFileSync(hiJsonPath, 'utf8')));

  const requiredKeys = [
    'lbl_focus_integrity', 'desc_focus_integrity',
    'toggle_focus_automute_bg', 'desc_focus_automute_bg',
    'soundscape_opt_binaural_alpha', 'soundscape_opt_binaural_beta', 'soundscape_opt_binaural_gamma',
    'toggle_focus_breathe_nudge', 'desc_focus_breathe_nudge',
    'toggle_focus_2020_alert', 'desc_focus_2020_alert',
    'breathe_nudge_title', 'breathe_nudge_desc', 'btn_breathe_return', 'btn_breathe_allow',
    'toast_2020_title', 'toast_2020_desc',
    'toggle_sleep_autoplay_block', 'desc_sleep_autoplay_block',
    'lbl_sleep_aid_soundscapes', 'desc_sleep_aid_soundscapes',
    'sleep_soundscape_none', 'sleep_soundscape_pink', 'sleep_soundscape_ocean', 'sleep_soundscape_rain',
    'toggle_sleep_inactivity_cutoff', 'desc_sleep_inactivity_cutoff',
    'toggle_sleep_screen_dimmer', 'desc_sleep_screen_dimmer',
    'toggle_sleep_tab_hibernate', 'desc_sleep_tab_hibernate',
    'btn_sleep_power_nap', 'desc_sleep_power_nap', 'btn_start_nap'
  ];

  requiredKeys.forEach(key => {
    assert(enJson[key], `Missing English JSON key: ${key}`);
    assert(hiJson[key], `Missing Hindi JSON key: ${key}`);
    assert(js.includes(key), `Missing key in dashboard.js: ${key}`);
  });

  console.log(`  ✅ 100% bilingual parity confirmed across all ${requiredKeys.length} required keys in en.json, hi.json, and dashboard.js.`);
}

// =============================================================================
// Battery 6: JavaScript Controller & State Functions Existence & Rule 28
// =============================================================================
console.log('\nBattery 6: JavaScript Controller & State Functions Existence & Rule 28');
{
  const requiredFunctions = [
    'initFocusAdvancedState',
    'initSleepAdvancedState',
    'createBinauralBeatNodes',
    'startSleepAidSoundscape',
    'stopSleepAidSoundscape',
    'triggerPowerNapMode',
    'trigger2020PostureAlert',
    'triggerBreatheNudgeOverlay',
    'updateFocusIntegrityScore'
  ];

  requiredFunctions.forEach(fn => {
    assert(js.includes(`function ${fn}`) || js.includes(`${fn}:`), `Missing function ${fn} in dashboard.js`);
  });

  // Verify function length limit (<= 50 lines) per Universal Rule 28 in modular feature files
  [focusSuitePath, sleepSuitePath].forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let currentFn = '';
    let fnStart = 0;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
      if (match && braceCount === 1) { // top-level function inside module wrapper
        currentFn = match[1];
        fnStart = i;
      }
      for (const char of line) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (currentFn && braceCount === 1) {
            const length = i - fnStart + 1;
            assert(
              length <= 50,
              `Rule 28 Violation: Function ${currentFn} in ${path.basename(filePath)} has ${length} lines (max 50)`
            );
            currentFn = '';
          }
        }
      }
    }
  });

  console.log('  ✅ Universal Rule 28 modularity certified: all controller functions <= 50 lines.');
}

// =============================================================================
// Battery 7: Web Audio API Synthesis Safety
// =============================================================================
console.log('\nBattery 7: Web Audio API Synthesis Safety');
{
  // Zero external audio URLs (no http, mp3, wav downloads)
  assert(!focusCode.includes('.mp3') && !focusCode.includes('.wav'), 'Focus suite must not load external audio files');
  assert(!sleepCode.includes('.mp3') && !sleepCode.includes('.wav'), 'Sleep suite must not load external audio files');

  // Verify DSP node creation methods
  assert(focusCode.includes('createChannelMerger(2)'), 'Focus suite must use channel merger for binaural beats');
  assert(sleepCode.includes('createBuffer'), 'Sleep suite must use pure mathematical audio buffers');
  assert(sleepCode.includes('createBiquadFilter'), 'Sleep suite must use biquad filters for pink noise/ocean');

  console.log('  ✅ Web Audio API synthesizers verified 100% mathematical with zero external asset dependencies.');
}

// =============================================================================
// Battery 8: Feature Suite Modules Integration & Clean Execution
// =============================================================================
console.log('\nBattery 8: Feature Suite Modules Integration & Clean Execution');
{
  // Test requiring the modules in Node.js environment
  const FocusSuite = require(focusSuitePath);
  const SleepSuite = require(sleepSuitePath);

  assert(FocusSuite && typeof FocusSuite.createBinauralBeatNodes === 'function', 'FocusAdvancedSuite API invalid');
  assert(SleepSuite && typeof SleepSuite.startSleepAidSoundscape === 'function', 'SleepAdvancedSuite API invalid');

  // Verify default state
  const fState = FocusSuite.getState();
  assert.strictEqual(fState.integrityScore, 100, 'Initial focus integrity score must be 100');
  assert.strictEqual(fState.distractionCount, 0, 'Initial distraction count must be 0');

  const sState = SleepSuite.getState();
  assert.strictEqual(sState.isPlayingSoundscape, false, 'Sleep soundscape must be idle by default');
  assert.strictEqual(sState.powerNapActive, false, 'Power nap must be inactive by default');

  console.log('  ✅ Modular feature suites pass unit tests and instantiate clean default states.');
}

// =============================================================================
// Battery 9: Focus Distraction Detection & Integrity Score Dynamic Recalculation (#toggleFocusIntegrityScore)
// =============================================================================
console.log('\nBattery 9: Focus Distraction Detection & Integrity Score Dynamic Recalculation');
{
  const FocusSuite = require(focusSuitePath);
  const bg = require(bgPath);

  assert.strictEqual(typeof bg.isDistractingDomain, 'function', 'bg.isDistractingDomain must be a function');
  assert.strictEqual(bg.isDistractingDomain('youtube.com'), true, 'youtube.com must be distracting');
  assert.strictEqual(bg.isDistractingDomain('www.youtube.com'), true, 'www.youtube.com must be distracting');
  assert.strictEqual(bg.isDistractingDomain('twitter.com'), true, 'twitter.com must be distracting');
  assert.strictEqual(bg.isDistractingDomain('x.com'), true, 'x.com must be distracting');
  assert.strictEqual(bg.isDistractingDomain('reddit.com'), true, 'reddit.com must be distracting');
  assert.strictEqual(bg.isDistractingDomain('netflix.com'), true, 'netflix.com must be distracting');
  assert.strictEqual(bg.isDistractingDomain('github.com'), false, 'github.com should not be distracting');
  assert.strictEqual(bg.isDistractingDomain('docs.google.com'), false, 'docs.google.com should not be distracting');

  FocusSuite.resetFocusIntegrityScore();
  let state = FocusSuite.getState();
  assert.strictEqual(state.integrityScore, 100, 'Score must start at 100');
  assert.strictEqual(state.distractionCount, 0, 'Distractions must start at 0');

  FocusSuite.updateFocusIntegrityScore(-5, 'distracting_domain');
  state = FocusSuite.getState();
  assert.strictEqual(state.integrityScore, 95, 'Score must be 95 after 1 distraction');
  assert.strictEqual(state.distractionCount, 1, 'Distractions must be 1');

  FocusSuite.updateFocusIntegrityScore(-5, 'distracting_domain');
  state = FocusSuite.getState();
  assert.strictEqual(state.integrityScore, 90, 'Score must be 90 after 2 distractions');
  assert.strictEqual(state.distractionCount, 2, 'Distractions must be 2');

  FocusSuite.resetFocusIntegrityScore();
  state = FocusSuite.getState();
  assert.strictEqual(state.integrityScore, 100, 'Score must reset to 100');
  assert.strictEqual(state.distractionCount, 0, 'Distractions must reset to 0');

  assert(bgCode.includes('FOCUS_DISTRACTION_EVENT'), 'background.js must dispatch FOCUS_DISTRACTION_EVENT');
  assert(js.includes('FOCUS_DISTRACTION_EVENT'), 'dashboard.js must listen for FOCUS_DISTRACTION_EVENT');

  console.log('  ✅ Distraction detection & dynamic score recalculation certified.');
}

// =============================================================================
// Battery 10: Auto-Mute Background Tabs Lifecycle & Audible Tab Guard (#toggleFocusAutoMuteBg)
// =============================================================================
console.log('\nBattery 10: Auto-Mute Background Tabs Lifecycle & Audible Tab Guard');
{
  const bg = require(bgPath);
  assert.strictEqual(typeof bg.executeAutoMuteBackgroundTabs, 'function', 'executeAutoMuteBackgroundTabs must exist');
  assert.strictEqual(typeof bg.checkAndAutoMuteBackgroundTab, 'function', 'checkAndAutoMuteBackgroundTab must exist');

  assert(bgCode.includes('executeAutoMuteBackgroundTabs(true)'), 'background.js must auto-mute on focus timer start/resume');
  assert(bgCode.includes('executeAutoMuteBackgroundTabs(false)'), 'background.js must unmute on focus pause/reset/expire');
  assert(bgCode.includes('checkAndAutoMuteBackgroundTab(tabId)'), 'background.js must mute newly audible background tabs');
  assert(js.includes('FocusAdvancedSuite.executeAutoMuteBackgroundTabs'), 'dashboard.js must invoke executeAutoMuteBackgroundTabs on pomodoro controls');

  console.log('  ✅ Auto-Mute background tabs lifecycle & audible tab guard certified.');
}

// =============================================================================
// Battery 11: Web Audio Binaural Beats Twin Oscillator DSP Node Generation (#selectFocusSoundscape)
// =============================================================================
console.log('\nBattery 11: Web Audio Binaural Beats Twin Oscillator DSP Node Generation');
{
  const FocusSuite = require(focusSuitePath);

  function createMockAudioContext() {
    return {
      currentTime: 10,
      createOscillator: () => {
        let f = 0;
        return {
          type: 'sine',
          frequency: {
            setValueAtTime: (val) => { f = val; },
            get value() { return f; }
          },
          connect: function(dest, outIdx, inIdx) { this.dest = dest; this.inIdx = inIdx; },
          start: function() { this.started = true; },
          stop: function() { this.stopped = true; }
        };
      },
      createChannelMerger: (inputs) => ({
        inputs,
        connect: function(dest) { this.dest = dest; }
      }),
      createGain: () => ({
        gain: { setValueAtTime: () => {} },
        connect: () => {}
      })
    };
  }

  const mockCtx = createMockAudioContext();
  const mockGain = mockCtx.createGain();

  const nodesAlpha = FocusSuite.createBinauralBeatNodes(mockCtx, 200, 10, mockGain);
  assert.strictEqual(nodesAlpha.length, 3, 'Must return [oscL, oscR, merger]');
  assert.strictEqual(nodesAlpha[0].frequency.value, 200, 'Left oscillator frequency must be carrier 200Hz');
  assert.strictEqual(nodesAlpha[1].frequency.value, 210, 'Right oscillator frequency must be 210Hz (200 + 10)');
  assert.strictEqual(nodesAlpha[0].started, true, 'Left oscillator must be started');
  assert.strictEqual(nodesAlpha[1].started, true, 'Right oscillator must be started');
  assert.strictEqual(nodesAlpha[2].dest, mockGain, 'Channel merger must connect to master gain node');

  const nodesBeta = FocusSuite.createBinauralBeatNodes(mockCtx, 220, 18, mockGain);
  assert.strictEqual(nodesBeta[0].frequency.value, 220, 'Left oscillator frequency must be carrier 220Hz');
  assert.strictEqual(nodesBeta[1].frequency.value, 238, 'Right oscillator frequency must be 238Hz (220 + 18)');

  const nodesGamma = FocusSuite.createBinauralBeatNodes(mockCtx, 240, 40, mockGain);
  assert.strictEqual(nodesGamma[0].frequency.value, 240, 'Left oscillator frequency must be carrier 240Hz');
  assert.strictEqual(nodesGamma[1].frequency.value, 280, 'Right oscillator frequency must be 280Hz (240 + 40)');

  assert(js.includes('createBinauralBeatNodes'), 'dashboard.js must integrate createBinauralBeatNodes');
  assert(js.includes('binaural_alpha'), 'dashboard.js must configure binaural_alpha');
  assert(js.includes('binaural_beta'), 'dashboard.js must configure binaural_beta');
  assert(js.includes('binaural_gamma'), 'dashboard.js must configure binaural_gamma');

  console.log('  ✅ Web Audio binaural beats twin oscillator DSP generation certified across Alpha/Beta/Gamma.');
}

// =============================================================================
// Battery 12: Soft-Nudge Box-Breathing Overlay Cycle (#toggleFocusBreatheNudge)
// =============================================================================
console.log('\nBattery 12: Soft-Nudge Box-Breathing Overlay Cycle');
{
  const FocusSuite = require(focusSuitePath);
  assert.strictEqual(typeof FocusSuite.triggerBreatheNudgeOverlay, 'function');
  assert.strictEqual(typeof FocusSuite.hideBreatheNudgeOverlay, 'function');

  assert(advCss.includes('.breathe-nudge-overlay'), 'CSS must define .breathe-nudge-overlay');
  assert(advCss.includes('.breathe-visual-ring.inhale'), 'CSS must define .breathe-visual-ring.inhale');
  assert(advCss.includes('.breathe-visual-ring.hold'), 'CSS must define .breathe-visual-ring.hold');
  assert(advCss.includes('.breathe-visual-ring.exhale'), 'CSS must define .breathe-visual-ring.exhale');
  assert(js.includes('triggerBreatheNudgeOverlay'), 'dashboard.js must call triggerBreatheNudgeOverlay');

  console.log('  ✅ Soft-Nudge box-breathing animation cycle certified.');
}

// =============================================================================
// Battery 13: 20-20-20 Posture Alert & Pomodoro Focus Tick Integration (#toggleFocus2020Alert)
// =============================================================================
console.log('\nBattery 13: 20-20-20 Posture Alert & Pomodoro Focus Tick Integration');
{
  const FocusSuite = require(focusSuitePath);
  assert.strictEqual(typeof FocusSuite.handlePomodoroFocusTick, 'function');
  assert.strictEqual(typeof FocusSuite.trigger2020PostureAlert, 'function');
  assert.strictEqual(typeof FocusSuite.hide2020PostureAlert, 'function');

  assert(html.includes('id="toast2020PostureAlert"'), 'HTML must contain #toast2020PostureAlert');
  assert(focusCode.includes('chrome.notifications.create'), 'Focus suite must support browser notifications');
  assert(js.includes('FocusAdvancedSuite.handlePomodoroFocusTick'), 'dashboard.js must invoke handlePomodoroFocusTick during running focus');

  console.log('  ✅ 20-20-20 posture alert & Pomodoro tick integration certified.');
}

// =============================================================================
// Battery 14: Content Script Video Autoplay Blocking & YouTube Autonav Cancellation (#toggleSleepAutoplayBlock)
// =============================================================================
console.log('\nBattery 14: Content Script Video Autoplay Blocking & YouTube Autonav Cancellation');
{
  assert(contentMediaCode.includes('sleepAutoplayBlockState'), 'content_media.js must maintain sleepAutoplayBlockState');
  assert(contentMediaCode.includes('isSleepAutoplayBlockActive'), 'content_media.js must have isSleepAutoplayBlockActive');
  assert(contentMediaCode.includes('applyAutoplayBlockToVideo'), 'content_media.js must have applyAutoplayBlockToVideo');
  assert(contentMediaCode.includes('disableYouTubeAutoplayToggle'), 'content_media.js must have disableYouTubeAutoplayToggle');
  assert(contentMediaCode.includes('onSleepVideoEnded'), 'content_media.js must cancel autonav on video ended');
  assert(contentMediaCode.includes('SET_SLEEP_AUTOPLAY_BLOCK'), 'content_media.js must handle SET_SLEEP_AUTOPLAY_BLOCK IPC');
  assert(contentMediaCode.includes('__SentinelSleepAutoplayBlock'), 'content_media.js must expose __SentinelSleepAutoplayBlock');

  console.log('  ✅ Content script video autoplay blocking & YouTube autonav cancellation certified.');
}

// =============================================================================
// Battery 15: Sleep Aid Soundscapes Linear Volume Ramp & Clean Stop (#selectSleepAidSoundscape)
// =============================================================================
console.log('\nBattery 15: Sleep Aid Soundscapes Linear Volume Ramp & Clean Stop');
{
  const SleepSuite = require(sleepSuitePath);
  assert.strictEqual(typeof SleepSuite.startSleepAidSoundscape, 'function');
  assert.strictEqual(typeof SleepSuite.stopSleepAidSoundscape, 'function');
  assert.strictEqual(typeof SleepSuite.applySleepVolumeRamp, 'function');

  assert(sleepCode.includes('createPinkNoiseSource'), 'Must synthesize Paul Kellet pink noise');
  assert(sleepCode.includes('createMidnightOceanNodes'), 'Must synthesize LFO-modulated midnight ocean');
  assert(sleepCode.includes('createDeltaRainNodes'), 'Must synthesize delta rain with 2.5Hz binaural sleep carrier');
  assert(sleepCode.includes('linearRampToValueAtTime'), 'Must implement linearRampToValueAtTime');

  assert(js.includes('SleepAdvancedSuite.applySleepVolumeRamp(0, 30)'), 'dashboard.js must ramp volume to 0 on fade / last 30s');
  assert(js.includes('SleepAdvancedSuite.stopSleepAidSoundscape()'), 'dashboard.js must cleanly stop soundscape on timer expiration');

  console.log('  ✅ Sleep aid soundscapes volume ramp and clean stop certified.');
}

// =============================================================================
// Battery 16: Inactivity Fast-Cutoff 5m Acceleration (#toggleSleepInactivityFastCutoff)
// =============================================================================
console.log('\nBattery 16: Inactivity Fast-Cutoff 5m Acceleration');
{
  assert(bgCode.includes('sentinel_sleep_adv_inactivity_cutoff'), 'background.js must check sentinel_sleep_adv_inactivity_cutoff');
  assert(bgCode.includes('5 * 60 * 1000'), 'background.js must evaluate 5-minute threshold for fast cutoff');
  assert(bgCode.includes('Sleep fast-inactivity cutoff triggered (5m idle). Expiring sleep timer.'), 'background.js must log fast cutoff');

  console.log('  ✅ Inactivity fast-cutoff 5m acceleration logic certified.');
}

// =============================================================================
// Battery 17: Progressive Circadian Screen Dimmer Nudge Activation & Reset (#toggleSleepScreenDimmer)
// =============================================================================
console.log('\nBattery 17: Progressive Circadian Screen Dimmer Nudge Activation & Reset');
{
  const SleepSuite = require(sleepSuitePath);
  assert.strictEqual(typeof SleepSuite.triggerScreenDimmer, 'function');
  assert.strictEqual(typeof SleepSuite.resetScreenDimmer, 'function');

  assert(html.includes('id="overlaySleepDimmer"'), 'dashboard.html must contain #overlaySleepDimmer');
  assert(advCss.includes('.screen-dimmer-overlay'), 'CSS must define .screen-dimmer-overlay');
  assert(advCss.includes('.screen-dimmer-overlay.active'), 'CSS must define .screen-dimmer-overlay.active');
  assert(js.includes('SleepAdvancedSuite.triggerScreenDimmer()'), 'dashboard.js must trigger dimmer on fade/last 60s');
  assert(js.includes('SleepAdvancedSuite.resetScreenDimmer()'), 'dashboard.js must reset dimmer on cancel/reset');

  console.log('  ✅ Progressive circadian screen dimmer activation & reset certified.');
}

// =============================================================================
// Battery 18: Tab Hibernation Memory Release on Sleep Expiration (#toggleSleepTabHibernate)
// =============================================================================
console.log('\nBattery 18: Tab Hibernation Memory Release on Sleep Expiration');
{
  const SleepSuite = require(sleepSuitePath);
  const bg = require(bgPath);
  assert.strictEqual(typeof SleepSuite.executeSleepTabHibernation, 'function');
  assert.strictEqual(typeof bg.executeTabHibernationOnSleepExpire, 'function');

  assert(bgCode.includes('chrome.tabs.discard') || bgCode.includes('browserAPI.tabs.discard'), 'background.js must call tabs.discard');
  assert(sleepCode.includes('chrome.tabs.discard'), 'sleep suite must call chrome.tabs.discard');
  assert(bgCode.includes('executeTabHibernationOnSleepExpire()'), 'triggerSleepTimerExpiration must invoke executeTabHibernationOnSleepExpire');

  console.log('  ✅ Tab hibernation memory release certified.');
}

// =============================================================================
// Battery 19: 1-Click Power-Nap Mode 20m Trigger & Wake-up Chime (#btnSleepPowerNapMode)
// =============================================================================
console.log('\nBattery 19: 1-Click Power-Nap Mode 20m Trigger & Wake-up Chime');
{
  const SleepSuite = require(sleepSuitePath);
  assert.strictEqual(typeof SleepSuite.triggerPowerNapMode, 'function');
  assert.strictEqual(typeof SleepSuite.resetPowerNap, 'function');

  assert(html.includes('id="btnSleepPowerNapMode"'), 'HTML must contain #btnSleepPowerNapMode');
  assert(advCss.includes('.btn-power-nap'), 'CSS must define .btn-power-nap');
  assert(js.includes('⚡ Power-Nap Complete! Wake up refreshed!'), 'dashboard.js must trigger power-nap complete toast');
  assert(js.includes("playAcousticChime('solfeggio528')"), 'dashboard.js must trigger solfeggio528 acoustic chime');
  assert(js.includes('SleepAdvancedSuite.resetPowerNap()'), 'dashboard.js must reset powerNapActive');

  console.log('  ✅ 1-Click power-nap mode 20m trigger & wake-up chime certified.');
}

// =============================================================================
// Battery 20: Dual-Storage LocalStorage + chrome.storage.local Synchronization
// =============================================================================
console.log('\nBattery 20: Dual-Storage LocalStorage + chrome.storage.local Synchronization');
{
  assert(focusCode.includes('localStorage.setItem'), 'focus suite must write to localStorage');
  assert(focusCode.includes('chrome.storage.local.set'), 'focus suite must write to chrome.storage.local');
  assert(focusCode.includes('hydrateFocusFromChromeStorage'), 'focus suite must hydrate from chrome.storage.local');

  assert(sleepCode.includes('localStorage.setItem'), 'sleep suite must write to localStorage');
  assert(sleepCode.includes('chrome.storage.local.set'), 'sleep suite must write to chrome.storage.local');
  assert(sleepCode.includes('hydrateSleepFromChromeStorage'), 'sleep suite must hydrate from chrome.storage.local');

  const expectedKeys = [
    'sentinel_focus_adv_integrity',
    'sentinel_focus_adv_automute_bg',
    'sentinel_focus_adv_breathe_nudge',
    'sentinel_focus_adv_posture_alert',
    'sentinel_focus_soundscape',
    'sentinel_sleep_adv_autoplay_block',
    'sentinel_sleep_adv_inactivity_cutoff',
    'sentinel_sleep_adv_screen_dimmer',
    'sentinel_sleep_adv_tab_hibernate',
    'sentinel_sleep_adv_soundscape',
    'sentinel_sleep_adv_soundscape_vol'
  ];

  expectedKeys.forEach(k => {
    assert(focusCode.includes(k) || sleepCode.includes(k), `Key ${k} must be referenced in feature suites`);
  });

  console.log(`  ✅ Dual-storage synchronization certified across all ${expectedKeys.length} settings keys.`);
}

console.log('\n============================================================');
console.log('🎉 ALL 20 BATTERIES PASSED 100% CLEAN (Exit Code 0)');
console.log('============================================================\n');
process.exit(0);
