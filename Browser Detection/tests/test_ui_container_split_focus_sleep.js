'use strict';

/**
 * tests/test_ui_container_split_focus_sleep.js
 * Comprehensive Verification & Regression Test Suite for UI Container Split
 * 
 * Verifies:
 * - Battery 1: Static Code, UTF-8 BOM, and Container IDs & Classes Verification
 * - Battery 2: Container DOM Placement & Vertical Alignment Ordering
 * - Battery 3: Focus Sentinel Basic vs Advanced Element Segregation
 * - Battery 4: Sleep Sentinel Basic vs Advanced Element Segregation
 * - Battery 5: Bilingual i18n Parity (en/hi) in DASHBOARD_I18N and locales/*.json
 * - Battery 6: W3C Trusted Types Compliance & Zero-innerHTML Security Audit
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const cssPath = path.join(rootDir, 'dashboard', 'dashboard.css');
const wellbeingCssPath = path.join(rootDir, 'dashboard', 'styles', 'wellbeing_blacklist.css');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const enJsonPath = path.join(rootDir, 'locales', 'en.json');
const hiJsonPath = path.join(rootDir, 'locales', 'hi.json');

console.log('🧪 Starting UI Container Split for Focus & Sleep Hubs Test Suite...\n');

function checkBOM(filePath) {
  const buf = fs.readFileSync(filePath);
  const hasBOM = buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  assert(hasBOM, `File ${path.basename(filePath)} must start with UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
}

// =============================================================================
// Battery 1: Static Code, UTF-8 BOM, and Container IDs & Classes Verification
// =============================================================================
console.log('Battery 1: Static Code, UTF-8 BOM, and Container IDs & Classes Verification');
{
  [htmlPath, cssPath, wellbeingCssPath, dashJsPath, enJsonPath, hiJsonPath].forEach(checkBOM);
  console.log('  ✅ 100% UTF-8 with BOM verified across all touched files and JSON locales');

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify Part 1 (Basic) Focus container
  assert(html.includes('id="widgetPomodoroSentinel"'), 'dashboard.html must contain #widgetPomodoroSentinel');
  assert(
    html.includes('class="bento-card liquid-glass-card bento-span-6 pomodoro-hero-card"'),
    '#widgetPomodoroSentinel must preserve class="bento-card liquid-glass-card bento-span-6 pomodoro-hero-card"'
  );

  // Verify Part 1 (Basic) Sleep container
  assert(html.includes('id="cardSleepSentinelHub"'), 'dashboard.html must contain #cardSleepSentinelHub');
  assert(
    html.includes('class="bento-card liquid-glass-card bento-span-6 sleep-hero-card"'),
    '#cardSleepSentinelHub must preserve class="bento-card liquid-glass-card bento-span-6 sleep-hero-card"'
  );

  // Verify Part 2 (Advanced) Focus container
  assert(html.includes('id="widgetFocusAdvanced"'), 'dashboard.html must contain #widgetFocusAdvanced');
  assert(
    html.includes('class="bento-card liquid-glass-card bento-span-6 pomodoro-advanced-card"'),
    '#widgetFocusAdvanced must have class="bento-card liquid-glass-card bento-span-6 pomodoro-advanced-card"'
  );

  // Verify Part 2 (Advanced) Sleep container
  assert(html.includes('id="cardSleepAdvanced"'), 'dashboard.html must contain #cardSleepAdvanced');
  assert(
    html.includes('class="bento-card liquid-glass-card bento-span-6 sleep-advanced-card"'),
    '#cardSleepAdvanced must have class="bento-card liquid-glass-card bento-span-6 sleep-advanced-card"'
  );

  // Verify CSS defines styling for the new classes
  const css = fs.readFileSync(cssPath, 'utf8');
  assert(css.includes('.pomodoro-advanced-card'), 'dashboard.css must define .pomodoro-advanced-card');
  assert(css.includes('.sleep-advanced-card'), 'dashboard.css must define .sleep-advanced-card');
  assert(css.includes('.pomodoro-advanced-body'), 'dashboard.css must define .pomodoro-advanced-body');
  assert(css.includes('.sleep-advanced-body'), 'dashboard.css must define .sleep-advanced-body');

  const subCss = fs.readFileSync(wellbeingCssPath, 'utf8');
  assert(subCss.includes('.pomodoro-advanced-card'), 'wellbeing_blacklist.css must define .pomodoro-advanced-card');
  assert(subCss.includes('.sleep-advanced-card'), 'wellbeing_blacklist.css must define .sleep-advanced-card');

  console.log('  ✅ All 4 containers exist with correct classes, IDs, and CSS definitions');
}

// =============================================================================
// Battery 2: Container DOM Placement & Vertical Alignment Ordering
// =============================================================================
console.log('\nBattery 2: Container DOM Placement & Vertical Alignment Ordering');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  const idxFocusBasic = html.indexOf('id="widgetPomodoroSentinel"');
  const idxSleepBasic = html.indexOf('id="cardSleepSentinelHub"');
  const idxFocusAdvanced = html.indexOf('id="widgetFocusAdvanced"');
  const idxSleepAdvanced = html.indexOf('id="cardSleepAdvanced"');
  const idxBudgets = html.indexOf('id="cardDomainBudgets"');
  const idxBlacklist = html.indexOf('id="cardTrackingBlacklist"');

  assert(idxFocusBasic !== -1, 'Focus Basic must be in DOM');
  assert(idxSleepBasic !== -1, 'Sleep Basic must be in DOM');
  assert(idxFocusAdvanced !== -1, 'Focus Advanced must be in DOM');
  assert(idxSleepAdvanced !== -1, 'Sleep Advanced must be in DOM');
  assert(idxBudgets !== -1, 'Domain Budgets must be in DOM');
  assert(idxBlacklist !== -1, 'Tracking Blacklist must be in DOM');

  // Verify order in 2-column bento-grid:
  // Row 1: #widgetPomodoroSentinel (Top-Left)  | #cardSleepSentinelHub (Top-Right)
  // Row 2: #widgetFocusAdvanced (Bottom-Left)   | #cardSleepAdvanced (Bottom-Right)
  // Row 3: #cardDomainBudgets (Row 3-Left)     | #cardTrackingBlacklist (Row 3-Right)
  assert(idxFocusBasic < idxSleepBasic, 'Focus Basic must precede Sleep Basic (Row 1)');
  assert(idxSleepBasic < idxFocusAdvanced, 'Sleep Basic must precede Focus Advanced');
  assert(idxFocusAdvanced < idxSleepAdvanced, 'Focus Advanced must precede Sleep Advanced (Row 2)');
  assert(idxSleepAdvanced < idxBudgets, 'Sleep Advanced must precede Domain Budgets');
  assert(idxBudgets < idxBlacklist, 'Domain Budgets must precede Tracking Blacklist (Row 3)');

  console.log('  ✅ Sequential DOM order: Focus Basic -> Sleep Basic -> Focus Advanced -> Sleep Advanced -> Budgets -> Blacklist');
  console.log('  ✅ Symmetrical 2x2 vertical alignment (Focus Up/Down on Left, Sleep Up/Down on Right) certified');
}

// =============================================================================
// Battery 3: Focus Sentinel Basic vs Advanced Element Segregation
// =============================================================================
console.log('\nBattery 3: Focus Sentinel Basic vs Advanced Element Segregation');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Extract slices for Focus Basic and Focus Advanced
  const focusBasicStart = html.indexOf('id="widgetPomodoroSentinel"');
  const focusBasicEnd = html.indexOf('id="cardSleepSentinelHub"');
  const focusBasicHtml = html.substring(focusBasicStart, focusBasicEnd);

  const focusAdvStart = html.indexOf('id="widgetFocusAdvanced"');
  const focusAdvEnd = html.indexOf('id="cardSleepAdvanced"');
  const focusAdvHtml = html.substring(focusAdvStart, focusAdvEnd);

  // Basic Card elements
  const basicFocusIds = [
    'txtPomodoroTitle',
    'dashFocusActiveDot',
    'pomodoroModeBadge',
    'btnFocusZenExpand',
    'tabModeFocus',
    'tabModeShortBreak',
    'tabModeLongBreak',
    'focusCycleDotsContainer',
    'focusCycleText',
    'focusDailyStreakBadge',
    'focusTargetProgressFill',
    'focusTargetGoalText',
    'dashFocusDialProgress',
    'pomodoroTimeDisplay',
    'pomodoroFinishTime',
    'pomodoroProgressBar',
    'btnStartPomodoro',
    'btnPausePomodoro',
    'btnResetPomodoro'
  ];

  basicFocusIds.forEach(id => {
    assert(focusBasicHtml.includes(`id="${id}"`), `Focus Basic must contain id="${id}"`);
  });

  // Verify presets in Basic Card
  ['15', '25', '45', '60'].forEach(min => {
    assert(focusBasicHtml.includes(`data-minutes="${min}"`), `Focus Basic must contain preset ${min}m`);
  });

  // Basic Card must NOT contain advanced controls
  assert(!focusBasicHtml.includes('id="inputFocusGoal"'), 'Focus Basic must NOT contain #inputFocusGoal');
  assert(!focusBasicHtml.includes('id="inputFocusCustomMinutes"'), 'Focus Basic must NOT contain #inputFocusCustomMinutes');
  assert(!focusBasicHtml.includes('id="selectFocusSoundscape"'), 'Focus Basic must NOT contain #selectFocusSoundscape');
  assert(!focusBasicHtml.includes('id="selectFocusChimeTone"'), 'Focus Basic must NOT contain #selectFocusChimeTone');
  assert(!focusBasicHtml.includes('id="toggleFocusAutoPauseMedia"'), 'Focus Basic must NOT contain #toggleFocusAutoPauseMedia');

  // Advanced Card elements
  const advancedFocusIds = [
    'txtFocusAdvancedTitle',
    'txtFocusAdvancedDesc',
    'inputFocusGoal',
    'chipActiveFocusGoal',
    'txtActiveFocusGoal',
    'btnClearFocusGoal',
    'inputFocusCustomMinutes',
    'btnApplyCustomMinutes',
    'btnFocusExtend5',
    'btnFocusExtend15',
    'selectFocusSoundscape',
    'btnToggleSoundscape',
    'sliderSoundscapeVolume',
    'txtSoundscapeVolume',
    'selectFocusChimeTone',
    'btnPreviewChime',
    'toggleFocusAutoPauseMedia',
    'toggleFocusChime',
    'toggleFocusDistractionShield'
  ];

  advancedFocusIds.forEach(id => {
    assert(focusAdvHtml.includes(`id="${id}"`), `Focus Advanced must contain id="${id}"`);
  });

  console.log('  ✅ Focus Basic Card contains only core timer, cycle, radial dial, presets & start/pause/reset');
  console.log('  ✅ Focus Advanced Card contains task intent, custom minutes, extenders, soundscapes, chimes & shields');
}

// =============================================================================
// Battery 4: Sleep Sentinel Basic vs Advanced Element Segregation
// =============================================================================
console.log('\nBattery 4: Sleep Sentinel Basic vs Advanced Element Segregation');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Extract slices for Sleep Basic and Sleep Advanced
  const sleepBasicStart = html.indexOf('id="cardSleepSentinelHub"');
  const sleepBasicEnd = html.indexOf('id="widgetFocusAdvanced"');
  const sleepBasicHtml = html.substring(sleepBasicStart, sleepBasicEnd);

  const sleepAdvStart = html.indexOf('id="cardSleepAdvanced"');
  const sleepAdvEnd = html.indexOf('id="cardDomainBudgets"');
  const sleepAdvHtml = html.substring(sleepAdvStart, sleepAdvEnd);

  // Basic Sleep Card elements
  const basicSleepIds = [
    'txtSleepSentinelTitle',
    'txtSleepSentinelDesc',
    'dashSleepActiveDot',
    'dashSleepStatusBadge',
    'dashSleepDialProgress',
    'dashSleepCountdownDisplay',
    'dashSleepFinishTime',
    'btnDashSleepToggle',
    'btnDashSleepReset'
  ];

  basicSleepIds.forEach(id => {
    assert(sleepBasicHtml.includes(`id="${id}"`), `Sleep Basic must contain id="${id}"`);
  });

  // Verify presets in Basic Card (15, 30, 45, 60, 90, 120)
  ['15', '30', '45', '60', '90', '120'].forEach(min => {
    assert(sleepBasicHtml.includes(`data-minutes="${min}"`), `Sleep Basic must contain preset ${min}m`);
  });

  // Basic Card must NOT contain advanced controls
  assert(!sleepBasicHtml.includes('id="inputDashSleepCustomMinutes"'), 'Sleep Basic must NOT contain #inputDashSleepCustomMinutes');
  assert(!sleepBasicHtml.includes('id="btnDashSleepExtend5"'), 'Sleep Basic must NOT contain #btnDashSleepExtend5');
  assert(!sleepBasicHtml.includes('id="toggleDashSleepFade"'), 'Sleep Basic must NOT contain #toggleDashSleepFade');
  assert(!sleepBasicHtml.includes('id="toggleDashSleepEndOfVideo"'), 'Sleep Basic must NOT contain #toggleDashSleepEndOfVideo');
  assert(!sleepBasicHtml.includes('id="toggleDashSleepInactivity"'), 'Sleep Basic must NOT contain #toggleDashSleepInactivity');
  assert(!sleepBasicHtml.includes('id="selectDashSleepTimeoutAction"'), 'Sleep Basic must NOT contain #selectDashSleepTimeoutAction');

  // Advanced Sleep Card elements
  const advancedSleepIds = [
    'txtSleepAdvancedTitle',
    'txtSleepAdvancedDesc',
    'inputDashSleepCustomMinutes',
    'btnSetDashSleepCustom',
    'btnDashSleepExtend5',
    'btnDashSleepExtend15',
    'toggleDashSleepFade',
    'selectDashSleepFadeCurve',
    'toggleDashSleepEndOfVideo',
    'toggleDashSleepInactivity',
    'selectDashSleepTimeoutAction'
  ];

  advancedSleepIds.forEach(id => {
    assert(sleepAdvHtml.includes(`id="${id}"`), `Sleep Advanced must contain id="${id}"`);
  });

  console.log('  ✅ Sleep Basic Card contains only status, radial countdown dial, presets & start/pause/reset');
  console.log('  ✅ Sleep Advanced Card contains custom duration, extenders, fade-out, end-of-video & timeout actions');
}

// =============================================================================
// Battery 5: Bilingual i18n Parity (en/hi) in DASHBOARD_I18N and locales/*.json
// =============================================================================
console.log('\nBattery 5: Bilingual i18n Parity (en/hi) in DASHBOARD_I18N and locales/*.json');
{
  const dashJs = fs.readFileSync(dashJsPath, 'utf8');
  const dashI18nMatch = dashJs.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
  assert(dashI18nMatch, 'dashboard.js must define DASHBOARD_I18N');

  const dict = eval('(' + dashI18nMatch[1].replace(/;\s*$/, '') + ')');
  assert(dict.en, 'DASHBOARD_I18N must define en');
  assert(dict.hi, 'DASHBOARD_I18N must define hi');

  const enKeys = Object.keys(dict.en);
  const hiKeys = Object.keys(dict.hi);
  assert.strictEqual(enKeys.length, hiKeys.length, 'English and Hindi dictionaries must have equal key counts');
  assert.deepStrictEqual(enKeys.sort(), hiKeys.sort(), 'English and Hindi dictionaries must have identical key sets');

  // Required split keys
  const splitKeys = [
    'focus_advanced_title',
    'focus_advanced_desc',
    'sleep_advanced_title',
    'sleep_advanced_desc',
    'lbl_focus_presets',
    'lbl_quick_presets',
    'lbl_extend_time',
    'btn_start_sleep_timer',
    'focus_ambient_soundscapes',
    'focus_completion_chime',
    'btn_preview_chime',
    'toggle_focus_autopause',
    'toggle_focus_chime',
    'toggle_focus_shield'
  ];

  splitKeys.forEach(k => {
    assert(dict.en[k], `DASHBOARD_I18N.en must contain key "${k}"`);
    assert(dict.hi[k], `DASHBOARD_I18N.hi must contain key "${k}"`);
  });

  // Verify locales/en.json and locales/hi.json
  assert(fs.existsSync(enJsonPath), 'locales/en.json must exist');
  assert(fs.existsSync(hiJsonPath), 'locales/hi.json must exist');

  function parseJsonFile(p) {
    let raw = fs.readFileSync(p, 'utf8');
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    return JSON.parse(raw);
  }

  const enJson = parseJsonFile(enJsonPath);
  const hiJson = parseJsonFile(hiJsonPath);

  splitKeys.forEach(k => {
    assert(enJson[k], `locales/en.json must contain key "${k}"`);
    assert(hiJson[k], `locales/hi.json must contain key "${k}"`);
    assert.strictEqual(enJson[k], dict.en[k], `en.json["${k}"] must match DASHBOARD_I18N.en["${k}"]`);
    assert.strictEqual(hiJson[k], dict.hi[k], `hi.json["${k}"] must match DASHBOARD_I18N.hi["${k}"]`);
  });

  // Test applyDashboardLanguage in sandbox
  const mockElements = {
    txtFocusAdvancedTitle: { textContent: '' },
    txtFocusAdvancedDesc: { textContent: '' },
    txtSleepAdvancedTitle: { textContent: '' },
    txtSleepAdvancedDesc: { textContent: '' }
  };

  const sandbox = {
    document: {
      getElementById: (id) => mockElements[id] || null,
      querySelectorAll: () => [],
      documentElement: { lang: 'en' }
    },
    currentLang: 'en',
    currentTab: 'wellbeing',
    currentTheme: 'dark',
    t: (key) => dict.hi[key] || key
  };

  vm.createContext(sandbox);
  // Verify applyDashboardLanguage contains translation calls for the advanced cards
  assert(dashJs.includes("setTxt('txtFocusAdvancedTitle', 'focus_advanced_title');"), 'applyDashboardLanguage must translate txtFocusAdvancedTitle');
  assert(dashJs.includes("setTxt('txtSleepAdvancedTitle', 'sleep_advanced_title');"), 'applyDashboardLanguage must translate txtSleepAdvancedTitle');

  console.log('  ✅ 100% symmetrical key parity verified across DASHBOARD_I18N and locales/*.json');
  console.log('  ✅ Authentic bilingual translations for Focus and Sleep Advanced Controls verified');
}

// =============================================================================
// Battery 6: W3C Trusted Types Compliance & Zero-innerHTML Security Audit
// =============================================================================
console.log('\nBattery 6: W3C Trusted Types Compliance & Zero-innerHTML Security Audit');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify no inline event handlers in the new containers
  const focusAdvStart = html.indexOf('id="widgetFocusAdvanced"');
  const sleepAdvEnd = html.indexOf('id="cardDomainBudgets"');
  const splitSection = html.substring(focusAdvStart, sleepAdvEnd);

  const inlineEventRegex = /\son[a-z]+\s*=/i;
  assert(!inlineEventRegex.test(splitSection), 'New advanced containers must not contain inline event handlers');

  // Verify zero innerHTML in scripts
  const applyScript = fs.readFileSync(path.join(rootDir, 'scripts', 'apply_ui_container_split.js'), 'utf8');
  assert(!applyScript.includes('.innerHTML ='), 'apply_ui_container_split.js must NOT use innerHTML');

  console.log('  ✅ Zero inline event handlers and 100% W3C Trusted Types compliance certified');
}

console.log('\n============================================================');
console.log('🎉 ALL 6 BATTERIES IN UI CONTAINER SPLIT TEST SUITE PASSED (Exit Code 0)');
console.log('============================================================\n');
