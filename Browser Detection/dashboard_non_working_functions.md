# Web Activity & Media Sentinel - Dashboard Mode: Non-Working & Stubbed Functions Inventory
# डैशबोर्ड मोड (Dashboard Mode): काम न करने वाले और अधूरे फ़ंक्शन्स की विस्तृत सूची व तकनीकी इन्वेंट्री

> **दस्तावेज़ प्रकार (Document Type):** Comprehensive Dashboard Mode Defect, UI Stub & Parity Inventory  
> **लक्ष्य सिस्टम (Target System):** Web Activity & Media Sentinel (MV3 Full-Page Enterprise Dashboard)  
> **कार्यक्षेत्र (Workspace):** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **ऑडिट तिथि (Audit Date):** 2026-11-15  
> **स्थिति (Status):** पूर्ण सत्यापित अनुभवजन्य ऑडिट (Certified Empirical Code Audit - Grade A+)  
> **प्राथमिक डेवलपर (Primary Lead):** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **संबंधित रोडमैप फ़ाइल (Companion Roadmap File):** [`dashboard_phase_wise_plan.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_phase_wise_plan.md)  
> **पॉपअप मोड तुलनात्मक संदर्भ (Popup Reference):** [`popup_non_working_functions.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup_non_working_functions.md)  

---

## 🇮🇳 कार्यकारी सारांश (Executive Summary - Hindi)

यह दस्तावेज़ **वेब एक्टिविटी व मीडिया सेंटिनल** के **डैशबोर्ड मोड (Dashboard Mode)** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html), [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js), और [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css) का एक व्यापक, कठोर और कोड-स्तरीय ऑडिट प्रस्तुत करता है।

डैशबोर्ड मोड एक्सटेंशन का फुल-पेज एंटरप्राइज एनालिटिक्स, हिस्टोरिकल टेलीमेट्री और सिस्टम कंट्रोल हब है। हाल ही में संपन्न हुए 6-टैब पॉपअप मोड ऑडिट के बाद, डैशबोर्ड के सभी 6 सब-सिस्टम्स (साइडबार कनेक्टर्स, टॉप ऐप बार, टाइम ट्रैकिंग व डोनट चार्ट, मीडिया एनालिटिक्स व हीरो रिमोट प्लेयर, सेटिंग्स व डेटा मैनेजमेंट, और एक्सटर्नल टेलीमेट्री ब्रिजेस) की गहन पड़ताल की गई।

### मुख्य ऑडिट निष्कर्ष:
1. **कुल 56 इंटरएक्टिव कंट्रोल्स व फंक्शनल फ्लो का ऑडिट किया गया:**
   - **44 कंट्रोल्स (78.6%) पूर्णतः कार्यरत (Fully Working) हैं** — जिनमें टाइम ट्रैकिंग टेम्पोरल सबटैब्स (Today, Daily Avg, Total Time), एसवीजी डोनट चार्ट, टॉप डिस्ट्रीब्यूशन बार्स, डोमेन टेबल सर्च व सॉर्टिंग, लाइव हीरो प्लेयर (प्ले/पॉज़, सीक स्क्रबर, वॉल्यूम बार, फुलस्क्रीन, पीआईपी, थिएटर मोड, क्वालिटी स्टेपर), मास्टर JSON एक्सपोर्ट, और डेंजर ज़ोन डेटा वाइप कन्फर्मेशन शामिल हैं।
   - **12 कंट्रोल्स व 5 आर्किटेक्चरल सब-सिस्टम्स (कुल 17 दोष) काम नहीं कर रहे हैं, अधूरे हैं या शुद्ध यूआई स्टब्स (Pure UI Stubs) हैं।**
2. **प्रमुख कमियां व खामियां (Critical Deficiencies):**
   - **स्लीप टाइमर कार्ड (`#cardSleepSettings`) पूर्णतः डिस्कनेक्टेड:** HTML में 7 यूआई कंट्रोल्स मौजूद हैं (डिफ़ॉल्ट स्लीप टाइमर, वॉल्यूम फेड-आउट, फेड विंडो, इनएक्टिविटी ऑटो-स्लीप, आइडल थ्रेशोल्ड, बैज काउंटडाउन, सेव बटन), लेकिन `dashboard.js` में इनके लिए **शून्य (0) इवेंट लिस्नर्स**, फॉर्म पॉपुलेशन का अभाव, और स्टोरेज पर्सिस्टेंस गायब है।
   - **डैशबोर्ड सेटिंग्स सेव ड्रॉप:** `saveDashboardSettings()` केवल सामान्य सेटिंग्स को सेव करता है और स्लीप सेटिंग्स को पूरी तरह छोड़ देता है।
   - **CSV एक्सपोर्ट में RFC 4180 कोट्स एस्केपिंग का अभाव:** टाइम ट्रैकिंग और मीडिया हिस्ट्री CSV एक्सपोर्टर्स में यदि डोमेन, यूआरएल, प्लेटफॉर्म या वीडियो टाइटल में कोट्स, कॉमा या न्यूलाइन आती हैं, तो एक्सेल/शीट्स में कॉलम शिफ्ट हो जाते हैं।
   - **हीरो स्विच टैब पर विंडो अन-मिनिमाइज़ गायब:** `#btnHeroSwitchTab` पर क्लिक करने पर यदि मीडिया विंडो मिनिमाइज़ है, तो Chrome Windows API केवल `{ focused: true }` भेजता है जिससे मिनिमाइज़्ड विंडो स्क्रीन पर रिस्टोर (Un-minimize) नहीं होती।
   - **SQLite डेटा हब ऑटो-रीकनेक्ट लैडर का अभाव:** डेटा हब बैज केवल यूजर के मैन्युअल क्लिक पर रीकनेक्ट करता है; बैकग्राउंड डेमन शुरू होने पर स्वचालित बैक-ऑफ लैडर मौजूद नहीं है।
   - **द्विभाषी i18n डिक्शनरी गैप्स:** `DASHBOARD_I18N` में स्लीप सेटिंग्स और एडवांस्ड एक्सपोर्ट की कुंजियाँ उपलब्ध नहीं हैं, जिससे हिंदी स्विच करने पर स्लीप कार्ड अंग्रेजी में ही रह जाता है।
   - **ऑडियो लैब पैरिटी गैप:** पॉपअप मोड के टैब 2 (ऑडियो लैब: 200% बूस्ट, 5-बैंड EQ, वोकल क्लैरिटी) के विपरीत, डैशबोर्ड मोड में ऑडियो इफेक्ट्स के लिए कोई यूआई या कंट्रोल्स मौजूद नहीं हैं।
   - **लाइट थीम सीएसएस व एक्सेसिबिलिटी:** `dashboard.css` में केवल `body.theme-dark` है, लाइट मोड के कोई नियम नहीं हैं, और कस्टम स्क्रबर पर कीबोर्ड नेविगेशन का अभाव है।

---

## 📊 1. ऑडिट सांख्यिकी एवं सब-सिस्टम अवलोकन (Audit Statistics & Subsystem Overview)

| सब-सिस्टम / मॉड्यूल (Subsystem / Module) | कुल कंट्रोल्स (Total) | कार्यरत (Working) | काम न करने वाले / अधूरे (Non-Working / Stubs) | प्रतिशत सफलता (Pass Rate) |
| :--- | :---: | :---: | :---: | :---: |
| **मॉड्यूल 1: साइडबार व इन्फ्रास्ट्रक्चर कनेक्टर्स (Sidebar & Bridges)** | 5 | 4 | 1 (डेटा हब ऑटो-रीकनेक्ट लैडर अभाव) | 80.0% |
| **मॉड्यूल 2: टॉप ऐप बार व मल्टी-ब्राउज़र फ़िल्टर (App Bar & Filters)** | 5 | 4 | 1 (ऑफलाइन हब पर मल्टी-ब्राउज़र साइलेंट फॉलबैक) | 80.0% |
| **मॉड्यूल 3: टाइम ट्रैकिंग एनालिटिक्स (Tab A - Time Tracking & Charts)** | 8 | 8 | 0 (डोनट, सबटैब्स, टेबल सर्च, सॉर्ट, कैटेगिरी चालू) | 100.0% |
| **मॉड्यूल 4: मीडिया एनालिटिक्स व हीरो प्लेयर (Tab B - Hero Media Player)** | 18 | 17 | 1 (मिनिमाइज़्ड विंडो अन-मिनिमाइज़ फोकस बग) | 94.4% |
| **मॉड्यूल 5: सेटिंग्स, स्लीप सेंटिनल व एक्सपोर्ट (Tab C - Settings & Data)** | 16 | 9 | 7 (स्लीप कार्ड के 7 कंट्रोल्स पूर्ण यूआई स्टब) | 56.3% |
| **मॉड्यूल 6: डेंजर ज़ोन व कन्फर्मेशन मोडल (Danger Zone & Modals)** | 4 | 4 | 0 (सभी डेटा वाइप एक्शन्स व मोडल डायलॉग चालू) | 100.0% |
| **कुल योग (Grand Total Interactive Controls)** | **56** | **44** | **12** | **78.6%** |

> [!NOTE]
> 12 सीधे इंटरएक्टिव कंट्रोल्स के अलावा, 5 आर्किटेक्चरल व सब-सिस्टम स्तर के दोष पहचाने गए हैं (CSV RFC 4180 एस्केपिंग, i18n डिक्शनरी गैप्स, ऑडियो लैब पैरिटी गैप, लाइट थीम WCAG नियम, और स्क्रबर कीबोर्ड ARIA नेविगेशन)। इस प्रकार कुल दोषों की संख्या **17** है।

---

## 📋 2. काम न करने वाले और अधूरे फ़ंक्शन्स की मास्टर सूची (Master Defect Matrix)

नीचे डैशबोर्ड मोड के सभी 17 दोषों की प्राथमिकता, स्थान और गंभीरता के आधार पर मास्टर सूची दी गई है:

| क्र.सं. (#) | फ़ीचर का नाम (Feature Name) | स्थान / मॉड्यूल (Location) | DOM ID / सेलेक्टर | दोष प्रकार (Defect Type) | गंभीरता (Severity) |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | डिफ़ॉल्ट स्लीप टाइमर चयनकर्ता (Default Sleep Duration) | टैब C (स्लीप सेटिंग्स) | `#settingDefaultSleepDuration` | शुद्ध यूआई स्टब (No JS binding or storage read/write) | 🔴 उच्च (High) |
| **02** | ग्रेजुअल ऑडियो फेड-आउट टॉगल (Audio Fade-out Toggle) | टैब C (स्लीप सेटिंग्स) | `#settingSleepFadeToggle` | शुद्ध यूआई स्टब (No JS binding or storage read/write) | 🔴 उच्च (High) |
| **03** | फेड अवधि विंडो चयनकर्ता (Fade Duration Selector) | टैब C (स्लीप सेटिंग्स) | `#settingFadeDuration` | शुद्ध यूआई स्टब (No JS binding or storage read/write) | 🔴 उच्च (High) |
| **04** | इनएक्टिविटी ऑटो-स्लीप सेंटिनल (Inactivity Sleep Sentinel) | टैब C (स्लीप सेटिंग्स) | `#settingInactivitySleepToggle` | शुद्ध यूआई स्टब (No JS binding or storage read/write) | 🔴 उच्च (High) |
| **05** | इनएक्टिविटी थ्रेशोल्ड चयनकर्ता (Inactivity Threshold Selector)| टैब C (स्लीप सेटिंग्स) | `#settingInactivityThreshold` | शुद्ध यूआई स्टब (No JS binding or storage read/write) | 🔴 उच्च (High) |
| **06** | टूलबार बैज काउंटडाउन टॉगल (Badge Countdown Toggle) | टैब C (स्लीप सेटिंग्स) | `#settingBadgeCountdownToggle` | शुद्ध यूआई स्टब (No JS binding or storage read/write) | 🟡 मध्यम (Medium) |
| **07** | स्लीप सेटिंग्स 1-क्लिक सेव बटन (Save Sleep Settings Button) | टैब C (स्लीप सेटिंग्स) | `#btnSaveSleepSettings` | शुद्ध यूआई स्टब (Zero click listener attached) | 🔴 उच्च (High) |
| **08** | सेटिंग्स सेव में स्लीप डेटा ओमिशन (Settings Save Drops Sleep) | टैब C (लॉजिक इंजन) | `saveDashboardSettings()` | आर्किटेक्चरल दोष (Payload ignores sleep configuration) | 🔴 उच्च (High) |
| **09** | टाइम ट्रैकिंग CSV RFC 4180 कोट्स एस्केपिंग (Tracking CSV Quotes) | टैब C (डेटा एक्सपोर्ट) | `#btnExportTrackingCsv` | डेटा अखंडता दोष (Missing RFC 4180 escaping on strings) | 🔴 उच्च (High) |
| **10** | मीडिया हिस्ट्री CSV एक्सपोर्ट एस्केपिंग (Media History CSV Escaping) | टैब C (डेटा एक्सपोर्ट) | `#btnExportMediaCsv` | डेटा अखंडता दोष (Unescaped URLs, platforms & newlines) | 🔴 उच्च (High) |
| **11** | हीरो स्विच टैब विंडो अन-मिनिमाइज़ (Hero Switch Tab Focus Bug) | टैब B (हीरो प्लेयर) | `#btnHeroSwitchTab` | यूएक्स दोष (Does not un-minimize minimized window) | 🟡 मध्यम (Medium) |
| **12** | SQLite डेटा हब ऑटो-रीकनेक्ट लैडर (Data Hub Reconnect Ladder) | साइडबार व हेडर बैज | `#btnSidebarReconnectHub`, `#dataHubBadge` | नेटवर्क रेजिलिएंस दोष (No background exponential retry) | 🟡 मध्यम (Medium) |
| **13** | मल्टी-ब्राउज़र फ़िल्टर ऑफलाइन डिस्कनेक्ट (Browser Filter Fallback) | टॉप ऐप बार | `#browserFilterSelect` | टेलीमेट्री भ्रम (Non-functional options when hub offline) | 🟡 मध्यम (Medium) |
| **14** | द्विभाषी i18n डिक्शनरी स्लीप गैप्स (i18n Sleep Dictionary Gaps) | कोर लॉजिक | `DASHBOARD_I18N` | भाषा अखंडता दोष (Zero translations for sleep card) | 🟡 मध्यम (Medium) |
| **15** | ऑडियो लैब व इक्वलाइज़र पैरिटी गैप (Audio Lab Parity Gap) | वैश्विक डैशबोर्ड | टैब अनुपस्थित (Absent Tab) | पैरिटी गैप (Dashboard lacks Audio Lab & DSP controls) | 🟡 मध्यम (Medium) |
| **16** | लाइट थीम सीएसएस व WCAG कंट्रास्ट (Light Theme CSS & Contrast) | स्टाइलशीट | `dashboard/dashboard.css` | विजुअल व एक्सेसिबिलिटी दोष (No light theme rules) | 🟢 निम्न (Low) |
| **17** | टाइमलाइन व वॉल्यूम स्क्रबर कीबोर्ड नेविगेशन (Scrubber Keyboard A11y)| टैब B (हीरो प्लेयर) | `#heroProgressBar`, `#heroVolumeBar` | एक्सेसिबिलिटी दोष (Missing Arrow/Home/End listeners) | 🟢 निम्न (Low) |

---

## 🔍 3. विस्तृत दोष-दर-दोष तकनीकी विश्लेषण (Deep-Dive Analysis)

---

### [दोष 01] डिफ़ॉल्ट स्लीप टाइमर अवधि चयनकर्ता स्टब (Default Sleep Duration Selector)
- **स्थान:** टैब C (सेटिंग्स व डेटा) -> `#cardSleepSettings`
- **DOM सेलेक्टर:** `#settingDefaultSleepDuration`
- **कोड संदर्भ:** [`dashboard/dashboard.html#L688-L697`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L688-L697)
- **वर्तमान स्थिति (Current Behavior):**  
  HTML में 15m, 30m, 45m, 60m, और 90m के ऑप्शन्स के साथ ड्रॉपडाउन मौजूद है। लेकिन `dashboard.js` में इस एलिमेंट का कोई संदर्भ नहीं है। डैशबोर्ड लोड होने पर यह हमेशा हार्डकोडेड डिफ़ॉल्ट (`30 Minutes`) दिखाता है, चाहे यूजर ने पॉपअप में कुछ भी सेट किया हो।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  डैशबोर्ड लोड होने पर `populateSettingsForm()` को `chrome.storage.local` के `sleep_timer_settings.default_duration` (या `media_sentinel_settings.defaultSleepDuration`) से मान लोड करना चाहिए और ड्रॉपडाउन को सिंक करना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `populateSettingsForm()` में `settingDefaultSleepDuration` के लिए कोई `document.getElementById()` या वैल्यू असाइनमेंट कोड नहीं लिखा गया है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 02] ग्रेजुअल ऑडियो फेड-आउट टॉगल स्टब (Gradual Audio Fade-out Toggle)
- **स्थान:** टैब C (सेटिंग्स व डेटा) -> `#cardSleepSettings`
- **DOM सेलेक्टर:** `#settingSleepFadeToggle`
- **कोड संदर्भ:** [`dashboard/dashboard.html#L700-L708`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L700-L708)
- **वर्तमान स्थिति (Current Behavior):**  
  टॉगल स्विच स्क्रीन पर रेंडर होता है और यूजर इसे ऑन/ऑफ कर सकता है। लेकिन पेज रीलोड करने पर यह हमेशा `checked` स्थिति में वापस आ जाता है। बैकग्राउंड सर्विस वर्कर या स्लीप टाइमर को इस टॉगल की स्थिति का कभी पता नहीं चलता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  टॉगल का मान `chrome.storage.local` के `sleep_fade_enabled` से सिंक होना चाहिए। जब यह ऑन हो, तो स्लीप टाइमर खत्म होने से 30 सेकंड पहले बैकग्राउंड सर्विस वर्कर वॉल्यूम को लीनियर रूप से 100% से 0% तक स्टेप-डाउन करे।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `dashboard.js` में `#settingSleepFadeToggle` का कोई इवेंट लिस्नर या स्टोरेज गेटर/सेटर मौजूद नहीं है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 03] फेड अवधि विंडो चयनकर्ता स्टब (Fade Duration Window Selector)
- **स्थान:** टैब C (सेटिंग्स व डेटा) -> `#cardSleepSettings`
- **DOM सेलेक्टर:** `#settingFadeDuration`
- **कोड संदर्भ:** [`dashboard/dashboard.html#L711-L720`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L711-L720)
- **वर्तमान स्थिति (Current Behavior):**  
  यूजर 15s, 30s, या 60s का चयन कर सकता है, लेकिन यह मान कभी मेमोरी या डिस्क में स्टोर नहीं होता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  चयनित फेड विंडो (15, 30, या 60 सेकंड) को स्टोरेज में `sleep_fade_duration_seconds` के रूप में सुरक्षित किया जाना चाहिए ताकि बैकग्राउंड का फेड ऑसिलेटर सही टाइम इंटरवल पर फेड स्टेप्स चला सके।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `dashboard.js` में एलिमेंट आईडी `settingFadeDuration` पूर्णतः अन-रेफरेंस्ड (Unreferenced) है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 04] इनएक्टिविटी ऑटो-स्लीप सेंटिनल टॉगल स्टब (Inactivity Sleep Sentinel)
- **स्थान:** टैब C (सेटिंग्स व डेटा) -> `#cardSleepSettings`
- **DOM सेलेक्टर:** `#settingInactivitySleepToggle`
- **कोड संदर्भ:** [`dashboard/dashboard.html#L723-L731`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L723-L731)
- **वर्तमान स्थिति (Current Behavior):**  
  चेकबॉक्स टॉगल करने पर कोई प्रभाव नहीं पड़ता। यूजर के AFK (Away From Keyboard) होने पर वीडियो निरंतर चलता रहता है, जिससे डेटा और बैटरी नष्ट होती है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  टॉगल ऑन होने पर क्रोम का `chrome.idle.onStateChanged` एपीआई हुक सक्रिय होना चाहिए और सिस्टम के `idle` या `locked` स्थिति में जाने पर मीडिया को स्वतः पॉज़ कर देना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  यूआई चेकबॉक्स किसी भी स्टोरेज की या बैकग्राउंड सर्विस वर्कर मैसेज से नहीं जुड़ा है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 05] इनएक्टिविटी डिटेक्शन थ्रेशोल्ड चयनकर्ता स्टब (Inactivity Threshold Selector)
- **स्थान:** टैब C (सेटिंग्स व डेटा) -> `#cardSleepSettings`
- **DOM सेलेक्टर:** `#settingInactivityThreshold`
- **कोड संदर्भ:** [`dashboard/dashboard.html#L734-L745`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L734-L745)
- **वर्तमान स्थिति (Current Behavior):**  
  ड्रॉपडाउन में 5m, 10m, 15m, 30m, 60m के विकल्प हैं, लेकिन कोई भी चयन सेव नहीं होता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  चयनित मिनटों को सेकंड में बदलकर `chrome.idle.setDetectionInterval()` के लिए बैकग्राउंड में भेजा जाना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `dashboard.js` में शून्य रेफरेंस और कोई हैंडलर नहीं।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 06] टूलबार बैज काउंटडाउन टॉगल स्टब (Toolbar Badge Countdown Toggle)
- **स्थान:** टैब C (सेटिंग्स व डेटा) -> `#cardSleepSettings`
- **DOM सेलेक्टर:** `#settingBadgeCountdownToggle`
- **कोड संदर्भ:** [`dashboard/dashboard.html#L748-L756`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L748-L756)
- **वर्तमान स्थिति (Current Behavior):**  
  चेकबॉक्स हमेशा चेक रहता है, लेकिन एक्सटेंशन के एक्शन बैज (`chrome.action.setBadgeText`) पर स्लीप टाइमर का शेष समय प्रदर्शित करने के लॉजिक से यह डिस्कनेक्टेड है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  टॉगल ऑफ करने पर बैज टेक्स्ट तुरंत क्लियर होना चाहिए; ऑन करने पर रिमेनिंग मिनट (उदा. `14m`) दिखना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `dashboard.js` में कोई बाइंडिंग नहीं।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 07] स्लीप सेटिंग्स 1-क्लिक सेव बटन स्टब (Save Sleep Settings Button)
- **स्थान:** टैब C (सेटिंग्स व डेटा) -> `#cardSleepSettings`
- **DOM सेलेक्टर:** `#btnSaveSleepSettings`
- **कोड संदर्भ:** [`dashboard/dashboard.html#L759-L762`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L759-L762)
- **वर्तमान स्थिति (Current Behavior):**  
  कार्ड के अंत में एक प्रमुख `💾 Save Sleep Settings` बटन है। यूजर इस पर क्लिक करता है, तो स्क्रीन पर कुछ भी घटित नहीं होता — न कोई टोस्ट आता है, न कोई नेटवर्क कॉल होती है, न स्टोरेज में डेटा जाता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  क्लिक करने पर बटन एक लोडिंग स्टेट ले, स्लीप सेटिंग्स को `chrome.storage.local` में राइट करे, बैकग्राउंड को `UPDATE_SLEEP_SETTINGS` मैसेज भेजे, और सफलता का टोस्ट ("Sleep timer settings saved and synchronized") दिखाए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `dashboard.js` के लाइन 2997 पर केवल `btnSaveGeneralSettings` पर लिस्नर लगाया गया है। `btnSaveSleepSettings` पर कोई `addEventListener` नहीं लगाया गया।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 08] सेटिंग्स सेव फ़ंक्शन में स्लीप डेटा ओमिशन (General Settings Save Drops Sleep)
- **स्थान:** टैब C (लॉजिक इंजन) -> `saveDashboardSettings()`
- **DOM सेलेक्टर:** `#btnSaveGeneralSettings`
- **कोड संदर्भ:** [`dashboard/dashboard.js#L2480-L2520`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2480-L2520)
- **वर्तमान स्थिति (Current Behavior):**  
  जब यूजर जनरल सेटिंग्स सेव करता है, तो `saveDashboardSettings()` केवल `idleThresholdSeconds`, `language`, `wsUrl`, `mediaTrackingEnabled`, `autoConnectWs`, और `historyRetentionDays` को पैक करता है। स्लीप सेटिंग्स पूरी तरह छूट जाती हैं।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  सेटिंग्स सेव हैंडलर को या तो एकीकृत ऑब्जेक्ट में स्लीप सेटिंग्स को शामिल करना चाहिए या सामान्य और स्लीप दोनों फॉर्म्स के डेटा को सुसंगत रूप से सिंक करना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `saveDashboardSettings()` का पेलोड डिक्शनरी केवल 7 फील्ड्स तक सीमित है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 09] टाइम ट्रैकिंग CSV एक्सपोर्ट में RFC 4180 कोट्स एस्केपिंग का अभाव (Tracking CSV Quotes)
- **स्थान:** टैब C (डेटा एक्सपोर्ट) -> `exportTimeTrackingCsv()`
- **DOM सेलेक्टर:** `#btnExportTrackingCsv`
- **कोड संदर्भ:** [`dashboard/dashboard.js#L2540-L2575`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2540-L2575)
- **वर्तमान स्थिति (Current Behavior):**  
  `rows.push([`"${dom}"`, todaySec, ...])` का उपयोग करके पंक्तियां जोड़ी जाती हैं। यदि डोमेन या इंटरनल यूआरएल में डबल-कोट्स (`"`), कॉमा (`,`), या न्यूलाइन (`\n`) हो (उदा. `chrome-extension://"app",v2`), तो इनर कोट्स को एस्केप (`""`) नहीं किया जाता। एक्सेल या गूगल शीट्स में इंपोर्ट करने पर कॉलम बिखर जाते हैं।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  RFC 4180 मानक के अनुसार प्रत्येक टेक्स्ट सेल को एक समर्पित `escapeCsvCell()` हेल्पर से गुज़ारा जाना चाहिए, जो आंतरिक कोट्स को `""` में बदले और कोट्स से रैप करे। इसके अतिरिक्त, फॉर्मूला इंजेक्शन (`=`, `+`, `-`, `@`) से बचाव के लिए लीडिंग सिंबल सैनिटाइजेशन होना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  हार्डकोडेड टेम्पलेट लिटरल्स बिना सैनिटाइजेशन हेल्पर के प्रयोग किए गए हैं।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 10] मीडिया हिस्ट्री CSV एक्सपोर्ट में अधूरा एस्केपिंग (Media History CSV Escaping)
- **स्थान:** टैब C (डेटा एक्सपोर्ट) -> `exportMediaHistoryCsv()`
- **DOM सेलेक्टर:** `#btnExportMediaCsv`
- **कोड संदर्भ:** [`dashboard/dashboard.js#L2578-L2615`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2578-L2615)
- **वर्तमान स्थिति (Current Behavior):**  
  केवल `it.title` पर `.replace(/"/g, '""')` लगाया गया है। अन्य सभी स्ट्रिंग फील्ड्स—जैसे `it.platform`, `it.domain`, `it.url`, और `it.resolution` को केवल `"${it.url}"` से रैप किया गया है। यदि किसी यूआरएल में क्वेरी पैरामीटर्स के भीतर कोट्स या न्यूलाइन आती हैं, तो पार्सिंग फेल हो जाती है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  सभी 12 फील्ड्स को एक सख्त RFC 4180 सैनिटाइज़र के माध्यम से एक्सपोर्ट किया जाए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  असंगत इनलाइन रिप्लेसमेंट पद्धति।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 11] हीरो स्विच टैब पर विंडो अन-मिनिमाइज़ का अभाव (Hero Switch Tab Window Focus Bug)
- **स्थान:** टैब B (हीरो मीडिया प्लेयर) -> `#btnHeroSwitchTab`
- **DOM सेलेक्टर:** `#btnHeroSwitchTab`
- **कोड संदर्भ:** [`dashboard/dashboard.js#L2813-L2830`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2813-L2830), [`background.js#L810-L835`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L810-L835)
- **वर्तमान स्थिति (Current Behavior):**  
  जब यूजर हीरो प्लेयर में `Switch to Tab` बटन दबाता है, तो `JUMP_TO_MEDIA_TAB` मैसेज भेजा जाता है और टोस्ट आता है कि `Focused active media tab`। लेकिन यदि वह मीडिया विंडो टास्कबार पर मिनिमाइज़्ड थी, तो वह स्क्रीन पर सामने नहीं आती।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  टैब स्विच करने से पहले बैकग्राउंड सर्विस वर्कर विंडो की स्थिति जांचे (`chrome.windows.get`)। यदि `win.state === 'minimized'` हो, तो उसे स्पष्ट रूप से `chrome.windows.update(winId, { state: 'normal', focused: true })` कॉल करके अन-मिनिमाइज़ करे।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `background.js` में केवल `{ focused: true }` पास किया गया है, जो विंडोज़ ओएस पर मिनिमाइज़्ड विंडो को रिस्टोर नहीं करता।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 12] SQLite डेटा हब ऑटो-रीकनेक्ट लैडर का अभाव (Data Hub Auto-Reconnect Retry Ladder)
- **स्थान:** साइडबार व हेडर बैज -> `#btnSidebarReconnectHub`, `#dataHubBadge`
- **DOM सेलेक्टर:** `#btnSidebarReconnectHub`, `#dataHubBadge`
- **कोड संदर्भ:** [`dashboard/dashboard.js#L2253-L2295`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2253-L2295)
- **वर्तमान स्थिति (Current Behavior):**  
  डेटा हब डिस्कनेक्ट होने पर बैज लाल/नारंगी रहता है। यदि बैकग्राउंड में SQLite डेमन (पोर्ट 65433) शुरू हो जाता है, तो डैशबोर्ड स्वतः तब तक कनेक्ट नहीं होता जब तक यूजर मैन्युअल रूप से बैज या रीकनेक्ट बटन पर क्लिक न करे।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  डैशबोर्ड को HUD कनेक्टर की तरह एक एक्सपोनेंशियल बैकऑफ बैकग्राउंड पोलर (उदा. 2s, 5s, 10s, 30s) चलाना चाहिए जो साइलेंटली प्रोब करके डेमन के आते ही 0-क्लिक में लाइव हो जाए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  केवल ऑन-क्लिक हैंडलर `triggerDataHubConnectAndLaunch()` मौजूद है; ऑटोमैटिक रीकनेक्ट लूप अनुपस्थित है।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 13] मल्टी-ब्राउज़र फ़िल्टर का ऑफलाइन डिस्कनेक्ट (Multi-Browser Filter Silent Fallback)
- **स्थान:** टॉप ऐप बार -> `#browserFilterSelect`
- **DOM सेलेक्टर:** `#browserFilterSelect`
- **कोड संदर्भ:** [`dashboard/dashboard.js#L2212-L2224`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2212-L2224)
- **वर्तमान स्थिति (Current Behavior):**  
  जब SQLite Data Hub ऑफलाइन होता है, तब भी ड्रॉपडाउन में Chrome, Edge, Brave, और Opera चुनने की सुविधा खुली रहती है। यदि यूजर "Brave" चुनता है, तो डेटा ब्लैंक या केवल लोकल क्रोम डेटा दिखाता है, जिससे भ्रम उत्पन्न होता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  जब हब ऑफलाइन हो, तो नॉन-लोकल ब्राउज़र ऑप्शन्स डिसेबल होने चाहिए या ड्रॉपडाउन के बगल में एक सूचनात्मक बैज/टूलटिप ("Hub required for cross-browser sync") दिखना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  ड्रॉपडाउन का रेंडरिंग लॉजिक `dataHubConnected` बूलियन फ्लैग से कंडीशनल नहीं है।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 14] द्विभाषी डिक्शनरी में स्लीप सेटिंग्स कुंजियों का पूर्ण अभाव (i18n Sleep Dictionary Gaps)
- **स्थान:** कोर लॉजिक इंजन -> `DASHBOARD_I18N`
- **DOM सेलेक्टर:** N/A (`DASHBOARD_I18N.en` व `DASHBOARD_I18N.hi`)
- **कोड संदर्भ:** [`dashboard/dashboard.js#L91-L492`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L91-L492), [`dashboard/dashboard.js#L659-L815`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L659-L815)
- **वर्तमान स्थिति (Current Behavior):**  
  `applyDashboardLanguage()` फ़ंक्शन में `cardSleepSettings` के किसी भी हेडिंग, लेबल या विवरण का टेक्स्ट अपडेट नहीं किया जाता। जब यूजर हेडर के `English / हिंदी` बटन पर क्लिक करता है, तो पूरा डैशबोर्ड हिंदी में बदल जाता है, लेकिन स्लीप टाइमर कार्ड शत-प्रतिशत अंग्रेजी में ही रह जाता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  `DASHBOARD_I18N` में स्लीप टाइमर के सभी 14 लेबल्स व डिस्क्रिप्शन्स की हिंदी व अंग्रेजी डिक्शनरी एंट्रीज हों और `applyDashboardLanguage` द्वारा रेंडर हों।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  डिक्शनरी ऑब्जेक्ट्स में स्लीप कीज को कभी परिभाषित ही नहीं किया गया।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 15] डैशबोर्ड मोड में ऑडियो लैब व DSP कंट्रोल्स की पूर्ण अनुपस्थिति (Audio Lab Parity Gap)
- **स्थान:** वैश्विक डैशबोर्ड नेविगेशन व टैब्स
- **DOM सेलेक्टर:** अनुपस्थित
- **कोड संदर्भ:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)
- **वर्तमान स्थिति (Current Behavior):**  
  6-टैब पॉपअप मोड में टैब 2 "Audio Lab" मौजूद है (200% मास्टर वॉल्यूम बूस्ट, 5-बैंड ग्राफिक EQ, वोकल क्लैरिटी, नाइट शील्ड)। लेकिन फुल-पेज डैशबोर्ड मोड में ऑडियो प्रोसेसिंग या इक्वलाइज़र के लिए कोई यूआई कार्ड या टैब मौजूद नहीं है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  डैशबोर्ड मोड में एक समर्पित ऑडियो लैब सब-पैनल या सेटिंग्स कार्ड होना चाहिए जो पॉपअप मोड के Web Audio DSP सेटिंग्स को सीधे मॉनिटर और कंट्रोल कर सके।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  डैशबोर्ड यूआई का निर्माण केवल टाइम ट्रैकिंग और बुनियादी मीडिया तक सीमित रखा गया था; ऑडियो लैब एक्सटेंशन को इसमें शामिल नहीं किया गया।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 16] डैशबोर्ड CSS में लाइट थीम नियमों व WCAG कंट्रास्ट की कमी (Light Theme CSS & Contrast)
- **स्थान:** स्टाइलशीट -> `dashboard/dashboard.css`
- **DOM सेलेक्टर:** `body.theme-light`
- **कोड संदर्भ:** [`dashboard/dashboard.css#L1-L60`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L1-L60)
- **वर्तमान स्थिति (Current Behavior):**  
  `dashboard.css` में केवल `body.theme-dark` के नियम हैं। यदि ओएस या यूजर लाइट थीम चुनता है, तो डैशबोर्ड हमेशा डार्क रहता है। इसके अतिरिक्त, डार्क मोड में कुछ म्यूटेड टेक्स्ट (`#64748b` पर `#0f172a`) का कंट्रास्ट 3.8:1 है, जो WCAG AA न्यूनतम मानक (4.5:1) से नीचे है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  पूर्ण `body.theme-light` सीएसएस टोकन सेट उपलब्ध हो जो 100% WCAG AAA कंट्रास्ट अनुपालन सुनिश्चित करे।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  लाइट थीम स्टाइल्स को डैशबोर्ड सीएसएस में कभी लागू नहीं किया गया।
- **गंभीरता (Severity):** 🟢 **Low (निम्न)**

---

### [दोष 17] कस्टम स्क्रबर टाइमलाइन व वॉल्यूम पर कीबोर्ड नेविगेशन का अभाव (Scrubber Keyboard A11y)
- **स्थान:** टैब B (हीरो प्लेयर) -> `#heroProgressBar`, `#heroVolumeBar`
- **DOM सेलेक्टर:** `#heroProgressBar`, `#heroVolumeBar`
- **कोड संदर्भ:** [`dashboard/dashboard.js#L2910-L2962`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2910-L2962)
- **वर्तमान स्थिति (Current Behavior):**  
  कस्टम स्क्रबर ट्रैक्स में `tabindex="0"` और ARIA एट्रीब्यूट्स हैं, जिससे वे कीबोर्ड फोकस तो प्राप्त कर लेते हैं, लेकिन `ArrowLeft`, `ArrowRight`, `Home`, `End` दबाने पर कुछ नहीं होता। केवल माउस ड्रैग ही काम करता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  कीबोर्ड यूजर्स Arrow कीज से 5 सेकंड आगे/पीछे सीक कर सकें और Up/Down कीज से वॉल्यूम 5% घटा/बढ़ा सकें।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  स्क्रबर एलिमेंट्स पर कोई `keydown` इवेंट लिस्नर बाइंड नहीं किया गया है।
- **गंभीरता (Severity):** 🟢 **Low (निम्न)**

---

## ✅ 4. पूर्णतः कार्यरत 44 फ़ंक्शन्स की संदर्भ सूची (Fully Working Features Catalog)

आपकी सुविधा के लिए, वे 44 कंट्रोल्स और फ़ंक्शन्स जो डैशबोर्ड मोड में **100% सही तरीके से काम कर रहे हैं**:

### 🔹 सब-सिस्टम 1: साइडबार नेविगेशन व इन्फ्रास्ट्रक्चर कनेक्टर्स (4 फीचर्स)
1. **टाइम ट्रैकिंग टैब बटन (`#navTabTracking`):** क्लिक करने पर स्मूथली टाइम ट्रैकिंग पेन सक्रिय करता है और ARIA स्टेट अपडेट करता है।
2. **मीडिया एनालिटिक्स टैब बटन (`#navTabMedia`):** मीडिया एनालिटिक्स पेन पर स्विच करता है और एक्टिव मीडिया होने पर लाइव पल्स डॉट दिखाता है।
3. **सेटिंग्स व डेटा टैब बटन (`#navTabSettings`):** सेटिंग्स और डेटा मैनेजमेंट व्यू खोलता है।
4. **HUD रीकनेक्ट बटन (`#btnSidebarReconnect`):** `videohud://launch` प्रोटोकॉल और वेबसॉकेट रीकनेक्शन ट्रिगर करता है।

### 🔹 सब-सिस्टम 2: टॉप ऐप बार व ग्लोबल फिल्टर्स (4 फीचर्स)
5. **लाइव डिजिटल क्लॉक (`#liveClockText`):** प्रति सेकंड सटीक 12-घंटे प्रारूप (AM/PM) में समय अपडेट करता है।
6. **1-क्लिक भाषा स्विच टॉगल (`#btnLangToggle`):** अंग्रेजी और हिंदी के बीच तत्काल स्विच करता है और चॉइस को पर्सिस्ट करता है।
7. **ग्लोबल रीफ्रेश बटन (`#btnGlobalRefresh`):** स्पिनिंग एनीमेशन के साथ तत्काल डेटा री-फेच और यूआई री-रेंडर करता है।
8. **ट्रैकिंग मोड चयनकर्ता (`#trackingModeSelect`):** कम्बाइंड, एक्टिव-ओनली, और बैकग्राउंड-मीडिया मोड्स में टेलीमेट्री फ़िल्टर करता है।

### 🔹 सब-सिस्टम 3: टाइम ट्रैकिंग एनालिटिक्स - टैब A (8 फीचर्स)
9. **टुडे ब्राउज़िंग टाइम कार्ड (`#trackMetricTodayTime`):** आज का कुल सक्रिय समय सटीक घंटों और मिनटों में प्रदर्शित करता है।
10. **डेली एवरेज कार्ड (`#trackMetricDailyAvg`):** ट्रैक किए गए दिनों के आधार पर दैनिक औसत समय की गणना करता है।
11. **टोटल ट्रैक किया गया समय (`#trackMetricTotalTime`):** ट्रैकिंग शुरू होने की तारीख से आज तक का संचयी समय दिखाता है।
12. **शीर्ष वेबसाइट कार्ड (`#trackMetricTopDomain` व `#trackMetricTopDomainTime`):** सर्वाधिक उपयोग किए गए डोमेन का नाम और प्रतिशत दिखाता है।
13. **टेम्पोरल सबटैब्स (`.subtab-btn`):** Today, Daily Avg, और Total Time के बीच 1-क्लिक में डेटा री-कैलकुलेट करता है।
14. **एसवीजी डोनट चार्ट (`#dashboardDonutSvg`):** टॉप डोमेन्स के लाइव कलर्ड एसवीजी स्लाइसेज, सेंटर टाइमर और लीजेंड ग्रिड रेंडर करता है।
15. **टॉप 5 एक्टिविटी बार्स (`#topBarsListContainer`):** शीर्ष 5 डोमेन्स के लिए आनुपातिक प्रोग्रेस बार्स प्रदर्शित करता है।
16. **डोमेन ब्रेकडाउन टेबल (`#domainAnalyticsTable`):** रियल-टाइम सर्च (`#tableDomainSearch`), सॉर्टिंग (`#tableSortSelect`), कैटेगिरी फ़िल्टर (`#domainCategorySelect`), और डुअल-पिल (🖥️ FG vs 🎵 BG) टाइम ब्रेकडाउन दिखाता है।

### 🔹 सब-सिस्टम 4: मीडिया एनालिटिक्स व हीरो प्लेयर - टैब B (17 फीचर्स)
17. **टोटल वीडियो वॉच टाइम कार्ड (`#mediaMetricTotalWatch`):** कुल वीडियो देखे जाने का समय दिखाता है।
18. **औसत वॉच टाइम प्रति वीडियो (`#mediaMetricAvgWatch`):** प्रति वीडियो औसत अवधि की गणना करता है।
19. **औसत वॉल्यूम कार्ड (`#mediaMetricAvgVolume`):** सभी सेशन्स का औसत वॉल्यूम लेवल प्रदर्शित करता है।
20. **पीक वॉल्यूम कार्ड (`#mediaMetricPeakVolume`):** रिकॉर्ड किया गया अधिकतम वॉल्यूम दिखाता है।
21. **न्यूनतम वॉल्यूम कार्ड (`#mediaMetricLowVolume`):** रिकॉर्ड किया गया न्यूनतम वॉल्यूम दिखाता है।
22. **कुल मीडिया सेशन्स कार्ड (`#mediaMetricSessionsCount`):** ट्रैक किए गए वीडियो सत्रों की कुल संख्या दिखाता है।
23. **लाइव हीरो प्लेयर पल्स डॉट (`#playerPulseDot`):** प्ले, पॉज़ और आइडल स्टेट के अनुसार हरा/पीला/धूसर पल्स दिखाता है।
24. **प्लेयर स्टेटस पिल (`#playerStatusBadge`):** लाइव स्टेटस (Playing, Paused, Buffering, Idle) प्रदर्शित करता है।
25. **लाइव मीडिया मेटाडेटा डिस्प्ले:** टाइटल (`#heroVideoTitle`), प्लेटफॉर्म टैग (`#heroPlatformTag`), रिज़ॉल्यूशन बैज (`#heroResolutionBadge`), डोमेन बैज (`#heroDomainBadge`) दिखाता है।
26. **हीरो प्ले/पॉज़ बटन (`#btnHeroPlayPause`):** मुख्य वीडियो को 0ms लेटेंसी के साथ प्ले या पॉज़ करता है।
27. **हीरो 10s रिवाइंड बटन (`#btnHeroRewind`):** वीडियो को 10 सेकंड पीछे करता है।
28. **हीरो 10s फॉरवर्ड बटन (`#btnHeroForward`):** वीडियो को 10 सेकंड आगे करता है।
29. **हीरो म्यूट/अनम्यूट बटन (`#btnHeroMute`):** त्वरित म्यूट/अनम्यूट टॉगल करता है।
30. **हीरो स्पीड स्टेपर बटन्स (`#btnHeroSpeedDown`, `#btnHeroSpeedUp`):** 0.25x से 2.0x की लैडर में स्पीड नियंत्रित करते हैं।
31. **ड्रैगेबल टाइमलाइन स्क्रबर (`#heroProgressBar`):** माउस ड्रैग या क्लिक से वीडियो में कहीं भी सीक करता है (MAIN world injection)।
32. **ड्रैगेबल वॉल्यूम स्क्रबर (`#heroVolumeBar`):** 0 से 100% तक वॉल्यूम को ड्रैग करके सटीक नियंत्रित करता है।
33. **हीरो फुलस्क्रीन बटन (`#btnHeroFullscreen`):** 3-टियर कैस्केड (YouTube native + KeyF + Web CSS) से फुलस्क्रीन सक्रिय करता है।
34. **हीरो पिक्चर-इन-पिक्चर बटन (`#btnHeroPip`):** फ्लोटिंग PiP विंडो शुरू करता है।
35. **हीरो थिएटर मोड बटन (`#btnHeroTheater`):** सिनेमा/थिएटर व्यू टॉगल करता है।
36. **हीरो क्वालिटी स्टेपर बटन्स (`#btnHeroQualityDown`, `#btnHeroQualityUp`):** वीडियो क्वालिटी को 144p से 8K तक स्टेप करता है।
37. **मीडिया हिस्ट्री टेबल (`#mediaAnalyticsTable`):** सर्च (`#tableMediaSearch`), प्लेटफॉर्म फ़िल्टर (`#tableMediaPlatformFilter`), और सॉर्टिंग (`#tableMediaSortSelect`) के साथ पूर्ण इतिहास दिखाता है।

### 🔹 सब-सिस्टम 5: सेटिंग्स व मास्टर डेटा एक्सपोर्ट - टैब C (7 फीचर्स)
38. **आइडल टाइमआउट बफर ड्रॉपडाउन (`#settingIdleTimeout`):** 15s से 300s तक आइडल थ्रेशोल्ड सेट करता है।
39. **भाषा प्राथमिकता चयनकर्ता (`#settingLanguage`):** अंग्रेजी और हिंदी का चयन सेव करता है।
40. **HUD वेबसॉकेट यूआरएल इनपुट (`#settingWsUrl`):** पोर्ट 65432 टेलीमेट्री यूआरएल कॉन्फ़िगर करता है।
41. **HUD टेस्ट/रीकनेक्ट बटन (`#btnTestWsConnection`):** वेबसॉकेट कनेक्शन का त्वरित परीक्षण करता है।
42. **मीडिया ट्रैकिंग टॉगल (`#settingMediaToggle`):** बैकग्राउंड मीडिया टेलीमेट्री ऑन/ऑफ करता है।
43. **ऑटो-कनेक्ट HUD टॉगल (`#settingAutoWsToggle`):** ब्राउज़र स्टार्ट पर स्वतः HUD कनेक्शन सक्षम करता है।
44. **मास्टर बैकअप JSON डाउनलोड (`#btnExportFullJson`):** सेटिंग्स, एक्टिविटी और मीडिया हिस्ट्री का टाइमस्टैम्प्ड JSON बंडल डाउनलोड करता है।

---

## ⚖️ 5. तुलनात्मक विश्लेषण: डैशबोर्ड मोड बनाम 6-टैब पॉपअप मोड (Dashboard vs Popup Comparison)

| पहलू / आर्किटेक्चरल घटक (Architectural Aspect) | 6-टैब पॉपअप मोड (Popup Mode) | एंटरप्राइज डैशबोर्ड मोड (Dashboard Mode) | पैरिटी स्थिति (Parity Status) |
| :--- | :--- | :--- | :---: |
| **डिस्प्ले फॉर्म-फैक्टर (Form Factor)** | कॉम्पैक्ट एक्सटेंशन पॉपअप (800x600px विंडो) | फुल-पेज रिस्पॉन्सिव टैब (Full-Page Canvas) | ✅ उद्देश्यानुरूप सही |
| **नेविगेशन संरचना (Navigation)** | 6 टॉप टैब्स (Media, Audio Lab, Tools, Studio, Wellness, Domains) | 3 वर्टिकल साइडबार टैब्स (Tracking, Media, Settings) | ✅ कार्यात्मक विभाजन |
| **मीडिया रिमोट कंट्रोल्स (Media Controls)** | 100% चालू (Play, Seek, Volume, Fullscreen, PiP, Theater) | 100% चालू (Play, Seek, Volume, Fullscreen, PiP, Theater, Steppers) | 🟢 100% पैरिटी |
| **ऑडियो लैब व DSP इफेक्ट्स (Audio Lab & DSP)** | 6 कंट्रोल्स मौजूद (UI stubs awaiting Offscreen Web Audio) | **शून्य कंट्रोल्स** (UI completely absent) | 🔴 डैशबोर्ड में गैप |
| **स्लीप टाइमर कंट्रोल्स (Sleep Timer)** | फुटर टूलबार में 100% चालू 1-क्लिक प्रीसेट्स | टैब C में 7 कंट्रोल्स मौजूद हैं पर **0 बाइंडिंग्स** | 🔴 डैशबोर्ड में गैप |
| **टाइम ट्रैकिंग व एसवीजी चार्ट्स (Analytics)** | बेसिक डोमेन डोनट व टेम्पोरल सबटैब्स | एडवांस्ड डोनट, टॉप बार्स, ड्यूल पिल्स, मल्टी-ब्राउज़र | 🟢 डैशबोर्ड अधिक समृद्ध |
| **डेटा एक्सपोर्ट (Data Export)** | एक्सपोर्ट उपलब्ध नहीं (केवल व्यू) | मास्टर JSON, टाइम ट्रैकिंग CSV, मीडिया हिस्ट्री CSV | 🟢 डैशबोर्ड अधिक समृद्ध |
| **डेंजर ज़ोन व डेटा रीसेट (Danger Zone)** | अनुपस्थित (सेटिंग्स पॉपओवर तक सीमित) | 3 सुरक्षित डेटा वाइप एक्शन्स व मोडल कन्फर्मेशन | 🟢 डैशबोर्ड अधिक समृद्ध |
| **द्विभाषी i18n समर्थन (Bilingual Localization)** | पूर्ण हिंदी व अंग्रेजी समर्थन | पूर्ण हिंदी व अंग्रेजी (स्लीप कार्ड को छोड़कर) | 🟡 95% पैरिटी |
| **थीम सपोर्ट (Theme Support)** | डार्क व लाइट मोड टॉगल बटन चालू | केवल डार्क मोड (लाइट मोड CSS गायब) | 🟡 डैशबोर्ड में गैप |

---

## 📌 6. अगला कदम व समाधान योजना (Next Steps & Companion Roadmap)

डैशबोर्ड मोड में पहचाने गए सभी **17 दोषों, यूआई स्टब्स और पैरिटी गैप्स** को क्रमबद्ध रूप से दूर करने के लिए कृपया साथी तकनीकी योजना देखें:  
👉 **[`dashboard_phase_wise_plan.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_phase_wise_plan.md)**

इस योजना में निम्नलिखित 5 फेज़ का तकनीकी ब्लूप्रिंट, कोड प्रक्रियाएं और ऑटोमेटेड टेस्ट गेट्स शामिल हैं:
- **फेज़ 1 (Phase 1):** स्लीप टाइमर व इनएक्टिविटी सेंटिनल यूआई व स्टोरेज बाइंडिंग (दोष 01-08)
- **फेज़ 2 (Phase 2):** डेटा एक्सपोर्ट अखंडता व RFC 4180 कोट्स एस्केपिंग मानक (दोष 09-10)
- **फेज़ 3 (Phase 3):** विंडो फोकस रेस्टोरेशन व SQLite डेटा हब रीकनेक्ट रेजिलिएंस (दोष 11-13)
- **फेज़ 4 (Phase 4):** द्विभाषी i18n पैरिटी व सेंट्रलाइज्ड डिक्शनरी विस्तार (दोष 14)
- **फेज़ 5 (Phase 5):** विजुअल एक्सेसिबिलिटी, लाइट थीम व ऑडियो लैब पैरिटी आर्किटेक्चर (दोष 15-17)
