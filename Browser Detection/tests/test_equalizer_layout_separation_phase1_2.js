/**
 * Phase 1 & Phase 2 Dedicated Test Suite: 5-Band Equalizer & Audio Lab Pure Sibling Bento Containers
 * Token: AUTH-MGR-20261117-EQ-PURE-SPLIT-001
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Phase 1 & 2 Equalizer & Audio Lab Pure Sibling Bento Layout Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const htmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
const cssPath = path.join(baseDir, 'dashboard', 'dashboard.css');
const audioLabCssPath = path.join(baseDir, 'dashboard', 'styles', 'audio_lab.css');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const audioLabCss = fs.readFileSync(audioLabCssPath, 'utf8');

// ===========================================================================
// Battery 1: UTF-8 with BOM (0xEF, 0xBB, 0xBF) Certification
// ===========================================================================
console.log('Battery 1: UTF-8 BOM (0xEF, 0xBB, 0xBF) Compliance');
[htmlPath, cssPath, audioLabCssPath].forEach(filePath => {
  const buf = fs.readFileSync(filePath);
  assert(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, `File ${path.basename(filePath)} must have UTF-8 BOM`);
  console.log(`  ✅ ${path.basename(filePath)} certified UTF-8 with BOM`);
});

// ===========================================================================
// Battery 2: Dedicated Sibling Bento Containers DOM Architecture
// ===========================================================================
console.log('\nBattery 2: Dedicated Sibling Bento Containers DOM Architecture in dashboard.html');
assert(!html.includes('class="audio-eq-split-deck"'), 'Obsolete .audio-eq-split-deck must be eliminated');
assert(!html.includes('class="eq-deck-left-col"'), 'Obsolete .eq-deck-left-col must be eliminated');
assert(!html.includes('class="eq-deck-right-col"'), 'Obsolete .eq-deck-right-col must be eliminated');
console.log('  ✅ Obsolete split deck classes cleanly eliminated');

assert(html.includes('<div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-6">'), '#heroAudioEqCard must be standalone bento-span-6 card');
assert(html.includes('<div id="heroAudioLabCard" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-6">'), '#heroAudioLabCard must be standalone bento-span-6 card');
console.log('  ✅ Both #heroAudioEqCard and #heroAudioLabCard certified as independent bento-span-6 sibling cards');

// Extract Equalizer Bento Card
const eqCardMatch = html.match(/<div id="heroAudioEqCard"[^>]*>([\s\S]*?)<\/div>\s*<!-- Bento Card 2/);
assert(eqCardMatch, 'Equalizer card #heroAudioEqCard must be extracted cleanly');
const eqCardHtml = eqCardMatch[1];

// Extract Audio Lab Bento Card
const labCardMatch = html.match(/<div id="heroAudioLabCard"[^>]*>([\s\S]*?)<\/div>\s*<!-- Media Playback/);
assert(labCardMatch, 'Audio Lab card #heroAudioLabCard must be extracted cleanly');
const labCardHtml = labCardMatch[1];

// ===========================================================================
// Battery 3: Dedicated Equalizer Bento Card Invariants
// ===========================================================================
console.log('\nBattery 3: Dedicated Equalizer Card (#heroAudioEqCard) Invariants');
const eqRequiredIds = [
  'lblAudioEqTitle',
  'audioEqPresetSelect',
  'btnResetEq',
  'eqBand60', 'eqVal60',
  'eqBand250', 'eqVal250',
  'eqBand1000', 'eqVal1000',
  'eqBand4000', 'eqVal4000',
  'eqBand16000', 'eqVal16000'
];
eqRequiredIds.forEach(id => {
  assert(eqCardHtml.includes(`id="${id}"`), `Equalizer card must contain #${id}`);
  console.log(`  ✅ Equalizer Card contains #${id}`);
});
assert(eqCardHtml.includes('class="eq-badge-specs"'), 'Equalizer card must contain .eq-badge-specs');
assert(eqCardHtml.includes('data-i18n="audiolab_eq_title"'), 'lblAudioEqTitle must bind audiolab_eq_title');
assert(eqCardHtml.includes('data-i18n="audiolab_reset_eq"'), 'btnResetEq must bind audiolab_reset_eq');

// ===========================================================================
// Battery 4: Dedicated Audio Lab & DSP Bento Card Invariants
// ===========================================================================
console.log('\nBattery 4: Dedicated Audio Lab Card (#heroAudioLabCard) Invariants');
const labRequiredIds = [
  'audioLabTitle',
  'audioLabStatusText',
  'audioLabPresetBadge',
  'audioLabVocalBadge',
  'audioLabNightBadge',
  'lblAudioMasterBoost',
  'heroAudioBoostSlider',
  'heroAudioBoostVal',
  'toggleVocalClarity',
  'lblAudioVocalTitle',
  'lblAudioVocalDesc',
  'toggleNightShield',
  'lblAudioNightTitle',
  'lblAudioNightDesc',
  'toggleAudioOnlyMode',
  'lblAudioOnlyTitle',
  'lblAudioOnlyDesc'
];
labRequiredIds.forEach(id => {
  assert(labCardHtml.includes(`id="${id}"`), `Audio Lab card must contain #${id}`);
  console.log(`  ✅ Audio Lab Card contains #${id}`);
});
assert(labCardHtml.includes('data-i18n="audiolab_title"'), 'audioLabTitle must bind audiolab_title');
assert(labCardHtml.includes('data-i18n="audiolab_dsp_active"'), 'audioLabStatusText must bind audiolab_dsp_active');
assert(labCardHtml.includes('data-i18n="audiolab_master_boost"'), 'lblAudioMasterBoost must bind audiolab_master_boost');

// ===========================================================================
// Battery 5: W3C Trusted Types & Security Invariants
// ===========================================================================
console.log('\nBattery 5: W3C Trusted Types & Security Invariants');
const inlineEventRegex = /\son(click|change|input|submit|mouseover|keydown|keyup)\s*=/i;
assert(!inlineEventRegex.test(eqCardHtml), 'Equalizer card must contain 0 inline event handlers');
assert(!inlineEventRegex.test(labCardHtml), 'Audio Lab card must contain 0 inline event handlers');
console.log('  ✅ 0 inline event handlers in Equalizer & Audio Lab cards');

// ===========================================================================
// Battery 6: CSS Layout, Bento Grid & Responsive Invariants
// ===========================================================================
console.log('\nBattery 6: CSS Layout, Bento Grid & Responsive Invariants');
const requiredSelectors = [
  '#heroAudioEqCard',
  '#heroAudioLabCard',
  '#heroAudioLabCard .audio-lab-header',
  '#heroAudioLabCard .audio-lab-icon',
  '#heroAudioLabCard .enhancements-grid',
  '.audio-lab-heading',
  'body.theme-light #heroAudioEqCard',
  'body.theme-light #heroAudioLabCard'
];
requiredSelectors.forEach(sel => {
  assert(audioLabCss.includes(sel), `audio_lab.css must declare ${sel}`);
  assert(css.includes(sel), `dashboard.css must declare ${sel}`);
  console.log(`  ✅ Selector "${sel}" verified in audio_lab.css and dashboard.css`);
});

// Check that obsolete split-deck selectors are eliminated
const obsoleteSelectors = [
  '.audio-eq-split-deck',
  '.eq-deck-left-col',
  '.eq-deck-right-col'
];
obsoleteSelectors.forEach(sel => {
  assert(!audioLabCss.includes(sel), `audio_lab.css must NOT declare ${sel}`);
  assert(!css.includes(sel), `dashboard.css must NOT declare ${sel}`);
  console.log(`  ✅ Obsolete selector "${sel}" certified removed from stylesheets`);
});

// Check responsive rules
assert(audioLabCss.includes('@media (max-width: 1024px)'), 'audio_lab.css must declare @media (max-width: 1024px)');
assert(css.includes('@media (max-width: 1024px)'), 'dashboard.css must declare @media (max-width: 1024px)');
console.log('  ✅ Responsive breakpoint @media (max-width: 1024px) verified in stylesheets');

console.log('\n===========================================================================');
console.log('🎉 ALL 6 BATTERIES IN PHASE 1 & 2 EQUALIZER PURE SPLIT SUITE PASSED (Grade A+)!');
console.log('===========================================================================\n');
