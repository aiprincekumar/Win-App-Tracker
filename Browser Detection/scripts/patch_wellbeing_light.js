// scripts/patch_wellbeing_light.js
'use strict';
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../dashboard/styles/wellbeing_light.css');
let content = fs.readFileSync(filePath, 'utf8');

// Helper to replace CRLF-safely
function safeReplace(source, oldBlock, newBlock) {
  const normOld = oldBlock.replace(/\r?\n/g, '\r\n');
  const normNew = newBlock.replace(/\r?\n/g, '\r\n');
  if (!source.includes(normOld)) {
    const normOldLF = oldBlock.replace(/\r?\n/g, '\n');
    if (!source.includes(normOldLF)) {
      console.warn('Could not find block:\n' + oldBlock.substring(0, 60));
      return source;
    }
    return source.replace(normOldLF, normNew.replace(/\r?\n/g, '\n'));
  }
  return source.replace(normOld, normNew);
}

// 1. Extenders
content = safeReplace(content,
`body.theme-light .dash-focus-extender-btn,
body.theme-light #btnFocusExtend5,
body.theme-light #btnFocusExtend15,
body.theme-light .dash-focus-extender-buttons .dash-focus-extender-btn,
[data-theme="light"] .dash-focus-extender-btn,
[data-theme="light"] #btnFocusExtend5,
[data-theme="light"] #btnFocusExtend15,
[data-theme="light"] .dash-focus-extender-buttons .dash-focus-extender-btn {`,
`body.theme-light .dash-focus-extender-btn, body.theme-light #btnFocusExtend5, body.theme-light #btnFocusExtend15, body.theme-light .dash-focus-extender-buttons .dash-focus-extender-btn,
[data-theme="light"] .dash-focus-extender-btn, [data-theme="light"] #btnFocusExtend5, [data-theme="light"] #btnFocusExtend15, [data-theme="light"] .dash-focus-extender-buttons .dash-focus-extender-btn {`);

content = safeReplace(content,
`body.theme-light .dash-focus-extender-btn:hover,
body.theme-light #btnFocusExtend5:hover,
body.theme-light #btnFocusExtend15:hover,
body.theme-light .dash-focus-extender-buttons .dash-focus-extender-btn:hover,
[data-theme="light"] .dash-focus-extender-btn:hover,
[data-theme="light"] #btnFocusExtend5:hover,
[data-theme="light"] #btnFocusExtend15:hover,
[data-theme="light"] .dash-focus-extender-buttons .dash-focus-extender-btn:hover {`,
`body.theme-light .dash-focus-extender-btn:hover, body.theme-light #btnFocusExtend5:hover, body.theme-light #btnFocusExtend15:hover, body.theme-light .dash-focus-extender-buttons .dash-focus-extender-btn:hover,
[data-theme="light"] .dash-focus-extender-btn:hover, [data-theme="light"] #btnFocusExtend5:hover, [data-theme="light"] #btnFocusExtend15:hover, [data-theme="light"] .dash-focus-extender-buttons .dash-focus-extender-btn:hover {`);

content = safeReplace(content,
`body.theme-light .dash-sleep-extender-btn,
body.theme-light #btnDashSleepExtend5,
body.theme-light #btnDashSleepExtend15,
body.theme-light .dash-sleep-extender-buttons .dash-sleep-extender-btn,
[data-theme="light"] .dash-sleep-extender-btn,
[data-theme="light"] #btnDashSleepExtend5,
[data-theme="light"] #btnDashSleepExtend15,
[data-theme="light"] .dash-sleep-extender-buttons .dash-sleep-extender-btn {`,
`body.theme-light .dash-sleep-extender-btn, body.theme-light #btnDashSleepExtend5, body.theme-light #btnDashSleepExtend15, body.theme-light .dash-sleep-extender-buttons .dash-sleep-extender-btn,
[data-theme="light"] .dash-sleep-extender-btn, [data-theme="light"] #btnDashSleepExtend5, [data-theme="light"] #btnDashSleepExtend15, [data-theme="light"] .dash-sleep-extender-buttons .dash-sleep-extender-btn {`);

content = safeReplace(content,
`body.theme-light .dash-sleep-extender-btn:hover,
body.theme-light #btnDashSleepExtend5:hover,
body.theme-light #btnDashSleepExtend15:hover,
body.theme-light .dash-sleep-extender-buttons .dash-sleep-extender-btn:hover,
[data-theme="light"] .dash-sleep-extender-btn:hover,
[data-theme="light"] #btnDashSleepExtend5:hover,
[data-theme="light"] #btnDashSleepExtend15:hover,
[data-theme="light"] .dash-sleep-extender-buttons .dash-sleep-extender-btn:hover {`,
`body.theme-light .dash-sleep-extender-btn:hover, body.theme-light #btnDashSleepExtend5:hover, body.theme-light #btnDashSleepExtend15:hover, body.theme-light .dash-sleep-extender-buttons .dash-sleep-extender-btn:hover,
[data-theme="light"] .dash-sleep-extender-btn:hover, [data-theme="light"] #btnDashSleepExtend5:hover, [data-theme="light"] #btnDashSleepExtend15:hover, [data-theme="light"] .dash-sleep-extender-buttons .dash-sleep-extender-btn:hover {`);

// 2. Secondary Pomodoro action buttons
content = safeReplace(content,
`body.theme-light .btn-focus-secondary,
body.theme-light #btnResetPomodoro,
body.theme-light #btnPausePomodoro,
[data-theme="light"] .btn-focus-secondary,
[data-theme="light"] #btnResetPomodoro,
[data-theme="light"] #btnPausePomodoro {`,
`body.theme-light .btn-focus-secondary, body.theme-light #btnResetPomodoro, body.theme-light #btnPausePomodoro,
[data-theme="light"] .btn-focus-secondary, [data-theme="light"] #btnResetPomodoro, [data-theme="light"] #btnPausePomodoro {`);

content = safeReplace(content,
`body.theme-light .btn-focus-secondary:hover,
body.theme-light #btnResetPomodoro:hover,
body.theme-light #btnPausePomodoro:hover,
[data-theme="light"] .btn-focus-secondary:hover,
[data-theme="light"] #btnResetPomodoro:hover,
[data-theme="light"] #btnPausePomodoro:hover {`,
`body.theme-light .btn-focus-secondary:hover, body.theme-light #btnResetPomodoro:hover, body.theme-light #btnPausePomodoro:hover,
[data-theme="light"] .btn-focus-secondary:hover, [data-theme="light"] #btnResetPomodoro:hover, [data-theme="light"] #btnPausePomodoro:hover {`);

// 3. Chime controls
content = safeReplace(content,
`body.theme-light .styled-select.chime-select,
body.theme-light #selectFocusChimeTone,
[data-theme="light"] .styled-select.chime-select,
[data-theme="light"] #selectFocusChimeTone {`,
`body.theme-light .styled-select.chime-select, body.theme-light #selectFocusChimeTone,
[data-theme="light"] .styled-select.chime-select, [data-theme="light"] #selectFocusChimeTone {`);

content = safeReplace(content,
`body.theme-light .btn-chime-preview,
body.theme-light #btnPreviewChime,
[data-theme="light"] .btn-chime-preview,
[data-theme="light"] #btnPreviewChime {`,
`body.theme-light .btn-chime-preview, body.theme-light #btnPreviewChime,
[data-theme="light"] .btn-chime-preview, [data-theme="light"] #btnPreviewChime {`);

content = safeReplace(content,
`body.theme-light .btn-chime-preview:hover,
body.theme-light #btnPreviewChime:hover,
[data-theme="light"] .btn-chime-preview:hover,
[data-theme="light"] #btnPreviewChime:hover {`,
`body.theme-light .btn-chime-preview:hover, body.theme-light #btnPreviewChime:hover,
[data-theme="light"] .btn-chime-preview:hover, [data-theme="light"] #btnPreviewChime:hover {`);

// 4. Focus toggles
content = safeReplace(content,
`body.theme-light .dash-focus-toggles-container .dash-focus-toggle-row,
body.theme-light .dash-focus-toggle-row,
body.theme-light .dash-advanced-toggles-grid .control-toggle-item,
[data-theme="light"] .dash-focus-toggles-container .dash-focus-toggle-row,
[data-theme="light"] .dash-focus-toggle-row,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item {`,
`body.theme-light .dash-focus-toggles-container .dash-focus-toggle-row, body.theme-light .dash-focus-toggle-row, body.theme-light .dash-advanced-toggles-grid .control-toggle-item,
[data-theme="light"] .dash-focus-toggles-container .dash-focus-toggle-row, [data-theme="light"] .dash-focus-toggle-row, [data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item {`);

content = safeReplace(content,
`body.theme-light .dash-focus-toggle-row:hover,
body.theme-light .dash-advanced-toggles-grid .control-toggle-item:hover,
[data-theme="light"] .dash-focus-toggle-row:hover,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item:hover {`,
`body.theme-light .dash-focus-toggle-row:hover, body.theme-light .dash-advanced-toggles-grid .control-toggle-item:hover,
[data-theme="light"] .dash-focus-toggle-row:hover, [data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item:hover {`);

content = safeReplace(content,
`body.theme-light .dash-focus-toggle-row .toggle-title,
body.theme-light .dash-advanced-toggles-grid .control-toggle-item .toggle-title,
[data-theme="light"] .dash-focus-toggle-row .toggle-title,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item .toggle-title {`,
`body.theme-light .dash-focus-toggle-row .toggle-title, body.theme-light .dash-advanced-toggles-grid .control-toggle-item .toggle-title,
[data-theme="light"] .dash-focus-toggle-row .toggle-title, [data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item .toggle-title {`);

content = safeReplace(content,
`body.theme-light .dash-focus-toggle-row .toggle-desc,
body.theme-light .dash-advanced-toggles-grid .control-toggle-item .toggle-desc,
[data-theme="light"] .dash-focus-toggle-row .toggle-desc,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item .toggle-desc {`,
`body.theme-light .dash-focus-toggle-row .toggle-desc, body.theme-light .dash-advanced-toggles-grid .control-toggle-item .toggle-desc,
[data-theme="light"] .dash-focus-toggle-row .toggle-desc, [data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item .toggle-desc {`);

// 5. Stepper input & goal input
content = safeReplace(content,
`body.theme-light .focus-custom-minute-stepper .stepper-input,
body.theme-light #inputFocusCustomMinutes,
[data-theme="light"] .focus-custom-minute-stepper .stepper-input,
[data-theme="light"] #inputFocusCustomMinutes {`,
`body.theme-light .focus-custom-minute-stepper .stepper-input, body.theme-light #inputFocusCustomMinutes,
[data-theme="light"] .focus-custom-minute-stepper .stepper-input, [data-theme="light"] #inputFocusCustomMinutes {`);

content = safeReplace(content,
`body.theme-light .focus-custom-minute-stepper .btn-stepper-apply,
body.theme-light #btnApplyCustomMinutes,
[data-theme="light"] .focus-custom-minute-stepper .btn-stepper-apply,
[data-theme="light"] #btnApplyCustomMinutes {`,
`body.theme-light .focus-custom-minute-stepper .btn-stepper-apply, body.theme-light #btnApplyCustomMinutes,
[data-theme="light"] .focus-custom-minute-stepper .btn-stepper-apply, [data-theme="light"] #btnApplyCustomMinutes {`);

content = safeReplace(content,
`body.theme-light .focus-custom-minute-stepper .btn-stepper-apply:hover,
body.theme-light #btnApplyCustomMinutes:hover,
[data-theme="light"] .focus-custom-minute-stepper .btn-stepper-apply:hover,
[data-theme="light"] #btnApplyCustomMinutes:hover {`,
`body.theme-light .focus-custom-minute-stepper .btn-stepper-apply:hover, body.theme-light #btnApplyCustomMinutes:hover,
[data-theme="light"] .focus-custom-minute-stepper .btn-stepper-apply:hover, [data-theme="light"] #btnApplyCustomMinutes:hover {`);

content = safeReplace(content,
`body.theme-light .focus-goal-input,
body.theme-light #inputFocusGoal,
[data-theme="light"] .focus-goal-input,
[data-theme="light"] #inputFocusGoal {`,
`body.theme-light .focus-goal-input, body.theme-light #inputFocusGoal,
[data-theme="light"] .focus-goal-input, [data-theme="light"] #inputFocusGoal {`);

const buf = Buffer.from(content, 'utf8');
const finalBuf = (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf)
  ? buf
  : Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), buf]);

fs.writeFileSync(filePath, finalBuf);
const totalLines = content.split('\n').length;
console.log(`Updated wellbeing_light.css: total lines = ${totalLines} (Max 500)`);
