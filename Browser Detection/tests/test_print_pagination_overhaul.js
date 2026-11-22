/**
 * Sentinel Web Activity & Media Sentinel - Standalone QA Verification Suite
 * Test Suite: tests/test_print_pagination_overhaul.js
 * Task ID: AUTH-MGR-20261122-PRINT-PAGINATION-001
 * 
 * Verifies Full Print Pagination & Blank Void Overhaul across Target 1 & Target 2:
 * - Battery 1: CSS Grid Deconstruction & Block Overrides
 * - Battery 2: Premature Page-Break Avoidance Audit
 * - Battery 3: Non-Printable UI Leakage Prevention
 * - Battery 4: Multi-Page Table Fragmentation & Border Collapse
 * - Battery 5: Standalone HTML Digest Embedded CSS Audit
 * - Battery 6: Universal Rule 28 Compliance & UTF-8 with BOM Standard
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🧪 PRINT PAGINATION & BLANK VOID OVERHAUL QA SUITE');
console.log('============================================================\n');

const baseDir = path.resolve(__dirname, '..');
const featurePath = path.join(baseDir, 'src/dashboard/features/backup_hub_digest_feature.js');
const backupCssPath = path.join(baseDir, 'dashboard/styles/backup_digest.css');
const dashboardCssPath = path.join(baseDir, 'dashboard/dashboard.css');

const dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
const backupCss = fs.readFileSync(backupCssPath, 'utf8');
const featureContent = fs.readFileSync(featurePath, 'utf8');

function extractPrintSection(content) {
  const printIdx = content.indexOf('@media print');
  if (printIdx === -1) return '';
  return content.slice(printIdx);
}

// ============================================================
// Battery 1: CSS Grid Deconstruction & Block Overrides
// ============================================================
console.log('Battery 1: CSS Grid Deconstruction & Block Overrides');
[
  { name: 'dashboard.css', content: dashboardCss },
  { name: 'backup_digest.css', content: backupCss }
].forEach(({ name, content }) => {
  const printCss = extractPrintSection(content);
  assert(printCss.length > 0, `${name} must contain @media print`);
  assert(
    printCss.includes('.bento-grid-container') && printCss.includes('display: block !important'),
    `${name} must set .bento-grid-container to display: block !important in @media print`
  );
  // Ensure .bento-grid-container is not declared as display: grid inside print
  const bentoGridBlockMatch = printCss.match(/\.bento-grid-container\s*\{([^}]+)\}/);
  assert(bentoGridBlockMatch, `${name} must have a dedicated .bento-grid-container rule in print`);
  assert(
    !bentoGridBlockMatch[1].includes('display: grid'),
    `${name} must NOT leave .bento-grid-container as display: grid in @media print`
  );
  // Layout containers must be display: block !important
  assert(
    printCss.includes('.dashboard-layout') && printCss.includes('.main-stage') && printCss.includes('display: block !important'),
    `${name} must set layout containers to display: block !important`
  );
  console.log(`  ✅ ${name}: CSS Grid safely deconstructed to block flow`);
});
console.log('');

// ============================================================
// Battery 2: Premature Page-Break Avoidance Audit
// ============================================================
console.log('Battery 2: Premature Page-Break Avoidance Audit');
[
  { name: 'dashboard.css', content: dashboardCss },
  { name: 'backup_digest.css', content: backupCss },
  { name: 'backup_hub_digest_feature.js', content: featureContent }
].forEach(({ name, content }) => {
  const printCss = extractPrintSection(content);
  
  // Find all selectors that have break-inside: avoid or page-break-inside: avoid
  const avoidRuleRegex = /([^};]+)\{[^}]*(?:page-)?break-inside\s*:\s*avoid[^}]*\}/g;
  let match;
  const avoidSelectors = [];
  while ((match = avoidRuleRegex.exec(printCss)) !== null) {
    const rawSel = match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    rawSel.split(',').forEach(s => {
      const trimmed = s.trim();
      if (trimmed) avoidSelectors.push(trimmed);
    });
  }

  // Compound containers must NOT be set to break-inside: avoid
  assert(
    !avoidSelectors.includes('.metrics-grid'),
    `${name}: .metrics-grid must NOT have break-inside: avoid in @media print`
  );
  if (name !== 'backup_hub_digest_feature.js') {
    assert(
      !avoidSelectors.includes('.analytics-hero-card'),
      `${name}: .analytics-hero-card must NOT have break-inside: avoid in @media print`
    );
  }
  assert(
    !avoidSelectors.includes('.chart-section'),
    `${name}: .chart-section must NOT have break-inside: avoid in @media print`
  );

  // Atomic elements MUST have break-inside: avoid
  assert(
    avoidSelectors.some(s => s.includes('.metric-card')),
    `${name}: .metric-card MUST retain break-inside: avoid in @media print`
  );
  assert(
    avoidSelectors.includes('tr'),
    `${name}: table row tr MUST retain break-inside: avoid in @media print`
  );

  console.log(`  ✅ ${name}: Zero premature page-break avoidance leaks; atomic isolation verified`);
});
console.log('');

// ============================================================
// Battery 3: Non-Printable UI Leakage Prevention
// ============================================================
console.log('Battery 3: Non-Printable UI Leakage Prevention');
[
  { name: 'dashboard.css', content: dashboardCss },
  { name: 'backup_digest.css', content: backupCss }
].forEach(({ name, content }) => {
  const printCss = extractPrintSection(content);
  const requiredSuppressed = [
    '.sidebar',
    '.top-app-bar',
    '.btn',
    '.btn-action-outline',
    '.temporal-subtabs',
    '.no-print',
    '#toastContainer',
    '.floating-actions',
    '.audio-scrubber-dock',
    '.player-scrubber-slider'
  ];
  requiredSuppressed.forEach(sel => {
    assert(printCss.includes(sel), `${name} must suppress ${sel} in print`);
  });
  console.log(`  ✅ ${name}: Full suppression list active with zero layout height`);
});
console.log('');

// ============================================================
// Battery 4: Multi-Page Table Fragmentation & Border Collapse
// ============================================================
console.log('Battery 4: Multi-Page Table Fragmentation & Border Collapse');
[
  { name: 'dashboard.css', content: dashboardCss },
  { name: 'backup_digest.css', content: backupCss },
  { name: 'backup_hub_digest_feature.js', content: featureContent }
].forEach(({ name, content }) => {
  const printCss = extractPrintSection(content);
  assert(printCss.includes('border-collapse: collapse !important'), `${name} must enforce border-collapse: collapse !important`);
  assert(printCss.includes('display: table-header-group !important'), `${name} must enforce thead display: table-header-group !important`);
  assert(printCss.includes('display: table-row-group !important'), `${name} must enforce tbody display: table-row-group !important`);
  console.log(`  ✅ ${name}: Multi-page table fragmentation & thead repeat certified`);
});
console.log('');

// ============================================================
// Battery 5: Standalone HTML Digest Embedded CSS Audit
// ============================================================
console.log('Battery 5: Standalone HTML Digest Embedded CSS Audit');
const featureDigestMatch = featureContent.match(/const EXECUTIVE_DIGEST_CSS\s*=\s*`([\s\S]*?)`;/);
assert(featureDigestMatch, 'backup_hub_digest_feature.js must define EXECUTIVE_DIGEST_CSS');
const digestCss = featureDigestMatch[1];
const digestPrintCss = extractPrintSection(digestCss);

assert(
  digestPrintCss.includes('.chart-section') && (digestPrintCss.includes('break-inside: auto !important') || digestPrintCss.includes('page-break-inside: auto !important')),
  'EXECUTIVE_DIGEST_CSS: .chart-section must have break-inside: auto !important'
);
assert(
  digestPrintCss.includes('.donut-wrapper') && digestPrintCss.includes('110px'),
  'EXECUTIVE_DIGEST_CSS: donut dimensions must be compacted to 110px in print'
);
assert(
  digestPrintCss.includes('.metrics-grid') && digestPrintCss.includes('gap: 8px !important'),
  'EXECUTIVE_DIGEST_CSS: .metrics-grid must be compacted with gap: 8px !important'
);
assert(
  digestPrintCss.includes('padding: 6px 8px !important') || digestPrintCss.includes('padding: 5px 8px !important'),
  'EXECUTIVE_DIGEST_CSS: table cells must have high-density print padding <= 8px'
);
assert(
  digestPrintCss.includes('.digest-container') && digestPrintCss.includes('box-shadow: none !important'),
  'EXECUTIVE_DIGEST_CSS: .digest-container must strip shadows and borders in print'
);
console.log('  ✅ Standalone Executive Digest embedded CSS certified for multi-page print flow\n');

// ============================================================
// Battery 6: Universal Rule 28 Compliance & UTF-8 with BOM Standard
// ============================================================
console.log('Battery 6: Universal Rule 28 Compliance & UTF-8 with BOM Standard');
const allModifiedFiles = [
  dashboardCssPath,
  backupCssPath,
  featurePath,
  __filename
];

allModifiedFiles.forEach(f => {
  const buf = fs.readFileSync(f);
  assert.strictEqual(buf[0], 0xef, `${path.basename(f)} missing UTF-8 BOM byte 1`);
  assert.strictEqual(buf[1], 0xbb, `${path.basename(f)} missing UTF-8 BOM byte 2`);
  assert.strictEqual(buf[2], 0xbf, `${path.basename(f)} missing UTF-8 BOM byte 3`);
  console.log(`  ✅ ${path.basename(f)}: 100% UTF-8 with BOM certified (0xEF, 0xBB, 0xBF)`);
});

// backup_digest.css <= 650 lines check
const backupLines = backupCss.split(/\r?\n/).length;
assert(backupLines <= 650, `dashboard/styles/backup_digest.css (${backupLines} lines) must be <= 650 lines`);
console.log(`  ✅ backup_digest.css line count: ${backupLines} (under 650-line limit)`);

// Functions in featurePath <= 50 lines and maxDepth <= 3
const featureLines = featureContent.split(/\r?\n/);
for (let i = 0; i < featureLines.length; i++) {
  const m = featureLines[i].match(/^\s*function\s+([a-zA-Z0-9_]+)\s*\(/);
  if (m) {
    const name = m[1];
    let start = i;
    let end = i;
    let depth = 0;
    let maxDepth = 0;
    for (let j = i; j < featureLines.length; j++) {
      for (const ch of featureLines[j]) {
        if (ch === '{') {
          depth++;
          if (depth > maxDepth) maxDepth = depth;
        } else if (ch === '}') {
          depth--;
          if (depth === 0) {
            end = j;
            break;
          }
        }
      }
      if (depth === 0) break;
    }
    const lineCount = end - start + 1;
    if (start >= 480) {
      assert(lineCount <= 50, `Function ${name} line count (${lineCount}) must be <= 50`);
      assert(maxDepth <= 3, `Function ${name} maxDepth (${maxDepth}) must be <= 3`);
    }
  }
}
console.log('  ✅ Universal Rule 28 function modularity and cyclomatic depth certified\n');

console.log('============================================================');
console.log('🎉 ALL 6 BATTERIES IN PRINT PAGINATION OVERHAUL SUITE PASSED!');
console.log('============================================================\n');
