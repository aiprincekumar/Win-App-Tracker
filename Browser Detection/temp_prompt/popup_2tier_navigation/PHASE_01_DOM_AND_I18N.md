# Phase 01: HTML DOM Restructuring & Bilingual i18n Parity

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Phase:** 01 of 04  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File(s):**  
> - [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html) (Lines ~38-75)  
> - [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) (Lines ~125-425, ~555-580)  
> - [`locales/en.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/locales/en.json)  
> - [`locales/hi.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/locales/hi.json)  
> **Assigned Role:** Level 4 Execution Subagent (Frontend Engineer)  
> **Status:** `PENDING_AUTHORIZATION`

---

## 🎯 1. Phase Objective
The objective of Phase 01 is to establish the semantic DOM foundation and bilingual localization dictionary for the 2-Tier Segmented Control architecture:
1. Inject the Tier 1 Category Segmented Navigation bar (`#tier1SegmentedNav`) directly above the existing `.top-nav-tabs` container.
2. Tag all 7 existing child tabs in `.top-nav-tabs` with category mapping attributes (`data-group="playback|studio|analytics|wellness"`).
3. Preserve 100% of the existing 7 tab IDs, data-view attributes, aria-controls, live status dots, and view pane containers.
4. Expand the embedded `I18N_POPUP` dictionary in `popup/popup.js` (and mirror in `locales/en.json`, `locales/hi.json`) with bilingual keys (`en` and `hi`) for all 4 category labels.
5. Update `applyPopupLanguage(lang)` in `popup/popup.js` to dynamically bind bilingual labels to Tier 1 navigation buttons.

---

## 📦 2. Prerequisites & Dependencies
- Pre-checks:
  - Working tree clean.
  - Node.js runtime available.
  - Verification test `tests/test_syntax_and_manifest_integrity.js` and `tests/test_popup_sleep_tab.js` currently pass.

---

## 🔍 3. Technical Context & File Anchors
- In [`popup/popup.html#L40-L73`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L40-L73), the 7 navigation buttons reside inside `<nav class="top-nav-tabs" role="tablist">`.
- Existing child tabs:
  1. `#mainTabMedia` (`data-view="media"`, controls `#viewMediaPane`) -> Group: `playback`
  2. `#mainTabAudio` (`data-view="audio"`, controls `#viewAudioPane`) -> Group: `playback`
  3. `#mainTabTools` (`data-view="tools"`, controls `#viewToolsPane`) -> Group: `playback`
  4. `#mainTabStudio` (`data-view="studio"`, controls `#viewStudioPane`) -> Group: `studio`
  5. `#mainTabTracking` (`data-view="tracking"`, controls `#viewTrackingPane`) -> Group: `analytics`
  6. `#mainTabDomains` (`data-view="domains"`, controls `#viewDomainsPane`) -> Group: `analytics`
  7. `#mainTabSleep` (`data-view="sleep"`, controls `#viewSleepPane`) -> Group: `wellness`
- In [`popup/popup.js#L134-L142`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L134-L142), tab translation tokens are declared under `I18N_POPUP.en` and `I18N_POPUP.hi`.
- In [`popup/popup.js#L557-L566`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L557-L566), `applyPopupLanguage` applies translated textContent via `setTxt()`.

---

## 🛠️ 4. Step-by-Step Surgical Instructions

### Step 1: Inject `#tier1SegmentedNav` into `popup/popup.html`
Directly above `<nav class="top-nav-tabs" role="tablist">`, insert the Tier 1 segmented container:

```html
    <!-- Tier 1: Top-Tier Category Segmented Control (Playback, Studio, Analytics, Wellness) -->
    <nav id="tier1SegmentedNav" class="tier1-segmented-nav" role="tablist" aria-label="Feature Category Navigation">
      <button id="tier1BtnPlayback" class="tier1-nav-btn active" data-category="playback" role="tab" aria-selected="true" aria-controls="topNavTabs" title="Media, Audio & Tools Controls">
        <span class="tier1-icon">🎬</span>
        <span id="tier1PlaybackText" class="tier1-label">Playback</span>
      </button>
      <button id="tier1BtnStudio" class="tier1-nav-btn" data-category="studio" role="tab" aria-selected="false" aria-controls="topNavTabs" title="Creative Clips & Studio Sessions">
        <span class="tier1-icon">📚</span>
        <span id="tier1StudioText" class="tier1-label">Studio</span>
      </button>
      <button id="tier1BtnAnalytics" class="tier1-nav-btn" data-category="analytics" role="tab" aria-selected="false" aria-controls="topNavTabs" title="Browsing Telemetry & Domain Activity">
        <span class="tier1-icon">⏱️</span>
        <span id="tier1AnalyticsText" class="tier1-label">Analytics</span>
      </button>
      <button id="tier1BtnWellness" class="tier1-nav-btn" data-category="wellness" role="tab" aria-selected="false" aria-controls="topNavTabs" title="Focus Sessions & Sleep Bedtime Automation">
        <span class="tier1-icon">🌙</span>
        <span id="tier1WellnessText" class="tier1-label">Wellness</span>
      </button>
    </nav>
```

### Step 2: Add `data-group` Attributes to Child Tabs in `popup/popup.html`
Tag each button inside `<nav id="topNavTabs" class="top-nav-tabs" role="tablist">` with its corresponding `data-group`:

```html
    <!-- Top Primary Multi-Tabs Navigation (Tier 2 Filtered Sub-Navigation) -->
    <nav id="topNavTabs" class="top-nav-tabs" role="tablist" aria-label="Sub-Tab Navigation">
      <button id="mainTabMedia" class="top-tab-btn active" data-group="playback" data-view="media" role="tab" aria-selected="true" aria-controls="viewMediaPane">
        <span class="top-tab-icon">🎬</span>
        <span id="topTabMediaText" class="top-tab-label">Media</span>
        <span id="tabMediaLiveDot" class="tab-live-dot hidden" title="Media Active"></span>
      </button>
      <button id="mainTabAudio" class="top-tab-btn" data-group="playback" data-view="audio" role="tab" aria-selected="false" aria-controls="viewAudioPane">
        <span class="top-tab-icon">🎛️</span>
        <span id="topTabAudioText" class="top-tab-label">Audio</span>
      </button>
      <button id="mainTabTools" class="top-tab-btn" data-group="playback" data-view="tools" role="tab" aria-selected="false" aria-controls="viewToolsPane">
        <span class="top-tab-icon">⚡</span>
        <span id="topTabToolsText" class="top-tab-label">Tools</span>
      </button>
      <button id="mainTabStudio" class="top-tab-btn tab-hidden" data-group="studio" data-view="studio" role="tab" aria-selected="false" aria-controls="viewStudioPane">
        <span class="top-tab-icon">📚</span>
        <span id="topTabStudioText" class="top-tab-label">Studio</span>
      </button>
      <button id="mainTabTracking" class="top-tab-btn tab-hidden" data-group="analytics" data-view="tracking" role="tab" aria-selected="false" aria-controls="viewTrackingPane">
        <span class="top-tab-icon">⏱️</span>
        <span id="topTabTrackingText" class="top-tab-label">Tracking</span>
      </button>
      <button id="mainTabDomains" class="top-tab-btn tab-hidden" data-group="analytics" data-view="domains" role="tab" aria-selected="false" aria-controls="viewDomainsPane">
        <span class="top-tab-icon">🌐</span>
        <span id="topTabDomainsText" class="top-tab-label">Domains</span>
      </button>
      <button id="mainTabSleep" class="top-tab-btn tab-hidden" data-group="wellness" data-view="sleep" role="tab" aria-selected="false" aria-controls="viewSleepPane" title="Sleep Timer & Bedtime Automation">
        <span class="top-tab-icon">🌙</span>
        <span id="topTabSleepText" class="top-tab-label">Sleep</span>
        <span id="tabSleepActiveDot" class="tab-live-dot hidden" title="Sleep Timer Active"></span>
      </button>
    </nav>
```

> **Notice:** The default initial state is `playback` category active; therefore, `#mainTabMedia`, `#mainTabAudio`, and `#mainTabTools` do not have `.tab-hidden`, while the remaining 4 tabs start with `.tab-hidden`.

### Step 3: Expand `I18N_POPUP` in `popup/popup.js`
In the `I18N_POPUP` structure in `popup/popup.js`:
Add the following keys to `en`:
```javascript
    // Tier 1 Navigation Categories
    tier1_playback: 'Playback',
    tier1_studio: 'Studio',
    tier1_analytics: 'Analytics',
    tier1_wellness: 'Wellness',
```
Add the following keys to `hi`:
```javascript
    // Tier 1 Navigation Categories (Hindi Localization)
    tier1_playback: 'प्लेबैक',
    tier1_studio: 'स्टूडियो',
    tier1_analytics: 'एनालिटिक्स',
    tier1_wellness: 'वेलनेस',
```

### Step 4: Update `applyPopupLanguage` in `popup/popup.js`
Within `applyPopupLanguage(lang)`:
```javascript
  setTxt('tier1PlaybackText', 'tier1_playback');
  setTxt('tier1StudioText', 'tier1_studio');
  setTxt('tier1AnalyticsText', 'tier1_analytics');
  setTxt('tier1WellnessText', 'tier1_wellness');
```

### Step 5: Mirror Tokens in `locales/en.json` and `locales/hi.json`
Add the 4 keys to `locales/en.json`:
```json
  "tier1_playback": "Playback",
  "tier1_studio": "Studio",
  "tier1_analytics": "Analytics",
  "tier1_wellness": "Wellness",
```
And to `locales/hi.json`:
```json
  "tier1_playback": "प्लेबैक",
  "tier1_studio": "स्टूडियो",
  "tier1_analytics": "एनालिटिक्स",
  "tier1_wellness": "वेलनेस",
```

---

## 🚫 5. Constraints & Architectural Invariants
1. **ZERO Modification to Backend Services:** No edits permitted to `background.js`, `manifest.json`, WebSockets, native daemons, or Python telemetry servers.
2. **Tab ID Preservation:** DO NOT delete or rename `#mainTabMedia`, `#mainTabAudio`, `#mainTabTools`, `#mainTabStudio`, `#mainTabTracking`, `#mainTabDomains`, or `#mainTabSleep`.
3. **W3C Trusted Types & CSP Security:** Strictly use `textContent` and `setAttribute`. No `innerHTML` or `eval()`.
4. **UTF-8 Character Encoding:** Ensure Hindi Devanagari script is saved with clean UTF-8 encoding.

---

## 📑 6. Deliverables Manifest
- `popup/popup.html`: `#tier1SegmentedNav` injected, `data-group` added to 7 child tabs.
- `popup/popup.js`: `I18N_POPUP` extended with `en` and `hi` keys; `applyPopupLanguage` updated.
- `locales/en.json`: Mirror tokens added.
- `locales/hi.json`: Mirror tokens added.

---

## 🧪 7. Local Verification Gate
Execute the following verification scripts via node:
```bash
node tests/test_syntax_and_manifest_integrity.js
node tests/test_popup_sleep_tab.js
node -c popup/popup.js
```
**Pass Criteria:**
- Exit code 0 across all 3 verification commands.
- `test_popup_sleep_tab.js` continues to report 100% pass on all 7 navigation tabs.
