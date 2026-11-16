# Phase 1: Header & Toolbar Decongestion Specification Prompt
# फेज़ 1: शीर्ष ऐप बार एवं टूलबार डिकंजेस्टन इंजीनियरिंग प्रॉम्प्ट

> **फ़ाइल पाथ (Phase File):** [`temp_prompt/ui_ux_restoration_v4/phase_01_header_and_toolbar_decongestion.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_restoration_v4/phase_01_header_and_toolbar_decongestion.md)  
> **लक्षित कंपोनेंट (Target Component):** Top App Bar, Navigation Header, Quick Action Buttons & Selectors  
> **अग्रणी वास्तुकार (Author):** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **संस्करण (Version):** 4.0.0  
> **स्वीकृति स्थिति (Status):** READY_FOR_SUBAGENT_EXECUTION

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

शीर्ष ऐप बार (`.top-app-bar`) में उपस्थित क्रिया बटनों (`#btnLangToggle`, `#btnThemeToggle`, `#btnExportMenu`, `#btnGlobalRefresh`) से लंबे टेक्स्ट लेबल्स हटाकर उन्हें सुरुचिपूर्ण, 36px x 36px Liquid Glass आइकन-ओनली बटनों में रूपांतरित करना, सुगम्य ग्लासी टूलटिप्स जोड़ना, और शीर्षक (`#topBarTitle`) व सबटाइटल (`#topBarSubtitle`) पर गैर-रैपिंग (`no-wrap`) शैली लागू करना ताकि 1024px और 1366px स्क्रीन्स पर शीर्षक कभी न कटे और न ही दो पंक्तियों में टूटे।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट (Prerequisites & Inputs)

- **सक्रिय रिपॉजिटरी:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)
- **लक्ष्य फ़ाइलें:**
  - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L86-L225) (शीर्ष ऐप बार मार्कअप)
  - [`dashboard/styles/layout.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout.css) (ऐप बार एवं बटन लेआउट)
  - [`dashboard/styles/components.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/components.css) (आइकन-ओनली बटन व टूलटिप शैलियाँ)
  - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L125-L150) (i18n टूलटिप्स और टेक्स्ट सेटिंग्स)
- **पूर्व-सत्यापन स्थिति:** 44/44 टेस्ट सुइट्स उत्तीर्ण (Passing).

---

## 🔍 3. तकनीकी संदर्भ एवं फ़ाइल एंकर (Technical Context & File Anchors)

- **`dashboard.html` Lines 86-220:** शीर्ष ऐप बार मार्कअप जिसमें `#btnLangToggle`, `#btnThemeToggle`, `#btnExportMenu`, `#btnGlobalRefresh` स्थित हैं।
- **`dashboard/styles/layout.css`:** `.top-app-bar`, `.app-bar-left`, `.app-bar-right` के फ्लेक्सबॉक्स नियम।
- **`dashboard/dashboard.js`:** `applyDashboardLanguage` फलन जो `#langToggleText`, `#themeToggleText`, `#btnExportMenuText`, `#btnGlobalRefreshText` के `textContent` को सेट करता है। (नोट: टेस्टों और स्क्रीन रीडर्स के साथ पूर्ण संगतता हेतु ये स्पैन `.sr-only` क्लास के साथ डोम में उपस्थित रहेंगे)।

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### कदम 1.1: `dashboard.html` में मार्कअप संशोधन
1. `#btnLangToggle` की क्लास को `btn-action-outline btn-lang-toggle` से बदलकर `btn-action-icon-only btn-lang-toggle` करें।
   - अंदर के `<span id="langToggleText">` पर क्लास `sr-only` जोड़ें ताकि टेक्स्ट विजुअली छिप जाए किंतु DOM व टेस्ट में मौजूद रहे।
   - बटन पर `aria-label="Switch Language (English / हिंदी)"` और `title="Switch Language (English / हिंदी)"` सुनिश्चित करें।
2. `#btnThemeToggle` की क्लास को `btn-action-icon-only topbar-btn btn-theme-toggle` में बदलें।
   - `<span id="themeToggleText">` पर क्लास `sr-only` लगाएं।
3. `#btnExportMenu` (एक्सपोर्ट ट्रिगर बटन) की क्लास को `btn-action-icon-only btn-export-trigger` बनाएं।
   - `<span id="btnExportMenuText">` पर `sr-only` लगाएं और साथ में एक सूक्ष्म शेवरॉन `<span class="dropdown-chevron-micro">▾</span>` रखें।
4. `#btnGlobalRefresh` की क्लास को `btn-action-icon-only` बनाएं और `<span id="btnGlobalRefreshText">` पर `sr-only` लगाएं।
5. ब्राउज़र व ट्रैकिंग सिलेक्टर्स (`#browserFilterSelect`, `#trackingModeSelect`) के कंटेनर पर `.compact-pill` क्लास लगाएं।

### कदम 1.2: `dashboard/styles/layout.css` में नो-रैप एवं रिस्पॉन्सिव नियम जोड़ें
1. `.top-app-bar` के लिए:
   ```css
   .top-app-bar {
     display: flex;
     align-items: center;
     justify-content: space-between;
     gap: 1.25rem;
     padding: 0.85rem 1.75rem;
     min-height: 64px;
     width: 100%;
     flex-wrap: nowrap; /* Prevent vertical wrapping */
   }
   ```
2. `.app-bar-left` के लिए:
   ```css
   .app-bar-left {
     display: flex;
     flex-direction: column;
     gap: 2px;
     min-width: 0;
     flex: 1 1 auto;
     overflow: hidden;
   }
   .current-page-title {
     font-size: 1.25rem;
     font-weight: 700;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
     margin: 0;
   }
   .current-page-subtitle {
     font-size: 0.8rem;
     color: var(--text-muted);
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
     margin: 0;
   }
   ```
3. `.app-bar-right` के लिए:
   ```css
   .app-bar-right {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     flex-shrink: 0;
   }
   ```

### कदम 1.3: `dashboard/styles/components.css` में बटन स्टाइल जोड़ें
1. `.btn-action-icon-only` और `.sr-only` के नियम दर्ज करें:
   ```css
   .btn-action-icon-only {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     width: 36px;
     height: 36px;
     min-width: 36px;
     padding: 0;
     background: var(--glass-surface-bg, rgba(15, 23, 42, 0.65));
     backdrop-filter: blur(20px);
     -webkit-backdrop-filter: blur(20px);
     border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
     border-radius: 10px;
     color: var(--text-primary);
     font-size: 15px;
     cursor: pointer;
     transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s ease;
   }
   .btn-action-icon-only:hover {
     transform: translateY(-1.5px) scale(1.05);
     background: var(--glass-surface-hover, rgba(30, 41, 59, 0.85));
     border-color: rgba(255, 255, 255, 0.22);
   }
   .sr-only {
     position: absolute;
     width: 1px;
     height: 1px;
     padding: 0;
     margin: -1px;
     overflow: hidden;
     clip: rect(0, 0, 0, 0);
     white-space: nowrap;
     border: 0;
   }
   ```

---

## 🚫 5. वास्तुकला प्रतिबंध एवं सीमाएं (Out-of-Scope Boundaries)

- **प्रतिबंध 1:** `#langToggleText`, `#themeToggleText`, `#btnExportMenuText`, `#btnGlobalRefreshText` स्पैन एलिमेंट्स को DOM से डिलीट नहीं करना है (वे `.sr-only` के साथ मौजूद रहेंगे ताकि मौजूदा टेस्ट पास हों)।
- **प्रतिबंध 2:** इस फेज़ में चतुर्थ टैब या मीडिया प्लेयर के कोड में कोई बदलाव न करें।
- **प्रतिबंध 3:** W3C Trusted Types का 100% अनुपालन; 0 `innerHTML` असाइनमेंट।

---

## 📦 6. देय सामग्री सूची (Deliverables Manifest)

1. अद्यतन [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) (आइकन-ओनली क्लास व `.sr-only` स्पैन्स)
2. अद्यतन [`dashboard/styles/layout.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout.css) (नो-रैप ऐप बार लेआउट)
3. अद्यतन [`dashboard/styles/components.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/components.css) (`.btn-action-icon-only` व `.sr-only` नियम)

---

## 🧪 7. स्थानीय सत्यापन गेट (Local Verification Gate)

```bash
# 1. Verify syntax
node -c dashboard/dashboard.js

# 2. Run header & topbar verification test
node tests/test_header_status_badges.js
node tests/test_dashboard_uiux_phase1.js

# 3. Verify all test suites remain 100% green
node run_all_tests.js
```
