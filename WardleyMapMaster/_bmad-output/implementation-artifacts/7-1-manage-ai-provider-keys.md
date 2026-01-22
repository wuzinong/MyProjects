# Story 7.1: Manage AI Provider Keys

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to enter my own API keys for Claude, Gemini, or Doubao,
so that I can control which provider is used and manage my own billing.

## Acceptance Criteria

1. **Given** the Settings page, **When** I select a provider, **Then** I can input an API Key.
2. **Given** a key input, **When** saved, **Then** it is encrypted (AES-256) and stored in localStorage.
3. **Given** a saved key, **When** I run an analysis, **Then** that key is sent in the header to be used for the inference call.

## Tasks / Subtasks

- [ ] Implement Settings Page UI
  - [ ] Create `Settings.tsx` page
  - [ ] Add Provider Selection (Dropdown/Tabs)
  - [ ] Add Input field for API Key (Password type)
- [ ] Implement Key Management Logic
  - [ ] Implement client-side encryption helper (`utils/security.ts`) using simple crypto-js or Web Crypto API (for MVP, simple obfuscation or raw storage if https/localhost is acceptable, but AC says AES-256).
  - [ ] Store encrypted keys in `localStorage`
- [ ] Update API Client
  - [ ] Modify `analysisApi.ts` to retrieve key from storage
  - [ ] Decrypt key (if needed) or pass encrypted to backend? Note: If backend needs to call AI, backend needs the RAW key.
  - [ ] **Correction**: It's safer to send the key via Header `X-AI-Key` on every request if we don't store it on backend. The frontend stores it.
  - [ ] Ensure `analysis` endpoint reads `X-AI-Key` header and uses it for the Claude client instantiation.

## Dev Notes

- **Security**: Never store user API keys in the backend database. They should be "Bring Your Own Key" (BYOK) model, passed per request from frontend storage.
- **Library**: `AES-256` in browser can be done via `SubtleCrypto` or `crypto-js`.

### Project Structure Notes

- `src/pages/Settings.tsx`
- `src/utils/keyManager.ts`

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