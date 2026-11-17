# Design System Specification (DESIGN.md): Local Services & Hardware Bridges

> **Document Type:** Design System Specification  
> **Workspace Container:** `temp_prompt/hardware_bridges_uiux_overhaul/`  
> **Lead Department:** Dept 04 UI/UX Design System  

---

## 🎨 1. Liquid Glass 2.0 Design Tokens & Substrates

The `#cardHardwareBridges` component adheres to the **Liquid Glass 2.0 Design Language**, characterized by frosted glass surfaces, calibrated neon chromatic borders, and multi-state glowing status dots.

### Substrate Token Matrices

```css
/* Liquid Glass Card Substrate */
.liquid-glass-card {
  background: var(--glass-card-bg, rgba(15, 23, 42, 0.65));
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid var(--glass-card-border, rgba(255, 255, 255, 0.08));
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  border-radius: 16px;
}

/* Service Row Layout */
.bridge-service-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--glass-border, rgba(255, 255, 255, 0.06));
  transition: background 0.2s ease;
}

.bridge-service-row:last-child {
  border-bottom: none;
  padding-bottom: 0.25rem;
}

/* Status Pill Capsules */
.bridge-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.bridge-status-pill.online {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
}

.bridge-status-pill.starting {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
}

.bridge-status-pill.offline {
  background: rgba(239, 68, 68, 0.08);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* LED Status Dots & Pulse Keyframes */
.bridge-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.bridge-status-pill.online .bridge-status-dot {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  animation: bridgeDotPulse 2s infinite ease-in-out;
}

.bridge-status-pill.starting .bridge-status-dot {
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
  animation: bridgeDotBlink 0.8s infinite ease-in-out;
}

.bridge-status-pill.offline .bridge-status-dot {
  background: #64748b;
}

@keyframes bridgeDotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.25); opacity: 0.7; }
}

@keyframes bridgeDotBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

/* Port Badges */
.bridge-port-badge {
  font-size: 0.72rem;
  font-family: var(--mono-font, 'JetBrains Mono', monospace);
  font-weight: 600;
  color: var(--accent-cyan, #06b6d4);
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.25);
  padding: 2px 7px;
  border-radius: 6px;
}

/* Action Buttons */
.btn-bridge-action {
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #fff;
  font-weight: 600;
  font-size: 0.84rem;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(8px);
}

.btn-bridge-action:hover {
  transform: translateY(-1.5px);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25));
  border-color: rgba(16, 185, 129, 0.6);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.btn-bridge-action:active {
  transform: translateY(0.5px) scale(0.98);
}

.btn-bridge-action:focus-visible {
  outline: 2px solid var(--accent-cyan, #06b6d4);
  outline-offset: 2px;
}
```

---

## 🌓 2. Multi-Theme Adaptation Matrix

| Theme Substrate | Background Variable | Border Color | Text Contrast (WCAG) | Status Online Accent |
| :--- | :--- | :--- | :--- | :--- |
| **Midnight OLED** | `rgba(0, 0, 0, 0.85)` | `rgba(255, 255, 255, 0.10)` | 20.07:1 (AAA) | `#10b981` (Emerald) |
| **Deep Slate** | `rgba(15, 23, 42, 0.75)` | `rgba(255, 255, 255, 0.08)` | 17.06:1 (AAA) | `#10b981` (Emerald) |
| **Nordic Pine** | `rgba(10, 31, 28, 0.75)` | `rgba(16, 185, 129, 0.15)` | 17.45:1 (AAA) | `#34d399` (Mint) |
| **Studio Light** | `rgba(248, 250, 252, 0.90)` | `rgba(0, 0, 0, 0.08)` | 17.06:1 (AAA) | `#059669` (Forest) |
