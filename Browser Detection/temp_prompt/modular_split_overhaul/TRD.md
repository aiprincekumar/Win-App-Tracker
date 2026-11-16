# Technical Requirements Document (TRD): Modular Industrial Split Overhaul

> **Document Type:** Technical Architecture, HLD/LLD Specification & System Contracts  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/TRD.md`](TRD.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Lead Department:** Dept 02 (Solution Architecture) & Dept 06 (Backend & API Engineering)  
> **Target System:** Web Activity & Media Sentinel (Chrome / Edge / Firefox MV3 Extension)  
> **Status:** SPECIFICATION COMPLETE  

---

## 🏛️ 1. High-Level Design (HLD) Architecture

### 1.1 Architecture Topology
The Web Activity & Media Sentinel extension operates across four distinct execution environments with varying execution models:
1. **Background Service Worker (`background.js`):** Runs in Chrome Extension MV3 Service Worker context (event-driven, transient lifecycle, native ES module support).
2. **Content Scripts (`content_media.js`, `fullscreen_controller.js`):** Runs in isolated world per tab (DOM access, restricted Chrome APIs, postMessage bridge).
3. **Main World Injections (`inject_main_world.js`):** Injected directly into page context (`world: "MAIN"`) to intercept HTMLMediaElement, Web Audio API, and native YouTube player prototypes.
4. **Presentation Extensions (`dashboard/`, `popup/`):** Classic HTML/JS/CSS web pages running inside Chrome extension views.

```
                    ┌──────────────────────────────────────────────┐
                    │           Chrome Extension Runtime           │
                    └──────────────────────────────────────────────┘
                                          │
            ┌─────────────────────────────┼────────────────────────────┐
            ▼                             ▼                            ▼
┌───────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────┐
│ Background Service    │   │ Content & Injection Tier  │   │ Presentation Tier     │
│ Worker (MV3)          │   │ (Isolated + Main World)   │   │ (Dashboard & Popup)   │
├───────────────────────┤   ├───────────────────────────┤   ├───────────────────────┤
│ background.js (Facade)│   │ content_media.js (Facade) │   │ dashboard.js (Facade) │
│ ├── src/background/   │   │ ├── src/content/          │   │ ├── src/dashboard/    │
│ │   ├── config/       │   │ │   ├── media/            │   │ │   ├── charts/       │
│ │   ├── handlers/     │   │ │   ├── fullscreen/       │   │ │   ├── audio/        │
│ │   ├── state/        │   │ │   └── observers/        │   │ │   ├── palette/      │
│ │   ├── storage/      │   │ ├── src/inject/           │   │ │   └── scrubber/     │
│ │   ├── telemetry/    │   │ │   ├── player/           │   │ popup.js (Facade)     │
│ │   └── ws/           │   │ │   └── osd/              │   │ ├── src/popup/        │
│ └── src/shared/       │   │ └── src/fullscreen/       │   │ │   ├── tabs/         │
│     ├── constants.js  │   │     └── native_engine.js  │   │ │   └── components/   │
│     ├── contracts.js  │   │                           │   │ dashboard.css &       │
│     └── formatters.js │   │                           │   │ popup.css (Master)    │
└───────────────────────┘   └───────────────────────────┘   └───────────────────────┘
```

---

## 🔬 2. Low-Level Design (LLD): The Dual-Environment Compatibility Problem & Facade Pattern

### 2.1 The Dual-Environment Challenge
- **Environment 1: Node.js Test Harness (`vm.Script` & `node -c`)**
  - 39 test suites in `tests/` load extension scripts using `fs.readFileSync('<file>', 'utf8')` and execute `new vm.Script(code)`.
  - Classic `vm.Script` parses files in **script mode**, NOT **module mode**. If a file contains `import` or `export` keywords outside an ES module context, Node.js throws:  
    `SyntaxError: Cannot use import statement outside a module`
  - Furthermore, tests inspect exported globals on the evaluated context object or check `css.includes(...)` on raw stylesheet text.
- **Environment 2: Browser & Service Worker Runtime**
  - `background.js` is declared as `"type": "module"` in `manifest.json`.
  - `popup.html` and `dashboard.html` load `<script src="popup.js"></script>` and `<script src="dashboard.js"></script>`.
  - Content scripts are injected via `manifest.json` as array of file paths.

### 2.2 The Universal Facade / Barrel Aggregator Solution
To achieve modularity without breaking tests:
1. **Root Facade Pattern:** Root files (`dashboard.js`, `popup.js`, `background.js`, `content_media.js`, etc.) remain at their canonical manifest locations.
2. **Universal Module Definition (UMD) / Dynamic Bridge:** Modular files in `src/` use universal environment detection:
   ```javascript
   (function(root, factory) {
     if (typeof module === 'object' && typeof module.exports === 'object') {
       module.exports = factory();
     } else if (typeof define === 'function' && define.amd) {
       define([], factory);
     } else {
       root.DashboardAudioLab = factory();
     }
   })(typeof globalThis !== 'undefined' ? globalThis : this, function() {
     // Module logic here
     return { ... };
   });
   ```
3. **Root Aggregator Resolution:** Root files aggregate sub-modules cleanly:
   - In Node.js / CommonJS test context: `require('./src/...')` loads modules.
   - In Browser context: Sub-modules loaded via standard dependency order or inlined barrel aggregator.
   - All exported identifiers (e.g. `DASHBOARD_EQ_PRESETS`, `OmniCommandPaletteController`, `PrecisionTimelineScrubber`, `escapeCsvCell`) are attached to both `globalThis` and `module.exports` when available.

---

## 📐 3. Subsystem Domain Breakdown & Target Directory Topology

```
Browser Detection/
├── background.js                       (Root Facade - 350 lines, down from 3,132)
├── content_media.js                    (Root Facade - 300 lines, down from 2,378)
├── fullscreen_controller.js            (Root Facade - 200 lines, down from 792)
├── inject_main_world.js                (Root Facade - 250 lines, down from 1,262)
├── manifest.json
│
├── dashboard/
│   ├── dashboard.html                  (Sanitized template - 1,112 lines)
│   ├── dashboard.js                    (Root Facade - 450 lines, down from 5,638)
│   ├── dashboard.css                   (Master Stylesheet Aggregator)
│   └── styles/                         (Modular CSS Directory)
│       ├── tokens.css                  (Design tokens, colors, glassmorphism)
│       ├── layout.css                  (Sidebar, grid, bento layout)
│       ├── tracking.css                (Time tracking pane, stat cards)
│       ├── media.css                   (Media hero, mini dock, scrubbers)
│       ├── audio_lab.css               (5-band EQ, boost sliders, presets)
│       ├── palette.css                 (Omni command palette modal)
│       ├── hotkeys.css                 (Cheat sheet modal)
│       └── themes.css                  (Theme dark, light, high contrast)
│
├── popup/
│   ├── popup.html                      (Sanitized template - 753 lines)
│   ├── popup.js                        (Root Facade - 350 lines, down from 3,750)
│   ├── popup.css                       (Master Stylesheet Aggregator)
│   └── styles/                         (Modular Popup CSS Directory)
│       ├── base.css                    (Popup reset, sizing 380x600, typography)
│       ├── header.css                  (Status badges, HUD/Hub indicators)
│       ├── tabs.css                    (6-tab strip, view panes)
│       ├── quick_settings.css          (Automation toggles, controls)
│       ├── audio_lab.css               (Bento card, sliders, presets)
│       └── themes.css                  (Dark, light, high-contrast modes)
│
└── src/
    ├── shared/                         (Cross-tier contracts & utilities)
    │   ├── constants.js                (App constants, ports 65432/65433)
    │   ├── contracts.js                (IPC message types, schemas)
    │   ├── dom_utils.js                (W3C Trusted Types safe DOM builders)
    │   └── formatters.js               (RFC 4180 CSV, HH:MM:SS formatters)
    │
    ├── core/                           (Core mathematical and messaging utilities)
    │   ├── math-utils.js               (Interpolation, easing curves)
    │   ├── safe-messaging.js           (Safe tab messaging, error suppressors)
    │   └── i18n.js                     (Bilingual Hindi/English dictionary)
    │
    ├── background/                     (Service worker modular domain)
    │   ├── config/config_manager.js    (Thresholds, timeouts, defaults)
    │   ├── handlers/alarm_handlers.js  (Chrome alarms dispatcher)
    │   ├── handlers/idle_handlers.js   (Idle state detector)
    │   ├── handlers/message_router.js  (Runtime IPC message router)
    │   ├── handlers/tab_listeners.js   (Tab lifecycle events)
    │   ├── state/state_manager.js      (Domain state accumulator)
    │   ├── storage/storage_manager.js  (chrome.storage.local sync)
    │   ├── telemetry/domain_tracker.js (Active domain timer engine)
    │   └── ws/data_hub_client.js       (WebSocket clients for HUD & Hub)
    │
    ├── content/                        (Isolated-world content scripts)
    │   ├── media/element_detector.js   (HTML5 video/audio DOM finder)
    │   ├── media/playback_tracker.js   (Playback state & timing observer)
    │   ├── fullscreen/floating_hud.js  (In-page video HUD overlay)
    │   ├── bridge/isolated_bridge.js   (postMessage bridge to MAIN world)
    │   └── observers/dom_observer.js   (MutationObserver for SPA navigations)
    │
    ├── inject/                         (Main-world scripts)
    │   ├── player/html5_controller.js  (Direct media element controller)
    │   ├── player/youtube_context.js   (YouTube API & element hook)
    │   ├── osd/osd_manager.js          (On-Screen Display safe renderer)
    │   └── audio/web_audio_dsp.js      (AudioContext, BiquadFilter 5-band EQ)
    │
    ├── fullscreen/                     (Fullscreen engine)
    │   ├── native_engine.js            (True native fullscreen requester)
    │   └── web_fullscreen_engine.js    (CSS web-fullscreen fallback)
    │
    ├── dashboard/                      (Dashboard controllers)
    │   ├── state/dashboard_state.js    (Store & active tab tracking)
    │   ├── charts/donut_chart.js       (SVG donut chart renderer)
    │   ├── charts/time_series_chart.js (Time series bar renderer)
    │   ├── components/domain_table.js  (Top domains table renderer)
    │   ├── filters/browser_filter.js   (Multi-browser filtering logic)
    │   ├── services/csv_exporter.js    (RFC 4180 CSV exporter with BOM)
    │   ├── audio/audio_lab_controller.js (Dashboard 5-band EQ & boost UI)
    │   ├── palette/omni_palette.js     (OmniCommandPaletteController)
    │   └── scrubber/scrubber.js        (PrecisionTimelineScrubber)
    │
    └── popup/                          (Popup controllers)
        ├── state/popup_state.js        (Store & hydration)
        ├── components/header_badges.js (Header HUD/Hub/Time badges)
        ├── services/ipc_service.js     (Runtime IPC to background)
        └── tabs/                       (Individual tab controllers)
            ├── tab_quick.js            (Quick Settings tab)
            ├── tab_media.js            (Media Player tab)
            ├── tab_automations.js      (Smart Automations tab)
            ├── tab_wellness.js         (Digital Wellness & Alarms)
            ├── tab_audio.js            (Audio Lab & Equalizer)
            └── tab_settings.js         (Settings & Sync tab)
```

---

## 🔒 4. Data Contracts & State Management

### 4.1 Audio DSP Preset Data Contract
```javascript
export const DASHBOARD_EQ_PRESETS = {
  flat: [0, 0, 0, 0, 0],
  bass_boost: [6, 4, 0, -1, -2],
  vocal: [-2, 1, 5, 3, -1],
  treble: [-3, -1, 1, 4, 6],
  electronic: [5, 3, -1, 2, 4],
  rock: [4, 2, -2, 2, 5],
  classical: [4, 2, 0, 2, 4],
  cinema: [5, 2, 0, 3, 5],
  night_mode: [-6, -3, 2, 1, -4]
};
```

### 4.2 CSV Exporter RFC 4180 Contract
- Leading character `\uFEFF` (UTF-8 BOM).
- OWASP Formula Injection Neutralization: Cells starting with `=`, `+`, `-`, `@`, `\t`, `\r` are prefixed with a single quote (`'`).
- Record Delimiter: CRLF (`\r\n`).
- Field Enclosure: Double quotes (`"`) around fields containing commas, double quotes, or newlines, with internal quotes escaped as `""`.

---

## 🛡️ 5. Security Controls & Error Budgets

1. **W3C Trusted Types Guard:** No dynamic string interpretation via `innerHTML`. Dynamic elements are created using `document.createElement()` and text assigned via `textContent`.
2. **Context Invalidation Guard:** All Chrome API calls (`chrome.runtime.sendMessage`, `chrome.storage.local.get`) are wrapped in `isContextValid()` checks to prevent uncaught "Extension context invalidated" errors during live reloads.
3. **Throttled WebSocket Reconnection:** Backoff ladder `[5000, 15000, 30000, 60000, 120000]` ms with max 3 consecutive failures before entering a paused state to prevent CPU spin.
4. **Secret Scanning:** Strict zero-leak tolerance audited via `gitleaks detect --redact` before any phase signoff.
