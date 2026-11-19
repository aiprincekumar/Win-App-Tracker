# Accurate Hourly Activity Tracking ("सटीक ट्रैकिंग") for Chrono-Activity Heatmap: Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/chrono_heatmap_hourly_tracking/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `background.js`, `dashboard/dashboard.js`, `src/dashboard/features/temporal_productivity_feature.js`, `tests/`  
> **Lead Departments:** Dept 04 (Core Logic / Backend), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Architectural Limitations
1. **Absence of Real-time Hourly Telemetry in Backend:**
   In `background.js`, `commitActiveInterval` and `commitBackgroundMediaDelta` track daily totals (`domainEntry.days[today].seconds`, `foregroundSeconds`, `backgroundMediaSeconds`), but do not record hourly buckets (`hourlyBuckets`). As a result, intraday hourly distribution cannot be determined precisely.
2. **Dashboard History Aggregator Truthy Check Trap:**
   In `dashboard/dashboard.js`, line 2838 initializes `historyMap[dateStr] = { domains: {}, hourlyBuckets: {} }`. Even when `dayStats.hourlyBuckets` is absent from backend storage, `historyMap[dateStr].hourlyBuckets` exists as an empty object `{}`.
3. **Temporal Heatmap Evaluator Short-Circuit:**
   In `src/dashboard/features/temporal_productivity_feature.js`, line 398 performs `if (dayData.hourlyBuckets)`. Because `{}` is truthy in JavaScript, the feature enters the hourly loop instead of falling back to `else if (dayData.domains)`. Since `hourlyBuckets` has no keys, all 24 hours remain 0 seconds, rendering the 7x24 heatmap blank or falsely inactive.
4. **Arbitrary Top Domain Assignment:**
   In `dashboard.js`, `historyMap[dateStr].hourlyBuckets[h].topDomain` was naively assigned to the first domain encountered in the object iteration rather than computing the domain with the actual maximum time spent during that specific hour.

### 1.2 The Architectural Solution ("सटीक ट्रैकिंग")
1. **Phase 1: Real-Time Hourly Telemetry in Service Worker (`background.js`):**
   Extend `domainEntry.days[today]` with an `hourlyBuckets` map (keyed 0–23). On every active interval commit (`commitActiveInterval`) and background media delta (`commitBackgroundMediaDelta`), resolve the current local hour (`new Date(now).getHours()`) and atomically increment `activeSeconds`, `foregroundSeconds`, `activeTime`, `backgroundMediaSeconds`, and `mediaTime`.
2. **Phase 2: Robust History Aggregation & Top Domain Resolution (`dashboard/dashboard.js`):**
   In `dashboard.js`, populate `historyMap[dateStr].hourlyBuckets` by aggregating `dayStats.hourlyBuckets` across domains. Accurately compute `topDomain` for each hour bucket by maintaining per-domain duration counters (`domainTimes[dom]`) and selecting the domain with the highest combined active + media time.
3. **Phase 3: Dual-Mode Heatmap Engine with Safe Fallback (`src/dashboard/features/temporal_productivity_feature.js`):**
   Update `aggregateChronoHeatmap` to inspect whether `dayData.hourlyBuckets` contains populated keys with duration > 0. If present, aggregate the precise hourly telemetry. If `hourlyBuckets` is missing or empty, seamlessly engage the `dayData.domains` fallback estimation (distributing active/media time across typical active hours 10:00–18:00 and resolving the top domain).
4. **Phase 4: Comprehensive QA Test Battery & Regression Certification (`tests/`):**
   Develop a dedicated multi-battery test suite `tests/test_chrono_heatmap_hourly_tracking.js` verifying background hourly recording, dashboard aggregation, accurate topDomain selection, fallback estimation, and full regression parity with `node run_all_tests.js`.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Backend Real-Time Hourly Telemetry Engine | `background.js` | Level 4 Backend Engineer | `node -e "require('./background.js'); console.log('OK')"` | ⏳ READY |
| **02** | Dashboard History Aggregation & Top Domain Resolver | `dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -e "require('./dashboard/dashboard.js'); console.log('OK')"` | ⏳ READY |
| **03** | Temporal Feature Heatmap Engine Dual-Mode & Fallback | `src/dashboard/features/temporal_productivity_feature.js` | Level 4 Frontend Engineer | `node -e "require('./src/dashboard/features/temporal_productivity_feature.js'); console.log('OK')"` | ⏳ READY |
| **04** | Comprehensive QA Verification & Regression Battery | `tests/test_chrono_heatmap_hourly_tracking.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_chrono_heatmap_hourly_tracking.js`<br>`node run_all_tests.js` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `background.js` | `commitActiveInterval` and `commitBackgroundMediaDelta` only track daily sums, omitting hourly bucket breakdown. | Initialize `domainEntry.days[today].hourlyBuckets = {}` and increment `activeSeconds`/`backgroundMediaSeconds` for `new Date().getHours()`. | Telemetry captures exact hourly distribution in real time without high storage overhead. | Phase 1 | `node tests/test_chrono_heatmap_hourly_tracking.js` |
| **2** | `background.js` | Function length boundary (Universal Rule 28: <= 50 lines per function) must be strictly maintained. | Keep inline bucket initialization and updates concise (<= 12 lines) or extract a focused helper `recordHourlyBucketDelta`. | Clean modularity, zero lint regression, readable code. | Phase 1 | Static function length check |
| **3** | `dashboard/dashboard.js` | `historyMap[dateStr].hourlyBuckets[h].topDomain` set to first domain in loop rather than domain with maximum time. | Maintain `domainTimes[dom]` per hour bucket and resolve top domain dynamically based on max total seconds. | Chrono-heatmap tooltips display the actual predominant website for each hour. | Phase 2 | `node tests/test_chrono_heatmap_hourly_tracking.js` |
| **4** | `src/dashboard/features/temporal_productivity_feature.js` | `if (dayData.hourlyBuckets)` evaluates to true on empty `{}` objects, preventing fallback to daily domain estimation. | Check `Object.keys(dayData.hourlyBuckets).length > 0` and verify non-zero values before committing to hourly branch; fallback to `dayData.domains` otherwise. | Zero empty heatmaps; historical and fresh data render correctly under all conditions. | Phase 3 | `node tests/test_chrono_heatmap_hourly_tracking.js` |
| **5** | `src/dashboard/features/temporal_productivity_feature.js` | Inconsistent naming between `activeTime`/`activeSeconds` and `mediaTime`/`mediaSeconds`. | Check `bucket.activeTime || bucket.activeSeconds || 0` and `bucket.mediaTime || bucket.mediaSeconds || 0` uniformly. | 100% interoperability across raw history arrays, storage snapshots, and live telemetry. | Phase 3 | `node tests/test_chrono_heatmap_hourly_tracking.js` |
| **6** | `tests/test_chrono_heatmap_hourly_tracking.js` | Missing automated test suite asserting hourly telemetry capture, aggregation, and fallback. | Author 7-battery standalone test suite covering background, dashboard, and temporal feature modules. | Grade A+ automated test coverage, regression immunity. | Phase 4 | Exit Code 0 with raw terminal output |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **UTF-8 with BOM Standard:** All modified files must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
2. **Function Length Limit:** All modified and newly introduced functions in `background.js` and feature modules must strictly adhere to <= 50 lines per Universal Rule 28.
3. **W3C Trusted Types Compliance:** Zero `innerHTML` assignments; all DOM manipulations must use `textContent`, `setAttribute`, or safe DOM nodes.
4. **Zero-Code Hard Lock Enforcement:** Level 1 CEO and Level 2 Manager do not modify code; Level 4 subagents execute with explicit `AUTH-MGR-*` token.
5. **Backwards Compatibility:** Existing stored user data without `hourlyBuckets` must continue to display seamlessly via domain fallback estimation without errors or data loss.
