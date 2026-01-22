# Story 3.3: Execute Analysis with Streaming Response

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to trigger the analysis and receive results in real-time,
so that I don't have to wait 30 seconds staring at a blank screen.

## Acceptance Criteria

1. **Given** valid map (>3 shapes) and context (>50 chars), **When** I click "Analyze", **Then** the request is sent to the backend.
2. **Given** the backend processing, **When** AI generates tokens, **Then** they are streamed to the frontend via Server-Sent Events (SSE).
3. **Given** the UI, **When** analysis starts, **Then** the button changes to a spinner state.
4. **Given** an API failure or timeout (>60s), **When** it occurs, **Then** a user-friendly error message allows retrying.

## Tasks / Subtasks

- [ ] Implement Backend Streaming Logic
  - [ ] Update `analysis_service.py` to use `yield` or async generator for SSE
  - [ ] Implement `stream_claude` wrapper (mocked first, then real) to yield chunks
  - [ ] Update `routers/analysis.py` to return `StreamingResponse`
- [ ] Implement Frontend Analysis Integration
  - [ ] Update `analysisApi.ts` to handle SSE (`EventSource` or `fetch` with reader)
  - [ ] Connect "Analyze" button in UI to trigger API call
  - [ ] Implement spinner/loading state in `AnalysisResults` component
- [ ] Implement Real-Time Updates
  - [ ] Update `analysisStore` or local state as chunks arrive
  - [ ] Ensure UI renders progressively (Phase 1 -> Phase 2 -> etc.)
- [ ] Implement Error Handling
  - [ ] Handle connection errors
  - [ ] Handle timeouts (abort controller)
  - [ ] Display error toast/message

## Dev Notes

- **SSE vs WebSockets**: SSE is simpler and sufficient for one-way streaming of analysis results.
- **Mocking**: For dev without burning tokens, create a "Mock Mode" that streams dummy text with delays to test the UI flow.
- **State**: Ensure the frontend can handle partial JSON or line-delimited JSON chunks.

### Project Structure Notes

- `backend/app/services/claude_service.py` (streaming implementation).
- `src/api/analysisApi.ts`.
- `src/components/Analysis/AnalysisResults.tsx`.

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