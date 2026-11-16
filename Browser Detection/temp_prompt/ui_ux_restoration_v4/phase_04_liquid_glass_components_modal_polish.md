# Phase 4: Liquid Glass 2.0 Components & Modals Polish Specification Prompt
# फेज़ 4: लिक्विड ग्लास 2.0 कंपोनेंट्स एवं मोडल्स सौंदर्य संवर्धन प्रॉम्प्ट

> **फ़ाइल पाथ (Phase File):** [`temp_prompt/ui_ux_restoration_v4/phase_04_liquid_glass_components_modal_polish.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_restoration_v4/phase_04_liquid_glass_components_modal_polish.md)  
> **लक्षित कंपोनेंट्स (Target Components):** Daily Budget, Domain Note Modal, Conflict Modal, Blacklist Chips, Heatmap Controls, Table Hover Actions, Export Dropdown  
> **अग्रणी वास्तुकार (Author):** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **संस्करण (Version):** 4.0.0  
> **स्वीकृति स्थिति (Status):** READY_FOR_SUBAGENT_EXECUTION

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

डैशबोर्ड के 7 महत्वपूर्ण यूआई कंपोनेंट्स और मोडल्स (दैनिक बजट, डोमेन नोट मोडल, बैकअप कॉन्फ्लिक्ट मोडल, गोपनीयता ब्लैकलिस्ट चिप्स, 168-सेल हीटमैप कंट्रोल्स, टेबल होवर एक्शन्स, और एक्सपोर्ट ड्रॉपडाउन) को Liquid Glass 2.0 (24px ब्लर, 190% सैचुरेशन, स्पेक्युलर बॉर्डर्स, तथा सूक्ष्म सूक्ष्म-इंटरैक्शन) के साथ उच्च स्तरीय विजुअल पॉलिश प्रदान करना।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट (Prerequisites & Inputs)

- **सक्रिय रिपॉजिटरी:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)
- **लक्ष्य फ़ाइलें:**
  - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)
  - [`dashboard/styles/wellbeing_blacklist.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css)
  - [`dashboard/styles/components.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/components.css)
  - [`dashboard/styles/tracking.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/tracking.css)
  - [`dashboard/styles/layout.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout.css)
- **पूर्व-सत्यापन स्थिति:** Phase 1, 2, 3 पूर्ण तथा 44/44 टेस्ट सुइट्स उत्तीर्ण।

---

## 🔍 3. सातों कंपोनेंट्स का तकनीकी विश्लेषण एवं समाधान

### 1. डोमेन दैनिक बजट कार्ड (`#cardDomainBudgets`)
- **समस्या:** इनपुट फील्ड्स और बटन बुनियादी हैं; बजट लिस्ट में खाली स्थिति (`:empty`) और प्रोग्रेस पिल्स का सौंदर्य असंगत है।
- **समाधान:** इनपुट्स पर ग्लासी बॉर्डर (`rgba(255, 255, 255, 0.12)`), फोकस रिंग्स, और बजट लिस्ट आइटम्स पर सटल ग्रेडिएंट्स व 80% / 100% पिल्स का सौंदर्य संवर्धन।

### 2. डोमेन नोट मोडल (`#modalDomainNote`)
- **समस्या:** `#modalDomainNote` में बुनियादी टेक्स्टएरिया और बटन हैं जो Liquid Glass 2.0 से मेल नहीं खाते।
- **समाधान:** `.note-modal-card` को 24px ब्लर, 190% सैचुरेशन, स्पेक्युलर बॉर्डर (`inset 0 1px 0 rgba(255,255,255,0.15)`), और टेक्स्टएरिया को ग्लासी इनसेट शैडो प्रदान करें।

### 3. बैकअप कॉन्फ्लिक्ट रेजोल्यूशन मोडल (`#modalConflictResolution`)
- **समस्या:** विकल्प बटन्स (`#btnConflictMerge`, `#btnConflictOverwrite`, `#btnConflictAppend`) का लेआउट और सबटेक्स्ट अस्पष्ट दिखते हैं।
- **समाधान:** प्रत्येक विकल्प को एक सुरुचिपूर्ण इंटरैक्टिव ग्लास कार्ड में बदलें, जिसमें होवर पर सटल ग्लो और बॉर्डर हाईलाइट हो।

### 4. गोपनीयता ट्रैकिंग ब्लैकलिस्ट कार्ड (`#cardTrackingBlacklist`)
- **समस्या:** ब्लैकलिस्ट चिप्स का बैकग्राउंड फीका है और रिमूव बटन (`✕`) सूक्ष्मता से संरेखित नहीं है।
- **समाधान:** चिप्स पर सेमी-ट्रांसपेरेंट रेडिश ग्लास पिल्स (`rgba(239, 68, 68, 0.15)`), ग्लोइंग बॉर्डर, और स्मूथ ट्रांसफॉर्म होवर लागू करें।

### 5. 168-सेल हीटमैप कंट्रोल्स (`#cardChronoHeatmap`)
- **समस्या:** मोड टॉगल बटन्स (`#btnHeatmapModeFocus`, `#btnHeatmapModeMedia`) और वीक-ओवर-वीक बैज (`#heatmapWowBadge`) साधारण दिखते हैं।
- **समाधान:** दोनों टॉगल बटन्स को एक संयुक्त ग्लासी सेगमेंटेड कंट्रोल (Segmented Pill Switcher) में समेटें, सक्रिय बटन पर एमराल्ड ग्लो दें।

### 6. टेबल होवर एक्शन्स (`.cell-quick-actions`)
- **समस्या:** स्टार व नोट बटन साधारण दिखते हैं और माउस होवर पर विजुअल जंप होता है।
- **समाधान:** `.cell-quick-actions` को स्मूथ 150ms फेड-इन और ट्रांसफॉर्म दें, और टेबल रो की कुल ऊंचाई 42px पर लॉक रखें।

### 7. एक्सपोर्ट ड्रॉपडाउन मेनू (`#exportDropdownMenu`)
- **समस्या:** मेनू आइटम्स में आइकॉन और टेक्स्ट का अलाइनमेंट असंगत है।
- **समाधान:** `.export-dropdown-menu` को एलिवेटेड ग्लास कार्ड (z-index: 1000), स्मूथ स्केल-अप एनिमेशन, और ग्लासी डिवाइडर दें।

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### कदम 4.1: `dashboard/styles/wellbeing_blacklist.css` का संवर्धन
1. मोडल और बजट स्टाइल्स को Liquid Glass 2.0 टोकन्स के साथ अपडेट करें।
2. `.note-modal-card` और `.conflict-modal-card` में एनिमेशन और स्पेक्युलर हाइलाइट जोड़ें।
3. `.blacklist-chip` और `.domain-budgets-list` के कंटेनर को रिफाइंड ग्लास लुक दें।

### कदम 4.2: `dashboard/styles/components.css` व `layout.css` में एक्सपोर्ट मेनू रिफाइनमेंट
1. `.export-dropdown-menu` के बैकड्रॉप ब्लर और बॉर्डर को मानकीकृत करें।
2. `.export-menu-item:hover` पर सटल एमराल्ड/स्यान एक्सेंट ग्लो जोड़ें।

### कदम 4.3: `dashboard/styles/tracking.css` में हीटमैप और टेबल एक्शन रिफाइनमेंट
1. `.heatmap-mode-toggles` को सेगमेंटेड पिल लुक दें।
2. `.cell-quick-actions` को स्मूथ विजिबिलिटी और 42px रो-हाइट स्थिरता प्रदान करें।

---

## 🚫 5. वास्तुकला प्रतिबंध एवं सीमाएं (Out-of-Scope Boundaries)

- **प्रतिबंध 1:** किसी भी मोडल या कार्ड की आईडी (`modalDomainNote`, `modalConflictResolution`, `cardDomainBudgets`, `cardTrackingBlacklist`) को न बदलें।
- **प्रतिबंध 2:** W3C Trusted Types (0 `innerHTML`) का 100% पालन सुनिश्चित करें।
- **प्रतिबंध 3:** कोई भी बिज़नेस लॉजिक या स्टोरेज स्कीमा न बदलें।

---

## 📦 6. देय सामग्री सूची (Deliverables Manifest)

1. अद्यतन [`dashboard/styles/wellbeing_blacklist.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css)
2. अद्यतन [`dashboard/styles/components.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/components.css)
3. अद्यतन [`dashboard/styles/tracking.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/tracking.css)
4. अद्यतन [`dashboard/styles/layout.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout.css)

---

## 🧪 7. स्थानीय सत्यापन गेट (Local Verification Gate)

```bash
# 1. Run actual UI/UX verification test
node tests/test_dashboard_future_uiux_actual_verification.js

# 2. Run light mode & WCAG contrast test
node tests/test_light_mode_contrast_and_wcag.js

# 3. Verify all 44 test suites pass cleanly
node run_all_tests.js
```
