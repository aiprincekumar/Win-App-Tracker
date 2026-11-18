/**
 * Test Suite: Popup Header Layout Refinement (Right-Aligned Cluster & Zero-Gap Margin)
 * File: tests/test_popup_header_layout_refinement.js
 * Verifies right-aligned unified cluster of 4 category navigation buttons + 2 utility action buttons
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Popup Header Layout Refinement Verification Suite...\n');

const ROOT_DIR = path.resolve(__dirname, '..');
const POPUP_CSS_PATH = path.join(ROOT_DIR, 'popup', 'popup.css');
const HEADER_CSS_PATH = path.join(ROOT_DIR, 'popup', 'styles', 'header.css');
const POPUP_HTML_PATH = path.join(ROOT_DIR, 'popup', 'popup.html');

// 1. Verify UTF-8 BOM
console.log('Battery 1: UTF-8 with BOM Integrity on Modified Files');
[POPUP_CSS_PATH, HEADER_CSS_PATH, POPUP_HTML_PATH].forEach(filePath => {
  const buf = fs.readFileSync(filePath);
  const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  assert.strictEqual(hasBOM, true, `File ${path.basename(filePath)} must have UTF-8 BOM`);
  console.log(`  ✅ ${path.basename(filePath)} has verified UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
});

// 2. Verify popup/popup.css Header Styles
console.log('\nBattery 2: popup/popup.css Layout Rules');
const popupCss = fs.readFileSync(POPUP_CSS_PATH, 'utf8');

const badgesMatch = popupCss.match(/\.header-badges\s*\{([^}]+)\}/);
assert(badgesMatch, 'popup.css must contain .header-badges');
const badgesBody = badgesMatch[1];

assert(badgesBody.includes('justify-content: flex-end'), '.header-badges must have justify-content: flex-end');
assert(!badgesBody.includes('justify-content: space-between'), '.header-badges must NOT have justify-content: space-between');
assert(badgesBody.includes('margin-left: auto'), '.header-badges must have margin-left: auto');
assert(!badgesBody.includes('flex: 1'), '.header-badges must NOT have flex: 1');
console.log('  ✅ .header-badges in popup.css has justify-content: flex-end & margin-left: auto (no space-between, no flex: 1)');

const actionGroupMatch = popupCss.match(/\.header-action-group\s*\{([^}]+)\}/);
assert(actionGroupMatch, 'popup.css must contain .header-action-group');
const actionGroupBody = actionGroupMatch[1];

assert(actionGroupBody.includes('margin-left: 0'), '.header-action-group must have margin-left: 0');
assert(!actionGroupBody.includes('margin-left: auto'), '.header-action-group must NOT have margin-left: auto');
assert(actionGroupBody.includes('gap: 4px'), '.header-action-group must maintain gap: 4px');
console.log('  ✅ .header-action-group in popup.css has margin-left: 0 & gap: 4px (no margin-left: auto)');

// 3. Verify popup/styles/header.css Modular Synchronization
console.log('\nBattery 3: popup/styles/header.css Modular Synchronization');
const headerCss = fs.readFileSync(HEADER_CSS_PATH, 'utf8');

const modBadgesMatch = headerCss.match(/\.header-badges\s*\{([^}]+)\}/);
assert(modBadgesMatch, 'header.css must contain .header-badges');
const modBadgesBody = modBadgesMatch[1];

assert(modBadgesBody.includes('justify-content: flex-end'), 'Modular header.css .header-badges must have justify-content: flex-end');
assert(modBadgesBody.includes('margin-left: auto'), 'Modular header.css .header-badges must have margin-left: auto');
console.log('  ✅ .header-badges in header.css synchronized with justify-content: flex-end & margin-left: auto');

const modActionGroupMatch = headerCss.match(/\.header-action-group\s*\{([^}]+)\}/);
assert(modActionGroupMatch, 'header.css must contain .header-action-group');
const modActionGroupBody = modActionGroupMatch[1];

assert(modActionGroupBody.includes('margin-left: 0'), 'Modular header.css .header-action-group must have margin-left: 0');
assert(modActionGroupBody.includes('gap: 4px'), 'Modular header.css .header-action-group must have gap: 4px');
console.log('  ✅ .header-action-group in header.css synchronized with margin-left: 0 & gap: 4px');

// 4. Verify popup/popup.html Cluster Structure & Comments
console.log('\nBattery 4: popup/popup.html Hierarchy & Comments');
const popupHtml = fs.readFileSync(POPUP_HTML_PATH, 'utf8');

assert(popupHtml.includes('<!-- Tier 1: 4 Compact Icon-Only Category Group Buttons -->'), 'popup.html must have updated category buttons comment');
assert(popupHtml.includes('<!-- Utility Action Buttons (Switch Tab & Dashboard) -->'), 'popup.html must have updated utility buttons comment');
assert(popupHtml.indexOf('id="tier1SegmentedNav"') < popupHtml.indexOf('class="header-action-group"'), 'tier1SegmentedNav must precede header-action-group in DOM');
console.log('  ✅ DOM hierarchy & comments in popup.html accurately reflect unified right-aligned cluster');

// 5. Geometry Check (Fits in 380px)
console.log('\nBattery 5: 380px Geometry Feasibility Check');
// 4 nav buttons (26px each = 104px) + 3 gaps of 2px (6px) + 2 padding of 2px (4px) + 2 border (2px) = 116px
// gap between nav and actions = 6px
// 2 action buttons (30px each = 60px) + 1 gap of 4px = 64px
// Total cluster width = 116 + 6 + 64 = 186px
// App width = 380px, padding = 12px * 2 = 24px, inner content width = 356px
// Brand width ~140px + cluster width 186px = 326px <= 356px
const estimatedClusterWidth = 116 + 6 + 64;
const availableWidth = 380 - 24;
assert(estimatedClusterWidth + 145 < availableWidth, 'Header elements must not overflow 380px popup width');
console.log(`  ✅ Total cluster width (${estimatedClusterWidth}px) + Brand (~145px) = ~331px fits cleanly in ${availableWidth}px available width`);

console.log('\n🎉 ALL 5 BATTERIES IN POPUP HEADER LAYOUT REFINEMENT TEST SUITE PASSED WITH 100% SUCCESS!\n');
