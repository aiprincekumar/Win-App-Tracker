# Master Execution Prompt: UI/UX & CSS Linking, 5-Band Equalizer & Audio Lab Styling, Tactile Audio Haptics in Settings, Sidebar Status Minimalism & Action Controls Shift to Settings

> **Document Type:** Master Orchestration & Execution Prompt  
> **Workspace Container:** `temp_prompt/ui_ux_audio_sidebar_polish/`  
> **Target Project:** Web Activity & Media Sentinel (Chrome MV3 Browser Extension)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Execution Strategy:** Strategy A (Fully Autonomous Phase-wise Execution)  
> **Target Autonomy Score:** 1.0  
> **Lead Departments:** Dept 01 Product Requirements, Dept 04 Design System, Dept 05 Frontend Engineering, Dept 08 QA & Testing  

---

## 🏛️ 1. Executive Context & Directive

The **Web Activity & Media Sentinel** dashboard requires a coordinated, 3-phase surgical overhaul across `dashboard.html`, modular CSS files in `dashboard/styles/`, master `dashboard.css`, and Settings bridge controls.

This master prompt orchestrates the sequential execution of:
- **Phase 1:** Direct topological CSS linking in `dashboard.html`, studio-grade 5-Band Equalizer deck & Audio Lab telemetry styling, and Settings Tactile Audio Haptics controls polish.
- **Phase 2:** Sidebar HUD status minimalism (decluttering bulky buttons from sidebar), and relocating reconnection controls to a dedicated "Local Services & Hardware Bridges" card in `#paneSettings` while strictly preserving all DOM IDs and event bindings.
- **Phase 3:** Independent QA verification running all 44 test suites with exit code 0, Trusted Types verification, UTF-8 BOM certification, `gitleaks` secret audit, and Rule 15 autonomous local commit and remote GitHub push with 3-point terminal proof.

---

## 🗺️ 2. Architectural Specification & Document Navigation

All Level 4 Execution Subagents must adhere strictly to the following specifications located in `temp_prompt/ui_ux_audio_sidebar_polish/`:

1. **[`INDEX.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/INDEX.md):** Live tracking board, phase status checklist, and universal 7-column diagnostic impact matrix.
2. **[`SUMMARY.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/SUMMARY.md):** Executive architecture summary, milestone roadmap, risk mitigations, and tradeoff analysis.
3. **[`PRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/PRD.md):** Product requirements, user personas, INVEST user stories, and Given-When-Then acceptance criteria contracts.
4. **[`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/TRD.md):** Technical design, DOM tree preservation contracts, CSS cascade architecture, and security budgets.
5. **[`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/DESIGN.md):** Liquid Glass 2.0 design tokens, color scales, micro-interactions, and component blueprints.

---

## ⚡ 3. Phased Execution Protocol

### Phase 1: CSS Direct Embedding, 5-Band Equalizer & Settings Haptics
- **Instruction File:** [`phase_01_css_embedding_eq_audiolab.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/phase_01_css_embedding_eq_audiolab.md)
- **Role:** Level 4 Frontend Engineer
- **Core Directives:**
  1. Replace lines 7-8 of `dashboard/dashboard.html` with explicit `<link rel="stylesheet">` tags for all 14 modular stylesheets in topological order before `dashboard.css`.
  2. Enhance `dashboard/styles/audio_lab.css` and `dashboard/dashboard.css` with studio deck styles for `#heroAudioEqCard`, 5-band vertical sliders (`#eqBand60`..`#eqBand16000`), neon thumbs, 0dB detent lines, and decibel badges.
  3. Polish `#heroAudioBoostSlider` (0% to 200%), enhancement cards, and telemetry badges in `audio_lab.css`.
  4. Style Tactile Audio Haptics controls in `dashboard/styles/settings.css` (`.haptic-volume-control`, `.styled-range-slider`, `.volume-badge`, `.btn-test-chime`).
- **Gate:** CSS AST validation clean, `node tests/test_dashboard_full_audio_lab_parity.js` PASS.

### Phase 2: Sidebar Status Minimalism & Hardware Bridges Relocation
- **Instruction File:** [`phase_02_sidebar_status_settings_bridge.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/phase_02_sidebar_status_settings_bridge.md)
- **Role:** Level 4 Frontend Engineer
- **Core Directives:**
  1. Strip `<button id="btnSidebarReconnectHub" ...>` and `<button id="btnSidebarReconnect" ...>` from the sidebar HUD cards in `dashboard/dashboard.html`.
  2. Compact `.sidebar-hud-card` in `dashboard/styles/layout/header_sidebar.css`.
  3. Create `#cardHardwareBridges` in `#paneSettings` of `dashboard/dashboard.html` hosting `#btnSidebarReconnectHub` and `#btnSidebarReconnect` with exact DOM IDs preserved.
  4. Add dedicated styling for `.bridge-service-row` and `.btn-bridge-action` in `dashboard/styles/settings.css`.
- **Gate:** `test_dashboard_multi_browser_filter.js` PASS, `test_dashboard_window_focus_and_hub_retry.js` PASS.

### Phase 3: Independent QA Verification, Security Audit & Git Push
- **Instruction File:** [`phase_03_qa_verification_git_sync.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/phase_03_qa_verification_git_sync.md)
- **Role:** Level 4 Independent QA Subagent
- **Core Directives:**
  1. Run `node run_all_tests.js` certifying 44/44 test suites pass with exit code 0.
  2. Verify 0 `.innerHTML` assignments in all modified files.
  3. Verify 100% UTF-8 with BOM across all touched files.
  4. Run `gitleaks detect --redact` verifying 0 secrets detected.
  5. Apply Rule 15 Autonomous Push Intelligence: commit locally and push to remote `origin/main` online, logging 3-point terminal verification proof.
- **Gate:** Grade A+ QA signoff certified.

---

## 🔒 4. Constitutional Invariants & Non-Negotiables

- **Zero-Code Hard Lock:** Neither the Level 1 CEO nor Level 2 Manager is permitted to modify codebase files directly. Execution is strictly reserved for Level 4 Subagents dispatched with an active `AUTH-MGR-*` token.
- **Strict DOM ID Preservation:** `#btnSidebarReconnectHub`, `#btnSidebarReconnect`, `#dataHubSidebarDot`, `#hudStatusDot`, `#heroAudioEqCard`, `#eqBand60`..`#eqBand16000`, and `#toggleAudioHaptics` must retain their exact IDs and bindings.
- **W3C Trusted Types Compliance:** Zero innerHTML assignments.
- **UTF-8 with BOM Standard:** Every modified file must start with `0xEF, 0xBB, 0xBF`.
