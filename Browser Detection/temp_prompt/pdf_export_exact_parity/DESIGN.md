# Design Specification & Print UI Tokens (DESIGN.md)

> **Task ID:** `TASK-PDF-EXPORT-EXACT-PARITY-001`  
> **Initiative:** PDF Export Exact Parity Overhaul  
> **Target Subsystems:** Print CSS, Typography Scales, Grid Geometry, Contrast Matrices  
> **Standard:** WCAG 2.1 AA / AAA High-Contrast Print Standard & ISO A4 Landscape Geometry  

---

## 🎨 1. Physical Page Geometry & Layout Architecture

The print output is architected specifically for **A4 Landscape** format to allow high-density telemetry displays without horizontal clipping or awkward wrapping.

| Parameter | Specification | Purpose |
| :--- | :--- | :--- |
| **Page Size** | `size: A4 landscape` (297mm × 210mm) | Provides wide horizontal canvas for 5-column KPI grids and 24-column heatmaps. |
| **Margins** | `10mm 12mm 10mm 12mm` (Top, Right, Bottom, Left) | Maximum printable area while respecting standard printer hardware margins. |
| **Color Scheme** | High-Contrast Clean Light Mode (`#ffffff` background, `#0f172a` text) | Crisp legibility and toner-efficient printing. |
| **Container Width** | `100% !important; max-width: 100% !important;` | Eliminates centering boxes, faux device wrappers, and margin clipping. |

---

## 🔲 2. Visual Hierarchy & Two-Part Layout Contract

```
┌────────────────────────────────────────────────────────────────────────┐
│ PAGE 1: PART 1 - TIME TRACKING & CIRCADIAN FOCUS                       │
├────────────────────────────────────────────────────────────────────────┤
│ 🏢 Executive Header (Title, Reporting Period, Offline Badge)           │
│                                                                        │
│ 📊 10-KPI Tracking Grid (2 Rows of 5 Cards)                           │
│   [Today Time]  [Daily Avg]    [Total Tracked] [Prod Index]  [Focus]   │
│   [Top Domain]  [Active Dom]   [Distraction]   [Peak Hour]   [Longest] │
│                                                                        │
│ 🕒 7x24 Chrono-Activity Heatmap (Mon-Sun × 00-23h Matrix + Legend)     │
│                                                                        │
│ 🍩 Top Activity Proportions (Donut Chart & Legend)                     │
│                                                                        │
│ 📋 Domain Activity Table (Top Visited Domains, Time Spent, Share)       │
└────────────────────────────────────────────────────────────────────────┘
═══════════════════════════════ PAGE BREAK ══════════════════════════════
┌────────────────────────────────────────────────────────────────────────┐
│ PAGE 2: PART 2 - MEDIA ANALYTICS & STREAMING TELEMETRY                │
├────────────────────────────────────────────────────────────────────────┤
│ 🎬 Section Header: Media Analytics & Streaming Telemetry               │
│                                                                        │
│ 🎵 10-KPI Media Grid (2 Rows of 5 Cards)                               │
│   [Total Watch] [Avg Watch]    [Sessions]      [Platform]    [Streams] │
│   [Avg Volume]  [Peak Volume]  [Low Volume]    [Muted Sess]  [Longest] │
│                                                                        │
│ 📽️ Media Playback Watch History Table (Title, Platform, Duration, Vol) │
│                                                                        │
│ 🛡️ Audit Footer (Checksum, Timestamp, Offline Verification Badge)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 3. High-Contrast Print UI Design Tokens

### 3.1 Color Palette
```css
:root {
  /* Surfaces & Canvas */
  --print-bg: #ffffff;
  --print-card-bg: #f8fafc;
  --print-card-bg-subtle: #f1f5f9;
  
  /* Text & Contrast */
  --print-text-primary: #0f172a;       /* 17.8:1 contrast on white (WCAG AAA) */
  --print-text-secondary: #334155;     /* 10.3:1 contrast on white (WCAG AAA) */
  --print-text-muted: #64748b;         /* 4.9:1 contrast on white (WCAG AA) */
  
  /* Borders & Dividers */
  --print-border-light: #e2e8f0;
  --print-border-strong: #cbd5e1;
  --print-border-accent: #94a3b8;
  
  /* Accent Hues */
  --print-emerald: #059669;            /* Deep emerald for productivity / focus */
  --print-cyan: #0891b2;               /* Cyan for audio/media highlights */
  --print-indigo: #4f46e5;             /* Indigo for categories */
  --print-amber: #d97706;              /* Amber for distraction warnings */
  --print-rose: #dc2626;               /* Rose for muted / danger */
}
```

### 3.2 Typography Scales
```css
--print-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--print-font-numbers: tabular-nums;

/* Scale */
--print-title-lg: 16pt / 1.2 bold;       /* Executive Digest Title */
--print-title-md: 12pt / 1.2 bold;       /* Section Titles */
--print-kpi-value: 13pt / 1.1 bold;      /* Metric Big Values */
--print-kpi-label: 7pt / 1.1 uppercase;  /* Metric Labels (0.5px letter-spacing) */
--print-kpi-sub: 6.5pt / 1.1 normal;     /* Metric Subtitles */
--print-body: 8.5pt / 1.4 normal;        /* Table Cells & Regular Text */
--print-table-th: 7pt / 1.2 bold;        /* Table Headers (uppercase) */
--print-caption: 6.5pt / 1.2 normal;     /* Heatmap & Footer captions */
```

---

## 📊 4. Component Grid Geometry & Dimensions

### 4.1 10-KPI Symmetric Grid (2 Rows × 5 Columns)
- **Container:** `display: grid !important; grid-template-columns: repeat(5, 1fr) !important; gap: 8px !important;`
- **Metric Card:**
  - `padding: 6px 10px !important;`
  - `background: #f8fafc !important;`
  - `border: 1px solid #cbd5e1 !important;`
  - `border-radius: 6px !important;`
  - `break-inside: avoid !important; page-break-inside: avoid !important;`
- **Value Row:** `font-size: 1.15rem !important; font-weight: 700 !important; color: #0f172a !important;`
- **Subtitle Row:** `font-size: 0.68rem !important; color: #64748b !important;`

### 4.2 Chrono-Activity Heatmap (7 Days × 24 Hours)
- **Container:** `display: grid !important; grid-template-columns: 44px repeat(24, 1fr) !important; gap: 2px !important;`
- **Cell Height:** `12px !important;`
- **Intensity Tiers (Print Optimized):**
  - Tier 0 (0m): `#ffffff !important; border: 1px solid #e2e8f0 !important;`
  - Tier 1 (1-15m): `#d1fae5 !important; border: 1px solid #a7f3d0 !important;`
  - Tier 2 (15-30m): `#6ee7b7 !important; border: 1px solid #34d399 !important;`
  - Tier 3 (30-45m): `#10b981 !important; border: 1px solid #059669 !important;`
  - Tier 4 (45-60m): `#047857 !important; border: 1px solid #064e3b !important;`

### 4.3 Donut Chart & Activity Proportions
- **Donut SVG:** `width: 100px; height: 100px; stroke-width: 12;`
- **Legend:** Compact vertical column with colored dots (`width: 8px; height: 8px;`), label, and duration chip.
- **Distribution Progress Bars:** `height: 5px; border-radius: 2.5px; background: #e2e8f0;`

### 4.4 Data Tables (Domain Table & Media History Table)
- **Table:** `width: 100% !important; border-collapse: collapse !important;`
- **Header (`th`):** `background: #f1f5f9 !important; color: #334155 !important; font-size: 7pt !important; font-weight: 700 !important; border-bottom: 2px solid #cbd5e1 !important;`
- **Rows (`tr`):** `break-inside: avoid !important; page-break-inside: avoid !important;`
- **Cells (`td`):** `padding: 5px 8px !important; font-size: 8pt !important; border-bottom: 1px solid #e2e8f0 !important;`
- **Repeat Headers on Multi-Page Tables:**
  ```css
  thead { display: table-header-group !important; }
  tbody { display: table-row-group !important; }
  ```

---

## ✂️ 5. Intentional Page Break Contract

```css
/* Strict boundary enforcing Part 2 on a brand new page */
.part-media-section {
  display: block !important;
  page-break-before: always !important;
  break-before: page !important;
  margin-top: 0 !important;
  padding-top: 10px !important;
}

/* Guard to prevent awkward mid-section splits in Part 1 */
.part-tracking-section {
  display: block !important;
  break-after: avoid !important;
  page-break-after: avoid !important;
}
```
