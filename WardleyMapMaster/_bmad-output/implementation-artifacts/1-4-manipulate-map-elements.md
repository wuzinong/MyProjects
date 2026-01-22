# Story 1.4: Manipulate Map Elements

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to move, resize, and delete shapes on the canvas,
so that I can refine my map as I think through the strategy.

## Acceptance Criteria

1. **Given** selected shapes, **When** I drag them, **Then** they move smoothly (60fps) and snap to the 8px grid upon release.
2. **Given** a selected shape, **When** I press "Delete" or click the trash icon, **Then** the shape and its associated connections are removed.
3. **Given** a shape, **When** I drag a resize handle, **Then** the shape dimensions update while maintaining the label center.

## Tasks / Subtasks

- [ ] Implement Shape Selection
  - [ ] Add `selectedShapeId` to store/local state
  - [ ] Visual indication of selection (border/handles)
- [ ] Implement Move/Drag Functionality
  - [ ] Add drag handlers to existing ShapeRenderer
  - [ ] Update shape coordinates in real-time or on efficient schedule
  - [ ] Implement 8px grid snapping on drag end
- [ ] Implement Resize Functionality
  - [ ] Render resize handles when shape is selected
  - [ ] Implement drag handlers for resize handles
  - [ ] Update width/height and re-center label logic
- [ ] Implement Deletion
  - [ ] Add "Delete" keyboard handler (Backspace/Delete key)
  - [ ] Add Toolbar Trash icon/button
  - [ ] Implement `deleteShape` action in store
  - [ ] Ensure `deleteShape` also removes associated relationships (Cascade delete)

## Dev Notes

- **Performance**: Move operations can be expensive. Avoid full React render limits. Consider using `ref` for direct DOM manipulation during drag, then commit to store on `mouseUp`.
- **Connections**: When moving a node, the connected lines must verify they update. Since Lines likely depend on Node coordinates, updating Node in store should trigger Line re-render.
- **Selection**: Click background to deselect.

### Project Structure Notes

- `src/components/Canvas/ResizeHandles.tsx` (new component).
- `src/store/canvasStore.ts`: Add `deleteShape`, update move/resize actions.

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