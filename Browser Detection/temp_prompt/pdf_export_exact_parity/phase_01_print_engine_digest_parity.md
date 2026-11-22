# Phase 1: Isolated Iframe Print Engine & Digest Parity

> **Phase ID:** `PHASE-01-PRINT-ENGINE-DIGEST-PARITY`  
> **Target Subsystems:** `src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/dashboard.js`  
> **Assigned Agent:** Level 4 Fullstack Execution Subagent  
> **Prerequisites:** Decision Gate State `APPROVED_FOR_EXECUTION` with active `AUTH-MGR-*` token.  
> **Governance:** Universal Rule 28 (Functions <= 50 lines, max depth <= 3), W3C Trusted Types zero-`innerHTML`.  

---

## 🎯 1. Phase Objective
Completely eliminate the flawed pattern of dumping the live interactive dashboard DOM to `window.print()`. Refactor `triggerPrintPdf` in `backup_hub_digest_feature.js` and `dashboard.js` to generate the approved Standalone Executive Digest HTML (`generateExecutiveDigestHtml`) with full live dashboard telemetry and print that document inside an isolated, hidden `<iframe>` (`id="sentinelPrintIframe"`). Provide a resilient fallback to a dedicated offscreen print container if iframe execution is restricted.

---

## 📂 2. Target Files & Line Anchors

1. **`src/dashboard/features/backup_hub_digest_feature.js`:**
   - Anchor: Lines 1780–1823 (`triggerPrintPdf`).
   - Action: Replace the direct `win.print()` call on the host document with `generateExecutiveDigestHtml` generation and iframe print orchestration.
2. **`dashboard/dashboard.js`:**
   - Anchor: Lines 3679–3700 (`triggerPrintPdf`) and Lines 12619–12642 (`handleExportPdfClick`).
   - Action: Enrich `triggerPrintPdf` to assemble the full active telemetry dataset (matching `downloadStandaloneHtmlDigest`: `activityData`, `mediaHistory`, `mediaMetrics`, `chronoHeatmap`, `reportingPeriod`) and pass it to `_BackupHubDigest.triggerPrintPdf`.

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 1.1: Implement Modular Iframe Print Engine in `backup_hub_digest_feature.js`
In `src/dashboard/features/backup_hub_digest_feature.js`, implement three modular helpers strictly respecting Universal Rule 28 (each function <= 50 lines, max depth <= 3):

1. **`getOrCreatePrintIframe(doc)`:**
   - Searches `doc.getElementById('sentinelPrintIframe')`.
   - If not found, creates `doc.createElement('iframe')`.
   - Sets attributes:
     - `iframe.id = 'sentinelPrintIframe'`;
     - `iframe.name = 'sentinelPrintIframe'`;
     - `iframe.setAttribute('aria-hidden', 'true')`;
     - `iframe.setAttribute('tabindex', '-1')`;
   - Sets stealth styling:
     - `iframe.style.position = 'fixed'`;
     - `iframe.style.top = '-9999px'`;
     - `iframe.style.left = '-9999px'`;
     - `iframe.style.width = '1024px'`;
     - `iframe.style.height = '768px'`;
     - `iframe.style.border = '0'`;
     - `iframe.style.opacity = '0'`;
     - `iframe.style.pointerEvents = 'none'`;
     - `iframe.style.zIndex = '-9999'`;
   - Appends to `doc.body`.
   - Returns the iframe element.

2. **`printHtmlViaIframe(doc, win, htmlContent)`:**
   - Obtains iframe via `getOrCreatePrintIframe(doc)`.
   - Gets iframe document: `const frameDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document)`.
   - If `!frameDoc`, returns `{ success: false, error: 'Cannot access iframe document' }`.
   - Safely writes document:
     ```javascript
     frameDoc.open();
     frameDoc.write(htmlContent);
     frameDoc.close();
     ```
   - Sets focus and prints:
     ```javascript
     if (iframe.contentWindow && typeof iframe.contentWindow.print === 'function') {
       iframe.contentWindow.focus();
       iframe.contentWindow.print();
       return { success: true, method: 'iframe' };
     }
     return { success: false, error: 'iframe contentWindow.print unavailable' };
     ```

3. **`printViaFallback(doc, win, htmlContent, options)`:**
   - If iframe fails or is blocked:
   - Check if dedicated fallback container `#printFallbackContainer` exists; if not, create it.
   - Populate container with digest body and trigger `win.print()`.
   - If window print is unavailable, return `{ printed: false, error: 'Print engine unavailable' }`.

4. **Refactor `triggerPrintPdf(options = {})`:**
   - Assemble `data` from `options.data || options`.
   - Generate HTML: `const htmlContent = generateExecutiveDigestHtml(data, options);`.
   - Call `printHtmlViaIframe(doc, win, htmlContent)`.
   - If successful, return `{ printed: true, method: 'iframe', htmlLength: htmlContent.length }`.
   - If not, invoke `printViaFallback(doc, win, htmlContent, options)`.
   - Export new helpers in feature module export list (`getOrCreatePrintIframe`, `printHtmlViaIframe`, `triggerPrintPdf`).

---

### Step 1.2: Enrich Telemetry Hydration in `dashboard/dashboard.js`
In `dashboard/dashboard.js`:
1. Refactor `triggerPrintPdf(options = {})` (around line 3679):
   - Query `getActiveReportMetrics(options)` to get all live metrics.
   - Construct comprehensive payload matching `downloadStandaloneHtmlDigest`:
     ```javascript
     const payload = (options && options.data) || {
       activityData: (dashboardData && dashboardData.activityData) || {},
       tracking_history: (dashboardData && dashboardData.activityData) || {},
       media_history: (typeof mediaHistoryData !== 'undefined' && Array.isArray(mediaHistoryData)) 
         ? mediaHistoryData 
         : ((dashboardData && dashboardData.mediaHistory) || [])
     };
     const activeMetrics = (typeof getActiveReportMetrics === 'function') ? getActiveReportMetrics(options) : {};
     const activePeriod = options.reportingPeriod || (typeof currentTemporalRange !== 'undefined' && currentTemporalRange ? `Range: ${currentTemporalRange}` : 'All Recorded Time');
     const prodIndex = options.productivityIndex !== undefined ? options.productivityIndex : (activeMetrics.productivityScore || 85);

     const opts = Object.assign({
       data: payload,
       metrics: activeMetrics,
       mediaMetrics: activeMetrics.mediaMetrics || options.mediaMetrics || {},
       chronoHeatmap: activeMetrics.chronoHeatmap || options.chronoHeatmap || (typeof window !== 'undefined' && window.__CHRONO_HEATMAP_DATA__) || null,
       reportingPeriod: activePeriod,
       productivityIndex: prodIndex,
       doc: typeof document !== 'undefined' ? document : null,
       win: typeof window !== 'undefined' ? window : null
     }, options);
     ```
   - Pass `opts` into `_BackupHubDigest.triggerPrintPdf(opts)`.
   - If `_BackupHubDigest.triggerPrintPdf` is not loaded, fall back gracefully to `window.print()`.

2. Ensure `handleExportPdfClick` (around line 12619) invokes `triggerPrintPdf()` and handles return values cleanly.

---

## 🚫 4. Architectural Boundaries & Constraints
- **Strict Out-of-Scope:** Do NOT touch the interactive media deck (`multiTabMediaDeckContainer`), audio visualizer shaders, sleep sentinel timers, or background service worker.
- **W3C Security:** All HTML output must use strict escaping via `escapeHtml()`. Zero unescaped string injection.
- **Rule 28 Compliance:** Every new/modified function must be <= 50 lines with nesting depth <= 3.

---

## 🧪 5. Local Verification Gate
Run test command to ensure feature compiles and exports correctly:
```bash
node -e "const f = require('./src/dashboard/features/backup_hub_digest_feature.js'); console.log(typeof f.triggerPrintPdf === 'function' ? 'PASS' : 'FAIL');"
```
Check that function lines and nesting depth comply with Universal Rule 28.
