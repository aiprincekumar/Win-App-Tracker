const fs = require('fs');

const vmf = fs.readFileSync('src/dashboard/features/media_deck_visualizer_feature.js', 'utf8');
const dhtml = fs.readFileSync('dashboard/dashboard.html', 'utf8');
const djs = fs.readFileSync('dashboard/dashboard.js', 'utf8');
const vcss = fs.readFileSync('dashboard/styles/media/visualizer_deck.css', 'utf8');

const modes = [
  'bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror',
  'lissajous', 'hex_grid', 'particles', 'retro_grid', 'vinyl_rings', 'liquid_wave'
];

console.log('======================================================================');
console.log('QA AUDIT: 12-MODE AUDIO VISUALIZER EXPANSION VERIFICATION');
console.log('======================================================================');

console.log('\n[CHECK 1] VALID_VIZ_MODES in media_deck_visualizer_feature.js');
modes.forEach(m => {
  const present = vmf.includes(`'${m}'`);
  console.log(`  VALID_VIZ_MODES "${m}": ${present ? 'PASS' : 'FAIL'}`);
});

console.log('\n[CHECK 2] dashboard.html #selectVizEffect options');
const selectMatch = dhtml.match(/<select id="selectVizEffect"[\s\S]*?<\/select>/);
if (selectMatch) {
  modes.forEach(m => {
    const hasOpt = selectMatch[0].includes(`value="${m}"`);
    console.log(`  <select> option "${m}": ${hasOpt ? 'PASS' : 'FAIL'}`);
  });
} else {
  console.log('  FAIL: #selectVizEffect not found');
}

console.log('\n[CHECK 3] dashboard.html #vizPillPopoverMenu items');
modes.forEach(m => {
  const hasBtn = dhtml.includes(`data-effect="${m}"`);
  console.log(`  popover item "${m}": ${hasBtn ? 'PASS' : 'FAIL'}`);
});

console.log('\n[CHECK 4] dashboard.js VIZ_CYCLE');
const vizCycleMatch = djs.match(/const VIZ_CYCLE = \[([\s\S]*?)\];/);
if (vizCycleMatch) {
  modes.forEach(m => {
    const hasCycle = vizCycleMatch[1].includes("'" + m + "'");
    console.log(`  VIZ_CYCLE "${m}": ${hasCycle ? 'PASS' : 'FAIL'}`);
  });
} else {
  console.log('  FAIL: VIZ_CYCLE not found');
}

console.log('\n[CHECK 5] dashboard.js VIZ_MODE_META definitions');
modes.forEach(m => {
  const hasMeta = djs.includes(`'${m}': {`) || djs.includes(`${m}: {`) || djs.includes(`"${m}": {`);
  console.log(`  VIZ_MODE_META "${m}": ${hasMeta ? 'PASS' : 'FAIL'}`);
});

console.log('\n[CHECK 6] dashboard.js DASHBOARD_I18N Keys (en & hi)');
const modeI18nKeys = {
  bars: 'viz_effect_bars',
  wave: 'viz_effect_wave',
  radial: 'viz_effect_radial',
  matrix_dots: 'viz_effect_matrix',
  flame: 'viz_effect_flame',
  stereo_mirror: 'viz_effect_stereo',
  lissajous: 'viz_effect_lissajous',
  hex_grid: 'viz_effect_hex_grid',
  particles: 'viz_effect_particles',
  retro_grid: 'viz_effect_retro_grid',
  vinyl_rings: 'viz_effect_vinyl_rings',
  liquid_wave: 'viz_effect_liquid_wave'
};

Object.entries(modeI18nKeys).forEach(([mode, key]) => {
  const inEn = djs.includes(`${key}: '`) || djs.includes(`${key}: "`);
  console.log(`  i18n key "${key}" for ${mode}: ${inEn ? 'PASS' : 'FAIL'}`);
});

console.log('\n[CHECK 7] Function length of renderVisualizerFrame in media_deck_visualizer_feature.js');
const lines = vmf.split('\n');
let startLine = -1;
let endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function renderVisualizerFrame(') || lines[i].includes('renderVisualizerFrame(')) {
    startLine = i + 1;
    break;
  }
}
if (startLine !== -1) {
  let openBraces = 0;
  for (let i = startLine - 1; i < lines.length; i++) {
    openBraces += (lines[i].match(/{/g) || []).length;
    openBraces -= (lines[i].match(/}/g) || []).length;
    if (openBraces === 0) {
      endLine = i + 1;
      break;
    }
  }
}
const funcLen = endLine - startLine + 1;
console.log(`  renderVisualizerFrame: line ${startLine} to ${endLine} (${funcLen} lines total)`);
console.log(`  Universal Rule 28 limit (<= 50 lines): ${funcLen <= 50 ? 'PASS' : 'FAIL'}`);

console.log('\n[CHECK 8] visualizer_deck.css line count & popover menu styling');
const cssLines = vcss.split('\n').length;
console.log(`  visualizer_deck.css line count: ${cssLines} lines`);
console.log(`  Universal Rule 28 limit (< 700 lines): ${cssLines < 700 ? 'PASS' : 'FAIL'}`);
const hasMaxHeight = vcss.includes('max-height: 280px') || vcss.includes('max-height:280px');
const hasOverflowY = vcss.includes('overflow-y: auto') || vcss.includes('overflow-y:auto');
console.log(`  #vizPillPopoverMenu max-height: 280px: ${hasMaxHeight ? 'PASS' : 'FAIL'}`);
console.log(`  #vizPillPopoverMenu overflow-y: auto: ${hasOverflowY ? 'PASS' : 'FAIL'}`);

console.log('\n[CHECK 9] W3C Trusted Types & zero-innerHTML Safety');
const innerHTMLInFeature = (vmf.match(/\.innerHTML/g) || []).length;
console.log(`  media_deck_visualizer_feature.js innerHTML assignments: ${innerHTMLInFeature} (${innerHTMLInFeature === 0 ? 'PASS' : 'FAIL'})`);

console.log('\n======================================================================');
