/**
 * Web Activity & Media Sentinel - 2-Tier Navigation Feature
 * Pure state machine and helper mappings for 2-Tier Segmented Control & Navigation.
 * 
 * Group Mapping:
 * - Playback: Media, Audio (Core media playback & DSP audio lab)
 * - Studio: Tools, Studio (Smart automations, micro actions & studio vault)
 * - Analytics: Tracking, Domains (Screen time telemetry, donut chart & domain breakdown)
 * - Wellness: Sleep (Bedtime routines, radial sleep dial & focus wellness)
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const GROUP_TO_TABS = Object.freeze({
    playback: Object.freeze(['media', 'audio']),
    studio: Object.freeze(['tools', 'studio']),
    analytics: Object.freeze(['tracking', 'domains']),
    wellness: Object.freeze(['sleep', 'focus'])
  });

  const TAB_TO_GROUP = Object.freeze({
    media: 'playback',
    audio: 'playback',
    tools: 'studio',
    studio: 'studio',
    tracking: 'analytics',
    domains: 'analytics',
    sleep: 'wellness',
    focus: 'wellness'
  });

  const DEFAULT_GROUP_TAB = Object.freeze({
    playback: 'media',
    studio: 'tools',
    analytics: 'tracking',
    wellness: 'sleep'
  });

  const ALL_GROUPS = Object.freeze(['playback', 'studio', 'analytics', 'wellness']);
  const ALL_TABS = Object.freeze(['media', 'audio', 'tools', 'studio', 'tracking', 'domains', 'sleep', 'focus']);

  /**
   * Resolves the Tier 1 group category for a given tab identifier.
   * @param {string} tabName
   * @returns {string}
   */
  function getGroupForTab(tabName) {
    if (!tabName || typeof tabName !== 'string') return 'playback';
    const key = tabName.toLowerCase().trim();
    return TAB_TO_GROUP[key] || 'playback';
  }

  /**
   * Resolves the primary default tab for a given group.
   * @param {string} groupName
   * @returns {string}
   */
  function getPrimaryTabForGroup(groupName) {
    if (!groupName || typeof groupName !== 'string') return 'media';
    const key = groupName.toLowerCase().trim();
    return DEFAULT_GROUP_TAB[key] || 'media';
  }

  /**
   * Returns list of tabs assigned to a group.
   * @param {string} groupName
   * @returns {string[]}
   */
  function getTabsForGroup(groupName) {
    if (!groupName || typeof groupName !== 'string') return [];
    const key = groupName.toLowerCase().trim();
    return GROUP_TO_TABS[key] ? Array.from(GROUP_TO_TABS[key]) : [];
  }

  /**
   * Validates whether a group name is recognized.
   * @param {string} groupName
   * @returns {boolean}
   */
  function isValidGroup(groupName) {
    return typeof groupName === 'string' && Boolean(GROUP_TO_TABS[groupName.toLowerCase().trim()]);
  }

  /**
   * Validates whether a tab name is recognized.
   * @param {string} tabName
   * @returns {boolean}
   */
  function isValidTab(tabName) {
    return typeof tabName === 'string' && Boolean(TAB_TO_GROUP[tabName.toLowerCase().trim()]);
  }

  /**
   * Returns array of all valid group identifiers.
   * @returns {string[]}
   */
  function getAllGroups() {
    return Array.from(ALL_GROUPS);
  }

  /**
   * Returns array of all valid tab identifiers.
   * @returns {string[]}
   */
  function getAllTabs() {
    return Array.from(ALL_TABS);
  }

  /**
   * Evaluates the hybrid contextual navigation state.
   * Pure deterministic decision function.
   * 
   * @param {boolean} isPlaying - Active playback status
   * @param {boolean} hasActiveMedia - Detected media stream presence
   * @param {boolean} manualOverride - User explicit click latch
   * @returns {{ shouldSwitch: boolean, group: string|null, tab: string|null, reason: string }}
   */
  function evaluateHybridContext(isPlaying, hasActiveMedia, manualOverride) {
    if (manualOverride) {
      return {
        shouldSwitch: false,
        group: null,
        tab: null,
        reason: 'manual_override'
      };
    }

    if (isPlaying) {
      return {
        shouldSwitch: true,
        group: 'playback',
        tab: 'media',
        reason: 'media_playing'
      };
    }

    if (!hasActiveMedia) {
      return {
        shouldSwitch: true,
        group: 'analytics',
        tab: 'tracking',
        reason: 'media_idle'
      };
    }

    return {
      shouldSwitch: false,
      group: null,
      tab: null,
      reason: 'stable'
    };
  }

  const Tier1NavigationFeature = Object.freeze({
    GROUP_TO_TABS: GROUP_TO_TABS,
    TAB_TO_GROUP: TAB_TO_GROUP,
    DEFAULT_GROUP_TAB: DEFAULT_GROUP_TAB,
    ALL_GROUPS: ALL_GROUPS,
    ALL_TABS: ALL_TABS,
    getGroupForTab: getGroupForTab,
    getPrimaryTabForGroup: getPrimaryTabForGroup,
    getTabsForGroup: getTabsForGroup,
    isValidGroup: isValidGroup,
    isValidTab: isValidTab,
    getAllGroups: getAllGroups,
    getAllTabs: getAllTabs,
    evaluateHybridContext: evaluateHybridContext
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tier1NavigationFeature;
  }
  global.Tier1NavigationFeature = Tier1NavigationFeature;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
