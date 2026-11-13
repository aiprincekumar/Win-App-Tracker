/**
 * Web Activity & Media Sentinel - Element Detector Subsystem
 * Scans DOM for video/audio elements and observes SPA transitions.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function findMediaElements(root = document) {
    if (!root || typeof root.querySelectorAll !== 'function') return [];
    const videos = Array.from(root.querySelectorAll('video'));
    const audios = Array.from(root.querySelectorAll('audio'));
    return [...videos, ...audios];
  }

  function findPrimaryVideo() {
    if (typeof document === 'undefined') return null;
    const videos = Array.from(document.querySelectorAll('video'));
    if (!videos.length) return null;
    if (videos.length === 1) return videos[0];

    const playing = videos.filter(v => !v.paused && !v.ended && v.readyState > 2);
    if (playing.length > 0) {
      playing.sort((a, b) => (b.videoWidth * b.videoHeight) - (a.videoWidth * a.videoHeight));
      return playing[0];
    }
    videos.sort((a, b) => (b.videoWidth * b.videoHeight) - (a.videoWidth * a.videoHeight));
    return videos[0];
  }

  const ElementDetector = {
    findMediaElements,
    findPrimaryVideo
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElementDetector;
  }
  global.ElementDetector = ElementDetector;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
