# Story 5.1: Generate Downloadable Artifacts

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to export my analysis as a Code Scaffold, PlantUML, and Markdown report,
so that I can use the architecture in my development workflow.

## Acceptance Criteria

1. **Given** a completed analysis, **When** I click "Export", **Then** a menu offers: "Code Scaffold (.zip)", "C4 PlantUML", "DDD Map", "Report (.md)".
2. **Given** "Code Scaffold" selection, **When** processed, **Then** the backend generates a ZIP file with the folder structure matching the Bounded Contexts.
3. **Given** "Report" selection, **When** processed, **Then** a markdown file including the Context, Map Image, and Analysis Results is downloaded.

## Tasks / Subtasks

- [ ] Implement Export Menu UI
  - [ ] Add "Export" button to Analysis Results header
  - [ ] Implement dropdown/modal for format selection
- [ ] Implement Backend Export Logic
  - [ ] Create `services/export_service.py`
  - [ ] Implement generators for:
    - [ ] Markdown Report (basic string template)
    - [ ] C4 PlantUML (string generation)
    - [ ] Code Scaffold (zip file creation with `zipfile` module)
- [ ] Connect Frontend to Backend
  - [ ] Add download actions to `analysisApi.ts` (handling Blob responses)
  - [ ] Trigger download on UI selection

## Dev Notes

- **ZIP Generation**: Python's `zipfile` module is standard and sufficient. Create an in-memory buffer (`io.BytesIO`) to avoid writing temp files to disk.
- **Frontend**: Use `URL.createObjectURL(blob)` and a hidden `<a>` tag trigger for file downloads.

### Project Structure Notes

- `backend/app/services/export_service.py`
- `src/components/Analysis/ExportMenu.tsx`

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