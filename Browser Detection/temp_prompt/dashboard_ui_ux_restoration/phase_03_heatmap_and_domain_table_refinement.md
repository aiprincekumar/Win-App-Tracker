# Phase 03: Heatmap & Domain Table Aesthetic Refinement
## Subsystem Execution Specification: Compact Chrono Matrix & Table Badge Popover

> **Phase:** 03 of 04  
> **Task ID:** `TASK-DASHBOARD-UIUX-RESTORE-PHASE-03`  
> **Target Subsystems:** 168-Cell Hourly Activity Heatmap & Domain Table  
> **Master Reference:** [`dashboard_ui_ux_restoration_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** `dashboard/dashboard.html`, `src/dashboard/components/domain_table.js`, `dashboard/styles/tracking.css`  
> **Pre-Condition:** Phases 1 and 2 certified; zero application code edits during prompt stage.  
> **Authorization Token:** `AUTH-MGR-20261117-UIUX-RESTORE-003`  

---

## 🎯 1. Phase 3 Objectives

1. **Refine 168-Cell Activity Heatmap:** Re-architect `#cardHourlyHeatmap` into a sleek, compact GitHub/Linear-style contribution matrix. Reduce card height from 380px to <= 240px, use 16px rounded cells, milestone hour marks (00, 04, 08, 12, 16, 20), and a floating glassmorphism tooltip on hover.
2. **Eliminate Native HTML `<select>` from Domain Table:** Remove crude inline dropdowns from table rows. Replace with an ergonomic `.badge-productivity` pill that opens a sleek 3-option popover on click.
3. **Consolidate Table Row Actions:** Group ⭐ favorite star and 📝 notes buttons into an elegant `.cell-quick-actions` hover cluster, restoring a compact 42px row height and uniform text alignment.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 3.1: Compact Heatmap DOM & CSS Architecture
In `dashboard/styles/tracking.css`, update heatmap layout:

```css
/* Linear-Style Compact Heatmap */
.heatmap-card-compact {
  padding: 1.25rem;
}

.chrono-heatmap-wrapper {
  overflow-x: auto;
  padding: 0.5rem 0;
  width: 100%;
}

.chrono-heatmap-grid-compact {
  display: grid;
  grid-template-columns: 44px repeat(24, 16px);
  gap: 3px;
  align-items: center;
  justify-content: start;
}

.heatmap-cell {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.heatmap-cell:hover {
  transform: scale(1.3);
  z-index: 10;
  box-shadow: 0 0 8px var(--accent-emerald);
}

/* Floating Glassmorphism Tooltip */
.heatmap-floating-tooltip {
  position: fixed;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-primary);
  pointer-events: none;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
```

### Step 3.2: Domain Table Productivity Pill Popover in `src/dashboard/components/domain_table.js`
Replace the inline `<select class="productivity-select">` creation with:

```javascript
// RESTORED: Ergonomic Badge Pill
function createProductivityCell(domain, category) {
  const td = document.createElement('td');
  td.className = 'col-productivity';

  const badge = document.createElement('button');
  badge.type = 'button';
  badge.className = `badge-productivity cat-${category || 'neutral'}`;
  badge.setAttribute('data-domain', domain);
  badge.setAttribute('data-cat', category || 'neutral');
  badge.title = 'Click to classify domain';

  const dot = document.createElement('span');
  dot.className = 'prod-dot';
  const label = document.createElement('span');
  label.className = 'prod-label';
  label.textContent = formatCategoryName(category || 'neutral');
  const chevron = document.createElement('span');
  chevron.className = 'prod-chevron';
  chevron.textContent = '▾';

  badge.appendChild(dot);
  badge.appendChild(label);
  badge.appendChild(chevron);

  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    openProductivityPopover(badge, domain, category);
  });

  td.appendChild(badge);
  return td;
}
```

### Step 3.3: Sleek Hover Action Cluster
In `src/dashboard/components/domain_table.js`:

```javascript
function createActionsCell(domain, isStarred, hasNote) {
  const td = document.createElement('td');
  td.className = 'col-actions text-right';

  const cluster = document.createElement('div');
  cluster.className = 'cell-quick-actions';

  // Star Button
  const btnStar = document.createElement('button');
  btnStar.type = 'button';
  btnStar.className = `btn-row-star ${isStarred ? 'starred' : ''}`;
  btnStar.title = isStarred ? 'Unstar domain' : 'Star domain';
  btnStar.textContent = isStarred ? '★' : '☆';
  btnStar.addEventListener('click', () => toggleStarDomain(domain));

  // Note Button
  const btnNote = document.createElement('button');
  btnNote.type = 'button';
  btnNote.className = `btn-row-note ${hasNote ? 'has-note' : ''}`;
  btnNote.title = hasNote ? 'View/edit domain note' : 'Add domain note';
  btnNote.textContent = '📝';
  btnNote.addEventListener('click', () => openDomainNoteModal(domain));

  cluster.appendChild(btnStar);
  cluster.appendChild(btnNote);
  td.appendChild(cluster);
  return td;
}
```

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] 168-cell heatmap takes less than 240px vertical space with clean 16px cells.
- [ ] Domain table row height is exactly 42px without vertical bulging.
- [ ] Productivity dropdown no longer uses OS-native select; clicking badge opens sleek popover.
- [ ] Category changes persist to `chrome.storage.local` and update productivity score immediately.
- [ ] All 44 test suites remain green.
