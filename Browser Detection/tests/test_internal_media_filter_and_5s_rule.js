/**
 * Test Suite: Internal Media Filter & Minimum 5-Second Playback Rule Verification
 * Tests both background.js and dashboard.js for strict internal/extension exclusion
 * and minimum 5-second watch duration threshold.
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Internal Media Filter & Minimum 5-Second Rule Test Suite...\n');

const bgPath = path.join(__dirname, '../background.js');
const dashPath = path.join(__dirname, '../dashboard/dashboard.js');

const bgCode = fs.readFileSync(bgPath, 'utf8');
const dashCode = fs.readFileSync(dashPath, 'utf8');

(async function runAll() {
// ---------------------------------------------------------------------------
// Battery 1: Static Code Invariant Audit
// ---------------------------------------------------------------------------
console.log('Battery 1: Static Code Invariant Audit');
{
  assert(bgCode.includes('function isInternalDomain('), 'background.js must define isInternalDomain()');
  assert(bgCode.includes('function isInternalUrl('), 'background.js must define isInternalUrl()');
  assert(bgCode.includes('if (session.watchDuration >= 5)'), 'background.js finalizeMediaSession must require watchDuration >= 5');
  assert(bgCode.includes('session.watchDuration < 5'), 'background.js updateMediaHistoryEntry must reject watchDuration < 5');
  assert(dashCode.includes('function isInternalMediaEntry('), 'dashboard.js must define isInternalMediaEntry()');
  assert(dashCode.includes('function getMediaItemDuration('), 'dashboard.js must define getMediaItemDuration()');
  assert(dashCode.includes('getDuration(item) < 5'), 'dashboard.js resolveUnifiedMediaHistory must filter sub-5s duration');

  console.log('  ✅ background.js defines isInternalDomain() and isInternalUrl()');
  console.log('  ✅ finalizeMediaSession() and updateMediaHistoryEntry() require watchDuration >= 5');
  console.log('  ✅ dashboard.js defines isInternalMediaEntry() and getMediaItemDuration()');
  console.log('  ✅ resolveUnifiedMediaHistory() filters sub-5s duration and internal domains');
}

// ---------------------------------------------------------------------------
// Battery 2: background.js isInternalDomain & isInternalUrl Unit Verification
// ---------------------------------------------------------------------------
console.log('\nBattery 2: isInternalDomain & isInternalUrl Unit Verification');
{
  const sandbox = {
    URL: global.URL,
    console: console
  };

  // Extract isInternalDomain and isInternalUrl definitions from background.js
  const domainFnMatch = bgCode.match(/function isInternalDomain[\s\S]*?\n\}/);
  const urlFnMatch = bgCode.match(/function isInternalUrl[\s\S]*?\n\}/);
  assert(domainFnMatch, 'Could not extract isInternalDomain from background.js');
  assert(urlFnMatch, 'Could not extract isInternalUrl from background.js');

  vm.runInNewContext(domainFnMatch[0] + '\n' + urlFnMatch[0], sandbox);
  const isInternalDomain = sandbox.isInternalDomain;
  const isInternalUrl = sandbox.isInternalUrl;

  // 1. Internal domains must return true
  assert.strictEqual(isInternalDomain('dashboard'), true);
  assert.strictEqual(isInternalDomain('Dashboard'), true);
  assert.strictEqual(isInternalDomain('extension'), true);
  assert.strictEqual(isInternalDomain('Extension'), true);
  assert.strictEqual(isInternalDomain('127.0.0.1'), true);
  assert.strictEqual(isInternalDomain('localhost'), true);
  assert.strictEqual(isInternalDomain('127.0.0.1:8080'), true);
  assert.strictEqual(isInternalDomain('localhost:3000'), true);
  assert.strictEqual(isInternalDomain('chrome'), true);
  assert.strictEqual(isInternalDomain('edge'), true);
  assert.strictEqual(isInternalDomain('about'), true);
  assert.strictEqual(isInternalDomain('newtab'), true);
  assert.strictEqual(isInternalDomain('web'), true);
  assert.strictEqual(isInternalDomain('unknown'), true);

  // 2. Legitimate external domains must return false
  assert.strictEqual(isInternalDomain('youtube.com'), false);
  assert.strictEqual(isInternalDomain('www.youtube.com'), false);
  assert.strictEqual(isInternalDomain('dashboard.stripe.com'), false, 'dashboard.stripe.com must NOT be classified as internal');
  assert.strictEqual(isInternalDomain('github.com'), false);
  assert.strictEqual(isInternalDomain('spotify.com'), false);
  assert.strictEqual(isInternalDomain('netflix.com'), false);

  // 3. Internal URLs must return true
  assert.strictEqual(isInternalUrl('chrome-extension://abcdef123456/dashboard/dashboard.html'), true);
  assert.strictEqual(isInternalUrl('edge-extension://abcdef123456/dashboard/dashboard.html'), true);
  assert.strictEqual(isInternalUrl('chrome://settings'), true);
  assert.strictEqual(isInternalUrl('edge://history'), true);
  assert.strictEqual(isInternalUrl('about:blank'), true);
  assert.strictEqual(isInternalUrl('about:newtab'), true);
  assert.strictEqual(isInternalUrl('http://127.0.0.1:8080/dashboard/dashboard.html'), true);
  assert.strictEqual(isInternalUrl('http://localhost:3000/dashboard.html'), true);
  assert.strictEqual(isInternalUrl('file:///C:/Users/Atul/Desktop/dashboard/dashboard.html'), true);

  // 4. Legitimate external URLs containing "dashboard" must return false (not blocked!)
  assert.strictEqual(isInternalUrl('https://dashboard.stripe.com/test/overview'), false);
  assert.strictEqual(isInternalUrl('https://github.com/dashboard'), false);
  assert.strictEqual(isInternalUrl('https://analytics.google.com/analytics/web/#/dashboard'), false);
  assert.strictEqual(isInternalUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), false);
  assert.strictEqual(isInternalUrl('https://open.spotify.com/track/abc123xyz'), false);

  console.log('  ✅ isInternalDomain() accurately classifies internal domains and preserves external subdomains');
  console.log('  ✅ isInternalUrl() accurately classifies extension URLs and preserves legitimate dashboard paths');
}

// ---------------------------------------------------------------------------
// Battery 3: handleTabAudibleStateChange Internal Tab Rejection Simulation
// ---------------------------------------------------------------------------
console.log('\nBattery 3: handleTabAudibleStateChange Internal Tab Rejection Simulation');
{
  const activeMediaSessions = new Map();
  let streamedMessages = [];

  const mockSandbox = {
    settings: { mediaTrackingEnabled: true },
    activeMediaSessions,
    activeTabId: 1,
    isBrowserFocused: true,
    browserAPI: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'chrome-extension://test/dashboard/dashboard.html', title: 'Dashboard Audio Lab' })
      }
    },
    extractDomain: (url) => url.includes('dashboard') ? 'Dashboard' : 'youtube.com',
    streamMediaSessionUpdate: (session, action) => streamedMessages.push({ session, action }),
    URL: global.URL,
    Date: Date,
    Math: Math,
    Promise: Promise
  };

  const domainFnMatch = bgCode.match(/function isInternalDomain[\s\S]*?\n\}/);
  const urlFnMatch = bgCode.match(/function isInternalUrl[\s\S]*?\n\}/);
  const audibleFnMatch = bgCode.match(/async function handleTabAudibleStateChange[\s\S]*?\n\}/);

  vm.runInNewContext(
    domainFnMatch[0] + '\n' +
    urlFnMatch[0] + '\n' +
    audibleFnMatch[0],
    mockSandbox
  );

  const handleAudible = mockSandbox.handleTabAudibleStateChange;

  // Simulate Chrome firing tab.audible: true for the Dashboard extension tab (Audio Lab playback)
  const dashboardTab = {
    id: 101,
    url: 'chrome-extension://sentinel_id/dashboard/dashboard.html',
    title: 'Web Activity & Media Sentinel - Dashboard'
  };

  // Execute
  await handleAudible(101, true, dashboardTab);

  assert.strictEqual(activeMediaSessions.has(101), false, 'Dashboard tab must NEVER be registered in activeMediaSessions');
  assert.strictEqual(streamedMessages.length, 0, 'Dashboard tab audio must NEVER stream telemetry to Data Hub');
  console.log('  ✅ Dashboard tab audible event successfully intercepted and discarded (0 sessions registered)');
}

// ---------------------------------------------------------------------------
// Battery 4: Minimum 5-Second Playback Rule & Noise Discard Verification
// ---------------------------------------------------------------------------
console.log('\nBattery 4: Minimum 5-Second Playback Rule & Noise Discard Verification');
{
  let mediaHistory = [];
  let savedCount = 0;
  const activeMediaSessions = new Map();
  let finalizedStreams = [];

  const mockSandbox = {
    mediaHistory: [],
    CONFIG: { MAX_MEDIA_HISTORY: 50 },
    activeMediaSessions,
    saveMediaHistory: () => { savedCount++; },
    streamMediaSessionUpdate: (session, action) => finalizedStreams.push({ session, action }),
    URL: global.URL,
    Date: Date,
    Math: Math
  };

  const domainFnMatch = bgCode.match(/function isInternalDomain[\s\S]*?\n\}/);
  const urlFnMatch = bgCode.match(/function isInternalUrl[\s\S]*?\n\}/);
  const updateHistoryFnMatch = bgCode.match(/function updateMediaHistoryEntry[\s\S]*?\n\}/);
  const finalizeFnMatch = bgCode.match(/function finalizeMediaSession[\s\S]*?\n\}/);

  vm.runInNewContext(
    domainFnMatch[0] + '\n' +
    urlFnMatch[0] + '\n' +
    updateHistoryFnMatch[0] + '\n' +
    finalizeFnMatch[0],
    mockSandbox
  );

  const updateEntry = mockSandbox.updateMediaHistoryEntry;
  const finalize = mockSandbox.finalizeMediaSession;

  // Case A: 3-second playback (sub-5s noise)
  const transientSession = {
    id: 'transient_sess_1',
    tabId: 201,
    title: 'Short Preview Clip',
    platform: 'youtube.com',
    domain: 'youtube.com',
    url: 'https://youtube.com/watch?v=preview',
    mediaType: 'video',
    watchDuration: 3,
    volumeSamples: [100],
    peakVolume: 100,
    lowVolume: 100,
    averageVolume: 100,
    isPlaying: true
  };
  mockSandbox.activeMediaSessions.set(201, transientSession);

  // Attempt to update - must be rejected
  updateEntry(transientSession, false);
  assert.strictEqual(mockSandbox.mediaHistory.length, 0, 'Sub-5s session must not enter mediaHistory via updateMediaHistoryEntry');

  // Finalize transient session - must discard without committing to history
  finalize(201);
  assert.strictEqual(mockSandbox.activeMediaSessions.has(201), false, 'Session must be cleaned from active sessions');
  assert.strictEqual(mockSandbox.mediaHistory.length, 0, 'Sub-5s session must be discarded as transient noise on finalize');

  // Case B: 12-second genuine playback (>= 5s)
  const genuineSession = {
    id: 'genuine_sess_2',
    tabId: 202,
    title: 'Full Podcast Episode',
    platform: 'youtube.com',
    domain: 'youtube.com',
    url: 'https://youtube.com/watch?v=podcast',
    mediaType: 'video',
    watchDuration: 12,
    volumeSamples: [90, 95],
    peakVolume: 95,
    lowVolume: 90,
    averageVolume: 93,
    isPlaying: true
  };
  mockSandbox.activeMediaSessions.set(202, genuineSession);

  finalize(202);
  assert.strictEqual(mockSandbox.activeMediaSessions.has(202), false);
  assert.strictEqual(mockSandbox.mediaHistory.length, 1, 'Genuine session (>= 5s) must be committed to mediaHistory');
  assert.strictEqual(mockSandbox.mediaHistory[0].id, 'genuine_sess_2');
  assert.strictEqual(mockSandbox.mediaHistory[0].watchDuration, 12);

  console.log('  ✅ 3-second transient session (< 5s) cleanly discarded on finalize');
  console.log('  ✅ 12-second genuine session (>= 5s) cleanly committed to mediaHistory');
}

// ---------------------------------------------------------------------------
// Battery 5: dashboard.js resolveUnifiedMediaHistory Defense-in-Depth
// ---------------------------------------------------------------------------
console.log('\nBattery 5: dashboard.js resolveUnifiedMediaHistory Defense-in-Depth');
{
  const sandbox = {
    URL: global.URL,
    console: console
  };

  const internalMediaFnMatch = dashCode.match(/function isInternalMediaEntry[\s\S]*?\n\}/);
  const durationFnMatch = dashCode.match(/function getMediaItemDuration[\s\S]*?\n\}/);
  const resolveFnMatch = dashCode.match(/function resolveUnifiedMediaHistory[\s\S]*?\n\}/);

  assert(internalMediaFnMatch, 'Could not extract isInternalMediaEntry from dashboard.js');
  assert(durationFnMatch, 'Could not extract getMediaItemDuration from dashboard.js');
  assert(resolveFnMatch, 'Could not extract resolveUnifiedMediaHistory from dashboard.js');

  vm.runInNewContext(
    internalMediaFnMatch[0] + '\n' +
    durationFnMatch[0] + '\n' +
    resolveFnMatch[0],
    sandbox
  );

  const resolveUnified = sandbox.resolveUnifiedMediaHistory;
  const isInternalMediaEntry = sandbox.isInternalMediaEntry;

  // 1. Verify isInternalMediaEntry
  assert.strictEqual(isInternalMediaEntry({ domain: 'dashboard' }), true);
  assert.strictEqual(isInternalMediaEntry({ domain: 'Dashboard' }), true);
  assert.strictEqual(isInternalMediaEntry({ url: 'chrome-extension://xyz/dashboard/dashboard.html' }), true);
  assert.strictEqual(isInternalMediaEntry({ domain: 'dashboard.stripe.com', url: 'https://dashboard.stripe.com' }), false);
  assert.strictEqual(isInternalMediaEntry({ domain: 'youtube.com', url: 'https://youtube.com/watch?v=1' }), false);

  // 2. Verify resolveUnifiedMediaHistory filters out internal and sub-5s items
  const dirtyHubList = [
    { id: '1', domain: 'Dashboard', title: 'Internal Audio', watchDuration: 45, timestamp: 1000 },
    { id: '2', domain: 'youtube.com', title: '1s Blip', watchDuration: 1, timestamp: 2000 },
    { id: '3', domain: 'youtube.com', title: '4s Blip', watchDuration: 4, timestamp: 3000 },
    { id: '4', domain: 'youtube.com', title: 'Valid 30s Video', watchDuration: 30, timestamp: 4000 },
    { id: '5', domain: 'dashboard.stripe.com', title: 'Valid Stripe Tutorial', watchDuration: 60, timestamp: 5000 }
  ];

  const dirtyBgList = [
    { id: '6', domain: 'extension', title: 'Popup Sound', watchDuration: 10, timestamp: 6000 },
    { id: '7', domain: 'netflix.com', title: 'Valid 120s Movie', watchDuration: 120, timestamp: 7000 }
  ];

  const cleanUnified = resolveUnified(dirtyBgList, dirtyHubList);

  // Must only contain id: '4', '5', '7'
  assert.strictEqual(cleanUnified.length, 3, 'Only >= 5s external items must remain');
  const ids = cleanUnified.map(item => item.id);
  assert(ids.includes('4'), 'Must retain valid YouTube video');
  assert(ids.includes('5'), 'Must retain valid dashboard.stripe.com video');
  assert(ids.includes('7'), 'Must retain valid Netflix movie');
  assert(!ids.includes('1'), 'Must filter out Dashboard');
  assert(!ids.includes('2'), 'Must filter out 1s blip');
  assert(!ids.includes('3'), 'Must filter out 4s blip');
  assert(!ids.includes('6'), 'Must filter out extension domain');

  console.log('  ✅ isInternalMediaEntry() correctly filters dashboard/internal items and preserves stripe.com');
  console.log('  ✅ resolveUnifiedMediaHistory() filters out sub-5s duration and internal records cleanly');
}

// ---------------------------------------------------------------------------
// Battery 6: SQLite Database Consistency & Pruned Verification
// ---------------------------------------------------------------------------
console.log('\nBattery 6: SQLite Database Consistency & Pruned Verification');
{
  const { execSync, execFileSync } = require('child_process');
  const candidatePythons = [
    'python',
    'py',
    'C:\\Users\\Atul Verma\\.venv\\Scripts\\python.exe',
    'C:\\Users\\Atul Verma\\.local\\bin\\python.exe'
  ];
  let pythonCmd = 'python';
  for (const cand of candidatePythons) {
    try {
      execSync(`"${cand}" --version`, { stdio: 'ignore' });
      pythonCmd = cand;
      break;
    } catch (e) {}
  }

  const pyVerify = `
import sqlite3
db_path = r"C:\\Users\\Atul Verma\\Desktop\\Win App Tracker\\Browser Data Hub\\browser_activity.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Check for any remaining internal records
cur.execute("""
    SELECT COUNT(*) FROM media_sessions 
    WHERE domain IN ('dashboard', 'Dashboard', '127.0.0.1', 'localhost', 'web')
       OR domain LIKE 'chrome-extension://%'
       OR domain LIKE 'edge-extension://%'
       OR url LIKE 'chrome-extension://%'
       OR url LIKE 'edge-extension://%'
       OR url LIKE 'moz-extension://%'
       OR url LIKE 'chrome://%'
       OR url LIKE '%dashboard/dashboard.html%'
""")
internal_count = cur.fetchone()[0]

# Check for any remaining sub-5s duration records
cur.execute("SELECT COUNT(*) FROM media_sessions WHERE watch_duration_seconds < 5")
sub5_count = cur.fetchone()[0]

# Check total count
cur.execute("SELECT COUNT(*) FROM media_sessions")
total_count = cur.fetchone()[0]

# Integrity check
cur.execute("PRAGMA integrity_check;")
integrity = cur.fetchone()[0]

print(f"{internal_count},{sub5_count},{total_count},{integrity}")
conn.close()
`;

  let output;
  try {
    output = execFileSync(pythonCmd, ['-c', pyVerify], { encoding: 'utf8' }).trim();
  } catch (e) {
    output = execSync(`"${pythonCmd}" -c "${pyVerify.replace(/\r?\n/g, ' ')}"`, { encoding: 'utf8' }).trim();
  }
  const [internalCount, sub5Count, totalCount, integrity] = output.split(',');

  assert.strictEqual(Number(internalCount), 0, 'media_sessions must contain 0 internal domain/URL records');
  assert.strictEqual(Number(sub5Count), 0, 'media_sessions must contain 0 sub-5-second duration records');
  assert(Number(totalCount) > 0, 'media_sessions must retain legitimate records');
  assert.strictEqual(integrity, 'ok', 'PRAGMA integrity_check must return "ok"');

  console.log(`  ✅ SQLite database certified: 0 internal records, 0 sub-5s records, ${totalCount} valid sessions remaining`);
  console.log(`  ✅ PRAGMA integrity_check certified: "${integrity}"`);
}

console.log('\n🎉 ALL INTERNAL MEDIA FILTER & 5-SECOND RULE TESTS PASSED (Grade A+ Certified)!\n');
})().catch(err => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
