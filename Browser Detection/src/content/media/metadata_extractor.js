/**
 * Web Activity & Media Sentinel - Content Metadata Extractor
 * Platform-specific media title, channel, and resolution detection.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function getResolutionLabel(video) {
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    const h = video.videoHeight;
    const w = video.videoWidth;
    if (h >= 4320 || w >= 7680) return '8K 4320p';
    if (h >= 2160 || w >= 3840) return '4K 2160p';
    if (h >= 1440 || w >= 2560) return '1440p QHD';
    if (h >= 1080 || w >= 1920) return '1080p FHD';
    if (h >= 720 || w >= 1280) return '720p HD';
    if (h >= 480) return '480p SD';
    if (h >= 360) return '360p';
    if (h >= 240) return '240p';
    if (h >= 144) return '144p';
    return `${w}x${h}`;
  }

  function extractMediaTitle(video) {
    if (typeof document === 'undefined') return 'Media';
    const host = (location && location.hostname) ? location.hostname.toLowerCase() : '';

    if (host.includes('youtube.com')) {
      const ytTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, #title h1 yt-formatted-string, ytd-watch-flexy #title h1');
      if (ytTitle && ytTitle.textContent && ytTitle.textContent.trim()) {
        return ytTitle.textContent.trim();
      }
    }

    if (host.includes('netflix.com')) {
      const netflixTitle = document.querySelector('.video-title, [data-uia="video-title"]');
      if (netflixTitle && netflixTitle.textContent) {
        return netflixTitle.textContent.trim();
      }
    }

    if (host.includes('spotify.com')) {
      const spotifyTrack = document.querySelector('[data-testid="now-playing-widget"] [data-testid="context-item-info-title"]');
      if (spotifyTrack && spotifyTrack.textContent) {
        return spotifyTrack.textContent.trim();
      }
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
      return ogTitle.content.trim();
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && twitterTitle.content) {
      return twitterTitle.content.trim();
    }

    if (document.title && document.title.trim()) {
      return document.title.replace(/\s*-\s*YouTube.*$/i, '').trim();
    }

    return 'Media';
  }

  const MetadataExtractor = {
    getResolutionLabel,
    extractMediaTitle
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetadataExtractor;
  }
  global.MetadataExtractor = MetadataExtractor;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
