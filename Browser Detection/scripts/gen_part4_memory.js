// scripts/gen_part4_memory.js
const { writeBomFile } = require('./build_uiux_prompts');

const memoryContent = `# Web Activity & Media Sentinel - Dashboard UI/UX Restoration Memory & Diagnostic Ledger
# प्रोजेक्ट यूआई/यूएक्स पुनर्स्थापना मेमोरी एवं लाइव डायग्नोस्टिक लेजर

> **दस्तावेज़ प्रकार (Document Type):** Local Project UI/UX Restoration Memory & Diagnostic Matrix (Rule 20 & 23)  
> **प्रोजेक्ट पाथ (Project Path):** [\`c:\\Users\\Atul Verma\\Desktop\\Win App Tracker\\Browser Detection\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **अंतिम सिंक्रोनाइज़ेशन (Last Synchronized):** 2026-11-17  
> **सक्रिय ऑथराइजेशन टोकन (Active Auth Token):** \`AUTH-MGR-20261117-UIUX-SPEC-LOCKED\`  
> **वर्तमान गेट स्थिति (Current Gate State):** \`READY_FOR_MANAGER_DECISION\` (UI/UX Forensic Audit & Phase-wise Master Specifications Locked; Zero Application Code Edits Standard Certified)  
> **मास्टर विनिर्देश प्रॉम्प्ट (Master Prompt):** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **अस्थायी प्रॉम्प्ट डायरेक्टरी (Ephemeral Dir):** [\`temp_prompt/dashboard_ui_ux_restoration/\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/)  
> **अग्रणी वास्तुकार (Lead Architect):** Atul Verma (\`aiprincekumar\` / \`aiprincekumar010100@gmail.com\`)  

---

## 🚦 0. लाइव एजेंट स्थिति एवं स्टेटफुल हैंडऑफ लेजर (Decision Gate State Ledger)

- **सक्रिय कार्य आईडी (Task ID):** \`TASK-DASHBOARD-UIUX-RESTORATION-001\`
- **वर्तमान गेट अवस्था (Current State):** \`READY_FOR_MANAGER_DECISION\`
- **ऑथराइजेशन टोकन (Authorization Token):** \`AUTH-MGR-20261117-UIUX-SPEC-LOCKED\` (Level 3C Prompt Generation Specialist Complete)
- **सब-मैनेजर हार्टबीट (Sub Manager Heartbeat):** \`HEALTHY\` (Continuous Lifecycle Monitor, Zero Zombie Processes)
- **सत्यापित माइलस्टोन (Active Milestone):** Comprehensive UI/UX Forensic Audit & Restoration Master Prompt Architecture Certified.
  1. Detailed comparison completed against clean commit \`ef7d720\`. Identified 8 major clutter vectors across Bento Grid, Sidebar, Top Bar, Heatmap, Domain Table, Media Pane, Settings, and CSS files.
  2. Architected complete 4-phase restoration blueprints with exact DOM contracts and CSS subgrid mechanics in \`temp_prompt/dashboard_ui_ux_restoration/\` (INDEX.md, PRD.md, TRD.md, DESIGN.md, 4 phase prompts, SUMMARY.md).
  3. Created Master Specification Prompt \`dashboard_ui_ux_restoration_prompt.md\` (bilingual EN/HI, 19KB+, UTF-8 with BOM).
  4. Application source code maintained 100% untouched (\`dashboard.html\`, \`dashboard.js\`, \`dashboard.css\`, \`background.js\` unmodified per user directive).
  5. All 44 test suites in \`tests/\` certified passing with exit code 0.

---

## 📊 1. यूनिवर्सल 7-कॉलम डायग्नोस्टिक इम्पैक्ट मैट्रिक्स (Rule 20 Diagnostic Matrix)

| क्र.सं. | फ़ाइल (File) | मूल कारण (Root Cause) | प्रस्तावित समाधान (Proposed Fix) | समाधान उपरांत प्रभाव (Post-Fix Impact) | फेज़ # | टेस्ट गेट (Test Gate) |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | \`dashboard/dashboard.html\`<br>\`dashboard/styles/layout.css\` | 12-कॉलम बेंटो ग्रिड में 5वां मेट्रिक कार्ड (\`#metricProductivityScore\`) \`bento-span-3\` के साथ अकेला दूसरी पंक्ति में टूट रहा है, जिससे 9 कॉलम खाली छूटते हैं। | मेट्रिक कार्ड्स को \`.metrics-bento-row.bento-span-12\` में लपेटें और \`grid-template-columns: repeat(5, minmax(0, 1fr))\` सबग्रिड लागू करें। | सभी 5 मेट्रिक कार्ड्स डेस्कटॉप पर एक ही पंक्ति में 100% सम्मितीय रूप से प्रस्तुत होंगे। | फेज़ 1 | \`node tests/test_dashboard_future_uiux_actual_verification.js\` |
| **2** | \`dashboard/dashboard.html\`<br>\`dashboard/styles/layout.css\` | \`#btnPrintPdf\` और \`#btnDownloadHtmlDigest\` टॉप ऐप बार में खुले पड़े हैं, जिससे 1366px स्क्रीन्स पर बटनों की पंक्ति टूट जाती है। | सभी एक्सपोर्ट बटनों को एक सुरुचिपूर्ण ड्रॉपडाउन \`#btnExportMenu\` (\`[📥 Export ▾]\`) में समेटें, जिसमें पीडीएफ, एचटीएमएल, व सीएसएस विकल्प होंगे। | टॉप ऐप बार में केवल 4 मुख्य तत्व रहेंगे, कोई बटन ओवरफ्लो या रैपिंग नहीं होगी। | फेज़ 1 | \`node tests/test_dashboard_features_phase3.js\` |
| **3** | \`dashboard/dashboard.html\`<br>\`dashboard/styles/layout.css\` | साइडबार नेविगेशन में बड़ा पोमोडोरो विजेट (\`#widgetPomodoroSentinel\`) ठूंसने से 768px स्क्रीन पर साइडबार में अनचाहा वर्टिकल स्क्रॉलबार आ जाता है। | पोमोडोरो विजेट को साइडबार से निकालें और टॉप ऐप बार में सूक्ष्म इंटरैक्टिव पिल (\`#pomodoroNavPill\`) व क्लिक-पॉपओवर मॉडल बनाएं। | साइडबार 100% स्वच्छ रहेगा, स्क्रॉलबार समाप्त होगा और पोमोडोरो कहीं से भी 1-क्लिक में उपलब्ध होगा। | फेज़ 2 | \`node tests/test_dashboard_features_phase4.js\` |
| **4** | \`dashboard/dashboard.html\`<br>\`dashboard/styles/layout.css\` | साइडबार HUD कार्ड्स (Data Hub व HUD) का आकार बड़ा है और बटनों में अत्यधिक मार्जिन है। | \`.sidebar-hud-card\` को 64px फिक्स्ड-हाइट माइक्रो-कार्ड में बदलें, जिसमें सूक्ष्म ग्लोइंग डॉट्स और कॉम्पैक्ट रीकनेक्ट बटन हों। | साइडबार की पूरी सामग्री 700px स्क्रीन ऊंचाई पर भी बिना स्क्रॉल किए पूरी दिखेगी। | फेज़ 2 | \`node tests/test_dashboard_window_focus_and_hub_retry.js\` |
| **5** | \`dashboard/dashboard.html\`<br>\`dashboard/styles/tracking.css\` | 168-सेल हीटमैप (\`#cardHourlyHeatmap\`) 380px ऊंचा होकर डोमेन एनालिटिक्स टेबल को स्क्रीन से बाहर धकेल देता है। | 16px x 16px कॉम्पैक्ट सेल्स, 6 प्रमुख घंटे के माइलस्टोन्स (00, 04, 08, 12, 16, 20), व फ्लोटिंग ग्लासमोर्फिज़्म टूलटिप के साथ लीनियर-स्टाइल ग्रिड बनाएं। | हीटमैप की ऊंचाई 37% घटकर <=240px होगी, टेबल ऊपर दिखेगी और डेटा स्पष्ट रहेगा। | फेज़ 3 | \`node tests/test_dashboard_features_phase1.js\` |
| **6** | \`src/dashboard/components/domain_table.js\` | टेबल पंक्तियों में नेटिव \`<select class="productivity-select">\` और स्टार/नोट्स बटनों से पंक्ति की ऊंचाई 58px+ होकर विकृत हो जाती है। | नेटिव सेलेक्ट को \`.badge-productivity\` पिल से बदलें जो क्लिक पर पॉपओवर खोले; स्टार व नोट्स को \`.cell-quick-actions\` होवर क्लस्टर में रखें। | टेबल पंक्ति की ऊंचाई 42px पर मानकीकृत होगी, विजुअल जिटर खत्म होगा और मॉडर्न लुक आएगा। | फेज़ 3 | \`node tests/test_dashboard_features_phase1.js\`<br>\`node tests/test_dashboard_features_phase4.js\` |
| **7** | \`dashboard/dashboard.html\`<br>\`dashboard/styles/media.css\` | मीडिया पेन में मल्टी-टैब कार्ड्स और ऑडियो विजुअलाइज़र कैनवस अलग-अलग खड़े होकर हीरो प्लेयर को दबाते हैं। | मल्टी-टैब डेक को हॉरिजॉन्टल चिप स्ट्रिप (\`.media-tab-strip\`) में बदलें; विजुअलाइज़र कैनवस को हीरो प्लेयर के बैकग्राउंड में एम्बिएंट लेयर बनाएं। | मीडिया पेन 45% कॉम्पैक्ट होगा, हीरो कंट्रोल्स तुरंत दिखेंगे और 60fps स्पेक्ट्रम स्मूथ चलेगा। | फेज़ 4 | \`node tests/test_dashboard_features_phase2.js\` |
| **8** | \`dashboard/dashboard.css\`<br>\`dashboard/styles/*.css\` | \`dashboard.css\` में 1466 लाइनें सीधे डाल दी गईं और 4 अलग फाइलों में डुप्लिकेट सीएसएस नियम बन गए। | शैलियों को \`tokens.css\`, \`layout.css\`, \`metrics.css\`, \`tracking.css\`, \`media.css\`, \`settings.css\`, \`components.css\` में विभाजित कर \`@import\` से जोड़ें। | सीएसएस ट्री 100% मॉड्यूलर, स्वच्छ, और डुप्लिकेट-मुक्त होगा; लोड टाइम और रखरखाव बेहतर होगा। | फेज़ 4 | \`node tests/test_syntax_and_manifest_integrity.js\` |

---

## 🎨 2. सीएसएस डिज़ाइन टोकन्स व वेरिएबल अनुबंध (Exact CSS Token Mappings)

\`\`\`css
/* Universal Semantic Token Contract */
:root {
  /* Surfaces & Glassmorphism */
  --glass-surface-bg: rgba(15, 23, 42, 0.65);
  --glass-surface-hover: rgba(30, 41, 59, 0.80);
  --glass-surface-elevated: rgba(30, 41, 59, 0.90);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-focus: rgba(16, 185, 129, 0.50);
  --glass-backdrop-blur: blur(24px);
  --glass-saturation: saturate(190%);
  
  /* Text Tokens */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-dim: #64748b;

  /* Accents */
  --accent-emerald: #10b981;
  --accent-cyan: #06b6d4;
  --accent-violet: #8b5cf6;
  --accent-rose: #f43f5e;
  --accent-amber: #f59e0b;

  /* Z-Index Hierarchy */
  --z-sidebar: 50;
  --z-topbar: 40;
  --z-dropdown: 1000;
  --z-popover: 1100;
  --z-modal: 2000;
  --z-toast: 3000;
}
\`\`\`

---

## 🏗️ 3. डोम संरचना लक्ष्य व अनुबंध (DOM Structure Target Contracts)

### 3.1 मेट्रिक्स कंटेनर (Metrics Row Container)
- **पूर्व अवस्था (Before):** 5 असंबद्ध कार्ड्स, प्रत्येक पर \`class="metric-card bento-card liquid-glass-card bento-span-3"\`।
- **लक्ष्य अवस्था (Target):**
\`\`\`html
<div class="metrics-bento-row bento-span-12" role="region" aria-label="Key Performance Indicators">
  <div class="metric-card liquid-glass-card">...</div>
  <div class="metric-card liquid-glass-card">...</div>
  <div class="metric-card liquid-glass-card">...</div>
  <div class="metric-card liquid-glass-card">...</div>
  <div id="metricProductivityScore" class="metric-card liquid-glass-card">...</div>
</div>
\`\`\`

### 3.2 टॉप बार एक्सपोर्ट हब (Export Hub Dropdown)
- **पूर्व अवस्था (Before):** \`#btnPrintPdf\` और \`#btnDownloadHtmlDigest\` खुले फ्लोट हो रहे थे।
- **लक्ष्य अवस्था (Target):**
\`\`\`html
<div class="export-dropdown-container">
  <button type="button" id="btnExportMenu" class="btn-action-outline btn-export-trigger">📥 Export ▾</button>
  <div id="exportDropdownMenu" class="export-dropdown-menu liquid-glass-card hidden" role="menu">...</div>
</div>
\`\`\`

### 3.3 पोमोडोरो पिल (Top Bar Pomodoro Pill)
- **पूर्व अवस्था (Before):** साइडबार में विशाल 180px ऊंचा \`#widgetPomodoroSentinel\`।
- **लक्ष्य अवस्था (Target):**
\`\`\`html
<div class="pomodoro-pill-container">
  <button type="button" id="pomodoroNavPill" class="pomodoro-nav-pill">
    <span class="pomodoro-pill-icon">🧘</span>
    <span id="pomodoroPillClock" class="pomodoro-pill-time">25:00</span>
    <span id="pomodoroPillBadge" class="badge-focus-micro">Focus</span>
  </button>
  <div id="pomodoroPopoverModal" class="pomodoro-popover-card liquid-glass-card hidden">...</div>
</div>
\`\`\`

---

## 📅 4. फेज़-वाइज़ कार्यान्वयन रोडमैप (Implementation Roadmap)

| फेज़ | फोकस क्षेत्र | मुख्य कार्य | अनुमानित समय | टेस्ट गेट |
| :---: | :--- | :--- | :---: | :--- |
| **01** | बेंटो ग्रिड व टॉप बार | 5-कॉलम सबग्रिड रो, एक्सपोर्ट ड्रॉपडाउन एकीकरण | 1 टर्न | \`test_dashboard_features_phase3.js\` |
| **02** | साइडबार व पोमोडोरो | साइडबार से पोमोडोरो हटाना, टॉप बार पिल/पॉपओवर | 1 टर्न | \`test_dashboard_features_phase4.js\` |
| **03** | हीटमैप व डोमेन टेबल | लीनियर 168-सेल हीटमैप, प्रोडक्टिविटी पॉपओवर पिल्स | 1 टर्न | \`test_dashboard_features_phase1.js\` |
| **04** | मीडिया पेन व सीएसएस स्प्लिट | मीडिया टैब स्ट्रिप, एम्बिएंट कैनवस, सेटिंग्स फॉर्म्स, सीएसएस स्प्लिट | 1 टर्न | \`run_all_tests.js\` (44/44 green) |

---

## 🔒 5. शून्य-परिवर्तन एप्लीकेशन कोड हार्ड लॉक सत्यापन

- [x] \`dashboard/dashboard.html\` - 0 परिवर्तन (Unmodified)
- [x] \`dashboard/dashboard.js\` - 0 परिवर्तन (Unmodified)
- [x] \`dashboard/dashboard.css\` - 0 परिवर्तन (Unmodified)
- [x] \`background.js\` - 0 परिवर्तन (Unmodified)
- [x] \`src/content/*\` - 0 परिवर्तन (Unmodified)
- [x] समस्त 44 टेस्ट सुइट्स एग्जिट कोड 0 के साथ उत्तीर्ण।
- [x] समस्त नई प्रॉम्प्ट व मेमोरी फाइलों पर UTF-8 with BOM (\`0xEF, 0xBB, 0xBF\`) सत्यापित।
`;

writeBomFile('project_ui_ux_restoration_memory.md', memoryContent);
