# Story 4.2: View and Edit Result Details

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to expand a result card to see reasoning and edit the suggestion,
so that I can correct the AI where it might be wrong.

## Acceptance Criteria

1. **Given** a result card, **When** I click "Details", **Then** a drawer/expansion opens showing the full "Reasoning" text.
2. **Given** the details view, **When** I click the Context Name or Description, **Then** it becomes an editable text field.
3. **Given** I have edited a field, **When** I click away or save, **Then** the new value persists in the analysis state.
4. **Given** an edited field, **When** I click "Revert", **Then** it restores the original AI-generated text.

## Tasks / Subtasks

- [ ] Implement Details Expansion
  - [ ] Add expandable section or side drawer pattern to `ResultCard` or parent container
  - [ ] Toggle visibility on "Details" button click
  - [ ] Display full content logic (Reasoning, Name, Description, etc.)
- [ ] Implement Inline Editing
  - [ ] Create `EditableText` component
  - [ ] Switch to Input/TextArea on click
  - [ ] Save to `analysisStore` on blur/enter
- [ ] Implement Revert Logic
  - [ ] Store original AI values alongside current values in the store
  - [ ] Show "Revert" button only if value differs from original
  - [ ] Restore original value on click

## Dev Notes

- **Data Structure**: `AnalysisResultItem` should have `originalName` and `name` (or similar) to support revert. Or separate `userOverrides` object. Storing `original` alongside seems simpler for MVP.
- **UI**: Details can be an accordion expansion or a slide-over. Architecture suggests "Drawer/Modal". Slide-over is cleaner for dense info.

### Project Structure Notes

- `src/components/Common/EditableText.tsx`
- `src/components/Analysis/DetailPanel.tsx` (if using drawer approach).

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