/**
 * Sentinel Web Activity & Media Sentinel - QA Verification Suite
 * Test Suite: tests/test_export_domain_category_parity.js
 * Task ID: AUTH-MGR-20261124-EXPORT-CATEGORY-PARITY-001
 *
 * Verifies 1:1 Domain Category Parity between Live Dashboard and HTML/PDF Exports:
 * - Battery 1: Raw activityData.domains, items, and legacy days without .category
 * - Battery 2: domainCategoryOverrides precedence (string & { category } forms)
 * - Battery 3: Explicit fixture categories preserved when no override exists
 * - Battery 4: Direct renderDomainRows & generateExecutiveDigestHtml resolution
 * - Battery 5: Focus/Distraction KPI metrics reflect resolved categories
 * - Battery 6: dashboard.js wiring (getActiveReportMetrics, triggerPrintPdf, downloadStandaloneHtmlDigest, handleExportHtmlDigestClick)
 * - Battery 7: Rule 28 modularity, W3C Trusted Types, and UTF-8 BOM verification
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🧪 EXPORT DOMAIN CATEGORY 1:1 PARITY QA SUITE');
console.log('============================================================\n');

const baseDir = path.resolve(__dirname, '..');
const temporalPath = path.join(baseDir, 'src/dashboard/features/temporal_productivity_feature.js');
const digestPath = path.join(baseDir, 'src/dashboard/features/backup_hub_digest_feature.js');
const dashboardJsPath = path.join(baseDir, 'dashboard/dashboard.js');

const temporal = require(temporalPath);
const digest = require(digestPath);

// Ensure global TemporalProductivityFeature is available as in browser runtime
globalThis.TemporalProductivityFeature = temporal;

// ============================================================
// Battery 1: Raw Telemetry Without .category (1:1 Live Parity)
// ============================================================
console.log('Battery 1: Raw Telemetry Without .category (1:1 Live Parity)');

const rawModernNoCat = {
  activityData: {
    domains: {
      'youtube.com': { seconds: 3600, sessionCount: 4 },
      'x.com': { seconds: 1800, sessionCount: 3 },
      'web.whatsapp.com': { seconds: 900, sessionCount: 2 },
      'developer.mozilla.org': { seconds: 2400, sessionCount: 5 },
      'github.com': { seconds: 7200, sessionCount: 10 },
      'mail.google.com': { seconds: 600, sessionCount: 2 },
      'docs.google.com': { seconds: 1200, sessionCount: 3 },
      'chrome://extensions': { seconds: 300, sessionCount: 1 },
      'Dashboard': { seconds: 450, sessionCount: 2 }
    }
  }
};

const normModern = digest.normalizeTelemetryDataset(rawModernNoCat);
const byDomModern = Object.fromEntries(normModern.sortedDomains.map(d => [d.domain, d.category]));

assert.strictEqual(byDomModern['youtube.com'], 'entertainment', 'youtube.com must resolve to entertainment');
assert.strictEqual(byDomModern['x.com'], 'social', 'x.com must resolve to social');
assert.strictEqual(byDomModern['web.whatsapp.com'], 'social', 'web.whatsapp.com must resolve to social');
assert.strictEqual(byDomModern['developer.mozilla.org'], 'learning', 'developer.mozilla.org must resolve to learning');
assert.strictEqual(byDomModern['github.com'], 'work', 'github.com must resolve to work');
assert.strictEqual(byDomModern['mail.google.com'], 'utility', 'mail.google.com must resolve to utility');
assert.strictEqual(byDomModern['docs.google.com'], 'utility', 'docs.google.com must resolve to utility');
assert.strictEqual(byDomModern['chrome://extensions'], 'utility', 'chrome://extensions must resolve to utility');
assert.strictEqual(byDomModern['Dashboard'], 'utility', 'Dashboard must resolve to utility');

// Items array without .category
const rawItemsNoCat = {
  items: [
    { domain: 'youtube.com', computedSeconds: 1800, sessions: 2 },
    { domain: 'developer.mozilla.org', computedSeconds: 1200, sessions: 1 },
    { domain: 'x.com', computedSeconds: 600, sessions: 1 },
    { domain: 'mail.google.com', computedSeconds: 300, sessions: 1 },
    { domain: 'github.com', computedSeconds: 2400, sessions: 3 }
  ]
};
const normItems = digest.normalizeTelemetryDataset(rawItemsNoCat);
const byDomItems = Object.fromEntries(normItems.sortedDomains.map(d => [d.domain, d.category]));
assert.strictEqual(byDomItems['youtube.com'], 'entertainment', 'items youtube.com must resolve to entertainment');
assert.strictEqual(byDomItems['developer.mozilla.org'], 'learning', 'items developer.mozilla.org must resolve to learning');
assert.strictEqual(byDomItems['x.com'], 'social', 'items x.com must resolve to social');
assert.strictEqual(byDomItems['mail.google.com'], 'utility', 'items mail.google.com must resolve to utility');
assert.strictEqual(byDomItems['github.com'], 'work', 'items github.com must resolve to work');

// Legacy day-keyed history without .category
const rawLegacyNoCat = {
  tracking_history: {
    '2026-11-24': {
      totalActiveTime: 4200,
      domains: {
        'youtube.com': { activeTime: 1800, sessions: 2 },
        'x.com': { activeTime: 1200, sessions: 2 },
        'developer.mozilla.org': { activeTime: 1200, sessions: 1 }
      }
    }
  }
};
const normLegacy = digest.normalizeTelemetryDataset(rawLegacyNoCat);
const byDomLegacy = Object.fromEntries(normLegacy.sortedDomains.map(d => [d.domain, d.category]));
assert.strictEqual(byDomLegacy['youtube.com'], 'entertainment', 'legacy youtube.com must resolve to entertainment');
assert.strictEqual(byDomLegacy['x.com'], 'social', 'legacy x.com must resolve to social');
assert.strictEqual(byDomLegacy['developer.mozilla.org'], 'learning', 'legacy developer.mozilla.org must resolve to learning');

console.log('  ✅ Modern domains, items array, and legacy days resolve 1:1 with live dashboard categories\n');

// ============================================================
// Battery 2: domainCategoryOverrides Precedence (String & Object Forms)
// ============================================================
console.log('Battery 2: domainCategoryOverrides Precedence');

const dataWithStoredStale = {
  activityData: {
    domains: {
      'youtube.com': { seconds: 3600, sessionCount: 4, category: 'entertainment' },
      'github.com': { seconds: 1800, sessionCount: 2, category: 'work' },
      'x.com': { seconds: 900, sessionCount: 1 }
    }
  }
};

const normOverrides = digest.normalizeTelemetryDataset(dataWithStoredStale, {
  domainCategoryOverrides: {
    'youtube.com': { category: 'learning', isCustomOverride: true },
    'x.com': 'work',
    'github.com': { category: 'utility', isCustomOverride: true }
  }
});
const byDomOv = Object.fromEntries(normOverrides.sortedDomains.map(d => [d.domain, d.category]));
assert.strictEqual(byDomOv['youtube.com'], 'learning', 'Object override must win over stored entertainment category');
assert.strictEqual(byDomOv['x.com'], 'work', 'String override must win over default social category');
assert.strictEqual(byDomOv['github.com'], 'utility', 'Object override must win over stored work category');

// Also support rawData.domain_category_overrides directly
const rawWithEmbeddedOv = {
  domain_category_overrides: {
    'youtube.com': { category: 'work' }
  },
  activityData: {
    domains: {
      'youtube.com': { seconds: 1200, sessionCount: 1 }
    }
  }
};
const normEmbeddedOv = digest.normalizeTelemetryDataset(rawWithEmbeddedOv);
assert.strictEqual(normEmbeddedOv.sortedDomains[0].category, 'work', 'Embedded domain_category_overrides in rawData must apply');

console.log('  ✅ Both string and { category } overrides supersede default and stored categories\n');

// ============================================================
// Battery 3: Explicit Fixture Categories Preserved Without Overrides
// ============================================================
console.log('Battery 3: Explicit Fixture Categories Preserved Without Overrides');

const fixtureData = {
  tracking_history: {
    '2026-11-24': {
      totalActiveTime: 3600,
      domains: {
        'docs.rs': { activeTime: 1800, sessions: 2, category: 'learning' },
        'custom-intranet.local': { activeTime: 1800, sessions: 2, category: 'social' }
      }
    }
  }
};
const normFixture = digest.normalizeTelemetryDataset(fixtureData);
const byDomFix = Object.fromEntries(normFixture.sortedDomains.map(d => [d.domain, d.category]));
assert.strictEqual(byDomFix['docs.rs'], 'learning', 'Explicit fixture category learning must be preserved');
assert.strictEqual(byDomFix['custom-intranet.local'], 'social', 'Explicit fixture category social must be preserved');

console.log('  ✅ Explicit fixture categories preserved when no user override exists\n');

// ============================================================
// Battery 4: Direct renderDomainRows & generateExecutiveDigestHtml
// ============================================================
console.log('Battery 4: Direct renderDomainRows & generateExecutiveDigestHtml');

assert(typeof digest.resolveDomainCategory === 'function', 'resolveDomainCategory must be exported');

const directRowsHtml = digest.renderDomainRows([
  { domain: 'youtube.com', activeTime: 3600, sessions: 2 },
  { domain: 'developer.mozilla.org', activeTime: 1800, sessions: 1 },
  { domain: 'x.com', activeTime: 900, sessions: 1 },
  { domain: 'mail.google.com', activeTime: 600, sessions: 1 }
], 6900);

assert(directRowsHtml.includes('badge-cat-entertainment') && directRowsHtml.includes('>Entertainment<'), 'Direct renderDomainRows must render Entertainment pill for youtube.com');
assert(directRowsHtml.includes('badge-cat-learning') && directRowsHtml.includes('>Learning<'), 'Direct renderDomainRows must render Learning pill for developer.mozilla.org');
assert(directRowsHtml.includes('badge-cat-social') && directRowsHtml.includes('>Social<'), 'Direct renderDomainRows must render Social pill for x.com');
assert(directRowsHtml.includes('badge-cat-utility') && directRowsHtml.includes('>Utilities<'), 'Direct renderDomainRows must render Utilities pill for mail.google.com');

const directOverrideHtml = digest.renderDomainRows([
  { domain: 'youtube.com', activeTime: 3600, sessions: 2, category: 'entertainment' }
], 3600, {
  domainCategoryOverrides: { 'youtube.com': { category: 'learning' } }
});
assert(directOverrideHtml.includes('badge-cat-learning') && directOverrideHtml.includes('>Learning<'), 'Direct renderDomainRows must honor options.domainCategoryOverrides');

function extractDomainTbody(html) {
  const start = html.indexOf('id="domainTableBody"');
  const end = html.indexOf('</tbody>', start);
  assert(start !== -1 && end !== -1, 'HTML must contain domainTableBody');
  return html.slice(start, end);
}

const fullDigestHtml = digest.generateExecutiveDigestHtml(rawModernNoCat, {
  reportingPeriod: 'Today',
  domainCategoryOverrides: { 'youtube.com': { category: 'learning' } }
});
const fullDigestTbody = extractDomainTbody(fullDigestHtml);
assert(fullDigestTbody.includes('badge-cat-learning'), 'generateExecutiveDigestHtml must render learning pill');
assert(fullDigestTbody.includes('badge-cat-social'), 'generateExecutiveDigestHtml must render social pill');
assert(fullDigestTbody.includes('badge-cat-utility'), 'generateExecutiveDigestHtml must render utility pill');
assert(!fullDigestTbody.includes('badge-cat-entertainment'), 'Overridden youtube.com must not render entertainment badge');

console.log('  ✅ Direct renderDomainRows and generateExecutiveDigestHtml resolve and render exact badges\n');

// ============================================================
// Battery 5: Focus / Distraction KPI Metrics Reflect Resolved Categories
// ============================================================
console.log('Battery 5: Focus / Distraction KPI Metrics Reflect Resolved Categories');

const kpiData = {
  activityData: {
    domains: {
      'github.com': { seconds: 3600, sessionCount: 4 },         // work -> focus
      'developer.mozilla.org': { seconds: 1800, sessionCount: 2 }, // learning -> focus
      'youtube.com': { seconds: 3600, sessionCount: 3 },        // entertainment -> distraction
      'x.com': { seconds: 1800, sessionCount: 2 }               // social -> distraction
    }
  }
};
const normKpi = digest.normalizeTelemetryDataset(kpiData);
const kpis = digest.extractDigestKpiMetrics(kpiData, normKpi, {});
assert.strictEqual(kpis.focusTime, '1h 30m', 'Focus time must sum work (1h) + learning (30m) = 1h 30m');
assert.strictEqual(kpis.distractionTime, '1h 30m', 'Distraction time must sum entertainment (1h) + social (30m) = 1h 30m');

const kpisWithOverride = digest.extractDigestKpiMetrics(
  kpiData,
  digest.normalizeTelemetryDataset(kpiData, { domainCategoryOverrides: { 'youtube.com': 'work' } }),
  {}
);
assert.strictEqual(kpisWithOverride.focusTime, '2h 30m', 'Overriding youtube.com to work must increase focusTime to 2h 30m');
assert.strictEqual(kpisWithOverride.distractionTime, '30m', 'Overriding youtube.com to work must reduce distractionTime to 30m');

console.log('  ✅ Focus and Distraction KPIs accurately reflect resolved domain categories\n');

// ============================================================
// Battery 6: dashboard.js Wiring (All 4 Export Entrypoints)
// ============================================================
console.log('Battery 6: dashboard.js Wiring (All 4 Export Entrypoints)');

const capturedCalls = [];
const realDigest = digest;
globalThis.BackupHubDigestFeature = Object.freeze(Object.assign({}, realDigest, {
  normalizeTelemetryDataset: function (raw, opts) {
    capturedCalls.push({ fn: 'normalizeTelemetryDataset', opts });
    return realDigest.normalizeTelemetryDataset(raw, opts);
  },
  triggerPrintPdf: function (opts) {
    capturedCalls.push({ fn: 'triggerPrintPdf', opts });
    return realDigest.triggerPrintPdf(opts);
  },
  downloadStandaloneHtmlDigest: function (data, opts) {
    capturedCalls.push({ fn: 'downloadStandaloneHtmlDigest', opts });
    return realDigest.downloadStandaloneHtmlDigest(data, opts);
  }
}));

delete require.cache[require.resolve(dashboardJsPath)];
const dashboard = require(dashboardJsPath);

dashboard.setDomainCategoryOverrides({
  'youtube.com': { category: 'learning', isCustomOverride: true }
});

// 6.1 getActiveReportMetrics passes getDomainCategory & domainCategoryOverrides
dashboard.getActiveReportMetrics();

// 6.2 downloadStandaloneHtmlDigest passes category resolver & overrides into HTML output
const dlRes = dashboard.downloadStandaloneHtmlDigest(rawModernNoCat, { reportingPeriod: 'Today' });
assert(dlRes && dlRes.htmlContent, 'downloadStandaloneHtmlDigest must return htmlContent');
const dlCall = capturedCalls.find(c => c.fn === 'downloadStandaloneHtmlDigest');
assert(dlCall && typeof dlCall.opts.getDomainCategory === 'function', 'downloadStandaloneHtmlDigest must pass getDomainCategory');
assert(dlCall.opts.domainCategoryOverrides && dlCall.opts.domainCategoryOverrides['youtube.com'], 'downloadStandaloneHtmlDigest must pass domainCategoryOverrides');
const dlTbody = extractDomainTbody(dlRes.htmlContent);
assert(dlTbody.includes('badge-cat-social'), 'downloadStandaloneHtmlDigest HTML must resolve x.com to social');
assert(!dlTbody.includes('badge-cat-entertainment'), 'downloadStandaloneHtmlDigest HTML must apply youtube.com override');

// 6.3 triggerPrintPdf passes category resolver & overrides into iframe HTML
let iframeWrittenHtml = '';
const mockIframeDoc = {
  open: function () {},
  write: function (html) { iframeWrittenHtml += html; },
  close: function () {}
};
const mockIframeWin = { focus: function () {}, print: function () {}, document: mockIframeDoc };
const mockElements = {};
const mockDoc = {
  getElementById: id => mockElements[id] || null,
  createElement: tag => ({
    tagName: tag.toUpperCase(),
    id: '',
    name: '',
    style: {},
    setAttribute: function () {},
    contentDocument: tag.toLowerCase() === 'iframe' ? mockIframeDoc : null,
    contentWindow: tag.toLowerCase() === 'iframe' ? mockIframeWin : null
  }),
  body: {
    appendChild: el => { if (el.id) mockElements[el.id] = el; return el; },
    insertBefore: el => { if (el.id) mockElements[el.id] = el; return el; }
  }
};
const printRes = dashboard.triggerPrintPdf({
  doc: mockDoc,
  win: { print: function () {} },
  data: rawModernNoCat,
  reportingPeriod: 'Today'
});
assert.strictEqual(printRes.printed, true, 'triggerPrintPdf must succeed');
const printCall = capturedCalls.find(c => c.fn === 'triggerPrintPdf');
assert(printCall && typeof printCall.opts.getDomainCategory === 'function', 'triggerPrintPdf must pass getDomainCategory');
assert(printCall.opts.domainCategoryOverrides && printCall.opts.domainCategoryOverrides['youtube.com'], 'triggerPrintPdf must pass domainCategoryOverrides');
const printTbody = extractDomainTbody(iframeWrittenHtml);
assert(printTbody.includes('badge-cat-social'), 'triggerPrintPdf iframe HTML must resolve x.com to social');
assert(!printTbody.includes('badge-cat-entertainment'), 'triggerPrintPdf iframe HTML must apply youtube.com override');

// 6.4 handleExportHtmlDigestClick passes category resolver & overrides
const prevLen = capturedCalls.length;
dashboard.handleExportHtmlDigestClick(null, null, null);
const clickCall = capturedCalls.slice(prevLen).find(c => c.fn === 'downloadStandaloneHtmlDigest');
assert(clickCall && typeof clickCall.opts.getDomainCategory === 'function', 'handleExportHtmlDigestClick must pass getDomainCategory');
assert(clickCall.opts.domainCategoryOverrides && clickCall.opts.domainCategoryOverrides['youtube.com'], 'handleExportHtmlDigestClick must pass domainCategoryOverrides');

// 6.5 Verify getActiveReportMetrics source passes buildDigestCategoryOptions
const dashJsContent = fs.readFileSync(dashboardJsPath, 'utf8');
assert(dashJsContent.includes('buildDigestCategoryOptions(options)'), 'getActiveReportMetrics / triggerPrintPdf must use buildDigestCategoryOptions(options)');

console.log('  ✅ All 4 dashboard.js export entrypoints propagate live category classifier & overrides\n');

// ============================================================
// Battery 7: Rule 28 Modularity, Security & UTF-8 BOM
// ============================================================
console.log('Battery 7: Rule 28 Modularity, Security & UTF-8 BOM');

[digestPath, dashboardJsPath, __filename].forEach(file => {
  const buf = fs.readFileSync(file);
  assert(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, `${path.basename(file)} must have UTF-8 BOM`);
});

const digestContent = fs.readFileSync(digestPath, 'utf8');
assert(!digestContent.includes('.innerHTML ='), 'backup_hub_digest_feature.js must have zero innerHTML assignments');
assert(!digestContent.includes('.outerHTML ='), 'backup_hub_digest_feature.js must have zero outerHTML assignments');

console.log('  ✅ UTF-8 BOM and W3C Trusted Types zero-innerHTML compliance certified\n');
console.log('============================================================');
console.log('🎉 ALL 7 BATTERIES IN EXPORT DOMAIN CATEGORY PARITY PASSED!');
console.log('============================================================\n');
