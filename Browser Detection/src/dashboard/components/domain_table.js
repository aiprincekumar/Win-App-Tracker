/**
 * Web Activity & Media Sentinel - Dashboard Domain Table Component
 * Sortable, searchable, paginated domain analytics data table.
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
      filtered = filtered.filter(it => (it.domain && it.domain.toLowerCase().includes(q)));
    }

    const totalRows = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const start = (page - 1) * pageSize;
    const rows = filtered.slice(start, start + pageSize);

    return { rows, totalRows, totalPages };
  }

  const DomainTable = {
    filterAndPaginate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainTable;
  }
  global.DomainTable = DomainTable;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
