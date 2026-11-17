/**
 * Phase 1 & Phase 2 Dedicated Test Suite: 5-Band Equalizer & Audio Lab Separation
 * Token: AUTH-MGR-20261117-EQ-SEPARATION-001
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Phase 1 & 2 Equalizer & Audio Lab Layout Separation Test Suite...\n');

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
// Battery 2: 2-Column Split Deck DOM Architecture
// ===========================================================================
console.log('\nBattery 2: 2-Column Split Deck DOM Architecture in dashboard.html');
assert(html.includes('class="audio-eq-split-deck"'), '#heroAudioEqCard must contain .audio-eq-split-deck');
assert(html.includes('class="eq-deck-left-col"'), '.audio-eq-split-deck must contain .eq-deck-left-col');
assert(html.includes('class="eq-deck-right-col"'), '.audio-eq-split-deck must contain .eq-deck-right-col');
console.log('  ✅ .audio-eq-split-deck, .eq-deck-left-col, and .eq-deck-right-col verified present');

// Extract Left Column
const leftColMatch = html.match(/<div class="eq-deck-left-col">([\s\S]*?)<\/div>\s*<!-- RIGHT Container/);
assert(leftColMatch, 'Left column must be extracted cleanly');
const leftColHtml = leftColMatch[1];

// Extract Right Column
const rightColMatch = html.match(/<div class="eq-deck-right-col">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<!-- Media Playback/);
assert(rightColMatch, 'Right column must be extracted cleanly');
const rightColHtml = rightColMatch[1];

// Verify Left Column Elements
console.log('\nBattery 3: Left Column (5-Band Graphic Equalizer) Invariants');
const leftRequiredIds = [
  'lblAudioEqTitle',
  'audioEqPresetSelect',
  'btnResetEq',
  'eqBand60', 'eqVal60',
  'eqBand250', 'eqVal250',
  'eqBand1000', 'eqVal1000',
  'eqBand4000', 'eqVal4000',
  'eqBand16000', 'eqVal16000'
];
leftRequiredIds.forEach(id => {
  assert(leftColHtml.includes(`id="${id}"`), `Left column must contain #${id}`);
  console.log(`  ✅ Left Column contains #${id}`);
});
assert(leftColHtml.includes('class="eq-badge-specs"'), 'Left column must contain .eq-badge-specs');
assert(leftColHtml.includes('data-i18n="audiolab_eq_title"'), 'lblAudioEqTitle must bind audiolab_eq_title');
assert(leftColHtml.includes('data-i18n="audiolab_reset_eq"'), 'btnResetEq must bind audiolab_reset_eq');

// Verify Right Column Elements
console.log('\nBattery 4: Right Column (Audio Lab & DSP Enhancements) Invariants');
const rightRequiredIds = [
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
rightRequiredIds.forEach(id => {
  assert(rightColHtml.includes(`id="${id}"`), `Right column must contain #${id}`);
  console.log(`  ✅ Right Column contains #${id}`);
});
assert(rightColHtml.includes('data-i18n="audiolab_title"'), 'audioLabTitle must bind audiolab_title');
assert(rightColHtml.includes('data-i18n="audiolab_dsp_active"'), 'audioLabStatusText must bind audiolab_dsp_active');
assert(rightColHtml.includes('data-i18n="audiolab_master_boost"'), 'lblAudioMasterBoost must bind audiolab_master_boost');

// ===========================================================================
// Battery 5: W3C Trusted Types & Security Invariants
// ===========================================================================
console.log('\nBattery 5: W3C Trusted Types & Security Invariants');
const inlineEventRegex = /\son(click|change|input|submit|mouseover|keydown|keyup)\s*=/i;
assert(!inlineEventRegex.test(leftColHtml), 'Left column must contain 0 inline event handlers');
assert(!inlineEventRegex.test(rightColHtml), 'Right column must contain 0 inline event handlers');
console.log('  ✅ 0 inline event handlers in Left & Right columns');

// ===========================================================================
// Battery 6: CSS Layout, Split Deck Grid & Materiality Invariants
// ===========================================================================
console.log('\nBattery 6: CSS Layout, Split Deck Grid & Materiality Invariants');
const requiredSelectors = [
  '.audio-eq-split-deck',
  '.eq-deck-left-col',
  '.eq-deck-right-col',
  '.audio-lab-heading',
  'body.theme-light .eq-deck-left-col',
  'body.theme-light .audio-lab-heading'
];
requiredSelectors.forEach(sel => {
  assert(audioLabCss.includes(sel), `audio_lab.css must declare ${sel}`);
  assert(css.includes(sel), `dashboard.css must declare ${sel}`);
  console.log(`  ✅ Selector "${sel}" verified in audio_lab.css and dashboard.css`);
});

// Check responsive rules
assert(audioLabCss.includes('@media (max-width: 1024px)'), 'audio_lab.css must declare @media (max-width: 1024px)');
assert(css.includes('@media (max-width: 1024px)'), 'dashboard.css must declare @media (max-width: 1024px)');
console.log('  ✅ Responsive breakpoint @media (max-width: 1024px) verified in stylesheets');

console.log('\n===========================================================================');
console.log('🎉 ALL 6 BATTERIES IN PHASE 1 & 2 EQUALIZER SEPARATION SUITE PASSED (Grade A+)!');
console.log('===========================================================================\n');
