/**
 * Web Activity & Media Sentinel - Dashboard Domain Table Component
 * Sortable, searchable, paginated domain analytics data table.
 * Features 7 & 8: Starred/Pinned Domains, Inline Domain Annotations & Daily Time Budget Badges.
 * 100% W3C Trusted Types compliant (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function filterAndPaginate(items, search = '', page = 1, pageSize = 15, options = {}) {
    if (!Array.isArray(items)) return { rows: [], totalRows: 0, totalPages: 1 };

    let filtered = items;
    const q = (search || '').toLowerCase().trim();
    if (q) {
      filtered = filtered.filter((it) => {
        if (!it || !it.domain) return false;
        if (it.domain.toLowerCase().includes(q)) return true;
        const note = (options.domainAnnotations && options.domainAnnotations[it.domain.toLowerCase()]) || it.note || '';
        if (note && note.toLowerCase().includes(q)) return true;
        return false;
      });
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
    const domainLower = String(it.domain || '').toLowerCase();

    // Check Star / Pin State (Feature 7)
    const starredList = Array.isArray(options.starredDomains) ? options.starredDomains : [];
    const isStarred = Boolean(it.isStarred || starredList.includes(domainLower));

    // Check Domain Notes / Annotation (Feature 7)
    const notesMap = (options.domainAnnotations && typeof options.domainAnnotations === 'object') ? options.domainAnnotations : {};
    const noteText = notesMap[domainLower] || notesMap[it.domain] || it.note || '';
    const hasNote = Boolean(noteText && noteText.trim().length > 0);

    // Check Budget Status (Feature 8)
    const budgetStatus = it.budgetStatus || (options.getBudgetStatus && options.getBudgetStatus(it.domain, it.computedSeconds)) || null;

    const tr = doc.createElement('tr');
    if (isStarred) {
      tr.classList.add('row-starred');
    }

    // 1. Column Domain
    const tdDomain = doc.createElement('td');
    tdDomain.className = 'col-domain';

    const cellDiv = doc.createElement('div');
    cellDiv.className = 'domain-cell';

    // Star / Pin Button (Feature 7)
    const starBtn = doc.createElement('button');
    starBtn.type = 'button';
    starBtn.className = 'btn-star-domain' + (isStarred ? ' starred' : '');
    starBtn.setAttribute('data-domain', it.domain || '');
    starBtn.setAttribute('aria-label', isStarred ? 'Unstar ' + it.domain : 'Star ' + it.domain);
    starBtn.title = isStarred ? 'Pinned to top (Click to unpin)' : 'Click to pin to top';
    starBtn.textContent = '⭐';
    if (typeof options.onToggleStar === 'function') {
      starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onToggleStar(it.domain);
      });
    }
    cellDiv.appendChild(starBtn);

    const favImg = doc.createElement('img');
    favImg.src = it.favicon || '../icons/icon32.png';
    favImg.alt = '';
    favImg.className = 'domain-fav';
    favImg.addEventListener('error', () => {
      favImg.src = '../icons/icon32.png';
    }, { once: true });
    cellDiv.appendChild(favImg);

    const nameSpan = doc.createElement('span');
    nameSpan.className = 'domain-name-text';
    nameSpan.textContent = it.domain || '';
    cellDiv.appendChild(nameSpan);

    // Note Action Button (Feature 7)
    const noteBtn = doc.createElement('button');
    noteBtn.type = 'button';
    noteBtn.className = 'btn-domain-note' + (hasNote ? ' has-note' : '');
    noteBtn.setAttribute('data-domain', it.domain || '');
    noteBtn.setAttribute('aria-label', hasNote ? 'Edit note for ' + it.domain : 'Add note for ' + it.domain);
    noteBtn.title = hasNote ? `Note: ${noteText}` : 'Add project note';
    noteBtn.textContent = '📝';
    if (typeof options.onEditNote === 'function') {
      noteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onEditNote(it.domain);
      });
    }
    cellDiv.appendChild(noteBtn);

    // Badges: Extension, Internal
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

    // Daily Time Budget Status Badge (Feature 8)
    if (budgetStatus) {
      if (budgetStatus.reached) {
        const reachedBadge = doc.createElement('span');
        reachedBadge.className = 'badge-budget-reached';
        reachedBadge.title = `Daily limit reached (${budgetStatus.budgetMinutes}m)`;
        reachedBadge.textContent = '🛑 Limit Reached';
        cellDiv.appendChild(reachedBadge);
      } else if (budgetStatus.warning80) {
        const warnBadge = doc.createElement('span');
        warnBadge.className = 'badge-budget-warning';
        warnBadge.title = `80% of daily limit consumed (${budgetStatus.budgetMinutes}m)`;
        warnBadge.textContent = '⚠️ 80% Limit';
        cellDiv.appendChild(warnBadge);
      }
    }

    // Inline Note Preview (Feature 7)
    if (hasNote) {
      const notePreview = doc.createElement('span');
      notePreview.className = 'domain-note-preview';
      notePreview.title = noteText;
      notePreview.textContent = `📌 ${noteText}`;
      cellDiv.appendChild(notePreview);
    }

    tdDomain.appendChild(cellDiv);

    // 2. Column Category (Feature 2: Productivity Classifier)
    const tdCategory = doc.createElement('td');
    tdCategory.className = 'col-category';

    const catSelect = doc.createElement('select');
    catSelect.className = 'domain-cat-select styled-select';
    catSelect.setAttribute('data-domain', it.domain || '');
    catSelect.setAttribute('aria-label', `Category for ${it.domain}`);

    const getCategoryFn = typeof options.getDomainCategory === 'function'
      ? options.getDomainCategory
      : ((typeof globalThis !== 'undefined' && globalThis.TemporalProductivityFeature)
        ? globalThis.TemporalProductivityFeature.getDomainCategory
        : () => 'work');

    const assignedCat = it.category || getCategoryFn(it.domain, options.domainCategoryOverrides);

    const catList = [
      { id: 'work', key: 'cat_work', label: '💼 Work & Dev' },
      { id: 'learning', key: 'cat_learning', label: '📚 Learning & Research' },
      { id: 'entertainment', key: 'cat_entertainment', label: '🎮 Entertainment & Media' },
      { id: 'social', key: 'cat_social', label: '💬 Social & Chat' },
      { id: 'utility', key: 'cat_utility', label: '⚙️ Utilities & Tools' }
    ];

    catList.forEach((c) => {
      const opt = doc.createElement('option');
      opt.value = c.id;
      opt.textContent = typeof t === 'function' ? t(c.key) : c.label;
      if (c.id === assignedCat) {
        opt.selected = true;
      }
      catSelect.appendChild(opt);
    });

    if (typeof options.onCategoryChange === 'function') {
      catSelect.addEventListener('change', (e) => {
        options.onCategoryChange(it.domain, e.target.value);
      });
    } else if (typeof globalThis !== 'undefined' && typeof globalThis.handleCategoryOverride === 'function') {
      catSelect.addEventListener('change', (e) => {
        globalThis.handleCategoryOverride(it.domain, e.target.value);
      });
    }

    tdCategory.appendChild(catSelect);

    // 3. Column Time
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

    // 4. Column Ratio
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

    // 5. Column Sessions
    const tdSessions = doc.createElement('td');
    tdSessions.className = 'col-sessions';

    const sessionsBadge = doc.createElement('span');
    sessionsBadge.className = 'badge-tag';
    sessionsBadge.textContent = t('session_unit', it.sessions || 1);
    tdSessions.appendChild(sessionsBadge);

    // 6. Column Last Active
    const tdLast = doc.createElement('td');
    tdLast.className = 'col-last';

    const lastSpan = doc.createElement('span');
    lastSpan.className = 'time-last-active';
    lastSpan.textContent = formatTimestamp(it.lastActive);
    tdLast.appendChild(lastSpan);

    tr.appendChild(tdDomain);
    tr.appendChild(tdCategory);
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

    // Apply Star / Pin ordering: Starred domains pinned to top (Feature 7)
    let displayList = items;
    if (Array.isArray(options.starredDomains) && options.starredDomains.length > 0) {
      const starred = [];
      const unstarred = [];
      displayList.forEach(it => {
        const domLower = String(it.domain || '').toLowerCase();
        if (options.starredDomains.includes(domLower)) {
          starred.push(it);
        } else {
          unstarred.push(it);
        }
      });
      displayList = starred.concat(unstarred);
    }

    displayList.forEach((it) => {
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
