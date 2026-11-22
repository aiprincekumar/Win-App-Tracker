# Print Design System & Tokens (DESIGN.md) - Executive Digest Print

> **Document:** `temp_prompt/print_pagination_defect_overhaul/DESIGN.md`  
> **Medium:** Paged Media (Physical Print & PDF Rendering)  
> **Compliance:** WCAG 2.1 AA Contrast, ISO 216 (A4 Landscape)  

---

## 📐 1. Paged Geometry & Margins

```css
@page {
  size: A4 landscape;          /* 297mm width x 210mm height */
  margin: 10mm 12mm 10mm 12mm; /* Printable Width: 273mm (~1032px at 96 DPI) */
                               /* Printable Height: 190mm (~718px at 96 DPI) */
}
```

### Vertical Budget Allocation (Page 1)
- **Top Margin:** `10mm` (~38px)
- **Executive Header:** `~110px` (Title, metadata, logo badge)
- **Header Margin:** `12px`
- **KPI Summary Grid (5x2):** `~180px` (Compact 2 rows of 5 cards)
- **Section Spacing:** `14px`
- **Analytics Chart Hero:** `~260px` (Compact Donut + Activity distribution)
- **Remaining Buffer on Page 1:** `~100px` (Safeguards against premature break onto Page 2)

---

## 🎨 2. Print Color Palette & Contrast Tokens

All colors are calibrated for high-fidelity monochrome laser and color ink printing:

| Token Name | Hex Value | Role in Print | Contrast vs White |
| :--- | :--- | :--- | :---: |
| `--print-bg` | `#ffffff` | Page & container background | 1:1 |
| `--print-text` | `#0f172a` | Primary headings, KPI numbers, table rows | 15.6:1 (AAA) |
| `--print-muted` | `#475569` | Subtitles, labels, metadata | 7.3:1 (AAA) |
| `--print-border-light`| `#e2e8f0` | Table cell dividers, secondary cards | 1.3:1 |
| `--print-border-strong`| `#cbd5e1` | Card outlines, table perimeter | 2.1:1 |
| `--print-header-bg` | `#f1f5f9` | Table header background (`th`) | 1.1:1 |
| `--print-accent-green`| `#059669` | High-contrast productivity highlight | 4.8:1 (AA) |
| `--print-accent-blue` | `#0284c7` | Category badges & timeline markers | 4.6:1 (AA) |

---

## 🔤 3. Typography Scale (Print Optimized)

Screen fonts are scaled down by ~15-20% to prevent excessive line wrapping and maintain high data density:

| Element | Screen Size | Print Size | Weight | Line Height | Case |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Document Title** | 1.8rem | 1.35rem | 800 | 1.2 | Normal |
| **Section Titles** | 1.25rem | 1.0rem | 700 | 1.3 | Normal |
| **KPI Big Numbers** | 1.5rem | 1.15rem | 800 | 1.1 | Tabular Nums |
| **KPI Labels** | 0.82rem | 0.70rem | 700 | 1.2 | Uppercase |
| **Table Headers** | 0.85rem | 0.72rem | 700 | 1.2 | Uppercase |
| **Table Body Cells**| 0.90rem | 0.80rem | 500 | 1.3 | Normal / Tabular |
| **Footer / Meta** | 0.80rem | 0.72rem | 500 | 1.2 | Normal |

---

## 📦 4. Spacing, Padding & Margin Scales

```css
/* Print Spacing Tokens */
--print-space-xs: 4px;
--print-space-sm: 6px;
--print-space-md: 8px;
--print-space-lg: 12px;
--print-space-xl: 14px;
```

- **Card Padding:** `6px 10px`
- **Table Cell Padding:** `4px 8px`
- **Section Margins:** `12px - 14px`
- **Header Margin Bottom:** `12px`
- **Footer Margin Top:** `14px`
