# Story 3.1: Setup Backend Analysis Service (Technical)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want to configure the FastAPI backend with Claude API integration,
so that we can process map data securely.

## Acceptance Criteria

1. **Given** the backend repo, **When** initialized, **Then** it includes FastAPI, Uvicorn, and Pydantic.
2. **Given** the API configuration, **When** verified, **Then** it securely loads the CLAUDE_API_KEY from environment variables.
3. **Given** the `POST /analyze` endpoint, **When** called with test data, **Then** it accepts JSON payload (map + context) and returns a successful connection response.

## Tasks / Subtasks

- [ ] Initialize Backend Project
  - [ ] Create `backend` directory
  - [ ] Create virtual environment and `requirements.txt`
  - [ ] Install FastAPI, Uvicorn, Pydantic, python-dotenv
- [ ] Configure Environment
  - [ ] Implement `config.py` using `pydantic-settings` or `os.getenv`
  - [ ] Ensure `CLAUDE_API_KEY` is loaded from `.env`
- [ ] Implement Basic API Structure
  - [ ] Create `backend/app/main.py`
  - [ ] Create `backend/app/routers/analysis.py`
  - [ ] Define Pydantic models for Input (Map + Context) in `backend/app/models/analysis.py`
- [ ] Implement Analyze Endpoint Stub
  - [ ] Add `POST /api/analysis/analyze` endpoint
  - [ ] Accept JSON payload matching Pydantic model
  - [ ] Return dummy success response (200 OK)
- [ ] Verify Setup
  - [ ] Run server locally (`uvicorn`)
  - [ ] Test endpoint with `curl` or Postman equivalent

## Dev Notes

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Security**: Never commit `.env`. Add to `.gitignore`.
- **Structure**: Follow `architecture.md` backend structure.

### Project Structure Notes

- `backend/app/`
- `backend/app/main.py`
- `backend/app/routers/`
- `backend/app/models/`

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