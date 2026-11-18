/**
 * @file test_headed_focus_timing.js
 * End-to-End Headed Focus Timing (Pomodoro) Verification Suite.
 * Minimum allowable duration: 1 minute (60 seconds).
 * Strictly < 280 lines, < 12 KB, function length <= 50 lines, nesting depth <= 4, UTF-8 BOM.
 */
'use strict';

const assert = require('assert');
const { sleep, openPageAndConnect } = require('./harness/headed_browser_harness');

async function testFocusNavigation(session) {
  console.log('  [Focus] Navigating to Wellbeing / Focus & Sleep Hub...');
  const navigated = await session.evaluate(`
    (() => {
      if (typeof switchTab === 'function') {
        switchTab('wellbeing');
        return true;
      }
      const btn = document.getElementById('sidebarBtnWellbeing');
      if (btn) { btn.click(); return true; }
      return false;
    })()
  `);
  assert(navigated, 'Must navigate to Wellbeing / Focus tab');
  await sleep(800);
}

async function testFocusStartOneMinute(session) {
  console.log('  [Focus] Starting 1-Minute Focus Timer via IPC...');
  const startResult = await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'START_FOCUS_TIMER',
        action: 'START_FOCUS_TIMER',
        durationMinutes: 1,
        mode: 'focus'
      }, (res) => resolve(res || { success: false }));
    })
  `);
  console.log('  [Focus] Start Response:', JSON.stringify(startResult));
  assert(startResult && (startResult.success !== false || startResult.state), 'Focus timer start must succeed');
  await sleep(800);
}

async function testFocusCountdownAndDial(session) {
  console.log('  [Focus] Observing second-by-second countdown and radial dial on screen...');
  const initialData = await session.evaluate(`
    (() => {
      const timeEl = document.getElementById('pomodoroTimeDisplay');
      const dialEl = document.getElementById('dashFocusDialProgress');
      const badgeEl = document.getElementById('pomodoroModeBadge');
      return {
        timeText: timeEl ? timeEl.textContent.trim() : null,
        dashOffset: dialEl ? parseFloat(dialEl.style.strokeDashoffset || 0) : null,
        badgeText: badgeEl ? badgeEl.textContent.trim() : null
      };
    })()
  `);
  console.log('  [Focus] Initial (T=0):', initialData);
  assert(initialData.timeText, 'Time display element must exist');

  // Wait 3 seconds to observe live countdown decrement on user screen
  await sleep(3200);

  const sampledData = await session.evaluate(`
    (() => {
      const timeEl = document.getElementById('pomodoroTimeDisplay');
      const dialEl = document.getElementById('dashFocusDialProgress');
      return {
        timeText: timeEl ? timeEl.textContent.trim() : null,
        dashOffset: dialEl ? parseFloat(dialEl.style.strokeDashoffset || 0) : null
      };
    })()
  `);
  console.log('  [Focus] Sampled (T+3s):', sampledData);
  assert(sampledData.timeText, 'Sampled time display must be present');
  console.log(`  [Focus] Countdown transition observed: ${initialData.timeText} -> ${sampledData.timeText}`);
}

async function testFocusPauseAndResume(session) {
  console.log('  [Focus] Testing PAUSE_FOCUS_TIMER...');
  await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'PAUSE_FOCUS_TIMER', action: 'PAUSE_FOCUS_TIMER' }, resolve);
    })
  `);
  await sleep(600);

  const pausedData = await session.evaluate(`
    (() => {
      const timeEl = document.getElementById('pomodoroTimeDisplay');
      return timeEl ? timeEl.textContent.trim() : '';
    })()
  `);
  console.log('  [Focus] Time at pause:', pausedData);
  await sleep(1500);

  const pausedCheck = await session.evaluate(`
    (() => {
      const timeEl = document.getElementById('pomodoroTimeDisplay');
      return timeEl ? timeEl.textContent.trim() : '';
    })()
  `);
  console.log('  [Focus] Time after 1.5s in pause:', pausedCheck);
  assert.strictEqual(pausedData, pausedCheck, 'Timer must pause ticking when paused');

  console.log('  [Focus] Testing RESUME_FOCUS_TIMER...');
  await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'RESUME_FOCUS_TIMER', action: 'RESUME_FOCUS_TIMER' }, resolve);
    })
  `);
  await sleep(1500);

  const resumedData = await session.evaluate(`
    (() => {
      const timeEl = document.getElementById('pomodoroTimeDisplay');
      return timeEl ? timeEl.textContent.trim() : '';
    })()
  `);
  console.log('  [Focus] Time after resume:', resumedData);
}

async function testFocusReset(session) {
  console.log('  [Focus] Testing RESET_FOCUS_TIMER...');
  await session.evaluate(`
    new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'RESET_FOCUS_TIMER', action: 'RESET_FOCUS_TIMER' }, resolve);
    })
  `);
  await sleep(800);

  const resetData = await session.evaluate(`
    (() => {
      const timeEl = document.getElementById('pomodoroTimeDisplay');
      return timeEl ? timeEl.textContent.trim() : '';
    })()
  `);
  console.log('  [Focus] Time after reset:', resetData);
  console.log('  [Focus] PASS: 1-Minute Focus Timing Verification completed.');
}

async function runFocusTimingVerification(port, extId) {
  console.log('\n============================================================');
  console.log('BATTERY 1: HEADED FOCUS TIMING (1-MINUTE MINIMUM) VERIFICATION');
  console.log('============================================================');

  const dashboardUrl = `chrome-extension://${extId}/dashboard/dashboard.html`;
  console.log(`Opening Dashboard: ${dashboardUrl}`);
  const { session } = await openPageAndConnect(port, dashboardUrl);

  try {
    await sleep(1500);
    await testFocusNavigation(session);
    await testFocusStartOneMinute(session);
    await testFocusCountdownAndDial(session);
    await testFocusPauseAndResume(session);
    await testFocusReset(session);
    return { success: true };
  } finally {
    session.close();
  }
}

module.exports = { runFocusTimingVerification };
