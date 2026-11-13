/**
 * Web Activity & Media Sentinel - Shared DOM Utilities
 * 100% W3C Trusted Types Safe DOM construction (zero innerHTML).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function createSafeElement(tag, attrs = {}, children = []) {
    if (typeof document === 'undefined') return null;
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null) continue;
      if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('data-') || key.startsWith('aria-')) {
        el.setAttribute(key, value);
      } else if (key === 'textContent') {
        el.textContent = value;
      } else {
        el[key] = value;
      }
    }
    for (const child of children) {
      if (child === undefined || child === null) continue;
      if (typeof child === 'string' || typeof child === 'number') {
        el.appendChild(document.createTextNode(String(child)));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    }
    return el;
  }

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function setSafeText(el, text) {
    if (!el) return;
    el.textContent = text != null ? String(text) : '';
  }

  const SharedDOMUtils = Object.freeze({
    createSafeElement,
    clearElement,
    setSafeText
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedDOMUtils;
  }
  global.SharedDOMUtils = SharedDOMUtils;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
