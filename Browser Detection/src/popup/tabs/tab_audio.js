/**
 * Web Activity & Media Sentinel - Audio Lab Tab Controller
 * Master 0-200% boost slider, 5-band graphic equalizer, and audio presets.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const EQ_BANDS = Object.freeze(['60Hz', '250Hz', '1kHz', '4kHz', '16kHz']);

  function getEQBands() {
    return EQ_BANDS;
  }

  const TabAudio = {
    getEQBands
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabAudio;
  }
  global.TabAudio = TabAudio;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
