# Product Requirements Document (PRD): Time Tracking Date Filter Fixes

> **Workspace Container:** `temp_prompt/time_tracking_date_filter_fixes/`  
> **Document:** `PRD.md`  
> **Lead Department:** Dept 01 (Product Requirements / Product Management)  
> **Target Subsystems:** Tab A Time Tracking, SVG Donut Chart, Metric Cards, Domain Breakdown  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: Daily Focus & Analytics User
- **Need:** Reviews how much time was spent on work vs entertainment yesterday and over the last 7 days.
- **Pain Point:** Clicking "Yesterday" or "Last 7 Days" currently displays incomplete or skewed data, with donut center showing "Total Time" and secondary foreground/background metrics displaying inflated all-time numbers.

### Persona 2: Weekly Review & Productivity Auditor
- **Need:** Compares 30-day productivity trends against the current week.
- **Pain Point:** 30-day range either falls back to single-day or all-time totals, failing to provide an accurate 30-day rolling sum.

---

## 📋 2. Functional Requirements (FR)

- **FR-01 (Temporal Subtab Selection):** Clicking `#btnFilterToday`, `#btnFilterYesterday`, `#btnFilter7Days`, `#btnFilter30Days`, or `#btnFilterCustom` must activate that subtab, set `aria-selected="true"`, and trigger re-rendering of Tab A with the selected temporal filter.
- **FR-02 (Deterministic Relative Date Windows):**
  - `today`: Window = `[todayStr]`.
  - `yesterday`: Window = `[yesterdayStr]` where `yesterdayStr` is exactly 1 calendar day before `todayStr`.
  - `7d`: Window = 7 consecutive calendar days ending on `todayStr` inclusive (`[todayStr - 6 days ... todayStr]`).
  - `30d`: Window = 30 consecutive calendar days ending on `todayStr` inclusive (`[todayStr - 29 days ... todayStr]`).
  - `custom`: Window = consecutive calendar days from `customStartDate` to `customEndDate` inclusive.
- **FR-03 (Accurate Metric Aggregation):**
  - For each domain, `computedSeconds` must be the exact sum of seconds across the dates in the active window.
  - `foregroundSeconds`, `backgroundMediaSeconds`, and `combinedSeconds` must reflect the range-specific totals for non-today/non-total temporal modes.
  - Active temporal sum (`activeTemporalSum`) must be the exact sum of `computedSeconds` of all matching domains.
- **FR-04 (Donut Chart Center Label):**
  - The center sub-label (`#donutCenterSubLabel`) must display the localized description of the active range:
    - Today: "Today's Total" / "आज का कुल समय"
    - Yesterday: "Yesterday's Total" / "कल का कुल समय"
    - Last 7 Days: "Last 7 Days Total" / "पिछले 7 दिनों का कुल समय"
    - Last 30 Days: "Last 30 Days Total" / "पिछले 30 दिनों का कुल समय"
    - Custom: "Custom Range Total" / "कस्टम अवधि का कुल समय"
    - Daily Avg: "Daily Average" / "दैनिक औसत"
    - Total Time: "All Time Total" / "कुल रिकॉर्डेड समय"
- **FR-05 (Bilingual UI Support):** All text labels must support instantaneous English and Hindi translation via `#btnLangToggle`.

---

## ⚙️ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Performance):** Date filter switching must render in < 50ms without UI freezing or noticeable lag.
- **NFR-02 (Security & Trusted Types):** Zero use of `innerHTML`. All DOM updates must strictly employ `textContent` or DOM node manipulation.
- **NFR-03 (Modularity & Maintainability):** In accordance with Universal Rule 28, functions must not exceed 50 lines or nesting depth 3.
- **NFR-04 (Encoding Integrity):** UTF-8 with BOM must be preserved across all touched project files.

---

## 🧪 4. INVEST-Compliant Acceptance Criteria (Given-When-Then)

### AC-01: Yesterday Range Selection
- **Given:** Historical tracking data contains recorded activity on `2026-11-18` (500s on `github.com`) and `2026-11-19` (1000s on `github.com`).
- **When:** The user clicks `#btnFilterYesterday` while `todayStr` is `2026-11-19`.
- **Then:** `github.com` computed time displays `8m 20s` (500s), the donut chart center time displays `8m 20s`, and the center label displays `Yesterday's Total`.

### AC-02: Last 7 Days Range Selection
- **Given:** Historical tracking data contains activity across the last 7 calendar days.
- **When:** The user clicks `#btnFilter7Days`.
- **Then:** Only activity recorded between `todayStr - 6 days` and `todayStr` is summed, the total matches the 7-day sum, and donut center label reflects `Last 7 Days Total`.

### AC-03: Bilingual Parity on Donut Center
- **Given:** The user has selected `#btnFilter30Days`.
- **When:** The user clicks the language toggle `#btnLangToggle` to switch to Hindi.
- **Then:** `#donutCenterSubLabel` updates to "पिछले 30 दिनों का कुल समय".
