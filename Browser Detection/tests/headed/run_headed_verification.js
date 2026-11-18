/**
 * @file run_headed_verification.js
 * Master Headed Interactive Verification Runner.
 * Orchestrates visible Chrome browser verification for Focus Timing & Sleep Timer.
 * Strictly < 90 lines, < 4 KB, function length <= 50 lines, nesting depth <= 4, UTF-8 BOM.
 */
'use strict';

const path = require('path');
const {
  launchHeadedChrome,
  waitForCdpReady,
  discoverExtensionId,
  teardownHarness
} = require('./harness/headed_browser_harness');
const { runFocusTimingVerification } = require('./test_headed_focus_timing');
const { runSleepTimerVerification } = require('./test_headed_sleep_timer');

async function main() {
  const startTime = Date.now();
  console.log('🚀 [HEADED E2E] Starting Visible Browser Interactive Verification...');
  const extPath = path.resolve(__dirname, '../..');
  const port = 9222;

  const harness = launchHeadedChrome({ extensionPath: extPath, port });
  console.log(`🚀 [HEADED E2E] Chrome launched (PID: ${harness.chromeProc.pid}) on port ${port}`);

  try {
    await waitForCdpReady(port);
    console.log('✅ [HEADED E2E] Chrome DevTools Protocol endpoint ready.');

    const extId = await discoverExtensionId(port);
    console.log(`✅ [HEADED E2E] Extension ID detected: ${extId}`);

    // Battery 1: Focus Timing Minimum Duration (1m / 60s)
    await runFocusTimingVerification(port, extId);

    // Battery 2: Sleep Timer Minimum Duration (1m / 60s)
    await runSleepTimerVerification(port, extId);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n============================================================');
    console.log(`🎉 [HEADED E2E] ALL HEADED VERIFICATION TESTS PASSED (${elapsed}s)`);
    console.log('============================================================');
  } catch (err) {
    console.error('❌ [HEADED E2E] Verification FAILED:', err);
    process.exitCode = 1;
  } finally {
    console.log('🧹 [HEADED E2E] Performing clean process & workspace teardown (Rule 26)...');
    await teardownHarness(harness);
    console.log('✅ [HEADED E2E] Teardown complete. All processes terminated.');
  }
}

if (require.main === module) {
  main().then(() => {
    if (process.exitCode && process.exitCode !== 0) process.exit(process.exitCode);
  });
}

module.exports = { main };
