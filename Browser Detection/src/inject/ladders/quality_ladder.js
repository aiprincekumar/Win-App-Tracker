/**
 * Web Activity & Media Sentinel - Injected Quality Ladder
 * Quality step mappings and resolution resolver.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const QUALITY_LADDER = [
    'tiny',
    'small',
    'medium',
    'large',
    'hd720',
    'hd1080',
    'hd1440',
    'hd2160',
    'hd2880',
    'highres'
  ];

  function getQualityLabel(level) {
    switch (level) {
      case 'tiny': return '144p';
      case 'small': return '240p';
      case 'medium': return '360p';
      case 'large': return '480p';
      case 'hd720': return '720p HD';
      case 'hd1080': return '1080p FHD';
      case 'hd1440': return '1440p QHD';
      case 'hd2160': return '4K 2160p';
      case 'hd2880': return '5K 2880p';
      case 'highres': return '8K 4320p';
      default: return level || 'Auto';
    }
  }

  const QualityLadder = {
    QUALITY_LADDER,
    getQualityLabel
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = QualityLadder;
  }
  global.QualityLadder = QualityLadder;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
