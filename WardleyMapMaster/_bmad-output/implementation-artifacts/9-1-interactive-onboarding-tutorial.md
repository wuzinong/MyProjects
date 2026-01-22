# Story 9.1: Interactive Onboarding Tutorial

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a First-Time User,
I want a guided tour of the application,
so that I understand the flow from Drawing to Analysis.

## Acceptance Criteria

1. **Given** a user with no history, **When** they load the app, **Then** a multi-step overlay tutorial begins.
2. **Given** the tutorial, **When** Step 1 "Draw Shape" is active, **Then** the Draw tool is highlighted.
3. **Given** the tutorial, **When** the user completes the action, **Then** the tutorial advances to the next step.
4. **Given** the tutorial, **When** "Skip" is clicked, **Then** it closes and sets a "seen" flag.

## Tasks / Subtasks

- [ ] Implement Tutorial State
  - [ ] Add `tutorialStep` and `hasSeenTutorial` to `uiStore`
  - [ ] Persist `hasSeenTutorial` in localStorage
- [ ] Implement Tutorial Overlay Component
  - [ ] Create `TutorialOverlay.tsx` and `Spotlight.tsx`
  - [ ] Define steps config (Target ID, Message, Position, Trigger Action)
- [ ] Connect Steps to UI Elements
  - [ ] Add IDs to key UI elements (Draw Tool, Context Input, Analyze Button)
  - [ ] Implement logic to advance step (e.g., listening for store changes or specific events)
- [ ] Implement Skip/Close Logic
  - [ ] Add "Skip" button
  - [ ] Set `hasSeenTutorial = true` on completion or skip

## Dev Notes

- **Library**: `react-joyride` is excellent for this. Or build a simple custom one using Overlay portals. For MVP, custom `Spotlight` component is often cleaner than a heavy library.
- **Triggering**: "Completes the action" can be tricky. Maybe just "Next" button for MVP, unless we can easily hook into `canvasStore` actions to detect "Shape Added".

### Project Structure Notes

- `src/components/Onboarding/Tutorial.tsx`
- `src/components/Onboarding/Spotlight.tsx`

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