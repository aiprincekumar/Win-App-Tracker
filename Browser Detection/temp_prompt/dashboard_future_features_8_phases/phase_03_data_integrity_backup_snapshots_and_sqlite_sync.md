# Phase 3: Data Integrity, Backup, Snapshots & SQLite Hub Sync (Features 5 & 6)
## Standalone Executable Implementation Specification

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001` (Phase 3)  
> **Target Subsystems:** Feature 5 (Advanced Backup & SQLite Sync) & Feature 6 (Executive PDF & HTML Digest)  
> **Assigned Role:** Level 4 Systems / Data Engineer  
> **Required Skills:** `backend-patterns`, `frontend-patterns`, `javascript`, `postgres-patterns`  
> **Target Test Gate:** `tests/test_dashboard_features_phase3.js` (Must pass with Exit Code 0)  
> **Master Reference:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Parent Ephemeral:** `temp_prompt/dashboard_future_features_8_phases/`  

---

## 🎯 1. Phase Objective

Implement **Feature 5 (Advanced Backup, Snapshot Restore & Local SQLite Data Hub Sync)** and **Feature 6 (Executive PDF & HTML Digest Generator)** inside the Sentinel Dashboard.
This enables users to:
1. Import and validate JSON backup files conforming to Schema v2.0, with graceful error trapping on corrupt or malformed files.
2. Select from 3 conflict resolution strategies (`Merge` [recommended default], `Overwrite`, `Append-Only`).
3. Maintain and roll back to 7 trailing daily rolling snapshots (`snapshot_YYYY_MM_DD`) in `chrome.storage.local`.
4. Bidirectionally replicate telemetry and settings with the local SQLite Data Hub daemon over WebSocket (`ws://127.0.0.1:65433`).
5. Generate print-ready, executive A4/Letter PDF reports via native `window.print()` using an optimized, zero-dependency `@media print` CSS engine.
6. Export an offline, standalone, single-file HTML digest with embedded telemetry and styling.

---

## 📦 2. Prerequisites & Environment State

- Phases 1 & 2 completed and certified clean via Test Gates 1 & 2.
- Certified codebase: `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`.
- Active working memory: [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) and [`project_feature_memory.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md).

---

## 🔍 3. Technical Context & File Anchors

- `dashboard/dashboard.html`:
  - Locate `#cardStorage` and `#cardDangerZone` in the Settings pane.
  - Insert `#cardAdvancedBackupRestore` containing `#btnImportJsonBackup`, file input `#inputBackupFile`, snapshot rollback selector `#selectSnapshotRollback`, and SQLite replicate button `#btnReplicateSqliteHub`.
  - In `#paneTracking` header actions or `#exportSection`, add `#btnPrintPdf` and `#btnDownloadHtmlDigest`.
  - Insert conflict resolution modal `#modalConflictResolution`.
- `dashboard/dashboard.js`:
  - Merge `DASHBOARD_FUTURE_I18N` keys for Features 5 & 6 into `en` and `hi`.
  - Implement `validateBackupSchemaV2(parsedObj)`.
  - Implement `importJsonBackup(file, strategy)`.
  - Implement `captureDailySnapshot()`, `listDailySnapshots()`, and `rollbackToSnapshot(snapshotKey)`.
  - Implement `replicateToSqliteHub()` and `restoreFromSqliteHub()`.
  - Implement `triggerPrintPdf()` and `downloadStandaloneHtmlDigest()`.
- `dashboard/dashboard.css`:
  - Add `@media print` rules per `DESIGN.md`.
  - Style backup dropzone and snapshot rollback modal.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Backup & Snapshot UI Components in `dashboard/dashboard.html`
1. In the Settings tab, add `#cardAdvancedBackupRestore`:
   ```html
   <div id="cardAdvancedBackupRestore" class="card">
     <h3 id="txtBackupCardTitle">💾 Advanced Backup, Snapshots & SQLite Hub</h3>
     <p class="section-desc">Manage disaster recovery, rollback snapshots, and desktop SQLite synchronization.</p>
     <div class="backup-actions-grid">
       <div class="action-box">
         <label for="inputBackupFile" class="btn btn-primary" id="lblImportBackup">📥 Import JSON Backup</label>
         <input type="file" id="inputBackupFile" accept=".json" class="hidden">
       </div>
       <div class="action-box">
         <label id="lblSnapshotRollback">⏪ Rollback Snapshot:</label>
         <select id="selectSnapshotRollback" class="form-select">
           <option value="">Select a snapshot...</option>
         </select>
         <button id="btnApplySnapshotRollback" class="btn btn-secondary">Restore</button>
       </div>
       <div class="action-box">
         <button id="btnReplicateSqliteHub" class="btn btn-secondary">🔄 Replicate to SQLite Hub</button>
       </div>
     </div>
   </div>
   ```
2. In the Analytics tab header, add:
   ```html
   <button id="btnPrintPdf" class="btn btn-sm btn-secondary">🖨️ Print / Save PDF</button>
   <button id="btnDownloadHtmlDigest" class="btn btn-sm btn-secondary">📄 Offline HTML Report</button>
   ```
3. Add modal dialog `#modalConflictResolution` with buttons for `Merge (Recommended)`, `Overwrite All`, and `Cancel`.

### Step 2: Backup Validation & Conflict Resolution Logic
1. Open `dashboard/dashboard.js`.
2. Implement `validateBackupSchemaV2(data)`:
   - Verifies `schema_version === '2.0.0'` or `1.0.0`.
   - Validates existence of `payload.tracking_history` or root `trackingHistory`.
   - Checks data types and returns `{ valid: boolean, version: string, error?: string }`.
3. Implement `resolveBackupConflict(currentHistory, importedHistory, strategy)`:
   - `strategy === 'overwrite'`: returns imported history entirely.
   - `strategy === 'merge'`: unions domain metrics, taking `Math.max` for overlapping days.
   - `strategy === 'append'`: inserts only dates missing from current history.
4. Implement `handleBackupFileSelection(file)`:
   - Reads via `FileReader`.
   - Validates JSON and schema.
   - Prompts conflict resolution modal if local data exists.
   - Atomically updates `chrome.storage.local` upon user selection.

### Step 3: Rolling Snapshots & SQLite Data Hub Sync
1. Implement `captureDailySnapshot()`:
   - Executed on dashboard launch or before major imports.
   - Stores current history under key `sentinel_snapshot_YYYY_MM_DD`.
   - Maintains a FIFO array of the last 7 snapshot keys, pruning older ones.
2. Implement `listDailySnapshots()` to populate `#selectSnapshotRollback`.
3. Implement `rollbackToSnapshot(key)`:
   - Copies snapshot payload to active `trackingHistory`.
   - Refreshes all dashboard charts and tables immediately.
4. Implement `replicateToSqliteHub()`:
   - Connects to `ws://127.0.0.1:65433`.
   - Emits `SYNC_HISTORY_UPSERT` with local delta.
   - Emits `RESTORE_FROM_SQLITE` when user clicks restore from hub.

### Step 4: Executive PDF & Offline HTML Generator
1. Implement `triggerPrintPdf()`:
   - Prepares print header element with Sentinel logo, report date range, and key metric summaries.
   - Calls `window.print()`.
2. Implement `downloadStandaloneHtmlDigest()`:
   - Compiles a self-contained HTML document string including inline CSS, current metrics, top domains table, and SVG charts.
   - Generates a Blob `type: 'text/html;charset=utf-8'`.
   - Triggers automatic browser file download (`Sentinel_Executive_Digest_YYYY-MM-DD.html`).

### Step 5: `@media print` CSS Engine in `dashboard/dashboard.css`
1. Add print media queries hiding `.sidebar`, `.dashboard-header-actions`, `.btn`, `.search-container`, and modals.
2. Set background to `#ffffff` and text to `#0f172a`.
3. Set `page-break-inside: avoid` on cards and table rows.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries

- **Zero-Dependency Print Engine:** Do not introduce heavy libraries like jsPDF or html2canvas. Rely strictly on native `window.print()` and CSS `@media print`.
- **Zero-innerHTML Modals:** Use `document.createElement` for constructing the conflict resolution modal and snapshot option elements.
- **Fail-Closed on Corrupt Backups:** If JSON parsing or schema validation fails, immediately abort without mutating `chrome.storage.local`.

---

## 📋 6. Deliverables Manifest

1. `dashboard/dashboard.html` (Advanced backup card, snapshot selector, print and HTML report buttons, conflict modal).
2. `dashboard/dashboard.js` (Schema v2.0 validator, conflict merger, snapshot rotator, SQLite sync, HTML digest generator).
3. `dashboard/dashboard.css` (Print stylesheet, modal layout, backup dropzone styles).
4. `tests/test_dashboard_features_phase3.js` (Automated verification test suite).

---

## 🧪 7. Local Verification Gate (Test Gate 3)

Execute the dedicated test suite:
```powershell
node tests/test_dashboard_features_phase3.js
node -c dashboard/dashboard.js
```

### Acceptance Criteria:
1. `tests/test_dashboard_features_phase3.js` exits with code 0.
2. Corrupt or invalid JSON files fail validation with descriptive error messages.
3. Valid Schema v2.0 backups successfully merge or overwrite without dropping dates.
4. 7-day rolling snapshot FIFO rotates correctly and rollback restores prior state.
5. `@media print` rules correctly hide non-printable UI elements in stylesheet inspection.
6. Node.js AST check (`node -c`) reports 0 syntax errors.
7. All files verified UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
