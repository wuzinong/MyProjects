# Story 4.1: Display Progressive Analysis Cards

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to see analysis items (Bounded Contexts) appear as cards as they are generated,
so that I can start reading immediately.

## Acceptance Criteria

1. **Given** streaming data is arriving, **When** a new Bounded Context is identified, **Then** a card appears in the results panel.
2. **Given** a result card, **When** rendered, **Then** it displays the Context Name, Description, and a colored Confidence Badge.
3. **Given** confidence data, **When** score is 85-100%, **Then** the badge is Green; 70-84% is Amber; <70% is Red/Orange.

## Tasks / Subtasks

- [ ] Implement Result Card Components
  - [ ] Create `ResultCard.tsx`
  - [ ] Create `ConfidenceBadge.tsx` with color logic based on score
  - [ ] Style cards using Tailwind (shadow, border, rounded corners)
- [ ] Implement Progressive Rendering Logic
  - [ ] In `AnalysisResults.tsx`, map over the `results` array from store/state
  - [ ] Ensure new items append smoothly (maybe simple animation)
- [ ] Verify Data Mapping
  - [ ] Ensure API response fields (name, description, confidence, reasoning) map correctly to UI props

## Dev Notes

- **UX**: Use a "Skeleton" loader or spinner at the bottom while streaming is active to show more is coming.
- **Auto-scroll**: Consider auto-scrolling to the bottom as new cards arrive, or keep user position if they scrolled up.

### Project Structure Notes

- `src/components/Analysis/ResultCard.tsx`
- `src/components/Analysis/ConfidenceBadge.tsx`

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