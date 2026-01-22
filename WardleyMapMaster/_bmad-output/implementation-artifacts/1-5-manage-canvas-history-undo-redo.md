# Story 1.5: Manage Canvas History (Undo/Redo)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to undo and redo my actions,
so that I can experiment without fear of making permanent mistakes.

## Acceptance Criteria

1. **Given** I have made changes (added/moved/deleted shapes), **When** I press Cmd+Z (or Undo button), **Then** the canvas reverts to the previous state.
2. **Given** I have undone an action, **When** I press Cmd+Shift+Z (or Redo button), **Then** the action is reapplied.
3. **Given** the history stack, **When** tested, **Then** it supports at least 20 levels of history.

## Tasks / Subtasks

- [ ] Implement History Management in Store
  - [ ] Add `past` and `future` stacks to global store or use `zundo` middleware
  - [ ] Configure to track changes in `shapes` and `relationships`
  - [ ] Implement `undo()` and `redo()` actions
  - [ ] Set history limit (e.g., 50 steps)
- [ ] Implement Keyboard Shortcuts
  - [ ] Add global keydown listener for `Ctrl+Z` / `Cmd+Z` (Undo)
  - [ ] Add global keydown listener for `Ctrl+Shift+Z` / `Cmd+Shift+Z` / `Cmd+Y` (Redo)
- [ ] Implement Toolbar Controls
  - [ ] Add Undo and Redo buttons to Toolbar
  - [ ] Disable buttons when stack is empty (visual feedback)
- [ ] Logic Verification
  - [ ] Verify intricate sequences (Draw -> Move -> Undo -> Move -> Redo) work correctly without corrupting state

## Dev Notes

- **Middleware**: `zundo` is a popular middleware for Zustand for undo/redo. It simplifes this greatly. If preferred to build manual, ensure we use immutable updates.
- **Scope**: Ensure only relevant parts of the state (canvas data) are tracked, not transient UI state (like `isDragging` or modal visibility).
- **Performance**: Deep cloning large state can be slow, but for MVP shape counts (50+), structured clone or simple spread usually suffices.

### Project Structure Notes

- `src/store/canvasStore.ts`: modifications for history.
- `src/components/Canvas/DrawingTools.tsx`: Add buttons.
- `src/hooks/useKeyboardShortcuts.ts` (helper).

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