/**
 * Web Activity & Media Sentinel - Settings Tab Controller
 * Dynamic auto-sync timer, SQLite Data Hub launcher, theme toggles, and bilingual language system.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const I18N_POPUP = {
    en: {
      brand_subtitle: 'Activity & Media Telemetry',
      hud_offline: 'HUD Offline',
      hud_connected: 'HUD Connected',
      hud_starting: 'Starting HUD...',
      hud_link_title: 'Video Detector HUD Link',
      
      // Tabs
      tab_media: 'Media',
      tab_audio: 'Audio',
      tab_tools: 'Tools',
      tab_studio: 'Studio',
      tab_tracking: 'Tracking',
      tab_domains: 'Domains',
      tab_media_active_title: 'Media Active',
      
      // Headings
      heading_video: 'LIVE VIDEO SENTINEL',
      heading_audio: 'LIVE AUDIO SENTINEL',
      heading_paused: 'MEDIA PAUSED',
      heading_buffering: 'BUFFERING STREAM',
      heading_idle: 'LIVE MEDIA SENTINEL',
      
      // Dynamic Status Button
      status_buffering: '⏳ Buffering',
      status_buffering_title: 'Media is buffering',
      status_muted_playing: '🔇 Muted Playing',
      status_muted_title: 'Media is muted - Click to toggle mute/play',
      status_playing: '🟢 Playing',
      status_playing_title: 'Media is actively playing - Click to pause',
      status_paused: '⏸️ Paused',
      status_paused_title: 'Media is paused - Click to play',
      status_stopped: '⏹️ Stopped',
      status_stopped_title: 'Media is stopped',
      status_ready: '⚪ Ready',
      status_ready_title: 'Media is ready',
      status_idle: '⚪ Idle - No Media',
      status_idle_title: 'No active media playing',
      
      // Progress & Volume Labels
      watched: 'Watched:',
      total: 'Total:',
      volume: 'Volume:',
      normal_vol: '🔊 Normal',
      muted_vol: '🔇 Muted',
      muted_percent: 'Muted (0%)',
      seek_title: 'Click to seek',
      vol_slider_title: 'Click or drag to adjust volume',
      vol_toggle_mute_title: 'Toggle Mute',
      
      // Quick Controls
      btn_rewind: '⏪ -10s',
      btn_rewind_title: 'Rewind 10 seconds',
      btn_play: '▶️ Play',
      btn_pause: '⏸️ Pause',
      btn_play_title: 'Play / Pause',
      btn_forward: '⏩ +10s',
      btn_forward_title: 'Forward 10 seconds',
      btn_mute: '🔇 Mute',
      btn_unmute: '🔊 Unmute',
      btn_mute_title: 'Toggle Mute',
      speed_down_title: 'Decrease speed (-0.25x)',
      speed_up_title: 'Increase speed (+0.25x)',
      speed_container_title: 'Adjust playback speed (-0.25x / +0.25x)',
      
      // Advanced Modes
      btn_fullscreen: 'Fullscreen',
      btn_fullscreen_title: 'Toggle Fullscreen',
      btn_pip: 'Pop-up PiP',
      btn_pip_title: 'Toggle Picture-in-Picture',
      btn_theater: 'Theater',
      btn_theater_title: 'Toggle Theater Mode',
      quality_down_title: 'Decrease quality',
      quality_up_title: 'Increase quality',
      quality_container_title: 'Change video quality',
      
      // Empty state & guidance
      empty_prompt: 'Play YouTube, Netflix or any media in any browser tab. Live player and controls will appear here.',
      btn_go_tracking: '⏱️ View Time Tracking',
      no_media_detected: 'No Active Media Stream Detected',
      
      // Temporal tabs & stats
      tab_today: 'Today',
      tab_daily: 'Daily Avg',
      tab_total: 'Total Time',
      center_today: "Today's Time",
      center_daily: 'Daily Avg',
      center_total: 'Total Time',
      sessions_label: 'Sessions',
      domain_breakdown: '📊 Domain Breakdown',
      search_domain_placeholder: 'Search domain...',
      no_activity: 'No browsing activity recorded yet. Browse any website to start tracking!',
      empty_bg_media: 'No background media playback recorded yet. Play audio/video in a background tab (e.g. YouTube, Spotify) to see playback time here!',
      empty_foreground: 'No active foreground browsing recorded yet. Browse any website to start tracking!',
      center_bg_media: 'No BG Media',
      no_matching_domain: 'No matching domains found.',
      others: 'Others',
      
      // Footer buttons
      btn_refresh: 'Refresh',
      btn_tracking_pause: 'Tracking',
      btn_tracking_pause_title: 'Pause Time Tracking',
      btn_tracking_resume_title: 'Resume Time Tracking',
      btn_connect_hud: 'HUD',
      btn_connect_hud_title: 'Launch & Connect Video Detector HUD',
      btn_switch_tab: 'Switch Tab',
      btn_switch_tab_title: 'Switch to active media tab',
      btn_dashboard: '📊 Dashboard',
      btn_dashboard_title: 'Open Full Dashboard',
      
      // Toasts
      toast_refreshed: 'Telemetry refreshed',
      toast_tracking_paused: 'Time tracking paused',
      toast_tracking_resumed: 'Time tracking resumed',
      toast_hud_already: 'HUD is already connected',
      toast_hud_launching: 'Launching Video Detector HUD...',
      toast_hud_connected: 'HUD connected successfully',
      toast_hud_failed: 'Could not connect to HUD',
      toast_switched_tab: 'Focused media tab',
      toast_no_media_tab: 'No active media tab found',
      
      // Legacy / 4-Pillar Tabs
      tab_focus: 'Focus',
      
      // Player Micro-Actions
      btn_card_screenshot: 'Snap',
      btn_card_screenshot_title: 'Capture Video Frame',
      btn_card_cinema: 'Cinema',
      btn_card_cinema_title: 'Cinema Focus Dimmer',
      btn_card_loop: 'Loop',
      btn_card_loop_title: 'Loop Current Media',
      btn_card_next: 'Next',
      btn_card_next_title: 'Next Track / Video',
      btn_card_copy_link: 'Copy Link',
      btn_card_copy_link_title: 'Copy Link with Timestamp',
      
      // Additional Toasts
      toast_screenshot_captured: 'Video frame captured',
      toast_link_copied: 'Timestamp link copied to clipboard',
      toast_loop_enabled: 'Looping enabled',
      toast_loop_disabled: 'Looping disabled',
      toast_cinema_toggled: 'Cinema dimmer toggled',
      toast_note_pinned: 'Timestamp note pinned',
      theme_toggle_light: 'Switch to Light Mode',
      theme_toggle_dark: 'Switch to Dark Mode',
      theme_active_dark: 'Dark mode activated',
      theme_active_light: 'Light mode activated'
    },
    hi: {
      brand_subtitle: 'गतिविधि व मीडिया टेलीमेट्री',
      hud_offline: 'HUD ऑफलाइन',
      hud_connected: 'HUD कनेक्टेड',
      hud_starting: 'HUD शुरू हो रहा है...',
      hud_link_title: 'Video Detector HUD लिंक',
      
      // Tabs
      tab_media: 'मीडिया',
      tab_audio: 'ऑडियो',
      tab_tools: 'टूल्स',
      tab_studio: 'स्टूडियो',
      tab_tracking: 'ट्रैकिंग',
      tab_domains: 'डोमेन',
      tab_media_active_title: 'मीडिया सक्रिय है',
      
      // Headings
      heading_video: 'लाइव वीडियो सेंटिनल',
      heading_audio: 'लाइव ऑडियो सेंटिनल',
      heading_paused: 'मीडिया रुका हुआ',
      heading_buffering: 'बफरिंग स्ट्रीम',
      heading_idle: 'लाइव मीडिया सेंटिनल',
      
      // Dynamic Status Button
      status_buffering: '⏳ बफरिंग',
      status_buffering_title: 'मीडिया बफर हो रहा है',
      status_muted_playing: '🔇 म्यूट पर चल रहा है',
      status_muted_title: 'मीडिया म्यूट है - म्यूट या प्ले टॉगल करें',
      status_playing: '🟢 चल रहा है',
      status_playing_title: 'मीडिया सक्रिय रूप से चल रहा है - पॉज़ करने के लिए क्लिक करें',
      status_paused: '⏸️ रुका हुआ',
      status_paused_title: 'मीडिया रुका हुआ है - प्ले करने के लिए क्लिक करें',
      status_stopped: '⏹️ बंद',
      status_stopped_title: 'मीडिया बंद है',
      status_ready: '⚪ तैयार',
      status_ready_title: 'मीडिया तैयार है',
      status_idle: '⚪ स्टैंडबाय - कोई मीडिया नहीं',
      status_idle_title: 'कोई सक्रिय मीडिया नहीं चल रहा',
      
      // Progress & Volume Labels
      watched: 'देखा गया:',
      total: 'कुल:',
      volume: 'वॉल्यूम:',
      normal_vol: '🔊 सामान्य',
      muted_vol: '🔇 म्यूट',
      muted_percent: 'म्यूट (0%)',
      seek_title: 'सीक करने के लिए क्लिक करें',
      vol_slider_title: 'वॉल्यूम बदलने के लिए क्लिक या ड्रैग करें',
      vol_toggle_mute_title: 'म्यूट या अनम्यूट टॉगल करें',
      
      // Quick Controls
      btn_rewind: '⏪ -10s',
      btn_rewind_title: '10 सेकंड पीछे',
      btn_play: '▶️ प्ले',
      btn_pause: '⏸️ पॉज़',
      btn_play_title: 'प्ले या पॉज़ करें',
      btn_forward: '⏩ +10s',
      btn_forward_title: '10 सेकंड आगे',
      btn_mute: '🔇 म्यूट',
      btn_unmute: '🔊 अनम्यूट',
      btn_mute_title: 'म्यूट या अनम्यूट करें',
      speed_down_title: 'स्पीड कम करें (-0.25x)',
      speed_up_title: 'स्पीड बढ़ाएं (+0.25x)',
      speed_container_title: 'प्लेबैक गति नियंत्रित करें (-0.25x / +0.25x)',
      
      // Advanced Modes
      btn_fullscreen: 'फुल स्क्रीन',
      btn_fullscreen_title: 'फुल स्क्रीन टॉगल करें',
      btn_pip: 'पॉप-अप PiP',
      btn_pip_title: 'पॉप-अप पिक्चर-इन-पिक्चर टॉगल करें',
      btn_theater: 'थिएटर',
      btn_theater_title: 'थिएटर मोड टॉगल करें',
      quality_down_title: 'क्वालिटी कम करें',
      quality_up_title: 'क्वालिटी बढ़ाएं',
      quality_container_title: 'वीडियो क्वालिटी बदलें',
      
      // Empty state & guidance
      empty_prompt: 'ब्राउज़र में YouTube, Netflix या कोई मीडिया चलाएं। लाइव प्लेयर और कंट्रोल्स यहाँ दिखाई देंगे।',
      btn_go_tracking: '⏱️ टाइम ट्रैकिंग देखें',
      no_media_detected: 'कोई सक्रिय मीडिया स्ट्रीम नहीं मिली',
      
      // Temporal tabs & stats
      tab_today: 'आज',
      tab_daily: 'दैनिक औसत',
      tab_total: 'कुल समय',
      center_today: 'आज का समय',
      center_daily: 'दैनिक औसत',
      center_total: 'कुल समय',
      sessions_label: 'सत्र संख्या',
      domain_breakdown: '📊 डोमेन विवरण',
      search_domain_placeholder: 'डोमेन खोजें...',
      no_activity: 'कोई ब्राउज़िंग गतिविधि दर्ज नहीं है। ट्रैकिंग शुरू करने के लिए कोई वेबसाइट खोलें!',
      empty_bg_media: 'कोई पृष्ठभूमि मीडिया (Background Media) प्लेबैक अभी तक रिकॉर्ड नहीं हुआ है। समय देखने के लिए बैकग्राउंड टैब में मीडिया चलाएं!',
      empty_foreground: 'कोई सक्रिय फ़ोरग्राउंड ब्राउज़िंग गतिविधि दर्ज नहीं है। ट्रैकिंग शुरू करने के लिए कोई वेबसाइट खोलें!',
      center_bg_media: 'कोई BG मीडिया नहीं',
      no_matching_domain: 'कोई मेल खाता डोमेन नहीं मिला।',
      others: 'अन्य',
      
      // Footer buttons
      btn_refresh: 'रीफ्रेश',
      btn_tracking_pause: 'ट्रैकिंग',
      btn_tracking_pause_title: 'टाइम ट्रैकिंग रोकें',
      btn_tracking_resume_title: 'ट्रैकिंग फिर से शुरू करें',
      btn_connect_hud: 'HUD',
      btn_connect_hud_title: 'Video Detector HUD लॉन्च व कनेक्ट करें',
      btn_switch_tab: 'टैब स्विच',
      btn_switch_tab_title: 'सक्रिय मीडिया टैब पर जाएं',
      btn_dashboard: '📊 डैशबोर्ड',
      btn_dashboard_title: 'पूर्ण डैशबोर्ड खोलें',
      
      // Toasts
      toast_refreshed: 'डेटा रीफ्रेश हो गया',
      toast_tracking_paused: 'टाइम ट्रैकिंग रोक दी गई है',
      toast_tracking_resumed: 'टाइम ट्रैकिंग फिर से शुरू हो गई है',
      toast_hud_already: 'HUD पहले से कनेक्टेड है',
      toast_hud_launching: 'Video Detector HUD शुरू हो रहा है...',
      toast_hud_connected: 'HUD सफलतापूर्वक कनेक्ट हो गया',
      toast_hud_failed: 'HUD से कनेक्ट नहीं हो सका',
      toast_switched_tab: 'मीडिया टैब पर स्विच किया गया',
      toast_no_media_tab: 'कोई सक्रिय मीडिया टैब नहीं मिला',
      
      // Legacy / 4-Pillar Tabs
      tab_focus: 'फोकस',
      
      // Player Micro-Actions
      btn_card_screenshot: 'स्नैप',
      btn_card_screenshot_title: 'वीडियो फ्रेम कैप्चर करें',
      btn_card_cinema: 'सिनेमा',
      btn_card_cinema_title: 'सिनेमा फोकस डिमर',
      btn_card_loop: 'लूप',
      btn_card_loop_title: 'मौजूदा मीडिया को लूप करें',
      btn_card_next: 'अगला',
      btn_card_next_title: 'अगला ट्रैक या वीडियो',
      btn_card_copy_link: 'लिंक कॉपी',
      btn_card_copy_link_title: 'टाइमस्टैम्प के साथ लिंक कॉपी करें',
      
      // Additional Toasts
      toast_screenshot_captured: 'वीडियो फ्रेम कैप्चर किया गया',
      toast_link_copied: 'टाइमस्टैम्प लिंक क्लिपबोर्ड पर कॉपी किया गया',
      toast_loop_enabled: 'लूपिंग चालू की गई',
      toast_loop_disabled: 'लूपिंग बंद की गई',
      toast_cinema_toggled: 'सिनेमा डिमर टॉगल किया गया',
      toast_note_pinned: 'टाइमस्टैम्प नोट पिन किया गया',
      theme_toggle_light: 'लाइट मोड पर स्विच करें',
      theme_toggle_dark: 'डार्क मोड पर स्विच करें',
      theme_active_dark: 'डार्क मोड सक्रिय',
      theme_active_light: 'लाइट मोड सक्रिय'
    }
  };

  let currentLang = 'en';
  let currentTheme = 'dark';
  let dashboardSyncIntervalId = null;

  function t(key) {
    const dict = I18N_POPUP[currentLang] || I18N_POPUP.en;
    return dict[key] || I18N_POPUP.en[key] || key;
  }

  function applyPopupLanguage(lang) {
    currentLang = (lang === 'hi') ? 'hi' : 'en';
    if (typeof document === 'undefined') return;

    function setTxt(id, key) {
      const el = document.getElementById(id);
      if (el) el.textContent = t(key);
    }

    setTxt('topTabMediaText', 'tab_media');
    setTxt('topTabAudioText', 'tab_audio');
    setTxt('topTabToolsText', 'tab_tools');
    setTxt('topTabStudioText', 'tab_studio');
    setTxt('topTabTrackingText', 'tab_tracking');
    setTxt('topTabDomainsText', 'tab_domains');
  }

  function applyTheme(theme) {
    currentTheme = (theme === 'light') ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', currentTheme);
      }
      if (document.body) {
        document.body.setAttribute('data-theme', currentTheme);
      }
    }
    updateThemeToggleUI(currentTheme);
  }

  function updateThemeToggleUI(theme) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('btnThemeToggle');
    if (!btn) return;

    const isLight = (theme === 'light');
    const label = isLight ? t('theme_toggle_dark') : t('theme_toggle_light');
    btn.title = label;
    btn.setAttribute('aria-label', label);

    const svg = btn.querySelector('.theme-toggle-icon');
    if (!svg) return;

    // W3C Trusted Types safe DOM node replacement (zero innerHTML)
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    if (isLight) {
      if (typeof document.createElementNS === 'function') {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '5');
        svg.appendChild(circle);

        const rays = [
          ['12', '1', '12', '3'],
          ['12', '21', '12', '23'],
          ['4.22', '4.22', '5.64', '5.64'],
          ['18.36', '18.36', '19.78', '19.78'],
          ['1', '12', '3', '12'],
          ['21', '12', '23', '12'],
          ['4.22', '19.78', '5.64', '18.36'],
          ['18.36', '5.64', '19.78', '4.22']
        ];
        rays.forEach(([x1, y1, x2, y2]) => {
          const line = document.createElementNS(svgNS, 'line');
          line.setAttribute('x1', x1);
          line.setAttribute('y1', y1);
          line.setAttribute('x2', x2);
          line.setAttribute('y2', y2);
          svg.appendChild(line);
        });
      }
    } else {
      if (typeof document.createElementNS === 'function') {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
        svg.appendChild(path);
      }
    }
  }

  function startDashboardAutoSync(intervalMs, callback) {
    if (dashboardSyncIntervalId) {
      clearInterval(dashboardSyncIntervalId);
      dashboardSyncIntervalId = null;
    }
    const safeInterval = Math.max(500, Math.min(10000, parseInt(intervalMs, 10) || 2000));
    if (typeof callback === 'function') {
      dashboardSyncIntervalId = setInterval(callback, safeInterval);
    }
    return dashboardSyncIntervalId;
  }

  function stopDashboardAutoSync() {
    if (dashboardSyncIntervalId) {
      clearInterval(dashboardSyncIntervalId);
      dashboardSyncIntervalId = null;
    }
  }

  function launchDataHub(toastFn) {
    if (typeof document === 'undefined') return;
    let iframe = document.getElementById('__datahub_launcher_frame__');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = '__datahub_launcher_frame__';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    iframe.src = 'datahub://launch';
    if (typeof toastFn === 'function') {
      toastFn('Launching SQLite Data Hub (port 65433)...');
    }
  }

  const TabSettings = {
    I18N_POPUP,
    t,
    applyPopupLanguage,
    applyTheme,
    updateThemeToggleUI,
    startDashboardAutoSync,
    stopDashboardAutoSync,
    launchDataHub
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabSettings;
  }
  global.TabSettings = TabSettings;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
