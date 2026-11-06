/**
 * Web Activity & Media Sentinel - Full-Page Dashboard Script
 * Enterprise Multi-Tab Analytics, Reactive Storage Sync, Switch to Media Tab, and Centralized Language System (EN / HI)
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const browserAPI = typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime 
  ? globalThis.browser 
  : globalThis.chrome;

// Suppress benign connection errors when service worker wakes/sleeps
if (typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('unhandledrejection', (event) => {
    const msg = (event && event.reason && (event.reason.message || String(event.reason))) || '';
    if (
      msg.includes('Could not establish connection') ||
      msg.includes('Receiving end does not exist') ||
      msg.includes('message port closed') ||
      msg.includes('Extension context invalidated')
    ) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }
  });
}

function safeRuntimeSendMessage(message, callback) {
  try {
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
      const p = browserAPI.runtime.sendMessage(message, (res) => {
        const err = browserAPI.runtime.lastError;
        if (callback && typeof callback === 'function') {
          try { callback(res, err); } catch (_) {}
        }
      });
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
      return p;
    }
  } catch (_) {}
  return null;
}

// Color Palette for SVG Donut slices and progress bars
const PALETTE = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#64748b'  // Muted Slate
];

const DONUT_RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS; // ~565.487

// Strict 0.25x speed stepping ladder (0.25x min, 2.0x max per user specification)
const SPEED_LADDER = [0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0];

function calculateNextLadderSpeed(currentSpeed, direction) {
  const cur = (typeof currentSpeed === 'number' && !isNaN(currentSpeed) && currentSpeed > 0)
    ? Math.round(currentSpeed * 100) / 100
    : 1.0;

  let closestIdx = 3; // default 1.0
  let minDiff = Infinity;
  for (let i = 0; i < SPEED_LADDER.length; i++) {
    const diff = Math.abs(SPEED_LADDER[i] - cur);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }

  let nextIdx;
  if (direction === 'down' || direction === -1) {
    nextIdx = Math.max(0, closestIdx - 1);
  } else {
    nextIdx = Math.min(SPEED_LADDER.length - 1, closestIdx + 1);
  }
  return SPEED_LADDER[nextIdx];
}

// =============================================================================
// Centralized Language System (English by Default, Clean Hindi Switchable)
// =============================================================================

const DASHBOARD_I18N = {
  en: {
    // Brand & Header
    brand_edition: 'Enterprise Analytics',
    hud_offline: 'HUD Offline (Disconnected)',
    hud_connected: 'HUD Online (Connected)',
    hud_starting: 'Starting HUD...',
    btn_reconnect_hud: '⚡ Reconnect HUD',
    btn_hud_connected: '🟢 HUD Connected',
    btn_starting_hud: '⏳ Starting HUD...',
    btn_refresh: 'Refresh',
    lang_btn_text: 'English',
    lang_btn_title: 'Switch to Hindi',
    
    // Sidebar Tabs
    nav_tracking: 'Time Tracking',
    nav_media: 'Media Analytics',
    nav_settings: 'Settings & Data',
    
    // App Bar Headers
    title_tracking: '⏱️ Time Tracking Analytics',
    sub_tracking: 'Detailed breakdown of daily browsing time and website usage',
    title_media: '🎬 Media Analytics & Playback History',
    sub_media: 'Video playback sessions, volume telemetry, resolution and live controls',
    title_settings: '⚙️ Settings & Data Management',
    sub_settings: 'Extension preferences, data export (JSON/CSV) and reset options',
    
    // Tab A: Metrics
    metric_today: "Today's Browsing Time",
    metric_today_sub: 'Active browser sessions',
    metric_daily: 'Daily Average',
    metric_daily_sub: (days) => `Average over past ${days} day${days > 1 ? 's' : ''}`,
    metric_total: 'Total Tracked Time',
    metric_total_sub: (date) => `Since ${date}`,
    metric_top_domain: 'Top Website',
    metric_top_sub: 'Most active domain',
    no_data: 'No data',
    
    // Tab A: Charts & Table
    heading_usage_dist: 'Website Usage Time Distribution',
    caption_usage_dist: 'Select time range: Today, Daily Average, or Total Time',
    subtab_today: '📅 Today',
    subtab_daily: '📈 Daily Avg',
    subtab_total: '🌐 Total Time',
    donut_center_today: "Today's Total Time",
    donut_center_daily: 'Daily Average Time',
    donut_center_total: 'Total Tracked Time',
    donut_empty: 'No browsing activity recorded',
    donut_empty_bg_media: 'No background media playback recorded',
    donut_empty_foreground: 'No foreground browsing recorded',
    others: 'Other Websites',
    top_breakdown: 'Top Activity Breakdown',
    no_data_available: 'No data available',
    
    // Table
    domain_table_heading: 'Domain Breakdown Table',
    domain_count_suffix: (n) => `${n} domain${n === 1 ? '' : 's'}`,
    search_domain_placeholder: 'Search domain (e.g. youtube, github)...',
    no_matching_domain: 'No matching domains found.',
    sort_by: 'Sort by:',
    sort_time_desc: 'Time: High to Low',
    sort_time_asc: 'Time: Low to High',
    sort_sessions_desc: 'Sessions: High to Low',
    sort_name_asc: 'Domain Name (A to Z)',
    th_domain: 'Website / Domain',
    th_time: 'Time Spent',
    th_ratio: 'Ratio',
    th_sessions: 'Sessions',
    th_last_active: 'Last Active',
    domain_empty: 'No browsing activity recorded yet. Browse any website to start tracking!',
    empty_bg_media: 'No background media playback recorded yet for this period. Play audio or video in a background tab (e.g. YouTube, Spotify) to see background playback time here!',
    empty_foreground: 'No active foreground browsing recorded yet for this period. Browse any website in active focus to start tracking!',
    session_unit: (n) => `${n} session${n === 1 ? '' : 's'}`,
    
    // Tab B: Media Analytics
    media_metric_total: 'Total Video Watch Time',
    media_metric_total_sub: 'Total Watch Time',
    media_metric_avg: 'Avg Watch Time per Video',
    media_metric_avg_sub: 'Average per Video',
    media_metric_avg_vol: 'Average Volume',
    media_metric_avg_vol_sub: 'Average Volume Level',
    media_metric_peak_vol: 'Peak Volume',
    media_metric_peak_vol_sub: 'Highest Recorded Volume',
    media_metric_low_vol: 'Lowest Volume',
    media_metric_low_vol_sub: 'Lowest Recorded Volume',
    media_metric_sessions: 'Total Media Sessions',
    media_metric_sessions_sub: 'Tracked Sessions',
    
    // Hero Player
    player_hero_heading: 'Live Media Player Status',
    status_idle: '⚪ Idle - No Media',
    status_playing: '🟢 Playing',
    status_paused: '⏸️ Paused',
    status_buffering: '⏳ Buffering',
    status_muted: '🔇 Muted Playing',
    btn_rewind_10: '⏪ -10s',
    btn_forward_10: '⏩ +10s',
    btn_play: '▶️ Play',
    btn_pause: '⏸️ Pause',
    btn_mute: '🔇 Mute',
    btn_unmute: '🔊 Unmute',
    live_volume: 'Live Volume:',
    fullscreen: 'Fullscreen',
    pip: 'Pop-up PiP',
    theater: 'Theater Mode',
    switch_tab: 'Switch to Tab',
    switch_tab_title: 'Focus active media tab',
    quality: 'Quality',
    idle_hero_heading: 'No Media Currently Playing',
    idle_hero_sub: 'Play YouTube, Netflix, Hotstar or any media in any browser tab. Live status and controls will appear here.',
    
    // Media History Table
    media_history_heading: 'Media Playback History',
    media_count_suffix: (n) => `${n} video record${n === 1 ? '' : 's'}`,
    search_media_placeholder: 'Search video title or platform...',
    lbl_platform: 'Platform:',
    plat_all: 'All Platforms',
    plat_other: 'Other Websites',
    lbl_sort: 'Sort by:',
    sort_latest: 'Latest First',
    sort_longest: 'Longest Duration',
    sort_highest_vol: 'Highest Volume',
    sort_title_az: 'Title (A to Z)',
    th_media_title: 'Video Title',
    th_media_platform: 'Platform',
    th_media_duration: 'Watch Duration',
    th_media_vol: 'Volume Profile',
    th_media_res: 'Resolution',
    th_media_date: 'Date & Time',
    media_empty: 'No media playback history recorded yet.',
    
    // Tab C: Settings
    general_settings_heading: 'General Settings',
    general_settings_sub: 'Timeout, language, auto-connect and telemetry options',
    lbl_idle_timeout: 'Idle Timeout Buffer',
    desc_idle_timeout: 'Duration before tracking pauses when user is idle',
    lbl_language: 'Language Preference',
    desc_language: 'Display language for Dashboard and Extension Popup',
    lbl_ws_url: 'Video Detector HUD WebSocket URL',
    desc_ws_url: 'Local telemetry bridge communication port',
    btn_test_reconnect: '⚡ Test / Reconnect',
    lbl_media_toggle: 'Media Sentinel Telemetry',
    desc_media_toggle: 'Record web video, resolution, volume and playback sessions',
    lbl_auto_ws: 'Auto-Connect to HUD',
    desc_auto_ws: 'Automatically connect to HUD when browser starts',
    lbl_retention: 'History Retention Window',
    desc_retention: 'Number of days to preserve data in local storage',
    btn_save_settings: '💾 Save & Sync Settings',
    
    // Export
    export_card_heading: 'Export Data',
    export_card_sub: 'Download tracking metrics and media history as JSON or CSV',
    export_json_title: 'Full Master Export',
    export_json_desc: 'Download all browsing time, daily metrics, settings and media history into a JSON file.',
    btn_download_json: '📥 Download JSON',
    export_tracking_csv_title: 'Time Tracking CSV',
    export_tracking_csv_desc: 'Export website domains, time spent, session counts and timestamps for Excel or spreadsheets.',
    btn_download_tracking_csv: '📊 Download CSV (Time Tracking)',
    export_media_csv_title: 'Media History CSV',
    export_media_csv_desc: 'Export video titles, platforms, watch durations, volume profiles, resolutions and timestamps.',
    btn_download_media_csv: '🎬 Download CSV (Media History)',
    
    // Danger Zone
    danger_heading: 'Danger Zone: Data Management',
    danger_sub: 'Protected action zone for irreversible data resets',
    danger_notice: 'Important Notice: Deleting data is permanent and cannot be undone. Please export necessary data first.',
    clear_media_title: 'Clear Media History Only',
    clear_media_desc: 'All recorded video playback sessions and volume telemetry will be erased. Time tracking remains safe.',
    btn_clear_media: '🗑️ Clear Media History',
    clear_time_title: 'Clear Time Tracking Only',
    clear_time_desc: 'All domain browsing durations and session logs will be erased. Media history remains safe.',
    btn_clear_time: '🗑️ Clear Time Tracking',
    wipe_all_title: 'Wipe All Extension Data',
    wipe_all_desc: 'All local data, domain tracking, and media history will be permanently deleted.',
    btn_wipe_all: '💥 Full Reset',
    
    // Modal
    modal_title_delete: 'Confirm Data Deletion',
    modal_cancel: 'Cancel',
    modal_confirm: 'Confirm Delete',
    modal_clear_media_msg: 'Are you sure you want to permanently erase all recorded video playback history and volume profiles? Time tracking will remain safe.',
    modal_clear_time_msg: 'Are you sure you want to permanently delete all website time tracking and daily statistics? Media history will remain safe.',
    modal_wipe_all_msg: 'WARNING: This will permanently wipe all extension data, domain time tracking, and media history. Do you wish to proceed?',
    
    // Toasts
    toast_settings_saved: 'Settings saved and synchronized successfully',
    toast_refreshed: 'Dashboard data refreshed successfully',
    toast_hud_already: 'HUD is already connected',
    toast_hud_launching: 'Launching Desktop HUD...',
    toast_hud_connected: 'Video Detector HUD connected successfully!',
    toast_hud_failed: 'Could not connect to HUD',
    toast_json_downloaded: 'Master JSON backup downloaded successfully',
    toast_tracking_csv_downloaded: 'Time tracking CSV downloaded successfully',
    toast_media_csv_downloaded: 'Media history CSV downloaded successfully',
    toast_media_cleared: 'Media history permanently deleted',
    toast_time_cleared: 'Time tracking data permanently deleted',
    toast_all_wiped: 'All extension data and history wiped successfully',
    toast_switched_tab: 'Focused active media tab',
    toast_no_media_tab: 'No active media tab found',
    toast_lang_changed: 'Language set to English'
  },
  hi: {
    // Brand & Header
    brand_edition: 'एंटरप्राइज एनालिटिक्स',
    hud_offline: 'HUD ऑफलाइन (डिस्कनेक्टेड)',
    hud_connected: 'HUD ऑनलाइन (कनेक्टेड)',
    hud_starting: 'HUD शुरू हो रहा है...',
    btn_reconnect_hud: '⚡ HUD रीकनेक्ट करें',
    btn_hud_connected: '🟢 HUD कनेक्टेड है',
    btn_starting_hud: '⏳ HUD शुरू हो रहा है...',
    btn_refresh: 'रीफ्रेश',
    lang_btn_text: 'हिंदी',
    lang_btn_title: 'Switch to English',
    
    // Sidebar Tabs
    nav_tracking: 'टाइम ट्रैकिंग',
    nav_media: 'मीडिया एनालिटिक्स',
    nav_settings: 'सेटिंग्स व डेटा',
    
    // App Bar Headers
    title_tracking: '⏱️ टाइम ट्रैकिंग एनालिटिक्स',
    sub_tracking: 'दैनिक ब्राउज़िंग समय व वेबसाइट उपयोग का विस्तृत विश्लेषण',
    title_media: '🎬 मीडिया एनालिटिक्स व प्लेबैक इतिहास',
    sub_media: 'वीडियो प्लेबैक सत्र, वॉल्यूम आंकड़े, रिज़ॉल्यूशन व लाइव प्लेयर कंट्रोल्स',
    title_settings: '⚙️ सेटिंग्स व डेटा प्रबंधन',
    sub_settings: 'एक्सटेंशन प्राथमिकताएं, डेटा निर्यात (JSON/CSV) व सुरक्षित रीसेट ज़ोन',
    
    // Tab A: Metrics
    metric_today: 'आज का ब्राउज़िंग समय',
    metric_today_sub: 'सक्रिय ब्राउज़र सत्र',
    metric_daily: 'दैनिक औसत',
    metric_daily_sub: (days) => `पिछले ${days} दिन का औसत`,
    metric_total: 'कुल ट्रैक किया गया समय',
    metric_total_sub: (date) => `${date} से अब तक`,
    metric_top_domain: 'शीर्ष वेबसाइट',
    metric_top_sub: 'सर्वाधिक समय व्यतीत',
    no_data: 'कोई डेटा नहीं',
    
    // Tab A: Charts & Table
    heading_usage_dist: 'वेबसाइट उपयोग समय वितरण',
    caption_usage_dist: 'समय सीमा चुनें: आज, दैनिक औसत या कुल समय',
    subtab_today: '📅 आज',
    subtab_daily: '📈 दैनिक औसत',
    subtab_total: '🌐 कुल समय',
    donut_center_today: 'आज का कुल समय',
    donut_center_daily: 'दैनिक औसत समय',
    donut_center_total: 'कुल ट्रैक किया गया समय',
    donut_empty: 'ब्राउज़िंग गतिविधि उपलब्ध नहीं है',
    donut_empty_bg_media: 'कोई पृष्ठभूमि मीडिया गतिविधि दर्ज नहीं है',
    donut_empty_foreground: 'कोई फ़ोरग्राउंड ब्राउज़िंग गतिविधि दर्ज नहीं है',
    others: 'अन्य वेबसाइट्स',
    top_breakdown: 'शीर्ष वेबसाइट्स समय अनुपात',
    no_data_available: 'कोई डेटा उपलब्ध नहीं है',
    
    // Table
    domain_table_heading: 'विस्तृत डोमेन उपयोग सूची',
    domain_count_suffix: (n) => `${n} डोमेन`,
    search_domain_placeholder: 'डोमेन खोजें...',
    no_matching_domain: 'कोई मेल खाता डोमेन नहीं मिला।',
    sort_by: 'क्रमबद्ध करें:',
    sort_time_desc: 'सर्वाधिक समय',
    sort_time_asc: 'न्यूनतम समय',
    sort_sessions_desc: 'सर्वाधिक सत्र',
    sort_name_asc: 'डोमेन नाम (A से Z)',
    th_domain: 'वेबसाइट / डोमेन',
    th_time: 'व्यतीत समय',
    th_ratio: 'प्रतिशत',
    th_sessions: 'सत्र संख्या',
    th_last_active: 'अंतिम सक्रिय',
    domain_empty: 'कोई डोमेन डेटा नहीं मिला। ब्राउज़िंग शुरू करने पर यहाँ आंकड़े दिखाई देंगे।',
    empty_bg_media: 'इस अवधि के लिए कोई पृष्ठभूमि मीडिया (Background Media) प्लेबैक रिकॉर्ड नहीं हुआ है। समय देखने के लिए बैकग्राउंड टैब में मीडिया (जैसे YouTube, Spotify) चलाएं!',
    empty_foreground: 'इस अवधि के लिए कोई सक्रिय फ़ोरग्राउंड ब्राउज़िंग गतिविधि दर्ज नहीं है। ट्रैकिंग शुरू करने के लिए कोई वेबसाइट खोलें!',
    session_unit: (n) => `${n} सत्र`,
    
    // Tab B: Media Analytics
    media_metric_total: 'कुल वीडियो देखा गया समय',
    media_metric_total_sub: 'कुल देखने की अवधि',
    media_metric_avg: 'औसत देखने का समय (प्रति वीडियो)',
    media_metric_avg_sub: 'प्रति वीडियो औसत अवधि',
    media_metric_avg_vol: 'औसत वॉल्यूम स्तर',
    media_metric_avg_vol_sub: 'रिकॉर्ड किया गया औसत वॉल्यूम',
    media_metric_peak_vol: 'उच्चतम वॉल्यूम',
    media_metric_peak_vol_sub: 'उच्चतम रिकॉर्ड किया गया स्तर',
    media_metric_low_vol: 'न्यूनतम वॉल्यूम',
    media_metric_low_vol_sub: 'न्यूनतम रिकॉर्ड किया गया स्तर',
    media_metric_sessions: 'कुल मीडिया सत्र',
    media_metric_sessions_sub: 'ट्रैक किए गए कुल सत्र',
    
    // Hero Player
    player_hero_heading: 'लाइव मीडिया प्लेयर स्थिति',
    status_idle: '⚪ स्टैंडबाय - कोई मीडिया नहीं',
    status_playing: '🟢 चल रहा है',
    status_paused: '⏸️ रुका हुआ',
    status_buffering: '⏳ बफरिंग',
    status_muted: '🔇 म्यूट पर चल रहा है',
    btn_rewind_10: '⏪ -10s',
    btn_forward_10: '⏩ +10s',
    btn_play: '▶️ प्ले',
    btn_pause: '⏸️ पॉज़',
    btn_mute: '🔇 म्यूट',
    btn_unmute: '🔊 अनम्यूट',
    live_volume: 'लाइव वॉल्यूम:',
    fullscreen: 'फुल स्क्रीन',
    pip: 'पॉप-अप PiP',
    theater: 'थिएटर मोड',
    switch_tab: 'टैब पर जाएं',
    switch_tab_title: 'सक्रिय मीडिया टैब पर स्विच करें',
    quality: 'क्वालिटी',
    idle_hero_heading: 'कोई लाइव मीडिया सक्रिय नहीं है',
    idle_hero_sub: 'ब्राउज़र में किसी भी टैब पर YouTube, Netflix या अन्य मीडिया चलाएं। उसका लाइव स्टेटस और कंट्रोल्स यहाँ दिखाई देंगे।',
    
    // Media History Table
    media_history_heading: 'विस्तृत मीडिया इतिहास',
    media_count_suffix: (n) => `${n} वीडियो रिकॉर्ड`,
    search_media_placeholder: 'वीडियो शीर्षक या प्लेटफॉर्म खोजें...',
    lbl_platform: 'प्लेटफ़ॉर्म:',
    plat_all: 'सभी प्लेटफॉर्म',
    plat_other: 'अन्य वेबसाइट्स',
    lbl_sort: 'क्रमबद्ध:',
    sort_latest: 'नवीनतम पहले',
    sort_longest: 'सर्वाधिक देखा गया',
    sort_highest_vol: 'उच्चतम वॉल्यूम',
    sort_title_az: 'शीर्षक (A से Z)',
    th_media_title: 'वीडियो शीर्षक',
    th_media_platform: 'प्लेटफ़ॉर्म',
    th_media_duration: 'देखा गया समय',
    th_media_vol: 'वॉल्यूम प्रोफाइल',
    th_media_res: 'रिज़ॉल्यूशन',
    th_media_date: 'दिनांक व समय',
    media_empty: 'कोई मीडिया प्लेबैक इतिहास दर्ज नहीं है। वीडियो चलाने पर इतिहास यहाँ स्वचालित रूप से जुड़ जाएगा।',
    
    // Tab C: Settings
    general_settings_heading: 'सामान्य एक्सटेंशन सेटिंग्स',
    general_settings_sub: 'टाइमआउट, भाषा, ऑटो-कनेक्ट व टेलीमेट्री विकल्प',
    lbl_idle_timeout: 'निष्क्रियता टाइमआउट बफर',
    desc_idle_timeout: 'कंप्यूटर में कोई गतिविधि न होने पर ट्रैकिंग रोकने की अवधि',
    lbl_language: 'भाषा चयन (Language Preference)',
    desc_language: 'डैशबोर्ड व एक्सटेंशन पॉपअप की भाषा',
    lbl_ws_url: 'Video Detector HUD WebSocket URL',
    desc_ws_url: 'स्थानीय HUD के साथ रियल-टाइम टेलीमेट्री संचार पोर्ट',
    btn_test_reconnect: '⚡ टेस्ट / Reconnect',
    lbl_media_toggle: 'सक्रिय मीडिया टेलीमेट्री ट्रैकिंग',
    desc_media_toggle: 'वेब वीडियो, रिज़ॉल्यूशन, वॉल्यूम व प्लेबैक सत्रों को रिकॉर्ड करना',
    lbl_auto_ws: 'ऑटो-रीकनेक्ट WebSocket',
    desc_auto_ws: 'ब्राउज़र शुरू होते ही स्वतः HUD से संपर्क स्थापित करें',
    lbl_retention: 'डेटा संरक्षण अवधि',
    desc_retention: 'स्थानीय स्टोरेज में कितने दिनों का डेटा सुरक्षित रखना है',
    btn_save_settings: '💾 सेटिंग्स सहेजें',
    
    // Export
    export_card_heading: 'डेटा निर्यात',
    export_card_sub: 'ट्रैकिंग डेटा और मीडिया इतिहास को JSON या CSV में डाउनलोड करें',
    export_json_title: 'संपूर्ण डेटा निर्यात',
    export_json_desc: 'सभी टाइम ट्रैकिंग, दैनिक आंकड़े, सेटिंग्स और मीडिया इतिहास को एक संपूर्ण JSON फाइल में डाउनलोड करें।',
    btn_download_json: '📥 डाउनलोड JSON',
    export_tracking_csv_title: 'टाइम ट्रैकिंग CSV',
    export_tracking_csv_desc: 'वेबसाइट डोमेन, आज का समय, कुल समय, सत्र संख्या और अंतिम सक्रियता को एक्सेल के लिए डाउनलोड करें।',
    btn_download_tracking_csv: '📊 डाउनलोड CSV (Time Tracking)',
    export_media_csv_title: 'मीडिया इतिहास CSV',
    export_media_csv_desc: 'वीडियो शीर्षक, प्लेटफॉर्म, देखे जाने की अवधि, औसत वॉल्यूम, रिज़ॉल्यूशन व टाइमस्टैम्प डाउनलोड करें।',
    btn_download_media_csv: '🎬 डाउनलोड CSV (Media History)',
    
    // Danger Zone
    danger_heading: 'डेंजर ज़ोन: डेटा प्रबंधन व रीसेट',
    danger_sub: 'सुरक्षित डेटा मिटाने का सेक्शन',
    danger_notice: 'चेतावनी: यहाँ से डेटा हटाना एक अपरिवर्तनीय क्रिया है। पुराना डेटा पुनः प्राप्त नहीं किया जा सकता। कृपया हटाने से पहले आवश्यक डेटा निर्यात कर लें।',
    clear_media_title: 'केवल मीडिया प्लेबैक इतिहास मिटाएं',
    clear_media_desc: 'सभी रिकॉर्ड किए गए वीडियो प्लेबैक सत्र और वॉल्यूम आंकड़े मिट जाएंगे। टाइम ट्रैकिंग सुरक्षित रहेगी।',
    btn_clear_media: '🗑️ मीडिया इतिहास साफ़ करें',
    clear_time_title: 'केवल वेबसाइट टाइम ट्रैकिंग मिटाएं',
    clear_time_desc: 'सभी डोमेन ब्राउज़िंग समय और सत्र इतिहास मिट जाएंगे। मीडिया इतिहास सुरक्षित रहेगा।',
    btn_clear_time: '🗑️ टाइम ट्रैकिंग साफ़ करें',
    wipe_all_title: 'संपूर्ण डेटा रीसेट करें',
    wipe_all_desc: 'एक्सटेंशन का समस्त स्थानीय डेटा, डोमेन ट्रैकिंग व मीडिया इतिहास तुरंत हमेशा के लिए साफ़ हो जाएगा।',
    btn_wipe_all: '💥 संपूर्ण डेटा वाइप करें',
    
    // Modal
    modal_title_delete: 'डेटा मिटाने की पुष्टि करें',
    modal_cancel: 'रद्द करें',
    modal_confirm: 'हाँ, मिटाएं',
    modal_clear_media_msg: 'क्या आप वाकई सभी रिकॉर्ड किए गए वीडियो प्लेबैक सत्र और वॉल्यूम आंकड़ों को मिटाना चाहते हैं? टाइम ट्रैकिंग सुरक्षित रहेगी।',
    modal_clear_time_msg: 'क्या आप वाकई सभी डोमेन ब्राउज़िंग समय व दैनिक आंकड़ों को साफ़ करना चाहते हैं? मीडिया इतिहास सुरक्षित रहेगा।',
    modal_wipe_all_msg: 'चेतावनी: यह क्रिया एक्सटेंशन का सारा डेटा, टाइम ट्रैकिंग व मीडिया इतिहास तुरंत हमेशा के लिए साफ़ कर देगी। क्या आप सहमत हैं?',
    
    // Toasts
    toast_settings_saved: 'सेटिंग्स सफलतापूर्वक सहेजी गईं और एक्सटेंशन से सिंक हो गईं',
    toast_refreshed: 'डैशबोर्ड डेटा पूर्णतः रीफ्रेश हो गया',
    toast_hud_already: 'HUD पहले से कनेक्टेड है',
    toast_hud_launching: 'Video Detector HUD लॉन्च हो रहा है...',
    toast_hud_connected: 'Video Detector HUD सफलतापूर्वक कनेक्ट हो गया!',
    toast_hud_failed: 'HUD शुरू नहीं हो सका या कनेक्ट नहीं हुआ',
    toast_json_downloaded: 'संपूर्ण मास्टर डेटा JSON डाउनलोड हो गया',
    toast_tracking_csv_downloaded: 'टाइम ट्रैकिंग CSV डाउनलोड हो गया',
    toast_media_csv_downloaded: 'मीडिया इतिहास CSV डाउनलोड हो गया',
    toast_media_cleared: 'मीडिया प्लेबैक इतिहास मिटा दिया गया',
    toast_time_cleared: 'वेबसाइट टाइम ट्रैकिंग डेटा मिटा दिया गया',
    toast_all_wiped: 'एक्सटेंशन का समस्त डेटा व इतिहास पूर्णतः रीसेट हो चुका है',
    toast_switched_tab: 'सक्रिय मीडिया टैब पर स्विच किया गया',
    toast_no_media_tab: 'कोई सक्रिय मीडिया टैब नहीं मिला',
    toast_lang_changed: 'भाषा बदलकर हिन्दी कर दी गई'
  }
};

let currentLang = 'en';

function t(key, ...args) {
  const dict = DASHBOARD_I18N[currentLang] || DASHBOARD_I18N.en;
  let val = dict[key] || DASHBOARD_I18N.en[key] || key;
  if (typeof val === 'function') {
    return val(...args);
  }
  return val;
}

// Global Dashboard State
let currentTab = 'tracking'; // 'tracking' | 'media' | 'settings'
let temporalSubtab = 'today'; // 'today' | 'daily' | 'total'
let dashboardData = null;
let mediaHistoryData = [];
let selectedBrowser = 'all'; // 'all' | 'chrome' | 'edge' | 'brave' | 'opera'
let selectedTrackingMode = 'all'; // 'all' (Combined) | 'foreground' (Active Only) | 'background_media' (Media Only)
let selectedDomainCategory = 'all'; // 'all' | 'web' | 'internal'

function isInternalDomain(domain) {
  if (!domain) return false;
  let d = String(domain).toLowerCase().trim();
  if (d.startsWith('http://') || d.startsWith('https://')) {
    try {
      d = new URL(d).hostname.toLowerCase();
    } catch (_) {
      d = d.replace(/^https?:\/\//, '').split('/')[0];
    }
  }
  const hostWithoutPort = d.replace(/^\[([^\]]+)\](?::\d+)?$/, '$1').split(':')[0];
  return (
    d === 'chrome' ||
    d === 'edge' ||
    d === 'about' ||
    d === 'newtab' ||
    d === 'dashboard' ||
    d === 'extension' ||
    hostWithoutPort === '127.0.0.1' ||
    hostWithoutPort === 'localhost' ||
    hostWithoutPort === '0.0.0.0' ||
    hostWithoutPort === '::1' ||
    d.startsWith('127.0.0.1') ||
    d.startsWith('localhost') ||
    d.startsWith('0.0.0.0') ||
    d.startsWith('[::1]') ||
    d.startsWith('chrome://') ||
    d.startsWith('edge://') ||
    d.startsWith('about:') ||
    d.startsWith('chrome-extension://') ||
    d.startsWith('edge-extension://') ||
    d.startsWith('moz-extension://') ||
    d.startsWith('extension:')
  );
}
let dataHubConnected = false;
let dataHubAnalytics = null;
let detectedBrowserType = 'chrome';
let cachedSettings = {
  idleThresholdSeconds: 60,
  wsUrl: 'ws://127.0.0.1:65432',
  autoConnectWs: true,
  mediaTrackingEnabled: true,
  notificationsEnabled: true,
  historyRetentionDays: 60,
  theme: 'dark',
  language: 'en'
};

let domainSearchQuery = '';
let domainSortMode = 'time_desc';

let mediaSearchQuery = '';
let mediaPlatformFilter = 'all';
let mediaSortMode = 'time_desc';

let pendingDangerAction = null; // for modal confirmation
let isDraggingHeroVolume = false;

// =============================================================================
// Helper Formatting Functions
// =============================================================================

function formatDuration(totalSeconds) {
  const sec = Math.max(0, Math.round(totalSeconds || 0));
  if (sec === 0) return '0s';

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(remainingSec).padStart(2, '0')}s`;
  }
  return `${remainingSec}s`;
}

function formatDigitalTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
}

function formatTimestamp(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  const locale = (currentLang === 'hi') ? 'hi-IN' : 'en-US';
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, isDanger = false) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');

  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  iconEl.textContent = isDanger ? '⚠️' : '✅';
  if (isDanger) {
    toast.classList.add('danger');
  } else {
    toast.classList.remove('danger');
  }
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

// =============================================================================
// Language Application & Synchronization
// =============================================================================

function applyDashboardLanguage(lang) {
  currentLang = (lang === 'hi') ? 'hi' : 'en';
  document.documentElement.lang = currentLang;

  const setTxt = (id, key, ...args) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key, ...args);
  };
  const setTitle = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.title = t(key);
  };

  // Header & Brand
  setTxt('brandEditionLabel', 'brand_edition');
  setTxt('btnGlobalRefreshText', 'btn_refresh');
  setTxt('langToggleText', 'lang_btn_text');
  setTitle('btnLangToggle', 'lang_btn_title');

  // Sidebar navigation
  setTxt('navTrackingText', 'nav_tracking');
  setTxt('navMediaText', 'nav_media');
  setTxt('navSettingsText', 'nav_settings');

  // Settings language dropdown value sync
  const settingLangSelect = document.getElementById('settingLanguage');
  if (settingLangSelect) settingLangSelect.value = currentLang;

  // Active top bar headers
  switchTab(currentTab);

  // Tab A static texts
  setTxt('lblMetricToday', 'metric_today');
  setTxt('lblMetricTodaySub', 'metric_today_sub');
  setTxt('lblMetricDaily', 'metric_daily');
  setTxt('lblMetricTotal', 'metric_total');
  setTxt('lblMetricTopDomain', 'metric_top_domain');
  setTxt('lblMetricTopDomainTime', 'metric_top_sub');

  setTxt('headingUsageDist', 'heading_usage_dist');
  setTxt('captionUsageDist', 'caption_usage_dist');
  setTxt('subtabTodayText', 'subtab_today');
  setTxt('subtabDailyText', 'subtab_daily');
  setTxt('subtabTotalText', 'subtab_total');
  setTxt('headingTopBreakdown', 'top_breakdown');

  setTxt('headingDomainTable', 'domain_table_heading');
  setTxt('lblTableSort', 'sort_by');
  const domSearch = document.getElementById('tableDomainSearch');
  if (domSearch) domSearch.placeholder = t('search_domain_placeholder');

  setTxt('thColDomain', 'th_domain');
  setTxt('thColTime', 'th_time');
  setTxt('thColRatio', 'th_ratio');
  setTxt('thColSessions', 'th_sessions');
  setTxt('thColLast', 'th_last_active');

  const emptyIconEl = document.querySelector('#domainTableEmptyState .empty-icon');
  const emptyTextEl = document.getElementById('txtDomainEmpty');
  if (emptyTextEl) {
    if (domainSearchQuery) {
      if (emptyIconEl) emptyIconEl.textContent = '🔍';
      emptyTextEl.textContent = t('no_matching_domain');
    } else if (selectedTrackingMode === 'background_media') {
      if (emptyIconEl) emptyIconEl.textContent = '🎵';
      emptyTextEl.textContent = t('empty_bg_media');
    } else if (selectedTrackingMode === 'foreground') {
      if (emptyIconEl) emptyIconEl.textContent = '🖥️';
      emptyTextEl.textContent = t('empty_foreground');
    } else {
      if (emptyIconEl) emptyIconEl.textContent = '🌐';
      emptyTextEl.textContent = t('domain_empty');
    }
  }

  // Tab B static texts
  setTxt('lblMediaTotalWatch', 'media_metric_total');
  setTxt('subMediaTotalWatch', 'media_metric_total_sub');
  setTxt('lblMediaAvgWatch', 'media_metric_avg');
  setTxt('subMediaAvgWatch', 'media_metric_avg_sub');
  setTxt('lblMediaAvgVolume', 'media_metric_avg_vol');
  setTxt('subMediaAvgVolume', 'media_metric_avg_vol_sub');
  setTxt('lblMediaPeakVolume', 'media_metric_peak_vol');
  setTxt('subMediaPeakVolume', 'media_metric_peak_vol_sub');
  setTxt('lblMediaLowVolume', 'media_metric_low_vol');
  setTxt('subMediaLowVolume', 'media_metric_low_vol_sub');
  setTxt('lblMediaSessions', 'media_metric_sessions');
  setTxt('subMediaSessions', 'media_metric_sessions_sub');

  setTxt('headingPlayerHero', 'player_hero_heading');
  setTxt('lblHeroVolume', 'live_volume');
  setTxt('btnHeroFullscreenText', 'fullscreen');
  setTxt('btnHeroPipText', 'pip');
  setTxt('btnHeroTheaterText', 'theater');
  setTxt('btnHeroSwitchTabText', 'switch_tab');
  setTitle('btnHeroSwitchTab', 'switch_tab_title');

  setTxt('headingPlayerIdle', 'idle_hero_heading');
  setTxt('subPlayerIdle', 'idle_hero_sub');

  setTxt('headingMediaHistory', 'media_history_heading');
  const mediaSearch = document.getElementById('tableMediaSearch');
  if (mediaSearch) mediaSearch.placeholder = t('search_media_placeholder');
  setTxt('lblMediaPlatform', 'lbl_platform');
  setTxt('lblMediaSort', 'lbl_sort');

  setTxt('thColMediaTitle', 'th_media_title');
  setTxt('thColMediaPlatform', 'th_media_platform');
  setTxt('thColMediaDuration', 'th_media_duration');
  setTxt('thColMediaVolume', 'th_media_vol');
  setTxt('thColMediaRes', 'th_media_res');
  setTxt('thColMediaDate', 'th_media_date');
  setTxt('txtMediaEmpty', 'media_empty');

  // Tab C static texts
  setTxt('headingGeneralSettings', 'general_settings_heading');
  setTxt('subGeneralSettings', 'general_settings_sub');
  setTxt('lblSettingIdle', 'lbl_idle_timeout');
  setTxt('descSettingIdle', 'desc_idle_timeout');
  setTxt('lblSettingLanguage', 'lbl_language');
  setTxt('descSettingLanguage', 'desc_language');
  setTxt('lblSettingWsUrl', 'lbl_ws_url');
  setTxt('descSettingWsUrl', 'desc_ws_url');
  setTxt('btnTestWsConnection', 'btn_test_reconnect');
  setTxt('lblSettingMediaToggle', 'lbl_media_toggle');
  setTxt('descSettingMediaToggle', 'desc_media_toggle');
  setTxt('lblSettingAutoWs', 'lbl_auto_ws');
  setTxt('descSettingAutoWs', 'desc_auto_ws');
  setTxt('lblSettingHistoryDays', 'lbl_retention');
  setTxt('descSettingHistoryDays', 'desc_retention');
  setTxt('btnSaveGeneralSettings', 'btn_save_settings');

  setTxt('headingExportCard', 'export_card_heading');
  setTxt('subExportCard', 'export_card_sub');
  setTxt('titleExportJson', 'export_json_title');
  setTxt('descExportJson', 'export_json_desc');
  setTxt('titleExportTrackingCsv', 'export_tracking_csv_title');
  setTxt('descExportTrackingCsv', 'export_tracking_csv_desc');
  setTxt('titleExportMediaCsv', 'export_media_csv_title');
  setTxt('descExportMediaCsv', 'export_media_csv_desc');

  setTxt('headingDangerZone', 'danger_heading');
  setTxt('subDangerZone', 'danger_sub');
  setTxt('txtDangerNotice', 'danger_notice');
  setTxt('titleClearMedia', 'clear_media_title');
  setTxt('descClearMedia', 'clear_media_desc');
  setTxt('btnTriggerClearMedia', 'btn_clear_media');
  setTxt('titleClearTime', 'clear_time_title');
  setTxt('descClearTime', 'clear_time_desc');
  setTxt('btnTriggerClearTime', 'btn_clear_time');
  setTxt('titleWipeAll', 'wipe_all_title');
  setTxt('descWipeAll', 'wipe_all_desc');
  setTxt('btnTriggerWipeAll', 'btn_wipe_all');

  setTxt('modalTitle', 'modal_title_delete');
  setTxt('modalBtnCancel', 'modal_cancel');
  setTxt('modalBtnConfirm', 'modal_confirm');

  // Re-render active views
  if (dashboardData) {
    updateHUDStatus(Boolean(dashboardData.wsConnected));
    renderTimeTrackingTab(dashboardData);
    renderMediaAnalyticsTab(dashboardData);
  }
}

// =============================================================================
// Live Clock & HUD Status Indicator
// =============================================================================

function startLiveClock() {
  const clockEl = document.getElementById('liveClockText');
  function tick() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
  tick();
  setInterval(tick, 1000);
}

function updateHUDStatus(status) {
  const dot = document.getElementById('hudStatusDot');
  const label = document.getElementById('hudStatusLabel');
  const btn = document.getElementById('btnSidebarReconnect');
  if (!dot || !label) return;

  if (status === true || status === 'online') {
    dot.className = 'hud-dot online';
    label.textContent = t('hud_connected');
    label.style.color = '#10b981';
    if (btn) btn.textContent = t('btn_hud_connected');
  } else if (status === 'starting') {
    dot.className = 'hud-dot starting';
    label.textContent = t('hud_starting');
    label.style.color = '#f59e0b';
    if (btn) btn.textContent = t('btn_starting_hud');
  } else {
    dot.className = 'hud-dot offline';
    label.textContent = t('hud_offline');
    label.style.color = '#ef4444';
    if (btn) btn.textContent = t('btn_reconnect_hud');
  }
}

function updateDataHubStatus(isConnected, registeredBrowsers = []) {
  const badge = document.getElementById('dataHubBadge');
  const badgeText = document.getElementById('dataHubBadgeText');
  const sideDot = document.getElementById('dataHubSidebarDot');
  const sideLabel = document.getElementById('dataHubSidebarLabel');

  if (isConnected) {
    if (badge) {
      badge.className = 'datahub-status-badge online';
      const bList = (registeredBrowsers && registeredBrowsers.length > 0) ? ` [${registeredBrowsers.join(', ')}]` : '';
      badge.title = `Standalone SQLite Data Hub Connected (ws://127.0.0.1:65433)${bList}`;
    }
    if (badgeText) badgeText.textContent = 'Hub Active';
    if (sideDot) sideDot.className = 'hud-dot online';
    if (sideLabel) {
      sideLabel.textContent = 'Hub Online';
      sideLabel.style.color = '#10b981';
    }
  } else {
    if (badge) {
      badge.className = 'datahub-status-badge offline';
      badge.title = 'Standalone SQLite Data Hub is offline. Displaying local browser data.';
    }
    if (badgeText) badgeText.textContent = 'Hub Offline';
    if (sideDot) sideDot.className = 'hud-dot offline';
    if (sideLabel) {
      sideLabel.textContent = 'Hub Offline';
      sideLabel.style.color = '#ef4444';
    }
  }
}

// =============================================================================
// Primary Navigation Switching
// =============================================================================

function switchTab(tabKey) {
  currentTab = tabKey;

  // Sidebar Buttons
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabKey) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Panes
  const panes = {
    tracking: document.getElementById('paneTracking'),
    media: document.getElementById('paneMedia'),
    settings: document.getElementById('paneSettings')
  };

  Object.keys(panes).forEach(k => {
    if (panes[k]) {
      if (k === tabKey) {
        panes[k].classList.add('active');
      } else {
        panes[k].classList.remove('active');
      }
    }
  });

  // Top Bar Headers
  const titleEl = document.getElementById('topBarTitle');
  const subEl = document.getElementById('topBarSubtitle');

  if (tabKey === 'tracking') {
    titleEl.textContent = t('title_tracking');
    subEl.textContent = t('sub_tracking');
  } else if (tabKey === 'media') {
    titleEl.textContent = t('title_media');
    subEl.textContent = t('sub_media');
  } else if (tabKey === 'settings') {
    titleEl.textContent = t('title_settings');
    subEl.textContent = t('sub_settings');
  }
}

// =============================================================================
// TAB A: Time Tracking Processing & Rendering
// =============================================================================

/**
 * Safely extracts mode-specific seconds for a domain item.
 * Supports both SQLite Data Hub schema and local chrome.storage schema.
 * - all: d.combined_seconds || d.combinedSeconds || d.totalSeconds || d.seconds || 0
 * - foreground: d.foreground_seconds != null ? d.foreground_seconds : (d.foregroundSeconds != null ? d.foregroundSeconds : (d.seconds || 0))
 * - background_media: d.background_media_seconds != null ? d.background_media_seconds : (d.backgroundMediaSeconds != null ? d.backgroundMediaSeconds : 0)
 */
function getDomainSecondsForMode(d, mode = selectedTrackingMode) {
  if (!d) return 0;
  if (mode === 'foreground') {
    if (typeof d.foreground_seconds === 'number') return d.foreground_seconds;
    if (typeof d.foregroundSeconds === 'number') return d.foregroundSeconds;
    return d.seconds || d.totalSeconds || 0;
  }
  if (mode === 'background_media') {
    if (typeof d.background_media_seconds === 'number') return d.background_media_seconds;
    if (typeof d.backgroundMediaSeconds === 'number') return d.backgroundMediaSeconds;
    return 0;
  }
  // 'all' / Combined Total
  if (typeof d.combined_seconds === 'number') return d.combined_seconds;
  if (typeof d.combinedSeconds === 'number') return d.combinedSeconds;
  if (typeof d.totalSeconds === 'number') return d.totalSeconds;
  return d.seconds || 0;
}

function processTimeTrackingData(actData, temporalMode, todayStr) {
  if (!actData || !actData.domains) {
    return { items: [], totalSec: 0, todaySec: 0, dailyAvgSec: 0, topDomain: null };
  }

  const domains = actData.domains;
  const historyDays = Math.max(1, actData.historyDaysCount || 1);
  let totalTrackedSec = 0;
  let todayTotalSec = 0;
  const processedList = [];

  for (const [domainName, domainObj] of Object.entries(domains)) {
    const isInternal = isInternalDomain(domainName);
    if (selectedDomainCategory === 'web' && isInternal) continue;
    if (selectedDomainCategory === 'internal' && !isInternal) continue;

    const combinedTotalSec = domainObj.totalSeconds || 0;
    const fgTotalSec = (typeof domainObj.foregroundSeconds === 'number') ? domainObj.foregroundSeconds : combinedTotalSec;
    const bgMediaTotalSec = domainObj.backgroundMediaSeconds || 0;

    const todayObj = (domainObj.days && domainObj.days[todayStr]) || null;
    const combinedTodaySec = todayObj ? (todayObj.seconds || 0) : 0;
    const fgTodaySec = (todayObj && typeof todayObj.foregroundSeconds === 'number') ? todayObj.foregroundSeconds : combinedTodaySec;
    const bgMediaTodaySec = (todayObj && typeof todayObj.backgroundMediaSeconds === 'number') ? todayObj.backgroundMediaSeconds : 0;

    let targetTotalSec = combinedTotalSec;
    let targetTodaySec = combinedTodaySec;
    if (selectedTrackingMode === 'foreground') {
      targetTotalSec = fgTotalSec;
      targetTodaySec = fgTodaySec;
    } else if (selectedTrackingMode === 'background_media') {
      targetTotalSec = bgMediaTotalSec;
      targetTodaySec = bgMediaTodaySec;
    }

    totalTrackedSec += targetTotalSec;
    todayTotalSec += targetTodaySec;

    let computedSec = 0;
    if (temporalMode === 'today') {
      computedSec = targetTodaySec;
    } else if (temporalMode === 'daily') {
      computedSec = Math.round(targetTotalSec / historyDays);
    } else {
      computedSec = targetTotalSec;
    }

    if (computedSec > 0 || (selectedTrackingMode !== 'background_media' && temporalMode === 'total' && combinedTotalSec > 0)) {
      processedList.push({
        domain: domainName,
        favicon: domainObj.favicon || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainName)}&sz=32`,
        computedSeconds: computedSec,
        totalSeconds: targetTotalSec,
        foregroundSeconds: (temporalMode === 'today' ? fgTodaySec : fgTotalSec),
        backgroundMediaSeconds: (temporalMode === 'today' ? bgMediaTodaySec : bgMediaTotalSec),
        combinedSeconds: (temporalMode === 'today' ? combinedTodaySec : combinedTotalSec),
        todaySeconds: targetTodaySec,
        dailyAvgSeconds: Math.round(targetTotalSec / historyDays),
        sessions: domainObj.sessionCount || 1,
        lastActive: domainObj.lastActive || Date.now(),
        isInternal: isInternalDomain(domainName)
      });
    }
  }

  let activeTemporalSum = 0;
  processedList.forEach(item => {
    activeTemporalSum += item.computedSeconds;
  });

  processedList.forEach(item => {
    item.ratio = activeTemporalSum > 0 ? (item.computedSeconds / activeTemporalSum) : 0;
    item.ratioPercent = (item.ratio * 100).toFixed(1);
  });

  processedList.sort((a, b) => b.computedSeconds - a.computedSeconds);

  const topDomain = (processedList.length > 0 && processedList[0].computedSeconds > 0) ? processedList[0] : null;

  return {
    items: processedList,
    totalSec: totalTrackedSec,
    todaySec: todayTotalSec,
    dailyAvgSec: Math.round(totalTrackedSec / historyDays),
    historyDays,
    firstTrackedDate: actData.firstTrackedDate || todayStr,
    activeTemporalSum,
    topDomain
  };
}

function getFaviconUrl(domain) {
  if (!domain || domain.includes(':')) return '../icons/icon32.png';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

function renderTimeTrackingTab(data) {
  let stats;

  if (dataHubConnected && dataHubAnalytics && Array.isArray(dataHubAnalytics.domain_distribution)) {
    const historyDays = Math.max(1, dataHubAnalytics.total_tracked_days || 1);
    const firstTrackedDate = dataHubAnalytics.first_tracked_date || dataHubAnalytics.query_date || new Date().toISOString().split('T')[0];

    // Filter raw domain distributions by selectedDomainCategory before aggregating
    const rawTodayList = (Array.isArray(dataHubAnalytics.domain_distribution) ? dataHubAnalytics.domain_distribution : []).filter(d => {
      const isInternal = isInternalDomain(d.domain);
      if (selectedDomainCategory === 'web' && isInternal) return false;
      if (selectedDomainCategory === 'internal' && !isInternal) return false;
      return true;
    });

    const rawAllTimeList = (Array.isArray(dataHubAnalytics.all_time_domain_distribution) && dataHubAnalytics.all_time_domain_distribution.length > 0
      ? dataHubAnalytics.all_time_domain_distribution
      : (dataHubAnalytics.domain_distribution || [])).filter(d => {
      const isInternal = isInternalDomain(d.domain);
      if (selectedDomainCategory === 'web' && isInternal) return false;
      if (selectedDomainCategory === 'internal' && !isInternal) return false;
      return true;
    });

    // Recompute category-filtered totals for metric cards strictly summing mode-specific seconds
    const todaySec = rawTodayList.reduce((acc, curr) => acc + getDomainSecondsForMode(curr, selectedTrackingMode), 0);
    const allTimeSec = rawAllTimeList.reduce((acc, curr) => acc + getDomainSecondsForMode(curr, selectedTrackingMode), 0);
    const dailyAvgSec = Math.round(allTimeSec / historyDays);

    let rawItems = [];
    let activeTemporalSum = 0;

    if (temporalSubtab === 'today') {
      rawItems = rawTodayList;
      activeTemporalSum = todaySec;
    } else if (temporalSubtab === 'daily') {
      rawItems = rawAllTimeList;
      activeTemporalSum = dailyAvgSec;
    } else { // 'total'
      rawItems = rawAllTimeList;
      activeTemporalSum = allTimeSec;
    }

    const items = rawItems.map(d => {
      const modeSec = getDomainSecondsForMode(d, selectedTrackingMode);
      let computedSec = modeSec;
      if (temporalSubtab === 'daily') {
        computedSec = (dailyAvgSec > 0 && allTimeSec > 0)
          ? Math.round(dailyAvgSec * (modeSec / allTimeSec))
          : Math.round(modeSec / historyDays);
      } else if (temporalSubtab === 'total') {
        computedSec = modeSec;
      } else { // 'today'
        computedSec = modeSec;
      }

      const ratio = activeTemporalSum > 0 ? (computedSec / activeTemporalSum) : 0;
      const ratioPercent = (ratio * 100).toFixed(1);

      return {
        domain: d.domain,
        favicon: d.favicon_url || getFaviconUrl(d.domain),
        computedSeconds: computedSec,
        totalSeconds: modeSec,
        foregroundSeconds: (typeof d.foreground_seconds === 'number' ? d.foreground_seconds : (d.foregroundSeconds || d.seconds || 0)),
        backgroundMediaSeconds: (typeof d.background_media_seconds === 'number' ? d.background_media_seconds : (d.backgroundMediaSeconds || 0)),
        combinedSeconds: (typeof d.combined_seconds === 'number' ? d.combined_seconds : (d.combinedSeconds || d.totalSeconds || d.seconds || 0)),
        todaySeconds: (temporalSubtab === 'today' ? modeSec : 0),
        dailyAvgSeconds: Math.round(modeSec / historyDays),
        sessions: d.session_count || d.sessionCount || 1,
        lastActive: (d.last_active ? (d.last_active > 1e11 ? d.last_active : d.last_active * 1000) : (d.lastActive || Date.now())),
        ratio,
        ratioPercent,
        isInternal: isInternalDomain(d.domain)
      };
    }).filter(item => {
      if (selectedTrackingMode === 'background_media') {
        return item.computedSeconds > 0;
      }
      return item.computedSeconds > 0 || (temporalSubtab === 'total' && item.combinedSeconds > 0);
    });

    items.sort((a, b) => b.computedSeconds - a.computedSeconds);
    const topDomain = (items.length > 0 && items[0].computedSeconds > 0) ? items[0] : null;

    stats = {
      items,
      totalSec: allTimeSec,
      todaySec: todaySec,
      dailyAvgSec: dailyAvgSec,
      historyDays: historyDays,
      firstTrackedDate: firstTrackedDate,
      activeTemporalSum: activeTemporalSum,
      topDomain
    };
  } else {
    const actData = data.activityData || {};
    const todayStr = data.todayStr || new Date().toISOString().split('T')[0];
    stats = processTimeTrackingData(actData, temporalSubtab, todayStr);
  }

  // 1. Metric Cards
  const elToday = document.getElementById('trackMetricTodayTime');
  const elDaily = document.getElementById('trackMetricDailyAvg');
  const elTotal = document.getElementById('trackMetricTotalTime');
  const elHist = document.getElementById('trackMetricHistoryDays');
  const elFirst = document.getElementById('trackMetricFirstDate');
  const elTopDom = document.getElementById('trackMetricTopDomain');
  const elTopTime = document.getElementById('trackMetricTopDomainTime');

  if (elToday) elToday.textContent = formatDuration(stats.todaySec);
  if (elDaily) elDaily.textContent = formatDuration(stats.dailyAvgSec);
  if (elTotal) elTotal.textContent = formatDuration(stats.totalSec);
  if (elHist) elHist.textContent = t('metric_daily_sub', stats.historyDays);
  if (elFirst) elFirst.textContent = t('metric_total_sub', stats.firstTrackedDate);

  if (stats.topDomain && stats.topDomain.computedSeconds > 0) {
    if (elTopDom) elTopDom.textContent = stats.topDomain.domain;
    if (elTopTime) elTopTime.textContent = `${formatDuration(stats.topDomain.computedSeconds)} (${stats.topDomain.ratioPercent}%)`;
  } else {
    if (elTopDom) elTopDom.textContent = t('no_data');
    if (elTopTime) elTopTime.textContent = '0s';
  }

  // 2. SVG Donut Chart
  renderDonutChart(stats.items, stats.activeTemporalSum, temporalSubtab);

  // 3. Top 5 Distribution Bars
  renderTopDistributionBars(stats.items, stats.activeTemporalSum);

  // 4. Domain Breakdown Table
  renderDomainTable(stats.items);
}

function renderDonutChart(items, totalSeconds, subtab) {
  const slicesGroup = document.getElementById('dashboardDonutSlices');
  const centerTimeEl = document.getElementById('donutCenterBigTime');
  const centerLabelEl = document.getElementById('donutCenterSubLabel');
  const legendGrid = document.getElementById('donutLegendList');

  if (!slicesGroup || !centerTimeEl || !legendGrid) return;

  slicesGroup.innerHTML = '';
  legendGrid.innerHTML = '';

  centerTimeEl.textContent = formatDuration(totalSeconds);

  if (subtab === 'today') {
    centerLabelEl.textContent = t('donut_center_today');
  } else if (subtab === 'daily') {
    centerLabelEl.textContent = t('donut_center_daily');
  } else {
    centerLabelEl.textContent = t('donut_center_total');
  }

  if (totalSeconds === 0 || items.length === 0) {
    let emptyMsg = t('donut_empty');
    if (selectedTrackingMode === 'background_media') {
      emptyMsg = t('donut_empty_bg_media');
    } else if (selectedTrackingMode === 'foreground') {
      emptyMsg = t('donut_empty_foreground');
    }
    legendGrid.innerHTML = `<span class="empty-text">${emptyMsg}</span>`;
    return;
  }

  const topSlices = items.slice(0, 6);
  const otherItems = items.slice(6);
  const otherSum = otherItems.reduce((acc, curr) => acc + curr.computedSeconds, 0);

  const displayList = [...topSlices];
  if (otherSum > 0) {
    displayList.push({
      domain: t('others'),
      computedSeconds: otherSum,
      ratio: otherSum / totalSeconds,
      ratioPercent: ((otherSum / totalSeconds) * 100).toFixed(1)
    });
  }

  let accumulatedPercent = 0;

  displayList.forEach((slice, idx) => {
    const color = PALETTE[idx % PALETTE.length];
    const slicePct = totalSeconds > 0 ? (slice.computedSeconds / totalSeconds) : 0;
    const strokeDash = slicePct * CIRCUMFERENCE;
    const strokeOffset = -accumulatedPercent * CIRCUMFERENCE;

    accumulatedPercent += slicePct;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '120');
    circle.setAttribute('cy', '120');
    circle.setAttribute('r', String(DONUT_RADIUS));
    circle.setAttribute('class', 'donut-slice');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-dasharray', `${strokeDash} ${CIRCUMFERENCE}`);
    circle.setAttribute('stroke-dashoffset', String(strokeOffset));

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${slice.domain}: ${formatDuration(slice.computedSeconds)} (${slice.ratioPercent}%)`;
    circle.appendChild(title);

    slicesGroup.appendChild(circle);

    const tag = document.createElement('div');
    tag.className = 'legend-tag';
    tag.innerHTML = `
      <span class="legend-color-dot" style="background: ${color}"></span>
      <span class="legend-domain-name">${escapeHtml(slice.domain)}</span>
      <span class="legend-pct" style="color: ${color}; font-weight: 700;">${slice.ratioPercent}%</span>
    `;
    legendGrid.appendChild(tag);
  });
}

function renderTopDistributionBars(items, totalSeconds) {
  const container = document.getElementById('topBarsListContainer');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0 || totalSeconds === 0) {
    container.innerHTML = `<span class="empty-text">${t('no_data_available')}</span>`;
    return;
  }

  const topItems = items.slice(0, 5);

  topItems.forEach((item, idx) => {
    const color = PALETTE[idx % PALETTE.length];
    const row = document.createElement('div');
    row.className = 'top-bar-item';
    row.innerHTML = `
      <div class="top-bar-meta">
        <span class="top-bar-domain">
          <img src="${escapeHtml(item.favicon || '../icons/icon16.png')}" alt="" class="domain-mini-favicon">
          ${escapeHtml(item.domain)}
        </span>
        <span class="top-bar-stat">
          ${formatDuration(item.computedSeconds)} <span style="color: ${color}; font-weight: 700;">(${item.ratioPercent}%)</span>
        </span>
      </div>
      <div class="top-bar-track">
        <div class="top-bar-fill" style="width: ${item.ratioPercent}%; background: ${color};"></div>
      </div>
    `;

    const favImg = row.querySelector('.domain-mini-favicon');
    if (favImg) {
      favImg.addEventListener('error', () => {
        favImg.src = '../icons/icon16.png';
      }, { once: true });
    }

    container.appendChild(row);
  });
}

function renderDomainTable(items) {
  const tbody = document.getElementById('domainTableBody');
  const countBadge = document.getElementById('tableDomainCountLabel');
  const emptyBox = document.getElementById('domainTableEmptyState');

  if (!tbody) return;

  let filtered = items.filter(it => {
    // Category scheme filter (All / Websites Only / Internal Schemes)
    const isInternal = Boolean(it.isInternal || isInternalDomain(it.domain));
    if (selectedDomainCategory === 'web' && isInternal) return false;
    if (selectedDomainCategory === 'internal' && !isInternal) return false;

    if (!domainSearchQuery) return true;
    return it.domain.toLowerCase().includes(domainSearchQuery.toLowerCase());
  });

  if (domainSortMode === 'time_desc') {
    filtered.sort((a, b) => b.computedSeconds - a.computedSeconds);
  } else if (domainSortMode === 'time_asc') {
    filtered.sort((a, b) => a.computedSeconds - b.computedSeconds);
  } else if (domainSortMode === 'sessions_desc') {
    filtered.sort((a, b) => b.sessions - a.sessions);
  } else if (domainSortMode === 'name_asc') {
    filtered.sort((a, b) => a.domain.localeCompare(b.domain));
  }

  if (countBadge) countBadge.textContent = t('domain_count_suffix', filtered.length);

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyBox) {
      emptyBox.classList.remove('hidden');
      const emptyIconEl = emptyBox.querySelector('.empty-icon');
      const emptyTextEl = document.getElementById('txtDomainEmpty');
      if (domainSearchQuery) {
        if (emptyIconEl) emptyIconEl.textContent = '🔍';
        if (emptyTextEl) emptyTextEl.textContent = t('no_matching_domain');
      } else if (selectedTrackingMode === 'background_media') {
        if (emptyIconEl) emptyIconEl.textContent = '🎵';
        if (emptyTextEl) emptyTextEl.textContent = t('empty_bg_media');
      } else if (selectedTrackingMode === 'foreground') {
        if (emptyIconEl) emptyIconEl.textContent = '🖥️';
        if (emptyTextEl) emptyTextEl.textContent = t('empty_foreground');
      } else {
        if (emptyIconEl) emptyIconEl.textContent = '🌐';
        if (emptyTextEl) emptyTextEl.textContent = t('domain_empty');
      }
    }
    return;
  }

  if (emptyBox) emptyBox.classList.add('hidden');
  tbody.innerHTML = '';

  filtered.forEach(it => {
    const isInternal = Boolean(it.isInternal || isInternalDomain(it.domain));
    let badgeHtml = '';
    if (it.domain === 'Dashboard' || it.domain === 'Extension') {
      badgeHtml = `<span class="badge-tag badge-extension" title="Extension Dashboard">🧩 ${escapeHtml(it.domain)}</span>`;
    } else if (isInternal) {
      badgeHtml = `<span class="badge-tag badge-internal" title="Internal Browser Scheme">⚙️ Internal</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-domain">
        <div class="domain-cell">
          <img src="${escapeHtml(it.favicon || '../icons/icon32.png')}" alt="" class="domain-fav">
          <span class="domain-name-text">${escapeHtml(it.domain)}</span>
          ${badgeHtml}
        </div>
      </td>
      <td class="col-time">
        <span class="time-cell-main">${formatDuration(it.computedSeconds)}</span>
        <div class="time-dual-pills">
          <span class="pill-mini-fg" title="Foreground Active Time">🖥️ ${formatDuration(it.foregroundSeconds || 0)}</span>
          <span class="pill-mini-bg" title="Background Media Playback Time">🎵 ${formatDuration(it.backgroundMediaSeconds || 0)}</span>
        </div>
      </td>
      <td class="col-ratio">
        <div class="table-ratio-wrapper">
          <div class="table-ratio-track">
            <div class="table-ratio-fill" style="width: ${it.ratioPercent}%;"></div>
          </div>
          <span class="table-ratio-pct">${it.ratioPercent}%</span>
        </div>
      </td>
      <td class="col-sessions">
        <span class="badge-tag">${t('session_unit', it.sessions)}</span>
      </td>
      <td class="col-last">
        <span class="time-last-active">${formatTimestamp(it.lastActive)}</span>
      </td>
    `;

    const favImg = tr.querySelector('.domain-fav');
    if (favImg) {
      favImg.addEventListener('error', () => {
        favImg.src = '../icons/icon32.png';
      }, { once: true });
    }

    tbody.appendChild(tr);
  });
}

// =============================================================================
// TAB B: Media Analytics & Playback History
// =============================================================================

function renderMediaAnalyticsTab(data) {
  const history = data.mediaHistory || mediaHistoryData || [];
  const globalMedia = data.globalMediaState || {};
  const pm = globalMedia.primaryMedia;

  // 1. Compute Summary Metrics Cards
  let totalWatchSec = 0;
  let totalVolSum = 0;
  let peakVol = 0;
  let lowVol = 100;
  const sessionsCount = history.length;

  history.forEach(item => {
    totalWatchSec += (item.watchDuration || 0);
    const avgV = item.averageVolume !== undefined ? item.averageVolume : 100;
    totalVolSum += avgV;
    if (item.peakVolume !== undefined && item.peakVolume > peakVol) peakVol = item.peakVolume;
    if (item.lowVolume !== undefined && item.lowVolume < lowVol) lowVol = item.lowVolume;
  });

  const avgWatchSec = sessionsCount > 0 ? Math.round(totalWatchSec / sessionsCount) : 0;
  const overallAvgVol = sessionsCount > 0 ? Math.round(totalVolSum / sessionsCount) : 0;
  if (sessionsCount === 0) lowVol = 0;

  const elTotWatch = document.getElementById('mediaMetricTotalWatch');
  const elAvgWatch = document.getElementById('mediaMetricAvgWatch');
  const elAvgVol = document.getElementById('mediaMetricAvgVolume');
  const elPeakVol = document.getElementById('mediaMetricPeakVolume');
  const elLowVol = document.getElementById('mediaMetricLowVolume');
  const elSessCount = document.getElementById('mediaMetricSessionsCount');

  if (elTotWatch) elTotWatch.textContent = formatDuration(totalWatchSec);
  if (elAvgWatch) elAvgWatch.textContent = formatDuration(avgWatchSec);
  if (elAvgVol) elAvgVol.textContent = `${overallAvgVol}%`;
  if (elPeakVol) elPeakVol.textContent = `${peakVol}%`;
  if (elLowVol) elLowVol.textContent = `${lowVol}%`;
  if (elSessCount) elSessCount.textContent = String(sessionsCount);

  // 2. Render Live Media Player Hero Widget
  renderHeroMediaPlayer(pm);

  // 3. Render Media History Table
  renderMediaHistoryTable(history);
}

function renderHeroMediaPlayer(pm) {
  const pulseDot = document.getElementById('playerPulseDot');
  const statusBadge = document.getElementById('playerStatusBadge');
  const heroControls = document.getElementById('heroMediaControls');
  const activeContent = document.getElementById('playerActiveContent');
  const idleContent = document.getElementById('playerIdleContent');
  const sidebarDot = document.getElementById('sidebarLiveDot');

  if (!pulseDot || !statusBadge) return;

  if (!pm || (!pm.isPlaying && !pm.isBuffering && !pm.duration)) {
    pulseDot.className = 'player-pulse-dot idle';
    statusBadge.className = 'status-pill idle';
    statusBadge.textContent = t('status_idle');
    if (heroControls) heroControls.classList.add('hidden');
    if (activeContent) activeContent.classList.add('hidden');
    if (idleContent) idleContent.classList.remove('hidden');
    if (sidebarDot) sidebarDot.classList.add('hidden');
    return;
  }

  if (idleContent) idleContent.classList.add('hidden');
  if (activeContent) activeContent.classList.remove('hidden');
  if (heroControls) heroControls.classList.remove('hidden');

  const isPlaying = Boolean(pm.isPlaying);
  if (isPlaying) {
    pulseDot.className = 'player-pulse-dot playing';
    statusBadge.className = 'status-pill playing';
    statusBadge.textContent = t('status_playing');
    if (sidebarDot) sidebarDot.classList.remove('hidden');
  } else {
    pulseDot.className = 'player-pulse-dot paused';
    statusBadge.className = 'status-pill paused';
    statusBadge.textContent = t('status_paused');
    if (sidebarDot) sidebarDot.classList.add('hidden');
  }

  const btnPlayPause = document.getElementById('btnHeroPlayPause');
  if (btnPlayPause) btnPlayPause.textContent = isPlaying ? t('btn_pause') : t('btn_play');

  const isVideo = Boolean(pm.mediaType === 'video');
  const dur = Number(pm.duration) || 0;
  const isLive = Boolean(pm.isLive && dur <= 0);
  const displayResolution = (pm.resolutionLabel && pm.resolutionLabel !== 'Audio / Unknown' && pm.resolutionLabel !== 'Unknown')
    ? pm.resolutionLabel
    : (isVideo ? 'Video (Auto)' : 'Audio Stream');

  const elTitle = document.getElementById('heroVideoTitle');
  const elPlat = document.getElementById('heroPlatformTag');
  const elRes = document.getElementById('heroResolutionBadge');
  const elDom = document.getElementById('heroDomainBadge');

  if (elTitle) elTitle.textContent = pm.title || 'Web Media Stream';
  if (elPlat) elPlat.textContent = (pm.domain || 'WEB').toUpperCase();
  if (elRes) elRes.textContent = displayResolution;
  if (elDom) elDom.textContent = pm.domain || '-';

  const speedDisplay = document.getElementById('heroSpeedDisplay');
  if (speedDisplay) {
    speedDisplay.textContent = `⚡ ${(pm.playbackRate || 1.0).toFixed(2).replace(/\.00$/, '')}x`;
  }

  const qualityDisplay = document.getElementById('heroQualityDisplay');
  if (qualityDisplay) {
    const qMap = {
      'tiny': '144P',
      'small': '240P',
      'medium': '360P',
      'large': '480P',
      'hd720': '720P',
      'hd1080': '1080P',
      'hd1440': '1440P',
      'hd2160': '4K',
      'hd2880': '5K',
      'highres': '8K'
    };
    let qText = 'Quality';
    if (pm.playbackQuality && qMap[pm.playbackQuality]) {
      qText = qMap[pm.playbackQuality];
    } else if (pm.playbackQuality) {
      qText = pm.playbackQuality.replace(/^hd/, '') + (pm.playbackQuality.startsWith('hd') ? 'p' : '');
    } else if (pm.resolutionLabel && pm.resolutionLabel !== 'Video (Auto)') {
      qText = pm.resolutionLabel.split(' ')[0];
    }
    qualityDisplay.textContent = qText.toUpperCase();
  }

  const curTime = Number(pm.currentTime) || 0;
  const pct = (dur > 0)
    ? Math.min(100, Math.max(0, (curTime / dur) * 100))
    : (isLive ? 100 : (Number(pm.progressPercent) || 0));

  const elCur = document.getElementById('heroTimeElapsed');
  const elDur = document.getElementById('heroTimeDuration');
  const elPct = document.getElementById('heroProgressPercent');
  const elFill = document.getElementById('heroProgressFill');

  if (elCur) elCur.textContent = formatDigitalTime(curTime);
  if (elDur) elDur.textContent = isLive ? '🔴 LIVE' : (dur > 0 ? formatDigitalTime(dur) : '--:--');
  if (elPct) elPct.textContent = isLive ? 'LIVE' : `${pct.toFixed(1)}%`;
  if (elFill) elFill.style.width = `${pct}%`;

  const volPct = Math.round((typeof pm.volume === 'number' ? pm.volume : 1) * 100);
  const isMuted = Boolean(pm.isMuted);

  const volText = document.getElementById('heroVolumeText');
  const volIcon = document.getElementById('heroVolumeIcon');
  const muteBtn = document.getElementById('btnHeroMute');
  const volFill = document.getElementById('heroVolumeFill');

  if (isMuted || volPct === 0) {
    if (volText) volText.textContent = t('muted_vol');
    if (volIcon) volIcon.textContent = '🔇';
    if (muteBtn) muteBtn.textContent = t('btn_unmute');
    if (volFill) volFill.style.width = '0%';
  } else {
    if (volText) volText.textContent = `${volPct}%`;
    if (volIcon) volIcon.textContent = volPct > 50 ? '🔊' : '🔉';
    if (muteBtn) muteBtn.textContent = t('btn_mute');
    if (volFill) volFill.style.width = `${volPct}%`;
  }
}

function renderMediaHistoryTable(history) {
  const tbody = document.getElementById('mediaTableBody');
  const countBadge = document.getElementById('tableMediaCountLabel');
  const emptyBox = document.getElementById('mediaTableEmptyState');

  if (!tbody) return;

  let filtered = history.filter(item => {
    if (mediaPlatformFilter !== 'all') {
      const p = (item.platform || '').toLowerCase();
      if (mediaPlatformFilter === 'youtube' && !p.includes('youtube')) return false;
      if (mediaPlatformFilter === 'netflix' && !p.includes('netflix')) return false;
      if (mediaPlatformFilter === 'vimeo' && !p.includes('vimeo')) return false;
      if (mediaPlatformFilter === 'twitch' && !p.includes('twitch')) return false;
      if (mediaPlatformFilter === 'other') {
        if (p.includes('youtube') || p.includes('netflix') || p.includes('vimeo') || p.includes('twitch')) return false;
      }
    }

    if (mediaSearchQuery) {
      const q = mediaSearchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchPlatform = (item.platform || '').toLowerCase().includes(q);
      if (!matchTitle && !matchPlatform) return false;
    }

    return true;
  });

  if (mediaSortMode === 'time_desc') {
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } else if (mediaSortMode === 'duration_desc') {
    filtered.sort((a, b) => (b.watchDuration || 0) - (a.watchDuration || 0));
  } else if (mediaSortMode === 'vol_desc') {
    filtered.sort((a, b) => (b.averageVolume || 0) - (a.averageVolume || 0));
  } else if (mediaSortMode === 'title_asc') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  if (countBadge) countBadge.textContent = t('media_count_suffix', filtered.length);

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyBox) emptyBox.classList.remove('hidden');
    return;
  }

  if (emptyBox) emptyBox.classList.add('hidden');
  tbody.innerHTML = '';

  filtered.forEach(it => {
    const tr = document.createElement('tr');

    let platClass = '';
    const platLow = (it.platform || '').toLowerCase();
    if (platLow.includes('youtube')) platClass = 'platform-youtube';
    else if (platLow.includes('netflix')) platClass = 'platform-netflix';
    else if (platLow.includes('vimeo')) platClass = 'platform-vimeo';
    else if (platLow.includes('twitch')) platClass = 'platform-twitch';

    let resClass = 'res-hd';
    if ((it.resolution || '').includes('4K') || (it.resolution || '').includes('2K')) {
      resClass = 'res-4k';
    }

    const avgVol = it.averageVolume !== undefined ? it.averageVolume : 100;
    const peakVol = it.peakVolume !== undefined ? it.peakVolume : avgVol;
    const lowVol = it.lowVolume !== undefined ? it.lowVolume : avgVol;

    let extraBadges = '';
    if (it.playbackRate && it.playbackRate !== 1.0) {
      extraBadges += `<span class="badge-tag" style="margin-left: 4px; font-size: 10.5px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">⚡ ${it.playbackRate}x</span>`;
    }
    if (it.lastWindowMode && it.lastWindowMode !== 'standard') {
      const modeLabel = it.lastWindowMode === 'fullscreen' ? '⛶ Fullscreen' : (it.lastWindowMode === 'pip' ? '🪟 PiP' : '🎬 Theater');
      extraBadges += `<span class="badge-tag" style="margin-left: 4px; font-size: 10.5px; background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.3);">${modeLabel}</span>`;
    }

    tr.innerHTML = `
      <td class="col-media-title">
        <div class="media-title-cell" title="${escapeHtml(it.title)}">
          <span class="media-icon-symbol">▶️</span>
          <span class="media-title-link">${escapeHtml(it.title || 'Web Video')}</span>
        </div>
      </td>
      <td class="col-media-platform">
        <span class="badge-tag ${platClass}">${escapeHtml(it.platform || 'Web')}</span>
      </td>
      <td class="col-media-duration">
        <span class="time-cell-main">${formatDuration(it.watchDuration)}</span>
        <span class="time-cell-sub">(${it.watchDuration}s)</span>
      </td>
      <td class="col-media-volume">
        <div class="volume-meter-wrapper">
          <div class="volume-meter-track">
            <div class="volume-meter-fill" style="width: ${avgVol}%;"></div>
          </div>
          <span class="volume-meter-text">${avgVol}%</span>
        </div>
        <div class="volume-extremes-sub" style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">
          Peak: <span style="color: #fbbf24;">${peakVol}%</span> | Low: <span style="color: #a78bfa;">${lowVol}%</span>
        </div>
      </td>
      <td class="col-media-res">
        <span class="badge-tag ${resClass}">${escapeHtml(it.resolution || 'Standard')}</span>${extraBadges}
      </td>
      <td class="col-media-date">
        <span class="time-last-active">${formatTimestamp(it.timestamp)}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// =============================================================================
// TAB C: Settings & Data Management
// =============================================================================

function populateSettingsForm(settings) {
  if (!settings) return;
  cachedSettings = { ...cachedSettings, ...settings };

  const idleSelect = document.getElementById('settingIdleTimeout');
  const langSelect = document.getElementById('settingLanguage');
  const wsInput = document.getElementById('settingWsUrl');
  const mediaToggle = document.getElementById('settingMediaToggle');
  const autoWsToggle = document.getElementById('settingAutoWsToggle');
  const retSelect = document.getElementById('settingHistoryDays');

  if (idleSelect && settings.idleThresholdSeconds) {
    idleSelect.value = String(settings.idleThresholdSeconds);
  }
  if (langSelect && settings.language) {
    langSelect.value = settings.language;
  }
  if (wsInput && settings.wsUrl) {
    wsInput.value = settings.wsUrl;
  }
  if (mediaToggle && settings.mediaTrackingEnabled !== undefined) {
    mediaToggle.checked = Boolean(settings.mediaTrackingEnabled);
  }
  if (autoWsToggle && settings.autoConnectWs !== undefined) {
    autoWsToggle.checked = Boolean(settings.autoConnectWs);
  }
  if (retSelect && settings.historyRetentionDays) {
    retSelect.value = String(settings.historyRetentionDays);
  }
}

function saveDashboardSettings() {
  const idleSelect = document.getElementById('settingIdleTimeout');
  const langSelect = document.getElementById('settingLanguage');
  const wsInput = document.getElementById('settingWsUrl');
  const mediaToggle = document.getElementById('settingMediaToggle');
  const autoWsToggle = document.getElementById('settingAutoWsToggle');
  const retSelect = document.getElementById('settingHistoryDays');

  const selectedLang = langSelect ? langSelect.value : currentLang;

  const newSettings = {
    idleThresholdSeconds: parseInt(idleSelect.value, 10) || 60,
    language: selectedLang,
    wsUrl: wsInput.value.trim() || 'ws://127.0.0.1:65432',
    mediaTrackingEnabled: mediaToggle.checked,
    autoConnectWs: autoWsToggle.checked,
    historyRetentionDays: parseInt(retSelect.value, 10) || 60,
    theme: 'dark'
  };

  cachedSettings = { ...cachedSettings, ...newSettings };

  browserAPI.storage.local.set({ language: selectedLang });

  safeRuntimeSendMessage({
    type: 'UPDATE_SETTINGS',
    settings: newSettings
  }, (res) => {
    if (res && res.success) {
      applyDashboardLanguage(selectedLang);
      showToast(t('toast_settings_saved'));
    } else {
      showToast(t('toast_settings_saved'));
    }
  });
}

// =============================================================================
// Data Export Capabilities (JSON & CSV)
// =============================================================================

function exportFullJson() {
  if (!dashboardData) return;

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportSource: 'Web Activity & Media Sentinel Dashboard',
    author: 'Atul Verma (aiprincekumar)',
    settings: cachedSettings,
    activityData: dashboardData.activityData,
    mediaHistory: mediaHistoryData
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `media_sentinel_master_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('toast_json_downloaded'));
}

function exportTimeTrackingCsv() {
  if (!dashboardData || !dashboardData.activityData) return;

  const actData = dashboardData.activityData;
  const domains = actData.domains || {};
  const todayStr = dashboardData.todayStr || new Date().toISOString().split('T')[0];

  const headers = ['Domain', 'Today Seconds', 'Today Formatted', 'Total Seconds', 'Total Formatted', 'Sessions Count', 'Last Active Timestamp'];
  const rows = [headers];

  for (const [dom, obj] of Object.entries(domains)) {
    const todaySec = (obj.days && obj.days[todayStr]) ? obj.days[todayStr].seconds : 0;
    const totalSec = obj.totalSeconds || 0;
    rows.push([
      `"${dom}"`,
      todaySec,
      `"${formatDuration(todaySec)}"`,
      totalSec,
      `"${formatDuration(totalSec)}"`,
      obj.sessionCount || 1,
      `"${formatTimestamp(obj.lastActive)}"`
    ]);
  }

  const csvContent = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `media_sentinel_time_tracking_${todayStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('toast_tracking_csv_downloaded'));
}

function exportMediaHistoryCsv() {
  const history = mediaHistoryData || [];
  const headers = ['ID', 'Title', 'Platform', 'Domain', 'URL', 'Watch Duration (sec)', 'Watch Duration Formatted', 'Avg Volume (%)', 'Peak Volume (%)', 'Low Volume (%)', 'Resolution', 'Timestamp'];
  const rows = [headers];

  history.forEach(it => {
    rows.push([
      `"${it.id || ''}"`,
      `"${(it.title || '').replace(/"/g, '""')}"`,
      `"${it.platform || ''}"`,
      `"${it.domain || ''}"`,
      `"${it.url || ''}"`,
      it.watchDuration || 0,
      `"${formatDuration(it.watchDuration)}"`,
      it.averageVolume !== undefined ? it.averageVolume : 100,
      it.peakVolume !== undefined ? it.peakVolume : 100,
      it.lowVolume !== undefined ? it.lowVolume : 100,
      `"${it.resolution || ''}"`,
      `"${formatTimestamp(it.timestamp)}"`
    ]);
  });

  const csvContent = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `media_sentinel_media_history_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('toast_media_csv_downloaded'));
}

// =============================================================================
// Danger Zone & Confirmation Modal
// =============================================================================

function openConfirmationModal(actionType, title, message) {
  pendingDangerAction = actionType;
  const modal = document.getElementById('confirmModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMsg = document.getElementById('modalMessage');

  if (modalTitle) modalTitle.textContent = title;
  if (modalMsg) modalMsg.textContent = message;
  if (modal) modal.classList.remove('hidden');
}

function closeConfirmationModal() {
  pendingDangerAction = null;
  const modal = document.getElementById('confirmModal');
  if (modal) modal.classList.add('hidden');
}

function executeDangerAction() {
  if (!pendingDangerAction) return;

  const action = pendingDangerAction;
  closeConfirmationModal();

  if (action === 'CLEAR_MEDIA_HISTORY') {
    safeRuntimeSendMessage({ type: 'CLEAR_MEDIA_HISTORY' }, () => {
      mediaHistoryData = [];
      showToast(t('toast_media_cleared'), true);
      refreshDashboard();
    });
  } else if (action === 'CLEAR_TIME_DATA') {
    safeRuntimeSendMessage({ type: 'CLEAR_TIME_DATA' }, () => {
      showToast(t('toast_time_cleared'), true);
      refreshDashboard();
    });
  } else if (action === 'CLEAR_ALL_DATA') {
    safeRuntimeSendMessage({ type: 'CLEAR_ALL_DATA' }, () => {
      mediaHistoryData = [];
      showToast(t('toast_all_wiped'), true);
      refreshDashboard();
    });
  }
}

// =============================================================================
// Remote Media Control Handlers
// =============================================================================

let lastDashboardControlKey = '';
let lastDashboardControlTime = 0;

function sendMediaControl(action, data = {}) {
  const now = Date.now();
  const actionKey = `${action}_${JSON.stringify(data)}`;

  if (actionKey === lastDashboardControlKey && (now - lastDashboardControlTime) < 280) {
    return;
  }
  if (action !== 'set_volume' && (now - lastDashboardControlTime) < 180) {
    return;
  }
  lastDashboardControlKey = actionKey;
  lastDashboardControlTime = now;

  safeRuntimeSendMessage({
    type: 'CONTROL_MEDIA',
    action,
    data
  }, () => {
    setTimeout(refreshDashboard, 150);
  });
}

function sendSetVolume(percent) {
  const vol = Math.max(0, Math.min(100, percent));
  safeRuntimeSendMessage({
    type: 'SET_VOLUME',
    percent: vol,
    volume: vol / 100
  }, () => {
    setTimeout(refreshDashboard, 150);
  });
}

function updateHeroVolumeFromEvent(e) {
  const container = document.getElementById('heroVolumeBar');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  const pct = Math.round((clickX / rect.width) * 100);
  sendSetVolume(pct);
}

// =============================================================================
// Core Dashboard Refresh & IPC Sync
// =============================================================================

function refreshDashboard(forceRefresh = false) {
  return new Promise((resolve) => {
    safeRuntimeSendMessage({
      type: 'GET_DASHBOARD_DATA',
      forceRefresh: Boolean(forceRefresh)
    }, async (response) => {
      if (!response) {
        resolve(null);
        return;
      }

      dashboardData = response;
      dataHubConnected = Boolean(response.dataHubConnected);
      detectedBrowserType = response.detectedBrowser || 'chrome';

      // HUD status
      updateHUDStatus(Boolean(response.wsConnected));

      // Settings
      if (response.settings) {
        populateSettingsForm(response.settings);
      }

      // If Standalone Data Hub is connected, query analytics for the selected browser filter
      if (dataHubConnected) {
        try {
          const hubRes = await new Promise((res) => {
            safeRuntimeSendMessage({
              type: 'QUERY_DATA_HUB',
              query: 'ANALYTICS',
              browser: selectedBrowser,
              tracking_mode: selectedTrackingMode,
              date: response.todayStr || new Date().toISOString().split('T')[0]
            }, (hr) => {
              if (!hr || !hr.success) {
                res(null);
              } else {
                res(hr.data || null);
              }
            });
          });

          if (hubRes) {
            dataHubAnalytics = hubRes;
            updateDataHubStatus(true, hubRes.registered_browsers || []);
          } else {
            dataHubAnalytics = null;
            updateDataHubStatus(false);
          }
        } catch (_) {
          dataHubAnalytics = null;
          updateDataHubStatus(false);
        }
      } else {
        dataHubAnalytics = null;
        updateDataHubStatus(false);
      }

      // Media History Sync from Data Hub if available
      if (dataHubConnected && dataHubAnalytics && Array.isArray(dataHubAnalytics.recent_media_sessions) && dataHubAnalytics.recent_media_sessions.length > 0) {
        mediaHistoryData = dataHubAnalytics.recent_media_sessions.map(m => ({
          id: m.session_id,
          title: m.title || 'Web Media',
          platform: m.domain,
          domain: m.domain,
          url: m.url || '',
          mediaType: 'video',
          resolution: m.resolution_label || 'Standard',
          watchDuration: Math.round(m.watch_duration_seconds || 0),
          videoDuration: 0,
          averageVolume: Math.round((m.average_volume || 1.0) * 100),
          peakVolume: Math.round((m.peak_volume || 1.0) * 100),
          lowVolume: 0,
          timestamp: (m.started_at ? m.started_at * 1000 : Date.now()),
          lastUpdated: (m.ended_at ? m.ended_at * 1000 : Date.now()),
          browser_type: m.browser_type,
          isPlaying: false
        }));
      } else {
        mediaHistoryData = response.mediaHistory || [];
      }

      // Render active tabs
      renderTimeTrackingTab(response);
      renderMediaAnalyticsTab(response);
      resolve(response);
    });
  });
}

// =============================================================================
// Event Listeners & UI Binding
// =============================================================================

let dashboardListenersAttached = false;

function setupEventListeners() {
  if (dashboardListenersAttached) return;
  dashboardListenersAttached = true;

  // 0. Multi-Browser Dropdown Filter
  const browserFilterSelect = document.getElementById('browserFilterSelect');
  if (browserFilterSelect) {
    browserFilterSelect.value = selectedBrowser;
    browserFilterSelect.addEventListener('change', async (e) => {
      selectedBrowser = e.target.value;
      await browserAPI.storage.local.set({ selected_browser_filter: selectedBrowser });
      await refreshDashboard(false);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showToast(`Filter: ${selectedText}`);
    });
  }

  // 0b. Tracking Mode Selector (Combined / Foreground Active / Background Media)
  const trackingModeSelect = document.getElementById('trackingModeSelect');
  if (trackingModeSelect) {
    trackingModeSelect.value = selectedTrackingMode;
    trackingModeSelect.addEventListener('change', async (e) => {
      selectedTrackingMode = e.target.value;
      await browserAPI.storage.local.set({ selected_tracking_mode: selectedTrackingMode });
      await refreshDashboard(false);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showToast(`Tracking: ${selectedText}`);
    });
  }

  // 0c. Domain Category Filter (All / Websites Only / Internal Schemes)
  const domainCategorySelect = document.getElementById('domainCategorySelect');
  if (domainCategorySelect) {
    domainCategorySelect.value = selectedDomainCategory;
    domainCategorySelect.addEventListener('change', async (e) => {
      selectedDomainCategory = e.target.value;
      await browserAPI.storage.local.set({ selected_domain_category: selectedDomainCategory });
      await refreshDashboard(false);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showToast(`Category: ${selectedText}`);
    });
  }

  // Standalone SQLite Data Hub Reconnect & Auto-Launch Button
  let hubConnectInProgress = false;
  async function triggerDataHubConnectAndLaunch() {
    if (hubConnectInProgress) return;
    hubConnectInProgress = true;

    const btn = document.getElementById('btnSidebarReconnectHub');
    const badge = document.getElementById('dataHubBadge');
    const badgeText = document.getElementById('dataHubBadgeText');
    const sideDot = document.getElementById('dataHubSidebarDot');
    const sideLabel = document.getElementById('dataHubSidebarLabel');

    if (btn) btn.textContent = '⏳ Connecting...';
    if (badge) badge.className = 'datahub-status-badge connecting';
    if (badgeText) badgeText.textContent = (currentLang === 'hi') ? 'कनेक्ट हो रहा है...' : 'Connecting...';
    if (sideDot) sideDot.className = 'hud-dot starting';
    if (sideLabel) {
      sideLabel.textContent = (currentLang === 'hi') ? 'कनेक्ट हो रहा है...' : 'Connecting...';
      sideLabel.style.color = '#f59e0b';
    }

    showToast((currentLang === 'hi') ? 'SQLite Data Hub (पोर्ट 65433) से कनेक्ट किया जा रहा है...' : 'Connecting to SQLite Data Hub (port 65433)...');
    safeRuntimeSendMessage({ type: 'LAUNCH_DATA_HUB' });

    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      const res = await refreshDashboard(true);
      if (res && res.dataHubConnected) {
        clearInterval(pollInterval);
        hubConnectInProgress = false;
        if (btn) btn.textContent = '⚡ Reconnect Hub';
        showToast((currentLang === 'hi') ? 'SQLite Data Hub सफलतापूर्वक कनेक्ट हो गया!' : 'SQLite Data Hub connected successfully!');
      } else if (attempts >= 10) {
        clearInterval(pollInterval);
        hubConnectInProgress = false;
        if (btn) btn.textContent = '⚡ Reconnect Hub';
        if (!res || !res.dataHubConnected) {
          updateDataHubStatus(false);
          showToast((currentLang === 'hi') ? 'SQLite Data Hub (पोर्ट 65433) चालू नहीं है या कनेक्ट नहीं हुआ' : 'Could not connect to SQLite Data Hub (port 65433)', true);
        }
      }
    }, 500);
  }

  const btnReconnectHub = document.getElementById('btnSidebarReconnectHub');
  if (btnReconnectHub) {
    btnReconnectHub.addEventListener('click', triggerDataHubConnectAndLaunch);
  }

  const dataHubBadge = document.getElementById('dataHubBadge');
  if (dataHubBadge) {
    dataHubBadge.addEventListener('click', triggerDataHubConnectAndLaunch);
  }

  // 1. Navigation Tab Switching
  document.getElementById('navTabTracking').addEventListener('click', () => switchTab('tracking'));
  document.getElementById('navTabMedia').addEventListener('click', () => switchTab('media'));
  document.getElementById('navTabSettings').addEventListener('click', () => switchTab('settings'));

  // 2. 1-Click Language Switcher (EN / HI Toggle)
  const btnLangToggle = document.getElementById('btnLangToggle');
  if (btnLangToggle) {
    btnLangToggle.addEventListener('click', () => {
      const nextLang = (currentLang === 'en') ? 'hi' : 'en';
      applyDashboardLanguage(nextLang);
      browserAPI.storage.local.set({ 
        language: nextLang,
        media_sentinel_settings: { ...cachedSettings, language: nextLang }
      });
      showToast(t('toast_lang_changed'));
    });
  }

  // Language select in Settings form
  const settingLangSelect = document.getElementById('settingLanguage');
  if (settingLangSelect) {
    settingLangSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      applyDashboardLanguage(selected);
      browserAPI.storage.local.set({ 
        language: selected,
        media_sentinel_settings: { ...cachedSettings, language: selected }
      });
      showToast(t('toast_lang_changed'));
    });
  }

  // 3. Global Refresh Button
  const btnGlobalRefresh = document.getElementById('btnGlobalRefresh');
  let isGlobalRefreshing = false;
  if (btnGlobalRefresh) {
    btnGlobalRefresh.addEventListener('click', async () => {
      if (isGlobalRefreshing) return;
      isGlobalRefreshing = true;
      btnGlobalRefresh.classList.add('spinning');
      btnGlobalRefresh.disabled = true;

      try {
        await refreshDashboard(true);
        showToast(t('toast_refreshed'));
      } catch (_) {
        showToast(t('toast_refreshed'));
      } finally {
        setTimeout(() => {
          btnGlobalRefresh.classList.remove('spinning');
          btnGlobalRefresh.disabled = false;
          isGlobalRefreshing = false;
        }, 650);
      }
    });
  }

  // 4. Connect HUD
  let hudLaunchInProgress = false;

  function handleConnectOrLaunchHUD() {
    if (dashboardData && dashboardData.wsConnected) {
      showToast(t('toast_hud_already'));
      return;
    }

    if (hudLaunchInProgress) return;
    hudLaunchInProgress = true;

    updateHUDStatus('starting');
    showToast(t('toast_hud_launching'));

    safeRuntimeSendMessage({ type: 'LAUNCH_DESKTOP_HUD' }, (res) => {
      if (res && res.fallbackRequired) {
        try {
          let iframe = document.getElementById('__hud_launcher_frame__');
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = '__hud_launcher_frame__';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
          }
          iframe.src = 'videohud://launch';
        } catch (_) {}
      }
    });

    safeRuntimeSendMessage({ type: 'TRIGGER_WS_RECONNECT' });

    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      const res = await refreshDashboard(true);
      if (res && res.wsConnected) {
        clearInterval(pollInterval);
        hudLaunchInProgress = false;
        updateHUDStatus(true);
        showToast(t('toast_hud_connected'));
      } else if (attempts >= 7) {
        clearInterval(pollInterval);
        hudLaunchInProgress = false;
        if (!res || !res.wsConnected) {
          updateHUDStatus(false);
          showToast(t('toast_hud_failed'), true);
        }
      }
    }, 1100);
  }

  const btnSidebarReconnect = document.getElementById('btnSidebarReconnect');
  if (btnSidebarReconnect) {
    btnSidebarReconnect.addEventListener('click', handleConnectOrLaunchHUD);
  }

  const btnTestWsConnection = document.getElementById('btnTestWsConnection');
  if (btnTestWsConnection) {
    btnTestWsConnection.addEventListener('click', handleConnectOrLaunchHUD);
  }

  // 5. Temporal Subtabs
  const subtabBtns = document.querySelectorAll('.subtab-btn');
  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subtabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      temporalSubtab = btn.getAttribute('data-temporal');
      if (dashboardData) {
        renderTimeTrackingTab(dashboardData);
      }
    });
  });

  // 6. Domain Search & Sort
  const domSearchInput = document.getElementById('tableDomainSearch');
  if (domSearchInput) {
    domSearchInput.addEventListener('input', (e) => {
      domainSearchQuery = e.target.value.trim();
      if (dashboardData) {
        renderTimeTrackingTab(dashboardData);
      }
    });
  }

  const domSortSelect = document.getElementById('tableSortSelect');
  if (domSortSelect) {
    domSortSelect.addEventListener('change', (e) => {
      domainSortMode = e.target.value;
      if (dashboardData) {
        renderTimeTrackingTab(dashboardData);
      }
    });
  }

  // 7. Hero Media Controls
  const handleTogglePlayHero = () => {
    const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
    if (pm) {
      pm.isPlaying = !pm.isPlaying;
      renderHeroMediaPlayer(pm);
    }
    sendMediaControl('toggle_play');
  };

  const btnHeroPlayPause = document.getElementById('btnHeroPlayPause');
  if (btnHeroPlayPause) btnHeroPlayPause.addEventListener('click', handleTogglePlayHero);

  const btnHeroRewind = document.getElementById('btnHeroRewind');
  if (btnHeroRewind) btnHeroRewind.addEventListener('click', () => sendMediaControl('seek_relative', { offsetSeconds: -10 }));

  const btnHeroForward = document.getElementById('btnHeroForward');
  if (btnHeroForward) btnHeroForward.addEventListener('click', () => sendMediaControl('seek_relative', { offsetSeconds: 10 }));

  const btnHeroMute = document.getElementById('btnHeroMute');
  if (btnHeroMute) btnHeroMute.addEventListener('click', () => sendMediaControl('toggle_mute'));

  const btnHeroSpeedDown = document.getElementById('btnHeroSpeedDown');
  if (btnHeroSpeedDown) {
    btnHeroSpeedDown.addEventListener('click', () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const cur = (pm && typeof pm.playbackRate === 'number') ? pm.playbackRate : 1.0;
      const targetSpeed = calculateNextLadderSpeed(cur, 'down');

      if (pm) pm.playbackRate = targetSpeed;
      const speedDisplay = document.getElementById('heroSpeedDisplay');
      if (speedDisplay) {
        speedDisplay.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }
      sendMediaControl('step_speed', { direction: 'down', targetSpeed, step: -0.25 });
    });
  }

  const btnHeroSpeedUp = document.getElementById('btnHeroSpeedUp');
  if (btnHeroSpeedUp) {
    btnHeroSpeedUp.addEventListener('click', () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const cur = (pm && typeof pm.playbackRate === 'number') ? pm.playbackRate : 1.0;
      const targetSpeed = calculateNextLadderSpeed(cur, 'up');

      if (pm) pm.playbackRate = targetSpeed;
      const speedDisplay = document.getElementById('heroSpeedDisplay');
      if (speedDisplay) {
        speedDisplay.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }
      sendMediaControl('step_speed', { direction: 'up', targetSpeed, step: 0.25 });
    });
  }

  // Window Modes, Switch Tab & Quality Controls
  const btnHeroFullscreen = document.getElementById('btnHeroFullscreen');
  if (btnHeroFullscreen) {
    btnHeroFullscreen.addEventListener('click', () => {
      sendMediaControl('toggle_fullscreen');
    });
  }

  const btnHeroPip = document.getElementById('btnHeroPip');
  if (btnHeroPip) {
    btnHeroPip.addEventListener('click', () => {
      sendMediaControl('toggle_pip');
    });
  }

  const btnHeroTheater = document.getElementById('btnHeroTheater');
  if (btnHeroTheater) {
    btnHeroTheater.addEventListener('click', () => {
      sendMediaControl('toggle_theater');
    });
  }

  // Switch to Media Tab (टैब स्विच) Button in Dashboard Hero
  const btnHeroSwitchTab = document.getElementById('btnHeroSwitchTab');
  if (btnHeroSwitchTab) {
    btnHeroSwitchTab.addEventListener('click', () => {
      const pm = (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia) || null;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
      const targetWindowId = (pm && pm.windowId) ? pm.windowId : undefined;
      safeRuntimeSendMessage({
        type: 'JUMP_TO_MEDIA_TAB',
        tabId: targetTabId,
        windowId: targetWindowId
      }, (res) => {
        if (res && res.success) {
          showToast(t('toast_switched_tab'), false);
        } else {
          showToast(t('toast_no_media_tab'), true);
        }
      });
    });
  }

  const btnHeroQualityDown = document.getElementById('btnHeroQualityDown');
  if (btnHeroQualityDown) {
    btnHeroQualityDown.addEventListener('click', () => {
      sendMediaControl('step_quality', { direction: 'down' });
    });
  }

  const btnHeroQualityUp = document.getElementById('btnHeroQualityUp');
  if (btnHeroQualityUp) {
    btnHeroQualityUp.addEventListener('click', () => {
      sendMediaControl('step_quality', { direction: 'up' });
    });
  }

  // Hero Video Seek Bar
  const heroProgress = document.getElementById('heroProgressBar');
  if (heroProgress) {
    heroProgress.addEventListener('click', (e) => {
      const rect = heroProgress.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      sendMediaControl('seek_percent', { percent: pct });
    });
  }

  // Hero Volume Bar (Click & Drag)
  const heroVol = document.getElementById('heroVolumeBar');
  if (heroVol) {
    heroVol.addEventListener('pointerdown', (e) => {
      isDraggingHeroVolume = true;
      try { heroVol.setPointerCapture(e.pointerId); } catch (_) {}
      updateHeroVolumeFromEvent(e);
    });

    heroVol.addEventListener('pointermove', (e) => {
      if (isDraggingHeroVolume) updateHeroVolumeFromEvent(e);
    });

    const stopHeroVolDrag = (e) => {
      if (isDraggingHeroVolume) {
        isDraggingHeroVolume = false;
        try { heroVol.releasePointerCapture(e.pointerId); } catch (_) {}
        updateHeroVolumeFromEvent(e);
      }
    };
    heroVol.addEventListener('pointerup', stopHeroVolDrag);
    heroVol.addEventListener('pointercancel', stopHeroVolDrag);
  }

  // 8. Media History Filter & Search
  const mediaSearchInput = document.getElementById('tableMediaSearch');
  if (mediaSearchInput) {
    mediaSearchInput.addEventListener('input', (e) => {
      mediaSearchQuery = e.target.value.trim();
      if (dashboardData) {
        renderMediaAnalyticsTab(dashboardData);
      }
    });
  }

  const mediaPlatSelect = document.getElementById('tableMediaPlatformFilter');
  if (mediaPlatSelect) {
    mediaPlatSelect.addEventListener('change', (e) => {
      mediaPlatformFilter = e.target.value;
      if (dashboardData) {
        renderMediaAnalyticsTab(dashboardData);
      }
    });
  }

  const mediaSortSelect = document.getElementById('tableMediaSortSelect');
  if (mediaSortSelect) {
    mediaSortSelect.addEventListener('change', (e) => {
      mediaSortMode = e.target.value;
      if (dashboardData) {
        renderMediaAnalyticsTab(dashboardData);
      }
    });
  }

  // 9. Settings Form Save
  const btnSaveSettings = document.getElementById('btnSaveGeneralSettings');
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', saveDashboardSettings);
  }

  // 10. Export Buttons
  const btnExpJson = document.getElementById('btnExportFullJson');
  if (btnExpJson) btnExpJson.addEventListener('click', exportFullJson);

  const btnExpTrackCsv = document.getElementById('btnExportTrackingCsv');
  if (btnExpTrackCsv) btnExpTrackCsv.addEventListener('click', exportTimeTrackingCsv);

  const btnExpMediaCsv = document.getElementById('btnExportMediaCsv');
  if (btnExpMediaCsv) btnExpMediaCsv.addEventListener('click', exportMediaHistoryCsv);

  // 11. Danger Zone Modal Triggers
  const btnClrMedia = document.getElementById('btnTriggerClearMedia');
  if (btnClrMedia) {
    btnClrMedia.addEventListener('click', () => {
      openConfirmationModal(
        'CLEAR_MEDIA_HISTORY',
        t('modal_title_delete'),
        t('modal_clear_media_msg')
      );
    });
  }

  const btnClrTime = document.getElementById('btnTriggerClearTime');
  if (btnClrTime) {
    btnClrTime.addEventListener('click', () => {
      openConfirmationModal(
        'CLEAR_TIME_DATA',
        t('modal_title_delete'),
        t('modal_clear_time_msg')
      );
    });
  }

  const btnWipeAll = document.getElementById('btnTriggerWipeAll');
  if (btnWipeAll) {
    btnWipeAll.addEventListener('click', () => {
      openConfirmationModal(
        'CLEAR_ALL_DATA',
        t('modal_title_delete'),
        t('modal_wipe_all_msg')
      );
    });
  }

  // Modal Cancel & Confirm
  const modalCancel = document.getElementById('modalBtnCancel');
  if (modalCancel) modalCancel.addEventListener('click', closeConfirmationModal);

  const modalConfirm = document.getElementById('modalBtnConfirm');
  if (modalConfirm) modalConfirm.addEventListener('click', executeDangerAction);
}

// Reactively synchronize configuration changes from chrome.storage
browserAPI.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.language && changes.language.newValue) {
      applyDashboardLanguage(changes.language.newValue);
    } else if (changes.media_sentinel_settings && changes.media_sentinel_settings.newValue && changes.media_sentinel_settings.newValue.language) {
      applyDashboardLanguage(changes.media_sentinel_settings.newValue.language);
    }
    refreshDashboard();
  }
});

// Bootstrap Initialization
document.addEventListener('DOMContentLoaded', () => {
  startLiveClock();
  setupEventListeners();

  // Load language preference, browser filter, tracking mode, and category from storage
  browserAPI.storage.local.get(['language', 'media_sentinel_settings', 'selected_browser_filter', 'selected_tracking_mode', 'selected_domain_category'], (res) => {
    let lang = 'en';
    if (res && res.language) {
      lang = res.language;
    } else if (res && res.media_sentinel_settings && res.media_sentinel_settings.language) {
      lang = res.media_sentinel_settings.language;
    }
    if (res && res.selected_browser_filter) {
      selectedBrowser = res.selected_browser_filter;
      const sel = document.getElementById('browserFilterSelect');
      if (sel) sel.value = selectedBrowser;
    }
    if (res && res.selected_tracking_mode) {
      selectedTrackingMode = res.selected_tracking_mode;
      const selTm = document.getElementById('trackingModeSelect');
      if (selTm) selTm.value = selectedTrackingMode;
    }
    if (res && res.selected_domain_category) {
      selectedDomainCategory = res.selected_domain_category;
      const selCat = document.getElementById('domainCategorySelect');
      if (selCat) selCat.value = selectedDomainCategory;
    }
    applyDashboardLanguage(lang);
    refreshDashboard();
  });

  // Periodic Auto-Refresh (every 1.5 seconds)
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      refreshDashboard();
    }
  }, 1500);

  // Instant reactive updates via IPC broadcast
  browserAPI.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'LIVE_MEDIA_UPDATE' && message.payload) {
      if (currentTab === 'media' && message.payload.primaryMedia) {
        renderHeroMediaPlayer(message.payload.primaryMedia);
      }
    } else if (message && message.type === 'DATA_HUB_STATUS_CHANGED') {
      refreshDashboard(true);
    }
  });
});
