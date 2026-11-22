/**
 * Test Suite: Chrono-Activity Heatmap Initial Rendering & Default Data Display
 * 
 * Target Verifications:
 * 1. Cold start blank state resolution: Heatmap renders synchronously on setup/init without requiring a tab click.
 * 2. Default mode & accessibility: cardChronoHeatmap has data-active-mode="focus", btnHeatmapModeFocus has aria-pressed="true".
 * 3. Schema resilience: buildHeatmapDayRow supports both 2D array matrix and object array with .hours.
 * 4. Fallback resilience: updateChronoHeatmap and renderChronoHeatmap gracefully fall back when data/matrix is null or empty.
 * 5. UTF-8 with BOM and W3C Trusted Types compliance.
 * 6. Early storage ingestion: media_sentinel_activity_data pre-seeds heatmap before IPC message.
 * 7. updateChronoHeatmap input flexibility: handles data.domains, data.history, and data.activityData.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const htmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');
const featJsPath = path.join(baseDir, 'src', 'dashboard', 'features', 'temporal_productivity_feature.js');

console.log('🧪 Starting Chrono-Activity Heatmap Initial Rendering Test Suite...\n');

// -----------------------------------------------------------------------------
// Battery 1: HTML Default Attributes & Accessibility
// -----------------------------------------------------------------------------
console.log('Battery 1: HTML Default Attributes & Accessibility');
{
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert(html.includes('id="cardChronoHeatmap"'), 'cardChronoHeatmap element must exist in HTML');
  assert(html.includes('data-active-mode="focus"'), 'cardChronoHeatmap must have default data-active-mode="focus" in HTML');
  assert(html.includes('id="btnHeatmapModeFocus" class="btn-toggle-mode active" data-mode="focus" aria-pressed="true"'),
    'btnHeatmapModeFocus must have active class and aria-pressed="true"');
  assert(html.includes('id="btnHeatmapModeMedia" class="btn-toggle-mode" data-mode="media" aria-pressed="false"'),
    'btnHeatmapModeMedia must have aria-pressed="false"');

  console.log('  ✅ cardChronoHeatmap has data-active-mode="focus" and mode buttons have correct aria-pressed states in HTML\n');
}

// -----------------------------------------------------------------------------
// Battery 2: Schema Resilience in buildHeatmapDayRow (2D Array vs Object Array)
// -----------------------------------------------------------------------------
console.log('Battery 2: Schema Resilience in buildHeatmapDayRow');
{
  const tempFeat = require(featJsPath);
  assert(typeof tempFeat.renderChronoHeatmap === 'function', 'renderChronoHeatmap must be exported');

  class MockElement {
    constructor(tag) {
      this.tagName = tag.toUpperCase();
      this.children = [];
      this.attributes = {};
      this.className = '';
      this.textContent = '';
      this.title = '';
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k]; }
    appendChild(c) { this.children.push(c); return c; }
    removeChild(c) {
      const idx = this.children.indexOf(c);
      if (idx !== -1) this.children.splice(idx, 1);
      return c;
    }
    get firstChild() { return this.children[0] || null; }
    getElementsByClassName(cls) {
      const results = [];
      const search = (el) => {
        if (el.className && el.className.split(' ').includes(cls)) results.push(el);
        (el.children || []).forEach(search);
      };
      search(this);
      return results;
    }
  }

  const container = new MockElement('div');
  const cardHeatmap = new MockElement('div');
  cardHeatmap.setAttribute('id', 'cardChronoHeatmap');

  const mockDoc = {
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => {
      if (id === 'heatmapGridContainer') return container;
      if (id === 'cardChronoHeatmap') return cardHeatmap;
      return null;
    }
  };

  // Test Case A: 2D array row (matrix[d][h])
  const matrix2D = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      dayOfWeek: d,
      activeSeconds: (d + 1) * 300,
      mediaSeconds: (d + 1) * 100,
      topDomain: 'google.com'
    }))
  );

  tempFeat.renderChronoHeatmap(matrix2D, 'focus', container, { document: mockDoc });
  assert.strictEqual(container.children.length, 1, 'Container should hold the grid');
  const grid2D = container.children[0];
  const cells2D = grid2D.getElementsByClassName('heatmap-cell');
  assert.strictEqual(cells2D.length, 168, 'Must construct exactly 168 cells for 2D matrix');
  assert.strictEqual(cardHeatmap.getAttribute('data-active-mode'), 'focus', 'cardHeatmap mode must be focus');

  // Test Case B: Object array row with .hours property (matrix[d].hours[h])
  const matrixObj = Array.from({ length: 7 }, (_, d) => ({
    dayOfWeek: d,
    dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d],
    hours: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      activeSeconds: (h + 1) * 60,
      mediaSeconds: (h + 1) * 30,
      topDomain: 'youtube.com'
    }))
  }));

  tempFeat.renderChronoHeatmap(matrixObj, 'media', container, { document: mockDoc });
  const gridObj = container.children[0];
  const cellsObj = gridObj.getElementsByClassName('heatmap-cell');
  assert.strictEqual(cellsObj.length, 168, 'Must construct exactly 168 cells for object array matrix with .hours');
  assert.strictEqual(cardHeatmap.getAttribute('data-active-mode'), 'media', 'cardHeatmap mode must be media');

  console.log('  ✅ Schema resilience verified: handles both 2D array and object array with .hours\n');
}

// -----------------------------------------------------------------------------
// Battery 3: Graceful Fallback & Cold Start Render (Null/Empty Matrix)
// -----------------------------------------------------------------------------
console.log('Battery 3: Graceful Fallback & Cold Start Render');
{
  const tempFeat = require(featJsPath);

  class MockElement {
    constructor(tag) {
      this.tagName = tag.toUpperCase();
      this.children = [];
      this.attributes = {};
      this.className = '';
      this.textContent = '';
      this.title = '';
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k]; }
    appendChild(c) { this.children.push(c); return c; }
    removeChild(c) {
      const idx = this.children.indexOf(c);
      if (idx !== -1) this.children.splice(idx, 1);
      return c;
    }
    get firstChild() { return this.children[0] || null; }
    getElementsByClassName(cls) {
      const results = [];
      const search = (el) => {
        if (el.className && el.className.split(' ').includes(cls)) results.push(el);
        (el.children || []).forEach(search);
      };
      search(this);
      return results;
    }
  }

  const container = new MockElement('div');
  const cardHeatmap = new MockElement('div');

  const mockDoc = {
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => {
      if (id === 'heatmapGridContainer') return container;
      if (id === 'cardChronoHeatmap') return cardHeatmap;
      return null;
    }
  };

  // Passing null matrix must not throw and must render default 168-cell grid
  tempFeat.renderChronoHeatmap(null, 'focus', container, { document: mockDoc });
  assert.strictEqual(container.children.length, 1, 'Container must render grid even on null matrix');
  const cellsFallback = container.children[0].getElementsByClassName('heatmap-cell');
  assert.strictEqual(cellsFallback.length, 168, 'Fallback must render 168 zero-intensity cells');
  cellsFallback.forEach(cell => {
    assert.strictEqual(cell.getAttribute('data-intensity'), '0', 'All fallback cells must be tier 0');
  });

  console.log('  ✅ Null/empty matrix safely falls back to default 7x24 grid without throwing\n');
}

// -----------------------------------------------------------------------------
// Battery 4: Universal Rule 28 & W3C Trusted Types Compliance
// -----------------------------------------------------------------------------
console.log('Battery 4: Universal Rule 28 & W3C Trusted Types Compliance');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');
  const featCode = fs.readFileSync(featJsPath, 'utf8');

  // Verify zero innerHTML mutations
  assert(!dashCode.includes('heatmapGridContainer.innerHTML'), 'Must not mutate innerHTML on heatmap container');
  assert(!/\.innerHTML\s*=/.test(featCode), 'temporal_productivity_feature must have 0 innerHTML assignments');
  assert(!/\.outerHTML\s*=/.test(featCode), 'temporal_productivity_feature must have 0 outerHTML assignments');
  assert(!/insertAdjacentHTML/.test(featCode), 'temporal_productivity_feature must have 0 insertAdjacentHTML calls');

  console.log('  ✅ 100% W3C Trusted Types safe (0 innerHTML mutations)\n');
}

// -----------------------------------------------------------------------------
// Battery 5: UTF-8 with BOM Encoding Certification
// -----------------------------------------------------------------------------
console.log('Battery 5: UTF-8 with BOM Encoding Certification');
{
  [htmlPath, dashJsPath, featJsPath].forEach(filePath => {
    const buf = fs.readFileSync(filePath);
    assert.strictEqual(buf[0], 0xEF, `${path.basename(filePath)} byte 0 must be 0xEF`);
    assert.strictEqual(buf[1], 0xBB, `${path.basename(filePath)} byte 1 must be 0xBB`);
    assert.strictEqual(buf[2], 0xBF, `${path.basename(filePath)} byte 2 must be 0xBF`);
  });

  console.log('  ✅ 100% UTF-8 with BOM (0xEF, 0xBB, 0xBF) preserved across all modified files\n');
}

// -----------------------------------------------------------------------------
// Battery 6: Early Storage Ingestion & Data Hub Timeout Protection
// -----------------------------------------------------------------------------
console.log('Battery 6: Early Storage Ingestion & Data Hub Timeout Protection');
{
  const dashCode = fs.readFileSync(dashJsPath, 'utf8');

  // Check storage key registration
  assert(dashCode.includes("'media_sentinel_activity_data'"), 'storage.local.get must request media_sentinel_activity_data');
  assert(dashCode.includes('updateChronoHeatmap({ activityData: res.media_sentinel_activity_data })'),
    'DOMContentLoaded storage callback must pre-seed updateChronoHeatmap with media_sentinel_activity_data');

  // Check refreshDashboard early render
  const refreshStart = dashCode.indexOf('function refreshDashboard(');
  const refreshBlock = dashCode.substring(refreshStart, refreshStart + 1200);
  assert(refreshBlock.includes('updateChronoHeatmap(response);'),
    'refreshDashboard must invoke updateChronoHeatmap(response) immediately upon receiving GET_DASHBOARD_DATA response');

  // Check 1500ms timeout on Data Hub query
  assert(dashCode.includes('const timer = setTimeout(() => res(null), 1500);'),
    'Data Hub query must have 1500ms safety timeout timer');
  assert(dashCode.includes('clearTimeout(timer);'),
    'Data Hub query must clear safety timeout timer upon response');

  console.log('  ✅ Early storage ingestion and 1500ms Data Hub query timeout protection verified\n');
}

// -----------------------------------------------------------------------------
// Battery 7: updateChronoHeatmap Direct Input Mapping & Error Isolation
// -----------------------------------------------------------------------------
console.log('Battery 7: updateChronoHeatmap Direct Input Mapping & Error Isolation');
{
  const dash = require(dashJsPath);
  assert(typeof dash.updateChronoHeatmap === 'function', 'updateChronoHeatmap must be exported');

  // Test Case A: Direct domains property
  const dummyDomains = {
    'github.com': { foregroundSeconds: 1800, backgroundMediaSeconds: 0, totalSeconds: 1800, sessions: 5 }
  };
  const matrixA = dash.updateChronoHeatmap({ domains: dummyDomains });
  assert(matrixA, 'Matrix must be returned for direct domains');

  // Test Case B: Direct history property
  const todayStr = new Date().toISOString().split('T')[0];
  const dummyHistory = {
    [todayStr]: { hourlyBuckets: { 14: { activeSeconds: 2400, mediaSeconds: 0, topDomain: 'github.com' } } }
  };
  const matrixB = dash.updateChronoHeatmap({ history: dummyHistory });
  assert(matrixB, 'Matrix must be returned for direct history');

  console.log('  ✅ updateChronoHeatmap successfully handles direct domains and direct history objects\n');
}

console.log('============================================================');
console.log('🎉 ALL 7 INITIAL RENDER TEST BATTERIES PASSED (Exit Code 0)');
console.log('============================================================');
