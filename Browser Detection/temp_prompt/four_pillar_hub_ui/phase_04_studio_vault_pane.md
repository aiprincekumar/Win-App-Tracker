# Phase 04: Studio Vault Pane (Notes, Bookmarks, Screenshots & Resume)

> **Phase:** 04 of 06  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/phase_04_studio_vault_pane.md`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Mandatory Anchor:** Load `memory.md`, `dynamic_departments_matrix.md`, and `temp_prompt/four_pillar_hub_ui/INDEX.md` before execution.

---

## 🎯 1. Phase Objective
Construct the complete user interface and client interactions for Pillar 3: `📚 Studio` (`#viewStudioPane`), providing a creative workstation featuring Timestamp Note-taking with "📌 Pin Note", Bookmarked Clips library with jump-to seeking, Screenshots Gallery with thumbnail previews, and a "Pick Up Where You Left Off" session resumption card.

---

## 📋 2. Prerequisites & Inputs
- Phase 01 completed (pane placeholder `#viewStudioPane` exists).
- Target files: `popup/popup.html`, `popup/popup.css`, `popup/popup.js`.
- Existing verification suite: `tests/test_syntax_and_manifest_integrity.js`.

---

## ⚓ 3. Technical Context & File Anchors
- `popup/popup.html`: Inside `#viewStudioPane`.
- `popup/popup.css`: Studio card styles, notes list, and screenshot thumbnails grid.
- `popup/popup.js`: Studio note creation, DOM item rendering via `document.createElement`, `chrome.storage.local` persistence, and clip jump dispatch.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Populate `#viewStudioPane` in `popup/popup.html`:**
   - **Card 1: Timestamp Note-Taking Card:**
     ```html
     <section class="studio-card notes-card">
       <div class="studio-card-header">
         <span class="studio-card-title">📌 Timestamp Note</span>
         <span id="studioActiveTimestampBadge" class="badge badge-accent">00:00</span>
       </div>
       <div class="note-input-row">
         <input type="text" id="studioNoteInput" class="studio-input" placeholder="Note what happened here..." aria-label="Timestamp Note Input">
         <button id="btnStudioPinNote" class="btn-pin-note" title="Pin Note at Current Time">
           📌 Pin
         </button>
       </div>
     </section>
     ```
   - **Card 2: Bookmarked Clips & Timestamps List:**
     ```html
     <section class="studio-card clips-card">
       <div class="studio-card-header">
         <span class="studio-card-title">📑 Bookmarked Moments</span>
         <button id="btnClearStudioBookmarks" class="btn-text-sm" title="Clear all bookmarks">Clear All</button>
       </div>
       <div id="studioBookmarksList" class="studio-items-list">
         <div class="empty-state-sm">
           <span>No bookmarked timestamps yet. Click 📌 Pin above!</span>
         </div>
       </div>
     </section>
     ```
   - **Card 3: Screenshots Gallery Card:**
     ```html
     <section class="studio-card gallery-card">
       <div class="studio-card-header">
         <span class="studio-card-title">📸 Frame Captures</span>
       </div>
       <div id="studioScreenshotsGrid" class="screenshots-grid">
         <div class="empty-state-sm">
           <span>Click 📸 Snap in Player to capture frames.</span>
         </div>
       </div>
     </section>
     ```
   - **Card 4: Pick Up Where You Left Off Card:**
     ```html
     <section id="studioResumeCard" class="studio-card resume-card hidden">
       <div class="studio-card-header">
         <span class="studio-card-title">⏳ Pick Up Where You Left Off</span>
       </div>
       <div class="resume-card-body">
         <div class="resume-video-info">
           <span id="resumeVideoTitle" class="resume-title">Last Watched Title</span>
           <span id="resumeVideoMeta" class="resume-meta">youtube.com • Paused at 05:42</span>
         </div>
         <button id="btnStudioResumeLastMedia" class="btn-resume-action" title="Resume Playback">
           ▶️ Resume
         </button>
       </div>
     </section>
     ```

2. **Add CSS in `popup/popup.css`:**
   - Add `.studio-card`, `.note-input-row`, `.btn-pin-note`, `.studio-items-list`, `.clip-item`, `.screenshots-grid`.
   - Ensure clean scrollable overflow (`max-height: 180px; overflow-y: auto;`) for `#studioBookmarksList` with custom scrollbar styling.

3. **Wire Logic in `popup/popup.js`:**
   - Listen to `#btnStudioPinNote`:
     - Reads current active media time (from telemetry) or fallback to `0`.
     - Validates `#studioNoteInput.value.trim()`.
     - Appends note object `{ id, timestamp, timestampFormatted, text, title, url, createdAt }` to `studioNotes` array.
     - Saves array to `chrome.storage.local`.
     - Renders item dynamically via `document.createElement` (100% CSP compliant, 0 `innerHTML`).
     - Shows toast notification "Note pinned!".
   - Clicking a clip item's jump button calls `sendMediaControl('SEEK_POSITION', { positionSeconds: clip.timestamp })`.
   - Update `#studioActiveTimestampBadge` during media telemetry ticks.

---

## 🚫 5. Architectural Constraints & Boundaries
- NEVER assign user text to `element.innerHTML` (use `element.textContent` strictly for Trusted Types safety).
- Do NOT block UI during note saving or deletion.

---

## 📦 6. Deliverables Manifest
- Modified: `popup/popup.html`
- Modified: `popup/popup.css`
- Modified: `popup/popup.js`

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node -c popup/popup.js
node tests/test_syntax_and_manifest_integrity.js
```
Must pass with 100% success and exit code 0.
