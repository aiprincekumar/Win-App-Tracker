/**
 * Test Suite: Media Player Advanced Row 1-Row Layout & Label Consolidation
 * Verifies that the media player advanced controls bar is consolidated into a single cohesive,
 * non-wrapping 1-row layout with shortened labels, intact DOM IDs, and preserved event listeners.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Media Player Advanced Row 1-Row Verification...\n');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'dashboard', 'dashboard.html');
const jsPath = path.join(rootDir, 'dashboard', 'dashboard.js');
const cssPaths = [
  path.join(rootDir, 'dashboard', 'styles', 'media', 'hero_player.css'),
  path.join(rootDir, 'dashboard', 'styles', 'media.css'),
  path.join(rootDir, 'dashboard', 'dashboard.css')
];

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

// 1. Verify UTF-8 BOM Preservation
test('All modified files maintain UTF-8 with BOM (0xEF, 0xBB, 0xBF)', () => {
  const allFiles = [htmlPath, jsPath, ...cssPaths];
  for (const file of allFiles) {
    const buf = fs.readFileSync(file);
    assert.strictEqual(buf[0], 0xef, `Missing BOM byte 0 in ${path.basename(file)}`);
    assert.strictEqual(buf[1], 0xbb, `Missing BOM byte 1 in ${path.basename(file)}`);
    assert.strictEqual(buf[2], 0xbf, `Missing BOM byte 2 in ${path.basename(file)}`);
  }
});

// 2. Verify HTML Structure & Shortened Button Labels
test('dashboard.html contains heroAdvancedRow with all required DOM IDs intact', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify IDs
  const requiredIds = [
    'heroAdvancedRow',
    'btnHeroFullscreen',
    'btnHeroPip',
    'btnHeroTheater',
    'btnHeroSwitchTab',
    'btnHeroQualityDown',
    'heroQualityDisplay',
    'btnHeroQualityUp',
    'btnHeroFullscreenText',
    'btnHeroPipText',
    'btnHeroTheaterText',
    'btnHeroSwitchTabText'
  ];

  for (const id of requiredIds) {
    assert(html.includes(`id="${id}"`), `DOM element id="${id}" missing in dashboard.html`);
  }
});

test('dashboard.html has shortened button labels with preserved title attributes', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify PiP
  assert(html.includes('id="btnHeroPipText">PiP</span>'), 'PiP label not shortened to "PiP"');
  assert(html.includes('title="Toggle Picture-in-Picture"'), 'btnHeroPip title missing or modified');

  // Verify Theater
  assert(html.includes('id="btnHeroTheaterText">Theater</span>'), 'Theater label not shortened to "Theater"');
  assert(html.includes('title="Toggle Theater Mode"'), 'btnHeroTheater title missing or modified');

  // Verify Tab
  assert(html.includes('id="btnHeroSwitchTabText">Tab</span>'), 'Switch tab label not shortened to "Tab"');
  assert(html.includes('title="Switch to Media Tab"'), 'btnHeroSwitchTab title missing or modified');

  // Verify Quality Steppers
  assert(html.includes('id="btnHeroQualityDown" class="btn-adv-mode-mini" title="Decrease Quality">🔽 Q-</button>'), 'btnHeroQualityDown missing 🔽 Q- or title');
  assert(html.includes('id="btnHeroQualityUp" class="btn-adv-mode-mini" title="Increase Quality">🔼 Q+</button>'), 'btnHeroQualityUp missing 🔼 Q+ or title');
});

// 3. Verify CSS Rules for 1-Row Non-Wrapping Layout
test('CSS files enforce 1-row nowrap, compact padding, and scroll fallback', () => {
  for (const cssPath of cssPaths) {
    const css = fs.readFileSync(cssPath, 'utf8');
    const base = path.basename(cssPath);

    // .hero-advanced-row
    assert(css.includes('.hero-advanced-row'), `Missing .hero-advanced-row in ${base}`);
    assert(/flex-wrap:\s*nowrap;/.test(css), `Missing flex-wrap: nowrap in ${base}`);
    assert(/padding:\s*6px\s+10px;/.test(css), `Missing padding: 6px 10px in ${base}`);
    assert(/overflow-x:\s*auto;/.test(css), `Missing overflow-x: auto in ${base}`);
    assert(/scrollbar-width:\s*none;/.test(css), `Missing scrollbar-width: none in ${base}`);
    assert(css.includes('.hero-advanced-row::-webkit-scrollbar'), `Missing ::-webkit-scrollbar rule in ${base}`);

    // .adv-modes-group
    assert(/gap:\s*5px;/.test(css), `Missing gap: 5px in .adv-modes-group in ${base}`);

    // .btn-adv-mode
    assert(/padding:\s*4px\s+8px;/.test(css), `Missing padding: 4px 8px in .btn-adv-mode in ${base}`);
    assert(/font-size:\s*11px;/.test(css), `Missing font-size: 11px in .btn-adv-mode in ${base}`);

    // .hero-quality-stepper
    assert(/padding:\s*2px\s+6px;/.test(css), `Missing padding: 2px 6px in .hero-quality-stepper in ${base}`);

    // .btn-adv-mode-mini
    assert(/padding:\s*3px\s+6px;/.test(css), `Missing padding: 3px 6px in .btn-adv-mode-mini in ${base}`);
    assert(/font-size:\s*10\.5px;/.test(css), `Missing font-size: 10.5px in .btn-adv-mode-mini in ${base}`);

    // .hero-quality-val
    assert(/min-width:\s*48px;/.test(css), `Missing min-width: 48px in .hero-quality-val in ${base}`);
  }
});

// 4. Verify i18n Dictionary Updates in dashboard.js
test('dashboard.js i18n dictionaries contain shortened labels', () => {
  const js = fs.readFileSync(jsPath, 'utf8');

  // English
  assert(js.includes("pip: 'PiP'"), "English i18n pip is not 'PiP'");
  assert(js.includes("theater: 'Theater'"), "English i18n theater is not 'Theater'");
  assert(js.includes("switch_tab: 'Tab'"), "English i18n switch_tab is not 'Tab'");

  // Hindi
  assert(js.includes("pip: 'PiP'"), "Hindi i18n pip is not 'PiP'");
  assert(js.includes("theater: 'थिएटर'"), "Hindi i18n theater is not 'थिएटर'");
  assert(js.includes("switch_tab: 'टैब'"), "Hindi i18n switch_tab is not 'टैब'");
});

// 5. Verify Event Listeners and Logic Preserved
test('dashboard.js preserves all media button event listeners and handlers', () => {
  const js = fs.readFileSync(jsPath, 'utf8');

  assert(js.includes("document.getElementById('btnHeroFullscreen')"), 'btnHeroFullscreen listener binding missing');
  assert(js.includes("document.getElementById('btnHeroPip')"), 'btnHeroPip listener binding missing');
  assert(js.includes("document.getElementById('btnHeroTheater')"), 'btnHeroTheater listener binding missing');
  assert(js.includes("document.getElementById('btnHeroSwitchTab')"), 'btnHeroSwitchTab listener binding missing');
  assert(js.includes("document.getElementById('btnHeroQualityDown')"), 'btnHeroQualityDown listener binding missing');
  assert(js.includes("document.getElementById('btnHeroQualityUp')"), 'btnHeroQualityUp listener binding missing');
});

console.log(`\n📊 Verification Summary: ${passedTests}/${totalTests} Tests Passed.`);
if (passedTests !== totalTests) {
  process.exit(1);
} else {
  console.log('🎉 All Media Player Advanced Row 1-Row Layout Tests PASSED!\n');
}
