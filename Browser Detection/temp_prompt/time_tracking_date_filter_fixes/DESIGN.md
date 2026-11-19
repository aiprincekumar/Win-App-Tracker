# Design System & UI Specifications: Time Tracking Date Filters

> **Workspace Container:** `temp_prompt/time_tracking_date_filter_fixes/`  
> **Document:** `DESIGN.md`  
> **Lead Department:** Dept 03 (Design Architecture & UI/UX Experience)  
> **Target Subsystems:** Temporal Subtabs, SVG Donut Chart Center, Usage Distribution Card  

---

## 🎨 1. Visual Hierarchy & Interactive States

### 1.1 Temporal Subtab Navigation Bar
The temporal subtab container (`.temporal-subtabs`) houses 7 controls:
1. `📅 Today` (`#btnFilterToday`)
2. `⏪ Yesterday` (`#btnFilterYesterday`)
3. `📊 Last 7 Days` (`#btnFilter7Days`)
4. `🗓️ Last 30 Days` (`#btnFilter30Days`)
5. `🎯 Custom` (`#btnFilterCustom`)
6. `📈 Daily Avg` (`#btnFilterDaily`)
7. `🌐 Total Time` (`#btnFilterTotal`)

### 1.2 State Styling
- **Default State:**
  - Background: `rgba(255, 255, 255, 0.05)`
  - Border: `1px solid rgba(255, 255, 255, 0.1)`
  - Text Color: `var(--text-muted, #94a3b8)`
  - Font Size: `12px`, Font Weight: `500`
- **Hover State:**
  - Background: `rgba(59, 130, 246, 0.15)`
  - Border Color: `rgba(59, 130, 246, 0.3)`
  - Text Color: `var(--text-primary, #f8fafc)`
- **Active State (`.subtab-btn.active`):**
  - Background: `linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.25))`
  - Border: `1px solid rgba(59, 130, 246, 0.6)`
  - Text Color: `#ffffff`
  - Shadow: `0 0 12px rgba(59, 130, 246, 0.35)`
  - `aria-selected`: `true`

---

## 🍩 2. SVG Donut Chart Center Typography

- **Center Time (`#donutCenterBigTime`):**
  - Font Family: `'JetBrains Mono', monospace, sans-serif`
  - Font Size: `28px`
  - Font Weight: `700`
  - Fill: `var(--text-primary, #f8fafc)`
  - Text Anchor: `middle`
- **Center Sub-Label (`#donutCenterSubLabel`):**
  - Font Family: `system-ui, -apple-system, sans-serif`
  - Font Size: `11px`
  - Font Weight: `600`
  - Text Transform: `uppercase`
  - Letter Spacing: `0.05em`
  - Fill: `var(--text-secondary, #94a3b8)`
  - Text Anchor: `middle`

---

## ♿ 3. Accessibility & W3C Standards
- **ARIA Attributes:** `.temporal-subtabs` possesses `role="tablist"`. Each subtab button possesses `role="tab"`, with `aria-selected` dynamically synchronized to `'true'` or `'false'`.
- **Keyboard Navigation:** Enter and Space activate the focused subtab button.
- **Contrast Ratios:** Contrast between active button text and container background exceeds WCAG AAA standard (>= 7:1).
