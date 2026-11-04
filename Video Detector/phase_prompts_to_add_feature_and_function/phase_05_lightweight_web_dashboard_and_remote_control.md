# Phase 05 Execution Prompt: Lightweight Localhost Web Dashboard & Remote Control

> **Phase Number:** 05  
> **Phase Name:** Lightweight Localhost Web Dashboard & Remote Control  
> **Target Workspace:** `Video Detector/`  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Mandatory Anchor Directives:** First load and adhere to `C:\Users\Atul Verma\.gemini\config\rules\04_ui_ux_design_system_dept.md`, `05_frontend_engineering_dept.md`, `06_backend_api_engineering_dept.md`, `10_application_security_infosec_dept.md`, and `C:\Users\Atul Verma\.gemini\memory.md` before executing instructions.  
> **Encoding Mandate:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created/edited files.  
> **Git Cadence:** Autonomous local micro-commit immediately upon completion under developer Atul Verma.  

---

## 🎯 1. Phase Objective & Executive Scope

Phase 05 delivers a high-performance, zero-dependency localhost web dashboard (accessible at `http://localhost:8765`) and local Wi-Fi remote control:
1. **Zero-Dependency Native HTTP Server (FEAT-15):** Built on Python's standard `http.server`, eliminating bloated external web frameworks.
2. **Cyber-Clean Responsive Web UI:** Dark mode aesthetic complying strictly with `DESIGN.md` (Inter font, glassmorphism, glowing status badges, SVG meters).
3. **Mobile-First Remote Control:** Accessible from smartphones connected to the local Wi-Fi network (thumb-zone optimized for bedside remote control).
4. **Real-Time Live Telemetry:** Streaming updates via Server-Sent Events (SSE) or lightweight WebSocket protocol.
5. **Remote Command Dispatch:** Immediate action buttons (Abort Shutdown, Snooze 15m, Pause Sentinel, Adjust Countdown Threshold).
6. **LAN Security PIN Protection:** Ephemeral 4-digit PIN authentication required when bound to `--lan` to prevent unauthorized shutdown tampering.

---

## 📁 2. Impacted Modules & Target File Topology

- **Create:** `modules/web_server.py` (Multi-threaded HTTP/SSE server with REST router).
- **Create Directory:** `web/`
  - `web/index.html` (Single-page application layout with semantic HTML5).
  - `web/style.css` (Glassmorphic dark-theme stylesheet with CSS design tokens).
  - `web/app.js` (Reactive vanilla JavaScript telemetry client with SSE / WebSocket connection).
- **Modify:** `video_idle_detector.py` (Add `--web`, `--port [PORT]`, `--lan` flags; launch web thread).
- **Create:** `test_phase05_web_server_suite.py` (HTTP endpoints and SSE streaming test suite).

---

## 🛠️ 3. Detailed Step-by-Step Implementation Instructions

### Step 3.1: Zero-Dependency HTTP & REST Server (`modules/web_server.py`)
1. Create `modules/web_server.py` inheriting from `http.server.ThreadingHTTPServer`:
   - Serve static assets from `web/` directory with proper MIME types (`text/html`, `text/css`, `application/javascript`, `image/svg+xml`).
   - Implement REST Endpoints:
     - `GET /api/status`: Returns instantaneous JSON payload (verdict, confidence, primary stream, secondary streams, countdown status, power status).
     - `GET /api/telemetry/events`: Server-Sent Events (SSE) stream pushing state snapshots every 1000ms (`Content-Type: text/event-stream`).
     - `POST /api/control/abort`: Cancels active shutdown countdown immediately.
     - `POST /api/control/snooze`: Extends countdown by 15 minutes.
     - `POST /api/control/pause`: Toggles sentinel pause state.
     - `POST /api/control/threshold`: Adjusts base countdown threshold (`{ "delta": 60 }`).
     - `GET /api/analytics/today`: Returns today's watch-time summary and 24h heatmap array.
     - `GET /api/export/html`: Downloads generated standalone HTML report.
2. Security & LAN Binding:
   - Default host: `127.0.0.1`.
   - If `--lan` is specified: Binds to `0.0.0.0`, detects local LAN IP (e.g. `192.168.1.15`), and prints access URL with PIN:
     `Web Dashboard live at: http://192.168.1.15:8765/?pin=4821`

### Step 3.2: Cyber-Clean Dark Theme Web Dashboard (`web/`)
1. Create `web/index.html`:
   - Meta viewport configured for mobile scaling (`viewport-fit=cover`).
   - Header with glowing Status Pill (`ACTIVE VIDEO`, `IDLE / AUDIO`, `COUNTDOWN PENDING`).
   - Hero Card: Animated SVG Radial Countdown Meter with remaining time display.
   - Primary Stream Card: App icon, Title, Domain badge, Resolution, Audio Volume Slider, CPU/RAM meter.
   - Secondary Streams Table: Lists background and ghost streams with badges.
   - 24-Hour Watch Time Heatmap: Interactive CSS Grid / SVG bars showing today's hourly activity.
   - Sticky Mobile Bottom Action Bar: Prominent "ABORT SHUTDOWN" button (min 56px height) and "+15m Snooze".
2. Create `web/style.css`:
   - Implements variables from `DESIGN.md` (`--bg-primary: #0B0F17`, `--bg-surface: #131B2E`, `--brand-primary: #6366F1`, `--status-danger: #EF4444`).
   - Mobile-first responsive media queries (`@media (max-width: 600px)`).
   - Glassmorphism: `backdrop-filter: blur(12px)`.
3. Create `web/app.js`:
   - Connects to `/api/telemetry/events` via `new EventSource('/api/telemetry/events')`.
   - Updates DOM elements reactively on incoming state events without page reload.
   - Handles button click events (`fetch('/api/control/abort', { method: 'POST' })`).
   - Plays a subtle audio chime or vibrates device (`navigator.vibrate`) when countdown enters critical last 30 seconds.

---

## 🧪 4. Verification & QA Testing Gate

1. Run verification suite `test_phase05_web_server_suite.py`:
   ```bash
   python test_phase05_web_server_suite.py
   ```
2. Acceptance Criteria:
   - HTTP server serves `index.html`, `style.css`, and `app.js` with status 200 and correct MIME types.
   - `/api/status` returns valid JSON matching TRD schema.
   - `/api/control/abort` successfully aborts countdown and responds within 50ms.
   - Mobile viewport renders cleanly without horizontal overflow.
   - Memory footprint of web server thread remains under 5 MB.

---

## 💾 5. Autonomous Local Commit & Rule 15 Protocol

1. Perform local git commit using developer identity Atul Verma:
   ```bash
   git add modules/web_server.py web/ test_phase05_web_server_suite.py video_idle_detector.py
   git commit -m "feat(web): implement Phase 05 lightweight localhost web dashboard and mobile remote control"
   ```
2. Capture commit hash via `git log -1 --format="%h - %s"`.
3. Notify user: `"हाँ, लोकल में कमिट हो चुका है [commit_hash]"`.
4. Keep remote push locked per Rule 15.
