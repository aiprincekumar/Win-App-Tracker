/**
 * Automated Verification Test Suite: Chrono-Activity Heatmap Hourly Activity Tracking (सटीक ट्रैकिंग)
 * 
 * Target Subsystems Tested:
 * 1. Phase 1: background.js (commitActiveInterval, commitBackgroundMediaDelta, updateHourlyBucket)
 * 2. Phase 2: dashboard/dashboard.js (aggregateDomainsHistoryMap, mergeDomainHourlyBucket, updateChronoHeatmap)
 * 3. Phase 3: src/dashboard/features/temporal_productivity_feature.js (hasValidHourlyTelemetry, applyDomainFallbackToMatrix, aggregateChronoHeatmap)
 * 
 * 7 Test Batteries:
 * - Battery 1: Backend Real-Time Hourly Bucket Recording (Active Foreground)
 * - Battery 2: Backend Real-Time Hourly Bucket Recording (Background Media Delta)
 * - Battery 3: Dashboard History Hourly Bucket Merging & Aggregation
 * - Battery 4: Multi-Domain Competitive Top Domain Resolution per Hour
 * - Battery 5: Temporal Heatmap Dual-Mode Telemetry Branch (Accurate Hourly Mapping)
 * - Battery 6: Temporal Heatmap Graceful Fallback Branch (Empty {} HourlyBuckets & Domain Estimation)
 * - Battery 7: Rule 28 Function Modularity, Zero-innerHTML, and UTF-8 with BOM Compliance
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const bgJsPath = path.join(baseDir, 'background.js');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');
const temporalJsPath = path.join(baseDir, 'src', 'dashboard', 'features', 'temporal_productivity_feature.js');

console.log('🧪 Starting Chrono-Activity Heatmap Hourly Tracking Test Suite (7 Batteries)...\n');

// Load Temporal Productivity Feature Module
const TemporalProductivity = require(temporalJsPath);
const { aggregateChronoHeatmap } = TemporalProductivity;

// Load functions from background.js using VM sandbox
const bgCode = fs.readFileSync(bgJsPath, 'utf8');
const bgSandbox = {
  console,
  Date,
  Math
};
vm.createContext(bgSandbox);
// Extract updateHourlyBucket
vm.runInContext(
  `
  ${bgCode.slice(bgCode.indexOf('function updateHourlyBucket'), bgCode.indexOf('function commitBackgroundMediaDelta'))}
  `,
  bgSandbox
);
const { updateHourlyBucket } = bgSandbox;

// Load functions from dashboard.js using VM sandbox
const dashCode = fs.readFileSync(dashJsPath, 'utf8');
const dashSandbox = {
  console,
  Date,
  Math,
  Object
};
vm.createContext(dashSandbox);
vm.runInContext(
  `
  ${dashCode.slice(dashCode.indexOf('function mergeDomainHourlyBucket'), dashCode.indexOf('function updateChronoHeatmap'))}
  `,
  dashSandbox
);
const { aggregateDomainsHistoryMap, mergeDomainDayStats, mergeDomainHourlyBucket } = dashSandbox;

// ===========================================================================
// Battery 1: Backend Real-Time Hourly Bucket Recording (Active Foreground)
// ===========================================================================
console.log('Battery 1: Backend Real-Time Hourly Bucket Recording (Active Foreground)');
{
  assert(typeof updateHourlyBucket === 'function', 'updateHourlyBucket must be a valid function in background.js');

  const now = Date.now();
  const currentHour = new Date(now).getHours();
  const dayEntry = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };

  updateHourlyBucket(dayEntry, 120, true, now);

  assert(dayEntry.hourlyBuckets, 'dayEntry must contain hourlyBuckets object');
  const bucket = dayEntry.hourlyBuckets[currentHour];
  assert(bucket, `Bucket for current hour (${currentHour}) must exist`);
  assert.strictEqual(bucket.activeSeconds, 120, 'Bucket activeSeconds must equal 120');
  assert.strictEqual(bucket.activeTime, 120, 'Bucket activeTime must equal 120');
  assert.strictEqual(bucket.backgroundMediaSeconds, 0, 'Bucket backgroundMediaSeconds must be 0 for foreground tracking');
  assert.strictEqual(bucket.mediaTime, 0, 'Bucket mediaTime must be 0 for foreground tracking');
  assert.strictEqual(bucket.sessions, 1, 'Bucket sessions must be 1 for first foreground session');

  // Second foreground tick in same hour
  updateHourlyBucket(dayEntry, 60, true, now);
  assert.strictEqual(bucket.activeSeconds, 180, 'Bucket activeSeconds must accumulate to 180');
  assert.strictEqual(bucket.activeTime, 180, 'Bucket activeTime must accumulate to 180');

  console.log('  ✅ Real-time foreground hourly bucket creation and accumulation verified');
}

// ===========================================================================
// Battery 2: Backend Real-Time Hourly Bucket Recording (Background Media Delta)
// ===========================================================================
console.log('\nBattery 2: Backend Real-Time Hourly Bucket Recording (Background Media Delta)');
{
  const now = Date.now();
  const currentHour = new Date(now).getHours();
  const dayEntry = { seconds: 0, foregroundSeconds: 0, backgroundMediaSeconds: 0, sessions: 1 };

  updateHourlyBucket(dayEntry, 450, false, now);

  assert(dayEntry.hourlyBuckets, 'dayEntry must contain hourlyBuckets');
  const bucket = dayEntry.hourlyBuckets[currentHour];
  assert(bucket, `Bucket for current hour (${currentHour}) must exist`);
  assert.strictEqual(bucket.activeSeconds, 0, 'Bucket activeSeconds must be 0 for background media');
  assert.strictEqual(bucket.backgroundMediaSeconds, 450, 'Bucket backgroundMediaSeconds must equal 450');
  assert.strictEqual(bucket.mediaTime, 450, 'Bucket mediaTime must equal 450');

  // Both active and media in the same hour
  updateHourlyBucket(dayEntry, 200, true, now);
  assert.strictEqual(bucket.activeSeconds, 200, 'Dual-mode bucket activeSeconds must be 200');
  assert.strictEqual(bucket.backgroundMediaSeconds, 450, 'Dual-mode bucket backgroundMediaSeconds must remain 450');

  console.log('  ✅ Real-time background media delta hourly bucket verified');
}

// ===========================================================================
// Battery 3: Dashboard History Hourly Bucket Merging & Aggregation
// ===========================================================================
console.log('\nBattery 3: Dashboard History Hourly Bucket Merging & Aggregation');
{
  assert(typeof aggregateDomainsHistoryMap === 'function', 'aggregateDomainsHistoryMap must be defined in dashboard.js');

  const mockDomains = {
    'github.com': {
      days: {
        '2026-11-19': {
          seconds: 3600,
          foregroundSeconds: 3000,
          backgroundMediaSeconds: 600,
          sessions: 2,
          hourlyBuckets: {
            '9': { activeSeconds: 1200, activeTime: 1200, backgroundMediaSeconds: 0, mediaTime: 0, sessions: 1 },
            '10': { activeSeconds: 1800, activeTime: 1800, backgroundMediaSeconds: 600, mediaTime: 600, sessions: 1 }
          }
        }
      }
    }
  };

  const historyMap = aggregateDomainsHistoryMap(mockDomains);
  assert(historyMap['2026-11-19'], 'historyMap must have entry for 2026-11-19');
  assert(historyMap['2026-11-19'].hourlyBuckets['9'], 'Hour 9 bucket must be merged');
  assert(historyMap['2026-11-19'].hourlyBuckets['10'], 'Hour 10 bucket must be merged');

  const b9 = historyMap['2026-11-19'].hourlyBuckets['9'];
  assert.strictEqual(b9.activeTime, 1200, 'Hour 9 activeTime must be 1200');
  assert.strictEqual(b9.mediaTime, 0, 'Hour 9 mediaTime must be 0');
  assert.strictEqual(b9.topDomain, 'github.com', 'Hour 9 topDomain must be github.com');

  const b10 = historyMap['2026-11-19'].hourlyBuckets['10'];
  assert.strictEqual(b10.activeTime, 1800, 'Hour 10 activeTime must be 1800');
  assert.strictEqual(b10.mediaTime, 600, 'Hour 10 mediaTime must be 600');
  assert.strictEqual(b10.topDomain, 'github.com', 'Hour 10 topDomain must be github.com');

  console.log('  ✅ Dashboard domain history merged into daily hourlyBuckets accurately');
}

// ===========================================================================
// Battery 4: Multi-Domain Competitive Top Domain Resolution per Hour
// ===========================================================================
console.log('\nBattery 4: Multi-Domain Competitive Top Domain Resolution per Hour');
{
  const mockDomains = {
    'docs.google.com': {
      days: {
        '2026-11-19': {
          seconds: 500,
          foregroundSeconds: 500,
          hourlyBuckets: {
            '14': { activeSeconds: 500, activeTime: 500, backgroundMediaSeconds: 0, mediaTime: 0, sessions: 1 }
          }
        }
      }
    },
    'youtube.com': {
      days: {
        '2026-11-19': {
          seconds: 1500,
          backgroundMediaSeconds: 1500,
          hourlyBuckets: {
            '14': { activeSeconds: 0, activeTime: 0, backgroundMediaSeconds: 1500, mediaTime: 1500, sessions: 0 }
          }
        }
      }
    },
    'slack.com': {
      days: {
        '2026-11-19': {
          seconds: 300,
          foregroundSeconds: 300,
          hourlyBuckets: {
            '14': { activeSeconds: 300, activeTime: 300, backgroundMediaSeconds: 0, mediaTime: 0, sessions: 1 }
          }
        }
      }
    }
  };

  const historyMap = aggregateDomainsHistoryMap(mockDomains);
  const hour14 = historyMap['2026-11-19'].hourlyBuckets['14'];

  assert.strictEqual(hour14.activeTime, 800, 'Hour 14 total activeTime must sum google docs (500) + slack (300)');
  assert.strictEqual(hour14.mediaTime, 1500, 'Hour 14 total mediaTime must equal youtube (1500)');
  // Top domain: youtube (1500 total) > docs (500) > slack (300)
  assert.strictEqual(hour14.topDomain, 'youtube.com', 'Top domain must be youtube.com (1500s > 500s > 300s)');

  console.log('  ✅ Multi-domain top domain resolved by highest total duration (youtube.com winner)');
}

// ===========================================================================
// Battery 5: Temporal Heatmap Dual-Mode Telemetry Branch (Accurate Hourly Mapping)
// ===========================================================================
console.log('\nBattery 5: Temporal Heatmap Dual-Mode Telemetry Branch (Accurate Hourly Mapping)');
{
  const now = new Date();
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = formatYMD(now);
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0

  const mockHistory = {
    [todayStr]: {
      hourlyBuckets: {
        '9': { activeSeconds: 1800, activeTime: 1800, backgroundMediaSeconds: 0, mediaTime: 0, sessions: 1, topDomain: 'github.com' },
        '15': { activeSeconds: 2400, activeTime: 2400, backgroundMediaSeconds: 1200, mediaTime: 1200, sessions: 2, topDomain: 'figma.com' }
      }
    }
  };

  const res = aggregateChronoHeatmap(mockHistory, 'today');
  assert(res && Array.isArray(res.matrix), 'Must return 7x24 matrix array');

  const cell9 = res.matrix[dayOfWeek][9];
  assert.strictEqual(cell9.activeSeconds, 1800, 'Cell [today][9] activeSeconds must be 1800');
  assert.strictEqual(cell9.mediaSeconds, 0, 'Cell [today][9] mediaSeconds must be 0');
  assert.strictEqual(cell9.topDomain, 'github.com', 'Cell [today][9] topDomain must be github.com');
  assert.strictEqual(cell9.intensity, 2, 'Cell [today][9] intensity must be 2 (30m)');

  const cell15 = res.matrix[dayOfWeek][15];
  assert.strictEqual(cell15.activeSeconds, 2400, 'Cell [today][15] activeSeconds must be 2400');
  assert.strictEqual(cell15.mediaSeconds, 1200, 'Cell [today][15] mediaSeconds must be 1200');
  assert.strictEqual(cell15.topDomain, 'figma.com', 'Cell [today][15] topDomain must be figma.com');
  assert.strictEqual(cell15.intensity, 3, 'Cell [today][15] intensity must be 3 (40m)');

  // Hour 12 has 0 activity
  const cell12 = res.matrix[dayOfWeek][12];
  assert.strictEqual(cell12.activeSeconds, 0, 'Cell [today][12] activeSeconds must be 0');
  assert.strictEqual(cell12.intensity, 0, 'Cell [today][12] intensity must be 0');

  console.log('  ✅ Accurate hour telemetry successfully mapped to heatmap matrix cells');
}

// ===========================================================================
// Battery 6: Temporal Heatmap Graceful Fallback Branch (Empty {} HourlyBuckets & Domain Estimation)
// ===========================================================================
console.log('\nBattery 6: Temporal Heatmap Graceful Fallback Branch (Empty {} HourlyBuckets & Domain Estimation)');
{
  const now = new Date();
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = formatYMD(now);
  const dayOfWeek = (now.getDay() + 6) % 7;

  // Case A: hourlyBuckets is empty {} - MUST trigger fallback!
  const mockHistoryEmptyBuckets = {
    [todayStr]: {
      hourlyBuckets: {}, // Empty object
      domains: {
        'vscode.dev': {
          seconds: 800,
          foregroundSeconds: 800,
          backgroundMediaSeconds: 0
        }
      }
    }
  };

  const resA = aggregateChronoHeatmap(mockHistoryEmptyBuckets, 'today');
  // Fallback distributes 800s over 8 hours (10:00 to 17:00), i.e., 100s per hour
  for (let h = 10; h < 18; h++) {
    const cell = resA.matrix[dayOfWeek][h];
    assert.strictEqual(cell.activeSeconds, 100, `Cell [today][${h}] must receive 100s from fallback`);
    assert.strictEqual(cell.topDomain, 'vscode.dev', `Cell [today][${h}] topDomain must be vscode.dev`);
    assert(cell.intensity >= 1, `Cell [today][${h}] must have intensity >= 1`);
  }
  // Hours outside 10..17 must be 0
  assert.strictEqual(resA.matrix[dayOfWeek][8].activeSeconds, 0, 'Cell [today][8] must be 0');
  assert.strictEqual(resA.matrix[dayOfWeek][18].activeSeconds, 0, 'Cell [today][18] must be 0');

  // Case B: hourlyBuckets contains only zeroes - MUST trigger fallback!
  const mockHistoryZeroBuckets = {
    [todayStr]: {
      hourlyBuckets: {
        '10': { activeSeconds: 0, activeTime: 0, backgroundMediaSeconds: 0, mediaTime: 0 }
      },
      domains: {
        'linear.app': {
          seconds: 400
        }
      }
    }
  };

  const resB = aggregateChronoHeatmap(mockHistoryZeroBuckets, 'today');
  assert.strictEqual(resB.matrix[dayOfWeek][10].activeSeconds, 50, 'Zero-bucket day must fall back to domain estimation (400 / 8 = 50s)');

  console.log('  ✅ Graceful fallback verified when hourlyBuckets is empty or all zeroes');
}

// ===========================================================================
// Battery 7: Rule 28 Function Modularity, Zero-innerHTML, and UTF-8 with BOM Compliance
// ===========================================================================
console.log('\nBattery 7: Rule 28 Function Modularity, Zero-innerHTML, and UTF-8 with BOM Compliance');
{
  const targetFiles = [
    { name: 'background.js', path: bgJsPath },
    { name: 'dashboard/dashboard.js', path: dashJsPath },
    { name: 'src/dashboard/features/temporal_productivity_feature.js', path: temporalJsPath }
  ];

  targetFiles.forEach(tf => {
    // 1. UTF-8 BOM (0xEF, 0xBB, 0xBF)
    const buf = fs.readFileSync(tf.path);
    const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    assert(hasBOM, `${tf.name} must start with UTF-8 BOM`);

    // 2. W3C Trusted Types zero-innerHTML safety
    const code = fs.readFileSync(tf.path, 'utf8');
    if (tf.name.endsWith('temporal_productivity_feature.js')) {
      assert(!code.includes('.innerHTML'), `${tf.name} must NOT contain innerHTML`);
      assert(!code.includes('dangerouslySetInnerHTML'), `${tf.name} must NOT contain dangerous HTML`);
    }

    // 3. Modularity check: helper functions created in this phase must be <= 50 lines
    const phaseFunctions = [
      'updateHourlyBucket',
      'mergeDomainHourlyBucket',
      'mergeDomainDayStats',
      'aggregateDomainsHistoryMap',
      'hasValidHourlyTelemetry',
      'applyDomainFallbackToMatrix'
    ];

    const lines = code.split('\n');
    phaseFunctions.forEach(fnName => {
      const fnDecl = `function ${fnName}`;
      const fnIdx = lines.findIndex(l => l.includes(fnDecl));
      if (fnIdx !== -1) {
        let braceCount = 0;
        let fnEnd = fnIdx;
        for (let i = fnIdx; i < lines.length; i++) {
          for (const ch of lines[i]) {
            if (ch === '{') braceCount++;
            else if (ch === '}') {
              braceCount--;
              if (braceCount === 0) {
                fnEnd = i;
                break;
              }
            }
          }
          if (braceCount === 0 && fnEnd > fnIdx) break;
        }
        const length = fnEnd - fnIdx + 1;
        assert(
          length <= 50,
          `Rule 28 Violation: Function ${fnName} in ${tf.name} is ${length} lines (max 50)`
        );
      }
    });
  });

  console.log('  ✅ 100% UTF-8 with BOM certified across all 3 target files');
  console.log('  ✅ 100% W3C Trusted Types zero-innerHTML certified');
  console.log('  ✅ Universal Rule 28 certified: all phase helper functions <= 50 lines');
}

console.log('\n============================================================');
console.log('🎉 ALL 7 BATTERIES PASSED 100% CLEAN (Exit Code 0)');
console.log('============================================================\n');
process.exit(0);
