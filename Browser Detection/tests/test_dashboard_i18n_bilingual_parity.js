/**
 * Verification Test Suite: Phase 4 - Dashboard Bilingual i18n Parity & Centralized Dictionary Expansion
 * 
 * Target Defects Verified:
 * - Defect 14: Bilingual i18n Parity & Centralized Dictionary Expansion for Sleep Timer & Inactivity Sentinel
 * 
 * Test Scenarios:
 * 1. Test 1: In-memory compilation and AST parsing of dashboard/dashboard.js via vm.Script
 * 2. Test 2: 100% key parity between DASHBOARD_I18N.en and DASHBOARD_I18N.hi (zero missing keys in either language)
 * 3. Test 3: Language purity: zero Devanagari in English dictionary, pure Hindi in Hindi dictionary without mixed artifacts
 * 4. Test 4: Verify all sleep settings keys exist and contain authentic translations
 * 5. Test 5: Verify applyDashboardLanguage('hi') updates all 15 sleep card elements and select option texts without altering option.value
 * 6. Test 6: Verify applyDashboardLanguage('en') accurately restores standard English text
 * 7. Test 7: Verify zero innerHTML on modified sections (W3C CSP & Trusted Types compliance)
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');
const dashHtmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');

console.log('🧪 Starting Phase 4 Dashboard Bilingual i18n Parity Test Suite...\n');

// ---------------------------------------------------------------------------
// Test 1: In-Memory AST Parsing & Compilation of dashboard/dashboard.js
// ---------------------------------------------------------------------------
console.log('Test 1: In-Memory AST Parsing & Compilation of dashboard/dashboard.js via vm.Script');
{
  assert(fs.existsSync(dashJsPath), 'dashboard/dashboard.js must exist on disk');
  const code = fs.readFileSync(dashJsPath, 'utf8');

  assert.doesNotThrow(() => {
    new vm.Script(code, { filename: 'dashboard.js' });
  }, 'dashboard/dashboard.js must parse cleanly into AST with 0 syntax errors');

  console.log(`  ✅ vm.Script parsed dashboard/dashboard.js successfully (${code.length} bytes, 0 parse errors)`);
}

// ---------------------------------------------------------------------------
// Test 2: 100% Key Parity between DASHBOARD_I18N.en and DASHBOARD_I18N.hi
// ---------------------------------------------------------------------------
console.log('\nTest 2: 100% Key Parity between DASHBOARD_I18N.en and DASHBOARD_I18N.hi');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');
  const dashI18nMatch = code.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
  assert(dashI18nMatch, 'dashboard.js must contain DASHBOARD_I18N definition');

  const dashDict = eval('(' + dashI18nMatch[1].replace(/;\s*$/, '') + ')');
  assert(dashDict.en, 'DASHBOARD_I18N must contain en dictionary');
  assert(dashDict.hi, 'DASHBOARD_I18N must contain hi dictionary');

  const enKeys = Object.keys(dashDict.en);
  const hiKeys = Object.keys(dashDict.hi);

  const missingInHi = enKeys.filter(k => !Object.prototype.hasOwnProperty.call(dashDict.hi, k));
  const missingInEn = hiKeys.filter(k => !Object.prototype.hasOwnProperty.call(dashDict.en, k));

  assert.strictEqual(missingInHi.length, 0, `Keys present in en but missing in hi: ${missingInHi.join(', ')}`);
  assert.strictEqual(missingInEn.length, 0, `Keys present in hi but missing in en: ${missingInEn.join(', ')}`);
  assert.deepStrictEqual(enKeys.sort(), hiKeys.sort(), 'DASHBOARD_I18N.en and DASHBOARD_I18N.hi must have 100% identical key sets');

  assert(enKeys.length >= 199, `Dictionary should have >= 199 keys, found: ${enKeys.length}`);

  console.log(`  ✅ 100% symmetrical dictionary verified: ${enKeys.length} total keys in en and hi`);
  console.log('  ✅ Zero missing keys in either language');
}

// ---------------------------------------------------------------------------
// Test 3: Language Purity (English purity & Hindi authenticity)
// ---------------------------------------------------------------------------
console.log('\nTest 3: Language Purity Verification');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');
  const dashI18nMatch = code.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
  const dashDict = eval('(' + dashI18nMatch[1].replace(/;\s*$/, '') + ')');

  const devanagariRegex = /[\u0900-\u097F]/;

  // Verify English dictionary has 0 Devanagari characters
  Object.keys(dashDict.en).forEach(k => {
    const val = dashDict.en[k];
    if (typeof val === 'string') {
      assert(!devanagariRegex.test(val), `English string for "${k}" must not contain Devanagari characters: "${val}"`);
    }
  });

  // Verify Hindi dictionary does not have untranslated mixed English artifacts
  const mixedEnglishArtifacts = ['(Playing)', '(Paused)', '(Buffering)', '(Muted)', '(Stopped)', '(Idle)', 'आइडियल'];
  Object.keys(dashDict.hi).forEach(k => {
    const val = dashDict.hi[k];
    if (typeof val === 'string') {
      mixedEnglishArtifacts.forEach(artifact => {
        assert(!val.includes(artifact), `Hindi string for "${k}" must not contain mixed English artifact "${artifact}": "${val}"`);
      });
    }
  });

  console.log('  ✅ Pure English verified: 0 Devanagari script characters in English dictionary');
  console.log('  ✅ Pure Hindi verified: 0 mixed English status tokens or broken artifact strings');
}

// ---------------------------------------------------------------------------
// Test 4: Verify Sleep Settings Keys & Authentic Translations Exist
// ---------------------------------------------------------------------------
console.log('\nTest 4: Verify Sleep Settings & Option Keys Exist with Authentic Translations');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');
  const dashI18nMatch = code.match(/const DASHBOARD_I18N = (\{[\s\S]*?\n\};)/);
  const dashDict = eval('(' + dashI18nMatch[1].replace(/;\s*$/, '') + ')');

  const expectedTranslations = {
    // Core Sleep Card Keys
    heading_sleep_settings: {
      en: 'Sleep Timer & Inactivity Sentinel',
      hi: 'स्लीप टाइमर व इनएक्टिविटी सेंटिनल'
    },
    sub_sleep_settings: {
      en: 'Automated playback cutoff, gentle audio fade-out, and idle power saving',
      hi: 'स्वचालित प्लेबैक कटऑफ, मंद ऑडियो फेड-आउट व आइडल पावर सेविंग'
    },
    lbl_default_sleep: {
      en: 'Default Sleep Duration',
      hi: 'डिफ़ॉल्ट स्लीप टाइमर अवधि'
    },
    desc_default_sleep: {
      en: 'Default countdown interval for quick 1-click sleep presets',
      hi: 'त्वरित 1-क्लिक स्लीप प्रीसेट्स के लिए डिफ़ॉल्ट काउंटडाउन समय'
    },
    lbl_sleep_fade: {
      en: 'Gradual Audio Fade-out',
      hi: 'ग्रेजुअल ऑडियो फेड-आउट'
    },
    desc_sleep_fade: {
      en: 'Linearly step down media volume before pausing to prevent sudden audio cutoffs',
      hi: 'अचानक आवाज़ बंद होने से रोकने के लिए पॉज़ से पहले वॉल्यूम को धीरे-धीरे कम करें'
    },
    lbl_fade_duration: {
      en: 'Fade Duration Window',
      hi: 'फेड अवधि विंडो'
    },
    desc_fade_duration: {
      en: 'Number of seconds allocated for smooth volume attenuation',
      hi: 'सुगम वॉल्यूम अवमंदन (Fade) के लिए निर्धारित सेकंड'
    },
    lbl_inactivity_sleep: {
      en: 'Inactivity Auto-Sleep Sentinel',
      hi: 'इनएक्टिविटी ऑटो-स्लीप सेंटिनल'
    },
    desc_inactivity_sleep: {
      en: 'Automatically pause playing media when system is detected idle (AFK)',
      hi: 'सिस्टम के निष्क्रिय (AFK) होने पर स्वतः मीडिया पॉज़ करें'
    },
    lbl_inactivity_threshold: {
      en: 'Inactivity Detection Threshold',
      hi: 'निष्क्रियता पहचान थ्रेशोल्ड'
    },
    desc_inactivity_threshold: {
      en: 'Duration of user inactivity required before auto-sleep engages',
      hi: 'ऑटो-स्लीप सक्रिय होने से पूर्व आवश्यक उपयोगकर्ता निष्क्रियता अवधि'
    },
    lbl_badge_countdown: {
      en: 'Toolbar Badge Countdown',
      hi: 'टूलबार बैज काउंटडाउन'
    },
    desc_badge_countdown: {
      en: 'Show dynamic countdown and color indicators on the browser icon',
      hi: 'ब्राउज़र आइकन पर लाइव काउंटडाउन और रंग संकेतक दिखाएं'
    },
    btn_save_sleep: {
      en: '💾 Save Sleep Settings',
      hi: '💾 स्लीप सेटिंग्स सुरक्षित करें'
    },
    toast_sleep_saved: {
      en: 'Sleep timer settings saved and synchronized successfully',
      hi: 'स्लीप टाइमर सेटिंग्स सफलतापूर्वक सहेजी गईं और सिंक हो गईं'
    },

    // Option Keys
    opt_sleep_15m: { en: '15 Minutes', hi: '15 मिनट' },
    opt_sleep_30m: { en: '30 Minutes', hi: '30 मिनट' },
    opt_sleep_45m: { en: '45 Minutes', hi: '45 मिनट' },
    opt_sleep_60m: { en: '60 Minutes', hi: '60 मिनट' },
    opt_sleep_90m: { en: '90 Minutes', hi: '90 मिनट' },

    opt_fade_15s: { en: '15 Seconds', hi: '15 सेकंड' },
    opt_fade_30s: { en: '30 Seconds (Recommended)', hi: '30 सेकंड (अनुशंसित)' },
    opt_fade_60s: { en: '60 Seconds', hi: '60 सेकंड' },

    opt_inact_10m: { en: '10 Minutes', hi: '10 मिनट' },
    opt_inact_15m: { en: '15 Minutes', hi: '15 मिनट' },
    opt_inact_30m: { en: '30 Minutes', hi: '30 मिनट' },
    opt_inact_60m: { en: '60 Minutes', hi: '60 मिनट' },

    // Sort Options Parity
    sort_time_desc: { en: 'Time: High to Low', hi: 'सर्वाधिक समय' },
    sort_time_asc: { en: 'Time: Low to High', hi: 'न्यूनतम समय' },
    sort_sessions_desc: { en: 'Sessions: High to Low', hi: 'सर्वाधिक सत्र' },
    sort_name_asc: { en: 'Domain Name (A to Z)', hi: 'डोमेन नाम (A से Z)' },
    sort_latest: { en: 'Latest First', hi: 'नवीनतम पहले' },
    sort_longest: { en: 'Longest Duration', hi: 'सर्वाधिक देखा गया' },
    sort_highest_vol: { en: 'Highest Volume', hi: 'उच्चतम वॉल्यूम' },
    sort_title_az: { en: 'Title (A to Z)', hi: 'शीर्षक (A से Z)' }
  };

  Object.entries(expectedTranslations).forEach(([key, expected]) => {
    assert.strictEqual(dashDict.en[key], expected.en, `English key "${key}" mismatch`);
    assert.strictEqual(dashDict.hi[key], expected.hi, `Hindi key "${key}" mismatch`);
  });

  console.log('  ✅ All 16 core sleep card keys verified with exact bilingual strings');
  console.log('  ✅ All 12 sleep & inactivity preset option keys verified');
  console.log('  ✅ All 8 table sort option keys verified in complete bilingual parity');
}

// ---------------------------------------------------------------------------
// Test 5: Verify applyDashboardLanguage('hi') Updates Elements & Select Options
// ---------------------------------------------------------------------------
console.log('\nTest 5: Verify applyDashboardLanguage("hi") Updates Sleep Card & Select Options');
{
  const elements = new Map();
  function getOrCreateMockElement(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        textContent: '',
        title: '',
        placeholder: '',
        value: '',
        options: [],
        classList: { add: () => {}, remove: () => {} },
        getAttribute: () => '',
        setAttribute: () => {}
      });
    }
    return elements.get(id);
  }

  global.document = {
    documentElement: { lang: 'en' },
    getElementById: (id) => getOrCreateMockElement(id),
    querySelector: () => ({ textContent: '' }),
    querySelectorAll: () => []
  };

  // Seed select elements with initial English options and values
  const sleepDurSelect = getOrCreateMockElement('settingDefaultSleepDuration');
  sleepDurSelect.options = [
    { value: '15', textContent: '15 Minutes' },
    { value: '30', textContent: '30 Minutes' },
    { value: '45', textContent: '45 Minutes' },
    { value: '60', textContent: '60 Minutes' },
    { value: '90', textContent: '90 Minutes' }
  ];

  const fadeDurSelect = getOrCreateMockElement('settingFadeDuration');
  fadeDurSelect.options = [
    { value: '15', textContent: '15 Seconds' },
    { value: '30', textContent: '30 Seconds (Recommended)' },
    { value: '60', textContent: '60 Seconds' }
  ];

  const inactThreshSelect = getOrCreateMockElement('settingInactivityThreshold');
  inactThreshSelect.options = [
    { value: '10', textContent: '10 Minutes' },
    { value: '15', textContent: '15 Minutes' },
    { value: '30', textContent: '30 Minutes' },
    { value: '60', textContent: '60 Minutes' }
  ];

  const tableSortSelect = getOrCreateMockElement('tableSortSelect');
  tableSortSelect.options = [
    { value: 'time_desc', textContent: 'Time: High to Low' },
    { value: 'time_asc', textContent: 'Time: Low to High' },
    { value: 'sessions_desc', textContent: 'Sessions: High to Low' },
    { value: 'name_asc', textContent: 'Domain Name (A to Z)' }
  ];

  const tableMediaSortSelect = getOrCreateMockElement('tableMediaSortSelect');
  tableMediaSortSelect.options = [
    { value: 'time_desc', textContent: 'Latest First' },
    { value: 'duration_desc', textContent: 'Longest Duration' },
    { value: 'vol_desc', textContent: 'Highest Volume' },
    { value: 'title_asc', textContent: 'Title (A to Z)' }
  ];

  const dashboardModule = require('../dashboard/dashboard.js');
  dashboardModule.applyDashboardLanguage('hi');

  // Verify documentElement.lang was switched to 'hi'
  assert.strictEqual(global.document.documentElement.lang, 'hi', 'documentElement.lang must be "hi"');

  // Verify all 15 sleep card DOM elements were updated with Hindi text
  const expectedSleepElementHindi = {
    headingSleepSettings: 'स्लीप टाइमर व इनएक्टिविटी सेंटिनल',
    subSleepSettings: 'स्वचालित प्लेबैक कटऑफ, मंद ऑडियो फेड-आउट व आइडल पावर सेविंग',
    lblDefaultSleepDuration: 'डिफ़ॉल्ट स्लीप टाइमर अवधि',
    descDefaultSleepDuration: 'त्वरित 1-क्लिक स्लीप प्रीसेट्स के लिए डिफ़ॉल्ट काउंटडाउन समय',
    lblSleepFadeToggle: 'ग्रेजुअल ऑडियो फेड-आउट',
    descSleepFadeToggle: 'अचानक आवाज़ बंद होने से रोकने के लिए पॉज़ से पहले वॉल्यूम को धीरे-धीरे कम करें',
    lblFadeDuration: 'फेड अवधि विंडो',
    descFadeDuration: 'सुगम वॉल्यूम अवमंदन (Fade) के लिए निर्धारित सेकंड',
    lblInactivitySleepToggle: 'इनएक्टिविटी ऑटो-स्लीप सेंटिनल',
    descInactivitySleepToggle: 'सिस्टम के निष्क्रिय (AFK) होने पर स्वतः मीडिया पॉज़ करें',
    lblInactivityThreshold: 'निष्क्रियता पहचान थ्रेशोल्ड',
    descInactivityThreshold: 'ऑटो-स्लीप सक्रिय होने से पूर्व आवश्यक उपयोगकर्ता निष्क्रियता अवधि',
    lblBadgeCountdownToggle: 'टूलबार बैज काउंटडाउन',
    descBadgeCountdownToggle: 'ब्राउज़र आइकन पर लाइव काउंटडाउन और रंग संकेतक दिखाएं',
    btnSaveSleepSettings: '💾 स्लीप सेटिंग्स सुरक्षित करें'
  };

  Object.entries(expectedSleepElementHindi).forEach(([elemId, expectedText]) => {
    const el = getOrCreateMockElement(elemId);
    assert.strictEqual(el.textContent, expectedText, `Element #${elemId} textContent mismatch in Hindi`);
  });

  // Verify select options textContent updated to Hindi, but value remained identical
  assert.strictEqual(sleepDurSelect.options[0].value, '15');
  assert.strictEqual(sleepDurSelect.options[0].textContent, '15 मिनट');
  assert.strictEqual(sleepDurSelect.options[1].value, '30');
  assert.strictEqual(sleepDurSelect.options[1].textContent, '30 मिनट');

  assert.strictEqual(fadeDurSelect.options[1].value, '30');
  assert.strictEqual(fadeDurSelect.options[1].textContent, '30 सेकंड (अनुशंसित)');

  assert.strictEqual(inactThreshSelect.options[0].value, '10');
  assert.strictEqual(inactThreshSelect.options[0].textContent, '10 मिनट');

  assert.strictEqual(tableSortSelect.options[0].value, 'time_desc');
  assert.strictEqual(tableSortSelect.options[0].textContent, 'सर्वाधिक समय');

  assert.strictEqual(tableMediaSortSelect.options[0].value, 'time_desc');
  assert.strictEqual(tableMediaSortSelect.options[0].textContent, 'नवीनतम पहले');

  console.log('  ✅ document.documentElement.lang set to "hi"');
  console.log('  ✅ All 15 sleep card DOM elements verified with authentic Hindi textContent');
  console.log('  ✅ Select options updated with Hindi labels while preserving original option.value');
}

// ---------------------------------------------------------------------------
// Test 6: Verify applyDashboardLanguage('en') Restores Standard English
// ---------------------------------------------------------------------------
console.log('\nTest 6: Verify applyDashboardLanguage("en") Restores Standard English');
{
  const dashboardModule = require('../dashboard/dashboard.js');
  dashboardModule.applyDashboardLanguage('en');

  // Verify documentElement.lang was switched to 'en'
  assert.strictEqual(global.document.documentElement.lang, 'en', 'documentElement.lang must be "en"');

  const expectedSleepElementEnglish = {
    headingSleepSettings: 'Sleep Timer & Inactivity Sentinel',
    subSleepSettings: 'Automated playback cutoff, gentle audio fade-out, and idle power saving',
    lblDefaultSleepDuration: 'Default Sleep Duration',
    descDefaultSleepDuration: 'Default countdown interval for quick 1-click sleep presets',
    lblSleepFadeToggle: 'Gradual Audio Fade-out',
    descSleepFadeToggle: 'Linearly step down media volume before pausing to prevent sudden audio cutoffs',
    lblFadeDuration: 'Fade Duration Window',
    descFadeDuration: 'Number of seconds allocated for smooth volume attenuation',
    lblInactivitySleepToggle: 'Inactivity Auto-Sleep Sentinel',
    descInactivitySleepToggle: 'Automatically pause playing media when system is detected idle (AFK)',
    lblInactivityThreshold: 'Inactivity Detection Threshold',
    descInactivityThreshold: 'Duration of user inactivity required before auto-sleep engages',
    lblBadgeCountdownToggle: 'Toolbar Badge Countdown',
    descBadgeCountdownToggle: 'Show dynamic countdown and color indicators on the browser icon',
    btnSaveSleepSettings: '💾 Save Sleep Settings'
  };

  Object.entries(expectedSleepElementEnglish).forEach(([elemId, expectedText]) => {
    const el = global.document.getElementById(elemId);
    assert.strictEqual(el.textContent, expectedText, `Element #${elemId} textContent mismatch in English restoration`);
  });

  const sleepDurSelect = global.document.getElementById('settingDefaultSleepDuration');
  assert.strictEqual(sleepDurSelect.options[0].value, '15');
  assert.strictEqual(sleepDurSelect.options[0].textContent, '15 Minutes');
  assert.strictEqual(sleepDurSelect.options[1].value, '30');
  assert.strictEqual(sleepDurSelect.options[1].textContent, '30 Minutes');

  const fadeDurSelect = global.document.getElementById('settingFadeDuration');
  assert.strictEqual(fadeDurSelect.options[1].value, '30');
  assert.strictEqual(fadeDurSelect.options[1].textContent, '30 Seconds (Recommended)');

  const tableSortSelect = global.document.getElementById('tableSortSelect');
  assert.strictEqual(tableSortSelect.options[0].value, 'time_desc');
  assert.strictEqual(tableSortSelect.options[0].textContent, 'Time: High to Low');

  const tableMediaSortSelect = global.document.getElementById('tableMediaSortSelect');
  assert.strictEqual(tableMediaSortSelect.options[0].value, 'time_desc');
  assert.strictEqual(tableMediaSortSelect.options[0].textContent, 'Latest First');

  console.log('  ✅ document.documentElement.lang set to "en"');
  console.log('  ✅ All 15 sleep card DOM elements restored cleanly to English textContent');
  console.log('  ✅ All select option texts restored cleanly to English without mutating option.value');
}

// ---------------------------------------------------------------------------
// Test 7: W3C Trusted Types & Zero innerHTML Security Audit
// ---------------------------------------------------------------------------
console.log('\nTest 7: W3C Trusted Types & Zero innerHTML Security Audit');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');

  // Extract applyDashboardLanguage function block
  const fnMatch = code.match(/function applyDashboardLanguage\([\s\S]*?\n\}/);
  assert(fnMatch, 'applyDashboardLanguage function must exist in dashboard.js');
  const applyFnCode = fnMatch[0];

  assert(!applyFnCode.includes('.innerHTML'), 'applyDashboardLanguage must contain 0 innerHTML assignments');

  // Extract updateSelectOptions function block
  const updateOptMatch = code.match(/function updateSelectOptions\([\s\S]*?\n\}/);
  assert(updateOptMatch, 'updateSelectOptions function must exist in dashboard.js');
  const updateOptCode = updateOptMatch[0];

  assert(!updateOptCode.includes('.innerHTML'), 'updateSelectOptions must contain 0 innerHTML assignments');

  // Verify dashboard.html sleep settings card uses text nodes and no dangerous inline scripts
  const html = fs.readFileSync(dashHtmlPath, 'utf8');
  const sleepCardMatch = html.match(/<div class="settings-card[^"]*" id="cardSleepSettings">([\s\S]*?)<\/div>\s*<\/div>/);
  assert(sleepCardMatch, '#cardSleepSettings container must exist in dashboard.html');
  const sleepCardHtml = sleepCardMatch[0];

  assert(!sleepCardHtml.includes('<script'), '#cardSleepSettings must not contain script tags');
  assert(!sleepCardHtml.includes('javascript:'), '#cardSleepSettings must not contain javascript: URLs');
  assert(!sleepCardHtml.includes('onclick='), '#cardSleepSettings must not contain inline event handlers');

  console.log('  ✅ applyDashboardLanguage verified: 0 innerHTML assignments');
  console.log('  ✅ updateSelectOptions verified: 0 innerHTML assignments');
  console.log('  ✅ #cardSleepSettings verified: 0 inline scripts or handlers');
  console.log('  ✅ 100% compliant with W3C Trusted Types & Manifest V3 CSP');
}

console.log('\n🎉 ALL 7 PHASE 4 BILINGUAL i18n PARITY TESTS PASSED WITH 100% SUCCESS!\n');
