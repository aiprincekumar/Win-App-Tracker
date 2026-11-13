# Web Activity & Media Sentinel - Popup Mode: Non-Working & Stubbed Functions Inventory
# पॉपअप मोड (Popup Mode): काम न करने वाले और अधूरे फ़ंक्शन्स की विस्तृत सूची व तकनीकी इन्वेंट्री

> **दस्तावेज़ प्रकार (Document Type):** Comprehensive Popup Mode Defect & UI Stub Inventory  
> **लक्ष्य सिस्टम (Target System):** Web Activity & Media Sentinel (MV3 Browser Extension)  
> **कार्यक्षेत्र (Workspace):** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **ऑडिट तिथि (Audit Date):** 2026-11-14  
> **स्थिति (Status):** पूर्ण सत्यापित ऑडिट (Certified Empirical Audit)  
> **संबंधित रोडमैप फ़ाइल (Companion Roadmap File):** [`popup_phase_wise_plan.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup_phase_wise_plan.md)  

---

## 🇮🇳 कार्यकारी सारांश (Executive Summary - Hindi)

यह फ़ाइल पॉपअप मोड (Popup Mode) में उन सभी फ़ंक्शन्स और फीचर्स की विस्तृत सूची है जो वर्तमान में **काम नहीं कर रहे हैं (Non-Working)**, **अधूरे हैं (Partially Working / Deficient)**, या केवल **यूआई डमी / स्टब्स (Pure UI Stubs)** के रूप में मौजूद हैं।

### मुख्य बिंदु:
1. **कुल 48 इंटरएक्टिव फ़ंक्शन्स का ऑडिट किया गया**, जिनमें से:
   - **31 फ़ंक्शन्स (64.6%) पूरी तरह से काम कर रहे हैं** (जैसे मुख्य मीडिया प्ले/पॉज़, टाइमलाइन सीक, वॉल्यूम स्लाइडर, फुलस्क्रीन, पिक्चर-इन-पिक्चर, सिनेमा डिमर, स्लीप टाइमर, डार्क/लाइट थीम टॉगल, आदि)।
   - **17 फ़ंक्शन्स (35.4%) में कमियां पाई गईं** (या तो वे केवल यूआई में मान सेव करते हैं लेकिन बैकग्राउंड/कंटेंट में उनका कोई कोड नहीं है, या वे आंशिक रूप से टूटे हुए हैं)।
2. **प्रमुख कमियां:**
   - **ऑडियो लैब (Audio Lab):** मास्टर वॉल्यूम बूस्ट (200%), 5-बैंड ग्राफिक इक्वलाइज़र, वोकल क्लैरिटी, और नाइट शील्ड केवल लोकल स्टोरेज में डेटा लिखते हैं; किसी भी ऑडियो नोड या वेब ऑडियो पाइपलाइन से नहीं जुड़े हैं।
   - **स्मार्ट ऑटोमेशन (Smart Automations):** नए टैब पर ऑटो-पॉज़ और ऑटो-ऐड साइलेंसर का बैकग्राउंड या कंटेंट स्क्रिप्ट में कोई लिस्नर/ऑब्जर्वर नहीं है।
   - **डिजिटल वेलनेस (Doomscroll Breaker):** डूमस्क्रॉल इंटरवल चुनने पर बैकग्राउंड अलार्म या नोटिफिकेशन ट्रिगर नहीं होता।
   - **क्विक सेटिंग्स (Quick Settings):** डिफ़ॉल्ट टैब का चयन पॉपअप खुलने पर लागू नहीं होता, ऑटो-सिंक इंटरवल हार्डकोडेड है, और हाई कंट्रास्ट का कोई CSS नियम मौजूद नहीं है।

---

## 📊 1. ऑडिट सांख्यिकी एवं अवलोकन (Audit Statistics & Overview)

| श्रेणी (Category) | कुल फ़ंक्शन (Total) | कार्यरत (Working) | काम न करने वाले / अधूरे (Non-Working / Stubs) | प्रतिशत सफलता (Pass Rate) |
| :--- | :---: | :---: | :---: | :---: |
| **हेडर बैज व थीम्स (Header & Themes)** | 5 | 4 | 1 (डेटा हब ऑफलाइन ऑटो-लॉन्चर सीमा) | 80% |
| **टैब 1: मीडिया कंट्रोल्स (Media Controls)** | 16 | 16 | 0 (सभी मीडिया ऑपरेशन्स चालू) | 100% |
| **टैब 2: ऑडियो लैब (Audio Lab)** | 6 | 0 | 6 (पूर्ण रूप से यूआई स्टब / नो ऑडियो नोड) | 0% |
| **टैब 3: टूल्स व ऑटोमेशन (Tools & Automations)** | 8 | 4 | 4 (ऐड साइलेंसर, ऑटो-पॉज़, डोमेन स्पीड, स्क्रीनशॉट टार्गेटिंग) | 50% |
| **टैब 4: स्टूडियो वॉल्ट (Studio / Vault)** | 3 | 2 | 1 (क्लोज़्ड टैब पर रीज़्यूम प्लेबैक फेल) | 66.7% |
| **टैब 5: ट्रैकिंग व वेलनेस (Tracking & Wellness)** | 3 | 2 | 1 (डूमस्क्रॉल अलार्म व नोटिफिकेशन अनुपस्थित) | 66.7% |
| **टैब 6: डोमेन ब्रेकडाउन (Domains Breakdown)** | 3 | 3 | 0 (सभी फ़िल्टर व विश्लेषण चालू) | 100% |
| **फुटर टूलबार एक्शन्स (Footer Toolbar)** | 7 | 7 | 0 (स्लीप टाइमर, ट्रैकिंग पॉज़, HUD लॉन्च चालू) | 100% |
| **क्विक सेटिंग्स पॉपओवर (Quick Settings Popover)** | 4 | 0 | 4 (डिफ़ॉल्ट टैब, सिंक इंटरवल, साउंड, हाई कंट्रास्ट CSS) | 0% |
| **कुल योग (Grand Total)** | **48** | **31** | **17** | **64.6%** |

---

## 📋 2. काम न करने वाले और अधूरे फ़ंक्शन्स की मास्टर सूची (Master Defect Matrix)

नीचे उन सभी 17 फ़ंक्शन्स का संक्षिप्त विवरण दिया गया है जो काम नहीं कर रहे हैं:

| क्र.सं. (#) | फ़ीचर का नाम (Feature Name) | स्थान / टैब (Tab / Location) | DOM ID / सेलेक्टर | दोष प्रकार (Defect Type) | गंभीरता (Severity) |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | मास्टर ऑडियो बूस्ट 0-200% (Master Volume Boost) | टैब 2 (ऑडियो लैब) | `#audioMasterBoostSlider` | शुद्ध यूआई स्टब (No Web Audio GainNode) | उच्च (High) |
| **02** | ऑडियो-ओनली बैटरी सेवर (Audio-Only Mode) | टैब 2 (ऑडियो लैब) | `#toggleAudioOnlyMode` | शुद्ध यूआई स्टब (No Video Blanking IPC) | मध्यम (Medium) |
| **03** | 5-बैंड ग्राफिक इक्वलाइज़र (5-Band Graphic EQ) | टैब 2 (ऑडियो लैब) | `#eqBand60`..`#eqBand16000` | शुद्ध यूआई स्टब (No BiquadFilterNodes) | उच्च (High) |
| **04** | इक्वलाइज़र प्रीसेट्स (EQ Preset Dropdown) | टैब 2 (ऑडियो लैब) | `#audioEqPresetSelect` | यूआई-ओनली प्रीसेट (Audio filter missing) | मध्यम (Medium) |
| **05** | वोकल क्लैरिटी एन्हांसमेंट (Vocal Clarity) | टैब 3 (टूल्स) | `#toggleVocalClarity` | शुद्ध यूआई स्टब (No Speech Bandpass Filter) | मध्यम (Medium) |
| **06** | नाइट लिसनिंग शील्ड (Night Listening Shield) | टैब 3 (टूल्स) | `#toggleNightShield` | शुद्ध यूआई स्टब (No Audio DynamicsCompressor) | मध्यम (Medium) |
| **07** | नए टैब पर ऑटो-पॉज़ (Auto-Pause on New Tab) | टैब 3 (ऑटोमेशन) | `#toggleAutoPauseNewTab` | बैकग्राउंड इवेंट हुक अनुपस्थित (No tab listener) | उच्च (High) |
| **08** | ऑटो ऐड साइलेंसर (Auto Ad Silencer) | टैब 3 (ऑटोमेशन) | `#toggleAutoAdSilencer` | कंटेंट स्क्रिप्ट में म्यूटेशन ऑब्जर्वर अनुपस्थित | उच्च (High) |
| **09** | डोमेन स्पीड मेमोरी (Domain Speed Memory) | टैब 3 (ऑटोमेशन) | `#toggleDomainSpeedMemory` | कंटेंट स्क्रिप्ट लोड पर स्पीड रिस्टोर नहीं होती | मध्यम (Medium) |
| **10** | वीडियो स्क्रीनशॉट टार्गेटिंग (Screenshot Capture) | टैब 3 (टूल्स) | `#btnCardScreenshot` | आर्किटेक्चरल दोष (Captures window, not video) | उच्च (High) |
| **11** | बंद टैब पर मीडिया रीज़्यूम (Resume Last Media) | टैब 4 (स्टूडियो) | `#btnStudioResumePlayback` | सेशन रिवाइवल फेल (No tab revival when closed) | मध्यम (Medium) |
| **12** | डूमस्क्रॉल ब्रेकर अलार्म (Doomscroll Breaker) | टैब 5 (वेलनेस) | `#toggleDoomscrollBreaker` | बैकग्राउंड क्रोम अलार्म व नोटिफिकेशन गायब | उच्च (High) |
| **13** | डिफ़ॉल्ट सक्रिय टैब चयन (Default Active Tab) | क्विक सेटिंग्स | `#selectDefaultTab` | अधूरा इंप्लीमेंटेशन (`switchTopTab` not invoked) | मध्यम (Medium) |
| **14** | ऑटो-सिंक इंटरवल ड्रॉपडाउन (Auto-Sync Interval) | क्विक सेटिंग्स | `#selectSyncInterval` | डिस्कनेक्टेड लॉजिक (Hardcoded `setInterval` 1000ms) | मध्यम (Medium) |
| **15** | नोटिफिकेशन साउंड चाइम (Notification Sound) | क्विक सेटिंग्स | `#toggleNotificationSound` | ऑडियो चाइम / बीप सिंथेसाइज़र अनुपस्थित | निम्न (Low) |
| **16** | हाई कंट्रास्ट मोड सीएसएस (High Contrast Mode) | क्विक सेटिंग्स | `#toggleHighContrast` | विजुअल स्टब (Zero CSS rules in `popup.css`) | मध्यम (Medium) |
| **17** | SQLite डेटा हब वन-क्लिक लॉन्चर (Hub Launcher) | हेडर बैज | `#hubStatusBadge` | ऑफलाइन रिकवरी में ऑटो-डेमन स्टार्टर का अभाव | निम्न (Low) |

---

## 🔍 3. विस्तृत फ़ीचर-दर-फ़ीचर विश्लेषण (Deep-Dive Analysis)

---

### [दोष 01] मास्टर वॉल्यूम बूस्ट (Master Volume Boost 0% - 200%)
- **स्थान:** टैब 2 (ऑडियो लैब) -> `#cardAudioLab`
- **DOM सेलेक्टर:** `#audioMasterBoostSlider`, `#audioBoostPercentText`
- **कोड संदर्भ:** [`popup/popup.html#L229`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L229), [`popup/popup.js#L2423-L2437`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2423-L2437)
- **वर्तमान स्थिति (Current Behavior):**  
  स्लाइडर को 0% से 200% तक घुमाने पर केवल स्क्रीन पर प्रतिशत (`150%`) बदलता है और `audio_lab_settings.master_boost` का मान `chrome.storage.local` में सेव होता है। बैकग्राउंड या एक्टिव वीडियो टैब में वीडियो की वास्तविक आवाज़ में रत्ती भर भी बदलाव नहीं होता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  HTML5 वीडियो की मानक आवाज़ 100% पर सीमित होती है। 101% से 200% तक बढ़ाने पर Web Audio API `AudioContext` और `GainNode` का उपयोग करके साउंड को सुरक्षित रूप से बिना डिस्टॉर्शन के 2 गुना तक प्रवर्धित (amplify) किया जाना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  HTML5 `<video>.volume` केवल `0.0` से `1.0` तक की वैल्यू स्वीकार करता है। `1.5` सेट करने पर ब्राउज़र एरर देता है। `content_media.js` या MV3 Offscreen डॉक्यूमेंट में कोई Web Audio Pipeline नहीं जोड़ी गई है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 02] ऑडियो-ओनली बैटरी सेवर (Audio-Only Mode)
- **स्थान:** टैब 2 (ऑडियो लैब) -> `#cardAudioLab`
- **DOM सेलेक्टर:** `#toggleAudioOnlyMode`
- **कोड संदर्भ:** [`popup/popup.html#L248`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L248), [`popup/popup.js#L2439-L2446`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2439-L2446)
- **वर्तमान स्थिति (Current Behavior):**  
  चेकबॉक्स टॉगल करने पर टोस्ट मैसेज आ जाता है कि `Audio-only battery saver on`, लेकिन वीडियो लगातार स्क्रीन पर रेंडर होता रहता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  जब यह टॉगल ऑन हो, तो एक्टिव मीडिया टैब में वीडियो का विजुअल डिकोडिंग और रेंडरिंग डिसेबल/ब्लैंक (`video.style.opacity = '0'` या कैनवस ब्लैंकिंग) हो जाना चाहिए ताकि लैपटॉप की बैटरी और GPU यूसेज 40% तक बच सके, जबकि बैकग्राउंड में ऑडियो सामान्य रूप से चलता रहे।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  पॉपअप से `content_media.js` को वीडियो हाइड करने के लिए कोई IPC मैसेज या DOM इंजेक्शन नहीं भेजा जाता।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 03] 5-बैंड ग्राफिक इक्वलाइज़र (5-Band Graphic Equalizer)
- **स्थान:** टैब 2 (ऑडियो लैब) -> `#audioEqCard`
- **DOM सेलेक्टर:** `#eqBand60`, `#eqBand250`, `#eqBand1000`, `#eqBand4000`, `#eqBand16000`
- **कोड संदर्भ:** [`popup/popup.html#L271-L295`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L271-L295), [`popup/popup.js#L2471-L2487`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2471-L2487)
- **वर्तमान स्थिति (Current Behavior):**  
  पाँचों फ्रीक्वेंसी स्लाइडर (-12dB से +12dB) ऊपर-नीचे होते हैं और मान `audio_lab_settings.eq_bands` में सेव होता है, लेकिन यूट्यूब या किसी भी मीडिया की ऑडियो फ्रीक्वेंसी में कोई अंतर नहीं पड़ता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  सब-बास (60Hz), बास (250Hz), मिड-रेंज (1kHz), प्रेजेंस (4kHz), और ब्रिलियंस (16kHz) के अनुसार Web Audio API के 5 `BiquadFilterNode` (lowshelf, peaking, highshelf) में रियल-टाइम गेन अप्लाई होना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  ब्राउज़र में ऑडियो स्ट्रीम को कैप्चर करके फ़िल्टर चेन से पास करने वाला कोई कोड मौजूद नहीं है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 04] इक्वलाइज़र प्रीसेट्स (EQ Presets Dropdown)
- **स्थान:** टैब 2 (ऑडियो लैब) -> `#audioEqCard`
- **DOM सेलेक्टर:** `#audioEqPresetSelect`
- **कोड संदर्भ:** [`popup/popup.html#L258`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L258), [`popup/popup.js#L2448-L2469`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2448-L2469)
- **वर्तमान स्थिति (Current Behavior):**  
  ड्रॉपडाउन से 'Bass Boost', 'Vocal Focus', 'Electronic', 'Acoustic' चुनने पर स्लाइडर्स की पोजीशन यूआई में बदल जाती है, लेकिन आवाज़ में कोई अंतर नहीं आता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  प्रीसेट सेलेक्ट करते ही संबंधित कर्व ऑडियो फ़िल्टर चेन में लागू होना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  दोष 03 की तरह ही, वास्तविक इक्वलाइज़र फ़िल्टर इंजन अनुपस्थित है।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 05] वोकल क्लैरिटी एन्हांसमेंट (Vocal Clarity Mode)
- **स्थान:** टैब 3 (टूल्स व ऑटोमेशन) -> `#cardSoundEnhancements`
- **DOM सेलेक्टर:** `#toggleVocalClarity`
- **कोड संदर्भ:** [`popup/popup.html#L343`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L343), [`popup/popup.js#L2489-L2495`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2489-L2495)
- **वर्तमान स्थिति (Current Behavior):**  
  टॉगल ऑन/ऑफ होता है और `vocal_clarity: true` स्टोरेज में चला जाता है। डायलॉग या वोकल्स पर कोई प्रभाव नहीं पड़ता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  पॉडकास्ट या मूवी में बैकग्राउंड शोर दबाकर मानव आवाज़ (1 kHz - 3.5 kHz) को स्पष्ट रूप से उभारना (Peaking EQ boost + Low-cut filter)।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  DSP या ऑडियो पाइपलाइन का अभाव।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 06] नाइट लिसनिंग शील्ड (Night Listening Shield)
- **स्थान:** टैब 3 (टूल्स व ऑटोमेशन) -> `#cardSoundEnhancements`
- **DOM सेलेक्टर:** `#toggleNightShield`
- **कोड संदर्भ:** [`popup/popup.html#L355`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L355), [`popup/popup.js#L2496-L2502`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2496-L2502)
- **वर्तमान स्थिति (Current Behavior):**  
  चेकबॉक्स टॉगल होता है लेकिन देर रात देखने पर अचानक होने वाले तेज़ धमाकों और धीमी फुसफुसाहट में कोई संतुलन नहीं बनता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  Web Audio API `DynamicsCompressorNode` को सक्रिय करके डायनेमिक रेंज को कम्प्रेस करना (तेज़ आवाज़ को सीमित करना और धीमी आवाज़ को उठाना)।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  ऑडियो डायनेमिक्स कम्प्रेसर इंजन अनुपस्थित है।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 07] नए टैब पर ऑटो-पॉज़ (Auto-Pause on New Tab)
- **स्थान:** टैब 3 (टूल्स व ऑटोमेशन) -> `#cardSmartAutomations`
- **DOM सेलेक्टर:** `#toggleAutoPauseNewTab`
- **कोड संदर्भ:** [`popup/popup.html#L376`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L376), [`popup/popup.js#L2403-L2408`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2403-L2408)
- **वर्तमान स्थिति (Current Behavior):**  
  टॉगल ऑन करने पर भी जब यूजर ब्राउज़र में नया टैब खोलता है या किसी दूसरे टैब पर जाता है, तो पुराना वीडियो लगातार बजता रहता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  जैसे ही नया टैब बने (`chrome.tabs.onCreated`) या एक्टिव टैब बदले (`chrome.tabs.onActivated`), बैकग्राउंड में चल रहा वीडियो अपने आप पॉज़ हो जाना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `background.js` में `smart_automations.auto_pause_new_tab` की जांच करने वाला कोई `chrome.tabs.onActivated` या `onCreated` इवेंट लिस्नर नहीं लिखा गया है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 08] ऑटो ऐड साइलेंसर (Auto Ad Silencer)
- **स्थान:** टैब 3 (टूल्स व ऑटोमेशन) -> `#cardSmartAutomations`
- **DOM सेलेक्टर:** `#toggleAutoAdSilencer` / `#toggleAutoAdSilence`
- **कोड संदर्भ:** [`popup/popup.html#L388`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L388), [`popup/popup.js#L2409-L2414`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2409-L2414)
- **वर्तमान स्थिति (Current Behavior):**  
  टॉगल ऑन करने पर यूट्यूब विज्ञापनों (YouTube Ads) के दौरान आवाज़ म्यूट नहीं होती; ऐड पूरे वॉल्यूम पर बजते हैं।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  यूट्यूब पर जब विज्ञापन शुरू हो (पहचान: `.ad-showing`, `.video-ads`, `.ytp-ad-player-overlay`), एक्सटेंशन वीडियो को तुरंत म्यूट कर दे और जैसे ही मुख्य वीडियो वापस आए, वॉल्यूम को पुराने स्तर पर बहाल कर दे।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `content_media.js` में विज्ञापन कंटेनर्स की निगरानी के लिए कोई `MutationObserver` लागू नहीं किया गया है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 09] डोमेन स्पीड मेमोरी (Domain Speed Memory)
- **स्थान:** टैब 3 (टूल्स व ऑटोमेशन) -> `#cardSmartAutomations`
- **DOM सेलेक्टर:** `#toggleDomainSpeedMemory`
- **कोड संदर्भ:** [`popup/popup.html#L401`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L401), [`popup/popup.js#L2415-L2420`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2415-L2420)
- **वर्तमान स्थिति (Current Behavior):**  
  यदि यूजर ने यूट्यूब पर 1.5x स्पीड सेट की थी, तो यूट्यूब दोबारा खोलने पर वह स्पीड याद नहीं रहती और डिफ़ॉल्ट 1.0x पर शुरू होती है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  एक्सटेंशन डोमेन-वार स्पीड टेबल (`{ 'youtube.com': 1.5, 'coursera.org': 1.75 }`) मेंटेन करे और नया पेज लोड होते ही ऑटोमैटिकली उसी स्पीड को अप्लाई कर दे।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `content_media.js` में पेज इनिशियलाइज़ेशन के समय डोमेन स्पीड मेमोरी पढ़ने और सेट करने का लॉजिक अधूरा है।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 10] वीडियो स्क्रीनशॉट टार्गेटिंग दोष (Video Screenshot Capture Defect)
- **स्थान:** टैब 3 (टूल्स व ऑटोमेशन) -> `#cardToolsMicroActions`
- **DOM सेलेक्टर:** `#btnCardScreenshot`
- **कोड संदर्भ:** [`popup/popup.html#L310`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L310), [`popup/popup.js#L2263-L2289`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2263-L2289)
- **वर्तमान स्थिति (Current Behavior):**  
  बटन दबाने पर `browserAPI.tabs.captureVisibleTab(null)` कॉल होता है। यह बैकग्राउंड वीडियो टैब के फ्रेम को कैप्चर करने के बजाय सामने खुली हुई विंडो (Foreground Window / Webpage) का स्क्रीनशॉट ले लेता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  एक्टिव मीडिया टैब के `<video>` एलिमेंट से सीधे कैनवस ड्रा (`ctx.drawImage(video, 0, 0)`) करके बिना किसी ब्राउज़र UI या बाहरी टेक्स्ट के विशुद्ध 1080p/4K वीडियो फ्रेम कैप्चर होना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `captureVisibleTab(null)` केवल वर्तमान सक्रिय विंडो का विजुअल व्यू लेता है, बैकग्राउंड मीडिया टैब के वीडियो एलिमेंट का नहीं।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 11] बंद टैब पर मीडिया रीज़्यूम विफलता (Resume Playback on Closed Tabs)
- **स्थान:** टैब 4 (स्टूडियो / वॉल्ट) -> `#studioResumePlaybackCard`
- **DOM सेलेक्टर:** `#btnStudioResumePlayback` / `#btnStudioResumeLastMedia`
- **कोड संदर्भ:** [`popup/popup.html#L466`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L466), [`popup/popup.js#L2546-L2555`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2546-L2555)
- **वर्तमान स्थिति (Current Behavior):**  
  यदि यूजर ने कल कोई वीडियो देखा था और आज ब्राउज़र खोला (टैब बंद हो चुका है), तो 'Resume Playback' पर क्लिक करने से कुछ नहीं होता; रिक्वेस्ट शांत होकर फेल हो जाती है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  यदि टारगेट टैब बंद हो चुका है, तो एक्सटेंशन को `chrome.tabs.create({ url: lastWatchedPlayback.url })` के जरिए नया टैब खोलना चाहिए और वीडियो लोड होते ही सेव किए गए टाइमस्टैम्प पर सीक करना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `sendMediaControl` केवल पहले से खुले हुए एक्टिव टैब पर मैसेज भेजता है। टैब मिसिंग होने पर नया टैब री-क्रिएट करने का कोई फॉलबैक नहीं है।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 12] डूमस्क्रॉल ब्रेकर अलार्म व नोटिफिकेशन (Doomscroll Breaker Alarm)
- **स्थान:** टैब 5 (ट्रैकिंग व वेलनेस) -> `#cardFocusWellness`
- **DOM सेलेक्टर:** `#toggleDoomscrollBreaker`, `#selectDoomscrollInterval`
- **कोड संदर्भ:** [`popup/popup.html#L547-L560`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L547-L560), [`popup/popup.js#L2558-L2572`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2558-L2572)
- **वर्तमान स्थिति (Current Behavior):**  
  यूजर 30 मिनट का इंटरवल सेट करके ब्रेकर ऑन कर देता है, लेकिन यूट्यूब शॉर्ट्स या सोशल मीडिया पर 30 मिनट से अधिक लगातार स्क्रॉल करने पर भी कोई अलर्ट या ब्रेक रिमाइंडर नहीं आता।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  `background.js` में `chrome.alarms` के जरिए समय ट्रैक होना चाहिए। सीमा पार होते ही सिस्टम नोटिफिकेशन (`chrome.notifications`) या ऑन-स्क्रीन ब्रेक कार्ड दिखना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `background.js` में `focus_settings` को मॉनिटर करने वाला कोई क्रोम अलार्म इंजन नहीं है।
- **गंभीरता (Severity):** 🔴 **High (उच्च)**

---

### [दोष 13] डिफ़ॉल्ट सक्रिय टैब चयन की अनदेखी (Default Active Tab Ignored)
- **स्थान:** हेडर क्विक सेटिंग्स पॉपओवर
- **DOM सेलेक्टर:** `#selectDefaultTab`
- **कोड संदर्भ:** [`popup/popup.html#L743`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L743), [`popup/popup.js#L2228-L2235`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2228-L2235), [`popup/popup.js#L3712-L3715`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3712-L3715)
- **वर्तमान स्थिति (Current Behavior):**  
  यूजर क्विक सेटिंग्स में डिफ़ॉल्ट टैब 'Tracking' या 'Audio' सेट करता है। सेटिंग सेव हो जाती है, लेकिन जब भी यूजर एक्सटेंशन पॉपअप खोलता है, पॉपअप हमेशा 'Media' टैब पर ही खुलता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  पॉपअप लोड होते ही सेव किए गए डिफ़ॉल्ट टैब (`switchTopTab(quickSettings.default_tab)`) पर तुरंत स्विच होना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `popup.js` के लाइन 3715 पर केवल ड्रॉपडाउन की वैल्यू बदली जाती है, लेकिन `switchTopTab()` फंक्शन को कॉल नहीं किया जाता।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 14] ऑटो-सिंक इंटरवल का प्रभावहीन होना (Auto-Sync Interval Disconnected)
- **स्थान:** हेडर क्विक सेटिंग्स पॉपओवर
- **DOM सेलेक्टर:** `#selectSyncInterval`
- **कोड संदर्भ:** [`popup/popup.html#L757`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L757), [`popup/popup.js#L2236-L2240`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2236-L2240), [`popup/popup.js#L3732`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L3732)
- **वर्तमान स्थिति (Current Behavior):**  
  यूजर चाहे 500ms चुने या 5000ms, पॉपअप का ऑटो-रिफ्रेश हमेशा 1000ms (1 सेकंड) पर ही चलता रहता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  यूजर द्वारा चुने गए इंटरवल के अनुसार पोलिंग टाइमर को क्लियर और री-स्टार्ट किया जाना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `popup.js` के लाइन 3732 पर `setInterval(refreshDashboard, 1000);` हार्डकोडेड है और सेटिंग बदलने पर इसे री-शेड्यूल नहीं किया जाता।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 15] नोटिफिकेशन साउंड चाइम का अभाव (Notification Sound Missing Audio)
- **स्थान:** हेडर क्विक सेटिंग्स पॉपओवर
- **DOM सेलेक्टर:** `#toggleNotificationSound`
- **कोड संदर्भ:** [`popup/popup.html#L769`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L769), [`popup/popup.js#L2242-L2246`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2242-L2246)
- **वर्तमान स्थिति (Current Behavior):**  
  चेकबॉक्स टॉगल होता है लेकिन स्लीप टाइमर समाप्त होने पर या कोई चेतावनी आने पर कोई आवाज़ (Audio Chime / Beep) नहीं बजती।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  इवेंट ट्रिगर होने पर Web Audio API से एक सूक्ष्म, मधुर चाइम साउंड प्ले होना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  एक्सटेंशन में साउंड सिंथेसाइज़र या ऑडियो फ़ाइल प्लेबैक का कोई कोड मौजूद नहीं है।
- **गंभीरता (Severity):** 🟢 **Low (निम्न)**

---

### [दोष 16] हाई कंट्रास्ट मोड में सीएसएस का अभाव (High Contrast Mode Missing CSS)
- **स्थान:** हेडर क्विक सेटिंग्स पॉपओवर
- **DOM सेलेक्टर:** `#toggleHighContrast`
- **कोड संदर्भ:** [`popup/popup.html#L779`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L779), [`popup/popup.js#L2248-L2253`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2248-L2253)
- **वर्तमान स्थिति (Current Behavior):**  
  टॉगल ऑन करने पर बॉडी पर `.high-contrast-mode` क्लास तो लग जाती है, लेकिन स्क्रीन के रंगों या बॉर्डर में शून्य बदलाव दिखता है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  टेक्स्ट और बैकग्राउंड के बीच अत्यधिक कंट्रास्ट (प्योर ब्लैक बैकग्राउंड, सॉलिड वाइट टेक्स्ट, और 2px नियॉन बॉर्डर्स) सक्रिय होना चाहिए।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  `popup/popup.css` में `.high-contrast-mode` सेलेक्टर के लिए एक भी सीएसएस नियम नहीं लिखा गया है।
- **गंभीरता (Severity):** 🟡 **Medium (मध्यम)**

---

### [दोष 17] SQLite डेटा हब वन-क्लिक ऑटो-लॉन्चर सीमा (Data Hub Daemon Launcher)
- **स्थान:** हेडर स्टेटस बैज
- **DOM सेलेक्टर:** `#hubStatusBadge`
- **कोड संदर्भ:** [`popup/popup.html#L29`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L29), [`popup/popup.js#L1636`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L1636), [`popup/popup.js#L2757`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L2757)
- **वर्तमान स्थिति (Current Behavior):**  
  जब पोर्ट 65433 पर चलने वाला SQLite Data Hub बंद होता है, तो बैज नारंगी हो जाता है। क्लिक करने पर यह केवल री-प्रोब करता है और टोस्ट दिखाता है, लेकिन यदि बैकग्राउंड डेमन बंद है तो उसे स्वतः चालू करने का नेटिव लॉन्चर उपलब्ध नहीं है।
- **अपेक्षित कार्यप्रणाली (Expected Behavior):**  
  Video Detector HUD की तरह (`videohud://launch`), SQLite Data Hub के लिए भी एक सुरक्षित कस्टम प्रोटोकॉल या नेटिव मैसेजिंग लॉन्चर होना चाहिए जो डेमन के बंद होने पर 1-क्लिक में उसे स्टार्ट कर सके।
- **तकनीकी मूल कारण (Technical Root Cause):**  
  डेटा हब के लिए केवल साइलेंट HTTP प्रोबिंग लागू है, नेटिव होस्ट ट्रिगर नहीं।
- **गंभीरता (Severity):** 🟢 **Low (निम्न)**

---

## ✅ 4. पूर्णतः कार्यरत 31 फ़ंक्शन्स की संदर्भ सूची (Fully Working Features Reference)

आपकी सुविधा के लिए, वे 31 फ़ंक्शन्स जो पॉपअप मोड में **100% सही तरीके से काम कर रहे हैं**:

1. **टुडे एक्टिव टाइम बैज (`#todayHeaderTimeBadge`):** लाइव सक्रिय समय दिखाता है और क्लिक करने पर ट्रैकिंग टैब खोलता है।
2. **HUD वेबसॉकेट बैज (`#wsStatusBadge`):** पोर्ट 65432 कनेक्शन स्थिति दिखाता है और क्लिक पर HUD लॉन्च करता है।
3. **थीम टॉगल बटन (`#btnThemeToggle`):** डार्क और लाइट मोड को स्मूथली टॉगल करता है, सूरज/चांद आइकन बदलता है।
4. **क्विक सेटिंग्स टॉगल (`#btnQuickSettings`):** क्विक सेटिंग्स पॉपओवर को खोलता और बंद करता है।
5. **डायनामिक स्टेटस बटन (`#dynamicStatusBtn`):** मुख्य मीडिया कार्ड पर प्ले/पॉज़ टॉगल करता है।
6. **टाइमलाइन प्रोग्रेस बार (`#progressBarContainer`):** वीडियो के किसी भी हिस्से में क्लिक या ड्रैग करके सीक करता है।
7. **वॉल्यूम स्लाइडर बार (`#volumeBarContainer`):** 0 से 100% तक वॉल्यूम एडजस्ट करता है।
8. **क्विक म्यूट बटन (`#btnQuickMute`):** तुरंत म्यूट/अनम्यूट करता है।
9. **रिवाइंड 10s बटन (`#btnCtrlRewind`):** वीडियो को 10 सेकंड पीछे करता है।
10. **मुख्य प्ले/पॉज़ बटन (`#btnCtrlTogglePlay`):** वीडियो को प्ले या पॉज़ करता है।
11. **फॉरवर्ड 10s बटन (`#btnCtrlForward`):** वीडियो को 10 सेकंड आगे करता है।
12. **टॉगल म्यूट बटन (`#btnCtrlToggleMute`):** ऑडियो टॉगल करता है।
13. **स्पीड डाउन स्टेपर (`#btnCtrlSpeedDown`):** 0.25x के स्टेप्स में स्पीड घटाता है।
14. **स्पीड अप स्टेपर (`#btnCtrlSpeedUp`):** 0.25x के स्टेप्स में स्पीड बढ़ाता है।
15. **फुलस्क्रीन बटन (`#btnCtrlFullscreen`):** यूट्यूब नेटिव व वेब फुलस्क्रीन सक्रिय करता है।
16. **पिक्चर-इन-पिक्चर बटन (`#btnCtrlPip`):** PiP फ्लोटिंग विंडो शुरू करता है।
17. **थिएटर मोड बटन (`#btnCtrlTheater`):** सिनेमा/थिएटर व्यू टॉगल करता है।
18. **क्वालिटी डाउन स्टेपर (`#btnCtrlQualityDown`):** वीडियो रेजोल्यूशन घटाता है।
19. **क्वालिटी अप स्टेपर (`#btnCtrlQualityUp`):** वीडियो रेजोल्यूशन बढ़ाता है।
20. **एम्प्टी स्टेट जंप बटन (`#btnGoToTracking`):** मीडिया न होने पर ट्रैकिंग टैब पर ले जाता है।
21. **सिनेमा डिमर बटन (`#btnCardCinemaDim`):** वीडियो को छोड़कर बाकी स्क्रीन को 85% काला कर देता है।
22. **मीडिया लूप बटन (`#btnCardLoopMedia`):** वीडियो को अनंत लूप पर सेट करता है।
23. **नेक्स्ट ट्रैक बटन (`#btnCardNextTrack`):** यूट्यूब प्लेलिस्ट में अगला वीडियो चलाता है।
24. **कॉपी टाइमस्टैम्प लिंक (`#btnCardCopyTimestamp`):** वर्तमान समय के साथ वीडियो का यूआरएल क्लिपबोर्ड पर कॉपी करता है।
25. **पिन स्टूडियो नोट (`#btnStudioPinNote`):** टाइमस्टैम्प के साथ नोट्स सेव करता है और लिस्ट में दिखाता है।
26. **क्लियर स्टूडियो बुकमार्क्स (`#btnClearStudioBookmarks`):** सभी नोट्स को क्लियर करता है।
27. **डोनेट चार्ट SVG (`#donutSvg`):** टॉप डोमेन्स का लाइव SVG चार्ट दिखाता है।
28. **सबटैब टेम्पोरल फिल्टर्स (`.tab-btn`):** Today, Daily Avg, और Total Time के आधार पर डेटा री-कैलकुलेट करता है।
29. **मल्टी-ब्राउज़र फ़िल्टर (`#browserFilterSelect`):** ब्राउज़र-वार एनालिटिक्स फ़िल्टर करता है।
30. **ग्लोबल मीडिया टॉगल (`#btnGlobalMediaToggle`):** सभी ब्राउज़र टैब्स में एक साथ मीडिया पॉज़/प्ले करता है।
31. **स्लीप टाइमर कंट्रोल (`#btnSleepTimerTrigger`):** 15m, 30m, 45m, 60m या कस्टम स्लीप टाइमर सेट करता है और समाप्त होने पर मीडिया पॉज़ करता है।

---

## 📌 5. अगला कदम (Next Step)

इन सभी 17 कमियों और यूआई स्टब्स को कैसे स्टेप-बाय-स्टेप दूर किया जाएगा, इसके लिए कृपया साथी फ़ाइल देखें:  
👉 **[`popup_phase_wise_plan.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup_phase_wise_plan.md)** (5-फेज़ तकनीकी ब्लूप्रिंट, आर्किटेक्चर और टेस्ट गेट्स)।
