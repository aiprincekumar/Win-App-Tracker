# 6-Tab Single-Word Architecture UI/UX Refinement — Master Specification

> **Task ID:** `TASK-POPUP-6TAB-UIUX-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Target Path:** `temp_prompt/six_tab_popup_architecture/README.md`  
> **Implementation Strategy:** Strategy A (Fully Autonomous Phase-wise Execution)  
> **Status:** APPROVED & CERTIFIED FOR SUBAGENT EXECUTION  

---

## 📖 Overview

This directory houses the authoritative phase-wise prompt specifications for restructuring the **Web Activity & Media Sentinel** Chrome extension popup into a 6-Tab Single-Word Architecture (`🎬 Media`, `🎛️ Audio`, `⚡ Tools`, `📚 Studio`, `⏱️ Tracking`, `🌐 Domains`).

### Key Mandates:
1. **Pure Frontend UI/UX Modifications:** ZERO alterations to background scripts, WebSocket bridges, or native daemons ("बैकएंड में अभी कोई भी चेंजिंग नहीं करना है").
2. **Preservation of 34 Canonical DOM Element IDs:** No element deletions; all interactive cards and controls are preserved and cleanly organized across 6 panes.
3. **Strict 420px Fixed Geometry:** Symmetrical 6-column CSS grid (`repeat(6, 1fr)`) with compact padding and micro-typography.
4. **100% Automated Test Suite Integrity:** All 14 existing test suites must pass cleanly without regressions.

---

## 🗂️ Document Suite Index

1. [`INDEX.md`](INDEX.md): Live tracking board, problem-solution dossier, and universal 7-column diagnostic impact matrix.
2. [`SUMMARY.md`](SUMMARY.md): Executive architecture summary, milestone roadmap, and risk mitigation analysis.
3. [`PRD.md`](PRD.md): Product requirements document, user personas, functional/non-functional requirements, and acceptance contracts.
4. [`TRD.md`](TRD.md): Technical requirements document, DOM hierarchy, 6-column CSS grid, state persistence, and AST safety.
5. [`DESIGN.md`](DESIGN.md): Design system, 420px geometry specifications, semantic color gradients, and WCAG AA accessibility rules.
6. [`phase_01_dom_restructuring.md`](phase_01_dom_restructuring.md): Executable instructions for HTML DOM restructuring (`popup/popup.html`).
7. [`phase_02_css_grid_styling.md`](phase_02_css_grid_styling.md): Executable instructions for 6-column CSS grid styling (`popup/popup.css`).
8. [`phase_03_js_tabs_logic.md`](phase_03_js_tabs_logic.md): Executable instructions for JavaScript tab switching & persistence (`popup/popup.js`).
9. [`phase_04_verification_and_tests.md`](phase_04_verification_and_tests.md): Executable instructions for test updates & 14-suite regression certification.

---

## 🚀 Execution Instructions for Level 4 Sub Agents

Execution subagents dispatched by the Level 2 Manager must:
1. Load `memory.md` and this specification before touching codebase files.
2. Verify possession of an active `AUTH-MGR-*` authorization token.
3. Execute Phase 01 through Phase 04 sequentially, executing each phase's local verification gate before moving to the next.
4. Deliver test proof logs and file manifests directly to the Manager upon completion.
