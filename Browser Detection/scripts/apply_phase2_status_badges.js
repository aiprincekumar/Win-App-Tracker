// scripts/apply_phase2_status_badges.js
// Autonomous patch script for Phase 2: Popup Status Badges Contrast Overhaul
'use strict';

const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

function writeWithBom(filePath, text) {
  const buf = Buffer.from(text, 'utf8');
  const finalBuf = (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf)
    ? buf
    : Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), buf]);
  fs.writeFileSync(filePath, finalBuf);
}

// 1. Update themes.css & light_contrast.css
const dotSnippet = [
  '',
  '[data-theme="light"] .dynamic-status-btn.idle .status-dot {',
  '  background: #64748b;',
  '  box-shadow: none;',
  '}',
  '',
  '[data-theme="light"] .dynamic-status-btn.playing .status-dot {',
  '  background: #059669;',
  '  box-shadow: 0 0 6px rgba(5, 150, 105, 0.4);',
  '}',
  '',
  '[data-theme="light"] .dynamic-status-btn.paused .status-dot {',
  '  background: #d97706;',
  '}',
  '',
  '[data-theme="light"] .dynamic-status-btn.buffering .status-dot {',
  '  background: #0891b2;',
  '  box-shadow: 0 0 6px rgba(8, 145, 178, 0.4);',
  '}',
  '',
  '[data-theme="light"] .dynamic-status-btn.muted .status-dot {',
  '  background: #7c3aed;',
  '}',
  '',
  '[data-theme="light"] .dynamic-status-btn.stopped .status-dot {',
  '  background: #64748b;',
  '}'
].join('\r\n');

const themeFiles = [
  path.join(baseDir, 'popup/styles/themes.css'),
  path.join(baseDir, 'popup/styles/themes/light_contrast.css')
];

themeFiles.forEach(tf => {
  let content = fs.readFileSync(tf, 'utf8');
  if (content.includes('.dynamic-status-btn.idle .status-dot')) {
    console.log(`Already patched: ${tf}`);
    return;
  }
  const needle = '[data-theme="light"] .dynamic-status-btn.stopped {\r\n  background: #f1f5f9;\r\n  border-color: #cbd5e1;\r\n  color: #475569;\r\n}';
  const needleLF = needle.replace(/\r\n/g, '\n');
  if (content.includes(needle)) {
    content = content.replace(needle, needle + '\r\n' + dotSnippet);
  } else if (content.includes(needleLF)) {
    content = content.replace(needleLF, needleLF + '\n' + dotSnippet.replace(/\r\n/g, '\n'));
  } else {
    console.error(`Could not find anchor in ${tf}`);
    process.exit(1);
  }
  writeWithBom(tf, content);
  console.log(`Successfully updated: ${tf}`);
});

// 2. Update popup/styles/tabs/tab_sleep.css
const sleepFile = path.join(baseDir, 'popup/styles/tabs/tab_sleep.css');
let sleepContent = fs.readFileSync(sleepFile, 'utf8');
if (!sleepContent.includes('.sleep-status-badge.idle')) {
  console.error('sleep-status-badge not found in tab_sleep.css');
  process.exit(1);
}

if (!sleepContent.includes('[data-theme="light"] .sleep-status-badge.idle')) {
  const sleepBadgeRules = [
    '',
    '/* ==========================================================================',
    '   Light Mode Sleep Status Badge Contrast Overhaul (Phase 2)',
    '   ========================================================================== */',
    '[data-theme="light"] .sleep-status-badge.idle,',
    '[data-theme="light"] #sleepDialStatusBadge.idle {',
    '  background: #f1f5f9;',
    '  border-color: #cbd5e1;',
    '  color: #475569;',
    '}',
    '',
    '[data-theme="light"] .sleep-status-badge.running,',
    '[data-theme="light"] #sleepDialStatusBadge.running {',
    '  background: rgba(99, 102, 241, 0.12);',
    '  border-color: rgba(99, 102, 241, 0.4);',
    '  color: #3730a3;',
    '  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.15);',
    '}',
    '',
    '[data-theme="light"] .sleep-status-badge.paused,',
    '[data-theme="light"] #sleepDialStatusBadge.paused {',
    '  background: rgba(245, 158, 11, 0.12);',
    '  border-color: rgba(245, 158, 11, 0.4);',
    '  color: #92400e;',
    '}',
    '',
    '[data-theme="light"] .sleep-status-badge.fading,',
    '[data-theme="light"] #sleepDialStatusBadge.fading {',
    '  background: rgba(245, 158, 11, 0.15);',
    '  border-color: rgba(245, 158, 11, 0.4);',
    '  color: #92400e;',
    '}',
    '',
    '[data-theme="light"] .sleep-status-badge.triggered,',
    '[data-theme="light"] #sleepDialStatusBadge.triggered {',
    '  background: rgba(239, 68, 68, 0.12);',
    '  border-color: rgba(239, 68, 68, 0.4);',
    '  color: #991b1b;',
    '}',
    ''
  ].join('\r\n');

  sleepContent = sleepContent.trimEnd() + '\r\n' + sleepBadgeRules;
  writeWithBom(sleepFile, sleepContent);
  console.log(`Successfully updated: ${sleepFile}`);
} else {
  console.log(`Already patched: ${sleepFile}`);
}

// 3. Update popup/styles/tabs/tab_wellness.css
const wellnessFile = path.join(baseDir, 'popup/styles/tabs/tab_wellness.css');
let wellnessContent = fs.readFileSync(wellnessFile, 'utf8');

if (!wellnessContent.includes('[data-theme="light"] .popup-focus-badge.idle')) {
  const focusBadgeRules = [
    '',
    '/* ==========================================================================',
    '   Light Mode Focus & Doomscroll Status Badge Contrast Overhaul (Phase 2)',
    '   ========================================================================== */',
    '[data-theme="light"] .popup-focus-badge.idle,',
    '[data-theme="light"] #popupFocusBadge.idle {',
    '  background: #f1f5f9;',
    '  border-color: #cbd5e1;',
    '  color: #475569;',
    '}',
    '',
    '[data-theme="light"] .popup-focus-badge.running,',
    '[data-theme="light"] #popupFocusBadge.running {',
    '  background: rgba(16, 185, 129, 0.12);',
    '  border-color: rgba(16, 185, 129, 0.4);',
    '  color: #065f46;',
    '}',
    '',
    '[data-theme="light"] .popup-focus-badge.break,',
    '[data-theme="light"] #popupFocusBadge.break {',
    '  background: rgba(6, 182, 212, 0.12);',
    '  border-color: rgba(6, 182, 212, 0.4);',
    '  color: #0e7490;',
    '}',
    '',
    '[data-theme="light"] .popup-focus-badge.paused,',
    '[data-theme="light"] #popupFocusBadge.paused {',
    '  background: rgba(245, 158, 11, 0.12);',
    '  border-color: rgba(245, 158, 11, 0.4);',
    '  color: #92400e;',
    '}',
    '',
    '[data-theme="light"] .doomscroll-status-badge.standby .doomscroll-status-dot,',
    '[data-theme="light"] #doomscrollStatusBadge.standby .doomscroll-status-dot {',
    '  background: #64748b;',
    '}',
    ''
  ].join('\r\n');

  wellnessContent = wellnessContent.trimEnd() + '\r\n' + focusBadgeRules;
  writeWithBom(wellnessFile, wellnessContent);
  console.log(`Successfully updated: ${wellnessFile}`);
} else {
  console.log(`Already patched: ${wellnessFile}`);
}

console.log('All Phase 2 popup status badges patched successfully!');
