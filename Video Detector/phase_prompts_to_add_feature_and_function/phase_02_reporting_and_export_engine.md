# Phase 02 Execution Prompt: Reporting & Analytics Persistence Engine

> **Phase Number:** 02  
> **Phase Name:** Reporting & Analytics Persistence Engine  
> **Target Workspace:** `Video Detector/`  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Mandatory Anchor Directives:** First load and adhere to `C:\Users\Atul Verma\.gemini\config\rules\02_solution_architecture_dept.md`, `03_data_architecture_dba_dept.md`, `08_quality_assurance_testing_dept.md`, and `C:\Users\Atul Verma\.gemini\memory.md` before executing instructions.  
> **Encoding Mandate:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created/edited files.  
> **Git Cadence:** Autonomous local micro-commit immediately upon completion under developer Atul Verma.  

---

## 🎯 1. Phase Objective & Executive Scope

Phase 02 builds an enterprise-grade local analytics and reporting engine that persists watch sessions and generates audit reports.
1. **Daily & Weekly Watch-Time Analytics & Summary (FEAT-01):** Aggregate seconds of active video playback, pure audio, and idle duration.
2. **Per-App Playback Breakdown (FEAT-02):** Track time spent in Chrome, VLC, Edge, PotPlayer, Modern Media Player, MPC-HC, etc.
3. **24-Hour Activity Heatmap & Peak Usage (FEAT-04):** Compute 24 hourly buckets representing daily usage patterns.
4. **Exportable Audit Reports in HTML, CSV, JSON (FEAT-03):** Provide a 1-click exporter producing self-contained, beautiful HTML reports with interactive CSS/SVG charts, plus raw CSV and JSON dumps.

---

## 📁 2. Impacted Modules & Target File Topology

- **Create:** `modules/storage.py` (Embedded SQLite database engine with WAL mode).
- **Create:** `modules/analytics.py` (Aggregation service for daily/weekly metrics and 24h heatmap).
- **Create:** `modules/exporter.py` (Multi-format report generation engine).
- **Modify:** `video_idle_detector.py` (Add CLI argument `--export [html|csv|json]` and wire storage collector).
- **Create:** `test_phase02_analytics_suite.py` (Comprehensive persistence and export verification suite).

---

## 🛠️ 3. Detailed Step-by-Step Implementation Instructions

### Step 2.1: Embedded SQLite Storage Engine (`modules/storage.py`)
1. Create `modules/storage.py` using Python's native `sqlite3`:
   - Store database in `data/video_sentinel.db` (auto-create `data/` directory).
   - Configure PRAGMAs on connection:
     ```python
     conn.execute("PRAGMA journal_mode = WAL;")
     conn.execute("PRAGMA synchronous = NORMAL;")
     conn.execute("PRAGMA busy_timeout = 5000;")
     ```
2. Initialize tables:
   - `watch_sessions`: `(id, session_start, session_end, duration_seconds, app_name, platform, window_title, media_category)`
   - `hourly_aggregates`: `(date_hour TEXT PRIMARY KEY, video_seconds INT, audio_seconds INT, idle_seconds INT)`
3. Implement `StorageManager` class:
   - `log_tick(verdict_data: dict)`: Increments current hour's counter in `hourly_aggregates` atomically.
   - `record_session(session_data: dict)`: Commits a completed media session.
   - Thread safety: Use a dedicated writer queue or connection pool with thread-local connections.

### Step 2.2: Watch-Time & Heatmap Aggregator (`modules/analytics.py`)
1. Create `modules/analytics.py` with `AnalyticsEngine`:
   - `get_daily_summary(target_date: str = None) -> dict`:
     - Queries total video seconds, pure audio seconds, idle seconds for target date (default: today).
     - Returns formatted strings (`03h 42m 15s`) and integer seconds.
   - `get_weekly_summary() -> dict`:
     - Aggregates the past 7 days of watch time by day and by app.
   - `get_per_app_breakdown(days: int = 1) -> list[dict]`:
     - Groups watch duration by `app_name` and `platform`, sorted by descending duration.
   - `get_24h_heatmap(target_date: str = None) -> list[dict]`:
     - Returns array of 24 objects `[{"hour": 0, "video_sec": 120, "audio_sec": 0, ...}, ...]`.
     - Generates ASCII sparkline / Unicode block representation (`..▃▅██▇▆▅▃.......`) for terminal dashboard.

### Step 2.3: Multi-Format Exporter Engine (`modules/exporter.py`)
1. Create `modules/exporter.py` with `ReportExporter`:
   - `export_json(filepath: str) -> str`: Dumps all daily summaries, app breakdowns, and sessions into structured JSON.
   - `export_csv(filepath: str) -> str`: Writes comma-delimited rows of all logged sessions.
   - `export_html(filepath: str) -> str`:
     - Generates a standalone, dependency-free HTML document (`reports/video_sentinel_report_YYYY-MM-DD.html`).
     - Contains embedded CSS with cyber-clean dark palette (`#0B0F17`, `#131B2E`, `#6366F1`, `#10B981`).
     - Interactive SVG bar chart for 24-hour heatmap.
     - Tabular breakdown of per-app watch time with icons/badges.
     - Summary KPI cards: Total Watch Time, Pure Audio Saved, Potential Power Saved (kWh estimate).

### Step 2.4: CLI Argument Integration (`video_idle_detector.py`)
1. Add command-line argument support in `video_idle_detector.py`:
   - `--export [html|csv|json]`: Generates report and exits immediately.
   - `--summary`: Prints today's watch-time summary to terminal and exits.
   - `--days [N]`: Sets historical lookback days for export (default: 7).

---

## 🧪 4. Verification & QA Testing Gate

1. Run verification suite `test_phase02_analytics_suite.py`:
   ```bash
   python test_phase02_analytics_suite.py
   ```
2. Acceptance Criteria:
   - SQLite database initializes with WAL mode and indexes.
   - 100 simulated ticks populate `hourly_aggregates` without locking errors.
   - 24-hour heatmap generates correct 24 buckets and ASCII sparkline.
   - HTML export produces valid, self-contained HTML file rendering cleanly in browsers.
   - CLI flags `--export html` and `--summary` execute in < 200ms.

---

## 💾 5. Autonomous Local Commit & Rule 15 Protocol

1. Perform local git commit using developer identity Atul Verma:
   ```bash
   git add modules/storage.py modules/analytics.py modules/exporter.py video_idle_detector.py test_phase02_analytics_suite.py
   git commit -m "feat(analytics): implement Phase 02 watch-time aggregator, 24h heatmap, SQLite storage, and multi-format exporter"
   ```
2. Capture commit hash via `git log -1 --format="%h - %s"`.
3. Notify user: `"हाँ, लोकल में कमिट हो चुका है [commit_hash]"`.
4. Keep remote push locked per Rule 15.
