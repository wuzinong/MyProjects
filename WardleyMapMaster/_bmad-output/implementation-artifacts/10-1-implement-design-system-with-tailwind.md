# Story 10.1: Implement Design System with Tailwind

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want to setup the color palette, typography and component boundaries,
so that the UI is consistent and accessible.

## Acceptance Criteria

1. **Given** the Tailwind config, **When** inspected, **Then** it includes the specific Slate/Amber color palette defined in UX Design.
2. **Given** text elements, **When** checked, **Then** they meet WCAG AA contrast ratios.
3. **Given** shared components (Cards, Buttons, Inputs), **When** built, **Then** they use a consistent rounded corner radius, shadow depth, and 8px grid spacing.

## Tasks / Subtasks

- [ ] Configure Tailwind Theme
  - [ ] Update `tailwind.config.js` with custom colors (Slate, Amber, brand Blue)
  - [ ] Define font stack (System fonts)
  - [ ] Define spacing scale (if deviating from default, but default 4=1rem is good)
- [ ] Create Core UI Components
  - [ ] `Button.tsx` (Primary, Secondary, Ghost variants)
  - [ ] `Card.tsx` (Standard padding, shadow, border)
  - [ ] `Input.tsx` / `TextArea.tsx`
  - [ ] `Badge.tsx` (for Confidence scores)
- [ ] Implement Base Layout
  - [ ] `MainLayout.tsx` (Header, Sidebar/Toolbar area, Content)
  - [ ] Ensure responsive container behavior (though desktop-first)

## Dev Notes

- **Architecture**: Atomic design-ish. `Common` components folder.
- **Accessibility**: Use `eslint-plugin-jsx-a11y` to catch issues early. Interactive elements min 44px.

### Project Structure Notes

- `src/components/Common/Button.tsx`
- `src/components/Common/Card.tsx`
- `src/components/Layout/MainLayout.tsx`
- `tailwind.config.js`

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