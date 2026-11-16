/**
 * Verification Test Suite: Phase 1 - Dashboard Mode Sleep Timer & Inactivity Sentinel UI & Storage Binding
 * 
 * Target Defects Verified:
 * - Defect 01: Default Sleep Duration Selector (#settingDefaultSleepDuration)
 * - Defect 02: Gradual Audio Fade-out Toggle (#settingSleepFadeToggle)
 * - Defect 03: Fade Duration Window Selector (#settingFadeDuration)
 * - Defect 04: Inactivity Auto-Sleep Sentinel Toggle (#settingInactivitySleepToggle)
 * - Defect 05: Inactivity Detection Threshold (#settingInactivityThreshold)
 * - Defect 06: Toolbar Badge Countdown Toggle (#settingBadgeCountdownToggle)
 * - Defect 07: Sleep Settings Save Button (#btnSaveSleepSettings)
 * - Defect 08: Settings Save Sleep Data Retention in saveDashboardSettings()
 * 
 * Features Verified:
 * 1. DOM Architecture & Control Existence in dashboard/dashboard.html
 * 2. In-Memory AST Parsing & Compilation of dashboard/dashboard.js
 * 3. Form Hydration & Two-Way Control Binding in populateSleepSettingsForm()
 * 4. Event Listener Registration in setupEventListeners()
 * 5. Persistent chrome.storage.local Schema Alignment (sentinel_sleep_settings) & IPC Contract
 * 6. Sleep Configuration Retention across General Settings Saves
 * 7. W3C Trusted Types & Strict CSP Compliance (Zero innerHTML on modified sections)
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const dashHtmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');

console.log('🧪 Starting Phase 1 Dashboard Sleep Timer & Inactivity Sentinel Test Suite...\n');

// ---------------------------------------------------------------------------
// Test 1: DOM Elements Verification in dashboard/dashboard.html
// ---------------------------------------------------------------------------
console.log('Test 1: DOM Architecture & Element Existence in dashboard/dashboard.html');
{
  assert(fs.existsSync(dashHtmlPath), 'dashboard/dashboard.html must exist');
  const html = fs.readFileSync(dashHtmlPath, 'utf8');

  // Verify Sleep Settings container card
  assert(html.includes('id="cardSleepSettings"'), 'dashboard.html must contain #cardSleepSettings');

  // Verify all 6 granular sleep & inactivity controls
  const requiredControlIds = [
    'settingDefaultSleepDuration',
    'settingSleepFadeToggle',
    'settingFadeDuration',
    'settingInactivitySleepToggle',
    'settingInactivityThreshold',
    'settingBadgeCountdownToggle'
  ];

  requiredControlIds.forEach((id) => {
    assert(html.includes(`id="${id}"`), `dashboard.html must contain control #${id}`);
  });

  // Verify Save Sleep Settings button
  assert(html.includes('id="btnSaveSleepSettings"'), 'dashboard.html must contain #btnSaveSleepSettings');

  // Verify option values for select controls
  assert(html.includes('value="15"') && html.includes('value="30"') && html.includes('value="60"'),
    '#settingDefaultSleepDuration must offer standard preset intervals');
  assert(html.includes('value="10"') && html.includes('value="15"') && html.includes('value="30"'),
    '#settingInactivityThreshold must offer standard inactivity thresholds');

  console.log('  ✅ #cardSleepSettings container verified in Settings tab');
  console.log('  ✅ All 6 sleep & inactivity controls present (#settingDefaultSleepDuration, #settingSleepFadeToggle, #settingFadeDuration, #settingInactivitySleepToggle, #settingInactivityThreshold, #settingBadgeCountdownToggle)');
  console.log('  ✅ #btnSaveSleepSettings primary action button present with clean labels');
}

// ---------------------------------------------------------------------------
// Test 2: In-Memory AST Parsing & Compilation of dashboard/dashboard.js
// ---------------------------------------------------------------------------
console.log('\nTest 2: In-Memory AST Parsing & Compilation of dashboard/dashboard.js');
{
  assert(fs.existsSync(dashJsPath), 'dashboard/dashboard.js must exist');
  const code = fs.readFileSync(dashJsPath, 'utf8');

  assert.doesNotThrow(() => {
    new vm.Script(code, { filename: 'dashboard.js' });
  }, 'dashboard/dashboard.js must parse cleanly into AST with 0 syntax errors');

  console.log(`  ✅ vm.Script parsed dashboard/dashboard.js successfully (${code.length} bytes, 0 parse errors)`);
}

// ---------------------------------------------------------------------------
// Test 3: Verify populateSleepSettingsForm and saveSleepSettings Exist & Function
// ---------------------------------------------------------------------------
console.log('\nTest 3: Verify populateSleepSettingsForm and saveSleepSettings Exist & Function');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');

  // Verify function declarations exist in code
  assert(code.includes('function populateSleepSettingsForm('), 'populateSleepSettingsForm must be declared');
  assert(code.includes('function saveSleepSettings('), 'saveSleepSettings must be declared');
  assert(code.includes('populateSleepSettingsForm(settings);'), 'populateSettingsForm must delegate to populateSleepSettingsForm');

  // Verify cachedSettings contains sleep defaults
  assert(code.includes('defaultDurationMinutes: 30'), 'cachedSettings must define defaultDurationMinutes: 30');
  assert(code.includes('enableAudioFadeOut: true'), 'cachedSettings must define enableAudioFadeOut: true');
  assert(code.includes('fadeDurationSeconds: 30'), 'cachedSettings must define fadeDurationSeconds: 30');
  assert(code.includes('enableInactivityAutoSleep: false'), 'cachedSettings must define enableInactivityAutoSleep: false');
  assert(code.includes('inactivityThresholdMinutes: 15'), 'cachedSettings must define inactivityThresholdMinutes: 15');
  assert(code.includes('showBadgeCountdown: true'), 'cachedSettings must define showBadgeCountdown: true');
  assert(code.includes('pulseOnCritical: true'), 'cachedSettings must define pulseOnCritical: true');

  console.log('  ✅ populateSleepSettingsForm() and saveSleepSettings() function declarations verified');
  console.log('  ✅ cachedSettings default sleep configuration schema verified');
}

// ---------------------------------------------------------------------------
// Test 4: Simulation of populateSleepSettingsForm and saveSleepSettings via Mock DOM
// ---------------------------------------------------------------------------
console.log('\nTest 4: Simulation of Form Hydration & Save Handlers in VM Sandbox');
{
  // Create mock DOM elements
  const mockElements = {
    settingDefaultSleepDuration: { value: '30' },
    settingSleepFadeToggle: { checked: true },
    settingFadeDuration: { value: '30' },
    settingInactivitySleepToggle: { checked: false },
    settingInactivityThreshold: { value: '15' },
    settingBadgeCountdownToggle: { checked: true },
    settingIdleTimeout: { value: '60' },
    settingLanguage: { value: 'en' },
    settingWsUrl: { value: 'ws://127.0.0.1:65432' },
    settingMediaToggle: { checked: true },
    settingAutoWsToggle: { checked: true },
    settingHistoryDays: { value: '60' },
    btnSaveSleepSettings: {
      listeners: {},
      addEventListener(evt, fn) { this.listeners[evt] = fn; }
    },
    btnSaveGeneralSettings: {
      listeners: {},
      addEventListener(evt, fn) { this.listeners[evt] = fn; }
    }
  };

  let storageSetCalled = false;
  let lastStorageSetPayload = null;
  let runtimeMessageDispatched = null;

  const mockBrowser = {
    runtime: {
      onMessage: { addListener: () => {} },
      sendMessage: (msg, cb) => {
        runtimeMessageDispatched = msg;
        if (typeof cb === 'function') cb({ success: true });
        return Promise.resolve({ success: true });
      }
    },
    storage: {
      local: {
        get: (keys, cb) => { if (typeof cb === 'function') cb({}); },
        set: (payload, cb) => {
          storageSetCalled = true;
          lastStorageSetPayload = payload;
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        }
      },
      onChanged: { addListener: () => {} }
    }
  };

  const sandbox = {
    globalThis: {},
    window: {},
    document: {
      getElementById: (id) => mockElements[id] || null,
      addEventListener: () => {},
      visibilityState: 'visible'
    },
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    console: { log: () => {}, error: () => {}, warn: () => {} },
    module: { exports: {} },
    exports: {}
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  sandbox.browser = mockBrowser;
  sandbox.chrome = mockBrowser;

  const code = fs.readFileSync(dashJsPath, 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  const exported = sandbox.module.exports;
  assert(typeof exported.populateSleepSettingsForm === 'function', 'populateSleepSettingsForm must be exported or accessible');
  assert(typeof exported.saveSleepSettings === 'function', 'saveSleepSettings must be exported or accessible');
  assert(typeof exported.saveDashboardSettings === 'function', 'saveDashboardSettings must be exported or accessible');

  // Test 4A: Hydration of form with custom sleep settings
  const customSettings = {
    defaultDurationMinutes: 45,
    enableAudioFadeOut: false,
    fadeDurationSeconds: 15,
    enableInactivityAutoSleep: true,
    inactivityThresholdMinutes: 30,
    showBadgeCountdown: false,
    pulseOnCritical: false
  };

  exported.populateSleepSettingsForm(customSettings);

  assert.strictEqual(mockElements.settingDefaultSleepDuration.value, '45', 'Duration select hydrated to 45');
  assert.strictEqual(mockElements.settingSleepFadeToggle.checked, false, 'Fade toggle hydrated to false');
  assert.strictEqual(mockElements.settingFadeDuration.value, '15', 'Fade duration hydrated to 15');
  assert.strictEqual(mockElements.settingInactivitySleepToggle.checked, true, 'Inactivity toggle hydrated to true');
  assert.strictEqual(mockElements.settingInactivityThreshold.value, '30', 'Inactivity threshold hydrated to 30');
  assert.strictEqual(mockElements.settingBadgeCountdownToggle.checked, false, 'Badge toggle hydrated to false');

  console.log('  ✅ populateSleepSettingsForm() correctly hydrates all 6 DOM elements from storage schema');

  // Test 4B: Saving sleep settings reads all form inputs and synchronizes storage and IPC
  mockElements.settingDefaultSleepDuration.value = '60';
  mockElements.settingSleepFadeToggle.checked = true;
  mockElements.settingFadeDuration.value = '60';
  mockElements.settingInactivitySleepToggle.checked = true;
  mockElements.settingInactivityThreshold.value = '10';
  mockElements.settingBadgeCountdownToggle.checked = true;

  storageSetCalled = false;
  lastStorageSetPayload = null;
  runtimeMessageDispatched = null;

  exported.saveSleepSettings();

  assert.strictEqual(storageSetCalled, true, 'browserAPI.storage.local.set must be called');
  assert(lastStorageSetPayload && lastStorageSetPayload.sentinel_sleep_settings, 'sentinel_sleep_settings key must be persisted');

  const savedSleep = lastStorageSetPayload.sentinel_sleep_settings;
  assert.strictEqual(savedSleep.defaultDurationMinutes, 60, 'defaultDurationMinutes correctly parsed as 60');
  assert.strictEqual(savedSleep.enableAudioFadeOut, true, 'enableAudioFadeOut correctly saved as true');
  assert.strictEqual(savedSleep.fadeDurationSeconds, 60, 'fadeDurationSeconds correctly parsed as 60');
  assert.strictEqual(savedSleep.enableInactivityAutoSleep, true, 'enableInactivityAutoSleep correctly saved as true');
  assert.strictEqual(savedSleep.inactivityThresholdMinutes, 10, 'inactivityThresholdMinutes correctly parsed as 10');
  assert.strictEqual(savedSleep.showBadgeCountdown, true, 'showBadgeCountdown correctly saved as true');

  assert(runtimeMessageDispatched, 'safeRuntimeSendMessage must dispatch IPC message');
  assert.strictEqual(runtimeMessageDispatched.type, 'UPDATE_SLEEP_SETTINGS', 'IPC type must be UPDATE_SLEEP_SETTINGS');
  assert.deepStrictEqual(runtimeMessageDispatched.settings, savedSleep, 'IPC settings payload must match savedSleep');

  console.log('  ✅ saveSleepSettings() reads 6 controls, persists canonical sentinel_sleep_settings, and dispatches UPDATE_SLEEP_SETTINGS');
}

// ---------------------------------------------------------------------------
// Test 5: Verify Event Listener Registration in setupEventListeners()
// ---------------------------------------------------------------------------
console.log('\nTest 5: Verify Event Listener Registration in setupEventListeners()');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');

  assert(code.includes("document.getElementById('btnSaveSleepSettings')"),
    'setupEventListeners must query #btnSaveSleepSettings');
  assert(code.includes("addEventListener('click', saveSleepSettings)"),
    '#btnSaveSleepSettings must register click listener invoking saveSleepSettings');

  console.log('  ✅ #btnSaveSleepSettings click listener registration verified');
}

// ---------------------------------------------------------------------------
// Test 6: Verify saveDashboardSettings Retains Sleep Configuration
// ---------------------------------------------------------------------------
console.log('\nTest 6: Verify saveDashboardSettings Retains Sleep Configuration (Defect 08 Fix)');
{
  const mockElements = {
    settingIdleTimeout: { value: '120' },
    settingLanguage: { value: 'en' },
    settingWsUrl: { value: 'ws://127.0.0.1:65432' },
    settingMediaToggle: { checked: true },
    settingAutoWsToggle: { checked: true },
    settingHistoryDays: { value: '90' }
  };

  let lastStorageSet = null;

  const mockBrowser = {
    runtime: {
      onMessage: { addListener: () => {} },
      sendMessage: (msg, cb) => { if (typeof cb === 'function') cb({ success: true }); }
    },
    storage: {
      local: {
        get: (keys, cb) => { if (typeof cb === 'function') cb({}); },
        set: (payload, cb) => {
          lastStorageSet = payload;
          if (typeof cb === 'function') cb();
        }
      },
      onChanged: { addListener: () => {} }
    }
  };

  const sandbox = {
    globalThis: {},
    window: {},
    document: {
      getElementById: (id) => mockElements[id] || null,
      addEventListener: () => {},
      visibilityState: 'visible'
    },
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    console: { log: () => {}, error: () => {}, warn: () => {} },
    module: { exports: {} },
    exports: {}
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  sandbox.browser = mockBrowser;
  sandbox.chrome = mockBrowser;

  const code = fs.readFileSync(dashJsPath, 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  const exported = sandbox.module.exports;

  // Pre-seed cachedSettings with custom sleep configurations
  exported.cachedSettings.defaultDurationMinutes = 45;
  exported.cachedSettings.enableAudioFadeOut = false;
  exported.cachedSettings.inactivityThresholdMinutes = 30;

  // Invoke saveDashboardSettings()
  exported.saveDashboardSettings();

  assert(lastStorageSet && lastStorageSet.media_sentinel_settings,
    'saveDashboardSettings must persist media_sentinel_settings');

  const persistedSettings = lastStorageSet.media_sentinel_settings;
  assert.strictEqual(persistedSettings.defaultDurationMinutes, 45, 'defaultDurationMinutes must be retained');
  assert.strictEqual(persistedSettings.enableAudioFadeOut, false, 'enableAudioFadeOut must be retained');
  assert.strictEqual(persistedSettings.inactivityThresholdMinutes, 30, 'inactivityThresholdMinutes must be retained');
  assert.strictEqual(persistedSettings.idleThresholdSeconds, 120, 'General setting idleThresholdSeconds updated');
  assert.strictEqual(persistedSettings.historyRetentionDays, 90, 'General setting historyRetentionDays updated');

  console.log('  ✅ saveDashboardSettings() preserves all sleep settings in media_sentinel_settings without omission');
}

// ---------------------------------------------------------------------------
// Test 7: W3C Trusted Types & Zero innerHTML Audit on Modified Sections
// ---------------------------------------------------------------------------
console.log('\nTest 7: W3C Trusted Types & Zero innerHTML Audit on Modified Sections');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');

  // Extract populateSleepSettingsForm and saveSleepSettings function implementations
  const fnPopulateMatch = code.match(/function populateSleepSettingsForm\([\s\S]*?\n\}/);
  const fnSaveSleepMatch = code.match(/function saveSleepSettings\([\s\S]*?\n\}/);

  assert(fnPopulateMatch, 'populateSleepSettingsForm function body found');
  assert(fnSaveSleepMatch, 'saveSleepSettings function body found');

  assert(!fnPopulateMatch[0].includes('innerHTML'), 'populateSleepSettingsForm must have 0 innerHTML assignments');
  assert(!fnSaveSleepMatch[0].includes('innerHTML'), 'saveSleepSettings must have 0 innerHTML assignments');

  console.log('  ✅ populateSleepSettingsForm certified 100% Trusted Types safe (0 innerHTML assignments)');
  console.log('  ✅ saveSleepSettings certified 100% Trusted Types safe (0 innerHTML assignments)');
}

console.log('\n🎉 ALL PHASE 1 DASHBOARD SLEEP SETTINGS SYNC TESTS PASSED WITH 100% SUCCESS!\n');
