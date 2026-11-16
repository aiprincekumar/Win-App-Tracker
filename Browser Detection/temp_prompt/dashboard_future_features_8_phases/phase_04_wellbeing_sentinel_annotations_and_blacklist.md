# Phase 4: Wellbeing Sentinel, Annotations & Blacklist (Features 7 & 8)
## Standalone Executable Implementation Specification

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001` (Phase 4)  
> **Target Subsystems:** Feature 7 (Annotations & Blacklist) & Feature 8 (Wellbeing & Pomodoro)  
> **Assigned Role:** Level 4 Full-Stack / Systems Engineer  
> **Required Skills:** `frontend-patterns`, `backend-patterns`, `javascript`, `security-review`  
> **Target Test Gate:** `tests/test_dashboard_features_phase4.js` (Must pass with Exit Code 0)  
> **Master Reference:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Parent Ephemeral:** `temp_prompt/dashboard_future_features_8_phases/`  

---

## 🎯 1. Phase Objective

Implement **Feature 7 (Domain Annotations, Bookmarks & Exclusion Blacklist)** and **Feature 8 (Digital Wellbeing Sentinel & Doom-Scrolling Guard)** across the Sentinel Dashboard, background service worker, and content scripts.
This enables users to:
1. Star/pin critical client domains to the top of the analytics table with a single click.
2. Add custom project notes/annotations to any domain, visible in tooltips and searchable in real time.
3. Configure a Privacy Tracking Exclusion Blacklist in `#cardTrackingBlacklist` supporting wildcards (e.g., `localhost:*`, `192.168.*:*`, `*bank*`).
4. Enforce a strict zero-tracking policy in `background.js` (0 active seconds recorded for blacklisted domains) with a retroactive purge button.
5. Set per-domain daily time budgets with visual alert badges (80% gentle notice, 100% budget reached).
6. Deploy a doom-scrolling velocity heuristic in `content_media.js` providing a gentle "Take a Breath" pause on infinite scroll feeds.
7. Run an integrated Pomodoro timer widget (25m Focus / 5m Break) in the dashboard that auto-pauses hero media and sounds a gentle chime at break times.

---

## 📦 2. Prerequisites & Environment State

- Phases 1, 2, and 3 completed and certified clean via Test Gates 1, 2, and 3.
- Certified codebase: `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`, `background.js`, `content_media.js`.
- Active working memory: [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) and [`project_feature_memory.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md).

---

## 🔍 3. Technical Context & File Anchors

- `background.js`:
  - Locate `recordActiveTabTime()` and `updateActiveTab()` (lines 100-250).
  - Add `isBlacklisted(url)` check: if true, immediately return without incrementing active seconds.
  - Add IPC message handler for `UPDATE_TRACKING_BLACKLIST` and `PURGE_DOMAIN_HISTORY`.
  - Add budget enforcement check in the periodic 60-second alarm.
- `content_media.js`:
  - Add infinite scroll velocity monitor tracking scroll depth and timestamp.
  - If continuous feed scrolling exceeds 20 minutes without interruption, show a non-intrusive "Take a Breath" overlay.
- `dashboard/dashboard.html`:
  - In `#domainAnalyticsTable`, add a star icon button `<button class="btn-star-domain">⭐</button>` and notes icon in each row.
  - In Settings pane, add `#cardTrackingBlacklist` with pattern chip list, input field, and "Purge Records" button.
  - In sidebar or header, add `#widgetPomodoroSentinel` with countdown display, mode label, and controls.
- `dashboard/dashboard.js`:
  - Merge `DASHBOARD_FUTURE_I18N` keys for Features 7 & 8 into `en` and `hi`.
  - Implement `toggleDomainPin(domain)` and `saveDomainNote(domain, note)`.
  - Implement `loadTrackingBlacklist()`, `addBlacklistPattern(pattern)`, `removeBlacklistPattern(pattern)`, and `purgeDomainData(domain)`.
  - Implement `initPomodoroWidget()`, `startPomodoro()`, `pausePomodoro()`, `resetPomodoro()`, and `handlePomodoroBreak()`.
- `dashboard/dashboard.css`:
  - Star icon states, domain note tooltip popovers.
  - Blacklist tag chips and deletion buttons.
  - Pomodoro timer widget styling and pulse animations.
  - Budget alert badges in domain table.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Background Service Worker Blacklist Enforcement
1. Open `background.js`.
2. Load `tracking_blacklist` array from `chrome.storage.local`.
3. Implement `matchesBlacklist(urlOrDomain, patterns)`:
   - Evaluates wildcards (`localhost:*`, `192.168.*:*`, `*.corp`).
4. In active tab tracking logic, insert:
   ```javascript
   if (matchesBlacklist(tabUrl, cachedBlacklist)) {
     return; // Zero-tracking policy: 0 seconds recorded
   }
   ```
5. Handle IPC action `PURGE_DOMAIN_HISTORY`:
   - Iterates all dates in `trackingHistory` and removes entries for `message.domain`.
   - Persists cleaned history and broadcasts `DATA_PURGED`.

### Step 2: Content Script Doom-Scroll Velocity Monitor
1. Open `content_media.js`.
2. Implement `initDoomScrollGuard()`:
   - Listens to `window.addEventListener('scroll', throttle(onScroll, 1000))`.
   - Tracks total scroll delta and continuous active duration on social/feed platforms (e.g. YouTube Shorts, Reddit, Twitter/X).
   - If duration $> 20\text{ minutes}$ with high scroll velocity, renders a gentle floating card: "🧘 Take a Breath - You've been scrolling for 20 minutes". Card automatically fades out after 8 seconds or upon user click.

### Step 3: Domain Annotations & Starred Pins in `dashboard/dashboard.html` & `js`
1. In `dashboard/dashboard.js` `renderDomainTable()`:
   - Read `pinned_domains` array and `domain_notes` map from storage.
   - Sort table rows putting pinned domains (`starred === true`) at the top.
   - Prepend `<button class="btn-star-domain" data-domain="${d}">⭐</button>`.
   - Add notes indicator `<span class="domain-note-icon" title="${note || 'Add note'}">📝</span>`.
2. Wire click handlers to toggle pin status and open inline note editor.
3. Save updates to `chrome.storage.local`.

### Step 4: Tracking Blacklist Management UI in `dashboard/dashboard.html` & `js`
1. In Settings pane, insert `#cardTrackingBlacklist`:
   ```html
   <div id="cardTrackingBlacklist" class="card">
     <h3 id="txtBlacklistTitle">🛡️ Privacy Tracking Exclusion Blacklist</h3>
     <p id="txtBlacklistDesc" class="section-desc">Domains matching these patterns will never be recorded in history.</p>
     <div class="blacklist-input-row">
       <input type="text" id="inputBlacklistPattern" class="form-input" placeholder="e.g. localhost:*, 192.168.*:*">
       <button id="btnAddBlacklistPattern" class="btn btn-primary">Add Pattern</button>
     </div>
     <div id="blacklistChipsContainer" class="blacklist-chips-grid"></div>
     <div class="blacklist-purge-row">
       <input type="text" id="inputPurgeDomain" class="form-input" placeholder="domain to purge e.g. localhost">
       <button id="btnPurgeDomainHistory" class="btn btn-danger">🗑️ Purge Historical Data</button>
     </div>
   </div>
   ```
2. In `dashboard/dashboard.js`, implement chip rendering, pattern addition, deletion, and purge dispatch.

### Step 5: Integrated Pomodoro Sentinel in `dashboard/dashboard.html` & `js`
1. In sidebar navigation or header, add `#widgetPomodoroSentinel`:
   ```html
   <div id="widgetPomodoroSentinel" class="card pomodoro-card">
     <div class="pomodoro-header">
       <span id="txtPomodoroTitle">🧘 Focus Sentinel & Pomodoro</span>
       <span id="pomodoroModeBadge" class="badge badge-focus">Focus (25m)</span>
     </div>
     <div id="pomodoroTimeDisplay" class="pomodoro-time">25:00</div>
     <div class="pomodoro-controls">
       <button id="btnStartPomodoro" class="btn btn-sm btn-primary">▶️ Start</button>
       <button id="btnPausePomodoro" class="btn btn-sm btn-secondary">⏸️ Pause</button>
       <button id="btnResetPomodoro" class="btn btn-sm btn-secondary">🔄 Reset</button>
     </div>
   </div>
   ```
2. Implement timer countdown using 1-second interval or `chrome.alarms`.
3. When 25 minutes elapse, switch to 5-minute break mode:
   - Play Web Audio chime.
   - Send IPC to pause active hero media.
   - Show notification badge.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries

- **Zero-innerHTML:** Safe DOM construction for chips, notes, and alerts.
- **Strict Zero-Tracking Policy:** Never record even 1 millisecond of time on blacklisted origins.
- **Non-Disruptive Wellbeing:** Doom-scroll alerts must be non-blocking and never forcefully close tabs or prevent user interaction.

---

## 📋 6. Deliverables Manifest

1. `background.js` (Blacklist filter logic, `PURGE_DOMAIN_HISTORY` handler).
2. `content_media.js` (Doom-scroll velocity detector and gentle pause notice).
3. `dashboard/dashboard.html` (Blacklist card, Pomodoro widget, star icons, notes).
4. `dashboard/dashboard.js` (Pinning, annotations, blacklist manager, Pomodoro timer).
5. `dashboard/dashboard.css` (Blacklist chips, Pomodoro styling, star badges).
6. `tests/test_dashboard_features_phase4.js` (Automated verification test suite).

---

## 🧪 7. Local Verification Gate (Test Gate 4)

Execute the dedicated test suite:
```powershell
node tests/test_dashboard_features_phase4.js
node -c background.js
node -c content_media.js
node -c dashboard/dashboard.js
```

### Acceptance Criteria:
1. `tests/test_dashboard_features_phase4.js` exits with code 0.
2. Background engine verifies that URLs matching blacklist patterns record 0 active seconds.
3. Retroactive purge completely removes targeted domain entries across all historical dates.
4. Starred domains pin to the top of the analytics table.
5. Pomodoro timer transitions from 25m focus to 5m break, pauses media, and plays audio chime.
6. Node.js AST check (`node -c`) reports 0 syntax errors across all touched files.
7. All files verified UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
