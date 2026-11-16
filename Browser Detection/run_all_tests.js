const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const testDir = path.resolve(__dirname, 'tests');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.js')).sort();

console.log(`\n============================================================`);
console.log(`RUNNING ALL TEST SUITES (${files.length} test files)`);
console.log(`============================================================\n`);

let passed = 0;
let failed = 0;
const failures = [];

const startTime = Date.now();

for (const file of files) {
  const filePath = path.join(testDir, file);
  process.stdout.write(`• Running ${file.padEnd(52)} `);
  try {
    execFileSync(process.execPath, [filePath], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8'
    });
    console.log(`[\x1b[32mPASS\x1b[0m]`);
    passed++;
  } catch (err) {
    console.log(`[\x1b[31mFAIL\x1b[0m]`);
    failed++;
    failures.push({ file, error: err.stderr || err.stdout || err.message });
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`\n============================================================`);
console.log(`TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (${elapsed}s)`);
console.log(`============================================================\n`);

if (failures.length > 0) {
  console.error('FAILURES:');
  failures.forEach(f => {
    console.error(`\n--- ${f.file} ---`);
    console.error(f.error);
  });
  process.exit(1);
} else {
  console.log(`\x1b[32mALL ${passed} TEST SUITES PASSED CLEANLY (Exit Code 0)\x1b[0m\n`);
  process.exit(0);
}
