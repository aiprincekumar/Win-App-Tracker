# Technical Requirements Document (TRD) — Popup 2-Tier Segmented Control & Hybrid Dynamic Navigation

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect & Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Target Path:** `temp_prompt/popup_2tier_navigation/TRD.md`  
> **Status:** `ACTIVE / SPECIFICATION_CERTIFIED`

---

## 🏛️ 1. Technical Architecture & Component Model

The 2-Tier navigation engine sits entirely inside the Chrome Extension's popup execution sandbox (`popup/popup.html`, `popup/popup.css`, `popup/popup.js`):

```mermaid
graph TD
    User([User Click]) --> Router[Hybrid Navigation Router]
    MediaEvent([Media State Poller]) --> Guard{userManualOverride?}
    
    Guard -->|true| Ignore[Ignore Event - Maintain Active Tab]
    Guard -->|false| RouteState[Evaluate Media Status]
    
    RouteState -->|hasActiveMedia: true| SwitchPlayback[switchTier1Category('playback', false)]
    RouteState -->|hasActiveMedia: false| SwitchAnalytics[switchTier1Category('analytics', false)]
    
    Router --> SyncTier1[Update #tier1SegmentedNav UI]
    Router --> FilterTier2[Filter .top-nav-tabs by data-group]
    Router --> ActivatePane[Toggle .tab-pane active]
    Router --> PersistStorage[Persist to chrome.storage.local]
```

---

## ⚙️ 2. Core Data Contracts & State Schemas

### 2.1 Runtime State Contract
```typescript
interface PopupNavigationState {
  activeTier1Category: 'playback' | 'studio' | 'analytics' | 'wellness';
  activeTopTab: 'media' | 'audio' | 'tools' | 'studio' | 'tracking' | 'domains' | 'sleep';
  userManualOverride: boolean;
  lastMediaPlaying: boolean;
}
```

### 2.2 Storage Schema Extensions (`browserAPI.storage.local`)
```json
{
  "active_tier1_category": "playback" | "studio" | "analytics" | "wellness",
  "active_popup_tab": "media" | "audio" | "tools" | "studio" | "tracking" | "domains" | "sleep"
}
```

### 2.3 Category Taxonomy Definition (`TIER1_CATEGORIES`)
```javascript
const TIER1_CATEGORIES = {
  playback: {
    id: 'tier1BtnPlayback',
    tabs: ['media', 'audio', 'tools'],
    defaultTab: 'media'
  },
  studio: {
    id: 'tier1BtnStudio',
    tabs: ['studio'],
    defaultTab: 'studio'
  },
  analytics: {
    id: 'tier1BtnAnalytics',
    tabs: ['tracking', 'domains'],
    defaultTab: 'tracking'
  },
  wellness: {
    id: 'tier1BtnWellness',
    tabs: ['sleep'],
    defaultTab: 'sleep'
  }
};
```

---

## 🛠️ 3. Function Interface Specifications

### 3.1 `switchTier1Category(category: string, isManual?: boolean): void`
- **Parameters:**
  - `category`: Target category key (`playback`, `studio`, `analytics`, `wellness`).
  - `isManual`: Boolean flag indicating if invoked via user click (default: `false`).
- **Behavior:**
  1. Validates `category` against `TIER1_CATEGORIES`.
  2. If `isManual === true`, sets `userManualOverride = true`.
  3. Updates `.tier1-nav-btn` classes (`.active`) and `aria-selected` attributes.
  4. Filters `.top-nav-tabs .top-tab-btn` by toggling `.tab-hidden` based on `data-group`.
  5. If `activeTopTab` is not within the selected category's allowed tabs, automatically invokes `switchTopTab(defaultTab, isManual)`.
  6. Persists `active_tier1_category` to local storage.

### 3.2 `switchTopTab(tabName: string, isManual?: boolean): void`
- **Parameters:**
  - `tabName`: Target tab identifier (`media`, `audio`, `tools`, `studio`, `tracking`, `domains`, `sleep`).
  - `isManual`: Boolean flag indicating user interaction (default: `false`).
- **Behavior:**
  1. Normalizes `tabName` (`focus` $\to$ `tracking`).
  2. If `isManual === true`, sets `userManualOverride = true`.
  3. Identifies parent category via `getCategoryForTab(normalized)`.
  4. If parent category is not currently active, updates Tier 1 buttons and child tab visibility filters.
  5. Updates `.top-tab-btn` active classes, `aria-selected` values, and toggles `.tab-pane.active`.
  6. Persists `active_popup_tab` to local storage.

### 3.3 `getCategoryForTab(tabKey: string): string`
- Utility function resolving a tab name to its owning category (`media` $\to$ `playback`, `sleep` $\to$ `wellness`, etc.).

---

## 🔒 4. Security & Compliance Architecture

1. **W3C Trusted Types & Content Security Policy (CSP):**
   - The extension operates under strict Chrome Manifest V3 CSP (`script-src 'self'`).
   - All DOM operations use `Element.classList.add/remove/toggle`, `Element.setAttribute`, and `Node.textContent`.
   - String concatenation directly into `innerHTML` is strictly banned.
2. **Deterministic Error Handling:**
   - Storage write calls are wrapped in `try { ... } catch (_) {}` blocks to prevent unhandled rejection crashes when extension context becomes invalidated.

---

## ⏱️ 5. Performance Budget & Resource Bounds

| Metric | Target Limit | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Tab Switch Latency** | $\le 16ms$ (1 frame @ 60fps) | Direct class toggling; zero repaint-inducing synchronous layout measurements. |
| **Memory Footprint Delta** | $\le 250$ KB | Lightweight plain JS objects; zero external libraries or heavy DOM clones. |
| **DOM Node Delta** | $+1$ `<nav>`, $+4$ `<button>`, $+8$ `<span>` | Negligible DOM expansion (~13 nodes). |
| **Startup Flash (CLS)** | $0.00$ | Synchronous class hydration during `DOMContentLoaded` before initial render. |
