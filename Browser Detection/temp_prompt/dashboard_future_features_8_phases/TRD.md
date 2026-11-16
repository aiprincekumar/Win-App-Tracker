# Web Activity & Media Sentinel - Dashboard Future Features (8 Capabilities Across 4 Phases)
## Technical Requirements Document (TRD)

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Architecture Standard:** MV3 Service Worker, Modular Feature Registry, Event IPC, W3C Safe DOM  
> **Master Reference:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Ephemeral Container:** `temp_prompt/dashboard_future_features_8_phases/`  

---

## 🏛️ 1. High-Level Architecture (HLD)

The future dashboard architecture integrates modular feature extensions with existing core subsystems:

```
+---------------------------------------------------------------------------------------------------------+
|                                  DASHBOARD RUNTIME (dashboard.html / dashboard.js)                       |
|                                                                                                         |
|  +-------------------+  +--------------------+  +----------------------+  +--------------------------+  |
|  | Temporal & Heatmap|  | Productivity Engine|  | Multi-Tab Media Deck |  | Audio Canvas Visualizer  |  |
|  | (Feature 1)       |  | (Feature 2)        |  | (Feature 3)          |  | (Feature 4)              |  |
|  +-------------------+  +--------------------+  +----------------------+  +--------------------------+  |
|  | Backup & Snapshots|  | Executive Digest   |  | Annotations/Blacklist|  | Wellbeing & Pomodoro     |  |
|  | (Feature 5)       |  | (Feature 6)        |  | (Feature 7)          |  | (Feature 8)              |  |
|  +-------------------+  +--------------------+  +----------------------+  +--------------------------+  |
|                                                                                                         |
|  [Modular Feature Manager: src/dashboard/features/dashboard_feature_manager.js]                          |
|  [Universal Feature Registry: src/core/feature_registry.js]                                            |
|  [Bilingual Dictionary: DASHBOARD_I18N (en / hi)]                                                        |
+---------------------------------------------------------------------------------------------------------+
       |                                                                                |
       | Chrome Runtime IPC                                                             | WebSocket (ws://)
       v                                                                                v
+---------------------------------------------+               +-------------------------------------------+
| BACKGROUND SERVICE WORKER (background.js)   |               | NATIVE SQLITE DATA HUB (Port 65433)       |
| - Privacy Blacklist Filter (Strict 0-Track) |               | - SQLite WAL Mode Daemon                  |
| - Multi-Tab Audible Stream Aggregator       |               | - Bidirectional History Sync & Delta      |
| - 5s In-flight Atomic Telemetry Commit      |               | - Table Replication & Schema v2.0         |
| - 7-Day Rolling Snapshot Alarm Scheduler    |               +-------------------------------------------+
+---------------------------------------------+
```

---

## 💾 2. Data Schemas & TypeScript Definitions

### 2.1 Chrono-Heatmap & Temporal Types (Feature 1)

```typescript
export interface ChronoHourBucket {
  hour: number;          // 0 to 23
  dayOfWeek: number;     // 0 (Monday) to 6 (Sunday)
  activeSeconds: number; // Active browsing duration
  mediaSeconds: number;  // Video/Audio playback duration
  topDomain: string;     // Primary domain during this hour
  sessionCount: number;  // Number of distinct tab interactions
}

export interface TemporalQueryRange {
  mode: 'today' | 'yesterday' | '7d' | '30d' | 'custom';
  startDate: string;     // ISO format YYYY-MM-DD
  endDate: string;       // ISO format YYYY-MM-DD
}

export interface HeatmapMatrix {
  days: ChronoHourBucket[][]; // 7 rows x 24 columns
  totalActiveTime: number;
  totalMediaTime: number;
  wowDeltaPercent: number;    // Week-over-week percentage change
}
```

### 2.2 Productivity & Domain Classification Types (Feature 2)

```typescript
export type DomainCategory = 'work' | 'learning' | 'entertainment' | 'social' | 'utility';

export interface DomainCategoryOverride {
  category: DomainCategory;
  assignedAt: number; // UNIX timestamp
  isCustom: boolean;
}

export interface ProductivitySummary {
  score: number; // 0 to 100 clamped
  tier: 'focus' | 'balanced' | 'distracted';
  timeByCategory: Record<DomainCategory, number>; // in seconds
  totalActiveTime: number;
}
```

### 2.3 Multi-Tab Media Stream Types (Feature 3)

```typescript
export interface MediaStreamTabInfo {
  tabId: number;
  windowId: number;
  url: string;
  domain: string;
  title: string;
  favIconUrl: string;
  isAudible: boolean;
  isMuted: boolean;
  playbackState: 'playing' | 'paused' | 'buffering';
  currentTime: number;
  duration: number;
  volume: number; // 0.0 to 1.0
}

export interface RemoteMediaCommand {
  action: 'DASHBOARD_REMOTE_MEDIA_CMD';
  tabId: number;
  command: 'play' | 'pause' | 'toggle' | 'seek' | 'set_volume' | 'mute' | 'solo';
  value?: number;
}
```

### 2.4 Backup Schema v2.0 Types (Feature 5)

```typescript
export interface BackupFileV2 {
  $schema: string;
  schema_version: '2.0.0';
  exported_at: string; // ISO 8601
  checksum: string;    // CRC32 / Hex hash
  device_profile: {
    browser: string;
    extension_version: string;
    os: string;
  };
  payload: {
    settings: Record<string, unknown>;
    tracking_history: Record<string, {
      domains: Record<string, { activeTime: number; sessions: number; category?: DomainCategory }>;
      totalActiveTime: number;
      productivityScore?: number;
      hourlyBuckets?: Record<number, { activeTime: number; mediaTime: number; sessions: number; topDomain: string }>;
    }>;
    media_history: Array<{
      id: string;
      title: string;
      platform: string;
      duration: number;
      watchTime: number;
      timestamp: number;
    }>;
    annotations?: Record<string, { notes: string; starred: boolean }>;
    blacklist?: string[];
  };
}
```

### 2.5 Privacy Blacklist & Wellbeing Types (Features 7 & 8)

```typescript
export interface BlacklistRule {
  pattern: string; // Wildcard pattern e.g. "localhost:*"
  addedAt: number;
  regex: RegExp;
}

export interface DomainBudgetRule {
  domain: string;
  dailyLimitMinutes: number;
}

export interface PomodoroState {
  isActive: boolean;
  mode: 'focus' | 'break';
  remainingSeconds: number;
  totalCompletedSessions: number;
  lastTickTimestamp: number;
}
```

---

## 📡 3. IPC Messaging Contracts

| Action / Message ID | Sender | Receiver | Payload / Contract |
| :--- | :--- | :--- | :--- |
| `DASHBOARD_GET_ALL_MEDIA_STREAMS` | Dashboard | Background | `{ action: 'DASHBOARD_GET_ALL_MEDIA_STREAMS' }` -> Returns `MediaStreamTabInfo[]` |
| `DASHBOARD_REMOTE_MEDIA_CMD` | Dashboard | Background -> Content | `{ action: 'DASHBOARD_REMOTE_MEDIA_CMD', tabId, command, value }` |
| `MEDIA_STREAM_SOLO` | Dashboard | Background | `{ action: 'MEDIA_STREAM_SOLO', soloTabId: number }` |
| `GET_BACKUP_SNAPSHOTS` | Dashboard | Background | `{ action: 'GET_BACKUP_SNAPSHOTS' }` -> Returns list of 7 snapshot dates |
| `RESTORE_BACKUP_SNAPSHOT` | Dashboard | Background | `{ action: 'RESTORE_BACKUP_SNAPSHOT', snapshotKey: string }` |
| `UPDATE_TRACKING_BLACKLIST` | Dashboard | Background | `{ action: 'UPDATE_TRACKING_BLACKLIST', rules: string[] }` |
| `PURGE_DOMAIN_HISTORY` | Dashboard | Background | `{ action: 'PURGE_DOMAIN_HISTORY', domain: string }` |
| `POMODORO_PHASE_CHANGE` | Dashboard | Background | `{ action: 'POMODORO_PHASE_CHANGE', phase: 'break' \| 'focus' }` |

---

## ⚙️ 4. Key Algorithmic Specifications

### 4.1 Chrono-Heatmap Aggregation Algorithm

```javascript
function aggregateChronoHeatmap(rawHistory, range) {
  const matrix = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      dayOfWeek: d,
      activeSeconds: 0,
      mediaSeconds: 0,
      topDomain: '',
      sessionCount: 0
    }))
  );

  const targetDates = getDatesInRange(range.startDate, range.endDate);
  let totalActive = 0;
  let totalMedia = 0;

  targetDates.forEach(dateStr => {
    const dayData = rawHistory[dateStr];
    if (!dayData || !dayData.hourlyBuckets) return;

    const dateObj = new Date(dateStr);
    const dayOfWeek = (dateObj.getDay() + 6) % 7; // Monday = 0, Sunday = 6

    for (let h = 0; h < 24; h++) {
      const bucket = dayData.hourlyBuckets[h];
      if (bucket) {
        matrix[dayOfWeek][h].activeSeconds += (bucket.activeTime || 0);
        matrix[dayOfWeek][h].mediaSeconds += (bucket.mediaTime || 0);
        matrix[dayOfWeek][h].sessionCount += (bucket.sessions || 0);
        if (bucket.topDomain) {
          matrix[dayOfWeek][h].topDomain = bucket.topDomain;
        }
        totalActive += (bucket.activeTime || 0);
        totalMedia += (bucket.mediaTime || 0);
      }
    }
  });

  return { matrix, totalActive, totalMedia };
}
```

### 4.2 Dynamic Productivity Scoring Engine

```javascript
function calculateProductivityScore(timeByCategory, totalActiveTime) {
  if (!totalActiveTime || totalActiveTime <= 0) return 0;
  
  const W = timeByCategory.work || 0;
  const L = timeByCategory.learning || 0;
  const U = timeByCategory.utility || 0;
  const S = timeByCategory.social || 0;
  const E = timeByCategory.entertainment || 0;

  const rawScore = ((W * 1.0) + (L * 0.95) + (U * 0.70) - (S * 0.40) - (E * 0.80)) / totalActiveTime * 100;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let tier = 'distracted';
  if (clampedScore >= 80) tier = 'focus';
  else if (clampedScore >= 60) tier = 'balanced';

  return { score: clampedScore, tier };
}
```

### 4.3 Wildcard Blacklist Matching Engine

```javascript
function matchesBlacklist(urlOrDomain, patterns) {
  if (!patterns || !Array.isArray(patterns) || patterns.length === 0) return false;
  const cleanTarget = String(urlOrDomain).toLowerCase().trim();

  return patterns.some(pattern => {
    if (!pattern || typeof pattern !== 'string') return false;
    const cleanPattern = pattern.toLowerCase().trim();
    if (cleanPattern === cleanTarget) return true;

    // Convert wildcard pattern (e.g. "localhost:*", "*.internal") into safe RegExp
    const escaped = cleanPattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    try {
      const re = new RegExp('^' + escaped + '$', 'i');
      return re.test(cleanTarget);
    } catch (_) {
      return false;
    }
  });
}
```

### 4.4 Backup Conflict Resolution Algorithm

```javascript
function resolveBackupConflict(currentHistory, importedHistory, strategy) {
  if (strategy === 'overwrite') {
    return Object.assign({}, importedHistory);
  }

  const merged = Object.assign({}, currentHistory);

  Object.keys(importedHistory).forEach(dateKey => {
    if (!merged[dateKey]) {
      merged[dateKey] = importedHistory[dateKey];
    } else if (strategy === 'merge') {
      const curDay = merged[dateKey];
      const impDay = importedHistory[dateKey];
      
      // Merge domain totals
      curDay.domains = curDay.domains || {};
      const impDomains = impDay.domains || {};
      
      Object.keys(impDomains).forEach(dom => {
        if (!curDay.domains[dom]) {
          curDay.domains[dom] = impDomains[dom];
        } else {
          curDay.domains[dom].activeTime = Math.max(curDay.domains[dom].activeTime || 0, impDomains[dom].activeTime || 0);
          curDay.domains[dom].sessions = Math.max(curDay.domains[dom].sessions || 0, impDomains[dom].sessions || 0);
        }
      });

      curDay.totalActiveTime = Math.max(curDay.totalActiveTime || 0, impDay.totalActiveTime || 0);
    }
    // append-only ignores dates already existing in merged
  });

  return merged;
}
```
