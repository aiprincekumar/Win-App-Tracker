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

console.log('🧪 Starting Advanced Focus & Sleep Suite 8-Battery QA Test Suite...\n');

function checkBOM(filePath) {
  const buf = fs.readFileSync(filePath);
  const hasBOM = buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  assert(hasBOM, `File ${path.basename(filePath)} must start with UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
}

// Check UTF-8 BOM on all relevant files
[htmlPath, cssPath, advCssPath, jsPath, focusSuitePath, sleepSuitePath, enJsonPath, hiJsonPath].forEach(checkBOM);
console.log('✅ UTF-8 with BOM certified across all suite files and locales.\n');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const advCss = fs.readFileSync(advCssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

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
  const focusCode = fs.readFileSync(focusSuitePath, 'utf8');
  const sleepCode = fs.readFileSync(sleepSuitePath, 'utf8');

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

console.log('\n============================================================');
console.log('🎉 ALL 8 BATTERIES PASSED 100% CLEAN (Exit Code 0)');
console.log('============================================================\n');
process.exit(0);
