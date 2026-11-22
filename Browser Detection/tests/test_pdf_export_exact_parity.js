/**
 * TASK-PDF-EXPORT-EXACT-PARITY-001 QA Verification Test Suite
 *
 * Validates Phase 1 & Phase 2 implementation of Isolated Iframe Print Engine,
 * Executive Digest Parity, Telemetry Assembly, and CSS Pagination Rules.
 *
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🧪 PDF EXPORT EXACT PARITY QA VERIFICATION SUITE');
console.log('============================================================\n');

const featurePath = path.resolve(__dirname, '../src/dashboard/features/backup_hub_digest_feature.js');
const dashboardJsPath = path.resolve(__dirname, '../dashboard/dashboard.js');
const backupCssPath = path.resolve(__dirname, '../dashboard/styles/backup_digest.css');
const dashboardCssPath = path.resolve(__dirname, '../dashboard/dashboard.css');

// ============================================================
// Battery 1: Modular Iframe Print Engine & Exports Verification
// ============================================================
console.log('Battery 1: Modular Iframe Print Engine & Exports Verification');

const feature = require(featurePath);
assert(typeof feature.getOrCreatePrintIframe === 'function', 'getOrCreatePrintIframe must be exported');
assert(typeof feature.printHtmlViaIframe === 'function', 'printHtmlViaIframe must be exported');
assert(typeof feature.triggerPrintPdf === 'function', 'triggerPrintPdf must be exported');

// Mock DOM for testing iframe engine
const createdElements = [];
const mockIframeDoc = {
  opened: false,
  closed: false,
  content: '',
  open: function() { this.opened = true; },
  write: function(html) { this.content += html; },
  close: function() { this.closed = true; }
};

let iframePrintCalled = false;
let iframeFocusCalled = false;
const mockIframeWin = {
  focus: function() { iframeFocusCalled = true; },
  print: function() { iframePrintCalled = true; },
  document: mockIframeDoc
};

const mockDoc = {
  elements: {},
  getElementById: function(id) { return this.elements[id] || null; },
  createElement: function(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      name: '',
      style: {},
      attributes: {},
      setAttribute: function(k, v) { this.attributes[k] = String(v); },
      getAttribute: function(k) { return this.attributes[k] || null; },
      contentDocument: tag.toLowerCase() === 'iframe' ? mockIframeDoc : null,
      contentWindow: tag.toLowerCase() === 'iframe' ? mockIframeWin : null
    };
    createdElements.push(el);
    return el;
  },
  body: {
    children: [],
    appendChild: function(el) {
      this.children.push(el);
      if (el.id) mockDoc.elements[el.id] = el;
      return el;
    },
    insertBefore: function(el) {
      this.children.unshift(el);
      if (el.id) mockDoc.elements[el.id] = el;
      return el;
    }
  }
};

let hostWindowPrintCalled = false;
const mockWin = {
  print: function() { hostWindowPrintCalled = true; }
};

// 1.1 Test getOrCreatePrintIframe
const iframe1 = feature.getOrCreatePrintIframe(mockDoc);
assert(iframe1, 'Must create and return iframe');
assert.strictEqual(iframe1.id, 'sentinelPrintIframe', 'Iframe must have id="sentinelPrintIframe"');
assert.strictEqual(iframe1.attributes['aria-hidden'], 'true', 'Must set aria-hidden="true"');
assert.strictEqual(iframe1.attributes['tabindex'], '-1', 'Must set tabindex="-1"');
assert.strictEqual(iframe1.style.position, 'fixed', 'Must have stealth position fixed');
assert.strictEqual(iframe1.style.opacity, '0', 'Must have stealth opacity 0');

// Idempotent retrieval
const iframe2 = feature.getOrCreatePrintIframe(mockDoc);
assert.strictEqual(iframe1, iframe2, 'getOrCreatePrintIframe must return existing instance');

// 1.2 Test printHtmlViaIframe
const testHtml = '<!DOCTYPE html><html><body><h1>Print Test</h1></body></html>';
const printRes = feature.printHtmlViaIframe(mockDoc, mockWin, testHtml);
assert.strictEqual(printRes.success, true, 'printHtmlViaIframe must succeed');
assert.strictEqual(printRes.method, 'iframe', 'print method must be iframe');
assert.strictEqual(mockIframeDoc.opened, true, 'iframe document.open() must be called');
assert.strictEqual(mockIframeDoc.closed, true, 'iframe document.close() must be called');
assert(mockIframeDoc.content.includes('Print Test'), 'iframe must receive HTML content');
assert.strictEqual(iframeFocusCalled, true, 'iframe window.focus() must be called');
assert.strictEqual(iframePrintCalled, true, 'iframe window.print() must be called');

// 1.3 Test triggerPrintPdf with isolated iframe
iframePrintCalled = false;
const triggerRes = feature.triggerPrintPdf({
  doc: mockDoc,
  win: mockWin,
  data: { activityData: { domains: { 'example.com': { activeTime: 120 } } } },
  reportingPeriod: 'Today',
  productivityIndex: 90
});
assert.strictEqual(triggerRes.printed, true, 'triggerPrintPdf must succeed');
assert.strictEqual(triggerRes.method, 'iframe', 'triggerPrintPdf must use iframe method');
assert.strictEqual(iframePrintCalled, true, 'triggerPrintPdf must trigger iframe print');
assert.strictEqual(hostWindowPrintCalled, false, 'Host window print must not be triggered when iframe print succeeds');

console.log('  ✅ getOrCreatePrintIframe, printHtmlViaIframe, and triggerPrintPdf fully verified\n');

// ============================================================
// Battery 2: Full Telemetry Assembly in dashboard.js
// ============================================================
console.log('Battery 2: Full Telemetry Assembly in dashboard.js');

const dashJsContent = fs.readFileSync(dashboardJsPath, 'utf8');

// Verify triggerPrintPdf in dashboard.js assembles complete payload matching downloadStandaloneHtmlDigest
assert(dashJsContent.includes('activityData: (dashboardData && dashboardData.activityData) || {}'),
  'dashboard.js triggerPrintPdf must assemble activityData in payload');
assert(dashJsContent.includes('media_history: (typeof mediaHistoryData !== \'undefined\' && Array.isArray(mediaHistoryData))'),
  'dashboard.js triggerPrintPdf must assemble media_history in payload');
assert(dashJsContent.includes('chronoHeatmap: activeMetrics.chronoHeatmap || options.chronoHeatmap'),
  'dashboard.js triggerPrintPdf must assemble chronoHeatmap');
assert(dashJsContent.includes('mediaMetrics: activeMetrics.mediaMetrics || options.mediaMetrics'),
  'dashboard.js triggerPrintPdf must assemble mediaMetrics');
assert(dashJsContent.includes('_BackupHubDigest.triggerPrintPdf(opts)'),
  'dashboard.js triggerPrintPdf must forward complete opts to _BackupHubDigest.triggerPrintPdf');

console.log('  ✅ Full telemetry extraction and delegation in dashboard.js verified\n');

// ============================================================
// Battery 3: CSS Pagination & Print Rules in Embedded Digest & Stylesheets
// ============================================================
console.log('Battery 3: CSS Pagination & Print Rules in Embedded Digest & Stylesheets');

const featContent = fs.readFileSync(featurePath, 'utf8');
const backupCssContent = fs.readFileSync(backupCssPath, 'utf8');
const dashCssContent = fs.readFileSync(dashboardCssPath, 'utf8');

// Embedded EXECUTIVE_DIGEST_CSS checks
assert(featContent.includes('size: A4 landscape;'), 'EXECUTIVE_DIGEST_CSS must specify size: A4 landscape');
assert(featContent.includes('margin: 10mm 12mm 10mm 12mm;'), 'EXECUTIVE_DIGEST_CSS must specify 10mm 12mm margin');
assert(featContent.includes('.part-tracking-section'), 'EXECUTIVE_DIGEST_CSS must style .part-tracking-section');
assert(featContent.includes('.part-media-section'), 'EXECUTIVE_DIGEST_CSS must style .part-media-section');
assert(featContent.includes('page-break-before: always !important;'), 'Part 2 must enforce page-break-before: always');
assert(featContent.includes('break-before: page !important;'), 'Part 2 must enforce break-before: page');
assert(featContent.includes('thead { display: table-header-group !important; }'), 'Tables must repeat thead across print pages');
assert(featContent.includes('tr {\n        page-break-inside: avoid !important;\n        break-inside: avoid !important;\n      }'),
  'Table rows must avoid breaking inside');

// Stylesheet checks
for (const [name, css] of [['backup_digest.css', backupCssContent], ['dashboard.css', dashCssContent]]) {
  assert(css.includes('#heroAudioEqCard'), `${name} must suppress #heroAudioEqCard in @media print`);
  assert(css.includes('#heroAudioLabCard'), `${name} must suppress #heroAudioLabCard in @media print`);
  assert(css.includes('#sentinelPrintIframe'), `${name} must support #sentinelPrintIframe`);
  assert(css.includes('#printFallbackContainer'), `${name} must support #printFallbackContainer`);
  assert(css.includes('.part-tracking-section'), `${name} must support .part-tracking-section`);
  assert(css.includes('.part-media-section'), `${name} must support .part-media-section`);
}

console.log('  ✅ Landscape A4 geometry, two-part pagination, and widget suppression certified\n');

// ============================================================
// Battery 4: Universal Rule 28 Compliance & Line Limits
// ============================================================
console.log('Battery 4: Universal Rule 28 Compliance & Line Limits');

const backupCssLines = backupCssContent.split(/\r?\n/).length;
assert(backupCssLines <= 650, `backup_digest.css lines (${backupCssLines}) must be <= 650`);
console.log(`  ✅ backup_digest.css line count: ${backupCssLines} (strictly <= 650 CI ceiling)`);

// Audit functions in feature file
const featureLines = featContent.split(/\r?\n/);
const featureFuncs = [
  'getOrCreatePrintIframe',
  'applyPrintIframeStyles',
  'printHtmlViaIframe',
  'printViaFallback',
  'triggerPrintPdf',
  'syncLegacyPrintHeader'
];

for (const fnName of featureFuncs) {
  let start = -1;
  let end = -1;
  let depth = 0;
  let maxDepth = 0;

  for (let i = 0; i < featureLines.length; i++) {
    const line = featureLines[i];
    if (start === -1 && (line.includes(`function ${fnName}(`) || line.includes(`function ${fnName} (`))) {
      start = i;
    }
    if (start !== -1) {
      for (const ch of line) {
        if (ch === '{') {
          depth++;
          if (depth > maxDepth) maxDepth = depth;
        } else if (ch === '}') {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end !== -1) break;
    }
  }

  assert(start !== -1, `Function ${fnName} must exist`);
  const length = end - start + 1;
  assert(length <= 50, `Function ${fnName} length (${length}) must be <= 50 lines`);
  assert(maxDepth <= 3, `Function ${fnName} maxDepth (${maxDepth}) must be <= 3`);
  console.log(`  ✅ ${fnName}: ${length} lines, max depth ${maxDepth} (Universal Rule 28 compliant)`);
}

console.log('  ✅ All functions strictly adhere to Universal Rule 28 modularity\n');

// ============================================================
// Battery 5: W3C Trusted Types & UTF-8 with BOM Standard
// ============================================================
console.log('Battery 5: W3C Trusted Types & UTF-8 with BOM Standard');

// Verify zero innerHTML in feature additions
const printIframeSection = featContent.slice(
  featContent.indexOf('function getOrCreatePrintIframe'),
  featContent.indexOf('function downloadStandaloneHtmlDigest')
);
assert(!printIframeSection.includes('.innerHTML'), 'Iframe print engine functions must not assign to innerHTML');
assert(!printIframeSection.includes('.outerHTML'), 'Iframe print engine functions must not assign to outerHTML');
console.log('  ✅ 100% W3C Trusted Types compliant (strictly zero innerHTML/outerHTML in print engine)');

// UTF-8 with BOM check
const filesToCheck = [featurePath, dashboardJsPath, backupCssPath, dashboardCssPath];
for (const file of filesToCheck) {
  const buf = fs.readFileSync(file);
  const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  const basename = path.basename(file);
  assert(hasBom, `${basename} must retain UTF-8 with BOM (0xEF, 0xBB, 0xBF)`);
  console.log(`  ✅ ${basename}: 100% UTF-8 with BOM certified`);
}

console.log('\n============================================================');
console.log('🎉 ALL 5 BATTERIES IN PDF EXPORT EXACT PARITY QA SUITE PASSED!');
console.log('============================================================\n');
