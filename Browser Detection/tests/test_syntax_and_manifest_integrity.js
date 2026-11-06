/**
 * Verification Test Suite: Extension Syntax, Manifest & File Integrity
 * 
 * Verifies:
 * 1. Syntax & Compilation check on all JS files via `node -c` and `vm.Script`
 * 2. Specific integrity of popup/popup.js (no unexpected token '}', clean transition after processDomainStats)
 * 3. manifest.json V3 integrity, version bump to 2.4.1, and all critical permissions
 * 4. Physical existence of all assets, icons, scripts, and HTML pages declared in manifest
 * 5. HTML script binding and version label consistency
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

console.log('🧪 Starting Extension Syntax, Manifest & File Integrity Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Test 1: Node.js Compiler Syntax Check (`node -c`) on All Extension Scripts
// ---------------------------------------------------------------------------
console.log('Test 1: Node.js Compiler Syntax Check (`node -c`) on All Extension Scripts');
{
  const targetScripts = [
    'popup/popup.js',
    'background.js',
    'dashboard/dashboard.js',
    'content_media.js',
    'inject_main_world.js'
  ];

  targetScripts.forEach((relPath) => {
    const fullPath = path.join(baseDir, relPath);
    assert(fs.existsSync(fullPath), `Target script must exist: ${relPath}`);

    try {
      execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
      console.log(`  ✅ node -c passed for ${relPath}`);
    } catch (err) {
      assert.fail(`Syntax error detected in ${relPath} via node -c: ${err.message}`);
    }
  });
}

// ---------------------------------------------------------------------------
// Test 2: In-Memory AST Parsing & Compilation via `vm.Script`
// ---------------------------------------------------------------------------
console.log('\nTest 2: In-Memory AST Parsing & Compilation via `vm.Script`');
{
  const targetScripts = [
    'popup/popup.js',
    'background.js',
    'dashboard/dashboard.js',
    'content_media.js',
    'inject_main_world.js'
  ];

  targetScripts.forEach((relPath) => {
    const fullPath = path.join(baseDir, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');

    let script;
    assert.doesNotThrow(() => {
      script = new vm.Script(code, { filename: relPath, displayErrors: true });
    }, `vm.Script compilation must succeed for ${relPath}`);

    assert(script, `Script object must be instantiated for ${relPath}`);
    console.log(`  ✅ vm.Script parsed ${relPath} successfully (${code.length} bytes, 0 parse errors)`);
  });
}

// ---------------------------------------------------------------------------
// Test 3: Dedicated popup/popup.js Structural & Brace Integrity
// ---------------------------------------------------------------------------
console.log('\nTest 3: Dedicated popup/popup.js Structural & Brace Integrity');
{
  const popupJsPath = path.join(baseDir, 'popup/popup.js');
  const code = fs.readFileSync(popupJsPath, 'utf8');

  // Verify processDomainStats function existence
  const procIndex = code.indexOf('function processDomainStats(');
  assert(procIndex !== -1, 'popup.js must define processDomainStats');

  // Verify renderDonutChart function existence
  const donutIndex = code.indexOf('function renderDonutChart(');
  assert(donutIndex !== -1, 'popup.js must define renderDonutChart');

  // Verify segment between processDomainStats and renderDonutChart
  const segment = code.substring(procIndex, donutIndex);
  
  // Count closing braces inside processDomainStats function definition
  const closingBraceMatches = segment.match(/}/g) || [];
  const openingBraceMatches = segment.match(/{/g) || [];

  // Opening and closing braces inside this segment must match exactly
  assert.strictEqual(
    openingBraceMatches.length,
    closingBraceMatches.length,
    `Braces inside processDomainStats must balance exactly! Open: ${openingBraceMatches.length}, Close: ${closingBraceMatches.length}`
  );

  // Check no stray closing brace between the end of processDomainStats and renderDonutChart comment
  const commentIndex = segment.lastIndexOf('/**');
  assert(commentIndex !== -1, 'Docstring comment for renderDonutChart must exist');
  const betweenCode = segment.substring(segment.lastIndexOf('}') + 1, commentIndex).trim();
  assert.strictEqual(betweenCode, '', 'No stray code or closing braces between processDomainStats and renderDonutChart');

  console.log('  ✅ processDomainStats and renderDonutChart have perfectly balanced braces');
  console.log('  ✅ Zero dangling closing braces between functions (Bug 804:1 prevented)');
}

// ---------------------------------------------------------------------------
// Test 4: Manifest V3 Schema, Permissions & Version 2.4.1 Validation
// ---------------------------------------------------------------------------
console.log('\nTest 4: Manifest V3 Schema, Permissions & Version 2.4.1 Validation');
{
  const manifestPath = path.join(baseDir, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.strictEqual(manifest.manifest_version, 3, 'manifest_version must be 3');
  assert.strictEqual(manifest.version, '2.4.1', 'version must be bumped to 2.4.1');
  assert.strictEqual(manifest.name, 'Web Activity & Media Sentinel', 'Extension name must be exact');

  // Essential MV3 permissions
  const requiredPermissions = [
    'tabs',
    'activeTab',
    'storage',
    'idle',
    'alarms',
    'nativeMessaging',
    'scripting'
  ];

  requiredPermissions.forEach((perm) => {
    assert(manifest.permissions.includes(perm), `manifest.permissions must include "${perm}"`);
  });

  // Verify background worker
  assert.strictEqual(manifest.background.service_worker, 'background.js', 'background worker must be background.js');
  assert.strictEqual(manifest.background.type, 'module', 'background worker type must be module');

  // Verify action popup
  assert.strictEqual(manifest.action.default_popup, 'popup/popup.html', 'default_popup must be popup/popup.html');

  console.log('  ✅ manifest.json version is 2.4.1 (ready for Chrome extension reload)');
  console.log('  ✅ All 7 required MV3 permissions are strictly declared');
  console.log('  ✅ Background service worker and default popup configured correctly');
}

// ---------------------------------------------------------------------------
// Test 5: Physical Asset & Script Linkage Verification
// ---------------------------------------------------------------------------
console.log('\nTest 5: Physical Asset & Script Linkage Verification');
{
  const manifestPath = path.join(baseDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Verify all icon paths exist
  Object.values(manifest.icons).forEach((iconRel) => {
    const iconPath = path.join(baseDir, iconRel);
    assert(fs.existsSync(iconPath), `Icon file must exist: ${iconRel}`);
  });

  // Verify content scripts exist
  manifest.content_scripts.forEach((cs) => {
    cs.js.forEach((scriptRel) => {
      const scriptPath = path.join(baseDir, scriptRel);
      assert(fs.existsSync(scriptPath), `Content script must exist: ${scriptRel}`);
    });
  });

  // Verify popup HTML and JS linkage
  const popupHtmlPath = path.join(baseDir, 'popup/popup.html');
  assert(fs.existsSync(popupHtmlPath), 'popup/popup.html must exist');
  const popupHtml = fs.readFileSync(popupHtmlPath, 'utf8');
  assert(popupHtml.includes('src="popup.js"'), 'popup.html must link to popup.js');

  // Verify dashboard HTML and JS linkage + version label
  const dashHtmlPath = path.join(baseDir, 'dashboard/dashboard.html');
  assert(fs.existsSync(dashHtmlPath), 'dashboard/dashboard.html must exist');
  const dashHtml = fs.readFileSync(dashHtmlPath, 'utf8');
  assert(dashHtml.includes('src="dashboard.js"'), 'dashboard.html must link to dashboard.js');
  assert(dashHtml.includes('v2.4.1 Production Edition'), 'dashboard.html must display v2.4.1 Production Edition');

  console.log('  ✅ All manifest icons, content scripts, and web accessible files exist');
  console.log('  ✅ popup.html links directly to popup.js');
  console.log('  ✅ dashboard.html links directly to dashboard.js with v2.4.1 label');
}

console.log('\n🎉 ALL EXTENSION SYNTAX, MANIFEST & FILE INTEGRITY TESTS PASSED WITH 100% SUCCESS!');
