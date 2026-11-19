<!-- UTF-8 with BOM -->
# TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001: Phase 2 Standalone Execution Prompt

> **Phase Identifier:** `PHASE-02-CYBER-DARK-CSS`  
> **Target Subagent Role:** Level 4 Frontend Engineering Specialist  
> **Target Workspaces & Files:**  
> - Primary Target: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup\popup.css`  
> - Reference Pattern: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\dashboard\dashboard.css` (lines 8820-8930 `.sleep-hero-card`)  
> **Prerequisites:** Phase 1 DOM Markup Completed & Validated  
> **Verification Gate:** `node tests/test_focus_time_phase1_uiux.js` (100% PASS, Exit Code 0)

---

## 🎯 1. Phase Objective

Implement modern cyber-dark Liquid Glass styling and high-precision SVG radial dial layout rules in `popup/popup.css`. The styles must establish visual parity with the Sleep Sentinel hero dial, ensure responsive centering within the extension popup (~380px), provide smooth 60fps stroke depletion transitions, and deliver full theme compatibility for both cyber-dark mesh and light modes.

---

## 📂 2. File Anchors & Context

- **Target File:** `popup/popup.css`
- **Location Anchor:** Lines ~3252 to ~3370 (`/* Compact Focus Time Sentinel Mini-Controller */`)
- **Required Classes to Preserve:**
  - `.popup-focus-card`
  - `.popup-focus-header`
  - `.popup-focus-title`
  - `.popup-focus-badge`
  - `.popup-focus-badge.idle`, `.popup-focus-badge.running`, `.popup-focus-badge.break`, `.popup-focus-badge.paused`
  - `.popup-focus-body` (can remain as fallback/wrapper)
  - `.popup-focus-clock`
  - `.popup-focus-actions`
  - `.popup-focus-btn`
  - `.popup-focus-btn.primary`

---

## 🔨 3. Surgical Implementation Instructions

Replace and enhance the CSS rules in `popup/popup.css` around line ~3252 with the following cyber-dark specification:

```css
/* ========================================================================== */
/* SECTION: REVAMPED FOCUS BLOCK SVG RADIAL DIAL (CYBER-DARK GLASSMORPHISM)   */
/* ========================================================================== */

.popup-focus-card {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(16, 185, 129, 0.22);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.65), 0 0 20px -4px rgba(16, 185, 129, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.popup-focus-card:hover {
  border-color: rgba(16, 185, 129, 0.38);
  box-shadow: 0 14px 36px -8px rgba(0, 0, 0, 0.7), 0 0 24px -2px rgba(16, 185, 129, 0.22);
}

.popup-focus-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-focus-title {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  display: flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.02em;
}

.popup-focus-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.25s ease;
}

.popup-focus-badge.idle {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.popup-focus-badge.running {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.popup-focus-badge.break {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}

.popup-focus-badge.paused {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

/* Center Radial Dial Wrapper */
.popup-focus-dial-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 130px;
  height: 130px;
  margin: 4px auto;
}

.popup-focus-svg-dial {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.popup-focus-dial-track {
  stroke: rgba(255, 255, 255, 0.08);
}

.popup-focus-dial-progress {
  stroke: url(#focusGlowGradient);
  transition: stroke-dashoffset 0.35s ease, stroke 0.35s ease;
}

.popup-focus-dial-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.popup-focus-clock {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-mono, 'JetBrains Mono', 'Fira Code', monospace);
  color: var(--text-primary, #ffffff);
  letter-spacing: 1px;
  line-height: 1.1;
  text-shadow: 0 0 12px rgba(16, 185, 129, 0.25);
}

.popup-focus-dial-state {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-top: 2px;
}

/* Actions Controls Row */
.popup-focus-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.popup-focus-btn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(30, 41, 59, 0.7);
  color: var(--text-primary, #f1f5f9);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  min-width: 68px;
}

.popup-focus-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.popup-focus-btn:active {
  transform: scale(0.97);
}

.popup-focus-btn.primary {
  background: linear-gradient(135deg, #059669, #10b981);
  border-color: #10b981;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.popup-focus-btn.primary:hover {
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.popup-focus-btn.secondary {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.14);
}

.popup-focus-btn.secondary:hover {
  background: rgba(51, 65, 85, 0.9);
}

/* Light Theme Overrides */
[data-theme="light"] .popup-focus-card {
  background: rgba(248, 250, 252, 0.92);
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .popup-focus-dial-track {
  stroke: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .popup-focus-clock {
  color: #0f172a;
  text-shadow: none;
}

[data-theme="light"] .popup-focus-dial-state {
  color: #475569;
}

[data-theme="light"] .popup-focus-btn.secondary {
  background: rgba(226, 232, 240, 0.85);
  border-color: rgba(203, 213, 225, 0.8);
  color: #1e293b;
}

[data-theme="light"] .popup-focus-btn.secondary:hover {
  background: #cbd5e1;
}
```

---

## 🛡️ 4. Constitutional Constraints & Boundaries

1. **Preserve Legacy Selectors:**
   - `.popup-focus-card`, `.popup-focus-badge`, `.popup-focus-clock`, `.popup-focus-btn` MUST be defined in `popup.css` (tested by `test_focus_time_phase1_uiux.js` line ~142-145).
2. **Encoding Standard:**
   - UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
3. **Out of Scope for Phase 2:**
   - Do NOT edit `popup.js` in this phase (delegated to Phase 3).

---

## 🚦 5. Deliverables & Verification Gate

- **Deliverable:** Updated `popup/popup.css`.
- **Local Verification Command:**
  ```powershell
  node tests/test_focus_time_phase1_uiux.js
  ```
- **Acceptance Criteria:**
  - Battery 5: Cyber-Dark CSS Architecture & Radial Dial Styling must output:
    `✅ Modular CSS rules for Focus Radial Dial & Mini-Controller verified`
  - Exit code must be 0.
