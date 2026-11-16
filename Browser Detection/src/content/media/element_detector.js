/**
 * Web Activity & Media Sentinel - Element Detector Subsystem
 * Scans DOM and Shadow DOM for video/audio elements, scores active playback, and selects primary media.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function getResolutionLabel(width, height, isVideo = true, element = null) {
    if (!isVideo) return 'Audio Stream';

    if (width && height && width > 0 && height > 0) {
      const maxDim = Math.max(width, height);
      const minDim = Math.min(width, height);

      if (maxDim >= 3840 || minDim >= 2160) return '4K UHD (2160p)';
      if (maxDim >= 2560 || minDim >= 1440) return '2K QHD (1440p)';
      if (maxDim >= 1920 || minDim >= 1080) return '1080p FHD';
      if (maxDim >= 1280 || minDim >= 720) return '720p HD';
      if (maxDim >= 854 || minDim >= 480) return '480p SD';
      if (maxDim >= 640 || minDim >= 360) return '360p Low';
      if (maxDim >= 426 || minDim >= 240) return '240p Low';
      return ${width}x;
    }

    if (element) {
      try {
        const vw = element.videoWidth || 0;
        const vh = element.videoHeight || 0;
        if (vw > 0 && vh > 0) {
          return getResolutionLabel(vw, vh, true, null);
        }

        const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
        const dispW = element.offsetWidth || (rect ? rect.width : 0);
        const dispH = element.offsetHeight || (rect ? rect.height : 0);
        if (dispW >= 1920 || dispH >= 1080) return '1080p FHD (Display)';
        if (dispW >= 1280 || dispH >= 720) return '720p HD (Display)';
        if (dispW >= 854 || dispH >= 480) return '480p SD (Display)';
        if (dispW > 0 && dispH > 0) return ${Math.round(dispW)}x;
      } catch (_) {}
    }

    return 'Video (Auto)';
  }

  function findAllMediaNodes(root = (typeof document !== 'undefined' ? document : null)) {
    if (!root) return [];
    const results = [];
    const seen = new Set();
    const queue = [root];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      try {
        const media = current.querySelectorAll ? current.querySelectorAll('video, audio') : [];
        for (let i = 0; i < media.length; i++) {
          if (!seen.has(media[i])) {
            seen.add(media[i]);
            results.push(media[i]);
          }
        }

        const elements = current.querySelectorAll ? current.querySelectorAll('*') : [];
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].shadowRoot) {
            queue.push(elements[i].shadowRoot);
          }
        }
      } catch (_) {}
    }

    return results;
  }

  function findMediaElements(root = (typeof document !== 'undefined' ? document : null)) {
    return findAllMediaNodes(root);
  }

  function determineMediaState(media) {
    if (!media) return 'idle';
    if (media.ended) return 'stopped';
    if (media.readyState === 0 && (!media.currentTime || media.currentTime === 0) && !media.duration) {
      return 'idle';
    }
    if (media.seeking || (media.readyState < 3 && !media.paused && media.networkState === 2)) {
      return 'buffering';
    }
    if (!media.paused) {
      if (media.muted || media.volume === 0) return 'muted_playing';
      return 'playing';
    }
    return 'paused';
  }

  function calculateMediaScore(media, info) {
    let score = 0;
    const isVideo = (info.mediaType === 'video');

    if (media.matches) {
      if (media.matches('video.html5-main-video, .html5-main-video, #movie_player video, .video-stream.html5-main-video')) {
        score += 100000;
      } else if (media.matches('.video-stream')) {
        score += 60000;
      }
    }
    if (media.closest) {
      if (media.closest('#movie_player, .html5-video-player, ytd-watch-flexy #player, .watch-video--player-view')) {
        score += 50000;
      }
    }

    if (isVideo) score += 10000; else score += 1000;

    if (info.state === 'playing') score += 40000;
    else if (info.state === 'muted_playing') score += 30000;
    else if (info.state === 'buffering') score += 25000;
    else if (info.state === 'paused' && info.currentTime > 0) score += 15000;
    else if (info.state === 'paused') score += 5000;

    if (isVideo && info.videoWidth > 0 && info.videoHeight > 0) {
      score += 20000;
      score += Math.min(10000, Math.round((info.videoWidth * info.videoHeight) / 1000));
    }

    try {
      const rect = media.getBoundingClientRect ? media.getBoundingClientRect() : null;
      const dispW = media.offsetWidth || (rect ? rect.width : 0);
      const dispH = media.offsetHeight || (rect ? rect.height : 0);
      if (dispW >= 320 && dispH >= 180) score += 15000;
      else if (dispW > 100 && dispH > 60) score += 5000;
      else if (dispW === 0 || dispH === 0) score -= 25000;
    } catch (_) {}

    if (info.duration > 0) {
      score += 10000;
      if (info.duration > 15) score += 5000;
    } else if (info.isLive) {
      score += 12000;
    }

    if (info.currentTime > 0) score += 5000;
    if (!info.isMuted && info.volume > 0.05) score += 3000;
    return score;
  }

  function findPrimaryVideo() {
    if (typeof document === 'undefined') return null;
    const videos = Array.from(document.querySelectorAll('video'));
    if (!videos.length) return null;
    if (videos.length === 1) return videos[0];

    const playing = videos.filter(v => !v.paused && !v.ended && v.readyState > 2);
    if (playing.length > 0) {
      playing.sort((a, b) => ((b.videoWidth || 0) * (b.videoHeight || 0)) - ((a.videoWidth || 0) * (a.videoHeight || 0)));
      return playing[0];
    }
    videos.sort((a, b) => ((b.videoWidth || 0) * (b.videoHeight || 0)) - ((a.videoWidth || 0) * (a.videoHeight || 0)));
    return videos[0];
  }

  const ElementDetector = {
    getResolutionLabel,
    findAllMediaNodes,
    findMediaElements,
    determineMediaState,
    calculateMediaScore,
    findPrimaryVideo
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElementDetector;
  }
  global.ElementDetector = ElementDetector;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
