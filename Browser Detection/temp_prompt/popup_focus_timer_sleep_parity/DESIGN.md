# TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002: Design System & Token Specifications (DESIGN.md)

> **Document Type:** Design System, Tokens, Typography, Motion & Component States  
> **Task Identifier:** `TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002`  
> **Directory Scope:** `temp_prompt/popup_focus_timer_sleep_parity/DESIGN.md`  
> **Target Execution Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  

---

## 🎨 1. Aesthetic Direction: Cyber-Dark Glassmorphism

The Focus Block UI adopts the high-tech, cyber-dark glass aesthetic of the **Bedtime Sentinel (Sleep Timer)** and Audio Lab, styled with vibrant emerald, teal, and cyan accents that signal productive momentum.

### Design Principles
1. **Visual Parity with Sleep Timer:** Identical card hierarchy, button capsules, section headers, and SVG dial composition.
2. **Distinctive Color Personality:** 
   - Sleep uses Indigo / Violet / Purple (`#818cf8`, `#a855f7`, `#c084fc`).
   - Focus uses Emerald / Teal / Cyan (`#10b981`, `#06b6d4`, `#3b82f6`) with Break Mode using Amber / Yellow (`#f59e0b`, `#fbbf24`).
3. **Tactile Micro-Interactions:** 150ms cubic-bezier button responses with scale transforms and cyber neon border highlights.

---

## 🌈 2. Color Palette & Token Scales

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `--focus-primary` | `#10b981` | Primary CTA, focus progress ring glow stop 1 |
| `--focus-secondary` | `#06b6d4` | Secondary accent, focus ring glow stop 2 |
| `--focus-tertiary` | `#3b82f6` | Outer glow accent, focus ring glow stop 3 |
| `--focus-break` | `#f59e0b` | Break mode ring accent |
| `--focus-card-bg` | `rgba(18, 24, 38, 0.75)` | Hero card background with backdrop blur |
| `--focus-card-border` | `rgba(16, 185, 129, 0.22)` | Subtle glass border |
| `--focus-chip-bg` | `rgba(255, 255, 255, 0.06)` | Inactive preset button background |
| `--focus-chip-border` | `rgba(255, 255, 255, 0.12)` | Inactive preset button border |
| `--focus-chip-active-bg` | `rgba(16, 185, 129, 0.22)` | Active preset chip background |
| `--focus-chip-active-border`| `rgba(16, 185, 129, 0.5)` | Active preset chip border with glow |

---

## 📐 3. Component Architecture & Sizing

### 3.1 Hero Dial Telemetry
- **Dial Dimension:** $130 \times 130\text{ px}$ centered.
- **Clock Typography:** $22\text{ px}$ JetBrains Mono / monospace, font-weight 800, line-height 1.1, emerald text shadow `0 0 12px rgba(16, 185, 129, 0.25)`.
- **Target Finish Readout:** $9.5\text{ px}$ font size, color `#94a3b8`, letter-spacing $0.3\text{ px}$, margin $2\text{ px } 0$.
- **State Readout:** $9\text{ px}$ uppercase, letter-spacing $0.08\text{ em}$, color `#64748b`.

### 3.2 Quick Actions Row (`.popup-focus-quick-actions-row`)
- **Container:** `display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 6px; width: 100%; flex-wrap: wrap;`
- **Button Styling (`.popup-focus-action-btn`):**
  - **Height & Padding:** Height $28\text{ px}$, padding $3\text{ px } 8\text{ px}$, border-radius $6\text{ px}$.
  - **Typography:** $11\text{ px}$, font-weight 600.
  - **Primary Toggle:** Gradient `linear-gradient(135deg, #059669, #10b981)`, white text, box-shadow `0 0 8px rgba(16, 185, 129, 0.3)`.
  - **Extenders (`-5m`, `+5m`, `+15m`):** Background `rgba(30, 41, 59, 0.65)`, border `1px solid rgba(16, 185, 129, 0.3)`, text `#a7f3d0`.
  - **Reset (`✕ Reset`):** Background `rgba(239, 68, 68, 0.12)`, border `1px solid rgba(239, 68, 68, 0.3)`, text `#fca5a5`.

### 3.3 Presets Grid (`.focus-tab-presets-grid`)
- **Grid Layout:** 6 columns `grid-template-columns: repeat(6, 1fr); gap: 5px; margin: 6px 0;`.
- **Button Styling (`.focus-tab-preset-btn`):**
  - Padding: $4\text{ px } 2\text{ px}$, font-size $10.5\text{ px}$, font-weight 600, border-radius $6\text{ px}$.
  - Hover: `background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #34d399;`.
  - Active: `background: rgba(16, 185, 129, 0.25); border-color: #10b981; color: #6ee7b7; box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); font-weight: 700;`.

### 3.4 Custom Duration Input (`.focus-custom-input-row`)
- **Container:** `display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 10.5px;`.
- **Input Wrap:** `display: flex; align-items: center; gap: 6px;`.
- **Input:** Width $90\text{ px}$, padding $3\text{ px } 6\text{ px}$, background `rgba(0, 0, 0, 0.3)`, border `1px solid var(--border-dim)`, border-radius $4\text{ px}$, font-size $11\text{ px}$, text-align center, color `var(--text-primary)`.
- **Set Button:** Padding $3\text{ px } 10\text{ px}$, background `rgba(16, 185, 129, 0.25)`, border `1px solid rgba(16, 185, 129, 0.5)`, border-radius $4\text{ px}$, color `#a7f3d0`, font-size $10.5\text{ px}$, font-weight 600.
