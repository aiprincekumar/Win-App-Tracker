# Phase 01: Service Worker Real-Time Hourly Telemetry Engine

> **Document Type:** Standalone Phase Execution Prompt  
> **Phase #:** 01  
> **Target Subsystem:** MV3 Background Service Worker (`background.js`)  
> **Assigned Subagent Role:** Level 4 Backend Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Mandatory Anchor:** First load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.  

---

## 🎯 1. Phase Objective
Add real-time hourly telemetry per domain in `background.js` under `domainEntry.days[today].hourlyBuckets`, tracking `activeSeconds`, `activeTime`, `backgroundMediaSeconds`, `mediaTime`, and `sessions` for the current hour (`0` to `23`).

---

## 📋 2. Prerequisites & Dependencies
- Working knowledge of `commitActiveInterval()` and `commitBackgroundMediaDelta()` in `background.js`.
- Adherence to Universal Rule 28 (strict <= 50 lines per function, nesting depth <= 3).
- UTF-8 with BOM preservation on `background.js`.

---

## 🔍 3. Technical Context & File Anchors
- Target File: [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)
  - `commitActiveInterval()` around line 2846 to 2899.
  - `commitBackgroundMediaDelta(domain, seconds)` around line 2904 to 2939.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update `commitActiveInterval()` in `background.js`
In `commitActiveInterval()`, after initializing `dayEntry = domainEntry.days[today]` and incrementing `dayEntry.seconds` and `dayEntry.foregroundSeconds`:
```javascript
    // Real-time hourly bucket telemetry
    if (!dayEntry.hourlyBuckets) {
      dayEntry.hourlyBuckets = {};
    }
    const currentHour = new Date(now).getHours();
    if (!dayEntry.hourlyBuckets[currentHour]) {
      dayEntry.hourlyBuckets[currentHour] = {
        activeSeconds: 0,
        activeTime: 0,
        backgroundMediaSeconds: 0,
        mediaTime: 0,
        sessions: 1
      };
    }
    const hourBucket = dayEntry.hourlyBuckets[currentHour];
    hourBucket.activeSeconds = (hourBucket.activeSeconds || 0) + validSec;
    hourBucket.activeTime = hourBucket.activeSeconds;
```

### Step 2: Update `commitBackgroundMediaDelta(domain, seconds)` in `background.js`
In `commitBackgroundMediaDelta()`, after initializing `dayEntry` and incrementing `dayEntry.seconds` and `dayEntry.backgroundMediaSeconds`:
```javascript
  // Real-time hourly bucket telemetry
  if (!dayEntry.hourlyBuckets) {
    dayEntry.hourlyBuckets = {};
  }
  const currentHour = new Date(now).getHours();
  if (!dayEntry.hourlyBuckets[currentHour]) {
    dayEntry.hourlyBuckets[currentHour] = {
      activeSeconds: 0,
      activeTime: 0,
      backgroundMediaSeconds: 0,
      mediaTime: 0,
      sessions: 0
    };
  }
  const hourBucket = dayEntry.hourlyBuckets[currentHour];
  hourBucket.backgroundMediaSeconds = (hourBucket.backgroundMediaSeconds || 0) + validSec;
  hourBucket.mediaTime = hourBucket.backgroundMediaSeconds;
```

### Step 3: Modularity Verification
Ensure neither `commitActiveInterval` nor `commitBackgroundMediaDelta` exceeds 50 lines.

---

## 🛡️ 5. Constraints & Architectural Invariants
- Zero innerHTML or DOM operations (this is the service worker).
- Preserve all existing WebSocket delta streams (`streamActivityDelta`).
- Preserve debounced storage saves (`scheduleStorageSave`).
- File must remain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📦 6. Deliverables Manifest
- Updated [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js).

---

## 🚦 7. Verification Gate
```powershell
node -e "const bg = require('./background.js'); console.log('background.js syntax OK');"
```
Or run the dedicated test verifying hourly bucket recording.
