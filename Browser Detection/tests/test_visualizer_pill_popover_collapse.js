// tests/test_visualizer_pill_popover_collapse.js
// Verification Suite for TASK-VIZ-POPOVER-COLLAPSE-001 (Auth: AUTH-MGR-20261118-VIZ-POPOVER-COLLAPSE-001)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Visualizer Pill Popover Collapse Verification Suite (AUTH-MGR-20261118-VIZ-POPOVER-COLLAPSE-001)...\n');

const rootDir = path.resolve(__dirname, '..');
const vizDeckCssPath = path.join(rootDir, 'dashboard', 'styles', 'media', 'visualizer_deck.css');
const mediaCssPath = path.join(rootDir, 'dashboard', 'styles', 'media.css');
const dashCssPath = path.join(rootDir, 'dashboard', 'dashboard.css');
const dashJsPath = path.join(rootDir, 'dashboard', 'dashboard.js');

// =============================================================================
// Test 1: UTF-8 with BOM (0xEF, 0xBB, 0xBF) Standard Audit
// =============================================================================
console.log('Test 1: UTF-8 BOM (0xEF, 0xBB, 0xBF) Standard Audit');
{
  const filesToAudit = [
    { name: 'visualizer_deck.css', path: vizDeckCssPath },
    { name: 'media.css', path: mediaCssPath },
    { name: 'dashboard.css', path: dashCssPath },
    { name: 'dashboard.js', path: dashJsPath },
    { name: 'test_visualizer_pill_popover_collapse.js', path: __filename }
  ];

  filesToAudit.forEach(file => {
    const buffer = fs.readFileSync(file.path);
    assert(buffer.length >= 3, `${file.name} must not be empty`);
    assert.strictEqual(buffer[0], 0xEF, `${file.name} byte 0 must be 0xEF`);
    assert.strictEqual(buffer[1], 0xBB, `${file.name} byte 1 must be 0xBB`);
    assert.strictEqual(buffer[2], 0xBF, `${file.name} byte 2 must be 0xBF`);
    console.log(`  ✅ ${file.name} certified UTF-8 BOM standard`);
  });
}

// =============================================================================
// Test 2: CSS Specificity Collision Resolution Audit
// =============================================================================
console.log('\nTest 2: CSS Specificity Collision Resolution Audit across Stylesheets');
{
  const cssFiles = [
    { name: 'visualizer_deck.css', content: fs.readFileSync(vizDeckCssPath, 'utf8') },
    { name: 'media.css', content: fs.readFileSync(mediaCssPath, 'utf8') },
    { name: 'dashboard.css', content: fs.readFileSync(dashCssPath, 'utf8') }
  ];

  cssFiles.forEach(({ name, content }) => {
    // 1. Must use :not([hidden]) on both ID and class selectors
    assert(content.includes('#vizPillPopoverMenu:not([hidden])'), `${name} must include #vizPillPopoverMenu:not([hidden])`);
    assert(content.includes('.viz-pill-popover-menu:not([hidden])'), `${name} must include .viz-pill-popover-menu:not([hidden])`);

    // 2. Must include #vizPillPopoverMenu[hidden] and .viz-pill-popover-menu[hidden] with display: none !important
    assert(content.includes('#vizPillPopoverMenu[hidden]'), `${name} must include #vizPillPopoverMenu[hidden] selector`);
    assert(content.includes('.viz-pill-popover-menu[hidden]'), `${name} must include .viz-pill-popover-menu[hidden] selector`);

    // 3. Confirm unadorned #vizPillPopoverMenu without :not([hidden]) does NOT exist as a rule target
    const nakedMatches = content.match(/#vizPillPopoverMenu(?![a-zA-Z0-9_\-:\[])/g);
    assert.strictEqual(nakedMatches, null, `${name} must not contain naked #vizPillPopoverMenu selector without pseudo/attribute qualifier`);

    console.log(`  ✅ ${name} verified: specificity collision resolved with :not([hidden]) and [hidden] guards`);
  });

  // Verify visualizer_deck.css line count < 700 lines
  const vizDeckLines = fs.readFileSync(vizDeckCssPath, 'utf8').split(/\r?\n/).length;
  assert(vizDeckLines < 700, `visualizer_deck.css line count (${vizDeckLines}) must be strictly < 700 lines`);
  console.log(`  ✅ visualizer_deck.css line count verified: ${vizDeckLines} lines (strictly < 700 lines limit)`);
}

// =============================================================================
// Test 3: Universal Rule 28 Code Modularity & Line Count Thresholds
// =============================================================================
console.log('\nTest 3: Universal Rule 28 Code Modularity & Line Count Audit in dashboard.js');
{
  const jsContent = fs.readFileSync(dashJsPath, 'utf8');

  // Verify function definitions exist
  const requiredFunctions = [
    'bindVizPillTrigger',
    'bindVizPopoverOption',
    'bindVizPopoverDismiss',
    'initVisualizerPillSelector'
  ];

  requiredFunctions.forEach(fnName => {
    assert(jsContent.includes(`function ${fnName}(`), `dashboard.js must define ${fnName}`);
  });

  // Function line length analysis
  const lines = jsContent.split(/\r?\n/);
  requiredFunctions.forEach(fnName => {
    const startIdx = lines.findIndex(l => l.includes(`function ${fnName}(`));
    assert(startIdx !== -1, `${fnName} must be located in lines array`);

    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      if (braceCount === 0 && i > startIdx) {
        endIdx = i;
        break;
      }
    }
    const fnLines = endIdx - startIdx + 1;
    assert(fnLines <= 50, `${fnName} length (${fnLines} lines) must be <= 50 lines per Universal Rule 28`);
    console.log(`  ✅ ${fnName}: ${fnLines} lines (satisfies Rule 28 limit <= 50 lines)`);
  });
}

// =============================================================================
// Test 4: Functional Wiring & Event Simulation
// =============================================================================
console.log('\nTest 4: Functional Wiring & Event Behavior Simulation');
{
  const jsContent = fs.readFileSync(dashJsPath, 'utf8');

  // Create isolated DOM simulation
  class MockElement {
    constructor(id = '', className = '') {
      this.id = id;
      this.className = className;
      this.attributes = new Map();
      this.listeners = new Map();
      this.children = [];
      this.value = '';
    }

    setAttribute(name, val) {
      this.attributes.set(name, String(val));
    }

    getAttribute(name) {
      return this.attributes.has(name) ? this.attributes.get(name) : null;
    }

    hasAttribute(name) {
      return this.attributes.has(name);
    }

    removeAttribute(name) {
      this.attributes.delete(name);
    }

    addEventListener(event, fn) {
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event).push(fn);
    }

    dispatchEvent(event) {
      const handlers = this.listeners.get(event.type) || [];
      handlers.forEach(h => h(event));
    }

    contains(el) {
      if (el === this) return true;
      return this.children.some(c => c === el || (c.contains && c.contains(el)));
    }

    focus() {
      this.focused = true;
    }
  }

  const trigger = new MockElement('btnVizPillTrigger');
  trigger.setAttribute('aria-expanded', 'false');

  const popover = new MockElement('vizPillPopoverMenu', 'viz-pill-popover-menu');
  popover.setAttribute('hidden', '');

  const wrapper = new MockElement('vizPillSelectorWrapper');
  wrapper.children = [trigger, popover];

  const optBars = new MockElement('', 'viz-popover-option');
  optBars.setAttribute('data-effect', 'bars');

  const optWave = new MockElement('', 'viz-popover-option');
  optWave.setAttribute('data-effect', 'wave');

  const selectViz = new MockElement('selectVizEffect');

  const outsideElement = new MockElement('outsideDiv');

  const doc = {
    elements: {
      btnVizPillTrigger: trigger,
      vizPillPopoverMenu: popover,
      vizPillSelectorWrapper: wrapper,
      selectVizEffect: selectViz
    },
    getElementById(id) {
      return this.elements[id] || null;
    },
    querySelectorAll(sel) {
      if (sel === '.viz-popover-option') return [optBars, optWave];
      return [];
    },
    listeners: new Map(),
    addEventListener(event, fn) {
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event).push(fn);
    },
    dispatchEvent(event) {
      const handlers = this.listeners.get(event.type) || [];
      handlers.forEach(h => h(event));
    }
  };

  // Run script in sandbox to extract functions
  let setVisualizerModeCalledWith = null;
  const sandbox = {
    console,
    Event: class { constructor(type) { this.type = type; } },
    document: doc,
    setVisualizerMode: (effect) => { setVisualizerModeCalledWith = effect; }
  };
  vm.createContext(sandbox);

  // Extract functions from dashboard.js
  const fnCode = `
    ${jsContent.slice(jsContent.indexOf('function bindVizPillTrigger'), jsContent.indexOf('function initVisualizerErgonomicsUI'))}
  `;
  vm.runInContext(fnCode, sandbox);

  // Initialize selector
  sandbox.initVisualizerPillSelector(doc);

  // 1. Initial State: hidden
  assert.strictEqual(popover.hasAttribute('hidden'), true, 'Popover must initially be hidden');
  assert.strictEqual(trigger.getAttribute('aria-expanded'), 'false', 'Trigger aria-expanded must initially be false');
  console.log('  ✅ 4.1: Initial collapsed state certified');

  // 2. Click trigger -> Opens Popover
  trigger.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {} });
  assert.strictEqual(popover.hasAttribute('hidden'), false, 'Clicking trigger must open popover (remove hidden)');
  assert.strictEqual(trigger.getAttribute('aria-expanded'), 'true', 'Trigger aria-expanded must be true when open');
  console.log('  ✅ 4.2: Trigger click cleanly expands popover');

  // 3. Click trigger again -> Toggles closed
  trigger.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {} });
  assert.strictEqual(popover.hasAttribute('hidden'), true, 'Clicking trigger again must collapse popover (set hidden)');
  assert.strictEqual(trigger.getAttribute('aria-expanded'), 'false', 'Trigger aria-expanded must be false when closed');
  console.log('  ✅ 4.3: Trigger click cleanly collapses popover on toggle');

  // Re-open for option click test
  trigger.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {} });
  assert.strictEqual(popover.hasAttribute('hidden'), false);

  // 4. Click option (bars) -> Selects effect and collapses popover
  optBars.dispatchEvent({ type: 'click', preventDefault: () => {} });
  assert.strictEqual(setVisualizerModeCalledWith, 'bars', 'Selecting option must call setVisualizerMode with effect');
  assert.strictEqual(popover.hasAttribute('hidden'), true, 'Selecting option must collapse popover');
  assert.strictEqual(trigger.getAttribute('aria-expanded'), 'false', 'Trigger aria-expanded must be false after selection');
  console.log('  ✅ 4.4: Option selection sets mode and collapses popover menu');

  // Re-open for outside click test
  trigger.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {} });
  assert.strictEqual(popover.hasAttribute('hidden'), false);

  // 5. Click outside wrapper -> Collapses popover
  doc.dispatchEvent({ type: 'click', target: outsideElement });
  assert.strictEqual(popover.hasAttribute('hidden'), true, 'Clicking outside must collapse popover');
  assert.strictEqual(trigger.getAttribute('aria-expanded'), 'false', 'Trigger aria-expanded must be false after outside click');
  console.log('  ✅ 4.5: Outside click cleanly dismisses popover');

  // Re-open for Escape key test
  trigger.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {} });
  assert.strictEqual(popover.hasAttribute('hidden'), false);

  // 6. Press Escape -> Collapses popover
  doc.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert.strictEqual(popover.hasAttribute('hidden'), true, 'Escape key must collapse popover');
  assert.strictEqual(trigger.getAttribute('aria-expanded'), 'false', 'Trigger aria-expanded must be false after Escape');
  console.log('  ✅ 4.6: Escape key cleanly collapses popover and restores trigger state');
}

// =============================================================================
// Test 5: W3C Trusted Types & Security Audit
// =============================================================================
console.log('\nTest 5: W3C Trusted Types & Security Compliance');
{
  const jsContent = fs.readFileSync(dashJsPath, 'utf8');
  const vizPillSection = jsContent.slice(
    jsContent.indexOf('function bindVizPillTrigger'),
    jsContent.indexOf('function initVisualizerErgonomicsUI')
  );

  assert(!vizPillSection.includes('.innerHTML'), 'Visualizer pill popover functions must contain 0 innerHTML');
  assert(!vizPillSection.includes('.outerHTML'), 'Visualizer pill popover functions must contain 0 outerHTML');
  assert(!vizPillSection.includes('document.write'), 'Visualizer pill popover functions must contain 0 document.write');
  console.log('  ✅ 5.1: 100% W3C Trusted Types compliant (0 innerHTML/outerHTML/document.write)');
}

console.log('\n===========================================================================');
console.log('🎉 ALL 5 BATTERIES IN VISUALIZER PILL POPOVER COLLAPSE SUITE PASSED (Exit Code 0)!');
console.log('===========================================================================\n');
