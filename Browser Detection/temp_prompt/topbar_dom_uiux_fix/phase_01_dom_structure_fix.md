# Phase 1: DOM Structure Surgery in `dashboard/dashboard.html`

> **Phase Identifier:** Phase 1 of 4  
> **Target File:** `dashboard/dashboard.html`  
> **Executing Role:** Level 4 Frontend Engineer  
> **Department Rule:** Dept 05 Frontend Engineering  
> **Authorization Mandate:** Requires active `AUTH-MGR-*` token from Level 2 Manager  

---

## 1. Phase Objective
Surgically correct the DOM nesting defects in `dashboard/dashboard.html` by removing stray closing tags and ensuring that all 8 top-bar control items are encapsulated inside `<div class="app-bar-right">`, which itself is properly nested as a direct flex child of `<header class="top-app-bar">`.

---

## 2. Prerequisites & Technical Context
- Target file: `dashboard/dashboard.html` (approx lines 100-220).
- Defect 1: Stray `</div>` at line ~162 immediately after `#btnThemeToggle`.
- Defect 2: `.export-dropdown-container` and `#btnGlobalRefresh` are trapped outside `.app-bar-right`.
- Defect 3: Stray `</div>` at line ~207 prematurely closing `<header class="top-app-bar">`.
- Defect 4: Orphaned `</header>` tag at line ~208.

---

## 3. Surgical Step-by-Step Instructions

1. Open `dashboard/dashboard.html` and locate the `<header class="top-app-bar">` block.
2. In `<div class="app-bar-right">`:
   - Keep `.browser-filter-container` (`#browserFilterSelect`).
   - Keep `.tracking-filter-container` (`#trackingModeSelect`).
   - Keep `#dataHubBadge`.
   - Keep `#liveClockPill`.
   - Keep `#btnLangToggle`.
   - Keep `#btnThemeToggle`.
   - **DELETE** the stray `</div>` tag that currently appears directly below `</button>` of `#btnThemeToggle`.
   - Ensure `<div class="export-dropdown-container">...</div>` follows `#btnThemeToggle` directly inside `.app-bar-right`.
   - Ensure `<button id="btnGlobalRefresh" ...>...</button>` follows `.export-dropdown-container` directly inside `.app-bar-right`.
   - Place the single closing `</div>` to terminate `.app-bar-right` directly after `</button>` of `#btnGlobalRefresh`.
   - Ensure `<header class="top-app-bar">` is closed cleanly with `</header>` directly after the closing `</div>` of `.app-bar-right`.
   - **REMOVE** the redundant/stray `</div>` at line ~207.
3. Validate that the sibling element `#printExecutiveHeader` and the container `.tab-content-container` remain direct children of `<main class="main-stage">`.
4. Ensure the file encoding remains UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 4. Architectural Boundaries (Out of Scope)
- Do NOT alter any element IDs, data attributes, or class names (needed for JS bindings).
- Do NOT modify `dashboard.js` or backend WebSocket scripts during this phase.

---

## 5. Local Verification Gate
- Run an HTML parsing check (e.g. Node script using regex or DOM parser) to confirm:
  1. `<div class="app-bar-right">` contains `#btnThemeToggle`, `.export-dropdown-container`, and `#btnGlobalRefresh`.
  2. Every opening `<div` has a matching `</div>`.
  3. Every `<header>` has a matching `</header>`.
  4. `<main class="main-stage">` cleanly encloses `<header>`, `#printExecutiveHeader`, and `.tab-content-container`.
