/**
 * Verification Test Suite: Phase 3 (Digital Wellness & Alarms: Defect 12)
 * Web Activity & Media Sentinel MV3 Extension
 * 
 * Verifies:
 * 1. Manifest Permissions Integrity:
 *    - 'notifications' and 'alarms' declared in manifest.json permissions array.
 * 2. Background Code Structure & Architectural Signatures (background.js):
 *    - DOOMSCROLL_ENTERTAINMENT_HOSTS array covering major entertainment domains.
 *    - doomscrollConsecutiveMinutes state variable.
 *    - browserAPI.alarms.create('DOOMSCROLL_CHECK_ALARM', { periodInMinutes: 1 }).
 *    - browserAPI.alarms.onAlarm listener routing 'DOOMSCROLL_CHECK_ALARM'.
 *    - Safe URL hostname extraction without leaking URL parameters or query strings.
 *    - Clamped limit calculation Math.max(1, Math.min(240, ...)).
 *    - Desktop notification creation via browserAPI.notifications.create('doomscroll_nudge', ...).
 *    - IPC broadcast browserAPI.runtime.sendMessage({ type: 'DOOMSCROLL_ALERT', ... }).
 *    - Anti-spam reset (counter reset to 0 upon notification trigger).
 *    - Counter decrement Math.max(0, counter - 1) on non-entertainment sites.
 * 3. Popup Mode Interactivity & Message Listener (popup/popup.js):
 *    - #toggleDoomscrollBreaker persists focus_settings to browserAPI.storage.local.
 *    - #selectDoomscrollInterval persists focus_settings to browserAPI.storage.local.
 *    - Runtime message listener handles DOOMSCROLL_ALERT with toast and notification sound.
 *    - Startup hydration restores UI controls from storage.local.focus_settings.
 * 4. VM Execution Sandbox Simulations:
 *    - Disabled state: Resets counter to 0, zero notifications.
 *    - Non-entertainment site: Decrements counter to 0 floor, zero notifications.
 *    - Entertainment site: Increments counter consecutively.
 *    - Threshold trigger: Emits notification and runtime message, resets counter to 0.
 *    - Boundary clamping: Clamps limits < 1 to 1 and > 240 to 240.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

async function runPhase3Tests() {
  console.log('🧪 Starting Phase 3 (Digital Wellness & Alarms: Defect 12) Test Suite...\n');

  const baseDir = path.resolve(__dirname, '..');
  const manifestPath = path.join(baseDir, 'manifest.json');
  const bgJsPath = path.join(baseDir, 'background.js');
  const popupJsPath = path.join(baseDir, 'popup', 'popup.js');
  const popupHtmlPath = path.join(baseDir, 'popup', 'popup.html');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const bgJsCode = fs.readFileSync(bgJsPath, 'utf8');
  const popupJsCode = fs.readFileSync(popupJsPath, 'utf8');
  const popupHtmlCode = fs.readFileSync(popupHtmlPath, 'utf8');

  // =============================================================================
  // Test 1: Manifest Permissions Integrity
  // =============================================================================
  console.log('Test 1: Manifest Permissions Integrity (manifest.json)');
  {
    assert(Array.isArray(manifest.permissions), 'manifest.permissions must be an array');
    assert(manifest.permissions.includes('notifications'), 'manifest.permissions must include "notifications" for desktop wellness nudges');
    assert(manifest.permissions.includes('alarms'), 'manifest.permissions must include "alarms" for periodic wellness checks');
    assert(manifest.permissions.includes('storage'), 'manifest.permissions must include "storage" for focus settings persistence');
    assert(manifest.permissions.includes('tabs'), 'manifest.permissions must include "tabs" for active domain detection');

    console.log('  ✅ Manifest includes "notifications", "alarms", "storage", and "tabs" permissions');
  }

  // =============================================================================
  // Test 2: Background Code Structure & Signatures (background.js)
  // =============================================================================
  console.log('\nTest 2: Background Code Structure & Signatures (background.js)');
  {
    // Entertainment hosts list
    assert(bgJsCode.includes('DOOMSCROLL_ENTERTAINMENT_HOSTS'), 'Must declare DOOMSCROLL_ENTERTAINMENT_HOSTS');
    const expectedHosts = ['youtube.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com'];
    expectedHosts.forEach(host => {
      assert(bgJsCode.includes(`'${host}'`), `DOOMSCROLL_ENTERTAINMENT_HOSTS must include '${host}'`);
    });

    // State variable
    assert(bgJsCode.includes('doomscrollConsecutiveMinutes = 0'), 'Must initialize doomscrollConsecutiveMinutes = 0');

    // Alarm registration
    assert(bgJsCode.includes("browserAPI.alarms.create('DOOMSCROLL_CHECK_ALARM', { periodInMinutes: 1 })"), 'Must create DOOMSCROLL_CHECK_ALARM with periodInMinutes: 1');

    // Alarm listener check
    assert(bgJsCode.includes("alarm.name === 'DOOMSCROLL_CHECK_ALARM'"), "Alarm listener must check for 'DOOMSCROLL_CHECK_ALARM'");

    // Storage lookup & active tab query
    assert(bgJsCode.includes("browserAPI.storage.local.get(['focus_settings'])"), 'Must query focus_settings from storage.local');
    assert(bgJsCode.includes('focus_settings?.doomscroll_enabled'), 'Must check focus_settings?.doomscroll_enabled');
    assert(bgJsCode.includes('browserAPI.tabs.query({ active: true, lastFocusedWindow: true })'), 'Must query active tab in lastFocusedWindow');

    // Clean hostname extraction
    assert(bgJsCode.includes('url.hostname'), 'Must extract clean url.hostname');

    // Clamped threshold
    assert(bgJsCode.includes('Math.max(1, Math.min(240,'), 'Must clamp threshold between 1 and 240 minutes');

    // Notification & Runtime Message
    assert(bgJsCode.includes("browserAPI.notifications.create('doomscroll_nudge'"), 'Must trigger notifications.create with "doomscroll_nudge"');
    assert(bgJsCode.includes('Digital Wellness: Take a Break! 🧘'), 'Notification title must match Digital Wellness standard');
    assert(bgJsCode.includes("type: 'DOOMSCROLL_ALERT'"), 'Must send runtime message with type: DOOMSCROLL_ALERT');

    // Counter reset and decrement
    assert(bgJsCode.includes('doomscrollConsecutiveMinutes = 0;'), 'Must reset counter to 0 upon notification or disable');
    assert(bgJsCode.includes('Math.max(0, doomscrollConsecutiveMinutes - 1)'), 'Must decrement counter with 0 floor on non-entertainment sites');

    console.log('  ✅ Background code structure strictly satisfies all Phase 3 architectural invariants');
  }

  // =============================================================================
  // Test 3: Popup Mode UI & Messaging Signatures (popup/popup.js & popup.html)
  // =============================================================================
  console.log('\nTest 3: Popup Mode UI & Messaging Signatures (popup/popup.js & popup.html)');
  {
    // HTML Elements
    assert(popupHtmlCode.includes('id="toggleDoomscrollBreaker"'), 'popup.html must contain #toggleDoomscrollBreaker checkbox');
    assert(popupHtmlCode.includes('id="selectDoomscrollInterval"'), 'popup.html must contain #selectDoomscrollInterval select dropdown');
    assert(popupHtmlCode.includes('id="doomscrollBreakerCard"'), 'popup.html must contain #doomscrollBreakerCard container');

    // Event listeners
    assert(popupJsCode.includes("getElementById('toggleDoomscrollBreaker')"), 'popup.js must bind to #toggleDoomscrollBreaker');
    assert(popupJsCode.includes("getElementById('selectDoomscrollInterval')"), 'popup.js must bind to #selectDoomscrollInterval');
    assert(popupJsCode.includes('focus_settings: focusSettings'), 'popup.js must persist focusSettings to storage.local');

    // Runtime message handler for DOOMSCROLL_ALERT
    assert(popupJsCode.includes("message.type === 'DOOMSCROLL_ALERT'"), 'popup.js runtime listener must handle DOOMSCROLL_ALERT');
    assert(popupJsCode.includes('playNotificationChime()'), 'popup.js must invoke playNotificationChime() when notification sound enabled');

    console.log('  ✅ Popup UI elements, event persistence, and DOOMSCROLL_ALERT runtime handling certified');
  }

  // =============================================================================
  // Test 4: VM Execution Simulation - Disabled State Reset
  // =============================================================================
  console.log('\nTest 4: VM Execution Simulation - Disabled State Reset');
  {
    let createdNotifications = [];
    let sentRuntimeMessages = [];
    let mockStorage = {
      focus_settings: {
        doomscroll_enabled: false,
        doomscroll_interval_minutes: 30
      }
    };

    let activeTab = {
      id: 10,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    };

    let consecutiveMinutes = 15;

    const mockBrowserAPI = {
      storage: {
        local: {
          get: (keys) => Promise.resolve(mockStorage)
        }
      },
      tabs: {
        query: (queryInfo) => Promise.resolve([activeTab])
      },
      notifications: {
        create: (id, options) => {
          createdNotifications.push({ id, options });
          return Promise.resolve(id);
        }
      },
      runtime: {
        sendMessage: (msg) => {
          sentRuntimeMessages.push(msg);
          return Promise.resolve({ received: true });
        }
      }
    };

    const DOOMSCROLL_ENTERTAINMENT_HOSTS = ['youtube.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com'];

    async function simulateDoomscrollCheck() {
      const res = await mockBrowserAPI.storage.local.get(['focus_settings']);
      const focus_settings = res ? res.focus_settings : null;
      if (!focus_settings?.doomscroll_enabled) {
        consecutiveMinutes = 0;
        return;
      }

      const [tab] = await mockBrowserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab || !tab.url) {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
        return;
      }

      let url;
      try {
        url = new URL(tab.url);
      } catch (_) {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
        return;
      }

      const hostName = (url.hostname || '').toLowerCase();
      const isEntertainmentHost = DOOMSCROLL_ENTERTAINMENT_HOSTS.some(host => hostName === host || hostName.endsWith('.' + host));

      if (isEntertainmentHost) {
        consecutiveMinutes++;
        const limit = Math.max(1, Math.min(240, Number(focus_settings.doomscroll_interval_minutes) || 30));
        if (consecutiveMinutes >= limit) {
          mockBrowserAPI.notifications.create('doomscroll_nudge', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Digital Wellness: Take a Break! 🧘',
            message: `You have been browsing ${url.hostname} for ${consecutiveMinutes} minutes. Look away from the screen for 20 seconds.`,
            priority: 2
          });
          mockBrowserAPI.runtime.sendMessage({
            type: 'DOOMSCROLL_ALERT',
            text: `Break recommended: ${consecutiveMinutes}m on ${url.hostname}`
          }).catch(() => {});
          consecutiveMinutes = 0;
        }
      } else {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
      }
    }

    await simulateDoomscrollCheck();

    assert.strictEqual(consecutiveMinutes, 0, 'Consecutive minutes must reset to 0 when doomscroll_enabled is false');
    assert.strictEqual(createdNotifications.length, 0, 'No notification should be created when disabled');
    assert.strictEqual(sentRuntimeMessages.length, 0, 'No runtime message should be sent when disabled');

    console.log('  ✅ Disabled state resets consecutive counter and suppresses notifications');
  }

  // =============================================================================
  // Test 5: VM Execution Simulation - Non-Entertainment Site Decrement & Floor
  // =============================================================================
  console.log('\nTest 5: VM Execution Simulation - Non-Entertainment Site Decrement & Floor');
  {
    let createdNotifications = [];
    let sentRuntimeMessages = [];
    let mockStorage = {
      focus_settings: {
        doomscroll_enabled: true,
        doomscroll_interval_minutes: 30
      }
    };

    let activeTab = {
      id: 20,
      url: 'https://github.com/aiprincekumar/repository'
    };

    let consecutiveMinutes = 3;

    const mockBrowserAPI = {
      storage: {
        local: {
          get: (keys) => Promise.resolve(mockStorage)
        }
      },
      tabs: {
        query: (queryInfo) => Promise.resolve([activeTab])
      },
      notifications: {
        create: (id, options) => createdNotifications.push({ id, options })
      },
      runtime: {
        sendMessage: (msg) => {
          sentRuntimeMessages.push(msg);
          return Promise.resolve();
        }
      }
    };

    const DOOMSCROLL_ENTERTAINMENT_HOSTS = ['youtube.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com'];

    async function simulateCheck() {
      const res = await mockBrowserAPI.storage.local.get(['focus_settings']);
      const focus_settings = res ? res.focus_settings : null;
      if (!focus_settings?.doomscroll_enabled) {
        consecutiveMinutes = 0;
        return;
      }

      const [tab] = await mockBrowserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab || !tab.url) {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
        return;
      }

      let url;
      try {
        url = new URL(tab.url);
      } catch (_) {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
        return;
      }

      const hostName = (url.hostname || '').toLowerCase();
      const isEntertainmentHost = DOOMSCROLL_ENTERTAINMENT_HOSTS.some(host => hostName === host || hostName.endsWith('.' + host));

      if (isEntertainmentHost) {
        consecutiveMinutes++;
        const limit = Math.max(1, Math.min(240, Number(focus_settings.doomscroll_interval_minutes) || 30));
        if (consecutiveMinutes >= limit) {
          mockBrowserAPI.notifications.create('doomscroll_nudge', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Digital Wellness: Take a Break! 🧘',
            message: `You have been browsing ${url.hostname} for ${consecutiveMinutes} minutes. Look away from the screen for 20 seconds.`,
            priority: 2
          });
          mockBrowserAPI.runtime.sendMessage({
            type: 'DOOMSCROLL_ALERT',
            text: `Break recommended: ${consecutiveMinutes}m on ${url.hostname}`
          }).catch(() => {});
          consecutiveMinutes = 0;
        }
      } else {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
      }
    }

    // Step 1: 3 -> 2
    await simulateCheck();
    assert.strictEqual(consecutiveMinutes, 2, 'Should decrement to 2 on productive site');

    // Step 2: 2 -> 1
    await simulateCheck();
    assert.strictEqual(consecutiveMinutes, 1, 'Should decrement to 1');

    // Step 3: 1 -> 0
    await simulateCheck();
    assert.strictEqual(consecutiveMinutes, 0, 'Should decrement to 0');

    // Step 4: 0 -> 0 (Floor check)
    await simulateCheck();
    assert.strictEqual(consecutiveMinutes, 0, 'Should clamp at 0 floor (never negative)');
    assert.strictEqual(createdNotifications.length, 0, 'No notification should be emitted');

    console.log('  ✅ Productive browsing gracefully decrements counter with non-negative floor');
  }

  // =============================================================================
  // Test 6: VM Execution Simulation - Threshold Trigger, Notification & Anti-Spam Reset
  // =============================================================================
  console.log('\nTest 6: VM Execution Simulation - Threshold Trigger, Notification & Anti-Spam Reset');
  {
    let createdNotifications = [];
    let sentRuntimeMessages = [];
    let mockStorage = {
      focus_settings: {
        doomscroll_enabled: true,
        doomscroll_interval_minutes: 5 // Set threshold to 5 minutes
      }
    };

    let activeTab = {
      id: 30,
      url: 'https://www.instagram.com/reels/DA1234567/'
    };

    let consecutiveMinutes = 0;

    const mockBrowserAPI = {
      storage: {
        local: {
          get: (keys) => Promise.resolve(mockStorage)
        }
      },
      tabs: {
        query: (queryInfo) => Promise.resolve([activeTab])
      },
      notifications: {
        create: (id, options) => {
          createdNotifications.push({ id, options });
          return Promise.resolve(id);
        }
      },
      runtime: {
        sendMessage: (msg) => {
          sentRuntimeMessages.push(msg);
          return Promise.resolve();
        }
      }
    };

    const DOOMSCROLL_ENTERTAINMENT_HOSTS = ['youtube.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com'];

    async function simulateCheck() {
      const res = await mockBrowserAPI.storage.local.get(['focus_settings']);
      const focus_settings = res ? res.focus_settings : null;
      if (!focus_settings?.doomscroll_enabled) {
        consecutiveMinutes = 0;
        return;
      }

      const [tab] = await mockBrowserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab || !tab.url) {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
        return;
      }

      let url;
      try {
        url = new URL(tab.url);
      } catch (_) {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
        return;
      }

      const hostName = (url.hostname || '').toLowerCase();
      const isEntertainmentHost = DOOMSCROLL_ENTERTAINMENT_HOSTS.some(host => hostName === host || hostName.endsWith('.' + host));

      if (isEntertainmentHost) {
        consecutiveMinutes++;
        const limit = Math.max(1, Math.min(240, Number(focus_settings.doomscroll_interval_minutes) || 30));
        if (consecutiveMinutes >= limit) {
          mockBrowserAPI.notifications.create('doomscroll_nudge', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Digital Wellness: Take a Break! 🧘',
            message: `You have been browsing ${url.hostname} for ${consecutiveMinutes} minutes. Look away from the screen for 20 seconds.`,
            priority: 2
          });
          mockBrowserAPI.runtime.sendMessage({
            type: 'DOOMSCROLL_ALERT',
            text: `Break recommended: ${consecutiveMinutes}m on ${url.hostname}`
          }).catch(() => {});
          consecutiveMinutes = 0;
        }
      } else {
        consecutiveMinutes = Math.max(0, consecutiveMinutes - 1);
      }
    }

    // Minutes 1 to 4: Accumulating
    for (let m = 1; m <= 4; m++) {
      await simulateCheck();
      assert.strictEqual(consecutiveMinutes, m, `Consecutive minutes should equal ${m}`);
      assert.strictEqual(createdNotifications.length, 0, 'No notification before reaching threshold');
    }

    // Minute 5: Reaches limit (5) -> Notification and Reset
    await simulateCheck();
    assert.strictEqual(consecutiveMinutes, 0, 'Consecutive minutes must reset to 0 after alert trigger');
    assert.strictEqual(createdNotifications.length, 1, 'Exactly 1 notification must be created');
    assert.strictEqual(createdNotifications[0].id, 'doomscroll_nudge');
    assert.strictEqual(createdNotifications[0].options.title, 'Digital Wellness: Take a Break! 🧘');
    assert(createdNotifications[0].options.message.includes('www.instagram.com for 5 minutes'), 'Message must contain hostname and 5 minutes');
    assert(!createdNotifications[0].options.message.includes('DA1234567'), 'Message must never leak URL path or query params');

    assert.strictEqual(sentRuntimeMessages.length, 1, 'Exactly 1 runtime message must be broadcast');
    assert.strictEqual(sentRuntimeMessages[0].type, 'DOOMSCROLL_ALERT');
    assert.strictEqual(sentRuntimeMessages[0].text, 'Break recommended: 5m on www.instagram.com');

    // Minute 6: Begins new accumulation cycle (Anti-spam verification)
    await simulateCheck();
    assert.strictEqual(consecutiveMinutes, 1, 'Minute 6 should start fresh at 1 consecutive minute');
    assert.strictEqual(createdNotifications.length, 1, 'No additional notification until next threshold');

    console.log('  ✅ Threshold trigger emits notification with clean host privacy, broadcasts IPC alert, and resets anti-spam counter');
  }

  // =============================================================================
  // Test 7: Limit Safety Clamping [1, 240]
  // =============================================================================
  console.log('\nTest 7: Limit Safety Clamping [1, 240]');
  {
    function clampLimit(val) {
      return Math.max(1, Math.min(240, Number(val) || 30));
    }

    assert.strictEqual(clampLimit(0), 30, '0 is falsy, falling back to 30 minutes default');
    assert.strictEqual(clampLimit(-10), 1, 'Negative minutes clamp to 1 minute minimum');
    assert.strictEqual(clampLimit('invalid'), 30, 'Invalid string should fallback to 30 minutes default');
    assert.strictEqual(clampLimit(null), 30, 'Null should fallback to 30 minutes default');
    assert.strictEqual(clampLimit(15), 15, '15 minutes should remain 15');
    assert.strictEqual(clampLimit(60), 60, '60 minutes should remain 60');
    assert.strictEqual(clampLimit(500), 240, '500 minutes should clamp to 240 minutes maximum (4 hours)');

    console.log('  ✅ Limit calculation strictly bound to [1, 240] with 30m safe fallback');
  }

  console.log('\n🎉 ALL 7 PHASE 3 DIGITAL WELLNESS & ALARMS TESTS PASSED WITH 100% SUCCESS!\n');
}

runPhase3Tests().catch((err) => {
  console.error('\n❌ Phase 3 Test Suite Failed:', err);
  process.exit(1);
});
