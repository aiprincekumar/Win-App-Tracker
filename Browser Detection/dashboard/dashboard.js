﻿/**
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

// =============================================================================
// Modular Dashboard Subsystems (src/dashboard/)
// =============================================================================
function _safeRequire(relPath1, relPath2) {
  if (typeof require !== 'function') return null;
  try {
    return require(relPath1);
  } catch (_) {
    try {
      return require(relPath2);
    } catch (__) {
      return null;
    }
  }
}

const _DashboardState = (typeof globalThis !== 'undefined' && globalThis.DashboardState) ? globalThis.DashboardState : _safeRequire('./src/dashboard/state/dashboard_state.js', '../src/dashboard/state/dashboard_state.js');
const _BrowserFilter = (typeof globalThis !== 'undefined' && globalThis.BrowserFilter) ? globalThis.BrowserFilter : _safeRequire('./src/dashboard/filters/browser_filter.js', '../src/dashboard/filters/browser_filter.js');
const _DonutChart = (typeof globalThis !== 'undefined' && globalThis.DonutChart) ? globalThis.DonutChart : _safeRequire('./src/dashboard/charts/donut_chart.js', '../src/dashboard/charts/donut_chart.js');
const _TimeSeriesChart = (typeof globalThis !== 'undefined' && globalThis.TimeSeriesChart) ? globalThis.TimeSeriesChart : _safeRequire('./src/dashboard/charts/time_series_chart.js', '../src/dashboard/charts/time_series_chart.js');
const _DomainTable = (typeof globalThis !== 'undefined' && globalThis.DomainTable) ? globalThis.DomainTable : _safeRequire('./src/dashboard/components/domain_table.js', '../src/dashboard/components/domain_table.js');
const _CsvExporter = (typeof globalThis !== 'undefined' && globalThis.CsvExporter) ? globalThis.CsvExporter : _safeRequire('./src/dashboard/services/csv_exporter.js', '../src/dashboard/services/csv_exporter.js');
const _AudioLabController = (typeof globalThis !== 'undefined' && globalThis.AudioLabController) ? globalThis.AudioLabController : _safeRequire('./src/dashboard/audio/audio_lab_controller.js', '../src/dashboard/audio/audio_lab_controller.js');
const _OmniPalette = (typeof globalThis !== 'undefined' && globalThis.OmniPalette) ? globalThis.OmniPalette : _safeRequire('./src/dashboard/palette/omni_palette.js', '../src/dashboard/palette/omni_palette.js');
const _PrecisionScrubber = (typeof globalThis !== 'undefined' && globalThis.PrecisionTimelineScrubber) ? globalThis.PrecisionTimelineScrubber : _safeRequire('./src/dashboard/scrubber/scrubber.js', '../src/dashboard/scrubber/scrubber.js');
const _FeatureRegistry = (typeof globalThis !== 'undefined' && globalThis.SentinelFeatureRegistry) ? globalThis.SentinelFeatureRegistry : _safeRequire('./src/core/feature_registry.js', '../src/core/feature_registry.js');
const _DashboardFeatureManager = (typeof globalThis !== 'undefined' && globalThis.DashboardFeatureManager) ? globalThis.DashboardFeatureManager : _safeRequire('./src/dashboard/features/dashboard_feature_manager.js', '../src/dashboard/features/dashboard_feature_manager.js');
const _TemporalProductivity = (typeof globalThis !== 'undefined' && globalThis.TemporalProductivityFeature) ? globalThis.TemporalProductivityFeature : _safeRequire('./src/dashboard/features/temporal_productivity_feature.js', '../src/dashboard/features/temporal_productivity_feature.js');
const _TemporalDateFilter = (typeof globalThis !== 'undefined' && globalThis.TemporalDateFilter) ? globalThis.TemporalDateFilter : _safeRequire('./src/dashboard/filters/temporal_date_filter.js', '../src/dashboard/filters/temporal_date_filter.js');
let _MediaDeckVisualizer = (typeof window !== 'undefined' && window.MediaDeckVisualizerFeature)
  || (typeof globalThis !== 'undefined' && globalThis.MediaDeckVisualizerFeature)
  || _safeRequire('./src/dashboard/features/media_deck_visualizer_feature.js', '../src/dashboard/features/media_deck_visualizer_feature.js');

function getResolvedVisualizer() {
  if (typeof window !== 'undefined' && window.MediaDeckVisualizerFeature) {
    _MediaDeckVisualizer = window.MediaDeckVisualizerFeature;
    return _MediaDeckVisualizer;
  }
  if (typeof globalThis !== 'undefined' && globalThis.MediaDeckVisualizerFeature) {
    _MediaDeckVisualizer = globalThis.MediaDeckVisualizerFeature;
    return _MediaDeckVisualizer;
  }
  if (_MediaDeckVisualizer) {
    return _MediaDeckVisualizer;
  }
  _MediaDeckVisualizer = _safeRequire('./src/dashboard/features/media_deck_visualizer_feature.js', '../src/dashboard/features/media_deck_visualizer_feature.js');
  return _MediaDeckVisualizer;
}

const _BackupHubDigest = (typeof globalThis !== 'undefined' && globalThis.BackupHubDigestFeature) ? globalThis.BackupHubDigestFeature : _safeRequire('./src/dashboard/features/backup_hub_digest_feature.js', '../src/dashboard/features/backup_hub_digest_feature.js');
const _WellbeingBlacklist = (typeof globalThis !== 'undefined' && globalThis.WellbeingBlacklistFeature) ? globalThis.WellbeingBlacklistFeature : _safeRequire('./src/dashboard/features/wellbeing_blacklist_feature.js', '../src/dashboard/features/wellbeing_blacklist_feature.js');

if (typeof window !== 'undefined') {
  window.__SentinelDashboardModules = {
    DashboardState: _DashboardState,
    BrowserFilter: _BrowserFilter,
    DonutChart: _DonutChart,
    TimeSeriesChart: _TimeSeriesChart,
    DomainTable: _DomainTable,
    CsvExporter: _CsvExporter,
    AudioLabController: _AudioLabController,
    OmniPalette: _OmniPalette,
    PrecisionScrubber: _PrecisionScrubber,
    FeatureRegistry: _FeatureRegistry,
    DashboardFeatureManager: _DashboardFeatureManager,
    TemporalProductivity: _TemporalProductivity,
    TemporalDateFilter: _TemporalDateFilter,
    get MediaDeckVisualizer() {
      return getResolvedVisualizer();
    },
    BackupHubDigest: _BackupHubDigest,
    WellbeingBlacklist: _WellbeingBlacklist
  };
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
    btn_hud_connected: '✅ Connected',
    btn_starting_hud: '⏳ Starting HUD...',
    btn_refresh: 'Refresh',
    lang_btn_text: 'English',
    lang_btn_title: 'Switch to Hindi',
    
    // Sidebar Tabs
    nav_tracking: 'Time Tracking',
    nav_media: 'Media Analytics',
    nav_wellbeing: 'Focus & Sleep Hub',
    sleep_sentinel_title: 'Sleep Sentinel Hub',
    sleep_sentinel_desc: 'Automated playback cutoff, gentle audio fade-out, and bedtime recovery',
    nav_settings: 'Settings & Data',
    
    // App Bar Headers
    title_tracking: '⏱️ Time Tracking Analytics',
    sub_tracking: 'Detailed breakdown of daily browsing time and website usage',
    title_media: '🎬 Media Analytics & Playback History',
    sub_media: 'Video playback sessions, volume telemetry, resolution and live controls',
    title_wellbeing: '🧘 Focus & Digital Wellbeing',
    sub_wellbeing: 'Pomodoro timer, daily domain limits, starred domains, and privacy exclusion rules',
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
    metric_focus: 'Deep Focus Time',
    metric_focus_sub: '0 completed sessions today',
    metric_active_domains: 'Active Domains',
    metric_active_domains_sub: 'Distinct sites visited',
    metric_distraction_time: 'Leisure & Distraction',
    metric_distraction_sub: 'Entertainment & social',
    metric_peak_hour: 'Peak Activity Hour',
    metric_peak_hour_sub: 'Highest traffic window',
    metric_longest_session: 'Longest Session',
    metric_longest_session_sub: 'Uninterrupted focus run',
    no_data: 'No data',
    
    // Tab A: Charts & Table
    heading_usage_dist: 'Website Usage Time Distribution',
    caption_usage_dist: 'Select time range: Today, Yesterday, Last 7 Days, Last 30 Days, Daily Average, or Total Time',
    subtab_today: '📅 Today',
    subtab_yesterday: '⏪ Yesterday',
    subtab_7days: '📊 Last 7 Days',
    subtab_30days: '🗓️ Last 30 Days',
    subtab_custom: '🎯 Custom Range',
    subtab_daily: '📈 Daily Avg',
    subtab_total: '🌐 Total Time',
    heatmap_title: 'Chrono-Activity Heatmap (24h x 7d)',
    heatmap_mode_focus: 'Focus & Browsing Time',
    heatmap_mode_media: 'Media Watch Time',
    heatmap_wow_delta: 'Week-over-Week Change',
    productivity_title: 'Productivity Index',
    productivity_badge_focus: 'Deep Focus',
    productivity_badge_balanced: 'Balanced',
    productivity_badge_distracted: 'Distracted',
    cat_work: 'Work & Engineering',
    cat_learning: 'Learning & Research',
    cat_entertainment: 'Entertainment & Media',
    cat_social: 'Social & Communication',
    cat_utility: 'Utilities & Tools',
    th_category: 'Category',
    media_deck_title: '🎬 Multi-Tab Live Media Deck',
    btn_solo_tab: '🎧 Solo Tab',
    btn_switch_tab: '🎯 Switch Tab',
    btn_mute_all: '🔇 Mute All',
    btn_unmute_all: '🔊 Unmute All',
    btn_mute_all_others: '🔇 Mute All Others',
    btn_unmute_all_others: '🔊 Unmute All Others',
    status_audible: '🟢 Audible',
    status_playing: '🟢 Playing',
    status_paused: '⏸️ Paused',
    status_muted: '🔇 Muted',
    visualizer_title: 'Real-Time Audio Spectrum Visualizer',
    visualizer_mode_bars: '32-Band FFT',
    visualizer_mode_wave: 'Waveform',
    visualizer_effect_label: 'Effect:',
    viz_effect_bars: '32-Band Spectrum',
    viz_effect_wave: 'Oscilloscope Wave',
    viz_effect_radial: 'Radial Frequency Burst',
    viz_effect_matrix: 'Matrix Digital Dots',
    viz_effect_flame: 'Neon Flame Peaks',
    viz_effect_stereo: 'Stereo Mirror Butterfly',
    viz_effect_lissajous: 'Lissajous Stereo Scope',
    viz_effect_hex_grid: 'Cyberpunk Hexagon Grid',
    viz_effect_particles: 'Starfield Particle Warp',
    viz_effect_retro_grid: '3D Synthwave Retro Grid',
    viz_effect_vinyl_rings: 'Vinyl Groove Concentric Rings',
    viz_effect_liquid_wave: 'Liquid Mercury Wave',
    viz_settings_toggle_title: 'Toggle Acoustic Graticule & Telemetry Settings',
    viz_video_embed_toggle_title: 'Switch to Video Player (Embed Mode)',
    viz_fullwindow_toggle_title: 'Toggle Visualizer Full Window (Theater)',
    viz_fullwindow_exit_title: 'Exit Visualizer Full Window (Theater)',
    viz_fullscreen_toggle_title: 'Toggle Visualizer Fullscreen',
    viz_fullscreen_exit_title: 'Exit Fullscreen Visualizer',
    toast_viz_embed_mode_active: 'Video Embed Mode active (Live stream playback preview)',
    toast_viz_embed_mode_inactive: 'Switched back to Spectrum Visualizer',
    toast_viz_fullwindow_entered: 'Visualizer entered Full Window Theater mode',
    toast_viz_fullwindow_exited: 'Visualizer exited Full Window mode',
    toast_viz_fullscreen_entered: 'Visualizer entered Fullscreen Theater mode',
    toast_viz_fullscreen_exited: 'Visualizer exited Fullscreen mode',
    active_streams_count: (count) => `${count} active stream${count === 1 ? '' : 's'}`,
    no_media_streams: 'No active media streams detected across open tabs',
    
    // Feature 5: Advanced Backup & Hub Sync
    btn_import_json: '📥 Import Backup & Restore',
    btn_rollback_snapshot: '⏪ Rollback to Snapshot',
    btn_sync_sqlite_hub: '🔄 Replicate to SQLite Hub',
    btn_restore_sqlite_hub: '📥 Restore from SQLite Data Hub',
    dlg_conflict_title: 'Restore Conflict Resolution',
    dlg_conflict_merge: 'Merge (Recommended)',
    dlg_conflict_overwrite: 'Overwrite All',
    dlg_conflict_append: 'Append-Only (New Dates Only)',
    dlg_conflict_cancel: 'Cancel',
    heading_advanced_backup: 'Advanced Backup, Snapshots & SQLite Hub',
    sub_advanced_backup: 'Disaster recovery, 7-day rolling snapshots, and desktop SQLite synchronization',
    lbl_import_backup_header: 'Backup Restore',
    lbl_import_backup_desc: 'Import JSON backup with Schema v2.0 verification and conflict resolution',
    lbl_snapshot_rollback_header: 'Rolling Daily Snapshots',
    lbl_snapshot_rollback_desc: 'Roll back to automatic 7-day trailing local storage snapshots',
    lbl_sqlite_sync_header: 'SQLite Data Hub',
    lbl_sqlite_sync_desc: 'Replicate history to desktop SQLite database or pull full backup',
    btn_yesterday: '⏪ Yesterday',
    btn_3days_ago: '⏪ 3 Days Ago',

    // Feature 6: Executive Digest
    btn_print_pdf: '🖨️ Print / Save as PDF',
    btn_download_html: '📄 Download Standalone HTML',
    digest_title: 'Web Activity & Focus Executive Digest',
    digest_period: 'Reporting Period',
    digest_total_time: 'Total Active Time',
    digest_top_domain: 'Top Focus Domain',
    digest_productivity: 'Productivity Index',
    digest_media_time: 'Media Consumed',

    // Feature 7: Annotations & Blacklist
    blacklist_title: 'Privacy Tracking Exclusion Blacklist',
    blacklist_desc: 'Domains matching these patterns will never be recorded in history',
    txt_starred_title: 'Pinned Domains & Project Notes',
    txt_starred_desc: 'Starred domains remain anchored at the top of your domain breakdown table',
    btn_purge_domain: '🗑️ Purge Historical Data for this Domain',
    notes_placeholder: 'Add project notes for this domain...',
    btn_add_pattern: 'Add Pattern',
    th_star: 'Pin',
    modal_note_title: 'Domain Note / Project Annotation',
    modal_note_desc: 'Attach a custom project note or client context to this domain:',
    btn_save_note: '💾 Save Note',
    
    // Feature 8: Wellbeing & Pomodoro
    pomodoro_title: 'Focus Sentinel & Pomodoro',
    focus_advanced_title: "Focus Advanced Controls",
    focus_advanced_desc: "Custom goals, ambient soundscapes, acoustic chimes & smart shields",
    pomodoro_desc: "Deep work intervals, automated media cutoff & break recovery",
    lbl_focus_presets: "Duration & Presets",
    lbl_quick_presets: "Quick Presets",
    lbl_extend_time: "Extend Time",
    lbl_custom: "Custom:",
    btn_start_sleep_timer: "Start Sleep Timer",
    focus_ambient_soundscapes: "🎧 Ambient Soundscapes",
    soundscape_opt_none: "Off (Silent)",
    soundscape_opt_rain: "🌧️ Gentle Rain",
    soundscape_opt_cafe: "☕ Coffee Shop",
    soundscape_opt_ocean: "🌊 Ocean Waves",
    soundscape_opt_forest: "🌲 Forest Birds",
    soundscape_opt_whitenoise: "💨 Pink/White Noise",
    focus_completion_chime: "🔔 Completion Chime:",
    chime_opt_solfeggio: "Solfeggio Harmonic (528Hz / 660Hz)",
    chime_opt_tibetan: "Tibetan Singing Bowl (432Hz)",
    chime_opt_bell: "Digital Bell Synthesizer",
    chime_opt_gong: "Zen Temple Gong",
    btn_preview_chime: "▶ Test",
    toggle_focus_autopause: "Auto-pause Media",
    toggle_focus_autopause_desc: "Auto-pause media during focus",
    toggle_focus_chime: "Sound Chime",
    toggle_focus_chime_desc: "Sound chime on cycle completion",
    toggle_focus_shield: "🛡️ Strict Shield",
    toggle_focus_shield_desc: "Nudge and shield on distracting domains during focus",
    sleep_advanced_title: "Sleep Advanced Controls",
    sleep_advanced_desc: "Custom durations, gradual fade-out, end-of-video cutoff & inactivity triggers",

    // Advanced Focus Suite i18n
    lbl_focus_integrity: "Focus Integrity Score",
    desc_focus_integrity: "Live attention score and distraction tally",
    toggle_focus_automute_bg: "Auto-Mute Background Tabs",
    desc_focus_automute_bg: "Mute noisy background tabs during focus",
    soundscape_opt_binaural_alpha: "🧘 Alpha 10Hz (Flow State)",
    soundscape_opt_binaural_beta: "🧠 Beta 18Hz (Analytical Focus)",
    soundscape_opt_binaural_gamma: "⚡ Gamma 40Hz (Peak Cognition)",
    toggle_focus_breathe_nudge: "Soft-Nudge Breathe Overlay",
    desc_focus_breathe_nudge: "12s box-breathing prompt on distracting domains",
    toggle_focus_2020_alert: "20-20-20 Screen-Break & Posture",
    desc_focus_2020_alert: "Remind every 20m to look 20ft away for 20s and check posture",
    breathe_nudge_title: "Mindful Pause: Stay Focused",
    breathe_nudge_desc: "Take a conscious breath before browsing distracting content.",
    btn_breathe_return: "Return to Focus",
    btn_breathe_allow: "Allow for 5m",
    toast_2020_title: "20-20-20 Screen-Break",
    toast_2020_desc: "Look at an object 20 feet away for 20 seconds. Relax neck & shoulders.",

    // Advanced Sleep Suite i18n
    toggle_sleep_autoplay_block: "Auto-Disable Video Autoplay",
    desc_sleep_autoplay_block: "Block next video autoplay during bedtime",
    lbl_sleep_aid_soundscapes: "🌙 Sleep Aid Soundscapes",
    desc_sleep_aid_soundscapes: "Acoustic synthesizers with gentle circadian sleep fade",
    sleep_soundscape_none: "Off (Silent)",
    sleep_soundscape_pink: "🌸 Deep Pink Noise",
    sleep_soundscape_ocean: "🌊 Midnight Ocean",
    sleep_soundscape_rain: "🌧️ Delta Rain (2.5Hz)",
    toggle_sleep_inactivity_cutoff: "Inactivity Fast-Cutoff (5m)",
    desc_sleep_inactivity_cutoff: "Cut off media if idle for 5m during countdown",
    toggle_sleep_screen_dimmer: "Progressive Screen Dimmer",
    desc_sleep_screen_dimmer: "Circadian screen dimming during final countdown",
    toggle_sleep_tab_hibernate: "Memory-Saver Tab Hibernation",
    desc_sleep_tab_hibernate: "Suspend idle tabs on timeout to quiet cooling fans",
    btn_sleep_power_nap: "⚡ 20m Power-Nap Mode",
    desc_sleep_power_nap: "1-click restorative 20m nap with delta rain and gentle wake",
    btn_start_nap: "Start Nap",
    budget_alert: 'Daily limit reached for this domain',
    btn_start_focus: '▶️ Start 25m Focus Block',
    budget_title: 'Domain Daily Time Budgets',
    budget_desc: 'Configure daily minute limits per domain with 80% warning and 100% cutoff badges',
    btn_set_budget: 'Set Budget',
    budget_warning_80: '⚠️ 80% Limit',
    budget_reached_100: '🛑 Limit Reached',
    pomodoro_focus_badge: 'Focus (25m)',
    pomodoro_break_badge: 'Break (5m)',
    btn_pomodoro_pause: '⏸️ Pause',
    btn_pomodoro_reset: '🔄 Reset',
    donut_center_today: "Today's Total Time",
    donut_center_yesterday: "Yesterday's Total",
    donut_center_7days: "Last 7 Days Total",
    donut_center_30days: "Last 30 Days Total",
    donut_center_custom: "Custom Range Total",
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
    time_scroll_to_top: 'Scroll back to top of time tracking',
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
    media_metric_total_watch: 'Total Watch Time',
    media_sub_total_watch: 'Cumulative consumption',
    media_metric_avg_watch: 'Avg Watch per Video',
    media_sub_avg_watch: 'Average per session',
    media_sub_sessions: 'Total playback events',
    media_metric_top_platform: 'Top Media Platform',
    media_sub_top_platform: 'Most watched service',
    media_metric_active_streams: 'Live Streams',
    media_sub_active_streams: 'Active concurrent streams',
    media_metric_avg_volume: 'Average Volume',
    media_sub_avg_volume: 'Mean sound output',
    media_metric_peak_volume: 'Peak Volume',
    media_sub_peak_volume: 'Highest volume recorded',
    media_metric_low_volume: 'Lowest Volume',
    media_sub_low_volume: 'Quiet playback level',
    media_metric_muted_sessions: 'Muted Sessions',
    media_sub_muted_sessions: 'Silent / muted playback',
    media_metric_longest_session: 'Longest Media',
    media_sub_longest_session: 'Single longest video',
    
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
    switch_tab_title: 'Switch to Media Tab',
    quality: 'Quality',
    idle_hero_heading: 'No Media Currently Playing',
    idle_hero_sub: 'Play YouTube, Netflix, Hotstar or any media in any browser tab. Live status and controls will appear here.',
    
    // Media History Table
    media_history_heading: 'Media Playback History',
    media_scroll_to_top: 'Scroll back to top of media history',
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
    
    // Sleep Timer & Inactivity Sentinel
    heading_sleep_settings: 'Sleep Timer & Inactivity Sentinel',
    sub_sleep_settings: 'Automated playback cutoff, gentle audio fade-out, and idle power saving',
    lbl_default_sleep: 'Default Sleep Duration',
    desc_default_sleep: 'Default countdown interval for quick 1-click sleep presets',
    lbl_sleep_fade: 'Gradual Audio Fade-out',
    desc_sleep_fade: 'Linearly step down media volume before pausing to prevent sudden audio cutoffs',
    lbl_fade_duration: 'Fade Duration Window',
    desc_fade_duration: 'Number of seconds allocated for smooth volume attenuation',
    lbl_inactivity_sleep: 'Inactivity Auto-Sleep Sentinel',
    desc_inactivity_sleep: 'Automatically pause playing media when system is detected idle (AFK)',
    lbl_inactivity_threshold: 'Inactivity Detection Threshold',
    desc_inactivity_threshold: 'Duration of user inactivity required before auto-sleep engages',
    lbl_badge_countdown: 'Toolbar Badge Countdown',
    desc_badge_countdown: 'Show dynamic countdown and color indicators on the browser icon',
    btn_save_sleep: '💾 Save Sleep Settings',

    // Sleep & Inactivity Select Options
    opt_sleep_15m: '15 Minutes',
    opt_sleep_30m: '30 Minutes',
    opt_sleep_45m: '45 Minutes',
    opt_sleep_60m: '60 Minutes',
    opt_sleep_90m: '90 Minutes',
    opt_fade_15s: '15 Seconds',
    opt_fade_30s: '30 Seconds (Recommended)',
    opt_fade_60s: '60 Seconds',
    opt_inact_10m: '10 Minutes',
    opt_inact_15m: '15 Minutes',
    opt_inact_30m: '30 Minutes',
    opt_inact_60m: '60 Minutes',
    lbl_custom_duration: 'Custom Duration',
    btn_set: 'Set',
    lbl_inactivity_auto_sleep: 'Pause if idle 15m',
    lbl_timeout_action: 'On Timeout Action',
    opt_timeout_pause: 'Pause Media Only',
    opt_timeout_mute: 'Mute Tab',
    opt_timeout_close: 'Pause & Close Tab',
    lbl_sleep_end_of_video: 'Stop at End of Video',
    desc_sleep_end_of_video: 'Trigger cutoff as soon as the current playing video finishes',
    toast_sleep_paused: 'Sleep timer paused',
    toast_sleep_resumed: 'Sleep timer resumed',
    
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
    toast_sleep_saved: 'Sleep timer settings saved and synchronized successfully',
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
    toast_lang_changed: 'Language set to English',

    // Theme & Accessibility (Defects 16 & 17)
    theme_toggle_light: 'Switch to Light Mode',
    theme_toggle_dark: 'Switch to Dark Mode',
    theme_active_light: 'Light theme activated',
    theme_active_dark: 'Dark theme activated',
    theme_btn_light: 'Light',
    theme_btn_dark: 'Dark',

    // Audio Lab Telemetry & Deep Parity (Defect 15)
    audiolab_title: 'Audio Lab & DSP Telemetry',
    audiolab_master_boost: 'Master Volume Boost',
    audiolab_dsp_active: 'Offscreen Web Audio DSP Pipeline Active',
    audiolab_vocal_on: 'Vocal: ON',
    audiolab_vocal_off: 'Vocal: OFF',
    audiolab_night_on: 'Night: ON',
    audiolab_night_off: 'Night: OFF',
    audiolab_eq_title: '5-Band Graphic Equalizer',
    audiolab_reset_eq: '🔄 Reset EQ',
    audiolab_vocal_title: '🗣️ Vocal Clarity',
    audiolab_vocal_desc: 'Highlight dialogue frequencies over loud music',
    audiolab_night_title: '🌙 Night Shield',
    audiolab_night_desc: 'Compress dynamic range & soften sudden loud sounds',
    audiolab_bass_title: '🔊 Sub-Bass Boost',
    audiolab_bass_desc: 'Deep low-frequency punch and warm bass enhancement',
    audiolab_audio_only_title: '📻 Audio-Only Mode',
    audiolab_audio_only_desc: 'Save battery and CPU by suppressing video frames',
    audiolab_boost_min: '0%',
    audiolab_boost_normal: '100% (Normal)',
    audiolab_boost_max: '200% (Max)',
    eq_preset_flat: 'Flat',
    eq_preset_bass_boost: 'Bass Boost',
    eq_preset_vocal_enhancer: 'Vocal Enhancer',
    eq_preset_treble_boost: 'Treble Boost',
    eq_preset_electronic: 'Electronic',
    eq_preset_rock: 'Rock',
    eq_preset_acoustic: 'Acoustic',
    eq_preset_night_mode: 'Night Mode',
    eq_preset_custom: 'Custom',
    
    // Phase 2: Omni Command Palette & Hotkeys Cheat Sheet
    cmd_placeholder: 'Type a command or search domains... (Esc to dismiss)',
    cmd_quick_actions: 'Quick Actions',
    cmd_recent_domains: 'Recent Domains',
    cmd_navigation: 'Direct Navigation',
    cmd_domains: 'Domains',
    cmd_settings: 'Settings',
    cmd_empty: 'No matching commands or domains found',
    hotkeys_title: 'Keyboard Shortcuts Cheat Sheet',
    hotkeys_nav_1: 'Switch to Time Tracking Tab',
    hotkeys_nav_2: 'Switch to Media Analytics Tab',
    hotkeys_nav_3: 'Switch to Settings Tab',
    hotkeys_media_play: 'Play / Pause Active Video',
    hotkeys_media_mute: 'Mute / Unmute Audio',
    hotkeys_media_fullscreen: 'Toggle Fullscreen Mode',
    hotkeys_media_pip: 'Toggle Picture-in-Picture (PiP)',
    hotkeys_cmd_palette: 'Open Omni Command Palette',
    hotkeys_cheat_sheet: 'Open Keyboard Shortcuts Cheat Sheet',
    hotkeys_dismiss: 'Dismiss Active Modal / Overlay',

    // Phase 4: Dynamic Multi-Theme Engine & Synthesized Tactile Haptics
    heading_appearance_settings: 'Appearance & Tactile Haptics',
    sub_appearance_settings: 'Custom substrate materials, dynamic specular accents, and Web Audio haptics',
    lbl_theme_substrate: 'Theme Substrate',
    desc_theme_substrate: 'Select zero-reload base material layer',
    theme_midnight_oled: 'Midnight OLED',
    theme_slate_navy: 'Deep Slate',
    theme_nordic_pine: 'Nordic Pine',
    theme_clean_light: 'Studio Light',
    lbl_accent_palette: 'Accent Palette',
    desc_accent_palette: 'Dynamic specular glow and interactive focal hue',
    accent_emerald: 'Cyber Emerald',
    accent_cyan: 'Electric Cyan',
    accent_violet: 'Royal Violet',
    accent_rose: 'Neon Rose',
    accent_amber: 'Solar Amber',
    setting_audio_haptics: 'Tactile Audio Feedback',
    desc_audio_haptics: 'Subtle procedural sound effects on sliders, clicks, and actions',
    lbl_audio_volume: 'Haptic Feedback Volume',
    desc_audio_volume: 'Volume level for procedural clicks and chimes (Default: 15%)',
    btn_test_audio_haptics: '🔔 Test Chime',
    bento_customize: 'Customize Layout',
    bento_reset_layout: 'Reset to Default Layout',
    scrubber_chapter: 'Chapter',
    scrubber_hover_time: 'Time',
    // Local Services & Hardware Bridges Card
    hardware_bridges_title: 'Local Services & Hardware Bridges',
    hardware_bridges_sub: 'WebSocket daemons, SQLite storage engine, and peripheral telemetry',
    bridge_hub_name: 'SQLite Data Hub Daemon',
    bridge_hub_port: 'Port 65433 (WAL)',
    bridge_hub_desc: 'Local high-concurrency event telemetry & persistent database store',
    bridge_hud_name: 'Video Detector HUD Bridge',
    bridge_hud_port: 'Port 65432',
    bridge_hud_desc: 'Real-time overlay bridge for Windows desktop video sentinel',
    btn_reconnect_hub: '⚡ Reconnect Hub',
    btn_hub_connected: '✅ Connected',
    btn_connecting: '⏳ Connecting...',
    bridge_status_online: 'Connected',
    bridge_status_starting: 'Connecting...',
    bridge_status_offline: 'Offline'
  },
  hi: {
    // Brand & Header
    brand_edition: 'एंटरप्राइज एनालिटिक्स',
    hud_offline: 'HUD ऑफलाइन (डिस्कनेक्टेड)',
    hud_connected: 'HUD ऑनलाइन (कनेक्टेड)',
    hud_starting: 'HUD शुरू हो रहा है...',
    btn_reconnect_hud: '⚡ HUD रीकनेक्ट करें',
    btn_hud_connected: '✅ कनेक्टेड',
    btn_starting_hud: '⏳ HUD शुरू हो रहा है...',
    btn_refresh: 'रीफ्रेश',
    lang_btn_text: 'हिंदी',
    lang_btn_title: 'Switch to English',
    
    // Sidebar Tabs
    nav_tracking: 'टाइम ट्रैकिंग',
    nav_media: 'मीडिया एनालिटिक्स',
    nav_wellbeing: 'फोकस व स्लीप हब',
    sleep_sentinel_title: 'स्लीप सेंटिनल हब',
    sleep_sentinel_desc: 'स्वचालित प्लेबैक कटऑफ, क्रमिक ऑडियो फेड-आउट व स्लीप टाइमर',
    nav_settings: 'सेटिंग्स व डेटा',
    
    // App Bar Headers
    title_tracking: '⏱️ टाइम ट्रैकिंग एनालिटिक्स',
    sub_tracking: 'दैनिक ब्राउज़िंग समय व वेबसाइट उपयोग का विस्तृत विश्लेषण',
    title_media: '🎬 मीडिया एनालिटिक्स व प्लेबैक इतिहास',
    sub_media: 'वीडियो प्लेबैक सत्र, वॉल्यूम आंकड़े, रिज़ॉल्यूशन व लाइव प्लेयर कंट्रोल्स',
    title_wellbeing: '🧘 फोकस व डिजिटल वेलबीइंग',
    sub_wellbeing: 'पोमोडोरो टाइमर, दैनिक डोमेन सीमाएं, पसंदीदा डोमेन व गोपनीयता नियम',
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
    metric_focus: 'गहन एकाग्रता समय',
    metric_focus_sub: 'आज पूर्ण किए गए सत्र',
    metric_active_domains: 'सक्रिय डोमेन',
    metric_active_domains_sub: 'विज़िट की गई भिन्न वेबसाइटें',
    metric_distraction_time: 'मनोरंजन एवं व्यवधान',
    metric_distraction_sub: 'मनोरंजन और सोशल मीडिया',
    metric_peak_hour: 'चरम गतिविधि का समय',
    metric_peak_hour_sub: 'सर्वाधिक उपयोग की समयावधि',
    metric_longest_session: 'सबसे लंबा सत्र',
    metric_longest_session_sub: 'निर्बाध निरंतर ब्राउज़िंग',
    no_data: 'कोई डेटा नहीं',
    
    // Tab A: Charts & Table
    heading_usage_dist: 'वेबसाइट उपयोग समय वितरण',
    caption_usage_dist: 'समय सीमा चुनें: आज, कल, पिछले 7 दिन, पिछले 30 दिन, दैनिक औसत, या कुल समय',
    subtab_today: '📅 आज',
    subtab_yesterday: '⏪ बीता हुआ कल',
    subtab_7days: '📊 पिछले 7 दिन',
    subtab_30days: '🗓️ पिछले 30 दिन',
    subtab_custom: '🎯 कस्टम अवधि',
    subtab_daily: '📈 दैनिक औसत',
    subtab_total: '🌐 कुल समय',
    heatmap_title: 'क्रोनो-सक्रियता हीटमैप (24 घंटे x 7 दिन)',
    heatmap_mode_focus: 'फोकस व ब्राउज़िंग समय',
    heatmap_mode_media: 'मीडिया वॉच-टाइम',
    heatmap_wow_delta: 'साप्ताहिक तुलनात्मक अंतर',
    productivity_title: 'उत्पादकता सूचकांक',
    productivity_badge_focus: 'गहन ध्यान',
    productivity_badge_balanced: 'संतुलित',
    productivity_badge_distracted: 'विचलित',
    cat_work: 'कार्य व इंजीनियरिंग',
    cat_learning: 'शिक्षा व शोध',
    cat_entertainment: 'मनोरंजन व मीडिया',
    cat_social: 'सामाजिक संवाद',
    cat_utility: 'यूटिलिटी व टूल्स',
    th_category: 'श्रेणी',
    media_deck_title: '🎬 मल्टी-टैब लाइव मीडिया डेक',
    btn_solo_tab: '🎧 सोलो टैब',
    btn_switch_tab: '🎯 टैब स्विच',
    btn_mute_all: '🔇 सभी म्यूट करें',
    btn_unmute_all: '🔊 सभी अनम्यूट करें',
    btn_mute_all_others: '🔇 अन्य सभी म्यूट करें',
    btn_unmute_all_others: '🔊 अन्य सभी अनम्यूट करें',
    status_audible: '🟢 ध्वनि चालू',
    status_playing: '🟢 चल रहा है',
    status_paused: '⏸️ रुका हुआ',
    status_muted: '🔇 म्यूटेड',
    visualizer_title: 'रियल-टाइम ऑडियो स्पेक्ट्रम विज़ुअलाइज़र',
    visualizer_mode_bars: '32-बैंड FFT',
    visualizer_mode_wave: 'वेवफॉर्म',
    visualizer_effect_label: 'इफ़ेक्ट:',
    viz_effect_bars: '32-बैंड स्पेक्ट्रम',
    viz_effect_wave: 'ऑसिलोस्कोप वेव',
    viz_effect_radial: 'रेडियल फ़्रीक्वेंसी बर्स्ट',
    viz_effect_matrix: 'मैट्रिक्स डिजिटल डॉट्स',
    viz_effect_flame: 'नियॉन फ्लेम पीक्स',
    viz_effect_stereo: 'स्टीरियो मिरर बटरफ्लाई',
    viz_effect_lissajous: 'लिसेजस स्टीरियो स्कोप',
    viz_effect_hex_grid: 'साइबरपंक हेक्सागोन ग्रिड',
    viz_effect_particles: 'स्टारफ़ील्ड पार्टिकल वॉरप',
    viz_effect_retro_grid: '3D सिंथवेव रेट्रो ग्रिड',
    viz_effect_vinyl_rings: 'विनाइल ग्रूव संकेंद्रित छल्ले',
    viz_effect_liquid_wave: 'लिक्विड मरकरी वेव',
    viz_settings_toggle_title: 'अकॉस्टिक ग्रेटिक्यूल और टेलीमेट्री सेटिंग्स टॉगल करें',
    viz_video_embed_toggle_title: 'वीडियो प्लेयर पर स्विच करें (एम्बेडेड मोड)',
    viz_fullwindow_toggle_title: 'विज़ुअलाइज़र फुल विंडो (थिएटर) टॉगल करें',
    viz_fullwindow_exit_title: 'फुल विंडो (थिएटर) से बाहर निकलें',
    viz_fullscreen_toggle_title: 'विज़ुअलाइज़र फ़ुलस्क्रीन टॉगल करें',
    viz_fullscreen_exit_title: 'फ़ुलस्क्रीन विज़ुअलाइज़र से बाहर निकलें',
    toast_viz_embed_mode_active: 'वीडियो प्लेयर (एम्बेडेड मोड) सक्रिय',
    toast_viz_embed_mode_inactive: 'स्पेक्ट्रम विज़ुअलाइज़र पर वापस स्विच किया गया',
    toast_viz_fullwindow_entered: 'विज़ुअलाइज़र फुल विंडो थिएटर मोड में सक्रिय',
    toast_viz_fullwindow_exited: 'विज़ुअलाइज़र सामान्य विंडो पर वापस आया',
    toast_viz_fullscreen_entered: 'विज़ुअलाइज़र फ़ुलस्क्रीन थिएटर मोड में सक्रिय',
    toast_viz_fullscreen_exited: 'विज़ुअलाइज़र सामान्य दृश्य पर वापस आया',
    active_streams_count: (count) => `${count} सक्रिय स्ट्रीम`,
    no_media_streams: 'खुले टैब्स में कोई सक्रिय मीडिया स्ट्रीम नहीं मिली',
    
    // Feature 5: Advanced Backup & Hub Sync
    btn_import_json: '📥 बैकअप इम्पोर्ट व पुनर्स्थापना',
    btn_rollback_snapshot: '⏪ पूर्व स्नैपशॉट पर लौटें',
    btn_sync_sqlite_hub: '🔄 SQLite हब में रेप्लिकेट करें',
    btn_restore_sqlite_hub: '📥 SQLite डेटा हब से पुनर्स्थापित करें',
    dlg_conflict_title: 'डेटा टकराव समाधान',
    dlg_conflict_merge: 'मर्ज करें (अनुशंसित)',
    dlg_conflict_overwrite: 'पूर्ण प्रतिस्थापन (Overwrite)',
    dlg_conflict_append: 'केवल नई तिथियां जोड़ें (Append-Only)',
    dlg_conflict_cancel: 'रद्द करें',
    heading_advanced_backup: 'उन्नत बैकअप, स्नैपशॉट्स व SQLite हब',
    sub_advanced_backup: 'आपदा पुनर्प्राप्ति, 7-दिवसीय रोलिंग स्नैपशॉट्स और डेस्कटॉप SQLite सिंक्रोनाइज़ेशन',
    lbl_import_backup_header: 'बैकअप पुनर्स्थापना',
    lbl_import_backup_desc: 'स्कीमा v2.0 सत्यापन और टकराव समाधान के साथ JSON बैकअप आयात करें',
    lbl_snapshot_rollback_header: 'रोलिंग दैनिक स्नैपशॉट्स',
    lbl_snapshot_rollback_desc: 'स्वचालित 7-दिवसीय स्थानीय स्टोरेज स्नैपशॉट पर वापस लौटें',
    lbl_sqlite_sync_header: 'SQLite डेटा हब',
    lbl_sqlite_sync_desc: 'डेस्कटॉप SQLite डेटाबेस में इतिहास रेप्लिकेट करें या पूर्ण बैकअप पुनर्प्राप्त करें',
    btn_yesterday: '⏪ बीता हुआ कल',
    btn_3days_ago: '⏪ 3 दिन पहले',

    // Feature 6: Executive Digest
    btn_print_pdf: '🖨️ प्रिंट करें / PDF के रूप में सहेजें',
    btn_download_html: '📄 स्टैंडअलोन HTML डाउनलोड करें',
    digest_title: 'वेब सक्रियता व उत्पादकता एग्जीक्यूटिव डाइजेस्ट',
    digest_period: 'रिपोर्टिंग अवधि',
    digest_total_time: 'कुल सक्रिय समय',
    digest_top_domain: 'शीर्ष फोकस डोमेन',
    digest_productivity: 'उत्पादकता सूचकांक',
    digest_media_time: 'मीडिया उपभोग समय',

    // Feature 7: Annotations & Blacklist
    blacklist_title: 'गोपनीयता ट्रैकिंग एक्सक्लूज़न ब्लैकलिस्ट',
    blacklist_desc: 'इन पैटर्न्स से मेल खाने वाले डोमेन्स का डेटा कभी रिकॉर्ड नहीं किया जाएगा',
    txt_starred_title: 'पसंदीदा डोमेन व प्रोजेक्ट नोट्स',
    txt_starred_desc: 'पिन किए गए डोमेन आपकी एनालिटिक्स टेबल के शीर्ष पर स्थिर रहते हैं',
    btn_purge_domain: '🗑️ इस डोमेन का पुराना डेटा मिटाएं',
    notes_placeholder: 'इस डोमेन के लिए प्रोजेक्ट नोट्स लिखें...',
    btn_add_pattern: 'पैटर्न जोड़ें',
    th_star: 'पिन',
    modal_note_title: 'डोमेन नोट व प्रोजेक्ट एनोटेशन',
    modal_note_desc: 'इस डोमेन के लिए कस्टम प्रोजेक्ट नोट या संदर्भ जोड़ें:',
    btn_save_note: '💾 नोट सहेजें',
    
    // Feature 8: Wellbeing & Pomodoro
    pomodoro_title: 'फोकस सेंटिनल व पोमोडोरो',
    focus_advanced_title: "उन्नत फोकस नियंत्रण",
    focus_advanced_desc: "कस्टम लक्ष्य, परिवेश ध्वनियां, समापन झंकार और स्मार्ट शील्ड्स",
    pomodoro_desc: "गहन कार्य अंतराल, स्वचालित मीडिया कटऑफ और ब्रेक रिकवरी",
    lbl_focus_presets: "अवधि और प्रीसेट्स",
    lbl_quick_presets: "त्वरित प्रीसेट्स",
    lbl_extend_time: "समय बढ़ाएं",
    lbl_custom: "कस्टम:",
    btn_start_sleep_timer: "स्लीप टाइमर शुरू करें",
    focus_ambient_soundscapes: "🎧 परिवेशी ध्वनियां",
    soundscape_opt_none: "बंद (शांत)",
    soundscape_opt_rain: "🌧️ हल्की बारिश",
    soundscape_opt_cafe: "☕ कॉफी शॉप",
    soundscape_opt_ocean: "🌊 समुद्र की लहरें",
    soundscape_opt_forest: "🌲 वन पक्षी",
    soundscape_opt_whitenoise: "💨 पिंक/व्हाइट नॉइज़",
    focus_completion_chime: "🔔 समापन झंकार:",
    chime_opt_solfeggio: "सोल्फ़ेगियो हार्मोनिक (528Hz / 660Hz)",
    chime_opt_tibetan: "तिब्बती सिंगिंग बाउल (432Hz)",
    chime_opt_bell: "डिजिटल बेल सिंथेसाइज़र",
    chime_opt_gong: "ज़ेन मंदिर गोंग",
    btn_preview_chime: "▶ परीक्षण",
    toggle_focus_autopause: "ऑटो-पॉज़ मीडिया",
    toggle_focus_autopause_desc: "फोकस के दौरान मीडिया स्वचालित रूप से रोकें",
    toggle_focus_chime: "ध्वनि झंकार",
    toggle_focus_chime_desc: "चक्र पूर्ण होने पर झंकार बजाएं",
    toggle_focus_shield: "🛡️ सख्त शील्ड",
    toggle_focus_shield_desc: "फोकस के दौरान विचलित करने वाले डोमेन पर सचेत करें",
    sleep_advanced_title: "उन्नत स्लीप नियंत्रण",
    sleep_advanced_desc: "कस्टम अवधि, क्रमिक फेड-आउट, वीडियो समाप्ति कटऑफ और निष्क्रियता ट्रिगर्स",

    // Advanced Focus Suite i18n
    lbl_focus_integrity: "फोकस सत्यनिष्ठा स्कोर",
    desc_focus_integrity: "वास्तविक समय ध्यान स्कोर और विचलन काउंटर",
    toggle_focus_automute_bg: "बैकग्राउंड टैब स्वतः म्यूट करें",
    desc_focus_automute_bg: "फोकस शुरू होते ही अन्य सभी बैकग्राउंड टैब म्यूट करें",
    soundscape_opt_binaural_alpha: "🧘 अल्फा 10Hz (प्रवाह अवस्था)",
    soundscape_opt_binaural_beta: "🧠 बीटा 18Hz (गहन विश्लेषण)",
    soundscape_opt_binaural_gamma: "⚡ गामा 40Hz (शीर्ष संज्ञान)",
    toggle_focus_breathe_nudge: "सौम्य श्वास विश्राम संकेत",
    desc_focus_breathe_nudge: "ध्यान भटकाने वाली वेबसाइटों पर 12 सेकंड का श्वास विश्राम",
    toggle_focus_2020_alert: "20-20-20 स्क्रीन-विश्राम और मुद्रा सतर्कता",
    desc_focus_2020_alert: "हर 20 मिनट पर 20 सेकंड के लिए 20 फीट दूर देखने का स्मरण",
    breathe_nudge_title: "माइंडफुल विराम: एकाग्र रहें",
    breathe_nudge_desc: "विचलित करने वाली सामग्री देखने से पहले एक गहरी सांस लें।",
    btn_breathe_return: "फोकस पर लौटें",
    btn_breathe_allow: "5 मिनट के लिए अनुमति दें",
    toast_2020_title: "20-20-20 स्क्रीन-विश्राम",
    toast_2020_desc: "20 सेकंड के लिए 20 फीट दूर किसी वस्तु को देखें। गर्दन और कंधों को आराम दें।",

    // Advanced Sleep Suite i18n
    toggle_sleep_autoplay_block: "वीडियो स्वतः प्ले रोकें",
    desc_sleep_autoplay_block: "सोते समय स्ट्रीमिंग प्लेटफॉर्म पर अगला वीडियो स्वतः चलने से रोकें",
    lbl_sleep_aid_soundscapes: "🌙 निद्रा सहायक ध्वनियां",
    desc_sleep_aid_soundscapes: "शांत ध्वनियां जो स्लीप टाइमर के साथ धीरे-धीरे बंद होती हैं",
    sleep_soundscape_none: "बंद (शांत)",
    sleep_soundscape_pink: "🌸 डीप पिंक नॉइज़",
    sleep_soundscape_ocean: "🌊 अर्धरात्रि समुद्र",
    sleep_soundscape_rain: "🌧️ डेल्टा रेन (2.5Hz)",
    toggle_sleep_inactivity_cutoff: "5 मिनट निष्क्रियता पर त्वरित शटडाउन",
    desc_sleep_inactivity_cutoff: "टाइमर के दौरान 5 मिनट निष्क्रिय रहने पर तुरंत कटऑफ करें",
    toggle_sleep_screen_dimmer: "क्रमिक स्क्रीन डिमर संकेत",
    desc_sleep_screen_dimmer: "टाइमर समाप्ति से पूर्व स्क्रीन की रोशनी को धीरे-धीरे धीमा करें",
    toggle_sleep_tab_hibernate: "मेमोरी-सेवर टैब निलंबन",
    desc_sleep_tab_hibernate: "स्लीप टाइमर पर बैकग्राउंड टैब सस्पेंड कर पंखे की आवाज शांत करें",
    btn_sleep_power_nap: "⚡ 20 मिनट पावर-नैप मोड",
    desc_sleep_power_nap: "डेल्टा रेन और शांत अलार्म के साथ 20 मिनट का स्फूर्तिदायक नैप",
    btn_start_nap: "नैप शुरू करें",
    budget_alert: 'इस डोमेन की दैनिक समय सीमा समाप्त हो चुकी है',
    btn_start_focus: '▶️ 25 मिनट का फोकस ब्लॉक शुरू करें',
    budget_title: 'डोमेन दैनिक समय सीमा बजट',
    budget_desc: 'प्रति-डोमेन अधिकतम दैनिक मिनट और 80% चेतावनी व 100% समाप्ति बैज सेट करें',
    btn_set_budget: 'बजट निर्धारित करें',
    budget_warning_80: '⚠️ 80% सीमा',
    budget_reached_100: '🛑 सीमा समाप्त',
    pomodoro_focus_badge: 'फोकस (25 मिनट)',
    pomodoro_break_badge: 'विश्राम (5 मिनट)',
    btn_pomodoro_pause: '⏸️ विराम',
    btn_pomodoro_reset: '🔄 रीसेट',
    donut_center_today: 'आज का कुल समय',
    donut_center_yesterday: 'कल का कुल समय',
    donut_center_7days: 'पिछले 7 दिनों का कुल समय',
    donut_center_30days: 'पिछले 30 दिनों का कुल समय',
    donut_center_custom: 'कस्टम अवधि का कुल समय',
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
    time_scroll_to_top: 'समय ट्रैकिंग के शीर्ष पर वापस जाएं',
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
    media_metric_total_watch: 'कुल देखने की अवधि',
    media_sub_total_watch: 'संचयी देखने का समय',
    media_metric_avg_watch: 'औसत देखने का समय (प्रति वीडियो)',
    media_sub_avg_watch: 'प्रति वीडियो औसत अवधि',
    media_sub_sessions: 'कुल प्लेबैक इवेंट्स',
    media_metric_top_platform: 'शीर्ष मीडिया प्लेटफ़ॉर्म',
    media_sub_top_platform: 'सर्वाधिक देखा गया प्लेटफ़ॉर्म',
    media_metric_active_streams: 'लाइव स्ट्रीम',
    media_sub_active_streams: 'सक्रिय समवर्ती स्ट्रीम',
    media_metric_avg_volume: 'औसत वॉल्यूम',
    media_sub_avg_volume: 'औसत ध्वनि स्तर',
    media_metric_peak_volume: 'उच्चतम वॉल्यूम',
    media_sub_peak_volume: 'उच्चतम रिकॉर्ड किया गया स्तर',
    media_metric_low_volume: 'न्यूनतम वॉल्यूम',
    media_sub_low_volume: 'शांत प्लेबैक स्तर',
    media_metric_muted_sessions: 'म्यूट किए गए सत्र',
    media_sub_muted_sessions: 'मौन / म्यूट प्लेबैक',
    media_metric_longest_session: 'सबसे लंबा मीडिया सत्र',
    media_sub_longest_session: 'एकल सबसे लंबा वीडियो',
    
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
    media_scroll_to_top: 'मीडिया इतिहास के शीर्ष पर वापस जाएं',
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
    
    // Sleep Timer & Inactivity Sentinel
    heading_sleep_settings: 'स्लीप टाइमर व इनएक्टिविटी सेंटिनल',
    sub_sleep_settings: 'स्वचालित प्लेबैक कटऑफ, मंद ऑडियो फेड-आउट व आइडल पावर सेविंग',
    lbl_default_sleep: 'डिफ़ॉल्ट स्लीप टाइमर अवधि',
    desc_default_sleep: 'त्वरित 1-क्लिक स्लीप प्रीसेट्स के लिए डिफ़ॉल्ट काउंटडाउन समय',
    lbl_sleep_fade: 'ग्रेजुअल ऑडियो फेड-आउट',
    desc_sleep_fade: 'अचानक आवाज़ बंद होने से रोकने के लिए पॉज़ से पहले वॉल्यूम को धीरे-धीरे कम करें',
    lbl_fade_duration: 'फेड अवधि विंडो',
    desc_fade_duration: 'सुगम वॉल्यूम अवमंदन (Fade) के लिए निर्धारित सेकंड',
    lbl_inactivity_sleep: 'इनएक्टिविटी ऑटो-स्लीप सेंटिनल',
    desc_inactivity_sleep: 'सिस्टम के निष्क्रिय (AFK) होने पर स्वतः मीडिया पॉज़ करें',
    lbl_inactivity_threshold: 'निष्क्रियता पहचान थ्रेशोल्ड',
    desc_inactivity_threshold: 'ऑटो-स्लीप सक्रिय होने से पूर्व आवश्यक उपयोगकर्ता निष्क्रियता अवधि',
    lbl_badge_countdown: 'टूलबार बैज काउंटडाउन',
    desc_badge_countdown: 'ब्राउज़र आइकन पर लाइव काउंटडाउन और रंग संकेतक दिखाएं',
    btn_save_sleep: '💾 स्लीप सेटिंग्स सुरक्षित करें',

    // Sleep & Inactivity Select Options
    opt_sleep_15m: '15 मिनट',
    opt_sleep_30m: '30 मिनट',
    opt_sleep_45m: '45 मिनट',
    opt_sleep_60m: '60 मिनट',
    opt_sleep_90m: '90 मिनट',
    opt_fade_15s: '15 सेकंड',
    opt_fade_30s: '30 सेकंड (अनुशंसित)',
    opt_fade_60s: '60 सेकंड',
    opt_inact_10m: '10 मिनट',
    opt_inact_15m: '15 मिनट',
    opt_inact_30m: '30 मिनट',
    opt_inact_60m: '60 मिनट',
    lbl_custom_duration: 'कस्टम अवधि',
    btn_set: 'सेट करें',
    lbl_inactivity_auto_sleep: '15 मिनट निष्क्रिय रहने पर रोकें',
    lbl_timeout_action: 'समय समाप्ति पर कार्रवाई',
    opt_timeout_pause: 'केवल मीडिया रोकें',
    opt_timeout_mute: 'टैब म्यूट करें',
    opt_timeout_close: 'रोकें और टैब बंद करें',
    lbl_sleep_end_of_video: 'वीडियो समाप्त होने पर रोकें',
    desc_sleep_end_of_video: 'चल रहा वीडियो समाप्त होते ही मीडिया प्लेबैक रोकें',
    toast_sleep_paused: 'स्लीप टाइमर रोक दिया गया',
    toast_sleep_resumed: 'स्लीप टाइमर फिर चालू किया गया',
    
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
    toast_sleep_saved: 'स्लीप टाइमर सेटिंग्स सफलतापूर्वक सहेजी गईं और सिंक हो गईं',
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
    toast_lang_changed: 'भाषा बदलकर हिन्दी कर दी गई',

    // Theme & Accessibility (Defects 16 & 17)
    theme_toggle_light: 'लाइट थीम चालू करें',
    theme_toggle_dark: 'डार्क थीम चालू करें',
    theme_active_light: 'लाइट थीम सक्रिय की गई',
    theme_active_dark: 'डार्क थीम सक्रिय की गई',
    theme_btn_light: 'लाइट',
    theme_btn_dark: 'डार्क',

    // Audio Lab Telemetry & Deep Parity (Defect 15)
    audiolab_title: 'ऑडियो लैब व DSP टेलीमेट्री',
    audiolab_master_boost: 'मास्टर वॉल्यूम बूस्ट',
    audiolab_dsp_active: 'ऑफस्क्रीन वेब ऑडियो DSP पाइपलाइन सक्रिय',
    audiolab_vocal_on: 'वोकल: चालू',
    audiolab_vocal_off: 'वोकल: बंद',
    audiolab_night_on: 'नाइट: चालू',
    audiolab_night_off: 'नाइट: बंद',
    audiolab_eq_title: '5-बैंड ग्राफिक इक्वलाइज़र',
    audiolab_reset_eq: '🔄 रीसेट EQ',
    audiolab_vocal_title: '🗣️ वोकल क्लैरिटी',
    audiolab_vocal_desc: 'तेज़ संगीत में भी संवाद व आवाज़ को स्पष्ट उभारें',
    audiolab_night_title: '🌙 नाइट शील्ड',
    audiolab_night_desc: 'अचानक तेज़ आवाज़ों व विस्फोटों को मंद करें',
    audiolab_bass_title: '🔊 सब-बास बूस्ट',
    audiolab_bass_desc: 'गहरा बेस व लो-फ़्रीक्वेंसी पंच उभारें',
    audiolab_audio_only_title: '📻 केवल ऑडियो मोड',
    audiolab_audio_only_desc: 'वीडियो फ़्रेम रोककर बैटरी व मेमोरी की बचत करें',
    audiolab_boost_min: '0%',
    audiolab_boost_normal: '100% (सामान्य)',
    audiolab_boost_max: '200% (अधिकतम)',
    eq_preset_flat: 'फ़्लैट',
    eq_preset_bass_boost: 'बास बूस्ट',
    eq_preset_vocal_enhancer: 'वोकल एन्हांसर',
    eq_preset_treble_boost: 'ट्रेबल बूस्ट',
    eq_preset_electronic: 'इलेक्ट्रॉनिक',
    eq_preset_rock: 'रॉक',
    eq_preset_acoustic: 'एकॉस्टिक',
    eq_preset_night_mode: 'नाइट मोड',
    eq_preset_custom: 'कस्टम',
    
    // Phase 2: Omni Command Palette & Hotkeys Cheat Sheet
    cmd_placeholder: 'कमांड लिखें या डोमेन खोजें... (बंद करने के लिए Esc दबाएं)',
    cmd_quick_actions: 'त्वरित कार्रवाइयां',
    cmd_recent_domains: 'हाल के डोमेन्स',
    cmd_navigation: 'प्रत्यक्ष नेविगेशन',
    cmd_domains: 'डोमेन्स',
    cmd_settings: 'सेटिंग्स',
    cmd_empty: 'कोई मेल खाने वाला कमांड या डोमेन नहीं मिला',
    hotkeys_title: 'कीबोर्ड शॉर्टकट्स चीट शीट',
    hotkeys_nav_1: 'टाइम ट्रैकिंग टैब पर जाएं',
    hotkeys_nav_2: 'मीडिया एनालिटिक्स टैब पर जाएं',
    hotkeys_nav_3: 'सेटिंग्स टैब पर जाएं',
    hotkeys_media_play: 'सक्रिय वीडियो चलाएं / रोकें',
    hotkeys_media_mute: 'ऑडियो म्यूट / अनम्यूट करें',
    hotkeys_media_fullscreen: 'फुलस्क्रीन मोड टॉगल करें',
    hotkeys_media_pip: 'पिक्चर-इन-पिक्चर (PiP) टॉगल करें',
    hotkeys_cmd_palette: 'ओम्नी कमांड पैलेट खोलें',
    hotkeys_cheat_sheet: 'कीबोर्ड शॉर्टकट्स चीट शीट खोलें',
    hotkeys_dismiss: 'सक्रिय मॉडल / ओवरले बंद करें',

    // Phase 4: Dynamic Multi-Theme Engine & Synthesized Tactile Haptics
    heading_appearance_settings: 'दिखावट एवं स्पर्श-योग्य हैप्टिक्स',
    sub_appearance_settings: 'कस्टम सबस्ट्रेट सामग्री, गतिशील स्पेक्युलर एक्सेंट और वेब ऑडियो हैप्टिक्स',
    lbl_theme_substrate: 'थीम सबस्ट्रेट',
    desc_theme_substrate: 'शून्य-रीलोड बेस सामग्री परत चुनें',
    theme_midnight_oled: 'मिडनाइट ओएलईडी',
    theme_slate_navy: 'डीप स्लेट',
    theme_nordic_pine: 'नॉर्डिक पाइन',
    theme_clean_light: 'स्टूडियो लाइट',
    lbl_accent_palette: 'एक्सेंट पैलेट',
    desc_accent_palette: 'गतिशील स्पेक्युलर चमक और इंटरैक्टिव फोकल रंग',
    accent_emerald: 'साइबर एमराल्ड',
    accent_cyan: 'इलेक्ट्रिक सियान',
    accent_violet: 'रॉयल वॉयलेट',
    accent_rose: 'नियॉन रोज़',
    accent_amber: 'सोलर एम्बर',
    setting_audio_haptics: 'स्पर्श-योग्य ऑडियो फीडबैक',
    desc_audio_haptics: 'स्लाइडर्स, क्लिक्स व कार्रवाइयों पर सूक्ष्म प्रक्रियात्मक ध्वनि प्रभाव',
    lbl_audio_volume: 'हैप्टिक फीडबैक वॉल्यूम',
    desc_audio_volume: 'प्रक्रियात्मक क्लिक्स और चाइम के लिए वॉल्यूम स्तर (डिफ़ॉल्ट: 15%)',
    btn_test_audio_haptics: '🔔 परीक्षण चाइम',
    bento_customize: 'लेआउट अनुकूलित करें',
    bento_reset_layout: 'डिफ़ॉल्ट लेआउट पर रीसेट करें',
    scrubber_chapter: 'अध्याय (Chapter)',
    scrubber_hover_time: 'समय',
    // Local Services & Hardware Bridges Card
    hardware_bridges_title: 'स्थानीय सेवाएँ और हार्डवेयर सेतु',
    hardware_bridges_sub: 'वेबसॉकेट डेमॉन, SQLite स्टोरेज इंजन, और परिधीय टेलीमेट्री',
    bridge_hub_name: 'SQLite डेटा हब डेमॉन',
    bridge_hub_port: 'पोर्ट 65433 (WAL)',
    bridge_hub_desc: 'स्थानीय उच्च-समवर्ती घटना टेलीमेट्री और स्थायी डेटाबेस संग्रह',
    bridge_hud_name: 'वीडियो डिटेक्टर HUD ब्रिज',
    bridge_hud_port: 'पोर्ट 65432',
    bridge_hud_desc: 'विंडोज डेस्कटॉप वीडियो प्रहरी के लिए रीयल-टाइम ओवरले सेतु',
    btn_reconnect_hub: '⚡ हब पुनः कनेक्ट करें',
    btn_hub_connected: '✅ कनेक्टेड',
    btn_connecting: '⏳ कनेक्ट हो रहा है...',
    bridge_status_online: 'कनेक्टेड',
    bridge_status_starting: 'कनेक्ट हो रहा है...',
    bridge_status_offline: 'ऑफ़लाइन'
  }
};

// =============================================================================
// Bilingual UI/UX Specification Dictionary (DASHBOARD_UIUX_I18N)
// =============================================================================
const DASHBOARD_UIUX_I18N = {
  en: {
    // Bento & Layout
    bento_customize: "Customize Layout",
    bento_reset_layout: "Reset to Default Layout",
    
    // Command Palette
    cmd_placeholder: "Type a command or search domains... (Esc to dismiss)",
    cmd_quick_actions: "Quick Actions",
    cmd_recent_domains: "Recent Domains",
    cmd_navigation: "Direct Navigation",
    
    // Audio Visualizer Effects
    visualizer_effect_label: "Effect:",
    viz_effect_bars: "32-Band Spectrum",
    viz_effect_wave: "Oscilloscope Wave",
    viz_effect_radial: "Radial Frequency Burst",
    viz_effect_matrix: "Matrix Digital Dots",
    viz_effect_flame: "Neon Flame Peaks",
    viz_effect_stereo: "Stereo Mirror Butterfly",
    viz_effect_lissajous: "Lissajous Stereo Scope",
    viz_effect_hex_grid: "Cyberpunk Hexagon Grid",
    viz_effect_particles: "Starfield Particle Warp",
    viz_effect_retro_grid: "3D Synthwave Retro Grid",
    viz_effect_vinyl_rings: "Vinyl Groove Concentric Rings",
    viz_effect_liquid_wave: "Liquid Mercury Wave",
    viz_video_embed_toggle_title: "Switch to Video Player (Embed Mode)",
    viz_fullwindow_toggle_title: "Toggle Visualizer Full Window (Theater)",
    viz_fullwindow_exit_title: "Exit Visualizer Full Window (Theater)",
    viz_fullscreen_toggle_title: "Toggle Visualizer Fullscreen",
    viz_fullscreen_exit_title: "Exit Fullscreen Visualizer",
    toast_viz_embed_mode_active: "Video Embed Mode active (Live stream playback preview)",
    toast_viz_embed_mode_inactive: "Switched back to Spectrum Visualizer",
    toast_viz_fullwindow_entered: "Visualizer entered Full Window Theater mode",
    toast_viz_fullwindow_exited: "Visualizer exited Full Window mode",
    toast_viz_fullscreen_entered: "Visualizer entered Fullscreen Theater mode",
    toast_viz_fullscreen_exited: "Visualizer exited Fullscreen mode",

    // Precision Scrubber
    scrubber_chapter: "Chapter",
    scrubber_hover_time: "Time",
    
    // Themes & Accents
    theme_midnight_oled: "Midnight OLED",
    theme_slate_navy: "Deep Slate",
    theme_nordic_pine: "Nordic Pine",
    theme_clean_light: "Studio Light",
    accent_emerald: "Cyber Emerald",
    accent_cyan: "Electric Cyan",
    accent_violet: "Royal Violet",
    accent_rose: "Neon Rose",
    accent_amber: "Solar Amber",
    
    // Audio Haptics
    setting_audio_haptics: "Tactile Audio Feedback",
    desc_audio_haptics: "Subtle procedural sound effects on sliders, clicks, and actions",
    
    // Hotkeys Modal
    hotkeys_title: "Keyboard Shortcuts Cheat Sheet",
    hotkeys_nav_1: "Switch to Time Tracking Tab",
    hotkeys_nav_2: "Switch to Media Analytics Tab",
    hotkeys_nav_3: "Switch to Settings Tab",
    hotkeys_media_play: "Play / Pause Active Video",
    hotkeys_media_mute: "Mute / Unmute Audio",
    hotkeys_cmd_palette: "Open Omni Command Palette",
    
    // Local Services & Hardware Bridges
    hardware_bridges_title: "Local Services & Hardware Bridges",
    hardware_bridges_sub: "WebSocket daemons, SQLite storage engine, and peripheral telemetry",
    bridge_hub_name: "SQLite Data Hub Daemon",
    bridge_hub_port: "Port 65433 (WAL)",
    bridge_hub_desc: "Local high-concurrency event telemetry & persistent database store",
    bridge_hud_name: "Video Detector HUD Bridge",
    bridge_hud_port: "Port 65432",
    bridge_hud_desc: "Real-time overlay bridge for Windows desktop video sentinel",
    btn_reconnect_hub: "⚡ Reconnect Hub",
    btn_reconnect_hud: "⚡ Reconnect HUD",
    btn_hub_connected: "✅ Connected",
    btn_hud_connected: "✅ Connected",
    btn_connecting: "⏳ Connecting...",
    bridge_status_online: "Connected",
    bridge_status_starting: "Connecting...",
    bridge_status_offline: "Offline"
  },
  hi: {
    // Bento & Layout
    bento_customize: "लेआउट अनुकूलित करें",
    bento_reset_layout: "डिफ़ॉल्ट लेआउट पर रीसेट करें",
    
    // Command Palette
    cmd_placeholder: "कमांड लिखें या डोमेन खोजें... (बंद करने के लिए Esc दबाएं)",
    cmd_quick_actions: "त्वरित कार्रवाइयां",
    cmd_recent_domains: "हाल के डोमेन्स",
    cmd_navigation: "प्रत्यक्ष नेविगेशन",
    
    // Audio Visualizer Effects
    visualizer_effect_label: "इफ़ेक्ट:",
    viz_effect_bars: "32-बैंड स्पेक्ट्रम",
    viz_effect_wave: "ऑसिलोस्कोप वेव",
    viz_effect_radial: "रेडियल फ़्रीक्वेंसी बर्स्ट",
    viz_effect_matrix: "मैट्रिक्स डिजिटल डॉट्स",
    viz_effect_flame: "नियॉन फ्लेम पीक्स",
    viz_effect_stereo: "स्टीरियो मिरर बटरफ्लाई",
    viz_effect_lissajous: "लिसेजस स्टीरियो स्कोप",
    viz_effect_hex_grid: "साइबरपंक हेक्सागोन ग्रिड",
    viz_effect_particles: "स्टारफ़ील्ड पार्टिकल वॉरप",
    viz_effect_retro_grid: "3D सिंथवेव रेट्रो ग्रिड",
    viz_effect_vinyl_rings: "विनाइल ग्रूव संकेंद्रित छल्ले",
    viz_effect_liquid_wave: "लिक्विड मरकरी वेव",
    viz_video_embed_toggle_title: "वीडियो प्लेयर पर स्विच करें (एम्बेडेड मोड)",
    viz_fullwindow_toggle_title: "विज़ुअलाइज़र फुल विंडो (थिएटर) टॉगल करें",
    viz_fullwindow_exit_title: "फुल विंडो (थिएटर) से बाहर निकलें",
    viz_fullscreen_toggle_title: "विज़ुअलाइज़र फ़ुलस्क्रीन टॉगल करें",
    viz_fullscreen_exit_title: "फ़ुलस्क्रीन विज़ुअलाइज़र से बाहर निकलें",
    toast_viz_embed_mode_active: "वीडियो प्लेयर (एम्बेडेड मोड) सक्रिय",
    toast_viz_embed_mode_inactive: "स्पेक्ट्रम विज़ुअलाइज़र पर वापस स्विच किया गया",
    toast_viz_fullwindow_entered: "विज़ुअलाइज़र फुल विंडो थिएटर मोड में सक्रिय",
    toast_viz_fullwindow_exited: "विज़ुअलाइज़र सामान्य विंडो पर वापस आया",
    toast_viz_fullscreen_entered: "विज़ुअलाइज़र फ़ुलस्क्रीन थिएटर मोड में सक्रिय",
    toast_viz_fullscreen_exited: "विज़ुअलाइज़र सामान्य दृश्य पर वापस आया",

    // Precision Scrubber
    scrubber_chapter: "अध्याय (Chapter)",
    scrubber_hover_time: "समय",
    
    // Themes & Accents
    theme_midnight_oled: "मिडनाइट ओएलईडी",
    theme_slate_navy: "डीप स्लेट",
    theme_nordic_pine: "नॉर्डिक पाइन",
    theme_clean_light: "स्टूडियो लाइट",
    accent_emerald: "साइबर एमराल्ड",
    accent_cyan: "इलेक्ट्रिक सियान",
    accent_violet: "रॉयल वॉयलेट",
    accent_rose: "नियॉन रोज़",
    accent_amber: "सोलर एम्बर",
    
    // Audio Haptics
    setting_audio_haptics: "स्पर्श-योग्य ऑडियो फीडबैक",
    desc_audio_haptics: "स्लाइडर्स, क्लिक्स व कार्रवाइयों पर सूक्ष्म प्रक्रियात्मक ध्वनि प्रभाव",
    
    // Hotkeys Modal
    hotkeys_title: "कीबोर्ड शॉर्टकट्स चीट शीट",
    hotkeys_nav_1: "टाइम ट्रैकिंग टैब पर जाएं",
    hotkeys_nav_2: "मीडिया एनालिटिक्स टैब पर जाएं",
    hotkeys_nav_3: "सेटिंग्स टैब पर जाएं",
    hotkeys_media_play: "सक्रिय वीडियो प्ले / पॉज़ करें",
    hotkeys_media_mute: "ऑडियो म्यूट / अनम्यूट करें",
    hotkeys_cmd_palette: "ओम्नी कमांड पैलेट खोलें",
    
    // Local Services & Hardware Bridges
    hardware_bridges_title: "स्थानीय सेवाएँ और हार्डवेयर सेतु",
    hardware_bridges_sub: "वेबसॉकेट डेमॉन, SQLite स्टोरेज इंजन, और परिधीय टेलीमेट्री",
    bridge_hub_name: "SQLite डेटा हब डेमॉन",
    bridge_hub_port: "पोर्ट 65433 (WAL)",
    bridge_hub_desc: "स्थानीय उच्च-समवर्ती घटना टेलीमेट्री और स्थायी डेटाबेस संग्रह",
    bridge_hud_name: "वीडियो डिटेक्टर HUD ब्रिज",
    bridge_hud_port: "पोर्ट 65432",
    bridge_hud_desc: "विंडोज डेस्कटॉप वीडियो प्रहरी के लिए रीयल-टाइम ओवरले सेतु",
    btn_reconnect_hub: "⚡ हब पुनः कनेक्ट करें",
    btn_reconnect_hud: "⚡ HUD पुनः कनेक्ट करें",
    btn_hub_connected: "✅ कनेक्टेड",
    btn_hud_connected: "✅ कनेक्टेड",
    btn_connecting: "⏳ कनेक्ट हो रहा है...",
    bridge_status_online: "कनेक्टेड",
    bridge_status_starting: "कनेक्ट हो रहा है...",
    bridge_status_offline: "ऑफ़लाइन"
  }
};

let currentLang = 'en';

function t(key, ...args) {
  const dict = DASHBOARD_I18N[currentLang] || DASHBOARD_I18N.en;
  const uiuxDict = (typeof DASHBOARD_UIUX_I18N !== 'undefined' && (DASHBOARD_UIUX_I18N[currentLang] || DASHBOARD_UIUX_I18N.en)) || {};
  let val = dict[key] || uiuxDict[key] || DASHBOARD_I18N.en[key] || (typeof DASHBOARD_UIUX_I18N !== 'undefined' && DASHBOARD_UIUX_I18N.en && DASHBOARD_UIUX_I18N.en[key]) || key;
  if (typeof val === 'function') {
    return val(...args);
  }
  return val;
}

// =============================================================================
// Theme Architecture State & Helpers (Defect 16 - Light & Dark Theme Sync)
// Phase 4: Base Substrates & Dynamic Accent Palettes
// =============================================================================
let currentTheme = 'dark';
let currentSubstrate = 'slate-navy';
let currentAccent = 'emerald';

const SUBSTRATE_THEMES = {
  'midnight-oled': {
    '--bg-primary': '#000000',
    '--bg-secondary': '#0a0d14',
    '--glass-surface-bg': 'rgba(10, 13, 20, 0.82)',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#9cb2c9',
    '--text-muted': '#9cb2c9',
    '--border-dim': 'rgba(255, 255, 255, 0.08)'
  },
  'slate-navy': {
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--glass-surface-bg': 'rgba(18, 24, 38, 0.72)',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#9cb2c9',
    '--text-muted': '#9cb2c9',
    '--border-dim': 'rgba(255, 255, 255, 0.08)'
  },
  'nordic-pine': {
    '--bg-primary': '#091811',
    '--bg-secondary': '#122a20',
    '--glass-surface-bg': 'rgba(18, 42, 32, 0.76)',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#cbd5e1',
    '--text-muted': '#a7bdae',
    '--border-dim': 'rgba(255, 255, 255, 0.08)'
  },
  'studio-light': {
    '--bg-primary': '#f8fafc',
    '--bg-secondary': '#ffffff',
    '--glass-surface-bg': 'rgba(255, 255, 255, 0.85)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--text-muted': '#475569',
    '--border-dim': 'rgba(0, 0, 0, 0.10)'
  }
};

const ACCENT_PALETTES = {
  'emerald': {
    '--color-accent-primary': '#10b981',
    '--color-accent-hover': '#059669',
    '--shadow-specular-glow': 'rgba(16, 185, 129, 0.20)'
  },
  'cyan': {
    '--color-accent-primary': '#06b6d4',
    '--color-accent-hover': '#0891b2',
    '--shadow-specular-glow': 'rgba(6, 182, 212, 0.20)'
  },
  'violet': {
    '--color-accent-primary': '#8b5cf6',
    '--color-accent-hover': '#7c3aed',
    '--shadow-specular-glow': 'rgba(139, 92, 246, 0.20)'
  },
  'rose': {
    '--color-accent-primary': '#f43f5e',
    '--color-accent-hover': '#e11d48',
    '--shadow-specular-glow': 'rgba(244, 63, 94, 0.20)'
  },
  'amber': {
    '--color-accent-primary': '#f59e0b',
    '--color-accent-hover': '#d97706',
    '--shadow-specular-glow': 'rgba(245, 158, 11, 0.20)'
  }
};

// Early theme restore to prevent theme flash
try {
  if (typeof localStorage !== 'undefined') {
    const savedEarlyTheme = localStorage.getItem('ui_theme') || localStorage.getItem('theme');
    if (savedEarlyTheme === 'light' || savedEarlyTheme === 'dark') {
      currentTheme = savedEarlyTheme;
    }
  }
} catch (_) {}
if (typeof document !== 'undefined') {
  if (document.documentElement && typeof document.documentElement.setAttribute === 'function') {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
  if (document.body) {
    if (typeof document.body.setAttribute === 'function') {
      document.body.setAttribute('data-theme', currentTheme);
    }
    if (document.body.classList && typeof document.body.classList.add === 'function') {
      if (currentTheme === 'light') {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
      } else {
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-light');
      }
    }
  }
}

function applyCustomTheme(themeKey, accentKey) {
  const root = (typeof document !== 'undefined' && document.documentElement) ? document.documentElement : null;
  const theme = themeKey || currentSubstrate || 'slate-navy';
  const accent = accentKey || currentAccent || 'emerald';

  currentSubstrate = theme;
  currentAccent = accent;

  const themeVars = SUBSTRATE_THEMES[theme] || SUBSTRATE_THEMES['slate-navy'];
  const accentVars = ACCENT_PALETTES[accent] || ACCENT_PALETTES['emerald'];

  if (root && root.style && typeof root.style.setProperty === 'function') {
    Object.entries({ ...themeVars, ...accentVars }).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
    if (typeof root.setAttribute === 'function') {
      root.setAttribute('data-substrate', theme);
      root.setAttribute('data-accent', accent);
    }
  }

  if (typeof document !== 'undefined' && document.body) {
    if (theme === 'studio-light') {
      currentTheme = 'light';
      if (document.body.classList && typeof document.body.classList.add === 'function') {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
      }
    } else {
      currentTheme = 'dark';
      if (document.body.classList && typeof document.body.classList.add === 'function') {
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-light');
      }
    }
    if (typeof document.body.setAttribute === 'function') {
      document.body.setAttribute('data-theme', currentTheme);
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ userThemePreferences: { theme, accent } });
  }

  updateThemeSelectionUI(theme, accent);
}

function updateThemeSelectionUI(theme, accent) {
  if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;

  const targetTheme = theme || currentSubstrate || 'slate-navy';
  const targetAccent = accent || currentAccent || 'emerald';

  const themePills = document.querySelectorAll('.theme-pill');
  if (themePills && themePills.forEach) {
    themePills.forEach((pill) => {
      const pTheme = pill.getAttribute('data-theme');
      if (pTheme === targetTheme) {
        pill.classList.add('active');
        pill.setAttribute('aria-checked', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-checked', 'false');
      }
    });
  }

  const accentSwatches = document.querySelectorAll('.accent-swatch');
  if (accentSwatches && accentSwatches.forEach) {
    accentSwatches.forEach((swatch) => {
      const sAccent = swatch.getAttribute('data-accent');
      if (sAccent === targetAccent) {
        swatch.classList.add('active');
        swatch.setAttribute('aria-checked', 'true');
      } else {
        swatch.classList.remove('active');
        swatch.setAttribute('aria-checked', 'false');
      }
    });
  }
}

class MultiThemeEngine {
  constructor() {
    this.currentTheme = 'slate-navy';
    this.currentAccent = 'emerald';
    this.loadPreferences();
  }

  loadPreferences(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userThemePreferences'], (result) => {
        if (result && result.userThemePreferences) {
          this.currentTheme = result.userThemePreferences.theme || 'slate-navy';
          this.currentAccent = result.userThemePreferences.accent || 'emerald';
        }
        applyCustomTheme(this.currentTheme, this.currentAccent);
        if (typeof callback === 'function') callback();
      });
    } else {
      applyCustomTheme(this.currentTheme, this.currentAccent);
      if (typeof callback === 'function') callback();
    }
  }

  setTheme(themeKey, accentKey) {
    if (themeKey) this.currentTheme = themeKey;
    if (accentKey) this.currentAccent = accentKey;
    applyCustomTheme(this.currentTheme, this.currentAccent);
  }

  getTheme() {
    return { theme: this.currentTheme, accent: this.currentAccent };
  }
}

const multiThemeEngine = new MultiThemeEngine();

function applyTheme(theme, accent) {
  if (theme === 'light') {
    currentTheme = 'light';
    applyCustomTheme('studio-light', accent || currentAccent || 'emerald');
  } else if (theme === 'dark') {
    currentTheme = 'dark';
    applyCustomTheme('slate-navy', accent || currentAccent || 'emerald');
  } else if (SUBSTRATE_THEMES[theme]) {
    applyCustomTheme(theme, accent || currentAccent || 'emerald');
    currentTheme = (theme === 'studio-light') ? 'light' : 'dark';
  } else {
    currentTheme = (theme === 'light') ? 'light' : 'dark';
  }

  if (typeof document !== 'undefined') {
    if (document.body) {
      if (document.body.classList && typeof document.body.classList.add === 'function') {
        if (currentTheme === 'light') {
          document.body.classList.add('theme-light');
          document.body.classList.remove('theme-dark');
        } else {
          document.body.classList.add('theme-dark');
          document.body.classList.remove('theme-light');
        }
      }
      if (typeof document.body.setAttribute === 'function') {
        document.body.setAttribute('data-theme', currentTheme);
      }
    }
    if (document.documentElement && typeof document.documentElement.setAttribute === 'function') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }
  updateThemeToggleUI(currentTheme);
}

// =============================================================================
// Synthesized Tactile Audio Haptics Engine (Web Audio API - System 7)
// =============================================================================
class SentinelHapticAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = 0.15; // 15% subtle volume
    this.loadPreferences();
  }

  loadPreferences(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['audioHapticsConfig'], (result) => {
        if (result && result.audioHapticsConfig) {
          this.enabled = result.audioHapticsConfig.enabled ?? true;
          this.masterGain = (typeof result.audioHapticsConfig.volume === 'number') 
            ? result.audioHapticsConfig.volume 
            : 0.15;
        }
        if (typeof callback === 'function') callback();
      });
    } else {
      if (typeof callback === 'function') callback();
    }
  }

  savePreferences() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        audioHapticsConfig: {
          enabled: this.enabled,
          volume: this.masterGain
        }
      });
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
                       (typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext));
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (_) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
      try {
        this.ctx.resume();
      } catch (_) {}
    }
  }

  setVolume(vol) {
    const v = Math.max(0, Math.min(1, parseFloat(vol)));
    if (!isNaN(v)) {
      this.masterGain = v;
      this.savePreferences();
    }
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.savePreferences();
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime || 0;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(this.masterGain * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.007);
    } catch (_) {}
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime || 0;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(this.masterGain * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.013);
    } catch (_) {}
  }

  playSuccessChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime || 0;
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.04));
        gain.gain.setValueAtTime(this.masterGain, now + (idx * 0.04));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx * 0.04) + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + (idx * 0.04));
        osc.stop(now + (idx * 0.04) + 0.23);
      });
    } catch (_) {}
  }

  playWarnTone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime || 0;
      [0, 0.08].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now + offset);
        gain.gain.setValueAtTime(this.masterGain * 0.5, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.06);
      });
    } catch (_) {}
  }
}

const sentinelHaptics = new SentinelHapticAudioEngine();
if (typeof window !== 'undefined') {
  window.SentinelHapticAudioEngine = SentinelHapticAudioEngine;
  window.sentinelHaptics = sentinelHaptics;
  window.MultiThemeEngine = MultiThemeEngine;
  window.multiThemeEngine = multiThemeEngine;
  window.applyCustomTheme = applyCustomTheme;
  window.SUBSTRATE_THEMES = SUBSTRATE_THEMES;
  window.ACCENT_PALETTES = ACCENT_PALETTES;
  window.DASHBOARD_UIUX_I18N = DASHBOARD_UIUX_I18N;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SentinelHapticAudioEngine = SentinelHapticAudioEngine;
  globalThis.sentinelHaptics = sentinelHaptics;
  globalThis.MultiThemeEngine = MultiThemeEngine;
  globalThis.multiThemeEngine = multiThemeEngine;
  globalThis.applyCustomTheme = applyCustomTheme;
  globalThis.SUBSTRATE_THEMES = SUBSTRATE_THEMES;
  globalThis.ACCENT_PALETTES = ACCENT_PALETTES;
  globalThis.DASHBOARD_UIUX_I18N = DASHBOARD_UIUX_I18N;
  globalThis.handleMuteAllOthers = handleMuteAllOthers;
  globalThis.handleMuteAll = handleMuteAll;
  globalThis.resolvePrimaryMediaTabId = resolvePrimaryMediaTabId;
  globalThis.initStickyMiniPlayerDock = initStickyMiniPlayerDock;
  globalThis.updateSidebarLiveEqState = updateSidebarLiveEqState;
  globalThis.updateHeroVolumeUI = updateHeroVolumeUI;
}

// ============================================================================
// Future UI/UX Systems Helpers
// ============================================================================

function initStickyMiniPlayerDock() {
  if (typeof document === 'undefined') return;
  const heroCard = document.getElementById('heroMediaPlayerCard');
  const miniDock = document.getElementById('stickyMiniPlayerDock');
  if (!heroCard || !miniDock) return;

  const playPauseBtn = document.getElementById('miniDockPlayPause');
  const titleEl = document.getElementById('miniDockTitle');
  const timeEl = document.getElementById('miniDockTime');
  const pipBtn = document.getElementById('miniDockPip');
  const jumpBtn = document.getElementById('miniDockJump');
  const closeBtn = document.getElementById('miniDockClose');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (typeof triggerMediaPlayPause === 'function') triggerMediaPlayPause();
    });
  }
  if (pipBtn) {
    pipBtn.addEventListener('click', () => {
      if (typeof triggerMediaPip === 'function') triggerMediaPip();
    });
  }
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      heroCard.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      miniDock.classList.add('hidden');
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const pm = (typeof dashboardData !== 'undefined' && dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia) 
                 || (typeof globalMediaState !== 'undefined' && globalMediaState && globalMediaState.primaryMedia);
      const isPlaying = pm && (pm.status === 'playing' || pm.is_playing || pm.isPlaying);
      
      if (!entry.isIntersecting && isPlaying) {
        miniDock.classList.remove('hidden');
        if (titleEl && pm.title) titleEl.textContent = pm.title;
        if (timeEl && typeof pm.currentTimeFormatted === 'string') timeEl.textContent = pm.currentTimeFormatted;
      } else {
        miniDock.classList.add('hidden');
      }
    });
  }, { threshold: 0.1 });

  observer.observe(heroCard);
}

function updateSidebarLiveEqState(isPlaying) {
  if (typeof document === 'undefined') return;
  const viz = document.getElementById('sidebarLiveEqVisualizer');
  if (!viz) return;
  if (isPlaying) {
    viz.classList.remove('hidden');
  } else {
    viz.classList.add('hidden');
  }
}

function updateHeroVolumeUI(volumeFraction) {
  if (typeof document === 'undefined') return;
  const volIcon = document.getElementById('heroVolumeIcon');
  const volText = document.getElementById('heroVolumeText');
  const volTooltip = document.querySelector('.vol-floating-tooltip');
  
  const pct = Math.round(volumeFraction * 100);
  if (volText) volText.textContent = `${pct}%`;
  if (volTooltip) volTooltip.textContent = `${pct}%`;

  if (volIcon) {
    if (pct === 0) volIcon.textContent = '🔇';
    else if (pct <= 33) volIcon.textContent = '🔈';
    else if (pct <= 66) volIcon.textContent = '🔉';
    else volIcon.textContent = '🔊';
  }
}

/**
 * Checks whether the Media Playback History header (#headingMediaHistory) has
 * scrolled out of the viewport / above the top boundary of the scroll container.
 *
 * @param {HTMLElement|null} heading
 * @param {HTMLElement|null} mainStage
 * @returns {boolean}
 */
function isMediaHeadingScrolledPast(heading, mainStage) {
  if (!heading || typeof heading.getBoundingClientRect !== 'function') {
    return false;
  }
  const headingRect = heading.getBoundingClientRect();
  const stageTop = (mainStage && typeof mainStage.getBoundingClientRect === 'function')
    ? mainStage.getBoundingClientRect().top
    : 0;

  return (headingRect.bottom < stageTop) || (headingRect.top < 0);
}

/**
 * Updates visibility of the Media History "Scroll to Top" button.
 *
 * @param {boolean} shouldShow
 */
function setMediaScrollToTopVisible(shouldShow) {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btnMediaScrollToTop');
  if (!btn) return;

  if (shouldShow) {
    btn.classList.remove('hidden');
    btn.classList.add('visible');
  } else {
    btn.classList.add('hidden');
    btn.classList.remove('visible');
  }
}

/**
 * Handles smooth scrolling of the main content stage back to the top.
 */
function handleMediaScrollToTopClick() {
  const mainStage = (typeof document !== 'undefined') ? document.querySelector('.main-stage') : null;
  if (mainStage) {
    if (typeof mainStage.scrollTo === 'function') {
      mainStage.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      mainStage.scrollTop = 0;
    }
  }
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  setMediaScrollToTopVisible(false);
}

/**
 * Evaluates header intersection entry and scroll position to determine button visibility.
 * Strictly verifies that #headingMediaHistory has scrolled out of viewport / container top.
 *
 * @param {IntersectionObserverEntry} [entry]
 * @param {HTMLElement|null} [mainStage]
 */
function evaluateMediaScrollVisibility(entry, mainStage) {
  const paneMedia = (typeof document !== 'undefined') ? document.getElementById('paneMedia') : null;
  const isMediaActive = Boolean(paneMedia && paneMedia.classList && typeof paneMedia.classList.contains === 'function' && paneMedia.classList.contains('active'));
  if (!isMediaActive) {
    setMediaScrollToTopVisible(false);
    return;
  }

  const stage = mainStage || ((typeof document !== 'undefined') ? document.querySelector('.main-stage') : null);
  const heading = document.getElementById('headingMediaHistory');
  if (!heading) {
    setMediaScrollToTopVisible(false);
    return;
  }

  let shouldShow = isMediaHeadingScrolledPast(heading, stage);

  if (entry && typeof entry.isIntersecting === 'boolean') {
    if (entry.isIntersecting) {
      shouldShow = false;
    } else {
      const rootTop = (entry.rootBounds && typeof entry.rootBounds.top === 'number')
        ? entry.rootBounds.top
        : ((stage && typeof stage.getBoundingClientRect === 'function') ? stage.getBoundingClientRect().top : 0);
      const bBottom = (entry.boundingClientRect && typeof entry.boundingClientRect.bottom === 'number')
        ? entry.boundingClientRect.bottom
        : (heading.getBoundingClientRect ? heading.getBoundingClientRect().bottom : 0);
      const bTop = (entry.boundingClientRect && typeof entry.boundingClientRect.top === 'number')
        ? entry.boundingClientRect.top
        : (heading.getBoundingClientRect ? heading.getBoundingClientRect().top : 0);
      shouldShow = (bBottom < rootTop) || (bTop < 0);
    }
  }

  setMediaScrollToTopVisible(shouldShow);
}

/**
 * Initializes the floating circular "Scroll to Top" button for the Media History view.
 */
function initMediaScrollToTop() {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btnMediaScrollToTop');
  const targetHeader = document.getElementById('headingMediaHistory');
  const mainStage = document.querySelector('.main-stage');
  if (!btn) return;

  btn.addEventListener('click', handleMediaScrollToTopClick);

  if (targetHeader && typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      if (entries && entries.length) {
        evaluateMediaScrollVisibility(entries[0], mainStage);
      }
    }, {
      root: mainStage || null,
      threshold: [0, 1.0]
    });
    observer.observe(targetHeader);
  }

  const handleScroll = () => {
    evaluateMediaScrollVisibility(null, mainStage);
  };

  if (mainStage) {
    mainStage.addEventListener('scroll', handleScroll, { passive: true });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

/**
 * Checks whether the Domain Breakdown Table header (#headingDomainTable) has
 * scrolled out of the viewport / above the top boundary of the scroll container.
 *
 * @param {HTMLElement|null} heading
 * @param {HTMLElement|null} mainStage
 * @returns {boolean}
 */
function isTimeHeadingScrolledPast(heading, mainStage) {
  if (!heading || typeof heading.getBoundingClientRect !== 'function') {
    return false;
  }
  const headingRect = heading.getBoundingClientRect();
  const stageTop = (mainStage && typeof mainStage.getBoundingClientRect === 'function')
    ? mainStage.getBoundingClientRect().top
    : 0;

  return (headingRect.bottom < stageTop) || (headingRect.top < 0);
}

/**
 * Updates visibility of the Time Tracking "Scroll to Top" button.
 *
 * @param {boolean} shouldShow
 */
function setTimeScrollToTopVisible(shouldShow) {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btnTimeScrollToTop');
  if (!btn) return;

  if (shouldShow) {
    btn.classList.remove('hidden');
    btn.classList.add('visible');
  } else {
    btn.classList.add('hidden');
    btn.classList.remove('visible');
  }
}

/**
 * Handles smooth scrolling of the main content stage back to the top for Time Tracking.
 */
function handleTimeScrollToTopClick() {
  const mainStage = (typeof document !== 'undefined') ? document.querySelector('.main-stage') : null;
  if (mainStage) {
    if (typeof mainStage.scrollTo === 'function') {
      mainStage.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      mainStage.scrollTop = 0;
    }
  }
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  setTimeScrollToTopVisible(false);
}

/**
 * Evaluates header intersection entry and scroll position to determine Time Tracking button visibility.
 * Strictly verifies that #headingDomainTable has scrolled out of viewport / container top.
 *
 * @param {IntersectionObserverEntry} [entry]
 * @param {HTMLElement|null} [mainStage]
 */
function evaluateTimeScrollVisibility(entry, mainStage) {
  const paneTracking = (typeof document !== 'undefined')
    ? (document.getElementById('paneTracking') || document.getElementById('paneTime'))
    : null;
  const isTrackingActive = Boolean(paneTracking && paneTracking.classList && typeof paneTracking.classList.contains === 'function' && paneTracking.classList.contains('active'));
  if (!isTrackingActive) {
    setTimeScrollToTopVisible(false);
    return;
  }

  const stage = mainStage || ((typeof document !== 'undefined') ? document.querySelector('.main-stage') : null);
  const heading = (typeof document !== 'undefined') ? document.getElementById('headingDomainTable') : null;
  if (!heading) {
    setTimeScrollToTopVisible(false);
    return;
  }

  let shouldShow = isTimeHeadingScrolledPast(heading, stage);

  if (entry && typeof entry.isIntersecting === 'boolean') {
    if (entry.isIntersecting) {
      shouldShow = false;
    } else {
      const rootTop = (entry.rootBounds && typeof entry.rootBounds.top === 'number')
        ? entry.rootBounds.top
        : ((stage && typeof stage.getBoundingClientRect === 'function') ? stage.getBoundingClientRect().top : 0);
      const bBottom = (entry.boundingClientRect && typeof entry.boundingClientRect.bottom === 'number')
        ? entry.boundingClientRect.bottom
        : (heading.getBoundingClientRect ? heading.getBoundingClientRect().bottom : 0);
      const bTop = (entry.boundingClientRect && typeof entry.boundingClientRect.top === 'number')
        ? entry.boundingClientRect.top
        : (heading.getBoundingClientRect ? heading.getBoundingClientRect().top : 0);
      shouldShow = (bBottom < rootTop) || (bTop < 0);
    }
  }

  setTimeScrollToTopVisible(shouldShow);
}

/**
 * Initializes the floating circular "Scroll to Top" button for the Time Tracking view.
 */
function initTimeScrollToTop() {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btnTimeScrollToTop');
  const targetHeader = document.getElementById('headingDomainTable');
  const mainStage = document.querySelector('.main-stage');
  if (!btn) return;

  btn.addEventListener('click', handleTimeScrollToTopClick);

  if (targetHeader && typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      if (entries && entries.length) {
        evaluateTimeScrollVisibility(entries[0], mainStage);
      }
    }, {
      root: mainStage || null,
      threshold: [0, 1.0]
    });
    observer.observe(targetHeader);
  }

  const handleScroll = () => {
    evaluateTimeScrollVisibility(null, mainStage);
  };

  if (mainStage) {
    mainStage.addEventListener('scroll', handleScroll, { passive: true });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Initial check if Time Tracking tab is already active
  const paneTracking = (typeof document !== 'undefined')
    ? (document.getElementById('paneTracking') || document.getElementById('paneTime'))
    : null;
  if (paneTracking && paneTracking.classList && typeof paneTracking.classList.contains === 'function' && paneTracking.classList.contains('active')) {
    evaluateTimeScrollVisibility(null, mainStage);
  }
}

function updateThemeToggleUI(theme) {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btnThemeToggle');
  if (!btn) return;

  const isLight = (theme === 'light');
  const label = isLight ? t('theme_toggle_dark') : t('theme_toggle_light');
  btn.title = label;
  if (typeof btn.setAttribute === 'function') {
    btn.setAttribute('aria-label', label);
  }

  const txtEl = document.getElementById('themeToggleText');
  if (txtEl) {
    txtEl.textContent = isLight ? t('theme_btn_dark') : t('theme_btn_light');
  }

  if (typeof btn.querySelector !== 'function') return;
  const svg = btn.querySelector('.theme-toggle-icon');
  if (!svg) return;

  // W3C Trusted Types safe DOM node replacement (zero innerHTML)
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  if (isLight) {
    // Moon icon for switching to dark mode
    if (typeof document.createElementNS === 'function') {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
      svg.appendChild(path);
    }
  } else {
    // Sun icon for switching to light mode
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
  }
}

async function toggleThemeMode() {
  const nextTheme = (currentTheme === 'light') ? 'dark' : 'light';
  applyTheme(nextTheme);

  if (typeof showToast === 'function') {
    showToast(
      (nextTheme === 'light') ? t('theme_active_light') : t('theme_active_dark')
    );
  }

  // Persist to chrome.storage.local with fallback to localStorage
  try {
    const api = (typeof browserAPI !== 'undefined' && browserAPI.storage && browserAPI.storage.local)
      ? browserAPI
      : ((typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome : (typeof browser !== 'undefined' && browser.storage ? browser : null));
    if (api && api.storage && api.storage.local) {
      await api.storage.local.set({ ui_theme: nextTheme, theme: nextTheme });
    }
  } catch (_) {}

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ui_theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    }
  } catch (_) {}
}

// =============================================================================
// Audio Lab Telemetry & DSP Controls State (Defect 15 - Web Audio Parity)
// =============================================================================
const DASHBOARD_EQ_PRESETS = {
  flat: [0, 0, 0, 0, 0],
  bass_boost: [6, 4, 1, 0, -1],
  vocal_enhancer: [-3, 1, 4, 5, 2],
  vocal_clarify: [-3, 1, 4, 5, 2],
  treble_boost: [-2, 0, 1, 4, 6],
  electronic: [5, 3, 0, 2, 4],
  rock: [5, 3, -1, 3, 5],
  acoustic: [3, 2, 1, 2, 3],
  night_mode: [-4, -2, 2, 1, -3],
  night: [-4, -2, 2, 1, -3]
};

let dashboardAudioLabSettings = {
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
  night_shield: false,
  bass_boost: false
};

function dispatchAudioLabSettings(settings) {
  const api = (typeof browserAPI !== 'undefined' && browserAPI && browserAPI.runtime)
    ? browserAPI
    : (typeof chrome !== 'undefined' && chrome.runtime ? chrome : (typeof browser !== 'undefined' && browser.runtime ? browser : (typeof globalThis !== 'undefined' && globalThis.browserAPI ? globalThis.browserAPI : null)));
  const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
  const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
  if (targetTabId && api && api.tabs && typeof api.tabs.sendMessage === 'function') {
    try {
      const p = api.tabs.sendMessage(targetTabId, {
        type: 'APPLY_AUDIO_LAB_SETTINGS',
        settings: settings
      });
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_) {}
  }
  if (api && api.runtime && typeof api.runtime.sendMessage === 'function') {
    try {
      const p2 = api.runtime.sendMessage({
        type: 'APPLY_AUDIO_LAB_SETTINGS',
        settings: settings,
        tabId: targetTabId
      });
      if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
    } catch (_) {}
  }
}

function persistDashboardAudioLabSettings(updated) {
  if (updated) {
    dashboardAudioLabSettings = { ...dashboardAudioLabSettings, ...updated };
    if (updated.eq_bands) {
      dashboardAudioLabSettings.eq_bands = {
        ...dashboardAudioLabSettings.eq_bands,
        ...updated.eq_bands
      };
    }
  }
  const api = (typeof browserAPI !== 'undefined' && browserAPI && browserAPI.storage)
    ? browserAPI
    : (typeof chrome !== 'undefined' && chrome.storage ? chrome : (typeof browser !== 'undefined' && browser.storage ? browser : (typeof globalThis !== 'undefined' && globalThis.browserAPI ? globalThis.browserAPI : null)));
  try {
    if (api && api.storage && api.storage.local) {
      api.storage.local.set({ audio_lab_settings: dashboardAudioLabSettings });
    }
  } catch (_) {}
  dispatchAudioLabSettings(dashboardAudioLabSettings);
}

function updateDashboardAudioBoostUI(boostVal) {
  const boost = typeof boostVal === 'number' ? boostVal : 100;
  const boostValEl = document.getElementById('heroAudioBoostVal');
  if (boostValEl) {
    boostValEl.textContent = `${boost}%`;
  }
  const slider = document.getElementById('heroAudioBoostSlider');
  if (slider) {
    if (Number(slider.value) !== Number(boost)) {
      slider.value = String(boost);
    }
    if (typeof slider.setAttribute === 'function') {
      slider.setAttribute('aria-valuenow', String(boost));
    }
  }
}

function updateDashboardAudioEqPresetUI(presetKey) {
  let preset = presetKey || 'flat';
  if (preset === 'vocal_clarify') preset = 'vocal_enhancer';
  if (preset === 'night') preset = 'night_mode';

  const presetBadge = document.getElementById('audioLabPresetBadge');
  if (presetBadge) {
    presetBadge.textContent = preset.charAt(0).toUpperCase() + preset.slice(1).replace('_', ' ');
  }

  const presetSelect = document.getElementById('audioEqPresetSelect');
  if (presetSelect && presetSelect.options && presetSelect.value !== preset) {
    for (const opt of presetSelect.options) {
      if (opt.value === preset) {
        presetSelect.value = preset;
        break;
      }
    }
  }
}

function updateDashboardAudioEqBandsUI(bands) {
  const eqBands = ['60', '250', '1000', '4000', '16000'];
  eqBands.forEach((b) => {
    const val = (bands && typeof bands[b] === 'number') ? bands[b] : 0;
    const bandSlider = document.getElementById(`eqBand${b}`);
    if (bandSlider) {
      if (Number(bandSlider.value) !== Number(val)) {
        bandSlider.value = String(val);
      }
      if (typeof bandSlider.setAttribute === 'function') {
        bandSlider.setAttribute('aria-valuenow', String(val));
      }
    }
    const valSpan = document.getElementById(`eqVal${b}`);
    if (valSpan) {
      valSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
    }
  });
}

function updateDashboardAudioTogglesUI() {
  const isVocal = Boolean(dashboardAudioLabSettings.vocal_clarity);
  const vocalBadge = document.getElementById('audioLabVocalBadge');
  if (vocalBadge) {
    vocalBadge.textContent = isVocal ? t('audiolab_vocal_on') : t('audiolab_vocal_off');
    if (vocalBadge.classList && typeof vocalBadge.classList.add === 'function') {
      if (isVocal) vocalBadge.classList.add('badge-active');
      else vocalBadge.classList.remove('badge-active');
    }
  }
  const toggleVocal = document.getElementById('toggleVocalClarity');
  if (toggleVocal && toggleVocal.checked !== isVocal) {
    toggleVocal.checked = isVocal;
  }

  const isNight = Boolean(dashboardAudioLabSettings.night_shield);
  const nightBadge = document.getElementById('audioLabNightBadge');
  if (nightBadge) {
    nightBadge.textContent = isNight ? t('audiolab_night_on') : t('audiolab_night_off');
    if (nightBadge.classList && typeof nightBadge.classList.add === 'function') {
      if (isNight) nightBadge.classList.add('badge-active');
      else nightBadge.classList.remove('badge-active');
    }
  }
  const toggleNight = document.getElementById('toggleNightShield');
  if (toggleNight && toggleNight.checked !== isNight) {
    toggleNight.checked = isNight;
  }

  const isBass = Boolean(dashboardAudioLabSettings.bass_boost);
  const toggleBass = document.getElementById('toggleBassBoost');
  if (toggleBass && toggleBass.checked !== isBass) {
    toggleBass.checked = isBass;
  }

  const isAudioOnly = Boolean(dashboardAudioLabSettings.audio_only);
  const toggleAudioOnly = document.getElementById('toggleAudioOnlyMode');
  if (toggleAudioOnly && toggleAudioOnly.checked !== isAudioOnly) {
    toggleAudioOnly.checked = isAudioOnly;
  }
}

function updateDashboardAudioLabUI(settings) {
  if (!settings) return;
  dashboardAudioLabSettings = { ...dashboardAudioLabSettings, ...settings };
  if (settings.eq_bands) {
    dashboardAudioLabSettings.eq_bands = {
      ...dashboardAudioLabSettings.eq_bands,
      ...settings.eq_bands
    };
  }

  updateDashboardAudioBoostUI(dashboardAudioLabSettings.master_boost);
  updateDashboardAudioEqPresetUI(dashboardAudioLabSettings.eq_preset);
  updateDashboardAudioEqBandsUI(dashboardAudioLabSettings.eq_bands);
  updateDashboardAudioTogglesUI();
}

// Global Dashboard State
let currentTab = 'tracking'; // 'tracking' | 'media' | 'settings'
let temporalSubtab = 'today'; // 'today' | 'daily' | 'total'
let dashboardData = null;
let mediaHistoryData = [];
let selectedBrowser = 'all'; // 'all' | 'chrome' | 'edge' | 'brave' | 'opera'
let selectedTrackingMode = 'all'; // 'all' (Combined) | 'foreground' (Active Only) | 'background_media' (Media Only)
let selectedDomainCategory = 'all'; // 'all' | 'web' | 'internal'
let hudLaunchInProgress = false;
let hubConnectInProgress = false;

// Feature 1 & 2 State: Temporal Engine & Productivity Classifier
let domainCategoryOverrides = {};
let currentHeatmapMode = 'focus'; // 'focus' | 'media'
let currentHeatmapMatrix = null;
let customStartDate = '';
let customEndDate = '';

const DEFAULT_DOMAIN_CATEGORIES = (_TemporalProductivity && _TemporalProductivity.DEFAULT_DOMAIN_CATEGORIES) || {
  'github.com': 'work',
  'gitlab.com': 'work',
  'stackoverflow.com': 'work',
  'vscode.dev': 'work',
  'jira.atlassian.com': 'work',
  'linear.app': 'work',
  'aws.amazon.com': 'work',
  'console.cloud.google.com': 'work',
  'figma.com': 'work',
  'localhost': 'work',
  '127.0.0.1': 'work',
  'developer.mozilla.org': 'learning',
  'arxiv.org': 'learning',
  'coursera.org': 'learning',
  'udemy.com': 'learning',
  'wikipedia.org': 'learning',
  'medium.com': 'learning',
  'dev.to': 'learning',
  'youtube.com': 'entertainment',
  'netflix.com': 'entertainment',
  'spotify.com': 'entertainment',
  'twitch.tv': 'entertainment',
  'web.whatsapp.com': 'social',
  'slack.com': 'social',
  'discord.com': 'social',
  'twitter.com': 'social',
  'x.com': 'social',
  'reddit.com': 'social',
  'mail.google.com': 'utility',
  'drive.google.com': 'utility',
  'notion.so': 'utility',
  'google.com': 'utility'
};

function getDomainCategory(domain, overrides = domainCategoryOverrides) {
  if (_TemporalProductivity && typeof _TemporalProductivity.getDomainCategory === 'function') {
    return _TemporalProductivity.getDomainCategory(domain, overrides);
  }
  if (!domain) return 'utility';
  const clean = String(domain).toLowerCase().trim();
  if (overrides && overrides[clean]) {
    if (typeof overrides[clean] === 'string') return overrides[clean];
    if (typeof overrides[clean] === 'object' && overrides[clean].category) return overrides[clean].category;
  }
  if (DEFAULT_DOMAIN_CATEGORIES[clean]) return DEFAULT_DOMAIN_CATEGORIES[clean];
  const parts = clean.split('.');
  if (parts.length > 2) {
    const parent = parts.slice(-2).join('.');
    if (DEFAULT_DOMAIN_CATEGORIES[parent]) return DEFAULT_DOMAIN_CATEGORIES[parent];
  }
  if (isInternalDomain(clean)) return 'utility';
  return 'work';
}

function calculateProductivityScore(timeByCategory, totalActiveTime) {
  if (_TemporalProductivity && typeof _TemporalProductivity.calculateProductivityScore === 'function') {
    return _TemporalProductivity.calculateProductivityScore(timeByCategory, totalActiveTime);
  }
  const W = (timeByCategory && Number(timeByCategory.work)) || 0;
  const L = (timeByCategory && Number(timeByCategory.learning)) || 0;
  const U = (timeByCategory && Number(timeByCategory.utility)) || 0;
  const S = (timeByCategory && Number(timeByCategory.social)) || 0;
  const E = (timeByCategory && Number(timeByCategory.entertainment)) || 0;
  const sum = W + L + U + S + E;
  const T = typeof totalActiveTime === 'number' && totalActiveTime > 0 ? totalActiveTime : sum;
  if (T <= 0) return { score: 0, tier: 'distracted', timeByCategory: { work: W, learning: L, utility: U, social: S, entertainment: E }, totalActiveTime: 0, valueOf: function() { return this.score; } };
  const rawNumerator = (W * 1.0) + (L * 0.95) + (U * 0.7) - (S * 0.4) - (E * 0.8);
  const score = Math.max(0, Math.min(100, Math.round((rawNumerator / T) * 100)));
  const tier = score >= 80 ? 'focus' : score >= 60 ? 'balanced' : 'distracted';
  return { score, tier, timeByCategory: { work: W, learning: L, utility: U, social: S, entertainment: E }, totalActiveTime: T, valueOf: function() { return this.score; } };
}

function renderProductivityGauge(score, tier) {
  if (_TemporalProductivity && typeof _TemporalProductivity.renderProductivityGauge === 'function') {
    return _TemporalProductivity.renderProductivityGauge(score, tier, null, { document, t });
  }
  const elScore = document.getElementById('valProductivityScore');
  const elBadge = document.getElementById('badgeProductivityTier');
  const circle = document.getElementById('gaugeProgressCircle');
  const clampedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const resolvedTier = tier || (clampedScore >= 80 ? 'focus' : clampedScore >= 60 ? 'balanced' : 'distracted');
  if (elScore) elScore.textContent = String(clampedScore);
  if (elBadge) {
    elBadge.className = `badge-productivity-tier tier-${resolvedTier} ${resolvedTier}`;
    elBadge.textContent = resolvedTier === 'focus' ? t('productivity_badge_focus') : resolvedTier === 'balanced' ? t('productivity_badge_balanced') : t('productivity_badge_distracted');
  }
  if (circle) {
    circle.style.strokeDashoffset = String(238.76 * (1 - clampedScore / 100));
    circle.className = `gauge-progress tier-${resolvedTier}`;
    circle.style.stroke = resolvedTier === 'focus' ? '#10b981' : resolvedTier === 'balanced' ? '#f59e0b' : '#f43f5e';
  }
}

function handleCategoryOverride(domain, newCategory) {
  if (!domain || !newCategory) return;
  const clean = String(domain).toLowerCase().trim();
  if (!domainCategoryOverrides) domainCategoryOverrides = {};
  domainCategoryOverrides[clean] = {
    category: newCategory,
    isCustomOverride: true,
    assignedAt: Date.now()
  };

  const onUpdated = () => {
    if (dashboardData) {
      renderTimeTrackingTab(dashboardData);
    }
  };

  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    browserAPI.storage.local.set({ domain_category_overrides: domainCategoryOverrides }, onUpdated);
  } else {
    onUpdated();
  }
}

function aggregateChronoHeatmap(rawHistory, range) {
  if (_TemporalProductivity && typeof _TemporalProductivity.aggregateChronoHeatmap === 'function') {
    return _TemporalProductivity.aggregateChronoHeatmap(rawHistory, range);
  }
  return [];
}

function renderChronoHeatmap(matrix, mode = 'focus') {
  if (_TemporalProductivity && typeof _TemporalProductivity.renderChronoHeatmap === 'function') {
    return _TemporalProductivity.renderChronoHeatmap(matrix, mode, null, { document, t });
  }
}

function parseYMD(dateStr) {
  if (_TemporalDateFilter && typeof _TemporalDateFilter.parseYMD === 'function') {
    return _TemporalDateFilter.parseYMD(dateStr);
  }
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-').map(n => parseInt(n, 10));
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatYMD(d) {
  if (_TemporalDateFilter && typeof _TemporalDateFilter.formatYMD === 'function') {
    return _TemporalDateFilter.formatYMD(d);
  }
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDatesInRangeFallback(startStr, endStr) {
  if (_TemporalDateFilter && typeof _TemporalDateFilter.getDatesInRangeFallback === 'function') {
    return _TemporalDateFilter.getDatesInRangeFallback(startStr, endStr);
  }
  if (!startStr || !endStr) return [startStr || endStr || ''];
  const curr = parseYMD(startStr);
  const end = parseYMD(endStr);
  if (isNaN(curr.getTime()) || isNaN(end.getTime()) || curr > end) return [startStr];
  const dates = [];
  while (curr <= end) {
    dates.push(formatYMD(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

function getDatesInRange(startStr, endStr) {
  if (_TemporalProductivity && typeof _TemporalProductivity.getDatesInRange === 'function') {
    return _TemporalProductivity.getDatesInRange(startStr, endStr);
  }
  return getDatesInRangeFallback(startStr, endStr);
}

function resolveTemporalDateRange(temporalMode, todayStr, customStart, customEnd) {
  if (_TemporalDateFilter && typeof _TemporalDateFilter.resolveTemporalDateRange === 'function') {
    return _TemporalDateFilter.resolveTemporalDateRange(temporalMode, todayStr, customStart, customEnd, getDatesInRange);
  }
  const validToday = (todayStr && typeof todayStr === 'string') ? todayStr : formatYMD(new Date());
  if (temporalMode === 'today') return [validToday];
  const anchor = parseYMD(validToday);
  let startStr = validToday;
  let endStr = validToday;
  if (temporalMode === 'yesterday') {
    const y = new Date(anchor);
    y.setDate(y.getDate() - 1);
    startStr = formatYMD(y);
    endStr = startStr;
  } else if (temporalMode === '7d') {
    const s = new Date(anchor);
    s.setDate(s.getDate() - 6);
    startStr = formatYMD(s);
    endStr = validToday;
  } else if (temporalMode === '30d') {
    const s = new Date(anchor);
    s.setDate(s.getDate() - 29);
    startStr = formatYMD(s);
    endStr = validToday;
  } else if (temporalMode === 'custom') {
    startStr = customStart || validToday;
    endStr = customEnd || validToday;
  }
  return getDatesInRange(startStr, endStr);
}

function updateProductivityMetrics(items) {
  const list = Array.isArray(items) ? items : [];
  const timeByCategory = {
    work: 0,
    learning: 0,
    entertainment: 0,
    social: 0,
    utility: 0
  };

  let totalActiveTime = 0;
  list.forEach(item => {
    const cat = getDomainCategory(item.domain, domainCategoryOverrides);
    const sec = item.computedSeconds || item.totalSeconds || 0;
    if (timeByCategory[cat] !== undefined) {
      timeByCategory[cat] += sec;
    } else {
      timeByCategory.work += sec;
    }
    totalActiveTime += sec;
  });

  const summary = calculateProductivityScore(timeByCategory, totalActiveTime);
  renderProductivityGauge(summary.score, summary.tier);
  return summary;
}

function updateChronoHeatmap(data) {
  let rawHistory = {};
  if (data && data.activityData && data.activityData.history) {
    rawHistory = data.activityData.history;
  } else if (data && data.activityData && data.activityData.domains) {
    const historyMap = {};
    for (const [dom, dObj] of Object.entries(data.activityData.domains)) {
      if (dObj.days) {
        for (const [dateStr, dayStats] of Object.entries(dObj.days)) {
          if (!historyMap[dateStr]) {
            historyMap[dateStr] = { domains: {}, hourlyBuckets: {} };
          }
          historyMap[dateStr].domains[dom] = {
            activeTime: dayStats.seconds || dayStats.foregroundSeconds || 0,
            mediaTime: dayStats.backgroundMediaSeconds || 0,
            sessions: dayStats.sessions || 1
          };
          if (dayStats.hourlyBuckets) {
            for (const [h, b] of Object.entries(dayStats.hourlyBuckets)) {
              if (!historyMap[dateStr].hourlyBuckets[h]) {
                historyMap[dateStr].hourlyBuckets[h] = { activeTime: 0, mediaTime: 0, sessions: 0, topDomain: dom };
              }
              historyMap[dateStr].hourlyBuckets[h].activeTime += (b.activeTime || 0);
              historyMap[dateStr].hourlyBuckets[h].mediaTime += (b.mediaTime || 0);
              historyMap[dateStr].hourlyBuckets[h].sessions += (b.sessions || 0);
            }
          }
        }
      }
    }
    rawHistory = historyMap;
  } else if (data && typeof data === 'object') {
    rawHistory = data;
  }

  let range = temporalSubtab || '7d';
  if (range === 'custom') {
    range = { mode: 'custom', startDate: customStartDate, endDate: customEndDate };
  } else if (range === 'daily' || range === 'total') {
    range = '7d';
  }

  currentHeatmapMatrix = aggregateChronoHeatmap(rawHistory, range);
  renderChronoHeatmap(currentHeatmapMatrix, currentHeatmapMode);
  return currentHeatmapMatrix;
}

// =============================================================================
// Phase 2: Feature 3 & 4 Facade Functions (Media Deck & Audio Visualizer)
// =============================================================================
let activeMediaStreams = [];

function pollMultiTabMediaStreams(options = {}) {
  const container = (options && options.containerEl) || (typeof document !== 'undefined' ? document.getElementById('mediaDeckGrid') : null);
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null, t, containerEl: container }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.pollMultiTabMediaStreams === 'function') {
    return viz.pollMultiTabMediaStreams(opt).then(streams => {
      activeMediaStreams = streams || [];
      return activeMediaStreams;
    });
  }
  return Promise.resolve(activeMediaStreams);
}

function renderMultiTabMediaDeck(streamsList, containerEl, options = {}) {
  const container = containerEl || (typeof document !== 'undefined' ? document.getElementById('mediaDeckGrid') : null);
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null, t }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.renderMultiTabMediaDeck === 'function') {
    return viz.renderMultiTabMediaDeck(streamsList, container, opt);
  }
}

function handleRemoteMediaCommand(tabId, command, value, options = {}) {
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null, t }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.handleRemoteMediaCommand === 'function') {
    return viz.handleRemoteMediaCommand(tabId, command, value, opt);
  }
  return Promise.resolve({ success: true, tabId, command });
}

function handleSoloTab(soloTabId, options = {}) {
  const container = (options && options.containerEl) || (typeof document !== 'undefined' ? document.getElementById('mediaDeckGrid') : null);
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null, t, containerEl: container }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.handleSoloTab === 'function') {
    return viz.handleSoloTab(soloTabId, opt);
  }
  return Promise.resolve({ success: true, soloTabId });
}

function handleMuteAllOthers(streamsList, primaryTabId = null, options = {}) {
  const container = (options && options.containerEl) || (typeof document !== 'undefined' ? document.getElementById('mediaDeckGrid') : null);
  const btnMuteAllOthers = (options && options.btnMuteAllOthers) || (typeof document !== 'undefined' ? document.getElementById('btnMuteAllOthers') : null);
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null, t, containerEl: container, btnMuteAllOthers }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.handleMuteAllOthers === 'function') {
    return viz.handleMuteAllOthers(streamsList || activeMediaStreams, primaryTabId, opt);
  }
  return Promise.resolve({ success: true, mutedCount: 0 });
}

function resolvePrimaryMediaTabId(streamsList, explicitTabId = null, currentSoloTabId = null) {
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.resolvePrimaryMediaTabId === 'function') {
    return viz.resolvePrimaryMediaTabId(streamsList || activeMediaStreams, explicitTabId, currentSoloTabId);
  }
  return Number(explicitTabId || currentSoloTabId || 0);
}

function handleMuteAll(streamsList, options = {}) {
  const container = (options && options.containerEl) || (typeof document !== 'undefined' ? document.getElementById('mediaDeckGrid') : null);
  const btnMuteAll = (options && options.btnMuteAll) || (typeof document !== 'undefined' ? document.getElementById('btnMuteAll') : null);
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null, t, containerEl: container, btnMuteAll }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.handleMuteAll === 'function') {
    return viz.handleMuteAll(streamsList || activeMediaStreams, opt);
  }
  return Promise.resolve({ success: true, mutedCount: 0 });
}

function initAudioVisualizer(canvasEl, options = {}) {
  const canvas = canvasEl || (typeof document !== 'undefined' ? document.getElementById('canvasAudioVisualizer') : null);
  if (canvas) {
    if (!canvas.width) canvas.width = 600;
    if (!canvas.height || canvas.height <= 120) canvas.height = 220;
  }
  const opt = Object.assign({
    browserAPI,
    doc: typeof document !== 'undefined' ? document : null,
    showToast: typeof showToast === 'function' ? showToast : null,
    t: typeof t === 'function' ? t : null
  }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.initAudioVisualizer === 'function') {
    const res = viz.initAudioVisualizer(canvas, opt);
    const state = viz.getVisualizerState ? viz.getVisualizerState() : null;
    if (state && state.isPlaying) {
      viz.startVisualizerLoop(opt);
    }
    return res;
  }
  return null;
}

function setVisualizerMode(mode, options = {}) {
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null }, options);
  const viz = getResolvedVisualizer();
  let res = mode;
  if (viz && typeof viz.setVisualizerMode === 'function') {
    res = viz.setVisualizerMode(mode, opt);
  }
  const doc = opt.doc;
  if (doc) {
    const selectEffect = doc.getElementById('selectVizEffect');
    if (selectEffect && selectEffect.value !== mode) {
      selectEffect.value = mode;
    }

    const btnBars = doc.getElementById('btnVizModeBars');
    const btnWave = doc.getElementById('btnVizModeWave');
    if (btnBars) {
      if (mode === 'bars') {
        btnBars.classList.add('btn-active');
        btnBars.classList.add('active');
        if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'true');
      } else {
        btnBars.classList.remove('btn-active');
        btnBars.classList.remove('active');
        if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'false');
      }
    }
    if (btnWave) {
      if (mode === 'wave') {
        btnWave.classList.add('btn-active');
        btnWave.classList.add('active');
        if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'true');
      } else {
        btnWave.classList.remove('btn-active');
        btnWave.classList.remove('active');
        if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'false');
      }
    }

    // Synchronize compact pill trigger and popover options
    const VIZ_MODE_META = {
      bars: { icon: '⚡', label: '32-Band FFT' },
      wave: { icon: '🌊', label: 'Oscilloscope' },
      radial: { icon: '✨', label: 'Radial Burst' },
      matrix_dots: { icon: '🟢', label: 'Matrix Dots' },
      flame: { icon: '🔥', label: 'Flame Peaks' },
      stereo_mirror: { icon: '🦋', label: 'Stereo Mirror' },
      lissajous: { icon: '🎛️', label: 'Lissajous Scope' },
      hex_grid: { icon: '⬡', label: 'Hex Grid' },
      particles: { icon: '🌌', label: 'Starfield Warp' },
      retro_grid: { icon: '🕹️', label: 'Synthwave Grid' },
      vinyl_rings: { icon: '💿', label: 'Vinyl Rings' },
      liquid_wave: { icon: '💧', label: 'Liquid Wave' }
    };
    const pillLabel = doc.getElementById('vizPillLabel');
    const pillIcon = doc.getElementById('vizPillIcon');
    if (VIZ_MODE_META[mode]) {
      if (pillLabel) pillLabel.textContent = VIZ_MODE_META[mode].label;
      if (pillIcon) pillIcon.textContent = VIZ_MODE_META[mode].icon;
    }
    const popoverOptions = doc.querySelectorAll ? doc.querySelectorAll('.viz-popover-option') : [];
    if (popoverOptions && popoverOptions.forEach) {
      popoverOptions.forEach(opt => {
        const isSelected = opt.getAttribute && opt.getAttribute('data-effect') === mode;
        if (opt.classList) {
          if (isSelected) {
            opt.classList.add('active');
          } else {
            opt.classList.remove('active');
          }
        }
        if (typeof opt.setAttribute === 'function') {
          opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        }
      });
    }

    const canvasEl = doc.getElementById('canvasAudioVisualizer') || doc.getElementById('mediaDeckVisualizerCanvas');
    if (canvasEl) {
      if (!canvasEl.dataset) canvasEl.dataset = {};
      canvasEl.dataset.mode = mode;
    }
  }

  // Persist preference to chrome.storage.local with localStorage fallback
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ media_sentinel_viz_effect: mode });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('media_sentinel_viz_effect', mode);
    }
  } catch (_) {}

  return res;
}

function renderVisualizerFrame(timestamp, options = {}) {
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.renderVisualizerFrame === 'function') {
    return viz.renderVisualizerFrame(timestamp, opt);
  }
  return { rendered: false };
}

function startVisualizerLoop(options = {}) {
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.startVisualizerLoop === 'function') {
    return viz.startVisualizerLoop(opt);
  }
}

function stopVisualizerLoop() {
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.stopVisualizerLoop === 'function') {
    return viz.stopVisualizerLoop();
  }
}

function setAudioPlayingState(isPlaying, options = {}) {
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null }, options);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.setAudioPlayingState === 'function') {
    return viz.setAudioPlayingState(isPlaying, opt);
  }
}

function getVisualizerState() {
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.getVisualizerState === 'function') {
    return viz.getVisualizerState();
  }
  return null;
}

function isVisualizerFullWindowActive() {
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.isVisualizerFullWindowActive === 'function') {
    return viz.isVisualizerFullWindowActive();
  }
  const card = (typeof document !== 'undefined') ? document.getElementById('heroAudioLabStatus') : null;
  if (!card) return false;
  return Boolean(card.classList && typeof card.classList.contains === 'function' ? card.classList.contains('visualizer-theater-mode') : false);
}

function setVisualizerFullWindowState(active) {
  const isFw = Boolean(active);
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.setVisualizerFullWindowState === 'function') {
    viz.setVisualizerFullWindowState(isFw);
  }
  if (typeof document === 'undefined') return isFw;
  const card = document.getElementById('heroAudioLabStatus');
  const btn = document.getElementById('btnVizFullWindow');

  if (card) {
    if (isFw) {
      card.classList.add('visualizer-theater-mode');
      card.classList.remove('visualizer-fullscreen-mode');
      if (document.body) {
        document.body.classList.add('visualizer-theater-active');
        document.body.classList.remove('visualizer-fullscreen-active');
      }
    } else {
      card.classList.remove('visualizer-theater-mode');
      if (document.body) document.body.classList.remove('visualizer-theater-active');
    }
  }

  if (btn) {
    btn.setAttribute('aria-expanded', isFw ? 'true' : 'false');
    const titleText = isFw
      ? (typeof t === 'function' ? t('viz_fullwindow_exit_title') : 'Exit Visualizer Full Window (Theater)')
      : (typeof t === 'function' ? t('viz_fullwindow_toggle_title') : 'Toggle Visualizer Full Window (Theater)');
    btn.setAttribute('title', titleText);
    btn.setAttribute('aria-label', titleText);
    if (isFw) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      updateVisualizerCanvasResolution();
    });
  } else {
    updateVisualizerCanvasResolution();
  }
  return isFw;
}

function toggleVisualizerFullWindow() {
  const next = !isVisualizerFullWindowActive();
  setVisualizerFullWindowState(next);
  if (typeof showToast === 'function') {
    const msgKey = next ? 'toast_viz_fullwindow_entered' : 'toast_viz_fullwindow_exited';
    showToast(typeof t === 'function' ? t(msgKey) : (next ? 'Visualizer entered Full Window Theater mode' : 'Visualizer exited Full Window mode'));
  }
  return next;
}

function isVisualizerFullscreenActive() {
  const viz = getResolvedVisualizer();
  if (viz && typeof viz.isVisualizerFullscreenActive === 'function') {
    return viz.isVisualizerFullscreenActive();
  }
  const card = (typeof document !== 'undefined') ? document.getElementById('heroAudioLabStatus') : null;
  if (!card) return false;
  const isNative = typeof document !== 'undefined' && Boolean(
    document.fullscreenElement === card ||
    document.webkitFullscreenElement === card ||
    document.mozFullScreenElement === card ||
    document.msFullscreenElement === card ||
    (document.fullscreenElement && card.contains(document.fullscreenElement))
  );
  return isNative || Boolean(card.classList && typeof card.classList.contains === 'function' ? card.classList.contains('visualizer-fullscreen-mode') : false);
}

function updateVisualizerCanvasResolution() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('canvasAudioVisualizer');
  if (!canvas) return;
  const isFullscreen = isVisualizerFullscreenActive() || isVisualizerFullWindowActive();
  const container = canvas.parentElement;
  const rect = (container && typeof container.getBoundingClientRect === 'function') ? container.getBoundingClientRect() : null;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;

  if (isFullscreen) {
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    } else {
      const targetW = typeof window !== 'undefined' ? Math.floor(window.innerWidth * 0.9 * dpr) : 1200;
      const targetH = typeof window !== 'undefined' ? Math.floor((window.innerHeight - 180) * dpr) : 400;
      canvas.width = Math.max(600, targetW);
      canvas.height = Math.max(120, targetH);
    }
  } else {
    // Compact Mode: Auto-adapt to expanded container height
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.max(180, Math.round(rect.height));
    } else {
      canvas.width = 600;
      canvas.height = 220;
    }
  }
}

function syncFullscreenUI(isActive) {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('btnVizFullscreen');
  const card = document.getElementById('heroAudioLabStatus');
  if (btn) {
    btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    const titleText = isActive
      ? (typeof t === 'function' ? t('viz_fullscreen_exit_title') : 'Exit Fullscreen Visualizer')
      : (typeof t === 'function' ? t('viz_fullscreen_toggle_title') : 'Toggle Visualizer Fullscreen');
    btn.setAttribute('title', titleText);
    btn.setAttribute('aria-label', titleText);
    if (isActive) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    const iconExpand = btn.querySelector ? btn.querySelector('.viz-icon-expand') : null;
    const iconCompress = btn.querySelector ? btn.querySelector('.viz-icon-compress') : null;
    if (iconExpand && iconCompress) {
      if (isActive) {
        iconExpand.classList.add('visually-hidden');
        iconCompress.classList.remove('visually-hidden');
      } else {
        iconExpand.classList.remove('visually-hidden');
        iconCompress.classList.add('visually-hidden');
      }
    }
  }

  if (card) {
    if (isActive) {
      card.classList.add('visualizer-fullscreen-mode');
      card.classList.remove('visualizer-theater-mode');
      if (document.body) {
        document.body.classList.add('visualizer-fullscreen-active');
        document.body.classList.remove('visualizer-theater-active');
      }
    } else {
      card.classList.remove('visualizer-fullscreen-mode');
      card.classList.remove('visualizer-theater-mode');
      if (document.body) {
        document.body.classList.remove('visualizer-fullscreen-active');
        document.body.classList.remove('visualizer-theater-active');
      }
      const btnFw = document.getElementById('btnVizFullWindow');
      if (btnFw) {
        btnFw.setAttribute('aria-expanded', 'false');
        btnFw.classList.remove('active');
      }
    }
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      updateVisualizerCanvasResolution();
    });
  } else {
    updateVisualizerCanvasResolution();
  }
}

function setVisualizerFullscreenState(active) {
  if (typeof document === 'undefined') return;
  const card = document.getElementById('heroAudioLabStatus');
  const canvasContainer = document.querySelector('.visualizer-canvas-container') || card;
  if (!card) return;

  const isFs = Boolean(active);
  const currentlyFs = Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );

  const viz = getResolvedVisualizer();
  if (viz && typeof viz.setVisualizerFullscreenState === 'function') {
    viz.setVisualizerFullscreenState(isFs);
  }

  if (isFs) {
    if (!currentlyFs && canvasContainer) {
      if (typeof canvasContainer.requestFullscreen === 'function') {
        try {
          const promise = canvasContainer.requestFullscreen();
          if (promise && typeof promise.then === 'function') {
            promise.catch(() => {
              setVisualizerFullWindowState(true);
            });
          }
        } catch (_) {
          setVisualizerFullWindowState(true);
        }
      } else if (typeof canvasContainer.webkitRequestFullscreen === 'function') {
        try {
          canvasContainer.webkitRequestFullscreen();
        } catch (_) {
          setVisualizerFullWindowState(true);
        }
      } else {
        setVisualizerFullWindowState(true);
      }
    }
    syncFullscreenUI(true);
  } else {
    if (currentlyFs) {
      try {
        if (typeof document.exitFullscreen === 'function') {
          document.exitFullscreen().catch(() => {});
        } else if (typeof document.webkitExitFullscreen === 'function') {
          document.webkitExitFullscreen();
        }
      } catch (_) {}
    }
    syncFullscreenUI(false);
  }
}

function toggleVisualizerFullscreen() {
  const isCurrentlyFs = isVisualizerFullscreenActive();
  const next = !isCurrentlyFs;
  setVisualizerFullscreenState(next);
  if (typeof showToast === 'function') {
    const msgKey = next ? 'toast_viz_fullscreen_entered' : 'toast_viz_fullscreen_exited';
    showToast(typeof t === 'function' ? t(msgKey) : (next ? 'Visualizer entered Fullscreen Theater mode' : 'Visualizer exited Fullscreen mode'));
  }
}

// =============================================================================
// Phase 3: Feature 5 & 6 Facade Functions (Backup, Snapshots, SQLite Hub & Digest)
// =============================================================================

function validateBackupSchemaV2(parsedObj, options) {
  if (_BackupHubDigest && typeof _BackupHubDigest.validateBackupSchemaV2 === 'function') {
    return _BackupHubDigest.validateBackupSchemaV2(parsedObj, options);
  }
  return { valid: false, error: 'BackupHubDigest module unavailable' };
}

function resolveBackupConflict(currentHistory, importedHistory, strategy) {
  if (_BackupHubDigest && typeof _BackupHubDigest.resolveBackupConflict === 'function') {
    return _BackupHubDigest.resolveBackupConflict(currentHistory, importedHistory, strategy);
  }
  return importedHistory || {};
}

function captureDailySnapshot(storageAPI, currentHistory, settings, options) {
  const api = storageAPI || (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null);
  const hist = currentHistory || (dashboardData && dashboardData.activityData) || {};
  const setts = settings || cachedSettings || {};
  if (_BackupHubDigest && typeof _BackupHubDigest.captureDailySnapshot === 'function') {
    return _BackupHubDigest.captureDailySnapshot(api, hist, setts, options);
  }
  return Promise.resolve({ success: false, error: 'BackupHubDigest module unavailable' });
}

function listDailySnapshots(storageAPI) {
  const api = storageAPI || (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null);
  if (_BackupHubDigest && typeof _BackupHubDigest.listDailySnapshots === 'function') {
    return _BackupHubDigest.listDailySnapshots(api);
  }
  return Promise.resolve([]);
}

function rollbackToSnapshot(snapshotKey, storageAPI) {
  const api = storageAPI || (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null);
  if (_BackupHubDigest && typeof _BackupHubDigest.rollbackToSnapshot === 'function') {
    return _BackupHubDigest.rollbackToSnapshot(snapshotKey, api);
  }
  return Promise.reject(new Error('BackupHubDigest module unavailable'));
}

function replicateToSqliteHub(data, options) {
  const hist = data || (dashboardData && dashboardData.activityData) || {};
  if (_BackupHubDigest && typeof _BackupHubDigest.replicateToSqliteHub === 'function') {
    return _BackupHubDigest.replicateToSqliteHub(hist, options);
  }
  return Promise.resolve({ success: false, error: 'BackupHubDigest module unavailable' });
}

function restoreFromSqliteHub(options) {
  if (_BackupHubDigest && typeof _BackupHubDigest.restoreFromSqliteHub === 'function') {
    return _BackupHubDigest.restoreFromSqliteHub(options);
  }
  return Promise.resolve({ success: false, error: 'BackupHubDigest module unavailable' });
}

function triggerPrintPdf(options) {
  const totalTime = (typeof formatHHMMSS === 'function' && dashboardData) ? formatHHMMSS(dashboardData.totalSeconds || 0) : '0h 00m';
  const topDom = (dashboardData && Array.isArray(dashboardData.items) && dashboardData.items[0]) ? dashboardData.items[0].domain : '--';
  const prod = (typeof lastCalculatedProductivityScore !== 'undefined') ? `${lastCalculatedProductivityScore} / 100` : '85 / 100';
  const opts = Object.assign({
    doc: typeof document !== 'undefined' ? document : null,
    win: typeof window !== 'undefined' ? window : null,
    totalTime,
    topDomain: topDom,
    productivity: prod,
    mediaTime: (typeof formatHHMMSS === 'function' && dashboardData) ? formatHHMMSS(dashboardData.totalMediaSeconds || 0) : '0h 00m'
  }, options);

  if (_BackupHubDigest && typeof _BackupHubDigest.triggerPrintPdf === 'function') {
    return _BackupHubDigest.triggerPrintPdf(opts);
  }
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
    return { printed: true };
  }
  return { printed: false, error: 'Print engine unavailable' };
}

function downloadStandaloneHtmlDigest(data, options) {
  const payload = data || {
    tracking_history: (dashboardData && dashboardData.activityData) || {},
    media_history: mediaHistoryData || []
  };
  const opts = Object.assign({
    reportingPeriod: (typeof currentTemporalRange !== 'undefined' && currentTemporalRange) ? `Range: ${currentTemporalRange}` : 'All Recorded Time',
    productivityIndex: (typeof lastCalculatedProductivityScore !== 'undefined') ? lastCalculatedProductivityScore : 85
  }, options);

  if (_BackupHubDigest && typeof _BackupHubDigest.downloadStandaloneHtmlDigest === 'function') {
    return _BackupHubDigest.downloadStandaloneHtmlDigest(payload, opts);
  }
  return { success: false, error: 'Digest engine unavailable' };
}

function handleBackupFileSelection(file, options = {}) {
  if (!file) return;
  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const text = e.target.result;
      const validation = validateBackupSchemaV2(text);
      if (!validation.valid) {
        showToast((currentLang === 'hi') ? `अमान्य बैकअप फ़ाइल: ${validation.error}` : `Invalid backup file: ${validation.error}`, true);
        return;
      }

      const backupObj = validation.data;
      const importedHistory = (backupObj.payload && (backupObj.payload.tracking_history || backupObj.payload.trackingHistory)) || backupObj.trackingHistory || {};
      const currentHistory = (dashboardData && dashboardData.activityData) || {};

      const localDateCount = Object.keys(currentHistory).length;
      if (localDateCount > 0 && doc && doc.getElementById('modalConflictResolution')) {
        _BackupHubDigest.openConflictResolutionModal(validation, {
          onMerge: async () => {
            const merged = resolveBackupConflict(currentHistory, importedHistory, 'merge');
            await persistRestoredData(merged);
            showToast((currentLang === 'hi') ? 'डेटा सफलतापूर्वक मर्ज हो गया!' : 'Backup merged successfully!');
          },
          onOverwrite: async () => {
            const overwritten = resolveBackupConflict(currentHistory, importedHistory, 'overwrite');
            await persistRestoredData(overwritten);
            showToast((currentLang === 'hi') ? 'बैकअप से पूर्ण प्रतिस्थापन सफल!' : 'Restored with complete overwrite!');
          },
          onAppend: async () => {
            const appended = resolveBackupConflict(currentHistory, importedHistory, 'append');
            await persistRestoredData(appended);
            showToast((currentLang === 'hi') ? 'नई तिथियां सफलतापूर्वक जोड़ी गईं!' : 'Appended missing dates successfully!');
          },
          onCancel: () => {
            showToast((currentLang === 'hi') ? 'पुनर्स्थापना रद्द कर दी गई' : 'Restore cancelled');
          }
        }, { doc });
      } else {
        await persistRestoredData(importedHistory);
        showToast((currentLang === 'hi') ? 'बैकअप सफलतापूर्वक पुनर्स्थापित हुआ!' : 'Backup restored successfully!');
      }
    } catch (err) {
      showToast((currentLang === 'hi') ? `त्रुटि: ${err.message}` : `Error parsing backup: ${err.message}`, true);
    }
  };

  reader.readAsText(file);
}

async function persistRestoredData(newHistory) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await new Promise(r => chrome.storage.local.set({
      sentinel_activity_data: newHistory,
      trackingHistory: newHistory
    }, r));
  }
  if (typeof refreshDashboard === 'function') {
    await refreshDashboard(true);
  }
  await populateSnapshotRollbackSelect();
}

async function populateSnapshotRollbackSelect(options = {}) {
  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  if (!doc) return;
  const select = doc.getElementById('selectSnapshotRollback');
  if (!select) return;

  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }

  const defaultOpt = doc.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = (currentLang === 'hi') ? 'स्नैपशॉट चुनें...' : 'Select a snapshot...';
  select.appendChild(defaultOpt);

  try {
    const snapshots = await listDailySnapshots();
    snapshots.forEach(s => {
      const opt = doc.createElement('option');
      opt.value = s.key;
      const fmtTime = (typeof formatHHMMSS === 'function') ? formatHHMMSS(s.totalActiveSeconds) : s.totalActiveSeconds + 's';
      opt.textContent = `${s.date} (${s.domainCount} domains, ${fmtTime})`;
      select.appendChild(opt);
    });
  } catch (_) {}
}

function initBackupAndDigestHandlers() {
  if (typeof document === 'undefined') return;

  // 1. JSON Backup Import via file input & button
  const fileInput = document.getElementById('inputBackupFile');
  const btnImport = document.getElementById('btnImportJsonBackup');
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => {
      fileInput.click();
    });
  }
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleBackupFileSelection(e.target.files[0]);
        fileInput.value = '';
      }
    });
  }

  // 2. Snapshot rollback button
  const btnApplySnapshot = document.getElementById('btnApplySnapshotRollback');
  const selectSnapshot = document.getElementById('selectSnapshotRollback');
  if (btnApplySnapshot && selectSnapshot) {
    btnApplySnapshot.addEventListener('click', async () => {
      const key = selectSnapshot.value;
      if (!key) {
        showToast((currentLang === 'hi') ? 'कृपया पुनर्स्थापना के लिए स्नैपशॉट चुनें' : 'Please select a snapshot to restore', true);
        return;
      }
      try {
        await rollbackToSnapshot(key);
        if (typeof refreshDashboard === 'function') await refreshDashboard(true);
        showToast((currentLang === 'hi') ? 'स्नैपशॉट सफलतापूर्वक पुनर्स्थापित हो गया!' : 'Snapshot restored successfully!');
      } catch (err) {
        showToast((currentLang === 'hi') ? `त्रुटि: ${err.message}` : `Error restoring snapshot: ${err.message}`, true);
      }
    });
  }

  // 3. Quick snapshot buttons (Yesterday & 3 Days Ago)
  const btnYesterday = document.getElementById('btnRollbackYesterday');
  if (btnYesterday) {
    btnYesterday.addEventListener('click', async () => {
      const snaps = await listDailySnapshots();
      if (snaps.length > 0) {
        await rollbackToSnapshot(snaps[0].key);
        if (typeof refreshDashboard === 'function') await refreshDashboard(true);
        showToast((currentLang === 'hi') ? 'कल के स्नैपशॉट पर पुनर्स्थापित!' : 'Rolled back to recent snapshot!');
      } else {
        showToast((currentLang === 'hi') ? 'कोई पूर्व स्नैपशॉट उपलब्ध नहीं है' : 'No prior snapshot available', true);
      }
    });
  }

  const btn3Days = document.getElementById('btnRollback3Days');
  if (btn3Days) {
    btn3Days.addEventListener('click', async () => {
      const snaps = await listDailySnapshots();
      const target = snaps[2] || snaps[snaps.length - 1];
      if (target) {
        await rollbackToSnapshot(target.key);
        if (typeof refreshDashboard === 'function') await refreshDashboard(true);
        showToast((currentLang === 'hi') ? `${target.date} के स्नैपशॉट पर पुनर्स्थापित!` : `Rolled back to ${target.date}!`);
      } else {
        showToast((currentLang === 'hi') ? 'कोई 3-दिवसीय स्नैपशॉट उपलब्ध नहीं है' : 'No 3-day snapshot available', true);
      }
    });
  }

  // 4. SQLite Data Hub replicate and restore buttons
  const btnReplicateHub = document.getElementById('btnReplicateSqliteHub');
  if (btnReplicateHub) {
    btnReplicateHub.addEventListener('click', async () => {
      showToast((currentLang === 'hi') ? 'SQLite Data Hub में डेटा रेप्लिकेट किया जा रहा है...' : 'Replicating data to SQLite Data Hub...');
      const res = await replicateToSqliteHub();
      if (res && res.success) {
        showToast((currentLang === 'hi') ? `सफलतापूर्वक ${res.syncedDates || 0} तिथियां SQLite हब में सिंक हो गईं!` : `Successfully replicated ${res.syncedDates || 0} dates to SQLite Hub!`);
      } else {
        showToast((currentLang === 'hi') ? 'हब ऑफलाइन है या कनेक्ट नहीं हुआ' : 'SQLite Hub is offline or unreachable', true);
      }
    });
  }

  const btnRestoreHub = document.getElementById('btnRestoreFromSqliteHub');
  if (btnRestoreHub) {
    btnRestoreHub.addEventListener('click', async () => {
      showToast((currentLang === 'hi') ? 'SQLite Hub से डेटा पुनर्प्राप्त किया जा रहा है...' : 'Restoring data from SQLite Data Hub...');
      const res = await restoreFromSqliteHub();
      if (res && res.success && res.trackingHistory && Object.keys(res.trackingHistory).length > 0) {
        await persistRestoredData(res.trackingHistory);
        showToast((currentLang === 'hi') ? 'SQLite हब से डेटा सफलतापूर्वक पुनर्स्थापित हो गया!' : 'Successfully restored from SQLite Data Hub!');
      } else {
        showToast((currentLang === 'hi') ? 'हब में कोई डेटा नहीं मिला या हब ऑफलाइन है' : 'No data found in SQLite Hub or Hub is offline', true);
      }
    });
  }

  // 5. Print PDF button
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      triggerPrintPdf();
    });
  }

  // 6. Download Standalone HTML report button
  const btnDownloadDigest = document.getElementById('btnDownloadHtmlDigest');
  const btnDownloadReport = document.getElementById('btnDownloadHtmlReport');
  const handleDownload = () => {
    downloadStandaloneHtmlDigest();
    showToast((currentLang === 'hi') ? 'स्टैंडअलोन HTML रिपोर्ट डाउनलोड हो गई!' : 'Offline HTML report downloaded!');
  };
  if (btnDownloadDigest) btnDownloadDigest.addEventListener('click', handleDownload);
  if (btnDownloadReport) btnDownloadReport.addEventListener('click', handleDownload);

  // Populate snapshots selector initially
  populateSnapshotRollbackSelect();
}

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

// SQLite Data Hub Auto-Reconnect Backoff Ladder (Phase 3 - Defect 12)
let hubReconnectAttempts = 0;
let hubReconnectTimer = null;
const HUB_RETRY_INTERVALS = [1000, 2000, 5000, 10000, 30000];
let cachedSettings = {
  idleThresholdSeconds: 60,
  wsUrl: 'ws://127.0.0.1:65432',
  autoConnectWs: true,
  mediaTrackingEnabled: true,
  notificationsEnabled: true,
  historyRetentionDays: 60,
  theme: 'dark',
  language: 'en',
  // Sleep Timer & Inactivity Subsystem (Phase 1)
  defaultDurationMinutes: 30,
  enableAudioFadeOut: true,
  fadeDurationSeconds: 30,
  enableInactivityAutoSleep: false,
  inactivityThresholdMinutes: 15,
  showBadgeCountdown: true,
  pulseOnCritical: true
};

let domainSearchQuery = '';
let domainSortMode = 'time_desc';

let mediaSearchQuery = '';
let mediaPlatformFilter = 'all';
let mediaSortMode = 'time_desc';

let pendingDangerAction = null; // for modal confirmation
let isDraggingHeroVolume = false;
let lastHeroVolumeDragTime = 0;
let isDraggingHeroProgress = false;
let lastHeroProgressDragTime = 0;

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

function formatHHMMSS(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
}
const formatTimeHHMMSS = formatHHMMSS;

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

function updateSelectOptions(selectId, optionKeyMap) {
  if (typeof document === 'undefined') return;
  const selectEl = document.getElementById(selectId);
  if (!selectEl || !selectEl.options || !optionKeyMap) return;
  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    if (opt && Object.prototype.hasOwnProperty.call(optionKeyMap, opt.value)) {
      opt.textContent = t(optionKeyMap[opt.value]);
    }
  }
}

function applyDashboardLanguage(lang) {
  currentLang = (lang === 'hi') ? 'hi' : 'en';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang;
  }

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
  updateThemeToggleUI(currentTheme);

  // Translate all DOM elements annotated with data-i18n
  if (typeof document !== 'undefined') {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const translated = t(key);
        if (translated && translated !== key) {
          el.textContent = translated;
        }
      }
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const translated = t(key);
        if (translated && translated !== key) {
          el.title = translated;
        }
      }
    });
  }

  // Sidebar navigation
  setTxt('navTrackingText', 'nav_tracking');
  setTxt('navMediaText', 'nav_media');
  setTxt('navWellbeingText', 'nav_wellbeing');
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
  setTxt('lblMetricFocus', 'metric_focus');
  setTxt('lblMetricTopDomain', 'metric_top_domain');
  setTxt('lblMetricTopDomainTime', 'metric_top_sub');
  setTxt('lblMetricActiveDomains', 'metric_active_domains');
  setTxt('subMetricActiveDomains', 'metric_active_domains_sub');
  setTxt('lblMetricDistractionTime', 'metric_distraction_time');
  setTxt('subMetricDistractionTime', 'metric_distraction_sub');
  setTxt('lblMetricPeakHour', 'metric_peak_hour');
  setTxt('subMetricPeakHour', 'metric_peak_hour_sub');
  setTxt('lblMetricLongestSession', 'metric_longest_session');
  setTxt('subMetricLongestSession', 'metric_longest_session_sub');

  setTxt('headingUsageDist', 'heading_usage_dist');
  setTxt('captionUsageDist', 'caption_usage_dist');
  setTxt('subtabTodayText', 'subtab_today');
  setTxt('subtabYesterdayText', 'subtab_yesterday');
  setTxt('subtab7DaysText', 'subtab_7days');
  setTxt('subtab30DaysText', 'subtab_30days');
  setTxt('subtabCustomText', 'subtab_custom');
  setTxt('subtabDailyText', 'subtab_daily');
  setTxt('subtabTotalText', 'subtab_total');
  setTxt('lblProductivityScore', 'productivity_title');
  setTxt('headingChronoHeatmap', 'heatmap_title');
  setTxt('btnHeatmapModeFocus', 'heatmap_mode_focus');
  setTxt('btnHeatmapModeMedia', 'heatmap_mode_media');
  setTxt('lblHeatmapWow', 'heatmap_wow_delta');
  setTxt('headingTopBreakdown', 'top_breakdown');

  setTxt('headingDomainTable', 'domain_table_heading');
  setTitle('btnTimeScrollToTop', 'time_scroll_to_top');
  const timeScrollBtn = document.getElementById('btnTimeScrollToTop');
  if (timeScrollBtn) timeScrollBtn.setAttribute('aria-label', t('time_scroll_to_top'));
  setTxt('lblTableSort', 'sort_by');
  const domSearch = document.getElementById('tableDomainSearch');
  if (domSearch) domSearch.placeholder = t('search_domain_placeholder');

  setTxt('thColDomain', 'th_domain');
  setTxt('thColCategory', 'th_category');
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
  setTxt('lblMediaTotalWatch', 'media_metric_total_watch');
  setTxt('subMediaTotalWatch', 'media_sub_total_watch');
  setTxt('lblMediaAvgWatch', 'media_metric_avg_watch');
  setTxt('subMediaAvgWatch', 'media_sub_avg_watch');
  setTxt('lblMediaSessions', 'media_metric_sessions');
  setTxt('subMediaSessions', 'media_sub_sessions');
  setTxt('lblMediaTopPlatform', 'media_metric_top_platform');
  setTxt('subMediaTopPlatform', 'media_sub_top_platform');
  setTxt('lblMediaActiveStreams', 'media_metric_active_streams');
  setTxt('subMediaActiveStreams', 'media_sub_active_streams');
  setTxt('lblMediaAvgVolume', 'media_metric_avg_volume');
  setTxt('subMediaAvgVolume', 'media_sub_avg_volume');
  setTxt('lblMediaPeakVolume', 'media_metric_peak_volume');
  setTxt('subMediaPeakVolume', 'media_sub_peak_volume');
  setTxt('lblMediaLowVolume', 'media_metric_low_volume');
  setTxt('subMediaLowVolume', 'media_sub_low_volume');
  setTxt('lblMediaMutedSessions', 'media_metric_muted_sessions');
  setTxt('subMediaMutedSessions', 'media_sub_muted_sessions');
  setTxt('lblMediaLongestSession', 'media_metric_longest_session');
  setTxt('subMediaLongestSession', 'media_sub_longest_session');

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
  setTitle('btnMediaScrollToTop', 'media_scroll_to_top');
  const scrollBtn = document.getElementById('btnMediaScrollToTop');
  if (scrollBtn) scrollBtn.setAttribute('aria-label', t('media_scroll_to_top'));
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

  // Audio Lab & DSP Telemetry widget
  setTxt('audioLabTitle', 'audiolab_title');
  setTxt('lblAudioMasterBoost', 'audiolab_master_boost');
  setTxt('audioLabStatusText', 'audiolab_dsp_active');
  setTxt('lblAudioEqTitle', 'audiolab_eq_title');
  setTxt('btnResetEq', 'audiolab_reset_eq');
  setTxt('lblAudioVocalTitle', 'audiolab_vocal_title');
  setTxt('lblAudioVocalDesc', 'audiolab_vocal_desc');
  setTxt('lblAudioNightTitle', 'audiolab_night_title');
  setTxt('lblAudioNightDesc', 'audiolab_night_desc');
  setTxt('lblAudioBassTitle', 'audiolab_bass_title');
  setTxt('lblAudioBassDesc', 'audiolab_bass_desc');
  setTxt('lblAudioOnlyTitle', 'audiolab_audio_only_title');
  setTxt('lblAudioOnlyDesc', 'audiolab_audio_only_desc');

  updateSelectOptions('audioEqPresetSelect', {
    flat: 'eq_preset_flat',
    bass_boost: 'eq_preset_bass_boost',
    vocal_enhancer: 'eq_preset_vocal_enhancer',
    treble_boost: 'eq_preset_treble_boost',
    electronic: 'eq_preset_electronic',
    rock: 'eq_preset_rock',
    acoustic: 'eq_preset_acoustic',
    night_mode: 'eq_preset_night_mode',
    custom: 'eq_preset_custom'
  });

  setTxt('lblVizEffect', 'visualizer_effect_label');
  updateSelectOptions('selectVizEffect', {
    bars: 'viz_effect_bars',
    wave: 'viz_effect_wave',
    radial: 'viz_effect_radial',
    matrix_dots: 'viz_effect_matrix',
    flame: 'viz_effect_flame',
    stereo_mirror: 'viz_effect_stereo',
    lissajous: 'viz_effect_lissajous',
    hex_grid: 'viz_effect_hex_grid',
    particles: 'viz_effect_particles',
    retro_grid: 'viz_effect_retro_grid',
    vinyl_rings: 'viz_effect_vinyl_rings',
    liquid_wave: 'viz_effect_liquid_wave'
  });

  const btnSettingsToggle = document.getElementById('btnVizSettingsToggle');
  if (btnSettingsToggle) {
    const sTitle = t('viz_settings_toggle_title');
    btnSettingsToggle.setAttribute('title', sTitle);
    btnSettingsToggle.setAttribute('aria-label', sTitle);
  }

  const btnVideoToggle = document.getElementById('btnVizVideoEmbedToggle');
  if (btnVideoToggle) {
    btnVideoToggle.setAttribute('title', t('viz_video_embed_toggle_title'));
    btnVideoToggle.setAttribute('aria-label', t('viz_video_embed_toggle_title'));
  }

  const btnFullWindow = document.getElementById('btnVizFullWindow');
  if (btnFullWindow) {
    const isFw = isVisualizerFullWindowActive();
    const fwKey = isFw ? 'viz_fullwindow_exit_title' : 'viz_fullwindow_toggle_title';
    btnFullWindow.setAttribute('title', t(fwKey));
    btnFullWindow.setAttribute('aria-label', t(fwKey));
  }

  const btnFullscreen = document.getElementById('btnVizFullscreen');
  if (btnFullscreen) {
    const isFs = isVisualizerFullscreenActive();
    const fsKey = isFs ? 'viz_fullscreen_exit_title' : 'viz_fullscreen_toggle_title';
    btnFullscreen.setAttribute('title', t(fsKey));
    btnFullscreen.setAttribute('aria-label', t(fsKey));
  }

  updateDashboardAudioLabUI(dashboardAudioLabSettings);

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

  // Sleep Timer & Inactivity Sentinel static texts
  setTxt('headingSleepSettings', 'heading_sleep_settings');
  setTxt('subSleepSettings', 'sub_sleep_settings');
  setTxt('lblDefaultSleepDuration', 'lbl_default_sleep');
  setTxt('descDefaultSleepDuration', 'desc_default_sleep');
  setTxt('lblSleepFadeToggle', 'lbl_sleep_fade');
  setTxt('descSleepFadeToggle', 'desc_sleep_fade');
  setTxt('lblFadeDuration', 'lbl_fade_duration');
  setTxt('descFadeDuration', 'desc_fade_duration');
  setTxt('lblInactivitySleepToggle', 'lbl_inactivity_sleep');
  setTxt('descInactivitySleepToggle', 'desc_inactivity_sleep');
  setTxt('lblInactivityThreshold', 'lbl_inactivity_threshold');
  setTxt('descInactivityThreshold', 'desc_inactivity_threshold');
  setTxt('lblBadgeCountdownToggle', 'lbl_badge_countdown');
  setTxt('descBadgeCountdownToggle', 'desc_badge_countdown');
  setTxt('btnSaveSleepSettings', 'btn_save_sleep');

  // Dynamic select option localization (preserving select values)
  updateSelectOptions('settingDefaultSleepDuration', {
    '15': 'opt_sleep_15m',
    '30': 'opt_sleep_30m',
    '45': 'opt_sleep_45m',
    '60': 'opt_sleep_60m',
    '90': 'opt_sleep_90m'
  });

  updateSelectOptions('settingFadeDuration', {
    '15': 'opt_fade_15s',
    '30': 'opt_fade_30s',
    '60': 'opt_fade_60s'
  });

  updateSelectOptions('settingInactivityThreshold', {
    '10': 'opt_inact_10m',
    '15': 'opt_inact_15m',
    '30': 'opt_inact_30m',
    '60': 'opt_inact_60m'
  });

  updateSelectOptions('selectDashSleepTimeoutAction', {
    'pause': 'opt_timeout_pause',
    'mute': 'opt_timeout_mute',
    'close_tab': 'opt_timeout_close'
  });

  updateSelectOptions('tableSortSelect', {
    'time_desc': 'sort_time_desc',
    'time_asc': 'sort_time_asc',
    'sessions_desc': 'sort_sessions_desc',
    'name_asc': 'sort_name_asc'
  });

  updateSelectOptions('tableMediaSortSelect', {
    'time_desc': 'sort_latest',
    'duration_desc': 'sort_longest',
    'vol_desc': 'sort_highest_vol',
    'title_asc': 'sort_title_az'
  });

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

  // Phase 2: Omni Command Palette & Hotkeys Cheat Sheet
  setTxt('hotkeysModalTitle', 'hotkeys_title');
  const paletteInput = document.getElementById('omniPaletteSearchInput');
  if (paletteInput) paletteInput.placeholder = t('cmd_placeholder');
  if (typeof isHotkeysModalOpen === 'function' && isHotkeysModalOpen()) {
    renderHotkeysList();
  }

  // Phase 4: Appearance, Theme Substrates & Audio Haptics static texts
  // Phase 4: Feature 7 & 8 Texts
  setTxt('txtBlacklistTitle', 'blacklist_title');
  setTxt('txtBlacklistDesc', 'blacklist_desc');
  setTxt('txtStarredTitle', 'txt_starred_title');
  setTxt('txtStarredDesc', 'txt_starred_desc');
  setTxt('btnPurgeDomainHistory', 'btn_purge_domain');
  setTxt('btnAddBlacklistPattern', 'btn_add_pattern');
  const blacklistPatternInput = document.getElementById('inputBlacklistPattern');
  if (blacklistPatternInput) blacklistPatternInput.placeholder = 'e.g. localhost:*, 192.168.*:*, *bank.internal*';

  setTxt('txtBudgetTitle', 'budget_title');
  setTxt('txtBudgetDesc', 'budget_desc');
  setTxt('btnAddBudget', 'btn_set_budget');

  setTxt('txtPomodoroTitle', 'pomodoro_title');
  setTxt('txtSleepSentinelTitle', 'sleep_sentinel_title');
  setTxt('txtSleepSentinelDesc', 'sleep_sentinel_desc');
  setTxt('txtFocusAdvancedTitle', 'focus_advanced_title');
  setTxt('txtFocusAdvancedDesc', 'focus_advanced_desc');
  setTxt('txtSleepAdvancedTitle', 'sleep_advanced_title');
  setTxt('txtSleepAdvancedDesc', 'sleep_advanced_desc');
  setTxt('txtNoteModalTitle', 'modal_note_title');
  setTxt('txtNoteModalDesc', 'modal_note_desc');
  setTxt('btnSaveDomainNote', 'btn_save_note');
  const noteTextInput = document.getElementById('inputDomainNoteText');
  if (noteTextInput) noteTextInput.placeholder = t('notes_placeholder');

  if (pomodoroController) {
    const pState = pomodoroController.getState();
    const modeBadge = document.getElementById('pomodoroModeBadge');
    if (modeBadge) {
      modeBadge.textContent = pState.mode === 'focus' ? t('pomodoro_focus_badge') : t('pomodoro_break_badge');
    }
  }

  setTxt('headingAppearanceSettings', 'heading_appearance_settings');
  setTxt('subAppearanceSettings', 'sub_appearance_settings');
  setTxt('lblThemeSubstrate', 'lbl_theme_substrate');
  setTxt('descThemeSubstrate', 'desc_theme_substrate');
  setTxt('txtThemeMidnightOled', 'theme_midnight_oled');
  setTxt('txtThemeSlateNavy', 'theme_slate_navy');
  setTxt('txtThemeNordicPine', 'theme_nordic_pine');
  setTxt('txtThemeStudioLight', 'theme_clean_light');
  setTxt('lblAccentPalette', 'lbl_accent_palette');
  setTxt('descAccentPalette', 'desc_accent_palette');
  setTxt('lblAudioHaptics', 'setting_audio_haptics');
  setTxt('descAudioHaptics', 'desc_audio_haptics');
  setTxt('lblAudioVolume', 'lbl_audio_volume');
  setTxt('descAudioVolume', 'desc_audio_volume');
  setTxt('btnTestAudioHaptics', 'btn_test_audio_haptics');

  const swatchEmerald = document.getElementById('accentSwatchEmerald');
  if (swatchEmerald) swatchEmerald.title = t('accent_emerald');
  const swatchCyan = document.getElementById('accentSwatchCyan');
  if (swatchCyan) swatchCyan.title = t('accent_cyan');
  const swatchViolet = document.getElementById('accentSwatchViolet');
  if (swatchViolet) swatchViolet.title = t('accent_violet');
  const swatchRose = document.getElementById('accentSwatchRose');
  if (swatchRose) swatchRose.title = t('accent_rose');
  const swatchAmber = document.getElementById('accentSwatchAmber');
  if (swatchAmber) swatchAmber.title = t('accent_amber');

  // Local Services & Hardware Bridges Card
  setTxt('headingHardwareBridges', 'hardware_bridges_title');
  setTxt('subHardwareBridges', 'hardware_bridges_sub');
  setTxt('nameBridgeHub', 'bridge_hub_name');
  setTxt('portBridgeHub', 'bridge_hub_port');
  setTxt('descBridgeHub', 'bridge_hub_desc');
  setTxt('nameBridgeHud', 'bridge_hud_name');
  setTxt('portBridgeHud', 'bridge_hud_port');
  setTxt('descBridgeHud', 'bridge_hud_desc');

  const hasClass = (el, cls) => el && ((el.classList && typeof el.classList.contains === 'function' && el.classList.contains(cls)) || (typeof el.className === 'string' && el.className.includes(cls)));
  const bridgeHubBadge = document.getElementById('bridgeHubStatusBadge');
  const bridgeHubText = document.getElementById('bridgeHubStatusText');
  if (bridgeHubBadge && bridgeHubText) {
    if (hasClass(bridgeHubBadge, 'online')) {
      bridgeHubText.textContent = t('bridge_status_online');
    } else if (hasClass(bridgeHubBadge, 'starting')) {
      bridgeHubText.textContent = t('bridge_status_starting');
    } else {
      bridgeHubText.textContent = t('bridge_status_offline');
    }
  }

  const bridgeHudBadge = document.getElementById('bridgeHudStatusBadge');
  const bridgeHudText = document.getElementById('bridgeHudStatusText');
  if (bridgeHudBadge && bridgeHudText) {
    if (hasClass(bridgeHudBadge, 'online')) {
      bridgeHudText.textContent = t('bridge_status_online');
    } else if (hasClass(bridgeHudBadge, 'starting')) {
      bridgeHudText.textContent = t('bridge_status_starting');
    } else {
      bridgeHudText.textContent = t('bridge_status_offline');
    }
  }

  const btnReconnectHubEl = document.getElementById('btnSidebarReconnectHub');
  if (btnReconnectHubEl) {
    const lbl = typeof btnReconnectHubEl.querySelector === 'function' ? btnReconnectHubEl.querySelector('.btn-bridge-label') : null;
    const icon = typeof btnReconnectHubEl.querySelector === 'function' ? btnReconnectHubEl.querySelector('.btn-bridge-icon') : null;
    if (lbl) {
      if (hubConnectInProgress) {
        lbl.textContent = t('btn_connecting');
        if (icon) icon.textContent = '⏳';
      } else if (dataHubConnected) {
        lbl.textContent = t('btn_hub_connected');
        if (icon) icon.textContent = '✅';
      } else {
        lbl.textContent = t('btn_reconnect_hub');
        if (icon) icon.textContent = '⚡';
      }
    } else {
      btnReconnectHubEl.textContent = hubConnectInProgress ? t('btn_connecting') : (dataHubConnected ? t('btn_hub_connected') : t('btn_reconnect_hub'));
    }
  }

  const btnReconnectHudEl = document.getElementById('btnSidebarReconnect');
  if (btnReconnectHudEl) {
    const lbl = typeof btnReconnectHudEl.querySelector === 'function' ? btnReconnectHudEl.querySelector('.btn-bridge-label') : null;
    const icon = typeof btnReconnectHudEl.querySelector === 'function' ? btnReconnectHudEl.querySelector('.btn-bridge-icon') : null;
    if (lbl) {
      if (hudLaunchInProgress) {
        lbl.textContent = t('btn_connecting');
        if (icon) icon.textContent = '⏳';
      } else if (dashboardData && dashboardData.wsConnected) {
        lbl.textContent = t('btn_hud_connected');
        if (icon) icon.textContent = '✅';
      } else {
        lbl.textContent = t('btn_reconnect_hud');
        if (icon) icon.textContent = '⚡';
      }
    } else {
      btnReconnectHudEl.textContent = hudLaunchInProgress ? t('btn_connecting') : ((dashboardData && dashboardData.wsConnected) ? t('btn_hud_connected') : t('btn_reconnect_hud'));
    }
  }

  // Re-render active views
  if (dashboardData) {
    updateHUDStatus(Boolean(dashboardData.wsConnected));
    renderTimeTrackingTab(dashboardData);
    renderMediaAnalyticsTab(dashboardData);
  }
}


// =============================================================================
// Feature 7 & 8: Wellbeing Sentinel, Annotations, Budgets & Blacklist
// =============================================================================

let starredDomains = [];
let domainAnnotations = {};
let trackingBlacklist = [];
let domainBudgets = {};
let pomodoroController = null;
let activeEditingDomainNote = null;


function renderStarredDomainsQuickList() {
  const container = document.getElementById('starredDomainsQuickList');
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  if (!starredDomains || starredDomains.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.className = 'empty-subtext';
    emptyP.style.cssText = 'color: var(--text-muted); font-size: 13px; font-style: italic; padding: 8px 0;';
    emptyP.textContent = 'No domains pinned yet. Click the star icon ⭐ next to any domain in the table to pin it here.';
    container.appendChild(emptyP);
    return;
  }
  starredDomains.forEach(domain => {
    const chip = document.createElement('div');
    chip.className = 'starred-domain-pill';
    const star = document.createElement('span');
    star.textContent = '⭐ ';
    const name = document.createElement('span');
    name.className = 'starred-domain-name';
    name.textContent = domain;
    chip.appendChild(star);
    chip.appendChild(name);
    const note = domainAnnotations && domainAnnotations[domain.toLowerCase()];
    if (note) {
      const noteBadge = document.createElement('span');
      noteBadge.className = 'starred-domain-note';
      noteBadge.textContent = ' 📝 ' + note;
      chip.appendChild(noteBadge);
    }
    const unstarBtn = document.createElement('button');
    unstarBtn.type = 'button';
    unstarBtn.className = 'btn-unstar-pill';
    unstarBtn.textContent = '✕';
    unstarBtn.title = 'Unpin ' + domain;
    unstarBtn.addEventListener('click', () => {
      toggleDomainPin(domain);
      renderStarredDomainsQuickList();
    });
    chip.appendChild(unstarBtn);
    container.appendChild(chip);
  });
}

function isDomainPinned(domain) {
  if (!domain || !Array.isArray(starredDomains)) return false;
  return starredDomains.includes(String(domain).trim().toLowerCase());
}

async function toggleDomainPin(domain) {
  if (!domain) return;
  const domLower = String(domain).trim().toLowerCase();
  const idx = starredDomains.indexOf(domLower);
  if (idx >= 0) {
    starredDomains.splice(idx, 1);
  } else {
    starredDomains.push(domLower);
  }
  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    await browserAPI.storage.local.set({ starred_domains: starredDomains });
  }
  if (dashboardData && dashboardData.domains) {
    renderTimeTrackingTab(dashboardData);
  }
}

function openDomainNoteModal(domain) {
  if (!domain) return;
  activeEditingDomainNote = domain;
  const modal = document.getElementById('modalDomainNote');
  const nameEl = document.getElementById('noteDomainName');
  const inputEl = document.getElementById('inputDomainNoteText');
  if (nameEl) nameEl.textContent = domain;
  if (inputEl) {
    const existing = (domainAnnotations && domainAnnotations[domain.toLowerCase()]) || '';
    inputEl.value = existing;
  }
  if (modal) modal.classList.remove('hidden');
}

function closeDomainNoteModal() {
  const modal = document.getElementById('modalDomainNote');
  if (modal) modal.classList.add('hidden');
  activeEditingDomainNote = null;
}

async function saveDomainNote(domain, noteText) {
  if (!domain) return;
  const domLower = String(domain).trim().toLowerCase();
  const cleanNote = typeof noteText === 'string' ? noteText.trim() : '';
  if (cleanNote) {
    domainAnnotations[domLower] = cleanNote;
  } else {
    delete domainAnnotations[domLower];
  }
  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    await browserAPI.storage.local.set({ domain_annotations: domainAnnotations });
  }
  closeDomainNoteModal();
  if (dashboardData && dashboardData.domains) {
    renderTimeTrackingTab(dashboardData);
  }
}

function renderBlacklistChips() {
  const container = document.getElementById('blacklistChipsContainer');
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  trackingBlacklist.forEach(pattern => {
    const chip = document.createElement('div');
    chip.className = 'blacklist-chip';
    chip.setAttribute('data-pattern', pattern);

    const txt = document.createElement('span');
    txt.className = 'chip-text';
    txt.textContent = pattern;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-remove-chip';
    btn.setAttribute('aria-label', 'Remove ' + pattern);
    btn.textContent = '✕';
    btn.addEventListener('click', () => {
      removeBlacklistPattern(pattern);
    });

    chip.appendChild(txt);
    chip.appendChild(btn);
    container.appendChild(chip);
  });
}

async function addBlacklistPattern(pattern) {
  if (!pattern || typeof pattern !== 'string') return;
  const clean = pattern.trim().toLowerCase();
  if (!clean || clean.length > 128) return;
  if (!trackingBlacklist.includes(clean)) {
    trackingBlacklist.push(clean);
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      await browserAPI.storage.local.set({ tracking_blacklist: trackingBlacklist });
    }
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
      browserAPI.runtime.sendMessage({ action: 'UPDATE_TRACKING_BLACKLIST', blacklist: trackingBlacklist }).catch(() => {});
    }
    renderBlacklistChips();
  }
}

async function removeBlacklistPattern(pattern) {
  if (!pattern) return;
  const clean = pattern.trim().toLowerCase();
  trackingBlacklist = trackingBlacklist.filter(p => p !== clean);
  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    await browserAPI.storage.local.set({ tracking_blacklist: trackingBlacklist });
  }
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    browserAPI.runtime.sendMessage({ action: 'UPDATE_TRACKING_BLACKLIST', blacklist: trackingBlacklist }).catch(() => {});
  }
  renderBlacklistChips();
}

async function purgeDomainData(targetDomain) {
  if (!targetDomain) return;
  const clean = String(targetDomain).trim().toLowerCase();
  if (!clean) return;

  if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    try {
      const resp = await browserAPI.runtime.sendMessage({ action: 'PURGE_DOMAIN_HISTORY', domain: clean });
      if (resp && resp.success) {
        if (dashboardData && dashboardData.domains) {
          delete dashboardData.domains[clean];
          Object.keys(dashboardData.domains).forEach(dom => {
            if (dom.toLowerCase() === clean) delete dashboardData.domains[dom];
          });
        }
        await refreshDashboard(false);
        showToast(currentLang === 'hi' ? `${clean} का इतिहास मिटा दिया गया` : `Historical records purged for ${clean}`, false);
        return resp;
      }
    } catch (_) {}
  }
}

function renderDomainBudgetsList() {
  const container = document.getElementById('domainBudgetsList');
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const entries = Object.entries(domainBudgets);
  entries.forEach(([dom, mins]) => {
    let currentSec = 0;
    if (dashboardData && dashboardData.domains && dashboardData.domains[dom]) {
      currentSec = dashboardData.domains[dom].totalSeconds || 0;
    }
    const status = _WellbeingBlacklist ? _WellbeingBlacklist.checkDomainBudgetStatus(currentSec, mins) : { percent: Math.round((currentSec / (mins * 60)) * 100), reached: (currentSec >= mins * 60), warning80: (currentSec >= mins * 60 * 0.8) };

    const row = document.createElement('div');
    row.className = 'budget-item-row';
    row.setAttribute('data-domain', dom);

    const info = document.createElement('div');
    info.className = 'budget-item-info';

    const dName = document.createElement('span');
    dName.className = 'budget-domain-name';
    dName.textContent = dom;

    const bLimit = document.createElement('span');
    bLimit.className = 'budget-domain-limit';
    bLimit.textContent = `Limit: ${mins}m / Spent: ${Math.floor(currentSec / 60)}m (${status.percent}%)`;

    info.appendChild(dName);
    info.appendChild(bLimit);

    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'budget-badge-container';

    if (status.reached) {
      const reachedBadge = document.createElement('span');
      reachedBadge.className = 'badge-budget-reached';
      reachedBadge.textContent = '🛑 Limit Reached';
      badgeContainer.appendChild(reachedBadge);
    } else if (status.warning80) {
      const warnBadge = document.createElement('span');
      warnBadge.className = 'badge-budget-warning';
      warnBadge.textContent = '⚠️ 80% Limit';
      badgeContainer.appendChild(warnBadge);
    }

    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn-remove-budget';
    btnDel.setAttribute('aria-label', 'Remove budget for ' + dom);
    btnDel.textContent = '🗑️';
    btnDel.addEventListener('click', () => {
      removeDomainBudget(dom);
    });
    badgeContainer.appendChild(btnDel);

    row.appendChild(info);
    row.appendChild(badgeContainer);
    container.appendChild(row);
  });
}

async function setDomainBudget(domain, minutes) {
  if (!domain) return;
  const clean = String(domain).trim().toLowerCase();
  const mins = Number(minutes);
  if (isNaN(mins) || mins <= 0) return;
  domainBudgets[clean] = Math.round(mins);
  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    await browserAPI.storage.local.set({ domain_budgets: domainBudgets });
  }
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    browserAPI.runtime.sendMessage({ action: 'UPDATE_DOMAIN_BUDGETS', budgets: domainBudgets }).catch(() => {});
  }
  renderDomainBudgetsList();
  if (dashboardData && dashboardData.domains) {
    renderTimeTrackingTab(dashboardData);
  }
}

async function removeDomainBudget(domain) {
  if (!domain) return;
  const clean = String(domain).trim().toLowerCase();
  delete domainBudgets[clean];
  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    await browserAPI.storage.local.set({ domain_budgets: domainBudgets });
  }
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    browserAPI.runtime.sendMessage({ action: 'UPDATE_DOMAIN_BUDGETS', budgets: domainBudgets }).catch(() => {});
  }
  renderDomainBudgetsList();
  if (dashboardData && dashboardData.domains) {
    renderTimeTrackingTab(dashboardData);
  }
}

function updateFocusRadialDial(remainingSec, totalSec, mode, status) {
  const dialProgressEl = document.getElementById('dashFocusDialProgress');
  if (!dialProgressEl) return;
  const CIRCUMFERENCE = 339.292;
  const ratio = (totalSec && totalSec > 0) ? (remainingSec / totalSec) : 0;
  const offset = CIRCUMFERENCE * (1 - ratio);
  dialProgressEl.style.strokeDashoffset = Math.max(0, Math.min(CIRCUMFERENCE, offset)).toFixed(3);

  dialProgressEl.classList.remove('tier-focus', 'tier-break', 'tier-paused');
  if (status === 'paused') {
    dialProgressEl.classList.add('tier-paused');
  } else if (mode === 'break') {
    dialProgressEl.classList.add('tier-break');
  } else {
    dialProgressEl.classList.add('tier-focus');
  }
}

function updateFocusFinishTime(remainingSec, status) {
  const finishEl = document.getElementById('pomodoroFinishTime');
  if (!finishEl) return;
  if (status === 'running' && remainingSec > 0) {
    const targetDate = new Date(Date.now() + remainingSec * 1000);
    const timeStr = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    finishEl.textContent = `Target: ${timeStr}`;
  } else if (status === 'paused') {
    finishEl.textContent = 'Paused';
  } else {
    finishEl.textContent = 'Target: --:--';
  }
}

// =============================================================================
// Focus Audio Synthesizer: Soundscapes & Acoustic Chimes (Web Audio API)
// Zero external assets, 100% synthesized in real time
// =============================================================================
const ZEN_FOCUS_QUOTES = [
  "\"Focus is a muscle. The more you practice, the deeper you go.\"",
  "\"Simplicity is prerequisite for reliability.\"",
  "\"Deep work is the ability to focus without distraction on a cognitively demanding task.\"",
  "\"Starve your distractions, feed your focus.\"",
  "\"One hour of deep focus creates more value than a day of fractured attention.\"",
  "\"Flow is the state in which people are so involved in an activity that nothing else seems to matter.\""
];

let focusAudioCtx = null;
let activeSoundscapeNodes = null;
let soundscapeGainNode = null;
let isSoundscapePlaying = false;
let currentPomodoroCycle = 1;
let focusCompletedMinutesToday = 45;
const FOCUS_TARGET_MINUTES_GOAL = 180;

function getFocusAudioContext() {
  if (!focusAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      focusAudioCtx = new AudioCtx();
    }
  }
  if (focusAudioCtx && focusAudioCtx.state === 'suspended') {
    focusAudioCtx.resume().catch(() => {});
  }
  return focusAudioCtx;
}

function stopActiveSoundscape() {
  if (activeSoundscapeNodes) {
    try {
      activeSoundscapeNodes.forEach(node => {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      });
    } catch (_) {}
    activeSoundscapeNodes = null;
  }
  isSoundscapePlaying = false;
  const toggleBtn = document.getElementById('btnToggleSoundscape');
  if (toggleBtn) toggleBtn.textContent = '▶';
}

function createNoiseBuffer(ctx, seconds = 5) {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// =============================================================================
// Focus & Sleep Advanced Suite Facade Functions (Universal Rule 28 Compliant)
// =============================================================================

function initFocusAdvancedState() {
  if (typeof FocusAdvancedSuite !== 'undefined' && FocusAdvancedSuite.initFocusAdvancedState) {
    FocusAdvancedSuite.initFocusAdvancedState();
    FocusAdvancedSuite.bindFocusAdvancedEventListeners();
    return;
  }
  const toggleIntegrity = document.getElementById('toggleFocusIntegrityScore');
  const toggleAutoMute = document.getElementById('toggleFocusAutoMuteBg');
  const toggleBreathe = document.getElementById('toggleFocusBreatheNudge');
  const toggle2020 = document.getElementById('toggleFocus2020Alert');
  if (toggleIntegrity) toggleIntegrity.checked = localStorage.getItem('sentinel_focus_adv_integrity') === 'true';
  if (toggleAutoMute) toggleAutoMute.checked = localStorage.getItem('sentinel_focus_adv_automute_bg') === 'true';
  if (toggleBreathe) toggleBreathe.checked = localStorage.getItem('sentinel_focus_adv_breathe_nudge') === 'true';
  if (toggle2020) toggle2020.checked = localStorage.getItem('sentinel_focus_adv_posture_alert') === 'true';
  const selectSoundscape = document.getElementById('selectFocusSoundscape');
  if (selectSoundscape && !selectSoundscape.value) {
    selectSoundscape.value = localStorage.getItem('sentinel_focus_soundscape') || 'none';
  }
}

function initSleepAdvancedState() {
  if (typeof SleepAdvancedSuite !== 'undefined' && SleepAdvancedSuite.initSleepAdvancedState) {
    SleepAdvancedSuite.initSleepAdvancedState();
    SleepAdvancedSuite.bindSleepAdvancedEventListeners();
    return;
  }
  const toggleAutoplay = document.getElementById('toggleSleepAutoplayBlock');
  const toggleInactivity = document.getElementById('toggleSleepInactivityFastCutoff');
  const toggleDimmer = document.getElementById('toggleSleepScreenDimmer');
  const toggleHibernate = document.getElementById('toggleSleepTabHibernate');
  if (toggleAutoplay) toggleAutoplay.checked = localStorage.getItem('sentinel_sleep_adv_autoplay_block') === 'true';
  if (toggleInactivity) toggleInactivity.checked = localStorage.getItem('sentinel_sleep_adv_inactivity_cutoff') === 'true';
  if (toggleDimmer) toggleDimmer.checked = localStorage.getItem('sentinel_sleep_adv_screen_dimmer') === 'true';
  if (toggleHibernate) toggleHibernate.checked = localStorage.getItem('sentinel_sleep_adv_tab_hibernate') === 'true';
  const selectSleepSound = document.getElementById('selectSleepAidSoundscape');
  if (selectSleepSound) selectSleepSound.value = localStorage.getItem('sentinel_sleep_adv_soundscape') || 'none';
}

function createBinauralBeatNodes(ctx, carrier, beatFreq, gainNode) {
  if (typeof FocusAdvancedSuite !== 'undefined' && FocusAdvancedSuite.createBinauralBeatNodes) {
    return FocusAdvancedSuite.createBinauralBeatNodes(ctx, carrier, beatFreq, gainNode);
  }
  const oscL = ctx.createOscillator();
  const oscR = ctx.createOscillator();
  oscL.type = 'sine';
  oscR.type = 'sine';
  oscL.frequency.setValueAtTime(carrier, ctx.currentTime);
  oscR.frequency.setValueAtTime(carrier + beatFreq, ctx.currentTime);
  const merger = ctx.createChannelMerger(2);
  oscL.connect(merger, 0, 0);
  oscR.connect(merger, 0, 1);
  merger.connect(gainNode);
  oscL.start();
  oscR.start();
  return [oscL, oscR, merger];
}

function startSleepAidSoundscape(type, vol) {
  if (typeof SleepAdvancedSuite !== 'undefined' && SleepAdvancedSuite.startSleepAidSoundscape) {
    SleepAdvancedSuite.startSleepAidSoundscape(type, vol);
  }
}

function stopSleepAidSoundscape() {
  if (typeof SleepAdvancedSuite !== 'undefined' && SleepAdvancedSuite.stopSleepAidSoundscape) {
    SleepAdvancedSuite.stopSleepAidSoundscape();
  }
}

function triggerPowerNapMode() {
  if (typeof SleepAdvancedSuite !== 'undefined' && SleepAdvancedSuite.triggerPowerNapMode) {
    SleepAdvancedSuite.triggerPowerNapMode((mins) => triggerSetSleepTimer(mins));
    showToast('⚡ Power-Nap Activated (20m with Delta Rain)', false);
    return;
  }
  const inputCustom = document.getElementById('inputDashSleepCustomMinutes');
  if (inputCustom) inputCustom.value = 20;
  triggerSetSleepTimer(20);
}

function trigger2020PostureAlert() {
  if (typeof FocusAdvancedSuite !== 'undefined' && FocusAdvancedSuite.trigger2020PostureAlert) {
    FocusAdvancedSuite.trigger2020PostureAlert();
    return;
  }
  const toast = document.getElementById('toast2020PostureAlert');
  if (toast) toast.classList.remove('hidden');
}

function triggerBreatheNudgeOverlay(domain) {
  if (typeof FocusAdvancedSuite !== 'undefined' && FocusAdvancedSuite.triggerBreatheNudgeOverlay) {
    FocusAdvancedSuite.triggerBreatheNudgeOverlay(domain);
    return;
  }
  const overlay = document.getElementById('overlayBreatheNudge');
  if (overlay) overlay.classList.remove('hidden');
}

function updateFocusIntegrityScore(delta, reason) {
  if (typeof FocusAdvancedSuite !== 'undefined' && FocusAdvancedSuite.updateFocusIntegrityScore) {
    FocusAdvancedSuite.updateFocusIntegrityScore(delta, reason);
  }
}

let focusHighlightTimerId = null;

/**
 * Deep-links directly to Focus Sentinel card and highlights the Start Focus button
 */
function navigateToFocusSentinel() {
  if (typeof FocusAdvancedSuite !== 'undefined' && typeof FocusAdvancedSuite.navigateToFocusSentinel === 'function') {
    FocusAdvancedSuite.navigateToFocusSentinel();
    return;
  }
  if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
    sentinelHaptics.playClick();
  }
  if (typeof switchTab === 'function') {
    switchTab('wellbeing');
  }
  const card = (typeof document !== 'undefined') ? document.getElementById('widgetPomodoroSentinel') : null;
  const btn = (typeof document !== 'undefined') ? document.getElementById('btnStartPomodoro') : null;
  if (!card) return;

  if (focusHighlightTimerId) {
    clearTimeout(focusHighlightTimerId);
    focusHighlightTimerId = null;
  }

  const prefersReduced = (typeof window !== 'undefined' && window.matchMedia)
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  setTimeout(() => {
    if (typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
    }
    card.classList.remove('focus-card-highlight');
    if (btn) btn.classList.remove('highlight-pulse');
    void card.offsetWidth;
    if (btn) void btn.offsetWidth;

    card.classList.add('focus-card-highlight');
    if (btn) {
      btn.classList.add('highlight-pulse');
      if (typeof btn.focus === 'function') {
        btn.focus({ preventScroll: true });
      }
    }

    focusHighlightTimerId = setTimeout(() => {
      if (card) card.classList.remove('focus-card-highlight');
      if (btn) btn.classList.remove('highlight-pulse');
      focusHighlightTimerId = null;
    }, 2000);
  }, 60);
}

function startSoundscape(type) {
  stopActiveSoundscape();
  if (!type || type === 'none') return;

  const ctx = getFocusAudioContext();
  if (!ctx) return;

  const volumeSlider = document.getElementById('sliderSoundscapeVolume');
  const volVal = volumeSlider ? parseInt(volumeSlider.value, 10) : 50;
  const masterVolume = (volVal / 100) * 0.35;

  soundscapeGainNode = ctx.createGain();
  soundscapeGainNode.gain.setValueAtTime(masterVolume, ctx.currentTime);
  soundscapeGainNode.connect(ctx.destination);

  const nodes = [];

  if (type === 'whitenoise') {
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(soundscapeGainNode);
    noiseSource.start();
    nodes.push(noiseSource, filter);
  } else if (type === 'rain') {
    const noiseBuffer = createNoiseBuffer(ctx, 5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(1400, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.setValueAtTime(250, ctx.currentTime);

    noiseSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(soundscapeGainNode);
    noiseSource.start();
    nodes.push(noiseSource, filter1, filter2);
  } else if (type === 'ocean') {
    const noiseBuffer = createNoiseBuffer(ctx, 6);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(360, ctx.currentTime);
    bpFilter.Q.setValueAtTime(1.8, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.2, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.18, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noiseSource.connect(bpFilter);
    bpFilter.connect(waveGain);
    waveGain.connect(soundscapeGainNode);

    lfo.start();
    noiseSource.start();
    nodes.push(noiseSource, bpFilter, waveGain, lfo, lfoGain);
  } else if (type === 'cafe') {
    const noiseBuffer = createNoiseBuffer(ctx, 5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(soundscapeGainNode);
    noiseSource.start();
    nodes.push(noiseSource, filter);
  } else if (type === 'forest') {
    const noiseBuffer = createNoiseBuffer(ctx, 5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(soundscapeGainNode);
    noiseSource.start();
    nodes.push(noiseSource, filter);
  } else if (type && type.startsWith('binaural_')) {
    const config = {
      binaural_alpha: { carrier: 200, beat: 10 },
      binaural_beta: { carrier: 220, beat: 18 },
      binaural_gamma: { carrier: 240, beat: 40 }
    }[type] || { carrier: 200, beat: 10 };
    const binNodes = createBinauralBeatNodes(ctx, config.carrier, config.beat, soundscapeGainNode);
    nodes.push(...binNodes);
  }

  nodes.push(soundscapeGainNode);
  activeSoundscapeNodes = nodes;
  isSoundscapePlaying = true;
  const toggleBtn = document.getElementById('btnToggleSoundscape');
  if (toggleBtn) toggleBtn.textContent = '⏸';
}

function playAcousticChime(chimeType = 'solfeggio528') {
  const ctx = getFocusAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (chimeType === 'solfeggio528') {
    const tones = [
      { freq: 528, start: 0.0, dur: 0.8, gain: 0.22 },
      { freq: 660, start: 0.12, dur: 0.9, gain: 0.18 }
    ];
    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.0001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(t.gain, now + t.start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.05);
    });
  } else if (chimeType === 'tibetan') {
    const tones = [
      { freq: 432, start: 0.0, dur: 1.4, gain: 0.25 },
      { freq: 864, start: 0.05, dur: 1.1, gain: 0.12 }
    ];
    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.0001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(t.gain, now + t.start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.05);
    });
  } else if (chimeType === 'bell') {
    const tones = [
      { freq: 880, start: 0.0, dur: 0.7, gain: 0.20 },
      { freq: 1760, start: 0.02, dur: 0.5, gain: 0.15 }
    ];
    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.0001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(t.gain, now + t.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.05);
    });
  } else if (chimeType === 'gong') {
    const tones = [
      { freq: 180, start: 0.0, dur: 1.6, gain: 0.28 },
      { freq: 280, start: 0.04, dur: 1.2, gain: 0.16 }
    ];
    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.0001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(t.gain, now + t.start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.05);
    });
  }
}

function updateFocusCycleUI(cycleNum) {
  currentPomodoroCycle = Math.max(1, Math.min(4, cycleNum || 1));
  const dots = document.querySelectorAll('#focusCycleDotsContainer .cycle-dot');
  dots.forEach(dot => {
    const c = parseInt(dot.getAttribute('data-cycle'), 10) || 1;
    dot.classList.remove('active', 'completed');
    if (c < currentPomodoroCycle) {
      dot.classList.add('completed');
    } else if (c === currentPomodoroCycle) {
      dot.classList.add('active');
    }
  });
  const cycleText = document.getElementById('focusCycleText');
  if (cycleText) {
    cycleText.textContent = `Session ${currentPomodoroCycle} of 4`;
  }
}

function updateFocusTargetProgressUI() {
  const fill = document.getElementById('focusTargetProgressFill');
  const txt = document.getElementById('focusTargetGoalText');
  const streakBadge = document.getElementById('focusDailyStreakBadge');

  if (fill) {
    const pct = Math.min(100, Math.round((focusCompletedMinutesToday / FOCUS_TARGET_MINUTES_GOAL) * 100));
    fill.style.width = `${pct}%`;
  }
  if (txt) {
    const h = Math.floor(focusCompletedMinutesToday / 60);
    const m = focusCompletedMinutesToday % 60;
    txt.textContent = `Goal: ${h}h ${String(m).padStart(2, '0')}m / 3h 00m`;
  }
  if (streakBadge) {
    streakBadge.textContent = '🔥 1-Day Streak';
  }
}

function initFocusGoalInput() {
  const inputGoal = document.getElementById('inputFocusGoal');
  const chipGoal = document.getElementById('chipActiveFocusGoal');
  const txtGoal = document.getElementById('txtActiveFocusGoal');
  const btnClear = document.getElementById('btnClearFocusGoal');
  const dialTaskPreview = document.getElementById('pomodoroDialTaskPreview');
  const zenGoal = document.getElementById('txtZenActiveGoal');

  function setGoal(text) {
    const clean = String(text || '').trim();
    if (!clean) return;

    if (txtGoal) txtGoal.textContent = clean;
    if (chipGoal) chipGoal.classList.remove('hidden');
    if (inputGoal) {
      inputGoal.classList.add('hidden');
      inputGoal.value = '';
    }
    if (dialTaskPreview) {
      dialTaskPreview.textContent = clean;
      dialTaskPreview.classList.remove('hidden');
    }
    if (zenGoal) {
      zenGoal.textContent = clean;
    }

    try {
      if (typeof browserAPI !== 'undefined' && browserAPI.storage && browserAPI.storage.local) {
        browserAPI.storage.local.set({ active_focus_goal: clean });
      }
    } catch (_) {}
  }

  function clearGoal() {
    if (chipGoal) chipGoal.classList.add('hidden');
    if (txtGoal) txtGoal.textContent = '';
    if (inputGoal) {
      inputGoal.classList.remove('hidden');
      inputGoal.value = '';
    }
    if (dialTaskPreview) {
      dialTaskPreview.textContent = '';
      dialTaskPreview.classList.add('hidden');
    }
    if (zenGoal) {
      zenGoal.textContent = 'Deep Focus Session';
    }

    try {
      if (typeof browserAPI !== 'undefined' && browserAPI.storage && browserAPI.storage.local) {
        browserAPI.storage.local.remove(['active_focus_goal']);
      }
    } catch (_) {}
  }

  if (inputGoal) {
    inputGoal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        setGoal(inputGoal.value);
      }
    });
    inputGoal.addEventListener('blur', () => {
      if (inputGoal.value.trim()) {
        setGoal(inputGoal.value);
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', clearGoal);
  }

  try {
    if (typeof browserAPI !== 'undefined' && browserAPI.storage && browserAPI.storage.local) {
      browserAPI.storage.local.get(['active_focus_goal'], (res) => {
        if (res && res.active_focus_goal) {
          setGoal(res.active_focus_goal);
        }
      });
    }
  } catch (_) {}
}

function initZenMode() {
  const btnExpand = document.getElementById('btnFocusZenExpand');
  const overlay = document.getElementById('focusZenImmersionOverlay');
  const btnExit = document.getElementById('btnExitZenMode');
  const btnZenToggle = document.getElementById('btnZenToggle');
  const btnZenReset = document.getElementById('btnZenReset');
  const zenQuote = document.getElementById('txtZenQuote');

  if (btnExpand && overlay) {
    btnExpand.addEventListener('click', () => {
      overlay.classList.remove('hidden');
      if (zenQuote && ZEN_FOCUS_QUOTES.length > 0) {
        const randIdx = Math.floor(Math.random() * ZEN_FOCUS_QUOTES.length);
        zenQuote.textContent = ZEN_FOCUS_QUOTES[randIdx];
      }
    });
  }

  if (btnExit && overlay) {
    btnExit.addEventListener('click', () => {
      overlay.classList.add('hidden');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    }
  });

  if (btnZenToggle) {
    btnZenToggle.addEventListener('click', () => {
      const btnStart = document.getElementById('btnStartPomodoro');
      if (btnStart) btnStart.click();
    });
  }

  if (btnZenReset) {
    btnZenReset.addEventListener('click', () => {
      const btnReset = document.getElementById('btnResetPomodoro');
      if (btnReset) btnReset.click();
    });
  }
}

function playSyntheticFocusChime(audioCtx) {
  try {
    const ctx = audioCtx || getFocusAudioContext();
    if (!ctx) return false;
    const now = ctx.currentTime || 0;
    const tones = [
      { freq: 528, start: 0.0, dur: 0.8, gain: 0.22 },
      { freq: 660, start: 0.12, dur: 0.9, gain: 0.18 }
    ];
    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.0001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(t.gain, now + t.start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.05);
    });
    return true;
  } catch (_) {
    return false;
  }
}

function updateDashboardFocusMetrics(metrics) {
  const elFocusTime = document.getElementById('trackMetricFocusTime');
  const elFocusSessions = document.getElementById('trackMetricFocusSessions');
  const todayKey = new Date().toISOString().split('T')[0];
  const today = (metrics && metrics[todayKey]) ? metrics[todayKey] : (metrics && metrics.totalFocusSeconds !== undefined ? metrics : null);
  const totalSec = today ? (today.totalFocusSeconds || 0) : 0;
  const sessions = today ? (today.completedSessions || 0) : 0;

  if (elFocusTime) {
    elFocusTime.textContent = (totalSec > 0) ? formatDuration(totalSec) : '0h 00m';
  }
  if (elFocusSessions) {
    elFocusSessions.textContent = `${sessions} completed session${sessions === 1 ? '' : 's'} today`;
  }
}

function syncFocusSettingsToggles(settings) {
  if (!settings) return;
  const toggleAutoPause = document.getElementById('toggleFocusAutoPauseMedia');
  const toggleChime = document.getElementById('toggleFocusChime');
  if (toggleAutoPause && typeof settings.autoPauseMedia === 'boolean') {
    toggleAutoPause.checked = settings.autoPauseMedia;
  }
  if (toggleChime && typeof settings.soundChime === 'boolean') {
    toggleChime.checked = settings.soundChime;
  }
}

function initPomodoroWidget() {
  if (pomodoroController) return;

  let currentFocusMode = 'focus';
  let currentFocusDurationMin = 25;
  let focusBackendState = {
    state: 'IDLE',
    mode: 'focus',
    durationMinutes: 25,
    remainingSeconds: 1500,
    targetTime: null
  };
  let focusTicker = null;

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return String(m).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
  }

  const updateUI = (state) => {
    const timeDisplay = document.getElementById('pomodoroTimeDisplay');
    const pillClock = document.getElementById('pomodoroPillClock');
    const pillBadge = document.getElementById('pomodoroPillBadge');
    const progressBar = document.getElementById('pomodoroProgressBar');
    const modeBadge = document.getElementById('pomodoroModeBadge');
    const startBtn = document.getElementById('btnStartPomodoro');
    const toggleIcon = document.getElementById('btnFocusToggleIcon');
    const toggleText = document.getElementById('btnFocusToggleText');
    const activeDot = document.getElementById('dashFocusActiveDot');
    const zenClock = document.getElementById('zenFocusClock');
    const zenStatus = document.getElementById('zenFocusStatus');
    const btnZenToggleIcon = document.getElementById('btnZenToggleIcon');
    const btnZenToggleText = document.getElementById('btnZenToggleText');

    const formattedTime = state.formattedTime || formatTime(state.remainingSeconds);

    if (pillClock && formattedTime) {
      pillClock.textContent = formattedTime;
    }
    if (pillBadge) {
      pillBadge.textContent = state.mode === 'focus' ? 'Focus' : 'Break';
      pillBadge.className = state.mode === 'focus' ? 'badge-focus-micro' : 'badge-break-micro';
    }
    if (progressBar && state.remainingSeconds !== undefined) {
      const totalSec = (state.mode === 'focus' ? (state.focusDuration || (25 * 60)) : (state.breakDuration || (5 * 60))) || 1500;
      const pct = Math.max(0, Math.min(100, (state.remainingSeconds / totalSec) * 100));
      progressBar.style.width = pct + '%';
    }

    if (timeDisplay && formattedTime) {
      timeDisplay.textContent = formattedTime;
    }
    if (zenClock && formattedTime) {
      zenClock.textContent = formattedTime;
    }
    if (zenStatus) {
      zenStatus.textContent = state.status === 'running'
        ? (state.mode === 'focus' ? 'Deep Work in Progress' : 'Break Time')
        : (state.status === 'paused' ? 'Paused' : 'Deep Work Idle');
    }
    if (modeBadge) {
      modeBadge.className = state.mode === 'focus' ? 'badge-focus' : 'badge-break';
      const badgeMin = Math.round((state.mode === 'focus' ? (state.focusDuration || 1500) : (state.breakDuration || 300)) / 60);
      modeBadge.textContent = state.mode === 'focus' ? `Focus (${badgeMin}m)` : `Break (${badgeMin}m)`;
    }

    // Radial Dial math: C = 339.292, offset = C * (1 - ratio)
    const totalSec = (state.mode === 'focus' ? (state.focusDuration || (25 * 60)) : (state.breakDuration || (5 * 60))) || 1500;
    updateFocusRadialDial(state.remainingSeconds, totalSec, state.mode, state.status);
    updateFocusFinishTime(state.remainingSeconds, state.status);

    if (state.status === 'running' && state.mode === 'focus') {
      if (typeof FocusAdvancedSuite !== 'undefined' && FocusAdvancedSuite.handlePomodoroFocusTick) {
        FocusAdvancedSuite.handlePomodoroFocusTick('focus', state.remainingSeconds);
      }
    }

    // Active status indicator dot
    if (activeDot) {
      if (state.status === 'running') {
        activeDot.classList.remove('hidden');
        activeDot.className = 'status-indicator-dot online';
      } else if (state.status === 'paused') {
        activeDot.classList.remove('hidden');
        activeDot.className = 'status-indicator-dot warn';
      } else {
        activeDot.classList.add('hidden');
      }
    }

    const microClock = document.getElementById('wellbeingMicroClock');
    const microMode = document.getElementById('wellbeingMicroMode');
    const microDot = document.getElementById('wellbeingMicroStatusDot');
    if (microClock && formattedTime) {
      microClock.textContent = formattedTime;
    }
    if (microMode) {
      microMode.textContent = state.status === 'running'
        ? (state.mode === 'focus' ? 'Focus Active' : 'Break Time')
        : (state.status === 'paused' ? 'Paused' : 'Focus Idle');
    }
    if (microDot) {
      microDot.className = 'hud-dot ' + (state.status === 'running' ? (state.mode === 'focus' ? 'online' : 'warn') : 'idle');
    }

    if (toggleIcon && toggleText) {
      if (state.status === 'running') {
        toggleIcon.textContent = '⏸️';
        toggleText.textContent = 'Pause';
      } else if (state.status === 'paused') {
        toggleIcon.textContent = '▶️';
        toggleText.textContent = 'Resume';
      } else {
        toggleIcon.textContent = '▶️';
        toggleText.textContent = 'Start Focus';
      }
      if (startBtn) startBtn.disabled = false;
    } else if (startBtn) {
      if (state.status === 'running') {
        startBtn.textContent = '⏳ Running';
        startBtn.disabled = true;
      } else {
        startBtn.textContent = '▶️ Start';
        startBtn.disabled = false;
      }
    }

    if (btnZenToggleIcon && btnZenToggleText) {
      if (state.status === 'running') {
        btnZenToggleIcon.textContent = '⏸️';
        btnZenToggleText.textContent = 'Pause';
      } else if (state.status === 'paused') {
        btnZenToggleIcon.textContent = '▶️';
        btnZenToggleText.textContent = 'Resume';
      } else {
        btnZenToggleIcon.textContent = '▶️';
        btnZenToggleText.textContent = 'Start';
      }
    }
  };

  const onBreakTrigger = (state) => {
    try {
      const heroVideo = document.getElementById('heroVideoPlayer');
      if (heroVideo && !heroVideo.paused) {
        heroVideo.pause();
      }
      const playBtn = document.getElementById('btnHeroPlayPause');
      if (playBtn) playBtn.textContent = '▶';
    } catch (_) {}

    currentPomodoroCycle = (currentPomodoroCycle % 4) + 1;
    updateFocusCycleUI(currentPomodoroCycle);

    const focusMins = Math.round((state.focusDuration || 1500) / 60);
    focusCompletedMinutesToday += focusMins;
    updateFocusTargetProgressUI();

    const chimeToggle = document.getElementById('toggleFocusChime');
    if (chimeToggle && chimeToggle.checked) {
      playSyntheticFocusChime();
    }

    if (typeof FocusAdvancedSuite !== 'undefined') {
      FocusAdvancedSuite.executeAutoMuteBackgroundTabs(false);
    }

    updateUI(state);
    showToast(currentLang === 'hi' ? '🧘 फोकस ब्लॉक पूर्ण! 5 मिनट का ब्रेक लें।' : '🧘 Focus block complete! Take a 5-minute break.', false);
  };

  const onFocusTrigger = (state) => {
    const chimeToggle = document.getElementById('toggleFocusChime');
    if (chimeToggle && chimeToggle.checked) {
      playSyntheticFocusChime();
    }

    if (typeof FocusAdvancedSuite !== 'undefined') {
      FocusAdvancedSuite.resetFocusIntegrityScore();
      FocusAdvancedSuite.executeAutoMuteBackgroundTabs(true);
    }

    updateUI(state);
    showToast(currentLang === 'hi' ? '⚡ ब्रेक समाप्त! नया फोकस ब्लॉक शुरू करने के लिए तैयार।' : '⚡ Break finished! Ready to begin new focus block.', false);
  };

  function computeLocalRemaining(state) {
    if ((state.state === 'RUNNING_FOCUS' || state.state === 'RUNNING_BREAK') && state.targetTime) {
      return Math.max(0, Math.round((state.targetTime - Date.now()) / 1000));
    }
    if (state.remainingSeconds !== undefined && state.remainingSeconds !== null) {
      return state.remainingSeconds;
    }
    return (state.durationMinutes || 25) * 60;
  }

  function syncStateFromBackend(bgState) {
    if (!bgState) return;
    focusBackendState = { ...focusBackendState, ...bgState };
    if (bgState.mode) currentFocusMode = bgState.mode;
    if (bgState.durationMinutes) currentFocusDurationMin = bgState.durationMinutes;

    const isRunning = (focusBackendState.state === 'RUNNING_FOCUS' || focusBackendState.state === 'RUNNING_BREAK');
    if (isRunning) {
      if (!focusTicker) {
        focusTicker = setInterval(() => {
          if (focusBackendState.state === 'RUNNING_FOCUS' || focusBackendState.state === 'RUNNING_BREAK') {
            updateUI(pomodoroController.getState());
          }
        }, 1000);
      }
    } else {
      if (focusTicker) {
        clearInterval(focusTicker);
        focusTicker = null;
      }
    }

    if (focusBackendState.completedSessionsToday !== undefined) {
      currentPomodoroCycle = (focusBackendState.completedSessionsToday % 4) + 1;
      updateFocusCycleUI(currentPomodoroCycle);
    }

    updateUI(pomodoroController.getState());
  }

  pomodoroController = {
    _state: focusBackendState,
    getState: () => {
      const isRunning = (focusBackendState.state === 'RUNNING_FOCUS' || focusBackendState.state === 'RUNNING_BREAK');
      const isPaused = (focusBackendState.state === 'PAUSED_FOCUS' || focusBackendState.state === 'PAUSED_BREAK');
      const status = isRunning ? 'running' : (isPaused ? 'paused' : 'idle');
      const remaining = computeLocalRemaining(focusBackendState);
      const focusDur = (focusBackendState.durationMinutes || currentFocusDurationMin || 25) * 60;
      const breakDur = 5 * 60;
      return {
        mode: focusBackendState.mode || currentFocusMode,
        status,
        remainingSeconds: remaining,
        formattedTime: formatTime(remaining),
        focusDuration: focusDur,
        breakDuration: breakDur,
        completedCycles: focusBackendState.completedSessionsToday || 0,
        autoPauseMedia: focusBackendState.autoPauseMedia !== false,
        soundChime: focusBackendState.soundChime !== false
      };
    },
    start: (callbacks = {}) => {
      safeRuntimeSendMessage({
        action: 'START_FOCUS_TIMER',
        durationMinutes: currentFocusDurationMin,
        mode: currentFocusMode
      }, (res) => {
        if (res && res.state) syncStateFromBackend(res.state);
      });
      const durSec = currentFocusDurationMin * 60;
      syncStateFromBackend({
        state: currentFocusMode === 'focus' ? 'RUNNING_FOCUS' : 'RUNNING_BREAK',
        mode: currentFocusMode,
        durationMinutes: currentFocusDurationMin,
        remainingSeconds: durSec,
        targetTime: Date.now() + (durSec * 1000)
      });
    },
    pause: (callbacks = {}) => {
      safeRuntimeSendMessage({ action: 'PAUSE_FOCUS_TIMER' }, (res) => {
        if (res && res.state) syncStateFromBackend(res.state);
      });
      const cur = pomodoroController.getState();
      syncStateFromBackend({
        state: cur.mode === 'focus' ? 'PAUSED_FOCUS' : 'PAUSED_BREAK',
        remainingSeconds: cur.remainingSeconds,
        targetTime: null
      });
    },
    resume: (callbacks = {}) => {
      safeRuntimeSendMessage({ action: 'RESUME_FOCUS_TIMER' }, (res) => {
        if (res && res.state) syncStateFromBackend(res.state);
      });
      const cur = pomodoroController.getState();
      syncStateFromBackend({
        state: cur.mode === 'focus' ? 'RUNNING_FOCUS' : 'RUNNING_BREAK',
        targetTime: Date.now() + (cur.remainingSeconds * 1000)
      });
    },
    reset: (callbacks = {}) => {
      safeRuntimeSendMessage({ action: 'RESET_FOCUS_TIMER' }, (res) => {
        if (res && res.state) syncStateFromBackend(res.state);
      });
      syncStateFromBackend({
        state: 'IDLE',
        mode: 'focus',
        durationMinutes: currentFocusDurationMin,
        remainingSeconds: currentFocusDurationMin * 60,
        targetTime: null
      });
    },
    tick: (callbacks = {}) => {
      updateUI(pomodoroController.getState());
      return pomodoroController.getState();
    },
    playSyntheticChime: () => {
      return playSyntheticFocusChime();
    },
    setFocusDuration: (sec) => {
      const mins = Math.max(1, Math.round(sec / 60));
      currentFocusDurationMin = mins;
      focusBackendState.durationMinutes = mins;
      focusBackendState.remainingSeconds = mins * 60;
      updateUI(pomodoroController.getState());
    },
    extendRemaining: (sec) => {
      const extraMinutes = Math.max(1, Math.round(sec / 60));
      safeRuntimeSendMessage({ action: 'EXTEND_FOCUS_TIMER', extraMinutes }, (res) => {
        if (res && res.state) syncStateFromBackend(res.state);
      });
      const cur = pomodoroController.getState();
      const newSec = cur.remainingSeconds + (extraMinutes * 60);
      const isRunning = cur.status === 'running';
      syncStateFromBackend({
        remainingSeconds: newSec,
        durationMinutes: (focusBackendState.durationMinutes || 25) + extraMinutes,
        targetTime: isRunning ? ((focusBackendState.targetTime || Date.now()) + extraMinutes * 60000) : null
      });
    }
  };

  const btnStart = document.getElementById('btnStartPomodoro');
  const btnPause = document.getElementById('btnPausePomodoro');
  const btnReset = document.getElementById('btnResetPomodoro');

  if (btnStart) {
    btnStart.addEventListener('click', () => {
      const curState = pomodoroController.getState();
      if (curState.status === 'running') {
        pomodoroController.pause({ onTick: updateUI });
        if (typeof FocusAdvancedSuite !== 'undefined') {
          FocusAdvancedSuite.executeAutoMuteBackgroundTabs(false);
        }
      } else if (curState.status === 'paused') {
        pomodoroController.resume({ onTick: updateUI });
        if (typeof FocusAdvancedSuite !== 'undefined') {
          FocusAdvancedSuite.executeAutoMuteBackgroundTabs(true);
        }
      } else {
        if (typeof FocusAdvancedSuite !== 'undefined') {
          FocusAdvancedSuite.resetFocusIntegrityScore();
          FocusAdvancedSuite.executeAutoMuteBackgroundTabs(true);
        }
        pomodoroController.start({
          onTick: updateUI,
          onBreak: onBreakTrigger,
          onFocus: onFocusTrigger
        });
      }
      updateUI(pomodoroController.getState());
    });
  }
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      pomodoroController.pause({ onTick: updateUI });
      if (typeof FocusAdvancedSuite !== 'undefined') {
        FocusAdvancedSuite.executeAutoMuteBackgroundTabs(false);
      }
      updateUI(pomodoroController.getState());
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      pomodoroController.reset({ onTick: updateUI });
      if (typeof FocusAdvancedSuite !== 'undefined') {
        FocusAdvancedSuite.resetFocusIntegrityScore();
        FocusAdvancedSuite.executeAutoMuteBackgroundTabs(false);
      }
      updateUI(pomodoroController.getState());
      updateFocusRadialDial(25 * 60, 25 * 60, 'focus', 'idle');
    });
  }

  // Feature 1: Mode Selector Tabs
  const tabFocus = document.getElementById('tabModeFocus');
  const tabShortBreak = document.getElementById('tabModeShortBreak');
  const tabLongBreak = document.getElementById('tabModeLongBreak');
  const modeTabs = [tabFocus, tabShortBreak, tabLongBreak].filter(Boolean);

  function setFocusMode(mode, durationMin) {
    modeTabs.forEach(t => t.classList.remove('active'));
    const targetTab = mode === 'focus' ? tabFocus : (durationMin > 10 ? tabLongBreak : tabShortBreak);
    if (targetTab) targetTab.classList.add('active');

    currentFocusMode = mode;
    currentFocusDurationMin = durationMin;
    pomodoroController.setFocusDuration(durationMin * 60);

    const curState = pomodoroController.getState();
    if (curState.status === 'idle') {
      focusBackendState.mode = mode;
      focusBackendState.durationMinutes = durationMin;
      focusBackendState.remainingSeconds = durationMin * 60;
      updateUI(pomodoroController.getState());
    }
  }

  if (tabFocus) {
    tabFocus.addEventListener('click', () => setFocusMode('focus', 25));
  }
  if (tabShortBreak) {
    tabShortBreak.addEventListener('click', () => setFocusMode('break', 5));
  }
  if (tabLongBreak) {
    tabLongBreak.addEventListener('click', () => setFocusMode('break', 15));
  }

  // Quick Duration Presets
  const presetBtns = document.querySelectorAll('.dash-focus-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.getAttribute('data-minutes'), 10) || 25;
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFocusDurationMin = mins;
      pomodoroController.setFocusDuration(mins * 60);
      const curState = pomodoroController.getState();
      if (curState.status === 'idle') {
        focusBackendState.durationMinutes = mins;
        focusBackendState.remainingSeconds = mins * 60;
        updateUI(pomodoroController.getState());
      }
    });
  });

  // Feature 1: Custom Duration Minute Stepper
  const inputCustom = document.getElementById('inputFocusCustomMinutes');
  const btnApplyCustom = document.getElementById('btnApplyCustomMinutes');
  function applyCustomMinutes() {
    if (!inputCustom) return;
    const val = parseInt(inputCustom.value, 10);
    if (isNaN(val) || val < 1 || val > 180) {
      showToast('Please enter minutes between 1 and 180', true);
      return;
    }
    presetBtns.forEach(b => b.classList.remove('active'));
    currentFocusDurationMin = val;
    pomodoroController.setFocusDuration(val * 60);
    const curState = pomodoroController.getState();
    if (curState.status === 'idle') {
      focusBackendState.durationMinutes = val;
      focusBackendState.remainingSeconds = val * 60;
      updateUI(pomodoroController.getState());
    }
    showToast(`Focus duration set to ${val}m`, false);
  }
  if (btnApplyCustom) {
    btnApplyCustom.addEventListener('click', applyCustomMinutes);
  }
  if (inputCustom) {
    inputCustom.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyCustomMinutes();
    });
  }

  // Quick Extenders (+5m, +15m)
  const btnExtend5 = document.getElementById('btnFocusExtend5');
  const btnExtend15 = document.getElementById('btnFocusExtend15');
  if (btnExtend5) btnExtend5.addEventListener('click', () => pomodoroController.extendRemaining(5 * 60));
  if (btnExtend15) btnExtend15.addEventListener('click', () => pomodoroController.extendRemaining(15 * 60));

  // Feature 5: Ambient Background Soundscapes
  const selectSoundscape = document.getElementById('selectFocusSoundscape');
  const btnToggleSoundscape = document.getElementById('btnToggleSoundscape');
  const sliderSoundscapeVol = document.getElementById('sliderSoundscapeVolume');
  const txtSoundscapeVol = document.getElementById('txtSoundscapeVolume');

  if (selectSoundscape) {
    selectSoundscape.addEventListener('change', () => {
      if (selectSoundscape.value === 'none') {
        stopActiveSoundscape();
      } else {
        startSoundscape(selectSoundscape.value);
      }
    });
  }

  if (btnToggleSoundscape) {
    btnToggleSoundscape.addEventListener('click', () => {
      if (isSoundscapePlaying) {
        stopActiveSoundscape();
      } else {
        const type = selectSoundscape ? selectSoundscape.value : 'rain';
        if (type === 'none') {
          if (selectSoundscape) selectSoundscape.value = 'rain';
          startSoundscape('rain');
        } else {
          startSoundscape(type);
        }
      }
    });
  }

  if (sliderSoundscapeVol) {
    sliderSoundscapeVol.addEventListener('input', () => {
      const val = parseInt(sliderSoundscapeVol.value, 10);
      if (txtSoundscapeVol) txtSoundscapeVol.textContent = `${val}%`;
      if (soundscapeGainNode && focusAudioCtx) {
        soundscapeGainNode.gain.setValueAtTime((val / 100) * 0.35, focusAudioCtx.currentTime);
      }
    });
  }

  // Feature 7: Acoustic Chime Selector with Preview
  const selectChimeTone = document.getElementById('selectFocusChimeTone');
  const btnPreviewChime = document.getElementById('btnPreviewChime');

  if (btnPreviewChime) {
    btnPreviewChime.addEventListener('click', () => {
      const tone = selectChimeTone ? selectChimeTone.value : 'solfeggio528';
      playAcousticChime(tone);
    });
  }

  // Feature Toggles (Auto-Pause Media, Chime & Strict Shield)
  const toggleAutoPause = document.getElementById('toggleFocusAutoPauseMedia');
  const toggleChime = document.getElementById('toggleFocusChime');
  const toggleStrictShield = document.getElementById('toggleFocusDistractionShield');

  if (toggleAutoPause) {
    toggleAutoPause.addEventListener('change', () => {
      safeRuntimeSendMessage({
        action: 'SAVE_FOCUS_SETTINGS',
        settings: { autoPauseMedia: toggleAutoPause.checked }
      });
    });
  }
  if (toggleChime) {
    toggleChime.addEventListener('change', () => {
      safeRuntimeSendMessage({
        action: 'SAVE_FOCUS_SETTINGS',
        settings: { soundChime: toggleChime.checked }
      });
    });
  }
  if (toggleStrictShield) {
    toggleStrictShield.addEventListener('change', () => {
      const active = toggleStrictShield.checked;
      try {
        if (typeof browserAPI !== 'undefined' && browserAPI.storage && browserAPI.storage.local) {
          browserAPI.storage.local.set({ focus_strict_shield: active });
        }
      } catch (_) {}
      if (active) {
        showToast('🛡️ Strict Shield active: Distraction nudge enabled for focus sessions', false);
      }
    });
  }

  // Storage listener for cross-view synchronization
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.sentinel_focus_timer && changes.sentinel_focus_timer.newValue) {
          syncStateFromBackend(changes.sentinel_focus_timer.newValue);
        }
        if (changes.daily_focus_metrics && changes.daily_focus_metrics.newValue) {
          updateDashboardFocusMetrics(changes.daily_focus_metrics.newValue);
        }
        if (changes.sentinel_focus_settings && changes.sentinel_focus_settings.newValue) {
          syncFocusSettingsToggles(changes.sentinel_focus_settings.newValue);
        }
      }
    });
  }

  // Runtime message listener for live broadcast events
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && (msg.type === 'FOCUS_TIMER_STATE_CHANGED' || msg.action === 'FOCUS_TIMER_STATE_CHANGED')) {
        if (msg.state) syncStateFromBackend(msg.state);
      }
      if (msg && (msg.type === 'FOCUS_TIMER_COMPLETED' || msg.action === 'FOCUS_TIMER_COMPLETED')) {
        onBreakTrigger(pomodoroController.getState());
        if (msg.todayMetrics) {
          updateDashboardFocusMetrics(msg.todayMetrics);
        }
      }
      if (msg && (msg.type === 'FOCUS_BREAK_COMPLETED' || msg.action === 'FOCUS_BREAK_COMPLETED')) {
        onFocusTrigger(pomodoroController.getState());
      }
      if (msg && (msg.type === 'FOCUS_DISTRACTION_EVENT' || msg.action === 'FOCUS_DISTRACTION_EVENT')) {
        if (typeof FocusAdvancedSuite !== 'undefined') {
          const toggleIntegrity = document.getElementById('toggleFocusIntegrityScore');
          if (toggleIntegrity && toggleIntegrity.checked) {
            FocusAdvancedSuite.updateFocusIntegrityScore(-5, msg.reason || 'distraction');
          }
          const toggleBreathe = document.getElementById('toggleFocusBreatheNudge');
          if (toggleBreathe && toggleBreathe.checked) {
            FocusAdvancedSuite.triggerBreatheNudgeOverlay(msg.domain || '');
          }
        }
      }
    });
  }

  // Initial state fetch from background
  safeRuntimeSendMessage({ action: 'GET_FOCUS_TIMER_STATE' }, (res) => {
    if (res && res.success) {
      if (res.state) syncStateFromBackend(res.state);
      if (res.todayMetrics) updateDashboardFocusMetrics(res.todayMetrics);
      if (res.settings) syncFocusSettingsToggles(res.settings);
    }
  });

  // Initialize Subsystems
  updateFocusCycleUI(1);
  updateFocusTargetProgressUI();
  initFocusGoalInput();
  initZenMode();
  initFocusAdvancedState();
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
  const bridgeHudBadge = document.getElementById('bridgeHudStatusBadge');
  const bridgeHudDot = document.getElementById('bridgeHudStatusDot');
  const bridgeHudText = document.getElementById('bridgeHudStatusText');

  const isOnline = (status === true || status === 'online');
  const isStarting = (status === 'starting');

  if (isOnline) {
    if (dot) dot.className = 'hud-dot online';
    if (label) {
      label.textContent = t('hud_connected');
      label.style.color = '#10b981';
    }
    if (bridgeHudBadge) bridgeHudBadge.className = 'bridge-status-pill online';
    if (bridgeHudText) bridgeHudText.textContent = t('bridge_status_online') || 'Connected';
    if (btn) {
      const lbl = btn.querySelector('.btn-bridge-label');
      const icon = btn.querySelector('.btn-bridge-icon');
      if (lbl) {
        lbl.textContent = (t('btn_hud_connected') || 'Connected').replace(/^[^\w\s\u0900-\u097F]+/, '').trim();
        if (icon) icon.textContent = '✅';
      } else {
        btn.textContent = t('btn_hud_connected');
      }
    }
    const hapticEngine = (typeof window !== 'undefined' && window.sentinelHaptics) ||
                         (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics) ||
                         (typeof sentinelHaptics !== 'undefined' ? sentinelHaptics : null);
    if (hapticEngine && typeof hapticEngine.playSuccessChime === 'function') {
      hapticEngine.playSuccessChime();
    }
  } else if (isStarting) {
    if (dot) dot.className = 'hud-dot starting';
    if (label) {
      label.textContent = t('hud_starting');
      label.style.color = '#f59e0b';
    }
    if (bridgeHudBadge) bridgeHudBadge.className = 'bridge-status-pill starting';
    if (bridgeHudText) bridgeHudText.textContent = t('bridge_status_starting') || 'Connecting...';
    if (btn) {
      const lbl = btn.querySelector('.btn-bridge-label');
      const icon = btn.querySelector('.btn-bridge-icon');
      if (lbl) {
        lbl.textContent = (t('btn_connecting') || 'Connecting...').replace(/^[^\w\s\u0900-\u097F]+/, '').trim();
        if (icon) icon.textContent = '⏳';
      } else {
        btn.textContent = t('btn_starting_hud');
      }
    }
  } else {
    if (dot) dot.className = 'hud-dot offline';
    if (label) {
      label.textContent = t('hud_offline');
      label.style.color = '#ef4444';
    }
    if (bridgeHudBadge) bridgeHudBadge.className = 'bridge-status-pill offline';
    if (bridgeHudText) bridgeHudText.textContent = t('bridge_status_offline') || 'Offline';
    if (btn) {
      const lbl = btn.querySelector('.btn-bridge-label');
      const icon = btn.querySelector('.btn-bridge-icon');
      if (lbl) {
        lbl.textContent = (t('btn_reconnect_hud') || 'Reconnect HUD').replace(/^[^\w\s\u0900-\u097F]+/, '').trim();
        if (icon) icon.textContent = '⚡';
      } else {
        btn.textContent = t('btn_reconnect_hud');
      }
    }
  }
}

function updateDataHubStatus(isConnected, registeredBrowsers = []) {
  const wasConnected = dataHubConnected;
  dataHubConnected = Boolean(isConnected);
  const badge = document.getElementById('dataHubBadge');
  const badgeText = document.getElementById('dataHubBadgeText');
  const sideDot = document.getElementById('dataHubSidebarDot');
  const sideLabel = document.getElementById('dataHubSidebarLabel');
  const btn = document.getElementById('btnSidebarReconnectHub');
  const bridgeHubBadge = document.getElementById('bridgeHubStatusBadge');
  const bridgeHubDot = document.getElementById('bridgeHubStatusDot');
  const bridgeHubText = document.getElementById('bridgeHubStatusText');

  if (isConnected) {
    hubReconnectAttempts = 0;
    if (hubReconnectTimer) {
      clearTimeout(hubReconnectTimer);
      hubReconnectTimer = null;
    }

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
    if (bridgeHubBadge) bridgeHubBadge.className = 'bridge-status-pill online';
    if (bridgeHubText) bridgeHubText.textContent = t('bridge_status_online') || 'Connected';
    if (btn) {
      const lbl = btn.querySelector('.btn-bridge-label');
      const icon = btn.querySelector('.btn-bridge-icon');
      if (lbl) {
        lbl.textContent = (t('btn_hub_connected') || 'Connected').replace(/^[^\w\s\u0900-\u097F]+/, '').trim();
        if (icon) icon.textContent = '✅';
      } else {
        btn.textContent = t('btn_hub_connected') || 'Connected';
      }
    }
    const hapticEngine = (typeof window !== 'undefined' && window.sentinelHaptics) ||
                         (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics) ||
                         (typeof sentinelHaptics !== 'undefined' ? sentinelHaptics : null);
    if (!wasConnected && hapticEngine && typeof hapticEngine.playSuccessChime === 'function') {
      hapticEngine.playSuccessChime();
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
    if (bridgeHubBadge) bridgeHubBadge.className = 'bridge-status-pill offline';
    if (bridgeHubText) bridgeHubText.textContent = t('bridge_status_offline') || 'Offline';
    if (btn) {
      const lbl = btn.querySelector('.btn-bridge-label');
      const icon = btn.querySelector('.btn-bridge-icon');
      if (lbl) {
        lbl.textContent = (t('btn_reconnect_hub') || 'Reconnect Hub').replace(/^[^\w\s\u0900-\u097F]+/, '').trim();
        if (icon) icon.textContent = '⚡';
      } else {
        btn.textContent = t('btn_reconnect_hub') || '⚡ Reconnect Hub';
      }
    }
    scheduleDataHubAutoReconnect();
  }

  // Defect 13: Multi-Browser Filter Offline Guidance & Option Annotations
  const browserFilter = document.getElementById('browserFilterSelect');
  if (browserFilter && browserFilter.options) {
    for (let i = 0; i < browserFilter.options.length; i++) {
      const opt = browserFilter.options[i];
      const cleanText = opt.text.replace(/\s*\[Hub Offline\]/g, '').trim();
      if (!isConnected) {
        if (opt.value !== 'all' && opt.value !== 'chrome' && opt.value !== detectedBrowserType) {
          opt.text = `${cleanText} [Hub Offline]`;
        } else {
          opt.text = cleanText;
        }
      } else {
        opt.text = cleanText;
      }
    }
  }
}

// Defect 12: SQLite Data Hub Auto-Reconnect Backoff Ladder Engine
function scheduleDataHubAutoReconnect() {
  if (dataHubConnected || (typeof document !== 'undefined' && document.visibilityState !== 'visible')) {
    return;
  }
  if (hubReconnectTimer) {
    clearTimeout(hubReconnectTimer);
    hubReconnectTimer = null;
  }
  const delay = HUB_RETRY_INTERVALS[Math.min(hubReconnectAttempts, HUB_RETRY_INTERVALS.length - 1)];
  hubReconnectTimer = setTimeout(async () => {
    hubReconnectTimer = null;
    if (dataHubConnected || (typeof document !== 'undefined' && document.visibilityState !== 'visible')) {
      return;
    }
    hubReconnectAttempts++;
    try {
      const res = await refreshDashboard(true);
      if (res && res.dataHubConnected) {
        hubReconnectAttempts = 0;
        if (hubReconnectTimer) {
          clearTimeout(hubReconnectTimer);
          hubReconnectTimer = null;
        }
      } else {
        scheduleDataHubAutoReconnect();
      }
    } catch (_) {
      scheduleDataHubAutoReconnect();
    }
  }, delay);
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
    wellbeing: document.getElementById('paneWellbeing'),
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

  // Manage Media Scroll to Top button visibility on tab switch
  if (tabKey !== 'media') {
    if (typeof setMediaScrollToTopVisible === 'function') {
      setMediaScrollToTopVisible(false);
    } else {
      const scrollBtn = document.getElementById('btnMediaScrollToTop');
      if (scrollBtn) {
        scrollBtn.classList.add('hidden');
        scrollBtn.classList.remove('visible');
      }
    }
  } else if (typeof evaluateMediaScrollVisibility === 'function') {
    evaluateMediaScrollVisibility(null, document.querySelector('.main-stage'));
  }

  // Manage Time Tracking Scroll to Top button visibility on tab switch
  if (tabKey !== 'tracking') {
    if (typeof setTimeScrollToTopVisible === 'function') {
      setTimeScrollToTopVisible(false);
    } else {
      const scrollBtn = document.getElementById('btnTimeScrollToTop');
      if (scrollBtn) {
        scrollBtn.classList.add('hidden');
        scrollBtn.classList.remove('visible');
      }
    }
  } else if (typeof evaluateTimeScrollVisibility === 'function') {
    evaluateTimeScrollVisibility(null, document.querySelector('.main-stage'));
  }

  // Top Bar Headers
  const titleEl = document.getElementById('topBarTitle');
  const subEl = document.getElementById('topBarSubtitle');

  if (tabKey === 'tracking') {
    if (titleEl) titleEl.textContent = t('title_tracking');
    if (subEl) subEl.textContent = t('sub_tracking');
    if (typeof renderTimeTrackingTab === 'function' && dashboardData) {
      renderTimeTrackingTab(dashboardData);
    }
  } else if (tabKey === 'media') {
    if (titleEl) titleEl.textContent = t('title_media');
    if (subEl) subEl.textContent = t('sub_media');
    if (typeof renderMediaAnalyticsTab === 'function') {
      renderMediaAnalyticsTab(dashboardData);
    } else if (typeof renderMediaHistoryTable === 'function' && Array.isArray(mediaHistoryData)) {
      renderMediaHistoryTable(mediaHistoryData);
    }
  } else if (tabKey === 'wellbeing') {
    if (titleEl) titleEl.textContent = t('title_wellbeing');
    if (subEl) subEl.textContent = t('sub_wellbeing');
  } else if (tabKey === 'settings') {
    if (titleEl) titleEl.textContent = t('title_settings');
    if (subEl) subEl.textContent = t('sub_settings');
  }

  applyCardStaggerIndices();
}

// =============================================================================
// WebSocket Status Indicator Navigation & Settings Deep-Link Controller
// =============================================================================

// Global tracking for bridge highlight cleanup timers
let bridgeHighlightTimers = {
  hub: null,
  hud: null
};

/**
 * Deep-links from sidebar WebSocket status cards directly to the
 * corresponding hardware bridge row and action button in the Settings pane.
 *
 * @param {'sqliteHub'|'videoHud'|'hub'|'hud'} serviceType - Identifier for target bridge service
 */
function navigateToBridgeService(serviceType) {
  // 1. Audio / Haptic feedback if available
  if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
    sentinelHaptics.playClick();
  }

  // 2. Switch tab to Settings
  if (typeof switchTab === 'function') {
    switchTab('settings');
  }

  // 3. Determine target elements (supporting both 'sqliteHub'/'hub' and 'videoHud'/'hud')
  const isHub = (serviceType === 'sqliteHub' || serviceType === 'hub');
  const targetRowId = isHub ? 'rowBridgeHub' : 'rowBridgeHud';
  const targetBtnId = isHub ? 'btnSidebarReconnectHub' : 'btnSidebarReconnect';

  const targetRow = (typeof document !== 'undefined') ? document.getElementById(targetRowId) : null;
  const targetBtn = (typeof document !== 'undefined') ? document.getElementById(targetBtnId) : null;

  // 4. Deferred scroll & focus to allow tab transition to render
  const prefersReduced = (typeof window !== 'undefined' && window.matchMedia)
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const scrollOpts = {
    behavior: prefersReduced ? 'auto' : 'smooth',
    block: 'center'
  };

  setTimeout(() => {
    if (targetRow) {
      if (typeof targetRow.scrollIntoView === 'function') {
        targetRow.scrollIntoView(scrollOpts);
      }

      // Clear any pending timer for this service
      const timerKey = isHub ? 'hub' : 'hud';
      if (bridgeHighlightTimers[timerKey]) {
        clearTimeout(bridgeHighlightTimers[timerKey]);
      }

      // Restart highlight animations
      targetRow.classList.remove('service-row-highlight');
      void targetRow.offsetWidth; // Force CSS reflow
      targetRow.classList.add('service-row-highlight');

      if (targetBtn) {
        targetBtn.classList.remove('highlight-pulse');
        void targetBtn.offsetWidth;
        targetBtn.classList.add('highlight-pulse');
        if (typeof targetBtn.focus === 'function') {
          targetBtn.focus({ preventScroll: true });
        }
      }

      // Cleanup after 2000ms
      bridgeHighlightTimers[timerKey] = setTimeout(() => {
        if (targetRow) targetRow.classList.remove('service-row-highlight');
        if (targetBtn) targetBtn.classList.remove('highlight-pulse');
        bridgeHighlightTimers[timerKey] = null;
      }, 2000);
    }
  }, 60);
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

function aggregateDomainRangeStatsFallback(domainObj, datesList, selectedTrackingMode) {
  let rangeFgSec = 0, rangeBgSec = 0, rangeCombinedSec = 0;
  if (domainObj && domainObj.days && Array.isArray(datesList)) {
    datesList.forEach(ds => {
      const dItem = domainObj.days[ds];
      if (dItem) {
        rangeFgSec += (typeof dItem.foregroundSeconds === 'number' ? dItem.foregroundSeconds : (dItem.seconds || 0));
        rangeBgSec += (typeof dItem.backgroundMediaSeconds === 'number' ? dItem.backgroundMediaSeconds : 0);
        rangeCombinedSec += (typeof dItem.seconds === 'number' ? dItem.seconds : (dItem.totalSeconds || 0));
      }
    });
  }
  const computedSec = (selectedTrackingMode === 'foreground') ? rangeFgSec : (selectedTrackingMode === 'background_media') ? rangeBgSec : rangeCombinedSec;
  return { computedSec, rangeFgSec, rangeBgSec, rangeCombinedSec };
}

function processDomainItem(domainName, domainObj, params) {
  const { temporalMode, todayStr, datesList, isRangeMode, historyDays, rawHistoryDays } = params;
  const isInternal = isInternalDomain(domainName);
  if (selectedDomainCategory === 'web' && isInternal) return null;
  if (selectedDomainCategory === 'internal' && !isInternal) return null;

  const combinedTotalSec = domainObj.totalSeconds || 0;
  const fgTotalSec = (typeof domainObj.foregroundSeconds === 'number') ? domainObj.foregroundSeconds : combinedTotalSec;
  const bgMediaTotalSec = domainObj.backgroundMediaSeconds || 0;

  const todayObj = (domainObj.days && domainObj.days[todayStr]) || null;
  const combinedTodaySec = todayObj ? (todayObj.seconds || 0) : 0;
  const fgTodaySec = (todayObj && typeof todayObj.foregroundSeconds === 'number') ? todayObj.foregroundSeconds : combinedTodaySec;
  const bgMediaTodaySec = (todayObj && typeof todayObj.backgroundMediaSeconds === 'number') ? todayObj.backgroundMediaSeconds : 0;

  const targetTotalSec = (selectedTrackingMode === 'foreground') ? fgTotalSec : (selectedTrackingMode === 'background_media') ? bgMediaTotalSec : combinedTotalSec;
  const targetTodaySec = (selectedTrackingMode === 'foreground') ? fgTodaySec : (selectedTrackingMode === 'background_media') ? bgMediaTodaySec : combinedTodaySec;

  let computedSec = 0, rangeFg = 0, rangeBg = 0, rangeCombined = 0;
  if (temporalMode === 'today') {
    computedSec = targetTodaySec;
    rangeFg = fgTodaySec;
    rangeBg = bgMediaTodaySec;
    rangeCombined = combinedTodaySec;
  } else if (isRangeMode) {
    const rangeStats = (_TemporalDateFilter && typeof _TemporalDateFilter.aggregateDomainRangeStats === 'function')
      ? _TemporalDateFilter.aggregateDomainRangeStats(domainObj, datesList, selectedTrackingMode)
      : aggregateDomainRangeStatsFallback(domainObj, datesList, selectedTrackingMode);
    computedSec = rangeStats.computedSec;
    rangeFg = rangeStats.rangeFgSec;
    rangeBg = rangeStats.rangeBgSec;
    rangeCombined = rangeStats.rangeCombinedSec;
  } else if (temporalMode === 'daily') {
    computedSec = Math.round(targetTotalSec / rawHistoryDays);
    rangeFg = Math.round(fgTotalSec / rawHistoryDays);
    rangeBg = Math.round(bgMediaTotalSec / rawHistoryDays);
    rangeCombined = Math.round(combinedTotalSec / rawHistoryDays);
  } else {
    computedSec = targetTotalSec;
    rangeFg = fgTotalSec;
    rangeBg = bgMediaTotalSec;
    rangeCombined = combinedTotalSec;
  }

  if (computedSec <= 0 && !(selectedTrackingMode !== 'background_media' && temporalMode === 'total' && combinedTotalSec > 0)) {
    return { targetTotalSec, targetTodaySec, item: null };
  }

  const item = {
    domain: domainName,
    favicon: domainObj.favicon || getFaviconUrl(domainName),
    computedSeconds: computedSec,
    totalSeconds: targetTotalSec,
    foregroundSeconds: (temporalMode === 'today' ? fgTodaySec : (temporalMode === 'total' || temporalMode === 'daily') ? fgTotalSec : rangeFg),
    backgroundMediaSeconds: (temporalMode === 'today' ? bgMediaTodaySec : (temporalMode === 'total' || temporalMode === 'daily') ? bgMediaTotalSec : rangeBg),
    combinedSeconds: (temporalMode === 'today' ? combinedTodaySec : (temporalMode === 'total' || temporalMode === 'daily') ? combinedTotalSec : rangeCombined),
    todaySeconds: targetTodaySec,
    dailyAvgSeconds: Math.round(isRangeMode ? (computedSec / historyDays) : (targetTotalSec / rawHistoryDays)),
    sessions: domainObj.sessionCount || 1,
    lastActive: domainObj.lastActive || Date.now(),
    isInternal
  };
  return { targetTotalSec, targetTodaySec, item };
}

function processTimeTrackingData(actData, temporalMode, todayStr) {
  if (!actData || !actData.domains) {
    return { items: [], totalSec: 0, todaySec: 0, dailyAvgSec: 0, topDomain: null };
  }

  const rawHistoryDays = Math.max(1, actData.historyDaysCount || 1);
  const isRangeMode = (temporalMode === 'yesterday' || temporalMode === '7d' || temporalMode === '30d' || temporalMode === 'custom');
  const datesList = isRangeMode ? resolveTemporalDateRange(temporalMode, todayStr, customStartDate, customEndDate) : [];

  const historyDays = (_TemporalDateFilter && typeof _TemporalDateFilter.computeEffectiveHistoryDays === 'function')
    ? _TemporalDateFilter.computeEffectiveHistoryDays(temporalMode, datesList.length, rawHistoryDays)
    : (temporalMode === '7d' ? Math.max(1, Math.min(7, rawHistoryDays))
      : temporalMode === '30d' ? Math.max(1, Math.min(30, rawHistoryDays))
      : (temporalMode === 'yesterday' || temporalMode === 'today') ? 1
      : (temporalMode === 'custom' && datesList.length > 0) ? Math.max(1, Math.min(datesList.length, rawHistoryDays))
      : rawHistoryDays);

  let totalTrackedSec = 0, todayTotalSec = 0;
  const processedList = [];
  const params = { temporalMode, todayStr, datesList, isRangeMode, historyDays, rawHistoryDays };

  for (const [domainName, domainObj] of Object.entries(actData.domains)) {
    const res = processDomainItem(domainName, domainObj, params);
    if (!res) continue;
    totalTrackedSec += res.targetTotalSec;
    todayTotalSec += res.targetTodaySec;
    if (res.item) processedList.push(res.item);
  }

  let activeTemporalSum = 0;
  processedList.forEach(item => { activeTemporalSum += item.computedSeconds; });
  processedList.forEach(item => {
    item.ratio = activeTemporalSum > 0 ? (item.computedSeconds / activeTemporalSum) : 0;
    item.ratioPercent = (item.ratio * 100).toFixed(1);
  });
  processedList.sort((a, b) => b.computedSeconds - a.computedSeconds);

  const topDomain = (processedList.length > 0 && processedList[0].computedSeconds > 0) ? processedList[0] : null;
  const dailyAvgSec = Math.round(isRangeMode ? (activeTemporalSum / historyDays) : (totalTrackedSec / rawHistoryDays));

  return {
    items: processedList,
    totalSec: totalTrackedSec,
    todaySec: todayTotalSec,
    dailyAvgSec,
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

/**
 * Renders primary metrics for Time Tracking KPI Bento Grid (Tab A).
 * Universal Rule 28 compliant (<= 35 lines, zero innerHTML).
 */
function renderPrimaryTimeMetrics(kpi) {
  const elToday = document.getElementById('trackMetricTodayTime');
  const elDaily = document.getElementById('trackMetricDailyAvg');
  const elTotal = document.getElementById('trackMetricTotalTime');
  const elHist = document.getElementById('trackMetricHistoryDays');
  const elFirst = document.getElementById('trackMetricFirstDate');
  const elTopDom = document.getElementById('trackMetricTopDomain');
  const elTopTime = document.getElementById('trackMetricTopDomainTime');

  const updateRoll = (el, val) => {
    if (!el) return;
    const prev = Number(el.dataset && el.dataset.rawSec ? el.dataset.rawSec : 0) || 0;
    if (el.dataset) el.dataset.rawSec = val;
    animateNumberRoll(el, prev, val, 600, '', formatDuration);
  };
  updateRoll(elToday, kpi.todaySec);
  updateRoll(elDaily, kpi.dailyAvgSec);
  updateRoll(elTotal, kpi.totalSec);
  if (elHist) elHist.textContent = t('metric_daily_sub', kpi.historyDays);
  if (elFirst) elFirst.textContent = t('metric_total_sub', kpi.firstTrackedDate);

  const hasTop = Boolean(kpi.topDomain && kpi.topDomain.computedSeconds > 0);
  const cleanBrand = hasTop
    ? (kpi.topDomain.cleanName || (typeof TimeTrackingKpiFeature !== 'undefined' && TimeTrackingKpiFeature.formatCleanWebsiteName ? TimeTrackingKpiFeature.formatCleanWebsiteName(kpi.topDomain.domain) : kpi.topDomain.domain))
    : t('no_data');
  if (elTopDom) {
    elTopDom.textContent = cleanBrand;
    if (hasTop && kpi.topDomain.domain) {
      elTopDom.title = kpi.topDomain.domain;
    } else {
      elTopDom.removeAttribute('title');
    }
  }
  if (elTopTime) elTopTime.textContent = hasTop ? `${formatDuration(kpi.topDomain.computedSeconds)} (${kpi.topDomain.ratioPercent}%)` : '0s';
}

/**
 * Renders secondary metrics for Time Tracking KPI Bento Grid (Tab A).
 * Universal Rule 28 compliant (<= 25 lines, zero innerHTML).
 */
function renderSecondaryTimeMetrics(kpi) {
  const elFocusTime = document.getElementById('trackMetricFocusTime');
  const elFocusSessions = document.getElementById('trackMetricFocusSessions');
  const elActiveDomains = document.getElementById('trackMetricActiveDomains');
  const elDistraction = document.getElementById('trackMetricDistractionTime');
  const elSubDistraction = document.getElementById('subMetricDistractionTime');
  const elPeakHour = document.getElementById('trackMetricPeakHour');
  const elLongest = document.getElementById('trackMetricLongestSession');

  if (elFocusTime) elFocusTime.textContent = kpi.focusTimeSec > 0 ? formatDuration(kpi.focusTimeSec) : '0h 00m';
  if (elFocusSessions) elFocusSessions.textContent = `${kpi.focusSessionsCount} completed sessions today`;
  if (elActiveDomains) elActiveDomains.textContent = String(kpi.activeDomainsCount);
  if (elDistraction) elDistraction.textContent = kpi.distraction.seconds > 0 ? formatDuration(kpi.distraction.seconds) : '0h 00m';
  if (elSubDistraction) elSubDistraction.textContent = `${kpi.distraction.percent}% of active time`;
  if (elPeakHour) elPeakHour.textContent = kpi.peakHourStr;
  if (elLongest) elLongest.textContent = kpi.longestSessionSec > 0 ? formatDuration(kpi.longestSessionSec) : '0h 00m';
}

/**
 * Updates the 10-card Time Tracking KPI Bento Grid (Tab A) safely.
 * Universal Rule 28 compliant (<= 30 lines, zero innerHTML).
 */
function updateTimeTrackingKpiView(data, stats, temporalSubtab, todayStr) {
  const kpi = (typeof TimeTrackingKpiFeature !== 'undefined' && TimeTrackingKpiFeature.aggregateTimeTrackingKpis)
    ? TimeTrackingKpiFeature.aggregateTimeTrackingKpis({ data, stats, temporalSubtab, todayStr })
    : {
        todaySec: stats && stats.todaySec ? stats.todaySec : 0,
        dailyAvgSec: stats && stats.dailyAvgSec ? stats.dailyAvgSec : 0,
        totalSec: stats && stats.totalSec ? stats.totalSec : 0,
        historyDays: stats && stats.historyDays ? stats.historyDays : 1,
        firstTrackedDate: stats && stats.firstTrackedDate ? stats.firstTrackedDate : 'today',
        topDomain: stats && stats.topDomain ? stats.topDomain : null,
        focusTimeSec: data && data.focusTimeSec ? data.focusTimeSec : 0,
        focusSessionsCount: data && data.focusSessionsCount ? data.focusSessionsCount : 0,
        activeDomainsCount: (stats && Array.isArray(stats.items)) ? stats.items.length : 0,
        distraction: { seconds: 0, percent: 0 },
        peakHourStr: '--:--',
        longestSessionSec: 0
      };

  renderPrimaryTimeMetrics(kpi);
  renderSecondaryTimeMetrics(kpi);
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

    const isRangeMode = (temporalSubtab === 'yesterday' || temporalSubtab === '7d' || temporalSubtab === '30d' || temporalSubtab === 'custom');

    if (isRangeMode && data && data.activityData && data.activityData.domains) {
      const todayStr = (data && data.todayStr) || new Date().toISOString().split('T')[0];
      stats = processTimeTrackingData(data.activityData, temporalSubtab, todayStr);
      stats.totalSec = allTimeSec || stats.totalSec;
      stats.todaySec = todaySec || stats.todaySec;
      stats.firstTrackedDate = firstTrackedDate || stats.firstTrackedDate;
    } else {
      let rawItems = [];
      let activeTemporalSum = 0;

      if (temporalSubtab === 'today') {
        rawItems = rawTodayList;
        activeTemporalSum = todaySec;
      } else if (temporalSubtab === 'daily') {
        rawItems = rawAllTimeList;
        activeTemporalSum = dailyAvgSec;
      } else { // 'total' or fallback
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
        } else {
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
    }
  } else {
    const actData = data.activityData || {};
    const todayStr = data.todayStr || new Date().toISOString().split('T')[0];
    stats = processTimeTrackingData(actData, temporalSubtab, todayStr);
  }

  // 1. Metric Cards (Symmetrical 5x2 Bento Grid)
  const todayStr = (data && data.todayStr) || new Date().toISOString().split('T')[0];
  updateTimeTrackingKpiView(data, stats, temporalSubtab, todayStr);

  // 2. SVG Donut Chart
  renderDonutChart(stats.items, stats.activeTemporalSum, temporalSubtab);

  // 3. Top 5 Distribution Bars
  renderTopDistributionBars(stats.items, stats.activeTemporalSum);

  // 4. Domain Breakdown Table
  renderDomainTable(stats.items);

  // 5. Phase 1: Productivity Score & Heatmap
  updateProductivityMetrics(stats.items);
  updateChronoHeatmap(data);
}

function renderDonutChart(items, totalSeconds, subtab) {
  const slicesGroup = document.getElementById('dashboardDonutSlices');
  const centerTimeEl = document.getElementById('donutCenterBigTime');
  const centerLabelEl = document.getElementById('donutCenterSubLabel');
  const legendGrid = document.getElementById('donutLegendList');

  if (!slicesGroup || !centerTimeEl || !legendGrid) return;

  while (slicesGroup.firstChild) slicesGroup.removeChild(slicesGroup.firstChild);
  while (legendGrid.firstChild) legendGrid.removeChild(legendGrid.firstChild);

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
    while (legendGrid.firstChild) legendGrid.removeChild(legendGrid.firstChild);
    const emptySpan = document.createElement('span');
    emptySpan.className = 'empty-text';
    emptySpan.textContent = emptyMsg;
    legendGrid.appendChild(emptySpan);
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

    circle.addEventListener('mouseenter', () => {
      const centerInfo = document.querySelector('.donut-center-info');
      if (centerInfo) {
        let faviconImg = centerInfo.querySelector('.donut-center-favicon');
        if (!faviconImg) {
          faviconImg = document.createElement('img');
          faviconImg.className = 'donut-center-favicon';
          centerInfo.insertBefore(faviconImg, centerTimeEl);
        }
        faviconImg.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(slice.domain)}&sz=32`;
        faviconImg.style.display = 'inline-block';
        centerTimeEl.textContent = formatDuration(slice.computedSeconds);
        centerLabelEl.textContent = `${slice.domain} (${slice.ratioPercent}%)`;
      }
    });

    circle.addEventListener('mouseleave', () => {
      const centerInfo = document.querySelector('.donut-center-info');
      if (centerInfo) {
        const faviconImg = centerInfo.querySelector('.donut-center-favicon');
        if (faviconImg) faviconImg.style.display = 'none';
        centerTimeEl.textContent = formatDuration(totalSeconds);
        if (subtab === 'today') {
          centerLabelEl.textContent = t('donut_center_today');
        } else if (subtab === 'daily') {
          centerLabelEl.textContent = t('donut_center_daily');
        } else {
          centerLabelEl.textContent = t('donut_center_total');
        }
      }
    });

    slicesGroup.appendChild(circle);

    const tag = document.createElement('div');
    tag.className = 'legend-tag';
    
    const dot = document.createElement('span');
    dot.className = 'legend-color-dot';
    dot.style.background = color;
    tag.appendChild(dot);
    
    const name = document.createElement('span');
    name.className = 'legend-domain-name';
    name.textContent = slice.domain;
    tag.appendChild(name);
    
    const pct = document.createElement('span');
    pct.className = 'legend-pct';
    pct.style.color = color;
    pct.style.fontWeight = '700';
    pct.textContent = `${slice.ratioPercent}%`;
    tag.appendChild(pct);
    
    legendGrid.appendChild(tag);
  });
}

function renderTopDistributionBars(items, totalSeconds) {
  const container = document.getElementById('topBarsListContainer');
  if (!container) return;

  while (container.firstChild) container.removeChild(container.firstChild);

  if (!items || items.length === 0 || totalSeconds === 0) {
    const emptySpan = document.createElement('span');
    emptySpan.className = 'empty-text';
    emptySpan.textContent = t('no_data_available');
    container.appendChild(emptySpan);
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
    const q = domainSearchQuery.toLowerCase();
    const domMatch = it.domain.toLowerCase().includes(q);
    const note = (domainAnnotations && domainAnnotations[it.domain.toLowerCase()]) || '';
    const noteMatch = note && note.toLowerCase().includes(q);
    return domMatch || noteMatch;
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
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }
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
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  // Starred / Pinned Domains pinned to the top of the table
  if (starredDomains && starredDomains.length > 0) {
    const pinned = [];
    const unpinned = [];
    filtered.forEach(it => {
      if (starredDomains.includes(String(it.domain).toLowerCase())) {
        pinned.push(it);
      } else {
        unpinned.push(it);
      }
    });
    filtered = pinned.concat(unpinned);
  }

  filtered.forEach(it => {
    if (_DomainTable && typeof _DomainTable.buildDomainTableRow === 'function') {
      const modularTr = _DomainTable.buildDomainTableRow(it, {
        document,
        formatDuration,
        formatTimestamp,
        t,
        isInternalDomain,
        starredDomains,
        domainAnnotations,
        onToggleStar: toggleDomainPin,
        onEditNote: openDomainNoteModal,
        getBudgetStatus: (domain, computedSec) => {
          const mins = domainBudgets[String(domain).toLowerCase()];
          if (!mins) return null;
          return _WellbeingBlacklist ? _WellbeingBlacklist.checkDomainBudgetStatus(computedSec, mins) : null;
        }
      });
      if (modularTr) {
        tbody.appendChild(modularTr);
        return;
      }
    }

    const isInternal = Boolean(it.isInternal || isInternalDomain(it.domain));
    const tr = document.createElement('tr');

    const tdDomain = document.createElement('td');
    tdDomain.className = 'col-domain';
    const cellDiv = document.createElement('div');
    cellDiv.className = 'domain-cell';
    const favImg = document.createElement('img');
    favImg.src = it.favicon || '../icons/icon32.png';
    favImg.alt = '';
    favImg.className = 'domain-fav';
    favImg.addEventListener('error', () => {
      favImg.src = '../icons/icon32.png';
    }, { once: true });
    const nameSpan = document.createElement('span');
    nameSpan.className = 'domain-name-text';
    nameSpan.textContent = it.domain || '';
    cellDiv.appendChild(favImg);
    cellDiv.appendChild(nameSpan);

    if (it.domain === 'Dashboard' || it.domain === 'Extension') {
      const extBadge = document.createElement('span');
      extBadge.className = 'badge-tag badge-extension';
      extBadge.title = 'Extension Dashboard';
      extBadge.textContent = `🧩 ${it.domain}`;
      cellDiv.appendChild(extBadge);
    } else if (isInternal) {
      const internalBadge = document.createElement('span');
      internalBadge.className = 'badge-tag badge-internal';
      internalBadge.title = 'Internal Browser Scheme';
      internalBadge.textContent = '⚙️ Internal';
      cellDiv.appendChild(internalBadge);
    }
    tdDomain.appendChild(cellDiv);

    const tdCategory = document.createElement('td');
    tdCategory.className = 'col-category';
    const catSelect = document.createElement('select');
    catSelect.className = 'domain-cat-select';
    catSelect.setAttribute('data-domain', it.domain || '');
    catSelect.setAttribute('aria-label', `Select category for ${it.domain || ''}`);
    const currentCat = typeof getDomainCategory === 'function' ? getDomainCategory(it.domain) : 'utility';
    const catOptions = [
      { id: 'work', label: t('cat_work') || 'Work & Dev' },
      { id: 'learning', label: t('cat_learning') || 'Learning' },
      { id: 'entertainment', label: t('cat_entertainment') || 'Entertainment' },
      { id: 'social', label: t('cat_social') || 'Social' },
      { id: 'utility', label: t('cat_utility') || 'Utilities' }
    ];
    catOptions.forEach(opt => {
      const optEl = document.createElement('option');
      optEl.value = opt.id;
      optEl.textContent = opt.label;
      if (opt.id === currentCat) optEl.selected = true;
      catSelect.appendChild(optEl);
    });
    catSelect.addEventListener('change', (e) => {
      if (typeof handleCategoryOverride === 'function') {
        handleCategoryOverride(it.domain, e.target.value);
      }
    });
    tdCategory.appendChild(catSelect);

    const tdTime = document.createElement('td');
    tdTime.className = 'col-time';
    const timeMain = document.createElement('span');
    timeMain.className = 'time-cell-main';
    timeMain.textContent = formatDuration(it.computedSeconds);
    const dualPills = document.createElement('div');
    dualPills.className = 'time-dual-pills';
    const pillFg = document.createElement('span');
    pillFg.className = 'pill-mini-fg';
    pillFg.title = 'Foreground Active Time';
    pillFg.textContent = `🖥️ ${formatDuration(it.foregroundSeconds || 0)}`;
    const pillBg = document.createElement('span');
    pillBg.className = 'pill-mini-bg';
    pillBg.title = 'Background Media Playback Time';
    pillBg.textContent = `🎵 ${formatDuration(it.backgroundMediaSeconds || 0)}`;
    dualPills.appendChild(pillFg);
    dualPills.appendChild(pillBg);
    tdTime.appendChild(timeMain);
    tdTime.appendChild(dualPills);

    const tdRatio = document.createElement('td');
    tdRatio.className = 'col-ratio';
    const ratioWrapper = document.createElement('div');
    ratioWrapper.className = 'table-ratio-wrapper';
    const ratioTrack = document.createElement('div');
    ratioTrack.className = 'table-ratio-track';
    const ratioFill = document.createElement('div');
    ratioFill.className = 'table-ratio-fill';
    ratioFill.style.width = `${it.ratioPercent}%;`;
    ratioTrack.appendChild(ratioFill);
    const ratioPct = document.createElement('span');
    ratioPct.className = 'table-ratio-pct';
    ratioPct.textContent = `${it.ratioPercent}%`;
    ratioWrapper.appendChild(ratioTrack);
    ratioWrapper.appendChild(ratioPct);
    tdRatio.appendChild(ratioWrapper);

    const tdSessions = document.createElement('td');
    tdSessions.className = 'col-sessions';
    const sessionsBadge = document.createElement('span');
    sessionsBadge.className = 'badge-tag';
    sessionsBadge.textContent = t('session_unit', it.sessions);
    tdSessions.appendChild(sessionsBadge);

    const tdLast = document.createElement('td');
    tdLast.className = 'col-last';
    const lastSpan = document.createElement('span');
    lastSpan.className = 'time-last-active';
    lastSpan.textContent = formatTimestamp(it.lastActive);
    tdLast.appendChild(lastSpan);

    tr.appendChild(tdDomain);
    tr.appendChild(tdCategory);
    tr.appendChild(tdTime);
    tr.appendChild(tdRatio);
    tr.appendChild(tdSessions);
    tr.appendChild(tdLast);

    tbody.appendChild(tr);
  });
}

// =============================================================================
// TAB B: Media Analytics & Playback History
// =============================================================================

/**
 * Classifies if a media history entry represents internal browser schemes or extension pages
 */
function isInternalMediaEntry(item) {
  if (!item) return true;
  const domain = String(item.domain || item.platform || '').trim();
  const lowerDomain = domain.toLowerCase();
  const url = String(item.url || '').trim();
  const lowerUrl = url.toLowerCase();

  // Internal/extension domains check
  if (
    lowerDomain === 'dashboard' ||
    lowerDomain === 'extension' ||
    lowerDomain === 'newtab' ||
    lowerDomain === 'chrome' ||
    lowerDomain === 'edge' ||
    lowerDomain === 'about' ||
    lowerDomain === 'web' ||
    lowerDomain === 'unknown' ||
    lowerDomain === '127.0.0.1' ||
    lowerDomain === 'localhost' ||
    lowerDomain === '0.0.0.0' ||
    lowerDomain === '::1' ||
    lowerDomain.startsWith('chrome-extension://') ||
    lowerDomain.startsWith('edge-extension://') ||
    lowerDomain.startsWith('moz-extension://') ||
    lowerDomain.startsWith('extension:')
  ) {
    return true;
  }

  // Internal/extension URL check (preserving external websites with 'dashboard' in domain/path)
  if (
    lowerUrl.startsWith('chrome-extension://') ||
    lowerUrl.startsWith('edge-extension://') ||
    lowerUrl.startsWith('moz-extension://') ||
    lowerUrl.startsWith('extension://') ||
    lowerUrl.startsWith('chrome://') ||
    lowerUrl.startsWith('edge://') ||
    lowerUrl.startsWith('about:') ||
    lowerUrl.startsWith('data:') ||
    lowerUrl.startsWith('blob:chrome-extension://') ||
    lowerUrl.startsWith('blob:edge-extension://') ||
    lowerUrl.includes('dashboard/dashboard.html') ||
    lowerUrl.endsWith('/dashboard.html') ||
    lowerUrl.endsWith('dashboard.html')
  ) {
    if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
      return true;
    }
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
        return true;
      }
    } catch (_) {}
  }

  return false;
}

/**
 * Extracts normalized playback watch duration in seconds
 */
function getMediaItemDuration(item) {
  if (!item) return 0;
  return Number(item.watchDuration ?? item.watch_duration_seconds ?? item.duration ?? 0);
}

/**
 * Resolves and merges media history from background storage and SQLite Data Hub
 * Eliminates empty array truthiness bug and provides intelligent deduplication
 * Enforces strict defense-in-depth filtering against internal extension pages and sub-5-second noise
 *
 * @param {Array} bgList - Media history array from background service worker (chrome.storage.local)
 * @param {Array} hubList - Media history array from SQLite Data Hub or memory cache
 * @returns {Array} Deduplicated, unified, and timestamp-sorted media history entries
 */
function resolveUnifiedMediaHistory(bgList, hubList) {
  const hasBg = Array.isArray(bgList) && bgList.length > 0;
  const hasHub = Array.isArray(hubList) && hubList.length > 0;

  if (!hasBg && !hasHub) return [];

  const mergedMap = new Map();

  const isInternal = (typeof isInternalMediaEntry === 'function')
    ? isInternalMediaEntry
    : (item) => {
        if (!item) return true;
        const dom = String(item.domain || item.platform || '').toLowerCase().trim();
        const u = String(item.url || '').toLowerCase().trim();
        return dom === 'dashboard' || dom === 'extension' || dom === 'web' || dom === 'unknown' ||
               u.startsWith('chrome-extension://') || u.startsWith('edge-extension://') ||
               u.startsWith('moz-extension://') || u.startsWith('chrome://') || u.startsWith('edge://') ||
               u.startsWith('about:') || u.includes('dashboard/dashboard.html');
      };

  const getDuration = (typeof getMediaItemDuration === 'function')
    ? getMediaItemDuration
    : (item) => (item ? Number(item.watchDuration ?? item.watch_duration_seconds ?? item.duration ?? 0) : 0);

  const getItemKey = (item) => {
    if (!item) return null;
    if (item.id) return String(item.id);
    if (item.session_id) return String(item.session_id);
    const domain = item.domain || item.platform || 'unknown';
    const title = item.title || '';
    const ts = item.timestamp || 0;
    return `${domain}::${title}::${ts}`;
  };

  // Add Data Hub records first (with internal & sub-5s filtering)
  if (hasHub) {
    for (const item of hubList) {
      if (!item || isInternal(item) || getDuration(item) < 5) continue;
      const key = getItemKey(item);
      if (key) {
        mergedMap.set(key, Object.assign({}, item));
      }
    }
  }

  // Overlay background records (with internal & sub-5s filtering)
  if (hasBg) {
    for (const item of bgList) {
      if (!item || isInternal(item) || getDuration(item) < 5) continue;
      const key = getItemKey(item);
      if (key) {
        const existing = mergedMap.get(key);
        if (existing) {
          const higherWatch = Math.max(getDuration(item), getDuration(existing));
          const mostRecentTs = existing.timestamp || item.timestamp || 0;
          const mostRecentUpdate = Math.max(item.lastUpdated || item.timestamp || 0, existing.lastUpdated || existing.timestamp || 0);

          mergedMap.set(key, Object.assign({}, existing, item, {
            watchDuration: higherWatch,
            timestamp: mostRecentTs,
            lastUpdated: mostRecentUpdate,
            isPlaying: Boolean(item.isPlaying || existing.isPlaying)
          }));
        } else {
          mergedMap.set(key, Object.assign({}, item));
        }
      }
    }
  }

  const result = Array.from(mergedMap.values()).filter(item => !isInternal(item) && getDuration(item) >= 5);
  return result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

/**
 * Updates the 10-card Media Analytics KPI Bento Grid (Tab B) safely.
 * Universal Rule 28 compliant (<= 45 lines, zero innerHTML).
 */
function updateMediaAnalyticsKpiView(history, pm, activeStreams) {
  const kpi = (typeof MediaAnalyticsKpiFeature !== 'undefined' && MediaAnalyticsKpiFeature.aggregateMediaAnalyticsKpis)
    ? MediaAnalyticsKpiFeature.aggregateMediaAnalyticsKpis({ history, activeStreams, pm })
    : {
        totalWatchSec: 0,
        avgWatchSec: 0,
        sessionsCount: (history || []).length,
        topPlatform: '-',
        activeStreamsCount: 0,
        avgVolume: 0,
        peakVolume: 0,
        lowVolume: 0,
        mutedSessionsCount: 0,
        longestMediaSec: 0
      };

  const elTotWatch = document.getElementById('mediaMetricTotalWatch');
  const elAvgWatch = document.getElementById('mediaMetricAvgWatch');
  const elSessCount = document.getElementById('mediaMetricSessionsCount');
  const elTopPlat = document.getElementById('mediaMetricTopPlatform');
  const elActiveStreams = document.getElementById('mediaMetricActiveStreams');
  const elAvgVol = document.getElementById('mediaMetricAvgVolume');
  const elPeakVol = document.getElementById('mediaMetricPeakVolume');
  const elLowVol = document.getElementById('mediaMetricLowVolume');
  const elMutedSess = document.getElementById('mediaMetricMutedSessions');
  const elLongestMedia = document.getElementById('mediaMetricLongestSession');

  if (elTotWatch) elTotWatch.textContent = formatDuration(kpi.totalWatchSec);
  if (elAvgWatch) elAvgWatch.textContent = formatDuration(kpi.avgWatchSec);
  if (elSessCount) elSessCount.textContent = String(kpi.sessionsCount);
  if (elTopPlat) elTopPlat.textContent = kpi.topPlatform;
  if (elActiveStreams) elActiveStreams.textContent = String(kpi.activeStreamsCount);
  if (elAvgVol) elAvgVol.textContent = `${kpi.avgVolume}%`;
  if (elPeakVol) elPeakVol.textContent = `${kpi.peakVolume}%`;
  if (elLowVol) elLowVol.textContent = `${kpi.lowVolume}%`;
  if (elMutedSess) elMutedSess.textContent = String(kpi.mutedSessionsCount);
  if (elLongestMedia) elLongestMedia.textContent = kpi.longestMediaSec > 0 ? formatDuration(kpi.longestMediaSec) : '0h 00m';
}

function renderMediaAnalyticsTab(data) {
  const safeData = data || dashboardData || {};
  const rawBgHistory = Array.isArray(safeData.mediaHistory) ? safeData.mediaHistory : [];
  const history = resolveUnifiedMediaHistory(rawBgHistory, mediaHistoryData);

  // Synchronize in-memory datasets so re-renders, searches, and exports stay 100% in sync
  mediaHistoryData = history;
  if (data && typeof data === 'object') {
    data.mediaHistory = history;
  }
  if (dashboardData && typeof dashboardData === 'object') {
    dashboardData.mediaHistory = history;
  }

  const globalMedia = safeData.globalMediaState || {};
  const pm = globalMedia.primaryMedia;

  // 1. Compute Summary Metrics Cards (Symmetrical 5x2 Bento Grid)
  const activeStreamsList = (typeof activeMediaStreams !== 'undefined' && Array.isArray(activeMediaStreams))
    ? activeMediaStreams
    : [];
  updateMediaAnalyticsKpiView(history, pm, activeStreamsList);

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
    if (typeof document !== 'undefined') {
      pollMultiTabMediaStreams({ containerEl: document.getElementById('mediaDeckGrid'), doc: document, t });
    }
    const anyOtherPlaying = Boolean(activeMediaStreams && activeMediaStreams.some(s => s.isPlaying && !s.isMuted));
    setAudioPlayingState(anyOtherPlaying);
    return;
  }

  if (idleContent) idleContent.classList.add('hidden');
  if (activeContent) activeContent.classList.remove('hidden');
  if (heroControls) heroControls.classList.remove('hidden');

  const isPlaying = Boolean(pm.isPlaying);
  updateSidebarLiveEqState(isPlaying);
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

  if (!isDraggingHeroProgress && (Date.now() - lastHeroProgressDragTime > 600)) {
    if (elCur) elCur.textContent = formatDigitalTime(curTime);
    if (elDur) elDur.textContent = isLive ? '🔴 LIVE' : (dur > 0 ? formatDigitalTime(dur) : '--:--');
    if (elPct) elPct.textContent = isLive ? 'LIVE' : `${pct.toFixed(1)}%`;
    if (elFill) elFill.style.width = `${pct}%`;
    const heroProgress = document.getElementById('heroProgressBar');
    if (heroProgress) {
      heroProgress.setAttribute('aria-valuenow', String(Math.round(pct)));
      heroProgress.setAttribute('aria-valuetext', isLive ? 'LIVE' : `${formatDigitalTime(curTime)} / ${dur > 0 ? formatDigitalTime(dur) : '--:--'}`);
    }
    const seekSlider = document.getElementById('heroMediaSeekSlider');
    if (seekSlider) {
      seekSlider.value = String(pct);
      seekSlider.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
  }

  const volPct = Math.round((typeof pm.volume === 'number' ? pm.volume : 1) * 100);
  const isMuted = Boolean(pm.isMuted);

  const volText = document.getElementById('heroVolumeText');
  const volIcon = document.getElementById('heroVolumeIcon');
  const muteBtn = document.getElementById('btnHeroMute');
  const volFill = document.getElementById('heroVolumeFill');

  if (!isDraggingHeroVolume && (Date.now() - lastHeroVolumeDragTime > 600)) {
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
    const heroVol = document.getElementById('heroVolumeBar');
    if (heroVol) {
      heroVol.setAttribute('aria-valuenow', String(isMuted ? 0 : volPct));
      heroVol.setAttribute('aria-valuetext', isMuted ? 'Muted' : `${volPct}%`);
    }
  }

  // 4. Phase 2: Feature 3 Multi-Tab Media Deck Poll & Render
  if (typeof document !== 'undefined') {
    pollMultiTabMediaStreams({ containerEl: document.getElementById('mediaDeckGrid'), doc: document, t });
  }

  // 5. Phase 2: Feature 4 Audio Visualizer Playing State
  const anyPlaying = Boolean((pm && pm.isPlaying) || (activeMediaStreams && activeMediaStreams.some(s => s.isPlaying && !s.isMuted)));
  setAudioPlayingState(anyPlaying);
}

function renderMediaHistoryTable(history) {
  const tbody = document.getElementById('mediaTableBody');
  const countBadge = document.getElementById('tableMediaCountLabel');
  const emptyBox = document.getElementById('mediaTableEmptyState');

  if (!tbody) return;

  // Synchronize mediaPlatformFilter with DOM element or default to 'all'
  const platSelect = document.getElementById('tableMediaPlatformFilter');
  if (platSelect) {
    if (!platSelect.value) {
      platSelect.value = mediaPlatformFilter || 'all';
    } else {
      mediaPlatformFilter = platSelect.value;
    }
  } else {
    if (!mediaPlatformFilter) mediaPlatformFilter = 'all';
  }

  const safeHistory = Array.isArray(history) ? history : [];

  let filtered = safeHistory.filter(item => {
    if (mediaPlatformFilter !== 'all') {
      const p = (item.platform || item.domain || '').toLowerCase();
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
      const matchPlatform = (item.platform || item.domain || '').toLowerCase().includes(q);
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

  if (countBadge) {
    countBadge.textContent = typeof t === 'function' ? t('media_count_suffix', filtered.length) : `${filtered.length} records`;
  }

  // W3C Trusted Types: Safely remove all child nodes without innerHTML
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  if (filtered.length === 0) {
    if (emptyBox) {
      emptyBox.classList.remove('hidden');
      emptyBox.style.display = 'block';
    }
    return;
  }

  if (emptyBox) {
    emptyBox.classList.add('hidden');
    emptyBox.style.display = 'none';
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(it => {
    const tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    tr.tabIndex = 0;

    if (it.isPlaying) {
      tr.classList.add('session-live-active');
      tr.style.borderLeft = '3px solid var(--accent-media, #38bdf8)';
    }

    let platClass = '';
    const platLow = (it.platform || it.domain || '').toLowerCase();
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

    // Col 1: Title & Icon
    const tdTitle = document.createElement('td');
    tdTitle.className = 'col-media-title';
    tdTitle.setAttribute('role', 'cell');

    const titleCell = document.createElement('div');
    titleCell.className = 'media-title-cell';
    titleCell.title = it.title || 'Web Video';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'media-icon-symbol';
    iconSpan.textContent = it.mediaType === 'audio' ? '🎵' : '▶️';

    const titleLink = document.createElement('span');
    titleLink.className = 'media-title-link';
    titleLink.textContent = it.title || 'Web Video';

    titleCell.appendChild(iconSpan);
    titleCell.appendChild(titleLink);

    if (it.isPlaying) {
      const livePulse = document.createElement('span');
      livePulse.className = 'badge-live-pulse';
      livePulse.style.marginLeft = '6px';
      livePulse.style.fontSize = '10px';
      livePulse.style.padding = '1px 6px';
      livePulse.style.borderRadius = '999px';
      livePulse.style.background = 'rgba(34, 197, 94, 0.2)';
      livePulse.style.color = '#4ade80';
      livePulse.style.fontWeight = '600';
      livePulse.textContent = '● LIVE';
      titleCell.appendChild(livePulse);
    }

    if (it.url) {
      titleCell.style.cursor = 'pointer';
      titleCell.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          if (typeof browserAPI !== 'undefined' && browserAPI.tabs && browserAPI.tabs.create) {
            browserAPI.tabs.create({ url: it.url });
          } else if (typeof window !== 'undefined') {
            window.open(it.url, '_blank', 'noopener,noreferrer');
          }
        } catch (_) {}
      });
    }

    tdTitle.appendChild(titleCell);
    tr.appendChild(tdTitle);

    // Col 2: Platform
    const tdPlat = document.createElement('td');
    tdPlat.className = 'col-media-platform';
    tdPlat.setAttribute('role', 'cell');

    const platBadge = document.createElement('span');
    platBadge.className = `badge-tag ${platClass}`.trim();
    platBadge.textContent = it.platform || it.domain || 'Web';
    tdPlat.appendChild(platBadge);
    tr.appendChild(tdPlat);

    // Col 3: Duration
    const tdDuration = document.createElement('td');
    tdDuration.className = 'col-media-duration';
    tdDuration.setAttribute('role', 'cell');

    const timeMain = document.createElement('span');
    timeMain.className = 'time-cell-main';
    timeMain.textContent = formatDuration(it.watchDuration || 0);

    const timeSub = document.createElement('span');
    timeSub.className = 'time-cell-sub';
    timeSub.textContent = ` (${it.watchDuration || 0}s)`;

    tdDuration.appendChild(timeMain);
    tdDuration.appendChild(timeSub);
    tr.appendChild(tdDuration);

    // Col 4: Volume
    const tdVolume = document.createElement('td');
    tdVolume.className = 'col-media-volume';
    tdVolume.setAttribute('role', 'cell');

    const volWrapper = document.createElement('div');
    volWrapper.className = 'volume-meter-wrapper';

    const volTrack = document.createElement('div');
    volTrack.className = 'volume-meter-track';

    const volFill = document.createElement('div');
    volFill.className = 'volume-meter-fill';
    volFill.style.width = `${Math.min(100, Math.max(0, avgVol))}%`;
    volTrack.appendChild(volFill);

    const volText = document.createElement('span');
    volText.className = 'volume-meter-text';
    volText.textContent = `${avgVol}%`;

    volWrapper.appendChild(volTrack);
    volWrapper.appendChild(volText);

    const volExtremes = document.createElement('div');
    volExtremes.className = 'volume-extremes-sub';
    volExtremes.style.fontSize = '10.5px';
    volExtremes.style.color = 'var(--text-muted, #8b949e)';
    volExtremes.style.marginTop = '3px';

    const peakSpan = document.createElement('span');
    peakSpan.style.color = '#fbbf24';
    peakSpan.textContent = `${peakVol}%`;

    const lowSpan = document.createElement('span');
    lowSpan.style.color = '#a78bfa';
    lowSpan.textContent = `${lowVol}%`;

    volExtremes.appendChild(document.createTextNode('Peak: '));
    volExtremes.appendChild(peakSpan);
    volExtremes.appendChild(document.createTextNode(' | Low: '));
    volExtremes.appendChild(lowSpan);

    tdVolume.appendChild(volWrapper);
    tdVolume.appendChild(volExtremes);
    tr.appendChild(tdVolume);

    // Col 5: Resolution & Extra Badges
    const tdRes = document.createElement('td');
    tdRes.className = 'col-media-res';
    tdRes.setAttribute('role', 'cell');

    const resBadge = document.createElement('span');
    resBadge.className = `badge-tag ${resClass}`;
    resBadge.textContent = it.resolution || 'Standard';
    tdRes.appendChild(resBadge);

    if (it.playbackRate && it.playbackRate !== 1.0) {
      const rateBadge = document.createElement('span');
      rateBadge.className = 'badge-tag';
      rateBadge.style.marginLeft = '4px';
      rateBadge.style.fontSize = '10.5px';
      rateBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      rateBadge.style.color = '#fbbf24';
      rateBadge.style.border = '1px solid rgba(245, 158, 11, 0.3)';
      rateBadge.textContent = `⚡ ${it.playbackRate}x`;
      tdRes.appendChild(rateBadge);
    }

    if (it.lastWindowMode && it.lastWindowMode !== 'standard') {
      const modeLabel = it.lastWindowMode === 'fullscreen' ? '⛶ Fullscreen' : (it.lastWindowMode === 'pip' ? '🪟 PiP' : '🎬 Theater');
      const modeBadge = document.createElement('span');
      modeBadge.className = 'badge-tag';
      modeBadge.style.marginLeft = '4px';
      modeBadge.style.fontSize = '10.5px';
      modeBadge.style.background = 'rgba(139, 92, 246, 0.15)';
      modeBadge.style.color = '#c4b5fd';
      modeBadge.style.border = '1px solid rgba(139, 92, 246, 0.3)';
      modeBadge.textContent = modeLabel;
      tdRes.appendChild(modeBadge);
    }
    tr.appendChild(tdRes);

    // Col 6: Date / Timestamp
    const tdDate = document.createElement('td');
    tdDate.className = 'col-media-date';
    tdDate.setAttribute('role', 'cell');

    const dateSpan = document.createElement('span');
    dateSpan.className = 'time-last-active';
    dateSpan.textContent = formatTimestamp(it.timestamp);
    tdDate.appendChild(dateSpan);
    tr.appendChild(tdDate);

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

// =============================================================================
// TAB C: Settings & Data Management
// =============================================================================

function populateSleepSettingsForm(settings) {
  if (!settings) return;

  const sleepDurSelect = document.getElementById('settingDefaultSleepDuration');
  const sleepFadeToggle = document.getElementById('settingSleepFadeToggle');
  const fadeDurSelect = document.getElementById('settingFadeDuration');
  const inactSleepToggle = document.getElementById('settingInactivitySleepToggle');
  const inactThreshSelect = document.getElementById('settingInactivityThreshold');
  const badgeCountToggle = document.getElementById('settingBadgeCountdownToggle');

  const defaultDuration = settings.defaultDurationMinutes !== undefined 
    ? settings.defaultDurationMinutes 
    : settings.defaultSleepDuration;
  if (sleepDurSelect && defaultDuration !== undefined) {
    sleepDurSelect.value = String(defaultDuration);
    cachedSettings.defaultDurationMinutes = parseInt(defaultDuration, 10) || 30;
  }

  const fadeEnabled = settings.enableAudioFadeOut !== undefined 
    ? settings.enableAudioFadeOut 
    : settings.sleepFadeEnabled;
  if (sleepFadeToggle && fadeEnabled !== undefined) {
    sleepFadeToggle.checked = Boolean(fadeEnabled);
    cachedSettings.enableAudioFadeOut = Boolean(fadeEnabled);
  }

  const fadeDuration = settings.fadeDurationSeconds !== undefined 
    ? settings.fadeDurationSeconds 
    : settings.sleepFadeDuration;
  if (fadeDurSelect && fadeDuration !== undefined) {
    fadeDurSelect.value = String(fadeDuration);
    cachedSettings.fadeDurationSeconds = parseInt(fadeDuration, 10) || 30;
  }

  const inactEnabled = settings.enableInactivityAutoSleep !== undefined 
    ? settings.enableInactivityAutoSleep 
    : settings.inactivitySleepEnabled;
  if (inactSleepToggle && inactEnabled !== undefined) {
    inactSleepToggle.checked = Boolean(inactEnabled);
    cachedSettings.enableInactivityAutoSleep = Boolean(inactEnabled);
  }

  const inactThreshold = settings.inactivityThresholdMinutes !== undefined 
    ? settings.inactivityThresholdMinutes 
    : settings.inactivityThreshold;
  if (inactThreshSelect && inactThreshold !== undefined) {
    inactThreshSelect.value = String(inactThreshold);
    cachedSettings.inactivityThresholdMinutes = parseInt(inactThreshold, 10) || 15;
  }

  const badgeCountdown = settings.showBadgeCountdown !== undefined 
    ? settings.showBadgeCountdown 
    : settings.badgeCountdownEnabled;
  if (badgeCountToggle && badgeCountdown !== undefined) {
    badgeCountToggle.checked = Boolean(badgeCountdown);
    cachedSettings.showBadgeCountdown = Boolean(badgeCountdown);
  }

  if (settings.pulseOnCritical !== undefined) {
    cachedSettings.pulseOnCritical = Boolean(settings.pulseOnCritical);
  }
}

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

  // Hydrate sleep controls if sleep configuration is present in payload
  populateSleepSettingsForm(settings);
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

  // Preserve sleep settings from cachedSettings
  cachedSettings = { ...cachedSettings, ...newSettings };

  browserAPI.storage.local.set({ 
    language: selectedLang,
    media_sentinel_settings: cachedSettings
  });

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

function saveSleepSettings() {
  const sleepDurSelect = document.getElementById('settingDefaultSleepDuration');
  const sleepFadeToggle = document.getElementById('settingSleepFadeToggle');
  const fadeDurSelect = document.getElementById('settingFadeDuration');
  const inactSleepToggle = document.getElementById('settingInactivitySleepToggle');
  const inactThreshSelect = document.getElementById('settingInactivityThreshold');
  const badgeCountToggle = document.getElementById('settingBadgeCountdownToggle');

  const sleepSettings = {
    defaultDurationMinutes: parseInt(sleepDurSelect ? sleepDurSelect.value : 30, 10) || 30,
    enableAudioFadeOut: sleepFadeToggle ? sleepFadeToggle.checked : true,
    fadeDurationSeconds: parseInt(fadeDurSelect ? fadeDurSelect.value : 30, 10) || 30,
    enableInactivityAutoSleep: inactSleepToggle ? inactSleepToggle.checked : false,
    inactivityThresholdMinutes: parseInt(inactThreshSelect ? inactThreshSelect.value : 15, 10) || 15,
    showBadgeCountdown: badgeCountToggle ? badgeCountToggle.checked : true,
    pulseOnCritical: cachedSettings.pulseOnCritical !== undefined ? cachedSettings.pulseOnCritical : true
  };

  // Update cachedSettings
  cachedSettings = { ...cachedSettings, ...sleepSettings };

  // Persist to local storage under sentinel_sleep_settings and media_sentinel_settings
  browserAPI.storage.local.set({
    sentinel_sleep_settings: sleepSettings,
    media_sentinel_settings: cachedSettings
  }, () => {
    safeRuntimeSendMessage({
      type: 'UPDATE_SLEEP_SETTINGS',
      settings: sleepSettings
    }, (res) => {
      showToast(t('toast_sleep_saved') || 'Sleep timer settings saved and synchronized');
    });
  });
}

// =============================================================================
// Data Export Capabilities (JSON & CSV)
// =============================================================================

function exportFullJson() {
  if (!dashboardData) return;

  const payload = {
    settings: cachedSettings || {},
    tracking_history: dashboardData.activityData || {},
    media_history: mediaHistoryData || []
  };

  const checksum = (_BackupHubDigest && typeof _BackupHubDigest.computeCRC32 === 'function')
    ? _BackupHubDigest.computeCRC32(payload)
    : '00000000';

  const exportPayload = {
    $schema: 'https://sentinel.local/schemas/backup-v2.json',
    schema_version: '2.0.0',
    exported_at: new Date().toISOString(),
    checksum: checksum,
    device_profile: {
      browser: typeof detectedBrowserType !== 'undefined' ? detectedBrowserType : 'Chrome',
      extension_version: '2.5.0',
      os: 'Windows'
    },
    payload: payload,
    // Backward-compatibility legacy fields for v1 readers
    exportedAt: new Date().toISOString(),
    exportSource: 'Web Activity & Media Sentinel Dashboard',
    author: 'Atul Verma (aiprincekumar)',
    settings: cachedSettings,
    activityData: dashboardData.activityData,
    trackingHistory: dashboardData.activityData,
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

/**
 * Universal RFC 4180 compliant CSV cell escaper with CSV formula injection mitigation (OWASP).
 * Handles null, undefined, special characters, newlines, commas, and double quotes.
 * Mitigates DDE/CSV formula injection by prepending a single quote when string begins with [=+\-@\t\r].
 *
 * @param {*} val
 * @returns {string}
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // 1. CSV Formula Injection Defense (OWASP: DDE mitigation)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  // 2. RFC 4180 quote escaping
  return '"' + str.replace(/"/g, '""') + '"';
}

function exportTimeTrackingCsv(customData) {
  const data = (customData && customData.activityData) ? customData : dashboardData;
  if (!data || !data.activityData) return;

  const actData = data.activityData;
  const domains = actData.domains || {};
  const todayStr = data.todayStr || new Date().toISOString().split('T')[0];

  const headers = [
    'Domain',
    'Today Seconds',
    'Today Formatted',
    'Total Seconds',
    'Total Formatted',
    'Sessions Count',
    'Last Active'
  ].map(escapeCsvCell);

  const rows = [headers.join(',')];

  for (const [dom, obj] of Object.entries(domains)) {
    const todaySec = (obj.days && obj.days[todayStr]) ? (Number(obj.days[todayStr].seconds) || 0) : 0;
    const totalSec = Number(obj.totalSeconds) || 0;
    const sessionCount = Number(obj.sessionCount) || 1;
    const row = [
      escapeCsvCell(dom),
      todaySec,
      escapeCsvCell(formatDuration(todaySec)),
      totalSec,
      escapeCsvCell(formatDuration(totalSec)),
      sessionCount,
      escapeCsvCell(formatTimestamp(obj.lastActive))
    ];
    rows.push(row.join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `media_sentinel_time_tracking_${todayStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('toast_tracking_csv_downloaded'));
}

function exportMediaHistoryCsv(customHistory) {
  const history = Array.isArray(customHistory) ? customHistory : (mediaHistoryData || []);
  const headers = [
    'ID',
    'Title',
    'Platform',
    'Domain',
    'URL',
    'Watch Duration (sec)',
    'Watch Duration Formatted',
    'Avg Volume (%)',
    'Peak Volume (%)',
    'Low Volume (%)',
    'Resolution',
    'Timestamp'
  ].map(escapeCsvCell);

  const rows = [headers.join(',')];

  history.forEach(it => {
    const watchSec = Number(it.watchDuration) || 0;
    const avgVol = it.averageVolume !== undefined ? Number(it.averageVolume) : 100;
    const peakVol = it.peakVolume !== undefined ? Number(it.peakVolume) : 100;
    const lowVol = it.lowVolume !== undefined ? Number(it.lowVolume) : 100;
    const row = [
      escapeCsvCell(it.id || ''),
      escapeCsvCell(it.title || ''),
      escapeCsvCell(it.platform || ''),
      escapeCsvCell(it.domain || ''),
      escapeCsvCell(it.url || ''),
      watchSec,
      escapeCsvCell(formatDuration(watchSec)),
      avgVol,
      peakVol,
      lowVol,
      escapeCsvCell(it.resolution || ''),
      escapeCsvCell(formatTimestamp(it.timestamp))
    ];
    rows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
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

function sendMediaControl(action, data = {}, tabId = null) {
  const now = Date.now();
  const actionKey = `${action}_${JSON.stringify(data)}`;

  if (actionKey === lastDashboardControlKey && (now - lastDashboardControlTime) < 280) {
    return;
  }
  if (action !== 'set_volume' && action !== 'seek_percent' && (now - lastDashboardControlTime) < 180) {
    return;
  }
  lastDashboardControlKey = actionKey;
  lastDashboardControlTime = now;

  const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
  const resolvedTabId = tabId || ((pm && pm.tabId) ? pm.tabId : undefined);

  safeRuntimeSendMessage({
    type: 'CONTROL_MEDIA',
    action,
    data,
    tabId: resolvedTabId
  }, () => {
    if (!isDraggingHeroVolume && !isDraggingHeroProgress) {
      setTimeout(refreshDashboard, 150);
    }
  });
}

function sendSetVolume(percent, targetTabId) {
  const vol = Math.max(0, Math.min(100, percent));
  safeRuntimeSendMessage({
    type: 'SET_VOLUME',
    percent: vol,
    volume: vol / 100,
    tabId: targetTabId
  }, () => {
    if (!isDraggingHeroVolume && !isDraggingHeroProgress) {
      setTimeout(refreshDashboard, 150);
    }
  });
}

function updateHeroVolumeFromEvent(e) {
  const container = document.getElementById('heroVolumeBar');
  const fill = document.getElementById('heroVolumeFill');
  const text = document.getElementById('heroVolumeText');
  const icon = document.getElementById('heroVolumeIcon');
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const pct = rect.width > 0 ? Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100))) : 100;

  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${pct}%`;
  if (icon) icon.textContent = pct === 0 ? '🔇' : (pct > 50 ? '🔊' : '🔉');
  container.setAttribute('aria-valuenow', String(pct));
  container.setAttribute('aria-valuetext', `${pct}%`);

  const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
  const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;

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
      args: [pct]
    }).catch(() => {});
  }

  sendSetVolume(pct, targetTabId);
}

function updateHeroProgressFromEvent(e) {
  const container = document.getElementById('heroProgressBar');
  const fill = document.getElementById('heroProgressFill');
  const elCur = document.getElementById('heroTimeElapsed');
  const elPct = document.getElementById('heroProgressPercent');
  if (!container || !fill) return;

  const rect = container.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const pct = rect.width > 0 ? Math.max(0, Math.min(100, (clickX / rect.width) * 100)) : 0;

  fill.style.width = `${pct.toFixed(1)}%`;
  if (elPct) elPct.textContent = `${pct.toFixed(1)}%`;
  container.setAttribute('aria-valuenow', String(Math.round(pct)));

  const seekSlider = document.getElementById('heroMediaSeekSlider');
  if (seekSlider) {
    seekSlider.value = String(pct);
    seekSlider.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
  const dur = (pm && Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : 0;
  const targetSeconds = dur > 0 ? (pct / 100) * dur : 0;
  container.setAttribute('aria-valuetext', `${formatDigitalTime(targetSeconds)} / ${dur > 0 ? formatDigitalTime(dur) : '--:--'}`);
  if (dur > 0 && elCur) {
    elCur.textContent = formatDigitalTime(targetSeconds);
  }

  const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;

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
      if (response.sleepTimerSettings) {
        populateSleepSettingsForm(response.sleepTimerSettings);
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
      let hubMediaSessions = [];
      if (dataHubConnected && dataHubAnalytics && Array.isArray(dataHubAnalytics.recent_media_sessions) && dataHubAnalytics.recent_media_sessions.length > 0) {
        hubMediaSessions = dataHubAnalytics.recent_media_sessions.map(m => ({
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
      }

      // Unify extension storage history and SQLite Data Hub history
      const unifiedHistory = resolveUnifiedMediaHistory(
        response.mediaHistory,
        hubMediaSessions.length > 0 ? hubMediaSessions : mediaHistoryData
      );
      mediaHistoryData = unifiedHistory;
      response.mediaHistory = unifiedHistory;
      if (dashboardData) {
        dashboardData.mediaHistory = unifiedHistory;
      }

      // Render active tabs
      renderTimeTrackingTab(response);
      renderMediaAnalyticsTab(dashboardData || response);
      if (currentTab === 'media') {
        renderMediaHistoryTable(mediaHistoryData);
      }
      resolve(response);
    });
  });
}

// Standalone SQLite Data Hub Reconnect & Auto-Launch Engine
async function triggerDataHubConnectAndLaunch() {
  if (hubConnectInProgress) return;
  hubConnectInProgress = true;

  // Reset backoff attempts and clear pending reconnect timer
  hubReconnectAttempts = 0;
  if (hubReconnectTimer) {
    clearTimeout(hubReconnectTimer);
    hubReconnectTimer = null;
  }

  const btn = document.getElementById('btnSidebarReconnectHub');
  const badge = document.getElementById('dataHubBadge');
  const badgeText = document.getElementById('dataHubBadgeText');
  const sideDot = document.getElementById('dataHubSidebarDot');
  const sideLabel = document.getElementById('dataHubSidebarLabel');
  const bridgeHubBadge = document.getElementById('bridgeHubStatusBadge');
  const bridgeHubDot = document.getElementById('bridgeHubStatusDot');
  const bridgeHubText = document.getElementById('bridgeHubStatusText');

  const hapticEngine = (typeof window !== 'undefined' && window.sentinelHaptics) ||
                       (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics) ||
                       (typeof sentinelHaptics !== 'undefined' ? sentinelHaptics : null);
  if (hapticEngine && typeof hapticEngine.playClick === 'function') {
    hapticEngine.playClick();
  }

  if (btn) {
    const lbl = btn.querySelector('.btn-bridge-label');
    const icon = btn.querySelector('.btn-bridge-icon');
    if (lbl) {
      lbl.textContent = t('btn_connecting') || 'Connecting...';
      if (icon) icon.textContent = '⏳';
    } else {
      btn.textContent = '⏳ Connecting...';
    }
  }
  if (badge) badge.className = 'datahub-status-badge connecting';
  if (badgeText) badgeText.textContent = (currentLang === 'hi') ? 'कनेक्ट हो रहा है...' : 'Connecting...';
  if (sideDot) sideDot.className = 'hud-dot starting';
  if (sideLabel) {
    sideLabel.textContent = (currentLang === 'hi') ? 'कनेक्ट हो रहा है...' : 'Connecting...';
    sideLabel.style.color = '#f59e0b';
  }
  if (bridgeHubBadge) bridgeHubBadge.className = 'bridge-status-pill starting';
  if (bridgeHubText) bridgeHubText.textContent = t('bridge_status_starting') || 'Connecting...';

  showToast((currentLang === 'hi') ? 'SQLite Data Hub (पोर्ट 65433) से कनेक्ट किया जा रहा है...' : 'Connecting to SQLite Data Hub (port 65433)...');
  safeRuntimeSendMessage({ type: 'LAUNCH_DATA_HUB' });

  let attempts = 0;
  const pollInterval = setInterval(async () => {
    attempts++;
    const res = await refreshDashboard(true);
    if (res && res.dataHubConnected) {
      clearInterval(pollInterval);
      hubConnectInProgress = false;
      hubReconnectAttempts = 0;
      if (hubReconnectTimer) {
        clearTimeout(hubReconnectTimer);
        hubReconnectTimer = null;
      }
      updateDataHubStatus(true, res.dataHubRegisteredBrowsers || []);
      if (btn) {
        const lbl = btn.querySelector('.btn-bridge-label');
        const icon = btn.querySelector('.btn-bridge-icon');
        if (lbl) {
          lbl.textContent = t('btn_hub_connected') || 'Connected';
          if (icon) icon.textContent = '✅';
        } else {
          btn.textContent = t('btn_hub_connected') || 'Connected';
        }
      }
      if (hapticEngine && typeof hapticEngine.playSuccessChime === 'function') {
        hapticEngine.playSuccessChime();
      }
      showToast((currentLang === 'hi') ? 'SQLite Data Hub सफलतापूर्वक कनेक्ट हो गया!' : 'SQLite Data Hub connected successfully!');
    } else if (attempts >= 10) {
      clearInterval(pollInterval);
      hubConnectInProgress = false;
      if (btn) {
        const lbl = btn.querySelector('.btn-bridge-label');
        const icon = btn.querySelector('.btn-bridge-icon');
        if (lbl) {
          lbl.textContent = t('btn_reconnect_hub') || 'Reconnect Hub';
          if (icon) icon.textContent = '⚡';
        } else {
          btn.textContent = t('btn_reconnect_hub') || '⚡ Reconnect Hub';
        }
      }
      if (!res || !res.dataHubConnected) {
        updateDataHubStatus(false);
        showToast((currentLang === 'hi') ? 'SQLite Data Hub (पोर्ट 65433) चालू नहीं है या कनेक्ट नहीं हुआ' : 'Could not connect to SQLite Data Hub (port 65433)', true);
      }
    }
  }, 500);
}

// =============================================================================
// Phase 2: Ergonomic Media & Action Helpers
// =============================================================================

function triggerMediaPlayPause() {
  const btn = document.getElementById('btnHeroPlayPause');
  if (btn) {
    btn.click();
  } else if (typeof sendMediaControl === 'function') {
    sendMediaControl('toggle_play');
  }
}

function triggerMediaMute() {
  const btn = document.getElementById('btnHeroMute');
  if (btn) {
    btn.click();
  } else if (typeof sendMediaControl === 'function') {
    sendMediaControl('toggle_mute');
  }
}

function triggerMediaFullscreen() {
  if (typeof isVisualizerFullscreenActive === 'function' && typeof toggleVisualizerFullscreen === 'function') {
    if (isVisualizerFullscreenActive()) {
      toggleVisualizerFullscreen();
      return;
    }
  }
  const vizPanel = (typeof document !== 'undefined') ? document.getElementById('visualizerPanel') : null;
  const heroLab = (typeof document !== 'undefined') ? document.getElementById('heroAudioLabStatus') : null;
  const isVizFocused = typeof document !== 'undefined' && document.activeElement && (
    (vizPanel && vizPanel.contains(document.activeElement)) ||
    (heroLab && heroLab.contains(document.activeElement))
  );
  if (isVizFocused && typeof toggleVisualizerFullscreen === 'function') {
    toggleVisualizerFullscreen();
    return;
  }

  const btn = (typeof document !== 'undefined') ? document.getElementById('btnHeroFullscreen') : null;
  if (btn) {
    btn.click();
  } else if (typeof toggleVisualizerFullscreen === 'function') {
    toggleVisualizerFullscreen();
  }
}

function triggerMediaPip() {
  const btn = document.getElementById('btnHeroPip');
  if (btn) {
    btn.click();
  }
}

function exportDashboardBackup() {
  if (typeof exportFullJson === 'function') {
    exportFullJson();
  } else {
    const btn = document.getElementById('btnExportFullJson');
    if (btn) btn.click();
  }
}

// =============================================================================
// Phase 2: Shortcuts Registry & Cheat Sheet Modal
// =============================================================================

const SHORTCUTS_REGISTRY = [
  { keys: ['Ctrl', 'K'], labelKey: 'hotkeys_cmd_palette', defaultLabel: 'Open Omni Command Palette', category: 'Global' },
  { keys: ['1'], labelKey: 'hotkeys_nav_1', defaultLabel: 'Switch to Time Tracking Tab', category: 'Navigation' },
  { keys: ['2'], labelKey: 'hotkeys_nav_2', defaultLabel: 'Switch to Media Analytics Tab', category: 'Navigation' },
  { keys: ['3'], labelKey: 'hotkeys_nav_3', defaultLabel: 'Switch to Settings Tab', category: 'Navigation' },
  { keys: ['Space'], labelKey: 'hotkeys_media_play', defaultLabel: 'Play / Pause Active Video', category: 'Media' },
  { keys: ['M'], labelKey: 'hotkeys_media_mute', defaultLabel: 'Mute / Unmute Audio', category: 'Media' },
  { keys: ['F'], labelKey: 'hotkeys_media_fullscreen', defaultLabel: 'Toggle Fullscreen Mode', category: 'Media' },
  { keys: ['P'], labelKey: 'hotkeys_media_pip', defaultLabel: 'Toggle Picture-in-Picture (PiP)', category: 'Media' },
  { keys: ['?'], labelKey: 'hotkeys_cheat_sheet', defaultLabel: 'Open Keyboard Shortcuts Cheat Sheet', category: 'Help' },
  { keys: ['Esc'], labelKey: 'hotkeys_dismiss', defaultLabel: 'Dismiss Active Modal / Overlay', category: 'Global' }
];

function renderHotkeysList() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('hotkeysListContainer');
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  SHORTCUTS_REGISTRY.forEach(item => {
    const row = document.createElement('div');
    row.className = 'hotkey-row';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'hotkey-label';
    labelSpan.textContent = (typeof t === 'function' && item.labelKey) ? t(item.labelKey) : item.defaultLabel;

    const keysDiv = document.createElement('div');
    keysDiv.className = 'hotkey-keys';

    item.keys.forEach((k, idx) => {
      if (idx > 0) {
        const plus = document.createElement('span');
        plus.className = 'hotkey-plus';
        plus.textContent = '+';
        keysDiv.appendChild(plus);
      }
      const kbd = document.createElement('kbd');
      kbd.className = 'omni-hotkey-badge';
      kbd.textContent = k;
      keysDiv.appendChild(kbd);
    });

    row.appendChild(labelSpan);
    row.appendChild(keysDiv);
    container.appendChild(row);
  });
}

function openHotkeysModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('hotkeysCheatSheetModal');
  if (!modal) return;
  if (modal.classList && typeof modal.classList.remove === 'function') {
    modal.classList.remove('hidden');
  }
  renderHotkeysList();
  if (typeof window !== 'undefined' && window.sentinelHaptics && typeof window.sentinelHaptics.playClick === 'function') {
    window.sentinelHaptics.playClick();
  }
}

function closeHotkeysModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('hotkeysCheatSheetModal');
  if (!modal) return;
  if (modal.classList && typeof modal.classList.add === 'function') {
    modal.classList.add('hidden');
  }
}

function isHotkeysModalOpen() {
  if (typeof document === 'undefined') return false;
  const modal = document.getElementById('hotkeysCheatSheetModal');
  return Boolean(modal && modal.classList && typeof modal.classList.contains === 'function' && !modal.classList.contains('hidden'));
}

// =============================================================================
// Phase 2: Omni Command Palette Controller (System 3)
// =============================================================================

class OmniCommandPaletteController {
  constructor() {
    if (typeof document === 'undefined') return;
    this.modal = document.getElementById('omniCommandPaletteModal');
    this.input = document.getElementById('omniPaletteSearchInput');
    this.resultsContainer = document.getElementById('omniPaletteResultsList');
    this.commands = this.buildCommandsList();
    this.filtered = [];
    this.selectedIndex = 0;
    this.initListeners();
  }

  buildCommandsList() {
    return [
      { id: 'nav-tracking', title: 'Go to Time Tracking Analytics', category: 'Navigation', icon: '⏱️', action: () => switchTab('tracking') },
      { id: 'nav-media', title: 'Go to Media Analytics & Hero Player', category: 'Navigation', icon: '🎬', action: () => switchTab('media') },
      { id: 'nav-wellbeing', title: 'Go to Focus & Wellbeing Sentinel', category: 'Navigation', icon: '🧘', action: () => switchTab('wellbeing') },
      { id: 'nav-settings', title: 'Go to Settings & Preferences', category: 'Navigation', icon: '⚙️', action: () => switchTab('settings') },
      { id: 'media-toggle-play', title: 'Play / Pause Active Video', category: 'Quick Actions', icon: '⏯️', action: () => triggerMediaPlayPause() },
      { id: 'media-toggle-mute', title: 'Mute / Unmute Active Audio', category: 'Quick Actions', icon: '🔇', action: () => triggerMediaMute() },
      { id: 'media-toggle-fullscreen', title: 'Toggle Fullscreen Mode', category: 'Quick Actions', icon: '⛶', action: () => triggerMediaFullscreen() },
      { id: 'media-toggle-pip', title: 'Toggle Picture-in-Picture (PiP)', category: 'Quick Actions', icon: '🪟', action: () => triggerMediaPip() },
      { id: 'data-export-json', title: 'Download Master JSON Backup', category: 'Quick Actions', icon: '💾', action: () => exportDashboardBackup() },
      { id: 'theme-toggle-light', title: 'Toggle Light / Dark Mode', category: 'Settings', icon: '🌓', action: () => toggleThemeMode() },
      { id: 'show-hotkeys', title: 'Open Keyboard Shortcuts Sheet', category: 'Quick Actions', icon: '⌨️', action: () => openHotkeysModal() }
    ];
  }

  getMatchedDomains(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    const matched = [];

    if (typeof dashboardData !== 'undefined' && dashboardData && dashboardData.activityData) {
      Object.keys(dashboardData.activityData).forEach(dom => {
        if (dom.toLowerCase().includes(q) && !matched.includes(dom)) {
          matched.push(dom);
        }
      });
    }

    if (typeof dataHubAnalytics !== 'undefined' && dataHubAnalytics && Array.isArray(dataHubAnalytics.domain_distribution)) {
      dataHubAnalytics.domain_distribution.forEach(d => {
        if (d && d.domain && d.domain.toLowerCase().includes(q) && !matched.includes(d.domain)) {
          matched.push(d.domain);
        }
      });
    }

    return matched.slice(0, 5).map(domain => ({
      id: `domain-${domain}`,
      title: `View Analytics for ${domain}`,
      category: 'Domains',
      icon: '🌐',
      action: () => {
        switchTab('tracking');
        if (typeof document !== 'undefined') {
          const searchInput = document.getElementById('tableDomainSearch') || document.getElementById('domainSearchInput');
          if (searchInput) {
            searchInput.value = domain;
            searchInput.dispatchEvent(new Event('input'));
          }
        }
      }
    }));
  }

  open() {
    if (!this.modal) return;
    if (this.modal.classList && typeof this.modal.classList.remove === 'function') {
      this.modal.classList.remove('hidden');
    }
    if (this.input) {
      this.input.value = '';
      this.filter('');
      if (typeof this.input.focus === 'function') this.input.focus();
    }
    if (typeof window !== 'undefined' && window.sentinelHaptics && typeof window.sentinelHaptics.playClick === 'function') {
      window.sentinelHaptics.playClick();
    }
  }

  close() {
    if (!this.modal) return;
    if (this.modal.classList && typeof this.modal.classList.add === 'function') {
      this.modal.classList.add('hidden');
    }
    if (this.input && typeof this.input.blur === 'function') {
      this.input.blur();
    }
  }

  isOpen() {
    return Boolean(this.modal && this.modal.classList && typeof this.modal.classList.contains === 'function' && !this.modal.classList.contains('hidden'));
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  filter(query) {
    const q = (query || '').trim().toLowerCase();
    this.commands = this.buildCommandsList();
    const matchedCmds = q
      ? this.commands.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
      : this.commands;

    const domainCmds = q ? this.getMatchedDomains(q) : [];
    this.filtered = [...matchedCmds, ...domainCmds];
    this.selectedIndex = 0;
    this.render();
  }

  render() {
    if (!this.resultsContainer || typeof document === 'undefined') return;
    while (this.resultsContainer.firstChild) {
      this.resultsContainer.removeChild(this.resultsContainer.firstChild);
    }

    if (this.filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'omni-empty-results';
      empty.textContent = (typeof t === 'function') ? t('cmd_empty') : 'No matching commands or domains found';
      this.resultsContainer.appendChild(empty);
      return;
    }

    this.filtered.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `omni-result-item ${idx === this.selectedIndex ? 'selected' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('id', `omni-item-${idx}`);
      item.setAttribute('aria-selected', idx === this.selectedIndex ? 'true' : 'false');

      const itemLeft = document.createElement('div');
      itemLeft.className = 'cmd-result-left';

      if (cmd.id && cmd.id.startsWith('domain-')) {
        const domainName = cmd.id.replace('domain-', '');
        const faviconImg = document.createElement('img');
        faviconImg.className = 'cmd-favicon';
        faviconImg.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainName)}&sz=32`;
        faviconImg.alt = '';
        faviconImg.onerror = function() { this.style.display = 'none'; };
        itemLeft.appendChild(faviconImg);
      } else {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'omni-item-icon';
        iconSpan.textContent = cmd.icon || '⚡';
        itemLeft.appendChild(iconSpan);
      }

      const contentDiv = document.createElement('div');
      contentDiv.className = 'omni-item-content';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'omni-item-title';
      titleSpan.textContent = cmd.title;

      const catSpan = document.createElement('span');
      catSpan.className = 'omni-item-cat';
      catSpan.textContent = cmd.category;

      contentDiv.appendChild(titleSpan);
      contentDiv.appendChild(catSpan);
      itemLeft.appendChild(contentDiv);

      const kbd = document.createElement('kbd');
      kbd.className = 'cmd-kbd-hint omni-enter-hint';
      kbd.textContent = '↵';

      item.appendChild(itemLeft);
      item.appendChild(kbd);

      item.addEventListener('click', () => {
        this.executeCommand(cmd);
      });

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = idx;
        this.updateSelectionClasses();
      });

      this.resultsContainer.appendChild(item);
    });

    this.scrollSelectedIntoView();
  }

  updateSelectionClasses() {
    if (!this.resultsContainer) return;
    const items = this.resultsContainer.querySelectorAll('.omni-result-item');
    items.forEach((item, idx) => {
      const isSelected = (idx === this.selectedIndex);
      if (isSelected) {
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
    this.scrollSelectedIntoView();
  }

  scrollSelectedIntoView() {
    if (!this.resultsContainer) return;
    const selectedEl = this.resultsContainer.querySelector('.omni-result-item.selected');
    if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  executeSelected() {
    if (this.filtered && this.filtered[this.selectedIndex]) {
      this.executeCommand(this.filtered[this.selectedIndex]);
    }
  }

  executeCommand(cmd) {
    if (!cmd) return;
    if (typeof cmd.action === 'function') {
      cmd.action();
    }
    this.close();
  }

  initListeners() {
    if (this.input) {
      this.input.addEventListener('input', (e) => {
        this.filter(e.target.value);
      });
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.filtered.length > 0) {
            this.selectedIndex = (this.selectedIndex + 1) % this.filtered.length;
            this.updateSelectionClasses();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.filtered.length > 0) {
            this.selectedIndex = (this.selectedIndex - 1 + this.filtered.length) % this.filtered.length;
            this.updateSelectionClasses();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        }
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }
  }
}

let omniPaletteController = null;

// =============================================================================
// Phase 2: Global Ergonomic Hotkey Navigation & WCAG 2.1 AAA (System 8)
// =============================================================================

let globalHotkeysInitialized = false;

function initGlobalHotkeys() {
  if (globalHotkeysInitialized || typeof window === 'undefined') return;
  globalHotkeysInitialized = true;

  // Setup close button on Cheat Sheet Modal
  const btnCloseCheat = document.getElementById('btnCloseHotkeysCheat');
  if (btnCloseCheat) {
    btnCloseCheat.addEventListener('click', closeHotkeysModal);
  }

  // Setup click outside on Cheat Sheet Modal
  const cheatModal = document.getElementById('hotkeysCheatSheetModal');
  if (cheatModal) {
    cheatModal.addEventListener('click', (e) => {
      if (e.target === cheatModal) closeHotkeysModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    // 1. Escape key handling - ALWAYS closes active modals
    if (e.key === 'Escape') {
      let modalDismissed = false;
      if (omniPaletteController && omniPaletteController.isOpen()) {
        omniPaletteController.close();
        modalDismissed = true;
      }
      if (isHotkeysModalOpen()) {
        closeHotkeysModal();
        modalDismissed = true;
      }
      const confirmModal = document.getElementById('confirmModal');
      if (confirmModal && confirmModal.classList && typeof confirmModal.classList.contains === 'function' && !confirmModal.classList.contains('hidden')) {
        if (typeof confirmModal.classList.add === 'function') confirmModal.classList.add('hidden');
        modalDismissed = true;
      }
      if (modalDismissed) {
        e.preventDefault();
        return;
      }
    }

    // 2. Ctrl+K / Cmd+K Command Palette Trigger
    const isCmdOrCtrl = (e.ctrlKey || e.metaKey);
    if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (omniPaletteController) {
        omniPaletteController.toggle();
      }
      return;
    }

    // 3. Strict Input Guard
    // Hotkeys MUST NEVER trigger when an input, textarea, select, or contentEditable element is focused
    const activeEl = document.activeElement;
    const tagName = activeEl ? activeEl.tagName.toUpperCase() : '';
    const isInputActive = tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || (activeEl && Boolean(activeEl.isContentEditable));

    if (isInputActive) {
      return;
    }

    // If any modifier key (except Shift for '?') is active, ignore single-key hotkeys
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    // If command palette or cheat sheet is open, do not execute background single-key shortcuts
    if ((omniPaletteController && omniPaletteController.isOpen()) || isHotkeysModalOpen()) {
      return;
    }

    // 4. Ergonomic Single-Key Hotkeys
    switch (e.key) {
      case '1':
        e.preventDefault();
        switchTab('tracking');
        break;
      case '2':
        e.preventDefault();
        switchTab('media');
        break;
      case '3':
        e.preventDefault();
        switchTab('wellbeing');
        break;
      case '4':
        e.preventDefault();
        switchTab('settings');
        break;
      case ' ': // Spacebar
        e.preventDefault();
        triggerMediaPlayPause();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        triggerMediaMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        triggerMediaFullscreen();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        triggerMediaPip();
        break;
      case '?':
        e.preventDefault();
        openHotkeysModal();
        break;
    }
  });
}

// =============================================================================
// Phase 3: Precision Timeline Scrubber & Kinetic Micro-Motion Engine (Systems 4 & 5)
// =============================================================================

/**
 * Attaches precision floating tooltip, sub-second timestamp tracking,
 * and throttled haptic feedback ticks to the hero media timeline scrubber.
 *
 * @param {HTMLElement} scrubberEl - Seek slider or scrubber container element
 * @param {HTMLElement} tooltipEl - Floating tooltip element
 * @param {number|Function} durationSec - Media duration in seconds (or getter fn)
 */
function initPrecisionScrubber(scrubberEl, tooltipEl, durationSec = 0) {
  if (!scrubberEl || !tooltipEl) return;

  let lastTickPercent = -1;

  function updateTooltipPosition(e) {
    const rect = (typeof scrubberEl.getBoundingClientRect === 'function')
      ? scrubberEl.getBoundingClientRect()
      : { left: 0, width: scrubberEl.offsetWidth || 100 };
    const rectWidth = (rect && rect.width > 0) ? rect.width : (scrubberEl.offsetWidth || 100);
    const rectLeft = (rect && typeof rect.left === 'number') ? rect.left : 0;
    const clientX = (e && typeof e.clientX === 'number')
      ? e.clientX
      : (e && e.touches && e.touches[0] ? e.touches[0].clientX : rectLeft);
    const offsetX = Math.max(0, Math.min(clientX - rectLeft, rectWidth));
    const percent = rectWidth > 0 ? (offsetX / rectWidth) : 0;
    const dur = typeof durationSec === 'function' ? durationSec() : (Number(durationSec) || 100);
    const hoverSeconds = percent * dur;

    tooltipEl.style.left = `${offsetX}px`;
    tooltipEl.textContent = formatHHMMSS(hoverSeconds);
    tooltipEl.classList.remove('hidden');

    // Throttled audio tick hook: when position shifts by >= 1%
    const currentPercentRounded = Math.round(percent * 100);
    if (lastTickPercent === -1 || Math.abs(currentPercentRounded - lastTickPercent) >= 1) {
      lastTickPercent = currentPercentRounded;
      const haptics = (typeof window !== 'undefined' && window.sentinelHaptics)
        ? window.sentinelHaptics
        : (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics ? globalThis.sentinelHaptics : null);
      if (haptics && typeof haptics.playTick === 'function') {
        try { haptics.playTick(); } catch (_) {}
      }
    }
  }

  scrubberEl.addEventListener('mousemove', updateTooltipPosition);
  scrubberEl.addEventListener('mouseleave', () => {
    tooltipEl.classList.add('hidden');
    lastTickPercent = -1;
  });

  // Keyboard Seeking Support with ArrowRight / ArrowLeft
  scrubberEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const haptics = (typeof window !== 'undefined' && window.sentinelHaptics)
        ? window.sentinelHaptics
        : (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics ? globalThis.sentinelHaptics : null);
      if (haptics && typeof haptics.playTick === 'function') {
        try { haptics.playTick(); } catch (_) {}
      }
    }
  });
}

/**
 * 60fps GPU-accelerated kinetic odometer number rolling using Ease-Out Quart easing.
 *
 * @param {HTMLElement} el - Target DOM element
 * @param {number} startVal - Initial number
 * @param {number} targetVal - Target destination number
 * @param {number} durationMs - Animation duration in ms (default: 600)
 * @param {string} unitSuffix - Suffix to append to textContent (e.g. '%', 's')
 * @param {Function|null} formatter - Optional custom formatter function (e.g. formatDuration)
 */
function animateNumberRoll(el, startVal, targetVal, durationMs = 600, unitSuffix = '', formatter = null) {
  if (!el) return;
  const start = Number(startVal) || 0;
  const target = Number(targetVal) || 0;
  const duration = Number(durationMs) || 600;
  const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

  function step(currentTime) {
    const now = (typeof currentTime === 'number' && !isNaN(currentTime))
      ? currentTime
      : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
    const elapsed = now - startTime;
    const progress = Math.min(Math.max(elapsed / duration, 0), 1);
    const eased = easeOutQuart(progress);
    const current = Math.round(start + (target - start) * eased);

    if (typeof formatter === 'function') {
      el.textContent = formatter(current);
    } else {
      el.textContent = `${current}${unitSuffix || ''}`;
    }

    if (progress < 1) {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => step(now + 16), 16);
      }
    }
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(step);
  } else {
    step(startTime);
  }
}

/**
 * Renders discrete chapter tick markers along the timeline scrubber track.
 *
 * @param {Array<number|Object>} chapters - Array of timestamps or {time, title} objects
 * @param {number} durationSec - Total media duration in seconds
 */
function renderScrubberChapterTicks(chapters = [], durationSec = 0) {
  const container = document.getElementById('scrubberChapterTicksContainer');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(chapters) || chapters.length === 0 || durationSec <= 0) return;
  chapters.forEach(ch => {
    const timeSec = typeof ch === 'number' ? ch : (ch.time || ch.seconds || 0);
    const pct = Math.max(0, Math.min(100, (timeSec / durationSec) * 100));
    const tick = document.createElement('div');
    tick.className = 'scrubber-chapter-tick';
    tick.style.left = `${pct.toFixed(2)}%`;
    if (ch.title) tick.title = `${ch.title} (${formatHHMMSS(timeSec)})`;
    container.appendChild(tick);
  });
}

/**
 * Dynamically assigns staggered card entrance animation indices (--card-index)
 * to active bento cards to achieve hardware-accelerated 40ms stagger micro-motion.
 */
function applyCardStaggerIndices() {
  if (typeof document === 'undefined') return;
  const activePane = (typeof document.querySelector === 'function')
    ? (document.querySelector('.tab-pane.active') || document.querySelector('.tab-pane:not(.hidden)'))
    : null;
  if (activePane && typeof activePane.querySelectorAll === 'function') {
    const cards = activePane.querySelectorAll('.bento-card');
    if (cards && typeof cards.forEach === 'function') {
      cards.forEach((card, idx) => {
        if (card && card.style && typeof card.style.setProperty === 'function') {
          card.style.setProperty('--card-index', String(idx + 1));
        }
      });
    }
  }
}

/**
 * OO Class encapsulation for PrecisionTimelineScrubber.
 */
class PrecisionTimelineScrubber {
  constructor(scrubberEl, tooltipEl, durationSec = 0) {
    this.scrubberEl = scrubberEl;
    this.tooltipEl = tooltipEl;
    this.durationSec = durationSec;
    if (scrubberEl && tooltipEl) {
      initPrecisionScrubber(scrubberEl, tooltipEl, durationSec);
    }
  }

  setDuration(durationSec) {
    this.durationSec = durationSec;
  }

  renderChapters(chapters) {
    renderScrubberChapterTicks(chapters, this.durationSec);
  }
}

// =============================================================================
// Event Listeners & UI Binding
// =============================================================================

let dashboardListenersAttached = false;

function setupEventListeners() {
  if (dashboardListenersAttached) return;
  dashboardListenersAttached = true;
  setupExportDropdown();

  // Feature 7: Blacklist & Domain Notes Event Listeners
  const btnAddBlacklist = document.getElementById('btnAddBlacklistPattern');
  const inputBlacklist = document.getElementById('inputBlacklistPattern');
  if (btnAddBlacklist && inputBlacklist) {
    btnAddBlacklist.addEventListener('click', () => {
      const val = inputBlacklist.value.trim();
      if (val) {
        addBlacklistPattern(val);
        inputBlacklist.value = '';
      }
    });
    inputBlacklist.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = inputBlacklist.value.trim();
        if (val) {
          addBlacklistPattern(val);
          inputBlacklist.value = '';
        }
      }
    });
  }

  const btnPurge = document.getElementById('btnPurgeDomainHistory');
  const inputPurge = document.getElementById('inputPurgeDomain');
  if (btnPurge && inputPurge) {
    btnPurge.addEventListener('click', async () => {
      const val = inputPurge.value.trim();
      if (val) {
        await purgeDomainData(val);
        inputPurge.value = '';
      }
    });
  }

  // Feature 8: Domain Daily Budgets Event Listeners
  const btnAddBudget = document.getElementById('btnAddBudget');
  const inputBudgetDomain = document.getElementById('inputBudgetDomain');
  const inputBudgetMinutes = document.getElementById('inputBudgetMinutes');
  if (btnAddBudget && inputBudgetDomain && inputBudgetMinutes) {
    btnAddBudget.addEventListener('click', () => {
      const dom = inputBudgetDomain.value.trim();
      const mins = Number(inputBudgetMinutes.value);
      if (dom && mins > 0) {
        setDomainBudget(dom, mins);
        inputBudgetDomain.value = '';
      }
    });
  }

  // Feature 7: Domain Note Modal Event Listeners
  const btnSaveNote = document.getElementById('btnSaveDomainNote');
  const btnCancelNote = document.getElementById('btnCancelDomainNote');
  const btnCancelNoteX = document.getElementById('btnCancelDomainNoteX');
  const inputNoteText = document.getElementById('inputDomainNoteText');
  if (btnSaveNote) {
    btnSaveNote.addEventListener('click', () => {
      if (activeEditingDomainNote) {
        saveDomainNote(activeEditingDomainNote, inputNoteText ? inputNoteText.value : '');
      }
    });
  }
  if (btnCancelNote) btnCancelNote.addEventListener('click', closeDomainNoteModal);
  if (btnCancelNoteX) btnCancelNoteX.addEventListener('click', closeDomainNoteModal);

  // 0. Multi-Browser Dropdown Filter
  const browserFilterSelect = document.getElementById('browserFilterSelect');
  if (browserFilterSelect) {
    browserFilterSelect.value = selectedBrowser;
    browserFilterSelect.addEventListener('change', async (e) => {
      selectedBrowser = e.target.value;
      await browserAPI.storage.local.set({ selected_browser_filter: selectedBrowser });
      await refreshDashboard(false);
      const rawText = (e.target.options && e.target.options[e.target.selectedIndex])
        ? e.target.options[e.target.selectedIndex].text
        : selectedBrowser;
      const selectedText = rawText.replace(/\s*\[Hub Offline\]/g, '').trim();
      if (selectedBrowser !== 'all' && selectedBrowser !== 'chrome' && selectedBrowser !== detectedBrowserType && !dataHubConnected) {
        const guidanceMsg = (currentLang === 'hi')
          ? `SQLite Data Hub ऑफलाइन है। ${selectedText} डेटा सिंक के लिए हब आवश्यक है।`
          : `SQLite Data Hub is offline. Hub is required for ${selectedText} cross-browser data.`;
        showToast(guidanceMsg, true);
      } else {
        showToast(`Filter: ${selectedText}`);
      }
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
  const btnReconnectHub = document.getElementById('btnSidebarReconnectHub');
  if (btnReconnectHub) {
    btnReconnectHub.addEventListener('click', () => {
      if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
        sentinelHaptics.playClick();
      }
      hubReconnectAttempts = 0;
      if (hubReconnectTimer) {
        clearTimeout(hubReconnectTimer);
        hubReconnectTimer = null;
      }
      triggerDataHubConnectAndLaunch();
    });
  }

  const dataHubBadge = document.getElementById('dataHubBadge');
  if (dataHubBadge) {
    dataHubBadge.addEventListener('click', () => {
      hubReconnectAttempts = 0;
      if (hubReconnectTimer) {
        clearTimeout(hubReconnectTimer);
        hubReconnectTimer = null;
      }
      triggerDataHubConnectAndLaunch();
    });
  }

  // 1. Navigation Tab Switching
  const navTabTracking = document.getElementById('navTabTracking');
  if (navTabTracking) {
    navTabTracking.addEventListener('click', () => switchTab('tracking'));
  }
  const navTabMedia = document.getElementById('navTabMedia');
  if (navTabMedia) {
    navTabMedia.addEventListener('click', () => switchTab('media'));
  }
  const navTabWellbeing = document.getElementById('navTabWellbeing');
  if (navTabWellbeing) {
    navTabWellbeing.addEventListener('click', () => navigateToFocusSentinel());
  }
  const microWidget = document.getElementById('wellbeingLiveMicroWidget');
  if (microWidget) {
    microWidget.addEventListener('click', () => navigateToFocusSentinel());
    microWidget.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        navigateToFocusSentinel();
      }
    });
  }
  const navTabSettings = document.getElementById('navTabSettings');
  if (navTabSettings) {
    navTabSettings.addEventListener('click', () => switchTab('settings'));
  }

  // Sidebar WebSocket Status Cards — Deep-Link to Settings
  const sidebarDataHubCard = document.getElementById('sidebarDataHubCard');
  if (sidebarDataHubCard) {
    sidebarDataHubCard.addEventListener('click', () => {
      navigateToBridgeService('sqliteHub');
    });
    sidebarDataHubCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        navigateToBridgeService('sqliteHub');
      }
    });
  }

  const sidebarHudCard = document.getElementById('sidebarHudCard');
  if (sidebarHudCard) {
    sidebarHudCard.addEventListener('click', () => {
      navigateToBridgeService('videoHud');
    });
    sidebarHudCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        navigateToBridgeService('videoHud');
      }
    });
  }

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

  // 2b. 1-Click Theme Switcher (Light / Dark Mode Toggle - Defect 16)
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      toggleThemeMode();
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
  function handleConnectOrLaunchHUD() {
    if (dashboardData && dashboardData.wsConnected) {
      showToast(t('toast_hud_already'));
      return;
    }

    if (hudLaunchInProgress) return;
    if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
      sentinelHaptics.playClick();
    }
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
      temporalSubtab = btn.getAttribute('data-temporal') || btn.getAttribute('data-range') || 'today';
      const customPicker = document.getElementById('customDateRangePicker');
      if (customPicker) {
        if (temporalSubtab === 'custom') {
          customPicker.classList.remove('hidden');
        } else {
          customPicker.classList.add('hidden');
        }
      }
      if (dashboardData) {
        renderTimeTrackingTab(dashboardData);
      }
    });
  });

  const btnApplyCustom = document.getElementById('btnApplyCustomRange');
  if (btnApplyCustom) {
    btnApplyCustom.addEventListener('click', () => {
      const startInp = document.getElementById('inputCustomStart') || document.getElementById('inputCustomStartDate');
      const endInp = document.getElementById('inputCustomEnd') || document.getElementById('inputCustomEndDate');
      if (startInp && endInp && startInp.value && endInp.value) {
        customStartDate = startInp.value;
        customEndDate = endInp.value;
        temporalSubtab = 'custom';
        if (dashboardData) {
          renderTimeTrackingTab(dashboardData);
        }
      }
    });
  }

  const btnHeatFocus = document.getElementById('btnHeatmapModeFocus');
  const btnHeatMedia = document.getElementById('btnHeatmapModeMedia');
  if (btnHeatFocus && btnHeatMedia) {
    btnHeatFocus.addEventListener('click', () => {
      btnHeatFocus.classList.add('active');
      btnHeatFocus.setAttribute('aria-pressed', 'true');
      btnHeatMedia.classList.remove('active');
      btnHeatMedia.setAttribute('aria-pressed', 'false');
      currentHeatmapMode = 'focus';
      if (dashboardData) {
        updateChronoHeatmap(dashboardData);
      }
    });
    btnHeatMedia.addEventListener('click', () => {
      btnHeatMedia.classList.add('active');
      btnHeatMedia.setAttribute('aria-pressed', 'true');
      btnHeatFocus.classList.remove('active');
      btnHeatFocus.setAttribute('aria-pressed', 'false');
      currentHeatmapMode = 'media';
      if (dashboardData) {
        updateChronoHeatmap(dashboardData);
      }
    });
  }

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
    const willPlay = pm ? !(pm.isPlaying || pm.state === 'playing') : true;
    const targetAction = willPlay ? 'play' : 'pause';
    if (pm) {
      pm.isPlaying = willPlay;
      pm.state = willPlay ? 'playing' : 'paused';
      renderHeroMediaPlayer(pm);
    }
    const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({
        target: { tabId: targetTabId },
        world: 'MAIN',
        args: [targetAction],
        func: (action) => {
          const p = document.getElementById('movie_player') || window.movie_player;
          const v = Array.from(document.querySelectorAll('video')).find(el => !el.paused) || document.querySelector('video');
          if (p && typeof p.playVideo === 'function' && typeof p.pauseVideo === 'function') {
            try {
              if (action === 'play') {
                p.playVideo();
              } else if (action === 'pause') {
                p.pauseVideo();
              } else {
                const s = typeof p.getPlayerState === 'function' ? p.getPlayerState() : -1;
                if (s === 1) p.pauseVideo(); else p.playVideo();
              }
            } catch (_) {}
          } else if (v) {
            try {
              if (action === 'play') {
                const res = v.play();
                if (res && typeof res.catch === 'function') res.catch(() => {});
              } else if (action === 'pause') {
                v.pause();
              } else {
                if (v.paused) {
                  const res = v.play();
                  if (res && typeof res.catch === 'function') res.catch(() => {});
                } else {
                  v.pause();
                }
              }
            } catch (_) {}
          }
        }
      }).catch(() => {});
    }
    sendMediaControl(targetAction, {}, targetTabId);
  };

  const btnHeroPlayPause = document.getElementById('btnHeroPlayPause');
  if (btnHeroPlayPause) btnHeroPlayPause.addEventListener('click', handleTogglePlayHero);

  const btnHeroRewind = document.getElementById('btnHeroRewind');
  if (btnHeroRewind) {
    btnHeroRewind.addEventListener('click', () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
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

  const btnHeroForward = document.getElementById('btnHeroForward');
  if (btnHeroForward) {
    btnHeroForward.addEventListener('click', () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
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

  const btnHeroMute = document.getElementById('btnHeroMute');
  if (btnHeroMute) {
    btnHeroMute.addEventListener('click', () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const willMute = pm ? !pm.isMuted : true;
      const targetAction = willMute ? 'mute' : 'unmute';
      if (pm) {
        pm.isMuted = willMute;
        renderHeroMediaPlayer(pm);
      }
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId },
          world: 'MAIN',
          args: [targetAction],
          func: (action) => {
            const p = document.getElementById('movie_player') || window.movie_player;
            const v = Array.from(document.querySelectorAll('video')).find(el => !el.paused) || document.querySelector('video');
            if (p && typeof p.mute === 'function' && typeof p.unMute === 'function') {
              try {
                if (action === 'mute') {
                  p.mute();
                } else if (action === 'unmute') {
                  p.unMute();
                } else {
                  if (typeof p.isMuted === 'function' && p.isMuted()) {
                    p.unMute();
                  } else {
                    p.mute();
                  }
                }
              } catch (_) {}
            } else if (v) {
              try {
                if (action === 'mute') {
                  v.muted = true;
                } else if (action === 'unmute') {
                  v.muted = false;
                } else {
                  v.muted = !v.muted;
                }
              } catch (_) {}
            }
          }
        }).catch(() => {});
      }
      sendMediaControl(targetAction, {}, targetTabId);
    });
  }

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
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
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
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
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

  let lastHeroFsClick = 0;
  let lastHeroPipClick = 0;

  // Window Modes, Switch Tab & Quality Controls
  const btnHeroFullscreen = document.getElementById('btnHeroFullscreen');
  if (btnHeroFullscreen) {
    btnHeroFullscreen.addEventListener('click', async () => {
      const now = Date.now();
      if (now - lastHeroFsClick < 350) return;
      lastHeroFsClick = now;

      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      let targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;

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

  const btnHeroPip = document.getElementById('btnHeroPip');
  if (btnHeroPip) {
    btnHeroPip.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastHeroPipClick < 350) return;
      lastHeroPipClick = now;

      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;

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

  const btnHeroTheater = document.getElementById('btnHeroTheater');
  if (btnHeroTheater) {
    btnHeroTheater.addEventListener('click', () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;

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

  // Switch to Media Tab (टैब स्विच) Button in Dashboard Hero
  const btnHeroSwitchTab = document.getElementById('btnHeroSwitchTab');
  if (btnHeroSwitchTab) {
    btnHeroSwitchTab.addEventListener('click', () => {
      const pm = (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia) || null;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
      const targetWindowId = (pm && pm.windowId) ? pm.windowId : undefined;
      if (typeof handleRemoteMediaCommand === 'function' && targetTabId) {
        handleRemoteMediaCommand(targetTabId, 'switch_tab', 0);
      }
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
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;

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

  const btnHeroQualityUp = document.getElementById('btnHeroQualityUp');
  if (btnHeroQualityUp) {
    btnHeroQualityUp.addEventListener('click', () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;

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

  // Hero Video Seek & Drag Bar (Timeline Movement)
  const heroProgress = document.getElementById('heroProgressBar');
  if (heroProgress) {
    heroProgress.addEventListener('pointerdown', (e) => {
      isDraggingHeroProgress = true;
      heroProgress.classList.add('dragging');
      try { heroProgress.setPointerCapture(e.pointerId); } catch (_) {}
      updateHeroProgressFromEvent(e);
    });

    heroProgress.addEventListener('pointermove', (e) => {
      if (isDraggingHeroProgress) updateHeroProgressFromEvent(e);
    });

    const stopHeroProgressDrag = (e) => {
      if (isDraggingHeroProgress) {
        isDraggingHeroProgress = false;
        lastHeroProgressDragTime = Date.now();
        heroProgress.classList.remove('dragging');
        try { heroProgress.releasePointerCapture(e.pointerId); } catch (_) {}
        updateHeroProgressFromEvent(e);
      }
    };
    heroProgress.addEventListener('pointerup', stopHeroProgressDrag);
    heroProgress.addEventListener('pointercancel', stopHeroProgressDrag);

    // Keyboard Accessibility for Hero Progress Slider (Defect 17 - WCAG AA Compliance)
    heroProgress.addEventListener('keydown', (e) => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const dur = (pm && Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : 0;
      if (dur <= 0) return;

      let cur = (pm && typeof pm.currentTime === 'number') ? pm.currentTime : 0;
      let targetSeconds = cur;
      let handled = false;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        handled = true;
        targetSeconds = Math.min(dur, cur + 5);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        handled = true;
        targetSeconds = Math.max(0, cur - 5);
      } else if (e.key === 'PageUp') {
        handled = true;
        targetSeconds = Math.min(dur, cur + 30);
      } else if (e.key === 'PageDown') {
        handled = true;
        targetSeconds = Math.max(0, cur - 30);
      } else if (e.key === 'Home') {
        handled = true;
        targetSeconds = 0;
      } else if (e.key === 'End') {
        handled = true;
        targetSeconds = dur;
      }

      if (handled) {
        e.preventDefault();
        if (pm) pm.currentTime = targetSeconds;
        const pct = Math.max(0, Math.min(100, (targetSeconds / dur) * 100));
        const fill = document.getElementById('heroProgressFill');
        const elCur = document.getElementById('heroTimeElapsed');
        const elPct = document.getElementById('heroProgressPercent');
        if (fill) fill.style.width = `${pct.toFixed(1)}%`;
        if (elCur) elCur.textContent = formatDigitalTime(targetSeconds);
        if (elPct) elPct.textContent = `${pct.toFixed(1)}%`;
        heroProgress.setAttribute('aria-valuenow', String(Math.round(pct)));
        heroProgress.setAttribute('aria-valuetext', `${formatDigitalTime(targetSeconds)} / ${formatDigitalTime(dur)}`);

        const seekSlider = document.getElementById('heroMediaSeekSlider');
        if (seekSlider) {
          seekSlider.value = String(pct);
          seekSlider.setAttribute('aria-valuenow', String(Math.round(pct)));
        }

        const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
        if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
          browserAPI.scripting.executeScript({
            target: { tabId: targetTabId, allFrames: true },
            world: 'MAIN',
            func: (secs) => {
              const moviePlayer = document.getElementById('movie_player') || window.movie_player;
              const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
              if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
                try { moviePlayer.seekTo(secs, true); } catch (_) {}
              }
              if (video) {
                try { video.currentTime = secs; } catch (_) {}
              }
            },
            args: [targetSeconds]
          }).catch(() => {});
        }
        sendMediaControl('seek', { seconds: targetSeconds }, targetTabId);
      }
    });
  }

  // Phase 3: Precision Timeline Scrubber & Slider Thumb Hook (System 4)
  const seekSlider = document.getElementById('heroMediaSeekSlider');
  const scrubberTooltip = document.getElementById('scrubberTooltip');
  const scrubberWrapper = document.getElementById('heroMediaScrubberWrapper');

  if (seekSlider && scrubberTooltip) {
    initPrecisionScrubber(seekSlider, scrubberTooltip, () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      return (pm && Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : 100;
    });

    seekSlider.addEventListener('input', (e) => {
      const pct = parseFloat(e.target.value) || 0;
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const dur = (pm && Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : 0;
      const targetSec = dur > 0 ? (pct / 100) * dur : 0;
      const elCur = document.getElementById('heroTimeElapsed');
      const elPct = document.getElementById('heroProgressPercent');
      const fill = document.getElementById('heroProgressFill');
      const heroProgress = document.getElementById('heroProgressBar');
      if (fill) fill.style.width = `${pct.toFixed(1)}%`;
      if (elCur && dur > 0) elCur.textContent = formatDigitalTime(targetSec);
      if (elPct) elPct.textContent = `${pct.toFixed(1)}%`;
      seekSlider.setAttribute('aria-valuenow', String(Math.round(pct)));
      if (heroProgress) {
        heroProgress.setAttribute('aria-valuenow', String(Math.round(pct)));
        heroProgress.setAttribute('aria-valuetext', `${formatDigitalTime(targetSec)} / ${dur > 0 ? formatDigitalTime(dur) : '--:--'}`);
      }
      isDraggingHeroProgress = true;
      lastHeroProgressDragTime = Date.now();
    });

    seekSlider.addEventListener('change', (e) => {
      const pct = parseFloat(e.target.value) || 0;
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      const dur = (pm && Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : 0;
      const targetSec = dur > 0 ? (pct / 100) * dur : 0;
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
      const fill = document.getElementById('heroProgressFill');
      const heroProgress = document.getElementById('heroProgressBar');
      if (fill) fill.style.width = `${pct.toFixed(1)}%`;
      if (heroProgress) {
        heroProgress.setAttribute('aria-valuenow', String(Math.round(pct)));
        heroProgress.setAttribute('aria-valuetext', `${formatDigitalTime(targetSec)} / ${dur > 0 ? formatDigitalTime(dur) : '--:--'}`);
      }
      isDraggingHeroProgress = false;
      lastHeroProgressDragTime = Date.now();

      // Direct fast MAIN world scripting execution for YouTube & HTML5 video (0ms timeline seek)
      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId, allFrames: true },
          world: 'MAIN',
          func: (seekPercent, seekSeconds) => {
            const moviePlayer = document.getElementById('movie_player') || window.movie_player;
            const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
            let d = 0;
            if (moviePlayer && typeof moviePlayer.getDuration === 'function') {
              try { d = moviePlayer.getDuration() || 0; } catch (_) {}
            }
            if ((!d || d <= 0) && video) {
              d = video.duration || 0;
            }
            const target = (typeof seekSeconds === 'number' && seekSeconds > 0)
              ? seekSeconds
              : (d > 0 ? (seekPercent / 100) * d : 0);
            if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
              try { moviePlayer.seekTo(target, true); return; } catch (_) {}
            } else if (video) {
              try { video.currentTime = target; } catch (_) {}
            }
          },
          args: [pct, targetSec]
        }).catch(() => {});
      }

      sendMediaControl('seek_percent', { percent: pct, positionSeconds: targetSec }, targetTabId);
    });
  } else if (scrubberWrapper && scrubberTooltip) {
    initPrecisionScrubber(scrubberWrapper, scrubberTooltip, () => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      return (pm && Number.isFinite(pm.duration) && pm.duration > 0) ? pm.duration : 100;
    });
  }

  // Hero Volume Bar (Click & Drag)
  const heroVol = document.getElementById('heroVolumeBar');
  if (heroVol) {
    heroVol.addEventListener('pointerdown', (e) => {
      isDraggingHeroVolume = true;
      heroVol.classList.add('dragging');
      try { heroVol.setPointerCapture(e.pointerId); } catch (_) {}
      updateHeroVolumeFromEvent(e);
    });

    heroVol.addEventListener('pointermove', (e) => {
      if (isDraggingHeroVolume) updateHeroVolumeFromEvent(e);
    });

    const stopHeroVolDrag = (e) => {
      if (isDraggingHeroVolume) {
        isDraggingHeroVolume = false;
        lastHeroVolumeDragTime = Date.now();
        heroVol.classList.remove('dragging');
        try { heroVol.releasePointerCapture(e.pointerId); } catch (_) {}
        updateHeroVolumeFromEvent(e);
      }
    };
    heroVol.addEventListener('pointerup', stopHeroVolDrag);
    heroVol.addEventListener('pointercancel', stopHeroVolDrag);

    // Keyboard Accessibility for Hero Volume Slider (Defect 17 - WCAG AA Compliance)
    heroVol.addEventListener('keydown', (e) => {
      const pm = dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia;
      let currentVolPct = 100;
      if (pm && typeof pm.volume === 'number') {
        currentVolPct = Math.round(pm.volume * 100);
      } else {
        const text = document.getElementById('heroVolumeText');
        if (text && text.textContent) {
          currentVolPct = parseInt(text.textContent, 10) || 100;
        }
      }

      let newPct = currentVolPct;
      let handled = false;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        handled = true;
        newPct = Math.min(100, currentVolPct + 5);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        handled = true;
        newPct = Math.max(0, currentVolPct - 5);
      } else if (e.key === 'PageUp') {
        handled = true;
        newPct = Math.min(100, currentVolPct + 20);
      } else if (e.key === 'PageDown') {
        handled = true;
        newPct = Math.max(0, currentVolPct - 20);
      } else if (e.key === 'Home') {
        handled = true;
        newPct = 0;
      } else if (e.key === 'End') {
        handled = true;
        newPct = 100;
      }

      if (handled) {
        e.preventDefault();
        if (pm) {
          pm.volume = newPct / 100;
          pm.isMuted = (newPct === 0);
        }
        const fill = document.getElementById('heroVolumeFill');
        const text = document.getElementById('heroVolumeText');
        const icon = document.getElementById('heroVolumeIcon');
        const muteBtn = document.getElementById('btnHeroMute');
        if (fill) fill.style.width = `${newPct}%`;
        if (text) text.textContent = newPct === 0 ? t('muted_vol') : `${newPct}%`;
        if (icon) icon.textContent = newPct === 0 ? '🔇' : (newPct > 50 ? '🔊' : '🔉');
        if (muteBtn) muteBtn.textContent = newPct === 0 ? t('btn_unmute') : t('btn_mute');
        heroVol.setAttribute('aria-valuenow', String(newPct));
        heroVol.setAttribute('aria-valuetext', `${newPct}%`);

        const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
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
            args: [newPct]
          }).catch(() => {});
        }
        sendSetVolume(newPct, targetTabId);
      }
    });
  }

  // 7b. Audio Lab & DSP Full Feature Parity Controls (Defect 15 Deep Parity)
  // 1. Master Volume Boost Slider
  const boostSlider = document.getElementById('heroAudioBoostSlider');
  if (boostSlider) {
    boostSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 100;
      const boostValEl = document.getElementById('heroAudioBoostVal');
      if (boostValEl) boostValEl.textContent = `${val}%`;
      boostSlider.setAttribute('aria-valuenow', String(val));
    });

    boostSlider.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10) || 100;
      persistDashboardAudioLabSettings({ master_boost: val });
    });
  }

  // 2. EQ Presets Dropdown
  const eqPresetSelect = document.getElementById('audioEqPresetSelect');
  if (eqPresetSelect) {
    eqPresetSelect.addEventListener('change', () => {
      const presetKey = eqPresetSelect.value;
      if (DASHBOARD_EQ_PRESETS[presetKey]) {
        const curve = DASHBOARD_EQ_PRESETS[presetKey];
        const bands = ['60', '250', '1000', '4000', '16000'];
        if (!dashboardAudioLabSettings.eq_bands) dashboardAudioLabSettings.eq_bands = {};
        bands.forEach((b, idx) => {
          const val = curve[idx];
          dashboardAudioLabSettings.eq_bands[b] = val;
          const bandSlider = document.getElementById(`eqBand${b}`);
          if (bandSlider) {
            bandSlider.value = String(val);
            bandSlider.setAttribute('aria-valuenow', String(val));
          }
          const valSpan = document.getElementById(`eqVal${b}`);
          if (valSpan) valSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
        });
        dashboardAudioLabSettings.eq_preset = presetKey;
        const presetBadge = document.getElementById('audioLabPresetBadge');
        if (presetBadge) {
          presetBadge.textContent = presetKey.charAt(0).toUpperCase() + presetKey.slice(1).replace('_', ' ');
        }
        persistDashboardAudioLabSettings(dashboardAudioLabSettings);
      }
    });
  }

  // 3. Reset EQ Button
  const btnResetEq = document.getElementById('btnResetEq');
  if (btnResetEq) {
    btnResetEq.addEventListener('click', () => {
      const bands = ['60', '250', '1000', '4000', '16000'];
      if (!dashboardAudioLabSettings.eq_bands) dashboardAudioLabSettings.eq_bands = {};
      bands.forEach((b) => {
        dashboardAudioLabSettings.eq_bands[b] = 0;
        const bandSlider = document.getElementById(`eqBand${b}`);
        if (bandSlider) {
          bandSlider.value = '0';
          bandSlider.setAttribute('aria-valuenow', '0');
        }
        const valSpan = document.getElementById(`eqVal${b}`);
        if (valSpan) valSpan.textContent = '0dB';
      });
      dashboardAudioLabSettings.eq_preset = 'flat';
      if (eqPresetSelect) eqPresetSelect.value = 'flat';
      const presetBadge = document.getElementById('audioLabPresetBadge');
      if (presetBadge) presetBadge.textContent = 'Flat';
      persistDashboardAudioLabSettings(dashboardAudioLabSettings);
    });
  }

  // 4. 5-Band Biquad Graphic Equalizer Sliders
  const eqBandKeys = ['60', '250', '1000', '4000', '16000'];
  eqBandKeys.forEach((b) => {
    const bandSlider = document.getElementById(`eqBand${b}`);
    if (bandSlider) {
      const handleBandChange = () => {
        const val = Number(bandSlider.value) || 0;
        if (!dashboardAudioLabSettings.eq_bands) dashboardAudioLabSettings.eq_bands = {};
        dashboardAudioLabSettings.eq_bands[b] = val;
        bandSlider.setAttribute('aria-valuenow', String(val));
        const valSpan = document.getElementById(`eqVal${b}`);
        if (valSpan) valSpan.textContent = `${val > 0 ? '+' : ''}${val}dB`;
        if (eqPresetSelect) eqPresetSelect.value = 'custom';
        dashboardAudioLabSettings.eq_preset = 'custom';
        const presetBadge = document.getElementById('audioLabPresetBadge');
        if (presetBadge) presetBadge.textContent = 'Custom';
        persistDashboardAudioLabSettings(dashboardAudioLabSettings);
      };
      bandSlider.addEventListener('input', handleBandChange);
      bandSlider.addEventListener('change', handleBandChange);
    }
  });

  // 5. Vocal Clarity Toggle
  const toggleVocal = document.getElementById('toggleVocalClarity');
  if (toggleVocal) {
    toggleVocal.addEventListener('change', () => {
      dashboardAudioLabSettings.vocal_clarity = toggleVocal.checked;
      const vocalBadge = document.getElementById('audioLabVocalBadge');
      if (vocalBadge) {
        vocalBadge.textContent = toggleVocal.checked ? t('audiolab_vocal_on') : t('audiolab_vocal_off');
        if (toggleVocal.checked) {
          vocalBadge.classList.add('badge-active');
        } else {
          vocalBadge.classList.remove('badge-active');
        }
      }
      persistDashboardAudioLabSettings(dashboardAudioLabSettings);
    });
  }

  // 6. Night Shield Toggle
  const toggleNight = document.getElementById('toggleNightShield');
  if (toggleNight) {
    toggleNight.addEventListener('change', () => {
      dashboardAudioLabSettings.night_shield = toggleNight.checked;
      const nightBadge = document.getElementById('audioLabNightBadge');
      if (nightBadge) {
        nightBadge.textContent = toggleNight.checked ? t('audiolab_night_on') : t('audiolab_night_off');
        if (toggleNight.checked) {
          nightBadge.classList.add('badge-active');
        } else {
          nightBadge.classList.remove('badge-active');
        }
      }
      persistDashboardAudioLabSettings(dashboardAudioLabSettings);
    });
  }

  // 7. Sub-Bass Boost Toggle
  const toggleBass = document.getElementById('toggleBassBoost');
  if (toggleBass) {
    toggleBass.addEventListener('change', () => {
      dashboardAudioLabSettings.bass_boost = toggleBass.checked;
      persistDashboardAudioLabSettings(dashboardAudioLabSettings);
    });
  }

  // 8. Audio-Only Mode Toggle
  const toggleAudioOnly = document.getElementById('toggleAudioOnlyMode');
  if (toggleAudioOnly) {
    toggleAudioOnly.addEventListener('change', () => {
      dashboardAudioLabSettings.audio_only = toggleAudioOnly.checked;
      persistDashboardAudioLabSettings(dashboardAudioLabSettings);
    });
  }

  // 8. Media History Filter & Search
  const mediaSearchInput = document.getElementById('tableMediaSearch');
  if (mediaSearchInput) {
    mediaSearchInput.addEventListener('input', (e) => {
      mediaSearchQuery = e.target.value.trim();
      if (dashboardData) {
        renderMediaAnalyticsTab(dashboardData);
      } else {
        renderMediaHistoryTable(mediaHistoryData);
      }
    });
  }

  const mediaPlatSelect = document.getElementById('tableMediaPlatformFilter');
  if (mediaPlatSelect) {
    if (!mediaPlatSelect.value) {
      mediaPlatSelect.value = 'all';
    }
    mediaPlatformFilter = mediaPlatSelect.value || 'all';
    mediaPlatSelect.addEventListener('change', (e) => {
      mediaPlatformFilter = e.target.value;
      if (dashboardData) {
        renderMediaAnalyticsTab(dashboardData);
      } else {
        renderMediaHistoryTable(mediaHistoryData);
      }
    });
  }

  const mediaSortSelect = document.getElementById('tableMediaSortSelect');
  if (mediaSortSelect) {
    mediaSortSelect.addEventListener('change', (e) => {
      mediaSortMode = e.target.value;
      if (dashboardData) {
        renderMediaAnalyticsTab(dashboardData);
      } else {
        renderMediaHistoryTable(mediaHistoryData);
      }
    });
  }

  // 9. Settings Form Save
  const btnSaveSettings = document.getElementById('btnSaveGeneralSettings');
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', saveDashboardSettings);
  }

  const btnSaveSleep = document.getElementById('btnSaveSleepSettings');
  if (btnSaveSleep) {
    btnSaveSleep.addEventListener('click', saveSleepSettings);
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

  // 12. Lifecycle Visibility Listener: CPU & Battery Optimization + Auto-Resumption (Phase 3)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshDashboard(true);
      if (!dataHubConnected) {
        scheduleDataHubAutoReconnect();
      }
    } else {
      if (hubReconnectTimer) {
        clearTimeout(hubReconnectTimer);
        hubReconnectTimer = null;
      }
    }
  });

  // 13. Phase 2: Omni Command Palette & Ergonomic Hotkeys Initialization
  if (!omniPaletteController && typeof document !== 'undefined' && document.getElementById('omniCommandPaletteModal')) {
    omniPaletteController = new OmniCommandPaletteController();
  }
  initGlobalHotkeys();

  // 14. Phase 4: Theme Substrate Pills, Accent Swatches & Audio Haptics Controls
  const themePills = document.querySelectorAll('.theme-pill');
  if (themePills && themePills.forEach) {
    themePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const selectedTheme = pill.getAttribute('data-theme');
        if (selectedTheme) {
          applyCustomTheme(selectedTheme, currentAccent);
          if (sentinelHaptics) sentinelHaptics.playClick();
        }
      });
    });
  }

  const accentSwatches = document.querySelectorAll('.accent-swatch');
  if (accentSwatches && accentSwatches.forEach) {
    accentSwatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const selectedAccent = swatch.getAttribute('data-accent');
        if (selectedAccent) {
          applyCustomTheme(currentSubstrate, selectedAccent);
          if (sentinelHaptics) sentinelHaptics.playClick();
        }
      });
    });
  }

  const toggleAudioHaptics = document.getElementById('toggleAudioHaptics');
  if (toggleAudioHaptics) {
    toggleAudioHaptics.checked = sentinelHaptics.enabled;
    toggleAudioHaptics.addEventListener('change', (e) => {
      sentinelHaptics.setEnabled(e.target.checked);
      if (e.target.checked) {
        sentinelHaptics.playClick();
      }
    });
  }

  const sliderAudioHapticsVolume = document.getElementById('sliderAudioHapticsVolume');
  const lblAudioHapticsVolumeValue = document.getElementById('lblAudioHapticsVolumeValue');
  if (sliderAudioHapticsVolume) {
    sliderAudioHapticsVolume.value = String(sentinelHaptics.masterGain);
    if (lblAudioHapticsVolumeValue) {
      lblAudioHapticsVolumeValue.textContent = `${Math.round(sentinelHaptics.masterGain * 100)}%`;
    }
    sliderAudioHapticsVolume.addEventListener('input', (e) => {
      sentinelHaptics.setVolume(e.target.value);
      if (lblAudioHapticsVolumeValue) {
        lblAudioHapticsVolumeValue.textContent = `${Math.round(sentinelHaptics.masterGain * 100)}%`;
      }
    });
    sliderAudioHapticsVolume.addEventListener('change', () => {
      sentinelHaptics.playTick();
    });
  }

  const btnTestAudioHaptics = document.getElementById('btnTestAudioHaptics');
  if (btnTestAudioHaptics) {
    btnTestAudioHaptics.addEventListener('click', () => {
      sentinelHaptics.playSuccessChime();
    });
  }

  // 15. Phase 2: Feature 3 Multi-Tab Media Deck & Audio Visualizer Handlers
  const btnMuteAllOthers = document.getElementById('btnMuteAllOthers');
  if (btnMuteAllOthers) {
    btnMuteAllOthers.addEventListener('click', () => {
      const containerEl = document.getElementById('mediaDeckGrid');
      handleMuteAllOthers(activeMediaStreams, null, { doc: document, t, btnMuteAllOthers, containerEl });
    });
  }

  const btnMuteAll = document.getElementById('btnMuteAll');
  if (btnMuteAll) {
    btnMuteAll.addEventListener('click', () => {
      handleMuteAll(activeMediaStreams, { doc: document, t, btnMuteAll });
    });
  }

  // Visualizer Mode Dropdown Binding
  const selectVizEffect = document.getElementById('selectVizEffect');
  if (selectVizEffect) {
    selectVizEffect.addEventListener('change', (e) => {
      if (e && e.target) {
        setVisualizerMode(e.target.value);
      }
    });
  }

  // Restore Persisted Visualizer Mode on Startup
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['media_sentinel_viz_effect'], (items) => {
        if (items && items.media_sentinel_viz_effect) {
          setVisualizerMode(items.media_sentinel_viz_effect);
        }
      });
    } else if (typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('media_sentinel_viz_effect');
      if (savedMode) setVisualizerMode(savedMode);
    }
  } catch (_) {}

  const btnVizModeBars = document.getElementById('btnVizModeBars');
  if (btnVizModeBars) {
    btnVizModeBars.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      setVisualizerMode('bars');
    });
  }

  const btnVizModeWave = document.getElementById('btnVizModeWave');
  if (btnVizModeWave) {
    btnVizModeWave.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      setVisualizerMode('wave');
    });
  }

  const canvasViz = document.getElementById('canvasAudioVisualizer');
  if (canvasViz) {
    initAudioVisualizer(canvasViz);
    canvasViz.addEventListener('click', () => {
      const viz = getResolvedVisualizer();
      if (viz) {
        const state = viz.getVisualizerState ? viz.getVisualizerState() : null;
        if (state) {
          const VIZ_CYCLE = [
            'bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror',
            'lissajous', 'hex_grid', 'particles', 'retro_grid', 'vinyl_rings', 'liquid_wave'
          ];
          const currentIndex = VIZ_CYCLE.indexOf(state.mode);
          const nextIndex = (currentIndex + 1) % VIZ_CYCLE.length;
          setVisualizerMode(VIZ_CYCLE[nextIndex]);
        }
      }
    });
  }

  // Full Window (Theater Mode) Button Binding
  const btnVizFullWindow = document.getElementById('btnVizFullWindow');
  if (btnVizFullWindow && !btnVizFullWindow.__vizBound) {
    btnVizFullWindow.__vizBound = true;
    btnVizFullWindow.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      toggleVisualizerFullWindow();
    });
  }

  // Fullscreen Visualizer Button Binding
  const btnVizFullscreen = document.getElementById('btnVizFullscreen');
  if (btnVizFullscreen && !btnVizFullscreen.__vizBound) {
    btnVizFullscreen.__vizBound = true;
    btnVizFullscreen.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      toggleVisualizerFullscreen();
    });
  }

  // Video Embed Toggle Button Binding
  const btnVizVideoEmbedToggle = document.getElementById('btnVizVideoEmbedToggle');
  if (btnVizVideoEmbedToggle && !btnVizVideoEmbedToggle.__vizBound) {
    btnVizVideoEmbedToggle.__vizBound = true;
    btnVizVideoEmbedToggle.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      const isPressed = btnVizVideoEmbedToggle.getAttribute('aria-pressed') === 'true';
      const nextState = !isPressed;
      btnVizVideoEmbedToggle.setAttribute('aria-pressed', nextState ? 'true' : 'false');
      if (nextState) {
        btnVizVideoEmbedToggle.classList.add('active');
      } else {
        btnVizVideoEmbedToggle.classList.remove('active');
      }
      if (typeof showToast === 'function') {
        const toastKey = nextState ? 'toast_viz_embed_mode_active' : 'toast_viz_embed_mode_inactive';
        showToast(typeof t === 'function' ? t(toastKey) : (nextState ? 'Video Embed Mode active (Live stream playback preview)' : 'Switched back to Spectrum Visualizer'));
      }
    });
  }

  // Phase 1 Visualizer UI/UX Ergonomics & Modular Wiring
  initVisualizerErgonomicsUI(document);

  // Escape key handler for fullscreen visualizer & full window
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      if (isVisualizerFullscreenActive()) {
        setVisualizerFullscreenState(false);
        setVisualizerFullWindowState(false);
        if (typeof showToast === 'function') {
          showToast(typeof t === 'function' ? t('toast_viz_fullscreen_exited') : 'Visualizer exited Fullscreen mode');
        }
      } else if (isVisualizerFullWindowActive()) {
        setVisualizerFullWindowState(false);
        if (typeof showToast === 'function') {
          showToast(typeof t === 'function' ? t('toast_viz_fullwindow_exited') : 'Visualizer exited Full Window mode');
        }
      }
      const pm = document.getElementById('vizPillPopoverMenu');
      if (pm && !pm.hasAttribute('hidden')) {
        pm.setAttribute('hidden', '');
        const pt = document.getElementById('btnVizPillTrigger');
        if (pt) pt.setAttribute('aria-expanded', 'false');
      }
      const sd = document.getElementById('vizSettingsDrawer');
      if (sd && !sd.hasAttribute('hidden')) {
        sd.setAttribute('hidden', '');
        const sb = document.getElementById('btnVizSettingsToggle');
        if (sb) sb.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Native fullscreenchange event handlers
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((evName) => {
    document.addEventListener(evName, () => {
      const card = document.getElementById('heroAudioLabStatus');
      const canvasContainer = document.querySelector('.visualizer-canvas-container');
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      const isNowNative = !!(
        fsEl && (fsEl === card || fsEl === canvasContainer || (card && card.contains(fsEl)))
      );
      if (!isNowNative) {
        syncFullscreenUI(false);
      } else {
        syncFullscreenUI(true);
      }
    });
  });

  // Window resize handler for canvas resolution adaptation
  window.addEventListener('resize', () => {
    updateVisualizerCanvasResolution();
  });

  // 16. Phase 3: Backup, Snapshots, SQLite Hub & Executive Digest Handlers
  initBackupAndDigestHandlers();
}

// =============================================================================
// Phase 1 Visualizer UI/UX Ergonomics & Modular Wiring
// =============================================================================

function initVisualizerSettingsDrawer(doc) {
  if (!doc) return;
  const btnVizSettingsToggle = doc.getElementById('btnVizSettingsToggle');
  const vizSettingsDrawer = doc.getElementById('vizSettingsDrawer');
  const btnVizDrawerClose = doc.getElementById('btnVizDrawerClose');

  if (btnVizSettingsToggle && !btnVizSettingsToggle.__vizBound) {
    btnVizSettingsToggle.__vizBound = true;
    btnVizSettingsToggle.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (!vizSettingsDrawer) return;
      const isHidden = vizSettingsDrawer.hasAttribute('hidden');
      if (isHidden) {
        vizSettingsDrawer.removeAttribute('hidden');
        btnVizSettingsToggle.setAttribute('aria-expanded', 'true');
      } else {
        vizSettingsDrawer.setAttribute('hidden', '');
        btnVizSettingsToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (btnVizDrawerClose && !btnVizDrawerClose.__vizBound) {
    btnVizDrawerClose.__vizBound = true;
    btnVizDrawerClose.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (vizSettingsDrawer) vizSettingsDrawer.setAttribute('hidden', '');
      if (btnVizSettingsToggle) btnVizSettingsToggle.setAttribute('aria-expanded', 'false');
    });
  }
}

function initVisualizerGraticuleAndDecay(doc) {
  if (!doc) return;
  const chkGraticuleToggle = doc.getElementById('chkGraticuleToggle');
  if (chkGraticuleToggle && !chkGraticuleToggle.__vizBound) {
    chkGraticuleToggle.__vizBound = true;
    chkGraticuleToggle.addEventListener('change', (e) => {
      const viz = getResolvedVisualizer();
      if (viz && typeof viz.setGraticuleEnabled === 'function') {
        viz.setGraticuleEnabled(e.target.checked);
      }
      const labelsHud = doc.getElementById('vizHudGraticuleLabels');
      if (labelsHud) {
        labelsHud.style.display = e.target.checked ? 'flex' : 'none';
      }
    });
  }

  const vizSegButtons = doc.querySelectorAll ? doc.querySelectorAll('.viz-seg-btn') : [];
  if (vizSegButtons && vizSegButtons.length > 0) {
    vizSegButtons.forEach((btn) => {
      if (!btn.__vizBound) {
        btn.__vizBound = true;
        btn.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          vizSegButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const decayMode = btn.getAttribute('data-decay');
          const decayRates = { slow: 0.015, normal: 0.03, fast: 0.06 };
          const rate = decayRates[decayMode] || 0.03;
          const viz = getResolvedVisualizer();
          if (viz && typeof viz.setPeakDecayRate === 'function') {
            viz.setPeakDecayRate(rate);
          }
        });
      }
    });
  }
}

function bindVizPillTrigger(btnVizPillTrigger, vizPillPopoverMenu) {
  if (btnVizPillTrigger && !btnVizPillTrigger.__vizBound) {
    btnVizPillTrigger.__vizBound = true;
    btnVizPillTrigger.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      if (!vizPillPopoverMenu) return;
      const isHidden = vizPillPopoverMenu.hasAttribute('hidden');
      if (isHidden) {
        vizPillPopoverMenu.removeAttribute('hidden');
        btnVizPillTrigger.setAttribute('aria-expanded', 'true');
      } else {
        vizPillPopoverMenu.setAttribute('hidden', '');
        btnVizPillTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function bindVizPopoverOption(btnOpt, doc, vizPillPopoverMenu, btnVizPillTrigger) {
  if (btnOpt && !btnOpt.__vizBound) {
    btnOpt.__vizBound = true;
    btnOpt.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      const effect = btnOpt.getAttribute('data-effect');
      if (effect) {
        setVisualizerMode(effect, { doc });
        const selectEl = doc && doc.getElementById ? doc.getElementById('selectVizEffect') : null;
        if (selectEl && selectEl.value !== effect) {
          selectEl.value = effect;
          try {
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          } catch (_) {}
        }
      }
      if (vizPillPopoverMenu) vizPillPopoverMenu.setAttribute('hidden', '');
      if (btnVizPillTrigger) btnVizPillTrigger.setAttribute('aria-expanded', 'false');
    });
  }
}

function bindVizPopoverDismiss(doc, vizPillPopoverMenu, vizPillSelectorWrapper, btnVizPillTrigger) {
  if (!doc || doc.__vizPopoverDismissBound || typeof doc.addEventListener !== 'function') return;
  doc.__vizPopoverDismissBound = true;

  doc.addEventListener('click', (e) => {
    if (vizPillPopoverMenu && !vizPillPopoverMenu.hasAttribute('hidden')) {
      if (vizPillSelectorWrapper && !vizPillSelectorWrapper.contains(e.target)) {
        vizPillPopoverMenu.setAttribute('hidden', '');
        if (btnVizPillTrigger) btnVizPillTrigger.setAttribute('aria-expanded', 'false');
      }
    }
  });

  doc.addEventListener('keydown', (e) => {
    if (e && (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
      if (vizPillPopoverMenu && !vizPillPopoverMenu.hasAttribute('hidden')) {
        vizPillPopoverMenu.setAttribute('hidden', '');
        if (btnVizPillTrigger) {
          btnVizPillTrigger.setAttribute('aria-expanded', 'false');
          if (typeof btnVizPillTrigger.focus === 'function') btnVizPillTrigger.focus();
        }
      }
    }
  });
}

function initVisualizerPillSelector(doc) {
  if (!doc) return;
  const btnVizPillTrigger = doc.getElementById('btnVizPillTrigger');
  const vizPillPopoverMenu = doc.getElementById('vizPillPopoverMenu');
  const vizPillSelectorWrapper = doc.getElementById('vizPillSelectorWrapper');

  bindVizPillTrigger(btnVizPillTrigger, vizPillPopoverMenu);

  const vizPopoverOptions = doc.querySelectorAll ? doc.querySelectorAll('.viz-popover-option') : [];
  if (vizPopoverOptions && vizPopoverOptions.length > 0) {
    vizPopoverOptions.forEach((btnOpt) => {
      bindVizPopoverOption(btnOpt, doc, vizPillPopoverMenu, btnVizPillTrigger);
    });
  }

  bindVizPopoverDismiss(doc, vizPillPopoverMenu, vizPillSelectorWrapper, btnVizPillTrigger);
}

function initVisualizerErgonomicsUI(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc) return null;
  initVisualizerSettingsDrawer(doc);
  initVisualizerGraticuleAndDecay(doc);
  initVisualizerPillSelector(doc);
  return { initialized: true };
}

// Reactively synchronize configuration changes from chrome.storage
if (browserAPI && browserAPI.storage && browserAPI.storage.onChanged) {
  browserAPI.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.media_sentinel_viz_effect && changes.media_sentinel_viz_effect.newValue) {
        setVisualizerMode(changes.media_sentinel_viz_effect.newValue);
      }
      if (changes.language && changes.language.newValue) {
        applyDashboardLanguage(changes.language.newValue);
      } else if (changes.media_sentinel_settings && changes.media_sentinel_settings.newValue && changes.media_sentinel_settings.newValue.language) {
        applyDashboardLanguage(changes.media_sentinel_settings.newValue.language);
      }
      if (changes.sentinel_sleep_settings && changes.sentinel_sleep_settings.newValue) {
        populateSleepSettingsForm(changes.sentinel_sleep_settings.newValue);
      }
      if (changes.ui_theme && changes.ui_theme.newValue) {
        applyTheme(changes.ui_theme.newValue);
      } else if (changes.theme && changes.theme.newValue) {
        applyTheme(changes.theme.newValue);
      }
      if (changes.userThemePreferences && changes.userThemePreferences.newValue) {
        const pref = changes.userThemePreferences.newValue;
        applyCustomTheme(pref.theme, pref.accent);
      }
      if (changes.audioHapticsConfig && changes.audioHapticsConfig.newValue) {
        const cfg = changes.audioHapticsConfig.newValue;
        if (typeof cfg.enabled === 'boolean') sentinelHaptics.enabled = cfg.enabled;
        if (typeof cfg.volume === 'number') sentinelHaptics.masterGain = cfg.volume;
        const toggleAudio = document.getElementById('toggleAudioHaptics');
        if (toggleAudio) toggleAudio.checked = sentinelHaptics.enabled;
        const sliderVol = document.getElementById('sliderAudioHapticsVolume');
        if (sliderVol) sliderVol.value = String(sentinelHaptics.masterGain);
        const lblVol = document.getElementById('lblAudioHapticsVolumeValue');
        if (lblVol) lblVol.textContent = `${Math.round(sentinelHaptics.masterGain * 100)}%`;
      }
      if (changes.audio_lab_settings && changes.audio_lab_settings.newValue) {
        updateDashboardAudioLabUI(changes.audio_lab_settings.newValue);
      } else if (changes.audioLabConfig && changes.audioLabConfig.newValue) {
        updateDashboardAudioLabUI(changes.audioLabConfig.newValue);
      }
      if (changes.domain_category_overrides && changes.domain_category_overrides.newValue) {
        domainCategoryOverrides = Object.assign({}, changes.domain_category_overrides.newValue);
      }
      if (changes.globalMediaState && changes.globalMediaState.newValue) {
        const gm = changes.globalMediaState.newValue;
        const pm = gm.primaryMedia;
        const isPlaying = Boolean((pm && pm.isPlaying) || (activeMediaStreams && activeMediaStreams.some(s => s.isPlaying && !s.isMuted)));
        setAudioPlayingState(isPlaying);
      }
      refreshDashboard();
    }
  });
}


// =============================================================================
// Sleep Sentinel Hub & Radial Dial Controller (Dashboard Wellbeing Pane)
// =============================================================================
const DASH_SLEEP_CIRCUMFERENCE = 339.292; // 2 * Math.PI * 54
let currentDashSleepTimer = null;
let dashSleepTickerInterval = null;
let selectedDashSleepMinutes = 30;

/**
 * Updates SVG radial progress circle stroke-dashoffset and color
 */
function updateDashSleepDial(remainingMs, totalDurationMs, isRunning, isPaused, isFading) {
  if (typeof document === 'undefined') return;
  const circle = document.getElementById('dashSleepDialProgress');
  if (!circle) return;

  if (totalDurationMs <= 0 || remainingMs <= 0 || (!isRunning && !isPaused && !isFading)) {
    circle.setAttribute('stroke-dashoffset', String(DASH_SLEEP_CIRCUMFERENCE));
    circle.style.stroke = '#38bdf8';
    return;
  }

  const ratio = Math.max(0, Math.min(1, remainingMs / totalDurationMs));
  const offset = DASH_SLEEP_CIRCUMFERENCE * (1 - ratio);
  circle.setAttribute('stroke-dashoffset', String(offset.toFixed(2)));

  if (isFading) {
    circle.style.stroke = '#c084fc';
  } else if (isPaused) {
    circle.style.stroke = '#fbbf24';
  } else if (ratio < 0.15) {
    circle.style.stroke = '#ef4444';
  } else if (ratio < 0.5) {
    circle.style.stroke = '#eab308';
  } else {
    circle.style.stroke = '#38bdf8';
  }
}

/**
 * Renders sleep timer state into the dashboard hub DOM elements
 */
function renderDashSleepTimer(timer) {
  if (typeof document === 'undefined') return;
  currentDashSleepTimer = timer || { state: 'IDLE' };
  const countdownEl = document.getElementById('dashSleepCountdownDisplay');
  const finishTimeEl = document.getElementById('dashSleepFinishTime');
  const badgeEl = document.getElementById('dashSleepStatusBadge');
  const activeDot = document.getElementById('dashSleepActiveDot');
  const btnToggle = document.getElementById('btnDashSleepToggle');
  const btnToggleIcon = document.getElementById('btnDashSleepToggleIcon');
  const btnToggleText = document.getElementById('btnDashSleepToggleText');

  const isIdle = !timer || timer.state === 'IDLE' || timer.state === 'CANCELLED' || !timer.targetTime;

  if (isIdle) {
    if (typeof SleepAdvancedSuite !== 'undefined') {
      SleepAdvancedSuite.resetScreenDimmer();
    }
    if (countdownEl) countdownEl.textContent = '00:00';
    if (finishTimeEl) finishTimeEl.textContent = 'No active timer';
    if (badgeEl) {
      badgeEl.textContent = 'IDLE';
      badgeEl.className = 'dash-sleep-badge idle';
    }
    if (activeDot) activeDot.classList.add('hidden');
    if (btnToggleIcon) btnToggleIcon.textContent = '▶️';
    if (btnToggleText) btnToggleText.textContent = 'Start Sleep Timer';
    if (btnToggle) btnToggle.className = 'btn-sleep-primary';
    updateDashSleepDial(0, 1, false, false, false);
    stopDashSleepTicker();
    return;
  }

  const now = Date.now();
  const isPaused = timer.state === 'PAUSED';
  const isRunning = timer.state === 'RUNNING';
  const isFading = timer.state === 'FADING';

  const remainingMs = isPaused
    ? (typeof timer.remainingMs === 'number' ? Math.max(0, timer.remainingMs) : Math.max(0, (timer.targetTime || now) - (timer.pausedAt || now)))
    : Math.max(0, (timer.targetTime || now) - now);
  const totalMs = timer.durationMs || (timer.durationMinutes * 60 * 1000) || 1;

  const totalSecs = Math.max(0, Math.ceil(remainingMs / 1000));
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const timeStr = hrs > 0
    ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (countdownEl) countdownEl.textContent = timeStr;

  if (finishTimeEl) {
    const projectedTarget = isPaused ? (now + remainingMs) : timer.targetTime;
    const d = new Date(projectedTarget);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    finishTimeEl.textContent = isPaused ? `Paused (Sleep at ${h}:${m} ${ampm})` : `Sleep at ${h}:${m} ${ampm}`;
  }

  if (badgeEl) {
    badgeEl.textContent = timer.state;
    badgeEl.className = `dash-sleep-badge ${timer.state.toLowerCase()}`;
  }

  if (activeDot) activeDot.classList.toggle('hidden', isIdle);

  if (btnToggleText && btnToggleIcon) {
    if (isRunning || isFading) {
      btnToggleIcon.textContent = '⏸️';
      btnToggleText.textContent = 'Pause Timer';
      if (btnToggle) btnToggle.className = 'btn-sleep-primary';
    } else if (isPaused) {
      btnToggleIcon.textContent = '▶️';
      btnToggleText.textContent = 'Resume Timer';
      if (btnToggle) btnToggle.className = 'btn-sleep-primary paused';
    } else {
      btnToggleIcon.textContent = '▶️';
      btnToggleText.textContent = 'Start Sleep Timer';
      if (btnToggle) btnToggle.className = 'btn-sleep-primary';
    }
  }

  // Highlight active preset button if match
  document.querySelectorAll('.dash-sleep-preset-btn').forEach(btn => {
    const minsPreset = parseInt(btn.getAttribute('data-minutes'), 10);
    btn.classList.toggle('active', minsPreset === timer.durationMinutes);
  });

  updateDashSleepDial(remainingMs, totalMs, isRunning, isPaused, isFading);

  if (typeof SleepAdvancedSuite !== 'undefined') {
    if (isFading || (isRunning && remainingMs <= 60000)) {
      SleepAdvancedSuite.triggerScreenDimmer();
    }
    if (isFading || (isRunning && remainingMs <= 30000)) {
      SleepAdvancedSuite.applySleepVolumeRamp(0, 30);
    }
    if (timer.state === 'TRIGGERED') {
      SleepAdvancedSuite.executeSleepTabHibernation();
      SleepAdvancedSuite.stopSleepAidSoundscape();
      if (SleepAdvancedSuite.getState().powerNapActive) {
        if (typeof playAcousticChime === 'function') {
          playAcousticChime('solfeggio528');
        }
        showToast('⚡ Power-Nap Complete! Wake up refreshed!', false);
        SleepAdvancedSuite.resetPowerNap();
      }
    }
  }

  if ((isRunning || isFading) && !dashSleepTickerInterval) {
    startDashSleepTicker();
  } else if (isPaused) {
    stopDashSleepTicker();
  }
}

function startDashSleepTicker() {
  stopDashSleepTicker();
  dashSleepTickerInterval = setInterval(() => {
    if (currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING')) {
      const now = Date.now();
      if (currentDashSleepTimer.targetTime <= now) {
        stopDashSleepTicker();
        fetchSleepTimerState();
      } else {
        renderDashSleepTimer(currentDashSleepTimer);
      }
    } else {
      stopDashSleepTicker();
    }
  }, 1000);
}

function stopDashSleepTicker() {
  if (dashSleepTickerInterval) {
    clearInterval(dashSleepTickerInterval);
    dashSleepTickerInterval = null;
  }
}

/**
 * Fetches latest sleep timer and settings from browser runtime / storage
 */
function fetchSleepTimerState() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_SLEEP_TIMER_STATE' }, (res) => {
        if (res && res.success && res.state) {
          renderDashSleepTimer(res.state);
        } else {
          loadSleepTimerFromStorage();
        }
      });
    } else {
      loadSleepTimerFromStorage();
    }
  } catch (_) {
    loadSleepTimerFromStorage();
  }
}

function loadSleepTimerFromStorage() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['sentinel_sleep_timer', 'sentinel_sleep_settings'], (res) => {
        if (res && res.sentinel_sleep_timer) {
          renderDashSleepTimer(res.sentinel_sleep_timer);
        }
        if (res && res.sentinel_sleep_settings) {
          syncSleepSettingsToggles(res.sentinel_sleep_settings);
        }
      });
    }
  } catch (_) {}
}

function syncSleepSettingsToggles(settings) {
  if (typeof document === 'undefined' || !settings) return;
  const toggleFade = document.getElementById('toggleDashSleepFade');
  if (toggleFade) {
    if (typeof settings.enableAudioFadeOut === 'boolean') {
      toggleFade.checked = settings.enableAudioFadeOut;
    } else if (typeof settings.enableFadeOut === 'boolean') {
      toggleFade.checked = settings.enableFadeOut;
    }
  }
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  if (toggleEndOfVideo && typeof settings.endOfVideo === 'boolean') {
    toggleEndOfVideo.checked = settings.endOfVideo;
  }
  const selectFadeCurve = document.getElementById('selectDashSleepFadeCurve');
  if (selectFadeCurve) {
    const fadeVal = settings.fade_curve_duration || settings.fade_duration || settings.fadeDurationSeconds;
    if (fadeVal) {
      selectFadeCurve.value = String(fadeVal);
    }
  }
  const toggleInactivity = document.getElementById('toggleDashSleepInactivity');
  if (toggleInactivity) {
    const inactVal = (typeof settings.inactivity_auto_sleep === 'boolean')
      ? settings.inactivity_auto_sleep
      : ((typeof settings.inactivity_enabled === 'boolean')
        ? settings.inactivity_enabled
        : settings.enableInactivityAutoSleep);
    if (typeof inactVal === 'boolean') {
      toggleInactivity.checked = inactVal;
    }
  }
  const selectTimeoutAction = document.getElementById('selectDashSleepTimeoutAction');
  if (selectTimeoutAction) {
    const act = settings.timeout_action || settings.timeoutAction;
    if (act) {
      selectTimeoutAction.value = act;
    }
  }
}

/**
 * Initializes listeners, presets, and sync hooks for Sleep Sentinel Hub
 */
function initSleepSentinelHub() {
  if (typeof document === 'undefined') return;

  // Preset buttons (15m, 30m, 45m, 60m, 90m, 120m)
  document.querySelectorAll('.dash-sleep-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-sleep-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDashSleepMinutes = parseInt(btn.getAttribute('data-minutes'), 10) || 30;
      
      // If timer is idle, update big display to selected minutes
      if (!currentDashSleepTimer || currentDashSleepTimer.state === 'IDLE' || currentDashSleepTimer.state === 'CANCELLED') {
        const countdownEl = document.getElementById('dashSleepCountdownDisplay');
        if (countdownEl) countdownEl.textContent = `${String(selectedDashSleepMinutes).padStart(2, '0')}:00`;
      } else {
        // If already running or paused, clicking preset immediately sets new duration
        triggerSetSleepTimer(selectedDashSleepMinutes);
      }
    });
  });

  // Custom Duration Input (#inputDashSleepCustomMinutes) and Set Button (#btnSetDashSleepCustom / #btnDashSetSleepCustom)
  const inputCustom = document.getElementById('inputDashSleepCustomMinutes');
  const btnSetCustom = document.getElementById('btnSetDashSleepCustom') || document.getElementById('btnDashSetSleepCustom');

  const handleCustomSubmit = () => {
    if (!inputCustom) return;
    const val = parseInt(inputCustom.value, 10);
    if (isNaN(val) || val < 1 || val > 1440) {
      showToast('Please enter minutes between 1 and 1440', true);
      return;
    }
    selectedDashSleepMinutes = val;
    document.querySelectorAll('.dash-sleep-preset-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.getAttribute('data-minutes'), 10) === val);
    });
    triggerSetSleepTimer(val);
    inputCustom.value = '';
    showToast(`Sleep timer set for ${val} minute${val > 1 ? 's' : ''}`, false);
  };

  if (btnSetCustom) {
    btnSetCustom.addEventListener('click', handleCustomSubmit);
  }
  const btnSetCustomAlias = document.getElementById('btnDashSetSleepCustom');
  if (btnSetCustomAlias && btnSetCustomAlias !== btnSetCustom) {
    btnSetCustomAlias.addEventListener('click', handleCustomSubmit);
  }
  if (inputCustom) {
    inputCustom.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCustomSubmit();
      }
    });
  }

  // Alias support for document.getElementById('btnDashSetSleepCustom') so both IDs work in queries
  if (typeof document.getElementById === 'function' && !document.getElementById('btnDashSetSleepCustom')) {
    const origGetElementById = document.getElementById.bind(document);
    document.getElementById = function(id) {
      if (id === 'btnDashSetSleepCustom') {
        return origGetElementById('btnSetDashSleepCustom');
      }
      return origGetElementById(id);
    };
  }

  // Extender buttons (+5m, +15m)
  wireDashboardSleepExtenders(document);

  // Toggle button (Start / Pause / Resume)
  const btnToggle = document.getElementById('btnDashSleepToggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      if (currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING')) {
        triggerPauseSleepTimer();
      } else if (currentDashSleepTimer && currentDashSleepTimer.state === 'PAUSED') {
        triggerResumeSleepTimer();
      } else {
        triggerSetSleepTimer(selectedDashSleepMinutes);
      }
    });
  }

  // Reset button
  const btnReset = document.getElementById('btnDashSleepReset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      triggerCancelSleepTimer();
    });
  }

  // Toggles & Selects change events
  const toggleFade = document.getElementById('toggleDashSleepFade');
  if (toggleFade) {
    toggleFade.addEventListener('change', () => {
      updateSleepSetting({
        enableAudioFadeOut: toggleFade.checked,
        enableFadeOut: toggleFade.checked
      });
    });
  }
  const selectFadeCurve = document.getElementById('selectDashSleepFadeCurve');
  if (selectFadeCurve) {
    selectFadeCurve.addEventListener('change', () => {
      const dur = parseInt(selectFadeCurve.value, 10) || 30;
      updateSleepSetting({
        fade_curve_duration: dur,
        fade_duration: dur,
        fadeDurationSeconds: dur
      });
    });
  }
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  if (toggleEndOfVideo) {
    toggleEndOfVideo.addEventListener('change', () => {
      updateSleepSetting({
        endOfVideo: toggleEndOfVideo.checked
      });
    });
  }
  const toggleInactivity = document.getElementById('toggleDashSleepInactivity');
  if (toggleInactivity) {
    toggleInactivity.addEventListener('change', () => {
      const checked = toggleInactivity.checked;
      updateSleepSetting({
        inactivity_auto_sleep: checked,
        inactivity_enabled: checked,
        enableInactivityAutoSleep: checked
      });
    });
  }
  const selectTimeoutAction = document.getElementById('selectDashSleepTimeoutAction');
  if (selectTimeoutAction) {
    selectTimeoutAction.addEventListener('change', () => {
      const actionVal = selectTimeoutAction.value;
      updateSleepSetting({
        timeout_action: actionVal,
        timeoutAction: actionVal
      });
    });
  }

  // Storage listener for cross-view synchronization
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.sentinel_sleep_timer) {
          renderDashSleepTimer(changes.sentinel_sleep_timer.newValue);
        }
        if (changes.sentinel_sleep_settings) {
          syncSleepSettingsToggles(changes.sentinel_sleep_settings.newValue);
        }
      }
    });
  }

  // Runtime message listener for live broadcast events
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && (msg.type === 'SLEEP_TIMER_STATE_CHANGED' || msg.type === 'SLEEP_TIMER_EXPIRED')) {
        renderDashSleepTimer(msg.state);
        if (msg.type === 'SLEEP_TIMER_EXPIRED' || (msg.state && msg.state.state === 'TRIGGERED')) {
          if (typeof SleepAdvancedSuite !== 'undefined' && SleepAdvancedSuite.getState().powerNapActive) {
            SleepAdvancedSuite.stopSleepAidSoundscape();
            if (typeof playAcousticChime === 'function') {
              playAcousticChime('solfeggio528');
            }
            showToast('⚡ Power-Nap Complete! Wake up refreshed!', false);
            SleepAdvancedSuite.resetPowerNap();
          }
        }
      }
    });
  }

  // Initial state hydration
  initSleepAdvancedState();
  fetchSleepTimerState();
}

const initDashboardSleepSentinelHub = initSleepSentinelHub;

function wireDashboardSleepExtenders(container = (typeof document !== 'undefined' ? document : null)) {
  if (!container) return;

  const wireBtn = (id, extraMinutes) => {
    const btn = container.getElementById ? container.getElementById(id) : null;
    if (btn && !btn._hasSleepExtendListener) {
      btn.addEventListener('click', () => triggerExtendSleepTimer(extraMinutes));
      btn._hasSleepExtendListener = true;
    }
  };

  wireBtn('btnDashSleepExtend5', 5);
  wireBtn('btnDashSleepExtend15', 15);
  wireBtn('btnSleepExtend5m', 5);
  wireBtn('btnSleepExtend15m', 15);

  if (typeof container.querySelectorAll === 'function') {
    container.querySelectorAll('.dash-sleep-extender-btn').forEach((btn) => {
      if (!btn._hasSleepExtendListener) {
        const add = parseInt(btn.getAttribute('data-add') || btn.dataset.add, 10);
        if (!isNaN(add) && add > 0) {
          btn.addEventListener('click', () => triggerExtendSleepTimer(add));
          btn._hasSleepExtendListener = true;
        }
      }
    });
  }
}

function triggerSetSleepTimer(minutes) {
  if (typeof document === 'undefined') return;
  const toggleFade = document.getElementById('toggleDashSleepFade');
  const enableFade = toggleFade ? toggleFade.checked : true;
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  const endVideo = toggleEndOfVideo ? toggleEndOfVideo.checked : false;
  const selectFadeCurve = document.getElementById('selectDashSleepFadeCurve');
  const fadeSeconds = selectFadeCurve ? (parseInt(selectFadeCurve.value, 10) || 30) : 30;
  const selectTimeoutAction = document.getElementById('selectDashSleepTimeoutAction');
  const timeoutAction = selectTimeoutAction ? selectTimeoutAction.value : 'pause';
  const toggleInactivity = document.getElementById('toggleDashSleepInactivity');
  const inactChecked = toggleInactivity ? toggleInactivity.checked : false;

  if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    browserAPI.runtime.sendMessage({
      type: 'SET_SLEEP_TIMER',
      action: 'SET_SLEEP_TIMER',
      durationMinutes: minutes,
      enableFade: enableFade,
      options: {
        enableFadeOut: enableFade,
        endOfVideo: endVideo,
        fadeDurationSeconds: fadeSeconds,
        fade_curve_duration: fadeSeconds,
        fade_duration: fadeSeconds,
        timeoutAction: timeoutAction,
        timeout_action: timeoutAction,
        enableInactivityAutoSleep: inactChecked,
        inactivity_auto_sleep: inactChecked,
        inactivity_enabled: inactChecked
      }
    }, (res) => {
      if (browserAPI.runtime.lastError) {
        // Suppress lastError gracefully
      }
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerPauseSleepTimer() {
  const now = Date.now();
  if (currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING')) {
    const remainingMs = Math.max(0, (currentDashSleepTimer.targetTime || now) - now);
    currentDashSleepTimer.state = 'PAUSED';
    currentDashSleepTimer.remainingMs = remainingMs;
    currentDashSleepTimer.pausedAt = now;

    // Immediate optimistic UI update
    renderDashSleepTimer(currentDashSleepTimer);

    // Direct fallback write to storage
    try {
      if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
        browserAPI.storage.local.set({ sentinel_sleep_timer: currentDashSleepTimer });
      }
    } catch (_) {}

    // Dispatch message with graceful runtime error suppression
    try {
      if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
        browserAPI.runtime.sendMessage({ type: 'PAUSE_SLEEP_TIMER', action: 'PAUSE_SLEEP_TIMER' }, (res) => {
          if (browserAPI.runtime.lastError) {
            // Gracefully ignore/suppress
          }
          if (res && res.success && res.state) {
            renderDashSleepTimer(res.state);
          }
        });
      }
    } catch (_) {}

    showToast('Sleep timer paused', false);
  }
}

function triggerResumeSleepTimer() {
  const now = Date.now();
  if (currentDashSleepTimer && currentDashSleepTimer.state === 'PAUSED') {
    const remainingMs = (typeof currentDashSleepTimer.remainingMs === 'number')
      ? currentDashSleepTimer.remainingMs
      : ((currentDashSleepTimer.durationMinutes * 60 * 1000) || 60000);
    const newTargetTime = now + remainingMs;
    currentDashSleepTimer.state = 'RUNNING';
    currentDashSleepTimer.targetTime = newTargetTime;
    delete currentDashSleepTimer.remainingMs;
    delete currentDashSleepTimer.pausedAt;

    // Immediate optimistic UI update
    renderDashSleepTimer(currentDashSleepTimer);

    // Direct fallback write to storage
    try {
      if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
        browserAPI.storage.local.set({ sentinel_sleep_timer: currentDashSleepTimer });
      }
    } catch (_) {}

    // Dispatch message with graceful runtime error suppression
    try {
      if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
        browserAPI.runtime.sendMessage({ type: 'RESUME_SLEEP_TIMER', action: 'RESUME_SLEEP_TIMER' }, (res) => {
          if (browserAPI.runtime.lastError) {
            // Gracefully ignore/suppress
          }
          if (res && res.success && res.state) {
            renderDashSleepTimer(res.state);
          }
        });
      }
    } catch (_) {}

    showToast('Sleep timer resumed', false);
  }
}

/**
 * Pure domain calculator for sleep timer extension.
 * Rule 28 Compliant: 26 lines, complexity 4, nesting depth 2, parameters 3.
 */
function calculateExtendedSleepTimerState(currentTimer, extraMinutes, defaults = {}) {
  const minsToAdd = parseInt(extraMinutes, 10);
  if (isNaN(minsToAdd) || minsToAdd <= 0) return currentTimer;

  const extraMs = minsToAdd * 60 * 1000;
  const now = Date.now();
  const timer = currentTimer ? Object.assign({}, currentTimer) : null;

  if (timer && (timer.state === 'RUNNING' || timer.state === 'FADING') && (timer.targetTime || 0) > now) {
    timer.durationMinutes = (timer.durationMinutes || 0) + minsToAdd;
    timer.durationMs = (timer.durationMs || 0) + extraMs;
    timer.targetTime = (timer.targetTime || now) + extraMs;
    timer.lastUpdated = now;
    if (timer.state === 'FADING') timer.state = 'RUNNING';
    return timer;
  }

  if (timer && timer.state === 'PAUSED') {
    timer.durationMinutes = (timer.durationMinutes || 0) + minsToAdd;
    timer.durationMs = (timer.durationMs || 0) + extraMs;
    timer.remainingMs = (timer.remainingMs || 0) + extraMs;
    timer.lastUpdated = now;
    return timer;
  }

  // IDLE, CANCELLED, expired, or uninitialized
  return {
    state: 'RUNNING',
    durationMinutes: minsToAdd,
    durationMs: extraMs,
    startTime: now,
    targetTime: now + extraMs,
    pauseMedia: defaults.pauseMedia !== undefined ? defaults.pauseMedia : true,
    pauseTracking: defaults.pauseTracking !== undefined ? defaults.pauseTracking : true,
    enableFadeOut: defaults.enableFadeOut !== undefined ? defaults.enableFadeOut : true,
    fadeDurationSeconds: defaults.fadeDurationSeconds || 30,
    lastUpdated: now,
    endOfVideo: defaults.endOfVideo || false
  };
}

function triggerExtendSleepTimer(extraMinutes) {
  const minsToAdd = parseInt(extraMinutes, 10);
  if (isNaN(minsToAdd) || minsToAdd <= 0) return;

  const fadeToggle = typeof document !== 'undefined' 
    ? (document.getElementById('toggleDashSleepFade') || document.getElementById('toggleDashSleepFadeCurve')) 
    : null;
  const fadeSelect = typeof document !== 'undefined' ? document.getElementById('selectDashSleepFadeCurve') : null;
  const endVideoToggle = typeof document !== 'undefined' ? document.getElementById('toggleDashSleepEndOfVideo') : null;

  const defaults = {
    enableFadeOut: fadeToggle ? fadeToggle.checked : true,
    fadeDurationSeconds: fadeSelect ? (parseInt(fadeSelect.value, 10) || 30) : 30,
    endOfVideo: endVideoToggle ? endVideoToggle.checked : false
  };

  currentDashSleepTimer = calculateExtendedSleepTimerState(currentDashSleepTimer, minsToAdd, defaults);

  renderDashSleepTimer(currentDashSleepTimer);

  try {
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      browserAPI.storage.local.set({ sentinel_sleep_timer: currentDashSleepTimer });
    }
  } catch (_) {}

  try {
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
      browserAPI.runtime.sendMessage({
        type: 'EXTEND_SLEEP_TIMER',
        action: 'EXTEND_SLEEP_TIMER',
        extraMinutes: minsToAdd
      }, (res) => {
        if (browserAPI.runtime.lastError) {}
        if (res && res.success && res.state) {
          currentDashSleepTimer = res.state;
          renderDashSleepTimer(currentDashSleepTimer);
        }
      });
    }
  } catch (_) {}

  showToast(`Added +${minsToAdd}m to sleep timer`, false);
}

function triggerCancelSleepTimer() {
  if (currentDashSleepTimer && currentDashSleepTimer.state !== 'IDLE') {
    currentDashSleepTimer = { state: 'IDLE' };
    renderDashSleepTimer(currentDashSleepTimer);
    try {
      if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
        browserAPI.storage.local.set({ sentinel_sleep_timer: currentDashSleepTimer });
      }
    } catch (_) {}
  }
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
    browserAPI.runtime.sendMessage({ type: 'CANCEL_SLEEP_TIMER', action: 'CANCEL_SLEEP_TIMER' }, (res) => {
      if (browserAPI.runtime.lastError) {}
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
  showToast('Sleep timer reset', false);
}

function updateSleepSetting(keyOrObj, maybeValue) {
  const updates = (typeof keyOrObj === 'object' && keyOrObj !== null)
    ? keyOrObj
    : { [keyOrObj]: maybeValue };

  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    browserAPI.storage.local.get(['sentinel_sleep_settings'], (res) => {
      const settings = Object.assign({}, res && res.sentinel_sleep_settings, updates);
      browserAPI.storage.local.set({ sentinel_sleep_settings: settings });
    });
  }
}

// Bootstrap Initialization
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('DOMContentLoaded', () => {
    startLiveClock();
    setupEventListeners();
    applyCardStaggerIndices();
    initStickyMiniPlayerDock();
    initMediaScrollToTop();
    initTimeScrollToTop();
    initAudioVisualizer(document.getElementById('canvasAudioVisualizer'));
    initSleepSentinelHub();

    // Default Media Platform Filter initialization
    const initialMediaPlat = document.getElementById('tableMediaPlatformFilter');
    if (initialMediaPlat && !initialMediaPlat.value) {
      initialMediaPlat.value = 'all';
    }

    // Capture daily rolling snapshot on dashboard launch
    captureDailySnapshot().catch(() => {});

    // Initialize dashboard modular features
    try {
      if (_DashboardFeatureManager && typeof _DashboardFeatureManager.initDashboardFeatures === 'function') {
        _DashboardFeatureManager.initDashboardFeatures({ browserAPI: browserAPI, state: _DashboardState });
      }
    } catch (_) {}

    // Load language preference, browser filter, tracking mode, category, sleep, theme, and audio lab from storage
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      browserAPI.storage.local.get([
        'language',
        'media_sentinel_settings',
        'sentinel_sleep_settings',
        'selected_browser_filter',
        'selected_tracking_mode',
        'selected_domain_category',
        'ui_theme',
        'theme',
        'audio_lab_settings',
        'audioLabConfig',
        'userThemePreferences',
        'audioHapticsConfig',
        'domain_category_overrides',
        'starred_domains',
        'domain_annotations',
        'tracking_blacklist',
        'domain_budgets',
        'media_sentinel_viz_effect'
      ], (res) => {
        let lang = 'en';
        if (res && res.language) {
          lang = res.language;
        } else if (res && res.media_sentinel_settings && res.media_sentinel_settings.language) {
          lang = res.media_sentinel_settings.language;
        }
        if (res && res.media_sentinel_settings) {
          populateSettingsForm(res.media_sentinel_settings);
        }
        if (res && res.sentinel_sleep_settings) {
          populateSleepSettingsForm(res.sentinel_sleep_settings);
          syncSleepSettingsToggles(res.sentinel_sleep_settings);
        }
        if (res && res.userThemePreferences) {
          applyCustomTheme(res.userThemePreferences.theme, res.userThemePreferences.accent);
        } else if (res && (res.ui_theme || res.theme)) {
          applyTheme(res.ui_theme || res.theme);
        } else {
          try {
            const localTheme = localStorage.getItem('ui_theme') || localStorage.getItem('theme');
            if (localTheme) applyTheme(localTheme);
          } catch (_) {}
        }
        if (res && Array.isArray(res.starred_domains)) {
          starredDomains = res.starred_domains;
        }
        if (res && res.domain_annotations && typeof res.domain_annotations === 'object') {
          domainAnnotations = res.domain_annotations;
        }
        if (res && Array.isArray(res.tracking_blacklist)) {
          trackingBlacklist = res.tracking_blacklist;
        }
        if (res && res.domain_budgets && typeof res.domain_budgets === 'object') {
          domainBudgets = res.domain_budgets;
        }
        renderBlacklistChips();
        renderDomainBudgetsList();
        initPomodoroWidget();

        if (res && res.audioHapticsConfig) {
          if (typeof res.audioHapticsConfig.enabled === 'boolean') sentinelHaptics.enabled = res.audioHapticsConfig.enabled;
          if (typeof res.audioHapticsConfig.volume === 'number') sentinelHaptics.masterGain = res.audioHapticsConfig.volume;
          const toggleAudio = document.getElementById('toggleAudioHaptics');
          if (toggleAudio) toggleAudio.checked = sentinelHaptics.enabled;
          const sliderVol = document.getElementById('sliderAudioHapticsVolume');
          if (sliderVol) sliderVol.value = String(sentinelHaptics.masterGain);
          const lblVol = document.getElementById('lblAudioHapticsVolumeValue');
          if (lblVol) lblVol.textContent = `${Math.round(sentinelHaptics.masterGain * 100)}%`;
        }
        if (res && (res.audio_lab_settings || res.audioLabConfig)) {
          updateDashboardAudioLabUI(res.audio_lab_settings || res.audioLabConfig);
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
        if (res && res.domain_category_overrides && typeof res.domain_category_overrides === 'object') {
          domainCategoryOverrides = Object.assign({}, res.domain_category_overrides);
        }
        if (res && res.media_sentinel_viz_effect) {
          setVisualizerMode(res.media_sentinel_viz_effect);
        }
        applyDashboardLanguage(lang);
        refreshDashboard();
      });
    }

    // Periodic Auto-Refresh (every 1.5 seconds)
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshDashboard();
      }
    }, 1500);

    // Instant reactive updates via IPC broadcast
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
      browserAPI.runtime.onMessage.addListener((message) => {
        if (message && message.type === 'LIVE_MEDIA_UPDATE' && message.payload) {
          if (currentTab === 'media' && message.payload.primaryMedia) {
            renderHeroMediaPlayer(message.payload.primaryMedia);
          }
        } else if (message && message.type === 'DATA_HUB_STATUS_CHANGED') {
          refreshDashboard(true);
        }
      });
    }
  });
}

if (typeof window !== 'undefined') {
  window.toggleDomainPin = toggleDomainPin;
  window.saveDomainNote = saveDomainNote;
  window.openDomainNoteModal = openDomainNoteModal;
  window.closeDomainNoteModal = closeDomainNoteModal;
  window.addBlacklistPattern = addBlacklistPattern;
  window.removeBlacklistPattern = removeBlacklistPattern;
  window.purgeDomainData = purgeDomainData;
  window.setDomainBudget = setDomainBudget;
  window.removeDomainBudget = removeDomainBudget;
  window.initPomodoroWidget = initPomodoroWidget;
  window.getPomodoroController = () => pomodoroController;
  window.playSyntheticFocusChime = playSyntheticFocusChime;
  window.updateDashboardFocusMetrics = updateDashboardFocusMetrics;
  window.getStarredDomains = () => starredDomains;
  window.getDomainAnnotations = () => domainAnnotations;
  window.getTrackingBlacklist = () => trackingBlacklist;
  window.getDomainBudgets = () => domainBudgets;
}


// =============================================================================
// Phase 1 Restoration: Consolidated Export Dropdown Hub
// =============================================================================
function setupExportDropdown() {
  const btnExportMenu = document.getElementById('btnExportMenu');
  const exportDropdownMenu = document.getElementById('exportDropdownMenu');
  if (!btnExportMenu || !exportDropdownMenu) return;

  btnExportMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = btnExportMenu.getAttribute('aria-expanded') === 'true';
    btnExportMenu.setAttribute('aria-expanded', !isExpanded);
    exportDropdownMenu.classList.toggle('hidden');
  });

  const btnExportTimeCsv = document.getElementById('btnExportTimeCsv');
  if (btnExportTimeCsv) {
    btnExportTimeCsv.addEventListener('click', (e) => {
      e.stopPropagation();
      const btnExportTrackingCsv = document.getElementById('btnExportTrackingCsv');
      if (btnExportTrackingCsv) btnExportTrackingCsv.click();
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    });
  }

  const btnExportMediaCsvMenu = document.getElementById('btnExportMediaCsvMenu');
  if (btnExportMediaCsvMenu) {
    btnExportMediaCsvMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const btnExportMediaCsv = document.getElementById('btnExportMediaCsv');
      if (btnExportMediaCsv) btnExportMediaCsv.click();
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    });
  }

  const btnPrintPdf = document.getElementById('btnPrintPdf');
  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    });
  }

  const btnDownloadDigest = document.getElementById('btnDownloadHtmlDigest');
  if (btnDownloadDigest) {
    btnDownloadDigest.addEventListener('click', () => {
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', (e) => {
    if (!exportDropdownMenu.contains(e.target) && !btnExportMenu.contains(e.target)) {
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
  setupExportDropdown,
    populateSettingsForm,
    populateSleepSettingsForm,
    saveDashboardSettings,
    saveSleepSettings,
    initSleepSentinelHub,
    renderDashSleepTimer,
    updateDashSleepDial,
    fetchSleepTimerState,
    triggerPauseSleepTimer,
    triggerResumeSleepTimer,
    triggerSetSleepTimer,
    triggerCancelSleepTimer,
    triggerExtendSleepTimer,
    syncSleepSettingsToggles,
    updateSleepSetting,
    getCurrentDashSleepTimer: () => currentDashSleepTimer,
    setCurrentDashSleepTimer: (val) => { currentDashSleepTimer = val; },
    DASH_SLEEP_CIRCUMFERENCE,
    cachedSettings,
    escapeCsvCell,
    exportTimeTrackingCsv,
    exportMediaHistoryCsv,
    // Phase 3 Resilience & Hub Reconnect exports
    HUB_RETRY_INTERVALS,
    scheduleDataHubAutoReconnect,
    updateDataHubStatus,
    updateHUDStatus,
    triggerDataHubConnectAndLaunch,
    getHubReconnectAttempts: () => hubReconnectAttempts,
    setHubReconnectAttempts: (val) => { hubReconnectAttempts = val; },
    getHubReconnectTimer: () => hubReconnectTimer,
    setHubReconnectTimer: (val) => { hubReconnectTimer = val; },
    getDataHubConnected: () => dataHubConnected,
    setDataHubConnected: (val) => { dataHubConnected = val; },
    // Phase 4 Bilingual i18n Parity exports
    DASHBOARD_I18N,
    t,
    applyDashboardLanguage,
    updateSelectOptions,
    getCurrentLang: () => currentLang,
    setCurrentLang: (val) => { currentLang = val; },
    // Phase 5 Theme, A11y & Audio Lab exports
    applyTheme,
    toggleThemeMode,
    updateThemeToggleUI,
    getCurrentTheme: () => currentTheme,
    setCurrentTheme: (val) => { currentTheme = val; },
    updateDashboardAudioLabUI,
    getDashboardAudioLabSettings: () => dashboardAudioLabSettings,
    setDashboardAudioLabSettings: (val) => { dashboardAudioLabSettings = val; },
    DASHBOARD_EQ_PRESETS,
    dispatchAudioLabSettings,
    persistDashboardAudioLabSettings,
    // Phase 2: Omni Command Palette & Ergonomic Hotkey Navigation exports
    OmniCommandPaletteController,
    getOmniPaletteController: () => omniPaletteController,
    setOmniPaletteController: (val) => { omniPaletteController = val; },
    initGlobalHotkeys,
    triggerMediaPlayPause,
    triggerMediaMute,
    triggerMediaFullscreen,
    triggerMediaPip,
    openHotkeysModal,
    closeHotkeysModal,
    isHotkeysModalOpen,
    renderHotkeysList,
    exportDashboardBackup,
    SHORTCUTS_REGISTRY,
    switchTab,
    navigateToBridgeService,
    navigateToFocusSentinel,
    // Phase 3: Precision Timeline Scrubber & Kinetic Number Rollers exports
    formatHHMMSS,
    formatTimeHHMMSS,
    initPrecisionScrubber,
    animateNumberRoll,
    renderScrubberChapterTicks,
    applyCardStaggerIndices,
    PrecisionTimelineScrubber,
    updateTimeTrackingKpiView,
    updateMediaAnalyticsKpiView,
    // Modular Subsystems
    DashboardState: _DashboardState,
    BrowserFilter: _BrowserFilter,
    DonutChart: _DonutChart,
    TimeSeriesChart: _TimeSeriesChart,
    DomainTable: _DomainTable,
    CsvExporter: _CsvExporter,
    AudioLabController: _AudioLabController,
    OmniPalette: _OmniPalette,
    ScrubberModule: _PrecisionScrubber,
    // Phase 4: Synthesized Audio Haptics & Dynamic Multi-Theme Engine exports
    SentinelHapticAudioEngine,
    sentinelHaptics,
    MultiThemeEngine,
    multiThemeEngine,
    applyCustomTheme,
    SUBSTRATE_THEMES,
    ACCENT_PALETTES,
    DASHBOARD_UIUX_I18N,
    updateThemeSelectionUI,
    getCurrentSubstrate: () => currentSubstrate,
    setCurrentSubstrate: (val) => { currentSubstrate = val; },
    getCurrentAccent: () => currentAccent,
    setCurrentAccent: (val) => { currentAccent = val; },
    // Phase 1 Temporal Engine & Productivity Classifier exports
    aggregateChronoHeatmap,
    renderChronoHeatmap,
    calculateProductivityScore,
    renderProductivityGauge,
    handleCategoryOverride,
    getDomainCategory,
    DEFAULT_DOMAIN_CATEGORIES,
    updateProductivityMetrics,
    updateChronoHeatmap,
    getDatesInRange,
    TemporalProductivityFeature: _TemporalProductivity,
    getDomainCategoryOverrides: () => domainCategoryOverrides,
    setDomainCategoryOverrides: (val) => { domainCategoryOverrides = val; },
    getCurrentHeatmapMode: () => currentHeatmapMode,
    setCurrentHeatmapMode: (val) => { currentHeatmapMode = val; },
    getCustomStartDate: () => customStartDate,
    setCustomStartDate: (val) => { customStartDate = val; },
    getCustomEndDate: () => customEndDate,
    setCustomEndDate: (val) => { customEndDate = val; },
    // Phase 2 Multi-Tab Media Deck & Audio Visualizer exports
    pollMultiTabMediaStreams,
    renderMultiTabMediaDeck,
    handleRemoteMediaCommand,
    handleSoloTab,
    handleMuteAllOthers,
    handleMuteAll,
    resolvePrimaryMediaTabId,
    initAudioVisualizer,
    setVisualizerMode,
    isVisualizerFullWindowActive,
    setVisualizerFullWindowState,
    toggleVisualizerFullWindow,
    isVisualizerFullscreenActive,
    setVisualizerFullscreenState,
    toggleVisualizerFullscreen,
    renderVisualizerFrame,
    startVisualizerLoop,
    stopVisualizerLoop,
    setAudioPlayingState,
    getVisualizerState,
    initVisualizerErgonomicsUI,
    get MediaDeckVisualizerFeature() {
      return getResolvedVisualizer();
    },
    getResolvedVisualizer,
    getActiveMediaStreams: () => activeMediaStreams,
    setActiveMediaStreams: (val) => { activeMediaStreams = val; },
    // Phase 3 Backup, Snapshots, SQLite Hub & Executive Digest exports
    validateBackupSchemaV2,
    resolveBackupConflict,
    captureDailySnapshot,
    listDailySnapshots,
    rollbackToSnapshot,
    replicateToSqliteHub,
    restoreFromSqliteHub,
    triggerPrintPdf,
    downloadStandaloneHtmlDigest,
    handleBackupFileSelection,
    populateSnapshotRollbackSelect,
    initBackupAndDigestHandlers,
    BackupHubDigestFeature: _BackupHubDigest,
    // Sleep Sentinel Hub
    triggerExtendSleepTimer,
    calculateExtendedSleepTimerState,
    wireDashboardSleepExtenders,
    initSleepSentinelHub,
    initDashboardSleepSentinelHub: initSleepSentinelHub,
    // Media Scroll to Top Actions
    isMediaHeadingScrolledPast,
    initMediaScrollToTop,
    setMediaScrollToTopVisible,
    handleMediaScrollToTopClick,
    evaluateMediaScrollVisibility,
    // Time Tracking Scroll to Top Actions
    isTimeHeadingScrolledPast,
    initTimeScrollToTop,
    setTimeScrollToTopVisible,
    handleTimeScrollToTopClick,
    evaluateTimeScrollVisibility
  };
}

if (typeof window !== 'undefined') {
  window.navigateToBridgeService = navigateToBridgeService;
  window.navigateToFocusSentinel = navigateToFocusSentinel;
  window.updateHUDStatus = updateHUDStatus;
  window.updateDataHubStatus = updateDataHubStatus;
  window.triggerDataHubConnectAndLaunch = triggerDataHubConnectAndLaunch;
  window.aggregateChronoHeatmap = aggregateChronoHeatmap;
  window.renderChronoHeatmap = renderChronoHeatmap;
  window.calculateProductivityScore = calculateProductivityScore;
  window.renderProductivityGauge = renderProductivityGauge;
  window.handleCategoryOverride = handleCategoryOverride;
  window.getDomainCategory = getDomainCategory;
  window.DEFAULT_DOMAIN_CATEGORIES = DEFAULT_DOMAIN_CATEGORIES;
  window.formatHHMMSS = formatHHMMSS;
  window.formatTimeHHMMSS = formatTimeHHMMSS;
  window.initPrecisionScrubber = initPrecisionScrubber;
  window.animateNumberRoll = animateNumberRoll;
  window.renderScrubberChapterTicks = renderScrubberChapterTicks;
  window.applyCardStaggerIndices = applyCardStaggerIndices;
  window.PrecisionTimelineScrubber = PrecisionTimelineScrubber;
  window.SentinelHapticAudioEngine = SentinelHapticAudioEngine;
  window.sentinelHaptics = sentinelHaptics;
  window.MultiThemeEngine = MultiThemeEngine;
  window.multiThemeEngine = multiThemeEngine;
  window.applyCustomTheme = applyCustomTheme;
  window.SUBSTRATE_THEMES = SUBSTRATE_THEMES;
  window.ACCENT_PALETTES = ACCENT_PALETTES;
  window.DASHBOARD_UIUX_I18N = DASHBOARD_UIUX_I18N;
  window.pollMultiTabMediaStreams = pollMultiTabMediaStreams;
  window.renderMultiTabMediaDeck = renderMultiTabMediaDeck;
  window.handleRemoteMediaCommand = handleRemoteMediaCommand;
  window.handleSoloTab = handleSoloTab;
  window.handleMuteAllOthers = handleMuteAllOthers;
  window.handleMuteAll = handleMuteAll;
  window.resolvePrimaryMediaTabId = resolvePrimaryMediaTabId;
  window.initAudioVisualizer = initAudioVisualizer;
  window.setVisualizerMode = setVisualizerMode;
  window.isVisualizerFullWindowActive = isVisualizerFullWindowActive;
  window.setVisualizerFullWindowState = setVisualizerFullWindowState;
  window.toggleVisualizerFullWindow = toggleVisualizerFullWindow;
  window.isVisualizerFullscreenActive = isVisualizerFullscreenActive;
  window.setVisualizerFullscreenState = setVisualizerFullscreenState;
  window.toggleVisualizerFullscreen = toggleVisualizerFullscreen;
  window.renderVisualizerFrame = renderVisualizerFrame;
  window.startVisualizerLoop = startVisualizerLoop;
  window.stopVisualizerLoop = stopVisualizerLoop;
  window.setAudioPlayingState = setAudioPlayingState;
  window.getVisualizerState = getVisualizerState;
  window.initVisualizerErgonomicsUI = initVisualizerErgonomicsUI;
  window.validateBackupSchemaV2 = validateBackupSchemaV2;
  window.resolveBackupConflict = resolveBackupConflict;
  window.captureDailySnapshot = captureDailySnapshot;
  window.listDailySnapshots = listDailySnapshots;
  window.rollbackToSnapshot = rollbackToSnapshot;
  window.replicateToSqliteHub = replicateToSqliteHub;
  window.restoreFromSqliteHub = restoreFromSqliteHub;
  window.triggerPrintPdf = triggerPrintPdf;
  window.downloadStandaloneHtmlDigest = downloadStandaloneHtmlDigest;
  window.handleBackupFileSelection = handleBackupFileSelection;
  window.populateSnapshotRollbackSelect = populateSnapshotRollbackSelect;
  window.initBackupAndDigestHandlers = initBackupAndDigestHandlers;
  window.BackupHubDigestFeature = _BackupHubDigest;
  window.triggerPauseSleepTimer = triggerPauseSleepTimer;
  window.triggerResumeSleepTimer = triggerResumeSleepTimer;
  window.triggerSetSleepTimer = triggerSetSleepTimer;
  window.triggerCancelSleepTimer = triggerCancelSleepTimer;
  window.triggerExtendSleepTimer = triggerExtendSleepTimer;
  window.calculateExtendedSleepTimerState = calculateExtendedSleepTimerState;
  window.wireDashboardSleepExtenders = wireDashboardSleepExtenders;
  window.initSleepSentinelHub = initSleepSentinelHub;
  window.initDashboardSleepSentinelHub = initSleepSentinelHub;
  window.isMediaHeadingScrolledPast = isMediaHeadingScrolledPast;
  window.initMediaScrollToTop = initMediaScrollToTop;
  window.setMediaScrollToTopVisible = setMediaScrollToTopVisible;
  window.handleMediaScrollToTopClick = handleMediaScrollToTopClick;
  window.evaluateMediaScrollVisibility = evaluateMediaScrollVisibility;
  window.isTimeHeadingScrolledPast = isTimeHeadingScrolledPast;
  window.initTimeScrollToTop = initTimeScrollToTop;
  window.setTimeScrollToTopVisible = setTimeScrollToTopVisible;
  window.handleTimeScrollToTopClick = handleTimeScrollToTopClick;
  window.evaluateTimeScrollVisibility = evaluateTimeScrollVisibility;
  window.initFocusAdvancedState = initFocusAdvancedState;
  window.initSleepAdvancedState = initSleepAdvancedState;
  window.createBinauralBeatNodes = createBinauralBeatNodes;
  window.startSleepAidSoundscape = startSleepAidSoundscape;
  window.stopSleepAidSoundscape = stopSleepAidSoundscape;
  window.triggerPowerNapMode = triggerPowerNapMode;
  window.trigger2020PostureAlert = trigger2020PostureAlert;
  window.triggerBreatheNudgeOverlay = triggerBreatheNudgeOverlay;
  window.updateFocusIntegrityScore = updateFocusIntegrityScore;
}

if (typeof globalThis !== 'undefined') {
  globalThis.navigateToBridgeService = navigateToBridgeService;
  globalThis.navigateToFocusSentinel = navigateToFocusSentinel;
  globalThis.updateHUDStatus = updateHUDStatus;
  globalThis.updateDataHubStatus = updateDataHubStatus;
  globalThis.triggerDataHubConnectAndLaunch = triggerDataHubConnectAndLaunch;
  globalThis.initFocusAdvancedState = initFocusAdvancedState;
  globalThis.initSleepAdvancedState = initSleepAdvancedState;
  globalThis.createBinauralBeatNodes = createBinauralBeatNodes;
  globalThis.startSleepAidSoundscape = startSleepAidSoundscape;
  globalThis.stopSleepAidSoundscape = stopSleepAidSoundscape;
  globalThis.triggerPowerNapMode = triggerPowerNapMode;
  globalThis.trigger2020PostureAlert = trigger2020PostureAlert;
  globalThis.triggerBreatheNudgeOverlay = triggerBreatheNudgeOverlay;
  globalThis.updateFocusIntegrityScore = updateFocusIntegrityScore;
  globalThis.aggregateChronoHeatmap = aggregateChronoHeatmap;
  globalThis.renderChronoHeatmap = renderChronoHeatmap;
  globalThis.calculateProductivityScore = calculateProductivityScore;
  globalThis.renderProductivityGauge = renderProductivityGauge;
  globalThis.handleCategoryOverride = handleCategoryOverride;
  globalThis.getDomainCategory = getDomainCategory;
  globalThis.DEFAULT_DOMAIN_CATEGORIES = DEFAULT_DOMAIN_CATEGORIES;
  globalThis.PrecisionTimelineScrubber = PrecisionTimelineScrubber;
  globalThis.SentinelHapticAudioEngine = SentinelHapticAudioEngine;
  globalThis.sentinelHaptics = sentinelHaptics;
  globalThis.MultiThemeEngine = MultiThemeEngine;
  globalThis.multiThemeEngine = multiThemeEngine;
  globalThis.applyCustomTheme = applyCustomTheme;
  globalThis.SUBSTRATE_THEMES = SUBSTRATE_THEMES;
  globalThis.ACCENT_PALETTES = ACCENT_PALETTES;
  globalThis.DASHBOARD_UIUX_I18N = DASHBOARD_UIUX_I18N;
  globalThis.handleMuteAllOthers = handleMuteAllOthers;
  globalThis.handleMuteAll = handleMuteAll;
  globalThis.resolvePrimaryMediaTabId = resolvePrimaryMediaTabId;
  globalThis.initStickyMiniPlayerDock = initStickyMiniPlayerDock;
  globalThis.updateSidebarLiveEqState = updateSidebarLiveEqState;
  globalThis.updateHeroVolumeUI = updateHeroVolumeUI;
  globalThis.validateBackupSchemaV2 = validateBackupSchemaV2;
  globalThis.resolveBackupConflict = resolveBackupConflict;
  globalThis.captureDailySnapshot = captureDailySnapshot;
  globalThis.listDailySnapshots = listDailySnapshots;
  globalThis.rollbackToSnapshot = rollbackToSnapshot;
  globalThis.replicateToSqliteHub = replicateToSqliteHub;
  globalThis.restoreFromSqliteHub = restoreFromSqliteHub;
  globalThis.triggerPrintPdf = triggerPrintPdf;
  globalThis.downloadStandaloneHtmlDigest = downloadStandaloneHtmlDigest;
  globalThis.BackupHubDigestFeature = _BackupHubDigest;
  globalThis.initVisualizerErgonomicsUI = initVisualizerErgonomicsUI;
  globalThis.triggerPauseSleepTimer = triggerPauseSleepTimer;
  globalThis.triggerResumeSleepTimer = triggerResumeSleepTimer;
  globalThis.triggerSetSleepTimer = triggerSetSleepTimer;
  globalThis.triggerCancelSleepTimer = triggerCancelSleepTimer;
  globalThis.triggerExtendSleepTimer = triggerExtendSleepTimer;
  globalThis.calculateExtendedSleepTimerState = calculateExtendedSleepTimerState;
  globalThis.wireDashboardSleepExtenders = wireDashboardSleepExtenders;
  globalThis.initSleepSentinelHub = initSleepSentinelHub;
  globalThis.initDashboardSleepSentinelHub = initSleepSentinelHub;
  globalThis.syncSleepSettingsToggles = syncSleepSettingsToggles;
  globalThis.updateSleepSetting = updateSleepSetting;
  globalThis.isMediaHeadingScrolledPast = isMediaHeadingScrolledPast;
  globalThis.initMediaScrollToTop = initMediaScrollToTop;
  globalThis.setMediaScrollToTopVisible = setMediaScrollToTopVisible;
  globalThis.handleMediaScrollToTopClick = handleMediaScrollToTopClick;
  globalThis.evaluateMediaScrollVisibility = evaluateMediaScrollVisibility;
  globalThis.isTimeHeadingScrolledPast = isTimeHeadingScrolledPast;
  globalThis.initTimeScrollToTop = initTimeScrollToTop;
  globalThis.setTimeScrollToTopVisible = setTimeScrollToTopVisible;
  globalThis.handleTimeScrollToTopClick = handleTimeScrollToTopClick;
  globalThis.evaluateTimeScrollVisibility = evaluateTimeScrollVisibility;
}

// ============================================================================
// Future UI/UX Systems Helpers
// ============================================================================

function initStickyMiniPlayerDock() {
  if (typeof document === 'undefined') return;
  const heroCard = document.getElementById('heroMediaPlayerCard');
  const miniDock = document.getElementById('stickyMiniPlayerDock');
  if (!heroCard || !miniDock) return;

  const playPauseBtn = document.getElementById('miniDockPlayPause');
  const titleEl = document.getElementById('miniDockTitle');
  const timeEl = document.getElementById('miniDockTime');
  const pipBtn = document.getElementById('miniDockPip');
  const jumpBtn = document.getElementById('miniDockJump');
  const closeBtn = document.getElementById('miniDockClose');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (typeof triggerMediaPlayPause === 'function') triggerMediaPlayPause();
    });
  }
  if (pipBtn) {
    pipBtn.addEventListener('click', () => {
      if (typeof triggerMediaPip === 'function') triggerMediaPip();
    });
  }
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      heroCard.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      miniDock.classList.add('hidden');
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const pm = (typeof dashboardData !== 'undefined' && dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia) 
                 || (typeof globalMediaState !== 'undefined' && globalMediaState && globalMediaState.primaryMedia);
      const isPlaying = pm && (pm.status === 'playing' || pm.is_playing || pm.isPlaying);
      
      if (!entry.isIntersecting && isPlaying) {
        miniDock.classList.remove('hidden');
        if (titleEl && pm.title) titleEl.textContent = pm.title;
        if (timeEl && typeof pm.currentTimeFormatted === 'string') timeEl.textContent = pm.currentTimeFormatted;
      } else {
        miniDock.classList.add('hidden');
      }
    });
  }, { threshold: 0.1 });

  observer.observe(heroCard);
}

function updateSidebarLiveEqState(isPlaying) {
  if (typeof document === 'undefined') return;
  const viz = document.getElementById('sidebarLiveEqVisualizer');
  if (!viz) return;
  if (isPlaying) {
    viz.classList.remove('hidden');
  } else {
    viz.classList.add('hidden');
  }
}

function updateHeroVolumeUI(volumeFraction) {
  if (typeof document === 'undefined') return;
  const volIcon = document.getElementById('heroVolumeIcon');
  const volText = document.getElementById('heroVolumeText');
  const volTooltip = document.querySelector('.vol-floating-tooltip');
  
  const pct = Math.round(volumeFraction * 100);
  if (volText) volText.textContent = `${pct}%`;
  if (volTooltip) volTooltip.textContent = `${pct}%`;

  if (volIcon) {
    if (pct === 0) volIcon.textContent = '🔇';
    else if (pct <= 33) volIcon.textContent = '🔈';
    else if (pct <= 66) volIcon.textContent = '🔉';
    else volIcon.textContent = '🔊';
  }
}


