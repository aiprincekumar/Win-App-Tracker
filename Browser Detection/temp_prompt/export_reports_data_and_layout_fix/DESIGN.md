# Design System & UI Specifications: Executive Export Reports (Landscape)

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Document Type:** Design System Specification (DESIGN.md)  
> **Container:** `temp_prompt/export_reports_data_and_layout_fix/`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Lead Department:** Dept 04 (UI/UX Design System)  

---

## 🎨 1. Visual Geometry & Paper Dimensions

- **Print Canvas Geometry:** `size: A4 landscape;` (Width: 297mm / ~1140px, Height: 210mm / ~800px).
- **Margins:** `10mm 12mm 10mm 12mm` (Balanced gutters providing maximum printable area while preserving binding edges).
- **Surface & Backgrounds:**
  - Print & Document Surface: `#ffffff` (Pure optical white, zero ink bleed).
  - Subtle Card Fill: `#f8fafc` (Slate 50).
  - Table Header Fill: `#f1f5f9` (Slate 100).
- **Borders & Dividers:**
  - Structural Borders: `1px solid #cbd5e1` (Slate 300).
  - Row Hairlines: `1px solid #e2e8f0` (Slate 200).
  - Brand Header Accent: `2px solid #0f172a` (Slate 900).

---

## 🔤 2. Typography & Numerals

- **System Font Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Tabular Numerals:** `font-variant-numeric: tabular-nums;` strictly enforced on all duration, session, share, and index columns.
- **Hierarchy:**
  - Document Title: `1.5rem` / `24px`, Weight: `800`, `#0f172a`
  - Section Titles: `1.15rem` / `18px`, Weight: `700`, `#0f172a`
  - KPI Big Numbers: `1.35rem` / `22px`, Weight: `800`, Tabular
  - Table Headers: `0.75rem` / `12px`, Weight: `700`, Text-Transform: `uppercase`, `#475569`
  - Body Data Cells: `0.85rem` / `14px`, Weight: `500` - `600`, `#0f172a`

---

## 🏷️ 3. Semantic Badges & Category Tokens

| Token Name | Background Fill | Foreground Text | Border / Weight | Semantic Intent |
| :--- | :--- | :--- | :--- | :--- |
| `.badge.work` | `#e0f2fe` | `#0369a1` | 700 / Uppercase | Deep work, engineering, dev tools |
| `.badge.learning` | `#dcfce7` | `#15803d` | 700 / Uppercase | Documentation, tutorials, research |
| `.badge.entertainment` | `#fef3c7` | `#b45309` | 700 / Uppercase | Video, streaming, gaming |
| `.badge.social` | `#fce7f3` | `#be185d` | 700 / Uppercase | Messaging, social media, forums |
| `.badge.utility` | `#f1f5f9` | `#475569` | 700 / Uppercase | System tools, search, settings |
| `.badge.productive` | `#dcfce7` | `#15803d` | 700 / Uppercase | Net-positive focus score |
| `.badge.leisure` | `#fef3c7` | `#b45309` | 700 / Uppercase | Personal downtime / leisure |
| `.badge.neutral` | `#f1f5f9` | `#475569` | 700 / Uppercase | Neutral / unclassified |

---

## 📊 4. Landscape Table Layout Guidelines

- **Full Width Utilization:** Tables expand across `100%` of printable container width (`max-width: 100%`).
- **Padding:** Headers and data cells use `8px 10px` compact padding in print.
- **Word Wrapping:**
  - Domain names & media titles allow graceful wrapping on long strings (`word-break: break-word`).
  - Numbers, badges, and durations use `white-space: nowrap`.
