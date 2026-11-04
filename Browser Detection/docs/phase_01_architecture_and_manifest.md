# Phase 01: Extension Architecture, Manifest V3 & Cross-Browser Foundation

> **Phase ID:** `phase_01_architecture_and_manifest`  
> **Parent Task:** `browser_detection_extension_v1`  
> **Department:** Department 02: Solution Architecture & Department 05: Frontend Engineering  
> **Assigned Role:** `extension_architecture_specialist`  
> **Status:** Ready for Execution  

---

## 1. Objective & Scope

Establish the fundamental architecture, folder topology, Manifest V3 configuration, permission sets, and cross-browser API wrappers for the **Web Activity & Media Sentinel** extension inside:
`Browser Detection/`

Target Browsers:
- **Primary:** Google Chrome (v110+) & Microsoft Edge (v110+)
- **Secondary (Modular Ready):** Mozilla Firefox (MV3 with browser_specific_settings), Brave, Opera, Vivaldi.

---

## 2. Directory Topology

```
Browser Detection/
├── manifest.json                  # Manifest V3 configuration
├── background.js                  # Background Service Worker & orchestration
├── content_media.js               # Content script injected across all pages
├── icons/                         # Extension icons
│   ├── icon16.png                 # 16x16 px toolbar/favicon
│   ├── icon32.png                 # 32x32 px Windows High-DPI
│   ├── icon48.png                 # 48x48 px Extensions management page
│   └── icon128.png                # 128x128 px Web Store / Edge Add-ons
├── popup/                         # Interactive Glassmorphic Dashboard
│   ├── popup.html                 # Markup for donut chart, domain list & media card
│   ├── popup.css                  # Modern cyber-glass dark styles
│   └── popup.js                   # SVG donut chart, tab switcher & telemetry listener
├── docs/                          # Architecture diagrams and specifications
└── README.md                      # Comprehensive installation and user guide
```

---

## 3. Manifest V3 Technical Specification

### 3.1 Permissions Rationale
- `"tabs"`: Required to read tab URLs, titles, active status, and window association.
- `"activeTab"`: Grants temporary elevated permissions when the user invokes the extension popup.
- `"storage"`: Local persistent key-value store (`chrome.storage.local`) for domain watch time, session counts, and configuration without quota limits.
- `"idle"`: Detects operating system and browser idle/locked state (`chrome.idle.queryState`, `chrome.idle.onStateChanged`) to freeze time counters when user steps away.
- `"alarms"`: Wakes up the MV3 Service Worker periodically to flush in-memory time buffers and verify WebSocket connection health without timer drift.
- `"host_permissions": ["<all_urls>"]`: Enables `content_media.js` to inspect `<video>` and `<audio>` elements across all websites (YouTube, Netflix, Twitch, Coursera, news, internal media players).

### 3.2 Cross-Browser Abstraction Layer (`chrome` vs `browser`)
To maintain compatibility between Chromium engines (`chrome.*`) and Gecko/Firefox (`browser.*`), provide a standard cross-browser runtime wrapper at the top of scripts:
```javascript
const browserAPI = typeof globalThis.browser !== 'undefined' ? globalThis.browser : globalThis.chrome;
```

---

## 4. Acceptance Criteria & Test Gate

- [ ] `Browser Detection/manifest.json` is syntactically valid JSON.
- [ ] Manifest version is strictly `3`.
- [ ] Background service worker is registered as `"background.js"` with `"type": "module"`.
- [ ] Content script is registered for `<all_urls>` with `"run_at": "document_start"` and `"all_frames": true`.
- [ ] 4 icon assets exist and are loadable.
- [ ] Successfully loads in Chrome Developer Mode (`chrome://extensions`) and Edge (`edge://extensions`) with zero warnings or errors.
