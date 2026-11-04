# 🖥️ Windows Idle & True Active Media Playback Sentinel

> **Subfolder:** `Win App Tracker/`  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Target OS:** Microsoft Windows 10 / 11 (x64)  
> **Runtime:** Python 3.10+ (Standard Library Only — Zero External Dependencies)

---

## 📌 Overview (सारांश)

यह एक आधुनिक, हल्का और 100% सटीक विंडोज आइडियल डिटेक्टर (**Windows Idle & True Active Media Playback Sentinel**) है। इसका मुख्य कार्य यह पहचानना है कि विंडोज सिस्टम इस समय वास्तविक रूप से **"Idle" (खाली / उपयोग में नहीं)** है या **"In-Use" (उपयोग में)** है।

### 🎯 True Active Playback Architecture (पॉज़ वीडियो समस्या का समाधान)
पारंपरिक टूल्स केवल विंडो टाइटल (जैसे "YouTube - Google Chrome") को देखकर धोखा खा जाते हैं और वीडियो **पॉज़** होने पर भी उसे "वीडियो चल रहा है" समझकर कंप्यूटर को कभी आइडल नहीं होने देते।

यह डिटेक्टर **Windows Core Audio API (WASAPI)** ऑडियो सेशन मीटरिंग का उपयोग करता है:
1. **True Active Playback Verification:** जब कोई वीडियो (YouTube, Netflix, Prime, Hotstar) या मीडिया प्लेयर (VLC, Spotify, MPV) वास्तव में बज/चल रहा होता है (ऑडियो पीक > 0), केवल तभी उसे **"In Use"** माना जाता है।
2. **Paused Video = IDLE Standard:** जब वीडियो **PAUSED** होता है (ऑडियो आउटपुट 0.0), तो डिटेक्टर तुरंत पहचान लेता है कि मीडिया पॉज़ है, और यदि कीबोर्ड/माउस शांत है तो सिस्टम को **"IDLE"** घोषित कर देता है।

---

## 🚀 How to Run (1-Click डायरेक्ट लॉन्च)

### 1. डायरेक्ट 1-क्लिक बैच लॉन्चर (सबसे आसान):
सीधे `Run_Windows_Idle_Detector.bat` पर डबल-क्लिक करें। बिना किसी अतिरिक्त मेनू या चुनाव के, यह तुरंत लाइव रियल-टाइम आइडियल डिटेक्टर लूप शुरू कर देता है!

### 2. कमांड लाइन (CLI) विकल्प:
```powershell
# 1. डिफ़ॉल्ट लाइव रियल-टाइम लूप:
python Win App Tracker.py

# 2. केवल एक बार जांच करके परिणाम देखना:
python Win App Tracker.py --check-once

# 3. कस्टम आइडल थ्रेशोल्ड (जैसे 60 सेकंड):
python Win App Tracker.py --threshold 60

# 4. JSON आउटपुट (प्रोग्रामेटिक ऑटोमेशन हेतु):
python Win App Tracker.py --check-once --json
```

---

## 📊 Output Examples (आउटपुट के उदाहरण)

### 1. जब वीडियो PAUSED हो और यूजर शांत हो (आइडियल स्थिति):
```text
============================================================================
  [OK / IDLE] WINDOWS IS IN IDLE CONDITION
============================================================================
  English Verdict:  Windows IS in idle condition (Idle Duration: 37.7s / 25s) [Video is paused / silent in Google Chrome]
  Hindi Verdict:    विंडोज आइडियल स्थिति में है (आइडियल समय: 37.7s / 25s) [Google Chrome में वीडियो पॉज/शांत है]
----------------------------------------------------------------------------
  * Keyboard / Mouse Inactivity : 37.7 seconds (Threshold: 25s)
  * Active Audio/Video Playback : None (Audio Silent / Master Peak: 0.0000)
  * Paused Media Windows        : 1 paused/silent stream(s) [TREATED AS IDLE]
    - Google Chrome: AI Agents Full Course: Build, Deploy & Sell in 1 Hour! - YouTube - Google Chrome
============================================================================
```

### 2. जब वीडियो ACTUALLY PLAYING हो (सक्रिय उपयोग):
```text
============================================================================
  [IN USE / BUSY] WINDOWS IS NOT IN IDLE CONDITION
============================================================================
  English Verdict:  Windows is NOT in idle condition: Video/Audio is actively playing in Google Chrome ('AI Agents Full Course: Build, Deploy & Sell in 1 Hour! - YouTube - Google Chrome')
  Hindi Verdict:    विंडोज इन यूज़ है: Google Chrome में वीडियो/ऑडियो एक्टिवली प्ले हो रहा है ('AI Agents Full Course: Build, Deploy & Sell in 1 Hour! - YouTube - Google Chrome')
----------------------------------------------------------------------------
  * Keyboard / Mouse Inactivity : 45.2 seconds (Threshold: 30s)
  * Active Audio/Video Playback : ACTIVELY PLAYING (1 stream)
    - Google Chrome: AI Agents Full Course: Build, Deploy & Sell in 1 Hour! - YouTube - Google Chrome (Peak Audio: 0.082)
============================================================================
```

### 3. जब यूजर कीबोर्ड या माउस यूज़ कर रहा हो:
```text
============================================================================
  [IN USE / BUSY] WINDOWS IS NOT IN IDLE CONDITION
============================================================================
  English Verdict:  Windows is NOT in idle condition: User is using this PC (Keyboard/Mouse active 0.0s ago)
  Hindi Verdict:    विंडोज इन यूज़ है: यूजर इस कंप्यूटर को सक्रिय रूप से यूज़ कर रहा है (कीबोर्ड/माउस 0.0s पहले सक्रिय था)
----------------------------------------------------------------------------
  * Keyboard / Mouse Inactivity : 0.0 seconds (Threshold: 30s)
  * Active Audio/Video Playback : None (Audio Silent / Master Peak: 0.0000)
============================================================================
```

---

## 🛠️ Architecture & Specifications

- **Windows Core Audio API (WASAPI):** Pure COM implementation via standard library `ctypes` (`IMMDeviceEnumerator`, `IAudioSessionManager2`, `IAudioSessionControl2`, `IAudioMeterInformation`).
- **Zero Third-Party Dependencies:** किसी भी बाहरी लाइब्रेरी (`pip install`) की आवश्यकता नहीं है।
- **Audio Smoothing Window:** आवाज़ में आने वाले छोटे अंतरालों (speech pauses) के दौरान फ़्लिकरिंग रोकने के लिए 2.5 सेकंड का स्मार्ट स्मूथिंग बफ़र।
- **UTF-8 with BOM Standard:** बैच फ़ाइल `Run_Windows_Idle_Detector.bat` UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) और CRLF लाइन एंडिंग्स के साथ संरचित है।

---

## 📂 Sub-Detectors Directory Structure (विशेषीकृत सब-टूल्स)

`Win App Tracker` फोल्डर के अंतर्गत 2 विशेषीकृत सब-डिटेक्टर मॉड्यूल उपलब्ध हैं:

```text
Win App Tracker/
  ├── Run_Windows_Idle_Detector.bat      # मुख्य 1-क्लिक आइडियल रनर
  ├── Win App Tracker.py           # मुख्य WASAPI + इनपुट डिटेक्शन इंजन
  ├── README.md                          # मुख्य दस्तावेज़
  ├── keyboard_mouse_idle_detector/      # [सब-टूल 1] केवल कीबोर्ड/माउस इनएक्टिविटी (1 मिनट)
  │     ├── Run_Keyboard_Mouse_Detector.bat
  │     ├── keyboard_mouse_idle_detector.py
  │     └── README.md
  └── video_idle_detector/               # [सब-टूल 2] केवल वीडियो इनएक्टिविटी (प्योर ऑडियो इग्नोर)
        ├── Run_Video_Idle_Detector.bat
        ├── video_idle_detector.py
        └── README.md
```

1. **`keyboard_mouse_idle_detector/`**: केवल फ़िज़िकल कीबोर्ड और माउस की निष्क्रियता ट्रैक करता है (60s थ्रेशोल्ड, ऑडियो/वीडियो पूरी तरह अनदेखा)।
2. **`video_idle_detector/`**: केवल वीडियो प्लेबैक ट्रैक करता है (YouTube, Netflix, Prime, VLC आदि), जबकि स्पॉटिफ़ाई/म्यूजिक जैसे केवल-ऑडियो ऐप्स को अनदेखा (Ignore) करके सिस्टम को आइडल मानता है।
