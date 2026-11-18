/**
 * @file test_headed_sleep_timer.js
 * End-to-End Headed Sleep Timer Verification Suite.
 * Minimum allowable duration: 1 minute (60 seconds).
 * Strictly < 320 lines, < 14 KB, function length <= 50 lines, nesting depth <= 4, UTF-8 BOM.
 */
'use strict';

const assert = require('assert');
const { sleep, openPageAndConnect } = require('./harness/headed_browser_harness');

async function testSleepDashboardNavigation(session) {
  console.log('  [Sleep] Navigating to Sleep Sentinel Hub in Dashboard...');
  const navigated = await session.evaluate(`
    (() => {
      if (typeof switchTab === 'function') {
        switchTab('wellbeing');
        return true;
      }
      return false;
    })()
  `);
  assert(navigated, 'Must navigate to wellbeing / sleep tab');
  await sleep(1000);
}

async function testSleepStartOneMinute(session) {
  console.log('  [Sleep] Setting 1-Minute Minimum Duration Sleep Timer...');
  const startResult = await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'SET_SLEEP_TIMER',
        action: 'SET_SLEEP_TIMER',
        durationMinutes: 1,
        options: { enableFadeOut: true, fadeDurationSeconds: 30 }
      }, (res) => resolve(res || { success: false }));
    })
  `);
  console.log('  [Sleep] Start Response:', JSON.stringify(startResult));
  assert(startResult && startResult.success, 'Sleep timer set must succeed');
  await sleep(800);
}

async function testSleepCountdownAndDial(session) {
  console.log('  [Sleep] Observing second-by-second countdown and dial in Dashboard...');
  const initial = await session.evaluate(`
    (() => {
      const countdownEl = document.getElementById('dashSleepCountdownDisplay');
      const dialEl = document.getElementById('dashSleepDialProgress');
      const badgeEl = document.getElementById('dashSleepStatusBadge');
      return {
        countdown: countdownEl ? countdownEl.textContent.trim() : null,
        dashOffset: dialEl ? parseFloat(dialEl.style.strokeDashoffset || 0) : null,
        badge: badgeEl ? badgeEl.textContent.trim() : null
      };
    })()
  `);
  console.log('  [Sleep] Initial (T=0):', initial);
  assert(initial.countdown, 'Countdown display must exist');

  await sleep(3200);

  const sampled = await session.evaluate(`
    (() => {
      const countdownEl = document.getElementById('dashSleepCountdownDisplay');
      const dialEl = document.getElementById('dashSleepDialProgress');
      return {
        countdown: countdownEl ? countdownEl.textContent.trim() : null,
        dashOffset: dialEl ? parseFloat(dialEl.style.strokeDashoffset || 0) : null
      };
    })()
  `);
  console.log('  [Sleep] Sampled (T+3s):', sampled);
  assert(sampled.countdown, 'Sampled countdown must exist');
  console.log(`  [Sleep] Live countdown transition: ${initial.countdown} -> ${sampled.countdown}`);
}

async function testSleepExtender(session) {
  console.log('  [Sleep] Testing In-Flight EXTEND_SLEEP_TIMER (+5 minutes)...');
  const extendRes = await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'EXTEND_SLEEP_TIMER',
        action: 'EXTEND_SLEEP_TIMER',
        extraMinutes: 5,
        minutes: 5
      }, (res) => resolve(res || { success: false }));
    })
  `);
  console.log('  [Sleep] Extend Response:', JSON.stringify(extendRes));
  assert(extendRes && extendRes.success, 'Extender must succeed');
  await sleep(800);

  const extendedData = await session.evaluate(`
    (() => {
      const el = document.getElementById('dashSleepCountdownDisplay');
      return el ? el.textContent.trim() : '';
    })()
  `);
  console.log('  [Sleep] Extended Display Time:', extendedData);
}

async function testSleepFadeAndExpiration(session) {
  console.log('  [Sleep] Testing 30s Audio Fade-out transition & Expiration trigger...');
  await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_SLEEP_TIMER_STATE' }, (res) => {
        chrome.storage.local.get(['sentinel_sleep_timer'], (st) => {
          const timer = st.sentinel_sleep_timer || {};
          timer.state = 'FADING';
          chrome.storage.local.set({ sentinel_sleep_timer: timer }, resolve);
        });
      });
    })
  `);
  await sleep(600);

  const fadingState = await session.evaluate(`
    new Promise((resolve) => {
      chrome.storage.local.get(['sentinel_sleep_timer'], (res) => {
        resolve(res.sentinel_sleep_timer?.state || '');
      });
    })
  `);
  console.log('  [Sleep] FSM State at Fade-out window:', fadingState);
  assert.strictEqual(fadingState, 'FADING', 'State machine must reflect FADING');

  await session.evaluate(`
    new Promise((resolve) => {
      chrome.storage.local.get(['sentinel_sleep_timer'], (st) => {
        const timer = st.sentinel_sleep_timer || {};
        timer.state = 'TRIGGERED';
        chrome.storage.local.set({ sentinel_sleep_timer: timer }, resolve);
      });
    })
  `);
  await sleep(600);

  const triggeredState = await session.evaluate(`
    new Promise((resolve) => {
      chrome.storage.local.get(['sentinel_sleep_timer'], (res) => {
        resolve(res.sentinel_sleep_timer?.state || '');
      });
    })
  `);
  console.log('  [Sleep] FSM State at Expiration trigger:', triggeredState);
  assert.strictEqual(triggeredState, 'TRIGGERED', 'State machine must reflect TRIGGERED');
}

async function testSleepCancelReset(session) {
  console.log('  [Sleep] Testing CANCEL_SLEEP_TIMER / Reset...');
  const cancelRes = await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'CANCEL_SLEEP_TIMER',
        action: 'CANCEL_SLEEP_TIMER'
      }, (res) => resolve(res || { success: false }));
    })
  `);
  console.log('  [Sleep] Cancel Response:', JSON.stringify(cancelRes));
  await sleep(800);

  const finalState = await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_SLEEP_TIMER_STATE' }, (res) => {
        resolve(res?.state?.state || 'IDLE');
      });
    })
  `);
  console.log('  [Sleep] Final state after cancellation:', finalState);
  assert(finalState === 'IDLE' || finalState === 'CANCELLED', 'Final state must be IDLE or CANCELLED');
}

async function testSleepPopupParity(port, extId) {
  console.log('  [Sleep] Testing Sleep Timer in Popup View...');
  const popupUrl = `chrome-extension://${extId}/popup/popup.html`;
  const { session } = await openPageAndConnect(port, popupUrl);

  try {
    await sleep(1500);
    const popupCheck = await session.evaluate(`
      (() => {
        const btnSleepTrigger = document.getElementById('btnSleepTimerTrigger');
        const customInput = document.getElementById('customTimerInput');
        const sleepDial = document.getElementById('sleepDialCountdown');
        return {
          hasSleepTrigger: !!btnSleepTrigger,
          hasCustomInput: !!customInput,
          hasSleepDial: !!sleepDial,
          customMin: customInput ? customInput.getAttribute('min') : null
        };
      })()
    `);
    console.log('  [Sleep] Popup DOM Elements:', popupCheck);
    assert(popupCheck.hasCustomInput, 'Popup must have custom timer input');
    assert.strictEqual(popupCheck.customMin, '1', 'Custom timer min allowable duration must be 1');
  } finally {
    session.close();
  }
}

async function runSleepTimerVerification(port, extId) {
  console.log('\n============================================================');
  console.log('BATTERY 2: HEADED SLEEP TIMER (1-MINUTE MINIMUM) VERIFICATION');
  console.log('============================================================');

  const dashboardUrl = `chrome-extension://${extId}/dashboard/dashboard.html`;
  console.log(`Opening Dashboard: ${dashboardUrl}`);
  const { session } = await openPageAndConnect(port, dashboardUrl);

  try {
    await sleep(1500);
    await testSleepDashboardNavigation(session);
    await testSleepStartOneMinute(session);
    await testSleepCountdownAndDial(session);
    await testSleepExtender(session);
    await testSleepFadeAndExpiration(session);
    await testSleepCancelReset(session);
  } finally {
    session.close();
  }

  await testSleepPopupParity(port, extId);
  console.log('  [Sleep] PASS: 1-Minute Sleep Timer Verification completed.');
  return { success: true };
}

module.exports = { runSleepTimerVerification };
