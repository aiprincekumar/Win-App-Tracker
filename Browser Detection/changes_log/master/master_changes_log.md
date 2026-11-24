# Browser Detection - Master Changes Log (Universal Rule 6)

> **Project:** Web Activity & Media Sentinel (`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`)  
> **Maintainer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)

---

## [2026-11-25 02:46:00 IST] `SVGCLASS001` — `TASK-SVG-CLASSNAME-FIX-001`
- **Authorization Token:** `AUTH-MGR-20261125-SVGCLASS-001`
- **Type:** `fix(dashboard)` — `SVGElement.className` Getter-Only `TypeError` in `renderProductivityGauge`
- **Summary:**
  - Replaced `circle.className = ...` with `circle.setAttribute('class', \`gauge-progress tier-${resolvedTier}\`);` on `#gaugeProgressCircle` (`SVGCircleElement`) in `dashboard/dashboard.js` (`L2690`) and `src/dashboard/features/temporal_productivity_feature.js` (`L788`) with 0 net line growth.
  - Audited 226 `.className =` sites across `dashboard/` and `src/dashboard/` confirming 0 other SVG targets.
  - Added 4-battery strict getter-only SVG mock regression suite (`tests/test_svg_classname_regression.js`, `205` lines); certified **129/129 PASSED** (`node run_all_tests.js`, `36.39s`, Exit Code `0`), `node --check` PASS, BOM PASS, and `0` leaks in `gitleaks`.
- **Entry Record:** [`entries/2026-11-25/change_SVGCLASS001_2026-11-25_02-46-00.md`](../entries/2026-11-25/change_SVGCLASS001_2026-11-25_02-46-00.md)

## [2026-11-25 02:30:00 IST] `FGTRACKING001` — `TASK-FOREGROUND-TRACKING-FIX-001`
- **Authorization Token:** `AUTH-MGR-20261125-FGTRACKING-001`
- **Type:** `fix(telemetry)` — Foreground & Active Tab Time Tracking Undercounting Overhaul (`RC-01` through `RC-09`)
- **Summary:**
  - Restored synchronous classic MV3 service worker module hydration via `importScripts` (`manifest.json`, `background.js`).
  - Raised default passive reading idle threshold from `60s` to `300s` (`background.js`, `dashboard/dashboard.html`, `foreground_tracking_guard.js`).
  - Added `active_session_resilience.js` and `foreground_tracking_guard.js` for serialized `idle.onStateChanged`, startup `QUERY_PAGE_MEDIA` hydration, `isFinalFlush` outgoing tab credit, and non-clobber DevTools/background window guards.
  - Added `tabFrameMediaMap` in `background.js` so idle/ad frames never clobber playing embedded video iframes, while preserving **0 diff lines** in `commitBackgroundMediaDelta` & background media accounting loops.
  - Hardened `content_media.js` keepalive reconnect cleanup & overdue catchup heartbeats, and unified 7 UTC date fallbacks in `dashboard/dashboard.js` to local `formatYMD(new Date())`.
  - Added standalone suites `tests/test_foreground_all_websites_tracking_fix.js` & `tests/test_foreground_tracking_undercounting.js`; certified **128/128 PASSED** (`node run_all_tests.js`, Exit Code `0`) and `0` leaks in `gitleaks`.
- **Entry Record:** [`entries/2026-11-25/change_FGTRACKING001_2026-11-25_02-30-00.md`](../entries/2026-11-25/change_FGTRACKING001_2026-11-25_02-30-00.md)
