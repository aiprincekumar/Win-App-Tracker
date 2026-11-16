// Script: scripts/build_uiux_prompts.js
// Purpose: Deterministically generate all UI/UX restoration prompt and memory files with UTF-8 BOM
const fs = require('fs');
const path = require('path');

function writeBomFile(relPath, content) {
  const absPath = path.resolve(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  const buffer = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from(content, 'utf8')]);
  fs.writeFileSync(absPath, buffer);
  console.log(`[BOM CERTIFIED] Wrote ${relPath} (${buffer.length} bytes)`);
}

module.exports = { writeBomFile };
