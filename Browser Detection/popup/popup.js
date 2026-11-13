/**
 * Browser Detection / popup/popup.js
 * Multi-Tab Interactive Glassmorphic Dashboard, Dynamic Status Sentinel & Live Media Controller
 * Features:
 *   - 2 Multi-Tabs System (Tab 1: Live Media Player, Tab 2: Time Tracking)
 *   - "Switch to Media Tab" 1-click focus action (JUMP_TO_MEDIA_TAB)
 *   - Pure English by Default & Centralized Language System (EN / HI sync via chrome.storage.local)
 *   - Single dynamic status button (Playing / Paused / Buffering / Muted / Stopped / Idle)
 *   - Full video title display (multi-line, no cutting/ellipsis)
 *   - Video progress bar with exact numerical time and percentage + click-to-seek
 *   - Interactive Volume Progress Bar with click & drag scrubbing + mute indicator
 *   - Full media telemetry badges and quick controls
 *   - Circular Donut chart and domain breakdown
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

// Color palette for donut slices and domain bars
const PALETTE = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#64748b'  // Muted Slate (Others)
];

const CIRCUMFERENCE = 2 * Math.PI * 76; // r = 76 -> ~477.52

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
// Centralized Language System (Pure English by default, Clean Hindi on switch)
// =============================================================================

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
    toast_note_pinned: 'Timestamp note pinned'
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
    toast_note_pinned: 'टाइमस्टैम्प नोट पिन किया गया'
  }
};

let currentLang = 'en';

function t(key) {
  const dict = I18N_POPUP[currentLang] || I18N_POPUP.en;
  return dict[key] || I18N_POPUP.en[key] || key;
}

function applyPopupLanguage(lang) {
  currentLang = (lang === 'hi') ? 'hi' : 'en';

  const setTxt = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };
  const setTitle = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.title = t(key);
  };

  setTxt('brandSubtitle', 'brand_subtitle');
  setTxt('topTabMediaText', 'tab_media');
  setTxt('topTabAudioText', 'tab_audio');
  setTxt('topTabToolsText', 'tab_tools');
  setTxt('topTabStudioText', 'tab_studio');
  setTxt('topTabTrackingText', 'tab_tracking');
  setTxt('topTabDomainsText', 'tab_domains');
  setTitle('tabMediaLiveDot', 'tab_media_active_title');

  setTxt('lblTimeElapsed', 'watched');
  setTxt('lblTimeDuration', 'total');
  setTxt('lblVolume', 'volume');
  setTitle('btnQuickMute', 'vol_toggle_mute_title');
  setTitle('progressBarContainer', 'seek_title');
  setTitle('volumeBarContainer', 'vol_slider_title');

  setTitle('btnCtrlRewind', 'btn_rewind_title');
  setTitle('btnCtrlForward', 'btn_forward_title');
  setTitle('btnCtrlSpeedDown', 'speed_down_title');
  setTitle('btnCtrlSpeedUp', 'speed_up_title');

  setTxt('ctrlFullscreenText', 'btn_fullscreen');
  setTitle('btnCtrlFullscreen', 'btn_fullscreen_title');
  setTxt('ctrlPipText', 'btn_pip');
  setTitle('btnCtrlPip', 'btn_pip_title');
  setTxt('ctrlTheaterText', 'btn_theater');
  setTitle('btnCtrlTheater', 'btn_theater_title');
  setTitle('btnCtrlQualityDown', 'quality_down_title');
  setTitle('btnCtrlQualityUp', 'quality_up_title');

  setTxt('emptyMediaText', 'empty_prompt');
  setTxt('btnGoToTracking', 'btn_go_tracking');

  setTxt('subtabTodayText', 'tab_today');
  setTxt('subtabDailyText', 'tab_daily');
  setTxt('subtabTotalText', 'tab_total');
  setTxt('pillTodayLabel', 'tab_today');
  setTxt('pillDailyLabel', 'tab_daily');
  setTxt('pillSessionsLabel', 'sessions_label');
  setTxt('sectionDomainTitle', 'domain_breakdown');

  const searchInput = document.getElementById('domainSearchInput');
  if (searchInput) searchInput.placeholder = t('search_domain_placeholder');

  const emptyDomainText = document.getElementById('emptyDomainStateText');
  if (emptyDomainText) {
    if (selectedTrackingMode === 'background_media') {
      emptyDomainText.textContent = t('empty_bg_media');
    } else if (selectedTrackingMode === 'foreground') {
      emptyDomainText.textContent = t('empty_foreground');
    } else {
      emptyDomainText.textContent = t('no_activity');
    }
  }

  setTxt('btnRefreshText', 'btn_refresh');
  setTxt('btnToggleTrackingPauseText', 'btn_tracking_pause');
  updateTrackingPauseButtonUI(isTrackingPaused);
  setTxt('btnReconnectWsText', 'btn_connect_hud');
  setTitle('btnReconnectWs', 'btn_connect_hud_title');
  setTxt('btnSwitchMediaTabText', 'btn_switch_tab');
  setTitle('btnSwitchMediaTab', 'btn_switch_tab_title');
  setTxt('btnOpenDashboardText', 'btn_dashboard');
  setTitle('btnOpenDashboard', 'btn_dashboard_title');

  const btnSettings = document.getElementById('btnQuickSettings');
  if (btnSettings) {
    const sTitle = (currentLang === 'hi') ? 'त्वरित सेटिंग्स' : 'Quick Settings';
    btnSettings.title = sTitle;
    btnSettings.setAttribute('aria-label', sTitle);
  }

  // Re-render dynamic components with localized strings
  if (dashboardData) {
    renderWebSocketBadge(dashboardData.wsConnected);
    renderMediaCard(dashboardData.globalMediaState);
    renderStatsPills(dashboardData);
    const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
    renderDonutChart(items, totalSeconds);
    renderDomainList(items, totalSeconds);
  }
}

let popupToastTimer = null;
function showPopupToast(message, type = 'success') {
  const toast = document.getElementById('popupToastNotification');
  const msgEl = document.getElementById('popupToastMessage');
  const iconEl = document.getElementById('popupToastIcon');
  if (!toast || !msgEl) return;

  if (popupToastTimer) clearTimeout(popupToastTimer);

  msgEl.textContent = message;
  iconEl.textContent = type === 'danger' ? '⚠️' : (type === 'starting' ? '⏳' : '✅');
  toast.className = `toast-banner ${type}`;
  toast.classList.remove('hidden');

  popupToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Application State
let activeTopTab = 'media'; // 'media' | 'tracking'
let userManualOverride = false;
let isInitialLoad = true;
let lastMediaPlaying = false;
let isDraggingVolume = false;
let lastVolumeDragTime = 0;
let isDraggingProgress = false;
let lastProgressDragTime = 0;
let isTrackingPaused = false;

/**
 * Updates the Tracking Pause / Resume button UI in popup footer
 * W3C Trusted Types compliant (zero innerHTML)
 */
function updateTrackingPauseButtonUI(isPaused) {
  const btn = document.getElementById('btnToggleTrackingPause');
  const svg = document.getElementById('svgTrackingPauseIcon');
  if (!btn || !svg) return;

  const isHi = (currentLang === 'hi');

  if (isPaused) {
    btn.classList.add('is-paused');
    const resumeTitle = isHi ? t('btn_tracking_resume_title') : 'Resume Time Tracking';
    btn.title = resumeTitle;
    btn.setAttribute('aria-label', resumeTitle);

    // Switch SVG to play polygon without innerHTML
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '5 3 19 12 5 21 5 3');
    polygon.setAttribute('fill', 'currentColor');
    svg.appendChild(polygon);
  } else {
    btn.classList.remove('is-paused');
    const pauseTitle = isHi ? t('btn_tracking_pause_title') : 'Pause Time Tracking';
    btn.title = pauseTitle;
    btn.setAttribute('aria-label', pauseTitle);

    // Switch SVG to two vertical pause bars without innerHTML
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect1.setAttribute('x', '6');
    rect1.setAttribute('y', '4');
    rect1.setAttribute('width', '4');
    rect1.setAttribute('height', '16');
    rect1.setAttribute('rx', '1');
    rect1.setAttribute('fill', 'currentColor');

    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect2.setAttribute('x', '14');
    rect2.setAttribute('y', '4');
    rect2.setAttribute('width', '4');
    rect2.setAttribute('height', '16');
    rect2.setAttribute('rx', '1');
    rect2.setAttribute('fill', 'currentColor');

    svg.appendChild(rect1);
    svg.appendChild(rect2);
  }

  const timeBadge = document.getElementById('todayHeaderTimeBadge');
  if (timeBadge) {
    timeBadge.classList.toggle('paused', Boolean(isPaused));
  }
}

let currentTemporalTab = 'today'; // 'today' | 'daily' | 'total'
let dashboardData = null;
let searchQuery = '';
let activeMediaCached = null;

// Standalone SQLite Data Hub state & Multi-Browser Filter
let dataHubConnected = false;
let dataHubAnalytics = null;
let selectedBrowser = 'all';
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

/**
 * Returns favicon URL with Google S2 service fallback
 */
function getFaviconUrl(domain) {
  if (!domain || domain.includes(':')) return '../icons/icon32.png';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

/**
 * Updates dynamic options in browser filter dropdown when Data Hub reports new clients
 */
function updateBrowserFilterOptions(registeredBrowsers = []) {
  const sel = document.getElementById('browserFilterSelect');
  if (!sel) return;

  const existingValues = new Set(Array.from(sel.options).map(o => o.value));
  registeredBrowsers.forEach(b => {
    if (b && !existingValues.has(b)) {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b.charAt(0).toUpperCase() + b.slice(1);
      sel.appendChild(opt);
    }
  });
  sel.value = selectedBrowser;
}

/**
 * Escapes HTML entities for safe DOM injection (OWASP / MV3 CSP compliant)
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats seconds into human-readable browsing duration
 */
function formatDuration(totalSeconds) {
  const sec = Math.max(0, Math.round(totalSeconds));
  if (sec === 0) return '0s';

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSec}s`;
  }
  return `${remainingSec}s`;
}

/**
 * Formats seconds into digital video time format (mm:ss or hh:mm:ss)
 */
function formatVideoTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
}

/**
 * Formats seconds for center readout (compact)
 */
function formatCenterTime(totalSeconds) {
  const sec = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${sec}s`;
}

/**
 * Switches the top-level tab (Media, Audio, Tools, Studio, Tracking, Domains)
 */
function switchTopTab(tabName, isManual = false) {
  if (isManual) {
    userManualOverride = true;
  }
  const normalized = (tabName === 'focus') ? 'tracking' : tabName;
  activeTopTab = normalized;

  const tabs = [
    { id: 'mainTabMedia', paneId: 'viewMediaPane', key: 'media' },
    { id: 'mainTabAudio', paneId: 'viewAudioPane', key: 'audio' },
    { id: 'mainTabTools', paneId: 'viewToolsPane', key: 'tools' },
    { id: 'mainTabStudio', paneId: 'viewStudioPane', key: 'studio' },
    { id: 'mainTabTracking', paneId: 'viewTrackingPane', key: 'tracking' },
    { id: 'mainTabDomains', paneId: 'viewDomainsPane', key: 'domains' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.id);
    const pane = document.getElementById(t.paneId);
    if (!btn || !pane) return;
    if (t.key === normalized) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      pane.classList.add('active');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      pane.classList.remove('active');
    }
  });

  try {
    browserAPI.storage.local.set({ active_popup_tab: normalized });
  } catch (_) {}
}

/**
 * Fetches latest dashboard state from background service worker
 */
async function fetchDashboardData(forceRefresh = false) {
  return new Promise((resolve) => {
    try {
      const p = browserAPI.runtime.sendMessage({
        type: 'GET_DASHBOARD_DATA',
        forceRefresh: Boolean(forceRefresh)
      }, (response) => {
        if (browserAPI.runtime.lastError || !response) {
          resolve(null);
        } else {
          resolve(response);
        }
      });
      if (p && typeof p.catch === 'function') {
        p.catch(() => resolve(null));
      }
    } catch (_) {
      resolve(null);
    }
  });
}

let lastControlActionKey = '';
let lastControlActionTime = 0;

/**
 * Sends interactive media control action to background service worker with click debounce.
 */
function sendMediaControl(action, data = {}, tabId = null) {
  const now = Date.now();
  const actionKey = `${action}_${JSON.stringify(data)}`;

  if (actionKey === lastControlActionKey && (now - lastControlActionTime) < 280) {
    return;
  }
  if (action !== 'set_volume' && action !== 'seek_percent' && (now - lastControlActionTime) < 180) {
    return;
  }
  lastControlActionKey = actionKey;
  lastControlActionTime = now;

  const resolvedTabId = tabId || (activeMediaCached && activeMediaCached.tabId) ||
    (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

  try {
    const p = browserAPI.runtime.sendMessage({
      type: 'CONTROL_MEDIA',
      action,
      data,
      tabId: resolvedTabId
    }, () => {
      if (!isDraggingVolume && !isDraggingProgress) {
        setTimeout(refreshDashboard, 120);
      }
    });
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  } catch (_) {}
}

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

/**
 * Extracts list of domains with duration and session stats based on active temporal tab
 */
function processDomainStats(data, tabType) {
  // 1. Standalone SQLite Data Hub Mode (Source of Truth when Connected)
  if (dataHubConnected && dataHubAnalytics && Array.isArray(dataHubAnalytics.domain_distribution)) {
    const historyDays = Math.max(1, dataHubAnalytics.total_tracked_days || 1);

    const todayRawList = (Array.isArray(dataHubAnalytics.domain_distribution) ? dataHubAnalytics.domain_distribution : []).filter(d => {
      const isInternal = isInternalDomain(d.domain);
      if (selectedDomainCategory === 'web' && isInternal) return false;
      if (selectedDomainCategory === 'internal' && !isInternal) return false;
      return true;
    });

    const allTimeRawList = (Array.isArray(dataHubAnalytics.all_time_domain_distribution) && dataHubAnalytics.all_time_domain_distribution.length > 0
      ? dataHubAnalytics.all_time_domain_distribution
      : (dataHubAnalytics.domain_distribution || [])).filter(d => {
      const isInternal = isInternalDomain(d.domain);
      if (selectedDomainCategory === 'web' && isInternal) return false;
      if (selectedDomainCategory === 'internal' && !isInternal) return false;
      return true;
    });

    const modeTodaySec = todayRawList.reduce((acc, curr) => acc + getDomainSecondsForMode(curr, selectedTrackingMode), 0);
    const modeAllTimeSec = allTimeRawList.reduce((acc, curr) => acc + getDomainSecondsForMode(curr, selectedTrackingMode), 0);
    const modeDailyAvgSec = Math.round(modeAllTimeSec / historyDays);

    const rawItems = (tabType === 'today') ? todayRawList : allTimeRawList;

    let targetTotal = 0;
    const items = [];

    for (const d of rawItems) {
      const modeSec = getDomainSecondsForMode(d, selectedTrackingMode);
      let domainSec = modeSec;

      if (tabType === 'daily') {
        domainSec = (modeDailyAvgSec > 0 && modeAllTimeSec > 0)
          ? Math.round(modeDailyAvgSec * (modeSec / modeAllTimeSec))
          : Math.round(modeSec / historyDays);
      } else if (tabType === 'total') {
        domainSec = modeSec;
      } else { // 'today'
        domainSec = modeSec;
      }

      if (selectedTrackingMode === 'background_media' && domainSec <= 0) {
        continue;
      }
      if (domainSec > 0 || (tabType === 'total' && (d.combined_seconds || d.seconds) > 0)) {
        targetTotal += domainSec;
        items.push({
          domain: d.domain,
          seconds: domainSec,
          foreground_seconds: (typeof d.foreground_seconds === 'number' ? d.foreground_seconds : (d.foregroundSeconds || d.seconds || 0)),
          background_media_seconds: (typeof d.background_media_seconds === 'number' ? d.background_media_seconds : (d.backgroundMediaSeconds || 0)),
          combined_seconds: (typeof d.combined_seconds === 'number' ? d.combined_seconds : (d.combinedSeconds || d.totalSeconds || d.seconds || 0)),
          sessions: d.session_count || d.sessionCount || 1,
          favicon: d.favicon_url || getFaviconUrl(d.domain),
          lastActive: d.last_active ? (d.last_active > 1e11 ? d.last_active : d.last_active * 1000) : (d.lastActive || Date.now()),
          isInternal: isInternalDomain(d.domain)
        });
      }
    }

    items.forEach(it => {
      const ratio = targetTotal > 0 ? (it.seconds / targetTotal) : 0;
      it.percent = ratio * 100;
    });

    items.sort((a, b) => b.seconds - a.seconds);
    return { items, totalSeconds: targetTotal };
  }

  // 2. Graceful Local Fallback Mode (chrome.storage.local activityData)
  if (!data || !data.activityData || !data.activityData.domains) {
    return { items: [], totalSeconds: 0 };
  }

  const todayStr = data.todayStr;
  const historyDays = Math.max(1, data.activityData.historyDaysCount || 1);
  const domains = data.activityData.domains;

  const items = [];
  let totalSec = 0;

  for (const [domain, entry] of Object.entries(domains)) {
    const isInternal = isInternalDomain(domain);
    if (selectedDomainCategory === 'web' && isInternal) continue;
    if (selectedDomainCategory === 'internal' && !isInternal) continue;

    const combinedTotal = entry.totalSeconds || 0;
    const fgTotal = (typeof entry.foregroundSeconds === 'number') ? entry.foregroundSeconds : combinedTotal;
    const bgTotal = entry.backgroundMediaSeconds || 0;

    const todayObj = (entry.days && entry.days[todayStr]) || null;
    const combinedToday = todayObj ? (todayObj.seconds || 0) : 0;
    const fgToday = (todayObj && typeof todayObj.foregroundSeconds === 'number') ? todayObj.foregroundSeconds : combinedToday;
    const bgToday = (todayObj && typeof todayObj.backgroundMediaSeconds === 'number') ? todayObj.backgroundMediaSeconds : 0;

    let targetTotalSec = combinedTotal;
    let targetTodaySec = combinedToday;
    if (selectedTrackingMode === 'foreground') {
      targetTotalSec = fgTotal;
      targetTodaySec = fgToday;
    } else if (selectedTrackingMode === 'background_media') {
      targetTotalSec = bgTotal;
      targetTodaySec = bgToday;
    }

    let domainSec = 0;
    let sessions = entry.sessionCount || 1;

    if (tabType === 'today') {
      domainSec = targetTodaySec;
      sessions = todayObj ? (todayObj.sessions || 1) : 1;
    } else if (tabType === 'daily') {
      domainSec = Math.round(targetTotalSec / historyDays);
    } else {
      domainSec = targetTotalSec;
    }

    if (selectedTrackingMode === 'background_media' && domainSec <= 0) {
      continue;
    }

    if (domainSec > 0 || (selectedTrackingMode !== 'background_media' && tabType === 'total' && combinedTotal > 0)) {
      items.push({
        domain,
        seconds: domainSec,
        foreground_seconds: (tabType === 'today' ? fgToday : fgTotal),
        background_media_seconds: (tabType === 'today' ? bgToday : bgTotal),
        combined_seconds: (tabType === 'today' ? combinedToday : combinedTotal),
        sessions,
        favicon: entry.favicon || getFaviconUrl(domain),
        lastActive: entry.lastActive,
        isInternal: isInternal
      });
      totalSec += domainSec;
    }
  }

  items.forEach(it => {
    it.percent = totalSec > 0 ? (it.seconds / totalSec) * 100 : 0;
  });

  items.sort((a, b) => b.seconds - a.seconds);
  return { items, totalSeconds: totalSec };
}

/**
 * Renders the pure SVG Donut chart slices
 */
function renderDonutChart(items, totalSeconds) {
  const slicesGroup = document.getElementById('donutSlicesGroup');
  const centerTimeEl = document.getElementById('donutCenterTime');
  const centerLabelEl = document.getElementById('donutCenterLabel');
  if (!slicesGroup || !centerTimeEl || !centerLabelEl) return;

  slicesGroup.innerHTML = '';

  const getLabel = () => {
    return currentTemporalTab === 'today' ? t('center_today') : (currentTemporalTab === 'daily' ? t('center_daily') : t('center_total'));
  };

  if (totalSeconds <= 0 || items.length === 0) {
    centerTimeEl.textContent = '0h 00m';
    centerLabelEl.textContent = selectedTrackingMode === 'background_media' ? t('center_bg_media') : getLabel();
    return;
  }

  centerTimeEl.textContent = formatCenterTime(totalSeconds);
  centerLabelEl.textContent = getLabel();

  const topItems = items.slice(0, 5);
  const otherItems = items.slice(5);

  const displaySlices = [...topItems];
  if (otherItems.length > 0) {
    const otherSec = otherItems.reduce((acc, curr) => acc + curr.seconds, 0);
    displaySlices.push({
      domain: t('others'),
      seconds: otherSec,
      isOther: true
    });
  }

  let accumulatedPercent = 0;

  displaySlices.forEach((slice, index) => {
    const slicePercent = slice.seconds / totalSeconds;
    const sliceLength = slicePercent * CIRCUMFERENCE;
    const offset = -(accumulatedPercent * CIRCUMFERENCE);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '100');
    circle.setAttribute('cy', '100');
    circle.setAttribute('r', '76');
    circle.setAttribute('class', 'donut-slice');
    circle.setAttribute('stroke', PALETTE[index % PALETTE.length]);
    circle.setAttribute('stroke-dasharray', `${sliceLength} ${CIRCUMFERENCE}`);
    circle.setAttribute('stroke-dashoffset', String(offset));

    circle.addEventListener('mouseenter', () => {
      centerTimeEl.textContent = formatCenterTime(slice.seconds);
      centerLabelEl.textContent = `${slice.domain} (${Math.round(slicePercent * 100)}%)`;
    });

    circle.addEventListener('mouseleave', () => {
      centerTimeEl.textContent = formatCenterTime(totalSeconds);
      centerLabelEl.textContent = getLabel();
    });

    slicesGroup.appendChild(circle);
    accumulatedPercent += slicePercent;
  });
}

/**
 * Renders domain breakdown list
 */
function renderDomainList(items, totalSeconds) {
  const container = document.getElementById('domainsListContainer');
  if (!container) return;
  container.innerHTML = '';

  updateFocusRatio(items, totalSeconds);

  const filtered = items.filter(it => {
    const isInternal = Boolean(it.isInternal || isInternalDomain(it.domain));
    if (selectedDomainCategory === 'web' && isInternal) return false;
    if (selectedDomainCategory === 'internal' && !isInternal) return false;
    if (searchQuery && !it.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (filtered.length === 0) {
    let emptyMsg = searchQuery ? t('no_matching_domain') : t('no_activity');
    let emptyIcon = '🌐';
    if (!searchQuery) {
      if (selectedTrackingMode === 'background_media') {
        emptyMsg = t('empty_bg_media');
        emptyIcon = '🎵';
      } else if (selectedTrackingMode === 'foreground') {
        emptyMsg = t('empty_foreground');
        emptyIcon = '🖥️';
      }
    } else {
      emptyIcon = '🔍';
    }
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" style="font-size: 24px; margin-bottom: 6px; display: block;">${emptyIcon}</span>
        <span>${emptyMsg}</span>
      </div>
    `;
    return;
  }

  filtered.forEach((item, idx) => {
    const pct = totalSeconds > 0 ? Math.round((item.seconds / totalSeconds) * 100) : 0;
    const color = PALETTE[idx % PALETTE.length];
    const isInternal = Boolean(item.isInternal || isInternalDomain(item.domain));

    let badgeHtml = '';
    if (item.domain === 'Dashboard' || item.domain === 'Extension') {
      badgeHtml = `<span class="badge-mini-ext">🧩 Ext</span>`;
    } else if (isInternal) {
      badgeHtml = `<span class="badge-mini-int">⚙️ Int</span>`;
    }

    const card = document.createElement('div');
    card.className = 'domain-item';
    card.innerHTML = `
      <div class="domain-item-top">
        <div class="domain-brand-group">
          <img src="${escapeHtml(item.favicon || '../icons/icon32.png')}" class="domain-favicon" alt="">
          <span class="domain-name" title="${escapeHtml(item.domain)}">${escapeHtml(item.domain)}</span>
          ${badgeHtml}
        </div>
        <div class="domain-time-group">
          <span class="domain-time">${formatDuration(item.seconds)}</span>
          <span class="domain-pct">${pct}%</span>
        </div>
      </div>
      <div class="domain-bar-bg">
        <div class="domain-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
      </div>
    `;

    const faviconImg = card.querySelector('.domain-favicon');
    if (faviconImg) {
      faviconImg.addEventListener('error', () => {
        faviconImg.src = '../icons/icon32.png';
      }, { once: true });
    }

    container.appendChild(card);
  });
}

/**
 * Renders quick stats pills
 */
function renderStatsPills(data) {
  let todaySeconds = 0;
  let dailyAvgSeconds = 0;
  let totalSessions = 0;

  const todayStats = processDomainStats(data, 'today');
  const dailyStats = processDomainStats(data, 'daily');
  todaySeconds = todayStats.totalSeconds;
  dailyAvgSeconds = dailyStats.totalSeconds;
  totalSessions = todayStats.items.reduce((acc, curr) => acc + (curr.sessions || 0), 0);

  const pToday = document.getElementById('pillTodayTime');
  const pDaily = document.getElementById('pillDailyAvg');
  const pSessions = document.getElementById('pillSessionsCount');

  if (pToday) pToday.textContent = formatCenterTime(todaySeconds);
  const pTodayHeader = document.getElementById('todayHeaderTimeText');
  const formattedToday = formatCenterTime(todaySeconds);
  if (pTodayHeader) pTodayHeader.textContent = formattedToday;
  const timeBadge = document.getElementById('todayHeaderTimeBadge');
  if (timeBadge) {
    const timeTitle = (currentLang === 'hi')
      ? `आज का कुल सक्रिय समय: ${formattedToday} (ट्रैकिंग देखने के लिए क्लिक करें)`
      : `Total Active Time Today: ${formattedToday} (Click to view Tracking)`;
    timeBadge.title = timeTitle;
    timeBadge.setAttribute('aria-label', timeTitle);
  }
  if (pDaily) pDaily.textContent = formatCenterTime(dailyAvgSeconds);
  if (pSessions) pSessions.textContent = String(totalSessions);
}

/**
 * Formats platform tag name cleanly (e.g. YouTube, Netflix, Twitch)
 */
function formatPlatformName(domain) {
  if (!domain) return 'WEB MEDIA';
  const d = domain.toLowerCase();
  if (d.includes('youtube')) return 'YOUTUBE';
  if (d.includes('netflix')) return 'NETFLIX';
  if (d.includes('twitch')) return 'TWITCH';
  if (d.includes('hotstar') || d.includes('disney')) return 'DISNEY+ HOTSTAR';
  if (d.includes('primevideo')) return 'PRIME VIDEO';
  if (d.includes('spotify')) return 'SPOTIFY';
  return domain.toUpperCase();
}

/**
 * Renders the Live Media Telemetry Card, Status Button, and Volume Progress Bar
 */
function renderMediaCard(globalMediaState) {
  const card = document.getElementById('mediaSentinelCard');
  const heading = document.getElementById('mediaStatusHeading');
  const dynamicStatusBtn = document.getElementById('dynamicStatusBtn');
  const dynamicStatusText = document.getElementById('dynamicStatusText');
  const platformTag = document.getElementById('mediaPlatformTag');
  const qualityBadge = document.getElementById('mediaQualityBadge');
  const titleText = document.getElementById('mediaTitleText');
  const progressSection = document.getElementById('mediaProgressSection');
  const progressBarFill = document.getElementById('progressBarFill');
  const timeElapsed = document.getElementById('timeElapsed');
  const timeDuration = document.getElementById('timeDuration');
  const timeProgressPercent = document.getElementById('timeProgressPercent');
  const metaRow = document.getElementById('mediaMetaRow');
  const domainBadge = document.getElementById('mediaDomainBadge');
  const resolutionBadge = document.getElementById('mediaResolutionBadge');
  const speedBadge = document.getElementById('mediaSpeedBadge');
  const volumeBadge = document.getElementById('mediaVolumeBadge');
  const controlsRow = document.getElementById('mediaControlsRow');
  const btnCtrlTogglePlay = document.getElementById('btnCtrlTogglePlay');
  const btnCtrlToggleMute = document.getElementById('btnCtrlToggleMute');
  const mediaEmptyPrompt = document.getElementById('mediaEmptyPrompt');

  // Volume UI elements
  const volumeSection = document.getElementById('mediaVolumeSection');
  const volumeIcon = document.getElementById('volumeIcon');
  const volumePercentReadout = document.getElementById('volumePercentReadout');
  const btnQuickMute = document.getElementById('btnQuickMute');
  const quickMuteText = document.getElementById('quickMuteText');
  const volumeBarFill = document.getElementById('volumeBarFill');
  const volumeBarContainer = document.getElementById('volumeBarContainer');

  if (!card || !heading || !dynamicStatusBtn || !dynamicStatusText) return;

  const pm = globalMediaState && globalMediaState.primaryMedia;
  activeMediaCached = pm;

  if (pm) {
    const isVideo = (pm.mediaType === 'video');
    const state = pm.state || (pm.isPlaying ? 'playing' : (pm.isBuffering ? 'buffering' : 'paused'));
    const isPlaying = Boolean(pm.isPlaying);
    const isBuffering = (state === 'buffering' || pm.isBuffering);
    const rawVolume = (typeof pm.volume === 'number') ? pm.volume : 1.0;
    const volPercent = (typeof pm.volumePercent === 'number') ? pm.volumePercent : Math.round(rawVolume * 100);
    const isMuted = Boolean(pm.isMuted || rawVolume <= 0.001);

    // Hide empty guidance prompt
    if (mediaEmptyPrompt) mediaEmptyPrompt.classList.add('hidden');

    // 1. Dynamic Status Button Styling & Localized Text
    dynamicStatusBtn.className = 'dynamic-status-btn';

    if (isBuffering) {
      dynamicStatusBtn.classList.add('buffering');
      dynamicStatusText.textContent = t('status_buffering');
      dynamicStatusBtn.title = t('status_buffering_title');
    } else if (isPlaying) {
      if (isMuted) {
        dynamicStatusBtn.classList.add('muted');
        dynamicStatusText.textContent = t('status_muted_playing');
        dynamicStatusBtn.title = t('status_muted_title');
      } else {
        dynamicStatusBtn.classList.add('playing');
        dynamicStatusText.textContent = t('status_playing');
        dynamicStatusBtn.title = t('status_playing_title');
      }
    } else if (state === 'paused') {
      dynamicStatusBtn.classList.add('paused');
      dynamicStatusText.textContent = t('status_paused');
      dynamicStatusBtn.title = t('status_paused_title');
    } else if (state === 'stopped') {
      dynamicStatusBtn.classList.add('stopped');
      dynamicStatusText.textContent = t('status_stopped');
      dynamicStatusBtn.title = t('status_stopped_title');
    } else {
      dynamicStatusBtn.classList.add('idle');
      dynamicStatusText.textContent = t('status_ready');
      dynamicStatusBtn.title = t('status_ready_title');
    }

    // 2. Card Background & Header
    card.className = 'media-card';
    if (isPlaying) {
      card.classList.add(isVideo ? 'playing' : 'audio');
      heading.textContent = isVideo ? t('heading_video') : t('heading_audio');
    } else if (state === 'paused') {
      card.classList.add('paused');
      heading.textContent = t('heading_paused');
    } else if (isBuffering) {
      card.classList.add('buffering');
      heading.textContent = t('heading_buffering');
    } else {
      card.classList.add('idle');
      heading.textContent = t('heading_idle');
    }

    // 3. Platform & Quality Badges
    if (platformTag) platformTag.textContent = formatPlatformName(pm.domain);
    const displayResolution = (pm.resolutionLabel && pm.resolutionLabel !== 'Audio / Unknown' && pm.resolutionLabel !== 'Unknown')
      ? pm.resolutionLabel
      : (isVideo ? 'Video (Auto)' : 'Audio Stream');
    if (qualityBadge) {
      qualityBadge.textContent = displayResolution;
      qualityBadge.className = isVideo ? 'badge badge-quality' : 'badge badge-dim';
    }

    // 4. Full Video Title (prominently displayed multi-line without truncation)
    if (titleText) {
      titleText.textContent = pm.title || pm.domain || 'Active Media Stream';
      titleText.title = pm.title || 'Video Title';
    }

    // 5. Progress Bar & Numerical Readouts
    const duration = Number(pm.duration) || 0;
    const current = Number(pm.currentTime) || 0;
    const isLive = Boolean(pm.isLive && duration <= 0);
    const pct = (duration > 0)
      ? Math.min(100, Math.max(0, (current / duration) * 100))
      : (isLive ? 100 : (Number(pm.progressPercent) || 0));

    if (progressSection) progressSection.classList.remove('hidden');
    if (!isDraggingProgress && (Date.now() - lastProgressDragTime > 600)) {
      if (progressBarFill) progressBarFill.style.width = `${pct.toFixed(1)}%`;
      if (timeElapsed) timeElapsed.textContent = formatVideoTime(current);
      if (timeDuration) timeDuration.textContent = isLive ? '🔴 LIVE' : (duration > 0 ? formatVideoTime(duration) : '--:--');
      if (timeProgressPercent) timeProgressPercent.textContent = isLive ? 'LIVE' : `${pct.toFixed(1)}%`;
      const progContainer = document.getElementById('progressBarContainer');
      if (progContainer) progContainer.setAttribute('aria-valuenow', String(Math.round(pct)));
    }

    // 6. Volume Progress Bar & Control Section
    if (volumeSection) volumeSection.classList.remove('hidden');
    if (!isDraggingVolume && (Date.now() - lastVolumeDragTime > 600)) {
      const displayVol = isMuted ? 0 : volPercent;
      if (volumeBarFill) volumeBarFill.style.width = `${displayVol}%`;
      if (volumePercentReadout) volumePercentReadout.textContent = isMuted ? t('muted_percent') : `${volPercent}%`;
      if (volumeIcon) volumeIcon.textContent = isMuted ? '🔇' : (volPercent < 40 ? '🔉' : '🔊');
      if (volumeBarContainer) volumeBarContainer.setAttribute('aria-valuenow', String(displayVol));

      if (btnQuickMute) btnQuickMute.className = isMuted ? 'btn-quick-mute is-muted' : 'btn-quick-mute';
      if (quickMuteText) quickMuteText.textContent = isMuted ? t('muted_vol') : t('normal_vol');
    }

    // 7. Metrics Row (Resolution, Speed, Volume, Domain)
    if (metaRow) metaRow.classList.remove('hidden');
    if (domainBadge) domainBadge.textContent = pm.domain || 'web';
    if (resolutionBadge) resolutionBadge.textContent = displayResolution;
    if (speedBadge) speedBadge.textContent = `⚡ ${(pm.playbackRate || 1.0).toFixed(2).replace(/\.00$/, '')}x`;
    if (volumeBadge) volumeBadge.textContent = isMuted ? t('muted_vol') : `🔊 ${volPercent}%`;

    // 8. Quick Interactive Controls Row & Speed Stepper
    if (controlsRow) controlsRow.classList.remove('hidden');
    if (btnCtrlTogglePlay) {
      btnCtrlTogglePlay.textContent = isPlaying ? t('btn_pause') : t('btn_play');
      btnCtrlTogglePlay.className = isPlaying ? 'ctrl-btn primary' : 'ctrl-btn';
    }
    if (btnCtrlToggleMute) {
      btnCtrlToggleMute.textContent = isMuted ? t('btn_unmute') : t('btn_mute');
    }

    const speedDisplay = document.getElementById('ctrlSpeedDisplay');
    if (speedDisplay) {
      speedDisplay.textContent = `⚡ ${(pm.playbackRate || 1.0).toFixed(2).replace(/\.00$/, '')}x`;
    }

    // 9. Advanced Controls Row
    const advancedRow = document.getElementById('mediaAdvancedRow');
    if (advancedRow) advancedRow.classList.remove('hidden');

    const qualityDisplay = document.getElementById('ctrlQualityDisplay');
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

    const microActionsRow = document.getElementById('playerMicroActionsRow');
    if (microActionsRow) microActionsRow.classList.remove('hidden');

    const studioBadge = document.getElementById('studioActiveTimestampBadge');
    if (studioBadge && timeElapsed) {
      studioBadge.textContent = timeElapsed.textContent || '00:00';
    }
    updateResumePlaybackCard(pm);
  } else {
    // Idle / No Media State
    card.className = 'media-card idle';
    heading.textContent = t('heading_idle');

    dynamicStatusBtn.className = 'dynamic-status-btn idle';
    dynamicStatusText.textContent = t('status_idle');
    dynamicStatusBtn.title = t('status_idle_title');

    if (platformTag) platformTag.textContent = 'NO MEDIA';
    if (qualityBadge) {
      qualityBadge.textContent = 'Idle';
      qualityBadge.className = 'badge badge-dim';
    }

    if (titleText) {
      titleText.textContent = t('no_media_detected');
      titleText.title = t('empty_prompt');
    }

    if (progressSection) progressSection.classList.add('hidden');
    if (volumeSection) volumeSection.classList.add('hidden');
    if (metaRow) metaRow.classList.add('hidden');
    if (controlsRow) controlsRow.classList.add('hidden');

    const advancedRow = document.getElementById('mediaAdvancedRow');
    if (advancedRow) advancedRow.classList.add('hidden');

    const microActionsRow = document.getElementById('playerMicroActionsRow');
    if (microActionsRow) microActionsRow.classList.add('hidden');

    if (mediaEmptyPrompt) mediaEmptyPrompt.classList.remove('hidden');
  }
}

/**
 * Updates WebSocket connection status badge
 */
function renderWebSocketBadge(isConnected) {
  const badge = document.getElementById('wsStatusBadge');
  const text = document.getElementById('wsStatusText');
  if (badge && text) {
    if (isConnected) {
      badge.className = 'ws-badge connected';
      text.textContent = t('hud_connected');
      const connTitle = `${t('hud_connected')} (ws://127.0.0.1:65432)`;
      badge.title = connTitle;
      badge.setAttribute('aria-label', connTitle);
    } else {
      badge.className = 'ws-badge disconnected';
      text.textContent = t('hud_offline');
      const offTitle = (currentLang === 'hi')
        ? `${t('hud_offline')} (Port 65432 - कनेक्ट करने के लिए क्लिक करें)`
        : `${t('hud_offline')} (Port 65432 - Click to Connect/Launch)`;
      badge.title = offTitle;
      badge.setAttribute('aria-label', offTitle);
    }
  }

  if (dashboardData) {
    renderDataHubBadge(Boolean(dataHubConnected && dataHubAnalytics !== null));
  }
}

/**
 * Updates Standalone SQLite Data Hub badge in popup header
 */
function renderDataHubBadge(isConnected) {
  const badge = document.getElementById('hubStatusBadge');
  const text = document.getElementById('hubStatusText');
  if (!badge || !text) return;

  if (isConnected) {
    badge.className = 'ws-badge connected';
    text.textContent = (currentLang === 'hi') ? 'डेटा हब सक्रिय' : 'Hub Active';
    const connTitle = (currentLang === 'hi')
      ? 'SQLite डेटा हब: सक्रिय (ws://127.0.0.1:65433)'
      : 'SQLite Data Hub: Active (ws://127.0.0.1:65433)';
    badge.title = connTitle;
    badge.setAttribute('aria-label', connTitle);
  } else {
    badge.className = 'ws-badge disconnected';
    text.textContent = (currentLang === 'hi') ? 'डेटा हब ऑफलाइन' : 'Hub Offline';
    const offTitle = (currentLang === 'hi')
      ? 'SQLite डेटा हब: ऑफलाइन (Port 65433 - कनेक्ट करने के लिए क्लिक करें)'
      : 'SQLite Data Hub: Offline (Port 65433 - Click to Connect)';
    badge.title = offTitle;
    badge.setAttribute('aria-label', offTitle);
  }
}

/**
 * Handles Dynamic Auto-Switching between Tab 1 (Media) and Tab 2 (Time Tracking)
 */
function handleAutoTabSwitching(data) {
  const pm = data && data.globalMediaState && data.globalMediaState.primaryMedia;
  const hasActiveMedia = Boolean(pm && (pm.isPlaying || pm.state === 'playing' || pm.state === 'paused' || pm.state === 'buffering'));
  const isPlayingNow = Boolean(pm && pm.isPlaying);

  // Live pulsating dot on Tab 1
  const liveDot = document.getElementById('tabMediaLiveDot');
  if (liveDot) {
    liveDot.classList.toggle('hidden', !isPlayingNow);
  }

  // 1. Initial Load: Automatically choose the right tab
  if (isInitialLoad) {
    isInitialLoad = false;
    if (hasActiveMedia) {
      switchTopTab('media', false);
    } else {
      switchTopTab('tracking', false);
    }
  }

  // 2. Playback just started while popup is open -> Auto-switch to Media tab
  if (isPlayingNow && !lastMediaPlaying) {
    switchTopTab('media', false);
    userManualOverride = false;
  }

  // 3. If no media and user hasn't explicitly chosen Media tab -> Auto-switch to Time Tracking
  if (!userManualOverride && !hasActiveMedia && activeTopTab === 'media') {
    switchTopTab('tracking', false);
  }

  lastMediaPlaying = isPlayingNow;
}

/**
 * Full dashboard refresh
 */
async function refreshDashboard(forceRefresh = false) {
  dashboardData = await fetchDashboardData(forceRefresh);
  if (!dashboardData) return;

  dataHubConnected = Boolean(dashboardData.dataHubConnected);

  // If Standalone SQLite Data Hub is connected, query analytics matching dashboard.js pattern
  if (dataHubConnected) {
    try {
      const hubRes = await new Promise((res) => {
        try {
          const p = browserAPI.runtime.sendMessage({
            type: 'QUERY_DATA_HUB',
            query: 'ANALYTICS',
            browser: selectedBrowser || 'all',
            tracking_mode: selectedTrackingMode || 'all',
            date: dashboardData.todayStr || new Date().toISOString().split('T')[0]
          }, (hr) => {
            if (browserAPI.runtime.lastError || !hr || !hr.success) {
              res(null);
            } else {
              res(hr.data || null);
            }
          });
          if (p && typeof p.catch === 'function') p.catch(() => res(null));
        } catch (_) {
          res(null);
        }
      });

      if (hubRes) {
        dataHubAnalytics = hubRes;
        renderDataHubBadge(true);
        if (Array.isArray(hubRes.registered_browsers)) {
          updateBrowserFilterOptions(hubRes.registered_browsers);
        }
      } else {
        dataHubAnalytics = null;
        renderDataHubBadge(false);
      }
    } catch (_) {
      dataHubAnalytics = null;
      renderDataHubBadge(false);
    }
  } else {
    dataHubAnalytics = null;
    renderDataHubBadge(false);
  }

  handleAutoTabSwitching(dashboardData);
  if (typeof dashboardData.isTrackingPaused === 'boolean') {
    isTrackingPaused = dashboardData.isTrackingPaused;
    updateTrackingPauseButtonUI(isTrackingPaused);
  }
  renderWebSocketBadge(dashboardData.wsConnected);
  renderMediaCard(dashboardData.globalMediaState);
  renderStatsPills(dashboardData);

  const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
  renderDonutChart(items, totalSeconds);
  renderDomainList(items, totalSeconds);
}

/**
 * Calculates volume percent from pointer coordinate and updates UI + sends command
 */
function updateVolumeFromEvent(e) {
  const container = document.getElementById('volumeBarContainer');
  const fill = document.getElementById('volumeBarFill');
  const readout = document.getElementById('volumePercentReadout');
  const icon = document.getElementById('volumeIcon');
  if (!container || !fill || !readout || !icon) return;

  const rect = container.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const percent = rect.width > 0 ? Math.round((clickX / rect.width) * 100) : 100;

  fill.style.width = `${percent}%`;
  readout.textContent = `${percent}%`;
  icon.textContent = percent === 0 ? '🔇' : (percent < 40 ? '🔉' : '🔊');
  container.setAttribute('aria-valuenow', String(percent));

  const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
    (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

  // Direct fast MAIN world scripting execution for YouTube & HTML5 video (0ms volume response)
  if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
    browserAPI.scripting.executeScript({
      target: { tabId: targetTabId, allFrames: true },
      world: 'MAIN',
      func: (volPercent) => {
        const moviePlayer = document.getElementById('movie_player') || window.movie_player;
        const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
        if (moviePlayer && typeof moviePlayer.setVolume === 'function') {
          try {
            moviePlayer.setVolume(volPercent);
            if (volPercent === 0 && typeof moviePlayer.mute === 'function') {
              moviePlayer.mute();
            } else if (volPercent > 0 && typeof moviePlayer.unMute === 'function') {
              moviePlayer.unMute();
            }
          } catch (_) {}
        }
        if (video) {
          try {
            video.volume = volPercent / 100;
            video.muted = (volPercent === 0);
          } catch (_) {}
        }
      },
      args: [percent]
    }).catch(() => {});
  }

  sendMediaControl('set_volume', { percent, volume: percent / 100 }, targetTabId);
}

/**
 * Calculates timeline seek percent from pointer coordinate and updates UI + sends command
 */
function updateProgressFromEvent(e) {
  const container = document.getElementById('progressBarContainer');
  const fill = document.getElementById('progressBarFill');
  const timeElapsed = document.getElementById('timeElapsed');
  const timeProgressPercent = document.getElementById('timeProgressPercent');
  if (!container || !fill) return;

  const rect = container.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const pct = rect.width > 0 ? Math.max(0, Math.min(100, (clickX / rect.width) * 100)) : 0;

  fill.style.width = `${pct.toFixed(1)}%`;
  if (timeProgressPercent) timeProgressPercent.textContent = `${pct.toFixed(1)}%`;
  container.setAttribute('aria-valuenow', String(Math.round(pct)));

  const pm = (activeMediaCached && activeMediaCached.tabId) ? activeMediaCached : (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia);
  const dur = (pm && Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : (activeMediaCached && activeMediaCached.duration ? activeMediaCached.duration : 0);
  const targetSeconds = dur > 0 ? (pct / 100) * dur : 0;
  if (dur > 0 && timeElapsed) {
    timeElapsed.textContent = formatVideoTime(targetSeconds);
  }

  const targetTabId = (pm && pm.tabId) || (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

  // Direct fast MAIN world scripting execution for YouTube & HTML5 video (0ms timeline seek)
  if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
    browserAPI.scripting.executeScript({
      target: { tabId: targetTabId, allFrames: true },
      world: 'MAIN',
      func: (seekPercent, seekSeconds) => {
        const moviePlayer = document.getElementById('movie_player') || window.movie_player;
        const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
        let dur = 0;
        if (moviePlayer && typeof moviePlayer.getDuration === 'function') {
          try { dur = moviePlayer.getDuration() || 0; } catch (_) {}
        }
        if ((!dur || dur <= 0) && video) {
          dur = video.duration || 0;
        }
        const target = seekSeconds > 0 ? seekSeconds : (dur > 0 ? (seekPercent / 100) * dur : 0);
        if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
          try { moviePlayer.seekTo(target, true); } catch (_) {}
        }
        if (video) {
          try { video.currentTime = target; } catch (_) {}
        }
      },
      args: [pct, targetSeconds]
    }).catch(() => {});
  }

  sendMediaControl('seek_percent', { percent: pct, positionSeconds: targetSeconds }, targetTabId);
}

// =============================================================================
// 4-Pillar Hub Architecture: State & Helper Functions
// =============================================================================

let smartAutomations = {
  auto_pause_new_tab: false,
  auto_ad_silencer: false,
  domain_speed_memory: true
};

let audioLabSettings = {
  master_boost: 100,
  audio_only: false,
  eq_preset: 'flat',
  eq_bands: {
    '60': 0,
    '250': 0,
    '1000': 0,
    '4000': 0,
    '16000': 0
  },
  vocal_clarity: false,
  night_shield: false
};

const EQ_PRESETS = {
  flat: [0, 0, 0, 0, 0],
  bass_boost: [6, 4, 1, 0, -1],
  vocal_clarify: [-3, 1, 4, 5, 2],
  rock: [5, 3, -1, 3, 5],
  night: [-4, -2, 2, 1, -3]
};

let studioNotes = [];
let studioScreenshots = [];
let lastWatchedPlayback = null;

let focusSettings = {
  doomscroll_enabled: false,
  doomscroll_interval_minutes: 30
};

let quickSettings = {
  default_tab: 'media',
  sync_interval: 2000,
  notification_sound: true,
  high_contrast: false
};

function getActiveMediaTabId() {
  return (activeMediaCached && activeMediaCached.tabId) ||
    (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId) ||
    null;
}

function persistAudioSettings() {
  try {
    browserAPI.storage.local.set({ audio_lab_settings: audioLabSettings });
  } catch (_) {}
}

function saveScreenshot(snap) {
  if (!snap) return;
  studioScreenshots.unshift(snap);
  if (studioScreenshots.length > 12) studioScreenshots.pop();
  try {
    browserAPI.storage.local.set({ studio_screenshots: studioScreenshots });
  } catch (_) {}
  renderStudioScreenshots();
}

function renderStudioNotesList() {
  const container = document.getElementById('studioNotesListContainer') || document.getElementById('studioBookmarksList');
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  if (!studioNotes || studioNotes.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state-sm';
    const span = document.createElement('span');
    span.textContent = 'No bookmarked timestamps yet. Click 📌 Pin above!';
    emptyDiv.appendChild(span);
    container.appendChild(emptyDiv);
    return;
  }
  studioNotes.forEach(note => {
    const item = document.createElement('div');
    item.className = 'studio-clip-item';

    const timeBtn = document.createElement('button');
    timeBtn.className = 'clip-time-btn';
    timeBtn.textContent = note.timestampFormatted || '00:00';
    timeBtn.title = 'Jump to timestamp';
    timeBtn.addEventListener('click', () => {
      sendMediaControl('seek_position', { position: note.timestamp });
      showPopupToast(`Jumped to ${note.timestampFormatted}`);
    });

    const contentDiv = document.createElement('div');
    contentDiv.className = 'clip-content';

    const textSpan = document.createElement('span');
    textSpan.className = 'clip-text';
    textSpan.textContent = note.text || 'Note';

    const sourceSpan = document.createElement('span');
    sourceSpan.className = 'clip-source';
    sourceSpan.textContent = note.title || 'Media';

    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(sourceSpan);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete-clip';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete note';
    delBtn.addEventListener('click', () => {
      studioNotes = studioNotes.filter(n => n.id !== note.id);
      browserAPI.storage.local.set({ studio_notes: studioNotes });
      renderStudioNotesList();
    });

    item.appendChild(timeBtn);
    item.appendChild(contentDiv);
    item.appendChild(delBtn);
    container.appendChild(item);
  });
}

function renderStudioScreenshots() {
  const container = document.getElementById('studioScreenshotsContainer') || document.getElementById('studioScreenshotsGrid');
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  if (!studioScreenshots || studioScreenshots.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state-sm';
    const span = document.createElement('span');
    span.textContent = 'Click 📸 Snap in Player to capture frames.';
    emptyDiv.appendChild(span);
    container.appendChild(emptyDiv);
    return;
  }
  studioScreenshots.slice(0, 6).forEach(snap => {
    const wrap = document.createElement('div');
    wrap.className = 'screenshot-thumb-wrap';

    const img = document.createElement('img');
    img.className = 'screenshot-thumb-img';
    img.src = snap.dataUrl;
    img.alt = snap.title || 'Snapshot';

    const overlay = document.createElement('div');
    overlay.className = 'screenshot-thumb-overlay';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-text-sm';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copy Image';
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      showPopupToast('Snapshot ready');
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete-clip';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      studioScreenshots = studioScreenshots.filter(s => s.id !== snap.id);
      browserAPI.storage.local.set({ studio_screenshots: studioScreenshots });
      renderStudioScreenshots();
    });

    overlay.appendChild(copyBtn);
    overlay.appendChild(delBtn);
    wrap.appendChild(img);
    wrap.appendChild(overlay);
    container.appendChild(wrap);
  });
}

function updateResumePlaybackCard(pm) {
  if (pm && pm.title && pm.currentTime > 5) {
    let domainStr = pm.domain || '';
    if (!domainStr && pm.url) {
      try { domainStr = new URL(pm.url).hostname; } catch (_) {}
    }
    lastWatchedPlayback = {
      title: pm.title,
      domain: domainStr,
      currentTime: pm.currentTime,
      timestampFormatted: formatTime(pm.currentTime),
      url: pm.url
    };
    try {
      browserAPI.storage.local.set({ studio_last_playback: lastWatchedPlayback });
    } catch (_) {}
  }
  const resumeCard = document.getElementById('studioResumePlaybackCard') || document.getElementById('studioResumeCard');
  const titleEl = document.getElementById('resumeVideoTitle');
  const metaEl = document.getElementById('resumeVideoMeta');
  if (resumeCard && lastWatchedPlayback) {
    resumeCard.classList.remove('hidden');
    if (titleEl) titleEl.textContent = lastWatchedPlayback.title || 'Last Watched Video';
    if (metaEl) metaEl.textContent = `${lastWatchedPlayback.domain || 'web'} • Paused at ${lastWatchedPlayback.timestampFormatted || '00:00'}`;
  }
}

function updateFocusRatio(items, totalSeconds) {
  const entertainmentDomains = new Set([
    'youtube.com', 'netflix.com', 'spotify.com', 'twitch.tv',
    'twitter.com', 'x.com', 'reddit.com', 'tiktok.com',
    'instagram.com', 'facebook.com', 'vimeo.com', 'soundcloud.com',
    'hulu.com', 'disneyplus.com', 'primevideo.com'
  ]);
  let entSeconds = 0;
  if (Array.isArray(items)) {
    for (const item of items) {
      const d = (item.domain || '').toLowerCase().replace(/^www\./, '');
      if (entertainmentDomains.has(d) || Array.from(entertainmentDomains).some(ed => d.endsWith('.' + ed))) {
        entSeconds += (item.seconds || 0);
      }
    }
  }
  const total = Math.max(0, totalSeconds || 0);
  let prodPercent = 75;
  let entPercent = 25;
  if (total > 0) {
    const prodSeconds = Math.max(0, total - entSeconds);
    prodPercent = Math.min(100, Math.max(0, Math.round((prodSeconds / total) * 100)));
    entPercent = 100 - prodPercent;
  }
  const prodBar = document.getElementById('focusRatioProductiveFill') || document.getElementById('focusRatioProductiveBar');
  const entBar = document.getElementById('focusRatioEntertainmentBar');
  const ratioText = document.getElementById('focusRatioPercentText') || document.getElementById('focusRatioText');
  if (prodBar) prodBar.style.width = prodPercent + '%';
  if (entBar) entBar.style.width = entPercent + '%';
  if (ratioText) ratioText.textContent = `${prodPercent}% Productive`;
}

let popupListenersAttached = false;

/**
 * UI Event Listeners Setup
 */
function setupEventListeners() {
  if (popupListenersAttached) return;
  popupListenersAttached = true;

  // Top Primary Multi-Tabs Navigation (6-Tab Single-Word Architecture)
  const tabMediaBtn = document.getElementById('mainTabMedia');
  const tabAudioBtn = document.getElementById('mainTabAudio');
  const tabToolsBtn = document.getElementById('mainTabTools');
  const tabStudioBtn = document.getElementById('mainTabStudio');
  const tabTrackingBtn = document.getElementById('mainTabTracking');
  const tabDomainsBtn = document.getElementById('mainTabDomains');
  const btnGoToTracking = document.getElementById('btnGoToTracking');

  if (tabMediaBtn) {
    tabMediaBtn.addEventListener('click', () => {
      switchTopTab('media', true);
    });
  }

  if (tabAudioBtn) {
    tabAudioBtn.addEventListener('click', () => {
      switchTopTab('audio', true);
    });
  }

  if (tabToolsBtn) {
    tabToolsBtn.addEventListener('click', () => {
      switchTopTab('tools', true);
    });
  }

  if (tabStudioBtn) {
    tabStudioBtn.addEventListener('click', () => {
      switchTopTab('studio', true);
    });
  }

  if (tabTrackingBtn) {
    tabTrackingBtn.addEventListener('click', () => {
      switchTopTab('tracking', true);
    });
  }

  if (tabDomainsBtn) {
    tabDomainsBtn.addEventListener('click', () => {
      switchTopTab('domains', true);
    });
  }

  if (btnGoToTracking) {
    btnGoToTracking.addEventListener('click', () => {
      switchTopTab('tracking', true);
    });
  }

  // Quick Settings Popover
  const btnQuickSettings = document.getElementById('btnQuickSettings');
  const quickSettingsPopover = document.getElementById('quickSettingsPopover');
  const btnCloseQuickSettings = document.getElementById('btnCloseQuickSettings');
  const selectDefaultTab = document.getElementById('selectDefaultTab');
  const selectSyncInterval = document.getElementById('selectSyncInterval');
  const toggleNotificationSound = document.getElementById('toggleNotificationSound');
  const toggleHighContrast = document.getElementById('toggleHighContrast');

  if (btnQuickSettings && quickSettingsPopover) {
    btnQuickSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      quickSettingsPopover.classList.toggle('hidden');
      btnQuickSettings.setAttribute('aria-expanded', String(!quickSettingsPopover.classList.contains('hidden')));
    });
  }
  if (btnCloseQuickSettings && quickSettingsPopover) {
    btnCloseQuickSettings.addEventListener('click', () => {
      quickSettingsPopover.classList.add('hidden');
      if (btnQuickSettings) btnQuickSettings.setAttribute('aria-expanded', 'false');
    });
  }
  document.addEventListener('click', (e) => {
    if (quickSettingsPopover && !quickSettingsPopover.classList.contains('hidden')) {
      if (!quickSettingsPopover.contains(e.target) && e.target !== btnQuickSettings) {
        quickSettingsPopover.classList.add('hidden');
        if (btnQuickSettings) btnQuickSettings.setAttribute('aria-expanded', 'false');
      }
    }
  });

  if (selectDefaultTab) {
    selectDefaultTab.addEventListener('change', () => {
      const validTabs = ['media', 'audio', 'tools', 'studio', 'tracking', 'domains'];
      const chosen = selectDefaultTab.value;
      quickSettings.default_tab = validTabs.includes(chosen) ? chosen : 'media';
      browserAPI.storage.local.set({ quick_settings: quickSettings });
    });
  }
  if (selectSyncInterval) {
    selectSyncInterval.addEventListener('change', () => {
      quickSettings.sync_interval = parseInt(selectSyncInterval.value, 10);
      browserAPI.storage.local.set({ quick_settings: quickSettings });
    });
  }
  if (toggleNotificationSound) {
    toggleNotificationSound.addEventListener('change', () => {
      quickSettings.notification_sound = toggleNotificationSound.checked;
      browserAPI.storage.local.set({ quick_settings: quickSettings });
    });
  }
  if (toggleHighContrast) {
    toggleHighContrast.addEventListener('change', () => {
      quickSettings.high_contrast = toggleHighContrast.checked;
      document.body.classList.toggle('high-contrast-mode', quickSettings.high_contrast);
      browserAPI.storage.local.set({ quick_settings: quickSettings });
    });
  }

  // Player Micro-Actions
  const btnCardScreenshot = document.getElementById('btnCardScreenshot');
  const btnCardCinemaDim = document.getElementById('btnCardCinemaDim');
  const btnCardLoopMedia = document.getElementById('btnCardLoopMedia');
  const btnCardNextTrack = document.getElementById('btnCardNextTrack');
  const btnCardCopyTimestamp = document.getElementById('btnCardCopyTimestamp');

  if (btnCardScreenshot) {
    btnCardScreenshot.addEventListener('click', () => {
      try {
        if (browserAPI.tabs && typeof browserAPI.tabs.captureVisibleTab === 'function') {
          browserAPI.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            if (browserAPI.runtime.lastError || !dataUrl) {
              showPopupToast(t('toast_screenshot_captured'), 'success');
              return;
            }
            saveScreenshot({
              id: 'snap_' + Date.now(),
              dataUrl: dataUrl,
              timestamp: (activeMediaCached && activeMediaCached.currentTime) || 0,
              timestampFormatted: formatTime((activeMediaCached && activeMediaCached.currentTime) || 0),
              title: (activeMediaCached && activeMediaCached.title) || 'Captured Frame',
              createdAt: Date.now()
            });
            showPopupToast(t('toast_screenshot_captured'), 'success');
          });
        } else {
          showPopupToast(t('toast_screenshot_captured'), 'success');
        }
      } catch (_) {
        showPopupToast(t('toast_screenshot_captured'), 'success');
      }
    });
  }

  let cinemaDimActive = false;
  if (btnCardCinemaDim) {
    btnCardCinemaDim.addEventListener('click', async () => {
      cinemaDimActive = !cinemaDimActive;
      btnCardCinemaDim.classList.toggle('active', cinemaDimActive);
      const targetTabId = getActiveMediaTabId();
      if (targetTabId && browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function') {
        try {
          await browserAPI.scripting.executeScript({
            target: { tabId: targetTabId },
            func: (dim) => {
              const id = 'sentinel-cinema-dimmer';
              let el = document.getElementById(id);
              if (!dim) {
                if (el) el.remove();
              } else {
                if (!el) {
                  el = document.createElement('div');
                  el.id = id;
                  el.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:999990;pointer-events:none;transition:opacity 0.25s ease;';
                  document.body.appendChild(el);
                }
              }
            },
            args: [cinemaDimActive]
          });
        } catch (_) {}
      }
      showPopupToast(t('toast_cinema_toggled'), 'success');
    });
  }

  let mediaLoopActive = false;
  if (btnCardLoopMedia) {
    btnCardLoopMedia.addEventListener('click', async () => {
      mediaLoopActive = !mediaLoopActive;
      btnCardLoopMedia.classList.toggle('active', mediaLoopActive);
      const targetTabId = getActiveMediaTabId();
      if (targetTabId && browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function') {
        try {
          await browserAPI.scripting.executeScript({
            target: { tabId: targetTabId, allFrames: true },
            func: (loop) => {
              const v = document.querySelector('video') || document.querySelector('audio');
              if (v) v.loop = loop;
            },
            args: [mediaLoopActive]
          });
        } catch (_) {}
      }
      showPopupToast(mediaLoopActive ? t('toast_loop_enabled') : t('toast_loop_disabled'), 'success');
    });
  }

  if (btnCardNextTrack) {
    btnCardNextTrack.addEventListener('click', async () => {
      const targetTabId = getActiveMediaTabId();
      if (targetTabId && browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function') {
        try {
          await browserAPI.scripting.executeScript({
            target: { tabId: targetTabId },
            world: 'MAIN',
            func: () => {
              const nextBtn = document.querySelector('.ytp-next-button');
              if (nextBtn) nextBtn.click();
            }
          });
        } catch (_) {}
      }
      sendMediaControl('next_track');
      showPopupToast('Next track triggered', 'success');
    });
  }

  if (btnCardCopyTimestamp) {
    btnCardCopyTimestamp.addEventListener('click', async () => {
      let url = (activeMediaCached && (activeMediaCached.url || activeMediaCached.tabUrl)) || '';
      const curSec = Math.floor((activeMediaCached && activeMediaCached.currentTime) || 0);
      if (!url) {
        const targetTabId = getActiveMediaTabId();
        if (targetTabId && browserAPI.tabs && browserAPI.tabs.get) {
          try {
            const tab = await browserAPI.tabs.get(targetTabId);
            if (tab && tab.url) url = tab.url;
          } catch (_) {}
        }
      }
      if (url) {
        try {
          const u = new URL(url);
          u.searchParams.set('t', curSec);
          url = u.toString();
        } catch (_) {
          url += (url.includes('?') ? '&' : '?') + 't=' + curSec;
        }
      } else {
        url = `https://youtube.com?t=${curSec}`;
      }
      try {
        await navigator.clipboard.writeText(url);
        showPopupToast(t('toast_link_copied'), 'success');
      } catch (_) {
        showPopupToast('Link: ' + url, 'success');
      }
    });
  }

  // Smart Automations toggles
  const toggleAutoPause = document.getElementById('toggleAutoPauseNewTab');
  const toggleAdSilencer = document.getElementById('toggleAutoAdSilencer') || document.getElementById('toggleAutoAdSilence');
  const toggleSpeedMem = document.getElementById('toggleDomainSpeedMemory');

  if (toggleAutoPause) {
    toggleAutoPause.addEventListener('change', () => {
      smartAutomations.auto_pause_new_tab = toggleAutoPause.checked;
      browserAPI.storage.local.set({ smart_automations: smartAutomations });
    });
  }
  if (toggleAdSilencer) {
    toggleAdSilencer.addEventListener('change', () => {
      smartAutomations.auto_ad_silencer = toggleAdSilencer.checked;
      browserAPI.storage.local.set({ smart_automations: smartAutomations });
    });
  }
  if (toggleSpeedMem) {
    toggleSpeedMem.addEventListener('change', () => {
      smartAutomations.domain_speed_memory = toggleSpeedMem.checked;
      browserAPI.storage.local.set({ smart_automations: smartAutomations });
    });
  }

  // Audio Lab Master Boost Slider
  const boostSlider = document.getElementById('audioMasterBoostSlider') || document.getElementById('masterBoostSlider');
  if (boostSlider) {
    boostSlider.addEventListener('input', () => {
      const val = Number(boostSlider.value);
      audioLabSettings.master_boost = val;
      const readout = document.getElementById('audioBoostPercentText') || document.getElementById('masterBoostReadout');
      if (readout) {
        readout.textContent = `${val}%`;
        readout.classList.toggle('is-boosted', val > 100);
      }
      const altReadout = document.getElementById('masterBoostReadout');
      if (altReadout) altReadout.textContent = `${val}%`;
      persistAudioSettings();
    });
  }

  const toggleAudioOnly = document.getElementById('toggleAudioOnlyMode');
  if (toggleAudioOnly) {
    toggleAudioOnly.addEventListener('change', () => {
      audioLabSettings.audio_only = toggleAudioOnly.checked;
      persistAudioSettings();
      showPopupToast(audioLabSettings.audio_only ? 'Audio-only battery saver on' : 'Audio-only battery saver off');
    });
  }

  const eqPresetSelect = document.getElementById('audioEqPresetSelect');
  if (eqPresetSelect) {
    eqPresetSelect.addEventListener('change', () => {
      const presetKey = eqPresetSelect.value;
      if (EQ_PRESETS[presetKey]) {
        const curve = EQ_PRESETS[presetKey];
        const bands = ['60', '250', '1000', '4000', '16000'];
        bands.forEach((b, idx) => {
          const val = curve[idx];
          audioLabSettings.eq_bands[b] = val;
          const slider = document.getElementById(`eqBand${b}`);
          if (slider) slider.value = val;
          const valSpan = document.getElementById(`eqVal${b}`) || document.getElementById(`eqReadout${b}`);
          if (valSpan) valSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
          const altSpan = document.getElementById(`eqReadout${b}`);
          if (altSpan) altSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
        });
        audioLabSettings.eq_preset = presetKey;
        persistAudioSettings();
      }
    });
  }

  const eqBandKeys = ['60', '250', '1000', '4000', '16000'];
  eqBandKeys.forEach(b => {
    const slider = document.getElementById(`eqBand${b}`);
    if (slider) {
      slider.addEventListener('input', () => {
        const val = Number(slider.value);
        audioLabSettings.eq_bands[b] = val;
        const valSpan = document.getElementById(`eqVal${b}`) || document.getElementById(`eqReadout${b}`);
        if (valSpan) valSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
        const altSpan = document.getElementById(`eqReadout${b}`);
        if (altSpan) altSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
        if (eqPresetSelect) eqPresetSelect.value = 'custom';
        audioLabSettings.eq_preset = 'custom';
        persistAudioSettings();
      });
    }
  });

  const toggleVocal = document.getElementById('toggleVocalClarity');
  if (toggleVocal) {
    toggleVocal.addEventListener('change', () => {
      audioLabSettings.vocal_clarity = toggleVocal.checked;
      persistAudioSettings();
    });
  }
  const toggleNight = document.getElementById('toggleNightShield');
  if (toggleNight) {
    toggleNight.addEventListener('change', () => {
      audioLabSettings.night_shield = toggleNight.checked;
      persistAudioSettings();
    });
  }

  // Studio Vault
  const btnPinNote = document.getElementById('btnStudioPinNote');
  const studioInput = document.getElementById('studioNoteInput');
  if (btnPinNote && studioInput) {
    const handlePin = () => {
      const text = studioInput.value.trim();
      if (!text) {
        studioInput.focus();
        return;
      }
      const curSec = (activeMediaCached && activeMediaCached.currentTime) || 0;
      const newNote = {
        id: 'note_' + Date.now(),
        timestamp: curSec,
        timestampFormatted: formatTime(curSec),
        title: (activeMediaCached && activeMediaCached.title) || 'Web Media',
        url: (activeMediaCached && (activeMediaCached.url || activeMediaCached.tabUrl)) || '',
        text: text,
        createdAt: Date.now()
      };
      studioNotes.unshift(newNote);
      browserAPI.storage.local.set({ studio_notes: studioNotes });
      studioInput.value = '';
      renderStudioNotesList();
      showPopupToast(t('toast_note_pinned'), 'success');
    };
    btnPinNote.addEventListener('click', handlePin);
    studioInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handlePin();
    });
  }

  const btnClearBookmarks = document.getElementById('btnClearStudioBookmarks');
  if (btnClearBookmarks) {
    btnClearBookmarks.addEventListener('click', () => {
      studioNotes = [];
      browserAPI.storage.local.set({ studio_notes: [] });
      renderStudioNotesList();
      showPopupToast('Bookmarks cleared');
    });
  }

  const btnResumeMedia = document.getElementById('btnStudioResumePlayback') || document.getElementById('btnStudioResumeLastMedia');
  if (btnResumeMedia) {
    btnResumeMedia.addEventListener('click', () => {
      if (lastWatchedPlayback) {
        sendMediaControl('seek_position', { position: lastWatchedPlayback.currentTime });
        sendMediaControl('toggle_play');
        showPopupToast(`Resumed: ${lastWatchedPlayback.title}`);
      }
    });
  }

  // Focus & Digital Wellness
  const toggleDoomscroll = document.getElementById('toggleDoomscrollBreaker');
  const selectDoomscroll = document.getElementById('selectDoomscrollInterval') || document.getElementById('doomscrollIntervalSelect');
  if (toggleDoomscroll) {
    toggleDoomscroll.addEventListener('change', () => {
      focusSettings.doomscroll_enabled = toggleDoomscroll.checked;
      browserAPI.storage.local.set({ focus_settings: focusSettings });
      showPopupToast(focusSettings.doomscroll_enabled ? 'Doomscroll breaker enabled' : 'Doomscroll breaker disabled');
    });
  }
  if (selectDoomscroll) {
    selectDoomscroll.addEventListener('change', () => {
      focusSettings.doomscroll_interval_minutes = parseInt(selectDoomscroll.value, 10);
      browserAPI.storage.local.set({ focus_settings: focusSettings });
    });
  }

  if (btnGoToTracking) {
    btnGoToTracking.addEventListener('click', () => {
      switchTopTab('tracking', true);
    });
  }

  // Temporal Sub-Tabs Navigation (Today | Daily Avg | Total Time)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTemporalTab = btn.getAttribute('data-tab');

      if (dashboardData) {
        const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
        renderDonutChart(items, totalSeconds);
        renderDomainList(items, totalSeconds);
      }
    });
  });

  // Multi-Browser Dropdown Filter
  const browserFilterSelect = document.getElementById('browserFilterSelect');
  if (browserFilterSelect) {
    browserFilterSelect.value = selectedBrowser;
    browserFilterSelect.addEventListener('change', async (e) => {
      selectedBrowser = e.target.value;
      await browserAPI.storage.local.set({ selected_browser_filter: selectedBrowser });
      await refreshDashboard(false);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showPopupToast(`Filter: ${selectedText}`, 'info');
    });
  }

  // Tracking Mode Selector
  const trackingModeSelect = document.getElementById('trackingModeSelect');
  if (trackingModeSelect) {
    trackingModeSelect.value = selectedTrackingMode;
    trackingModeSelect.addEventListener('change', async (e) => {
      selectedTrackingMode = e.target.value;
      await browserAPI.storage.local.set({ selected_tracking_mode: selectedTrackingMode });
      await refreshDashboard(false);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showPopupToast(`Tracking: ${selectedText}`, 'info');
    });
  }

  // Domain Category Scheme Filter
  const domainCategorySelect = document.getElementById('domainCategorySelect');
  if (domainCategorySelect) {
    domainCategorySelect.value = selectedDomainCategory;
    domainCategorySelect.addEventListener('change', async (e) => {
      selectedDomainCategory = e.target.value;
      await browserAPI.storage.local.set({ selected_domain_category: selectedDomainCategory });
      await refreshDashboard(false);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showPopupToast(`Category: ${selectedText}`, 'info');
    });
  }

  // Domain search filter
  const searchInput = document.getElementById('domainSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (dashboardData) {
        const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
        renderDomainList(items, totalSeconds);
      }
    });
  }

  // Action Buttons: 1. Refresh Telemetry
  const btnRefresh = document.getElementById('btnRefresh');
  let isRefreshing = false;
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      if (isRefreshing) return;
      isRefreshing = true;
      btnRefresh.classList.add('spinning');
      btnRefresh.disabled = true;

      try {
        await refreshDashboard(true);
        showPopupToast(t('toast_refreshed'), 'success');
      } catch (_) {
        showPopupToast(t('toast_refreshed'), 'success');
      } finally {
        setTimeout(() => {
          btnRefresh.classList.remove('spinning');
          btnRefresh.disabled = false;
          isRefreshing = false;
        }, 650);
      }
    });
  }

  // 2. Connect HUD / Auto-Launch Desktop Overlay
  let hudLaunchInProgress = false;

  function handleConnectOrLaunchHUD() {
    if (dashboardData && dashboardData.wsConnected) {
      showPopupToast(t('toast_hud_already'), 'success');
      return;
    }

    if (hudLaunchInProgress) return;
    hudLaunchInProgress = true;

    const badge = document.getElementById('wsStatusBadge');
    const text = document.getElementById('wsStatusText');
    const btnText = document.getElementById('btnReconnectWsText');

    if (badge) badge.className = 'ws-badge starting';
    if (text) text.textContent = t('hud_starting');
    if (btnText) btnText.textContent = t('hud_starting');

    showPopupToast(t('toast_hud_launching'), 'starting');

    // 1. Dispatch Native Messaging Host request
    try {
      const p1 = browserAPI.runtime.sendMessage({ type: 'LAUNCH_DESKTOP_HUD' }, (res) => {
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
      if (p1 && typeof p1.catch === 'function') p1.catch(() => {});
    } catch (_) {}

    try {
      const p2 = browserAPI.runtime.sendMessage({ type: 'TRIGGER_WS_RECONNECT' });
      if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
    } catch (_) {}

    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      const data = await fetchDashboardData(true);
      if (data && data.wsConnected) {
        clearInterval(pollInterval);
        hudLaunchInProgress = false;
        renderWebSocketBadge(true);
        if (btnText) btnText.textContent = t('btn_connect_hud');
        showPopupToast(t('toast_hud_connected'), 'success');
        refreshDashboard(true);
      } else if (attempts >= 7) {
        clearInterval(pollInterval);
        hudLaunchInProgress = false;
        if (btnText) btnText.textContent = t('btn_connect_hud');
        if (!data || !data.wsConnected) {
          renderWebSocketBadge(false);
          showPopupToast(t('toast_hud_failed'), 'danger');
        }
      }
    }, 1100);
  }

  const wsBadge = document.getElementById('wsStatusBadge');
  if (wsBadge) {
    wsBadge.addEventListener('click', handleConnectOrLaunchHUD);
  }

  const hubBadge = document.getElementById('hubStatusBadge');
  if (hubBadge) {
    let popupHubConnecting = false;
    hubBadge.addEventListener('click', () => {
      if (popupHubConnecting) return;
      popupHubConnecting = true;
      const hubText = document.getElementById('hubStatusText');
      if (hubText) hubText.textContent = (currentLang === 'hi') ? 'कनेक्ट हो रहा है...' : 'Connecting...';
      hubBadge.className = 'ws-badge starting';

      try {
        const p = browserAPI.runtime.sendMessage({ type: 'LAUNCH_DATA_HUB' });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
      showPopupToast((currentLang === 'hi') ? 'SQLite Data Hub (पोर्ट 65433) से कनेक्ट किया जा रहा है...' : 'Connecting to SQLite Data Hub (port 65433)...', 'info');

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const res = await fetchDashboardData(true);
        if (res && res.dataHubConnected) {
          clearInterval(pollInterval);
          popupHubConnecting = false;
          renderDataHubBadge(true);
          showPopupToast((currentLang === 'hi') ? 'SQLite Data Hub सफलतापूर्वक कनेक्ट हो गया!' : 'SQLite Data Hub connected successfully!', 'success');
          refreshDashboard(true);
        } else if (attempts >= 10) {
          clearInterval(pollInterval);
          popupHubConnecting = false;
          if (!res || !res.dataHubConnected) {
            renderDataHubBadge(false);
            showPopupToast((currentLang === 'hi') ? 'SQLite Data Hub से कनेक्ट नहीं हो सका' : 'Could not connect to SQLite Data Hub', 'danger');
          }
        }
      }, 500);
    });
  }

  const btnReconnectWs = document.getElementById('btnReconnectWs') || document.getElementById('btnConnectHud');
  if (btnReconnectWs) {
    btnReconnectWs.addEventListener('click', handleConnectOrLaunchHUD);
  }

  // 3. Switch to Active Media Tab (टैब स्विच) Button
  const btnSwitchMediaTab = document.getElementById('btnSwitchMediaTab');
  if (btnSwitchMediaTab) {
    btnSwitchMediaTab.addEventListener('click', () => {
      const pm = (activeMediaCached && activeMediaCached.tabId)
        ? activeMediaCached
        : (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia);
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
      const targetWindowId = (pm && pm.windowId) ? pm.windowId : undefined;
      try {
        const p = browserAPI.runtime.sendMessage({
          type: 'JUMP_TO_MEDIA_TAB',
          tabId: targetTabId,
          windowId: targetWindowId
        }, (res) => {
          if (res && res.success) {
            showPopupToast(t('toast_switched_tab'), 'success');
          } else {
            showPopupToast(t('toast_no_media_tab'), 'danger');
          }
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    });
  }

  // 4. Open Full Dashboard
  const btnOpenDashboard = document.getElementById('btnOpenDashboard');
  if (btnOpenDashboard) {
    btnOpenDashboard.addEventListener('click', () => {
      const dashboardUrl = browserAPI.runtime.getURL('dashboard/dashboard.html');
      browserAPI.tabs.create({ url: dashboardUrl });
    });
  }

  // 5. Global Media Toggle Across Tabs
  const btnGlobalMediaToggle = document.getElementById('btnGlobalMediaToggle');
  if (btnGlobalMediaToggle) {
    btnGlobalMediaToggle.addEventListener('click', () => {
      try {
        const p = browserAPI.runtime.sendMessage({ type: 'TOGGLE_GLOBAL_MEDIA' }, (res) => {
          if (res && res.action) {
            showPopupToast(res.action === 'PAUSE_ALL' ? 'Paused all media' : 'Resumed media', 'info');
          }
          refreshDashboard(true);
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    });
  }

  // 5b. Time Tracking Pause / Resume Button
  const btnToggleTrackingPause = document.getElementById('btnToggleTrackingPause');
  if (btnToggleTrackingPause) {
    btnToggleTrackingPause.addEventListener('click', () => {
      try {
        const p = browserAPI.runtime.sendMessage({ type: 'TOGGLE_TRACKING_PAUSE' }, (res) => {
          if (res && typeof res.isTrackingPaused === 'boolean') {
            isTrackingPaused = res.isTrackingPaused;
            updateTrackingPauseButtonUI(isTrackingPaused);
            if (isTrackingPaused) {
              showPopupToast(t('toast_tracking_paused'), 'info');
            } else {
              showPopupToast(t('toast_tracking_resumed'), 'success');
            }
          }
          refreshDashboard(true);
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    });
  }

  // 6. Sleep Timer Launcher & Popover Management
  const btnSleepTrigger = document.getElementById('btnSleepTimerTrigger');
  const sleepPopover = document.getElementById('sleepTimerPopover');
  const btnCloseSleepPopover = document.getElementById('btnCloseSleepPopover');

  const toggleSleepPopover = (forceOpen) => {
    if (!sleepPopover) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : sleepPopover.classList.contains('hidden');
    if (shouldOpen) {
      sleepPopover.classList.remove('hidden');
      if (btnSleepTrigger) btnSleepTrigger.setAttribute('aria-expanded', 'true');
      syncSleepTimerState();
    } else {
      sleepPopover.classList.add('hidden');
      if (btnSleepTrigger) btnSleepTrigger.setAttribute('aria-expanded', 'false');
    }
  };

  if (btnSleepTrigger) {
    btnSleepTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSleepPopover();
    });
  }

  if (btnCloseSleepPopover) {
    btnCloseSleepPopover.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSleepPopover(false);
    });
  }

  document.addEventListener('click', (e) => {
    if (sleepPopover && !sleepPopover.classList.contains('hidden')) {
      if (!sleepPopover.contains(e.target) && (!btnSleepTrigger || !btnSleepTrigger.contains(e.target))) {
        toggleSleepPopover(false);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sleepPopover && !sleepPopover.classList.contains('hidden')) {
      toggleSleepPopover(false);
    }
  });

  // Preset Buttons (15m, 30m, 45m, 60m)
  const presetBtns = document.querySelectorAll('.preset-pill-btn');
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.getAttribute('data-minutes'), 10) || 15;
      const fadeToggle = document.getElementById('toggleSleepFade');
      const enableFade = fadeToggle ? fadeToggle.checked : true;

      try {
        const p = browserAPI.runtime.sendMessage({
          type: 'SET_SLEEP_TIMER',
          durationMinutes: minutes,
          enableFade: enableFade
        }, (res) => {
          if (res && res.success && res.state) {
            renderSleepTimerUI(res.state);
            showPopupToast(`Sleep timer set for ${minutes}m`, 'success');
          }
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    });
  });

  // Custom Timer
  const btnSetCustom = document.getElementById('btnSetCustomTimer');
  const customInput = document.getElementById('customTimerInput');
  const handleSetCustomTimer = () => {
    if (!customInput) return;
    const mins = parseInt(customInput.value, 10);
    if (isNaN(mins) || mins < 1 || mins > 1440) {
      showPopupToast('Enter valid minutes (1-1440)', 'danger');
      return;
    }
    const fadeToggle = document.getElementById('toggleSleepFade');
    const enableFade = fadeToggle ? fadeToggle.checked : true;

    try {
      const p = browserAPI.runtime.sendMessage({
        type: 'SET_SLEEP_TIMER',
        durationMinutes: mins,
        enableFade: enableFade
      }, (res) => {
        if (res && res.success && res.state) {
          renderSleepTimerUI(res.state);
          showPopupToast(`Sleep timer set for ${mins}m`, 'success');
          customInput.value = '';
        }
      });
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_) {}
  };

  if (btnSetCustom) {
    btnSetCustom.addEventListener('click', handleSetCustomTimer);
  }
  if (customInput) {
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSetCustomTimer();
    });
  }

  // Cancel Timer
  const btnCancelActive = document.getElementById('btnCancelActiveTimer');
  if (btnCancelActive) {
    btnCancelActive.addEventListener('click', () => {
      try {
        const p = browserAPI.runtime.sendMessage({ type: 'CANCEL_SLEEP_TIMER' }, (res) => {
          if (res && res.success) {
            renderSleepTimerUI({ state: 'IDLE' });
            showPopupToast('Sleep timer cancelled', 'info');
          }
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    });
  }

  // Media Controls
  const handleTogglePlay = () => {
    if (activeMediaCached) {
      activeMediaCached.isPlaying = !activeMediaCached.isPlaying;
      renderMediaCard({ primaryMedia: activeMediaCached });
    }
    const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
      (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({
        target: { tabId: targetTabId },
        func: () => {
          const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
          if (video) {
            if (video.paused) {
              const p = video.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            } else {
              video.pause();
            }
          }
        }
      }).catch(() => {});
    }
    sendMediaControl('toggle_play');
  };

  const dynamicStatusBtn = document.getElementById('dynamicStatusBtn');
  if (dynamicStatusBtn) dynamicStatusBtn.addEventListener('click', handleTogglePlay);

  const btnCtrlTogglePlay = document.getElementById('btnCtrlTogglePlay');
  if (btnCtrlTogglePlay) btnCtrlTogglePlay.addEventListener('click', handleTogglePlay);

  const btnRewind = document.getElementById('btnCtrlRewind');
  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      if (activeMediaCached && typeof activeMediaCached.currentTime === 'number') {
        activeMediaCached.currentTime = Math.max(0, activeMediaCached.currentTime - 10);
        renderMediaCard({ primaryMedia: activeMediaCached });
      }
      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId },
          func: () => {
            const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
            if (video) {
              video.currentTime = Math.max(0, video.currentTime - 10);
            }
          }
        }).catch(() => {});
      }
      sendMediaControl('seek_relative', { offsetSeconds: -10 });
    });
  }

  const btnForward = document.getElementById('btnCtrlForward');
  if (btnForward) {
    btnForward.addEventListener('click', () => {
      if (activeMediaCached && typeof activeMediaCached.currentTime === 'number') {
        activeMediaCached.currentTime = activeMediaCached.currentTime + 10;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }
      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId },
          func: () => {
            const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
            if (video) {
              const maxDur = (Number.isFinite(video.duration) && video.duration > 0) ? video.duration : 999999;
              video.currentTime = Math.min(maxDur, video.currentTime + 10);
            }
          }
        }).catch(() => {});
      }
      sendMediaControl('seek_relative', { offsetSeconds: 10 });
    });
  }

  const handleToggleMute = () => {
    if (activeMediaCached) {
      activeMediaCached.isMuted = !activeMediaCached.isMuted;
      renderMediaCard({ primaryMedia: activeMediaCached });
    }
    const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
      (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({
        target: { tabId: targetTabId },
        func: () => {
          const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
          if (video) {
            video.muted = !video.muted;
          }
        }
      }).catch(() => {});
    }
    sendMediaControl('toggle_mute');
  };

  const btnCtrlToggleMute = document.getElementById('btnCtrlToggleMute');
  if (btnCtrlToggleMute) {
    btnCtrlToggleMute.addEventListener('click', handleToggleMute);
  }

  const btnQuickMute = document.getElementById('btnQuickMute');
  if (btnQuickMute) {
    btnQuickMute.addEventListener('click', handleToggleMute);
  }

  const btnSpeedDown = document.getElementById('btnCtrlSpeedDown');
  if (btnSpeedDown) {
    btnSpeedDown.addEventListener('click', () => {
      const cur = (activeMediaCached && typeof activeMediaCached.playbackRate === 'number')
        ? activeMediaCached.playbackRate
        : 1.0;
      const targetSpeed = calculateNextLadderSpeed(cur, 'down');

      if (activeMediaCached) {
        activeMediaCached.playbackRate = targetSpeed;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }

      const speedDisplay = document.getElementById('ctrlSpeedDisplay');
      if (speedDisplay) {
        speedDisplay.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }
      const speedBadge = document.getElementById('mediaSpeedBadge');
      if (speedBadge) {
        speedBadge.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }

      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId, allFrames: true },
          world: 'MAIN',
          func: (spd) => {
            const p = document.getElementById('movie_player') || window.movie_player;
            if (p && typeof p.setPlaybackRate === 'function') {
              try { p.setPlaybackRate(spd); } catch (_) {}
            }
            const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
            if (video) {
              try { video.playbackRate = spd; } catch (_) {}
            }
          },
          args: [targetSpeed]
        }).catch(() => {});
      }

      sendMediaControl('step_speed', { direction: 'down', targetSpeed, step: -0.25 }, targetTabId);
    });
  }

  const btnSpeedUp = document.getElementById('btnCtrlSpeedUp');
  if (btnSpeedUp) {
    btnSpeedUp.addEventListener('click', () => {
      const cur = (activeMediaCached && typeof activeMediaCached.playbackRate === 'number')
        ? activeMediaCached.playbackRate
        : 1.0;
      const targetSpeed = calculateNextLadderSpeed(cur, 'up');

      if (activeMediaCached) {
        activeMediaCached.playbackRate = targetSpeed;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }

      const speedDisplay = document.getElementById('ctrlSpeedDisplay');
      if (speedDisplay) {
        speedDisplay.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }
      const speedBadge = document.getElementById('mediaSpeedBadge');
      if (speedBadge) {
        speedBadge.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }

      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId, allFrames: true },
          world: 'MAIN',
          func: (spd) => {
            const p = document.getElementById('movie_player') || window.movie_player;
            if (p && typeof p.setPlaybackRate === 'function') {
              try { p.setPlaybackRate(spd); } catch (_) {}
            }
            const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
            if (video) {
              try { video.playbackRate = spd; } catch (_) {}
            }
          },
          args: [targetSpeed]
        }).catch(() => {});
      }

      sendMediaControl('step_speed', { direction: 'up', targetSpeed, step: 0.25 }, targetTabId);
    });
  }

  let lastFullscreenClick = 0;
  let lastPipClick = 0;

  const btnFullscreen = document.getElementById('btnCtrlFullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', async () => {
      const now = Date.now();
      if (now - lastFullscreenClick < 350) return;
      lastFullscreenClick = now;

      let targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      // Resolve active tabId reliably if not cached yet
      if (!targetTabId && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
        try {
          const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
          if (tabs && tabs[0] && tabs[0].id) {
            targetTabId = tabs[0].id;
          }
        } catch (_) {}
      }

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId },
          world: 'MAIN',
          func: () => {
            const ctrl = window.__SentinelFullscreenController || globalThis.__SentinelFullscreenController;
            if (ctrl && typeof ctrl.toggleWebFullscreen === 'function') {
              ctrl.toggleWebFullscreen();
              return;
            }
            if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
              window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
              return;
            }

            // Cross-world CustomEvent bridge
            try {
              window.dispatchEvent(new CustomEvent('__SENTINEL_FULLSCREEN_ACTION__', {
                detail: { action: 'toggle', options: { forceWeb: true } }
              }));
            } catch (_) {}

            const hasWebFs = Boolean(document.querySelector('.sentinel-web-fullscreen'));
            if (document.fullscreenElement || hasWebFs) {
              if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
              }
              const webFsEl = document.querySelectorAll('.sentinel-web-fullscreen');
              webFsEl.forEach(el => el.classList.remove('sentinel-web-fullscreen'));
              if (document.body) {
                document.body.classList.remove('sentinel-fullscreen-active');
                document.body.classList.remove('sentinel-has-web-fullscreen');
              }
              if (document.documentElement) {
                document.documentElement.classList.remove('sentinel-fullscreen-active');
                document.documentElement.classList.remove('sentinel-has-web-fullscreen');
              }
              const moviePlayer = document.getElementById('movie_player');
              if (moviePlayer) moviePlayer.classList.remove('ytp-fullscreen');
              const flexy = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
              if (flexy && !document.fullscreenElement) {
                try { flexy.removeAttribute('fullscreen'); } catch (_) {}
              }
              window.dispatchEvent(new Event('resize'));
            } else {
              const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
              const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
              const target = player || (video && video.parentElement) || video;
              const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') || document.querySelector('.ytp-fullscreen-button');

              let nativeTriggered = false;
              if (ytFsBtn) {
                try {
                  ytFsBtn.click();
                  nativeTriggered = true;
                } catch (_) {}
              } else if (player && typeof player.toggleFullscreen === 'function') {
                try {
                  player.toggleFullscreen();
                  nativeTriggered = true;
                } catch (_) {}
              } else if (player) {
                try {
                  const ev = new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true });
                  player.dispatchEvent(ev);
                  nativeTriggered = true;
                } catch (_) {}
              }

              const applyWebFs = () => {
                if (target) target.classList.add('sentinel-web-fullscreen');
                if (document.body) {
                  document.body.classList.add('sentinel-fullscreen-active');
                  document.body.classList.add('sentinel-has-web-fullscreen');
                }
                if (document.documentElement) {
                  document.documentElement.classList.add('sentinel-fullscreen-active');
                  document.documentElement.classList.add('sentinel-has-web-fullscreen');
                }
                if (player) player.classList.add('ytp-fullscreen');
                const flexy = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
                if (flexy) {
                  try { flexy.setAttribute('fullscreen', ''); } catch (_) {}
                }
                window.dispatchEvent(new Event('resize'));
              };

              if (target && target.requestFullscreen && !document.fullscreenElement && !nativeTriggered) {
                target.requestFullscreen().catch(() => {
                  applyWebFs();
                });
              } else if (!document.fullscreenElement && !nativeTriggered) {
                applyWebFs();
              }
            }
          }
        }).catch(() => {
          sendMediaControl('toggle_fullscreen', {}, targetTabId);
        });
      } else {
        // Fallback only when scripting API or tabId is unavailable
        sendMediaControl('toggle_fullscreen');
      }
    });
  }

  const btnPip = document.getElementById('btnCtrlPip');
  if (btnPip) {
    btnPip.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastPipClick < 350) return;
      lastPipClick = now;

      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId },
          func: () => {
            const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
            if (!video) return;
            if (document.pictureInPictureElement) {
              if (document.exitPictureInPicture) document.exitPictureInPicture().catch(() => {});
            } else if (video.requestPictureInPicture) {
              video.requestPictureInPicture().catch(() => {});
            }
          }
        }).catch(() => {});
      } else {
        // Fallback only when scripting API or tabId is unavailable
        sendMediaControl('toggle_pip');
      }
    });
  }

  const btnTheater = document.getElementById('btnCtrlTheater');
  if (btnTheater) {
    btnTheater.addEventListener('click', () => {
      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId, allFrames: true },
          world: 'MAIN',
          func: () => {
            const btn = document.querySelector('.ytp-size-button');
            if (btn) {
              btn.click();
            } else {
              try {
                const ev = new KeyboardEvent('keydown', { key: 't', code: 'KeyT', keyCode: 84, which: 84, bubbles: true });
                (document.getElementById('movie_player') || document).dispatchEvent(ev);
              } catch (_) {}
            }
          }
        }).catch(() => {});
      }
      sendMediaControl('toggle_theater', {}, targetTabId);
    });
  }

  const btnQualityDown = document.getElementById('btnCtrlQualityDown');
  if (btnQualityDown) {
    btnQualityDown.addEventListener('click', () => {
      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId, allFrames: true },
          world: 'MAIN',
          func: () => {
            const p = document.getElementById('movie_player') || window.movie_player;
            if (p) {
              const ladder = ['tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'];
              let avail = [];
              if (typeof p.getAvailableQualityLevels === 'function') {
                try { avail = p.getAvailableQualityLevels() || []; } catch (_) {}
              }
              const valid = ladder.filter(q => avail.includes(q));
              const list = valid.length > 0 ? valid : ladder;
              let cur = (typeof p.getPlaybackQuality === 'function') ? (p.getPlaybackQuality() || '') : '';
              let idx = list.indexOf(cur);
              if (idx === -1) idx = Math.floor(list.length / 2);
              const nextIdx = Math.max(0, idx - 1);
              const target = list[nextIdx];
              if (typeof p.setPlaybackQualityRange === 'function') {
                try { p.setPlaybackQualityRange(target, target); } catch (_) {}
              }
              if (typeof p.setPlaybackQuality === 'function') {
                try { p.setPlaybackQuality(target); } catch (_) {}
              }
            }
          }
        }).catch(() => {});
      }
      sendMediaControl('step_quality', { direction: 'down' }, targetTabId);
    });
  }

  const btnQualityUp = document.getElementById('btnCtrlQualityUp');
  if (btnQualityUp) {
    btnQualityUp.addEventListener('click', () => {
      const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId, allFrames: true },
          world: 'MAIN',
          func: () => {
            const p = document.getElementById('movie_player') || window.movie_player;
            if (p) {
              const ladder = ['tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'];
              let avail = [];
              if (typeof p.getAvailableQualityLevels === 'function') {
                try { avail = p.getAvailableQualityLevels() || []; } catch (_) {}
              }
              const valid = ladder.filter(q => avail.includes(q));
              const list = valid.length > 0 ? valid : ladder;
              let cur = (typeof p.getPlaybackQuality === 'function') ? (p.getPlaybackQuality() || '') : '';
              let idx = list.indexOf(cur);
              if (idx === -1) idx = Math.floor(list.length / 2);
              const nextIdx = Math.min(list.length - 1, idx + 1);
              const target = list[nextIdx];
              if (typeof p.setPlaybackQualityRange === 'function') {
                try { p.setPlaybackQualityRange(target, target); } catch (_) {}
              }
              if (typeof p.setPlaybackQuality === 'function') {
                try { p.setPlaybackQuality(target); } catch (_) {}
              }
            }
          }
        }).catch(() => {});
      }
      sendMediaControl('step_quality', { direction: 'up' }, targetTabId);
    });
  }

  // Progress Bar Seeking & Dragging (Timeline Movement)
  const progressContainer = document.getElementById('progressBarContainer');
  if (progressContainer) {
    progressContainer.addEventListener('pointerdown', (e) => {
      isDraggingProgress = true;
      progressContainer.classList.add('dragging');
      try {
        progressContainer.setPointerCapture(e.pointerId);
      } catch (_) {}
      updateProgressFromEvent(e);
    });

    progressContainer.addEventListener('pointermove', (e) => {
      if (isDraggingProgress) {
        updateProgressFromEvent(e);
      }
    });

    const stopProgressDrag = (e) => {
      if (isDraggingProgress) {
        isDraggingProgress = false;
        lastProgressDragTime = Date.now();
        progressContainer.classList.remove('dragging');
        try {
          progressContainer.releasePointerCapture(e.pointerId);
        } catch (_) {}
        updateProgressFromEvent(e);
      }
    };

    progressContainer.addEventListener('pointerup', stopProgressDrag);
    progressContainer.addEventListener('pointercancel', stopProgressDrag);
  }

  // Volume Bar Scrubbing & Dragging
  const volumeContainer = document.getElementById('volumeBarContainer');
  if (volumeContainer) {
    volumeContainer.addEventListener('pointerdown', (e) => {
      isDraggingVolume = true;
      volumeContainer.classList.add('dragging');
      try {
        volumeContainer.setPointerCapture(e.pointerId);
      } catch (_) {}
      updateVolumeFromEvent(e);
    });

    volumeContainer.addEventListener('pointermove', (e) => {
      if (isDraggingVolume) {
        updateVolumeFromEvent(e);
      }
    });

    const stopVolumeDrag = (e) => {
      if (isDraggingVolume) {
        isDraggingVolume = false;
        lastVolumeDragTime = Date.now();
        volumeContainer.classList.remove('dragging');
        try {
          volumeContainer.releasePointerCapture(e.pointerId);
        } catch (_) {}
        updateVolumeFromEvent(e);
      }
    };

    volumeContainer.addEventListener('pointerup', stopVolumeDrag);
    volumeContainer.addEventListener('pointercancel', stopVolumeDrag);
  }
}

// Bootstrap Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  // Load language preference, browser filter, tracking mode, and category from storage
  browserAPI.storage.local.get([
    'language',
    'media_sentinel_settings',
    'selected_browser_filter',
    'selected_tracking_mode',
    'selected_domain_category',
    'sentinel_tracking_paused',
    'active_popup_tab',
    'smart_automations',
    'audio_lab_settings',
    'studio_notes',
    'studio_screenshots',
    'studio_last_playback',
    'focus_settings',
    'quick_settings'
  ], (res) => {
    let lang = 'en';
    if (res && res.language) {
      lang = res.language;
    } else if (res && res.media_sentinel_settings && res.media_sentinel_settings.language) {
      lang = res.media_sentinel_settings.language;
    }
    if (res && typeof res.sentinel_tracking_paused === 'boolean') {
      isTrackingPaused = res.sentinel_tracking_paused;
      updateTrackingPauseButtonUI(isTrackingPaused);
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

    // Hydrate 6-Tab Architecture States
    const validTabs = ['media', 'audio', 'tools', 'studio', 'tracking', 'domains'];
    if (res && res.active_popup_tab && validTabs.includes(res.active_popup_tab)) {
      switchTopTab(res.active_popup_tab, false);
    } else if (res && res.quick_settings && res.quick_settings.default_tab && validTabs.includes(res.quick_settings.default_tab)) {
      switchTopTab(res.quick_settings.default_tab, false);
    }

    if (res && res.smart_automations) {
      smartAutomations = { ...smartAutomations, ...res.smart_automations };
      const tAutoPause = document.getElementById('toggleAutoPauseNewTab');
      if (tAutoPause) tAutoPause.checked = Boolean(smartAutomations.auto_pause_new_tab);
      const tAdSilencer = document.getElementById('toggleAutoAdSilencer') || document.getElementById('toggleAutoAdSilence');
      if (tAdSilencer) tAdSilencer.checked = Boolean(smartAutomations.auto_ad_silencer);
      const tSpeedMem = document.getElementById('toggleDomainSpeedMemory');
      if (tSpeedMem) tSpeedMem.checked = Boolean(smartAutomations.domain_speed_memory);
    }

    if (res && res.audio_lab_settings) {
      audioLabSettings = { ...audioLabSettings, ...res.audio_lab_settings };
      const bSlider = document.getElementById('audioMasterBoostSlider') || document.getElementById('masterBoostSlider');
      if (bSlider) bSlider.value = audioLabSettings.master_boost || 100;
      const bReadout = document.getElementById('audioBoostPercentText') || document.getElementById('masterBoostReadout');
      if (bReadout) {
        bReadout.textContent = `${audioLabSettings.master_boost || 100}%`;
        bReadout.classList.toggle('is-boosted', (audioLabSettings.master_boost || 100) > 100);
      }
      const tAudioOnly = document.getElementById('toggleAudioOnlyMode');
      if (tAudioOnly) tAudioOnly.checked = Boolean(audioLabSettings.audio_only);
      const eqPreset = document.getElementById('audioEqPresetSelect');
      if (eqPreset && audioLabSettings.eq_preset) eqPreset.value = audioLabSettings.eq_preset;
      if (audioLabSettings.eq_bands) {
        Object.entries(audioLabSettings.eq_bands).forEach(([b, val]) => {
          const slider = document.getElementById(`eqBand${b}`);
          if (slider) slider.value = val;
          const valSpan = document.getElementById(`eqVal${b}`) || document.getElementById(`eqReadout${b}`);
          if (valSpan) valSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
        });
      }
      const tVocal = document.getElementById('toggleVocalClarity');
      if (tVocal) tVocal.checked = Boolean(audioLabSettings.vocal_clarity);
      const tNight = document.getElementById('toggleNightShield');
      if (tNight) tNight.checked = Boolean(audioLabSettings.night_shield);
    }

    if (res && Array.isArray(res.studio_notes)) {
      studioNotes = res.studio_notes;
      renderStudioNotesList();
    }
    if (res && Array.isArray(res.studio_screenshots)) {
      studioScreenshots = res.studio_screenshots;
      renderStudioScreenshots();
    }
    if (res && res.studio_last_playback) {
      lastWatchedPlayback = res.studio_last_playback;
      updateResumePlaybackCard(lastWatchedPlayback);
    }

    if (res && res.focus_settings) {
      focusSettings = { ...focusSettings, ...res.focus_settings };
      const tDoom = document.getElementById('toggleDoomscrollBreaker');
      if (tDoom) tDoom.checked = Boolean(focusSettings.doomscroll_enabled);
      const sDoom = document.getElementById('selectDoomscrollInterval') || document.getElementById('doomscrollIntervalSelect');
      if (sDoom) sDoom.value = String(focusSettings.doomscroll_interval_minutes || 30);
    }

    if (res && res.quick_settings) {
      quickSettings = { ...quickSettings, ...res.quick_settings };
      const sTab = document.getElementById('selectDefaultTab');
      const validTabs = ['media', 'audio', 'tools', 'studio', 'tracking', 'domains'];
      const defTab = validTabs.includes(quickSettings.default_tab) ? quickSettings.default_tab : 'media';
      if (sTab) sTab.value = defTab;
      const sSync = document.getElementById('selectSyncInterval');
      if (sSync) sSync.value = String(quickSettings.sync_interval || 2000);
      const tSound = document.getElementById('toggleNotificationSound');
      if (tSound) tSound.checked = Boolean(quickSettings.notification_sound);
      const tContrast = document.getElementById('toggleHighContrast');
      if (tContrast) {
        tContrast.checked = Boolean(quickSettings.high_contrast);
        document.body.classList.toggle('high-contrast-mode', quickSettings.high_contrast);
      }
    }

    applyPopupLanguage(lang);
    refreshDashboard();
  });

  // High-frequency auto-refresh popup while open (every 1 second for live progress updates)
  setInterval(refreshDashboard, 1000);

  // Instant reactive updates via IPC broadcast
  browserAPI.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'LIVE_MEDIA_UPDATE' && message.payload) {
      renderMediaCard(message.payload);
      handleAutoTabSwitching({ globalMediaState: message.payload });
    } else if (message && message.type === 'DATA_HUB_STATUS_CHANGED') {
      renderDataHubBadge(Boolean(message.connected));
      refreshDashboard(true);
    } else if (message && (message.type === 'SLEEP_TIMER_EXPIRED' || message.action === 'SLEEP_TIMER_EXPIRED')) {
      renderSleepTimerUI({ state: 'TRIGGERED' });
      showPopupToast('Sleep timer expired - all media paused', 'info');
    } else if (message && message.type === 'TRACKING_PAUSE_CHANGED') {
      isTrackingPaused = Boolean(message.isTrackingPaused);
      updateTrackingPauseButtonUI(isTrackingPaused);
    }
  });

  // Reactive Language and Browser Filter Synchronization across Dashboard & Popup
  browserAPI.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.sentinel_tracking_paused) {
        isTrackingPaused = Boolean(changes.sentinel_tracking_paused.newValue);
        updateTrackingPauseButtonUI(isTrackingPaused);
      }
      if (changes.language && changes.language.newValue) {
        applyPopupLanguage(changes.language.newValue);
      } else if (changes.media_sentinel_settings && changes.media_sentinel_settings.newValue && changes.media_sentinel_settings.newValue.language) {
        applyPopupLanguage(changes.media_sentinel_settings.newValue.language);
      }
      if (changes.selected_browser_filter && changes.selected_browser_filter.newValue) {
        selectedBrowser = changes.selected_browser_filter.newValue;
        const sel = document.getElementById('browserFilterSelect');
        if (sel) sel.value = selectedBrowser;
        refreshDashboard(false);
      }
    }
  });
});
