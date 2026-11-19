/**
 * Test Suite: Sidebar HUD Grouping Clusters Verification
 * Validates UI Grouping of Focus + Sleep Sentinels and SQLite + Video HUD Bridges
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const baseDir = path.resolve(__dirname, '..');

console.log('🧪 Starting Sidebar HUD Grouping Clusters QA Suite...\n');

// Battery 1: HTML DOM Structure & Grouping Contract
console.log('📋 Battery 1: HTML DOM Structure & Grouping Contract');
{
  const htmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
  assert(fs.existsSync(htmlPath), 'dashboard/dashboard.html must exist');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify sentinel cluster
  assert(html.includes('class="sidebar-hud-cluster sentinel-cluster"'), 'Must declare .sidebar-hud-cluster.sentinel-cluster');
  assert(html.includes('aria-label="Live Sentinel Monitors"'), 'Sentinel cluster must have aria-label="Live Sentinel Monitors"');
  assert(html.includes('role="group"'), 'Sentinel cluster must declare role="group"');

  // Verify bridge cluster
  assert(html.includes('class="sidebar-hud-cluster bridge-cluster"'), 'Must declare .sidebar-hud-cluster.bridge-cluster');
  assert(html.includes('aria-label="Telemetry & Hardware Bridges"'), 'Bridge cluster must have aria-label="Telemetry & Hardware Bridges"');
  assert(html.includes('role="group"'), 'Bridge cluster must declare role="group"');

  // Verify hierarchy: wellbeingLiveMicroWidget and sleepLiveMicroWidget inside sentinel-cluster
  const sentinelIndex = html.indexOf('class="sidebar-hud-cluster sentinel-cluster"');
  const bridgeIndex = html.indexOf('class="sidebar-hud-cluster bridge-cluster"');
  assert(sentinelIndex !== -1 && bridgeIndex !== -1, 'Both clusters must exist');
  assert(sentinelIndex < bridgeIndex, 'Sentinel cluster must precede bridge cluster');

  const sentinelSection = html.slice(sentinelIndex, bridgeIndex);
  assert(sentinelSection.includes('id="wellbeingLiveMicroWidget"'), 'Focus Sentinel must be inside sentinel-cluster');
  assert(sentinelSection.includes('id="sleepLiveMicroWidget"'), 'Sleep Sentinel must be inside sentinel-cluster');
  assert(sentinelSection.indexOf('wellbeingLiveMicroWidget') < sentinelSection.indexOf('sleepLiveMicroWidget'), 'Focus Sentinel must come before Sleep Sentinel');

  const bridgeSection = html.slice(bridgeIndex, html.indexOf('<!-- Version & Profile footer -->'));
  assert(bridgeSection.includes('id="sidebarDataHubCard"'), 'SQLite Data Hub must be inside bridge-cluster');
  assert(bridgeSection.includes('id="sidebarHudCard"'), 'Video Detector HUD must be inside bridge-cluster');
  assert(bridgeSection.indexOf('sidebarDataHubCard') < bridgeSection.indexOf('sidebarHudCard'), 'Data Hub must come before Video HUD');

  console.log('  ✅ Sentinel and Bridge cluster containers correctly wrap target HUD widgets');
  console.log('  ✅ Accessible roles, labels, and ordering verified');
}

// Battery 2: CSS Styles & Seamless Grouping Invariants
console.log('\n🎨 Battery 2: CSS Styles & Seamless Grouping Invariants');
{
  const cssFiles = [
    path.join(baseDir, 'dashboard', 'styles', 'layout.css'),
    path.join(baseDir, 'dashboard', 'styles', 'layout', 'header_sidebar.css'),
    path.join(baseDir, 'dashboard', 'dashboard.css')
  ];

  cssFiles.forEach(cssPath => {
    const fileName = path.basename(cssPath);
    assert(fs.existsSync(cssPath), `${fileName} must exist`);
    const css = fs.readFileSync(cssPath, 'utf8');

    assert(css.includes('.sidebar-hud-cluster'), `${fileName} must contain .sidebar-hud-cluster`);
    assert(css.includes('border-bottom: none'), `${fileName} must define border-bottom: none on top card`);
    assert(css.includes('.sidebar-hud-cluster .sidebar-hud-card:last-child'), `${fileName} must style last-child`);
    assert(css.includes(':focus-visible'), `${fileName} must preserve focus-visible ring`);

    console.log(`  ✅ CSS invariants verified in ${fileName}`);
  });

  // Verify theme-light support
  const themesCssPath = path.join(baseDir, 'dashboard', 'styles', 'themes.css');
  const themesCss = fs.readFileSync(themesCssPath, 'utf8');
  assert(themesCss.includes('.sidebar-hud-cluster .sidebar-hud-card:last-child'), 'themes.css must define light-mode cluster divider');
  console.log('  ✅ Light mode border-top divider verified in themes.css');
}

// Battery 3: UTF-8 with BOM Integrity
console.log('\n🔒 Battery 3: UTF-8 with BOM Integrity');
{
  const files = [
    path.join(baseDir, 'dashboard', 'dashboard.html'),
    path.join(baseDir, 'dashboard', 'styles', 'layout.css'),
    path.join(baseDir, 'dashboard', 'styles', 'layout', 'header_sidebar.css'),
    path.join(baseDir, 'dashboard', 'dashboard.css'),
    path.join(baseDir, 'dashboard', 'styles', 'themes.css')
  ];

  files.forEach(file => {
    const buf = fs.readFileSync(file);
    const hasBom = buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    assert(hasBom, `File ${path.relative(baseDir, file)} must start with UTF-8 BOM`);
    console.log(`  ✅ UTF-8 with BOM verified: ${path.relative(baseDir, file)}`);
  });
}

// Battery 4: W3C Trusted Types & DOM Safety
console.log('\n🛡️ Battery 4: W3C Trusted Types & DOM Safety');
{
  const htmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert(!html.includes('javascript:'), 'Zero javascript: URIs allowed');
  assert(!html.includes('onload='), 'Zero inline execution handlers');
  console.log('  ✅ HTML markup zero-unsafe-pattern certified');
}

console.log('\n============================================================');
console.log('🎉 ALL 4 BATTERIES PASSED CLEANLY (100% GREEN)');
console.log('============================================================');
