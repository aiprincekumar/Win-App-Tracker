/**
 * @file test_headed_live_expiration.js
 * Headed E2E Live Expiration Verification Suite.
 * Strictly < 500 lines, < 20 KB, function length <= 50 lines, nesting depth <= 4, UTF-8 BOM.
 */
'use strict';

const assert = require('assert');
const { sleep, openPageAndConnect, teardownHarness, launchHeadedChrome, waitForCdpReady, discoverExtensionId } = require('./harness/headed_browser_harness');
const path = require('path');

async function testFocusTimerLiveExpiration(session) {
  console.log('  [Focus] Starting 1-Minute Live Expiration Battery...');
  await session.evaluate(`(() => {
    chrome.runtime.sendMessage({ type: 'START_FOCUS_TIMER', durationMinutes: 1, mode: 'focus' });
  })()`);
  
  console.log('  [Focus] Waiting 65s for full real-time expiration...');
  await sleep(65000);

  const finalState = await session.evaluate(`
    new Promise(resolve => chrome.storage.local.get(['sentinel_focus_timer'], res => resolve(res.sentinel_focus_timer)))
  `);
  console.log('  [Focus] State at T+65s:', finalState);
  assert(finalState.state === 'COMPLETED', 'Focus timer must be COMPLETED');
}

async function testSleepTimerLiveExpiration(session) {
  console.log('  [Sleep] Starting 1-Minute Live Expiration Battery...');
  await session.evaluate(`(() => {
    chrome.runtime.sendMessage({ 
      type: 'SET_SLEEP_TIMER', 
      durationMinutes: 1, 
      options: { enableFadeOut: true, fadeDurationSeconds: 30 } 
    });
  })()`);
  
  console.log('  [Sleep] Waiting 65s for full real-time expiration...');
  await sleep(65000);

  const finalState = await session.evaluate(`
    new Promise(resolve => chrome.storage.local.get(['sentinel_sleep_timer'], res => resolve(res.sentinel_sleep_timer)))
  `);
  console.log('  [Sleep] State at T+65s:', finalState);
  assert(finalState.state === 'TRIGGERED', 'Sleep timer must be TRIGGERED');
}

async function runLiveVerification() {
  const extPath = path.resolve(__dirname, '../..');
  const port = 9222;
  const harness = launchHeadedChrome({ extensionPath: extPath, port });
  
  try {
    await waitForCdpReady(port);
    const extId = await discoverExtensionId(port);
    const { session } = await openPageAndConnect(port, `chrome-extension://${extId}/dashboard/dashboard.html`);
    
    await testFocusTimerLiveExpiration(session);
    await testSleepTimerLiveExpiration(session);
    
    console.log('🎉 Live Expiration Tests Passed.');
  } finally {
    await teardownHarness(harness);
  }
}

runLiveVerification().catch(console.error);
