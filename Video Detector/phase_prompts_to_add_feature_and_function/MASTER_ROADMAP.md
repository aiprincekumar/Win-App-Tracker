# Windows Video-Only Inactivity Sentinel - Master Roadmap & Execution Guidelines

> **Document Type:** Master Implementation Roadmap & Phase Execution Guidelines  
> **Project Name:** Windows Video-Only Inactivity Sentinel Enterprise Expansion  
> **Workspace Path:** `Video Detector/`  
> **Lead Architect & Coordinator:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Standard Compliance:** Dept 01, Dept 02, Dept 04, Dept 07, Universal Rules 0, 5, 8, 15, 16, 20, 22, 23, 26, 27  
> **Status:** Official Architectural Implementation Roadmap  

---

## 🗺️ 1. Phased Architecture & Execution Sequence

The enterprise expansion of the Windows Video-Only Inactivity Sentinel is partitioned into six distinct, sequentially gated phases. Each phase is self-contained, fully testable, and guaranteed not to break existing video/audio classification functionality.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASED EXECUTION ROADMAP FLOW                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 01: Core Telemetry & Sensor Metadata Enrichment                  │
│ [Features 8, 9, 10, 11, 12]                                            │
│ - Domain/Platform tagging (YouTube, Netflix, Hotstar, Prime)           │
│ - Master audio volume % & mute detection via WASAPI COM                │
│ - Fullscreen vs Windowed geometry & resolution                         │
│ - Media player CPU% / RAM (MB) / DXVA Hardware Acceleration status     │
│ - Power source (AC/Battery) & powercfg display wake-lock inspector     │
│ Gate: Unit tests pass 100%, <15ms sensor tick latency                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 02: Reporting & Analytics Persistence Engine                     │
│ [Features 1, 2, 3, 4]                                                  │
│ - SQLite WAL embedded storage (`data/video_sentinel.db`)               │
│ - Daily & weekly watch-time aggregator (video vs audio vs idle)        │
│ - Per-app playback breakdown (Chrome, VLC, Edge, etc.)                 │
│ - 24-hour activity heatmap generator (24 hourly buckets)               │
│ - Multi-format export engine (HTML, CSV, JSON) via CLI & API           │
│ Gate: Database ACID persistence verified, 1-click export < 200ms       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 03: Terminal Dashboard HUD & Interactive Hotkeys                 │
│ [Features 5, 6, 7, 13]                                                 │
│ - Auto-shutdown countdown HUD with visual ANSI progress bar            │
│ - Multi-video streams inspector (Primary active vs secondary streams)  │
│ - Ghost stream auditor (minimized, occluded, or off-screen audio)      │
│ - Interactive in-dashboard hotkeys (+/-, P pause, R reset, Q exit)     │
│ Gate: In-place atomic refresh without scroll; hotkeys latency < 10ms   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 04: Native Windows Background Daemon & System Tray               │
│ [Feature 14]                                                           │
│ - Background desktop service lifecycle (Win10 64-bit & Win11)          │
│ - Dynamic system tray icon (Green=Playing, Amber=Idle, Red=Countdown)  │
│ - Context menu (Open Web, Pause, Snooze 15m, Export, Quit)             │
│ - Low-overhead background runner batch script (`Run_Background.bat`)   │
│ Gate: Zero crash on display sleep; clean exit under 500ms (Rule 26)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 05: Lightweight Localhost Web Dashboard & Remote Control         │
│ [Feature 15]                                                           │
│ - Zero-dependency native Python HTTP/WebSocket server (Port 8765)      │
│ - Cyber-clean responsive dark theme (HTML5/CSS3/ES6 Vanilla SPA)       │
│ - Real-time SSE / WebSocket telemetry streaming                        │
│ - Mobile-responsive remote controls (Abort, Snooze, Adjust Threshold)  │
│ - Optional `--lan` mode with secure ephemeral 4-digit PIN auth         │
│ Gate: Mobile layout tested, remote shutdown cancellation < 100ms       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 06: Comprehensive QA Verification & Master Release               │
│ - End-to-end multi-stream stress test suite                            │
│ - Performance audit (CPU < 0.5%, RAM < 45 MB RSS across 24h)           │
│ - Gitleaks credential and secret scan (Rule 15 audit)                  │
│ - Changes log update (Rule 6) & Memory synchronization (Rule 23)       │
│ Gate: Zero regressions; 100% test passage; Release signoff             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 2. Inter-Phase Dependency Matrix

| Phase | Title | Depends On | Unblocks |
| :---: | :--- | :---: | :---: |
| **01** | Core Telemetry & Metadata | Baseline Sentinel | Phase 02, Phase 03 |
| **02** | Reporting & Export Engine | Phase 01 | Phase 05 |
| **03** | Terminal Dashboard HUD & Hotkeys | Phase 01 | Phase 04 |
| **04** | Windows Background Daemon & Tray | Phase 03 | Phase 06 |
| **05** | Lightweight Web Dashboard | Phase 01, Phase 02, Phase 03 | Phase 06 |
| **06** | QA Verification & Master Release | Phase 01, 02, 03, 04, 05 | Production Deployment |

---

## 🛡️ 3. Universal Governance & Engineering Directives

### 3.1 UTF-8 with BOM Standard (Universal Rule 5 & 8)
All created or modified `.md`, `.py`, `.json`, `.bat`, `.ps1` files must be encoded strictly in **UTF-8 with BOM** (`0xEF, 0xBB, 0xBF`).

### 3.2 Autonomous Local Micro-Commit Cadence (Universal Rule 15 & 16)
- On **EVERY SINGLE change or phase milestone**, immediately execute an autonomous local `git commit` under identity Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`).
- Immediately notify with: `"हाँ, लोकल में कमिट हो चुका है [commit_hash]"`.
- **Remote Git Push Gatekeeper:** Remote push remains strictly LOCKED until full task completion, passing `gitleaks detect --redact`, and receiving explicit interactive selection via `ask_question`.

### 3.3 Zero-Hang Background Task Hygiene (Universal Rule 26)
Every daemon, socket listener, and thread worker must register `atexit` and `signal` handlers (`SIGINT`, `SIGTERM`) to cleanly release COM references, close SQLite connections, unbind network ports, and remove tray icons within 500ms.
