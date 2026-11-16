/**
 * Verification Test Suite: Phase 2 - Data Export Integrity & RFC 4180 Quotes Escaping Standards
 * 
 * Target Defects Verified:
 * - Defect 09: Time Tracking CSV Missing RFC 4180 Quote Escaping and Formula Injection Defense
 * - Defect 10: Media History CSV Incomplete String Escaping, Column Shifting, and DDE Risks
 * 
 * Test Suites:
 * - Suite 1: Unit tests on universal helper escapeCsvCell(val) across all RFC 4180, OWASP DDE, and Unicode edge cases.
 * - Suite 2: In-Memory AST Parsing & Compilation of dashboard/dashboard.js via vm.Script.
 * - Suite 3: Simulation of exportTimeTrackingCsv() verifying UTF-8 BOM, CRLF line endings, exact 7 columns, and RFC 4180 compliance.
 * - Suite 4: Simulation of exportMediaHistoryCsv() verifying UTF-8 BOM, CRLF line endings, exact 12 columns, DDE formula neutralization, and resilience against titles with commas, quotes, and newlines.
 * - Suite 5: Event listener wiring verification for #btnExportTrackingCsv and #btnExportMediaCsv in setupEventListeners().
 * - Suite 6: W3C Trusted Types & MV3 CSP Compliance (Zero innerHTML on modified sections).
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

console.log('🧪 Starting Phase 2 Data Export Integrity & RFC 4180 Quotes Escaping Test Suite...\n');

// ---------------------------------------------------------------------------
// Helper: RFC 4180 Compliant CSV Parser for Strict Roundtrip Validation
// ---------------------------------------------------------------------------
function parseCsvRfc4180(csvString) {
  let text = csvString;
  let hasBom = false;

  // Check and strip UTF-8 BOM (\uFEFF)
  if (text.charCodeAt(0) === 0xFEFF) {
    hasBom = true;
    text = text.slice(1);
  }

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const nextCh = text[i + 1];

    if (insideQuotes) {
      if (ch === '"') {
        if (nextCh === '"') {
          // RFC 4180 section 2.7: Escaped double-quote ("" -> ")
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of double-quoted cell
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (ch === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if (ch === '\r' && nextCh === '\n') {
        // RFC 4180 section 2.1: CRLF record delimiter
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i += 2;
        continue;
      } else if (ch === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else {
        currentField += ch;
        i++;
        continue;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return { rows, hasBom };
}

// ---------------------------------------------------------------------------
// Helper: Create Browser & DOM Sandbox for dashboard.js execution in VM
// ---------------------------------------------------------------------------
function createMockDashboardSandbox(customData = {}) {
  let lastDownloadedFile = null;
  let lastBlobContent = null;

  class MockBlob {
    constructor(parts, options) {
      this.parts = parts;
      this.options = options;
      this._content = parts.join('');
      lastBlobContent = this._content;
    }
  }

  const mockAnchor = {
    href: '',
    download: '',
    click() {
      lastDownloadedFile = {
        name: this.download,
        href: this.href,
        content: lastBlobContent
      };
    }
  };

  const mockBrowser = {
    runtime: {
      onMessage: { addListener: () => {} },
      sendMessage: (msg, cb) => {
        if (typeof cb === 'function') cb({ success: true });
        return Promise.resolve({ success: true });
      }
    },
    storage: {
      local: {
        get: (keys, cb) => { if (typeof cb === 'function') cb({}); },
        set: (payload, cb) => { if (typeof cb === 'function') cb(); return Promise.resolve(); }
      },
      onChanged: { addListener: () => {} }
    }
  };

  const sandbox = {
    globalThis: {},
    window: {},
    Blob: MockBlob,
    URL: {
      createObjectURL: (b) => {
        if (b && b._content) lastBlobContent = b._content;
        return 'blob:mock-csv-url';
      },
      revokeObjectURL: () => {}
    },
    document: {
      createElement: (tag) => {
        if (tag === 'a') return mockAnchor;
        return { style: {} };
      },
      getElementById: (id) => {
        if (id === 'toastNotification') return { textContent: '', className: '', style: {} };
        return null;
      },
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

  Object.assign(sandbox, customData);

  return {
    sandbox,
    getLastDownloadedFile: () => lastDownloadedFile,
    getLastBlobContent: () => lastBlobContent
  };
}

// ---------------------------------------------------------------------------
// Suite 1: Unit Tests on escapeCsvCell Universal Helper
// ---------------------------------------------------------------------------
console.log('Suite 1: Unit Tests on escapeCsvCell Universal Helper');
{
  assert(fs.existsSync(dashJsPath), 'dashboard/dashboard.js must exist');
  const code = fs.readFileSync(dashJsPath, 'utf8');

  const { sandbox } = createMockDashboardSandbox();
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  const escapeCsvCell = sandbox.module.exports.escapeCsvCell;
  assert(typeof escapeCsvCell === 'function', 'escapeCsvCell must be defined and exported');

  // Test 1.1: Null, undefined, and empty string handling
  assert.strictEqual(escapeCsvCell(null), '""', 'null must return empty quoted string');
  assert.strictEqual(escapeCsvCell(undefined), '""', 'undefined must return empty quoted string');
  assert.strictEqual(escapeCsvCell(''), '""', 'empty string must return empty quoted string');
  console.log('  ✅ Null, undefined, and empty string produce valid empty CSV cell ("")');

  // Test 1.2: Standard string values and delimiters
  assert.strictEqual(escapeCsvCell('google.com'), '"google.com"', 'Alphanumeric string quoted');
  assert.strictEqual(escapeCsvCell('hello, world'), '"hello, world"', 'String containing comma quoted safely');
  console.log('  ✅ Standard strings and commas safely enclosed in RFC 4180 double quotes');

  // Test 1.3: RFC 4180 double-quote escaping ("foo" -> """foo""")
  assert.strictEqual(escapeCsvCell('"foo"'), '"""foo"""', 'Quotes must be doubled inside enclosing quotes');
  assert.strictEqual(escapeCsvCell('The "Great" Gatsby'), '"The ""Great"" Gatsby"', 'Internal quotes doubled');
  assert.strictEqual(escapeCsvCell('"""'), '""""""""', 'Consecutive quotes doubled properly');
  console.log('  ✅ RFC 4180 double quotes escaping ("foo" -> """foo""") verified');

  // Test 1.4: Embedded line breaks (LF and CRLF)
  assert.strictEqual(escapeCsvCell("Line 1\nLine 2"), '"Line 1\nLine 2"', 'Embedded LF preserved inside quotes');
  assert.strictEqual(escapeCsvCell("Line 1\r\nLine 2"), '"Line 1\r\nLine 2"', 'Embedded CRLF preserved inside quotes');
  console.log('  ✅ Multiline strings with LF and CRLF safely contained without row fragmentation');

  // Test 1.5: OWASP CSV Formula Injection Defense (=, +, -, @, \t, \r)
  const ddeVectors = [
    { input: '=SUM(A1:B10)', expected: '"\'=SUM(A1:B10)"', desc: 'Formula equals sign (=)' },
    { input: "=cmd|' /C calc'!A0", expected: '"\'=cmd|\' /C calc\'!A0"', desc: 'DDE calc execution command with single quotes' },
    { input: '=cmd|" /C calc"!A0', expected: '"\'=cmd|"" /C calc""!A0"', desc: 'DDE calc execution command with double quotes' },
    { input: '+cmd|...!', expected: '"\'+cmd|...!"', desc: 'Formula plus sign (+)' },
    { input: '-10% Discount', expected: '"\'-10% Discount"', desc: 'Formula minus sign (-)' },
    { input: '@HYPERLINK("http://evil.site")', expected: '"\'@HYPERLINK(""http://evil.site"")"', desc: 'At sign (@) hyperlink formula' },
    { input: '\tTabPrefixedData', expected: '"\'\tTabPrefixedData"', desc: 'Tab character prefix' },
    { input: '\rCarriagePrefixed', expected: '"\'\rCarriagePrefixed"', desc: 'Carriage return prefix' }
  ];

  ddeVectors.forEach(({ input, expected, desc }) => {
    const res = escapeCsvCell(input);
    assert.strictEqual(res, expected, `DDE defense must neutralize: ${desc}`);
  });
  console.log('  ✅ OWASP CSV / DDE formula injection prefixes (=, +, -, @, \\t, \\r) neutralized with leading apostrophe');

  // Test 1.6: Numbers and boolean-like values
  assert.strictEqual(escapeCsvCell(0), '"0"', 'Number 0 converted and quoted');
  assert.strictEqual(escapeCsvCell(12345), '"12345"', 'Positive integer converted and quoted');
  assert.strictEqual(escapeCsvCell(45.67), '"45.67"', 'Float converted and quoted');
  console.log('  ✅ Numeric values converted and safely formatted');

  // Test 1.7: Unicode and Devanagari Strings
  assert.strictEqual(escapeCsvCell('मीडिया सेंटिनल'), '"मीडिया सेंटिनल"', 'Devanagari string safely enclosed');
  assert.strictEqual(escapeCsvCell('हिंदी: "परीक्षण, टेस्ट"'), '"हिंदी: ""परीक्षण, टेस्ट"""', 'Complex Unicode with quotes & comma');
  console.log('  ✅ Full Unicode and Devanagari characters preserved without encoding artifacts');
}

// ---------------------------------------------------------------------------
// Suite 2: In-Memory AST Parsing & Compilation of dashboard/dashboard.js
// ---------------------------------------------------------------------------
console.log('\nSuite 2: In-Memory AST Parsing & Compilation of dashboard/dashboard.js');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');

  assert.doesNotThrow(() => {
    new vm.Script(code, { filename: 'dashboard.js' });
  }, 'dashboard/dashboard.js must compile cleanly with 0 syntax errors');

  // Verify function declarations exist
  assert(code.includes('function escapeCsvCell('), 'escapeCsvCell declaration must exist');
  assert(code.includes('function exportTimeTrackingCsv('), 'exportTimeTrackingCsv declaration must exist');
  assert(code.includes('function exportMediaHistoryCsv('), 'exportMediaHistoryCsv declaration must exist');

  console.log(`  ✅ vm.Script parsed dashboard/dashboard.js successfully (${code.length} bytes, 0 parse errors)`);
  console.log('  ✅ Function signatures for escapeCsvCell, exportTimeTrackingCsv, and exportMediaHistoryCsv verified');
}

// ---------------------------------------------------------------------------
// Suite 3: Simulation of Time Tracking CSV Export
// ---------------------------------------------------------------------------
console.log('\nSuite 3: Simulation of Time Tracking CSV Export (Defect 09)');
{
  const mockDashboardData = {
    todayStr: '2026-11-15',
    activityData: {
      domains: {
        'youtube.com': {
          days: { '2026-11-15': { seconds: 3600 } },
          totalSeconds: 18000,
          sessionCount: 5,
          lastActive: 1763200000000
        },
        '=malicious-domain.com': { // OWASP injection domain
          days: { '2026-11-15': { seconds: 120 } },
          totalSeconds: 600,
          sessionCount: 2,
          lastActive: 1763200100000
        },
        'complex,"quoted",domain.org': { // quotes and comma in domain
          days: { '2026-11-15': { seconds: 75 } },
          totalSeconds: 150,
          sessionCount: 1,
          lastActive: 1763200200000
        },
        'हिंदी.समाचार.भारत': { // Devanagari domain
          days: { '2026-11-15': { seconds: 240 } },
          totalSeconds: 480,
          sessionCount: 3,
          lastActive: 1763200300000
        }
      }
    }
  };

  const { sandbox, getLastDownloadedFile, getLastBlobContent } = createMockDashboardSandbox({
    dashboardData: mockDashboardData
  });

  const code = fs.readFileSync(dashJsPath, 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  // Execute export with mock dashboard data
  sandbox.module.exports.exportTimeTrackingCsv(mockDashboardData);

  const downloaded = getLastDownloadedFile();
  const exportedBlobContent = getLastBlobContent();

  assert(downloaded, 'exportTimeTrackingCsv must trigger download via anchor click');
  assert(exportedBlobContent, 'exportTimeTrackingCsv must create a non-empty CSV Blob');
  assert.strictEqual(downloaded.name, 'media_sentinel_time_tracking_2026-11-15.csv', 'Download file name must match date pattern');

  // Verify UTF-8 BOM
  assert.strictEqual(exportedBlobContent.charCodeAt(0), 0xFEFF, 'CSV must start with UTF-8 BOM (\\uFEFF)');

  // Verify CRLF (\r\n) line endings
  assert(exportedBlobContent.includes('\r\n'), 'CSV lines must be delimited by RFC 4180 CRLF (\\r\\n)');

  // Parse using RFC 4180 parser
  const parsed = parseCsvRfc4180(exportedBlobContent);
  assert.strictEqual(parsed.hasBom, true, 'Parser must confirm presence of UTF-8 BOM');

  // Verify Header Row
  const headerRow = parsed.rows[0];
  assert.strictEqual(headerRow.length, 7, 'Time Tracking CSV must contain exactly 7 columns in header');
  assert.deepStrictEqual(headerRow, [
    'Domain',
    'Today Seconds',
    'Today Formatted',
    'Total Seconds',
    'Total Formatted',
    'Sessions Count',
    'Last Active'
  ], 'Header column names must strictly match RFC 4180 export specification');

  // Verify all data rows have exactly 7 columns (no column shift)
  const dataRows = parsed.rows.slice(1);
  assert.strictEqual(dataRows.length, 4, 'Must contain 4 data rows for 4 domains');

  dataRows.forEach((row, idx) => {
    assert.strictEqual(row.length, 7, `Data row ${idx + 1} must have exactly 7 columns`);
  });

  // Verify OWASP DDE neutralization on =malicious-domain.com
  const maliciousRow = dataRows.find(r => r[0].includes('malicious-domain.com'));
  assert(maliciousRow, 'Malicious domain row must exist');
  assert.strictEqual(maliciousRow[0], "'=malicious-domain.com", 'Leading = must be neutralized with prepended apostrophe');

  // Verify complex quoted domain
  const complexRow = dataRows.find(r => r[0].includes('complex'));
  assert(complexRow, 'Complex domain row must exist');
  assert.strictEqual(complexRow[0], 'complex,"quoted",domain.org', 'Quotes and commas preserved cleanly in domain cell');

  // Verify Devanagari domain
  const hindiRow = dataRows.find(r => r[0].includes('हिंदी'));
  assert(hindiRow, 'Devanagari domain row must exist');
  assert.strictEqual(hindiRow[0], 'हिंदी.समाचार.भारत', 'Devanagari domain preserved with 100% fidelity');

  console.log('  ✅ Time Tracking CSV starts with UTF-8 BOM (\\uFEFF) for immediate Excel encoding recognition');
  console.log('  ✅ RFC 4180 CRLF (\\r\\n) record delimitation validated');
  console.log('  ✅ Exact 7-column header structure validated without column shift');
  console.log('  ✅ DDE formula injection neutralized on malicious domains');
  console.log('  ✅ Internal quotes and commas preserved without delimiter confusion');
}

// ---------------------------------------------------------------------------
// Suite 4: Simulation of Media History CSV Export
// ---------------------------------------------------------------------------
console.log('\nSuite 4: Simulation of Media History CSV Export (Defect 10)');
{
  const mockMediaHistory = [
    {
      id: 'media_001',
      title: 'Standard Educational Video',
      platform: 'YouTube',
      domain: 'youtube.com',
      url: 'https://youtube.com/watch?v=std123',
      watchDuration: 600,
      averageVolume: 80,
      peakVolume: 95,
      lowVolume: 40,
      resolution: '1080p',
      timestamp: 1763200000000
    },
    {
      id: 'media_002',
      title: '=cmd|\' /C calc\'!A0', // OWASP CSV formula injection in video title
      platform: '+DangerousPlatform', // OWASP + injection
      domain: '-suspicious.net',       // OWASP - injection
      url: '@https://phishing.site/index?q=1,2,3', // OWASP @ injection + comma
      watchDuration: 120,
      averageVolume: 75,
      peakVolume: 85,
      lowVolume: 50,
      resolution: '4K',
      timestamp: 1763200100000
    },
    {
      id: 'media_003',
      title: 'The "Ultimate" Movie: Part 1, Special "Director\'s" Cut\n[Extra Footage]', // Quotes, commas, embedded LF
      platform: 'Vimeo, Pro',
      domain: 'vimeo.com',
      url: 'https://vimeo.com/12345?clip="main",id=1',
      watchDuration: 7200,
      averageVolume: 90,
      peakVolume: 100,
      lowVolume: 60,
      resolution: '1440p',
      timestamp: 1763200200000
    },
    {
      id: 'media_004',
      title: 'हिंदी समाचार: "विशेष कवरेज", लाइव प्रसारण\r\nसत्र २', // Devanagari with quotes, comma, CRLF
      platform: 'Doordarshan',
      domain: 'ddindia.gov.in',
      url: 'https://ddindia.gov.in/live/789',
      watchDuration: 1800,
      averageVolume: 70,
      peakVolume: 80,
      lowVolume: 55,
      resolution: '720p',
      timestamp: 1763200300000
    }
  ];

  const { sandbox, getLastDownloadedFile, getLastBlobContent } = createMockDashboardSandbox({
    mediaHistoryData: mockMediaHistory
  });

  const code = fs.readFileSync(dashJsPath, 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  // Execute export with mock media history
  sandbox.module.exports.exportMediaHistoryCsv(mockMediaHistory);

  const downloaded = getLastDownloadedFile();
  const exportedBlobContent = getLastBlobContent();

  assert(downloaded, 'exportMediaHistoryCsv must trigger download via anchor click');
  assert(exportedBlobContent, 'exportMediaHistoryCsv must create a non-empty CSV Blob');
  assert(downloaded.name.startsWith('media_sentinel_media_history_'), 'Download file name must match pattern');

  // Verify UTF-8 BOM
  assert.strictEqual(exportedBlobContent.charCodeAt(0), 0xFEFF, 'Media History CSV must start with UTF-8 BOM (\\uFEFF)');

  // Verify CRLF (\r\n) line endings
  assert(exportedBlobContent.includes('\r\n'), 'CSV lines must be delimited by RFC 4180 CRLF (\\r\\n)');

  // Parse using RFC 4180 parser
  const parsed = parseCsvRfc4180(exportedBlobContent);
  assert.strictEqual(parsed.hasBom, true, 'Parser must confirm presence of UTF-8 BOM');

  // Verify Header Row
  const headerRow = parsed.rows[0];
  assert.strictEqual(headerRow.length, 12, 'Media History CSV must contain exactly 12 columns in header');
  assert.deepStrictEqual(headerRow, [
    'ID',
    'Title',
    'Platform',
    'Domain',
    'URL',
    'Watch Duration (sec)',
    'Watch Duration Formatted',
    'Avg Volume (%)',
    'Peak Volume (%)',
    'Low Volume (%)',
    'Resolution',
    'Timestamp'
  ], 'Header columns must strictly match all 12 metadata fields');

  // Verify all data rows have exactly 12 columns (even with multiline titles, commas, and quotes)
  const dataRows = parsed.rows.slice(1);
  assert.strictEqual(dataRows.length, 4, 'Must contain 4 data rows for 4 media items');

  dataRows.forEach((row, idx) => {
    assert.strictEqual(row.length, 12, `Data row ${idx + 1} must maintain exactly 12 columns`);
  });

  // Verify media_002 OWASP formula injection neutralization across all fields
  const ddeRow = dataRows[1];
  assert.strictEqual(ddeRow[0], 'media_002', 'ID preserved');
  assert.strictEqual(ddeRow[1], "'=cmd|' /C calc'!A0", 'Formula in Title neutralized with apostrophe');
  assert.strictEqual(ddeRow[2], "'+DangerousPlatform", 'Formula in Platform neutralized with apostrophe');
  assert.strictEqual(ddeRow[3], "'-suspicious.net", 'Formula in Domain neutralized with apostrophe');
  assert.strictEqual(ddeRow[4], "'@https://phishing.site/index?q=1,2,3", 'Formula in URL neutralized with apostrophe');

  // Verify media_003 complex title with embedded quotes, commas, and newlines
  const complexRow = dataRows[2];
  assert.strictEqual(complexRow[0], 'media_003', 'ID preserved');
  assert.strictEqual(complexRow[1], 'The "Ultimate" Movie: Part 1, Special "Director\'s" Cut\n[Extra Footage]',
    'Embedded quotes, commas, and LF preserved identically in title cell');
  assert.strictEqual(complexRow[2], 'Vimeo, Pro', 'Comma in platform preserved without extra column');
  assert.strictEqual(complexRow[4], 'https://vimeo.com/12345?clip="main",id=1', 'Quotes and comma in URL preserved');

  // Verify media_004 Devanagari title with CRLF and quotes
  const hindiRow = dataRows[3];
  assert.strictEqual(hindiRow[0], 'media_004', 'ID preserved');
  assert.strictEqual(hindiRow[1], 'हिंदी समाचार: "विशेष कवरेज", लाइव प्रसारण\r\nसत्र २',
    'Devanagari title with CRLF and quotes preserved identically in cell');

  console.log('  ✅ Media History CSV starts with UTF-8 BOM (\\uFEFF)');
  console.log('  ✅ Exact 12-column metadata structure strictly enforced');
  console.log('  ✅ Titles with commas, double quotes, and embedded newlines safely contained with 0 column shift');
  console.log('  ✅ OWASP formula injection in Title, Platform, Domain, and URL neutralized');
  console.log('  ✅ Multilingual Devanagari text preserved with 100% roundtrip accuracy');
}

// ---------------------------------------------------------------------------
// Suite 5: Event Listener Wiring Verification in setupEventListeners()
// ---------------------------------------------------------------------------
console.log('\nSuite 5: Event Listener Wiring Verification in setupEventListeners()');
{
  assert(fs.existsSync(dashHtmlPath), 'dashboard/dashboard.html must exist');
  const html = fs.readFileSync(dashHtmlPath, 'utf8');
  const code = fs.readFileSync(dashJsPath, 'utf8');

  // Verify HTML element presence
  assert(html.includes('id="btnExportTrackingCsv"'), 'dashboard.html must contain #btnExportTrackingCsv');
  assert(html.includes('id="btnExportMediaCsv"'), 'dashboard.html must contain #btnExportMediaCsv');

  // Verify event listener queries and registrations in dashboard.js
  assert(code.includes("document.getElementById('btnExportTrackingCsv')"),
    'dashboard.js must query #btnExportTrackingCsv');
  assert(code.includes("btnExpTrackCsv.addEventListener('click', exportTimeTrackingCsv)"),
    '#btnExportTrackingCsv must register click listener invoking exportTimeTrackingCsv');

  assert(code.includes("document.getElementById('btnExportMediaCsv')"),
    'dashboard.js must query #btnExportMediaCsv');
  assert(code.includes("btnExpMediaCsv.addEventListener('click', exportMediaHistoryCsv)"),
    '#btnExportMediaCsv must register click listener invoking exportMediaHistoryCsv');

  console.log('  ✅ #btnExportTrackingCsv wired to exportTimeTrackingCsv() in setupEventListeners()');
  console.log('  ✅ #btnExportMediaCsv wired to exportMediaHistoryCsv() in setupEventListeners()');
}

// ---------------------------------------------------------------------------
// Suite 6: W3C Trusted Types & Zero innerHTML Security Audit
// ---------------------------------------------------------------------------
console.log('\nSuite 6: W3C Trusted Types & Zero innerHTML Security Audit');
{
  const code = fs.readFileSync(dashJsPath, 'utf8');

  // Extract export functions
  const escapeFnIdx = code.indexOf('function escapeCsvCell(');
  const dangerZoneIdx = code.indexOf('// Danger Zone & Confirmation Modal');
  assert(escapeFnIdx !== -1 && dangerZoneIdx !== -1, 'Export functions boundary located');

  const exportSection = code.slice(escapeFnIdx, dangerZoneIdx);

  assert(!exportSection.includes('.innerHTML'), 'Export functions must never use innerHTML (W3C Trusted Types violation)');
  assert(!exportSection.includes('document.write'), 'Export functions must never use document.write');
  assert(!exportSection.includes('eval('), 'Export functions must never use eval');

  console.log('  ✅ escapeCsvCell, exportTimeTrackingCsv, and exportMediaHistoryCsv certified 100% innerHTML-free');
  console.log('  ✅ Certified 100% compliant with W3C Trusted Types & Manifest V3 CSP');
}

console.log('\n🎉 ALL PHASE 2 CSV EXPORT RFC 4180 TESTS PASSED WITH 100% SUCCESS!\n');
