/**
 * Web Activity & Media Sentinel - Dashboard Domain Table Component
 * Sortable, searchable, paginated domain analytics data table.
 * 100% W3C Trusted Types compliant (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function filterAndPaginate(items, search = '', page = 1, pageSize = 15) {
    if (!Array.isArray(items)) return { rows: [], totalRows: 0, totalPages: 1 };

    let filtered = items;
    const q = (search || '').toLowerCase().trim();
    if (q) {
      filtered = filtered.filter((it) => it && it.domain && it.domain.toLowerCase().includes(q));
    }

    const totalRows = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const start = (page - 1) * pageSize;
    const rows = filtered.slice(start, start + pageSize);

    return { rows, totalRows, totalPages };
  }

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function buildDomainTableRow(it, options = {}) {
    const doc = options.document || (typeof document !== 'undefined' ? document : null);
    if (!doc) return null;

    const formatDuration = typeof options.formatDuration === 'function' ? options.formatDuration : (s) => `${s}s`;
    const formatTimestamp = typeof options.formatTimestamp === 'function' ? options.formatTimestamp : (ts) => String(ts);
    const t = typeof options.t === 'function' ? options.t : (k, arg) => (arg !== undefined ? `${arg} sessions` : k);
    const isInternalDomain = typeof options.isInternalDomain === 'function' ? options.isInternalDomain : () => false;

    const isInternal = Boolean(it.isInternal || isInternalDomain(it.domain));

    const tr = doc.createElement('tr');

    // 1. Column Domain
    const tdDomain = doc.createElement('td');
    tdDomain.className = 'col-domain';

    const cellDiv = doc.createElement('div');
    cellDiv.className = 'domain-cell';

    const favImg = doc.createElement('img');
    favImg.src = it.favicon || '../icons/icon32.png';
    favImg.alt = '';
    favImg.className = 'domain-fav';
    favImg.addEventListener('error', () => {
      favImg.src = '../icons/icon32.png';
    }, { once: true });

    const nameSpan = doc.createElement('span');
    nameSpan.className = 'domain-name-text';
    nameSpan.textContent = it.domain || '';

    cellDiv.appendChild(favImg);
    cellDiv.appendChild(nameSpan);

    if (it.domain === 'Dashboard' || it.domain === 'Extension') {
      const extBadge = doc.createElement('span');
      extBadge.className = 'badge-tag badge-extension';
      extBadge.title = 'Extension Dashboard';
      extBadge.textContent = `🧩 ${it.domain}`;
      cellDiv.appendChild(extBadge);
    } else if (isInternal) {
      const internalBadge = doc.createElement('span');
      internalBadge.className = 'badge-tag badge-internal';
      internalBadge.title = 'Internal Browser Scheme';
      internalBadge.textContent = '⚙️ Internal';
      cellDiv.appendChild(internalBadge);
    }

    tdDomain.appendChild(cellDiv);

    // 2. Column Time
    const tdTime = doc.createElement('td');
    tdTime.className = 'col-time';

    const timeMain = doc.createElement('span');
    timeMain.className = 'time-cell-main';
    timeMain.textContent = formatDuration(it.computedSeconds || 0);

    const dualPills = doc.createElement('div');
    dualPills.className = 'time-dual-pills';

    const pillFg = doc.createElement('span');
    pillFg.className = 'pill-mini-fg';
    pillFg.title = 'Foreground Active Time';
    pillFg.textContent = `🖥️ ${formatDuration(it.foregroundSeconds || 0)}`;

    const pillBg = doc.createElement('span');
    pillBg.className = 'pill-mini-bg';
    pillBg.title = 'Background Media Playback Time';
    pillBg.textContent = `🎵 ${formatDuration(it.backgroundMediaSeconds || 0)}`;

    dualPills.appendChild(pillFg);
    dualPills.appendChild(pillBg);
    tdTime.appendChild(timeMain);
    tdTime.appendChild(dualPills);

    // 3. Column Ratio
    const tdRatio = doc.createElement('td');
    tdRatio.className = 'col-ratio';

    const ratioWrapper = doc.createElement('div');
    ratioWrapper.className = 'table-ratio-wrapper';

    const ratioTrack = doc.createElement('div');
    ratioTrack.className = 'table-ratio-track';

    const ratioFill = doc.createElement('div');
    ratioFill.className = 'table-ratio-fill';
    ratioFill.style.width = `${it.ratioPercent || 0}%`;
    ratioTrack.appendChild(ratioFill);

    const ratioPct = doc.createElement('span');
    ratioPct.className = 'table-ratio-pct';
    ratioPct.textContent = `${it.ratioPercent || 0}%`;

    ratioWrapper.appendChild(ratioTrack);
    ratioWrapper.appendChild(ratioPct);
    tdRatio.appendChild(ratioWrapper);

    // 4. Column Sessions
    const tdSessions = doc.createElement('td');
    tdSessions.className = 'col-sessions';

    const sessionsBadge = doc.createElement('span');
    sessionsBadge.className = 'badge-tag';
    sessionsBadge.textContent = t('session_unit', it.sessions || 1);
    tdSessions.appendChild(sessionsBadge);

    // 5. Column Last Active
    const tdLast = doc.createElement('td');
    tdLast.className = 'col-last';

    const lastSpan = doc.createElement('span');
    lastSpan.className = 'time-last-active';
    lastSpan.textContent = formatTimestamp(it.lastActive);
    tdLast.appendChild(lastSpan);

    tr.appendChild(tdDomain);
    tr.appendChild(tdTime);
    tr.appendChild(tdRatio);
    tr.appendChild(tdSessions);
    tr.appendChild(tdLast);

    return tr;
  }

  function renderDomainTable(tbody, countBadge, emptyBox, items, options = {}) {
    if (!tbody) return;
    const doc = options.document || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    clearElement(tbody);

    const t = typeof options.t === 'function' ? options.t : (k, arg) => (arg !== undefined ? `${arg} domains` : k);
    const domainSearchQuery = options.searchQuery || '';
    const selectedTrackingMode = options.trackingMode || 'all';

    if (!Array.isArray(items) || items.length === 0) {
      if (countBadge) countBadge.textContent = t('domain_count_suffix', 0);
      if (emptyBox) {
        emptyBox.classList.remove('hidden');
        const emptyIconEl = emptyBox.querySelector('.empty-icon');
        const emptyTextEl = doc.getElementById ? doc.getElementById('txtDomainEmpty') : emptyBox.querySelector('.empty-text');
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
    if (countBadge) countBadge.textContent = t('domain_count_suffix', items.length);

    items.forEach((it) => {
      const tr = buildDomainTableRow(it, options);
      if (tr) tbody.appendChild(tr);
    });
  }

  const DomainTable = {
    filterAndPaginate,
    buildDomainTableRow,
    renderDomainTable
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainTable;
  }
  global.DomainTable = DomainTable;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
