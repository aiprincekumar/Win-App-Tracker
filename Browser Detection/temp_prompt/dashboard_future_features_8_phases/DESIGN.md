# Web Activity & Media Sentinel - Dashboard Future Features (8 Capabilities Across 4 Phases)
## Design System & UI Tokens Specification (DESIGN.md)

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Standard:** WCAG 2.1 AA/AAA Contrast, Hardware-Accelerated 60fps Micro-Motion, W3C Safe DOM  
> **Master Reference:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Ephemeral Container:** `temp_prompt/dashboard_future_features_8_phases/`  

---

## 🎨 1. Color Tokens & Semantic Palettes

### 1.1 Chrono-Heatmap Intensity Tiers

| Tier Level | Duration Window | Dark Theme Color | Light Theme Color | Border / Accent |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | $0\text{ min}$ (Zero Activity) | `#1e293b` (slate-800) | `#e2e8f0` (slate-200) | `1px solid rgba(255,255,255,0.04)` |
| **Tier 1** | $1 - 15\text{ min}$ | `#064e3b` (emerald-900) | `#a7f3d0` (emerald-200) | `1px solid rgba(16,185,129,0.2)` |
| **Tier 2** | $15 - 30\text{ min}$ | `#047857` (emerald-700) | `#34d399` (emerald-400) | `1px solid rgba(16,185,129,0.4)` |
| **Tier 3** | $30 - 45\text{ min}$ | `#059669` (emerald-600) | `#10b981` (emerald-500) | `1px solid rgba(16,185,129,0.6)` |
| **Tier 4** | $45 - 60\text{ min}$ (Peak) | `#10b981` (emerald-500) | `#047857` (emerald-700) | `1px solid #34d399` + ambient glow |

### 1.2 Domain Category Badges

```css
/* Category Token Definitions */
.badge-cat-work {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8; /* sky-400 */
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.badge-cat-learning {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399; /* emerald-400 */
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-cat-entertainment {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185; /* rose-400 */
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.badge-cat-social {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc; /* purple-400 */
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge-cat-utility {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24; /* amber-400 */
  border: 1px solid rgba(245, 158, 11, 0.3);
}
```

### 1.3 Productivity Gauge Tiers

- **Deep Focus ($\ge 80$):** Cyber Emerald `#10b981`, pulsing glow `0 0 16px rgba(16, 185, 129, 0.4)`.
- **Balanced ($60 - 79$):** Solar Amber `#f59e0b`, warm glow `0 0 16px rgba(245, 158, 11, 0.4)`.
- **Distracted ($< 60$):** Neon Rose `#f43f5e`, alert glow `0 0 16px rgba(244, 63, 94, 0.4)`.

---

## 📐 2. Component Layouts & Wireframes

### 2.1 Chrono-Activity Heatmap Grid (7x24 Matrix)

```
+------------------------------------------------------------------------------------------------------+
| 🗓️ Chrono-Activity Heatmap [24h x 7d]              [ (•) Focus Time   ( ) Media Time ] [ 📈 WoW: +12.4% ] |
| Subtabs: [ Today | Yesterday | [ 7 Days ] | 30 Days | Custom: 2026-11-09 to 2026-11-15 ]             |
+------------------------------------------------------------------------------------------------------+
|       00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23                         |
| Mon  [0][0][0][0][0][0][0][1][2][4][4][3][2][4][4][4][4][3][2][1][0][0][0][0]                         |
| Tue  [0][0][0][0][0][0][0][1][4][4][4][4][2][4][4][4][4][3][2][1][0][0][0][0]                         |
| Wed  [0][0][0][0][0][0][0][1][2][4][4][3][2][4][4][4][4][4][2][1][0][0][0][0]                         |
| Thu  [0][0][0][0][0][0][0][1][2][4][4][4][2][4][4][4][4][4][3][1][0][0][0][0]                         |
| Fri  [0][0][0][0][0][0][0][1][2][4][4][3][2][4][4][4][3][3][2][1][0][0][0][0]                         |
| Sat  [0][0][0][0][0][0][0][0][0][1][2][2][3][4][4][2][1][0][0][0][0][0][0][0]                         |
| Sun  [0][0][0][0][0][0][0][0][0][1][2][3][3][4][2][1][0][0][0][0][0][0][0][0]                         |
+------------------------------------------------------------------------------------------------------+
| Legend: [0] 0m  [1] 1-15m  [2] 15-30m  [3] 30-45m  [4] 45-60m (Hover cell for domain details)        |
+------------------------------------------------------------------------------------------------------+
```

### 2.2 Multi-Tab Live Media Deck Card

```
+-------------------------------------------------------------+
| 🌐 [Favicon] YouTube - Lofi Hip Hop Radio 24/7             |
| Status: 🟢 Playing | URL: youtube.com/watch?v=...          |
| [====================•-----------------------] 24:15 / 1:20:00 |
| [ ⏪ -10s ] [ ⏸️ Pause ] [ ⏩ +10s ]  Vol: [====•---] 75%      |
| [ 🎧 Solo Tab ] [ 🔇 Mute Tab ]                              |
+-------------------------------------------------------------+
```

### 2.3 Canvas Audio Visualizer (#canvasAudioVisualizer)

```
+-------------------------------------------------------------+
| 🎛️ Real-Time Audio Visualizer          [ Bars (•) | Wave ( ) ] |
| +---------------------------------------------------------+ |
| |  ||  ||||  ||||||  ||||||||  ||||||  ||||  ||  |        | |
| |  ||  ||||  ||||||  ||||||||  ||||||  ||||  ||  |        | |
| +---------------------------------------------------------+ |
| L: [||||||||||||||||||||.........] -6dB                     |
| R: [|||||||||||||||||||||........] -4dB      [CLIP: 🟢 OK]  |
+-------------------------------------------------------------+
```

---

## 🖨️ 3. Print Stylesheet Specification (@media print)

```css
@media print {
  /* Hide non-printable navigation, sidebar, action buttons and search bars */
  .dashboard-sidebar,
  .dashboard-header-actions,
  .btn,
  .tab-nav,
  .search-container,
  .modal-overlay,
  #heroAudioLabStatus,
  #canvasAudioVisualizer {
    display: none !important;
  }

  /* Reset main background to pure white for crisp paper printing */
  body, .dashboard-container, .main-content {
    background: #ffffff !important;
    color: #0f172a !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Executive Report Header */
  .print-executive-header {
    display: block !important;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  /* Keep cards together without awkward page breaks */
  .metrics-grid,
  .chart-card,
  .table-card,
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Enhance borders and contrast for grayscale / color printing */
  .card, table {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
  }
}
```

---

## ♿ 4. Accessibility & Interaction Polish

- **ARIA Sliders & Visualizer:** `#canvasAudioVisualizer` includes `role="img"` and `aria-label="Real-time audio frequency spectrum visualizer"`.
- **Keyboard Navigation:** Every category dropdown, subtab, solo button, and rollback button supports Tab navigation, Enter/Space activation, and visible `:focus-visible` dual-ring emerald outlines.
- **Micro-Motion:** Transitions on score gauge, category badge switches, and heatmap hovers are capped at $150\text{ms}$ with `cubic-bezier(0.16, 1, 0.3, 1)`.
