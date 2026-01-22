# Story 1.1: Frontend Project Initialization (Technical)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want to initialize the React project with TypeScript, Tailwind, and SVG.js,
so that we have a stable foundation for building the canvas features.

## Acceptance Criteria

1. **Given** a clean repository, **When** the project is initialized, **Then** the directory structure matches the architecture document (src/components/Canvas, src/store, etc.).
2. **Given** the build configuration, **When** `npm run dev` is executed, **Then** the application loads without errors.
3. **Given** dependencies, **When** inspected, **Then** React 18+, TypeScript, Tailwind CSS, SVG.js, Visx, and Zustand are installed.
4. **Given** state management, **When** tested, **Then** a basic Zustand store is configured and persistent in localStorage.

## Tasks / Subtasks

- [ ] Initialize React Project
  - [ ] Initialize Vite project with React and TypeScript template
  - [ ] Configure `package.json` basics
- [ ] Install Dependencies
  - [ ] Install Tailwind CSS, PostCSS, Autoprefixer and configure `tailwind.config.js` and `postcss.config.js`
  - [ ] Install SVG.js (`@svgdotjs/svg.js`)
  - [ ] Install Visx (`@visx/visx`)
  - [ ] Install Zustand (`zustand`)
- [ ] Create Directory Structure
  - [ ] Create `src/components/Canvas`
  - [ ] Create `src/components/Analysis`
  - [ ] Create `src/components/PatternSelector`
  - [ ] Create `src/components/Chatbot`
  - [ ] Create `src/components/Common`
  - [ ] Create `src/components/Layout`
  - [ ] Create `src/pages`
  - [ ] Create `src/api`
  - [ ] Create `src/types`
  - [ ] Create `src/utils`
  - [ ] Create `src/hooks`
  - [ ] Create `src/store`
- [ ] Implement Basic Store
  - [ ] Create `src/store/canvasStore.ts` with basic Zustand setup
  - [ ] Add simple shape adding action for verification
  - [ ] Ensure persistence middleware is used (if applicable/planned) or mock persistence for now as per AC
- [ ] Verify Build and Run
  - [ ] Run `npm install`
  - [ ] Run `npm run dev` and check for errors
  - [ ] Verify application loads in browser (manual check or test)

## Dev Notes

- **Architecture Patterns**:
  - React 18+ Functional Components
  - Zustand for Global State
  - Tailwind for styling
  - Visx/SVG.js for Canvas
- **Source Tree**: `src/` root.
- **Testing**: Vitest + React Testing Library (Install as dev dependencies if not already in standard Vite template, but AC doesn't explicitly mention setting up test runner, just "When tested" implying manual or basic check. I should probably add Vitest setup to be safe/proactive).
- **Structure**:
  ```text
  src/
  ├── components/
  │   ├── Canvas/
  │   ├── Analysis/
  │   ├── PatternSelector/
  │   ├── Chatbot/
  │   ├── Common/
  │   └── Layout/
  ├── pages/
  ├── api/
  ├── types/
  ├── utils/
  ├── hooks/
  └── store/
  ```

### Project Structure Notes

- Follows Standard Vite + React + TS structure.
- Directories align with `architecture.md`.

### References

- [Architecture Document](_bmad-output/planning-artifacts/architecture-WardleyMapMaster-2026-01-21.md)

## Dev Agent Record

### Agent Model Used

Gemini 3 Pro (Preview)

### Debug Log References

### Completion Notes List

### File List

```,filePath: