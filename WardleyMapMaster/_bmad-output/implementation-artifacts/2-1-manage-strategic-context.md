# Story 2.1: Manage Strategic Context

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to enter and edit the business context for my map,
so that the AI understands the specific constraints and goals of my scenario.

## Acceptance Criteria

1. **Given** the strategic context panel, **When** I verify the input, **Then** it is a multi-line text area allowing 100-2000 characters.
2. **Given** I am typing context, **When** I stop properly, **Then** the text automatically saves to localStorage.
3. **Given** the context input, **When** the text is less than 50 characters, **Then** a validation warning suggests providing more detail.

## Tasks / Subtasks

- [ ] Implement Context Store Slice
  - [ ] Add `strategicContext` string field to global store (or dedicated slice)
  - [ ] Add `setStrategicContext` action
- [ ] Implement Context Panel UI
  - [ ] Create `ContextPanel` component in `src/components/Analysis` (or Sidebar)
  - [ ] Add TextArea with character count display
  - [ ] Implement visual validation state (warning for < 50 chars, error > 2000)
- [ ] Implement Auto-Save Logic
  - [ ] Use `useEffect` or store subscription to persist to `localStorage` (debounced)
  - [ ] Load initial state from `localStorage` on mount

## Dev Notes

- **Store**: Add to `analysisStore.ts` or `mapStore.ts` (since context is associated with the map). If we treat the current session as "the map", `mapStore` makes sense.
- **Validation**: Simple client-side validation.
- **Persistence**: If accessing `localStorage` directly, ensure keys are namespaced (e.g., `wmm-context`). If using Zustand `persist` middleware, this is automatic.

### Project Structure Notes

- `src/components/Analysis/ContextPanel.tsx`
- `src/store/analysisStore.ts` (new file/slice? Architecture mentions `analysisStore.ts`)

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