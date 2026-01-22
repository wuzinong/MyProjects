# Story 11.2: Implement Security Headers and Rate Limiting

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Security Engineer,
I want to secure the API against abuse and common attacks,
so that the service remains stable and secure.

## Acceptance Criteria

1. **Given** the FastAPI app, **When** configured, **Then** standard security headers (HSTS, X-Content-Type-Options) are set.
2. **Given** the API, **When** a single IP exceeds 100 requests/day, **Then** it returns 429 Too Many Requests.
3. **Given** user input (Context/Chat), **When** received, **Then** it is sanitized to prevent prompt injection before being sent to the LLM.

## Tasks / Subtasks

- [ ] Implement Security Headers
  - [ ] Add `CORSMiddleware` with strict origin config (frontend URL)
  - [ ] Add custom middleware or use `secure` library to set `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`
- [ ] Implement Rate Limiting
  - [ ] Install `slowapi` or similar FastAPI rate limiter
  - [ ] Configure limit (e.g., "100/day") on `analyze` and `chat` endpoints
  - [ ] (Optional for MVP): Use in-memory fallback if Redis is not yet configured, or set up Redis connection if available
- [ ] Implement Input Sanitization
  - [ ] Create sanitization utility function
  - [ ] Apply to `strategicContext` and `chatMessage` inputs
  - [ ] Strip potential control characters or specific injection patterns

## Dev Notes

- **Rate Limiting**: `slowapi` is a good in-memory/Redis wrapper for FastAPI (based on `limits` library). For MVP deployment on Railway (likely 1 instance), in-memory is fine. If auto-scaling, Redis is needed. AC says "100 requests/day", so persistent storage (Redis) is preferred, but in-memory is acceptable for "stability" MVP.
- **Sanitization**: LLMs are susceptible to prompt injection. Basic measure: Delimiter approach (XML tags) in prompts, plus stripping similar delimiters from user input.

### Project Structure Notes

- `backend/app/middleware/security.py`
- `backend/app/middleware/rate_limit.py`
- `backend/app/utils/sanitization.py`

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