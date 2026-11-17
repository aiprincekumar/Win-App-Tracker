# Phase 2 Instruction Set: Sidebar Status Minimalism & Action Controls Shift to Settings

> **Phase:** 2 of 3  
> **Target Subagent Role:** Level 4 Frontend Engineer  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Phase Prompt File:** `temp_prompt/ui_ux_audio_sidebar_polish/phase_02_sidebar_status_settings_bridge.md`  
> **Lead Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Autonomy Score:** 1.0 (Autonomous Execution)  

---

## 🎯 1. Phase Objective

The objective of Phase 2 is to declutter the dashboard navigation sidebar by removing bulky reconnect buttons from the sidebar telemetry cards, transforming them into sleek, minimalist status widgets, and relocating those vital reconnection controls (`#btnSidebarReconnectHub` and `#btnSidebarReconnect`) to a newly designed "Local Services & Hardware Bridges" card in `#paneSettings`, strictly preserving all existing DOM IDs and event listener bindings.

---

## 📋 2. Prerequisites & Required Inputs

- Successful completion of Phase 1 (`phase_01_css_embedding_eq_audiolab.md`).
- Target files:
  1. [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)
  2. [`dashboard/styles/layout/header_sidebar.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout/header_sidebar.css)
  3. [`dashboard/styles/settings.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/settings.css)
  4. [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
- Reference specifications:
  - [`PRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/PRD.md)
  - [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/TRD.md)
  - [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/DESIGN.md)

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 2.1: Declutter Sidebar HUD Cards in `dashboard/dashboard.html`
In `dashboard/dashboard.html`, locate the sidebar HUD cards (lines 63-91):

```html
      <!-- Sidebar Footer Data Hub Status Widget -->
      <div class="sidebar-hud-card">
        <div class="hud-card-header">
          <span class="hud-card-title">SQLite Data Hub</span>
          <span id="dataHubSidebarDot" class="hud-dot offline"></span>
        </div>
        <div class="hud-card-body">
          <span id="dataHubSidebarLabel" class="hud-status-text">Hub Offline</span>
          <span class="hud-address">ws://127.0.0.1:65433 (WAL)</span>
        </div>
        <button id="btnSidebarReconnectHub" class="btn-hud-reconnect" title="Reconnect to SQLite Data Hub">
          ⚡ Reconnect Hub
        </button>
      </div>

      <!-- Sidebar Footer HUD Status Widget -->
      <div class="sidebar-hud-card">
        <div class="hud-card-header">
          <span class="hud-card-title">Video Detector HUD</span>
          <span id="hudStatusDot" class="hud-dot offline"></span>
        </div>
        <div class="hud-card-body">
          <span id="hudStatusLabel" class="hud-status-text">HUD Offline</span>
          <span class="hud-address">ws://127.0.0.1:65432</span>
        </div>
        <button id="btnSidebarReconnect" class="btn-hud-reconnect" title="Reconnect to HUD">
          ⚡ Reconnect HUD
        </button>
      </div>
```

Remove `<button id="btnSidebarReconnectHub" ...>` and `<button id="btnSidebarReconnect" ...>` from both cards, preserving the minimalist telemetry structure:

```html
      <!-- Sidebar Footer Data Hub Status Widget (Minimalist Telemetry) -->
      <div class="sidebar-hud-card" title="SQLite Data Hub (ws://127.0.0.1:65433 WAL)">
        <div class="hud-card-header">
          <span class="hud-card-title">SQLite Data Hub</span>
          <span id="dataHubSidebarDot" class="hud-dot offline"></span>
        </div>
        <div class="hud-card-body">
          <span id="dataHubSidebarLabel" class="hud-status-text">Hub Offline</span>
          <span class="hud-address">ws://127.0.0.1:65433 (WAL)</span>
        </div>
      </div>

      <!-- Sidebar Footer HUD Status Widget (Minimalist Telemetry) -->
      <div class="sidebar-hud-card" title="Video Detector HUD (ws://127.0.0.1:65432)">
        <div class="hud-card-header">
          <span class="hud-card-title">Video Detector HUD</span>
          <span id="hudStatusDot" class="hud-dot offline"></span>
        </div>
        <div class="hud-card-body">
          <span id="hudStatusLabel" class="hud-status-text">HUD Offline</span>
          <span class="hud-address">ws://127.0.0.1:65432</span>
        </div>
      </div>
```

### Step 2.2: Compact Sidebar HUD CSS in `dashboard/styles/layout/header_sidebar.css` & `dashboard/dashboard.css`
Audit and adjust `.sidebar-hud-card` in `dashboard/styles/layout/header_sidebar.css` and `dashboard/dashboard.css`:
1. Reduce padding to compact proportions: `padding: 0.65rem 0.85rem`.
2. Ensure glowing LED status dots (`.hud-dot.online`, `.hud-dot.offline`) maintain crisp visual prominence.
3. Verify the sidebar scroll container fits comfortably on standard laptop screen heights without unnecessary vertical scrollbars.

### Step 2.3: Construct "Local Services & Hardware Bridges" Card in `#paneSettings`
In `dashboard/dashboard.html`, locate `#paneSettings` and `#tabContentSettings`. Insert the new `#cardHardwareBridges` as a prominent Bento card (e.g., right before `#cardAdvancedBackupRestore` or alongside General Settings):

```html
            <!-- Card: Local Services & Hardware Bridges -->
            <div id="cardHardwareBridges" class="settings-card bento-card liquid-glass-card bento-span-6 settings-section-card">
              <div class="settings-card-header">
                <span class="settings-card-icon">🔌</span>
                <div class="settings-card-title-group">
                  <h3 id="headingHardwareBridges" class="settings-card-title">Local Services & Hardware Bridges</h3>
                  <span id="subHardwareBridges" class="settings-card-sub">WebSocket daemons, SQLite storage engine, and peripheral telemetry</span>
                </div>
              </div>
              <div class="settings-card-body">
                <!-- Service 1: SQLite Data Hub Daemon -->
                <div class="bridge-service-row">
                  <div class="bridge-service-meta">
                    <div class="bridge-service-name-wrap">
                      <span class="bridge-service-icon">💾</span>
                      <span class="bridge-service-name">SQLite Data Hub Daemon</span>
                      <span class="bridge-port-badge">Port 65433 (WAL)</span>
                    </div>
                    <span class="bridge-service-desc">Local high-concurrency event telemetry & persistent database store</span>
                  </div>
                  <button id="btnSidebarReconnectHub" class="btn-hud-reconnect btn-bridge-action" title="Reconnect to SQLite Data Hub">
                    ⚡ Reconnect Hub
                  </button>
                </div>

                <!-- Service 2: Video Detector HUD Bridge -->
                <div class="bridge-service-row">
                  <div class="bridge-service-meta">
                    <div class="bridge-service-name-wrap">
                      <span class="bridge-service-icon">🖥️</span>
                      <span class="bridge-service-name">Video Detector HUD Bridge</span>
                      <span class="bridge-port-badge">Port 65432</span>
                    </div>
                    <span class="bridge-service-desc">Real-time overlay bridge for Windows desktop video sentinel</span>
                  </div>
                  <button id="btnSidebarReconnect" class="btn-hud-reconnect btn-bridge-action" title="Reconnect to HUD">
                    ⚡ Reconnect HUD
                  </button>
                </div>
              </div>
            </div>
```

> [!IMPORTANT]
> Notice that the button IDs `btnSidebarReconnectHub` and `btnSidebarReconnect` are **PRESERVED VERBATIM**. This guarantees that all click listeners in `dashboard.js` (lines 3454, 5299, 6174, 6324) bind directly and trigger reconnection smoothly.

### Step 2.4: Hardware Bridges Card Styling in `dashboard/styles/settings.css` & `dashboard/dashboard.css`
In `dashboard/styles/settings.css`, add dedicated styling for the new card:

```css
/* ========================================================================= */
/* LOCAL SERVICES & HARDWARE BRIDGES CARD (Settings Tab)                     */
/* ========================================================================= */
.bridge-service-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 1rem 0;
  border-bottom: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
}

.bridge-service-row:last-child {
  border-bottom: none;
  padding-bottom: 0.25rem;
}

.bridge-service-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.bridge-service-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bridge-service-icon {
  font-size: 1.1rem;
}

.bridge-service-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary, #f8fafc);
}

.bridge-port-badge {
  font-size: 0.72rem;
  font-family: var(--mono-font, 'JetBrains Mono', monospace);
  font-weight: 600;
  color: var(--accent-cyan, #06b6d4);
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.25);
  padding: 2px 7px;
  border-radius: 6px;
}

.bridge-service-desc {
  font-size: 0.8rem;
  color: var(--text-muted, #64748b);
  line-height: 1.35;
}

.btn-bridge-action {
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #fff;
  font-weight: 600;
  font-size: 0.84rem;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(8px);
}

body.theme-light .btn-bridge-action {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(8, 145, 178, 0.12));
  border-color: rgba(5, 150, 105, 0.35);
  color: #0f172a;
}

.btn-bridge-action:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25));
  border-color: var(--accent-emerald, #10b981);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-bridge-action:active {
  transform: scale(0.97);
}
```

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **Strict Invariant:** Do NOT rename or duplicate `#btnSidebarReconnectHub` and `#btnSidebarReconnect`.
- **Strict Invariant:** Preserve `#dataHubSidebarDot`, `#dataHubSidebarLabel`, `#hudStatusDot`, and `#hudStatusLabel` in the sidebar HUD cards to prevent telemetry script failures.
- **Strict Invariant:** Zero `.innerHTML` usage in all modifications.

---

## 📦 5. Deliverables Manifest

- `dashboard/dashboard.html`: Minimalist sidebar HUD cards and new `#cardHardwareBridges` in `#paneSettings`.
- `dashboard/styles/layout/header_sidebar.css`: Compact styling for `.sidebar-hud-card`.
- `dashboard/styles/settings.css`: Dedicated styles for `.bridge-service-row` and `.btn-bridge-action`.
- `dashboard/dashboard.css`: Master stylesheet parity.

---

## 🚦 6. Local Verification Gate

Execute the following verification steps before marking Phase 2 complete:
1. **DOM ID Preservation Check:** Verify both `id="btnSidebarReconnectHub"` and `id="btnSidebarReconnect"` exist in `dashboard/dashboard.html`.
2. **Sidebar Verification:** Confirm no `<button>` elements remain inside `.sidebar-hud-card`.
3. **Multi-Browser Filter Test:** Run `node tests/test_dashboard_multi_browser_filter.js` to ensure sidebar status dot assertions pass cleanly.
4. **Window Focus & Hub Retry Test:** Run `node tests/test_dashboard_window_focus_and_hub_retry.js` to ensure connection logic remains fully intact.
