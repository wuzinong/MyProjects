# Story 2.2: Select Analysis Pattern

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to browse and select an analysis pattern (Climate vs. Doctrine),
so that I can direct the AI to look for specific types of insights.

## Acceptance Criteria

1. **Given** the pattern selector UI, **When** viewed, **Then** "Climate" and "Doctrine" options are displayed as selectable cards with descriptions.
2. **Given** the pattern cards, **When** I hover/click for help, **Then** a tooltip explains "Climate: Market/Competitive Lens" and "Doctrine: Leadership/Governance Lens".
3. **Given** I select a pattern, **When** confirmed, **Then** the selection is stored in the analysis state (default is Climate).

## Tasks / Subtasks

- [ ] Implement Pattern Selector UI
  - [ ] Create `PatternSelector` component
  - [ ] Create `PatternCard` component with selection state styling
  - [ ] Display "Climate" and "Doctrine" options
- [ ] Implement Tooltips/Help
  - [ ] Add Help icon/tooltip to cards
  - [ ] Display explanation text on hover/click
- [ ] Connect to Store
  - [ ] Add `selectedPattern` field to `analysisStore` (enum: 'climate' | 'doctrine')
  - [ ] Update store on selection change

## Dev Notes

- **UI**: Radio-button behavior but visualized as cards.
- **Default**: Climate.
- **Extensibility**: Structure `patterns` as an array/config object to easily add more patterns later (e.g., in Phase 2).

### Project Structure Notes

- `src/components/PatternSelector/PatternSelector.tsx`
- `src/components/PatternSelector/PatternCard.tsx`
- `src/store/analysisStore.ts`

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