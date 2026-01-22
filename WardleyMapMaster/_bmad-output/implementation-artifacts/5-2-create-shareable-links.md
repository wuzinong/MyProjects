# Story 5.2: Create Shareable Links

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to generate a read-only link to my analysis,
so that I can share it with stakeholders who don't have an account.

## Acceptance Criteria

1. **Given** a completed analysis, **When** I click "Share", **Then** a unique URL token is generated (valid for 7 days).
2. **Given** a user with the share link, **When** they visit the URL, **Then** they see a read-only view of the Map and Analysis Results.
3. **Given** a shared view, **When** assessed, **Then** all editing tools are disabled/hidden.

## Tasks / Subtasks

- [ ] Implement Sharing Backend
  - [ ] Add `Share` model (id, analysis_snapshot, expires_at)
  - [ ] Create `POST /api/share` endpoint to save snapshot and return ID/token
  - [ ] Create `GET /api/share/{id}` endpoint to retrieve snapshot (if not expired)
- [ ] Implement Sharing UI
  - [ ] Add "Share" button to UI
  - [ ] Show modal with generated link and "Copy to Clipboard"
- [ ] Implement Shared View Mode
  - [ ] Create `SharedAnalysisPage` (or reuse main page with `readOnly` prop)
  - [ ] Ensure Canvas and Analysis components respect `readOnly` mode (disable edits/tools)
- [ ] Data Persistence (MVP)
  - [ ] For MVP without a DB, `Share` model might need to rely on a simple file-store or just encoded URL params (if size permits).
  - [ ] **Decision**: Store validation/expiry in simpler store or backend memory dict for demo, or `json` file. Let's assume simple file-based persistence for MVP sharing if DB is Phase 2.

## Dev Notes

- **URL State**: If the map/analysis data is small enough, base64 encoding it into the URL is the simplest "serverless" sharing method. However, for "valid 7 days" and larger maps, server-side storage is better.
- **MVP Compromise**: If no DB is available yet, file-system storage (json files) in `backend/data/shares/` is a valid MVP approach.

### Project Structure Notes

- `backend/app/routers/share.py`
- `src/pages/SharedAnalysis.tsx`

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