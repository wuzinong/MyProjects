# Story 1.3: Connect Map Components

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to draw directional lines between components,
so that I can define dependencies in the value chain.

## Acceptance Criteria

1. **Given** two existing components, **When** I use the "Connector" tool to drag from Component A to Component B, **Then** a line connects them.
2. **Given** two connected components, **When** I move Component A, **Then** the connecting line updates dynamically to stay attached.
3. **Given** a connection, **When** created, **Then** the relationship (A depends on B) is stored in the map state.

## Tasks / Subtasks

- [ ] Implement Connector Tool Interaction
  - [ ] Add "Connector" tool option to Toolbar
  - [ ] Implement drag interaction starting from a source component
  - [ ] Implement "ghost" line rendering while dragging to target
  - [ ] Handle connection creation on mouseUp over target component
- [ ] Implement Connection Rendering
  - [ ] Create `ConnectionLine` component (SVG line/path with arrow marker)
  - [ ] Render all connections from store state on SVG
  - [ ] Implement dynamic updating of line coordinates when linked nodes move
- [ ] Update Store Data Model
  - [ ] Add `relationships` array to `canvasStore`
  - [ ] Define Relationship interface (id, fromId, toId, type?)
  - [ ] Implement `addRelationship` action
  - [ ] Verify state updates correctly when connections are made

## Dev Notes

- **SVG Lines**: Use SVG `<line>` or `<path>` with `marker-end` for the arrow head.
- **Dynamic Updates**: Ensure that when a Node component re-renders (moves), the connected Lines also re-render efficiently.
- **Data Model**: Store relationships as `{ id: string, startNodeId: string, endNodeId: string }`. Don't store absolute coordinates for lines in the store; derive them from the nodes' positions at render time to ensure consistency.

### Project Structure Notes

- `src/components/Canvas/ConnectionRenderer.tsx` (new component).
- `src/components/Canvas/CanvasContainer.tsx` (needs to handle connector tool events).
- `src/store/canvasStore.ts` (update with relationships).

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