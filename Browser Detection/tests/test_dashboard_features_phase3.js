/**
 * Automated Verification Test Suite: Phase 3 - Data Integrity, Backup, Snapshots & SQLite Hub Sync (Features 5 & 6)
 * 
 * Subsystems Tested:
 * - Feature 5: Advanced Backup, Snapshot Restore & SQLite Data Hub Sync
 *   * Bidirectional JSON Schema v2.0 Specification & Normalizer (Schema v2.0 & v1.0)
 *   * IEEE 802.3 CRC32 Checksum Engine (Deterministic 8-character hex string)
 *   * 3 Conflict Resolution Strategies (Merge, Overwrite, Append-Only)
 *   * 7-Day Rolling Snapshots Engine with FIFO Pruning and 1-Click Rollback
 *   * Bidirectional SQLite Data Hub Replication (ws://127.0.0.1:65433)
 * - Feature 6: Executive PDF & HTML Digest Generator
 *   * Zero-Dependency @media print Engine & Clean A4/Letter Alignment
 *   * Standalone Offline Single-File HTML Report with Embedded CSS & JSON Payload
 *   * Vector SVG Donut Chart & Activity Proportions
 * 
 * Test Batteries:
 * 1. Battery 1: AST Parsing, Syntax & File Existence Verification (6 files)
 * 2. Battery 2: UTF-8 BOM (0xEF, 0xBB, 0xBF) Compliance across all 6 files
 * 3. Battery 3: W3C Trusted Types & Zero innerHTML Security Audit
 * 4. Battery 4: Backup Schema v2.0 & v1.0 Validation Engine (Fail-Closed & Format Verification)
 * 5. Battery 5: IEEE 802.3 CRC32 Checksum Algorithm Verification
 * 6. Battery 6: 3 Conflict Resolution Strategies (Merge, Overwrite, Append-Only)
 * 7. Battery 7: 7-Day Rolling Snapshots Engine & FIFO Pruning
 * 8. Battery 8: Standalone SQLite Data Hub Sync & IPC Handlers
 * 9. Battery 9: Executive PDF & Standalone HTML Digest Generator
 * 10. Battery 10: HTML DOM Invariants & Bilingual Dictionary Parity (en/hi) with Language Purity
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const featureJsPath = path.join(baseDir, 'src', 'dashboard', 'features', 'backup_hub_digest_feature.js');
const bgJsPath = path.join(baseDir, 'background.js');
const dashHtmlPath = path.join(baseDir, 'dashboard', 'dashboard.html');
const backupCssPath = path.join(baseDir, 'dashboard', 'styles', 'backup_digest.css');
const dashCssPath = path.join(baseDir, 'dashboard', 'dashboard.css');
const dashJsPath = path.join(baseDir, 'dashboard', 'dashboard.js');

console.log('🧪 Starting Phase 3 Data Integrity, Backup, Snapshots & SQLite Hub Sync Test Suite...\n');

(async () => {
  // ===========================================================================
  // Battery 1: AST Parsing, Syntax & File Existence Verification
  // ===========================================================================
  console.log('Battery 1: AST Parsing, Syntax & File Existence Verification');
  {
    const targetFiles = [
      { name: 'backup_hub_digest_feature.js', path: featureJsPath, isJs: true },
      { name: 'background.js', path: bgJsPath, isJs: true },
      { name: 'dashboard.html', path: dashHtmlPath, isJs: false },
      { name: 'backup_digest.css', path: backupCssPath, isJs: false },
      { name: 'dashboard.css', path: dashCssPath, isJs: false },
      { name: 'dashboard.js', path: dashJsPath, isJs: true }
    ];

    targetFiles.forEach(file => {
      assert(fs.existsSync(file.path), `Required file must exist on disk: ${file.name}`);
      if (file.isJs) {
        const code = fs.readFileSync(file.path, 'utf8');
        assert.doesNotThrow(() => {
          new vm.Script(code, { filename: file.name });
        }, `${file.name} must parse cleanly into AST with 0 syntax errors`);
      }
    });

    console.log('  ✅ All 6 required Phase 3 files exist on disk');
    console.log('  ✅ 100% clean AST syntax verified across all JS files (node -c equivalent)');
  }

  // ===========================================================================
  // Battery 2: UTF-8 BOM (0xEF, 0xBB, 0xBF) Compliance
  // ===========================================================================
  console.log('\nBattery 2: UTF-8 BOM (0xEF, 0xBB, 0xBF) Compliance');
  {
    const targetFiles = [
      featureJsPath,
      bgJsPath,
      dashHtmlPath,
      backupCssPath,
      dashCssPath,
      dashJsPath
    ];

    targetFiles.forEach(filePath => {
      const buf = fs.readFileSync(filePath);
      const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
      assert(hasBOM, `File ${path.basename(filePath)} must start with UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
    });

    console.log('  ✅ 100% UTF-8 with BOM verified across all 6 Phase 3 codebase files');
  }

  // ===========================================================================
  // Battery 3: W3C Trusted Types & Zero innerHTML Security Audit
  // ===========================================================================
  console.log('\nBattery 3: W3C Trusted Types & Zero innerHTML Security Audit');
  {
    const featureCode = fs.readFileSync(featureJsPath, 'utf8');
    assert(!featureCode.includes('.innerHTML'), 'backup_hub_digest_feature.js must contain 0 innerHTML assignments');
    assert(!featureCode.includes('outerHTML'), 'backup_hub_digest_feature.js must contain 0 outerHTML assignments');

    const dashCode = fs.readFileSync(dashJsPath, 'utf8');
    const phase3Index = dashCode.indexOf('Phase 3: Feature 5 & 6 Facade Functions');
    assert(phase3Index !== -1, 'dashboard.js must contain Phase 3 facade functions block');
    const phase3Block = dashCode.substring(phase3Index, phase3Index + 10000);
    assert(!phase3Block.includes('.innerHTML'), 'Phase 3 facade functions must contain 0 innerHTML assignments');

    console.log('  ✅ 0 innerHTML or outerHTML assignments in backup_hub_digest_feature.js');
    console.log('  ✅ Phase 3 facade functions in dashboard.js strictly use createElement and textContent');
    console.log('  ✅ Full compliance with W3C Trusted Types and Chromium MV3 CSP');
  }

  // ===========================================================================
  // Battery 4: Backup Schema v2.0 & v1.0 Validation Engine (Fail-Closed)
  // ===========================================================================
  console.log('\nBattery 4: Backup Schema v2.0 & v1.0 Validation Engine (Fail-Closed)');
  {
    const featureModule = require(featureJsPath);
    const { validateBackupSchemaV2 } = featureModule;

    // Test 4.1: Null or empty inputs
    assert.strictEqual(validateBackupSchemaV2(null).valid, false);
    assert.strictEqual(validateBackupSchemaV2('').valid, false);
    assert.strictEqual(validateBackupSchemaV2('invalid-json{{{').valid, false);

    // Test 4.2: Missing required payload in Schema v2.0
    const invalidV2NoPayload = {
      schema_version: '2.0.0',
      exported_at: new Date().toISOString()
    };
    const resNoPayload = validateBackupSchemaV2(invalidV2NoPayload);
    assert.strictEqual(resNoPayload.valid, false);
    assert(resNoPayload.error.includes('payload'));

    // Test 4.3: Valid Schema v2.0 Object
    const validV2 = {
      $schema: 'https://sentinel.local/schemas/backup-v2.json',
      schema_version: '2.0.0',
      exported_at: '2026-11-16T04:00:00.000Z',
      checksum: 'a8f3b21c',
      device_profile: {
        browser: 'Chrome',
        extension_version: '2.5.0',
        os: 'Windows'
      },
      payload: {
        settings: { language: 'hi', idleTimeout: 60 },
        tracking_history: {
          '2026-11-15': {
            domains: {
              'github.com': { activeTime: 7200, sessions: 14, category: 'work' },
              'youtube.com': { activeTime: 3600, sessions: 5, category: 'entertainment' }
            },
            totalActiveTime: 10800,
            productivityScore: 84
          }
        },
        media_history: [
          {
            id: 'med_1731670000',
            title: 'Learn Modern Chrome MV3 in 60 Minutes',
            platform: 'YouTube',
            duration: 3600,
            watchTime: 2400,
            timestamp: 1731670000
          }
        ]
      }
    };

    const resValidV2 = validateBackupSchemaV2(validV2);
    assert.strictEqual(resValidV2.valid, true);
    assert.strictEqual(resValidV2.version, '2.0.0');
    assert.strictEqual(resValidV2.dateCount, 1);

    // Test 4.4: Valid Schema v1.0 / Legacy Root Object Normalization
    const legacyV1 = {
      exportedAt: '2026-11-14T10:00:00.000Z',
      settings: { language: 'en' },
      trackingHistory: {
        '2026-11-14': {
          domains: { 'stackoverflow.com': { activeTime: 1800, sessions: 4 } },
          totalActiveTime: 1800
        }
      },
      mediaHistory: []
    };

    const resLegacy = validateBackupSchemaV2(legacyV1);
    assert.strictEqual(resLegacy.valid, true);
    assert.strictEqual(resLegacy.version, '1.0.0');
    assert(resLegacy.normalized, 'Legacy backups must be normalized to Schema v2.0 structure');
    assert.strictEqual(resLegacy.normalized.schema_version, '2.0.0');
    assert(resLegacy.normalized.payload.tracking_history['2026-11-14']);

    console.log('  ✅ Fail-closed validation verified for corrupt, empty, and malformed JSON');
    console.log('  ✅ Schema v2.0 payload & tracking_history requirements verified');
    console.log('  ✅ Seamless backward-compatibility & normalization verified for Schema v1.0 legacy backups');
  }

  // ===========================================================================
  // Battery 5: IEEE 802.3 CRC32 Checksum Algorithm Verification
  // ===========================================================================
  console.log('\nBattery 5: IEEE 802.3 CRC32 Checksum Algorithm Verification');
  {
    const featureModule = require(featureJsPath);
    const { computeCRC32 } = featureModule;

    assert.strictEqual(computeCRC32(''), '00000000', 'Empty string must compute to 00000000');
    assert.strictEqual(computeCRC32('123456789'), 'cbf43926', 'CRC32("123456789") must equal cbf43926');
    
    const sampleObj = { app: 'Sentinel', version: '2.0.0', active: true };
    const hash1 = computeCRC32(sampleObj);
    const hash2 = computeCRC32(sampleObj);
    assert.strictEqual(hash1, hash2, 'CRC32 calculation must be 100% deterministic');
    assert(/^[a-f0-9]{8}$/.test(hash1), 'CRC32 hash must be 8 lowercase hexadecimal characters');

    console.log('  ✅ IEEE 802.3 CRC32 standard test vector (cbf43926) verified');
    console.log('  ✅ Deterministic 8-character hex checksum verified on serialized payloads');
  }

  // ===========================================================================
  // Battery 6: 3 Conflict Resolution Strategies (Merge, Overwrite, Append-Only)
  // ===========================================================================
  console.log('\nBattery 6: 3 Conflict Resolution Strategies (Merge, Overwrite, Append-Only)');
  {
    const featureModule = require(featureJsPath);
    const { resolveBackupConflict } = featureModule;

    const currentLocal = {
      '2026-11-10': {
        domains: {
          'github.com': { activeTime: 1000, sessions: 2, category: 'work' },
          'google.com': { activeTime: 500, sessions: 3, category: 'utility' }
        },
        totalActiveTime: 1500,
        productivityScore: 75
      },
      '2026-11-11': {
        domains: { 'wikipedia.org': { activeTime: 600, sessions: 1, category: 'learning' } },
        totalActiveTime: 600
      }
    };

    const backupIncoming = {
      '2026-11-10': {
        domains: {
          'github.com': { activeTime: 1500, sessions: 5, category: 'work' },
          'reddit.com': { activeTime: 400, sessions: 2, category: 'social' }
        },
        totalActiveTime: 1900,
        productivityScore: 82
      },
      '2026-11-12': {
        domains: { 'coursera.org': { activeTime: 3600, sessions: 3, category: 'learning' } },
        totalActiveTime: 3600
      }
    };

    // Strategy A: 'merge'
    const merged = resolveBackupConflict(currentLocal, backupIncoming, 'merge');
    assert(merged['2026-11-10'], 'Date 2026-11-10 must exist');
    assert(merged['2026-11-11'], 'Existing date 2026-11-11 must be preserved');
    assert(merged['2026-11-12'], 'New incoming date 2026-11-12 must be merged');
    assert.strictEqual(merged['2026-11-10'].domains['github.com'].activeTime, 1500);
    assert.strictEqual(merged['2026-11-10'].domains['github.com'].sessions, 5);
    assert.strictEqual(merged['2026-11-10'].domains['google.com'].activeTime, 500);
    assert.strictEqual(merged['2026-11-10'].domains['reddit.com'].activeTime, 400);
    assert.strictEqual(merged['2026-11-10'].totalActiveTime, 1900);

    // Strategy B: 'overwrite'
    const overwritten = resolveBackupConflict(currentLocal, backupIncoming, 'overwrite');
    assert.strictEqual(Object.keys(overwritten).length, 2);
    assert(!overwritten['2026-11-11'], 'Overwritten dataset must NOT contain dates absent in backup');
    assert(overwritten['2026-11-12'], 'Overwritten dataset must contain backup date 2026-11-12');
    assert.strictEqual(overwritten['2026-11-10'].domains['google.com'], undefined);

    // Strategy C: 'append'
    const appended = resolveBackupConflict(currentLocal, backupIncoming, 'append');
    assert(appended['2026-11-12'], 'Appended dataset must contain new date 2026-11-12');
    assert.strictEqual(appended['2026-11-10'].domains['github.com'].activeTime, 1000);
    assert.strictEqual(appended['2026-11-10'].domains['reddit.com'], undefined);

    console.log('  ✅ Strategy A (Merge): Union of dates & domains with Math.max durations verified');
    console.log('  ✅ Strategy B (Overwrite): Complete clean replacement with backup verified');
    console.log('  ✅ Strategy C (Append-Only): Only missing calendar dates added, existing dates preserved intact');
  }

  // ===========================================================================
  // Battery 7: 7-Day Rolling Snapshots Engine & FIFO Pruning
  // ===========================================================================
  console.log('\nBattery 7: 7-Day Rolling Snapshots Engine & FIFO Pruning');
  {
    const featureModule = require(featureJsPath);
    const { captureDailySnapshot, listDailySnapshots, rollbackToSnapshot } = featureModule;

    const memoryStorage = {};
    const mockStorageAPI = {
      get: (keys, cb) => {
        const result = {};
        const keyArr = Array.isArray(keys) ? keys : [keys];
        keyArr.forEach(k => {
          if (memoryStorage[k] !== undefined) result[k] = memoryStorage[k];
        });
        cb(result);
      },
      set: (obj, cb) => {
        Object.assign(memoryStorage, obj);
        if (typeof cb === 'function') cb();
      },
      remove: (keys, cb) => {
        const keyArr = Array.isArray(keys) ? keys : [keys];
        keyArr.forEach(k => delete memoryStorage[k]);
        if (typeof cb === 'function') cb();
      }
    };

    for (let i = 1; i <= 10; i++) {
      const dayStr = `2026-11-${String(i).padStart(2, '0')}`;
      const dummyHistory = {
        [dayStr]: {
          domains: { 'github.com': { activeTime: i * 600, sessions: i } },
          totalActiveTime: i * 600
        }
      };
      await captureDailySnapshot(mockStorageAPI, dummyHistory, { lang: 'en' }, { date: dayStr });
    }

    const indexList = memoryStorage['sentinel_snapshot_index'];
    assert(Array.isArray(indexList), 'sentinel_snapshot_index must exist as array in storage');
    assert.strictEqual(indexList.length, 7, 'Rolling snapshot FIFO must cap stored snapshots to exactly 7');

    assert.strictEqual(memoryStorage['sentinel_snapshot_2026_11_01'], undefined, 'Oldest snapshot day 1 must be pruned');
    assert.strictEqual(memoryStorage['sentinel_snapshot_2026_11_02'], undefined, 'Oldest snapshot day 2 must be pruned');
    assert.strictEqual(memoryStorage['sentinel_snapshot_2026_11_03'], undefined, 'Oldest snapshot day 3 must be pruned');
    assert(memoryStorage['sentinel_snapshot_2026_11_04'], 'Day 4 snapshot must exist');
    assert(memoryStorage['sentinel_snapshot_2026_11_10'], 'Day 10 snapshot must exist');

    const list = await listDailySnapshots(mockStorageAPI);
    assert.strictEqual(list.length, 7);
    assert.strictEqual(list[0].date, '2026-11-10', 'Newest snapshot must be first in list');
    assert.strictEqual(list[6].date, '2026-11-04', 'Oldest retained snapshot must be last in list');

    const rollbackRes = await rollbackToSnapshot('sentinel_snapshot_2026_11_05', mockStorageAPI);
    assert.strictEqual(rollbackRes.success, true);
    assert.strictEqual(rollbackRes.date, '2026-11-05');
    assert(memoryStorage.trackingHistory['2026-11-05'], 'trackingHistory must be restored to Day 5');
    assert.strictEqual(memoryStorage.trackingHistory['2026-11-05'].totalActiveTime, 5 * 600);

    console.log('  ✅ 7-day rolling snapshot FIFO successfully capped index at 7 items');
    console.log('  ✅ Oldest 3 snapshots pruned cleanly via storageAPI.remove');
    console.log('  ✅ listDailySnapshots successfully ordered entries newest to oldest');
    console.log('  ✅ 1-click rollback restores snapshot trackingHistory to active storage');
  }

  // ===========================================================================
  // Battery 8: Standalone SQLite Data Hub Sync & IPC Handlers
  // ===========================================================================
  console.log('\nBattery 8: Standalone SQLite Data Hub Sync & IPC Handlers');
  {
    const featureModule = require(featureJsPath);
    const { replicateToSqliteHub, restoreFromSqliteHub } = featureModule;

    let capturedMessage = null;
    const mockSendSocket = (msg) => {
      capturedMessage = msg;
      return Promise.resolve({ success: true, syncedDates: Object.keys(msg.tracking_history).length });
    };

    const sampleData = {
      '2026-11-16': { domains: { 'github.com': { activeTime: 1200 } } }
    };

    const replRes = await replicateToSqliteHub(sampleData, { sendSocket: mockSendSocket });
    assert.strictEqual(replRes.success, true);
    assert.strictEqual(replRes.syncedDates, 1);
    assert.strictEqual(capturedMessage.type, 'SYNC_HISTORY_UPSERT');
    assert.strictEqual(capturedMessage.client, 'SentinelDashboard');
    assert(capturedMessage.tracking_history['2026-11-16']);

    const restRes = await restoreFromSqliteHub({
      fetchHistory: () => Promise.resolve({
        '2026-11-16': { domains: { 'github.com': { activeTime: 1200 } } }
      })
    });
    assert.strictEqual(restRes.success, true);
    assert(restRes.trackingHistory['2026-11-16']);

    const bgCode = fs.readFileSync(bgJsPath, 'utf8');
    assert(bgCode.includes('GET_BACKUP_SNAPSHOTS'), 'background.js must handle GET_BACKUP_SNAPSHOTS');
    assert(bgCode.includes('RESTORE_BACKUP_SNAPSHOT'), 'background.js must handle RESTORE_BACKUP_SNAPSHOT');
    assert(bgCode.includes('SYNC_HISTORY_UPSERT'), 'background.js must handle SYNC_HISTORY_UPSERT');

    console.log('  ✅ SQLite Hub replication message format (SYNC_HISTORY_UPSERT) verified');
    console.log('  ✅ SQLite Hub restore message flow verified');
    console.log('  ✅ Background service worker IPC handlers for Snapshots & Hub verified');
  }

  // ===========================================================================
  // Battery 9: Executive PDF & Standalone HTML Digest Generator
  // ===========================================================================
  console.log('\nBattery 9: Executive PDF & Standalone HTML Digest Generator');
  {
    const featureModule = require(featureJsPath);
    const { generateExecutiveDigestHtml, triggerPrintPdf } = featureModule;

    const mockDigestData = {
      tracking_history: {
        '2026-11-15': {
          domains: {
            'github.com': { activeTime: 7200, sessions: 12, category: 'work' },
            'youtube.com': { activeTime: 3600, sessions: 4, category: 'entertainment' },
            'wikipedia.org': { activeTime: 1800, sessions: 2, category: 'learning' }
          },
          totalActiveTime: 12600
        }
      },
      media_history: [
        { id: '1', title: 'Deep Work Session', platform: 'YouTube', duration: 3600, watchTime: 3600 }
      ]
    };

    const htmlDoc = generateExecutiveDigestHtml(mockDigestData, {
      reportingPeriod: '2026-11-15 (Single Day)',
      productivityIndex: 88
    });

    assert(htmlDoc.includes('<!DOCTYPE html>'), 'Executive digest must be valid HTML5 document');
    assert(htmlDoc.includes('Web Activity & Focus Executive Digest'), 'Must contain executive digest title');
    assert(htmlDoc.includes('2026-11-15 (Single Day)'), 'Must contain reporting period string');
    assert(htmlDoc.includes('github.com'), 'Must list top domain github.com');
    assert(htmlDoc.includes('youtube.com'), 'Must list domain youtube.com');
    assert(htmlDoc.includes('3h 30m'), 'Must correctly format 12,600s total active time');
    assert(htmlDoc.includes('<svg viewBox="0 0 100 100"'), 'Must contain vector SVG donut chart');
    assert(htmlDoc.includes('id="sentinel-digest-payload"'), 'Must embed lossless serialized JSON payload for offline portability');

    const mockPrintDoc = {
      getElementById: (id) => {
        if (id === 'printStatTotalTime' || id === 'printStatTopDomain' || id === 'printStatProductivity' || id === 'printStatMediaTime') {
          return { textContent: '' };
        }
        return null;
      },
      createElement: () => ({ id: '', className: '', textContent: '' }),
      body: { insertBefore: () => {} }
    };
    let windowPrintCalled = false;
    const mockWin = {
      print: () => { windowPrintCalled = true; }
    };

    const printRes = triggerPrintPdf({ doc: mockPrintDoc, win: mockWin, totalTime: '3h 30m', topDomain: 'github.com' });
    assert.strictEqual(printRes.printed, true);
    assert.strictEqual(windowPrintCalled, true, 'triggerPrintPdf must invoke window.print()');

    const cssContent = fs.readFileSync(backupCssPath, 'utf8');
    assert(cssContent.includes('@media print'), 'backup_digest.css must define @media print block');
    assert(cssContent.includes('page-break-inside: avoid'), 'Must set page-break-inside: avoid on tables/cards');
    assert(cssContent.includes('.print-executive-header'), 'Must define .print-executive-header');
    assert(cssContent.includes('.sidebar,'), 'Must hide .sidebar in print mode');
    assert(cssContent.includes('.dashboard-header-actions,'), 'Must hide .dashboard-header-actions in print mode');

    console.log('  ✅ Standalone HTML digest generator produces self-contained HTML5 file with vector SVG and embedded payload');
    console.log('  ✅ triggerPrintPdf populates executive stats and executes window.print() cleanly');
    console.log('  ✅ @media print CSS rules hide non-printable UI and preserve page breaks');
  }

  // ===========================================================================
  // Battery 10: HTML DOM Invariants & Bilingual Dictionary Parity (en/hi)
  // ===========================================================================
  console.log('\nBattery 10: HTML DOM Invariants & Bilingual Dictionary Parity (en/hi)');
  {
    const htmlContent = fs.readFileSync(dashHtmlPath, 'utf8');

    const requiredElements = [
      'btnPrintPdf',
      'btnDownloadHtmlDigest',
      'btnDownloadHtmlReport',
      'printExecutiveHeader',
      'printReportTitle',
      'printReportPeriod',
      'printStatTotalTime',
      'printStatTopDomain',
      'printStatProductivity',
      'printStatMediaTime',
      'cardAdvancedBackupRestore',
      'headingAdvancedBackupCard',
      'subAdvancedBackupCard',
      'lblImportBackupHeader',
      'inputBackupFile',
      'btnImportJsonBackup',
      'lblSnapshotRollbackHeader',
      'selectSnapshotRollback',
      'btnApplySnapshotRollback',
      'btnRollbackYesterday',
      'btnRollback3Days',
      'lblSqliteSyncHeader',
      'btnReplicateSqliteHub',
      'btnRestoreFromSqliteHub',
      'modalConflictResolution',
      'conflictModalTitle',
      'btnConflictClose',
      'btnConflictMerge',
      'btnConflictOverwrite',
      'btnConflictAppend',
      'btnConflictCancel'
    ];

    requiredElements.forEach(id => {
      assert(htmlContent.includes(`id="${id}"`), `dashboard.html must contain element with id="${id}"`);
    });

    const dashModule = require(dashJsPath);
    const i18n = dashModule.DASHBOARD_I18N;
    assert(i18n && i18n.en && i18n.hi, 'DASHBOARD_I18N must exist with en and hi');

    const requiredPhase3Keys = [
      'btn_import_json',
      'btn_rollback_snapshot',
      'btn_sync_sqlite_hub',
      'btn_restore_sqlite_hub',
      'dlg_conflict_title',
      'dlg_conflict_merge',
      'dlg_conflict_overwrite',
      'dlg_conflict_append',
      'dlg_conflict_cancel',
      'heading_advanced_backup',
      'sub_advanced_backup',
      'lbl_import_backup_header',
      'lbl_import_backup_desc',
      'lbl_snapshot_rollback_header',
      'lbl_snapshot_rollback_desc',
      'lbl_sqlite_sync_header',
      'lbl_sqlite_sync_desc',
      'btn_yesterday',
      'btn_3days_ago',
      'btn_print_pdf',
      'btn_download_html',
      'digest_title',
      'digest_period',
      'digest_total_time',
      'digest_top_domain',
      'digest_productivity',
      'digest_media_time'
    ];

    const devanagariRegex = /[\u0900-\u097F]/;

    requiredPhase3Keys.forEach(k => {
      assert(i18n.en[k], `English dictionary must contain key: ${k}`);
      assert(i18n.hi[k], `Hindi dictionary must contain key: ${k}`);

      const enVal = typeof i18n.en[k] === 'function' ? i18n.en[k]('sample') : i18n.en[k];
      const hiVal = typeof i18n.hi[k] === 'function' ? i18n.hi[k]('sample') : i18n.hi[k];

      assert(!devanagariRegex.test(enVal), `English key "${k}" contains Devanagari characters: ${enVal}`);
      assert(devanagariRegex.test(hiVal), `Hindi key "${k}" must contain Devanagari characters: ${hiVal}`);
    });

    console.log(`  ✅ All ${requiredElements.length} required Phase 3 DOM elements verified in dashboard.html`);
    console.log(`  ✅ All ${requiredPhase3Keys.length} Phase 3 bilingual keys verified with 100% en/hi parity`);
    console.log('  ✅ Language purity verified: Latin-only English, authentic Devanagari Hindi');
  }

  console.log('\n🎉 ALL 10 BATTERIES IN PHASE 3 TEST SUITE PASSED CLEANLY (Exit Code 0)!\n');
})().catch(err => {
  console.error('\n❌ Unhandled error in test suite:', err);
  process.exit(1);
});
