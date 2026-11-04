# Web Activity & Media Sentinel (Chrome & Edge Extension)

> **Cross-Browser Media Telemetry Detector, Web Activity Time Tracker & Video Detector HUD Bridge**  
> **Manifest Version:** Manifest V3 (Google Chrome, Microsoft Edge, Brave, Opera, Mozilla Firefox)  
> **Target Subfolder:** `Browser Detection/`  
> **WebSocket Bridge:** `ws://127.0.0.1:65432`  
> **Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  

---

## 🌟 Overview (सिस्टम का परिचय)

**Web Activity & Media Sentinel** एक एंटरप्राइज-ग्रेड, क्रॉस-ब्राउज़र एक्सटेंशन है जो दोहरे उद्देश्यों की पूर्ति करता है:
1. **वेब एक्टिविटी टाइम ट्रैकर (Web Activity Time Tracker):** उपयोगकर्ता द्वारा प्रत्येक वेबसाइट (जैसे YouTube, GitHub, Netflix आदि) पर बिताए गए सक्रिय समय, दैनिक औसत, कुल समय और सत्रों (Sessions) की संख्या को एक खूबसूरत साइबर-ग्लास डोनट चार्ट में ट्रैक और विज़ुअलाइज़ करता है।
2. **इन-पेज मीडिया टेलीमेट्री सेंटिनल (In-Page Media Sentinel):** ब्राउज़र के किसी भी टैब या बैकग्राउंड में चल रहे HTML5 `<video>` और `<audio>` एलिमेंट्स (यूट्यूब, नेटफ्लिक्स, ओटीटी) के प्ले, पॉज, म्यूट, वॉल्यूम, और रिज़ॉल्यूशन (1080p FHD, 4K UHD) को रियल-टाइम में कैप्चर करता है।
3. **लोकल HUD वेबसॉकेट ब्रिज (WebSocket Bridge):** बिना किसी अतिरिक्त सॉफ्टवेयर या क्लाउड कॉल के, शून्य-डिपेंडेंसी RFC 6455 वेबसॉकेट प्रोटोकॉल (`ws://127.0.0.1:65432`) के जरिए डेस्कटॉप `Video Detector HUD` से जुड़ा रहता है।

---

## 🏗️ Architecture & Component Topology (सिस्टम आर्किटेक्चर)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   WEB BROWSER (Chrome / Edge / Opera)                  │
├────────────────────────────────┬───────────────────────────────────────┤
│    content_media.js            │       background.js (MV3 Worker)      │
│  • MutationObserver on DOM     │     • Tab & Window Focus Tracker      │
│  • 10 HTMLMediaElement Events  │     • Activity Time Tracker Engine    │
│  • 4K/1080p/720p Resolution    │     • System Idle Detection (60s)     │
│  • YouTube / OTT Heuristics    │     • chrome.storage.local Engine     │
│  • Throttled Telemetry IPC     │     • WebSocket Client Engine         │
└───────────────┬────────────────┴───────────────────┬───────────────────┘
                │ IPC Dispatch                       │ WebSocket Stream
                ▼                                    ▼ (ws://127.0.0.1:65432)
┌────────────────────────────────┐   ┌───────────────────────────────────┐
│        popup/ (User UI)        │   │    modules/browser_ws_server.py   │
│  • Standalone SVG Donut Chart  │   │  • RFC 6455 WebSocket Server     │
│  • Today / Daily / Total Tabs  │   │  • Zero-Dependency Standard Lib   │
│  • Top Domain Progress Bars    │   │  • Thread-Safe State Cache        │
│  • Live Media Sentinel Banner  │   │  • Video Detector HUD Evaluator   │
└────────────────────────────────┘   └───────────────────────────────────┘
```

---

## 🚀 1-Click Unpacked Installation Guide (इंस्टॉलेशन निर्देश)

### 1. Google Chrome / Brave / Opera में लोड करने का तरीका:
1. Google Chrome खोलें और एड्रेस बार में टाइप करें:
   ```text
   chrome://extensions/
   ```
2. ऊपर दाईं ओर **"Developer mode" (डेवलपर मोड)** को **ON** करें।
3. ऊपर बाईं ओर नीले बटन **"Load unpacked" (अनपैक्ड लोड करें)** पर क्लिक करें।
4. फ़ाइल पिकर में निम्न फ़ोल्डर चुनें:
   ```text
   Browser Detection
   ```
5. **"Select Folder"** पर क्लिक करें।
6. एक्सटेंशन **"Web Activity & Media Sentinel"** तुरंत लोड हो जाएगा।
7. क्रोम के टूलबार पर एक्सटेंशन (पज़ल) आइकन पर क्लिक करके **Media Sentinel** को **Pin 📌** करें।

---

### 2. Microsoft Edge में लोड करने का तरीका:
1. Microsoft Edge खोलें और एड्रेस बार में टाइप करें:
   ```text
   edge://extensions/
   ```
2. बाईं साइडबार में **"Developer mode"** को **ON** करें।
3. ऊपर **"Load unpacked"** बटन पर क्लिक करें।
4. वही `Browser Detection` फ़ोल्डर चुनें और **"Select Folder"** दबाएं।
5. एक्सटेंशन को एज टूलबार पर पिन करें।

---

### 3. Video Detector HUD के साथ ऑटो-कनेक्ट करना:
1. डेस्कटॉप `Video Detector HUD` चलाएं (उदाहरण: `Run_Video_Detector_HUD.bat`)।
2. HUD बैकग्राउंड में पोर्ट `65432` पर शून्य-डिपेंडेंसी WebSocket सर्वर चालू करता है।
3. ब्राउज़र एक्सटेंशन पॉपअप खोलें; ऊपर दाईं ओर हरा स्टेटस दिखाई देगा:
   ```text
   ● HUD Connected (65432)
   ```
4. अब जब भी आप यूट्यूब या किसी भी साइट पर वीडियो चलाएंगे, डेस्कटॉप HUD तुरंत पहचान लेगा कि वीडियो चल रहा है!

---

## 📊 Features & User Interface (मुख्य सुविधाएं)

### 1. स्टैंडअलोन एसवीजी डोनट चार्ट (SVG Donut Chart)
- शून्य एक्सटर्नल लाइब्रेरी (बिना किसी CDN या Chart.js के, 100% ऑफलाइन सुरक्षा)।
- होवर करने पर डोमेन नाम और समय का डायनामिक सेंटर अपडेट।
- 6-कलर मॉडर्न कैटपुसिन/साइबरपंक पैलेट।

### 2. टेम्पोरल टैब्स (Temporal Tabs)
- **Today:** आज का कुल स्क्रीन टाइम और डोमेन-वाइज ब्रेकडाउन।
- **Daily Avg:** पिछले दिनों का औसत उपयोग।
- **Total Time:** एक्सटेंशन इंस्टॉल होने से अब तक का कुल इतिहास।

### 3. लाइव मीडिया सेंटिनल कार्ड (Live Media Card)
- **Video Playing (हरा बैज):** वीडियो का टाइटल, रिज़ॉल्यूशन (1080p FHD, 4K UHD), स्पीड (1.0x, 1.5x) और वॉल्यूम प्रतिशत।
- **Audio Stream (अंबर बैज):** बैकग्राउंड ऑडियो / पॉडकास्ट स्ट्रीमिंग का स्पष्ट संकेत।
- **Idle (स्लेट बैज):** जब कोई मीडिया सक्रिय न हो।

### 4. डेटा सुरक्षा और एक्सपोर्ट (Export & Privacy)
- आपका सारा डेटा आपके ब्राउज़र के `chrome.storage.local` में 100% सुरक्षित रहता है।
- **Export JSON:** एक क्लिक में अपनी पूरी ब्राउज़िंग एक्टिविटी को JSON फ़ाइल में डाउनलोड करें।
- **Clear Data:** जब चाहें एक क्लिक में हिस्ट्री रीसेट करें।

---

## 🛠️ File Structure Manifest

| फ़ाइल का नाम | उद्देश्य |
| :--- | :--- |
| `manifest.json` | Manifest V3 कॉन्फ़िगरेशन, परमिशन्स और आइकन मैपिंग |
| `background.js` | सर्विस वर्कर: टाइम ट्रैकिंग, आइडल डिटेक्शन, वेबसॉकेट क्लाइंट |
| `content_media.js` | इन-पेज स्क्रिप्ट: DOM म्यूटेशन, HTML5 मीडिया इवेंट्स, रिज़ॉल्यूशन |
| `popup/popup.html` | ग्लासमोर्फिक यूआई स्ट्रक्चर (डोनट चार्ट, टैब्स, डोमेन लिस्ट) |
| `popup/popup.css` | डार्क साइबर-ग्लास स्टाइलिंग और एनिमेशन्स |
| `popup/popup.js` | एसवीजी डोनट कैलकुलेशन, टैब स्विचिंग और रियल-टाइम रिफ्रेश |
| `icons/icon16.png` | 16x16 पिक्सल टूलबार आइकन |
| `icons/icon32.png` | 32x32 पिक्सल हाई-डीपीआई आइकन |
| `icons/icon48.png` | 48x48 पिक्सल एक्सटेंशन मैनेजर आइकन |
| `icons/icon128.png` | 128x128 पिक्सल हाई-रेज़ोल्यूशन स्टोर आइकन |
| `docs/` | Universal Rule 22 फेज़-वाइज़ प्रॉम्प्ट्स और आर्किटेक्चर डॉक्स |

---

## 🔒 Security & Performance Compliance

- **Zero Remote CDN Dependencies:** सभी स्टाइल्स, आइकन्स और जावास्क्रिप्ट 100% लोकल हैं।
- **Strict Content Security Policy (CSP):** कोई इनलाइन कोड या `eval()` नहीं।
- **Zero Token Cost:** यह सिस्टम किसी भी LLM टोकन को खर्च किए बिना विशुद्ध रूप से नेटिव वेब और विंडोज एपीआई पर चलता है।
- **UTF-8 with BOM Standard:** सभी डॉक्स और स्क्रिप्ट्स मोजीबाके-मुक्त देवनागरी + अंग्रेज़ी मानक के अनुकूल हैं।
