# Phase 3: Bilingual English & Hindi (i18n) Parity

> **Phase Identifier:** `phase_03_i18n_bilingual_parity`  
> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Assigned Role:** Level 4 i18n / Localization Specialist  
> **Target Subsystems:** `locales/en.json`, `locales/hi.json`, `dashboard/dashboard.js`  

---

## 🎯 1. Phase Objective

Establish 100% bilingual parity across English (`locales/en.json`) and Hindi (`locales/hi.json`) for all 20 KPI card labels, subtitles, and tooltips, ensuring that when the language toggle is switched, every card renders authentic localized text without placeholders, fallback English leaks, or missing token warnings.

---

## 📋 2. Prerequisites & Inputs

- Completion of Phase 1 and Phase 2.
- Target files:
  - [`locales/en.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/locales/en.json)
  - [`locales/hi.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/locales/hi.json)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 3.1: Add New KPI Tokens to `locales/en.json`

Add the following keys to `locales/en.json` (preserve existing structure and keys):

```json
  "metric_active_domains": "Active Domains",
  "metric_active_domains_sub": "Distinct sites visited",
  "metric_distraction_time": "Leisure & Distraction",
  "metric_distraction_sub": "Entertainment & social",
  "metric_peak_hour": "Peak Activity Hour",
  "metric_peak_hour_sub": "Highest traffic window",
  "metric_longest_session": "Longest Session",
  "metric_longest_session_sub": "Uninterrupted focus run",
  "media_metric_top_platform": "Top Media Platform",
  "media_sub_top_platform": "Most watched service",
  "media_metric_active_streams": "Live Streams",
  "media_sub_active_streams": "Active concurrent streams",
  "media_metric_muted_sessions": "Muted Sessions",
  "media_sub_muted_sessions": "Silent / muted playback",
  "media_metric_longest_session": "Longest Media",
  "media_sub_longest_session": "Single longest video"
```

---

### Step 3.2: Add Exact Hindi Translations to `locales/hi.json`

Add corresponding authentic Hindi translation keys to `locales/hi.json`:

```json
  "metric_active_domains": "सक्रिय डोमेन",
  "metric_active_domains_sub": "विज़िट की गई भिन्न वेबसाइटें",
  "metric_distraction_time": "मनोरंजन एवं व्यवधान",
  "metric_distraction_sub": "मनोरंजन और सोशल मीडिया",
  "metric_peak_hour": "चरम गतिविधि का समय",
  "metric_peak_hour_sub": "सर्वाधिक उपयोग की समयावधि",
  "metric_longest_session": "सबसे लंबा सत्र",
  "metric_longest_session_sub": "निर्बाध निरंतर ब्राउज़िंग",
  "media_metric_top_platform": "शीर्ष मीडिया प्लेटफ़ॉर्म",
  "media_sub_top_platform": "सर्वाधिक देखा गया प्लेटफ़ॉर्म",
  "media_metric_active_streams": "लाइव स्ट्रीम",
  "media_sub_active_streams": "सक्रिय समवर्ती स्ट्रीम",
  "media_metric_muted_sessions": "म्यूट किए गए सत्र",
  "media_sub_muted_sessions": "मौन / म्यूट प्लेबैक",
  "media_metric_longest_session": "सबसे लंबा मीडिया सत्र",
  "media_sub_longest_session": "एकल सबसे लंबा वीडियो"
```

---

### Step 3.3: Verify Dynamic Translation Binding in `dashboard/dashboard.js`

Ensure `applyLanguage(lang)` queries `data-i18n` attributes and binds `t()` correctly:
```javascript
document.querySelectorAll('[data-i18n]').forEach(el => {
  const key = el.getAttribute('data-i18n');
  if (key && typeof t === 'function') {
    const val = t(key);
    if (val && val !== key) {
      el.textContent = val;
    }
  }
});
```

---

## 🔒 4. Constraints & Invariants

- **Bilingual Bit-for-Bit Key Parity:** Every key added to `en.json` MUST exist in `hi.json`. No asymmetric keys allowed.
- **Valid JSON Syntax:** Both `en.json` and `hi.json` must pass strict `JSON.parse` with zero trailing commas or syntax errors.
- **UTF-8 with BOM Standard:** Both locale files must retain `0xEF, 0xBB, 0xBF` byte order mark.

---

## 📦 5. Deliverables Manifest

- `locales/en.json` (Added 16 new English tokens for 10x2 KPI expansion)
- `locales/hi.json` (Added 16 new Hindi tokens for 10x2 KPI expansion)

---

## ✅ 6. Local Verification Gate

```powershell
node -e "
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));
const hi = JSON.parse(fs.readFileSync('locales/hi.json', 'utf8'));
const requiredKeys = [
  'metric_active_domains', 'metric_distraction_time', 'metric_peak_hour', 'metric_longest_session',
  'media_metric_top_platform', 'media_metric_active_streams', 'media_metric_muted_sessions', 'media_metric_longest_session'
];
let missing = 0;
requiredKeys.forEach(k => {
  if (!en[k]) { console.error('Missing in en.json:', k); missing++; }
  if (!hi[k]) { console.error('Missing in hi.json:', k); missing++; }
});
if (missing > 0) { process.exit(1); }
console.log('100% Bilingual Parity Certified for all 10x2 KPI keys!');
"
```
