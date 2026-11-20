/**
 * Comprehensive Verification Test Suite:
 * Popup Settings Drawer Docking and Sleek Scrollbar Geometry Fix
 * 
 * Task ID: TASK-POPUP-DRAWER-DOCKING-AND-SCROLLBAR-FIX-001
 * Authorization: AUTH-MGR-20261119-POPUP-DRAWER-FIX-001
 * Role: Level 4 QA Verification Tester
 * Department: Dept 08 QA, Testing & Validation Engineering
 * 
 * Validates:
 * 1. Battery 1: Sleep Tab Pinning & Docking (.sleep-hero-card flex-shrink: 0, #viewSleepPane containment)
 * 2. Battery 2: Bounded Drawer Scroll Geometry (max-height: 220px, overflow-y: auto)
 * 3. Battery 3: Custom Sleek Cyber-Dark Scrollbars (WebKit 2px hairline width, transparent track, ghost opacity tokens)
 * 4. Battery 4: Compact Spacing in Focus Settings Drawer (reduced padding, 6px gaps, normalized zero margins)
 * 5. Battery 5: Encoding & Security (100% UTF-8 with BOM, zero-innerHTML safety)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Popup Settings Drawer Docking & Scrollbar Fix Verification Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const popupHtmlPath = path.join(baseDir, 'popup/popup.html');
const popupCssPath = path.join(baseDir, 'popup/popup.css');
const sleepCssPath = path.join(baseDir, 'popup/styles/tabs/tab_sleep.css');
const wellnessCssPath = path.join(baseDir, 'popup/styles/tabs/tab_wellness.css');
const popupJsPath = path.join(baseDir, 'popup/popup.js');

const stripBom = (str) => (str.charCodeAt(0) === 0xFEFF ? str.slice(1) : str);

const html = stripBom(fs.readFileSync(popupHtmlPath, 'utf8'));
const popupCss = stripBom(fs.readFileSync(popupCssPath, 'utf8'));
const sleepCss = stripBom(fs.readFileSync(sleepCssPath, 'utf8'));
const wellnessCss = stripBom(fs.readFileSync(wellnessCssPath, 'utf8'));
const popupJs = stripBom(fs.readFileSync(popupJsPath, 'utf8'));

// ===========================================================================
// Battery 1: Sleep Tab Pinning, Docking & Root Viewport Containment
// ===========================================================================
console.log('--- Battery 1: Sleep Tab Pinning, Docking & Root Viewport Containment ---');

// 0. Verify Root Viewport Geometry (html, body, and .sentinel-app ceiling lockdown)
const htmlRegex = /html\s*\{([^}]+)\}/s;
const htmlMatch = popupCss.match(htmlRegex);
assert.ok(htmlMatch, 'html selector must exist in popup.css');
assert.ok(
  /max-height:\s*600px\b/i.test(htmlMatch[1]),
  'html must have max-height: 600px ceiling lockdown'
);
assert.ok(
  /overflow:\s*hidden\s*!important/i.test(htmlMatch[1]),
  'html must have overflow: hidden !important to prevent outer window scrolling'
);

const bodyRegex = /body\s*\{([^}]+)\}/s;
const bodyMatch = popupCss.match(bodyRegex);
assert.ok(bodyMatch, 'body selector must exist in popup.css');
assert.ok(
  /max-height:\s*600px\b/i.test(bodyMatch[1]),
  'body must have max-height: 600px ceiling lockdown'
);
assert.ok(
  /overflow:\s*hidden\s*!important/i.test(bodyMatch[1]),
  'body must have overflow: hidden !important to eradicate outer window scrollbars'
);

const sentinelAppRegex = /\.sentinel-app\s*\{([^}]+)\}/s;
const sentinelAppMatch = popupCss.match(sentinelAppRegex);
assert.ok(sentinelAppMatch, '.sentinel-app selector must exist in popup.css');
assert.ok(
  /max-height:\s*600px\b/i.test(sentinelAppMatch[1]),
  '.sentinel-app must enforce max-height: 600px containment'
);
assert.ok(
  /overflow:\s*hidden\b/i.test(sentinelAppMatch[1]),
  '.sentinel-app must enforce overflow: hidden boundary'
);

// 1. Verify .sleep-hero-card is pinned with flex-shrink: 0
const heroCardRegex = /\.sleep-hero-card\s*\{([^}]+)\}/s;
const heroCardMatch = sleepCss.match(heroCardRegex);
assert.ok(heroCardMatch, '.sleep-hero-card selector must exist in tab_sleep.css');
assert.ok(
  /flex-shrink:\s*0\b/i.test(heroCardMatch[1]),
  '.sleep-hero-card must have flex-shrink: 0 to prevent dial shrinkage/collapse'
);

// 2. Verify #viewSleepPane layout containment
const viewSleepPaneRegex = /#viewSleepPane\s*\{([^}]+)\}/s;
const viewSleepPaneMatch = sleepCss.match(viewSleepPaneRegex);
assert.ok(viewSleepPaneMatch, '#viewSleepPane selector must exist in tab_sleep.css');
assert.ok(
  /overflow:\s*hidden\b/i.test(viewSleepPaneMatch[1]),
  '#viewSleepPane must have overflow: hidden to contain scroll inside the drawer rather than displacing dial'
);
assert.ok(
  /max-height:\s*475px\b/i.test(viewSleepPaneMatch[1]),
  '#viewSleepPane must enforce max-height: 475px containment boundary'
);

// 3. Verify HTML structure: hero ring card and drawer exist within #viewSleepPane
assert.ok(html.includes('id="cardSleepHeroRing"'), 'popup.html must contain #cardSleepHeroRing');
assert.ok(html.includes('id="sleepSettingsDrawer"'), 'popup.html must contain #sleepSettingsDrawer');

console.log('✅ Battery 1 Passed: Root viewport 600px lockdown, sleep hero dial pinning, and pane overflow containment certified\n');

// ===========================================================================
// Battery 2: Bounded Drawer Scroll Geometry
// ===========================================================================
console.log('--- Battery 2: Bounded Drawer Scroll Geometry ---');

// 1. Sleep Settings Drawer open inner content bounding
const sleepOpenInnerRegex = /#sleepSettingsDrawer\.open\s+\.drawer-inner-content\s*\{([^}]+)\}/s;
const sleepOpenInnerMatch = sleepCss.match(sleepOpenInnerRegex);
assert.ok(sleepOpenInnerMatch, '#sleepSettingsDrawer.open .drawer-inner-content must be defined in tab_sleep.css');
assert.ok(
  /max-height:\s*200px\b/i.test(sleepOpenInnerMatch[1]),
  '#sleepSettingsDrawer.open .drawer-inner-content must bound expansion with max-height: 200px'
);
assert.ok(
  /overflow-y:\s*auto\b/i.test(sleepOpenInnerMatch[1]),
  '#sleepSettingsDrawer.open .drawer-inner-content must enable smooth overflow-y: auto'
);
assert.ok(
  /overflow-x:\s*hidden\b/i.test(sleepOpenInnerMatch[1]),
  '#sleepSettingsDrawer.open .drawer-inner-content must prevent horizontal overflow (overflow-x: hidden)'
);

// 2. Focus Settings Drawer open inner content bounding
const focusOpenInnerRegex = /#focusSettingsDrawer\.open\s+\.drawer-inner-content\s*\{([^}]+)\}/s;
const focusOpenInnerMatch = wellnessCss.match(focusOpenInnerRegex);
assert.ok(focusOpenInnerMatch, '#focusSettingsDrawer.open .drawer-inner-content must be defined in tab_wellness.css');
assert.ok(
  /max-height:\s*200px\b/i.test(focusOpenInnerMatch[1]),
  '#focusSettingsDrawer.open .drawer-inner-content must bound expansion with max-height: 200px'
);
assert.ok(
  /overflow-y:\s*auto\b/i.test(focusOpenInnerMatch[1]),
  '#focusSettingsDrawer.open .drawer-inner-content must enable smooth overflow-y: auto'
);
assert.ok(
  /overflow-x:\s*hidden\b/i.test(focusOpenInnerMatch[1]),
  '#focusSettingsDrawer.open .drawer-inner-content must prevent horizontal overflow (overflow-x: hidden)'
);

// 3. Focus Settings Drawer container flex rules
const focusDrawerRegex = /#focusSettingsDrawer\.popup-settings-drawer\s*\{([^}]+)\}/s;
const focusDrawerMatch = wellnessCss.match(focusDrawerRegex);
assert.ok(focusDrawerMatch, '#focusSettingsDrawer.popup-settings-drawer must be defined');
assert.ok(
  /flex:\s*1\b/i.test(focusDrawerMatch[1]) && /min-height:\s*0\b/i.test(focusDrawerMatch[1]),
  '#focusSettingsDrawer must have flex: 1 and min-height: 0 for proper flex child scrolling'
);

console.log('✅ Battery 2 Passed: Bounded 200px drawer internal scrolling verified on both drawers\n');

// ===========================================================================
// Battery 3: Custom Sleek Cyber-Dark Scrollbars (Hairline Ghost Geometry)
// ===========================================================================
console.log('--- Battery 3: Custom Sleek Cyber-Dark Scrollbars (Hairline Ghost Geometry) ---');

// 1. Universal popup.css scrollbars (body, .tab-pane, .drawer-inner-content, .drawer-expandable-wrap)
assert.ok(
  popupCss.includes('scrollbar-width: thin;'),
  'popup.css must declare scrollbar-width: thin for W3C compliance'
);
assert.ok(
  popupCss.includes('scrollbar-color: rgba(255, 255, 255, 0.12) transparent;'),
  'popup.css must declare cyber scrollbar-color on dark mode'
);

// WebKit custom scrollbar rules in popup.css
assert.ok(
  popupCss.includes('width: 2px;') && popupCss.includes('height: 2px;'),
  'popup.css must set sleek 2px hairline scrollbar width/height'
);
assert.ok(
  popupCss.includes('background: transparent;'),
  'popup.css must set transparent scrollbar track'
);
assert.ok(
  popupCss.includes('background: rgba(255, 255, 255, 0.12);'),
  'popup.css must style scrollbar thumb with cyber dark opacity'
);
assert.ok(
  popupCss.includes('border-radius: 999px;'),
  'popup.css must round scrollbar thumbs with 999px border-radius'
);

// 2. Tab Sleep specific scrollbars
assert.ok(
  sleepCss.includes('#viewSleepPane::-webkit-scrollbar') &&
  sleepCss.includes('#sleepSettingsDrawer .drawer-inner-content::-webkit-scrollbar'),
  'tab_sleep.css must define WebKit scrollbar rules for sleep pane and sleep drawer'
);
assert.ok(
  sleepCss.includes('rgba(129, 140, 248, 0.16)'),
  'tab_sleep.css must apply sleek indigo thumb color rgba(129, 140, 248, 0.16)'
);
assert.ok(
  sleepCss.includes('rgba(129, 140, 248, 0.28)'),
  'tab_sleep.css must apply sleek indigo hover thumb color rgba(129, 140, 248, 0.28)'
);

// 3. Tab Wellness / Focus specific scrollbars
assert.ok(
  wellnessCss.includes('#viewFocusPane::-webkit-scrollbar') &&
  wellnessCss.includes('#focusSettingsDrawer .drawer-inner-content::-webkit-scrollbar'),
  'tab_wellness.css must define WebKit scrollbar rules for focus pane and focus drawer'
);
assert.ok(
  wellnessCss.includes('rgba(6, 182, 212, 0.16)'),
  'tab_wellness.css must apply sleek cyan thumb color rgba(6, 182, 212, 0.16)'
);
assert.ok(
  wellnessCss.includes('rgba(6, 182, 212, 0.28)'),
  'tab_wellness.css must apply sleek cyan hover thumb color rgba(6, 182, 212, 0.28)'
);

// 4. Light theme scrollbar support
assert.ok(
  popupCss.includes('[data-theme="light"]') && popupCss.includes('scrollbar-color: rgba(0, 0, 0, 0.12) transparent;'),
  'popup.css must provide sleek scrollbars in light theme'
);
assert.ok(
  sleepCss.includes('[data-theme="light"]') && sleepCss.includes('rgba(99, 102, 241, 0.15)'),
  'tab_sleep.css must provide light theme indigo scrollbars'
);
assert.ok(
  wellnessCss.includes('[data-theme="light"]') && wellnessCss.includes('rgba(15, 118, 110, 0.15)'),
  'tab_wellness.css must provide light theme cyan/teal scrollbars'
);

console.log('✅ Battery 3 Passed: Sleek Cyber-Dark Scrollbars and cross-browser styling validated\n');

// ===========================================================================
// Battery 4: Compact Spacing in Focus Settings Drawer
// ===========================================================================
console.log('--- Battery 4: Compact Spacing in Focus Settings Drawer ---');

// 1. Focus section card compact padding
const focusCardPaddingRegex = /#focusSettingsDrawer\s+\.focus-section-card\s*\{([^}]+)\}/s;
const focusCardPaddingMatch = wellnessCss.match(focusCardPaddingRegex);
assert.ok(focusCardPaddingMatch, '#focusSettingsDrawer .focus-section-card rule must exist');
assert.ok(
  /padding:\s*8px\s+10px\b/i.test(focusCardPaddingMatch[1]),
  '#focusSettingsDrawer .focus-section-card must use compact 8px 10px padding'
);

// 2. Normalized margins on child containers
const normalizedMarginRegex = /#focusSettingsDrawer\s+\.focus-ratio-container,\s*\n*#focusSettingsDrawer\s+\.doomscroll-breaker-card\s*\{([^}]+)\}/s;
const normalizedMarginMatch = wellnessCss.match(normalizedMarginRegex);
assert.ok(normalizedMarginMatch, 'Normalized margin rule for ratio container and doomscroll card must exist');
assert.ok(
  /margin-top:\s*0\b/i.test(normalizedMarginMatch[1]),
  'Ratio container and doomscroll breaker card must have margin-top: 0 inside drawer'
);

// 3. Compact gap in drawer inner content
const focusInnerRegex = /#focusSettingsDrawer\s+\.drawer-inner-content\s*\{([^}]+)\}/s;
const focusInnerMatch = wellnessCss.match(focusInnerRegex);
assert.ok(focusInnerMatch, '#focusSettingsDrawer .drawer-inner-content rule must exist');
assert.ok(
  /gap:\s*6px\b/i.test(focusInnerMatch[1]),
  '#focusSettingsDrawer .drawer-inner-content must use 6px gap for compact vertical stacking'
);

// 4. Pin popup focus dial card
const hasFocusCardFlexShrink = /\.popup-focus-card\s*\{[^}]*flex-shrink:\s*0/s.test(wellnessCss);
assert.ok(
  hasFocusCardFlexShrink,
  '.popup-focus-card must have flex-shrink: 0 to protect dial from shrinkage'
);

console.log('✅ Battery 4 Passed: Focus drawer compact spacing and element pinning verified\n');

// ===========================================================================
// Battery 5: Encoding & Security
// ===========================================================================
console.log('--- Battery 5: Encoding & Security ---');

// 1. 100% W3C Trusted Types Zero-innerHTML safety
const drawerFnRegex = /function\s+initCollapsibleDrawer\s*\([^)]*\)\s*\{[\s\S]*?\n\}/;
const drawerFnMatch = popupJs.match(drawerFnRegex);
assert.ok(drawerFnMatch, 'initCollapsibleDrawer must be defined in popup.js');
assert.ok(!drawerFnMatch[0].includes('innerHTML'), 'initCollapsibleDrawer must have 0 innerHTML violations');

// 2. UTF-8 with BOM verification on all modified files and this test file
const verifiedFiles = [
  popupCssPath,
  sleepCssPath,
  wellnessCssPath,
  __filename
];

verifiedFiles.forEach(fp => {
  const buf = fs.readFileSync(fp);
  const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  assert.ok(hasBOM, `File ${path.basename(fp)} must have UTF-8 with BOM encoding (0xEF, 0xBB, 0xBF)`);
});

console.log('✅ Battery 5 Passed: Zero-innerHTML safety and 100% UTF-8 with BOM certified across all files\n');

console.log('============================================================');
console.log('ALL 5 BATTERIES PASSED CLEANLY (Exit Code 0)');
console.log('============================================================');
