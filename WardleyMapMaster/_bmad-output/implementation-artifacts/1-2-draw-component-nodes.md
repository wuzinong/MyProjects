# Story 1.2: Draw Component Nodes

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to place and label component nodes (rectangles, circles) on the canvas,
so that I can represent the components of my value chain.

## Acceptance Criteria

1. **Given** I am on the canvas, **When** I select the "Component" tool and click on the canvas, **Then** a default rectangle shape appears at the clicked location centered on the nearest 8px grid point.
2. **Given** an existing shape, **When** I double-click it, **Then** I can edit the text label inline.
3. **Given** I am drawing, **When** I drag the mouse, **Then** I can define the custom size of the component.
4. **Given** a shape is placed, **When** I inspect the underlying data, **Then** it is stored with an ID, label, x, y, width, and height.

## Tasks / Subtasks

- [ ] Implement Canvas Drawing Interaction
  - [ ] Add "Component" tool to toolbar state/UI
  - [ ] Implement click handler on Canvas to add default shape (rect)
  - [ ] Implement snap-to-grid (8px) logic for positioning
- [ ] Implement Shape Rendering
  - [ ] Create `RectangleNode` component (using SVG.js or Visx primitives)
  - [ ] Render shapes from store state onto SVG
- [ ] Implement Inline Editing
  - [ ] Add double-click handler to shapes
  - [ ] Show input overlay or contentEditable foreignObject for label editing
  - [ ] Update shape label in store on blur/enter
- [ ] Implement Drag-to-Resize (Creation)
  - [ ] Add drag interaction mode for creating custom sized shapes
- [ ] Test Data Structure
  - [ ] Verify shape data structure in Zustand store matches requirements (id, label, x, y, width, height)

## Dev Notes

- **Pattern**: Command Pattern or simple Event Handlers for Canvas interactions.
- **Library**: `SVG.js` or `Visx` handles low-level SVG interactions.
- **State**: `canvasStore` holds the array of shapes.
- **Grid**: 8px grid. Coordinate system starts top-left (0,0).
- **UX**: Prioritize responsiveness (60fps). Avoid React re-renders for every mousemove if possible (use refs or optimized local state before committing to global store on mouseUp).

### Project Structure Notes

- `src/components/Canvas/DrawingTools.tsx` for tool selection.
- `src/components/Canvas/CanvasContainer.tsx` for main svg and interaction handlers.
- `src/components/Canvas/ShapeRenderer.tsx` for rendering individual nodes.
- `src/store/canvasStore.ts` for shape data.

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