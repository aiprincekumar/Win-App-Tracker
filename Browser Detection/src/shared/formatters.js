/**
 * Web Activity & Media Sentinel - Shared Formatters
 * Domain extraction, date formatting, duration formatting, and favicon resolver.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  function extractDomain(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.hostname.toLowerCase();
      }
      if (
        parsed.protocol === 'chrome-extension:' ||
        parsed.protocol === 'edge-extension:' ||
        parsed.protocol === 'moz-extension:' ||
        parsed.protocol === 'extension:'
      ) {
        if (parsed.pathname && parsed.pathname.includes('dashboard')) {
          return 'Dashboard';
        }
        return 'Extension';
      }
      if (parsed.protocol === 'chrome:' || parsed.protocol === 'edge:' || parsed.protocol === 'about:') {
        const scheme = parsed.protocol.replace(':', '');
        const host = parsed.hostname ? parsed.hostname.toLowerCase() : '';
        const path = parsed.pathname ? parsed.pathname.toLowerCase() : '';
        if (host === 'newtab' || path === 'newtab' || url.includes('newtab')) {
          return 'newtab';
        }
        if (host) {
          return `${scheme}://${host}`;
        }
        if (path && path !== '/' && path !== 'blank') {
          return `${scheme}:${path}`;
        }
        return scheme;
      }
    } catch (e) {}
    return null;
  }

  function getFaviconUrl(domain) {
    if (!domain || domain.includes(':') || isInternalDomain(domain)) {
      return 'icons/icon32.png';
    }
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
  }

  function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  const SharedFormatters = Object.freeze({
    getTodayDateString,
    isInternalDomain,
    extractDomain,
    getFaviconUrl,
    formatDuration
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedFormatters;
  }
  global.SharedFormatters = SharedFormatters;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
