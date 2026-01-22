# Story 8.1: Persist Analysis History

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want my past analyses to be saved automatically,
so that I can revisit them later.

## Acceptance Criteria

1. **Given** a completed analysis, **When** finished, **Then** the full state (Map + Context + Results) is saved to the "History" list in localStorage.
2. **Given** the History page, **When** viewed, **Then** it displays a list of past items with Date, Title, and Thumbnail.
3. **Given** storage limits, **When** the history exceeds 20 items, **Then** the oldest is removed or the user is prompted.

## Tasks / Subtasks

- [ ] Implement History Store Logic
  - [ ] Add `history` array to `analysisStore` or `uiStore`
  - [ ] Implement `saveCurrentAnalysis` action
  - [ ] Implement `loadAnalysis` action
  - [ ] Implement 20-item limit logic (FIFO)
- [ ] Implement History Page UI
  - [ ] Create `src/pages/History.tsx`
  - [ ] Render grid of History Items (Cards)
  - [ ] Show Thumbnail (SVG preview), Date, Title
- [ ] Implement Load/Delete Actions
  - [ ] Clicking a history item restores state and navigates to Canvas
  - [ ] "Delete" button removes item from store

## Dev Notes

- **Thumbnail**: Generating a real image thumbnail might be heavy. For MVP, either re-render the SVG scaled down, or just show a generic icon/pattern badge if rendering 20 maps is too slow. Or cache a small PNG/SVG string.
- **Storage**: `localStorage` has a size limit (usually 5MB). 20 full maps + analysis text might hit this. Compression (LZ-string) could help, or strict limits on text.

### Project Structure Notes

- `src/pages/History.tsx`
- `src/components/History/HistoryCard.tsx`

### References

- [Epics](_bmad-output/planning-artifacts/epics-WardleyMapMaster-2026-01-21.md)
- [Architecture](_bmad-output/planning-artifacts/architecture-WardleyMapMaster-2026-01-21.md)

## Dev Agent Record

### Agent Model Used

Gemini 3 Pro (Preview)

### Debug Log References

### Completion Notes List

### File List

```,filePath: