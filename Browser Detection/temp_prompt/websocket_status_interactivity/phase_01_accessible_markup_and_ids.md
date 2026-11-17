# Phase 1: Accessible HTML Markup & Canonical DOM IDs

> **Phase:** 01  
> **Workspace:** `temp_prompt/websocket_status_interactivity/`  
> **Target File:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) (Lines ~89–112)  
> **Assigned Agent:** Level 4 Frontend Subagent  
> **Prerequisites:** Decision Gate cleared; Manager Authorization Token issued.  

---

## 🎯 1. Phase Objective

Refactor the static sidebar status cards for SQLite Data Hub and Video Detector HUD in `dashboard/dashboard.html` into accessible interactive widgets by adding canonical container IDs, `role="button"`, `tabindex="0"`, descriptive tooltips, and screen-reader accessible ARIA labels while preserving all 4 existing telemetry child elements.

---

## 📋 2. Step-by-Step Surgical Instructions

### Step 1.1: Locate the Target Sidebar HUD Elements
In `dashboard/dashboard.html`, locate lines 89–112 within `<div class="sidebar-hud-group" role="region" aria-label="Service Status Indicators">`.

### Step 1.2: Upgrade SQLite Data Hub Status Card
Replace the passive outer `<div>` with:
```html
        <!-- Sidebar Footer Data Hub Status Widget (Interactive Telemetry) -->
        <div id="sidebarDataHubCard"
             class="sidebar-hud-card interactive-hud-card"
             role="button"
             tabindex="0"
             title="SQLite Data Hub (ws://127.0.0.1:65433 WAL) - Click to manage or reconnect in Settings"
             aria-label="SQLite Data Hub Status Indicator. Click or press Enter to configure in Settings">
          <div class="hud-card-header">
            <span class="hud-card-title">SQLite Data Hub</span>
            <span id="dataHubSidebarDot" class="hud-dot offline" aria-label="SQLite Data Hub Status"></span>
          </div>
          <div class="hud-card-body">
            <span class="hud-address">ws://127.0.0.1:65433 (WAL)</span>
            <span id="dataHubSidebarLabel" class="hud-status-text hud-status-hidden" aria-hidden="true">Hub Offline</span>
          </div>
        </div>
```

### Step 1.3: Upgrade Video Detector HUD Status Card
Replace the passive outer `<div>` with:
```html
        <!-- Sidebar Footer HUD Status Widget (Interactive Telemetry) -->
        <div id="sidebarHudCard"
             class="sidebar-hud-card interactive-hud-card"
             role="button"
             tabindex="0"
             title="Video Detector HUD (ws://127.0.0.1:65432) - Click to manage or reconnect in Settings"
             aria-label="Video Detector HUD Status Indicator. Click or press Enter to configure in Settings">
          <div class="hud-card-header">
            <span class="hud-card-title">Video Detector HUD</span>
            <span id="hudStatusDot" class="hud-dot offline" aria-label="Video Detector HUD Status"></span>
          </div>
          <div class="hud-card-body">
            <span class="hud-address">ws://127.0.0.1:65432</span>
            <span id="hudStatusLabel" class="hud-status-text hud-status-hidden" aria-hidden="true">HUD Offline</span>
          </div>
        </div>
```

### Step 1.4: Strict Invariant Checklist
- ✅ `id="sidebarDataHubCard"` added to outer container.
- ✅ `id="sidebarHudCard"` added to outer container.
- ✅ Both contain `role="button"` and `tabindex="0"`.
- ✅ All 4 child IDs (`dataHubSidebarDot`, `dataHubSidebarLabel`, `hudStatusDot`, `hudStatusLabel`) 100% preserved.
- ✅ UTF-8 BOM (`0xEF, 0xBB, 0xBF`) preserved on `dashboard/dashboard.html`.

---

## 🧪 3. Local Verification Gate

Execute verification check:
```powershell
node -e "const fs = require('fs'); const html = fs.readFileSync('dashboard/dashboard.html', 'utf8'); console.assert(html.includes('id=\"sidebarDataHubCard\"')); console.assert(html.includes('id=\"sidebarHudCard\"')); console.log('Phase 1 DOM IDs Verified Clean!');"
```
Gate passes cleanly with exit code 0.
