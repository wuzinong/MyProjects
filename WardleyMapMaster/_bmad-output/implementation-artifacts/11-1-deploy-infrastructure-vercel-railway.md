# Story 11.1: Deploy Infrastructure (Vercel + Railway)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a DevOps Engineer,
I want to set up the CI/CD pipeline and hosting environments,
so that code is automatically deployed to staging/production on merge.

## Acceptance Criteria

1. **Given** a push to `main`, **When** GitHub Actions runs, **Then** the frontend is built and deployed to Vercel.
2. **Given** a push to `main`, **When** GitHub Actions runs, **Then** the backend Python Docker image is built and deployed to Railway/Render.
3. **Given** the deployment, **When** completed, **Then** the environment variables (API Keys, CORS origins) are correctly applied.

## Tasks / Subtasks

- [ ] Create Frontend Deployment Config
  - [ ] Add `vercel.json` (if needed, or rely on auto-detection)
  - [ ] Configure Build Command (`npm run build`) and Output Directory (`dist`)
- [ ] Create Backend Deployment Config
  - [ ] Create `Dockerfile` for FastAPI
  - [ ] Create `.dockerignore`
  - [ ] Add `render.yaml` or `railway.toml` (optional, or manual setup instructions)
- [ ] Create Github Actions Workflow
  - [ ] Create `.github/workflows/deploy.yml` (or separate `frontend.yml` / `backend.yml`)
  - [ ] Add steps for linting/testing before modify
  - [ ] **Note**: actual deployment usually requires Repo Secrets which the Agent can't set. The task here is to generate the configuration files.

## Dev Notes

- **Docker**: Python 3.11 slim image.
- **Vercel**: Standard Vite config works out of the box.
- **Secrets**: Document which secrets (`CLAUDE_API_KEY`, `RAILWAY_TOKEN`, `VERCEL_TOKEN`) need to be added to GitHub.

### Project Structure Notes

- `Dockerfile` (in backend root)
- `.github/workflows/ci-cd.yml`

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